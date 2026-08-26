"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AcceptInvitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    let timeoutId: number | null = null;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (
        session &&
        (event === "SIGNED_IN" ||
          event === "INITIAL_SESSION" ||
          event === "PASSWORD_RECOVERY")
      ) {
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
          timeoutId = null;
        }
        setLoading(false);
      }
    });

    async function initializeSession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!active) return;

      if (error) {
        console.error("DEMO SESSION ERROR:", error);
        setErrorMessage("Pozvánku se nepodařilo ověřit.");
        setLoading(false);
        return;
      }

      if (session) {
        setLoading(false);
        return;
      }

      timeoutId = window.setTimeout(() => {
        if (!active) return;
        setErrorMessage("Pozvánka je neplatná nebo již vypršela.");
        setLoading(false);
      }, 5000);
    }

    void initializeSession();

    return () => {
      active = false;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  async function handleSetPassword() {
    if (saving) return;

    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("Heslo musí mít alespoň 8 znaků.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Hesla se neshodují.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("DEMO SESSION CHECK ERROR:", sessionError);
        setErrorMessage(
          "Přihlášení z pozvánky se nepodařilo dokončit. Otevřete prosím aktivační odkaz znovu."
        );
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        console.error("DEMO PASSWORD UPDATE ERROR:", updateError);
        setErrorMessage("Heslo se nepodařilo nastavit.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("DEMO ACCEPT CLIENT ERROR:", error);
      setErrorMessage("Nepodařilo se dokončit DEMO účet.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-slate-400">Ověřuji DEMO účet...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-cyan-400">AEGRIS</h1>
          <p className="mt-3 text-slate-400">Dokončení DEMO účtu</p>
        </div>

        {errorMessage && !password && !confirmPassword ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
            {errorMessage}
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm leading-6 text-slate-400">
              Nastavte si heslo pro přístup do vašeho AEGRIS DEMO účtu.
            </p>

            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-300">
              Nové heslo
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Minimálně 8 znaků"
              disabled={saving}
              minLength={8}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400 disabled:opacity-50"
            />

            <label htmlFor="confirmPassword" className="mb-2 mt-4 block text-sm font-semibold text-slate-300">
              Potvrzení hesla
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Zopakujte heslo"
              disabled={saving}
              minLength={8}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400 disabled:opacity-50"
            />

            {errorMessage && (
              <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={() => void handleSetPassword()}
              disabled={saving}
              className="mt-6 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Nastavuji účet..." : "Dokončit DEMO účet"}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
