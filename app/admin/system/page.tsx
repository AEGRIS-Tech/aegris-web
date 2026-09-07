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
  return status === "ok" ? "text-emerald-300" : "text-rose-300";
}

export default async function AdminSystemPage() {
  const overview = await getAdminSystemOverview();

  return (
    <div className="min-h-screen bg-[#05090d] text-slate-100">
      <header className="border-b border-white/[0.06] bg-[#070c11]/95 px-5 py-5 backdrop-blur-xl lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300 lg:hidden">
              AEGRIS Control Center
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-white">
              Systém
            </h1>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2">
            <span
              className={`text-[8px] font-black uppercase tracking-[0.12em] ${statusClass(
                overview.database.status
              )}`}
            >
              DB {overview.database.status.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8 lg:py-10">
        <section className="mb-8">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
            System Diagnostics
          </div>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white">
            Provozní stav AEGRIS
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
            Read-only diagnostický přehled databáze, analytické aktivity, DEMO
            lifecycle a interních dat.
          </p>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <section className="rounded-[18px] border border-white/[0.07] bg-[#0a1016] p-5">
            <div className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-600">
              Databáze
            </div>
            <div
              className={`mt-4 text-3xl font-black tracking-[-0.04em] ${statusClass(
                overview.database.status
              )}`}
            >
              {overview.database.status === "ok" ? "Online" : "Error"}
            </div>
            <p className="mt-2 text-[8px] text-slate-700">
              Health check {overview.database.latencyMs} ms
            </p>
          </section>

          <section className="rounded-[18px] border border-white/[0.07] bg-[#0a1016] p-5">
            <div className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-600">
              Poslední analýza
            </div>
            <div className="mt-4 text-base font-black text-cyan-300">
              {formatDate(overview.analysis.latestAnalysisAt)}
            </div>
          </section>

          <section className="rounded-[18px] border border-white/[0.07] bg-[#0a1016] p-5">
            <div className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-600">
              Analýzy dnes
            </div>
            <div className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">
              {overview.analysis.analysesToday}
            </div>
            <p className="mt-2 text-[8px] text-slate-700">
              Posledních 24 h: {overview.analysis.analysesLast24Hours}
            </p>
          </section>

          <section className="rounded-[18px] border border-white/[0.07] bg-[#0a1016] p-5">
            <div className="text-[8px] font-black uppercase tracking-[0.13em] text-slate-600">
              Alerty 24 h
            </div>
            <div className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">
              {overview.alerts.recent24Hours}
            </div>
            <p className="mt-2 text-[8px] text-slate-700">
              Celkem: {overview.alerts.total}
            </p>
          </section>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          <DataPanel
            title="Datová základna"
            subtitle="Celkové počty klíčových entit AEGRIS."
            rows={[
              ["Profily", overview.data.profiles],
              ["Projekty", overview.data.projects],
              ["Analýzy", overview.data.analyses],
              ["DEMO žádosti", overview.data.demoRequests],
              ["Alerty", overview.data.alerts],
              ["Doporučení", overview.data.recommendations],
            ]}
          />

          <section className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-6">
            <div className="text-[8px] font-black uppercase tracking-[0.14em] text-cyan-300">
              Demo Lifecycle
            </div>
            <h3 className="mt-2 text-lg font-black text-white">DEMO lifecycle</h3>
            <p className="mt-1 text-[9px] text-slate-600">
              Aktuální provozní stav zkušebních účtů.
            </p>

            <div className="mt-6 space-y-4">
              <Row label="Aktivní DEMO" value={overview.demo.active} tone="positive" />
              <Row label="Expiruje do 3 dnů" value={overview.demo.expiringSoon} tone="warning" />
              <Row label="Expirované" value={overview.demo.expired} tone="danger" />
              <Row label="Nedokončené žádosti" value={overview.demo.pendingRequests} />
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-6">
          <div className="text-[8px] font-black uppercase tracking-[0.14em] text-cyan-300">
            Diagnostics
          </div>
          <h3 className="mt-2 text-lg font-black text-white">Diagnostika</h3>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DiagnosticCard
              label="Supabase / DB"
              value={overview.database.status === "ok" ? "OK" : "ERROR"}
              tone={overview.database.status === "ok" ? "positive" : "danger"}
            />
            <DiagnosticCard
              label="Analytický engine"
              value="Datová aktivita dostupná"
              tone="positive"
            />
            <DiagnosticCard
              label="DEMO workflow"
              value="Data dostupná"
              tone="positive"
            />
            <DiagnosticCard
              label="Snapshot"
              value={formatDate(overview.generatedAt)}
            />
          </div>
        </section>

        <div className="mt-5 rounded-2xl border border-white/[0.06] bg-[#0a1016] px-5 py-4">
          <div className="text-[7px] font-black uppercase tracking-[0.14em] text-slate-700">
            Observability scope
          </div>
          <p className="mt-2 text-[9px] leading-5 text-slate-600">
            Tato stránka zatím ověřuje interní databázové a aplikační signály.
            Přímé health-checky Sentinel Hub/Copernicus, weather provideru,
            cron execution historie a error log doplníme v další vrstvě
            observability.
          </p>
        </div>
      </main>
    </div>
  );
}

function DataPanel({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: Array<[string, number]>;
}) {
  return (
    <section className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-6">
      <div className="text-[8px] font-black uppercase tracking-[0.14em] text-cyan-300">
        Data Foundation
      </div>
      <h3 className="mt-2 text-lg font-black text-white">{title}</h3>
      <p className="mt-1 text-[9px] text-slate-600">{subtitle}</p>

      <div className="mt-6 space-y-4">
        {rows.map(([label, value]) => (
          <Row key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "positive" | "warning" | "danger";
}) {
  const valueClass =
    tone === "positive"
      ? "text-emerald-300"
      : tone === "warning"
        ? "text-amber-300"
        : tone === "danger"
          ? "text-rose-300"
          : "text-white";

  return (
    <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className={`text-[10px] font-black ${valueClass}`}>{value}</span>
    </div>
  );
}

function DiagnosticCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "positive" | "danger";
}) {
  const valueClass =
    tone === "positive"
      ? "text-emerald-300"
      : tone === "danger"
        ? "text-rose-300"
        : "text-slate-300";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#071017] p-4">
      <div className="text-[7px] font-black uppercase tracking-[0.13em] text-slate-700">
        {label}
      </div>
      <div className={`mt-2 text-[10px] font-black ${valueClass}`}>{value}</div>
    </div>
  );
}
