"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Map, {
  Marker,
  NavigationControl,
  ScaleControl,
  type MapRef,
} from "react-map-gl/maplibre";

import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Project = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
};

const satelliteStyle = {
  version: 8 as const,

  sources: {
    satellite: {
      type: "raster" as const,
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution:
        "© Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    },
  },

  layers: [
    {
      id: "satellite",
      type: "raster" as const,
      source: "satellite",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

export default function MapPage() {
  const router = useRouter();
  const mapRef = useRef<MapRef | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    maplibregl.setWorkerUrl(
      "/maplibre/maplibre-gl-worker.mjs"
    );
  }, []);

  useEffect(() => {
    async function loadProjects() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("active_organization_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          "CHYBA NAČTENÍ AKTIVNÍ ORGANIZACE PRO MAPU:",
          profileError
        );
        setProjects([]);
        setLoading(false);
        return;
      }

      const activeOrganizationId =
        profile?.active_organization_id ?? null;

      if (!activeOrganizationId) {
        console.error(
          "CHYBA: Uživatel nemá nastavenou aktivní organizaci."
        );
        setProjects([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("id, name, latitude, longitude, status")
        .eq("organization_id", activeOrganizationId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("CHYBA NAČTENÍ PROJEKTŮ PRO MAPU:", error);
        setProjects([]);
        setLoading(false);
        return;
      }

      const validProjects = (data ?? [])
        .map((project) => ({
          id: Number(project.id),
          name: String(project.name ?? "Projekt"),
          latitude: Number(project.latitude),
          longitude: Number(project.longitude),
          status: String(project.status ?? "Monitoring"),
        }))
        .filter(
          (project) =>
            Number.isFinite(project.latitude) &&
            Number.isFinite(project.longitude)
        );

      setProjects(validProjects);
      setLoading(false);
    }

    loadProjects();
  }, [router]);

  useEffect(() => {
    if (!mapRef.current || projects.length === 0) {
      return;
    }

    if (projects.length === 1) {
      mapRef.current.flyTo({
        center: [
          projects[0].longitude,
          projects[0].latitude,
        ],
        zoom: 15,
        duration: 1000,
      });

      return;
    }

    const longitudes = projects.map((project) => project.longitude);
    const latitudes = projects.map((project) => project.latitude);

    const minLongitude = Math.min(...longitudes);
    const maxLongitude = Math.max(...longitudes);
    const minLatitude = Math.min(...latitudes);
    const maxLatitude = Math.max(...latitudes);

    mapRef.current.fitBounds(
      [
        [minLongitude, minLatitude],
        [maxLongitude, maxLatitude],
      ],
      {
        padding: 100,
        maxZoom: 15,
        duration: 800,
      }
    );
  }, [projects]);

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
            {[
              ["📊", "Dashboard", "Přehled systému", "/dashboard"],
              ["🧠", "AI Analýza", "Analýza dat", "/ai"],
              ["🗺️", "Mapa", "Lokality projektů", "/map"],
              ["📁", "Projekty", "Správa projektů", "/projects"],
              ["📄", "Reporty", "Výsledky analýz", "/reports"],
              ["⚙️", "Nastavení", "Nastavení platformy", "/settings"],
            ].map(([icon, title, subtitle, href]) => {
              const active = href === "/map";

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
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.035] text-sm">
                    {icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold">{title}</div>
                    <div className="mt-0.5 text-[9px] text-slate-600">
                      {subtitle}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/[0.06] p-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
                Field Operations Map
              </div>
              <p className="mt-2 text-[10px] leading-5 text-slate-600">
                Satelitní přehled lokalit pozemků aktivní organizace.
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex flex-1 flex-col">
          {/* TOP BAR */}
          <header className="border-b border-white/[0.06] bg-[#070c11]/95">
            <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-600">
                  Agronomic Operations Center
                </div>
                <div className="mt-0.5 text-sm font-bold text-slate-300">
                  Field Operations Map
                </div>
              </div>

              <div className="hidden text-right sm:block">
                <div className="max-w-[280px] truncate text-[11px] font-semibold text-slate-400">
                  {user?.email ?? ""}
                </div>
                <div className="mt-0.5 text-[9px] text-slate-700">
                  Aktivní organizace
                </div>
              </div>
            </div>
          </header>

          <main className="flex min-h-0 flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            {/* MOBILE NAV */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {[
                ["📊", "Dashboard", "/dashboard"],
                ["🧠", "AI Analýza", "/ai"],
                ["🗺️", "Mapa", "/map"],
                ["📁", "Projekty", "/projects"],
                ["📄", "Reporty", "/reports"],
                ["⚙️", "Nastavení", "/settings"],
              ].map(([icon, title, href]) => {
                const active = href === "/map";

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`shrink-0 rounded-lg border px-3 py-2 text-[10px] font-bold ${
                      active
                        ? "border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-200"
                        : "border-white/[0.06] bg-white/[0.02] text-slate-500"
                    }`}
                  >
                    {icon} {title}
                  </Link>
                );
              })}
            </div>

            {/* MAP HEADER */}
            <section className="mb-4 flex flex-col justify-between gap-4 rounded-[22px] border border-white/[0.07] bg-[#0a1016] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
                  Field Operations Map
                </div>
                <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">
                  Satelitní mapa pozemků
                </h1>
                <p className="mt-1 text-[10px] leading-5 text-slate-600">
                  Přehled lokalit aktivní organizace. Kliknutím na marker otevřete Field Health Record.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-white/[0.07] bg-[#071017] px-4 py-2.5">
                  <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-700">
                    Pozemky
                  </div>
                  <div className="mt-0.5 text-xl font-black text-cyan-300">
                    {loading ? "…" : projects.length}
                  </div>
                </div>

                <Link
                  href="/projects"
                  className="rounded-xl border border-white/[0.07] px-4 py-3 text-[10px] font-bold text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-200"
                >
                  Field Portfolio →
                </Link>
              </div>
            </section>

            {loading ? (
              <div className="flex min-h-[620px] flex-1 items-center justify-center rounded-[24px] border border-white/[0.07] bg-[#0a1016]">
                <div className="flex flex-col items-center gap-3 text-slate-600">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/[0.08] border-t-cyan-300" />
                  <span className="text-[10px]">Načítám lokality pozemků…</span>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex min-h-[620px] flex-1 items-center justify-center rounded-[24px] border border-dashed border-white/[0.09] bg-[#0a1016] px-6 text-center">
                <div>
                  <div className="text-4xl">◎</div>
                  <h2 className="mt-4 text-lg font-black text-slate-200">
                    Aktivní organizace zatím nemá žádný pozemek
                  </h2>
                  <p className="mt-2 text-[10px] text-slate-600">
                    Vytvořte projekt a jeho lokalita se zobrazí na operační mapě.
                  </p>
                  <Link
                    href="/dashboard?newProject=1"
                    className="mt-5 inline-flex rounded-xl bg-cyan-300 px-5 py-3 text-[10px] font-black text-[#061015]"
                  >
                    + Vytvořit projekt
                  </Link>
                </div>
              </div>
            ) : (
              <section className="relative min-h-[620px] flex-1 overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#071017] shadow-2xl shadow-black/20">
                <Map
                  ref={mapRef}
                  initialViewState={{
                    latitude: projects[0]?.latitude ?? 49.11,
                    longitude: projects[0]?.longitude ?? 17.47,
                    zoom: 10,
                    pitch: 0,
                    bearing: 0,
                  }}
                  mapStyle={satelliteStyle}
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "620px",
                  }}
                >
                  <NavigationControl
                    position="top-right"
                    showCompass
                    showZoom
                  />

                  <ScaleControl
                    position="bottom-left"
                    unit="metric"
                  />

                  {projects.map((project) => (
                    <Marker
                      key={project.id}
                      longitude={project.longitude}
                      latitude={project.latitude}
                      anchor="bottom"
                    >
                      <Link
                        href={`/projects/${project.id}`}
                        className="group block"
                        title={`Otevřít projekt ${project.name}`}
                      >
                        <div className="relative flex flex-col items-center">
                          <div className="pointer-events-none mb-2 hidden min-w-[150px] rounded-xl border border-white/[0.10] bg-[#071017]/95 px-3 py-2.5 shadow-2xl backdrop-blur group-hover:block">
                            <div className="whitespace-nowrap text-[11px] font-black text-white">
                              {project.name}
                            </div>
                            <div className="mt-1 text-[8px] text-slate-500">
                              {project.latitude.toFixed(5)}, {project.longitude.toFixed(5)}
                            </div>
                            <div className="mt-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-cyan-300">
                              {project.status}
                            </div>
                          </div>

                          <div className="relative flex h-10 w-10 items-center justify-center transition group-hover:scale-110">
                            <div className="absolute h-9 w-9 rounded-full border border-cyan-200/25 bg-cyan-300/10 shadow-lg shadow-black/40" />
                            <div className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/90 bg-cyan-300 shadow-lg shadow-cyan-300/20">
                              <div className="h-2 w-2 rounded-full bg-[#061015]" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Marker>
                  ))}
                </Map>

                <div className="pointer-events-none absolute left-4 top-4 max-w-[270px] rounded-2xl border border-white/[0.09] bg-[#071017]/90 px-4 py-3 shadow-2xl backdrop-blur-md">
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-300">
                    AEGRIS / Satellite
                  </div>
                  <div className="mt-1 text-[11px] font-black text-white">
                    Lokality pozemků
                  </div>
                  <div className="mt-1 text-[9px] leading-4 text-slate-500">
                    Markery označují evidované lokality projektů. Nevyjadřují aktuální agronomickou prioritu.
                  </div>
                </div>

                <div className="pointer-events-none absolute bottom-4 right-4 hidden rounded-xl border border-white/[0.08] bg-[#071017]/85 px-3 py-2 text-[8px] text-slate-500 backdrop-blur sm:block">
                  Satelitní podklad · Esri World Imagery
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
