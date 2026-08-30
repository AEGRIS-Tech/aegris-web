"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BackButton from "../components/BackButton";
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
    <main className="min-h-screen bg-[#030817] text-slate-100">
      <div className="mx-auto max-w-[1250px] px-4 py-6 sm:px-6">
        <BackButton />

        <div className="mt-5 mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-cyan-400">
              AEGRIS / REPORTY
            </div>

            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
              Reporty
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Přehled posledních analýz a exportovatelných reportů aktivní organizace.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#071225] px-4 py-3 text-right">
            <div className="text-[9px] uppercase tracking-widest text-slate-600">
              Dostupné reporty
            </div>
            <div className="mt-1 text-2xl font-black text-cyan-400">
              {reportCount}
            </div>
          </div>
        </div>

        {loading && (
          <section className="rounded-2xl border border-slate-800 bg-[#071225] p-8 text-center text-sm text-slate-500">
            Načítám reporty...
          </section>
        )}

        {!loading && errorMessage && (
          <section className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6 text-sm text-red-300">
            {errorMessage}
          </section>
        )}

        {!loading && !errorMessage && rows.length === 0 && (
          <section className="rounded-2xl border border-slate-800 bg-[#071225] p-8 text-center">
            <div className="text-3xl">📄</div>
            <h2 className="mt-4 text-xl font-black">Zatím není co reportovat</h2>
            <p className="mt-2 text-sm text-slate-500">
              Nejprve vytvořte projekt a spusťte alespoň jednu analýzu.
            </p>
            <Link
              href="/projects"
              className="mt-6 inline-flex rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-500 hover:text-cyan-400"
            >
              Zobrazit projekty
            </Link>
          </section>
        )}

        {!loading && !errorMessage && rows.length > 0 && (
          <section className="grid gap-3">
            {rows.map(({ project, analysis, recommendation }) => (
              <article
                key={project.id}
                className="rounded-2xl border border-slate-800 bg-[#071225] p-4"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-lg font-black text-slate-100">
                        {project.name}
                      </h2>

                      {project.status && (
                        <span className="rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[8px] font-black text-emerald-400">
                          {project.status}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 text-[10px] text-slate-500">
                      {project.crop_name ?? "Plodina neuvedena"}
                      {project.crop_variety
                        ? ` · ${project.crop_variety}`
                        : ""}
                      {project.area_ha != null
                        ? ` · ${project.area_ha} ha`
                        : ""}
                    </div>
                  </div>

                  {analysis ? (
                    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-4 lg:max-w-[650px]">
                      <div className="rounded-lg border border-slate-800 bg-[#061022] p-3">
                        <div className="text-[8px] uppercase tracking-widest text-slate-600">
                          NDVI
                        </div>
                        <div className="mt-1 text-base font-black text-cyan-400">
                          {Number(analysis.ndvi).toFixed(3)}
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-[#061022] p-3">
                        <div className="text-[8px] uppercase tracking-widest text-slate-600">
                          Riziko
                        </div>
                        <div className="mt-1 text-[11px] font-black text-slate-200">
                          {analysis.risk}
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-[#061022] p-3">
                        <div className="text-[8px] uppercase tracking-widest text-slate-600">
                          AEGRIS skóre
                        </div>
                        <div className="mt-1 text-[11px] font-black text-amber-400">
                          {recommendation?.score != null
                            ? `${recommendation.score} / 100`
                            : "—"}
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-[#061022] p-3">
                        <div className="text-[8px] uppercase tracking-widest text-slate-600">
                          Kvalita
                        </div>
                        <div className="mt-1 text-[11px] font-black text-emerald-400">
                          {analysis.valid_geometry_pct != null
                            ? `${Number(
                                analysis.valid_geometry_pct
                              ).toFixed(1)} %`
                            : "—"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-slate-800 bg-[#061022] px-4 py-3 text-[10px] text-slate-500">
                      Projekt zatím nemá uloženou analýzu.
                    </div>
                  )}

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/projects/${project.id}`}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-[10px] font-bold text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
                    >
                      Otevřít projekt
                    </Link>

                    {analysis && (
                      <Link
                        href={`/reports/${project.id}`}
                        className="rounded-lg bg-cyan-500 px-3 py-2 text-[10px] font-black text-slate-950 transition hover:bg-cyan-400"
                      >
                        Vytvořit report
                      </Link>
                    )}
                  </div>
                </div>

                {analysis && (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-800 pt-3 text-[8px] text-slate-600">
                    <span>
                      Poslední analýza:{" "}
                      {new Date(analysis.created_at).toLocaleString("cs-CZ")}
                    </span>
                    <span>
                      Zdroj:{" "}
                      {analysis.satellite_product ??
                        analysis.source_provider ??
                        "—"}
                    </span>
                    {recommendation?.priority && (
                      <span>
                        Priorita:{" "}
                        <span className="font-bold text-slate-400">
                          {recommendation.priority}
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}