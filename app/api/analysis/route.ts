import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { fetchProjectWeather } from "@/lib/server/weather";
import {
  evaluateProjectContext,
  type CropProfile,
  type CropStageProfile,
  type ProjectSoilProfile,
  type NdviHistory,
} from "@/lib/supabase/aegris/decision-engine";

export const dynamic = "force-dynamic";

const TOKEN_URL =
  "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token";

const STATS_URL =
  "https://sh.dataspace.copernicus.eu/statistics/v1";

const MIN_VALID_GEOMETRY_PCT = 60;
const ANALYSIS_LOCK_STALE_SECONDS = 15 * 60;

type BoundaryPoint = {
  latitude: number;
  longitude: number;
};

type NdviHistoryItem = {
  from: string;
  to: string;
  ndvi: number;
  medianNdvi: number | null;
  p05Ndvi: number | null;
  p95Ndvi: number | null;
  minNdvi: number | null;
  maxNdvi: number | null;
  sampleCount: number | null;
  noDataCount: number | null;
  validPixelCount: number | null;
  geometryPixelCount: number;
  validGeometryPct: number;
};

type Statistics = {
  min?: number;
  max?: number;
  mean?: number;
  stDev?: number;
  sampleCount?: number;
  noDataCount?: number;
  percentiles?: Record<string, number>;
};

type CopernicusItem = {
  interval?: {
    from?: string;
    to?: string;
  };
  outputs?: {
    default?: {
      bands?: {
        B0?: {
          stats?: Statistics;
        };
      };
    };
  };
};

type CopernicusResponse = {
  data?: CopernicusItem[];
  status?: string;
  geometryPixelCount?: number;
};

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clampNdvi(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function isValidBoundary(value: unknown): value is BoundaryPoint[] {
  if (!Array.isArray(value) || value.length < 3) {
    return false;
  }

  return value.every((item) => {
    if (item === null || typeof item !== "object") {
      return false;
    }

    const candidate = item as Record<string, unknown>;
    const latitude = Number(candidate.latitude);
    const longitude = Number(candidate.longitude);

    return (
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    );
  });
}


/*
 * WGS84 longitude/latitude -> WGS84 / UTM.
 * Bez externí knihovny.
 *
 * Pro projekt zvolíme UTM zónu podle středu polygonu.
 * EPSG:
 *   severní polokoule = 326xx
 *   jižní polokoule   = 327xx
 */
function getUtmZone(longitude: number): number {
  return Math.max(
    1,
    Math.min(60, Math.floor((longitude + 180) / 6) + 1)
  );
}

function getUtmEpsg(latitude: number, longitude: number): number {
  const zone = getUtmZone(longitude);
  return latitude >= 0 ? 32600 + zone : 32700 + zone;
}

function wgs84ToUtm(
  latitude: number,
  longitude: number,
  zone: number
): [number, number] {
  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const k0 = 0.9996;

  const e2 = f * (2 - f);
  const ep2 = e2 / (1 - e2);

  const latRad = (latitude * Math.PI) / 180;
  const lonRad = (longitude * Math.PI) / 180;
  const lonOriginDeg = (zone - 1) * 6 - 180 + 3;
  const lonOriginRad = (lonOriginDeg * Math.PI) / 180;

  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  const tanLat = Math.tan(latRad);

  const n = a / Math.sqrt(1 - e2 * sinLat * sinLat);
  const t = tanLat * tanLat;
  const c = ep2 * cosLat * cosLat;
  const A = cosLat * (lonRad - lonOriginRad);

  const e4 = e2 * e2;
  const e6 = e4 * e2;

  const m =
    a *
    ((1 - e2 / 4 - (3 * e4) / 64 - (5 * e6) / 256) * latRad -
      ((3 * e2) / 8 + (3 * e4) / 32 + (45 * e6) / 1024) *
        Math.sin(2 * latRad) +
      ((15 * e4) / 256 + (45 * e6) / 1024) * Math.sin(4 * latRad) -
      ((35 * e6) / 3072) * Math.sin(6 * latRad));

  const easting =
    k0 *
      n *
      (A +
        ((1 - t + c) * Math.pow(A, 3)) / 6 +
        ((5 - 18 * t + t * t + 72 * c - 58 * ep2) *
          Math.pow(A, 5)) /
          120) +
    500000;

  let northing =
    k0 *
    (m +
      n *
        tanLat *
        (Math.pow(A, 2) / 2 +
          ((5 - t + 9 * c + 4 * c * c) * Math.pow(A, 4)) / 24 +
          ((61 - 58 * t + t * t + 600 * c - 330 * ep2) *
            Math.pow(A, 6)) /
            720));

  if (latitude < 0) {
    northing += 10000000;
  }

  return [easting, northing];
}

function createUtmPolygon(boundary: BoundaryPoint[]) {
  const centerLatitude =
    boundary.reduce((sum, point) => sum + Number(point.latitude), 0) /
    boundary.length;

  const centerLongitude =
    boundary.reduce((sum, point) => sum + Number(point.longitude), 0) /
    boundary.length;

  const zone = getUtmZone(centerLongitude);
  const epsg = getUtmEpsg(centerLatitude, centerLongitude);

  const coordinates = boundary.map((point) =>
    wgs84ToUtm(
      Number(point.latitude),
      Number(point.longitude),
      zone
    )
  );

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];

  if (first[0] !== last[0] || first[1] !== last[1]) {
    coordinates.push([first[0], first[1]]);
  }

  return {
    polygon: {
      type: "Polygon" as const,
      coordinates: [coordinates],
    },
    epsg,
    zone,
  };
}

function getPercentile(
  percentiles: Record<string, number> | undefined,
  percentile: number
): number | null {
  if (!percentiles) {
    return null;
  }

  for (const key of [`${percentile}.0`, String(percentile)]) {
    const value = numberOrNull(percentiles[key]);
    if (value !== null) {
      return value;
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Route handler nemusí vždy povolit změnu cookies.
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Uživatel není přihlášen." },
        { status: 401 }
      );
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error("CHYBÍ SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json(
        { error: "Server nemá nakonfigurovaný Supabase service role key." },
        { status: 500 }
      );
    }

    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const url = new URL(request.url);
    const projectIdParam = url.searchParams.get("projectId");

    if (!projectIdParam) {
      return NextResponse.json(
        { error: "Chybí ID projektu." },
        { status: 400 }
      );
    }

    const projectId = Number(projectIdParam);

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return NextResponse.json(
        { error: "Neplatné ID projektu." },
        { status: 400 }
      );
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, latitude, longitude, boundary, user_id, crop_name, growth_stage")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (projectError || !project) {
      console.error("CHYBA NAČTENÍ PROJEKTU:", projectError);
      return NextResponse.json(
        { error: "Projekt nebyl nalezen nebo k němu nemáte přístup." },
        { status: 404 }
      );
    }

    const staleBefore = new Date(
      Date.now() - ANALYSIS_LOCK_STALE_SECONDS * 1000
    ).toISOString();

    const { error: staleLockDeleteError } = await serviceSupabase
      .from("analysis_locks")
      .delete()
      .eq("project_id", projectId)
      .lt("locked_at", staleBefore);

    if (staleLockDeleteError) {
      console.error(
        "ANALYSIS STALE LOCK CLEANUP ERROR:",
        staleLockDeleteError
      );
      return NextResponse.json(
        { error: "Nepodařilo se ověřit stav probíhající analýzy." },
        { status: 500 }
      );
    }

    const { error: lockInsertError } = await serviceSupabase
      .from("analysis_locks")
      .insert({
        project_id: projectId,
        user_id: user.id,
      });

    if (lockInsertError) {
      if (lockInsertError.code === "23505") {
        return NextResponse.json(
          {
            error: "Analýza tohoto projektu již probíhá.",
            code: "ANALYSIS_ALREADY_RUNNING",
          },
          { status: 409 }
        );
      }

      console.error("ANALYSIS LOCK ERROR:", lockInsertError);

      return NextResponse.json(
        { error: "Nepodařilo se uzamknout analýzu projektu." },
        { status: 500 }
      );
    }

    try {
      const { data: rateLimitData, error: rateLimitError } =
        await serviceSupabase.rpc("consume_analysis_rate_limit", {
          p_user_id: user.id,
          p_limit: 5,
          p_window_seconds: 600,
        });

      if (rateLimitError) {
        console.error("ANALYSIS RATE LIMIT ERROR:", rateLimitError);
        return NextResponse.json(
          { error: "Nepodařilo se ověřit limit analýz." },
          { status: 500 }
        );
      }

      const rateLimit = Array.isArray(rateLimitData)
        ? rateLimitData[0]
        : rateLimitData;

      if (rateLimit && rateLimit.allowed === false) {
        const retryAfter =
          Number(rateLimit.retry_after_seconds) || 600;

        return NextResponse.json(
          {
            error: "Dosáhli jste limitu analýz. Zkuste to později.",
            retryAfterSeconds: retryAfter,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(retryAfter),
            },
          }
        );
      }

    const latitude = Number(project.latitude);
    const longitude = Number(project.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: "Projekt nemá platné souřadnice." },
        { status: 422 }
      );
    }

    if (!isValidBoundary(project.boundary)) {
      return NextResponse.json(
        {
          error:
            "Projekt nemá platnou hranici pozemku. Analýza byla zastavena, aby nebylo vyhodnocováno okolí GPS bodu místo skutečného pole.",
          code: "PROJECT_BOUNDARY_REQUIRED",
        },
        { status: 422 }
      );
    }

    const boundary = project.boundary;

    /*
     * Statistical API dostane polygon v metrickém UTM CRS.
     * Díky tomu resx/resy = 10 skutečně znamená 10 metrů.
     */
    const {
      polygon,
      epsg: analysisEpsg,
      zone: analysisUtmZone,
    } = createUtmPolygon(boundary);

    const clientId = process.env.SENTINEL_CLIENT_ID;
    const clientSecret = process.env.SENTINEL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Server nemá nakonfigurované přihlašovací údaje Copernicus." },
        { status: 500 }
      );
    }

    const tokenResponse = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
      cache: "no-store",
    });

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();
      console.error("COPERNICUS TOKEN ERROR:", text);
      return NextResponse.json(
        { error: "Nepodařilo se přihlásit ke Copernicus Data Space." },
        { status: 502 }
      );
    }

    const tokenJson = (await tokenResponse.json()) as {
      access_token?: string;
    };

    const accessToken = tokenJson.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Copernicus nevrátil access token." },
        { status: 502 }
      );
    }

    const evalscript = `
      //VERSION=3

      function setup() {
        return {
          input: [{
            bands: [
              "B04",
              "B08",
              "SCL",
              "dataMask"
            ]
          }],
          output: [
            {
              id: "default",
              bands: 1,
              sampleType: "FLOAT32"
            },
            {
              id: "dataMask",
              bands: 1
            }
          ]
        };
      }

      function evaluatePixel(samples) {
        const red = samples.B04;
        const nir = samples.B08;
        const scl = samples.SCL;
        const denominator = nir + red;

        let valid = 1;

        if (samples.dataMask === 0) {
          valid = 0;
        }

        if (
          scl === 0 ||
          scl === 1 ||
          scl === 3 ||
          scl === 6 ||
          scl === 7 ||
          scl === 8 ||
          scl === 9 ||
          scl === 10 ||
          scl === 11
        ) {
          valid = 0;
        }

        if (denominator === 0) {
          valid = 0;
        }

        if (!valid) {
          return {
            default: [0],
            dataMask: [0]
          };
        }

        const ndvi = (nir - red) / denominator;

        if (!isFinite(ndvi) || ndvi < -1 || ndvi > 1) {
          return {
            default: [0],
            dataMask: [0]
          };
        }

        return {
          default: [ndvi],
          dataMask: [1]
        };
      }
    `;

    const to = new Date();
    const from = new Date(to);
    from.setUTCMonth(from.getUTCMonth() - 6);

    const statisticsRequest = {
      input: {
        bounds: {
          geometry: polygon,
          properties: {
            crs: `http://www.opengis.net/def/crs/EPSG/0/${analysisEpsg}`,
          },
        },
        data: [
          {
            type: "sentinel-2-l2a",
            dataFilter: {
              mosaickingOrder: "leastCC",
              maxCloudCoverage: 100,
            },
          },
        ],
      },
      aggregation: {
        timeRange: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
        aggregationInterval: {
          of: "P10D",
        },
        resx: 10,
        resy: 10,
        evalscript,
      },
      calculations: {
        default: {
          statistics: {
            default: {
              percentiles: {
                k: [5, 50, 95],
              },
            },
          },
        },
      },
    };

    const statisticsResponse = await fetch(STATS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(statisticsRequest),
      cache: "no-store",
    });

    const responseText = await statisticsResponse.text();

    if (!statisticsResponse.ok) {
      console.error("COPERNICUS STATISTICS ERROR:", responseText);
      return NextResponse.json(
        {
          error: "Copernicus Statistical API vrátil chybu.",
          copernicusStatus: statisticsResponse.status,
        },
        { status: 502 }
      );
    }

    let json: CopernicusResponse;

    try {
      json = JSON.parse(responseText) as CopernicusResponse;
    } catch {
      return NextResponse.json(
        { error: "Copernicus vrátil neplatnou JSON odpověď." },
        { status: 502 }
      );
    }

    if (!Array.isArray(json.data)) {
      console.error("NEOČEKÁVANÁ COPERNICUS RESPONSE:", json);
      return NextResponse.json(
        { error: "Copernicus vrátil neočekávanou strukturu dat." },
        { status: 502 }
      );
    }

    const geometryPixelCount = numberOrNull(json.geometryPixelCount);

    if (geometryPixelCount === null || geometryPixelCount <= 0) {
      console.error(
        "CHYBÍ PLATNÉ geometryPixelCount:",
        json.geometryPixelCount
      );

      return NextResponse.json(
        {
          error:
            "Copernicus nevrátil platný počet pixelů polygonu. Kvalitu měření proto nelze spolehlivě ověřit.",
          code: "INVALID_GEOMETRY_PIXEL_COUNT",
        },
        { status: 502 }
      );
    }

    const history: NdviHistoryItem[] = [];

    const rejectedIntervals: Array<{
      from: string;
      to: string;
      validGeometryPct: number | null;
      reason: string;
    }> = [];

    for (const item of json.data) {
      const interval = item.interval;

      if (!interval?.from || !interval?.to) {
        continue;
      }

      const stats = item.outputs?.default?.bands?.B0?.stats;

      if (!stats) {
        rejectedIntervals.push({
          from: interval.from,
          to: interval.to,
          validGeometryPct: null,
          reason: "Chybí statistika NDVI.",
        });
        continue;
      }

      const mean = numberOrNull(stats.mean);
      const sampleCount = numberOrNull(stats.sampleCount);
      const noDataCount = numberOrNull(stats.noDataCount);

      if (
        mean === null ||
        sampleCount === null ||
        noDataCount === null
      ) {
        rejectedIntervals.push({
          from: interval.from,
          to: interval.to,
          validGeometryPct: null,
          reason: "Chybí mean/sampleCount/noDataCount.",
        });
        continue;
      }

      const validPixelCount = Math.max(
        0,
        sampleCount - noDataCount
      );

      const validGeometryPct = Number(
        Math.min(
          100,
          Math.max(
            0,
            (validPixelCount / geometryPixelCount) * 100
          )
        ).toFixed(1)
      );

      if (validPixelCount <= 0) {
        rejectedIntervals.push({
          from: interval.from,
          to: interval.to,
          validGeometryPct,
          reason: "Žádný validní pixel po maskování.",
        });
        continue;
      }

      if (validGeometryPct < MIN_VALID_GEOMETRY_PCT) {
        rejectedIntervals.push({
          from: interval.from,
          to: interval.to,
          validGeometryPct,
          reason: `Méně než ${MIN_VALID_GEOMETRY_PCT} % validních pixelů polygonu.`,
        });
        continue;
      }

      history.push({
        from: interval.from,
        to: interval.to,
        ndvi: clampNdvi(mean),
        medianNdvi: getPercentile(stats.percentiles, 50),
        p05Ndvi: getPercentile(stats.percentiles, 5),
        p95Ndvi: getPercentile(stats.percentiles, 95),
        minNdvi: numberOrNull(stats.min),
        maxNdvi: numberOrNull(stats.max),
        sampleCount,
        noDataCount,
        validPixelCount,
        geometryPixelCount,
        validGeometryPct,
      });
    }

    history.sort(
      (a, b) =>
        new Date(a.from).getTime() -
        new Date(b.from).getTime()
    );

    if (history.length === 0) {
      return NextResponse.json(
        {
          error:
            `Pro tento pozemek nebylo v posledních 6 měsících nalezeno NDVI měření, které splňuje minimální datovou kvalitu ${MIN_VALID_GEOMETRY_PCT} % validních pixelů polygonu.`,
          code: "NO_QUALITY_SENTINEL_DATA",
          projectId,
          latitude,
          longitude,
          hasBoundary: true,
          boundaryPoints: boundary.length,
          geometryPixelCount,
          qualityGate: {
            minValidGeometryPct: MIN_VALID_GEOMETRY_PCT,
            rejectedIntervals: rejectedIntervals.length,
          },
        },
        { status: 422 }
      );
    }

    const historyRows = history.map((item) => ({
      project_id: projectId,
      period_from: item.from,
      period_to: item.to,
      ndvi: item.ndvi,
    }));

    const { error: deleteHistoryError } = await serviceSupabase
      .from("ndvi_history")
      .delete()
      .eq("project_id", projectId);

    if (deleteHistoryError) {
      console.error(
        "CHYBA SMAZÁNÍ NDVI HISTORY:",
        deleteHistoryError
      );
    } else {
      const { error: insertHistoryError } = await serviceSupabase
        .from("ndvi_history")
        .insert(historyRows);

      if (insertHistoryError) {
        console.error(
          "CHYBA ULOŽENÍ NDVI HISTORY:",
          insertHistoryError
        );
      }
    }

    const first = history[0];
    const latest = history[history.length - 1];

    const startNdvi = first.ndvi;
    const currentNdvi = latest.ndvi;

    const change =
      history.length >= 2
        ? currentNdvi - startNdvi
        : null;

    let trend = "Nedostatek dat";

    if (change !== null) {
      if (change <= -0.05) {
        trend = "Zhoršující se";
      } else if (change >= 0.05) {
        trend = "Zlepšující se";
      } else {
        trend = "Stabilní";
      }
    }

    let risk = "Nízké";

    if (currentNdvi < 0.20) {
      risk = "Kritické";
    } else if (change !== null && change <= -0.15) {
      risk = "Kritické";
    } else if (change !== null && change <= -0.05) {
      risk = "Vysoké";
    } else if (currentNdvi < 0.40) {
      risk = "Vysoké";
    } else if (currentNdvi < 0.60) {
      risk = "Střední";
    }

    // ---------------------------------------------------------
    // SERVER-AUTHORITATIVE AEGRIS PERSISTENCE
    // ---------------------------------------------------------
    const analysisCreatedAt = new Date().toISOString();
    const cropName = typeof project.crop_name === "string" ? project.crop_name : "";
    const growthStage = typeof project.growth_stage === "string" ? project.growth_stage : "";

    const [cropResult, soilResult] = await Promise.all([
      cropName
        ? serviceSupabase.from("crop_profiles").select("*").eq("name", cropName).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      serviceSupabase.from("project_soil_profiles").select("*").eq("project_id", projectId).maybeSingle(),
    ]);

    if (cropResult.error) console.error("ANALYSIS CROP PROFILE ERROR:", cropResult.error);
    if (soilResult.error) console.error("ANALYSIS SOIL PROFILE ERROR:", soilResult.error);

    const cropProfile = (cropResult.data ?? null) as CropProfile | null;
    let cropStageProfile: CropStageProfile | null = null;

    if (cropProfile && growthStage) {
      const { data: stageData, error: stageError } = await serviceSupabase
        .from("crop_stage_profiles")
        .select("*")
        .eq("crop_profile_id", cropProfile.id)
        .eq("growth_stage", growthStage)
        .maybeSingle();
      if (stageError) console.error("ANALYSIS CROP STAGE ERROR:", stageError);
      cropStageProfile = (stageData ?? null) as CropStageProfile | null;
    }

    let weather = null;
    try {
      weather = await fetchProjectWeather(latitude, longitude);
    } catch (weatherError) {
      console.error("ANALYSIS WEATHER ERROR:", weatherError);
    }

    const engineHistory: NdviHistory[] = history.map((item, index) => ({
      id: index,
      project_id: projectId,
      period_from: item.from,
      period_to: item.to,
      ndvi: item.ndvi,
      created_at: analysisCreatedAt,
    }));

    const recommendation = evaluateProjectContext(
      currentNdvi,
      cropProfile,
      cropStageProfile,
      growthStage,
      weather,
      engineHistory,
      analysisCreatedAt,
      (soilResult.data ?? null) as ProjectSoilProfile | null
    );

    const authoritativeRisk =
      recommendation.priority === "Kritická" ? "Kritické" :
      recommendation.priority === "Vysoká" ? "Vysoké" :
      recommendation.priority === "Střední" ? "Střední" : "Nízké";

    const { data: savedAnalysis, error: analysisInsertError } = await serviceSupabase
      .from("analysis")
      .insert({
        project_id: projectId,
        ndvi: currentNdvi,
        vegetation: Math.round(currentNdvi * 100),
        risk: authoritativeRisk,
        period_from: latest.from,
        period_to: latest.to,
        source_provider: "Copernicus Data Space Ecosystem",
        satellite: "Sentinel-2",
        satellite_product: "Sentinel-2 L2A",
        spatial_resolution_m: 10,
        analysis_crs: `EPSG:${analysisEpsg}`,
        analysis_utm_zone: analysisUtmZone,
        geometry_pixel_count: geometryPixelCount,
        valid_pixel_count: latest.validPixelCount,
        valid_geometry_pct: latest.validGeometryPct,
        accepted_intervals: history.length,
        rejected_intervals: rejectedIntervals.length,
        quality_gate_pct: MIN_VALID_GEOMETRY_PCT,
        median_ndvi: latest.medianNdvi,
        p05_ndvi: latest.p05Ndvi,
        p95_ndvi: latest.p95Ndvi,
      })
      .select()
      .single();

    if (analysisInsertError || !savedAnalysis) {
      console.error("ANALYSIS PERSISTENCE ERROR:", analysisInsertError);
      return NextResponse.json({ error: "Analýzu se nepodařilo bezpečně uložit." }, { status: 500 });
    }

    const { data: savedRecommendation, error: recommendationError } = await serviceSupabase
      .from("aegris_recommendations")
      .upsert({
        project_id: projectId,
        analysis_id: savedAnalysis.id,
        crop_name: cropName || null,
        growth_stage: growthStage || null,
        ndvi: currentNdvi,
        level: recommendation.level,
        priority: recommendation.priority,
        score: recommendation.score,
        summary: recommendation.summary,
        recommendation: recommendation.recommendation,
        actions: recommendation.actions,
        weather_snapshot: weather,
      }, { onConflict: "analysis_id" })
      .select()
      .single();

    if (recommendationError || !savedRecommendation) {
      console.error("RECOMMENDATION PERSISTENCE ERROR:", recommendationError);
      return NextResponse.json({ error: "Výsledek AEGRIS se nepodařilo bezpečně uložit." }, { status: 500 });
    }

    const alertLevel = recommendation.level === "Kritické" ? "critical" : recommendation.level === "Upozornění" ? "warning" : "info";
    const alertTitle = recommendation.level === "Kritické" ? "Kritický stav projektu" : recommendation.level === "Upozornění" ? "AEGRIS upozornění" : "AEGRIS informační stav";
    const alertMessage = `${recommendation.summary} ${recommendation.recommendation}`.trim();

    const { error: staleAlertError } = await serviceSupabase
      .from("aegris_alerts")
      .update({ is_read: true })
      .eq("project_id", projectId)
      .neq("level", alertLevel)
      .or("is_read.eq.false,is_read.is.null");
    if (staleAlertError) console.error("STALE ALERT CLEANUP ERROR:", staleAlertError);

    const { data: existingAlerts, error: existingAlertError } = await serviceSupabase
      .from("aegris_alerts")
      .select("id")
      .eq("project_id", projectId)
      .eq("level", alertLevel)
      .eq("title", alertTitle)
      .or("is_read.eq.false,is_read.is.null")
      .order("created_at", { ascending: false })
      .limit(100);
    if (existingAlertError) console.error("ALERT LOOKUP ERROR:", existingAlertError);

    const existingAlert = existingAlerts?.[0] ?? null;
    const duplicateIds = (existingAlerts ?? []).slice(1).map((item) => item.id);

    if (existingAlert?.id) {
      const { error: alertUpdateError } = await serviceSupabase.from("aegris_alerts").update({
        analysis_id: savedAnalysis.id,
        recommendation_id: savedRecommendation.id,
        priority: recommendation.priority,
        message: alertMessage,
        is_read: false,
      }).eq("id", existingAlert.id);
      if (alertUpdateError) console.error("ALERT UPDATE ERROR:", alertUpdateError);
      if (duplicateIds.length) {
        const { error: duplicateError } = await serviceSupabase.from("aegris_alerts").update({ is_read: true }).in("id", duplicateIds);
        if (duplicateError) console.error("ALERT DUPLICATE CLEANUP ERROR:", duplicateError);
      }
    } else {
      const { error: alertInsertError } = await serviceSupabase.from("aegris_alerts").insert({
        project_id: projectId,
        analysis_id: savedAnalysis.id,
        recommendation_id: savedRecommendation.id,
        level: alertLevel,
        priority: recommendation.priority,
        title: alertTitle,
        message: alertMessage,
        is_read: false,
      });
      if (alertInsertError) console.error("ALERT INSERT ERROR:", alertInsertError);
    }

    return NextResponse.json({
      projectId,
      analysis: savedAnalysis,
      aegrisRecommendation: savedRecommendation,
      decision: recommendation,
      weather,
      latitude,
      longitude,
      hasBoundary: true,
      boundaryPoints: boundary.length,
      source: {
        provider: "Copernicus Data Space Ecosystem",
        satellite: "Sentinel-2",
        product: "Sentinel-2 L2A",
        spatialResolutionMeters: 10,
        analysisCrs: `EPSG:${analysisEpsg}`,
        analysisUtmZone,
        aggregationInterval: "P10D",
        ndviFormula: "(B08 - B04) / (B08 + B04)",
        cloudMask:
          "Sentinel-2 Scene Classification Layer (SCL) + dataMask",
      },
      quality: {
        minValidGeometryPct: MIN_VALID_GEOMETRY_PCT,
        geometryPixelCount,
        acceptedIntervals: history.length,
        rejectedIntervals: rejectedIntervals.length,
        latestValidGeometryPct: latest.validGeometryPct,
        latestValidPixelCount: latest.validPixelCount,
      },
      from: from.toISOString(),
      to: to.toISOString(),
      count: history.length,
      ndvi: currentNdvi,
      startNdvi,
      currentNdvi,
      medianNdvi: latest.medianNdvi,
      p05Ndvi: latest.p05Ndvi,
      p95Ndvi: latest.p95Ndvi,
      minNdvi: latest.minNdvi,
      maxNdvi: latest.maxNdvi,
      sampleCount: latest.sampleCount,
      noDataCount: latest.noDataCount,
      validPixelCount: latest.validPixelCount,
      geometryPixelCount,
      validGeometryPct: latest.validGeometryPct,
      change,
      trend,
      risk,
      history,
      rejectedIntervals,
    });
    } finally {
      const { error: unlockError } = await serviceSupabase
        .from("analysis_locks")
        .delete()
        .eq("project_id", projectId)
        .eq("user_id", user.id);

      if (unlockError) {
        console.error("ANALYSIS UNLOCK ERROR:", unlockError);
      }
    }
  } catch (error) {
    console.error("ANALYSIS ROUTE ERROR:", error);

    return NextResponse.json(
      {
        error: "Chyba při získávání Sentinel-2 dat.",
      },
      {
        status: 500,
      }
    );
  }
}