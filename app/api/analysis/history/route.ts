import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const TOKEN_URL =
  "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";

const STATS_URL =
  "https://sh.dataspace.copernicus.eu/statistics/v1";

type HistoryItem = {
  from: string;
  to: string;
  ndvi: number;
};

type CopernicusStatisticsItem = {
  interval?: {
    from?: string;
    to?: string;
  };
  outputs?: {
    ndvi?: {
      bands?: {
        B0?: {
          stats?: {
            mean?: number;
          };
        };
      };
    };
  };
};

type CopernicusStatisticsResponse = {
  data?: CopernicusStatisticsItem[];
};

function getDateDaysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(
    date.getUTCDate() - days
  );

  return date.toISOString();
}

function isCopernicusStatisticsResponse(
  value: unknown
): value is CopernicusStatisticsResponse {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return false;
  }

  const candidate =
    value as Record<string, unknown>;

  if (
    candidate.data !== undefined &&
    !Array.isArray(candidate.data)
  ) {
    return false;
  }

  return true;
}

function extractNdvi(
  item: CopernicusStatisticsItem
): number | null {
  const mean =
    item.outputs
      ?.ndvi
      ?.bands
      ?.B0
      ?.stats
      ?.mean;

  if (
    mean == null ||
    !Number.isFinite(Number(mean))
  ) {
    return null;
  }

  return Number(mean);
}

export async function GET(
  request: Request
) {
  try {
    // --------------------------------------------------
    // 1. ENV
    // --------------------------------------------------

    const clientId =
      process.env.SENTINEL_CLIENT_ID;

    const clientSecret =
      process.env.SENTINEL_CLIENT_SECRET;

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    const supabasePublishableKey =
      process.env
        .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (
      !clientId ||
      !clientSecret
    ) {
      return NextResponse.json(
        {
          error:
            "Chybí SENTINEL_CLIENT_ID nebo SENTINEL_CLIENT_SECRET",
        },
        { status: 500 }
      );
    }

    if (
      !supabaseUrl ||
      !supabaseServiceKey
    ) {
      return NextResponse.json(
        {
          error:
            "Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY",
        },
        { status: 500 }
      );
    }

    if (!supabasePublishableKey) {
      return NextResponse.json(
        {
          error:
            "Chybí NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 2. PŘIHLÁŠENÝ UŽIVATEL
    // --------------------------------------------------

    const cookieStore =
      await cookies();

    const authSupabase =
      createServerClient(
        supabaseUrl,
        supabasePublishableKey,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },

            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(
                  ({
                    name,
                    value,
                    options,
                  }) => {
                    cookieStore.set(
                      name,
                      value,
                      options
                    );
                  }
                );
              } catch {
                // Cookie update není v tomto místě
                // kritický pro načtení uživatele.
              }
            },
          },
        }
      );

    const {
      data: { user },
      error: userError,
    } =
      await authSupabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            "Uživatel není přihlášen.",
        },
        { status: 401 }
      );
    }

    // Server-side klient pro DB operace.
    // SERVICE ROLE KEY nikdy neposílat do frontendu.
    const supabase =
      createClient(
        supabaseUrl,
        supabaseServiceKey
      );

    // --------------------------------------------------
    // 3. PARAMETRY
    // --------------------------------------------------

    const { searchParams } =
      new URL(request.url);

    const latitude =
      Number(
        searchParams.get(
          "latitude"
        )
      );

    const longitude =
      Number(
        searchParams.get(
          "longitude"
        )
      );

    const projectId =
      Number(
        searchParams.get(
          "projectId"
        )
      );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return NextResponse.json(
        {
          error:
            "Neplatná latitude nebo longitude",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(projectId)
    ) {
      return NextResponse.json(
        {
          error:
            "Chybí platné projectId",
        },
        { status: 400 }
      );
    }

    console.log(
      "======================================"
    );

    console.log(
      "HISTORICKÁ ANALÝZA"
    );

    console.log(
      "Project ID:",
      projectId
    );

    console.log(
      "Latitude:",
      latitude
    );

    console.log(
      "Longitude:",
      longitude
    );

    console.log(
      "User ID:",
      user.id
    );

    console.log(
      "======================================"
    );

    // --------------------------------------------------
    // 4. OVĚŘENÍ VLASTNICTVÍ PROJEKTU
    // --------------------------------------------------

    const {
      data: project,
      error: projectError,
    } =
      await supabase
        .from("projects")
        .select(
          "id, user_id"
        )
        .eq(
          "id",
          projectId
        )
        .eq(
          "user_id",
          user.id
        )
        .single();

    if (
      projectError ||
      !project
    ) {
      console.error(
        "CHYBA OVĚŘENÍ PROJEKTU:",
        projectError
      );

      return NextResponse.json(
        {
          error:
            "Projekt nebyl nalezen nebo k němu nemáš přístup.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 5. OAUTH TOKEN
    // --------------------------------------------------

    const tokenResponse =
      await fetch(
        TOKEN_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body:
            new URLSearchParams({
              grant_type:
                "client_credentials",

              client_id:
                clientId,

              client_secret:
                clientSecret,
            }),
        }
      );

    if (
      !tokenResponse.ok
    ) {
      const text =
        await tokenResponse.text();

      console.error(
        "OAUTH CHYBA:",
        text
      );

      return NextResponse.json(
        {
          error:
            "OAuth selhal",

          details:
            text,
        },
        { status: 500 }
      );
    }

    const token =
      (await tokenResponse.json()) as {
        access_token?: string;
      };

    const accessToken =
      token.access_token;

    if (!accessToken) {
      return NextResponse.json(
        {
          error:
            "OAuth odpověď neobsahuje access_token.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 6. ČASOVÉ OBDOBÍ
    // --------------------------------------------------

    const from =
      getDateDaysAgo(180);

    const to =
      new Date().toISOString();

    // --------------------------------------------------
    // 7. OBLAST KOLEM BODU
    // --------------------------------------------------

    const bbox = [
      longitude - 0.001,
      latitude - 0.001,
      longitude + 0.001,
      latitude + 0.001,
    ];

    // --------------------------------------------------
    // 8. EVALSCRIPT NDVI
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
    // 9. STATISTICS REQUEST
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
            type:
              "sentinel-2-l2a",

            dataFilter: {
              mosaickingOrder:
                "leastCC",

              maxCloudCoverage:
                30,
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
    // 10. COPERNICUS
    // --------------------------------------------------

    const response =
      await fetch(
        STATS_URL,
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${accessToken}`,

            "Content-Type":
              "application/json",

            Accept:
              "application/json",
          },

          body:
            JSON.stringify(
              statsRequest
            ),
        }
      );

    const responseText =
      await response.text();

    console.log(
      "STATISTICS STATUS:",
      response.status
    );

    if (
      !response.ok
    ) {
      console.error(
        "STATISTICS RESPONSE:",
        responseText
      );

      return NextResponse.json(
        {
          error:
            "Statistics API chyba",

          status:
            response.status,

          response:
            responseText,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 11. JSON
    // --------------------------------------------------

    let json: unknown;

    try {
      json =
        JSON.parse(
          responseText
        );
    } catch {
      return NextResponse.json(
        {
          error:
            "Copernicus vrátil neplatný JSON",

          response:
            responseText,
        },
        { status: 500 }
      );
    }

    if (
      !isCopernicusStatisticsResponse(
        json
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Copernicus vrátil neočekávanou strukturu JSON.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 12. NDVI HISTORIE
    // --------------------------------------------------

    const history: HistoryItem[] =
      (json.data ?? [])
        .map(
          (
            item
          ): HistoryItem | null => {
            const mean =
              extractNdvi(item);

            if (
              mean === null
            ) {
              return null;
            }

            if (
              !item.interval?.from ||
              !item.interval.to
            ) {
              return null;
            }

            return {
              from:
                item.interval.from,

              to:
                item.interval.to,

              ndvi:
                mean,
            };
          }
        )
        .filter(
          (
            item
          ): item is HistoryItem =>
            item !== null
        );

    history.sort(
      (a, b) =>
        new Date(
          a.from
        ).getTime() -
        new Date(
          b.from
        ).getTime()
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
    // 13. SMAZÁNÍ STARÉ HISTORIE PROJEKTU
    // --------------------------------------------------

    const {
      error: deleteError,
    } = await supabase
      .from("ndvi_history")
      .delete()
      .eq(
        "project_id",
        projectId
      );

    if (
      deleteError
    ) {
      console.error(
        "CHYBA PŘI MAZÁNÍ STARÉ HISTORIE:",
        deleteError
      );

      return NextResponse.json(
        {
          error:
            "Nepodařilo se smazat starou NDVI historii",

          details:
            deleteError.message,
        },
        { status: 500 }
      );
    }

    console.log(
      "STARÁ HISTORIE SMAZÁNA"
    );

    // --------------------------------------------------
    // 14. ULOŽENÍ NOVÉ HISTORIE
    // --------------------------------------------------

    if (
      history.length > 0
    ) {
      const rows =
        history.map(
          (item) => ({
            project_id:
              projectId,

            period_from:
              item.from,

            period_to:
              item.to,

            ndvi:
              item.ndvi,
          })
        );

      const {
        error: insertError,
      } = await supabase
        .from("ndvi_history")
        .insert(rows);

      if (
        insertError
      ) {
        console.error(
          "CHYBA PŘI UKLÁDÁNÍ NDVI HISTORIE:",
          insertError
        );

        return NextResponse.json(
          {
            error:
              "Nepodařilo se uložit NDVI historii",

            details:
              insertError.message,
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
    // 15. ANALYTIKA TRENDU
    // --------------------------------------------------

    const firstHistoryItem =
      history.length > 0
        ? history[0]
        : null;

    const lastHistoryItem =
      history.length > 0
        ? history[
            history.length - 1
          ]
        : null;

    const startNdvi =
      firstHistoryItem?.ndvi ??
      null;

    const currentNdvi =
      lastHistoryItem?.ndvi ??
      null;

    let change:
      | number
      | null = null;

    if (
      startNdvi !== null &&
      currentNdvi !== null
    ) {
      change =
        currentNdvi -
        startNdvi;
    }

    // --------------------------------------------------
    // 16. URČENÍ TRENDU
    // --------------------------------------------------

    let trend =
      "Stabilní";

    if (
      change !== null
    ) {
      if (
        change > 0.05
      ) {
        trend =
          "Zlepšující se";
      } else if (
        change < -0.05
      ) {
        trend =
          "Zhoršující se";
      }
    }

    // --------------------------------------------------
    // 17. URČENÍ RIZIKA
    // --------------------------------------------------

    let risk =
      "Nízké";

    if (
      currentNdvi === null
    ) {
      risk =
        "Neznámé";
    } else if (
      currentNdvi < 0.20
    ) {
      risk =
        "Kritické";
    } else if (
      currentNdvi < 0.40
    ) {
      risk =
        "Vysoké";
    } else if (
      currentNdvi < 0.60
    ) {
      risk =
        "Střední";
    } else {
      risk =
        "Nízké";
    }

    // --------------------------------------------------
    // 18. PROCENTUÁLNÍ ZMĚNA
    // --------------------------------------------------

    let changePercent:
      | number
      | null = null;

    if (
      startNdvi !== null &&
      currentNdvi !== null &&
      startNdvi !== 0
    ) {
      changePercent =
        ((currentNdvi -
          startNdvi) /
          Math.abs(
            startNdvi
          )) *
        100;
    }

    // --------------------------------------------------
    // 19. LOG ANALYTIKY
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
    // 20. ODPOVĚĎ FRONTENDU
    // --------------------------------------------------

    return NextResponse.json({
      latitude,
      longitude,
      projectId,

      from,
      to,

      count:
        history.length,

      history,

      ndvi:
        currentNdvi,

      currentNdvi,

      startNdvi,

      change,

      changePercent,

      trend,

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