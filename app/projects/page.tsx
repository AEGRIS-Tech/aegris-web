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
  crop_name?: string | null;
  crop_variety?: string | null;
  area_ha?: number | null;
  growth_stage?: string | null;
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

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [activeOrganizationId, setActiveOrganizationId] =
    useState<string | null>(null);
  const [organizationRole, setOrganizationRole] =
    useState<string | null>(null);
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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("active_organization_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("CHYBA NAČTENÍ AKTIVNÍ ORGANIZACE:", profileError);
        setLoading(false);
        return;
      }

      const organizationId = profile?.active_organization_id ?? null;

      if (!organizationId) {
        console.error("CHYBA: Uživatel nemá nastavenou aktivní organizaci.");
        setLoading(false);
        return;
      }

      const { data: membership, error: membershipError } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", organizationId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (membershipError || !membership) {
        console.error("CHYBA NAČTENÍ ROLE V ORGANIZACI:", membershipError);
        setLoading(false);
        return;
      }

      setActiveOrganizationId(organizationId);
      setOrganizationRole(membership.role);
      await loadProjects(organizationId);
      setLoading(false);
    }

    init();
  }, [router]);

  async function loadProjects(organizationId: string) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("organization_id", organizationId)
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

    if (
      organizationRole !== "owner" &&
      organizationRole !== "admin"
    ) {
      console.error("CHYBA: Nedostatečné oprávnění ke smazání projektu.");
      return;
    }

    const { data: deletedProject, error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("CHYBA MAZÁNÍ PROJEKTU:", error);
      return;
    }

    if (!deletedProject) {
      console.error("CHYBA: Projekt nebyl smazán nebo k němu není oprávnění.");
      return;
    }

    if (activeOrganizationId) {
      await loadProjects(activeOrganizationId);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("cs-CZ");
  }

  return (
    <div className="min-h-screen bg-[#05090d] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        {/* OPERATIONS SIDEBAR */}
        <aside className="hidden w-[248px] shrink-0 border-r border-white/[0.06] bg-[#070c11] lg:flex lg:flex-col">
          <div className="border-b border-white/[0.06] px-6 py-6">
            <Link href="/dashboard" className="block">
              <div className="text-2xl font-black tracking-[-0.04em] text-cyan-300">
                AEGRIS
              </div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-slate-600">
                Agriculture Intelligence
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1.5 px-3 py-5">
            {navigation.map((item) => {
              const active = item.href === "/projects";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                    active
                      ? "bg-cyan-300/[0.08] text-cyan-200"
                      : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200"
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.035] text-sm">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold">{item.title}</div>
                    <div className="mt-0.5 text-[9px] text-slate-600">
                      {item.subtitle}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/[0.06] p-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
                Field Portfolio
              </div>
              <p className="mt-2 text-[10px] leading-5 text-slate-600">
                Přehled pozemků aktivní organizace a vstup do jejich Field Health Record.
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* TOP BAR */}
          <header className="border-b border-white/[0.06] bg-[#070c11]/95">
            <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-600">
                  Agronomic Operations Center
                </div>
                <div className="mt-0.5 text-sm font-bold text-slate-300">
                  Field Portfolio
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <div className="max-w-[260px] truncate text-[11px] font-semibold text-slate-400">
                    {user?.email ?? ""}
                  </div>
                  <div className="mt-0.5 text-[9px] text-slate-700">
                    {organizationRole ? `Role: ${organizationRole}` : "Aktivní organizace"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/login");
                  }}
                  className="rounded-lg border border-white/[0.07] px-3 py-2 text-[10px] font-bold text-slate-500 transition hover:border-red-400/25 hover:text-red-300"
                >
                  Odhlásit
                </button>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* MOBILE NAV */}
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navigation.map((item) => {
                const active = item.href === "/projects";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`shrink-0 rounded-lg border px-3 py-2 text-[10px] font-bold ${
                      active
                        ? "border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-200"
                        : "border-white/[0.06] bg-white/[0.02] text-slate-500"
                    }`}
                  >
                    {item.icon} {item.title}
                  </Link>
                );
              })}
            </div>

            {/* PORTFOLIO HERO */}
            <section className="rounded-[24px] border border-white/[0.07] bg-[#0a1016] p-5 shadow-2xl shadow-black/10 sm:p-6">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
                    Field Portfolio
                  </div>
                  <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                    Pozemky a projekty
                  </h1>
                  <p className="mt-2 max-w-2xl text-[11px] leading-5 text-slate-500">
                    Operační seznam všech pozemků aktivní organizace. Otevřením pozemku přejdete
                    přímo do jeho Field Health Record.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-white/[0.07] bg-[#071017] px-4 py-3 text-right">
                    <div className="text-[9px] uppercase tracking-[0.16em] text-slate-600">
                      Celkem pozemků
                    </div>
                    <div className="mt-1 text-2xl font-black text-cyan-300">
                      {projects.length}
                    </div>
                  </div>

                  {organizationRole !== "viewer" && (
                    <Link
                      href="/dashboard?newProject=1"
                      className="inline-flex min-h-[54px] items-center justify-center rounded-xl bg-cyan-300 px-5 text-[11px] font-black text-[#061015] transition hover:bg-cyan-200"
                    >
                      + Nový projekt
                    </Link>
                  )}
                </div>
              </div>
            </section>

            {/* PROJECT LIST */}
            <section className="mt-4 overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#0a1016]">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-600">
                    Portfolio organizace
                  </div>
                  <h2 className="mt-1 text-sm font-black text-slate-200">
                    Aktivní pozemky
                  </h2>
                </div>
                <div className="text-[9px] text-slate-600">
                  Řazeno od nejnovějšího
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-slate-600">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/[0.08] border-t-cyan-300" />
                    <span className="text-[10px]">Načítám portfolio…</span>
                  </div>
                </div>
              ) : projects.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <div className="text-3xl">◎</div>
                  <h3 className="mt-4 text-lg font-black text-slate-200">
                    Aktivní organizace zatím nemá žádný pozemek
                  </h3>
                  <p className="mt-2 text-[11px] text-slate-600">
                    Vytvořte první projekt a začněte s monitoringem.
                  </p>
                  {organizationRole !== "viewer" && (
                    <Link
                      href="/dashboard?newProject=1"
                      className="mt-5 inline-flex rounded-xl bg-cyan-300 px-5 py-3 text-[11px] font-black text-[#061015]"
                    >
                      + Vytvořit projekt
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  {/* DESKTOP TABLE */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-[minmax(230px,1.5fr)_minmax(150px,1fr)_120px_150px_220px] gap-4 border-b border-white/[0.05] bg-white/[0.015] px-6 py-3 text-[8px] font-black uppercase tracking-[0.16em] text-slate-700">
                      <div>Pozemek</div>
                      <div>Plodina / fáze</div>
                      <div>Výměra</div>
                      <div>Stav</div>
                      <div className="text-right">Akce</div>
                    </div>

                    {projects.map((project) => (
                      <article
                        key={project.id}
                        className="grid grid-cols-[minmax(230px,1.5fr)_minmax(150px,1fr)_120px_150px_220px] items-center gap-4 border-b border-white/[0.05] px-6 py-4 transition last:border-b-0 hover:bg-white/[0.018]"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/projects/${project.id}`}
                            className="truncate text-[13px] font-black text-slate-100 transition hover:text-cyan-200"
                          >
                            {project.name}
                          </Link>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-650">
                            <span className="text-slate-600">
                              {project.latitude.toFixed(3)}, {project.longitude.toFixed(3)}
                            </span>
                            <span className="text-slate-700">•</span>
                            <span className="text-slate-600">
                              založeno {formatDate(project.created_at)}
                            </span>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-[11px] font-bold text-slate-300">
                            {project.crop_name ?? "Plodina neuvedena"}
                          </div>
                          <div className="mt-1 truncate text-[9px] text-slate-600">
                            {project.crop_variety
                              ? `${project.crop_variety}${project.growth_stage ? ` · ${project.growth_stage}` : ""}`
                              : project.growth_stage ?? "Fáze neuvedena"}
                          </div>
                        </div>

                        <div>
                          <div className="text-[12px] font-black text-slate-300">
                            {project.area_ha != null ? `${project.area_ha} ha` : "—"}
                          </div>
                        </div>

                        <div>
                          <span className="inline-flex rounded-lg border border-emerald-400/15 bg-emerald-400/[0.05] px-2.5 py-1.5 text-[9px] font-black text-emerald-300">
                            {project.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          {(organizationRole === "owner" ||
                            organizationRole === "admin") && (
                            <button
                              type="button"
                              onClick={() => deleteProject(project.id)}
                              className="rounded-lg border border-white/[0.06] px-3 py-2 text-[9px] font-bold text-slate-600 transition hover:border-red-400/25 hover:text-red-300"
                            >
                              Smazat
                            </button>
                          )}

                          {organizationRole !== "viewer" && (
                            <Link
                              href={`/projects/${project.id}/edit`}
                              className="rounded-lg border border-white/[0.07] px-3 py-2 text-[9px] font-bold text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-200"
                            >
                              Upravit
                            </Link>
                          )}

                          <Link
                            href={`/projects/${project.id}`}
                            className="rounded-lg bg-cyan-300 px-3.5 py-2 text-[9px] font-black text-[#061015] transition hover:bg-cyan-200"
                          >
                            Otevřít →
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* MOBILE CARDS */}
                  <div className="divide-y divide-white/[0.05] md:hidden">
                    {projects.map((project) => (
                      <article key={project.id} className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-300">
                              Pozemek
                            </div>
                            <h3 className="mt-1 truncate text-lg font-black text-white">
                              {project.name}
                            </h3>
                            <div className="mt-1 text-[9px] text-slate-600">
                              {project.latitude.toFixed(3)}, {project.longitude.toFixed(3)}
                            </div>
                          </div>
                          <span className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.05] px-2 py-1 text-[8px] font-black text-emerald-300">
                            {project.status}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="rounded-xl border border-white/[0.06] bg-[#071017] p-3">
                            <div className="text-[8px] uppercase tracking-wider text-slate-700">
                              Plodina
                            </div>
                            <div className="mt-1 text-[10px] font-bold text-slate-300">
                              {project.crop_name ?? "—"}
                            </div>
                          </div>
                          <div className="rounded-xl border border-white/[0.06] bg-[#071017] p-3">
                            <div className="text-[8px] uppercase tracking-wider text-slate-700">
                              Výměra
                            </div>
                            <div className="mt-1 text-[10px] font-bold text-slate-300">
                              {project.area_ha != null ? `${project.area_ha} ha` : "—"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link
                            href={`/projects/${project.id}`}
                            className="flex-1 rounded-lg bg-cyan-300 px-3 py-2.5 text-center text-[10px] font-black text-[#061015]"
                          >
                            Otevřít Field Health Record
                          </Link>
                          {organizationRole !== "viewer" && (
                            <Link
                              href={`/projects/${project.id}/edit`}
                              className="rounded-lg border border-white/[0.07] px-3 py-2.5 text-[9px] font-bold text-slate-400"
                            >
                              Upravit
                            </Link>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>

            <div className="mt-4 text-center text-[9px] leading-5 text-slate-700">
              Field Portfolio zobrazuje autoritativní projektová data aktivní organizace.
              Analytický stav, priority a Ground Truth jsou dostupné uvnitř Field Health Record.
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
