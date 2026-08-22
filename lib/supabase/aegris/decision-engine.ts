/**
 * AEGRIS Decision Engine
 *
 * Centralized project-context evaluation.
 * This file intentionally contains the existing AEGRIS evaluation logic
 * moved out of the page component so it can be reused and extended.
 */

export type NdviHistory = {
  id: number;
  project_id: number;
  period_from: string;
  period_to: string;
  ndvi: number;
  created_at: string;
};

export type CropProfile = {
  id: number;
  name: string;
  category: string | null;
  min_temperature_c: number | null;
  max_temperature_c: number | null;
  soil_moisture_min_pct: number | null;
  soil_moisture_max_pct: number | null;
  ph_min: number | null;
  ph_max: number | null;
  water_need: string | null;
  light_need: string | null;
  notes: string | null;
};

export type CropStageProfile = {
  id: number;
  crop_profile_id: number;
  growth_stage: string;
  kc: number | null;
  min_temperature_c: number | null;
  max_temperature_c: number | null;
  water_stress_sensitivity: string | null;
};

export type ProjectSoilProfile = {
  project_id: number;
  soil_texture: string | null;
  field_capacity_pct: number | null;
  wilting_point_pct: number | null;
  root_zone_depth_cm: number | null;
  reference_depth_top_cm: number;
  reference_depth_bottom_cm: number;
  data_source: string;
  confidence: string;
  notes: string | null;
};

export type WeatherData = {
  temperature_c: number | null;
  humidity_pct: number | null;
  precipitation_mm: number | null;
  wind_speed_kmh: number | null;
  soil_moisture_pct: number | null;
  precipitation_probability_pct: number | null;
  next24h_precipitation_mm: number | null;
  next24h_min_temperature_c: number | null;
  next24h_max_temperature_c: number | null;
  evapotranspiration_mm: number | null;
  fetched_at: string;
};

export type NdviTrend = {
  direction: "Rostoucí" | "Klesající" | "Stabilní" | "Nedostatek dat";
  slope: number | null;
  overallDelta: number | null;
  overallRelativeChangePct: number | null;
  latestChange: number | null;
  previousNdvi: number | null;
  points: number;
};

export type ScoreBreakdownItem = {
  label: string;
  score: number;
  weight: number;
  contribution: number;
};

type DiagnosticCause = {
  code: string;
  label: string;
  confidence: number;
  evidence: string[];
};

export type ContextEvaluation = {
  level: "Optimální" | "Upozornění" | "Kritické" | "Bez vyhodnocení";
  priority: "Nízká" | "Střední" | "Vysoká" | "Kritická";
  score: number;
  scoreLevel:
    | "Velmi dobrý stav"
    | "Dobrý stav"
    | "Zvýšené riziko"
    | "Vysoké riziko"
    | "Kritický stav";
  trend: NdviTrend;
  scoreBreakdown: ScoreBreakdownItem[];
  criticalFactorCount: number;
  warningFactorCount: number;
  evaluatedFactorCount: number;
  dataCompletenessPct: number;
  diagnoses: DiagnosticCause[];
  summary: string;
  recommendation: string;
  actions: string[];
  factors: Array<{
    label: string;
    status: "OK" | "Upozornění" | "Kritické" | "N/A";
    detail: string;
  }>;
};

function ndviHistoryTime(item: NdviHistory): number {
  const value = Date.parse(
    item.period_from || item.period_to || item.created_at
  );

  return Number.isFinite(value) ? value : NaN;
}

/**
 * Jediný kanonický zdroj NDVI časové řady pro engine i dashboard.
 * Historické body po aktuální analýze se ignorují a aktuální analýza
 * se přidá jako poslední bod pouze jednou.
 */
export function buildCanonicalNdviHistory(
  ndviHistory: NdviHistory[],
  currentNdvi: number | null,
  analysisCreatedAt: string | null = null
): NdviHistory[] {
  const analysisTime = analysisCreatedAt
    ? Date.parse(analysisCreatedAt)
    : NaN;

  const valid = ndviHistory
    .filter(
      (item) =>
        Number.isFinite(Number(item.ndvi)) &&
        Number.isFinite(ndviHistoryTime(item))
    )
    .filter(
      (item) =>
        !Number.isFinite(analysisTime) ||
        ndviHistoryTime(item) <= analysisTime
    )
    .sort(
      (a, b) =>
        ndviHistoryTime(a) - ndviHistoryTime(b)
    );

  const deduped: NdviHistory[] = [];

  for (const item of valid) {
    const previous = deduped[deduped.length - 1];

    if (
      previous &&
      Math.abs(
        ndviHistoryTime(previous) -
          ndviHistoryTime(item)
      ) < 1000
    ) {
      deduped[deduped.length - 1] = item;
    } else {
      deduped.push(item);
    }
  }

  if (
    currentNdvi == null ||
    !Number.isFinite(currentNdvi)
  ) {
    return deduped;
  }

  const currentTime = Number.isFinite(analysisTime)
    ? analysisTime
    : Date.now();

  const currentIso = new Date(currentTime).toISOString();
  const last = deduped[deduped.length - 1];

  if (
    last &&
    Math.abs(
      ndviHistoryTime(last) - currentTime
    ) < 1000 &&
    Math.abs(Number(last.ndvi) - currentNdvi) < 0.0005
  ) {
    return deduped;
  }

  return [
    ...deduped,
    {
      id: -1,
      project_id: deduped[0]?.project_id ?? 0,
      period_from: currentIso,
      period_to: currentIso,
      ndvi: currentNdvi,
      created_at: currentIso,
    },
  ];
}

export function calculateNdviTrend(
  ndviHistory: NdviHistory[],
  currentNdvi: number | null,
  analysisCreatedAt: string | null = null
): NdviTrend {
  if (
    currentNdvi == null ||
    !Number.isFinite(currentNdvi)
  ) {
    return {
      direction: "Nedostatek dat",
      slope: null,
      overallDelta: null,
      overallRelativeChangePct: null,
      latestChange: null,
      previousNdvi: null,
      points: 0,
    };
  }

  const canonical = buildCanonicalNdviHistory(
    ndviHistory,
    currentNdvi,
    analysisCreatedAt
  );

  const historical = canonical.filter(
    (item) => !(item.id === -1)
  );

  const previousNdvi = historical.length
    ? Number(historical[historical.length - 1].ndvi)
    : null;

  const values = historical
    .slice(-5)
    .map((item) => Number(item.ndvi))
    .concat(currentNdvi);

  if (values.length < 2) {
    return {
      direction: "Nedostatek dat",
      slope: null,
      overallDelta: null,
      overallRelativeChangePct: null,
      latestChange:
        previousNdvi == null
          ? null
          : currentNdvi - previousNdvi,
      previousNdvi,
      points: values.length,
    };
  }

  const n = values.length;
  const xMean = (n - 1) / 2;

  const yMean =
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / n;

  let numerator = 0;
  let denominator = 0;

  values.forEach((value, index) => {
    const xDelta = index - xMean;

    numerator +=
      xDelta * (value - yMean);

    denominator +=
      xDelta * xDelta;
  });

  const slope =
    denominator > 0
      ? numerator / denominator
      : 0;

  const first = values[0];

  const overallDelta =
    currentNdvi - first;

  const overallRelativeChangePct =
    Math.abs(first) > 0
      ? (overallDelta / Math.abs(first)) * 100
      : 0;

  const latestChange =
    previousNdvi == null
      ? null
      : currentNdvi - previousNdvi;

  const direction =
    slope <= -0.015 ||
    overallRelativeChangePct <= -10
      ? "Klesající"
      : slope >= 0.015 ||
          overallRelativeChangePct >= 10
        ? "Rostoucí"
        : "Stabilní";

  return {
    direction,
    slope,
    overallDelta,
    overallRelativeChangePct,
    latestChange,
    previousNdvi,
    points: values.length,
  };
}

export function evaluateProjectContext(
  ndvi: number | null,
  cropProfile: CropProfile | null,
  cropStageProfile: CropStageProfile | null,
  growthStage: string,
  weather: WeatherData | null,
  ndviHistory: NdviHistory[] = [],
  analysisCreatedAt: string | null = null,
  soilProfile: ProjectSoilProfile | null = null
): ContextEvaluation {
  if (
    ndvi == null ||
    !Number.isFinite(ndvi)
  ) {
    return {
      level: "Bez vyhodnocení",
      priority: "Nízká",
      score: 0,
      scoreLevel: "Kritický stav",
      trend: {
        direction: "Nedostatek dat",
        slope: null,
        overallDelta: null,
        overallRelativeChangePct: null,
        latestChange: null,
        previousNdvi: null,
        points: 0,
      },
      scoreBreakdown: [],
      criticalFactorCount: 0,
      warningFactorCount: 0,
      evaluatedFactorCount: 0,
      dataCompletenessPct: 0,
      summary:
        "Zatím není k dispozici platná NDVI analýza.",
      recommendation:
        "Spusťte AI analýzu projektu. Po jejím dokončení AEGRIS doplní kontext počasí, požadavků plodiny a vývoje porostu.",
      actions: [
        "Spustit aktuální AI analýzu projektu.",
        "Zkontrolovat, že je vybraná plodina a růstová fáze.",
      ],
      diagnoses: [],
      factors: [
        {
          label: "NDVI",
          status: "N/A",
          detail:
            "Chybí aktuální analýza.",
        },
        {
          label: "Počasí",
          status: weather
            ? "OK"
            : "N/A",
          detail: weather
            ? "Aktuální počasí je načtené."
            : "Počasí není k dispozici.",
        },
      ],
    };
  }

  const stageTarget: Record<string, number> = {
    "Vzcházení": 0.20,
    "Klíčení a vzcházení": 0.20,
    "Listová růžice": 0.30,
    "Vegetativní růst": 0.45,
    "Odnožování": 0.35,
    "Sloupkování": 0.45,
    "Prodlužovací růst": 0.45,
    "Kvetení / opylení": 0.55,
    "Kvetení": 0.55,
    "Metání a kvetení": 0.55,
    "Tvorba zrna": 0.55,
    "Tvorba šešulí": 0.55,
    "Tvorba hlíz": 0.45,
    "Růst hlíz": 0.55,
    "Dozrávání": 0.50,
    "Zralost": 0.32,
  };

  const target =
    stageTarget[growthStage] ?? 0.40;

  const stageKc =
    cropStageProfile?.kc != null &&
    Number.isFinite(
      Number(cropStageProfile.kc)
    )
      ? Number(cropStageProfile.kc)
      : null;

  const stageMinTemperature =
    cropStageProfile?.min_temperature_c != null
      ? Number(
          cropStageProfile.min_temperature_c
        )
      : cropProfile?.min_temperature_c ??
        null;

  const stageMaxTemperature =
    cropStageProfile?.max_temperature_c != null
      ? Number(
          cropStageProfile.max_temperature_c
        )
      : cropProfile?.max_temperature_c ??
        null;

  const waterStressSensitivity =
    cropStageProfile?.water_stress_sensitivity?.toLowerCase() ??
    cropProfile?.water_need?.toLowerCase() ??
    "";

  const sensitivityKey =
    waterStressSensitivity.includes(
      "velmi vysok"
    )
      ? "velmi-vysoka"
      : waterStressSensitivity.includes(
          "vysok"
        )
        ? "vysoka"
        : waterStressSensitivity.includes(
            "nízk"
          )
          ? "nízka"
          : "střední";

  const sensitivityFactor =
    sensitivityKey === "velmi-vysoka"
      ? 1.5
      : sensitivityKey === "vysoka"
        ? 1.25
        : sensitivityKey === "nízka"
          ? 0.75
          : 1;

  const factors: ContextEvaluation["factors"] =
    [];

  let criticalCount = 0;
  let warningCount = 0;
  let evaluatedCount = 0;

  const actions: string[] = [];

  const clampScore = (value: number) =>
    Math.max(
      0,
      Math.min(100, value)
    );

  // ---------------------------------------------------------
  // 1. NDVI / růstová fáze
  // ---------------------------------------------------------
  if (ndvi < 0.20) {
    criticalCount++;
    evaluatedCount++;

    factors.push({
      label: "NDVI",
      status: "Kritické",
      detail:
        `${ndvi.toFixed(3)} je velmi nízké pro aktuálně sledovaný porost.`,
    });
  } else if (ndvi < target * 0.80) {
    warningCount++;
    evaluatedCount++;

    factors.push({
      label: "NDVI",
      status: "Upozornění",
      detail:
        `${ndvi.toFixed(3)} je pod orientační úrovní ${target.toFixed(2)} pro fázi ${growthStage || "projektu"}.`,
    });

    actions.push(
      `Zkontrolovat stav porostu, protože NDVI ${ndvi.toFixed(3)} je pod orientační úrovní pro fázi ${growthStage || "projektu"}.`
    );
  } else {
    evaluatedCount++;

    factors.push({
      label: "NDVI",
      status: "OK",
      detail:
        `${ndvi.toFixed(3)} odpovídá orientační úrovni pro fázi ${growthStage || "projektu"}.`,
    });
  }

  // ---------------------------------------------------------
  // 2. NDVI trend
  // ---------------------------------------------------------
  const canonicalNdviHistory =
    buildCanonicalNdviHistory(
      ndviHistory,
      ndvi,
      analysisCreatedAt
    );

  const historicalNdvi =
    canonicalNdviHistory.filter(
      (item) => item.id !== -1
    );

  const trendHistory =
    historicalNdvi.slice(-5);

  const ndviTrend =
    calculateNdviTrend(
      ndviHistory,
      ndvi,
      analysisCreatedAt
    );

  const previousNdvi =
    ndviTrend.previousNdvi ??
    undefined;

  if (trendHistory.length >= 2) {
    evaluatedCount++;

    const slope =
      ndviTrend.slope ?? 0;

    const overallDelta =
      ndviTrend.overallDelta ?? 0;

    const overallRelativeChange =
      ndviTrend.overallRelativeChangePct ??
      0;

    const criticalTrend =
      slope <= -0.03 ||
      overallRelativeChange <= -20;

    const warningTrend =
      slope <= -0.015 ||
      overallRelativeChange <= -10;

    if (criticalTrend) {
      criticalCount++;

      factors.push({
        label: "Trend NDVI",
        status: "Kritické",
        detail:
          `NDVI má za posledních ${ndviTrend.points} měření výrazně klesající trend. Lineární sklon je ${slope >= 0 ? "+" : ""}${slope.toFixed(3)} NDVI/měření a celková změna činí ${overallDelta >= 0 ? "+" : ""}${overallDelta.toFixed(3)} (${overallRelativeChange >= 0 ? "+" : ""}${overallRelativeChange.toFixed(1)} %).`,
      });

      actions.push(
        "Prověřit příčinu dlouhodobějšího poklesu vegetačního indexu a porovnat jej s vodním, teplotním a půdním stavem."
      );
    } else if (warningTrend) {
      warningCount++;

      factors.push({
        label: "Trend NDVI",
        status: "Upozornění",
        detail:
          `NDVI má za posledních ${ndviTrend.points} měření klesající trend. Lineární sklon je ${slope >= 0 ? "+" : ""}${slope.toFixed(3)} NDVI/měření a celková změna činí ${overallDelta >= 0 ? "+" : ""}${overallDelta.toFixed(3)} (${overallRelativeChange >= 0 ? "+" : ""}${overallRelativeChange.toFixed(1)} %).`,
      });

      actions.push(
        "Sledovat další NDVI měření a ověřit, zda pokles pokračuje i v následující analýze."
      );
    } else {
      factors.push({
        label: "Trend NDVI",
        status: "OK",
        detail:
          `NDVI má za posledních ${ndviTrend.points} měření ${ndviTrend.direction.toLowerCase()} trend. Lineární sklon je ${slope >= 0 ? "+" : ""}${slope.toFixed(3)} NDVI/měření a celková změna činí ${overallDelta >= 0 ? "+" : ""}${overallDelta.toFixed(3)} (${overallRelativeChange >= 0 ? "+" : ""}${overallRelativeChange.toFixed(1)} %).`,
      });
    }
  } else if (
    previousNdvi != null &&
    Number.isFinite(previousNdvi)
  ) {
    evaluatedCount++;

    const delta =
      ndviTrend.latestChange ?? 0;

    const relativeChange =
      Math.abs(previousNdvi) > 0
        ? (delta /
            Math.abs(previousNdvi)) *
          100
        : 0;

    const isCritical =
      delta <= -0.15 ||
      relativeChange <= -25;

    const isWarning =
      delta <= -0.08 ||
      relativeChange <= -15;

    if (isCritical || isWarning) {
      if (isCritical) {
        criticalCount++;
      } else {
        warningCount++;
      }

      factors.push({
        label: "Trend NDVI",
        status: isCritical
          ? "Kritické"
          : "Upozornění",
        detail:
          `NDVI se oproti předchozímu měření změnilo z ${previousNdvi.toFixed(3)} na ${ndvi.toFixed(3)} (${delta >= 0 ? "+" : ""}${delta.toFixed(3)}, ${relativeChange >= 0 ? "+" : ""}${relativeChange.toFixed(1)} %).`,
      });

      actions.push(
        "Prověřit příčinu změny vegetačního indexu a porovnat aktuální stav s předchozím měřením."
      );
    } else {
      factors.push({
        label: "Trend NDVI",
        status: "OK",
        detail:
          `NDVI je oproti předchozímu měření relativně stabilní (${delta >= 0 ? "+" : ""}${delta.toFixed(3)}).`,
      });
    }
  } else {
    factors.push({
      label: "Trend NDVI",
      status: "N/A",
      detail:
        "Pro vyhodnocení trendu není k dispozici dostatek historických NDVI měření.",
    });
  }

  // ---------------------------------------------------------
  // 3. Aktuální teplota + 24h teplotní výhled
  // ---------------------------------------------------------
  if (
    weather?.temperature_c != null &&
    stageMinTemperature != null &&
    stageMaxTemperature != null
  ) {
    evaluatedCount++;

    const temperature =
      weather.temperature_c;

    const min =
      stageMinTemperature;

    const max =
      stageMaxTemperature;

    if (
      temperature < min - 3 ||
      temperature > max + 3
    ) {
      criticalCount++;

      factors.push({
        label: "Teplota",
        status: "Kritické",
        detail:
          `${temperature.toFixed(1)} °C je výrazně mimo profil ${min}–${max} °C.`,
      });
    } else if (
      temperature < min ||
      temperature > max
    ) {
      warningCount++;

      factors.push({
        label: "Teplota",
        status: "Upozornění",
        detail:
          `${temperature.toFixed(1)} °C je mimo orientační rozsah ${min}–${max} °C.`,
      });
    } else {
      factors.push({
        label: "Teplota",
        status: "OK",
        detail:
          `${temperature.toFixed(1)} °C je v orientačním rozsahu ${min}–${max} °C.`,
      });
    }
  } else if (
    weather?.temperature_c != null
  ) {
    factors.push({
      label: "Teplota",
      status: "N/A",
      detail:
        `${weather.temperature_c.toFixed(1)} °C. Pro porovnání chybí kompletní profil plodiny.`,
    });
  } else {
    factors.push({
      label: "Teplota",
      status: "N/A",
      detail:
        "Aktuální teplota není k dispozici.",
    });
  }

  if (
    weather?.next24h_min_temperature_c != null &&
    weather?.next24h_max_temperature_c != null &&
    stageMinTemperature != null &&
    stageMaxTemperature != null
  ) {
    evaluatedCount++;

    const forecastMin =
      weather.next24h_min_temperature_c;

    const forecastMax =
      weather.next24h_max_temperature_c;

    const min =
      stageMinTemperature;

    const max =
      stageMaxTemperature;

    if (
      forecastMin < min - 3 ||
      forecastMax > max + 3
    ) {
      warningCount++;

      factors.push({
        label:
          "Teplotní výhled 24 h",
        status: "Upozornění",
        detail:
          `Předpověď pro dalších 24 h je ${forecastMin.toFixed(1)} až ${forecastMax.toFixed(1)} °C, což je výrazně mimo profil plodiny. Jde o předpokládané riziko, nikoli automaticky o potvrzený teplotní stres.`,
      });

      actions.push(
        "Sledovat teplotní vývoj v dalších 24 hodinách a ověřit riziko teplotního stresu v terénu."
      );
    } else if (
      forecastMin < min ||
      forecastMax > max
    ) {
      warningCount++;

      factors.push({
        label:
          "Teplotní výhled 24 h",
        status: "Upozornění",
        detail:
          `Předpověď pro dalších 24 h je ${forecastMin.toFixed(1)} až ${forecastMax.toFixed(1)} °C a zasahuje mimo profil plodiny ${min}–${max} °C.`,
      });

      actions.push(
        "Sledovat teplotní vývoj v dalších 24 hodinách."
      );
    } else {
      factors.push({
        label:
          "Teplotní výhled 24 h",
        status: "OK",
        detail:
          `Předpověď pro dalších 24 h je ${forecastMin.toFixed(1)} až ${forecastMax.toFixed(1)} °C a zůstává v profilu plodiny.`,
      });
    }
  } else {
    factors.push({
      label:
        "Teplotní výhled 24 h",
      status: "N/A",
      detail:
        "24hodinový teplotní výhled nebo profil plodiny není kompletně k dispozici.",
    });
  }

  // ---------------------------------------------------------
  // 4. Vlhkost půdy
  // ---------------------------------------------------------
  // Půdní vlhkost interpretujeme pouze tehdy, pokud máme
  // projektový půdní profil s FC a PWP.
  // Samotná hodnota soil moisture bez půdního kontextu
  // není dostatečná pro výpočet vodního stresu.

  if (
    weather?.soil_moisture_pct != null &&
    soilProfile?.field_capacity_pct != null &&
    soilProfile?.wilting_point_pct != null
  ) {
    evaluatedCount++;

    const soil =
      weather.soil_moisture_pct;

    const fieldCapacity =
      soilProfile.field_capacity_pct;

    const wiltingPoint =
      soilProfile.wilting_point_pct;

    const availableWaterRange =
      fieldCapacity - wiltingPoint;

    if (availableWaterRange <= 0) {
      factors.push({
        label: "Vlhkost půdy",
        status: "N/A",
        detail:
          "Půdní profil obsahuje neplatný rozsah mezi field capacity a wilting point.",
      });
    } else {
      const relativeAvailableWater =
        ((soil - wiltingPoint) /
          availableWaterRange) *
        100;

      const waterAvailability =
        Math.max(
          0,
          Math.min(
            100,
            relativeAvailableWater
          )
        );

      const criticalWaterAvailability =
        Math.min(
          100,
          20 * sensitivityFactor
        );

      const warningWaterAvailability =
        Math.min(
          100,
          40 * sensitivityFactor
        );

      if (
        waterAvailability <=
        criticalWaterAvailability
      ) {
        criticalCount++;

        factors.push({
          label: "Vlhkost půdy",
          status: "Kritické",
          detail:
            `Půdní vlhkost ${soil.toFixed(1)} % odpovídá přibližně ${waterAvailability.toFixed(0)} % dostupné vody mezi wilting point (${wiltingPoint.toFixed(1)} %) a field capacity (${fieldCapacity.toFixed(1)} %). Kritická hranice pro aktuální růstovou fázi je ${criticalWaterAvailability.toFixed(0)} %.`,
        });

        actions.push(
          "Prověřit skutečnou půdní vlhkost a vodní stres porostu v terénu."
        );
      } else if (
        waterAvailability <=
        warningWaterAvailability
      ) {
        warningCount++;

        factors.push({
          label: "Vlhkost půdy",
          status: "Upozornění",
          detail:
            `Půdní vlhkost ${soil.toFixed(1)} % odpovídá přibližně ${waterAvailability.toFixed(0)} % dostupné vody mezi wilting point (${wiltingPoint.toFixed(1)} %) a field capacity (${fieldCapacity.toFixed(1)} %). Varovná hranice pro aktuální růstovou fázi je ${warningWaterAvailability.toFixed(0)} %.`,
        });

        actions.push(
          "Sledovat půdní vlhkost a vývoj vodního stresu porostu."
        );
      } else {
        factors.push({
          label: "Vlhkost půdy",
          status: "OK",
          detail:
            `Půdní vlhkost ${soil.toFixed(1)} % odpovídá přibližně ${waterAvailability.toFixed(0)} % dostupné vody mezi wilting point (${wiltingPoint.toFixed(1)} %) a field capacity (${fieldCapacity.toFixed(1)} %).`,
        });
      }
    }
  } else if (
    weather?.soil_moisture_pct != null &&
    cropProfile?.soil_moisture_min_pct != null &&
    cropProfile?.soil_moisture_max_pct != null
  ) {
    evaluatedCount++;

    const soil =
      weather.soil_moisture_pct;

    const min =
      cropProfile.soil_moisture_min_pct;

    const max =
      cropProfile.soil_moisture_max_pct;

    const range =
      Math.max(max - min, 1);

    if (
      soil < min ||
      soil > max
    ) {
      const outsideDistance =
        soil < min
          ? min - soil
          : soil - max;

      const score = Math.max(
        0,
        Math.min(
          100,
          70 -
            (outsideDistance / range) *
              70
        )
      );

      const criticalSoilScore =
        Math.min(
          100,
          25 * sensitivityFactor
        );

      const warningSoilScore =
        Math.min(
          100,
          50 * sensitivityFactor
        );

      if (
        score <= criticalSoilScore
      ) {
        criticalCount++;

        factors.push({
          label: "Vlhkost půdy",
          status: "Kritické",
          detail:
            `Aktuální půdní vlhkost ${soil.toFixed(1)} % je mimo doporučený rozsah ${min.toFixed(1)}–${max.toFixed(1)} %. Hodnocení je orientační, protože projektový půdní profil s field capacity a wilting point není k dispozici.`,
        });

        actions.push(
          "Prověřit skutečnou půdní vlhkost a vodní stres porostu v terénu."
        );
      } else if (
        score <= warningSoilScore
      ) {
        warningCount++;

        factors.push({
          label: "Vlhkost půdy",
          status: "Upozornění",
          detail:
            `Aktuální půdní vlhkost ${soil.toFixed(1)} % je mimo doporučený rozsah ${min.toFixed(1)}–${max.toFixed(1)} %. Hodnocení je orientační, protože projektový půdní profil s field capacity a wilting point není k dispozici.`,
        });

        actions.push(
          "Sledovat půdní vlhkost a vývoj vodního stresu porostu."
        );
      }
    } else {
      factors.push({
        label: "Vlhkost půdy",
        status: "OK",
        detail:
          `Aktuální půdní vlhkost ${soil.toFixed(1)} % je v doporučeném rozsahu ${min.toFixed(1)}–${max.toFixed(1)} %. Hodnocení je orientační, protože projektový půdní profil s field capacity a wilting point není k dispozici.`,
      });
    }
  } else {
    factors.push({
      label: "Vlhkost půdy",
      status: "N/A",
      detail:
        "Měřená vlhkost půdy není k dispozici.",
    });
  }

  // ---------------------------------------------------------
  // 5. Vodní bilance: srážky + evapotranspirace + Kc růstové fáze
  // ---------------------------------------------------------
  //
  // DŮLEŽITÉ:
  // Stav faktoru "Vodní bilance" i jeho kontinuální score vycházejí
  // z JEDNOHO výpočtu. Nesmí zde vzniknout druhá nezávislá logika,
  // která by mohla vracet jiný stav než scoreBreakdown.
  //
  // 100 = bez deficitu
  // 60–99 = OK
  // 30–59 = Upozornění
  // 0–29 = Kritické
  //
  // Kritická hranice deficitu je 30 % denní ETc,
  // upravená podle citlivosti plodiny/fáze.

  let continuousWaterBalanceScore:
    number | null = null;

  const precipitation24h =
    weather?.next24h_precipitation_mm;

  const evapotranspiration =
    weather?.evapotranspiration_mm;

  const cropCoefficient =
    stageKc ?? 1;

  if (precipitation24h != null) {
    const precip =
      Number(precipitation24h);

    const et0 =
      evapotranspiration != null
        ? Number(evapotranspiration)
        : null;

    evaluatedCount++;

    if (
      Number.isFinite(precip) &&
      et0 != null &&
      Number.isFinite(et0)
    ) {
      const cropEt =
        Math.max(
          0,
          et0 * cropCoefficient
        );

      const waterDeficit =
        Math.max(
          0,
          cropEt - precip
        );

      // Vodní bilance je škálována vůči kritickému podílu
      // denní potřeby vody. 0 % deficitu = 100 bodů;
      // dosažení kritického deficitu = 0 bodů.
      //
      // Citlivost plodiny/fáze posouvá kritickou hranici:
      // citlivější porost dosáhne 0 bodů při menším deficitu,
      // méně citlivý porost při větším deficitu.
      const criticalDeficitRatio =
        0.30 /
        Math.max(
          sensitivityFactor,
          0.01
        );

      continuousWaterBalanceScore =
        cropEt > 0
          ? clampScore(
              100 -
                (waterDeficit /
                  cropEt /
                  Math.max(
                    criticalDeficitRatio,
                    0.01
                  )) *
                  100
            )
          : 100;

      // Půdní vlhkost se do vodní bilance NEPŘIČÍTÁ znovu.
      // Je samostatným kanonickým faktorem s vlastní vahou 15 %.
      // Tím se zabrání dvojímu započtení stejného půdního signálu.

      const waterStatus =
        continuousWaterBalanceScore < 30
          ? "Kritické"
          : continuousWaterBalanceScore < 60
            ? "Upozornění"
            : "OK";

      if (
        waterStatus ===
        "Kritické"
      ) {
        criticalCount++;

        let detail =
          `Pro fázi ${growthStage || "neuvedenou"} je Kc ${cropCoefficient.toFixed(2)}. ` +
          `ET₀ ${et0.toFixed(1)} mm/den odpovídá orientační ETc ${cropEt.toFixed(1)} mm/den; ` +
          `očekávané srážky jsou ${precip.toFixed(1)} mm. ` +
          `Deficit činí ${waterDeficit.toFixed(1)} mm. ` +
          `Kontinuální skóre vodní bilance je ${continuousWaterBalanceScore.toFixed(1)} bodu.`;

        const soil =
          weather?.soil_moisture_pct;

        const soilMin =
          cropProfile?.soil_moisture_min_pct;

        const soilMax =
          cropProfile?.soil_moisture_max_pct;

        if (
          soil != null &&
          soilMin != null &&
          soilMax != null
        ) {
          detail +=
            ` Půdní vlhkost ${soil.toFixed(1)} % je ` +
            `${
              soil < soilMin
                ? "pod"
                : soil > soilMax
                  ? "nad"
                  : "v"
            } ` +
            `doporučeným rozsahem ${soilMin.toFixed(1)}–${soilMax.toFixed(1)} %.`;
        }

        if (
          soil != null &&
          soilProfile?.wilting_point_pct != null &&
          soil <=
            soilProfile.wilting_point_pct
        ) {
          detail +=
            ` Současně je půdní vlhkost ${soil.toFixed(1)} % ` +
            `na/pod bodem vadnutí ${soilProfile.wilting_point_pct.toFixed(1)} %.`;
        }

        factors.push({
          label: "Vodní bilance",
          status: "Kritické",
          detail,
        });

        actions.push(
          "Prověřit vodní režim porostu a skutečnou půdní vlhkost; kontinuální skóre vodní bilance je v kritickém pásmu."
        );
      } else if (
        waterStatus ===
        "Upozornění"
      ) {
        warningCount++;

        let detail =
          `Pro fázi ${growthStage || "neuvedenou"} je Kc ${cropCoefficient.toFixed(2)}. ` +
          `ET₀ ${et0.toFixed(1)} mm/den odpovídá orientační ETc ${cropEt.toFixed(1)} mm/den; ` +
          `očekávané srážky jsou ${precip.toFixed(1)} mm. ` +
          `Orientační deficit činí ${waterDeficit.toFixed(1)} mm. ` +
          `Kontinuální skóre vodní bilance je ${continuousWaterBalanceScore.toFixed(1)} bodu.`;

        const soil =
          weather?.soil_moisture_pct;

        const soilMin =
          cropProfile?.soil_moisture_min_pct;

        const soilMax =
          cropProfile?.soil_moisture_max_pct;

        if (
          soil != null &&
          soilMin != null &&
          soilMax != null
        ) {
          if (
            soil < soilMin
          ) {
            detail +=
              ` Půdní vlhkost ${soil.toFixed(1)} % je pod doporučeným minimem ${soilMin.toFixed(1)} %.`;
          } else if (
            soil <= soilMax
          ) {
            detail +=
              ` Půdní vlhkost ${soil.toFixed(1)} % je zatím v doporučeném rozsahu ${soilMin.toFixed(1)}–${soilMax.toFixed(1)} %.`;
          } else {
            detail +=
              ` Půdní vlhkost ${soil.toFixed(1)} % je nad doporučeným maximem ${soilMax.toFixed(1)} %.`;
          }
        } else {
          detail +=
            " Aktuální půdní vlhkost nelze porovnat s doporučeným rozsahem.";
        }

        factors.push({
          label: "Vodní bilance",
          status: "Upozornění",
          detail,
        });

        actions.push(
          "Sledovat vodní režim porostu; kontinuální skóre vodní bilance je ve varovném pásmu."
        );
      } else {
        factors.push({
          label: "Vodní bilance",
          status: "OK",
          detail:
            `Růstová fáze ${growthStage || "neuvedená"} má Kc ${cropCoefficient.toFixed(2)}. ` +
            `ET₀ ${et0.toFixed(1)} mm/den, orientační ETc ${cropEt.toFixed(1)} mm/den, ` +
            `očekávané srážky ${precip.toFixed(1)} mm a kontinuální skóre vodní bilance ` +
            `${continuousWaterBalanceScore.toFixed(1)} bodu.`,
        });
      }
    } else if (
      Number.isFinite(precip)
    ) {
      // Fallback při absenci ET₀.
      // I zde používáme stejné hranice stavu jako u plného výpočtu,
      // aby faktor a score nikdy nebyly ve vzájemném rozporu.
      continuousWaterBalanceScore =
        clampScore(
          precip >= 5
            ? 100
            : precip >= 1
              ? 70 +
                ((precip - 1) /
                  4) *
                  30
              : precip * 70
        );

      const waterStatus =
        continuousWaterBalanceScore < 30
          ? "Kritické"
          : continuousWaterBalanceScore < 60
            ? "Upozornění"
            : "OK";

      if (
        waterStatus ===
        "Kritické"
      ) {
        criticalCount++;

        factors.push({
          label: "Vodní bilance",
          status: "Kritické",
          detail:
            `Za 24 h se očekává pouze ${precip.toFixed(1)} mm srážek. ` +
            `Pro přesnější výpočet chybí ET₀; Kc růstové fáze je ${cropCoefficient.toFixed(2)}. ` +
            `Kontinuální skóre vodní bilance je ${continuousWaterBalanceScore.toFixed(1)} bodu.`,
        });

        actions.push(
          "Prověřit vodní režim porostu; očekávané srážky jsou nízké a bez ET₀ nelze přesně určit vodní deficit."
        );
      } else if (
        waterStatus ===
        "Upozornění"
      ) {
        warningCount++;

        factors.push({
          label: "Vodní bilance",
          status: "Upozornění",
          detail:
            `Za 24 h se očekává ${precip.toFixed(1)} mm srážek. ` +
            `Pro přesnější výpočet chybí ET₀; Kc růstové fáze je ${cropCoefficient.toFixed(2)}. ` +
            `Kontinuální skóre vodní bilance je ${continuousWaterBalanceScore.toFixed(1)} bodu.`,
        });

        actions.push(
          "Sledovat vodní režim porostu; pro přesnější výpočet chybí ET₀."
        );
      } else {
        factors.push({
          label: "Vodní bilance",
          status: "OK",
          detail:
            `Očekávané srážky za 24 h: ${precip.toFixed(1)} mm. ` +
            `Pro přesnější vodní bilanci chybí ET₀; Kc růstové fáze je ${cropCoefficient.toFixed(2)}. ` +
            `Kontinuální skóre vodní bilance je ${continuousWaterBalanceScore.toFixed(1)} bodu.`,
        });
      }
    }
  } else {
    factors.push({
      label: "Vodní bilance",
      status: "N/A",
      detail:
        "Předpověď srážek není k dispozici.",
    });
  }

  // ---------------------------------------------------------
  // 6. Pravděpodobnost srážek, pokud ji API poskytne
  // ---------------------------------------------------------
  if (
    weather?.precipitation_probability_pct !=
    null
  ) {
    const probability =
      weather.precipitation_probability_pct;

    factors.push({
      label: "Pravděpodobnost srážek",
      status: "OK",
      detail:
        `Pravděpodobnost srážek je ${probability.toFixed(0)} %.`,
    });
  }

  // ---------------------------------------------------------
  // Kombinované riziko: současně nízké NDVI + vodní/tepelný stres
  // ---------------------------------------------------------
  const hasLowNdvi =
    ndvi < target * 0.8;

      // ---------------------------------------------------------
  // Diagnostika pravděpodobné příčiny
  // ---------------------------------------------------------

  const diagnosticEvidence: DiagnosticCause[] = [];

  const ndviFactor =
    factors.find(
      (factor) =>
        factor.label === "NDVI"
    );

  const ndviTrendFactor =
    factors.find(
      (factor) =>
        factor.label === "Trend NDVI"
    );

  const soilMoistureFactor =
    factors.find(
      (factor) =>
        factor.label === "Vlhkost půdy"
    );

  const waterBalanceFactor =
    factors.find(
      (factor) =>
        factor.label === "Vodní bilance"
    );

  const waterEvidence: string[] = [];

  if (
    ndviFactor &&
    (
      ndviFactor.status === "Upozornění" ||
      ndviFactor.status === "Kritické"
    )
  ) {
    waterEvidence.push(
      `NDVI: ${ndviFactor.detail}`
    );
  }

  if (
    ndviTrendFactor &&
    (
      ndviTrendFactor.status === "Upozornění" ||
      ndviTrendFactor.status === "Kritické"
    )
  ) {
    waterEvidence.push(
      `Trend NDVI: ${ndviTrendFactor.detail}`
    );
  }

  if (
    soilMoistureFactor &&
    (
      soilMoistureFactor.status === "Upozornění" ||
      soilMoistureFactor.status === "Kritické"
    )
  ) {
    waterEvidence.push(
      `Vlhkost půdy: ${soilMoistureFactor.detail}`
    );
  }

  if (
    waterBalanceFactor &&
    (
      waterBalanceFactor.status === "Upozornění" ||
      waterBalanceFactor.status === "Kritické"
    )
  ) {
    waterEvidence.push(
      `Vodní bilance: ${waterBalanceFactor.detail}`
    );
  }

  if (
    waterEvidence.length >= 2
  ) {
    const criticalWaterFactors =
      [
        ndviFactor,
        ndviTrendFactor,
        soilMoistureFactor,
        waterBalanceFactor,
      ].filter(
        (factor) =>
          factor?.status === "Kritické"
      ).length;

    const confidence =
      Math.min(
        0.95,
        0.55 +
          waterEvidence.length *
            0.10 +
          criticalWaterFactors *
            0.05
      );

    diagnosticEvidence.push({
      code: "WATER_STRESS",
      label: "Pravděpodobný vodní stres",
      confidence,
      evidence:
        waterEvidence.slice(0, 4),
    });
  }

  const hasWaterWarning =
    factors.some(
      (factor) =>
        factor.label ===
          "Vodní bilance" &&
        (
          factor.status ===
            "Upozornění" ||
          factor.status ===
            "Kritické"
        )
    );

  const hasCurrentTemperatureWarning =
    factors.some(
      (factor) =>
        factor.label ===
          "Teplota" &&
        (
          factor.status ===
            "Upozornění" ||
          factor.status ===
            "Kritické"
        )
    );

  const hasForecastTemperatureRisk =
    factors.some(
      (factor) =>
        factor.label ===
          "Teplotní výhled 24 h" &&
        (
          factor.status ===
            "Upozornění" ||
          factor.status ===
            "Kritické"
        )
    );

  if (
    hasLowNdvi &&
    hasWaterWarning &&
    hasCurrentTemperatureWarning
  ) {
    criticalCount++;

    factors.push({
      label: "Kombinované riziko",
      status: "Kritické",
      detail:
        "Současně je zaznamenána nízká vegetační aktivita a nepříznivá vodní i teplotní situace. Jde o kombinovaný signál, který vyžaduje terénní ověření.",
    });

    actions.push(
      "Provést prioritní terénní kontrolu porostu a ověřit vodní a teplotní stres před rozhodnutím o zásahu."
    );
  }

  // ---------------------------------------------------------
  // AEGRIS SCORE 0–100 — KANONICKÝ MODEL
  // ---------------------------------------------------------
  //
  // Váhy:
  // NDVI 25 % | Trend NDVI 20 % | Vodní bilance 20 %
  // Teplota 10 % | Teplotní výhled 10 % | Vlhkost půdy 15 %
  // CELKEM 100 %.
  //
  // Status faktoru a kontinuální score jsou oddělené.
  // Kombinované riziko se do score nepřičítá podruhé.
  //
  // Vodní bilance a půdní vlhkost jsou již vypočtené výše:
  // zde se pouze použijí jejich kanonické hodnoty.
  // Každý signál se do výsledného score započítává právě jednou.

  const scoreInterpolate = (
    value: number,
    points: Array<[number, number]>
  ): number => {
    if (!Number.isFinite(value)) {
      return 0;
    }

    if (value <= points[0][0]) {
      return points[0][1];
    }

    for (let i = 1; i < points.length; i++) {
      const [x1, y1] = points[i - 1];
      const [x2, y2] = points[i];

      if (value <= x2) {
        const ratio =
          (value - x1) /
          Math.max(x2 - x1, 0.000001);

        return y1 + (y2 - y1) * ratio;
      }
    }

    return points[points.length - 1][1];
  };

  // 1. NDVI — plynulé skóre podle poměru k cíli fáze.
  const ndviRatio =
    target > 0
      ? ndvi / target
      : 0;

  const continuousNdviScore =
    clampScore(
      scoreInterpolate(
        ndviRatio,
        [
          [0.40, 0],
          [0.50, 20],
          [0.65, 45],
          [0.80, 70],
          [0.90, 85],
          [1.00, 100],
        ]
      )
    );

  // 2. Trend NDVI — 60 % relativní změna, 40 % slope.
  let continuousTrendScore:
    number | null = null;

  if (trendHistory.length >= 2) {
    const values = [
      ...trendHistory.map(
        (item) => Number(item.ndvi)
      ),
      ndvi,
    ].filter(Number.isFinite);

    const n = values.length;
    const xMean = (n - 1) / 2;

    const yMean =
      values.reduce(
        (sum, value) => sum + value,
        0
      ) / n;

    let numerator = 0;
    let denominator = 0;

    values.forEach(
      (value, index) => {
        const xDelta =
          index - xMean;

        numerator +=
          xDelta * (value - yMean);

        denominator +=
          xDelta * xDelta;
      }
    );

    const slope =
      denominator > 0
        ? numerator / denominator
        : 0;

    const first = values[0];

    const relativeChangePct =
      Math.abs(first) > 0
        ? ((ndvi - first) /
            Math.abs(first)) *
          100
        : 0;

    const relativeScore =
      scoreInterpolate(
        relativeChangePct,
        [
          [-30, 0],
          [-20, 30],
          [-10, 60],
          [0, 80],
          [10, 90],
          [20, 100],
        ]
      );

    const slopeScore =
      scoreInterpolate(
        slope,
        [
          [-0.05, 0],
          [-0.03, 30],
          [-0.015, 60],
          [0, 80],
          [0.015, 90],
          [0.03, 100],
        ]
      );

    continuousTrendScore =
      clampScore(
        relativeScore * 0.6 +
        slopeScore * 0.4
      );
  } else if (
    previousNdvi != null &&
    Number.isFinite(previousNdvi)
  ) {
    const relativeChangePct =
      Math.abs(previousNdvi) > 0
        ? ((ndvi - previousNdvi) /
            Math.abs(previousNdvi)) *
          100
        : 0;

    continuousTrendScore =
      clampScore(
        scoreInterpolate(
          relativeChangePct,
          [
            [-30, 0],
            [-20, 30],
            [-10, 60],
            [0, 80],
            [10, 90],
            [20, 100],
          ]
        )
      );
  }

  // 3. Vodní bilance — hodnota je vypočtena jednou výše.
  // Pokud nejsou ET0 data, použije se její existující fallback.
  const waterBalanceScore =
    continuousWaterBalanceScore;

  // 4. Aktuální teplota.
  let continuousTemperatureScore:
    number | null = null;

  if (
    weather?.temperature_c != null &&
    stageMinTemperature != null &&
    stageMaxTemperature != null &&
    Number.isFinite(
      Number(weather.temperature_c)
    )
  ) {
    const temperature =
      Number(weather.temperature_c);

    const deviation =
      temperature < stageMinTemperature
        ? stageMinTemperature - temperature
        : temperature > stageMaxTemperature
          ? temperature - stageMaxTemperature
          : 0;

    continuousTemperatureScore =
      clampScore(
        scoreInterpolate(
          deviation,
          [
            [0, 100],
            [1, 85],
            [2, 70],
            [3, 55],
            [4, 35],
            [6, 0],
          ]
        )
      );
  }

  // 5. Teplotní výhled — mírnější než skutečně naměřená teplota.
  let continuousForecastTemperatureScore:
    number | null = null;

  if (
    weather?.next24h_min_temperature_c != null &&
    weather?.next24h_max_temperature_c != null &&
    stageMinTemperature != null &&
    stageMaxTemperature != null &&
    Number.isFinite(
      Number(
        weather.next24h_min_temperature_c
      )
    ) &&
    Number.isFinite(
      Number(
        weather.next24h_max_temperature_c
      )
    )
  ) {
    const forecastMin =
      Number(
        weather.next24h_min_temperature_c
      );

    const forecastMax =
      Number(
        weather.next24h_max_temperature_c
      );

    const deviation =
      Math.max(
        stageMinTemperature -
          forecastMin,
        forecastMax -
          stageMaxTemperature,
        0
      );

    continuousForecastTemperatureScore =
      clampScore(
        scoreInterpolate(
          deviation,
          [
            [0, 100],
            [1, 95],
            [2, 85],
            [3, 70],
            [4, 55],
            [6, 20],
          ]
        )
      );
  }

  // 6. Vlhkost půdy.
  // Preferujeme fyzikální profil projektu (wilting point -> 0,
  // field capacity -> 100). Pokud není k dispozici, použijeme
  // doporučený rozsah plodiny. U fallbacku je celý doporučený
  // rozsah hodnocen jako příznivý; mimo něj skóre klesá.
  let continuousSoilMoistureScore:
    number | null = null;

  if (
    weather?.soil_moisture_pct != null &&
    soilProfile?.wilting_point_pct != null &&
    soilProfile?.field_capacity_pct != null &&
    Number.isFinite(
      Number(weather.soil_moisture_pct)
    ) &&
    Number.isFinite(
      Number(soilProfile.wilting_point_pct)
    ) &&
    Number.isFinite(
      Number(soilProfile.field_capacity_pct)
    ) &&
    Number(
      soilProfile.field_capacity_pct
    ) >
      Number(
        soilProfile.wilting_point_pct
      )
  ) {
    const soil =
      Number(weather.soil_moisture_pct);

    const wp =
      Number(soilProfile.wilting_point_pct);

    const fc =
      Number(soilProfile.field_capacity_pct);

    continuousSoilMoistureScore =
      clampScore(
        ((soil - wp) /
          (fc - wp)) *
          100
      );
  } else if (
    weather?.soil_moisture_pct != null &&
    cropProfile?.soil_moisture_min_pct != null &&
    cropProfile?.soil_moisture_max_pct != null &&
    Number.isFinite(
      Number(weather.soil_moisture_pct)
    ) &&
    Number.isFinite(
      Number(cropProfile.soil_moisture_min_pct)
    ) &&
    Number.isFinite(
      Number(cropProfile.soil_moisture_max_pct)
    ) &&
    Number(
      cropProfile.soil_moisture_max_pct
    ) >
      Number(
        cropProfile.soil_moisture_min_pct
      )
  ) {
    const soil =
      Number(weather.soil_moisture_pct);

    const min =
      Number(cropProfile.soil_moisture_min_pct);

    const max =
      Number(cropProfile.soil_moisture_max_pct);

    const range =
      max - min;

    if (soil >= min && soil <= max) {
      continuousSoilMoistureScore = 100;
    } else {
      const distance =
        soil < min
          ? min - soil
          : soil - max;

      // Jeden celý rozsah mimo doporučené pásmo odpovídá
      // poklesu o 70 bodů; hodnota zůstává plynulá.
      continuousSoilMoistureScore =
        clampScore(
          100 -
            (distance / range) * 70
        );
    }
  }

  // Kanonické faktory — pouze těchto šest má váhu v AEGRIS SCORE.
  const weightedFactors = [
    {
      label: "NDVI",
      weight: 25,
      value: continuousNdviScore,
    },
    {
      label: "Trend NDVI",
      weight: 20,
      value: continuousTrendScore,
    },
    {
      label: "Vodní bilance",
      weight: 20,
      value: waterBalanceScore,
    },
    {
      label: "Teplota",
      weight: 10,
      value: continuousTemperatureScore,
    },
    {
      label: "Teplotní výhled 24 h",
      weight: 10,
      value: continuousForecastTemperatureScore,
    },
    {
      label: "Vlhkost půdy",
      weight: 15,
      value: continuousSoilMoistureScore,
    },
  ];

  const availableFactors =
    weightedFactors.filter(
      (factor) =>
        factor.value != null &&
        Number.isFinite(
          Number(factor.value)
        )
    );

  const totalWeight =
    availableFactors.reduce(
      (sum, factor) =>
        sum + factor.weight,
      0
    );

  const weightedScore =
    totalWeight > 0
      ? availableFactors.reduce(
          (sum, factor) =>
            sum +
            Number(factor.value) *
              factor.weight,
          0
        ) / totalWeight
      : 0;

      console.log("AEGRIS SCORE DEBUG", {
        availableFactors,
        totalWeight,
        weightedScore,
      });

  const score =
    Math.round(
      clampScore(weightedScore)
    );

  const scoreBreakdown:
    ScoreBreakdownItem[] =
    availableFactors.map(
      (factor) => ({
        label: factor.label,
        score: Math.round(
          Number(factor.value)
        ),
        weight: factor.weight,
        contribution:
          Math.round(
            (
              (Number(factor.value) *
                factor.weight) /
              totalWeight
            ) *
              100
          ) / 100,
      })
    );

  const dataCompletenessPct =
    Math.round(
      (availableFactors.length /
        weightedFactors.length) *
        100
    );

  const scoreLevel:
    ContextEvaluation["scoreLevel"] =
    score >= 85
      ? "Velmi dobrý stav"
      : score >= 70
        ? "Dobrý stav"
        : score >= 55
          ? "Zvýšené riziko"
          : score >= 40
            ? "Vysoké riziko"
            : "Kritický stav";

  let level:
    ContextEvaluation["level"];

  if (score >= 70) {
    level =
      warningCount > 0
        ? "Upozornění"
        : "Optimální";
  } else if (score >= 40) {
    level = "Upozornění";
  } else {
    level = "Kritické";
  }

  const cropLabel =
    cropProfile?.name ??
    "plodina";

  const stageLabel =
    growthStage ||
    "aktuální růstová fáze";

  let summary =
    level === "Kritické"
      ? `AEGRIS identifikoval kritický stav projektu s plodinou ${cropLabel}.`
      : level === "Upozornění"
        ? `AEGRIS identifikoval podmínku, kterou je vhodné u ${cropLabel} sledovat.`
        : `Aktuálně dostupná data jsou pro ${cropLabel} bez významného varovného signálu.`;

  if (hasLowNdvi) {
    summary +=
      ` NDVI je pod orientační úrovní pro fázi ${stageLabel}.`;
  } else if (
    previousNdvi != null &&
    ndvi > previousNdvi
  ) {
    summary +=
      " NDVI je oproti předchozímu měření vyšší.";
  } else if (
    previousNdvi != null &&
    ndvi < previousNdvi
  ) {
    summary +=
      " NDVI je oproti předchozímu měření nižší.";
  }

  let recommendation =
    level === "Kritické"
      ? "Projekt vyžaduje zvýšenou pozornost. Nejprve ověřte kritické faktory přímo v terénu a následně rozhodněte o dalším zásahu."
      : level === "Upozornění"
        ? "Projekt je monitorovatelný, ale některý z dostupných ukazatelů vyžaduje pozornost. Sledujte jeho vývoj a ověřte skutečný stav porostu."
        : "Projekt je podle aktuálně dostupných dat v příznivém stavu. Pokračujte v pravidelném monitoringu a sledujte změnu trendu.";

  if (hasWaterWarning) {
    recommendation +=
      " Vodní režim vyžaduje zvýšenou pozornost vzhledem ke kombinaci dostupné vlhkosti, očekávaných srážek a evapotranspirace.";
  }

  if (hasCurrentTemperatureWarning) {
    recommendation +=
      " Aktuální teplotní podmínky jsou mimo doporučený rozsah plodiny a vyžadují ověření v terénu.";
  }

  if (hasForecastTemperatureRisk) {
    recommendation +=
      " Teplotní výhled na dalších 24 hodin představuje předpokládané riziko, které je vhodné sledovat.";
  }

  if (actions.length === 0) {
    actions.push(
      "Pokračovat v pravidelném monitoringu a porovnat další NDVI analýzu s aktuálním stavem projektu."
    );
  }

  const prioritizedActions = [
    ...(hasWaterWarning
      ? [
          "Prověřit vodní režim porostu a skutečnou půdní vlhkost v terénu.",
        ]
      : []),

    ...(level === "Kritické"
      ? [
          "Provést prioritní terénní kontrolu porostu před rozhodnutím o zásahu.",
        ]
      : []),

    ...actions,
  ];

  const priority:
    ContextEvaluation["priority"] =
    level === "Kritické"
      ? "Kritická"
      : criticalCount > 0
        ? "Vysoká"
        : warningCount >= 2
          ? "Vysoká"
          : warningCount === 1
            ? "Střední"
            : "Nízká";

  return {
    level,
    priority,
    score,
    scoreLevel,
    trend: ndviTrend,
    scoreBreakdown,
    criticalFactorCount:
      criticalCount,
    warningFactorCount:
      warningCount,
    evaluatedFactorCount:
      evaluatedCount,
    dataCompletenessPct,
    summary,
    recommendation,
    actions: Array.from(
      new Set(prioritizedActions)
    ).slice(0, 5),
    diagnoses: diagnosticEvidence,
    factors,
  };
}