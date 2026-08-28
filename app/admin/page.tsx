import Link from "next/link";

import { getAdminOverview } from "@/lib/admin/overview";

function formatNumber(value: number) {
  return new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits: 1,
  }).format(value);
}

export default async function AdminPage() {
  const overview = await getAdminOverview();

  const cards = [
    {
      label: "Zákazníci",
      value: formatNumber(overview.customers),
      description: "Všechny uživatelské profily",
    },
    {
      label: "Aktivní účty",
      value: formatNumber(overview.activeAccounts),
      description: "Plné aktivní účty",
    },
    {
      label: "Aktivní DEMO",
      value: formatNumber(overview.activeDemos),
      description: "Právě běžící zkušební účty",
    },
    {
      label: "DEMO končí brzy",
      value: formatNumber(overview.demosEndingSoon),
      description: "Expirace během 3 dnů",
    },
    {
      label: "Projekty",
      value: formatNumber(overview.projects),
      description: "Celkem projektů v AEGRIS",
    },
    {
      label: "Celková plocha",
      value: `${formatNumber(overview.totalAreaHa)} ha`,
      description: "Součet evidované plochy",
    },
    {
      label: "Analýzy",
      value: formatNumber(overview.analyses),
      description: "Celkem uložených analýz",
    },
  ];

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/80 px-5 py-5 backdrop-blur lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400 lg:hidden">
              AEGRIS Control Center
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Přehled
            </h2>
          </div>

          <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
            <span className="text-xs font-medium text-emerald-300">
              Admin aktivní
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
        <div className="mb-8">
          <h3 className="text-2xl font-semibold tracking-tight">
            AEGRIS v číslech
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Aktuální provozní přehled zákazníků, DEMO účtů,
            projektů a analýz.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <section
              key={card.label}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-400">
                {card.label}
              </p>

              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {card.value}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {card.description}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-3">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 xl:col-span-2">
            <h3 className="font-semibold">
              Správa AEGRIS
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Rychlý přístup k hlavním částem administrace.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link
                href="/admin/customers"
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-cyan-500/40 hover:bg-slate-900"
              >
                <p className="font-medium">
                  Zákazníci
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Účty, DEMO, projekty a aktivita
                </p>
              </Link>

              <Link
                href="/admin/demo"
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-cyan-500/40 hover:bg-slate-900"
              >
                <p className="font-medium">
                  DEMO management
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Žádosti, aktivace a expirace
                </p>
              </Link>

              <Link
                href="/admin/projects"
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-cyan-500/40 hover:bg-slate-900"
              >
                <p className="font-medium">
                  Projekty
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Přehled polí a evidované plochy
                </p>
              </Link>

              <Link
                href="/admin/analyses"
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-cyan-500/40 hover:bg-slate-900"
              >
                <p className="font-medium">
                  Analýzy
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Analytická aktivita systému
                </p>
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h3 className="font-semibold">
              Stav systému
            </h3>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Admin access
                </span>

                <span className="text-sm font-medium text-emerald-300">
                  OK
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Datová vrstva
                </span>

                <span className="text-sm font-medium text-emerald-300">
                  OK
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Control Center
                </span>

                <span className="text-sm font-medium text-cyan-300">
                  Aktivní
                </span>
              </div>

              <div className="border-t border-slate-800 pt-5">
                <p className="text-xs leading-5 text-slate-500">
                  Detailní monitoring API, cronů a externích služeb
                  bude dostupný v sekci Systém.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}