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

export default async function AdminAnalysesPage() {
  const overview = await getAdminAnalysesOverview();

  return (
    <div className="min-h-screen bg-[#05090d] text-slate-100">
      <header className="border-b border-white/[0.06] bg-[#070c11]/95 px-5 py-5 backdrop-blur-xl lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300 lg:hidden">
              AEGRIS Control Center
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-white">
              Analýzy
            </h1>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2">
            <span className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-500">
              {overview.totalAnalyses} analýz
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8 lg:py-10">
        <section className="mb-8">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
            Analysis Operations
          </div>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white">
            Analytická aktivita
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
            Provozní přehled výsledků analytického enginu napříč všemi projekty
            AEGRIS.
          </p>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Analýzy celkem" value={overview.totalAnalyses} />
          <Metric label="Dnes" value={overview.analysesToday} tone="cyan" />
          <Metric
            label="Posledních 7 dní"
            value={overview.analysesLast7Days}
            tone="positive"
          />
          <Metric
            label="High risk"
            value={overview.highRiskAnalyses}
            tone="danger"
          />
          <Metric label="Projekty" value={overview.projectsAnalysed} />
        </div>

        <section className="mt-8 overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#0a1016]">
          <div className="border-b border-white/[0.06] px-6 py-5">
            <div className="text-[8px] font-black uppercase tracking-[0.14em] text-cyan-300">
              Analysis Registry
            </div>
            <h3 className="mt-2 text-lg font-black text-white">
              Poslední analýzy
            </h3>
            <p className="mt-1 text-[9px] leading-5 text-slate-600">
              Nejnovější analytické výsledky napříč AEGRIS.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-white/[0.06] bg-[#071017]">
                <tr>
                  {[
                    "Datum",
                    "Projekt",
                    "Zákazník",
                    "NDVI",
                    "Vegetace",
                    "Risk",
                    "Valid geom.",
                    "Quality gate",
                    "Provider",
                    "Satelit",
                    "Detail",
                  ].map((label, index) => (
                    <th
                      key={label}
                      className={`px-5 py-4 text-[8px] font-black uppercase tracking-[0.13em] text-slate-700 ${
                        [3, 4, 6, 7, 10].includes(index) ? "text-right" : "text-left"
                      }`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.05]">
                {overview.analyses.map((analysis) => (
                  <tr
                    key={analysis.id}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4 text-[10px] text-slate-500">
                      {formatDate(analysis.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="text-[11px] font-black text-white">
                          {analysis.projectName ?? `Projekt ${analysis.projectId}`}
                        </p>
                        <p className="mt-1 text-[8px] text-slate-700">
                          Analýza ID {analysis.id}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {analysis.ownerId ? (
                        <Link
                          href={`/admin/customers/${analysis.ownerId}`}
                          className="text-[10px] font-black text-cyan-300 transition hover:text-cyan-200"
                        >
                          {analysis.ownerEmail ?? analysis.ownerId}
                        </Link>
                      ) : (
                        <span className="text-[10px] text-slate-700">
                          Bez vlastníka
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right text-[10px] font-black text-white">
                      {formatNumber(analysis.ndvi)}
                    </td>

                    <td className="px-5 py-4 text-right text-[10px] text-slate-400">
                      {formatNumber(analysis.vegetation, 1)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-black ${getRiskClasses(
                          analysis.risk
                        )}`}
                      >
                        {analysis.risk ?? "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right text-[10px] text-slate-400">
                      {analysis.validGeometryPct === null
                        ? "—"
                        : `${formatNumber(analysis.validGeometryPct, 1)} %`}
                    </td>

                    <td className="px-5 py-4 text-right text-[10px] text-slate-400">
                      {analysis.qualityGatePct === null
                        ? "—"
                        : `${formatNumber(analysis.qualityGatePct, 1)} %`}
                    </td>

                    <td className="px-5 py-4 text-[10px] text-slate-500">
                      {analysis.sourceProvider ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-[10px] text-slate-500">
                      {analysis.satellite ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/projects/${analysis.projectId}`}
                        className="text-[10px] font-black text-cyan-300 transition hover:text-cyan-200"
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
                      className="px-5 py-14 text-center text-[10px] text-slate-600"
                    >
                      V AEGRIS nejsou evidované žádné analýzy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-5 rounded-2xl border border-white/[0.06] bg-[#0a1016] px-5 py-4">
          <div className="text-[7px] font-black uppercase tracking-[0.14em] text-slate-700">
            Read-only diagnostics
          </div>
          <p className="mt-2 text-[9px] leading-5 text-slate-600">
            Analytický přehled je zatím pouze pro čtení. Diagnostické zásahy a
            opakované spuštění analýz přidáme až přes auditované serverové akce.
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
  value: number;
  tone?: "default" | "cyan" | "positive" | "danger";
}) {
  const valueClass =
    tone === "cyan"
      ? "text-cyan-300"
      : tone === "positive"
        ? "text-emerald-300"
        : tone === "danger"
          ? "text-rose-300"
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
