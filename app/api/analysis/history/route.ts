import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const TOKEN_URL =
  "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";

const STATS_URL =
  "https://sh.dataspace.copernicus.eu/statistics/v1";

function getDateDaysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString();
}

type HistoryItem = {
  from: string;
  to: string;
  ndvi: number;
};

export async function GET(request: Request) {
  try {
    // --------------------------------------------------
    // 1. ENV
    // --------------------------------------------------

    const clientId = process.env.SENTINEL_CLIENT_ID;
    const clientSecret = process.env.SENTINEL_CLIENT_SECRET;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          error:
            "Chybí SENTINEL_CLIENT_ID nebo SENTINEL_CLIENT_SECRET",
        },
        { status: 500 }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          error:
            "Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY",
        },
        { status: 500 }
      );
    }

    // Server-side Supabase klient.
    // SERVICE ROLE KEY nikdy neposílat do frontendu.
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    // --------------------------------------------------
    // 2. PARAMETRY
    // --------------------------------------------------

    const { searchParams } = new URL(request.url);

    const latitude = Number(
      searchParams.get("latitude")
    );

    const longitude = Number(
      searchParams.get("longitude")
    );

    const projectId = Number(
      searchParams.get("projectId")
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return NextResponse.json(
        {
          error: "Neplatná latitude nebo longitude",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(projectId)) {
      return NextResponse.json(
        {
          error: "Chybí platné projectId",
        },
        { status: 400 }
      );
    }

    console.log("======================================");
    console.log("HISTORICKÁ ANALÝZA");
    console.log("Project ID:", projectId);
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
    console.log("======================================");

    // --------------------------------------------------
    // 3. OAUTH TOKEN
    // --------------------------------------------------

    const tokenResponse = await fetch(TOKEN_URL, {
      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },

      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();

      console.error("OAUTH CHYBA:", text);

      return NextResponse.json(
        {
          error: "OAuth selhal",
          details: text,
        },
        { status: 500 }
      );
    }

    const token = await tokenResponse.json();

    const accessToken = token.access_token;

    // --------------------------------------------------
    // 4. ČASOVÉ OBDOBÍ
    // --------------------------------------------------

    const from = getDateDaysAgo(180);
    const to = new Date().toISOString();

    // --------------------------------------------------
    // 5. OBLAST KOLEM BODU
    // --------------------------------------------------

    const bbox = [
      longitude - 0.001,
      latitude - 0.001,
      longitude + 0.001,
      latitude + 0.001,
    ];

    // --------------------------------------------------
    // 6. EVALSCRIPT NDVI
    // --------------------------------------------------

    const evalscript = `
//VERSION=3

function setup() {
  return {
    input: [
      {
        bands: ["B04", "B08", "dataMask"]
      }
    ],

    output: [
      {
        id: "ndvi",
        bands: 1,
        sampleType: "FLOAT32"
      },
      {
        id: "dataMask",
        bands: 1
      }
    ]
  };
}

function evaluatePixel(samples) {
  const b04 = samples.B04;
  const b08 = samples.B08;

  const denominator = b08 + b04;

  if (denominator === 0) {
    return {
      ndvi: [0],
      dataMask: [0]
    };
  }

  const ndvi = (b08 - b04) / denominator;

  return {
    ndvi: [ndvi],
    dataMask: [samples.dataMask]
  };
}
`;

    // --------------------------------------------------
    // 7. STATISTICS REQUEST
    // --------------------------------------------------

    const statsRequest = {
      input: {
        bounds: {
          bbox,

          properties: {
            crs:
              "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
          },
        },

        data: [
          {
            type: "sentinel-2-l2a",

            dataFilter: {
              mosaickingOrder: "leastCC",
              maxCloudCoverage: 30,
            },
          },
        ],
      },

      aggregation: {
        timeRange: {
          from,
          to,
        },

        aggregationInterval: {
          of: "P10D",
        },

        evalscript,

        resx: 10,
        resy: 10,
      },

      calculations: {
        default: {
          statistics: {
            default: {},
          },
        },
      },
    };

    console.log(
      "STATISTICS REQUEST ODESÍLÁM"
    );

    // --------------------------------------------------
    // 8. COPERNICUS
    // --------------------------------------------------

    const response = await fetch(STATS_URL, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify(statsRequest),
    });

    const responseText = await response.text();

    console.log(
      "STATISTICS STATUS:",
      response.status
    );

    if (!response.ok) {
      console.error(
        "STATISTICS RESPONSE:",
        responseText
      );

      return NextResponse.json(
        {
          error: "Statistics API chyba",
          status: response.status,
          response: responseText,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 9. JSON
    // --------------------------------------------------

    let json: any;

    try {
      json = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          error:
            "Copernicus vrátil neplatný JSON",
          response: responseText,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 10. NDVI HISTORIE
    // --------------------------------------------------

    const history: HistoryItem[] = (json.data ?? [])
      .map((item: any): HistoryItem | null => {
        const mean =
          item?.outputs?.ndvi?.bands?.B0?.stats?.mean;

        if (
          mean == null ||
          !Number.isFinite(Number(mean))
        ) {
          return null;
        }

        if (
          !item?.interval?.from ||
          !item?.interval?.to
        ) {
          return null;
        }

        return {
          from: item.interval.from,
          to: item.interval.to,
          ndvi: Number(mean),
        };
      })
      .filter(
        (item: HistoryItem | null): item is HistoryItem =>
          item !== null
      );

    // Seřadíme chronologicky od nejstaršího
    // po nejnovější.
    history.sort(
      (a, b) =>
        new Date(a.from).getTime() -
        new Date(b.from).getTime()
    );

    console.log(
      "NALEZENO NDVI INTERVALŮ:",
      history.length
    );

    console.log(
      "NDVI HISTORIE:",
      history
    );

    // --------------------------------------------------
    // 11. SMAZÁNÍ STARÉ HISTORIE PROJEKTU
    // --------------------------------------------------

    const { error: deleteError } =
      await supabase
        .from("ndvi_history")
        .delete()
        .eq("project_id", projectId);

    if (deleteError) {
      console.error(
        "CHYBA PŘI MAZÁNÍ STARÉ HISTORIE:",
        deleteError
      );

      return NextResponse.json(
        {
          error:
            "Nepodařilo se smazat starou NDVI historii",
          details: deleteError.message,
        },
        { status: 500 }
      );
    }

    console.log(
      "STARÁ HISTORIE SMAZÁNA"
    );

    // --------------------------------------------------
    // 12. ULOŽENÍ NOVÉ HISTORIE
    // --------------------------------------------------

    if (history.length > 0) {
      const rows = history.map(
        (item) => ({
          project_id: projectId,
          period_from: item.from,
          period_to: item.to,
          ndvi: item.ndvi,
        })
      );

      const { error: insertError } =
        await supabase
          .from("ndvi_history")
          .insert(rows);

      if (insertError) {
        console.error(
          "CHYBA PŘI UKLÁDÁNÍ NDVI HISTORIE:",
          insertError
        );

        return NextResponse.json(
          {
            error:
              "Nepodařilo se uložit NDVI historii",
            details: insertError.message,
          },
          { status: 500 }
        );
      }

      console.log(
        "NDVI HISTORIE ULOŽENA:",
        rows.length,
        "záznamů"
      );
    }

    // --------------------------------------------------
    // 13. ANALYTIKA TRENDU
    // --------------------------------------------------

    const firstHistoryItem =
      history.length > 0
        ? history[0]
        : null;

    const lastHistoryItem =
      history.length > 0
        ? history[history.length - 1]
        : null;

    const startNdvi =
      firstHistoryItem?.ndvi ?? null;

    const currentNdvi =
      lastHistoryItem?.ndvi ?? null;

    let change: number | null = null;

    if (
      startNdvi !== null &&
      currentNdvi !== null
    ) {
      change =
        currentNdvi - startNdvi;
    }

    // --------------------------------------------------
    // 14. URČENÍ TRENDU
    // --------------------------------------------------

    let trend = "Stabilní";

    if (change !== null) {
      if (change > 0.05) {
        trend = "Zlepšující se";
      } else if (change < -0.05) {
        trend = "Zhoršující se";
      }
    }

    // --------------------------------------------------
    // 15. URČENÍ RIZIKA
    // --------------------------------------------------

    let risk = "Nízké";

    if (currentNdvi === null) {
      risk = "Neznámé";
    } else if (currentNdvi < 0.20) {
      risk = "Kritické";
    } else if (currentNdvi < 0.40) {
      risk = "Vysoké";
    } else if (currentNdvi < 0.60) {
      risk = "Střední";
    } else {
      risk = "Nízké";
    }

    // --------------------------------------------------
    // 16. PROCENTUÁLNÍ ZMĚNA
    // --------------------------------------------------

    let changePercent: number | null = null;

    if (
      startNdvi !== null &&
      currentNdvi !== null &&
      startNdvi !== 0
    ) {
      changePercent =
        ((currentNdvi - startNdvi) /
          Math.abs(startNdvi)) *
        100;
    }

    // --------------------------------------------------
    // 17. LOG ANALYTIKY
    // --------------------------------------------------

    console.log(
      "======================================"
    );

    console.log(
      "ANALYTICKÝ VÝSLEDEK:"
    );

    console.log(
      "Start NDVI:",
      startNdvi
    );

    console.log(
      "Current NDVI:",
      currentNdvi
    );

    console.log(
      "Změna:",
      change
    );

    console.log(
      "Změna %:",
      changePercent
    );

    console.log(
      "Trend:",
      trend
    );

    console.log(
      "Riziko:",
      risk
    );

    console.log(
      "======================================"
    );

    // --------------------------------------------------
    // 18. ODPOVĚĎ FRONTENDU
    // --------------------------------------------------

    return NextResponse.json({
      latitude,
      longitude,
      projectId,

      from,
      to,

      count: history.length,

      // Historie
      history,

      // Aktuální historické NDVI
      ndvi: currentNdvi,
      currentNdvi,

      // První dostupné NDVI
      startNdvi,

      // Absolutní změna
      change,

      // Procentuální změna
      changePercent,

      // Slovní trend
      trend,

      // Riziko podle aktuálního NDVI
      risk,
    });

  } catch (error) {
    console.error(
      "HISTORICKÁ ANALÝZA CHYBA:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Neočekávaná chyba serveru",

        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}