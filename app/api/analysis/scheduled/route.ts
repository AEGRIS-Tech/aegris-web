import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  runProjectAnalysis,
  type AnalysisProject,
} from "@/lib/server/analysis/run-project-analysis";

export const dynamic = "force-dynamic";

const ANALYSIS_INTERVAL_HOURS = 72;
const ANALYSIS_LOCK_STALE_SECONDS = 15 * 60;
const MAX_PROJECTS_PER_RUN = 5;
const CANDIDATE_SCAN_LIMIT = 100;

type ScheduledResult = {
  projectId: number;
  status: "succeeded" | "skipped" | "failed";
  httpStatus?: number;
  code?: string | null;
  error?: string | null;
};

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export async function POST(request: Request) {
  try {
    /*
     * --------------------------------------------------
     * SCHEDULE AUTH
     *
     * Scheduled endpoint běží se service role, proto nesmí
     * být veřejně spustitelný bez serverového tajemství.
     *
     * Očekává:
     * Authorization: Bearer <ANALYSIS_SCHEDULE_SECRET>
     * --------------------------------------------------
     */

    const scheduleSecret = process.env.ANALYSIS_SCHEDULE_SECRET;

    if (!scheduleSecret) {
      console.error("CHYBÍ ANALYSIS_SCHEDULE_SECRET");
      return NextResponse.json(
        {
          error:
            "Server nemá nakonfigurovaný secret pro automatické analýzy.",
          code: "ANALYSIS_SCHEDULE_SECRET_MISSING",
        },
        { status: 500 }
      );
    }

    const bearerToken = getBearerToken(request);

    if (!bearerToken || bearerToken !== scheduleSecret) {
      return NextResponse.json(
        {
          error: "Neplatné oprávnění pro automatickou analýzu.",
          code: "UNAUTHORIZED_SCHEDULED_ANALYSIS",
        },
        { status: 401 }
      );
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error("CHYBÍ SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json(
        {
          error: "Server nemá nakonfigurovaný Supabase service role key.",
        },
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

    /*
     * --------------------------------------------------
     * ELIGIBILITY
     *
     * Projekt je způsobilý k automatické analýze, pokud:
     * - nemá žádnou analýzu za posledních 72 hodin,
     * - a vejde se do malé dávky pro tento běh.
     *
     * Neúspěšný běh nevytvoří analysis řádek, takže projekt
     * zůstane způsobilý pro další naplánovanou kontrolu.
     * --------------------------------------------------
     */

    const cutoff = new Date(
      Date.now() - ANALYSIS_INTERVAL_HOURS * 60 * 60 * 1000
    ).toISOString();

    const { data: candidateProjects, error: candidateProjectsError } =
      await serviceSupabase
        .from("projects")
        .select(
          "id, latitude, longitude, boundary, user_id, organization_id, crop_catalog_id, crop_name, growth_stage"
        )
        .order("id", { ascending: true })
        .limit(CANDIDATE_SCAN_LIMIT);

    if (candidateProjectsError) {
      console.error(
        "SCHEDULED ANALYSIS PROJECT SCAN ERROR:",
        candidateProjectsError
      );

      return NextResponse.json(
        {
          error: "Nepodařilo se načíst projekty pro automatickou analýzu.",
          code: "SCHEDULED_PROJECT_SCAN_FAILED",
        },
        { status: 500 }
      );
    }

    if (!candidateProjects?.length) {
      return NextResponse.json({
        intervalHours: ANALYSIS_INTERVAL_HOURS,
        cutoff,
        scanned: 0,
        eligible: 0,
        processed: 0,
        succeeded: 0,
        skipped: 0,
        failed: 0,
        results: [],
      });
    }

    const candidateIds = candidateProjects.map((project) => project.id);

    /*
     * Pro rozhodnutí o 72h způsobilosti nepotřebujeme celou historii.
     * Stačí zjistit, které kandidátní projekty mají alespoň jeden
     * úspěšně uložený analysis řádek od cutoff času.
     */
    const { data: recentAnalyses, error: recentAnalysesError } =
      await serviceSupabase
        .from("analysis")
        .select("project_id")
        .in("project_id", candidateIds)
        .gte("created_at", cutoff);

    if (recentAnalysesError) {
      console.error(
        "SCHEDULED ANALYSIS RECENT LOOKUP ERROR:",
        recentAnalysesError
      );

      return NextResponse.json(
        {
          error:
            "Nepodařilo se ověřit poslední analýzy projektů.",
          code: "SCHEDULED_RECENT_ANALYSIS_LOOKUP_FAILED",
        },
        { status: 500 }
      );
    }

    const recentlyAnalyzedProjectIds = new Set(
      (recentAnalyses ?? []).map((row) => Number(row.project_id))
    );

    const eligibleProjects = candidateProjects
      .filter(
        (project) =>
          !recentlyAnalyzedProjectIds.has(Number(project.id))
      )
      .slice(0, MAX_PROJECTS_PER_RUN);

    const results: ScheduledResult[] = [];

    for (const rawProject of eligibleProjects) {
      const project = rawProject as AnalysisProject;
      const projectId = Number(project.id);

      /*
       * --------------------------------------------------
       * SHARED PROJECT LOCK
       *
       * Stejná tabulka jako u ruční analýzy.
       * user_id = NULL jednoznačně značí server-scheduled běh.
       * --------------------------------------------------
       */

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
          "SCHEDULED ANALYSIS STALE LOCK CLEANUP ERROR:",
          {
            projectId,
            error: staleLockDeleteError,
          }
        );

        results.push({
          projectId,
          status: "failed",
          error: "Nepodařilo se ověřit stav project locku.",
        });

        continue;
      }

      const { error: lockInsertError } = await serviceSupabase
        .from("analysis_locks")
        .insert({
          project_id: projectId,
          user_id: null,
        });

      if (lockInsertError) {
        if (lockInsertError.code === "23505") {
          results.push({
            projectId,
            status: "skipped",
            code: "ANALYSIS_ALREADY_RUNNING",
            error: "Analýza projektu již probíhá.",
          });

          continue;
        }

        console.error("SCHEDULED ANALYSIS LOCK ERROR:", {
          projectId,
          error: lockInsertError,
        });

        results.push({
          projectId,
          status: "failed",
          error: "Nepodařilo se uzamknout analýzu projektu.",
        });

        continue;
      }

      try {
        const response = await runProjectAnalysis({
          projectId,
          project,
          serviceSupabase,
        });

        let payload: {
          code?: string;
          error?: string;
        } | null = null;

        try {
          payload = (await response.json()) as {
            code?: string;
            error?: string;
          };
        } catch {
          payload = null;
        }

        if (response.ok) {
          results.push({
            projectId,
            status: "succeeded",
            httpStatus: response.status,
            code: payload?.code ?? null,
          });
        } else {
          results.push({
            projectId,
            status: "failed",
            httpStatus: response.status,
            code: payload?.code ?? null,
            error:
              payload?.error ??
              "Automatická analýza skončila chybou.",
          });
        }
      } catch (analysisError) {
        console.error("SCHEDULED PROJECT ANALYSIS ERROR:", {
          projectId,
          error: analysisError,
        });

        results.push({
          projectId,
          status: "failed",
          error: "Automatická analýza projektu vyvolala výjimku.",
        });
      } finally {
        /*
         * Scheduled lock mažeme pouze pokud stále patří scheduled běhu.
         * Pro NULL používáme .is(), ne .eq().
         */
        const { error: unlockError } = await serviceSupabase
          .from("analysis_locks")
          .delete()
          .eq("project_id", projectId)
          .is("user_id", null);

        if (unlockError) {
          console.error("SCHEDULED ANALYSIS UNLOCK ERROR:", {
            projectId,
            error: unlockError,
          });
        }
      }
    }

    const succeeded = results.filter(
      (item) => item.status === "succeeded"
    ).length;

    const skipped = results.filter(
      (item) => item.status === "skipped"
    ).length;

    const failed = results.filter(
      (item) => item.status === "failed"
    ).length;

    return NextResponse.json({
      intervalHours: ANALYSIS_INTERVAL_HOURS,
      cutoff,
      scanned: candidateProjects.length,
      eligible: eligibleProjects.length,
      processed: results.length,
      succeeded,
      skipped,
      failed,
      results,
    });
  } catch (error) {
    console.error("SCHEDULED ANALYSIS ROUTE ERROR:", error);

    return NextResponse.json(
      {
        error: "Automatickou analýzu se nepodařilo spustit.",
        code: "SCHEDULED_ANALYSIS_FAILED",
      },
      { status: 500 }
    );
  }
}
