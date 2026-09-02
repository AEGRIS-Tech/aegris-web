import type { WeatherData } from "@/lib/supabase/aegris/decision-engine";

function numberOrNull(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function numericSlice(
  values: unknown[],
  start: number,
  length: number
): number[] {
  return values
    .slice(start, start + length)
    .map(numberOrNull)
    .filter(
      (value): value is number =>
        value !== null
    );
}

export async function fetchProjectWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const url = new URL(
    "https://api.open-meteo.com/v1/forecast"
  );

  url.searchParams.set(
    "latitude",
    String(latitude)
  );

  url.searchParams.set(
    "longitude",
    String(longitude)
  );

  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "wind_speed_10m",
      "soil_moisture_9_to_27cm",
    ].join(",")
  );

  /*
   * Vodní bilance AEGRIS používá rolling okno dalších 24 hodin.
   * Proto musí být srážky i ET0 agregovány ze stejného hodinového
   * časového okna. Denní ET0 by se s rolling 24h srážkami časově
   * rozcházelo, zejména kolem půlnoci.
   */
  url.searchParams.set(
    "hourly",
    [
      "precipitation",
      "precipitation_probability",
      "temperature_2m",
      "et0_fao_evapotranspiration",
    ].join(",")
  );

  /*
   * Denní minimum/maximum ponecháváme pouze jako fallback
   * pro případ neúplných hodinových teplotních dat.
   */
  url.searchParams.set(
    "daily",
    [
      "temperature_2m_min",
      "temperature_2m_max",
    ].join(",")
  );

  url.searchParams.set(
    "forecast_days",
    "2"
  );

  url.searchParams.set(
    "timezone",
    "auto"
  );

  url.searchParams.set(
    "temperature_unit",
    "celsius"
  );

  url.searchParams.set(
    "wind_speed_unit",
    "kmh"
  );

  url.searchParams.set(
    "precipitation_unit",
    "mm"
  );

  const response = await fetch(
    url.toString(),
    {
      next: {
        revalidate: 900,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Open-Meteo returned ${response.status}`
    );
  }

  /*
   * Odpověď čteme nejprve jako text.
   * Pokud upstream vrátí HTTP 2xx, ale tělo není validní JSON,
   * zachováme část skutečné odpovědi v chybě pro diagnostiku.
   */
  const responseText =
    await response.text();

  let data: Record<string, any>;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Open-Meteo returned invalid JSON: ${responseText.slice(0, 300)}`
    );
  }

  const current =
    data.current ?? {};

  const hourly =
    data.hourly ?? {};

  const daily =
    data.daily ?? {};

  const times: string[] =
    Array.isArray(hourly.time)
      ? hourly.time
      : [];

  const precipitation: unknown[] =
    Array.isArray(hourly.precipitation)
      ? hourly.precipitation
      : [];

  const temperatures: unknown[] =
    Array.isArray(hourly.temperature_2m)
      ? hourly.temperature_2m
      : [];

  const probabilities: unknown[] =
    Array.isArray(
      hourly.precipitation_probability
    )
      ? hourly.precipitation_probability
      : [];

  const hourlyEt0: unknown[] =
    Array.isArray(
      hourly.et0_fao_evapotranspiration
    )
      ? hourly.et0_fao_evapotranspiration
      : [];

  const dailyMin: unknown[] =
    Array.isArray(
      daily.temperature_2m_min
    )
      ? daily.temperature_2m_min
      : [];

  const dailyMax: unknown[] =
    Array.isArray(
      daily.temperature_2m_max
    )
      ? daily.temperature_2m_max
      : [];

  let index =
    times.findIndex(
      (time) =>
        time ===
        String(current.time ?? "")
    );

  if (index < 0) {
    index = 0;
  }

  const nextPrecipitation =
    numericSlice(
      precipitation,
      index,
      24
    );

  const nextTemperatures =
    numericSlice(
      temperatures,
      index,
      24
    );

  const nextProbabilities =
    numericSlice(
      probabilities,
      index,
      24
    );

  const nextEt0 =
    numericSlice(
      hourlyEt0,
      index,
      24
    );

  const soilRaw =
    numberOrNull(
      current.soil_moisture_9_to_27cm
    );

  const next24hPrecipitation =
    nextPrecipitation.length > 0
      ? nextPrecipitation.reduce(
          (sum, value) =>
            sum + value,
          0
        )
      : null;

  const next24hEt0 =
    nextEt0.length > 0
      ? nextEt0.reduce(
          (sum, value) =>
            sum + value,
          0
        )
      : null;

  return {
    temperature_c:
      numberOrNull(
        current.temperature_2m
      ),

    humidity_pct:
      numberOrNull(
        current.relative_humidity_2m
      ),

    precipitation_mm:
      numberOrNull(
        current.precipitation
      ),

    wind_speed_kmh:
      numberOrNull(
        current.wind_speed_10m
      ),

    soil_moisture_pct:
      soilRaw === null
        ? null
        : soilRaw * 100,

    precipitation_probability_pct:
      nextProbabilities.length > 0
        ? Math.max(
            ...nextProbabilities
          )
        : null,

    next24h_precipitation_mm:
      next24hPrecipitation,

    next24h_min_temperature_c:
      nextTemperatures.length > 0
        ? Math.min(
            ...nextTemperatures
          )
        : numberOrNull(
            dailyMin[0]
          ),

    next24h_max_temperature_c:
      nextTemperatures.length > 0
        ? Math.max(
            ...nextTemperatures
          )
        : numberOrNull(
            dailyMax[0]
          ),

    /*
     * Pole zůstává kvůli kompatibilitě pojmenované
     * evapotranspiration_mm, ale nyní obsahuje součet
     * hodinového FAO-56 ET0 pro stejné rolling 24h okno
     * jako next24h_precipitation_mm.
     */
    evapotranspiration_mm:
      next24hEt0,

    /*
     * Jde o čas, kdy AEGRIS weather payload skutečně získal.
     * Nepoužíváme current.time z Open-Meteo, protože při
     * timezone=auto nemusí obsahovat explicitní UTC offset.
     */
    fetched_at:
      new Date().toISOString(),
  };
}