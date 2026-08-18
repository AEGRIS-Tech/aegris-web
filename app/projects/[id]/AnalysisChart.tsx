"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
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

type HistoryItem = {
  id?: number;
  project_id?: number;
  period_from?: string;
  period_to?: string;
  created_at?: string;
  ndvi: number | null;
};

type Props = {
  history: HistoryItem[];
};

export default function AnalysisChart({ history }: Props) {
  const chartHistory = [...history]
    .filter((item) => item.ndvi !== null)
    .sort((a, b) => {
      const dateA = new Date(
        a.period_from ?? a.created_at ?? 0
      ).getTime();

      const dateB = new Date(
        b.period_from ?? b.created_at ?? 0
      ).getTime();

      return dateA - dateB;
    });

  if (chartHistory.length === 0) {
    return (
      <div className="w-full min-w-0">
        <div className="py-6 text-sm text-slate-400">
          Zatím nejsou k dispozici historická NDVI data.
        </div>
      </div>
    );
  }

  const labels = chartHistory.map((item) => {
    const from = item.period_from ?? item.created_at;

    if (!from) {
      return "-";
    }

    return new Date(from).toLocaleDateString("cs-CZ", {
      day: "2-digit",
      month: "2-digit",
    });
  });

  const ndviData = chartHistory.map((item) => item.ndvi);

  const data: ChartData<"line"> = {
    labels,
    datasets: [
      {
        label: "NDVI",
        data: ndviData,
        borderColor: "#22d3ee",
        backgroundColor: "#22d3ee",
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.2,
        spanGaps: true,
      },
      {
        label: "Kritická hranice 0,20",
        data: labels.map(() => 0.2),
        borderColor: "#ef4444",
        backgroundColor: "transparent",
        borderWidth: 2,
        borderDash: [6, 6],
        pointRadius: 0,
        tension: 0,
      },
      {
        label: "Nízká aktivita 0,35",
        data: labels.map(() => 0.35),
        borderColor: "#f97316",
        backgroundColor: "transparent",
        borderWidth: 2,
        borderDash: [6, 6],
        pointRadius: 0,
        tension: 0,
      },
      {
        label: "Střední aktivita 0,50",
        data: labels.map(() => 0.5),
        borderColor: "#f59e0b",
        backgroundColor: "transparent",
        borderWidth: 2,
        borderDash: [6, 6],
        pointRadius: 0,
        tension: 0,
      },
      {
        label: "Dobrá aktivita 0,65",
        data: labels.map(() => 0.65),
        borderColor: "#22c55e",
        backgroundColor: "transparent",
        borderWidth: 2,
        borderDash: [6, 6],
        pointRadius: 0,
        tension: 0,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    /*
     * DŮLEŽITÉ:
     * Vypínáme automatické resizeování Chart.js.
     *
     * Wrapper má pevnou výšku 225px a CSS řeší šířku.
     * Tím odstraníme resize observer/callback, který může
     * po unmountu pracovat s již neexistujícím canvasem.
     */
    responsive: false,
    maintainAspectRatio: false,

    animation: {
      duration: 0,
    },

    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#ffffff",
          usePointStyle: true,
          pointStyle: "line",
          boxWidth: 34,
          boxHeight: 2,
          padding: 14,
          font: {
            size: 13,
            weight: 600,
          },
        },
      },

      tooltip: {
        callbacks: {
          title: (items) => {
            const index = items[0]?.dataIndex;

            if (
              index === undefined ||
              !chartHistory[index]
            ) {
              return "";
            }

            const item = chartHistory[index];

            const from =
              item.period_from ?? item.created_at;

            if (!from) {
              return "";
            }

            const fromDate =
              new Date(from).toLocaleDateString("cs-CZ");

            if (!item.period_to) {
              return fromDate;
            }

            const toDate =
              new Date(item.period_to).toLocaleDateString(
                "cs-CZ"
              );

            return `${fromDate} – ${toDate}`;
          },

          label: (context) => {
            const value = context.raw;

            if (
              value === null ||
              value === undefined
            ) {
              return "";
            }

            return `NDVI: ${Number(value).toFixed(3)}`;
          },
        },
      },
    },

    scales: {
      x: {
        ticks: {
          color: "#ffffff",
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 14,
          padding: 8,
        },

        grid: {
          color: "rgba(255,255,255,0.08)",
        },
      },

      y: {
        min: 0,
        max: 1,

        ticks: {
          color: "#ffffff",
          stepSize: 0.1,
        },

        grid: {
          color: "rgba(255,255,255,0.08)",
        },
      },
    },
  };

  return (
    <div className="w-full min-w-0 overflow-hidden">
      <div
        className="relative w-full min-w-0 overflow-hidden pb-1"
        style={{
          height: "225px",
        }}
      >
        <Line
          data={data}
          options={options}
          width={900}
          height={225}
        />
      </div>
    </div>
  );
}