import Link from "next/link";

import { getAdminCustomers } from "@/lib/admin/customers";

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
      className: "text-slate-700",
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
    <div className="min-h-screen bg-[#05090d] text-slate-100">
      <header className="border-b border-white/[0.06] bg-[#070c11]/95 px-5 py-5 backdrop-blur-xl lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300 lg:hidden">
              AEGRIS Control Center
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-white">
              Zákazníci
            </h1>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2">
            <span className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-500">
              {customers.length} účtů
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8 lg:py-10">
        <section className="mb-8">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
            Customer Registry
          </div>

          <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white">
            Přehled zákaznických účtů
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
            Interní přehled účtů, typů přístupu, DEMO expirací a projektů
            evidovaných v AEGRIS.
          </p>
        </section>

        <section className="overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#0a1016]">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-white/[0.06] bg-[#071017]">
                <tr>
                  {[
                    "Uživatel",
                    "Account",
                    "Role",
                    "DEMO",
                    "Začátek",
                    "Expirace",
                    "Projekty",
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
                {customers.map((customer) => {
                  const demoStatus = getDemoStatus(
                    customer.accountType,
                    customer.demoExpiresAt
                  );

                  return (
                    <tr
                      key={customer.id}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="text-[11px] font-black text-white transition hover:text-cyan-300"
                          >
                            {customer.email ?? "Bez e-mailu"}
                          </Link>

                          <p className="mt-1 max-w-[260px] truncate text-[8px] text-slate-700">
                            {customer.id}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            customer.accountType === "active"
                              ? "inline-flex rounded-lg border border-emerald-300/10 bg-emerald-300/[0.04] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-emerald-300"
                              : customer.accountType === "demo"
                                ? "inline-flex rounded-lg border border-amber-300/10 bg-amber-300/[0.04] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-amber-300"
                                : "inline-flex rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-slate-500"
                          }
                        >
                          {customer.accountType}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            customer.systemRole === "admin"
                              ? "text-[10px] font-black text-cyan-300"
                              : "text-[10px] text-slate-500"
                          }
                        >
                          {customer.systemRole}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold ${demoStatus.className}`}>
                          {demoStatus.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-[10px] text-slate-500">
                        {formatDate(customer.demoStartedAt)}
                      </td>

                      <td className="px-5 py-4 text-[10px] text-slate-500">
                        {formatDate(customer.demoExpiresAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className="text-[11px] font-black text-white">
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
                      className="px-5 py-14 text-center text-[10px] text-slate-600"
                    >
                      V databázi nejsou žádné zákaznické profily.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-5 rounded-2xl border border-white/[0.06] bg-[#0a1016] px-5 py-4">
          <div className="text-[7px] font-black uppercase tracking-[0.14em] text-slate-700">
            Read-only administration
          </div>
          <p className="mt-2 text-[9px] leading-5 text-slate-600">
            Tato verze je zatím pouze pro čtení. Změny účtů, prodlužování DEMO,
            blokace a další administrativní zásahy přidáme až přes bezpečné
            serverové akce s audit logem.
          </p>
        </div>
      </main>
    </div>
  );
}
