"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import ProjectMap from "./ProjectMap";
import AnalysisChart from "./AnalysisChart";

type Project = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
};

type Analysis = {
  id: number;
  project_id: number;
  ndvi: number;
  vegetation: number;
  risk: string;
  created_at: string;
};

export default function ProjectDetailPage() {
  const params = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);

  useEffect(() => {
    loadProject();
  }, []);

  async function loadProject() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", Number(params.id))
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setProject(data);

    const {
      data: lastAnalysis,
      error: analysisError,
    } = await supabase
      .from("analysis")
      .select("*")
      .eq("project_id", data.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (analysisError) {
      console.error(analysisError);
    } else if (lastAnalysis) {
      setAnalysis(lastAnalysis);
    }

    const {
      data: historyData,
      error: historyError,
    } = await supabase
      .from("analysis")
      .select("*")
      .eq("project_id", data.id)
      .order("created_at", { ascending: false });

    if (historyError) {
      console.error(historyError);
    } else {
      setHistory(historyData ?? []);
    }
  }

  async function runAnalysis() {
    if (!project) return;

    const ndvi = +(Math.random() * 0.45 + 0.45).toFixed(2);

    const vegetation = Math.round(ndvi * 100);

    let risk = "Nízké";

    if (ndvi < 0.55) {
      risk = "Vysoké";
    } else if (ndvi < 0.70) {
      risk = "Střední";
    }

    const { data, error } = await supabase
      .from("analysis")
      .insert({
        project_id: project.id,
        ndvi,
        vegetation,
        risk,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setAnalysis(data);

    await loadProject();
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Načítám projekt...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">

<h1 className="text-4xl font-bold text-cyan-400">
        {project.name}
      </h1>

      <p className="mt-2 text-slate-400">
        Detail projektu
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">

        <div className="rounded-2xl bg-slate-900 p-8">

          <h2 className="mb-6 text-2xl font-bold">
            Informace
          </h2>

          <div className="space-y-4">
            <p>
              <strong>Status:</strong> {project.status}
            </p>

            <p>
              <strong>Latitude:</strong> {project.latitude.toFixed(6)}
            </p>

            <p>
              <strong>Longitude:</strong> {project.longitude.toFixed(6)}
            </p>
          </div>

        </div>

        <div className="rounded-2xl bg-slate-900 p-8">

          <h2 className="mb-6 text-2xl font-bold">
            Lokalita projektu
          </h2>

          <ProjectMap
            latitude={project.latitude}
            longitude={project.longitude}
          />

          <div className="mt-6 space-y-3">

            <p>
              <strong>Status:</strong> {project.status}
            </p>

            <p>
              <strong>Latitude:</strong> {project.latitude.toFixed(6)}
            </p>

            <p>
              <strong>Longitude:</strong> {project.longitude.toFixed(6)}
            </p>

          </div>

          <div className="mt-6 rounded-xl bg-slate-800 p-4">
            NDVI:
            <span className="float-right text-cyan-400">
              {analysis ? analysis.ndvi : "—"}
            </span>
          </div>

          <div className="mt-3 rounded-xl bg-slate-800 p-4">
            Vegetace:
            <span className="float-right text-green-400">
              {analysis ? `${analysis.vegetation}%` : "—"}
            </span>
          </div>

          <div className="mt-3 rounded-xl bg-slate-800 p-4">
            Riziko:
            <span className="float-right text-red-400">
              {analysis ? analysis.risk : "—"}
            </span>
          </div>

          <div className="mt-3 rounded-xl bg-slate-800 p-4">
            Poslední analýza:
            <span className="float-right">
              {analysis
                ? new Date(analysis.created_at).toLocaleString("cs-CZ")
                : "—"}
            </span>
          </div>

          <button
            onClick={runAnalysis}
            className="mt-6 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-900 transition hover:bg-cyan-400"
          >
            🤖 Spustit AI analýzu
          </button>

          <div className="mt-8">
            <h3 className="mb-4 text-xl font-bold">
              Historie analýz
            </h3>

            <div className="space-y-3">

              {history.length === 0 ? (
                <div className="rounded-xl bg-slate-800 p-4 text-slate-400">
                  Zatím žádná analýza.
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-slate-800 p-4"
                  >
                    <div className="flex justify-between">

                      <span>
                        {new Date(item.created_at).toLocaleString("cs-CZ")}
                      </span>

                      <span className="font-bold text-cyan-400">
                        NDVI {item.ndvi}
                      </span>

                    </div>

                    <div className="mt-2 flex justify-between text-sm">

                      <span>
                        Vegetace {item.vegetation}%
                      </span>

                      <span>
                        {item.risk}
                      </span>

                    </div>

                  </div>
                ))
              )}

            </div>
          </div>

        </div>

      </div>
<div className="mt-10">
        <AnalysisChart history={history} />
      </div>
    </main>
  );
}