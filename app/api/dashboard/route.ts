import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type DashboardProjectRow = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
};

type AnalysisRow = {
  id: number;
  project_id: number;
  ndvi: number | string;
  risk: string;
  created_at: string;
  valid_geometry_pct: number | string | null;
  source_provider: string | null;
  satellite_product: string | null;
};

type RecommendationRow = {
  id: number;
  project_id: number;
  analysis_id: number | null;
  priority: string;
  score: number | null;
  created_at: string;
};

type AlertRow = {
  id: number;
  project_id: number;
  analysis_id: number | null;
  level: string;
  priority: string;
  title: string;
  is_read: boolean | null;
  created_at: string;
};

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
      return NextResponse.json(
        {
          error:
            "Server nemá kompletní Supabase konfiguraci.",
        },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();

    const authSupabase = createServerClient(
      supabaseUrl,
      publishableKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(
                ({ name, value, options }) => {
                  cookieStore.set(name, value, options);
                }
              );
            } catch {
              // Pro read-only dashboard request není refresh cookies kritický.
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
        { error: "Uživatel není přihlášen." },
        { status: 401 }
      );
    }

    const serviceSupabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const {
      data: projectsData,
      error: projectsError,
    } = await serviceSupabase
      .from("projects")
      .select(
        "id, name, latitude, longitude, status, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (projectsError) {
      console.error(
        "DASHBOARD PROJECTS ERROR:",
        projectsError
      );

      return NextResponse.json(
        { error: "Nepodařilo se načíst projekty." },
        { status: 500 }
      );
    }

    const projects =
      (projectsData ?? []) as DashboardProjectRow[];

    if (projects.length === 0) {
      return NextResponse.json({
        counts: {
          projects: 0,
          analyses: 0,
          reports: 0,
          alerts: 0,
          unreadAlerts: 0,
          criticalProjects: 0,
        },
        projects: [],
        latestAnalysis: null,
      });
    }

    const projectIds =
      projects.map((project) => project.id);

    const [
      analysesResult,
      recommendationsResult,
      alertsResult,
    ] = await Promise.all([
      serviceSupabase
        .from("analysis")
        .select(
          "id, project_id, ndvi, risk, created_at, valid_geometry_pct, source_provider, satellite_product"
        )
        .in("project_id", projectIds)
        .order("created_at", { ascending: false }),

      serviceSupabase
        .from("aegris_recommendations")
        .select(
          "id, project_id, analysis_id, priority, score, created_at"
        )
        .in("project_id", projectIds)
        .order("created_at", { ascending: false }),

      serviceSupabase
        .from("aegris_alerts")
        .select(
          "id, project_id, analysis_id, level, priority, title, is_read, created_at"
        )
        .in("project_id", projectIds)
        .order("created_at", { ascending: false }),
    ]);

    if (analysesResult.error) {
      console.error(
        "DASHBOARD ANALYSES ERROR:",
        analysesResult.error
      );
    }

    if (recommendationsResult.error) {
      console.error(
        "DASHBOARD RECOMMENDATIONS ERROR:",
        recommendationsResult.error
      );
    }

    if (alertsResult.error) {
      console.error(
        "DASHBOARD ALERTS ERROR:",
        alertsResult.error
      );
    }

    const analyses =
      (analysesResult.data ?? []) as AnalysisRow[];

    const recommendations =
      (recommendationsResult.data ??
        []) as RecommendationRow[];

    const alerts =
      (alertsResult.data ?? []) as AlertRow[];

    const latestAnalysisByProject =
      new Map<number, AnalysisRow>();

    for (const analysis of analyses) {
      if (
        !latestAnalysisByProject.has(
          analysis.project_id
        )
      ) {
        latestAnalysisByProject.set(
          analysis.project_id,
          analysis
        );
      }
    }

    const latestRecommendationByProject =
      new Map<number, RecommendationRow>();

    for (const recommendation of recommendations) {
      if (
        !latestRecommendationByProject.has(
          recommendation.project_id
        )
      ) {
        latestRecommendationByProject.set(
          recommendation.project_id,
          recommendation
        );
      }
    }

    const unreadAlertsByProject =
      new Map<number, number>();

    for (const alert of alerts) {
      if (alert.is_read === false || alert.is_read === null) {
        unreadAlertsByProject.set(
          alert.project_id,
          (unreadAlertsByProject.get(
            alert.project_id
          ) ?? 0) + 1
        );
      }
    }

    const dashboardProjects =
      projects.map((project) => {
        const latestAnalysis =
          latestAnalysisByProject.get(project.id) ?? null;

        const latestRecommendation =
          latestRecommendationByProject.get(
            project.id
          ) ?? null;

        const ndvi =
          latestAnalysis != null
            ? Number(latestAnalysis.ndvi)
            : null;

        const validGeometryPct =
          latestAnalysis?.valid_geometry_pct != null
            ? Number(
                latestAnalysis.valid_geometry_pct
              )
            : null;

        return {
          ...project,
          latestAnalysis:
            latestAnalysis != null
              ? {
                  id: latestAnalysis.id,
                  ndvi:
                    Number.isFinite(ndvi)
                      ? ndvi
                      : null,
                  risk: latestAnalysis.risk,
                  created_at:
                    latestAnalysis.created_at,
                  valid_geometry_pct:
                    Number.isFinite(
                      validGeometryPct
                    )
                      ? validGeometryPct
                      : null,
                  source_provider:
                    latestAnalysis.source_provider,
                  satellite_product:
                    latestAnalysis.satellite_product,
                }
              : null,

          latestRecommendation:
            latestRecommendation != null
              ? {
                  id: latestRecommendation.id,
                  analysis_id:
                    latestRecommendation.analysis_id,
                  priority:
                    latestRecommendation.priority,
                  score:
                    latestRecommendation.score,
                  created_at:
                    latestRecommendation.created_at,
                }
              : null,

          unreadAlerts:
            unreadAlertsByProject.get(
              project.id
            ) ?? 0,
        };
      });

    const criticalProjectIds =
      new Set<number>();

    for (const project of dashboardProjects) {
      if (
        project.latestRecommendation?.priority ===
          "Kritická" ||
        project.latestAnalysis?.risk ===
          "Kritické"
      ) {
        criticalProjectIds.add(project.id);
      }
    }

    const latestAnalysis =
      analyses.length > 0
        ? analyses[0]
        : null;

    const latestRecommendation =
      latestAnalysis != null
        ? recommendations.find(
            (item) =>
              item.analysis_id === latestAnalysis.id
          ) ??
          latestRecommendationByProject.get(
            latestAnalysis.project_id
          ) ??
          null
        : null;

    const latestProject =
      latestAnalysis != null
        ? projects.find(
            (project) =>
              project.id ===
              latestAnalysis.project_id
          ) ?? null
        : null;

    return NextResponse.json({
      counts: {
        projects: projects.length,
        analyses: analyses.length,

        // Každý projekt s alespoň jednou uloženou analýzou
        // má v pilotní verzi dostupný report.
        reports:
          latestAnalysisByProject.size,

        alerts: alerts.length,
        unreadAlerts: alerts.filter(
          (alert) =>
            alert.is_read === false ||
            alert.is_read === null
        ).length,
        criticalProjects:
          criticalProjectIds.size,
      },

      projects: dashboardProjects,

      latestAnalysis:
        latestAnalysis != null
          ? {
              project:
                latestProject != null
                  ? {
                      id: latestProject.id,
                      name: latestProject.name,
                    }
                  : null,
              analysis: {
                id: latestAnalysis.id,
                ndvi: Number(
                  latestAnalysis.ndvi
                ),
                risk: latestAnalysis.risk,
                created_at:
                  latestAnalysis.created_at,
                valid_geometry_pct:
                  latestAnalysis.valid_geometry_pct !=
                  null
                    ? Number(
                        latestAnalysis.valid_geometry_pct
                      )
                    : null,
                source_provider:
                  latestAnalysis.source_provider,
                satellite_product:
                  latestAnalysis.satellite_product,
              },
              recommendation:
                latestRecommendation != null
                  ? {
                      priority:
                        latestRecommendation.priority,
                      score:
                        latestRecommendation.score,
                    }
                  : null,
            }
          : null,
    });
  } catch (error) {
    console.error(
      "DASHBOARD ROUTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Neočekávaná chyba dashboardu.",
      },
      { status: 500 }
    );
  }
}