import { NextResponse } from "next/server";

import { requireAccountAccess } from "@/lib/auth/account-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type OrganizationRole =
  | "owner"
  | "admin"
  | "member"
  | "viewer";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    /*
     * 1. Ověření přihlášení a přístupu k AEGRIS.
     */
    const access = await requireAccountAccess(supabase);

    if (!access.ok) {
      return NextResponse.json(
        {
          ok: false,
          code: access.code,
          message: access.message,
        },
        {
          status: access.status,
        }
      );
    }

    const user = access.user;

    /*
     * 2. Aktivní organizace se vždy bere ze serverově
     * ověřeného profilu uživatele.
     */
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("active_organization_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "ORGANIZATION MEMBERS PROFILE ERROR:",
        profileError
      );

      return NextResponse.json(
        {
          ok: false,
          code: "PROFILE_UNAVAILABLE",
          message:
            "Aktivní organizaci se nepodařilo ověřit.",
        },
        {
          status: 500,
        }
      );
    }

    if (!profile?.active_organization_id) {
      return NextResponse.json(
        {
          ok: false,
          code: "ORGANIZATION_UNAVAILABLE",
          message: "Účet nemá aktivní organizaci.",
        },
        {
          status: 409,
        }
      );
    }

    const organizationId =
      profile.active_organization_id;

    /*
     * 3. Ověříme, že uživatel je skutečně členem této
     * organizace.
     */
    const {
      data: currentMembership,
      error: currentMembershipError,
    } = await supabaseAdmin
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (currentMembershipError) {
      console.error(
        "ORGANIZATION MEMBERS CURRENT MEMBERSHIP ERROR:",
        currentMembershipError
      );

      return NextResponse.json(
        {
          ok: false,
          code: "MEMBERSHIP_UNAVAILABLE",
          message:
            "Členství v organizaci se nepodařilo ověřit.",
        },
        {
          status: 500,
        }
      );
    }

    if (!currentMembership) {
      return NextResponse.json(
        {
          ok: false,
          code: "MEMBERSHIP_REQUIRED",
          message:
            "Uživatel není členem aktivní organizace.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * 4. Načteme členy pouze aktivní organizace.
     */
    const {
      data: memberships,
      error: membershipsError,
    } = await supabaseAdmin
      .from("organization_members")
      .select(
        "id, user_id, role, created_at"
      )
      .eq("organization_id", organizationId)
      .order("created_at", {
        ascending: true,
      });

    if (membershipsError) {
      console.error(
        "ORGANIZATION MEMBERS LOAD ERROR:",
        membershipsError
      );

      return NextResponse.json(
        {
          ok: false,
          code: "MEMBERS_LOAD_FAILED",
          message:
            "Členy organizace se nepodařilo načíst.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * 5. E-mail je uložený v auth.users.
     *
     * auth.users klientovi nikdy přímo neotevíráme.
     * E-mail každého člena načteme přes serverový
     * Supabase Admin klient.
     */
    const members = await Promise.all(
      (memberships ?? []).map(
        async (membership) => {
          const {
            data: authUserResult,
            error: authUserError,
          } =
            await supabaseAdmin.auth.admin.getUserById(
              membership.user_id
            );

          if (authUserError) {
            console.error(
              "ORGANIZATION MEMBER AUTH USER ERROR:",
              membership.user_id,
              authUserError
            );
          }

          return {
            id: membership.id,
            userId: membership.user_id,
            email:
              authUserResult?.user?.email ?? null,
            role:
              membership.role as OrganizationRole,
            createdAt: membership.created_at,
            isCurrentUser:
              membership.user_id === user.id,
          };
        }
      )
    );

    return NextResponse.json({
      ok: true,
      organizationId,
      currentUserRole:
        currentMembership.role as OrganizationRole,
      members,
    });
  } catch (error) {
    console.error(
      "ORGANIZATION MEMBERS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "Při načítání členů organizace došlo k neočekávané chybě.",
      },
      {
        status: 500,
      }
    );
  }
}