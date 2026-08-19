import { describe, expect, it } from "vitest";

import {
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