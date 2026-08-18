"use client";

type RiskEngineProps = {
  ndvi: number | null;
  trend: "rising" | "falling" | "stable" | "unknown";
  trendDifference: number | null;
  temperature?: number | null;
  precipitation?: number | null;
  soilMoisture?: number | null;
  waterDeficit?: number | null;
  cropStage?: string | null;
};

type RiskLevel =
  | "Kritické"
  | "Vysoké"
  | "Zvýšené"
  | "Střední"
  | "Nízké";

type RiskResult = {
  level: RiskLevel;
  score: number;
  primaryFactor: string;
  secondaryFactor: string;
  explanation: string;
  confidence: number;
};

type Factor = {
  name: string;
  value: number;
};

function calculateRisk({
  ndvi,
  trend,
  trendDifference,
  temperature,
  precipitation,
  soilMoisture,
  waterDeficit,
}: RiskEngineProps): RiskResult {
  /*
   * ============================================================
   * AEGRIS RISK MODEL
   * ============================================================
   *
   * Maximální základní skóre:
   *
   * NDVI                  25
   * Trend                 20
   * Velikost změny        10
   * Teplota               10
   * Srážky                 7
   * Vlhkost půdy          15
   * Vodní deficit         10
   * Kombinace              3
   *
   * Celkem                100
   *
   * Důležitá zásada:
   * kombinované riziko se NEPŘIČÍTÁ několikrát.
   *
   * ============================================================
   */

  let score = 0;

  const factors: Factor[] = [];

  /*
   * ============================================================
   * 1. NDVI
   * MAX 25
   * ============================================================
   */

  let ndviScore = 0;

  if (ndvi != null) {
    if (ndvi < 0.20) {
      ndviScore = 25;

      factors.push({
        name: "kriticky nízké NDVI",
        value: 25,
      });
    } else if (ndvi < 0.35) {
      ndviScore = 18;

      factors.push({
        name: "nízká vegetační aktivita",
        value: 18,
      });
    } else if (ndvi < 0.50) {
      ndviScore = 9;

      factors.push({
        name: "snížená vegetační aktivita",
        value: 9,
      });
    } else if (ndvi < 0.65) {
      ndviScore = 2;
    }
  }

  score += ndviScore;

  /*
   * ============================================================
   * 2. TREND
   * MAX 20
   * ============================================================
   */

  let trendScore = 0;

  if (trend === "falling") {
    trendScore = 16;

    factors.push({
      name: "klesající trend NDVI",
      value: 16,
    });
  } else if (trend === "stable") {
    trendScore = 3;
  } else if (trend === "rising") {
    trendScore = 0;
  }

  score += trendScore;

  /*
   * ============================================================
   * 3. VELIKOST ZMĚNY NDVI
   * MAX 10
   *
   * Toto je doplňkový signál.
   * Nemá znovu plně započítávat celý trend.
   * ============================================================
   */

  let changeScore = 0;

  if (trendDifference != null) {
    if (trendDifference <= -0.15) {
      changeScore = 10;

      factors.push({
        name: "velmi výrazný pokles NDVI",
        value: 10,
      });
    } else if (trendDifference <= -0.10) {
      changeScore = 7;

      factors.push({
        name: "výrazný pokles NDVI",
        value: 7,
      });
    } else if (trendDifference <= -0.05) {
      changeScore = 5;

      factors.push({
        name: "významný pokles NDVI",
        value: 5,
      });
    } else if (trendDifference < 0) {
      changeScore = 2;
    }
  }

  score += changeScore;

  /*
   * ============================================================
   * 4. TEPLOTA
   * MAX 10
   * ============================================================
   */

  let temperatureScore = 0;

  if (temperature != null) {
    if (temperature >= 35) {
      temperatureScore = 10;

      factors.push({
        name: "výrazný teplotní stres",
        value: 10,
      });
    } else if (temperature >= 32) {
      temperatureScore = 8;

      factors.push({
        name: "vysoká teplotní zátěž",
        value: 8,
      });
    } else if (temperature >= 30) {
      temperatureScore = 6;

      factors.push({
        name: "zvýšená teplotní zátěž",
        value: 6,
      });
    } else if (temperature >= 28) {
      temperatureScore = 2;
    }
  }

  score += temperatureScore;

  /*
   * ============================================================
   * 5. SRÁŽKY
   * MAX 7
   * ============================================================
   */

  let precipitationScore = 0;

  if (precipitation != null) {
    if (precipitation <= 0) {
      precipitationScore = 5;

      factors.push({
        name: "nulové očekávané srážky",
        value: 5,
      });
    } else if (precipitation < 2) {
      precipitationScore = 3;

      factors.push({
        name: "nízké očekávané srážky",
        value: 3,
      });
    } else if (precipitation < 5) {
      precipitationScore = 1;
    }
  }

  score += precipitationScore;

  /*
   * ============================================================
   * 6. VLHKOST PŮDY
   * MAX 15
   * ============================================================
   */

  let soilScore = 0;

  if (soilMoisture != null) {
    if (soilMoisture < 10) {
      soilScore = 10;

      factors.push({
        name: "velmi nízká vlhkost půdy",
        value: 10,
      });
    } else if (soilMoisture < 20) {
      soilScore = 7;

      factors.push({
        name: "nízká vlhkost půdy",
        value: 7,
      });
    } else if (soilMoisture < 30) {
      soilScore = 3;

      factors.push({
        name: "snížená vlhkost půdy",
        value: 3,
      });
    }
  }

  score += soilScore;

  /*
   * ============================================================
   * 7. VODNÍ DEFICIT
   * MAX 10
   * ============================================================
   */

  let deficitScore = 0;

  if (waterDeficit != null) {
    if (waterDeficit >= 6) {
      deficitScore = 10;

      factors.push({
        name: "velmi výrazný vodní deficit",
        value: 10,
      });
    } else if (waterDeficit >= 5) {
      deficitScore = 8;

      factors.push({
        name: "výrazný vodní deficit",
        value: 8,
      });
    } else if (waterDeficit >= 3) {
      deficitScore = 5;

      factors.push({
        name: "vodní deficit",
        value: 5,
      });
    } else if (waterDeficit > 0) {
      deficitScore = 2;
    }
  }

  score += deficitScore;

  /*
   * ============================================================
   * 8. KOMBINOVANÉ RIZIKO
   * MAX 3
   *
   * Kombinace má pouze malý bonus.
   *
   * Nesmí se stát:
   *
   * NDVI + trend + voda = několik dalších +8 / +10 / +8
   *
   * To vedlo k mechanickému 100/100.
   * ============================================================
   */

  const lowNdvi =
    ndvi != null &&
    ndvi < 0.35;

  const fallingTrend =
    trend === "falling";

  const waterStress =
    (soilMoisture != null &&
      soilMoisture < 10) ||
    (waterDeficit != null &&
      waterDeficit >= 5);

  const heatStress =
    temperature != null &&
    temperature >= 30;

  const dryForecast =
    precipitation != null &&
    precipitation <= 0;

  let combinationScore = 0;

  if (
    lowNdvi &&
    fallingTrend &&
    waterStress
  ) {
    combinationScore = 3;
  } else if (
    lowNdvi &&
    fallingTrend
  ) {
    combinationScore = 2;
  } else if (
    lowNdvi &&
    waterStress
  ) {
    combinationScore = 2;
  } else if (
    fallingTrend &&
    waterStress
  ) {
    combinationScore = 2;
  } else if (
    heatStress &&
    waterStress &&
    dryForecast
  ) {
    combinationScore = 2;
  }

  score += combinationScore;

  /*
   * ============================================================
   * FINÁLNÍ SKÓRE
   * ============================================================
   */

  score = Math.round(
    Math.max(
      0,
      Math.min(100, score)
    )
  );

  /*
   * ============================================================
   * ÚROVEŇ RIZIKA
   * ============================================================
   */

  let level: RiskLevel;

  if (score >= 80) {
    level = "Kritické";
  } else if (score >= 65) {
    level = "Vysoké";
  } else if (score >= 45) {
    level = "Zvýšené";
  } else if (score >= 25) {
    level = "Střední";
  } else {
    level = "Nízké";
  }

  /*
   * ============================================================
   * HLAVNÍ A SEKUNDÁRNÍ FAKTOR
   * ============================================================
   */

  factors.sort(
    (a, b) => b.value - a.value
  );

  const primaryFactor =
    factors[0]?.name ??
    "Nebyl identifikován významný rizikový faktor";

  const secondaryFactor =
    factors[1]?.name ??
    "Další významný faktor nebyl potvrzen";

  /*
   * ============================================================
   * VYSVĚTLENÍ
   * ============================================================
   */

  let explanation =
    "AEGRIS vyhodnotil dostupná data bez výrazného rizikového signálu.";

  if (
    lowNdvi &&
    fallingTrend &&
    waterStress
  ) {
    explanation =
      "AEGRIS identifikoval kombinované riziko: vegetační aktivita je nízká, NDVI klesá a současně jsou přítomny známky vodního stresu. Kombinace těchto faktorů významně zvyšuje riziko zhoršování stavu porostu.";
  } else if (
    lowNdvi &&
    fallingTrend
  ) {
    explanation =
      "NDVI je pod orientační úrovní 0,35 a současně vykazuje klesající trend. To znamená zhoršování vegetační aktivity a vyžaduje zvýšenou pozornost.";
  } else if (
    lowNdvi &&
    waterStress
  ) {
    explanation =
      "Nízká vegetační aktivita je doprovázena známkami vodního stresu. AEGRIS proto zvyšuje rizikové skóre a doporučuje ověření stavu porostu.";
  } else if (
    fallingTrend
  ) {
    explanation =
      "AEGRIS zaznamenal klesající trend NDVI. Samotný pokles nemusí znamenat akutní problém, ale v kombinaci s dalšími stresovými faktory může riziko výrazně růst.";
  } else if (
    waterStress
  ) {
    explanation =
      "AEGRIS zaznamenal známky vodního stresu. Riziko je proto zvýšeno podle dostupné vlhkosti půdy, vodního deficitu a očekávaných srážek.";
  } else if (
    heatStress
  ) {
    explanation =
      "AEGRIS zaznamenal zvýšenou teplotní zátěž. Riziko je hodnoceno společně s vegetačním stavem a vodní bilancí.";
  } else if (
    ndvi != null
  ) {
    explanation =
      `Aktuální NDVI je ${ndvi.toFixed(
        3
      )}. AEGRIS hodnotí tuto hodnotu společně s jejím vývojem a dostupnými environmentálními daty.`;
  }

  /*
   * ============================================================
   * DŮVĚRA
   * ============================================================
   */

  let availableInputs = 0;

  if (ndvi != null) {
    availableInputs++;
  }

  if (trend !== "unknown") {
    availableInputs++;
  }

  if (temperature != null) {
    availableInputs++;
  }

  if (precipitation != null) {
    availableInputs++;
  }

  if (soilMoisture != null) {
    availableInputs++;
  }

  if (waterDeficit != null) {
    availableInputs++;
  }

  const confidence = Math.min(
    95,
    45 + availableInputs * 8
  );

  return {
    level,
    score,
    primaryFactor,
    secondaryFactor,
    explanation,
    confidence,
  };
}

function getLevelStyles(
  level: RiskLevel
) {
  switch (level) {
    case "Kritické":
      return {
        border:
          "border-red-500/30",
        background:
          "bg-red-500/5",
        text:
          "text-red-400",
        bar:
          "bg-red-500",
      };

    case "Vysoké":
      return {
        border:
          "border-orange-500/30",
        background:
          "bg-orange-500/5",
        text:
          "text-orange-400",
        bar:
          "bg-orange-500",
      };

    case "Zvýšené":
      return {
        border:
          "border-amber-500/30",
        background:
          "bg-amber-500/5",
        text:
          "text-amber-400",
        bar:
          "bg-amber-500",
      };

    case "Střední":
      return {
        border:
          "border-yellow-500/30",
        background:
          "bg-yellow-500/5",
        text:
          "text-yellow-400",
        bar:
          "bg-yellow-500",
      };

    default:
      return {
        border:
          "border-emerald-500/30",
        background:
          "bg-emerald-500/5",
        text:
          "text-emerald-400",
        bar:
          "bg-emerald-500",
      };
  }
}

export default function RiskEngine(
  props: RiskEngineProps
) {
  const risk =
    calculateRisk(props);

  const styles =
    getLevelStyles(risk.level);

  return (
    <section className="mt-8 rounded-3xl border border-slate-800 bg-[#080d20] p-6 md:p-8">

      {/* HEADER */}

      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

        <div>

          <div className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
            AEGRIS Risk Engine
          </div>

          <h2 className="mt-2 text-2xl font-black text-white">
            Hodnocení rizika
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            AEGRIS kombinuje vegetační,
            meteorologické a vodní ukazatele
            do orientačního rizikového skóre.
          </p>

        </div>

        <div
          className={`rounded-2xl border px-5 py-4 ${styles.border} ${styles.background}`}
        >

          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Celkové riziko
          </div>

          <div
            className={`mt-1 text-xl font-black ${styles.text}`}
          >
            {risk.level}
          </div>

        </div>

      </div>

      {/* SCORE */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-[#0b1228] p-5">

        <div className="flex items-end justify-between gap-4">

          <div>

            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Rizikové skóre
            </div>

            <div
              className={`mt-2 text-4xl font-black ${styles.text}`}
            >
              {risk.score}
              <span className="text-lg text-slate-600">
                /100
              </span>
            </div>

          </div>

          <div className="text-right">

            <div className="text-xs text-slate-500">
              Orientační důvěra
            </div>

            <div className="mt-1 text-xl font-black text-white">
              {risk.confidence} %
            </div>

          </div>

        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">

          <div
            className={`h-full rounded-full transition-all ${styles.bar}`}
            style={{
              width: `${risk.score}%`,
            }}
          />

        </div>

      </div>

      {/* FACTORS */}

      <div className="mt-6 grid gap-4 md:grid-cols-2">

        <div
          className={`rounded-2xl border p-5 ${styles.border} ${styles.background}`}
        >

          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Hlavní faktor
          </div>

          <div
            className={`mt-2 text-lg font-bold ${styles.text}`}
          >
            {risk.primaryFactor}
          </div>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0b1228] p-5">

          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Sekundární faktor
          </div>

          <div className="mt-2 text-lg font-bold text-slate-300">
            {risk.secondaryFactor}
          </div>

        </div>

      </div>

      {/* EXPLANATION */}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-[#0b1228] p-5">

        <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-400">
          Proč AEGRIS rozhodl takto
        </div>

        <p className="mt-3 text-sm leading-7 text-slate-300">
          {risk.explanation}
        </p>

      </div>

      {/* INPUTS */}

      <div className="mt-6">

        <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
          Vstupy hodnocení
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-xl bg-[#0b1228] p-4">

            <div className="text-xs text-slate-500">
              NDVI
            </div>

            <div className="mt-1 font-bold text-cyan-400">
              {props.ndvi != null
                ? props.ndvi.toFixed(3)
                : "N/A"}
            </div>

          </div>

          <div className="rounded-xl bg-[#0b1228] p-4">

            <div className="text-xs text-slate-500">
              Trend
            </div>

            <div className="mt-1 font-bold text-white">
              {props.trend === "falling"
                ? "Klesající"
                : props.trend === "rising"
                  ? "Rostoucí"
                  : props.trend === "stable"
                    ? "Stabilní"
                    : "N/A"}
            </div>

          </div>

          <div className="rounded-xl bg-[#0b1228] p-4">

            <div className="text-xs text-slate-500">
              Teplota
            </div>

            <div className="mt-1 font-bold text-white">
              {props.temperature != null
                ? `${props.temperature.toFixed(1)} °C`
                : "N/A"}
            </div>

          </div>

          <div className="rounded-xl bg-[#0b1228] p-4">

            <div className="text-xs text-slate-500">
              Srážky
            </div>

            <div className="mt-1 font-bold text-white">
              {props.precipitation != null
                ? `${props.precipitation.toFixed(1)} mm`
                : "N/A"}
            </div>

          </div>

          <div className="rounded-xl bg-[#0b1228] p-4">

            <div className="text-xs text-slate-500">
              Vlhkost půdy
            </div>

            <div className="mt-1 font-bold text-white">
              {props.soilMoisture != null
                ? `${props.soilMoisture.toFixed(1)} %`
                : "N/A"}
            </div>

          </div>

          <div className="rounded-xl bg-[#0b1228] p-4">

            <div className="text-xs text-slate-500">
              Vodní deficit
            </div>

            <div className="mt-1 font-bold text-white">
              {props.waterDeficit != null
                ? `${props.waterDeficit.toFixed(1)} mm`
                : "N/A"}
            </div>

          </div>

        </div>

      </div>

      {/* DISCLAIMER */}

      <p className="mt-6 text-xs leading-5 text-slate-500">
        Rizikové skóre je orientační rozhodovací podpora.
        Vyšší skóre neznamená automaticky nutnost zásahu.
        Před rozhodnutím je nutné ověřit skutečný stav
        porostu v terénu.
      </p>

    </section>
  );
}