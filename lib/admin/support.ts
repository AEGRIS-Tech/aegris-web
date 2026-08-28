import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminSupportTicket = {
  id: number;
  userId: string | null;
  email: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

export type AdminSupportOverview = {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  urgentTickets: number;
  tickets: AdminSupportTicket[];
};

type SupportTicketRow = {
  id: number;
  user_id: string | null;
  email: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

export async function getAdminSupportOverview(): Promise<AdminSupportOverview> {
  const { data, error } = await supabaseAdmin
    .from("support_tickets")
    .select(
      `
        id,
        user_id,
        email,
        subject,
        message,
        status,
        priority,
        created_at,
        updated_at,
        resolved_at
      `
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("ADMIN SUPPORT TICKETS ERROR:", error);

    throw new Error(
      "Nepodařilo se načíst support tickety."
    );
  }

  const rows = (data ?? []) as SupportTicketRow[];

  const tickets: AdminSupportTicket[] = rows.map(
    (ticket) => ({
      id: ticket.id,
      userId: ticket.user_id,
      email: ticket.email,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      resolvedAt: ticket.resolved_at,
    })
  );

  return {
    totalTickets: tickets.length,

    openTickets: tickets.filter(
      (ticket) => ticket.status === "open"
    ).length,

    inProgressTickets: tickets.filter(
      (ticket) => ticket.status === "in_progress"
    ).length,

    resolvedTickets: tickets.filter(
      (ticket) =>
        ticket.status === "resolved" ||
        ticket.status === "closed"
    ).length,

    urgentTickets: tickets.filter(
      (ticket) =>
        ticket.priority === "urgent" &&
        ticket.status !== "resolved" &&
        ticket.status !== "closed"
    ).length,

    tickets,
  };
}