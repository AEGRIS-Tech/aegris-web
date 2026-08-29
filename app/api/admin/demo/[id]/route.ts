import { NextRequest, NextResponse } from "next/server";

import { requireAdminAccess } from "@/lib/auth/admin-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type DemoAction =
  | "approve"
  | "reject"
  | "extend"
  | "terminate"
  | "convert";

type RequestBody = {
  action?: unknown;
  durationDays?: unknown;
  rejectionReason?: unknown;
};

function parseRequestId(value: string) {
  const requestId = Number(value);

  if (!Number.isInteger(requestId) || requestId <= 0) {
    return null;
  }

  return requestId;
}

function parseAction(value: unknown): DemoAction | null {
  if (
    value === "approve" ||
    value === "reject" ||
    value === "extend" ||
    value === "terminate" ||
    value === "convert"
  ) {
    return value;
  }

  return null;
}

function parseDurationDays(value: unknown) {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 365
  ) {
    return null;
  }

  return value;
}

function parseRejectionReason(value: unknown) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const reason = value.trim();

  if (reason.length > 2000) {
    return undefined;
  }

  return reason.length > 0 ? reason : null;
}

async function writeAuditLog({
  adminUserId,
  action,
  requestId,
  metadata,
}: {
  adminUserId: string;
  action: string;
  requestId: number;
  metadata: Record<string, unknown>;
}) {
  const { error } = await supabaseAdmin
    .from("admin_audit_log")
    .insert({
      admin_user_id: adminUserId,
      action,
      target_type: "demo_request",
      target_id: String(requestId),
      metadata,
    });

  if (error) {
    console.error(
      "AEGRIS ADMIN AUDIT LOG FAILED:",
      {
        adminUserId,
        action,
        requestId,
        error,
      }
    );

    return false;
  }

  return true;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase =
      await createServerSupabaseClient();

    const access =
      await requireAdminAccess(supabase);

    if (!access.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: access.message,
          code: access.code,
        },
        {
          status: access.status,
        }
      );
    }

    const { id } = await context.params;
    const requestId = parseRequestId(id);

    if (!requestId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid DEMO request ID.",
        },
        {
          status: 400,
        }
      );
    }

    let body: RequestBody;

    try {
      body =
        (await request.json()) as RequestBody;
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid JSON body.",
        },
        {
          status: 400,
        }
      );
    }

    const action = parseAction(body.action);

    if (!action) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Action must be approve, reject, extend, terminate or convert.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data: demoRequest,
      error: loadError,
    } = await supabaseAdmin
      .from("demo_requests")
      .select(
        `
          id,
          email,
          status,
          user_id,
          approved_at,
          rejected_at,
          demo_duration_days
        `
      )
      .eq("id", requestId)
      .maybeSingle();

    if (loadError) {
      console.error(
        "AEGRIS ADMIN DEMO REQUEST LOAD FAILED:",
        loadError
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Failed to load DEMO request.",
        },
        {
          status: 500,
        }
      );
    }

    if (!demoRequest) {
      return NextResponse.json(
        {
          ok: false,
          error: "DEMO request not found.",
        },
        {
          status: 404,
        }
      );
    }

    const now = new Date().toISOString();

    // ==================================================
    // APPROVE
    // ==================================================

    if (action === "approve") {
      if (demoRequest.status !== "new") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Only new DEMO requests can be approved.",
            status: demoRequest.status,
          },
          {
            status: 409,
          }
        );
      }

      const durationDays =
        parseDurationDays(body.durationDays);

      if (!durationDays) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "DEMO duration must be an integer between 1 and 365 days.",
          },
          {
            status: 400,
          }
        );
      }

      const {
        data: updatedRequest,
        error: updateError,
      } = await supabaseAdmin
        .from("demo_requests")
        .update({
          status: "approved",
          approved_at: now,
          decided_by: access.user.id,
          demo_duration_days: durationDays,
          rejected_at: null,
          rejection_reason: null,
          processing_started_at: null,
        })
        .eq("id", requestId)
        .eq("status", "new")
        .select(
          `
            id,
            email,
            status,
            approved_at,
            decided_by,
            demo_duration_days
          `
        )
        .maybeSingle();

      if (updateError) {
        console.error(
          "AEGRIS ADMIN DEMO APPROVAL FAILED:",
          updateError
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Failed to approve DEMO request.",
          },
          {
            status: 500,
          }
        );
      }

      if (!updatedRequest) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "DEMO request changed before approval. Reload and try again.",
          },
          {
            status: 409,
          }
        );
      }

      const auditLogged =
        await writeAuditLog({
          adminUserId: access.user.id,
          action: "demo.approve",
          requestId,
          metadata: {
            email: updatedRequest.email,
            durationDays,
            approvedAt: now,
          },
        });

      console.info(
        "AEGRIS ADMIN DEMO APPROVED:",
        {
          adminUserId: access.user.id,
          requestId,
          email: updatedRequest.email,
          durationDays,
          approvedAt: now,
          auditLogged,
        }
      );

      return NextResponse.json({
        ok: true,
        request: updatedRequest,
        auditLogged,
      });
    }

    // ==================================================
    // REJECT
    // ==================================================

    if (action === "reject") {
      if (demoRequest.status !== "new") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Only new DEMO requests can be rejected.",
            status: demoRequest.status,
          },
          {
            status: 409,
          }
        );
      }

      const rejectionReason =
        parseRejectionReason(
          body.rejectionReason
        );

      if (rejectionReason === undefined) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Rejection reason must contain at most 2000 characters.",
          },
          {
            status: 400,
          }
        );
      }

      const {
        data: updatedRequest,
        error: updateError,
      } = await supabaseAdmin
        .from("demo_requests")
        .update({
          status: "rejected",
          decided_by: access.user.id,
          rejected_at: now,
          rejection_reason: rejectionReason,
          demo_duration_days: null,
          approved_at: null,
          processing_started_at: null,
        })
        .eq("id", requestId)
        .eq("status", "new")
        .select(
          `
            id,
            email,
            status,
            rejected_at,
            rejection_reason,
            decided_by
          `
        )
        .maybeSingle();

      if (updateError) {
        console.error(
          "AEGRIS ADMIN DEMO REJECTION FAILED:",
          updateError
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Failed to reject DEMO request.",
          },
          {
            status: 500,
          }
        );
      }

      if (!updatedRequest) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "DEMO request changed before rejection. Reload and try again.",
          },
          {
            status: 409,
          }
        );
      }

      const auditLogged =
        await writeAuditLog({
          adminUserId: access.user.id,
          action: "demo.reject",
          requestId,
          metadata: {
            email: updatedRequest.email,
            rejectedAt: now,
            rejectionReason,
          },
        });

      console.info(
        "AEGRIS ADMIN DEMO REJECTED:",
        {
          adminUserId: access.user.id,
          requestId,
          email: updatedRequest.email,
          rejectedAt: now,
          auditLogged,
        }
      );

      return NextResponse.json({
        ok: true,
        request: updatedRequest,
        auditLogged,
      });
    }

    // ==================================================
    // ACTIVE DEMO LIFECYCLE
    // ==================================================

    if (!demoRequest.user_id) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This DEMO request is not linked to a user account.",
        },
        {
          status: 409,
        }
      );
    }

    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        `
          id,
          account_type,
          demo_started_at,
          demo_expires_at
        `
      )
      .eq("id", demoRequest.user_id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "AEGRIS ADMIN DEMO PROFILE LOAD FAILED:",
        profileError
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Failed to load DEMO profile.",
        },
        {
          status: 500,
        }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "DEMO profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ==================================================
    // EXTEND
    // ==================================================

    if (action === "extend") {
      if (profile.account_type !== "demo") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Only DEMO accounts can be extended.",
            accountType:
              profile.account_type,
          },
          {
            status: 409,
          }
        );
      }

      const durationDays =
        parseDurationDays(body.durationDays);

      if (!durationDays) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Extension must be an integer between 1 and 365 days.",
          },
          {
            status: 400,
          }
        );
      }

      const nowMs = Date.now();

      const currentExpiresMs =
        profile.demo_expires_at
          ? Date.parse(
              profile.demo_expires_at
            )
          : Number.NaN;

      const baseMs =
        Number.isFinite(currentExpiresMs) &&
        currentExpiresMs > nowMs
          ? currentExpiresMs
          : nowMs;

      const newExpiresAt =
        new Date(
          baseMs +
            durationDays *
              24 *
              60 *
              60 *
              1000
        ).toISOString();

      const {
        data: updatedProfile,
        error: updateError,
      } = await supabaseAdmin
        .from("profiles")
        .update({
          demo_expires_at: newExpiresAt,
        })
        .eq("id", profile.id)
        .eq("account_type", "demo")
        .select(
          `
            id,
            account_type,
            demo_started_at,
            demo_expires_at
          `
        )
        .maybeSingle();

      if (updateError) {
        console.error(
          "AEGRIS ADMIN DEMO EXTEND FAILED:",
          updateError
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Failed to extend DEMO account.",
          },
          {
            status: 500,
          }
        );
      }

      if (!updatedProfile) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "DEMO account changed before extension. Reload and try again.",
          },
          {
            status: 409,
          }
        );
      }

      const auditLogged =
        await writeAuditLog({
          adminUserId: access.user.id,
          action: "demo.extend",
          requestId,
          metadata: {
            email: demoRequest.email,
            userId: profile.id,
            durationDays,
            previousExpiresAt:
              profile.demo_expires_at,
            newExpiresAt,
          },
        });

      console.info(
        "AEGRIS ADMIN DEMO EXTENDED:",
        {
          adminUserId: access.user.id,
          requestId,
          userId: profile.id,
          durationDays,
          previousExpiresAt:
            profile.demo_expires_at,
          newExpiresAt,
          auditLogged,
        }
      );

      return NextResponse.json({
        ok: true,
        profile: updatedProfile,
        auditLogged,
      });
    }

    // ==================================================
    // TERMINATE
    // ==================================================

    if (action === "terminate") {
      if (profile.account_type !== "demo") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Only DEMO accounts can be terminated.",
            accountType:
              profile.account_type,
          },
          {
            status: 409,
          }
        );
      }

      const {
        data: updatedProfile,
        error: updateError,
      } = await supabaseAdmin
        .from("profiles")
        .update({
          account_type: "expired",
          demo_expires_at: now,
        })
        .eq("id", profile.id)
        .eq("account_type", "demo")
        .select(
          `
            id,
            account_type,
            demo_started_at,
            demo_expires_at
          `
        )
        .maybeSingle();

      if (updateError) {
        console.error(
          "AEGRIS ADMIN DEMO TERMINATE FAILED:",
          updateError
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Failed to terminate DEMO account.",
          },
          {
            status: 500,
          }
        );
      }

      if (!updatedProfile) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "DEMO account changed before termination. Reload and try again.",
          },
          {
            status: 409,
          }
        );
      }

      const auditLogged =
        await writeAuditLog({
          adminUserId: access.user.id,
          action: "demo.terminate",
          requestId,
          metadata: {
            email: demoRequest.email,
            userId: profile.id,
            previousAccountType:
              profile.account_type,
            previousExpiresAt:
              profile.demo_expires_at,
            terminatedAt: now,
          },
        });

      console.info(
        "AEGRIS ADMIN DEMO TERMINATED:",
        {
          adminUserId: access.user.id,
          requestId,
          userId: profile.id,
          terminatedAt: now,
          auditLogged,
        }
      );

      return NextResponse.json({
        ok: true,
        profile: updatedProfile,
        auditLogged,
      });
    }

    // ==================================================
    // CONVERT TO ACTIVE CUSTOMER
    // ==================================================

    if (action === "convert") {
      if (profile.account_type !== "demo") {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Only DEMO accounts can be converted to active customers.",
            accountType:
              profile.account_type,
          },
          {
            status: 409,
          }
        );
      }

      const {
        data: updatedProfile,
        error: updateError,
      } = await supabaseAdmin
        .from("profiles")
        .update({
          account_type: "active",
          demo_started_at: null,
          demo_expires_at: null,
        })
        .eq("id", profile.id)
        .eq("account_type", "demo")
        .select(
          `
            id,
            account_type,
            demo_started_at,
            demo_expires_at
          `
        )
        .maybeSingle();

      if (updateError) {
        console.error(
          "AEGRIS ADMIN DEMO CONVERT FAILED:",
          updateError
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              "Failed to convert DEMO account to active customer.",
          },
          {
            status: 500,
          }
        );
      }

      if (!updatedProfile) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "DEMO account changed before conversion. Reload and try again.",
          },
          {
            status: 409,
          }
        );
      }

      const auditLogged =
        await writeAuditLog({
          adminUserId: access.user.id,
          action: "demo.convert",
          requestId,
          metadata: {
            email: demoRequest.email,
            userId: profile.id,
            previousAccountType:
              profile.account_type,
            previousStartedAt:
              profile.demo_started_at,
            previousExpiresAt:
              profile.demo_expires_at,
            convertedAt: now,
          },
        });

      console.info(
        "AEGRIS ADMIN DEMO CONVERTED:",
        {
          adminUserId: access.user.id,
          requestId,
          userId: profile.id,
          convertedAt: now,
          auditLogged,
        }
      );

      return NextResponse.json({
        ok: true,
        profile: updatedProfile,
        auditLogged,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Unsupported DEMO action.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "AEGRIS ADMIN DEMO MANAGEMENT ROUTE FAILED:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Unexpected server error.",
      },
      {
        status: 500,
      }
    );
  }
}