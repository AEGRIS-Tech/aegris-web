"use client";

import { useEffect, useRef } from "react";

import Map, {
  Marker,
  NavigationControl,
  ScaleControl,
  Source,
  Layer,
  type MapRef,
} from "react-map-gl/maplibre";

import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { Geometry } from "geojson";

type Props = {
  latitude: number;
  longitude: number;
  boundary?: Geometry | null;
};

export default function ProjectMap({
  latitude,
  longitude,
  boundary,
}: Props) {
  const mapRef = useRef<MapRef | null>(null);

  useEffect(() => {
    maplibregl.setWorkerUrl(
      "/maplibre/maplibre-gl-worker.mjs"
    );
  }, []);

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

  const boundaryGeoJson = boundary
    ? {
        type: "Feature" as const,
        properties: {},
        geometry: boundary,
      }
    : null;

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
      <Map
        ref={mapRef}
        initialViewState={{
          latitude,
          longitude,
          zoom: 16,
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

        {boundaryGeoJson && (
          <Source
            id="project-boundary"
            type="geojson"
            data={boundaryGeoJson}
          >
            {/* Výplň pole */}
            <Layer
              id="project-boundary-fill"
              type="fill"
              paint={{
                "fill-color": "#06b6d4",
                "fill-opacity": 0.12,
              }}
            />

            {/* Hranice pole */}
            <Layer
              id="project-boundary-line"
              type="line"
              paint={{
                "line-color": "#22d3ee",
                "line-width": 3,
                "line-opacity": 0.95,
              }}
            />
          </Source>
        )}

        <Marker
          longitude={longitude}
          latitude={latitude}
          anchor="center"
        >
          <div className="relative flex h-10 w-10 items-center justify-center">
            <div className="absolute h-10 w-10 animate-ping rounded-full bg-cyan-400/30" />

            <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-cyan-500 shadow-xl shadow-cyan-500/50">
              <div className="h-2.5 w-2.5 rounded-full bg-white" />
            </div>
          </div>
        </Marker>
      </Map>
    </div>
  );
}