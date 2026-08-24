"use client";

import Link from "next/link";

export default function AIPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <main className="mx-auto max-w-[1100px] px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-400/40"
        >
          ← Zpět
        </Link>

        <div className="mt-8">
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            AEGRIS / AI ANALÝZA
          </div>

          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
            AI Analýza
          </h1>

          <p className="mt-2 text-slate-500">
            Analýza dat a vyhodnocení stavu vašich projektů.
          </p>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
          <div className="text-4xl">🧠</div>

          <h2 className="mt-5 text-2xl font-bold">
            AI analýza projektu
          </h2>

          <p className="mt-2 max-w-2xl text-slate-500">
            AI analýza se spouští přímo z detailu konkrétního projektu,
            kde má k dispozici jeho data, NDVI, počasí a další kontext.
          </p>

          <Link
            href="/projects"
            className="mt-6 inline-flex rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-400"
          >
            Vybrat projekt
          </Link>
        </section>
      </main>
    </div>
  );
}