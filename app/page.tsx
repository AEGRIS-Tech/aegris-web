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
    <main className="min-h-screen overflow-hidden bg-[#05090d] text-slate-100">
      <header className="relative z-50 border-b border-white/[0.06] bg-[#05090d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="group">
            <div className="text-lg font-black tracking-[0.2em] text-white">
              AEGRIS
            </div>
            <div className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.22em] text-cyan-300/60">
              Agronomic Intelligence
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-cyan-300 px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.08em] text-[#061015] transition hover:bg-cyan-200"
              >
                Otevřít AEGRIS
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-xl px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.08em] text-slate-400 transition hover:bg-white/[0.04] hover:text-white sm:block"
                >
                  Přihlásit se
                </Link>
                <Link
                  href="/demo"
                  className="rounded-xl border border-white/[0.09] bg-white/[0.03] px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.08em] text-white transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.04]"
                >
                  Pilotní přístup
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[12%] top-[10%] h-[420px] w-[420px] rounded-full bg-cyan-300/[0.035] blur-[120px]" />
          <div className="absolute right-[-8%] top-[20%] h-[520px] w-[520px] rounded-full bg-emerald-300/[0.025] blur-[140px]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        <div className="relative mx-auto grid max-w-[1500px] gap-14 px-5 pb-20 pt-20 sm:px-8 sm:pt-24 lg:grid-cols-[minmax(0,1.08fr)_minmax(480px,0.92fr)] lg:items-center lg:px-10 lg:pb-28 lg:pt-28">
          <div className="max-w-[820px]">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-cyan-300/70" />
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
                Field Intelligence · Czech Agriculture
              </span>
            </div>

            <h1 className="mt-7 text-[clamp(3.3rem,6.4vw,6.8rem)] font-black leading-[0.91] tracking-[-0.065em] text-white">
              Data z pole.
              <span className="block text-slate-500">Rozhodnutí včas.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
              AEGRIS propojuje satelitní monitoring, meteorologická data,
              agronomický kontext a terénní ověření do jednoho pracovního
              systému pro rozhodování nad stavem pozemků.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-cyan-300 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#061015] transition hover:bg-cyan-200"
                >
                  Přejít do aplikace
                </Link>
              ) : (
                <>
                  <Link
                    href="/demo"
                    className="rounded-xl bg-cyan-300 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#061015] transition hover:bg-cyan-200"
                  >
                    Požádat o pilotní přístup
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-xl border border-white/[0.09] bg-white/[0.025] px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.08em] text-white transition hover:border-white/[0.16] hover:bg-white/[0.05]"
                  >
                    Přihlásit se
                  </Link>
                </>
              )}
            </div>

            <div className="mt-12 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-4">
              <Signal label="Satellite" value="Sentinel-2 L2A" />
              <Signal label="Resolution" value="10 m" />
              <Signal label="Decision" value="Rule-based" />
              <Signal label="Validation" value="Ground Truth" />
            </div>
          </div>

          <SystemPanel />
        </div>
      </section>

      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                Agronomic Workflow
              </div>
              <h2 className="mt-4 max-w-md text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl">
                Od signálu k ověřenému rozhodnutí.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
                Ne další izolovaný graf. AEGRIS skládá dostupné vstupy do
                pracovního toku, ve kterém agronom vidí, co vyžaduje pozornost
                a proč.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2">
              <WorkflowStep
                index="01"
                title="Monitor"
                text="Sentinel-2 L2A sleduje vegetační stav a historický vývoj pozemku."
              />
              <WorkflowStep
                index="02"
                title="Evaluate"
                text="Počasí, půda, plodina a vegetační data vstupují do deterministického Decision Engine."
              />
              <WorkflowStep
                index="03"
                title="Prioritize"
                text="Výsledek převádí stav pozemku na skóre, prioritu, alert a konkrétní doporučení."
              />
              <WorkflowStep
                index="04"
                title="Validate"
                text="Agronom ověří situaci v terénu a uloží Ground Truth k přesné analýze."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.06] bg-[#070c11]">
        <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                One Field Record
              </div>
              <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl">
                Jeden pozemek. Jeden kontext. Jedna historie rozhodování.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-500">
              Field Health Record drží aktuální stav, zdroje dat, doporučení,
              alerty i terénní validaci pohromadě.
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-[24px] border border-white/[0.07] bg-[#0a1016] p-5 sm:p-7">
              <div className="flex flex-col gap-5 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-600">
                    Field Health Record
                  </div>
                  <div className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">
                    Stav pozemku v souvislostech
                  </div>
                </div>
                <div className="w-fit rounded-lg border border-red-300/15 bg-red-300/[0.04] px-3 py-2 text-[8px] font-black uppercase tracking-[0.12em] text-red-300">
                  Kritická priorita
                </div>
              </div>

              <div className="grid gap-px overflow-hidden rounded-xl bg-white/[0.05] sm:grid-cols-4">
                <Metric label="NDVI" value="0.664" note="Vegetation index" />
                <Metric label="AEGRIS score" value="59/100" note="Context score" />
                <Metric label="Certainty" value="83%" note="Data confidence" />
                <Metric label="Coverage" value="100%" note="Valid geometry" />
              </div>

              <div className="mt-5 rounded-xl border border-white/[0.06] bg-[#071017] p-5">
                <div className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-600">
                  Decision Engine
                </div>
                <div className="mt-2 text-sm font-black text-white">
                  Signál → kontext → priorita → doporučení
                </div>
                <p className="mt-2 text-[10px] leading-5 text-slate-500">
                  Výsledek je dohledatelný ke konkrétní analýze a vstupnímu
                  snapshotu. Terénní ověření se ukládá zpět jako Ground Truth.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <ProofCard
                eyebrow="Data provenance"
                title="Dohledatelný původ analýzy"
                text="Zdroj, čas, prostorové pokrytí a kvalita vstupů zůstávají součástí analytického záznamu."
              />
              <ProofCard
                eyebrow="Field validation"
                title="Terén uzavírá smyčku"
                text="Výsledek nekončí u upozornění. Agronom může potvrdit nebo vyvrátit stav přímo proti konkrétní analýze."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.06]">
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-28">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
              Designed for Trust
            </div>
            <h2 className="mt-4 max-w-lg text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl">
              Rozhodovací systém, ne černá skříňka.
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Principle
              title="Deterministická logika"
              text="Decision Engine pracuje s explicitními faktory a verzovanými pravidly."
            />
            <Principle
              title="Historický kontext"
              text="Analýza drží vstupní snapshot i výsledek, aby bylo možné zpětně dohledat, z čeho rozhodnutí vzniklo."
            />
            <Principle
              title="Agronomická validace"
              text="Ground Truth propojuje digitální výsledek se skutečným stavem zjištěným v terénu."
            />
            <Principle
              title="Český provozní kontext"
              text="Katalog plodin a odrůd vychází z oficiálních českých dat a je napojený na agronomické profily."
            />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/[0.025] blur-[130px]" />
        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 lg:py-32">
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
            Controlled Pilot 2026
          </div>
          <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">
            Ověřte AEGRIS na vlastních pozemcích.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500">
            Pilotní provoz je určen pro reálné zemědělské podniky, které chtějí
            porovnat analytické výstupy AEGRIS s rozhodováním agronoma v terénu.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/demo"
              className="rounded-xl bg-cyan-300 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#061015] transition hover:bg-cyan-200"
            >
              Požádat o pilotní přístup
            </Link>
            {!user && (
              <Link
                href="/register"
                className="rounded-xl border border-white/[0.09] bg-white/[0.025] px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.08em] text-white transition hover:border-white/[0.16] hover:bg-white/[0.05]"
              >
                Vytvořit účet
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] bg-[#05090d]">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <div className="text-sm font-black tracking-[0.18em] text-white">
              AEGRIS
            </div>
            <div className="mt-1 text-[7px] uppercase tracking-[0.16em] text-slate-700">
              Agronomic Intelligence
            </div>
          </div>
          <div className="text-[8px] uppercase tracking-[0.12em] text-slate-700">
            © 2026 AEGRIS · Field intelligence for agronomic decisions
          </div>
        </div>
      </footer>
    </main>
  );
}

function SystemPanel() {
  return (
    <div className="relative mx-auto w-full max-w-[620px]">
      <div className="absolute -inset-10 bg-cyan-300/[0.025] blur-[80px]" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0a1016] shadow-2xl shadow-black/30">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div>
            <div className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-600">
              AEGRIS / Field Intelligence
            </div>
            <div className="mt-1 text-xs font-black text-white">
              Agronomic Operations
            </div>
          </div>
          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.12em] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Data ready
          </div>
        </div>

        <div className="grid gap-px bg-white/[0.05] sm:grid-cols-2">
          <PanelCell label="Satellite layer" value="Sentinel-2 L2A" meta="10 m · NDVI history" />
          <PanelCell label="Weather context" value="Current + forecast" meta="Water · temperature · ET₀" />
          <PanelCell label="Decision layer" value="AEGRIS Engine" meta="Score · priority · recommendation" />
          <PanelCell label="Field feedback" value="Ground Truth" meta="Observed cause · validation" />
        </div>

        <div className="p-5">
          <div className="rounded-2xl border border-white/[0.06] bg-[#071017] p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-600">
                Decision flow
              </div>
              <div className="text-[8px] uppercase tracking-[0.1em] text-slate-700">
                Traceable output
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              {["MONITOR", "EVALUATE", "PRIORITIZE", "VALIDATE"].map(
                (item, index) => (
                  <div key={item} className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="h-1 rounded-full bg-cyan-300/70" />
                      <div className="mt-2 truncate text-[7px] font-black tracking-[0.08em] text-slate-500">
                        {item}
                      </div>
                    </div>
                    {index < 3 && (
                      <span className="mb-4 text-[8px] text-slate-800">→</span>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Signal({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#080e13] px-4 py-4">
      <div className="text-[7px] font-black uppercase tracking-[0.13em] text-slate-700">
        {label}
      </div>
      <div className="mt-1.5 text-[10px] font-black text-slate-300">{value}</div>
    </div>
  );
}

function PanelCell({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta: string;
}) {
  return (
    <div className="bg-[#0a1016] p-5">
      <div className="text-[7px] font-black uppercase tracking-[0.14em] text-slate-700">
        {label}
      </div>
      <div className="mt-2 text-sm font-black text-white">{value}</div>
      <div className="mt-1 text-[8px] leading-4 text-slate-600">{meta}</div>
    </div>
  );
}

function WorkflowStep({
  index,
  title,
  text,
}: {
  index: string;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-[#080e13] p-6 sm:p-7">
      <div className="text-[8px] font-black tracking-[0.14em] text-cyan-300/60">
        {index}
      </div>
      <h3 className="mt-5 text-xl font-black tracking-[-0.02em] text-white">
        {title}
      </h3>
      <p className="mt-3 text-[10px] leading-5 text-slate-500">{text}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="bg-[#071017] p-4">
      <div className="text-[7px] font-black uppercase tracking-[0.12em] text-slate-700">
        {label}
      </div>
      <div className="mt-2 text-xl font-black text-white">{value}</div>
      <div className="mt-1 text-[7px] text-slate-700">{note}</div>
    </div>
  );
}

function ProofCard({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/[0.07] bg-[#0a1016] p-6">
      <div className="text-[7px] font-black uppercase tracking-[0.15em] text-cyan-300/70">
        {eyebrow}
      </div>
      <h3 className="mt-3 text-lg font-black text-white">{title}</h3>
      <p className="mt-2 text-[10px] leading-5 text-slate-500">{text}</p>
    </div>
  );
}

function Principle({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
        <div>
          <h3 className="text-sm font-black text-white">{title}</h3>
          <p className="mt-2 text-[10px] leading-5 text-slate-500">{text}</p>
        </div>
      </div>
    </div>
  );
}
