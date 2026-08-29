import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminSupportTicketMessage = {
  id: number;
  ticketId: number;
  authorUserId: string | null;
  authorRole: "customer" | "admin";
  message: string;
  createdAt: string;
};

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
  messages: AdminSupportTicketMessage[];
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

type SupportMessageRow = {
  id: number;
  ticket_id: number;
  author_user_id: string | null;
  author_role: "customer" | "admin";
  message: string;
  created_at: string;
};

export async function getAdminSupportTicketDetail(
  ticketId: number
): Promise<AdminSupportTicketDetail | null> {
  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return null;
  }

  const { data: ticket, error: ticketError } =
    await supabaseAdmin
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
    console.error(
      "AEGRIS ADMIN SUPPORT DETAIL LOAD FAILED:",
      ticketError
    );

    throw new Error("Failed to load support ticket.");
  }

  if (!ticket) {
    return null;
  }

  const { data: messageRows, error: messagesError } =
    await supabaseAdmin
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
      "AEGRIS ADMIN SUPPORT MESSAGES LOAD FAILED:",
      messagesError
    );

    throw new Error("Failed to load support messages.");
  }

  const messages = (
    (messageRows ?? []) as SupportMessageRow[]
  ).map((row) => ({
    id: row.id,
    ticketId: row.ticket_id,
    authorUserId: row.author_user_id,
    authorRole: row.author_role,
    message: row.message,
    createdAt: row.created_at,
  }));

  let customerEmail: string | null = null;

  try {
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(
        ticket.user_id
      );

    if (authError) {
      console.error(
        "AEGRIS ADMIN SUPPORT CUSTOMER LOAD FAILED:",
        authError
      );
    } else {
      customerEmail =
        authData.user?.email ?? null;
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
    messages,
  };
}