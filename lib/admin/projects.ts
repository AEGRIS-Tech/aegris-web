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

export type AdminProjectAnalysis = {
  id: number;
  ndvi: number | null;
  risk: string | null;
  createdAt: string | null;
};

export type AdminProjectRecommendation = {
  id: number;
  level: string | null;
  priority: string | null;
  score: number | null;
  summary: string | null;
  recommendation: string | null;
  createdAt: string | null;
};

export type AdminProjectAlert = {
  id: number;
  level: string | null;
  priority: string | null;
  title: string | null;
  message: string | null;
  isRead: boolean;
  createdAt: string | null;
};

export type AdminProjectDetail = {
  id: string;
  name: string | null;
  ownerId: string | null;
  ownerEmail: string | null;
  organizationId: string | null;
  organizationName: string | null;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
  areaHa: number | null;
  cropName: string | null;
  cropVariety: string | null;
  growthStage: string | null;
  sowingDate: string | null;
  expectedHarvestDate: string | null;
  farmingMethod: string | null;
  createdAt: string | null;
  analysesCount: number;
  recommendationsCount: number;
  alertsCount: number;
  unreadAlertsCount: number;
  recentAnalyses: AdminProjectAnalysis[];
  recentRecommendations: AdminProjectRecommendation[];
  recentAlerts: AdminProjectAlert[];
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

export async function getAdminProjectDetail(
  projectId: string
): Promise<AdminProjectDetail | null> {
  const numericProjectId = Number(projectId);

  if (
    !Number.isInteger(numericProjectId) ||
    numericProjectId <= 0
  ) {
    return null;
  }

  const projectResult = await supabaseAdmin
    .from("projects")
    .select(
      `
        id,
        name,
        user_id,
        organization_id,
        status,
        latitude,
        longitude,
        area_ha,
        crop_name,
        crop_variety,
        growth_stage,
        sowing_date,
        expected_harvest_date,
        farming_method,
        created_at
      `
    )
    .eq("id", numericProjectId)
    .maybeSingle();

  if (projectResult.error) {
    console.error(
      "ADMIN PROJECT DETAIL ERROR:",
      projectResult.error
    );

    throw new Error(
      "Nepodařilo se načíst detail projektu."
    );
  }

  if (!projectResult.data) {
    return null;
  }

  const project = projectResult.data;

  const [
    analysesResult,
    recommendationsResult,
    alertsResult,
    organizationResult,
    ownerResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("analysis")
      .select("id, ndvi, risk, created_at")
      .eq("project_id", numericProjectId)
      .order("created_at", { ascending: false })
      .limit(10),

    supabaseAdmin
      .from("aegris_recommendations")
      .select(
        "id, level, priority, score, summary, recommendation, created_at"
      )
      .eq("project_id", numericProjectId)
      .order("created_at", { ascending: false })
      .limit(10),

    supabaseAdmin
      .from("aegris_alerts")
      .select(
        "id, level, priority, title, message, is_read, created_at"
      )
      .eq("project_id", numericProjectId)
      .order("created_at", { ascending: false })
      .limit(20),

    project.organization_id
      ? supabaseAdmin
          .from("organizations")
          .select("id, name")
          .eq("id", project.organization_id)
          .maybeSingle()
      : Promise.resolve({
          data: null,
          error: null,
        }),

    project.user_id
      ? supabaseAdmin.auth.admin.getUserById(
          project.user_id
        )
      : Promise.resolve({
          data: { user: null },
          error: null,
        }),
  ]);

  if (analysesResult.error) {
    console.error(
      "ADMIN PROJECT DETAIL ANALYSES ERROR:",
      analysesResult.error
    );
  }

  if (recommendationsResult.error) {
    console.error(
      "ADMIN PROJECT DETAIL RECOMMENDATIONS ERROR:",
      recommendationsResult.error
    );
  }

  if (alertsResult.error) {
    console.error(
      "ADMIN PROJECT DETAIL ALERTS ERROR:",
      alertsResult.error
    );
  }

  if (organizationResult.error) {
    console.error(
      "ADMIN PROJECT DETAIL ORGANIZATION ERROR:",
      organizationResult.error
    );
  }

  if (ownerResult.error) {
    console.error(
      "ADMIN PROJECT DETAIL OWNER ERROR:",
      ownerResult.error
    );
  }

  const recentAnalyses: AdminProjectAnalysis[] =
    (analysesResult.data ?? []).map((item) => ({
      id: Number(item.id),
      ndvi:
        item.ndvi === null
          ? null
          : Number(item.ndvi),
      risk: item.risk ?? null,
      createdAt: item.created_at ?? null,
    }));

  const recentRecommendations: AdminProjectRecommendation[] =
    (recommendationsResult.data ?? []).map((item) => ({
      id: Number(item.id),
      level: item.level ?? null,
      priority: item.priority ?? null,
      score:
        item.score === null
          ? null
          : Number(item.score),
      summary: item.summary ?? null,
      recommendation:
        item.recommendation ?? null,
      createdAt: item.created_at ?? null,
    }));

  const recentAlerts: AdminProjectAlert[] =
    (alertsResult.data ?? []).map((item) => ({
      id: Number(item.id),
      level: item.level ?? null,
      priority: item.priority ?? null,
      title: item.title ?? null,
      message: item.message ?? null,
      isRead: Boolean(item.is_read),
      createdAt: item.created_at ?? null,
    }));

  const allAnalysesCountResult =
    await supabaseAdmin
      .from("analysis")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("project_id", numericProjectId);

  const allRecommendationsCountResult =
    await supabaseAdmin
      .from("aegris_recommendations")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("project_id", numericProjectId);

  const allAlertsCountResult =
    await supabaseAdmin
      .from("aegris_alerts")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("project_id", numericProjectId);

  const unreadAlertsCountResult =
    await supabaseAdmin
      .from("aegris_alerts")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("project_id", numericProjectId)
      .eq("is_read", false);

  return {
    id: String(project.id),
    name: project.name ?? null,
    ownerId: project.user_id ?? null,
    ownerEmail:
      normalizeEmail(
        ownerResult.data?.user?.email
      ) || null,
    organizationId:
      project.organization_id ?? null,
    organizationName:
      organizationResult.data?.name ?? null,
    status: project.status ?? null,
    latitude:
      project.latitude === null
        ? null
        : Number(project.latitude),
    longitude:
      project.longitude === null
        ? null
        : Number(project.longitude),
    areaHa:
      project.area_ha === null
        ? null
        : Number(project.area_ha),
    cropName: project.crop_name ?? null,
    cropVariety:
      project.crop_variety ?? null,
    growthStage:
      project.growth_stage ?? null,
    sowingDate:
      project.sowing_date ?? null,
    expectedHarvestDate:
      project.expected_harvest_date ?? null,
    farmingMethod:
      project.farming_method ?? null,
    createdAt:
      project.created_at ?? null,
    analysesCount:
      allAnalysesCountResult.count ?? 0,
    recommendationsCount:
      allRecommendationsCountResult.count ?? 0,
    alertsCount:
      allAlertsCountResult.count ?? 0,
    unreadAlertsCount:
      unreadAlertsCountResult.count ?? 0,
    recentAnalyses,
    recentRecommendations,
    recentAlerts,
  };
}