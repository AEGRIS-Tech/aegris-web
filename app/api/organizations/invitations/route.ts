import { NextResponse } from "next/server";

import { requireAccountAccess } from "@/lib/auth/account-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type InvitationRole = "admin" | "member" | "viewer";

type CreateInvitationBody = {
  email?: unknown;
  role?: unknown;
};

const ALLOWED_ROLES = new Set<InvitationRole>([
  "admin",
  "member",
  "viewer",
]);

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    /*
     * 1. Ověření přihlášení a platnosti AEGRIS účtu.
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
     * 2. Načtení a validace request body.
     */
    let body: CreateInvitationBody;

    try {
      body = (await request.json()) as CreateInvitationBody;
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

    if (typeof body.email !== "string") {
      return NextResponse.json(
        {
          ok: false,
          code: "EMAIL_REQUIRED",
          message: "Zadejte e-mail uživatele.",
        },
        {
          status: 400,
        }
      );
    }

    const email = normalizeEmail(body.email);

    if (
      email.length === 0 ||
      email.length > 320 ||
      !isValidEmail(email)
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "EMAIL_INVALID",
          message: "Zadejte platnou e-mailovou adresu.",
        },
        {
          status: 400,
        }
      );
    }

    const role =
      typeof body.role === "string"
        ? (body.role as InvitationRole)
        : "member";

    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json(
        {
          ok: false,
          code: "ROLE_INVALID",
          message: "Vybraná role není povolena.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Owner se přes běžnou pozvánku nikdy nevytváří.
     */
    if (body.role === "owner") {
      return NextResponse.json(
        {
          ok: false,
          code: "OWNER_ROLE_FORBIDDEN",
          message:
            "Roli vlastníka nelze přidělit běžnou pozvánkou.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Zabráníme pozvání sebe sama.
     */
    if (
      typeof user.email === "string" &&
      normalizeEmail(user.email) === email
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "SELF_INVITATION",
          message: "Nemůžete pozvat svůj vlastní účet.",
        },
        {
          status: 409,
        }
      );
    }

    /*
     * 3. Aktivní organizace se bere výhradně z profilu
     * přihlášeného uživatele.
     *
     * organization_id nikdy nepřijímáme od klienta.
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
        "ORGANIZATION INVITATION PROFILE ERROR:",
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
     * 4. Autorizační kontrola.
     *
     * Service role použijeme až poté, co máme identitu
     * uživatele a organization_id ze serverově ověřeného
     * profilu.
     */
    const {
      data: membership,
      error: membershipError,
    } = await supabaseAdmin
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError) {
      console.error(
        "ORGANIZATION INVITATION MEMBERSHIP ERROR:",
        membershipError
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
      !membership ||
      !["owner", "admin"].includes(membership.role)
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "INSUFFICIENT_ROLE",
          message:
            "Pozvánky mohou vytvářet pouze vlastník nebo administrátor organizace.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * 5. Zkontrolujeme existující čekající pozvánku.
     */
    const {
      data: pendingInvitation,
      error: pendingInvitationError,
    } = await supabaseAdmin
      .from("organization_invitations")
      .select("id, expires_at")
      .eq("organization_id", organizationId)
      .ilike("email", email)
      .eq("status", "pending")
      .maybeSingle();

    if (pendingInvitationError) {
      console.error(
        "ORGANIZATION INVITATION DUPLICATE CHECK ERROR:",
        pendingInvitationError
      );

      return NextResponse.json(
        {
          ok: false,
          code: "INVITATION_CHECK_FAILED",
          message:
            "Existující pozvánky se nepodařilo ověřit.",
        },
        {
          status: 500,
        }
      );
    }

    if (pendingInvitation) {
      const expiresAt = Date.parse(
        pendingInvitation.expires_at
      );

      /*
       * Pokud stará pending pozvánka už vypršela,
       * označíme ji jako expired a dovolíme vytvořit novou.
       */
      if (
        Number.isFinite(expiresAt) &&
        expiresAt <= Date.now()
      ) {
        const {
          error: expireError,
        } = await supabaseAdmin
          .from("organization_invitations")
          .update({
            status: "expired",
          })
          .eq("id", pendingInvitation.id)
          .eq("status", "pending");

        if (expireError) {
          console.error(
            "ORGANIZATION INVITATION EXPIRE ERROR:",
            expireError
          );

          return NextResponse.json(
            {
              ok: false,
              code: "INVITATION_EXPIRE_FAILED",
              message:
                "Starou pozvánku se nepodařilo uzavřít.",
            },
            {
              status: 500,
            }
          );
        }
      } else {
        return NextResponse.json(
          {
            ok: false,
            code: "INVITATION_ALREADY_PENDING",
            message:
              "Pro tento e-mail již existuje platná čekající pozvánka.",
          },
          {
            status: 409,
          }
        );
      }
    }

    /*
     * 6. Vytvoření pozvánky.
     *
     * E-mail zatím neposíláme. V tomto kroku pouze bezpečně
     * založíme serverovou invitation entitu.
     */
    const {
      data: invitation,
      error: invitationError,
    } = await supabaseAdmin
      .from("organization_invitations")
      .insert({
        organization_id: organizationId,
        email,
        role,
        invited_by: user.id,
      })
      .select(
        "id, organization_id, email, role, status, created_at, expires_at"
      )
      .single();

    if (invitationError) {
      /*
       * Zachytíme i případný souběh dvou requestů.
       * DB unique index je poslední autoritativní ochrana.
       */
      if (invitationError.code === "23505") {
        return NextResponse.json(
          {
            ok: false,
            code: "INVITATION_ALREADY_PENDING",
            message:
              "Pro tento e-mail již existuje čekající pozvánka.",
          },
          {
            status: 409,
          }
        );
      }

      console.error(
        "ORGANIZATION INVITATION INSERT ERROR:",
        invitationError
      );

      return NextResponse.json(
        {
          ok: false,
          code: "INVITATION_CREATE_FAILED",
          message:
            "Pozvánku se nepodařilo vytvořit.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        invitation,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "ORGANIZATION INVITATION API ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "Při vytváření pozvánky došlo k neočekávané chybě.",
      },
      {
        status: 500,
      }
    );
  }
}