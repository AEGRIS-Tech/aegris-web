import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const TOKEN_URL =
  "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";

const STATS_URL =
  "https://sh.dataspace.copernicus.eu/statistics/v1";

type BoundaryPoint = {
  latitude: number;
  longitude: number;
};

type GeoJSONPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

type CopernicusStatisticsItem = {
  interval?: {
    from?: string;
    to?: string;
  };
  outputs?: {
    default?: {
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

type NdviHistoryItem = {
  from: string;
  to: string;
  ndvi: number;
};

function isValidBoundary(
  boundary: unknown
): boundary is BoundaryPoint[] {
  if (!Array.isArray(boundary)) {
    return false;
  }

  if (boundary.length < 3) {
    return false;
  }

  return boundary.every((point) => {
    if (
      point === null ||
      typeof point !== "object"
    ) {
      return false;
    }

    const candidate =
      point as Record<string, unknown>;

    const latitude =
      candidate.latitude;

    const longitude =
      candidate.longitude;

    return (
      typeof latitude === "number" &&
      typeof longitude === "number" &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  });
}

function boundaryToGeoJSON(
  boundary: BoundaryPoint[]
): GeoJSONPolygon {
  const coordinates = boundary.map(
    (point) => [
      point.longitude,
      point.latitude,
    ]
  );

  coordinates.push([
    boundary[0].longitude,
    boundary[0].latitude,
  ]);

  return {
    type: "Polygon",
    coordinates: [coordinates],
  };
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
  const ndvi =
    item.outputs?.default?.bands?.B0?.stats?.mean;

  return typeof ndvi === "number" &&
    Number.isFinite(ndvi)
    ? ndvi
    : null;
}

export async function GET(
  request: Request
) {
  try {
    // --------------------------------------------------
    // 1. SUPABASE / PŘIHLÁŠENÝ UŽIVATEL
    // --------------------------------------------------

    const cookieStore =
      await cookies();

    const supabase =
      createServerClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,
        process.env
          .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
                // kritický pro samotné načtení uživatele.
              }
            },
          },
        }
      );

    const {
      data: { user },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "Uživatel není přihlášen.",
        },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 2. PARAMETRY
    // --------------------------------------------------

    const { searchParams } =
      new URL(request.url);

    const projectIdParam =
      searchParams.get(
        "projectId"
      );

    const latitudeParam =
      searchParams.get(
        "latitude"
      );

    const longitudeParam =
      searchParams.get(
        "longitude"
      );

    const projectId =
      projectIdParam
        ? Number(projectIdParam)
        : null;

    // --------------------------------------------------
    // 3. PROJEKT
    // --------------------------------------------------

    let latitude: number | null =
      null;

    let longitude: number | null =
      null;

    let boundary:
      | BoundaryPoint[]
      | null = null;

    if (
      projectId !== null &&
      Number.isFinite(projectId)
    ) {
      const {
        data: project,
        error: projectError,
      } = await supabase
        .from("projects")
        .select(
          "id, latitude, longitude, boundary, user_id"
        )
        .eq("id", projectId)
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
          "CHYBA NAČTENÍ PROJEKTU:",
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

      latitude =
        typeof project.latitude ===
        "number"
          ? project.latitude
          : Number(
              project.latitude
            );

      longitude =
        typeof project.longitude ===
        "number"
          ? project.longitude
          : Number(
              project.longitude
            );

      if (
        isValidBoundary(
          project.boundary
        )
      ) {
        boundary =
          project.boundary;
      }
    }

    // --------------------------------------------------
    // 4. ZÁLOŽNÍ REŽIM
    // --------------------------------------------------

    if (
      latitude === null ||
      !Number.isFinite(latitude)
    ) {
      latitude =
        latitudeParam !== null
          ? Number(latitudeParam)
          : null;
    }

    if (
      longitude === null ||
      !Number.isFinite(longitude)
    ) {
      longitude =
        longitudeParam !== null
          ? Number(longitudeParam)
          : null;
    }

    if (
      latitude === null ||
      longitude === null ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return NextResponse.json(
        {
          error:
            "Chybí platné souřadnice nebo projectId.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 5. OAUTH COPERNICUS
    // --------------------------------------------------

    const clientId =
      process.env
        .SENTINEL_CLIENT_ID;

    const clientSecret =
      process.env
        .SENTINEL_CLIENT_SECRET;

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

    const tokenResponse =
      await fetch(
        TOKEN_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body: new URLSearchParams({
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
      const errorText =
        await tokenResponse.text();

      console.error(
        "OAUTH ERROR:",
        errorText
      );

      return NextResponse.json(
        {
          error:
            "OAuth selhal",
          details:
            errorText,
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
         id: "default",
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

   let ndvi = 0;

   if (denominator !== 0) {
     ndvi =
       (b08 - b04) /
       denominator;
   }

   return {
     default: [ndvi],
     dataMask: [samples.dataMask]
   };
 }
 `;

    // --------------------------------------------------
    // 7. OBDOBÍ - POSLEDNÍCH 6 MĚSÍCŮ
    // --------------------------------------------------

    const to = new Date();

    const from =
      new Date(to);

    from.setUTCMonth(
      from.getUTCMonth() - 6
    );

    // --------------------------------------------------
    // 8. GEOMETRIE PRO COPERNICUS
    // --------------------------------------------------

    let bounds:
      | Record<string, unknown>;

    if (boundary) {
      const polygon =
        boundaryToGeoJSON(
          boundary
        );

      bounds = {
        geometry: polygon,
      };

      console.log(
        "AEGRIS ANALYSIS: POUŽÍVÁM HRANICI POZEMKU"
      );

      console.log(
        "AEGRIS BOUNDARY:",
        JSON.stringify(
          polygon,
          null,
          2
        )
      );
    } else {
      bounds = {
        bbox: [
          longitude - 0.001,
          latitude - 0.001,
          longitude + 0.001,
          latitude + 0.001,
        ],
      };

      console.log(
        "AEGRIS ANALYSIS: STARÝ BBOX REŽIM"
      );
    }

    // --------------------------------------------------
    // 9. COPERNICUS STATISTICS API
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

          body: JSON.stringify({
            input: {
              bounds,

              data: [
                {
                  type:
                    "sentinel-2-l2a",

                  dataFilter: {
                    maxCloudCoverage:
                      20,
                  },
                },
              ],
            },

            aggregation: {
              timeRange: {
                from:
                  from.toISOString(),

                to:
                  to.toISOString(),
              },

              aggregationInterval: {
                of: "P10D",
              },

              lastIntervalBehavior:
                "SHORTEN",

              width: 64,

              height: 64,

              evalscript,
            },

            calculations: {
              default: {
                statistics: {
                  default: {
                    percentiles: {
                      k: [
                        5,
                        50,
                        95,
                      ],
                    },
                  },
                },
              },
            },
          }),
        }
      );

    // --------------------------------------------------
    // 10. RAW ODPOVĚĎ
    // --------------------------------------------------

    const responseText =
      await response.text();

    console.log(
      "STATISTICS STATUS:",
      response.status
    );

    console.log(
      "STATISTICS CONTENT-TYPE:",
      response.headers.get(
        "content-type"
      )
    );

    console.log(
      "STATISTICS RAW RESPONSE:",
      responseText
    );

    // --------------------------------------------------
    // 11. CHYBA COPERNICUS
    // --------------------------------------------------

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            "Statistics API error",

          status:
            response.status,

          response:
            responseText,
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 12. JSON
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
    // 13. HISTORIE NDVI
    // --------------------------------------------------

    const history: NdviHistoryItem[] =
      (json.data ?? [])
        .map(
          (
            item
          ): NdviHistoryItem | null => {
            const ndvi =
              extractNdvi(item);

            const interval =
              item.interval;

            if (
              !interval?.from ||
              !interval.to ||
              ndvi === null
            ) {
              return null;
            }

            return {
              from:
                interval.from,

              to:
                interval.to,

              ndvi,
            };
          }
        )
        .filter(
          (
            item
          ): item is NdviHistoryItem =>
            item !== null
        );

    console.log(
      "NDVI HISTORY:",
      JSON.stringify(
        history,
        null,
        2
      )
    );

    // --------------------------------------------------
    // 14. SEŘAZENÍ HISTORIE
    // --------------------------------------------------

    history.sort(
      (a, b) =>
        new Date(
          a.from
        ).getTime() -
        new Date(
          b.from
        ).getTime()
    );

    // --------------------------------------------------
    // 15. AKTUÁLNÍ NDVI
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

    // --------------------------------------------------
    // 16. ZMĚNA NDVI
    // --------------------------------------------------

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
    // 17. TREND
    // --------------------------------------------------

    let trend =
      "Stabilní";

    if (
      change !== null
    ) {
      if (
        change <= -0.05
      ) {
        trend =
          "Zhoršující se";
      } else if (
        change >= 0.05
      ) {
        trend =
          "Zlepšující se";
      } else {
        trend =
          "Stabilní";
      }
    }

    // --------------------------------------------------
    // 18. RIZIKO
    // --------------------------------------------------

    let risk =
      "Nízké";

    if (
      currentNdvi !== null &&
      currentNdvi < 0.20
    ) {
      risk =
        "Kritické";
    } else if (
      change !== null &&
      change <= -0.15
    ) {
      risk =
        "Kritické";
    } else if (
      change !== null &&
      change <= -0.05
    ) {
      risk =
        "Vysoké";
    } else if (
      currentNdvi !== null &&
      currentNdvi < 0.40
    ) {
      risk =
        "Vysoké";
    } else if (
      currentNdvi !== null &&
      currentNdvi < 0.60
    ) {
      risk =
        "Střední";
    }

    // --------------------------------------------------
    // 19. LOG
    // --------------------------------------------------

    console.log(
      "AEGRIS ANALYTICKÝ VÝSLEDEK:",
      {
        projectId,
        latitude,
        longitude,
        hasBoundary:
          boundary !== null,
        boundaryPoints:
          boundary?.length ?? 0,
        startNdvi,
        currentNdvi,
        change,
        trend,
        risk,
      }
    );

    // --------------------------------------------------
    // 20. ODPOVĚĎ
    // --------------------------------------------------

    return NextResponse.json({
      projectId,
      latitude,
      longitude,
      hasBoundary:
        boundary !== null,
      boundaryPoints:
        boundary?.length ?? 0,
      from:
        from.toISOString(),
      to:
        to.toISOString(),
      count:
        history.length,
      ndvi:
        currentNdvi,
      startNdvi,
      currentNdvi,
      change,
      trend,
      risk,
      history,
      raw: json,
    });
  } catch (error) {
    console.error(
      "ANALYSIS ROUTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Chyba v analysis route",

        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}