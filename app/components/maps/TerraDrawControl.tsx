"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";

import {
  TerraDraw,
  TerraDrawPolygonMode,
  TerraDrawSelectMode,
} from "terra-draw";

import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";

export default function TerraDrawControl() {
  const { current: map } = useMap();

  const draw = useRef<TerraDraw | null>(null);

  useEffect(() => {
    if (!map) return;

    map.once("load", () => {
      if (draw.current) return;

      draw.current = new TerraDraw({
        adapter: new TerraDrawMapLibreGLAdapter({
          map: map.getMap(),
        }),

        modes: [
          new TerraDrawPolygonMode(),

          new TerraDrawSelectMode({
            flags: {
              polygon: {
                feature: {
                  draggable: true,

                  coordinates: {
                    draggable: true,
                    deletable: true,
                    midpoints: true,
                  },
                },
              },
            },
          }),
        ],
      });

      draw.current.start();

      draw.current.setMode("polygon");
    });

    return () => {
      draw.current?.stop();

      draw.current = null;
    };
  }, [map]);

  return null;
}