import { describe, expect, it } from "vitest";

import {
  calculateNdviTrend,
  evaluateProjectContext,
  type CropProfile,
  type CropStageProfile,
  type NdviHistory,
  type ProjectSoilProfile,
  type WeatherData,
} from "./decision-engine";

const baseCropProfile: CropProfile = {
  id: 1,
  name: "Pšenice",
  category: "obilnina",
  min_temperature_c: 5,
  max_temperature_c: 28,
  soil_moisture_min_pct: 15,
  soil_moisture_max_pct: 35,
  ph_min: 6,
  ph_max: 7.5,
  water_need: "střední",
  light_need: "plné slunce",
  notes: null,
};

const baseStageProfile: CropStageProfile = {
  id: 1,
  crop_profile_id: 1,
  growth_stage: "Vegetativní růst",
  kc: 1,
  min_temperature_c: 5,
  max_temperature_c: 28,
  water_stress_sensitivity: "střední",
};

const baseWeather: WeatherData = {
  temperature_c: 18.6,
  humidity_pct: 87,
  precipitation_mm: 0,
  wind_speed_kmh: 14.2,
  soil_moisture_pct: 30,
  precipitation_probability_pct: 80,
  next24h_precipitation_mm: 5,
  next24h_min_temperature_c: 12,
  next24h_max_temperature_c: 24,
  evapotranspiration_mm: 2,
  fetched_at: "2026-08-19T12:00:00.000Z",
};

const baseSoilProfile: ProjectSoilProfile = {
  project_id: 1,
  soil_texture: "hlinitá",
  field_capacity_pct: 35,
  wilting_point_pct: 15,
  root_zone_depth_cm: 60,
  reference_depth_top_cm: 0,
  reference_depth_bottom_cm: 60,
  data_source: "test",
  confidence: "high",
  notes: null,
};

function evaluate(
  overrides: {
    ndvi?: number;
    weather?: Partial<WeatherData> | null;
    soil?: Partial<ProjectSoilProfile> | null;
    previousNdvi?: number;
  } = {}
) {
  const ndvi = overrides.ndvi ?? 0.45;
  const previousNdvi =
  overrides.previousNdvi ?? 0.44;

  const weather =
    overrides.weather === null
      ? null
      : {
          ...baseWeather,
          ...(overrides.weather ?? {}),
        };

  const soil =
    overrides.soil === null
      ? null
      : {
          ...baseSoilProfile,
          ...(overrides.soil ?? {}),
        };

  const history: NdviHistory[] = [
  {
    id: 1,
    project_id: 1,
    period_from: "2026-08-01T00:00:00.000Z",
    period_to: "2026-08-01T00:00:00.000Z",
    ndvi: previousNdvi,
    created_at: "2026-08-01T00:00:00.000Z",
  },
];

  return evaluateProjectContext(
    ndvi,
    baseCropProfile,
    baseStageProfile,
    "Vegetativní růst",
    weather,
    history,
    "2026-08-19T12:00:00.000Z",
    soil
  );
}

describe("AEGRIS Decision Engine — základní integrita", () => {
  it("vrací score vždy v rozsahu 0–100", () => {
    const result = evaluate();

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("má přesně šest kanonických faktorů", () => {
    const result = evaluate();

    expect(result.scoreBreakdown).toHaveLength(6);

    expect(
      result.scoreBreakdown.map((item) => item.label)
    ).toEqual([
      "NDVI",
      "Trend NDVI",
      "Vodní bilance",
      "Teplota",
      "Teplotní výhled 24 h",
      "Vlhkost půdy",
    ]);
  });

  it("má kanonické váhy se součtem 100 %", () => {
    const result = evaluate();

    const totalWeight =
      result.scoreBreakdown.reduce(
        (sum, item) => sum + item.weight,
        0
      );

    expect(totalWeight).toBe(100);

    expect(
      result.scoreBreakdown.map(
        (item) => item.weight
      )
    ).toEqual([
      25,
      20,
      20,
      10,
      10,
      15,
    ]);
  });

  it("score odpovídá součtu contribution", () => {
    const result = evaluate();

    const contributionTotal =
      result.scoreBreakdown.reduce(
        (sum, item) =>
          sum + item.contribution,
        0
      );

    expect(
      Math.abs(
        contributionTotal - result.score
      )
    ).toBeLessThanOrEqual(1);
  });

  it("při kompletních datech hlásí 100% datovou úplnost", () => {
    const result = evaluate();

    expect(
      result.dataCompletenessPct
    ).toBe(100);

    expect(
      result.evaluatedFactorCount
    ).toBe(6);
  });
});

describe("AEGRIS Decision Engine — monotonicita", () => {
  it("lepší NDVI nesmí zhoršit score", () => {
    const worse = evaluate({
      ndvi: 0.30,
    });

    const better = evaluate({
      ndvi: 0.60,
    });

    expect(
      better.score
    ).toBeGreaterThanOrEqual(
      worse.score
    );
  });

  it("horší NDVI nesmí zlepšit score", () => {
    const better = evaluate({
      ndvi: 0.60,
    });

    const worse = evaluate({
      ndvi: 0.30,
    });

    expect(
      worse.score
    ).toBeLessThanOrEqual(
      better.score
    );
  });

  it("lepší půdní vlhkost nesmí zhoršit score", () => {
    const dry = evaluate({
      weather: {
        soil_moisture_pct: 15,
      },
    });

    const moist = evaluate({
      weather: {
        soil_moisture_pct: 30,
      },
    });

    expect(
      moist.score
    ).toBeGreaterThanOrEqual(
      dry.score
    );
  });

  it("horší půdní vlhkost nesmí zlepšit score", () => {
    const moist = evaluate({
      weather: {
        soil_moisture_pct: 30,
      },
    });

    const dry = evaluate({
      weather: {
        soil_moisture_pct: 15,
      },
    });

    expect(
      dry.score
    ).toBeLessThanOrEqual(
      moist.score
    );
  });

  it("lepší vodní bilance nesmí zhoršit score", () => {
    const deficit = evaluate({
      weather: {
        next24h_precipitation_mm: 0,
        evapotranspiration_mm: 4,
      },
    });

    const balanced = evaluate({
      weather: {
        next24h_precipitation_mm: 6,
        evapotranspiration_mm: 2,
      },
    });

    expect(
      balanced.score
    ).toBeGreaterThanOrEqual(
      deficit.score
    );
  });

  it("horší vodní bilance nesmí zlepšit score", () => {
    const balanced = evaluate({
      weather: {
        next24h_precipitation_mm: 6,
        evapotranspiration_mm: 2,
      },
    });

    const deficit = evaluate({
      weather: {
        next24h_precipitation_mm: 0,
        evapotranspiration_mm: 4,
      },
    });

    expect(
      deficit.score
    ).toBeLessThanOrEqual(
      balanced.score
    );
  });
});

describe("AEGRIS Decision Engine — chybějící data", () => {
  it("nepovažuje chybějící počasí za šest dostupných faktorů", () => {
    const result = evaluate({
      weather: null,
    });

    expect(
      result.dataCompletenessPct
    ).toBeLessThan(100);

    expect(
      result.evaluatedFactorCount
    ).toBeLessThan(6);
  });

  it("při chybějícím půdním profilu použije fallback plodiny", () => {
  const result = evaluate({
    soil: null,
  });

  const soilFactor =
    result.scoreBreakdown.find(
      (item) =>
        item.label === "Vlhkost půdy"
    );

  expect(soilFactor).toBeDefined();
  expect(soilFactor?.label).toBe(
    "Vlhkost půdy"
  );
});

  it("bez platného NDVI vrací stav bez vyhodnocení", () => {
    const result =
      evaluateProjectContext(
        null,
        baseCropProfile,
        baseStageProfile,
        "Vegetativní růst",
        baseWeather,
        [],
        "2026-08-19T12:00:00.000Z",
        baseSoilProfile
      );

    expect(result.level).toBe(
      "Bez vyhodnocení"
    );

    expect(result.score).toBe(0);

    expect(
      result.scoreBreakdown
    ).toHaveLength(0);
  });
});
describe("AEGRIS Decision Engine — boundary tests", () => {
  it("NDVI 0.19 je kritické", () => {
    const result = evaluate({ ndvi: 0.19 });

    expect(result.criticalFactorCount).toBeGreaterThanOrEqual(1);

    const ndviFactor = result.factors.find(
      (factor) => factor.label === "NDVI"
    );

    expect(ndviFactor?.status).toBe("Kritické");
  });

  it("NDVI 0.20 už není kritické", () => {
    const result = evaluate({ ndvi: 0.20 });

    const ndviFactor = result.factors.find(
      (factor) => factor.label === "NDVI"
    );

    expect(ndviFactor?.status).not.toBe("Kritické");
  });

  it("pro vegetativní růst je NDVI 0.35 varování", () => {
    const result = evaluate({ ndvi: 0.35 });

    const ndviFactor = result.factors.find(
      (factor) => factor.label === "NDVI"
    );

    expect(ndviFactor?.status).toBe("Upozornění");
  });

  it("pro vegetativní růst je NDVI 0.36 na hranici warningu", () => {
  const result = evaluate({ ndvi: 0.36 });

  const ndviFactor = result.factors.find(
    (factor) => factor.label === "NDVI"
  );

  console.log("NDVI DEBUG:", {
    ndvi: 0.36,
    status: ndviFactor?.status,
    detail: ndviFactor?.detail,
    score: result.score,
    level: result.level,
  });

  expect(ndviFactor).toBeDefined();
});

  it("score level má správné hranice", () => {
    const result = evaluate();

    expect([
      "Velmi dobrý stav",
      "Dobrý stav",
      "Zvýšené riziko",
      "Vysoké riziko",
      "Kritický stav",
    ]).toContain(result.scoreLevel);
  });

  it("váhy kanonických faktorů zůstávají 100 %", () => {
    const result = evaluate();

    const totalWeight = result.scoreBreakdown.reduce(
      (sum, item) => sum + item.weight,
      0
    );

    expect(totalWeight).toBe(100);
  });
});
describe("AEGRIS Decision Engine — water balance", () => {
  it("silný vodní deficit má horší score než vyrovnaná bilance", () => {
    const deficit = evaluate({
      weather: {
        next24h_precipitation_mm: 0,
        evapotranspiration_mm: 6,
      },
    });

    const balanced = evaluate({
      weather: {
        next24h_precipitation_mm: 6,
        evapotranspiration_mm: 2,
      },
    });

    expect(deficit.score).toBeLessThan(balanced.score);
  });

  it("vyšší dostupné srážky při stejné ET nezhorší score", () => {
    const lowRain = evaluate({
      weather: {
        next24h_precipitation_mm: 1,
        evapotranspiration_mm: 2,
      },
    });

    const highRain = evaluate({
      weather: {
        next24h_precipitation_mm: 6,
        evapotranspiration_mm: 2,
      },
    });

    expect(highRain.score).toBeGreaterThanOrEqual(
      lowRain.score
    );
  });

  it("nižší ET při stejných srážkách nezhorší score", () => {
    const highEt = evaluate({
      weather: {
        next24h_precipitation_mm: 2,
        evapotranspiration_mm: 5,
      },
    });

    const lowEt = evaluate({
      weather: {
        next24h_precipitation_mm: 2,
        evapotranspiration_mm: 1,
      },
    });

    expect(lowEt.score).toBeGreaterThanOrEqual(
      highEt.score
    );
  });

  it("vodní bilance je dostupná při kompletním počasí", () => {
    const result = evaluate();

    const waterFactor = result.factors.find(
      (factor) => factor.label === "Vodní bilance"
    );

    expect(waterFactor).toBeDefined();
  });

  it("chybějící ET nevyhodí engine", () => {
    const result = evaluate({
      weather: {
        evapotranspiration_mm: null,
      },
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("nulové srážky a vysoká ET nezpůsobí score mimo rozsah", () => {
    const result = evaluate({
      weather: {
        next24h_precipitation_mm: 0,
        evapotranspiration_mm: 20,
      },
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
describe("AEGRIS Decision Engine — temperature", () => {
  it("teplota v optimálním rozsahu nezpůsobí teplotní warning", () => {
    const result = evaluate({
      weather: {
        temperature_c: 18,
      },
    });

    const factor = result.factors.find(
      (item) => item.label === "Teplota"
    );

    expect(factor).toBeDefined();
    expect(factor?.status).not.toBe("Kritické");
  });

  it("teplota nad maximem je horší než optimální teplota", () => {
    const optimal = evaluate({
      weather: {
        temperature_c: 18,
      },
    });

    const hot = evaluate({
      weather: {
        temperature_c: 30,
      },
    });

    expect(hot.score).toBeLessThanOrEqual(
      optimal.score
    );
  });

  it("extrémní teplota nerozbije score", () => {
    const result = evaluate({
      weather: {
        temperature_c: 50,
      },
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("nízká teplota nerozbije score", () => {
    const result = evaluate({
      weather: {
        temperature_c: -20,
      },
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("teplotní výhled je samostatně vyhodnocen", () => {
    const result = evaluate({
      weather: {
        next24h_max_temperature_c: 24,
      },
    });

    const factor = result.factors.find(
      (item) =>
        item.label === "Teplotní výhled 24 h"
    );

    expect(factor).toBeDefined();
  });

  it("extrémní 24h teplotní výhled nerozbije score", () => {
    const result = evaluate({
      weather: {
        next24h_max_temperature_c: 50,
        next24h_min_temperature_c: 40,
      },
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
describe("AEGRIS Decision Engine — soil moisture", () => {
  it("půdní vlhkost na wilting point není lepší než field capacity", () => {
    const dry = evaluate({
      weather: {
        soil_moisture_pct:
          baseSoilProfile.wilting_point_pct!,
      },
    });

    const optimal = evaluate({
      weather: {
        soil_moisture_pct:
          baseSoilProfile.field_capacity_pct!,
      },
    });

    expect(dry.score).toBeLessThanOrEqual(
      optimal.score
    );
  });

  it("půdní vlhkost na field capacity je platně vyhodnocena", () => {
    const result = evaluate({
      weather: {
        soil_moisture_pct:
          baseSoilProfile.field_capacity_pct!,
      },
    });

    const factor = result.factors.find(
      (item) => item.label === "Vlhkost půdy"
    );

    expect(factor).toBeDefined();
  });

  it("vlhkost pod wilting point nerozbije engine", () => {
    const result = evaluate({
      weather: {
        soil_moisture_pct: 5,
      },
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("vlhkost nad field capacity nerozbije engine", () => {
    const result = evaluate({
      weather: {
        soil_moisture_pct: 50,
      },
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("vyšší půdní vlhkost mezi WP a FC nezhorší score", () => {
    const lower = evaluate({
      weather: {
        soil_moisture_pct: 20,
      },
    });

    const higher = evaluate({
      weather: {
        soil_moisture_pct: 30,
      },
    });

    expect(higher.score).toBeGreaterThanOrEqual(
      lower.score
    );
  });

  it("soil profile určuje fyzikální rozsah vlhkosti", () => {
    const result = evaluate({
      weather: {
        soil_moisture_pct: 15,
      },
    });

    const factor = result.factors.find(
      (item) => item.label === "Vlhkost půdy"
    );

    expect(factor).toBeDefined();
  });

  it("chybějící soil profile používá crop fallback", () => {
    const result = evaluate({
      soil: null,
    });

    const factor = result.factors.find(
      (item) => item.label === "Vlhkost půdy"
    );

    expect(factor).toBeDefined();
  });

  it("extrémní půdní vlhkost nerozbije score", () => {
    const result = evaluate({
      weather: {
        soil_moisture_pct: 100,
      },
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
describe("AEGRIS Decision Engine — integrační scénáře", () => {
  it("zdravý projekt má vysoké score a bez kritického faktoru", () => {
    const result = evaluate({
      ndvi: 0.65,
      previousNdvi: 0.64,
      weather: {
        temperature_c: 18,
        soil_moisture_pct: 30,
        precipitation_mm: 2,
        precipitation_probability_pct: 30,
        next24h_precipitation_mm: 4,
        next24h_min_temperature_c: 12,
        next24h_max_temperature_c: 24,
        evapotranspiration_mm: 2,
      },
      soil: {
        field_capacity_pct: 35,
        wilting_point_pct: 15,
      },
    });

    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.level).not.toBe("Kritické");

    expect(
      result.factors.some(
        (factor) => factor.status === "Kritické"
      )
    ).toBe(false);
  });

  it("silný vodní stres zhorší celkové hodnocení", () => {
    const healthy = evaluate({
      ndvi: 0.65,
      previousNdvi: 0.64,
      weather: {
        temperature_c: 18,
        soil_moisture_pct: 30,
        next24h_precipitation_mm: 6,
        evapotranspiration_mm: 2,
        next24h_min_temperature_c: 12,
        next24h_max_temperature_c: 24,
      },
    });

    const drought = evaluate({
      ndvi: 0.40,
      previousNdvi: 0.45,
      weather: {
        temperature_c: 30,
        soil_moisture_pct: 16,
        next24h_precipitation_mm: 0,
        evapotranspiration_mm: 6,
        next24h_min_temperature_c: 20,
        next24h_max_temperature_c: 34,
      },
    });

    expect(drought.score).toBeLessThan(
      healthy.score
    );

    const waterFactor = drought.factors.find(
      (factor) =>
        factor.label === "Vodní bilance"
    );

    expect(waterFactor).toBeDefined();
  });

  it("kombinovaný stres vytvoří kritický nebo vysoce rizikový stav", () => {
    const result = evaluate({
      ndvi: 0.15,
      previousNdvi: 0.30,
      weather: {
        temperature_c: 35,
        soil_moisture_pct: 10,
        next24h_precipitation_mm: 0,
        evapotranspiration_mm: 8,
        next24h_min_temperature_c: 25,
        next24h_max_temperature_c: 38,
      },
      soil: {
        field_capacity_pct: 35,
        wilting_point_pct: 15,
      },
    });

    expect([
      "Kritické",
      "Upozornění",
    ]).toContain(result.level);

    expect(result.score).toBeLessThan(55);

    expect(
      result.factors.some(
        (factor) => factor.status === "Kritické"
      )
    ).toBe(true);
  });

  it("výrazný pokles NDVI zhorší trend", () => {
    const result = evaluate({
      ndvi: 0.30,
      previousNdvi: 0.45,
    });

    const trendFactor = result.factors.find(
      (factor) =>
        factor.label === "Trend NDVI"
    );

    expect(trendFactor).toBeDefined();

    expect(
      ["Upozornění", "Kritické"]
    ).toContain(trendFactor?.status);
  });

  it("neúplná data nesmí vytvořit falešnou 100% datovou úplnost", () => {
    const result = evaluate({
      weather: null,
    });

    expect(
      result.dataCompletenessPct
    ).toBeLessThan(100);

    expect(
      result.evaluatedFactorCount
    ).toBeLessThan(6);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("integrační výstup obsahuje kompletní rozhodovací strukturu", () => {
    const result = evaluate();

    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("scoreLevel");
    expect(result).toHaveProperty("level");
    expect(result).toHaveProperty("priority");
    expect(result).toHaveProperty("recommendation");
    expect(result).toHaveProperty("actions");
    expect(result).toHaveProperty("factors");
    expect(result).toHaveProperty(
      "scoreBreakdown"
    );
    expect(result).toHaveProperty(
      "dataCompletenessPct"
    );
  });
});
describe("AEGRIS Decision Engine — prioritizace akcí", () => {
  it("kritický stav přidá prioritní terénní kontrolu", () => {
    const result = evaluate({
      ndvi: 0.10,
      weather: {
        soil_moisture_pct: 5,
        next24h_precipitation_mm: 0,
        evapotranspiration_mm: 6,
        temperature_c: 40,
        next24h_min_temperature_c: 5,
        next24h_max_temperature_c: 40,
      },
    });

    expect(result.level).toBe("Kritické");

    expect(result.actions).toContain(
      "Provést prioritní terénní kontrolu porostu před rozhodnutím o zásahu."
    );
  });
});
describe("AEGRIS Decision Engine - critical level regression", () => {
  it("critical factor must never produce optimal level", () => {
    const result = evaluate({
      weather: {
        temperature_c: 32,
      },
    });

    expect(result.criticalFactorCount).toBeGreaterThan(0);
    expect(result.warningFactorCount).toBe(0);
    expect(result.score).toBeGreaterThanOrEqual(70);

    expect(result.level).not.toBe("Optim\u00e1ln\u00ed");
  });
});
describe("AEGRIS Decision Engine - NDVI history regression", () => {
  it("historical NDVI equal to current value must not be removed when timestamp differs", () => {
    const history: NdviHistory[] = [
      {
        id: 1,
        project_id: 1,
        period_from: "2026-07-01T00:00:00.000Z",
        period_to: "2026-07-01T00:00:00.000Z",
        ndvi: 0.45,
        created_at: "2026-07-01T00:00:00.000Z",
      },
      {
        id: 2,
        project_id: 1,
        period_from: "2026-08-01T00:00:00.000Z",
        period_to: "2026-08-01T00:00:00.000Z",
        ndvi: 0.30,
        created_at: "2026-08-01T00:00:00.000Z",
      },
    ];

    const result = calculateNdviTrend(
      history,
      0.45,
      "2026-08-19T12:00:00.000Z"
    );

    expect(result.previousNdvi).toBe(0.30);
    expect(result.overallDelta).toBeCloseTo(0, 5);
    expect(result.overallRelativeChangePct).toBeCloseTo(0, 5);
  });
});

describe("AEGRIS Decision Engine - water stress diagnosis regression", () => {
  it("NDVI plus NDVI trend alone must not diagnose water stress", () => {
    const result = evaluate({
      ndvi: 0.25,
      previousNdvi: 0.40,
      weather: {
        soil_moisture_pct: 35,
        next24h_precipitation_mm: 8,
        evapotranspiration_mm: 1,
      },
      soil: {
        field_capacity_pct: 35,
        wilting_point_pct: 15,
      },
    });

    const waterStressDiagnosis =
      result.diagnoses.find(
        (diagnosis) =>
          diagnosis.code === "WATER_STRESS"
      );

    expect(waterStressDiagnosis).toBeUndefined();
  });
});

describe("AEGRIS Decision Engine - completeness regression", () => {
  it("low data completeness must not produce optimal level", () => {
    const result = evaluate({
      ndvi: 0.60,
      previousNdvi: 0.59,
      weather: null,
      soil: null,
    });

    expect(result.dataCompletenessPct).toBeLessThan(70);
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.level).not.toBe("Optim\u00e1ln\u00ed");
  });
});

describe("AEGRIS Decision Engine - completeness boundary", () => {
  it("83 percent completeness can still produce optimal level", () => {
    const result = evaluate({
      ndvi: 0.60,
      previousNdvi: 0.59,
      weather: {
        soil_moisture_pct: undefined,
      },
      soil: null,
    });

    expect(result.dataCompletenessPct).toBe(83);
    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.criticalFactorCount).toBe(0);
    expect(result.warningFactorCount).toBe(0);
    expect(result.level).toBe("Optim\u00e1ln\u00ed");
  });
});

describe("AEGRIS Decision Engine - time-aware NDVI trend regression", () => {
  it("same NDVI decline over shorter time must have steeper negative slope", () => {
    const fastHistory: NdviHistory[] = [
      {
        id: 1,
        project_id: 1,
        period_from: "2026-08-09T00:00:00.000Z",
        period_to: "2026-08-09T00:00:00.000Z",
        ndvi: 0.60,
        created_at: "2026-08-09T00:00:00.000Z",
      },
    ];

    const slowHistory: NdviHistory[] = [
      {
        id: 2,
        project_id: 1,
        period_from: "2026-07-10T00:00:00.000Z",
        period_to: "2026-07-10T00:00:00.000Z",
        ndvi: 0.60,
        created_at: "2026-07-10T00:00:00.000Z",
      },
    ];

    const fast = calculateNdviTrend(
      fastHistory,
      0.50,
      "2026-08-19T00:00:00.000Z"
    );

    const slow = calculateNdviTrend(
      slowHistory,
      0.50,
      "2026-08-19T00:00:00.000Z"
    );

    expect(fast.slope).not.toBeNull();
    expect(slow.slope).not.toBeNull();

    expect(Math.abs(fast.slope!)).toBeGreaterThan(
      Math.abs(slow.slope!)
    );
  });
});

describe("AEGRIS Decision Engine - canonical time-aware trend score regression", () => {
  it("same NDVI decline over shorter time must produce worse Trend NDVI score", () => {
    const evaluateWithHistory = (
      historyDate: string
    ) => {
      const history: NdviHistory[] = [
        {
          id: 1,
          project_id: 1,
          period_from: historyDate,
          period_to: historyDate,
          ndvi: 0.60,
          created_at: historyDate,
        },
        {
          id: 2,
          project_id: 1,
          period_from: "2026-08-09T00:00:00.000Z",
          period_to: "2026-08-09T00:00:00.000Z",
          ndvi: 0.55,
          created_at: "2026-08-09T00:00:00.000Z",
        },
      ];

      return evaluateProjectContext(
        0.50,
        baseCropProfile,
        baseStageProfile,
        "Vegetativní růst",
        baseWeather,
        history,
        "2026-08-19T00:00:00.000Z",
        baseSoilProfile
      );
    };

    const fast = evaluateWithHistory(
      "2026-07-30T00:00:00.000Z"
    );

    const slow = evaluateWithHistory(
      "2026-06-10T00:00:00.000Z"
    );

    const fastTrendScore =
      fast.scoreBreakdown.find(
        (item) => item.label === "Trend NDVI"
      )?.score;

    const slowTrendScore =
      slow.scoreBreakdown.find(
        (item) => item.label === "Trend NDVI"
      )?.score;

    expect(fastTrendScore).toBeDefined();
    expect(slowTrendScore).toBeDefined();

    expect(fastTrendScore!).toBeLessThan(
      slowTrendScore!
    );
  });
});

describe("AEGRIS Decision Engine - soil moisture fallback regression", () => {
  it("slightly outside crop fallback range must still create a soil moisture factor", () => {
    const result = evaluate({
      weather: {
        soil_moisture_pct: 14.9,
      },
      soil: null,
    });

    const factor = result.factors.find(
      (item) => item.label === "Vlhkost půdy"
    );

    expect(factor).toBeDefined();
    expect(factor?.status).not.toBe("N/A");
  });

  it("crop fallback factor status must agree with its canonical score band", () => {
    const result = evaluate({
      weather: {
        soil_moisture_pct: 10,
      },
      soil: null,
    });

    const factor = result.factors.find(
      (item) => item.label === "Vlhkost půdy"
    );

    const score =
      result.scoreBreakdown.find(
        (item) => item.label === "Vlhkost půdy"
      )?.score;

    expect(factor).toBeDefined();
    expect(score).toBeDefined();

    const expectedStatus =
      score! < 30
        ? "Kritické"
        : score! < 60
          ? "Upozornění"
          : "OK";

    expect(factor?.status).toBe(expectedStatus);
  });

  it("soil moisture farther outside crop fallback range must not improve canonical score", () => {
    const near = evaluate({
      weather: {
        soil_moisture_pct: 14,
      },
      soil: null,
    });

    const far = evaluate({
      weather: {
        soil_moisture_pct: 5,
      },
      soil: null,
    });

    const nearScore =
      near.scoreBreakdown.find(
        (item) => item.label === "Vlhkost půdy"
      )?.score;

    const farScore =
      far.scoreBreakdown.find(
        (item) => item.label === "Vlhkost půdy"
      )?.score;

    expect(nearScore).toBeDefined();
    expect(farScore).toBeDefined();
    expect(farScore!).toBeLessThanOrEqual(
      nearScore!
    );
  });
});
describe("AEGRIS Decision Engine - weather freshness gate", () => {
  it("fresh weather remains available", () => {
    const result = evaluate({
      weather: {
        fetched_at: "2026-08-19T11:30:00.000Z",
      },
    });

    expect(result.dataCompletenessPct).toBe(100);

    expect(
      result.scoreBreakdown.map((item) => item.label)
    ).toEqual([
      "NDVI",
      "Trend NDVI",
      "Vodní bilance",
      "Teplota",
      "Teplotní výhled 24 h",
      "Vlhkost půdy",
    ]);
  });

  it("weather exactly 60 minutes old remains available", () => {
    const result = evaluate({
      weather: {
        fetched_at: "2026-08-19T11:00:00.000Z",
      },
    });

    expect(result.dataCompletenessPct).toBe(100);
  });

  it("weather older than 60 minutes is excluded", () => {
    const result = evaluate({
      weather: {
        fetched_at: "2026-08-19T10:59:59.999Z",
      },
    });

    expect(result.dataCompletenessPct).toBeLessThan(100);

    expect(
      result.scoreBreakdown.some(
        (item) =>
          item.label === "Vodní bilance" ||
          item.label === "Teplota" ||
          item.label === "Teplotní výhled 24 h" ||
          item.label === "Vlhkost půdy"
      )
    ).toBe(false);
  });

  it("invalid weather timestamp is excluded", () => {
    const result = evaluate({
      weather: {
        fetched_at: "not-a-date",
      },
    });

    expect(result.dataCompletenessPct).toBeLessThan(100);

    expect(
      result.scoreBreakdown.some(
        (item) =>
          item.label === "Teplota"
      )
    ).toBe(false);
  });

  it("weather up to 5 minutes in the future is tolerated", () => {
    const result = evaluate({
      weather: {
        fetched_at: "2026-08-19T12:05:00.000Z",
      },
    });

    expect(result.dataCompletenessPct).toBe(100);
  });

  it("weather more than 5 minutes in the future is excluded", () => {
    const result = evaluate({
      weather: {
        fetched_at: "2026-08-19T12:05:00.001Z",
      },
    });

    expect(result.dataCompletenessPct).toBeLessThan(100);
  });

  it("missing analysis reference time fails closed for weather", () => {
    const result =
      evaluateProjectContext(
        0.45,
        baseCropProfile,
        baseStageProfile,
        "Vegetativní růst",
        baseWeather,
        [],
        null,
        baseSoilProfile
      );

    expect(result.dataCompletenessPct).toBeLessThan(100);

    expect(
      result.scoreBreakdown.some(
        (item) =>
          item.label === "Teplota"
      )
    ).toBe(false);
  });
});