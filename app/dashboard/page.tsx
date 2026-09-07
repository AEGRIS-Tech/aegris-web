"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import NewProjectModal from "./components/NewProjectModal";

const WorldMap = dynamic(() => import("./components/WorldMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
      Načítám mapu...
    </div>
  ),
});

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
  pendingFieldValidations: number;
};

type FieldValidationResult =
  | "confirmed"
  | "partially_confirmed"
  | "not_confirmed";

type DashboardProject = Project & {
  latestAnalysis: AnalysisResult | null;
  latestRecommendation: {
    id: number;
    analysis_id: number | null;
    priority: string;
    score: number | null;
    created_at: string;
  } | null;
  latestFieldValidation: {
    id: number;
    analysis_id: number;
    validation_result: FieldValidationResult;
    actual_cause: string | null;
    observed_at: string;
    validated_by: string;
    updated_at: string;
  } | null;
  unreadAlerts: number;
};

function priorityWeight(priority?: string | null) {
  if (priority === "Kritická") return 4;
  if (priority === "Vysoká") return 3;
  if (priority === "Střední") return 2;
  if (priority === "Nízká") return 1;
  return 0;
}

function priorityTone(priority?: string | null) {
  if (priority === "Kritická") {
    return {
      text: "text-red-300",
      border: "border-red-500/30",
      bg: "bg-red-500/[0.08]",
      dot: "bg-red-400",
    };
  }

  if (priority === "Vysoká") {
    return {
      text: "text-orange-300",
      border: "border-orange-500/30",
      bg: "bg-orange-500/[0.08]",
      dot: "bg-orange-400",
    };
  }

  if (priority === "Střední") {
    return {
      text: "text-amber-300",
      border: "border-amber-500/30",
      bg: "bg-amber-500/[0.08]",
      dot: "bg-amber-400",
    };
  }

  if (priority === "Nízká") {
    return {
      text: "text-emerald-300",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/[0.08]",
      dot: "bg-emerald-400",
    };
  }

  return {
    text: "text-slate-300",
    border: "border-slate-700",
    bg: "bg-slate-800/40",
    dot: "bg-slate-500",
  };
}

function validationLabel(result?: FieldValidationResult) {
  if (result === "confirmed") return "Potvrzeno v terénu";
  if (result === "partially_confirmed") return "Částečně potvrzeno";
  if (result === "not_confirmed") return "Nepotvrzeno";
  return "Čeká na terénní ověření";
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
      pendingFieldValidations: 0,
    });

  const [user, setUser] = useState<User | null>(null);
  const [activeOrganizationId, setActiveOrganizationId] =
    useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [newLocation, setNewLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  const [selectedProject, setSelectedProject] = useState<Project>({
    name: "Žádný pozemek není vybrán",
    latitude: 0,
    longitude: 0,
    status: "Waiting",
  });

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState("");

  const loadDashboardSummary = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("CHYBA DASHBOARD API:", result);
        return [] as DashboardProject[];
      }

      const loadedDashboardProjects: DashboardProject[] = Array.isArray(
        result.projects
      )
        ? result.projects
        : [];

      setDashboardCounts(result.counts);
      setDashboardProjects(loadedDashboardProjects);

      return loadedDashboardProjects;
    } catch (error) {
      console.error("CHYBA NAČTENÍ DASHBOARDU:", error);
      return [] as DashboardProject[];
    }
  }, []);

  const loadLatestAnalysis = useCallback(async (projectId: number) => {
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
      setDashboardProjects(Array.isArray(result.projects) ? result.projects : []);

      const projectData = Array.isArray(result.projects)
        ? result.projects.find(
            (item: DashboardProject) => item.id === projectId
          )
        : null;

      const latest = projectData?.latestAnalysis ?? null;
      const recommendation = projectData?.latestRecommendation ?? null;

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
  }, []);

  const loadProjects = useCallback(
    async (organizationId: string) => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("CHYBA NAČTENÍ PROJEKTŮ:", error);
        return;
      }

      const loadedProjects = (data as Project[]) ?? [];
      setProjects(loadedProjects);

      const loadedDashboardProjects = await loadDashboardSummary();

      if (loadedProjects.length > 0) {
        const priorityProject = [...loadedDashboardProjects]
          .filter((project) => project.latestAnalysis != null)
          .sort((a, b) => {
            const priorityDifference =
              priorityWeight(b.latestRecommendation?.priority) -
              priorityWeight(a.latestRecommendation?.priority);

            if (priorityDifference !== 0) return priorityDifference;

            const alertDifference = b.unreadAlerts - a.unreadAlerts;
            if (alertDifference !== 0) return alertDifference;

            const aTime = a.latestAnalysis?.created_at
              ? new Date(a.latestAnalysis.created_at).getTime()
              : 0;
            const bTime = b.latestAnalysis?.created_at
              ? new Date(b.latestAnalysis.created_at).getTime()
              : 0;

            return bTime - aTime;
          })[0];

        const defaultProject =
          loadedProjects.find((project) => project.id === priorityProject?.id) ??
          loadedProjects[0];

        setSelectedProject(defaultProject);

        if (defaultProject.id) {
          await loadLatestAnalysis(defaultProject.id);
        }
      }
    },
    [loadDashboardSummary, loadLatestAnalysis]
  );

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("account_type, demo_expires_at, active_organization_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("CHYBA NAČTENÍ PROFILU:", profileError);
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

      if (!profile?.active_organization_id) {
        console.error("CHYBA: Uživatel nemá nastavenou aktivní organizaci.");
        router.push("/login");
        return;
      }

      setActiveOrganizationId(profile.active_organization_id);
      setUser(user);
      await loadProjects(profile.active_organization_id);
    }

    init();
  }, [loadProjects, router]);

  function openSelectedProjectAnalysis() {
    if (!selectedProject.id) {
      setAnalysisError("Není vybrán žádný projekt.");
      return;
    }

    router.push(`/projects/${selectedProject.id}`);
  }

  async function selectProject(project: Project) {
    setSelectedProject(project);
    setAnalysis(null);
    setAnalysisError("");

    if (project.id) {
      await loadLatestAnalysis(project.id);
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("CHYBA ODHLÁŠENÍ:", error);
      return;
    }

    router.push("/");
  }

  function openNewProjectModal() {
    setNewLocation({ latitude: 0, longitude: 0 });
    setModalOpen(true);
  }

  function openEditProjectModal(project: Project) {
    setEditingProject({ ...project });
    setEditModalOpen(true);
  }

  async function saveEditedProject() {
    if (!user || !editingProject?.id) return;

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
      .select()
      .maybeSingle();

    if (error) {
      console.error("CHYBA ÚPRAVY PROJEKTU:", error);
      return;
    }

    if (!data) {
      console.error(
        "CHYBA: Projekt nebyl upraven nebo k němu nemáte oprávnění."
      );
      return;
    }

    const updatedProject = data as Project;

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );

    setSelectedProject((currentProject) =>
      currentProject.id === updatedProject.id ? updatedProject : currentProject
    );

    setEditingProject(null);
    setEditModalOpen(false);

    if (updatedProject.id) {
      await loadLatestAnalysis(updatedProject.id);
    }
  }

  const priorityProjects = useMemo(
    () =>
      [...dashboardProjects]
        .filter((project) => project.latestAnalysis != null)
        .sort((a, b) => {
          const priorityDifference =
            priorityWeight(b.latestRecommendation?.priority) -
            priorityWeight(a.latestRecommendation?.priority);

          if (priorityDifference !== 0) return priorityDifference;

          const alertDifference = b.unreadAlerts - a.unreadAlerts;
          if (alertDifference !== 0) return alertDifference;

          const aTime = a.latestAnalysis?.created_at
            ? new Date(a.latestAnalysis.created_at).getTime()
            : 0;
          const bTime = b.latestAnalysis?.created_at
            ? new Date(b.latestAnalysis.created_at).getTime()
            : 0;

          return bTime - aTime;
        }),
    [dashboardProjects]
  );

  const highPriorityProjects = priorityProjects.filter(
    (project) => project.latestRecommendation?.priority === "Vysoká"
  ).length;

  const stableProjects = priorityProjects.filter(
    (project) =>
      project.latestRecommendation?.priority === "Nízká" ||
      project.latestRecommendation?.priority === "Střední"
  ).length;

  const selectedDashboardProject = dashboardProjects.find(
    (project) => project.id === selectedProject.id
  );

  const selectedRecommendation =
    selectedDashboardProject?.latestRecommendation ?? null;

  const selectedValidation =
    selectedDashboardProject?.latestFieldValidation ?? null;

  const selectedTone = priorityTone(selectedRecommendation?.priority);

  const mapProjects = useMemo(
    () =>
      projects.map((project) => {
        const dashboardProject = dashboardProjects.find(
          (item) => item.id === project.id
        );

        return {
          ...project,
          priority: dashboardProject?.latestRecommendation?.priority ?? null,
          score: dashboardProject?.latestRecommendation?.score ?? null,
          unreadAlerts: dashboardProject?.unreadAlerts ?? 0,
        };
      }),
    [projects, dashboardProjects]
  );

  const userLabel = user?.email?.split("@")[0] || "Agronom";

  return (
    <main className="min-h-screen bg-[#05090d] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1920px]">
        <aside className="hidden w-[244px] shrink-0 border-r border-white/[0.06] bg-[#080d12] xl:flex xl:flex-col">
          <div className="border-b border-white/[0.06] px-7 py-7">
            <div className="text-[22px] font-black tracking-[0.18em] text-cyan-300">
              AEGRIS
            </div>
            <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.32em] text-slate-600">
              Agronomic Intelligence
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 px-4 py-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-3 text-sm font-semibold text-cyan-200"
            >
              <span className="text-base">⌂</span>
              Přehled
            </Link>

            <Link
              href="/projects"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>▦</span>
              Pozemky
            </Link>

            <Link
              href="/map"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>◇</span>
              Mapa
            </Link>

            <Link
              href="/reports"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>▤</span>
              Reporty
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>⚙</span>
              Nastavení
            </Link>
          </nav>

          <div className="m-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-sm font-black text-cyan-300">
                A
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-200">
                  {userLabel}
                </div>
                <div className="truncate text-[11px] text-slate-600">
                  {user?.email ?? ""}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-full rounded-lg border border-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-red-400/20 hover:text-red-300"
            >
              Odhlásit se
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#05090d]/90 backdrop-blur-xl">
            <div className="flex min-h-[74px] items-center justify-between gap-4 px-5 md:px-8 xl:px-10">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400/70">
                  Agronomic Operations Center
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  Monitoring porostů a rozhodovací podpora
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-[11px] font-bold text-emerald-300 sm:block">
                  ● SYSTÉM AKTIVNÍ
                </div>

                <button
                  type="button"
                  onClick={openNewProjectModal}
                  className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-black text-[#061015] transition hover:bg-cyan-200"
                >
                  + Nový pozemek
                </button>
              </div>
            </div>
          </header>

          <div className="px-5 py-7 md:px-8 xl:px-10 xl:py-9">
            <section className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Dobrý den, {userLabel}
                </p>
                <h1 className="mt-1 max-w-4xl text-3xl font-black tracking-[-0.035em] text-white md:text-[42px] md:leading-[1.05]">
                  Dnes vyžadují pozornost{" "}
                  <span className="text-cyan-300">
                    {dashboardCounts.criticalProjects +
                      highPriorityProjects}{" "}
                    pozemky
                  </span>
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  AegRIS řadí pozemky podle poslední analýzy, priority,
                  nepřečtených upozornění a terénního ověření.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                {dashboardCounts.analyses} uložených analýz
              </div>
            </section>

            <section className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="group rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.09] to-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-300/70">
                    Kritické
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_18px_rgba(248,113,113,0.8)]" />
                </div>
                <div className="mt-5 text-4xl font-black tracking-tight text-white">
                  {dashboardCounts.criticalProjects}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  okamžitá pozornost
                </div>
              </div>

              <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.07] to-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-300/70">
                    Vysoká priorita
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                </div>
                <div className="mt-5 text-4xl font-black tracking-tight text-white">
                  {highPriorityProjects}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  vyžaduje kontrolu
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.06] to-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300/70">
                    Stabilní
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="mt-5 text-4xl font-black tracking-tight text-white">
                  {stableProjects}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  nízká / střední priorita
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.06] to-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300/70">
                    Čeká na ověření
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                </div>
                <div className="mt-5 text-4xl font-black tracking-tight text-white">
                  {dashboardCounts.pendingFieldValidations}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Ground Truth workflow
                </div>
              </div>
            </section>

            <section className="mb-7 overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#0a1016]">
              <div className="flex flex-col justify-between gap-4 border-b border-white/[0.06] px-5 py-5 md:flex-row md:items-center md:px-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">
                    Priorita dnes
                  </div>
                  <h2 className="mt-1 text-xl font-bold text-white">
                    Pozemky, které mají jít první
                  </h2>
                </div>

                <div className="text-xs text-slate-600">
                  Řazení: priorita → upozornění → poslední analýza
                </div>
              </div>

              {priorityProjects.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  Priority se zobrazí po první uložené analýze.
                </div>
              ) : (
                <div>
                  {priorityProjects.slice(0, 5).map((project, index) => {
                    const priority =
                      project.latestRecommendation?.priority ?? "Bez priority";
                    const score = project.latestRecommendation?.score ?? null;
                    const tone = priorityTone(priority);
                    const validation = project.latestFieldValidation;

                    return (
                      <div
                        key={project.id}
                        className={`grid gap-4 border-b border-white/[0.05] px-5 py-4 transition last:border-b-0 hover:bg-white/[0.025] md:px-6 lg:grid-cols-[42px_1.35fr_0.7fr_0.65fr_1.1fr_auto] lg:items-center ${
                          index === 0 ? "bg-white/[0.018]" : ""
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-xs font-black text-slate-500">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${tone.dot}`}
                            />
                            <div className="truncate font-bold text-white">
                              {project.name}
                            </div>
                          </div>
                          <div className="mt-1 text-[11px] text-slate-600">
                            Analýza {formatDate(project.latestAnalysis?.created_at)}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
                            Priorita
                          </div>
                          <div
                            className={`mt-1 inline-flex rounded-md border px-2 py-1 text-xs font-bold ${tone.border} ${tone.bg} ${tone.text}`}
                          >
                            {priority}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
                            Skóre
                          </div>
                          <div className="mt-1 text-lg font-black text-white">
                            {score != null ? score : "—"}
                            {score != null && (
                              <span className="ml-1 text-[10px] font-medium text-slate-600">
                                /100
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            {project.unreadAlerts > 0 ? (
                              <span className="text-xs font-semibold text-red-300">
                                ● {project.unreadAlerts} upozornění
                              </span>
                            ) : (
                              <span className="text-xs text-slate-600">
                                Bez nových upozornění
                              </span>
                            )}
                          </div>
                          <div
                            className={`mt-1.5 text-[11px] font-medium ${
                              validation?.validation_result === "confirmed"
                                ? "text-emerald-300"
                                : validation?.validation_result ===
                                    "partially_confirmed"
                                  ? "text-amber-300"
                                  : validation?.validation_result ===
                                      "not_confirmed"
                                    ? "text-red-300"
                                    : "text-slate-500"
                            }`}
                          >
                            {validation
                              ? `✓ ${validationLabel(
                                  validation.validation_result
                                )}`
                              : "○ Čeká na terénní ověření"}
                          </div>
                        </div>

                        {project.id && (
                          <Link
                            href={`/projects/${project.id}`}
                            className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-center text-xs font-bold text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-200"
                          >
                            Otevřít →
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="mb-7 grid gap-5 2xl:grid-cols-[minmax(0,1.6fr)_390px]">
              <div className="overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#0a1016]">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 md:px-6">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
                      Monitoring
                    </div>
                    <h2 className="mt-1 text-lg font-bold text-white">
                      Mapa pozemků
                    </h2>
                  </div>

                  <Link
                    href="/map"
                    className="text-xs font-semibold text-slate-500 transition hover:text-cyan-300"
                  >
                    Celá mapa →
                  </Link>
                </div>

                <div className="h-[520px]">
                  <WorldMap
                    projects={mapProjects}
                    selectedProjectId={selectedProject.id}
                    compactControls
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

              <div className="rounded-[24px] border border-white/[0.07] bg-[#0a1016] p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
                      Aktuální pozemek
                    </div>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                      {selectedProject.name}
                    </h2>
                  </div>

                  {selectedRecommendation?.priority && (
                    <span
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold ${selectedTone.border} ${selectedTone.bg} ${selectedTone.text}`}
                    >
                      {selectedRecommendation.priority}
                    </span>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
                      AegRIS skóre
                    </div>
                    <div className="mt-2 text-3xl font-black text-white">
                      {selectedRecommendation?.score ?? analysis?.score ?? "—"}
                      {(selectedRecommendation?.score != null ||
                        analysis?.score != null) && (
                        <span className="ml-1 text-[10px] font-medium text-slate-600">
                          /100
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
                      NDVI
                    </div>
                    <div className="mt-2 text-3xl font-black text-cyan-300">
                      {analysis ? analysis.ndvi.toFixed(3) : "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-500">Terénní ověření</span>
                    <span
                      className={`text-right text-xs font-bold ${
                        selectedValidation?.validation_result === "confirmed"
                          ? "text-emerald-300"
                          : selectedValidation?.validation_result ===
                              "partially_confirmed"
                            ? "text-amber-300"
                            : selectedValidation?.validation_result ===
                                "not_confirmed"
                              ? "text-red-300"
                              : "text-slate-500"
                      }`}
                    >
                      {validationLabel(selectedValidation?.validation_result)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Stav projektu</span>
                    <span className="text-xs font-bold text-slate-300">
                      {selectedProject.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
                    <span className="text-xs text-slate-500">Souřadnice</span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {selectedProject.latitude.toFixed(4)},{" "}
                      {selectedProject.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>

                {analysisError && (
                  <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-xs text-red-300">
                    {analysisError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={openSelectedProjectAnalysis}
                  disabled={!selectedProject.id}
                  className="mt-5 w-full rounded-xl bg-cyan-300 py-3 text-sm font-black text-[#061015] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Otevřít detail pozemku →
                </button>

                <div className="mt-5 border-t border-white/[0.06] pt-5">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                    Poslední stav
                  </div>

                  <div className="mt-3 space-y-3">
                    <div className="flex gap-3">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                      <div>
                        <div className="text-xs font-semibold text-slate-300">
                          Poslední analýza
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-600">
                          {formatDate(
                            selectedDashboardProject?.latestAnalysis?.created_at
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div
                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                          selectedDashboardProject?.unreadAlerts
                            ? "bg-red-400"
                            : "bg-slate-700"
                        }`}
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-300">
                          Upozornění
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-600">
                          {selectedDashboardProject?.unreadAlerts ?? 0} nepřečtených
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-white/[0.07] bg-[#0a1016]">
              <div className="flex flex-col justify-between gap-4 border-b border-white/[0.06] px-5 py-5 md:flex-row md:items-center md:px-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
                    Portfolio
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-white">
                    Všechny pozemky
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={openNewProjectModal}
                  className="rounded-lg border border-cyan-300/20 px-3 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-300/[0.06]"
                >
                  + Přidat pozemek
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  Zatím nejsou vytvořené žádné pozemky.
                </div>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {projects.map((project) => {
                    const dashboardProject = dashboardProjects.find(
                      (item) => item.id === project.id
                    );
                    const recommendation = dashboardProject?.latestRecommendation;
                    const tone = priorityTone(recommendation?.priority);

                    return (
                      <div
                        key={project.id}
                        className={`grid gap-3 px-5 py-4 transition hover:bg-white/[0.02] md:px-6 lg:grid-cols-[1.5fr_0.75fr_0.75fr_0.8fr_auto] lg:items-center ${
                          selectedProject.id === project.id
                            ? "bg-cyan-300/[0.025]"
                            : ""
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => selectProject(project)}
                          className="min-w-0 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${tone.dot}`}
                            />
                            <span className="truncate text-sm font-bold text-white">
                              {project.name}
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] text-slate-600">
                            {project.latitude.toFixed(4)},{" "}
                            {project.longitude.toFixed(4)}
                          </div>
                        </button>

                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
                            Priorita
                          </div>
                          <div className={`mt-1 text-xs font-bold ${tone.text}`}>
                            {recommendation?.priority ?? "Bez analýzy"}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
                            Skóre
                          </div>
                          <div className="mt-1 text-sm font-black text-slate-300">
                            {recommendation?.score != null
                              ? `${recommendation.score}/100`
                              : "—"}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
                            Stav
                          </div>
                          <div className="mt-1 text-xs font-semibold text-slate-400">
                            {project.status}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditProjectModal(project)}
                            className="rounded-lg border border-white/[0.07] px-3 py-2 text-xs font-semibold text-slate-500 transition hover:text-white"
                          >
                            Upravit
                          </button>

                          {project.id && (
                            <Link
                              href={`/projects/${project.id}`}
                              className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.04] px-3 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-300/[0.08]"
                            >
                              Detail →
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <footer className="flex flex-col justify-between gap-2 py-7 text-[11px] text-slate-700 sm:flex-row">
              <div>AEGRIS — Agronomic Intelligence Platform</div>
              <div>
                {projects.length} {projects.length === 1 ? "pozemek" : "pozemků"} ·{" "}
                {dashboardCounts.analyses} analýz
              </div>
            </footer>
          </div>
        </div>
      </div>

      {editModalOpen && editingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/[0.08] bg-[#0a1016] p-6 shadow-2xl">
            <div className="mb-6">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
                Pozemek
              </div>
              <h2 className="mt-2 text-2xl font-black text-white">
                Upravit pozemek
              </h2>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-400">
                  Název
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
                  className="w-full rounded-xl border border-white/[0.08] bg-[#060b10] px-4 py-3 text-white outline-none transition focus:border-cyan-300/50"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-400">
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
                    className="w-full rounded-xl border border-white/[0.08] bg-[#060b10] px-4 py-3 text-white outline-none transition focus:border-cyan-300/50"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-400">
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
                    className="w-full rounded-xl border border-white/[0.08] bg-[#060b10] px-4 py-3 text-white outline-none transition focus:border-cyan-300/50"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-400">
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
                  className="w-full rounded-xl border border-white/[0.08] bg-[#060b10] px-4 py-3 text-white outline-none transition focus:border-cyan-300/50"
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
                className="rounded-xl border border-white/[0.08] px-5 py-3 font-semibold text-slate-400 transition hover:text-white"
              >
                Zrušit
              </button>

              <button
                type="button"
                onClick={saveEditedProject}
                className="rounded-xl bg-cyan-300 px-5 py-3 font-black text-[#061015] transition hover:bg-cyan-200"
              >
                Uložit změny
              </button>
            </div>
          </div>
        </div>
      )}

      <NewProjectModal
        open={modalOpen}
        latitude={newLocation.latitude}
        longitude={newLocation.longitude}
        onClose={() => setModalOpen(false)}
        onSave={async (project) => {
          if (!user || !activeOrganizationId) return;

          const { error } = await supabase.from("projects").insert([
            {
              name: project.name,
              latitude: project.latitude,
              longitude: project.longitude,
              status: project.status,
              boundary: project.boundary,
              user_id: user.id,
              organization_id: activeOrganizationId,
            },
          ]);

          if (error) {
            console.error("CHYBA ULOŽENÍ PROJEKTU:", error);
            return;
          }

          await loadProjects(activeOrganizationId);

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
