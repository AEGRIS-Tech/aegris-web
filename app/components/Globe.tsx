"use client";

import dynamic from "next/dynamic";

const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
});

export default function GlobeSection() {
  return (
    <section className="bg-slate-950 py-24">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-16 text-center">
          <p className="mb-3 uppercase tracking-[0.35em] text-cyan-400">
            Global Coverage
          </p>

          <h2 className="text-5xl font-black text-white">
            Planetary Infrastructure
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-slate-400">
            Monitor assets, infrastructure and satellite intelligence
            anywhere in the world.
          </p>
        </div>

        <div className="flex justify-center">
          <Globe
            width={900}
            height={650}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          />
        </div>

      </div>
    </section>
  );
}