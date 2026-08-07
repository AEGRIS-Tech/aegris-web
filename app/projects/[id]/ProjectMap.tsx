"use client";

import { useRef } from "react";

import Map, {
  Marker,
  NavigationControl,
  type MapRef,
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
  const mapRef = useRef<MapRef | null>(null);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude,
        latitude,
        zoom: 16,
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
        <div className="text-4xl">📍</div>
      </Marker>
    </Map>
  );
}