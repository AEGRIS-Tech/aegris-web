"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

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

type PendingInvitation = {
  id: string;
  organization_id: string;
  email: string;
  role: InvitationRole;
  status: string;
  created_at: string;
  expires_at: string;
};

type InvitationsListApiResponse =
  | {
      ok: true;
      organizationId: string;
      currentUserRole: OrganizationRole;
      invitations: PendingInvitation[];
    }
  | {
      ok: false;
      code?: string;
      message?: string;
    };

type InvitationMutationApiResponse =
  | {
      ok: true;
      invitation?: Partial<PendingInvitation> & {
        id: string;
      };
      email_sent?: boolean;
      message?: string;
    }
  | {
      ok: false;
      code?: string;
      message?: string;
    };

type MemberMutationApiResponse =
  | {
      ok: true;
      code?: string;
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

  const [
    pendingInvitations,
    setPendingInvitations,
  ] = useState<PendingInvitation[]>([]);

  const [
    invitationsLoading,
    setInvitationsLoading,
  ] = useState(false);

  const [
    invitationsError,
    setInvitationsError,
  ] = useState<string | null>(null);

  const [
    managingInvitationId,
    setManagingInvitationId,
  ] = useState<string | null>(null);

  const [
    invitationActionError,
    setInvitationActionError,
  ] = useState<string | null>(null);

  const [
    invitationActionSuccess,
    setInvitationActionSuccess,
  ] = useState<string | null>(null);

  const [
    managingMemberId,
    setManagingMemberId,
  ] = useState<string | null>(
    null
  );

  const [
    memberActionError,
    setMemberActionError,
  ] = useState<string | null>(
    null
  );

  const [
    memberActionSuccess,
    setMemberActionSuccess,
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

        if (
          active &&
          (
            membershipResult.data.role === "owner" ||
            membershipResult.data.role === "admin"
          )
        ) {
          setInvitationsLoading(true);
          setInvitationsError(null);

          try {
            const response =
              await fetch(
                "/api/organizations/invitations",
                {
                  method: "GET",
                  cache: "no-store",
                }
              );

            const data =
              (await response.json()) as InvitationsListApiResponse;

            if (!response.ok || !data.ok) {
              throw new Error(
                data.ok === false
                  ? data.message ||
                      "Čekající pozvánky se nepodařilo načíst."
                  : "Čekající pozvánky se nepodařilo načíst."
              );
            }

            if (active) {
              setPendingInvitations(data.invitations);
              setInvitationsError(null);
            }
          } catch (error) {
            console.error(
              "SETTINGS INVITATIONS LOAD ERROR:",
              error
            );

            if (active) {
              setInvitationsError(
                error instanceof Error
                  ? error.message
                  : "Čekající pozvánky se nepodařilo načíst."
              );
            }
          } finally {
            if (active) {
              setInvitationsLoading(false);
            }
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

  async function updateMemberRole(
    member: OrganizationMember,
    role: InvitationRole
  ) {
    if (member.role === role) {
      return;
    }

    setManagingMemberId(member.id);
    setMemberActionError(null);
    setMemberActionSuccess(null);

    try {
      const response = await fetch(
        "/api/organizations/members",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            membershipId: member.id,
            role,
          }),
        }
      );

      const data =
        (await response.json()) as MemberMutationApiResponse;

      if (!response.ok || !data.ok) {
        throw new Error(
          data.ok === false
            ? data.message ||
                "Roli člena se nepodařilo změnit."
            : "Roli člena se nepodařilo změnit."
        );
      }

      setMembers((current) =>
        current.map((currentMember) =>
          currentMember.id === member.id
            ? {
                ...currentMember,
                role,
              }
            : currentMember
        )
      );

      setMemberActionSuccess(
        `Role uživatele ${
          member.email ?? "bez e-mailu"
        } byla změněna na ${getRoleLabel(role)}.`
      );
    } catch (error) {
      console.error(
        "SETTINGS MEMBER ROLE UPDATE ERROR:",
        error
      );

      setMemberActionError(
        error instanceof Error
          ? error.message
          : "Roli člena se nepodařilo změnit."
      );
    } finally {
      setManagingMemberId(null);
    }
  }

  async function removeMember(
    member: OrganizationMember
  ) {
    const confirmed = window.confirm(
      `Opravdu chcete odebrat uživatele ${
        member.email ?? "bez e-mailu"
      } z organizace?`
    );

    if (!confirmed) {
      return;
    }

    setManagingMemberId(member.id);
    setMemberActionError(null);
    setMemberActionSuccess(null);

    try {
      const response = await fetch(
        "/api/organizations/members",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            membershipId: member.id,
          }),
        }
      );

      const data =
        (await response.json()) as MemberMutationApiResponse;

      if (!response.ok || !data.ok) {
        throw new Error(
          data.ok === false
            ? data.message ||
                "Člena se nepodařilo odebrat."
            : "Člena se nepodařilo odebrat."
        );
      }

      setMembers((current) =>
        current.filter(
          (currentMember) =>
            currentMember.id !== member.id
        )
      );

      setMemberActionSuccess(
        `Uživatel ${
          member.email ?? "bez e-mailu"
        } byl z organizace odebrán.`
      );
    } catch (error) {
      console.error(
        "SETTINGS MEMBER REMOVE ERROR:",
        error
      );

      setMemberActionError(
        error instanceof Error
          ? error.message
          : "Člena se nepodařilo odebrat."
      );
    } finally {
      setManagingMemberId(null);
    }
  }

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

      setPendingInvitations(
        (current) => [
          data.invitation,
          ...current.filter(
            (invitation) =>
              invitation.id !== data.invitation.id
          ),
        ]
      );

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

  async function resendInvitation(
    invitation: PendingInvitation
  ) {
    setManagingInvitationId(invitation.id);
    setInvitationActionError(null);
    setInvitationActionSuccess(null);

    try {
      const response = await fetch(
        "/api/organizations/invitations",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invitationId: invitation.id,
          }),
        }
      );

      const data =
        (await response.json()) as InvitationMutationApiResponse;

      if (!response.ok || !data.ok) {
        throw new Error(
          data.ok === false
            ? data.message ||
                "Pozvánku se nepodařilo znovu odeslat."
            : "Pozvánku se nepodařilo znovu odeslat."
        );
      }

      if (data.invitation) {
        setPendingInvitations(
          (current) =>
            current.map(
              (currentInvitation) =>
                currentInvitation.id === invitation.id
                  ? {
                      ...currentInvitation,
                      ...data.invitation,
                    }
                  : currentInvitation
            )
        );
      }

      setInvitationActionSuccess(
        data.message ||
          `Pozvánka pro ${invitation.email} byla znovu odeslána.`
      );
    } catch (error) {
      console.error(
        "SETTINGS INVITATION RESEND ERROR:",
        error
      );

      setInvitationActionError(
        error instanceof Error
          ? error.message
          : "Pozvánku se nepodařilo znovu odeslat."
      );
    } finally {
      setManagingInvitationId(null);
    }
  }

  async function revokeInvitation(
    invitation: PendingInvitation
  ) {
    const confirmed = window.confirm(
      `Opravdu chcete zrušit pozvánku pro ${invitation.email}?`
    );

    if (!confirmed) {
      return;
    }

    setManagingInvitationId(invitation.id);
    setInvitationActionError(null);
    setInvitationActionSuccess(null);

    try {
      const response = await fetch(
        "/api/organizations/invitations",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invitationId: invitation.id,
          }),
        }
      );

      const data =
        (await response.json()) as InvitationMutationApiResponse;

      if (!response.ok || !data.ok) {
        throw new Error(
          data.ok === false
            ? data.message ||
                "Pozvánku se nepodařilo zrušit."
            : "Pozvánku se nepodařilo zrušit."
        );
      }

      setPendingInvitations(
        (current) =>
          current.filter(
            (currentInvitation) =>
              currentInvitation.id !== invitation.id
          )
      );

      setInvitationActionSuccess(
        data.message ||
          `Pozvánka pro ${invitation.email} byla zrušena.`
      );
    } catch (error) {
      console.error(
        "SETTINGS INVITATION REVOKE ERROR:",
        error
      );

      setInvitationActionError(
        error instanceof Error
          ? error.message
          : "Pozvánku se nepodařilo zrušit."
      );
    } finally {
      setManagingInvitationId(null);
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
      <main className="flex min-h-screen items-center justify-center bg-[#05090d] text-slate-500">
        Načítám nastavení...
      </main>
    );
  }

  const canManageMembers =
    organization?.role === "owner" ||
    organization?.role === "admin";

  const navItems = [
    { label: "Operations Center", href: "/dashboard", icon: "◫" },
    { label: "Field Portfolio", href: "/projects", icon: "▦" },
    { label: "Operations Map", href: "/map", icon: "⌖" },
    { label: "Analysis Reports", href: "/reports", icon: "≡" },
    { label: "Settings", href: "/settings", icon: "⚙" },
  ];

  return (
    <main className="min-h-screen bg-[#05090d] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[228px] border-r border-white/[0.06] bg-[#070c11] lg:flex lg:flex-col">
        <div className="border-b border-white/[0.06] px-5 py-5">
          <div className="text-[18px] font-black tracking-[0.18em] text-white">
            AEGRIS
          </div>
          <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.22em] text-cyan-300/70">
            Agronomic Intelligence
          </div>
        </div>

        <nav className="flex-1 px-3 py-5">
          <div className="mb-3 px-3 text-[8px] font-black uppercase tracking-[0.18em] text-slate-700">
            Workspace
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = item.href === "/settings";

              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[10px] font-bold transition ${
                    active
                      ? "border border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-200"
                      : "border border-transparent text-slate-500 hover:bg-white/[0.03] hover:text-slate-300"
                  }`}
                >
                  <span className="w-4 text-center text-[12px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/[0.06] p-4">
          <div className="truncate text-[9px] font-bold text-slate-500">
            {user?.email ?? "—"}
          </div>
          <div className="mt-1 text-[8px] uppercase tracking-[0.12em] text-slate-700">
            {organization ? getRoleLabel(organization.role) : "AEGRIS account"}
          </div>
        </div>
      </aside>

      <div className="lg:pl-[228px]">
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#05090d]/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <div className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-300">
                Account & Organization Control
              </div>
              <div className="mt-0.5 text-[10px] text-slate-600">
                Přístup, tým a lokální preference pracovního prostředí
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-white/[0.07] bg-[#0a1016] px-3 py-2 text-[9px] font-bold text-slate-400 transition hover:border-cyan-300/20 hover:text-cyan-200"
            >
              Operations Center
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8">
          <section className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
                Settings / Workspace Administration
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                Nastavení
              </h1>
              <p className="mt-2 max-w-2xl text-[11px] leading-5 text-slate-500">
                Správa účtu, aktivní organizace, členů týmu, pozvánek a preferencí aplikace.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusChip
                label="Organizace"
                value={organization?.name ?? "Nenačtena"}
              />
              <StatusChip
                label="Role"
                value={organization ? getRoleLabel(organization.role) : "—"}
              />
              <StatusChip
                label="Členové"
                value={String(members.length)}
              />
              {canManageMembers && (
                <StatusChip
                  label="Čekající pozvánky"
                  value={String(pendingInvitations.length)}
                />
              )}
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <section className="rounded-2xl border border-white/[0.07] bg-[#0a1016]">
                <SectionHeader
                  eyebrow="Organization"
                  title="Aktivní organizace"
                  description="Organizace určuje projekty, data a oprávnění, se kterými aktuálně pracujete."
                />

                <div className="p-5">
                  {organization ? (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <InfoCard
                          label="Název organizace"
                          value={organization.name}
                        />
                        <InfoCard
                          label="Vaše role"
                          value={getRoleLabel(organization.role)}
                          detail={getRoleDescription(organization.role)}
                          accent
                        />
                      </div>

                      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                            Organization Members
                          </div>
                          <h3 className="mt-1 text-lg font-black text-white">
                            Členové organizace
                          </h3>
                        </div>
                        <div className="text-[9px] font-bold text-slate-600">
                          {getMemberCountLabel(members.length)}
                        </div>
                      </div>

                      {membersLoading && (
                        <Notice tone="neutral">Načítám členy organizace...</Notice>
                      )}

                      {!membersLoading && membersError && (
                        <Notice tone="error">{membersError}</Notice>
                      )}

                      {!membersLoading && !membersError && members.length === 0 && (
                        <Notice tone="neutral">Organizace zatím nemá žádné členy.</Notice>
                      )}

                      {!membersLoading && !membersError && members.length > 0 && (
                        <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07]">
                          <div className="hidden grid-cols-[minmax(0,1fr)_150px_260px] gap-3 bg-[#071017] px-4 py-2.5 text-[8px] font-black uppercase tracking-[0.12em] text-slate-700 md:grid">
                            <div>Uživatel</div>
                            <div>Role</div>
                            <div className="text-right">Správa</div>
                          </div>

                          {members.map((member) => {
                            const canManageThisMember =
                              !member.isCurrentUser &&
                              (organization.role === "owner"
                                ? member.role !== "owner"
                                : organization.role === "admin" &&
                                  (member.role === "member" || member.role === "viewer"));

                            const memberBusy = managingMemberId === member.id;

                            return (
                              <div
                                key={member.id}
                                className="grid gap-3 border-t border-white/[0.05] px-4 py-3 first:border-t-0 md:grid-cols-[minmax(0,1fr)_150px_260px] md:items-center"
                              >
                                <div className="min-w-0">
                                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                                    <div className="truncate text-[11px] font-bold text-slate-200">
                                      {member.email ?? "E-mail není dostupný"}
                                    </div>
                                    {member.isCurrentUser && (
                                      <span className="rounded-md border border-emerald-300/15 bg-emerald-300/[0.06] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] text-emerald-300">
                                        Vy
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1 text-[8px] text-slate-700">
                                    Členem od {formatDate(member.createdAt)}
                                  </div>
                                </div>

                                <div>
                                  <div className="text-[10px] font-bold text-cyan-200">
                                    {getRoleLabel(member.role)}
                                  </div>
                                  <div className="mt-0.5 text-[8px] text-slate-700">
                                    {getRoleDescription(member.role)}
                                  </div>
                                </div>

                                <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                                  {canManageThisMember ? (
                                    <>
                                      <select
                                        value={member.role}
                                        onChange={(event) =>
                                          void updateMemberRole(
                                            member,
                                            event.target.value as InvitationRole
                                          )
                                        }
                                        disabled={memberBusy}
                                        className="rounded-lg border border-white/[0.08] bg-[#05090d] px-3 py-2 text-[9px] font-bold text-slate-300 outline-none focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        {organization.role === "owner" && (
                                          <option value="admin">Administrátor</option>
                                        )}
                                        <option value="member">Člen</option>
                                        <option value="viewer">Pouze čtení</option>
                                      </select>

                                      <button
                                        type="button"
                                        onClick={() => void removeMember(member)}
                                        disabled={memberBusy}
                                        className="rounded-lg border border-red-400/20 px-3 py-2 text-[9px] font-bold text-red-300 transition hover:bg-red-400/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        {memberBusy ? "Pracuji..." : "Odebrat"}
                                      </button>
                                    </>
                                  ) : (
                                    <span className="rounded-lg border border-white/[0.07] px-3 py-2 text-[8px] font-bold text-slate-600">
                                      Bez změny
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {memberActionError && <Notice tone="error">{memberActionError}</Notice>}
                      {memberActionSuccess && <Notice tone="success">{memberActionSuccess}</Notice>}
                    </>
                  ) : (
                    <Notice tone="error">
                      {organizationError ?? "Organizaci se nepodařilo načíst."}
                    </Notice>
                  )}
                </div>
              </section>

              {organization && (
                <section className="rounded-2xl border border-white/[0.07] bg-[#0a1016]">
                  <SectionHeader
                    eyebrow="Access Management"
                    title="Pozvánky a přístup"
                    description={
                      canManageMembers
                        ? "Pozvěte uživatele do aktivní organizace a spravujte čekající pozvánky."
                        : "Správu členů a pozvánek mohou provádět pouze vlastník nebo administrátor."
                    }
                  />

                  <div className="p-5">
                    {canManageMembers ? (
                      <>
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto]">
                          <input
                            type="email"
                            value={inviteEmail}
                            onChange={(event) => {
                              setInviteEmail(event.target.value);
                              setInviteError(null);
                              setInviteSuccess(null);
                            }}
                            placeholder="uzivatel@example.com"
                            disabled={inviteLoading}
                            className="rounded-xl border border-white/[0.08] bg-[#071017] px-4 py-3 text-[10px] text-white outline-none placeholder:text-slate-700 focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                          />

                          <select
                            value={inviteRole}
                            onChange={(event) => {
                              setInviteRole(event.target.value as InvitationRole);
                              setInviteError(null);
                              setInviteSuccess(null);
                            }}
                            disabled={inviteLoading}
                            className="rounded-xl border border-white/[0.08] bg-[#071017] px-4 py-3 text-[10px] font-bold text-slate-300 outline-none focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="member">Člen</option>
                            <option value="viewer">Pouze čtení</option>
                            {organization.role === "owner" && (
                              <option value="admin">Administrátor</option>
                            )}
                          </select>

                          <button
                            type="button"
                            onClick={() => void submitInvitation()}
                            disabled={inviteLoading}
                            className="rounded-xl bg-cyan-300 px-5 py-3 text-[10px] font-black text-[#061015] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {inviteLoading ? "Vytvářím..." : "Pozvat člena"}
                          </button>
                        </div>

                        <div className="mt-2 text-[8px] text-slate-700">
                          Pozvánka bude odeslána automaticky e-mailem.
                        </div>

                        {inviteError && <Notice tone="error">{inviteError}</Notice>}
                        {inviteSuccess && <Notice tone="success">{inviteSuccess}</Notice>}

                        <div className="mt-6 border-t border-white/[0.06] pt-5">
                          <div className="flex flex-wrap items-end justify-between gap-3">
                            <div>
                              <div className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                                Pending Invitations
                              </div>
                              <h3 className="mt-1 text-lg font-black text-white">
                                Čekající pozvánky
                              </h3>
                            </div>
                            {!invitationsLoading && !invitationsError && (
                              <div className="text-[9px] font-bold text-slate-600">
                                {pendingInvitations.length} čekajících
                              </div>
                            )}
                          </div>

                          {invitationsLoading && (
                            <Notice tone="neutral">Načítám čekající pozvánky...</Notice>
                          )}
                          {!invitationsLoading && invitationsError && (
                            <Notice tone="error">{invitationsError}</Notice>
                          )}
                          {!invitationsLoading &&
                            !invitationsError &&
                            pendingInvitations.length === 0 && (
                              <Notice tone="neutral">Žádné čekající pozvánky.</Notice>
                            )}

                          {!invitationsLoading &&
                            !invitationsError &&
                            pendingInvitations.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {pendingInvitations.map((invitation) => {
                                  const invitationBusy =
                                    managingInvitationId === invitation.id;
                                  const canManageInvitation =
                                    organization.role === "owner" ||
                                    invitation.role !== "admin";

                                  return (
                                    <div
                                      key={invitation.id}
                                      className="flex flex-col justify-between gap-3 rounded-xl border border-white/[0.07] bg-[#071017] p-4 sm:flex-row sm:items-center"
                                    >
                                      <div className="min-w-0">
                                        <div className="truncate text-[11px] font-bold text-slate-200">
                                          {invitation.email}
                                        </div>
                                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[8px] text-slate-700">
                                          <span>{getRoleLabel(invitation.role)}</span>
                                          <span>Vytvořeno {formatDate(invitation.created_at)}</span>
                                          <span>Platí do {formatDate(invitation.expires_at)}</span>
                                        </div>
                                      </div>

                                      {canManageInvitation ? (
                                        <div className="flex flex-wrap gap-2">
                                          <button
                                            type="button"
                                            onClick={() => void resendInvitation(invitation)}
                                            disabled={invitationBusy}
                                            className="rounded-lg border border-cyan-300/20 px-3 py-2 text-[9px] font-bold text-cyan-200 transition hover:bg-cyan-300/[0.05] disabled:cursor-not-allowed disabled:opacity-50"
                                          >
                                            {invitationBusy ? "Pracuji..." : "Odeslat znovu"}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => void revokeInvitation(invitation)}
                                            disabled={invitationBusy}
                                            className="rounded-lg border border-red-400/20 px-3 py-2 text-[9px] font-bold text-red-300 transition hover:bg-red-400/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                                          >
                                            {invitationBusy ? "Pracuji..." : "Zrušit"}
                                          </button>
                                        </div>
                                      ) : (
                                        <span className="rounded-lg border border-white/[0.07] px-3 py-2 text-[8px] font-bold text-slate-600">
                                          Chráněná pozvánka
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                          {invitationActionError && (
                            <Notice tone="error">{invitationActionError}</Notice>
                          )}
                          {invitationActionSuccess && (
                            <Notice tone="success">{invitationActionSuccess}</Notice>
                          )}
                        </div>
                      </>
                    ) : (
                      <Notice tone="neutral">
                        Správu členů mohou provádět pouze vlastník nebo administrátor organizace.
                      </Notice>
                    )}
                  </div>
                </section>
              )}
            </div>

            <div className="space-y-5">
              <section className="rounded-2xl border border-white/[0.07] bg-[#0a1016]">
                <SectionHeader
                  eyebrow="Account"
                  title="Účet"
                  description="Identita aktuálně přihlášeného uživatele."
                />
                <div className="p-5">
                  <InfoCard
                    label="Přihlášený uživatel"
                    value={user?.email ?? "—"}
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-white/[0.07] bg-[#0a1016]">
                <SectionHeader
                  eyebrow="Preferences"
                  title="Preference aplikace"
                  description="Lokální nastavení tohoto prohlížeče."
                />

                <div className="space-y-4 p-5">
                  <label className="block">
                    <span className="text-[9px] font-bold text-slate-500">Jazyk</span>
                    <select
                      value={preferences.language}
                      onChange={(event) =>
                        updatePreference(
                          "language",
                          event.target.value as Preferences["language"]
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#071017] px-4 py-3 text-[10px] font-bold text-slate-300 outline-none focus:border-cyan-300/40"
                    >
                      <option value="Čeština">Čeština</option>
                      <option value="English">English</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-[9px] font-bold text-slate-500">Jednotky</span>
                    <select
                      value={preferences.units}
                      onChange={(event) =>
                        updatePreference(
                          "units",
                          event.target.value as Preferences["units"]
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#071017] px-4 py-3 text-[10px] font-bold text-slate-300 outline-none focus:border-cyan-300/40"
                    >
                      <option value="Metrické">Metrické</option>
                      <option value="Imperiální">Imperiální</option>
                    </select>
                  </label>

                  <div className="border-t border-white/[0.06] pt-4">
                    <div className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-600">
                      Oznámení
                    </div>

                    <PreferenceToggle
                      label="Kritický stav projektu"
                      description="Upozornit při výrazném zhoršení stavu projektu."
                      checked={preferences.criticalAlerts}
                      onChange={(checked) =>
                        updatePreference("criticalAlerts", checked)
                      }
                    />

                    <PreferenceToggle
                      label="Nová AEGRIS analýza"
                      description="Upozornit na nové výsledky uložené analýzy."
                      checked={preferences.analysisAlerts}
                      onChange={(checked) =>
                        updatePreference("analysisAlerts", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={savePreferences}
                      className="rounded-xl bg-cyan-300 px-4 py-2.5 text-[9px] font-black text-[#061015] transition hover:bg-cyan-200"
                    >
                      Uložit preference
                    </button>
                    {saved && (
                      <span className="text-[9px] font-bold text-emerald-300">
                        Uloženo.
                      </span>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-white/[0.07] bg-[#0a1016]">
                <SectionHeader
                  eyebrow="Security"
                  title="Účet a bezpečnost"
                  description="Správa aktuálního přihlášení."
                />
                <div className="p-5">
                  <div className="flex flex-col justify-between gap-3 rounded-xl border border-white/[0.07] bg-[#071017] p-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="text-[10px] font-bold text-slate-300">Odhlášení</div>
                      <div className="mt-1 text-[8px] text-slate-700">
                        Ukončit aktuální přihlášení.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void signOut()}
                      className="rounded-lg border border-red-400/20 px-3 py-2 text-[9px] font-bold text-red-300 transition hover:bg-red-400/[0.06]"
                    >
                      Odhlásit se
                    </button>
                  </div>
                </div>
              </section>

              <div className="rounded-2xl border border-white/[0.06] bg-[#071017] p-4">
                <div className="text-[9px] font-black tracking-[0.16em] text-slate-500">
                  AEGRIS
                </div>
                <div className="mt-1 text-[8px] uppercase tracking-[0.12em] text-slate-700">
                  Agronomic Intelligence Platform
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-white/[0.06] px-5 py-4">
      <div className="text-[8px] font-black uppercase tracking-[0.18em] text-cyan-300">
        {eyebrow}
      </div>
      <h2 className="mt-1 text-lg font-black text-white">{title}</h2>
      <p className="mt-1 text-[9px] leading-4 text-slate-600">{description}</p>
    </div>
  );
}

function InfoCard({
  label,
  value,
  detail,
  accent = false,
}: {
  label: string;
  value: string;
  detail?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#071017] p-4">
      <div className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-700">
        {label}
      </div>
      <div
        className={`mt-1.5 break-words text-[12px] font-black ${
          accent ? "text-cyan-200" : "text-slate-200"
        }`}
      >
        {value}
      </div>
      {detail && <div className="mt-1 text-[8px] text-slate-700">{detail}</div>}
    </div>
  );
}

function StatusChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0a1016] px-3 py-2">
      <div className="text-[7px] font-black uppercase tracking-[0.12em] text-slate-700">
        {label}
      </div>
      <div className="mt-0.5 max-w-[180px] truncate text-[9px] font-bold text-slate-300">
        {value}
      </div>
    </div>
  );
}

function Notice({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "neutral" | "error" | "success";
}) {
  const classes =
    tone === "error"
      ? "border-red-400/15 bg-red-400/[0.04] text-red-300"
      : tone === "success"
        ? "border-emerald-300/15 bg-emerald-300/[0.04] text-emerald-300"
        : "border-white/[0.07] bg-[#071017] text-slate-500";

  return (
    <div className={`mt-3 rounded-xl border px-4 py-3 text-[9px] leading-4 ${classes}`}>
      {children}
    </div>
  );
}

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="mt-3 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-[#071017] p-3">
      <div>
        <div className="text-[9px] font-bold text-slate-300">{label}</div>
        <div className="mt-1 text-[8px] leading-4 text-slate-700">{description}</div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 accent-cyan-300"
      />
    </label>
  );
}
