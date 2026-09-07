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
    <main className="min-h-screen bg-[#05090d] text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
        <section className="relative hidden overflow-hidden border-r border-white/[0.06] bg-[#070c11] lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(103,232,249,0.08),transparent_28%),radial-gradient(circle_at_75%_70%,rgba(34,211,238,0.05),transparent_25%)]" />

          <div className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-10 py-7">
            <div>
              <div className="text-xl font-black tracking-[0.2em] text-white">
                AEGRIS
              </div>
              <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.24em] text-cyan-300/70">
                Agronomic Intelligence
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
              Secure Workspace
            </div>
          </div>

          <div className="relative z-10 flex flex-1 items-center px-10 py-12 xl:px-16">
            <div className="max-w-2xl">
              <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
                Field Intelligence Platform
              </div>

              <h1 className="mt-4 max-w-xl text-5xl font-black tracking-[-0.05em] text-white xl:text-6xl">
                Rozhodování nad stavem pozemků v jednom pracovním prostoru.
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500">
                AEGRIS propojuje satelitní monitoring, meteorologická data a
                rozhodovací logiku do přehledného provozního workflow pro agronoma.
              </p>

              <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
                <FeatureCard
                  label="Monitoring"
                  value="Sentinel-2"
                  detail="Satelitní vegetační stav"
                />
                <FeatureCard
                  label="Decision Engine"
                  value="AEGRIS"
                  detail="Priorita a doporučení"
                />
                <FeatureCard
                  label="Ground Truth"
                  value="Field Validation"
                  detail="Terénní ověření výsledků"
                />
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/[0.06] px-10 py-5 text-[8px] uppercase tracking-[0.12em] text-slate-700">
            Agronomic operations · field intelligence · controlled access
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-[460px]">
            <div className="mb-8 lg:hidden">
              <div className="text-lg font-black tracking-[0.2em] text-white">
                AEGRIS
              </div>
              <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.22em] text-cyan-300/70">
                Agronomic Intelligence
              </div>
            </div>

            <div className="rounded-[26px] border border-white/[0.07] bg-[#0a1016] p-6 shadow-2xl shadow-black/20 sm:p-8">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                Account Access
              </div>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">
                Přihlášení
              </h2>

              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                Přihlaste se do svého pracovního prostoru AEGRIS.
              </p>

              <form
                className="mt-7"
                onSubmit={(event) => {
                  event.preventDefault();
                  void login();
                }}
              >
                <label
                  htmlFor="email"
                  className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500"
                >
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
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#071017] px-4 py-3 text-[11px] text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <div className="mt-5 flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500"
                  >
                    Heslo
                  </label>

                  <Link
                    href="/auth/forgot-password"
                    className="text-[9px] font-bold text-cyan-300 transition hover:text-cyan-200"
                  >
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
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#071017] px-4 py-3 text-[11px] text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                />

                {errorMessage && (
                  <div className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.04] px-4 py-3 text-[10px] leading-5 text-red-300">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-cyan-300 px-5 py-3 text-[10px] font-black text-[#061015] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Přihlašuji..." : "Přihlásit se"}
                </button>
              </form>

              <div className="mt-6 border-t border-white/[0.06] pt-5 text-center text-[10px] text-slate-600">
                Nemáte účet?{" "}
                <Link
                  href="/register"
                  className="font-bold text-cyan-300 transition hover:text-cyan-200"
                >
                  Registrovat
                </Link>
              </div>
            </div>

            <div className="mt-4 text-center text-[8px] uppercase tracking-[0.12em] text-slate-800">
              AEGRIS · Controlled agronomic workspace
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-700">
        {label}
      </div>
      <div className="mt-2 text-sm font-black text-white">{value}</div>
      <div className="mt-1 text-[8px] leading-4 text-slate-600">{detail}</div>
    </div>
  );
}
