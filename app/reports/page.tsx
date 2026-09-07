"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Project = {
  id: number;
  name: string;
  status: string | null;
  crop_name?: string | null;
  crop_variety?: string | null;
  area_ha?: number | null;
  created_at: string;
};

type Analysis = {
  id: number;
  project_id: number;
  ndvi: number;
  risk: string;
  created_at: string;
  valid_geometry_pct?: number | null;
  source_provider?: string | null;
  satellite_product?: string | null;
};

type Recommendation = {
  id: number;
  project_id: number;
  analysis_id: number | null;
  priority: string;
  score: number | null;
  created_at: string;
};

type ReportRow = {
  project: Project;
  analysis: Analysis | null;
  recommendation: Recommendation | null;
};

export default function ReportsPage() {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReports() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (userError || !user) {
        setErrorMessage("Uživatel není přihlášen.");
        setLoading(false);
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("active_organization_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      if (profileError) {
        console.error(
          "CHYBA NAČTENÍ AKTIVNÍ ORGANIZACE PRO REPORTY:",
          profileError
        );
        setErrorMessage("Nepodařilo se načíst aktivní organizaci.");
        setLoading(false);
        return;
      }

      const activeOrganizationId =
        profile?.active_organization_id ?? null;

      if (!activeOrganizationId) {
        setErrorMessage("Není nastavena aktivní organizace.");
        setLoading(false);
        return;
      }

      const {
        data: projectData,
        error: projectError,
      } = await supabase
        .from("projects")
        .select(
          "id, name, status, crop_name, crop_variety, area_ha, created_at"
        )
        .eq("organization_id", activeOrganizationId)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (projectError) {
        console.error("CHYBA NAČTENÍ PROJEKTŮ PRO REPORTY:", projectError);
        setErrorMessage("Nepodařilo se načíst projekty.");
        setLoading(false);
        return;
      }

      const projects = (projectData ?? []) as Project[];

      if (projects.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }

      const projectIds = projects.map((project) => project.id);

      const [
        { data: analysisData, error: analysisError },
        { data: recommendationData, error: recommendationError },
      ] = await Promise.all([
        supabase
          .from("analysis")
          .select(
            "id, project_id, ndvi, risk, created_at, valid_geometry_pct, source_provider, satellite_product"
          )
          .in("project_id", projectIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("aegris_recommendations")
          .select(
            "id, project_id, analysis_id, priority, score, created_at"
          )
          .in("project_id", projectIds)
          .order("created_at", { ascending: false }),
      ]);

      if (!active) return;

      if (analysisError) {
        console.error("CHYBA NAČTENÍ ANALÝZ PRO REPORTY:", analysisError);
      }

      if (recommendationError) {
        console.error(
          "CHYBA NAČTENÍ DOPORUČENÍ PRO REPORTY:",
          recommendationError
        );
      }

      const analyses = (analysisData ?? []) as Analysis[];
      const recommendations =
        (recommendationData ?? []) as Recommendation[];

      const latestAnalysisByProject = new Map<number, Analysis>();
      for (const analysis of analyses) {
        if (!latestAnalysisByProject.has(analysis.project_id)) {
          latestAnalysisByProject.set(analysis.project_id, analysis);
        }
      }

      const latestRecommendationByProject =
        new Map<number, Recommendation>();
      for (const recommendation of recommendations) {
        if (!latestRecommendationByProject.has(recommendation.project_id)) {
          latestRecommendationByProject.set(
            recommendation.project_id,
            recommendation
          );
        }
      }

      setRows(
        projects.map((project) => ({
          project,
          analysis: latestAnalysisByProject.get(project.id) ?? null,
          recommendation:
            latestRecommendationByProject.get(project.id) ?? null,
        }))
      );

      setLoading(false);
    }

    void loadReports();

    return () => {
      active = false;
    };
  }, []);

  const reportCount = useMemo(
    () => rows.filter((row) => row.analysis).length,
    [rows]
  );

  return (
    <div className="min-h-screen bg-[#05090d] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <aside className="hidden w-[248px] shrink-0 border-r border-white/[0.06] bg-[#070c11] lg:flex lg:flex-col">
          <div className="border-b border-white/[0.06] px-6 py-6">
            <Link href="/dashboard" className="block">
              <div className="text-2xl font-black tracking-[-0.04em] text-cyan-300">AEGRIS</div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-slate-600">
                Agriculture Intelligence
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1.5 px-3 py-5">
            {[
              ["📊", "Dashboard", "Přehled systému", "/dashboard"],
              ["🧠", "AI Analýza", "Analýza dat", "/ai"],
              ["🗺️", "Mapa", "Lokality projektů", "/map"],
              ["📁", "Projekty", "Správa projektů", "/projects"],
              ["📄", "Reporty", "Výsledky analýz", "/reports"],
              ["⚙️", "Nastavení", "Nastavení platformy", "/settings"],
            ].map(([icon, title, subtitle, href]) => {
              const active = href === "/reports";
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                    active
                      ? "bg-cyan-300/[0.08] text-cyan-200"
                      : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200"
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.035] text-sm">{icon}</span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold">{title}</div>
                    <div className="mt-0.5 text-[9px] text-slate-600">{subtitle}</div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/[0.06] p-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
                Analysis Reports
              </div>
              <p className="mt-2 text-[10px] leading-5 text-slate-600">
                Poslední analytické výstupy pozemků aktivní organizace.
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-white/[0.06] bg-[#070c11]/95">
            <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-600">
                  Agronomic Operations Center
                </div>
                <div className="mt-0.5 text-sm font-bold text-slate-300">
                  Analysis Reports
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-[0.15em] text-slate-700">
                  Dostupné reporty
                </div>
                <div className="mt-0.5 text-lg font-black text-cyan-300">
                  {loading ? "…" : reportCount}
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {[
                ["📊", "Dashboard", "/dashboard"],
                ["🧠", "AI Analýza", "/ai"],
                ["🗺️", "Mapa", "/map"],
                ["📁", "Projekty", "/projects"],
                ["📄", "Reporty", "/reports"],
                ["⚙️", "Nastavení", "/settings"],
              ].map(([icon, title, href]) => (
                <Link
                  key={href}
                  href={href}
                  className={`shrink-0 rounded-lg border px-3 py-2 text-[10px] font-bold ${
                    href === "/reports"
                      ? "border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-200"
                      : "border-white/[0.06] bg-white/[0.02] text-slate-500"
                  }`}
                >
                  {icon} {title}
                </Link>
              ))}
            </div>

            <section className="rounded-[24px] border border-white/[0.07] bg-[#0a1016] p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
                    Analysis Reports
                  </div>
                  <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                    Reporty pozemků
                  </h1>
                  <p className="mt-2 max-w-2xl text-[11px] leading-5 text-slate-500">
                    Poslední uložené analýzy, AegRIS skóre a datová kvalita pro pozemky aktivní organizace.
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="rounded-xl border border-white/[0.07] bg-[#071017] px-4 py-3 text-right">
                    <div className="text-[8px] uppercase tracking-[0.15em] text-slate-700">
                      Pozemky
                    </div>
                    <div className="mt-1 text-xl font-black text-slate-300">
                      {loading ? "…" : rows.length}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.07] bg-[#071017] px-4 py-3 text-right">
                    <div className="text-[8px] uppercase tracking-[0.15em] text-slate-700">
                      S analýzou
                    </div>
                    <div className="mt-1 text-xl font-black text-cyan-300">
                      {loading ? "…" : reportCount}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {loading && (
              <section className="mt-4 flex min-h-[260px] items-center justify-center rounded-[24px] border border-white/[0.07] bg-[#0a1016]">
                <div className="flex flex-col items-center gap-3 text-slate-600">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/[0.08] border-t-cyan-300" />
                  <span className="text-[10px]">Načítám reporty…</span>
                </div>
              </section>
            )}

            {!loading && errorMessage && (
              <section className="mt-4 rounded-[24px] border border-red-400/15 bg-red-400/[0.035] p-6 text-[11px] text-red-300">
                {errorMessage}
              </section>
            )}

            {!loading && !errorMessage && rows.length === 0 && (
              <section className="mt-4 rounded-[24px] border border-dashed border-white/[0.09] bg-[#0a1016] px-6 py-14 text-center">
                <div className="text-3xl">◎</div>
                <h2 className="mt-4 text-lg font-black text-slate-200">Zatím není co reportovat</h2>
                <p className="mt-2 text-[10px] text-slate-600">
                  Nejprve vytvořte projekt a spusťte alespoň jednu analýzu.
                </p>
                <Link
                  href="/projects"
                  className="mt-5 inline-flex rounded-xl border border-white/[0.08] px-5 py-3 text-[10px] font-bold text-slate-300 transition hover:border-cyan-300/25 hover:text-cyan-200"
                >
                  Otevřít Field Portfolio
                </Link>
              </section>
            )}

            {!loading && !errorMessage && rows.length > 0 && (
              <section className="mt-4 overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#0a1016]">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-700">
                      Report Registry
                    </div>
                    <h2 className="mt-1 text-sm font-black text-slate-200">
                      Poslední analytický stav
                    </h2>
                  </div>
                  <div className="text-[8px] text-slate-700">
                    Jeden aktuální záznam na pozemek
                  </div>
                </div>

                <div className="hidden grid-cols-[minmax(210px,1.45fr)_90px_minmax(110px,.8fr)_110px_100px_150px_190px] gap-3 border-b border-white/[0.05] bg-white/[0.015] px-6 py-3 text-[8px] font-black uppercase tracking-[0.14em] text-slate-700 xl:grid">
                  <div>Pozemek</div>
                  <div>NDVI</div>
                  <div>Riziko</div>
                  <div>AEGRIS skóre</div>
                  <div>Kvalita</div>
                  <div>Analýza</div>
                  <div className="text-right">Akce</div>
                </div>

                <div className="divide-y divide-white/[0.05]">
                  {rows.map(({ project, analysis, recommendation }) => (
                    <article
                      key={project.id}
                      className="px-5 py-4 transition hover:bg-white/[0.015] sm:px-6"
                    >
                      <div className="grid items-center gap-4 xl:grid-cols-[minmax(210px,1.45fr)_90px_minmax(110px,.8fr)_110px_100px_150px_190px] xl:gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/projects/${project.id}`}
                              className="truncate text-[13px] font-black text-slate-100 transition hover:text-cyan-200"
                            >
                              {project.name}
                            </Link>
                            {project.status && (
                              <span className="rounded-md border border-emerald-400/15 bg-emerald-400/[0.05] px-2 py-1 text-[8px] font-black text-emerald-300">
                                {project.status}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 truncate text-[9px] text-slate-600">
                            {project.crop_name ?? "Plodina neuvedena"}
                            {project.crop_variety ? ` · ${project.crop_variety}` : ""}
                            {project.area_ha != null ? ` · ${project.area_ha} ha` : ""}
                          </div>
                          {analysis && (
                            <div className="mt-1 truncate text-[8px] text-slate-700 xl:hidden">
                              {analysis.satellite_product ?? analysis.source_provider ?? "Zdroj neuveden"}
                            </div>
                          )}
                        </div>

                        {analysis ? (
                          <>
                            <div>
                              <div className="mb-1 text-[8px] uppercase tracking-wider text-slate-700 xl:hidden">NDVI</div>
                              <div className="text-[13px] font-black text-cyan-300">
                                {Number(analysis.ndvi).toFixed(3)}
                              </div>
                            </div>

                            <div>
                              <div className="mb-1 text-[8px] uppercase tracking-wider text-slate-700 xl:hidden">Riziko</div>
                              <div className="text-[10px] font-black text-slate-300">
                                {analysis.risk}
                              </div>
                              {recommendation?.priority && (
                                <div className="mt-1 text-[8px] text-slate-600">
                                  Priorita: {recommendation.priority}
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="mb-1 text-[8px] uppercase tracking-wider text-slate-700 xl:hidden">AEGRIS skóre</div>
                              <div className="text-[11px] font-black text-amber-300">
                                {recommendation?.score != null ? `${recommendation.score}/100` : "—"}
                              </div>
                            </div>

                            <div>
                              <div className="mb-1 text-[8px] uppercase tracking-wider text-slate-700 xl:hidden">Kvalita</div>
                              <div className="text-[10px] font-black text-emerald-300">
                                {analysis.valid_geometry_pct != null
                                  ? `${Number(analysis.valid_geometry_pct).toFixed(1)} %`
                                  : "—"}
                              </div>
                            </div>

                            <div>
                              <div className="mb-1 text-[8px] uppercase tracking-wider text-slate-700 xl:hidden">Analýza</div>
                              <div className="text-[9px] font-bold text-slate-400">
                                {new Date(analysis.created_at).toLocaleDateString("cs-CZ")}
                              </div>
                              <div className="mt-1 text-[8px] text-slate-700">
                                {new Date(analysis.created_at).toLocaleTimeString("cs-CZ", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>

                            <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
                              <Link
                                href={`/projects/${project.id}`}
                                className="rounded-lg border border-white/[0.07] px-3 py-2 text-[9px] font-bold text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-200"
                              >
                                Field Health
                              </Link>
                              <Link
                                href={`/reports/${project.id}`}
                                className="rounded-lg bg-cyan-300 px-3 py-2 text-[9px] font-black text-[#061015] transition hover:bg-cyan-200"
                              >
                                Otevřít report →
                              </Link>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="xl:col-span-5">
                              <div className="rounded-lg border border-white/[0.06] bg-[#071017] px-4 py-3 text-[9px] text-slate-600">
                                Projekt zatím nemá uloženou analýzu.
                              </div>
                            </div>
                            <div className="flex justify-start xl:justify-end">
                              <Link
                                href={`/projects/${project.id}`}
                                className="rounded-lg border border-white/[0.07] px-3 py-2 text-[9px] font-bold text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-200"
                              >
                                Otevřít projekt
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-4 text-center text-[9px] leading-5 text-slate-700">
              Report Registry zobrazuje poslední uloženou analýzu každého pozemku.
              Detail reportu používá autoritativní data uložená v AegRIS.
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
