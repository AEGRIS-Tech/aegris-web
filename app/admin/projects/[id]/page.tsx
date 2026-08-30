import Link from "next/link";

import { getAdminProjectDetail } from "@/lib/admin/projects";

type AdminProjectDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatNumber(
  value: number | null,
  maximumFractionDigits = 2
) {
  if (
    value === null ||
    !Number.isFinite(value)
  ) {
    return "—";
  }

  return new Intl.NumberFormat("cs-CZ", {
    maximumFractionDigits,
  }).format(value);
}

function formatDate(
  value: string | null,
  withTime = true
) {
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
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
}

function Metric({
  label,
  value,
  accent = "",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-semibold ${
          accent || "text-slate-100"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default async function AdminProjectDetailPage({
  params,
}: AdminProjectDetailPageProps) {
  const { id } = await params;
  const project =
    await getAdminProjectDetail(id);

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-10 lg:px-10">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-8 text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">
            Projekt nenalezen
          </div>

          <h1 className="mt-3 text-2xl font-semibold">
            Tento projekt v AEGRIS neexistuje
          </h1>

          <Link
            href="/admin/projects"
            className="mt-6 inline-flex rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Zpět na projekty
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/80 px-5 py-5 backdrop-blur lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
              AEGRIS Control Center
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Detail projektu
            </h2>
          </div>

          <Link
            href="/admin/projects"
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
          >
            ← Zpět na projekty
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Projekt ID {project.id}
            </div>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {project.name ?? "Projekt bez názvu"}
            </h1>

            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-slate-300">
                {project.status ?? "Bez statusu"}
              </span>

              <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-slate-400">
                Read-only admin náhled
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 lg:min-w-[320px]">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              Zákazník
            </p>

            {project.ownerId ? (
              <Link
                href={`/admin/customers/${project.ownerId}`}
                className="mt-2 block font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                {project.ownerEmail ?? project.ownerId}
              </Link>
            ) : (
              <p className="mt-2 text-slate-400">
                Bez vlastníka
              </p>
            )}

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              Organizace
            </p>

            <p className="mt-2 text-sm text-slate-300">
              {project.organizationName ??
                project.organizationId ??
                "Bez organizace"}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Plocha"
            value={
              project.areaHa === null
                ? "—"
                : `${formatNumber(project.areaHa)} ha`
            }
            accent="text-cyan-300"
          />

          <Metric
            label="Analýzy"
            value={String(project.analysesCount)}
          />

          <Metric
            label="Doporučení"
            value={String(project.recommendationsCount)}
            accent="text-emerald-300"
          />

          <Metric
            label="Alerty"
            value={`${project.alertsCount} / ${project.unreadAlertsCount} nepřečtených`}
            accent={
              project.unreadAlertsCount > 0
                ? "text-amber-300"
                : "text-slate-100"
            }
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold">
              Projektová data
            </h2>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Plodina", project.cropName ?? "—"],
                ["Odrůda", project.cropVariety ?? "—"],
                ["Růstová fáze", project.growthStage ?? "—"],
                ["Způsob pěstování", project.farmingMethod ?? "—"],
                ["Datum setí", formatDate(project.sowingDate, false)],
                [
                  "Očekávaná sklizeň",
                  formatDate(
                    project.expectedHarvestDate,
                    false
                  ),
                ],
                ["Založeno", formatDate(project.createdAt)],
                [
                  "Souřadnice",
                  project.latitude !== null &&
                  project.longitude !== null
                    ? `${formatNumber(
                        project.latitude,
                        6
                      )}, ${formatNumber(
                        project.longitude,
                        6
                      )}`
                    : "—",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                >
                  <dt className="text-xs uppercase tracking-wider text-slate-500">
                    {label}
                  </dt>

                  <dd className="mt-2 text-sm font-medium text-slate-200">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold">
              Poslední analýzy
            </h2>

            <div className="mt-5 space-y-2">
              {project.recentAnalyses.map(
                (analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        NDVI{" "}
                        {analysis.ndvi === null
                          ? "—"
                          : formatNumber(
                              analysis.ndvi,
                              3
                            )}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(
                          analysis.createdAt
                        )}
                      </p>
                    </div>

                    <span className="text-sm font-medium text-slate-300">
                      {analysis.risk ?? "—"}
                    </span>
                  </div>
                )
              )}

              {project.recentAnalyses.length ===
                0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-500">
                  Projekt zatím nemá analýzu.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold">
              Poslední doporučení
            </h2>

            <div className="mt-5 space-y-3">
              {project.recentRecommendations.map(
                (item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-200">
                        {item.priority ?? "Bez priority"}
                      </div>

                      <div className="text-xs text-slate-500">
                        {formatDate(item.createdAt)}
                      </div>
                    </div>

                    <p className="mt-3 text-sm font-medium text-slate-300">
                      {item.summary ?? "Bez shrnutí"}
                    </p>

                    {item.recommendation && (
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {item.recommendation}
                      </p>
                    )}
                  </article>
                )
              )}

              {project.recentRecommendations
                .length === 0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-500">
                  Projekt zatím nemá uložená doporučení.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold">
              Poslední alerty
            </h2>

            <div className="mt-5 space-y-3">
              {project.recentAlerts.map(
                (alert) => (
                  <article
                    key={alert.id}
                    className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">
                          {alert.title ??
                            "AEGRIS alert"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {alert.level ?? "—"} ·{" "}
                          {alert.priority ?? "—"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-xs font-semibold ${
                            alert.isRead
                              ? "text-slate-500"
                              : "text-amber-300"
                          }`}
                        >
                          {alert.isRead
                            ? "Přečteno"
                            : "Nepřečteno"}
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          {formatDate(
                            alert.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    {alert.message && (
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {alert.message}
                      </p>
                    )}
                  </article>
                )
              )}

              {project.recentAlerts.length ===
                0 && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-500">
                  Projekt zatím nemá žádné alerty.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-6 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] px-5 py-4">
          <p className="text-xs leading-5 text-slate-500">
            Tento detail je administrátorský read-only náhled.
            Data jsou načítána na serveru přes privilegovaný
            administrátorský přístup. Běžné zákaznické RLS
            politiky zůstávají beze změny.
          </p>
        </div>
      </div>
    </>
  );
}