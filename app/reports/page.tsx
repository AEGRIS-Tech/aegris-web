"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "../context/LanguageContext";

type Project = {
  id: number;
  name: string;
  status: string | null;
  crop_name?: string | null;
  crop_variety?: string | null;
  area_ha?: number | null;
  created_at: string;
};

type Analysis = {
  id: number;
  project_id: number;
  ndvi: number;
  risk: string;
  created_at: string;
  valid_geometry_pct?: number | null;
  source_provider?: string | null;
  satellite_product?: string | null;
};

type Recommendation = {
  id: number;
  project_id: number;
  analysis_id: number | null;
  priority: string;
  score: number | null;
  created_at: string;
};

type ReportRow = {
  project: Project;
  analysis: Analysis | null;
  recommendation: Recommendation | null;
};

function getReportsCopy(language: string) {
  const en = {
    dashboard: "Dashboard",
    dashboardSubtitle: "System overview",
    aiAnalysis: "AI Analysis",
    aiAnalysisSubtitle: "Data analysis",
    map: "Map",
    mapSubtitle: "Project locations",
    projects: "Projects",
    projectsSubtitle: "Project management",
    reports: "Reports",
    reportsSubtitle: "Analysis results",
    settings: "Settings",
    settingsSubtitle: "Platform settings",
    sidebarDescription: "Latest analytical outputs for fields in the active organization.",
    availableReports: "Available reports",
    fieldReports: "Field reports",
    heroDescription: "Latest saved analyses, AEGRIS scores and data quality for fields in the active organization.",
    fields: "Fields",
    withAnalysis: "With analysis",
    loadingReports: "Loading reports…",
    noReports: "Nothing to report yet",
    noReportsDescription: "Create a project first and run at least one analysis.",
    openPortfolio: "Open Field Portfolio",
    latestState: "Latest analytical status",
    onePerField: "One current record per field",
    field: "Field",
    risk: "Risk",
    score: "AEGRIS score",
    quality: "Quality",
    analysis: "Analysis",
    actions: "Actions",
    cropNotSpecified: "Crop not specified",
    sourceNotSpecified: "Source not specified",
    priority: "Priority",
    openReport: "Open report →",
    noAnalysis: "This project does not have a saved analysis yet.",
    openProject: "Open project",
    footer: "Report Registry displays the latest saved analysis for each field. Report detail uses authoritative data stored in AEGRIS.",
    notSignedIn: "User is not signed in.",
    organizationLoadFailed: "Failed to load the active organization.",
    noActiveOrganization: "No active organization is set.",
    projectsLoadFailed: "Failed to load projects.",
    analysisReports: "Analysis Reports",
    operationsCenter: "Agronomic Operations Center",
    reportRegistry: "Report Registry",
    fieldHealth: "Field Health",
  };
  const cs = {
    dashboard: "Dashboard",
    dashboardSubtitle: "Přehled systému",
    aiAnalysis: "AI Analýza",
    aiAnalysisSubtitle: "Analýza dat",
    map: "Mapa",
    mapSubtitle: "Lokality projektů",
    projects: "Projekty",
    projectsSubtitle: "Správa projektů",
    reports: "Reporty",
    reportsSubtitle: "Výsledky analýz",
    settings: "Nastavení",
    settingsSubtitle: "Nastavení platformy",
    sidebarDescription: "Nejnovější analytické výstupy pro pozemky v aktivní organizaci.",
    availableReports: "Dostupné reporty",
    fieldReports: "Reporty pozemků",
    heroDescription: "Nejnovější uložené analýzy, AEGRIS skóre a kvalita dat pro pozemky v aktivní organizaci.",
    fields: "Pozemky",
    withAnalysis: "S analýzou",
    loadingReports: "Načítám reporty…",
    noReports: "Zatím není co reportovat",
    noReportsDescription: "Nejprve vytvořte projekt a spusťte alespoň jednu analýzu.",
    openPortfolio: "Otevřít portfolio pozemků",
    latestState: "Nejnovější analytický stav",
    onePerField: "Jeden aktuální záznam na pozemek",
    field: "Pozemek",
    risk: "Riziko",
    score: "AEGRIS skóre",
    quality: "Kvalita",
    analysis: "Analýza",
    actions: "Akce",
    cropNotSpecified: "Plodina neuvedena",
    sourceNotSpecified: "Zdroj neuveden",
    priority: "Priorita",
    openReport: "Otevřít report →",
    noAnalysis: "Tento projekt zatím nemá uloženou analýzu.",
    openProject: "Otevřít projekt",
    footer: "Registr reportů zobrazuje poslední uloženou analýzu každého pozemku. Detail reportu používá autoritativní data uložená v AEGRIS.",
    notSignedIn: "Uživatel není přihlášen.",
    organizationLoadFailed: "Nepodařilo se načíst aktivní organizaci.",
    noActiveOrganization: "Není nastavena aktivní organizace.",
    projectsLoadFailed: "Nepodařilo se načíst projekty.",
    analysisReports: "Analytické reporty",
    operationsCenter: "Agronomické operační centrum",
    reportRegistry: "Registr reportů",
    fieldHealth: "Stav pozemku",
  };
  const sk = {
    dashboard: "Dashboard",
    dashboardSubtitle: "Prehľad systému",
    aiAnalysis: "AI Analýza",
    aiAnalysisSubtitle: "Analýza dát",
    map: "Mapa",
    mapSubtitle: "Lokality projektov",
    projects: "Projekty",
    projectsSubtitle: "Správa projektov",
    reports: "Reporty",
    reportsSubtitle: "Výsledky analýz",
    settings: "Nastavenia",
    settingsSubtitle: "Nastavenia platformy",
    sidebarDescription: "Najnovšie analytické výstupy pre pozemky v aktívnej organizácii.",
    availableReports: "Dostupné reporty",
    fieldReports: "Reporty pozemkov",
    heroDescription: "Najnovšie uložené analýzy, AEGRIS skóre a kvalita dát pre pozemky v aktívnej organizácii.",
    fields: "Pozemky",
    withAnalysis: "S analýzou",
    loadingReports: "Načítavam reporty…",
    noReports: "Zatiaľ nie je čo reportovať",
    noReportsDescription: "Najprv vytvorte projekt a spustite aspoň jednu analýzu.",
    openPortfolio: "Otvoriť portfólio pozemkov",
    latestState: "Najnovší analytický stav",
    onePerField: "Jeden aktuálny záznam na pozemok",
    field: "Pozemok",
    risk: "Riziko",
    score: "AEGRIS skóre",
    quality: "Kvalita",
    analysis: "Analýza",
    actions: "Akcie",
    cropNotSpecified: "Plodina neuvedená",
    sourceNotSpecified: "Zdroj neuvedený",
    priority: "Priorita",
    openReport: "Otvoriť report →",
    noAnalysis: "Tento projekt zatiaľ nemá uloženú analýzu.",
    openProject: "Otvoriť projekt",
    footer: "Register reportov zobrazuje poslednú uloženú analýzu každého pozemku. Detail reportu používa autoritatívne dáta uložené v AEGRIS.",
    notSignedIn: "Používateľ nie je prihlásený.",
    organizationLoadFailed: "Nepodarilo sa načítať aktívnu organizáciu.",
    noActiveOrganization: "Nie je nastavená aktívna organizácia.",
    projectsLoadFailed: "Nepodarilo sa načítať projekty.",
    analysisReports: "Analytické reporty",
    operationsCenter: "Agronomické operačné centrum",
    reportRegistry: "Register reportov",
    fieldHealth: "Stav pozemku",
  };
  const de = {
    dashboard: "Dashboard",
    dashboardSubtitle: "Systemübersicht",
    aiAnalysis: "KI-Analyse",
    aiAnalysisSubtitle: "Datenanalyse",
    map: "Karte",
    mapSubtitle: "Projektstandorte",
    projects: "Projekte",
    projectsSubtitle: "Projektverwaltung",
    reports: "Berichte",
    reportsSubtitle: "Analyseergebnisse",
    settings: "Einstellungen",
    settingsSubtitle: "Plattformeinstellungen",
    sidebarDescription: "Neueste Analyseergebnisse für Felder der aktiven Organisation.",
    availableReports: "Verfügbare Berichte",
    fieldReports: "Feldberichte",
    heroDescription: "Neueste gespeicherte Analysen, AEGRIS-Scores und Datenqualität für Felder der aktiven Organisation.",
    fields: "Felder",
    withAnalysis: "Mit Analyse",
    loadingReports: "Berichte werden geladen…",
    noReports: "Noch nichts zu berichten",
    noReportsDescription: "Erstellen Sie zuerst ein Projekt und führen Sie mindestens eine Analyse aus.",
    openPortfolio: "Feldportfolio öffnen",
    latestState: "Neuester Analysestatus",
    onePerField: "Ein aktueller Datensatz pro Feld",
    field: "Feld",
    risk: "Risiko",
    score: "AEGRIS-Score",
    quality: "Qualität",
    analysis: "Analyse",
    actions: "Aktionen",
    cropNotSpecified: "Kultur nicht angegeben",
    sourceNotSpecified: "Quelle nicht angegeben",
    priority: "Priorität",
    openReport: "Bericht öffnen →",
    noAnalysis: "Für dieses Projekt ist noch keine Analyse gespeichert.",
    openProject: "Projekt öffnen",
    footer: "Das Berichtsregister zeigt die letzte gespeicherte Analyse jedes Feldes. Die Berichtsdetails verwenden autoritative, in AEGRIS gespeicherte Daten.",
    notSignedIn: "Benutzer ist nicht angemeldet.",
    organizationLoadFailed: "Aktive Organisation konnte nicht geladen werden.",
    noActiveOrganization: "Keine aktive Organisation festgelegt.",
    projectsLoadFailed: "Projekte konnten nicht geladen werden.",
    analysisReports: "Analyseberichte",
    operationsCenter: "Agronomisches Betriebszentrum",
    reportRegistry: "Berichtsregister",
    fieldHealth: "Feldzustand",
  };
  const pl = {
    dashboard: "Panel",
    dashboardSubtitle: "Przegląd systemu",
    aiAnalysis: "Analiza AI",
    aiAnalysisSubtitle: "Analiza danych",
    map: "Mapa",
    mapSubtitle: "Lokalizacje projektów",
    projects: "Projekty",
    projectsSubtitle: "Zarządzanie projektami",
    reports: "Raporty",
    reportsSubtitle: "Wyniki analiz",
    settings: "Ustawienia",
    settingsSubtitle: "Ustawienia platformy",
    sidebarDescription: "Najnowsze wyniki analityczne dla pól w aktywnej organizacji.",
    availableReports: "Dostępne raporty",
    fieldReports: "Raporty pól",
    heroDescription: "Najnowsze zapisane analizy, wyniki AEGRIS i jakość danych dla pól w aktywnej organizacji.",
    fields: "Pola",
    withAnalysis: "Z analizą",
    loadingReports: "Ładowanie raportów…",
    noReports: "Na razie brak raportów",
    noReportsDescription: "Najpierw utwórz projekt i uruchom co najmniej jedną analizę.",
    openPortfolio: "Otwórz portfolio pól",
    latestState: "Najnowszy stan analityczny",
    onePerField: "Jeden aktualny rekord na pole",
    field: "Pole",
    risk: "Ryzyko",
    score: "Wynik AEGRIS",
    quality: "Jakość",
    analysis: "Analiza",
    actions: "Akcje",
    cropNotSpecified: "Nie podano uprawy",
    sourceNotSpecified: "Nie podano źródła",
    priority: "Priorytet",
    openReport: "Otwórz raport →",
    noAnalysis: "Ten projekt nie ma jeszcze zapisanej analizy.",
    openProject: "Otwórz projekt",
    footer: "Rejestr raportów pokazuje ostatnią zapisaną analizę każdego pola. Szczegóły raportu korzystają z autorytatywnych danych zapisanych w AEGRIS.",
    notSignedIn: "Użytkownik nie jest zalogowany.",
    organizationLoadFailed: "Nie udało się załadować aktywnej organizacji.",
    noActiveOrganization: "Nie ustawiono aktywnej organizacji.",
    projectsLoadFailed: "Nie udało się załadować projektów.",
    analysisReports: "Raporty analityczne",
    operationsCenter: "Agronomiczne centrum operacyjne",
    reportRegistry: "Rejestr raportów",
    fieldHealth: "Stan pola",
  };
  const fr = {
    dashboard: "Tableau de bord",
    dashboardSubtitle: "Vue d’ensemble du système",
    aiAnalysis: "Analyse IA",
    aiAnalysisSubtitle: "Analyse des données",
    map: "Carte",
    mapSubtitle: "Emplacements des projets",
    projects: "Projets",
    projectsSubtitle: "Gestion des projets",
    reports: "Rapports",
    reportsSubtitle: "Résultats des analyses",
    settings: "Paramètres",
    settingsSubtitle: "Paramètres de la plateforme",
    sidebarDescription: "Derniers résultats analytiques des parcelles de l’organisation active.",
    availableReports: "Rapports disponibles",
    fieldReports: "Rapports de parcelles",
    heroDescription: "Dernières analyses enregistrées, scores AEGRIS et qualité des données des parcelles de l’organisation active.",
    fields: "Parcelles",
    withAnalysis: "Avec analyse",
    loadingReports: "Chargement des rapports…",
    noReports: "Rien à signaler pour le moment",
    noReportsDescription: "Créez d’abord un projet et lancez au moins une analyse.",
    openPortfolio: "Ouvrir le portefeuille de parcelles",
    latestState: "Dernier état analytique",
    onePerField: "Un enregistrement actuel par parcelle",
    field: "Parcelle",
    risk: "Risque",
    score: "Score AEGRIS",
    quality: "Qualité",
    analysis: "Analyse",
    actions: "Actions",
    cropNotSpecified: "Culture non renseignée",
    sourceNotSpecified: "Source non renseignée",
    priority: "Priorité",
    openReport: "Ouvrir le rapport →",
    noAnalysis: "Ce projet ne possède pas encore d’analyse enregistrée.",
    openProject: "Ouvrir le projet",
    footer: "Le registre des rapports affiche la dernière analyse enregistrée de chaque parcelle. Le détail utilise les données de référence stockées dans AEGRIS.",
    notSignedIn: "L’utilisateur n’est pas connecté.",
    organizationLoadFailed: "Impossible de charger l’organisation active.",
    noActiveOrganization: "Aucune organisation active n’est définie.",
    projectsLoadFailed: "Impossible de charger les projets.",
    analysisReports: "Rapports analytiques",
    operationsCenter: "Centre des opérations agronomiques",
    reportRegistry: "Registre des rapports",
    fieldHealth: "État de la parcelle",
  };
  const es = {
    dashboard: "Panel",
    dashboardSubtitle: "Resumen del sistema",
    aiAnalysis: "Análisis IA",
    aiAnalysisSubtitle: "Análisis de datos",
    map: "Mapa",
    mapSubtitle: "Ubicaciones de proyectos",
    projects: "Proyectos",
    projectsSubtitle: "Gestión de proyectos",
    reports: "Informes",
    reportsSubtitle: "Resultados de análisis",
    settings: "Configuración",
    settingsSubtitle: "Configuración de la plataforma",
    sidebarDescription: "Últimos resultados analíticos de los campos de la organización activa.",
    availableReports: "Informes disponibles",
    fieldReports: "Informes de campo",
    heroDescription: "Últimos análisis guardados, puntuaciones AEGRIS y calidad de datos de los campos de la organización activa.",
    fields: "Campos",
    withAnalysis: "Con análisis",
    loadingReports: "Cargando informes…",
    noReports: "Aún no hay nada que informar",
    noReportsDescription: "Cree primero un proyecto y ejecute al menos un análisis.",
    openPortfolio: "Abrir cartera de campos",
    latestState: "Último estado analítico",
    onePerField: "Un registro actual por campo",
    field: "Campo",
    risk: "Riesgo",
    score: "Puntuación AEGRIS",
    quality: "Calidad",
    analysis: "Análisis",
    actions: "Acciones",
    cropNotSpecified: "Cultivo no especificado",
    sourceNotSpecified: "Fuente no especificada",
    priority: "Prioridad",
    openReport: "Abrir informe →",
    noAnalysis: "Este proyecto aún no tiene un análisis guardado.",
    openProject: "Abrir proyecto",
    footer: "El registro de informes muestra el último análisis guardado de cada campo. El detalle utiliza datos autorizados almacenados en AEGRIS.",
    notSignedIn: "El usuario no ha iniciado sesión.",
    organizationLoadFailed: "No se pudo cargar la organización activa.",
    noActiveOrganization: "No hay ninguna organización activa configurada.",
    projectsLoadFailed: "No se pudieron cargar los proyectos.",
    analysisReports: "Informes analíticos",
    operationsCenter: "Centro de operaciones agronómicas",
    reportRegistry: "Registro de informes",
    fieldHealth: "Estado del campo",
  };
  const it = {
    dashboard: "Dashboard",
    dashboardSubtitle: "Panoramica del sistema",
    aiAnalysis: "Analisi IA",
    aiAnalysisSubtitle: "Analisi dei dati",
    map: "Mappa",
    mapSubtitle: "Posizioni dei progetti",
    projects: "Progetti",
    projectsSubtitle: "Gestione progetti",
    reports: "Report",
    reportsSubtitle: "Risultati delle analisi",
    settings: "Impostazioni",
    settingsSubtitle: "Impostazioni piattaforma",
    sidebarDescription: "Ultimi risultati analitici dei campi nell’organizzazione attiva.",
    availableReports: "Report disponibili",
    fieldReports: "Report dei campi",
    heroDescription: "Ultime analisi salvate, punteggi AEGRIS e qualità dei dati dei campi nell’organizzazione attiva.",
    fields: "Campi",
    withAnalysis: "Con analisi",
    loadingReports: "Caricamento report…",
    noReports: "Ancora nulla da segnalare",
    noReportsDescription: "Crea prima un progetto ed esegui almeno un’analisi.",
    openPortfolio: "Apri portfolio campi",
    latestState: "Stato analitico più recente",
    onePerField: "Un record corrente per campo",
    field: "Campo",
    risk: "Rischio",
    score: "Punteggio AEGRIS",
    quality: "Qualità",
    analysis: "Analisi",
    actions: "Azioni",
    cropNotSpecified: "Coltura non specificata",
    sourceNotSpecified: "Fonte non specificata",
    priority: "Priorità",
    openReport: "Apri report →",
    noAnalysis: "Questo progetto non ha ancora un’analisi salvata.",
    openProject: "Apri progetto",
    footer: "Il registro report mostra l’ultima analisi salvata per ogni campo. Il dettaglio usa i dati autorevoli memorizzati in AEGRIS.",
    notSignedIn: "L’utente non ha effettuato l’accesso.",
    organizationLoadFailed: "Impossibile caricare l’organizzazione attiva.",
    noActiveOrganization: "Nessuna organizzazione attiva impostata.",
    projectsLoadFailed: "Impossibile caricare i progetti.",
    analysisReports: "Report analitici",
    operationsCenter: "Centro operativo agronomico",
    reportRegistry: "Registro report",
    fieldHealth: "Stato del campo",
  };
  const nl = {
    dashboard: "Dashboard",
    dashboardSubtitle: "Systeemoverzicht",
    aiAnalysis: "AI-analyse",
    aiAnalysisSubtitle: "Gegevensanalyse",
    map: "Kaart",
    mapSubtitle: "Projectlocaties",
    projects: "Projecten",
    projectsSubtitle: "Projectbeheer",
    reports: "Rapporten",
    reportsSubtitle: "Analyseresultaten",
    settings: "Instellingen",
    settingsSubtitle: "Platforminstellingen",
    sidebarDescription: "Nieuwste analyseresultaten voor velden in de actieve organisatie.",
    availableReports: "Beschikbare rapporten",
    fieldReports: "Veldrapporten",
    heroDescription: "Nieuwste opgeslagen analyses, AEGRIS-scores en gegevenskwaliteit voor velden in de actieve organisatie.",
    fields: "Velden",
    withAnalysis: "Met analyse",
    loadingReports: "Rapporten laden…",
    noReports: "Nog niets te rapporteren",
    noReportsDescription: "Maak eerst een project en voer ten minste één analyse uit.",
    openPortfolio: "Veldportfolio openen",
    latestState: "Nieuwste analytische status",
    onePerField: "Eén actueel record per veld",
    field: "Veld",
    risk: "Risico",
    score: "AEGRIS-score",
    quality: "Kwaliteit",
    analysis: "Analyse",
    actions: "Acties",
    cropNotSpecified: "Gewas niet opgegeven",
    sourceNotSpecified: "Bron niet opgegeven",
    priority: "Prioriteit",
    openReport: "Rapport openen →",
    noAnalysis: "Dit project heeft nog geen opgeslagen analyse.",
    openProject: "Project openen",
    footer: "Het rapportregister toont de laatst opgeslagen analyse van elk veld. Rapportdetails gebruiken gezaghebbende gegevens die in AEGRIS zijn opgeslagen.",
    notSignedIn: "Gebruiker is niet aangemeld.",
    organizationLoadFailed: "Actieve organisatie kon niet worden geladen.",
    noActiveOrganization: "Er is geen actieve organisatie ingesteld.",
    projectsLoadFailed: "Projecten konden niet worden geladen.",
    analysisReports: "Analyserapporten",
    operationsCenter: "Agronomisch operationeel centrum",
    reportRegistry: "Rapportregister",
    fieldHealth: "Veldstatus",
  };
  const pt = {
    dashboard: "Painel",
    dashboardSubtitle: "Visão geral do sistema",
    aiAnalysis: "Análise IA",
    aiAnalysisSubtitle: "Análise de dados",
    map: "Mapa",
    mapSubtitle: "Localizações dos projetos",
    projects: "Projetos",
    projectsSubtitle: "Gestão de projetos",
    reports: "Relatórios",
    reportsSubtitle: "Resultados das análises",
    settings: "Definições",
    settingsSubtitle: "Definições da plataforma",
    sidebarDescription: "Resultados analíticos mais recentes dos campos da organização ativa.",
    availableReports: "Relatórios disponíveis",
    fieldReports: "Relatórios de campo",
    heroDescription: "Últimas análises guardadas, pontuações AEGRIS e qualidade dos dados dos campos da organização ativa.",
    fields: "Campos",
    withAnalysis: "Com análise",
    loadingReports: "A carregar relatórios…",
    noReports: "Ainda não há nada a reportar",
    noReportsDescription: "Crie primeiro um projeto e execute pelo menos uma análise.",
    openPortfolio: "Abrir portefólio de campos",
    latestState: "Estado analítico mais recente",
    onePerField: "Um registo atual por campo",
    field: "Campo",
    risk: "Risco",
    score: "Pontuação AEGRIS",
    quality: "Qualidade",
    analysis: "Análise",
    actions: "Ações",
    cropNotSpecified: "Cultura não especificada",
    sourceNotSpecified: "Fonte não especificada",
    priority: "Prioridade",
    openReport: "Abrir relatório →",
    noAnalysis: "Este projeto ainda não tem uma análise guardada.",
    openProject: "Abrir projeto",
    footer: "O registo de relatórios mostra a última análise guardada de cada campo. O detalhe usa dados autorizados armazenados no AEGRIS.",
    notSignedIn: "O utilizador não iniciou sessão.",
    organizationLoadFailed: "Não foi possível carregar a organização ativa.",
    noActiveOrganization: "Não está definida uma organização ativa.",
    projectsLoadFailed: "Não foi possível carregar os projetos.",
    analysisReports: "Relatórios analíticos",
    operationsCenter: "Centro de operações agronómicas",
    reportRegistry: "Registo de relatórios",
    fieldHealth: "Estado do campo",
  };
  const ro = {
    dashboard: "Panou",
    dashboardSubtitle: "Prezentare generală a sistemului",
    aiAnalysis: "Analiză AI",
    aiAnalysisSubtitle: "Analiza datelor",
    map: "Hartă",
    mapSubtitle: "Locațiile proiectelor",
    projects: "Proiecte",
    projectsSubtitle: "Gestionarea proiectelor",
    reports: "Rapoarte",
    reportsSubtitle: "Rezultatele analizelor",
    settings: "Setări",
    settingsSubtitle: "Setările platformei",
    sidebarDescription: "Cele mai recente rezultate analitice pentru parcelele organizației active.",
    availableReports: "Rapoarte disponibile",
    fieldReports: "Rapoarte de parcelă",
    heroDescription: "Cele mai recente analize salvate, scoruri AEGRIS și calitatea datelor pentru parcelele organizației active.",
    fields: "Parcelele",
    withAnalysis: "Cu analiză",
    loadingReports: "Se încarcă rapoartele…",
    noReports: "Încă nu există nimic de raportat",
    noReportsDescription: "Creați mai întâi un proiect și rulați cel puțin o analiză.",
    openPortfolio: "Deschide portofoliul de parcele",
    latestState: "Cea mai recentă stare analitică",
    onePerField: "O înregistrare curentă per parcelă",
    field: "Parcelă",
    risk: "Risc",
    score: "Scor AEGRIS",
    quality: "Calitate",
    analysis: "Analiză",
    actions: "Acțiuni",
    cropNotSpecified: "Cultură nespecificată",
    sourceNotSpecified: "Sursă nespecificată",
    priority: "Prioritate",
    openReport: "Deschide raportul →",
    noAnalysis: "Acest proiect nu are încă o analiză salvată.",
    openProject: "Deschide proiectul",
    footer: "Registrul rapoartelor afișează ultima analiză salvată pentru fiecare parcelă. Detaliul folosește datele autorizate stocate în AEGRIS.",
    notSignedIn: "Utilizatorul nu este autentificat.",
    organizationLoadFailed: "Organizația activă nu a putut fi încărcată.",
    noActiveOrganization: "Nu este setată nicio organizație activă.",
    projectsLoadFailed: "Proiectele nu au putut fi încărcate.",
    analysisReports: "Rapoarte analitice",
    operationsCenter: "Centru de operațiuni agronomice",
    reportRegistry: "Registrul rapoartelor",
    fieldHealth: "Starea parcelei",
  };
  const hu = {
    dashboard: "Irányítópult",
    dashboardSubtitle: "Rendszeráttekintés",
    aiAnalysis: "AI-elemzés",
    aiAnalysisSubtitle: "Adatelemzés",
    map: "Térkép",
    mapSubtitle: "Projekthelyszínek",
    projects: "Projektek",
    projectsSubtitle: "Projektkezelés",
    reports: "Jelentések",
    reportsSubtitle: "Elemzési eredmények",
    settings: "Beállítások",
    settingsSubtitle: "Platformbeállítások",
    sidebarDescription: "Az aktív szervezet tábláinak legfrissebb analitikai eredményei.",
    availableReports: "Elérhető jelentések",
    fieldReports: "Táblajelentések",
    heroDescription: "Az aktív szervezet tábláinak legfrissebb mentett elemzései, AEGRIS-pontszámai és adatminősége.",
    fields: "Táblák",
    withAnalysis: "Elemzéssel",
    loadingReports: "Jelentések betöltése…",
    noReports: "Még nincs jelenthető adat",
    noReportsDescription: "Először hozzon létre egy projektet, és futtasson legalább egy elemzést.",
    openPortfolio: "Táblaportfólió megnyitása",
    latestState: "Legfrissebb analitikai állapot",
    onePerField: "Táblánként egy aktuális rekord",
    field: "Tábla",
    risk: "Kockázat",
    score: "AEGRIS-pontszám",
    quality: "Minőség",
    analysis: "Elemzés",
    actions: "Műveletek",
    cropNotSpecified: "Növény nincs megadva",
    sourceNotSpecified: "Forrás nincs megadva",
    priority: "Prioritás",
    openReport: "Jelentés megnyitása →",
    noAnalysis: "Ehhez a projekthez még nincs mentett elemzés.",
    openProject: "Projekt megnyitása",
    footer: "A jelentésnyilvántartás táblánként a legutóbbi mentett elemzést mutatja. A részletek az AEGRIS-ben tárolt hiteles adatokat használják.",
    notSignedIn: "A felhasználó nincs bejelentkezve.",
    organizationLoadFailed: "Az aktív szervezet betöltése sikertelen.",
    noActiveOrganization: "Nincs aktív szervezet beállítva.",
    projectsLoadFailed: "A projektek betöltése sikertelen.",
    analysisReports: "Analitikai jelentések",
    operationsCenter: "Agronómiai műveleti központ",
    reportRegistry: "Jelentésnyilvántartás",
    fieldHealth: "Tábla állapota",
  };
  const uk = {
    dashboard: "Панель",
    dashboardSubtitle: "Огляд системи",
    aiAnalysis: "Аналіз ШІ",
    aiAnalysisSubtitle: "Аналіз даних",
    map: "Карта",
    mapSubtitle: "Розташування проєктів",
    projects: "Проєкти",
    projectsSubtitle: "Керування проєктами",
    reports: "Звіти",
    reportsSubtitle: "Результати аналізів",
    settings: "Налаштування",
    settingsSubtitle: "Налаштування платформи",
    sidebarDescription: "Останні аналітичні результати для полів активної організації.",
    availableReports: "Доступні звіти",
    fieldReports: "Звіти полів",
    heroDescription: "Останні збережені аналізи, оцінки AEGRIS і якість даних для полів активної організації.",
    fields: "Поля",
    withAnalysis: "З аналізом",
    loadingReports: "Завантаження звітів…",
    noReports: "Поки немає даних для звіту",
    noReportsDescription: "Спочатку створіть проєкт і виконайте принаймні один аналіз.",
    openPortfolio: "Відкрити портфель полів",
    latestState: "Останній аналітичний стан",
    onePerField: "Один актуальний запис на поле",
    field: "Поле",
    risk: "Ризик",
    score: "Оцінка AEGRIS",
    quality: "Якість",
    analysis: "Аналіз",
    actions: "Дії",
    cropNotSpecified: "Культуру не вказано",
    sourceNotSpecified: "Джерело не вказано",
    priority: "Пріоритет",
    openReport: "Відкрити звіт →",
    noAnalysis: "Цей проєкт ще не має збереженого аналізу.",
    openProject: "Відкрити проєкт",
    footer: "Реєстр звітів показує останній збережений аналіз кожного поля. Деталі використовують авторитетні дані, збережені в AEGRIS.",
    notSignedIn: "Користувач не увійшов у систему.",
    organizationLoadFailed: "Не вдалося завантажити активну організацію.",
    noActiveOrganization: "Активну організацію не встановлено.",
    projectsLoadFailed: "Не вдалося завантажити проєкти.",
    analysisReports: "Аналітичні звіти",
    operationsCenter: "Агрономічний операційний центр",
    reportRegistry: "Реєстр звітів",
    fieldHealth: "Стан поля",
  };
  const bg = {
    dashboard: "Табло",
    dashboardSubtitle: "Преглед на системата",
    aiAnalysis: "AI анализ",
    aiAnalysisSubtitle: "Анализ на данни",
    map: "Карта",
    mapSubtitle: "Местоположения на проекти",
    projects: "Проекти",
    projectsSubtitle: "Управление на проекти",
    reports: "Отчети",
    reportsSubtitle: "Резултати от анализи",
    settings: "Настройки",
    settingsSubtitle: "Настройки на платформата",
    sidebarDescription: "Най-новите аналитични резултати за полетата в активната организация.",
    availableReports: "Налични отчети",
    fieldReports: "Отчети за полета",
    heroDescription: "Последните запазени анализи, AEGRIS оценки и качество на данните за полетата в активната организация.",
    fields: "Полета",
    withAnalysis: "С анализ",
    loadingReports: "Зареждане на отчети…",
    noReports: "Все още няма какво да се отчете",
    noReportsDescription: "Първо създайте проект и изпълнете поне един анализ.",
    openPortfolio: "Отвори портфолиото от полета",
    latestState: "Последно аналитично състояние",
    onePerField: "Един актуален запис на поле",
    field: "Поле",
    risk: "Риск",
    score: "AEGRIS оценка",
    quality: "Качество",
    analysis: "Анализ",
    actions: "Действия",
    cropNotSpecified: "Културата не е посочена",
    sourceNotSpecified: "Източникът не е посочен",
    priority: "Приоритет",
    openReport: "Отвори отчет →",
    noAnalysis: "Този проект все още няма запазен анализ.",
    openProject: "Отвори проект",
    footer: "Регистърът на отчетите показва последния запазен анализ за всяко поле. Детайлът използва авторитетни данни, съхранявани в AEGRIS.",
    notSignedIn: "Потребителят не е влязъл.",
    organizationLoadFailed: "Активната организация не можа да бъде заредена.",
    noActiveOrganization: "Няма зададена активна организация.",
    projectsLoadFailed: "Проектите не можаха да бъдат заредени.",
    analysisReports: "Аналитични отчети",
    operationsCenter: "Агрономически оперативен център",
    reportRegistry: "Регистър на отчетите",
    fieldHealth: "Състояние на полето",
  };
  const hr = {
    dashboard: "Nadzorna ploča",
    dashboardSubtitle: "Pregled sustava",
    aiAnalysis: "AI analiza",
    aiAnalysisSubtitle: "Analiza podataka",
    map: "Karta",
    mapSubtitle: "Lokacije projekata",
    projects: "Projekti",
    projectsSubtitle: "Upravljanje projektima",
    reports: "Izvještaji",
    reportsSubtitle: "Rezultati analiza",
    settings: "Postavke",
    settingsSubtitle: "Postavke platforme",
    sidebarDescription: "Najnoviji analitički rezultati za polja u aktivnoj organizaciji.",
    availableReports: "Dostupni izvještaji",
    fieldReports: "Izvještaji polja",
    heroDescription: "Najnovije spremljene analize, AEGRIS rezultati i kvaliteta podataka za polja u aktivnoj organizaciji.",
    fields: "Polja",
    withAnalysis: "S analizom",
    loadingReports: "Učitavanje izvještaja…",
    noReports: "Još nema podataka za izvještaj",
    noReportsDescription: "Najprije izradite projekt i pokrenite barem jednu analizu.",
    openPortfolio: "Otvori portfelj polja",
    latestState: "Najnovije analitičko stanje",
    onePerField: "Jedan aktualni zapis po polju",
    field: "Polje",
    risk: "Rizik",
    score: "AEGRIS rezultat",
    quality: "Kvaliteta",
    analysis: "Analiza",
    actions: "Radnje",
    cropNotSpecified: "Kultura nije navedena",
    sourceNotSpecified: "Izvor nije naveden",
    priority: "Prioritet",
    openReport: "Otvori izvještaj →",
    noAnalysis: "Ovaj projekt još nema spremljenu analizu.",
    openProject: "Otvori projekt",
    footer: "Registar izvještaja prikazuje posljednju spremljenu analizu svakog polja. Detalj koristi autoritativne podatke pohranjene u AEGRIS-u.",
    notSignedIn: "Korisnik nije prijavljen.",
    organizationLoadFailed: "Aktivnu organizaciju nije moguće učitati.",
    noActiveOrganization: "Nije postavljena aktivna organizacija.",
    projectsLoadFailed: "Projekte nije moguće učitati.",
    analysisReports: "Analitički izvještaji",
    operationsCenter: "Agronomski operativni centar",
    reportRegistry: "Registar izvještaja",
    fieldHealth: "Stanje polja",
  };
  const sl = {
    dashboard: "Nadzorna plošča",
    dashboardSubtitle: "Pregled sistema",
    aiAnalysis: "AI analiza",
    aiAnalysisSubtitle: "Analiza podatkov",
    map: "Zemljevid",
    mapSubtitle: "Lokacije projektov",
    projects: "Projekti",
    projectsSubtitle: "Upravljanje projektov",
    reports: "Poročila",
    reportsSubtitle: "Rezultati analiz",
    settings: "Nastavitve",
    settingsSubtitle: "Nastavitve platforme",
    sidebarDescription: "Najnovejši analitični rezultati za polja v aktivni organizaciji.",
    availableReports: "Razpoložljiva poročila",
    fieldReports: "Poročila polj",
    heroDescription: "Najnovejše shranjene analize, ocene AEGRIS in kakovost podatkov za polja v aktivni organizaciji.",
    fields: "Polja",
    withAnalysis: "Z analizo",
    loadingReports: "Nalaganje poročil…",
    noReports: "Za zdaj ni ničesar za poročanje",
    noReportsDescription: "Najprej ustvarite projekt in izvedite vsaj eno analizo.",
    openPortfolio: "Odpri portfelj polj",
    latestState: "Najnovejše analitično stanje",
    onePerField: "En trenutni zapis na polje",
    field: "Polje",
    risk: "Tveganje",
    score: "Ocena AEGRIS",
    quality: "Kakovost",
    analysis: "Analiza",
    actions: "Dejanja",
    cropNotSpecified: "Poljščina ni navedena",
    sourceNotSpecified: "Vir ni naveden",
    priority: "Prioriteta",
    openReport: "Odpri poročilo →",
    noAnalysis: "Ta projekt še nima shranjene analize.",
    openProject: "Odpri projekt",
    footer: "Register poročil prikazuje zadnjo shranjeno analizo vsakega polja. Podrobnosti uporabljajo avtoritativne podatke, shranjene v AEGRIS.",
    notSignedIn: "Uporabnik ni prijavljen.",
    organizationLoadFailed: "Aktivne organizacije ni bilo mogoče naložiti.",
    noActiveOrganization: "Aktivna organizacija ni nastavljena.",
    projectsLoadFailed: "Projektov ni bilo mogoče naložiti.",
    analysisReports: "Analitična poročila",
    operationsCenter: "Agronomski operativni center",
    reportRegistry: "Register poročil",
    fieldHealth: "Stanje polja",
  };
  const lt = {
    dashboard: "Prietaisų skydas",
    dashboardSubtitle: "Sistemos apžvalga",
    aiAnalysis: "DI analizė",
    aiAnalysisSubtitle: "Duomenų analizė",
    map: "Žemėlapis",
    mapSubtitle: "Projektų vietos",
    projects: "Projektai",
    projectsSubtitle: "Projektų valdymas",
    reports: "Ataskaitos",
    reportsSubtitle: "Analizių rezultatai",
    settings: "Nustatymai",
    settingsSubtitle: "Platformos nustatymai",
    sidebarDescription: "Naujausi aktyvios organizacijos laukų analizės rezultatai.",
    availableReports: "Galimos ataskaitos",
    fieldReports: "Laukų ataskaitos",
    heroDescription: "Naujausios išsaugotos analizės, AEGRIS balai ir aktyvios organizacijos laukų duomenų kokybė.",
    fields: "Laukai",
    withAnalysis: "Su analize",
    loadingReports: "Įkeliamos ataskaitos…",
    noReports: "Kol kas nėra ką pateikti",
    noReportsDescription: "Pirmiausia sukurkite projektą ir atlikite bent vieną analizę.",
    openPortfolio: "Atidaryti laukų portfelį",
    latestState: "Naujausia analitinė būsena",
    onePerField: "Vienas dabartinis įrašas vienam laukui",
    field: "Laukas",
    risk: "Rizika",
    score: "AEGRIS balas",
    quality: "Kokybė",
    analysis: "Analizė",
    actions: "Veiksmai",
    cropNotSpecified: "Kultūra nenurodyta",
    sourceNotSpecified: "Šaltinis nenurodytas",
    priority: "Prioritetas",
    openReport: "Atidaryti ataskaitą →",
    noAnalysis: "Šis projektas dar neturi išsaugotos analizės.",
    openProject: "Atidaryti projektą",
    footer: "Ataskaitų registre rodoma paskutinė išsaugota kiekvieno lauko analizė. Detalėse naudojami AEGRIS saugomi autoritetingi duomenys.",
    notSignedIn: "Naudotojas neprisijungęs.",
    organizationLoadFailed: "Nepavyko įkelti aktyvios organizacijos.",
    noActiveOrganization: "Aktyvi organizacija nenustatyta.",
    projectsLoadFailed: "Nepavyko įkelti projektų.",
    analysisReports: "Analitinės ataskaitos",
    operationsCenter: "Agronominių operacijų centras",
    reportRegistry: "Ataskaitų registras",
    fieldHealth: "Lauko būklė",
  };
  const lv = {
    dashboard: "Informācijas panelis",
    dashboardSubtitle: "Sistēmas pārskats",
    aiAnalysis: "MI analīze",
    aiAnalysisSubtitle: "Datu analīze",
    map: "Karte",
    mapSubtitle: "Projektu atrašanās vietas",
    projects: "Projekti",
    projectsSubtitle: "Projektu pārvaldība",
    reports: "Pārskati",
    reportsSubtitle: "Analīžu rezultāti",
    settings: "Iestatījumi",
    settingsSubtitle: "Platformas iestatījumi",
    sidebarDescription: "Jaunākie analītiskie rezultāti aktīvās organizācijas laukiem.",
    availableReports: "Pieejamie pārskati",
    fieldReports: "Lauku pārskati",
    heroDescription: "Jaunākās saglabātās analīzes, AEGRIS vērtējumi un datu kvalitāte aktīvās organizācijas laukiem.",
    fields: "Lauki",
    withAnalysis: "Ar analīzi",
    loadingReports: "Ielādē pārskatus…",
    noReports: "Pagaidām nav ko ziņot",
    noReportsDescription: "Vispirms izveidojiet projektu un palaidiet vismaz vienu analīzi.",
    openPortfolio: "Atvērt lauku portfeli",
    latestState: "Jaunākais analītiskais stāvoklis",
    onePerField: "Viens aktuāls ieraksts katram laukam",
    field: "Lauks",
    risk: "Risks",
    score: "AEGRIS vērtējums",
    quality: "Kvalitāte",
    analysis: "Analīze",
    actions: "Darbības",
    cropNotSpecified: "Kultūra nav norādīta",
    sourceNotSpecified: "Avots nav norādīts",
    priority: "Prioritāte",
    openReport: "Atvērt pārskatu →",
    noAnalysis: "Šim projektam vēl nav saglabātas analīzes.",
    openProject: "Atvērt projektu",
    footer: "Pārskatu reģistrs rāda katra lauka pēdējo saglabāto analīzi. Detalizētajā skatā izmantoti AEGRIS glabātie autoritatīvie dati.",
    notSignedIn: "Lietotājs nav pierakstījies.",
    organizationLoadFailed: "Neizdevās ielādēt aktīvo organizāciju.",
    noActiveOrganization: "Aktīvā organizācija nav iestatīta.",
    projectsLoadFailed: "Neizdevās ielādēt projektus.",
    analysisReports: "Analītiskie pārskati",
    operationsCenter: "Agronomisko operāciju centrs",
    reportRegistry: "Pārskatu reģistrs",
    fieldHealth: "Lauka stāvoklis",
  };
  const et = {
    dashboard: "Töölaud",
    dashboardSubtitle: "Süsteemi ülevaade",
    aiAnalysis: "AI-analüüs",
    aiAnalysisSubtitle: "Andmeanalüüs",
    map: "Kaart",
    mapSubtitle: "Projektide asukohad",
    projects: "Projektid",
    projectsSubtitle: "Projektihaldus",
    reports: "Aruanded",
    reportsSubtitle: "Analüüside tulemused",
    settings: "Seaded",
    settingsSubtitle: "Platvormi seaded",
    sidebarDescription: "Aktiivse organisatsiooni põldude uusimad analüüsitulemused.",
    availableReports: "Saadaolevad aruanded",
    fieldReports: "Põlluaruanded",
    heroDescription: "Aktiivse organisatsiooni põldude uusimad salvestatud analüüsid, AEGRIS skoorid ja andmekvaliteet.",
    fields: "Põllud",
    withAnalysis: "Analüüsiga",
    loadingReports: "Aruannete laadimine…",
    noReports: "Praegu pole midagi raporteerida",
    noReportsDescription: "Looge esmalt projekt ja käivitage vähemalt üks analüüs.",
    openPortfolio: "Ava põldude portfell",
    latestState: "Uusim analüütiline olek",
    onePerField: "Üks ajakohane kirje põllu kohta",
    field: "Põld",
    risk: "Risk",
    score: "AEGRIS skoor",
    quality: "Kvaliteet",
    analysis: "Analüüs",
    actions: "Toimingud",
    cropNotSpecified: "Kultuur pole määratud",
    sourceNotSpecified: "Allikas pole määratud",
    priority: "Prioriteet",
    openReport: "Ava aruanne →",
    noAnalysis: "Sellel projektil pole veel salvestatud analüüsi.",
    openProject: "Ava projekt",
    footer: "Aruannete register näitab iga põllu viimast salvestatud analüüsi. Detailvaade kasutab AEGRIS-es talletatud autoriteetseid andmeid.",
    notSignedIn: "Kasutaja pole sisse logitud.",
    organizationLoadFailed: "Aktiivse organisatsiooni laadimine ebaõnnestus.",
    noActiveOrganization: "Aktiivset organisatsiooni pole määratud.",
    projectsLoadFailed: "Projektide laadimine ebaõnnestus.",
    analysisReports: "Analüüsiaruanded",
    operationsCenter: "Agronoomiliste operatsioonide keskus",
    reportRegistry: "Aruannete register",
    fieldHealth: "Põllu seisund",
  };
  const el = {
    dashboard: "Πίνακας ελέγχου",
    dashboardSubtitle: "Επισκόπηση συστήματος",
    aiAnalysis: "Ανάλυση AI",
    aiAnalysisSubtitle: "Ανάλυση δεδομένων",
    map: "Χάρτης",
    mapSubtitle: "Τοποθεσίες έργων",
    projects: "Έργα",
    projectsSubtitle: "Διαχείριση έργων",
    reports: "Αναφορές",
    reportsSubtitle: "Αποτελέσματα αναλύσεων",
    settings: "Ρυθμίσεις",
    settingsSubtitle: "Ρυθμίσεις πλατφόρμας",
    sidebarDescription: "Τα πιο πρόσφατα αναλυτικά αποτελέσματα για τους αγρούς του ενεργού οργανισμού.",
    availableReports: "Διαθέσιμες αναφορές",
    fieldReports: "Αναφορές αγρών",
    heroDescription: "Οι τελευταίες αποθηκευμένες αναλύσεις, βαθμολογίες AEGRIS και ποιότητα δεδομένων για τους αγρούς του ενεργού οργανισμού.",
    fields: "Αγροί",
    withAnalysis: "Με ανάλυση",
    loadingReports: "Φόρτωση αναφορών…",
    noReports: "Δεν υπάρχει ακόμη κάτι προς αναφορά",
    noReportsDescription: "Δημιουργήστε πρώτα ένα έργο και εκτελέστε τουλάχιστον μία ανάλυση.",
    openPortfolio: "Άνοιγμα χαρτοφυλακίου αγρών",
    latestState: "Τελευταία αναλυτική κατάσταση",
    onePerField: "Μία τρέχουσα εγγραφή ανά αγρό",
    field: "Αγρός",
    risk: "Κίνδυνος",
    score: "Βαθμολογία AEGRIS",
    quality: "Ποιότητα",
    analysis: "Ανάλυση",
    actions: "Ενέργειες",
    cropNotSpecified: "Δεν έχει οριστεί καλλιέργεια",
    sourceNotSpecified: "Δεν έχει οριστεί πηγή",
    priority: "Προτεραιότητα",
    openReport: "Άνοιγμα αναφοράς →",
    noAnalysis: "Αυτό το έργο δεν έχει ακόμη αποθηκευμένη ανάλυση.",
    openProject: "Άνοιγμα έργου",
    footer: "Το μητρώο αναφορών εμφανίζει την τελευταία αποθηκευμένη ανάλυση κάθε αγρού. Η λεπτομέρεια χρησιμοποιεί έγκυρα δεδομένα που είναι αποθηκευμένα στο AEGRIS.",
    notSignedIn: "Ο χρήστης δεν είναι συνδεδεμένος.",
    organizationLoadFailed: "Αποτυχία φόρτωσης του ενεργού οργανισμού.",
    noActiveOrganization: "Δεν έχει οριστεί ενεργός οργανισμός.",
    projectsLoadFailed: "Αποτυχία φόρτωσης των έργων.",
    analysisReports: "Αναλυτικές αναφορές",
    operationsCenter: "Κέντρο αγρονομικών επιχειρήσεων",
    reportRegistry: "Μητρώο αναφορών",
    fieldHealth: "Κατάσταση αγρού",
  };
  const sv = {
    dashboard: "Instrumentpanel",
    dashboardSubtitle: "Systemöversikt",
    aiAnalysis: "AI-analys",
    aiAnalysisSubtitle: "Dataanalys",
    map: "Karta",
    mapSubtitle: "Projektplatser",
    projects: "Projekt",
    projectsSubtitle: "Projekthantering",
    reports: "Rapporter",
    reportsSubtitle: "Analysresultat",
    settings: "Inställningar",
    settingsSubtitle: "Plattformsinställningar",
    sidebarDescription: "Senaste analysresultaten för fält i den aktiva organisationen.",
    availableReports: "Tillgängliga rapporter",
    fieldReports: "Fältrapporter",
    heroDescription: "Senaste sparade analyser, AEGRIS-poäng och datakvalitet för fält i den aktiva organisationen.",
    fields: "Fält",
    withAnalysis: "Med analys",
    loadingReports: "Laddar rapporter…",
    noReports: "Inget att rapportera ännu",
    noReportsDescription: "Skapa först ett projekt och kör minst en analys.",
    openPortfolio: "Öppna fältportfölj",
    latestState: "Senaste analytiska status",
    onePerField: "En aktuell post per fält",
    field: "Fält",
    risk: "Risk",
    score: "AEGRIS-poäng",
    quality: "Kvalitet",
    analysis: "Analys",
    actions: "Åtgärder",
    cropNotSpecified: "Gröda ej angiven",
    sourceNotSpecified: "Källa ej angiven",
    priority: "Prioritet",
    openReport: "Öppna rapport →",
    noAnalysis: "Det här projektet har ännu ingen sparad analys.",
    openProject: "Öppna projekt",
    footer: "Rapportregistret visar den senast sparade analysen för varje fält. Rapportdetaljen använder auktoritativa data lagrade i AEGRIS.",
    notSignedIn: "Användaren är inte inloggad.",
    organizationLoadFailed: "Det gick inte att läsa in den aktiva organisationen.",
    noActiveOrganization: "Ingen aktiv organisation är inställd.",
    projectsLoadFailed: "Det gick inte att läsa in projekten.",
    analysisReports: "Analysrapporter",
    operationsCenter: "Agronomiskt operationscenter",
    reportRegistry: "Rapportregister",
    fieldHealth: "Fältstatus",
  };
  const da = {
    dashboard: "Dashboard",
    dashboardSubtitle: "Systemoversigt",
    aiAnalysis: "AI-analyse",
    aiAnalysisSubtitle: "Dataanalyse",
    map: "Kort",
    mapSubtitle: "Projektplaceringer",
    projects: "Projekter",
    projectsSubtitle: "Projektstyring",
    reports: "Rapporter",
    reportsSubtitle: "Analyseresultater",
    settings: "Indstillinger",
    settingsSubtitle: "Platformindstillinger",
    sidebarDescription: "Seneste analyseresultater for marker i den aktive organisation.",
    availableReports: "Tilgængelige rapporter",
    fieldReports: "Markrapporter",
    heroDescription: "Seneste gemte analyser, AEGRIS-scorer og datakvalitet for marker i den aktive organisation.",
    fields: "Marker",
    withAnalysis: "Med analyse",
    loadingReports: "Indlæser rapporter…",
    noReports: "Intet at rapportere endnu",
    noReportsDescription: "Opret først et projekt, og kør mindst én analyse.",
    openPortfolio: "Åbn markportefølje",
    latestState: "Seneste analytiske status",
    onePerField: "Én aktuel post pr. mark",
    field: "Mark",
    risk: "Risiko",
    score: "AEGRIS-score",
    quality: "Kvalitet",
    analysis: "Analyse",
    actions: "Handlinger",
    cropNotSpecified: "Afgrøde ikke angivet",
    sourceNotSpecified: "Kilde ikke angivet",
    priority: "Prioritet",
    openReport: "Åbn rapport →",
    noAnalysis: "Dette projekt har endnu ingen gemt analyse.",
    openProject: "Åbn projekt",
    footer: "Rapportregistret viser den senest gemte analyse for hver mark. Rapportdetaljen bruger autoritative data gemt i AEGRIS.",
    notSignedIn: "Brugeren er ikke logget ind.",
    organizationLoadFailed: "Den aktive organisation kunne ikke indlæses.",
    noActiveOrganization: "Ingen aktiv organisation er indstillet.",
    projectsLoadFailed: "Projekterne kunne ikke indlæses.",
    analysisReports: "Analyserapporter",
    operationsCenter: "Agronomisk driftscenter",
    reportRegistry: "Rapportregister",
    fieldHealth: "Markstatus",
  };
  const no = {
    dashboard: "Dashbord",
    dashboardSubtitle: "Systemoversikt",
    aiAnalysis: "AI-analyse",
    aiAnalysisSubtitle: "Dataanalyse",
    map: "Kart",
    mapSubtitle: "Prosjektsteder",
    projects: "Prosjekter",
    projectsSubtitle: "Prosjektstyring",
    reports: "Rapporter",
    reportsSubtitle: "Analyseresultater",
    settings: "Innstillinger",
    settingsSubtitle: "Plattforminnstillinger",
    sidebarDescription: "Nyeste analyseresultater for felt i den aktive organisasjonen.",
    availableReports: "Tilgjengelige rapporter",
    fieldReports: "Feltrapporter",
    heroDescription: "Nyeste lagrede analyser, AEGRIS-score og datakvalitet for felt i den aktive organisasjonen.",
    fields: "Felt",
    withAnalysis: "Med analyse",
    loadingReports: "Laster rapporter…",
    noReports: "Ingenting å rapportere ennå",
    noReportsDescription: "Opprett først et prosjekt og kjør minst én analyse.",
    openPortfolio: "Åpne feltportefølje",
    latestState: "Nyeste analytiske status",
    onePerField: "Én aktuell post per felt",
    field: "Felt",
    risk: "Risiko",
    score: "AEGRIS-score",
    quality: "Kvalitet",
    analysis: "Analyse",
    actions: "Handlinger",
    cropNotSpecified: "Vekst ikke angitt",
    sourceNotSpecified: "Kilde ikke angitt",
    priority: "Prioritet",
    openReport: "Åpne rapport →",
    noAnalysis: "Dette prosjektet har ennå ingen lagret analyse.",
    openProject: "Åpne prosjekt",
    footer: "Rapportregisteret viser den sist lagrede analysen for hvert felt. Rapportdetaljen bruker autoritative data lagret i AEGRIS.",
    notSignedIn: "Brukeren er ikke logget inn.",
    organizationLoadFailed: "Den aktive organisasjonen kunne ikke lastes.",
    noActiveOrganization: "Ingen aktiv organisasjon er angitt.",
    projectsLoadFailed: "Prosjektene kunne ikke lastes.",
    analysisReports: "Analyserapporter",
    operationsCenter: "Agronomisk driftssenter",
    reportRegistry: "Rapportregister",
    fieldHealth: "Feltstatus",
  };
  const fi = {
    dashboard: "Hallintapaneeli",
    dashboardSubtitle: "Järjestelmän yleiskuva",
    aiAnalysis: "AI-analyysi",
    aiAnalysisSubtitle: "Data-analyysi",
    map: "Kartta",
    mapSubtitle: "Projektien sijainnit",
    projects: "Projektit",
    projectsSubtitle: "Projektinhallinta",
    reports: "Raportit",
    reportsSubtitle: "Analyysitulokset",
    settings: "Asetukset",
    settingsSubtitle: "Alustan asetukset",
    sidebarDescription: "Aktiivisen organisaation lohkojen uusimmat analyysitulokset.",
    availableReports: "Saatavilla olevat raportit",
    fieldReports: "Lohkoraportit",
    heroDescription: "Aktiivisen organisaation lohkojen uusimmat tallennetut analyysit, AEGRIS-pisteet ja tietojen laatu.",
    fields: "Lohkot",
    withAnalysis: "Analysoidut",
    loadingReports: "Ladataan raportteja…",
    noReports: "Ei vielä raportoitavaa",
    noReportsDescription: "Luo ensin projekti ja suorita vähintään yksi analyysi.",
    openPortfolio: "Avaa lohkoportfolio",
    latestState: "Uusin analyyttinen tila",
    onePerField: "Yksi ajantasainen tietue lohkoa kohden",
    field: "Lohko",
    risk: "Riski",
    score: "AEGRIS-pisteet",
    quality: "Laatu",
    analysis: "Analyysi",
    actions: "Toiminnot",
    cropNotSpecified: "Kasvia ei määritetty",
    sourceNotSpecified: "Lähdettä ei määritetty",
    priority: "Prioriteetti",
    openReport: "Avaa raportti →",
    noAnalysis: "Tällä projektilla ei vielä ole tallennettua analyysiä.",
    openProject: "Avaa projekti",
    footer: "Raporttirekisteri näyttää kunkin lohkon viimeksi tallennetun analyysin. Raportin tiedot käyttävät AEGRIS-järjestelmään tallennettuja auktoritatiivisia tietoja.",
    notSignedIn: "Käyttäjä ei ole kirjautunut sisään.",
    organizationLoadFailed: "Aktiivisen organisaation lataaminen epäonnistui.",
    noActiveOrganization: "Aktiivista organisaatiota ei ole asetettu.",
    projectsLoadFailed: "Projektien lataaminen epäonnistui.",
    analysisReports: "Analyysiraportit",
    operationsCenter: "Agronominen operaatiokeskus",
    reportRegistry: "Raporttirekisteri",
    fieldHealth: "Lohkon tila",
  };
  const copies = { en, cs, sk, de, pl, fr, es, it, nl, pt, ro, hu, uk, bg, hr, sl, lt, lv, et, el, sv, da, no, fi } as const;
  return copies[language as keyof typeof copies] ?? copies.en;
}

const reportsLocaleMap = {
  cs: "cs-CZ", en: "en-GB", sk: "sk-SK", de: "de-DE", pl: "pl-PL",
  fr: "fr-FR", es: "es-ES", it: "it-IT", nl: "nl-NL", pt: "pt-PT",
  ro: "ro-RO", hu: "hu-HU", uk: "uk-UA", bg: "bg-BG", hr: "hr-HR",
  sl: "sl-SI", lt: "lt-LT", lv: "lv-LV", et: "et-EE", el: "el-GR",
  sv: "sv-SE", da: "da-DK", no: "nb-NO", fi: "fi-FI",
} as const;

function getReportsNavigation(copy: ReturnType<typeof getReportsCopy>) {
  return [
    ["📊", copy.dashboard, copy.dashboardSubtitle, "/dashboard"],
    ["🧠", copy.aiAnalysis, copy.aiAnalysisSubtitle, "/ai"],
    ["🗺️", copy.map, copy.mapSubtitle, "/map"],
    ["📁", copy.projects, copy.projectsSubtitle, "/projects"],
    ["📄", copy.reports, copy.reportsSubtitle, "/reports"],
    ["⚙️", copy.settings, copy.settingsSubtitle, "/settings"],
  ] as const;
}

export default function ReportsPage() {
  const { language } = useLanguage();
  const copy = getReportsCopy(language);
  const navigation = getReportsNavigation(copy);
  const locale = reportsLocaleMap[language as keyof typeof reportsLocaleMap] ?? "en-GB";

  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReports() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (userError || !user) {
        setErrorMessage(copy.notSignedIn);
        setLoading(false);
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("active_organization_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      if (profileError) {
        console.error(
          "CHYBA NAČTENÍ AKTIVNÍ ORGANIZACE PRO REPORTY:",
          profileError
        );
        setErrorMessage(copy.organizationLoadFailed);
        setLoading(false);
        return;
      }

      const activeOrganizationId =
        profile?.active_organization_id ?? null;

      if (!activeOrganizationId) {
        setErrorMessage(copy.noActiveOrganization);
        setLoading(false);
        return;
      }

      const {
        data: projectData,
        error: projectError,
      } = await supabase
        .from("projects")
        .select(
          "id, name, status, crop_name, crop_variety, area_ha, created_at"
        )
        .eq("organization_id", activeOrganizationId)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (projectError) {
        console.error("CHYBA NAČTENÍ PROJEKTŮ PRO REPORTY:", projectError);
        setErrorMessage(copy.projectsLoadFailed);
        setLoading(false);
        return;
      }

      const projects = (projectData ?? []) as Project[];

      if (projects.length === 0) {
        setRows([]);
        setLoading(false);
        return;
      }

      const projectIds = projects.map((project) => project.id);

      const [
        { data: analysisData, error: analysisError },
        { data: recommendationData, error: recommendationError },
      ] = await Promise.all([
        supabase
          .from("analysis")
          .select(
            "id, project_id, ndvi, risk, created_at, valid_geometry_pct, source_provider, satellite_product"
          )
          .in("project_id", projectIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("aegris_recommendations")
          .select(
            "id, project_id, analysis_id, priority, score, created_at"
          )
          .in("project_id", projectIds)
          .order("created_at", { ascending: false }),
      ]);

      if (!active) return;

      if (analysisError) {
        console.error("CHYBA NAČTENÍ ANALÝZ PRO REPORTY:", analysisError);
      }

      if (recommendationError) {
        console.error(
          "CHYBA NAČTENÍ DOPORUČENÍ PRO REPORTY:",
          recommendationError
        );
      }

      const analyses = (analysisData ?? []) as Analysis[];
      const recommendations =
        (recommendationData ?? []) as Recommendation[];

      const latestAnalysisByProject = new Map<number, Analysis>();
      for (const analysis of analyses) {
        if (!latestAnalysisByProject.has(analysis.project_id)) {
          latestAnalysisByProject.set(analysis.project_id, analysis);
        }
      }

      const latestRecommendationByProject =
        new Map<number, Recommendation>();
      for (const recommendation of recommendations) {
        if (!latestRecommendationByProject.has(recommendation.project_id)) {
          latestRecommendationByProject.set(
            recommendation.project_id,
            recommendation
          );
        }
      }

      setRows(
        projects.map((project) => ({
          project,
          analysis: latestAnalysisByProject.get(project.id) ?? null,
          recommendation:
            latestRecommendationByProject.get(project.id) ?? null,
        }))
      );

      setLoading(false);
    }

    void loadReports();

    return () => {
      active = false;
    };
  }, [language]);

  const reportCount = useMemo(
    () => rows.filter((row) => row.analysis).length,
    [rows]
  );

  return (
    <div className="min-h-screen bg-[#05090d] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <aside className="hidden w-[248px] shrink-0 border-r border-white/[0.06] bg-[#070c11] lg:flex lg:flex-col">
          <div className="border-b border-white/[0.06] px-6 py-6">
            <Link href="/dashboard" className="block">
              <div className="text-2xl font-black tracking-[-0.04em] text-cyan-300">AEGRIS</div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-slate-600">
                Agriculture Intelligence
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1.5 px-3 py-5">
            {navigation.map(([icon, title, subtitle, href]) => {
              const active = href === "/reports";
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                    active
                      ? "bg-cyan-300/[0.08] text-cyan-200"
                      : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200"
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.035] text-sm">{icon}</span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold">{title}</div>
                    <div className="mt-0.5 text-[9px] text-slate-600">{subtitle}</div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/[0.06] p-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
                Analysis Reports
              </div>
              <p className="mt-2 text-[10px] leading-5 text-slate-600">
                {copy.sidebarDescription}
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-white/[0.06] bg-[#070c11]/95">
            <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-600">
                  Agronomic Operations Center
                </div>
                <div className="mt-0.5 text-sm font-bold text-slate-300">
                  Analysis Reports
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-[0.15em] text-slate-700">
                  {copy.availableReports}
                </div>
                <div className="mt-0.5 text-lg font-black text-cyan-300">
                  {loading ? "…" : reportCount}
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navigation.map(([icon, title, , href]) => (
                <Link
                  key={href}
                  href={href}
                  className={`shrink-0 rounded-lg border px-3 py-2 text-[10px] font-bold ${
                    href === "/reports"
                      ? "border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-200"
                      : "border-white/[0.06] bg-white/[0.02] text-slate-500"
                  }`}
                >
                  {icon} {title}
                </Link>
              ))}
            </div>

            <section className="rounded-[24px] border border-white/[0.07] bg-[#0a1016] p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
                    Analysis Reports
                  </div>
                  <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                    {copy.fieldReports}
                  </h1>
                  <p className="mt-2 max-w-2xl text-[11px] leading-5 text-slate-500">
                    {copy.heroDescription}
                  </p>
                </div>

                <div className="flex gap-3">
                  <div className="rounded-xl border border-white/[0.07] bg-[#071017] px-4 py-3 text-right">
                    <div className="text-[8px] uppercase tracking-[0.15em] text-slate-700">
                      {copy.fields}
                    </div>
                    <div className="mt-1 text-xl font-black text-slate-300">
                      {loading ? "…" : rows.length}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.07] bg-[#071017] px-4 py-3 text-right">
                    <div className="text-[8px] uppercase tracking-[0.15em] text-slate-700">
                      {copy.withAnalysis}
                    </div>
                    <div className="mt-1 text-xl font-black text-cyan-300">
                      {loading ? "…" : reportCount}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {loading && (
              <section className="mt-4 flex min-h-[260px] items-center justify-center rounded-[24px] border border-white/[0.07] bg-[#0a1016]">
                <div className="flex flex-col items-center gap-3 text-slate-600">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/[0.08] border-t-cyan-300" />
                  <span className="text-[10px]">{copy.loadingReports}</span>
                </div>
              </section>
            )}

            {!loading && errorMessage && (
              <section className="mt-4 rounded-[24px] border border-red-400/15 bg-red-400/[0.035] p-6 text-[11px] text-red-300">
                {errorMessage}
              </section>
            )}

            {!loading && !errorMessage && rows.length === 0 && (
              <section className="mt-4 rounded-[24px] border border-dashed border-white/[0.09] bg-[#0a1016] px-6 py-14 text-center">
                <div className="text-3xl">◎</div>
                <h2 className="mt-4 text-lg font-black text-slate-200">{copy.noReports}</h2>
                <p className="mt-2 text-[10px] text-slate-600">
                  {copy.noReportsDescription}
                </p>
                <Link
                  href="/projects"
                  className="mt-5 inline-flex rounded-xl border border-white/[0.08] px-5 py-3 text-[10px] font-bold text-slate-300 transition hover:border-cyan-300/25 hover:text-cyan-200"
                >
                  {copy.openPortfolio}
                </Link>
              </section>
            )}

            {!loading && !errorMessage && rows.length > 0 && (
              <section className="mt-4 overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#0a1016]">
                <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-700">
                      Report Registry
                    </div>
                    <h2 className="mt-1 text-sm font-black text-slate-200">
                      {copy.latestState}
                    </h2>
                  </div>
                  <div className="text-[8px] text-slate-700">
                    {copy.onePerField}
                  </div>
                </div>

                <div className="hidden grid-cols-[minmax(210px,1.45fr)_90px_minmax(110px,.8fr)_110px_100px_150px_190px] gap-3 border-b border-white/[0.05] bg-white/[0.015] px-6 py-3 text-[8px] font-black uppercase tracking-[0.14em] text-slate-700 xl:grid">
                  <div>{copy.field}</div>
                  <div>NDVI</div>
                  <div>{copy.risk}</div>
                  <div>{copy.score}</div>
                  <div>{copy.quality}</div>
                  <div>{copy.analysis}</div>
                  <div className="text-right">{copy.actions}</div>
                </div>

                <div className="divide-y divide-white/[0.05]">
                  {rows.map(({ project, analysis, recommendation }) => (
                    <article
                      key={project.id}
                      className="px-5 py-4 transition hover:bg-white/[0.015] sm:px-6"
                    >
                      <div className="grid items-center gap-4 xl:grid-cols-[minmax(210px,1.45fr)_90px_minmax(110px,.8fr)_110px_100px_150px_190px] xl:gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/projects/${project.id}`}
                              className="truncate text-[13px] font-black text-slate-100 transition hover:text-cyan-200"
                            >
                              {project.name}
                            </Link>
                            {project.status && (
                              <span className="rounded-md border border-emerald-400/15 bg-emerald-400/[0.05] px-2 py-1 text-[8px] font-black text-emerald-300">
                                {project.status}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 truncate text-[9px] text-slate-600">
                            {project.crop_name ?? copy.cropNotSpecified}
                            {project.crop_variety ? ` · ${project.crop_variety}` : ""}
                            {project.area_ha != null ? ` · ${project.area_ha} ha` : ""}
                          </div>
                          {analysis && (
                            <div className="mt-1 truncate text-[8px] text-slate-700 xl:hidden">
                              {analysis.satellite_product ?? analysis.source_provider ?? copy.sourceNotSpecified}
                            </div>
                          )}
                        </div>

                        {analysis ? (
                          <>
                            <div>
                              <div className="mb-1 text-[8px] uppercase tracking-wider text-slate-700 xl:hidden">NDVI</div>
                              <div className="text-[13px] font-black text-cyan-300">
                                {Number(analysis.ndvi).toFixed(3)}
                              </div>
                            </div>

                            <div>
                              <div className="mb-1 text-[8px] uppercase tracking-wider text-slate-700 xl:hidden">{copy.risk}</div>
                              <div className="text-[10px] font-black text-slate-300">
                                {analysis.risk}
                              </div>
                              {recommendation?.priority && (
                                <div className="mt-1 text-[8px] text-slate-600">
                                  {copy.priority}: {recommendation.priority}
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="mb-1 text-[8px] uppercase tracking-wider text-slate-700 xl:hidden">{copy.score}</div>
                              <div className="text-[11px] font-black text-amber-300">
                                {recommendation?.score != null ? `${recommendation.score}/100` : "—"}
                              </div>
                            </div>

                            <div>
                              <div className="mb-1 text-[8px] uppercase tracking-wider text-slate-700 xl:hidden">{copy.quality}</div>
                              <div className="text-[10px] font-black text-emerald-300">
                                {analysis.valid_geometry_pct != null
                                  ? `${Number(analysis.valid_geometry_pct).toFixed(1)} %`
                                  : "—"}
                              </div>
                            </div>

                            <div>
                              <div className="mb-1 text-[8px] uppercase tracking-wider text-slate-700 xl:hidden">{copy.analysis}</div>
                              <div className="text-[9px] font-bold text-slate-400">
                                {new Date(analysis.created_at).toLocaleDateString(locale)}
                              </div>
                              <div className="mt-1 text-[8px] text-slate-700">
                                {new Date(analysis.created_at).toLocaleTimeString(locale, {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>

                            <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
                              <Link
                                href={`/projects/${project.id}`}
                                className="rounded-lg border border-white/[0.07] px-3 py-2 text-[9px] font-bold text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-200"
                              >
                                Field Health
                              </Link>
                              <Link
                                href={`/reports/${project.id}`}
                                className="rounded-lg bg-cyan-300 px-3 py-2 text-[9px] font-black text-[#061015] transition hover:bg-cyan-200"
                              >
                                {copy.openReport}
                              </Link>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="xl:col-span-5">
                              <div className="rounded-lg border border-white/[0.06] bg-[#071017] px-4 py-3 text-[9px] text-slate-600">
                                {copy.noAnalysis}
                              </div>
                            </div>
                            <div className="flex justify-start xl:justify-end">
                              <Link
                                href={`/projects/${project.id}`}
                                className="rounded-lg border border-white/[0.07] px-3 py-2 text-[9px] font-bold text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-200"
                              >
                                {copy.openProject}
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-4 text-center text-[9px] leading-5 text-slate-700">
              {copy.footer}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
