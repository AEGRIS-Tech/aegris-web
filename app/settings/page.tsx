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

type OrganizationInfo = {
  id: string;
  name: string;
  role: "owner" | "admin" | "member" | "viewer";
};

const DEFAULT_PREFERENCES: Preferences = {
  language: "Čeština",
  units: "Metrické",
  criticalAlerts: true,
  analysisAlerts: true,
};

function normalizePreferences(value: Partial<Preferences>): Preferences {
  return {
    language: value.language === "English" ? "English" : "Čeština",
    units: value.units === "Imperiální" ? "Imperiální" : "Metrické",
    criticalAlerts:
      typeof value.criticalAlerts === "boolean"
        ? value.criticalAlerts
        : true,
    analysisAlerts:
      typeof value.analysisAlerts === "boolean"
        ? value.analysisAlerts
        : true,
  };
}

function getRoleLabel(role: OrganizationInfo["role"]) {
  switch (role) {
    case "owner":
      return "Vlastník";
    case "admin":
      return "Administrátor";
    case "member":
      return "Člen";
    case "viewer":
      return "Pouze čtení";
    default:
      return role;
  }
}

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [preferences, setPreferences] =
    useState<Preferences>(DEFAULT_PREFERENCES);

  const [saved, setSaved] = useState(false);

  const [organization, setOrganization] =
    useState<OrganizationInfo | null>(null);

  const [organizationError, setOrganizationError] =
    useState<string | null>(null);

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

          setPreferences(normalizePreferences(parsed));
        }
      } catch (error) {
        console.error("SETTINGS LOAD ERROR:", error);
      }

      try {
        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("active_organization_id")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (profileError) {
          console.error(
            "SETTINGS ORGANIZATION PROFILE ERROR:",
            profileError
          );

          if (active) {
            setOrganizationError(
              "Nepodařilo se načíst aktivní organizaci."
            );
          }

          return;
        }

        if (!profile?.active_organization_id) {
          if (active) {
            setOrganizationError(
              "Účet nemá nastavenou aktivní organizaci."
            );
          }

          return;
        }

        const organizationId = profile.active_organization_id;

        const [
          organizationResult,
          membershipResult,
        ] = await Promise.all([
          supabase
            .from("organizations")
            .select("id, name")
            .eq("id", organizationId)
            .maybeSingle(),

          supabase
            .from("organization_members")
            .select("role")
            .eq("organization_id", organizationId)
            .eq("user_id", currentUser.id)
            .maybeSingle(),
        ]);

        if (organizationResult.error) {
          console.error(
            "SETTINGS ORGANIZATION LOAD ERROR:",
            organizationResult.error
          );

          if (active) {
            setOrganizationError(
              "Nepodařilo se načíst organizaci."
            );
          }

          return;
        }

        if (membershipResult.error) {
          console.error(
            "SETTINGS MEMBERSHIP LOAD ERROR:",
            membershipResult.error
          );

          if (active) {
            setOrganizationError(
              "Nepodařilo se načíst členství v organizaci."
            );
          }

          return;
        }

        if (
          !organizationResult.data ||
          !membershipResult.data
        ) {
          if (active) {
            setOrganizationError(
              "Organizace nebo členství nebyly nalezeny."
            );
          }

          return;
        }

        if (active) {
          setOrganization({
            id: organizationResult.data.id,
            name: organizationResult.data.name,
            role: membershipResult.data
              .role as OrganizationInfo["role"],
          });

          setOrganizationError(null);
        }
      } catch (error) {
        console.error(
          "SETTINGS ORGANIZATION ERROR:",
          error
        );

        if (active) {
          setOrganizationError(
            "Při načítání organizace došlo k chybě."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
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

    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function savePreferences() {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(preferences)
    );

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

          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
            Nastavení
          </h1>

          <p className="mt-2 text-slate-500">
            Nastavení účtu, organizace a preferencí aplikace.
          </p>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
              Účet
            </div>

            <h2 className="mt-2 text-xl font-bold">
              Informace o účtu
            </h2>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Přihlášený uživatel
              </div>

              <div className="mt-2 font-semibold">
                {user?.email ?? "—"}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-cyan-500/20 bg-slate-950/60 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
              Organizace
            </div>

            <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  Aktivní organizace
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Organizace určuje projekty, data a oprávnění,
                  se kterými aktuálně pracujete.
                </p>
              </div>
            </div>

            {organization ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Název organizace
                  </div>

                  <div className="mt-2 text-lg font-bold">
                    {organization.name}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Vaše role
                  </div>

                  <div className="mt-2">
                    <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-300">
                      {getRoleLabel(organization.role)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                {organizationError ??
                  "Organizaci se nepodařilo načíst."}
              </div>
            )}

            {organization && (
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
                <div className="font-semibold text-slate-300">
                  Správa členů
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  Pozvánky uživatelů, změna rolí a správa členů
                  budou dostupné v dalším kroku multi-user systému.
                </div>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
              Preference aplikace
            </div>

            <h2 className="mt-2 text-xl font-bold">
              Základní nastavení
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label>
                <span className="text-sm text-slate-400">
                  Jazyk
                </span>

                <select
                  value={preferences.language}
                  onChange={(event) =>
                    updatePreference(
                      "language",
                      event.target
                        .value as Preferences["language"]
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
                >
                  <option value="Čeština">
                    Čeština
                  </option>

                  <option value="English">
                    English
                  </option>
                </select>
              </label>

              <label>
                <span className="text-sm text-slate-400">
                  Jednotky
                </span>

                <select
                  value={preferences.units}
                  onChange={(event) =>
                    updatePreference(
                      "units",
                      event.target
                        .value as Preferences["units"]
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
                >
                  <option value="Metrické">
                    Metrické
                  </option>

                  <option value="Imperiální">
                    Imperiální
                  </option>
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
              Oznámení
            </div>

            <h2 className="mt-2 text-xl font-bold">
              Upozornění
            </h2>

            <div className="mt-5 space-y-3">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <div>
                  <div className="font-semibold">
                    Kritický stav projektu
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    Upozornit při výrazném zhoršení stavu
                    projektu.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={preferences.criticalAlerts}
                  onChange={(event) =>
                    updatePreference(
                      "criticalAlerts",
                      event.target.checked
                    )
                  }
                  className="h-5 w-5 accent-cyan-400"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <div>
                  <div className="font-semibold">
                    AI analýzy
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    Upozornit na nové výsledky AEGRIS
                    analýzy.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={preferences.analysisAlerts}
                  onChange={(event) =>
                    updatePreference(
                      "analysisAlerts",
                      event.target.checked
                    )
                  }
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

              {saved && (
                <span className="text-sm text-emerald-400">
                  Uloženo.
                </span>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
              Bezpečnost
            </div>

            <h2 className="mt-2 text-xl font-bold">
              Účet a bezpečnost
            </h2>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div>
                <div className="font-semibold">
                  Odhlášení
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  Ukončit aktuální přihlášení.
                </div>
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
            <div className="font-semibold text-slate-300">
              AEGRIS
            </div>

            <div className="mt-1">
              Agriculture Intelligence · MVP
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}