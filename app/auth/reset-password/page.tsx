"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error || !data.session) {
        setErrorMessage("Odkaz pro obnovu hesla je neplatný nebo vypršel.");
      }

      setChecking(false);
    });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error("PASSWORD UPDATE ERROR:", error);
        setErrorMessage("Nové heslo se nepodařilo uložit.");
        return;
      }

      await supabase.auth.signOut();
      router.replace("/login?reset=success");
    } catch (error) {
      console.error("PASSWORD UPDATE CLIENT ERROR:", error);
      setErrorMessage("Nové heslo se nepodařilo uložit.");
    } finally {
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Ověřuji odkaz pro obnovu hesla...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-cyan-400">AEGRIS</h1>
          <p className="mt-3 text-slate-400">Nastavení nového hesla</p>
        </div>

        {errorMessage && !saving && !password && !confirmPassword ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
              {errorMessage}
            </div>
            <Link href="/auth/forgot-password" className="block text-center text-sm font-semibold text-cyan-400">
              Poslat nový odkaz
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-300">
              Nové heslo
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
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
              required
              minLength={8}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
            />

            {errorMessage && (
              <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-6 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {saving ? "Ukládám..." : "Nastavit nové heslo"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
