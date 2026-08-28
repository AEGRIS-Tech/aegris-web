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
    return "border-amber-500/20 bg-amber-500/10 text-amber-300";
  }

  if (status === "in_progress") {
    return "border-cyan-500/20 bg-cyan-500/10 text-cyan-300";
  }

  if (status === "resolved") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-300";
  }

  if (status === "closed") {
    return "border-slate-700 bg-slate-800 text-slate-400";
  }

  return "border-slate-700 bg-slate-800 text-slate-300";
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

  return "text-slate-500";
}

export default async function AdminSupportPage() {
  const overview = await getAdminSupportOverview();

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/80 px-5 py-5 backdrop-blur lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400 lg:hidden">
              AEGRIS Control Center
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Support
            </h2>
          </div>

          <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5">
            <span className="text-xs font-medium text-slate-300">
              {overview.totalTickets} ticketů
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
        <div className="mb-8">
          <h3 className="text-2xl font-semibold tracking-tight">
            Support centrum
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Interní přehled zákaznických požadavků a support ticketů.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Ticketů celkem
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {overview.totalTickets}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Open
            </p>

            <p className="mt-3 text-3xl font-semibold text-amber-300">
              {overview.openTickets}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              In progress
            </p>

            <p className="mt-3 text-3xl font-semibold text-cyan-300">
              {overview.inProgressTickets}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Vyřešené
            </p>

            <p className="mt-3 text-3xl font-semibold text-emerald-300">
              {overview.resolvedTickets}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Urgentní
            </p>

            <p className="mt-3 text-3xl font-semibold text-rose-300">
              {overview.urgentTickets}
            </p>
          </section>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="border-b border-slate-800 px-6 py-5">
            <h3 className="font-semibold">
              Support tickety
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Aktuálně evidované požadavky zákazníků.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-slate-800 bg-slate-950/60">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Ticket
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Zákazník
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Priorita
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Vytvořeno
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Vyřešeno
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Účet
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {overview.tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="transition hover:bg-slate-800/30"
                  >
                    <td className="px-5 py-4">
                      <div className="max-w-md">
                        <p className="font-medium text-slate-100">
                          {ticket.subject}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Ticket #{ticket.id}
                        </p>

                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
                          {ticket.message}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-300">
                      {ticket.email}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-sm font-medium ${getPriorityClasses(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {formatDate(ticket.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {formatDate(ticket.resolvedAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {ticket.userId ? (
                        <Link
                          href={`/admin/customers/${ticket.userId}`}
                          className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                        >
                          Otevřít →
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-600">
                          Bez účtu
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {overview.tickets.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-14 text-center"
                    >
                      <p className="text-sm font-medium text-slate-300">
                        Žádné support tickety
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Support infrastruktura je připravená, ale zatím nebyl vytvořen žádný ticket.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4">
          <p className="text-xs leading-5 text-slate-500">
            Support je zatím read-only. Změny statusu, priority,
            odpovědi administrátora a zákaznický support formulář
            doplníme přes auditované serverové akce.
          </p>
        </div>
      </div>
    </>
  );
}