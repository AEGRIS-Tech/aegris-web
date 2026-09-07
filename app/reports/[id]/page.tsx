"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Project = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  crop_name?: string | null;
  crop_variety?: string | null;
  area_ha?: number | null;
  growth_stage?: string | null;
  sowing_date?: string | null;
  expected_harvest_date?: string | null;
  farming_method?: string | null;
};

type Analysis = {
  id: number;
  project_id: number;
  ndvi: number;
  risk: string;
  created_at: string;
  period_from?: string | null;
  period_to?: string | null;
  source_provider?: string | null;
  satellite?: string | null;
  satellite_product?: string | null;
  spatial_resolution_m?: number | null;
  analysis_crs?: string | null;
  analysis_utm_zone?: number | null;
  geometry_pixel_count?: number | null;
  valid_pixel_count?: number | null;
  valid_geometry_pct?: number | null;
  accepted_intervals?: number | null;
  rejected_intervals?: number | null;
  quality_gate_pct?: number | null;
  median_ndvi?: number | null;
  p05_ndvi?: number | null;
  p95_ndvi?: number | null;
};

type WeatherData = {
  temperature_c?: number | null;
  humidity_pct?: number | null;
  precipitation_mm?: number | null;
  wind_speed_kmh?: number | null;
  soil_moisture_pct?: number | null;
  precipitation_probability_pct?: number | null;
  next24h_precipitation_mm?: number | null;
  next24h_min_temperature_c?: number | null;
  next24h_max_temperature_c?: number | null;
  evapotranspiration_mm?: number | null;
  fetched_at?: string | null;
};

type Recommendation = {
  id: number;
  project_id: number;
  analysis_id: number | null;
  crop_name: string | null;
  growth_stage: string | null;
  ndvi: number | null;
  level: string;
  priority: string;
  score: number | null;
  summary: string;
  recommendation: string;
  actions: string[];
  weather_snapshot: WeatherData | null;
  created_at: string;
};

type HistoryItem = {
  period_from: string;
  period_to: string;
  ndvi: number;
  created_at: string;
};

export default function ProjectReportPage() {
  const params = useParams();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [recommendation, setRecommendation] =
    useState<Recommendation | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  const projectId = Number(params.id);

  useEffect(() => {
    let active = true;

    async function loadReport() {
      if (!Number.isInteger(projectId) || projectId <= 0) {
        setAccessDenied(true);
        setErrorMessage(
          "Projekt neexistuje nebo nemáte oprávnění k jeho zobrazení."
        );
        setLoading(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const {
        data: projectData,
        error: projectError,
      } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();

      if (!active) return;

      if (projectError || !projectData) {
        if (projectError) {
          console.error(
            "CHYBA NAČTENÍ PROJEKTU PRO REPORT:",
            projectError
          );
        }

        setAccessDenied(true);
        setErrorMessage(
          "Projekt neexistuje nebo nemáte oprávnění k jeho zobrazení."
        );
        setLoading(false);
        return;
      }

      const {
        data: analysisData,
        error: analysisError,
      } = await supabase
        .from("analysis")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) return;

      if (analysisError || !analysisData) {
        console.error("CHYBA NAČTENÍ ANALÝZY PRO REPORT:", analysisError);
        setErrorMessage("Projekt zatím nemá analýzu pro vytvoření reportu.");
        setLoading(false);
        return;
      }

      const {
        data: recommendationData,
        error: recommendationError,
      } = await supabase
        .from("aegris_recommendations")
        .select("*")
        .eq("project_id", projectId)
        .eq("analysis_id", analysisData.id)
        .maybeSingle();

      if (!active) return;

      if (recommendationError) {
        console.error(
          "CHYBA NAČTENÍ DOPORUČENÍ PRO REPORT:",
          recommendationError
        );
      }

      const {
        data: historyData,
        error: historyError,
      } = await supabase
        .from("ndvi_history")
        .select("period_from, period_to, ndvi, created_at")
        .eq("project_id", projectId)
        .order("period_from", { ascending: true });

      if (!active) return;

      if (historyError) {
        console.error("CHYBA NAČTENÍ NDVI HISTORIE PRO REPORT:", historyError);
      }

      setProject(projectData as Project);
      setAnalysis(analysisData as Analysis);
      setRecommendation(
        (recommendationData ?? null) as Recommendation | null
      );
      setHistory((historyData ?? []) as HistoryItem[]);
      setLoading(false);
    }

    void loadReport();

    return () => {
      active = false;
    };
  }, [projectId, router]);

  const latestHistory = useMemo(
    () => history.slice(-8),
    [history]
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030817] text-slate-400">
        Načítám report...
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030817] px-4 text-white">
        <div className="w-full max-w-[540px] rounded-2xl border border-red-500/20 bg-[#071225] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-2xl font-black text-red-400">
            !
          </div>

          <div className="mt-5 text-[10px] font-black uppercase tracking-[0.25em] text-red-400">
            Přístup zamítnut
          </div>

          <h1 className="mt-3 text-xl font-black text-white">
            K tomuto projektu nemáte přístup
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Projekt neexistuje nebo nemáte oprávnění k jeho zobrazení.
          </p>

          <button
            type="button"
            onClick={() => router.push("/reports")}
            className="mt-6 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
          >
            Zpět na reporty
          </button>
        </div>
      </main>
    );
  }

  if (errorMessage || !project || !analysis) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030817] px-4 text-slate-100">
        <div className="max-w-lg rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6 text-center">
          <div className="font-black text-red-400">Report nelze vytvořit</div>
          <div className="mt-2 text-sm text-slate-400">
            {errorMessage || "Chybí potřebná data."}
          </div>
          <button
            type="button"
            onClick={() => router.push("/reports")}
            className="mt-5 rounded-lg border border-slate-700 px-4 py-2 text-sm font-bold"
          >
            Zpět na reporty
          </button>
        </div>
      </main>
    );
  }

  const weather = recommendation?.weather_snapshot ?? null;

  return (
    <main className="min-h-screen bg-[#05090d] px-4 py-5 text-slate-100 print:bg-white print:px-0 print:py-0 print:text-black">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={() => router.push("/reports")}
            className="rounded-xl border border-white/[0.07] bg-[#0a1016] px-4 py-2.5 text-[10px] font-bold text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-200"
          >
            ← Report Registry
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push(`/projects/${project.id}`)}
              className="rounded-xl border border-white/[0.07] bg-[#0a1016] px-4 py-2.5 text-[10px] font-bold text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-200"
            >
              Field Health Record
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl bg-cyan-300 px-4 py-2.5 text-[10px] font-black text-[#061015] transition hover:bg-cyan-200"
            >
              Tisk / Uložit jako PDF
            </button>
          </div>
        </div>

        <article className="overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#0a1016] shadow-2xl shadow-black/20 print:overflow-visible print:rounded-none print:border-0 print:bg-white print:shadow-none">
          <header className="border-b border-white/[0.07] px-6 py-6 sm:px-8 print:border-slate-300 print:px-0 print:py-0 print:pb-3">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.24em] text-cyan-300 print:text-black">
                  AEGRIS / Analytical Field Report
                </div>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl print:text-2xl print:text-black">
                  {project.name}
                </h1>
                <p className="mt-2 text-[11px] text-slate-500 print:text-slate-600">
                  {project.crop_name ?? "Plodina neuvedena"}
                  {project.crop_variety ? ` · ${project.crop_variety}` : ""}
                  {project.area_ha != null ? ` · ${project.area_ha} ha` : ""}
                  {project.growth_stage ? ` · ${project.growth_stage}` : ""}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-[#071017] px-4 py-3 text-[9px] leading-5 text-slate-600 md:text-right print:border-slate-300 print:bg-white print:text-slate-600">
                <div className="font-bold text-slate-400 print:text-black">
                  Analýza #{analysis.id}
                </div>
                <div>{new Date(analysis.created_at).toLocaleString("cs-CZ")}</div>
                <div>Projekt ID {project.id}</div>
              </div>
            </div>
          </header>

          <div className="px-6 py-6 sm:px-8 print:px-0 print:py-3">
            <section>
              <SectionTitle title="Rozhodovací stav" />
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:mt-2 print:grid-cols-4 print:gap-2">
                <ReportMetric label="NDVI" value={Number(analysis.ndvi).toFixed(3)} accent="cyan" />
                <ReportMetric
                  label="AEGRIS skóre"
                  value={recommendation?.score != null ? `${recommendation.score} / 100` : "—"}
                  accent="amber"
                />
                <ReportMetric label="Riziko" value={analysis.risk} />
                <ReportMetric label="Priorita" value={recommendation?.priority ?? "—"} />
              </div>
            </section>

            <section className="mt-5 rounded-2xl border border-white/[0.07] bg-[#071017] p-5 print:mt-3 print:border-slate-300 print:bg-white print:p-3 print:break-inside-avoid">
              <SectionTitle title="Vyhodnocení AEGRIS" />
              <h2 className="mt-3 text-xl font-black tracking-[-0.02em] text-white print:text-base print:text-black">
                {recommendation?.summary ?? "Bez uloženého shrnutí."}
              </h2>
              <p className="mt-3 text-[11px] leading-6 text-slate-400 print:text-[8px] print:leading-4 print:text-slate-700">
                {recommendation?.recommendation ?? "Pro tuto analýzu není uložené doporučení."}
              </p>

              {recommendation?.actions && recommendation.actions.length > 0 && (
                <div className="mt-4 grid gap-2">
                  {recommendation.actions.map((action, index) => (
                    <div
                      key={`${index}-${action}`}
                      className="flex gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-[11px] leading-5 text-slate-300 print:border-slate-200 print:bg-slate-50 print:p-2 print:text-[8px] print:leading-3 print:text-slate-800"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-300/[0.08] text-[9px] font-black text-cyan-300 print:bg-slate-100 print:text-black">
                        {index + 1}
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-5 print:mt-3">
              <SectionTitle title="Datová důvěryhodnost" />
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:mt-2 print:grid-cols-4 print:gap-2">
                <ReportMetric
                  label="Zdroj"
                  value={analysis.satellite_product ?? analysis.satellite ?? analysis.source_provider ?? "—"}
                  subvalue={analysis.source_provider ?? undefined}
                />
                <ReportMetric
                  label="Rozlišení"
                  value={analysis.spatial_resolution_m != null ? `${analysis.spatial_resolution_m} m` : "—"}
                  subvalue={analysis.analysis_crs ?? undefined}
                />
                <ReportMetric
                  label="Validní pixely"
                  value={
                    analysis.valid_pixel_count != null && analysis.geometry_pixel_count != null
                      ? `${analysis.valid_pixel_count} / ${analysis.geometry_pixel_count}`
                      : "—"
                  }
                />
                <ReportMetric
                  label="Validní pokrytí"
                  value={
                    analysis.valid_geometry_pct != null
                      ? `${Number(analysis.valid_geometry_pct).toFixed(1)} %`
                      : "—"
                  }
                  subvalue={
                    analysis.quality_gate_pct != null
                      ? `Quality gate min. ${analysis.quality_gate_pct} %`
                      : undefined
                  }
                  accent="green"
                />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:mt-2 print:grid-cols-4 print:gap-2">
                <ReportMetric label="Přijaté intervaly" value={String(analysis.accepted_intervals ?? "—")} />
                <ReportMetric label="Odmítnuté intervaly" value={String(analysis.rejected_intervals ?? "—")} />
                <ReportMetric
                  label="Medián NDVI"
                  value={analysis.median_ndvi != null ? Number(analysis.median_ndvi).toFixed(3) : "—"}
                />
                <ReportMetric
                  label="NDVI P05–P95"
                  value={
                    analysis.p05_ndvi != null && analysis.p95_ndvi != null
                      ? `${Number(analysis.p05_ndvi).toFixed(3)} – ${Number(analysis.p95_ndvi).toFixed(3)}`
                      : "—"
                  }
                />
              </div>
            </section>

            <section className="mt-5 print:mt-3">
              <SectionTitle title="Meteorologický snapshot analýzy" />
              {weather ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:mt-2 print:grid-cols-4 print:gap-2">
                  <ReportMetric
                    label="Teplota"
                    value={weather.temperature_c != null ? `${weather.temperature_c.toFixed(1)} °C` : "—"}
                  />
                  <ReportMetric
                    label="Vlhkost"
                    value={weather.humidity_pct != null ? `${weather.humidity_pct.toFixed(0)} %` : "—"}
                  />
                  <ReportMetric
                    label="Srážky – poslední hodina"
                    value={weather.precipitation_mm != null ? `${weather.precipitation_mm.toFixed(1)} mm` : "—"}
                  />
                  <ReportMetric
                    label="Vítr"
                    value={weather.wind_speed_kmh != null ? `${weather.wind_speed_kmh.toFixed(1)} km/h` : "—"}
                  />
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-white/[0.07] bg-[#071017] p-4 text-[10px] text-slate-600 print:border-slate-300 print:bg-white">
                  U této historické analýzy není uložen meteorologický snapshot.
                </div>
              )}
            </section>

            <section className="mt-5 print:mt-3">
              <SectionTitle title="Vývoj NDVI" />
              {latestHistory.length > 0 ? (
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/[0.07] print:mt-2 print:border-slate-300 print:break-inside-avoid">
                  <table className="w-full border-collapse text-left text-[10px]">
                    <thead className="bg-[#071017] text-[8px] font-black uppercase tracking-[0.12em] text-slate-600 print:bg-slate-100 print:text-slate-700">
                      <tr>
                        <th className="px-4 py-3">Interval od</th>
                        <th className="px-4 py-3">Interval do</th>
                        <th className="px-4 py-3 text-right">NDVI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestHistory.map((item) => (
                        <tr
                          key={`${item.period_from}-${item.period_to}`}
                          className="border-t border-white/[0.05] print:border-slate-300"
                        >
                          <td className="px-4 py-3 text-slate-400 print:text-slate-700">
                            {new Date(item.period_from).toLocaleDateString("cs-CZ")}
                          </td>
                          <td className="px-4 py-3 text-slate-400 print:text-slate-700">
                            {new Date(item.period_to).toLocaleDateString("cs-CZ")}
                          </td>
                          <td className="px-4 py-3 text-right font-black text-cyan-300 print:text-black">
                            {Number(item.ndvi).toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-3 text-[10px] text-slate-600">Historie NDVI není k dispozici.</div>
              )}
            </section>

            <section className="mt-5 grid gap-3 md:grid-cols-2 print:mt-3 print:grid-cols-2 print:gap-2">
              <div className="rounded-2xl border border-white/[0.07] bg-[#071017] p-5 print:border-slate-300 print:bg-white print:p-3 print:break-inside-avoid">
                <SectionTitle title="Kontext pozemku" />
                <ReportRow label="Plodina" value={project.crop_name ?? "—"} />
                <ReportRow label="Odrůda" value={project.crop_variety ?? "—"} />
                <ReportRow label="Výměra" value={project.area_ha != null ? `${project.area_ha} ha` : "—"} />
                <ReportRow label="Růstová fáze" value={project.growth_stage ?? "—"} />
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-[#071017] p-5 print:border-slate-300 print:bg-white print:p-3 print:break-inside-avoid">
                <SectionTitle title="Lokalita a období" />
                <ReportRow label="Šířka" value={project.latitude.toFixed(6)} />
                <ReportRow label="Délka" value={project.longitude.toFixed(6)} />
                <ReportRow
                  label="Poslední Sentinel interval"
                  value={
                    analysis.period_from && analysis.period_to
                      ? `${new Date(analysis.period_from).toLocaleDateString("cs-CZ")} – ${new Date(analysis.period_to).toLocaleDateString("cs-CZ")}`
                      : "—"
                  }
                />
              </div>
            </section>

            <footer className="mt-6 border-t border-white/[0.07] pt-4 text-[8px] leading-4 text-slate-700 print:mt-3 print:border-slate-300 print:pt-2 print:text-[7px] print:leading-3 print:text-slate-600 print:break-inside-avoid">
              <p>
                AEGRIS je rozhodovací podpůrný systém. Satelitní a meteorologická data jsou
                zdrojová/vypočtená data; AEGRIS skóre, riziko, diagnostika a doporučení jsou
                modelové vyhodnocení a nenahrazují odbornou terénní kontrolu.
              </p>
              <p className="mt-2">
                Report vygenerován: {new Date().toLocaleString("cs-CZ")}
              </p>
            </footer>
          </div>
        </article>
      </div>
    </main>
  );
}
function SectionTitle({ title }: { title: string }) {
  return (
    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300 print:text-black">
      {title}
    </div>
  );
}

function ReportMetric({
  label,
  value,
  subvalue,
  accent,
}: {
  label: string;
  value: string;
  subvalue?: string;
  accent?: "cyan" | "amber" | "green";
}) {
  const valueClass =
    accent === "cyan"
      ? "text-cyan-300"
      : accent === "amber"
        ? "text-amber-300"
        : accent === "green"
          ? "text-emerald-300"
          : "text-slate-100";

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#071017] p-4 print:border-slate-300 print:bg-white print:p-2.5 print:break-inside-avoid">
      <div className="text-[8px] uppercase tracking-[0.14em] text-slate-700 print:text-slate-600">
        {label}
      </div>
      <div className={`mt-1.5 text-base font-black ${valueClass} print:text-black`}>
        {value}
      </div>
      {subvalue && (
        <div className="mt-1 text-[8px] text-slate-600 print:text-slate-600">
          {subvalue}
        </div>
      )}
    </div>
  );
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2.5 flex items-start justify-between gap-4 border-b border-white/[0.05] pb-2.5 text-[10px] last:border-b-0 print:mt-1.5 print:border-slate-200 print:pb-1.5 print:text-[8px]">
      <span className="text-slate-600 print:text-slate-600">{label}</span>
      <span className="text-right font-bold text-slate-300 print:text-black">{value}</span>
    </div>
  );
}
