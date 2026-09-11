"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useLanguage } from "../../context/LanguageContext";

type Project = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  crop_name?: string | null;
  crop_variety?: string | null;
  area_ha?: number | null;
  growth_stage?: string | null;
  sowing_date?: string | null;
  expected_harvest_date?: string | null;
  farming_method?: string | null;
};

type Analysis = {
  id: number;
  project_id: number;
  ndvi: number;
  risk: string;
  created_at: string;
  period_from?: string | null;
  period_to?: string | null;
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

type WeatherData = {
  temperature_c?: number | null;
  humidity_pct?: number | null;
  precipitation_mm?: number | null;
  wind_speed_kmh?: number | null;
  soil_moisture_pct?: number | null;
  precipitation_probability_pct?: number | null;
  next24h_precipitation_mm?: number | null;
  next24h_min_temperature_c?: number | null;
  next24h_max_temperature_c?: number | null;
  evapotranspiration_mm?: number | null;
  fetched_at?: string | null;
};

type Recommendation = {
  id: number;
  project_id: number;
  analysis_id: number | null;
  crop_name: string | null;
  growth_stage: string | null;
  ndvi: number | null;
  level: string;
  priority: string;
  score: number | null;
  summary: string;
  recommendation: string;
  actions: string[];
  weather_snapshot: WeatherData | null;
  created_at: string;
};

type HistoryItem = {
  period_from: string;
  period_to: string;
  ndvi: number;
  created_at: string;
};


function getReportCopy(language: string) {
  const en = {
    unavailable: "The project does not exist or you do not have permission to view it.",
    noAnalysis: "The project does not yet have an analysis for generating a report.",
    loading: "Loading report...",
    accessDenied: "Access denied",
    noAccess: "You do not have access to this project",
    backReports: "Back to reports",
    cannotCreate: "Report cannot be created",
    missingData: "Required data is missing.",
    registry: "← Report Registry",
    fieldRecord: "Field Health Record",
    printPdf: "Print / Save as PDF",
    reportTitle: "AEGRIS / Analytical Field Report",
    cropUnknown: "Crop not specified",
    analysis: "Analysis",
    projectId: "Project ID",
    decisionState: "Decision status",
    score: "AEGRIS score",
    risk: "Risk",
    priority: "Priority",
    evaluation: "AEGRIS evaluation",
    noSummary: "No saved summary.",
    noRecommendation: "No recommendation is saved for this analysis.",
    dataReliability: "Data reliability",
    source: "Source",
    resolution: "Resolution",
    validPixels: "Valid pixels",
    validCoverage: "Valid coverage",
    qualityGate: "Quality gate min.",
    acceptedIntervals: "Accepted intervals",
    rejectedIntervals: "Rejected intervals",
    medianNdvi: "Median NDVI",
    weatherSnapshot: "Analysis weather snapshot",
    temperature: "Temperature",
    humidity: "Humidity",
    precipitationLastHour: "Precipitation – last hour",
    wind: "Wind",
    noWeather: "No weather snapshot is stored for this historical analysis.",
    ndviTrend: "NDVI development",
    intervalFrom: "Interval from",
    intervalTo: "Interval to",
    noHistory: "NDVI history is not available.",
    fieldContext: "Field context",
    crop: "Crop",
    variety: "Variety",
    area: "Area",
    growthStage: "Growth stage",
    locationPeriod: "Location and period",
    latitude: "Latitude",
    longitude: "Longitude",
    lastSentinel: "Latest Sentinel interval",
    disclaimer:
      "AEGRIS is a decision-support system. Satellite and meteorological data are source/calculated data; the AEGRIS score, risk, diagnostics and recommendations are model evaluations and do not replace professional field inspection.",
    generated: "Report generated",
  };

  const cs = {
    ...en,
    unavailable: "Projekt neexistuje nebo nemáte oprávnění k jeho zobrazení.",
    noAnalysis: "Projekt zatím nemá analýzu pro vytvoření reportu.",
    loading: "Načítám report...",
    accessDenied: "Přístup zamítnut",
    noAccess: "K tomuto projektu nemáte přístup",
    backReports: "Zpět na reporty",
    cannotCreate: "Report nelze vytvořit",
    missingData: "Chybí potřebná data.",
    printPdf: "Tisk / Uložit jako PDF",
    cropUnknown: "Plodina neuvedena",
    analysis: "Analýza",
    projectId: "Projekt ID",
    decisionState: "Rozhodovací stav",
    score: "AEGRIS skóre",
    risk: "Riziko",
    priority: "Priorita",
    evaluation: "Vyhodnocení AEGRIS",
    noSummary: "Bez uloženého shrnutí.",
    noRecommendation: "Pro tuto analýzu není uložené doporučení.",
    dataReliability: "Datová důvěryhodnost",
    source: "Zdroj",
    resolution: "Rozlišení",
    validPixels: "Validní pixely",
    validCoverage: "Validní pokrytí",
    qualityGate: "Quality gate min.",
    acceptedIntervals: "Přijaté intervaly",
    rejectedIntervals: "Odmítnuté intervaly",
    medianNdvi: "Medián NDVI",
    weatherSnapshot: "Meteorologický snapshot analýzy",
    temperature: "Teplota",
    humidity: "Vlhkost",
    precipitationLastHour: "Srážky – poslední hodina",
    wind: "Vítr",
    noWeather: "U této historické analýzy není uložen meteorologický snapshot.",
    ndviTrend: "Vývoj NDVI",
    intervalFrom: "Interval od",
    intervalTo: "Interval do",
    noHistory: "Historie NDVI není k dispozici.",
    fieldContext: "Kontext pozemku",
    crop: "Plodina",
    variety: "Odrůda",
    area: "Výměra",
    growthStage: "Růstová fáze",
    locationPeriod: "Lokalita a období",
    latitude: "Šířka",
    longitude: "Délka",
    lastSentinel: "Poslední Sentinel interval",
    disclaimer:
      "AEGRIS je rozhodovací podpůrný systém. Satelitní a meteorologická data jsou zdrojová/vypočtená data; AEGRIS skóre, riziko, diagnostika a doporučení jsou modelové vyhodnocení a nenahrazují odbornou terénní kontrolu.",
    generated: "Report vygenerován",
  };

  const sk = {
    unavailable: "Projekt neexistuje alebo nemáte oprávnenie na jeho zobrazenie.",
    noAnalysis: "Projekt zatiaľ nemá analýzu na vytvorenie reportu.",
    loading: "Načítavam report...",
    accessDenied: "Prístup zamietnutý",
    noAccess: "K tomuto projektu nemáte prístup",
    backReports: "Späť na reporty",
    cannotCreate: "Report nie je možné vytvoriť",
    missingData: "Chýbajú potrebné údaje.",
    registry: "← Register reportov",
    fieldRecord: "Záznam stavu poľa",
    printPdf: "Tlačiť / Uložiť ako PDF",
    reportTitle: "AEGRIS / Analytický report poľa",
    cropUnknown: "Plodina neuvedená",
    analysis: "Analýza",
    projectId: "ID projektu",
    decisionState: "Rozhodovací stav",
    score: "AEGRIS skóre",
    risk: "Riziko",
    priority: "Priorita",
    evaluation: "Vyhodnotenie AEGRIS",
    noSummary: "Bez uloženého zhrnutia.",
    noRecommendation: "Pre túto analýzu nie je uložené odporúčanie.",
    dataReliability: "Dôveryhodnosť údajov",
    source: "Zdroj",
    resolution: "Rozlíšenie",
    validPixels: "Platné pixely",
    validCoverage: "Platné pokrytie",
    qualityGate: "Min. quality gate",
    acceptedIntervals: "Prijaté intervaly",
    rejectedIntervals: "Odmietnuté intervaly",
    medianNdvi: "Medián NDVI",
    weatherSnapshot: "Meteorologický snapshot analýzy",
    temperature: "Teplota",
    humidity: "Vlhkosť",
    precipitationLastHour: "Zrážky – posledná hodina",
    wind: "Vietor",
    noWeather: "Pre túto historickú analýzu nie je uložený meteorologický snapshot.",
    ndviTrend: "Vývoj NDVI",
    intervalFrom: "Interval od",
    intervalTo: "Interval do",
    noHistory: "História NDVI nie je dostupná.",
    fieldContext: "Kontext poľa",
    crop: "Plodina",
    variety: "Odroda",
    area: "Výmera",
    growthStage: "Rastová fáza",
    locationPeriod: "Lokalita a obdobie",
    latitude: "Zemepisná šírka",
    longitude: "Zemepisná dĺžka",
    lastSentinel: "Posledný interval Sentinel",
    disclaimer: "AEGRIS je systém na podporu rozhodovania. Satelitné a meteorologické údaje sú zdrojové/vypočítané údaje; skóre AEGRIS, riziko, diagnostika a odporúčania sú modelové vyhodnotenia a nenahrádzajú odbornú kontrolu v teréne.",
    generated: "Report vygenerovaný",
  };

  const de = {
    unavailable: "Das Projekt existiert nicht oder Sie haben keine Berechtigung, es anzuzeigen.",
    noAnalysis: "Für das Projekt liegt noch keine Analyse zur Berichterstellung vor.",
    loading: "Bericht wird geladen...",
    accessDenied: "Zugriff verweigert",
    noAccess: "Sie haben keinen Zugriff auf dieses Projekt",
    backReports: "Zurück zu Berichten",
    cannotCreate: "Bericht kann nicht erstellt werden",
    missingData: "Erforderliche Daten fehlen.",
    registry: "← Berichtsregister",
    fieldRecord: "Feldzustandsbericht",
    printPdf: "Drucken / Als PDF speichern",
    reportTitle: "AEGRIS / Analytischer Feldbericht",
    cropUnknown: "Kultur nicht angegeben",
    analysis: "Analyse",
    projectId: "Projekt-ID",
    decisionState: "Entscheidungsstatus",
    score: "AEGRIS-Score",
    risk: "Risiko",
    priority: "Priorität",
    evaluation: "AEGRIS-Bewertung",
    noSummary: "Keine gespeicherte Zusammenfassung.",
    noRecommendation: "Für diese Analyse ist keine Empfehlung gespeichert.",
    dataReliability: "Datenzuverlässigkeit",
    source: "Quelle",
    resolution: "Auflösung",
    validPixels: "Gültige Pixel",
    validCoverage: "Gültige Abdeckung",
    qualityGate: "Quality Gate min.",
    acceptedIntervals: "Akzeptierte Intervalle",
    rejectedIntervals: "Abgelehnte Intervalle",
    medianNdvi: "Median-NDVI",
    weatherSnapshot: "Wetter-Snapshot der Analyse",
    temperature: "Temperatur",
    humidity: "Luftfeuchtigkeit",
    precipitationLastHour: "Niederschlag – letzte Stunde",
    wind: "Wind",
    noWeather: "Für diese historische Analyse ist kein Wetter-Snapshot gespeichert.",
    ndviTrend: "NDVI-Entwicklung",
    intervalFrom: "Intervall von",
    intervalTo: "Intervall bis",
    noHistory: "NDVI-Verlauf ist nicht verfügbar.",
    fieldContext: "Feldkontext",
    crop: "Kultur",
    variety: "Sorte",
    area: "Fläche",
    growthStage: "Wachstumsstadium",
    locationPeriod: "Standort und Zeitraum",
    latitude: "Breitengrad",
    longitude: "Längengrad",
    lastSentinel: "Letztes Sentinel-Intervall",
    disclaimer: "AEGRIS ist ein Entscheidungsunterstützungssystem. Satelliten- und Wetterdaten sind Quell-/Berechnungsdaten; AEGRIS-Score, Risiko, Diagnose und Empfehlungen sind modellbasierte Bewertungen und ersetzen keine fachliche Feldkontrolle.",
    generated: "Bericht erstellt",
  };

  const pl = {
    unavailable: "Projekt nie istnieje lub nie masz uprawnień do jego wyświetlenia.",
    noAnalysis: "Projekt nie ma jeszcze analizy potrzebnej do utworzenia raportu.",
    loading: "Ładowanie raportu...",
    accessDenied: "Odmowa dostępu",
    noAccess: "Nie masz dostępu do tego projektu",
    backReports: "Wróć do raportów",
    cannotCreate: "Nie można utworzyć raportu",
    missingData: "Brakuje wymaganych danych.",
    registry: "← Rejestr raportów",
    fieldRecord: "Karta stanu pola",
    printPdf: "Drukuj / Zapisz jako PDF",
    reportTitle: "AEGRIS / Analityczny raport pola",
    cropUnknown: "Nie podano uprawy",
    analysis: "Analiza",
    projectId: "ID projektu",
    decisionState: "Status decyzji",
    score: "Wynik AEGRIS",
    risk: "Ryzyko",
    priority: "Priorytet",
    evaluation: "Ocena AEGRIS",
    noSummary: "Brak zapisanego podsumowania.",
    noRecommendation: "Dla tej analizy nie zapisano rekomendacji.",
    dataReliability: "Wiarygodność danych",
    source: "Źródło",
    resolution: "Rozdzielczość",
    validPixels: "Prawidłowe piksele",
    validCoverage: "Prawidłowe pokrycie",
    qualityGate: "Min. quality gate",
    acceptedIntervals: "Zaakceptowane przedziały",
    rejectedIntervals: "Odrzucone przedziały",
    medianNdvi: "Mediana NDVI",
    weatherSnapshot: "Migawka pogodowa analizy",
    temperature: "Temperatura",
    humidity: "Wilgotność",
    precipitationLastHour: "Opady – ostatnia godzina",
    wind: "Wiatr",
    noWeather: "Dla tej historycznej analizy nie zapisano migawki pogodowej.",
    ndviTrend: "Rozwój NDVI",
    intervalFrom: "Przedział od",
    intervalTo: "Przedział do",
    noHistory: "Historia NDVI jest niedostępna.",
    fieldContext: "Kontekst pola",
    crop: "Uprawa",
    variety: "Odmiana",
    area: "Powierzchnia",
    growthStage: "Faza wzrostu",
    locationPeriod: "Lokalizacja i okres",
    latitude: "Szerokość geograficzna",
    longitude: "Długość geograficzna",
    lastSentinel: "Ostatni przedział Sentinel",
    disclaimer: "AEGRIS jest systemem wspomagania decyzji. Dane satelitarne i meteorologiczne są danymi źródłowymi/obliczonymi; wynik AEGRIS, ryzyko, diagnostyka i rekomendacje są ocenami modelowymi i nie zastępują profesjonalnej kontroli polowej.",
    generated: "Raport wygenerowano",
  };

  const fr = {
    unavailable: "Le projet n’existe pas ou vous n’êtes pas autorisé à le consulter.",
    noAnalysis: "Le projet ne dispose pas encore d’une analyse permettant de générer un rapport.",
    loading: "Chargement du rapport...",
    accessDenied: "Accès refusé",
    noAccess: "Vous n’avez pas accès à ce projet",
    backReports: "Retour aux rapports",
    cannotCreate: "Impossible de créer le rapport",
    missingData: "Des données requises sont manquantes.",
    registry: "← Registre des rapports",
    fieldRecord: "Fiche d’état de la parcelle",
    printPdf: "Imprimer / Enregistrer en PDF",
    reportTitle: "AEGRIS / Rapport analytique de parcelle",
    cropUnknown: "Culture non renseignée",
    analysis: "Analyse",
    projectId: "ID du projet",
    decisionState: "État de décision",
    score: "Score AEGRIS",
    risk: "Risque",
    priority: "Priorité",
    evaluation: "Évaluation AEGRIS",
    noSummary: "Aucun résumé enregistré.",
    noRecommendation: "Aucune recommandation n’est enregistrée pour cette analyse.",
    dataReliability: "Fiabilité des données",
    source: "Source",
    resolution: "Résolution",
    validPixels: "Pixels valides",
    validCoverage: "Couverture valide",
    qualityGate: "Quality gate min.",
    acceptedIntervals: "Intervalles acceptés",
    rejectedIntervals: "Intervalles rejetés",
    medianNdvi: "NDVI médian",
    weatherSnapshot: "Instantané météo de l’analyse",
    temperature: "Température",
    humidity: "Humidité",
    precipitationLastHour: "Précipitations – dernière heure",
    wind: "Vent",
    noWeather: "Aucun instantané météo n’est enregistré pour cette analyse historique.",
    ndviTrend: "Évolution du NDVI",
    intervalFrom: "Intervalle du",
    intervalTo: "Intervalle au",
    noHistory: "L’historique NDVI n’est pas disponible.",
    fieldContext: "Contexte de la parcelle",
    crop: "Culture",
    variety: "Variété",
    area: "Surface",
    growthStage: "Stade de croissance",
    locationPeriod: "Localisation et période",
    latitude: "Latitude",
    longitude: "Longitude",
    lastSentinel: "Dernier intervalle Sentinel",
    disclaimer: "AEGRIS est un système d’aide à la décision. Les données satellitaires et météorologiques sont des données sources/calculées ; le score AEGRIS, le risque, le diagnostic et les recommandations sont des évaluations de modèle et ne remplacent pas une inspection professionnelle sur le terrain.",
    generated: "Rapport généré",
  };

  const es = {
    unavailable: "El proyecto no existe o no tiene permiso para verlo.",
    noAnalysis: "El proyecto aún no tiene un análisis para generar un informe.",
    loading: "Cargando informe...",
    accessDenied: "Acceso denegado",
    noAccess: "No tiene acceso a este proyecto",
    backReports: "Volver a informes",
    cannotCreate: "No se puede crear el informe",
    missingData: "Faltan datos necesarios.",
    registry: "← Registro de informes",
    fieldRecord: "Ficha de estado del campo",
    printPdf: "Imprimir / Guardar como PDF",
    reportTitle: "AEGRIS / Informe analítico de campo",
    cropUnknown: "Cultivo no especificado",
    analysis: "Análisis",
    projectId: "ID del proyecto",
    decisionState: "Estado de decisión",
    score: "Puntuación AEGRIS",
    risk: "Riesgo",
    priority: "Prioridad",
    evaluation: "Evaluación AEGRIS",
    noSummary: "No hay resumen guardado.",
    noRecommendation: "No hay recomendación guardada para este análisis.",
    dataReliability: "Fiabilidad de los datos",
    source: "Fuente",
    resolution: "Resolución",
    validPixels: "Píxeles válidos",
    validCoverage: "Cobertura válida",
    qualityGate: "Quality gate mín.",
    acceptedIntervals: "Intervalos aceptados",
    rejectedIntervals: "Intervalos rechazados",
    medianNdvi: "NDVI mediano",
    weatherSnapshot: "Instantánea meteorológica del análisis",
    temperature: "Temperatura",
    humidity: "Humedad",
    precipitationLastHour: "Precipitación – última hora",
    wind: "Viento",
    noWeather: "No hay una instantánea meteorológica guardada para este análisis histórico.",
    ndviTrend: "Evolución del NDVI",
    intervalFrom: "Intervalo desde",
    intervalTo: "Intervalo hasta",
    noHistory: "El historial de NDVI no está disponible.",
    fieldContext: "Contexto del campo",
    crop: "Cultivo",
    variety: "Variedad",
    area: "Superficie",
    growthStage: "Etapa de crecimiento",
    locationPeriod: "Ubicación y período",
    latitude: "Latitud",
    longitude: "Longitud",
    lastSentinel: "Último intervalo Sentinel",
    disclaimer: "AEGRIS es un sistema de apoyo a la toma de decisiones. Los datos satelitales y meteorológicos son datos fuente/calculados; la puntuación AEGRIS, el riesgo, el diagnóstico y las recomendaciones son evaluaciones del modelo y no sustituyen una inspección profesional de campo.",
    generated: "Informe generado",
  };

  const it = {
    unavailable: "Il progetto non esiste o non disponi dell’autorizzazione per visualizzarlo.",
    noAnalysis: "Il progetto non dispone ancora di un’analisi per generare un report.",
    loading: "Caricamento report...",
    accessDenied: "Accesso negato",
    noAccess: "Non hai accesso a questo progetto",
    backReports: "Torna ai report",
    cannotCreate: "Impossibile creare il report",
    missingData: "Mancano dati necessari.",
    registry: "← Registro report",
    fieldRecord: "Scheda stato del campo",
    printPdf: "Stampa / Salva come PDF",
    reportTitle: "AEGRIS / Report analitico del campo",
    cropUnknown: "Coltura non specificata",
    analysis: "Analisi",
    projectId: "ID progetto",
    decisionState: "Stato decisionale",
    score: "Punteggio AEGRIS",
    risk: "Rischio",
    priority: "Priorità",
    evaluation: "Valutazione AEGRIS",
    noSummary: "Nessun riepilogo salvato.",
    noRecommendation: "Nessuna raccomandazione salvata per questa analisi.",
    dataReliability: "Affidabilità dei dati",
    source: "Fonte",
    resolution: "Risoluzione",
    validPixels: "Pixel validi",
    validCoverage: "Copertura valida",
    qualityGate: "Quality gate min.",
    acceptedIntervals: "Intervalli accettati",
    rejectedIntervals: "Intervalli rifiutati",
    medianNdvi: "NDVI mediano",
    weatherSnapshot: "Snapshot meteo dell’analisi",
    temperature: "Temperatura",
    humidity: "Umidità",
    precipitationLastHour: "Precipitazioni – ultima ora",
    wind: "Vento",
    noWeather: "Nessuno snapshot meteo salvato per questa analisi storica.",
    ndviTrend: "Andamento NDVI",
    intervalFrom: "Intervallo da",
    intervalTo: "Intervallo a",
    noHistory: "Lo storico NDVI non è disponibile.",
    fieldContext: "Contesto del campo",
    crop: "Coltura",
    variety: "Varietà",
    area: "Superficie",
    growthStage: "Fase di crescita",
    locationPeriod: "Località e periodo",
    latitude: "Latitudine",
    longitude: "Longitudine",
    lastSentinel: "Ultimo intervallo Sentinel",
    disclaimer: "AEGRIS è un sistema di supporto alle decisioni. I dati satellitari e meteorologici sono dati di origine/calcolati; punteggio AEGRIS, rischio, diagnostica e raccomandazioni sono valutazioni del modello e non sostituiscono un’ispezione professionale in campo.",
    generated: "Report generato",
  };

  const nl = {
    unavailable: "Het project bestaat niet of u hebt geen toestemming om het te bekijken.",
    noAnalysis: "Het project heeft nog geen analyse om een rapport te genereren.",
    loading: "Rapport laden...",
    accessDenied: "Toegang geweigerd",
    noAccess: "U hebt geen toegang tot dit project",
    backReports: "Terug naar rapporten",
    cannotCreate: "Rapport kan niet worden gemaakt",
    missingData: "Vereiste gegevens ontbreken.",
    registry: "← Rapportregister",
    fieldRecord: "Veldgezondheidsrapport",
    printPdf: "Afdrukken / Opslaan als PDF",
    reportTitle: "AEGRIS / Analytisch veldrapport",
    cropUnknown: "Gewas niet opgegeven",
    analysis: "Analyse",
    projectId: "Project-ID",
    decisionState: "Beslissingsstatus",
    score: "AEGRIS-score",
    risk: "Risico",
    priority: "Prioriteit",
    evaluation: "AEGRIS-beoordeling",
    noSummary: "Geen opgeslagen samenvatting.",
    noRecommendation: "Voor deze analyse is geen aanbeveling opgeslagen.",
    dataReliability: "Betrouwbaarheid van gegevens",
    source: "Bron",
    resolution: "Resolutie",
    validPixels: "Geldige pixels",
    validCoverage: "Geldige dekking",
    qualityGate: "Quality gate min.",
    acceptedIntervals: "Geaccepteerde intervallen",
    rejectedIntervals: "Afgewezen intervallen",
    medianNdvi: "Mediaan NDVI",
    weatherSnapshot: "Weersnapshot van analyse",
    temperature: "Temperatuur",
    humidity: "Luchtvochtigheid",
    precipitationLastHour: "Neerslag – laatste uur",
    wind: "Wind",
    noWeather: "Voor deze historische analyse is geen weersnapshot opgeslagen.",
    ndviTrend: "NDVI-ontwikkeling",
    intervalFrom: "Interval vanaf",
    intervalTo: "Interval tot",
    noHistory: "NDVI-geschiedenis is niet beschikbaar.",
    fieldContext: "Veldcontext",
    crop: "Gewas",
    variety: "Ras",
    area: "Oppervlakte",
    growthStage: "Groeistadium",
    locationPeriod: "Locatie en periode",
    latitude: "Breedtegraad",
    longitude: "Lengtegraad",
    lastSentinel: "Laatste Sentinel-interval",
    disclaimer: "AEGRIS is een beslissingsondersteunend systeem. Satelliet- en meteorologische gegevens zijn bron-/berekende gegevens; AEGRIS-score, risico, diagnostiek en aanbevelingen zijn modelbeoordelingen en vervangen geen professionele veldinspectie.",
    generated: "Rapport gegenereerd",
  };

  const pt = {
    unavailable: "O projeto não existe ou não tem permissão para o visualizar.",
    noAnalysis: "O projeto ainda não tem uma análise para gerar um relatório.",
    loading: "A carregar relatório...",
    accessDenied: "Acesso negado",
    noAccess: "Não tem acesso a este projeto",
    backReports: "Voltar aos relatórios",
    cannotCreate: "Não é possível criar o relatório",
    missingData: "Faltam dados necessários.",
    registry: "← Registo de relatórios",
    fieldRecord: "Registo do estado do campo",
    printPdf: "Imprimir / Guardar como PDF",
    reportTitle: "AEGRIS / Relatório analítico do campo",
    cropUnknown: "Cultura não especificada",
    analysis: "Análise",
    projectId: "ID do projeto",
    decisionState: "Estado da decisão",
    score: "Pontuação AEGRIS",
    risk: "Risco",
    priority: "Prioridade",
    evaluation: "Avaliação AEGRIS",
    noSummary: "Sem resumo guardado.",
    noRecommendation: "Não existe recomendação guardada para esta análise.",
    dataReliability: "Fiabilidade dos dados",
    source: "Fonte",
    resolution: "Resolução",
    validPixels: "Pixels válidos",
    validCoverage: "Cobertura válida",
    qualityGate: "Quality gate mín.",
    acceptedIntervals: "Intervalos aceites",
    rejectedIntervals: "Intervalos rejeitados",
    medianNdvi: "NDVI mediano",
    weatherSnapshot: "Snapshot meteorológico da análise",
    temperature: "Temperatura",
    humidity: "Humidade",
    precipitationLastHour: "Precipitação – última hora",
    wind: "Vento",
    noWeather: "Não existe snapshot meteorológico guardado para esta análise histórica.",
    ndviTrend: "Evolução do NDVI",
    intervalFrom: "Intervalo desde",
    intervalTo: "Intervalo até",
    noHistory: "O histórico NDVI não está disponível.",
    fieldContext: "Contexto do campo",
    crop: "Cultura",
    variety: "Variedade",
    area: "Área",
    growthStage: "Fase de crescimento",
    locationPeriod: "Localização e período",
    latitude: "Latitude",
    longitude: "Longitude",
    lastSentinel: "Último intervalo Sentinel",
    disclaimer: "AEGRIS é um sistema de apoio à decisão. Os dados de satélite e meteorológicos são dados de origem/calculados; a pontuação AEGRIS, o risco, o diagnóstico e as recomendações são avaliações do modelo e não substituem uma inspeção profissional no terreno.",
    generated: "Relatório gerado",
  };

  const ro = {
    unavailable: "Proiectul nu există sau nu aveți permisiunea de a-l vizualiza.",
    noAnalysis: "Proiectul nu are încă o analiză pentru generarea raportului.",
    loading: "Se încarcă raportul...",
    accessDenied: "Acces refuzat",
    noAccess: "Nu aveți acces la acest proiect",
    backReports: "Înapoi la rapoarte",
    cannotCreate: "Raportul nu poate fi creat",
    missingData: "Lipsesc date necesare.",
    registry: "← Registrul rapoartelor",
    fieldRecord: "Fișa stării parcelei",
    printPdf: "Tipărire / Salvare ca PDF",
    reportTitle: "AEGRIS / Raport analitic al parcelei",
    cropUnknown: "Cultură nespecificată",
    analysis: "Analiză",
    projectId: "ID proiect",
    decisionState: "Starea deciziei",
    score: "Scor AEGRIS",
    risk: "Risc",
    priority: "Prioritate",
    evaluation: "Evaluare AEGRIS",
    noSummary: "Niciun rezumat salvat.",
    noRecommendation: "Nu există recomandare salvată pentru această analiză.",
    dataReliability: "Fiabilitatea datelor",
    source: "Sursă",
    resolution: "Rezoluție",
    validPixels: "Pixeli valizi",
    validCoverage: "Acoperire validă",
    qualityGate: "Quality gate min.",
    acceptedIntervals: "Intervale acceptate",
    rejectedIntervals: "Intervale respinse",
    medianNdvi: "NDVI median",
    weatherSnapshot: "Snapshot meteo al analizei",
    temperature: "Temperatură",
    humidity: "Umiditate",
    precipitationLastHour: "Precipitații – ultima oră",
    wind: "Vânt",
    noWeather: "Nu există snapshot meteo salvat pentru această analiză istorică.",
    ndviTrend: "Evoluția NDVI",
    intervalFrom: "Interval de la",
    intervalTo: "Interval până la",
    noHistory: "Istoricul NDVI nu este disponibil.",
    fieldContext: "Contextul parcelei",
    crop: "Cultură",
    variety: "Soi",
    area: "Suprafață",
    growthStage: "Stadiu de creștere",
    locationPeriod: "Locație și perioadă",
    latitude: "Latitudine",
    longitude: "Longitudine",
    lastSentinel: "Ultimul interval Sentinel",
    disclaimer: "AEGRIS este un sistem de sprijinire a deciziilor. Datele satelitare și meteorologice sunt date sursă/calculate; scorul AEGRIS, riscul, diagnosticul și recomandările sunt evaluări ale modelului și nu înlocuiesc inspecția profesională pe teren.",
    generated: "Raport generat",
  };

  const hu = {
    unavailable: "A projekt nem létezik, vagy nincs jogosultsága a megtekintéséhez.",
    noAnalysis: "A projekthez még nincs jelentés készítésére alkalmas elemzés.",
    loading: "Jelentés betöltése...",
    accessDenied: "Hozzáférés megtagadva",
    noAccess: "Nincs hozzáférése ehhez a projekthez",
    backReports: "Vissza a jelentésekhez",
    cannotCreate: "A jelentés nem hozható létre",
    missingData: "Szükséges adatok hiányoznak.",
    registry: "← Jelentésnyilvántartás",
    fieldRecord: "Táblakondíciós adatlap",
    printPdf: "Nyomtatás / Mentés PDF-ként",
    reportTitle: "AEGRIS / Analitikai táblajelentés",
    cropUnknown: "Nincs megadva növény",
    analysis: "Elemzés",
    projectId: "Projektazonosító",
    decisionState: "Döntési állapot",
    score: "AEGRIS-pontszám",
    risk: "Kockázat",
    priority: "Prioritás",
    evaluation: "AEGRIS-értékelés",
    noSummary: "Nincs mentett összefoglaló.",
    noRecommendation: "Ehhez az elemzéshez nincs mentett ajánlás.",
    dataReliability: "Adatmegbízhatóság",
    source: "Forrás",
    resolution: "Felbontás",
    validPixels: "Érvényes pixelek",
    validCoverage: "Érvényes lefedettség",
    qualityGate: "Quality gate min.",
    acceptedIntervals: "Elfogadott intervallumok",
    rejectedIntervals: "Elutasított intervallumok",
    medianNdvi: "Medián NDVI",
    weatherSnapshot: "Elemzési időjárási pillanatkép",
    temperature: "Hőmérséklet",
    humidity: "Páratartalom",
    precipitationLastHour: "Csapadék – utolsó óra",
    wind: "Szél",
    noWeather: "Ehhez a történeti elemzéshez nincs mentett időjárási pillanatkép.",
    ndviTrend: "NDVI alakulása",
    intervalFrom: "Intervallum kezdete",
    intervalTo: "Intervallum vége",
    noHistory: "Az NDVI-előzmények nem érhetők el.",
    fieldContext: "Tábla kontextusa",
    crop: "Növény",
    variety: "Fajta",
    area: "Terület",
    growthStage: "Növekedési szakasz",
    locationPeriod: "Hely és időszak",
    latitude: "Szélesség",
    longitude: "Hosszúság",
    lastSentinel: "Legutóbbi Sentinel-intervallum",
    disclaimer: "Az AEGRIS döntéstámogató rendszer. A műholdas és meteorológiai adatok forrás-/számított adatok; az AEGRIS-pontszám, kockázat, diagnosztika és ajánlások modellértékelések, és nem helyettesítik a szakszerű helyszíni ellenőrzést.",
    generated: "Jelentés elkészült",
  };

  const uk = {
    unavailable: "Проєкт не існує або у вас немає дозволу на його перегляд.",
    noAnalysis: "Проєкт ще не має аналізу для формування звіту.",
    loading: "Завантаження звіту...",
    accessDenied: "Доступ заборонено",
    noAccess: "У вас немає доступу до цього проєкту",
    backReports: "Назад до звітів",
    cannotCreate: "Звіт неможливо створити",
    missingData: "Відсутні необхідні дані.",
    registry: "← Реєстр звітів",
    fieldRecord: "Картка стану поля",
    printPdf: "Друк / Зберегти як PDF",
    reportTitle: "AEGRIS / Аналітичний звіт поля",
    cropUnknown: "Культуру не вказано",
    analysis: "Аналіз",
    projectId: "ID проєкту",
    decisionState: "Стан рішення",
    score: "Оцінка AEGRIS",
    risk: "Ризик",
    priority: "Пріоритет",
    evaluation: "Оцінювання AEGRIS",
    noSummary: "Немає збереженого підсумку.",
    noRecommendation: "Для цього аналізу немає збереженої рекомендації.",
    dataReliability: "Надійність даних",
    source: "Джерело",
    resolution: "Роздільна здатність",
    validPixels: "Валідні пікселі",
    validCoverage: "Валідне покриття",
    qualityGate: "Quality gate мін.",
    acceptedIntervals: "Прийняті інтервали",
    rejectedIntervals: "Відхилені інтервали",
    medianNdvi: "Медіана NDVI",
    weatherSnapshot: "Погодний snapshot аналізу",
    temperature: "Температура",
    humidity: "Вологість",
    precipitationLastHour: "Опади – остання година",
    wind: "Вітер",
    noWeather: "Для цього історичного аналізу немає збереженого погодного snapshot.",
    ndviTrend: "Динаміка NDVI",
    intervalFrom: "Інтервал від",
    intervalTo: "Інтервал до",
    noHistory: "Історія NDVI недоступна.",
    fieldContext: "Контекст поля",
    crop: "Культура",
    variety: "Сорт",
    area: "Площа",
    growthStage: "Фаза росту",
    locationPeriod: "Місце та період",
    latitude: "Широта",
    longitude: "Довгота",
    lastSentinel: "Останній інтервал Sentinel",
    disclaimer: "AEGRIS — система підтримки прийняття рішень. Супутникові та метеорологічні дані є вихідними/розрахунковими даними; оцінка AEGRIS, ризик, діагностика та рекомендації є модельними оцінками й не замінюють професійного польового огляду.",
    generated: "Звіт сформовано",
  };

  const bg = {
    unavailable: "Проектът не съществува или нямате разрешение да го преглеждате.",
    noAnalysis: "Проектът все още няма анализ за генериране на отчет.",
    loading: "Зареждане на отчета...",
    accessDenied: "Достъпът е отказан",
    noAccess: "Нямате достъп до този проект",
    backReports: "Назад към отчетите",
    cannotCreate: "Отчетът не може да бъде създаден",
    missingData: "Липсват необходимите данни.",
    registry: "← Регистър на отчетите",
    fieldRecord: "Карта за състоянието на полето",
    printPdf: "Печат / Запази като PDF",
    reportTitle: "AEGRIS / Аналитичен отчет за полето",
    cropUnknown: "Културата не е посочена",
    analysis: "Анализ",
    projectId: "ID на проекта",
    decisionState: "Състояние на решението",
    score: "AEGRIS оценка",
    risk: "Риск",
    priority: "Приоритет",
    evaluation: "AEGRIS оценяване",
    noSummary: "Няма запазено резюме.",
    noRecommendation: "За този анализ няма запазана препоръка.",
    dataReliability: "Надеждност на данните",
    source: "Източник",
    resolution: "Резолюция",
    validPixels: "Валидни пиксели",
    validCoverage: "Валидно покритие",
    qualityGate: "Quality gate мин.",
    acceptedIntervals: "Приети интервали",
    rejectedIntervals: "Отхвърлени интервали",
    medianNdvi: "Медиана NDVI",
    weatherSnapshot: "Метеорологичен snapshot на анализа",
    temperature: "Температура",
    humidity: "Влажност",
    precipitationLastHour: "Валежи – последния час",
    wind: "Вятър",
    noWeather: "За този исторически анализ няма запазен метеорологичен snapshot.",
    ndviTrend: "Развитие на NDVI",
    intervalFrom: "Интервал от",
    intervalTo: "Интервал до",
    noHistory: "Историята на NDVI не е налична.",
    fieldContext: "Контекст на полето",
    crop: "Култура",
    variety: "Сорт",
    area: "Площ",
    growthStage: "Фаза на растеж",
    locationPeriod: "Местоположение и период",
    latitude: "Географска ширина",
    longitude: "Географска дължина",
    lastSentinel: "Последен Sentinel интервал",
    disclaimer: "AEGRIS е система за подпомагане на решенията. Сателитните и метеорологичните данни са изходни/изчислени данни; AEGRIS оценката, рискът, диагностиката и препоръките са моделни оценки и не заменят професионална проверка на полето.",
    generated: "Отчетът е генериран",
  };

  const hr = {
    unavailable: "Projekt ne postoji ili nemate dopuštenje za njegov pregled.",
    noAnalysis: "Projekt još nema analizu za izradu izvještaja.",
    loading: "Učitavanje izvještaja...",
    accessDenied: "Pristup odbijen",
    noAccess: "Nemate pristup ovom projektu",
    backReports: "Natrag na izvještaje",
    cannotCreate: "Izvještaj se ne može izraditi",
    missingData: "Nedostaju potrebni podaci.",
    registry: "← Registar izvještaja",
    fieldRecord: "Zapis stanja polja",
    printPdf: "Ispis / Spremi kao PDF",
    reportTitle: "AEGRIS / Analitički izvještaj polja",
    cropUnknown: "Kultura nije navedena",
    analysis: "Analiza",
    projectId: "ID projekta",
    decisionState: "Status odluke",
    score: "AEGRIS rezultat",
    risk: "Rizik",
    priority: "Prioritet",
    evaluation: "AEGRIS procjena",
    noSummary: "Nema spremljenog sažetka.",
    noRecommendation: "Za ovu analizu nema spremljene preporuke.",
    dataReliability: "Pouzdanost podataka",
    source: "Izvor",
    resolution: "Rezolucija",
    validPixels: "Valjani pikseli",
    validCoverage: "Valjana pokrivenost",
    qualityGate: "Quality gate min.",
    acceptedIntervals: "Prihvaćeni intervali",
    rejectedIntervals: "Odbijeni intervali",
    medianNdvi: "Medijan NDVI",
    weatherSnapshot: "Meteorološki snapshot analize",
    temperature: "Temperatura",
    humidity: "Vlažnost",
    precipitationLastHour: "Oborine – posljednji sat",
    wind: "Vjetar",
    noWeather: "Za ovu povijesnu analizu nema spremljenog meteorološkog snapshota.",
    ndviTrend: "Razvoj NDVI",
    intervalFrom: "Interval od",
    intervalTo: "Interval do",
    noHistory: "Povijest NDVI nije dostupna.",
    fieldContext: "Kontekst polja",
    crop: "Kultura",
    variety: "Sorta",
    area: "Površina",
    growthStage: "Faza rasta",
    locationPeriod: "Lokacija i razdoblje",
    latitude: "Geografska širina",
    longitude: "Geografska dužina",
    lastSentinel: "Posljednji Sentinel interval",
    disclaimer: "AEGRIS je sustav za podršku odlučivanju. Satelitski i meteorološki podaci su izvorni/izračunati podaci; AEGRIS rezultat, rizik, dijagnostika i preporuke modelne su procjene i ne zamjenjuju stručni pregled na terenu.",
    generated: "Izvještaj generiran",
  };

  const sl = {
    unavailable: "Projekt ne obstaja ali nimate dovoljenja za ogled.",
    noAnalysis: "Projekt še nima analize za izdelavo poročila.",
    loading: "Nalaganje poročila...",
    accessDenied: "Dostop zavrnjen",
    noAccess: "Nimate dostopa do tega projekta",
    backReports: "Nazaj na poročila",
    cannotCreate: "Poročila ni mogoče ustvariti",
    missingData: "Manjkajo zahtevani podatki.",
    registry: "← Register poročil",
    fieldRecord: "Zapis stanja polja",
    printPdf: "Natisni / Shrani kot PDF",
    reportTitle: "AEGRIS / Analitično poročilo polja",
    cropUnknown: "Poljščina ni navedena",
    analysis: "Analiza",
    projectId: "ID projekta",
    decisionState: "Stanje odločitve",
    score: "Ocena AEGRIS",
    risk: "Tveganje",
    priority: "Prioriteta",
    evaluation: "Vrednotenje AEGRIS",
    noSummary: "Ni shranjenega povzetka.",
    noRecommendation: "Za to analizo ni shranjenega priporočila.",
    dataReliability: "Zanesljivost podatkov",
    source: "Vir",
    resolution: "Ločljivost",
    validPixels: "Veljavne slikovne točke",
    validCoverage: "Veljavna pokritost",
    qualityGate: "Quality gate min.",
    acceptedIntervals: "Sprejeti intervali",
    rejectedIntervals: "Zavrnjeni intervali",
    medianNdvi: "Mediana NDVI",
    weatherSnapshot: "Vremenski snapshot analize",
    temperature: "Temperatura",
    humidity: "Vlažnost",
    precipitationLastHour: "Padavine – zadnja ura",
    wind: "Veter",
    noWeather: "Za to zgodovinsko analizo ni shranjenega vremenskega snapshota.",
    ndviTrend: "Razvoj NDVI",
    intervalFrom: "Interval od",
    intervalTo: "Interval do",
    noHistory: "Zgodovina NDVI ni na voljo.",
    fieldContext: "Kontekst polja",
    crop: "Poljščina",
    variety: "Sorta",
    area: "Površina",
    growthStage: "Faza rasti",
    locationPeriod: "Lokacija in obdobje",
    latitude: "Zemljepisna širina",
    longitude: "Zemljepisna dolžina",
    lastSentinel: "Zadnji interval Sentinel",
    disclaimer: "AEGRIS je sistem za podporo odločanju. Satelitski in meteorološki podatki so izvorni/izračunani podatki; ocena AEGRIS, tveganje, diagnostika in priporočila so modelne ocene in ne nadomeščajo strokovnega pregleda na terenu.",
    generated: "Poročilo ustvarjeno",
  };

  const lt = {
    unavailable: "Projektas neegzistuoja arba neturite leidimo jo peržiūrėti.",
    noAnalysis: "Projektas dar neturi analizės ataskaitai generuoti.",
    loading: "Įkeliama ataskaita...",
    accessDenied: "Prieiga uždrausta",
    noAccess: "Neturite prieigos prie šio projekto",
    backReports: "Atgal į ataskaitas",
    cannotCreate: "Ataskaitos sukurti negalima",
    missingData: "Trūksta reikiamų duomenų.",
    registry: "← Ataskaitų registras",
    fieldRecord: "Lauko būklės įrašas",
    printPdf: "Spausdinti / Išsaugoti kaip PDF",
    reportTitle: "AEGRIS / Analitinė lauko ataskaita",
    cropUnknown: "Kultūra nenurodyta",
    analysis: "Analizė",
    projectId: "Projekto ID",
    decisionState: "Sprendimo būsena",
    score: "AEGRIS balas",
    risk: "Rizika",
    priority: "Prioritetas",
    evaluation: "AEGRIS vertinimas",
    noSummary: "Nėra išsaugotos santraukos.",
    noRecommendation: "Šiai analizei nėra išsaugotos rekomendacijos.",
    dataReliability: "Duomenų patikimumas",
    source: "Šaltinis",
    resolution: "Skiriamoji geba",
    validPixels: "Tinkami pikseliai",
    validCoverage: "Tinkama aprėptis",
    qualityGate: "Quality gate min.",
    acceptedIntervals: "Priimti intervalai",
    rejectedIntervals: "Atmesti intervalai",
    medianNdvi: "NDVI mediana",
    weatherSnapshot: "Analizės orų snapshot",
    temperature: "Temperatūra",
    humidity: "Drėgmė",
    precipitationLastHour: "Krituliai – paskutinė valanda",
    wind: "Vėjas",
    noWeather: "Šiai istorinei analizei nėra išsaugoto orų snapshoto.",
    ndviTrend: "NDVI raida",
    intervalFrom: "Intervalas nuo",
    intervalTo: "Intervalas iki",
    noHistory: "NDVI istorija nepasiekiama.",
    fieldContext: "Lauko kontekstas",
    crop: "Kultūra",
    variety: "Veislė",
    area: "Plotas",
    growthStage: "Augimo tarpsnis",
    locationPeriod: "Vieta ir laikotarpis",
    latitude: "Platuma",
    longitude: "Ilguma",
    lastSentinel: "Naujausias Sentinel intervalas",
    disclaimer: "AEGRIS yra sprendimų palaikymo sistema. Palydoviniai ir meteorologiniai duomenys yra šaltinio / apskaičiuoti duomenys; AEGRIS balas, rizika, diagnostika ir rekomendacijos yra modelio vertinimai ir nepakeičia profesionalios lauko apžiūros.",
    generated: "Ataskaita sugeneruota",
  };

  const lv = {
    unavailable: "Projekts neeksistē vai jums nav atļaujas to skatīt.",
    noAnalysis: "Projektam vēl nav analīzes pārskata izveidei.",
    loading: "Ielādē pārskatu...",
    accessDenied: "Piekļuve liegta",
    noAccess: "Jums nav piekļuves šim projektam",
    backReports: "Atpakaļ uz pārskatiem",
    cannotCreate: "Pārskatu nevar izveidot",
    missingData: "Trūkst nepieciešamo datu.",
    registry: "← Pārskatu reģistrs",
    fieldRecord: "Lauka stāvokļa ieraksts",
    printPdf: "Drukāt / Saglabāt kā PDF",
    reportTitle: "AEGRIS / Lauka analītiskais pārskats",
    cropUnknown: "Kultūra nav norādīta",
    analysis: "Analīze",
    projectId: "Projekta ID",
    decisionState: "Lēmuma statuss",
    score: "AEGRIS vērtējums",
    risk: "Risks",
    priority: "Prioritāte",
    evaluation: "AEGRIS novērtējums",
    noSummary: "Nav saglabāta kopsavilkuma.",
    noRecommendation: "Šai analīzei nav saglabāta ieteikuma.",
    dataReliability: "Datu uzticamība",
    source: "Avots",
    resolution: "Izšķirtspēja",
    validPixels: "Derīgi pikseļi",
    validCoverage: "Derīgs pārklājums",
    qualityGate: "Quality gate min.",
    acceptedIntervals: "Pieņemtie intervāli",
    rejectedIntervals: "Noraidītie intervāli",
    medianNdvi: "Mediānais NDVI",
    weatherSnapshot: "Analīzes laikapstākļu snapshot",
    temperature: "Temperatūra",
    humidity: "Mitrums",
    precipitationLastHour: "Nokrišņi – pēdējā stunda",
    wind: "Vējš",
    noWeather: "Šai vēsturiskajai analīzei nav saglabāta laikapstākļu snapshota.",
    ndviTrend: "NDVI attīstība",
    intervalFrom: "Intervāls no",
    intervalTo: "Intervāls līdz",
    noHistory: "NDVI vēsture nav pieejama.",
    fieldContext: "Lauka konteksts",
    crop: "Kultūra",
    variety: "Šķirne",
    area: "Platība",
    growthStage: "Augšanas stadija",
    locationPeriod: "Atrašanās vieta un periods",
    latitude: "Platums",
    longitude: "Garums",
    lastSentinel: "Jaunākais Sentinel intervāls",
    disclaimer: "AEGRIS ir lēmumu atbalsta sistēma. Satelītu un meteoroloģiskie dati ir avota/aprēķināti dati; AEGRIS vērtējums, risks, diagnostika un ieteikumi ir modeļa novērtējumi un neaizstāj profesionālu lauka pārbaudi.",
    generated: "Pārskats izveidots",
  };

  const et = {
    unavailable: "Projekti ei ole olemas või teil puudub selle vaatamise õigus.",
    noAnalysis: "Projektil pole veel aruande koostamiseks vajalikku analüüsi.",
    loading: "Aruande laadimine...",
    accessDenied: "Juurdepääs keelatud",
    noAccess: "Teil puudub juurdepääs sellele projektile",
    backReports: "Tagasi aruannete juurde",
    cannotCreate: "Aruannet ei saa luua",
    missingData: "Vajalikud andmed puuduvad.",
    registry: "← Aruannete register",
    fieldRecord: "Põllu seisundi kirje",
    printPdf: "Prindi / Salvesta PDF-ina",
    reportTitle: "AEGRIS / Põllu analüütiline aruanne",
    cropUnknown: "Kultuur pole määratud",
    analysis: "Analüüs",
    projectId: "Projekti ID",
    decisionState: "Otsuse olek",
    score: "AEGRIS skoor",
    risk: "Risk",
    priority: "Prioriteet",
    evaluation: "AEGRIS hinnang",
    noSummary: "Salvestatud kokkuvõte puudub.",
    noRecommendation: "Selle analüüsi jaoks pole soovitust salvestatud.",
    dataReliability: "Andmete usaldusväärsus",
    source: "Allikas",
    resolution: "Eraldusvõime",
    validPixels: "Kehtivad pikslid",
    validCoverage: "Kehtiv katvus",
    qualityGate: "Quality gate min.",
    acceptedIntervals: "Aktsepteeritud intervallid",
    rejectedIntervals: "Tagasilükatud intervallid",
    medianNdvi: "Mediaan-NDVI",
    weatherSnapshot: "Analüüsi ilma snapshot",
    temperature: "Temperatuur",
    humidity: "Õhuniiskus",
    precipitationLastHour: "Sademed – viimane tund",
    wind: "Tuul",
    noWeather: "Selle ajaloolise analüüsi jaoks pole ilma snapshoti salvestatud.",
    ndviTrend: "NDVI areng",
    intervalFrom: "Intervall alates",
    intervalTo: "Intervall kuni",
    noHistory: "NDVI ajalugu pole saadaval.",
    fieldContext: "Põllu kontekst",
    crop: "Kultuur",
    variety: "Sort",
    area: "Pindala",
    growthStage: "Kasvufaas",
    locationPeriod: "Asukoht ja periood",
    latitude: "Laiuskraad",
    longitude: "Pikkuskraad",
    lastSentinel: "Viimane Sentinel-intervall",
    disclaimer: "AEGRIS on otsustustoe süsteem. Satelliidi- ja meteoroloogilised andmed on lähte-/arvutusandmed; AEGRIS skoor, risk, diagnostika ja soovitused on mudelipõhised hinnangud ega asenda professionaalset põllukontrolli.",
    generated: "Aruanne loodud",
  };

  const el = {
    unavailable: "Το έργο δεν υπάρχει ή δεν έχετε άδεια να το προβάλετε.",
    noAnalysis: "Το έργο δεν διαθέτει ακόμη ανάλυση για δημιουργία αναφοράς.",
    loading: "Φόρτωση αναφοράς...",
    accessDenied: "Απαγορεύεται η πρόσβαση",
    noAccess: "Δεν έχετε πρόσβαση σε αυτό το έργο",
    backReports: "Πίσω στις αναφορές",
    cannotCreate: "Δεν είναι δυνατή η δημιουργία αναφοράς",
    missingData: "Λείπουν απαιτούμενα δεδομένα.",
    registry: "← Μητρώο αναφορών",
    fieldRecord: "Δελτίο κατάστασης αγρού",
    printPdf: "Εκτύπωση / Αποθήκευση ως PDF",
    reportTitle: "AEGRIS / Αναλυτική αναφορά αγρού",
    cropUnknown: "Δεν έχει οριστεί καλλιέργεια",
    analysis: "Ανάλυση",
    projectId: "ID έργου",
    decisionState: "Κατάσταση απόφασης",
    score: "Βαθμολογία AEGRIS",
    risk: "Κίνδυνος",
    priority: "Προτεραιότητα",
    evaluation: "Αξιολόγηση AEGRIS",
    noSummary: "Δεν υπάρχει αποθηκευμένη σύνοψη.",
    noRecommendation: "Δεν υπάρχει αποθηκευμένη σύσταση για αυτή την ανάλυση.",
    dataReliability: "Αξιοπιστία δεδομένων",
    source: "Πηγή",
    resolution: "Ανάλυση",
    validPixels: "Έγκυρα pixel",
    validCoverage: "Έγκυρη κάλυψη",
    qualityGate: "Quality gate ελάχ.",
    acceptedIntervals: "Αποδεκτά διαστήματα",
    rejectedIntervals: "Απορριφθέντα διαστήματα",
    medianNdvi: "Διάμεσο NDVI",
    weatherSnapshot: "Μετεωρολογικό snapshot ανάλυσης",
    temperature: "Θερμοκρασία",
    humidity: "Υγρασία",
    precipitationLastHour: "Βροχόπτωση – τελευταία ώρα",
    wind: "Άνεμος",
    noWeather: "Δεν υπάρχει αποθηκευμένο μετεωρολογικό snapshot για αυτή την ιστορική ανάλυση.",
    ndviTrend: "Εξέλιξη NDVI",
    intervalFrom: "Διάστημα από",
    intervalTo: "Διάστημα έως",
    noHistory: "Το ιστορικό NDVI δεν είναι διαθέσιμο.",
    fieldContext: "Πλαίσιο αγρού",
    crop: "Καλλιέργεια",
    variety: "Ποικιλία",
    area: "Έκταση",
    growthStage: "Στάδιο ανάπτυξης",
    locationPeriod: "Τοποθεσία και περίοδος",
    latitude: "Γεωγραφικό πλάτος",
    longitude: "Γεωγραφικό μήκος",
    lastSentinel: "Τελευταίο διάστημα Sentinel",
    disclaimer: "Το AEGRIS είναι σύστημα υποστήριξης αποφάσεων. Τα δορυφορικά και μετεωρολογικά δεδομένα είναι δεδομένα πηγής/υπολογισμού· η βαθμολογία AEGRIS, ο κίνδυνος, η διάγνωση και οι συστάσεις είναι αξιολογήσεις μοντέλου και δεν αντικαθιστούν επαγγελματική επιθεώρηση αγρού.",
    generated: "Η αναφορά δημιουργήθηκε",
  };

  const sv = {
    unavailable: "Projektet finns inte eller så saknar du behörighet att visa det.",
    noAnalysis: "Projektet har ännu ingen analys för att skapa en rapport.",
    loading: "Laddar rapport...",
    accessDenied: "Åtkomst nekad",
    noAccess: "Du har inte åtkomst till detta projekt",
    backReports: "Tillbaka till rapporter",
    cannotCreate: "Rapporten kan inte skapas",
    missingData: "Nödvändiga data saknas.",
    registry: "← Rapportregister",
    fieldRecord: "Fälthälsoregister",
    printPdf: "Skriv ut / Spara som PDF",
    reportTitle: "AEGRIS / Analytisk fältrapport",
    cropUnknown: "Gröda ej angiven",
    analysis: "Analys",
    projectId: "Projekt-ID",
    decisionState: "Beslutsstatus",
    score: "AEGRIS-poäng",
    risk: "Risk",
    priority: "Prioritet",
    evaluation: "AEGRIS-bedömning",
    noSummary: "Ingen sparad sammanfattning.",
    noRecommendation: "Ingen rekommendation är sparad för denna analys.",
    dataReliability: "Datatillförlitlighet",
    source: "Källa",
    resolution: "Upplösning",
    validPixels: "Giltiga pixlar",
    validCoverage: "Giltig täckning",
    qualityGate: "Quality gate min.",
    acceptedIntervals: "Godkända intervall",
    rejectedIntervals: "Avvisade intervall",
    medianNdvi: "Median-NDVI",
    weatherSnapshot: "Analysens väder-snapshot",
    temperature: "Temperatur",
    humidity: "Luftfuktighet",
    precipitationLastHour: "Nederbörd – senaste timmen",
    wind: "Vind",
    noWeather: "Ingen väder-snapshot är sparad för denna historiska analys.",
    ndviTrend: "NDVI-utveckling",
    intervalFrom: "Intervall från",
    intervalTo: "Intervall till",
    noHistory: "NDVI-historik är inte tillgänglig.",
    fieldContext: "Fältkontext",
    crop: "Gröda",
    variety: "Sort",
    area: "Areal",
    growthStage: "Tillväxtstadium",
    locationPeriod: "Plats och period",
    latitude: "Latitud",
    longitude: "Longitud",
    lastSentinel: "Senaste Sentinel-intervall",
    disclaimer: "AEGRIS är ett beslutsstödsystem. Satellit- och meteorologiska data är käll-/beräknade data; AEGRIS-poäng, risk, diagnostik och rekommendationer är modellbedömningar och ersätter inte professionell fältinspektion.",
    generated: "Rapport genererad",
  };

  const da = {
    unavailable: "Projektet findes ikke, eller du har ikke tilladelse til at se det.",
    noAnalysis: "Projektet har endnu ingen analyse til generering af en rapport.",
    loading: "Indlæser rapport...",
    accessDenied: "Adgang nægtet",
    noAccess: "Du har ikke adgang til dette projekt",
    backReports: "Tilbage til rapporter",
    cannotCreate: "Rapporten kan ikke oprettes",
    missingData: "Nødvendige data mangler.",
    registry: "← Rapportregister",
    fieldRecord: "Marktilstandsrapport",
    printPdf: "Udskriv / Gem som PDF",
    reportTitle: "AEGRIS / Analytisk markrapport",
    cropUnknown: "Afgrøde ikke angivet",
    analysis: "Analyse",
    projectId: "Projekt-ID",
    decisionState: "Beslutningsstatus",
    score: "AEGRIS-score",
    risk: "Risiko",
    priority: "Prioritet",
    evaluation: "AEGRIS-vurdering",
    noSummary: "Ingen gemt oversigt.",
    noRecommendation: "Der er ingen gemt anbefaling for denne analyse.",
    dataReliability: "Datapålidelighed",
    source: "Kilde",
    resolution: "Opløsning",
    validPixels: "Gyldige pixels",
    validCoverage: "Gyldig dækning",
    qualityGate: "Quality gate min.",
    acceptedIntervals: "Accepterede intervaller",
    rejectedIntervals: "Afviste intervaller",
    medianNdvi: "Median-NDVI",
    weatherSnapshot: "Analysens vejr-snapshot",
    temperature: "Temperatur",
    humidity: "Luftfugtighed",
    precipitationLastHour: "Nedbør – seneste time",
    wind: "Vind",
    noWeather: "Der er ikke gemt et vejr-snapshot for denne historiske analyse.",
    ndviTrend: "NDVI-udvikling",
    intervalFrom: "Interval fra",
    intervalTo: "Interval til",
    noHistory: "NDVI-historik er ikke tilgængelig.",
    fieldContext: "Markkontekst",
    crop: "Afgrøde",
    variety: "Sort",
    area: "Areal",
    growthStage: "Vækststadium",
    locationPeriod: "Placering og periode",
    latitude: "Breddegrad",
    longitude: "Længdegrad",
    lastSentinel: "Seneste Sentinel-interval",
    disclaimer: "AEGRIS er et beslutningsstøttesystem. Satellit- og meteorologiske data er kilde-/beregnede data; AEGRIS-score, risiko, diagnostik og anbefalinger er modelvurderinger og erstatter ikke professionel markinspektion.",
    generated: "Rapport genereret",
  };

  const no = {
    unavailable: "Prosjektet finnes ikke, eller du har ikke tillatelse til å se det.",
    noAnalysis: "Prosjektet har ennå ingen analyse for å generere en rapport.",
    loading: "Laster rapport...",
    accessDenied: "Tilgang nektet",
    noAccess: "Du har ikke tilgang til dette prosjektet",
    backReports: "Tilbake til rapporter",
    cannotCreate: "Rapporten kan ikke opprettes",
    missingData: "Nødvendige data mangler.",
    registry: "← Rapportregister",
    fieldRecord: "Felttilstandsrapport",
    printPdf: "Skriv ut / Lagre som PDF",
    reportTitle: "AEGRIS / Analytisk feltrapport",
    cropUnknown: "Vekst ikke angitt",
    analysis: "Analyse",
    projectId: "Prosjekt-ID",
    decisionState: "Beslutningsstatus",
    score: "AEGRIS-score",
    risk: "Risiko",
    priority: "Prioritet",
    evaluation: "AEGRIS-vurdering",
    noSummary: "Ingen lagret oppsummering.",
    noRecommendation: "Ingen anbefaling er lagret for denne analysen.",
    dataReliability: "Datapålitelighet",
    source: "Kilde",
    resolution: "Oppløsning",
    validPixels: "Gyldige piksler",
    validCoverage: "Gyldig dekning",
    qualityGate: "Quality gate min.",
    acceptedIntervals: "Godkjente intervaller",
    rejectedIntervals: "Avviste intervaller",
    medianNdvi: "Median-NDVI",
    weatherSnapshot: "Analysens vær-snapshot",
    temperature: "Temperatur",
    humidity: "Luftfuktighet",
    precipitationLastHour: "Nedbør – siste time",
    wind: "Vind",
    noWeather: "Ingen vær-snapshot er lagret for denne historiske analysen.",
    ndviTrend: "NDVI-utvikling",
    intervalFrom: "Intervall fra",
    intervalTo: "Intervall til",
    noHistory: "NDVI-historikk er ikke tilgjengelig.",
    fieldContext: "Feltkontekst",
    crop: "Vekst",
    variety: "Sort",
    area: "Areal",
    growthStage: "Vekststadium",
    locationPeriod: "Sted og periode",
    latitude: "Breddegrad",
    longitude: "Lengdegrad",
    lastSentinel: "Siste Sentinel-intervall",
    disclaimer: "AEGRIS er et beslutningsstøttesystem. Satellitt- og meteorologiske data er kilde-/beregnede data; AEGRIS-score, risiko, diagnostikk og anbefalinger er modellvurderinger og erstatter ikke profesjonell feltinspeksjon.",
    generated: "Rapport generert",
  };

  const fi = {
    unavailable: "Projektia ei ole olemassa tai sinulla ei ole oikeutta tarkastella sitä.",
    noAnalysis: "Projektilla ei vielä ole raportin luomiseen tarvittavaa analyysiä.",
    loading: "Ladataan raporttia...",
    accessDenied: "Pääsy estetty",
    noAccess: "Sinulla ei ole pääsyä tähän projektiin",
    backReports: "Takaisin raportteihin",
    cannotCreate: "Raporttia ei voida luoda",
    missingData: "Tarvittavia tietoja puuttuu.",
    registry: "← Raporttirekisteri",
    fieldRecord: "Lohkon kuntotietue",
    printPdf: "Tulosta / Tallenna PDF:nä",
    reportTitle: "AEGRIS / Lohkon analyyttinen raportti",
    cropUnknown: "Kasvia ei määritetty",
    analysis: "Analyysi",
    projectId: "Projektin ID",
    decisionState: "Päätöksen tila",
    score: "AEGRIS-pisteet",
    risk: "Riski",
    priority: "Prioriteetti",
    evaluation: "AEGRIS-arviointi",
    noSummary: "Ei tallennettua yhteenvetoa.",
    noRecommendation: "Tälle analyysille ei ole tallennettua suositusta.",
    dataReliability: "Tietojen luotettavuus",
    source: "Lähde",
    resolution: "Resoluutio",
    validPixels: "Kelvolliset pikselit",
    validCoverage: "Kelvollinen kattavuus",
    qualityGate: "Quality gate min.",
    acceptedIntervals: "Hyväksytyt aikavälit",
    rejectedIntervals: "Hylätyt aikavälit",
    medianNdvi: "NDVI-mediaani",
    weatherSnapshot: "Analyysin sää-snapshot",
    temperature: "Lämpötila",
    humidity: "Kosteus",
    precipitationLastHour: "Sademäärä – viime tunti",
    wind: "Tuuli",
    noWeather: "Tälle historialliselle analyysille ei ole tallennettua sää-snapshotia.",
    ndviTrend: "NDVI-kehitys",
    intervalFrom: "Aikaväli alkaen",
    intervalTo: "Aikaväli asti",
    noHistory: "NDVI-historia ei ole saatavilla.",
    fieldContext: "Lohkon konteksti",
    crop: "Kasvi",
    variety: "Lajike",
    area: "Pinta-ala",
    growthStage: "Kasvuvaihe",
    locationPeriod: "Sijainti ja ajanjakso",
    latitude: "Leveysaste",
    longitude: "Pituusaste",
    lastSentinel: "Viimeisin Sentinel-aikaväli",
    disclaimer: "AEGRIS on päätöksenteon tukijärjestelmä. Satelliitti- ja meteorologiset tiedot ovat lähde-/laskennallisia tietoja; AEGRIS-pisteet, riski, diagnostiikka ja suositukset ovat malliarvioita eivätkä korvaa ammattimaista maastotarkastusta.",
    generated: "Raportti luotu",
  };

  const copies = { en, cs, sk, de, pl, fr, es, it, nl, pt, ro, hu, uk, bg, hr, sl, lt, lv, et, el, sv, da, no, fi } as const;
  return copies[language as keyof typeof copies] ?? copies.en;
}

const reportLocaleMap = {
  cs: "cs-CZ", en: "en-GB", sk: "sk-SK", de: "de-DE", pl: "pl-PL",
  fr: "fr-FR", es: "es-ES", it: "it-IT", nl: "nl-NL", pt: "pt-PT",
  ro: "ro-RO", hu: "hu-HU", uk: "uk-UA", bg: "bg-BG", hr: "hr-HR",
  sl: "sl-SI", lt: "lt-LT", lv: "lv-LV", et: "et-EE", el: "el-GR",
  sv: "sv-SE", da: "da-DK", no: "nb-NO", fi: "fi-FI",
} as const;

export default function ProjectReportPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getReportCopy(language);
  const locale = reportLocaleMap[language as keyof typeof reportLocaleMap] ?? "en-GB";

  const [project, setProject] = useState<Project | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [recommendation, setRecommendation] =
    useState<Recommendation | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  const projectId = Number(params.id);

  useEffect(() => {
    let active = true;

    async function loadReport() {
      if (!Number.isInteger(projectId) || projectId <= 0) {
        setAccessDenied(true);
        setErrorMessage(
          copy.unavailable
        );
        setLoading(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (userError || !user) {
        router.push("/login");
        return;
      }

      const {
        data: projectData,
        error: projectError,
      } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .maybeSingle();

      if (!active) return;

      if (projectError || !projectData) {
        if (projectError) {
          console.error(
            "CHYBA NAČTENÍ PROJEKTU PRO REPORT:",
            projectError
          );
        }

        setAccessDenied(true);
        setErrorMessage(
          copy.unavailable
        );
        setLoading(false);
        return;
      }

      const {
        data: analysisData,
        error: analysisError,
      } = await supabase
        .from("analysis")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) return;

      if (analysisError || !analysisData) {
        console.error("CHYBA NAČTENÍ ANALÝZY PRO REPORT:", analysisError);
        setErrorMessage(copy.noAnalysis);
        setLoading(false);
        return;
      }

      const {
        data: recommendationData,
        error: recommendationError,
      } = await supabase
        .from("aegris_recommendations")
        .select("*")
        .eq("project_id", projectId)
        .eq("analysis_id", analysisData.id)
        .maybeSingle();

      if (!active) return;

      if (recommendationError) {
        console.error(
          "CHYBA NAČTENÍ DOPORUČENÍ PRO REPORT:",
          recommendationError
        );
      }

      const {
        data: historyData,
        error: historyError,
      } = await supabase
        .from("ndvi_history")
        .select("period_from, period_to, ndvi, created_at")
        .eq("project_id", projectId)
        .order("period_from", { ascending: true });

      if (!active) return;

      if (historyError) {
        console.error("CHYBA NAČTENÍ NDVI HISTORIE PRO REPORT:", historyError);
      }

      setProject(projectData as Project);
      setAnalysis(analysisData as Analysis);
      setRecommendation(
        (recommendationData ?? null) as Recommendation | null
      );
      setHistory((historyData ?? []) as HistoryItem[]);
      setLoading(false);
    }

    void loadReport();

    return () => {
      active = false;
    };
  }, [projectId, router]);

  const latestHistory = useMemo(
    () => history.slice(-8),
    [history]
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030817] text-slate-400">
        {copy.loading}
      </main>
    );
  }

  if (accessDenied) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030817] px-4 text-white">
        <div className="w-full max-w-[540px] rounded-2xl border border-red-500/20 bg-[#071225] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-2xl font-black text-red-400">
            !
          </div>

          <div className="mt-5 text-[10px] font-black uppercase tracking-[0.25em] text-red-400">
            {copy.accessDenied}
          </div>

          <h1 className="mt-3 text-xl font-black text-white">
            {copy.noAccess}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {copy.unavailable}
          </p>

          <button
            type="button"
            onClick={() => router.push("/reports")}
            className="mt-6 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
          >
            {copy.backReports}
          </button>
        </div>
      </main>
    );
  }

  if (errorMessage || !project || !analysis) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030817] px-4 text-slate-100">
        <div className="max-w-lg rounded-2xl border border-red-500/20 bg-red-500/[0.03] p-6 text-center">
          <div className="font-black text-red-400">{copy.cannotCreate}</div>
          <div className="mt-2 text-sm text-slate-400">
            {errorMessage || copy.missingData}
          </div>
          <button
            type="button"
            onClick={() => router.push("/reports")}
            className="mt-5 rounded-lg border border-slate-700 px-4 py-2 text-sm font-bold"
          >
            {copy.backReports}
          </button>
        </div>
      </main>
    );
  }

  const weather = recommendation?.weather_snapshot ?? null;

  return (
    <main className="min-h-screen bg-[#05090d] px-4 py-5 text-slate-100 print:bg-white print:px-0 print:py-0 print:text-black">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            type="button"
            onClick={() => router.push("/reports")}
            className="rounded-xl border border-white/[0.07] bg-[#0a1016] px-4 py-2.5 text-[10px] font-bold text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-200"
          >
            {copy.registry}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => router.push(`/projects/${project.id}`)}
              className="rounded-xl border border-white/[0.07] bg-[#0a1016] px-4 py-2.5 text-[10px] font-bold text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-200"
            >
              {copy.fieldRecord}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl bg-cyan-300 px-4 py-2.5 text-[10px] font-black text-[#061015] transition hover:bg-cyan-200"
            >
              {copy.printPdf}
            </button>
          </div>
        </div>

        <article className="overflow-hidden rounded-[26px] border border-white/[0.07] bg-[#0a1016] shadow-2xl shadow-black/20 print:overflow-visible print:rounded-none print:border-0 print:bg-white print:shadow-none">
          <header className="border-b border-white/[0.07] px-6 py-6 sm:px-8 print:border-slate-300 print:px-0 print:py-0 print:pb-3">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.24em] text-cyan-300 print:text-black">
                  {copy.reportTitle}
                </div>
                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl print:text-2xl print:text-black">
                  {project.name}
                </h1>
                <p className="mt-2 text-[11px] text-slate-500 print:text-slate-600">
                  {project.crop_name ?? copy.cropUnknown}
                  {project.crop_variety ? ` · ${project.crop_variety}` : ""}
                  {project.area_ha != null ? ` · ${project.area_ha} ha` : ""}
                  {project.growth_stage ? ` · ${project.growth_stage}` : ""}
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-[#071017] px-4 py-3 text-[9px] leading-5 text-slate-600 md:text-right print:border-slate-300 print:bg-white print:text-slate-600">
                <div className="font-bold text-slate-400 print:text-black">
                  {copy.analysis} #{analysis.id}
                </div>
                <div>{new Date(analysis.created_at).toLocaleString(locale)}</div>
                <div>{copy.projectId} {project.id}</div>
              </div>
            </div>
          </header>

          <div className="px-6 py-6 sm:px-8 print:px-0 print:py-3">
            <section>
              <SectionTitle title={copy.decisionState} />
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:mt-2 print:grid-cols-4 print:gap-2">
                <ReportMetric label="NDVI" value={Number(analysis.ndvi).toFixed(3)} accent="cyan" />
                <ReportMetric
                  label={copy.score}
                  value={recommendation?.score != null ? `${recommendation.score} / 100` : "—"}
                  accent="amber"
                />
                <ReportMetric label={copy.risk} value={analysis.risk} />
                <ReportMetric label={copy.priority} value={recommendation?.priority ?? "—"} />
              </div>
            </section>

            <section className="mt-5 rounded-2xl border border-white/[0.07] bg-[#071017] p-5 print:mt-3 print:border-slate-300 print:bg-white print:p-3 print:break-inside-avoid">
              <SectionTitle title={copy.evaluation} />
              <h2 className="mt-3 text-xl font-black tracking-[-0.02em] text-white print:text-base print:text-black">
                {recommendation?.summary ?? copy.noSummary}
              </h2>
              <p className="mt-3 text-[11px] leading-6 text-slate-400 print:text-[8px] print:leading-4 print:text-slate-700">
                {recommendation?.recommendation ?? copy.noRecommendation}
              </p>

              {recommendation?.actions && recommendation.actions.length > 0 && (
                <div className="mt-4 grid gap-2">
                  {recommendation.actions.map((action, index) => (
                    <div
                      key={`${index}-${action}`}
                      className="flex gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-[11px] leading-5 text-slate-300 print:border-slate-200 print:bg-slate-50 print:p-2 print:text-[8px] print:leading-3 print:text-slate-800"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-300/[0.08] text-[9px] font-black text-cyan-300 print:bg-slate-100 print:text-black">
                        {index + 1}
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-5 print:mt-3">
              <SectionTitle title={copy.dataReliability} />
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:mt-2 print:grid-cols-4 print:gap-2">
                <ReportMetric
                  label={copy.source}
                  value={analysis.satellite_product ?? analysis.satellite ?? analysis.source_provider ?? "—"}
                  subvalue={analysis.source_provider ?? undefined}
                />
                <ReportMetric
                  label={copy.resolution}
                  value={analysis.spatial_resolution_m != null ? `${analysis.spatial_resolution_m} m` : "—"}
                  subvalue={analysis.analysis_crs ?? undefined}
                />
                <ReportMetric
                  label={copy.validPixels}
                  value={
                    analysis.valid_pixel_count != null && analysis.geometry_pixel_count != null
                      ? `${analysis.valid_pixel_count} / ${analysis.geometry_pixel_count}`
                      : "—"
                  }
                />
                <ReportMetric
                  label={copy.validCoverage}
                  value={
                    analysis.valid_geometry_pct != null
                      ? `${Number(analysis.valid_geometry_pct).toFixed(1)} %`
                      : "—"
                  }
                  subvalue={
                    analysis.quality_gate_pct != null
                      ? `${copy.qualityGate} ${analysis.quality_gate_pct} %`
                      : undefined
                  }
                  accent="green"
                />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:mt-2 print:grid-cols-4 print:gap-2">
                <ReportMetric label={copy.acceptedIntervals} value={String(analysis.accepted_intervals ?? "—")} />
                <ReportMetric label={copy.rejectedIntervals} value={String(analysis.rejected_intervals ?? "—")} />
                <ReportMetric
                  label={copy.medianNdvi}
                  value={analysis.median_ndvi != null ? Number(analysis.median_ndvi).toFixed(3) : "—"}
                />
                <ReportMetric
                  label="NDVI P05–P95"
                  value={
                    analysis.p05_ndvi != null && analysis.p95_ndvi != null
                      ? `${Number(analysis.p05_ndvi).toFixed(3)} – ${Number(analysis.p95_ndvi).toFixed(3)}`
                      : "—"
                  }
                />
              </div>
            </section>

            <section className="mt-5 print:mt-3">
              <SectionTitle title={copy.weatherSnapshot} />
              {weather ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:mt-2 print:grid-cols-4 print:gap-2">
                  <ReportMetric
                    label={copy.temperature}
                    value={weather.temperature_c != null ? `${weather.temperature_c.toFixed(1)} °C` : "—"}
                  />
                  <ReportMetric
                    label={copy.humidity}
                    value={weather.humidity_pct != null ? `${weather.humidity_pct.toFixed(0)} %` : "—"}
                  />
                  <ReportMetric
                    label={copy.precipitationLastHour}
                    value={weather.precipitation_mm != null ? `${weather.precipitation_mm.toFixed(1)} mm` : "—"}
                  />
                  <ReportMetric
                    label={copy.wind}
                    value={weather.wind_speed_kmh != null ? `${weather.wind_speed_kmh.toFixed(1)} km/h` : "—"}
                  />
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-white/[0.07] bg-[#071017] p-4 text-[10px] text-slate-600 print:border-slate-300 print:bg-white">
                  {copy.noWeather}
                </div>
              )}
            </section>

            <section className="mt-5 print:mt-3">
              <SectionTitle title={copy.ndviTrend} />
              {latestHistory.length > 0 ? (
                <div className="mt-3 overflow-hidden rounded-2xl border border-white/[0.07] print:mt-2 print:border-slate-300 print:break-inside-avoid">
                  <table className="w-full border-collapse text-left text-[10px]">
                    <thead className="bg-[#071017] text-[8px] font-black uppercase tracking-[0.12em] text-slate-600 print:bg-slate-100 print:text-slate-700">
                      <tr>
                        <th className="px-4 py-3">{copy.intervalFrom}</th>
                        <th className="px-4 py-3">{copy.intervalTo}</th>
                        <th className="px-4 py-3 text-right">NDVI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestHistory.map((item) => (
                        <tr
                          key={`${item.period_from}-${item.period_to}`}
                          className="border-t border-white/[0.05] print:border-slate-300"
                        >
                          <td className="px-4 py-3 text-slate-400 print:text-slate-700">
                            {new Date(item.period_from).toLocaleDateString(locale)}
                          </td>
                          <td className="px-4 py-3 text-slate-400 print:text-slate-700">
                            {new Date(item.period_to).toLocaleDateString(locale)}
                          </td>
                          <td className="px-4 py-3 text-right font-black text-cyan-300 print:text-black">
                            {Number(item.ndvi).toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-3 text-[10px] text-slate-600">{copy.noHistory}</div>
              )}
            </section>

            <section className="mt-5 grid gap-3 md:grid-cols-2 print:mt-3 print:grid-cols-2 print:gap-2">
              <div className="rounded-2xl border border-white/[0.07] bg-[#071017] p-5 print:border-slate-300 print:bg-white print:p-3 print:break-inside-avoid">
                <SectionTitle title={copy.fieldContext} />
                <ReportRow label={copy.crop} value={project.crop_name ?? "—"} />
                <ReportRow label={copy.variety} value={project.crop_variety ?? "—"} />
                <ReportRow label={copy.area} value={project.area_ha != null ? `${project.area_ha} ha` : "—"} />
                <ReportRow label={copy.growthStage} value={project.growth_stage ?? "—"} />
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-[#071017] p-5 print:border-slate-300 print:bg-white print:p-3 print:break-inside-avoid">
                <SectionTitle title={copy.locationPeriod} />
                <ReportRow label={copy.latitude} value={project.latitude.toFixed(6)} />
                <ReportRow label={copy.longitude} value={project.longitude.toFixed(6)} />
                <ReportRow
                  label={copy.lastSentinel}
                  value={
                    analysis.period_from && analysis.period_to
                      ? `${new Date(analysis.period_from).toLocaleDateString(locale)} – ${new Date(analysis.period_to).toLocaleDateString(locale)}`
                      : "—"
                  }
                />
              </div>
            </section>

            <footer className="mt-6 border-t border-white/[0.07] pt-4 text-[8px] leading-4 text-slate-700 print:mt-3 print:border-slate-300 print:pt-2 print:text-[7px] print:leading-3 print:text-slate-600 print:break-inside-avoid">
              <p>
                {copy.disclaimer}
              </p>
              <p className="mt-2">
                {copy.generated}: {new Date().toLocaleString(locale)}
              </p>
            </footer>
          </div>
        </article>
      </div>
    </main>
  );
}
function SectionTitle({ title }: { title: string }) {
  return (
    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300 print:text-black">
      {title}
    </div>
  );
}

function ReportMetric({
  label,
  value,
  subvalue,
  accent,
}: {
  label: string;
  value: string;
  subvalue?: string;
  accent?: "cyan" | "amber" | "green";
}) {
  const valueClass =
    accent === "cyan"
      ? "text-cyan-300"
      : accent === "amber"
        ? "text-amber-300"
        : accent === "green"
          ? "text-emerald-300"
          : "text-slate-100";

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#071017] p-4 print:border-slate-300 print:bg-white print:p-2.5 print:break-inside-avoid">
      <div className="text-[8px] uppercase tracking-[0.14em] text-slate-700 print:text-slate-600">
        {label}
      </div>
      <div className={`mt-1.5 text-base font-black ${valueClass} print:text-black`}>
        {value}
      </div>
      {subvalue && (
        <div className="mt-1 text-[8px] text-slate-600 print:text-slate-600">
          {subvalue}
        </div>
      )}
    </div>
  );
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2.5 flex items-start justify-between gap-4 border-b border-white/[0.05] pb-2.5 text-[10px] last:border-b-0 print:mt-1.5 print:border-slate-200 print:pb-1.5 print:text-[8px]">
      <span className="text-slate-600 print:text-slate-600">{label}</span>
      <span className="text-right font-bold text-slate-300 print:text-black">{value}</span>
    </div>
  );
}
