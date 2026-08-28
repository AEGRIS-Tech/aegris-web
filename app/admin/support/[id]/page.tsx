import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminSupportTicketDetail } from "@/lib/admin/support-detail";

import SupportStatusActions from "./SupportStatusActions";

type AdminSupportTicketPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusLabel(status: string) {
  switch (status) {
    case "open":
      return "Otevřený";
    case "in_progress":
      return "V řešení";
    case "resolved":
      return "Vyřešený";
    default:
      return status;
  }
}

function getPriorityLabel(priority: string) {
  switch (priority) {
    case "low":
      return "Nízká";
    case "normal":
      return "Normální";
    case "high":
      return "Vysoká";
    case "urgent":
      return "Urgentní";
    default:
      return priority;
  }
}

export default async function AdminSupportTicketPage({
  params,
}: AdminSupportTicketPageProps) {
  const { id } = await params;
  const ticketId = Number(id);

  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    notFound();
  }

  const ticket = await getAdminSupportTicketDetail(ticketId);

  if (!ticket) {
    notFound();
  }

  return (
    <main className="space-y-6">
      <div>
        <Link
          href="/admin/support"
          className="text-sm text-cyan-400 transition hover:text-cyan-300"
        >
          ← Zpět na Support
        </Link>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-white/40">
              Support ticket #{ticket.id}
            </div>

            <h1 className="text-2xl font-semibold text-white">
              {ticket.subject}
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Vytvořeno {formatDate(ticket.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
              {getStatusLabel(ticket.status)}
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
              Priorita: {getPriorityLabel(ticket.priority)}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Zpráva zákazníka
            </h2>

            <p className="mt-1 text-sm text-white/45">
              Původní obsah support požadavku.
            </p>
          </div>

          <div className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/80">
            {ticket.message}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/50">
              Zákazník
            </h2>

            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xs text-white/35">
                  E-mail
                </div>

                <div className="mt-1 break-all text-sm text-white/80">
                  {ticket.customerEmail ?? "Neznámý zákazník"}
                </div>
              </div>

              <div>
                <div className="text-xs text-white/35">
                  User ID
                </div>

                <div className="mt-1 break-all font-mono text-xs text-white/60">
                  {ticket.userId}
                </div>
              </div>

              <Link
                href={`/admin/customers/${ticket.userId}`}
                className="inline-flex text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
              >
                Otevřít zákazníka →
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/50">
              Správa ticketu
            </h2>

            <p className="mt-2 text-sm leading-5 text-white/40">
              Změna stavu zákaznického požadavku.
            </p>

            <div className="mt-4">
              <SupportStatusActions
                ticketId={ticket.id}
                currentStatus={
                  ticket.status as
                    | "open"
                    | "in_progress"
                    | "resolved"
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/50">
              Časová data
            </h2>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <div className="text-xs text-white/35">
                  Vytvořeno
                </div>

                <div className="mt-1 text-white/75">
                  {formatDate(ticket.createdAt)}
                </div>
              </div>

              <div>
                <div className="text-xs text-white/35">
                  Aktualizováno
                </div>

                <div className="mt-1 text-white/75">
                  {formatDate(ticket.updatedAt)}
                </div>
              </div>

              <div>
                <div className="text-xs text-white/35">
                  Vyřešeno
                </div>

                <div className="mt-1 text-white/75">
                  {formatDate(ticket.resolvedAt)}
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}