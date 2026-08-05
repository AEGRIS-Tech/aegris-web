"use client";

import { Database, BrainCircuit, ShieldCheck } from "lucide-react";

export default function Platform() {
  const items = [
    {
      icon: <Database size={36} />,
      title: "Centrální data",
      text: "Všechna firemní data na jednom bezpečném místě.",
    },
    {
      icon: <BrainCircuit size={36} />,
      title: "AI Analýza",
      text: "Automatická analýza a doporučení v reálném čase.",
    },
    {
      icon: <ShieldCheck size={36} />,
      title: "Bezpečnost",
      text: "Moderní šifrování a řízení přístupových práv.",
    },
  ];

  return (
    <section className="bg-slate-950 py-28 px-8">
      <div className="max-w-7xl mx-auto">

        <h2 className="text-5xl font-bold text-center mb-5">
          Jedna platforma.
          <span className="text-cyan-400"> Nekonečné možnosti.</span>
        </h2>

        <p className="text-center text-slate-400 max-w-3xl mx-auto mb-20">
          AEGRIS propojuje data, umělou inteligenci a automatizaci do
          jednoho systému připraveného pro firmy budoucnosti.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-8 hover:border-cyan-400 transition"
            >
              <div className="text-cyan-400 mb-6">
                {item.icon}
              </div>

              <h3 className="text-2xl font-bold mb-4">
                {item.title}
              </h3>

              <p className="text-slate-400 leading-7">
                {item.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}