import { NextRequest, NextResponse } from "next/server";

import { requireAccountAccess } from "@/lib/auth/account-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type RequestBody = {
  message?: unknown;
};

function parseTicketId(value: string) {
  const ticketId = Number(value);

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return null;
  }

  return ticketId;
}

function normalizeMessage(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const message = value.trim();

  if (message.length < 1 || message.length > 10000) {
    return null;
  }

  return message;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createServerSupabaseClient();

    const access = await requireAccountAccess(supabase);

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
    const ticketId = parseTicketId(id);

    if (!ticketId) {
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

    const {
      data: ticket,
      error: ticketError,
    } = await supabase
      .from("support_tickets")
      .select(
        `
          id,
          user_id,
          subject,
          message,
          status,
          priority,
          created_at,
          updated_at,
          resolved_at
        `
      )
      .eq("id", ticketId)
      .maybeSingle();

    if (ticketError) {
      console.error(
        "AEGRIS SUPPORT TICKET LOAD FAILED:",
        ticketError
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

    if (!ticket) {
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

    const {
      data: messages,
      error: messagesError,
    } = await supabase
      .from("support_ticket_messages")
      .select(
        `
          id,
          ticket_id,
          author_user_id,
          author_role,
          message,
          created_at
        `
      )
      .eq("ticket_id", ticketId)
      .order("created_at", {
        ascending: true,
      });

    if (messagesError) {
      console.error(
        "AEGRIS SUPPORT MESSAGES LOAD FAILED:",
        messagesError
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Failed to load support messages.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      ticket,
      messages: messages ?? [],
    });
  } catch (error) {
    console.error(
      "AEGRIS SUPPORT MESSAGES GET FAILED:",
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

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const supabase = await createServerSupabaseClient();

    const access = await requireAccountAccess(supabase);

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
    const ticketId = parseTicketId(id);

    if (!ticketId) {
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

    const message = normalizeMessage(body.message);

    if (!message) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Message must contain between 1 and 10000 characters.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      data: ticket,
      error: ticketError,
    } = await supabase
      .from("support_tickets")
      .select("id, user_id, status")
      .eq("id", ticketId)
      .maybeSingle();

    if (ticketError) {
      console.error(
        "AEGRIS SUPPORT TICKET OWNERSHIP CHECK FAILED:",
        ticketError
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Failed to verify support ticket.",
        },
        {
          status: 500,
        }
      );
    }

    if (!ticket) {
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

    if (
      ticket.status !== "open" &&
      ticket.status !== "in_progress"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Resolved support tickets cannot receive new customer messages.",
        },
        {
          status: 409,
        }
      );
    }

    const {
      data: createdMessage,
      error: insertError,
    } = await supabase
      .from("support_ticket_messages")
      .insert({
        ticket_id: ticketId,
        author_user_id: access.user.id,
        author_role: "customer",
        message,
      })
      .select(
        `
          id,
          ticket_id,
          author_user_id,
          author_role,
          message,
          created_at
        `
      )
      .single();

    if (insertError) {
      console.error(
        "AEGRIS SUPPORT MESSAGE INSERT FAILED:",
        insertError
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Failed to create support message.",
        },
        {
          status: 500,
        }
      );
    }

    await supabase
      .from("support_tickets")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);

    return NextResponse.json(
      {
        ok: true,
        message: createdMessage,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "AEGRIS SUPPORT MESSAGES POST FAILED:",
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