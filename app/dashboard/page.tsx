"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import WorldMap from "./components/WorldMap";
import NewProjectModal from "./components/NewProjectModal";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type Project = {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at?: string;
};

type AnalysisResult = {
  id?: number;
  ndvi: number;
  risk: string;
  created_at?: string;
  score?: number | null;
  priority?: string | null;
  valid_geometry_pct?: number | null;
  source_provider?: string | null;
  satellite_product?: string | null;
};

type DashboardCounts = {
  projects: number;
  analyses: number;
  reports: number;
  alerts: number;
  unreadAlerts: number;
  criticalProjects: number;
};

type DashboardProject = Project & {
  latestAnalysis: AnalysisResult | null;
  latestRecommendation: {
    id: number;
    analysis_id: number | null;
    priority: string;
    score: number | null;
    created_at: string;
  } | null;
  unreadAlerts: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [dashboardProjects, setDashboardProjects] =
    useState<DashboardProject[]>([]);
  const [dashboardCounts, setDashboardCounts] =
    useState<DashboardCounts>({
      projects: 0,
      analyses: 0,
      reports: 0,
      alerts: 0,
      unreadAlerts: 0,
      criticalProjects: 0,
    });
  const [user, setUser] = useState<User | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] =
    useState<Project | null>(null);

  const [newLocation, setNewLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  const [selectedProject, setSelectedProject] = useState<Project>({
    name: "No project selected",
    latitude: 0,
    longitude: 0,
    status: "Waiting",
  });

  const [analysis, setAnalysis] =
    useState<AnalysisResult | null>(null);

  const [analysisError, setAnalysisError] =
    useState("");

  // =========================================================
  // LOAD DASHBOARD SUMMARY
  // =========================================================

  const loadDashboardSummary = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("CHYBA DASHBOARD API:", result);
        return;
      }

      setDashboardCounts(result.counts);
      setDashboardProjects(
        Array.isArray(result.projects)
          ? result.projects
          : []
      );
    } catch (error) {
      console.error("CHYBA NAČTENÍ DASHBOARDU:", error);
    }
  }, []);

  const loadLatestAnalysis = useCallback(
    async (projectId: number) => {
      setAnalysisError("");

      try {
        const response = await fetch("/api/dashboard", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          console.error("CHYBA DASHBOARD API:", result);
          setAnalysis(null);
          return;
        }

        setDashboardCounts(result.counts);
        setDashboardProjects(
          Array.isArray(result.projects)
            ? result.projects
            : []
        );

        const projectData = Array.isArray(result.projects)
          ? result.projects.find(
              (item: DashboardProject) =>
                item.id === projectId
            )
          : null;

        const latest = projectData?.latestAnalysis ?? null;
        const recommendation =
          projectData?.latestRecommendation ?? null;

        if (!latest) {
          setAnalysis(null);
          return;
        }

        setAnalysis({
          ...latest,
          score: recommendation?.score ?? null,
          priority: recommendation?.priority ?? null,
        });
      } catch (error) {
        console.error("CHYBA NAČTENÍ ANALÝZY:", error);
        setAnalysis(null);
      }
    },
    []
  );

  // =========================================================
  // LOAD PROJECTS
  // =========================================================

  const loadProjects = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "CHYBA NAČTENÍ PROJEKTŮ:",
          error
        );
        return;
      }

      const loadedProjects =
        (data as Project[]) ?? [];

      setProjects(loadedProjects);
      await loadDashboardSummary();

      // Automaticky vyber nejnovější projekt
      if (loadedProjects.length > 0) {
        const firstProject = loadedProjects[0];

        setSelectedProject(firstProject);

        if (firstProject.id) {
          await loadLatestAnalysis(
            firstProject.id
          );
        }
      }
    },
    [loadDashboardSummary, loadLatestAnalysis]
  );

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("account_type, demo_expires_at")
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) {
        console.error(
          "CHYBA NAČTENÍ PROFILU:",
          profileError
        );
        router.push("/login");
        return;
      }

      if (
        profile?.account_type === "demo" &&
        profile.demo_expires_at &&
        new Date(profile.demo_expires_at) <= new Date()
      ) {
        router.push("/login");
        return;
      }

      setUser(user);

      await loadProjects(user.id);
    }

    init();
  }, [loadProjects, router]);

  // =========================================================
  // ANALYSIS ENTRY POINT
  // =========================================================

  function openSelectedProjectAnalysis() {
    if (!selectedProject.id) {
      setAnalysisError("Není vybrán žádný projekt.");
      return;
    }

    router.push(`/projects/${selectedProject.id}`);
  }

  // =========================================================
  // SELECT PROJECT
  // =========================================================

  async function selectProject(project: Project) {
    setSelectedProject(project);
    setAnalysis(null);
    setAnalysisError("");

    if (project.id) {
      await loadLatestAnalysis(project.id);
    }
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  async function logout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "CHYBA ODHLÁŠENÍ:",
        error
      );
      return;
    }

    router.push("/");
  }

  // =========================================================
  // NEW PROJECT
  // =========================================================

  function openNewProjectModal() {
    setNewLocation({
      latitude: 0,
      longitude: 0,
    });

    setModalOpen(true);
  }

  // =========================================================
  // EDIT PROJECT
  // =========================================================

  function openEditProjectModal(project: Project) {
    setEditingProject({ ...project });
    setEditModalOpen(true);
  }

  async function saveEditedProject() {
    if (!user || !editingProject?.id) {
      return;
    }

    const latitude = Number(editingProject.latitude);
    const longitude = Number(editingProject.longitude);

    if (
      !editingProject.name.trim() ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      console.error("NEPLATNÉ ÚDAJE PROJEKTU");
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .update({
        name: editingProject.name.trim(),
        latitude,
        longitude,
        status: editingProject.status.trim(),
      })
      .eq("id", editingProject.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error(
        "CHYBA ÚPRAVY PROJEKTU:",
        error
      );
      return;
    }

    const updatedProject = data as Project;

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === updatedProject.id
          ? updatedProject
          : project
      )
    );

    setSelectedProject((currentProject) =>
      currentProject.id === updatedProject.id
        ? updatedProject
        : currentProject
    );

    setEditingProject(null);
    setEditModalOpen(false);

    if (updatedProject.id) {
      await loadLatestAnalysis(updatedProject.id);
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      {/* ================================================= */}
      {/* TOP BAR */}
      {/* ================================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#020617]/95 backdrop-blur">

        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 lg:px-8">

          {/* LOGO */}

          <div>
            <div className="text-2xl font-black tracking-wide text-cyan-400">
              AEGRIS
            </div>

            <div className="hidden text-xs tracking-[0.25em] text-slate-600 sm:block">
              AGRICULTURE INTELLIGENCE
            </div>
          </div>

          {/* USER */}

          <div className="flex items-center gap-4">

            <div className="hidden text-right md:block">
              <div className="text-sm font-semibold text-slate-300">
                {user?.email ?? ""}
              </div>

              <div className="text-xs text-slate-600">
                Přihlášený uživatel
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
              👤
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:border-red-400/50 hover:bg-red-500/10"
            >
              Odhlásit se
            </button>

          </div>
        </div>
      </header>

      {/* ================================================= */}
      {/* PAGE */}
      {/* ================================================= */}

      <div className="mx-auto flex max-w-[1600px] gap-6 p-5 lg:p-8">

        {/* ================================================= */}
        {/* SIDEBAR */}
        {/* ================================================= */}

        <aside className="hidden w-64 shrink-0 lg:block">

          <div className="sticky top-28 space-y-3">

            {/* DASHBOARD */}

            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4">

              <div className="flex items-center gap-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/15 text-xl">
                  📊
                </div>

                <div>
                  <div className="font-semibold text-cyan-400">
                    Dashboard
                  </div>

                  <div className="text-xs text-slate-500">
                    Přehled systému
                  </div>
                </div>

              </div>
            </div>

            {/* AI ANALÝZA */}

            <Link
              href="/projects"
              className="group flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left transition hover:border-purple-400/30 hover:bg-slate-800"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-400/10 text-xl">
                🧠
              </div>

              <div>
                <div className="font-semibold">
                  AI Analýza
                </div>

                <div className="text-xs text-slate-500">
                  Analýza dat
                </div>
              </div>
            </Link>

            {/* MAPA */}

            <Link
              href="/map"
              className="group flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left transition hover:border-emerald-400/30 hover:bg-slate-800"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-xl">
                🗺️
              </div>

              <div>
                <div className="font-semibold">
                  Mapa
                </div>

                <div className="text-xs text-slate-500">
                  Lokality projektů
                </div>
              </div>
            </Link>

            {/* PROJEKTY */}

            <Link
              href="/projects"
              className="group flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left transition hover:border-cyan-400/30 hover:bg-slate-800"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-xl">
                📁
              </div>

              <div>
                <div className="font-semibold">
                  Projekty
                </div>

                <div className="text-xs text-slate-500">
                  Správa projektů
                </div>
              </div>
            </Link>

            {/* REPORTY */}

            <Link
              href="/reports"
              className="group flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left transition hover:border-yellow-400/30 hover:bg-slate-800"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400/10 text-xl">
                📄
              </div>

              <div>
                <div className="font-semibold">
                  Reporty
                </div>

                <div className="text-xs text-slate-500">
                  Výsledky analýz
                </div>
              </div>
            </Link>

            {/* SETTINGS */}

            <Link
              href="/settings"
              className="group flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-left transition hover:border-slate-600 hover:bg-slate-800"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-xl">
                ⚙️
              </div>

              <div>
                <div className="font-semibold">
                  Nastavení
                </div>

                <div className="text-xs text-slate-500">
                  Nastavení platformy
                </div>
              </div>
            </Link>

            {/* AEGRIS CARD */}

            <div className="relative mt-8 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-cyan-500/[0.08] to-slate-900 p-6">

              <div className="pointer-events-none absolute -bottom-3 -right-8 text-6xl font-black text-white/[0.025]">
                AEGRIS
              </div>

              <div className="relative">

                <div className="mb-3 text-3xl">
                  🌱
                </div>

                <div className="font-bold text-cyan-400">
                  AEGRIS
                </div>

                <div className="mt-2 text-xs leading-5 text-slate-500">
                  Inteligentní monitoring
                  zemědělské půdy.
                </div>

              </div>
            </div>

          </div>
        </aside>

        {/* ================================================= */}
        {/* MAIN */}
        {/* ================================================= */}

        <section className="min-w-0 flex-1">

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div className="mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-600">
                <span>AEGRIS</span>
                <span>/</span>
                <span className="text-cyan-400">
                  Dashboard
                </span>
              </div>

              <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                Dashboard
              </h1>

              <p className="mt-2 text-slate-500">
                Přehled celé platformy AEGRIS
              </p>

              {user && (
                <p className="mt-2 text-sm text-cyan-400">
                  Přihlášen: {user.email}
                </p>
              )}

            </div>

            <button
              type="button"
              onClick={openNewProjectModal}
              className="rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              ＋ Nový projekt
            </button>

          </div>

          {/* ================================================= */}
          {/* STATISTICS */}
          {/* ================================================= */}

          <section className="mb-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            {/* PROJECTS */}

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">

              <div className="flex items-center justify-between">

                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-600">
                    Projekty
                  </div>

                  <div className="mt-3 text-5xl font-black text-cyan-400">
                    {dashboardCounts.projects}
                  </div>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-xl">
                  📁
                </div>

              </div>
            </div>

            {/* AI */}

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">

              <div className="flex items-center justify-between">

                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-600">
                    AI analýzy
                  </div>

                  <div className="mt-3 text-5xl font-black text-emerald-400">
                    {dashboardCounts.analyses}
                  </div>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-xl">
                  🧠
                </div>

              </div>
            </div>

            {/* REPORTS */}

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">

              <div className="flex items-center justify-between">

                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-600">
                    Reporty
                  </div>

                  <div className="mt-3 text-5xl font-black text-yellow-400">
                    {dashboardCounts.reports}
                  </div>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10 text-xl">
                  📄
                </div>

              </div>
            </div>

            {/* ALERTS */}

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">

              <div className="flex items-center justify-between">

                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-600">
                    Alerty
                  </div>

                  <div className="mt-3 text-5xl font-black text-red-400">
                    {dashboardCounts.unreadAlerts}
                  </div>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-400/10 text-xl">
                  ⚠️
                </div>

              </div>
            </div>

          </section>

          {/* ================================================= */}
          {/* MAP + AI */}
          {/* ================================================= */}

          <section
            id="dashboard-map"
            className="grid gap-6 xl:grid-cols-[1.55fr_0.8fr]"
          >

            {/* MAP */}

            <div className="h-[430px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">

              <div className="relative h-full">

                <div className="absolute left-5 top-5 z-10 rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur">
                  Mapa projektů
                </div>

                <WorldMap
                  projects={projects}
                  onLocationSelect={(location) => {
                    if (location.id) {
                      selectProject(location);
                      return;
                    }

                    setNewLocation({
                      latitude: location.latitude,
                      longitude: location.longitude,
                    });

                    setModalOpen(true);
                  }}
                />

              </div>
            </div>

            {/* AI ASSISTANT */}

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-400/10 text-xl">
                  🧠
                </div>

                <div>
                  <h2 className="font-bold">
                    AI Assistant
                  </h2>

                  <p className="text-xs text-slate-500">
                    Analýza aktuálního projektu
                  </p>
                </div>

              </div>

              <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-5">

                <div className="text-xs uppercase tracking-wider text-slate-600">
                  Projekt
                </div>

                <div className="mt-2 truncate font-semibold text-cyan-400">
                  {selectedProject.name}
                </div>

              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">

                <div className="rounded-2xl bg-slate-950/40 p-4">

                  <div className="text-xs text-slate-600">
                    Latitude
                  </div>

                  <div className="mt-1 text-sm font-medium text-slate-300">
                    {selectedProject.latitude.toFixed(5)}
                  </div>

                </div>

                <div className="rounded-2xl bg-slate-950/40 p-4">

                  <div className="text-xs text-slate-600">
                    Longitude
                  </div>

                  <div className="mt-1 text-sm font-medium text-slate-300">
                    {selectedProject.longitude.toFixed(5)}
                  </div>

                </div>

              </div>

              <div className="mt-3 rounded-2xl bg-slate-950/40 p-4">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-slate-500">
                    Status
                  </span>

                  <span className="font-semibold text-emerald-400">
                    {selectedProject.status}
                  </span>

                </div>

              </div>

              {analysis && (
                <div className="mt-3">

                  <div className="mb-3 text-xs uppercase tracking-wider text-slate-600">
                    Poslední analýza
                  </div>

                  <div className="rounded-2xl border border-cyan-400/10 bg-slate-950/40 p-5">

                    <div className="text-xs uppercase tracking-wider text-slate-600">
                      NDVI
                    </div>

                    <div className="mt-2 text-4xl font-black text-cyan-400">
                      {analysis.ndvi.toFixed(3)}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">

                      <span className="text-sm text-slate-500">
                        AEGRIS skóre
                      </span>

                      <span className="font-bold text-amber-400">
                        {analysis.score != null
                          ? `${analysis.score} / 100`
                          : "—"}
                      </span>

                    </div>

                    <div className="mt-3 flex items-center justify-between">

                      <span className="text-sm text-slate-500">
                        Riziko
                      </span>

                      <span
                        className={`font-bold ${
                          analysis.risk === "Vysoké"
                            ? "text-red-400"
                            : analysis.risk === "Střední"
                              ? "text-yellow-400"
                              : "text-green-400"
                        }`}
                      >
                        {analysis.risk}
                      </span>

                    </div>

                  </div>
                </div>
              )}

              {analysisError && (
                <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  {analysisError}
                </div>
              )}

              <button
                type="button"
                onClick={openSelectedProjectAnalysis}
                disabled={!selectedProject.id}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="text-lg">
                  🧠
                </span>

                Otevřít projekt a spustit analýzu
              </button>

            </div>
          </section>

          {/* ================================================= */}
          {/* PROJECT LIST */}
          {/* ================================================= */}

          <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:p-8">

            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">

              <div>

                <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
                  Projekty
                </div>

                <h2 className="mt-1 text-2xl font-bold">
                  Uložené projekty
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Přehled všech projektů uživatele.
                </p>

              </div>

              <button
                type="button"
                onClick={openNewProjectModal}
                className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] px-4 py-2.5 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-400/10"
              >
                ＋ Nový projekt
              </button>

            </div>

            {projects.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/30 p-10 text-center">

                <div className="text-4xl">
                  📁
                </div>

                <div className="mt-3 font-semibold">
                  Zatím žádné projekty
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Vytvořte první projekt pomocí tlačítka výše.
                </p>

              </div>

            ) : (

              <div className="grid gap-3">

                {projects.map((project) => (

                  <div
                    key={project.id}
                    className={`grid w-full gap-4 rounded-2xl border p-5 transition md:grid-cols-[1.5fr_1fr_1fr_0.8fr_auto] ${
                      selectedProject.id ===
                      project.id
                        ? "border-cyan-400/30 bg-cyan-400/[0.05]"
                        : "border-slate-800 bg-slate-950/30 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >

                    <button
                      type="button"
                      onClick={() =>
                        selectProject(project)
                      }
                      className="text-left"
                    >
                      <div className="text-xs uppercase tracking-wider text-slate-600">
                        Projekt
                      </div>

                      <div className="mt-1 font-semibold text-cyan-400">
                        {project.name}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        selectProject(project)
                      }
                      className="text-left"
                    >
                      <div className="text-xs uppercase tracking-wider text-slate-600">
                        Latitude
                      </div>

                      <div className="mt-1 text-sm text-slate-300">
                        {project.latitude.toFixed(5)}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        selectProject(project)
                      }
                      className="text-left"
                    >
                      <div className="text-xs uppercase tracking-wider text-slate-600">
                        Longitude
                      </div>

                      <div className="mt-1 text-sm text-slate-300">
                        {project.longitude.toFixed(5)}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        selectProject(project)
                      }
                      className="text-left"
                    >
                      <div className="text-xs uppercase tracking-wider text-slate-600">
                        Status
                      </div>

                      <div className="mt-1 font-semibold text-emerald-400">
                        {project.status}
                      </div>
                    </button>

                    {project.id && (
                      <Link
                        href={`/projects/${project.id}`}
                        className="flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-3 text-center font-bold text-slate-950 transition hover:bg-cyan-400"
                      >
                        Otevřít detail projektu →
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        openEditProjectModal(project)
                      }
                      className="self-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] px-4 py-2.5 text-sm font-semibold text-cyan-400 transition hover:border-cyan-400/40 hover:bg-cyan-400/10"
                    >
                      ✏️ Upravit
                    </button>

                  </div>

                ))}

              </div>

            )}

          </section>

          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-slate-800/70 py-6 text-xs text-slate-600 sm:flex-row">

            <div>
              AEGRIS — Agriculture Intelligence Platform
            </div>

            <div>
              {projects.length}{" "}
              {projects.length === 1
                ? "projekt"
                : "projektů"}
            </div>

          </footer>

        </section>
      </div>

      {/* ================================================= */}
      {/* EDIT PROJECT MODAL */}
      {/* ================================================= */}

      {editModalOpen && editingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-[#020617] p-6 shadow-2xl">

            <div className="mb-6">

              <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
                Projekt
              </div>

              <h2 className="mt-1 text-2xl font-bold">
                Upravit projekt
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Uprav název, souřadnice nebo status projektu.
              </p>

            </div>

            <div className="space-y-4">

              <label className="block">

                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Název projektu
                </span>

                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(event) =>
                    setEditingProject({
                      ...editingProject,
                      name: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />

              </label>

              <div className="grid gap-4 sm:grid-cols-2">

                <label className="block">

                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Latitude
                  </span>

                  <input
                    type="number"
                    step="any"
                    value={editingProject.latitude}
                    onChange={(event) =>
                      setEditingProject({
                        ...editingProject,
                        latitude: Number(event.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  />

                </label>

                <label className="block">

                  <span className="mb-2 block text-sm font-medium text-slate-300">
                    Longitude
                  </span>

                  <input
                    type="number"
                    step="any"
                    value={editingProject.longitude}
                    onChange={(event) =>
                      setEditingProject({
                        ...editingProject,
                        longitude: Number(event.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                  />

                </label>

              </div>

              <label className="block">

                <span className="mb-2 block text-sm font-medium text-slate-300">
                  Status
                </span>

                <input
                  type="text"
                  value={editingProject.status}
                  onChange={(event) =>
                    setEditingProject({
                      ...editingProject,
                      status: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />

              </label>

            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingProject(null);
                }}
                className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Zrušit
              </button>

              <button
                type="button"
                onClick={saveEditedProject}
                className="rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Uložit změny
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* NEW PROJECT MODAL */}
      {/* ================================================= */}

      <NewProjectModal
        open={modalOpen}
        latitude={newLocation.latitude}
        longitude={newLocation.longitude}
        onClose={() =>
          setModalOpen(false)
        }
        onSave={async (project) => {
          if (!user) return;

          const { error } =
            await supabase
              .from("projects")
              .insert([
                {
                  name: project.name,
                  latitude: project.latitude,
                  longitude: project.longitude,
                  status: project.status,
                  boundary: project.boundary,
                  user_id: user.id,
                },
              ]);

          if (error) {
            console.error(
              "CHYBA ULOŽENÍ PROJEKTU:",
              error
            );
            return;
          }

          await loadProjects(user.id);

          setSelectedProject({
            ...project,
            id: undefined,
          });

          setModalOpen(false);
        }}
      />

    </main>
  );
}