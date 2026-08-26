"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Map, {
  Marker,
  NavigationControl,
  ScaleControl,
  Source,
  Layer,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { supabase } from "@/lib/supabase";

type Coordinate = [number, number];

type BoundaryPoint = {
  latitude: number;
  longitude: number;
};

type Project = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  boundary: unknown;
};

function parseBoundary(value: unknown): Coordinate[] {
  if (!value) return [];

  try {
    const parsed =
      typeof value === "string"
        ? JSON.parse(value)
        : value;

    // GeoJSON Polygon
    if (
      parsed &&
      typeof parsed === "object" &&
      "type" in parsed &&
      parsed.type === "Polygon" &&
      "coordinates" in parsed &&
      Array.isArray(parsed.coordinates) &&
      Array.isArray(parsed.coordinates[0])
    ) {
      return parsed.coordinates[0]
        .filter(
          (point: unknown) =>
            Array.isArray(point) &&
            point.length >= 2 &&
            typeof point[0] === "number" &&
            typeof point[1] === "number"
        )
        .map(
          (point: number[]) =>
            [point[0], point[1]] as Coordinate
        );
    }

    // Původní formát z NewProjectModal:
    // [{ latitude, longitude }, ...]
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (point: unknown) =>
          point !== null &&
          typeof point === "object" &&
          "latitude" in point &&
          "longitude" in point &&
          typeof point.latitude === "number" &&
          typeof point.longitude === "number"
      )
    ) {
      return parsed.map(
        (point: BoundaryPoint) =>
          [point.longitude, point.latitude] as Coordinate
      );
    }

    // Alternativní formát: [[longitude, latitude], ...]
    if (Array.isArray(parsed)) {
      return parsed
        .filter(
          (point: unknown) =>
            Array.isArray(point) &&
            point.length >= 2 &&
            typeof point[0] === "number" &&
            typeof point[1] === "number"
        )
        .map(
          (point: number[]) =>
            [point[0], point[1]] as Coordinate
        );
    }
  } catch (error) {
    console.error(
      "CHYBA ČTENÍ HRANICE:",
      error
    );
  }

  return [];
}

function calculateAreaHectares(
  coordinates: Coordinate[]
): number {
  if (coordinates.length < 3) {
    return 0;
  }

  const earthRadius = 6378137;

  const averageLatitude =
    coordinates.reduce(
      (sum, [, latitude]) =>
        sum + latitude,
      0
    ) / coordinates.length;

  const latitudeFactor =
    Math.cos(
      averageLatitude *
        (Math.PI / 180)
    );

  const projected = coordinates.map(
    ([longitude, latitude]) => {
      const longitudeRadians =
        longitude * (Math.PI / 180);

      const latitudeRadians =
        latitude * (Math.PI / 180);

      return [
        earthRadius *
          longitudeRadians *
          latitudeFactor,

        earthRadius *
          latitudeRadians,
      ];
    }
  );

  let area = 0;

  for (
    let index = 0;
    index < projected.length;
    index++
  ) {
    const current =
      projected[index];

    const next =
      projected[
        (index + 1) %
          projected.length
      ];

    area +=
      current[0] * next[1] -
      next[0] * current[1];
  }

  return (
    Math.abs(area) /
    2 /
    10000
  );
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();

  const [project, setProject] =
    useState<Project | null>(null);

  const [name, setName] =
    useState("");

  const [boundary, setBoundary] =
    useState<Coordinate[]>([]);

  const [editingBoundary, setEditingBoundary] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    maplibregl.setWorkerUrl(
      "/maplibre/maplibre-gl-worker.mjs"
    );
  }, []);

  useEffect(() => {
    async function loadProject() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const projectId =
        Number(params.id);

      const { data, error } =
        await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .eq("user_id", user.id)
          .single();

      if (error || !data) {
        console.error(
          "CHYBA NAČTENÍ PROJEKTU:",
          error
        );

        router.push("/projects");
        return;
      }

      setProject(data as Project);
      setName(data.name);

      const loadedBoundary =
        parseBoundary(
          data.boundary
        );

      setBoundary(
        loadedBoundary
      );

      setLoading(false);
    }

    loadProject();
  }, [params.id, router]);

  function handleMapClick(
    event: MapLayerMouseEvent
  ) {
    if (!editingBoundary) {
      return;
    }

    const newPoint: Coordinate = [
      event.lngLat.lng,
      event.lngLat.lat,
    ];

    setBoundary(
      (current) => [
        ...current,
        newPoint,
      ]
    );
  }

  function updateBoundaryPoint(
    index: number,
    longitude: number,
    latitude: number
  ) {
    setBoundary(
      (current) =>
        current.map(
          (
            point,
            pointIndex
          ) =>
            pointIndex === index
              ? [
                  longitude,
                  latitude,
                ]
              : point
        )
    );
  }

  function removeBoundaryPoint(
    index: number
  ) {
    setBoundary(
      (current) =>
        current.filter(
          (
            _,
            pointIndex
          ) =>
            pointIndex !==
            index
        )
    );
  }

  function clearBoundary() {
    setBoundary([]);
  }

  const areaHectares =
    useMemo(
      () =>
        calculateAreaHectares(
          boundary
        ),
      [boundary]
    );

  async function saveProject() {
    if (!project) {
      return;
    }

    if (!name.trim()) {
      setMessage(
        "Název projektu nesmí být prázdný."
      );

      return;
    }

    if (
      boundary.length > 0 &&
      boundary.length < 3
    ) {
      setMessage(
        "Hranice oblasti musí obsahovat alespoň 3 body."
      );

      return;
    }

    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    /*
     * Důležité:
     * Ukládáme boundary ve stejném formátu,
     * který používá nový projekt:
     *
     * [
     *   {
     *     latitude: ...,
     *     longitude: ...
     *   }
     * ]
     */
    const normalizedBoundary =
      boundary.length >= 3
        ? boundary.map(
            ([
              longitude,
              latitude,
            ]) => ({
              latitude,
              longitude,
            })
          )
        : null;

    const { error } =
      await supabase
        .from("projects")
        .update({
          name: name.trim(),
          boundary:
            normalizedBoundary,
        })
        .eq(
          "id",
          project.id
        )
        .eq(
          "user_id",
          user.id
        );

    if (error) {
      console.error(
        "CHYBA ULOŽENÍ PROJEKTU:",
        error
      );

      setMessage(
        "Projekt se nepodařilo uložit."
      );

      setSaving(false);
      return;
    }

    router.push(
      `/projects/${project.id}`
    );
  }

  const polygonCoordinates =
    boundary.length >= 3
      ? [
          [
            ...boundary,
            boundary[0],
          ],
        ]
      : [];

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <main className="mx-auto max-w-[900px] px-6 py-10">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-slate-500">
            Načítám projekt...
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <main className="mx-auto max-w-[1000px] px-6 py-10">

        <Link
          href={`/projects/${project.id}`}
          className="inline-flex rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-400"
        >
          ← Zpět
        </Link>

        <div className="mt-8">

          <div className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            AEGRIS / ÚPRAVA PROJEKTU
          </div>

          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
            Upravit projekt
          </h1>

          <p className="mt-2 text-slate-500">
            Upravte základní informace a hranici sledované oblasti.
          </p>

        </div>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">

          <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
            ZÁKLADNÍ INFORMACE
          </div>

          <h2 className="mt-2 text-xl font-bold">
            Informace o projektu
          </h2>

          <div className="mt-6">

            <label className="block text-sm font-semibold text-slate-300">
              Název projektu
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              placeholder="Název projektu"
            />

          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">

              <div className="text-xs uppercase tracking-wider text-slate-600">
                Latitude
              </div>

              <div className="mt-2 font-bold text-slate-200">
                {project.latitude.toFixed(
                  5
                )}
              </div>

            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">

              <div className="text-xs uppercase tracking-wider text-slate-600">
                Longitude
              </div>

              <div className="mt-2 font-bold text-slate-200">
                {project.longitude.toFixed(
                  5
                )}
              </div>

            </div>

          </div>

          <div className="mt-6">

            <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-5">

              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>

                  <div className="text-sm font-bold text-cyan-400">
                    Hranice sledované oblasti
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Upravte hranici pole přímo na satelitní mapě.
                    Kliknutím přidáte bod a existující body můžete
                    přetáhnout myší.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditingBoundary(
                      (current) =>
                        !current
                    )
                  }
                  className="shrink-0 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-400 transition hover:bg-cyan-400/20"
                >
                  {editingBoundary
                    ? "Dokončit úpravu"
                    : "Upravit hranici"}
                </button>

              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">

                  <div className="text-xs uppercase tracking-wider text-slate-600">
                    Výměra sledované oblasti
                  </div>

                  <div className="mt-2 text-3xl font-black text-cyan-400">
                    {areaHectares.toFixed(
                      2
                    )}{" "}
                    ha
                  </div>

                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">

                  <div className="text-xs uppercase tracking-wider text-slate-600">
                    Hranice
                  </div>

                  <div className="mt-2 font-bold text-slate-200">
                    {boundary.length} bodů
                  </div>

                </div>

              </div>

              {editingBoundary && (
                <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.04] px-4 py-3 text-sm text-yellow-300">
                  Režim úprav je aktivní. Kliknutím do mapy
                  přidáte nový bod hranice. Body můžete přetahovat.
                  Výměra se automaticky přepočítává.
                </div>
              )}

            </div>

            <div className="relative mt-4 h-[500px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">

              <Map
                initialViewState={{
                  latitude:
                    project.latitude,
                  longitude:
                    project.longitude,
                  zoom: 16,
                  pitch: 0,
                  bearing: 0,
                }}
                mapStyle={
                  satelliteStyle
                }
                onClick={
                  handleMapClick
                }
                cursor={
                  editingBoundary
                    ? "crosshair"
                    : "grab"
                }
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

                <Marker
                  longitude={
                    project.longitude
                  }
                  latitude={
                    project.latitude
                  }
                  anchor="center"
                >

                  <div className="relative flex h-10 w-10 items-center justify-center">

                    <div className="absolute h-10 w-10 animate-ping rounded-full bg-cyan-400/30" />

                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-cyan-500 shadow-xl shadow-cyan-500/50">

                      <div className="h-2.5 w-2.5 rounded-full bg-white" />

                    </div>

                  </div>

                </Marker>

                {polygonCoordinates.length > 0 && (
                  <Source
                    id="project-boundary"
                    type="geojson"
                    data={{
                      type: "Feature",
                      properties: {},
                      geometry: {
                        type: "Polygon",
                        coordinates:
                          polygonCoordinates,
                      },
                    }}
                  >

                    <Layer
                      id="project-boundary-fill"
                      type="fill"
                      paint={{
                        "fill-color":
                          "#22d3ee",
                        "fill-opacity":
                          0.18,
                      }}
                    />

                    <Layer
                      id="project-boundary-line"
                      type="line"
                      paint={{
                        "line-color":
                          "#22d3ee",
                        "line-width": 3,
                      }}
                    />

                  </Source>
                )}

                {boundary.map(
                  (
                    point,
                    index
                  ) => (
                    <Marker
                      key={`${index}-${point[0]}-${point[1]}`}
                      longitude={
                        point[0]
                      }
                      latitude={
                        point[1]
                      }
                      anchor="center"
                      draggable={
                        editingBoundary
                      }
                      onDragEnd={(
                        event
                      ) => {
                        updateBoundaryPoint(
                          index,
                          event
                            .lngLat
                            .lng,
                          event
                            .lngLat
                            .lat
                        );
                      }}
                    >

                      <button
                        type="button"
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          if (
                            editingBoundary
                          ) {
                            removeBoundaryPoint(
                              index
                            );
                          }
                        }}
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-cyan-500 text-[10px] font-black text-slate-950 shadow-lg ${
                          editingBoundary
                            ? "cursor-move"
                            : "cursor-default"
                        }`}
                        title={
                          editingBoundary
                            ? "Přetáhnout nebo kliknutím odstranit"
                            : "Bod hranice"
                        }
                      >
                        {index + 1}
                      </button>

                    </Marker>
                  )
                )}

              </Map>

            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

              <div className="text-sm text-slate-500">

                {boundary.length >= 3
                  ? `Hranice obsahuje ${boundary.length} bodů. Výměra: ${areaHectares.toFixed(2)} ha.`
                  : boundary.length > 0
                    ? `Zatím ${boundary.length} bod${
                        boundary.length ===
                        1
                          ? ""
                          : "y"
                      }. Přidejte alespoň 3.`
                    : "Hranice zatím není nastavena."}

              </div>

              {boundary.length > 0 && (
                <button
                  type="button"
                  onClick={
                    clearBoundary
                  }
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
                >
                  Vymazat hranici
                </button>
              )}

            </div>

          </div>

          {message && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {message}
            </div>
          )}

          <div className="mt-7 flex flex-wrap gap-3 border-t border-slate-800 pt-6">

            <button
              type="button"
              onClick={
                saveProject
              }
              disabled={saving}
              className="rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Ukládám..."
                : "Uložit změny"}
            </button>

            <Link
              href={`/projects/${project.id}`}
              className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-bold text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              Zrušit
            </Link>

          </div>

        </section>
      </main>
    </div>
  );
}