"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import BackButton from "../components/BackButton";

const STORAGE_KEY = "aegris.preferences.v1";

type Preferences = {
  language: "Čeština" | "English";
  units: "Metrické" | "Imperiální";
  criticalAlerts: boolean;
  analysisAlerts: boolean;
};

const DEFAULT_PREFERENCES: Preferences = {
  language: "Čeština",
  units: "Metrické",
  criticalAlerts: true,
  analysisAlerts: true,
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!currentUser) {
        router.replace("/login?next=/settings");
        return;
      }

      setUser(currentUser);

      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Preferences>;
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
        }
      } catch (error) {
        console.error("SETTINGS LOAD ERROR:", error);
      }

      setLoading(false);
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [router]);

  function updatePreference<K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) {
    setSaved(false);
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  function savePreferences() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setSaved(true);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Načítám nastavení...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-[1100px] px-6 py-7">
        <BackButton />

        <div className="mb-8 mt-5">
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            AEGRIS / NASTAVENÍ
          </div>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Nastavení</h1>
          <p className="mt-2 text-slate-500">Nastavení účtu a preferencí aplikace.</p>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">Účet</div>
            <h2 className="mt-2 text-xl font-bold">Informace o účtu</h2>
            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Přihlášený uživatel</div>
              <div className="mt-2 font-semibold">{user?.email ?? "—"}</div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">Preference aplikace</div>
            <h2 className="mt-2 text-xl font-bold">Základní nastavení</h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label>
                <span className="text-sm text-slate-400">Jazyk</span>
                <select
                  value={preferences.language}
                  onChange={(event) =>
                    updatePreference("language", event.target.value as Preferences["language"])
                  }
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
                >
                  <option>Čeština</option>
                  <option>English</option>
                </select>
              </label>

              <label>
                <span className="text-sm text-slate-400">Jednotky</span>
                <select
                  value={preferences.units}
                  onChange={(event) =>
                    updatePreference("units", event.target.value as Preferences["units"])
                  }
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
                >
                  <option>Metrické</option>
                  <option>Imperiální</option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">Oznámení</div>
            <h2 className="mt-2 text-xl font-bold">Upozornění</h2>

            <div className="mt-5 space-y-3">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <div>
                  <div className="font-semibold">Kritický stav projektu</div>
                  <div className="mt-1 text-sm text-slate-500">Upozornit při výrazném zhoršení stavu projektu.</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.criticalAlerts}
                  onChange={(event) => updatePreference("criticalAlerts", event.target.checked)}
                  className="h-5 w-5 accent-cyan-400"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <div>
                  <div className="font-semibold">AI analýzy</div>
                  <div className="mt-1 text-sm text-slate-500">Upozornit na nové výsledky AEGRIS analýzy.</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analysisAlerts}
                  onChange={(event) => updatePreference("analysisAlerts", event.target.checked)}
                  className="h-5 w-5 accent-cyan-400"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <button
                type="button"
                onClick={savePreferences}
                className="rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-400"
              >
                Uložit preference
              </button>
              {saved && <span className="text-sm text-emerald-400">Uloženo.</span>}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">Bezpečnost</div>
            <h2 className="mt-2 text-xl font-bold">Účet a bezpečnost</h2>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div>
                <div className="font-semibold">Odhlášení</div>
                <div className="mt-1 text-sm text-slate-500">Ukončit aktuální přihlášení.</div>
              </div>
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-xl border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10"
              >
                Odhlásit se
              </button>
            </div>
          </section>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 text-sm text-slate-500">
            <div className="font-semibold text-slate-300">AEGRIS</div>
            <div className="mt-1">Agriculture Intelligence · MVP</div>
          </div>
        </div>
      </div>
    </main>
  );
}
