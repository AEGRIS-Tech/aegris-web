import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminCustomerProject = {
  id: string;
  name: string | null;
  areaHa: number;
};

export type AdminCustomerDetail = {
  id: string;
  email: string | null;
  accountType: string;
  systemRole: string;
  demoStartedAt: string | null;
  demoExpiresAt: string | null;
  createdAt: string | null;
  projects: AdminCustomerProject[];
  projectsCount: number;
  totalAreaHa: number;
  analysesCount: number;
};

export async function getAdminCustomerDetail(
  customerId: string
): Promise<AdminCustomerDetail | null> {
  const [
    userResult,
    profileResult,
    projectsResult,
  ] = await Promise.all([
    supabaseAdmin.auth.admin.getUserById(
      customerId
    ),

    supabaseAdmin
      .from("profiles")
      .select(
        "id, account_type, system_role, demo_started_at, demo_expires_at"
      )
      .eq("id", customerId)
      .maybeSingle(),

    supabaseAdmin
      .from("projects")
      .select("id, name, area_ha")
      .eq("user_id", customerId)
      .order("name", {
        ascending: true,
      }),
  ]);

  if (userResult.error) {
    console.error(
      "ADMIN CUSTOMER USER ERROR:",
      userResult.error
    );

    return null;
  }

  if (profileResult.error) {
    console.error(
      "ADMIN CUSTOMER PROFILE ERROR:",
      profileResult.error
    );

    throw new Error(
      "Nepodařilo se načíst profil zákazníka."
    );
  }

  if (!profileResult.data) {
    return null;
  }

  if (projectsResult.error) {
    console.error(
      "ADMIN CUSTOMER PROJECTS ERROR:",
      projectsResult.error
    );

    throw new Error(
      "Nepodařilo se načíst projekty zákazníka."
    );
  }

  const projects = (
    projectsResult.data ?? []
  ).map((project) => ({
    id: String(project.id),
    name: project.name,
    areaHa: Number.isFinite(
      Number(project.area_ha)
    )
      ? Number(project.area_ha)
      : 0,
  }));

  const totalAreaHa = projects.reduce(
    (sum, project) =>
      sum + project.areaHa,
    0
  );

  let analysesCount = 0;

  if (projects.length > 0) {
    const projectIds = projects.map(
      (project) => project.id
    );

    const analysesResult = await supabaseAdmin
      .from("analysis")
      .select("id", {
        count: "exact",
        head: true,
      })
      .in("project_id", projectIds);

    if (analysesResult.error) {
      console.error(
        "ADMIN CUSTOMER ANALYSES ERROR:",
        analysesResult.error
      );

      throw new Error(
        "Nepodařilo se načíst analýzy zákazníka."
      );
    }

    analysesCount =
      analysesResult.count ?? 0;
  }

  return {
    id: profileResult.data.id,
    email:
      userResult.data.user.email ?? null,
    accountType:
      profileResult.data.account_type,
    systemRole:
      profileResult.data.system_role,
    demoStartedAt:
      profileResult.data.demo_started_at,
    demoExpiresAt:
      profileResult.data.demo_expires_at,
    createdAt:
      userResult.data.user.created_at ?? null,
    projects,
    projectsCount: projects.length,
    totalAreaHa,
    analysesCount,
  };
}