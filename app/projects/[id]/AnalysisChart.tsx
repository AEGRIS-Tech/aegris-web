"use client";

type AnalysisHistoryItem = {
  id: number;
  project_id: number;
  period_from?: string | null;
  period_to?: string | null;
  ndvi: number;
  created_at: string;
};

type Props = {
  history: AnalysisHistoryItem[];
};

type ChartPoint = {
  id: number;
  date: string;
  fullDate: string;
  ndvi: number;
};

function getDate(item: AnalysisHistoryItem) {
  return (
    item.period_from ??
    item.period_to ??
    item.created_at
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatShortDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("cs-CZ", {
    day: "2-digit",
    month: "2-digit",
  });
}

const scrollbarStyles = `
  .aegris-ndvi-scroll::-webkit-scrollbar {
    height: 7px;
  }

  .aegris-ndvi-scroll::-webkit-scrollbar-track {
    background: #061022;
    border-radius: 9999px;
  }

  .aegris-ndvi-scroll::-webkit-scrollbar-thumb {
    background: rgba(6, 182, 212, 0.35);
    border-radius: 9999px;
    border: 1px solid rgba(6, 182, 212, 0.12);
  }

  .aegris-ndvi-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(6, 182, 212, 0.65);
  }

  .aegris-ndvi-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(6, 182, 212, 0.45) #061022;
  }
`;

export default function AnalysisChart({
  history,
}: Props) {
  const chartData: ChartPoint[] = history
    .map((item) => {
      const ndvi = Number(item.ndvi);
      const date = getDate(item);

      if (!Number.isFinite(ndvi) || !date) {
        return null;
      }

      return {
        id: item.id,
        date: formatShortDate(date),
        fullDate: formatDate(date),
        ndvi,
      };
    })
    .filter(
      (item): item is ChartPoint =>
        item !== null
    );

  if (chartData.length === 0) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border border-slate-800 bg-[#061022]">
        <div className="text-center">
          <div className="text-xs font-bold text-slate-400">
            Zatím nejsou k dispozici data NDVI
          </div>

          <div className="mt-1 text-[10px] text-slate-600">
            Graf se zobrazí po provedení první analýzy.
          </div>
        </div>
      </div>
    );
  }

  const pointWidth = 120;

  const chartWidth =
    chartData.length <= 6
      ? 600
      : chartData.length * pointWidth;

  const height = 250;

  const padding = {
    top: 15,
    right: 25,
    bottom: 35,
    left: 42,
  };

  const plotWidth =
    chartWidth -
    padding.left -
    padding.right;

  const plotHeight =
    height -
    padding.top -
    padding.bottom;

  const getX = (index: number) => {
    if (chartData.length === 1) {
      return (
        padding.left +
        plotWidth / 2
      );
    }

    return (
      padding.left +
      (index / (chartData.length - 1)) *
        plotWidth
    );
  };

  const getY = (ndvi: number) => {
    const value = Math.max(
      0,
      Math.min(1, ndvi)
    );

    return (
      padding.top +
      (1 - value) * plotHeight
    );
  };

  const points = chartData.map(
    (item, index) => ({
      ...item,
      x: getX(index),
      y: getY(item.ndvi),
    })
  );

  const linePath = points
    .map((point, index) =>
      index === 0
        ? `M ${point.x} ${point.y}`
        : `L ${point.x} ${point.y}`
    )
    .join(" ");

  const thresholds = [
    {
      value: 0.2,
      stroke: "#ef4444",
    },
    {
      value: 0.35,
      stroke: "#f97316",
    },
    {
      value: 0.5,
      stroke: "#eab308",
    },
    {
      value: 0.65,
      stroke: "#22c55e",
    },
  ];

  return (
    <div className="flex h-full min-h-[280px] w-full flex-col">
      <style>{scrollbarStyles}</style>

      <div className="aegris-ndvi-scroll min-h-0 flex-1 overflow-x-auto overflow-y-hidden rounded-lg border border-slate-800 bg-[#061022]">
        <div
          style={{
            width: `${chartWidth}px`,
            minWidth: "100%",
            height: `${height}px`,
          }}
        >
          <svg
            width={chartWidth}
            height={height}
            viewBox={`0 0 ${chartWidth} ${height}`}
            role="img"
            aria-label="Vývoj NDVI v čase"
          >
            {/* Mřížka */}
            {[0, 0.2, 0.35, 0.5, 0.65, 0.8, 1].map(
              (value) => {
                const y = getY(value);

                return (
                  <g key={`grid-${value}`}>
                    <line
                      x1={padding.left}
                      x2={
                        chartWidth -
                        padding.right
                      }
                      y1={y}
                      y2={y}
                      stroke="#1e293b"
                      strokeWidth="1"
                    />

                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="9"
                    >
                      {value.toFixed(2)}
                    </text>
                  </g>
                );
              }
            )}

            {/* Referenční hranice */}
            {thresholds.map((threshold) => {
              const y = getY(
                threshold.value
              );

              return (
                <line
                  key={`threshold-${threshold.value}`}
                  x1={padding.left}
                  x2={
                    chartWidth -
                    padding.right
                  }
                  y1={y}
                  y2={y}
                  stroke={threshold.stroke}
                  strokeWidth="1"
                  strokeDasharray="5 5"
                  opacity="0.65"
                />
              );
            })}

            {/* Osa X */}
            <line
              x1={padding.left}
              x2={
                chartWidth -
                padding.right
              }
              y1={
                height -
                padding.bottom
              }
              y2={
                height -
                padding.bottom
              }
              stroke="#334155"
              strokeWidth="1"
            />

            {/* NDVI křivka */}
            <path
              d={linePath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Body */}
            {points.map((point, index) => (
              <g
                key={`point-${point.id}-${index}`}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#06b6d4"
                  stroke="#071225"
                  strokeWidth="3"
                >
                  <title>
                    {point.fullDate} — NDVI{" "}
                    {point.ndvi.toFixed(3)}
                  </title>
                </circle>
              </g>
            ))}

            {/* Datum */}
            {points.map((point, index) => (
              <text
                key={`date-${point.id}-${index}`}
                x={point.x}
                y={
                  height -
                  padding.bottom +
                  20
                }
                textAnchor="middle"
                fill="#64748b"
                fontSize="9"
              >
                {point.date}
              </text>
            ))}
          </svg>
        </div>
      </div>

      {/* Nápověda při delší historii */}
      {chartData.length > 6 && (
        <div className="mt-2 flex items-center justify-center gap-2 text-[9px] text-slate-600">
          <span className="text-cyan-500/50">
            ←
          </span>

          <span>
            Posuňte graf vodorovně pro zobrazení celé historie
          </span>

          <span className="text-cyan-500/50">
            →
          </span>
        </div>
      )}

      {/* Legenda */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[8px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-px w-3 bg-red-500" />
          Kritická hranice 0,20
        </span>

        <span className="flex items-center gap-1">
          <span className="h-px w-3 bg-orange-500" />
          Nízká aktivita 0,35
        </span>

        <span className="flex items-center gap-1">
          <span className="h-px w-3 bg-yellow-500" />
          Střední aktivita 0,50
        </span>

        <span className="flex items-center gap-1">
          <span className="h-px w-3 bg-green-500" />
          Dobrá aktivita 0,65
        </span>
      </div>
    </div>
  );
}