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

import { useLanguage } from "../../context/LanguageContext";

type Props = {
  latitude: number;
  longitude: number;
  boundary?: Geometry | null;
};

function getProjectMapCopy(language: string) {
  const copies = {
    cs: {
      mapAriaLabel: "Satelitní mapa projektového pozemku",
      fieldMarkerLabel: "Poloha projektového pozemku",
    },
    en: {
      mapAriaLabel: "Satellite map of the project field",
      fieldMarkerLabel: "Project field location",
    },
    sk: {
      mapAriaLabel: "Satelitná mapa projektového pozemku",
      fieldMarkerLabel: "Poloha projektového pozemku",
    },
    de: {
      mapAriaLabel: "Satellitenkarte der Projektfläche",
      fieldMarkerLabel: "Position der Projektfläche",
    },
    pl: {
      mapAriaLabel: "Mapa satelitarna pola projektu",
      fieldMarkerLabel: "Lokalizacja pola projektu",
    },
    fr: {
      mapAriaLabel: "Carte satellite de la parcelle du projet",
      fieldMarkerLabel: "Emplacement de la parcelle du projet",
    },
    es: {
      mapAriaLabel: "Mapa satelital de la parcela del proyecto",
      fieldMarkerLabel: "Ubicación de la parcela del proyecto",
    },
    it: {
      mapAriaLabel: "Mappa satellitare dell'appezzamento del progetto",
      fieldMarkerLabel: "Posizione dell'appezzamento del progetto",
    },
    nl: {
      mapAriaLabel: "Satellietkaart van het projectperceel",
      fieldMarkerLabel: "Locatie van het projectperceel",
    },
    pt: {
      mapAriaLabel: "Mapa de satélite da parcela do projeto",
      fieldMarkerLabel: "Localização da parcela do projeto",
    },
    ro: {
      mapAriaLabel: "Hartă satelitară a parcelei proiectului",
      fieldMarkerLabel: "Locația parcelei proiectului",
    },
    hu: {
      mapAriaLabel: "A projekt tábla műholdas térképe",
      fieldMarkerLabel: "A projekt tábla helye",
    },
    uk: {
      mapAriaLabel: "Супутникова карта поля проєкту",
      fieldMarkerLabel: "Розташування поля проєкту",
    },
    bg: {
      mapAriaLabel: "Сателитна карта на проектното поле",
      fieldMarkerLabel: "Местоположение на проектното поле",
    },
    hr: {
      mapAriaLabel: "Satelitska karta projektne parcele",
      fieldMarkerLabel: "Lokacija projektne parcele",
    },
    sl: {
      mapAriaLabel: "Satelitski zemljevid projektne parcele",
      fieldMarkerLabel: "Lokacija projektne parcele",
    },
    lt: {
      mapAriaLabel: "Projekto lauko palydovinis žemėlapis",
      fieldMarkerLabel: "Projekto lauko vieta",
    },
    lv: {
      mapAriaLabel: "Projekta lauka satelītkarte",
      fieldMarkerLabel: "Projekta lauka atrašanās vieta",
    },
    et: {
      mapAriaLabel: "Projekti põllu satelliitkaart",
      fieldMarkerLabel: "Projekti põllu asukoht",
    },
    el: {
      mapAriaLabel: "Δορυφορικός χάρτης του αγροτεμαχίου του έργου",
      fieldMarkerLabel: "Τοποθεσία του αγροτεμαχίου του έργου",
    },
    sv: {
      mapAriaLabel: "Satellitkarta över projektfältet",
      fieldMarkerLabel: "Projektfältets plats",
    },
    da: {
      mapAriaLabel: "Satellitkort over projektmarken",
      fieldMarkerLabel: "Projektmarkens placering",
    },
    no: {
      mapAriaLabel: "Satellittkart over prosjektjordet",
      fieldMarkerLabel: "Plassering av prosjektjordet",
    },
    fi: {
      mapAriaLabel: "Projektin lohkon satelliittikartta",
      fieldMarkerLabel: "Projektin lohkon sijainti",
    }
  };

  return copies[language as keyof typeof copies] ?? copies.en;
}

export default function ProjectMap({
  latitude,
  longitude,
  boundary,
}: Props) {
  const mapRef = useRef<MapRef | null>(null);
  const { language } = useLanguage();
  const copy = getProjectMapCopy(language);

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
    <div
      className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-950"
      role="region"
      aria-label={copy.mapAriaLabel}
    >
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
            <Layer
              id="project-boundary-fill"
              type="fill"
              paint={{
                "fill-color": "#06b6d4",
                "fill-opacity": 0.12,
              }}
            />

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
          <div
            className="relative flex h-10 w-10 items-center justify-center"
            role="img"
            aria-label={copy.fieldMarkerLabel}
            title={copy.fieldMarkerLabel}
          >
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
