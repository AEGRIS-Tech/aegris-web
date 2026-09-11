"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useLanguage } from "../context/LanguageContext";

type Project = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  crop_name?: string | null;
  crop_variety?: string | null;
  area_ha?: number | null;
  growth_stage?: string | null;
};

function getProjectsCopy(language: string) {
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
    fieldPortfolio: "Field Portfolio",
    portfolioDescription: "Overview of the active organization's fields and entry point to their Field Health Record.",
    activeOrganization: "Active organization",
    role: "Role",
    signOut: "Sign out",
    fieldsAndProjects: "Fields and projects",
    heroDescription: "Operational list of all fields in the active organization. Open a field to go directly to its Field Health Record.",
    totalFields: "Total fields",
    newProject: "+ New project",
    organizationPortfolio: "Organization portfolio",
    activeFields: "Active fields",
    newestFirst: "Sorted newest first",
    loadingPortfolio: "Loading portfolio…",
    emptyTitle: "The active organization does not have any fields yet",
    emptyDescription: "Create the first project and start monitoring.",
    createProject: "+ Create project",
    field: "Field",
    cropStage: "Crop / stage",
    area: "Area",
    status: "Status",
    actions: "Actions",
    created: "created",
    cropNotSpecified: "Crop not specified",
    stageNotSpecified: "Stage not specified",
    delete: "Delete",
    edit: "Edit",
    open: "Open →",
    crop: "Crop",
    openHealthRecord: "Open Field Health Record",
    footer: "Field Portfolio displays authoritative project data for the active organization. Analytical status, priorities and Ground Truth are available inside the Field Health Record.",
    confirmDelete: "Are you sure you want to delete this project?",
    brandSubtitle: "Agriculture Intelligence",
    operationsCenter: "Agronomic Operations Center",
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
    fieldPortfolio: "Portfolio pozemků",
    portfolioDescription: "Přehled pozemků aktivní organizace a vstup do jejich Field Health Record.",
    activeOrganization: "Aktivní organizace",
    role: "Role",
    signOut: "Odhlásit se",
    fieldsAndProjects: "Pozemky a projekty",
    heroDescription: "Operační seznam všech pozemků aktivní organizace. Otevřením pozemku přejdete přímo do jeho Field Health Record.",
    totalFields: "Celkem pozemků",
    newProject: "+ Nový projekt",
    organizationPortfolio: "Portfolio organizace",
    activeFields: "Aktivní pozemky",
    newestFirst: "Řazeno od nejnovějších",
    loadingPortfolio: "Načítám portfolio…",
    emptyTitle: "Aktivní organizace zatím nemá žádné pozemky",
    emptyDescription: "Vytvořte první projekt a spusťte monitoring.",
    createProject: "+ Vytvořit projekt",
    field: "Pozemek",
    cropStage: "Plodina / fáze",
    area: "Výměra",
    status: "Stav",
    actions: "Akce",
    created: "založeno",
    cropNotSpecified: "Plodina neuvedena",
    stageNotSpecified: "Fáze neuvedena",
    delete: "Smazat",
    edit: "Upravit",
    open: "Otevřít →",
    crop: "Plodina",
    openHealthRecord: "Otevřít Field Health Record",
    footer: "Portfolio pozemků zobrazuje autoritativní projektová data aktivní organizace. Analytický stav, priority a Ground Truth jsou dostupné uvnitř Field Health Record.",
    confirmDelete: "Opravdu chcete tento projekt smazat?",
    brandSubtitle: "Agronomická inteligence",
    operationsCenter: "Agronomické operační centrum",
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
    fieldPortfolio: "Portfólio pozemkov",
    portfolioDescription: "Prehľad pozemkov aktívnej organizácie a vstup do ich Field Health Record.",
    activeOrganization: "Aktívna organizácia",
    role: "Rola",
    signOut: "Odhlásiť sa",
    fieldsAndProjects: "Pozemky a projekty",
    heroDescription: "Operačný zoznam všetkých pozemkov aktívnej organizácie. Otvorením pozemku prejdete priamo do jeho Field Health Record.",
    totalFields: "Celkom pozemkov",
    newProject: "+ Nový projekt",
    organizationPortfolio: "Portfólio organizácie",
    activeFields: "Aktívne pozemky",
    newestFirst: "Zoradené od najnovších",
    loadingPortfolio: "Načítavam portfólio…",
    emptyTitle: "Aktívna organizácia zatiaľ nemá žiadne pozemky",
    emptyDescription: "Vytvorte prvý projekt a spustite monitoring.",
    createProject: "+ Vytvoriť projekt",
    field: "Pozemok",
    cropStage: "Plodina / fáza",
    area: "Výmera",
    status: "Stav",
    actions: "Akcie",
    created: "vytvorené",
    cropNotSpecified: "Plodina neuvedená",
    stageNotSpecified: "Fáza neuvedená",
    delete: "Zmazať",
    edit: "Upraviť",
    open: "Otvoriť →",
    crop: "Plodina",
    openHealthRecord: "Otvoriť Field Health Record",
    footer: "Portfólio pozemkov zobrazuje autoritatívne projektové dáta aktívnej organizácie. Analytický stav, priority a Ground Truth sú dostupné vo Field Health Record.",
    confirmDelete: "Naozaj chcete tento projekt zmazať?",
    brandSubtitle: "Agronomická inteligencia",
    operationsCenter: "Agronomické operačné centrum",
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
    fieldPortfolio: "Feldportfolio",
    portfolioDescription: "Übersicht der Felder der aktiven Organisation und Einstieg in deren Field Health Record.",
    activeOrganization: "Aktive Organisation",
    role: "Rolle",
    signOut: "Abmelden",
    fieldsAndProjects: "Felder und Projekte",
    heroDescription: "Operative Liste aller Felder der aktiven Organisation. Öffnen Sie ein Feld, um direkt zu seinem Field Health Record zu gelangen.",
    totalFields: "Felder gesamt",
    newProject: "+ Neues Projekt",
    organizationPortfolio: "Organisationsportfolio",
    activeFields: "Aktive Felder",
    newestFirst: "Neueste zuerst",
    loadingPortfolio: "Portfolio wird geladen…",
    emptyTitle: "Die aktive Organisation hat noch keine Felder",
    emptyDescription: "Erstellen Sie das erste Projekt und starten Sie das Monitoring.",
    createProject: "+ Projekt erstellen",
    field: "Feld",
    cropStage: "Kultur / Stadium",
    area: "Fläche",
    status: "Status",
    actions: "Aktionen",
    created: "erstellt",
    cropNotSpecified: "Kultur nicht angegeben",
    stageNotSpecified: "Stadium nicht angegeben",
    delete: "Löschen",
    edit: "Bearbeiten",
    open: "Öffnen →",
    crop: "Kultur",
    openHealthRecord: "Field Health Record öffnen",
    footer: "Das Feldportfolio zeigt autoritative Projektdaten der aktiven Organisation. Analysestatus, Prioritäten und Ground Truth sind im Field Health Record verfügbar.",
    confirmDelete: "Möchten Sie dieses Projekt wirklich löschen?",
    brandSubtitle: "Agronomische Intelligenz",
    operationsCenter: "Agronomisches Betriebszentrum",
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
    fieldPortfolio: "Portfolio pól",
    portfolioDescription: "Przegląd pól aktywnej organizacji i dostęp do ich Field Health Record.",
    activeOrganization: "Aktywna organizacja",
    role: "Rola",
    signOut: "Wyloguj",
    fieldsAndProjects: "Pola i projekty",
    heroDescription: "Operacyjna lista wszystkich pól aktywnej organizacji. Otwórz pole, aby przejść bezpośrednio do jego Field Health Record.",
    totalFields: "Łącznie pól",
    newProject: "+ Nowy projekt",
    organizationPortfolio: "Portfolio organizacji",
    activeFields: "Aktywne pola",
    newestFirst: "Najnowsze najpierw",
    loadingPortfolio: "Ładowanie portfolio…",
    emptyTitle: "Aktywna organizacja nie ma jeszcze żadnych pól",
    emptyDescription: "Utwórz pierwszy projekt i rozpocznij monitoring.",
    createProject: "+ Utwórz projekt",
    field: "Pole",
    cropStage: "Uprawa / faza",
    area: "Powierzchnia",
    status: "Status",
    actions: "Akcje",
    created: "utworzono",
    cropNotSpecified: "Nie podano uprawy",
    stageNotSpecified: "Nie podano fazy",
    delete: "Usuń",
    edit: "Edytuj",
    open: "Otwórz →",
    crop: "Uprawa",
    openHealthRecord: "Otwórz Field Health Record",
    footer: "Portfolio pól pokazuje autorytatywne dane projektowe aktywnej organizacji. Status analityczny, priorytety i Ground Truth są dostępne w Field Health Record.",
    confirmDelete: "Czy na pewno chcesz usunąć ten projekt?",
    brandSubtitle: "Inteligencja agronomiczna",
    operationsCenter: "Agronomiczne centrum operacyjne",
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
    fieldPortfolio: "Portefeuille de parcelles",
    portfolioDescription: "Vue d’ensemble des parcelles de l’organisation active et accès à leur Field Health Record.",
    activeOrganization: "Organisation active",
    role: "Rôle",
    signOut: "Se déconnecter",
    fieldsAndProjects: "Parcelles et projets",
    heroDescription: "Liste opérationnelle de toutes les parcelles de l’organisation active. Ouvrez une parcelle pour accéder directement à son Field Health Record.",
    totalFields: "Total des parcelles",
    newProject: "+ Nouveau projet",
    organizationPortfolio: "Portefeuille de l’organisation",
    activeFields: "Parcelles actives",
    newestFirst: "Plus récentes d’abord",
    loadingPortfolio: "Chargement du portefeuille…",
    emptyTitle: "L’organisation active ne possède encore aucune parcelle",
    emptyDescription: "Créez le premier projet et démarrez le suivi.",
    createProject: "+ Créer un projet",
    field: "Parcelle",
    cropStage: "Culture / stade",
    area: "Surface",
    status: "Statut",
    actions: "Actions",
    created: "créé",
    cropNotSpecified: "Culture non renseignée",
    stageNotSpecified: "Stade non renseigné",
    delete: "Supprimer",
    edit: "Modifier",
    open: "Ouvrir →",
    crop: "Culture",
    openHealthRecord: "Ouvrir le Field Health Record",
    footer: "Le portefeuille de parcelles affiche les données de projet de référence de l’organisation active. L’état analytique, les priorités et Ground Truth sont disponibles dans le Field Health Record.",
    confirmDelete: "Voulez-vous vraiment supprimer ce projet ?",
    brandSubtitle: "Intelligence agronomique",
    operationsCenter: "Centre des opérations agronomiques",
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
    fieldPortfolio: "Cartera de campos",
    portfolioDescription: "Resumen de los campos de la organización activa y acceso a su Field Health Record.",
    activeOrganization: "Organización activa",
    role: "Rol",
    signOut: "Cerrar sesión",
    fieldsAndProjects: "Campos y proyectos",
    heroDescription: "Lista operativa de todos los campos de la organización activa. Abra un campo para acceder directamente a su Field Health Record.",
    totalFields: "Total de campos",
    newProject: "+ Nuevo proyecto",
    organizationPortfolio: "Cartera de la organización",
    activeFields: "Campos activos",
    newestFirst: "Más recientes primero",
    loadingPortfolio: "Cargando cartera…",
    emptyTitle: "La organización activa aún no tiene campos",
    emptyDescription: "Cree el primer proyecto e inicie la monitorización.",
    createProject: "+ Crear proyecto",
    field: "Campo",
    cropStage: "Cultivo / fase",
    area: "Superficie",
    status: "Estado",
    actions: "Acciones",
    created: "creado",
    cropNotSpecified: "Cultivo no especificado",
    stageNotSpecified: "Fase no especificada",
    delete: "Eliminar",
    edit: "Editar",
    open: "Abrir →",
    crop: "Cultivo",
    openHealthRecord: "Abrir Field Health Record",
    footer: "La cartera de campos muestra los datos de proyecto autorizados de la organización activa. El estado analítico, las prioridades y Ground Truth están disponibles en el Field Health Record.",
    confirmDelete: "¿Seguro que desea eliminar este proyecto?",
    brandSubtitle: "Inteligencia agronómica",
    operationsCenter: "Centro de operaciones agronómicas",
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
    fieldPortfolio: "Portfolio dei campi",
    portfolioDescription: "Panoramica dei campi dell’organizzazione attiva e accesso al relativo Field Health Record.",
    activeOrganization: "Organizzazione attiva",
    role: "Ruolo",
    signOut: "Esci",
    fieldsAndProjects: "Campi e progetti",
    heroDescription: "Elenco operativo di tutti i campi dell’organizzazione attiva. Apri un campo per accedere direttamente al suo Field Health Record.",
    totalFields: "Campi totali",
    newProject: "+ Nuovo progetto",
    organizationPortfolio: "Portfolio dell’organizzazione",
    activeFields: "Campi attivi",
    newestFirst: "Più recenti prima",
    loadingPortfolio: "Caricamento portfolio…",
    emptyTitle: "L’organizzazione attiva non ha ancora campi",
    emptyDescription: "Crea il primo progetto e avvia il monitoraggio.",
    createProject: "+ Crea progetto",
    field: "Campo",
    cropStage: "Coltura / fase",
    area: "Superficie",
    status: "Stato",
    actions: "Azioni",
    created: "creato",
    cropNotSpecified: "Coltura non specificata",
    stageNotSpecified: "Fase non specificata",
    delete: "Elimina",
    edit: "Modifica",
    open: "Apri →",
    crop: "Coltura",
    openHealthRecord: "Apri Field Health Record",
    footer: "Il portfolio dei campi mostra i dati di progetto autorevoli dell’organizzazione attiva. Stato analitico, priorità e Ground Truth sono disponibili nel Field Health Record.",
    confirmDelete: "Vuoi davvero eliminare questo progetto?",
    brandSubtitle: "Intelligenza agronomica",
    operationsCenter: "Centro operativo agronomico",
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
    fieldPortfolio: "Veldportfolio",
    portfolioDescription: "Overzicht van de velden van de actieve organisatie en toegang tot hun Field Health Record.",
    activeOrganization: "Actieve organisatie",
    role: "Rol",
    signOut: "Afmelden",
    fieldsAndProjects: "Velden en projecten",
    heroDescription: "Operationele lijst van alle velden in de actieve organisatie. Open een veld om rechtstreeks naar het Field Health Record te gaan.",
    totalFields: "Totaal velden",
    newProject: "+ Nieuw project",
    organizationPortfolio: "Organisatieportfolio",
    activeFields: "Actieve velden",
    newestFirst: "Nieuwste eerst",
    loadingPortfolio: "Portfolio laden…",
    emptyTitle: "De actieve organisatie heeft nog geen velden",
    emptyDescription: "Maak het eerste project en start de monitoring.",
    createProject: "+ Project maken",
    field: "Veld",
    cropStage: "Gewas / stadium",
    area: "Oppervlakte",
    status: "Status",
    actions: "Acties",
    created: "aangemaakt",
    cropNotSpecified: "Gewas niet opgegeven",
    stageNotSpecified: "Stadium niet opgegeven",
    delete: "Verwijderen",
    edit: "Bewerken",
    open: "Openen →",
    crop: "Gewas",
    openHealthRecord: "Field Health Record openen",
    footer: "Het veldportfolio toont gezaghebbende projectgegevens van de actieve organisatie. Analysestatus, prioriteiten en Ground Truth zijn beschikbaar in het Field Health Record.",
    confirmDelete: "Weet u zeker dat u dit project wilt verwijderen?",
    brandSubtitle: "Agronomische intelligentie",
    operationsCenter: "Agronomisch operationeel centrum",
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
    fieldPortfolio: "Portefólio de campos",
    portfolioDescription: "Visão geral dos campos da organização ativa e acesso ao respetivo Field Health Record.",
    activeOrganization: "Organização ativa",
    role: "Função",
    signOut: "Terminar sessão",
    fieldsAndProjects: "Campos e projetos",
    heroDescription: "Lista operacional de todos os campos da organização ativa. Abra um campo para aceder diretamente ao respetivo Field Health Record.",
    totalFields: "Total de campos",
    newProject: "+ Novo projeto",
    organizationPortfolio: "Portefólio da organização",
    activeFields: "Campos ativos",
    newestFirst: "Mais recentes primeiro",
    loadingPortfolio: "A carregar portefólio…",
    emptyTitle: "A organização ativa ainda não tem campos",
    emptyDescription: "Crie o primeiro projeto e inicie a monitorização.",
    createProject: "+ Criar projeto",
    field: "Campo",
    cropStage: "Cultura / fase",
    area: "Área",
    status: "Estado",
    actions: "Ações",
    created: "criado",
    cropNotSpecified: "Cultura não especificada",
    stageNotSpecified: "Fase não especificada",
    delete: "Eliminar",
    edit: "Editar",
    open: "Abrir →",
    crop: "Cultura",
    openHealthRecord: "Abrir Field Health Record",
    footer: "O portefólio de campos apresenta os dados de projeto autorizados da organização ativa. O estado analítico, as prioridades e Ground Truth estão disponíveis no Field Health Record.",
    confirmDelete: "Tem a certeza de que pretende eliminar este projeto?",
    brandSubtitle: "Inteligência agronómica",
    operationsCenter: "Centro de operações agronómicas",
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
    fieldPortfolio: "Portofoliu de parcele",
    portfolioDescription: "Prezentarea parcelelor organizației active și accesul la Field Health Record.",
    activeOrganization: "Organizație activă",
    role: "Rol",
    signOut: "Deconectare",
    fieldsAndProjects: "Parcelele și proiectele",
    heroDescription: "Lista operațională a tuturor parcelelor din organizația activă. Deschideți o parcelă pentru a accesa direct Field Health Record.",
    totalFields: "Total parcele",
    newProject: "+ Proiect nou",
    organizationPortfolio: "Portofoliul organizației",
    activeFields: "Parcelele active",
    newestFirst: "Cele mai noi primele",
    loadingPortfolio: "Se încarcă portofoliul…",
    emptyTitle: "Organizația activă nu are încă parcele",
    emptyDescription: "Creați primul proiect și începeți monitorizarea.",
    createProject: "+ Creează proiect",
    field: "Parcelă",
    cropStage: "Cultură / stadiu",
    area: "Suprafață",
    status: "Stare",
    actions: "Acțiuni",
    created: "creat",
    cropNotSpecified: "Cultură nespecificată",
    stageNotSpecified: "Stadiu nespecificat",
    delete: "Ștergere",
    edit: "Editare",
    open: "Deschide →",
    crop: "Cultură",
    openHealthRecord: "Deschide Field Health Record",
    footer: "Portofoliul de parcele afișează datele de proiect autorizate ale organizației active. Starea analitică, prioritățile și Ground Truth sunt disponibile în Field Health Record.",
    confirmDelete: "Sigur doriți să ștergeți acest proiect?",
    brandSubtitle: "Inteligență agronomică",
    operationsCenter: "Centru de operațiuni agronomice",
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
    fieldPortfolio: "Táblaportfólió",
    portfolioDescription: "Az aktív szervezet tábláinak áttekintése és belépési pont a Field Health Record felületükhöz.",
    activeOrganization: "Aktív szervezet",
    role: "Szerepkör",
    signOut: "Kijelentkezés",
    fieldsAndProjects: "Táblák és projektek",
    heroDescription: "Az aktív szervezet összes táblájának operatív listája. Nyisson meg egy táblát a Field Health Record közvetlen eléréséhez.",
    totalFields: "Összes tábla",
    newProject: "+ Új projekt",
    organizationPortfolio: "Szervezeti portfólió",
    activeFields: "Aktív táblák",
    newestFirst: "Legújabb elöl",
    loadingPortfolio: "Portfólió betöltése…",
    emptyTitle: "Az aktív szervezetnek még nincsenek táblái",
    emptyDescription: "Hozza létre az első projektet, és indítsa el a monitoringot.",
    createProject: "+ Projekt létrehozása",
    field: "Tábla",
    cropStage: "Növény / szakasz",
    area: "Terület",
    status: "Állapot",
    actions: "Műveletek",
    created: "létrehozva",
    cropNotSpecified: "Növény nincs megadva",
    stageNotSpecified: "Szakasz nincs megadva",
    delete: "Törlés",
    edit: "Szerkesztés",
    open: "Megnyitás →",
    crop: "Növény",
    openHealthRecord: "Field Health Record megnyitása",
    footer: "A táblaportfólió az aktív szervezet hiteles projektadatait mutatja. Az analitikai állapot, prioritások és Ground Truth a Field Health Record felületén érhetők el.",
    confirmDelete: "Biztosan törölni szeretné ezt a projektet?",
    brandSubtitle: "Agronómiai intelligencia",
    operationsCenter: "Agronómiai műveleti központ",
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
    fieldPortfolio: "Портфель полів",
    portfolioDescription: "Огляд полів активної організації та доступ до їх Field Health Record.",
    activeOrganization: "Активна організація",
    role: "Роль",
    signOut: "Вийти",
    fieldsAndProjects: "Поля та проєкти",
    heroDescription: "Операційний список усіх полів активної організації. Відкрийте поле, щоб перейти безпосередньо до його Field Health Record.",
    totalFields: "Усього полів",
    newProject: "+ Новий проєкт",
    organizationPortfolio: "Портфель організації",
    activeFields: "Активні поля",
    newestFirst: "Спочатку найновіші",
    loadingPortfolio: "Завантаження портфеля…",
    emptyTitle: "Активна організація ще не має полів",
    emptyDescription: "Створіть перший проєкт і розпочніть моніторинг.",
    createProject: "+ Створити проєкт",
    field: "Поле",
    cropStage: "Культура / фаза",
    area: "Площа",
    status: "Статус",
    actions: "Дії",
    created: "створено",
    cropNotSpecified: "Культуру не вказано",
    stageNotSpecified: "Фазу не вказано",
    delete: "Видалити",
    edit: "Редагувати",
    open: "Відкрити →",
    crop: "Культура",
    openHealthRecord: "Відкрити Field Health Record",
    footer: "Портфель полів відображає авторитетні проєктні дані активної організації. Аналітичний стан, пріоритети та Ground Truth доступні у Field Health Record.",
    confirmDelete: "Ви впевнені, що хочете видалити цей проєкт?",
    brandSubtitle: "Агрономічний інтелект",
    operationsCenter: "Агрономічний операційний центр",
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
    fieldPortfolio: "Портфолио от полета",
    portfolioDescription: "Преглед на полетата на активната организация и достъп до техния Field Health Record.",
    activeOrganization: "Активна организация",
    role: "Роля",
    signOut: "Изход",
    fieldsAndProjects: "Полета и проекти",
    heroDescription: "Оперативен списък на всички полета в активната организация. Отворете поле, за да преминете директно към неговия Field Health Record.",
    totalFields: "Общо полета",
    newProject: "+ Нов проект",
    organizationPortfolio: "Портфолио на организацията",
    activeFields: "Активни полета",
    newestFirst: "Най-новите първо",
    loadingPortfolio: "Зареждане на портфолиото…",
    emptyTitle: "Активната организация все още няма полета",
    emptyDescription: "Създайте първия проект и започнете мониторинг.",
    createProject: "+ Създай проект",
    field: "Поле",
    cropStage: "Култура / фаза",
    area: "Площ",
    status: "Статус",
    actions: "Действия",
    created: "създадено",
    cropNotSpecified: "Културата не е посочена",
    stageNotSpecified: "Фазата не е посочена",
    delete: "Изтрий",
    edit: "Редактирай",
    open: "Отвори →",
    crop: "Култура",
    openHealthRecord: "Отвори Field Health Record",
    footer: "Портфолиото от полета показва авторитетните проектни данни на активната организация. Аналитичният статус, приоритетите и Ground Truth са достъпни във Field Health Record.",
    confirmDelete: "Сигурни ли сте, че искате да изтриете този проект?",
    brandSubtitle: "Агрономическа интелигентност",
    operationsCenter: "Агрономически оперативен център",
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
    fieldPortfolio: "Portfelj polja",
    portfolioDescription: "Pregled polja aktivne organizacije i pristup njihovom Field Health Record.",
    activeOrganization: "Aktivna organizacija",
    role: "Uloga",
    signOut: "Odjava",
    fieldsAndProjects: "Polja i projekti",
    heroDescription: "Operativni popis svih polja aktivne organizacije. Otvorite polje za izravan pristup njegovom Field Health Record.",
    totalFields: "Ukupno polja",
    newProject: "+ Novi projekt",
    organizationPortfolio: "Portfelj organizacije",
    activeFields: "Aktivna polja",
    newestFirst: "Najnovije prvo",
    loadingPortfolio: "Učitavanje portfelja…",
    emptyTitle: "Aktivna organizacija još nema polja",
    emptyDescription: "Izradite prvi projekt i pokrenite praćenje.",
    createProject: "+ Izradi projekt",
    field: "Polje",
    cropStage: "Kultura / faza",
    area: "Površina",
    status: "Status",
    actions: "Radnje",
    created: "izrađeno",
    cropNotSpecified: "Kultura nije navedena",
    stageNotSpecified: "Faza nije navedena",
    delete: "Izbriši",
    edit: "Uredi",
    open: "Otvori →",
    crop: "Kultura",
    openHealthRecord: "Otvori Field Health Record",
    footer: "Portfelj polja prikazuje autoritativne projektne podatke aktivne organizacije. Analitički status, prioriteti i Ground Truth dostupni su u Field Health Record.",
    confirmDelete: "Jeste li sigurni da želite izbrisati ovaj projekt?",
    brandSubtitle: "Agronomska inteligencija",
    operationsCenter: "Agronomski operativni centar",
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
    fieldPortfolio: "Portfelj polj",
    portfolioDescription: "Pregled polj aktivne organizacije in dostop do njihovega Field Health Record.",
    activeOrganization: "Aktivna organizacija",
    role: "Vloga",
    signOut: "Odjava",
    fieldsAndProjects: "Polja in projekti",
    heroDescription: "Operativni seznam vseh polj aktivne organizacije. Odprite polje za neposreden dostop do njegovega Field Health Record.",
    totalFields: "Skupaj polj",
    newProject: "+ Nov projekt",
    organizationPortfolio: "Portfelj organizacije",
    activeFields: "Aktivna polja",
    newestFirst: "Najnovejše najprej",
    loadingPortfolio: "Nalaganje portfelja…",
    emptyTitle: "Aktivna organizacija še nima polj",
    emptyDescription: "Ustvarite prvi projekt in začnite spremljanje.",
    createProject: "+ Ustvari projekt",
    field: "Polje",
    cropStage: "Poljščina / faza",
    area: "Površina",
    status: "Stanje",
    actions: "Dejanja",
    created: "ustvarjeno",
    cropNotSpecified: "Poljščina ni navedena",
    stageNotSpecified: "Faza ni navedena",
    delete: "Izbriši",
    edit: "Uredi",
    open: "Odpri →",
    crop: "Poljščina",
    openHealthRecord: "Odpri Field Health Record",
    footer: "Portfelj polj prikazuje avtoritativne projektne podatke aktivne organizacije. Analitično stanje, prioritete in Ground Truth so na voljo v Field Health Record.",
    confirmDelete: "Ali res želite izbrisati ta projekt?",
    brandSubtitle: "Agronomska inteligenca",
    operationsCenter: "Agronomski operativni center",
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
    fieldPortfolio: "Laukų portfelis",
    portfolioDescription: "Aktyvios organizacijos laukų apžvalga ir prieiga prie jų Field Health Record.",
    activeOrganization: "Aktyvi organizacija",
    role: "Vaidmuo",
    signOut: "Atsijungti",
    fieldsAndProjects: "Laukai ir projektai",
    heroDescription: "Visų aktyvios organizacijos laukų operacinis sąrašas. Atidarykite lauką, kad tiesiogiai pasiektumėte jo Field Health Record.",
    totalFields: "Iš viso laukų",
    newProject: "+ Naujas projektas",
    organizationPortfolio: "Organizacijos portfelis",
    activeFields: "Aktyvūs laukai",
    newestFirst: "Naujausi pirmiausia",
    loadingPortfolio: "Įkeliamas portfelis…",
    emptyTitle: "Aktyvi organizacija dar neturi laukų",
    emptyDescription: "Sukurkite pirmą projektą ir pradėkite stebėseną.",
    createProject: "+ Sukurti projektą",
    field: "Laukas",
    cropStage: "Kultūra / tarpsnis",
    area: "Plotas",
    status: "Būsena",
    actions: "Veiksmai",
    created: "sukurta",
    cropNotSpecified: "Kultūra nenurodyta",
    stageNotSpecified: "Tarpsnis nenurodytas",
    delete: "Ištrinti",
    edit: "Redaguoti",
    open: "Atidaryti →",
    crop: "Kultūra",
    openHealthRecord: "Atidaryti Field Health Record",
    footer: "Laukų portfelyje rodomi autoritetingi aktyvios organizacijos projekto duomenys. Analitinė būsena, prioritetai ir Ground Truth pasiekiami Field Health Record.",
    confirmDelete: "Ar tikrai norite ištrinti šį projektą?",
    brandSubtitle: "Agronominė žvalga",
    operationsCenter: "Agronominių operacijų centras",
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
    fieldPortfolio: "Lauku portfelis",
    portfolioDescription: "Aktīvās organizācijas lauku pārskats un piekļuve to Field Health Record.",
    activeOrganization: "Aktīvā organizācija",
    role: "Loma",
    signOut: "Izrakstīties",
    fieldsAndProjects: "Lauki un projekti",
    heroDescription: "Visu aktīvās organizācijas lauku operatīvais saraksts. Atveriet lauku, lai tieši piekļūtu tā Field Health Record.",
    totalFields: "Kopā lauku",
    newProject: "+ Jauns projekts",
    organizationPortfolio: "Organizācijas portfelis",
    activeFields: "Aktīvie lauki",
    newestFirst: "Jaunākie vispirms",
    loadingPortfolio: "Ielādē portfeli…",
    emptyTitle: "Aktīvajai organizācijai vēl nav lauku",
    emptyDescription: "Izveidojiet pirmo projektu un sāciet monitoringu.",
    createProject: "+ Izveidot projektu",
    field: "Lauks",
    cropStage: "Kultūra / stadija",
    area: "Platība",
    status: "Statuss",
    actions: "Darbības",
    created: "izveidots",
    cropNotSpecified: "Kultūra nav norādīta",
    stageNotSpecified: "Stadija nav norādīta",
    delete: "Dzēst",
    edit: "Rediģēt",
    open: "Atvērt →",
    crop: "Kultūra",
    openHealthRecord: "Atvērt Field Health Record",
    footer: "Lauku portfelis rāda aktīvās organizācijas autoritatīvos projekta datus. Analītiskais statuss, prioritātes un Ground Truth ir pieejami Field Health Record.",
    confirmDelete: "Vai tiešām vēlaties dzēst šo projektu?",
    brandSubtitle: "Agronomiskā inteliģence",
    operationsCenter: "Agronomisko operāciju centrs",
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
    fieldPortfolio: "Põldude portfell",
    portfolioDescription: "Aktiivse organisatsiooni põldude ülevaade ja juurdepääs nende Field Health Record vaatele.",
    activeOrganization: "Aktiivne organisatsioon",
    role: "Roll",
    signOut: "Logi välja",
    fieldsAndProjects: "Põllud ja projektid",
    heroDescription: "Aktiivse organisatsiooni kõigi põldude operatiivnimekiri. Avage põld, et minna otse selle Field Health Record vaatesse.",
    totalFields: "Põlde kokku",
    newProject: "+ Uus projekt",
    organizationPortfolio: "Organisatsiooni portfell",
    activeFields: "Aktiivsed põllud",
    newestFirst: "Uusimad ees",
    loadingPortfolio: "Portfelli laadimine…",
    emptyTitle: "Aktiivsel organisatsioonil pole veel põlde",
    emptyDescription: "Looge esimene projekt ja alustage seiret.",
    createProject: "+ Loo projekt",
    field: "Põld",
    cropStage: "Kultuur / kasvufaas",
    area: "Pindala",
    status: "Olek",
    actions: "Toimingud",
    created: "loodud",
    cropNotSpecified: "Kultuur pole määratud",
    stageNotSpecified: "Kasvufaas pole määratud",
    delete: "Kustuta",
    edit: "Muuda",
    open: "Ava →",
    crop: "Kultuur",
    openHealthRecord: "Ava Field Health Record",
    footer: "Põldude portfell näitab aktiivse organisatsiooni autoriteetseid projektiandmeid. Analüütiline olek, prioriteedid ja Ground Truth on saadaval Field Health Record vaates.",
    confirmDelete: "Kas soovite selle projekti kindlasti kustutada?",
    brandSubtitle: "Agronoomiline intelligentsus",
    operationsCenter: "Agronoomiliste operatsioonide keskus",
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
    fieldPortfolio: "Χαρτοφυλάκιο αγρών",
    portfolioDescription: "Επισκόπηση των αγρών του ενεργού οργανισμού και πρόσβαση στο Field Health Record τους.",
    activeOrganization: "Ενεργός οργανισμός",
    role: "Ρόλος",
    signOut: "Αποσύνδεση",
    fieldsAndProjects: "Αγροί και έργα",
    heroDescription: "Λειτουργικός κατάλογος όλων των αγρών του ενεργού οργανισμού. Ανοίξτε έναν αγρό για άμεση πρόσβαση στο Field Health Record του.",
    totalFields: "Σύνολο αγρών",
    newProject: "+ Νέο έργο",
    organizationPortfolio: "Χαρτοφυλάκιο οργανισμού",
    activeFields: "Ενεργοί αγροί",
    newestFirst: "Νεότερα πρώτα",
    loadingPortfolio: "Φόρτωση χαρτοφυλακίου…",
    emptyTitle: "Ο ενεργός οργανισμός δεν έχει ακόμη αγρούς",
    emptyDescription: "Δημιουργήστε το πρώτο έργο και ξεκινήστε την παρακολούθηση.",
    createProject: "+ Δημιουργία έργου",
    field: "Αγρός",
    cropStage: "Καλλιέργεια / στάδιο",
    area: "Έκταση",
    status: "Κατάσταση",
    actions: "Ενέργειες",
    created: "δημιουργήθηκε",
    cropNotSpecified: "Δεν έχει οριστεί καλλιέργεια",
    stageNotSpecified: "Δεν έχει οριστεί στάδιο",
    delete: "Διαγραφή",
    edit: "Επεξεργασία",
    open: "Άνοιγμα →",
    crop: "Καλλιέργεια",
    openHealthRecord: "Άνοιγμα Field Health Record",
    footer: "Το χαρτοφυλάκιο αγρών εμφανίζει τα έγκυρα δεδομένα έργου του ενεργού οργανισμού. Η αναλυτική κατάσταση, οι προτεραιότητες και Ground Truth είναι διαθέσιμα στο Field Health Record.",
    confirmDelete: "Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το έργο;",
    brandSubtitle: "Αγρονομική νοημοσύνη",
    operationsCenter: "Κέντρο αγρονομικών επιχειρήσεων",
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
    fieldPortfolio: "Fältportfölj",
    portfolioDescription: "Översikt över den aktiva organisationens fält och åtkomst till deras Field Health Record.",
    activeOrganization: "Aktiv organisation",
    role: "Roll",
    signOut: "Logga ut",
    fieldsAndProjects: "Fält och projekt",
    heroDescription: "Operativ lista över alla fält i den aktiva organisationen. Öppna ett fält för direkt åtkomst till dess Field Health Record.",
    totalFields: "Totalt antal fält",
    newProject: "+ Nytt projekt",
    organizationPortfolio: "Organisationsportfölj",
    activeFields: "Aktiva fält",
    newestFirst: "Nyaste först",
    loadingPortfolio: "Laddar portfölj…",
    emptyTitle: "Den aktiva organisationen har ännu inga fält",
    emptyDescription: "Skapa det första projektet och starta övervakningen.",
    createProject: "+ Skapa projekt",
    field: "Fält",
    cropStage: "Gröda / stadium",
    area: "Areal",
    status: "Status",
    actions: "Åtgärder",
    created: "skapat",
    cropNotSpecified: "Gröda ej angiven",
    stageNotSpecified: "Stadium ej angivet",
    delete: "Ta bort",
    edit: "Redigera",
    open: "Öppna →",
    crop: "Gröda",
    openHealthRecord: "Öppna Field Health Record",
    footer: "Fältportföljen visar den aktiva organisationens auktoritativa projektdata. Analysstatus, prioriteringar och Ground Truth finns i Field Health Record.",
    confirmDelete: "Är du säker på att du vill ta bort detta projekt?",
    brandSubtitle: "Agronomisk intelligens",
    operationsCenter: "Agronomiskt operationscenter",
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
    fieldPortfolio: "Markportefølje",
    portfolioDescription: "Oversigt over den aktive organisations marker og adgang til deres Field Health Record.",
    activeOrganization: "Aktiv organisation",
    role: "Rolle",
    signOut: "Log ud",
    fieldsAndProjects: "Marker og projekter",
    heroDescription: "Operationel liste over alle marker i den aktive organisation. Åbn en mark for direkte adgang til dens Field Health Record.",
    totalFields: "Marker i alt",
    newProject: "+ Nyt projekt",
    organizationPortfolio: "Organisationsportefølje",
    activeFields: "Aktive marker",
    newestFirst: "Nyeste først",
    loadingPortfolio: "Indlæser portefølje…",
    emptyTitle: "Den aktive organisation har endnu ingen marker",
    emptyDescription: "Opret det første projekt og start overvågningen.",
    createProject: "+ Opret projekt",
    field: "Mark",
    cropStage: "Afgrøde / stadie",
    area: "Areal",
    status: "Status",
    actions: "Handlinger",
    created: "oprettet",
    cropNotSpecified: "Afgrøde ikke angivet",
    stageNotSpecified: "Stadie ikke angivet",
    delete: "Slet",
    edit: "Rediger",
    open: "Åbn →",
    crop: "Afgrøde",
    openHealthRecord: "Åbn Field Health Record",
    footer: "Markporteføljen viser den aktive organisations autoritative projektdata. Analysestatus, prioriteter og Ground Truth er tilgængelige i Field Health Record.",
    confirmDelete: "Er du sikker på, at du vil slette dette projekt?",
    brandSubtitle: "Agronomisk intelligens",
    operationsCenter: "Agronomisk driftscenter",
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
    fieldPortfolio: "Feltportefølje",
    portfolioDescription: "Oversikt over feltene i den aktive organisasjonen og tilgang til deres Field Health Record.",
    activeOrganization: "Aktiv organisasjon",
    role: "Rolle",
    signOut: "Logg ut",
    fieldsAndProjects: "Felt og prosjekter",
    heroDescription: "Operativ liste over alle felt i den aktive organisasjonen. Åpne et felt for direkte tilgang til Field Health Record.",
    totalFields: "Felt totalt",
    newProject: "+ Nytt prosjekt",
    organizationPortfolio: "Organisasjonsportefølje",
    activeFields: "Aktive felt",
    newestFirst: "Nyeste først",
    loadingPortfolio: "Laster portefølje…",
    emptyTitle: "Den aktive organisasjonen har ennå ingen felt",
    emptyDescription: "Opprett det første prosjektet og start overvåkingen.",
    createProject: "+ Opprett prosjekt",
    field: "Felt",
    cropStage: "Vekst / stadium",
    area: "Areal",
    status: "Status",
    actions: "Handlinger",
    created: "opprettet",
    cropNotSpecified: "Vekst ikke angitt",
    stageNotSpecified: "Stadium ikke angitt",
    delete: "Slett",
    edit: "Rediger",
    open: "Åpne →",
    crop: "Vekst",
    openHealthRecord: "Åpne Field Health Record",
    footer: "Feltporteføljen viser den aktive organisasjonens autoritative prosjektdata. Analysestatus, prioriteringer og Ground Truth er tilgjengelige i Field Health Record.",
    confirmDelete: "Er du sikker på at du vil slette dette prosjektet?",
    brandSubtitle: "Agronomisk intelligens",
    operationsCenter: "Agronomisk driftssenter",
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
    fieldPortfolio: "Lohkoportfolio",
    portfolioDescription: "Aktiivisen organisaation lohkojen yleiskuva ja pääsy niiden Field Health Record -näkymään.",
    activeOrganization: "Aktiivinen organisaatio",
    role: "Rooli",
    signOut: "Kirjaudu ulos",
    fieldsAndProjects: "Lohkot ja projektit",
    heroDescription: "Aktiivisen organisaation kaikkien lohkojen operatiivinen luettelo. Avaa lohko päästäksesi suoraan sen Field Health Record -näkymään.",
    totalFields: "Lohkoja yhteensä",
    newProject: "+ Uusi projekti",
    organizationPortfolio: "Organisaation portfolio",
    activeFields: "Aktiiviset lohkot",
    newestFirst: "Uusimmat ensin",
    loadingPortfolio: "Ladataan portfoliota…",
    emptyTitle: "Aktiivisella organisaatiolla ei vielä ole lohkoja",
    emptyDescription: "Luo ensimmäinen projekti ja aloita seuranta.",
    createProject: "+ Luo projekti",
    field: "Lohko",
    cropStage: "Kasvi / kasvuvaihe",
    area: "Pinta-ala",
    status: "Tila",
    actions: "Toiminnot",
    created: "luotu",
    cropNotSpecified: "Kasvia ei määritetty",
    stageNotSpecified: "Kasvuvaihetta ei määritetty",
    delete: "Poista",
    edit: "Muokkaa",
    open: "Avaa →",
    crop: "Kasvi",
    openHealthRecord: "Avaa Field Health Record",
    footer: "Lohkoportfolio näyttää aktiivisen organisaation auktoritatiiviset projektitiedot. Analyyttinen tila, prioriteetit ja Ground Truth ovat saatavilla Field Health Record -näkymässä.",
    confirmDelete: "Haluatko varmasti poistaa tämän projektin?",
    brandSubtitle: "Agronominen älykkyys",
    operationsCenter: "Agronominen operaatiokeskus",
  };
  const copies = { en, cs, sk, de, pl, fr, es, it, nl, pt, ro, hu, uk, bg, hr, sl, lt, lv, et, el, sv, da, no, fi } as const;
  return copies[language as keyof typeof copies] ?? copies.en;
}

const projectsLocaleMap = {
  cs: "cs-CZ", en: "en-GB", sk: "sk-SK", de: "de-DE", pl: "pl-PL",
  fr: "fr-FR", es: "es-ES", it: "it-IT", nl: "nl-NL", pt: "pt-PT",
  ro: "ro-RO", hu: "hu-HU", uk: "uk-UA", bg: "bg-BG", hr: "hr-HR",
  sl: "sl-SI", lt: "lt-LT", lv: "lv-LV", et: "et-EE", el: "el-GR",
  sv: "sv-SE", da: "da-DK", no: "nb-NO", fi: "fi-FI",
} as const;

function getNavigation(copy: ReturnType<typeof getProjectsCopy>) {
  return [
    { href: "/dashboard", icon: "📊", title: copy.dashboard, subtitle: copy.dashboardSubtitle },
    { href: "/ai", icon: "🧠", title: copy.aiAnalysis, subtitle: copy.aiAnalysisSubtitle },
    { href: "/map", icon: "🗺️", title: copy.map, subtitle: copy.mapSubtitle },
    { href: "/projects", icon: "📁", title: copy.projects, subtitle: copy.projectsSubtitle },
    { href: "/reports", icon: "📄", title: copy.reports, subtitle: copy.reportsSubtitle },
    { href: "/settings", icon: "⚙️", title: copy.settings, subtitle: copy.settingsSubtitle },
  ];
}

export default function ProjectsPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getProjectsCopy(language);
  const navigation = getNavigation(copy);
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [activeOrganizationId, setActiveOrganizationId] =
    useState<string | null>(null);
  const [organizationRole, setOrganizationRole] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("active_organization_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("CHYBA NAČTENÍ AKTIVNÍ ORGANIZACE:", profileError);
        setLoading(false);
        return;
      }

      const organizationId = profile?.active_organization_id ?? null;

      if (!organizationId) {
        console.error("CHYBA: Uživatel nemá nastavenou aktivní organizaci.");
        setLoading(false);
        return;
      }

      const { data: membership, error: membershipError } = await supabase
        .from("organization_members")
        .select("role")
        .eq("organization_id", organizationId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (membershipError || !membership) {
        console.error("CHYBA NAČTENÍ ROLE V ORGANIZACI:", membershipError);
        setLoading(false);
        return;
      }

      setActiveOrganizationId(organizationId);
      setOrganizationRole(membership.role);
      await loadProjects(organizationId);
      setLoading(false);
    }

    init();
  }, [router]);

  async function loadProjects(organizationId: string) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("CHYBA NAČTENÍ PROJEKTŮ:", error);
      return;
    }

    setProjects((data ?? []) as Project[]);
  }

  async function deleteProject(id: number) {
    const ok = window.confirm(
      copy.confirmDelete
    );

    if (!ok) return;

    if (
      organizationRole !== "owner" &&
      organizationRole !== "admin"
    ) {
      console.error("CHYBA: Nedostatečné oprávnění ke smazání projektu.");
      return;
    }

    const { data: deletedProject, error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("CHYBA MAZÁNÍ PROJEKTU:", error);
      return;
    }

    if (!deletedProject) {
      console.error("CHYBA: Projekt nebyl smazán nebo k němu není oprávnění.");
      return;
    }

    if (activeOrganizationId) {
      await loadProjects(activeOrganizationId);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(projectsLocaleMap[language as keyof typeof projectsLocaleMap] ?? "en-GB");
  }

  return (
    <div className="min-h-screen bg-[#05090d] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        {/* OPERATIONS SIDEBAR */}
        <aside className="hidden w-[248px] shrink-0 border-r border-white/[0.06] bg-[#070c11] lg:flex lg:flex-col">
          <div className="border-b border-white/[0.06] px-6 py-6">
            <Link href="/dashboard" className="block">
              <div className="text-2xl font-black tracking-[-0.04em] text-cyan-300">
                AEGRIS
              </div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-slate-600">
                Agriculture Intelligence
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-1.5 px-3 py-5">
            {navigation.map((item) => {
              const active = item.href === "/projects";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                    active
                      ? "bg-cyan-300/[0.08] text-cyan-200"
                      : "text-slate-500 hover:bg-white/[0.03] hover:text-slate-200"
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.035] text-sm">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold">{item.title}</div>
                    <div className="mt-0.5 text-[9px] text-slate-600">
                      {item.subtitle}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/[0.06] p-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
                Field Portfolio
              </div>
              <p className="mt-2 text-[10px] leading-5 text-slate-600">
                {copy.portfolioDescription}
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* TOP BAR */}
          <header className="border-b border-white/[0.06] bg-[#070c11]/95">
            <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-600">
                  Agronomic Operations Center
                </div>
                <div className="mt-0.5 text-sm font-bold text-slate-300">
                  Field Portfolio
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <div className="max-w-[260px] truncate text-[11px] font-semibold text-slate-400">
                    {user?.email ?? ""}
                  </div>
                  <div className="mt-0.5 text-[9px] text-slate-700">
                    {organizationRole ? `${copy.role}: ${organizationRole}` : copy.activeOrganization}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/login");
                  }}
                  className="rounded-lg border border-white/[0.07] px-3 py-2 text-[10px] font-bold text-slate-500 transition hover:border-red-400/25 hover:text-red-300"
                >
                  {copy.signOut}
                </button>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* MOBILE NAV */}
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navigation.map((item) => {
                const active = item.href === "/projects";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`shrink-0 rounded-lg border px-3 py-2 text-[10px] font-bold ${
                      active
                        ? "border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-200"
                        : "border-white/[0.06] bg-white/[0.02] text-slate-500"
                    }`}
                  >
                    {item.icon} {item.title}
                  </Link>
                );
              })}
            </div>

            {/* PORTFOLIO HERO */}
            <section className="rounded-[24px] border border-white/[0.07] bg-[#0a1016] p-5 shadow-2xl shadow-black/10 sm:p-6">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
                    Field Portfolio
                  </div>
                  <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                    {copy.fieldsAndProjects}
                  </h1>
                  <p className="mt-2 max-w-2xl text-[11px] leading-5 text-slate-500">
                    {copy.heroDescription}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-white/[0.07] bg-[#071017] px-4 py-3 text-right">
                    <div className="text-[9px] uppercase tracking-[0.16em] text-slate-600">
                      {copy.totalFields}
                    </div>
                    <div className="mt-1 text-2xl font-black text-cyan-300">
                      {projects.length}
                    </div>
                  </div>

                  {organizationRole !== "viewer" && (
                    <Link
                      href="/dashboard?newProject=1"
                      className="inline-flex min-h-[54px] items-center justify-center rounded-xl bg-cyan-300 px-5 text-[11px] font-black text-[#061015] transition hover:bg-cyan-200"
                    >
                      {copy.newProject}
                    </Link>
                  )}
                </div>
              </div>
            </section>

            {/* PROJECT LIST */}
            <section className="mt-4 overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#0a1016]">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-600">
                    {copy.organizationPortfolio}
                  </div>
                  <h2 className="mt-1 text-sm font-black text-slate-200">
                    {copy.activeFields}
                  </h2>
                </div>
                <div className="text-[9px] text-slate-600">
                  {copy.newestFirst}
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-slate-600">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/[0.08] border-t-cyan-300" />
                    <span className="text-[10px]">{copy.loadingPortfolio}</span>
                  </div>
                </div>
              ) : projects.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <div className="text-3xl">◎</div>
                  <h3 className="mt-4 text-lg font-black text-slate-200">
                    {copy.emptyTitle}
                  </h3>
                  <p className="mt-2 text-[11px] text-slate-600">
                    {copy.emptyDescription}
                  </p>
                  {organizationRole !== "viewer" && (
                    <Link
                      href="/dashboard?newProject=1"
                      className="mt-5 inline-flex rounded-xl bg-cyan-300 px-5 py-3 text-[11px] font-black text-[#061015]"
                    >
                      {copy.createProject}
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  {/* DESKTOP TABLE */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-[minmax(230px,1.5fr)_minmax(150px,1fr)_120px_150px_220px] gap-4 border-b border-white/[0.05] bg-white/[0.015] px-6 py-3 text-[8px] font-black uppercase tracking-[0.16em] text-slate-700">
                      <div>{copy.field}</div>
                      <div>{copy.cropStage}</div>
                      <div>{copy.area}</div>
                      <div>{copy.status}</div>
                      <div className="text-right">{copy.actions}</div>
                    </div>

                    {projects.map((project) => (
                      <article
                        key={project.id}
                        className="grid grid-cols-[minmax(230px,1.5fr)_minmax(150px,1fr)_120px_150px_220px] items-center gap-4 border-b border-white/[0.05] px-6 py-4 transition last:border-b-0 hover:bg-white/[0.018]"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/projects/${project.id}`}
                            className="truncate text-[13px] font-black text-slate-100 transition hover:text-cyan-200"
                          >
                            {project.name}
                          </Link>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-slate-650">
                            <span className="text-slate-600">
                              {project.latitude.toFixed(3)}, {project.longitude.toFixed(3)}
                            </span>
                            <span className="text-slate-700">•</span>
                            <span className="text-slate-600">
                              {copy.created} {formatDate(project.created_at)}
                            </span>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="truncate text-[11px] font-bold text-slate-300">
                            {project.crop_name ?? copy.cropNotSpecified}
                          </div>
                          <div className="mt-1 truncate text-[9px] text-slate-600">
                            {project.crop_variety
                              ? `${project.crop_variety}${project.growth_stage ? ` · ${project.growth_stage}` : ""}`
                              : project.growth_stage ?? copy.stageNotSpecified}
                          </div>
                        </div>

                        <div>
                          <div className="text-[12px] font-black text-slate-300">
                            {project.area_ha != null ? `${project.area_ha} ha` : "—"}
                          </div>
                        </div>

                        <div>
                          <span className="inline-flex rounded-lg border border-emerald-400/15 bg-emerald-400/[0.05] px-2.5 py-1.5 text-[9px] font-black text-emerald-300">
                            {project.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          {(organizationRole === "owner" ||
                            organizationRole === "admin") && (
                            <button
                              type="button"
                              onClick={() => deleteProject(project.id)}
                              className="rounded-lg border border-white/[0.06] px-3 py-2 text-[9px] font-bold text-slate-600 transition hover:border-red-400/25 hover:text-red-300"
                            >
                              Smazat
                            </button>
                          )}

                          {organizationRole !== "viewer" && (
                            <Link
                              href={`/projects/${project.id}/edit`}
                              className="rounded-lg border border-white/[0.07] px-3 py-2 text-[9px] font-bold text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-200"
                            >
                              Upravit
                            </Link>
                          )}

                          <Link
                            href={`/projects/${project.id}`}
                            className="rounded-lg bg-cyan-300 px-3.5 py-2 text-[9px] font-black text-[#061015] transition hover:bg-cyan-200"
                          >
                            {copy.open}
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* MOBILE CARDS */}
                  <div className="divide-y divide-white/[0.05] md:hidden">
                    {projects.map((project) => (
                      <article key={project.id} className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-cyan-300">
                              {copy.field}
                            </div>
                            <h3 className="mt-1 truncate text-lg font-black text-white">
                              {project.name}
                            </h3>
                            <div className="mt-1 text-[9px] text-slate-600">
                              {project.latitude.toFixed(3)}, {project.longitude.toFixed(3)}
                            </div>
                          </div>
                          <span className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.05] px-2 py-1 text-[8px] font-black text-emerald-300">
                            {project.status}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="rounded-xl border border-white/[0.06] bg-[#071017] p-3">
                            <div className="text-[8px] uppercase tracking-wider text-slate-700">
                              {copy.crop}
                            </div>
                            <div className="mt-1 text-[10px] font-bold text-slate-300">
                              {project.crop_name ?? "—"}
                            </div>
                          </div>
                          <div className="rounded-xl border border-white/[0.06] bg-[#071017] p-3">
                            <div className="text-[8px] uppercase tracking-wider text-slate-700">
                              {copy.area}
                            </div>
                            <div className="mt-1 text-[10px] font-bold text-slate-300">
                              {project.area_ha != null ? `${project.area_ha} ha` : "—"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link
                            href={`/projects/${project.id}`}
                            className="flex-1 rounded-lg bg-cyan-300 px-3 py-2.5 text-center text-[10px] font-black text-[#061015]"
                          >
                            {copy.openHealthRecord}
                          </Link>
                          {organizationRole !== "viewer" && (
                            <Link
                              href={`/projects/${project.id}/edit`}
                              className="rounded-lg border border-white/[0.07] px-3 py-2.5 text-[9px] font-bold text-slate-400"
                            >
                              Upravit
                            </Link>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </section>

            <div className="mt-4 text-center text-[9px] leading-5 text-slate-700">
              {copy.footer}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
