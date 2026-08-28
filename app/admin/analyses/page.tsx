import Link from "next/link";

import { getAdminAnalysesOverview } from "@/lib/admin/analyses";

function formatNumber(value: number | null, digits = 2) {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits: digits,
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
    normalized.includes("critical") ||
    normalized.includes("krit")
  ) {
    return "text-rose-400";
  }

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

export default async function AdminAnalysesPage() {
  const overview = await getAdminAnalysesOverview();

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/80 px-5 py-5 backdrop-blur lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400 lg:hidden">
              AEGRIS Control Center
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Analýzy
            </h2>
          </div>

          <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5">
            <span className="text-xs font-medium text-slate-300">
              {overview.totalAnalyses} analýz
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
        <div className="mb-8">
          <h3 className="text-2xl font-semibold tracking-tight">
            Analytická aktivita
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Provozní přehled výsledků analytického enginu napříč
            všemi projekty AEGRIS.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Analýzy celkem
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {overview.totalAnalyses}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Dnes
            </p>

            <p className="mt-3 text-3xl font-semibold text-cyan-300">
              {overview.analysesToday}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Posledních 7 dní
            </p>

            <p className="mt-3 text-3xl font-semibold text-emerald-300">
              {overview.analysesLast7Days}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              High risk
            </p>

            <p className="mt-3 text-3xl font-semibold text-rose-300">
              {overview.highRiskAnalyses}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Projekty
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {overview.projectsAnalysed}
            </p>
          </section>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          <div className="border-b border-slate-800 px-6 py-5">
            <h3 className="font-semibold">
              Poslední analýzy
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Nejnovější analytické výsledky napříč AEGRIS.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-slate-800 bg-slate-950/60">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Datum
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Projekt
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Zákazník
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    NDVI
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Vegetace
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Risk
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Valid geom.
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Quality gate
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Provider
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Satelit
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Detail
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {overview.analyses.map((analysis) => (
                  <tr
                    key={analysis.id}
                    className="transition hover:bg-slate-800/30"
                  >
                    <td className="px-5 py-4 text-sm text-slate-400">
                      {formatDate(analysis.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-slate-100">
                          {analysis.projectName ?? `Projekt ${analysis.projectId}`}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Analýza ID {analysis.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {analysis.ownerId ? (
                        <Link
                          href={`/admin/customers/${analysis.ownerId}`}
                          className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                        >
                          {analysis.ownerEmail ?? analysis.ownerId}
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-600">
                          Bez vlastníka
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-medium text-slate-200">
                      {formatNumber(analysis.ndvi)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-300">
                      {formatNumber(analysis.vegetation, 1)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-sm font-medium ${getRiskClasses(
                          analysis.risk
                        )}`}
                      >
                        {analysis.risk ?? "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-300">
                      {analysis.validGeometryPct === null
                        ? "—"
                        : `${formatNumber(analysis.validGeometryPct, 1)} %`}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-300">
                      {analysis.qualityGatePct === null
                        ? "—"
                        : `${formatNumber(analysis.qualityGatePct, 1)} %`}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {analysis.sourceProvider ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {analysis.satellite ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/projects/${analysis.projectId}`}
                        className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                      >
                        Otevřít →
                      </Link>
                    </td>
                  </tr>
                ))}

                {overview.analyses.length === 0 && (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      V AEGRIS nejsou evidované žádné analýzy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4">
          <p className="text-xs leading-5 text-slate-500">
            Analytický přehled je zatím pouze pro čtení. Diagnostické
            zásahy a opakované spuštění analýz přidáme až přes
            auditované serverové akce.
          </p>
        </div>
      </div>
    </>
  );
}