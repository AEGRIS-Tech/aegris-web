"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import BackButton from "../components/BackButton";

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
    <main className="min-h-screen bg-[#020617] text-white">
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
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1380px] px-6 py-7">
        <div className="mb-7">
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            AEGRIS / MAPA
          </div>

          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
                <BackButton />
                
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                Mapa projektů
              </h1>

              <p className="mt-2 text-slate-500">
                Přehled lokalit projektů aktivní organizace.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-slate-600">
                Projekty organizace
              </div>

              <div className="mt-1 text-2xl font-black text-cyan-400">
                {loading ? "…" : projects.length}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-[650px] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60">
            <div className="text-slate-500">
              Načítám projekty…
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-12 text-center">
            <div className="text-5xl">🗺️</div>

            <h2 className="mt-4 text-xl font-bold">
              Aktivní organizace zatím nemá žádný projekt
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Vytvořte projekt a jeho lokalita se zobrazí zde na mapě.
            </p>

            <Link
              href="/dashboard?newProject=1"
              className="mt-6 inline-flex rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              + Vytvořit projekt
            </Link>
          </div>
        ) : (
          <div className="relative h-[650px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
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
                      <div className="mb-1 hidden rounded-lg border border-slate-700 bg-slate-950/95 px-3 py-2 shadow-xl group-hover:block">
                        <div className="whitespace-nowrap text-sm font-bold text-white">
                          {project.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {project.latitude.toFixed(5)},{" "}
                          {project.longitude.toFixed(5)}
                        </div>

                        <div className="mt-1 text-xs font-semibold text-cyan-400">
                          {project.status}
                        </div>
                      </div>

                      <div className="relative flex h-10 w-10 items-center justify-center">
                        <div className="absolute h-10 w-10 animate-ping rounded-full bg-cyan-400/25" />

                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-cyan-500 shadow-xl shadow-cyan-500/50 transition group-hover:scale-110">
                          <div className="h-2.5 w-2.5 rounded-full bg-white" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </Marker>
              ))}
            </Map>

            <div className="absolute left-4 top-4 max-w-xs rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 shadow-2xl backdrop-blur">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
                AEGRIS
              </div>

              <div className="mt-1 font-bold text-white">
                Lokality projektů
              </div>

              <div className="mt-1 text-xs text-slate-500">
                Kliknutím na marker otevřete detail projektu.
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}