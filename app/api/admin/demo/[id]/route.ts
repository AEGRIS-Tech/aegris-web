import { NextRequest, NextResponse } from "next/server";

import { requireAdminAccess } from "@/lib/auth/admin-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createServerSupabaseClient();

    const access = await requireAdminAccess(supabase);

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
      body = (await request.json()) as RequestBody;
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

    if (
      body.action !== "approve" &&
      body.action !== "reject"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Action must be approve or reject.",
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
          error: "Failed to load DEMO request.",
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

    if (demoRequest.status !== "new") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Only new DEMO requests can be approved or rejected.",
          status: demoRequest.status,
        },
        {
          status: 409,
        }
      );
    }

    const now = new Date().toISOString();

    if (body.action === "approve") {
      const durationDays = parseDurationDays(
        body.durationDays
      );

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
            error: "Failed to approve DEMO request.",
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

      console.info("AEGRIS ADMIN DEMO APPROVED:", {
        adminUserId: access.user.id,
        requestId,
        email: updatedRequest.email,
        durationDays,
        approvedAt: now,
      });

      return NextResponse.json({
        ok: true,
        request: updatedRequest,
      });
    }

    const rejectionReason = parseRejectionReason(
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
          error: "Failed to reject DEMO request.",
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

    console.info("AEGRIS ADMIN DEMO REJECTED:", {
      adminUserId: access.user.id,
      requestId,
      email: updatedRequest.email,
      rejectedAt: now,
    });

    return NextResponse.json({
      ok: true,
      request: updatedRequest,
    });
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