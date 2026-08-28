import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminProject = {
  id: string;
  name: string | null;
  ownerId: string | null;
  ownerEmail: string | null;
  status: string | null;
  areaHa: number;
  cropName: string | null;
  growthStage: string | null;
  createdAt: string | null;
  analysesCount: number;
  lastAnalysisAt: string | null;
  lastRisk: string | null;
  lastNdvi: number | null;
};

export type AdminProjectsOverview = {
  totalProjects: number;
  totalAreaHa: number;
  projectsWithAnalyses: number;
  totalAnalyses: number;
  projects: AdminProject[];
};

function normalizeEmail(
  email: string | null | undefined
) {
  return email?.trim().toLowerCase() ?? "";
}

export async function getAdminProjectsOverview(): Promise<AdminProjectsOverview> {
  const [
    projectsResult,
    analysesResult,
    usersResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("projects")
      .select(
        `
          id,
          name,
          user_id,
          status,
          area_ha,
          crop_name,
          growth_stage,
          created_at
        `
      )
      .order("created_at", {
        ascending: false,
      }),

    supabaseAdmin
      .from("analysis")
      .select(
        `
          id,
          project_id,
          ndvi,
          risk,
          created_at
        `
      )
      .order("created_at", {
        ascending: false,
      }),

    supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),
  ]);

  if (projectsResult.error) {
    console.error(
      "ADMIN PROJECTS ERROR:",
      projectsResult.error
    );

    throw new Error(
      "Nepodařilo se načíst projekty."
    );
  }

  if (analysesResult.error) {
    console.error(
      "ADMIN PROJECT ANALYSES ERROR:",
      analysesResult.error
    );

    throw new Error(
      "Nepodařilo se načíst analýzy projektů."
    );
  }

  if (usersResult.error) {
    console.error(
      "ADMIN PROJECT USERS ERROR:",
      usersResult.error
    );

    throw new Error(
      "Nepodařilo se načíst uživatele projektů."
    );
  }

  const users =
    usersResult.data.users ?? [];

  const emailByUserId = new Map(
    users.map((user) => [
      user.id,
      normalizeEmail(user.email) || null,
    ])
  );

  const analysesByProjectId = new Map<
    string,
    {
      count: number;
      lastAnalysisAt: string | null;
      lastRisk: string | null;
      lastNdvi: number | null;
    }
  >();

  for (const analysis of analysesResult.data ?? []) {
    const projectId = String(
      analysis.project_id
    );

    const current =
      analysesByProjectId.get(projectId);

    if (!current) {
      analysesByProjectId.set(projectId, {
        count: 1,
        lastAnalysisAt:
          analysis.created_at ?? null,
        lastRisk:
          analysis.risk ?? null,
        lastNdvi:
          analysis.ndvi === null
            ? null
            : Number(analysis.ndvi),
      });

      continue;
    }

    current.count += 1;
  }

  const projects: AdminProject[] =
    (projectsResult.data ?? []).map((project) => {
      const projectId = String(project.id);

      const analysisData =
        analysesByProjectId.get(projectId);

      const areaHa = Number(
        project.area_ha
      );

      return {
        id: projectId,
        name:
          project.name ?? null,
        ownerId:
          project.user_id ?? null,
        ownerEmail:
          project.user_id
            ? emailByUserId.get(
                project.user_id
              ) ?? null
            : null,
        status:
          project.status ?? null,
        areaHa:
          Number.isFinite(areaHa)
            ? areaHa
            : 0,
        cropName:
          project.crop_name ?? null,
        growthStage:
          project.growth_stage ?? null,
        createdAt:
          project.created_at ?? null,
        analysesCount:
          analysisData?.count ?? 0,
        lastAnalysisAt:
          analysisData?.lastAnalysisAt ??
          null,
        lastRisk:
          analysisData?.lastRisk ?? null,
        lastNdvi:
          Number.isFinite(
            analysisData?.lastNdvi
          )
            ? analysisData?.lastNdvi ?? null
            : null,
      };
    });

  const totalAreaHa =
    projects.reduce(
      (sum, project) =>
        sum + project.areaHa,
      0
    );

  const totalAnalyses =
    projects.reduce(
      (sum, project) =>
        sum + project.analysesCount,
      0
    );

  const projectsWithAnalyses =
    projects.filter(
      (project) =>
        project.analysesCount > 0
    ).length;

  return {
    totalProjects:
      projects.length,
    totalAreaHa,
    projectsWithAnalyses,
    totalAnalyses,
    projects,
  };
}