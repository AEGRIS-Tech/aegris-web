"use client";

import { useEffect, useRef, useState } from "react";

import Map, {
  NavigationControl,
  Marker,
  Source,
  Layer,
  type MapRef,
} from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

type Project = {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
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

  /* Místo nalezené podle adresy / PSČ. */
  focusLatitude?: number;
  focusLongitude?: number;

  /*
   * Režim kreslení hranice.
   */
  drawingMode?: boolean;

  /*
   * Hranice se posílá rodičovské komponentě.
   */
  onBoundaryChange?: (
    boundary: BoundaryPoint[]
  ) => void;

  /*
   * Po dokončení hranice.
   */
  onBoundaryComplete?: (
    boundary: BoundaryPoint[]
  ) => void;
};

type Country = {
  name: string;
  iso3: string;
  latitude: number;
  longitude: number;
  zoom: number;
};

const countries: Country[] = [
  {
    name: "Česko",
    iso3: "CZE",
    latitude: 49.8175,
    longitude: 15.473,
    zoom: 7,
  },
  {
    name: "Slovensko",
    iso3: "SVK",
    latitude: 48.669,
    longitude: 19.699,
    zoom: 7,
  },
  {
    name: "Německo",
    iso3: "DEU",
    latitude: 51.1657,
    longitude: 10.4515,
    zoom: 6,
  },
  {
    name: "Rakousko",
    iso3: "AUT",
    latitude: 47.5162,
    longitude: 14.5501,
    zoom: 7,
  },
  {
    name: "Polsko",
    iso3: "POL",
    latitude: 51.9194,
    longitude: 19.1451,
    zoom: 6,
  },
  {
    name: "Francie",
    iso3: "FRA",
    latitude: 46.2276,
    longitude: 2.2137,
    zoom: 6,
  },
  {
    name: "Itálie",
    iso3: "ITA",
    latitude: 41.8719,
    longitude: 12.5674,
    zoom: 6,
  },
  {
    name: "Španělsko",
    iso3: "ESP",
    latitude: 40.4637,
    longitude: -3.7492,
    zoom: 6,
  },
];

const satelliteLayer = {
  id: "aegris-satellite",
  type: "raster" as const,

  paint: {
    "raster-opacity": 1,
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
    "line-color": "#ffffff",
    "line-width": 1.5,
    "line-opacity": 0.65,
  },
};

const selectedCountryFillLayer = {
  id: "aegris-selected-country-fill",
  type: "fill" as const,

  paint: {
    "fill-color": "#00e5ff",
    "fill-opacity": 0.2,
    "fill-outline-color": "#00ffff",
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
    "line-color": "#00ffff",
    "line-width": 5,
    "line-opacity": 1,
  },
};

/*
 * =========================================================
 * HRANICE POZEMKU
 * =========================================================
 */

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

export default function WorldMap({
  projects = [],
  onLocationSelect,
  onMapClick,
  focusLatitude,
  focusLongitude,
  drawingMode = false,
  onBoundaryChange,
  onBoundaryComplete,
}: WorldMapProps) {
  const mapRef = useRef<MapRef | null>(null);

  const [satellite, setSatellite] = useState(true);

  const [selectedCountry, setSelectedCountry] =
    useState("Česko");

  const [boundary, setBoundary] =
    useState<BoundaryPoint[]>([]);

  const selectedCountryIso3 =
    countries.find(
      (country) =>
        country.name === selectedCountry
    )?.iso3 ?? "CZE";

  /* Po nalezení adresy/PSČ přejeď na lokalitu a přibliž mapu. */
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

  /*
   * =========================================================
   * VÝBĚR STÁTU
   * =========================================================
   */

  function selectCountry(countryName: string) {
    const country = countries.find(
      (item) => item.name === countryName
    );

    if (!country) {
      return;
    }

    setSelectedCountry(country.name);

    const map = mapRef.current;

    if (!map) {
      return;
    }

    map.flyTo({
      center: [
        country.longitude,
        country.latitude,
      ],
      zoom: country.zoom,
      duration: 1200,
      essential: true,
    });
  }

  /*
   * =========================================================
   * PŘIDÁNÍ BODU HRANICE
   * =========================================================
   */

  function addBoundaryPoint(
    latitude: number,
    longitude: number
  ) {
    const nextBoundary = [
      ...boundary,
      {
        latitude,
        longitude,
      },
    ];

    setBoundary(nextBoundary);
    onBoundaryChange?.(nextBoundary);
  }

  /*
   * =========================================================
   * ZPĚT O JEDEN BOD
   * =========================================================
   */

  function removeLastBoundaryPoint() {
    if (boundary.length === 0) {
      return;
    }

    const nextBoundary =
      boundary.slice(0, -1);

    setBoundary(nextBoundary);
    onBoundaryChange?.(nextBoundary);
  }

  /*
   * =========================================================
   * VYMAZAT CELou HRANICI
   * =========================================================
   */

  function clearBoundary() {
    setBoundary([]);
    onBoundaryChange?.([]);
  }

  /*
   * =========================================================
   * DOKONČIT HRANICI
   * =========================================================
   */

  function completeBoundary() {
    if (boundary.length < 3) {
      alert(
        "Pro dokončení hranice označ alespoň 3 body."
      );
      return;
    }

    onBoundaryComplete?.(boundary);
  }

  /*
   * =========================================================
   * GEOJSON HRANICE
   * =========================================================
   */

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
                    ...boundary.map(
                      (point) => [
                        point.longitude,
                        point.latitude,
                      ]
                    ),

                    [
                      boundary[0].longitude,
                      boundary[0].latitude,
                    ],
                  ],
                ],
              },
            },
          ]
        : [],
  };

  /*
   * =========================================================
   * MAPA
   * =========================================================
   */

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* ================================================= */}
      {/* OVLÁDÁNÍ */}
      {/* ================================================= */}

      <div
        className="
          absolute
          left-5
          top-5
          z-50
          flex
          flex-wrap
          gap-2
        "
      >
        {!drawingMode && (
          <>
            <select
              value={selectedCountry}
              onChange={(event) =>
                selectCountry(
                  event.target.value
                )
              }
              className="
                rounded-xl
                border
                border-cyan-400
                bg-slate-950
                px-4
                py-3
                text-sm
                font-bold
                text-white
                shadow-2xl
                outline-none
              "
            >
              {countries.map((country) => (
                <option
                  key={country.iso3}
                  value={country.name}
                >
                  🌍 {country.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() =>
                setSatellite(
                  (value) => !value
                )
              }
              className="
                rounded-xl
                border
                border-slate-700
                bg-slate-950
                px-4
                py-3
                text-sm
                font-bold
                text-white
                shadow-2xl
              "
            >
              {satellite
                ? "🛰️ Satelit"
                : "🗺️ Mapa"}
            </button>
          </>
        )}

        {drawingMode && (
          <div
            className="
              rounded-xl
              border
              border-cyan-400
              bg-slate-950/95
              px-4
              py-3
              text-sm
              font-semibold
              text-white
              shadow-2xl
              backdrop-blur
            "
          >
            📐 Označte hranici pozemku
            <div className="mt-1 text-xs text-slate-400">
              Body: {boundary.length}
            </div>
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/* OVLÁDÁNÍ KRESLENÍ */}
      {/* ================================================= */}

      {drawingMode && (
        <div
          className="
            absolute
            bottom-5
            left-1/2
            z-50
            flex
            -translate-x-1/2
            gap-2
            rounded-2xl
            border
            border-slate-700
            bg-slate-950/95
            p-3
            shadow-2xl
            backdrop-blur
          "
        >
          <button
            type="button"
            onClick={removeLastBoundaryPoint}
            disabled={boundary.length === 0}
            className="
              rounded-xl
              bg-slate-700
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-slate-600
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            ↶ Zpět
          </button>

          <button
            type="button"
            onClick={clearBoundary}
            disabled={boundary.length === 0}
            className="
              rounded-xl
              bg-slate-700
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-slate-600
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            🗑 Smazat
          </button>

          <button
            type="button"
            onClick={completeBoundary}
            disabled={boundary.length < 3}
            className="
              rounded-xl
              bg-cyan-500
              px-5
              py-2
              text-sm
              font-bold
              text-slate-950
              transition
              hover:bg-cyan-400
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            ✓ Dokončit hranici
          </button>
        </div>
      )}

      {/* ================================================= */}
      {/* MAPA */}
      {/* ================================================= */}

      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 15.473,
          latitude: 49.8175,
          zoom: 6,
        }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        onLoad={() => {
          console.log(
            "✅ AEGRIS MAP LOAD OK"
          );
        }}
        onClick={(event) => {
          const {
            lng,
            lat,
          } = event.lngLat;

          /*
           * KRESLENÍ POZEMKU
           *
           * Pokud jsme v režimu kreslení,
           * kliknutí vytvoří nový bod.
           */
          if (drawingMode) {
            addBoundaryPoint(
              lat,
              lng
            );

            return;
          }

          /*
           * Původní chování mapy
           */
          console.log(
            "📍 Kliknutí na mapu:",
            lat,
            lng
          );

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
        <NavigationControl
          position="top-right"
        />

        {/* ================================================= */}
        {/* SATELIT */}
        {/* ================================================= */}

        {satellite && (
          <Source
            id="aegris-satellite-source"
            type="raster"
            tiles={[
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ]}
            tileSize={256}
          >
            <Layer
              {...satelliteLayer}
            />
          </Source>
        )}

        {/* ================================================= */}
        {/* HRANICE STÁTŮ */}
        {/* ================================================= */}

        <Source
          id="aegris-countries-source"
          type="geojson"
          data="/geo/countries.geojson"
        >
          <Layer
            {...allCountriesBorderLayer}
          />

          <Layer
            {...selectedCountryFillLayer}
            filter={[
              "==",
              ["get", "SOV_A3"],
              selectedCountryIso3,
            ]}
          />

          <Layer
            {...selectedCountryBorderLayer}
            filter={[
              "==",
              ["get", "SOV_A3"],
              selectedCountryIso3,
            ]}
          />
        </Source>

        {/* ================================================= */}
        {/* HRANICE POZEMKU */}
        {/* ================================================= */}

        {boundary.length >= 3 && (
          <Source
            id="aegris-boundary-source"
            type="geojson"
            data={boundaryGeoJSON}
          >
            <Layer
              {...boundaryFillLayer}
            />

            <Layer
              {...boundaryLineLayer}
            />
          </Source>
        )}

        {/* ================================================= */}
        {/* BODY HRANICE */}
        {/* ================================================= */}

        {drawingMode &&
          boundary.map(
            (point, index) => (
              <Marker
                key={`boundary-${index}`}
                longitude={
                  point.longitude
                }
                latitude={
                  point.latitude
                }
                anchor="center"
              >
                <div
                  className="
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-white
                    bg-cyan-500
                    shadow-lg
                    shadow-cyan-500/50
                  "
                >
                  <span className="text-[9px] font-bold text-slate-950">
                    {index + 1}
                  </span>
                </div>
              </Marker>
            )
          )}

        {/* ================================================= */}
        {/* EXISTUJÍCÍ PROJEKTY */}
        {/* ================================================= */}

        {!drawingMode &&
          projects.map(
            (project) => (
              <Marker
                key={
                  project.id ??
                  `${project.latitude}-${project.longitude}`
                }
                longitude={
                  project.longitude
                }
                latitude={
                  project.latitude
                }
                anchor="bottom"
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();

                    console.log(
                      "📍 Kliknutý projekt:",
                      project.name
                    );

                    onLocationSelect?.(
                      project
                    );
                  }}
                  className="
                    cursor-pointer
                    text-3xl
                    drop-shadow-2xl
                  "
                  title={project.name}
                >
                  📍
                </button>
              </Marker>
            )
          )}
      </Map>
    </div>
  );
}