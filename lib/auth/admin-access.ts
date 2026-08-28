import type {
  SupabaseClient,
  User,
} from "@supabase/supabase-js";

type AdminProfile = {
  account_type: string;
  system_role: string;
  demo_started_at: string | null;
  demo_expires_at: string | null;
};

export type AdminAccessResult =
  | {
      ok: true;
      user: User;
      profile: AdminProfile;
    }
  | {
      ok: false;
      status: 401 | 403 | 500;
      code:
        | "UNAUTHENTICATED"
        | "PROFILE_UNAVAILABLE"
        | "ADMIN_REQUIRED";
      message: string;
    };

export async function requireAdminAccess(
  supabase: SupabaseClient
): Promise<AdminAccessResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      status: 401,
      code: "UNAUTHENTICATED",
      message: "Uživatel není přihlášen.",
    };
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "account_type, system_role, demo_started_at, demo_expires_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    console.error(
      "ADMIN ACCESS PROFILE ERROR:",
      profileError
    );

    return {
      ok: false,
      status: 500,
      code: "PROFILE_UNAVAILABLE",
      message:
        "Administrátorský přístup se nepodařilo ověřit.",
    };
  }

  if (profile.system_role !== "admin") {
    return {
      ok: false,
      status: 403,
      code: "ADMIN_REQUIRED",
      message:
        "Tento účet nemá oprávnění administrátora.",
    };
  }

  return {
    ok: true,
    user,
    profile,
  };
}