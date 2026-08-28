import { getAdminCustomers } from "@/lib/admin/customers";
import Link from "next/link";

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
  }).format(date);
}

function getDemoStatus(
  accountType: string,
  demoExpiresAt: string | null
) {
  if (accountType !== "demo") {
    return {
      label: "—",
      className: "text-slate-500",
    };
  }

  if (!demoExpiresAt) {
    return {
      label: "Bez expirace",
      className: "text-amber-300",
    };
  }

  const expiresAt = Date.parse(demoExpiresAt);

  if (!Number.isFinite(expiresAt)) {
    return {
      label: "Neplatné datum",
      className: "text-rose-300",
    };
  }

  if (expiresAt <= Date.now()) {
    return {
      label: "Expirace",
      className: "text-rose-300",
    };
  }

  return {
    label: "Aktivní",
    className: "text-emerald-300",
  };
}

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/80 px-5 py-5 backdrop-blur lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400 lg:hidden">
              AEGRIS Control Center
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Zákazníci
            </h2>
          </div>

          <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5">
            <span className="text-xs font-medium text-slate-300">
              {customers.length} účtů
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
        <div className="mb-8">
          <h3 className="text-2xl font-semibold tracking-tight">
            Přehled zákaznických účtů
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Interní přehled účtů, typů přístupu, DEMO expirací
            a projektů evidovaných v AEGRIS.
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-slate-800 bg-slate-950/60">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Uživatel
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Account
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Role
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    DEMO
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Začátek
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Expirace
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Projekty
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {customers.map((customer) => {
                  const demoStatus = getDemoStatus(
                    customer.accountType,
                    customer.demoExpiresAt
                  );

                  return (
                    <tr
                      key={customer.id}
                      className="transition hover:bg-slate-800/30"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <Link
                           href={`/admin/customers/${customer.id}`}
                           className="font-medium text-slate-100 transition hover:text-cyan-300"
                         >
                           {customer.email ?? "Bez e-mailu"}
                        </Link>

                          <p className="mt-1 max-w-[260px] truncate text-xs text-slate-600">
                            {customer.id}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            customer.accountType === "active"
                              ? "inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300"
                              : customer.accountType === "demo"
                                ? "inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300"
                                : "inline-flex rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300"
                          }
                        >
                          {customer.accountType}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            customer.systemRole === "admin"
                              ? "text-sm font-medium text-cyan-300"
                              : "text-sm text-slate-400"
                          }
                        >
                          {customer.systemRole}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`text-sm font-medium ${demoStatus.className}`}
                        >
                          {demoStatus.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {formatDate(customer.demoStartedAt)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {formatDate(customer.demoExpiresAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-semibold text-slate-200">
                          {customer.projectsCount}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {customers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      V databázi nejsou žádné zákaznické profily.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4">
          <p className="text-xs leading-5 text-slate-500">
            Tato verze je zatím pouze pro čtení. Změny účtů,
            prodlužování DEMO, blokace a další administrativní
            zásahy přidáme až přes bezpečné serverové akce
            s audit logem.
          </p>
        </div>
      </div>
    </>
  );
}