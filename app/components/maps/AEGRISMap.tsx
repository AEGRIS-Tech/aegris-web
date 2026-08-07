"use client";

import { useRef } from "react";

import Map, {
  Marker,
  NavigationControl,
  type MapRef,
} from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

import TerraDrawControl from "./TerraDrawControl";

type Props = {
  latitude: number;
  longitude: number;
};

export default function AEGRISMap({
  latitude,
  longitude,
}: Props) {
  const mapRef = useRef<MapRef>(null);

  return (
    <div className="h-[500px] w-full overflow-hidden rounded-2xl">
      <Map
        ref={mapRef}
        initialViewState={{
          latitude,
          longitude,
          zoom: 16,
        }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <TerraDrawControl />

        <NavigationControl position="top-right" />

        <Marker
          latitude={latitude}
          longitude={longitude}
          anchor="bottom"
        >
          <div className="text-4xl">📍</div>
        </Marker>
      </Map>
    </div>
  );
}