"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

function getSafeNextPath() {
  if (typeof window === "undefined") return "/dashboard";

  const next = new URLSearchParams(window.location.search).get("next");

  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function login() {
    if (loading) return;

    setErrorMessage("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.user || !data.session) {
        if (error) {
          console.error("LOGIN ERROR:", error);
        }

        setErrorMessage("Neplatný e-mail nebo heslo.");
        return;
      }

      router.replace(getSafeNextPath());
      router.refresh();
    } catch (error) {
      console.error("LOGIN CLIENT ERROR:", error);
      setErrorMessage("Přihlášení se nepodařilo dokončit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-cyan-400">AEGRIS</h1>
          <p className="mt-2 text-slate-400">Přihlášení do systému</p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void login();
          }}
        >
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-300">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            placeholder="vas@email.cz"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            disabled={loading}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400 disabled:opacity-60"
          />

          <div className="mt-4 flex items-center justify-between gap-4">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-300">
              Heslo
            </label>
            <Link href="/auth/forgot-password" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
              Zapomenuté heslo?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="Heslo"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            disabled={loading}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400 disabled:opacity-60"
          />

          {errorMessage && (
            <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Přihlašuji..." : "Přihlásit se"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Nemáte účet?{" "}
          <Link href="/register" className="font-semibold text-cyan-400 hover:text-cyan-300">
            Registrovat
          </Link>
        </div>
      </div>
    </main>
  );
}
