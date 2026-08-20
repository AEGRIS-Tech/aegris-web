"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AcceptInvitePage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function initializeInvite() {
      setErrorMessage("");

      const code = new URLSearchParams(window.location.search).get("code");

      if (code) {
        const { error } =
          await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error(
            "INVITE CODE ERROR:",
            error
          );

          setErrorMessage(
            "Pozvánka je neplatná nebo již vypršela."
          );

          setLoading(false);
          return;
        }
      }

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.error(
          "INVITE SESSION ERROR:",
          error
        );

        setErrorMessage(
          "Pozvánka je neplatná nebo již vypršela."
        );
      }

      setLoading(false);
    }

    initializeInvite();
  }, []);

  async function handleSetPassword() {
    if (saving) return;

    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage(
        "Heslo musí mít alespoň 8 znaků."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "Hesla se neshodují."
      );
      return;
    }

    setSaving(true);

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    if (error) {
      console.error(
        "SET PASSWORD ERROR:",
        error
      );

      setErrorMessage(
        "Heslo se nepodařilo nastavit."
      );

      setSaving(false);
      return;
    }

    router.replace("/dashboard");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-slate-400">
          Ověřuji pozvánku...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-cyan-400">
            AEGRIS
          </h1>

          <p className="mt-3 text-slate-400">
            Dokončení DEMO účtu
          </p>
        </div>

        {errorMessage ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
            {errorMessage}
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm leading-6 text-slate-400">
              Nastavte si heslo pro přístup do vašeho AEGRIS DEMO účtu.
            </p>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Nové heslo
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="new-password"
                placeholder="Minimálně 8 znaků"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-slate-300"
              >
                Potvrzení hesla
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                placeholder="Zopakujte heslo"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="button"
              onClick={handleSetPassword}
              disabled={saving}
              className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Nastavuji účet..."
                : "Dokončit DEMO účet"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}