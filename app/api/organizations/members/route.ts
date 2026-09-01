import { NextResponse } from "next/server";

import { requireAccountAccess } from "@/lib/auth/account-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type OrganizationRole =
  | "owner"
  | "admin"
  | "member"
  | "viewer";

type MutableOrganizationRole =
  | "admin"
  | "member"
  | "viewer";

type UpdateMemberBody = {
  membershipId?: unknown;
  role?: unknown;
};

type RemoveMemberBody = {
  membershipId?: unknown;
};

type UpdateMemberRoleRpcResult = {
  ok: boolean;
  code: string;
  previous_role: string | null;
  new_role: string | null;
};

type RemoveMemberRpcResult = {
  ok: boolean;
  code: string;
  removed_user_id: string | null;
  previous_role: string | null;
  active_organization_id: string | null;
};

const MUTABLE_ROLES =
  new Set<MutableOrganizationRole>([
    "admin",
    "member",
    "viewer",
  ]);

function isOrganizationRole(
  value: unknown
): value is OrganizationRole {
  return (
    value === "owner" ||
    value === "admin" ||
    value === "member" ||
    value === "viewer"
  );
}

function isMutableRole(
  value: unknown
): value is MutableOrganizationRole {
  return (
    typeof value === "string" &&
    MUTABLE_ROLES.has(
      value as MutableOrganizationRole
    )
  );
}

async function writeAuditLog({
  adminUserId,
  action,
  membershipId,
  metadata,
}: {
  adminUserId: string;
  action: string;
  membershipId: string;
  metadata: Record<string, unknown>;
}) {
  const { error } = await supabaseAdmin
    .from("admin_audit_log")
    .insert({
      admin_user_id: adminUserId,
      action,
      target_type: "organization_member",
      target_id: membershipId,
      metadata,
    });

  if (error) {
    console.error(
      "AEGRIS ORGANIZATION MEMBER AUDIT LOG FAILED:",
      {
        adminUserId,
        action,
        membershipId,
        error,
      }
    );

    return false;
  }

  return true;
}

// =========================================================
// GET
// =========================================================

export async function GET() {
  try {
    const supabase =
      await createServerSupabaseClient();

    const access =
      await requireAccountAccess(supabase);

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
          message:
            "Účet nemá aktivní organizaci.",
        },
        {
          status: 409,
        }
      );
    }

    const organizationId =
      profile.active_organization_id;

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

    if (
      !isOrganizationRole(
        currentMembership.role
      )
    ) {
      console.error(
        "ORGANIZATION MEMBERS INVALID CURRENT ROLE:",
        currentMembership.role
      );

      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_MEMBERSHIP_ROLE",
          message:
            "Role uživatele v organizaci je neplatná.",
        },
        {
          status: 500,
        }
      );
    }

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
              authUserResult?.user?.email ??
              null,
            role:
              membership.role as OrganizationRole,
            createdAt:
              membership.created_at,
            isCurrentUser:
              membership.user_id ===
              user.id,
          };
        }
      )
    );

    return NextResponse.json({
      ok: true,
      organizationId,
      currentUserRole:
        currentMembership.role,
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

// =========================================================
// PATCH
// Změna role člena
// =========================================================

export async function PATCH(
  request: Request
) {
  try {
    const supabase =
      await createServerSupabaseClient();

    const access =
      await requireAccountAccess(supabase);

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

    let body: UpdateMemberBody;

    try {
      body =
        (await request.json()) as UpdateMemberBody;
    } catch {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_BODY",
          message:
            "Neplatná data požadavku.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body.membershipId !==
        "string" ||
      body.membershipId.trim().length ===
        0
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "MEMBERSHIP_ID_REQUIRED",
          message:
            "Chybí identifikátor člena.",
        },
        {
          status: 400,
        }
      );
    }

    const membershipId =
      body.membershipId.trim();

    if (body.role === "owner") {
      return NextResponse.json(
        {
          ok: false,
          code: "OWNER_ROLE_FORBIDDEN",
          message:
            "Roli vlastníka nelze přidělit běžnou změnou role.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isMutableRole(body.role)) {
      return NextResponse.json(
        {
          ok: false,
          code: "ROLE_INVALID",
          message:
            "Vybraná role není povolena.",
        },
        {
          status: 400,
        }
      );
    }

    const newRole = body.role;

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
        "ORGANIZATION MEMBER UPDATE PROFILE ERROR:",
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
          message:
            "Účet nemá aktivní organizaci.",
        },
        {
          status: 409,
        }
      );
    }

    const organizationId =
      profile.active_organization_id;

    const {
      data: actorMembership,
      error: actorMembershipError,
    } = await supabaseAdmin
      .from("organization_members")
      .select("id, role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (actorMembershipError) {
      console.error(
        "ORGANIZATION MEMBER UPDATE ACTOR ERROR:",
        actorMembershipError
      );

      return NextResponse.json(
        {
          ok: false,
          code: "MEMBERSHIP_UNAVAILABLE",
          message:
            "Oprávnění v organizaci se nepodařilo ověřit.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !actorMembership ||
      !isOrganizationRole(
        actorMembership.role
      )
    ) {
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

    if (
      actorMembership.role !== "owner" &&
      actorMembership.role !== "admin"
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "INSUFFICIENT_ROLE",
          message:
            "Role členů může měnit pouze vlastník nebo administrátor organizace.",
        },
        {
          status: 403,
        }
      );
    }

    const {
      data: targetMembership,
      error: targetMembershipError,
    } = await supabaseAdmin
      .from("organization_members")
      .select("id, user_id, role")
      .eq("id", membershipId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (targetMembershipError) {
      console.error(
        "ORGANIZATION MEMBER UPDATE TARGET ERROR:",
        targetMembershipError
      );

      return NextResponse.json(
        {
          ok: false,
          code: "MEMBERSHIP_LOAD_FAILED",
          message:
            "Člena organizace se nepodařilo načíst.",
        },
        {
          status: 500,
        }
      );
    }

    if (!targetMembership) {
      return NextResponse.json(
        {
          ok: false,
          code: "MEMBERSHIP_NOT_FOUND",
          message:
            "Člen organizace nebyl nalezen.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      !isOrganizationRole(
        targetMembership.role
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_TARGET_ROLE",
          message:
            "Role cílového člena je neplatná.",
        },
        {
          status: 500,
        }
      );
    }

    // Vlastní roli přes tento endpoint neměníme.
    if (
      targetMembership.user_id ===
      user.id
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "SELF_ROLE_CHANGE_FORBIDDEN",
          message:
            "Vlastní roli nelze změnit přes správu členů.",
        },
        {
          status: 409,
        }
      );
    }

    // Admin nesmí manipulovat s ownerem ani adminem.
    if (
      actorMembership.role === "admin" &&
      (
        targetMembership.role ===
          "owner" ||
        targetMembership.role ===
          "admin"
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "TARGET_ROLE_PROTECTED",
          message:
            "Administrátor nemůže měnit vlastníka ani jiného administrátora.",
        },
        {
          status: 403,
        }
      );
    }

    // Admin nesmí vytvářet další adminy.
    if (
      actorMembership.role === "admin" &&
      newRole === "admin"
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "ADMIN_PROMOTION_FORBIDDEN",
          message:
            "Administrátora může určit pouze vlastník organizace.",
        },
        {
          status: 403,
        }
      );
    }

    const previousRole =
      targetMembership.role;

    const {
      data: rpcData,
      error: rpcError,
    } = await supabaseAdmin
      .rpc(
        "update_organization_member_role",
        {
          p_organization_id:
            organizationId,
          p_membership_id:
            membershipId,
          p_new_role: newRole,
        }
      )
      .single();

    if (rpcError) {
      console.error(
        "ORGANIZATION MEMBER UPDATE RPC ERROR:",
        rpcError
      );

      return NextResponse.json(
        {
          ok: false,
          code: "MEMBER_UPDATE_FAILED",
          message:
            "Roli člena se nepodařilo změnit.",
        },
        {
          status: 500,
        }
      );
    }

    const rpcResult =
      rpcData as UpdateMemberRoleRpcResult | null;

    if (!rpcResult?.ok) {
      if (
        rpcResult?.code ===
        "LAST_OWNER"
      ) {
        return NextResponse.json(
          {
            ok: false,
            code: "LAST_OWNER",
            message:
              "Poslednímu vlastníkovi organizace nelze odebrat roli vlastníka.",
          },
          {
            status: 409,
          }
        );
      }

      if (
        rpcResult?.code ===
        "MEMBERSHIP_NOT_FOUND"
      ) {
        return NextResponse.json(
          {
            ok: false,
            code: "MEMBERSHIP_NOT_FOUND",
            message:
              "Člen organizace již neexistuje.",
          },
          {
            status: 404,
          }
        );
      }

      if (
        rpcResult?.code ===
        "ORGANIZATION_NOT_FOUND"
      ) {
        return NextResponse.json(
          {
            ok: false,
            code: "ORGANIZATION_NOT_FOUND",
            message:
              "Organizace již neexistuje.",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          code:
            rpcResult?.code ??
            "MEMBER_UPDATE_FAILED",
          message:
            "Roli člena se nepodařilo změnit.",
        },
        {
          status: 409,
        }
      );
    }

    await writeAuditLog({
      adminUserId: user.id,
      action:
        "organization.member.role_change",
      membershipId,
      metadata: {
        organization_id:
          organizationId,
        target_user_id:
          targetMembership.user_id,
        actor_role:
          actorMembership.role,
        previous_role:
          rpcResult.previous_role ??
          previousRole,
        new_role:
          rpcResult.new_role ??
          newRole,
        result_code:
          rpcResult.code,
      },
    });

    return NextResponse.json({
      ok: true,
      membership: {
        id: membershipId,
        userId:
          targetMembership.user_id,
        previousRole:
          rpcResult.previous_role ??
          previousRole,
        role:
          rpcResult.new_role ??
          newRole,
      },
      code: rpcResult.code,
      message:
        rpcResult.code === "NO_CHANGE"
          ? "Člen již tuto roli má."
          : "Role člena byla změněna.",
    });
  } catch (error) {
    console.error(
      "ORGANIZATION MEMBER UPDATE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "Při změně role člena došlo k neočekávané chybě.",
      },
      {
        status: 500,
      }
    );
  }
}

// =========================================================
// DELETE
// Odebrání člena
// =========================================================

export async function DELETE(
  request: Request
) {
  try {
    const supabase =
      await createServerSupabaseClient();

    const access =
      await requireAccountAccess(supabase);

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

    let body: RemoveMemberBody;

    try {
      body =
        (await request.json()) as RemoveMemberBody;
    } catch {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_BODY",
          message:
            "Neplatná data požadavku.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body.membershipId !==
        "string" ||
      body.membershipId.trim().length ===
        0
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "MEMBERSHIP_ID_REQUIRED",
          message:
            "Chybí identifikátor člena.",
        },
        {
          status: 400,
        }
      );
    }

    const membershipId =
      body.membershipId.trim();

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
        "ORGANIZATION MEMBER REMOVE PROFILE ERROR:",
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
          message:
            "Účet nemá aktivní organizaci.",
        },
        {
          status: 409,
        }
      );
    }

    const organizationId =
      profile.active_organization_id;

    const {
      data: actorMembership,
      error: actorMembershipError,
    } = await supabaseAdmin
      .from("organization_members")
      .select("id, role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (actorMembershipError) {
      console.error(
        "ORGANIZATION MEMBER REMOVE ACTOR ERROR:",
        actorMembershipError
      );

      return NextResponse.json(
        {
          ok: false,
          code: "MEMBERSHIP_UNAVAILABLE",
          message:
            "Oprávnění v organizaci se nepodařilo ověřit.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !actorMembership ||
      !isOrganizationRole(
        actorMembership.role
      )
    ) {
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

    if (
      actorMembership.role !== "owner" &&
      actorMembership.role !== "admin"
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "INSUFFICIENT_ROLE",
          message:
            "Členy může odebírat pouze vlastník nebo administrátor organizace.",
        },
        {
          status: 403,
        }
      );
    }

    const {
      data: targetMembership,
      error: targetMembershipError,
    } = await supabaseAdmin
      .from("organization_members")
      .select("id, user_id, role")
      .eq("id", membershipId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (targetMembershipError) {
      console.error(
        "ORGANIZATION MEMBER REMOVE TARGET ERROR:",
        targetMembershipError
      );

      return NextResponse.json(
        {
          ok: false,
          code: "MEMBERSHIP_LOAD_FAILED",
          message:
            "Člena organizace se nepodařilo načíst.",
        },
        {
          status: 500,
        }
      );
    }

    if (!targetMembership) {
      return NextResponse.json(
        {
          ok: false,
          code: "MEMBERSHIP_NOT_FOUND",
          message:
            "Člen organizace nebyl nalezen.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      !isOrganizationRole(
        targetMembership.role
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_TARGET_ROLE",
          message:
            "Role cílového člena je neplatná.",
        },
        {
          status: 500,
        }
      );
    }

    // Vlastní membership přes tento endpoint nemažeme.
    if (
      targetMembership.user_id ===
      user.id
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "SELF_REMOVE_FORBIDDEN",
          message:
            "Vlastní účet nelze odebrat přes správu členů.",
        },
        {
          status: 409,
        }
      );
    }

    // Admin může odebrat jen member/viewer.
    if (
      actorMembership.role === "admin" &&
      (
        targetMembership.role ===
          "owner" ||
        targetMembership.role ===
          "admin"
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "TARGET_ROLE_PROTECTED",
          message:
            "Administrátor nemůže odebrat vlastníka ani jiného administrátora.",
        },
        {
          status: 403,
        }
      );
    }

    const {
      data: rpcData,
      error: rpcError,
    } = await supabaseAdmin
      .rpc(
        "remove_organization_member",
        {
          p_organization_id:
            organizationId,
          p_membership_id:
            membershipId,
        }
      )
      .single();

    if (rpcError) {
      console.error(
        "ORGANIZATION MEMBER REMOVE RPC ERROR:",
        rpcError
      );

      return NextResponse.json(
        {
          ok: false,
          code: "MEMBER_REMOVE_FAILED",
          message:
            "Člena se nepodařilo odebrat.",
        },
        {
          status: 500,
        }
      );
    }

    const rpcResult =
      rpcData as RemoveMemberRpcResult | null;

    if (!rpcResult?.ok) {
      if (
        rpcResult?.code ===
        "LAST_OWNER"
      ) {
        return NextResponse.json(
          {
            ok: false,
            code: "LAST_OWNER",
            message:
              "Posledního vlastníka organizace nelze odebrat.",
          },
          {
            status: 409,
          }
        );
      }

      if (
        rpcResult?.code ===
        "MEMBERSHIP_NOT_FOUND"
      ) {
        return NextResponse.json(
          {
            ok: false,
            code: "MEMBERSHIP_NOT_FOUND",
            message:
              "Člen organizace již neexistuje.",
          },
          {
            status: 404,
          }
        );
      }

      if (
        rpcResult?.code ===
        "ORGANIZATION_NOT_FOUND"
      ) {
        return NextResponse.json(
          {
            ok: false,
            code: "ORGANIZATION_NOT_FOUND",
            message:
              "Organizace již neexistuje.",
          },
          {
            status: 404,
          }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          code:
            rpcResult?.code ??
            "MEMBER_REMOVE_FAILED",
          message:
            "Člena se nepodařilo odebrat.",
        },
        {
          status: 409,
        }
      );
    }

    await writeAuditLog({
      adminUserId: user.id,
      action:
        "organization.member.remove",
      membershipId,
      metadata: {
        organization_id:
          organizationId,
        target_user_id:
          rpcResult.removed_user_id ??
          targetMembership.user_id,
        actor_role:
          actorMembership.role,
        previous_role:
          rpcResult.previous_role ??
          targetMembership.role,
        next_active_organization_id:
          rpcResult.active_organization_id ??
          null,
        result_code:
          rpcResult.code,
      },
    });

    return NextResponse.json({
      ok: true,
      removed: {
        membershipId,
        userId:
          rpcResult.removed_user_id ??
          targetMembership.user_id,
        previousRole:
          rpcResult.previous_role ??
          targetMembership.role,
        activeOrganizationId:
          rpcResult.active_organization_id ??
          null,
      },
      message:
        "Člen byl z organizace odebrán.",
    });
  } catch (error) {
    console.error(
      "ORGANIZATION MEMBER REMOVE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "Při odebírání člena došlo k neočekávané chybě.",
      },
      {
        status: 500,
      }
    );
  }
}