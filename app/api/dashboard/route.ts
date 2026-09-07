import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { requireAccountAccess } from "@/lib/auth/account-access";

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

type FieldValidationRow = {
  id: number;
  project_id: number;
  analysis_id: number;
  validation_result:
    | "confirmed"
    | "partially_confirmed"
    | "not_confirmed";
  actual_cause: string | null;
  observed_at: string;
  validated_by: string;
  updated_at: string;
};

export async function GET() {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !publishableKey) {
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
                  cookieStore.set(
                    name,
                    value,
                    options
                  );
                }
              );
            } catch {
              // Pro read-only dashboard request není
              // refresh cookies kritický.
            }
          },
        },
      }
    );

    const access =
      await requireAccountAccess(authSupabase);

    if (!access.ok) {
      return NextResponse.json(
        {
          error: access.message,
          code: access.code,
        },
        { status: access.status }
      );
    }

    const { user } = access;

    const {
      data: profile,
      error: profileError,
    } = await authSupabase
      .from("profiles")
      .select("active_organization_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "DASHBOARD ACTIVE ORGANIZATION ERROR:",
        profileError
      );

      return NextResponse.json(
        {
          error:
            "Nepodařilo se načíst aktivní organizaci.",
        },
        { status: 500 }
      );
    }

    const activeOrganizationId =
      profile?.active_organization_id ?? null;

    if (!activeOrganizationId) {
      return NextResponse.json(
        {
          error:
            "Uživatel nemá nastavenou aktivní organizaci.",
          code: "ACTIVE_ORGANIZATION_REQUIRED",
        },
        { status: 409 }
      );
    }

    /*
     * Dashboard je vždy scoped na aktivní organizaci.
     * Organization-aware RLS zároveň ověří, že přihlášený
     * uživatel je členem této organizace.
     */
    const {
      data: projectsData,
      error: projectsError,
    } = await authSupabase
      .from("projects")
      .select(
        "id, name, latitude, longitude, status, created_at"
      )
      .eq(
        "organization_id",
        activeOrganizationId
      )
      .order("created_at", {
        ascending: false,
      });

    if (projectsError) {
      console.error(
        "DASHBOARD PROJECTS ERROR:",
        projectsError
      );

      return NextResponse.json(
        {
          error:
            "Nepodařilo se načíst projekty.",
        },
        { status: 500 }
      );
    }

    const projects =
      (projectsData ??
        []) as DashboardProjectRow[];

    if (projects.length === 0) {
      return NextResponse.json({
        counts: {
          projects: 0,
          analyses: 0,
          reports: 0,
          alerts: 0,
          unreadAlerts: 0,
          criticalProjects: 0,
          pendingFieldValidations: 0,
        },

        projects: [],
        latestAnalysis: null,
      });
    }

    const projectIds = projects.map(
      (project) => project.id
    );

    const [
      analysesResult,
      recommendationsResult,
      alertsResult,
      validationsResult,
    ] = await Promise.all([
      authSupabase
        .from("analysis")
        .select(
          "id, project_id, ndvi, risk, created_at, valid_geometry_pct, source_provider, satellite_product"
        )
        .in("project_id", projectIds)
        .order("created_at", {
          ascending: false,
        }),

      authSupabase
        .from("aegris_recommendations")
        .select(
          "id, project_id, analysis_id, priority, score, created_at"
        )
        .in("project_id", projectIds)
        .order("created_at", {
          ascending: false,
        }),

      authSupabase
        .from("aegris_alerts")
        .select(
          "id, project_id, analysis_id, level, priority, title, is_read, created_at"
        )
        .in("project_id", projectIds)
        .order("created_at", {
          ascending: false,
        }),

      authSupabase
        .from("field_validations")
        .select(
          "id, project_id, analysis_id, validation_result, actual_cause, observed_at, validated_by, updated_at"
        )
        .in("project_id", projectIds)
        .order("updated_at", {
          ascending: false,
        }),
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

    if (validationsResult.error) {
      console.error(
        "DASHBOARD FIELD VALIDATIONS ERROR:",
        validationsResult.error
      );
    }

    const analyses =
      (analysesResult.data ??
        []) as AnalysisRow[];

    const recommendations =
      (recommendationsResult.data ??
        []) as RecommendationRow[];

    const alerts =
      (alertsResult.data ??
        []) as AlertRow[];

    const validations =
      (validationsResult.data ??
        []) as FieldValidationRow[];

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

    /*
     * Recommendation vážeme primárně na konkrétní
     * analysis_id. Tím se vyhneme tomu, že by dashboard
     * spojil poslední analýzu se starším/novějším
     * recommendation snapshotem stejného projektu.
     */
    const recommendationByAnalysis =
      new Map<number, RecommendationRow>();

    for (const recommendation of recommendations) {
      if (
        recommendation.analysis_id != null &&
        !recommendationByAnalysis.has(
          recommendation.analysis_id
        )
      ) {
        recommendationByAnalysis.set(
          recommendation.analysis_id,
          recommendation
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
      if (
        alert.is_read === false ||
        alert.is_read === null
      ) {
        unreadAlertsByProject.set(
          alert.project_id,
          (unreadAlertsByProject.get(
            alert.project_id
          ) ?? 0) + 1
        );
      }
    }

    /*
     * Ground Truth je autoritativně vázán na
     * immutable analysis_id.
     *
     * Pro dashboard nás zajímá, zda poslední analýza
     * projektu už má alespoň jedno terénní ověření,
     * které je přihlášenému uživateli dostupné přes RLS.
     */
    const validationByAnalysis =
      new Map<number, FieldValidationRow>();

    for (const validation of validations) {
      if (
        !validationByAnalysis.has(
          validation.analysis_id
        )
      ) {
        validationByAnalysis.set(
          validation.analysis_id,
          validation
        );
      }
    }

    const dashboardProjects =
      projects.map((project) => {
        const latestAnalysis =
          latestAnalysisByProject.get(
            project.id
          ) ?? null;

        const latestRecommendation =
          latestAnalysis != null
            ? recommendationByAnalysis.get(
                latestAnalysis.id
              ) ??
              latestRecommendationByProject.get(
                project.id
              ) ??
              null
            : null;

        const latestFieldValidation =
          latestAnalysis != null
            ? validationByAnalysis.get(
                latestAnalysis.id
              ) ?? null
            : null;

        const ndvi =
          latestAnalysis != null
            ? Number(latestAnalysis.ndvi)
            : null;

        const validGeometryPct =
          latestAnalysis
            ?.valid_geometry_pct != null
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

                  risk:
                    latestAnalysis.risk,

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
                  id:
                    latestRecommendation.id,

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

          latestFieldValidation:
            latestFieldValidation != null
              ? {
                  id:
                    latestFieldValidation.id,

                  analysis_id:
                    latestFieldValidation.analysis_id,

                  validation_result:
                    latestFieldValidation.validation_result,

                  actual_cause:
                    latestFieldValidation.actual_cause,

                  observed_at:
                    latestFieldValidation.observed_at,

                  validated_by:
                    latestFieldValidation.validated_by,

                  updated_at:
                    latestFieldValidation.updated_at,
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
        project.latestRecommendation
          ?.priority === "Kritická" ||
        project.latestAnalysis?.risk ===
          "Kritické"
      ) {
        criticalProjectIds.add(
          project.id
        );
      }
    }

    const pendingFieldValidations =
      dashboardProjects.filter(
        (project) =>
          project.latestAnalysis != null &&
          project.latestFieldValidation == null
      ).length;

    const latestAnalysis =
      analyses.length > 0
        ? analyses[0]
        : null;

    const latestRecommendation =
      latestAnalysis != null
        ? recommendationByAnalysis.get(
            latestAnalysis.id
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

        // Každý projekt s alespoň jednou
        // uloženou analýzou má v pilotní
        // verzi dostupný report.
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

        pendingFieldValidations,
      },

      projects: dashboardProjects,

      latestAnalysis:
        latestAnalysis != null
          ? {
              project:
                latestProject != null
                  ? {
                      id:
                        latestProject.id,

                      name:
                        latestProject.name,
                    }
                  : null,

              analysis: {
                id:
                  latestAnalysis.id,

                ndvi:
                  Number(
                    latestAnalysis.ndvi
                  ),

                risk:
                  latestAnalysis.risk,

                created_at:
                  latestAnalysis.created_at,

                valid_geometry_pct:
                  latestAnalysis
                    .valid_geometry_pct != null
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