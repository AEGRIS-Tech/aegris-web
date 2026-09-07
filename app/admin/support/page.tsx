import Link from "next/link";

import { getAdminSupportOverview } from "@/lib/admin/support";

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusClasses(status: string) {
  if (status === "open") {
    return "border-amber-300/10 bg-amber-300/[0.04] text-amber-300";
  }

  if (status === "in_progress") {
    return "border-cyan-300/10 bg-cyan-300/[0.04] text-cyan-300";
  }

  if (status === "resolved") {
    return "border-emerald-300/10 bg-emerald-300/[0.04] text-emerald-300";
  }

  if (status === "closed") {
    return "border-white/[0.06] bg-white/[0.02] text-slate-500";
  }

  return "border-white/[0.06] bg-white/[0.02] text-slate-400";
}

function getPriorityClasses(priority: string) {
  if (priority === "urgent") {
    return "text-rose-400";
  }

  if (priority === "high") {
    return "text-orange-300";
  }

  if (priority === "normal") {
    return "text-slate-300";
  }

  return "text-slate-700";
}

export default async function AdminSupportPage() {
  const overview = await getAdminSupportOverview();

  return (
    <div className="min-h-screen bg-[#05090d] text-slate-100">
      <header className="border-b border-white/[0.06] bg-[#070c11]/95 px-5 py-5 backdrop-blur-xl lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300 lg:hidden">
              AEGRIS Control Center
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-white">
              Support
            </h1>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2">
            <span className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-500">
              {overview.totalTickets} ticketů
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8 lg:py-10">
        <section className="mb-8">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
            Support Operations
          </div>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white">
            Support centrum
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
            Interní přehled zákaznických požadavků a support ticketů.
          </p>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Ticketů celkem" value={overview.totalTickets} />
          <Metric label="Open" value={overview.openTickets} tone="warning" />
          <Metric label="In progress" value={overview.inProgressTickets} tone="cyan" />
          <Metric label="Vyřešené" value={overview.resolvedTickets} tone="positive" />
          <Metric label="Urgentní" value={overview.urgentTickets} tone="danger" />
        </div>

        <section className="mt-8 overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#0a1016]">
          <div className="border-b border-white/[0.06] px-6 py-5">
            <div className="text-[8px] font-black uppercase tracking-[0.14em] text-cyan-300">
              Ticket Registry
            </div>
            <h3 className="mt-2 text-lg font-black text-white">
              Support tickety
            </h3>
            <p className="mt-1 text-[9px] leading-5 text-slate-600">
              Aktuálně evidované požadavky zákazníků.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-white/[0.06] bg-[#071017]">
                <tr>
                  {[
                    "Ticket",
                    "Zákazník",
                    "Status",
                    "Priorita",
                    "Vytvořeno",
                    "Vyřešeno",
                    "Účet",
                  ].map((label, index) => (
                    <th
                      key={label}
                      className={`px-5 py-4 text-[8px] font-black uppercase tracking-[0.13em] text-slate-700 ${
                        index === 6 ? "text-right" : "text-left"
                      }`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.05]">
                {overview.tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <div className="max-w-md">
                        <p className="text-[11px] font-black text-white">
                          {ticket.subject}
                        </p>
                        <p className="mt-1 text-[8px] text-slate-700">
                          Ticket #{ticket.id}
                        </p>
                        <p className="mt-2 line-clamp-2 text-[9px] leading-5 text-slate-600">
                          {ticket.message}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-[10px] text-slate-400">
                      {ticket.email}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-lg border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] ${getStatusClasses(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-black ${getPriorityClasses(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-[10px] text-slate-500">
                      {formatDate(ticket.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-[10px] text-slate-500">
                      {formatDate(ticket.resolvedAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {ticket.userId ? (
                        <Link
                          href={`/admin/customers/${ticket.userId}`}
                          className="text-[10px] font-black text-cyan-300 transition hover:text-cyan-200"
                        >
                          Otevřít →
                        </Link>
                      ) : (
                        <span className="text-[10px] text-slate-700">
                          Bez účtu
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {overview.tickets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center">
                      <p className="text-[11px] font-black text-white">
                        Žádné support tickety
                      </p>
                      <p className="mt-2 text-[9px] text-slate-600">
                        Support infrastruktura je připravená, ale zatím nebyl
                        vytvořen žádný ticket.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-5 rounded-2xl border border-white/[0.06] bg-[#0a1016] px-5 py-4">
          <div className="text-[7px] font-black uppercase tracking-[0.14em] text-slate-700">
            Read-only support
          </div>
          <p className="mt-2 text-[9px] leading-5 text-slate-600">
            Support je zatím read-only. Změny statusu, priority, odpovědi
            administrátora a zákaznický support formulář doplníme přes
            auditované serverové akce.
          </p>
        </div>
      </main>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "warning" | "cyan" | "positive" | "danger";
}) {
  const valueClass =
    tone === "warning"
      ? "text-amber-300"
      : tone === "cyan"
        ? "text-cyan-300"
        : tone === "positive"
          ? "text-emerald-300"
          : tone === "danger"
            ? "text-rose-300"
            : "text-white";

  return (
    <section className="rounded-[18px] border border-white/[0.07] bg-[#0a1016] p-5">
      <div className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-600">
        {label}
      </div>
      <div className={`mt-4 text-3xl font-black tracking-[-0.04em] ${valueClass}`}>
        {value}
      </div>
    </section>
  );
}
