"use client";

import Link from "next/link";
import BackButton from "../components/BackButton";

export default function ReportsPage() {
  return (
    <main className="min-w-0 flex-1">
      <div className="mx-auto max-w-[1200px] px-6 py-7">
        <BackButton />

        <div className="mt-5 mb-8">
          <div className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            AEGRIS / REPORTY
          </div>

          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
            Reporty
          </h1>

          <p className="mt-2 text-slate-500">
            Přehled výsledků a historie analýz vašich projektů.
          </p>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-8">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-3xl">
              📄
            </div>

            <h2 className="mt-6 text-2xl font-bold text-white">
              Reporty budou zde
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
              Tato část aplikace je připravena pro přehled výsledků
              AI analýz a následné vytváření reportů jednotlivých projektů.
            </p>

            <Link
              href="/projects"
              className="mt-7 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-500 hover:text-cyan-400"
            >
              Zobrazit projekty
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}