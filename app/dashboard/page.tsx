"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import NewProjectModal from "./components/NewProjectModal";
import { useLanguage } from "../context/LanguageContext";

function DashboardMapLoading() {
  const { language } = useLanguage();
  const copy = getDashboardCopy(language);

  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
      {copy.loadingMap}
    </div>
  );
}

const WorldMap = dynamic(() => import("./components/WorldMap"), {
  ssr: false,
  loading: () => <DashboardMapLoading />,
});

type Project = {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at?: string;
};

type AnalysisResult = {
  id?: number;
  ndvi: number;
  risk: string;
  created_at?: string;
  score?: number | null;
  priority?: string | null;
  valid_geometry_pct?: number | null;
  source_provider?: string | null;
  satellite_product?: string | null;
};

type DashboardCounts = {
  projects: number;
  analyses: number;
  reports: number;
  alerts: number;
  unreadAlerts: number;
  criticalProjects: number;
  pendingFieldValidations: number;
};

type FieldValidationResult =
  | "confirmed"
  | "partially_confirmed"
  | "not_confirmed";

type DashboardProject = Project & {
  latestAnalysis: AnalysisResult | null;
  latestRecommendation: {
    id: number;
    analysis_id: number | null;
    priority: string;
    score: number | null;
    created_at: string;
  } | null;
  latestFieldValidation: {
    id: number;
    analysis_id: number;
    validation_result: FieldValidationResult;
    actual_cause: string | null;
    observed_at: string;
    validated_by: string;
    updated_at: string;
  } | null;
  unreadAlerts: number;
};

function priorityWeight(priority?: string | null) {
  if (priority === "Kritická") return 4;
  if (priority === "Vysoká") return 3;
  if (priority === "Střední") return 2;
  if (priority === "Nízká") return 1;
  return 0;
}

function priorityTone(priority?: string | null) {
  if (priority === "Kritická") {
    return {
      text: "text-red-300",
      border: "border-red-500/30",
      bg: "bg-red-500/[0.08]",
      dot: "bg-red-400",
    };
  }

  if (priority === "Vysoká") {
    return {
      text: "text-orange-300",
      border: "border-orange-500/30",
      bg: "bg-orange-500/[0.08]",
      dot: "bg-orange-400",
    };
  }

  if (priority === "Střední") {
    return {
      text: "text-amber-300",
      border: "border-amber-500/30",
      bg: "bg-amber-500/[0.08]",
      dot: "bg-amber-400",
    };
  }

  if (priority === "Nízká") {
    return {
      text: "text-emerald-300",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/[0.08]",
      dot: "bg-emerald-400",
    };
  }

  return {
    text: "text-slate-300",
    border: "border-slate-700",
    bg: "bg-slate-800/40",
    dot: "bg-slate-500",
  };
}

function getDashboardCopy(language: string) {
  const en = {
    loadingMap: "Loading map...",
    noFieldSelected: "No field selected",
    validationConfirmed: "Confirmed in field",
    validationPartial: "Partially confirmed",
    validationNotConfirmed: "Not confirmed",
    validationPending: "Awaiting field verification",
    noProjectSelected: "No project selected.",
    navOverview: "Overview",
    navFields: "Fields",
    navMap: "Map",
    navReports: "Reports",
    navSettings: "Settings",
    logout: "Sign out",
    operationsSubtitle: "Crop monitoring and decision support",
    systemActive: "● SYSTEM ACTIVE",
    newField: "+ New field",
    hello: "Hello",
    attentionPrefix: "Today,",
    attentionSuffix: "fields require attention",
    intro: "AEGRIS ranks fields by the latest analysis, priority, unread alerts and field verification.",
    savedAnalyses: "saved analyses",
    critical: "Critical",
    immediateAttention: "immediate attention",
    highPriority: "High priority",
    requiresCheck: "requires review",
    stable: "Stable",
    lowMediumPriority: "low / medium priority",
    awaitingVerification: "Awaiting verification",
    priorityToday: "Today's priority",
    firstFields: "Fields that should be handled first",
    sorting: "Order: priority → alerts → latest analysis",
    prioritiesAfterAnalysis: "Priorities will appear after the first saved analysis.",
    analysis: "Analysis",
    priority: "Priority",
    score: "Score",
    noPriority: "No priority",
    alerts: "alerts",
    noNewAlerts: "No new alerts",
    open: "Open →",
    monitoring: "Monitoring",
    fieldMap: "Field map",
    fullMap: "Full map →",
    currentField: "Current field",
    aegrisScore: "AEGRIS score",
    fieldVerification: "Field verification",
    projectStatus: "Project status",
    coordinates: "Coordinates",
    openFieldDetail: "Open field detail →",
    latestStatus: "Latest status",
    latestAnalysis: "Latest analysis",
    notifications: "Alerts",
    unread: "unread",
    portfolio: "Portfolio",
    allFields: "All fields",
    addField: "+ Add field",
    noFields: "No fields have been created yet.",
    noAnalysis: "No analysis",
    status: "Status",
    edit: "Edit",
    detail: "Detail →",
    fieldSingular: "field",
    fieldPlural: "fields",
    analysisSingular: "analysis",
    analysisPlural: "analyses",
    field: "Field",
    editField: "Edit field",
    name: "Name",
    cancel: "Cancel",
    saveChanges: "Save changes",
    operationsCenter: "Agronomic Operations Center",
    groundTruthWorkflow: "Ground Truth workflow",
    brandSubtitle: "Agronomic Intelligence",
    brandFooter: "AEGRIS — Agronomic Intelligence Platform",
    latitude: "Latitude",
    longitude: "Longitude",
  };
  const cs = {
    loadingMap: "Načítám mapu...",
    noFieldSelected: "Žádný pozemek není vybrán",
    validationConfirmed: "Potvrzeno v terénu",
    validationPartial: "Částečně potvrzeno",
    validationNotConfirmed: "Nepotvrzeno",
    validationPending: "Čeká na terénní ověření",
    noProjectSelected: "Není vybrán žádný projekt.",
    navOverview: "Přehled",
    navFields: "Pozemky",
    navMap: "Mapa",
    navReports: "Reporty",
    navSettings: "Nastavení",
    logout: "Odhlásit se",
    operationsSubtitle: "Monitoring plodin a podpora rozhodování",
    systemActive: "● SYSTÉM AKTIVNÍ",
    newField: "+ Nový pozemek",
    hello: "Dobrý den",
    attentionPrefix: "Dnes vyžadují pozornost",
    attentionSuffix: "pozemky",
    intro: "AEGRIS řadí pozemky podle poslední analýzy, priority, nepřečtených upozornění a terénního ověření.",
    savedAnalyses: "uložených analýz",
    critical: "Kritické",
    immediateAttention: "okamžitá pozornost",
    highPriority: "Vysoká priorita",
    requiresCheck: "vyžaduje kontrolu",
    stable: "Stabilní",
    lowMediumPriority: "nízká / střední priorita",
    awaitingVerification: "Čeká na ověření",
    priorityToday: "Dnešní priorita",
    firstFields: "Pozemky, které je třeba řešit jako první",
    sorting: "Řazení: priorita → upozornění → poslední analýza",
    prioritiesAfterAnalysis: "Priority se zobrazí po první uložené analýze.",
    analysis: "Analýza",
    priority: "Priorita",
    score: "Skóre",
    noPriority: "Bez priority",
    alerts: "upozornění",
    noNewAlerts: "Žádná nová upozornění",
    open: "Otevřít →",
    monitoring: "Monitoring",
    fieldMap: "Mapa pozemků",
    fullMap: "Celá mapa →",
    currentField: "Aktuální pozemek",
    aegrisScore: "AEGRIS skóre",
    fieldVerification: "Terénní ověření",
    projectStatus: "Stav projektu",
    coordinates: "Souřadnice",
    openFieldDetail: "Otevřít detail pozemku →",
    latestStatus: "Poslední stav",
    latestAnalysis: "Poslední analýza",
    notifications: "Upozornění",
    unread: "nepřečtených",
    portfolio: "Portfolio",
    allFields: "Všechny pozemky",
    addField: "+ Přidat pozemek",
    noFields: "Zatím nebyly vytvořeny žádné pozemky.",
    noAnalysis: "Bez analýzy",
    status: "Stav",
    edit: "Upravit",
    detail: "Detail →",
    fieldSingular: "pozemek",
    fieldPlural: "pozemků",
    analysisSingular: "analýza",
    analysisPlural: "analýz",
    field: "Pozemek",
    editField: "Upravit pozemek",
    name: "Název",
    cancel: "Zrušit",
    saveChanges: "Uložit změny",
    operationsCenter: "Agronomické operační centrum",
    groundTruthWorkflow: "Terénní ověřování Ground Truth",
    brandSubtitle: "Agronomická inteligence",
    brandFooter: "AEGRIS — Platforma agronomické inteligence",
    latitude: "Zeměpisná šířka",
    longitude: "Zeměpisná délka",
  };
  const sk = {
    loadingMap: "Načítavam mapu...",
    noFieldSelected: "Žiadny pozemok nie je vybraný",
    validationConfirmed: "Potvrdené v teréne",
    validationPartial: "Čiastočne potvrdené",
    validationNotConfirmed: "Nepotvrdené",
    validationPending: "Čaká na terénne overenie",
    noProjectSelected: "Nie je vybraný žiadny projekt.",
    navOverview: "Prehľad",
    navFields: "Pozemky",
    navMap: "Mapa",
    navReports: "Reporty",
    navSettings: "Nastavenia",
    logout: "Odhlásiť sa",
    operationsSubtitle: "Monitoring plodín a podpora rozhodovania",
    systemActive: "● SYSTÉM AKTÍVNY",
    newField: "+ Nový pozemok",
    hello: "Dobrý deň",
    attentionPrefix: "Dnes vyžadujú pozornosť",
    attentionSuffix: "pozemky",
    intro: "AEGRIS radí pozemky podľa poslednej analýzy, priority, neprečítaných upozornení a terénneho overenia.",
    savedAnalyses: "uložených analýz",
    critical: "Kritické",
    immediateAttention: "okamžitá pozornosť",
    highPriority: "Vysoká priorita",
    requiresCheck: "vyžaduje kontrolu",
    stable: "Stabilné",
    lowMediumPriority: "nízka / stredná priorita",
    awaitingVerification: "Čaká na overenie",
    priorityToday: "Dnešná priorita",
    firstFields: "Pozemky, ktoré treba riešiť ako prvé",
    sorting: "Poradie: priorita → upozornenia → posledná analýza",
    prioritiesAfterAnalysis: "Priority sa zobrazia po prvej uloženej analýze.",
    analysis: "Analýza",
    priority: "Priorita",
    score: "Skóre",
    noPriority: "Bez priority",
    alerts: "upozornenia",
    noNewAlerts: "Žiadne nové upozornenia",
    open: "Otvoriť →",
    monitoring: "Monitoring",
    fieldMap: "Mapa pozemkov",
    fullMap: "Celá mapa →",
    currentField: "Aktuálny pozemok",
    aegrisScore: "AEGRIS skóre",
    fieldVerification: "Terénne overenie",
    projectStatus: "Stav projektu",
    coordinates: "Súradnice",
    openFieldDetail: "Otvoriť detail pozemku →",
    latestStatus: "Posledný stav",
    latestAnalysis: "Posledná analýza",
    notifications: "Upozornenia",
    unread: "neprečítané",
    portfolio: "Portfólio",
    allFields: "Všetky pozemky",
    addField: "+ Pridať pozemok",
    noFields: "Zatiaľ neboli vytvorené žiadne pozemky.",
    noAnalysis: "Bez analýzy",
    status: "Stav",
    edit: "Upraviť",
    detail: "Detail →",
    fieldSingular: "pozemok",
    fieldPlural: "pozemky",
    analysisSingular: "analýza",
    analysisPlural: "analýzy",
    field: "Pozemok",
    editField: "Upraviť pozemok",
    name: "Názov",
    cancel: "Zrušiť",
    saveChanges: "Uložiť zmeny",
    operationsCenter: "Agronomické operačné centrum",
    groundTruthWorkflow: "Terénne overovanie Ground Truth",
    brandSubtitle: "Agronomická inteligencia",
    brandFooter: "AEGRIS — Platforma agronomickej inteligencie",
    latitude: "Zemepisná šírka",
    longitude: "Zemepisná dĺžka",
  };
  const de = {
    loadingMap: "Karte wird geladen...",
    noFieldSelected: "Kein Feld ausgewählt",
    validationConfirmed: "Im Feld bestätigt",
    validationPartial: "Teilweise bestätigt",
    validationNotConfirmed: "Nicht bestätigt",
    validationPending: "Wartet auf Feldprüfung",
    noProjectSelected: "Kein Projekt ausgewählt.",
    navOverview: "Übersicht",
    navFields: "Felder",
    navMap: "Karte",
    navReports: "Berichte",
    navSettings: "Einstellungen",
    logout: "Abmelden",
    operationsSubtitle: "Pflanzenmonitoring und Entscheidungsunterstützung",
    systemActive: "● SYSTEM AKTIV",
    newField: "+ Neues Feld",
    hello: "Hallo",
    attentionPrefix: "Heute benötigen",
    attentionSuffix: "Felder Aufmerksamkeit",
    intro: "AEGRIS priorisiert Felder nach letzter Analyse, Priorität, ungelesenen Warnungen und Feldprüfung.",
    savedAnalyses: "gespeicherte Analysen",
    critical: "Kritisch",
    immediateAttention: "sofortige Aufmerksamkeit",
    highPriority: "Hohe Priorität",
    requiresCheck: "Prüfung erforderlich",
    stable: "Stabil",
    lowMediumPriority: "niedrige / mittlere Priorität",
    awaitingVerification: "Wartet auf Prüfung",
    priorityToday: "Heutige Priorität",
    firstFields: "Felder, die zuerst bearbeitet werden sollten",
    sorting: "Reihenfolge: Priorität → Warnungen → letzte Analyse",
    prioritiesAfterAnalysis: "Prioritäten erscheinen nach der ersten gespeicherten Analyse.",
    analysis: "Analyse",
    priority: "Priorität",
    score: "Punktzahl",
    noPriority: "Keine Priorität",
    alerts: "Warnungen",
    noNewAlerts: "Keine neuen Warnungen",
    open: "Öffnen →",
    monitoring: "Monitoring",
    fieldMap: "Feldkarte",
    fullMap: "Gesamte Karte →",
    currentField: "Aktuelles Feld",
    aegrisScore: "AEGRIS-Punktzahl",
    fieldVerification: "Feldprüfung",
    projectStatus: "Projektstatus",
    coordinates: "Koordinaten",
    openFieldDetail: "Felddetail öffnen →",
    latestStatus: "Letzter Status",
    latestAnalysis: "Letzte Analyse",
    notifications: "Warnungen",
    unread: "ungelesen",
    portfolio: "Portfolio",
    allFields: "Alle Felder",
    addField: "+ Feld hinzufügen",
    noFields: "Es wurden noch keine Felder angelegt.",
    noAnalysis: "Keine Analyse",
    status: "Status",
    edit: "Bearbeiten",
    detail: "Detail →",
    fieldSingular: "Feld",
    fieldPlural: "Felder",
    analysisSingular: "Analyse",
    analysisPlural: "Analysen",
    field: "Feld",
    editField: "Feld bearbeiten",
    name: "Name",
    cancel: "Abbrechen",
    saveChanges: "Änderungen speichern",
    operationsCenter: "Agronomisches Operationszentrum",
    groundTruthWorkflow: "Ground-Truth-Arbeitsablauf",
    brandSubtitle: "Agronomische Intelligenz",
    brandFooter: "AEGRIS — Plattform für agronomische Intelligenz",
    latitude: "Breitengrad",
    longitude: "Längengrad",
  };
  const pl = {
    loadingMap: "Ładowanie mapy...",
    noFieldSelected: "Nie wybrano pola",
    validationConfirmed: "Potwierdzono w terenie",
    validationPartial: "Częściowo potwierdzono",
    validationNotConfirmed: "Nie potwierdzono",
    validationPending: "Oczekuje na weryfikację w terenie",
    noProjectSelected: "Nie wybrano projektu.",
    navOverview: "Przegląd",
    navFields: "Pola",
    navMap: "Mapa",
    navReports: "Raporty",
    navSettings: "Ustawienia",
    logout: "Wyloguj",
    operationsSubtitle: "Monitoring upraw i wsparcie decyzji",
    systemActive: "● SYSTEM AKTYWNY",
    newField: "+ Nowe pole",
    hello: "Dzień dobry",
    attentionPrefix: "Dziś uwagi wymagają",
    attentionSuffix: "pola",
    intro: "AEGRIS szereguje pola według najnowszej analizy, priorytetu, nieprzeczytanych alertów i weryfikacji terenowej.",
    savedAnalyses: "zapisanych analiz",
    critical: "Krytyczne",
    immediateAttention: "natychmiastowa uwaga",
    highPriority: "Wysoki priorytet",
    requiresCheck: "wymaga kontroli",
    stable: "Stabilne",
    lowMediumPriority: "niski / średni priorytet",
    awaitingVerification: "Oczekuje na weryfikację",
    priorityToday: "Dzisiejszy priorytet",
    firstFields: "Pola, którymi należy zająć się w pierwszej kolejności",
    sorting: "Kolejność: priorytet → alerty → najnowsza analiza",
    prioritiesAfterAnalysis: "Priorytety pojawią się po pierwszej zapisanej analizie.",
    analysis: "Analiza",
    priority: "Priorytet",
    score: "Wynik",
    noPriority: "Brak priorytetu",
    alerts: "alerty",
    noNewAlerts: "Brak nowych alertów",
    open: "Otwórz →",
    monitoring: "Monitoring",
    fieldMap: "Mapa pól",
    fullMap: "Pełna mapa →",
    currentField: "Bieżące pole",
    aegrisScore: "Wynik AEGRIS",
    fieldVerification: "Weryfikacja terenowa",
    projectStatus: "Status projektu",
    coordinates: "Współrzędne",
    openFieldDetail: "Otwórz szczegóły pola →",
    latestStatus: "Najnowszy status",
    latestAnalysis: "Najnowsza analiza",
    notifications: "Alerty",
    unread: "nieprzeczytane",
    portfolio: "Portfolio",
    allFields: "Wszystkie pola",
    addField: "+ Dodaj pole",
    noFields: "Nie utworzono jeszcze żadnych pól.",
    noAnalysis: "Brak analizy",
    status: "Status",
    edit: "Edytuj",
    detail: "Szczegóły →",
    fieldSingular: "pole",
    fieldPlural: "pola",
    analysisSingular: "analiza",
    analysisPlural: "analizy",
    field: "Pole",
    editField: "Edytuj pole",
    name: "Nazwa",
    cancel: "Anuluj",
    saveChanges: "Zapisz zmiany",
    operationsCenter: "Centrum operacji agronomicznych",
    groundTruthWorkflow: "Proces weryfikacji Ground Truth",
    brandSubtitle: "Inteligencja agronomiczna",
    brandFooter: "AEGRIS — Platforma inteligencji agronomicznej",
    latitude: "Szerokość geograficzna",
    longitude: "Długość geograficzna",
  };
  const fr = {
    loadingMap: "Chargement de la carte...",
    noFieldSelected: "Aucune parcelle sélectionnée",
    validationConfirmed: "Confirmé sur le terrain",
    validationPartial: "Partiellement confirmé",
    validationNotConfirmed: "Non confirmé",
    validationPending: "En attente de vérification sur le terrain",
    noProjectSelected: "Aucun projet sélectionné.",
    navOverview: "Vue d’ensemble",
    navFields: "Parcelles",
    navMap: "Carte",
    navReports: "Rapports",
    navSettings: "Paramètres",
    logout: "Se déconnecter",
    operationsSubtitle: "Suivi des cultures et aide à la décision",
    systemActive: "● SYSTÈME ACTIF",
    newField: "+ Nouvelle parcelle",
    hello: "Bonjour",
    attentionPrefix: "Aujourd’hui,",
    attentionSuffix: "parcelles nécessitent une attention",
    intro: "AEGRIS classe les parcelles selon la dernière analyse, la priorité, les alertes non lues et la vérification terrain.",
    savedAnalyses: "analyses enregistrées",
    critical: "Critique",
    immediateAttention: "attention immédiate",
    highPriority: "Priorité élevée",
    requiresCheck: "nécessite une vérification",
    stable: "Stable",
    lowMediumPriority: "priorité faible / moyenne",
    awaitingVerification: "En attente de vérification",
    priorityToday: "Priorité du jour",
    firstFields: "Parcelles à traiter en premier",
    sorting: "Ordre : priorité → alertes → dernière analyse",
    prioritiesAfterAnalysis: "Les priorités apparaîtront après la première analyse enregistrée.",
    analysis: "Analyse",
    priority: "Priorité",
    score: "Score",
    noPriority: "Sans priorité",
    alerts: "alertes",
    noNewAlerts: "Aucune nouvelle alerte",
    open: "Ouvrir →",
    monitoring: "Suivi",
    fieldMap: "Carte des parcelles",
    fullMap: "Carte complète →",
    currentField: "Parcelle actuelle",
    aegrisScore: "Score AEGRIS",
    fieldVerification: "Vérification terrain",
    projectStatus: "Statut du projet",
    coordinates: "Coordonnées",
    openFieldDetail: "Ouvrir le détail de la parcelle →",
    latestStatus: "Dernier statut",
    latestAnalysis: "Dernière analyse",
    notifications: "Alertes",
    unread: "non lues",
    portfolio: "Portefeuille",
    allFields: "Toutes les parcelles",
    addField: "+ Ajouter une parcelle",
    noFields: "Aucune parcelle n’a encore été créée.",
    noAnalysis: "Aucune analyse",
    status: "Statut",
    edit: "Modifier",
    detail: "Détail →",
    fieldSingular: "parcelle",
    fieldPlural: "parcelles",
    analysisSingular: "analyse",
    analysisPlural: "analyses",
    field: "Parcelle",
    editField: "Modifier la parcelle",
    name: "Nom",
    cancel: "Annuler",
    saveChanges: "Enregistrer",
    operationsCenter: "Centre des opérations agronomiques",
    groundTruthWorkflow: "Processus Ground Truth",
    brandSubtitle: "Intelligence agronomique",
    brandFooter: "AEGRIS — Plateforme d’intelligence agronomique",
    latitude: "Latitude",
    longitude: "Longitude",
  };
  const es = {
    loadingMap: "Cargando mapa...",
    noFieldSelected: "No hay ningún campo seleccionado",
    validationConfirmed: "Confirmado en campo",
    validationPartial: "Confirmado parcialmente",
    validationNotConfirmed: "No confirmado",
    validationPending: "Pendiente de verificación en campo",
    noProjectSelected: "No hay ningún proyecto seleccionado.",
    navOverview: "Resumen",
    navFields: "Campos",
    navMap: "Mapa",
    navReports: "Informes",
    navSettings: "Configuración",
    logout: "Cerrar sesión",
    operationsSubtitle: "Monitorización de cultivos y apoyo a la toma de decisiones",
    systemActive: "● SISTEMA ACTIVO",
    newField: "+ Nuevo campo",
    hello: "Hola",
    attentionPrefix: "Hoy,",
    attentionSuffix: "campos requieren atención",
    intro: "AEGRIS ordena los campos según el último análisis, la prioridad, las alertas no leídas y la verificación en campo.",
    savedAnalyses: "análisis guardados",
    critical: "Crítico",
    immediateAttention: "atención inmediata",
    highPriority: "Prioridad alta",
    requiresCheck: "requiere revisión",
    stable: "Estable",
    lowMediumPriority: "prioridad baja / media",
    awaitingVerification: "Pendiente de verificación",
    priorityToday: "Prioridad de hoy",
    firstFields: "Campos que deben atenderse primero",
    sorting: "Orden: prioridad → alertas → último análisis",
    prioritiesAfterAnalysis: "Las prioridades aparecerán después del primer análisis guardado.",
    analysis: "Análisis",
    priority: "Prioridad",
    score: "Puntuación",
    noPriority: "Sin prioridad",
    alerts: "alertas",
    noNewAlerts: "Sin alertas nuevas",
    open: "Abrir →",
    monitoring: "Monitorización",
    fieldMap: "Mapa de campos",
    fullMap: "Mapa completo →",
    currentField: "Campo actual",
    aegrisScore: "Puntuación AEGRIS",
    fieldVerification: "Verificación en campo",
    projectStatus: "Estado del proyecto",
    coordinates: "Coordenadas",
    openFieldDetail: "Abrir detalle del campo →",
    latestStatus: "Último estado",
    latestAnalysis: "Último análisis",
    notifications: "Alertas",
    unread: "no leídas",
    portfolio: "Cartera",
    allFields: "Todos los campos",
    addField: "+ Añadir campo",
    noFields: "Todavía no se ha creado ningún campo.",
    noAnalysis: "Sin análisis",
    status: "Estado",
    edit: "Editar",
    detail: "Detalle →",
    fieldSingular: "campo",
    fieldPlural: "campos",
    analysisSingular: "análisis",
    analysisPlural: "análisis",
    field: "Campo",
    editField: "Editar campo",
    name: "Nombre",
    cancel: "Cancelar",
    saveChanges: "Guardar cambios",
    operationsCenter: "Centro de operaciones agronómicas",
    groundTruthWorkflow: "Flujo de trabajo Ground Truth",
    brandSubtitle: "Inteligencia agronómica",
    brandFooter: "AEGRIS — Plataforma de inteligencia agronómica",
    latitude: "Latitud",
    longitude: "Longitud",
  };
  const it = {
    loadingMap: "Caricamento mappa...",
    noFieldSelected: "Nessun campo selezionato",
    validationConfirmed: "Confermato in campo",
    validationPartial: "Parzialmente confermato",
    validationNotConfirmed: "Non confermato",
    validationPending: "In attesa di verifica in campo",
    noProjectSelected: "Nessun progetto selezionato.",
    navOverview: "Panoramica",
    navFields: "Campi",
    navMap: "Mappa",
    navReports: "Report",
    navSettings: "Impostazioni",
    logout: "Esci",
    operationsSubtitle: "Monitoraggio delle colture e supporto decisionale",
    systemActive: "● SISTEMA ATTIVO",
    newField: "+ Nuovo campo",
    hello: "Buongiorno",
    attentionPrefix: "Oggi,",
    attentionSuffix: "campi richiedono attenzione",
    intro: "AEGRIS ordina i campi in base all’ultima analisi, alla priorità, agli avvisi non letti e alla verifica in campo.",
    savedAnalyses: "analisi salvate",
    critical: "Critico",
    immediateAttention: "attenzione immediata",
    highPriority: "Priorità alta",
    requiresCheck: "richiede verifica",
    stable: "Stabile",
    lowMediumPriority: "priorità bassa / media",
    awaitingVerification: "In attesa di verifica",
    priorityToday: "Priorità di oggi",
    firstFields: "Campi da gestire per primi",
    sorting: "Ordine: priorità → avvisi → ultima analisi",
    prioritiesAfterAnalysis: "Le priorità compariranno dopo la prima analisi salvata.",
    analysis: "Analisi",
    priority: "Priorità",
    score: "Punteggio",
    noPriority: "Nessuna priorità",
    alerts: "avvisi",
    noNewAlerts: "Nessun nuovo avviso",
    open: "Apri →",
    monitoring: "Monitoraggio",
    fieldMap: "Mappa dei campi",
    fullMap: "Mappa completa →",
    currentField: "Campo attuale",
    aegrisScore: "Punteggio AEGRIS",
    fieldVerification: "Verifica in campo",
    projectStatus: "Stato del progetto",
    coordinates: "Coordinate",
    openFieldDetail: "Apri dettaglio del campo →",
    latestStatus: "Ultimo stato",
    latestAnalysis: "Ultima analisi",
    notifications: "Avvisi",
    unread: "non letti",
    portfolio: "Portafoglio",
    allFields: "Tutti i campi",
    addField: "+ Aggiungi campo",
    noFields: "Non è stato ancora creato alcun campo.",
    noAnalysis: "Nessuna analisi",
    status: "Stato",
    edit: "Modifica",
    detail: "Dettaglio →",
    fieldSingular: "campo",
    fieldPlural: "campi",
    analysisSingular: "analisi",
    analysisPlural: "analisi",
    field: "Campo",
    editField: "Modifica campo",
    name: "Nome",
    cancel: "Annulla",
    saveChanges: "Salva modifiche",
    operationsCenter: "Centro operativo agronomico",
    groundTruthWorkflow: "Flusso di lavoro Ground Truth",
    brandSubtitle: "Intelligenza agronomica",
    brandFooter: "AEGRIS — Piattaforma di intelligenza agronomica",
    latitude: "Latitudine",
    longitude: "Longitudine",
  };
  const nl = {
    loadingMap: "Kaart laden...",
    noFieldSelected: "Geen perceel geselecteerd",
    validationConfirmed: "In het veld bevestigd",
    validationPartial: "Gedeeltelijk bevestigd",
    validationNotConfirmed: "Niet bevestigd",
    validationPending: "Wacht op veldverificatie",
    noProjectSelected: "Geen project geselecteerd.",
    navOverview: "Overzicht",
    navFields: "Velden",
    navMap: "Kaart",
    navReports: "Rapporten",
    navSettings: "Instellingen",
    logout: "Afmelden",
    operationsSubtitle: "Gewasmonitoring en beslissingsondersteuning",
    systemActive: "● SYSTEEM ACTIEF",
    newField: "+ Nieuw perceel",
    hello: "Hallo",
    attentionPrefix: "Vandaag vragen",
    attentionSuffix: "percelen aandacht",
    intro: "AEGRIS rangschikt percelen op basis van de laatste analyse, prioriteit, ongelezen meldingen en veldverificatie.",
    savedAnalyses: "opgeslagen analyses",
    critical: "Kritiek",
    immediateAttention: "directe aandacht",
    highPriority: "Hoge prioriteit",
    requiresCheck: "vereist controle",
    stable: "Stabiel",
    lowMediumPriority: "lage / middelhoge prioriteit",
    awaitingVerification: "Wacht op verificatie",
    priorityToday: "Prioriteit van vandaag",
    firstFields: "Percelen die eerst moeten worden behandeld",
    sorting: "Volgorde: prioriteit → meldingen → laatste analyse",
    prioritiesAfterAnalysis: "Prioriteiten verschijnen na de eerste opgeslagen analyse.",
    analysis: "Analyse",
    priority: "Prioriteit",
    score: "Score",
    noPriority: "Geen prioriteit",
    alerts: "meldingen",
    noNewAlerts: "Geen nieuwe meldingen",
    open: "Openen →",
    monitoring: "Monitoring",
    fieldMap: "Percelenkaart",
    fullMap: "Volledige kaart →",
    currentField: "Huidig perceel",
    aegrisScore: "AEGRIS-score",
    fieldVerification: "Veldverificatie",
    projectStatus: "Projectstatus",
    coordinates: "Coördinaten",
    openFieldDetail: "Perceeldetail openen →",
    latestStatus: "Laatste status",
    latestAnalysis: "Laatste analyse",
    notifications: "Meldingen",
    unread: "ongelezen",
    portfolio: "Portefeuille",
    allFields: "Alle percelen",
    addField: "+ Perceel toevoegen",
    noFields: "Er zijn nog geen percelen aangemaakt.",
    noAnalysis: "Geen analyse",
    status: "Status",
    edit: "Bewerken",
    detail: "Detail →",
    fieldSingular: "perceel",
    fieldPlural: "percelen",
    analysisSingular: "analyse",
    analysisPlural: "analyses",
    field: "Perceel",
    editField: "Perceel bewerken",
    name: "Naam",
    cancel: "Annuleren",
    saveChanges: "Wijzigingen opslaan",
    operationsCenter: "Agronomisch operatiecentrum",
    groundTruthWorkflow: "Ground Truth-workflow",
    brandSubtitle: "Agronomische intelligentie",
    brandFooter: "AEGRIS — Platform voor agronomische intelligentie",
    latitude: "Breedtegraad",
    longitude: "Lengtegraad",
  };
  const pt = {
    loadingMap: "A carregar mapa...",
    noFieldSelected: "Nenhum campo selecionado",
    validationConfirmed: "Confirmado no terreno",
    validationPartial: "Parcialmente confirmado",
    validationNotConfirmed: "Não confirmado",
    validationPending: "A aguardar verificação no terreno",
    noProjectSelected: "Nenhum projeto selecionado.",
    navOverview: "Visão geral",
    navFields: "Campos",
    navMap: "Mapa",
    navReports: "Relatórios",
    navSettings: "Definições",
    logout: "Terminar sessão",
    operationsSubtitle: "Monitorização de culturas e apoio à decisão",
    systemActive: "● SISTEMA ATIVO",
    newField: "+ Novo campo",
    hello: "Olá",
    attentionPrefix: "Hoje,",
    attentionSuffix: "campos requerem atenção",
    intro: "O AEGRIS ordena os campos pela análise mais recente, prioridade, alertas não lidos e verificação no terreno.",
    savedAnalyses: "análises guardadas",
    critical: "Crítico",
    immediateAttention: "atenção imediata",
    highPriority: "Prioridade alta",
    requiresCheck: "requer verificação",
    stable: "Estável",
    lowMediumPriority: "prioridade baixa / média",
    awaitingVerification: "A aguardar verificação",
    priorityToday: "Prioridade de hoje",
    firstFields: "Campos que devem ser tratados primeiro",
    sorting: "Ordem: prioridade → alertas → análise mais recente",
    prioritiesAfterAnalysis: "As prioridades surgirão após a primeira análise guardada.",
    analysis: "Análise",
    priority: "Prioridade",
    score: "Pontuação",
    noPriority: "Sem prioridade",
    alerts: "alertas",
    noNewAlerts: "Sem novos alertas",
    open: "Abrir →",
    monitoring: "Monitorização",
    fieldMap: "Mapa dos campos",
    fullMap: "Mapa completo →",
    currentField: "Campo atual",
    aegrisScore: "Pontuação AEGRIS",
    fieldVerification: "Verificação no terreno",
    projectStatus: "Estado do projeto",
    coordinates: "Coordenadas",
    openFieldDetail: "Abrir detalhe do campo →",
    latestStatus: "Estado mais recente",
    latestAnalysis: "Análise mais recente",
    notifications: "Alertas",
    unread: "não lidos",
    portfolio: "Portefólio",
    allFields: "Todos os campos",
    addField: "+ Adicionar campo",
    noFields: "Ainda não foram criados campos.",
    noAnalysis: "Sem análise",
    status: "Estado",
    edit: "Editar",
    detail: "Detalhe →",
    fieldSingular: "campo",
    fieldPlural: "campos",
    analysisSingular: "análise",
    analysisPlural: "análises",
    field: "Campo",
    editField: "Editar campo",
    name: "Nome",
    cancel: "Cancelar",
    saveChanges: "Guardar alterações",
    operationsCenter: "Centro de operações agronómicas",
    groundTruthWorkflow: "Fluxo de trabalho Ground Truth",
    brandSubtitle: "Inteligência agronómica",
    brandFooter: "AEGRIS — Plataforma de inteligência agronómica",
    latitude: "Latitude",
    longitude: "Longitude",
  };
  const ro = {
    loadingMap: "Se încarcă harta...",
    noFieldSelected: "Nicio parcelă selectată",
    validationConfirmed: "Confirmat în teren",
    validationPartial: "Confirmat parțial",
    validationNotConfirmed: "Neconfirmat",
    validationPending: "În așteptarea verificării în teren",
    noProjectSelected: "Niciun proiect selectat.",
    navOverview: "Prezentare generală",
    navFields: "Parcelele",
    navMap: "Hartă",
    navReports: "Rapoarte",
    navSettings: "Setări",
    logout: "Deconectare",
    operationsSubtitle: "Monitorizarea culturilor și suport decizional",
    systemActive: "● SISTEM ACTIV",
    newField: "+ Parcelă nouă",
    hello: "Bună ziua",
    attentionPrefix: "Astăzi,",
    attentionSuffix: "parcele necesită atenție",
    intro: "AEGRIS ordonează parcelele după cea mai recentă analiză, prioritate, alerte necitite și verificarea în teren.",
    savedAnalyses: "analize salvate",
    critical: "Critic",
    immediateAttention: "atenție imediată",
    highPriority: "Prioritate ridicată",
    requiresCheck: "necesită verificare",
    stable: "Stabil",
    lowMediumPriority: "prioritate scăzută / medie",
    awaitingVerification: "În așteptarea verificării",
    priorityToday: "Prioritatea de azi",
    firstFields: "Parcelele care trebuie gestionate primele",
    sorting: "Ordine: prioritate → alerte → ultima analiză",
    prioritiesAfterAnalysis: "Prioritățile vor apărea după prima analiză salvată.",
    analysis: "Analiză",
    priority: "Prioritate",
    score: "Scor",
    noPriority: "Fără prioritate",
    alerts: "alerte",
    noNewAlerts: "Fără alerte noi",
    open: "Deschide →",
    monitoring: "Monitorizare",
    fieldMap: "Harta parcelelor",
    fullMap: "Hartă completă →",
    currentField: "Parcela curentă",
    aegrisScore: "Scor AEGRIS",
    fieldVerification: "Verificare în teren",
    projectStatus: "Starea proiectului",
    coordinates: "Coordonate",
    openFieldDetail: "Deschide detaliul parcelei →",
    latestStatus: "Ultima stare",
    latestAnalysis: "Ultima analiză",
    notifications: "Alerte",
    unread: "necitite",
    portfolio: "Portofoliu",
    allFields: "Toate parcelele",
    addField: "+ Adaugă parcelă",
    noFields: "Nu a fost creată încă nicio parcelă.",
    noAnalysis: "Fără analiză",
    status: "Stare",
    edit: "Editare",
    detail: "Detalii →",
    fieldSingular: "parcelă",
    fieldPlural: "parcele",
    analysisSingular: "analiză",
    analysisPlural: "analize",
    field: "Parcelă",
    editField: "Editează parcela",
    name: "Nume",
    cancel: "Anulare",
    saveChanges: "Salvați modificările",
    operationsCenter: "Centru de operațiuni agronomice",
    groundTruthWorkflow: "Flux Ground Truth",
    brandSubtitle: "Inteligență agronomică",
    brandFooter: "AEGRIS — Platformă de inteligență agronomică",
    latitude: "Latitudine",
    longitude: "Longitudine",
  };
  const hu = {
    loadingMap: "Térkép betöltése...",
    noFieldSelected: "Nincs kiválasztott tábla",
    validationConfirmed: "Helyszínen megerősítve",
    validationPartial: "Részben megerősítve",
    validationNotConfirmed: "Nincs megerősítve",
    validationPending: "Helyszíni ellenőrzésre vár",
    noProjectSelected: "Nincs kiválasztott projekt.",
    navOverview: "Áttekintés",
    navFields: "Táblák",
    navMap: "Térkép",
    navReports: "Jelentések",
    navSettings: "Beállítások",
    logout: "Kijelentkezés",
    operationsSubtitle: "Növényállomány-monitoring és döntéstámogatás",
    systemActive: "● RENDSZER AKTÍV",
    newField: "+ Új tábla",
    hello: "Üdvözöljük",
    attentionPrefix: "Ma",
    attentionSuffix: "tábla igényel figyelmet",
    intro: "Az AEGRIS a táblákat a legutóbbi elemzés, a prioritás, az olvasatlan riasztások és a helyszíni ellenőrzés alapján rangsorolja.",
    savedAnalyses: "mentett elemzés",
    critical: "Kritikus",
    immediateAttention: "azonnali figyelem",
    highPriority: "Magas prioritás",
    requiresCheck: "ellenőrzést igényel",
    stable: "Stabil",
    lowMediumPriority: "alacsony / közepes prioritás",
    awaitingVerification: "Ellenőrzésre vár",
    priorityToday: "Mai prioritás",
    firstFields: "Elsőként kezelendő táblák",
    sorting: "Sorrend: prioritás → riasztások → legutóbbi elemzés",
    prioritiesAfterAnalysis: "A prioritások az első mentett elemzés után jelennek meg.",
    analysis: "Elemzés",
    priority: "Prioritás",
    score: "Pontszám",
    noPriority: "Nincs prioritás",
    alerts: "riasztások",
    noNewAlerts: "Nincs új riasztás",
    open: "Megnyitás →",
    monitoring: "Monitoring",
    fieldMap: "Táblatérkép",
    fullMap: "Teljes térkép →",
    currentField: "Aktuális tábla",
    aegrisScore: "AEGRIS pontszám",
    fieldVerification: "Helyszíni ellenőrzés",
    projectStatus: "Projekt állapota",
    coordinates: "Koordináták",
    openFieldDetail: "Tábla részleteinek megnyitása →",
    latestStatus: "Legutóbbi állapot",
    latestAnalysis: "Legutóbbi elemzés",
    notifications: "Riasztások",
    unread: "olvasatlan",
    portfolio: "Portfólió",
    allFields: "Összes tábla",
    addField: "+ Tábla hozzáadása",
    noFields: "Még nincs létrehozott tábla.",
    noAnalysis: "Nincs elemzés",
    status: "Állapot",
    edit: "Szerkesztés",
    detail: "Részletek →",
    fieldSingular: "tábla",
    fieldPlural: "tábla",
    analysisSingular: "elemzés",
    analysisPlural: "elemzés",
    field: "Tábla",
    editField: "Tábla szerkesztése",
    name: "Név",
    cancel: "Mégse",
    saveChanges: "Módosítások mentése",
    operationsCenter: "Agronómiai műveleti központ",
    groundTruthWorkflow: "Ground Truth munkafolyamat",
    brandSubtitle: "Agronómiai intelligencia",
    brandFooter: "AEGRIS — Agronómiai intelligencia platform",
    latitude: "Szélesség",
    longitude: "Hosszúság",
  };
  const uk = {
    loadingMap: "Завантаження карти...",
    noFieldSelected: "Поле не вибрано",
    validationConfirmed: "Підтверджено в полі",
    validationPartial: "Частково підтверджено",
    validationNotConfirmed: "Не підтверджено",
    validationPending: "Очікує польової перевірки",
    noProjectSelected: "Проєкт не вибрано.",
    navOverview: "Огляд",
    navFields: "Поля",
    navMap: "Карта",
    navReports: "Звіти",
    navSettings: "Налаштування",
    logout: "Вийти",
    operationsSubtitle: "Моніторинг культур і підтримка рішень",
    systemActive: "● СИСТЕМА АКТИВНА",
    newField: "+ Нове поле",
    hello: "Вітаємо",
    attentionPrefix: "Сьогодні",
    attentionSuffix: "полів потребують уваги",
    intro: "AEGRIS ранжує поля за останнім аналізом, пріоритетом, непрочитаними сповіщеннями та польовою перевіркою.",
    savedAnalyses: "збережених аналізів",
    critical: "Критичні",
    immediateAttention: "негайна увага",
    highPriority: "Високий пріоритет",
    requiresCheck: "потребує перевірки",
    stable: "Стабільні",
    lowMediumPriority: "низький / середній пріоритет",
    awaitingVerification: "Очікує перевірки",
    priorityToday: "Пріоритет на сьогодні",
    firstFields: "Поля, які слід опрацювати першими",
    sorting: "Порядок: пріоритет → сповіщення → останній аналіз",
    prioritiesAfterAnalysis: "Пріоритети з’являться після першого збереженого аналізу.",
    analysis: "Аналіз",
    priority: "Пріоритет",
    score: "Оцінка",
    noPriority: "Без пріоритету",
    alerts: "сповіщення",
    noNewAlerts: "Немає нових сповіщень",
    open: "Відкрити →",
    monitoring: "Моніторинг",
    fieldMap: "Карта полів",
    fullMap: "Повна карта →",
    currentField: "Поточне поле",
    aegrisScore: "Бал AEGRIS",
    fieldVerification: "Польова перевірка",
    projectStatus: "Статус проєкту",
    coordinates: "Координати",
    openFieldDetail: "Відкрити деталі поля →",
    latestStatus: "Останній статус",
    latestAnalysis: "Останній аналіз",
    notifications: "Сповіщення",
    unread: "непрочитаних",
    portfolio: "Портфель",
    allFields: "Усі поля",
    addField: "+ Додати поле",
    noFields: "Ще не створено жодного поля.",
    noAnalysis: "Без аналізу",
    status: "Статус",
    edit: "Редагувати",
    detail: "Деталі →",
    fieldSingular: "поле",
    fieldPlural: "полів",
    analysisSingular: "аналіз",
    analysisPlural: "аналізів",
    field: "Поле",
    editField: "Редагувати поле",
    name: "Назва",
    cancel: "Скасувати",
    saveChanges: "Зберегти зміни",
    operationsCenter: "Центр агрономічних операцій",
    groundTruthWorkflow: "Процес Ground Truth",
    brandSubtitle: "Агрономічний інтелект",
    brandFooter: "AEGRIS — Платформа агрономічного інтелекту",
    latitude: "Широта",
    longitude: "Довгота",
  };
  const bg = {
    loadingMap: "Зареждане на картата...",
    noFieldSelected: "Няма избрано поле",
    validationConfirmed: "Потвърдено на терен",
    validationPartial: "Частично потвърдено",
    validationNotConfirmed: "Непотвърдено",
    validationPending: "Очаква теренна проверка",
    noProjectSelected: "Няма избран проект.",
    navOverview: "Преглед",
    navFields: "Полета",
    navMap: "Карта",
    navReports: "Отчети",
    navSettings: "Настройки",
    logout: "Изход",
    operationsSubtitle: "Мониторинг на културите и подкрепа при решения",
    systemActive: "● СИСТЕМАТА Е АКТИВНА",
    newField: "+ Ново поле",
    hello: "Здравейте",
    attentionPrefix: "Днес",
    attentionSuffix: "полета изискват внимание",
    intro: "AEGRIS подрежда полетата според последния анализ, приоритета, непрочетените сигнали и теренната проверка.",
    savedAnalyses: "запазени анализа",
    critical: "Критични",
    immediateAttention: "незабавно внимание",
    highPriority: "Висок приоритет",
    requiresCheck: "изисква проверка",
    stable: "Стабилни",
    lowMediumPriority: "нисък / среден приоритет",
    awaitingVerification: "Очаква проверка",
    priorityToday: "Днешен приоритет",
    firstFields: "Полетата, които трябва да се обработят първо",
    sorting: "Ред: приоритет → сигнали → последен анализ",
    prioritiesAfterAnalysis: "Приоритетите ще се появят след първия запазен анализ.",
    analysis: "Анализ",
    priority: "Приоритет",
    score: "Оценка",
    noPriority: "Без приоритет",
    alerts: "сигнали",
    noNewAlerts: "Няма нови сигнали",
    open: "Отвори →",
    monitoring: "Мониторинг",
    fieldMap: "Карта на полетата",
    fullMap: "Пълна карта →",
    currentField: "Текущо поле",
    aegrisScore: "Резултат AEGRIS",
    fieldVerification: "Теренна проверка",
    projectStatus: "Статус на проекта",
    coordinates: "Координати",
    openFieldDetail: "Отвори детайла на полето →",
    latestStatus: "Последен статус",
    latestAnalysis: "Последен анализ",
    notifications: "Сигнали",
    unread: "непрочетени",
    portfolio: "Портфолио",
    allFields: "Всички полета",
    addField: "+ Добави поле",
    noFields: "Все още няма създадени полета.",
    noAnalysis: "Без анализ",
    status: "Статус",
    edit: "Редактиране",
    detail: "Детайл →",
    fieldSingular: "поле",
    fieldPlural: "полета",
    analysisSingular: "анализ",
    analysisPlural: "анализа",
    field: "Поле",
    editField: "Редактирай поле",
    name: "Име",
    cancel: "Отказ",
    saveChanges: "Запази промените",
    operationsCenter: "Център за агрономически операции",
    groundTruthWorkflow: "Процес Ground Truth",
    brandSubtitle: "Агрономична интелигентност",
    brandFooter: "AEGRIS — Платформа за агрономична интелигентност",
    latitude: "Географска ширина",
    longitude: "Географска дължина",
  };
  const hr = {
    loadingMap: "Učitavanje karte...",
    noFieldSelected: "Nije odabrano polje",
    validationConfirmed: "Potvrđeno na terenu",
    validationPartial: "Djelomično potvrđeno",
    validationNotConfirmed: "Nije potvrđeno",
    validationPending: "Čeka terensku provjeru",
    noProjectSelected: "Nije odabran projekt.",
    navOverview: "Pregled",
    navFields: "Polja",
    navMap: "Karta",
    navReports: "Izvještaji",
    navSettings: "Postavke",
    logout: "Odjava",
    operationsSubtitle: "Praćenje usjeva i podrška odlučivanju",
    systemActive: "● SUSTAV AKTIVAN",
    newField: "+ Novo polje",
    hello: "Pozdrav",
    attentionPrefix: "Danas",
    attentionSuffix: "polja zahtijevaju pažnju",
    intro: "AEGRIS rangira polja prema najnovijoj analizi, prioritetu, nepročitanim upozorenjima i terenskoj provjeri.",
    savedAnalyses: "spremljenih analiza",
    critical: "Kritično",
    immediateAttention: "trenutna pažnja",
    highPriority: "Visoki prioritet",
    requiresCheck: "zahtijeva provjeru",
    stable: "Stabilno",
    lowMediumPriority: "nizak / srednji prioritet",
    awaitingVerification: "Čeka provjeru",
    priorityToday: "Današnji prioritet",
    firstFields: "Polja koja treba obraditi prva",
    sorting: "Redoslijed: prioritet → upozorenja → najnovija analiza",
    prioritiesAfterAnalysis: "Prioriteti će se prikazati nakon prve spremljene analize.",
    analysis: "Analiza",
    priority: "Prioritet",
    score: "Rezultat",
    noPriority: "Bez prioriteta",
    alerts: "upozorenja",
    noNewAlerts: "Nema novih upozorenja",
    open: "Otvori →",
    monitoring: "Praćenje",
    fieldMap: "Karta polja",
    fullMap: "Cijela karta →",
    currentField: "Trenutno polje",
    aegrisScore: "AEGRIS rezultat",
    fieldVerification: "Terenska provjera",
    projectStatus: "Status projekta",
    coordinates: "Koordinate",
    openFieldDetail: "Otvori detalj polja →",
    latestStatus: "Najnoviji status",
    latestAnalysis: "Najnovija analiza",
    notifications: "Upozorenja",
    unread: "nepročitano",
    portfolio: "Portfelj",
    allFields: "Sva polja",
    addField: "+ Dodaj polje",
    noFields: "Još nije stvoreno nijedno polje.",
    noAnalysis: "Bez analize",
    status: "Status",
    edit: "Uredi",
    detail: "Detalj →",
    fieldSingular: "polje",
    fieldPlural: "polja",
    analysisSingular: "analiza",
    analysisPlural: "analize",
    field: "Polje",
    editField: "Uredi polje",
    name: "Naziv",
    cancel: "Odustani",
    saveChanges: "Spremi promjene",
    operationsCenter: "Agronomski operativni centar",
    groundTruthWorkflow: "Ground Truth tijek rada",
    brandSubtitle: "Agronomska inteligencija",
    brandFooter: "AEGRIS — Platforma agronomske inteligencije",
    latitude: "Geografska širina",
    longitude: "Geografska dužina",
  };
  const sl = {
    loadingMap: "Nalaganje zemljevida...",
    noFieldSelected: "Nobeno polje ni izbrano",
    validationConfirmed: "Potrjeno na terenu",
    validationPartial: "Delno potrjeno",
    validationNotConfirmed: "Ni potrjeno",
    validationPending: "Čaka na terensko preverjanje",
    noProjectSelected: "Noben projekt ni izbran.",
    navOverview: "Pregled",
    navFields: "Polja",
    navMap: "Zemljevid",
    navReports: "Poročila",
    navSettings: "Nastavitve",
    logout: "Odjava",
    operationsSubtitle: "Spremljanje posevkov in podpora odločanju",
    systemActive: "● SISTEM AKTIVEN",
    newField: "+ Novo polje",
    hello: "Pozdravljeni",
    attentionPrefix: "Danes",
    attentionSuffix: "polja zahtevajo pozornost",
    intro: "AEGRIS razvršča polja glede na zadnjo analizo, prioriteto, neprebrana opozorila in terensko preverjanje.",
    savedAnalyses: "shranjenih analiz",
    critical: "Kritično",
    immediateAttention: "takojšnja pozornost",
    highPriority: "Visoka prioriteta",
    requiresCheck: "zahteva pregled",
    stable: "Stabilno",
    lowMediumPriority: "nizka / srednja prioriteta",
    awaitingVerification: "Čaka na preverjanje",
    priorityToday: "Današnja prioriteta",
    firstFields: "Polja, ki jih je treba obravnavati najprej",
    sorting: "Vrstni red: prioriteta → opozorila → zadnja analiza",
    prioritiesAfterAnalysis: "Prioritete se prikažejo po prvi shranjeni analizi.",
    analysis: "Analiza",
    priority: "Prioriteta",
    score: "Ocena",
    noPriority: "Brez prioritete",
    alerts: "opozorila",
    noNewAlerts: "Ni novih opozoril",
    open: "Odpri →",
    monitoring: "Spremljanje",
    fieldMap: "Zemljevid polj",
    fullMap: "Celoten zemljevid →",
    currentField: "Trenutno polje",
    aegrisScore: "AEGRIS ocena",
    fieldVerification: "Terensko preverjanje",
    projectStatus: "Stanje projekta",
    coordinates: "Koordinate",
    openFieldDetail: "Odpri podrobnosti polja →",
    latestStatus: "Zadnje stanje",
    latestAnalysis: "Zadnja analiza",
    notifications: "Opozorila",
    unread: "neprebrano",
    portfolio: "Portfelj",
    allFields: "Vsa polja",
    addField: "+ Dodaj polje",
    noFields: "Nobeno polje še ni bilo ustvarjeno.",
    noAnalysis: "Brez analize",
    status: "Stanje",
    edit: "Uredi",
    detail: "Podrobnosti →",
    fieldSingular: "polje",
    fieldPlural: "polja",
    analysisSingular: "analiza",
    analysisPlural: "analize",
    field: "Polje",
    editField: "Uredi polje",
    name: "Ime",
    cancel: "Prekliči",
    saveChanges: "Shrani spremembe",
    operationsCenter: "Agronomski operativni center",
    groundTruthWorkflow: "Postopek Ground Truth",
    brandSubtitle: "Agronomska inteligenca",
    brandFooter: "AEGRIS — Platforma agronomske inteligence",
    latitude: "Zemljepisna širina",
    longitude: "Zemljepisna dolžina",
  };
  const lt = {
    loadingMap: "Įkeliamas žemėlapis...",
    noFieldSelected: "Nepasirinktas laukas",
    validationConfirmed: "Patvirtinta lauke",
    validationPartial: "Iš dalies patvirtinta",
    validationNotConfirmed: "Nepatvirtinta",
    validationPending: "Laukiama patikros lauke",
    noProjectSelected: "Nepasirinktas projektas.",
    navOverview: "Apžvalga",
    navFields: "Laukai",
    navMap: "Žemėlapis",
    navReports: "Ataskaitos",
    navSettings: "Nustatymai",
    logout: "Atsijungti",
    operationsSubtitle: "Pasėlių stebėsena ir sprendimų palaikymas",
    systemActive: "● SISTEMA AKTYVI",
    newField: "+ Naujas laukas",
    hello: "Sveiki",
    attentionPrefix: "Šiandien dėmesio reikia",
    attentionSuffix: "laukams",
    intro: "AEGRIS laukus rikiuoja pagal naujausią analizę, prioritetą, neperskaitytus įspėjimus ir patikrą lauke.",
    savedAnalyses: "išsaugotų analizių",
    critical: "Kritiniai",
    immediateAttention: "reikia nedelsiant reaguoti",
    highPriority: "Aukštas prioritetas",
    requiresCheck: "reikia patikros",
    stable: "Stabilūs",
    lowMediumPriority: "žemas / vidutinis prioritetas",
    awaitingVerification: "Laukiama patikros",
    priorityToday: "Šiandienos prioritetas",
    firstFields: "Laukai, kuriuos reikia tvarkyti pirmiausia",
    sorting: "Tvarka: prioritetas → įspėjimai → naujausia analizė",
    prioritiesAfterAnalysis: "Prioritetai bus rodomi po pirmos išsaugotos analizės.",
    analysis: "Analizė",
    priority: "Prioritetas",
    score: "Balas",
    noPriority: "Be prioriteto",
    alerts: "įspėjimai",
    noNewAlerts: "Nėra naujų įspėjimų",
    open: "Atidaryti →",
    monitoring: "Stebėsena",
    fieldMap: "Laukų žemėlapis",
    fullMap: "Visas žemėlapis →",
    currentField: "Dabartinis laukas",
    aegrisScore: "AEGRIS balas",
    fieldVerification: "Patikra lauke",
    projectStatus: "Projekto būsena",
    coordinates: "Koordinatės",
    openFieldDetail: "Atidaryti lauko informaciją →",
    latestStatus: "Naujausia būsena",
    latestAnalysis: "Naujausia analizė",
    notifications: "Įspėjimai",
    unread: "neperskaityti",
    portfolio: "Portfelis",
    allFields: "Visi laukai",
    addField: "+ Pridėti lauką",
    noFields: "Dar nesukurtas nė vienas laukas.",
    noAnalysis: "Be analizės",
    status: "Būsena",
    edit: "Redaguoti",
    detail: "Išsamiau →",
    fieldSingular: "laukas",
    fieldPlural: "laukai",
    analysisSingular: "analizė",
    analysisPlural: "analizės",
    field: "Laukas",
    editField: "Redaguoti lauką",
    name: "Pavadinimas",
    cancel: "Atšaukti",
    saveChanges: "Išsaugoti pakeitimus",
    operationsCenter: "Agronominių operacijų centras",
    groundTruthWorkflow: "Ground Truth procesas",
    brandSubtitle: "Agronominis intelektas",
    brandFooter: "AEGRIS — Agronominio intelekto platforma",
    latitude: "Platuma",
    longitude: "Ilguma",
  };
  const lv = {
    loadingMap: "Kartes ielāde...",
    noFieldSelected: "Nav izvēlēts lauks",
    validationConfirmed: "Apstiprināts laukā",
    validationPartial: "Daļēji apstiprināts",
    validationNotConfirmed: "Nav apstiprināts",
    validationPending: "Gaida pārbaudi laukā",
    noProjectSelected: "Nav izvēlēts projekts.",
    navOverview: "Pārskats",
    navFields: "Lauki",
    navMap: "Karte",
    navReports: "Pārskati",
    navSettings: "Iestatījumi",
    logout: "Izrakstīties",
    operationsSubtitle: "Kultūraugu uzraudzība un lēmumu atbalsts",
    systemActive: "● SISTĒMA AKTĪVA",
    newField: "+ Jauns lauks",
    hello: "Sveiki",
    attentionPrefix: "Šodien uzmanība nepieciešama",
    attentionSuffix: "laukiem",
    intro: "AEGRIS sarindo laukus pēc jaunākās analīzes, prioritātes, nelasītiem brīdinājumiem un pārbaudes laukā.",
    savedAnalyses: "saglabātu analīžu",
    critical: "Kritiski",
    immediateAttention: "nepieciešama tūlītēja uzmanība",
    highPriority: "Augsta prioritāte",
    requiresCheck: "nepieciešama pārbaude",
    stable: "Stabili",
    lowMediumPriority: "zema / vidēja prioritāte",
    awaitingVerification: "Gaida pārbaudi",
    priorityToday: "Šodienas prioritāte",
    firstFields: "Lauki, kas jāapstrādā vispirms",
    sorting: "Secība: prioritāte → brīdinājumi → jaunākā analīze",
    prioritiesAfterAnalysis: "Prioritātes tiks parādītas pēc pirmās saglabātās analīzes.",
    analysis: "Analīze",
    priority: "Prioritāte",
    score: "Vērtējums",
    noPriority: "Bez prioritātes",
    alerts: "brīdinājumi",
    noNewAlerts: "Nav jaunu brīdinājumu",
    open: "Atvērt →",
    monitoring: "Uzraudzība",
    fieldMap: "Lauku karte",
    fullMap: "Pilna karte →",
    currentField: "Pašreizējais lauks",
    aegrisScore: "AEGRIS vērtējums",
    fieldVerification: "Pārbaude laukā",
    projectStatus: "Projekta statuss",
    coordinates: "Koordinātas",
    openFieldDetail: "Atvērt lauka informāciju →",
    latestStatus: "Jaunākais statuss",
    latestAnalysis: "Jaunākā analīze",
    notifications: "Brīdinājumi",
    unread: "nelasīti",
    portfolio: "Portfelis",
    allFields: "Visi lauki",
    addField: "+ Pievienot lauku",
    noFields: "Vēl nav izveidots neviens lauks.",
    noAnalysis: "Bez analīzes",
    status: "Statuss",
    edit: "Rediģēt",
    detail: "Detaļas →",
    fieldSingular: "lauks",
    fieldPlural: "lauki",
    analysisSingular: "analīze",
    analysisPlural: "analīzes",
    field: "Lauks",
    editField: "Rediģēt lauku",
    name: "Nosaukums",
    cancel: "Atcelt",
    saveChanges: "Saglabāt izmaiņas",
    operationsCenter: "Agronomisko operāciju centrs",
    groundTruthWorkflow: "Ground Truth darba plūsma",
    brandSubtitle: "Agronomiskā inteliģence",
    brandFooter: "AEGRIS — Agronomiskās inteliģences platforma",
    latitude: "Platums",
    longitude: "Garums",
  };
  const et = {
    loadingMap: "Kaardi laadimine...",
    noFieldSelected: "Ühtegi põldu pole valitud",
    validationConfirmed: "Põllul kinnitatud",
    validationPartial: "Osaliselt kinnitatud",
    validationNotConfirmed: "Kinnitamata",
    validationPending: "Ootab põllukontrolli",
    noProjectSelected: "Ühtegi projekti pole valitud.",
    navOverview: "Ülevaade",
    navFields: "Põllud",
    navMap: "Kaart",
    navReports: "Aruanded",
    navSettings: "Seaded",
    logout: "Logi välja",
    operationsSubtitle: "Kultuuride seire ja otsustustugi",
    systemActive: "● SÜSTEEM AKTIIVNE",
    newField: "+ Uus põld",
    hello: "Tere",
    attentionPrefix: "Täna vajavad tähelepanu",
    attentionSuffix: "põldu",
    intro: "AEGRIS järjestab põllud viimase analüüsi, prioriteedi, lugemata hoiatuste ja põllukontrolli alusel.",
    savedAnalyses: "salvestatud analüüsi",
    critical: "Kriitilised",
    immediateAttention: "vajavad kohest tähelepanu",
    highPriority: "Kõrge prioriteet",
    requiresCheck: "vajab kontrolli",
    stable: "Stabiilsed",
    lowMediumPriority: "madal / keskmine prioriteet",
    awaitingVerification: "Ootab kontrolli",
    priorityToday: "Tänane prioriteet",
    firstFields: "Põllud, millega tuleks esimesena tegeleda",
    sorting: "Järjekord: prioriteet → hoiatused → viimane analüüs",
    prioritiesAfterAnalysis: "Prioriteedid ilmuvad pärast esimest salvestatud analüüsi.",
    analysis: "Analüüs",
    priority: "Prioriteet",
    score: "Skoor",
    noPriority: "Prioriteet puudub",
    alerts: "hoiatused",
    noNewAlerts: "Uusi hoiatusi pole",
    open: "Ava →",
    monitoring: "Seire",
    fieldMap: "Põldude kaart",
    fullMap: "Täiskaart →",
    currentField: "Praegune põld",
    aegrisScore: "AEGRIS skoor",
    fieldVerification: "Põllukontroll",
    projectStatus: "Projekti olek",
    coordinates: "Koordinaadid",
    openFieldDetail: "Ava põllu detail →",
    latestStatus: "Viimane olek",
    latestAnalysis: "Viimane analüüs",
    notifications: "Hoiatused",
    unread: "lugemata",
    portfolio: "Portfell",
    allFields: "Kõik põllud",
    addField: "+ Lisa põld",
    noFields: "Ühtegi põldu pole veel loodud.",
    noAnalysis: "Analüüs puudub",
    status: "Olek",
    edit: "Muuda",
    detail: "Detail →",
    fieldSingular: "põld",
    fieldPlural: "põldu",
    analysisSingular: "analüüs",
    analysisPlural: "analüüsi",
    field: "Põld",
    editField: "Muuda põldu",
    name: "Nimi",
    cancel: "Tühista",
    saveChanges: "Salvesta muudatused",
    operationsCenter: "Agronoomiliste operatsioonide keskus",
    groundTruthWorkflow: "Ground Truth töövoog",
    brandSubtitle: "Agronoomiline intelligents",
    brandFooter: "AEGRIS — agronoomilise intelligentsi platvorm",
    latitude: "Laiuskraad",
    longitude: "Pikkuskraad",
  };
  const el = {
    loadingMap: "Φόρτωση χάρτη...",
    noFieldSelected: "Δεν έχει επιλεγεί αγρός",
    validationConfirmed: "Επιβεβαιώθηκε στο πεδίο",
    validationPartial: "Επιβεβαιώθηκε μερικώς",
    validationNotConfirmed: "Δεν επιβεβαιώθηκε",
    validationPending: "Αναμένει επιτόπια επαλήθευση",
    noProjectSelected: "Δεν έχει επιλεγεί έργο.",
    navOverview: "Επισκόπηση",
    navFields: "Αγροί",
    navMap: "Χάρτης",
    navReports: "Αναφορές",
    navSettings: "Ρυθμίσεις",
    logout: "Αποσύνδεση",
    operationsSubtitle: "Παρακολούθηση καλλιεργειών και υποστήριξη αποφάσεων",
    systemActive: "● ΣΥΣΤΗΜΑ ΕΝΕΡΓΟ",
    newField: "+ Νέος αγρός",
    hello: "Γεια σας",
    attentionPrefix: "Σήμερα απαιτούν προσοχή",
    attentionSuffix: "αγροί",
    intro: "Το AEGRIS ταξινομεί τους αγρούς με βάση την τελευταία ανάλυση, την προτεραιότητα, τις μη αναγνωσμένες ειδοποιήσεις και την επιτόπια επαλήθευση.",
    savedAnalyses: "αποθηκευμένες αναλύσεις",
    critical: "Κρίσιμα",
    immediateAttention: "άμεση προσοχή",
    highPriority: "Υψηλή προτεραιότητα",
    requiresCheck: "απαιτεί έλεγχο",
    stable: "Σταθερά",
    lowMediumPriority: "χαμηλή / μεσαία προτεραιότητα",
    awaitingVerification: "Αναμένει επαλήθευση",
    priorityToday: "Σημερινή προτεραιότητα",
    firstFields: "Αγροί που πρέπει να αντιμετωπιστούν πρώτοι",
    sorting: "Σειρά: προτεραιότητα → ειδοποιήσεις → τελευταία ανάλυση",
    prioritiesAfterAnalysis: "Οι προτεραιότητες θα εμφανιστούν μετά την πρώτη αποθηκευμένη ανάλυση.",
    analysis: "Ανάλυση",
    priority: "Προτεραιότητα",
    score: "Βαθμολογία",
    noPriority: "Χωρίς προτεραιότητα",
    alerts: "ειδοποιήσεις",
    noNewAlerts: "Δεν υπάρχουν νέες ειδοποιήσεις",
    open: "Άνοιγμα →",
    monitoring: "Παρακολούθηση",
    fieldMap: "Χάρτης αγρών",
    fullMap: "Πλήρης χάρτης →",
    currentField: "Τρέχων αγρός",
    aegrisScore: "Βαθμολογία AEGRIS",
    fieldVerification: "Επιτόπια επαλήθευση",
    projectStatus: "Κατάσταση έργου",
    coordinates: "Συντεταγμένες",
    openFieldDetail: "Άνοιγμα λεπτομερειών αγρού →",
    latestStatus: "Τελευταία κατάσταση",
    latestAnalysis: "Τελευταία ανάλυση",
    notifications: "Ειδοποιήσεις",
    unread: "μη αναγνωσμένες",
    portfolio: "Χαρτοφυλάκιο",
    allFields: "Όλοι οι αγροί",
    addField: "+ Προσθήκη αγρού",
    noFields: "Δεν έχουν δημιουργηθεί ακόμη αγροί.",
    noAnalysis: "Χωρίς ανάλυση",
    status: "Κατάσταση",
    edit: "Επεξεργασία",
    detail: "Λεπτομέρεια →",
    fieldSingular: "αγρός",
    fieldPlural: "αγροί",
    analysisSingular: "ανάλυση",
    analysisPlural: "αναλύσεις",
    field: "Αγρός",
    editField: "Επεξεργασία αγρού",
    name: "Όνομα",
    cancel: "Ακύρωση",
    saveChanges: "Αποθήκευση αλλαγών",
    operationsCenter: "Κέντρο αγρονομικών επιχειρήσεων",
    groundTruthWorkflow: "Ροή εργασίας Ground Truth",
    brandSubtitle: "Αγρονομική νοημοσύνη",
    brandFooter: "AEGRIS — Πλατφόρμα αγρονομικής νοημοσύνης",
    latitude: "Γεωγραφικό πλάτος",
    longitude: "Γεωγραφικό μήκος",
  };
  const sv = {
    loadingMap: "Laddar karta...",
    noFieldSelected: "Inget fält valt",
    validationConfirmed: "Bekräftat i fält",
    validationPartial: "Delvis bekräftat",
    validationNotConfirmed: "Inte bekräftat",
    validationPending: "Väntar på fältverifiering",
    noProjectSelected: "Inget projekt valt.",
    navOverview: "Översikt",
    navFields: "Fält",
    navMap: "Karta",
    navReports: "Rapporter",
    navSettings: "Inställningar",
    logout: "Logga ut",
    operationsSubtitle: "Grödövervakning och beslutsstöd",
    systemActive: "● SYSTEMET AKTIVT",
    newField: "+ Nytt fält",
    hello: "Hej",
    attentionPrefix: "I dag kräver",
    attentionSuffix: "fält uppmärksamhet",
    intro: "AEGRIS rangordnar fält efter den senaste analysen, prioritet, olästa varningar och fältverifiering.",
    savedAnalyses: "sparade analyser",
    critical: "Kritiska",
    immediateAttention: "omedelbar uppmärksamhet",
    highPriority: "Hög prioritet",
    requiresCheck: "kräver kontroll",
    stable: "Stabila",
    lowMediumPriority: "låg / medelhög prioritet",
    awaitingVerification: "Väntar på verifiering",
    priorityToday: "Dagens prioritet",
    firstFields: "Fält som bör hanteras först",
    sorting: "Ordning: prioritet → varningar → senaste analys",
    prioritiesAfterAnalysis: "Prioriteter visas efter den första sparade analysen.",
    analysis: "Analys",
    priority: "Prioritet",
    score: "Poäng",
    noPriority: "Ingen prioritet",
    alerts: "varningar",
    noNewAlerts: "Inga nya varningar",
    open: "Öppna →",
    monitoring: "Övervakning",
    fieldMap: "Fältkarta",
    fullMap: "Fullständig karta →",
    currentField: "Aktuellt fält",
    aegrisScore: "AEGRIS-poäng",
    fieldVerification: "Fältverifiering",
    projectStatus: "Projektstatus",
    coordinates: "Koordinater",
    openFieldDetail: "Öppna fältdetaljer →",
    latestStatus: "Senaste status",
    latestAnalysis: "Senaste analys",
    notifications: "Varningar",
    unread: "olästa",
    portfolio: "Portfölj",
    allFields: "Alla fält",
    addField: "+ Lägg till fält",
    noFields: "Inga fält har skapats ännu.",
    noAnalysis: "Ingen analys",
    status: "Status",
    edit: "Redigera",
    detail: "Detalj →",
    fieldSingular: "fält",
    fieldPlural: "fält",
    analysisSingular: "analys",
    analysisPlural: "analyser",
    field: "Fält",
    editField: "Redigera fält",
    name: "Namn",
    cancel: "Avbryt",
    saveChanges: "Spara ändringar",
    operationsCenter: "Agronomiskt driftcenter",
    groundTruthWorkflow: "Ground Truth-arbetsflöde",
    brandSubtitle: "Agronomisk intelligens",
    brandFooter: "AEGRIS — Plattform för agronomisk intelligens",
    latitude: "Latitud",
    longitude: "Longitud",
  };
  const da = {
    loadingMap: "Indlæser kort...",
    noFieldSelected: "Ingen mark valgt",
    validationConfirmed: "Bekræftet i marken",
    validationPartial: "Delvist bekræftet",
    validationNotConfirmed: "Ikke bekræftet",
    validationPending: "Afventer markverificering",
    noProjectSelected: "Intet projekt valgt.",
    navOverview: "Oversigt",
    navFields: "Marker",
    navMap: "Kort",
    navReports: "Rapporter",
    navSettings: "Indstillinger",
    logout: "Log ud",
    operationsSubtitle: "Afgrødeovervågning og beslutningsstøtte",
    systemActive: "● SYSTEM AKTIVT",
    newField: "+ Ny mark",
    hello: "Hej",
    attentionPrefix: "I dag kræver",
    attentionSuffix: "marker opmærksomhed",
    intro: "AEGRIS rangerer marker efter den seneste analyse, prioritet, ulæste advarsler og markverificering.",
    savedAnalyses: "gemte analyser",
    critical: "Kritiske",
    immediateAttention: "øjeblikkelig opmærksomhed",
    highPriority: "Høj prioritet",
    requiresCheck: "kræver kontrol",
    stable: "Stabile",
    lowMediumPriority: "lav / middel prioritet",
    awaitingVerification: "Afventer verificering",
    priorityToday: "Dagens prioritet",
    firstFields: "Marker, der bør håndteres først",
    sorting: "Rækkefølge: prioritet → advarsler → seneste analyse",
    prioritiesAfterAnalysis: "Prioriteter vises efter den første gemte analyse.",
    analysis: "Analyse",
    priority: "Prioritet",
    score: "Score",
    noPriority: "Ingen prioritet",
    alerts: "advarsler",
    noNewAlerts: "Ingen nye advarsler",
    open: "Åbn →",
    monitoring: "Overvågning",
    fieldMap: "Markkort",
    fullMap: "Fuldstændigt kort →",
    currentField: "Aktuel mark",
    aegrisScore: "AEGRIS-score",
    fieldVerification: "Markverificering",
    projectStatus: "Projektstatus",
    coordinates: "Koordinater",
    openFieldDetail: "Åbn markdetaljer →",
    latestStatus: "Seneste status",
    latestAnalysis: "Seneste analyse",
    notifications: "Advarsler",
    unread: "ulæste",
    portfolio: "Portefølje",
    allFields: "Alle marker",
    addField: "+ Tilføj mark",
    noFields: "Der er endnu ikke oprettet nogen marker.",
    noAnalysis: "Ingen analyse",
    status: "Status",
    edit: "Rediger",
    detail: "Detalje →",
    fieldSingular: "mark",
    fieldPlural: "marker",
    analysisSingular: "analyse",
    analysisPlural: "analyser",
    field: "Mark",
    editField: "Rediger mark",
    name: "Navn",
    cancel: "Annuller",
    saveChanges: "Gem ændringer",
    operationsCenter: "Agronomisk driftscenter",
    groundTruthWorkflow: "Ground Truth-arbejdsgang",
    brandSubtitle: "Agronomisk intelligens",
    brandFooter: "AEGRIS — Platform for agronomisk intelligens",
    latitude: "Breddegrad",
    longitude: "Længdegrad",
  };
  const no = {
    loadingMap: "Laster kart...",
    noFieldSelected: "Ingen felt valgt",
    validationConfirmed: "Bekreftet i felt",
    validationPartial: "Delvis bekreftet",
    validationNotConfirmed: "Ikke bekreftet",
    validationPending: "Venter på feltverifisering",
    noProjectSelected: "Ingen prosjekt valgt.",
    navOverview: "Oversikt",
    navFields: "Felt",
    navMap: "Kart",
    navReports: "Rapporter",
    navSettings: "Innstillinger",
    logout: "Logg ut",
    operationsSubtitle: "Avlingsovervåking og beslutningsstøtte",
    systemActive: "● SYSTEM AKTIVT",
    newField: "+ Nytt felt",
    hello: "Hei",
    attentionPrefix: "I dag krever",
    attentionSuffix: "felt oppmerksomhet",
    intro: "AEGRIS rangerer felt etter siste analyse, prioritet, uleste varsler og feltverifisering.",
    savedAnalyses: "lagrede analyser",
    critical: "Kritiske",
    immediateAttention: "umiddelbar oppmerksomhet",
    highPriority: "Høy prioritet",
    requiresCheck: "krever kontroll",
    stable: "Stabile",
    lowMediumPriority: "lav / middels prioritet",
    awaitingVerification: "Venter på verifisering",
    priorityToday: "Dagens prioritet",
    firstFields: "Felt som bør håndteres først",
    sorting: "Rekkefølge: prioritet → varsler → siste analyse",
    prioritiesAfterAnalysis: "Prioriteter vises etter den første lagrede analysen.",
    analysis: "Analyse",
    priority: "Prioritet",
    score: "Score",
    noPriority: "Ingen prioritet",
    alerts: "varsler",
    noNewAlerts: "Ingen nye varsler",
    open: "Åpne →",
    monitoring: "Overvåking",
    fieldMap: "Feltkart",
    fullMap: "Fullt kart →",
    currentField: "Gjeldende felt",
    aegrisScore: "AEGRIS-score",
    fieldVerification: "Feltverifisering",
    projectStatus: "Prosjektstatus",
    coordinates: "Koordinater",
    openFieldDetail: "Åpne feltdetaljer →",
    latestStatus: "Siste status",
    latestAnalysis: "Siste analyse",
    notifications: "Varsler",
    unread: "uleste",
    portfolio: "Portefølje",
    allFields: "Alle felt",
    addField: "+ Legg til felt",
    noFields: "Ingen felt er opprettet ennå.",
    noAnalysis: "Ingen analyse",
    status: "Status",
    edit: "Rediger",
    detail: "Detalj →",
    fieldSingular: "felt",
    fieldPlural: "felt",
    analysisSingular: "analyse",
    analysisPlural: "analyser",
    field: "Felt",
    editField: "Rediger felt",
    name: "Navn",
    cancel: "Avbryt",
    saveChanges: "Lagre endringer",
    operationsCenter: "Agronomisk driftssenter",
    groundTruthWorkflow: "Ground Truth-arbeidsflyt",
    brandSubtitle: "Agronomisk intelligens",
    brandFooter: "AEGRIS — Plattform for agronomisk intelligens",
    latitude: "Breddegrad",
    longitude: "Lengdegrad",
  };
  const fi = {
    loadingMap: "Ladataan karttaa...",
    noFieldSelected: "Lohkoa ei ole valittu",
    validationConfirmed: "Vahvistettu pellolla",
    validationPartial: "Osittain vahvistettu",
    validationNotConfirmed: "Ei vahvistettu",
    validationPending: "Odottaa kenttävarmennusta",
    noProjectSelected: "Projektia ei ole valittu.",
    navOverview: "Yleiskuva",
    navFields: "Lohkot",
    navMap: "Kartta",
    navReports: "Raportit",
    navSettings: "Asetukset",
    logout: "Kirjaudu ulos",
    operationsSubtitle: "Kasvuston seuranta ja päätöksenteon tuki",
    systemActive: "● JÄRJESTELMÄ AKTIIVINEN",
    newField: "+ Uusi lohko",
    hello: "Hei",
    attentionPrefix: "Tänään huomiota vaatii",
    attentionSuffix: "lohkoa",
    intro: "AEGRIS järjestää lohkot uusimman analyysin, prioriteetin, lukemattomien hälytysten ja kenttävarmennuksen perusteella.",
    savedAnalyses: "tallennettua analyysiä",
    critical: "Kriittiset",
    immediateAttention: "välitön huomio",
    highPriority: "Korkea prioriteetti",
    requiresCheck: "vaatii tarkistuksen",
    stable: "Vakaat",
    lowMediumPriority: "matala / keskitasoinen prioriteetti",
    awaitingVerification: "Odottaa varmennusta",
    priorityToday: "Päivän prioriteetti",
    firstFields: "Lohkot, jotka tulisi käsitellä ensin",
    sorting: "Järjestys: prioriteetti → hälytykset → uusin analyysi",
    prioritiesAfterAnalysis: "Prioriteetit näkyvät ensimmäisen tallennetun analyysin jälkeen.",
    analysis: "Analyysi",
    priority: "Prioriteetti",
    score: "Pisteet",
    noPriority: "Ei prioriteettia",
    alerts: "hälytykset",
    noNewAlerts: "Ei uusia hälytyksiä",
    open: "Avaa →",
    monitoring: "Seuranta",
    fieldMap: "Lohkokartta",
    fullMap: "Koko kartta →",
    currentField: "Nykyinen lohko",
    aegrisScore: "AEGRIS-pisteet",
    fieldVerification: "Kenttävarmennus",
    projectStatus: "Projektin tila",
    coordinates: "Koordinaatit",
    openFieldDetail: "Avaa lohkon tiedot →",
    latestStatus: "Viimeisin tila",
    latestAnalysis: "Viimeisin analyysi",
    notifications: "Hälytykset",
    unread: "lukematonta",
    portfolio: "Portfolio",
    allFields: "Kaikki lohkot",
    addField: "+ Lisää lohko",
    noFields: "Yhtään lohkoa ei ole vielä luotu.",
    noAnalysis: "Ei analyysiä",
    status: "Tila",
    edit: "Muokkaa",
    detail: "Tiedot →",
    fieldSingular: "lohko",
    fieldPlural: "lohkoa",
    analysisSingular: "analyysi",
    analysisPlural: "analyysiä",
    field: "Lohko",
    editField: "Muokkaa lohkoa",
    name: "Nimi",
    cancel: "Peruuta",
    saveChanges: "Tallenna muutokset",
    operationsCenter: "Agronominen toimintakeskus",
    groundTruthWorkflow: "Ground Truth -työnkulku",
    brandSubtitle: "Agronominen älykkyys",
    brandFooter: "AEGRIS — Agronomisen älykkyyden alusta",
    latitude: "Leveysaste",
    longitude: "Pituusaste",
  };
  const copies = { en, cs, sk, de, pl, fr, es, it, nl, pt, ro, hu, uk, bg, hr, sl, lt, lv, et, el, sv, da, no, fi } as const;
  return copies[language as keyof typeof copies] ?? copies.en;
}

function validationLabel(
  result: FieldValidationResult | undefined,
  copy: ReturnType<typeof getDashboardCopy>
) {
  if (result === "confirmed") return copy.validationConfirmed;
  if (result === "partially_confirmed") return copy.validationPartial;
  if (result === "not_confirmed") return copy.validationNotConfirmed;
  return copy.validationPending;
}

const dashboardLocaleMap = {
  cs: "cs-CZ", en: "en-GB", sk: "sk-SK", de: "de-DE", pl: "pl-PL",
  fr: "fr-FR", es: "es-ES", it: "it-IT", nl: "nl-NL", pt: "pt-PT",
  ro: "ro-RO", hu: "hu-HU", uk: "uk-UA", bg: "bg-BG", hr: "hr-HR",
  sl: "sl-SI", lt: "lt-LT", lv: "lv-LV", et: "et-EE", el: "el-GR",
  sv: "sv-SE", da: "da-DK", no: "nb-NO", fi: "fi-FI",
} as const;

function formatDate(value: string | null | undefined, language: string) {
  if (!value) return "—";

  return new Date(value).toLocaleString(dashboardLocaleMap[language as keyof typeof dashboardLocaleMap] ?? "en-GB", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const dashboardPriorityLabels = {
  en: { "Kritická": "Critical", "Vysoká": "High", "Střední": "Medium", "Nízká": "Low" },
  cs: { "Kritická": "Kritická", "Vysoká": "Vysoká", "Střední": "Střední", "Nízká": "Nízká" },
  sk: { "Kritická": "Kritická", "Vysoká": "Vysoká", "Střední": "Stredná", "Nízká": "Nízka" },
  de: { "Kritická": "Kritisch", "Vysoká": "Hoch", "Střední": "Mittel", "Nízká": "Niedrig" },
  pl: { "Kritická": "Krytyczna", "Vysoká": "Wysoka", "Střední": "Średnia", "Nízká": "Niska" },
  fr: { "Kritická": "Critique", "Vysoká": "Élevée", "Střední": "Moyenne", "Nízká": "Faible" },
  es: { "Kritická": "Crítica", "Vysoká": "Alta", "Střední": "Media", "Nízká": "Baja" },
  it: { "Kritická": "Critica", "Vysoká": "Alta", "Střední": "Media", "Nízká": "Bassa" },
  nl: { "Kritická": "Kritiek", "Vysoká": "Hoog", "Střední": "Gemiddeld", "Nízká": "Laag" },
  pt: { "Kritická": "Crítica", "Vysoká": "Alta", "Střední": "Média", "Nízká": "Baixa" },
  ro: { "Kritická": "Critică", "Vysoká": "Ridicată", "Střední": "Medie", "Nízká": "Scăzută" },
  hu: { "Kritická": "Kritikus", "Vysoká": "Magas", "Střední": "Közepes", "Nízká": "Alacsony" },
  uk: { "Kritická": "Критичний", "Vysoká": "Високий", "Střední": "Середній", "Nízká": "Низький" },
  bg: { "Kritická": "Критичен", "Vysoká": "Висок", "Střední": "Среден", "Nízká": "Нисък" },
  hr: { "Kritická": "Kritičan", "Vysoká": "Visok", "Střední": "Srednji", "Nízká": "Nizak" },
  sl: { "Kritická": "Kritična", "Vysoká": "Visoka", "Střední": "Srednja", "Nízká": "Nizka" },
  lt: { "Kritická": "Kritinis", "Vysoká": "Aukštas", "Střední": "Vidutinis", "Nízká": "Žemas" },
  lv: { "Kritická": "Kritiska", "Vysoká": "Augsta", "Střední": "Vidēja", "Nízká": "Zema" },
  et: { "Kritická": "Kriitiline", "Vysoká": "Kõrge", "Střední": "Keskmine", "Nízká": "Madal" },
  el: { "Kritická": "Κρίσιμη", "Vysoká": "Υψηλή", "Střední": "Μεσαία", "Nízká": "Χαμηλή" },
  sv: { "Kritická": "Kritisk", "Vysoká": "Hög", "Střední": "Medel", "Nízká": "Låg" },
  da: { "Kritická": "Kritisk", "Vysoká": "Høj", "Střední": "Mellem", "Nízká": "Lav" },
  no: { "Kritická": "Kritisk", "Vysoká": "Høy", "Střední": "Middels", "Nízká": "Lav" },
  fi: { "Kritická": "Kriittinen", "Vysoká": "Korkea", "Střední": "Keskitaso", "Nízká": "Matala" },
} as const;

const dashboardStatusLabels = {
  en: { Monitoring: "Monitoring", "Aktivní": "Active", "Dokončeno": "Completed", Waiting: "Waiting", Active: "Active", Completed: "Completed" },
  cs: { Monitoring: "Monitoring", "Aktivní": "Aktivní", "Dokončeno": "Dokončeno", Waiting: "Čeká", Active: "Aktivní", Completed: "Dokončeno" },
  sk: { Monitoring: "Monitoring", "Aktivní": "Aktívny", "Dokončeno": "Dokončené", Waiting: "Čaká", Active: "Aktívny", Completed: "Dokončené" },
  de: { Monitoring: "Monitoring", "Aktivní": "Aktiv", "Dokončeno": "Abgeschlossen", Waiting: "Wartet", Active: "Aktiv", Completed: "Abgeschlossen" },
  pl: { Monitoring: "Monitoring", "Aktivní": "Aktywny", "Dokončeno": "Zakończony", Waiting: "Oczekuje", Active: "Aktywny", Completed: "Zakończony" },
  fr: { Monitoring: "Suivi", "Aktivní": "Actif", "Dokončeno": "Terminé", Waiting: "En attente", Active: "Actif", Completed: "Terminé" },
  es: { Monitoring: "Monitorización", "Aktivní": "Activo", "Dokončeno": "Completado", Waiting: "En espera", Active: "Activo", Completed: "Completado" },
  it: { Monitoring: "Monitoraggio", "Aktivní": "Attivo", "Dokončeno": "Completato", Waiting: "In attesa", Active: "Attivo", Completed: "Completato" },
  nl: { Monitoring: "Monitoring", "Aktivní": "Actief", "Dokončeno": "Voltooid", Waiting: "Wachtend", Active: "Actief", Completed: "Voltooid" },
  pt: { Monitoring: "Monitorização", "Aktivní": "Ativo", "Dokončeno": "Concluído", Waiting: "Em espera", Active: "Ativo", Completed: "Concluído" },
  ro: { Monitoring: "Monitorizare", "Aktivní": "Activ", "Dokončeno": "Finalizat", Waiting: "În așteptare", Active: "Activ", Completed: "Finalizat" },
  hu: { Monitoring: "Monitoring", "Aktivní": "Aktív", "Dokončeno": "Befejezve", Waiting: "Várakozik", Active: "Aktív", Completed: "Befejezve" },
  uk: { Monitoring: "Моніторинг", "Aktivní": "Активний", "Dokončeno": "Завершено", Waiting: "Очікує", Active: "Активний", Completed: "Завершено" },
  bg: { Monitoring: "Мониторинг", "Aktivní": "Активен", "Dokončeno": "Завършен", Waiting: "Изчаква", Active: "Активен", Completed: "Завършен" },
  hr: { Monitoring: "Praćenje", "Aktivní": "Aktivan", "Dokončeno": "Dovršeno", Waiting: "Na čekanju", Active: "Aktivan", Completed: "Dovršeno" },
  sl: { Monitoring: "Spremljanje", "Aktivní": "Aktiven", "Dokončeno": "Dokončano", Waiting: "Čaka", Active: "Aktiven", Completed: "Dokončano" },
  lt: { Monitoring: "Stebėsena", "Aktivní": "Aktyvus", "Dokončeno": "Baigtas", Waiting: "Laukia", Active: "Aktyvus", Completed: "Baigtas" },
  lv: { Monitoring: "Uzraudzība", "Aktivní": "Aktīvs", "Dokončeno": "Pabeigts", Waiting: "Gaida", Active: "Aktīvs", Completed: "Pabeigts" },
  et: { Monitoring: "Seire", "Aktivní": "Aktiivne", "Dokončeno": "Lõpetatud", Waiting: "Ootel", Active: "Aktiivne", Completed: "Lõpetatud" },
  el: { Monitoring: "Παρακολούθηση", "Aktivní": "Ενεργό", "Dokončeno": "Ολοκληρωμένο", Waiting: "Σε αναμονή", Active: "Ενεργό", Completed: "Ολοκληρωμένο" },
  sv: { Monitoring: "Övervakning", "Aktivní": "Aktiv", "Dokončeno": "Slutförd", Waiting: "Väntar", Active: "Aktiv", Completed: "Slutförd" },
  da: { Monitoring: "Overvågning", "Aktivní": "Aktiv", "Dokončeno": "Afsluttet", Waiting: "Venter", Active: "Aktiv", Completed: "Afsluttet" },
  no: { Monitoring: "Overvåking", "Aktivní": "Aktiv", "Dokončeno": "Fullført", Waiting: "Venter", Active: "Aktiv", Completed: "Fullført" },
  fi: { Monitoring: "Seuranta", "Aktivní": "Aktiivinen", "Dokončeno": "Valmis", Waiting: "Odottaa", Active: "Aktiivinen", Completed: "Valmis" },
} as const;

function localizedPriority(
  priority: string | null | undefined,
  language: string,
  fallback: string
) {
  if (!priority) return fallback;
  const labels =
    dashboardPriorityLabels[language as keyof typeof dashboardPriorityLabels] ??
    dashboardPriorityLabels.en;
  return labels[priority as keyof typeof labels] ?? priority;
}

function localizedProjectStatus(status: string, language: string) {
  const labels =
    dashboardStatusLabels[language as keyof typeof dashboardStatusLabels] ??
    dashboardStatusLabels.en;
  return labels[status as keyof typeof labels] ?? status;
}

export default function DashboardPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = useMemo(() => getDashboardCopy(language), [language]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [dashboardProjects, setDashboardProjects] =
    useState<DashboardProject[]>([]);
  const [dashboardCounts, setDashboardCounts] =
    useState<DashboardCounts>({
      projects: 0,
      analyses: 0,
      reports: 0,
      alerts: 0,
      unreadAlerts: 0,
      criticalProjects: 0,
      pendingFieldValidations: 0,
    });

  const [user, setUser] = useState<User | null>(null);
  const [activeOrganizationId, setActiveOrganizationId] =
    useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [newLocation, setNewLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  const [selectedProject, setSelectedProject] = useState<Project>({
    name: copy.noFieldSelected,
    latitude: 0,
    longitude: 0,
    status: "Waiting",
  });

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState("");

  const loadDashboardSummary = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("CHYBA DASHBOARD API:", result);
        return [] as DashboardProject[];
      }

      const loadedDashboardProjects: DashboardProject[] = Array.isArray(
        result.projects
      )
        ? result.projects
        : [];

      setDashboardCounts(result.counts);
      setDashboardProjects(loadedDashboardProjects);

      return loadedDashboardProjects;
    } catch (error) {
      console.error("CHYBA NAČTENÍ DASHBOARDU:", error);
      return [] as DashboardProject[];
    }
  }, []);

  const loadLatestAnalysis = useCallback(async (projectId: number) => {
    setAnalysisError("");

    try {
      const response = await fetch("/api/dashboard", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("CHYBA DASHBOARD API:", result);
        setAnalysis(null);
        return;
      }

      setDashboardCounts(result.counts);
      setDashboardProjects(Array.isArray(result.projects) ? result.projects : []);

      const projectData = Array.isArray(result.projects)
        ? result.projects.find(
            (item: DashboardProject) => item.id === projectId
          )
        : null;

      const latest = projectData?.latestAnalysis ?? null;
      const recommendation = projectData?.latestRecommendation ?? null;

      if (!latest) {
        setAnalysis(null);
        return;
      }

      setAnalysis({
        ...latest,
        score: recommendation?.score ?? null,
        priority: recommendation?.priority ?? null,
      });
    } catch (error) {
      console.error("CHYBA NAČTENÍ ANALÝZY:", error);
      setAnalysis(null);
    }
  }, []);

  const loadProjects = useCallback(
    async (organizationId: string) => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("CHYBA NAČTENÍ PROJEKTŮ:", error);
        return;
      }

      const loadedProjects = (data as Project[]) ?? [];
      setProjects(loadedProjects);

      const loadedDashboardProjects = await loadDashboardSummary();

      if (loadedProjects.length > 0) {
        const priorityProject = [...loadedDashboardProjects]
          .filter((project) => project.latestAnalysis != null)
          .sort((a, b) => {
            const priorityDifference =
              priorityWeight(b.latestRecommendation?.priority) -
              priorityWeight(a.latestRecommendation?.priority);

            if (priorityDifference !== 0) return priorityDifference;

            const alertDifference = b.unreadAlerts - a.unreadAlerts;
            if (alertDifference !== 0) return alertDifference;

            const aTime = a.latestAnalysis?.created_at
              ? new Date(a.latestAnalysis.created_at).getTime()
              : 0;
            const bTime = b.latestAnalysis?.created_at
              ? new Date(b.latestAnalysis.created_at).getTime()
              : 0;

            return bTime - aTime;
          })[0];

        const defaultProject =
          loadedProjects.find((project) => project.id === priorityProject?.id) ??
          loadedProjects[0];

        setSelectedProject(defaultProject);

        if (defaultProject.id) {
          await loadLatestAnalysis(defaultProject.id);
        }
      }
    },
    [loadDashboardSummary, loadLatestAnalysis]
  );

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("account_type, demo_expires_at, active_organization_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("CHYBA NAČTENÍ PROFILU:", profileError);
        router.push("/login");
        return;
      }

      if (
        profile?.account_type === "demo" &&
        profile.demo_expires_at &&
        new Date(profile.demo_expires_at) <= new Date()
      ) {
        router.push("/login");
        return;
      }

      if (!profile?.active_organization_id) {
        console.error("CHYBA: Uživatel nemá nastavenou aktivní organizaci.");
        router.push("/login");
        return;
      }

      setActiveOrganizationId(profile.active_organization_id);
      setUser(user);
      await loadProjects(profile.active_organization_id);
    }

    init();
  }, [loadProjects, router]);

  function openSelectedProjectAnalysis() {
    if (!selectedProject.id) {
      setAnalysisError(copy.noProjectSelected);
      return;
    }

    router.push(`/projects/${selectedProject.id}`);
  }

  async function selectProject(project: Project) {
    setSelectedProject(project);
    setAnalysis(null);
    setAnalysisError("");

    if (project.id) {
      await loadLatestAnalysis(project.id);
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("CHYBA ODHLÁŠENÍ:", error);
      return;
    }

    router.push("/");
  }

  function openNewProjectModal() {
    setNewLocation({ latitude: 0, longitude: 0 });
    setModalOpen(true);
  }

  function openEditProjectModal(project: Project) {
    setEditingProject({ ...project });
    setEditModalOpen(true);
  }

  async function saveEditedProject() {
    if (!user || !editingProject?.id) return;

    const latitude = Number(editingProject.latitude);
    const longitude = Number(editingProject.longitude);

    if (
      !editingProject.name.trim() ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      console.error("NEPLATNÉ ÚDAJE PROJEKTU");
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .update({
        name: editingProject.name.trim(),
        latitude,
        longitude,
        status: editingProject.status.trim(),
      })
      .eq("id", editingProject.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("CHYBA ÚPRAVY PROJEKTU:", error);
      return;
    }

    if (!data) {
      console.error(
        "CHYBA: Projekt nebyl upraven nebo k němu nemáte oprávnění."
      );
      return;
    }

    const updatedProject = data as Project;

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );

    setSelectedProject((currentProject) =>
      currentProject.id === updatedProject.id ? updatedProject : currentProject
    );

    setEditingProject(null);
    setEditModalOpen(false);

    if (updatedProject.id) {
      await loadLatestAnalysis(updatedProject.id);
    }
  }

  const priorityProjects = useMemo(
    () =>
      [...dashboardProjects]
        .filter((project) => project.latestAnalysis != null)
        .sort((a, b) => {
          const priorityDifference =
            priorityWeight(b.latestRecommendation?.priority) -
            priorityWeight(a.latestRecommendation?.priority);

          if (priorityDifference !== 0) return priorityDifference;

          const alertDifference = b.unreadAlerts - a.unreadAlerts;
          if (alertDifference !== 0) return alertDifference;

          const aTime = a.latestAnalysis?.created_at
            ? new Date(a.latestAnalysis.created_at).getTime()
            : 0;
          const bTime = b.latestAnalysis?.created_at
            ? new Date(b.latestAnalysis.created_at).getTime()
            : 0;

          return bTime - aTime;
        }),
    [dashboardProjects]
  );

  const highPriorityProjects = priorityProjects.filter(
    (project) => project.latestRecommendation?.priority === "Vysoká"
  ).length;

  const stableProjects = priorityProjects.filter(
    (project) =>
      project.latestRecommendation?.priority === "Nízká" ||
      project.latestRecommendation?.priority === "Střední"
  ).length;

  const selectedDashboardProject = dashboardProjects.find(
    (project) => project.id === selectedProject.id
  );

  const selectedRecommendation =
    selectedDashboardProject?.latestRecommendation ?? null;

  const selectedValidation =
    selectedDashboardProject?.latestFieldValidation ?? null;

  const selectedTone = priorityTone(selectedRecommendation?.priority);

  const mapProjects = useMemo(
    () =>
      projects.map((project) => {
        const dashboardProject = dashboardProjects.find(
          (item) => item.id === project.id
        );

        return {
          ...project,
          priority: dashboardProject?.latestRecommendation?.priority ?? null,
          score: dashboardProject?.latestRecommendation?.score ?? null,
          unreadAlerts: dashboardProject?.unreadAlerts ?? 0,
        };
      }),
    [projects, dashboardProjects]
  );

  const userLabel = user?.email?.split("@")[0] || "Agronom";

  return (
    <main className="min-h-screen bg-[#05090d] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1920px]">
        <aside className="hidden w-[244px] shrink-0 border-r border-white/[0.06] bg-[#080d12] xl:flex xl:flex-col">
          <div className="border-b border-white/[0.06] px-7 py-7">
            <div className="text-[22px] font-black tracking-[0.18em] text-cyan-300">
              AEGRIS
            </div>
            <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.32em] text-slate-600">
              {copy.brandSubtitle}
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 px-4 py-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-3 text-sm font-semibold text-cyan-200"
            >
              <span className="text-base">⌂</span>
              {copy.navOverview}
            </Link>

            <Link
              href="/projects"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>▦</span>
              {copy.navFields}
            </Link>

            <Link
              href="/map"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>◇</span>
              {copy.navMap}
            </Link>

            <Link
              href="/reports"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>▤</span>
              {copy.navReports}
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>⚙</span>
              {copy.navSettings}
            </Link>
          </nav>

          <div className="m-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-sm font-black text-cyan-300">
                A
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-200">
                  {userLabel}
                </div>
                <div className="truncate text-[11px] text-slate-600">
                  {user?.email ?? ""}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="w-full rounded-lg border border-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-red-400/20 hover:text-red-300"
            >
              {copy.logout}
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#05090d]/90 backdrop-blur-xl">
            <div className="flex min-h-[74px] items-center justify-between gap-4 px-5 md:px-8 xl:px-10">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400/70">
                  {copy.operationsCenter}
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  {copy.operationsSubtitle}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5 text-[11px] font-bold text-emerald-300 sm:block">
                  {copy.systemActive}
                </div>

                <button
                  type="button"
                  onClick={openNewProjectModal}
                  className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-black text-[#061015] transition hover:bg-cyan-200"
                >
                  {copy.newField}
                </button>
              </div>
            </div>
          </header>

          <div className="px-5 py-7 md:px-8 xl:px-10 xl:py-9">
            <section className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {copy.hello}, {userLabel}
                </p>
                <h1 className="mt-1 max-w-4xl text-3xl font-black tracking-[-0.035em] text-white md:text-[42px] md:leading-[1.05]">
                  {copy.attentionPrefix}{" "}
                  <span className="text-cyan-300">
                    {dashboardCounts.criticalProjects +
                      highPriorityProjects}{" "}
                    {copy.attentionSuffix}
                  </span>
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  {copy.intro}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                {dashboardCounts.analyses} {copy.savedAnalyses}
              </div>
            </section>

            <section className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="group rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.09] to-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-300/70">
                    {copy.critical}
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_18px_rgba(248,113,113,0.8)]" />
                </div>
                <div className="mt-5 text-4xl font-black tracking-tight text-white">
                  {dashboardCounts.criticalProjects}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {copy.immediateAttention}
                </div>
              </div>

              <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/[0.07] to-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-300/70">
                    {copy.highPriority}
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                </div>
                <div className="mt-5 text-4xl font-black tracking-tight text-white">
                  {highPriorityProjects}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {copy.requiresCheck}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/[0.06] to-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300/70">
                    {copy.stable}
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="mt-5 text-4xl font-black tracking-tight text-white">
                  {stableProjects}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {copy.lowMediumPriority}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-500/[0.06] to-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300/70">
                    {copy.awaitingVerification}
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                </div>
                <div className="mt-5 text-4xl font-black tracking-tight text-white">
                  {dashboardCounts.pendingFieldValidations}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {copy.groundTruthWorkflow}
                </div>
              </div>
            </section>

            <section className="mb-7 overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#0a1016]">
              <div className="flex flex-col justify-between gap-4 border-b border-white/[0.06] px-5 py-5 md:flex-row md:items-center md:px-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">
                    {copy.priorityToday}
                  </div>
                  <h2 className="mt-1 text-xl font-bold text-white">
                    {copy.firstFields}
                  </h2>
                </div>

                <div className="text-xs text-slate-600">
                  {copy.sorting}
                </div>
              </div>

              {priorityProjects.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  {copy.prioritiesAfterAnalysis}
                </div>
              ) : (
                <div>
                  {priorityProjects.slice(0, 5).map((project, index) => {
                    const priority = project.latestRecommendation?.priority ?? null;
                    const displayPriority = localizedPriority(
                      priority,
                      language,
                      copy.noPriority
                    );
                    const score = project.latestRecommendation?.score ?? null;
                    const tone = priorityTone(priority);
                    const validation = project.latestFieldValidation;

                    return (
                      <div
                        key={project.id}
                        className={`grid gap-4 border-b border-white/[0.05] px-5 py-4 transition last:border-b-0 hover:bg-white/[0.025] md:px-6 lg:grid-cols-[42px_1.35fr_0.7fr_0.65fr_1.1fr_auto] lg:items-center ${
                          index === 0 ? "bg-white/[0.018]" : ""
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-xs font-black text-slate-500">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${tone.dot}`}
                            />
                            <div className="truncate font-bold text-white">
                              {project.name}
                            </div>
                          </div>
                          <div className="mt-1 text-[11px] text-slate-600">
                            {copy.analysis} {formatDate(project.latestAnalysis?.created_at, language)}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
                            {copy.priority}
                          </div>
                          <div
                            className={`mt-1 inline-flex rounded-md border px-2 py-1 text-xs font-bold ${tone.border} ${tone.bg} ${tone.text}`}
                          >
                            {displayPriority}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
                            {copy.score}
                          </div>
                          <div className="mt-1 text-lg font-black text-white">
                            {score != null ? score : "—"}
                            {score != null && (
                              <span className="ml-1 text-[10px] font-medium text-slate-600">
                                /100
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            {project.unreadAlerts > 0 ? (
                              <span className="text-xs font-semibold text-red-300">
                                ● {project.unreadAlerts} {copy.alerts}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-600">
                                {copy.noNewAlerts}
                              </span>
                            )}
                          </div>
                          <div
                            className={`mt-1.5 text-[11px] font-medium ${
                              validation?.validation_result === "confirmed"
                                ? "text-emerald-300"
                                : validation?.validation_result ===
                                    "partially_confirmed"
                                  ? "text-amber-300"
                                  : validation?.validation_result ===
                                      "not_confirmed"
                                    ? "text-red-300"
                                    : "text-slate-500"
                            }`}
                          >
                            {validation
                              ? `✓ ${validationLabel(
                                  validation.validation_result,
                                  copy
                                )}`
                              : `○ ${copy.validationPending}`}
                          </div>
                        </div>

                        {project.id && (
                          <Link
                            href={`/projects/${project.id}`}
                            className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-center text-xs font-bold text-slate-300 transition hover:border-cyan-300/30 hover:text-cyan-200"
                          >
                            {copy.open}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="mb-7 grid gap-5 2xl:grid-cols-[minmax(0,1.6fr)_390px]">
              <div className="overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#0a1016]">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 md:px-6">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
                      {copy.monitoring}
                    </div>
                    <h2 className="mt-1 text-lg font-bold text-white">
                      {copy.fieldMap}
                    </h2>
                  </div>

                  <Link
                    href="/map"
                    className="text-xs font-semibold text-slate-500 transition hover:text-cyan-300"
                  >
                    {copy.fullMap}
                  </Link>
                </div>

                <div className="h-[520px]">
                  <WorldMap
                    projects={mapProjects}
                    selectedProjectId={selectedProject.id}
                    compactControls
                    onLocationSelect={(location) => {
                      if (location.id) {
                        selectProject(location);
                        return;
                      }

                      setNewLocation({
                        latitude: location.latitude,
                        longitude: location.longitude,
                      });
                      setModalOpen(true);
                    }}
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-white/[0.07] bg-[#0a1016] p-5 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
                      {copy.currentField}
                    </div>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                      {selectedProject.name}
                    </h2>
                  </div>

                  {selectedRecommendation?.priority && (
                    <span
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold ${selectedTone.border} ${selectedTone.bg} ${selectedTone.text}`}
                    >
                      {localizedPriority(
                        selectedRecommendation.priority,
                        language,
                        copy.noPriority
                      )}
                    </span>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
                      {copy.aegrisScore}
                    </div>
                    <div className="mt-2 text-3xl font-black text-white">
                      {selectedRecommendation?.score ?? analysis?.score ?? "—"}
                      {(selectedRecommendation?.score != null ||
                        analysis?.score != null) && (
                        <span className="ml-1 text-[10px] font-medium text-slate-600">
                          /100
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                    <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
                      NDVI
                    </div>
                    <div className="mt-2 text-3xl font-black text-cyan-300">
                      {analysis ? analysis.ndvi.toFixed(3) : "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-500">{copy.fieldVerification}</span>
                    <span
                      className={`text-right text-xs font-bold ${
                        selectedValidation?.validation_result === "confirmed"
                          ? "text-emerald-300"
                          : selectedValidation?.validation_result ===
                              "partially_confirmed"
                            ? "text-amber-300"
                            : selectedValidation?.validation_result ===
                                "not_confirmed"
                              ? "text-red-300"
                              : "text-slate-500"
                      }`}
                    >
                      {validationLabel(selectedValidation?.validation_result, copy)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{copy.projectStatus}</span>
                    <span className="text-xs font-bold text-slate-300">
                      {localizedProjectStatus(selectedProject.status, language)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.05] pt-3">
                    <span className="text-xs text-slate-500">{copy.coordinates}</span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {selectedProject.latitude.toFixed(4)},{" "}
                      {selectedProject.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>

                {analysisError && (
                  <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-xs text-red-300">
                    {analysisError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={openSelectedProjectAnalysis}
                  disabled={!selectedProject.id}
                  className="mt-5 w-full rounded-xl bg-cyan-300 py-3 text-sm font-black text-[#061015] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {copy.openFieldDetail}
                </button>

                <div className="mt-5 border-t border-white/[0.06] pt-5">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                    {copy.latestStatus}
                  </div>

                  <div className="mt-3 space-y-3">
                    <div className="flex gap-3">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
                      <div>
                        <div className="text-xs font-semibold text-slate-300">
                          {copy.latestAnalysis}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-600">
                          {formatDate(
                            selectedDashboardProject?.latestAnalysis?.created_at,
                            language
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div
                        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                          selectedDashboardProject?.unreadAlerts
                            ? "bg-red-400"
                            : "bg-slate-700"
                        }`}
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-300">
                          {copy.notifications}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-600">
                          {selectedDashboardProject?.unreadAlerts ?? 0} {copy.unread}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-white/[0.07] bg-[#0a1016]">
              <div className="flex flex-col justify-between gap-4 border-b border-white/[0.06] px-5 py-5 md:flex-row md:items-center md:px-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
                    {copy.portfolio}
                  </div>
                  <h2 className="mt-1 text-lg font-bold text-white">
                    {copy.allFields}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={openNewProjectModal}
                  className="rounded-lg border border-cyan-300/20 px-3 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-300/[0.06]"
                >
                  {copy.addField}
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  {copy.noFields}
                </div>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {projects.map((project) => {
                    const dashboardProject = dashboardProjects.find(
                      (item) => item.id === project.id
                    );
                    const recommendation = dashboardProject?.latestRecommendation;
                    const tone = priorityTone(recommendation?.priority);

                    return (
                      <div
                        key={project.id}
                        className={`grid gap-3 px-5 py-4 transition hover:bg-white/[0.02] md:px-6 lg:grid-cols-[1.5fr_0.75fr_0.75fr_0.8fr_auto] lg:items-center ${
                          selectedProject.id === project.id
                            ? "bg-cyan-300/[0.025]"
                            : ""
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => selectProject(project)}
                          className="min-w-0 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${tone.dot}`}
                            />
                            <span className="truncate text-sm font-bold text-white">
                              {project.name}
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] text-slate-600">
                            {project.latitude.toFixed(4)},{" "}
                            {project.longitude.toFixed(4)}
                          </div>
                        </button>

                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
                            {copy.priority}
                          </div>
                          <div className={`mt-1 text-xs font-bold ${tone.text}`}>
                            {recommendation?.priority
                              ? localizedPriority(
                                  recommendation.priority,
                                  language,
                                  copy.noPriority
                                )
                              : copy.noAnalysis}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
                            {copy.score}
                          </div>
                          <div className="mt-1 text-sm font-black text-slate-300">
                            {recommendation?.score != null
                              ? `${recommendation.score}/100`
                              : "—"}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
                            {copy.status}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-slate-400">
                            {localizedProjectStatus(project.status, language)}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditProjectModal(project)}
                            className="rounded-lg border border-white/[0.07] px-3 py-2 text-xs font-semibold text-slate-500 transition hover:text-white"
                          >
                            {copy.edit}
                          </button>

                          {project.id && (
                            <Link
                              href={`/projects/${project.id}`}
                              className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.04] px-3 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-300/[0.08]"
                            >
                              {copy.detail}
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <footer className="flex flex-col justify-between gap-2 py-7 text-[11px] text-slate-700 sm:flex-row">
              <div>{copy.brandFooter}</div>
              <div>
                {projects.length}{" "}
                {projects.length === 1 ? copy.fieldSingular : copy.fieldPlural} ·{" "}
                {dashboardCounts.analyses}{" "}
                {dashboardCounts.analyses === 1
                  ? copy.analysisSingular
                  : copy.analysisPlural}
              </div>
            </footer>
          </div>
        </div>
      </div>

      {editModalOpen && editingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/[0.08] bg-[#0a1016] p-6 shadow-2xl">
            <div className="mb-6">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
                {copy.field}
              </div>
              <h2 className="mt-2 text-2xl font-black text-white">
                {copy.editField}
              </h2>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-400">
                  {copy.name}
                </span>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(event) =>
                    setEditingProject({
                      ...editingProject,
                      name: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-[#060b10] px-4 py-3 text-white outline-none transition focus:border-cyan-300/50"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-400">
                    {copy.latitude}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={editingProject.latitude}
                    onChange={(event) =>
                      setEditingProject({
                        ...editingProject,
                        latitude: Number(event.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-white/[0.08] bg-[#060b10] px-4 py-3 text-white outline-none transition focus:border-cyan-300/50"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-400">
                    {copy.longitude}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={editingProject.longitude}
                    onChange={(event) =>
                      setEditingProject({
                        ...editingProject,
                        longitude: Number(event.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-white/[0.08] bg-[#060b10] px-4 py-3 text-white outline-none transition focus:border-cyan-300/50"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-400">
                  {copy.status}
                </span>
                <input
                  type="text"
                  value={editingProject.status}
                  onChange={(event) =>
                    setEditingProject({
                      ...editingProject,
                      status: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-[#060b10] px-4 py-3 text-white outline-none transition focus:border-cyan-300/50"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingProject(null);
                }}
                className="rounded-xl border border-white/[0.08] px-5 py-3 font-semibold text-slate-400 transition hover:text-white"
              >
                {copy.cancel}
              </button>

              <button
                type="button"
                onClick={saveEditedProject}
                className="rounded-xl bg-cyan-300 px-5 py-3 font-black text-[#061015] transition hover:bg-cyan-200"
              >
                {copy.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}

      <NewProjectModal
        open={modalOpen}
        latitude={newLocation.latitude}
        longitude={newLocation.longitude}
        onClose={() => setModalOpen(false)}
        onSave={async (project) => {
          if (!user || !activeOrganizationId) return;

          const { error } = await supabase.from("projects").insert([
            {
              name: project.name,
              latitude: project.latitude,
              longitude: project.longitude,
              status: project.status,
              boundary: project.boundary,
              user_id: user.id,
              organization_id: activeOrganizationId,
            },
          ]);

          if (error) {
            console.error("CHYBA ULOŽENÍ PROJEKTU:", error);
            return;
          }

          await loadProjects(activeOrganizationId);

          setSelectedProject({
            ...project,
            id: undefined,
          });

          setModalOpen(false);
        }}
      />
    </main>
  );
}
