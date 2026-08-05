"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";
import { Activity, Brain, Bell, MapPinned } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

export default function DashboardPreview() {
  const data = {
    labels: ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"],
    datasets: [
      {
        data: [18, 26, 24, 39, 48, 56, 72],
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34,211,238,0.2)",
        fill: true,
        tension: 0.45,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#94a3b8",
        },
      },
      y: {
        grid: {
          color: "#1e293b",
        },
        ticks: {
          color: "#94a3b8",
        },
      },
    },
  };

  return (
    <section className="bg-slate-950 py-28 px-8">
      <div className="max-w-7xl mx-auto">

        <h2 className="text-5xl font-bold text-center mb-4">
          Inteligentní řídicí panel
        </h2>

        <p className="text-center text-slate-400 mb-16">
          Přehled všech dat v reálném čase.
        </p>

        <div className="grid md:grid-cols-4 gap-6 mb-8">

          <div className="bg-slate-900 rounded-2xl p-6">
            <Activity className="text-cyan-400 mb-3" size={30}/>
            <h3 className="text-3xl font-bold">24</h3>
            <p className="text-slate-400">Aktivní projekty</p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6">
            <Brain className="text-green-400 mb-3" size={30}/>
            <h3 className="text-3xl font-bold">1284</h3>
            <p className="text-slate-400">AI analýzy</p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6">
            <Bell className="text-yellow-400 mb-3" size={30}/>
            <h3 className="text-3xl font-bold">17</h3>
            <p className="text-slate-400">Upozornění</p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6">
            <MapPinned className="text-cyan-400 mb-3" size={30}/>
            <h3 className="text-3xl font-bold">356</h3>
            <p className="text-slate-400">Mapových vrstev</p>
          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          <div className="bg-slate-900 rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-6">
              Výkon AI
            </h3>

            <Line data={data} options={options} />
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 flex items-center justify-center">
            <div className="text-center">

              <div className="text-7xl mb-4">
                🗺️
              </div>

              <h3 className="text-2xl font-bold mb-3">
                Interaktivní mapa
              </h3>

              <p className="text-slate-400">
                Zde později připojíme Mapbox a satelitní data.
              </p>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}