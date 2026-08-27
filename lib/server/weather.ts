import type { WeatherData } from "@/lib/supabase/aegris/decision-engine";

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export async function fetchProjectWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", ["temperature_2m", "relative_humidity_2m", "precipitation", "wind_speed_10m", "soil_moisture_9_to_27cm"].join(","));
  url.searchParams.set("hourly", ["precipitation", "precipitation_probability", "temperature_2m", "soil_moisture_9_to_27cm"].join(","));
  url.searchParams.set("daily", ["precipitation_sum", "et0_fao_evapotranspiration", "temperature_2m_min", "temperature_2m_max"].join(","));
  url.searchParams.set("forecast_days", "2");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("wind_speed_unit", "kmh");
  url.searchParams.set("precipitation_unit", "mm");

  const response = await fetch(url.toString(), { next: { revalidate: 900 } });
  if (!response.ok) throw new Error(`Open-Meteo returned ${response.status}`);

  const data = await response.json();
  const current = data.current ?? {};
  const hourly = data.hourly ?? {};
  const daily = data.daily ?? {};
  const times: string[] = Array.isArray(hourly.time) ? hourly.time : [];
  const precipitation: unknown[] = Array.isArray(hourly.precipitation) ? hourly.precipitation : [];
  const temperatures: unknown[] = Array.isArray(hourly.temperature_2m) ? hourly.temperature_2m : [];
  const probabilities: unknown[] = Array.isArray(hourly.precipitation_probability) ? hourly.precipitation_probability : [];
  let index = times.findIndex((time) => time === String(current.time ?? ""));
  if (index < 0) index = 0;

  const nextPrecipitation = precipitation.slice(index, index + 24).map(numberOrNull).filter((v): v is number => v !== null);
  const nextTemperatures = temperatures.slice(index, index + 24).map(numberOrNull).filter((v): v is number => v !== null);
  const nextProbabilities = probabilities.slice(index, index + 24).map(numberOrNull).filter((v): v is number => v !== null);
  const dailyMin: unknown[] = Array.isArray(daily.temperature_2m_min) ? daily.temperature_2m_min : [];
  const dailyMax: unknown[] = Array.isArray(daily.temperature_2m_max) ? daily.temperature_2m_max : [];
  const dailyEt: unknown[] = Array.isArray(daily.et0_fao_evapotranspiration) ? daily.et0_fao_evapotranspiration : [];
  const soilRaw = numberOrNull(current.soil_moisture_9_to_27cm);

  return {
    temperature_c: numberOrNull(current.temperature_2m),
    humidity_pct: numberOrNull(current.relative_humidity_2m),
    precipitation_mm: numberOrNull(current.precipitation),
    wind_speed_kmh: numberOrNull(current.wind_speed_10m),
    soil_moisture_pct: soilRaw === null ? null : soilRaw * 100,
    precipitation_probability_pct: nextProbabilities.length ? Math.max(...nextProbabilities) : null,
    next24h_precipitation_mm: nextPrecipitation.reduce((sum, value) => sum + value, 0),
    next24h_min_temperature_c: nextTemperatures.length ? Math.min(...nextTemperatures) : numberOrNull(dailyMin[0]),
    next24h_max_temperature_c: nextTemperatures.length ? Math.max(...nextTemperatures) : numberOrNull(dailyMax[0]),
    evapotranspiration_mm: numberOrNull(dailyEt[0]),
    fetched_at: String(current.time ?? new Date().toISOString()),
  };
}
