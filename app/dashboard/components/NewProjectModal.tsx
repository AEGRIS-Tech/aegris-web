"use client";

import { useState } from "react";

import WorldMap from "./WorldMap";

type BoundaryPoint = {
  latitude: number;
  longitude: number;
};

type Props = {
  open: boolean;
  latitude: number;
  longitude: number;
  onClose: () => void;
  onSave: (project: {
    name: string;
    latitude: number;
    longitude: number;
    status: string;
    boundary: BoundaryPoint[];
  }) => void;
};

export default function NewProjectModal({
  open,
  latitude,
  longitude,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [status, setStatus] =
    useState("Monitoring");

  const [address, setAddress] =
    useState("");

  const [mapLatitude, setMapLatitude] =
    useState(latitude);

  const [mapLongitude, setMapLongitude] =
    useState(longitude);

  const [boundary, setBoundary] =
    useState<BoundaryPoint[]>([]);

  const [searching, setSearching] =
    useState(false);

  const [locationFound, setLocationFound] =
    useState(false);

  const [boundaryCompleted, setBoundaryCompleted] =
    useState(false);

  if (!open) return null;

  async function findLocation() {
    const query = address.trim();

    if (!query) {
      alert("Zadej adresu nebo PSČ.");
      return;
    }

    setSearching(true);
    setLocationFound(false);
    setBoundaryCompleted(false);
    setBoundary([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=cz,sk,de,at,pl&addressdetails=1&q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Accept:
              "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Geokódovací služba neodpověděla."
        );
      }

      const results = await response.json();

      if (
        !Array.isArray(results) ||
        results.length === 0
      ) {
        alert(
          "Místo se nepodařilo najít. Zkus přesnější adresu nebo PSČ."
        );
        return;
      }

      const result = results[0];

      const foundLatitude = Number(
        result.lat
      );

      const foundLongitude = Number(
        result.lon
      );

      if (
        !Number.isFinite(foundLatitude) ||
        !Number.isFinite(foundLongitude)
      ) {
        alert(
          "Nalezené místo nemá platné souřadnice."
        );
        return;
      }

      setMapLatitude(foundLatitude);
      setMapLongitude(foundLongitude);
      setLocationFound(true);
    } catch (error) {
      console.error(
        "CHYBA VYHLEDÁNÍ LOKALITY:",
        error
      );

      alert(
        "Místo se nepodařilo vyhledat."
      );
    } finally {
      setSearching(false);
    }
  }

  function handleBoundaryChange(
    nextBoundary: BoundaryPoint[]
  ) {
    setBoundary(nextBoundary);
    setBoundaryCompleted(false);
  }

  function handleBoundaryComplete(
    completedBoundary: BoundaryPoint[]
  ) {
    if (completedBoundary.length < 3) {
      return;
    }

    setBoundary(completedBoundary);
    setBoundaryCompleted(true);
  }

  function calculateCenter(
    points: BoundaryPoint[]
  ) {
    if (points.length === 0) {
      return {
        latitude: mapLatitude,
        longitude: mapLongitude,
      };
    }

    const latitude =
      points.reduce(
        (sum, point) =>
          sum + point.latitude,
        0
      ) / points.length;

    const longitude =
      points.reduce(
        (sum, point) =>
          sum + point.longitude,
        0
      ) / points.length;

    return {
      latitude,
      longitude,
    };
  }

  function handleSave() {
    if (!name.trim()) {
      alert(
        "Zadej název projektu."
      );
      return;
    }

    if (!locationFound) {
      alert(
        "Nejdříve vyhledej místo."
      );
      return;
    }

    if (boundary.length < 3) {
      alert(
        "Označ alespoň 3 body hranice pozemku."
      );
      return;
    }

    if (!boundaryCompleted) {
      alert(
        "Nejdříve dokonči hranici pozemku."
      );
      return;
    }

    const center =
      calculateCenter(boundary);

    onSave({
      name: name.trim(),
      latitude: center.latitude,
      longitude: center.longitude,
      status,
      boundary,
    });

    setName("");
    setStatus("Monitoring");
    setAddress("");
    setBoundary([]);
    setLocationFound(false);
    setBoundaryCompleted(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* ================================================= */}
        {/* HLAVIČKA */}
        {/* ================================================= */}

        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400">
              Nový projekt
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Najdi pozemek a označ jeho hranici
              na satelitní mapě.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* ================================================= */}
        {/* OBSAH */}
        {/* ================================================= */}

        <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          {/* ================================================= */}
          {/* LEVÁ STRANA */}
          {/* ================================================= */}

          <div className="space-y-5">
            {/* NÁZEV */}

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Název projektu
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="Např. Pole sever"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            {/* ADRESA */}

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Adresa nebo PSČ
              </label>

              <div className="flex gap-2">
                <input
                  value={address}
                  onChange={(event) =>
                    setAddress(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();
                      findLocation();
                    }
                  }}
                  placeholder="Např. 841 01"
                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none transition focus:border-cyan-400"
                />

                <button
                  type="button"
                  onClick={findLocation}
                  disabled={searching}
                  className="rounded-xl bg-cyan-500 px-4 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {searching
                    ? "..."
                    : "🔍"}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Zadej adresu, obec nebo PSČ.
              </p>
            </div>

            {/* STAV VYHLEDÁNÍ */}

            {locationFound && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="font-semibold text-emerald-400">
                  ✓ Místo nalezeno
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  Teď klikáním označ rohy
                  sledovaného pozemku.
                </div>
              </div>
            )}

            {/* STAV HRANICE */}

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="text-sm text-slate-400">
                Hranice pozemku
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-slate-300">
                  Počet bodů
                </span>

                <span className="font-bold text-cyan-400">
                  {boundary.length}
                </span>
              </div>

              {boundaryCompleted && (
                <div className="mt-3 font-semibold text-emerald-400">
                  ✓ Hranice dokončena
                </div>
              )}
            </div>

            {/* STATUS */}

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none"
              >
                <option value="Monitoring">
                  Monitoring
                </option>

                <option value="Aktivní">
                  Aktivní
                </option>

                <option value="Dokončeno">
                  Dokončeno
                </option>
              </select>
            </div>
          </div>

          {/* ================================================= */}
          {/* MAPA */}
          {/* ================================================= */}

          <div className="min-h-[500px] overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
            <WorldMap
              drawingMode={locationFound}
              focusLatitude={mapLatitude}
              focusLongitude={mapLongitude}
              onBoundaryChange={
                handleBoundaryChange
              }
              onBoundaryComplete={
                handleBoundaryComplete
              }
              onMapClick={() => {}}
            />
          </div>
        </div>

        {/* ================================================= */}
        {/* PATIČKA */}
        {/* ================================================= */}

        <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-700 px-5 py-2 text-white transition hover:bg-slate-600"
          >
            Zrušit
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-cyan-500 px-5 py-2 font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            ✓ Vytvořit projekt
          </button>
        </div>
      </div>
    </div>
  );
}