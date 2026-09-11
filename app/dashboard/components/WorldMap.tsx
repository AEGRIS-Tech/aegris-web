"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

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
  { name: "Czechia", iso3: "CZE", latitude: 49.8175, longitude: 15.473, zoom: 7 },
  { name: "Slovakia", iso3: "SVK", latitude: 48.669, longitude: 19.699, zoom: 7 },
  { name: "Germany", iso3: "DEU", latitude: 51.1657, longitude: 10.4515, zoom: 6 },
  { name: "Austria", iso3: "AUT", latitude: 47.5162, longitude: 14.5501, zoom: 7 },
  { name: "Poland", iso3: "POL", latitude: 51.9194, longitude: 19.1451, zoom: 6 },
  { name: "France", iso3: "FRA", latitude: 46.2276, longitude: 2.2137, zoom: 6 },
  { name: "Italy", iso3: "ITA", latitude: 41.8719, longitude: 12.5674, zoom: 6 },
  { name: "Spain", iso3: "ESP", latitude: 40.4637, longitude: -3.7492, zoom: 6 },
];

function getWorldMapCopy(language: string) {
  const copies = {
    cs: {
      countries: {
        CZE: "Česko",
        SVK: "Slovensko",
        DEU: "Německo",
        AUT: "Rakousko",
        POL: "Polsko",
        FRA: "Francie",
        ITA: "Itálie",
        ESP: "Španělsko",
      } as Record<string, string>,
      satellite: "SATELIT",
      map: "MAPA",
      markBoundary: "📐 Označte hranici pozemku",
      points: "Body",
      critical: "Kritická",
      high: "Vysoká",
      medium: "Střední",
      low: "Nízká",
      back: "↶ Zpět",
      clear: "🗑 Smazat",
      completeBoundary: "✓ Dokončit hranici",
      boundaryMinimum: "Pro dokončení hranice označ alespoň 3 body.",
      openField: "Otevřít pozemek",
      noPriority: "Bez priority",
    },
    en: {
      countries: {
        CZE: "Czechia",
        SVK: "Slovakia",
        DEU: "Germany",
        AUT: "Austria",
        POL: "Poland",
        FRA: "France",
        ITA: "Italy",
        ESP: "Spain",
      } as Record<string, string>,
      satellite: "SATELLITE",
      map: "MAP",
      markBoundary: "📐 Mark the field boundary",
      points: "Points",
      critical: "Critical",
      high: "High",
      medium: "Medium",
      low: "Low",
      back: "↶ Back",
      clear: "🗑 Clear",
      completeBoundary: "✓ Complete boundary",
      boundaryMinimum: "Mark at least 3 points to complete the boundary.",
      openField: "Open field",
      noPriority: "No priority",
    },
    sk: {
      countries: {
        CZE: "Česko",
        SVK: "Slovensko",
        DEU: "Nemecko",
        AUT: "Rakúsko",
        POL: "Poľsko",
        FRA: "Francúzsko",
        ITA: "Taliansko",
        ESP: "Španielsko",
      } as Record<string, string>,
      satellite: "SATELIT",
      map: "MAPA",
      markBoundary: "📐 Označte hranicu pozemku",
      points: "Body",
      critical: "Kritická",
      high: "Vysoká",
      medium: "Stredná",
      low: "Nízka",
      back: "↶ Späť",
      clear: "🗑 Vymazať",
      completeBoundary: "✓ Dokončiť hranicu",
      boundaryMinimum: "Na dokončenie hranice označte aspoň 3 body.",
      openField: "Otvoriť pozemok",
      noPriority: "Bez priority",
    },
    de: {
      countries: {
        CZE: "Tschechien",
        SVK: "Slowakei",
        DEU: "Deutschland",
        AUT: "Österreich",
        POL: "Polen",
        FRA: "Frankreich",
        ITA: "Italien",
        ESP: "Spanien",
      } as Record<string, string>,
      satellite: "SATELLIT",
      map: "KARTE",
      markBoundary: "📐 Feldgrenze markieren",
      points: "Punkte",
      critical: "Kritisch",
      high: "Hoch",
      medium: "Mittel",
      low: "Niedrig",
      back: "↶ Zurück",
      clear: "🗑 Löschen",
      completeBoundary: "✓ Grenze abschließen",
      boundaryMinimum: "Markieren Sie mindestens 3 Punkte, um die Grenze abzuschließen.",
      openField: "Feld öffnen",
      noPriority: "Keine Priorität",
    },
    pl: {
      countries: {
        CZE: "Czechy",
        SVK: "Słowacja",
        DEU: "Niemcy",
        AUT: "Austria",
        POL: "Polska",
        FRA: "Francja",
        ITA: "Włochy",
        ESP: "Hiszpania",
      } as Record<string, string>,
      satellite: "SATELITA",
      map: "MAPA",
      markBoundary: "📐 Zaznacz granicę pola",
      points: "Punkty",
      critical: "Krytyczny",
      high: "Wysoki",
      medium: "Średni",
      low: "Niski",
      back: "↶ Wstecz",
      clear: "🗑 Wyczyść",
      completeBoundary: "✓ Zakończ granicę",
      boundaryMinimum: "Zaznacz co najmniej 3 punkty, aby zakończyć granicę.",
      openField: "Otwórz pole",
      noPriority: "Brak priorytetu",
    },
    fr: {
      countries: {
        CZE: "Tchéquie",
        SVK: "Slovaquie",
        DEU: "Allemagne",
        AUT: "Autriche",
        POL: "Pologne",
        FRA: "France",
        ITA: "Italie",
        ESP: "Espagne",
      } as Record<string, string>,
      satellite: "SATELLITE",
      map: "CARTE",
      markBoundary: "📐 Marquer la limite de la parcelle",
      points: "Points",
      critical: "Critique",
      high: "Élevée",
      medium: "Moyenne",
      low: "Faible",
      back: "↶ Retour",
      clear: "🗑 Effacer",
      completeBoundary: "✓ Terminer la limite",
      boundaryMinimum: "Marquez au moins 3 points pour terminer la limite.",
      openField: "Ouvrir la parcelle",
      noPriority: "Aucune priorité",
    },
    es: {
      countries: {
        CZE: "Chequia",
        SVK: "Eslovaquia",
        DEU: "Alemania",
        AUT: "Austria",
        POL: "Polonia",
        FRA: "Francia",
        ITA: "Italia",
        ESP: "España",
      } as Record<string, string>,
      satellite: "SATÉLITE",
      map: "MAPA",
      markBoundary: "📐 Marcar el límite de la parcela",
      points: "Puntos",
      critical: "Crítica",
      high: "Alta",
      medium: "Media",
      low: "Baja",
      back: "↶ Atrás",
      clear: "🗑 Borrar",
      completeBoundary: "✓ Completar límite",
      boundaryMinimum: "Marca al menos 3 puntos para completar el límite.",
      openField: "Abrir parcela",
      noPriority: "Sin prioridad",
    },
    it: {
      countries: {
        CZE: "Cechia",
        SVK: "Slovacchia",
        DEU: "Germania",
        AUT: "Austria",
        POL: "Polonia",
        FRA: "Francia",
        ITA: "Italia",
        ESP: "Spagna",
      } as Record<string, string>,
      satellite: "SATELLITE",
      map: "MAPPA",
      markBoundary: "📐 Segna il confine dell’appezzamento",
      points: "Punti",
      critical: "Critica",
      high: "Alta",
      medium: "Media",
      low: "Bassa",
      back: "↶ Indietro",
      clear: "🗑 Cancella",
      completeBoundary: "✓ Completa confine",
      boundaryMinimum: "Segna almeno 3 punti per completare il confine.",
      openField: "Apri appezzamento",
      noPriority: "Nessuna priorità",
    },
    nl: {
      countries: {
        CZE: "Tsjechië",
        SVK: "Slowakije",
        DEU: "Duitsland",
        AUT: "Oostenrijk",
        POL: "Polen",
        FRA: "Frankrijk",
        ITA: "Italië",
        ESP: "Spanje",
      } as Record<string, string>,
      satellite: "SATELLIET",
      map: "KAART",
      markBoundary: "📐 Markeer de perceelgrens",
      points: "Punten",
      critical: "Kritiek",
      high: "Hoog",
      medium: "Gemiddeld",
      low: "Laag",
      back: "↶ Terug",
      clear: "🗑 Wissen",
      completeBoundary: "✓ Grens voltooien",
      boundaryMinimum: "Markeer minimaal 3 punten om de grens te voltooien.",
      openField: "Perceel openen",
      noPriority: "Geen prioriteit",
    },
    pt: {
      countries: {
        CZE: "Chéquia",
        SVK: "Eslováquia",
        DEU: "Alemanha",
        AUT: "Áustria",
        POL: "Polónia",
        FRA: "França",
        ITA: "Itália",
        ESP: "Espanha",
      } as Record<string, string>,
      satellite: "SATÉLITE",
      map: "MAPA",
      markBoundary: "📐 Marcar o limite da parcela",
      points: "Pontos",
      critical: "Crítica",
      high: "Alta",
      medium: "Média",
      low: "Baixa",
      back: "↶ Voltar",
      clear: "🗑 Limpar",
      completeBoundary: "✓ Concluir limite",
      boundaryMinimum: "Marque pelo menos 3 pontos para concluir o limite.",
      openField: "Abrir parcela",
      noPriority: "Sem prioridade",
    },
    ro: {
      countries: {
        CZE: "Cehia",
        SVK: "Slovacia",
        DEU: "Germania",
        AUT: "Austria",
        POL: "Polonia",
        FRA: "Franța",
        ITA: "Italia",
        ESP: "Spania",
      } as Record<string, string>,
      satellite: "SATELIT",
      map: "HARTĂ",
      markBoundary: "📐 Marcați limita parcelei",
      points: "Puncte",
      critical: "Critică",
      high: "Ridicată",
      medium: "Medie",
      low: "Scăzută",
      back: "↶ Înapoi",
      clear: "🗑 Șterge",
      completeBoundary: "✓ Finalizează limita",
      boundaryMinimum: "Marcați cel puțin 3 puncte pentru a finaliza limita.",
      openField: "Deschide parcela",
      noPriority: "Fără prioritate",
    },
    hu: {
      countries: {
        CZE: "Csehország",
        SVK: "Szlovákia",
        DEU: "Németország",
        AUT: "Ausztria",
        POL: "Lengyelország",
        FRA: "Franciaország",
        ITA: "Olaszország",
        ESP: "Spanyolország",
      } as Record<string, string>,
      satellite: "MŰHOLD",
      map: "TÉRKÉP",
      markBoundary: "📐 Tábla határának kijelölése",
      points: "Pontok",
      critical: "Kritikus",
      high: "Magas",
      medium: "Közepes",
      low: "Alacsony",
      back: "↶ Vissza",
      clear: "🗑 Törlés",
      completeBoundary: "✓ Határ befejezése",
      boundaryMinimum: "A határ befejezéséhez jelöljön meg legalább 3 pontot.",
      openField: "Tábla megnyitása",
      noPriority: "Nincs prioritás",
    },
    uk: {
      countries: {
        CZE: "Чехія",
        SVK: "Словаччина",
        DEU: "Німеччина",
        AUT: "Австрія",
        POL: "Польща",
        FRA: "Франція",
        ITA: "Італія",
        ESP: "Іспанія",
      } as Record<string, string>,
      satellite: "СУПУТНИК",
      map: "КАРТА",
      markBoundary: "📐 Позначте межу поля",
      points: "Точки",
      critical: "Критичний",
      high: "Високий",
      medium: "Середній",
      low: "Низький",
      back: "↶ Назад",
      clear: "🗑 Очистити",
      completeBoundary: "✓ Завершити межу",
      boundaryMinimum: "Позначте щонайменше 3 точки, щоб завершити межу.",
      openField: "Відкрити поле",
      noPriority: "Без пріоритету",
    },
    bg: {
      countries: {
        CZE: "Чехия",
        SVK: "Словакия",
        DEU: "Германия",
        AUT: "Австрия",
        POL: "Полша",
        FRA: "Франция",
        ITA: "Италия",
        ESP: "Испания",
      } as Record<string, string>,
      satellite: "САТЕЛИТ",
      map: "КАРТА",
      markBoundary: "📐 Маркирайте границата на полето",
      points: "Точки",
      critical: "Критичен",
      high: "Висок",
      medium: "Среден",
      low: "Нисък",
      back: "↶ Назад",
      clear: "🗑 Изчисти",
      completeBoundary: "✓ Завърши границата",
      boundaryMinimum: "Маркирайте поне 3 точки, за да завършите границата.",
      openField: "Отвори поле",
      noPriority: "Без приоритет",
    },
    hr: {
      countries: {
        CZE: "Češka",
        SVK: "Slovačka",
        DEU: "Njemačka",
        AUT: "Austrija",
        POL: "Poljska",
        FRA: "Francuska",
        ITA: "Italija",
        ESP: "Španjolska",
      } as Record<string, string>,
      satellite: "SATELIT",
      map: "KARTA",
      markBoundary: "📐 Označite granicu parcele",
      points: "Točke",
      critical: "Kritična",
      high: "Visoka",
      medium: "Srednja",
      low: "Niska",
      back: "↶ Natrag",
      clear: "🗑 Očisti",
      completeBoundary: "✓ Dovrši granicu",
      boundaryMinimum: "Označite najmanje 3 točke kako biste dovršili granicu.",
      openField: "Otvori parcelu",
      noPriority: "Bez prioriteta",
    },
    sl: {
      countries: {
        CZE: "Češka",
        SVK: "Slovaška",
        DEU: "Nemčija",
        AUT: "Avstrija",
        POL: "Poljska",
        FRA: "Francija",
        ITA: "Italija",
        ESP: "Španija",
      } as Record<string, string>,
      satellite: "SATELIT",
      map: "ZEMLJEVID",
      markBoundary: "📐 Označite mejo parcele",
      points: "Točke",
      critical: "Kritična",
      high: "Visoka",
      medium: "Srednja",
      low: "Nizka",
      back: "↶ Nazaj",
      clear: "🗑 Počisti",
      completeBoundary: "✓ Dokončaj mejo",
      boundaryMinimum: "Za dokončanje meje označite vsaj 3 točke.",
      openField: "Odpri parcelo",
      noPriority: "Brez prioritete",
    },
    lt: {
      countries: {
        CZE: "Čekija",
        SVK: "Slovakija",
        DEU: "Vokietija",
        AUT: "Austrija",
        POL: "Lenkija",
        FRA: "Prancūzija",
        ITA: "Italija",
        ESP: "Ispanija",
      } as Record<string, string>,
      satellite: "PALYDOVAS",
      map: "ŽEMĖLAPIS",
      markBoundary: "📐 Pažymėkite lauko ribą",
      points: "Taškai",
      critical: "Kritinis",
      high: "Aukštas",
      medium: "Vidutinis",
      low: "Žemas",
      back: "↶ Atgal",
      clear: "🗑 Išvalyti",
      completeBoundary: "✓ Užbaigti ribą",
      boundaryMinimum: "Norėdami užbaigti ribą, pažymėkite bent 3 taškus.",
      openField: "Atidaryti lauką",
      noPriority: "Be prioriteto",
    },
    lv: {
      countries: {
        CZE: "Čehija",
        SVK: "Slovākija",
        DEU: "Vācija",
        AUT: "Austrija",
        POL: "Polija",
        FRA: "Francija",
        ITA: "Itālija",
        ESP: "Spānija",
      } as Record<string, string>,
      satellite: "SATELĪTS",
      map: "KARTE",
      markBoundary: "📐 Atzīmējiet lauka robežu",
      points: "Punkti",
      critical: "Kritiska",
      high: "Augsta",
      medium: "Vidēja",
      low: "Zema",
      back: "↶ Atpakaļ",
      clear: "🗑 Notīrīt",
      completeBoundary: "✓ Pabeigt robežu",
      boundaryMinimum: "Lai pabeigtu robežu, atzīmējiet vismaz 3 punktus.",
      openField: "Atvērt lauku",
      noPriority: "Bez prioritātes",
    },
    et: {
      countries: {
        CZE: "Tšehhi",
        SVK: "Slovakkia",
        DEU: "Saksamaa",
        AUT: "Austria",
        POL: "Poola",
        FRA: "Prantsusmaa",
        ITA: "Itaalia",
        ESP: "Hispaania",
      } as Record<string, string>,
      satellite: "SATELLIIT",
      map: "KAART",
      markBoundary: "📐 Märkige põllupiir",
      points: "Punktid",
      critical: "Kriitiline",
      high: "Kõrge",
      medium: "Keskmine",
      low: "Madal",
      back: "↶ Tagasi",
      clear: "🗑 Tühjenda",
      completeBoundary: "✓ Lõpeta piir",
      boundaryMinimum: "Piiri lõpetamiseks märkige vähemalt 3 punkti.",
      openField: "Ava põld",
      noPriority: "Prioriteet puudub",
    },
    el: {
      countries: {
        CZE: "Τσεχία",
        SVK: "Σλοβακία",
        DEU: "Γερμανία",
        AUT: "Αυστρία",
        POL: "Πολωνία",
        FRA: "Γαλλία",
        ITA: "Ιταλία",
        ESP: "Ισπανία",
      } as Record<string, string>,
      satellite: "ΔΟΡΥΦΟΡΟΣ",
      map: "ΧΑΡΤΗΣ",
      markBoundary: "📐 Σημειώστε το όριο του αγροτεμαχίου",
      points: "Σημεία",
      critical: "Κρίσιμη",
      high: "Υψηλή",
      medium: "Μέτρια",
      low: "Χαμηλή",
      back: "↶ Πίσω",
      clear: "🗑 Εκκαθάριση",
      completeBoundary: "✓ Ολοκλήρωση ορίου",
      boundaryMinimum: "Σημειώστε τουλάχιστον 3 σημεία για να ολοκληρώσετε το όριο.",
      openField: "Άνοιγμα αγροτεμαχίου",
      noPriority: "Χωρίς προτεραιότητα",
    },
    sv: {
      countries: {
        CZE: "Tjeckien",
        SVK: "Slovakien",
        DEU: "Tyskland",
        AUT: "Österrike",
        POL: "Polen",
        FRA: "Frankrike",
        ITA: "Italien",
        ESP: "Spanien",
      } as Record<string, string>,
      satellite: "SATELLIT",
      map: "KARTA",
      markBoundary: "📐 Markera fältgränsen",
      points: "Punkter",
      critical: "Kritisk",
      high: "Hög",
      medium: "Medel",
      low: "Låg",
      back: "↶ Tillbaka",
      clear: "🗑 Rensa",
      completeBoundary: "✓ Slutför gräns",
      boundaryMinimum: "Markera minst 3 punkter för att slutföra gränsen.",
      openField: "Öppna fält",
      noPriority: "Ingen prioritet",
    },
    da: {
      countries: {
        CZE: "Tjekkiet",
        SVK: "Slovakiet",
        DEU: "Tyskland",
        AUT: "Østrig",
        POL: "Polen",
        FRA: "Frankrig",
        ITA: "Italien",
        ESP: "Spanien",
      } as Record<string, string>,
      satellite: "SATELLIT",
      map: "KORT",
      markBoundary: "📐 Markér markgrænsen",
      points: "Punkter",
      critical: "Kritisk",
      high: "Høj",
      medium: "Mellem",
      low: "Lav",
      back: "↶ Tilbage",
      clear: "🗑 Ryd",
      completeBoundary: "✓ Færdiggør grænse",
      boundaryMinimum: "Markér mindst 3 punkter for at færdiggøre grænsen.",
      openField: "Åbn mark",
      noPriority: "Ingen prioritet",
    },
    no: {
      countries: {
        CZE: "Tsjekkia",
        SVK: "Slovakia",
        DEU: "Tyskland",
        AUT: "Østerrike",
        POL: "Polen",
        FRA: "Frankrike",
        ITA: "Italia",
        ESP: "Spania",
      } as Record<string, string>,
      satellite: "SATELLITT",
      map: "KART",
      markBoundary: "📐 Marker feltgrensen",
      points: "Punkter",
      critical: "Kritisk",
      high: "Høy",
      medium: "Middels",
      low: "Lav",
      back: "↶ Tilbake",
      clear: "🗑 Tøm",
      completeBoundary: "✓ Fullfør grense",
      boundaryMinimum: "Marker minst 3 punkter for å fullføre grensen.",
      openField: "Åpne felt",
      noPriority: "Ingen prioritet",
    },
    fi: {
      countries: {
        CZE: "Tšekki",
        SVK: "Slovakia",
        DEU: "Saksa",
        AUT: "Itävalta",
        POL: "Puola",
        FRA: "Ranska",
        ITA: "Italia",
        ESP: "Espanja",
      } as Record<string, string>,
      satellite: "SATELLIITTI",
      map: "KARTTA",
      markBoundary: "📐 Merkitse pellon raja",
      points: "Pisteet",
      critical: "Kriittinen",
      high: "Korkea",
      medium: "Keskitaso",
      low: "Matala",
      back: "↶ Takaisin",
      clear: "🗑 Tyhjennä",
      completeBoundary: "✓ Viimeistele raja",
      boundaryMinimum: "Merkitse vähintään 3 pistettä rajan viimeistelemiseksi.",
      openField: "Avaa pelto",
      noPriority: "Ei prioriteettia",
    }
  };

  return copies[language as keyof typeof copies] ?? copies.en;
}

function getLocalizedPriority(
  priority: string | null | undefined,
  copy: ReturnType<typeof getWorldMapCopy>
) {
  if (priority === "Kritická") return copy.critical;
  if (priority === "Vysoká") return copy.high;
  if (priority === "Střední") return copy.medium;
  if (priority === "Nízká") return copy.low;
  return priority ?? copy.noPriority;
}


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
  const { language } = useLanguage();
  const copy = getWorldMapCopy(language);

  const [satellite, setSatellite] = useState(true);
  const [selectedCountryIso3, setSelectedCountryIso3] = useState("CZE");
  const [boundary, setBoundary] = useState<BoundaryPoint[]>([]);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);

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

  function selectCountry(countryIso3: string) {
    const country = countries.find((item) => item.iso3 === countryIso3);
    if (!country) return;

    setSelectedCountryIso3(country.iso3);

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
      alert(copy.boundaryMinimum);
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
                value={selectedCountryIso3}
                onChange={(event) => selectCountry(event.target.value)}
                className="rounded-xl border border-white/10 bg-[#071017]/90 px-4 py-3 text-sm font-bold text-white shadow-2xl outline-none backdrop-blur"
              >
                {countries.map((country) => (
                  <option key={country.iso3} value={country.iso3}>
                    {copy.countries[country.iso3] ?? country.name}
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
              {satellite ? copy.satellite : copy.map}
            </button>
          </>
        )}

        {drawingMode && (
          <div className="rounded-xl border border-cyan-400 bg-slate-950/95 px-4 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur">
            {copy.markBoundary}
            <div className="mt-1 text-xs text-slate-400">
              {copy.points}: {boundary.length}
            </div>
          </div>
        )}
      </div>

      {!drawingMode && compactControls && (
        <div className="absolute bottom-4 left-4 z-40 flex items-center gap-3 rounded-lg border border-white/10 bg-[#071017]/85 px-3 py-2 text-[10px] font-semibold text-slate-400 backdrop-blur">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            {copy.critical}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-orange-400" />
            {copy.high}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            {copy.medium}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {copy.low}
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
            {copy.back}
          </button>

          <button
            type="button"
            onClick={clearBoundary}
            disabled={boundary.length === 0}
            className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copy.clear}
          </button>

          <button
            type="button"
            onClick={completeBoundary}
            disabled={boundary.length < 3}
            className="rounded-xl bg-cyan-500 px-5 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copy.completeBoundary}
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
                  aria-label={`${copy.openField} ${project.name}`}
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
                <span>{getLocalizedPriority(hoveredProject.priority, copy)}</span>
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
