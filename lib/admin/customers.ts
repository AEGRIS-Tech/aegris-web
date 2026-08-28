import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminCustomer = {
  id: string;
  email: string | null;
  accountType: string;
  systemRole: string;
  demoStartedAt: string | null;
  demoExpiresAt: string | null;
  projectsCount: number;
};

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  const [
    usersResult,
    profilesResult,
    projectsResult,
  ] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),

    supabaseAdmin
      .from("profiles")
      .select(
        "id, account_type, system_role, demo_started_at, demo_expires_at"
      ),

    supabaseAdmin
      .from("projects")
      .select("id, user_id"),
  ]);

  if (usersResult.error) {
    console.error(
      "ADMIN CUSTOMERS USERS ERROR:",
      usersResult.error
    );

    throw new Error(
      "Nepodařilo se načíst uživatele."
    );
  }

  if (profilesResult.error) {
    console.error(
      "ADMIN CUSTOMERS PROFILES ERROR:",
      profilesResult.error
    );

    throw new Error(
      "Nepodařilo se načíst profily."
    );
  }

  if (projectsResult.error) {
    console.error(
      "ADMIN CUSTOMERS PROJECTS ERROR:",
      projectsResult.error
    );

    throw new Error(
      "Nepodařilo se načíst projekty."
    );
  }

  const users = usersResult.data.users ?? [];
  const profiles = profilesResult.data ?? [];
  const projects = projectsResult.data ?? [];

  const emailByUserId = new Map(
    users.map((user) => [
      user.id,
      user.email ?? null,
    ])
  );

  const projectCounts = new Map<string, number>();

  for (const project of projects) {
    if (!project.user_id) {
      continue;
    }

    const current =
      projectCounts.get(project.user_id) ?? 0;

    projectCounts.set(
      project.user_id,
      current + 1
    );
  }

  return profiles
    .map((profile) => ({
      id: profile.id,
      email:
        emailByUserId.get(profile.id) ?? null,
      accountType:
        profile.account_type,
      systemRole:
        profile.system_role,
      demoStartedAt:
        profile.demo_started_at,
      demoExpiresAt:
        profile.demo_expires_at,
      projectsCount:
        projectCounts.get(profile.id) ?? 0,
    }))
    .sort((a, b) => {
      const emailA =
        a.email?.toLowerCase() ?? "";
      const emailB =
        b.email?.toLowerCase() ?? "";

      return emailA.localeCompare(emailB);
    });
}