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

type OrganizationRole =
  | "owner"
  | "admin"
  | "member"
  | "viewer";

type InvitationRole =
  | "admin"
  | "member"
  | "viewer";

type OrganizationInfo = {
  id: string;
  name: string;
  role: OrganizationRole;
};

type OrganizationMember = {
  id: string;
  userId: string;
  email: string | null;
  role: OrganizationRole;
  createdAt: string;
  isCurrentUser: boolean;
};

type MembersApiResponse =
  | {
      ok: true;
      organizationId: string;
      currentUserRole: OrganizationRole;
      members: OrganizationMember[];
    }
  | {
      ok: false;
      code?: string;
      message?: string;
    };

type InvitationApiResponse =
  | {
      ok: true;
      invitation: {
        id: string;
        organization_id: string;
        email: string;
        role: InvitationRole;
        status: string;
        created_at: string;
        expires_at: string;
      };
      email_sent: boolean;
      message?: string;
    }
  | {
      ok: false;
      code?: string;
      message?: string;
    };

const DEFAULT_PREFERENCES: Preferences = {
  language: "Čeština",
  units: "Metrické",
  criticalAlerts: true,
  analysisAlerts: true,
};

function normalizePreferences(
  value: Record<string, unknown>
): Preferences {
  const rawLanguage = value.language;
  const rawUnits = value.units;

  return {
    language:
      rawLanguage === "English"
        ? "English"
        : "Čeština",

    units:
      rawUnits === "Imperiální" ||
      rawUnits === "ImperiĂˇlnĂ"
        ? "Imperiální"
        : "Metrické",

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

function getRoleLabel(
  role: OrganizationRole
) {
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

function getRoleDescription(
  role: OrganizationRole
) {
  switch (role) {
    case "owner":
      return "Plná správa organizace";

    case "admin":
      return "Správa organizace a členů";

    case "member":
      return "Práce s projekty a daty";

    case "viewer":
      return "Přístup pouze pro čtení";

    default:
      return "";
  }
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "cs-CZ",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  ).format(date);
}

function getMemberCountLabel(
  count: number
) {
  if (count === 1) {
    return "1 člen";
  }

  if (
    count >= 2 &&
    count <= 4
  ) {
    return `${count} členové`;
  }

  return `${count} členů`;
}

export default function SettingsPage() {
  const router = useRouter();

  const [
    user,
    setUser,
  ] = useState<User | null>(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    preferences,
    setPreferences,
  ] = useState<Preferences>(
    DEFAULT_PREFERENCES
  );

  const [
    saved,
    setSaved,
  ] = useState(false);

  const [
    organization,
    setOrganization,
  ] = useState<OrganizationInfo | null>(
    null
  );

  const [
    organizationError,
    setOrganizationError,
  ] = useState<string | null>(
    null
  );

  const [
    members,
    setMembers,
  ] = useState<
    OrganizationMember[]
  >([]);

  const [
    membersLoading,
    setMembersLoading,
  ] = useState(false);

  const [
    membersError,
    setMembersError,
  ] = useState<string | null>(
    null
  );

  const [
    inviteEmail,
    setInviteEmail,
  ] = useState("");

  const [
    inviteRole,
    setInviteRole,
  ] = useState<InvitationRole>(
    "member"
  );

  const [
    inviteLoading,
    setInviteLoading,
  ] = useState(false);

  const [
    inviteError,
    setInviteError,
  ] = useState<string | null>(
    null
  );

  const [
    inviteSuccess,
    setInviteSuccess,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    let active = true;

    async function initialize() {
      const {
        data: {
          user: currentUser,
        },
      } =
        await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (!currentUser) {
        router.replace(
          "/login?next=/settings"
        );

        return;
      }

      setUser(currentUser);

      /*
       * Lokální preference.
       */
      try {
        const raw =
          window.localStorage.getItem(
            STORAGE_KEY
          );

        if (raw) {
          const parsed =
            JSON.parse(
              raw
            ) as Record<
              string,
              unknown
            >;

          setPreferences(
            normalizePreferences(
              parsed
            )
          );
        }
      } catch (error) {
        console.error(
          "SETTINGS LOAD ERROR:",
          error
        );
      }

      /*
       * Aktivní organizace a role
       * přihlášeného uživatele.
       */
      try {
        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "active_organization_id"
          )
          .eq(
            "id",
            currentUser.id
          )
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

        if (
          !profile?.active_organization_id
        ) {
          if (active) {
            setOrganizationError(
              "Účet nemá nastavenou aktivní organizaci."
            );
          }

          return;
        }

        const organizationId =
          profile.active_organization_id;

        const [
          organizationResult,
          membershipResult,
        ] =
          await Promise.all([
            supabase
              .from(
                "organizations"
              )
              .select(
                "id, name"
              )
              .eq(
                "id",
                organizationId
              )
              .maybeSingle(),

            supabase
              .from(
                "organization_members"
              )
              .select("role")
              .eq(
                "organization_id",
                organizationId
              )
              .eq(
                "user_id",
                currentUser.id
              )
              .maybeSingle(),
          ]);

        if (
          organizationResult.error
        ) {
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

        if (
          membershipResult.error
        ) {
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
            id:
              organizationResult
                .data.id,

            name:
              organizationResult
                .data.name,

            role:
              membershipResult
                .data
                .role as OrganizationRole,
          });

          setOrganizationError(
            null
          );
        }

        /*
         * Členové organizace se načítají
         * přes zabezpečený serverový endpoint.
         */
        if (active) {
          setMembersLoading(
            true
          );

          setMembersError(
            null
          );
        }

        try {
          const response =
            await fetch(
              "/api/organizations/members",
              {
                method: "GET",
                cache:
                  "no-store",
              }
            );

          const data =
            (await response.json()) as MembersApiResponse;

          if (
            !response.ok ||
            !data.ok
          ) {
            const message =
              data.ok === false
                ? data.message
                : null;

            throw new Error(
              message ||
                "Členy organizace se nepodařilo načíst."
            );
          }

          if (active) {
            setMembers(
              data.members
            );

            setMembersError(
              null
            );
          }
        } catch (error) {
          console.error(
            "SETTINGS MEMBERS LOAD ERROR:",
            error
          );

          if (active) {
            setMembersError(
              error instanceof Error
                ? error.message
                : "Členy organizace se nepodařilo načíst."
            );
          }
        } finally {
          if (active) {
            setMembersLoading(
              false
            );
          }
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

  async function submitInvitation() {
    const email =
      inviteEmail.trim();

    if (!email) {
      setInviteError(
        "Zadejte e-mail uživatele."
      );

      setInviteSuccess(null);

      return;
    }

    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const response =
        await fetch(
          "/api/organizations/invitations",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
              role: inviteRole,
            }),
          }
        );

      const data =
        (await response.json()) as InvitationApiResponse;

      if (
        !response.ok ||
        !data.ok
      ) {
        const message =
          data.ok === false
            ? data.message
            : null;

        throw new Error(
          message ||
            "Pozvánku se nepodařilo vytvořit."
        );
      }

      setInviteEmail("");

      setInviteSuccess(
        data.email_sent
          ? `Pozvánka pro ${data.invitation.email} byla vytvořena a odeslána e-mailem.`
          : `Pozvánka pro ${data.invitation.email} byla vytvořena, ale e-mail se nepodařilo odeslat.`
      );
    } catch (error) {
      console.error(
        "SETTINGS INVITATION ERROR:",
        error
      );

      setInviteError(
        error instanceof Error
          ? error.message
          : "Pozvánku se nepodařilo vytvořit."
      );
    } finally {
      setInviteLoading(false);
    }
  }

  function updatePreference<
    K extends keyof Preferences,
  >(
    key: K,
    value: Preferences[K]
  ) {
    setSaved(false);

    setPreferences(
      (current) => ({
        ...current,
        [key]: value,
      })
    );
  }

  function savePreferences() {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        preferences
      )
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

  const canManageMembers =
    organization?.role ===
      "owner" ||
    organization?.role ===
      "admin";

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
            Nastavení účtu,
            organizace a preferencí
            aplikace.
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
                {user?.email ??
                  "—"}
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
                  Organizace určuje
                  projekty, data a
                  oprávnění, se kterými
                  aktuálně pracujete.
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
                    {
                      organization.name
                    }
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Vaše role
                  </div>

                  <div className="mt-2">
                    <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-300">
                      {getRoleLabel(
                        organization.role
                      )}
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
              <div className="mt-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">
                      Členové organizace
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Uživatelé, kteří
                      mají přístup k této
                      organizaci.
                    </p>
                  </div>

                  <div className="text-sm text-slate-500">
                    {getMemberCountLabel(
                      members.length
                    )}
                  </div>
                </div>

                {membersLoading && (
                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-400">
                    Načítám členy
                    organizace...
                  </div>
                )}

                {!membersLoading &&
                  membersError && (
                    <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                      {
                        membersError
                      }
                    </div>
                  )}

                {!membersLoading &&
                  !membersError &&
                  members.length ===
                    0 && (
                    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-400">
                      Organizace zatím
                      nemá žádné členy.
                    </div>
                  )}

                {!membersLoading &&
                  !membersError &&
                  members.length >
                    0 && (
                    <div className="mt-4 space-y-3">
                      {members.map(
                        (
                          member
                        ) => (
                          <div
                            key={
                              member.id
                            }
                            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="truncate font-semibold text-slate-100">
                                  {member.email ??
                                    "E-mail není dostupný"}
                                </div>

                                {member.isCurrentUser && (
                                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                                    Vy
                                  </span>
                                )}
                              </div>

                              <div className="mt-1 text-xs text-slate-500">
                                Členem od{" "}
                                {formatDate(
                                  member.createdAt
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-300">
                                {getRoleLabel(
                                  member.role
                                )}
                              </span>

                              <div className="mt-1 text-xs text-slate-500">
                                {getRoleDescription(
                                  member.role
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                {canManageMembers ? (
                  <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                    <div className="font-semibold text-cyan-200">
                      Správa členů
                    </div>

                    <div className="mt-1 text-sm text-slate-400">
                      Pozvěte dalšího
                      uživatele do aktivní
                      organizace.
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
                      <input
                        type="email"
                        value={
                          inviteEmail
                        }
                        onChange={(
                          event
                        ) => {
                          setInviteEmail(
                            event
                              .target
                              .value
                          );

                          setInviteError(
                            null
                          );

                          setInviteSuccess(
                            null
                          );
                        }}
                        placeholder="uzivatel@example.com"
                        disabled={
                          inviteLoading
                        }
                        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                      />

                      <select
                        value={
                          inviteRole
                        }
                        onChange={(
                          event
                        ) => {
                          setInviteRole(
                            event
                              .target
                              .value as InvitationRole
                          );

                          setInviteError(
                            null
                          );

                          setInviteSuccess(
                            null
                          );
                        }}
                        disabled={
                          inviteLoading
                        }
                        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="member">
                          Člen
                        </option>

                        <option value="viewer">
                          Pouze čtení
                        </option>

                        <option value="admin">
                          Administrátor
                        </option>
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          void submitInvitation()
                        }
                        disabled={
                          inviteLoading
                        }
                        className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {inviteLoading
                          ? "Vytvářím..."
                          : "Pozvat člena"}
                      </button>
                    </div>

                    {inviteError && (
                      <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                        {
                          inviteError
                        }
                      </div>
                    )}

                    {inviteSuccess && (
                      <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
                        {
                          inviteSuccess
                        }
                      </div>
                    )}

                    <div className="mt-3 text-xs text-slate-500">
                      Pozvánka bude odeslána automaticky e-mailem.
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
                    <div className="font-semibold text-slate-300">
                      Správa členů
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      Správu členů mohou
                      provádět pouze
                      vlastník nebo
                      administrátor
                      organizace.
                    </div>
                  </div>
                )}
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
                  value={
                    preferences.language
                  }
                  onChange={(
                    event
                  ) =>
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
                  value={
                    preferences.units
                  }
                  onChange={(
                    event
                  ) =>
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
                    Kritický stav
                    projektu
                  </div>

                  <div className="mt-1 text-sm text-slate-500">
                    Upozornit při
                    výrazném zhoršení
                    stavu projektu.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={
                    preferences.criticalAlerts
                  }
                  onChange={(
                    event
                  ) =>
                    updatePreference(
                      "criticalAlerts",
                      event.target
                        .checked
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
                    Upozornit na nové
                    výsledky AEGRIS
                    analýzy.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={
                    preferences.analysisAlerts
                  }
                  onChange={(
                    event
                  ) =>
                    updatePreference(
                      "analysisAlerts",
                      event.target
                        .checked
                    )
                  }
                  className="h-5 w-5 accent-cyan-400"
                />
              </label>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <button
                type="button"
                onClick={
                  savePreferences
                }
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
                  Ukončit aktuální
                  přihlášení.
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  void signOut()
                }
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
              Agriculture Intelligence ·
              MVP
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}