"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import WorldMap from "./dashboard/components/WorldMap";
import NewProjectModal from "./dashboard/components/NewProjectModal";
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

type AlertLevel = "critical" | "warning" | "info";

type Alert = {
  id: number;
  project_id: number;
  analysis_id?: number | null;
  recommendation_id?: number | null;
  level: AlertLevel;
  priority: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type DashboardAlert = Alert & {
  projectName: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [alertFilter, setAlertFilter] = useState<
    "all" | "unread" | "critical" | "warning"
  >("all");

  const [modalOpen, setModalOpen] = useState(false);

  const [newLocation, setNewLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  const [selectedProject, setSelectedProject] = useState({
    name: "No project selected",
    latitude: 0,
    longitude: 0,
    status: "Waiting",
  });

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.assign("/login");
        return;
      }

      setUser(user);

      await Promise.all([
        loadProjects(user.id),
        loadAlerts(),
      ]);
    }

    init();
  }, []);

  async function loadProjects(userId: string) {
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

    setProjects((data as Project[]) ?? []);
  }

  async function loadAlerts() {
    setLoadingAlerts(true);

    try {
      const { data: alertData, error: alertError } =
        await supabase
          .from("aegris_alerts")
          .select("*")
          .order("created_at", {
            ascending: false,
          })
          .limit(100);

      if (alertError) {
        console.error(
          "CHYBA NAČTENÍ ALERTŮ:",
          alertError
        );
        setAlerts([]);
        return;
      }

      const rawAlerts =
        (alertData as Alert[]) ?? [];

      if (rawAlerts.length === 0) {
        setAlerts([]);
        return;
      }

      const projectIds = Array.from(
        new Set(
          rawAlerts.map(
            (alert) => alert.project_id
          )
        )
      );

      const { data: projectData, error: projectError } =
        await supabase
          .from("projects")
          .select("id, name")
          .in("id", projectIds);

      if (projectError) {
        console.error(
          "CHYBA NAČTENÍ PROJEKTŮ PRO ALERTY:",
          projectError
        );
      }

      const projectMap = new Map<
        number,
        string
      >(
        ((projectData as {
          id: number;
          name: string;
        }[]) ?? []).map((project) => [
          project.id,
          project.name,
        ])
      );

      setAlerts(
        rawAlerts.map((alert) => ({
          ...alert,
          projectName:
            projectMap.get(
              alert.project_id
            ) ?? "Neznámý projekt",
        }))
      );
    } finally {
      setLoadingAlerts(false);
    }
  }

  async function markAlertAsRead(
    alertId: number
  ) {
    const { error } = await supabase
      .from("aegris_alerts")
      .update({
        is_read: true,
      })
      .eq("id", alertId);

    if (error) {
      console.error(
        "CHYBA OZNAČENÍ ALERTU:",
        error
      );
      return;
    }

    setAlerts((current) =>
      current.map((alert) =>
        alert.id === alertId
          ? {
              ...alert,
              is_read: true,
            }
          : alert
      )
    );
  }

  async function markAllAlertsAsRead() {
    const unreadIds = alerts
      .filter((alert) => !alert.is_read)
      .map((alert) => alert.id);

    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("aegris_alerts")
      .update({
        is_read: true,
      })
      .in("id", unreadIds);

    if (error) {
      console.error(
        "CHYBA OZNAČENÍ ALERTŮ:",
        error
      );
      return;
    }

    setAlerts((current) =>
      current.map((alert) => ({
        ...alert,
        is_read: true,
      }))
    );
  }

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

    window.location.assign("/");
  }

  const unreadAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) => !alert.is_read
      ).length,
    [alerts]
  );

  const criticalAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) =>
          alert.level === "critical"
      ).length,
    [alerts]
  );

  const warningAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) =>
          alert.level === "warning"
      ).length,
    [alerts]
  );

  const visibleAlerts = useMemo(() => {
    if (alertFilter === "unread") {
      return alerts.filter(
        (alert) => !alert.is_read
      );
    }

    if (alertFilter === "critical") {
      return alerts.filter(
        (alert) =>
          alert.level === "critical"
      );
    }

    if (alertFilter === "warning") {
      return alerts.filter(
        (alert) =>
          alert.level === "warning"
      );
    }

    return alerts;
  }, [alerts, alertFilter]);

  function alertClasses(level: AlertLevel) {
    if (level === "critical") {
      return {
        wrapper:
          "border-red-500/30 bg-red-500/[0.05]",
        icon:
          "bg-red-500/10 text-red-400",
        title: "text-red-400",
        badge:
          "bg-red-500/10 text-red-400",
      };
    }

    if (level === "warning") {
      return {
        wrapper:
          "border-yellow-500/30 bg-yellow-500/[0.05]",
        icon:
          "bg-yellow-500/10 text-yellow-400",
        title: "text-yellow-400",
        badge:
          "bg-yellow-500/10 text-yellow-400",
      };
    }

    return {
      wrapper:
        "border-cyan-500/20 bg-cyan-500/[0.04]",
      icon:
        "bg-cyan-500/10 text-cyan-400",
      title: "text-cyan-400",
      badge:
        "bg-cyan-500/10 text-cyan-400",
    };
  }

  function alertIcon(level: AlertLevel) {
    if (level === "critical") return "🔴";
    if (level === "warning") return "🟠";
    return "🔵";
  }

  function alertLabel(level: AlertLevel) {
    if (level === "critical")
      return "Kritické";

    if (level === "warning")
      return "Upozornění";

    return "Informace";
  }

  function formatAlertDate(
    value: string
  ) {
    return new Date(value).toLocaleString(
      "cs-CZ"
    );
  }

  return (
    <main className="flex min-h-screen bg-slate-950 text-white">
      {/* SIDEBAR */}
      <aside className="min-h-screen w-72 border-r border-slate-800 bg-slate-900 p-8">
        <h1 className="mb-10 text-3xl font-bold text-cyan-400">
          AEGRIS
        </h1>

        <nav className="space-y-4">
          <button
            type="button"
            className="w-full rounded-xl bg-cyan-500 px-5 py-3 text-left font-semibold text-slate-950"
          >
            📊 Dashboard
          </button>

          <button
            type="button"
            className="w-full rounded-xl px-5 py-3 text-left hover:bg-slate-800"
          >
            🛰️ AI Analýza
          </button>

          <button
            type="button"
            className="w-full rounded-xl px-5 py-3 text-left hover:bg-slate-800"
          >
            🗺️ Mapy
          </button>

          <Link
            href="/projects"
            className="block w-full rounded-xl px-5 py-3 text-left hover:bg-slate-800"
          >
            📁 Projekty
          </Link>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById(
                  "aegris-alert-center"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
            className="flex w-full items-center justify-between rounded-xl px-5 py-3 text-left hover:bg-slate-800"
          >
            <span>🚨 Alerty</span>

            {unreadAlerts > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                {unreadAlerts}
              </span>
            )}
          </button>

          <button
            type="button"
            className="w-full rounded-xl px-5 py-3 text-left hover:bg-slate-800"
          >
            📄 Reporty
          </button>

          <button
            type="button"
            className="w-full rounded-xl px-5 py-3 text-left hover:bg-slate-800"
          >
            ⚙️ Nastavení
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <section className="flex-1 p-10">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold">
              Dashboard
            </h2>

            <p className="mt-2 text-slate-400">
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
            onClick={logout}
            className="rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-500"
          >
            Odhlásit se
          </button>
        </div>

        {/* STATISTIKY */}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-900 p-6">
            <h3 className="text-slate-400">
              Projekty
            </h3>

            <p className="mt-3 text-5xl font-bold text-cyan-400">
              {projects.length}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6">
            <h3 className="text-slate-400">
              AI Analýzy
            </h3>

            <p className="mt-3 text-5xl font-bold text-green-400">
              1284
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6">
            <h3 className="text-slate-400">
              Reporty
            </h3>

            <p className="mt-3 text-5xl font-bold text-yellow-400">
              357
            </p>
          </div>

          <div
            className="cursor-pointer rounded-2xl bg-slate-900 p-6 transition hover:ring-2 hover:ring-red-500/40"
            onClick={() =>
              document
                .getElementById(
                  "aegris-alert-center"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <h3 className="text-slate-400">
              Nepřečtené alerty
            </h3>

            <p className="mt-3 text-5xl font-bold text-red-400">
              {unreadAlerts}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Celkem {alerts.length} alertů
            </p>
          </div>
        </div>

        {/* ALERT CENTER */}
        <section
          id="aegris-alert-center"
          className="mt-10 scroll-mt-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 md:p-8"
        >
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-red-400">
                AEGRIS Intelligence
              </div>

              <h2 className="mt-1 text-3xl font-bold">
                🚨 Alert Center
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Centrální přehled upozornění ze všech
                projektů. AEGRIS zde zobrazuje pouze
                události, které vznikly z jeho
                analytického vyhodnocení.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAlertFilter("all")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  alertFilter === "all"
                    ? "bg-cyan-500 text-slate-950"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Vše ({alerts.length})
              </button>

              <button
                type="button"
                onClick={() =>
                  setAlertFilter("unread")
                }
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  alertFilter === "unread"
                    ? "bg-cyan-500 text-slate-950"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Nepřečtené ({unreadAlerts})
              </button>

              <button
                type="button"
                onClick={() =>
                  setAlertFilter("critical")
                }
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  alertFilter === "critical"
                    ? "bg-red-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Kritické ({criticalAlerts})
              </button>

              <button
                type="button"
                onClick={() =>
                  setAlertFilter("warning")
                }
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  alertFilter === "warning"
                    ? "bg-yellow-500 text-slate-950"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                Upozornění ({warningAlerts})
              </button>

              <button
                type="button"
                onClick={loadAlerts}
                disabled={loadingAlerts}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400 disabled:opacity-50"
              >
                {loadingAlerts
                  ? "Načítám..."
                  : "↻ Obnovit"}
              </button>
            </div>
          </div>

          {unreadAlerts > 0 && (
            <div className="mb-5 flex items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/[0.04] px-5 py-4">
              <div>
                <div className="font-semibold text-red-300">
                  {unreadAlerts} nepřečtených alertů
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  AEGRIS doporučuje věnovat pozornost
                  těmto projektům.
                </div>
              </div>

              <button
                type="button"
                onClick={markAllAlertsAsRead}
                className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
              >
                Označit vše jako přečtené
              </button>
            </div>
          )}

          {loadingAlerts ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-8 text-center text-slate-500">
              Načítám alerty AEGRIS...
            </div>
          ) : visibleAlerts.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-8 text-center">
              <div className="text-3xl">✓</div>

              <h3 className="mt-3 text-lg font-bold text-emerald-400">
                Žádné odpovídající alerty
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                V této kategorii AEGRIS momentálně
                neeviduje žádné události.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleAlerts.map((alert) => {
                const styles =
                  alertClasses(
                    alert.level
                  );

                return (
                  <div
                    key={alert.id}
                    className={`rounded-2xl border p-5 transition ${
                      styles.wrapper
                    } ${
                      alert.is_read
                        ? "opacity-70"
                        : "ring-1 ring-white/[0.02]"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${styles.icon}`}
                        >
                          {alertIcon(
                            alert.level
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`font-bold ${styles.title}`}
                            >
                              {alert.title}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${styles.badge}`}
                            >
                              {alertLabel(
                                alert.level
                              )}
                            </span>

                            {!alert.is_read && (
                              <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300">
                                NOVÉ
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/projects/${alert.project_id}`
                              )
                            }
                            className="mt-2 text-left text-sm font-semibold text-slate-200 transition hover:text-cyan-400"
                          >
                            {alert.projectName} →
                          </button>

                          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                            {alert.message}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                            <span>
                              Priorita:{" "}
                              <strong className="text-slate-300">
                                {alert.priority}
                              </strong>
                            </span>

                            <span>
                              {formatAlertDate(
                                alert.created_at
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/projects/${alert.project_id}`
                            )
                          }
                          className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
                        >
                          Otevřít projekt
                        </button>

                        {!alert.is_read && (
                          <button
                            type="button"
                            onClick={() =>
                              markAlertAsRead(
                                alert.id
                              )
                            }
                            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                          >
                            ✓ Přečíst
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* MAPA + AI ASSISTANT */}
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="h-[420px] lg:col-span-2">
            <WorldMap
              projects={projects}
              onLocationSelect={(location) => {
                setNewLocation({
                  latitude:
                    location.latitude,
                  longitude:
                    location.longitude,
                });

                setModalOpen(true);
              }}
            />
          </div>

          <div>
            <h3 className="mb-6 text-2xl font-bold">
              AI Assistant
            </h3>

            <div className="space-y-4 rounded-xl bg-slate-800 p-5">
              <p>
                <span className="text-slate-400">
                  Projekt:
                </span>

                <br />

                <span className="font-semibold text-cyan-400">
                  {selectedProject.name}
                </span>
              </p>

              <p>
                <span className="text-slate-400">
                  Latitude:
                </span>

                <br />

                {selectedProject.latitude.toFixed(
                  5
                )}
              </p>

              <p>
                <span className="text-slate-400">
                  Longitude:
                </span>

                <br />

                {selectedProject.longitude.toFixed(
                  5
                )}
              </p>

              <p>
                <span className="text-slate-400">
                  Status:
                </span>

                <br />

                <span className="font-semibold text-green-400">
                  {selectedProject.status}
                </span>
              </p>

              <div className="border-t border-slate-700 pt-4">
                <p className="mb-2 text-sm text-slate-400">
                  Uložené projekty
                </p>

                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {projects.length === 0 && (
                    <p className="text-sm text-slate-500">
                      Zatím žádné projekty.
                    </p>
                  )}

                  {projects.map(
                    (project) => (
                      <button
                        type="button"
                        key={project.id}
                        onClick={() =>
                          project.id &&
                          router.push(
                            `/projects/${project.id}`
                          )
                        }
                        className="w-full rounded-lg bg-slate-700 p-3 text-left transition hover:bg-slate-600"
                      >
                        <div className="font-medium text-cyan-400">
                          {project.name}
                        </div>

                        <div className="text-xs text-slate-400">
                          {project.latitude.toFixed(
                            4
                          )}
                          {", "}
                          {project.longitude.toFixed(
                            4
                          )}
                        </div>

                        <div className="text-xs text-green-400">
                          {project.status}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NOVÝ PROJEKT */}
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
                    ...project,
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

            setSelectedProject(project);
            setModalOpen(false);
          }}
        />
      </section>
    </main>
  );
}