"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import ProjectMap from "./ProjectMap";
import AnalysisChart from "./AnalysisChart";
import FieldValidationForm from "./FieldValidationForm";

type Project = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  crop_catalog_id?: number | null;
  variety_catalog_id?: number | null;
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

type CropCatalogItem = {
  id: number;
  name: string;
  scientific_name: string | null;
  external_code: string | null;
  crop_profile_id: number | null;
};

type VarietyCatalogItem = {
  id: number;
  crop_id: number;
  name: string;
  external_code: string | null;
  registration_status: string | null;
  registration_status_code: string | null;
  active: boolean;
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

  // Autoritativní výsledek Decision Enginu uložený serverem
  // společně s konkrétní analýzou.
  decision_snapshot?: ContextEvaluation | null;
  data_completeness_pct?: number | null;
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


type ProjectFertilizationInputs = {
  project_id: number;
  planned_yield_t_ha: number | null;
  soil_p_mg_kg: number | null;
  soil_k_mg_kg: number | null;
  soil_mg_mg_kg: number | null;
  soil_ph: number | null;
  soil_texture_class: "light" | "medium" | "heavy" | null;
  phosphorus_method: "SP" | "ICP-OES" | null;
  predecessor_crop_name: string | null;
  predecessor_group: string | null;
  organic_fertilizer_type: string | null;
  organic_livestock_type: string | null;
  organic_rate_t_ha: number | null;
  organic_application_window: string | null;
  organic_year_after_application: number | null;
  nmin_kg_ha: number | null;
  data_source: string | null;
  notes: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type CropNutrientRequirement = {
  id: number;
  crop_profile_id: number;
  nutrient: "N" | "P" | "K" | "Mg" | string;
  nutrient_form: string;
  yield_level: "low" | "medium" | "high" | null;
  soil_supply_class:
    | "low"
    | "satisfactory"
    | "good"
    | "high"
    | "very_high"
    | null;
  demand_group: number | null;
  dose_kg_ha: number | null;
  min_dose_kg_ha: number | null;
  max_dose_kg_ha: number | null;
  recommendation_type: string;
  source_table: string | null;
  source_note: string | null;
};

type CropYieldLevel = {
  id: number;
  crop_profile_id: number;
  yield_level: "low" | "medium" | "high";
  min_yield_t_ha: number | null;
  max_yield_t_ha: number | null;
  source_table: string | null;
  notes: string | null;
};

type CropNitrogenSplit = {
  id: number;
  crop_profile_id: number;
  application_stage: string;
  application_order: number;
  share_percent: number;
  source_table: string | null;
  notes: string | null;
};

type NitrogenPredecessorAdjustment = {
  predecessor_group: string;
  yield_level: "low" | "medium" | "high";
  adjustment_kg_n_ha: number;
};

type OrganicNitrogenCredit = {
  fertilizer_type: string;
  livestock_type: string | null;
  application_window: string;
  year_after_application: number;
  effective_n_kg_per_t: number;
};

type SoilNutrientClassificationRule = {
  id: number;
  land_use: string;
  nutrient: "P" | "K" | "Mg" | string;
  analytical_method: "SP" | "ICP-OES" | null;
  soil_texture_class: "light" | "medium" | "heavy" | null;
  supply_class:
    | "low"
    | "satisfactory"
    | "good"
    | "high"
    | "very_high";
  min_mg_kg: number | null;
  max_mg_kg: number | null;
};

type PotassiumMagnesiumCorrection = {
  ratio_min: number | null;
  ratio_max: number | null;
  correction_factor: number;
  description: string;
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
  const [cropCatalog, setCropCatalog] = useState<CropCatalogItem[]>([]);
  const [varietyCatalog, setVarietyCatalog] = useState<VarietyCatalogItem[]>([]);
  const [loadingVarieties, setLoadingVarieties] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [organizationRole, setOrganizationRole] =
    useState<string | null>(null);
  const [projectLoadError, setProjectLoadError] = useState("");

  const [cropName, setCropName] = useState("");
  const [cropCatalogId, setCropCatalogId] = useState<number | null>(null);
  const [varietyCatalogId, setVarietyCatalogId] = useState<number | null>(null);
  const [cropVariety, setCropVariety] = useState("");
  const [cropVarietyError, setCropVarietyError] = useState("");
  const [sowingDate, setSowingDate] = useState("");
  const [expectedHarvestDate, setExpectedHarvestDate] =
    useState("");
  const [areaHa, setAreaHa] = useState("");
  const [areaError, setAreaError] = useState("");
  const [farmingMethod, setFarmingMethod] = useState("");
  const [growthStage, setGrowthStage] = useState("");

  const [fertilizationInputs, setFertilizationInputs] =
    useState<ProjectFertilizationInputs | null>(null);
  const [nutrientRequirements, setNutrientRequirements] =
    useState<CropNutrientRequirement[]>([]);
  const [fertilizationYieldLevels, setFertilizationYieldLevels] =
    useState<CropYieldLevel[]>([]);
  const [nitrogenSplits, setNitrogenSplits] =
    useState<CropNitrogenSplit[]>([]);
  const [predecessorAdjustments, setPredecessorAdjustments] =
    useState<NitrogenPredecessorAdjustment[]>([]);
  const [organicNitrogenCredits, setOrganicNitrogenCredits] =
    useState<OrganicNitrogenCredit[]>([]);
  const [soilNutrientClassificationRules, setSoilNutrientClassificationRules] =
    useState<SoilNutrientClassificationRule[]>([]);
  const [potassiumMagnesiumCorrections, setPotassiumMagnesiumCorrections] =
    useState<PotassiumMagnesiumCorrection[]>([]);
  const [fertilizationEditorOpen, setFertilizationEditorOpen] =
    useState(false);
  const [loadingFertilization, setLoadingFertilization] = useState(false);
  const [savingFertilization, setSavingFertilization] = useState(false);
  const [fertilizationError, setFertilizationError] = useState("");

  const [plannedYield, setPlannedYield] = useState("");
  const [soilP, setSoilP] = useState("");
  const [soilK, setSoilK] = useState("");
  const [soilMg, setSoilMg] = useState("");
  const [fertilizationSoilPh, setFertilizationSoilPh] = useState("");
  const [soilTextureClass, setSoilTextureClass] = useState("");
  const [phosphorusMethod, setPhosphorusMethod] = useState("");
  const [predecessorCropName, setPredecessorCropName] = useState("");
  const [predecessorGroup, setPredecessorGroup] = useState("");
  const [organicFertilizerType, setOrganicFertilizerType] = useState("");
  const [organicLivestockType, setOrganicLivestockType] = useState("");
  const [organicRate, setOrganicRate] = useState("");
  const [organicApplicationWindow, setOrganicApplicationWindow] = useState("");
  const [organicYearAfterApplication, setOrganicYearAfterApplication] =
    useState("");
  const [nmin, setNmin] = useState("");
  const [fertilizationDataSource, setFertilizationDataSource] = useState("");
  const [fertilizationNotes, setFertilizationNotes] = useState("");

  const [savingCrop, setSavingCrop] = useState(false);
  const [cropEditorOpen, setCropEditorOpen] = useState(false);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const analysisRunRef = useRef(false);
  const loadRequestRef = useRef(0);

  function setFertilizationForm(
    value: ProjectFertilizationInputs | null
  ) {
    setPlannedYield(
      value?.planned_yield_t_ha != null
        ? String(value.planned_yield_t_ha)
        : ""
    );
    setSoilP(
      value?.soil_p_mg_kg != null ? String(value.soil_p_mg_kg) : ""
    );
    setSoilK(
      value?.soil_k_mg_kg != null ? String(value.soil_k_mg_kg) : ""
    );
    setSoilMg(
      value?.soil_mg_mg_kg != null ? String(value.soil_mg_mg_kg) : ""
    );
    setFertilizationSoilPh(
      value?.soil_ph != null ? String(value.soil_ph) : ""
    );
    setSoilTextureClass(value?.soil_texture_class ?? "");
    setPhosphorusMethod(value?.phosphorus_method ?? "");
    setPredecessorCropName(value?.predecessor_crop_name ?? "");
    setPredecessorGroup(value?.predecessor_group ?? "");
    setOrganicFertilizerType(value?.organic_fertilizer_type ?? "");
    setOrganicLivestockType(value?.organic_livestock_type ?? "");
    setOrganicRate(
      value?.organic_rate_t_ha != null
        ? String(value.organic_rate_t_ha)
        : ""
    );
    setOrganicApplicationWindow(value?.organic_application_window ?? "");
    setOrganicYearAfterApplication(
      value?.organic_year_after_application != null
        ? String(value.organic_year_after_application)
        : ""
    );
    setNmin(value?.nmin_kg_ha != null ? String(value.nmin_kg_ha) : "");
    setFertilizationDataSource(value?.data_source ?? "");
    setFertilizationNotes(value?.notes ?? "");
  }

  async function loadFertilizationData(
    projectId: number,
    cropProfileId: number | null
  ) {
    setLoadingFertilization(true);
    setFertilizationError("");

    try {
      const [
        inputResult,
        predecessorResult,
        organicCreditResult,
        classificationResult,
        potassiumMagnesiumResult,
      ] = await Promise.all([
        supabase
          .from("project_fertilization_inputs")
          .select("*")
          .eq("project_id", projectId)
          .maybeSingle(),
        supabase
          .from("nitrogen_predecessor_adjustments")
          .select("predecessor_group, yield_level, adjustment_kg_n_ha"),
        supabase
          .from("organic_fertilizer_n_credits")
          .select(
            "fertilizer_type, livestock_type, application_window, year_after_application, effective_n_kg_per_t"
          ),
        supabase
          .from("soil_nutrient_classification_rules")
          .select(
            "id, land_use, nutrient, analytical_method, soil_texture_class, supply_class, min_mg_kg, max_mg_kg"
          )
          .eq("land_use", "arable"),
        supabase
          .from("potassium_magnesium_corrections")
          .select("ratio_min, ratio_max, correction_factor, description"),
      ]);

      if (inputResult.error) {
        console.error(
          "CHYBA NAČTENÍ VSTUPŮ HNOJENÍ:",
          inputResult.error
        );
        setFertilizationError(
          "Vstupy pro hnojení se nepodařilo načíst."
        );
      } else {
        const inputs =
          (inputResult.data ?? null) as ProjectFertilizationInputs | null;
        setFertilizationInputs(inputs);
        setFertilizationForm(inputs);
      }

      if (predecessorResult.error) {
        console.error(
          "CHYBA NAČTENÍ KOREKCÍ PŘEDPLODINY:",
          predecessorResult.error
        );
        setPredecessorAdjustments([]);
      } else {
        setPredecessorAdjustments(
          (predecessorResult.data ?? []) as NitrogenPredecessorAdjustment[]
        );
      }

      if (organicCreditResult.error) {
        console.error(
          "CHYBA NAČTENÍ KOREKCÍ ORGANICKÉHO N:",
          organicCreditResult.error
        );
        setOrganicNitrogenCredits([]);
      } else {
        setOrganicNitrogenCredits(
          (organicCreditResult.data ?? []) as OrganicNitrogenCredit[]
        );
      }

      if (classificationResult.error) {
        console.error(
          "CHYBA NAČTENÍ KLASIFIKACE P/K/Mg:",
          classificationResult.error
        );
        setSoilNutrientClassificationRules([]);
      } else {
        setSoilNutrientClassificationRules(
          (classificationResult.data ?? []) as SoilNutrientClassificationRule[]
        );
      }

      if (potassiumMagnesiumResult.error) {
        console.error(
          "CHYBA NAČTENÍ KOREKCÍ K:Mg:",
          potassiumMagnesiumResult.error
        );
        setPotassiumMagnesiumCorrections([]);
      } else {
        setPotassiumMagnesiumCorrections(
          (potassiumMagnesiumResult.data ?? []) as PotassiumMagnesiumCorrection[]
        );
      }

      if (cropProfileId == null) {
        setNutrientRequirements([]);
        setFertilizationYieldLevels([]);
        setNitrogenSplits([]);
        return;
      }

      const [requirementsResult, yieldLevelsResult, splitsResult] =
        await Promise.all([
          supabase
            .from("crop_nutrient_requirements")
            .select("*")
            .eq("crop_profile_id", cropProfileId),
          supabase
            .from("crop_yield_levels")
            .select("*")
            .eq("crop_profile_id", cropProfileId),
          supabase
            .from("crop_nitrogen_splits")
            .select("*")
            .eq("crop_profile_id", cropProfileId)
            .order("application_order", { ascending: true }),
        ]);

      if (requirementsResult.error) {
        console.error(
          "CHYBA NAČTENÍ VÝŽIVOVÉHO PROFILU:",
          requirementsResult.error
        );
        setNutrientRequirements([]);
      } else {
        setNutrientRequirements(
          (requirementsResult.data ?? []) as CropNutrientRequirement[]
        );
      }

      if (yieldLevelsResult.error) {
        console.error(
          "CHYBA NAČTENÍ VÝNOSOVÝCH ÚROVNÍ:",
          yieldLevelsResult.error
        );
        setFertilizationYieldLevels([]);
      } else {
        setFertilizationYieldLevels(
          (yieldLevelsResult.data ?? []) as CropYieldLevel[]
        );
      }

      if (splitsResult.error) {
        console.error(
          "CHYBA NAČTENÍ DĚLENÍ DUSÍKU:",
          splitsResult.error
        );
        setNitrogenSplits([]);
      } else {
        setNitrogenSplits(
          (splitsResult.data ?? []) as CropNitrogenSplit[]
        );
      }
    } finally {
      setLoadingFertilization(false);
    }
  }

  async function saveFertilizationInputs() {
    if (!project || organizationRole === "viewer") return;

    const parseOptionalNumber = (value: string) => {
      if (!value.trim()) return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : Number.NaN;
    };

    const payload = {
      project_id: project.id,
      planned_yield_t_ha: parseOptionalNumber(plannedYield),
      soil_p_mg_kg: parseOptionalNumber(soilP),
      soil_k_mg_kg: parseOptionalNumber(soilK),
      soil_mg_mg_kg: parseOptionalNumber(soilMg),
      soil_ph: parseOptionalNumber(fertilizationSoilPh),
      soil_texture_class:
        soilTextureClass === "light" ||
        soilTextureClass === "medium" ||
        soilTextureClass === "heavy"
          ? soilTextureClass
          : null,
      phosphorus_method:
        phosphorusMethod === "SP" || phosphorusMethod === "ICP-OES"
          ? phosphorusMethod
          : null,
      predecessor_crop_name: predecessorCropName.trim() || null,
      predecessor_group: predecessorGroup || null,
      organic_fertilizer_type: organicFertilizerType || null,
      organic_livestock_type:
        organicFertilizerType === "kejda"
          ? organicLivestockType || null
          : null,
      organic_rate_t_ha: parseOptionalNumber(organicRate),
      organic_application_window: organicApplicationWindow || null,
      organic_year_after_application:
        organicYearAfterApplication
          ? Number(organicYearAfterApplication)
          : null,
      nmin_kg_ha: parseOptionalNumber(nmin),
      data_source: fertilizationDataSource.trim() || null,
      notes: fertilizationNotes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const numericValues = [
      payload.planned_yield_t_ha,
      payload.soil_p_mg_kg,
      payload.soil_k_mg_kg,
      payload.soil_mg_mg_kg,
      payload.soil_ph,
      payload.organic_rate_t_ha,
      payload.nmin_kg_ha,
    ];

    if (numericValues.some((value) => Number.isNaN(value))) {
      setFertilizationError(
        "Číselné hodnoty výživy musí být zadané jako platná čísla."
      );
      return;
    }

    if (
      payload.planned_yield_t_ha != null &&
      payload.planned_yield_t_ha <= 0
    ) {
      setFertilizationError("Plánovaný výnos musí být větší než 0.");
      return;
    }

    if (
      payload.soil_ph != null &&
      (payload.soil_ph < 0 || payload.soil_ph > 14)
    ) {
      setFertilizationError("pH musí být v rozsahu 0 až 14.");
      return;
    }

    if (payload.soil_p_mg_kg != null && !payload.phosphorus_method) {
      setFertilizationError(
        "Pro klasifikaci fosforu vyberte metodu stanovení P (SP nebo ICP-OES)."
      );
      return;
    }

    if (
      (payload.soil_k_mg_kg != null || payload.soil_mg_mg_kg != null) &&
      !payload.soil_texture_class
    ) {
      setFertilizationError(
        "Pro klasifikaci K a Mg vyberte půdní druh (lehká / střední / těžká)."
      );
      return;
    }

    setSavingFertilization(true);
    setFertilizationError("");

    const { data, error } = await supabase
      .from("project_fertilization_inputs")
      .upsert(payload, { onConflict: "project_id" })
      .select("*")
      .maybeSingle();

    if (error || !data) {
      console.error("CHYBA ULOŽENÍ VSTUPŮ HNOJENÍ:", error);
      setFertilizationError(
        "Vstupy pro hnojení se nepodařilo uložit."
      );
      setSavingFertilization(false);
      return;
    }

    const saved = data as ProjectFertilizationInputs;
    setFertilizationInputs(saved);
    setFertilizationForm(saved);
    setSavingFertilization(false);
    setFertilizationEditorOpen(false);
  }

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

  async function loadCropCatalog() {
    const { data, error } = await supabase
      .from("crop_catalog")
      .select(
        "id, name, scientific_name, external_code, crop_profile_id"
      )
      .eq("source_system", "UKZUZ_OOS_CIS01D")
      .eq("catalog_kind", "official_species")
      .eq("active", true)
      .eq("source_valid", true)
      .order("name", { ascending: true });

    if (error) {
      console.error(
        "CHYBA NAČTENÍ OFICIÁLNÍHO KATALOGU PLODIN:",
        error
      );
      setCropCatalog([]);
      return;
    }

    setCropCatalog((data ?? []) as CropCatalogItem[]);
  }

  async function loadVarietyCatalog(cropId: number) {
    setLoadingVarieties(true);

    const { data, error } = await supabase
      .from("variety_catalog")
      .select(
        "id, crop_id, name, external_code, registration_status, registration_status_code, active"
      )
      .eq("source_system", "UKZUZ_OOS_CIS01D")
      .eq("crop_id", cropId)
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error(
        "CHYBA NAČTENÍ OFICIÁLNÍHO KATALOGU ODRŮD:",
        error
      );
      setVarietyCatalog([]);
      setLoadingVarieties(false);
      return;
    }

    setVarietyCatalog((data ?? []) as VarietyCatalogItem[]);
    setLoadingVarieties(false);
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

    setCropCatalogId(currentProject.crop_catalog_id ?? null);
    setVarietyCatalogId(currentProject.variety_catalog_id ?? null);
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

  void loadCropCatalog();
  void loadCropProfiles();
  void loadCropStageProfiles();
}, [loadProject]);
/* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (cropCatalogId == null) {
      setVarietyCatalog([]);
      setLoadingVarieties(false);
      return;
    }

    void loadVarietyCatalog(cropCatalogId);
  }, [cropCatalogId]);

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

    const selectedCatalogCrop =
      cropCatalog.find(
        (item) => item.id === cropCatalogId
      ) ?? null;

    const selectedCatalogVariety =
      varietyCatalog.find(
        (item) => item.id === varietyCatalogId
      ) ?? null;

    if (cropCatalogId != null) {
      if (!selectedCatalogVariety) {
        setCropVarietyError("ODRŮDA JE POVINNÁ");
        setSavingCrop(false);
        return;
      }

      if (selectedCatalogVariety.crop_id !== cropCatalogId) {
        setCropVarietyError("Vybraná odrůda nepatří k vybrané plodině.");
        setSavingCrop(false);
        return;
      }
    } else if (!cropVariety.trim()) {
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
        crop_catalog_id: cropCatalogId,
        variety_catalog_id: selectedCatalogVariety?.id ?? null,
        crop_name:
          selectedCatalogCrop?.name ??
          (cropName.trim() || null),
        crop_variety:
          selectedCatalogVariety?.name ??
          (cropVariety.trim() || null),
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

    const updatedProject = data as Project;
    setProject(updatedProject);
    setCropCatalogId(updatedProject.crop_catalog_id ?? null);
    setVarietyCatalogId(updatedProject.variety_catalog_id ?? null);
    setCropName(updatedProject.crop_name ?? "");
    setCropVariety(updatedProject.crop_variety ?? "");
    setCropVarietyError("");
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
    const { data, error } = await supabase.rpc(
      "mark_aegris_alert_read",
      {
       p_alert_id: alertId,
      }
    );

    if (!error && data !== true) {
      console.error(
        "AEGRIS ALERT MARK READ DENIED:",
        {
          alertId,
          result: data,
        }
      );
      return;
    }

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

  const selectedCatalogCrop =
    cropCatalog.find(
      (item) => item.id === cropCatalogId
    ) ?? null;

  const selectedCropProfile =
    selectedCatalogCrop?.crop_profile_id != null
      ? cropProfiles.find(
          (profile) =>
            profile.id === selectedCatalogCrop.crop_profile_id
        ) ?? null
      : cropCatalogId == null
        ? cropProfiles.find(
            (profile) =>
              profile.name === cropName
          ) ?? null
        : null;

  useEffect(() => {
    if (!project) return;

    void loadFertilizationData(
      project.id,
      selectedCropProfile?.id ?? null
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, selectedCropProfile?.id]);

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

  const plannedYieldNumber =
    fertilizationInputs?.planned_yield_t_ha != null
      ? Number(fertilizationInputs.planned_yield_t_ha)
      : null;

  const fertilizationYieldLevel =
    plannedYieldNumber != null
      ? fertilizationYieldLevels.find((item) => {
          const minOk =
            item.min_yield_t_ha == null ||
            plannedYieldNumber >= Number(item.min_yield_t_ha);
          const maxOk =
            item.max_yield_t_ha == null ||
            plannedYieldNumber <= Number(item.max_yield_t_ha);
          return minOk && maxOk;
        })?.yield_level ?? null
      : null;

  const nitrogenRequirement = fertilizationYieldLevel
    ? nutrientRequirements.find(
        (item) =>
          item.nutrient === "N" &&
          item.yield_level === fertilizationYieldLevel
      ) ?? null
    : null;

  const predecessorAdjustment =
    fertilizationYieldLevel && fertilizationInputs?.predecessor_group
      ? predecessorAdjustments.find(
          (item) =>
            item.predecessor_group ===
              fertilizationInputs.predecessor_group &&
            item.yield_level === fertilizationYieldLevel
        ) ?? null
      : null;

  const organicNitrogenCredit = (() => {
    if (
      !fertilizationInputs?.organic_fertilizer_type ||
      fertilizationInputs.organic_rate_t_ha == null ||
      !fertilizationInputs.organic_application_window ||
      fertilizationInputs.organic_year_after_application == null
    ) {
      return null;
    }

    const rule = organicNitrogenCredits.find(
      (item) =>
        item.fertilizer_type ===
          fertilizationInputs.organic_fertilizer_type &&
        (item.livestock_type ?? null) ===
          (fertilizationInputs.organic_fertilizer_type === "kejda"
            ? fertilizationInputs.organic_livestock_type ?? null
            : null) &&
        item.application_window ===
          fertilizationInputs.organic_application_window &&
        Number(item.year_after_application) ===
          Number(fertilizationInputs.organic_year_after_application)
    );

    if (!rule) return null;

    return (
      Number(rule.effective_n_kg_per_t) *
      Number(fertilizationInputs.organic_rate_t_ha)
    );
  })();

  const calculatedNitrogenDose = (() => {
    if (nitrogenRequirement?.dose_kg_ha == null) return null;

    let value = Number(nitrogenRequirement.dose_kg_ha);

    if (predecessorAdjustment) {
      value += Number(predecessorAdjustment.adjustment_kg_n_ha);
    }

    if (organicNitrogenCredit != null) {
      value -= organicNitrogenCredit;
    }

    const minimum =
      nitrogenRequirement.min_dose_kg_ha != null
        ? Number(nitrogenRequirement.min_dose_kg_ha)
        : null;

    if (minimum != null) value = Math.max(minimum, value);

    return Math.max(0, value);
  })();

  const classifySoilNutrient = (
    nutrient: "P" | "K" | "Mg",
    value: number | null
  ) => {
    if (value == null || !Number.isFinite(value)) return null;

    const method =
      nutrient === "P" ? fertilizationInputs?.phosphorus_method ?? null : null;
    const texture =
      nutrient === "P" ? null : fertilizationInputs?.soil_texture_class ?? null;

    if (nutrient === "P" && !method) return null;
    if (nutrient !== "P" && !texture) return null;

    const candidates = soilNutrientClassificationRules
      .filter(
        (rule) =>
          rule.nutrient === nutrient &&
          (nutrient !== "P" || rule.analytical_method === method) &&
          (nutrient === "P" || rule.soil_texture_class === texture)
      )
      .sort((a, b) => {
        const aMax = a.max_mg_kg == null ? Number.POSITIVE_INFINITY : Number(a.max_mg_kg);
        const bMax = b.max_mg_kg == null ? Number.POSITIVE_INFINITY : Number(b.max_mg_kg);
        return aMax - bMax;
      });

    return (
      candidates.find(
        (rule) => rule.max_mg_kg == null || value <= Number(rule.max_mg_kg)
      ) ?? null
    );
  };

  const phosphorusClassification = classifySoilNutrient(
    "P",
    fertilizationInputs?.soil_p_mg_kg != null
      ? Number(fertilizationInputs.soil_p_mg_kg)
      : null
  );

  const potassiumClassification = classifySoilNutrient(
    "K",
    fertilizationInputs?.soil_k_mg_kg != null
      ? Number(fertilizationInputs.soil_k_mg_kg)
      : null
  );

  const magnesiumClassification = classifySoilNutrient(
    "Mg",
    fertilizationInputs?.soil_mg_mg_kg != null
      ? Number(fertilizationInputs.soil_mg_mg_kg)
      : null
  );

  const nutrientDoseFor = (
    nutrient: "P" | "K" | "Mg",
    supplyClass: CropNutrientRequirement["soil_supply_class"]
  ) => {
    if (!fertilizationYieldLevel || !supplyClass) return null;
    return (
      nutrientRequirements.find(
        (item) =>
          item.nutrient === nutrient &&
          item.yield_level === fertilizationYieldLevel &&
          item.soil_supply_class === supplyClass
      ) ?? null
    );
  };

  const phosphorusRequirement = nutrientDoseFor(
    "P",
    phosphorusClassification?.supply_class ?? null
  );
  const potassiumRequirement = nutrientDoseFor(
    "K",
    potassiumClassification?.supply_class ?? null
  );
  const magnesiumRequirement = nutrientDoseFor(
    "Mg",
    magnesiumClassification?.supply_class ?? null
  );

  const potassiumMagnesiumRatio =
    fertilizationInputs?.soil_k_mg_kg != null &&
    fertilizationInputs?.soil_mg_mg_kg != null &&
    Number(fertilizationInputs.soil_mg_mg_kg) > 0
      ? Number(fertilizationInputs.soil_k_mg_kg) /
        Number(fertilizationInputs.soil_mg_mg_kg)
      : null;

  const potassiumMagnesiumCorrection = (() => {
    if (potassiumMagnesiumRatio == null) return null;

    return (
      [...potassiumMagnesiumCorrections]
        .sort((a, b) => {
          const aMax = a.ratio_max == null ? Number.POSITIVE_INFINITY : Number(a.ratio_max);
          const bMax = b.ratio_max == null ? Number.POSITIVE_INFINITY : Number(b.ratio_max);
          return aMax - bMax;
        })
        .find(
          (rule) =>
            rule.ratio_max == null ||
            potassiumMagnesiumRatio <= Number(rule.ratio_max)
        ) ?? null
    );
  })();

  const calculatedPhosphorusDose =
    phosphorusRequirement?.dose_kg_ha != null
      ? Number(phosphorusRequirement.dose_kg_ha)
      : null;

  const calculatedMagnesiumDose =
    magnesiumRequirement?.dose_kg_ha != null
      ? Number(magnesiumRequirement.dose_kg_ha)
      : null;

  const calculatedPotassiumDose =
    potassiumRequirement?.dose_kg_ha != null
      ? Number(potassiumRequirement.dose_kg_ha) *
        Number(potassiumMagnesiumCorrection?.correction_factor ?? 1)
      : null;

  const supplyClassLabel = (
    value: SoilNutrientClassificationRule["supply_class"] | undefined
  ) => {
    if (value === "low") return "nízká";
    if (value === "satisfactory") return "vyhovující";
    if (value === "good") return "dobrá";
    if (value === "high") return "vysoká";
    if (value === "very_high") return "velmi vysoká";
    return "—";
  };

  const nutritionProfileAvailable = nutrientRequirements.length > 0;
  const hasSoilLaboratoryInputs =
    fertilizationInputs?.soil_p_mg_kg != null ||
    fertilizationInputs?.soil_k_mg_kg != null ||
    fertilizationInputs?.soil_mg_mg_kg != null;

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

  const analysisAlert =
    analysis != null
     ? alerts.find(
         (item) => item.analysis_id === analysis.id
       ) ?? null
     : null;

  const analysisWeather =
    analysisRecommendation?.weather_snapshot ?? weather;

  /*
   * Klientský přepočet je pouze backwards-compatible fallback.
   * Pro novější analýzy je jediným autoritativním zdrojem
   * `analysis.decision_snapshot`, který vznikl a byl uložen serverem
   * ve stejném běhu jako analysis + recommendation + alert.
   *
   * Tím se zabrání míchání:
   * - uloženého recommendation snapshotu
   * - s nově přepočítanými faktory v browseru.
   */
  const fallbackContextEvaluation = evaluateProjectContext(
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

  const persistedDecisionSnapshot =
    analysis?.decision_snapshot &&
    typeof analysis.decision_snapshot === "object"
      ? analysis.decision_snapshot
      : null;

  const contextEvaluation =
    persistedDecisionSnapshot ??
    fallbackContextEvaluation;

  /*
   * Priorita zdrojů pro hlavní zobrazení:
   * 1) serverový decision_snapshot konkrétní analýzy,
   * 2) uložený aegris_recommendation (starší kompatibilita),
   * 3) klientský fallback přepočet (legacy bez snapshotů).
   *
   * U nové analýzy tak všechny části UI používají stejný výsledek.
   */
  const displayedLevel =
    persistedDecisionSnapshot?.level ??
    analysisRecommendation?.level ??
    contextEvaluation.level;

  const displayedPriority =
    persistedDecisionSnapshot?.priority ??
    analysisRecommendation?.priority ??
    contextEvaluation.priority;

  const displayedScore =
    persistedDecisionSnapshot?.score != null
      ? Number(persistedDecisionSnapshot.score)
      : analysisRecommendation?.score != null
        ? Number(analysisRecommendation.score)
        : contextEvaluation.score;

  const displayedSummary =
    persistedDecisionSnapshot?.summary ||
    analysisRecommendation?.summary ||
    contextEvaluation.summary;

  const displayedRecommendation =
    persistedDecisionSnapshot?.recommendation ||
    analysisRecommendation?.recommendation ||
    contextEvaluation.recommendation;

  const displayedActions =
    Array.isArray(persistedDecisionSnapshot?.actions) &&
    persistedDecisionSnapshot.actions.length > 0
      ? persistedDecisionSnapshot.actions
      : Array.isArray(analysisRecommendation?.actions) &&
          analysisRecommendation.actions.length > 0
        ? analysisRecommendation.actions
        : contextEvaluation.actions;

  const mainReasonFactor =
    contextEvaluation.factors.find((factor) => factor.status === "Kritické") ??
    contextEvaluation.factors.find((factor) => factor.status === "Upozornění") ??
    null;

  const mainReasonLabel = mainReasonFactor
    ? `${mainReasonFactor.label}: ${mainReasonFactor.detail}`
    : "Bez výrazného rizikového faktoru";

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
      <main className="flex min-h-screen items-center justify-center bg-[#05090d] px-4 text-white">
        {projectLoadError ? (
          <div className="w-full max-w-xl rounded-2xl border border-red-500/20 bg-[#0a1016] p-8 text-center shadow-2xl shadow-black/30">
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
              className="mt-6 rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
            >
              Zpět na projekty
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/[0.10] border-t-cyan-400" />
            <div className="text-sm">Načítám projekt...</div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05090d] px-3 py-3 text-slate-100 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1680px]">
        {/* FIELD HEALTH RECORD HEADER */}
        <header className="mb-5 rounded-[24px] border border-white/[0.07] bg-[#0a1016] px-5 py-5 shadow-2xl shadow-black/10 sm:px-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[11px] normal-case tracking-normal text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-200"
                >
                  ← Zpět
                </button>
                <span>Field Health Record</span>
                <span className="text-slate-800">/</span>
                <span className="text-cyan-300">AegRIS Intelligence</span>
              </div>

              <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2">
                <h1 className="truncate text-3xl font-black tracking-[-0.035em] text-white sm:text-4xl">
                  {project.name}
                </h1>
                <span className="mb-1 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300">
                  {project.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-slate-500">
                <span>{project.crop_name ?? "Plodina neuvedena"}</span>
                <span>{project.area_ha != null ? `${project.area_ha} ha` : "Výměra neuvedena"}</span>
                <span>{project.growth_stage ?? "Růstová fáze neuvedena"}</span>
                <span>Aktualizováno {new Date(analysis?.created_at ?? project.created_at).toLocaleString("cs-CZ")}</span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadProject}
                className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-xs font-bold text-slate-400 transition hover:border-cyan-300/30 hover:text-cyan-200"
                title="Obnovit data"
              >
                ↻ Obnovit
              </button>
              {organizationRole !== "viewer" && (
                <button
                  type="button"
                  onClick={runAnalysis}
                  disabled={runningAnalysis}
                  className="rounded-xl bg-cyan-300 px-5 py-3 text-xs font-black text-[#061015] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {runningAnalysis ? "Analyzuji…" : "Spustit novou analýzu"}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* 1. OVERVIEW */}
        <section className="grid gap-3 xl:grid-cols-12">
          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-200">ⓘ Informace o projektu</div>
              <span className="rounded-md border border-emerald-400/25 bg-emerald-400/5 px-2 py-1 text-[9px] font-black text-emerald-400">{project.status}</span>
            </div>
            <div className="mt-3 rounded-lg border border-white/[0.07] bg-[#071017] p-3">
              <div className="text-[9px] uppercase tracking-widest text-slate-600">Status</div>
              <div className="mt-1 text-xs font-bold text-emerald-400">{project.status}</div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.035]">
              <div className="bg-[#071017] p-3"><div className="text-[8px] text-slate-600">Šířka</div><div className="mt-1 text-[10px] font-bold text-slate-200">{project.latitude.toFixed(6)}</div></div>
              <div className="bg-[#071017] p-3"><div className="text-[8px] text-slate-600">Délka</div><div className="mt-1 text-[10px] font-bold text-slate-200">{project.longitude.toFixed(6)}</div></div>
              <div className="bg-[#071017] p-3"><div className="text-[8px] text-slate-600">Plocha</div><div className="mt-1 text-[10px] font-bold text-slate-200">{project.area_ha != null ? `${project.area_ha} ha` : "—"}</div></div>
              <div className="bg-[#071017] p-3"><div className="text-[8px] text-slate-600">Růstová fáze</div><div className="mt-1 text-[10px] font-bold text-slate-200">{project.growth_stage ?? "—"}</div></div>
            </div>
            <div className="mt-2 text-[8px] text-slate-600">Založeno: {new Date(project.created_at).toLocaleDateString("cs-CZ")}</div>
          </div>

          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-8">
            <div className="grid gap-3 lg:grid-cols-[1fr_250px]">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-100">◒ Aktuální stav vegetace</div>
                <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-lg border border-white/[0.07] bg-[#071017]">
                  <div className="border-r border-white/[0.07] p-3"><div className="text-[8px] uppercase tracking-widest text-slate-500">NDVI</div><div className="mt-1 text-2xl font-black text-cyan-300">{currentNdvi != null ? currentNdvi.toFixed(3) : "—"}</div><div className={`text-[8px] ${latestNdviChangeClass}`}>{latestNdviChangeLabel} vs. předchozí</div></div>
                  <div className="border-r border-white/[0.07] p-3">
                    <div className="text-[8px] uppercase tracking-widest text-slate-500">
                      Celkové hodnocení
                    </div>
                    <div className={`mt-1 text-lg font-black ${priorityClass}`}>
                      {displayedLevel === "Bez vyhodnocení" ? "—" : displayedLevel}
                    </div>
                    <div className="mt-1 text-[8px] leading-relaxed text-slate-500">
                      {displayedLevel === "Bez vyhodnocení"
                        ? "Analýza zatím není k dispozici"
                        : `Hlavní důvod: ${mainReasonLabel}`}
                    </div>
                  </div>
                  <div className="p-3"><div className="text-[8px] uppercase tracking-widest text-slate-500">KONDICE POROSTU</div><div className={`mt-1 text-lg font-black ${priorityClass}`}>{displayedLevel === "Bez vyhodnocení" ? "—" : contextEvaluation.scoreLevel}</div><div className="text-[8px] text-slate-500">Priorita {displayedPriority}</div></div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-slate-500">
                  <span>Poslední analýza: {analysis ? new Date(analysis.created_at).toLocaleString("cs-CZ") : "—"}</span>
                  {persistedDecisionSnapshot ? (
                    <span className="text-cyan-500/70">
                      AEGRIS zobrazuje uložený serverový decision snapshot
                    </span>
                  ) : analysisRecommendation?.weather_snapshot ? (
                    <span className="text-cyan-500/70">
                      Legacy analýza používá uložený snapshot podmínek
                    </span>
                  ) : null}
                </div>
                {organizationRole === "viewer" ? (
                  <div className="mt-3 rounded-lg border border-white/[0.07] bg-[#071017] py-2.5 text-center text-[9px] font-bold text-slate-500">
                    Viewer má přístup pouze pro čtení.
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-white/[0.07] bg-[#071017] px-3 py-2.5 text-[9px] text-slate-500">
                    <span>Decision Engine</span>
                    <span className="font-bold text-cyan-300">Serverová analýza připravena</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-white/[0.07] bg-[#071017]">
                <div className="flex flex-col items-center justify-center border-r border-white/[0.07] p-3 text-center">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    Kontextové hodnocení
                  </div>
                  <div className="relative mt-3 flex h-24 w-24 items-center justify-center rounded-full border-[8px] border-white/[0.07]">
                    <div className="absolute inset-[-8px] rounded-full border-[8px] border-transparent border-r-cyan-400 border-t-cyan-400" />
                    <div className="relative text-center">
                      <div className="text-3xl font-black leading-none text-amber-400">
                        {displayedScore}
                      </div>
                      <div className="mt-1 text-[9px] font-bold text-slate-500">
                        / 100
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-[9px] font-black text-amber-400">
                    {contextEvaluation.scoreLevel}
                  </div>
                  <div className="mt-1 text-[8px] text-slate-500">
                    AEGRIS kontextové skóre
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-3 text-center">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    Kritické faktory
                  </div>
                  <div className="mt-3 text-3xl font-black leading-none text-red-400">
                    {contextEvaluation.criticalFactorCount}
                  </div>
                  <div className="mt-1 text-[9px] font-bold text-slate-500">
                    z {contextEvaluation.evaluatedFactorCount}
                  </div>
                  <div className="mt-2 text-[8px] text-slate-500">
                    kritických faktorů
                  </div>
                  <div className="mt-3 rounded-md border border-cyan-500/20 bg-cyan-300/5 px-2.5 py-1.5 text-[8px] font-bold text-cyan-300">
                    Datová jistota {contextEvaluation.dataCompletenessPct} %
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DATOVÁ DŮVĚRYHODNOST / QUALITY */}
        <section className="mt-3 rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                DATOVÁ DŮVĚRYHODNOST
              </div>
              <h2 className="mt-1 text-sm font-black">
                KVALITA A PŮVOD ANALÝZY
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
              <div className="mt-3 grid gap-px overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.035] sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-[#071017] p-3">
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

                <div className="bg-[#071017] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">
                    Prostorové rozlišení
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-cyan-300">
                    {analysis.spatial_resolution_m != null
                      ? `${analysis.spatial_resolution_m} m`
                      : "—"}
                  </div>
                  <div className="mt-0.5 text-[8px] text-slate-500">
                    {analysis.analysis_crs ?? "CRS neuvedeno"}
                  </div>
                </div>

                <div className="bg-[#071017] p-3">
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

                <div className="bg-[#071017] p-3">
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
                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] text-slate-600">Přijaté intervaly</div>
                  <div className="mt-1 text-base font-black text-emerald-400">
                    {analysis.accepted_intervals ?? "—"}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] text-slate-600">Odmítnuté intervaly</div>
                  <div className="mt-1 text-base font-black text-amber-400">
                    {analysis.rejected_intervals ?? "—"}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] text-slate-600">Medián NDVI</div>
                  <div className="mt-1 text-base font-black text-cyan-300">
                    {analysis.median_ndvi != null
                      ? Number(analysis.median_ndvi).toFixed(3)
                      : "—"}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
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
            <div className="mt-3 rounded-lg border border-white/[0.07] bg-[#071017] p-3 text-[9px] leading-4 text-slate-500">
              Tato uložená analýza ještě neobsahuje metadata kvality. Spusťte
              novou analýzu; AEGRIS poté uloží skutečný zdroj, rozlišení,
              validní pokrytí a quality gate přímo z Copernicus výsledku.
            </div>
          )}
        </section>

        {/* 2. DECISION / ALERT / ACTIONS */}
        <section className="mt-3 grid gap-3 xl:grid-cols-12">
          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-5">
            <div className="flex items-center justify-between gap-2"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">AEGRIS DECISION</div><h2 className="mt-1 text-sm font-black">ROZHODOVACÍ DOPORUČENÍ</h2></div><span className={`rounded-md border px-2 py-1 text-[9px] font-black ${displayedPriority === "Kritická" ? "border-red-500/40 bg-red-500/5 text-red-400" : "border-orange-500/40 bg-orange-500/5 text-orange-400"}`}>Priorita: {displayedPriority}</span></div>
            <div className="mt-3 text-[8px] font-black uppercase tracking-[0.18em] text-cyan-300">CO SE DĚJE</div>
            <h3 className="mt-1 text-lg font-black">{decisionTitle}</h3>
            <p className="mt-1 text-[10px] leading-4 text-slate-400">{displayedSummary}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-2.5"><div className="text-[8px] text-slate-600">NDVI</div><div className="mt-1 text-base font-black text-cyan-300">{currentNdvi?.toFixed(3) ?? "—"}</div></div>
              <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-2.5"><div className="text-[8px] text-slate-600">DLOUHODOBÝ TREND</div><div className={`mt-1 text-[10px] font-black ${recommendationTrend.className}`}>{recommendationTrend.icon} {recommendationTrend.label}</div></div>
              <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-2.5"><div className="text-[8px] text-slate-600">OD POSLEDNÍ ANALÝZY</div><div className={`mt-1 text-base font-black ${latestNdviChangeClass}`}>{latestNdviChangeLabel}</div></div>
            </div>
            <div className="mt-3 text-[8px] font-black uppercase tracking-[0.18em] text-cyan-300">CO UDĚLAT NYNÍ</div>
            <div className="mt-2 space-y-1.5">{displayedActions.slice(0, 4).map((action, index) => <div key={`decision-${index}`} className="flex gap-2 rounded-lg bg-[#071017] p-2 text-[10px] leading-4 text-slate-400"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 font-black text-cyan-300">{index + 1}</span><span>{action}</span></div>)}</div>
            <div className="mt-3 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.03] p-3 text-[9px] leading-4 text-slate-400"><span className="font-black text-cyan-300">DALŠÍ KROK</span><br /><span className="text-[10px] font-bold text-slate-200">{displayedRecommendation}</span></div>
          </div>

          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-4">
            <div className="flex items-center justify-between"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">🚨 AEGRIS ALERTY</div><h2 className="mt-1 text-sm font-black">UPOZORNĚNÍ PROJEKTU</h2></div><span className="rounded-md border border-white/[0.07] px-2 py-1 text-[8px] text-slate-400">Nepřečtené {unreadAlerts}</span></div>
            <div className="mt-3 space-y-2">{alerts.slice(0, 3).map((alert, index) => <div key={alert.id} className={`rounded-lg border p-3 ${alert.level === "critical" ? "border-red-500/25 bg-red-500/[0.03]" : "border-white/[0.07] bg-[#071017]"}`}><div className="flex items-start justify-between gap-2"><div className="flex gap-2"><span className={`mt-1 h-2.5 w-2.5 rounded-full ${alert.level === "critical" ? "bg-red-500" : alert.level === "warning" ? "bg-orange-400" : "bg-cyan-400"}`} /><div><div className="text-[10px] font-black">{alert.title}{!alert.is_read && <span className="ml-1 rounded bg-cyan-300/10 px-1 text-[7px] text-cyan-300">NOVÉ</span>}</div><div className="mt-1 text-[8px] text-slate-600">{new Date(alert.created_at).toLocaleString("cs-CZ")}</div></div></div><span className="rounded bg-red-500/10 px-2 py-1 text-[8px] font-black text-red-400">{alert.priority}</span></div><p className="mt-2 text-[9px] leading-4 text-slate-500">{alert.message}</p>{!alert.is_read && index === 0 && <button type="button" onClick={() => markAlertAsRead(alert.id)} className="mt-2 text-[8px] font-bold text-cyan-300 hover:text-cyan-300">✓ Označit jako přečtené</button>}</div>)}{alerts.length === 0 && <div className="rounded-lg bg-[#071017] p-4 text-[10px] text-slate-500">Zatím nebyl vytvořen žádný alert.</div>}</div>
            <button type="button" onClick={() => document.getElementById("project-history")?.scrollIntoView({ behavior: "smooth" })} className="mt-3 w-full rounded-lg border border-white/[0.07] bg-[#071017] py-2 text-[9px] font-bold text-cyan-300">Zobrazit všechna upozornění ({alerts.length})</button>
          </div>

          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-3">
            <div className="flex items-center justify-between"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">♧ AEGRIS DOPORUČENÍ</div><h2 className="mt-1 text-sm font-black">CO NYNÍ UDĚLAT</h2></div><span className={`rounded-md border px-2 py-1 text-[8px] font-black ${priorityClass} border-current/20`}>{displayedPriority}</span></div>
            <div className="mt-3 space-y-2">{displayedActions.slice(0, 5).map((action, index) => <div key={`recommend-${index}`} className="flex gap-2 rounded-lg bg-[#071017] p-2 text-[9px] leading-4 text-slate-400"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 font-black text-cyan-300">{index + 1}</span><span>{action}</span></div>)}</div>
          </div>
        </section>

        {/* 3. DIAGNOSTICS + FACTORS */}
        <section className="mt-3 grid gap-3 xl:grid-cols-12">
          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-5">
            <div className="flex items-center justify-between"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">AEGRIS DIAGNOSTIKA</div><h2 className="mt-1 text-sm font-black">Pravděpodobné příčiny aktuálního rizika</h2></div><span className="rounded-md border border-red-500/20 bg-red-500/5 px-2 py-1 text-[8px] font-black text-red-400">{contextEvaluation.diagnoses.length} diagn.</span></div>
            <div className="mt-3 space-y-2">{contextEvaluation.diagnoses.slice(0, 2).map((diagnosis) => <div key={diagnosis.code} className="rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="flex items-center justify-between gap-2"><div className="text-[10px] font-black text-slate-100">{diagnosis.label}</div><div className="text-right"><div className="text-[8px] uppercase tracking-wider text-slate-600">Síla indikace</div><div className="text-[10px] font-black text-red-400">{indicationStrengthLabel(diagnosis.confidence)}</div></div></div>{diagnosis.evidence.length > 0 && <div className="mt-2 space-y-1">{diagnosis.evidence.slice(0, 3).map((evidence, index) => <div key={`${diagnosis.code}-${index}`} className="flex gap-2 text-[8px] leading-4 text-slate-500"><span className="text-orange-400">•</span><span>{evidence}</span></div>)}</div>}</div>)}{contextEvaluation.diagnoses.length === 0 && <div className="rounded-lg bg-[#071017] p-3 text-[9px] text-slate-500">Bez aktuálně identifikované diagnózy.</div>}</div>
          </div>
          <div className="xl:col-span-7 rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4"><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">KLÍČOVÉ FAKTORY</div><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{contextEvaluation.factors.slice(0, 6).map((factor, index) => { const scoreItem = contextEvaluation.scoreBreakdown.find((item) => item.label === factor.label); return <div key={`${factor.label}-${index}`} className="rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="flex items-start justify-between gap-2"><div className="text-[9px] font-semibold leading-4 text-slate-300">{factor.label}</div><span className={`rounded-full px-2 py-1 text-[7px] font-black ${factor.status === "OK" ? "bg-emerald-500/10 text-emerald-400" : factor.status === "Upozornění" ? "bg-amber-500/10 text-amber-400" : factor.status === "Kritické" ? "bg-red-500/10 text-red-400" : "bg-slate-500/10 text-slate-400"}`}>{factor.status === "OK" ? "V NORMĚ" : factor.status}</span></div>{scoreItem && <div className="mt-2 text-[8px] font-bold text-cyan-300">Skóre {scoreItem.score}/100 · váha {scoreItem.weight}%</div>}<p className="mt-2 text-[8px] leading-4 text-slate-500">{factor.detail}</p></div>})}</div></div>
        </section>

        {analysis && (
          <FieldValidationForm
            key={analysis.id}
            projectId={project.id}
            analysisId={analysis.id}
            recommendationId={
              analysisRecommendation?.id ?? null
            }
            alertId={analysisAlert?.id ?? null}
            readOnly={organizationRole === "viewer"}
          />
        )}

        {/* 4. SINGLE NDVI CHART + SIDE DATA */}
        <section className="mt-3 grid gap-3 xl:grid-cols-12">
          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-8">
            <div className="flex items-start justify-between gap-3"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">VÝVOJ NDVI</div><div className="mt-1 flex flex-wrap items-center gap-2 text-[9px]"><span className="font-bold">Trend:</span><span className={recommendationTrend.className}>{recommendationTrend.label === "Porost se zlepšuje" ? "Rostoucí" : recommendationTrend.label === "Vývoj se zhoršuje" ? "Klesající" : recommendationTrend.label === "Vývoj je stabilní" ? "Stabilní" : recommendationTrend.label}</span><span className="text-slate-700">•</span><span className="text-slate-500">Trendové okno:</span><span className="font-bold text-slate-300">{trendWindowLabel}</span></div></div><div className={`text-right text-[9px] font-black ${recommendationTrend.className}`}>NDVI {currentNdvi?.toFixed(3) ?? "—"}<br /><span className="font-normal">{recommendationTrend.label}</span></div></div>
            <div className="mt-2 h-[290px]"><AnalysisChart history={chartHistory} /></div>
          </div>
          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-4">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">VÝVOJ STAVU A DOPORUČENÍ</div>
            <div className="mt-3 space-y-2">{recentRecommendations.map((item) => <div key={item.id} className="rounded-lg border border-white/[0.07] bg-[#071017] p-2.5"><div className="text-[8px] text-slate-600">{new Date(item.created_at).toLocaleString("cs-CZ")}</div><div className="mt-1 flex items-center justify-between gap-2"><span className="text-[9px] font-bold text-cyan-300">{item.crop_name ?? "Plodina"}</span><span className="text-[8px] font-bold text-slate-300">NDVI {item.ndvi != null ? Number(item.ndvi).toFixed(3) : "—"}</span><span className={`text-[8px] font-black ${item.priority === "Kritická" ? "text-red-400" : item.priority === "Vysoká" ? "text-orange-400" : "text-emerald-400"}`}>{item.priority}</span></div></div>)}{recentRecommendations.length === 0 && <div className="rounded-lg bg-[#071017] p-3 text-[9px] text-slate-500">Zatím žádný záznam.</div>}</div>
            <button type="button" onClick={() => document.getElementById("project-history")?.scrollIntoView({ behavior: "smooth" })} className="mt-3 w-full rounded-lg border border-white/[0.07] py-2 text-[9px] font-bold text-cyan-300">Zobrazit historii doporučení</button>
            <div className="mt-4 border-t border-white/[0.07] pt-3"><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">HISTORIE ANALÝZ</div><div className="mt-2 space-y-1.5">{recentAnalyses.slice(0, 4).map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg bg-[#071017] px-2.5 py-2 text-[8px]"><span className="text-slate-500">{new Date(item.created_at).toLocaleDateString("cs-CZ")}</span><span className="font-bold text-cyan-300">NDVI {Number(item.ndvi).toFixed(3)}</span><span className="font-bold text-slate-300">{item.risk}</span></div>)}</div></div>
          </div>
        </section>

        {/* 5. WEATHER */}
        <section className="mt-3 rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4">
          <div className="flex items-center justify-between gap-3"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">POČASÍ A PODMÍNKY</div><h2 className="mt-1 text-sm font-black">AKTUÁLNÍ PODMÍNKY V LOKALITĚ</h2></div><button type="button" onClick={() => loadWeather(project.id)} disabled={loadingWeather} className="rounded-lg border border-white/[0.07] px-3 py-2 text-[8px] font-bold text-slate-400 hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-50">↻ Obnovit</button></div>
          {weather ? <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4"><div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="text-[8px] text-slate-500">Teplota</div><div className="mt-1 text-lg font-black text-orange-400">{weather.temperature_c != null ? `${weather.temperature_c.toFixed(1)} °C` : "—"}</div><div className={`text-[8px] ${temperatureStatusClass}`}>{temperatureStatus}</div></div><div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="text-[8px] text-slate-500">Vlhkost</div><div className="mt-1 text-lg font-black text-cyan-300">{weather.humidity_pct != null ? `${weather.humidity_pct.toFixed(0)} %` : "—"}</div><div className="text-[8px] text-cyan-300">Aktuální</div></div><div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="text-[8px] text-slate-500">Srážky – poslední hodina</div><div className="mt-1 text-lg font-black">{weather.precipitation_mm != null ? `${weather.precipitation_mm.toFixed(1)} mm` : "—"}</div><div className="text-[8px] text-slate-500">Aktuální</div></div><div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="text-[8px] text-slate-500">Vítr</div><div className="mt-1 text-lg font-black">{weather.wind_speed_kmh != null ? `${weather.wind_speed_kmh.toFixed(1)} km/h` : "—"}</div><div className="text-[8px] text-emerald-400">Aktuální</div></div></div> : <div className="mt-3 text-[9px] text-slate-500">{loadingWeather ? "Načítám počasí..." : "Počasí se nepodařilo načíst."}</div>}
        </section>

        {/* 6. NUTRITION / FERTILIZATION */}
        <section className="mt-3 rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                AEGRIS AGRONOMY · VÝŽIVA A HNOJENÍ
              </div>
              <h2 className="mt-1 text-sm font-black">
                METODICKÝ PROFIL VÝŽIVY PLODINY
              </h2>
              <p className="mt-1 max-w-3xl text-[9px] leading-4 text-slate-500">
                Výpočet vychází z metodiky ÚKZÚZ. AEGRIS nezobrazuje
                konkrétní dávku tam, kde chybí vstupy potřebné pro její
                bezpečné stanovení.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-md border px-2 py-1 text-[8px] font-black ${
                  nutritionProfileAvailable
                    ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-400"
                    : "border-amber-500/25 bg-amber-500/5 text-amber-400"
                }`}
              >
                {nutritionProfileAvailable
                  ? "Výživový profil dostupný"
                  : "Výživový profil není dostupný"}
              </span>
              {organizationRole !== "viewer" && (
                <button
                  type="button"
                  onClick={() => setFertilizationEditorOpen((value) => !value)}
                  className="rounded-lg border border-white/[0.08] bg-[#071017] px-3 py-2 text-[8px] font-bold text-cyan-300 hover:border-cyan-300/30"
                >
                  {fertilizationEditorOpen
                    ? "Zavřít vstupy"
                    : "✎ Doplnit vstupy"}
                </button>
              )}
            </div>
          </div>

          {fertilizationError && (
            <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/[0.04] p-3 text-[9px] text-red-300">
              {fertilizationError}
            </div>
          )}

          {loadingFertilization ? (
            <div className="mt-3 rounded-lg border border-white/[0.07] bg-[#071017] p-4 text-[9px] text-slate-500">
              Načítám výživový profil…
            </div>
          ) : (
            <>
              <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-6">
                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">Plánovaný výnos</div>
                  <div className="mt-1 text-lg font-black text-cyan-300">
                    {plannedYieldNumber != null ? `${plannedYieldNumber.toFixed(2)} t/ha` : "—"}
                  </div>
                  <div className="mt-1 text-[8px] text-slate-500">
                    {fertilizationYieldLevel === "low" ? "Nízká výnosová úroveň" : fertilizationYieldLevel === "medium" ? "Střední výnosová úroveň" : fertilizationYieldLevel === "high" ? "Vysoká výnosová úroveň" : "Nutné pro výpočet výživy"}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">Dusík N</div>
                  <div className="mt-1 text-lg font-black text-emerald-400">
                    {calculatedNitrogenDose != null ? `${calculatedNitrogenDose.toFixed(0)} kg N/ha` : "—"}
                  </div>
                  <div className="mt-1 text-[8px] leading-4 text-slate-500">
                    {nitrogenRequirement ? `Základ ${Number(nitrogenRequirement.dose_kg_ha).toFixed(0)} · minimum ${Number(nitrogenRequirement.min_dose_kg_ha ?? 0).toFixed(0)} kg N/ha` : "Chybí plánovaný výnos."}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">Fosfor P₂O₅</div>
                  <div className="mt-1 text-lg font-black text-violet-300">
                    {calculatedPhosphorusDose != null ? `${calculatedPhosphorusDose.toFixed(0)} kg/ha` : "—"}
                  </div>
                  <div className="mt-1 text-[8px] leading-4 text-slate-500">
                    {fertilizationInputs?.soil_p_mg_kg != null ? `${fertilizationInputs.soil_p_mg_kg} mg/kg · ${supplyClassLabel(phosphorusClassification?.supply_class)} · ${fertilizationInputs.phosphorus_method ?? "metoda neuvedena"}` : "Chybí půdní rozbor P."}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">Draslík K₂O</div>
                  <div className="mt-1 text-lg font-black text-amber-300">
                    {calculatedPotassiumDose != null ? `${calculatedPotassiumDose.toFixed(0)} kg/ha` : "—"}
                  </div>
                  <div className="mt-1 text-[8px] leading-4 text-slate-500">
                    {fertilizationInputs?.soil_k_mg_kg != null ? `${fertilizationInputs.soil_k_mg_kg} mg/kg · ${supplyClassLabel(potassiumClassification?.supply_class)}` : "Chybí půdní rozbor K."}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">Hořčík MgO</div>
                  <div className="mt-1 text-lg font-black text-sky-300">
                    {calculatedMagnesiumDose != null ? `${calculatedMagnesiumDose.toFixed(0)} kg/ha` : "—"}
                  </div>
                  <div className="mt-1 text-[8px] leading-4 text-slate-500">
                    {fertilizationInputs?.soil_mg_mg_kg != null ? `${fertilizationInputs.soil_mg_mg_kg} mg/kg · ${supplyClassLabel(magnesiumClassification?.supply_class)}` : "Chybí půdní rozbor Mg."}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">Zdroj metodiky</div>
                  <div className="mt-1 text-[10px] font-black text-slate-200">ÚKZÚZ · 6. vydání · 2020</div>
                  <div className="mt-1 text-[8px] leading-4 text-slate-500">Tab. 6, 15–17 a metodická korekce K:Mg.</div>
                </div>
              </div>

              {hasSoilLaboratoryInputs && (
                <div className="mt-2 grid gap-2 lg:grid-cols-2">
                  <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                    <div className="text-[8px] font-black uppercase tracking-widest text-cyan-300">Klasifikace půdní zásobenosti</div>
                    <div className="mt-2 text-[8px] leading-4 text-slate-500">
                      P: <span className="font-bold text-slate-300">{supplyClassLabel(phosphorusClassification?.supply_class)}</span> · K: <span className="font-bold text-slate-300">{supplyClassLabel(potassiumClassification?.supply_class)}</span> · Mg: <span className="font-bold text-slate-300">{supplyClassLabel(magnesiumClassification?.supply_class)}</span>
                    </div>
                    <div className="mt-1 text-[8px] text-slate-600">
                      Půdní druh: {fertilizationInputs?.soil_texture_class === "light" ? "lehká" : fertilizationInputs?.soil_texture_class === "medium" ? "střední" : fertilizationInputs?.soil_texture_class === "heavy" ? "těžká" : "neuveden"}. Metoda P: {fertilizationInputs?.phosphorus_method ?? "neuvedena"}.
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                    <div className="text-[8px] font-black uppercase tracking-widest text-cyan-300">Poměr K : Mg</div>
                    <div className="mt-1 text-lg font-black text-slate-200">
                      {potassiumMagnesiumRatio != null ? potassiumMagnesiumRatio.toFixed(2) : "—"}
                    </div>
                    <div className="mt-1 text-[8px] leading-4 text-slate-500">
                      {potassiumMagnesiumCorrection ? `${potassiumMagnesiumCorrection.description} Koeficient K ${Number(potassiumMagnesiumCorrection.correction_factor).toFixed(2)}.` : "Pro korekci je nutné zadat K i Mg."}
                    </div>
                  </div>
                </div>
              )}
              {nitrogenRequirement && (
                <div className="mt-2 grid gap-2 lg:grid-cols-3">
                  <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                    <div className="text-[8px] font-black uppercase tracking-widest text-cyan-300">
                      Korekce N
                    </div>
                    <div className="mt-2 space-y-1 text-[8px] leading-4 text-slate-500">
                      <div>
                        Předplodina: {predecessorAdjustment
                          ? `${Number(
                              predecessorAdjustment.adjustment_kg_n_ha
                            ).toFixed(0)} kg N/ha`
                          : "bez započtené korekce"}
                      </div>
                      <div>
                        Organické hnojení: {organicNitrogenCredit != null
                          ? `−${organicNitrogenCredit.toFixed(1)} kg N/ha`
                          : "bez započteného odpočtu"}
                      </div>
                      <div>
                        Nmin: {fertilizationInputs?.nmin_kg_ha != null
                          ? `${fertilizationInputs.nmin_kg_ha} kg/ha – uložen jako zpřesňující údaj, není automaticky odečítán`
                          : "neuveden"}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3 lg:col-span-2">
                    <div className="text-[8px] font-black uppercase tracking-widest text-cyan-300">
                      Rámcové dělení dusíku
                    </div>
                    {nitrogenSplits.length > 0 ? (
                      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {nitrogenSplits.map((split) => (
                          <div
                            key={split.id}
                            className="rounded-md bg-[#050b10] px-3 py-2"
                          >
                            <div className="text-[8px] text-slate-500">
                              {split.application_stage}
                            </div>
                            <div className="mt-1 text-sm font-black text-slate-200">
                              {Number(split.share_percent).toFixed(0)} %
                            </div>
                            <div className="text-[8px] text-slate-600">
                              {calculatedNitrogenDose != null
                                ? `≈ ${((
                                    calculatedNitrogenDose *
                                    Number(split.share_percent)
                                  ) /
                                    100
                                  ).toFixed(0)} kg N/ha`
                                : "dávku nelze vyčíslit"}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 text-[8px] text-slate-500">
                        Pro tuto plodinu není dělení N v databázi dostupné.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!plannedYieldNumber && nutritionProfileAvailable && (
                <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3 text-[9px] leading-4 text-amber-200">
                  Pro konkrétní doporučení dusíku doplňte plánovaný výnos.
                  AEGRIS bez tohoto vstupu dávku neodhaduje.
                </div>
              )}
            </>
          )}

          {organizationRole !== "viewer" && fertilizationEditorOpen && (
            <div className="mt-3 rounded-xl border border-cyan-400/15 bg-[#071017] p-4">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
                Vstupy pro výpočet výživy
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="text-[9px] text-slate-500">
                  Plánovaný výnos (t/ha)
                  <input type="number" step="0.01" value={plannedYield} onChange={(event) => setPlannedYield(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500">
                  Půdní druh pro K / Mg
                  <select value={soilTextureClass} onChange={(event) => setSoilTextureClass(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white">
                    <option value="">Vyberte</option>
                    <option value="light">Lehká půda</option>
                    <option value="medium">Střední půda</option>
                    <option value="heavy">Těžká půda</option>
                  </select>
                </label>
                <label className="text-[9px] text-slate-500">
                  Metoda stanovení P
                  <select value={phosphorusMethod} onChange={(event) => setPhosphorusMethod(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white">
                    <option value="">Vyberte</option>
                    <option value="SP">SP</option>
                    <option value="ICP-OES">ICP-OES</option>
                  </select>
                </label>
                <label className="text-[9px] text-slate-500">
                  P v půdě (mg/kg)
                  <input type="number" step="0.01" value={soilP} onChange={(event) => setSoilP(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500">
                  K v půdě (mg/kg)
                  <input type="number" step="0.01" value={soilK} onChange={(event) => setSoilK(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500">
                  Mg v půdě (mg/kg)
                  <input type="number" step="0.01" value={soilMg} onChange={(event) => setSoilMg(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500">
                  pH půdy
                  <input type="number" step="0.01" value={fertilizationSoilPh} onChange={(event) => setFertilizationSoilPh(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500">
                  Předplodina
                  <input value={predecessorCropName} onChange={(event) => setPredecessorCropName(event.target.value)} placeholder="např. jetel" className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500">
                  Skupina předplodiny
                  <select value={predecessorGroup} onChange={(event) => setPredecessorGroup(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white">
                    <option value="">Bez korekce / jiná</option>
                    <option value="jeteloviny">Jeteloviny</option>
                    <option value="luskoviny">Luskoviny</option>
                  </select>
                </label>
                <label className="text-[9px] text-slate-500">
                  Nmin (kg/ha)
                  <input type="number" step="0.01" value={nmin} onChange={(event) => setNmin(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500">
                  Organické hnojivo
                  <select value={organicFertilizerType} onChange={(event) => { setOrganicFertilizerType(event.target.value); if (event.target.value !== "kejda") setOrganicLivestockType(""); }} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white">
                    <option value="">Bez odpočtu</option>
                    <option value="hnůj">Hnůj</option>
                    <option value="močůvka">Močůvka</option>
                    <option value="kejda">Kejda</option>
                  </select>
                </label>
                <label className="text-[9px] text-slate-500">
                  Druh kejdy
                  <select disabled={organicFertilizerType !== "kejda"} value={organicLivestockType} onChange={(event) => setOrganicLivestockType(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white disabled:opacity-40">
                    <option value="">Vyberte</option>
                    <option value="skot">Skot</option>
                    <option value="prasata">Prasata</option>
                    <option value="drůbež">Drůbež</option>
                  </select>
                </label>
                <label className="text-[9px] text-slate-500">
                  Dávka organického hnojiva (t/ha)
                  <input type="number" step="0.01" value={organicRate} onChange={(event) => setOrganicRate(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500">
                  Období aplikace
                  <select value={organicApplicationWindow} onChange={(event) => setOrganicApplicationWindow(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white">
                    <option value="">Vyberte</option>
                    <option value="VIII-IX">VIII–IX</option>
                    <option value="X-II">X–II</option>
                    <option value="III-VII">III–VII</option>
                  </select>
                </label>
                <label className="text-[9px] text-slate-500">
                  Rok účinku organického N
                  <select value={organicYearAfterApplication} onChange={(event) => setOrganicYearAfterApplication(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white">
                    <option value="">Vyberte</option>
                    <option value="1">1. rok</option>
                    <option value="2">2. rok</option>
                  </select>
                </label>
                <label className="text-[9px] text-slate-500 xl:col-span-2">
                  Zdroj údajů
                  <input value={fertilizationDataSource} onChange={(event) => setFertilizationDataSource(event.target.value)} placeholder="např. AZP 2026 / laboratorní rozbor" className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500 xl:col-span-2">
                  Poznámka
                  <input value={fertilizationNotes} onChange={(event) => setFertilizationNotes(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
              </div>
              <div className="mt-3 flex justify-end">
                <button type="button" onClick={saveFertilizationInputs} disabled={savingFertilization} className="rounded-lg bg-cyan-300 px-5 py-2.5 text-[9px] font-black text-slate-950 hover:bg-cyan-200 disabled:opacity-50">
                  {savingFertilization ? "Ukládám…" : "💾 Uložit vstupy výživy"}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 7. PROJECT DATA */}
        <section className="mt-3 grid gap-3 xl:grid-cols-12">
          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-4">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">DETAILY PROJEKTU</div>
            <div className="mt-3 space-y-1.5 text-[9px]">{[["Plodina", project.crop_name ?? "—"],["Odrůda", project.crop_variety ?? "—"],["Výměra", project.area_ha != null ? `${project.area_ha} ha` : "—"],["Růstová fáze", project.growth_stage ?? "—"],["Datum setí", project.sowing_date ? new Date(project.sowing_date).toLocaleDateString("cs-CZ") : "—"],["Očekávaná sklizeň", project.expected_harvest_date ? new Date(project.expected_harvest_date).toLocaleDateString("cs-CZ") : "—"],["Způsob pěstování", project.farming_method ?? "—"]].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 border-b border-white/[0.07]/70 py-2"><span className="text-slate-500">{label}</span><span className="text-right font-semibold text-slate-200">{value}</span></div>)}</div>
            {organizationRole !== "viewer" && (
              <button type="button" onClick={openCropEditor} className="mt-3 w-full rounded-lg bg-cyan-300 py-2 text-[9px] font-black text-slate-950 hover:bg-cyan-200">✎ Upravit údaje o plodině</button>
            )}
          </div>

          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-4">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">PROFIL PLODINY</div>
            <h2 className="mt-1 text-base font-black">{selectedCropProfile?.name ?? project.crop_name ?? "—"}</h2>
            <div className="text-[8px] text-slate-600">{selectedCropProfile?.category ?? "Profil není vyhodnocen"}</div>
            <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-lg bg-white/[0.035] p-2.5"><div className="text-[8px] text-slate-500">🌡️ Teplota</div><div className="mt-1 text-[10px] font-bold">{selectedCropProfile?.min_temperature_c != null && selectedCropProfile?.max_temperature_c != null ? `${selectedCropProfile.min_temperature_c}–${selectedCropProfile.max_temperature_c} °C` : "Neuvedeno"}</div></div><div className="rounded-lg bg-white/[0.035] p-2.5"><div className="text-[8px] text-slate-500">💧 Vlhkost</div><div className="mt-1 text-[10px] font-bold">{selectedCropProfile?.soil_moisture_min_pct != null && selectedCropProfile?.soil_moisture_max_pct != null ? `${selectedCropProfile.soil_moisture_min_pct}–${selectedCropProfile.soil_moisture_max_pct} %` : "Neuvedeno"}</div></div><div className="rounded-lg bg-white/[0.035] p-2.5"><div className="text-[8px] text-slate-500">pH půdy</div><div className="mt-1 text-[10px] font-bold">{selectedCropProfile?.ph_min != null && selectedCropProfile?.ph_max != null ? `${selectedCropProfile.ph_min}–${selectedCropProfile.ph_max}` : "Neuvedeno"}</div></div><div className="rounded-lg bg-white/[0.035] p-2.5"><div className="text-[8px] text-slate-500">💦 Potřeba vody</div><div className="mt-1 text-[10px] font-bold">{selectedCropProfile?.water_need ?? "Neuvedeno"}</div></div></div>
            {selectedCropStageProfile && <div className="mt-2 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.03] p-2.5 text-[8px] text-slate-400">Fáze: <span className="font-bold text-slate-200">{selectedCropStageProfile.growth_stage}</span> · Kc <span className="font-bold text-slate-200">{selectedCropStageProfile.kc != null ? Number(selectedCropStageProfile.kc).toFixed(2) : "—"}</span> · Vodní stres <span className="font-bold text-slate-200">{selectedCropStageProfile.water_stress_sensitivity ?? "Neuvedeno"}</span></div>}
          </div>

          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-4"><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">LOKALITA PROJEKTU</div><div className="mt-3 overflow-hidden rounded-lg border border-white/[0.07]"><ProjectMap latitude={project.latitude} longitude={project.longitude} /></div><div className="mt-2 grid grid-cols-2 gap-2"><div className="rounded-lg bg-white/[0.035] p-2.5"><div className="text-[8px] text-slate-500">Šířka</div><div className="mt-1 text-[9px] font-bold">{project.latitude.toFixed(6)}</div></div><div className="rounded-lg bg-white/[0.035] p-2.5"><div className="text-[8px] text-slate-500">Délka</div><div className="mt-1 text-[9px] font-bold">{project.longitude.toFixed(6)}</div></div></div></div>
        </section>

        {/* HIDDEN/LOW-PRIORITY EDITOR — functionality remains available */}
        {organizationRole !== "viewer" && (
        <section id="crop-editor" className="mt-3 rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4">
          <details
            open={cropEditorOpen}
            onToggle={(event) =>
              setCropEditorOpen(event.currentTarget.open)
            }
          >
            <summary className="cursor-pointer list-none text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">EDITACE ÚDAJŮ O PLODINĚ</summary>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <label className="text-[9px] text-slate-500">
                Pěstovaná plodina
                <select
                  value={cropCatalogId != null ? String(cropCatalogId) : ""}
                  onChange={(event) => {
                    const nextCatalogId =
                      event.target.value === ""
                        ? null
                        : Number(event.target.value);

                    const nextCatalogCrop =
                      nextCatalogId != null
                        ? cropCatalog.find(
                            (item) => item.id === nextCatalogId
                          ) ?? null
                        : null;

                    setCropCatalogId(nextCatalogId);
                    setCropName(nextCatalogCrop?.name ?? "");
                    setVarietyCatalogId(null);
                    setCropVariety("");
                    setCropVarietyError("");
                    setVarietyCatalog([]);

                    const nextCropProfile =
                      nextCatalogCrop?.crop_profile_id != null
                        ? cropProfiles.find(
                            (profile) =>
                              profile.id === nextCatalogCrop.crop_profile_id
                          ) ?? null
                        : null;

                    const availableStages = nextCropProfile
                      ? cropStageProfiles
                          .filter(
                            (stageProfile) =>
                              stageProfile.crop_profile_id === nextCropProfile.id
                          )
                          .map(
                            (stageProfile) => stageProfile.growth_stage
                          )
                      : [];

                    if (!availableStages.includes(growthStage)) {
                      setGrowthStage(availableStages[0] ?? "");
                    }
                  }}
                  className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#071017] px-3 py-2 text-xs text-white"
                >
                  <option value="">
                    {cropCatalogId == null && cropName
                      ? `Původní hodnota: ${cropName}`
                      : "Vyberte plodinu z ÚKZÚZ"}
                  </option>
                  {cropCatalog.map((item) => (
                    <option key={item.id} value={String(item.id)}>
                      {item.name}
                      {item.scientific_name
                        ? ` — ${item.scientific_name}`
                        : ""}
                    </option>
                  ))}
                </select>
                {cropCatalogId != null &&
                  selectedCatalogCrop &&
                  selectedCatalogCrop.crop_profile_id == null && (
                    <span className="mt-1 block text-[8px] text-amber-400">
                      Pro tuto oficiální plodinu zatím není přiřazen agronomický profil.
                    </span>
                  )}
              </label>
              <label className="text-[9px] text-slate-500">
                Odrůda
                {cropCatalogId != null ? (
                  <>
                    <select
                      value={
                        varietyCatalogId != null
                          ? String(varietyCatalogId)
                          : ""
                      }
                      onChange={(event) => {
                        const nextVarietyId =
                          event.target.value === ""
                            ? null
                            : Number(event.target.value);

                        const nextVariety =
                          nextVarietyId != null
                            ? varietyCatalog.find(
                                (item) => item.id === nextVarietyId
                              ) ?? null
                            : null;

                        setVarietyCatalogId(nextVarietyId);
                        setCropVariety(nextVariety?.name ?? "");
                        setCropVarietyError("");
                      }}
                      disabled={loadingVarieties}
                      className={`mt-1 w-full rounded-lg border bg-[#071017] px-3 py-2 text-xs text-white disabled:opacity-50 ${
                        cropVarietyError
                          ? "border-red-500"
                          : "border-white/[0.10]"
                      }`}
                    >
                      <option value="">
                        {loadingVarieties
                          ? "Načítám odrůdy ÚKZÚZ..."
                          : varietyCatalog.length > 0
                            ? "Vyberte odrůdu z ÚKZÚZ"
                            : "Pro tuto plodinu nejsou dostupné aktivní odrůdy"}
                      </option>
                      {varietyCatalog.map((item) => (
                        <option key={item.id} value={String(item.id)}>
                          {item.name}
                          {item.external_code
                            ? ` — ${item.external_code}`
                            : ""}
                          {item.registration_status
                            ? ` (${item.registration_status})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <input
                    value={cropVariety}
                    onChange={(event) => {
                      setCropVariety(event.target.value);
                      setCropVarietyError("");
                    }}
                    className={`mt-1 w-full rounded-lg border bg-[#071017] px-3 py-2 text-xs text-white ${
                      cropVarietyError
                        ? "border-red-500"
                        : "border-white/[0.10]"
                    }`}
                  />
                )}
                {cropVarietyError && (
                  <span className="mt-1 block text-red-400">
                    {cropVarietyError}
                  </span>
                )}
              </label>
              <label className="text-[9px] text-slate-500">Plocha (ha)<input type="number" value={areaHa} onChange={(event) => { setAreaHa(event.target.value); setAreaError(""); }} className={`mt-1 w-full rounded-lg border bg-[#071017] px-3 py-2 text-xs text-white ${areaError ? "border-red-500" : "border-white/[0.10]"}`} />{areaError && <span className="mt-1 block text-red-400">{areaError}</span>}</label>
              <label className="text-[9px] text-slate-500">Způsob pěstování<select value={farmingMethod} onChange={(event) => setFarmingMethod(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#071017] px-3 py-2 text-xs text-white"><option value="">Vyberte</option><option value="Konvenční">Konvenční</option><option value="Integrované">Integrované</option><option value="Ekologické">Ekologické</option><option value="Jiné">Jiné</option></select></label>
              <label className="text-[9px] text-slate-500">Datum setí / výsadby<input type="date" value={sowingDate} onChange={(event) => setSowingDate(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#071017] px-3 py-2 text-xs text-white" /></label>
              <label className="text-[9px] text-slate-500">Předpokládaná sklizeň<input type="date" value={expectedHarvestDate} onChange={(event) => setExpectedHarvestDate(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#071017] px-3 py-2 text-xs text-white" /></label>
              <label className="text-[9px] text-slate-500">Aktuální růstová fáze<select value={growthStage} onChange={(event) => setGrowthStage(event.target.value)} disabled={!selectedCropProfile} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#071017] px-3 py-2 text-xs text-white disabled:opacity-50"><option value="">Vyberte růstovou fázi</option>{growthStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}</select></label>
              <div className="flex items-end"><button type="button" onClick={saveCropData} disabled={savingCrop} className="w-full rounded-lg bg-cyan-300 py-2.5 text-xs font-black text-slate-950 hover:bg-cyan-200 disabled:opacity-50">{savingCrop ? "Ukládám..." : "💾 Uložit údaje o plodině"}</button></div>
            </div>
          </details>
        </section>
        )}

        {/* 8. PROJECT TIMELINE — no duplicate chart */}
        <section id="project-history" className="mt-3 rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4">
          <div className="flex items-center justify-between gap-3"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">VÝVOJ PROJEKTU</div><h2 className="mt-1 text-base font-black">Historie událostí</h2></div><span className={`text-[9px] font-black ${recommendationTrend.className}`}>{recommendationTrend.icon} {recommendationTrend.label}</span></div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {recentAnalyses.map((item) => <div key={`timeline-analysis-${item.id}`} className="relative rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="flex items-center justify-between gap-2"><span className="text-[8px] text-slate-600">{new Date(item.created_at).toLocaleString("cs-CZ")}</span><span className="rounded-full bg-cyan-300/10 px-2 py-1 text-[7px] font-black text-cyan-300">ANALÝZA</span></div><div className="mt-2 text-[10px] font-bold text-slate-200">Analýza dokončena</div><div className="mt-1 text-[8px] text-slate-500">NDVI {Number(item.ndvi).toFixed(3)} · {item.risk}</div></div>)}
            {recentRecommendations.slice(0, 2).map((item) => <div key={`timeline-rec-${item.id}`} className="relative rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="flex items-center justify-between gap-2"><span className="text-[8px] text-slate-600">{new Date(item.created_at).toLocaleString("cs-CZ")}</span><span className="rounded-full bg-orange-500/10 px-2 py-1 text-[7px] font-black text-orange-400">DOPORUČENÍ</span></div><div className="mt-2 text-[10px] font-bold text-slate-200">Doporučení vytvořeno</div><div className="mt-1 text-[8px] text-slate-500">Priorita {item.priority} · NDVI {item.ndvi != null ? Number(item.ndvi).toFixed(3) : "—"}</div></div>)}
            {recentAnalyses.length === 0 && recentRecommendations.length === 0 && <div className="rounded-lg bg-[#071017] p-4 text-[9px] text-slate-500 md:col-span-2 xl:col-span-4">Zatím nejsou k dispozici historické události.</div>}
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2"><button type="button" onClick={() => document.getElementById("project-history")?.scrollIntoView({ behavior: "smooth" })} className="rounded-lg border border-white/[0.07] py-2 text-[9px] font-bold text-cyan-300">Zobrazit kompletní historii projektu</button>{organizationRole !== "viewer" ? (
            <button type="button" onClick={openCropEditor} className="rounded-lg border border-white/[0.07] py-2 text-[9px] font-bold text-slate-400 hover:text-cyan-300">Upravit projektová data</button>
          ) : (
            <div className="rounded-lg border border-white/[0.07] py-2 text-center text-[9px] font-bold text-slate-600">Pouze pro čtení</div>
          )}</div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2"><div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="text-[9px] font-black uppercase tracking-widest text-cyan-300">Historie doporučení</div><div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto">{recommendationHistory.map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded-md bg-[#050b10] px-2.5 py-2 text-[8px]"><span className="text-slate-500">{new Date(item.created_at).toLocaleDateString("cs-CZ")}</span><span className="text-cyan-300">NDVI {item.ndvi != null ? Number(item.ndvi).toFixed(3) : "—"}</span><span className="font-bold text-slate-300">{item.priority}</span></div>)}</div></div><div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="text-[9px] font-black uppercase tracking-widest text-cyan-300">Historie analýz</div><div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto">{history.map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded-md bg-[#050b10] px-2.5 py-2 text-[8px]"><span className="text-slate-500">{new Date(item.created_at).toLocaleDateString("cs-CZ")}</span><span className="font-bold text-cyan-300">NDVI {Number(item.ndvi).toFixed(3)}</span><span className="font-bold text-slate-300">{item.risk}</span></div>)}</div></div></div>
        </section>
      </div>
    </main>
  );
}