import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import { Resend } from "resend";

import { requireAccountAccess } from "@/lib/auth/account-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type OrganizationRole =
  | "owner"
  | "admin"
  | "member"
  | "viewer";

type InvitationRole =
  | "admin"
  | "member"
  | "viewer";

type CreateInvitationBody = {
  email?: unknown;
  role?: unknown;
};

type ResendInvitationBody = {
  invitationId?: unknown;
};

type RevokeInvitationBody = {
  invitationId?: unknown;
};

type InvitationRow = {
  id: string;
  organization_id: string;
  email: string;
  role: InvitationRole;
  token: string;
  status: string;
  created_at: string;
  expires_at: string;
};

const ALLOWED_ROLES =
  new Set<InvitationRole>([
    "admin",
    "member",
    "viewer",
  ]);

const INVITATION_TTL_DAYS = 7;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

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

function isInvitationRole(
  value: unknown
): value is InvitationRole {
  return (
    typeof value === "string" &&
    ALLOWED_ROLES.has(
      value as InvitationRole
    )
  );
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function nextExpirationIso() {
  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() +
      INVITATION_TTL_DAYS
  );

  return expiresAt.toISOString();
}

async function writeAuditLog({
  adminUserId,
  action,
  invitationId,
  metadata,
}: {
  adminUserId: string;
  action: string;
  invitationId: string;
  metadata: Record<string, unknown>;
}) {
  const { error } = await supabaseAdmin
    .from("admin_audit_log")
    .insert({
      admin_user_id: adminUserId,
      action,
      target_type:
        "organization_invitation",
      target_id: invitationId,
      metadata,
    });

  if (error) {
    console.error(
      "AEGRIS ORGANIZATION INVITATION AUDIT LOG FAILED:",
      {
        adminUserId,
        action,
        invitationId,
        error,
      }
    );

    return false;
  }

  return true;
}

async function getOrganizationContext(
  supabase: Awaited<
    ReturnType<
      typeof createServerSupabaseClient
    >
  >,
  userId: string
) {
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("active_organization_id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return {
      ok: false as const,
      status: 500,
      code: "PROFILE_UNAVAILABLE",
      message:
        "Aktivní organizaci se nepodařilo ověřit.",
      error: profileError,
    };
  }

  if (!profile?.active_organization_id) {
    return {
      ok: false as const,
      status: 409,
      code: "ORGANIZATION_UNAVAILABLE",
      message:
        "Účet nemá aktivní organizaci.",
    };
  }

  const organizationId =
    profile.active_organization_id;

  const {
    data: membership,
    error: membershipError,
  } = await supabaseAdmin
    .from("organization_members")
    .select("role")
    .eq(
      "organization_id",
      organizationId
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError) {
    return {
      ok: false as const,
      status: 500,
      code: "MEMBERSHIP_UNAVAILABLE",
      message:
        "Oprávnění v organizaci se nepodařilo ověřit.",
      error: membershipError,
    };
  }

  if (
    !membership ||
    !isOrganizationRole(
      membership.role
    )
  ) {
    return {
      ok: false as const,
      status: 403,
      code: "MEMBERSHIP_REQUIRED",
      message:
        "Uživatel není členem aktivní organizace.",
    };
  }

  if (
    membership.role !== "owner" &&
    membership.role !== "admin"
  ) {
    return {
      ok: false as const,
      status: 403,
      code: "INSUFFICIENT_ROLE",
      message:
        "Pozvánky mohou spravovat pouze vlastník nebo administrátor organizace.",
    };
  }

  return {
    ok: true as const,
    organizationId,
    actorRole: membership.role,
  };
}

async function loadOrganizationName(
  organizationId: string
) {
  const {
    data: organization,
    error,
  } = await supabaseAdmin
    .from("organizations")
    .select("name")
    .eq("id", organizationId)
    .maybeSingle();

  if (error) {
    console.error(
      "ORGANIZATION INVITATION ORGANIZATION LOAD ERROR:",
      error
    );
  }

  return (
    organization?.name?.trim() ||
    "organizace v AEGRIS"
  );
}

async function sendInvitationEmail({
  invitation,
  organizationName,
  senderEmail,
}: {
  invitation: InvitationRow;
  organizationName: string;
  senderEmail: string | null;
}) {
  const resendApiKey =
    process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error(
      "ORGANIZATION INVITATION EMAIL ERROR: RESEND_API_KEY is missing."
    );

    return false;
  }

  try {
    const resend =
      new Resend(resendApiKey);

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
      senderEmail?.trim() ||
      "člen týmu";

    const safeOrganizationName =
      escapeHtml(organizationName);

    const safeSenderName =
      escapeHtml(senderName);

    const safeInvitationUrl =
      escapeHtml(invitationUrl);

    const { error } =
      await resend.emails.send({
        from: "AEGRIS <pozvanky@send.aegris.cz>",
        to: invitation.email,
        subject:
          `Pozvánka do ${organizationName} | AEGRIS`,
        text: [
          `Byli jste pozváni do organizace ${organizationName} v AEGRIS.`,
          "",
          `Role: ${roleLabel(
            invitation.role
          )}`,
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
              <strong>${safeOrganizationName}</strong>
              v platformě AEGRIS.
            </p>

            <p>
              <strong>Role:</strong> ${escapeHtml(
                roleLabel(
                  invitation.role
                )
              )}<br />
              <strong>Pozval:</strong> ${safeSenderName}
            </p>

            <p style="margin:28px 0">
              <a
                href="${safeInvitationUrl}"
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
              ${safeInvitationUrl}
            </p>

            <p style="color:#6b7280;font-size:14px;margin-top:28px">
              Platnost pozvánky končí
              ${escapeHtml(
                new Date(
                  invitation.expires_at
                ).toLocaleString(
                  "cs-CZ"
                )
              )}.
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

    if (error) {
      console.error(
        "ORGANIZATION INVITATION RESEND ERROR:",
        error
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "ORGANIZATION INVITATION EMAIL ERROR:",
      error
    );

    return false;
  }
}

// =========================================================
// GET
// Seznam čekajících pozvánek aktivní organizace.
// =========================================================

export async function GET() {
  try {
    const supabase =
      await createServerSupabaseClient();

    const access =
      await requireAccountAccess(
        supabase
      );

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

    const context =
      await getOrganizationContext(
        supabase,
        user.id
      );

    if (!context.ok) {
      if ("error" in context) {
        console.error(
          "ORGANIZATION INVITATION CONTEXT ERROR:",
          context.error
        );
      }

      return NextResponse.json(
        {
          ok: false,
          code: context.code,
          message: context.message,
        },
        {
          status: context.status,
        }
      );
    }

    const nowIso =
      new Date().toISOString();

    const {
      error: expireError,
    } = await supabaseAdmin
      .from(
        "organization_invitations"
      )
      .update({
        status: "expired",
      })
      .eq(
        "organization_id",
        context.organizationId
      )
      .eq("status", "pending")
      .lte("expires_at", nowIso);

    if (expireError) {
      console.error(
        "ORGANIZATION INVITATION LIST EXPIRE ERROR:",
        expireError
      );

      return NextResponse.json(
        {
          ok: false,
          code:
            "INVITATION_EXPIRE_FAILED",
          message:
            "Stav čekajících pozvánek se nepodařilo aktualizovat.",
        },
        {
          status: 500,
        }
      );
    }

    const {
      data: invitations,
      error: invitationsError,
    } = await supabaseAdmin
      .from(
        "organization_invitations"
      )
      .select(
        "id, organization_id, email, role, status, created_at, expires_at"
      )
      .eq(
        "organization_id",
        context.organizationId
      )
      .eq("status", "pending")
      .order("created_at", {
        ascending: false,
      });

    if (invitationsError) {
      console.error(
        "ORGANIZATION INVITATION LIST ERROR:",
        invitationsError
      );

      return NextResponse.json(
        {
          ok: false,
          code:
            "INVITATIONS_LOAD_FAILED",
          message:
            "Čekající pozvánky se nepodařilo načíst.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      organizationId:
        context.organizationId,
      currentUserRole:
        context.actorRole,
      invitations:
        invitations ?? [],
    });
  } catch (error) {
    console.error(
      "ORGANIZATION INVITATION GET API ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "Při načítání pozvánek došlo k neočekávané chybě.",
      },
      {
        status: 500,
      }
    );
  }
}

// =========================================================
// POST
// Vytvoření nové pozvánky.
// =========================================================

export async function POST(
  request: Request
) {
  try {
    const supabase =
      await createServerSupabaseClient();

    const access =
      await requireAccountAccess(
        supabase
      );

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

    let body: CreateInvitationBody;

    try {
      body =
        (await request.json()) as CreateInvitationBody;
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
      typeof body.email !==
      "string"
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "EMAIL_REQUIRED",
          message:
            "Zadejte e-mail uživatele.",
        },
        {
          status: 400,
        }
      );
    }

    const email =
      normalizeEmail(body.email);

    if (
      email.length === 0 ||
      email.length > 320 ||
      !isValidEmail(email)
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "EMAIL_INVALID",
          message:
            "Zadejte platnou e-mailovou adresu.",
        },
        {
          status: 400,
        }
      );
    }

    if (body.role === "owner") {
      return NextResponse.json(
        {
          ok: false,
          code:
            "OWNER_ROLE_FORBIDDEN",
          message:
            "Roli vlastníka nelze přidělit běžnou pozvánkou.",
        },
        {
          status: 400,
        }
      );
    }

    const role =
      typeof body.role ===
        "undefined"
        ? "member"
        : body.role;

    if (!isInvitationRole(role)) {
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

    if (
      typeof user.email ===
        "string" &&
      normalizeEmail(user.email) ===
        email
    ) {
      return NextResponse.json(
        {
          ok: false,
          code: "SELF_INVITATION",
          message:
            "Nemůžete pozvat svůj vlastní účet.",
        },
        {
          status: 409,
        }
      );
    }

    const context =
      await getOrganizationContext(
        supabase,
        user.id
      );

    if (!context.ok) {
      if ("error" in context) {
        console.error(
          "ORGANIZATION INVITATION CONTEXT ERROR:",
          context.error
        );
      }

      return NextResponse.json(
        {
          ok: false,
          code: context.code,
          message: context.message,
        },
        {
          status: context.status,
        }
      );
    }

    if (
      context.actorRole ===
        "admin" &&
      role === "admin"
    ) {
      return NextResponse.json(
        {
          ok: false,
          code:
            "ADMIN_INVITATION_FORBIDDEN",
          message:
            "Administrátora může pozvat pouze vlastník organizace.",
        },
        {
          status: 403,
        }
      );
    }

    const organizationId =
      context.organizationId;

    const organizationName =
      await loadOrganizationName(
        organizationId
      );

    const {
      data: pendingInvitation,
      error:
        pendingInvitationError,
    } = await supabaseAdmin
      .from(
        "organization_invitations"
      )
      .select(
        "id, expires_at"
      )
      .eq(
        "organization_id",
        organizationId
      )
      .ilike("email", email)
      .eq("status", "pending")
      .maybeSingle();

    if (
      pendingInvitationError
    ) {
      console.error(
        "ORGANIZATION INVITATION DUPLICATE CHECK ERROR:",
        pendingInvitationError
      );

      return NextResponse.json(
        {
          ok: false,
          code:
            "INVITATION_CHECK_FAILED",
          message:
            "Existující pozvánky se nepodařilo ověřit.",
        },
        {
          status: 500,
        }
      );
    }

    if (pendingInvitation) {
      const expiresAt =
        Date.parse(
          pendingInvitation.expires_at
        );

      if (
        Number.isFinite(
          expiresAt
        ) &&
        expiresAt <= Date.now()
      ) {
        const {
          error: expireError,
        } = await supabaseAdmin
          .from(
            "organization_invitations"
          )
          .update({
            status: "expired",
          })
          .eq(
            "id",
            pendingInvitation.id
          )
          .eq(
            "status",
            "pending"
          );

        if (expireError) {
          console.error(
            "ORGANIZATION INVITATION EXPIRE ERROR:",
            expireError
          );

          return NextResponse.json(
            {
              ok: false,
              code:
                "INVITATION_EXPIRE_FAILED",
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
            code:
              "INVITATION_ALREADY_PENDING",
            message:
              "Pro tento e-mail již existuje platná čekající pozvánka.",
          },
          {
            status: 409,
          }
        );
      }
    }

    const {
      data: invitation,
      error: invitationError,
    } = await supabaseAdmin
      .from(
        "organization_invitations"
      )
      .insert({
        organization_id:
          organizationId,
        email,
        role,
        invited_by: user.id,
      })
      .select(
        "id, organization_id, email, role, token, status, created_at, expires_at"
      )
      .single();

    if (invitationError) {
      if (
        invitationError.code ===
        "23505"
      ) {
        return NextResponse.json(
          {
            ok: false,
            code:
              "INVITATION_ALREADY_PENDING",
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
          code:
            "INVITATION_CREATE_FAILED",
          message:
            "Pozvánku se nepodařilo vytvořit.",
        },
        {
          status: 500,
        }
      );
    }

    const invitationRow =
      invitation as InvitationRow;

    const emailSent =
      await sendInvitationEmail({
        invitation:
          invitationRow,
        organizationName,
        senderEmail:
          typeof user.email ===
          "string"
            ? user.email
            : null,
      });

    await writeAuditLog({
      adminUserId: user.id,
      action:
        "organization.invitation.create",
      invitationId:
        invitationRow.id,
      metadata: {
        organization_id:
          organizationId,
        email:
          invitationRow.email,
        role:
          invitationRow.role,
        actor_role:
          context.actorRole,
        email_sent:
          emailSent,
        expires_at:
          invitationRow.expires_at,
      },
    });

    const {
      token,
      ...publicInvitation
    } = invitationRow;

    void token;

    return NextResponse.json(
      {
        ok: true,
        invitation:
          publicInvitation,
        email_sent:
          emailSent,
        message:
          emailSent
            ? "Pozvánka byla vytvořena a odeslána e-mailem."
            : "Pozvánka byla vytvořena, ale e-mail se nepodařilo odeslat.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "ORGANIZATION INVITATION POST API ERROR:",
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

// =========================================================
// PATCH
// Znovuodeslání čekající pozvánky.
// Vygeneruje nový token a obnoví expiraci.
// =========================================================

export async function PATCH(
  request: Request
) {
  try {
    const supabase =
      await createServerSupabaseClient();

    const access =
      await requireAccountAccess(
        supabase
      );

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

    let body: ResendInvitationBody;

    try {
      body =
        (await request.json()) as ResendInvitationBody;
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
      typeof body.invitationId !==
        "string" ||
      body.invitationId.trim()
        .length === 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          code:
            "INVITATION_ID_REQUIRED",
          message:
            "Chybí identifikátor pozvánky.",
        },
        {
          status: 400,
        }
      );
    }

    const invitationId =
      body.invitationId.trim();

    const context =
      await getOrganizationContext(
        supabase,
        user.id
      );

    if (!context.ok) {
      if ("error" in context) {
        console.error(
          "ORGANIZATION INVITATION CONTEXT ERROR:",
          context.error
        );
      }

      return NextResponse.json(
        {
          ok: false,
          code: context.code,
          message: context.message,
        },
        {
          status: context.status,
        }
      );
    }

    const {
      data: invitation,
      error: invitationError,
    } = await supabaseAdmin
      .from(
        "organization_invitations"
      )
      .select(
        "id, organization_id, email, role, token, status, created_at, expires_at"
      )
      .eq("id", invitationId)
      .eq(
        "organization_id",
        context.organizationId
      )
      .maybeSingle();

    if (invitationError) {
      console.error(
        "ORGANIZATION INVITATION RESEND LOAD ERROR:",
        invitationError
      );

      return NextResponse.json(
        {
          ok: false,
          code:
            "INVITATION_LOAD_FAILED",
          message:
            "Pozvánku se nepodařilo načíst.",
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
          code:
            "INVITATION_NOT_FOUND",
          message:
            "Pozvánka nebyla nalezena.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      invitation.status !==
      "pending"
    ) {
      return NextResponse.json(
        {
          ok: false,
          code:
            "INVITATION_NOT_PENDING",
          message:
            "Tato pozvánka už není aktivní.",
        },
        {
          status: 409,
        }
      );
    }

    if (
      context.actorRole ===
        "admin" &&
      invitation.role === "admin"
    ) {
      return NextResponse.json(
        {
          ok: false,
          code:
            "TARGET_ROLE_PROTECTED",
          message:
            "Administrátor nemůže spravovat pozvánku pro jiného administrátora.",
        },
        {
          status: 403,
        }
      );
    }

    const newToken =
      randomUUID();

    const newExpiresAt =
      nextExpirationIso();

    const {
      data: updatedInvitation,
      error: updateError,
    } = await supabaseAdmin
      .from(
        "organization_invitations"
      )
      .update({
        token: newToken,
        expires_at:
          newExpiresAt,
      })
      .eq("id", invitationId)
      .eq(
        "organization_id",
        context.organizationId
      )
      .eq("status", "pending")
      .select(
        "id, organization_id, email, role, token, status, created_at, expires_at"
      )
      .maybeSingle();

    if (updateError) {
      console.error(
        "ORGANIZATION INVITATION RESEND UPDATE ERROR:",
        updateError
      );

      return NextResponse.json(
        {
          ok: false,
          code:
            "INVITATION_RESEND_UPDATE_FAILED",
          message:
            "Pozvánku se nepodařilo obnovit.",
        },
        {
          status: 500,
        }
      );
    }

    if (!updatedInvitation) {
      return NextResponse.json(
        {
          ok: false,
          code:
            "INVITATION_NOT_PENDING",
          message:
            "Pozvánka už není aktivní.",
        },
        {
          status: 409,
        }
      );
    }

    const organizationName =
      await loadOrganizationName(
        context.organizationId
      );

    const updatedInvitationRow =
      updatedInvitation as InvitationRow;

    const emailSent =
      await sendInvitationEmail({
        invitation:
          updatedInvitationRow,
        organizationName,
        senderEmail:
          typeof user.email ===
          "string"
            ? user.email
            : null,
      });

    await writeAuditLog({
      adminUserId: user.id,
      action:
        "organization.invitation.resend",
      invitationId,
      metadata: {
        organization_id:
          context.organizationId,
        email:
          updatedInvitationRow.email,
        role:
          updatedInvitationRow.role,
        actor_role:
          context.actorRole,
        email_sent:
          emailSent,
        expires_at:
          updatedInvitationRow.expires_at,
        token_rotated: true,
      },
    });

    const {
      token,
      ...publicInvitation
    } =
      updatedInvitationRow;

    void token;

    return NextResponse.json({
      ok: true,
      invitation:
        publicInvitation,
      email_sent:
        emailSent,
      message:
        emailSent
          ? "Pozvánka byla znovu odeslána a její platnost byla obnovena."
          : "Pozvánka byla obnovena, ale e-mail se nepodařilo odeslat.",
    });
  } catch (error) {
    console.error(
      "ORGANIZATION INVITATION PATCH API ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "Při opětovném odeslání pozvánky došlo k neočekávané chybě.",
      },
      {
        status: 500,
      }
    );
  }
}

// =========================================================
// DELETE
// Revokace čekající pozvánky.
// =========================================================

export async function DELETE(
  request: Request
) {
  try {
    const supabase =
      await createServerSupabaseClient();

    const access =
      await requireAccountAccess(
        supabase
      );

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

    let body: RevokeInvitationBody;

    try {
      body =
        (await request.json()) as RevokeInvitationBody;
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
      typeof body.invitationId !==
        "string" ||
      body.invitationId.trim()
        .length === 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          code:
            "INVITATION_ID_REQUIRED",
          message:
            "Chybí identifikátor pozvánky.",
        },
        {
          status: 400,
        }
      );
    }

    const invitationId =
      body.invitationId.trim();

    const context =
      await getOrganizationContext(
        supabase,
        user.id
      );

    if (!context.ok) {
      if ("error" in context) {
        console.error(
          "ORGANIZATION INVITATION CONTEXT ERROR:",
          context.error
        );
      }

      return NextResponse.json(
        {
          ok: false,
          code: context.code,
          message: context.message,
        },
        {
          status: context.status,
        }
      );
    }

    const {
      data: invitation,
      error: invitationError,
    } = await supabaseAdmin
      .from(
        "organization_invitations"
      )
      .select(
        "id, organization_id, email, role, status, created_at, expires_at"
      )
      .eq("id", invitationId)
      .eq(
        "organization_id",
        context.organizationId
      )
      .maybeSingle();

    if (invitationError) {
      console.error(
        "ORGANIZATION INVITATION REVOKE LOAD ERROR:",
        invitationError
      );

      return NextResponse.json(
        {
          ok: false,
          code:
            "INVITATION_LOAD_FAILED",
          message:
            "Pozvánku se nepodařilo načíst.",
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
          code:
            "INVITATION_NOT_FOUND",
          message:
            "Pozvánka nebyla nalezena.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      invitation.status !==
      "pending"
    ) {
      return NextResponse.json(
        {
          ok: false,
          code:
            "INVITATION_NOT_PENDING",
          message:
            "Tato pozvánka už není aktivní.",
        },
        {
          status: 409,
        }
      );
    }

    if (
      context.actorRole ===
        "admin" &&
      invitation.role === "admin"
    ) {
      return NextResponse.json(
        {
          ok: false,
          code:
            "TARGET_ROLE_PROTECTED",
          message:
            "Administrátor nemůže spravovat pozvánku pro jiného administrátora.",
        },
        {
          status: 403,
        }
      );
    }

    const {
      data: revokedInvitation,
      error: revokeError,
    } = await supabaseAdmin
      .from(
        "organization_invitations"
      )
      .update({
        status: "revoked",
      })
      .eq("id", invitationId)
      .eq(
        "organization_id",
        context.organizationId
      )
      .eq("status", "pending")
      .select(
        "id, organization_id, email, role, status, created_at, expires_at"
      )
      .maybeSingle();

    if (revokeError) {
      console.error(
        "ORGANIZATION INVITATION REVOKE UPDATE ERROR:",
        revokeError
      );

      return NextResponse.json(
        {
          ok: false,
          code:
            "INVITATION_REVOKE_FAILED",
          message:
            "Pozvánku se nepodařilo zrušit.",
        },
        {
          status: 500,
        }
      );
    }

    if (!revokedInvitation) {
      return NextResponse.json(
        {
          ok: false,
          code:
            "INVITATION_NOT_PENDING",
          message:
            "Pozvánka už není aktivní.",
        },
        {
          status: 409,
        }
      );
    }

    await writeAuditLog({
      adminUserId: user.id,
      action:
        "organization.invitation.revoke",
      invitationId,
      metadata: {
        organization_id:
          context.organizationId,
        email:
          revokedInvitation.email,
        role:
          revokedInvitation.role,
        actor_role:
          context.actorRole,
        previous_status:
          "pending",
        new_status:
          "revoked",
      },
    });

    return NextResponse.json({
      ok: true,
      invitation: {
        id:
          revokedInvitation.id,
        email:
          revokedInvitation.email,
        role:
          revokedInvitation.role,
        status:
          revokedInvitation.status,
      },
      message:
        "Pozvánka byla zrušena.",
    });
  } catch (error) {
    console.error(
      "ORGANIZATION INVITATION DELETE API ERROR:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "Při rušení pozvánky došlo k neočekávané chybě.",
      },
      {
        status: 500,
      }
    );
  }
}