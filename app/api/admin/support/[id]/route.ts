import { NextRequest, NextResponse } from "next/server";

import { requireAdminAccess } from "@/lib/auth/admin-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type SupportStatus = "open" | "in_progress" | "resolved";

type RequestBody = {
  status?: unknown;
};

const allowedStatuses: SupportStatus[] = [
  "open",
  "in_progress",
  "resolved",
];

const allowedTransitions: Record<SupportStatus, SupportStatus[]> = {
  open: ["in_progress"],
  in_progress: ["open", "resolved"],
  resolved: ["in_progress"],
};

function isSupportStatus(value: unknown): value is SupportStatus {
  return (
    typeof value === "string" &&
    allowedStatuses.includes(value as SupportStatus)
  );
}

export async function PATCH(
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
    const ticketId = Number(id);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid ticket ID.",
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

    if (!isSupportStatus(body.status)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid support status.",
        },
        {
          status: 400,
        }
      );
    }

    const { data: existingTicket, error: existingTicketError } =
      await supabaseAdmin
        .from("support_tickets")
        .select("id, status")
        .eq("id", ticketId)
        .maybeSingle();

    if (existingTicketError) {
      console.error(
        "AEGRIS ADMIN SUPPORT STATUS LOAD FAILED:",
        existingTicketError
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Failed to load support ticket.",
        },
        {
          status: 500,
        }
      );
    }

    if (!existingTicket) {
      return NextResponse.json(
        {
          ok: false,
          error: "Support ticket not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!isSupportStatus(existingTicket.status)) {
      console.error(
        "AEGRIS ADMIN SUPPORT INVALID DATABASE STATUS:",
        existingTicket.status
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Support ticket has an invalid current status.",
        },
        {
          status: 409,
        }
      );
    }

    const currentStatus = existingTicket.status;
    const nextStatus = body.status;

    if (currentStatus === nextStatus) {
      return NextResponse.json({
        ok: true,
        ticket: {
          id: ticketId,
          status: currentStatus,
        },
      });
    }

    const validNextStatuses = allowedTransitions[currentStatus];

    if (!validNextStatuses.includes(nextStatus)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid status transition: ${currentStatus} -> ${nextStatus}.`,
        },
        {
          status: 409,
        }
      );
    }

    const now = new Date().toISOString();

    const updatePayload: {
      status: SupportStatus;
      updated_at: string;
      resolved_at: string | null;
    } = {
      status: nextStatus,
      updated_at: now,
      resolved_at:
        nextStatus === "resolved"
          ? now
          : null,
    };

    const { data: updatedTicket, error: updateError } =
      await supabaseAdmin
        .from("support_tickets")
        .update(updatePayload)
        .eq("id", ticketId)
        .select(
          `
            id,
            user_id,
            subject,
            status,
            priority,
            created_at,
            updated_at,
            resolved_at
          `
        )
        .single();

    if (updateError) {
      console.error(
        "AEGRIS ADMIN SUPPORT STATUS UPDATE FAILED:",
        updateError
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Failed to update support ticket.",
        },
        {
          status: 500,
        }
      );
    }

    console.info("AEGRIS ADMIN SUPPORT STATUS UPDATED:", {
      adminUserId: access.user.id,
      ticketId,
      previousStatus: currentStatus,
      nextStatus,
      updatedAt: now,
    });

    return NextResponse.json({
      ok: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error(
      "AEGRIS ADMIN SUPPORT STATUS ROUTE FAILED:",
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