"use client";

import CountUp from "react-countup";

export default function Stats() {
  const stats = [
    { value: 150, suffix: "+", label: "Klientů" },
    { value: 1.2, suffix: "M", decimals: 1, label: "Analyzovaných dat" },
    { value: 98, suffix: "%", label: "Přesnost AI" },
    { value: 24, suffix: "/7", label: "Monitoring" },
  ];

  return (
    <section className="bg-slate-950 py-24">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">

        {stats.map((item) => (
          <div key={item.label}>
            <h2 className="text-5xl font-bold text-cyan-400 mb-3">
              <CountUp
                end={item.value}
                duration={2.5}
                decimals={item.decimals ?? 0}
              />
              {item.suffix}
            </h2>

            <p className="text-slate-400">
              {item.label}
            </p>
          </div>
        ))}

      </div>
    </section>
  );
}