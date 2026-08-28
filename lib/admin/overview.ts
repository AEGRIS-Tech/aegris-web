import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminOverview = {
  customers: number;
  activeAccounts: number;
  activeDemos: number;
  demosEndingSoon: number;
  projects: number;
  totalAreaHa: number;
  analyses: number;
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const now = new Date();

  const soon = new Date(
    now.getTime() + 3 * 24 * 60 * 60 * 1000
  );

  const [
    profilesResult,
    projectsResult,
    analysesResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select(
        "id, account_type, demo_expires_at"
      ),

    supabaseAdmin
      .from("projects")
      .select("id, area_ha"),

    supabaseAdmin
      .from("analysis")
      .select("id"),
  ]);

  if (profilesResult.error) {
    console.error(
      "ADMIN OVERVIEW PROFILES ERROR:",
      profilesResult.error
    );

    throw new Error(
      "Nepodařilo se načíst zákaznické účty."
    );
  }

  if (projectsResult.error) {
    console.error(
      "ADMIN OVERVIEW PROJECTS ERROR:",
      projectsResult.error
    );

    throw new Error(
      "Nepodařilo se načíst projekty."
    );
  }

  if (analysesResult.error) {
    console.error(
      "ADMIN OVERVIEW ANALYSES ERROR:",
      analysesResult.error
    );

    throw new Error(
      "Nepodařilo se načíst analýzy."
    );
  }

  const profiles = profilesResult.data ?? [];
  const projects = projectsResult.data ?? [];
  const analyses = analysesResult.data ?? [];

  const activeAccounts = profiles.filter(
    (profile) =>
      profile.account_type === "active"
  ).length;

  const activeDemos = profiles.filter(
    (profile) => {
      if (
        profile.account_type !== "demo" ||
        !profile.demo_expires_at
      ) {
        return false;
      }

      const expiresAt = Date.parse(
        profile.demo_expires_at
      );

      return (
        Number.isFinite(expiresAt) &&
        expiresAt > now.getTime()
      );
    }
  ).length;

  const demosEndingSoon = profiles.filter(
    (profile) => {
      if (
        profile.account_type !== "demo" ||
        !profile.demo_expires_at
      ) {
        return false;
      }

      const expiresAt = Date.parse(
        profile.demo_expires_at
      );

      return (
        Number.isFinite(expiresAt) &&
        expiresAt > now.getTime() &&
        expiresAt <= soon.getTime()
      );
    }
  ).length;

  const totalAreaHa = projects.reduce(
    (sum, project) => {
      const area = Number(project.area_ha);

      if (!Number.isFinite(area)) {
        return sum;
      }

      return sum + area;
    },
    0
  );

  return {
    customers: profiles.length,
    activeAccounts,
    activeDemos,
    demosEndingSoon,
    projects: projects.length,
    totalAreaHa,
    analyses: analyses.length,
  };
}