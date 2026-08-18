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

export type ContextEvaluation = {
  level: "Optimální" | "Upozornění" | "Kritické" | "Bez vyhodnocení";
  priority: "Nízká" | "Střední" | "Vysoká" | "Kritická";
  score: number;
  scoreLevel: "Velmi dobrý stav" | "Dobrý stav" | "Zvýšené riziko" | "Vysoké riziko" | "Kritický stav";
  trend: NdviTrend;
  scoreBreakdown: ScoreBreakdownItem[];
  criticalFactorCount: number;
  warningFactorCount: number;
  evaluatedFactorCount: number;
  dataCompletenessPct: number;
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
  const value = Date.parse(item.period_from || item.period_to || item.created_at);
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
  if (currentNdvi == null || !Number.isFinite(currentNdvi)) {
    return { direction: "Nedostatek dat", slope: null, overallDelta: null, overallRelativeChangePct: null, latestChange: null, previousNdvi: null, points: 0 };
  }

  const canonical = buildCanonicalNdviHistory(ndviHistory, currentNdvi, analysisCreatedAt);
  const historical = canonical.filter((item) => !(item.id === -1));
  const previousNdvi = historical.length ? Number(historical[historical.length - 1].ndvi) : null;
  const values = historical.slice(-5).map((item) => Number(item.ndvi)).concat(currentNdvi);

  if (values.length < 2) {
    return { direction: "Nedostatek dat", slope: null, overallDelta: null, overallRelativeChangePct: null, latestChange: previousNdvi == null ? null : currentNdvi - previousNdvi, previousNdvi, points: values.length };
  }

  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((sum, value) => sum + value, 0) / n;
  let numerator = 0;
  let denominator = 0;
  values.forEach((value, index) => {
    const xDelta = index - xMean;
    numerator += xDelta * (value - yMean);
    denominator += xDelta * xDelta;
  });

  const slope = denominator > 0 ? numerator / denominator : 0;
  const first = values[0];
  const overallDelta = currentNdvi - first;
  const overallRelativeChangePct = Math.abs(first) > 0 ? (overallDelta / Math.abs(first)) * 100 : 0;
  const latestChange = previousNdvi == null ? null : currentNdvi - previousNdvi;

  const direction =
    slope <= -0.015 || overallRelativeChangePct <= -10
      ? "Klesající"
      : slope >= 0.015 || overallRelativeChangePct >= 10
        ? "Rostoucí"
        : "Stabilní";

  return { direction, slope, overallDelta, overallRelativeChangePct, latestChange, previousNdvi, points: values.length };
}

export function evaluateProjectContext(
  ndvi: number | null,
  cropProfile: CropProfile | null,
  cropStageProfile: CropStageProfile | null,
  growthStage: string,
  weather: WeatherData | null,
  ndviHistory: NdviHistory[] = [],
  analysisCreatedAt: string | null = null
): ContextEvaluation {
  if (ndvi == null || !Number.isFinite(ndvi)) {
    return {
      level: "Bez vyhodnocení",
      priority: "Nízká",
      score: 0,
      scoreLevel: "Kritický stav",
      trend: { direction: "Nedostatek dat", slope: null, overallDelta: null, overallRelativeChangePct: null, latestChange: null, previousNdvi: null, points: 0 },
      scoreBreakdown: [],
      criticalFactorCount: 0,
      warningFactorCount: 0,
      evaluatedFactorCount: 0,
      dataCompletenessPct: 0,
      summary: "Zatím není k dispozici platná NDVI analýza.",
      recommendation:
        "Spusťte AI analýzu projektu. Po jejím dokončení AEGRIS doplní kontext počasí, požadavků plodiny a vývoje porostu.",
      actions: [
        "Spustit aktuální AI analýzu projektu.",
        "Zkontrolovat, že je vybraná plodina a růstová fáze.",
      ],
      factors: [
        {
          label: "NDVI",
          status: "N/A",
          detail: "Chybí aktuální analýza.",
        },
        {
          label: "Počasí",
          status: weather ? "OK" : "N/A",
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

  const target = stageTarget[growthStage] ?? 0.40;

  const stageKc =
    cropStageProfile?.kc != null &&
    Number.isFinite(Number(cropStageProfile.kc))
      ? Number(cropStageProfile.kc)
      : null;

  const stageMinTemperature =
    cropStageProfile?.min_temperature_c != null
      ? Number(cropStageProfile.min_temperature_c)
      : cropProfile?.min_temperature_c ?? null;

  const stageMaxTemperature =
    cropStageProfile?.max_temperature_c != null
      ? Number(cropStageProfile.max_temperature_c)
      : cropProfile?.max_temperature_c ?? null;

  const waterStressSensitivity =
    cropStageProfile?.water_stress_sensitivity?.toLowerCase() ??
    cropProfile?.water_need?.toLowerCase() ??
    "";

    const sensitivityKey =
    waterStressSensitivity.includes("velmi vysok")
      ? "velmi-vysoka"
      : waterStressSensitivity.includes("vysok")
        ? "vysoka"
        : waterStressSensitivity.includes("nízk")
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

  const factors: ContextEvaluation["factors"] = [];
  let criticalCount = 0;
  let warningCount = 0;
  let evaluatedCount = 0;
  const actions: string[] = [];

  // ---------------------------------------------------------
  // 1. NDVI / růstová fáze
  // ---------------------------------------------------------
  if (ndvi < 0.20) {
    criticalCount++;
    evaluatedCount++;
    factors.push({
      label: "NDVI",
      status: "Kritické",
      detail: `${ndvi.toFixed(3)} je velmi nízké pro aktuálně sledovaný porost.`,
    });
  } else if (ndvi < target * 0.80) {
    warningCount++;
    evaluatedCount++;
    factors.push({
      label: "NDVI",
      status: "Upozornění",
      detail: `${ndvi.toFixed(3)} je pod orientační úrovní ${target.toFixed(2)} pro fázi ${growthStage || "projektu"}.`,
    });
    actions.push(
      `Zkontrolovat stav porostu, protože NDVI ${ndvi.toFixed(3)} je pod orientační úrovní pro fázi ${growthStage || "projektu"}.`
    );
  } else {
    evaluatedCount++;
    factors.push({
      label: "NDVI",
      status: "OK",
      detail: `${ndvi.toFixed(3)} odpovídá orientační úrovni pro fázi ${growthStage || "projektu"}.`,
    });
  }

  // ---------------------------------------------------------
  // 2. NDVI trend
  // ---------------------------------------------------------
  // Trend nehodnotíme pouze proti jednomu předchozímu bodu.
  // Použijeme až posledních 5 historických měření a aktuální NDVI.
  // Tím se omezí falešné signály způsobené jedním výkyvem.
  const canonicalNdviHistory = buildCanonicalNdviHistory(ndviHistory, ndvi, analysisCreatedAt);
  const historicalNdvi = canonicalNdviHistory.filter((item) => item.id !== -1);
  const trendHistory = historicalNdvi.slice(-5);
  const ndviTrend = calculateNdviTrend(ndviHistory, ndvi, analysisCreatedAt);
  const previousNdvi = ndviTrend.previousNdvi ?? undefined;

  if (trendHistory.length >= 2) {
    evaluatedCount++;
    const slope = ndviTrend.slope ?? 0;
    const overallDelta = ndviTrend.overallDelta ?? 0;
    const overallRelativeChange = ndviTrend.overallRelativeChangePct ?? 0;
    const criticalTrend = slope <= -0.03 || overallRelativeChange <= -20;
    const warningTrend = slope <= -0.015 || overallRelativeChange <= -10;

    if (criticalTrend) {
      criticalCount++;
      factors.push({ label: "Trend NDVI", status: "Kritické", detail: `NDVI má za posledních ${ndviTrend.points} měření výrazně klesající trend. Lineární sklon je ${slope >= 0 ? "+" : ""}${slope.toFixed(3)} NDVI/měření a celková změna činí ${overallDelta >= 0 ? "+" : ""}${overallDelta.toFixed(3)} (${overallRelativeChange >= 0 ? "+" : ""}${overallRelativeChange.toFixed(1)} %).` });
      actions.push("Prověřit příčinu dlouhodobějšího poklesu vegetačního indexu a porovnat jej s vodním, teplotním a půdním stavem.");
    } else if (warningTrend) {
      warningCount++;
      factors.push({ label: "Trend NDVI", status: "Upozornění", detail: `NDVI má za posledních ${ndviTrend.points} měření klesající trend. Lineární sklon je ${slope >= 0 ? "+" : ""}${slope.toFixed(3)} NDVI/měření a celková změna činí ${overallDelta >= 0 ? "+" : ""}${overallDelta.toFixed(3)} (${overallRelativeChange >= 0 ? "+" : ""}${overallRelativeChange.toFixed(1)} %).` });
      actions.push("Sledovat další NDVI měření a ověřit, zda pokles pokračuje i v následující analýze.");
    } else {
      factors.push({ label: "Trend NDVI", status: "OK", detail: `NDVI má za posledních ${ndviTrend.points} měření ${ndviTrend.direction.toLowerCase()} trend. Lineární sklon je ${slope >= 0 ? "+" : ""}${slope.toFixed(3)} NDVI/měření a celková změna činí ${overallDelta >= 0 ? "+" : ""}${overallDelta.toFixed(3)} (${overallRelativeChange >= 0 ? "+" : ""}${overallRelativeChange.toFixed(1)} %).` });
    }
  } else if (previousNdvi != null && Number.isFinite(previousNdvi)) {
    evaluatedCount++;
    const delta = ndviTrend.latestChange ?? 0;
    const relativeChange = Math.abs(previousNdvi) > 0 ? (delta / Math.abs(previousNdvi)) * 100 : 0;
    const isCritical = delta <= -0.15 || relativeChange <= -25;
    const isWarning = delta <= -0.08 || relativeChange <= -15;

    if (isCritical || isWarning) {
      if (isCritical) criticalCount++; else warningCount++;
      factors.push({ label: "Trend NDVI", status: isCritical ? "Kritické" : "Upozornění", detail: `NDVI se oproti předchozímu měření změnilo z ${previousNdvi.toFixed(3)} na ${ndvi.toFixed(3)} (${delta >= 0 ? "+" : ""}${delta.toFixed(3)}, ${relativeChange >= 0 ? "+" : ""}${relativeChange.toFixed(1)} %).` });
      actions.push("Prověřit příčinu změny vegetačního indexu a porovnat aktuální stav s předchozím měřením.");
    } else {
      factors.push({ label: "Trend NDVI", status: "OK", detail: `NDVI je oproti předchozímu měření relativně stabilní (${delta >= 0 ? "+" : ""}${delta.toFixed(3)}).` });
    }
  } else {
    factors.push({ label: "Trend NDVI", status: "N/A", detail: "Pro vyhodnocení trendu není k dispozici dostatek historických NDVI měření." });
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
    const temperature = weather.temperature_c;
    const min = stageMinTemperature;
    const max = stageMaxTemperature;

    if (
      temperature < min - 3 ||
      temperature > max + 3
    ) {
      criticalCount++;
      factors.push({
        label: "Teplota",
        status: "Kritické",
        detail: `${temperature.toFixed(1)} °C je výrazně mimo profil ${min}–${max} °C.`,
      });
    } else if (temperature < min || temperature > max) {
      warningCount++;
      factors.push({
        label: "Teplota",
        status: "Upozornění",
        detail: `${temperature.toFixed(1)} °C je mimo orientační rozsah ${min}–${max} °C.`,
      });
    } else {
      factors.push({
        label: "Teplota",
        status: "OK",
        detail: `${temperature.toFixed(1)} °C je v orientačním rozsahu ${min}–${max} °C.`,
      });
    }
  } else if (weather?.temperature_c != null) {
    factors.push({
      label: "Teplota",
      status: "N/A",
      detail: `${weather.temperature_c.toFixed(1)} °C. Pro porovnání chybí kompletní profil plodiny.`,
    });
  } else {
    factors.push({
      label: "Teplota",
      status: "N/A",
      detail: "Aktuální teplota není k dispozici.",
    });
  }

  if (
    weather?.next24h_min_temperature_c != null &&
    weather?.next24h_max_temperature_c != null &&
    stageMinTemperature != null &&
    stageMaxTemperature != null
  ) {
    evaluatedCount++;
    const forecastMin = weather.next24h_min_temperature_c;
    const forecastMax = weather.next24h_max_temperature_c;
    const min = stageMinTemperature;
    const max = stageMaxTemperature;

    if (forecastMin < min - 3 || forecastMax > max + 3) {
      // Výhled je predikované riziko, nikoli potvrzený aktuální stres.
      // Proto nezvyšuje criticalCount; v celkovém skóre se započítá
      // jako upozornění (50 bodů), aby měl vliv, ale nepřevážil aktuální stav.
      warningCount++;
      factors.push({
        label: "Teplotní výhled 24 h",
        status: "Upozornění",
        detail: `Předpověď pro dalších 24 h je ${forecastMin.toFixed(1)} až ${forecastMax.toFixed(1)} °C, což je výrazně mimo profil plodiny. Jde o předpokládané riziko, nikoli automaticky o potvrzený teplotní stres.`,
      });
      actions.push(
        "Sledovat teplotní vývoj v dalších 24 hodinách a ověřit riziko teplotního stresu v terénu."
      );
    } else if (forecastMin < min || forecastMax > max) {
      warningCount++;
      factors.push({
        label: "Teplotní výhled 24 h",
        status: "Upozornění",
        detail: `Předpověď pro dalších 24 h je ${forecastMin.toFixed(1)} až ${forecastMax.toFixed(1)} °C a zasahuje mimo profil plodiny ${min}–${max} °C.`,
      });
      actions.push(
        "Sledovat teplotní vývoj v dalších 24 hodinách."
      );
    } else {
      factors.push({
        label: "Teplotní výhled 24 h",
        status: "OK",
        detail: `Předpověď pro dalších 24 h je ${forecastMin.toFixed(1)} až ${forecastMax.toFixed(1)} °C a zůstává v profilu plodiny.`,
      });
    }
  } else {
    factors.push({
      label: "Teplotní výhled 24 h",
      status: "N/A",
      detail: "24hodinový teplotní výhled nebo profil plodiny není kompletně k dispozici.",
    });
  }

  // ---------------------------------------------------------
  // 4. Vlhkost půdy
  // ---------------------------------------------------------
  if (
    weather?.soil_moisture_pct != null &&
    cropProfile?.soil_moisture_min_pct != null &&
    cropProfile?.soil_moisture_max_pct != null
  ) {
    evaluatedCount++;
    const soil = weather.soil_moisture_pct;
    const min = cropProfile.soil_moisture_min_pct;
    const max = cropProfile.soil_moisture_max_pct;

    if (soil < min * 0.75 || soil > max * 1.25) {
      criticalCount++;
      factors.push({
        label: "Vlhkost půdy",
        status: "Kritické",
        detail: `${soil.toFixed(1)} % je výrazně mimo orientační rozsah ${min}–${max} %.`,
      });
      actions.push(
        "Ověřit skutečnou půdní vlhkost v terénu; dostupný údaj je modelový a nemusí reprezentovat celé pole."
      );
    } else if (soil < min || soil > max) {
      warningCount++;
      factors.push({
        label: "Vlhkost půdy",
        status: "Upozornění",
        detail: `${soil.toFixed(1)} % je mimo orientační rozsah ${min}–${max} %.`,
      });
      actions.push(
        "Ověřit skutečnou půdní vlhkost, protože dostupný údaj je modelový a nemusí reprezentovat celé pole."
      );
    } else {
      factors.push({
        label: "Vlhkost půdy",
        status: "OK",
        detail: `${soil.toFixed(1)} % je v orientačním rozsahu ${min}–${max} %.`,
      });
    }
  } else if (weather?.soil_moisture_pct != null) {
    factors.push({
      label: "Vlhkost půdy",
      status: "N/A",
      detail: `${weather.soil_moisture_pct.toFixed(1)} %. Pro porovnání chybí rozsah v profilu plodiny.`,
    });
  } else {
    factors.push({
      label: "Vlhkost půdy",
      status: "N/A",
      detail: "Měřená vlhkost půdy není k dispozici.",
    });
  }

  // ---------------------------------------------------------
  // 5. Vodní bilance: srážky + evapotranspirace + Kc růstové fáze
  // ---------------------------------------------------------

  const precipitation24h = weather?.next24h_precipitation_mm;
  const evapotranspiration = weather?.evapotranspiration_mm;
  const cropCoefficient = stageKc ?? 1;

  if (precipitation24h != null) {
    const precip = Number(precipitation24h);

    const et0 =
      evapotranspiration != null
        ? Number(evapotranspiration)
        : null;

    evaluatedCount++;

    if (et0 != null && Number.isFinite(et0)) {
      const cropEt = et0 * cropCoefficient;
      const waterDeficit = cropEt - precip;

      const criticalDeficit = 3 / sensitivityFactor;
      const warningDeficit = 1.5 / sensitivityFactor;

      const soil = weather?.soil_moisture_pct;
      const soilMin = cropProfile?.soil_moisture_min_pct;
      const soilMax = cropProfile?.soil_moisture_max_pct;

      const hasSoilRange =
        soil != null &&
        soilMin != null &&
        soilMax != null;

      const soilBelowOptimal =
        hasSoilRange && soil < soilMin;

      if (
        waterDeficit >= criticalDeficit &&
        soilBelowOptimal
      ) {
        criticalCount++;

        factors.push({
          label: "Vodní bilance",
          status: "Kritické",
          detail:
            `Pro fázi ${growthStage || "neuvedenou"} je Kc ${cropCoefficient.toFixed(2)}. ` +
            `ET₀ ${et0.toFixed(1)} mm/den odpovídá orientační ETc ${cropEt.toFixed(1)} mm/den; ` +
            `očekávané srážky jsou ${precip.toFixed(1)} mm. ` +
            `Deficit činí ${waterDeficit.toFixed(1)} mm ` +
            `a půdní vlhkost ${soil!.toFixed(1)} % je pod doporučeným minimem ${soilMin!.toFixed(1)} %.`,
        });

        actions.push(
          "Prověřit vodní režim porostu a skutečnou půdní vlhkost; kombinace predikovaného vodního deficitu a nízké půdní vlhkosti představuje zvýšené riziko vodního stresu."
        );

      } else if (
        (waterDeficit >= warningDeficit && soilBelowOptimal) ||
        (waterDeficit >= criticalDeficit && hasSoilRange && !soilBelowOptimal) ||
        (waterDeficit >= warningDeficit && !hasSoilRange)
      ) {
        warningCount++;

        let detail =
          `Pro fázi ${growthStage || "neuvedenou"} je Kc ${cropCoefficient.toFixed(2)}. ` +
          `ET₀ ${et0.toFixed(1)} mm/den odpovídá orientační ETc ${cropEt.toFixed(1)} mm/den; ` +
          `očekávané srážky jsou ${precip.toFixed(1)} mm. ` +
          `Orientační deficit činí ${waterDeficit.toFixed(1)} mm.`;

        if (soilBelowOptimal) {
          detail +=
            ` Půdní vlhkost ${soil!.toFixed(1)} % je pod doporučeným minimem ${soilMin!.toFixed(1)} %.`;
        } else if (hasSoilRange) {
          detail +=
            ` Půdní vlhkost ${soil!.toFixed(1)} % je zatím v doporučeném rozsahu ${soilMin!.toFixed(1)}–${soilMax!.toFixed(1)} %, takže jde především o predikované riziko.`;
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
          soilBelowOptimal
            ? "Sledovat půdní vlhkost a vývoj porostu; očekávané srážky nepokrývají orientační spotřebu vody a půdní vlhkost je již pod optimem."
            : "Sledovat vodní režim porostu; očekávaný deficit naznačuje riziko vodního stresu, ale současná půdní vlhkost jej zatím nepotvrzuje."
        );

      } else {
        factors.push({
          label: "Vodní bilance",
          status: "OK",
          detail:
            `Růstová fáze ${growthStage || "neuvedená"} má Kc ${cropCoefficient.toFixed(2)}. ` +
            `ET₀ ${et0.toFixed(1)} mm/den, orientační ETc ${cropEt.toFixed(1)} mm/den ` +
            `a očekávané srážky ${precip.toFixed(1)} mm.`,
        });
      }

    } else if (precip < 1) {
      warningCount++;

      factors.push({
        label: "Vodní bilance",
        status: "Upozornění",
        detail:
          `Za 24 h se očekává pouze ${precip.toFixed(1)} mm srážek. ` +
          `Pro přesnější posouzení chybí ET₀; růstová fáze má Kc ${cropCoefficient.toFixed(2)}.`,
      });

      actions.push(
        "Sledovat vodní režim porostu; v následujících 24 hodinách se očekává méně než 1 mm srážek a není k dispozici ET₀ pro přesnější výpočet."
      );

    } else {
      factors.push({
        label: "Vodní bilance",
        status: "OK",
        detail:
          `Očekávané srážky za 24 h: ${precip.toFixed(1)} mm. ` +
          `Pro přesnější vodní bilanci chybí ET₀; ` +
          `Kc růstové fáze je ${cropCoefficient.toFixed(2)}.`,
      });
    }

  } else {
    factors.push({
      label: "Vodní bilance",
      status: "N/A",
      detail: "Předpověď srážek není k dispozici.",
    });
  }

  // ---------------------------------------------------------
  // 6. Pravděpodobnost srážek, pokud ji API poskytne
  // ---------------------------------------------------------
  if (weather?.precipitation_probability_pct != null) {
    const probability = weather.precipitation_probability_pct;
    factors.push({
      label: "Pravděpodobnost srážek",
      status: "OK",
      detail: `Pravděpodobnost srážek je ${probability.toFixed(0)} %.`,
    });
  }

  // ---------------------------------------------------------
  // Kombinované riziko: současně nízké NDVI + vodní/tepelný stres
  // ---------------------------------------------------------
  const hasLowNdvi = ndvi < target * 0.8;
  const hasWaterWarning = factors.some(
    (factor) =>
      factor.label === "Vodní bilance" &&
      (factor.status === "Upozornění" || factor.status === "Kritické")
  );
  const hasCurrentTemperatureWarning = factors.some(
    (factor) =>
      factor.label === "Teplota" &&
      (factor.status === "Upozornění" || factor.status === "Kritické")
  );

  const hasForecastTemperatureRisk = factors.some(
    (factor) =>
      factor.label === "Teplotní výhled 24 h" &&
      (factor.status === "Upozornění" || factor.status === "Kritické")
  );

  if (hasLowNdvi && hasWaterWarning && hasCurrentTemperatureWarning) {
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
// AEGRIS SCORE 0–100
// ---------------------------------------------------------
// Skóre je kontinuální, nikoli pouze 0 / 50 / 100 podle stavu faktoru.
// Každý dostupný faktor má vlastní hodnotu 0–100 a následně se
// započítá podle své váhy. Alarmový level/priority zůstává oddělený.

const clampScore = (value: number) =>
  Math.max(0, Math.min(100, value));

// 1. NDVI: 100 = dosažený/lepší cíl fáze.
// 70 = spodní hranice současného pásma OK (80 % cíle).
// 0 = polovina cíle nebo méně.
const continuousNdviScore =
  target <= 0
    ? null
    : ndvi >= target
      ? 100
      : ndvi >= target * 0.8
        ? 70 +
          ((ndvi - target * 0.8) / (target * 0.2)) * 30
        : ndvi >= target * 0.5
          ? ((ndvi - target * 0.5) / (target * 0.3)) * 70
          : 0;

// 2. Trend NDVI: stabilní stav je 85 bodů, zlepšení postupně
// skóre zvyšuje a pokles jej snižuje. Při výrazném poklesu
// se zohlední také lineární sklon posledních měření.
let continuousTrendScore: number | null = null;

if (trendHistory.length >= 2) {
  const trendValues = [...trendHistory.map((item) => item.ndvi), ndvi];
  const n = trendValues.length;
  const xMean = (n - 1) / 2;
  const yMean =
    trendValues.reduce((sum, value) => sum + value, 0) / n;

  let numerator = 0;
  let denominator = 0;

  trendValues.forEach((value, index) => {
    const xDelta = index - xMean;
    numerator += xDelta * (value - yMean);
    denominator += xDelta * xDelta;
  });

  const slope = denominator > 0 ? numerator / denominator : 0;
  const firstTrendNdvi = trendValues[0];
  const overallRelativeChange =
    Math.abs(firstTrendNdvi) > 0
      ? ((ndvi - firstTrendNdvi) / Math.abs(firstTrendNdvi)) * 100
      : 0;

  const relativeScore = clampScore(85 + overallRelativeChange * 1.5);
  const slopeScore = clampScore(85 + slope * 1000);

  continuousTrendScore =
    relativeScore * 0.7 + slopeScore * 0.3;
} else if (previousNdvi != null && Number.isFinite(previousNdvi)) {
  const relativeChange =
    Math.abs(previousNdvi) > 0
      ? ((ndvi - previousNdvi) / Math.abs(previousNdvi)) * 100
      : 0;

  continuousTrendScore = clampScore(85 + relativeChange * 1.5);
}

// 3. Aktuální teplota. Uvnitř profilu = 100.
// Odchylka 3 °C nebo více mimo profil = 0.
let continuousTemperatureScore: number | null = null;

if (
  weather?.temperature_c != null &&
  stageMinTemperature != null &&
  stageMaxTemperature != null
) {
  const temperature = weather.temperature_c;
  const distanceOutside =
    temperature < stageMinTemperature
      ? stageMinTemperature - temperature
      : temperature > stageMaxTemperature
        ? temperature - stageMaxTemperature
        : 0;

  continuousTemperatureScore = clampScore(
    100 - (distanceOutside / 3) * 100
  );
}

// 4. Teplotní výhled 24 h. Stejná škála jako aktuální teplota,
// ale protože jde o predikci, není samostatně povýšen na kritický alarm.
let continuousForecastTemperatureScore: number | null = null;

if (
  weather?.next24h_min_temperature_c != null &&
  weather?.next24h_max_temperature_c != null &&
  stageMinTemperature != null &&
  stageMaxTemperature != null
) {
  const forecastMin = weather.next24h_min_temperature_c;
  const forecastMax = weather.next24h_max_temperature_c;
  const distanceOutside = Math.max(
    stageMinTemperature - forecastMin,
    forecastMax - stageMaxTemperature,
    0
  );

  continuousForecastTemperatureScore = clampScore(
    100 - (distanceOutside / 3) * 100
  );
}

// 5. Vlhkost půdy. Uprostřed doporučeného rozsahu = 100.
// Na hranici rozsahu = 70, 25 % za hranicí = 0.
let continuousSoilMoistureScore: number | null = null;

if (
  weather?.soil_moisture_pct != null &&
  cropProfile?.soil_moisture_min_pct != null &&
  cropProfile?.soil_moisture_max_pct != null
) {
  const soil = weather.soil_moisture_pct;
  const min = cropProfile.soil_moisture_min_pct;
  const max = cropProfile.soil_moisture_max_pct;
  const range = Math.max(max - min, 1);

  if (soil >= min && soil <= max) {
    const midpoint = (min + max) / 2;
    const normalizedDistance =
      Math.abs(soil - midpoint) / (range / 2);

    continuousSoilMoistureScore = clampScore(
      100 - normalizedDistance * 30
    );
  } else {
    const distanceOutside =
      soil < min ? min - soil : soil - max;
    continuousSoilMoistureScore = clampScore(
      70 - (distanceOutside / (range * 0.25)) * 70
    );
  }
}

// 6. Vodní bilance. 100 = bez deficitu, 50 = orientační
// varovný deficit, 0 = kritický deficit. Citlivost plodiny/fáze
// proto přímo ovlivňuje, jak rychle skóre klesá.
let continuousWaterBalanceScore: number | null = null;

const precipitation24hForScore = weather?.next24h_precipitation_mm;
const evapotranspirationForScore = weather?.evapotranspiration_mm;
const cropCoefficientForScore = stageKc ?? 1;

if (precipitation24hForScore != null) {
  const precip = Number(precipitation24hForScore);
  const et0 =
    evapotranspirationForScore != null
      ? Number(evapotranspirationForScore)
      : null;

  if (Number.isFinite(precip) && et0 != null && Number.isFinite(et0)) {
    const cropEt = et0 * cropCoefficientForScore;
    const waterDeficit = cropEt - precip;
    const criticalDeficit = 3 / sensitivityFactor;

    continuousWaterBalanceScore = clampScore(
      100 -
        (Math.max(0, waterDeficit) / Math.max(criticalDeficit, 0.01)) *
          100
    );

    // Nízká půdní vlhkost potvrzuje predikovaný deficit, proto
    // skóre mírně snižujeme. Samotný predikovaný deficit však
    // nepovažujeme za automaticky potvrzený kritický stav.
    const soil = weather?.soil_moisture_pct;
    const soilMin = cropProfile?.soil_moisture_min_pct;

    if (soil != null && soilMin != null && soil < soilMin) {
      continuousWaterBalanceScore = clampScore(
        continuousWaterBalanceScore - 10
      );
    }
  } else if (Number.isFinite(precip)) {
    continuousWaterBalanceScore = clampScore(
      precip >= 5 ? 100 : precip >= 1 ? 70 + ((precip - 1) / 4) * 30 : precip * 70
    );
  }
}

const weightedFactors = [
  { label: "NDVI", weight: 25, value: continuousNdviScore },
  { label: "Trend NDVI", weight: 20, value: continuousTrendScore },
  { label: "Vodní bilance", weight: 20, value: continuousWaterBalanceScore },
  { label: "Teplota", weight: 10, value: continuousTemperatureScore },
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

const availableFactors = weightedFactors.filter(
  (factor) => factor.value != null && Number.isFinite(factor.value)
);

const totalWeight = availableFactors.reduce(
  (sum, factor) => sum + factor.weight,
  0
);

const weightedScore =
  totalWeight > 0
    ? availableFactors.reduce(
        (sum, factor) =>
          sum + (factor.value as number) * factor.weight,
        0
      ) / totalWeight
    : 0;

const score = Math.max(0, Math.min(100, Math.round(weightedScore)));



const scoreBreakdown: ScoreBreakdownItem[] = availableFactors.map((factor) => ({
  label: factor.label,
  score: Math.round(factor.value as number),
  weight: factor.weight,
  contribution: Math.round((((factor.value as number) * factor.weight) / totalWeight) * 100) / 100,
}));

const dataCompletenessPct = Math.round((availableFactors.length / weightedFactors.length) * 100);

  // AEGRIS SCORE = celkový stav projektu.
  // Oddělujeme jej od priority, která vyjadřuje naléhavost zásahu.
  const scoreLevel: ContextEvaluation["scoreLevel"] =
  score >= 85
    ? "Velmi dobrý stav"
    : score >= 70
      ? "Dobrý stav"
      : score >= 55
        ? "Zvýšené riziko"
        : score >= 40
          ? "Vysoké riziko"
          : "Kritický stav";

console.log("AEGRIS FINAL SCORE DEBUG", {
  crop: cropProfile?.name,
  growthStage,
  ndvi,
  continuousNdviScore,
  continuousTrendScore,
  continuousWaterBalanceScore,
  continuousTemperatureScore,
  continuousForecastTemperatureScore,
  continuousSoilMoistureScore,
  weightedScore,
  score,
  scoreLevel,
  criticalCount,
  warningCount,
  evaluatedCount,
});

let level: ContextEvaluation["level"] = "Optimální";

  if (criticalCount > 0) {
    level = "Kritické";
  } else if (warningCount > 0) {
    level = "Upozornění";
  }

  const cropLabel = cropProfile?.name ?? "plodina";
  const stageLabel = growthStage || "aktuální růstová fáze";

  let summary =
    level === "Kritické"
      ? `AEGRIS identifikoval kritický faktor u projektu s plodinou ${cropLabel}.`
      : level === "Upozornění"
        ? `AEGRIS identifikoval podmínku, kterou je vhodné u ${cropLabel} sledovat.`
        : `Aktuálně dostupná data jsou pro ${cropLabel} bez významného varovného signálu.`;

  if (hasLowNdvi) {
    summary += ` NDVI je pod orientační úrovní pro fázi ${stageLabel}.`;
  } else if (previousNdvi != null && ndvi > previousNdvi) {
    summary += ` NDVI je oproti předchozímu měření vyšší.`;
  } else if (previousNdvi != null && ndvi < previousNdvi) {
    summary += ` NDVI je oproti předchozímu měření nižší.`;
  } else {
    summary += ` NDVI odpovídá orientačnímu cíli pro fázi ${stageLabel}.`;
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

  if (evaluatedCount <= 1 && !weather) {
    level =
      ndvi < target * 0.8
        ? "Upozornění"
        : ndvi < 0.2
          ? "Kritické"
          : "Optimální";

    recommendation +=
      " Zatím jsou k dispozici především satelitní data; pro přesnější vyhodnocení je potřeba více měřených vstupů.";
  }

  const priority: ContextEvaluation["priority"] =
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
    criticalFactorCount: criticalCount,
    warningFactorCount: warningCount,
    evaluatedFactorCount: evaluatedCount,
    dataCompletenessPct,
    summary,
    recommendation,
    actions: Array.from(new Set(actions)).slice(0, 5),
    factors,
  };
}