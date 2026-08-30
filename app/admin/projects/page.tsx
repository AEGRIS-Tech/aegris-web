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
    return "text-slate-500";
  }

  const normalized = risk.toLowerCase();

  if (
    normalized.includes("high") ||
    normalized.includes("vysok")
  ) {
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
    <>
      <header className="border-b border-slate-800 bg-slate-950/80 px-5 py-5 backdrop-blur lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400 lg:hidden">
              AEGRIS Control Center
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Projekty
            </h2>
          </div>

          <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5">
            <span className="text-xs font-medium text-slate-300">
              {overview.totalProjects} projektů
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
        <div className="mb-8">
          <h3 className="text-2xl font-semibold tracking-tight">
            Přehled projektů
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Centrální přehled všech polí a projektů evidovaných
            napříč AEGRIS.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Projekty celkem
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {overview.totalProjects}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Celková plocha
            </p>

            <p className="mt-3 text-3xl font-semibold text-cyan-300">
              {formatNumber(overview.totalAreaHa)} ha
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Projekty s analýzou
            </p>

            <p className="mt-3 text-3xl font-semibold text-emerald-300">
              {overview.projectsWithAnalyses}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Analýzy celkem
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {overview.totalAnalyses}
            </p>
          </section>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="border-b border-slate-800 px-6 py-5">
            <h3 className="font-semibold">
              Všechny projekty
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Zákazník, plodina, plocha a analytická aktivita.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-slate-800 bg-slate-950/60">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Projekt
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Zákazník
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Plodina
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Fáze
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Plocha
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Analýzy
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Poslední analýza
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    NDVI
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Risk
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Detail
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {overview.projects.map((project) => (
                  <tr
                    key={project.id}
                    className="transition hover:bg-slate-800/30"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-slate-100">
                          {project.name ?? "Projekt bez názvu"}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          ID {project.id}
                        </p>

                        {project.status && (
                          <p className="mt-1 text-xs text-slate-500">
                            {project.status}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {project.ownerId ? (
                        <Link
                          href={`/admin/customers/${project.ownerId}`}
                          className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                        >
                          {project.ownerEmail ?? project.ownerId}
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-600">
                          Bez vlastníka
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-300">
                      {project.cropName ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {project.growthStage ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-medium text-slate-200">
                      {formatNumber(project.areaHa)} ha
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold text-slate-200">
                      {project.analysesCount}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {formatDate(project.lastAnalysisAt)}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-200">
                      {project.lastNdvi === null
                        ? "—"
                        : formatNumber(project.lastNdvi)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-sm font-medium ${getRiskClasses(
                          project.lastRisk
                        )}`}
                      >
                        {project.lastRisk ?? "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
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
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      V AEGRIS nejsou evidované žádné projekty.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4">
          <p className="text-xs leading-5 text-slate-500">
            Přehled projektů je zatím pouze pro čtení. Administrativní
            změny projektů přidáme pouze přes serverové akce a audit log.
          </p>
        </div>
      </div>
    </>
  );
}