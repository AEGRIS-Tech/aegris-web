"use client";

import Map, {
  Marker,
  NavigationControl,
} from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  latitude: number;
  longitude: number;
};

export default function ProjectMap({
  latitude,
  longitude,
}: Props) {
  return (
    <div className="relative h-[450px] w-full overflow-hidden rounded-2xl border border-slate-800">

      <button
        className="absolute left-4 top-4 z-10 rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-900 shadow-lg"
        onClick={() => {
          alert("Terra Draw připravíme v dalším kroku");
        }}
      >
        ✏️ Kreslit hranici
      </button>

      <Map
        initialViewState={{
          longitude,
          latitude,
          zoom: 2,
        }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <NavigationControl position="top-right" />

        <Marker
          longitude={longitude}
          latitude={latitude}
          anchor="bottom"
        >
          <div className="text-4xl">
            📍
          </div>
        </Marker>

      </Map>

    </div>
  );
}