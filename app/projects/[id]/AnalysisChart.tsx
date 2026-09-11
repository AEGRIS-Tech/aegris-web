"use client";

import { useLanguage } from "../../context/LanguageContext";

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

function formatDate(value: string, locale: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatShortDate(value: string, locale: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
  });
}

function getAnalysisChartCopy(language: string) {
  const copies = {
    cs: {
      noData: "Zatím nejsou k dispozici data NDVI",
      noDataHint: "Graf se zobrazí po provedení první analýzy.",
      ariaLabel: "Vývoj NDVI v čase",
      scrollHint: "Posuňte graf vodorovně pro zobrazení celé historie",
      criticalThreshold: "Kritická hranice 0,20",
      lowActivity: "Nízká aktivita 0,35",
      mediumActivity: "Střední aktivita 0,50",
      goodActivity: "Dobrá aktivita 0,65",
    },
    en: {
      noData: "No NDVI data is available yet",
      noDataHint: "The chart will appear after the first analysis is completed.",
      ariaLabel: "NDVI development over time",
      scrollHint: "Scroll horizontally to view the full history",
      criticalThreshold: "Critical threshold 0.20",
      lowActivity: "Low activity 0.35",
      mediumActivity: "Medium activity 0.50",
      goodActivity: "Good activity 0.65",
    },
    sk: {
      noData: "Zatiaľ nie sú k dispozícii údaje NDVI",
      noDataHint: "Graf sa zobrazí po vykonaní prvej analýzy.",
      ariaLabel: "Vývoj NDVI v čase",
      scrollHint: "Posuňte graf vodorovne pre zobrazenie celej histórie",
      criticalThreshold: "Kritická hranica 0,20",
      lowActivity: "Nízka aktivita 0,35",
      mediumActivity: "Stredná aktivita 0,50",
      goodActivity: "Dobrá aktivita 0,65",
    },
    de: {
      noData: "Noch keine NDVI-Daten verfügbar",
      noDataHint: "Das Diagramm erscheint nach Abschluss der ersten Analyse.",
      ariaLabel: "NDVI-Entwicklung im Zeitverlauf",
      scrollHint: "Horizontal scrollen, um den gesamten Verlauf anzuzeigen",
      criticalThreshold: "Kritischer Schwellenwert 0,20",
      lowActivity: "Geringe Aktivität 0,35",
      mediumActivity: "Mittlere Aktivität 0,50",
      goodActivity: "Gute Aktivität 0,65",
    },
    pl: {
      noData: "Brak jeszcze danych NDVI",
      noDataHint: "Wykres pojawi się po zakończeniu pierwszej analizy.",
      ariaLabel: "Zmiany NDVI w czasie",
      scrollHint: "Przewiń poziomo, aby zobaczyć całą historię",
      criticalThreshold: "Próg krytyczny 0,20",
      lowActivity: "Niska aktywność 0,35",
      mediumActivity: "Średnia aktywność 0,50",
      goodActivity: "Dobra aktywność 0,65",
    },
    fr: {
      noData: "Aucune donnée NDVI disponible pour le moment",
      noDataHint: "Le graphique apparaîtra après la première analyse.",
      ariaLabel: "Évolution du NDVI dans le temps",
      scrollHint: "Faites défiler horizontalement pour voir tout l’historique",
      criticalThreshold: "Seuil critique 0,20",
      lowActivity: "Faible activité 0,35",
      mediumActivity: "Activité moyenne 0,50",
      goodActivity: "Bonne activité 0,65",
    },
    es: {
      noData: "Aún no hay datos NDVI disponibles",
      noDataHint: "El gráfico aparecerá después de completar el primer análisis.",
      ariaLabel: "Evolución del NDVI a lo largo del tiempo",
      scrollHint: "Desplácese horizontalmente para ver todo el historial",
      criticalThreshold: "Umbral crítico 0,20",
      lowActivity: "Actividad baja 0,35",
      mediumActivity: "Actividad media 0,50",
      goodActivity: "Actividad buena 0,65",
    },
    it: {
      noData: "Non sono ancora disponibili dati NDVI",
      noDataHint: "Il grafico apparirà dopo il completamento della prima analisi.",
      ariaLabel: "Andamento dell’NDVI nel tempo",
      scrollHint: "Scorri orizzontalmente per visualizzare l’intera cronologia",
      criticalThreshold: "Soglia critica 0,20",
      lowActivity: "Attività bassa 0,35",
      mediumActivity: "Attività media 0,50",
      goodActivity: "Attività buona 0,65",
    },
    nl: {
      noData: "Er zijn nog geen NDVI-gegevens beschikbaar",
      noDataHint: "De grafiek verschijnt nadat de eerste analyse is voltooid.",
      ariaLabel: "NDVI-ontwikkeling in de tijd",
      scrollHint: "Scroll horizontaal om de volledige historie te bekijken",
      criticalThreshold: "Kritieke drempel 0,20",
      lowActivity: "Lage activiteit 0,35",
      mediumActivity: "Gemiddelde activiteit 0,50",
      goodActivity: "Goede activiteit 0,65",
    },
    pt: {
      noData: "Ainda não existem dados NDVI disponíveis",
      noDataHint: "O gráfico aparecerá após a conclusão da primeira análise.",
      ariaLabel: "Evolução do NDVI ao longo do tempo",
      scrollHint: "Desloque horizontalmente para ver todo o histórico",
      criticalThreshold: "Limite crítico 0,20",
      lowActivity: "Atividade baixa 0,35",
      mediumActivity: "Atividade média 0,50",
      goodActivity: "Boa atividade 0,65",
    },
    ro: {
      noData: "Nu sunt încă disponibile date NDVI",
      noDataHint: "Graficul va apărea după finalizarea primei analize.",
      ariaLabel: "Evoluția NDVI în timp",
      scrollHint: "Derulați orizontal pentru a vedea întregul istoric",
      criticalThreshold: "Prag critic 0,20",
      lowActivity: "Activitate scăzută 0,35",
      mediumActivity: "Activitate medie 0,50",
      goodActivity: "Activitate bună 0,65",
    },
    hu: {
      noData: "Még nem állnak rendelkezésre NDVI-adatok",
      noDataHint: "A diagram az első elemzés befejezése után jelenik meg.",
      ariaLabel: "Az NDVI alakulása az idő függvényében",
      scrollHint: "Görgessen vízszintesen a teljes előzmény megtekintéséhez",
      criticalThreshold: "Kritikus küszöb 0,20",
      lowActivity: "Alacsony aktivitás 0,35",
      mediumActivity: "Közepes aktivitás 0,50",
      goodActivity: "Jó aktivitás 0,65",
    },
    uk: {
      noData: "Дані NDVI поки що недоступні",
      noDataHint: "Графік з’явиться після завершення першого аналізу.",
      ariaLabel: "Динаміка NDVI у часі",
      scrollHint: "Прокрутіть горизонтально, щоб переглянути всю історію",
      criticalThreshold: "Критичний поріг 0,20",
      lowActivity: "Низька активність 0,35",
      mediumActivity: "Середня активність 0,50",
      goodActivity: "Добра активність 0,65",
    },
    bg: {
      noData: "Все още няма налични NDVI данни",
      noDataHint: "Графиката ще се появи след приключване на първия анализ.",
      ariaLabel: "Развитие на NDVI във времето",
      scrollHint: "Превъртете хоризонтално, за да видите цялата история",
      criticalThreshold: "Критичен праг 0,20",
      lowActivity: "Ниска активност 0,35",
      mediumActivity: "Средна активност 0,50",
      goodActivity: "Добра активност 0,65",
    },
    hr: {
      noData: "NDVI podaci još nisu dostupni",
      noDataHint: "Grafikon će se prikazati nakon završetka prve analize.",
      ariaLabel: "Razvoj NDVI-ja kroz vrijeme",
      scrollHint: "Pomaknite vodoravno za prikaz cijele povijesti",
      criticalThreshold: "Kritični prag 0,20",
      lowActivity: "Niska aktivnost 0,35",
      mediumActivity: "Srednja aktivnost 0,50",
      goodActivity: "Dobra aktivnost 0,65",
    },
    sl: {
      noData: "Podatki NDVI še niso na voljo",
      noDataHint: "Graf se bo prikazal po zaključku prve analize.",
      ariaLabel: "Razvoj NDVI skozi čas",
      scrollHint: "Pomaknite se vodoravno za ogled celotne zgodovine",
      criticalThreshold: "Kritični prag 0,20",
      lowActivity: "Nizka aktivnost 0,35",
      mediumActivity: "Srednja aktivnost 0,50",
      goodActivity: "Dobra aktivnost 0,65",
    },
    lt: {
      noData: "NDVI duomenų dar nėra",
      noDataHint: "Diagrama bus rodoma atlikus pirmąją analizę.",
      ariaLabel: "NDVI kitimas laikui bėgant",
      scrollHint: "Slinkite horizontaliai, kad peržiūrėtumėte visą istoriją",
      criticalThreshold: "Kritinė riba 0,20",
      lowActivity: "Mažas aktyvumas 0,35",
      mediumActivity: "Vidutinis aktyvumas 0,50",
      goodActivity: "Geras aktyvumas 0,65",
    },
    lv: {
      noData: "NDVI dati vēl nav pieejami",
      noDataHint: "Diagramma tiks parādīta pēc pirmās analīzes pabeigšanas.",
      ariaLabel: "NDVI izmaiņas laika gaitā",
      scrollHint: "Ritiniet horizontāli, lai skatītu visu vēsturi",
      criticalThreshold: "Kritiskā robeža 0,20",
      lowActivity: "Zema aktivitāte 0,35",
      mediumActivity: "Vidēja aktivitāte 0,50",
      goodActivity: "Laba aktivitāte 0,65",
    },
    et: {
      noData: "NDVI andmed pole veel saadaval",
      noDataHint: "Graafik kuvatakse pärast esimese analüüsi lõpetamist.",
      ariaLabel: "NDVI muutus ajas",
      scrollHint: "Kogu ajaloo vaatamiseks kerige horisontaalselt",
      criticalThreshold: "Kriitiline lävi 0,20",
      lowActivity: "Madal aktiivsus 0,35",
      mediumActivity: "Keskmine aktiivsus 0,50",
      goodActivity: "Hea aktiivsus 0,65",
    },
    el: {
      noData: "Δεν υπάρχουν ακόμη διαθέσιμα δεδομένα NDVI",
      noDataHint: "Το γράφημα θα εμφανιστεί μετά την ολοκλήρωση της πρώτης ανάλυσης.",
      ariaLabel: "Εξέλιξη του NDVI με την πάροδο του χρόνου",
      scrollHint: "Κάντε οριζόντια κύλιση για να δείτε ολόκληρο το ιστορικό",
      criticalThreshold: "Κρίσιμο όριο 0,20",
      lowActivity: "Χαμηλή δραστηριότητα 0,35",
      mediumActivity: "Μέτρια δραστηριότητα 0,50",
      goodActivity: "Καλή δραστηριότητα 0,65",
    },
    sv: {
      noData: "Det finns ännu inga NDVI-data",
      noDataHint: "Diagrammet visas efter att den första analysen har slutförts.",
      ariaLabel: "NDVI-utveckling över tid",
      scrollHint: "Rulla horisontellt för att se hela historiken",
      criticalThreshold: "Kritisk gräns 0,20",
      lowActivity: "Låg aktivitet 0,35",
      mediumActivity: "Medelhög aktivitet 0,50",
      goodActivity: "God aktivitet 0,65",
    },
    da: {
      noData: "Der er endnu ingen NDVI-data tilgængelige",
      noDataHint: "Grafen vises, når den første analyse er gennemført.",
      ariaLabel: "NDVI-udvikling over tid",
      scrollHint: "Rul vandret for at se hele historikken",
      criticalThreshold: "Kritisk grænse 0,20",
      lowActivity: "Lav aktivitet 0,35",
      mediumActivity: "Middel aktivitet 0,50",
      goodActivity: "God aktivitet 0,65",
    },
    no: {
      noData: "Det finnes ennå ingen NDVI-data",
      noDataHint: "Diagrammet vises etter at den første analysen er fullført.",
      ariaLabel: "NDVI-utvikling over tid",
      scrollHint: "Rull horisontalt for å se hele historikken",
      criticalThreshold: "Kritisk grense 0,20",
      lowActivity: "Lav aktivitet 0,35",
      mediumActivity: "Middels aktivitet 0,50",
      goodActivity: "God aktivitet 0,65",
    },
    fi: {
      noData: "NDVI-tietoja ei ole vielä saatavilla",
      noDataHint: "Kaavio tulee näkyviin ensimmäisen analyysin valmistuttua.",
      ariaLabel: "NDVI:n kehitys ajan myötä",
      scrollHint: "Vieritä vaakasuunnassa nähdäksesi koko historian",
      criticalThreshold: "Kriittinen raja 0,20",
      lowActivity: "Matala aktiivisuus 0,35",
      mediumActivity: "Keskitasoinen aktiivisuus 0,50",
      goodActivity: "Hyvä aktiivisuus 0,65",
    }
  };

  return copies[language as keyof typeof copies] ?? copies.en;
}

const scrollbarStyles = `
  .aegris-ndvi-scroll::-webkit-scrollbar {
    height: 7px;
  }

  .aegris-ndvi-scroll::-webkit-scrollbar-track {
    background: #050b10;
    border-radius: 9999px;
  }

  .aegris-ndvi-scroll::-webkit-scrollbar-thumb {
    background: rgba(34, 211, 238, 0.28);
    border-radius: 9999px;
    border: 1px solid rgba(34, 211, 238, 0.10);
  }

  .aegris-ndvi-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(34, 211, 238, 0.50);
  }

  .aegris-ndvi-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(34, 211, 238, 0.34) #050b10;
  }
`;

export default function AnalysisChart({
  history,
}: Props) {
  const { language } = useLanguage();
  const copy = getAnalysisChartCopy(language);
  const locales: Record<string, string> = {
    cs: "cs-CZ", en: "en-GB", sk: "sk-SK", de: "de-DE",
    pl: "pl-PL", fr: "fr-FR", es: "es-ES", it: "it-IT",
    nl: "nl-NL", pt: "pt-PT", ro: "ro-RO", hu: "hu-HU",
    uk: "uk-UA", bg: "bg-BG", hr: "hr-HR", sl: "sl-SI",
    lt: "lt-LT", lv: "lv-LV", et: "et-EE", el: "el-GR",
    sv: "sv-SE", da: "da-DK", no: "nb-NO", fi: "fi-FI",
  };
  const locale = locales[language] ?? "en-GB";

  const chartData: ChartPoint[] = history
    .map((item) => {
      const ndvi = Number(item.ndvi);
      const date = getDate(item);

      if (!Number.isFinite(ndvi) || !date) {
        return null;
      }

      return {
        id: item.id,
        date: formatShortDate(date, locale),
        fullDate: formatDate(date, locale),
        ndvi,
      };
    })
    .filter(
      (item): item is ChartPoint =>
        item !== null
    );

  if (chartData.length === 0) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border border-white/[0.07] bg-[#071017]">
        <div className="text-center">
          <div className="text-xs font-bold text-slate-400">
            {copy.noData}
          </div>

          <div className="mt-1 text-[10px] text-slate-600">
            {copy.noDataHint}
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

      <div className="aegris-ndvi-scroll min-h-0 flex-1 overflow-x-auto overflow-y-hidden rounded-lg border border-white/[0.07] bg-[#071017]">
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
            aria-label={copy.ariaLabel}
          >
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
                      stroke="#1a232d"
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
              stroke="#28333e"
              strokeWidth="1"
            />

            <path
              d={linePath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {points.map((point, index) => (
              <g
                key={`point-${point.id}-${index}`}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#06b6d4"
                  stroke="#071017"
                  strokeWidth="3"
                >
                  <title>
                    {point.fullDate} — NDVI{" "}
                    {point.ndvi.toFixed(3)}
                  </title>
                </circle>
              </g>
            ))}

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

      {chartData.length > 6 && (
        <div className="mt-2 flex items-center justify-center gap-2 text-[9px] text-slate-600">
          <span className="text-cyan-500/50">
            ←
          </span>

          <span>
            {copy.scrollHint}
          </span>

          <span className="text-cyan-500/50">
            →
          </span>
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[8px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-px w-3 bg-red-500" />
          {copy.criticalThreshold}
        </span>

        <span className="flex items-center gap-1">
          <span className="h-px w-3 bg-orange-500" />
          {copy.lowActivity}
        </span>

        <span className="flex items-center gap-1">
          <span className="h-px w-3 bg-yellow-500" />
          {copy.mediumActivity}
        </span>

        <span className="flex items-center gap-1">
          <span className="h-px w-3 bg-green-500" />
          {copy.goodActivity}
        </span>
      </div>
    </div>
  );
}
