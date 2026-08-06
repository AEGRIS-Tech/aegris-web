"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type Analysis = {
  id: number;
  ndvi: number;
  created_at: string;
};

type Props = {
  history: Analysis[];
};

export default function AnalysisChart({ history }: Props) {
  const data = {
    labels: [...history]
      .reverse()
      .map((item) =>
        new Date(item.created_at).toLocaleDateString("cs-CZ")
      ),

    datasets: [
      {
        label: "NDVI",
        data: [...history]
          .reverse()
          .map((item) => item.ndvi),

        borderColor: "#22d3ee",
        backgroundColor: "#22d3ee",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="rounded-2xl bg-slate-900 p-6">
      <h2 className="mb-6 text-2xl font-bold">
        Vývoj NDVI
      </h2>

      <Line data={data} />
    </div>
  );
}