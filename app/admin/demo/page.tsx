import Link from "next/link";

import { getAdminDemoOverview } from "@/lib/admin/demo";

import DemoRequestActions from "./DemoRequestActions";

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

function getStatusClasses(status: string) {
  switch (status) {
    case "new":
      return "border-amber-300/10 bg-amber-300/[0.04] text-amber-300";
    case "approved":
      return "border-violet-300/10 bg-violet-300/[0.04] text-violet-300";
    case "processing":
      return "border-blue-300/10 bg-blue-300/[0.04] text-blue-300";
    case "contacted":
      return "border-cyan-300/10 bg-cyan-300/[0.04] text-cyan-300";
    case "rejected":
      return "border-rose-300/10 bg-rose-300/[0.04] text-rose-300";
    case "closed":
      return "border-white/[0.06] bg-white/[0.02] text-slate-500";
    default:
      return "border-white/[0.06] bg-white/[0.02] text-slate-400";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "new":
      return "Čeká na rozhodnutí";
    case "approved":
      return "Schváleno";
    case "processing":
      return "Aktivace";
    case "contacted":
      return "Aktivováno";
    case "rejected":
      return "Zamítnuto";
    case "closed":
      return "Uzavřeno";
    default:
      return status;
  }
}

export default async function AdminDemoPage() {
  const overview = await getAdminDemoOverview();

  const pendingRequests = overview.requests.filter(
    (request) => request.status === "new"
  ).length;

  return (
    <div className="min-h-screen bg-[#05090d] text-slate-100">
      <header className="border-b border-white/[0.06] bg-[#070c11]/95 px-5 py-5 backdrop-blur-xl lg:px-8">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300 lg:hidden">
              AEGRIS Control Center
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-white">
              DEMO
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {pendingRequests > 0 && (
              <div className="rounded-xl border border-amber-300/10 bg-amber-300/[0.04] px-3 py-2">
                <span className="text-[8px] font-black uppercase tracking-[0.12em] text-amber-300">
                  {pendingRequests} čeká
                </span>
              </div>
            )}

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2">
              <span className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-500">
                {overview.totalRequests} žádostí
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8 lg:py-10">
        <section className="mb-8">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
            Demo Operations
          </div>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white">
            DEMO management
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
            Schvalování DEMO žádostí, řízení délky přístupu, aktivní účty a
            expirace.
          </p>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Žádosti celkem" value={overview.totalRequests} />
          <Metric label="Čeká na rozhodnutí" value={pendingRequests} tone="warning" />
          <Metric label="DEMO profily" value={overview.demoProfilesTotal} />
          <Metric label="Aktivní DEMO" value={overview.activeDemos} tone="positive" />
          <Metric label="Expirované DEMO" value={overview.expiredDemos} tone="danger" />
        </div>

        <section className="mt-8 overflow-hidden rounded-[22px] border border-white/[0.07] bg-[#0a1016]">
          <div className="border-b border-white/[0.06] px-6 py-5">
            <div className="text-[8px] font-black uppercase tracking-[0.14em] text-cyan-300">
              Request Registry
            </div>
            <h3 className="mt-2 text-lg font-black text-white">DEMO žádosti</h3>
            <p className="mt-1 text-[9px] leading-5 text-slate-600">
              Nové žádosti musí před aktivací schválit administrátor.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-white/[0.06] bg-[#071017]">
                <tr>
                  {[
                    "Žadatel",
                    "Firma",
                    "Status",
                    "Žádost",
                    "DEMO začátek",
                    "Expirace",
                    "Zbývá",
                    "Účet",
                    "Akce",
                  ].map((label, index) => (
                    <th
                      key={label}
                      className={`px-5 py-4 text-[8px] font-black uppercase tracking-[0.13em] text-slate-700 ${
                        index >= 7 ? "text-right" : "text-left"
                      }`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.05]">
                {overview.requests.map((request) => (
                  <tr
                    key={request.id}
                    className="align-top transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-[11px] font-black text-white">
                          {request.fullName ?? "Bez jména"}
                        </p>
                        <p className="mt-1 text-[9px] text-slate-500">
                          {request.email}
                        </p>
                        {request.phone && (
                          <p className="mt-1 text-[8px] text-slate-700">
                            {request.phone}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-[10px] text-slate-400">
                      {request.company ?? "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-lg border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] ${getStatusClasses(
                          request.status
                        )}`}
                      >
                        {getStatusLabel(request.status)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-[10px] text-slate-500">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-[10px] text-slate-500">
                      {formatDate(request.demoStartedAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-[10px] text-slate-500">
                      {formatDate(request.demoExpiresAt)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      {request.isActive ? (
                        <span className="text-[10px] font-black text-emerald-300">
                          {request.daysRemaining} dní
                        </span>
                      ) : request.isExpired ? (
                        <span className="text-[10px] font-black text-rose-300">
                          Expirováno
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-700">—</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      {request.matchedUserId ? (
                        <Link
                          href={`/admin/customers/${request.matchedUserId}`}
                          className="text-[10px] font-black text-cyan-300 transition hover:text-cyan-200"
                        >
                          Otevřít →
                        </Link>
                      ) : (
                        <span className="text-[10px] text-slate-700">
                          Nenalezen
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <DemoRequestActions
                        requestId={request.id}
                        status={request.status}
                        accountType={request.accountType}
                        demoExpiresAt={request.demoExpiresAt}
                      />
                    </td>
                  </tr>
                ))}

                {overview.requests.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-14 text-center text-[10px] text-slate-600"
                    >
                      Nejsou evidované žádné DEMO žádosti.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-5 rounded-2xl border border-white/[0.06] bg-[#0a1016] px-5 py-4">
          <div className="text-[7px] font-black uppercase tracking-[0.14em] text-slate-700">
            Workflow note
          </div>
          <p className="mt-2 text-[9px] leading-5 text-slate-600">
            Nové DEMO žádosti čekají na ruční schválení administrátorem. Po
            schválení worker vytvoří pozvánku a DEMO účet se zvolenou délkou
            přístupu. Zamítnuté žádosti se neaktivují.
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
  tone?: "default" | "warning" | "positive" | "danger";
}) {
  const valueClass =
    tone === "warning"
      ? "text-amber-300"
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
