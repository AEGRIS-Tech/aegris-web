"use client";

import { useState } from "react";

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
  const [status, setStatus] = useState("Monitoring");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

      <div className="w-[420px] rounded-2xl bg-slate-900 p-8 shadow-2xl">

        <h2 className="mb-6 text-2xl font-bold text-cyan-400">
          Nový projekt
        </h2>

        <label className="mb-2 block text-sm text-slate-400">
          Název projektu
        </label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-5 w-full rounded-xl bg-slate-800 p-3 outline-none"
        />

        <label className="mb-2 block text-sm text-slate-400">
          Status
        </label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mb-6 w-full rounded-xl bg-slate-800 p-3"
        >
          <option>Monitoring</option>
          <option>Aktivní</option>
          <option>Dokončeno</option>
        </select>

        <div className="mb-6 text-sm text-slate-400">
          Latitude: {latitude.toFixed(5)}
          <br />
          Longitude: {longitude.toFixed(5)}
        </div>

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-xl bg-slate-700 px-5 py-2"
          >
            Zrušit
          </button>

          <button
            onClick={() => {
              if (!name.trim()) return;

              onSave({
                name,
                latitude,
                longitude,
                status,
              });

              setName("");
              setStatus("Monitoring");
            }}
            className="rounded-xl bg-cyan-500 px-5 py-2 font-bold text-slate-900"
          >
            Uložit
          </button>

        </div>

      </div>

    </div>
  );
}