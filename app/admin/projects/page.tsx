import Link from "next/link";

import { getAdminProjectsOverview } from "@/lib/admin/projects";

function formatNumber(value: number) {
  return new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits: 2,
  }).format(value);
}

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

function getRiskClasses(risk: string | null) {
  if (!risk) {
    return "text-slate-700";
  }

  const normalized = risk.toLowerCase();

  if (normalized.includes("critical") || normalized.includes("krit")) {
    return "text-rose-400";
  }

  if (normalized.includes("high") || normalized.includes("vysok")) {
    return "text-rose-300";
  }

  if (
    normalized.includes("medium") ||
    normalized.includes("střed") ||
    normalized.includes("stred")
  ) {
    return "text-amber-300";
  }

  if (
    normalized.includes("low") ||
    normalized.includes("nízk") ||
    normalized.includes("nizk")
  ) {
    return "text-emerald-300";
  }

  return "text-slate-300";
}

export default async function AdminProjectsPage() {
  const overview = await getAdminProjectsOverview();

  return (
    <div className="min-h-screen bg-[#05090d] text-slate-100">
      <header className="border-b border-white/[0.06] bg-[#070c11]/95 px-5 py-5 backdrop-blur-xl lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300 lg:hidden">
              AEGRIS Control Center
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-white">
              Projekty
            </h1>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2">
            <span className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-500">
              {overview.totalProjects} projektů
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8 lg:py-10">
        <section className="mb-8">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
            Project Registry
          </div>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white">
            Přehled projektů
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
            Centrální přehled všech polí a projektů evidovaných napříč AEGRIS.
          </p>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Projekty celkem" value={`${overview.totalProjects}`} />
          <Metric label="Celková plocha" value={`${formatNumber(overview.totalAreaHa)} ha`} tone="cyan" />
          <Metric label="Projekty s analýzou" value={`${overview.projectsWithAnalyses}`} tone="positive" />
          <Metric label="Analýzy celkem" value={`${overview.totalAnalyses}`} />
        </div>

        <section className="mt-8 overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#0a1016]">
          <div className="border-b border-white/[0.06] px-6 py-5">
            <div className="text-[8px] font-black uppercase tracking-[0.14em] text-cyan-300">
              All Projects
            </div>
            <h3 className="mt-2 text-lg font-black text-white">Všechny projekty</h3>
            <p className="mt-1 text-[9px] leading-5 text-slate-600">
              Zákazník, plodina, plocha a analytická aktivita.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-white/[0.06] bg-[#071017]">
                <tr>
                  {[
                    "Projekt",
                    "Zákazník",
                    "Plodina",
                    "Fáze",
                    "Plocha",
                    "Analýzy",
                    "Poslední analýza",
                    "NDVI",
                    "Risk",
                    "Detail",
                  ].map((label, index) => (
                    <th
                      key={label}
                      className={`px-5 py-4 text-[8px] font-black uppercase tracking-[0.13em] text-slate-700 ${
                        [4, 5, 9].includes(index) ? "text-right" : "text-left"
                      }`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.05]">
                {overview.projects.map((project) => (
                  <tr
                    key={project.id}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-[11px] font-black text-white">
                          {project.name ?? "Projekt bez názvu"}
                        </p>
                        <p className="mt-1 text-[8px] text-slate-700">
                          ID {project.id}
                        </p>
                        {project.status && (
                          <p className="mt-1 text-[8px] text-slate-600">
                            {project.status}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {project.ownerId ? (
                        <Link
                          href={`/admin/customers/${project.ownerId}`}
                          className="text-[10px] font-black text-cyan-300 transition hover:text-cyan-200"
                        >
                          {project.ownerEmail ?? project.ownerId}
                        </Link>
                      ) : (
                        <span className="text-[10px] text-slate-700">
                          Bez vlastníka
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-[10px] text-slate-300">
                      {project.cropName ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-[10px] text-slate-500">
                      {project.growthStage ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-right text-[10px] font-black text-white">
                      {formatNumber(project.areaHa)} ha
                    </td>
                    <td className="px-5 py-4 text-right text-[10px] font-black text-white">
                      {project.analysesCount}
                    </td>
                    <td className="px-5 py-4 text-[10px] text-slate-500">
                      {formatDate(project.lastAnalysisAt)}
                    </td>
                    <td className="px-5 py-4 text-[10px] font-black text-white">
                      {project.lastNdvi === null
                        ? "—"
                        : formatNumber(project.lastNdvi)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-black ${getRiskClasses(
                          project.lastRisk
                        )}`}
                      >
                        {project.lastRisk ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="text-[10px] font-black text-cyan-300 transition hover:text-cyan-200"
                      >
                        Otevřít →
                      </Link>
                    </td>
                  </tr>
                ))}

                {overview.projects.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-5 py-14 text-center text-[10px] text-slate-600"
                    >
                      V AEGRIS nejsou evidované žádné projekty.
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
            Přehled projektů je zatím pouze pro čtení. Administrativní změny
            projektů přidáme pouze přes serverové akce a audit log.
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
  value: string;
  tone?: "default" | "cyan" | "positive";
}) {
  const valueClass =
    tone === "cyan"
      ? "text-cyan-300"
      : tone === "positive"
        ? "text-emerald-300"
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
