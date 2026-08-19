"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

type Project = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
};

const navigation = [
  {
    href: "/dashboard",
    icon: "📊",
    title: "Dashboard",
    subtitle: "Přehled systému",
  },
  {
    href: "/ai",
    icon: "🧠",
    title: "AI Analýza",
    subtitle: "Analýza dat",
  },
  {
    href: "/map",
    icon: "🗺️",
    title: "Mapa",
    subtitle: "Lokality projektů",
  },
  {
    href: "/projects",
    icon: "📁",
    title: "Projekty",
    subtitle: "Správa projektů",
  },
  {
    href: "/reports",
    icon: "📄",
    title: "Reporty",
    subtitle: "Výsledky analýz",
  },
  {
    href: "/settings",
    icon: "⚙️",
    title: "Nastavení",
    subtitle: "Nastavení platformy",
  },
];

const projectActions = [
  {
    view: "monitoring",
    icon: "📡",
    title: "Monitoring",
    description: "Aktuální stav a monitoring projektu",
  },
  {
    view: "analysis",
    icon: "🧠",
    title: "AI Analýza",
    description: "Spustit a zobrazit analýzy projektu",
  },
  {
    view: "map",
    icon: "🗺️",
    title: "Mapa",
    description: "Zobrazit polohu projektu",
  },
  {
    view: "reports",
    icon: "📄",
    title: "Reporty",
    description: "Výsledky a historie analýz",
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      await loadProjects(user.id);
      setLoading(false);
    }

    init();
  }, [router]);

  async function loadProjects(userId: string) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("CHYBA NAČTENÍ PROJEKTŮ:", error);
      return;
    }

    setProjects((data ?? []) as Project[]);
  }

  async function deleteProject(id: number) {
    const ok = window.confirm(
      "Opravdu chcete tento projekt smazat?"
    );

    if (!ok) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", user?.id);

    if (error) {
      console.error("CHYBA MAZÁNÍ PROJEKTU:", error);
      return;
    }

    if (user) {
      await loadProjects(user.id);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("cs-CZ");
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="border-b border-slate-800/70 bg-[#020617]">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="group">
            <div className="text-2xl font-black tracking-tight text-cyan-400">
              AEGRIS
            </div>

            <div className="text-[10px] tracking-[0.28em] text-slate-600">
              AGRICULTURE INTELLIGENCE
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold text-slate-200">
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
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
            >
              Odhlásit se
            </button>
          </div>
        </div>
      </header>

      {/* ================================================= */}
      {/* MAIN LAYOUT */}
      {/* ================================================= */}

      <div className="mx-auto flex max-w-[1380px] gap-5 px-6 py-7">
        {/* ================================================= */}
        {/* SIDEBAR */}
        {/* ================================================= */}

        <aside className="hidden w-[240px] shrink-0 lg:block">
          <div className="sticky top-6 space-y-3">
            {navigation.map((item) => {
              const active = item.href === "/projects";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl border p-4 transition ${
                    active
                      ? "border-cyan-400/40 bg-cyan-400/[0.08]"
                      : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                        active
                          ? "bg-cyan-400/10"
                          : "bg-slate-800"
                      }`}
                    >
                      {item.icon}
                    </div>

                    <div>
                      <div
                        className={`font-semibold ${
                          active
                            ? "text-cyan-400"
                            : "text-slate-200"
                        }`}
                      >
                        {item.title}
                      </div>

                      <div className="text-xs text-slate-600">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5">
              <div className="text-2xl">🌱</div>

              <div className="mt-3 font-bold text-cyan-400">
                AEGRIS
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Inteligentní monitoring zemědělské půdy.
              </p>

              <div className="mt-5 text-5xl font-black text-slate-900">
                AEGRIS
              </div>
            </div>
          </div>
        </aside>

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <main className="min-w-0 flex-1">
          <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-cyan-400">
                AEGRIS / PROJEKTY
              </div>

              <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
                Projekty
              </h1>

              <p className="mt-2 text-slate-500">
                Správa všech vašich zemědělských projektů.
              </p>
            </div>

            <Link
              href="/dashboard?newProject=1"
              className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              + Nový projekt
            </Link>
          </div>

          {/* ================================================= */}
          {/* MOBILE NAVIGATION */}
          {/* ================================================= */}

          <div className="mb-6 grid grid-cols-2 gap-3 lg:hidden sm:grid-cols-3">
            {navigation.map((item) => {
              const active = item.href === "/projects";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl border p-3 ${
                    active
                      ? "border-cyan-400/40 bg-cyan-400/10"
                      : "border-slate-800 bg-slate-900"
                  }`}
                >
                  <div className="text-lg">{item.icon}</div>

                  <div
                    className={`mt-1 text-sm font-semibold ${
                      active
                        ? "text-cyan-400"
                        : "text-slate-200"
                    }`}
                  >
                    {item.title}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ================================================= */}
          {/* PROJECTS */}
          {/* ================================================= */}

          {loading ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-slate-500">
              Načítám projekty...
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center">
              <div className="text-4xl">📁</div>

              <h2 className="mt-4 text-xl font-bold">
                Zatím nemáte žádný projekt
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Vytvořte první projekt a začněte s monitoringem.
              </p>

              <Link
                href="/dashboard?newProject=1"
                className="mt-6 inline-flex rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950"
              >
                + Vytvořit projekt
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-black/10"
                >
                  {/* PROJECT HEADER */}

                  <div className="border-b border-slate-800 p-6 md:p-7">
                    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
                          Projekt
                        </div>

                        <h2 className="mt-1 text-2xl font-black text-white">
                          {project.name}
                        </h2>

                        <div className="mt-2 text-sm text-slate-500">
                          Vytvořeno {formatDate(project.created_at)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
                          ● {project.status}
                        </span>
                      </div>
                    </div>

                    {/* PROJECT DATA */}

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                        <div className="text-xs uppercase tracking-wider text-slate-600">
                          Latitude
                        </div>

                        <div className="mt-2 text-lg font-bold text-slate-200">
                          {project.latitude.toFixed(5)}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                        <div className="text-xs uppercase tracking-wider text-slate-600">
                          Longitude
                        </div>

                        <div className="mt-2 text-lg font-bold text-slate-200">
                          {project.longitude.toFixed(5)}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 sm:col-span-2 lg:col-span-1">
                        <div className="text-xs uppercase tracking-wider text-slate-600">
                          Lokalita
                        </div>

                        <div className="mt-2 text-sm font-semibold text-cyan-400">
                          {project.latitude.toFixed(3)},{" "}
                          {project.longitude.toFixed(3)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ================================================= */}
                  {/* PROJECT NAVIGATION */}
                  {/* ================================================= */}

                  <div className="p-6 md:p-7">
                    <div className="mb-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
                        Projektová konzole
                      </div>

                      <h3 className="mt-1 text-lg font-bold">
                        Kam chcete pokračovat?
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Vyberte část projektu, kterou chcete otevřít.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {projectActions.map((action) => (
                        <Link
                          key={action.view}
                          href={`/projects/${project.id}?view=${action.view}`}
                          className="group rounded-2xl border border-slate-800 bg-slate-950/40 p-4 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.04]"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-lg transition group-hover:bg-cyan-400/10">
                              {action.icon}
                            </div>

                            <div className="min-w-0">
                              <div className="font-bold text-slate-200 group-hover:text-cyan-400">
                                {action.title}
                              </div>

                              <div className="mt-1 text-xs leading-5 text-slate-600">
                                {action.description}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* ACTIONS */}

                    <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-800 pt-5">
                      <Link
                        href={`/projects/${project.id}`}
                        className="rounded-xl bg-cyan-500 px-5 py-2.5 font-bold text-slate-950 transition hover:bg-cyan-400"
                      >
                        Otevřít projekt
                      </Link>

                      <Link
                        href={`/projects/${project.id}?view=edit`}
                        className="rounded-xl bg-yellow-500 px-5 py-2.5 font-bold text-slate-950 transition hover:bg-yellow-400"
                      >
                        Upravit
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          deleteProject(project.id)
                        }
                        className="rounded-xl bg-red-600 px-5 py-2.5 font-bold text-white transition hover:bg-red-500"
                      >
                        Smazat
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}