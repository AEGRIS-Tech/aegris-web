"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import ProjectMap from "./ProjectMap";
import AnalysisChart from "./AnalysisChart";
import FieldValidationForm from "./FieldValidationForm";
import AiAgronom from "./AiAgronom";
import { useLanguage } from "../../context/LanguageContext";

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

function getProjectDetailCopy(language: string) {
  const en = {
    invalidProjectId: "Invalid project ID.",
    projectLoadFailed: "Failed to load project.",
    projectNotFound: "Project was not found or you do not have access to it.",
    projectOrganizationInvalid: "The project does not have a valid organization set.",
    permissionCheckFailed: "Failed to verify access to the project.",
    nutritionLoadFailed: "Fertilization inputs could not be loaded.",
    nutritionNumberInvalid: "Nutrition values must be valid numbers.",
    plannedYieldPositive: "Planned yield must be greater than 0.",
    phRange: "pH must be between 0 and 14.",
    phosphorusMethodRequired: "Select the phosphorus determination method (SP or ICP-OES).",
    soilTextureRequired: "Select the soil texture class for K and Mg classification.",
    nutritionSaveFailed: "Fertilization inputs could not be saved.",
    varietyRequired: "VARIETY IS REQUIRED",
    varietyMismatch: "The selected variety does not belong to the selected crop.",
    areaPositive: "Area must be greater than 0.",
    accessDenied: "Access denied",
    noProjectAccess: "You do not have access to this project",
    projectAccessDescription: "The project does not exist or you do not have permission to view it.",
    backToProjects: "Back to projects",
    loadingProject: "Loading project...",
    back: "Back",
    cropNotSpecified: "Crop not specified",
    areaNotSpecified: "Area not specified",
    growthStageNotSpecified: "Growth stage not specified",
    updated: "Updated",
    refreshData: "Refresh data",
    refresh: "Refresh",
    analyzing: "Analyzing…",
    runAnalysis: "Run new analysis",
    projectInformation: "Project information",
    latitude: "Latitude",
    longitude: "Longitude",
    area: "Area",
    growthStage: "Growth stage",
    created: "Created",
    currentVegetation: "Current vegetation status",
    overallAssessment: "Overall assessment",
    analysisUnavailable: "Analysis is not available yet",
    mainReason: "Main reason",
    cropCondition: "CROP CONDITION",
    priority: "Priority",
    previous: "vs. previous",
    lastAnalysis: "Last analysis",
    storedDecisionSnapshot: "AEGRIS is displaying the stored server decision snapshot",
    legacyWeatherSnapshot: "Legacy analysis uses the stored conditions snapshot",
    viewerReadOnly: "Viewer access is read-only.",
    serverAnalysisReady: "Server analysis ready",
    contextualAssessment: "Context assessment",
    contextualScore: "AEGRIS context score",
    criticalFactors: "Critical factors",
    ofFactors: "of",
    criticalFactorsLabel: "critical factors",
    dataConfidence: "Data confidence",
    dataReliability: "DATA RELIABILITY",
    analysisQualityOrigin: "ANALYSIS QUALITY AND ORIGIN",
    analysisMetadata: "Technical metadata of the latest saved Sentinel analysis.",
    validCoverage: "Valid coverage",
    source: "Source",
    spatialResolution: "Spatial resolution",
    crsNotSpecified: "CRS not specified",
    validPixels: "Valid pixels",
    afterMasking: "after cloud / no-data masking",
    qualityGate: "Quality gate",
    minimumPolygonCoverage: "minimum valid polygon coverage",
    acceptedIntervals: "Accepted intervals",
    rejectedIntervals: "Rejected intervals",
    medianNdvi: "Median NDVI",
    provenanceNote: "NDVI is calculated from Sentinel-2 bands B08 and B04. Invalid pixels are filtered using the Scene Classification Layer (SCL) and dataMask. AEGRIS weather comes from a separate weather source and historical evaluation uses the stored snapshot.",
    noQualityMetadata: "This saved analysis does not yet contain quality metadata. Run a new analysis; AEGRIS will then store the actual source, resolution, valid coverage and quality gate directly from the Copernicus result.",
    decisionRecommendation: "DECISION RECOMMENDATION",
    whatIsHappening: "WHAT IS HAPPENING",
    longTermTrend: "LONG-TERM TREND",
    sinceLastAnalysis: "SINCE LAST ANALYSIS",
    whatToDoNow: "WHAT TO DO NOW",
    nextStep: "NEXT STEP",
    projectAlerts: "PROJECT ALERTS",
    unread: "Unread",
    newLabel: "NEW",
    markAsRead: "Mark as read",
    noAlerts: "No alert has been created yet.",
    showAllAlerts: "Show all alerts",
    recommendations: "AEGRIS RECOMMENDATIONS",
    diagnosis: "AEGRIS DIAGNOSTICS",
    probableCauses: "Probable causes of the current risk",
    diagnosisShort: "diag.",
    indicationStrength: "Indication strength",
    noDiagnosis: "No diagnosis is currently identified.",
    keyFactors: "KEY FACTORS",
    inRange: "IN RANGE",
    score: "Score",
    weight: "weight",
    ndviDevelopment: "NDVI DEVELOPMENT",
    trend: "Trend",
    trendWindow: "Trend window",
    stateAndRecommendations: "STATUS AND RECOMMENDATION DEVELOPMENT",
    noRecord: "No record yet.",
    showRecommendationHistory: "Show recommendation history",
    analysisHistory: "ANALYSIS HISTORY",
    weatherConditions: "WEATHER AND CONDITIONS",
    currentLocalConditions: "CURRENT CONDITIONS AT THE LOCATION",
    temperature: "Temperature",
    humidity: "Humidity",
    precipitationLastHour: "Precipitation – last hour",
    wind: "Wind",
    current: "Current",
    loadingWeather: "Loading weather...",
    weatherLoadFailed: "Weather could not be loaded.",
    tempWithinProfile: "Within profile range",
    tempOutsideProfile: "Outside profile range",
    noEvaluation: "Not evaluated",
    nutritionTitle: "AEGRIS AGRONOMY · NUTRITION AND FERTILIZATION",
    nutritionMethodProfile: "CROP NUTRITION METHODOLOGY PROFILE",
    nutritionMethodDescription: "The calculation is based on the ÚKZÚZ methodology. AEGRIS does not display a specific dose when the inputs required for a safe determination are missing.",
    nutritionProfileAvailable: "Nutrition profile available",
    nutritionProfileUnavailable: "Nutrition profile not available",
    closeInputs: "Close inputs",
    completeInputs: "✎ Complete inputs",
    loadingNutrition: "Loading nutrition profile…",
    plannedYield: "Planned yield",
    lowYield: "Low yield level",
    mediumYield: "Medium yield level",
    highYield: "High yield level",
    neededForNutrition: "Required for nutrition calculation",
    nitrogen: "Nitrogen N",
    base: "Base",
    minimum: "minimum",
    plannedYieldMissing: "Planned yield is missing.",
    phosphorus: "Phosphorus P₂O₅",
    potassium: "Potassium K₂O",
    magnesium: "Magnesium MgO",
    methodNotSpecified: "method not specified",
    missingP: "Soil P analysis is missing.",
    missingK: "Soil K analysis is missing.",
    missingMg: "Soil Mg analysis is missing.",
    methodologySource: "Methodology source",
    soilSupplyClassification: "Soil nutrient supply classification",
    soilTexture: "Soil texture",
    phosphorusMethod: "P method",
    notSpecifiedMasculine: "not specified",
    notSpecifiedFeminine: "not specified",
    kmgRatio: "K : Mg ratio",
    kCoefficient: "K coefficient",
    kmgNeedBoth: "Both K and Mg must be entered for the correction.",
    nitrogenCorrection: "N correction",
    predecessor: "Predecessor crop",
    noAppliedCorrection: "no correction applied",
    organicFertilization: "Organic fertilization",
    noAppliedDeduction: "no deduction applied",
    nminStoredNote: "stored as a refinement value, not automatically deducted",
    frameworkNitrogenSplit: "Framework nitrogen split",
    doseCannotCalculate: "dose cannot be calculated",
    noNitrogenSplit: "No N split is available in the database for this crop.",
    addYieldForNitrogen: "Enter the planned yield for a specific nitrogen recommendation. AEGRIS does not estimate the dose without this input.",
    nutritionInputs: "Nutrition calculation inputs",
    plannedYieldUnit: "Planned yield (t/ha)",
    soilTextureForKMg: "Soil texture for K / Mg",
    select: "Select",
    lightSoil: "Light soil",
    mediumSoil: "Medium soil",
    heavySoil: "Heavy soil",
    phosphorusDetermination: "P determination method",
    soilP: "Soil P (mg/kg)",
    soilK: "Soil K (mg/kg)",
    soilMg: "Soil Mg (mg/kg)",
    soilPh: "Soil pH",
    predecessorCrop: "Predecessor crop",
    predecessorExample: "e.g. clover",
    predecessorGroup: "Predecessor group",
    noCorrectionOther: "No correction / other",
    clovers: "Clovers",
    legumes: "Legumes",
    organicFertilizer: "Organic fertilizer",
    noDeduction: "No deduction",
    manure: "Manure",
    slurry: "Liquid manure",
    liquidManure: "Slurry",
    slurryType: "Slurry type",
    cattle: "Cattle",
    pigs: "Pigs",
    poultry: "Poultry",
    organicRate: "Organic fertilizer rate (t/ha)",
    applicationPeriod: "Application period",
    organicNYear: "Year of organic N effect",
    firstYear: "1st year",
    secondYear: "2nd year",
    dataSource: "Data source",
    dataSourcePlaceholder: "e.g. soil test 2026 / laboratory analysis",
    note: "Note",
    saving: "Saving…",
    saveNutritionInputs: "💾 Save nutrition inputs",
    projectDetails: "PROJECT DETAILS",
    crop: "Crop",
    variety: "Variety",
    sowingDate: "Sowing date",
    expectedHarvest: "Expected harvest",
    farmingMethod: "Farming method",
    editCropData: "✎ Edit crop data",
    cropProfile: "CROP PROFILE",
    profileNotEvaluated: "Profile not evaluated",
    moisture: "Moisture",
    soilPH: "Soil pH",
    waterNeed: "Water need",
    notSpecified: "Not specified",
    stage: "Stage",
    waterStress: "Water stress",
    projectLocation: "PROJECT LOCATION",
    cropDataEditing: "EDIT CROP DATA",
    cultivatedCrop: "Cultivated crop",
    originalValue: "Original value",
    selectCropUkzuz: "Select crop from ÚKZÚZ",
    noAgronomicProfile: "No agronomic profile is assigned to this official crop yet.",
    loadingVarieties: "Loading ÚKZÚZ varieties...",
    selectVarietyUkzuz: "Select variety from ÚKZÚZ",
    noActiveVarieties: "No active varieties are available for this crop",
    areaHa: "Area (ha)",
    farmingMethodLabel: "Farming method",
    conventional: "Conventional",
    integrated: "Integrated",
    organic: "Organic",
    other: "Other",
    sowingPlantingDate: "Sowing / planting date",
    expectedHarvestDate: "Expected harvest",
    currentGrowthStage: "Current growth stage",
    selectGrowthStage: "Select growth stage",
    saveCropData: "💾 Save crop data",
    projectDevelopment: "PROJECT DEVELOPMENT",
    eventHistory: "Event history",
    analysisLabel: "ANALYSIS",
    analysisCompleted: "Analysis completed",
    recommendationLabel: "RECOMMENDATION",
    recommendationCreated: "Recommendation created",
    noHistoricalEvents: "No historical events are available yet.",
    showCompleteProjectHistory: "Show complete project history",
    editProjectData: "Edit project data",
    readOnly: "Read only",
    recommendationHistory: "Recommendation history",
    trendWorsening: "Development is worsening",
    trendImproving: "Crop condition is improving",
    trendStable: "Development is stable",
    trendInsufficient: "Insufficient historical data",
    longTermDecline: "Long-term decline in crop activity",
    trendRising: "Rising",
    trendFalling: "Falling",
    trendStableShort: "Stable",
    trendWindowInsufficient: "insufficient data",
    noMajorRiskFactor: "No significant risk factor",
    strengthVeryStrong: "Very strong",
    strengthStrong: "Strong",
    strengthMedium: "Medium",
    strengthWeak: "Weak",
    supplyLow: "low",
    supplySatisfactory: "satisfactory",
    supplyGood: "good",
    supplyHigh: "high",
    supplyVeryHigh: "very high",
  };
  const cs = {
    invalidProjectId: "Neplatné ID projektu.",
    projectLoadFailed: "Projekt se nepodařilo načíst.",
    projectNotFound: "Projekt nebyl nalezen nebo k němu nemáte přístup.",
    projectOrganizationInvalid: "Projekt nemá správně nastavenou organizaci.",
    permissionCheckFailed: "Nepodařilo se ověřit oprávnění k projektu.",
    nutritionLoadFailed: "Vstupy pro hnojení se nepodařilo načíst.",
    nutritionNumberInvalid: "Číselné hodnoty výživy musí být zadané jako platná čísla.",
    plannedYieldPositive: "Plánovaný výnos musí být větší než 0.",
    phRange: "pH musí být v rozsahu 0 až 14.",
    phosphorusMethodRequired: "Pro klasifikaci fosforu vyberte metodu stanovení P (SP nebo ICP-OES).",
    soilTextureRequired: "Pro klasifikaci K a Mg vyberte půdní druh (lehká / střední / těžká).",
    nutritionSaveFailed: "Vstupy pro hnojení se nepodařilo uložit.",
    varietyRequired: "ODRŮDA JE POVINNÁ",
    varietyMismatch: "Vybraná odrůda nepatří k vybrané plodině.",
    areaPositive: "Výměra musí být větší než 0.",
    accessDenied: "Přístup zamítnut",
    noProjectAccess: "K tomuto projektu nemáte přístup",
    projectAccessDescription: "Projekt neexistuje nebo nemáte oprávnění k jeho zobrazení.",
    backToProjects: "Zpět na projekty",
    loadingProject: "Načítám projekt...",
    back: "Zpět",
    cropNotSpecified: "Plodina neuvedena",
    areaNotSpecified: "Výměra neuvedena",
    growthStageNotSpecified: "Růstová fáze neuvedena",
    updated: "Aktualizováno",
    refreshData: "Obnovit data",
    refresh: "Obnovit",
    analyzing: "Analyzuji…",
    runAnalysis: "Spustit novou analýzu",
    projectInformation: "Informace o projektu",
    latitude: "Šířka",
    longitude: "Délka",
    area: "Plocha",
    growthStage: "Růstová fáze",
    created: "Založeno",
    currentVegetation: "Aktuální stav vegetace",
    overallAssessment: "Celkové hodnocení",
    analysisUnavailable: "Analýza zatím není k dispozici",
    mainReason: "Hlavní důvod",
    cropCondition: "KONDICE POROSTU",
    priority: "Priorita",
    previous: "vs. předchozí",
    lastAnalysis: "Poslední analýza",
    storedDecisionSnapshot: "AEGRIS zobrazuje uložený serverový decision snapshot",
    legacyWeatherSnapshot: "Legacy analýza používá uložený snapshot podmínek",
    viewerReadOnly: "Viewer má přístup pouze pro čtení.",
    serverAnalysisReady: "Serverová analýza připravena",
    contextualAssessment: "Kontextové hodnocení",
    contextualScore: "AEGRIS kontextové skóre",
    criticalFactors: "Kritické faktory",
    ofFactors: "z",
    criticalFactorsLabel: "kritických faktorů",
    dataConfidence: "Datová jistota",
    dataReliability: "DATOVÁ DŮVĚRYHODNOST",
    analysisQualityOrigin: "KVALITA A PŮVOD ANALÝZY",
    analysisMetadata: "Technická metadata poslední uložené Sentinel analýzy.",
    validCoverage: "Validní pokrytí",
    source: "Zdroj",
    spatialResolution: "Prostorové rozlišení",
    crsNotSpecified: "CRS neuvedeno",
    validPixels: "Validní pixely",
    afterMasking: "po cloud / no-data maskování",
    qualityGate: "Quality gate",
    minimumPolygonCoverage: "minimální validní pokrytí polygonu",
    acceptedIntervals: "Přijaté intervaly",
    rejectedIntervals: "Odmítnuté intervaly",
    medianNdvi: "Medián NDVI",
    provenanceNote: "NDVI je počítáno ze Sentinel-2 pásem B08 a B04. Neplatné pixely jsou odfiltrovány pomocí Scene Classification Layer (SCL) a dataMask. Počasí v AEGRIS pochází ze samostatného weather zdroje a historické vyhodnocení používá uložený snapshot.",
    noQualityMetadata: "Tato uložená analýza ještě neobsahuje metadata kvality. Spusťte novou analýzu; AEGRIS poté uloží skutečný zdroj, rozlišení, validní pokrytí a quality gate přímo z Copernicus výsledku.",
    decisionRecommendation: "ROZHODOVACÍ DOPORUČENÍ",
    whatIsHappening: "CO SE DĚJE",
    longTermTrend: "DLOUHODOBÝ TREND",
    sinceLastAnalysis: "OD POSLEDNÍ ANALÝZY",
    whatToDoNow: "CO UDĚLAT NYNÍ",
    nextStep: "DALŠÍ KROK",
    projectAlerts: "UPOZORNĚNÍ PROJEKTU",
    unread: "Nepřečtené",
    newLabel: "NOVÉ",
    markAsRead: "Označit jako přečtené",
    noAlerts: "Zatím nebyl vytvořen žádný alert.",
    showAllAlerts: "Zobrazit všechna upozornění",
    recommendations: "AEGRIS DOPORUČENÍ",
    diagnosis: "AEGRIS DIAGNOSTIKA",
    probableCauses: "Pravděpodobné příčiny aktuálního rizika",
    diagnosisShort: "diagn.",
    indicationStrength: "Síla indikace",
    noDiagnosis: "Bez aktuálně identifikované diagnózy.",
    keyFactors: "KLÍČOVÉ FAKTORY",
    inRange: "V NORMĚ",
    score: "Skóre",
    weight: "váha",
    ndviDevelopment: "VÝVOJ NDVI",
    trend: "Trend",
    trendWindow: "Trendové okno",
    stateAndRecommendations: "VÝVOJ STAVU A DOPORUČENÍ",
    noRecord: "Zatím žádný záznam.",
    showRecommendationHistory: "Zobrazit historii doporučení",
    analysisHistory: "HISTORIE ANALÝZ",
    weatherConditions: "POČASÍ A PODMÍNKY",
    currentLocalConditions: "AKTUÁLNÍ PODMÍNKY V LOKALITĚ",
    temperature: "Teplota",
    humidity: "Vlhkost",
    precipitationLastHour: "Srážky – poslední hodina",
    wind: "Vítr",
    current: "Aktuální",
    loadingWeather: "Načítám počasí...",
    weatherLoadFailed: "Počasí se nepodařilo načíst.",
    tempWithinProfile: "V rozsahu profilu",
    tempOutsideProfile: "Mimo rozsah profilu",
    noEvaluation: "Bez vyhodnocení",
    nutritionTitle: "AEGRIS AGRONOMY · VÝŽIVA A HNOJENÍ",
    nutritionMethodProfile: "METODICKÝ PROFIL VÝŽIVY PLODINY",
    nutritionMethodDescription: "Výpočet vychází z metodiky ÚKZÚZ. AEGRIS nezobrazuje konkrétní dávku tam, kde chybí vstupy potřebné pro její bezpečné stanovení.",
    nutritionProfileAvailable: "Výživový profil dostupný",
    nutritionProfileUnavailable: "Výživový profil není dostupný",
    closeInputs: "Zavřít vstupy",
    completeInputs: "✎ Doplnit vstupy",
    loadingNutrition: "Načítám výživový profil…",
    plannedYield: "Plánovaný výnos",
    lowYield: "Nízká výnosová úroveň",
    mediumYield: "Střední výnosová úroveň",
    highYield: "Vysoká výnosová úroveň",
    neededForNutrition: "Nutné pro výpočet výživy",
    nitrogen: "Dusík N",
    base: "Základ",
    minimum: "minimum",
    plannedYieldMissing: "Chybí plánovaný výnos.",
    phosphorus: "Fosfor P₂O₅",
    potassium: "Draslík K₂O",
    magnesium: "Hořčík MgO",
    methodNotSpecified: "metoda neuvedena",
    missingP: "Chybí půdní rozbor P.",
    missingK: "Chybí půdní rozbor K.",
    missingMg: "Chybí půdní rozbor Mg.",
    methodologySource: "Zdroj metodiky",
    soilSupplyClassification: "Klasifikace půdní zásobenosti",
    soilTexture: "Půdní druh",
    phosphorusMethod: "Metoda P",
    notSpecifiedMasculine: "neuveden",
    notSpecifiedFeminine: "neuvedena",
    kmgRatio: "Poměr K : Mg",
    kCoefficient: "Koeficient K",
    kmgNeedBoth: "Pro korekci je nutné zadat K i Mg.",
    nitrogenCorrection: "Korekce N",
    predecessor: "Předplodina",
    noAppliedCorrection: "bez započtené korekce",
    organicFertilization: "Organické hnojení",
    noAppliedDeduction: "bez započteného odpočtu",
    nminStoredNote: "uložen jako zpřesňující údaj, není automaticky odečítán",
    frameworkNitrogenSplit: "Rámcové dělení dusíku",
    doseCannotCalculate: "dávku nelze vyčíslit",
    noNitrogenSplit: "Pro tuto plodinu není dělení N v databázi dostupné.",
    addYieldForNitrogen: "Pro konkrétní doporučení dusíku doplňte plánovaný výnos. AEGRIS bez tohoto vstupu dávku neodhaduje.",
    nutritionInputs: "Vstupy pro výpočet výživy",
    plannedYieldUnit: "Plánovaný výnos (t/ha)",
    soilTextureForKMg: "Půdní druh pro K / Mg",
    select: "Vyberte",
    lightSoil: "Lehká půda",
    mediumSoil: "Střední půda",
    heavySoil: "Těžká půda",
    phosphorusDetermination: "Metoda stanovení P",
    soilP: "P v půdě (mg/kg)",
    soilK: "K v půdě (mg/kg)",
    soilMg: "Mg v půdě (mg/kg)",
    soilPh: "pH půdy",
    predecessorCrop: "Předplodina",
    predecessorExample: "např. jetel",
    predecessorGroup: "Skupina předplodiny",
    noCorrectionOther: "Bez korekce / jiná",
    clovers: "Jeteloviny",
    legumes: "Luskoviny",
    organicFertilizer: "Organické hnojivo",
    noDeduction: "Bez odpočtu",
    manure: "Hnůj",
    slurry: "Močůvka",
    liquidManure: "Kejda",
    slurryType: "Druh kejdy",
    cattle: "Skot",
    pigs: "Prasata",
    poultry: "Drůbež",
    organicRate: "Dávka organického hnojiva (t/ha)",
    applicationPeriod: "Období aplikace",
    organicNYear: "Rok účinku organického N",
    firstYear: "1. rok",
    secondYear: "2. rok",
    dataSource: "Zdroj údajů",
    dataSourcePlaceholder: "např. AZP 2026 / laboratorní rozbor",
    note: "Poznámka",
    saving: "Ukládám…",
    saveNutritionInputs: "💾 Uložit vstupy výživy",
    projectDetails: "DETAILY PROJEKTU",
    crop: "Plodina",
    variety: "Odrůda",
    sowingDate: "Datum setí",
    expectedHarvest: "Očekávaná sklizeň",
    farmingMethod: "Způsob pěstování",
    editCropData: "✎ Upravit údaje o plodině",
    cropProfile: "PROFIL PLODINY",
    profileNotEvaluated: "Profil není vyhodnocen",
    moisture: "Vlhkost",
    soilPH: "pH půdy",
    waterNeed: "Potřeba vody",
    notSpecified: "Neuvedeno",
    stage: "Fáze",
    waterStress: "Vodní stres",
    projectLocation: "LOKALITA PROJEKTU",
    cropDataEditing: "EDITACE ÚDAJŮ O PLODINĚ",
    cultivatedCrop: "Pěstovaná plodina",
    originalValue: "Původní hodnota",
    selectCropUkzuz: "Vyberte plodinu z ÚKZÚZ",
    noAgronomicProfile: "Pro tuto oficiální plodinu zatím není přiřazen agronomický profil.",
    loadingVarieties: "Načítám odrůdy ÚKZÚZ...",
    selectVarietyUkzuz: "Vyberte odrůdu z ÚKZÚZ",
    noActiveVarieties: "Pro tuto plodinu nejsou dostupné aktivní odrůdy",
    areaHa: "Plocha (ha)",
    farmingMethodLabel: "Způsob pěstování",
    conventional: "Konvenční",
    integrated: "Integrované",
    organic: "Ekologické",
    other: "Jiné",
    sowingPlantingDate: "Datum setí / výsadby",
    expectedHarvestDate: "Předpokládaná sklizeň",
    currentGrowthStage: "Aktuální růstová fáze",
    selectGrowthStage: "Vyberte růstovou fázi",
    saveCropData: "💾 Uložit údaje o plodině",
    projectDevelopment: "VÝVOJ PROJEKTU",
    eventHistory: "Historie událostí",
    analysisLabel: "ANALÝZA",
    analysisCompleted: "Analýza dokončena",
    recommendationLabel: "DOPORUČENÍ",
    recommendationCreated: "Doporučení vytvořeno",
    noHistoricalEvents: "Zatím nejsou k dispozici historické události.",
    showCompleteProjectHistory: "Zobrazit kompletní historii projektu",
    editProjectData: "Upravit projektová data",
    readOnly: "Pouze pro čtení",
    recommendationHistory: "Historie doporučení",
    trendWorsening: "Vývoj se zhoršuje",
    trendImproving: "Porost se zlepšuje",
    trendStable: "Vývoj je stabilní",
    trendInsufficient: "Nedostatek historických dat",
    longTermDecline: "Dlouhodobě klesající aktivita porostu",
    trendRising: "Rostoucí",
    trendFalling: "Klesající",
    trendStableShort: "Stabilní",
    trendWindowInsufficient: "nedostatek dat",
    noMajorRiskFactor: "Bez výrazného rizikového faktoru",
    strengthVeryStrong: "Velmi silná",
    strengthStrong: "Silná",
    strengthMedium: "Střední",
    strengthWeak: "Slabá",
    supplyLow: "nízká",
    supplySatisfactory: "vyhovující",
    supplyGood: "dobrá",
    supplyHigh: "vysoká",
    supplyVeryHigh: "velmi vysoká",
  };
  const sk = {
    invalidProjectId: "Neplatné ID projektu.",
    projectLoadFailed: "Projekt sa nepodarilo načítať.",
    projectNotFound: "Projekt sa nenašiel alebo k nemu nemáte prístup.",
    projectOrganizationInvalid: "Projekt nemá nastavenú platnú organizáciu.",
    permissionCheckFailed: "Nepodarilo sa overiť prístup k projektu.",
    nutritionLoadFailed: "Vstupy pre hnojenie sa nepodarilo načítať.",
    nutritionNumberInvalid: "Hodnoty výživy musia byť platné čísla.",
    plannedYieldPositive: "Plánovaný výnos musí byť väčší ako 0.",
    phRange: "pH musí byť v rozsahu 0 až 14.",
    phosphorusMethodRequired: "Vyberte metódu stanovenia fosforu (SP alebo ICP-OES).",
    soilTextureRequired: "Vyberte pôdny druh pre klasifikáciu K a Mg.",
    nutritionSaveFailed: "Vstupy pre hnojenie sa nepodarilo uložiť.",
    varietyRequired: "ODRODA JE POVINNÁ",
    varietyMismatch: "Vybraná odroda nepatrí k vybranej plodine.",
    areaPositive: "Výmera musí byť väčšia ako 0.",
    accessDenied: "Prístup zamietnutý",
    noProjectAccess: "K tomuto projektu nemáte prístup",
    projectAccessDescription: "Projekt neexistuje alebo nemáte oprávnenie na jeho zobrazenie.",
    backToProjects: "Späť na projekty",
    loadingProject: "Načítavam projekt...",
    back: "Späť",
    cropNotSpecified: "Plodina neuvedená",
    areaNotSpecified: "Výmera neuvedená",
    growthStageNotSpecified: "Rastová fáza neuvedená",
    updated: "Aktualizované",
    refreshData: "Obnoviť údaje",
    refresh: "Obnoviť",
    analyzing: "Analyzujem…",
    runAnalysis: "Spustiť novú analýzu",
    projectInformation: "Informácie o projekte",
    latitude: "Zemepisná šírka",
    longitude: "Zemepisná dĺžka",
    area: "Výmera",
    growthStage: "Rastová fáza",
    created: "Vytvorené",
    currentVegetation: "Aktuálny stav vegetácie",
    overallAssessment: "Celkové hodnotenie",
    analysisUnavailable: "Analýza zatiaľ nie je dostupná",
    mainReason: "Hlavný dôvod",
    cropCondition: "KONDÍCIA PORASTU",
    priority: "Priorita",
    previous: "oproti predchádzajúcej",
    lastAnalysis: "Posledná analýza",
    storedDecisionSnapshot: "AEGRIS zobrazuje uložený serverový decision snapshot",
    legacyWeatherSnapshot: "Staršia analýza používa uložený snapshot podmienok",
    viewerReadOnly: "Prístup diváka je len na čítanie.",
    serverAnalysisReady: "Serverová analýza pripravená",
    contextualAssessment: "Kontextové hodnotenie",
    contextualScore: "Kontextové skóre AEGRIS",
    criticalFactors: "Kritické faktory",
    ofFactors: "z",
    criticalFactorsLabel: "kritických faktorov",
    dataConfidence: "Dôvera v údaje",
    dataReliability: "DÔVERYHODNOSŤ ÚDAJOV",
    analysisQualityOrigin: "KVALITA A PÔVOD ANALÝZY",
    analysisMetadata: "Technické metadáta poslednej uloženej analýzy Sentinel.",
    validCoverage: "Platné pokrytie",
    source: "Zdroj",
    spatialResolution: "Priestorové rozlíšenie",
    crsNotSpecified: "CRS neuvedené",
    validPixels: "Platné pixely",
    afterMasking: "po maskovaní oblakov / no-data",
    qualityGate: "Quality gate",
    minimumPolygonCoverage: "minimálne platné pokrytie polygónu",
    acceptedIntervals: "Prijaté intervaly",
    rejectedIntervals: "Odmietnuté intervaly",
    medianNdvi: "Medián NDVI",
    provenanceNote: "NDVI sa počíta z pásiem Sentinel-2 B08 a B04. Neplatné pixely sa filtrujú pomocou Scene Classification Layer (SCL) a dataMask. Počasie v AEGRIS pochádza zo samostatného zdroja a historické hodnotenie používa uložený snapshot.",
    noQualityMetadata: "Táto uložená analýza zatiaľ neobsahuje metadáta kvality. Spustite novú analýzu; AEGRIS potom uloží skutočný zdroj, rozlíšenie, platné pokrytie a quality gate priamo z výsledku Copernicus.",
    decisionRecommendation: "ROZHODOVACIE ODPORÚČANIE",
    whatIsHappening: "ČO SA DEJE",
    longTermTrend: "DLHODOBÝ TREND",
    sinceLastAnalysis: "OD POSLEDNEJ ANALÝZY",
    whatToDoNow: "ČO UROBIŤ TERAZ",
    nextStep: "ĎALŠÍ KROK",
    projectAlerts: "UPOZORNENIA PROJEKTU",
    unread: "Neprečítané",
    newLabel: "NOVÉ",
    markAsRead: "Označiť ako prečítané",
    noAlerts: "Zatiaľ nebolo vytvorené žiadne upozornenie.",
    showAllAlerts: "Zobraziť všetky upozornenia",
    recommendations: "ODPORÚČANIA AEGRIS",
    diagnosis: "DIAGNOSTIKA AEGRIS",
    probableCauses: "Pravdepodobné príčiny aktuálneho rizika",
    diagnosisShort: "diagn.",
    indicationStrength: "Sila indikácie",
    noDiagnosis: "Aktuálne nie je identifikovaná žiadna diagnóza.",
    keyFactors: "KĽÚČOVÉ FAKTORY",
    inRange: "V NORME",
    score: "Skóre",
    weight: "váha",
    ndviDevelopment: "VÝVOJ NDVI",
    trend: "Trend",
    trendWindow: "Trendové okno",
    stateAndRecommendations: "VÝVOJ STAVU A ODPORÚČANÍ",
    noRecord: "Zatiaľ žiadny záznam.",
    showRecommendationHistory: "Zobraziť históriu odporúčaní",
    analysisHistory: "HISTÓRIA ANALÝZ",
    weatherConditions: "POČASIE A PODMIENKY",
    currentLocalConditions: "AKTUÁLNE PODMIENKY V LOKALITE",
    temperature: "Teplota",
    humidity: "Vlhkosť",
    precipitationLastHour: "Zrážky – posledná hodina",
    wind: "Vietor",
    current: "Aktuálne",
    loadingWeather: "Načítavam počasie...",
    weatherLoadFailed: "Počasie sa nepodarilo načítať.",
    tempWithinProfile: "V rozsahu profilu",
    tempOutsideProfile: "Mimo rozsahu profilu",
    noEvaluation: "Bez vyhodnotenia",
    nutritionTitle: "AEGRIS AGRONOMY · VÝŽIVA A HNOJENIE",
    nutritionMethodProfile: "METODICKÝ PROFIL VÝŽIVY PLODINY",
    nutritionMethodDescription: "Výpočet vychádza z metodiky ÚKZÚZ. AEGRIS nezobrazuje konkrétnu dávku tam, kde chýbajú vstupy potrebné na jej bezpečné stanovenie.",
    nutritionProfileAvailable: "Výživový profil dostupný",
    nutritionProfileUnavailable: "Výživový profil nie je dostupný",
    closeInputs: "Zavrieť vstupy",
    completeInputs: "✎ Doplniť vstupy",
    loadingNutrition: "Načítavam výživový profil…",
    plannedYield: "Plánovaný výnos",
    lowYield: "Nízka výnosová úroveň",
    mediumYield: "Stredná výnosová úroveň",
    highYield: "Vysoká výnosová úroveň",
    neededForNutrition: "Potrebné pre výpočet výživy",
    nitrogen: "Dusík N",
    base: "Základ",
    minimum: "minimum",
    plannedYieldMissing: "Chýba plánovaný výnos.",
    phosphorus: "Fosfor P₂O₅",
    potassium: "Draslík K₂O",
    magnesium: "Horčík MgO",
    methodNotSpecified: "metóda neuvedená",
    missingP: "Chýba pôdny rozbor P.",
    missingK: "Chýba pôdny rozbor K.",
    missingMg: "Chýba pôdny rozbor Mg.",
    methodologySource: "Zdroj metodiky",
    soilSupplyClassification: "Klasifikácia zásobenosti pôdy živinami",
    soilTexture: "Pôdny druh",
    phosphorusMethod: "Metóda P",
    notSpecifiedMasculine: "neuvedené",
    notSpecifiedFeminine: "neuvedené",
    kmgRatio: "Pomer K : Mg",
    kCoefficient: "Koeficient K",
    kmgNeedBoth: "Na korekciu je potrebné zadať K aj Mg.",
    nitrogenCorrection: "Korekcia N",
    predecessor: "Predplodina",
    noAppliedCorrection: "bez započítanej korekcie",
    organicFertilization: "Organické hnojenie",
    noAppliedDeduction: "bez započítaného odpočtu",
    nminStoredNote: "uložené ako spresňujúci údaj, automaticky sa neodpočítava",
    frameworkNitrogenSplit: "Rámcové delenie dusíka",
    doseCannotCalculate: "dávku nemožno vypočítať",
    noNitrogenSplit: "Pre túto plodinu nie je delenie N v databáze dostupné.",
    addYieldForNitrogen: "Pre konkrétne odporúčanie dusíka zadajte plánovaný výnos. AEGRIS bez tohto vstupu dávku neodhaduje.",
    nutritionInputs: "Vstupy pre výpočet výživy",
    plannedYieldUnit: "Plánovaný výnos (t/ha)",
    soilTextureForKMg: "Pôdny druh pre K / Mg",
    select: "Vyberte",
    lightSoil: "Ľahká pôda",
    mediumSoil: "Stredná pôda",
    heavySoil: "Ťažká pôda",
    phosphorusDetermination: "Metóda stanovenia P",
    soilP: "P v pôde (mg/kg)",
    soilK: "K v pôde (mg/kg)",
    soilMg: "Mg v pôde (mg/kg)",
    soilPh: "pH pôdy",
    predecessorCrop: "Predplodina",
    predecessorExample: "napr. ďatelina",
    predecessorGroup: "Skupina predplodiny",
    noCorrectionOther: "Bez korekcie / iné",
    clovers: "Ďatelinoviny",
    legumes: "Strukoviny",
    organicFertilizer: "Organické hnojivo",
    noDeduction: "Bez odpočtu",
    manure: "Hnoj",
    slurry: "Močovka",
    liquidManure: "Hnojovica",
    slurryType: "Druh hnojovice",
    cattle: "Hovädzí dobytok",
    pigs: "Ošípané",
    poultry: "Hydina",
    organicRate: "Dávka organického hnojiva (t/ha)",
    applicationPeriod: "Obdobie aplikácie",
    organicNYear: "Rok účinku organického N",
    firstYear: "1. rok",
    secondYear: "2. rok",
    dataSource: "Zdroj údajov",
    dataSourcePlaceholder: "napr. pôdny rozbor 2026 / laboratórna analýza",
    note: "Poznámka",
    saving: "Ukladám…",
    saveNutritionInputs: "💾 Uložiť vstupy výživy",
    projectDetails: "DETAILY PROJEKTU",
    crop: "Plodina",
    variety: "Odroda",
    sowingDate: "Dátum sejby",
    expectedHarvest: "Očakávaná úroda",
    farmingMethod: "Spôsob pestovania",
    editCropData: "✎ Upraviť údaje o plodine",
    cropProfile: "PROFIL PLODINY",
    profileNotEvaluated: "Profil nie je vyhodnotený",
    moisture: "Vlhkosť",
    soilPH: "pH pôdy",
    waterNeed: "Potreba vody",
    notSpecified: "Neuvedené",
    stage: "Fáza",
    waterStress: "Vodný stres",
    projectLocation: "LOKALITA PROJEKTU",
    cropDataEditing: "ÚPRAVA ÚDAJOV O PLODINE",
    cultivatedCrop: "Pestovaná plodina",
    originalValue: "Pôvodná hodnota",
    selectCropUkzuz: "Vyberte plodinu z ÚKZÚZ",
    noAgronomicProfile: "K tejto oficiálnej plodine zatiaľ nie je priradený agronomický profil.",
    loadingVarieties: "Načítavam odrody ÚKZÚZ...",
    selectVarietyUkzuz: "Vyberte odrodu z ÚKZÚZ",
    noActiveVarieties: "Pre túto plodinu nie sú dostupné aktívne odrody",
    areaHa: "Výmera (ha)",
    farmingMethodLabel: "Spôsob pestovania",
    conventional: "Konvenčné",
    integrated: "Integrované",
    organic: "Ekologické",
    other: "Iné",
    sowingPlantingDate: "Dátum sejby / výsadby",
    expectedHarvestDate: "Predpokladaná úroda",
    currentGrowthStage: "Aktuálna rastová fáza",
    selectGrowthStage: "Vyberte rastovú fázu",
    saveCropData: "💾 Uložiť údaje o plodine",
    projectDevelopment: "VÝVOJ PROJEKTU",
    eventHistory: "História udalostí",
    analysisLabel: "ANALÝZA",
    analysisCompleted: "Analýza dokončená",
    recommendationLabel: "ODPORÚČANIE",
    recommendationCreated: "Odporúčanie vytvorené",
    noHistoricalEvents: "Zatiaľ nie sú dostupné historické udalosti.",
    showCompleteProjectHistory: "Zobraziť kompletnú históriu projektu",
    editProjectData: "Upraviť údaje projektu",
    readOnly: "Len na čítanie",
    recommendationHistory: "História odporúčaní",
    trendWorsening: "Vývoj sa zhoršuje",
    trendImproving: "Stav porastu sa zlepšuje",
    trendStable: "Vývoj je stabilný",
    trendInsufficient: "Nedostatok historických údajov",
    longTermDecline: "Dlhodobý pokles aktivity porastu",
    trendRising: "Rastúci",
    trendFalling: "Klesajúci",
    trendStableShort: "Stabilný",
    trendWindowInsufficient: "nedostatok údajov",
    noMajorRiskFactor: "Bez výrazného rizikového faktora",
    strengthVeryStrong: "Veľmi silná",
    strengthStrong: "Silná",
    strengthMedium: "Stredná",
    strengthWeak: "Slabá",
    supplyLow: "nízka",
    supplySatisfactory: "vyhovujúca",
    supplyGood: "dobrá",
    supplyHigh: "vysoká",
    supplyVeryHigh: "veľmi vysoká",
  };
  const de = {
    invalidProjectId: "Ungültige Projekt-ID.",
    projectLoadFailed: "Projekt konnte nicht geladen werden.",
    projectNotFound: "Projekt wurde nicht gefunden oder Sie haben keinen Zugriff darauf.",
    projectOrganizationInvalid: "Für das Projekt ist keine gültige Organisation festgelegt.",
    permissionCheckFailed: "Der Zugriff auf das Projekt konnte nicht überprüft werden.",
    nutritionLoadFailed: "Düngungseingaben konnten nicht geladen werden.",
    nutritionNumberInvalid: "Nährstoffwerte müssen gültige Zahlen sein.",
    plannedYieldPositive: "Der geplante Ertrag muss größer als 0 sein.",
    phRange: "Der pH-Wert muss zwischen 0 und 14 liegen.",
    phosphorusMethodRequired: "Wählen Sie die Methode zur Phosphorbestimmung (SP oder ICP-OES).",
    soilTextureRequired: "Wählen Sie die Bodenart für die K- und Mg-Klassifizierung.",
    nutritionSaveFailed: "Düngungseingaben konnten nicht gespeichert werden.",
    varietyRequired: "SORTE IST ERFORDERLICH",
    varietyMismatch: "Die ausgewählte Sorte gehört nicht zur ausgewählten Kultur.",
    areaPositive: "Die Fläche muss größer als 0 sein.",
    accessDenied: "Zugriff verweigert",
    noProjectAccess: "Sie haben keinen Zugriff auf dieses Projekt",
    projectAccessDescription: "Das Projekt existiert nicht oder Sie haben keine Berechtigung, es anzuzeigen.",
    backToProjects: "Zurück zu Projekten",
    loadingProject: "Projekt wird geladen...",
    back: "Zurück",
    cropNotSpecified: "Kultur nicht angegeben",
    areaNotSpecified: "Fläche nicht angegeben",
    growthStageNotSpecified: "Wachstumsstadium nicht angegeben",
    updated: "Aktualisiert",
    refreshData: "Daten aktualisieren",
    refresh: "Aktualisieren",
    analyzing: "Analyse läuft…",
    runAnalysis: "Neue Analyse starten",
    projectInformation: "Projektinformationen",
    latitude: "Breitengrad",
    longitude: "Längengrad",
    area: "Fläche",
    growthStage: "Wachstumsstadium",
    created: "Erstellt",
    currentVegetation: "Aktueller Vegetationszustand",
    overallAssessment: "Gesamtbewertung",
    analysisUnavailable: "Analyse ist noch nicht verfügbar",
    mainReason: "Hauptgrund",
    cropCondition: "BESTANDSZUSTAND",
    priority: "Priorität",
    previous: "ggü. vorher",
    lastAnalysis: "Letzte Analyse",
    storedDecisionSnapshot: "AEGRIS zeigt den gespeicherten serverseitigen Decision-Snapshot an",
    legacyWeatherSnapshot: "Legacy-Analyse verwendet den gespeicherten Bedingungs-Snapshot",
    viewerReadOnly: "Viewer-Zugriff ist schreibgeschützt.",
    serverAnalysisReady: "Serveranalyse bereit",
    contextualAssessment: "Kontextbewertung",
    contextualScore: "AEGRIS-Kontextscore",
    criticalFactors: "Kritische Faktoren",
    ofFactors: "von",
    criticalFactorsLabel: "kritischen Faktoren",
    dataConfidence: "Datenvertrauen",
    dataReliability: "DATENZUVERLÄSSIGKEIT",
    analysisQualityOrigin: "QUALITÄT UND HERKUNFT DER ANALYSE",
    analysisMetadata: "Technische Metadaten der zuletzt gespeicherten Sentinel-Analyse.",
    validCoverage: "Gültige Abdeckung",
    source: "Quelle",
    spatialResolution: "Räumliche Auflösung",
    crsNotSpecified: "CRS nicht angegeben",
    validPixels: "Gültige Pixel",
    afterMasking: "nach Wolken-/No-Data-Maskierung",
    qualityGate: "Quality Gate",
    minimumPolygonCoverage: "minimale gültige Polygonabdeckung",
    acceptedIntervals: "Akzeptierte Intervalle",
    rejectedIntervals: "Abgelehnte Intervalle",
    medianNdvi: "Median-NDVI",
    provenanceNote: "NDVI wird aus den Sentinel-2-Bändern B08 und B04 berechnet. Ungültige Pixel werden mit der Scene Classification Layer (SCL) und dataMask gefiltert. AEGRIS-Wetter stammt aus einer separaten Wetterquelle, und die historische Auswertung verwendet den gespeicherten Snapshot.",
    noQualityMetadata: "Diese gespeicherte Analyse enthält noch keine Qualitätsmetadaten. Starten Sie eine neue Analyse; AEGRIS speichert dann die tatsächliche Quelle, Auflösung, gültige Abdeckung und das Quality Gate direkt aus dem Copernicus-Ergebnis.",
    decisionRecommendation: "ENTSCHEIDUNGSEMPFEHLUNG",
    whatIsHappening: "WAS PASSIERT",
    longTermTrend: "LANGFRISTIGER TREND",
    sinceLastAnalysis: "SEIT DER LETZTEN ANALYSE",
    whatToDoNow: "WAS JETZT ZU TUN IST",
    nextStep: "NÄCHSTER SCHRITT",
    projectAlerts: "PROJEKTWARNUNGEN",
    unread: "Ungelesen",
    newLabel: "NEU",
    markAsRead: "Als gelesen markieren",
    noAlerts: "Es wurde noch keine Warnung erstellt.",
    showAllAlerts: "Alle Warnungen anzeigen",
    recommendations: "AEGRIS-EMPFEHLUNGEN",
    diagnosis: "AEGRIS-DIAGNOSTIK",
    probableCauses: "Wahrscheinliche Ursachen des aktuellen Risikos",
    diagnosisShort: "Diagn.",
    indicationStrength: "Stärke des Hinweises",
    noDiagnosis: "Derzeit wurde keine Diagnose identifiziert.",
    keyFactors: "SCHLÜSSELFAKTOREN",
    inRange: "IM BEREICH",
    score: "Score",
    weight: "Gewichtung",
    ndviDevelopment: "NDVI-ENTWICKLUNG",
    trend: "Trend",
    trendWindow: "Trendfenster",
    stateAndRecommendations: "ENTWICKLUNG VON STATUS UND EMPFEHLUNGEN",
    noRecord: "Noch kein Eintrag.",
    showRecommendationHistory: "Empfehlungsverlauf anzeigen",
    analysisHistory: "ANALYSEVERLAUF",
    weatherConditions: "WETTER UND BEDINGUNGEN",
    currentLocalConditions: "AKTUELLE BEDINGUNGEN AM STANDORT",
    temperature: "Temperatur",
    humidity: "Luftfeuchtigkeit",
    precipitationLastHour: "Niederschlag – letzte Stunde",
    wind: "Wind",
    current: "Aktuell",
    loadingWeather: "Wetter wird geladen...",
    weatherLoadFailed: "Wetter konnte nicht geladen werden.",
    tempWithinProfile: "Im Profilbereich",
    tempOutsideProfile: "Außerhalb des Profilbereichs",
    noEvaluation: "Nicht bewertet",
    nutritionTitle: "AEGRIS AGRONOMY · PFLANZENERNÄHRUNG UND DÜNGUNG",
    nutritionMethodProfile: "METHODISCHES PROFIL DER PFLANZENERNÄHRUNG",
    nutritionMethodDescription: "Die Berechnung basiert auf der ÚKZÚZ-Methodik. AEGRIS zeigt keine konkrete Menge an, wenn die für eine sichere Bestimmung erforderlichen Eingaben fehlen.",
    nutritionProfileAvailable: "Nährstoffprofil verfügbar",
    nutritionProfileUnavailable: "Nährstoffprofil nicht verfügbar",
    closeInputs: "Eingaben schließen",
    completeInputs: "✎ Eingaben ergänzen",
    loadingNutrition: "Nährstoffprofil wird geladen…",
    plannedYield: "Geplanter Ertrag",
    lowYield: "Niedriges Ertragsniveau",
    mediumYield: "Mittleres Ertragsniveau",
    highYield: "Hohes Ertragsniveau",
    neededForNutrition: "Für die Nährstoffberechnung erforderlich",
    nitrogen: "Stickstoff N",
    base: "Basis",
    minimum: "Minimum",
    plannedYieldMissing: "Geplanter Ertrag fehlt.",
    phosphorus: "Phosphor P₂O₅",
    potassium: "Kalium K₂O",
    magnesium: "Magnesium MgO",
    methodNotSpecified: "Methode nicht angegeben",
    missingP: "Bodenanalyse P fehlt.",
    missingK: "Bodenanalyse K fehlt.",
    missingMg: "Bodenanalyse Mg fehlt.",
    methodologySource: "Methodikquelle",
    soilSupplyClassification: "Klassifizierung der Nährstoffversorgung des Bodens",
    soilTexture: "Bodenart",
    phosphorusMethod: "P-Methode",
    notSpecifiedMasculine: "nicht angegeben",
    notSpecifiedFeminine: "nicht angegeben",
    kmgRatio: "K : Mg-Verhältnis",
    kCoefficient: "K-Koeffizient",
    kmgNeedBoth: "Für die Korrektur müssen sowohl K als auch Mg eingegeben werden.",
    nitrogenCorrection: "N-Korrektur",
    predecessor: "Vorfrucht",
    noAppliedCorrection: "keine Korrektur angewendet",
    organicFertilization: "Organische Düngung",
    noAppliedDeduction: "kein Abzug angewendet",
    nminStoredNote: "als Verfeinerungswert gespeichert, nicht automatisch abgezogen",
    frameworkNitrogenSplit: "Rahmenaufteilung des Stickstoffs",
    doseCannotCalculate: "Menge kann nicht berechnet werden",
    noNitrogenSplit: "Für diese Kultur ist keine N-Aufteilung in der Datenbank verfügbar.",
    addYieldForNitrogen: "Geben Sie den geplanten Ertrag für eine konkrete Stickstoffempfehlung ein. AEGRIS schätzt die Menge ohne diese Eingabe nicht.",
    nutritionInputs: "Eingaben für die Nährstoffberechnung",
    plannedYieldUnit: "Geplanter Ertrag (t/ha)",
    soilTextureForKMg: "Bodenart für K / Mg",
    select: "Auswählen",
    lightSoil: "Leichter Boden",
    mediumSoil: "Mittlerer Boden",
    heavySoil: "Schwerer Boden",
    phosphorusDetermination: "Methode zur P-Bestimmung",
    soilP: "Boden-P (mg/kg)",
    soilK: "Boden-K (mg/kg)",
    soilMg: "Boden-Mg (mg/kg)",
    soilPh: "Boden-pH",
    predecessorCrop: "Vorfrucht",
    predecessorExample: "z. B. Klee",
    predecessorGroup: "Vorfruchtgruppe",
    noCorrectionOther: "Keine Korrektur / sonstige",
    clovers: "Kleearten",
    legumes: "Leguminosen",
    organicFertilizer: "Organischer Dünger",
    noDeduction: "Kein Abzug",
    manure: "Stallmist",
    slurry: "Jauche",
    liquidManure: "Gülle",
    slurryType: "Gülleart",
    cattle: "Rinder",
    pigs: "Schweine",
    poultry: "Geflügel",
    organicRate: "Menge organischer Dünger (t/ha)",
    applicationPeriod: "Anwendungszeitraum",
    organicNYear: "Jahr der Wirkung von organischem N",
    firstYear: "1. Jahr",
    secondYear: "2. Jahr",
    dataSource: "Datenquelle",
    dataSourcePlaceholder: "z. B. Bodenuntersuchung 2026 / Laboranalyse",
    note: "Notiz",
    saving: "Speichern…",
    saveNutritionInputs: "💾 Nährstoffeingaben speichern",
    projectDetails: "PROJEKTDETAILS",
    crop: "Kultur",
    variety: "Sorte",
    sowingDate: "Aussaatdatum",
    expectedHarvest: "Erwartete Ernte",
    farmingMethod: "Bewirtschaftungsmethode",
    editCropData: "✎ Kulturdaten bearbeiten",
    cropProfile: "KULTURPROFIL",
    profileNotEvaluated: "Profil nicht bewertet",
    moisture: "Feuchtigkeit",
    soilPH: "Boden-pH",
    waterNeed: "Wasserbedarf",
    notSpecified: "Nicht angegeben",
    stage: "Stadium",
    waterStress: "Wasserstress",
    projectLocation: "PROJEKTSTANDORT",
    cropDataEditing: "KULTURDATEN BEARBEITEN",
    cultivatedCrop: "Angebaute Kultur",
    originalValue: "Ursprünglicher Wert",
    selectCropUkzuz: "Kultur aus ÚKZÚZ auswählen",
    noAgronomicProfile: "Dieser offiziellen Kultur ist noch kein agronomisches Profil zugeordnet.",
    loadingVarieties: "ÚKZÚZ-Sorten werden geladen...",
    selectVarietyUkzuz: "Sorte aus ÚKZÚZ auswählen",
    noActiveVarieties: "Für diese Kultur sind keine aktiven Sorten verfügbar",
    areaHa: "Fläche (ha)",
    farmingMethodLabel: "Bewirtschaftungsmethode",
    conventional: "Konventionell",
    integrated: "Integriert",
    organic: "Ökologisch",
    other: "Sonstige",
    sowingPlantingDate: "Aussaat-/Pflanzdatum",
    expectedHarvestDate: "Erwartete Ernte",
    currentGrowthStage: "Aktuelles Wachstumsstadium",
    selectGrowthStage: "Wachstumsstadium auswählen",
    saveCropData: "💾 Kulturdaten speichern",
    projectDevelopment: "PROJEKTENTWICKLUNG",
    eventHistory: "Ereignisverlauf",
    analysisLabel: "ANALYSE",
    analysisCompleted: "Analyse abgeschlossen",
    recommendationLabel: "EMPFEHLUNG",
    recommendationCreated: "Empfehlung erstellt",
    noHistoricalEvents: "Noch keine historischen Ereignisse verfügbar.",
    showCompleteProjectHistory: "Vollständigen Projektverlauf anzeigen",
    editProjectData: "Projektdaten bearbeiten",
    readOnly: "Schreibgeschützt",
    recommendationHistory: "Empfehlungsverlauf",
    trendWorsening: "Entwicklung verschlechtert sich",
    trendImproving: "Bestandszustand verbessert sich",
    trendStable: "Entwicklung ist stabil",
    trendInsufficient: "Unzureichende historische Daten",
    longTermDecline: "Langfristiger Rückgang der Bestandsaktivität",
    trendRising: "Steigend",
    trendFalling: "Fallend",
    trendStableShort: "Stabil",
    trendWindowInsufficient: "unzureichende Daten",
    noMajorRiskFactor: "Kein signifikanter Risikofaktor",
    strengthVeryStrong: "Sehr stark",
    strengthStrong: "Stark",
    strengthMedium: "Mittel",
    strengthWeak: "Schwach",
    supplyLow: "niedrig",
    supplySatisfactory: "ausreichend",
    supplyGood: "gut",
    supplyHigh: "hoch",
    supplyVeryHigh: "sehr hoch",
  };
  const pl = {
    invalidProjectId: "Nieprawidłowy identyfikator projektu.",
    projectLoadFailed: "Nie udało się wczytać projektu.",
    projectNotFound: "Nie znaleziono projektu lub nie masz do niego dostępu.",
    projectOrganizationInvalid: "Projekt nie ma ustawionej prawidłowej organizacji.",
    permissionCheckFailed: "Nie udało się zweryfikować dostępu do projektu.",
    nutritionLoadFailed: "Nie udało się wczytać danych nawożenia.",
    nutritionNumberInvalid: "Wartości żywienia muszą być prawidłowymi liczbami.",
    plannedYieldPositive: "Planowany plon musi być większy niż 0.",
    phRange: "pH musi mieścić się w zakresie od 0 do 14.",
    phosphorusMethodRequired: "Wybierz metodę oznaczania fosforu (SP lub ICP-OES).",
    soilTextureRequired: "Wybierz klasę uziarnienia gleby do klasyfikacji K i Mg.",
    nutritionSaveFailed: "Nie udało się zapisać danych nawożenia.",
    varietyRequired: "ODMIANA JEST WYMAGANA",
    varietyMismatch: "Wybrana odmiana nie należy do wybranej uprawy.",
    areaPositive: "Powierzchnia musi być większa niż 0.",
    accessDenied: "Brak dostępu",
    noProjectAccess: "Nie masz dostępu do tego projektu",
    projectAccessDescription: "Projekt nie istnieje lub nie masz uprawnień do jego wyświetlenia.",
    backToProjects: "Powrót do projektów",
    loadingProject: "Wczytywanie projektu...",
    back: "Wstecz",
    cropNotSpecified: "Nie podano uprawy",
    areaNotSpecified: "Nie podano powierzchni",
    growthStageNotSpecified: "Nie podano fazy wzrostu",
    updated: "Zaktualizowano",
    refreshData: "Odśwież dane",
    refresh: "Odśwież",
    analyzing: "Analizowanie…",
    runAnalysis: "Uruchom nową analizę",
    projectInformation: "Informacje o projekcie",
    latitude: "Szerokość geograficzna",
    longitude: "Długość geograficzna",
    area: "Powierzchnia",
    growthStage: "Faza wzrostu",
    created: "Utworzono",
    currentVegetation: "Aktualny stan wegetacji",
    overallAssessment: "Ocena ogólna",
    analysisUnavailable: "Analiza nie jest jeszcze dostępna",
    mainReason: "Główny powód",
    cropCondition: "KONDYCJA ŁANU",
    priority: "Priorytet",
    previous: "względem poprzedniej",
    lastAnalysis: "Ostatnia analiza",
    storedDecisionSnapshot: "AEGRIS wyświetla zapisany serwerowy snapshot decyzji",
    legacyWeatherSnapshot: "Starsza analiza używa zapisanego snapshotu warunków",
    viewerReadOnly: "Dostęp typu viewer jest tylko do odczytu.",
    serverAnalysisReady: "Analiza serwerowa gotowa",
    contextualAssessment: "Ocena kontekstowa",
    contextualScore: "Wynik kontekstowy AEGRIS",
    criticalFactors: "Czynniki krytyczne",
    ofFactors: "z",
    criticalFactorsLabel: "czynników krytycznych",
    dataConfidence: "Pewność danych",
    dataReliability: "WIARYGODNOŚĆ DANYCH",
    analysisQualityOrigin: "JAKOŚĆ I POCHODZENIE ANALIZY",
    analysisMetadata: "Metadane techniczne ostatniej zapisanej analizy Sentinel.",
    validCoverage: "Prawidłowe pokrycie",
    source: "Źródło",
    spatialResolution: "Rozdzielczość przestrzenna",
    crsNotSpecified: "Nie podano CRS",
    validPixels: "Prawidłowe piksele",
    afterMasking: "po maskowaniu chmur / no-data",
    qualityGate: "Quality gate",
    minimumPolygonCoverage: "minimalne prawidłowe pokrycie poligonu",
    acceptedIntervals: "Zaakceptowane przedziały",
    rejectedIntervals: "Odrzucone przedziały",
    medianNdvi: "Mediana NDVI",
    provenanceNote: "NDVI jest obliczany z pasm Sentinel-2 B08 i B04. Nieprawidłowe piksele są filtrowane za pomocą Scene Classification Layer (SCL) i dataMask. Pogoda w AEGRIS pochodzi z osobnego źródła, a ocena historyczna wykorzystuje zapisany snapshot.",
    noQualityMetadata: "Ta zapisana analiza nie zawiera jeszcze metadanych jakości. Uruchom nową analizę; AEGRIS zapisze wtedy rzeczywiste źródło, rozdzielczość, prawidłowe pokrycie i quality gate bezpośrednio z wyniku Copernicus.",
    decisionRecommendation: "REKOMENDACJA DECYZYJNA",
    whatIsHappening: "CO SIĘ DZIEJE",
    longTermTrend: "TREND DŁUGOTERMINOWY",
    sinceLastAnalysis: "OD OSTATNIEJ ANALIZY",
    whatToDoNow: "CO ZROBIĆ TERAZ",
    nextStep: "NASTĘPNY KROK",
    projectAlerts: "ALERTY PROJEKTU",
    unread: "Nieprzeczytane",
    newLabel: "NOWE",
    markAsRead: "Oznacz jako przeczytane",
    noAlerts: "Nie utworzono jeszcze żadnego alertu.",
    showAllAlerts: "Pokaż wszystkie alerty",
    recommendations: "REKOMENDACJE AEGRIS",
    diagnosis: "DIAGNOSTYKA AEGRIS",
    probableCauses: "Prawdopodobne przyczyny aktualnego ryzyka",
    diagnosisShort: "diag.",
    indicationStrength: "Siła wskazania",
    noDiagnosis: "Obecnie nie zidentyfikowano diagnozy.",
    keyFactors: "KLUCZOWE CZYNNIKI",
    inRange: "W NORMIE",
    score: "Wynik",
    weight: "waga",
    ndviDevelopment: "ROZWÓJ NDVI",
    trend: "Trend",
    trendWindow: "Okno trendu",
    stateAndRecommendations: "ROZWÓJ STANU I REKOMENDACJI",
    noRecord: "Brak zapisów.",
    showRecommendationHistory: "Pokaż historię rekomendacji",
    analysisHistory: "HISTORIA ANALIZ",
    weatherConditions: "POGODA I WARUNKI",
    currentLocalConditions: "AKTUALNE WARUNKI W LOKALIZACJI",
    temperature: "Temperatura",
    humidity: "Wilgotność",
    precipitationLastHour: "Opad – ostatnia godzina",
    wind: "Wiatr",
    current: "Aktualnie",
    loadingWeather: "Wczytywanie pogody...",
    weatherLoadFailed: "Nie udało się wczytać pogody.",
    tempWithinProfile: "W zakresie profilu",
    tempOutsideProfile: "Poza zakresem profilu",
    noEvaluation: "Nie oceniono",
    nutritionTitle: "AEGRIS AGRONOMY · ŻYWIENIE I NAWOŻENIE",
    nutritionMethodProfile: "PROFIL METODYCZNY ŻYWIENIA UPRAWY",
    nutritionMethodDescription: "Obliczenie opiera się na metodyce ÚKZÚZ. AEGRIS nie wyświetla konkretnej dawki, gdy brakuje danych niezbędnych do jej bezpiecznego określenia.",
    nutritionProfileAvailable: "Profil żywienia dostępny",
    nutritionProfileUnavailable: "Profil żywienia niedostępny",
    closeInputs: "Zamknij dane wejściowe",
    completeInputs: "✎ Uzupełnij dane",
    loadingNutrition: "Wczytywanie profilu żywienia…",
    plannedYield: "Planowany plon",
    lowYield: "Niski poziom plonu",
    mediumYield: "Średni poziom plonu",
    highYield: "Wysoki poziom plonu",
    neededForNutrition: "Wymagane do obliczenia żywienia",
    nitrogen: "Azot N",
    base: "Baza",
    minimum: "minimum",
    plannedYieldMissing: "Brak planowanego plonu.",
    phosphorus: "Fosfor P₂O₅",
    potassium: "Potas K₂O",
    magnesium: "Magnez MgO",
    methodNotSpecified: "nie podano metody",
    missingP: "Brak analizy gleby P.",
    missingK: "Brak analizy gleby K.",
    missingMg: "Brak analizy gleby Mg.",
    methodologySource: "Źródło metodyki",
    soilSupplyClassification: "Klasyfikacja zasobności gleby w składniki",
    soilTexture: "Klasa uziarnienia gleby",
    phosphorusMethod: "Metoda P",
    notSpecifiedMasculine: "nie podano",
    notSpecifiedFeminine: "nie podano",
    kmgRatio: "Stosunek K : Mg",
    kCoefficient: "Współczynnik K",
    kmgNeedBoth: "Do korekty należy podać zarówno K, jak i Mg.",
    nitrogenCorrection: "Korekta N",
    predecessor: "Przedplon",
    noAppliedCorrection: "bez zastosowanej korekty",
    organicFertilization: "Nawożenie organiczne",
    noAppliedDeduction: "bez zastosowanego odliczenia",
    nminStoredNote: "zapisane jako wartość doprecyzowująca, nie jest automatycznie odliczane",
    frameworkNitrogenSplit: "Ramowy podział azotu",
    doseCannotCalculate: "nie można obliczyć dawki",
    noNitrogenSplit: "Dla tej uprawy brak podziału N w bazie danych.",
    addYieldForNitrogen: "Podaj planowany plon, aby uzyskać konkretną rekomendację azotową. AEGRIS nie szacuje dawki bez tej informacji.",
    nutritionInputs: "Dane wejściowe do obliczenia żywienia",
    plannedYieldUnit: "Planowany plon (t/ha)",
    soilTextureForKMg: "Klasa uziarnienia dla K / Mg",
    select: "Wybierz",
    lightSoil: "Gleba lekka",
    mediumSoil: "Gleba średnia",
    heavySoil: "Gleba ciężka",
    phosphorusDetermination: "Metoda oznaczania P",
    soilP: "P w glebie (mg/kg)",
    soilK: "K w glebie (mg/kg)",
    soilMg: "Mg w glebie (mg/kg)",
    soilPh: "pH gleby",
    predecessorCrop: "Przedplon",
    predecessorExample: "np. koniczyna",
    predecessorGroup: "Grupa przedplonu",
    noCorrectionOther: "Bez korekty / inne",
    clovers: "Koniczyny",
    legumes: "Rośliny strączkowe",
    organicFertilizer: "Nawóz organiczny",
    noDeduction: "Bez odliczenia",
    manure: "Obornik",
    slurry: "Gnojówka",
    liquidManure: "Gnojowica",
    slurryType: "Rodzaj gnojowicy",
    cattle: "Bydło",
    pigs: "Świnie",
    poultry: "Drób",
    organicRate: "Dawka nawozu organicznego (t/ha)",
    applicationPeriod: "Okres stosowania",
    organicNYear: "Rok działania organicznego N",
    firstYear: "1. rok",
    secondYear: "2. rok",
    dataSource: "Źródło danych",
    dataSourcePlaceholder: "np. badanie gleby 2026 / analiza laboratoryjna",
    note: "Notatka",
    saving: "Zapisywanie…",
    saveNutritionInputs: "💾 Zapisz dane żywieniowe",
    projectDetails: "SZCZEGÓŁY PROJEKTU",
    crop: "Uprawa",
    variety: "Odmiana",
    sowingDate: "Data siewu",
    expectedHarvest: "Przewidywany zbiór",
    farmingMethod: "System uprawy",
    editCropData: "✎ Edytuj dane uprawy",
    cropProfile: "PROFIL UPRAWY",
    profileNotEvaluated: "Profil nieoceniony",
    moisture: "Wilgotność",
    soilPH: "pH gleby",
    waterNeed: "Zapotrzebowanie na wodę",
    notSpecified: "Nie podano",
    stage: "Faza",
    waterStress: "Stres wodny",
    projectLocation: "LOKALIZACJA PROJEKTU",
    cropDataEditing: "EDYCJA DANYCH UPRAWY",
    cultivatedCrop: "Uprawiana roślina",
    originalValue: "Wartość pierwotna",
    selectCropUkzuz: "Wybierz uprawę z ÚKZÚZ",
    noAgronomicProfile: "Do tej oficjalnej uprawy nie przypisano jeszcze profilu agronomicznego.",
    loadingVarieties: "Wczytywanie odmian ÚKZÚZ...",
    selectVarietyUkzuz: "Wybierz odmianę z ÚKZÚZ",
    noActiveVarieties: "Brak aktywnych odmian dla tej uprawy",
    areaHa: "Powierzchnia (ha)",
    farmingMethodLabel: "System uprawy",
    conventional: "Konwencjonalny",
    integrated: "Integrowany",
    organic: "Ekologiczny",
    other: "Inny",
    sowingPlantingDate: "Data siewu / sadzenia",
    expectedHarvestDate: "Przewidywany zbiór",
    currentGrowthStage: "Aktualna faza wzrostu",
    selectGrowthStage: "Wybierz fazę wzrostu",
    saveCropData: "💾 Zapisz dane uprawy",
    projectDevelopment: "ROZWÓJ PROJEKTU",
    eventHistory: "Historia zdarzeń",
    analysisLabel: "ANALIZA",
    analysisCompleted: "Analiza zakończona",
    recommendationLabel: "REKOMENDACJA",
    recommendationCreated: "Rekomendacja utworzona",
    noHistoricalEvents: "Brak dostępnych zdarzeń historycznych.",
    showCompleteProjectHistory: "Pokaż pełną historię projektu",
    editProjectData: "Edytuj dane projektu",
    readOnly: "Tylko do odczytu",
    recommendationHistory: "Historia rekomendacji",
    trendWorsening: "Rozwój się pogarsza",
    trendImproving: "Stan uprawy się poprawia",
    trendStable: "Rozwój jest stabilny",
    trendInsufficient: "Niewystarczające dane historyczne",
    longTermDecline: "Długoterminowy spadek aktywności uprawy",
    trendRising: "Rosnący",
    trendFalling: "Spadający",
    trendStableShort: "Stabilny",
    trendWindowInsufficient: "niewystarczające dane",
    noMajorRiskFactor: "Brak istotnego czynnika ryzyka",
    strengthVeryStrong: "Bardzo silna",
    strengthStrong: "Silna",
    strengthMedium: "Średnia",
    strengthWeak: "Słaba",
    supplyLow: "niska",
    supplySatisfactory: "zadowalająca",
    supplyGood: "dobra",
    supplyHigh: "wysoka",
    supplyVeryHigh: "bardzo wysoka",
  };
  const fr = {
    invalidProjectId: "ID de projet invalide.",
    projectLoadFailed: "Impossible de charger le projet.",
    projectNotFound: "Le projet est introuvable ou vous n’y avez pas accès.",
    projectOrganizationInvalid: "Le projet ne possède pas d’organisation valide.",
    permissionCheckFailed: "Impossible de vérifier l’accès au projet.",
    nutritionLoadFailed: "Impossible de charger les données de fertilisation.",
    nutritionNumberInvalid: "Les valeurs de nutrition doivent être des nombres valides.",
    plannedYieldPositive: "Le rendement prévu doit être supérieur à 0.",
    phRange: "Le pH doit être compris entre 0 et 14.",
    phosphorusMethodRequired: "Sélectionnez la méthode de détermination du phosphore (SP ou ICP-OES).",
    soilTextureRequired: "Sélectionnez la classe de texture du sol pour la classification K et Mg.",
    nutritionSaveFailed: "Impossible d’enregistrer les données de fertilisation.",
    varietyRequired: "LA VARIÉTÉ EST OBLIGATOIRE",
    varietyMismatch: "La variété sélectionnée n’appartient pas à la culture sélectionnée.",
    areaPositive: "La surface doit être supérieure à 0.",
    accessDenied: "Accès refusé",
    noProjectAccess: "Vous n’avez pas accès à ce projet",
    projectAccessDescription: "Le projet n’existe pas ou vous n’êtes pas autorisé à l’afficher.",
    backToProjects: "Retour aux projets",
    loadingProject: "Chargement du projet...",
    back: "Retour",
    cropNotSpecified: "Culture non renseignée",
    areaNotSpecified: "Surface non renseignée",
    growthStageNotSpecified: "Stade de croissance non renseigné",
    updated: "Mis à jour",
    refreshData: "Actualiser les données",
    refresh: "Actualiser",
    analyzing: "Analyse en cours…",
    runAnalysis: "Lancer une nouvelle analyse",
    projectInformation: "Informations sur le projet",
    latitude: "Latitude",
    longitude: "Longitude",
    area: "Surface",
    growthStage: "Stade de croissance",
    created: "Créé",
    currentVegetation: "État actuel de la végétation",
    overallAssessment: "Évaluation globale",
    analysisUnavailable: "L’analyse n’est pas encore disponible",
    mainReason: "Raison principale",
    cropCondition: "ÉTAT DE LA CULTURE",
    priority: "Priorité",
    previous: "par rapport à la précédente",
    lastAnalysis: "Dernière analyse",
    storedDecisionSnapshot: "AEGRIS affiche le snapshot de décision serveur enregistré",
    legacyWeatherSnapshot: "L’analyse héritée utilise le snapshot des conditions enregistré",
    viewerReadOnly: "L’accès Viewer est en lecture seule.",
    serverAnalysisReady: "Analyse serveur prête",
    contextualAssessment: "Évaluation contextuelle",
    contextualScore: "Score contextuel AEGRIS",
    criticalFactors: "Facteurs critiques",
    ofFactors: "sur",
    criticalFactorsLabel: "facteurs critiques",
    dataConfidence: "Confiance dans les données",
    dataReliability: "FIABILITÉ DES DONNÉES",
    analysisQualityOrigin: "QUALITÉ ET ORIGINE DE L’ANALYSE",
    analysisMetadata: "Métadonnées techniques de la dernière analyse Sentinel enregistrée.",
    validCoverage: "Couverture valide",
    source: "Source",
    spatialResolution: "Résolution spatiale",
    crsNotSpecified: "CRS non renseigné",
    validPixels: "Pixels valides",
    afterMasking: "après masquage des nuages / no-data",
    qualityGate: "Seuil de qualité",
    minimumPolygonCoverage: "couverture minimale valide du polygone",
    acceptedIntervals: "Intervalles acceptés",
    rejectedIntervals: "Intervalles rejetés",
    medianNdvi: "NDVI médian",
    provenanceNote: "Le NDVI est calculé à partir des bandes Sentinel-2 B08 et B04. Les pixels invalides sont filtrés avec la Scene Classification Layer (SCL) et dataMask. La météo AEGRIS provient d’une source distincte et l’évaluation historique utilise le snapshot enregistré.",
    noQualityMetadata: "Cette analyse enregistrée ne contient pas encore de métadonnées de qualité. Lancez une nouvelle analyse ; AEGRIS enregistrera alors la source réelle, la résolution, la couverture valide et le seuil de qualité directement à partir du résultat Copernicus.",
    decisionRecommendation: "RECOMMANDATION DÉCISIONNELLE",
    whatIsHappening: "CE QUI SE PASSE",
    longTermTrend: "TENDANCE À LONG TERME",
    sinceLastAnalysis: "DEPUIS LA DERNIÈRE ANALYSE",
    whatToDoNow: "QUE FAIRE MAINTENANT",
    nextStep: "ÉTAPE SUIVANTE",
    projectAlerts: "ALERTES DU PROJET",
    unread: "Non lues",
    newLabel: "NOUVEAU",
    markAsRead: "Marquer comme lu",
    noAlerts: "Aucune alerte n’a encore été créée.",
    showAllAlerts: "Afficher toutes les alertes",
    recommendations: "RECOMMANDATIONS AEGRIS",
    diagnosis: "DIAGNOSTIC AEGRIS",
    probableCauses: "Causes probables du risque actuel",
    diagnosisShort: "diag.",
    indicationStrength: "Force de l’indication",
    noDiagnosis: "Aucun diagnostic n’est actuellement identifié.",
    keyFactors: "FACTEURS CLÉS",
    inRange: "DANS LA PLAGE",
    score: "Score",
    weight: "poids",
    ndviDevelopment: "ÉVOLUTION DU NDVI",
    trend: "Tendance",
    trendWindow: "Fenêtre de tendance",
    stateAndRecommendations: "ÉVOLUTION DE L’ÉTAT ET DES RECOMMANDATIONS",
    noRecord: "Aucun enregistrement pour l’instant.",
    showRecommendationHistory: "Afficher l’historique des recommandations",
    analysisHistory: "HISTORIQUE DES ANALYSES",
    weatherConditions: "MÉTÉO ET CONDITIONS",
    currentLocalConditions: "CONDITIONS ACTUELLES SUR LE SITE",
    temperature: "Température",
    humidity: "Humidité",
    precipitationLastHour: "Précipitations – dernière heure",
    wind: "Vent",
    current: "Actuel",
    loadingWeather: "Chargement de la météo...",
    weatherLoadFailed: "Impossible de charger la météo.",
    tempWithinProfile: "Dans la plage du profil",
    tempOutsideProfile: "Hors de la plage du profil",
    noEvaluation: "Non évalué",
    nutritionTitle: "AEGRIS AGRONOMY · NUTRITION ET FERTILISATION",
    nutritionMethodProfile: "PROFIL MÉTHODOLOGIQUE DE NUTRITION DE LA CULTURE",
    nutritionMethodDescription: "Le calcul repose sur la méthodologie ÚKZÚZ. AEGRIS n’affiche pas de dose précise lorsque les données nécessaires à une détermination sûre sont manquantes.",
    nutritionProfileAvailable: "Profil nutritionnel disponible",
    nutritionProfileUnavailable: "Profil nutritionnel indisponible",
    closeInputs: "Fermer les données",
    completeInputs: "✎ Compléter les données",
    loadingNutrition: "Chargement du profil nutritionnel…",
    plannedYield: "Rendement prévu",
    lowYield: "Faible niveau de rendement",
    mediumYield: "Niveau de rendement moyen",
    highYield: "Niveau de rendement élevé",
    neededForNutrition: "Requis pour le calcul de nutrition",
    nitrogen: "Azote N",
    base: "Base",
    minimum: "minimum",
    plannedYieldMissing: "Le rendement prévu est manquant.",
    phosphorus: "Phosphore P₂O₅",
    potassium: "Potassium K₂O",
    magnesium: "Magnésium MgO",
    methodNotSpecified: "méthode non renseignée",
    missingP: "L’analyse du P du sol est manquante.",
    missingK: "L’analyse du K du sol est manquante.",
    missingMg: "L’analyse du Mg du sol est manquante.",
    methodologySource: "Source méthodologique",
    soilSupplyClassification: "Classification de la disponibilité des éléments nutritifs du sol",
    soilTexture: "Texture du sol",
    phosphorusMethod: "Méthode P",
    notSpecifiedMasculine: "non renseigné",
    notSpecifiedFeminine: "non renseignée",
    kmgRatio: "Rapport K : Mg",
    kCoefficient: "Coefficient K",
    kmgNeedBoth: "K et Mg doivent tous deux être renseignés pour la correction.",
    nitrogenCorrection: "Correction N",
    predecessor: "Précédent cultural",
    noAppliedCorrection: "aucune correction appliquée",
    organicFertilization: "Fertilisation organique",
    noAppliedDeduction: "aucune déduction appliquée",
    nminStoredNote: "enregistré comme valeur d’affinement, non déduit automatiquement",
    frameworkNitrogenSplit: "Répartition indicative de l’azote",
    doseCannotCalculate: "la dose ne peut pas être calculée",
    noNitrogenSplit: "Aucune répartition de N n’est disponible dans la base pour cette culture.",
    addYieldForNitrogen: "Saisissez le rendement prévu pour obtenir une recommandation d’azote précise. AEGRIS n’estime pas la dose sans cette donnée.",
    nutritionInputs: "Données pour le calcul de nutrition",
    plannedYieldUnit: "Rendement prévu (t/ha)",
    soilTextureForKMg: "Texture du sol pour K / Mg",
    select: "Sélectionner",
    lightSoil: "Sol léger",
    mediumSoil: "Sol moyen",
    heavySoil: "Sol lourd",
    phosphorusDetermination: "Méthode de détermination du P",
    soilP: "P du sol (mg/kg)",
    soilK: "K du sol (mg/kg)",
    soilMg: "Mg du sol (mg/kg)",
    soilPh: "pH du sol",
    predecessorCrop: "Précédent cultural",
    predecessorExample: "p. ex. trèfle",
    predecessorGroup: "Groupe du précédent",
    noCorrectionOther: "Aucune correction / autre",
    clovers: "Trèfles",
    legumes: "Légumineuses",
    organicFertilizer: "Engrais organique",
    noDeduction: "Aucune déduction",
    manure: "Fumier",
    slurry: "Purin",
    liquidManure: "Lisier",
    slurryType: "Type de lisier",
    cattle: "Bovins",
    pigs: "Porcs",
    poultry: "Volailles",
    organicRate: "Dose d’engrais organique (t/ha)",
    applicationPeriod: "Période d’application",
    organicNYear: "Année d’effet de l’azote organique",
    firstYear: "1re année",
    secondYear: "2e année",
    dataSource: "Source des données",
    dataSourcePlaceholder: "p. ex. analyse de sol 2026 / analyse de laboratoire",
    note: "Note",
    saving: "Enregistrement…",
    saveNutritionInputs: "💾 Enregistrer les données de nutrition",
    projectDetails: "DÉTAILS DU PROJET",
    crop: "Culture",
    variety: "Variété",
    sowingDate: "Date de semis",
    expectedHarvest: "Récolte prévue",
    farmingMethod: "Mode de culture",
    editCropData: "✎ Modifier les données de culture",
    cropProfile: "PROFIL DE CULTURE",
    profileNotEvaluated: "Profil non évalué",
    moisture: "Humidité",
    soilPH: "pH du sol",
    waterNeed: "Besoin en eau",
    notSpecified: "Non renseigné",
    stage: "Stade",
    waterStress: "Stress hydrique",
    projectLocation: "LOCALISATION DU PROJET",
    cropDataEditing: "MODIFIER LES DONNÉES DE CULTURE",
    cultivatedCrop: "Culture cultivée",
    originalValue: "Valeur d’origine",
    selectCropUkzuz: "Sélectionner une culture dans ÚKZÚZ",
    noAgronomicProfile: "Aucun profil agronomique n’est encore attribué à cette culture officielle.",
    loadingVarieties: "Chargement des variétés ÚKZÚZ...",
    selectVarietyUkzuz: "Sélectionner une variété dans ÚKZÚZ",
    noActiveVarieties: "Aucune variété active n’est disponible pour cette culture",
    areaHa: "Surface (ha)",
    farmingMethodLabel: "Mode de culture",
    conventional: "Conventionnel",
    integrated: "Intégré",
    organic: "Biologique",
    other: "Autre",
    sowingPlantingDate: "Date de semis / plantation",
    expectedHarvestDate: "Récolte prévue",
    currentGrowthStage: "Stade de croissance actuel",
    selectGrowthStage: "Sélectionner le stade de croissance",
    saveCropData: "💾 Enregistrer les données de culture",
    projectDevelopment: "ÉVOLUTION DU PROJET",
    eventHistory: "Historique des événements",
    analysisLabel: "ANALYSE",
    analysisCompleted: "Analyse terminée",
    recommendationLabel: "RECOMMANDATION",
    recommendationCreated: "Recommandation créée",
    noHistoricalEvents: "Aucun événement historique n’est encore disponible.",
    showCompleteProjectHistory: "Afficher l’historique complet du projet",
    editProjectData: "Modifier les données du projet",
    readOnly: "Lecture seule",
    recommendationHistory: "Historique des recommandations",
    trendWorsening: "L’évolution se dégrade",
    trendImproving: "L’état de la culture s’améliore",
    trendStable: "L’évolution est stable",
    trendInsufficient: "Données historiques insuffisantes",
    longTermDecline: "Baisse à long terme de l’activité de la culture",
    trendRising: "En hausse",
    trendFalling: "En baisse",
    trendStableShort: "Stable",
    trendWindowInsufficient: "données insuffisantes",
    noMajorRiskFactor: "Aucun facteur de risque significatif",
    strengthVeryStrong: "Très forte",
    strengthStrong: "Forte",
    strengthMedium: "Moyenne",
    strengthWeak: "Faible",
    supplyLow: "faible",
    supplySatisfactory: "satisfaisante",
    supplyGood: "bonne",
    supplyHigh: "élevée",
    supplyVeryHigh: "très élevée",
  };
  const es = {
    invalidProjectId: "ID de proyecto no válido.",
    projectLoadFailed: "No se pudo cargar el proyecto.",
    projectNotFound: "No se encontró el proyecto o no tiene acceso a él.",
    projectOrganizationInvalid: "El proyecto no tiene una organización válida configurada.",
    permissionCheckFailed: "No se pudo verificar el acceso al proyecto.",
    nutritionLoadFailed: "No se pudieron cargar los datos de fertilización.",
    nutritionNumberInvalid: "Los valores de nutrición deben ser números válidos.",
    plannedYieldPositive: "El rendimiento previsto debe ser mayor que 0.",
    phRange: "El pH debe estar entre 0 y 14.",
    phosphorusMethodRequired: "Seleccione el método de determinación de fósforo (SP o ICP-OES).",
    soilTextureRequired: "Seleccione la clase de textura del suelo para la clasificación de K y Mg.",
    nutritionSaveFailed: "No se pudieron guardar los datos de fertilización.",
    varietyRequired: "LA VARIEDAD ES OBLIGATORIA",
    varietyMismatch: "La variedad seleccionada no pertenece al cultivo seleccionado.",
    areaPositive: "La superficie debe ser mayor que 0.",
    accessDenied: "Acceso denegado",
    noProjectAccess: "No tiene acceso a este proyecto",
    projectAccessDescription: "El proyecto no existe o no tiene permiso para verlo.",
    backToProjects: "Volver a proyectos",
    loadingProject: "Cargando proyecto...",
    back: "Volver",
    cropNotSpecified: "Cultivo no especificado",
    areaNotSpecified: "Superficie no especificada",
    growthStageNotSpecified: "Fase de crecimiento no especificada",
    updated: "Actualizado",
    refreshData: "Actualizar datos",
    refresh: "Actualizar",
    analyzing: "Analizando…",
    runAnalysis: "Ejecutar nuevo análisis",
    projectInformation: "Información del proyecto",
    latitude: "Latitud",
    longitude: "Longitud",
    area: "Superficie",
    growthStage: "Fase de crecimiento",
    created: "Creado",
    currentVegetation: "Estado actual de la vegetación",
    overallAssessment: "Evaluación general",
    analysisUnavailable: "El análisis aún no está disponible",
    mainReason: "Motivo principal",
    cropCondition: "ESTADO DEL CULTIVO",
    priority: "Prioridad",
    previous: "frente al anterior",
    lastAnalysis: "Último análisis",
    storedDecisionSnapshot: "AEGRIS muestra el snapshot de decisión del servidor guardado",
    legacyWeatherSnapshot: "El análisis heredado utiliza el snapshot de condiciones guardado",
    viewerReadOnly: "El acceso de Viewer es de solo lectura.",
    serverAnalysisReady: "Análisis del servidor listo",
    contextualAssessment: "Evaluación contextual",
    contextualScore: "Puntuación contextual AEGRIS",
    criticalFactors: "Factores críticos",
    ofFactors: "de",
    criticalFactorsLabel: "factores críticos",
    dataConfidence: "Confianza de los datos",
    dataReliability: "FIABILIDAD DE LOS DATOS",
    analysisQualityOrigin: "CALIDAD Y ORIGEN DEL ANÁLISIS",
    analysisMetadata: "Metadatos técnicos del último análisis Sentinel guardado.",
    validCoverage: "Cobertura válida",
    source: "Fuente",
    spatialResolution: "Resolución espacial",
    crsNotSpecified: "CRS no especificado",
    validPixels: "Píxeles válidos",
    afterMasking: "tras el enmascarado de nubes / no-data",
    qualityGate: "Umbral de calidad",
    minimumPolygonCoverage: "cobertura mínima válida del polígono",
    acceptedIntervals: "Intervalos aceptados",
    rejectedIntervals: "Intervalos rechazados",
    medianNdvi: "NDVI mediano",
    provenanceNote: "El NDVI se calcula a partir de las bandas B08 y B04 de Sentinel-2. Los píxeles no válidos se filtran mediante Scene Classification Layer (SCL) y dataMask. El tiempo de AEGRIS procede de una fuente meteorológica independiente y la evaluación histórica utiliza el snapshot guardado.",
    noQualityMetadata: "Este análisis guardado todavía no contiene metadatos de calidad. Ejecute un nuevo análisis; AEGRIS guardará entonces la fuente real, la resolución, la cobertura válida y el umbral de calidad directamente del resultado de Copernicus.",
    decisionRecommendation: "RECOMENDACIÓN DE DECISIÓN",
    whatIsHappening: "QUÉ ESTÁ OCURRIENDO",
    longTermTrend: "TENDENCIA A LARGO PLAZO",
    sinceLastAnalysis: "DESDE EL ÚLTIMO ANÁLISIS",
    whatToDoNow: "QUÉ HACER AHORA",
    nextStep: "SIGUIENTE PASO",
    projectAlerts: "ALERTAS DEL PROYECTO",
    unread: "No leídas",
    newLabel: "NUEVO",
    markAsRead: "Marcar como leído",
    noAlerts: "Todavía no se ha creado ninguna alerta.",
    showAllAlerts: "Mostrar todas las alertas",
    recommendations: "RECOMENDACIONES AEGRIS",
    diagnosis: "DIAGNÓSTICO AEGRIS",
    probableCauses: "Causas probables del riesgo actual",
    diagnosisShort: "diag.",
    indicationStrength: "Fuerza del indicio",
    noDiagnosis: "Actualmente no se ha identificado ningún diagnóstico.",
    keyFactors: "FACTORES CLAVE",
    inRange: "EN RANGO",
    score: "Puntuación",
    weight: "peso",
    ndviDevelopment: "EVOLUCIÓN DEL NDVI",
    trend: "Tendencia",
    trendWindow: "Ventana de tendencia",
    stateAndRecommendations: "EVOLUCIÓN DEL ESTADO Y LAS RECOMENDACIONES",
    noRecord: "Aún no hay registros.",
    showRecommendationHistory: "Mostrar historial de recomendaciones",
    analysisHistory: "HISTORIAL DE ANÁLISIS",
    weatherConditions: "TIEMPO Y CONDICIONES",
    currentLocalConditions: "CONDICIONES ACTUALES EN LA UBICACIÓN",
    temperature: "Temperatura",
    humidity: "Humedad",
    precipitationLastHour: "Precipitación – última hora",
    wind: "Viento",
    current: "Actual",
    loadingWeather: "Cargando tiempo...",
    weatherLoadFailed: "No se pudo cargar el tiempo.",
    tempWithinProfile: "Dentro del rango del perfil",
    tempOutsideProfile: "Fuera del rango del perfil",
    noEvaluation: "No evaluado",
    nutritionTitle: "AEGRIS AGRONOMY · NUTRICIÓN Y FERTILIZACIÓN",
    nutritionMethodProfile: "PERFIL METODOLÓGICO DE NUTRICIÓN DEL CULTIVO",
    nutritionMethodDescription: "El cálculo se basa en la metodología de ÚKZÚZ. AEGRIS no muestra una dosis concreta cuando faltan los datos necesarios para determinarla de forma segura.",
    nutritionProfileAvailable: "Perfil nutricional disponible",
    nutritionProfileUnavailable: "Perfil nutricional no disponible",
    closeInputs: "Cerrar datos",
    completeInputs: "✎ Completar datos",
    loadingNutrition: "Cargando perfil nutricional…",
    plannedYield: "Rendimiento previsto",
    lowYield: "Nivel de rendimiento bajo",
    mediumYield: "Nivel de rendimiento medio",
    highYield: "Nivel de rendimiento alto",
    neededForNutrition: "Necesario para el cálculo de nutrición",
    nitrogen: "Nitrógeno N",
    base: "Base",
    minimum: "mínimo",
    plannedYieldMissing: "Falta el rendimiento previsto.",
    phosphorus: "Fósforo P₂O₅",
    potassium: "Potasio K₂O",
    magnesium: "Magnesio MgO",
    methodNotSpecified: "método no especificado",
    missingP: "Falta el análisis de P del suelo.",
    missingK: "Falta el análisis de K del suelo.",
    missingMg: "Falta el análisis de Mg del suelo.",
    methodologySource: "Fuente metodológica",
    soilSupplyClassification: "Clasificación de la disponibilidad de nutrientes del suelo",
    soilTexture: "Textura del suelo",
    phosphorusMethod: "Método P",
    notSpecifiedMasculine: "no especificado",
    notSpecifiedFeminine: "no especificada",
    kmgRatio: "Relación K : Mg",
    kCoefficient: "Coeficiente K",
    kmgNeedBoth: "Deben introducirse K y Mg para la corrección.",
    nitrogenCorrection: "Corrección N",
    predecessor: "Cultivo precedente",
    noAppliedCorrection: "sin corrección aplicada",
    organicFertilization: "Fertilización orgánica",
    noAppliedDeduction: "sin deducción aplicada",
    nminStoredNote: "guardado como valor de ajuste, no se deduce automáticamente",
    frameworkNitrogenSplit: "Reparto orientativo del nitrógeno",
    doseCannotCalculate: "no se puede calcular la dosis",
    noNitrogenSplit: "No hay reparto de N disponible en la base de datos para este cultivo.",
    addYieldForNitrogen: "Introduzca el rendimiento previsto para obtener una recomendación concreta de nitrógeno. AEGRIS no estima la dosis sin este dato.",
    nutritionInputs: "Datos para el cálculo de nutrición",
    plannedYieldUnit: "Rendimiento previsto (t/ha)",
    soilTextureForKMg: "Textura del suelo para K / Mg",
    select: "Seleccionar",
    lightSoil: "Suelo ligero",
    mediumSoil: "Suelo medio",
    heavySoil: "Suelo pesado",
    phosphorusDetermination: "Método de determinación de P",
    soilP: "P del suelo (mg/kg)",
    soilK: "K del suelo (mg/kg)",
    soilMg: "Mg del suelo (mg/kg)",
    soilPh: "pH del suelo",
    predecessorCrop: "Cultivo precedente",
    predecessorExample: "p. ej., trébol",
    predecessorGroup: "Grupo del cultivo precedente",
    noCorrectionOther: "Sin corrección / otro",
    clovers: "Tréboles",
    legumes: "Leguminosas",
    organicFertilizer: "Fertilizante orgánico",
    noDeduction: "Sin deducción",
    manure: "Estiércol",
    slurry: "Purín líquido",
    liquidManure: "Purín",
    slurryType: "Tipo de purín",
    cattle: "Bovino",
    pigs: "Porcino",
    poultry: "Aves",
    organicRate: "Dosis de fertilizante orgánico (t/ha)",
    applicationPeriod: "Periodo de aplicación",
    organicNYear: "Año de efecto del N orgánico",
    firstYear: "1.er año",
    secondYear: "2.º año",
    dataSource: "Fuente de datos",
    dataSourcePlaceholder: "p. ej., análisis de suelo 2026 / análisis de laboratorio",
    note: "Nota",
    saving: "Guardando…",
    saveNutritionInputs: "💾 Guardar datos de nutrición",
    projectDetails: "DETALLES DEL PROYECTO",
    crop: "Cultivo",
    variety: "Variedad",
    sowingDate: "Fecha de siembra",
    expectedHarvest: "Cosecha prevista",
    farmingMethod: "Método de cultivo",
    editCropData: "✎ Editar datos del cultivo",
    cropProfile: "PERFIL DEL CULTIVO",
    profileNotEvaluated: "Perfil no evaluado",
    moisture: "Humedad",
    soilPH: "pH del suelo",
    waterNeed: "Necesidad de agua",
    notSpecified: "No especificado",
    stage: "Fase",
    waterStress: "Estrés hídrico",
    projectLocation: "UBICACIÓN DEL PROYECTO",
    cropDataEditing: "EDITAR DATOS DEL CULTIVO",
    cultivatedCrop: "Cultivo implantado",
    originalValue: "Valor original",
    selectCropUkzuz: "Seleccionar cultivo de ÚKZÚZ",
    noAgronomicProfile: "Todavía no hay un perfil agronómico asignado a este cultivo oficial.",
    loadingVarieties: "Cargando variedades de ÚKZÚZ...",
    selectVarietyUkzuz: "Seleccionar variedad de ÚKZÚZ",
    noActiveVarieties: "No hay variedades activas disponibles para este cultivo",
    areaHa: "Superficie (ha)",
    farmingMethodLabel: "Método de cultivo",
    conventional: "Convencional",
    integrated: "Integrado",
    organic: "Ecológico",
    other: "Otro",
    sowingPlantingDate: "Fecha de siembra / plantación",
    expectedHarvestDate: "Cosecha prevista",
    currentGrowthStage: "Fase de crecimiento actual",
    selectGrowthStage: "Seleccionar fase de crecimiento",
    saveCropData: "💾 Guardar datos del cultivo",
    projectDevelopment: "EVOLUCIÓN DEL PROYECTO",
    eventHistory: "Historial de eventos",
    analysisLabel: "ANÁLISIS",
    analysisCompleted: "Análisis completado",
    recommendationLabel: "RECOMENDACIÓN",
    recommendationCreated: "Recomendación creada",
    noHistoricalEvents: "Aún no hay eventos históricos disponibles.",
    showCompleteProjectHistory: "Mostrar historial completo del proyecto",
    editProjectData: "Editar datos del proyecto",
    readOnly: "Solo lectura",
    recommendationHistory: "Historial de recomendaciones",
    trendWorsening: "La evolución empeora",
    trendImproving: "El estado del cultivo mejora",
    trendStable: "La evolución es estable",
    trendInsufficient: "Datos históricos insuficientes",
    longTermDecline: "Descenso a largo plazo de la actividad del cultivo",
    trendRising: "Ascendente",
    trendFalling: "Descendente",
    trendStableShort: "Estable",
    trendWindowInsufficient: "datos insuficientes",
    noMajorRiskFactor: "Sin factor de riesgo significativo",
    strengthVeryStrong: "Muy fuerte",
    strengthStrong: "Fuerte",
    strengthMedium: "Media",
    strengthWeak: "Débil",
    supplyLow: "baja",
    supplySatisfactory: "satisfactoria",
    supplyGood: "buena",
    supplyHigh: "alta",
    supplyVeryHigh: "muy alta",
  };
  const it = {
    invalidProjectId: "ID progetto non valido.",
    projectLoadFailed: "Impossibile caricare il progetto.",
    projectNotFound: "Il progetto non è stato trovato oppure non hai accesso.",
    projectOrganizationInvalid: "Il progetto non ha un’organizzazione valida impostata.",
    permissionCheckFailed: "Impossibile verificare l’accesso al progetto.",
    nutritionLoadFailed: "Impossibile caricare i dati di fertilizzazione.",
    nutritionNumberInvalid: "I valori nutrizionali devono essere numeri validi.",
    plannedYieldPositive: "La resa pianificata deve essere maggiore di 0.",
    phRange: "Il pH deve essere compreso tra 0 e 14.",
    phosphorusMethodRequired: "Seleziona il metodo di determinazione del fosforo (SP o ICP-OES).",
    soilTextureRequired: "Seleziona la classe di tessitura del suolo per la classificazione di K e Mg.",
    nutritionSaveFailed: "Impossibile salvare i dati di fertilizzazione.",
    varietyRequired: "LA VARIETÀ È OBBLIGATORIA",
    varietyMismatch: "La varietà selezionata non appartiene alla coltura selezionata.",
    areaPositive: "La superficie deve essere maggiore di 0.",
    accessDenied: "Accesso negato",
    noProjectAccess: "Non hai accesso a questo progetto",
    projectAccessDescription: "Il progetto non esiste oppure non hai l’autorizzazione per visualizzarlo.",
    backToProjects: "Torna ai progetti",
    loadingProject: "Caricamento progetto...",
    back: "Indietro",
    cropNotSpecified: "Coltura non specificata",
    areaNotSpecified: "Superficie non specificata",
    growthStageNotSpecified: "Fase di crescita non specificata",
    updated: "Aggiornato",
    refreshData: "Aggiorna dati",
    refresh: "Aggiorna",
    analyzing: "Analisi in corso…",
    runAnalysis: "Avvia nuova analisi",
    projectInformation: "Informazioni sul progetto",
    latitude: "Latitudine",
    longitude: "Longitudine",
    area: "Superficie",
    growthStage: "Fase di crescita",
    created: "Creato",
    currentVegetation: "Stato attuale della vegetazione",
    overallAssessment: "Valutazione complessiva",
    analysisUnavailable: "L’analisi non è ancora disponibile",
    mainReason: "Motivo principale",
    cropCondition: "CONDIZIONE DELLA COLTURA",
    priority: "Priorità",
    previous: "rispetto al precedente",
    lastAnalysis: "Ultima analisi",
    storedDecisionSnapshot: "AEGRIS mostra lo snapshot decisionale del server salvato",
    legacyWeatherSnapshot: "L’analisi legacy utilizza lo snapshot delle condizioni salvato",
    viewerReadOnly: "L’accesso Viewer è di sola lettura.",
    serverAnalysisReady: "Analisi server pronta",
    contextualAssessment: "Valutazione contestuale",
    contextualScore: "Punteggio contestuale AEGRIS",
    criticalFactors: "Fattori critici",
    ofFactors: "su",
    criticalFactorsLabel: "fattori critici",
    dataConfidence: "Affidabilità dei dati",
    dataReliability: "AFFIDABILITÀ DEI DATI",
    analysisQualityOrigin: "QUALITÀ E ORIGINE DELL’ANALISI",
    analysisMetadata: "Metadati tecnici dell’ultima analisi Sentinel salvata.",
    validCoverage: "Copertura valida",
    source: "Fonte",
    spatialResolution: "Risoluzione spaziale",
    crsNotSpecified: "CRS non specificato",
    validPixels: "Pixel validi",
    afterMasking: "dopo mascheratura nuvole / no-data",
    qualityGate: "Soglia di qualità",
    minimumPolygonCoverage: "copertura valida minima del poligono",
    acceptedIntervals: "Intervalli accettati",
    rejectedIntervals: "Intervalli rifiutati",
    medianNdvi: "NDVI mediano",
    provenanceNote: "L’NDVI è calcolato dalle bande Sentinel-2 B08 e B04. I pixel non validi vengono filtrati mediante Scene Classification Layer (SCL) e dataMask. I dati meteo di AEGRIS provengono da una fonte separata e la valutazione storica usa lo snapshot salvato.",
    noQualityMetadata: "Questa analisi salvata non contiene ancora metadati di qualità. Avvia una nuova analisi; AEGRIS salverà quindi la fonte effettiva, la risoluzione, la copertura valida e la soglia di qualità direttamente dal risultato Copernicus.",
    decisionRecommendation: "RACCOMANDAZIONE DECISIONALE",
    whatIsHappening: "COSA STA SUCCEDENDO",
    longTermTrend: "TENDENZA A LUNGO TERMINE",
    sinceLastAnalysis: "DALL’ULTIMA ANALISI",
    whatToDoNow: "COSA FARE ORA",
    nextStep: "PASSO SUCCESSIVO",
    projectAlerts: "AVVISI DEL PROGETTO",
    unread: "Non letti",
    newLabel: "NUOVO",
    markAsRead: "Segna come letto",
    noAlerts: "Non è stato ancora creato alcun avviso.",
    showAllAlerts: "Mostra tutti gli avvisi",
    recommendations: "RACCOMANDAZIONI AEGRIS",
    diagnosis: "DIAGNOSTICA AEGRIS",
    probableCauses: "Cause probabili del rischio attuale",
    diagnosisShort: "diag.",
    indicationStrength: "Forza dell’indicazione",
    noDiagnosis: "Attualmente non è stata identificata alcuna diagnosi.",
    keyFactors: "FATTORI CHIAVE",
    inRange: "NEL RANGE",
    score: "Punteggio",
    weight: "peso",
    ndviDevelopment: "ANDAMENTO NDVI",
    trend: "Tendenza",
    trendWindow: "Finestra di tendenza",
    stateAndRecommendations: "EVOLUZIONE DELLO STATO E DELLE RACCOMANDAZIONI",
    noRecord: "Nessun dato registrato.",
    showRecommendationHistory: "Mostra storico raccomandazioni",
    analysisHistory: "STORICO ANALISI",
    weatherConditions: "METEO E CONDIZIONI",
    currentLocalConditions: "CONDIZIONI ATTUALI NELLA LOCALITÀ",
    temperature: "Temperatura",
    humidity: "Umidità",
    precipitationLastHour: "Precipitazioni – ultima ora",
    wind: "Vento",
    current: "Attuale",
    loadingWeather: "Caricamento meteo...",
    weatherLoadFailed: "Impossibile caricare il meteo.",
    tempWithinProfile: "Nel range del profilo",
    tempOutsideProfile: "Fuori dal range del profilo",
    noEvaluation: "Non valutato",
    nutritionTitle: "AEGRIS AGRONOMY · NUTRIZIONE E FERTILIZZAZIONE",
    nutritionMethodProfile: "PROFILO METODOLOGICO DI NUTRIZIONE DELLA COLTURA",
    nutritionMethodDescription: "Il calcolo si basa sulla metodologia ÚKZÚZ. AEGRIS non mostra una dose specifica quando mancano i dati necessari per determinarla in sicurezza.",
    nutritionProfileAvailable: "Profilo nutrizionale disponibile",
    nutritionProfileUnavailable: "Profilo nutrizionale non disponibile",
    closeInputs: "Chiudi dati",
    completeInputs: "✎ Completa dati",
    loadingNutrition: "Caricamento profilo nutrizionale…",
    plannedYield: "Resa pianificata",
    lowYield: "Livello di resa basso",
    mediumYield: "Livello di resa medio",
    highYield: "Livello di resa alto",
    neededForNutrition: "Necessario per il calcolo nutrizionale",
    nitrogen: "Azoto N",
    base: "Base",
    minimum: "minimo",
    plannedYieldMissing: "Manca la resa pianificata.",
    phosphorus: "Fosforo P₂O₅",
    potassium: "Potassio K₂O",
    magnesium: "Magnesio MgO",
    methodNotSpecified: "metodo non specificato",
    missingP: "Manca l’analisi del P nel suolo.",
    missingK: "Manca l’analisi del K nel suolo.",
    missingMg: "Manca l’analisi del Mg nel suolo.",
    methodologySource: "Fonte metodologica",
    soilSupplyClassification: "Classificazione della dotazione nutritiva del suolo",
    soilTexture: "Tessitura del suolo",
    phosphorusMethod: "Metodo P",
    notSpecifiedMasculine: "non specificato",
    notSpecifiedFeminine: "non specificata",
    kmgRatio: "Rapporto K : Mg",
    kCoefficient: "Coefficiente K",
    kmgNeedBoth: "Per la correzione devono essere inseriti sia K sia Mg.",
    nitrogenCorrection: "Correzione N",
    predecessor: "Coltura precedente",
    noAppliedCorrection: "nessuna correzione applicata",
    organicFertilization: "Fertilizzazione organica",
    noAppliedDeduction: "nessuna detrazione applicata",
    nminStoredNote: "salvato come valore di affinamento, non detratto automaticamente",
    frameworkNitrogenSplit: "Ripartizione indicativa dell’azoto",
    doseCannotCalculate: "la dose non può essere calcolata",
    noNitrogenSplit: "Per questa coltura non è disponibile una ripartizione di N nel database.",
    addYieldForNitrogen: "Inserisci la resa pianificata per una raccomandazione specifica di azoto. AEGRIS non stima la dose senza questo dato.",
    nutritionInputs: "Dati per il calcolo nutrizionale",
    plannedYieldUnit: "Resa pianificata (t/ha)",
    soilTextureForKMg: "Tessitura del suolo per K / Mg",
    select: "Seleziona",
    lightSoil: "Suolo leggero",
    mediumSoil: "Suolo medio",
    heavySoil: "Suolo pesante",
    phosphorusDetermination: "Metodo di determinazione del P",
    soilP: "P nel suolo (mg/kg)",
    soilK: "K nel suolo (mg/kg)",
    soilMg: "Mg nel suolo (mg/kg)",
    soilPh: "pH del suolo",
    predecessorCrop: "Coltura precedente",
    predecessorExample: "es. trifoglio",
    predecessorGroup: "Gruppo della coltura precedente",
    noCorrectionOther: "Nessuna correzione / altro",
    clovers: "Trifogli",
    legumes: "Leguminose",
    organicFertilizer: "Fertilizzante organico",
    noDeduction: "Nessuna detrazione",
    manure: "Letame",
    slurry: "Colaticcio",
    liquidManure: "Liquame",
    slurryType: "Tipo di liquame",
    cattle: "Bovini",
    pigs: "Suini",
    poultry: "Pollame",
    organicRate: "Dose di fertilizzante organico (t/ha)",
    applicationPeriod: "Periodo di applicazione",
    organicNYear: "Anno di effetto dell’N organico",
    firstYear: "1° anno",
    secondYear: "2° anno",
    dataSource: "Fonte dati",
    dataSourcePlaceholder: "es. analisi del suolo 2026 / analisi di laboratorio",
    note: "Nota",
    saving: "Salvataggio…",
    saveNutritionInputs: "💾 Salva dati nutrizionali",
    projectDetails: "DETTAGLI PROGETTO",
    crop: "Coltura",
    variety: "Varietà",
    sowingDate: "Data di semina",
    expectedHarvest: "Raccolta prevista",
    farmingMethod: "Metodo di coltivazione",
    editCropData: "✎ Modifica dati coltura",
    cropProfile: "PROFILO COLTURA",
    profileNotEvaluated: "Profilo non valutato",
    moisture: "Umidità",
    soilPH: "pH del suolo",
    waterNeed: "Fabbisogno idrico",
    notSpecified: "Non specificato",
    stage: "Fase",
    waterStress: "Stress idrico",
    projectLocation: "POSIZIONE DEL PROGETTO",
    cropDataEditing: "MODIFICA DATI COLTURA",
    cultivatedCrop: "Coltura coltivata",
    originalValue: "Valore originale",
    selectCropUkzuz: "Seleziona coltura da ÚKZÚZ",
    noAgronomicProfile: "A questa coltura ufficiale non è ancora assegnato un profilo agronomico.",
    loadingVarieties: "Caricamento varietà ÚKZÚZ...",
    selectVarietyUkzuz: "Seleziona varietà da ÚKZÚZ",
    noActiveVarieties: "Non sono disponibili varietà attive per questa coltura",
    areaHa: "Superficie (ha)",
    farmingMethodLabel: "Metodo di coltivazione",
    conventional: "Convenzionale",
    integrated: "Integrato",
    organic: "Biologico",
    other: "Altro",
    sowingPlantingDate: "Data di semina / trapianto",
    expectedHarvestDate: "Raccolta prevista",
    currentGrowthStage: "Fase di crescita attuale",
    selectGrowthStage: "Seleziona fase di crescita",
    saveCropData: "💾 Salva dati coltura",
    projectDevelopment: "EVOLUZIONE DEL PROGETTO",
    eventHistory: "Storico eventi",
    analysisLabel: "ANALISI",
    analysisCompleted: "Analisi completata",
    recommendationLabel: "RACCOMANDAZIONE",
    recommendationCreated: "Raccomandazione creata",
    noHistoricalEvents: "Non sono ancora disponibili eventi storici.",
    showCompleteProjectHistory: "Mostra cronologia completa del progetto",
    editProjectData: "Modifica dati progetto",
    readOnly: "Sola lettura",
    recommendationHistory: "Storico raccomandazioni",
    trendWorsening: "L’andamento sta peggiorando",
    trendImproving: "La condizione della coltura sta migliorando",
    trendStable: "L’andamento è stabile",
    trendInsufficient: "Dati storici insufficienti",
    longTermDecline: "Calo a lungo termine dell’attività della coltura",
    trendRising: "In aumento",
    trendFalling: "In calo",
    trendStableShort: "Stabile",
    trendWindowInsufficient: "dati insufficienti",
    noMajorRiskFactor: "Nessun fattore di rischio significativo",
    strengthVeryStrong: "Molto forte",
    strengthStrong: "Forte",
    strengthMedium: "Media",
    strengthWeak: "Debole",
    supplyLow: "bassa",
    supplySatisfactory: "soddisfacente",
    supplyGood: "buona",
    supplyHigh: "alta",
    supplyVeryHigh: "molto alta",
  };
  const nl = {
    invalidProjectId: "Ongeldige project-ID.",
    projectLoadFailed: "Project kon niet worden geladen.",
    projectNotFound: "Project is niet gevonden of u hebt er geen toegang toe.",
    projectOrganizationInvalid: "Voor het project is geen geldige organisatie ingesteld.",
    permissionCheckFailed: "Toegang tot het project kon niet worden gecontroleerd.",
    nutritionLoadFailed: "Bemestingsinvoer kon niet worden geladen.",
    nutritionNumberInvalid: "Voedingswaarden moeten geldige getallen zijn.",
    plannedYieldPositive: "De geplande opbrengst moet groter zijn dan 0.",
    phRange: "De pH moet tussen 0 en 14 liggen.",
    phosphorusMethodRequired: "Selecteer de methode voor fosforbepaling (SP of ICP-OES).",
    soilTextureRequired: "Selecteer de bodemtextuurklasse voor K- en Mg-classificatie.",
    nutritionSaveFailed: "Bemestingsinvoer kon niet worden opgeslagen.",
    varietyRequired: "RAS IS VERPLICHT",
    varietyMismatch: "Het geselecteerde ras behoort niet tot het geselecteerde gewas.",
    areaPositive: "De oppervlakte moet groter zijn dan 0.",
    accessDenied: "Toegang geweigerd",
    noProjectAccess: "U hebt geen toegang tot dit project",
    projectAccessDescription: "Het project bestaat niet of u hebt geen toestemming om het te bekijken.",
    backToProjects: "Terug naar projecten",
    loadingProject: "Project laden...",
    back: "Terug",
    cropNotSpecified: "Gewas niet opgegeven",
    areaNotSpecified: "Oppervlakte niet opgegeven",
    growthStageNotSpecified: "Groeistadium niet opgegeven",
    updated: "Bijgewerkt",
    refreshData: "Gegevens vernieuwen",
    refresh: "Vernieuwen",
    analyzing: "Analyseren…",
    runAnalysis: "Nieuwe analyse uitvoeren",
    projectInformation: "Projectinformatie",
    latitude: "Breedtegraad",
    longitude: "Lengtegraad",
    area: "Oppervlakte",
    growthStage: "Groeistadium",
    created: "Aangemaakt",
    currentVegetation: "Huidige vegetatiestatus",
    overallAssessment: "Algemene beoordeling",
    analysisUnavailable: "Analyse is nog niet beschikbaar",
    mainReason: "Belangrijkste reden",
    cropCondition: "GEWASTOESTAND",
    priority: "Prioriteit",
    previous: "t.o.v. vorige",
    lastAnalysis: "Laatste analyse",
    storedDecisionSnapshot: "AEGRIS toont de opgeslagen serverbeslissingssnapshot",
    legacyWeatherSnapshot: "Legacy-analyse gebruikt de opgeslagen conditiesnapshot",
    viewerReadOnly: "Viewer-toegang is alleen-lezen.",
    serverAnalysisReady: "Serveranalyse gereed",
    contextualAssessment: "Contextbeoordeling",
    contextualScore: "AEGRIS-contextscore",
    criticalFactors: "Kritieke factoren",
    ofFactors: "van",
    criticalFactorsLabel: "kritieke factoren",
    dataConfidence: "Datavertrouwen",
    dataReliability: "DATABETROUWBAARHEID",
    analysisQualityOrigin: "KWALITEIT EN HERKOMST VAN DE ANALYSE",
    analysisMetadata: "Technische metadata van de laatst opgeslagen Sentinel-analyse.",
    validCoverage: "Geldige dekking",
    source: "Bron",
    spatialResolution: "Ruimtelijke resolutie",
    crsNotSpecified: "CRS niet opgegeven",
    validPixels: "Geldige pixels",
    afterMasking: "na wolken-/no-data-maskering",
    qualityGate: "Kwaliteitsdrempel",
    minimumPolygonCoverage: "minimale geldige polygoondekking",
    acceptedIntervals: "Geaccepteerde intervallen",
    rejectedIntervals: "Afgewezen intervallen",
    medianNdvi: "Mediaan NDVI",
    provenanceNote: "NDVI wordt berekend uit Sentinel-2-banden B08 en B04. Ongeldige pixels worden gefilterd met de Scene Classification Layer (SCL) en dataMask. AEGRIS-weer komt uit een afzonderlijke weerbron en historische beoordeling gebruikt de opgeslagen snapshot.",
    noQualityMetadata: "Deze opgeslagen analyse bevat nog geen kwaliteitsmetadata. Voer een nieuwe analyse uit; AEGRIS slaat dan de werkelijke bron, resolutie, geldige dekking en kwaliteitsdrempel rechtstreeks uit het Copernicus-resultaat op.",
    decisionRecommendation: "BESLISSINGSADVIES",
    whatIsHappening: "WAT ER GEBEURT",
    longTermTrend: "LANGETERMIJNTREND",
    sinceLastAnalysis: "SINDS DE LAATSTE ANALYSE",
    whatToDoNow: "WAT NU TE DOEN",
    nextStep: "VOLGENDE STAP",
    projectAlerts: "PROJECTMELDINGEN",
    unread: "Ongelezen",
    newLabel: "NIEUW",
    markAsRead: "Markeren als gelezen",
    noAlerts: "Er is nog geen melding aangemaakt.",
    showAllAlerts: "Alle meldingen tonen",
    recommendations: "AEGRIS-AANBEVELINGEN",
    diagnosis: "AEGRIS-DIAGNOSTIEK",
    probableCauses: "Waarschijnlijke oorzaken van het huidige risico",
    diagnosisShort: "diag.",
    indicationStrength: "Sterkte van indicatie",
    noDiagnosis: "Er is momenteel geen diagnose vastgesteld.",
    keyFactors: "BELANGRIJKE FACTOREN",
    inRange: "BINNEN BEREIK",
    score: "Score",
    weight: "gewicht",
    ndviDevelopment: "NDVI-ONTWIKKELING",
    trend: "Trend",
    trendWindow: "Trendvenster",
    stateAndRecommendations: "ONTWIKKELING VAN STATUS EN AANBEVELINGEN",
    noRecord: "Nog geen registratie.",
    showRecommendationHistory: "Aanbevelingsgeschiedenis tonen",
    analysisHistory: "ANALYSEGESCHIEDENIS",
    weatherConditions: "WEER EN OMSTANDIGHEDEN",
    currentLocalConditions: "HUIDIGE OMSTANDIGHEDEN OP DE LOCATIE",
    temperature: "Temperatuur",
    humidity: "Luchtvochtigheid",
    precipitationLastHour: "Neerslag – laatste uur",
    wind: "Wind",
    current: "Actueel",
    loadingWeather: "Weer laden...",
    weatherLoadFailed: "Weer kon niet worden geladen.",
    tempWithinProfile: "Binnen profielbereik",
    tempOutsideProfile: "Buiten profielbereik",
    noEvaluation: "Niet beoordeeld",
    nutritionTitle: "AEGRIS AGRONOMY · VOEDING EN BEMESTING",
    nutritionMethodProfile: "METHODOLOGISCH PROFIEL GEWASVOEDING",
    nutritionMethodDescription: "De berekening is gebaseerd op de ÚKZÚZ-methodiek. AEGRIS toont geen specifieke dosis wanneer invoer ontbreekt die nodig is voor een veilige bepaling.",
    nutritionProfileAvailable: "Voedingsprofiel beschikbaar",
    nutritionProfileUnavailable: "Voedingsprofiel niet beschikbaar",
    closeInputs: "Invoer sluiten",
    completeInputs: "✎ Invoer aanvullen",
    loadingNutrition: "Voedingsprofiel laden…",
    plannedYield: "Geplande opbrengst",
    lowYield: "Laag opbrengstniveau",
    mediumYield: "Gemiddeld opbrengstniveau",
    highYield: "Hoog opbrengstniveau",
    neededForNutrition: "Vereist voor voedingsberekening",
    nitrogen: "Stikstof N",
    base: "Basis",
    minimum: "minimum",
    plannedYieldMissing: "Geplande opbrengst ontbreekt.",
    phosphorus: "Fosfor P₂O₅",
    potassium: "Kalium K₂O",
    magnesium: "Magnesium MgO",
    methodNotSpecified: "methode niet opgegeven",
    missingP: "Bodem-P-analyse ontbreekt.",
    missingK: "Bodem-K-analyse ontbreekt.",
    missingMg: "Bodem-Mg-analyse ontbreekt.",
    methodologySource: "Methodiekbron",
    soilSupplyClassification: "Classificatie van nutriëntenvoorziening van de bodem",
    soilTexture: "Bodemtextuur",
    phosphorusMethod: "P-methode",
    notSpecifiedMasculine: "niet opgegeven",
    notSpecifiedFeminine: "niet opgegeven",
    kmgRatio: "K : Mg-verhouding",
    kCoefficient: "K-coëfficiënt",
    kmgNeedBoth: "Voor de correctie moeten zowel K als Mg worden ingevoerd.",
    nitrogenCorrection: "N-correctie",
    predecessor: "Voorvrucht",
    noAppliedCorrection: "geen correctie toegepast",
    organicFertilization: "Organische bemesting",
    noAppliedDeduction: "geen aftrek toegepast",
    nminStoredNote: "opgeslagen als verfijningswaarde, niet automatisch afgetrokken",
    frameworkNitrogenSplit: "Indicatieve stikstofverdeling",
    doseCannotCalculate: "dosis kan niet worden berekend",
    noNitrogenSplit: "Voor dit gewas is geen N-verdeling in de database beschikbaar.",
    addYieldForNitrogen: "Voer de geplande opbrengst in voor een specifieke stikstofaanbeveling. AEGRIS schat de dosis niet zonder deze invoer.",
    nutritionInputs: "Invoer voor voedingsberekening",
    plannedYieldUnit: "Geplande opbrengst (t/ha)",
    soilTextureForKMg: "Bodemtextuur voor K / Mg",
    select: "Selecteren",
    lightSoil: "Lichte grond",
    mediumSoil: "Middelzware grond",
    heavySoil: "Zware grond",
    phosphorusDetermination: "Methode voor P-bepaling",
    soilP: "Bodem-P (mg/kg)",
    soilK: "Bodem-K (mg/kg)",
    soilMg: "Bodem-Mg (mg/kg)",
    soilPh: "Bodem-pH",
    predecessorCrop: "Voorvrucht",
    predecessorExample: "bijv. klaver",
    predecessorGroup: "Voorvruchtgroep",
    noCorrectionOther: "Geen correctie / anders",
    clovers: "Klavers",
    legumes: "Vlinderbloemigen",
    organicFertilizer: "Organische meststof",
    noDeduction: "Geen aftrek",
    manure: "Stalmest",
    slurry: "Gier",
    liquidManure: "Drijfmest",
    slurryType: "Type drijfmest",
    cattle: "Rundvee",
    pigs: "Varkens",
    poultry: "Pluimvee",
    organicRate: "Dosering organische meststof (t/ha)",
    applicationPeriod: "Toepassingsperiode",
    organicNYear: "Jaar van werking organische N",
    firstYear: "1e jaar",
    secondYear: "2e jaar",
    dataSource: "Gegevensbron",
    dataSourcePlaceholder: "bijv. bodemonderzoek 2026 / laboratoriumanalyse",
    note: "Notitie",
    saving: "Opslaan…",
    saveNutritionInputs: "💾 Voedingsinvoer opslaan",
    projectDetails: "PROJECTDETAILS",
    crop: "Gewas",
    variety: "Ras",
    sowingDate: "Zaaidatum",
    expectedHarvest: "Verwachte oogst",
    farmingMethod: "Teeltmethode",
    editCropData: "✎ Gewasgegevens bewerken",
    cropProfile: "GEWASPROFIEL",
    profileNotEvaluated: "Profiel niet beoordeeld",
    moisture: "Vocht",
    soilPH: "Bodem-pH",
    waterNeed: "Waterbehoefte",
    notSpecified: "Niet opgegeven",
    stage: "Stadium",
    waterStress: "Waterstress",
    projectLocation: "PROJECTLOCATIE",
    cropDataEditing: "GEWASGEGEVENS BEWERKEN",
    cultivatedCrop: "Geteeld gewas",
    originalValue: "Oorspronkelijke waarde",
    selectCropUkzuz: "Gewas uit ÚKZÚZ selecteren",
    noAgronomicProfile: "Aan dit officiële gewas is nog geen agronomisch profiel gekoppeld.",
    loadingVarieties: "ÚKZÚZ-rassen laden...",
    selectVarietyUkzuz: "Ras uit ÚKZÚZ selecteren",
    noActiveVarieties: "Voor dit gewas zijn geen actieve rassen beschikbaar",
    areaHa: "Oppervlakte (ha)",
    farmingMethodLabel: "Teeltmethode",
    conventional: "Conventioneel",
    integrated: "Geïntegreerd",
    organic: "Biologisch",
    other: "Anders",
    sowingPlantingDate: "Zaai-/plantdatum",
    expectedHarvestDate: "Verwachte oogst",
    currentGrowthStage: "Huidig groeistadium",
    selectGrowthStage: "Groeistadium selecteren",
    saveCropData: "💾 Gewasgegevens opslaan",
    projectDevelopment: "PROJECTONTWIKKELING",
    eventHistory: "Gebeurtenisgeschiedenis",
    analysisLabel: "ANALYSE",
    analysisCompleted: "Analyse voltooid",
    recommendationLabel: "AANBEVELING",
    recommendationCreated: "Aanbeveling aangemaakt",
    noHistoricalEvents: "Er zijn nog geen historische gebeurtenissen beschikbaar.",
    showCompleteProjectHistory: "Volledige projectgeschiedenis tonen",
    editProjectData: "Projectgegevens bewerken",
    readOnly: "Alleen-lezen",
    recommendationHistory: "Aanbevelingsgeschiedenis",
    trendWorsening: "De ontwikkeling verslechtert",
    trendImproving: "De gewastoestand verbetert",
    trendStable: "De ontwikkeling is stabiel",
    trendInsufficient: "Onvoldoende historische gegevens",
    longTermDecline: "Langdurige afname van gewasactiviteit",
    trendRising: "Stijgend",
    trendFalling: "Dalend",
    trendStableShort: "Stabiel",
    trendWindowInsufficient: "onvoldoende gegevens",
    noMajorRiskFactor: "Geen significante risicofactor",
    strengthVeryStrong: "Zeer sterk",
    strengthStrong: "Sterk",
    strengthMedium: "Gemiddeld",
    strengthWeak: "Zwak",
    supplyLow: "laag",
    supplySatisfactory: "voldoende",
    supplyGood: "goed",
    supplyHigh: "hoog",
    supplyVeryHigh: "zeer hoog",
  };
  const pt = {
    invalidProjectId: "ID de projeto inválido.",
    projectLoadFailed: "Não foi possível carregar o projeto.",
    projectNotFound: "O projeto não foi encontrado ou não tem acesso ao mesmo.",
    projectOrganizationInvalid: "O projeto não tem uma organização válida definida.",
    permissionCheckFailed: "Não foi possível verificar o acesso ao projeto.",
    nutritionLoadFailed: "Não foi possível carregar os dados de fertilização.",
    nutritionNumberInvalid: "Os valores de nutrição devem ser números válidos.",
    plannedYieldPositive: "A produtividade planeada deve ser superior a 0.",
    phRange: "O pH deve estar entre 0 e 14.",
    phosphorusMethodRequired: "Selecione o método de determinação do fósforo (SP ou ICP-OES).",
    soilTextureRequired: "Selecione a classe de textura do solo para a classificação de K e Mg.",
    nutritionSaveFailed: "Não foi possível guardar os dados de fertilização.",
    varietyRequired: "A VARIEDADE É OBRIGATÓRIA",
    varietyMismatch: "A variedade selecionada não pertence à cultura selecionada.",
    areaPositive: "A área deve ser superior a 0.",
    accessDenied: "Acesso negado",
    noProjectAccess: "Não tem acesso a este projeto",
    projectAccessDescription: "O projeto não existe ou não tem permissão para o visualizar.",
    backToProjects: "Voltar aos projetos",
    loadingProject: "A carregar projeto...",
    back: "Voltar",
    cropNotSpecified: "Cultura não especificada",
    areaNotSpecified: "Área não especificada",
    growthStageNotSpecified: "Fase de crescimento não especificada",
    updated: "Atualizado",
    refreshData: "Atualizar dados",
    refresh: "Atualizar",
    analyzing: "A analisar…",
    runAnalysis: "Executar nova análise",
    projectInformation: "Informações do projeto",
    latitude: "Latitude",
    longitude: "Longitude",
    area: "Área",
    growthStage: "Fase de crescimento",
    created: "Criado",
    currentVegetation: "Estado atual da vegetação",
    overallAssessment: "Avaliação global",
    analysisUnavailable: "A análise ainda não está disponível",
    mainReason: "Motivo principal",
    cropCondition: "CONDIÇÃO DA CULTURA",
    priority: "Prioridade",
    previous: "vs. anterior",
    lastAnalysis: "Última análise",
    storedDecisionSnapshot: "O AEGRIS apresenta o snapshot de decisão do servidor guardado",
    legacyWeatherSnapshot: "A análise legada utiliza o snapshot de condições guardado",
    viewerReadOnly: "O acesso Viewer é apenas de leitura.",
    serverAnalysisReady: "Análise do servidor pronta",
    contextualAssessment: "Avaliação contextual",
    contextualScore: "Pontuação contextual AEGRIS",
    criticalFactors: "Fatores críticos",
    ofFactors: "de",
    criticalFactorsLabel: "fatores críticos",
    dataConfidence: "Confiança dos dados",
    dataReliability: "FIABILIDADE DOS DADOS",
    analysisQualityOrigin: "QUALIDADE E ORIGEM DA ANÁLISE",
    analysisMetadata: "Metadados técnicos da última análise Sentinel guardada.",
    validCoverage: "Cobertura válida",
    source: "Fonte",
    spatialResolution: "Resolução espacial",
    crsNotSpecified: "CRS não especificado",
    validPixels: "Pixéis válidos",
    afterMasking: "após máscara de nuvens / no-data",
    qualityGate: "Limite de qualidade",
    minimumPolygonCoverage: "cobertura válida mínima do polígono",
    acceptedIntervals: "Intervalos aceites",
    rejectedIntervals: "Intervalos rejeitados",
    medianNdvi: "NDVI mediano",
    provenanceNote: "O NDVI é calculado a partir das bandas B08 e B04 do Sentinel-2. Os pixéis inválidos são filtrados através da Scene Classification Layer (SCL) e dataMask. Os dados meteorológicos do AEGRIS provêm de uma fonte separada e a avaliação histórica utiliza o snapshot guardado.",
    noQualityMetadata: "Esta análise guardada ainda não contém metadados de qualidade. Execute uma nova análise; o AEGRIS guardará então a fonte real, a resolução, a cobertura válida e o limite de qualidade diretamente do resultado Copernicus.",
    decisionRecommendation: "RECOMENDAÇÃO DE DECISÃO",
    whatIsHappening: "O QUE ESTÁ A ACONTECER",
    longTermTrend: "TENDÊNCIA DE LONGO PRAZO",
    sinceLastAnalysis: "DESDE A ÚLTIMA ANÁLISE",
    whatToDoNow: "O QUE FAZER AGORA",
    nextStep: "PRÓXIMO PASSO",
    projectAlerts: "ALERTAS DO PROJETO",
    unread: "Não lidos",
    newLabel: "NOVO",
    markAsRead: "Marcar como lido",
    noAlerts: "Ainda não foi criado qualquer alerta.",
    showAllAlerts: "Mostrar todos os alertas",
    recommendations: "RECOMENDAÇÕES AEGRIS",
    diagnosis: "DIAGNÓSTICO AEGRIS",
    probableCauses: "Causas prováveis do risco atual",
    diagnosisShort: "diag.",
    indicationStrength: "Força da indicação",
    noDiagnosis: "Atualmente não foi identificado qualquer diagnóstico.",
    keyFactors: "FATORES-CHAVE",
    inRange: "DENTRO DO INTERVALO",
    score: "Pontuação",
    weight: "peso",
    ndviDevelopment: "EVOLUÇÃO DO NDVI",
    trend: "Tendência",
    trendWindow: "Janela de tendência",
    stateAndRecommendations: "EVOLUÇÃO DO ESTADO E DAS RECOMENDAÇÕES",
    noRecord: "Ainda sem registos.",
    showRecommendationHistory: "Mostrar histórico de recomendações",
    analysisHistory: "HISTÓRICO DE ANÁLISES",
    weatherConditions: "METEOROLOGIA E CONDIÇÕES",
    currentLocalConditions: "CONDIÇÕES ATUAIS NO LOCAL",
    temperature: "Temperatura",
    humidity: "Humidade",
    precipitationLastHour: "Precipitação – última hora",
    wind: "Vento",
    current: "Atual",
    loadingWeather: "A carregar meteorologia...",
    weatherLoadFailed: "Não foi possível carregar a meteorologia.",
    tempWithinProfile: "Dentro do intervalo do perfil",
    tempOutsideProfile: "Fora do intervalo do perfil",
    noEvaluation: "Não avaliado",
    nutritionTitle: "AEGRIS AGRONOMY · NUTRIÇÃO E FERTILIZAÇÃO",
    nutritionMethodProfile: "PERFIL METODOLÓGICO DE NUTRIÇÃO DA CULTURA",
    nutritionMethodDescription: "O cálculo baseia-se na metodologia ÚKZÚZ. O AEGRIS não apresenta uma dose específica quando faltam os dados necessários para uma determinação segura.",
    nutritionProfileAvailable: "Perfil nutricional disponível",
    nutritionProfileUnavailable: "Perfil nutricional indisponível",
    closeInputs: "Fechar dados",
    completeInputs: "✎ Completar dados",
    loadingNutrition: "A carregar perfil nutricional…",
    plannedYield: "Produtividade planeada",
    lowYield: "Nível de produtividade baixo",
    mediumYield: "Nível de produtividade médio",
    highYield: "Nível de produtividade alto",
    neededForNutrition: "Necessário para o cálculo da nutrição",
    nitrogen: "Azoto N",
    base: "Base",
    minimum: "mínimo",
    plannedYieldMissing: "Falta a produtividade planeada.",
    phosphorus: "Fósforo P₂O₅",
    potassium: "Potássio K₂O",
    magnesium: "Magnésio MgO",
    methodNotSpecified: "método não especificado",
    missingP: "Falta a análise de P do solo.",
    missingK: "Falta a análise de K do solo.",
    missingMg: "Falta a análise de Mg do solo.",
    methodologySource: "Fonte metodológica",
    soilSupplyClassification: "Classificação do fornecimento de nutrientes do solo",
    soilTexture: "Textura do solo",
    phosphorusMethod: "Método P",
    notSpecifiedMasculine: "não especificado",
    notSpecifiedFeminine: "não especificada",
    kmgRatio: "Relação K : Mg",
    kCoefficient: "Coeficiente K",
    kmgNeedBoth: "É necessário introduzir K e Mg para a correção.",
    nitrogenCorrection: "Correção N",
    predecessor: "Cultura precedente",
    noAppliedCorrection: "sem correção aplicada",
    organicFertilization: "Fertilização orgânica",
    noAppliedDeduction: "sem dedução aplicada",
    nminStoredNote: "guardado como valor de refinamento, não deduzido automaticamente",
    frameworkNitrogenSplit: "Fracionamento indicativo do azoto",
    doseCannotCalculate: "não é possível calcular a dose",
    noNitrogenSplit: "Não existe fracionamento de N disponível na base de dados para esta cultura.",
    addYieldForNitrogen: "Introduza a produtividade planeada para uma recomendação específica de azoto. O AEGRIS não estima a dose sem este dado.",
    nutritionInputs: "Dados para o cálculo da nutrição",
    plannedYieldUnit: "Produtividade planeada (t/ha)",
    soilTextureForKMg: "Textura do solo para K / Mg",
    select: "Selecionar",
    lightSoil: "Solo leve",
    mediumSoil: "Solo médio",
    heavySoil: "Solo pesado",
    phosphorusDetermination: "Método de determinação de P",
    soilP: "P do solo (mg/kg)",
    soilK: "K do solo (mg/kg)",
    soilMg: "Mg do solo (mg/kg)",
    soilPh: "pH do solo",
    predecessorCrop: "Cultura precedente",
    predecessorExample: "por ex., trevo",
    predecessorGroup: "Grupo da cultura precedente",
    noCorrectionOther: "Sem correção / outro",
    clovers: "Trevos",
    legumes: "Leguminosas",
    organicFertilizer: "Fertilizante orgânico",
    noDeduction: "Sem dedução",
    manure: "Estrume",
    slurry: "Chorume líquido",
    liquidManure: "Chorume",
    slurryType: "Tipo de chorume",
    cattle: "Bovinos",
    pigs: "Suínos",
    poultry: "Aves",
    organicRate: "Dose de fertilizante orgânico (t/ha)",
    applicationPeriod: "Período de aplicação",
    organicNYear: "Ano de efeito do N orgânico",
    firstYear: "1.º ano",
    secondYear: "2.º ano",
    dataSource: "Fonte de dados",
    dataSourcePlaceholder: "por ex., análise de solo 2026 / análise laboratorial",
    note: "Nota",
    saving: "A guardar…",
    saveNutritionInputs: "💾 Guardar dados de nutrição",
    projectDetails: "DETALHES DO PROJETO",
    crop: "Cultura",
    variety: "Variedade",
    sowingDate: "Data de sementeira",
    expectedHarvest: "Colheita prevista",
    farmingMethod: "Método de cultivo",
    editCropData: "✎ Editar dados da cultura",
    cropProfile: "PERFIL DA CULTURA",
    profileNotEvaluated: "Perfil não avaliado",
    moisture: "Humidade",
    soilPH: "pH do solo",
    waterNeed: "Necessidade de água",
    notSpecified: "Não especificado",
    stage: "Fase",
    waterStress: "Stress hídrico",
    projectLocation: "LOCALIZAÇÃO DO PROJETO",
    cropDataEditing: "EDITAR DADOS DA CULTURA",
    cultivatedCrop: "Cultura instalada",
    originalValue: "Valor original",
    selectCropUkzuz: "Selecionar cultura de ÚKZÚZ",
    noAgronomicProfile: "Ainda não está atribuído qualquer perfil agronómico a esta cultura oficial.",
    loadingVarieties: "A carregar variedades de ÚKZÚZ...",
    selectVarietyUkzuz: "Selecionar variedade de ÚKZÚZ",
    noActiveVarieties: "Não existem variedades ativas disponíveis para esta cultura",
    areaHa: "Área (ha)",
    farmingMethodLabel: "Método de cultivo",
    conventional: "Convencional",
    integrated: "Integrado",
    organic: "Biológico",
    other: "Outro",
    sowingPlantingDate: "Data de sementeira / plantação",
    expectedHarvestDate: "Colheita prevista",
    currentGrowthStage: "Fase de crescimento atual",
    selectGrowthStage: "Selecionar fase de crescimento",
    saveCropData: "💾 Guardar dados da cultura",
    projectDevelopment: "EVOLUÇÃO DO PROJETO",
    eventHistory: "Histórico de eventos",
    analysisLabel: "ANÁLISE",
    analysisCompleted: "Análise concluída",
    recommendationLabel: "RECOMENDAÇÃO",
    recommendationCreated: "Recomendação criada",
    noHistoricalEvents: "Ainda não existem eventos históricos disponíveis.",
    showCompleteProjectHistory: "Mostrar histórico completo do projeto",
    editProjectData: "Editar dados do projeto",
    readOnly: "Apenas leitura",
    recommendationHistory: "Histórico de recomendações",
    trendWorsening: "A evolução está a piorar",
    trendImproving: "A condição da cultura está a melhorar",
    trendStable: "A evolução está estável",
    trendInsufficient: "Dados históricos insuficientes",
    longTermDecline: "Declínio de longo prazo na atividade da cultura",
    trendRising: "A subir",
    trendFalling: "A descer",
    trendStableShort: "Estável",
    trendWindowInsufficient: "dados insuficientes",
    noMajorRiskFactor: "Sem fator de risco significativo",
    strengthVeryStrong: "Muito forte",
    strengthStrong: "Forte",
    strengthMedium: "Média",
    strengthWeak: "Fraca",
    supplyLow: "baixa",
    supplySatisfactory: "satisfatória",
    supplyGood: "boa",
    supplyHigh: "alta",
    supplyVeryHigh: "muito alta",
  };
  const ro = {
    invalidProjectId: "ID de proiect nevalid.",
    projectLoadFailed: "Proiectul nu a putut fi încărcat.",
    projectNotFound: "Proiectul nu a fost găsit sau nu aveți acces la el.",
    projectOrganizationInvalid: "Proiectul nu are setată o organizație validă.",
    permissionCheckFailed: "Accesul la proiect nu a putut fi verificat.",
    nutritionLoadFailed: "Datele de fertilizare nu au putut fi încărcate.",
    nutritionNumberInvalid: "Valorile de nutriție trebuie să fie numere valide.",
    plannedYieldPositive: "Producția planificată trebuie să fie mai mare decât 0.",
    phRange: "pH-ul trebuie să fie între 0 și 14.",
    phosphorusMethodRequired: "Selectați metoda de determinare a fosforului (SP sau ICP-OES).",
    soilTextureRequired: "Selectați clasa texturală a solului pentru clasificarea K și Mg.",
    nutritionSaveFailed: "Datele de fertilizare nu au putut fi salvate.",
    varietyRequired: "SOIUL ESTE OBLIGATORIU",
    varietyMismatch: "Soiul selectat nu aparține culturii selectate.",
    areaPositive: "Suprafața trebuie să fie mai mare decât 0.",
    accessDenied: "Acces refuzat",
    noProjectAccess: "Nu aveți acces la acest proiect",
    projectAccessDescription: "Proiectul nu există sau nu aveți permisiunea de a-l vizualiza.",
    backToProjects: "Înapoi la proiecte",
    loadingProject: "Se încarcă proiectul...",
    back: "Înapoi",
    cropNotSpecified: "Cultura nu este specificată",
    areaNotSpecified: "Suprafața nu este specificată",
    growthStageNotSpecified: "Stadiul de creștere nu este specificat",
    updated: "Actualizat",
    refreshData: "Actualizează datele",
    refresh: "Actualizează",
    analyzing: "Se analizează…",
    runAnalysis: "Rulează o analiză nouă",
    projectInformation: "Informații despre proiect",
    latitude: "Latitudine",
    longitude: "Longitudine",
    area: "Suprafață",
    growthStage: "Stadiu de creștere",
    created: "Creat",
    currentVegetation: "Starea actuală a vegetației",
    overallAssessment: "Evaluare generală",
    analysisUnavailable: "Analiza nu este încă disponibilă",
    mainReason: "Motiv principal",
    cropCondition: "STAREA CULTURII",
    priority: "Prioritate",
    previous: "față de precedenta",
    lastAnalysis: "Ultima analiză",
    storedDecisionSnapshot: "AEGRIS afișează snapshotul de decizie al serverului salvat",
    legacyWeatherSnapshot: "Analiza legacy utilizează snapshotul condițiilor salvat",
    viewerReadOnly: "Accesul Viewer este doar în citire.",
    serverAnalysisReady: "Analiza serverului este pregătită",
    contextualAssessment: "Evaluare contextuală",
    contextualScore: "Scor contextual AEGRIS",
    criticalFactors: "Factori critici",
    ofFactors: "din",
    criticalFactorsLabel: "factori critici",
    dataConfidence: "Încrederea în date",
    dataReliability: "FIABILITATEA DATELOR",
    analysisQualityOrigin: "CALITATEA ȘI ORIGINEA ANALIZEI",
    analysisMetadata: "Metadate tehnice ale ultimei analize Sentinel salvate.",
    validCoverage: "Acoperire validă",
    source: "Sursă",
    spatialResolution: "Rezoluție spațială",
    crsNotSpecified: "CRS nespecificat",
    validPixels: "Pixeli valizi",
    afterMasking: "după mascarea norilor / no-data",
    qualityGate: "Prag de calitate",
    minimumPolygonCoverage: "acoperire validă minimă a poligonului",
    acceptedIntervals: "Intervale acceptate",
    rejectedIntervals: "Intervale respinse",
    medianNdvi: "NDVI median",
    provenanceNote: "NDVI este calculat din benzile Sentinel-2 B08 și B04. Pixelii invalizi sunt filtrați folosind Scene Classification Layer (SCL) și dataMask. Datele meteo AEGRIS provin dintr-o sursă meteo separată, iar evaluarea istorică utilizează snapshotul salvat.",
    noQualityMetadata: "Această analiză salvată nu conține încă metadate de calitate. Rulați o analiză nouă; AEGRIS va salva apoi sursa reală, rezoluția, acoperirea validă și pragul de calitate direct din rezultatul Copernicus.",
    decisionRecommendation: "RECOMANDARE DECIZIONALĂ",
    whatIsHappening: "CE SE ÎNTÂMPLĂ",
    longTermTrend: "TENDINȚĂ PE TERMEN LUNG",
    sinceLastAnalysis: "DE LA ULTIMA ANALIZĂ",
    whatToDoNow: "CE TREBUIE FĂCUT ACUM",
    nextStep: "PASUL URMĂTOR",
    projectAlerts: "ALERTELE PROIECTULUI",
    unread: "Necitite",
    newLabel: "NOU",
    markAsRead: "Marchează ca citit",
    noAlerts: "Nu a fost creată încă nicio alertă.",
    showAllAlerts: "Afișează toate alertele",
    recommendations: "RECOMANDĂRI AEGRIS",
    diagnosis: "DIAGNOSTIC AEGRIS",
    probableCauses: "Cauze probabile ale riscului actual",
    diagnosisShort: "diag.",
    indicationStrength: "Puterea indicației",
    noDiagnosis: "În prezent nu este identificat niciun diagnostic.",
    keyFactors: "FACTORI-CHEIE",
    inRange: "ÎN INTERVAL",
    score: "Scor",
    weight: "pondere",
    ndviDevelopment: "EVOLUȚIA NDVI",
    trend: "Tendință",
    trendWindow: "Fereastra tendinței",
    stateAndRecommendations: "EVOLUȚIA STĂRII ȘI A RECOMANDĂRILOR",
    noRecord: "Nicio înregistrare încă.",
    showRecommendationHistory: "Afișează istoricul recomandărilor",
    analysisHistory: "ISTORICUL ANALIZELOR",
    weatherConditions: "METEO ȘI CONDIȚII",
    currentLocalConditions: "CONDIȚII CURENTE LA LOCAȚIE",
    temperature: "Temperatură",
    humidity: "Umiditate",
    precipitationLastHour: "Precipitații – ultima oră",
    wind: "Vânt",
    current: "Curent",
    loadingWeather: "Se încarcă vremea...",
    weatherLoadFailed: "Vremea nu a putut fi încărcată.",
    tempWithinProfile: "În intervalul profilului",
    tempOutsideProfile: "În afara intervalului profilului",
    noEvaluation: "Neevaluat",
    nutritionTitle: "AEGRIS AGRONOMY · NUTRIȚIE ȘI FERTILIZARE",
    nutritionMethodProfile: "PROFIL METODOLOGIC DE NUTRIȚIE A CULTURII",
    nutritionMethodDescription: "Calculul se bazează pe metodologia ÚKZÚZ. AEGRIS nu afișează o doză specifică atunci când lipsesc datele necesare pentru o determinare sigură.",
    nutritionProfileAvailable: "Profil nutrițional disponibil",
    nutritionProfileUnavailable: "Profil nutrițional indisponibil",
    closeInputs: "Închide datele",
    completeInputs: "✎ Completează datele",
    loadingNutrition: "Se încarcă profilul nutrițional…",
    plannedYield: "Producție planificată",
    lowYield: "Nivel scăzut de producție",
    mediumYield: "Nivel mediu de producție",
    highYield: "Nivel ridicat de producție",
    neededForNutrition: "Necesar pentru calculul nutriției",
    nitrogen: "Azot N",
    base: "Bază",
    minimum: "minim",
    plannedYieldMissing: "Lipsește producția planificată.",
    phosphorus: "Fosfor P₂O₅",
    potassium: "Potasiu K₂O",
    magnesium: "Magneziu MgO",
    methodNotSpecified: "metodă nespecificată",
    missingP: "Lipsește analiza P din sol.",
    missingK: "Lipsește analiza K din sol.",
    missingMg: "Lipsește analiza Mg din sol.",
    methodologySource: "Sursa metodologiei",
    soilSupplyClassification: "Clasificarea aprovizionării solului cu nutrienți",
    soilTexture: "Textura solului",
    phosphorusMethod: "Metoda P",
    notSpecifiedMasculine: "nespecificat",
    notSpecifiedFeminine: "nespecificată",
    kmgRatio: "Raport K : Mg",
    kCoefficient: "Coeficient K",
    kmgNeedBoth: "Pentru corecție trebuie introduse atât K, cât și Mg.",
    nitrogenCorrection: "Corecție N",
    predecessor: "Cultură premergătoare",
    noAppliedCorrection: "fără corecție aplicată",
    organicFertilization: "Fertilizare organică",
    noAppliedDeduction: "fără deducere aplicată",
    nminStoredNote: "salvat ca valoare de rafinare, fără deducere automată",
    frameworkNitrogenSplit: "Împărțirea orientativă a azotului",
    doseCannotCalculate: "doza nu poate fi calculată",
    noNitrogenSplit: "Nu există în baza de date o împărțire a N pentru această cultură.",
    addYieldForNitrogen: "Introduceți producția planificată pentru o recomandare specifică de azot. AEGRIS nu estimează doza fără această informație.",
    nutritionInputs: "Date pentru calculul nutriției",
    plannedYieldUnit: "Producție planificată (t/ha)",
    soilTextureForKMg: "Textura solului pentru K / Mg",
    select: "Selectați",
    lightSoil: "Sol ușor",
    mediumSoil: "Sol mediu",
    heavySoil: "Sol greu",
    phosphorusDetermination: "Metoda de determinare a P",
    soilP: "P în sol (mg/kg)",
    soilK: "K în sol (mg/kg)",
    soilMg: "Mg în sol (mg/kg)",
    soilPh: "pH-ul solului",
    predecessorCrop: "Cultură premergătoare",
    predecessorExample: "de ex. trifoi",
    predecessorGroup: "Grupa culturii premergătoare",
    noCorrectionOther: "Fără corecție / altul",
    clovers: "Trifoi",
    legumes: "Leguminoase",
    organicFertilizer: "Îngrășământ organic",
    noDeduction: "Fără deducere",
    manure: "Gunoi de grajd",
    slurry: "Must de gunoi",
    liquidManure: "Tulbureală",
    slurryType: "Tipul tulburelii",
    cattle: "Bovine",
    pigs: "Porcine",
    poultry: "Păsări",
    organicRate: "Doza de îngrășământ organic (t/ha)",
    applicationPeriod: "Perioada de aplicare",
    organicNYear: "Anul efectului N organic",
    firstYear: "Anul 1",
    secondYear: "Anul 2",
    dataSource: "Sursa datelor",
    dataSourcePlaceholder: "de ex. analiză de sol 2026 / analiză de laborator",
    note: "Notă",
    saving: "Se salvează…",
    saveNutritionInputs: "💾 Salvează datele de nutriție",
    projectDetails: "DETALIILE PROIECTULUI",
    crop: "Cultură",
    variety: "Soi",
    sowingDate: "Data semănatului",
    expectedHarvest: "Recoltare estimată",
    farmingMethod: "Metodă de cultivare",
    editCropData: "✎ Editează datele culturii",
    cropProfile: "PROFILUL CULTURII",
    profileNotEvaluated: "Profil neevaluat",
    moisture: "Umiditate",
    soilPH: "pH-ul solului",
    waterNeed: "Necesar de apă",
    notSpecified: "Nespecificat",
    stage: "Stadiu",
    waterStress: "Stres hidric",
    projectLocation: "LOCAȚIA PROIECTULUI",
    cropDataEditing: "EDITAREA DATELOR CULTURII",
    cultivatedCrop: "Cultura cultivată",
    originalValue: "Valoare originală",
    selectCropUkzuz: "Selectați cultura din ÚKZÚZ",
    noAgronomicProfile: "Nu este încă atribuit un profil agronomic acestei culturi oficiale.",
    loadingVarieties: "Se încarcă soiurile ÚKZÚZ...",
    selectVarietyUkzuz: "Selectați soiul din ÚKZÚZ",
    noActiveVarieties: "Nu sunt disponibile soiuri active pentru această cultură",
    areaHa: "Suprafață (ha)",
    farmingMethodLabel: "Metodă de cultivare",
    conventional: "Convențional",
    integrated: "Integrat",
    organic: "Ecologic",
    other: "Altul",
    sowingPlantingDate: "Data semănatului / plantării",
    expectedHarvestDate: "Recoltare estimată",
    currentGrowthStage: "Stadiul actual de creștere",
    selectGrowthStage: "Selectați stadiul de creștere",
    saveCropData: "💾 Salvează datele culturii",
    projectDevelopment: "EVOLUȚIA PROIECTULUI",
    eventHistory: "Istoricul evenimentelor",
    analysisLabel: "ANALIZĂ",
    analysisCompleted: "Analiză finalizată",
    recommendationLabel: "RECOMANDARE",
    recommendationCreated: "Recomandare creată",
    noHistoricalEvents: "Nu sunt încă disponibile evenimente istorice.",
    showCompleteProjectHistory: "Afișează istoricul complet al proiectului",
    editProjectData: "Editează datele proiectului",
    readOnly: "Doar citire",
    recommendationHistory: "Istoricul recomandărilor",
    trendWorsening: "Evoluția se înrăutățește",
    trendImproving: "Starea culturii se îmbunătățește",
    trendStable: "Evoluția este stabilă",
    trendInsufficient: "Date istorice insuficiente",
    longTermDecline: "Scădere pe termen lung a activității culturii",
    trendRising: "În creștere",
    trendFalling: "În scădere",
    trendStableShort: "Stabil",
    trendWindowInsufficient: "date insuficiente",
    noMajorRiskFactor: "Fără factor de risc semnificativ",
    strengthVeryStrong: "Foarte puternică",
    strengthStrong: "Puternică",
    strengthMedium: "Medie",
    strengthWeak: "Slabă",
    supplyLow: "scăzută",
    supplySatisfactory: "satisfăcătoare",
    supplyGood: "bună",
    supplyHigh: "ridicată",
    supplyVeryHigh: "foarte ridicată",
  };
  const hu = {
    invalidProjectId: "Érvénytelen projektazonosító.",
    projectLoadFailed: "A projekt betöltése sikertelen.",
    projectNotFound: "A projekt nem található, vagy nincs hozzáférése.",
    projectOrganizationInvalid: "A projekthez nincs érvényes szervezet beállítva.",
    permissionCheckFailed: "A projekthez való hozzáférés ellenőrzése sikertelen.",
    nutritionLoadFailed: "A trágyázási bemenetek nem tölthetők be.",
    nutritionNumberInvalid: "A tápanyagértékeknek érvényes számoknak kell lenniük.",
    plannedYieldPositive: "A tervezett termésnek 0-nál nagyobbnak kell lennie.",
    phRange: "A pH értékének 0 és 14 között kell lennie.",
    phosphorusMethodRequired: "Válassza ki a foszformeghatározás módszerét (SP vagy ICP-OES).",
    soilTextureRequired: "Válassza ki a talaj textúraosztályát a K- és Mg-besoroláshoz.",
    nutritionSaveFailed: "A trágyázási bemenetek nem menthetők.",
    varietyRequired: "A FAJTA MEGADÁSA KÖTELEZŐ",
    varietyMismatch: "A kiválasztott fajta nem tartozik a kiválasztott növényhez.",
    areaPositive: "A területnek 0-nál nagyobbnak kell lennie.",
    accessDenied: "Hozzáférés megtagadva",
    noProjectAccess: "Nincs hozzáférése ehhez a projekthez",
    projectAccessDescription: "A projekt nem létezik, vagy nincs jogosultsága a megtekintéséhez.",
    backToProjects: "Vissza a projektekhez",
    loadingProject: "Projekt betöltése...",
    back: "Vissza",
    cropNotSpecified: "Növény nincs megadva",
    areaNotSpecified: "Terület nincs megadva",
    growthStageNotSpecified: "Fejlődési szakasz nincs megadva",
    updated: "Frissítve",
    refreshData: "Adatok frissítése",
    refresh: "Frissítés",
    analyzing: "Elemzés…",
    runAnalysis: "Új elemzés indítása",
    projectInformation: "Projektinformációk",
    latitude: "Szélesség",
    longitude: "Hosszúság",
    area: "Terület",
    growthStage: "Fejlődési szakasz",
    created: "Létrehozva",
    currentVegetation: "A növényzet aktuális állapota",
    overallAssessment: "Átfogó értékelés",
    analysisUnavailable: "Az elemzés még nem érhető el",
    mainReason: "Fő ok",
    cropCondition: "ÁLLOMÁNYÁLLAPOT",
    priority: "Prioritás",
    previous: "az előzőhöz képest",
    lastAnalysis: "Utolsó elemzés",
    storedDecisionSnapshot: "Az AEGRIS a tárolt szerveroldali döntési snapshotot jeleníti meg",
    legacyWeatherSnapshot: "A korábbi elemzés a tárolt állapot-snapshotot használja",
    viewerReadOnly: "A Viewer hozzáférés csak olvasható.",
    serverAnalysisReady: "A szerverelemzés kész",
    contextualAssessment: "Kontextuális értékelés",
    contextualScore: "AEGRIS kontextuspontszám",
    criticalFactors: "Kritikus tényezők",
    ofFactors: "ebből",
    criticalFactorsLabel: "kritikus tényező",
    dataConfidence: "Adatbizalom",
    dataReliability: "ADATMEGBÍZHATÓSÁG",
    analysisQualityOrigin: "AZ ELEMZÉS MINŐSÉGE ÉS EREDETE",
    analysisMetadata: "A legutóbb mentett Sentinel-elemzés műszaki metaadatai.",
    validCoverage: "Érvényes lefedettség",
    source: "Forrás",
    spatialResolution: "Térbeli felbontás",
    crsNotSpecified: "CRS nincs megadva",
    validPixels: "Érvényes pixelek",
    afterMasking: "felhő / no-data maszkolás után",
    qualityGate: "Minőségi küszöb",
    minimumPolygonCoverage: "minimális érvényes poligonlefedettség",
    acceptedIntervals: "Elfogadott intervallumok",
    rejectedIntervals: "Elutasított intervallumok",
    medianNdvi: "Medián NDVI",
    provenanceNote: "Az NDVI a Sentinel-2 B08 és B04 sávjaiból számítódik. Az érvénytelen pixeleket a Scene Classification Layer (SCL) és a dataMask szűri. Az AEGRIS időjárási adatai külön forrásból származnak, a történeti értékelés pedig a tárolt snapshotot használja.",
    noQualityMetadata: "Ez a mentett elemzés még nem tartalmaz minőségi metaadatokat. Indítson új elemzést; az AEGRIS ezután közvetlenül a Copernicus eredményéből menti a tényleges forrást, felbontást, érvényes lefedettséget és minőségi küszöböt.",
    decisionRecommendation: "DÖNTÉSI AJÁNLÁS",
    whatIsHappening: "MI TÖRTÉNIK",
    longTermTrend: "HOSSZÚ TÁVÚ TREND",
    sinceLastAnalysis: "AZ UTOLSÓ ELEMZÉS ÓTA",
    whatToDoNow: "MI A TEENDŐ MOST",
    nextStep: "KÖVETKEZŐ LÉPÉS",
    projectAlerts: "PROJEKTÉRTESÍTÉSEK",
    unread: "Olvasatlan",
    newLabel: "ÚJ",
    markAsRead: "Megjelölés olvasottként",
    noAlerts: "Még nem készült értesítés.",
    showAllAlerts: "Összes értesítés megjelenítése",
    recommendations: "AEGRIS AJÁNLÁSOK",
    diagnosis: "AEGRIS DIAGNOSZTIKA",
    probableCauses: "A jelenlegi kockázat valószínű okai",
    diagnosisShort: "diag.",
    indicationStrength: "A jelzés erőssége",
    noDiagnosis: "Jelenleg nincs azonosított diagnózis.",
    keyFactors: "KULCSTÉNYEZŐK",
    inRange: "TARTOMÁNYON BELÜL",
    score: "Pontszám",
    weight: "súly",
    ndviDevelopment: "NDVI ALAKULÁSA",
    trend: "Trend",
    trendWindow: "Trendablak",
    stateAndRecommendations: "ÁLLAPOT- ÉS AJÁNLÁSFEJLŐDÉS",
    noRecord: "Még nincs bejegyzés.",
    showRecommendationHistory: "Ajánlási előzmények megjelenítése",
    analysisHistory: "ELEMZÉSI ELŐZMÉNYEK",
    weatherConditions: "IDŐJÁRÁS ÉS KÖRÜLMÉNYEK",
    currentLocalConditions: "AKTUÁLIS HELYI KÖRÜLMÉNYEK",
    temperature: "Hőmérséklet",
    humidity: "Páratartalom",
    precipitationLastHour: "Csapadék – utolsó óra",
    wind: "Szél",
    current: "Aktuális",
    loadingWeather: "Időjárás betöltése...",
    weatherLoadFailed: "Az időjárás nem tölthető be.",
    tempWithinProfile: "Profil tartományán belül",
    tempOutsideProfile: "Profil tartományán kívül",
    noEvaluation: "Nincs értékelve",
    nutritionTitle: "AEGRIS AGRONOMY · TÁPANYAGELLÁTÁS ÉS TRÁGYÁZÁS",
    nutritionMethodProfile: "NÖVÉNYTÁPLÁLÁSI MÓDSZERTANI PROFIL",
    nutritionMethodDescription: "A számítás az ÚKZÚZ módszertanán alapul. Az AEGRIS nem jelenít meg konkrét dózist, ha hiányoznak a biztonságos meghatározáshoz szükséges bemenetek.",
    nutritionProfileAvailable: "Tápanyagprofil elérhető",
    nutritionProfileUnavailable: "Tápanyagprofil nem érhető el",
    closeInputs: "Bemenetek bezárása",
    completeInputs: "✎ Bemenetek kiegészítése",
    loadingNutrition: "Tápanyagprofil betöltése…",
    plannedYield: "Tervezett termés",
    lowYield: "Alacsony termésszint",
    mediumYield: "Közepes termésszint",
    highYield: "Magas termésszint",
    neededForNutrition: "Szükséges a tápanyagszámításhoz",
    nitrogen: "Nitrogén N",
    base: "Alap",
    minimum: "minimum",
    plannedYieldMissing: "Hiányzik a tervezett termés.",
    phosphorus: "Foszfor P₂O₅",
    potassium: "Kálium K₂O",
    magnesium: "Magnézium MgO",
    methodNotSpecified: "módszer nincs megadva",
    missingP: "Hiányzik a talaj P-vizsgálata.",
    missingK: "Hiányzik a talaj K-vizsgálata.",
    missingMg: "Hiányzik a talaj Mg-vizsgálata.",
    methodologySource: "Módszertani forrás",
    soilSupplyClassification: "A talaj tápanyag-ellátottságának besorolása",
    soilTexture: "Talajtextúra",
    phosphorusMethod: "P-módszer",
    notSpecifiedMasculine: "nincs megadva",
    notSpecifiedFeminine: "nincs megadva",
    kmgRatio: "K : Mg arány",
    kCoefficient: "K-együttható",
    kmgNeedBoth: "A korrekcióhoz K és Mg megadása is szükséges.",
    nitrogenCorrection: "N-korrekció",
    predecessor: "Elővetemény",
    noAppliedCorrection: "nincs alkalmazott korrekció",
    organicFertilization: "Szerves trágyázás",
    noAppliedDeduction: "nincs alkalmazott levonás",
    nminStoredNote: "finomító értékként tárolva, automatikusan nem kerül levonásra",
    frameworkNitrogenSplit: "A nitrogén keretjellegű megosztása",
    doseCannotCalculate: "a dózis nem számítható ki",
    noNitrogenSplit: "Ehhez a növényhez nincs N-megosztás az adatbázisban.",
    addYieldForNitrogen: "Adja meg a tervezett termést konkrét nitrogénajánláshoz. Az AEGRIS e bemenet nélkül nem becsli a dózist.",
    nutritionInputs: "Tápanyagszámítás bemenetei",
    plannedYieldUnit: "Tervezett termés (t/ha)",
    soilTextureForKMg: "Talajtextúra K / Mg-hez",
    select: "Válasszon",
    lightSoil: "Könnyű talaj",
    mediumSoil: "Középkötött talaj",
    heavySoil: "Nehéz talaj",
    phosphorusDetermination: "P-meghatározási módszer",
    soilP: "Talaj P (mg/kg)",
    soilK: "Talaj K (mg/kg)",
    soilMg: "Talaj Mg (mg/kg)",
    soilPh: "Talaj pH",
    predecessorCrop: "Elővetemény",
    predecessorExample: "pl. here",
    predecessorGroup: "Elővetemény-csoport",
    noCorrectionOther: "Nincs korrekció / egyéb",
    clovers: "Herék",
    legumes: "Hüvelyesek",
    organicFertilizer: "Szerves trágya",
    noDeduction: "Nincs levonás",
    manure: "Istállótrágya",
    slurry: "Trágyalé",
    liquidManure: "Hígtrágya",
    slurryType: "Hígtrágya típusa",
    cattle: "Szarvasmarha",
    pigs: "Sertés",
    poultry: "Baromfi",
    organicRate: "Szerves trágya dózisa (t/ha)",
    applicationPeriod: "Kijuttatási időszak",
    organicNYear: "A szerves N hatásának éve",
    firstYear: "1. év",
    secondYear: "2. év",
    dataSource: "Adatforrás",
    dataSourcePlaceholder: "pl. talajvizsgálat 2026 / laboratóriumi elemzés",
    note: "Megjegyzés",
    saving: "Mentés…",
    saveNutritionInputs: "💾 Tápanyagbevitelek mentése",
    projectDetails: "PROJEKT RÉSZLETEI",
    crop: "Növény",
    variety: "Fajta",
    sowingDate: "Vetés dátuma",
    expectedHarvest: "Várható betakarítás",
    farmingMethod: "Termesztési mód",
    editCropData: "✎ Növényadatok szerkesztése",
    cropProfile: "NÖVÉNYPROFIL",
    profileNotEvaluated: "Profil nincs értékelve",
    moisture: "Nedvesség",
    soilPH: "Talaj pH",
    waterNeed: "Vízigény",
    notSpecified: "Nincs megadva",
    stage: "Szakasz",
    waterStress: "Vízstressz",
    projectLocation: "PROJEKT HELYSZÍNE",
    cropDataEditing: "NÖVÉNYADATOK SZERKESZTÉSE",
    cultivatedCrop: "Termesztett növény",
    originalValue: "Eredeti érték",
    selectCropUkzuz: "Növény kiválasztása az ÚKZÚZ-ból",
    noAgronomicProfile: "Ehhez a hivatalos növényhez még nincs agronómiai profil rendelve.",
    loadingVarieties: "ÚKZÚZ fajták betöltése...",
    selectVarietyUkzuz: "Fajta kiválasztása az ÚKZÚZ-ból",
    noActiveVarieties: "Ehhez a növényhez nincs elérhető aktív fajta",
    areaHa: "Terület (ha)",
    farmingMethodLabel: "Termesztési mód",
    conventional: "Hagyományos",
    integrated: "Integrált",
    organic: "Ökológiai",
    other: "Egyéb",
    sowingPlantingDate: "Vetés / ültetés dátuma",
    expectedHarvestDate: "Várható betakarítás",
    currentGrowthStage: "Aktuális fejlődési szakasz",
    selectGrowthStage: "Fejlődési szakasz kiválasztása",
    saveCropData: "💾 Növényadatok mentése",
    projectDevelopment: "PROJEKT ALAKULÁSA",
    eventHistory: "Eseményelőzmények",
    analysisLabel: "ELEMZÉS",
    analysisCompleted: "Elemzés befejezve",
    recommendationLabel: "AJÁNLÁS",
    recommendationCreated: "Ajánlás létrehozva",
    noHistoricalEvents: "Még nem érhetők el történeti események.",
    showCompleteProjectHistory: "Teljes projektelőzmény megjelenítése",
    editProjectData: "Projektadatok szerkesztése",
    readOnly: "Csak olvasható",
    recommendationHistory: "Ajánlási előzmények",
    trendWorsening: "A fejlődés romlik",
    trendImproving: "Az állomány állapota javul",
    trendStable: "A fejlődés stabil",
    trendInsufficient: "Nincs elegendő történeti adat",
    longTermDecline: "Az állomány aktivitásának hosszú távú csökkenése",
    trendRising: "Emelkedő",
    trendFalling: "Csökkenő",
    trendStableShort: "Stabil",
    trendWindowInsufficient: "nincs elegendő adat",
    noMajorRiskFactor: "Nincs jelentős kockázati tényező",
    strengthVeryStrong: "Nagyon erős",
    strengthStrong: "Erős",
    strengthMedium: "Közepes",
    strengthWeak: "Gyenge",
    supplyLow: "alacsony",
    supplySatisfactory: "kielégítő",
    supplyGood: "jó",
    supplyHigh: "magas",
    supplyVeryHigh: "nagyon magas",
  };
  const uk = {
    invalidProjectId: "Недійсний ID проєкту.",
    projectLoadFailed: "Не вдалося завантажити проєкт.",
    projectNotFound: "Проєкт не знайдено або у вас немає до нього доступу.",
    projectOrganizationInvalid: "Для проєкту не налаштовано дійсну організацію.",
    permissionCheckFailed: "Не вдалося перевірити доступ до проєкту.",
    nutritionLoadFailed: "Не вдалося завантажити дані удобрення.",
    nutritionNumberInvalid: "Значення живлення мають бути коректними числами.",
    plannedYieldPositive: "Запланована врожайність має бути більшою за 0.",
    phRange: "pH має бути в межах від 0 до 14.",
    phosphorusMethodRequired: "Виберіть метод визначення фосфору (SP або ICP-OES).",
    soilTextureRequired: "Виберіть клас гранулометричного складу ґрунту для класифікації K і Mg.",
    nutritionSaveFailed: "Не вдалося зберегти дані удобрення.",
    varietyRequired: "СОРТ Є ОБОВ’ЯЗКОВИМ",
    varietyMismatch: "Вибраний сорт не належить до вибраної культури.",
    areaPositive: "Площа має бути більшою за 0.",
    accessDenied: "Доступ заборонено",
    noProjectAccess: "У вас немає доступу до цього проєкту",
    projectAccessDescription: "Проєкт не існує або у вас немає дозволу на його перегляд.",
    backToProjects: "Назад до проєктів",
    loadingProject: "Завантаження проєкту...",
    back: "Назад",
    cropNotSpecified: "Культуру не вказано",
    areaNotSpecified: "Площу не вказано",
    growthStageNotSpecified: "Фазу росту не вказано",
    updated: "Оновлено",
    refreshData: "Оновити дані",
    refresh: "Оновити",
    analyzing: "Аналіз…",
    runAnalysis: "Запустити новий аналіз",
    projectInformation: "Інформація про проєкт",
    latitude: "Широта",
    longitude: "Довгота",
    area: "Площа",
    growthStage: "Фаза росту",
    created: "Створено",
    currentVegetation: "Поточний стан рослинності",
    overallAssessment: "Загальна оцінка",
    analysisUnavailable: "Аналіз поки недоступний",
    mainReason: "Основна причина",
    cropCondition: "СТАН ПОСІВУ",
    priority: "Пріоритет",
    previous: "порівняно з попереднім",
    lastAnalysis: "Останній аналіз",
    storedDecisionSnapshot: "AEGRIS відображає збережений серверний snapshot рішення",
    legacyWeatherSnapshot: "Legacy-аналіз використовує збережений snapshot умов",
    viewerReadOnly: "Доступ Viewer лише для читання.",
    serverAnalysisReady: "Серверний аналіз готовий",
    contextualAssessment: "Контекстна оцінка",
    contextualScore: "Контекстний бал AEGRIS",
    criticalFactors: "Критичні фактори",
    ofFactors: "з",
    criticalFactorsLabel: "критичних факторів",
    dataConfidence: "Довіра до даних",
    dataReliability: "НАДІЙНІСТЬ ДАНИХ",
    analysisQualityOrigin: "ЯКІСТЬ І ПОХОДЖЕННЯ АНАЛІЗУ",
    analysisMetadata: "Технічні метадані останнього збереженого аналізу Sentinel.",
    validCoverage: "Валідне покриття",
    source: "Джерело",
    spatialResolution: "Просторова роздільна здатність",
    crsNotSpecified: "CRS не вказано",
    validPixels: "Валідні пікселі",
    afterMasking: "після маскування хмар / no-data",
    qualityGate: "Поріг якості",
    minimumPolygonCoverage: "мінімальне валідне покриття полігону",
    acceptedIntervals: "Прийняті інтервали",
    rejectedIntervals: "Відхилені інтервали",
    medianNdvi: "Медіанний NDVI",
    provenanceNote: "NDVI обчислюється за каналами Sentinel-2 B08 і B04. Невалідні пікселі фільтруються за допомогою Scene Classification Layer (SCL) і dataMask. Погодні дані AEGRIS надходять з окремого джерела, а історична оцінка використовує збережений snapshot.",
    noQualityMetadata: "Цей збережений аналіз ще не містить метаданих якості. Запустіть новий аналіз; AEGRIS тоді збереже фактичне джерело, роздільну здатність, валідне покриття та поріг якості безпосередньо з результату Copernicus.",
    decisionRecommendation: "РЕКОМЕНДАЦІЯ ДЛЯ РІШЕННЯ",
    whatIsHappening: "ЩО ВІДБУВАЄТЬСЯ",
    longTermTrend: "ДОВГОСТРОКОВИЙ ТРЕНД",
    sinceLastAnalysis: "ВІД ОСТАННЬОГО АНАЛІЗУ",
    whatToDoNow: "ЩО РОБИТИ ЗАРАЗ",
    nextStep: "НАСТУПНИЙ КРОК",
    projectAlerts: "СПОВІЩЕННЯ ПРОЄКТУ",
    unread: "Непрочитані",
    newLabel: "НОВЕ",
    markAsRead: "Позначити як прочитане",
    noAlerts: "Ще не створено жодного сповіщення.",
    showAllAlerts: "Показати всі сповіщення",
    recommendations: "РЕКОМЕНДАЦІЇ AEGRIS",
    diagnosis: "ДІАГНОСТИКА AEGRIS",
    probableCauses: "Ймовірні причини поточного ризику",
    diagnosisShort: "діаг.",
    indicationStrength: "Сила індикації",
    noDiagnosis: "Наразі діагноз не визначено.",
    keyFactors: "КЛЮЧОВІ ФАКТОРИ",
    inRange: "У НОРМІ",
    score: "Бал",
    weight: "вага",
    ndviDevelopment: "ДИНАМІКА NDVI",
    trend: "Тренд",
    trendWindow: "Вікно тренду",
    stateAndRecommendations: "ДИНАМІКА СТАНУ ТА РЕКОМЕНДАЦІЙ",
    noRecord: "Записів поки немає.",
    showRecommendationHistory: "Показати історію рекомендацій",
    analysisHistory: "ІСТОРІЯ АНАЛІЗІВ",
    weatherConditions: "ПОГОДА ТА УМОВИ",
    currentLocalConditions: "ПОТОЧНІ УМОВИ В ЛОКАЦІЇ",
    temperature: "Температура",
    humidity: "Вологість",
    precipitationLastHour: "Опади – остання година",
    wind: "Вітер",
    current: "Поточне",
    loadingWeather: "Завантаження погоди...",
    weatherLoadFailed: "Не вдалося завантажити погоду.",
    tempWithinProfile: "У межах профілю",
    tempOutsideProfile: "Поза межами профілю",
    noEvaluation: "Не оцінено",
    nutritionTitle: "AEGRIS AGRONOMY · ЖИВЛЕННЯ ТА УДОБРЕННЯ",
    nutritionMethodProfile: "МЕТОДИЧНИЙ ПРОФІЛ ЖИВЛЕННЯ КУЛЬТУРИ",
    nutritionMethodDescription: "Розрахунок базується на методиці ÚKZÚZ. AEGRIS не показує конкретну дозу, якщо відсутні дані, необхідні для безпечного визначення.",
    nutritionProfileAvailable: "Профіль живлення доступний",
    nutritionProfileUnavailable: "Профіль живлення недоступний",
    closeInputs: "Закрити дані",
    completeInputs: "✎ Доповнити дані",
    loadingNutrition: "Завантаження профілю живлення…",
    plannedYield: "Запланована врожайність",
    lowYield: "Низький рівень урожайності",
    mediumYield: "Середній рівень урожайності",
    highYield: "Високий рівень урожайності",
    neededForNutrition: "Потрібно для розрахунку живлення",
    nitrogen: "Азот N",
    base: "База",
    minimum: "мінімум",
    plannedYieldMissing: "Відсутня запланована врожайність.",
    phosphorus: "Фосфор P₂O₅",
    potassium: "Калій K₂O",
    magnesium: "Магній MgO",
    methodNotSpecified: "метод не вказано",
    missingP: "Відсутній аналіз ґрунту на P.",
    missingK: "Відсутній аналіз ґрунту на K.",
    missingMg: "Відсутній аналіз ґрунту на Mg.",
    methodologySource: "Джерело методики",
    soilSupplyClassification: "Класифікація забезпеченості ґрунту поживними речовинами",
    soilTexture: "Гранулометричний склад ґрунту",
    phosphorusMethod: "Метод P",
    notSpecifiedMasculine: "не вказано",
    notSpecifiedFeminine: "не вказано",
    kmgRatio: "Співвідношення K : Mg",
    kCoefficient: "Коефіцієнт K",
    kmgNeedBoth: "Для корекції потрібно ввести і K, і Mg.",
    nitrogenCorrection: "Корекція N",
    predecessor: "Попередник",
    noAppliedCorrection: "без застосованої корекції",
    organicFertilization: "Органічне удобрення",
    noAppliedDeduction: "без застосованого віднімання",
    nminStoredNote: "збережено як уточнювальне значення, автоматично не віднімається",
    frameworkNitrogenSplit: "Орієнтовний розподіл азоту",
    doseCannotCalculate: "дозу неможливо розрахувати",
    noNitrogenSplit: "Для цієї культури в базі немає схеми розподілу N.",
    addYieldForNitrogen: "Введіть заплановану врожайність для конкретної рекомендації щодо азоту. AEGRIS не оцінює дозу без цього показника.",
    nutritionInputs: "Вхідні дані для розрахунку живлення",
    plannedYieldUnit: "Запланована врожайність (т/га)",
    soilTextureForKMg: "Текстура ґрунту для K / Mg",
    select: "Виберіть",
    lightSoil: "Легкий ґрунт",
    mediumSoil: "Середній ґрунт",
    heavySoil: "Важкий ґрунт",
    phosphorusDetermination: "Метод визначення P",
    soilP: "P у ґрунті (мг/кг)",
    soilK: "K у ґрунті (мг/кг)",
    soilMg: "Mg у ґрунті (мг/кг)",
    soilPh: "pH ґрунту",
    predecessorCrop: "Попередник",
    predecessorExample: "напр. конюшина",
    predecessorGroup: "Група попередника",
    noCorrectionOther: "Без корекції / інше",
    clovers: "Конюшинові",
    legumes: "Бобові",
    organicFertilizer: "Органічне добриво",
    noDeduction: "Без віднімання",
    manure: "Гній",
    slurry: "Гноївка",
    liquidManure: "Рідкий гній",
    slurryType: "Тип рідкого гною",
    cattle: "Велика рогата худоба",
    pigs: "Свині",
    poultry: "Птиця",
    organicRate: "Норма органічного добрива (т/га)",
    applicationPeriod: "Період внесення",
    organicNYear: "Рік дії органічного N",
    firstYear: "1-й рік",
    secondYear: "2-й рік",
    dataSource: "Джерело даних",
    dataSourcePlaceholder: "напр. аналіз ґрунту 2026 / лабораторний аналіз",
    note: "Примітка",
    saving: "Збереження…",
    saveNutritionInputs: "💾 Зберегти дані живлення",
    projectDetails: "ДЕТАЛІ ПРОЄКТУ",
    crop: "Культура",
    variety: "Сорт",
    sowingDate: "Дата сівби",
    expectedHarvest: "Очікуваний збір",
    farmingMethod: "Спосіб вирощування",
    editCropData: "✎ Редагувати дані культури",
    cropProfile: "ПРОФІЛЬ КУЛЬТУРИ",
    profileNotEvaluated: "Профіль не оцінено",
    moisture: "Вологість",
    soilPH: "pH ґрунту",
    waterNeed: "Потреба у воді",
    notSpecified: "Не вказано",
    stage: "Фаза",
    waterStress: "Водний стрес",
    projectLocation: "ЛОКАЦІЯ ПРОЄКТУ",
    cropDataEditing: "РЕДАГУВАННЯ ДАНИХ КУЛЬТУРИ",
    cultivatedCrop: "Вирощувана культура",
    originalValue: "Початкове значення",
    selectCropUkzuz: "Виберіть культуру з ÚKZÚZ",
    noAgronomicProfile: "Для цієї офіційної культури ще не призначено агрономічний профіль.",
    loadingVarieties: "Завантаження сортів ÚKZÚZ...",
    selectVarietyUkzuz: "Виберіть сорт з ÚKZÚZ",
    noActiveVarieties: "Для цієї культури немає активних сортів",
    areaHa: "Площа (га)",
    farmingMethodLabel: "Спосіб вирощування",
    conventional: "Традиційний",
    integrated: "Інтегрований",
    organic: "Органічний",
    other: "Інше",
    sowingPlantingDate: "Дата сівби / посадки",
    expectedHarvestDate: "Очікуваний збір",
    currentGrowthStage: "Поточна фаза росту",
    selectGrowthStage: "Виберіть фазу росту",
    saveCropData: "💾 Зберегти дані культури",
    projectDevelopment: "РОЗВИТОК ПРОЄКТУ",
    eventHistory: "Історія подій",
    analysisLabel: "АНАЛІЗ",
    analysisCompleted: "Аналіз завершено",
    recommendationLabel: "РЕКОМЕНДАЦІЯ",
    recommendationCreated: "Рекомендацію створено",
    noHistoricalEvents: "Історичні події поки недоступні.",
    showCompleteProjectHistory: "Показати повну історію проєкту",
    editProjectData: "Редагувати дані проєкту",
    readOnly: "Лише читання",
    recommendationHistory: "Історія рекомендацій",
    trendWorsening: "Динаміка погіршується",
    trendImproving: "Стан посіву покращується",
    trendStable: "Динаміка стабільна",
    trendInsufficient: "Недостатньо історичних даних",
    longTermDecline: "Довгострокове зниження активності посіву",
    trendRising: "Зростає",
    trendFalling: "Знижується",
    trendStableShort: "Стабільний",
    trendWindowInsufficient: "недостатньо даних",
    noMajorRiskFactor: "Без значного фактора ризику",
    strengthVeryStrong: "Дуже сильна",
    strengthStrong: "Сильна",
    strengthMedium: "Середня",
    strengthWeak: "Слабка",
    supplyLow: "низька",
    supplySatisfactory: "задовільна",
    supplyGood: "добра",
    supplyHigh: "висока",
    supplyVeryHigh: "дуже висока",
  };
  const bg = {
    invalidProjectId: "Невалиден ID на проекта.",
    projectLoadFailed: "Проектът не можа да бъде зареден.",
    projectNotFound: "Проектът не е намерен или нямате достъп до него.",
    projectOrganizationInvalid: "Проектът няма зададена валидна организация.",
    permissionCheckFailed: "Достъпът до проекта не можа да бъде потвърден.",
    nutritionLoadFailed: "Входните данни за торене не можаха да бъдат заредени.",
    nutritionNumberInvalid: "Стойностите за хранене трябва да са валидни числа.",
    plannedYieldPositive: "Планираният добив трябва да е по-голям от 0.",
    phRange: "pH трябва да е между 0 и 14.",
    phosphorusMethodRequired: "Изберете метод за определяне на фосфор (SP или ICP-OES).",
    soilTextureRequired: "Изберете клас на почвената текстура за класификация на K и Mg.",
    nutritionSaveFailed: "Входните данни за торене не можаха да бъдат запазени.",
    varietyRequired: "СОРТЪТ Е ЗАДЪЛЖИТЕЛЕН",
    varietyMismatch: "Избраният сорт не принадлежи към избраната култура.",
    areaPositive: "Площта трябва да е по-голяма от 0.",
    accessDenied: "Достъпът е отказан",
    noProjectAccess: "Нямате достъп до този проект",
    projectAccessDescription: "Проектът не съществува или нямате разрешение да го преглеждате.",
    backToProjects: "Назад към проектите",
    loadingProject: "Зареждане на проекта...",
    back: "Назад",
    cropNotSpecified: "Културата не е посочена",
    areaNotSpecified: "Площта не е посочена",
    growthStageNotSpecified: "Фазата на растеж не е посочена",
    updated: "Актуализирано",
    refreshData: "Обнови данните",
    refresh: "Обнови",
    analyzing: "Анализиране…",
    runAnalysis: "Стартирай нов анализ",
    projectInformation: "Информация за проекта",
    latitude: "Географска ширина",
    longitude: "Географска дължина",
    area: "Площ",
    growthStage: "Фаза на растеж",
    created: "Създадено",
    currentVegetation: "Текущо състояние на растителността",
    overallAssessment: "Обща оценка",
    analysisUnavailable: "Анализът все още не е наличен",
    mainReason: "Основна причина",
    cropCondition: "СЪСТОЯНИЕ НА ПОСЕВА",
    priority: "Приоритет",
    previous: "спрямо предходния",
    lastAnalysis: "Последен анализ",
    storedDecisionSnapshot: "AEGRIS показва запазения сървърен snapshot на решението",
    legacyWeatherSnapshot: "Legacy анализът използва запазения snapshot на условията",
    viewerReadOnly: "Достъпът Viewer е само за четене.",
    serverAnalysisReady: "Сървърният анализ е готов",
    contextualAssessment: "Контекстна оценка",
    contextualScore: "Контекстен резултат AEGRIS",
    criticalFactors: "Критични фактори",
    ofFactors: "от",
    criticalFactorsLabel: "критични фактори",
    dataConfidence: "Доверие в данните",
    dataReliability: "НАДЕЖДНОСТ НА ДАННИТЕ",
    analysisQualityOrigin: "КАЧЕСТВО И ПРОИЗХОД НА АНАЛИЗА",
    analysisMetadata: "Технически метаданни на последния запазен Sentinel анализ.",
    validCoverage: "Валидно покритие",
    source: "Източник",
    spatialResolution: "Пространствена резолюция",
    crsNotSpecified: "CRS не е посочена",
    validPixels: "Валидни пиксели",
    afterMasking: "след маскиране на облаци / no-data",
    qualityGate: "Праг за качество",
    minimumPolygonCoverage: "минимално валидно покритие на полигона",
    acceptedIntervals: "Приети интервали",
    rejectedIntervals: "Отхвърлени интервали",
    medianNdvi: "Медиана NDVI",
    provenanceNote: "NDVI се изчислява от лентите B08 и B04 на Sentinel-2. Невалидните пиксели се филтрират чрез Scene Classification Layer (SCL) и dataMask. Метеорологичните данни на AEGRIS идват от отделен източник, а историческата оценка използва запазения snapshot.",
    noQualityMetadata: "Този запазен анализ все още не съдържа метаданни за качеството. Стартирайте нов анализ; AEGRIS ще запази действителния източник, резолюцията, валидното покритие и прага за качество директно от резултата на Copernicus.",
    decisionRecommendation: "ПРЕПОРЪКА ЗА РЕШЕНИЕ",
    whatIsHappening: "КАКВО СЕ СЛУЧВА",
    longTermTrend: "ДЪЛГОСРОЧЕН ТРЕНД",
    sinceLastAnalysis: "ОТ ПОСЛЕДНИЯ АНАЛИЗ",
    whatToDoNow: "КАКВО ДА НАПРАВИТЕ СЕГА",
    nextStep: "СЛЕДВАЩА СТЪПКА",
    projectAlerts: "СИГНАЛИ НА ПРОЕКТА",
    unread: "Непрочетени",
    newLabel: "НОВО",
    markAsRead: "Маркирай като прочетено",
    noAlerts: "Все още няма създаден сигнал.",
    showAllAlerts: "Покажи всички сигнали",
    recommendations: "ПРЕПОРЪКИ AEGRIS",
    diagnosis: "ДИАГНОСТИКА AEGRIS",
    probableCauses: "Вероятни причини за текущия риск",
    diagnosisShort: "диаг.",
    indicationStrength: "Сила на индикацията",
    noDiagnosis: "В момента няма идентифицирана диагноза.",
    keyFactors: "КЛЮЧОВИ ФАКТОРИ",
    inRange: "В НОРМА",
    score: "Резултат",
    weight: "тежест",
    ndviDevelopment: "РАЗВИТИЕ НА NDVI",
    trend: "Тренд",
    trendWindow: "Прозорец на тренда",
    stateAndRecommendations: "РАЗВИТИЕ НА СЪСТОЯНИЕТО И ПРЕПОРЪКИТЕ",
    noRecord: "Все още няма запис.",
    showRecommendationHistory: "Покажи историята на препоръките",
    analysisHistory: "ИСТОРИЯ НА АНАЛИЗИТЕ",
    weatherConditions: "ВРЕМЕ И УСЛОВИЯ",
    currentLocalConditions: "ТЕКУЩИ УСЛОВИЯ НА МЯСТОТО",
    temperature: "Температура",
    humidity: "Влажност",
    precipitationLastHour: "Валежи – последния час",
    wind: "Вятър",
    current: "Текущо",
    loadingWeather: "Зареждане на времето...",
    weatherLoadFailed: "Времето не можа да бъде заредено.",
    tempWithinProfile: "В диапазона на профила",
    tempOutsideProfile: "Извън диапазона на профила",
    noEvaluation: "Не е оценено",
    nutritionTitle: "AEGRIS AGRONOMY · ХРАНЕНЕ И ТОРЕНЕ",
    nutritionMethodProfile: "МЕТОДИЧЕН ПРОФИЛ ЗА ХРАНЕНЕ НА КУЛТУРАТА",
    nutritionMethodDescription: "Изчислението се основава на методиката ÚKZÚZ. AEGRIS не показва конкретна доза, когато липсват входни данни, необходими за безопасното ѝ определяне.",
    nutritionProfileAvailable: "Хранителен профил наличен",
    nutritionProfileUnavailable: "Хранителен профил не е наличен",
    closeInputs: "Затвори данните",
    completeInputs: "✎ Допълни данните",
    loadingNutrition: "Зареждане на хранителния профил…",
    plannedYield: "Планиран добив",
    lowYield: "Ниско ниво на добив",
    mediumYield: "Средно ниво на добив",
    highYield: "Високо ниво на добив",
    neededForNutrition: "Необходимо за изчисляване на храненето",
    nitrogen: "Азот N",
    base: "База",
    minimum: "минимум",
    plannedYieldMissing: "Липсва планиран добив.",
    phosphorus: "Фосфор P₂O₅",
    potassium: "Калий K₂O",
    magnesium: "Магнезий MgO",
    methodNotSpecified: "методът не е посочен",
    missingP: "Липсва анализ на почвен P.",
    missingK: "Липсва анализ на почвен K.",
    missingMg: "Липсва анализ на почвен Mg.",
    methodologySource: "Източник на методиката",
    soilSupplyClassification: "Класификация на запасеността на почвата с хранителни елементи",
    soilTexture: "Почвена текстура",
    phosphorusMethod: "Метод P",
    notSpecifiedMasculine: "не е посочено",
    notSpecifiedFeminine: "не е посочена",
    kmgRatio: "Съотношение K : Mg",
    kCoefficient: "Коефициент K",
    kmgNeedBoth: "За корекцията трябва да се въведат и K, и Mg.",
    nitrogenCorrection: "Корекция N",
    predecessor: "Предшественик",
    noAppliedCorrection: "без приложена корекция",
    organicFertilization: "Органично торене",
    noAppliedDeduction: "без приложено приспадане",
    nminStoredNote: "запазено като уточняваща стойност, не се приспада автоматично",
    frameworkNitrogenSplit: "Ориентировъчно разделяне на азота",
    doseCannotCalculate: "дозата не може да бъде изчислена",
    noNitrogenSplit: "За тази култура няма налично разделяне на N в базата данни.",
    addYieldForNitrogen: "Въведете планирания добив за конкретна азотна препоръка. AEGRIS не оценява дозата без този вход.",
    nutritionInputs: "Входни данни за изчисляване на храненето",
    plannedYieldUnit: "Планиран добив (t/ha)",
    soilTextureForKMg: "Почвена текстура за K / Mg",
    select: "Изберете",
    lightSoil: "Лека почва",
    mediumSoil: "Средна почва",
    heavySoil: "Тежка почва",
    phosphorusDetermination: "Метод за определяне на P",
    soilP: "P в почвата (mg/kg)",
    soilK: "K в почвата (mg/kg)",
    soilMg: "Mg в почвата (mg/kg)",
    soilPh: "pH на почвата",
    predecessorCrop: "Предшественик",
    predecessorExample: "напр. детелина",
    predecessorGroup: "Група на предшественика",
    noCorrectionOther: "Без корекция / друго",
    clovers: "Детелини",
    legumes: "Бобови",
    organicFertilizer: "Органичен тор",
    noDeduction: "Без приспадане",
    manure: "Оборски тор",
    slurry: "Течен тор",
    liquidManure: "Торова течност",
    slurryType: "Вид торова течност",
    cattle: "Говеда",
    pigs: "Свине",
    poultry: "Птици",
    organicRate: "Доза органичен тор (t/ha)",
    applicationPeriod: "Период на приложение",
    organicNYear: "Година на действие на органичния N",
    firstYear: "1-ва година",
    secondYear: "2-ра година",
    dataSource: "Източник на данни",
    dataSourcePlaceholder: "напр. почвен анализ 2026 / лабораторен анализ",
    note: "Бележка",
    saving: "Запазване…",
    saveNutritionInputs: "💾 Запази данните за хранене",
    projectDetails: "ДЕТАЙЛИ НА ПРОЕКТА",
    crop: "Култура",
    variety: "Сорт",
    sowingDate: "Дата на сеитба",
    expectedHarvest: "Очаквана жътва",
    farmingMethod: "Метод на отглеждане",
    editCropData: "✎ Редактирай данните за културата",
    cropProfile: "ПРОФИЛ НА КУЛТУРАТА",
    profileNotEvaluated: "Профилът не е оценен",
    moisture: "Влажност",
    soilPH: "pH на почвата",
    waterNeed: "Нужда от вода",
    notSpecified: "Не е посочено",
    stage: "Фаза",
    waterStress: "Воден стрес",
    projectLocation: "МЕСТОПОЛОЖЕНИЕ НА ПРОЕКТА",
    cropDataEditing: "РЕДАКТИРАНЕ НА ДАННИ ЗА КУЛТУРАТА",
    cultivatedCrop: "Отглеждана култура",
    originalValue: "Първоначална стойност",
    selectCropUkzuz: "Изберете култура от ÚKZÚZ",
    noAgronomicProfile: "За тази официална култура все още няма зададен агрономичен профил.",
    loadingVarieties: "Зареждане на сортове ÚKZÚZ...",
    selectVarietyUkzuz: "Изберете сорт от ÚKZÚZ",
    noActiveVarieties: "Няма активни сортове за тази култура",
    areaHa: "Площ (ha)",
    farmingMethodLabel: "Метод на отглеждане",
    conventional: "Конвенционално",
    integrated: "Интегрирано",
    organic: "Биологично",
    other: "Друго",
    sowingPlantingDate: "Дата на сеитба / засаждане",
    expectedHarvestDate: "Очаквана жътва",
    currentGrowthStage: "Текуща фаза на растеж",
    selectGrowthStage: "Изберете фаза на растеж",
    saveCropData: "💾 Запази данните за културата",
    projectDevelopment: "РАЗВИТИЕ НА ПРОЕКТА",
    eventHistory: "История на събитията",
    analysisLabel: "АНАЛИЗ",
    analysisCompleted: "Анализът е завършен",
    recommendationLabel: "ПРЕПОРЪКА",
    recommendationCreated: "Препоръката е създадена",
    noHistoricalEvents: "Все още няма налични исторически събития.",
    showCompleteProjectHistory: "Покажи пълната история на проекта",
    editProjectData: "Редактирай данните за проекта",
    readOnly: "Само за четене",
    recommendationHistory: "История на препоръките",
    trendWorsening: "Развитието се влошава",
    trendImproving: "Състоянието на посева се подобрява",
    trendStable: "Развитието е стабилно",
    trendInsufficient: "Недостатъчно исторически данни",
    longTermDecline: "Дългосрочен спад в активността на посева",
    trendRising: "Нарастващ",
    trendFalling: "Намаляващ",
    trendStableShort: "Стабилен",
    trendWindowInsufficient: "недостатъчно данни",
    noMajorRiskFactor: "Без значим рисков фактор",
    strengthVeryStrong: "Много силна",
    strengthStrong: "Силна",
    strengthMedium: "Средна",
    strengthWeak: "Слаба",
    supplyLow: "ниска",
    supplySatisfactory: "задоволителна",
    supplyGood: "добра",
    supplyHigh: "висока",
    supplyVeryHigh: "много висока",
  };
  const hr = {
    invalidProjectId: "Nevažeći ID projekta.",
    projectLoadFailed: "Projekt se nije mogao učitati.",
    projectNotFound: "Projekt nije pronađen ili mu nemate pristup.",
    projectOrganizationInvalid: "Projekt nema postavljenu valjanu organizaciju.",
    permissionCheckFailed: "Nije moguće provjeriti pristup projektu.",
    nutritionLoadFailed: "Ulazne podatke za gnojidbu nije moguće učitati.",
    nutritionNumberInvalid: "Vrijednosti hranidbe moraju biti valjani brojevi.",
    plannedYieldPositive: "Planirani prinos mora biti veći od 0.",
    phRange: "pH mora biti između 0 i 14.",
    phosphorusMethodRequired: "Odaberite metodu određivanja fosfora (SP ili ICP-OES).",
    soilTextureRequired: "Odaberite klasu teksture tla za klasifikaciju K i Mg.",
    nutritionSaveFailed: "Ulazne podatke za gnojidbu nije moguće spremiti.",
    varietyRequired: "SORTA JE OBAVEZNA",
    varietyMismatch: "Odabrana sorta ne pripada odabranoj kulturi.",
    areaPositive: "Površina mora biti veća od 0.",
    accessDenied: "Pristup odbijen",
    noProjectAccess: "Nemate pristup ovom projektu",
    projectAccessDescription: "Projekt ne postoji ili nemate dopuštenje za prikaz.",
    backToProjects: "Natrag na projekte",
    loadingProject: "Učitavanje projekta...",
    back: "Natrag",
    cropNotSpecified: "Kultura nije navedena",
    areaNotSpecified: "Površina nije navedena",
    growthStageNotSpecified: "Faza rasta nije navedena",
    updated: "Ažurirano",
    refreshData: "Osvježi podatke",
    refresh: "Osvježi",
    analyzing: "Analiziranje…",
    runAnalysis: "Pokreni novu analizu",
    projectInformation: "Informacije o projektu",
    latitude: "Geografska širina",
    longitude: "Geografska dužina",
    area: "Površina",
    growthStage: "Faza rasta",
    created: "Kreirano",
    currentVegetation: "Trenutno stanje vegetacije",
    overallAssessment: "Ukupna procjena",
    analysisUnavailable: "Analiza još nije dostupna",
    mainReason: "Glavni razlog",
    cropCondition: "STANJE USJEVA",
    priority: "Prioritet",
    previous: "u odnosu na prethodno",
    lastAnalysis: "Posljednja analiza",
    storedDecisionSnapshot: "AEGRIS prikazuje spremljeni serverski snapshot odluke",
    legacyWeatherSnapshot: "Legacy analiza koristi spremljeni snapshot uvjeta",
    viewerReadOnly: "Viewer pristup je samo za čitanje.",
    serverAnalysisReady: "Serverska analiza spremna",
    contextualAssessment: "Kontekstualna procjena",
    contextualScore: "AEGRIS kontekstualni rezultat",
    criticalFactors: "Kritični čimbenici",
    ofFactors: "od",
    criticalFactorsLabel: "kritičnih čimbenika",
    dataConfidence: "Pouzdanost podataka",
    dataReliability: "POUZDANOST PODATAKA",
    analysisQualityOrigin: "KVALITETA I PODRIJETLO ANALIZE",
    analysisMetadata: "Tehnički metapodaci posljednje spremljene Sentinel analize.",
    validCoverage: "Valjana pokrivenost",
    source: "Izvor",
    spatialResolution: "Prostorna rezolucija",
    crsNotSpecified: "CRS nije naveden",
    validPixels: "Valjani pikseli",
    afterMasking: "nakon maskiranja oblaka / no-data",
    qualityGate: "Prag kvalitete",
    minimumPolygonCoverage: "minimalna valjana pokrivenost poligona",
    acceptedIntervals: "Prihvaćeni intervali",
    rejectedIntervals: "Odbijeni intervali",
    medianNdvi: "Medijan NDVI",
    provenanceNote: "NDVI se izračunava iz Sentinel-2 kanala B08 i B04. Nevaljani pikseli filtriraju se pomoću Scene Classification Layer (SCL) i dataMask. AEGRIS vremenski podaci dolaze iz zasebnog izvora, a povijesna procjena koristi spremljeni snapshot.",
    noQualityMetadata: "Ova spremljena analiza još ne sadrži metapodatke kvalitete. Pokrenite novu analizu; AEGRIS će zatim spremiti stvarni izvor, rezoluciju, valjanu pokrivenost i prag kvalitete izravno iz Copernicus rezultata.",
    decisionRecommendation: "PREPORUKA ZA ODLUKU",
    whatIsHappening: "ŠTO SE DOGAĐA",
    longTermTrend: "DUGOROČNI TREND",
    sinceLastAnalysis: "OD POSLJEDNJE ANALIZE",
    whatToDoNow: "ŠTO UČINITI SADA",
    nextStep: "SLJEDEĆI KORAK",
    projectAlerts: "UPOZORENJA PROJEKTA",
    unread: "Nepročitano",
    newLabel: "NOVO",
    markAsRead: "Označi kao pročitano",
    noAlerts: "Još nije stvoreno nijedno upozorenje.",
    showAllAlerts: "Prikaži sva upozorenja",
    recommendations: "AEGRIS PREPORUKE",
    diagnosis: "AEGRIS DIJAGNOSTIKA",
    probableCauses: "Vjerojatni uzroci trenutačnog rizika",
    diagnosisShort: "dijag.",
    indicationStrength: "Snaga indikacije",
    noDiagnosis: "Trenutačno nije utvrđena nijedna dijagnoza.",
    keyFactors: "KLJUČNI ČIMBENICI",
    inRange: "U RASPONU",
    score: "Rezultat",
    weight: "težina",
    ndviDevelopment: "RAZVOJ NDVI",
    trend: "Trend",
    trendWindow: "Prozor trenda",
    stateAndRecommendations: "RAZVOJ STANJA I PREPORUKA",
    noRecord: "Još nema zapisa.",
    showRecommendationHistory: "Prikaži povijest preporuka",
    analysisHistory: "POVIJEST ANALIZA",
    weatherConditions: "VRIJEME I UVJETI",
    currentLocalConditions: "TRENUTAČNI UVJETI NA LOKACIJI",
    temperature: "Temperatura",
    humidity: "Vlažnost",
    precipitationLastHour: "Oborine – posljednji sat",
    wind: "Vjetar",
    current: "Trenutačno",
    loadingWeather: "Učitavanje vremena...",
    weatherLoadFailed: "Vrijeme se nije moglo učitati.",
    tempWithinProfile: "Unutar raspona profila",
    tempOutsideProfile: "Izvan raspona profila",
    noEvaluation: "Nije procijenjeno",
    nutritionTitle: "AEGRIS AGRONOMY · ISHRANA I GNOJIDBA",
    nutritionMethodProfile: "METODOLOŠKI PROFIL ISHRANE KULTURE",
    nutritionMethodDescription: "Izračun se temelji na metodologiji ÚKZÚZ. AEGRIS ne prikazuje konkretnu dozu kada nedostaju ulazni podaci potrebni za sigurno određivanje.",
    nutritionProfileAvailable: "Profil ishrane dostupan",
    nutritionProfileUnavailable: "Profil ishrane nije dostupan",
    closeInputs: "Zatvori ulaze",
    completeInputs: "✎ Dopuni ulaze",
    loadingNutrition: "Učitavanje profila ishrane…",
    plannedYield: "Planirani prinos",
    lowYield: "Niska razina prinosa",
    mediumYield: "Srednja razina prinosa",
    highYield: "Visoka razina prinosa",
    neededForNutrition: "Potrebno za izračun ishrane",
    nitrogen: "Dušik N",
    base: "Osnova",
    minimum: "minimum",
    plannedYieldMissing: "Nedostaje planirani prinos.",
    phosphorus: "Fosfor P₂O₅",
    potassium: "Kalij K₂O",
    magnesium: "Magnezij MgO",
    methodNotSpecified: "metoda nije navedena",
    missingP: "Nedostaje analiza P u tlu.",
    missingK: "Nedostaje analiza K u tlu.",
    missingMg: "Nedostaje analiza Mg u tlu.",
    methodologySource: "Izvor metodologije",
    soilSupplyClassification: "Klasifikacija opskrbljenosti tla hranivima",
    soilTexture: "Tekstura tla",
    phosphorusMethod: "P metoda",
    notSpecifiedMasculine: "nije navedeno",
    notSpecifiedFeminine: "nije navedeno",
    kmgRatio: "Omjer K : Mg",
    kCoefficient: "Koeficijent K",
    kmgNeedBoth: "Za korekciju treba unijeti i K i Mg.",
    nitrogenCorrection: "Korekcija N",
    predecessor: "Predusjev",
    noAppliedCorrection: "bez primijenjene korekcije",
    organicFertilization: "Organska gnojidba",
    noAppliedDeduction: "bez primijenjenog odbitka",
    nminStoredNote: "spremljeno kao vrijednost za preciziranje, ne odbija se automatski",
    frameworkNitrogenSplit: "Okvirna raspodjela dušika",
    doseCannotCalculate: "dozu nije moguće izračunati",
    noNitrogenSplit: "Za ovu kulturu u bazi nema raspodjele N.",
    addYieldForNitrogen: "Unesite planirani prinos za konkretnu preporuku dušika. AEGRIS ne procjenjuje dozu bez tog ulaza.",
    nutritionInputs: "Ulazi za izračun ishrane",
    plannedYieldUnit: "Planirani prinos (t/ha)",
    soilTextureForKMg: "Tekstura tla za K / Mg",
    select: "Odaberite",
    lightSoil: "Lako tlo",
    mediumSoil: "Srednje tlo",
    heavySoil: "Teško tlo",
    phosphorusDetermination: "Metoda određivanja P",
    soilP: "P u tlu (mg/kg)",
    soilK: "K u tlu (mg/kg)",
    soilMg: "Mg u tlu (mg/kg)",
    soilPh: "pH tla",
    predecessorCrop: "Predusjev",
    predecessorExample: "npr. djetelina",
    predecessorGroup: "Skupina predusjeva",
    noCorrectionOther: "Bez korekcije / drugo",
    clovers: "Djeteline",
    legumes: "Mahunarke",
    organicFertilizer: "Organsko gnojivo",
    noDeduction: "Bez odbitka",
    manure: "Stajski gnoj",
    slurry: "Gnojnica",
    liquidManure: "Gnojovka",
    slurryType: "Vrsta gnojovke",
    cattle: "Goveda",
    pigs: "Svinje",
    poultry: "Perad",
    organicRate: "Doza organskog gnojiva (t/ha)",
    applicationPeriod: "Razdoblje primjene",
    organicNYear: "Godina učinka organskog N",
    firstYear: "1. godina",
    secondYear: "2. godina",
    dataSource: "Izvor podataka",
    dataSourcePlaceholder: "npr. analiza tla 2026 / laboratorijska analiza",
    note: "Napomena",
    saving: "Spremanje…",
    saveNutritionInputs: "💾 Spremi ulaze ishrane",
    projectDetails: "DETALJI PROJEKTA",
    crop: "Kultura",
    variety: "Sorta",
    sowingDate: "Datum sjetve",
    expectedHarvest: "Očekivana žetva",
    farmingMethod: "Način uzgoja",
    editCropData: "✎ Uredi podatke o kulturi",
    cropProfile: "PROFIL KULTURE",
    profileNotEvaluated: "Profil nije procijenjen",
    moisture: "Vlažnost",
    soilPH: "pH tla",
    waterNeed: "Potreba za vodom",
    notSpecified: "Nije navedeno",
    stage: "Faza",
    waterStress: "Vodeni stres",
    projectLocation: "LOKACIJA PROJEKTA",
    cropDataEditing: "UREĐIVANJE PODATAKA O KULTURI",
    cultivatedCrop: "Uzgajana kultura",
    originalValue: "Izvorna vrijednost",
    selectCropUkzuz: "Odaberite kulturu iz ÚKZÚZ",
    noAgronomicProfile: "Za ovu službenu kulturu još nije dodijeljen agronomski profil.",
    loadingVarieties: "Učitavanje sorti ÚKZÚZ...",
    selectVarietyUkzuz: "Odaberite sortu iz ÚKZÚZ",
    noActiveVarieties: "Za ovu kulturu nema dostupnih aktivnih sorti",
    areaHa: "Površina (ha)",
    farmingMethodLabel: "Način uzgoja",
    conventional: "Konvencionalno",
    integrated: "Integrirano",
    organic: "Ekološko",
    other: "Drugo",
    sowingPlantingDate: "Datum sjetve / sadnje",
    expectedHarvestDate: "Očekivana žetva",
    currentGrowthStage: "Trenutačna faza rasta",
    selectGrowthStage: "Odaberite fazu rasta",
    saveCropData: "💾 Spremi podatke o kulturi",
    projectDevelopment: "RAZVOJ PROJEKTA",
    eventHistory: "Povijest događaja",
    analysisLabel: "ANALIZA",
    analysisCompleted: "Analiza završena",
    recommendationLabel: "PREPORUKA",
    recommendationCreated: "Preporuka izrađena",
    noHistoricalEvents: "Još nema dostupnih povijesnih događaja.",
    showCompleteProjectHistory: "Prikaži cjelovitu povijest projekta",
    editProjectData: "Uredi podatke projekta",
    readOnly: "Samo za čitanje",
    recommendationHistory: "Povijest preporuka",
    trendWorsening: "Razvoj se pogoršava",
    trendImproving: "Stanje usjeva se poboljšava",
    trendStable: "Razvoj je stabilan",
    trendInsufficient: "Nedovoljno povijesnih podataka",
    longTermDecline: "Dugoročni pad aktivnosti usjeva",
    trendRising: "Rastući",
    trendFalling: "Padajući",
    trendStableShort: "Stabilan",
    trendWindowInsufficient: "nedovoljno podataka",
    noMajorRiskFactor: "Bez značajnog čimbenika rizika",
    strengthVeryStrong: "Vrlo jaka",
    strengthStrong: "Jaka",
    strengthMedium: "Srednja",
    strengthWeak: "Slaba",
    supplyLow: "niska",
    supplySatisfactory: "zadovoljavajuća",
    supplyGood: "dobra",
    supplyHigh: "visoka",
    supplyVeryHigh: "vrlo visoka",
  };
  const sl = {
    invalidProjectId: "Neveljaven ID projekta.",
    projectLoadFailed: "Projekta ni bilo mogoče naložiti.",
    projectNotFound: "Projekt ni bil najden ali do njega nimate dostopa.",
    projectOrganizationInvalid: "Projekt nima nastavljene veljavne organizacije.",
    permissionCheckFailed: "Dostopa do projekta ni bilo mogoče preveriti.",
    nutritionLoadFailed: "Vhodnih podatkov za gnojenje ni bilo mogoče naložiti.",
    nutritionNumberInvalid: "Vrednosti prehrane morajo biti veljavna števila.",
    plannedYieldPositive: "Načrtovani pridelek mora biti večji od 0.",
    phRange: "pH mora biti med 0 in 14.",
    phosphorusMethodRequired: "Izberite metodo določanja fosforja (SP ali ICP-OES).",
    soilTextureRequired: "Izberite razred teksture tal za razvrstitev K in Mg.",
    nutritionSaveFailed: "Vhodnih podatkov za gnojenje ni bilo mogoče shraniti.",
    varietyRequired: "SORTA JE OBVEZNA",
    varietyMismatch: "Izbrana sorta ne pripada izbrani poljščini.",
    areaPositive: "Površina mora biti večja od 0.",
    accessDenied: "Dostop zavrnjen",
    noProjectAccess: "Do tega projekta nimate dostopa",
    projectAccessDescription: "Projekt ne obstaja ali nimate dovoljenja za ogled.",
    backToProjects: "Nazaj na projekte",
    loadingProject: "Nalaganje projekta...",
    back: "Nazaj",
    cropNotSpecified: "Poljščina ni navedena",
    areaNotSpecified: "Površina ni navedena",
    growthStageNotSpecified: "Faza rasti ni navedena",
    updated: "Posodobljeno",
    refreshData: "Osveži podatke",
    refresh: "Osveži",
    analyzing: "Analiziranje…",
    runAnalysis: "Zaženi novo analizo",
    projectInformation: "Informacije o projektu",
    latitude: "Zemljepisna širina",
    longitude: "Zemljepisna dolžina",
    area: "Površina",
    growthStage: "Faza rasti",
    created: "Ustvarjeno",
    currentVegetation: "Trenutno stanje vegetacije",
    overallAssessment: "Skupna ocena",
    analysisUnavailable: "Analiza še ni na voljo",
    mainReason: "Glavni razlog",
    cropCondition: "STANJE POSEVKA",
    priority: "Prioriteta",
    previous: "glede na prejšnjo",
    lastAnalysis: "Zadnja analiza",
    storedDecisionSnapshot: "AEGRIS prikazuje shranjeni strežniški snapshot odločitve",
    legacyWeatherSnapshot: "Starejša analiza uporablja shranjeni snapshot pogojev",
    viewerReadOnly: "Dostop Viewer je samo za branje.",
    serverAnalysisReady: "Strežniška analiza pripravljena",
    contextualAssessment: "Kontekstna ocena",
    contextualScore: "Kontekstni rezultat AEGRIS",
    criticalFactors: "Kritični dejavniki",
    ofFactors: "od",
    criticalFactorsLabel: "kritičnih dejavnikov",
    dataConfidence: "Zaupanje v podatke",
    dataReliability: "ZANESLJIVOST PODATKOV",
    analysisQualityOrigin: "KAKOVOST IN IZVOR ANALIZE",
    analysisMetadata: "Tehnični metapodatki zadnje shranjene analize Sentinel.",
    validCoverage: "Veljavna pokritost",
    source: "Vir",
    spatialResolution: "Prostorska ločljivost",
    crsNotSpecified: "CRS ni naveden",
    validPixels: "Veljavni piksli",
    afterMasking: "po maskiranju oblakov / no-data",
    qualityGate: "Prag kakovosti",
    minimumPolygonCoverage: "minimalna veljavna pokritost poligona",
    acceptedIntervals: "Sprejeti intervali",
    rejectedIntervals: "Zavrnjeni intervali",
    medianNdvi: "Mediana NDVI",
    provenanceNote: "NDVI se izračuna iz pasov Sentinel-2 B08 in B04. Neveljavni piksli se filtrirajo z uporabo Scene Classification Layer (SCL) in dataMask. Vremenski podatki AEGRIS prihajajo iz ločenega vira, zgodovinsko vrednotenje pa uporablja shranjeni snapshot.",
    noQualityMetadata: "Ta shranjena analiza še ne vsebuje metapodatkov o kakovosti. Zaženite novo analizo; AEGRIS bo nato neposredno iz rezultata Copernicus shranil dejanski vir, ločljivost, veljavno pokritost in prag kakovosti.",
    decisionRecommendation: "PRIPOROČILO ZA ODLOČITEV",
    whatIsHappening: "KAJ SE DOGAJA",
    longTermTrend: "DOLGOROČNI TREND",
    sinceLastAnalysis: "OD ZADNJE ANALIZE",
    whatToDoNow: "KAJ STORITI ZDAJ",
    nextStep: "NASLEDNJI KORAK",
    projectAlerts: "OPOZORILA PROJEKTA",
    unread: "Neprebrano",
    newLabel: "NOVO",
    markAsRead: "Označi kot prebrano",
    noAlerts: "Nobeno opozorilo še ni bilo ustvarjeno.",
    showAllAlerts: "Prikaži vsa opozorila",
    recommendations: "PRIPOROČILA AEGRIS",
    diagnosis: "DIAGNOSTIKA AEGRIS",
    probableCauses: "Verjetni vzroki trenutnega tveganja",
    diagnosisShort: "diag.",
    indicationStrength: "Moč indikacije",
    noDiagnosis: "Trenutno ni ugotovljene diagnoze.",
    keyFactors: "KLJUČNI DEJAVNIKI",
    inRange: "V OBMOČJU",
    score: "Rezultat",
    weight: "utež",
    ndviDevelopment: "RAZVOJ NDVI",
    trend: "Trend",
    trendWindow: "Trendno okno",
    stateAndRecommendations: "RAZVOJ STANJA IN PRIPOROČIL",
    noRecord: "Še ni zapisa.",
    showRecommendationHistory: "Prikaži zgodovino priporočil",
    analysisHistory: "ZGODOVINA ANALIZ",
    weatherConditions: "VREME IN POGOJI",
    currentLocalConditions: "TRENUTNI POGOJI NA LOKACIJI",
    temperature: "Temperatura",
    humidity: "Vlažnost",
    precipitationLastHour: "Padavine – zadnja ura",
    wind: "Veter",
    current: "Trenutno",
    loadingWeather: "Nalaganje vremena...",
    weatherLoadFailed: "Vremena ni bilo mogoče naložiti.",
    tempWithinProfile: "V območju profila",
    tempOutsideProfile: "Zunaj območja profila",
    noEvaluation: "Ni ocenjeno",
    nutritionTitle: "AEGRIS AGRONOMY · PREHRANA IN GNOJENJE",
    nutritionMethodProfile: "METODOLOŠKI PROFIL PREHRANE POLJŠČINE",
    nutritionMethodDescription: "Izračun temelji na metodologiji ÚKZÚZ. AEGRIS ne prikaže konkretnega odmerka, kadar manjkajo podatki, potrebni za varno določitev.",
    nutritionProfileAvailable: "Prehranski profil je na voljo",
    nutritionProfileUnavailable: "Prehranski profil ni na voljo",
    closeInputs: "Zapri vnose",
    completeInputs: "✎ Dopolni vnose",
    loadingNutrition: "Nalaganje prehranskega profila…",
    plannedYield: "Načrtovani pridelek",
    lowYield: "Nizka raven pridelka",
    mediumYield: "Srednja raven pridelka",
    highYield: "Visoka raven pridelka",
    neededForNutrition: "Potrebno za izračun prehrane",
    nitrogen: "Dušik N",
    base: "Osnova",
    minimum: "minimum",
    plannedYieldMissing: "Načrtovani pridelek manjka.",
    phosphorus: "Fosfor P₂O₅",
    potassium: "Kalij K₂O",
    magnesium: "Magnezij MgO",
    methodNotSpecified: "metoda ni navedena",
    missingP: "Manjka analiza P v tleh.",
    missingK: "Manjka analiza K v tleh.",
    missingMg: "Manjka analiza Mg v tleh.",
    methodologySource: "Vir metodologije",
    soilSupplyClassification: "Razvrstitev založenosti tal s hranili",
    soilTexture: "Tekstura tal",
    phosphorusMethod: "Metoda P",
    notSpecifiedMasculine: "ni navedeno",
    notSpecifiedFeminine: "ni navedena",
    kmgRatio: "Razmerje K : Mg",
    kCoefficient: "Koeficient K",
    kmgNeedBoth: "Za korekcijo je treba vnesti K in Mg.",
    nitrogenCorrection: "Korekcija N",
    predecessor: "Predposevek",
    noAppliedCorrection: "brez uporabljene korekcije",
    organicFertilization: "Organsko gnojenje",
    noAppliedDeduction: "brez uporabljenega odbitka",
    nminStoredNote: "shranjeno kot vrednost za natančnejšo oceno, ne odšteje se samodejno",
    frameworkNitrogenSplit: "Okvirna delitev dušika",
    doseCannotCalculate: "odmerka ni mogoče izračunati",
    noNitrogenSplit: "Za to poljščino v bazi ni na voljo delitev N.",
    addYieldForNitrogen: "Vnesite načrtovani pridelek za konkretno priporočilo dušika. AEGRIS brez tega podatka ne ocenjuje odmerka.",
    nutritionInputs: "Vhodi za izračun prehrane",
    plannedYieldUnit: "Načrtovani pridelek (t/ha)",
    soilTextureForKMg: "Tekstura tal za K / Mg",
    select: "Izberite",
    lightSoil: "Lahka tla",
    mediumSoil: "Srednja tla",
    heavySoil: "Težka tla",
    phosphorusDetermination: "Metoda določanja P",
    soilP: "P v tleh (mg/kg)",
    soilK: "K v tleh (mg/kg)",
    soilMg: "Mg v tleh (mg/kg)",
    soilPh: "pH tal",
    predecessorCrop: "Predposevek",
    predecessorExample: "npr. detelja",
    predecessorGroup: "Skupina predposevka",
    noCorrectionOther: "Brez korekcije / drugo",
    clovers: "Detelje",
    legumes: "Metuljnice",
    organicFertilizer: "Organsko gnojilo",
    noDeduction: "Brez odbitka",
    manure: "Hlevski gnoj",
    slurry: "Gnojnica",
    liquidManure: "Gnojevka",
    slurryType: "Vrsta gnojevke",
    cattle: "Govedo",
    pigs: "Prašiči",
    poultry: "Perutnina",
    organicRate: "Odmerek organskega gnojila (t/ha)",
    applicationPeriod: "Obdobje uporabe",
    organicNYear: "Leto učinka organskega N",
    firstYear: "1. leto",
    secondYear: "2. leto",
    dataSource: "Vir podatkov",
    dataSourcePlaceholder: "npr. analiza tal 2026 / laboratorijska analiza",
    note: "Opomba",
    saving: "Shranjevanje…",
    saveNutritionInputs: "💾 Shrani vnose prehrane",
    projectDetails: "PODROBNOSTI PROJEKTA",
    crop: "Poljščina",
    variety: "Sorta",
    sowingDate: "Datum setve",
    expectedHarvest: "Pričakovana žetev",
    farmingMethod: "Način pridelave",
    editCropData: "✎ Uredi podatke o poljščini",
    cropProfile: "PROFIL POLJŠČINE",
    profileNotEvaluated: "Profil ni ocenjen",
    moisture: "Vlažnost",
    soilPH: "pH tal",
    waterNeed: "Potreba po vodi",
    notSpecified: "Ni navedeno",
    stage: "Faza",
    waterStress: "Vodni stres",
    projectLocation: "LOKACIJA PROJEKTA",
    cropDataEditing: "UREJANJE PODATKOV O POLJŠČINI",
    cultivatedCrop: "Gojena poljščina",
    originalValue: "Izvirna vrednost",
    selectCropUkzuz: "Izberite poljščino iz ÚKZÚZ",
    noAgronomicProfile: "Za to uradno poljščino še ni dodeljen agronomski profil.",
    loadingVarieties: "Nalaganje sort ÚKZÚZ...",
    selectVarietyUkzuz: "Izberite sorto iz ÚKZÚZ",
    noActiveVarieties: "Za to poljščino ni aktivnih sort",
    areaHa: "Površina (ha)",
    farmingMethodLabel: "Način pridelave",
    conventional: "Konvencionalno",
    integrated: "Integrirano",
    organic: "Ekološko",
    other: "Drugo",
    sowingPlantingDate: "Datum setve / sajenja",
    expectedHarvestDate: "Pričakovana žetev",
    currentGrowthStage: "Trenutna faza rasti",
    selectGrowthStage: "Izberite fazo rasti",
    saveCropData: "💾 Shrani podatke o poljščini",
    projectDevelopment: "RAZVOJ PROJEKTA",
    eventHistory: "Zgodovina dogodkov",
    analysisLabel: "ANALIZA",
    analysisCompleted: "Analiza končana",
    recommendationLabel: "PRIPOROČILO",
    recommendationCreated: "Priporočilo ustvarjeno",
    noHistoricalEvents: "Zgodovinski dogodki še niso na voljo.",
    showCompleteProjectHistory: "Prikaži celotno zgodovino projekta",
    editProjectData: "Uredi podatke projekta",
    readOnly: "Samo za branje",
    recommendationHistory: "Zgodovina priporočil",
    trendWorsening: "Razvoj se slabša",
    trendImproving: "Stanje posevka se izboljšuje",
    trendStable: "Razvoj je stabilen",
    trendInsufficient: "Premalo zgodovinskih podatkov",
    longTermDecline: "Dolgoročni upad aktivnosti posevka",
    trendRising: "Naraščajoč",
    trendFalling: "Padajoč",
    trendStableShort: "Stabilen",
    trendWindowInsufficient: "premalo podatkov",
    noMajorRiskFactor: "Brez pomembnega dejavnika tveganja",
    strengthVeryStrong: "Zelo močna",
    strengthStrong: "Močna",
    strengthMedium: "Srednja",
    strengthWeak: "Šibka",
    supplyLow: "nizka",
    supplySatisfactory: "zadovoljiva",
    supplyGood: "dobra",
    supplyHigh: "visoka",
    supplyVeryHigh: "zelo visoka",
  };
  const lt = {
    invalidProjectId: "Netinkamas projekto ID.",
    projectLoadFailed: "Nepavyko įkelti projekto.",
    projectNotFound: "Projektas nerastas arba neturite prieigos prie jo.",
    projectOrganizationInvalid: "Projektui nenustatyta galiojanti organizacija.",
    permissionCheckFailed: "Nepavyko patikrinti prieigos prie projekto.",
    nutritionLoadFailed: "Nepavyko įkelti tręšimo įvesties duomenų.",
    nutritionNumberInvalid: "Mitybos reikšmės turi būti tinkami skaičiai.",
    plannedYieldPositive: "Planuojamas derlius turi būti didesnis nei 0.",
    phRange: "pH turi būti nuo 0 iki 14.",
    phosphorusMethodRequired: "Pasirinkite fosforo nustatymo metodą (SP arba ICP-OES).",
    soilTextureRequired: "Pasirinkite dirvožemio tekstūros klasę K ir Mg klasifikacijai.",
    nutritionSaveFailed: "Nepavyko išsaugoti tręšimo įvesties duomenų.",
    varietyRequired: "VEISLĖ PRIVALOMA",
    varietyMismatch: "Pasirinkta veislė nepriklauso pasirinktai kultūrai.",
    areaPositive: "Plotas turi būti didesnis nei 0.",
    accessDenied: "Prieiga uždrausta",
    noProjectAccess: "Neturite prieigos prie šio projekto",
    projectAccessDescription: "Projektas neegzistuoja arba neturite leidimo jo peržiūrėti.",
    backToProjects: "Atgal į projektus",
    loadingProject: "Įkeliamas projektas...",
    back: "Atgal",
    cropNotSpecified: "Kultūra nenurodyta",
    areaNotSpecified: "Plotas nenurodytas",
    growthStageNotSpecified: "Augimo tarpsnis nenurodytas",
    updated: "Atnaujinta",
    refreshData: "Atnaujinti duomenis",
    refresh: "Atnaujinti",
    analyzing: "Analizuojama…",
    runAnalysis: "Vykdyti naują analizę",
    projectInformation: "Projekto informacija",
    latitude: "Platuma",
    longitude: "Ilguma",
    area: "Plotas",
    growthStage: "Augimo tarpsnis",
    created: "Sukurta",
    currentVegetation: "Dabartinė augalijos būklė",
    overallAssessment: "Bendras įvertinimas",
    analysisUnavailable: "Analizė dar nepasiekiama",
    mainReason: "Pagrindinė priežastis",
    cropCondition: "PASĖLIO BŪKLĖ",
    priority: "Prioritetas",
    previous: "palyginti su ankstesniu",
    lastAnalysis: "Paskutinė analizė",
    storedDecisionSnapshot: "AEGRIS rodo išsaugotą serverio sprendimo snapshotą",
    legacyWeatherSnapshot: "Senoji analizė naudoja išsaugotą sąlygų snapshotą",
    viewerReadOnly: "Viewer prieiga yra tik skaitymo.",
    serverAnalysisReady: "Serverio analizė parengta",
    contextualAssessment: "Kontekstinis vertinimas",
    contextualScore: "AEGRIS kontekstinis balas",
    criticalFactors: "Kritiniai veiksniai",
    ofFactors: "iš",
    criticalFactorsLabel: "kritinių veiksnių",
    dataConfidence: "Duomenų patikimumas",
    dataReliability: "DUOMENŲ PATIKIMUMAS",
    analysisQualityOrigin: "ANALIZĖS KOKYBĖ IR KILMĖ",
    analysisMetadata: "Naujausios išsaugotos Sentinel analizės techniniai metaduomenys.",
    validCoverage: "Tinkama aprėptis",
    source: "Šaltinis",
    spatialResolution: "Erdvinė skiriamoji geba",
    crsNotSpecified: "CRS nenurodyta",
    validPixels: "Tinkami pikseliai",
    afterMasking: "po debesų / no-data maskavimo",
    qualityGate: "Kokybės slenkstis",
    minimumPolygonCoverage: "minimali tinkama poligono aprėptis",
    acceptedIntervals: "Priimti intervalai",
    rejectedIntervals: "Atmesti intervalai",
    medianNdvi: "Medianinis NDVI",
    provenanceNote: "NDVI skaičiuojamas iš Sentinel-2 juostų B08 ir B04. Netinkami pikseliai filtruojami naudojant Scene Classification Layer (SCL) ir dataMask. AEGRIS orų duomenys gaunami iš atskiro šaltinio, o istorinis vertinimas naudoja išsaugotą snapshotą.",
    noQualityMetadata: "Ši išsaugota analizė dar neturi kokybės metaduomenų. Paleiskite naują analizę; AEGRIS tada tiesiogiai iš Copernicus rezultato išsaugos faktinį šaltinį, skiriamąją gebą, tinkamą aprėptį ir kokybės slenkstį.",
    decisionRecommendation: "SPRENDIMO REKOMENDACIJA",
    whatIsHappening: "KAS VYKSTA",
    longTermTrend: "ILGALAIKĖ TENDENCIJA",
    sinceLastAnalysis: "NUO PASKUTINĖS ANALIZĖS",
    whatToDoNow: "KĄ DARYTI DABAR",
    nextStep: "KITAS ŽINGSNIS",
    projectAlerts: "PROJEKTO ĮSPĖJIMAI",
    unread: "Neskaityti",
    newLabel: "NAUJA",
    markAsRead: "Pažymėti kaip skaitytą",
    noAlerts: "Dar nesukurtas nė vienas įspėjimas.",
    showAllAlerts: "Rodyti visus įspėjimus",
    recommendations: "AEGRIS REKOMENDACIJOS",
    diagnosis: "AEGRIS DIAGNOSTIKA",
    probableCauses: "Tikėtinos dabartinės rizikos priežastys",
    diagnosisShort: "diag.",
    indicationStrength: "Indikacijos stiprumas",
    noDiagnosis: "Šiuo metu diagnozė nenustatyta.",
    keyFactors: "PAGRINDINIAI VEIKSNIAI",
    inRange: "NORMOS RIBOSE",
    score: "Balas",
    weight: "svoris",
    ndviDevelopment: "NDVI RAIDA",
    trend: "Tendencija",
    trendWindow: "Tendencijos langas",
    stateAndRecommendations: "BŪKLĖS IR REKOMENDACIJŲ RAIDA",
    noRecord: "Įrašų dar nėra.",
    showRecommendationHistory: "Rodyti rekomendacijų istoriją",
    analysisHistory: "ANALIZIŲ ISTORIJA",
    weatherConditions: "ORAI IR SĄLYGOS",
    currentLocalConditions: "DABARTINĖS SĄLYGOS VIETOJE",
    temperature: "Temperatūra",
    humidity: "Drėgmė",
    precipitationLastHour: "Krituliai – paskutinė valanda",
    wind: "Vėjas",
    current: "Dabartinė",
    loadingWeather: "Įkeliami orai...",
    weatherLoadFailed: "Nepavyko įkelti orų.",
    tempWithinProfile: "Profilio ribose",
    tempOutsideProfile: "Už profilio ribų",
    noEvaluation: "Neįvertinta",
    nutritionTitle: "AEGRIS AGRONOMY · MITYBA IR TRĘŠIMAS",
    nutritionMethodProfile: "KULTŪROS MITYBOS METODIKOS PROFILIS",
    nutritionMethodDescription: "Skaičiavimas grindžiamas ÚKZÚZ metodika. AEGRIS nerodo konkrečios normos, kai trūksta duomenų, reikalingų saugiam jos nustatymui.",
    nutritionProfileAvailable: "Mitybos profilis pasiekiamas",
    nutritionProfileUnavailable: "Mitybos profilis nepasiekiamas",
    closeInputs: "Uždaryti įvestis",
    completeInputs: "✎ Papildyti įvestis",
    loadingNutrition: "Įkeliamas mitybos profilis…",
    plannedYield: "Planuojamas derlius",
    lowYield: "Žemas derlingumo lygis",
    mediumYield: "Vidutinis derlingumo lygis",
    highYield: "Aukštas derlingumo lygis",
    neededForNutrition: "Būtina mitybos skaičiavimui",
    nitrogen: "Azotas N",
    base: "Bazė",
    minimum: "minimumas",
    plannedYieldMissing: "Trūksta planuojamo derliaus.",
    phosphorus: "Fosforas P₂O₅",
    potassium: "Kalis K₂O",
    magnesium: "Magnis MgO",
    methodNotSpecified: "metodas nenurodytas",
    missingP: "Trūksta dirvožemio P analizės.",
    missingK: "Trūksta dirvožemio K analizės.",
    missingMg: "Trūksta dirvožemio Mg analizės.",
    methodologySource: "Metodikos šaltinis",
    soilSupplyClassification: "Dirvožemio aprūpinimo maisto medžiagomis klasifikacija",
    soilTexture: "Dirvožemio tekstūra",
    phosphorusMethod: "P metodas",
    notSpecifiedMasculine: "nenurodyta",
    notSpecifiedFeminine: "nenurodyta",
    kmgRatio: "K : Mg santykis",
    kCoefficient: "K koeficientas",
    kmgNeedBoth: "Korekcijai reikia įvesti ir K, ir Mg.",
    nitrogenCorrection: "N korekcija",
    predecessor: "Priešsėlis",
    noAppliedCorrection: "korekcija netaikyta",
    organicFertilization: "Organinis tręšimas",
    noAppliedDeduction: "atskaitymas netaikytas",
    nminStoredNote: "išsaugota kaip tikslinamoji reikšmė, automatiškai neatimama",
    frameworkNitrogenSplit: "Orientacinis azoto paskirstymas",
    doseCannotCalculate: "normos apskaičiuoti negalima",
    noNitrogenSplit: "Šiai kultūrai duomenų bazėje nėra N paskirstymo.",
    addYieldForNitrogen: "Įveskite planuojamą derlių konkrečiai azoto rekomendacijai. AEGRIS be šio duomens normos nevertina.",
    nutritionInputs: "Mitybos skaičiavimo įvestys",
    plannedYieldUnit: "Planuojamas derlius (t/ha)",
    soilTextureForKMg: "Dirvožemio tekstūra K / Mg",
    select: "Pasirinkite",
    lightSoil: "Lengvas dirvožemis",
    mediumSoil: "Vidutinis dirvožemis",
    heavySoil: "Sunkus dirvožemis",
    phosphorusDetermination: "P nustatymo metodas",
    soilP: "P dirvožemyje (mg/kg)",
    soilK: "K dirvožemyje (mg/kg)",
    soilMg: "Mg dirvožemyje (mg/kg)",
    soilPh: "Dirvožemio pH",
    predecessorCrop: "Priešsėlis",
    predecessorExample: "pvz., dobilai",
    predecessorGroup: "Priešsėlio grupė",
    noCorrectionOther: "Be korekcijos / kita",
    clovers: "Dobilai",
    legumes: "Ankštiniai",
    organicFertilizer: "Organinės trąšos",
    noDeduction: "Be atskaitymo",
    manure: "Mėšlas",
    slurry: "Srutos",
    liquidManure: "Skystas mėšlas",
    slurryType: "Skysto mėšlo tipas",
    cattle: "Galvijai",
    pigs: "Kiaulės",
    poultry: "Paukščiai",
    organicRate: "Organinių trąšų norma (t/ha)",
    applicationPeriod: "Naudojimo laikotarpis",
    organicNYear: "Organinio N poveikio metai",
    firstYear: "1 metai",
    secondYear: "2 metai",
    dataSource: "Duomenų šaltinis",
    dataSourcePlaceholder: "pvz., dirvožemio tyrimas 2026 / laboratorinė analizė",
    note: "Pastaba",
    saving: "Išsaugoma…",
    saveNutritionInputs: "💾 Išsaugoti mitybos įvestis",
    projectDetails: "PROJEKTO INFORMACIJA",
    crop: "Kultūra",
    variety: "Veislė",
    sowingDate: "Sėjos data",
    expectedHarvest: "Numatomas derliaus nuėmimas",
    farmingMethod: "Auginimo būdas",
    editCropData: "✎ Redaguoti kultūros duomenis",
    cropProfile: "KULTŪROS PROFILIS",
    profileNotEvaluated: "Profilis neįvertintas",
    moisture: "Drėgmė",
    soilPH: "Dirvožemio pH",
    waterNeed: "Vandens poreikis",
    notSpecified: "Nenurodyta",
    stage: "Tarpsnis",
    waterStress: "Vandens stresas",
    projectLocation: "PROJEKTO VIETA",
    cropDataEditing: "KULTŪROS DUOMENŲ REDAGAVIMAS",
    cultivatedCrop: "Auginama kultūra",
    originalValue: "Pradinė reikšmė",
    selectCropUkzuz: "Pasirinkite kultūrą iš ÚKZÚZ",
    noAgronomicProfile: "Šiai oficialiai kultūrai dar nepriskirtas agronominis profilis.",
    loadingVarieties: "Įkeliamos ÚKZÚZ veislės...",
    selectVarietyUkzuz: "Pasirinkite veislę iš ÚKZÚZ",
    noActiveVarieties: "Šiai kultūrai nėra aktyvių veislių",
    areaHa: "Plotas (ha)",
    farmingMethodLabel: "Auginimo būdas",
    conventional: "Įprastinis",
    integrated: "Integruotas",
    organic: "Ekologinis",
    other: "Kita",
    sowingPlantingDate: "Sėjos / sodinimo data",
    expectedHarvestDate: "Numatomas derliaus nuėmimas",
    currentGrowthStage: "Dabartinis augimo tarpsnis",
    selectGrowthStage: "Pasirinkite augimo tarpsnį",
    saveCropData: "💾 Išsaugoti kultūros duomenis",
    projectDevelopment: "PROJEKTO RAIDA",
    eventHistory: "Įvykių istorija",
    analysisLabel: "ANALIZĖ",
    analysisCompleted: "Analizė baigta",
    recommendationLabel: "REKOMENDACIJA",
    recommendationCreated: "Rekomendacija sukurta",
    noHistoricalEvents: "Istorinių įvykių dar nėra.",
    showCompleteProjectHistory: "Rodyti visą projekto istoriją",
    editProjectData: "Redaguoti projekto duomenis",
    readOnly: "Tik skaityti",
    recommendationHistory: "Rekomendacijų istorija",
    trendWorsening: "Raida blogėja",
    trendImproving: "Pasėlio būklė gerėja",
    trendStable: "Raida stabili",
    trendInsufficient: "Nepakanka istorinių duomenų",
    longTermDecline: "Ilgalaikis pasėlio aktyvumo mažėjimas",
    trendRising: "Didėjanti",
    trendFalling: "Mažėjanti",
    trendStableShort: "Stabili",
    trendWindowInsufficient: "nepakanka duomenų",
    noMajorRiskFactor: "Nėra reikšmingo rizikos veiksnio",
    strengthVeryStrong: "Labai stipri",
    strengthStrong: "Stipri",
    strengthMedium: "Vidutinė",
    strengthWeak: "Silpna",
    supplyLow: "žema",
    supplySatisfactory: "patenkinama",
    supplyGood: "gera",
    supplyHigh: "aukšta",
    supplyVeryHigh: "labai aukšta",
  };
  const lv = {
    invalidProjectId: "Nederīgs projekta ID.",
    projectLoadFailed: "Projektu neizdevās ielādēt.",
    projectNotFound: "Projekts netika atrasts vai jums nav piekļuves tam.",
    projectOrganizationInvalid: "Projektam nav iestatīta derīga organizācija.",
    permissionCheckFailed: "Neizdevās pārbaudīt piekļuvi projektam.",
    nutritionLoadFailed: "Mēslošanas ievades datus neizdevās ielādēt.",
    nutritionNumberInvalid: "Uzturvielu vērtībām jābūt derīgiem skaitļiem.",
    plannedYieldPositive: "Plānotajai ražai jābūt lielākai par 0.",
    phRange: "pH jābūt robežās no 0 līdz 14.",
    phosphorusMethodRequired: "Izvēlieties fosfora noteikšanas metodi (SP vai ICP-OES).",
    soilTextureRequired: "Izvēlieties augsnes tekstūras klasi K un Mg klasifikācijai.",
    nutritionSaveFailed: "Mēslošanas ievades datus neizdevās saglabāt.",
    varietyRequired: "ŠĶIRNE IR OBLIGĀTA",
    varietyMismatch: "Izvēlētā šķirne nepieder izvēlētajai kultūrai.",
    areaPositive: "Platībai jābūt lielākai par 0.",
    accessDenied: "Piekļuve liegta",
    noProjectAccess: "Jums nav piekļuves šim projektam",
    projectAccessDescription: "Projekts neeksistē vai jums nav atļaujas to skatīt.",
    backToProjects: "Atpakaļ uz projektiem",
    loadingProject: "Notiek projekta ielāde...",
    back: "Atpakaļ",
    cropNotSpecified: "Kultūra nav norādīta",
    areaNotSpecified: "Platība nav norādīta",
    growthStageNotSpecified: "Augšanas stadija nav norādīta",
    updated: "Atjaunināts",
    refreshData: "Atjaunināt datus",
    refresh: "Atjaunināt",
    analyzing: "Notiek analīze…",
    runAnalysis: "Palaist jaunu analīzi",
    projectInformation: "Projekta informācija",
    latitude: "Platums",
    longitude: "Garums",
    area: "Platība",
    growthStage: "Augšanas stadija",
    created: "Izveidots",
    currentVegetation: "Pašreizējais veģetācijas stāvoklis",
    overallAssessment: "Kopējais novērtējums",
    analysisUnavailable: "Analīze vēl nav pieejama",
    mainReason: "Galvenais iemesls",
    cropCondition: "SĒJUMA STĀVOKLIS",
    priority: "Prioritāte",
    previous: "salīdzinot ar iepriekšējo",
    lastAnalysis: "Pēdējā analīze",
    storedDecisionSnapshot: "AEGRIS rāda saglabāto servera lēmuma snapshotu",
    legacyWeatherSnapshot: "Vecākā analīze izmanto saglabāto apstākļu snapshotu",
    viewerReadOnly: "Viewer piekļuve ir tikai lasīšanai.",
    serverAnalysisReady: "Servera analīze gatava",
    contextualAssessment: "Konteksta novērtējums",
    contextualScore: "AEGRIS konteksta rezultāts",
    criticalFactors: "Kritiskie faktori",
    ofFactors: "no",
    criticalFactorsLabel: "kritiskajiem faktoriem",
    dataConfidence: "Datu uzticamība",
    dataReliability: "DATU UZTICAMĪBA",
    analysisQualityOrigin: "ANALĪZES KVALITĀTE UN IZCELSME",
    analysisMetadata: "Pēdējās saglabātās Sentinel analīzes tehniskie metadati.",
    validCoverage: "Derīgs pārklājums",
    source: "Avots",
    spatialResolution: "Telpiskā izšķirtspēja",
    crsNotSpecified: "CRS nav norādīta",
    validPixels: "Derīgi pikseļi",
    afterMasking: "pēc mākoņu / no-data maskēšanas",
    qualityGate: "Kvalitātes slieksnis",
    minimumPolygonCoverage: "minimālais derīgais poligona pārklājums",
    acceptedIntervals: "Pieņemtie intervāli",
    rejectedIntervals: "Noraidītie intervāli",
    medianNdvi: "Mediānais NDVI",
    provenanceNote: "NDVI tiek aprēķināts no Sentinel-2 joslām B08 un B04. Nederīgie pikseļi tiek filtrēti, izmantojot Scene Classification Layer (SCL) un dataMask. AEGRIS laikapstākļu dati nāk no atsevišķa avota, un vēsturiskais novērtējums izmanto saglabāto snapshotu.",
    noQualityMetadata: "Šī saglabātā analīze vēl nesatur kvalitātes metadatus. Palaidiet jaunu analīzi; AEGRIS pēc tam tieši no Copernicus rezultāta saglabās faktisko avotu, izšķirtspēju, derīgo pārklājumu un kvalitātes slieksni.",
    decisionRecommendation: "LĒMUMA IETEIKUMS",
    whatIsHappening: "KAS NOTIEK",
    longTermTrend: "ILGTERMIŅA TENDENCE",
    sinceLastAnalysis: "KOPŠ PĒDĒJĀS ANALĪZES",
    whatToDoNow: "KO DARĪT TAGAD",
    nextStep: "NĀKAMAIS SOLIS",
    projectAlerts: "PROJEKTA BRĪDINĀJUMI",
    unread: "Nelasīti",
    newLabel: "JAUNS",
    markAsRead: "Atzīmēt kā izlasītu",
    noAlerts: "Vēl nav izveidots neviens brīdinājums.",
    showAllAlerts: "Rādīt visus brīdinājumus",
    recommendations: "AEGRIS IETEIKUMI",
    diagnosis: "AEGRIS DIAGNOSTIKA",
    probableCauses: "Pašreizējā riska iespējamie cēloņi",
    diagnosisShort: "diag.",
    indicationStrength: "Indikācijas stiprums",
    noDiagnosis: "Pašlaik nav noteikta diagnoze.",
    keyFactors: "GALVENIE FAKTORI",
    inRange: "NORMAS ROBEŽĀS",
    score: "Rezultāts",
    weight: "svars",
    ndviDevelopment: "NDVI ATTĪSTĪBA",
    trend: "Tendence",
    trendWindow: "Tendences logs",
    stateAndRecommendations: "STĀVOKĻA UN IETEIKUMU ATTĪSTĪBA",
    noRecord: "Vēl nav ierakstu.",
    showRecommendationHistory: "Rādīt ieteikumu vēsturi",
    analysisHistory: "ANALĪŽU VĒSTURE",
    weatherConditions: "LAIKAPSTĀKĻI UN APSTĀKĻI",
    currentLocalConditions: "PAŠREIZĒJIE APSTĀKĻI VIETĀ",
    temperature: "Temperatūra",
    humidity: "Mitrums",
    precipitationLastHour: "Nokrišņi – pēdējā stunda",
    wind: "Vējš",
    current: "Pašreiz",
    loadingWeather: "Notiek laikapstākļu ielāde...",
    weatherLoadFailed: "Laikapstākļus neizdevās ielādēt.",
    tempWithinProfile: "Profila diapazonā",
    tempOutsideProfile: "Ārpus profila diapazona",
    noEvaluation: "Nav novērtēts",
    nutritionTitle: "AEGRIS AGRONOMY · BARĪBAS VIELAS UN MĒSLOŠANA",
    nutritionMethodProfile: "KULTŪRAS BARĪBAS VIELU METODIKAS PROFILS",
    nutritionMethodDescription: "Aprēķins balstās uz ÚKZÚZ metodiku. AEGRIS nerāda konkrētu devu, ja trūkst ievades datu, kas nepieciešami drošai noteikšanai.",
    nutritionProfileAvailable: "Barības vielu profils pieejams",
    nutritionProfileUnavailable: "Barības vielu profils nav pieejams",
    closeInputs: "Aizvērt ievades",
    completeInputs: "✎ Papildināt ievades",
    loadingNutrition: "Notiek barības vielu profila ielāde…",
    plannedYield: "Plānotā raža",
    lowYield: "Zems ražas līmenis",
    mediumYield: "Vidējs ražas līmenis",
    highYield: "Augsts ražas līmenis",
    neededForNutrition: "Nepieciešams barības vielu aprēķinam",
    nitrogen: "Slāpeklis N",
    base: "Bāze",
    minimum: "minimums",
    plannedYieldMissing: "Trūkst plānotās ražas.",
    phosphorus: "Fosfors P₂O₅",
    potassium: "Kālijs K₂O",
    magnesium: "Magnijs MgO",
    methodNotSpecified: "metode nav norādīta",
    missingP: "Trūkst augsnes P analīzes.",
    missingK: "Trūkst augsnes K analīzes.",
    missingMg: "Trūkst augsnes Mg analīzes.",
    methodologySource: "Metodikas avots",
    soilSupplyClassification: "Augsnes barības vielu nodrošinājuma klasifikācija",
    soilTexture: "Augsnes tekstūra",
    phosphorusMethod: "P metode",
    notSpecifiedMasculine: "nav norādīts",
    notSpecifiedFeminine: "nav norādīta",
    kmgRatio: "K : Mg attiecība",
    kCoefficient: "K koeficients",
    kmgNeedBoth: "Korekcijai jāievada gan K, gan Mg.",
    nitrogenCorrection: "N korekcija",
    predecessor: "Priekšaugs",
    noAppliedCorrection: "korekcija nav piemērota",
    organicFertilization: "Organiskā mēslošana",
    noAppliedDeduction: "atskaitījums nav piemērots",
    nminStoredNote: "saglabāts kā precizējoša vērtība, netiek automātiski atskaitīts",
    frameworkNitrogenSplit: "Orientējošs slāpekļa sadalījums",
    doseCannotCalculate: "devu nevar aprēķināt",
    noNitrogenSplit: "Šai kultūrai datubāzē nav pieejams N sadalījums.",
    addYieldForNitrogen: "Ievadiet plānoto ražu konkrētam slāpekļa ieteikumam. AEGRIS bez šī ievades datuma devu nenovērtē.",
    nutritionInputs: "Barības vielu aprēķina ievades",
    plannedYieldUnit: "Plānotā raža (t/ha)",
    soilTextureForKMg: "Augsnes tekstūra K / Mg",
    select: "Izvēlieties",
    lightSoil: "Viegla augsne",
    mediumSoil: "Vidēja augsne",
    heavySoil: "Smaga augsne",
    phosphorusDetermination: "P noteikšanas metode",
    soilP: "P augsnē (mg/kg)",
    soilK: "K augsnē (mg/kg)",
    soilMg: "Mg augsnē (mg/kg)",
    soilPh: "Augsnes pH",
    predecessorCrop: "Priekšaugs",
    predecessorExample: "piem., āboliņš",
    predecessorGroup: "Priekšauga grupa",
    noCorrectionOther: "Bez korekcijas / cits",
    clovers: "Āboliņi",
    legumes: "Pākšaugi",
    organicFertilizer: "Organiskais mēslojums",
    noDeduction: "Bez atskaitījuma",
    manure: "Kūtsmēsli",
    slurry: "Šķidrmēsli",
    liquidManure: "Virca",
    slurryType: "Vircas veids",
    cattle: "Liellopi",
    pigs: "Cūkas",
    poultry: "Mājputni",
    organicRate: "Organiskā mēslojuma deva (t/ha)",
    applicationPeriod: "Lietošanas periods",
    organicNYear: "Organiskā N iedarbības gads",
    firstYear: "1. gads",
    secondYear: "2. gads",
    dataSource: "Datu avots",
    dataSourcePlaceholder: "piem., augsnes analīze 2026 / laboratorijas analīze",
    note: "Piezīme",
    saving: "Saglabāšana…",
    saveNutritionInputs: "💾 Saglabāt barības vielu ievades",
    projectDetails: "PROJEKTA INFORMĀCIJA",
    crop: "Kultūra",
    variety: "Šķirne",
    sowingDate: "Sējas datums",
    expectedHarvest: "Paredzamā ražas novākšana",
    farmingMethod: "Audzēšanas metode",
    editCropData: "✎ Rediģēt kultūras datus",
    cropProfile: "KULTŪRAS PROFILS",
    profileNotEvaluated: "Profils nav novērtēts",
    moisture: "Mitrums",
    soilPH: "Augsnes pH",
    waterNeed: "Ūdens vajadzība",
    notSpecified: "Nav norādīts",
    stage: "Stadija",
    waterStress: "Ūdens stress",
    projectLocation: "PROJEKTA ATRAŠANĀS VIETA",
    cropDataEditing: "KULTŪRAS DATU REDIĢĒŠANA",
    cultivatedCrop: "Audzētā kultūra",
    originalValue: "Sākotnējā vērtība",
    selectCropUkzuz: "Izvēlieties kultūru no ÚKZÚZ",
    noAgronomicProfile: "Šai oficiālajai kultūrai vēl nav piešķirts agronomiskais profils.",
    loadingVarieties: "Notiek ÚKZÚZ šķirņu ielāde...",
    selectVarietyUkzuz: "Izvēlieties šķirni no ÚKZÚZ",
    noActiveVarieties: "Šai kultūrai nav pieejamu aktīvu šķirņu",
    areaHa: "Platība (ha)",
    farmingMethodLabel: "Audzēšanas metode",
    conventional: "Konvencionāla",
    integrated: "Integrēta",
    organic: "Bioloģiska",
    other: "Cita",
    sowingPlantingDate: "Sējas / stādīšanas datums",
    expectedHarvestDate: "Paredzamā ražas novākšana",
    currentGrowthStage: "Pašreizējā augšanas stadija",
    selectGrowthStage: "Izvēlieties augšanas stadiju",
    saveCropData: "💾 Saglabāt kultūras datus",
    projectDevelopment: "PROJEKTA ATTĪSTĪBA",
    eventHistory: "Notikumu vēsture",
    analysisLabel: "ANALĪZE",
    analysisCompleted: "Analīze pabeigta",
    recommendationLabel: "IETEIKUMS",
    recommendationCreated: "Ieteikums izveidots",
    noHistoricalEvents: "Vēsturiskie notikumi vēl nav pieejami.",
    showCompleteProjectHistory: "Rādīt pilnu projekta vēsturi",
    editProjectData: "Rediģēt projekta datus",
    readOnly: "Tikai lasīšanai",
    recommendationHistory: "Ieteikumu vēsture",
    trendWorsening: "Attīstība pasliktinās",
    trendImproving: "Sējuma stāvoklis uzlabojas",
    trendStable: "Attīstība ir stabila",
    trendInsufficient: "Nepietiek vēsturisko datu",
    longTermDecline: "Ilgtermiņa sējuma aktivitātes kritums",
    trendRising: "Pieaugoša",
    trendFalling: "Krītoša",
    trendStableShort: "Stabila",
    trendWindowInsufficient: "nepietiek datu",
    noMajorRiskFactor: "Nav būtiska riska faktora",
    strengthVeryStrong: "Ļoti spēcīga",
    strengthStrong: "Spēcīga",
    strengthMedium: "Vidēja",
    strengthWeak: "Vāja",
    supplyLow: "zema",
    supplySatisfactory: "apmierinoša",
    supplyGood: "laba",
    supplyHigh: "augsta",
    supplyVeryHigh: "ļoti augsta",
  };
  const et = {
    invalidProjectId: "Invalid project ID.",
    projectLoadFailed: "Failed to load project.",
    projectNotFound: "Project was not found or you do not have access to it.",
    projectOrganizationInvalid: "The project does not have a valid organization set.",
    permissionCheckFailed: "Failed to verify access to the project.",
    nutritionLoadFailed: "Fertilization inputs could not be loaded.",
    nutritionNumberInvalid: "Nutrition values must be valid numbers.",
    plannedYieldPositive: "Planned yield must be greater than 0.",
    phRange: "pH must be between 0 and 14.",
    phosphorusMethodRequired: "Select the phosphorus determination method (SP or ICP-OES).",
    soilTextureRequired: "Select the soil texture class for K and Mg classification.",
    nutritionSaveFailed: "Fertilization inputs could not be saved.",
    varietyRequired: "VARIETY IS REQUIRED",
    varietyMismatch: "The selected variety does not belong to the selected crop.",
    areaPositive: "Area must be greater than 0.",
    accessDenied: "Access denied",
    noProjectAccess: "You do not have access to this project",
    projectAccessDescription: "The project does not exist or you do not have permission to view it.",
    backToProjects: "Back to projects",
    loadingProject: "Loading project...",
    back: "Back",
    cropNotSpecified: "Crop not specified",
    areaNotSpecified: "Area not specified",
    growthStageNotSpecified: "Growth stage not specified",
    updated: "Updated",
    refreshData: "Refresh data",
    refresh: "Refresh",
    analyzing: "Analyzing…",
    runAnalysis: "Run new analysis",
    projectInformation: "Project information",
    latitude: "Latitude",
    longitude: "Longitude",
    area: "Area",
    growthStage: "Growth stage",
    created: "Created",
    currentVegetation: "Current vegetation status",
    overallAssessment: "Overall assessment",
    analysisUnavailable: "Analysis is not available yet",
    mainReason: "Main reason",
    cropCondition: "CROP CONDITION",
    priority: "Priority",
    previous: "vs. previous",
    lastAnalysis: "Last analysis",
    storedDecisionSnapshot: "AEGRIS is displaying the stored server decision snapshot",
    legacyWeatherSnapshot: "Legacy analysis uses the stored conditions snapshot",
    viewerReadOnly: "Viewer access is read-only.",
    serverAnalysisReady: "Server analysis ready",
    contextualAssessment: "Context assessment",
    contextualScore: "AEGRIS context score",
    criticalFactors: "Critical factors",
    ofFactors: "of",
    criticalFactorsLabel: "critical factors",
    dataConfidence: "Data confidence",
    dataReliability: "DATA RELIABILITY",
    analysisQualityOrigin: "ANALYSIS QUALITY AND ORIGIN",
    analysisMetadata: "Technical metadata of the latest saved Sentinel analysis.",
    validCoverage: "Valid coverage",
    source: "Source",
    spatialResolution: "Spatial resolution",
    crsNotSpecified: "CRS not specified",
    validPixels: "Valid pixels",
    afterMasking: "after cloud / no-data masking",
    qualityGate: "Quality gate",
    minimumPolygonCoverage: "minimum valid polygon coverage",
    acceptedIntervals: "Accepted intervals",
    rejectedIntervals: "Rejected intervals",
    medianNdvi: "Median NDVI",
    provenanceNote: "NDVI is calculated from Sentinel-2 bands B08 and B04. Invalid pixels are filtered using the Scene Classification Layer (SCL) and dataMask. AEGRIS weather comes from a separate weather source and historical evaluation uses the stored snapshot.",
    noQualityMetadata: "This saved analysis does not yet contain quality metadata. Run a new analysis; AEGRIS will then store the actual source, resolution, valid coverage and quality gate directly from the Copernicus result.",
    decisionRecommendation: "DECISION RECOMMENDATION",
    whatIsHappening: "WHAT IS HAPPENING",
    longTermTrend: "LONG-TERM TREND",
    sinceLastAnalysis: "SINCE LAST ANALYSIS",
    whatToDoNow: "WHAT TO DO NOW",
    nextStep: "NEXT STEP",
    projectAlerts: "PROJECT ALERTS",
    unread: "Unread",
    newLabel: "NEW",
    markAsRead: "Mark as read",
    noAlerts: "No alert has been created yet.",
    showAllAlerts: "Show all alerts",
    recommendations: "AEGRIS RECOMMENDATIONS",
    diagnosis: "AEGRIS DIAGNOSTICS",
    probableCauses: "Probable causes of the current risk",
    diagnosisShort: "diag.",
    indicationStrength: "Indication strength",
    noDiagnosis: "No diagnosis is currently identified.",
    keyFactors: "KEY FACTORS",
    inRange: "IN RANGE",
    score: "Score",
    weight: "weight",
    ndviDevelopment: "NDVI DEVELOPMENT",
    trend: "Trend",
    trendWindow: "Trend window",
    stateAndRecommendations: "STATUS AND RECOMMENDATION DEVELOPMENT",
    noRecord: "No record yet.",
    showRecommendationHistory: "Show recommendation history",
    analysisHistory: "ANALYSIS HISTORY",
    weatherConditions: "WEATHER AND CONDITIONS",
    currentLocalConditions: "CURRENT CONDITIONS AT THE LOCATION",
    temperature: "Temperature",
    humidity: "Humidity",
    precipitationLastHour: "Precipitation – last hour",
    wind: "Wind",
    current: "Current",
    loadingWeather: "Loading weather...",
    weatherLoadFailed: "Weather could not be loaded.",
    tempWithinProfile: "Within profile range",
    tempOutsideProfile: "Outside profile range",
    noEvaluation: "Not evaluated",
    nutritionTitle: "AEGRIS AGRONOMY · NUTRITION AND FERTILIZATION",
    nutritionMethodProfile: "CROP NUTRITION METHODOLOGY PROFILE",
    nutritionMethodDescription: "The calculation is based on the ÚKZÚZ methodology. AEGRIS does not display a specific dose when the inputs required for a safe determination are missing.",
    nutritionProfileAvailable: "Nutrition profile available",
    nutritionProfileUnavailable: "Nutrition profile not available",
    closeInputs: "Close inputs",
    completeInputs: "✎ Complete inputs",
    loadingNutrition: "Loading nutrition profile…",
    plannedYield: "Planned yield",
    lowYield: "Low yield level",
    mediumYield: "Medium yield level",
    highYield: "High yield level",
    neededForNutrition: "Required for nutrition calculation",
    nitrogen: "Nitrogen N",
    base: "Base",
    minimum: "minimum",
    plannedYieldMissing: "Planned yield is missing.",
    phosphorus: "Phosphorus P₂O₅",
    potassium: "Potassium K₂O",
    magnesium: "Magnesium MgO",
    methodNotSpecified: "method not specified",
    missingP: "Soil P analysis is missing.",
    missingK: "Soil K analysis is missing.",
    missingMg: "Soil Mg analysis is missing.",
    methodologySource: "Methodology source",
    soilSupplyClassification: "Soil nutrient supply classification",
    soilTexture: "Soil texture",
    phosphorusMethod: "P method",
    notSpecifiedMasculine: "not specified",
    notSpecifiedFeminine: "not specified",
    kmgRatio: "K : Mg ratio",
    kCoefficient: "K coefficient",
    kmgNeedBoth: "Both K and Mg must be entered for the correction.",
    nitrogenCorrection: "N correction",
    predecessor: "Predecessor crop",
    noAppliedCorrection: "no correction applied",
    organicFertilization: "Organic fertilization",
    noAppliedDeduction: "no deduction applied",
    nminStoredNote: "stored as a refinement value, not automatically deducted",
    frameworkNitrogenSplit: "Framework nitrogen split",
    doseCannotCalculate: "dose cannot be calculated",
    noNitrogenSplit: "No N split is available in the database for this crop.",
    addYieldForNitrogen: "Enter the planned yield for a specific nitrogen recommendation. AEGRIS does not estimate the dose without this input.",
    nutritionInputs: "Nutrition calculation inputs",
    plannedYieldUnit: "Planned yield (t/ha)",
    soilTextureForKMg: "Soil texture for K / Mg",
    select: "Select",
    lightSoil: "Light soil",
    mediumSoil: "Medium soil",
    heavySoil: "Heavy soil",
    phosphorusDetermination: "P determination method",
    soilP: "Soil P (mg/kg)",
    soilK: "Soil K (mg/kg)",
    soilMg: "Soil Mg (mg/kg)",
    soilPh: "Soil pH",
    predecessorCrop: "Predecessor crop",
    predecessorExample: "e.g. clover",
    predecessorGroup: "Predecessor group",
    noCorrectionOther: "No correction / other",
    clovers: "Clovers",
    legumes: "Legumes",
    organicFertilizer: "Organic fertilizer",
    noDeduction: "No deduction",
    manure: "Manure",
    slurry: "Liquid manure",
    liquidManure: "Slurry",
    slurryType: "Slurry type",
    cattle: "Cattle",
    pigs: "Pigs",
    poultry: "Poultry",
    organicRate: "Organic fertilizer rate (t/ha)",
    applicationPeriod: "Application period",
    organicNYear: "Year of organic N effect",
    firstYear: "1st year",
    secondYear: "2nd year",
    dataSource: "Data source",
    dataSourcePlaceholder: "e.g. soil test 2026 / laboratory analysis",
    note: "Note",
    saving: "Saving…",
    saveNutritionInputs: "💾 Save nutrition inputs",
    projectDetails: "PROJECT DETAILS",
    crop: "Crop",
    variety: "Variety",
    sowingDate: "Sowing date",
    expectedHarvest: "Expected harvest",
    farmingMethod: "Farming method",
    editCropData: "✎ Edit crop data",
    cropProfile: "CROP PROFILE",
    profileNotEvaluated: "Profile not evaluated",
    moisture: "Moisture",
    soilPH: "Soil pH",
    waterNeed: "Water need",
    notSpecified: "Not specified",
    stage: "Stage",
    waterStress: "Water stress",
    projectLocation: "PROJECT LOCATION",
    cropDataEditing: "EDIT CROP DATA",
    cultivatedCrop: "Cultivated crop",
    originalValue: "Original value",
    selectCropUkzuz: "Select crop from ÚKZÚZ",
    noAgronomicProfile: "No agronomic profile is assigned to this official crop yet.",
    loadingVarieties: "Loading ÚKZÚZ varieties...",
    selectVarietyUkzuz: "Select variety from ÚKZÚZ",
    noActiveVarieties: "No active varieties are available for this crop",
    areaHa: "Area (ha)",
    farmingMethodLabel: "Farming method",
    conventional: "Conventional",
    integrated: "Integrated",
    organic: "Organic",
    other: "Other",
    sowingPlantingDate: "Sowing / planting date",
    expectedHarvestDate: "Expected harvest",
    currentGrowthStage: "Current growth stage",
    selectGrowthStage: "Select growth stage",
    saveCropData: "💾 Save crop data",
    projectDevelopment: "PROJECT DEVELOPMENT",
    eventHistory: "Event history",
    analysisLabel: "ANALYSIS",
    analysisCompleted: "Analysis completed",
    recommendationLabel: "RECOMMENDATION",
    recommendationCreated: "Recommendation created",
    noHistoricalEvents: "No historical events are available yet.",
    showCompleteProjectHistory: "Show complete project history",
    editProjectData: "Edit project data",
    readOnly: "Read only",
    recommendationHistory: "Recommendation history",
    trendWorsening: "Development is worsening",
    trendImproving: "Crop condition is improving",
    trendStable: "Development is stable",
    trendInsufficient: "Insufficient historical data",
    longTermDecline: "Long-term decline in crop activity",
    trendRising: "Rising",
    trendFalling: "Falling",
    trendStableShort: "Stable",
    trendWindowInsufficient: "insufficient data",
    noMajorRiskFactor: "No significant risk factor",
    strengthVeryStrong: "Very strong",
    strengthStrong: "Strong",
    strengthMedium: "Medium",
    strengthWeak: "Weak",
    supplyLow: "low",
    supplySatisfactory: "satisfactory",
    supplyGood: "good",
    supplyHigh: "high",
    supplyVeryHigh: "very high",
  };
  const el = {
    invalidProjectId: "Invalid project ID.",
    projectLoadFailed: "Failed to load project.",
    projectNotFound: "Project was not found or you do not have access to it.",
    projectOrganizationInvalid: "The project does not have a valid organization set.",
    permissionCheckFailed: "Failed to verify access to the project.",
    nutritionLoadFailed: "Fertilization inputs could not be loaded.",
    nutritionNumberInvalid: "Nutrition values must be valid numbers.",
    plannedYieldPositive: "Planned yield must be greater than 0.",
    phRange: "pH must be between 0 and 14.",
    phosphorusMethodRequired: "Select the phosphorus determination method (SP or ICP-OES).",
    soilTextureRequired: "Select the soil texture class for K and Mg classification.",
    nutritionSaveFailed: "Fertilization inputs could not be saved.",
    varietyRequired: "VARIETY IS REQUIRED",
    varietyMismatch: "The selected variety does not belong to the selected crop.",
    areaPositive: "Area must be greater than 0.",
    accessDenied: "Access denied",
    noProjectAccess: "You do not have access to this project",
    projectAccessDescription: "The project does not exist or you do not have permission to view it.",
    backToProjects: "Back to projects",
    loadingProject: "Loading project...",
    back: "Back",
    cropNotSpecified: "Crop not specified",
    areaNotSpecified: "Area not specified",
    growthStageNotSpecified: "Growth stage not specified",
    updated: "Updated",
    refreshData: "Refresh data",
    refresh: "Refresh",
    analyzing: "Analyzing…",
    runAnalysis: "Run new analysis",
    projectInformation: "Project information",
    latitude: "Latitude",
    longitude: "Longitude",
    area: "Area",
    growthStage: "Growth stage",
    created: "Created",
    currentVegetation: "Current vegetation status",
    overallAssessment: "Overall assessment",
    analysisUnavailable: "Analysis is not available yet",
    mainReason: "Main reason",
    cropCondition: "CROP CONDITION",
    priority: "Priority",
    previous: "vs. previous",
    lastAnalysis: "Last analysis",
    storedDecisionSnapshot: "AEGRIS is displaying the stored server decision snapshot",
    legacyWeatherSnapshot: "Legacy analysis uses the stored conditions snapshot",
    viewerReadOnly: "Viewer access is read-only.",
    serverAnalysisReady: "Server analysis ready",
    contextualAssessment: "Context assessment",
    contextualScore: "AEGRIS context score",
    criticalFactors: "Critical factors",
    ofFactors: "of",
    criticalFactorsLabel: "critical factors",
    dataConfidence: "Data confidence",
    dataReliability: "DATA RELIABILITY",
    analysisQualityOrigin: "ANALYSIS QUALITY AND ORIGIN",
    analysisMetadata: "Technical metadata of the latest saved Sentinel analysis.",
    validCoverage: "Valid coverage",
    source: "Source",
    spatialResolution: "Spatial resolution",
    crsNotSpecified: "CRS not specified",
    validPixels: "Valid pixels",
    afterMasking: "after cloud / no-data masking",
    qualityGate: "Quality gate",
    minimumPolygonCoverage: "minimum valid polygon coverage",
    acceptedIntervals: "Accepted intervals",
    rejectedIntervals: "Rejected intervals",
    medianNdvi: "Median NDVI",
    provenanceNote: "NDVI is calculated from Sentinel-2 bands B08 and B04. Invalid pixels are filtered using the Scene Classification Layer (SCL) and dataMask. AEGRIS weather comes from a separate weather source and historical evaluation uses the stored snapshot.",
    noQualityMetadata: "This saved analysis does not yet contain quality metadata. Run a new analysis; AEGRIS will then store the actual source, resolution, valid coverage and quality gate directly from the Copernicus result.",
    decisionRecommendation: "DECISION RECOMMENDATION",
    whatIsHappening: "WHAT IS HAPPENING",
    longTermTrend: "LONG-TERM TREND",
    sinceLastAnalysis: "SINCE LAST ANALYSIS",
    whatToDoNow: "WHAT TO DO NOW",
    nextStep: "NEXT STEP",
    projectAlerts: "PROJECT ALERTS",
    unread: "Unread",
    newLabel: "NEW",
    markAsRead: "Mark as read",
    noAlerts: "No alert has been created yet.",
    showAllAlerts: "Show all alerts",
    recommendations: "AEGRIS RECOMMENDATIONS",
    diagnosis: "AEGRIS DIAGNOSTICS",
    probableCauses: "Probable causes of the current risk",
    diagnosisShort: "diag.",
    indicationStrength: "Indication strength",
    noDiagnosis: "No diagnosis is currently identified.",
    keyFactors: "KEY FACTORS",
    inRange: "IN RANGE",
    score: "Score",
    weight: "weight",
    ndviDevelopment: "NDVI DEVELOPMENT",
    trend: "Trend",
    trendWindow: "Trend window",
    stateAndRecommendations: "STATUS AND RECOMMENDATION DEVELOPMENT",
    noRecord: "No record yet.",
    showRecommendationHistory: "Show recommendation history",
    analysisHistory: "ANALYSIS HISTORY",
    weatherConditions: "WEATHER AND CONDITIONS",
    currentLocalConditions: "CURRENT CONDITIONS AT THE LOCATION",
    temperature: "Temperature",
    humidity: "Humidity",
    precipitationLastHour: "Precipitation – last hour",
    wind: "Wind",
    current: "Current",
    loadingWeather: "Loading weather...",
    weatherLoadFailed: "Weather could not be loaded.",
    tempWithinProfile: "Within profile range",
    tempOutsideProfile: "Outside profile range",
    noEvaluation: "Not evaluated",
    nutritionTitle: "AEGRIS AGRONOMY · NUTRITION AND FERTILIZATION",
    nutritionMethodProfile: "CROP NUTRITION METHODOLOGY PROFILE",
    nutritionMethodDescription: "The calculation is based on the ÚKZÚZ methodology. AEGRIS does not display a specific dose when the inputs required for a safe determination are missing.",
    nutritionProfileAvailable: "Nutrition profile available",
    nutritionProfileUnavailable: "Nutrition profile not available",
    closeInputs: "Close inputs",
    completeInputs: "✎ Complete inputs",
    loadingNutrition: "Loading nutrition profile…",
    plannedYield: "Planned yield",
    lowYield: "Low yield level",
    mediumYield: "Medium yield level",
    highYield: "High yield level",
    neededForNutrition: "Required for nutrition calculation",
    nitrogen: "Nitrogen N",
    base: "Base",
    minimum: "minimum",
    plannedYieldMissing: "Planned yield is missing.",
    phosphorus: "Phosphorus P₂O₅",
    potassium: "Potassium K₂O",
    magnesium: "Magnesium MgO",
    methodNotSpecified: "method not specified",
    missingP: "Soil P analysis is missing.",
    missingK: "Soil K analysis is missing.",
    missingMg: "Soil Mg analysis is missing.",
    methodologySource: "Methodology source",
    soilSupplyClassification: "Soil nutrient supply classification",
    soilTexture: "Soil texture",
    phosphorusMethod: "P method",
    notSpecifiedMasculine: "not specified",
    notSpecifiedFeminine: "not specified",
    kmgRatio: "K : Mg ratio",
    kCoefficient: "K coefficient",
    kmgNeedBoth: "Both K and Mg must be entered for the correction.",
    nitrogenCorrection: "N correction",
    predecessor: "Predecessor crop",
    noAppliedCorrection: "no correction applied",
    organicFertilization: "Organic fertilization",
    noAppliedDeduction: "no deduction applied",
    nminStoredNote: "stored as a refinement value, not automatically deducted",
    frameworkNitrogenSplit: "Framework nitrogen split",
    doseCannotCalculate: "dose cannot be calculated",
    noNitrogenSplit: "No N split is available in the database for this crop.",
    addYieldForNitrogen: "Enter the planned yield for a specific nitrogen recommendation. AEGRIS does not estimate the dose without this input.",
    nutritionInputs: "Nutrition calculation inputs",
    plannedYieldUnit: "Planned yield (t/ha)",
    soilTextureForKMg: "Soil texture for K / Mg",
    select: "Select",
    lightSoil: "Light soil",
    mediumSoil: "Medium soil",
    heavySoil: "Heavy soil",
    phosphorusDetermination: "P determination method",
    soilP: "Soil P (mg/kg)",
    soilK: "Soil K (mg/kg)",
    soilMg: "Soil Mg (mg/kg)",
    soilPh: "Soil pH",
    predecessorCrop: "Predecessor crop",
    predecessorExample: "e.g. clover",
    predecessorGroup: "Predecessor group",
    noCorrectionOther: "No correction / other",
    clovers: "Clovers",
    legumes: "Legumes",
    organicFertilizer: "Organic fertilizer",
    noDeduction: "No deduction",
    manure: "Manure",
    slurry: "Liquid manure",
    liquidManure: "Slurry",
    slurryType: "Slurry type",
    cattle: "Cattle",
    pigs: "Pigs",
    poultry: "Poultry",
    organicRate: "Organic fertilizer rate (t/ha)",
    applicationPeriod: "Application period",
    organicNYear: "Year of organic N effect",
    firstYear: "1st year",
    secondYear: "2nd year",
    dataSource: "Data source",
    dataSourcePlaceholder: "e.g. soil test 2026 / laboratory analysis",
    note: "Note",
    saving: "Saving…",
    saveNutritionInputs: "💾 Save nutrition inputs",
    projectDetails: "PROJECT DETAILS",
    crop: "Crop",
    variety: "Variety",
    sowingDate: "Sowing date",
    expectedHarvest: "Expected harvest",
    farmingMethod: "Farming method",
    editCropData: "✎ Edit crop data",
    cropProfile: "CROP PROFILE",
    profileNotEvaluated: "Profile not evaluated",
    moisture: "Moisture",
    soilPH: "Soil pH",
    waterNeed: "Water need",
    notSpecified: "Not specified",
    stage: "Stage",
    waterStress: "Water stress",
    projectLocation: "PROJECT LOCATION",
    cropDataEditing: "EDIT CROP DATA",
    cultivatedCrop: "Cultivated crop",
    originalValue: "Original value",
    selectCropUkzuz: "Select crop from ÚKZÚZ",
    noAgronomicProfile: "No agronomic profile is assigned to this official crop yet.",
    loadingVarieties: "Loading ÚKZÚZ varieties...",
    selectVarietyUkzuz: "Select variety from ÚKZÚZ",
    noActiveVarieties: "No active varieties are available for this crop",
    areaHa: "Area (ha)",
    farmingMethodLabel: "Farming method",
    conventional: "Conventional",
    integrated: "Integrated",
    organic: "Organic",
    other: "Other",
    sowingPlantingDate: "Sowing / planting date",
    expectedHarvestDate: "Expected harvest",
    currentGrowthStage: "Current growth stage",
    selectGrowthStage: "Select growth stage",
    saveCropData: "💾 Save crop data",
    projectDevelopment: "PROJECT DEVELOPMENT",
    eventHistory: "Event history",
    analysisLabel: "ANALYSIS",
    analysisCompleted: "Analysis completed",
    recommendationLabel: "RECOMMENDATION",
    recommendationCreated: "Recommendation created",
    noHistoricalEvents: "No historical events are available yet.",
    showCompleteProjectHistory: "Show complete project history",
    editProjectData: "Edit project data",
    readOnly: "Read only",
    recommendationHistory: "Recommendation history",
    trendWorsening: "Development is worsening",
    trendImproving: "Crop condition is improving",
    trendStable: "Development is stable",
    trendInsufficient: "Insufficient historical data",
    longTermDecline: "Long-term decline in crop activity",
    trendRising: "Rising",
    trendFalling: "Falling",
    trendStableShort: "Stable",
    trendWindowInsufficient: "insufficient data",
    noMajorRiskFactor: "No significant risk factor",
    strengthVeryStrong: "Very strong",
    strengthStrong: "Strong",
    strengthMedium: "Medium",
    strengthWeak: "Weak",
    supplyLow: "low",
    supplySatisfactory: "satisfactory",
    supplyGood: "good",
    supplyHigh: "high",
    supplyVeryHigh: "very high",
  };
  const sv = {
    invalidProjectId: "Invalid project ID.",
    projectLoadFailed: "Failed to load project.",
    projectNotFound: "Project was not found or you do not have access to it.",
    projectOrganizationInvalid: "The project does not have a valid organization set.",
    permissionCheckFailed: "Failed to verify access to the project.",
    nutritionLoadFailed: "Fertilization inputs could not be loaded.",
    nutritionNumberInvalid: "Nutrition values must be valid numbers.",
    plannedYieldPositive: "Planned yield must be greater than 0.",
    phRange: "pH must be between 0 and 14.",
    phosphorusMethodRequired: "Select the phosphorus determination method (SP or ICP-OES).",
    soilTextureRequired: "Select the soil texture class for K and Mg classification.",
    nutritionSaveFailed: "Fertilization inputs could not be saved.",
    varietyRequired: "VARIETY IS REQUIRED",
    varietyMismatch: "The selected variety does not belong to the selected crop.",
    areaPositive: "Area must be greater than 0.",
    accessDenied: "Access denied",
    noProjectAccess: "You do not have access to this project",
    projectAccessDescription: "The project does not exist or you do not have permission to view it.",
    backToProjects: "Back to projects",
    loadingProject: "Loading project...",
    back: "Back",
    cropNotSpecified: "Crop not specified",
    areaNotSpecified: "Area not specified",
    growthStageNotSpecified: "Growth stage not specified",
    updated: "Updated",
    refreshData: "Refresh data",
    refresh: "Refresh",
    analyzing: "Analyzing…",
    runAnalysis: "Run new analysis",
    projectInformation: "Project information",
    latitude: "Latitude",
    longitude: "Longitude",
    area: "Area",
    growthStage: "Growth stage",
    created: "Created",
    currentVegetation: "Current vegetation status",
    overallAssessment: "Overall assessment",
    analysisUnavailable: "Analysis is not available yet",
    mainReason: "Main reason",
    cropCondition: "CROP CONDITION",
    priority: "Priority",
    previous: "vs. previous",
    lastAnalysis: "Last analysis",
    storedDecisionSnapshot: "AEGRIS is displaying the stored server decision snapshot",
    legacyWeatherSnapshot: "Legacy analysis uses the stored conditions snapshot",
    viewerReadOnly: "Viewer access is read-only.",
    serverAnalysisReady: "Server analysis ready",
    contextualAssessment: "Context assessment",
    contextualScore: "AEGRIS context score",
    criticalFactors: "Critical factors",
    ofFactors: "of",
    criticalFactorsLabel: "critical factors",
    dataConfidence: "Data confidence",
    dataReliability: "DATA RELIABILITY",
    analysisQualityOrigin: "ANALYSIS QUALITY AND ORIGIN",
    analysisMetadata: "Technical metadata of the latest saved Sentinel analysis.",
    validCoverage: "Valid coverage",
    source: "Source",
    spatialResolution: "Spatial resolution",
    crsNotSpecified: "CRS not specified",
    validPixels: "Valid pixels",
    afterMasking: "after cloud / no-data masking",
    qualityGate: "Quality gate",
    minimumPolygonCoverage: "minimum valid polygon coverage",
    acceptedIntervals: "Accepted intervals",
    rejectedIntervals: "Rejected intervals",
    medianNdvi: "Median NDVI",
    provenanceNote: "NDVI is calculated from Sentinel-2 bands B08 and B04. Invalid pixels are filtered using the Scene Classification Layer (SCL) and dataMask. AEGRIS weather comes from a separate weather source and historical evaluation uses the stored snapshot.",
    noQualityMetadata: "This saved analysis does not yet contain quality metadata. Run a new analysis; AEGRIS will then store the actual source, resolution, valid coverage and quality gate directly from the Copernicus result.",
    decisionRecommendation: "DECISION RECOMMENDATION",
    whatIsHappening: "WHAT IS HAPPENING",
    longTermTrend: "LONG-TERM TREND",
    sinceLastAnalysis: "SINCE LAST ANALYSIS",
    whatToDoNow: "WHAT TO DO NOW",
    nextStep: "NEXT STEP",
    projectAlerts: "PROJECT ALERTS",
    unread: "Unread",
    newLabel: "NEW",
    markAsRead: "Mark as read",
    noAlerts: "No alert has been created yet.",
    showAllAlerts: "Show all alerts",
    recommendations: "AEGRIS RECOMMENDATIONS",
    diagnosis: "AEGRIS DIAGNOSTICS",
    probableCauses: "Probable causes of the current risk",
    diagnosisShort: "diag.",
    indicationStrength: "Indication strength",
    noDiagnosis: "No diagnosis is currently identified.",
    keyFactors: "KEY FACTORS",
    inRange: "IN RANGE",
    score: "Score",
    weight: "weight",
    ndviDevelopment: "NDVI DEVELOPMENT",
    trend: "Trend",
    trendWindow: "Trend window",
    stateAndRecommendations: "STATUS AND RECOMMENDATION DEVELOPMENT",
    noRecord: "No record yet.",
    showRecommendationHistory: "Show recommendation history",
    analysisHistory: "ANALYSIS HISTORY",
    weatherConditions: "WEATHER AND CONDITIONS",
    currentLocalConditions: "CURRENT CONDITIONS AT THE LOCATION",
    temperature: "Temperature",
    humidity: "Humidity",
    precipitationLastHour: "Precipitation – last hour",
    wind: "Wind",
    current: "Current",
    loadingWeather: "Loading weather...",
    weatherLoadFailed: "Weather could not be loaded.",
    tempWithinProfile: "Within profile range",
    tempOutsideProfile: "Outside profile range",
    noEvaluation: "Not evaluated",
    nutritionTitle: "AEGRIS AGRONOMY · NUTRITION AND FERTILIZATION",
    nutritionMethodProfile: "CROP NUTRITION METHODOLOGY PROFILE",
    nutritionMethodDescription: "The calculation is based on the ÚKZÚZ methodology. AEGRIS does not display a specific dose when the inputs required for a safe determination are missing.",
    nutritionProfileAvailable: "Nutrition profile available",
    nutritionProfileUnavailable: "Nutrition profile not available",
    closeInputs: "Close inputs",
    completeInputs: "✎ Complete inputs",
    loadingNutrition: "Loading nutrition profile…",
    plannedYield: "Planned yield",
    lowYield: "Low yield level",
    mediumYield: "Medium yield level",
    highYield: "High yield level",
    neededForNutrition: "Required for nutrition calculation",
    nitrogen: "Nitrogen N",
    base: "Base",
    minimum: "minimum",
    plannedYieldMissing: "Planned yield is missing.",
    phosphorus: "Phosphorus P₂O₅",
    potassium: "Potassium K₂O",
    magnesium: "Magnesium MgO",
    methodNotSpecified: "method not specified",
    missingP: "Soil P analysis is missing.",
    missingK: "Soil K analysis is missing.",
    missingMg: "Soil Mg analysis is missing.",
    methodologySource: "Methodology source",
    soilSupplyClassification: "Soil nutrient supply classification",
    soilTexture: "Soil texture",
    phosphorusMethod: "P method",
    notSpecifiedMasculine: "not specified",
    notSpecifiedFeminine: "not specified",
    kmgRatio: "K : Mg ratio",
    kCoefficient: "K coefficient",
    kmgNeedBoth: "Both K and Mg must be entered for the correction.",
    nitrogenCorrection: "N correction",
    predecessor: "Predecessor crop",
    noAppliedCorrection: "no correction applied",
    organicFertilization: "Organic fertilization",
    noAppliedDeduction: "no deduction applied",
    nminStoredNote: "stored as a refinement value, not automatically deducted",
    frameworkNitrogenSplit: "Framework nitrogen split",
    doseCannotCalculate: "dose cannot be calculated",
    noNitrogenSplit: "No N split is available in the database for this crop.",
    addYieldForNitrogen: "Enter the planned yield for a specific nitrogen recommendation. AEGRIS does not estimate the dose without this input.",
    nutritionInputs: "Nutrition calculation inputs",
    plannedYieldUnit: "Planned yield (t/ha)",
    soilTextureForKMg: "Soil texture for K / Mg",
    select: "Select",
    lightSoil: "Light soil",
    mediumSoil: "Medium soil",
    heavySoil: "Heavy soil",
    phosphorusDetermination: "P determination method",
    soilP: "Soil P (mg/kg)",
    soilK: "Soil K (mg/kg)",
    soilMg: "Soil Mg (mg/kg)",
    soilPh: "Soil pH",
    predecessorCrop: "Predecessor crop",
    predecessorExample: "e.g. clover",
    predecessorGroup: "Predecessor group",
    noCorrectionOther: "No correction / other",
    clovers: "Clovers",
    legumes: "Legumes",
    organicFertilizer: "Organic fertilizer",
    noDeduction: "No deduction",
    manure: "Manure",
    slurry: "Liquid manure",
    liquidManure: "Slurry",
    slurryType: "Slurry type",
    cattle: "Cattle",
    pigs: "Pigs",
    poultry: "Poultry",
    organicRate: "Organic fertilizer rate (t/ha)",
    applicationPeriod: "Application period",
    organicNYear: "Year of organic N effect",
    firstYear: "1st year",
    secondYear: "2nd year",
    dataSource: "Data source",
    dataSourcePlaceholder: "e.g. soil test 2026 / laboratory analysis",
    note: "Note",
    saving: "Saving…",
    saveNutritionInputs: "💾 Save nutrition inputs",
    projectDetails: "PROJECT DETAILS",
    crop: "Crop",
    variety: "Variety",
    sowingDate: "Sowing date",
    expectedHarvest: "Expected harvest",
    farmingMethod: "Farming method",
    editCropData: "✎ Edit crop data",
    cropProfile: "CROP PROFILE",
    profileNotEvaluated: "Profile not evaluated",
    moisture: "Moisture",
    soilPH: "Soil pH",
    waterNeed: "Water need",
    notSpecified: "Not specified",
    stage: "Stage",
    waterStress: "Water stress",
    projectLocation: "PROJECT LOCATION",
    cropDataEditing: "EDIT CROP DATA",
    cultivatedCrop: "Cultivated crop",
    originalValue: "Original value",
    selectCropUkzuz: "Select crop from ÚKZÚZ",
    noAgronomicProfile: "No agronomic profile is assigned to this official crop yet.",
    loadingVarieties: "Loading ÚKZÚZ varieties...",
    selectVarietyUkzuz: "Select variety from ÚKZÚZ",
    noActiveVarieties: "No active varieties are available for this crop",
    areaHa: "Area (ha)",
    farmingMethodLabel: "Farming method",
    conventional: "Conventional",
    integrated: "Integrated",
    organic: "Organic",
    other: "Other",
    sowingPlantingDate: "Sowing / planting date",
    expectedHarvestDate: "Expected harvest",
    currentGrowthStage: "Current growth stage",
    selectGrowthStage: "Select growth stage",
    saveCropData: "💾 Save crop data",
    projectDevelopment: "PROJECT DEVELOPMENT",
    eventHistory: "Event history",
    analysisLabel: "ANALYSIS",
    analysisCompleted: "Analysis completed",
    recommendationLabel: "RECOMMENDATION",
    recommendationCreated: "Recommendation created",
    noHistoricalEvents: "No historical events are available yet.",
    showCompleteProjectHistory: "Show complete project history",
    editProjectData: "Edit project data",
    readOnly: "Read only",
    recommendationHistory: "Recommendation history",
    trendWorsening: "Development is worsening",
    trendImproving: "Crop condition is improving",
    trendStable: "Development is stable",
    trendInsufficient: "Insufficient historical data",
    longTermDecline: "Long-term decline in crop activity",
    trendRising: "Rising",
    trendFalling: "Falling",
    trendStableShort: "Stable",
    trendWindowInsufficient: "insufficient data",
    noMajorRiskFactor: "No significant risk factor",
    strengthVeryStrong: "Very strong",
    strengthStrong: "Strong",
    strengthMedium: "Medium",
    strengthWeak: "Weak",
    supplyLow: "low",
    supplySatisfactory: "satisfactory",
    supplyGood: "good",
    supplyHigh: "high",
    supplyVeryHigh: "very high",
  };
  const da = {
    invalidProjectId: "Invalid project ID.",
    projectLoadFailed: "Failed to load project.",
    projectNotFound: "Project was not found or you do not have access to it.",
    projectOrganizationInvalid: "The project does not have a valid organization set.",
    permissionCheckFailed: "Failed to verify access to the project.",
    nutritionLoadFailed: "Fertilization inputs could not be loaded.",
    nutritionNumberInvalid: "Nutrition values must be valid numbers.",
    plannedYieldPositive: "Planned yield must be greater than 0.",
    phRange: "pH must be between 0 and 14.",
    phosphorusMethodRequired: "Select the phosphorus determination method (SP or ICP-OES).",
    soilTextureRequired: "Select the soil texture class for K and Mg classification.",
    nutritionSaveFailed: "Fertilization inputs could not be saved.",
    varietyRequired: "VARIETY IS REQUIRED",
    varietyMismatch: "The selected variety does not belong to the selected crop.",
    areaPositive: "Area must be greater than 0.",
    accessDenied: "Access denied",
    noProjectAccess: "You do not have access to this project",
    projectAccessDescription: "The project does not exist or you do not have permission to view it.",
    backToProjects: "Back to projects",
    loadingProject: "Loading project...",
    back: "Back",
    cropNotSpecified: "Crop not specified",
    areaNotSpecified: "Area not specified",
    growthStageNotSpecified: "Growth stage not specified",
    updated: "Updated",
    refreshData: "Refresh data",
    refresh: "Refresh",
    analyzing: "Analyzing…",
    runAnalysis: "Run new analysis",
    projectInformation: "Project information",
    latitude: "Latitude",
    longitude: "Longitude",
    area: "Area",
    growthStage: "Growth stage",
    created: "Created",
    currentVegetation: "Current vegetation status",
    overallAssessment: "Overall assessment",
    analysisUnavailable: "Analysis is not available yet",
    mainReason: "Main reason",
    cropCondition: "CROP CONDITION",
    priority: "Priority",
    previous: "vs. previous",
    lastAnalysis: "Last analysis",
    storedDecisionSnapshot: "AEGRIS is displaying the stored server decision snapshot",
    legacyWeatherSnapshot: "Legacy analysis uses the stored conditions snapshot",
    viewerReadOnly: "Viewer access is read-only.",
    serverAnalysisReady: "Server analysis ready",
    contextualAssessment: "Context assessment",
    contextualScore: "AEGRIS context score",
    criticalFactors: "Critical factors",
    ofFactors: "of",
    criticalFactorsLabel: "critical factors",
    dataConfidence: "Data confidence",
    dataReliability: "DATA RELIABILITY",
    analysisQualityOrigin: "ANALYSIS QUALITY AND ORIGIN",
    analysisMetadata: "Technical metadata of the latest saved Sentinel analysis.",
    validCoverage: "Valid coverage",
    source: "Source",
    spatialResolution: "Spatial resolution",
    crsNotSpecified: "CRS not specified",
    validPixels: "Valid pixels",
    afterMasking: "after cloud / no-data masking",
    qualityGate: "Quality gate",
    minimumPolygonCoverage: "minimum valid polygon coverage",
    acceptedIntervals: "Accepted intervals",
    rejectedIntervals: "Rejected intervals",
    medianNdvi: "Median NDVI",
    provenanceNote: "NDVI is calculated from Sentinel-2 bands B08 and B04. Invalid pixels are filtered using the Scene Classification Layer (SCL) and dataMask. AEGRIS weather comes from a separate weather source and historical evaluation uses the stored snapshot.",
    noQualityMetadata: "This saved analysis does not yet contain quality metadata. Run a new analysis; AEGRIS will then store the actual source, resolution, valid coverage and quality gate directly from the Copernicus result.",
    decisionRecommendation: "DECISION RECOMMENDATION",
    whatIsHappening: "WHAT IS HAPPENING",
    longTermTrend: "LONG-TERM TREND",
    sinceLastAnalysis: "SINCE LAST ANALYSIS",
    whatToDoNow: "WHAT TO DO NOW",
    nextStep: "NEXT STEP",
    projectAlerts: "PROJECT ALERTS",
    unread: "Unread",
    newLabel: "NEW",
    markAsRead: "Mark as read",
    noAlerts: "No alert has been created yet.",
    showAllAlerts: "Show all alerts",
    recommendations: "AEGRIS RECOMMENDATIONS",
    diagnosis: "AEGRIS DIAGNOSTICS",
    probableCauses: "Probable causes of the current risk",
    diagnosisShort: "diag.",
    indicationStrength: "Indication strength",
    noDiagnosis: "No diagnosis is currently identified.",
    keyFactors: "KEY FACTORS",
    inRange: "IN RANGE",
    score: "Score",
    weight: "weight",
    ndviDevelopment: "NDVI DEVELOPMENT",
    trend: "Trend",
    trendWindow: "Trend window",
    stateAndRecommendations: "STATUS AND RECOMMENDATION DEVELOPMENT",
    noRecord: "No record yet.",
    showRecommendationHistory: "Show recommendation history",
    analysisHistory: "ANALYSIS HISTORY",
    weatherConditions: "WEATHER AND CONDITIONS",
    currentLocalConditions: "CURRENT CONDITIONS AT THE LOCATION",
    temperature: "Temperature",
    humidity: "Humidity",
    precipitationLastHour: "Precipitation – last hour",
    wind: "Wind",
    current: "Current",
    loadingWeather: "Loading weather...",
    weatherLoadFailed: "Weather could not be loaded.",
    tempWithinProfile: "Within profile range",
    tempOutsideProfile: "Outside profile range",
    noEvaluation: "Not evaluated",
    nutritionTitle: "AEGRIS AGRONOMY · NUTRITION AND FERTILIZATION",
    nutritionMethodProfile: "CROP NUTRITION METHODOLOGY PROFILE",
    nutritionMethodDescription: "The calculation is based on the ÚKZÚZ methodology. AEGRIS does not display a specific dose when the inputs required for a safe determination are missing.",
    nutritionProfileAvailable: "Nutrition profile available",
    nutritionProfileUnavailable: "Nutrition profile not available",
    closeInputs: "Close inputs",
    completeInputs: "✎ Complete inputs",
    loadingNutrition: "Loading nutrition profile…",
    plannedYield: "Planned yield",
    lowYield: "Low yield level",
    mediumYield: "Medium yield level",
    highYield: "High yield level",
    neededForNutrition: "Required for nutrition calculation",
    nitrogen: "Nitrogen N",
    base: "Base",
    minimum: "minimum",
    plannedYieldMissing: "Planned yield is missing.",
    phosphorus: "Phosphorus P₂O₅",
    potassium: "Potassium K₂O",
    magnesium: "Magnesium MgO",
    methodNotSpecified: "method not specified",
    missingP: "Soil P analysis is missing.",
    missingK: "Soil K analysis is missing.",
    missingMg: "Soil Mg analysis is missing.",
    methodologySource: "Methodology source",
    soilSupplyClassification: "Soil nutrient supply classification",
    soilTexture: "Soil texture",
    phosphorusMethod: "P method",
    notSpecifiedMasculine: "not specified",
    notSpecifiedFeminine: "not specified",
    kmgRatio: "K : Mg ratio",
    kCoefficient: "K coefficient",
    kmgNeedBoth: "Both K and Mg must be entered for the correction.",
    nitrogenCorrection: "N correction",
    predecessor: "Predecessor crop",
    noAppliedCorrection: "no correction applied",
    organicFertilization: "Organic fertilization",
    noAppliedDeduction: "no deduction applied",
    nminStoredNote: "stored as a refinement value, not automatically deducted",
    frameworkNitrogenSplit: "Framework nitrogen split",
    doseCannotCalculate: "dose cannot be calculated",
    noNitrogenSplit: "No N split is available in the database for this crop.",
    addYieldForNitrogen: "Enter the planned yield for a specific nitrogen recommendation. AEGRIS does not estimate the dose without this input.",
    nutritionInputs: "Nutrition calculation inputs",
    plannedYieldUnit: "Planned yield (t/ha)",
    soilTextureForKMg: "Soil texture for K / Mg",
    select: "Select",
    lightSoil: "Light soil",
    mediumSoil: "Medium soil",
    heavySoil: "Heavy soil",
    phosphorusDetermination: "P determination method",
    soilP: "Soil P (mg/kg)",
    soilK: "Soil K (mg/kg)",
    soilMg: "Soil Mg (mg/kg)",
    soilPh: "Soil pH",
    predecessorCrop: "Predecessor crop",
    predecessorExample: "e.g. clover",
    predecessorGroup: "Predecessor group",
    noCorrectionOther: "No correction / other",
    clovers: "Clovers",
    legumes: "Legumes",
    organicFertilizer: "Organic fertilizer",
    noDeduction: "No deduction",
    manure: "Manure",
    slurry: "Liquid manure",
    liquidManure: "Slurry",
    slurryType: "Slurry type",
    cattle: "Cattle",
    pigs: "Pigs",
    poultry: "Poultry",
    organicRate: "Organic fertilizer rate (t/ha)",
    applicationPeriod: "Application period",
    organicNYear: "Year of organic N effect",
    firstYear: "1st year",
    secondYear: "2nd year",
    dataSource: "Data source",
    dataSourcePlaceholder: "e.g. soil test 2026 / laboratory analysis",
    note: "Note",
    saving: "Saving…",
    saveNutritionInputs: "💾 Save nutrition inputs",
    projectDetails: "PROJECT DETAILS",
    crop: "Crop",
    variety: "Variety",
    sowingDate: "Sowing date",
    expectedHarvest: "Expected harvest",
    farmingMethod: "Farming method",
    editCropData: "✎ Edit crop data",
    cropProfile: "CROP PROFILE",
    profileNotEvaluated: "Profile not evaluated",
    moisture: "Moisture",
    soilPH: "Soil pH",
    waterNeed: "Water need",
    notSpecified: "Not specified",
    stage: "Stage",
    waterStress: "Water stress",
    projectLocation: "PROJECT LOCATION",
    cropDataEditing: "EDIT CROP DATA",
    cultivatedCrop: "Cultivated crop",
    originalValue: "Original value",
    selectCropUkzuz: "Select crop from ÚKZÚZ",
    noAgronomicProfile: "No agronomic profile is assigned to this official crop yet.",
    loadingVarieties: "Loading ÚKZÚZ varieties...",
    selectVarietyUkzuz: "Select variety from ÚKZÚZ",
    noActiveVarieties: "No active varieties are available for this crop",
    areaHa: "Area (ha)",
    farmingMethodLabel: "Farming method",
    conventional: "Conventional",
    integrated: "Integrated",
    organic: "Organic",
    other: "Other",
    sowingPlantingDate: "Sowing / planting date",
    expectedHarvestDate: "Expected harvest",
    currentGrowthStage: "Current growth stage",
    selectGrowthStage: "Select growth stage",
    saveCropData: "💾 Save crop data",
    projectDevelopment: "PROJECT DEVELOPMENT",
    eventHistory: "Event history",
    analysisLabel: "ANALYSIS",
    analysisCompleted: "Analysis completed",
    recommendationLabel: "RECOMMENDATION",
    recommendationCreated: "Recommendation created",
    noHistoricalEvents: "No historical events are available yet.",
    showCompleteProjectHistory: "Show complete project history",
    editProjectData: "Edit project data",
    readOnly: "Read only",
    recommendationHistory: "Recommendation history",
    trendWorsening: "Development is worsening",
    trendImproving: "Crop condition is improving",
    trendStable: "Development is stable",
    trendInsufficient: "Insufficient historical data",
    longTermDecline: "Long-term decline in crop activity",
    trendRising: "Rising",
    trendFalling: "Falling",
    trendStableShort: "Stable",
    trendWindowInsufficient: "insufficient data",
    noMajorRiskFactor: "No significant risk factor",
    strengthVeryStrong: "Very strong",
    strengthStrong: "Strong",
    strengthMedium: "Medium",
    strengthWeak: "Weak",
    supplyLow: "low",
    supplySatisfactory: "satisfactory",
    supplyGood: "good",
    supplyHigh: "high",
    supplyVeryHigh: "very high",
  };
  const no = {
    invalidProjectId: "Invalid project ID.",
    projectLoadFailed: "Failed to load project.",
    projectNotFound: "Project was not found or you do not have access to it.",
    projectOrganizationInvalid: "The project does not have a valid organization set.",
    permissionCheckFailed: "Failed to verify access to the project.",
    nutritionLoadFailed: "Fertilization inputs could not be loaded.",
    nutritionNumberInvalid: "Nutrition values must be valid numbers.",
    plannedYieldPositive: "Planned yield must be greater than 0.",
    phRange: "pH must be between 0 and 14.",
    phosphorusMethodRequired: "Select the phosphorus determination method (SP or ICP-OES).",
    soilTextureRequired: "Select the soil texture class for K and Mg classification.",
    nutritionSaveFailed: "Fertilization inputs could not be saved.",
    varietyRequired: "VARIETY IS REQUIRED",
    varietyMismatch: "The selected variety does not belong to the selected crop.",
    areaPositive: "Area must be greater than 0.",
    accessDenied: "Access denied",
    noProjectAccess: "You do not have access to this project",
    projectAccessDescription: "The project does not exist or you do not have permission to view it.",
    backToProjects: "Back to projects",
    loadingProject: "Loading project...",
    back: "Back",
    cropNotSpecified: "Crop not specified",
    areaNotSpecified: "Area not specified",
    growthStageNotSpecified: "Growth stage not specified",
    updated: "Updated",
    refreshData: "Refresh data",
    refresh: "Refresh",
    analyzing: "Analyzing…",
    runAnalysis: "Run new analysis",
    projectInformation: "Project information",
    latitude: "Latitude",
    longitude: "Longitude",
    area: "Area",
    growthStage: "Growth stage",
    created: "Created",
    currentVegetation: "Current vegetation status",
    overallAssessment: "Overall assessment",
    analysisUnavailable: "Analysis is not available yet",
    mainReason: "Main reason",
    cropCondition: "CROP CONDITION",
    priority: "Priority",
    previous: "vs. previous",
    lastAnalysis: "Last analysis",
    storedDecisionSnapshot: "AEGRIS is displaying the stored server decision snapshot",
    legacyWeatherSnapshot: "Legacy analysis uses the stored conditions snapshot",
    viewerReadOnly: "Viewer access is read-only.",
    serverAnalysisReady: "Server analysis ready",
    contextualAssessment: "Context assessment",
    contextualScore: "AEGRIS context score",
    criticalFactors: "Critical factors",
    ofFactors: "of",
    criticalFactorsLabel: "critical factors",
    dataConfidence: "Data confidence",
    dataReliability: "DATA RELIABILITY",
    analysisQualityOrigin: "ANALYSIS QUALITY AND ORIGIN",
    analysisMetadata: "Technical metadata of the latest saved Sentinel analysis.",
    validCoverage: "Valid coverage",
    source: "Source",
    spatialResolution: "Spatial resolution",
    crsNotSpecified: "CRS not specified",
    validPixels: "Valid pixels",
    afterMasking: "after cloud / no-data masking",
    qualityGate: "Quality gate",
    minimumPolygonCoverage: "minimum valid polygon coverage",
    acceptedIntervals: "Accepted intervals",
    rejectedIntervals: "Rejected intervals",
    medianNdvi: "Median NDVI",
    provenanceNote: "NDVI is calculated from Sentinel-2 bands B08 and B04. Invalid pixels are filtered using the Scene Classification Layer (SCL) and dataMask. AEGRIS weather comes from a separate weather source and historical evaluation uses the stored snapshot.",
    noQualityMetadata: "This saved analysis does not yet contain quality metadata. Run a new analysis; AEGRIS will then store the actual source, resolution, valid coverage and quality gate directly from the Copernicus result.",
    decisionRecommendation: "DECISION RECOMMENDATION",
    whatIsHappening: "WHAT IS HAPPENING",
    longTermTrend: "LONG-TERM TREND",
    sinceLastAnalysis: "SINCE LAST ANALYSIS",
    whatToDoNow: "WHAT TO DO NOW",
    nextStep: "NEXT STEP",
    projectAlerts: "PROJECT ALERTS",
    unread: "Unread",
    newLabel: "NEW",
    markAsRead: "Mark as read",
    noAlerts: "No alert has been created yet.",
    showAllAlerts: "Show all alerts",
    recommendations: "AEGRIS RECOMMENDATIONS",
    diagnosis: "AEGRIS DIAGNOSTICS",
    probableCauses: "Probable causes of the current risk",
    diagnosisShort: "diag.",
    indicationStrength: "Indication strength",
    noDiagnosis: "No diagnosis is currently identified.",
    keyFactors: "KEY FACTORS",
    inRange: "IN RANGE",
    score: "Score",
    weight: "weight",
    ndviDevelopment: "NDVI DEVELOPMENT",
    trend: "Trend",
    trendWindow: "Trend window",
    stateAndRecommendations: "STATUS AND RECOMMENDATION DEVELOPMENT",
    noRecord: "No record yet.",
    showRecommendationHistory: "Show recommendation history",
    analysisHistory: "ANALYSIS HISTORY",
    weatherConditions: "WEATHER AND CONDITIONS",
    currentLocalConditions: "CURRENT CONDITIONS AT THE LOCATION",
    temperature: "Temperature",
    humidity: "Humidity",
    precipitationLastHour: "Precipitation – last hour",
    wind: "Wind",
    current: "Current",
    loadingWeather: "Loading weather...",
    weatherLoadFailed: "Weather could not be loaded.",
    tempWithinProfile: "Within profile range",
    tempOutsideProfile: "Outside profile range",
    noEvaluation: "Not evaluated",
    nutritionTitle: "AEGRIS AGRONOMY · NUTRITION AND FERTILIZATION",
    nutritionMethodProfile: "CROP NUTRITION METHODOLOGY PROFILE",
    nutritionMethodDescription: "The calculation is based on the ÚKZÚZ methodology. AEGRIS does not display a specific dose when the inputs required for a safe determination are missing.",
    nutritionProfileAvailable: "Nutrition profile available",
    nutritionProfileUnavailable: "Nutrition profile not available",
    closeInputs: "Close inputs",
    completeInputs: "✎ Complete inputs",
    loadingNutrition: "Loading nutrition profile…",
    plannedYield: "Planned yield",
    lowYield: "Low yield level",
    mediumYield: "Medium yield level",
    highYield: "High yield level",
    neededForNutrition: "Required for nutrition calculation",
    nitrogen: "Nitrogen N",
    base: "Base",
    minimum: "minimum",
    plannedYieldMissing: "Planned yield is missing.",
    phosphorus: "Phosphorus P₂O₅",
    potassium: "Potassium K₂O",
    magnesium: "Magnesium MgO",
    methodNotSpecified: "method not specified",
    missingP: "Soil P analysis is missing.",
    missingK: "Soil K analysis is missing.",
    missingMg: "Soil Mg analysis is missing.",
    methodologySource: "Methodology source",
    soilSupplyClassification: "Soil nutrient supply classification",
    soilTexture: "Soil texture",
    phosphorusMethod: "P method",
    notSpecifiedMasculine: "not specified",
    notSpecifiedFeminine: "not specified",
    kmgRatio: "K : Mg ratio",
    kCoefficient: "K coefficient",
    kmgNeedBoth: "Both K and Mg must be entered for the correction.",
    nitrogenCorrection: "N correction",
    predecessor: "Predecessor crop",
    noAppliedCorrection: "no correction applied",
    organicFertilization: "Organic fertilization",
    noAppliedDeduction: "no deduction applied",
    nminStoredNote: "stored as a refinement value, not automatically deducted",
    frameworkNitrogenSplit: "Framework nitrogen split",
    doseCannotCalculate: "dose cannot be calculated",
    noNitrogenSplit: "No N split is available in the database for this crop.",
    addYieldForNitrogen: "Enter the planned yield for a specific nitrogen recommendation. AEGRIS does not estimate the dose without this input.",
    nutritionInputs: "Nutrition calculation inputs",
    plannedYieldUnit: "Planned yield (t/ha)",
    soilTextureForKMg: "Soil texture for K / Mg",
    select: "Select",
    lightSoil: "Light soil",
    mediumSoil: "Medium soil",
    heavySoil: "Heavy soil",
    phosphorusDetermination: "P determination method",
    soilP: "Soil P (mg/kg)",
    soilK: "Soil K (mg/kg)",
    soilMg: "Soil Mg (mg/kg)",
    soilPh: "Soil pH",
    predecessorCrop: "Predecessor crop",
    predecessorExample: "e.g. clover",
    predecessorGroup: "Predecessor group",
    noCorrectionOther: "No correction / other",
    clovers: "Clovers",
    legumes: "Legumes",
    organicFertilizer: "Organic fertilizer",
    noDeduction: "No deduction",
    manure: "Manure",
    slurry: "Liquid manure",
    liquidManure: "Slurry",
    slurryType: "Slurry type",
    cattle: "Cattle",
    pigs: "Pigs",
    poultry: "Poultry",
    organicRate: "Organic fertilizer rate (t/ha)",
    applicationPeriod: "Application period",
    organicNYear: "Year of organic N effect",
    firstYear: "1st year",
    secondYear: "2nd year",
    dataSource: "Data source",
    dataSourcePlaceholder: "e.g. soil test 2026 / laboratory analysis",
    note: "Note",
    saving: "Saving…",
    saveNutritionInputs: "💾 Save nutrition inputs",
    projectDetails: "PROJECT DETAILS",
    crop: "Crop",
    variety: "Variety",
    sowingDate: "Sowing date",
    expectedHarvest: "Expected harvest",
    farmingMethod: "Farming method",
    editCropData: "✎ Edit crop data",
    cropProfile: "CROP PROFILE",
    profileNotEvaluated: "Profile not evaluated",
    moisture: "Moisture",
    soilPH: "Soil pH",
    waterNeed: "Water need",
    notSpecified: "Not specified",
    stage: "Stage",
    waterStress: "Water stress",
    projectLocation: "PROJECT LOCATION",
    cropDataEditing: "EDIT CROP DATA",
    cultivatedCrop: "Cultivated crop",
    originalValue: "Original value",
    selectCropUkzuz: "Select crop from ÚKZÚZ",
    noAgronomicProfile: "No agronomic profile is assigned to this official crop yet.",
    loadingVarieties: "Loading ÚKZÚZ varieties...",
    selectVarietyUkzuz: "Select variety from ÚKZÚZ",
    noActiveVarieties: "No active varieties are available for this crop",
    areaHa: "Area (ha)",
    farmingMethodLabel: "Farming method",
    conventional: "Conventional",
    integrated: "Integrated",
    organic: "Organic",
    other: "Other",
    sowingPlantingDate: "Sowing / planting date",
    expectedHarvestDate: "Expected harvest",
    currentGrowthStage: "Current growth stage",
    selectGrowthStage: "Select growth stage",
    saveCropData: "💾 Save crop data",
    projectDevelopment: "PROJECT DEVELOPMENT",
    eventHistory: "Event history",
    analysisLabel: "ANALYSIS",
    analysisCompleted: "Analysis completed",
    recommendationLabel: "RECOMMENDATION",
    recommendationCreated: "Recommendation created",
    noHistoricalEvents: "No historical events are available yet.",
    showCompleteProjectHistory: "Show complete project history",
    editProjectData: "Edit project data",
    readOnly: "Read only",
    recommendationHistory: "Recommendation history",
    trendWorsening: "Development is worsening",
    trendImproving: "Crop condition is improving",
    trendStable: "Development is stable",
    trendInsufficient: "Insufficient historical data",
    longTermDecline: "Long-term decline in crop activity",
    trendRising: "Rising",
    trendFalling: "Falling",
    trendStableShort: "Stable",
    trendWindowInsufficient: "insufficient data",
    noMajorRiskFactor: "No significant risk factor",
    strengthVeryStrong: "Very strong",
    strengthStrong: "Strong",
    strengthMedium: "Medium",
    strengthWeak: "Weak",
    supplyLow: "low",
    supplySatisfactory: "satisfactory",
    supplyGood: "good",
    supplyHigh: "high",
    supplyVeryHigh: "very high",
  };
  const fi = {
    invalidProjectId: "Invalid project ID.",
    projectLoadFailed: "Failed to load project.",
    projectNotFound: "Project was not found or you do not have access to it.",
    projectOrganizationInvalid: "The project does not have a valid organization set.",
    permissionCheckFailed: "Failed to verify access to the project.",
    nutritionLoadFailed: "Fertilization inputs could not be loaded.",
    nutritionNumberInvalid: "Nutrition values must be valid numbers.",
    plannedYieldPositive: "Planned yield must be greater than 0.",
    phRange: "pH must be between 0 and 14.",
    phosphorusMethodRequired: "Select the phosphorus determination method (SP or ICP-OES).",
    soilTextureRequired: "Select the soil texture class for K and Mg classification.",
    nutritionSaveFailed: "Fertilization inputs could not be saved.",
    varietyRequired: "VARIETY IS REQUIRED",
    varietyMismatch: "The selected variety does not belong to the selected crop.",
    areaPositive: "Area must be greater than 0.",
    accessDenied: "Access denied",
    noProjectAccess: "You do not have access to this project",
    projectAccessDescription: "The project does not exist or you do not have permission to view it.",
    backToProjects: "Back to projects",
    loadingProject: "Loading project...",
    back: "Back",
    cropNotSpecified: "Crop not specified",
    areaNotSpecified: "Area not specified",
    growthStageNotSpecified: "Growth stage not specified",
    updated: "Updated",
    refreshData: "Refresh data",
    refresh: "Refresh",
    analyzing: "Analyzing…",
    runAnalysis: "Run new analysis",
    projectInformation: "Project information",
    latitude: "Latitude",
    longitude: "Longitude",
    area: "Area",
    growthStage: "Growth stage",
    created: "Created",
    currentVegetation: "Current vegetation status",
    overallAssessment: "Overall assessment",
    analysisUnavailable: "Analysis is not available yet",
    mainReason: "Main reason",
    cropCondition: "CROP CONDITION",
    priority: "Priority",
    previous: "vs. previous",
    lastAnalysis: "Last analysis",
    storedDecisionSnapshot: "AEGRIS is displaying the stored server decision snapshot",
    legacyWeatherSnapshot: "Legacy analysis uses the stored conditions snapshot",
    viewerReadOnly: "Viewer access is read-only.",
    serverAnalysisReady: "Server analysis ready",
    contextualAssessment: "Context assessment",
    contextualScore: "AEGRIS context score",
    criticalFactors: "Critical factors",
    ofFactors: "of",
    criticalFactorsLabel: "critical factors",
    dataConfidence: "Data confidence",
    dataReliability: "DATA RELIABILITY",
    analysisQualityOrigin: "ANALYSIS QUALITY AND ORIGIN",
    analysisMetadata: "Technical metadata of the latest saved Sentinel analysis.",
    validCoverage: "Valid coverage",
    source: "Source",
    spatialResolution: "Spatial resolution",
    crsNotSpecified: "CRS not specified",
    validPixels: "Valid pixels",
    afterMasking: "after cloud / no-data masking",
    qualityGate: "Quality gate",
    minimumPolygonCoverage: "minimum valid polygon coverage",
    acceptedIntervals: "Accepted intervals",
    rejectedIntervals: "Rejected intervals",
    medianNdvi: "Median NDVI",
    provenanceNote: "NDVI is calculated from Sentinel-2 bands B08 and B04. Invalid pixels are filtered using the Scene Classification Layer (SCL) and dataMask. AEGRIS weather comes from a separate weather source and historical evaluation uses the stored snapshot.",
    noQualityMetadata: "This saved analysis does not yet contain quality metadata. Run a new analysis; AEGRIS will then store the actual source, resolution, valid coverage and quality gate directly from the Copernicus result.",
    decisionRecommendation: "DECISION RECOMMENDATION",
    whatIsHappening: "WHAT IS HAPPENING",
    longTermTrend: "LONG-TERM TREND",
    sinceLastAnalysis: "SINCE LAST ANALYSIS",
    whatToDoNow: "WHAT TO DO NOW",
    nextStep: "NEXT STEP",
    projectAlerts: "PROJECT ALERTS",
    unread: "Unread",
    newLabel: "NEW",
    markAsRead: "Mark as read",
    noAlerts: "No alert has been created yet.",
    showAllAlerts: "Show all alerts",
    recommendations: "AEGRIS RECOMMENDATIONS",
    diagnosis: "AEGRIS DIAGNOSTICS",
    probableCauses: "Probable causes of the current risk",
    diagnosisShort: "diag.",
    indicationStrength: "Indication strength",
    noDiagnosis: "No diagnosis is currently identified.",
    keyFactors: "KEY FACTORS",
    inRange: "IN RANGE",
    score: "Score",
    weight: "weight",
    ndviDevelopment: "NDVI DEVELOPMENT",
    trend: "Trend",
    trendWindow: "Trend window",
    stateAndRecommendations: "STATUS AND RECOMMENDATION DEVELOPMENT",
    noRecord: "No record yet.",
    showRecommendationHistory: "Show recommendation history",
    analysisHistory: "ANALYSIS HISTORY",
    weatherConditions: "WEATHER AND CONDITIONS",
    currentLocalConditions: "CURRENT CONDITIONS AT THE LOCATION",
    temperature: "Temperature",
    humidity: "Humidity",
    precipitationLastHour: "Precipitation – last hour",
    wind: "Wind",
    current: "Current",
    loadingWeather: "Loading weather...",
    weatherLoadFailed: "Weather could not be loaded.",
    tempWithinProfile: "Within profile range",
    tempOutsideProfile: "Outside profile range",
    noEvaluation: "Not evaluated",
    nutritionTitle: "AEGRIS AGRONOMY · NUTRITION AND FERTILIZATION",
    nutritionMethodProfile: "CROP NUTRITION METHODOLOGY PROFILE",
    nutritionMethodDescription: "The calculation is based on the ÚKZÚZ methodology. AEGRIS does not display a specific dose when the inputs required for a safe determination are missing.",
    nutritionProfileAvailable: "Nutrition profile available",
    nutritionProfileUnavailable: "Nutrition profile not available",
    closeInputs: "Close inputs",
    completeInputs: "✎ Complete inputs",
    loadingNutrition: "Loading nutrition profile…",
    plannedYield: "Planned yield",
    lowYield: "Low yield level",
    mediumYield: "Medium yield level",
    highYield: "High yield level",
    neededForNutrition: "Required for nutrition calculation",
    nitrogen: "Nitrogen N",
    base: "Base",
    minimum: "minimum",
    plannedYieldMissing: "Planned yield is missing.",
    phosphorus: "Phosphorus P₂O₅",
    potassium: "Potassium K₂O",
    magnesium: "Magnesium MgO",
    methodNotSpecified: "method not specified",
    missingP: "Soil P analysis is missing.",
    missingK: "Soil K analysis is missing.",
    missingMg: "Soil Mg analysis is missing.",
    methodologySource: "Methodology source",
    soilSupplyClassification: "Soil nutrient supply classification",
    soilTexture: "Soil texture",
    phosphorusMethod: "P method",
    notSpecifiedMasculine: "not specified",
    notSpecifiedFeminine: "not specified",
    kmgRatio: "K : Mg ratio",
    kCoefficient: "K coefficient",
    kmgNeedBoth: "Both K and Mg must be entered for the correction.",
    nitrogenCorrection: "N correction",
    predecessor: "Predecessor crop",
    noAppliedCorrection: "no correction applied",
    organicFertilization: "Organic fertilization",
    noAppliedDeduction: "no deduction applied",
    nminStoredNote: "stored as a refinement value, not automatically deducted",
    frameworkNitrogenSplit: "Framework nitrogen split",
    doseCannotCalculate: "dose cannot be calculated",
    noNitrogenSplit: "No N split is available in the database for this crop.",
    addYieldForNitrogen: "Enter the planned yield for a specific nitrogen recommendation. AEGRIS does not estimate the dose without this input.",
    nutritionInputs: "Nutrition calculation inputs",
    plannedYieldUnit: "Planned yield (t/ha)",
    soilTextureForKMg: "Soil texture for K / Mg",
    select: "Select",
    lightSoil: "Light soil",
    mediumSoil: "Medium soil",
    heavySoil: "Heavy soil",
    phosphorusDetermination: "P determination method",
    soilP: "Soil P (mg/kg)",
    soilK: "Soil K (mg/kg)",
    soilMg: "Soil Mg (mg/kg)",
    soilPh: "Soil pH",
    predecessorCrop: "Predecessor crop",
    predecessorExample: "e.g. clover",
    predecessorGroup: "Predecessor group",
    noCorrectionOther: "No correction / other",
    clovers: "Clovers",
    legumes: "Legumes",
    organicFertilizer: "Organic fertilizer",
    noDeduction: "No deduction",
    manure: "Manure",
    slurry: "Liquid manure",
    liquidManure: "Slurry",
    slurryType: "Slurry type",
    cattle: "Cattle",
    pigs: "Pigs",
    poultry: "Poultry",
    organicRate: "Organic fertilizer rate (t/ha)",
    applicationPeriod: "Application period",
    organicNYear: "Year of organic N effect",
    firstYear: "1st year",
    secondYear: "2nd year",
    dataSource: "Data source",
    dataSourcePlaceholder: "e.g. soil test 2026 / laboratory analysis",
    note: "Note",
    saving: "Saving…",
    saveNutritionInputs: "💾 Save nutrition inputs",
    projectDetails: "PROJECT DETAILS",
    crop: "Crop",
    variety: "Variety",
    sowingDate: "Sowing date",
    expectedHarvest: "Expected harvest",
    farmingMethod: "Farming method",
    editCropData: "✎ Edit crop data",
    cropProfile: "CROP PROFILE",
    profileNotEvaluated: "Profile not evaluated",
    moisture: "Moisture",
    soilPH: "Soil pH",
    waterNeed: "Water need",
    notSpecified: "Not specified",
    stage: "Stage",
    waterStress: "Water stress",
    projectLocation: "PROJECT LOCATION",
    cropDataEditing: "EDIT CROP DATA",
    cultivatedCrop: "Cultivated crop",
    originalValue: "Original value",
    selectCropUkzuz: "Select crop from ÚKZÚZ",
    noAgronomicProfile: "No agronomic profile is assigned to this official crop yet.",
    loadingVarieties: "Loading ÚKZÚZ varieties...",
    selectVarietyUkzuz: "Select variety from ÚKZÚZ",
    noActiveVarieties: "No active varieties are available for this crop",
    areaHa: "Area (ha)",
    farmingMethodLabel: "Farming method",
    conventional: "Conventional",
    integrated: "Integrated",
    organic: "Organic",
    other: "Other",
    sowingPlantingDate: "Sowing / planting date",
    expectedHarvestDate: "Expected harvest",
    currentGrowthStage: "Current growth stage",
    selectGrowthStage: "Select growth stage",
    saveCropData: "💾 Save crop data",
    projectDevelopment: "PROJECT DEVELOPMENT",
    eventHistory: "Event history",
    analysisLabel: "ANALYSIS",
    analysisCompleted: "Analysis completed",
    recommendationLabel: "RECOMMENDATION",
    recommendationCreated: "Recommendation created",
    noHistoricalEvents: "No historical events are available yet.",
    showCompleteProjectHistory: "Show complete project history",
    editProjectData: "Edit project data",
    readOnly: "Read only",
    recommendationHistory: "Recommendation history",
    trendWorsening: "Development is worsening",
    trendImproving: "Crop condition is improving",
    trendStable: "Development is stable",
    trendInsufficient: "Insufficient historical data",
    longTermDecline: "Long-term decline in crop activity",
    trendRising: "Rising",
    trendFalling: "Falling",
    trendStableShort: "Stable",
    trendWindowInsufficient: "insufficient data",
    noMajorRiskFactor: "No significant risk factor",
    strengthVeryStrong: "Very strong",
    strengthStrong: "Strong",
    strengthMedium: "Medium",
    strengthWeak: "Weak",
    supplyLow: "low",
    supplySatisfactory: "satisfactory",
    supplyGood: "good",
    supplyHigh: "high",
    supplyVeryHigh: "very high",
  };
  const copies = { en, cs, sk, de, pl, fr, es, it, nl, pt, ro, hu, uk, bg, hr, sl, lt, lv, et, el, sv, da, no, fi } as const;
  return copies[language as keyof typeof copies] ?? copies.en;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getProjectDetailCopy(language);
  const localeMap: Record<string, string> = {
    cs: "cs-CZ", en: "en-GB", sk: "sk-SK", de: "de-DE", pl: "pl-PL", fr: "fr-FR",
    es: "es-ES", it: "it-IT", nl: "nl-NL", pt: "pt-PT", ro: "ro-RO", hu: "hu-HU",
    uk: "uk-UA", bg: "bg-BG", hr: "hr-HR", sl: "sl-SI", lt: "lt-LT", lv: "lv-LV",
    et: "et-EE", el: "el-GR", sv: "sv-SE", da: "da-DK", no: "nb-NO", fi: "fi-FI",
  };
  const locale = localeMap[language] ?? "en-GB";

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
        setFertilizationError(copy.nutritionLoadFailed);
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
      setFertilizationError(copy.nutritionNumberInvalid);
      return;
    }

    if (
      payload.planned_yield_t_ha != null &&
      payload.planned_yield_t_ha <= 0
    ) {
      setFertilizationError(copy.plannedYieldPositive);
      return;
    }

    if (
      payload.soil_ph != null &&
      (payload.soil_ph < 0 || payload.soil_ph > 14)
    ) {
      setFertilizationError(copy.phRange);
      return;
    }

    if (payload.soil_p_mg_kg != null && !payload.phosphorus_method) {
      setFertilizationError(copy.phosphorusMethodRequired);
      return;
    }

    if (
      (payload.soil_k_mg_kg != null || payload.soil_mg_mg_kg != null) &&
      !payload.soil_texture_class
    ) {
      setFertilizationError(copy.soilTextureRequired);
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
      setFertilizationError(copy.nutritionSaveFailed);
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
      setProjectLoadError(copy.invalidProjectId);
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
      setProjectLoadError(copy.projectLoadFailed);
      return;
    }

    if (!projectData) {
      setProject(null);
      setProjectLoadError(copy.projectNotFound);
      return;
    }

    const currentProject = projectData as Project;

    if (!currentProject.organization_id) {
      console.error(
        "CHYBA: Projekt nemá organization_id."
      );
      setProject(null);
      setProjectLoadError(copy.projectOrganizationInvalid);
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
      setProjectLoadError(copy.permissionCheckFailed);
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
        setCropVarietyError(copy.varietyRequired);
        setSavingCrop(false);
        return;
      }

      if (selectedCatalogVariety.crop_id !== cropCatalogId) {
        setCropVarietyError(copy.varietyMismatch);
        setSavingCrop(false);
        return;
      }
    } else if (!cropVariety.trim()) {
      setCropVarietyError(copy.varietyRequired);
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
  setAreaError(copy.areaPositive);
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
    if (value === "low") return copy.supplyLow;
    if (value === "satisfactory") return copy.supplySatisfactory;
    if (value === "good") return copy.supplyGood;
    if (value === "high") return copy.supplyHigh;
    if (value === "very_high") return copy.supplyVeryHigh;
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

  const temperatureStatusKey =
    weather?.temperature_c != null &&
    temperatureMin != null &&
    temperatureMax != null
      ? weather.temperature_c >= temperatureMin &&
        weather.temperature_c <= temperatureMax
        ? "within"
        : "outside"
      : "none";

  const temperatureStatus =
    temperatureStatusKey === "within"
      ? copy.tempWithinProfile
      : temperatureStatusKey === "outside"
        ? copy.tempOutsideProfile
        : copy.noEvaluation;

  const temperatureStatusClass =
    temperatureStatusKey === "within"
      ? "text-emerald-400"
      : temperatureStatusKey === "outside"
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
    : copy.noMajorRiskFactor;

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
      return { key: "falling", label: copy.trendWorsening, icon: "↘", className: "text-red-400" };
    }
    if (contextEvaluation.trend.direction === "Rostoucí") {
      return { key: "rising", label: copy.trendImproving, icon: "↗", className: "text-emerald-400" };
    }
    if (contextEvaluation.trend.direction === "Stabilní") {
      return { key: "stable", label: copy.trendStable, icon: "→", className: "text-amber-400" };
    }
    return { key: "insufficient", label: copy.trendInsufficient, icon: "—", className: "text-slate-500" };
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
      ? language === "cs"
        ? `až ${Math.max(1, contextEvaluation.trend.points - 1)} předchozích + aktuální`
        : `up to ${Math.max(1, contextEvaluation.trend.points - 1)} previous + current`
      : copy.trendWindowInsufficient;

  const decisionTitle =
    recommendationTrend.key === "falling"
      ? copy.longTermDecline
      : displayedLevel;

  const indicationStrengthLabel = (confidence: number) => {
    if (confidence >= 0.85) return copy.strengthVeryStrong;
    if (confidence >= 0.65) return copy.strengthStrong;
    if (confidence >= 0.4) return copy.strengthMedium;
    return copy.strengthWeak;
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
              {copy.accessDenied}
            </div>

            <h1 className="mt-2 text-xl font-black text-slate-100">
              {copy.noProjectAccess}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
              {copy.projectAccessDescription}
            </p>

            <button
              type="button"
              onClick={() => router.replace("/projects")}
              className="mt-6 rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
            >
              {copy.backToProjects}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/[0.10] border-t-cyan-400" />
            <div className="text-sm">{copy.loadingProject}</div>
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
                  ← {copy.back}
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
                <span>{project.crop_name ?? copy.cropNotSpecified}</span>
                <span>{project.area_ha != null ? `${project.area_ha} ha` : copy.areaNotSpecified}</span>
                <span>{project.growth_stage ?? copy.growthStageNotSpecified}</span>
                <span>{copy.updated} {new Date(analysis?.created_at ?? project.created_at).toLocaleString(locale)}</span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadProject}
                className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-xs font-bold text-slate-400 transition hover:border-cyan-300/30 hover:text-cyan-200"
                title={copy.refreshData}
              >
                ↻ {copy.refresh}
              </button>
              {organizationRole !== "viewer" && (
                <button
                  type="button"
                  onClick={runAnalysis}
                  disabled={runningAnalysis}
                  className="rounded-xl bg-cyan-300 px-5 py-3 text-xs font-black text-[#061015] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {runningAnalysis ? copy.analyzing : copy.runAnalysis}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* 1. OVERVIEW */}
        <section className="grid gap-3 xl:grid-cols-12">
          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-200">ⓘ {copy.projectInformation}</div>
              <span className="rounded-md border border-emerald-400/25 bg-emerald-400/5 px-2 py-1 text-[9px] font-black text-emerald-400">{project.status}</span>
            </div>
            <div className="mt-3 rounded-lg border border-white/[0.07] bg-[#071017] p-3">
              <div className="text-[9px] uppercase tracking-widest text-slate-600">Status</div>
              <div className="mt-1 text-xs font-bold text-emerald-400">{project.status}</div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.035]">
              <div className="bg-[#071017] p-3"><div className="text-[8px] text-slate-600">{copy.latitude}</div><div className="mt-1 text-[10px] font-bold text-slate-200">{project.latitude.toFixed(6)}</div></div>
              <div className="bg-[#071017] p-3"><div className="text-[8px] text-slate-600">{copy.longitude}</div><div className="mt-1 text-[10px] font-bold text-slate-200">{project.longitude.toFixed(6)}</div></div>
              <div className="bg-[#071017] p-3"><div className="text-[8px] text-slate-600">{copy.area}</div><div className="mt-1 text-[10px] font-bold text-slate-200">{project.area_ha != null ? `${project.area_ha} ha` : "—"}</div></div>
              <div className="bg-[#071017] p-3"><div className="text-[8px] text-slate-600">{copy.growthStage}</div><div className="mt-1 text-[10px] font-bold text-slate-200">{project.growth_stage ?? "—"}</div></div>
            </div>
            <div className="mt-2 text-[8px] text-slate-600">{copy.created}: {new Date(project.created_at).toLocaleDateString(locale)}</div>
          </div>

          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-8">
            <div className="grid gap-3 lg:grid-cols-[1fr_250px]">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-100">◒ {copy.currentVegetation}</div>
                <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-lg border border-white/[0.07] bg-[#071017]">
                  <div className="border-r border-white/[0.07] p-3"><div className="text-[8px] uppercase tracking-widest text-slate-500">NDVI</div><div className="mt-1 text-2xl font-black text-cyan-300">{currentNdvi != null ? currentNdvi.toFixed(3) : "—"}</div><div className={`text-[8px] ${latestNdviChangeClass}`}>{latestNdviChangeLabel} {copy.previous}</div></div>
                  <div className="border-r border-white/[0.07] p-3">
                    <div className="text-[8px] uppercase tracking-widest text-slate-500">
                      {copy.overallAssessment}
                    </div>
                    <div className={`mt-1 text-lg font-black ${priorityClass}`}>
                      {displayedLevel === "Bez vyhodnocení" ? "—" : displayedLevel}
                    </div>
                    <div className="mt-1 text-[8px] leading-relaxed text-slate-500">
                      {displayedLevel === "Bez vyhodnocení"
                        ? copy.analysisUnavailable
                        : `${copy.mainReason}: ${mainReasonLabel}`}
                    </div>
                  </div>
                  <div className="p-3"><div className="text-[8px] uppercase tracking-widest text-slate-500">{copy.cropCondition}</div><div className={`mt-1 text-lg font-black ${priorityClass}`}>{displayedLevel === "Bez vyhodnocení" ? "—" : contextEvaluation.scoreLevel}</div><div className="text-[8px] text-slate-500">{copy.priority} {displayedPriority}</div></div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-slate-500">
                  <span>{copy.lastAnalysis}: {analysis ? new Date(analysis.created_at).toLocaleString(locale) : "—"}</span>
                  {persistedDecisionSnapshot ? (
                    <span className="text-cyan-500/70">
                      {copy.storedDecisionSnapshot}
                    </span>
                  ) : analysisRecommendation?.weather_snapshot ? (
                    <span className="text-cyan-500/70">
                      {copy.legacyWeatherSnapshot}
                    </span>
                  ) : null}
                </div>
                {organizationRole === "viewer" ? (
                  <div className="mt-3 rounded-lg border border-white/[0.07] bg-[#071017] py-2.5 text-center text-[9px] font-bold text-slate-500">
                    {copy.viewerReadOnly}
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-white/[0.07] bg-[#071017] px-3 py-2.5 text-[9px] text-slate-500">
                    <span>Decision Engine</span>
                    <span className="font-bold text-cyan-300">{copy.serverAnalysisReady}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-white/[0.07] bg-[#071017]">
                <div className="flex flex-col items-center justify-center border-r border-white/[0.07] p-3 text-center">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    {copy.contextualAssessment}
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
                    {copy.contextualScore}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-3 text-center">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    {copy.criticalFactors}
                  </div>
                  <div className="mt-3 text-3xl font-black leading-none text-red-400">
                    {contextEvaluation.criticalFactorCount}
                  </div>
                  <div className="mt-1 text-[9px] font-bold text-slate-500">
                    {copy.ofFactors} {contextEvaluation.evaluatedFactorCount}
                  </div>
                  <div className="mt-2 text-[8px] text-slate-500">
                    {copy.criticalFactorsLabel}
                  </div>
                  <div className="mt-3 rounded-md border border-cyan-500/20 bg-cyan-300/5 px-2.5 py-1.5 text-[8px] font-bold text-cyan-300">
                    {copy.dataConfidence} {contextEvaluation.dataCompletenessPct} %
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* {copy.dataReliability} / QUALITY */}
        <section className="mt-3 rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                {copy.dataReliability}
              </div>
              <h2 className="mt-1 text-sm font-black">
                {copy.analysisQualityOrigin}
              </h2>
              <p className="mt-1 text-[9px] text-slate-500">
                {copy.analysisMetadata}
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
                {copy.validCoverage} {Number(analysis.valid_geometry_pct).toFixed(1)} %
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
                    {copy.spatialResolution}
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-cyan-300">
                    {analysis.spatial_resolution_m != null
                      ? `${analysis.spatial_resolution_m} m`
                      : "—"}
                  </div>
                  <div className="mt-0.5 text-[8px] text-slate-500">
                    {analysis.analysis_crs ?? copy.crsNotSpecified}
                  </div>
                </div>

                <div className="bg-[#071017] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">
                    {copy.validPixels}
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-slate-200">
                    {analysis.valid_pixel_count != null &&
                    analysis.geometry_pixel_count != null
                      ? `${analysis.valid_pixel_count} / ${analysis.geometry_pixel_count}`
                      : "—"}
                  </div>
                  <div className="mt-0.5 text-[8px] text-slate-500">
                    {copy.afterMasking}
                  </div>
                </div>

                <div className="bg-[#071017] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">
                    {copy.qualityGate}
                  </div>
                  <div className="mt-1 text-[10px] font-bold text-slate-200">
                    {analysis.quality_gate_pct != null
                      ? `min. ${Number(analysis.quality_gate_pct).toFixed(0)} %`
                      : "—"}
                  </div>
                  <div className="mt-0.5 text-[8px] text-slate-500">
                    {copy.minimumPolygonCoverage}
                  </div>
                </div>
              </div>

              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] text-slate-600">{copy.acceptedIntervals}</div>
                  <div className="mt-1 text-base font-black text-emerald-400">
                    {analysis.accepted_intervals ?? "—"}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] text-slate-600">{copy.rejectedIntervals}</div>
                  <div className="mt-1 text-base font-black text-amber-400">
                    {analysis.rejected_intervals ?? "—"}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] text-slate-600">{copy.medianNdvi}</div>
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
                {copy.provenanceNote}
              </div>
            </>
          ) : (
            <div className="mt-3 rounded-lg border border-white/[0.07] bg-[#071017] p-3 text-[9px] leading-4 text-slate-500">
              {copy.noQualityMetadata}
            </div>
          )}
        </section>

        {/* 2. DECISION / ALERT / ACTIONS */}
        <section className="mt-3 grid gap-3 xl:grid-cols-12">
          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-5">
            <div className="flex items-center justify-between gap-2"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">AEGRIS DECISION</div><h2 className="mt-1 text-sm font-black">{copy.decisionRecommendation}</h2></div><span className={`rounded-md border px-2 py-1 text-[9px] font-black ${displayedPriority === "Kritická" ? "border-red-500/40 bg-red-500/5 text-red-400" : "border-orange-500/40 bg-orange-500/5 text-orange-400"}`}>Priorita: {displayedPriority}</span></div>
            <div className="mt-3 text-[8px] font-black uppercase tracking-[0.18em] text-cyan-300">{copy.whatIsHappening}</div>
            <h3 className="mt-1 text-lg font-black">{decisionTitle}</h3>
            <p className="mt-1 text-[10px] leading-4 text-slate-400">{displayedSummary}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-2.5"><div className="text-[8px] text-slate-600">NDVI</div><div className="mt-1 text-base font-black text-cyan-300">{currentNdvi?.toFixed(3) ?? "—"}</div></div>
              <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-2.5"><div className="text-[8px] text-slate-600">{copy.longTermTrend}</div><div className={`mt-1 text-[10px] font-black ${recommendationTrend.className}`}>{recommendationTrend.icon} {recommendationTrend.label}</div></div>
              <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-2.5"><div className="text-[8px] text-slate-600">{copy.sinceLastAnalysis}</div><div className={`mt-1 text-base font-black ${latestNdviChangeClass}`}>{latestNdviChangeLabel}</div></div>
            </div>
            <div className="mt-3 text-[8px] font-black uppercase tracking-[0.18em] text-cyan-300">{copy.whatToDoNow}</div>
            <div className="mt-2 space-y-1.5">{displayedActions.slice(0, 4).map((action, index) => <div key={`decision-${index}`} className="flex gap-2 rounded-lg bg-[#071017] p-2 text-[10px] leading-4 text-slate-400"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 font-black text-cyan-300">{index + 1}</span><span>{action}</span></div>)}</div>
            <div className="mt-3 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.03] p-3 text-[9px] leading-4 text-slate-400"><span className="font-black text-cyan-300">{copy.nextStep}</span><br /><span className="text-[10px] font-bold text-slate-200">{displayedRecommendation}</span></div>
          </div>

          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-4">
            <div className="flex items-center justify-between"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">🚨 AEGRIS ALERTY</div><h2 className="mt-1 text-sm font-black">{copy.projectAlerts}</h2></div><span className="rounded-md border border-white/[0.07] px-2 py-1 text-[8px] text-slate-400">{copy.unread} {unreadAlerts}</span></div>
            <div className="mt-3 space-y-2">{alerts.slice(0, 3).map((alert, index) => <div key={alert.id} className={`rounded-lg border p-3 ${alert.level === "critical" ? "border-red-500/25 bg-red-500/[0.03]" : "border-white/[0.07] bg-[#071017]"}`}><div className="flex items-start justify-between gap-2"><div className="flex gap-2"><span className={`mt-1 h-2.5 w-2.5 rounded-full ${alert.level === "critical" ? "bg-red-500" : alert.level === "warning" ? "bg-orange-400" : "bg-cyan-400"}`} /><div><div className="text-[10px] font-black">{alert.title}{!alert.is_read && <span className="ml-1 rounded bg-cyan-300/10 px-1 text-[7px] text-cyan-300">{copy.newLabel}</span>}</div><div className="mt-1 text-[8px] text-slate-600">{new Date(alert.created_at).toLocaleString(locale)}</div></div></div><span className="rounded bg-red-500/10 px-2 py-1 text-[8px] font-black text-red-400">{alert.priority}</span></div><p className="mt-2 text-[9px] leading-4 text-slate-500">{alert.message}</p>{!alert.is_read && index === 0 && <button type="button" onClick={() => markAlertAsRead(alert.id)} className="mt-2 text-[8px] font-bold text-cyan-300 hover:text-cyan-300">✓ {copy.markAsRead}</button>}</div>)}{alerts.length === 0 && <div className="rounded-lg bg-[#071017] p-4 text-[10px] text-slate-500">{copy.noAlerts}</div>}</div>
            <button type="button" onClick={() => document.getElementById("project-history")?.scrollIntoView({ behavior: "smooth" })} className="mt-3 w-full rounded-lg border border-white/[0.07] bg-[#071017] py-2 text-[9px] font-bold text-cyan-300">{copy.showAllAlerts} ({alerts.length})</button>
          </div>

          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-3">
            <div className="flex items-center justify-between"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">♧ {copy.recommendations}</div><h2 className="mt-1 text-sm font-black">CO NYNÍ UDĚLAT</h2></div><span className={`rounded-md border px-2 py-1 text-[8px] font-black ${priorityClass} border-current/20`}>{displayedPriority}</span></div>
            <div className="mt-3 space-y-2">{displayedActions.slice(0, 5).map((action, index) => <div key={`recommend-${index}`} className="flex gap-2 rounded-lg bg-[#071017] p-2 text-[9px] leading-4 text-slate-400"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 font-black text-cyan-300">{index + 1}</span><span>{action}</span></div>)}</div>
          </div>
        </section>

        {/* 3. DIAGNOSTICS + FACTORS */}
        <section className="mt-3 grid gap-3 xl:grid-cols-12">
          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-5">
            <div className="flex items-center justify-between"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">{copy.diagnosis}</div><h2 className="mt-1 text-sm font-black">{copy.probableCauses}</h2></div><span className="rounded-md border border-red-500/20 bg-red-500/5 px-2 py-1 text-[8px] font-black text-red-400">{contextEvaluation.diagnoses.length} {copy.diagnosisShort}</span></div>
            <div className="mt-3 space-y-2">{contextEvaluation.diagnoses.slice(0, 2).map((diagnosis) => <div key={diagnosis.code} className="rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="flex items-center justify-between gap-2"><div className="text-[10px] font-black text-slate-100">{diagnosis.label}</div><div className="text-right"><div className="text-[8px] uppercase tracking-wider text-slate-600">{copy.indicationStrength}</div><div className="text-[10px] font-black text-red-400">{indicationStrengthLabel(diagnosis.confidence)}</div></div></div>{diagnosis.evidence.length > 0 && <div className="mt-2 space-y-1">{diagnosis.evidence.slice(0, 3).map((evidence, index) => <div key={`${diagnosis.code}-${index}`} className="flex gap-2 text-[8px] leading-4 text-slate-500"><span className="text-orange-400">•</span><span>{evidence}</span></div>)}</div>}</div>)}{contextEvaluation.diagnoses.length === 0 && <div className="rounded-lg bg-[#071017] p-3 text-[9px] text-slate-500">{copy.noDiagnosis}</div>}</div>
          </div>
          <div className="xl:col-span-7 rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4"><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">{copy.keyFactors}</div><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{contextEvaluation.factors.slice(0, 6).map((factor, index) => { const scoreItem = contextEvaluation.scoreBreakdown.find((item) => item.label === factor.label); return <div key={`${factor.label}-${index}`} className="rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="flex items-start justify-between gap-2"><div className="text-[9px] font-semibold leading-4 text-slate-300">{factor.label}</div><span className={`rounded-full px-2 py-1 text-[7px] font-black ${factor.status === "OK" ? "bg-emerald-500/10 text-emerald-400" : factor.status === "Upozornění" ? "bg-amber-500/10 text-amber-400" : factor.status === "Kritické" ? "bg-red-500/10 text-red-400" : "bg-slate-500/10 text-slate-400"}`}>{factor.status === "OK" ? copy.inRange : factor.status}</span></div>{scoreItem && <div className="mt-2 text-[8px] font-bold text-cyan-300">{copy.score} {scoreItem.score}/100 · {copy.weight} {scoreItem.weight}%</div>}<p className="mt-2 text-[8px] leading-4 text-slate-500">{factor.detail}</p></div>})}</div></div>
        </section>

        <AiAgronom projectId={project.id} />

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
            <div className="flex items-start justify-between gap-3"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">{copy.ndviDevelopment}</div><div className="mt-1 flex flex-wrap items-center gap-2 text-[9px]"><span className="font-bold">{copy.trend}:</span><span className={recommendationTrend.className}>{recommendationTrend.key === "rising" ? copy.trendRising : recommendationTrend.key === "falling" ? copy.trendFalling : recommendationTrend.key === "stable" ? copy.trendStableShort : recommendationTrend.label}</span><span className="text-slate-700">•</span><span className="text-slate-500">{copy.trendWindow}:</span><span className="font-bold text-slate-300">{trendWindowLabel}</span></div></div><div className={`text-right text-[9px] font-black ${recommendationTrend.className}`}>NDVI {currentNdvi?.toFixed(3) ?? "—"}<br /><span className="font-normal">{recommendationTrend.label}</span></div></div>
            <div className="mt-2 h-[290px]"><AnalysisChart history={chartHistory} /></div>
          </div>
          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-4">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">{copy.stateAndRecommendations}</div>
            <div className="mt-3 space-y-2">{recentRecommendations.map((item) => <div key={item.id} className="rounded-lg border border-white/[0.07] bg-[#071017] p-2.5"><div className="text-[8px] text-slate-600">{new Date(item.created_at).toLocaleString(locale)}</div><div className="mt-1 flex items-center justify-between gap-2"><span className="text-[9px] font-bold text-cyan-300">{item.crop_name ?? copy.crop}</span><span className="text-[8px] font-bold text-slate-300">NDVI {item.ndvi != null ? Number(item.ndvi).toFixed(3) : "—"}</span><span className={`text-[8px] font-black ${item.priority === "Kritická" ? "text-red-400" : item.priority === "Vysoká" ? "text-orange-400" : "text-emerald-400"}`}>{item.priority}</span></div></div>)}{recentRecommendations.length === 0 && <div className="rounded-lg bg-[#071017] p-3 text-[9px] text-slate-500">{copy.noRecord}</div>}</div>
            <button type="button" onClick={() => document.getElementById("project-history")?.scrollIntoView({ behavior: "smooth" })} className="mt-3 w-full rounded-lg border border-white/[0.07] py-2 text-[9px] font-bold text-cyan-300">{copy.showRecommendationHistory}</button>
            <div className="mt-4 border-t border-white/[0.07] pt-3"><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">{copy.analysisHistory}</div><div className="mt-2 space-y-1.5">{recentAnalyses.slice(0, 4).map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg bg-[#071017] px-2.5 py-2 text-[8px]"><span className="text-slate-500">{new Date(item.created_at).toLocaleDateString(locale)}</span><span className="font-bold text-cyan-300">NDVI {Number(item.ndvi).toFixed(3)}</span><span className="font-bold text-slate-300">{item.risk}</span></div>)}</div></div>
          </div>
        </section>

        {/* 5. WEATHER */}
        <section className="mt-3 rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4">
          <div className="flex items-center justify-between gap-3"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">{copy.weatherConditions}</div><h2 className="mt-1 text-sm font-black">{copy.currentLocalConditions}</h2></div><button type="button" onClick={() => loadWeather(project.id)} disabled={loadingWeather} className="rounded-lg border border-white/[0.07] px-3 py-2 text-[8px] font-bold text-slate-400 hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-50">↻ {copy.refresh}</button></div>
          {weather ? <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4"><div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="text-[8px] text-slate-500">{copy.temperature}</div><div className="mt-1 text-lg font-black text-orange-400">{weather.temperature_c != null ? `${weather.temperature_c.toFixed(1)} °C` : "—"}</div><div className={`text-[8px] ${temperatureStatusClass}`}>{temperatureStatus}</div></div><div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="text-[8px] text-slate-500">{copy.humidity}</div><div className="mt-1 text-lg font-black text-cyan-300">{weather.humidity_pct != null ? `${weather.humidity_pct.toFixed(0)} %` : "—"}</div><div className="text-[8px] text-cyan-300">{copy.current}</div></div><div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="text-[8px] text-slate-500">{copy.precipitationLastHour}</div><div className="mt-1 text-lg font-black">{weather.precipitation_mm != null ? `${weather.precipitation_mm.toFixed(1)} mm` : "—"}</div><div className="text-[8px] text-slate-500">{copy.current}</div></div><div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="text-[8px] text-slate-500">{copy.wind}</div><div className="mt-1 text-lg font-black">{weather.wind_speed_kmh != null ? `${weather.wind_speed_kmh.toFixed(1)} km/h` : "—"}</div><div className="text-[8px] text-emerald-400">{copy.current}</div></div></div> : <div className="mt-3 text-[9px] text-slate-500">{loadingWeather ? copy.loadingWeather : copy.weatherLoadFailed}</div>}
        </section>

        {/* 6. NUTRITION / FERTILIZATION */}
        <section className="mt-3 rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                {copy.nutritionTitle}
              </div>
              <h2 className="mt-1 text-sm font-black">
                {copy.nutritionMethodProfile}
              </h2>
              <p className="mt-1 max-w-3xl text-[9px] leading-4 text-slate-500">
                {copy.nutritionMethodDescription}
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
                  ? copy.nutritionProfileAvailable
                  : copy.nutritionProfileUnavailable}
              </span>
              {organizationRole !== "viewer" && (
                <button
                  type="button"
                  onClick={() => setFertilizationEditorOpen((value) => !value)}
                  className="rounded-lg border border-white/[0.08] bg-[#071017] px-3 py-2 text-[8px] font-bold text-cyan-300 hover:border-cyan-300/30"
                >
                  {fertilizationEditorOpen
                    ? copy.closeInputs
                    : copy.completeInputs}
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
              {copy.loadingNutrition}
            </div>
          ) : (
            <>
              <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-6">
                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">{copy.plannedYield}</div>
                  <div className="mt-1 text-lg font-black text-cyan-300">
                    {plannedYieldNumber != null ? `${plannedYieldNumber.toFixed(2)} t/ha` : "—"}
                  </div>
                  <div className="mt-1 text-[8px] text-slate-500">
                    {fertilizationYieldLevel === "low" ? copy.lowYield : fertilizationYieldLevel === "medium" ? copy.mediumYield : fertilizationYieldLevel === "high" ? copy.highYield : copy.neededForNutrition}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">{copy.nitrogen}</div>
                  <div className="mt-1 text-lg font-black text-emerald-400">
                    {calculatedNitrogenDose != null ? `${calculatedNitrogenDose.toFixed(0)} kg N/ha` : "—"}
                  </div>
                  <div className="mt-1 text-[8px] leading-4 text-slate-500">
                    {nitrogenRequirement ? `${copy.base} ${Number(nitrogenRequirement.dose_kg_ha).toFixed(0)} · ${copy.minimum} ${Number(nitrogenRequirement.min_dose_kg_ha ?? 0).toFixed(0)} kg N/ha` : copy.plannedYieldMissing}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">{copy.phosphorus}</div>
                  <div className="mt-1 text-lg font-black text-violet-300">
                    {calculatedPhosphorusDose != null ? `${calculatedPhosphorusDose.toFixed(0)} kg/ha` : "—"}
                  </div>
                  <div className="mt-1 text-[8px] leading-4 text-slate-500">
                    {fertilizationInputs?.soil_p_mg_kg != null ? `${fertilizationInputs.soil_p_mg_kg} mg/kg · ${supplyClassLabel(phosphorusClassification?.supply_class)} · ${fertilizationInputs.phosphorus_method ?? copy.methodNotSpecified}` : copy.missingP}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">{copy.potassium}</div>
                  <div className="mt-1 text-lg font-black text-amber-300">
                    {calculatedPotassiumDose != null ? `${calculatedPotassiumDose.toFixed(0)} kg/ha` : "—"}
                  </div>
                  <div className="mt-1 text-[8px] leading-4 text-slate-500">
                    {fertilizationInputs?.soil_k_mg_kg != null ? `${fertilizationInputs.soil_k_mg_kg} mg/kg · ${supplyClassLabel(potassiumClassification?.supply_class)}` : copy.missingK}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">{copy.magnesium}</div>
                  <div className="mt-1 text-lg font-black text-sky-300">
                    {calculatedMagnesiumDose != null ? `${calculatedMagnesiumDose.toFixed(0)} kg/ha` : "—"}
                  </div>
                  <div className="mt-1 text-[8px] leading-4 text-slate-500">
                    {fertilizationInputs?.soil_mg_mg_kg != null ? `${fertilizationInputs.soil_mg_mg_kg} mg/kg · ${supplyClassLabel(magnesiumClassification?.supply_class)}` : copy.missingMg}
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                  <div className="text-[8px] uppercase tracking-widest text-slate-600">{copy.methodologySource}</div>
                  <div className="mt-1 text-[10px] font-black text-slate-200">ÚKZÚZ · 6. vydání · 2020</div>
                  <div className="mt-1 text-[8px] leading-4 text-slate-500">Tab. 6, 15–17 a metodická korekce K:Mg.</div>
                </div>
              </div>

              {hasSoilLaboratoryInputs && (
                <div className="mt-2 grid gap-2 lg:grid-cols-2">
                  <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                    <div className="text-[8px] font-black uppercase tracking-widest text-cyan-300">{copy.soilSupplyClassification}</div>
                    <div className="mt-2 text-[8px] leading-4 text-slate-500">
                      P: <span className="font-bold text-slate-300">{supplyClassLabel(phosphorusClassification?.supply_class)}</span> · K: <span className="font-bold text-slate-300">{supplyClassLabel(potassiumClassification?.supply_class)}</span> · Mg: <span className="font-bold text-slate-300">{supplyClassLabel(magnesiumClassification?.supply_class)}</span>
                    </div>
                    <div className="mt-1 text-[8px] text-slate-600">
                      {copy.soilTexture}: {fertilizationInputs?.soil_texture_class === "light" ? (language === "cs" ? "lehká" : "light") : fertilizationInputs?.soil_texture_class === "medium" ? (language === "cs" ? "střední" : "medium") : fertilizationInputs?.soil_texture_class === "heavy" ? (language === "cs" ? "těžká" : "heavy") : copy.notSpecifiedMasculine}. {copy.phosphorusMethod}: {fertilizationInputs?.phosphorus_method ?? copy.notSpecifiedFeminine}.
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                    <div className="text-[8px] font-black uppercase tracking-widest text-cyan-300">{copy.kmgRatio}</div>
                    <div className="mt-1 text-lg font-black text-slate-200">
                      {potassiumMagnesiumRatio != null ? potassiumMagnesiumRatio.toFixed(2) : "—"}
                    </div>
                    <div className="mt-1 text-[8px] leading-4 text-slate-500">
                      {potassiumMagnesiumCorrection ? `${potassiumMagnesiumCorrection.description} ${copy.kCoefficient} ${Number(potassiumMagnesiumCorrection.correction_factor).toFixed(2)}.` : copy.kmgNeedBoth}
                    </div>
                  </div>
                </div>
              )}
              {nitrogenRequirement && (
                <div className="mt-2 grid gap-2 lg:grid-cols-3">
                  <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3">
                    <div className="text-[8px] font-black uppercase tracking-widest text-cyan-300">
                      {copy.nitrogenCorrection}
                    </div>
                    <div className="mt-2 space-y-1 text-[8px] leading-4 text-slate-500">
                      <div>
                        {copy.predecessor}: {predecessorAdjustment
                          ? `${Number(
                              predecessorAdjustment.adjustment_kg_n_ha
                            ).toFixed(0)} kg N/ha`
                          : copy.noAppliedCorrection}
                      </div>
                      <div>
                        {copy.organicFertilization}: {organicNitrogenCredit != null
                          ? `−${organicNitrogenCredit.toFixed(1)} kg N/ha`
                          : copy.noAppliedDeduction}
                      </div>
                      <div>
                        Nmin: {fertilizationInputs?.nmin_kg_ha != null
                          ? `${fertilizationInputs.nmin_kg_ha} kg/ha – ${copy.nminStoredNote}`
                          : copy.notSpecifiedMasculine}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3 lg:col-span-2">
                    <div className="text-[8px] font-black uppercase tracking-widest text-cyan-300">
                      {copy.frameworkNitrogenSplit}
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
                                : copy.doseCannotCalculate}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 text-[8px] text-slate-500">
                        {copy.noNitrogenSplit}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!plannedYieldNumber && nutritionProfileAvailable && (
                <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3 text-[9px] leading-4 text-amber-200">
                  {copy.addYieldForNitrogen}
                </div>
              )}
            </>
          )}

          {organizationRole !== "viewer" && fertilizationEditorOpen && (
            <div className="mt-3 rounded-xl border border-cyan-400/15 bg-[#071017] p-4">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
                {copy.nutritionInputs}
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="text-[9px] text-slate-500">
                  {copy.plannedYieldUnit}
                  <input type="number" step="0.01" value={plannedYield} onChange={(event) => setPlannedYield(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500">
                  {copy.soilTextureForKMg}
                  <select value={soilTextureClass} onChange={(event) => setSoilTextureClass(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white">
                    <option value="">{copy.select}</option>
                    <option value="light">{copy.lightSoil}</option>
                    <option value="medium">{copy.mediumSoil}</option>
                    <option value="heavy">{copy.heavySoil}</option>
                  </select>
                </label>
                <label className="text-[9px] text-slate-500">
                  {copy.phosphorusDetermination}
                  <select value={phosphorusMethod} onChange={(event) => setPhosphorusMethod(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white">
                    <option value="">{copy.select}</option>
                    <option value="SP">SP</option>
                    <option value="ICP-OES">ICP-OES</option>
                  </select>
                </label>
                <label className="text-[9px] text-slate-500">
                  {copy.soilP}
                  <input type="number" step="0.01" value={soilP} onChange={(event) => setSoilP(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500">
                  {copy.soilK}
                  <input type="number" step="0.01" value={soilK} onChange={(event) => setSoilK(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500">
                  {copy.soilMg}
                  <input type="number" step="0.01" value={soilMg} onChange={(event) => setSoilMg(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500">
                  {copy.soilPH}
                  <input type="number" step="0.01" value={fertilizationSoilPh} onChange={(event) => setFertilizationSoilPh(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500">
                  Předplodina
                  <input value={predecessorCropName} onChange={(event) => setPredecessorCropName(event.target.value)} placeholder={copy.predecessorExample} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500">
                  {copy.predecessorGroup}
                  <select value={predecessorGroup} onChange={(event) => setPredecessorGroup(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white">
                    <option value="">{copy.noCorrectionOther}</option>
                    <option value="jeteloviny">{copy.clovers}</option>
                    <option value="luskoviny">{copy.legumes}</option>
                  </select>
                </label>
                <label className="text-[9px] text-slate-500">
                  Nmin (kg/ha)
                  <input type="number" step="0.01" value={nmin} onChange={(event) => setNmin(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500">
                  {copy.organicFertilizer}
                  <select value={organicFertilizerType} onChange={(event) => { setOrganicFertilizerType(event.target.value); if (event.target.value !== "kejda") setOrganicLivestockType(""); }} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white">
                    <option value="">{copy.noDeduction}</option>
                    <option value="hnůj">{copy.manure}</option>
                    <option value="močůvka">{copy.slurry}</option>
                    <option value="kejda">{copy.liquidManure}</option>
                  </select>
                </label>
                <label className="text-[9px] text-slate-500">
                  {copy.slurryType}
                  <select disabled={organicFertilizerType !== "kejda"} value={organicLivestockType} onChange={(event) => setOrganicLivestockType(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white disabled:opacity-40">
                    <option value="">{copy.select}</option>
                    <option value="skot">{copy.cattle}</option>
                    <option value="prasata">{copy.pigs}</option>
                    <option value="drůbež">{copy.poultry}</option>
                  </select>
                </label>
                <label className="text-[9px] text-slate-500">
                  {copy.organicRate}
                  <input type="number" step="0.01" value={organicRate} onChange={(event) => setOrganicRate(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500">
                  {copy.applicationPeriod}
                  <select value={organicApplicationWindow} onChange={(event) => setOrganicApplicationWindow(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white">
                    <option value="">{copy.select}</option>
                    <option value="VIII-IX">VIII–IX</option>
                    <option value="X-II">X–II</option>
                    <option value="III-VII">III–VII</option>
                  </select>
                </label>
                <label className="text-[9px] text-slate-500">
                  {copy.organicNYear}
                  <select value={organicYearAfterApplication} onChange={(event) => setOrganicYearAfterApplication(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white">
                    <option value="">{copy.select}</option>
                    <option value="1">{copy.firstYear}</option>
                    <option value="2">{copy.secondYear}</option>
                  </select>
                </label>
                <label className="text-[9px] text-slate-500 xl:col-span-2">
                  {copy.dataSource}
                  <input value={fertilizationDataSource} onChange={(event) => setFertilizationDataSource(event.target.value)} placeholder={copy.dataSourcePlaceholder} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
                <label className="text-[9px] text-slate-500 xl:col-span-2">
                  {copy.note}
                  <input value={fertilizationNotes} onChange={(event) => setFertilizationNotes(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#050b10] px-3 py-2 text-xs text-white" />
                </label>
              </div>
              <div className="mt-3 flex justify-end">
                <button type="button" onClick={saveFertilizationInputs} disabled={savingFertilization} className="rounded-lg bg-cyan-300 px-5 py-2.5 text-[9px] font-black text-slate-950 hover:bg-cyan-200 disabled:opacity-50">
                  {savingFertilization ? copy.saving : copy.saveNutritionInputs}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 7. PROJECT DATA */}
        <section className="mt-3 grid gap-3 xl:grid-cols-12">
          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-4">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">{copy.projectDetails}</div>
            <div className="mt-3 space-y-1.5 text-[9px]">{[[copy.crop, project.crop_name ?? "—"],[copy.variety, project.crop_variety ?? "—"],[copy.area, project.area_ha != null ? `${project.area_ha} ha` : "—"],[copy.growthStage, project.growth_stage ?? "—"],[copy.sowingDate, project.sowing_date ? new Date(project.sowing_date).toLocaleDateString(locale) : "—"],[copy.expectedHarvest, project.expected_harvest_date ? new Date(project.expected_harvest_date).toLocaleDateString(locale) : "—"],[copy.farmingMethod, project.farming_method ?? "—"]].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 border-b border-white/[0.07]/70 py-2"><span className="text-slate-500">{label}</span><span className="text-right font-semibold text-slate-200">{value}</span></div>)}</div>
            {organizationRole !== "viewer" && (
              <button type="button" onClick={openCropEditor} className="mt-3 w-full rounded-lg bg-cyan-300 py-2 text-[9px] font-black text-slate-950 hover:bg-cyan-200">{copy.editCropData}</button>
            )}
          </div>

          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-4">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">{copy.cropProfile}</div>
            <h2 className="mt-1 text-base font-black">{selectedCropProfile?.name ?? project.crop_name ?? "—"}</h2>
            <div className="text-[8px] text-slate-600">{selectedCropProfile?.category ?? copy.profileNotEvaluated}</div>
            <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-lg bg-white/[0.035] p-2.5"><div className="text-[8px] text-slate-500">🌡️ {copy.temperature}</div><div className="mt-1 text-[10px] font-bold">{selectedCropProfile?.min_temperature_c != null && selectedCropProfile?.max_temperature_c != null ? `${selectedCropProfile.min_temperature_c}–${selectedCropProfile.max_temperature_c} °C` : copy.notSpecified}</div></div><div className="rounded-lg bg-white/[0.035] p-2.5"><div className="text-[8px] text-slate-500">💧 {copy.moisture}</div><div className="mt-1 text-[10px] font-bold">{selectedCropProfile?.soil_moisture_min_pct != null && selectedCropProfile?.soil_moisture_max_pct != null ? `${selectedCropProfile.soil_moisture_min_pct}–${selectedCropProfile.soil_moisture_max_pct} %` : copy.notSpecified}</div></div><div className="rounded-lg bg-white/[0.035] p-2.5"><div className="text-[8px] text-slate-500">{copy.soilPH}</div><div className="mt-1 text-[10px] font-bold">{selectedCropProfile?.ph_min != null && selectedCropProfile?.ph_max != null ? `${selectedCropProfile.ph_min}–${selectedCropProfile.ph_max}` : copy.notSpecified}</div></div><div className="rounded-lg bg-white/[0.035] p-2.5"><div className="text-[8px] text-slate-500">💦 {copy.waterNeed}</div><div className="mt-1 text-[10px] font-bold">{selectedCropProfile?.water_need ?? "Neuvedeno"}</div></div></div>
            {selectedCropStageProfile && <div className="mt-2 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.03] p-2.5 text-[8px] text-slate-400">{copy.stage}: <span className="font-bold text-slate-200">{selectedCropStageProfile.growth_stage}</span> · Kc <span className="font-bold text-slate-200">{selectedCropStageProfile.kc != null ? Number(selectedCropStageProfile.kc).toFixed(2) : "—"}</span> · {copy.waterStress} <span className="font-bold text-slate-200">{selectedCropStageProfile.water_stress_sensitivity ?? "Neuvedeno"}</span></div>}
          </div>

          <div className="rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4 xl:col-span-4"><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">{copy.projectLocation}</div><div className="mt-3 overflow-hidden rounded-lg border border-white/[0.07]"><ProjectMap latitude={project.latitude} longitude={project.longitude} /></div><div className="mt-2 grid grid-cols-2 gap-2"><div className="rounded-lg bg-white/[0.035] p-2.5"><div className="text-[8px] text-slate-500">{copy.latitude}</div><div className="mt-1 text-[9px] font-bold">{project.latitude.toFixed(6)}</div></div><div className="rounded-lg bg-white/[0.035] p-2.5"><div className="text-[8px] text-slate-500">{copy.longitude}</div><div className="mt-1 text-[9px] font-bold">{project.longitude.toFixed(6)}</div></div></div></div>
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
            <summary className="cursor-pointer list-none text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">{copy.cropDataEditing}</summary>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <label className="text-[9px] text-slate-500">
                {copy.cultivatedCrop}
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
                      ? `${copy.originalValue}: ${cropName}`
                      : copy.selectCropUkzuz}
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
                      {copy.noAgronomicProfile}
                    </span>
                  )}
              </label>
              <label className="text-[9px] text-slate-500">
                {copy.variety}
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
                          ? copy.loadingVarieties
                          : varietyCatalog.length > 0
                            ? copy.selectVarietyUkzuz
                            : copy.noActiveVarieties}
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
              <label className="text-[9px] text-slate-500">{copy.areaHa}<input type="number" value={areaHa} onChange={(event) => { setAreaHa(event.target.value); setAreaError(""); }} className={`mt-1 w-full rounded-lg border bg-[#071017] px-3 py-2 text-xs text-white ${areaError ? "border-red-500" : "border-white/[0.10]"}`} />{areaError && <span className="mt-1 block text-red-400">{areaError}</span>}</label>
              <label className="text-[9px] text-slate-500">{copy.farmingMethodLabel}<select value={farmingMethod} onChange={(event) => setFarmingMethod(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#071017] px-3 py-2 text-xs text-white"><option value="">{copy.select}</option><option value="Konvenční">{copy.conventional}</option><option value="Integrované">{copy.integrated}</option><option value="Ekologické">{copy.organic}</option><option value="Jiné">{copy.other}</option></select></label>
              <label className="text-[9px] text-slate-500">{copy.sowingPlantingDate}<input type="date" value={sowingDate} onChange={(event) => setSowingDate(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#071017] px-3 py-2 text-xs text-white" /></label>
              <label className="text-[9px] text-slate-500">{copy.expectedHarvestDate}<input type="date" value={expectedHarvestDate} onChange={(event) => setExpectedHarvestDate(event.target.value)} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#071017] px-3 py-2 text-xs text-white" /></label>
              <label className="text-[9px] text-slate-500">{copy.currentGrowthStage}<select value={growthStage} onChange={(event) => setGrowthStage(event.target.value)} disabled={!selectedCropProfile} className="mt-1 w-full rounded-lg border border-white/[0.10] bg-[#071017] px-3 py-2 text-xs text-white disabled:opacity-50"><option value="">{copy.selectGrowthStage}</option>{growthStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}</select></label>
              <div className="flex items-end"><button type="button" onClick={saveCropData} disabled={savingCrop} className="w-full rounded-lg bg-cyan-300 py-2.5 text-xs font-black text-slate-950 hover:bg-cyan-200 disabled:opacity-50">{savingCrop ? copy.saving : copy.saveCropData}</button></div>
            </div>
          </details>
        </section>
        )}

        {/* 8. PROJECT TIMELINE — no duplicate chart */}
        <section id="project-history" className="mt-3 rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4">
          <div className="flex items-center justify-between gap-3"><div><div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">{copy.projectDevelopment}</div><h2 className="mt-1 text-base font-black">{copy.eventHistory}</h2></div><span className={`text-[9px] font-black ${recommendationTrend.className}`}>{recommendationTrend.icon} {recommendationTrend.label}</span></div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {recentAnalyses.map((item) => <div key={`timeline-analysis-${item.id}`} className="relative rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="flex items-center justify-between gap-2"><span className="text-[8px] text-slate-600">{new Date(item.created_at).toLocaleString(locale)}</span><span className="rounded-full bg-cyan-300/10 px-2 py-1 text-[7px] font-black text-cyan-300">{copy.analysisLabel}</span></div><div className="mt-2 text-[10px] font-bold text-slate-200">{copy.analysisCompleted}</div><div className="mt-1 text-[8px] text-slate-500">NDVI {Number(item.ndvi).toFixed(3)} · {item.risk}</div></div>)}
            {recentRecommendations.slice(0, 2).map((item) => <div key={`timeline-rec-${item.id}`} className="relative rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="flex items-center justify-between gap-2"><span className="text-[8px] text-slate-600">{new Date(item.created_at).toLocaleString(locale)}</span><span className="rounded-full bg-orange-500/10 px-2 py-1 text-[7px] font-black text-orange-400">{copy.recommendationLabel}</span></div><div className="mt-2 text-[10px] font-bold text-slate-200">{copy.recommendationCreated}</div><div className="mt-1 text-[8px] text-slate-500">{copy.priority} {item.priority} · NDVI {item.ndvi != null ? Number(item.ndvi).toFixed(3) : "—"}</div></div>)}
            {recentAnalyses.length === 0 && recentRecommendations.length === 0 && <div className="rounded-lg bg-[#071017] p-4 text-[9px] text-slate-500 md:col-span-2 xl:col-span-4">{copy.noHistoricalEvents}</div>}
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2"><button type="button" onClick={() => document.getElementById("project-history")?.scrollIntoView({ behavior: "smooth" })} className="rounded-lg border border-white/[0.07] py-2 text-[9px] font-bold text-cyan-300">{copy.showCompleteProjectHistory}</button>{organizationRole !== "viewer" ? (
            <button type="button" onClick={openCropEditor} className="rounded-lg border border-white/[0.07] py-2 text-[9px] font-bold text-slate-400 hover:text-cyan-300">{copy.editProjectData}</button>
          ) : (
            <div className="rounded-lg border border-white/[0.07] py-2 text-center text-[9px] font-bold text-slate-600">{copy.readOnly}</div>
          )}</div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2"><div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="text-[9px] font-black uppercase tracking-widest text-cyan-300">{copy.recommendationHistory}</div><div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto">{recommendationHistory.map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded-md bg-[#050b10] px-2.5 py-2 text-[8px]"><span className="text-slate-500">{new Date(item.created_at).toLocaleDateString(locale)}</span><span className="text-cyan-300">NDVI {item.ndvi != null ? Number(item.ndvi).toFixed(3) : "—"}</span><span className="font-bold text-slate-300">{item.priority}</span></div>)}</div></div><div className="rounded-lg border border-white/[0.07] bg-[#071017] p-3"><div className="text-[9px] font-black uppercase tracking-widest text-cyan-300">{copy.analysisHistory}</div><div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto">{history.map((item) => <div key={item.id} className="flex items-center justify-between gap-2 rounded-md bg-[#050b10] px-2.5 py-2 text-[8px]"><span className="text-slate-500">{new Date(item.created_at).toLocaleDateString(locale)}</span><span className="font-bold text-cyan-300">NDVI {Number(item.ndvi).toFixed(3)}</span><span className="font-bold text-slate-300">{item.risk}</span></div>)}</div></div></div>
        </section>
      </div>
    </main>
  );
}