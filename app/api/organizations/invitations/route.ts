import { NextResponse } from "next/server";
import { Resend } from "resend";

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

function roleLabel(role: InvitationRole) {
  switch (role) {
    case "admin":
      return "Administrátor";
    case "viewer":
      return "Pouze čtení";
    case "member":
    default:
      return "Člen";
  }
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
     * 5. Načteme organizaci pro e-mail pozvánky.
     */
    const {
      data: organization,
      error: organizationError,
    } = await supabaseAdmin
      .from("organizations")
      .select("name")
      .eq("id", organizationId)
      .maybeSingle();

    if (organizationError) {
      console.error(
        "ORGANIZATION INVITATION ORGANIZATION ERROR:",
        organizationError
      );
    }

    const organizationName =
      organization?.name?.trim() || "organizace v AEGRIS";

    /*
     * 6. Zkontrolujeme existující čekající pozvánku.
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
     * 7. Vytvoření pozvánky.
     *
     * Token načítáme pouze na serveru kvůli vytvoření odkazu.
     * Klientovi ho neposíláme.
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
        "id, organization_id, email, role, token, status, created_at, expires_at"
      )
      .single();

    if (invitationError) {
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

    /*
     * 8. Odeslání e-mailu přes Resend.
     */
    let emailSent = false;

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error(
        "ORGANIZATION INVITATION EMAIL ERROR: RESEND_API_KEY is missing."
      );
    } else {
      try {
        const resend = new Resend(resendApiKey);

        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL?.replace(
            /\/+$/,
            ""
          ) || "https://www.aegris.cz";

        const invitationUrl =
          `${siteUrl}/register?invite=${encodeURIComponent(
            invitation.token
          )}`;

        const senderName =
          typeof user.email === "string"
            ? user.email
            : "člen týmu";

        const { error: emailError } =
          await resend.emails.send({
            from: "AEGRIS <pozvanky@send.aegris.cz>",
            to: email,
            subject: `Pozvánka do ${organizationName} | AEGRIS`,
            text: [
              `Byli jste pozváni do organizace ${organizationName} v AEGRIS.`,
              "",
              `Role: ${roleLabel(role)}`,
              `Pozval: ${senderName}`,
              "",
              "Pozvánku přijmete vytvořením nebo přihlášením ke svému účtu:",
              invitationUrl,
              "",
              `Platnost pozvánky končí ${new Date(
                invitation.expires_at
              ).toLocaleString("cs-CZ")}.`,
              "",
              "Pokud jste tuto pozvánku neočekávali, můžete tento e-mail ignorovat.",
              "",
              "AEGRIS",
            ].join("\n"),
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111827;line-height:1.6">
                <h1 style="font-size:24px;margin-bottom:16px">
                  Pozvánka do AEGRIS
                </h1>

                <p>
                  Byli jste pozváni do organizace
                  <strong>${organizationName}</strong>
                  v platformě AEGRIS.
                </p>

                <p>
                  <strong>Role:</strong> ${roleLabel(role)}<br />
                  <strong>Pozval:</strong> ${senderName}
                </p>

                <p style="margin:28px 0">
                  <a
                    href="${invitationUrl}"
                    style="
                      display:inline-block;
                      background:#111827;
                      color:#ffffff;
                      text-decoration:none;
                      padding:12px 20px;
                      border-radius:8px;
                      font-weight:600;
                    "
                  >
                    Přijmout pozvánku
                  </a>
                </p>

                <p>
                  Pokud tlačítko nefunguje, otevřete tento odkaz:
                </p>

                <p style="word-break:break-all">
                  ${invitationUrl}
                </p>

                <p style="color:#6b7280;font-size:14px;margin-top:28px">
                  Platnost pozvánky končí
                  ${new Date(
                    invitation.expires_at
                  ).toLocaleString("cs-CZ")}.
                </p>

                <p style="color:#6b7280;font-size:14px">
                  Pokud jste tuto pozvánku neočekávali,
                  můžete tento e-mail ignorovat.
                </p>

                <p style="margin-top:32px">
                  AEGRIS
                </p>
              </div>
            `,
          });

        if (emailError) {
          console.error(
            "ORGANIZATION INVITATION RESEND ERROR:",
            emailError
          );
        } else {
          emailSent = true;
        }
      } catch (emailError) {
        console.error(
          "ORGANIZATION INVITATION EMAIL ERROR:",
          emailError
        );
      }
    }

    /*
     * Token záměrně není součástí response.
     */
    const {
      token: _token,
      ...publicInvitation
    } = invitation;

    return NextResponse.json(
      {
        ok: true,
        invitation: publicInvitation,
        email_sent: emailSent,
        message: emailSent
          ? "Pozvánka byla vytvořena a odeslána e-mailem."
          : "Pozvánka byla vytvořena, ale e-mail se nepodařilo odeslat.",
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