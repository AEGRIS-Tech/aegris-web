"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
        "/auth/reset-password"
      )}`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo }
      );

      if (error) {
        console.error("PASSWORD RECOVERY ERROR:", error);
        setErrorMessage("Odkaz pro obnovu hesla se nepodařilo odeslat.");
        return;
      }

      setSent(true);
    } catch (error) {
      console.error("PASSWORD RECOVERY CLIENT ERROR:", error);
      setErrorMessage("Odkaz pro obnovu hesla se nepodařilo odeslat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-cyan-400">AEGRIS</h1>
          <p className="mt-3 text-slate-400">Obnova hesla</p>
        </div>

        {sent ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              Pokud účet s tímto e-mailem existuje, odeslali jsme odkaz pro nastavení nového hesla.
            </div>
            <Link
              href="/login"
              className="block text-center text-sm font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Zpět na přihlášení
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-300">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
            />

            {errorMessage && (
              <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {loading ? "Odesílám..." : "Poslat odkaz pro obnovu"}
            </button>

            <Link
              href="/login"
              className="mt-5 block text-center text-sm text-slate-400 hover:text-white"
            >
              Zpět na přihlášení
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
