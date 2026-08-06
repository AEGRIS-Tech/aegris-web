"use client";

import { useState } from "react";
import Map, {
  NavigationControl,
  Marker,
  MapLayerMouseEvent,
} from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

type Project = {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
};

type WorldMapProps = {
  projects?: Project[];
  onLocationSelect?: (location: Project) => void;
};

export default function WorldMap({
  projects = [],
  onLocationSelect,
}: WorldMapProps) {
  const [point, setPoint] = useState({
    lng: 15,
    lat: 35,
  });

  function handleClick(e: MapLayerMouseEvent) {
  const location = {
    name: "",
    latitude: e.lngLat.lat,
    longitude: e.lngLat.lng,
    status: "Monitoring",
  };

  setPoint({
    lng: e.lngLat.lng,
    lat: e.lngLat.lat,
  });

  onLocationSelect?.(location);
}
return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-800">

      <Map
        initialViewState={{
          longitude: 15,
          latitude: 35,
          zoom: 2,
        }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        style={{ width: "100%", height: "100%" }}
        onClick={handleClick}
      >
        <NavigationControl position="top-right" />

        {projects.map((project) => (
  <Marker
    key={project.id}
    longitude={project.longitude}
    latitude={project.latitude}
    anchor="bottom"
  >
    <button
  onClick={(e) => {
    e.stopPropagation();

    console.log("Kliknuto na:", project.name);

    alert(project.name);

    onLocationSelect?.(project);
  }}
  className="text-3xl cursor-pointer"
  title={project.name}
>
  📍
</button>
  </Marker>
))}

<Marker
  longitude={point.lng}
  latitude={point.lat}
  anchor="bottom"
>
  <div className="text-2xl">
    🔴
  </div>
</Marker>

      </Map>

      <div className="absolute bottom-4 left-4 rounded-xl bg-slate-900/90 px-4 py-3 text-sm text-white backdrop-blur">
        <div>
          Longitude:
          <span className="ml-2 text-cyan-400">
            {point.lng.toFixed(5)}
          </span>
        </div>

        <div>
          Latitude:
          <span className="ml-2 text-cyan-400">
            {point.lat.toFixed(5)}
          </span>
        </div>
      </div>

    </div>
  );
}