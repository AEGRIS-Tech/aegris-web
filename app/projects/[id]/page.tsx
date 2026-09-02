"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import ProjectMap from "./ProjectMap";
import AnalysisChart from "./AnalysisChart";

type Project = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  crop_name?: string | null;
  crop_variety?: string | null;
  sowing_date?: string | null;
  expected_harvest_date?: string | null;
  area_ha?: number | null;
  farming_method?: string | null;
  growth_stage?: string | null;
  growth_stage_updated_at?: string | null;
  organization_id?: string | null;
};

type Analysis = {
  id: number;
  project_id: number;
  ndvi: number;
  vegetation: number;
  risk: string;
  created_at: string;
  period_from?: string | null;
  period_to?: string | null;

  // Provenance a kvalita Sentinel analýzy.
  source_provider?: string | null;
  satellite?: string | null;
  satellite_product?: string | null;
  spatial_resolution_m?: number | null;
  analysis_crs?: string | null;
  analysis_utm_zone?: number | null;
  geometry_pixel_count?: number | null;
  valid_pixel_count?: number | null;
  valid_geometry_pct?: number | null;
  accepted_intervals?: number | null;
  rejected_intervals?: number | null;
  quality_gate_pct?: number | null;
  median_ndvi?: number | null;
  p05_ndvi?: number | null;
  p95_ndvi?: number | null;
};

import {
  buildCanonicalNdviHistory,
  evaluateProjectContext,
  type ContextEvaluation,
  type CropProfile,
  type CropStageProfile,
  type ProjectSoilProfile,
  type NdviHistory,
  type WeatherData,
} from "@/lib/supabase/aegris/decision-engine";

type AegrisRecommendation = {
  id: number;
  project_id: number;
  analysis_id: number | null;
  crop_name: string | null;
  growth_stage: string | null;
  ndvi: number | null;
  level: ContextEvaluation["level"];
  priority: ContextEvaluation["priority"];
  score: number | null;
  summary: string;
  recommendation: string;
  actions: string[];
  weather_snapshot: WeatherData | null;
  created_at: string;
};

type AegrisAlert = {
  id: number;
  project_id: number;
  analysis_id: number | null;
  recommendation_id: number | null;
  level: "critical" | "warning" | "info";
  priority: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [soilProfile, setSoilProfile] =
    useState<ProjectSoilProfile | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [recommendationHistory, setRecommendationHistory] =
    useState<AegrisRecommendation[]>([]);
  const [alerts, setAlerts] = useState<AegrisAlert[]>([]);
  const [ndviHistory, setNdviHistory] = useState<NdviHistory[]>([]);
  const [cropProfiles, setCropProfiles] = useState<CropProfile[]>([]);
  const [cropStageProfiles, setCropStageProfiles] = useState<CropStageProfile[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [organizationRole, setOrganizationRole] =
    useState<string | null>(null);
  const [projectLoadError, setProjectLoadError] = useState("");

  const [cropName, setCropName] = useState("");
  const [cropVariety, setCropVariety] = useState("");
  const [cropVarietyError, setCropVarietyError] = useState("");
  const [sowingDate, setSowingDate] = useState("");
  const [expectedHarvestDate, setExpectedHarvestDate] =
    useState("");
  const [areaHa, setAreaHa] = useState("");
  const [areaError, setAreaError] = useState("");
  const [farmingMethod, setFarmingMethod] = useState("");
  const [growthStage, setGrowthStage] = useState("");

  const [savingCrop, setSavingCrop] = useState(false);
  const [cropEditorOpen, setCropEditorOpen] = useState(false);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const analysisRunRef = useRef(false);
  const loadRequestRef = useRef(0);

  async function loadCropProfiles() {
    const { data, error } = await supabase
      .from("crop_profiles")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error(
        "CHYBA NAČTENÍ PROFILŮ PLODIN:",
        error
      );
      setCropProfiles([]);
      return;
    }

    setCropProfiles((data ?? []) as CropProfile[]);
  }

  async function loadCropStageProfiles() {
    const { data, error } = await supabase
      .from("crop_stage_profiles")
      .select("*")
      .order("crop_profile_id", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error(
        "CHYBA NAČTENÍ PROFILŮ RŮSTOVÝCH FÁZÍ:",
        error
      );
      setCropStageProfiles([]);
      return;
    }

    setCropStageProfiles(
      (data ?? []) as CropStageProfile[]
    );
  }

  const loadProject = useCallback(async () => {
    const requestId = ++loadRequestRef.current;
    const projectId = Number(params.id);

    if (!Number.isFinite(projectId)) {
      console.error(
        "NEPLATNÉ ID PROJEKTU:",
        params.id
      );
      setProject(null);
      setProjectLoadError("Neplatné ID projektu.");
      return;
    }

    setProjectLoadError("");

    const {
      data: projectData,
      error: projectError,
    } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .maybeSingle();

    if (projectError) {
      console.error(
        "CHYBA NAČTENÍ PROJEKTU:",
        projectError
      );
      setProject(null);
      setProjectLoadError("Projekt se nepodařilo načíst.");
      return;
    }

    if (!projectData) {
      setProject(null);
      setProjectLoadError(
        "Projekt nebyl nalezen nebo k němu nemáte přístup."
      );
      return;
    }

    const currentProject = projectData as Project;

    if (!currentProject.organization_id) {
      console.error(
        "CHYBA: Projekt nemá organization_id."
      );
      setProject(null);
      setProjectLoadError(
        "Projekt nemá správně nastavenou organizaci."
      );
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/login");
      return;
    }

    const {
      data: membership,
      error: membershipError,
    } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", currentProject.organization_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError || !membership) {
      console.error(
        "CHYBA NAČTENÍ ROLE V ORGANIZACI:",
        membershipError
      );
      setProject(null);
      setProjectLoadError(
        "Nepodařilo se ověřit oprávnění k projektu."
      );
      return;
    }

    setOrganizationRole(membership.role);

    if (requestId !== loadRequestRef.current) return;

    setProject(currentProject);
    setAnalysis(null);
    setHistory([]);
    setRecommendationHistory([]);
    setAlerts([]);
    setNdviHistory([]);
    setWeather(null);

    const {
  data: soilProfileData,
  error: soilProfileError,
} = await supabase
  .from("project_soil_profiles")
  .select("*")
  .eq("project_id", currentProject.id)
  .maybeSingle();

if (soilProfileError) {
  console.error(
    "CHYBA NAČTENÍ PŮDNÍHO PROFILU:",
    soilProfileError
  );
  setSoilProfile(null);
} else {
  setSoilProfile(
    (soilProfileData ?? null) as ProjectSoilProfile | null
  );
}

try {
  await loadWeather(
    currentProject.id
  );
} catch (error) {
  console.error(
    "AEGRIS WEATHER LOAD FAILED:",
    error
  );
}

if (requestId !== loadRequestRef.current) return;

    setCropName(currentProject.crop_name ?? "");
    setCropVariety(currentProject.crop_variety ?? "");
    setSowingDate(currentProject.sowing_date ?? "");
    setExpectedHarvestDate(
      currentProject.expected_harvest_date ?? ""
    );
    setAreaHa(
      currentProject.area_ha != null
        ? String(currentProject.area_ha)
        : ""
    );
    setFarmingMethod(
      currentProject.farming_method ?? ""
    );
    setGrowthStage(currentProject.growth_stage ?? "");

    const {
  data: lastAnalysis,
  error: analysisError,
} = await supabase
  .from("analysis")
  .select("*")
  .eq("project_id", currentProject.id)
  .order("created_at", {
    ascending: false,
  })
  .limit(1)
  .maybeSingle();

    if (requestId !== loadRequestRef.current) return;

    if (analysisError) {
      console.error(
        "CHYBA NAČTENÍ POSLEDNÍ ANALÝZY:",
        analysisError
      );
      setAnalysis(null);
    } else {
      setAnalysis(lastAnalysis ?? null);
    }

    const {
      data: historyData,
      error: historyError,
    } = await supabase
      .from("analysis")
      .select("*")
      .eq("project_id", currentProject.id)
      .order("created_at", {
        ascending: false,
      });

    if (requestId !== loadRequestRef.current) return;

    if (historyError) {
      console.error(
        "CHYBA NAČTENÍ ANALÝZ:",
        historyError
      );
      setHistory([]);
    } else {
      setHistory(historyData ?? []);
    }

    const {
      data: recommendationData,
      error: recommendationError,
    } = await supabase
      .from("aegris_recommendations")
      .select("*")
      .eq("project_id", currentProject.id)
      .order("created_at", { ascending: false });

    if (requestId !== loadRequestRef.current) return;

    if (recommendationError) {
      console.error(
        "CHYBA NAČTENÍ HISTORIE AEGRIS:",
        recommendationError
      );
      setRecommendationHistory([]);
    } else {
      setRecommendationHistory(
        (recommendationData ?? []) as AegrisRecommendation[]
      );
    }

    const {
  data: alertData,
  error: alertError,
} = await supabase
  .from("aegris_alerts")
  .select("*")
  .eq("project_id", currentProject.id)
  .eq("is_read", false)
  .order("created_at", { ascending: false })
  .limit(20);

    if (requestId !== loadRequestRef.current) return;

    if (alertError) {
      console.error(
        "CHYBA NAČTENÍ ALERTŮ AEGRIS:",
        alertError
      );
      setAlerts([]);
    } else {
      setAlerts((alertData ?? []) as AegrisAlert[]);
    }

    const {
  data: ndviHistoryData,
  error: ndviHistoryError,
} = await supabase
  .from("ndvi_history")
  .select("*")
  .eq("project_id", currentProject.id)
  .order("period_from", {
    ascending: true,
  });

if (requestId !== loadRequestRef.current) return;

    const fallbackNdviHistory: NdviHistory[] =
      (historyData ?? [])
        .map((item) => {
          const ndvi = Number(item.ndvi);
          if (!Number.isFinite(ndvi)) return null;

          const periodFrom =
            item.period_from ?? item.created_at;
          const periodTo =
            item.period_to ?? item.created_at;

          if (!periodFrom || !periodTo) return null;

          return {
            id: item.id,
            project_id: item.project_id,
            period_from: periodFrom,
            period_to: periodTo,
            ndvi,
            created_at: item.created_at,
          };
        })
        .filter(
          (item): item is NdviHistory =>
            item !== null
        );

    if (ndviHistoryError) {
      console.error(
        "CHYBA NAČTENÍ NDVI HISTORIE:",
        ndviHistoryError
      );
      setNdviHistory(fallbackNdviHistory);
    } else if ((ndviHistoryData ?? []).length > 0) {
      setNdviHistory(ndviHistoryData ?? []);
    } else {
      setNdviHistory(fallbackNdviHistory);
    }
  }, [params.id, router]);

  // This effect intentionally loads remote project data and updates React state.
  // The react-hooks/set-state-in-effect rule is not applicable to this data-fetching effect.
  /* eslint-disable react-hooks/set-state-in-effect */
useEffect(() => {

  void loadProject();

  void loadCropProfiles();
  void loadCropStageProfiles();
}, [params.id]);
/* eslint-enable react-hooks/set-state-in-effect */

  async function loadWeather(projectId: number) {

  setLoadingWeather(true);

  try {
    const response = await fetch(
      `/api/weather?projectId=${projectId}`,
      {
        cache: "no-store",
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error("CHYBA NAČTENÍ POČASÍ:", result);
      setWeather(null);
      return;
    }

    const source = result?.weather ?? result?.data ?? result;
    const current = source?.current ?? source;

    function numericOrNull(value: unknown): number | null {
      if (value === null || value === undefined || value === "") {
        return null;
      }

      const number = Number(value);

      return Number.isFinite(number) ? number : null;
    }

    const temperature =
      numericOrNull(current?.temperature_c) ??
      numericOrNull(current?.temperature_2m) ??
      numericOrNull(current?.temperature);

    const humidity =
      numericOrNull(current?.humidity_pct) ??
      numericOrNull(current?.relative_humidity_2m) ??
      numericOrNull(current?.humidity);

    const precipitation =
      numericOrNull(current?.precipitation_mm) ??
      numericOrNull(current?.precipitation);

    const wind =
      numericOrNull(current?.wind_speed_kmh) ??
      numericOrNull(current?.wind_speed_10m) ??
      numericOrNull(current?.wind_speed);

    const soilMoistureRaw = numericOrNull(
  current?.soil_moisture_pct ??
    source?.soil_moisture_pct ??
    current?.soil_moisture_0_to_1cm ??
    source?.soil_moisture_0_to_1cm
);

const soilMoisture =
  soilMoistureRaw != null &&
  soilMoistureRaw >= 0 &&
  soilMoistureRaw <= 1
    ? soilMoistureRaw * 100
    : soilMoistureRaw;

    const precipitationProbability = numericOrNull(
      source?.precipitation_probability_pct
    );

    const next24hPrecipitation = numericOrNull(
      source?.next24h_precipitation_mm
    );

    const next24hMinTemperature = numericOrNull(
      source?.next24h_min_temperature_c
    );

    const next24hMaxTemperature = numericOrNull(
      source?.next24h_max_temperature_c
    );

    const evapotranspiration = numericOrNull(
      source?.evapotranspiration_mm
    );

    setWeather({
      temperature_c: temperature,
      humidity_pct: humidity,
      precipitation_mm: precipitation,
      wind_speed_kmh: wind,
      soil_moisture_pct: soilMoisture,
      precipitation_probability_pct:
        precipitationProbability,
      next24h_precipitation_mm:
        next24hPrecipitation,
      next24h_min_temperature_c:
        next24hMinTemperature,
      next24h_max_temperature_c:
        next24hMaxTemperature,
      evapotranspiration_mm:
        evapotranspiration,
      fetched_at:
        typeof source?.fetched_at === "string"
          ? source.fetched_at
          : new Date().toISOString(),
    });
  } catch (error) {
    console.error("CHYBA POČASÍ:", error);
    setWeather(null);
  } finally {
    setLoadingWeather(false);
  }
}

  async function saveCropData() {
    if (!project) return;

    if (!cropVariety.trim()) {
    setCropVarietyError("ODRŮDA JE POVINNÁ");
    setSavingCrop(false);
    return;
  }

    setSavingCrop(true);

    const parsedArea =
      areaHa.trim() === ""
        ? null
        : Number(areaHa);

    if (
  parsedArea !== null &&
  (!Number.isFinite(parsedArea) || parsedArea <= 0)
) {
  setAreaError("Výměra musí být větší než 0.");
  setSavingCrop(false);
  return;
}

setAreaError("");

    if (organizationRole === "viewer") {
      console.error(
        "CHYBA: Viewer nemůže upravovat projekt."
      );
      setSavingCrop(false);
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .update({
        crop_name: cropName.trim() || null,
        crop_variety:
          cropVariety.trim() || null,
        sowing_date:
          sowingDate || null,
        expected_harvest_date:
          expectedHarvestDate || null,
        area_ha: parsedArea,
        farming_method:
          farmingMethod.trim() || null,
        growth_stage:
          growthStage.trim() || null,
        growth_stage_updated_at:
          (growthStage.trim() || null) !== (project.growth_stage ?? null)
            ? growthStage.trim()
              ? new Date().toISOString()
              : null
            : project.growth_stage_updated_at ?? null,
      })
      .eq("id", project.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error(
        "CHYBA ULOŽENÍ ÚDAJŮ O PLODINĚ:",
        error
      );
      setSavingCrop(false);
      return;
    }

    if (!data) {
      console.error(
        "CHYBA: Projekt nebyl upraven nebo k němu není oprávnění."
      );
      setSavingCrop(false);
      return;
    }

    setProject(data as Project);
    setSavingCrop(false);
  }

  async function runAnalysis() {
    if (!project || runningAnalysis || analysisRunRef.current) {
      return;
    }

    analysisRunRef.current = true;
    setRunningAnalysis(true);

    try {
      const response = await fetch(
        `/api/analysis?projectId=${project.id}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const responseText = await response.text();

      let result: Record<string, unknown> | null = null;

      if (responseText) {
        try {
          result = JSON.parse(responseText) as Record<string, unknown>;
        } catch {
          result = null;
        }
      }

      if (!response.ok) {
        console.error("CHYBA API ANALÝZY:", {
          status: response.status,
          statusText: response.statusText,
          response: result ?? (responseText || null),
        });
        return;
      }

      if (!result) {
        console.error(
          "CHYBA API ANALÝZY: Server vrátil úspěch bez platné JSON odpovědi."
        );
        return;
      }

      /*
       * /api/analysis je autoritativní serverová cesta:
       * - načte Sentinel / weather / soil / historii,
       * - vyhodnotí Decision Engine,
       * - atomicky nahradí ndvi_history,
       * - uloží analysis + recommendation,
       * - aktualizuje alert.
       *
       * Klient už nic z toho znovu nezapisuje do databáze.
       * Po úspěchu pouze znovu načte serverem uložený stav.
       */
      await loadProject();
    } catch (error) {
      console.error("CHYBA ANALÝZY:", error);
    } finally {
      analysisRunRef.current = false;
      setRunningAnalysis(false);
    }
  }

  function openCropEditor() {
    setCropEditorOpen(true);

    window.requestAnimationFrame(() => {
      document.getElementById("crop-editor")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  async function markAlertAsRead(alertId: number) {
    const { error } = await supabase
      .from("aegris_alerts")
      .update({ is_read: true })
      .eq("id", alertId);

    if (error) {
      console.error("CHYBA OZNAČENÍ ALERTU:", error);
      return;
    }

    setAlerts((current) =>
      current.map((alert) =>
        alert.id === alertId
          ? { ...alert, is_read: true }
          : alert
      )
    );
  }

  const selectedCropProfile =
    cropProfiles.find(
      (profile) =>
        profile.name === cropName
    ) ?? null;

  const selectedCropStageProfile =
    selectedCropProfile && growthStage
      ? cropStageProfiles.find(
          (stageProfile) =>
            stageProfile.crop_profile_id === selectedCropProfile.id &&
            stageProfile.growth_stage === growthStage
        ) ?? null
      : null;

  const databaseGrowthStages = selectedCropProfile
    ? cropStageProfiles
        .filter(
          (stageProfile) =>
            stageProfile.crop_profile_id === selectedCropProfile.id
        )
        .map((stageProfile) => stageProfile.growth_stage)
    : [];

    const availableGrowthStages =
    databaseGrowthStages;

  const growthStages =
    growthStage &&
    !availableGrowthStages.includes(growthStage)
      ? [growthStage, ...availableGrowthStages]
      : availableGrowthStages;

  const chartHistory = buildCanonicalNdviHistory(
    ndviHistory,
    analysis?.ndvi != null && Number.isFinite(Number(analysis.ndvi))
      ? Number(analysis.ndvi)
      : null,
    analysis?.created_at ?? null
  );

  const temperatureMin =
    selectedCropStageProfile?.min_temperature_c ??
    selectedCropProfile?.min_temperature_c ??
    null;

  const temperatureMax =
    selectedCropStageProfile?.max_temperature_c ??
    selectedCropProfile?.max_temperature_c ??
    null;

  const temperatureStatus =
    weather?.temperature_c != null &&
    temperatureMin != null &&
    temperatureMax != null
      ? weather.temperature_c >= temperatureMin &&
        weather.temperature_c <= temperatureMax
        ? "V rozsahu profilu"
        : "Mimo rozsah profilu"
      : "Bez vyhodnocení";

  const temperatureStatusClass =
    temperatureStatus === "V rozsahu profilu"
      ? "text-emerald-400"
      : temperatureStatus === "Mimo rozsah profilu"
        ? "text-red-400"
        : "text-slate-400";

  /*
   * ---------------------------------------------------------
   * ANALYSIS SNAPSHOT
   * ---------------------------------------------------------
   *
   * Historická analýza musí být vyhodnocována s meteorologickými
   * podmínkami, které byly uloženy v okamžiku jejího vytvoření.
   *
   * `weather` zůstává LIVE stav pro sekci "Počasí a podmínky".
   * Pro AEGRIS vyhodnocení poslední uložené analýzy používáme
   * `weather_snapshot` z odpovídajícího doporučení.
   *
   * Starší záznamy, které snapshot ještě nemají, bezpečně
   * fallbackují na aktuální weather.
   * ---------------------------------------------------------
   */

  const analysisRecommendation =
    analysis != null
      ? recommendationHistory.find(
          (item) => item.analysis_id === analysis.id
        ) ?? null
      : null;

  const analysisWeather =
    analysisRecommendation?.weather_snapshot ?? weather;

  const contextEvaluation = evaluateProjectContext(
    analysis?.ndvi != null
      ? Number(analysis.ndvi)
      : null,
    selectedCropProfile,
    selectedCropStageProfile,
    growthStage,
    analysisWeather,
    ndviHistory,
    analysis?.created_at ?? null,
    soilProfile
  );

  /*
   * Uložený recommendation zůstává autoritativním snapshotem
   * pro hlavní výstup analýzy. Pokud jde o starší záznam bez
   * recommendation, použije se aktuální výsledek decision enginu.
   */
  const displayedLevel =
    analysisRecommendation?.level ?? contextEvaluation.level;

  const displayedPriority =
    analysisRecommendation?.priority ?? contextEvaluation.priority;

  const displayedScore =
    analysisRecommendation?.score != null
      ? Number(analysisRecommendation.score)
      : contextEvaluation.score;

  const displayedSummary =
    analysisRecommendation?.summary || contextEvaluation.summary;

  const displayedRecommendation =
    analysisRecommendation?.recommendation ||
    contextEvaluation.recommendation;

  const displayedActions =
    Array.isArray(analysisRecommendation?.actions) &&
    analysisRecommendation.actions.length > 0
      ? analysisRecommendation.actions
      : contextEvaluation.actions;

  const priorityClass =
    displayedPriority === "Kritická"
      ? "text-red-400"
      : displayedPriority === "Vysoká"
        ? "text-orange-400"
        : displayedPriority === "Střední"
          ? "text-amber-400"
          : "text-emerald-400";

  // ---------------------------------------------------------
  // AEGRIS TREND / POSLEDNÍ ZMĚNA
  // Jeden kanonický výpočet z decision engine.
  // ---------------------------------------------------------

  const recommendationTrend = (() => {
    if (contextEvaluation.trend.direction === "Klesající") {
      return { label: "Vývoj se zhoršuje", icon: "↘", className: "text-red-400" };
    }
    if (contextEvaluation.trend.direction === "Rostoucí") {
      return { label: "Porost se zlepšuje", icon: "↗", className: "text-emerald-400" };
    }
    if (contextEvaluation.trend.direction === "Stabilní") {
      return { label: "Vývoj je stabilní", icon: "→", className: "text-amber-400" };
    }
    return { label: "Nedostatek historických dat", icon: "—", className: "text-slate-500" };
  })();

  const latestNdviChange = contextEvaluation.trend.latestChange;
  const latestNdviChangeClass =
    latestNdviChange == null
      ? "text-slate-400"
      : latestNdviChange > 0
        ? "text-emerald-400"
        : latestNdviChange < 0
          ? "text-red-400"
          : "text-amber-400";

  const latestNdviChangeLabel =
    latestNdviChange == null
      ? "—"
      : `${latestNdviChange >= 0 ? "+" : ""}${latestNdviChange.toFixed(3)}`;

  const trendWindowLabel =
    contextEvaluation.trend.points >= 2
      ? `až ${Math.max(1, contextEvaluation.trend.points - 1)} předchozích + aktuální`
      : "nedostatek dat";

  const decisionTitle =
    recommendationTrend.label === "Vývoj se zhoršuje"
      ? "Dlouhodobě klesající aktivita porostu"
      : displayedLevel;

  const indicationStrengthLabel = (confidence: number) => {
    if (confidence >= 0.85) return "Velmi silná";
    if (confidence >= 0.65) return "Silná";
    if (confidence >= 0.4) return "Střední";
    return "Slabá";
  };

  const unreadAlerts = alerts.filter((alert) => !alert.is_read).length;
  const currentNdvi = analysis?.ndvi != null ? Number(analysis.ndvi) : null;
  const recentRecommendations = recommendationHistory.slice(0, 3);
  const recentAnalyses = history.slice(0, 5);
  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030817] px-4 text-white">
        {projectLoadError ? (
          <div className="w-full max-w-xl rounded-2xl border border-red-500/20 bg-[#071225]/95 p-8 text-center shadow-2xl shadow-black/30">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/25 bg-red-500/10 text-2xl text-red-400">
              !
            </div>

            <div className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-red-400">
              Přístup zamítnut
            </div>

            <h1 className="mt-2 text-xl font-black text-slate-100">
              K tomuto projektu nemáte přístup
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
              Projekt neexistuje nebo nemáte oprávnění k jeho zobrazení.
            </p>

            <button
              type="button"
              onClick={() => router.replace("/projects")}
              className="mt-6 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
            >
              Zpět na projekty
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
            <div className="text-sm">Načítám projekt...</div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030817] px-3 py-3 text-slate-100 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}
        <header className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => router.back()}
              className="shrink-0 rounded-lg border border-slate-800 bg-[#071225] px-3 py-2 font-semibold text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-400"
            >
              ← Zpět
            </button>
            <span className="hidden sm:inline">Projekty</span>
            <span className="hidden sm:inline">›</span>
            <span className="truncate font-bold text-slate-100">{project.name}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-[9px] text-slate-600">
            <span className="hidden sm:inline">Aktualizováno: {new Date(analysis?.created_at ?? project.created_at).toLocaleString("cs-CZ")}</span>
            <button
              type="button"
              onClick={loadProject}
              className="text-base font-bold text-cyan-400 transition hover:rotate-180"
              title="Obnovit data"
            >
              ↻
            </button>
          </div>
        </header>

        {/* 1. OVERVIEW */}
        <section className="grid gap-3 xl:grid-cols-12">
          <div className="rounded-xl border border-slate-800 bg-[#071225]/95 p-4 xl:col-span-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-200">ⓘ Informace o projektu</div>
              <span className="rounded-md border border-emerald-400/25 bg-emerald-400/5 px-2 py-1 text-[9px] font-black text-emerald-400">{project.status}</span>
            </div>
            <div className="mt-3 rounded-lg border border-slate-800 bg-[#061022] p-3">
              <div className="text-[9px] uppercase tracking-widest text-slate-600">Status</div>
              <div className="mt-1 text-xs font-bold text-emerald-400">{project.status}</div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-800 bg-slate-800">
              <div className="bg-[#061022] p-3"><div className="text-[8px] text-slate-600">Šířka</div><div className="mt-1 text-[10px] font-bold text-slate-200">{project.latitude.toFixed(6)}</div></div>
              <div className="bg-[#061022] p-3"><div className="text-[8px] text-slate-600">Délka</div><div className="mt-1 text-[10px] font-bold text-slate-200">{project.longitude.toFixed(6)}</div></div>
              <div className="bg-[#061022] p-3"><div className="text-[8px] text-slate-600">Plocha</div><div className="mt-1 text-[10px] font-bold text-slate-200">{project.area_ha != null ? `${project.area_ha} ha` : "—"}</div></div>
              <div className="bg-[#061022] p-3"><div className="text-[8px] text-slate-600">Růstová fáze</div><div className="mt-1 text-[10px] font-bold text-slate-200">{project.growth_stage ?? "—"}</div></div>
            </div>
            <div className="mt-2 text-[8px] text-slate-600">Založeno: {new Date(project.created_at).toLocaleDateString("cs-CZ")}</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#071225]/95 p-4 xl:col-span-8">
            <div className="grid gap-3 lg:grid-cols-[1fr_250px]">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-100">◒ Aktuální stav vegetace</div>
                <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-lg border border-slate-800 bg-[#061022]">
                  <div className="border-r border-slate-800 p-3"><div className="text-[8px] uppercase tracking-widest text-slate-500">NDVI</div><div className="mt-1 text-2xl font-black text-cyan-400">{currentNdvi != null ? currentNdvi.toFixed(3) : "—"}</div><div className={`text-[8px] ${latestNdviChangeClass}`}>{latestNdviChangeLabel} vs. předchozí</div></div>
                  <div className="border-r border-slate-800 p-3"><div className="text-[8px] uppercase tracking-widest text-slate-500">Stav porostu</div><div className={`mt-1 text-lg font-black ${priorityClass}`}>{displayedLevel === "Bez vyhodnocení" ? "—" : displayedLevel}</div><div className="text-[8px] text-slate-500">AEGRIS hodnocení z dostupných dat</div></div>
                  <div className="p-3"><div className="text-[8px] uppercase tracking-widest text-slate-500">AEGRIS RIZIKO</div><div className={`mt-1 text-lg font-black ${priorityClass}`}>{displayedLevel === "Bez vyhodnocení" ? "—" : contextEvaluation.scoreLevel}</div><div className="text-[8px] text-slate-500">Priorita {displayedPriority}</div></div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-slate-500">
                  <span>Poslední analýza: {analysis ? new Date(analysis.created_at).toLocaleString("cs-CZ") : "—"}</span>
                  {analysisRecommendation?.weather_snapshot && (
                    <span className="text-cyan-500/70">
                      AEGRIS vyhodnocení používá uložený snapshot podmínek
                    </span>
                  )}
                </div>
                {organizationRole !== "viewer" ? (
                  <button type="button" onClick={runAnalysis} disabled={runningAnalysis} className="mt-3 w-full rounded-lg bg-cyan-500 py-2.5 text-xs font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50">{runningAnalysis ? "🤖 Analyzuji..." : "🤖 Spustit AI analýzu"}</button>
                ) : (
                  <div className="mt-3 rounded-lg border border-slate-800 bg-[#061022] py-2.5 text-center text-[9px] font-bold text-slate-500">
                    Viewer má přístup pouze pro čtení.
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-slate-800 bg-[#061022]">
                <div className="flex flex-col items-center justify-center border-r border-slate-800 p-3 text-center">
                  <div className="text-[8px] uppercase tracking-widest text-slate-500">Kontextové vyhodnocení</div>
                  <div className="relative mt-3 flex h-24 w-24 items-center justify-center rounded-full border-[8px] border-slate-800">
                    <div className="absolute inset-[-8px] rounded-full border-[8px] border-transparent border-t-cyan-400 border-r-cyan-400" />
                    <div><div className="text-xl font-black text-amber-400">{displayedScore} / 100</div><div className="text-[8px] text-slate-400">AEGRIS skóre · {contextEvaluation.scoreLevel}</div></div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-3 text-center"><div className="text-[8px] uppercase tracking-widest text-slate-500">Kritické faktory</div><div className="mt-3 text-2xl font-black text-red-400">{contextEvaluation.criticalFactorCount}</div><div className="text-[8px] text-slate-500">z {contextEvaluation.evaluatedFactorCount}</div><div className="mt-2 text-[8px] font-bold text-cyan-400">Data: {contextEvaluation.dataCompletenessPct}%</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* DATA PROVENANCE / QUALITY */}
        <section className="mt-3 rounded-xl border border-slate-800 bg-[#071225]/95 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">
                DATA PROVENANCE
              </div>
              <h2 className="mt-1 text-sm font-black">
                KVALITA A PŮVOD DAT
              </h2>
              <p className="mt-1 text-[9px] text-slate-500">
                Technická metadata poslední uložené Sentinel analýzy.
              </p>
            </div>

            {analysis?.valid_geometry_pct != null && (
              <span
                className={`rounded-md border px-2 py-1 text-[9px] font-black ${
                  Number(analysis.valid_geometry_pct) >= 90
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-400"
                    : Number(analysis.valid_geometry_pct) >=
                        Number(analysis.quality_gate_pct ?? 60)
                      ? "border-amber-500/30 bg-amber-500/5 text-amber-400"
                      : "border-red-500/30 bg-red-500/5 text-red-400"
                }`}
              >
                Validní pokrytí {Number(analysis.valid_geometry_pct).toFixed(1)} %
              </span>
            )}
          </div>

          {analysis?.source_provider ? (
            <>
              <div className="mt-3 grid gap-px overflow-hidden rounded-lg border border-slate-800 bg-slate-800 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-[#061022] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">
                    Zdroj
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-slate-200">
                    {analysis.satellite_product ?? analysis.satellite ?? "—"}
                  </div>
                  <div className="mt-0.5 text-[8px] text-slate-500">
                    {analysis.source_provider}
                  </div>
                </div>

                <div className="bg-[#061022] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">
                    Prostorové rozlišení
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-cyan-400">
                    {analysis.spatial_resolution_m != null
                      ? `${analysis.spatial_resolution_m} m`
                      : "—"}
                  </div>
                  <div className="mt-0.5 text-[8px] text-slate-500">
                    {analysis.analysis_crs ?? "CRS neuvedeno"}
                  </div>
                </div>

                <div className="bg-[#061022] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">
                    Validní pixely
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-slate-200">
                    {analysis.valid_pixel_count != null &&
                    analysis.geometry_pixel_count != null
                      ? `${analysis.valid_pixel_count} / ${analysis.geometry_pixel_count}`
                      : "—"}
                  </div>
                  <div className="mt-0.5 text-[8px] text-slate-500">
                    po cloud / no-data maskování
                  </div>
                </div>

                <div className="bg-[#061022] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">
                    Quality gate
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-slate-200">
                    {analysis.quality_gate_pct != null
                      ? `min. ${Number(analysis.quality_gate_pct).toFixed(0)} %`
                      : "—"}
                  </div>
                  <div className="mt-0.5 text-[8px] text-slate-500">
                    minimální validní pokrytí polygonu
                  </div>
                </div>
              </div>

              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-slate-800 bg-[#061022] p-3">
                  <div className="text-[8px] text-slate-600">Přijaté intervaly</div>
                  <div className="mt-1 text-base font-black text-emerald-400">
                    {analysis.accepted_intervals ?? "—"}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-[#061022] p-3">
                  <div className="text-[8px] text-slate-600">Odmítnuté intervaly</div>
                  <div className="mt-1 text-base font-black text-amber-400">
                    {analysis.rejected_intervals ?? "—"}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-[#061022] p-3">
                  <div className="text-[8px] text-slate-600">Medián NDVI</div>
                  <div className="mt-1 text-base font-black text-cyan-400">
                    {analysis.median_ndvi != null
                      ? Number(analysis.median_ndvi).toFixed(3)
                      : "—"}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 bg-[#061022] p-3">
                  <div className="text-[8px] text-slate-600">NDVI P05–P95</div>
                  <div className="mt-1 text-base font-black text-slate-200">
                    {analysis.p05_ndvi != null && analysis.p95_ndvi != null
                      ? `${Number(analysis.p05_ndvi).toFixed(3)} – ${Number(
                          analysis.p95_ndvi
                        ).toFixed(3)}`
                      : "—"}
                  </div>
                </div>
              </div>

              <div className="mt-2 text-[8px] leading-4 text-slate-600">
                NDVI je počítáno ze Sentinel-2 pásem B08 a B04. Neplatné pixely
                jsou odfiltrovány pomocí Scene Classification Layer (SCL) a
                dataMask. Počasí v AEGRIS pochází ze samostatného weather
                zdroje a historické vyhodnocení používá uložený snapshot.
              </div>
            </>
          ) : (
            <div className="mt-3 rounded-lg border border-slate-800 bg-[#061022] p-3 text-[9px] leading-4 text-slate-500">
              Tato uložená analýza ještě neobsahuje metadata kvality. Spusťte
              novou analýzu; AEGRIS poté uloží skutečný zdroj, rozlišení,
              validní pokrytí a quality gate přímo z Copernicus výsledku.
            </div>
          )}
        </section>

        {/* 2. DECISION / ALERT / ACTIONS */}
        <section className="mt-3 grid gap-3 xl:grid-cols-12">
          <div className="rounded-xl border border-slate-800 bg-[#071225]/95 p-4 xl:col-span-5">
            <div className="flex items-center justify-between gap-2"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">AEGRIS DECISION</div><h2 className="mt-1 text-sm font-black">ROZHODOVACÍ DOPORUČENÍ</h2></div><span className={`rounded-md border px-2 py-1 text-[9px] font-black ${displayedPriority === "Kritická" ? "border-red-500/40 bg-red-500/5 text-red-400" : "border-orange-500/40 bg-orange-500/5 text-orange-400"}`}>Priorita: {displayedPriority}</span></div>
            <div className="mt-3 text-[8px] font-black uppercase tracking-[0.18em] text-cyan-400">CO SE DĚJE</div>
            <h3 className="mt-1 text-lg font-black">{decisionTitle}</h3>
            <p className="mt-1 text-[10px] leading-4 text-slate-400">{displayedSummary}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-slate-800 bg-[#061022] p-2.5"><div className="text-[8px] text-slate-600">NDVI</div><div className="mt-1 text-base font-black text-cyan-400">{currentNdvi?.toFixed(3) ?? "—"}</div></div>
              <div className="rounded-lg border border-slate-800 bg-[#061022] p-2.5"><div className="text-[8px] text-slate-600">DLOUHODOBÝ TREND</div><div className={`mt-1 text-[10px] font-black ${recommendationTrend.className}`}>{recommendationTrend.icon} {recommendationTrend.label}</div></div>
              <div className="rounded-lg border border-slate-800 bg-[#061022] p-2.5"><div className="text-[8px] text-slate-600">OD POSLEDNÍ ANALÝZY</div><div className={`mt-1 text-base font-black ${latestNdviChangeClass}`}>{latestNdviChangeLabel}</div></div>
            </div>
            <div className="mt-3 text-[8px] font-black uppercase tracking-[0.18em] text-cyan-400">CO UDĚLAT NYNÍ</div>
            <div className="mt-2 space-y-1.5">{displayedActions.slice(0, 4).map((action, index) => <div key={`decision-${index}`} className="flex gap-2 rounded-lg bg-[#061022] p-2 text-[10px] leading-4 text-slate-400"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 font-black text-cyan-400">{index + 1}</span><span>{action}</span></div>)}</div>
            <div className="mt-3 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.03] p-3 text-[9px] leading-4 text-slate-400"><span className="font-black text-cyan-400">DALŠÍ KROK</span><br /><span className="text-[10px] font-bold text-slate-200">{displayedRecommendation}</span></div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#071225]/95 p-4 xl:col-span-4">
            <div className="flex items-center justify-between"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">🚨 AEGRIS ALERTY</div><h2 className="mt-1 text-sm font-black">UPOZORNĚNÍ PROJEKTU</h2></div><span className="rounded-md border border-slate-800 px-2 py-1 text-[8px] text-slate-400">Nepřečtené {unreadAlerts}</span></div>
            <div className="mt-3 space-y-2">{alerts.slice(0, 3).map((alert, index) => <div key={alert.id} className={`rounded-lg border p-3 ${alert.level === "critical" ? "border-red-500/25 bg-red-500/[0.03]" : "border-slate-800 bg-[#061022]"}`}><div className="flex items-start justify-between gap-2"><div className="flex gap-2"><span className={`mt-1 h-2.5 w-2.5 rounded-full ${alert.level === "critical" ? "bg-red-500" : alert.level === "warning" ? "bg-orange-400" : "bg-cyan-400"}`} /><div><div className="text-[10px] font-black">{alert.title}{!alert.is_read && <span className="ml-1 rounded bg-cyan-500/10 px-1 text-[7px] text-cyan-400">NOVÉ</span>}</div><div className="mt-1 text-[8px] text-slate-600">{new Date(alert.created_at).toLocaleString("cs-CZ")}</div></div></div><span className="rounded bg-red-500/10 px-2 py-1 text-[8px] font-black text-red-400">{alert.priority}</span></div><p className="mt-2 text-[9px] leading-4 text-slate-500">{alert.message}</p>{!alert.is_read && index === 0 && <button type="button" onClick={() => markAlertAsRead(alert.id)} className="mt-2 text-[8px] font-bold text-cyan-400 hover:text-cyan-300">✓ Označit jako přečtené</button>}</div>)}{alerts.length === 0 && <div className="rounded-lg bg-[#061022] p-4 text-[10px] text-slate-500">Zatím nebyl vytvořen žádný alert.</div>}</div>
            <button type="button" onClick={() => document.getElementById("project-history")?.scrollIntoView({ behavior: "smooth" })} className="mt-3 w-full rounded-lg border border-slate-800 bg-[#061022] py-2 text-[9px] font-bold text-cyan-400">Zobrazit všechna upozornění ({alerts.length})</button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#071225]/95 p-4 xl:col-span-3">
            <div className="flex items-center justify-between"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">♧ AEGRIS DOPORUČENÍ</div><h2 className="mt-1 text-sm font-black">CO NYNÍ UDĚLAT</h2></div><span className={`rounded-md border px-2 py-1 text-[8px] font-black ${priorityClass} border-current/20`}>{displayedPriority}</span></div>
            <div className="mt-3 space-y-2">{displayedActions.slice(0, 5).map((action, index) => <div key={`recommend-${index}`} className="flex gap-2 rounded-lg bg-[#061022] p-2 text-[9px] leading-4 text-slate-400"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 font-black text-cyan-400">{index + 1}</span><span>{action}</span></div>)}</div>
          </div>
        </section>

        {/* 3. DIAGNOSTICS + FACTORS */}
        <section className="mt-3 grid gap-3 xl:grid-cols-12">
          <div className="rounded-xl border border-slate-800 bg-[#071225]/95 p-4 xl:col-span-5">
            <div className="flex items-center justify-between"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">AEGRIS DIAGNOSTIKA</div><h2 className="mt-1 text-sm font-black">Pravděpodobné příčiny aktuálního rizika</h2></div><span className="rounded-md border border-red-500/20 bg-red-500/5 px-2 py-1 text-[8px] font-black text-red-400">{contextEvaluation.diagnoses.length} diagn.</span></div>
            <div className="mt-3 space-y-2">{contextEvaluation.diagnoses.slice(0, 2).map((diagnosis) => <div key={diagnosis.code} className="rounded-lg border border-slate-800 bg-[#061022] p-3"><div className="flex items-center justify-between gap-2"><div className="text-[10px] font-black text-slate-100">{diagnosis.label}</div><div className="text-right"><div className="text-[8px] uppercase tracking-wider text-slate-600">Síla indikace</div><div className="text-[10px] font-black text-red-400">{indicationStrengthLabel(diagnosis.confidence)}</div></div></div>{diagnosis.evidence.length > 0 && <div className="mt-2 space-y-1">{diagnosis.evidence.slice(0, 3).map((evidence, index) => <div key={`${diagnosis.code}-${index}`} className="flex gap-2 text-[8px] leading-4 text-slate-500"><span className="text-orange-400">•</span><span>{evidence}</span></div>)}</div>}</div>)}{contextEvaluation.diagnoses.length === 0 && <div className="rounded-lg bg-[#061022] p-3 text-[9px] text-slate-500">Bez aktuálně identifikované diagnózy.</div>}</div>
          </div>
          <div className="xl:col-span-7 rounded-xl border border-slate-800 bg-[#071225]/95 p-4"><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">KLÍČOVÉ FAKTORY</div><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{contextEvaluation.factors.slice(0, 6).map((factor, index) => { const scoreItem = contextEvaluation.scoreBreakdown.find((item) => item.label === factor.label); return <div key={`${factor.label}-${index}`} className="rounded-lg border border-slate-800 bg-[#061022] p-3"><div className="flex items-start justify-between gap-2"><div className="text-[9px] font-semibold leading-4 text-slate-300">{factor.label}</div><span className={`rounded-full px-2 py-1 text-[7px] font-black ${factor.status === "OK" ? "bg-emerald-500/10 text-emerald-400" : factor.status === "Upozornění" ? "bg-amber-500/10 text-amber-400" : factor.status === "Kritické" ? "bg-red-500/10 text-red-400" : "bg-slate-500/10 text-slate-400"}`}>{factor.status === "OK" ? "V NORMĚ" : factor.status}</span></div>{scoreItem && <div className="mt-2 text-[8px] font-bold text-cyan-400">Skóre {scoreItem.score}/100 · váha {scoreItem.weight}%</div>}<p className="mt-2 text-[8px] leading-4 text-slate-500">{factor.detail}</p></div>})}</div></div>
        </section>

        {/* 4. SINGLE NDVI CHART + SIDE DATA */}
        <section className="mt-3 grid gap-3 xl:grid-cols-12">
          <div className="rounded-xl border border-slate-800 bg-[#071225]/95 p-4 xl:col-span-8">
            <div className="flex items-start justify-between gap-3"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">VÝVOJ NDVI</div><div className="mt-1 flex flex-wrap items-center gap-2 text-[9px]"><span className="font-bold">Trend:</span><span className={recommendationTrend.className}>{recommendationTrend.label === "Porost se zlepšuje" ? "Rostoucí" : recommendationTrend.label === "Vývoj se zhoršuje" ? "Klesající" : recommendationTrend.label === "Vývoj je stabilní" ? "Stabilní" : recommendationTrend.label}</span><span className="text-slate-700">•</span><span className="text-slate-500">Trendové okno:</span><span className="font-bold text-slate-300">{trendWindowLabel}</span></div></div><div className={`text-right text-[9px] font-black ${recommendationTrend.className}`}>NDVI {currentNdvi?.toFixed(3) ?? "—"}<br /><span className="font-normal">{recommendationTrend.label}</span></div></div>
            <div className="mt-2 h-[290px]"><AnalysisChart history={chartHistory} /></div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#071225]/95 p-4 xl:col-span-4">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">VÝVOJ STAVU A DOPORUČENÍ</div>
            <div className="mt-3 space-y-2">{recentRecommendations.map((item) => <div key={item.id} className="rounded-lg border border-slate-800 bg-[#061022] p-2.5"><div className="text-[8px] text-slate-600">{new Date(item.created_at).toLocaleString("cs-CZ")}</div><div className="mt-1 flex items-center justify-between gap-2"><span className="text-[9px] font-bold text-cyan-400">{item.crop_name ?? "Plodina"}</span><span className="text-[8px] font-bold text-slate-300">NDVI {item.ndvi != null ? Number(item.ndvi).toFixed(3) : "—"}</span><span className={`text-[8px] font-black ${item.priority === "Kritická" ? "text-red-400" : item.priority === "Vysoká" ? "text-orange-400" : "text-emerald-400"}`}>{item.priority}</span></div></div>)}{recentRecommendations.length === 0 && <div className="rounded-lg bg-[#061022] p-3 text-[9px] text-slate-500">Zatím žádný záznam.</div>}</div>
            <button type="button" onClick={() => document.getElementById("project-history")?.scrollIntoView({ behavior: "smooth" })} className="mt-3 w-full rounded-lg border border-slate-800 py-2 text-[9px] font-bold text-cyan-400">Zobrazit historii doporučení</button>
            <div className="mt-4 border-t border-slate-800 pt-3"><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">HISTORIE ANALÝZ</div><div className="mt-2 space-y-1.5">{recentAnalyses.slice(0, 4).map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg bg-[#061022] px-2.5 py-2 text-[8px]"><span className="text-slate-500">{new Date(item.created_at).toLocaleDateString("cs-CZ")}</span><span className="font-bold text-cyan-400">NDVI {Number(item.ndvi).toFixed(3)}</span><span className="font-bold text-slate-300">{item.risk}</span></div>)}</div></div>
          </div>
        </section>

        {/* 5. WEATHER */}
        <section className="mt-3 rounded-xl border border-slate-800 bg-[#071225]/95 p-4">
          <div className="flex items-center justify-between gap-3"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">POČASÍ A PODMÍNKY</div><h2 className="mt-1 text-sm font-black">AKTUÁLNÍ PODMÍNKY V LOKALITĚ</h2></div><button type="button" onClick={() => loadWeather(project.id)} disabled={loadingWeather} className="rounded-lg border border-slate-800 px-3 py-2 text-[8px] font-bold text-slate-400 hover:border-cyan-400 hover:text-cyan-400 disabled:opacity-50">↻ Obnovit</button></div>
          {weather ? <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4"><div className="rounded-lg border border-slate-800 bg-[#061022] p-3"><div className="text-[8px] text-slate-500">Teplota</div><div className="mt-1 text-lg font-black text-orange-400">{weather.temperature_c != null ? `${weather.temperature_c.toFixed(1)} °C` : "—"}</div><div className={`text-[8px] ${temperatureStatusClass}`}>{temperatureStatus}</div></div><div className="rounded-lg border border-slate-800 bg-[#061022] p-3"><div className="text-[8px] text-slate-500">Vlhkost</div><div className="mt-1 text-lg font-black text-cyan-400">{weather.humidity_pct != null ? `${weather.humidity_pct.toFixed(0)} %` : "—"}</div><div className="text-[8px] text-cyan-400">Aktuální</div></div><div className="rounded-lg border border-slate-800 bg-[#061022] p-3"><div className="text-[8px] text-slate-500">Srážky – poslední hodina</div><div className="mt-1 text-lg font-black">{weather.precipitation_mm != null ? `${weather.precipitation_mm.toFixed(1)} mm` : "—"}</div><div className="text-[8px] text-slate-500">Aktuální</div></div><div className="rounded-lg border border-slate-800 bg-[#061022] p-3"><div className="text-[8px] text-slate-500">Vítr</div><div className="mt-1 text-lg font-black">{weather.wind_speed_kmh != null ? `${weather.wind_speed_kmh.toFixed(1)} km/h` : "—"}</div><div className="text-[8px] text-emerald-400">Aktuální</div></div></div> : <div className="mt-3 text-[9px] text-slate-500">{loadingWeather ? "Načítám počasí..." : "Počasí se nepodařilo načíst."}</div>}
        </section>

        {/* 6. PROJECT DATA */}
        <section className="mt-3 grid gap-3 xl:grid-cols-12">
          <div className="rounded-xl border border-slate-800 bg-[#071225]/95 p-4 xl:col-span-4">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">DETAILY PROJEKTU</div>
            <div className="mt-3 space-y-1.5 text-[9px]">{[["Plodina", project.crop_name ?? "—"],["Odrůda", project.crop_variety ?? "—"],["Výměra", project.area_ha != null ? `${project.area_ha} ha` : "—"],["Růstová fáze", project.growth_stage ?? "—"],["Datum setí", project.sowing_date ? new Date(project.sowing_date).toLocaleDateString("cs-CZ") : "—"],["Očekávaná sklizeň", project.expected_harvest_date ? new Date(project.expected_harvest_date).toLocaleDateString("cs-CZ") : "—"],["Způsob pěstování", project.farming_method ?? "—"]].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 border-b border-slate-800/70 py-2"><span className="text-slate-500">{label}</span><span className="text-right font-semibold text-slate-200">{value}</span></div>)}</div>
            {organizationRole !== "viewer" && (
              <button type="button" onClick={openCropEditor} className="mt-3 w-full rounded-lg bg-cyan-500 py-2 text-[9px] font-black text-slate-950 hover:bg-cyan-400">✎ Upravit údaje o plodině</button>
            )}
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#071225]/95 p-4 xl:col-span-4">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">PROFIL PLODINY</div>
            <h2 className="mt-1 text-base font-black">{selectedCropProfile?.name ?? project.crop_name ?? "—"}</h2>
            <div className="text-[8px] text-slate-600">{selectedCropProfile?.category ?? "Profil není vyhodnocen"}</div>
            <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-lg bg-slate-800 p-2.5"><div className="text-[8px] text-slate-500">🌡️ Teplota</div><div className="mt-1 text-[10px] font-bold">{selectedCropProfile?.min_temperature_c != null && selectedCropProfile?.max_temperature_c != null ? `${selectedCropProfile.min_temperature_c}–${selectedCropProfile.max_temperature_c} °C` : "Neuvedeno"}</div></div><div className="rounded-lg bg-slate-800 p-2.5"><div className="text-[8px] text-slate-500">💧 Vlhkost</div><div className="mt-1 text-[10px] font-bold">{selectedCropProfile?.soil_moisture_min_pct != null && selectedCropProfile?.soil_moisture_max_pct != null ? `${selectedCropProfile.soil_moisture_min_pct}–${selectedCropProfile.soil_moisture_max_pct} %` : "Neuvedeno"}</div></div><div className="rounded-lg bg-slate-800 p-2.5"><div className="text-[8px] text-slate-500">pH půdy</div><div className="mt-1 text-[10px] font-bold">{selectedCropProfile?.ph_min != null && selectedCropProfile?.ph_max != null ? `${selectedCropProfile.ph_min}–${selectedCropProfile.ph_max}` : "Neuvedeno"}</div></div><div className="rounded-lg bg-slate-800 p-2.5"><div className="text-[8px] text-slate-500">💦 Potřeba vody</div><div className="mt-1 text-[10px] font-bold">{selectedCropProfile?.water_need ?? "Neuvedeno"}</div></div></div>
            {selectedCropStageProfile && <div className="mt-2 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.03] p-2.5 text-[8px] text-slate-400">Fáze: <span className="font-bold text-slate-200">{selectedCropStageProfile.growth_stage}</span> · Kc <span className="font-bold text-slate-200">{selectedCropStageProfile.kc != null ? Number(selectedCropStageProfile.kc).toFixed(2) : "—"}</span> · Vodní stres <span className="font-bold text-slate-200">{selectedCropStageProfile.water_stress_sensitivity ?? "Neuvedeno"}</span></div>}
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#071225]/95 p-4 xl:col-span-4"><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">LOKALITA PROJEKTU</div><div className="mt-3 overflow-hidden rounded-lg border border-slate-800"><ProjectMap latitude={project.latitude} longitude={project.longitude} /></div><div className="mt-2 grid grid-cols-2 gap-2"><div className="rounded-lg bg-slate-800 p-2.5"><div className="text-[8px] text-slate-500">Šířka</div><div className="mt-1 text-[9px] font-bold">{project.latitude.toFixed(6)}</div></div><div className="rounded-lg bg-slate-800 p-2.5"><div className="text-[8px] text-slate-500">Délka</div><div className="mt-1 text-[9px] font-bold">{project.longitude.toFixed(6)}</div></div></div></div>
        </section>

        {/* HIDDEN/LOW-PRIORITY EDITOR — functionality remains available */}
        {organizationRole !== "viewer" && (
        <section id="crop-editor" className="mt-3 rounded-xl border border-slate-800 bg-[#071225]/95 p-4">
          <details
            open={cropEditorOpen}
            onToggle={(event) =>
              setCropEditorOpen(event.currentTarget.open)
            }
          >
            <summary className="cursor-pointer list-none text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">EDITACE ÚDAJŮ O PLODINĚ</summary>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <label className="text-[9px] text-slate-500">Pěstovaná plodina<select value={cropName} onChange={(event) => { const nextCrop = event.target.value; setCropName(nextCrop); const nextCropProfile = cropProfiles.find((profile) => profile.name === nextCrop) ?? null; const availableStages = nextCropProfile ? cropStageProfiles.filter((stageProfile) => stageProfile.crop_profile_id === nextCropProfile.id).map((stageProfile) => stageProfile.growth_stage) : []; if (!availableStages.includes(growthStage)) setGrowthStage(availableStages[0] ?? ""); }} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#061022] px-3 py-2 text-xs text-white"><option value="">Vyberte plodinu</option>{cropProfiles.map((profile) => <option key={profile.id} value={profile.name}>{profile.name}</option>)}</select></label>
              <label className="text-[9px] text-slate-500">Odrůda<input value={cropVariety} onChange={(event) => { setCropVariety(event.target.value); setCropVarietyError(""); }} className={`mt-1 w-full rounded-lg border bg-[#061022] px-3 py-2 text-xs text-white ${cropVarietyError ? "border-red-500" : "border-slate-700"}`} />{cropVarietyError && <span className="mt-1 block text-red-400">{cropVarietyError}</span>}</label>
              <label className="text-[9px] text-slate-500">Plocha (ha)<input type="number" value={areaHa} onChange={(event) => { setAreaHa(event.target.value); setAreaError(""); }} className={`mt-1 w-full rounded-lg border bg-[#061022] px-3 py-2 text-xs text-white ${areaError ? "border-red-500" : "border-slate-700"}`} />{areaError && <span className="mt-1 block text-red-400">{areaError}</span>}</label>
              <label className="text-[9px] text-slate-500">Způsob pěstování<select value={farmingMethod} onChange={(event) => setFarmingMethod(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#061022] px-3 py-2 text-xs text-white"><option value="">Vyberte</option><option value="Konvenční">Konvenční</option><option value="Integrované">Integrované</option><option value="Ekologické">Ekologické</option><option value="Jiné">Jiné</option></select></label>
              <label className="text-[9px] text-slate-500">Datum setí / výsadby<input type="date" value={sowingDate} onChange={(event) => setSowingDate(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#061022] px-3 py-2 text-xs text-white" /></label>
              <label className="text-[9px] text-slate-500">Předpokládaná sklizeň<input type="date" value={expectedHarvestDate} onChange={(event) => setExpectedHarvestDate(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#061022] px-3 py-2 text-xs text-white" /></label>
              <label className="text-[9px] text-slate-500">Aktuální růstová fáze<select value={growthStage} onChange={(event) => setGrowthStage(event.target.value)} disabled={!cropName} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#061022] px-3 py-2 text-xs text-white disabled:opacity-50"><option value="">Vyberte růstovou fázi</option>{growthStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}</select></label>
              <div className="flex items-end"><button type="button" onClick={saveCropData} disabled={savingCrop} className="w-full rounded-lg bg-cyan-500 py-2.5 text-xs font-black text-slate-950 hover:bg-cyan-400 disabled:opacity-50">{savingCrop ? "Ukládám..." : "💾 Uložit údaje o plodině"}</button></div>
            </div>
          </details>
        </section>
        )}

        {/* 7. PROJECT TIMELINE — no duplicate chart */}
        <section id="project-history" className="mt-3 rounded-xl border border-slate-800 bg-[#071225]/95 p-4">
          <div className="flex items-center justify-between gap-3"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400">VÝVOJ PROJEKTU</div><h2 className="mt-1 text-base font-black">Historie událostí</h2></div><span className={`text-[9px] font-black ${recommendationTrend.className}`}>{recommendationTrend.icon} {recommendationTrend.label}</span></div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {recentAnalyses.map((item) => <div key={`timeline-analysis-${item.id}`} className="relative rounded-lg border border-slate-800 bg-[#061022] p-3"><div className="flex items-center justify-between gap-2"><span className="text-[8px] text-slate-600">{new Date(item.created_at).toLocaleString("cs-CZ")}</span><span className="rounded-full bg-cyan-500/10 px-2 py-1 text-[7px] font-black text-cyan-400">ANALÝZA</span></div><div className="mt-2 text-[10px] font-bold text-slate-200">Analýza dokončena</div><div className="mt-1 text-[8px] text-slate-500">NDVI {Number(item.ndvi).toFixed(3)} · {item.risk}</div></div>)}
            {recentRecommendations.slice(0, 2).map((item) => <div key={`timeline-rec-${item.id}`} className="relative rounded-lg border border-slate-800 bg-[#061022] p-3"><div className="flex items-center justify-between gap-2"><span className="text-[8px] text-slate-600">{new Date(item.created_at).toLocaleString("cs-CZ")}</span><span className="rounded-full bg-orange-500/10 px-2 py-1 text-[7px] font-black text-orange-400">DOPORUČENÍ</span></div><div className="mt-2 text-[10px] font-bold text-slate-200">Doporučení vytvořeno</div><div className="mt-1 text-[8px] text-slate-500">Priorita {item.priority} · NDVI {item.ndvi != null ? Number(item.ndvi).toFixed(3) : "—"}</div></div>)}
            {recentAnalyses.length === 0 && recentRecommendations.length === 0 && <div className="rounded-lg bg-[#061022] p-4 text-[9px] text-slate-500 md:col-span-2 xl:col-span-4">Zatím nejsou k dispozici historické události.</div>}
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2"><button type="button" onClick={() => document.getElementById("project-history")?.scrollIntoView({ behavior: "smooth" })} className="rounded-lg border border-slate-800 py-2 text-[9px] font-bold text-cyan-400">Zobrazit kompletní historii projektu</button>{organizationRole !== "viewer" ? (
            <button type="button" onClick={openCropEditor} className="rounded-lg border border-slate-800 py-2 text-[9px] font-bold text-slate-400 hover:text-cyan-400">Upravit projektová data</button>
          ) : (
            <div className="rounded-lg border border-slate-800 py-2 text-center text-[9px] font-bold text-slate-600">Pouze pro čtení</div>
          )}</div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2"><div className="rounded-lg border border-slate-800 bg-[#061022] p-3"><div className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Historie doporučení</div><div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto">{recommendationHistory.map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded-md bg-[#071225] px-2.5 py-2 text-[8px]"><span className="text-slate-500">{new Date(item.created_at).toLocaleDateString("cs-CZ")}</span><span className="text-cyan-400">NDVI {item.ndvi != null ? Number(item.ndvi).toFixed(3) : "—"}</span><span className="font-bold text-slate-300">{item.priority}</span></div>)}</div></div><div className="rounded-lg border border-slate-800 bg-[#061022] p-3"><div className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Historie analýz</div><div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto">{history.map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded-md bg-[#071225] px-2.5 py-2 text-[8px]"><span className="text-slate-500">{new Date(item.created_at).toLocaleDateString("cs-CZ")}</span><span className="font-bold text-cyan-400">NDVI {Number(item.ndvi).toFixed(3)}</span><span className="font-bold text-slate-300">{item.risk}</span></div>)}</div></div></div>
        </section>
      </div>
    </main>
  );
}