"use client";

import { motion } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <motion.section
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Glow */}
      <div className="absolute h-[700px] w-[700px] rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.4em] text-cyan-400">
          OPERATIONAL INTELLIGENCE PLATFORM
        </p>

        <h1 className="mb-8 text-6xl font-black leading-tight text-white md:text-8xl">
          {t.hero.title}
        </h1>

        <p className="mx-auto mb-12 max-w-3xl text-xl leading-8 text-slate-400">
          {t.hero.subtitle}
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button className="rounded-xl bg-cyan-500 px-8 py-4 font-semibold text-slate-950 transition hover:bg-cyan-400">
            {t.navbar.demo}
          </button>

          <button className="rounded-xl border border-slate-600 px-8 py-4 font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-400">
            {t.navbar.learnMore}
          </button>
        </div>
      </div>
    </motion.section>
  );
}