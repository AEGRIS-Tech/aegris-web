import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { requireAccountAccess } from "@/lib/auth/account-access";
import {
  runProjectAnalysis,
  type AnalysisProject,
} from "@/lib/server/analysis/run-project-analysis";

export const dynamic = "force-dynamic";

const ANALYSIS_LOCK_STALE_SECONDS = 15 * 60;

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Route handler nemusí vždy povolit změnu cookies.
            }
          },
        },
      }
    );

    const access = await requireAccountAccess(supabase);

    if (!access.ok) {
      return NextResponse.json(
        {
          error: access.message,
          code: access.code,
        },
        { status: access.status }
      );
    }

    const user = access.user;

    const url = new URL(request.url);
    const projectIdParam = url.searchParams.get("projectId");

    if (!projectIdParam) {
      return NextResponse.json(
        { error: "Chybí ID projektu." },
        { status: 400 }
      );
    }

    const projectId = Number(projectIdParam);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return NextResponse.json(
        { error: "Neplatné ID projektu." },
        { status: 400 }
      );
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select(
        "id, latitude, longitude, boundary, user_id, organization_id, crop_catalog_id, crop_name, growth_stage"
      )
      .eq("id", projectId)
      .maybeSingle();

    if (projectError) {
      console.error("CHYBA OVĚŘENÍ PŘÍSTUPU K PROJEKTU:", projectError);
      return NextResponse.json(
        { error: "Nepodařilo se ověřit přístup k projektu." },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: "Projekt nebyl nalezen nebo k němu nemáte přístup." },
        { status: 404 }
      );
    }

    if (!project.organization_id) {
      console.error("PROJECT WITHOUT ORGANIZATION:", projectId);
      return NextResponse.json(
        { error: "Projekt nemá nastavenou organizaci." },
        { status: 500 }
      );
    }

    const { data: membership, error: membershipError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", project.organization_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError) {
      console.error("CHYBA OVĚŘENÍ ROLE V ORGANIZACI:", membershipError);
      return NextResponse.json(
        { error: "Nepodařilo se ověřit oprávnění k analýze." },
        { status: 500 }
      );
    }

    if (
      !membership ||
      !["owner", "admin", "member"].includes(membership.role)
    ) {
      return NextResponse.json(
        {
          error:
            "K provedení analýzy nemáte oprávnění. Viewer má pouze přístup pro čtení.",
          code: "INSUFFICIENT_ORGANIZATION_ROLE",
        },
        { status: 403 }
      );
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error("CHYBÍ SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json(
        { error: "Server nemá nakonfigurovaný Supabase service role key." },
        { status: 500 }
      );
    }

    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const staleBefore = new Date(
      Date.now() - ANALYSIS_LOCK_STALE_SECONDS * 1000
    ).toISOString();

    const { error: staleLockDeleteError } = await serviceSupabase
      .from("analysis_locks")
      .delete()
      .eq("project_id", projectId)
      .lt("locked_at", staleBefore);

    if (staleLockDeleteError) {
      console.error(
        "ANALYSIS STALE LOCK CLEANUP ERROR:",
        staleLockDeleteError
      );
      return NextResponse.json(
        { error: "Nepodařilo se ověřit stav probíhající analýzy." },
        { status: 500 }
      );
    }

    const { error: lockInsertError } = await serviceSupabase
      .from("analysis_locks")
      .insert({
        project_id: projectId,
        user_id: user.id,
      });

    if (lockInsertError) {
      if (lockInsertError.code === "23505") {
        return NextResponse.json(
          {
            error: "Analýza tohoto projektu již probíhá.",
            code: "ANALYSIS_ALREADY_RUNNING",
          },
          { status: 409 }
        );
      }

      console.error("ANALYSIS LOCK ERROR:", lockInsertError);

      return NextResponse.json(
        { error: "Nepodařilo se uzamknout analýzu projektu." },
        { status: 500 }
      );
    }

    try {
      const { data: rateLimitData, error: rateLimitError } =
        await serviceSupabase.rpc("consume_analysis_rate_limit", {
          p_user_id: user.id,
          p_limit: 5,
          p_window_seconds: 600,
        });

      if (rateLimitError) {
        console.error("ANALYSIS RATE LIMIT ERROR:", rateLimitError);
        return NextResponse.json(
          { error: "Nepodařilo se ověřit limit analýz." },
          { status: 500 }
        );
      }

      const rateLimit = Array.isArray(rateLimitData)
        ? rateLimitData[0]
        : rateLimitData;

      if (rateLimit && rateLimit.allowed === false) {
        const retryAfter =
          Number(rateLimit.retry_after_seconds) || 600;

        return NextResponse.json(
          {
            error: "Dosáhli jste limitu analýz. Zkuste to později.",
            retryAfterSeconds: retryAfter,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(retryAfter),
            },
          }
        );
      }

      return await runProjectAnalysis({
        projectId,
        project: project as AnalysisProject,
        serviceSupabase,
      });
    } finally {
      const { error: unlockError } = await serviceSupabase
        .from("analysis_locks")
        .delete()
        .eq("project_id", projectId)
        .eq("user_id", user.id);

      if (unlockError) {
        console.error("ANALYSIS UNLOCK ERROR:", unlockError);
      }
    }
  } catch (error) {
    console.error("ANALYSIS ROUTE ERROR:", error);

    return NextResponse.json(
      {
        error: "Chyba při získávání Sentinel-2 dat.",
      },
      {
        status: 500,
      }
    );
  }
}
