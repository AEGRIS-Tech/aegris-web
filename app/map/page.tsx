"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useLanguage } from "../context/LanguageContext";
import Map, {
  Marker,
  NavigationControl,
  ScaleControl,
  type MapRef,
} from "react-map-gl/maplibre";

import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Project = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
};

const satelliteStyle = {
  version: 8 as const,

  sources: {
    satellite: {
      type: "raster" as const,
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution:
        "© Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    },
  },

  layers: [
    {
      id: "satellite",
      type: "raster" as const,
      source: "satellite",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

function getMapCopy(language: string) {
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
    sidebarDescription: "Satellite overview of field locations in the active organization.",
    activeOrganization: "Active organization",
    satelliteMap: "Satellite field map",
    mapDescription: "Overview of the active organization's locations. Click a marker to open the Field Health Record.",
    fields: "Fields",
    fieldPortfolio: "Field Portfolio →",
    loadingLocations: "Loading field locations…",
    emptyTitle: "The active organization does not have any fields yet",
    emptyDescription: "Create a project and its location will appear on the operations map.",
    createProject: "+ Create project",
    openProject: "Open project",
    locations: "Field locations",
    markerExplanation: "Markers show recorded project locations. They do not indicate current agronomic priority.",
    satelliteBase: "Satellite basemap · Esri World Imagery",
    brandSubtitle: "Agriculture Intelligence",
    fieldOperationsMap: "Field Operations Map",
    operationsCenter: "Agronomic Operations Center",
    satelliteLabel: "AEGRIS / Satellite",
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
    sidebarDescription: "Satelitní přehled poloh pozemků v aktivní organizaci.",
    activeOrganization: "Aktivní organizace",
    satelliteMap: "Satelitní mapa pozemků",
    mapDescription: "Přehled lokalit aktivní organizace. Kliknutím na značku otevřete Field Health Record.",
    fields: "Pozemky",
    fieldPortfolio: "Portfolio pozemků →",
    loadingLocations: "Načítám lokality pozemků…",
    emptyTitle: "Aktivní organizace zatím nemá žádný pozemek",
    emptyDescription: "Vytvořte projekt a jeho poloha se zobrazí na operační mapě.",
    createProject: "+ Vytvořit projekt",
    openProject: "Otevřít projekt",
    locations: "Lokality pozemků",
    markerExplanation: "Značky zobrazují uložené polohy projektů. Nevyjadřují aktuální agronomickou prioritu.",
    satelliteBase: "Satelitní podklad · Esri World Imagery",
    brandSubtitle: "Agronomická inteligence",
    fieldOperationsMap: "Operační mapa pozemků",
    operationsCenter: "Agronomické operační centrum",
    satelliteLabel: "AEGRIS / Satelit",
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
    sidebarDescription: "Satelitný prehľad polôh pozemkov v aktívnej organizácii.",
    activeOrganization: "Aktívna organizácia",
    satelliteMap: "Satelitná mapa pozemkov",
    mapDescription: "Prehľad lokalít aktívnej organizácie. Kliknutím na značku otvoríte Field Health Record.",
    fields: "Pozemky",
    fieldPortfolio: "Portfólio pozemkov →",
    loadingLocations: "Načítavam lokality pozemkov…",
    emptyTitle: "Aktívna organizácia zatiaľ nemá žiadne pozemky",
    emptyDescription: "Vytvorte projekt a jeho poloha sa zobrazí na operačnej mape.",
    createProject: "+ Vytvoriť projekt",
    openProject: "Otvoriť projekt",
    locations: "Lokality pozemkov",
    markerExplanation: "Značky zobrazujú uložené polohy projektov. Nevyjadrujú aktuálnu agronomickú prioritu.",
    satelliteBase: "Satelitný podklad · Esri World Imagery",
    brandSubtitle: "Agronomická inteligencia",
    fieldOperationsMap: "Operačná mapa pozemkov",
    operationsCenter: "Agronomické operačné centrum",
    satelliteLabel: "AEGRIS / Satelit",
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
    sidebarDescription: "Satellitenübersicht der Feldstandorte in der aktiven Organisation.",
    activeOrganization: "Aktive Organisation",
    satelliteMap: "Satellitenkarte der Felder",
    mapDescription: "Übersicht der Standorte der aktiven Organisation. Klicken Sie auf eine Markierung, um den Field Health Record zu öffnen.",
    fields: "Felder",
    fieldPortfolio: "Feldportfolio →",
    loadingLocations: "Feldstandorte werden geladen…",
    emptyTitle: "Die aktive Organisation hat noch keine Felder",
    emptyDescription: "Erstellen Sie ein Projekt; sein Standort erscheint auf der Betriebskarte.",
    createProject: "+ Projekt erstellen",
    openProject: "Projekt öffnen",
    locations: "Feldstandorte",
    markerExplanation: "Markierungen zeigen gespeicherte Projektstandorte. Sie stellen keine aktuelle agronomische Priorität dar.",
    satelliteBase: "Satellitenkarte · Esri World Imagery",
    brandSubtitle: "Agronomische Intelligenz",
    fieldOperationsMap: "Feldbetriebskarte",
    operationsCenter: "Agronomisches Betriebszentrum",
    satelliteLabel: "AEGRIS / Satellit",
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
    sidebarDescription: "Satelitarny przegląd lokalizacji pól aktywnej organizacji.",
    activeOrganization: "Aktywna organizacja",
    satelliteMap: "Satelitarna mapa pól",
    mapDescription: "Przegląd lokalizacji aktywnej organizacji. Kliknij znacznik, aby otworzyć Field Health Record.",
    fields: "Pola",
    fieldPortfolio: "Portfolio pól →",
    loadingLocations: "Ładowanie lokalizacji pól…",
    emptyTitle: "Aktywna organizacja nie ma jeszcze żadnych pól",
    emptyDescription: "Utwórz projekt, a jego lokalizacja pojawi się na mapie operacyjnej.",
    createProject: "+ Utwórz projekt",
    openProject: "Otwórz projekt",
    locations: "Lokalizacje pól",
    markerExplanation: "Znaczniki pokazują zapisane lokalizacje projektów. Nie wskazują aktualnego priorytetu agronomicznego.",
    satelliteBase: "Mapa satelitarna · Esri World Imagery",
    brandSubtitle: "Inteligencja agronomiczna",
    fieldOperationsMap: "Operacyjna mapa pól",
    operationsCenter: "Agronomiczne centrum operacyjne",
    satelliteLabel: "AEGRIS / Satelita",
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
    sidebarDescription: "Vue satellite des emplacements des parcelles de l’organisation active.",
    activeOrganization: "Organisation active",
    satelliteMap: "Carte satellite des parcelles",
    mapDescription: "Vue d’ensemble des emplacements de l’organisation active. Cliquez sur un repère pour ouvrir le Field Health Record.",
    fields: "Parcelles",
    fieldPortfolio: "Portefeuille de parcelles →",
    loadingLocations: "Chargement des emplacements…",
    emptyTitle: "L’organisation active ne possède encore aucune parcelle",
    emptyDescription: "Créez un projet et son emplacement apparaîtra sur la carte opérationnelle.",
    createProject: "+ Créer un projet",
    openProject: "Ouvrir le projet",
    locations: "Emplacements des parcelles",
    markerExplanation: "Les repères indiquent les emplacements enregistrés des projets. Ils n’indiquent pas la priorité agronomique actuelle.",
    satelliteBase: "Fond satellite · Esri World Imagery",
    brandSubtitle: "Intelligence agronomique",
    fieldOperationsMap: "Carte opérationnelle des parcelles",
    operationsCenter: "Centre des opérations agronomiques",
    satelliteLabel: "AEGRIS / Satellite",
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
    sidebarDescription: "Vista satelital de las ubicaciones de los campos de la organización activa.",
    activeOrganization: "Organización activa",
    satelliteMap: "Mapa satelital de campos",
    mapDescription: "Vista general de las ubicaciones de la organización activa. Haga clic en un marcador para abrir el Field Health Record.",
    fields: "Campos",
    fieldPortfolio: "Cartera de campos →",
    loadingLocations: "Cargando ubicaciones de campos…",
    emptyTitle: "La organización activa aún no tiene campos",
    emptyDescription: "Cree un proyecto y su ubicación aparecerá en el mapa operativo.",
    createProject: "+ Crear proyecto",
    openProject: "Abrir proyecto",
    locations: "Ubicaciones de campos",
    markerExplanation: "Los marcadores muestran ubicaciones registradas de proyectos. No indican la prioridad agronómica actual.",
    satelliteBase: "Mapa base satelital · Esri World Imagery",
    brandSubtitle: "Inteligencia agronómica",
    fieldOperationsMap: "Mapa operativo de campos",
    operationsCenter: "Centro de operaciones agronómicas",
    satelliteLabel: "AEGRIS / Satélite",
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
    sidebarDescription: "Panoramica satellitare delle posizioni dei campi nell’organizzazione attiva.",
    activeOrganization: "Organizzazione attiva",
    satelliteMap: "Mappa satellitare dei campi",
    mapDescription: "Panoramica delle posizioni dell’organizzazione attiva. Fai clic su un indicatore per aprire il Field Health Record.",
    fields: "Campi",
    fieldPortfolio: "Portfolio campi →",
    loadingLocations: "Caricamento posizioni dei campi…",
    emptyTitle: "L’organizzazione attiva non ha ancora campi",
    emptyDescription: "Crea un progetto e la sua posizione apparirà sulla mappa operativa.",
    createProject: "+ Crea progetto",
    openProject: "Apri progetto",
    locations: "Posizioni dei campi",
    markerExplanation: "Gli indicatori mostrano le posizioni registrate dei progetti. Non indicano la priorità agronomica attuale.",
    satelliteBase: "Mappa satellitare · Esri World Imagery",
    brandSubtitle: "Intelligenza agronomica",
    fieldOperationsMap: "Mappa operativa dei campi",
    operationsCenter: "Centro operativo agronomico",
    satelliteLabel: "AEGRIS / Satellite",
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
    sidebarDescription: "Satellietoverzicht van veldlocaties in de actieve organisatie.",
    activeOrganization: "Actieve organisatie",
    satelliteMap: "Satellietkaart van velden",
    mapDescription: "Overzicht van de locaties van de actieve organisatie. Klik op een markering om het Field Health Record te openen.",
    fields: "Velden",
    fieldPortfolio: "Veldportfolio →",
    loadingLocations: "Veldlocaties laden…",
    emptyTitle: "De actieve organisatie heeft nog geen velden",
    emptyDescription: "Maak een project en de locatie verschijnt op de operationele kaart.",
    createProject: "+ Project maken",
    openProject: "Project openen",
    locations: "Veldlocaties",
    markerExplanation: "Markeringen tonen opgeslagen projectlocaties. Ze geven niet de huidige agronomische prioriteit aan.",
    satelliteBase: "Satellietbasiskaart · Esri World Imagery",
    brandSubtitle: "Agronomische intelligentie",
    fieldOperationsMap: "Operationele veldkaart",
    operationsCenter: "Agronomisch operationeel centrum",
    satelliteLabel: "AEGRIS / Satelliet",
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
    sidebarDescription: "Visão por satélite das localizações dos campos da organização ativa.",
    activeOrganization: "Organização ativa",
    satelliteMap: "Mapa de campos por satélite",
    mapDescription: "Visão geral das localizações da organização ativa. Clique num marcador para abrir o Field Health Record.",
    fields: "Campos",
    fieldPortfolio: "Portefólio de campos →",
    loadingLocations: "A carregar localizações dos campos…",
    emptyTitle: "A organização ativa ainda não tem campos",
    emptyDescription: "Crie um projeto e a sua localização aparecerá no mapa operacional.",
    createProject: "+ Criar projeto",
    openProject: "Abrir projeto",
    locations: "Localizações dos campos",
    markerExplanation: "Os marcadores mostram localizações registadas dos projetos. Não indicam a prioridade agronómica atual.",
    satelliteBase: "Mapa base por satélite · Esri World Imagery",
    brandSubtitle: "Inteligência agronómica",
    fieldOperationsMap: "Mapa operacional de campos",
    operationsCenter: "Centro de operações agronómicas",
    satelliteLabel: "AEGRIS / Satélite",
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
    sidebarDescription: "Prezentare prin satelit a locațiilor parcelelor din organizația activă.",
    activeOrganization: "Organizație activă",
    satelliteMap: "Hartă satelitară a parcelelor",
    mapDescription: "Prezentarea locațiilor organizației active. Faceți clic pe un marcaj pentru a deschide Field Health Record.",
    fields: "Parcelele",
    fieldPortfolio: "Portofoliu de parcele →",
    loadingLocations: "Se încarcă locațiile parcelelor…",
    emptyTitle: "Organizația activă nu are încă parcele",
    emptyDescription: "Creați un proiect, iar locația sa va apărea pe harta operațională.",
    createProject: "+ Creează proiect",
    openProject: "Deschide proiectul",
    locations: "Locațiile parcelelor",
    markerExplanation: "Marcajele arată locațiile înregistrate ale proiectelor. Nu indică prioritatea agronomică actuală.",
    satelliteBase: "Hartă satelitară · Esri World Imagery",
    brandSubtitle: "Inteligență agronomică",
    fieldOperationsMap: "Hartă operațională a parcelelor",
    operationsCenter: "Centru de operațiuni agronomice",
    satelliteLabel: "AEGRIS / Satelit",
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
    sidebarDescription: "Az aktív szervezet tábláinak műholdas helyszínáttekintése.",
    activeOrganization: "Aktív szervezet",
    satelliteMap: "Táblák műholdas térképe",
    mapDescription: "Az aktív szervezet helyszíneinek áttekintése. Kattintson egy jelölőre a Field Health Record megnyitásához.",
    fields: "Táblák",
    fieldPortfolio: "Táblaportfólió →",
    loadingLocations: "Táblák helyszíneinek betöltése…",
    emptyTitle: "Az aktív szervezetnek még nincsenek táblái",
    emptyDescription: "Hozzon létre egy projektet, és annak helye megjelenik a műveleti térképen.",
    createProject: "+ Projekt létrehozása",
    openProject: "Projekt megnyitása",
    locations: "Táblák helyszínei",
    markerExplanation: "A jelölők a projektek rögzített helyét mutatják. Nem jelzik az aktuális agronómiai prioritást.",
    satelliteBase: "Műholdas alaptérkép · Esri World Imagery",
    brandSubtitle: "Agronómiai intelligencia",
    fieldOperationsMap: "Táblák műveleti térképe",
    operationsCenter: "Agronómiai műveleti központ",
    satelliteLabel: "AEGRIS / Műhold",
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
    sidebarDescription: "Супутниковий огляд розташування полів активної організації.",
    activeOrganization: "Активна організація",
    satelliteMap: "Супутникова карта полів",
    mapDescription: "Огляд розташувань активної організації. Натисніть маркер, щоб відкрити Field Health Record.",
    fields: "Поля",
    fieldPortfolio: "Портфель полів →",
    loadingLocations: "Завантаження розташувань полів…",
    emptyTitle: "Активна організація ще не має полів",
    emptyDescription: "Створіть проєкт, і його розташування з’явиться на операційній карті.",
    createProject: "+ Створити проєкт",
    openProject: "Відкрити проєкт",
    locations: "Розташування полів",
    markerExplanation: "Маркери показують збережені розташування проєктів. Вони не вказують поточний агрономічний пріоритет.",
    satelliteBase: "Супутникова основа · Esri World Imagery",
    brandSubtitle: "Агрономічний інтелект",
    fieldOperationsMap: "Операційна карта полів",
    operationsCenter: "Агрономічний операційний центр",
    satelliteLabel: "AEGRIS / Супутник",
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
    sidebarDescription: "Сателитен преглед на местоположенията на полетата в активната организация.",
    activeOrganization: "Активна организация",
    satelliteMap: "Сателитна карта на полетата",
    mapDescription: "Преглед на местоположенията на активната организация. Щракнете върху маркер, за да отворите Field Health Record.",
    fields: "Полета",
    fieldPortfolio: "Портфолио от полета →",
    loadingLocations: "Зареждане на местоположенията…",
    emptyTitle: "Активната организация все още няма полета",
    emptyDescription: "Създайте проект и местоположението му ще се появи на оперативната карта.",
    createProject: "+ Създай проект",
    openProject: "Отвори проект",
    locations: "Местоположения на полетата",
    markerExplanation: "Маркерите показват записани местоположения на проекти. Те не показват текущия агрономически приоритет.",
    satelliteBase: "Сателитна основна карта · Esri World Imagery",
    brandSubtitle: "Агрономическа интелигентност",
    fieldOperationsMap: "Оперативна карта на полетата",
    operationsCenter: "Агрономически оперативен център",
    satelliteLabel: "AEGRIS / Сателит",
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
    sidebarDescription: "Satelitski pregled lokacija polja u aktivnoj organizaciji.",
    activeOrganization: "Aktivna organizacija",
    satelliteMap: "Satelitska karta polja",
    mapDescription: "Pregled lokacija aktivne organizacije. Kliknite oznaku za otvaranje Field Health Record.",
    fields: "Polja",
    fieldPortfolio: "Portfelj polja →",
    loadingLocations: "Učitavanje lokacija polja…",
    emptyTitle: "Aktivna organizacija još nema polja",
    emptyDescription: "Izradite projekt i njegova će se lokacija pojaviti na operativnoj karti.",
    createProject: "+ Izradi projekt",
    openProject: "Otvori projekt",
    locations: "Lokacije polja",
    markerExplanation: "Oznake prikazuju zabilježene lokacije projekata. Ne označavaju trenutačni agronomski prioritet.",
    satelliteBase: "Satelitska podloga · Esri World Imagery",
    brandSubtitle: "Agronomska inteligencija",
    fieldOperationsMap: "Operativna karta polja",
    operationsCenter: "Agronomski operativni centar",
    satelliteLabel: "AEGRIS / Satelit",
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
    sidebarDescription: "Satelitski pregled lokacij polj v aktivni organizaciji.",
    activeOrganization: "Aktivna organizacija",
    satelliteMap: "Satelitski zemljevid polj",
    mapDescription: "Pregled lokacij aktivne organizacije. Kliknite oznako, da odprete Field Health Record.",
    fields: "Polja",
    fieldPortfolio: "Portfelj polj →",
    loadingLocations: "Nalaganje lokacij polj…",
    emptyTitle: "Aktivna organizacija še nima polj",
    emptyDescription: "Ustvarite projekt in njegova lokacija se bo prikazala na operativnem zemljevidu.",
    createProject: "+ Ustvari projekt",
    openProject: "Odpri projekt",
    locations: "Lokacije polj",
    markerExplanation: "Oznake prikazujejo zabeležene lokacije projektov. Ne označujejo trenutne agronomske prioritete.",
    satelliteBase: "Satelitska podlaga · Esri World Imagery",
    brandSubtitle: "Agronomska inteligenca",
    fieldOperationsMap: "Operativni zemljevid polj",
    operationsCenter: "Agronomski operativni center",
    satelliteLabel: "AEGRIS / Satelit",
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
    sidebarDescription: "Aktyvios organizacijos laukų vietų palydovinė apžvalga.",
    activeOrganization: "Aktyvi organizacija",
    satelliteMap: "Palydovinis laukų žemėlapis",
    mapDescription: "Aktyvios organizacijos vietų apžvalga. Spustelėkite žymeklį, kad atidarytumėte Field Health Record.",
    fields: "Laukai",
    fieldPortfolio: "Laukų portfelis →",
    loadingLocations: "Įkeliamos laukų vietos…",
    emptyTitle: "Aktyvi organizacija dar neturi laukų",
    emptyDescription: "Sukurkite projektą ir jo vieta atsiras operaciniame žemėlapyje.",
    createProject: "+ Sukurti projektą",
    openProject: "Atidaryti projektą",
    locations: "Laukų vietos",
    markerExplanation: "Žymekliai rodo įrašytas projektų vietas. Jie nenurodo dabartinio agronominio prioriteto.",
    satelliteBase: "Palydovinis pagrindas · Esri World Imagery",
    brandSubtitle: "Agronominė žvalga",
    fieldOperationsMap: "Operacinis laukų žemėlapis",
    operationsCenter: "Agronominių operacijų centras",
    satelliteLabel: "AEGRIS / Palydovas",
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
    sidebarDescription: "Aktīvās organizācijas lauku atrašanās vietu satelīta pārskats.",
    activeOrganization: "Aktīvā organizācija",
    satelliteMap: "Lauku satelīta karte",
    mapDescription: "Aktīvās organizācijas atrašanās vietu pārskats. Noklikšķiniet uz marķiera, lai atvērtu Field Health Record.",
    fields: "Lauki",
    fieldPortfolio: "Lauku portfelis →",
    loadingLocations: "Ielādē lauku atrašanās vietas…",
    emptyTitle: "Aktīvajai organizācijai vēl nav lauku",
    emptyDescription: "Izveidojiet projektu, un tā atrašanās vieta parādīsies operatīvajā kartē.",
    createProject: "+ Izveidot projektu",
    openProject: "Atvērt projektu",
    locations: "Lauku atrašanās vietas",
    markerExplanation: "Marķieri rāda reģistrētās projektu atrašanās vietas. Tie nenorāda pašreizējo agronomisko prioritāti.",
    satelliteBase: "Satelīta pamatkarte · Esri World Imagery",
    brandSubtitle: "Agronomiskā inteliģence",
    fieldOperationsMap: "Lauku operatīvā karte",
    operationsCenter: "Agronomisko operāciju centrs",
    satelliteLabel: "AEGRIS / Satelīts",
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
    sidebarDescription: "Aktiivse organisatsiooni põldude asukohtade satelliitülevaade.",
    activeOrganization: "Aktiivne organisatsioon",
    satelliteMap: "Põldude satelliitkaart",
    mapDescription: "Aktiivse organisatsiooni asukohtade ülevaade. Field Health Record avamiseks klõpsake markeril.",
    fields: "Põllud",
    fieldPortfolio: "Põldude portfell →",
    loadingLocations: "Põldude asukohtade laadimine…",
    emptyTitle: "Aktiivsel organisatsioonil pole veel põlde",
    emptyDescription: "Looge projekt ja selle asukoht ilmub operatiivkaardile.",
    createProject: "+ Loo projekt",
    openProject: "Ava projekt",
    locations: "Põldude asukohad",
    markerExplanation: "Markerid näitavad salvestatud projektide asukohti. Need ei näita praegust agronoomilist prioriteeti.",
    satelliteBase: "Satelliitaluskaart · Esri World Imagery",
    brandSubtitle: "Agronoomiline intelligentsus",
    fieldOperationsMap: "Põldude operatiivkaart",
    operationsCenter: "Agronoomiliste operatsioonide keskus",
    satelliteLabel: "AEGRIS / Satelliit",
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
    sidebarDescription: "Δορυφορική επισκόπηση των τοποθεσιών αγρών του ενεργού οργανισμού.",
    activeOrganization: "Ενεργός οργανισμός",
    satelliteMap: "Δορυφορικός χάρτης αγρών",
    mapDescription: "Επισκόπηση των τοποθεσιών του ενεργού οργανισμού. Κάντε κλικ σε έναν δείκτη για να ανοίξετε το Field Health Record.",
    fields: "Αγροί",
    fieldPortfolio: "Χαρτοφυλάκιο αγρών →",
    loadingLocations: "Φόρτωση τοποθεσιών αγρών…",
    emptyTitle: "Ο ενεργός οργανισμός δεν έχει ακόμη αγρούς",
    emptyDescription: "Δημιουργήστε ένα έργο και η τοποθεσία του θα εμφανιστεί στον επιχειρησιακό χάρτη.",
    createProject: "+ Δημιουργία έργου",
    openProject: "Άνοιγμα έργου",
    locations: "Τοποθεσίες αγρών",
    markerExplanation: "Οι δείκτες εμφανίζουν καταγεγραμμένες τοποθεσίες έργων. Δεν υποδεικνύουν την τρέχουσα αγρονομική προτεραιότητα.",
    satelliteBase: "Δορυφορικό υπόβαθρο · Esri World Imagery",
    brandSubtitle: "Αγρονομική νοημοσύνη",
    fieldOperationsMap: "Επιχειρησιακός χάρτης αγρών",
    operationsCenter: "Κέντρο αγρονομικών επιχειρήσεων",
    satelliteLabel: "AEGRIS / Δορυφόρος",
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
    sidebarDescription: "Satellitöversikt över fältplatser i den aktiva organisationen.",
    activeOrganization: "Aktiv organisation",
    satelliteMap: "Satellitkarta över fält",
    mapDescription: "Översikt över den aktiva organisationens platser. Klicka på en markör för att öppna Field Health Record.",
    fields: "Fält",
    fieldPortfolio: "Fältportfölj →",
    loadingLocations: "Laddar fältplatser…",
    emptyTitle: "Den aktiva organisationen har ännu inga fält",
    emptyDescription: "Skapa ett projekt så visas dess plats på operationskartan.",
    createProject: "+ Skapa projekt",
    openProject: "Öppna projekt",
    locations: "Fältplatser",
    markerExplanation: "Markörer visar registrerade projektplatser. De anger inte aktuell agronomisk prioritet.",
    satelliteBase: "Satellitbaskarta · Esri World Imagery",
    brandSubtitle: "Agronomisk intelligens",
    fieldOperationsMap: "Operativ fältkarta",
    operationsCenter: "Agronomiskt operationscenter",
    satelliteLabel: "AEGRIS / Satellit",
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
    sidebarDescription: "Satellitoversigt over markplaceringer i den aktive organisation.",
    activeOrganization: "Aktiv organisation",
    satelliteMap: "Satellitkort over marker",
    mapDescription: "Oversigt over den aktive organisations placeringer. Klik på en markør for at åbne Field Health Record.",
    fields: "Marker",
    fieldPortfolio: "Markportefølje →",
    loadingLocations: "Indlæser markplaceringer…",
    emptyTitle: "Den aktive organisation har endnu ingen marker",
    emptyDescription: "Opret et projekt, så vises dets placering på driftskortet.",
    createProject: "+ Opret projekt",
    openProject: "Åbn projekt",
    locations: "Markplaceringer",
    markerExplanation: "Markører viser registrerede projektplaceringer. De angiver ikke den aktuelle agronomiske prioritet.",
    satelliteBase: "Satellitbasiskort · Esri World Imagery",
    brandSubtitle: "Agronomisk intelligens",
    fieldOperationsMap: "Driftskort over marker",
    operationsCenter: "Agronomisk driftscenter",
    satelliteLabel: "AEGRIS / Satellit",
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
    sidebarDescription: "Satellittoversikt over feltsteder i den aktive organisasjonen.",
    activeOrganization: "Aktiv organisasjon",
    satelliteMap: "Satellittkart over felt",
    mapDescription: "Oversikt over stedene i den aktive organisasjonen. Klikk på en markør for å åpne Field Health Record.",
    fields: "Felt",
    fieldPortfolio: "Feltportefølje →",
    loadingLocations: "Laster feltsteder…",
    emptyTitle: "Den aktive organisasjonen har ennå ingen felt",
    emptyDescription: "Opprett et prosjekt, så vises plasseringen på driftskartet.",
    createProject: "+ Opprett prosjekt",
    openProject: "Åpne prosjekt",
    locations: "Feltsteder",
    markerExplanation: "Markører viser registrerte prosjektsteder. De angir ikke gjeldende agronomisk prioritet.",
    satelliteBase: "Satellittbasiskart · Esri World Imagery",
    brandSubtitle: "Agronomisk intelligens",
    fieldOperationsMap: "Driftskart over felt",
    operationsCenter: "Agronomisk driftssenter",
    satelliteLabel: "AEGRIS / Satellitt",
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
    sidebarDescription: "Aktiivisen organisaation lohkojen sijaintien satelliittinäkymä.",
    activeOrganization: "Aktiivinen organisaatio",
    satelliteMap: "Lohkojen satelliittikartta",
    mapDescription: "Aktiivisen organisaation sijaintien yleiskuva. Avaa Field Health Record napsauttamalla merkkiä.",
    fields: "Lohkot",
    fieldPortfolio: "Lohkoportfolio →",
    loadingLocations: "Ladataan lohkojen sijainteja…",
    emptyTitle: "Aktiivisella organisaatiolla ei vielä ole lohkoja",
    emptyDescription: "Luo projekti, niin sen sijainti näkyy operatiivisella kartalla.",
    createProject: "+ Luo projekti",
    openProject: "Avaa projekti",
    locations: "Lohkojen sijainnit",
    markerExplanation: "Merkit näyttävät tallennetut projektien sijainnit. Ne eivät osoita nykyistä agronomista prioriteettia.",
    satelliteBase: "Satelliittipohjakartta · Esri World Imagery",
    brandSubtitle: "Agronominen älykkyys",
    fieldOperationsMap: "Lohkojen operatiivinen kartta",
    operationsCenter: "Agronominen operaatiokeskus",
    satelliteLabel: "AEGRIS / Satelliitti",
  };
  const copies = { en, cs, sk, de, pl, fr, es, it, nl, pt, ro, hu, uk, bg, hr, sl, lt, lv, et, el, sv, da, no, fi } as const;
  return copies[language as keyof typeof copies] ?? copies.en;
}

function getMapNavigation(copy: ReturnType<typeof getMapCopy>) {
  return [
    ["📊", copy.dashboard, copy.dashboardSubtitle, "/dashboard"],
    ["🧠", copy.aiAnalysis, copy.aiAnalysisSubtitle, "/ai"],
    ["🗺️", copy.map, copy.mapSubtitle, "/map"],
    ["📁", copy.projects, copy.projectsSubtitle, "/projects"],
    ["📄", copy.reports, copy.reportsSubtitle, "/reports"],
    ["⚙️", copy.settings, copy.settingsSubtitle, "/settings"],
  ] as const;
}

export default function MapPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getMapCopy(language);
  const navigation = getMapNavigation(copy);
  const mapRef = useRef<MapRef | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    maplibregl.setWorkerUrl(
      "/maplibre/maplibre-gl-worker.mjs"
    );
  }, []);

  useEffect(() => {
    async function loadProjects() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("active_organization_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          "CHYBA NAČTENÍ AKTIVNÍ ORGANIZACE PRO MAPU:",
          profileError
        );
        setProjects([]);
        setLoading(false);
        return;
      }

      const activeOrganizationId =
        profile?.active_organization_id ?? null;

      if (!activeOrganizationId) {
        console.error(
          "CHYBA: Uživatel nemá nastavenou aktivní organizaci."
        );
        setProjects([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("id, name, latitude, longitude, status")
        .eq("organization_id", activeOrganizationId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("CHYBA NAČTENÍ PROJEKTŮ PRO MAPU:", error);
        setProjects([]);
        setLoading(false);
        return;
      }

      const validProjects = (data ?? [])
        .map((project) => ({
          id: Number(project.id),
          name: String(project.name ?? "Projekt"),
          latitude: Number(project.latitude),
          longitude: Number(project.longitude),
          status: String(project.status ?? "Monitoring"),
        }))
        .filter(
          (project) =>
            Number.isFinite(project.latitude) &&
            Number.isFinite(project.longitude)
        );

      setProjects(validProjects);
      setLoading(false);
    }

    loadProjects();
  }, [router]);

  useEffect(() => {
    if (!mapRef.current || projects.length === 0) {
      return;
    }

    if (projects.length === 1) {
      mapRef.current.flyTo({
        center: [
          projects[0].longitude,
          projects[0].latitude,
        ],
        zoom: 15,
        duration: 1000,
      });

      return;
    }

    const longitudes = projects.map((project) => project.longitude);
    const latitudes = projects.map((project) => project.latitude);

    const minLongitude = Math.min(...longitudes);
    const maxLongitude = Math.max(...longitudes);
    const minLatitude = Math.min(...latitudes);
    const maxLatitude = Math.max(...latitudes);

    mapRef.current.fitBounds(
      [
        [minLongitude, minLatitude],
        [maxLongitude, maxLatitude],
      ],
      {
        padding: 100,
        maxZoom: 15,
        duration: 800,
      }
    );
  }, [projects]);

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
            {navigation.map(([icon, title, subtitle, href]) => {
              const active = href === "/map";

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
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.035] text-sm">
                    {icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[12px] font-bold">{title}</div>
                    <div className="mt-0.5 text-[9px] text-slate-600">
                      {subtitle}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/[0.06] p-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">
                Field Operations Map
              </div>
              <p className="mt-2 text-[10px] leading-5 text-slate-600">
                {copy.sidebarDescription}
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex flex-1 flex-col">
          {/* TOP BAR */}
          <header className="border-b border-white/[0.06] bg-[#070c11]/95">
            <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-600">
                  Agronomic Operations Center
                </div>
                <div className="mt-0.5 text-sm font-bold text-slate-300">
                  Field Operations Map
                </div>
              </div>

              <div className="hidden text-right sm:block">
                <div className="max-w-[280px] truncate text-[11px] font-semibold text-slate-400">
                  {user?.email ?? ""}
                </div>
                <div className="mt-0.5 text-[9px] text-slate-700">
                  {copy.activeOrganization}
                </div>
              </div>
            </div>
          </header>

          <main className="flex min-h-0 flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
            {/* MOBILE NAV */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navigation.map(([icon, title, , href]) => {
                const active = href === "/map";

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`shrink-0 rounded-lg border px-3 py-2 text-[10px] font-bold ${
                      active
                        ? "border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-200"
                        : "border-white/[0.06] bg-white/[0.02] text-slate-500"
                    }`}
                  >
                    {icon} {title}
                  </Link>
                );
              })}
            </div>

            {/* MAP HEADER */}
            <section className="mb-4 flex flex-col justify-between gap-4 rounded-[22px] border border-white/[0.07] bg-[#0a1016] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
                  Field Operations Map
                </div>
                <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">
                  {copy.satelliteMap}
                </h1>
                <p className="mt-1 text-[10px] leading-5 text-slate-600">
                  {copy.mapDescription}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-white/[0.07] bg-[#071017] px-4 py-2.5">
                  <div className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-700">
                    {copy.fields}
                  </div>
                  <div className="mt-0.5 text-xl font-black text-cyan-300">
                    {loading ? "…" : projects.length}
                  </div>
                </div>

                <Link
                  href="/projects"
                  className="rounded-xl border border-white/[0.07] px-4 py-3 text-[10px] font-bold text-slate-400 transition hover:border-cyan-300/25 hover:text-cyan-200"
                >
                  Field Portfolio →
                </Link>
              </div>
            </section>

            {loading ? (
              <div className="flex min-h-[620px] flex-1 items-center justify-center rounded-[24px] border border-white/[0.07] bg-[#0a1016]">
                <div className="flex flex-col items-center gap-3 text-slate-600">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/[0.08] border-t-cyan-300" />
                  <span className="text-[10px]">{copy.loadingLocations}</span>
                </div>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex min-h-[620px] flex-1 items-center justify-center rounded-[24px] border border-dashed border-white/[0.09] bg-[#0a1016] px-6 text-center">
                <div>
                  <div className="text-4xl">◎</div>
                  <h2 className="mt-4 text-lg font-black text-slate-200">
                    {copy.emptyTitle}
                  </h2>
                  <p className="mt-2 text-[10px] text-slate-600">
                    {copy.emptyDescription}
                  </p>
                  <Link
                    href="/dashboard?newProject=1"
                    className="mt-5 inline-flex rounded-xl bg-cyan-300 px-5 py-3 text-[10px] font-black text-[#061015]"
                  >
                    {copy.createProject}
                  </Link>
                </div>
              </div>
            ) : (
              <section className="relative min-h-[620px] flex-1 overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#071017] shadow-2xl shadow-black/20">
                <Map
                  ref={mapRef}
                  initialViewState={{
                    latitude: projects[0]?.latitude ?? 49.11,
                    longitude: projects[0]?.longitude ?? 17.47,
                    zoom: 10,
                    pitch: 0,
                    bearing: 0,
                  }}
                  mapStyle={satelliteStyle}
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "620px",
                  }}
                >
                  <NavigationControl
                    position="top-right"
                    showCompass
                    showZoom
                  />

                  <ScaleControl
                    position="bottom-left"
                    unit="metric"
                  />

                  {projects.map((project) => (
                    <Marker
                      key={project.id}
                      longitude={project.longitude}
                      latitude={project.latitude}
                      anchor="bottom"
                    >
                      <Link
                        href={`/projects/${project.id}`}
                        className="group block"
                        title={`${copy.openProject} ${project.name}`}
                      >
                        <div className="relative flex flex-col items-center">
                          <div className="pointer-events-none mb-2 hidden min-w-[150px] rounded-xl border border-white/[0.10] bg-[#071017]/95 px-3 py-2.5 shadow-2xl backdrop-blur group-hover:block">
                            <div className="whitespace-nowrap text-[11px] font-black text-white">
                              {project.name}
                            </div>
                            <div className="mt-1 text-[8px] text-slate-500">
                              {project.latitude.toFixed(5)}, {project.longitude.toFixed(5)}
                            </div>
                            <div className="mt-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-cyan-300">
                              {project.status}
                            </div>
                          </div>

                          <div className="relative flex h-10 w-10 items-center justify-center transition group-hover:scale-110">
                            <div className="absolute h-9 w-9 rounded-full border border-cyan-200/25 bg-cyan-300/10 shadow-lg shadow-black/40" />
                            <div className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/90 bg-cyan-300 shadow-lg shadow-cyan-300/20">
                              <div className="h-2 w-2 rounded-full bg-[#061015]" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </Marker>
                  ))}
                </Map>

                <div className="pointer-events-none absolute left-4 top-4 max-w-[270px] rounded-2xl border border-white/[0.09] bg-[#071017]/90 px-4 py-3 shadow-2xl backdrop-blur-md">
                  <div className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-300">
                    AEGRIS / Satellite
                  </div>
                  <div className="mt-1 text-[11px] font-black text-white">
                    {copy.locations}
                  </div>
                  <div className="mt-1 text-[9px] leading-4 text-slate-500">
                    {copy.markerExplanation}
                  </div>
                </div>

                <div className="pointer-events-none absolute bottom-4 right-4 hidden rounded-xl border border-white/[0.08] bg-[#071017]/85 px-3 py-2 text-[8px] text-slate-500 backdrop-blur sm:block">
                  {copy.satelliteBase}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
