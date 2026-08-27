import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { requireAccountAccess } from "@/lib/auth/account-access";

export const dynamic = "force-dynamic";

function numberOrNull(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

export async function GET(
  request: NextRequest
) {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabasePublishableKey =
      process.env
        .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (
      !supabaseUrl ||
      !supabasePublishableKey
    ) {
      return NextResponse.json(
        {
          error:
            "Server nemá kompletní Supabase konfiguraci.",
        },
        {
          status: 500,
        }
      );
    }

    const cookieStore =
      await cookies();

    const supabase =
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
                /*
                 * Refresh cookies není pro tento
                 * read-only endpoint kritický.
                 */
              }
            },
          },
        }
      );

    /*
     * =====================================================
     * AUTH
     * =====================================================
     */

    const access =
      await requireAccountAccess(supabase);

    if (!access.ok) {
      return NextResponse.json(
        {
          error: access.message,
          code: access.code,
        },
        {
          status: access.status,
        }
      );
    }

    const { user } = access;

    /*
     * =====================================================
     * PROJECT ID
     * =====================================================
     */

    const projectId =
      Number(
        request.nextUrl.searchParams.get(
          "projectId"
        )
      );

    if (
      !Number.isInteger(projectId) ||
      projectId <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "Chybí platné projectId.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =====================================================
     * PROJECT OWNERSHIP
     * =====================================================
     *
     * Souřadnice nikdy nepřebíráme přímo od klienta.
     * Nejprve ověříme, že projekt patří přihlášenému
     * uživateli, a teprve potom použijeme jeho souřadnice.
     */

    const {
      data: project,
      error: projectError,
    } = await supabase
      .from("projects")
      .select(
        "id, latitude, longitude"
      )
      .eq("id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (projectError) {
      console.error(
        "WEATHER PROJECT ERROR:",
        projectError
      );

      return NextResponse.json(
        {
          error:
            "Nepodařilo se ověřit projekt.",
        },
        {
          status: 500,
        }
      );
    }

    if (!project) {
      return NextResponse.json(
        {
          error:
            "Projekt nebyl nalezen nebo k němu nemáte přístup.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * =====================================================
     * COORDINATES
     * =====================================================
     */

    const latitude =
      numberOrNull(
        project.latitude
      );

    const longitude =
      numberOrNull(
        project.longitude
      );

    if (
      latitude === null ||
      longitude === null ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          error:
            "Projekt nemá platné souřadnice.",
        },
        {
          status: 422,
        }
      );
    }

    /*
     * =====================================================
     * OPEN-METEO REQUEST
     * =====================================================
     *
     * Host i cesta jsou pevně dané.
     * Klient nemůže ovlivnit cílový server.
     */

    const url =
      new URL(
        "https://api.open-meteo.com/v1/forecast"
      );

    url.searchParams.set(
      "latitude",
      String(latitude)
    );

    url.searchParams.set(
      "longitude",
      String(longitude)
    );

    url.searchParams.set(
      "current",
      [
        "temperature_2m",
        "relative_humidity_2m",
        "precipitation",
        "wind_speed_10m",
        "soil_moisture_9_to_27cm",
      ].join(",")
    );

    url.searchParams.set(
      "hourly",
      [
        "precipitation",
        "precipitation_probability",
        "temperature_2m",
        "soil_moisture_9_to_27cm",
      ].join(",")
    );

    url.searchParams.set(
      "daily",
      [
        "precipitation_sum",
        "et0_fao_evapotranspiration",
        "temperature_2m_min",
        "temperature_2m_max",
      ].join(",")
    );

    url.searchParams.set(
      "forecast_days",
      "2"
    );

    url.searchParams.set(
      "timezone",
      "auto"
    );

    url.searchParams.set(
      "temperature_unit",
      "celsius"
    );

    url.searchParams.set(
      "wind_speed_unit",
      "kmh"
    );

    url.searchParams.set(
      "precipitation_unit",
      "mm"
    );

    /*
     * Explicitní timeout chrání server před příliš
     * dlouhým čekáním při výpadku nebo zpomalení
     * externího weather provideru.
     */

    const response =
      await fetch(
        url.toString(),
        {
          next: {
            revalidate: 900,
          },
          signal:
            AbortSignal.timeout(
              10_000
            ),
        }
      );

    if (!response.ok) {
      const text =
        await response.text();

      console.error(
        "OPEN-METEO ERROR:",
        text
      );

      return NextResponse.json(
        {
          error:
            "Počasí se nepodařilo načíst.",
        },
        {
          status: 502,
        }
      );
    }

    /*
     * =====================================================
     * RESPONSE NORMALIZATION
     * =====================================================
     */

    const data =
      await response.json();

    const current =
      data.current ?? {};

    const hourly =
      data.hourly ?? {};

    const daily =
      data.daily ?? {};

    const hourlyTimes: string[] =
      Array.isArray(
        hourly.time
      )
        ? hourly.time
        : [];

    const hourlyPrecipitation:
      unknown[] =
      Array.isArray(
        hourly.precipitation
      )
        ? hourly.precipitation
        : [];

    const hourlyTemperature:
      unknown[] =
      Array.isArray(
        hourly.temperature_2m
      )
        ? hourly.temperature_2m
        : [];

    const hourlyPrecipitationProbability:
      unknown[] =
      Array.isArray(
        hourly.precipitation_probability
      )
        ? hourly.precipitation_probability
        : [];

    const currentTime =
      String(
        current.time ?? ""
      );

    let currentIndex =
      hourlyTimes.findIndex(
        (time) =>
          time === currentTime
      );

    if (currentIndex < 0) {
      currentIndex = 0;
    }

    /*
     * =====================================================
     * NEXT 24 HOURS
     * =====================================================
     */

    const next24hPrecipitation =
      hourlyPrecipitation
        .slice(
          currentIndex,
          currentIndex + 24
        )
        .map(numberOrNull)
        .filter(
          (
            value
          ): value is number =>
            value !== null
        )
        .reduce(
          (sum, value) =>
            sum + value,
          0
        );

    const next24hTemperatures =
      hourlyTemperature
        .slice(
          currentIndex,
          currentIndex + 24
        )
        .map(numberOrNull)
        .filter(
          (
            value
          ): value is number =>
            value !== null
        );

    const next24hPrecipitationProbability =
      hourlyPrecipitationProbability
        .slice(
          currentIndex,
          currentIndex + 24
        )
        .map(numberOrNull)
        .filter(
          (
            value
          ): value is number =>
            value !== null
        );

    const next24hMinTemperature =
      next24hTemperatures.length >
      0
        ? Math.min(
            ...next24hTemperatures
          )
        : null;

    const next24hMaxTemperature =
      next24hTemperatures.length >
      0
        ? Math.max(
            ...next24hTemperatures
          )
        : null;

    const maxPrecipitationProbability =
      next24hPrecipitationProbability
        .length > 0
        ? Math.max(
            ...next24hPrecipitationProbability
          )
        : null;

    /*
     * =====================================================
     * DAILY DATA
     * =====================================================
     */

    const dailyMin:
      unknown[] =
      Array.isArray(
        daily.temperature_2m_min
      )
        ? daily.temperature_2m_min
        : [];

    const dailyMax:
      unknown[] =
      Array.isArray(
        daily.temperature_2m_max
      )
        ? daily.temperature_2m_max
        : [];

    const dailyEvapotranspiration:
      unknown[] =
      Array.isArray(
        daily.et0_fao_evapotranspiration
      )
        ? daily.et0_fao_evapotranspiration
        : [];

    /*
     * =====================================================
     * CURRENT WEATHER
     * =====================================================
     */

    const temperature =
      numberOrNull(
        current.temperature_2m
      );

    const humidity =
      numberOrNull(
        current.relative_humidity_2m
      );

    const precipitation =
      numberOrNull(
        current.precipitation
      );

    const wind =
      numberOrNull(
        current.wind_speed_10m
      );

    const soilMoistureRaw =
      numberOrNull(
        current
          .soil_moisture_9_to_27cm
      );

    const soilMoisture =
      soilMoistureRaw !== null
        ? soilMoistureRaw * 100
        : null;

    /*
     * =====================================================
     * PUBLIC RESPONSE
     * =====================================================
     *
     * Klient dostává pouze normalizovaná data potřebná
     * pro AEGRIS, nikoli syrový payload providera.
     */

    return NextResponse.json({
      projectId,

      latitude:
        numberOrNull(
          data.latitude
        ) ?? latitude,

      longitude:
        numberOrNull(
          data.longitude
        ) ?? longitude,

      timezone:
        String(
          data.timezone ?? ""
        ),

      fetched_at:
        String(
          current.time ??
            new Date().toISOString()
        ),

      temperature_c:
        temperature,

      humidity_pct:
        humidity,

      precipitation_mm:
        precipitation,

      wind_speed_kmh:
        wind,

      soil_moisture_pct:
        soilMoisture,

      evapotranspiration_mm:
        numberOrNull(
          dailyEvapotranspiration[0]
        ),

      precipitation_probability_pct:
        maxPrecipitationProbability,

      next24h_precipitation_mm:
        next24hPrecipitation,

      next24h_min_temperature_c:
        next24hMinTemperature ??
        numberOrNull(
          dailyMin[0]
        ),

      next24h_max_temperature_c:
        next24hMaxTemperature ??
        numberOrNull(
          dailyMax[0]
        ),
    });
  } catch (error) {
    /*
     * AbortSignal.timeout() při timeoutu skončí také zde.
     * Detail chyby zůstává pouze na serveru.
     */

    console.error(
      "WEATHER ROUTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Počasí se nepodařilo načíst.",
      },
      {
        status: 500,
      }
    );
  }
}