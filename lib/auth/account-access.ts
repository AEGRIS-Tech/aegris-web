import type {
  SupabaseClient,
  User,
} from "@supabase/supabase-js";

type AccountProfile = {
  account_type: string;
  demo_started_at: string | null;
  demo_expires_at: string | null;
};

export type AccountAccessResult =
  | {
      ok: true;
      user: User;
      profile: AccountProfile;
    }
  | {
      ok: false;
      status: 401 | 403 | 500;
      code:
        | "UNAUTHENTICATED"
        | "PROFILE_UNAVAILABLE"
        | "ACCOUNT_TYPE_INVALID"
        | "DEMO_EXPIRED";
      message: string;
    };

export async function requireAccountAccess(
  supabase: SupabaseClient
): Promise<AccountAccessResult> {
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
      "account_type, demo_started_at, demo_expires_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    console.error(
      "ACCOUNT ACCESS PROFILE ERROR:",
      profileError
    );

    return {
      ok: false,
      status: 500,
      code: "PROFILE_UNAVAILABLE",
      message:
        "Přístup k účtu se nepodařilo ověřit.",
    };
  }

  const accountType = profile.account_type;

  if (accountType === "active") {
    return {
      ok: true,
      user,
      profile,
    };
  }

  if (accountType === "demo") {
    if (!profile.demo_expires_at) {
      return {
        ok: false,
        status: 403,
        code: "DEMO_EXPIRED",
        message:
          "Platnost demo přístupu skončila.",
      };
    }

    const expiresAt =
      Date.parse(profile.demo_expires_at);

    if (
      !Number.isFinite(expiresAt) ||
      expiresAt <= Date.now()
    ) {
      return {
        ok: false,
        status: 403,
        code: "DEMO_EXPIRED",
        message:
          "Platnost demo přístupu skončila.",
      };
    }

    return {
      ok: true,
      user,
      profile,
    };
  }

  return {
    ok: false,
    status: 403,
    code: "ACCOUNT_TYPE_INVALID",
    message:
      "Účet nemá povolený přístup.",
  };
}
