import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type NdviHistoryRow = {
  period_from: string;
  period_to: string;
  ndvi: number;
  created_at: string;
};

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

    const cookieStore = await cookies();

    const authSupabase = createServerClient(
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
              // Cookie refresh není pro tento request kritický.
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await authSupabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error:
            "Uživatel není přihlášen.",
        },
        { status: 401 }
      );
    }
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
          // Cookie refresh není pro tento request kritický.
        }
      },
    },
  }
);

    const { searchParams } =
      new URL(request.url);

    const projectId = Number(
      searchParams.get("projectId")
    );

    if (!Number.isFinite(projectId)) {
      return NextResponse.json(
        {
          error:
            "Chybí platné projectId.",
        },
        { status: 400 }
      );
    }

    const {
      data: project,
      error: projectError,
    } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

      console.log("HISTORY PROJECT DEBUG:", {
  userId: user.id,
  projectId,
  project,
  projectError: projectError?.message ?? null,
});

    if (projectError || !project) {
      return NextResponse.json(
        {
          error:
            "Projekt nebyl nalezen nebo k němu nemáš přístup.",
        },
        { status: 404 }
      );
    }

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
          details:
            historyError.message,
        },
        { status: 500 }
      );
    }

    const history =
      (rows ?? []) as NdviHistoryRow[];

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

    let change:
      | number
      | null = null;

    if (
      startNdvi !== null &&
      currentNdvi !== null
    ) {
      change =
        currentNdvi - startNdvi;
    }

    let changePercent:
      | number
      | null = null;

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
        details:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}