"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    checkSession();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* NAVBAR */}
      <header className="border-b border-slate-800 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-wide text-cyan-400"
          >
            AEGRIS
          </Link>

          <nav className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Přejít do aplikace
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl px-5 py-2.5 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Přihlásit se
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Registrovat se
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_35%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center lg:py-32">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-2 text-sm font-semibold text-cyan-400">
              AGRICULTURE INTELLIGENCE
            </div>

            <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Inteligentní rozhodování
              <span className="block text-cyan-400">
                pro moderní zemědělství.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">
              AEGRIS propojuje data o půdě, počasí, porostu
              a zemědělských projektech do jednoho
              inteligentního systému pro podporu rozhodování.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-2xl bg-cyan-500 px-7 py-4 font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Začít používat AEGRIS
              </Link>

              <Link
                href="/login"
                className="rounded-2xl border border-slate-700 bg-slate-900 px-7 py-4 font-bold text-white transition hover:border-cyan-400"
              >
                Přihlásit se
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Chcete si AEGRIS nejdříve vyzkoušet?
            </p>

            <Link
              href="/demo"
              className="mt-2 inline-block text-sm font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Požádat o DEMO →
            </Link>
          </div>

          {/* HERO PANEL */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    AEGRIS Intelligence
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Field Intelligence
                  </h2>
                </div>

                <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400">
                  SYSTEM ONLINE
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-900 p-5">
                  <p className="text-sm text-slate-500">
                    Stav půdy
                  </p>

                  <p className="mt-3 text-3xl font-bold text-cyan-400">
                    OPTIMAL
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-900 p-5">
                  <p className="text-sm text-slate-500">
                    Počasí
                  </p>

                  <p className="mt-3 text-3xl font-bold text-emerald-400">
                    STABILNÍ
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-900 p-5">
                  <p className="text-sm text-slate-500">
                    Monitoring
                  </p>

                  <p className="mt-3 text-3xl font-bold text-yellow-400">
                    ACTIVE
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-900 p-5">
                  <p className="text-sm text-slate-500">
                    AI doporučení
                  </p>

                  <p className="mt-3 text-3xl font-bold text-cyan-400">
                    READY
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-cyan-500/10 bg-cyan-500/[0.03] p-5">
                <p className="text-sm leading-6 text-slate-400">
                  AEGRIS průběžně vyhodnocuje dostupná data
                  a upozorňuje na situace, které mohou
                  vyžadovat pozornost.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-t border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
              Jedna platforma
            </p>

            <h2 className="mt-3 text-4xl font-bold">
              Data, analýza a rozhodování na jednom místě.
            </h2>

            <p className="mt-5 text-slate-400">
              AEGRIS poskytuje jednotné prostředí pro
              monitoring zemědělských projektů a práci
              s analytickými daty.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Feature
              title="AI analýza"
              text="Vyhodnocení dostupných dat a tvorba praktických doporučení pro jednotlivé projekty."
            />

            <Feature
              title="Monitoring půdy"
              text="Sledování parametrů půdy a jejich vývoje v kontextu konkrétního projektu."
            />

            <Feature
              title="Počasí"
              text="Meteorologická data jako součást rozhodování a vyhodnocování podmínek."
            />

            <Feature
              title="NDVI"
              text="Práce s vegetačními daty a historickým vývojem stavu porostu."
            />

            <Feature
              title="Alerty"
              text="Centrální upozornění na události, kterým je potřeba věnovat pozornost."
            />

            <Feature
              title="Projekty"
              text="Každé pole nebo zemědělský projekt má vlastní prostor pro data, analýzy a doporučení."
            />
          </div>
        </div>
      </section>

      {/* DEMO CTA */}
      <section className="border-t border-slate-800">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
            AEGRIS
          </p>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            Chcete AEGRIS vidět v praxi?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Požádejte o demo nebo si vytvořte účet a
            začněte pracovat s vlastními projekty.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/demo"
              className="rounded-2xl bg-cyan-500 px-7 py-4 font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              Požádat o DEMO
            </Link>

            <Link
              href="/register"
              className="rounded-2xl border border-slate-700 bg-slate-900 px-7 py-4 font-bold transition hover:border-cyan-400"
            >
              Registrovat se
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <span>© 2026 AEGRIS</span>

          <span>
            Agriculture Intelligence Platform
          </span>
        </div>
      </footer>
    </main>
  );
}

function Feature({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-500/30">
      <h3 className="text-xl font-bold text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {text}
      </p>
    </div>
  );
}