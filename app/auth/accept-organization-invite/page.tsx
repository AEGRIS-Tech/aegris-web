"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { supabase } from "@/lib/supabase";

type AcceptResponse =
  | {
      ok: true;
      organizationId: string;
      role: string;
      alreadyMember: boolean;
    }
  | {
      ok: false;
      code?: string;
      message?: string;
    };

function AcceptOrganizationInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token")?.trim();

    if (!token) {
      setErrorMessage(
        "Pozvánka není platná nebo chybí její token."
      );
      setLoading(false);
      return;
    }

    async function acceptInvitation() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          const loginUrl =
            `/login?next=${encodeURIComponent(
              `/auth/accept-organization-invite?token=${token}`
            )}`;

          router.replace(loginUrl);
          return;
        }

        const response = await fetch(
          "/api/organizations/invitations/accept",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token,
            }),
          }
        );

        const body =
          (await response.json()) as AcceptResponse;

        if (!response.ok || !body.ok) {
          const message =
            !body.ok && body.message
              ? body.message
              : "Pozvánku se nepodařilo přijmout.";

          setErrorMessage(message);
          setLoading(false);
          return;
        }

        router.replace("/dashboard");
        router.refresh();
      } catch (error) {
        console.error(
          "ORGANIZATION INVITE ACCEPT PAGE ERROR:",
          error
        );

        setErrorMessage(
          "Při přijímání pozvánky došlo k neočekávané chybě."
        );
        setLoading(false);
      }
    }

    void acceptInvitation();
  }, [router, searchParams]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="text-4xl font-bold text-cyan-400">
            AEGRIS
          </div>

          <div className="mt-5 text-lg font-semibold">
            Přijímám pozvánku
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Ověřujeme vaše členství v organizaci...
          </p>

          <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-slate-900 p-8 shadow-2xl">
        <div className="text-center">
          <div className="text-4xl font-bold text-cyan-400">
            AEGRIS
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Pozvánku se nepodařilo přijmout
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {errorMessage}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            router.replace("/dashboard");
          }}
          className="mt-7 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
        >
          Přejít na Dashboard
        </button>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="text-4xl font-bold text-cyan-400">
          AEGRIS
        </div>

        <div className="mt-5 text-lg font-semibold">
          Načítám pozvánku
        </div>

        <p className="mt-2 text-sm text-slate-400">
          Připravuji bezpečné přijetí pozvánky...
        </p>

        <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
      </div>
    </main>
  );
}

export default function AcceptOrganizationInvitePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcceptOrganizationInviteContent />
    </Suspense>
  );
}