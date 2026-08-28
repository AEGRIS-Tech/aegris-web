import Link from "next/link";
import { notFound } from "next/navigation";

import { getAdminCustomerDetail } from "@/lib/admin/customer-detail";

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

function formatNumber(value: number) {
  return new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits: 1,
  }).format(value);
}

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const customer = await getAdminCustomerDetail(id);

  if (!customer) {
    notFound();
  }

  const demoActive =
    customer.accountType === "demo" &&
    customer.demoExpiresAt &&
    Date.parse(customer.demoExpiresAt) > Date.now();

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/80 px-5 py-5 backdrop-blur lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/customers"
              className="text-sm text-slate-500 transition hover:text-white"
            >
              ← Zákazníci
            </Link>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Detail zákazníka
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={
                customer.accountType === "active"
                  ? "rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300"
                  : customer.accountType === "demo"
                    ? "rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300"
                    : "rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300"
              }
            >
              {customer.accountType}
            </span>

            {customer.systemRole === "admin" && (
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300">
                admin
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">
                Uživatelský účet
              </p>

              <h3 className="mt-2 break-all text-2xl font-semibold tracking-tight">
                {customer.email ?? "Bez e-mailu"}
              </h3>

              <p className="mt-3 break-all text-xs text-slate-600">
                {customer.id}
              </p>
            </div>

            <div className="grid min-w-full gap-3 sm:grid-cols-3 xl:min-w-[520px]">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Projekty
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {customer.projectsCount}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Plocha
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {formatNumber(customer.totalAreaHa)} ha
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Analýzy
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {customer.analysesCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h3 className="font-semibold">
              Účet
            </h3>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Account type
                </span>

                <span className="text-sm font-medium text-slate-200">
                  {customer.accountType}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  System role
                </span>

                <span
                  className={
                    customer.systemRole === "admin"
                      ? "text-sm font-medium text-cyan-300"
                      : "text-sm font-medium text-slate-200"
                  }
                >
                  {customer.systemRole}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Vytvořen
                </span>

                <span className="text-right text-sm text-slate-300">
                  {formatDate(customer.createdAt)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h3 className="font-semibold">
              DEMO
            </h3>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Stav
                </span>

                <span
                  className={
                    demoActive
                      ? "text-sm font-medium text-emerald-300"
                      : customer.accountType === "demo"
                        ? "text-sm font-medium text-rose-300"
                        : "text-sm font-medium text-slate-500"
                  }
                >
                  {customer.accountType !== "demo"
                    ? "Nepoužívá DEMO"
                    : demoActive
                      ? "Aktivní"
                      : "Neaktivní"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Začátek
                </span>

                <span className="text-right text-sm text-slate-300">
                  {formatDate(customer.demoStartedAt)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Expirace
                </span>

                <span className="text-right text-sm text-slate-300">
                  {formatDate(customer.demoExpiresAt)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h3 className="font-semibold">
              Support přehled
            </h3>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Projekty
                </span>

                <span className="text-sm font-medium text-slate-200">
                  {customer.projectsCount}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Analýzy
                </span>

                <span className="text-sm font-medium text-slate-200">
                  {customer.analysesCount}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Evidovaná plocha
                </span>

                <span className="text-sm font-medium text-slate-200">
                  {formatNumber(customer.totalAreaHa)} ha
                </span>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="border-b border-slate-800 px-6 py-5">
            <h3 className="font-semibold">
              Projekty zákazníka
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Projekty aktuálně evidované pod tímto účtem.
            </p>
          </div>

          {customer.projects.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {customer.projects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-100">
                      {project.name ?? "Projekt bez názvu"}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-600">
                      {project.id}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-300">
                      {formatNumber(project.areaHa)} ha
                    </span>

                    <Link
                      href={`/projects/${project.id}`}
                      className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                    >
                      Otevřít projekt →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Tento zákazník zatím nemá žádné projekty.
            </div>
          )}
        </section>

        <div className="mt-6 rounded-xl border border-amber-500/10 bg-amber-500/5 px-5 py-4">
          <p className="text-xs leading-5 text-amber-200/70">
            Detail je zatím pouze pro čtení. Změny account type,
            DEMO expirace, blokace účtu a další zásahy přidáme až
            přes serverové akce s audit logem.
          </p>
        </div>
      </div>
    </>
  );
}