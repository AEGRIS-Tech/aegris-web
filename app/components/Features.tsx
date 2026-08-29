"use client";

import { useLanguage } from "../context/LanguageContext";

export default function Features() {
  const { t } = useLanguage();

  const features = t.features.items;

  return (
    <section className="bg-slate-900 py-24 px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 text-center text-5xl font-bold text-white">
          {t.features.title}
        </h2>

        <p className="mx-auto mb-16 max-w-2xl text-center text-slate-400">
          {t.features.subtitle}
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-slate-700 bg-slate-800 p-8 transition duration-300 hover:-translate-y-2 hover:border-cyan-400"
            >
              <div className="mb-6 text-5xl">{feature.icon}</div>

              <h3 className="mb-4 text-2xl font-bold text-cyan-400">
                {feature.title}
              </h3>

              <p className="text-slate-300 leading-7">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}