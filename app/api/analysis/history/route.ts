import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

type NdviHistoryRow = {
  period_from: string;
  period_to: string;
  ndvi: number;
  created_at: string;
};

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

export async function GET(request: Request) {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabasePublishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabasePublishableKey) {
      return NextResponse.json(
        {
          error:
            "Server nemá nakonfigurované NEXT_PUBLIC_SUPABASE_URL nebo NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
        },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
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
                ({ name, value, options }) => {
                  cookieStore.set(
                    name,
                    value,
                    options
                  );
                }
              );
            } catch {
              // Refresh cookies není pro tento read-only endpoint kritický.
            }
          },
        },
      }
    );

    /*
     * --------------------------------------------------
     * AUTH
     * --------------------------------------------------
     */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "Uživatel není přihlášen.",
        },
        { status: 401 }
      );
    }

    /*
     * --------------------------------------------------
     * PROJECT ID
     * --------------------------------------------------
     */

    const { searchParams } =
      new URL(request.url);

    const projectId = Number(
      searchParams.get("projectId")
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
        { status: 400 }
      );
    }

    /*
     * --------------------------------------------------
     * PROJECT OWNERSHIP
     * --------------------------------------------------
     */

    const {
      data: project,
      error: projectError,
    } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (projectError) {
      console.error(
        "CHYBA OVĚŘENÍ PROJEKTU:",
        projectError
      );

      return NextResponse.json(
        {
          error:
            "Nepodařilo se ověřit přístup k projektu.",
        },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        {
          error:
            "Projekt nebyl nalezen nebo k němu nemáte přístup.",
        },
        { status: 404 }
      );
    }

    /*
     * --------------------------------------------------
     * NDVI HISTORY
     *
     * period_from / period_to jsou skutečná časová okna
     * Sentinel-2 agregace. created_at je pouze čas zápisu
     * řádku do databáze a nepoužívá se jako datum měření.
     * --------------------------------------------------
     */

    const {
      data: rows,
      error: historyError,
    } = await supabase
      .from("ndvi_history")
      .select(
        "period_from, period_to, ndvi, created_at"
      )
      .eq("project_id", projectId)
      .order("period_from", {
        ascending: true,
      });

    if (historyError) {
      console.error(
        "CHYBA NAČTENÍ NDVI HISTORIE:",
        historyError
      );

      return NextResponse.json(
        {
          error:
            "Nepodařilo se načíst NDVI historii.",
        },
        { status: 500 }
      );
    }

    /*
     * --------------------------------------------------
     * NORMALIZACE
     * --------------------------------------------------
     */

    const history: NdviHistoryRow[] =
      (rows ?? [])
        .map((row) => {
          const ndvi =
            numberOrNull(row.ndvi);

          if (
            ndvi === null ||
            typeof row.period_from !== "string" ||
            typeof row.period_to !== "string" ||
            typeof row.created_at !== "string"
          ) {
            return null;
          }

          return {
            period_from: row.period_from,
            period_to: row.period_to,
            ndvi,
            created_at: row.created_at,
          };
        })
        .filter(
          (
            row
          ): row is NdviHistoryRow =>
            row !== null
        );

    /*
     * --------------------------------------------------
     * SUMMARY
     * --------------------------------------------------
     */

    const first =
      history.length > 0
        ? history[0]
        : null;

    const last =
      history.length > 0
        ? history[history.length - 1]
        : null;

    const startNdvi =
      first?.ndvi ?? null;

    const currentNdvi =
      last?.ndvi ?? null;

    const change =
      startNdvi !== null &&
      currentNdvi !== null
        ? currentNdvi - startNdvi
        : null;

    const changePercent =
      startNdvi !== null &&
      currentNdvi !== null &&
      startNdvi !== 0
        ? ((currentNdvi - startNdvi) /
            Math.abs(startNdvi)) *
          100
        : null;

    return NextResponse.json({
      projectId,
      count: history.length,
      history,
      ndvi: currentNdvi,
      currentNdvi,
      startNdvi,
      change,
      changePercent,
    });
  } catch (error) {
    console.error(
      "NDVI HISTORIE CHYBA:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Neočekávaná chyba serveru.",
      },
      { status: 500 }
    );
  }
}