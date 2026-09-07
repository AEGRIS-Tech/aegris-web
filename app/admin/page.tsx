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
      tone: "default",
    },
    {
      label: "Aktivní účty",
      value: formatNumber(overview.activeAccounts),
      description: "Plné aktivní účty",
      tone: "positive",
    },
    {
      label: "Aktivní DEMO",
      value: formatNumber(overview.activeDemos),
      description: "Právě běžící zkušební účty",
      tone: "cyan",
    },
    {
      label: "DEMO končí brzy",
      value: formatNumber(overview.demosEndingSoon),
      description: "Expirace během 3 dnů",
      tone: overview.demosEndingSoon > 0 ? "warning" : "default",
    },
    {
      label: "Projekty",
      value: formatNumber(overview.projects),
      description: "Celkem projektů v AEGRIS",
      tone: "default",
    },
    {
      label: "Celková plocha",
      value: `${formatNumber(overview.totalAreaHa)} ha`,
      description: "Součet evidované plochy",
      tone: "default",
    },
    {
      label: "Analýzy",
      value: formatNumber(overview.analyses),
      description: "Celkem uložených analýz",
      tone: "cyan",
    },
  ];

  return (
    <div className="min-h-screen bg-[#05090d] text-slate-100">
      <header className="border-b border-white/[0.06] bg-[#070c11]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-5 lg:px-8">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
              AEGRIS Control Center
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-[-0.035em] text-white">
              Admin Operations
            </h1>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-300/10 bg-emerald-300/[0.04] px-3 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            <span className="text-[8px] font-black uppercase tracking-[0.12em] text-emerald-300">
              Admin access active
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8 lg:py-10">
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-600">
              Platform Overview
            </div>
            <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.045em] text-white md:text-5xl">
              Provozní stav AEGRIS na jednom místě.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              Přehled zákaznických účtů, demo provozu, projektů a analytické
              aktivity. Admin zůstává zaměřený na operativní řízení, ne na
              produktovou prezentaci.
            </p>
          </div>

          <section className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-5">
            <div className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-600">
              Control Summary
            </div>

            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/[0.05]">
              <MiniMetric
                label="Účty"
                value={formatNumber(overview.customers)}
              />
              <MiniMetric
                label="Projekty"
                value={formatNumber(overview.projects)}
              />
              <MiniMetric
                label="Analýzy"
                value={formatNumber(overview.analyses)}
              />
              <MiniMetric
                label="Plocha"
                value={`${formatNumber(overview.totalAreaHa)} ha`}
              />
            </div>
          </section>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="text-[8px] font-black uppercase tracking-[0.15em] text-cyan-300">
                Key Metrics
              </div>
              <h3 className="mt-2 text-xl font-black text-white">
                AEGRIS v číslech
              </h3>
            </div>

            <div className="hidden text-[8px] uppercase tracking-[0.12em] text-slate-700 md:block">
              Current platform state
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <MetricCard
                key={card.label}
                label={card.label}
                value={card.value}
                description={card.description}
                tone={card.tone}
              />
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[24px] border border-white/[0.07] bg-[#0a1016] p-5 sm:p-6">
            <div className="flex flex-col gap-3 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[8px] font-black uppercase tracking-[0.15em] text-cyan-300">
                  Administration
                </div>
                <h3 className="mt-2 text-xl font-black text-white">
                  Správa AEGRIS
                </h3>
              </div>

              <p className="max-w-sm text-[9px] leading-5 text-slate-600">
                Rychlý přístup k provozním částem administrace.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <AdminLink
                href="/admin/customers"
                index="01"
                title="Zákazníci"
                description="Účty, DEMO, projekty a aktivita"
              />
              <AdminLink
                href="/admin/demo"
                index="02"
                title="DEMO management"
                description="Žádosti, aktivace a expirace"
              />
              <AdminLink
                href="/admin/projects"
                index="03"
                title="Projekty"
                description="Přehled polí a evidované plochy"
              />
              <AdminLink
                href="/admin/analyses"
                index="04"
                title="Analýzy"
                description="Analytická aktivita systému"
              />
              <AdminLink
                href="/admin/support"
                index="05"
                title="Support"
                description="Podpora, požadavky a otevřené případy"
              />
              <AdminLink
                href="/admin/system"
                index="06"
                title="Systém"
                description="Provozní a technický stav platformy"
              />
            </div>
          </div>

          <div className="grid gap-4">
            <section className="rounded-[24px] border border-white/[0.07] bg-[#0a1016] p-5 sm:p-6">
              <div className="text-[8px] font-black uppercase tracking-[0.15em] text-cyan-300">
                System State
              </div>
              <h3 className="mt-2 text-xl font-black text-white">
                Stav systému
              </h3>

              <div className="mt-6 space-y-4">
                <StatusRow
                  label="Admin access"
                  value="OK"
                  status="positive"
                />
                <StatusRow
                  label="Datová vrstva"
                  value="OK"
                  status="positive"
                />
                <StatusRow
                  label="Control Center"
                  value="Aktivní"
                  status="cyan"
                />
              </div>

              <div className="mt-6 border-t border-white/[0.06] pt-5">
                <p className="text-[9px] leading-5 text-slate-600">
                  Detailní monitoring API, cronů a externích služeb je dostupný
                  v sekci Systém.
                </p>

                <Link
                  href="/admin/system"
                  className="mt-4 inline-flex rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[8px] font-black uppercase tracking-[0.1em] text-slate-400 transition hover:border-cyan-300/20 hover:text-white"
                >
                  Otevřít systém
                </Link>
              </div>
            </section>

            <section className="rounded-[24px] border border-white/[0.07] bg-[#0a1016] p-5 sm:p-6">
              <div className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-600">
                Operational Focus
              </div>

              <div className="mt-3 text-sm font-black text-white">
                Co vyžaduje pozornost
              </div>

              <div className="mt-4 space-y-3">
                <AttentionRow
                  label="DEMO končí do 3 dnů"
                  value={formatNumber(overview.demosEndingSoon)}
                  active={overview.demosEndingSoon > 0}
                />
                <AttentionRow
                  label="Aktivní DEMO"
                  value={formatNumber(overview.activeDemos)}
                  active={overview.activeDemos > 0}
                />
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  tone,
}: {
  label: string;
  value: string;
  description: string;
  tone: string;
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-300"
      : tone === "cyan"
        ? "text-cyan-300"
        : tone === "warning"
          ? "text-amber-300"
          : "text-white";

  return (
    <article className="rounded-[18px] border border-white/[0.07] bg-[#0a1016] p-5">
      <div className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-600">
        {label}
      </div>

      <div className={`mt-4 text-3xl font-black tracking-[-0.04em] ${toneClass}`}>
        {value}
      </div>

      <p className="mt-2 text-[9px] leading-5 text-slate-600">
        {description}
      </p>
    </article>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#071017] p-4">
      <div className="text-[7px] font-black uppercase tracking-[0.12em] text-slate-700">
        {label}
      </div>
      <div className="mt-2 text-sm font-black text-white">{value}</div>
    </div>
  );
}

function AdminLink({
  href,
  index,
  title,
  description,
}: {
  href: string;
  index: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/[0.06] bg-[#071017] p-5 transition hover:border-cyan-300/20 hover:bg-[#09131a]"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-[8px] font-black tracking-[0.12em] text-cyan-300/60">
          {index}
        </span>
        <span className="text-[10px] text-slate-800 transition group-hover:text-cyan-300/50">
          ↗
        </span>
      </div>

      <div className="mt-6 text-sm font-black text-white">{title}</div>
      <div className="mt-2 text-[9px] leading-5 text-slate-600">
        {description}
      </div>
    </Link>
  );
}

function StatusRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "positive" | "cyan";
}) {
  const valueClass =
    status === "positive" ? "text-emerald-300" : "text-cyan-300";

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[9px] text-slate-500">{label}</span>
      <span className={`text-[8px] font-black uppercase tracking-[0.1em] ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

function AttentionRow({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-[#071017] px-4 py-3">
      <div className="text-[9px] text-slate-500">{label}</div>
      <div
        className={`text-sm font-black ${
          active ? "text-amber-300" : "text-slate-600"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
