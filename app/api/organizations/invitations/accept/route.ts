import { NextResponse } from "next/server";

import { requireAccountAccess } from "@/lib/auth/account-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type AcceptInvitationBody = {
  token?: unknown;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /*
     * 1. Uživatel musí být přihlášený a mít platný AEGRIS účet.
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
     * 2. Načtení tokenu z request body.
     */
    let body: AcceptInvitationBody;

    try {
      body = (await request.json()) as AcceptInvitationBody;
    } catch {
      return NextResponse.json(
        {
          ok: false,
          code: "INVALID_BODY",
          message: "Neplatná data požadavku.",
        },
        {
          status: 400,
        }
      );
    }

    if (typeof body.token !== "string") {
      return NextResponse.json(
        {
          ok: false,
          code: "TOKEN_REQUIRED",
          message: "Chybí token pozvánky.",
        },
        {
          status: 400,
        }
      );
    }

    const token = body.token.trim();

    if (token.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          code: "TOKEN_INVALID",
          message: "Token pozvánky není platný.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 3. Načtení pozvánky.
     */
    const {
      data: invitation,
      error: invitationError,
    } = await supabaseAdmin
      .from("organization_invitations")
      .select(
        "id, organization_id, email, role, status, expires_at, accepted_at, accepted_by"
      )
      .eq("token", token)
      .maybeSingle();

    if (invitationError) {
      console.error(
        "ORGANIZATION INVITATION ACCEPT LOAD ERROR:",
        invitationError
      );

      return NextResponse.json(
        {
          ok: false,
          code: "INVITATION_UNAVAILABLE",
          message: "Pozvánku se nepodařilo ověřit.",
        },
        {
          status: 500,
        }
      );
    }

    if (!invitation) {
      return NextResponse.json(
        {
          ok: false,
          code: "INVITATION_NOT_FOUND",
          message: "Pozvánka neexistuje nebo není platná.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * 4. Stav pozvánky.
     */
    if (invitation.status !== "pending") {
      return NextResponse.json(
        {
          ok: false,
          code: "INVITATION_NOT_PENDING",
          message: "Tato pozvánka už není aktivní.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * 5. Expirace.
     */
    const expiresAt = Date.parse(invitation.expires_at);

    if (
      !Number.isFinite(expiresAt) ||
      expiresAt <= Date.now()
    ) {
      const {
        error: expireError,
      } = await supabaseAdmin
        .from("organization_invitations")
        .update({
          status: "expired",
        })
        .eq("id", invitation.id)
        .eq("status", "pending");

      if (expireError) {
        console.error(
          "ORGANIZATION INVITATION ACCEPT EXPIRE ERROR:",
          expireError
        );
      }

      return NextResponse.json(
        {
          ok: false,
          code: "INVITATION_EXPIRED",
          message: "Platnost pozvánky vypršela.",
        },
        {
          status: 410,
        }
      );
    }

    /*
     * 6. Pozvánku smí přijmout pouze účet se stejným
     * e-mailem, na který byla vytvořena.
     */
    if (
      typeof user.email !== "string" ||
      normalizeEmail(user.email) !==
        normalizeEmail(invitation.email)
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "INVITATION_EMAIL_MISMATCH",
          message:
            "Tato pozvánka je určena pro jiný uživatelský účet.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * 7. Zkontrolujeme, zda už členství neexistuje.
     */
    const {
      data: existingMembership,
      error: membershipCheckError,
    } = await supabaseAdmin
      .from("organization_members")
      .select("id, role")
      .eq(
        "organization_id",
        invitation.organization_id
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipCheckError) {
      console.error(
        "ORGANIZATION INVITATION ACCEPT MEMBERSHIP CHECK ERROR:",
        membershipCheckError
      );

      return NextResponse.json(
        {
          ok: false,
          code: "MEMBERSHIP_CHECK_FAILED",
          message:
            "Existující členství se nepodařilo ověřit.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Pokud už členem je, nepřidáváme duplicitu.
     * Pouze uzavřeme invitation jako accepted.
     */
    if (existingMembership) {
      const {
        error: invitationUpdateError,
      } = await supabaseAdmin
        .from("organization_invitations")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
          accepted_by: user.id,
        })
        .eq("id", invitation.id)
        .eq("status", "pending");

      if (invitationUpdateError) {
        console.error(
          "ORGANIZATION INVITATION ACCEPT EXISTING MEMBER UPDATE ERROR:",
          invitationUpdateError
        );

        return NextResponse.json(
          {
            ok: false,
            code: "INVITATION_ACCEPT_FAILED",
            message:
              "Pozvánku se nepodařilo dokončit.",
          },
          {
            status: 500,
          }
        );
      }

      /*
       * Aktivní organizaci nastavíme i v tomto případě.
       */
      const {
        error: profileUpdateError,
      } = await supabaseAdmin
        .from("profiles")
        .update({
          active_organization_id:
            invitation.organization_id,
        })
        .eq("id", user.id);

      if (profileUpdateError) {
        console.error(
          "ORGANIZATION INVITATION ACCEPT PROFILE UPDATE ERROR:",
          profileUpdateError
        );

        return NextResponse.json(
          {
            ok: false,
            code: "ACTIVE_ORGANIZATION_UPDATE_FAILED",
            message:
              "Aktivní organizaci se nepodařilo nastavit.",
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json({
        ok: true,
        organizationId:
          invitation.organization_id,
        role: existingMembership.role,
        alreadyMember: true,
      });
    }

    /*
     * 8. Vytvoření členství.
     */
    const {
      data: membership,
      error: membershipInsertError,
    } = await supabaseAdmin
      .from("organization_members")
      .insert({
        organization_id:
          invitation.organization_id,
        user_id: user.id,
        role: invitation.role,
      })
      .select("id, role")
      .single();

    if (membershipInsertError) {
      /*
       * DB UNIQUE constraint je poslední ochrana
       * proti souběžnému přijetí.
       */
      if (
        membershipInsertError.code !== "23505"
      ) {
        console.error(
          "ORGANIZATION INVITATION ACCEPT MEMBERSHIP INSERT ERROR:",
          membershipInsertError
        );

        return NextResponse.json(
          {
            ok: false,
            code: "MEMBERSHIP_CREATE_FAILED",
            message:
              "Členství v organizaci se nepodařilo vytvořit.",
          },
          {
            status: 500,
          }
        );
      }
    }

    /*
     * 9. Nastavení aktivní organizace.
     */
    const {
      error: profileUpdateError,
    } = await supabaseAdmin
      .from("profiles")
      .update({
        active_organization_id:
          invitation.organization_id,
      })
      .eq("id", user.id);

    if (profileUpdateError) {
      console.error(
        "ORGANIZATION INVITATION ACCEPT PROFILE UPDATE ERROR:",
        profileUpdateError
      );

      return NextResponse.json(
        {
          ok: false,
          code: "ACTIVE_ORGANIZATION_UPDATE_FAILED",
          message:
            "Aktivní organizaci se nepodařilo nastavit.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * 10. Označení invitation jako accepted.
     */
    const {
      error: invitationUpdateError,
    } = await supabaseAdmin
      .from("organization_invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        accepted_by: user.id,
      })
      .eq("id", invitation.id)
      .eq("status", "pending");

    if (invitationUpdateError) {
      console.error(
        "ORGANIZATION INVITATION ACCEPT UPDATE ERROR:",
        invitationUpdateError
      );

      return NextResponse.json(
        {
          ok: false,
          code: "INVITATION_ACCEPT_FAILED",
          message:
            "Pozvánku se nepodařilo dokončit.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        organizationId:
          invitation.organization_id,
        role:
          membership?.role ??
          invitation.role,
        alreadyMember: false,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "ORGANIZATION INVITATION ACCEPT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "Při přijímání pozvánky došlo k neočekávané chybě.",
      },
      {
        status: 500,
      }
    );
  }
}