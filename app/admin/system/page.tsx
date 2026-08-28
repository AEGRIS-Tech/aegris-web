import { getAdminSystemOverview } from "@/lib/admin/system";

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

function statusClass(status: "ok" | "error") {
  return status === "ok"
    ? "text-emerald-300"
    : "text-rose-300";
}

export default async function AdminSystemPage() {
  const overview = await getAdminSystemOverview();

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-950/80 px-5 py-5 backdrop-blur lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400 lg:hidden">
              AEGRIS Control Center
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Systém
            </h2>
          </div>

          <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5">
            <span
              className={`text-xs font-medium ${statusClass(
                overview.database.status
              )}`}
            >
              DB {overview.database.status.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
        <div className="mb-8">
          <h3 className="text-2xl font-semibold tracking-tight">
            Provozní stav AEGRIS
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Read-only diagnostický přehled databáze, analytické
            aktivity, DEMO lifecycle a interních dat.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Databáze
            </p>

            <p
              className={`mt-3 text-3xl font-semibold ${statusClass(
                overview.database.status
              )}`}
            >
              {overview.database.status === "ok"
                ? "Online"
                : "Error"}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Health check {overview.database.latencyMs} ms
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Poslední analýza
            </p>

            <p className="mt-3 text-lg font-semibold text-cyan-300">
              {formatDate(
                overview.analysis.latestAnalysisAt
              )}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Analýzy dnes
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {overview.analysis.analysesToday}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Posledních 24 h:{" "}
              {overview.analysis.analysesLast24Hours}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <p className="text-sm text-slate-400">
              Alerty 24 h
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {overview.alerts.recent24Hours}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Celkem: {overview.alerts.total}
            </p>
          </section>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h3 className="font-semibold">
              Datová základna
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Celkové počty klíčových entit AEGRIS.
            </p>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Profily
                </span>
                <span className="font-medium">
                  {overview.data.profiles}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Projekty
                </span>
                <span className="font-medium">
                  {overview.data.projects}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Analýzy
                </span>
                <span className="font-medium">
                  {overview.data.analyses}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  DEMO žádosti
                </span>
                <span className="font-medium">
                  {overview.data.demoRequests}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Alerty
                </span>
                <span className="font-medium">
                  {overview.data.alerts}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Doporučení
                </span>
                <span className="font-medium">
                  {overview.data.recommendations}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h3 className="font-semibold">
              DEMO lifecycle
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Aktuální provozní stav zkušebních účtů.
            </p>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Aktivní DEMO
                </span>
                <span className="font-medium text-emerald-300">
                  {overview.demo.active}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Expiruje do 3 dnů
                </span>
                <span className="font-medium text-amber-300">
                  {overview.demo.expiringSoon}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Expirované
                </span>
                <span className="font-medium text-rose-300">
                  {overview.demo.expired}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Nedokončené žádosti
                </span>
                <span className="font-medium">
                  {overview.demo.pendingRequests}
                </span>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="font-semibold">
            Diagnostika
          </h3>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Supabase / DB
              </p>

              <p
                className={`mt-2 font-medium ${statusClass(
                  overview.database.status
                )}`}
              >
                {overview.database.status === "ok"
                  ? "OK"
                  : "ERROR"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Analytický engine
              </p>

              <p className="mt-2 font-medium text-emerald-300">
                Datová aktivita dostupná
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                DEMO workflow
              </p>

              <p className="mt-2 font-medium text-emerald-300">
                Data dostupná
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Snapshot
              </p>

              <p className="mt-2 text-sm font-medium text-slate-300">
                {formatDate(overview.generatedAt)}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4">
          <p className="text-xs leading-5 text-slate-500">
            Tato stránka zatím ověřuje interní databázové a aplikační
            signály. Přímé health-checky Sentinel Hub/Copernicus,
            weather provideru, cron execution historie a error log
            doplníme v další vrstvě observability.
          </p>
        </div>
      </div>
    </>
  );
}