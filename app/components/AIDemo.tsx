"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function AIDemo() {
  const { t } = useLanguage();

  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);

  function runAnalysis() {
    setAnalyzing(true);
    setDone(false);

    setTimeout(() => {
      setAnalyzing(false);
      setDone(true);
    }, 3000);
  }

  return (
    <section className="bg-slate-950 py-32 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-14">
          <p className="text-cyan-400 uppercase tracking-[0.4em]">
            {t.aiDemo.eyebrow}
          </p>

          <h2 className="text-5xl font-black text-white mt-4">
            {t.aiDemo.title}
          </h2>

          <p className="text-slate-400 mt-6">
            {t.aiDemo.subtitle}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">

          <div className="border-2 border-dashed border-cyan-500 rounded-2xl p-12 text-center">

            <Upload
              className="mx-auto text-cyan-400 mb-4"
              size={48}
            />

            <h3 className="text-white text-xl font-bold">
              {t.aiDemo.uploadTitle}
            </h3>

            <p className="text-slate-400 mt-3">
              {t.aiDemo.fileTypes}
            </p>

            <button
              onClick={runAnalysis}
              className="mt-8 rounded-xl bg-cyan-500 px-8 py-4 font-bold text-slate-950 hover:bg-cyan-400 transition"
            >
              {t.aiDemo.analyzeButton}
            </button>

          </div>

          {analyzing && (
            <div className="mt-10">

              <p className="text-cyan-400 mb-4">
                {t.aiDemo.analyzing}
              </p>

              <div className="h-3 rounded-full bg-slate-800 overflow-hidden">

                <div className="h-full w-full animate-pulse bg-cyan-500" />

              </div>

            </div>
          )}

          {done && (
            <div className="mt-10 rounded-2xl bg-slate-800 p-8">

              <div className="flex items-center gap-3">

                <CheckCircle
                  className="text-green-400"
                  size={28}
                />

                <h3 className="text-2xl text-white font-bold">
                  {t.aiDemo.complete}
                </h3>

              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-8">

                <div className="rounded-xl bg-slate-900 p-5">
                  <p className="text-slate-400">
                    {t.aiDemo.detectedDamage}
                  </p>
                  <p className="text-red-400 text-xl font-bold">
                    {t.aiDemo.structuralCrack}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900 p-5">
                  <p className="text-slate-400">
                    {t.aiDemo.confidence}
                  </p>
                  <p className="text-cyan-400 text-xl font-bold">
                    98.7%
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900 p-5">
                  <p className="text-slate-400">
                    {t.aiDemo.priority}
                  </p>
                  <p className="text-yellow-400 text-xl font-bold">
                    {t.aiDemo.high}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900 p-5">
                  <p className="text-slate-400">
                    {t.aiDemo.recommendation}
                  </p>
                  <p className="text-white font-semibold">
                    {t.aiDemo.repairWithin30Days}
                  </p>
                </div>

              </div>

              <button className="mt-8 flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-4 font-bold text-slate-950">
                <FileText size={20} />
                {t.aiDemo.downloadReport}
              </button>

            </div>
          )}

        </div>

      </div>
    </section>
  );
}