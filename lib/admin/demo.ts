import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminDemoRequest = {
  id: number;
  fullName: string | null;
  company: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  userId: string | null;
  approvedAt: string | null;
  processingStartedAt: string | null;

  matchedUserId: string | null;
  accountType: string | null;
  demoStartedAt: string | null;
  demoExpiresAt: string | null;

  daysRemaining: number | null;
  isActive: boolean;
  isExpired: boolean;
};

export type AdminDemoOverview = {
  totalRequests: number;
  contactedRequests: number;
  activeDemos: number;
  expiredDemos: number;
  demoProfilesTotal: number;
  requests: AdminDemoRequest[];
};

function normalizeEmail(
  email: string | null | undefined
) {
  return email?.trim().toLowerCase() ?? "";
}

function getDemoState(
  demoStartedAt: string | null,
  demoExpiresAt: string | null
) {
  if (!demoExpiresAt) {
    return {
      daysRemaining: null,
      isActive: false,
      isExpired: false,
    };
  }

  const expiresAt = Date.parse(demoExpiresAt);

  if (!Number.isFinite(expiresAt)) {
    return {
      daysRemaining: null,
      isActive: false,
      isExpired: false,
    };
  }

  const now = Date.now();
  const diffMs = expiresAt - now;

  const daysRemaining =
    diffMs > 0
      ? Math.ceil(
          diffMs / (24 * 60 * 60 * 1000)
        )
      : 0;

  return {
    daysRemaining,
    isActive:
      Boolean(demoStartedAt) &&
      expiresAt > now,
    isExpired:
      expiresAt <= now,
  };
}

export async function getAdminDemoOverview(): Promise<AdminDemoOverview> {
  const [
    requestsResult,
    profilesResult,
    usersResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("demo_requests")
      .select(
        `
          id,
          full_name,
          company,
          email,
          phone,
          message,
          status,
          created_at,
          user_id,
          approved_at,
          processing_started_at
        `
      )
      .order("created_at", {
        ascending: false,
      }),

    supabaseAdmin
      .from("profiles")
      .select(
        `
          id,
          account_type,
          demo_started_at,
          demo_expires_at
        `
      ),

    supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    }),
  ]);

  if (requestsResult.error) {
    console.error(
      "ADMIN DEMO REQUESTS ERROR:",
      requestsResult.error
    );

    throw new Error(
      "Nepodařilo se načíst DEMO žádosti."
    );
  }

  if (profilesResult.error) {
    console.error(
      "ADMIN DEMO PROFILES ERROR:",
      profilesResult.error
    );

    throw new Error(
      "Nepodařilo se načíst DEMO profily."
    );
  }

  if (usersResult.error) {
    console.error(
      "ADMIN DEMO USERS ERROR:",
      usersResult.error
    );

    throw new Error(
      "Nepodařilo se načíst uživatele pro DEMO přehled."
    );
  }

  const profiles =
    profilesResult.data ?? [];

  const users =
    usersResult.data.users ?? [];

  const profilesByUserId = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ])
  );

  const userIdByEmail = new Map(
    users
      .filter((user) => user.email)
      .map((user) => [
        normalizeEmail(user.email),
        user.id,
      ])
  );

  const requests: AdminDemoRequest[] =
    (requestsResult.data ?? []).map(
      (request) => {
        const matchedUserId =
          request.user_id ??
          userIdByEmail.get(
            normalizeEmail(request.email)
          ) ??
          null;

        const profile =
          matchedUserId
            ? profilesByUserId.get(
                matchedUserId
              )
            : undefined;

        const demoState = getDemoState(
          profile?.demo_started_at ?? null,
          profile?.demo_expires_at ?? null
        );

        return {
          id: request.id,
          fullName:
            request.full_name,
          company:
            request.company,
          email:
            request.email,
          phone:
            request.phone,
          message:
            request.message,
          status:
            request.status,
          createdAt:
            request.created_at,
          userId:
            request.user_id,
          approvedAt:
            request.approved_at,
          processingStartedAt:
            request.processing_started_at,

          matchedUserId,

          accountType:
            profile?.account_type ?? null,

          demoStartedAt:
            profile?.demo_started_at ??
            null,

          demoExpiresAt:
            profile?.demo_expires_at ??
            null,

          daysRemaining:
            demoState.daysRemaining,

          isActive:
            profile?.account_type ===
              "demo" &&
            demoState.isActive,

          isExpired:
            profile?.account_type ===
              "demo" &&
            demoState.isExpired,
        };
      }
    );

  const contactedRequests =
    requests.filter(
      (request) =>
        request.status === "contacted"
    ).length;

  const activeDemos =
    profiles.filter((profile) => {
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
        expiresAt > Date.now()
      );
    }).length;

  const expiredDemos =
    profiles.filter((profile) => {
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
        expiresAt <= Date.now()
      );
    }).length;

  const demoProfilesTotal =
    profiles.filter(
      (profile) =>
        profile.account_type === "demo"
    ).length;

  return {
    totalRequests: requests.length,
    contactedRequests,
    activeDemos,
    expiredDemos,
    demoProfilesTotal,
    requests,
  };
}