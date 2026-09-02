import { cookies } from "next/headers";
import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createServerClient } from "@supabase/ssr";
import { requireAccountAccess } from "@/lib/auth/account-access";
import { fetchProjectWeather } from "@/lib/server/weather";

export const dynamic = "force-dynamic";

function numberOrNull(
  value: unknown
): number | null {
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
      await requireAccountAccess(
        supabase
      );

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
     * PROJECT ACCESS
     * =====================================================
     *
     * Souřadnice nepřebíráme od klienta.
     * Projekt načítáme přes přihlášeného
     * Supabase klienta a přístup řídí RLS.
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
     * WEATHER
     * =====================================================
     *
     * Veškerá komunikace s Open-Meteo a normalizace
     * weather dat je centralizována v
     * lib/server/weather.ts.
     *
     * /api/weather i /api/analysis tak používají
     * stejný weather model, stejný rolling 24h výpočet
     * a stejnou definici fetched_at.
     */

    let weather;

    try {
      weather =
        await fetchProjectWeather(
          latitude,
          longitude
        );
    } catch (weatherError) {
      console.error(
        "WEATHER PROVIDER ERROR:",
        weatherError
      );

      return NextResponse.json(
        {
          error:
            "Počasí se nepodařilo načíst.",
          code:
            "WEATHER_PROVIDER_UNAVAILABLE",
        },
        {
          status: 502,
        }
      );
    }

    /*
     * =====================================================
     * PUBLIC RESPONSE
     * =====================================================
     *
     * Klient dostává pouze normalizovaný weather
     * payload potřebný pro AEGRIS.
     */

    return NextResponse.json({
      projectId,
      latitude,
      longitude,
      ...weather,
    });
  } catch (error) {
    console.error(
      "WEATHER ROUTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Počasí se nepodařilo načíst.",
        code:
          "WEATHER_ROUTE_FAILED",
      },
      {
        status: 500,
      }
    );
  }
}