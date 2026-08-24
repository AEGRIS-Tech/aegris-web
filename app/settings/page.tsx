"use client";

import { useState } from "react";
import BackButton from "../components/BackButton";

export default function SettingsPage() {
  const [language, setLanguage] = useState("Čeština");
  const [units, setUnits] = useState("Metrické");
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [analysisAlerts, setAnalysisAlerts] = useState(true);

  return (
    <main className="min-w-0 flex-1">
      <div className="mx-auto max-w-[1100px] px-6 py-7">
        <BackButton />

        <div className="mt-5 mb-8">
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            AEGRIS / NASTAVENÍ
          </div>

          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
            Nastavení
          </h1>

          <p className="mt-2 text-slate-500">
            Nastavení účtu a preferencí aplikace.
          </p>
        </div>

        <div className="space-y-6">
          {/* Účet */}
          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="mb-5">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
                Účet
              </div>
              <h2 className="mt-2 text-xl font-bold text-white">
                Informace o účtu
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Přihlášený uživatel
              </div>

              <div className="mt-2 text-white">
                Váš aktuální účet
              </div>
            </div>
          </section>

          {/* Preference */}
          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="mb-5">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
                Preference aplikace
              </div>

              <h2 className="mt-2 text-xl font-bold text-white">
                Základní nastavení
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-400">Jazyk</span>

                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option>Čeština</option>
                  <option>English</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-slate-400">Jednotky</span>

                <select
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option>Metrické</option>
                  <option>Imperiální</option>
                </select>
              </label>
            </div>
          </section>

          {/* Oznámení */}
          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="mb-5">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
                Oznámení
              </div>

              <h2 className="mt-2 text-xl font-bold text-white">
                Upozornění
              </h2>
            </div>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <div>
                  <div className="font-semibold text-white">
                    Kritický stav projektu
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Upozornit při výrazném zhoršení stavu projektu.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={criticalAlerts}
                  onChange={(e) => setCriticalAlerts(e.target.checked)}
                  className="h-5 w-5 accent-cyan-400"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <div>
                  <div className="font-semibold text-white">
                    AI analýzy
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Upozornit na nové výsledky AI analýzy.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={analysisAlerts}
                  onChange={(e) => setAnalysisAlerts(e.target.checked)}
                  className="h-5 w-5 accent-cyan-400"
                />
              </label>
            </div>
          </section>

          {/* Bezpečnost */}
          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="mb-5">
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
                Bezpečnost
              </div>

              <h2 className="mt-2 text-xl font-bold text-white">
                Účet a bezpečnost
              </h2>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div>
                <div className="font-semibold text-white">
                  Odhlášení
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  Ukončit aktuální přihlášení.
                </div>
              </div>

              <a
                href="/login"
                className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
              >
                Odhlásit se
              </a>
            </div>
          </section>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 text-sm text-slate-500">
            <div className="font-semibold text-slate-300">AEGRIS</div>
            <div className="mt-1">Agriculture Intelligence · Verze 1.0</div>
          </div>
        </div>
      </div>
    </main>
  );
}