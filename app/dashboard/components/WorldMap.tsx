"use client";

import { useEffect, useRef, useState } from "react";

import Map, {
  NavigationControl,
  Marker,
  Source,
  Layer,
  Popup,
  type MapRef,
} from "react-map-gl/maplibre";

import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

if (typeof window !== "undefined") {
  maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");
}

type Project = {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  priority?: string | null;
  score?: number | null;
  unreadAlerts?: number;
};

type BoundaryPoint = {
  latitude: number;
  longitude: number;
};

type WorldMapProps = {
  projects?: Project[];
  onLocationSelect?: (location: Project) => void;
  onMapClick?: (location: {
    latitude: number;
    longitude: number;
  }) => void;
  focusLatitude?: number;
  focusLongitude?: number;
  drawingMode?: boolean;
  onBoundaryChange?: (boundary: BoundaryPoint[]) => void;
  onBoundaryComplete?: (boundary: BoundaryPoint[]) => void;
  compactControls?: boolean;
  selectedProjectId?: number;
};

type Country = {
  name: string;
  iso3: string;
  latitude: number;
  longitude: number;
  zoom: number;
};

const countries: Country[] = [
  { name: "Česko", iso3: "CZE", latitude: 49.8175, longitude: 15.473, zoom: 7 },
  { name: "Slovensko", iso3: "SVK", latitude: 48.669, longitude: 19.699, zoom: 7 },
  { name: "Německo", iso3: "DEU", latitude: 51.1657, longitude: 10.4515, zoom: 6 },
  { name: "Rakousko", iso3: "AUT", latitude: 47.5162, longitude: 14.5501, zoom: 7 },
  { name: "Polsko", iso3: "POL", latitude: 51.9194, longitude: 19.1451, zoom: 6 },
  { name: "Francie", iso3: "FRA", latitude: 46.2276, longitude: 2.2137, zoom: 6 },
  { name: "Itálie", iso3: "ITA", latitude: 41.8719, longitude: 12.5674, zoom: 6 },
  { name: "Španělsko", iso3: "ESP", latitude: 40.4637, longitude: -3.7492, zoom: 6 },
];

const satelliteLayer = {
  id: "aegris-satellite",
  type: "raster" as const,
  paint: {
    "raster-opacity": 0.82,
    "raster-saturation": -0.28,
    "raster-contrast": 0.08,
    "raster-brightness-max": 0.72,
  },
};

const allCountriesBorderLayer = {
  id: "aegris-all-country-borders",
  type: "line" as const,
  layout: {
    "line-join": "round" as const,
    "line-cap": "round" as const,
  },
  paint: {
    "line-color": "#94a3b8",
    "line-width": 1,
    "line-opacity": 0.22,
  },
};

const selectedCountryFillLayer = {
  id: "aegris-selected-country-fill",
  type: "fill" as const,
  paint: {
    "fill-color": "#22d3ee",
    "fill-opacity": 0.035,
    "fill-outline-color": "#22d3ee",
  },
};

const selectedCountryBorderLayer = {
  id: "aegris-selected-country-border",
  type: "line" as const,
  layout: {
    "line-join": "round" as const,
    "line-cap": "round" as const,
  },
  paint: {
    "line-color": "#22d3ee",
    "line-width": 1.5,
    "line-opacity": 0.45,
  },
};

const boundaryFillLayer = {
  id: "aegris-boundary-fill",
  type: "fill" as const,
  paint: {
    "fill-color": "#22d3ee",
    "fill-opacity": 0.22,
  },
};

const boundaryLineLayer = {
  id: "aegris-boundary-line",
  type: "line" as const,
  layout: {
    "line-join": "round" as const,
    "line-cap": "round" as const,
  },
  paint: {
    "line-color": "#22d3ee",
    "line-width": 4,
    "line-opacity": 1,
  },
};

function markerClass(priority?: string | null) {
  if (priority === "Kritická") return "bg-red-400 ring-red-400/25";
  if (priority === "Vysoká") return "bg-orange-400 ring-orange-400/25";
  if (priority === "Střední") return "bg-amber-300 ring-amber-300/25";
  if (priority === "Nízká") return "bg-emerald-400 ring-emerald-400/25";
  return "bg-cyan-300 ring-cyan-300/25";
}

export default function WorldMap({
  projects = [],
  onLocationSelect,
  onMapClick,
  focusLatitude,
  focusLongitude,
  drawingMode = false,
  onBoundaryChange,
  onBoundaryComplete,
  compactControls = false,
  selectedProjectId,
}: WorldMapProps) {
  const mapRef = useRef<MapRef | null>(null);

  const [satellite, setSatellite] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("Česko");
  const [boundary, setBoundary] = useState<BoundaryPoint[]>([]);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);

  const selectedCountryIso3 =
    countries.find((country) => country.name === selectedCountry)?.iso3 ?? "CZE";

  useEffect(() => {
    if (
      !drawingMode ||
      focusLatitude === undefined ||
      focusLongitude === undefined ||
      !Number.isFinite(focusLatitude) ||
      !Number.isFinite(focusLongitude)
    ) {
      return;
    }

    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: [focusLongitude, focusLatitude],
      zoom: 17,
      duration: 1400,
      essential: true,
    });
  }, [drawingMode, focusLatitude, focusLongitude]);

  function selectCountry(countryName: string) {
    const country = countries.find((item) => item.name === countryName);
    if (!country) return;

    setSelectedCountry(country.name);

    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: [country.longitude, country.latitude],
      zoom: country.zoom,
      duration: 1200,
      essential: true,
    });
  }

  function addBoundaryPoint(latitude: number, longitude: number) {
    const nextBoundary = [...boundary, { latitude, longitude }];
    setBoundary(nextBoundary);
    onBoundaryChange?.(nextBoundary);
  }

  function removeLastBoundaryPoint() {
    if (boundary.length === 0) return;

    const nextBoundary = boundary.slice(0, -1);
    setBoundary(nextBoundary);
    onBoundaryChange?.(nextBoundary);
  }

  function clearBoundary() {
    setBoundary([]);
    onBoundaryChange?.([]);
  }

  function completeBoundary() {
    if (boundary.length < 3) {
      alert("Pro dokončení hranice označ alespoň 3 body.");
      return;
    }

    onBoundaryComplete?.(boundary);
  }

  const boundaryGeoJSON = {
    type: "FeatureCollection" as const,
    features:
      boundary.length >= 3
        ? [
            {
              type: "Feature" as const,
              properties: {},
              geometry: {
                type: "Polygon" as const,
                coordinates: [
                  [
                    ...boundary.map((point) => [
                      point.longitude,
                      point.latitude,
                    ]),
                    [boundary[0].longitude, boundary[0].latitude],
                  ],
                ],
              },
            },
          ]
        : [],
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#071017]">
      <div
        className={`absolute z-50 flex flex-wrap gap-2 ${
          compactControls ? "left-4 top-4" : "left-5 top-5"
        }`}
      >
        {!drawingMode && (
          <>
            {!compactControls && (
              <select
                value={selectedCountry}
                onChange={(event) => selectCountry(event.target.value)}
                className="rounded-xl border border-white/10 bg-[#071017]/90 px-4 py-3 text-sm font-bold text-white shadow-2xl outline-none backdrop-blur"
              >
                {countries.map((country) => (
                  <option key={country.iso3} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => setSatellite((value) => !value)}
              className={`border border-white/10 bg-[#071017]/90 font-bold text-slate-300 shadow-2xl backdrop-blur transition hover:border-cyan-300/30 hover:text-cyan-200 ${
                compactControls
                  ? "rounded-lg px-3 py-2 text-[11px]"
                  : "rounded-xl px-4 py-3 text-sm"
              }`}
            >
              {satellite ? "SATELIT" : "MAPA"}
            </button>
          </>
        )}

        {drawingMode && (
          <div className="rounded-xl border border-cyan-400 bg-slate-950/95 px-4 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur">
            📐 Označte hranici pozemku
            <div className="mt-1 text-xs text-slate-400">
              Body: {boundary.length}
            </div>
          </div>
        )}
      </div>

      {!drawingMode && compactControls && (
        <div className="absolute bottom-4 left-4 z-40 flex items-center gap-3 rounded-lg border border-white/10 bg-[#071017]/85 px-3 py-2 text-[10px] font-semibold text-slate-400 backdrop-blur">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Kritická
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-orange-400" />
            Vysoká
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Nízká
          </span>
        </div>
      )}

      {drawingMode && (
        <div className="absolute bottom-5 left-1/2 z-50 flex -translate-x-1/2 gap-2 rounded-2xl border border-slate-700 bg-slate-950/95 p-3 shadow-2xl backdrop-blur">
          <button
            type="button"
            onClick={removeLastBoundaryPoint}
            disabled={boundary.length === 0}
            className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ↶ Zpět
          </button>

          <button
            type="button"
            onClick={clearBoundary}
            disabled={boundary.length === 0}
            className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            🗑 Smazat
          </button>

          <button
            type="button"
            onClick={completeBoundary}
            disabled={boundary.length < 3}
            className="rounded-xl bg-cyan-500 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ✓ Dokončit hranici
          </button>
        </div>
      )}

      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 15.473,
          latitude: 49.8175,
          zoom: 6,
        }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        onClick={(event) => {
          const { lng, lat } = event.lngLat;

          if (drawingMode) {
            addBoundaryPoint(lat, lng);
            return;
          }

          onMapClick?.({
            latitude: lat,
            longitude: lng,
          });
        }}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {satellite && (
          <Source
            id="aegris-satellite-source"
            type="raster"
            tiles={[
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ]}
            tileSize={256}
          >
            <Layer {...satelliteLayer} />
          </Source>
        )}

        <Source
          id="aegris-countries-source"
          type="geojson"
          data="/geo/countries.geojson"
        >
          <Layer {...allCountriesBorderLayer} />
          <Layer
            {...selectedCountryFillLayer}
            filter={["==", ["get", "SOV_A3"], selectedCountryIso3]}
          />
          <Layer
            {...selectedCountryBorderLayer}
            filter={["==", ["get", "SOV_A3"], selectedCountryIso3]}
          />
        </Source>

        {boundary.length >= 3 && (
          <Source
            id="aegris-boundary-source"
            type="geojson"
            data={boundaryGeoJSON}
          >
            <Layer {...boundaryFillLayer} />
            <Layer {...boundaryLineLayer} />
          </Source>
        )}

        {drawingMode &&
          boundary.map((point, index) => (
            <Marker
              key={`boundary-${index}`}
              longitude={point.longitude}
              latitude={point.latitude}
              anchor="center"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-cyan-500 shadow-lg shadow-cyan-500/50">
                <span className="text-[9px] font-bold text-slate-950">
                  {index + 1}
                </span>
              </div>
            </Marker>
          ))}

        {!drawingMode &&
          projects.map((project) => {
            const selected =
              selectedProjectId !== undefined && project.id === selectedProjectId;

            return (
              <Marker
                key={
                  project.id ?? `${project.latitude}-${project.longitude}`
                }
                longitude={project.longitude}
                latitude={project.latitude}
                anchor="center"
              >
                <button
                  type="button"
                  onMouseEnter={() => setHoveredProject(project)}
                  onMouseLeave={() => setHoveredProject(null)}
                  onClick={(event) => {
                    event.stopPropagation();
                    onLocationSelect?.(project);
                  }}
                  className={`relative flex h-5 w-5 items-center justify-center rounded-full ring-4 transition hover:scale-125 ${markerClass(
                    project.priority
                  )} ${selected ? "scale-125 ring-8" : ""}`}
                  title={project.name}
                  aria-label={`Otevřít pozemek ${project.name}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#061015]" />
                  {project.unreadAlerts ? (
                    <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#071017] bg-red-300" />
                  ) : null}
                </button>
              </Marker>
            );
          })}

        {!drawingMode && hoveredProject && (
          <Popup
            longitude={hoveredProject.longitude}
            latitude={hoveredProject.latitude}
            anchor="bottom"
            offset={18}
            closeButton={false}
            closeOnClick={false}
            className="aegris-map-popup"
          >
            <div className="min-w-[150px] bg-[#071017] p-2 text-slate-100">
              <div className="text-xs font-black">{hoveredProject.name}</div>
              <div className="mt-1 flex items-center justify-between gap-4 text-[10px] text-slate-400">
                <span>{hoveredProject.priority ?? "Bez priority"}</span>
                <span>
                  {hoveredProject.score != null
                    ? `${hoveredProject.score}/100`
                    : "—"}
                </span>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
