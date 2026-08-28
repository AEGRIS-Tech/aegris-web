import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminAnalysis = {
  id: string;
  projectId: string;
  projectName: string | null;
  ownerId: string | null;
  ownerEmail: string | null;
  ndvi: number | null;
  vegetation: number | null;
  risk: string | null;
  createdAt: string | null;
  periodFrom: string | null;
  periodTo: string | null;
  sourceProvider: string | null;
  satellite: string | null;
  satelliteProduct: string | null;
  validGeometryPct: number | null;
  qualityGatePct: number | null;
  medianNdvi: number | null;
  p05Ndvi: number | null;
  p95Ndvi: number | null;
};

export type AdminAnalysesOverview = {
  totalAnalyses: number;
  analysesToday: number;
  analysesLast7Days: number;
  highRiskAnalyses: number;
  projectsAnalysed: number;
  analyses: AdminAnalysis[];
};

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function isHighRisk(value: string | null) {
  if (!value) {
    return false;
  }

  const normalized = value
    .trim()
    .toLowerCase();

  return (
    normalized.includes("high") ||
    normalized.includes("critical") ||
    normalized.includes("vysok") ||
    normalized.includes("krit")
  );
}

export async function getAdminAnalysesOverview(): Promise<AdminAnalysesOverview> {
  const [
    analysesResult,
    projectsResult,
    usersResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("analysis")
      .select(
        `
          id,
          project_id,
          ndvi,
          vegetation,
          risk,
          created_at,
          period_from,
          period_to,
          source_provider,
          satellite,
          satellite_product,
          valid_geometry_pct,
          quality_gate_pct,
          median_ndvi,
          p05_ndvi,
          p95_ndvi
        `
      )
      .order("created_at", {
        ascending: false,
      }),

    supabaseAdmin
      .from("projects")
      .select(
        `
          id,
          name,
          user_id
        `
      ),

    supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),
  ]);

  if (analysesResult.error) {
    console.error(
      "ADMIN ANALYSES ERROR:",
      analysesResult.error
    );

    throw new Error(
      "Nepodařilo se načíst analýzy."
    );
  }

  if (projectsResult.error) {
    console.error(
      "ADMIN ANALYSES PROJECTS ERROR:",
      projectsResult.error
    );

    throw new Error(
      "Nepodařilo se načíst projekty analýz."
    );
  }

  if (usersResult.error) {
    console.error(
      "ADMIN ANALYSES USERS ERROR:",
      usersResult.error
    );

    throw new Error(
      "Nepodařilo se načíst vlastníky projektů."
    );
  }

  const projectsById = new Map(
    (projectsResult.data ?? []).map(
      (project) => [
        String(project.id),
        project,
      ]
    )
  );

  const emailByUserId = new Map(
    (usersResult.data.users ?? []).map(
      (user) => [
        user.id,
        user.email ?? null,
      ]
    )
  );

  const analyses: AdminAnalysis[] =
    (analysesResult.data ?? []).map(
      (analysis) => {
        const projectId = String(
          analysis.project_id
        );

        const project =
          projectsById.get(projectId);

        const ownerId =
          project?.user_id ?? null;

        return {
          id: String(analysis.id),
          projectId,
          projectName:
            project?.name ?? null,
          ownerId,
          ownerEmail:
            ownerId
              ? emailByUserId.get(ownerId) ??
                null
              : null,

          ndvi: toNumber(
            analysis.ndvi
          ),

          vegetation: toNumber(
            analysis.vegetation
          ),

          risk:
            analysis.risk ?? null,

          createdAt:
            analysis.created_at ?? null,

          periodFrom:
            analysis.period_from ?? null,

          periodTo:
            analysis.period_to ?? null,

          sourceProvider:
            analysis.source_provider ??
            null,

          satellite:
            analysis.satellite ?? null,

          satelliteProduct:
            analysis.satellite_product ??
            null,

          validGeometryPct:
            toNumber(
              analysis.valid_geometry_pct
            ),

          qualityGatePct:
            toNumber(
              analysis.quality_gate_pct
            ),

          medianNdvi:
            toNumber(
              analysis.median_ndvi
            ),

          p05Ndvi:
            toNumber(
              analysis.p05_ndvi
            ),

          p95Ndvi:
            toNumber(
              analysis.p95_ndvi
            ),
        };
      }
    );

  const now = new Date();

  const todayStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

  const sevenDaysAgo =
    Date.now() -
    7 * 24 * 60 * 60 * 1000;

  const analysesToday =
    analyses.filter((analysis) => {
      if (!analysis.createdAt) {
        return false;
      }

      const timestamp = Date.parse(
        analysis.createdAt
      );

      return (
        Number.isFinite(timestamp) &&
        timestamp >= todayStart
      );
    }).length;

  const analysesLast7Days =
    analyses.filter((analysis) => {
      if (!analysis.createdAt) {
        return false;
      }

      const timestamp = Date.parse(
        analysis.createdAt
      );

      return (
        Number.isFinite(timestamp) &&
        timestamp >= sevenDaysAgo
      );
    }).length;

  const highRiskAnalyses =
    analyses.filter((analysis) =>
      isHighRisk(analysis.risk)
    ).length;

  const projectsAnalysed =
    new Set(
      analyses.map(
        (analysis) =>
          analysis.projectId
      )
    ).size;

  return {
    totalAnalyses:
      analyses.length,

    analysesToday,

    analysesLast7Days,

    highRiskAnalyses,

    projectsAnalysed,

    analyses,
  };
}