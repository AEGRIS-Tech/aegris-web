import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminSupportTicketDetail = {
  id: number;
  userId: string;
  customerEmail: string | null;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

type SupportTicketRow = {
  id: number;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export async function getAdminSupportTicketDetail(
  ticketId: number
): Promise<AdminSupportTicketDetail | null> {
  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return null;
  }

  const { data: ticket, error: ticketError } = await supabaseAdmin
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
    .maybeSingle<SupportTicketRow>();

  if (ticketError) {
    console.error("AEGRIS ADMIN SUPPORT DETAIL LOAD FAILED:", ticketError);
    throw new Error("Failed to load support ticket.");
  }

  if (!ticket) {
    return null;
  }

  let customerEmail: string | null = null;

  try {
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(ticket.user_id);

    if (authError) {
      console.error(
        "AEGRIS ADMIN SUPPORT CUSTOMER LOAD FAILED:",
        authError
      );
    } else {
      customerEmail = authData.user?.email ?? null;
    }
  } catch (error) {
    console.error(
      "AEGRIS ADMIN SUPPORT CUSTOMER LOOKUP FAILED:",
      error
    );
  }

  return {
    id: ticket.id,
    userId: ticket.user_id,
    customerEmail,
    subject: ticket.subject,
    message: ticket.message,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    resolvedAt: ticket.resolved_at,
  };
}