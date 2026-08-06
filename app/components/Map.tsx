"use client";

import { motion } from "framer-motion";

export default function Map() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

      <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="mb-4 uppercase tracking-[0.35em] text-cyan-400">
            Global Coverage
          </p>

          <h2 className="mb-6 text-5xl font-black text-white md:text-6xl">
            Infrastructure Intelligence
          </h2>

          <p className="mx-auto mb-20 max-w-3xl text-lg text-slate-400">
            Monitor critical infrastructure anywhere on Earth using
            AI-powered satellite intelligence.
          </p>
        </motion.div>

        {/* Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto flex h-[600px] w-full max-w-6xl items-center justify-center overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-900"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#06b6d420,transparent_70%)]" />

          <h3 className="z-10 text-3xl font-bold text-cyan-300">
            🌍 Interactive World Map
          </h3>

          {/* Animated markers */}
          <motion.div
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute left-[30%] top-[35%] h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_25px_#22d3ee]"
          />

          <motion.div
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="absolute left-[60%] top-[45%] h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_25px_#22d3ee]"
          />

          <motion.div
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute left-[45%] top-[65%] h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_25px_#22d3ee]"
          />
        </motion.div>
      </div>
    </section>
  );
}