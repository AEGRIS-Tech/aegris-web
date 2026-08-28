import Link from "next/link";

import { getAdminDemoOverview } from "@/lib/admin/demo";

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
  if (status === "contacted") {
    return "border-cyan-500/20 bg-cyan-500/10 text-cyan-300";
  }

  return "border-slate-700 bg-slate-800 text-slate-300";
}

export default async function AdminDemoPage() {
  const overview = await getAdminDemoOverview();

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/80 px-5 py-5 backdrop-blur lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400 lg:hidden">
              AEGRIS Control Center
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              DEMO
            </h2>
          </div>

          <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5">
            <span className="text-xs font-medium text-slate-300">
              {overview.totalRequests} žádostí
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
        <div className="mb-8">
          <h3 className="text-2xl font-semibold tracking-tight">
            DEMO management
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Přehled DEMO žádostí, aktivních účtů, expirací
            a napojení žádostí na uživatele AEGRIS.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Žádosti celkem</p>
            <p className="mt-3 text-3xl font-semibold">
              {overview.totalRequests}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Contacted</p>
            <p className="mt-3 text-3xl font-semibold text-cyan-300">
              {overview.contactedRequests}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">DEMO profily</p>
            <p className="mt-3 text-3xl font-semibold">
              {overview.demoProfilesTotal}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Aktivní DEMO</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-300">
              {overview.activeDemos}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">Expirované DEMO</p>
            <p className="mt-3 text-3xl font-semibold text-rose-300">
              {overview.expiredDemos}
            </p>
          </section>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="border-b border-slate-800 px-6 py-5">
            <h3 className="font-semibold">DEMO žádosti</h3>
            <p className="mt-1 text-sm text-slate-500">
              Aktuální stav onboardingových žádostí.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-slate-800 bg-slate-950/60">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Žadatel
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Firma
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Žádost
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    DEMO začátek
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Expirace
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Zbývá
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Účet
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {overview.requests.map((request) => (
                  <tr
                    key={request.id}
                    className="transition hover:bg-slate-800/30"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-slate-100">
                          {request.fullName ?? "Bez jména"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {request.email}
                        </p>

                        {request.phone && (
                          <p className="mt-1 text-xs text-slate-600">
                            {request.phone}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-300">
                      {request.company ?? "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {formatDate(request.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {formatDate(request.demoStartedAt)}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {formatDate(request.demoExpiresAt)}
                    </td>

                    <td className="px-5 py-4">
                      {request.isActive ? (
                        <span className="text-sm font-medium text-emerald-300">
                          {request.daysRemaining} dní
                        </span>
                      ) : request.isExpired ? (
                        <span className="text-sm font-medium text-rose-300">
                          Expired
                        </span>
                      ) : (
                        <span className="text-sm text-slate-500">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {request.matchedUserId ? (
                        <Link
                          href={`/admin/customers/${request.matchedUserId}`}
                          className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                        >
                          Otevřít →
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-600">
                          Nenalezen
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {overview.requests.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      Nejsou evidované žádné DEMO žádosti.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4">
          <p className="text-xs leading-5 text-slate-500">
            DEMO management je zatím read-only. Prodloužení,
            deaktivace a další zásahy přidáme až přes auditované
            serverové akce.
          </p>
        </div>
      </div>
    </>
  );
}
