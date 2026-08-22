"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
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
};

type Analysis = {
  id: number;
  project_id: number;
  ndvi: number;
  vegetation: number;
  risk: string;
  created_at: string;
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
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const analysisRunRef = useRef(false);

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
    const projectId = Number(params.id);

    if (!Number.isFinite(projectId)) {
      console.error(
        "NEPLATNÉ ID PROJEKTU:",
        params.id
      );
      return;
    }

    const {
      data: projectData,
      error: projectError,
    } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError) {
      console.error(
        "CHYBA NAČTENÍ PROJEKTU:",
        projectError
      );
      return;
    }

    const currentProject = projectData as Project;

    setProject(currentProject);

    const {
  data: soilProfileData,
  error: soilProfileError,
} = await supabase
  .from("project_soil_profiles")
  .select("*")
  .eq("project_id", currentProject.id)
  .maybeSingle();

  console.log("AEGRIS SOIL QUERY:", {
  projectId: currentProject.id,
  data: soilProfileData,
  error: soilProfileError,
});

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
    console.log("AEGRIS SOIL PROFILE:", soilProfileData);
    console.log("AEGRIS LOAD PROJECT: BEFORE WEATHER");

try {
  await loadWeather(
    currentProject.latitude,
    currentProject.longitude
  );
} catch (error) {
  console.error(
    "AEGRIS WEATHER LOAD FAILED:",
    error
  );
}

console.log("AEGRIS LOAD PROJECT: AFTER WEATHER");
console.log("AEGRIS LOAD PROJECT: BEFORE ANALYSIS QUERY");

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

console.log("AEGRIS LOAD ANALYSIS", {
  projectId: currentProject.id,
  lastAnalysis,
  analysisError,
});

console.log("AEGRIS LOAD ANALYSIS: AFTER QUERY", {
  hasAnalysis: !!lastAnalysis,
  analysisId: lastAnalysis?.id ?? null,
  analysisNdvi: lastAnalysis?.ndvi ?? null,
});

    if (analysisError) {
      console.error(
        "CHYBA NAČTENÍ POSLEDNÍ ANALÝZY:",
        analysisError
      );
    } else if (lastAnalysis) {
      setAnalysis(lastAnalysis);
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

    if (historyError) {
      console.error(
        "CHYBA NAČTENÍ ANALÝZ:",
        historyError
      );
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

console.log("AEGRIS NDVI HISTORY LOAD:", {
  projectId: currentProject.id,
  count: ndviHistoryData?.length ?? 0,
  data: ndviHistoryData,
  error: ndviHistoryError,
});

if (ndviHistoryError) {
  console.error(
    "CHYBA NAČTENÍ NDVI HISTORIE:",
    ndviHistoryError
  );
} else {
  setNdviHistory(ndviHistoryData ?? []);
}
  }, [params.id]);

  // This effect intentionally loads remote project data and updates React state.
  // The react-hooks/set-state-in-effect rule is not applicable to this data-fetching effect.
  /* eslint-disable react-hooks/set-state-in-effect */
useEffect(() => {
  console.log("AEGRIS EFFECT: START", {
    projectId: params.id,
  });

  void loadProject();

  void loadCropProfiles();
  void loadCropStageProfiles();

  console.log("AEGRIS EFFECT: STARTED");
}, [params.id]);
/* eslint-enable react-hooks/set-state-in-effect */

  async function loadWeather(latitude: number, longitude: number) {
  console.log("AEGRIS WEATHER: START", {
    latitude,
    longitude,
  });

  setLoadingWeather(true);

  try {
    const response = await fetch(
      `/api/weather?latitude=${latitude}&longitude=${longitude}`,
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

    console.log("AEGRIS WEATHER DATA:", {
      temperature,
      humidity,
      precipitation,
      wind,
      soilMoisture,
      precipitationProbability,
      next24hPrecipitation,
      next24hMinTemperature,
      next24hMaxTemperature,
      evapotranspiration,
    });

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
      fetched_at: new Date().toISOString(),
    });

  console.log("AEGRIS WEATHER: STATE SET");
  } catch (error) {
    console.error("CHYBA POČASÍ:", error);
    setWeather(null);
  } finally {
    setLoadingWeather(false);
    console.log("AEGRIS WEATHER: FINALLY");
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
          growthStage
            ? new Date().toISOString()
            : null,
      })
      .eq("id", project.id)
      .select()
      .single();

    if (error) {
      console.error(
        "CHYBA ULOŽENÍ ÚDAJŮ O PLODINĚ:",
        error
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
      `/api/analysis?projectId=${project.id}`
     );

      const result = await response.json();

      if (!response.ok) {
        console.error(
          "CHYBA API ANALÝZY:",
          result
        );
        return;
      }

      const ndvi = Number(result.ndvi);

      console.log("AEGRIS ANALYSIS API RESULT:", {
  from: result.from,
  to: result.to,
  ndvi: result.ndvi,
  historyCount: Array.isArray(result.history)
    ? result.history.length
    : "NOT_ARRAY",
  lastHistoryItem:
    Array.isArray(result.history) && result.history.length > 0
      ? result.history[result.history.length - 1]
      : null,
});

const freshNdviHistory =
  Array.isArray(result.history)
    ? result.history
        .map(
          (
            item: unknown
          ) => {
            if (
              item === null ||
              typeof item !== "object"
            ) {
              return null;
            }

            const candidate =
              item as Record<string, unknown>;

            if (
              typeof candidate.from !== "string" ||
              typeof candidate.to !== "string" ||
              typeof candidate.ndvi !== "number"
            ) {
              return null;
            }

            return {
              id: 0,
              project_id: project.id,
              period_from: candidate.from,
              period_to: candidate.to,
              ndvi: candidate.ndvi,
              created_at:
                new Date().toISOString(),
            };
          }
        )
        .filter(
  (
    item: unknown
  ): item is NdviHistory =>
    item !== null
)
    : [];

  setNdviHistory(freshNdviHistory);

      if (!Number.isFinite(ndvi)) {
        console.error(
          "API VRÁTILO NEPLATNÉ NDVI:",
          result.ndvi
        );
        return;
      }

      const vegetation = Math.round(ndvi * 100);

      // ---------------------------------------------------------
      // AEGRIS DECISION ENGINE = jediný zdroj pravdy pro risk
      // ---------------------------------------------------------
      const analysisCreatedAt = new Date().toISOString();

      const recommendation = evaluateProjectContext(
        ndvi,
        selectedCropProfile,
        selectedCropStageProfile,
        growthStage,
        weather,
        freshNdviHistory,
        analysisCreatedAt,
        soilProfile
      );

      // DB tabulka analysis používá starší pole "risk".
      // Hodnotu ale už neurčujeme pouze podle NDVI.
      // Převádíme kanonickou AEGRIS prioritu do staršího formátu.
      const risk =
        recommendation.priority === "Kritická"
          ? "Kritické"
          : recommendation.priority === "Vysoká"
            ? "Vysoké"
            : recommendation.priority === "Střední"
              ? "Střední"
              : "Nízké";

const {
  data,
  error,
} = await supabase
  .from("analysis")
  .insert({
    project_id: project.id,
    ndvi,
    vegetation,
    risk,
    period_from:
  Array.isArray(result.history) && result.history.length > 0
    ? result.history[result.history.length - 1].from
    : null,
  period_to:
    Array.isArray(result.history) && result.history.length > 0
    ? result.history[result.history.length - 1].to
    : null,
  })
  .select()
  .single();

      if (error) {
        console.error(
          "CHYBA INSERTU ANALÝZY:",
          error
        );
        return;
      }

      setAnalysis(data);

      const {
        data: recommendationData,
        error: recommendationInsertError,
      } = await supabase
        .from("aegris_recommendations")
        .upsert(
          {
            project_id: project.id,
            analysis_id: data.id,
            crop_name: cropName || null,
            growth_stage: growthStage || null,
            ndvi,
            level: recommendation.level,
            priority: recommendation.priority,
            score: recommendation.score,
            summary: recommendation.summary,
            recommendation: recommendation.recommendation,
            actions: recommendation.actions,
            weather_snapshot: weather,
          },
          { onConflict: "analysis_id" }
        )
        .select()
        .single();

      if (recommendationInsertError) {
        console.error(
          "CHYBA ULOŽENÍ HISTORIE AEGRIS:",
          recommendationInsertError
        );
      }

      // ---------------------------------------------------------
      // AEGRIS ALERT
      // Kritický / varovný / informační stav se pro projekt drží
      // jako jeden aktivní (nepřečtený) alert stejného typu.
      // Opakované spuštění analýzy tedy nevytváří kopie.
      //
      // NULL v is_read bereme stejně jako false, protože starší
      // databázové záznamy mohou mít tento sloupec nevyplněný.
      // ---------------------------------------------------------

      const alertLevel: AegrisAlert["level"] =
        recommendation.level === "Kritické"
          ? "critical"
          : recommendation.level === "Upozornění"
            ? "warning"
            : "info";

      const alertTitle =
        recommendation.level === "Kritické"
          ? "Kritický stav projektu"
          : recommendation.level === "Upozornění"
            ? "AEGRIS upozornění"
            : "AEGRIS informační stav";

      const alertMessage =
        `${recommendation.summary} ${recommendation.recommendation}`.trim();

      // Po změně stavu nesmí zůstat starý nepřečtený alert
      // jiné úrovně. Jinak by dashboard mohl zobrazovat staré
      // "Kritické" upozornění i po novém vyhodnocení.
      const { error: staleAlertError } = await supabase
        .from("aegris_alerts")
        .update({ is_read: true })
        .eq("project_id", project.id)
        .neq("level", alertLevel)
        .or("is_read.eq.false,is_read.is.null");

      if (staleAlertError) {
        console.error(
          "CHYBA ČIŠTĚNÍ STARÝCH ALERTŮ AEGRIS:",
          staleAlertError
        );
      }

      const {
        data: existingAlerts,
        error: existingAlertError,
      } = await supabase
        .from("aegris_alerts")
        .select("id")
        .eq("project_id", project.id)
        .eq("level", alertLevel)
        .eq("title", alertTitle)
        .or("is_read.eq.false,is_read.is.null")
        .order("created_at", { ascending: false })
        .limit(100);

      if (existingAlertError) {
        console.error(
          "CHYBA KONTROLY DUPLICITNÍHO ALERTU AEGRIS:",
          existingAlertError
        );
      }

      const existingAlert = existingAlerts?.[0] ?? null;
      const duplicateAlertIds = (existingAlerts ?? [])
        .slice(1)
        .map((alert) => alert.id);

      if (existingAlert?.id) {
        const { error: alertUpdateError } = await supabase
          .from("aegris_alerts")
          .update({
            analysis_id: data.id,
            recommendation_id: recommendationData?.id ?? null,
            priority: recommendation.priority,
            message: alertMessage,
            is_read: false,
          })
          .eq("id", existingAlert.id);

        if (alertUpdateError) {
          console.error(
            "CHYBA AKTUALIZACE EXISTUJÍCÍHO ALERTU AEGRIS:",
            alertUpdateError
          );
        }

        if (duplicateAlertIds.length > 0) {
          const { error: duplicateUpdateError } = await supabase
            .from("aegris_alerts")
            .update({ is_read: true })
            .in("id", duplicateAlertIds);

          if (duplicateUpdateError) {
            console.error(
              "CHYBA ČIŠTĚNÍ DUPLICITNÍCH ALERTŮ AEGRIS:",
              duplicateUpdateError
            );
          }
        }
      } else {
        const { error: alertInsertError } = await supabase
          .from("aegris_alerts")
          .insert({
            project_id: project.id,
            analysis_id: data.id,
            recommendation_id: recommendationData?.id ?? null,
            level: alertLevel,
            priority: recommendation.priority,
            title: alertTitle,
            message: alertMessage,
            is_read: false,
          });

        if (alertInsertError) {
          console.error(
            "CHYBA ULOŽENÍ ALERTU AEGRIS:",
            alertInsertError
          );
        }
      }

      await loadProject();
    } catch (error) {
      console.error(
        "CHYBA ANALÝZY:",
        error
      );
    } finally {
      analysisRunRef.current = false;
      setRunningAnalysis(false);
    }
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

  const contextEvaluation = evaluateProjectContext(
    analysis?.ndvi != null
      ? Number(analysis.ndvi)
      : null,
    selectedCropProfile,
    selectedCropStageProfile,
    growthStage,
    weather,
    ndviHistory,
    analysis?.created_at ?? null,
    soilProfile
  );

  console.log("AEGRIS INPUT STATE", {
  analysis,
  analysisNdvi: analysis?.ndvi,
  weather,
  ndviHistoryCount: ndviHistory.length,
  selectedCropProfile,
  selectedCropStageProfile,
  growthStage,
  soilProfile,
});

  console.log("AEGRIS CONTEXT RESULT", {
  score: contextEvaluation.score,
  scoreLevel: contextEvaluation.scoreLevel,
  level: contextEvaluation.level,
  priority: contextEvaluation.priority,
  criticalFactorCount: contextEvaluation.criticalFactorCount,
  warningFactorCount: contextEvaluation.warningFactorCount,
  evaluatedFactorCount: contextEvaluation.evaluatedFactorCount,
  diagnoses: contextEvaluation.diagnoses,
  dataCompletenessPct: contextEvaluation.dataCompletenessPct,
  scoreBreakdown: contextEvaluation.scoreBreakdown,
  factors: contextEvaluation.factors,
});

  const priorityClass =
    contextEvaluation.priority === "Kritická"
      ? "text-red-400"
      : contextEvaluation.priority === "Vysoká"
        ? "text-orange-400"
        : contextEvaluation.priority === "Střední"
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
      : contextEvaluation.level;

  const unreadAlerts = alerts.filter((alert) => !alert.is_read).length;
  const currentNdvi = analysis?.ndvi != null ? Number(analysis.ndvi) : null;
  const currentVegetation = analysis?.vegetation ?? null;
  const recentRecommendations = recommendationHistory.slice(0, 3);
  const recentAnalyses = history.slice(0, 5);
  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030817] text-white">
        Načítám projekt...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030817] px-4 py-4 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* HEADER */}
        <header className="mb-5 flex flex-col gap-3 border-b border-slate-800/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Projekty</span>
            <span>›</span>
            <span className="font-semibold text-slate-200">{project.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Aktualizováno: {new Date(analysis?.created_at ?? project.created_at).toLocaleString("cs-CZ")}</span>
            <button
              type="button"
              onClick={loadProject}
              className="text-lg text-cyan-400 transition hover:rotate-180"
              title="Obnovit data"
            >
              ↻
            </button>
          </div>
        </header>

        {/* TOP: PROJECT + CURRENT ANALYSIS */}
        <section className="grid gap-3 xl:grid-cols-12">
          <div className="rounded-xl border border-slate-800 bg-[#071225]/90 p-4 xl:col-span-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-100">ⓘ Informace o projektu</h2>
              <span className="rounded-md border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-[11px] font-bold text-emerald-400">{project.status}</span>
            </div>
            <div className="mt-4 rounded-lg border border-slate-800 bg-[#061022] p-3">
              <div className="text-[10px] uppercase tracking-widest text-slate-600">Status</div>
              <div className="mt-1 text-sm font-bold text-emerald-400">{project.status}</div>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-800 bg-[#061022] p-3">
                <div className="text-[10px] uppercase tracking-widest text-slate-600">Šířka</div>
                <div className="mt-1 text-xs font-semibold text-slate-200">{project.latitude.toFixed(6)}</div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-[#061022] p-3">
                <div className="text-[10px] uppercase tracking-widest text-slate-600">Délka</div>
                <div className="mt-1 text-xs font-semibold text-slate-200">{project.longitude.toFixed(6)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#071225]/90 p-4 xl:col-span-8">
            <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-100">◒ Aktuální stav vegetace</h2>
                <div className="mt-4 grid-cols-1 sm:grid-cols-3 overflow-hidden rounded-lg border border-slate-800">
                  <div className="border-r border-slate-800 bg-[#061022] p-3">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">NDVI</div>
                    <div className="mt-1 text-2xl font-black text-cyan-400">{currentNdvi != null ? currentNdvi.toFixed(3) : "—"}</div>
                  </div>
                  <div className="border-r border-slate-800 bg-[#061022] p-3">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">Vegetace</div>
                    <div className="mt-1 text-2xl font-black text-emerald-400">{currentVegetation != null ? `${currentVegetation}%` : "—"}</div>
                  </div>
                  <div className="bg-[#061022] p-3">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">AEGRIS RIZIKO</div>
                    <div className="mt-1 text-2xl font-black text-orange-400">
  {contextEvaluation.level === "Bez vyhodnocení"
    ? "—"
    : contextEvaluation.scoreLevel}
</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500">Poslední analýza: {analysis ? new Date(analysis.created_at).toLocaleString("cs-CZ") : "—"}</div>
                <button
                  type="button"
                  onClick={runAnalysis}
                  disabled={runningAnalysis}
                  className="mt-4 w-full rounded-lg bg-cyan-500 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {runningAnalysis ? "🤖 Analyzuji..." : "🤖 Spustit AI analýzu"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 overflow-hidden rounded-lg border border-slate-800 bg-[#061022]">
                <div className="flex flex-col items-center justify-center border-r border-slate-800 p-4 text-center">
                  <div className="text-[9px] uppercase tracking-widest text-slate-500">Kontextové vyhodnocení</div>
                  <div className="relative mt-3 flex h-28 w-28 items-center justify-center rounded-full border-[9px] border-slate-800">
                    <div className="absolute inset-[-9px] rounded-full border-[9px] border-transparent border-t-cyan-400 border-r-cyan-400" />
                    <div>
                      <div className="text-2xl font-black text-amber-400">{contextEvaluation.score}%</div>
                      <div className="text-[10px] text-slate-400">{contextEvaluation.scoreLevel}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 text-center">
                  <div className="text-[9px] uppercase tracking-widest text-slate-500">Kritické faktory</div>
                  <div className="mt-4 text-2xl font-black text-red-400">{contextEvaluation.criticalFactorCount}</div>
                  <div className="mt-1 text-[10px] text-slate-500">z {contextEvaluation.evaluatedFactorCount} vyhodnocených</div><div className="mt-2 text-[8px] font-bold text-cyan-400">Data {contextEvaluation.dataCompletenessPct}%</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DECISION / ALERTS / RECOMMENDATIONS */}
        <section className="mt-3 grid gap-3 xl:grid-cols-12">
          <div className="rounded-xl border border-slate-800 bg-[#071225]/90 p-4 xl:col-span-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">AEGRIS DECISION</div>
                <div className="mt-1 text-sm font-black">ROZHODOVACÍ DOPORUČENÍ</div>
              </div>
              <span className={`rounded-lg border px-3 py-2 text-xs font-black ${contextEvaluation.priority === "Kritická" ? "border-red-500/40 bg-red-500/5 text-red-400" : "border-orange-500/40 bg-orange-500/5 text-orange-400"}`}>
                <span className="block text-[8px] uppercase tracking-widest text-slate-500">Priorita</span>
                {contextEvaluation.priority}
              </span>
            </div>
            <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">CO SE DĚJE</div>
            <h3 className="mt-2 text-xl font-black">{decisionTitle}</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">{contextEvaluation.summary}</p>
            <div className="mt-3 grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="rounded-lg border border-slate-800 bg-[#061022] p-3"><div className="text-[9px] text-slate-600">NDVI</div><div className="mt-1 text-lg font-black text-cyan-400">{currentNdvi?.toFixed(3) ?? "—"}</div></div>
              <div className="rounded-lg border border-slate-800 bg-[#061022] p-3"><div className="text-[9px] text-slate-600">TREND</div><div className={`mt-1 text-sm font-black ${recommendationTrend.className}`}>{recommendationTrend.label === "Vývoj se zhoršuje" ? "Dlouhodobě klesající" : recommendationTrend.label === "Porost se zlepšuje" ? "Dlouhodobě rostoucí" : recommendationTrend.label === "Vývoj je stabilní" ? "Dlouhodobě stabilní" : recommendationTrend.label}</div></div>
              <div className="rounded-lg border border-slate-800 bg-[#061022] p-3"><div className="text-[9px] text-slate-600">POSLEDNÍ ZMĚNA</div><div className={`mt-1 text-lg font-black ${latestNdviChangeClass}`}>{latestNdviChangeLabel}</div><div className="mt-1 text-[8px] text-slate-600">oproti předchozímu měření</div></div>
            </div>
            <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">CO UDĚLAT NYNÍ</div>
            <div className="mt-2 space-y-1.5">
              {contextEvaluation.actions.slice(0, 4).map((action, index) => (
                <div key={`decision-${index}`} className="flex gap-2 rounded-lg bg-[#061022] p-2 text-[11px] leading-4 text-slate-400"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 font-black text-cyan-400">{index + 1}</span>{action}</div>
              ))}
            </div>
                        {contextEvaluation.diagnoses.length > 0 && (
              <div className="mt-4 rounded-lg border border-orange-500/20 bg-orange-500/[0.03] p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">
                  PRAVDĚPODOBNÁ PŘÍČINA
                </div>

                <div className="mt-2 space-y-2">
                  {contextEvaluation.diagnoses.map((diagnosis) => (
                    <div
                      key={diagnosis.code}
                      className="rounded-lg bg-[#061022] p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs font-black text-slate-200">
                          {diagnosis.label}
                        </div>

                        <span className="shrink-0 rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-[9px] font-black text-orange-400">
                          {Math.round(diagnosis.confidence * 100)} %
                        </span>
                      </div>

                      {diagnosis.evidence.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {diagnosis.evidence.map((evidence, evidenceIndex) => (
                            <div
                              key={`${diagnosis.code}-evidence-${evidenceIndex}`}
                              className="flex gap-2 text-[9px] leading-4 text-slate-500"
                            >
                              <span className="text-orange-400">•</span>
                              <span>{evidence}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-3 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.03] p-3 text-xs font-bold text-slate-200">
  DALŠÍ KROK
  <br />
  <span className="text-sm">
    {contextEvaluation.recommendation}
  </span>
</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#071225]/90 p-4 xl:col-span-4">
            <div className="flex items-center justify-between">
              <div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">🚨 AEGRIS ALERTY</div><h2 className="mt-1 text-sm font-black">UPOZORNĚNÍ PROJEKTU</h2></div>
              <span className="rounded-lg border border-slate-700 px-2 py-1 text-[10px] text-slate-300">Nepřečtené {unreadAlerts}</span>
            </div>
            <div className="mt-3 max-h-[410px] space-y-2 overflow-auto pr-1">
              {alerts.length === 0 ? <div className="rounded-lg bg-[#061022] p-4 text-xs text-slate-500">Zatím nebyl vytvořen žádný alert.</div> : alerts.slice(0, 5).map((alert, index) => (
                <div key={alert.id} className={`rounded-lg border p-3 ${alert.level === "critical" ? "border-red-500/30 bg-red-500/[0.03]" : "border-slate-800 bg-[#061022]"}`}>
                  <div className="flex items-start justify-between gap-2"><div className="flex gap-2"><span className="mt-1 h-3 w-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.5)]" /><div><div className="flex items-center gap-2 text-xs font-black">{alert.title}{!alert.is_read && <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[8px] text-cyan-400">NOVÉ</span>}</div><div className="mt-1 text-[9px] text-slate-600">{new Date(alert.created_at).toLocaleString("cs-CZ")}</div></div></div><span className="rounded-full bg-red-500/10 px-2 py-1 text-[9px] font-black text-red-400">{alert.priority}</span></div>
                  <p className="mt-2 line-clamp-3 text-[10px] leading-4 text-slate-400">{alert.message}</p>
                  {!alert.is_read && index === 0 && <button type="button" onClick={() => markAlertAsRead(alert.id)} className="mt-2 rounded border border-slate-700 px-2 py-1 text-[9px] text-slate-300 hover:border-cyan-400 hover:text-cyan-400">✓ Označit jako přečtené</button>}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => document.getElementById("project-history")?.scrollIntoView({ behavior: "smooth" })} className="mt-3 w-full rounded-lg border border-slate-800 bg-[#061022] py-2 text-xs font-bold text-cyan-400">Zobrazit všechna upozornění ({alerts.length})</button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#071225]/90 p-4 xl:col-span-4">
            <div className="flex items-center justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">♧ DOPORUČENÍ AEGRIS</div><h2 className="mt-1 text-sm font-black">CO NYNÍ UDĚLAT</h2></div><span className={`rounded-lg border px-3 py-2 text-xs font-black ${priorityClass} border-current/20`}>PRIORITA<br />{contextEvaluation.priority}</span></div>
            <div className="mt-3 space-y-2">
              {contextEvaluation.actions.slice(0, 5).map((action, index) => <div key={`recommend-${index}`} className="flex gap-2 rounded-lg bg-[#061022] p-2.5 text-[11px] leading-4 text-slate-400"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 font-black text-cyan-400">{index + 1}</span><span>{action}</span></div>)}
            </div>
          </div>
        </section>

        {/* AEGRIS DIAGNOSTICS */}
{contextEvaluation.diagnoses.length > 0 && (
  <section className="mt-3 rounded-xl border border-red-500/20 bg-[#071225]/90 p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
          AEGRIS DIAGNOSTIKA
        </div>

        <h2 className="mt-1 text-sm font-black text-white">
          Pravděpodobné příčiny aktuálního rizika
        </h2>
      </div>

      <span className="rounded-lg border border-red-500/20 bg-red-500/5 px-2 py-1 text-[9px] font-bold text-red-400">
        {contextEvaluation.diagnoses.length}{" "}
        {contextEvaluation.diagnoses.length === 1
          ? "diagnóza"
          : "diagnózy"}
      </span>
    </div>

    <div className="mt-3 grid gap-3 lg:grid-cols-2">
      {contextEvaluation.diagnoses.map((diagnosis) => (
        <div
          key={diagnosis.code}
          className="rounded-lg border border-slate-800 bg-[#061022] p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-black text-white">
                {diagnosis.label}
              </div>

              <div className="mt-1 text-[9px] uppercase tracking-widest text-slate-500">
                Confidence
              </div>
            </div>

            <div className="text-lg font-black text-red-400">
              {Math.round(diagnosis.confidence * 100)} %
            </div>
          </div>

          {diagnosis.evidence.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {diagnosis.evidence.map((evidence, index) => (
                <div
                  key={`${diagnosis.code}-evidence-${index}`}
                  className="flex gap-2 rounded-md bg-[#07172b] p-2 text-[10px] leading-4 text-slate-400"
                >
                  <span className="mt-0.5 text-cyan-400">•</span>
                  <span>{evidence}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 border-t border-slate-800 pt-3">
            <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-400">
              Podpůrné faktory
            </div>

            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {contextEvaluation.scoreBreakdown.map((item) => (
                <div
                  key={`${diagnosis.code}-${item.label}`}
                  className="rounded-md border border-slate-800 bg-[#071225] p-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-semibold text-slate-400">
                      {item.label}
                    </span>

                    <span className="text-[9px] font-black text-cyan-400">
                      {item.score}/100
                    </span>
                  </div>

                  <div className="mt-1 text-[8px] text-slate-600">
                    Váha {item.weight} %
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
)}

        {/* FACTOR CARDS */}
        <section className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          {contextEvaluation.factors.slice(0, 8).map((factor, index) => {
            const scoreItem = contextEvaluation.scoreBreakdown.find(
              (item) => item.label === factor.label
            );

          console.log("AEGRIS UI FACTOR DEBUG", {
           factor: factor.label,
           factorDetail: factor.detail,
          scoreItem,
         });
            
            return (
              <div key={`${factor.label}-${index}`} className="min-h-[145px] rounded-lg border border-slate-800 bg-[#071225]/90 p-3">
                <div className="text-[9px] font-semibold leading-4 text-slate-400">{factor.label}</div>
                <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[8px] font-black uppercase ${factor.status === "OK" ? "bg-emerald-500/10 text-emerald-400" : factor.status === "Upozornění" ? "bg-amber-500/10 text-amber-400" : factor.status === "Kritické" ? "bg-red-500/10 text-red-400" : "bg-slate-500/10 text-slate-400"}`}>{factor.status === "OK" ? "V NORMĚ" : factor.status}</span>
                {scoreItem && <div className="mt-2 text-[8px] font-bold text-cyan-400">Skóre {scoreItem.score}/100 · váha {scoreItem.weight}%</div>}
                <p className="mt-2 text-[9px] leading-4 text-slate-500">{factor.detail}</p>
              </div>
            );
          })}
        </section>

        {/* CHART + RECOMMENDATION HISTORY + ANALYSIS HISTORY */}
        <section className="mt-3 grid gap-3 xl:grid-cols-12">
          <div className="rounded-xl border border-slate-800 bg-[#071225]/90 p-4 xl:col-span-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">VÝVOJ NDVI</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold">Trend:</span>
              <span className={recommendationTrend.className}>{recommendationTrend.label === "Porost se zlepšuje" ? "Rostoucí" : recommendationTrend.label === "Vývoj se zhoršuje" ? "Klesající" : recommendationTrend.label === "Vývoj je stabilní" ? "Stabilní" : recommendationTrend.label}</span>
              <span className="text-slate-600">›</span>
              <span className="text-slate-500">Trendové okno:</span>
              <span className="font-bold text-slate-300">{trendWindowLabel}</span>
              {contextEvaluation.trend.overallDelta != null && <span className={`font-bold ${recommendationTrend.className}`}>{contextEvaluation.trend.overallDelta >= 0 ? "+" : ""}{contextEvaluation.trend.overallDelta.toFixed(3)} ({contextEvaluation.trend.overallRelativeChangePct != null ? `${contextEvaluation.trend.overallRelativeChangePct >= 0 ? "+" : ""}${contextEvaluation.trend.overallRelativeChangePct.toFixed(0)} %` : "—"})</span>}
            </div>
            <div className="mt-2 h-[280px]"><AnalysisChart history={chartHistory} /></div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#071225]/90 p-4 xl:col-span-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">VÝVOJ STAVU A DOPORUČENÍ</div>
            <p className="mt-1 text-[10px] text-slate-600">Každá provedená analýza může vytvořit samostatný záznam doporučení.</p>
            <div className="mt-3 space-y-2">
              {recentRecommendations.map((item) => <div key={item.id} className="rounded-lg border border-slate-800 bg-[#061022] p-3"><div className="text-[9px] text-slate-600">{new Date(item.created_at).toLocaleString("cs-CZ")}</div><div className="mt-1 flex items-center justify-between gap-2"><span className="font-bold text-cyan-400">{item.crop_name ?? "Plodina"}</span><span className="text-[9px] text-slate-500">{item.growth_stage}</span><span className="text-[9px] font-bold text-slate-300">NDVI {item.ndvi != null ? Number(item.ndvi).toFixed(3) : "—"}</span><span className="rounded bg-red-500/10 px-2 py-1 text-[8px] font-black text-red-400">{item.priority}</span></div></div>)}
              {recentRecommendations.length === 0 && <div className="rounded-lg bg-[#061022] p-3 text-xs text-slate-500">Zatím žádný záznam.</div>}
            </div>
            <button type="button" onClick={() => document.getElementById("project-history")?.scrollIntoView({ behavior: "smooth" })} className="mt-3 w-full rounded-lg border border-slate-800 py-2 text-[10px] font-bold text-cyan-400">Zobrazit kompletní historii</button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#071225]/90 p-4 xl:col-span-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">HISTORIE ANALÝZ</div>
            <div className="mt-3 space-y-2">
              {recentAnalyses.map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg bg-[#061022] px-3 py-2 text-[10px]"><span className="text-slate-500">{new Date(item.created_at).toLocaleString("cs-CZ")}</span><span className="font-bold text-cyan-400">NDVI {Number(item.ndvi).toFixed(3)}</span><span className="font-bold text-slate-300">{item.risk}</span></div>)}
              {recentAnalyses.length === 0 && <div className="text-xs text-slate-500">Zatím žádná analýza.</div>}
            </div>
            <button type="button" onClick={() => document.getElementById("project-history")?.scrollIntoView({ behavior: "smooth" })} className="mt-3 w-full rounded-lg border border-slate-800 py-2 text-[10px] font-bold text-cyan-400">Zobrazit celou historii</button>
          </div>
        </section>

        {/* WEATHER */}
        <section className="mt-3 rounded-xl border border-slate-800 bg-[#071225]/90 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">POČASÍ A PODMÍNKY</div><h2 className="mt-1 text-sm font-black">AKTUÁLNÍ PODMÍNKY V LOKALITĚ</h2><p className="mt-1 text-[9px] text-slate-600">AEGRIS používá počasí jako další kontext k vyhodnocení projektu.</p></div><button type="button" onClick={() => loadWeather(project.latitude, project.longitude)} disabled={loadingWeather} className="rounded-lg border border-slate-700 px-3 py-2 text-[10px] font-bold hover:border-cyan-400 hover:text-cyan-400 disabled:opacity-50">↻ Obnovit počasí</button></div>
          {weather ? <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-lg bg-slate-800 p-3"><div className="text-[9px] text-slate-500">🌡️ Teplota</div><div className="mt-1 text-xl font-black text-orange-400">{weather.temperature_c != null ? `${weather.temperature_c.toFixed(1)} °C` : "—"}</div><div className={`text-[8px] ${temperatureStatusClass}`}>{temperatureStatus}</div></div><div className="rounded-lg bg-slate-800 p-3"><div className="text-[9px] text-slate-500">💧 Vlhkost vzduchu</div><div className="mt-1 text-xl font-black text-cyan-400">{weather.humidity_pct != null ? `${weather.humidity_pct.toFixed(0)} %` : "—"}</div><div className="text-[8px] text-cyan-400">Aktuální</div></div><div className="rounded-lg bg-slate-800 p-3"><div className="text-[9px] text-slate-500">🌧️ Srážky</div><div className="mt-1 text-xl font-black">{weather.precipitation_mm != null ? `${weather.precipitation_mm.toFixed(1)} mm` : "—"}</div><div className="text-[8px] text-slate-500">Bez srážek</div></div><div className="rounded-lg bg-slate-800 p-3"><div className="text-[9px] text-slate-500">💨 Vítr</div><div className="mt-1 text-xl font-black">{weather.wind_speed_kmh != null ? `${weather.wind_speed_kmh.toFixed(1)} km/h` : "—"}</div><div className="text-[8px] text-emerald-400">Slabý vítr</div></div></div> : <div className="mt-3 text-xs text-slate-500">{loadingWeather ? "Načítám počasí..." : "Počasí se nepodařilo načíst."}</div>}
          {weather && selectedCropProfile && <div className="mt-3 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.03] p-3 text-[9px] leading-4 text-slate-500"><span className="font-bold text-cyan-400">AEGRIS / KONTEXT PLODINY</span><br />Aktuální teplota, srážky a dostupná půdní vlhkost jsou používány jako kontext k profilu plodiny <span className="font-semibold text-slate-200">{selectedCropProfile.name}</span>. Pro fázi <span className="font-semibold text-slate-200">{selectedCropStageProfile?.growth_stage ?? growthStage}</span> AEGRIS používá také Kc {selectedCropStageProfile?.kc != null ? Number(selectedCropStageProfile.kc).toFixed(2) : "—"}.</div>}
        </section>

        {/* CROP / PROFILE / MAP */}
        <section className="mt-3 grid gap-3 xl:grid-cols-12">
          <div className="rounded-xl border border-slate-800 bg-[#071225]/90 p-4 xl:col-span-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">PLodina a podmínky</div>
            <h2 className="mt-1 text-sm font-black">CO JE V PROJEKTU VYSAZENO?</h2>
            <div className="mt-3 space-y-2">
              <label className="block text-[9px] text-slate-500">Pěstovaná plodina<select value={cropName} onChange={(event) => { const nextCrop = event.target.value; setCropName(nextCrop); const nextCropProfile = cropProfiles.find((profile) => profile.name === nextCrop) ?? null; const databaseStages = nextCropProfile ? cropStageProfiles.filter((stageProfile) => stageProfile.crop_profile_id === nextCropProfile.id).map((stageProfile) => stageProfile.growth_stage) : []; const availableStages = databaseStages; if (!availableStages.includes(growthStage)) setGrowthStage(availableStages[0] ?? ""); }} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#061022] px-3 py-2 text-xs text-white"><option value="">Vyberte plodinu</option>{cropProfiles.map((profile) => <option key={profile.id} value={profile.name}>{profile.name}</option>)}</select></label>
              <label className="block text-[9px] text-slate-500">
  Odrůda
  <input
    value={cropVariety}
    onChange={(event) => {
      setCropVariety(event.target.value);
      setCropVarietyError("");
    }}
    className={`mt-1 w-full rounded-lg border bg-[#061022] px-3 py-2 text-xs text-white ${
      cropVarietyError
        ? "border-red-500"
        : "border-slate-700"
    }`}
  />

  {cropVarietyError && (
    <p className="mt-1 text-xs font-semibold text-red-400">
      {cropVarietyError}
    </p>
  )}
</label>
             
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
  <label className="block text-[9px] text-slate-500">
    Plocha (ha)
    <input
      type="number"
      value={areaHa}
      onChange={(event) => {
        setAreaHa(event.target.value);
        setAreaError("");
      }}
      className={`mt-1 w-full rounded-lg border bg-[#061022] px-3 py-2 text-xs text-white ${
        areaError ? "border-red-500" : "border-slate-700"
      }`}
    />
    {areaError && (
      <p className="mt-1 text-xs font-semibold text-red-400">
        {areaError}
      </p>
    )}
  </label>

  <label className="block text-[9px] text-slate-500">
    Způsob pěstování
    <select
      value={farmingMethod}
      onChange={(event) => setFarmingMethod(event.target.value)}
      className="mt-1 w-full rounded-lg border border-slate-700 bg-[#061022] px-3 py-2 text-xs text-white"
    >
      <option value="">Vyberte</option>
      <option value="Konvenční">Konvenční</option>
      <option value="Integrované">Integrované</option>
      <option value="Ekologické">Ekologické</option>
      <option value="Jiné">Jiné</option>
    </select>
  </label>
</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2"><label className="block text-[9px] text-slate-500">Datum setí / výsadby<input type="date" value={sowingDate} onChange={(event) => setSowingDate(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#061022] px-3 py-2 text-xs text-white" /></label><label className="block text-[9px] text-slate-500">Předpokládaná sklizeň<input type="date" value={expectedHarvestDate} onChange={(event) => setExpectedHarvestDate(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#061022] px-3 py-2 text-xs text-white" /></label></div>
              <label className="block text-[9px] text-slate-500">Aktuální růstová fáze<select value={growthStage} onChange={(event) => setGrowthStage(event.target.value)} disabled={!cropName} className="mt-1 w-full rounded-lg border border-slate-700 bg-[#061022] px-3 py-2 text-xs text-white disabled:opacity-50"><option value="">Vyberte růstovou fázi</option>{growthStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}</select></label>
              <button type="button" onClick={saveCropData} disabled={savingCrop} className="w-full rounded-lg bg-cyan-500 py-2.5 text-xs font-black text-slate-950 hover:bg-cyan-400 disabled:opacity-50">{savingCrop ? "Ukládám..." : "💾 Uložit údaje o plodině"}</button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#071225]/90 p-4 xl:col-span-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">PROFIL PLODINY</div>
            <h2 className="mt-1 text-xl font-black">{selectedCropProfile?.name ?? "Kukuřice"}</h2>
            <div className="text-[10px] text-slate-600">{selectedCropProfile?.category ?? "Obilnina"}</div>
            {selectedCropStageProfile && <div className="mt-3 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.03] p-3"><div className="text-[9px] uppercase tracking-widest text-cyan-400">Profil aktuální růstové fáze</div><div className="mt-2 grid grid-cols-3 gap-2 text-[10px]"><div><span className="text-slate-600">Růstová fáze</span><div className="mt-1 font-bold">{selectedCropStageProfile.growth_stage}</div></div><div><span className="text-slate-600">Kc</span><div className="mt-1 font-bold">{selectedCropStageProfile.kc != null ? Number(selectedCropStageProfile.kc).toFixed(2) : "—"}</div></div><div><span className="text-slate-600">Vodní stres</span><div className="mt-1 font-bold">{selectedCropStageProfile.water_stress_sensitivity ?? "Neuvedeno"}</div></div></div></div>}
            <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-lg bg-slate-800 p-3"><div className="text-[9px] text-slate-500">🌡️ Teplota</div><div className="mt-1 text-xs font-bold">{selectedCropProfile?.min_temperature_c != null && selectedCropProfile?.max_temperature_c != null ? `${selectedCropProfile.min_temperature_c}–${selectedCropProfile.max_temperature_c} °C` : "Neuvedeno"}</div></div><div className="rounded-lg bg-slate-800 p-3"><div className="text-[9px] text-slate-500">💧 Vlhkost</div><div className="mt-1 text-xs font-bold">{selectedCropProfile?.soil_moisture_min_pct != null && selectedCropProfile?.soil_moisture_max_pct != null ? `${selectedCropProfile.soil_moisture_min_pct}–${selectedCropProfile.soil_moisture_max_pct} %` : "Neuvedeno"}</div></div><div className="rounded-lg bg-slate-800 p-3"><div className="text-[9px] text-slate-500">pH půdy</div><div className="mt-1 text-xs font-bold">{selectedCropProfile?.ph_min != null && selectedCropProfile?.ph_max != null ? `${selectedCropProfile.ph_min}–${selectedCropProfile.ph_max}` : "Neuvedeno"}</div></div><div className="rounded-lg bg-slate-800 p-3"><div className="text-[9px] text-slate-500">💦 Potřeba vody</div><div className="mt-1 text-xs font-bold">{selectedCropProfile?.water_need ?? "Neuvedeno"}</div></div></div>
            <div className="mt-2 rounded-lg bg-slate-800 p-3"><div className="text-[9px] text-slate-500">☀️ Světlo</div><div className="mt-1 text-xs font-bold">{selectedCropProfile?.light_need ?? "Neuvedeno"}</div></div>
            {selectedCropProfile?.notes && <div className="mt-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.03] p-3 text-[9px] leading-4 text-slate-500"><span className="font-bold text-cyan-400">POZNÁMKA PROFILU</span><br />{selectedCropProfile.notes}</div>}
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#071225]/90 p-4 xl:col-span-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">MAPA</div>
            <h2 className="mt-1 text-sm font-black">LOKALITA PROJEKTU</h2>
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-800"><ProjectMap latitude={project.latitude} longitude={project.longitude} /></div>
            <div className="mt-2 grid grid-cols-2 gap-2"><div className="rounded-lg bg-slate-800 p-3"><div className="text-[9px] text-slate-500">Šířka</div><div className="mt-1 text-xs font-bold">{project.latitude.toFixed(6)}</div></div><div className="rounded-lg bg-slate-800 p-3"><div className="text-[9px] text-slate-500">Délka</div><div className="mt-1 text-xs font-bold">{project.longitude.toFixed(6)}</div></div></div>
          </div>
        </section>

        {/* FULL HISTORY */}
        <section id="project-history" className="mt-3 rounded-xl border border-slate-800 bg-[#071225]/90 p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">REPORTY A HISTORIE</div><h2 className="mt-1 text-xl font-black">Vývoj projektu</h2><p className="mt-1 text-xs text-slate-500">Historická NDVI data a záznamy provedených analýz.</p></div><div className="rounded-lg bg-[#061022] px-4 py-3"><div className="text-[9px] uppercase tracking-widest text-slate-600">Trend</div><div className={`mt-1 text-sm font-black ${recommendationTrend.className}`}>{recommendationTrend.icon} {recommendationTrend.label}</div></div></div>
          <div className="mt-4 rounded-lg border border-slate-800 bg-[#061022] p-3"><AnalysisChart history={chartHistory} /></div>
          <div className="mt-3 max-h-[300px] overflow-y-auto pr-2 grid gap-2 lg:grid-cols-2">{recommendationHistory.map((item) => <div key={item.id} className="rounded-lg border border-slate-800 bg-[#061022] p-3"><div className="flex items-center justify-between gap-2"><div><div className="text-[9px] text-slate-600">{new Date(item.created_at).toLocaleString("cs-CZ")}</div><div className="mt-1 text-xs font-bold text-cyan-400">{item.crop_name ?? "Plodina neuvedena"} <span className="ml-2 rounded-full bg-slate-800 px-2 py-1 text-[9px] text-slate-400">{item.growth_stage ?? "—"}</span></div></div><div className="text-right"><div className="text-xs font-bold">NDVI {item.ndvi != null ? Number(item.ndvi).toFixed(3) : "—"}</div><span className="mt-1 inline-flex rounded-full bg-red-500/10 px-2 py-1 text-[8px] font-black text-red-400">{item.priority}</span></div></div><p className="mt-2 text-[10px] leading-4 text-slate-500">{item.summary}</p></div>)}</div>
          <div className="mt-4"><h3 className="mb-2 text-sm font-bold">Historie analýz</h3><div className="max-h-[300px] overflow-y-auto pr-2 grid gap-2 md:grid-cols-2">{history.map((item) => <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2 text-[10px]"><div><div className="text-slate-500">{new Date(item.created_at).toLocaleString("cs-CZ")}</div><div className="mt-1 text-slate-600">Vegetace {item.vegetation}%</div></div><div className="text-right"><div className="font-bold text-cyan-400">NDVI {Number(item.ndvi).toFixed(3)}</div><div className="font-bold text-slate-200">{item.risk}</div></div></div>)}</div></div>
        </section>
      </div>
    </main>
  );
}