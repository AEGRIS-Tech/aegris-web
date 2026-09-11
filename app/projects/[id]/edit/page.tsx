"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Map, {
  Marker,
  NavigationControl,
  ScaleControl,
  Source,
  Layer,
  type MapLayerMouseEvent,
} from "react-map-gl/maplibre";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { supabase } from "@/lib/supabase";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import { useLanguage } from "../../../context/LanguageContext";

type Coordinate = [number, number];

type BoundaryPoint = {
  latitude: number;
  longitude: number;
};

type Project = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  boundary: unknown;
};

function parseBoundary(value: unknown): Coordinate[] {
  if (!value) return [];

  try {
    const parsed =
      typeof value === "string"
        ? JSON.parse(value)
        : value;

    // GeoJSON Polygon
    if (
      parsed &&
      typeof parsed === "object" &&
      "type" in parsed &&
      parsed.type === "Polygon" &&
      "coordinates" in parsed &&
      Array.isArray(parsed.coordinates) &&
      Array.isArray(parsed.coordinates[0])
    ) {
      return parsed.coordinates[0]
        .filter(
          (point: unknown) =>
            Array.isArray(point) &&
            point.length >= 2 &&
            typeof point[0] === "number" &&
            typeof point[1] === "number"
        )
        .map(
          (point: number[]) =>
            [point[0], point[1]] as Coordinate
        );
    }

    // Původní formát z NewProjectModal:
    // [{ latitude, longitude }, ...]
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (point: unknown) =>
          point !== null &&
          typeof point === "object" &&
          "latitude" in point &&
          "longitude" in point &&
          typeof point.latitude === "number" &&
          typeof point.longitude === "number"
      )
    ) {
      return parsed.map(
        (point: BoundaryPoint) =>
          [point.longitude, point.latitude] as Coordinate
      );
    }

    // Alternativní formát: [[longitude, latitude], ...]
    if (Array.isArray(parsed)) {
      return parsed
        .filter(
          (point: unknown) =>
            Array.isArray(point) &&
            point.length >= 2 &&
            typeof point[0] === "number" &&
            typeof point[1] === "number"
        )
        .map(
          (point: number[]) =>
            [point[0], point[1]] as Coordinate
        );
    }
  } catch (error) {
    console.error(
      "CHYBA ČTENÍ HRANICE:",
      error
    );
  }

  return [];
}

function calculateAreaHectares(
  coordinates: Coordinate[]
): number {
  if (coordinates.length < 3) {
    return 0;
  }

  const earthRadius = 6378137;

  const averageLatitude =
    coordinates.reduce(
      (sum, [, latitude]) =>
        sum + latitude,
      0
    ) / coordinates.length;

  const latitudeFactor =
    Math.cos(
      averageLatitude *
        (Math.PI / 180)
    );

  const projected = coordinates.map(
    ([longitude, latitude]) => {
      const longitudeRadians =
        longitude * (Math.PI / 180);

      const latitudeRadians =
        latitude * (Math.PI / 180);

      return [
        earthRadius *
          longitudeRadians *
          latitudeFactor,

        earthRadius *
          latitudeRadians,
      ];
    }
  );

  let area = 0;

  for (
    let index = 0;
    index < projected.length;
    index++
  ) {
    const current =
      projected[index];

    const next =
      projected[
        (index + 1) %
          projected.length
      ];

    area +=
      current[0] * next[1] -
      next[0] * current[1];
  }

  return (
    Math.abs(area) /
    2 /
    10000
  );
}


function getEditProjectCopy(language: string) {
  const copies = {
    cs: {
      projectUnavailable: "Projekt neexistuje nebo nemáte oprávnění k jeho zobrazení.",
      nameRequired: "Název projektu nesmí být prázdný.",
      boundaryMin: "Hranice oblasti musí obsahovat alespoň 3 body.",
      saveFailed: "Projekt se nepodařilo uložit.",
      editDenied: "Nemáte oprávnění tento projekt upravit.",
      loading: "Načítám projekt...",
      accessDenied: "Přístup zamítnut",
      noAccessTitle: "K tomuto projektu nemáte přístup",
      backToProjects: "Zpět na projekty",
      back: "← Zpět",
      eyebrow: "AEGRIS / ÚPRAVA PROJEKTU",
      title: "Upravit projekt",
      description: "Upravte základní informace a hranici sledované oblasti.",
      basicInfo: "ZÁKLADNÍ INFORMACE",
      projectInfo: "Informace o projektu",
      projectName: "Název projektu",
      latitude: "Zeměpisná šířka",
      longitude: "Zeměpisná délka",
      boundaryTitle: "Hranice sledované oblasti",
      boundaryDescription: "Upravte hranici pole přímo na satelitní mapě. Kliknutím přidáte bod a existující body můžete přetáhnout myší.",
      finishEditing: "Dokončit úpravu",
      editBoundary: "Upravit hranici",
      area: "Výměra sledované oblasti",
      boundary: "Hranice",
      points: "bodů",
      editMode: "Režim úprav je aktivní. Kliknutím do mapy přidáte nový bod hranice. Body můžete přetahovat. Výměra se automaticky přepočítává.",
      dragOrRemove: "Přetáhnout nebo kliknutím odstranit",
      boundaryPoint: "Bod hranice",
      boundaryEmpty: "Hranice zatím není nastavena.",
      clearBoundary: "Vymazat hranici",
      saving: "Ukládám...",
      save: "Uložit změny",
      cancel: "Zrušit",
      boundarySet: (count: number, area: string) => "Hranice obsahuje {count} bodů. Výměra: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Zatím {count} bodů. Přidejte alespoň 3.".replace("{count}", String(count)),
    },
    en: {
      projectUnavailable: "The project does not exist or you do not have permission to view it.",
      nameRequired: "Project name cannot be empty.",
      boundaryMin: "The area boundary must contain at least 3 points.",
      saveFailed: "The project could not be saved.",
      editDenied: "You do not have permission to edit this project.",
      loading: "Loading project...",
      accessDenied: "Access denied",
      noAccessTitle: "You do not have access to this project",
      backToProjects: "Back to projects",
      back: "← Back",
      eyebrow: "AEGRIS / EDIT PROJECT",
      title: "Edit project",
      description: "Edit the basic information and boundary of the monitored area.",
      basicInfo: "BASIC INFORMATION",
      projectInfo: "Project information",
      projectName: "Project name",
      latitude: "Latitude",
      longitude: "Longitude",
      boundaryTitle: "Monitored area boundary",
      boundaryDescription: "Edit the field boundary directly on the satellite map. Click to add a point and drag existing points with the mouse.",
      finishEditing: "Finish editing",
      editBoundary: "Edit boundary",
      area: "Monitored area",
      boundary: "Boundary",
      points: "points",
      editMode: "Editing mode is active. Click the map to add a new boundary point. Points can be dragged. The area is recalculated automatically.",
      dragOrRemove: "Drag or click to remove",
      boundaryPoint: "Boundary point",
      boundaryEmpty: "The boundary has not been set yet.",
      clearBoundary: "Clear boundary",
      saving: "Saving...",
      save: "Save changes",
      cancel: "Cancel",
      boundarySet: (count: number, area: string) => "Boundary contains {count} points. Area: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "{count} points so far. Add at least 3.".replace("{count}", String(count)),
    },
    sk: {
      projectUnavailable: "Projekt neexistuje alebo nemáte oprávnenie na jeho zobrazenie.",
      nameRequired: "Názov projektu nesmie byť prázdny.",
      boundaryMin: "Hranica oblasti musí obsahovať aspoň 3 body.",
      saveFailed: "Projekt sa nepodarilo uložiť.",
      editDenied: "Nemáte oprávnenie upraviť tento projekt.",
      loading: "Načítavam projekt...",
      accessDenied: "Prístup zamietnutý",
      noAccessTitle: "K tomuto projektu nemáte prístup",
      backToProjects: "Späť na projekty",
      back: "← Späť",
      eyebrow: "AEGRIS / ÚPRAVA PROJEKTU",
      title: "Upraviť projekt",
      description: "Upravte základné informácie a hranicu sledovanej oblasti.",
      basicInfo: "ZÁKLADNÉ INFORMÁCIE",
      projectInfo: "Informácie o projekte",
      projectName: "Názov projektu",
      latitude: "Zemepisná šírka",
      longitude: "Zemepisná dĺžka",
      boundaryTitle: "Hranica sledovanej oblasti",
      boundaryDescription: "Upravte hranicu poľa priamo na satelitnej mape. Kliknutím pridáte bod a existujúce body môžete presúvať myšou.",
      finishEditing: "Dokončiť úpravu",
      editBoundary: "Upraviť hranicu",
      area: "Výmera sledovanej oblasti",
      boundary: "Hranica",
      points: "bodov",
      editMode: "Režim úprav je aktívny. Kliknutím do mapy pridáte nový bod hranice. Body môžete presúvať. Výmera sa automaticky prepočítava.",
      dragOrRemove: "Presunúť alebo kliknutím odstrániť",
      boundaryPoint: "Bod hranice",
      boundaryEmpty: "Hranica zatiaľ nie je nastavená.",
      clearBoundary: "Vymazať hranicu",
      saving: "Ukladám...",
      save: "Uložiť zmeny",
      cancel: "Zrušiť",
      boundarySet: (count: number, area: string) => "Hranica obsahuje {count} bodov. Výmera: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Zatiaľ {count} bodov. Pridajte aspoň 3.".replace("{count}", String(count)),
    },
    de: {
      projectUnavailable: "Das Projekt existiert nicht oder Sie haben keine Berechtigung, es anzuzeigen.",
      nameRequired: "Der Projektname darf nicht leer sein.",
      boundaryMin: "Die Flächengrenze muss mindestens 3 Punkte enthalten.",
      saveFailed: "Das Projekt konnte nicht gespeichert werden.",
      editDenied: "Sie haben keine Berechtigung, dieses Projekt zu bearbeiten.",
      loading: "Projekt wird geladen...",
      accessDenied: "Zugriff verweigert",
      noAccessTitle: "Sie haben keinen Zugriff auf dieses Projekt",
      backToProjects: "Zurück zu Projekten",
      back: "← Zurück",
      eyebrow: "AEGRIS / PROJEKT BEARBEITEN",
      title: "Projekt bearbeiten",
      description: "Bearbeiten Sie die Grundinformationen und die Grenze der überwachten Fläche.",
      basicInfo: "GRUNDINFORMATIONEN",
      projectInfo: "Projektinformationen",
      projectName: "Projektname",
      latitude: "Breitengrad",
      longitude: "Längengrad",
      boundaryTitle: "Grenze der überwachten Fläche",
      boundaryDescription: "Bearbeiten Sie die Feldgrenze direkt auf der Satellitenkarte. Klicken Sie, um einen Punkt hinzuzufügen, und ziehen Sie vorhandene Punkte mit der Maus.",
      finishEditing: "Bearbeitung beenden",
      editBoundary: "Grenze bearbeiten",
      area: "Überwachte Fläche",
      boundary: "Grenze",
      points: "Punkte",
      editMode: "Der Bearbeitungsmodus ist aktiv. Klicken Sie auf die Karte, um einen neuen Grenzpunkt hinzuzufügen. Punkte können verschoben werden. Die Fläche wird automatisch neu berechnet.",
      dragOrRemove: "Ziehen oder zum Entfernen klicken",
      boundaryPoint: "Grenzpunkt",
      boundaryEmpty: "Die Grenze wurde noch nicht festgelegt.",
      clearBoundary: "Grenze löschen",
      saving: "Speichern...",
      save: "Änderungen speichern",
      cancel: "Abbrechen",
      boundarySet: (count: number, area: string) => "Die Grenze enthält {count} Punkte. Fläche: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Bisher {count} Punkte. Fügen Sie mindestens 3 hinzu.".replace("{count}", String(count)),
    },
    pl: {
      projectUnavailable: "Projekt nie istnieje lub nie masz uprawnień do jego wyświetlenia.",
      nameRequired: "Nazwa projektu nie może być pusta.",
      boundaryMin: "Granica obszaru musi zawierać co najmniej 3 punkty.",
      saveFailed: "Nie udało się zapisać projektu.",
      editDenied: "Nie masz uprawnień do edycji tego projektu.",
      loading: "Ładowanie projektu...",
      accessDenied: "Odmowa dostępu",
      noAccessTitle: "Nie masz dostępu do tego projektu",
      backToProjects: "Powrót do projektów",
      back: "← Wstecz",
      eyebrow: "AEGRIS / EDYCJA PROJEKTU",
      title: "Edytuj projekt",
      description: "Edytuj podstawowe informacje i granicę monitorowanego obszaru.",
      basicInfo: "PODSTAWOWE INFORMACJE",
      projectInfo: "Informacje o projekcie",
      projectName: "Nazwa projektu",
      latitude: "Szerokość geograficzna",
      longitude: "Długość geograficzna",
      boundaryTitle: "Granica monitorowanego obszaru",
      boundaryDescription: "Edytuj granicę pola bezpośrednio na mapie satelitarnej. Kliknij, aby dodać punkt, a istniejące punkty przeciągaj myszą.",
      finishEditing: "Zakończ edycję",
      editBoundary: "Edytuj granicę",
      area: "Monitorowany obszar",
      boundary: "Granica",
      points: "punkty",
      editMode: "Tryb edycji jest aktywny. Kliknij mapę, aby dodać nowy punkt granicy. Punkty można przeciągać. Powierzchnia jest przeliczana automatycznie.",
      dragOrRemove: "Przeciągnij lub kliknij, aby usunąć",
      boundaryPoint: "Punkt granicy",
      boundaryEmpty: "Granica nie została jeszcze ustawiona.",
      clearBoundary: "Wyczyść granicę",
      saving: "Zapisywanie...",
      save: "Zapisz zmiany",
      cancel: "Anuluj",
      boundarySet: (count: number, area: string) => "Granica zawiera {count} punktów. Powierzchnia: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Dotychczas {count} punktów. Dodaj co najmniej 3.".replace("{count}", String(count)),
    },
    fr: {
      projectUnavailable: "Le projet n’existe pas ou vous n’êtes pas autorisé à le consulter.",
      nameRequired: "Le nom du projet ne peut pas être vide.",
      boundaryMin: "La limite de la zone doit comporter au moins 3 points.",
      saveFailed: "Le projet n’a pas pu être enregistré.",
      editDenied: "Vous n’êtes pas autorisé à modifier ce projet.",
      loading: "Chargement du projet...",
      accessDenied: "Accès refusé",
      noAccessTitle: "Vous n’avez pas accès à ce projet",
      backToProjects: "Retour aux projets",
      back: "← Retour",
      eyebrow: "AEGRIS / MODIFIER LE PROJET",
      title: "Modifier le projet",
      description: "Modifiez les informations de base et la limite de la zone suivie.",
      basicInfo: "INFORMATIONS DE BASE",
      projectInfo: "Informations sur le projet",
      projectName: "Nom du projet",
      latitude: "Latitude",
      longitude: "Longitude",
      boundaryTitle: "Limite de la zone suivie",
      boundaryDescription: "Modifiez la limite de la parcelle directement sur la carte satellite. Cliquez pour ajouter un point et faites glisser les points existants avec la souris.",
      finishEditing: "Terminer la modification",
      editBoundary: "Modifier la limite",
      area: "Surface suivie",
      boundary: "Limite",
      points: "points",
      editMode: "Le mode de modification est actif. Cliquez sur la carte pour ajouter un nouveau point de limite. Les points peuvent être déplacés. La surface est recalculée automatiquement.",
      dragOrRemove: "Faire glisser ou cliquer pour supprimer",
      boundaryPoint: "Point de limite",
      boundaryEmpty: "La limite n’a pas encore été définie.",
      clearBoundary: "Effacer la limite",
      saving: "Enregistrement...",
      save: "Enregistrer les modifications",
      cancel: "Annuler",
      boundarySet: (count: number, area: string) => "La limite contient {count} points. Surface : {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "{count} points pour l’instant. Ajoutez-en au moins 3.".replace("{count}", String(count)),
    },
    es: {
      projectUnavailable: "El proyecto no existe o no tienes permiso para verlo.",
      nameRequired: "El nombre del proyecto no puede estar vacío.",
      boundaryMin: "El límite del área debe contener al menos 3 puntos.",
      saveFailed: "No se pudo guardar el proyecto.",
      editDenied: "No tienes permiso para editar este proyecto.",
      loading: "Cargando proyecto...",
      accessDenied: "Acceso denegado",
      noAccessTitle: "No tienes acceso a este proyecto",
      backToProjects: "Volver a proyectos",
      back: "← Volver",
      eyebrow: "AEGRIS / EDITAR PROYECTO",
      title: "Editar proyecto",
      description: "Edita la información básica y el límite del área monitorizada.",
      basicInfo: "INFORMACIÓN BÁSICA",
      projectInfo: "Información del proyecto",
      projectName: "Nombre del proyecto",
      latitude: "Latitud",
      longitude: "Longitud",
      boundaryTitle: "Límite del área monitorizada",
      boundaryDescription: "Edita el límite de la parcela directamente en el mapa satelital. Haz clic para añadir un punto y arrastra los puntos existentes con el ratón.",
      finishEditing: "Finalizar edición",
      editBoundary: "Editar límite",
      area: "Área monitorizada",
      boundary: "Límite",
      points: "puntos",
      editMode: "El modo de edición está activo. Haz clic en el mapa para añadir un nuevo punto de límite. Los puntos se pueden arrastrar. El área se recalcula automáticamente.",
      dragOrRemove: "Arrastrar o hacer clic para eliminar",
      boundaryPoint: "Punto de límite",
      boundaryEmpty: "El límite aún no se ha definido.",
      clearBoundary: "Borrar límite",
      saving: "Guardando...",
      save: "Guardar cambios",
      cancel: "Cancelar",
      boundarySet: (count: number, area: string) => "El límite contiene {count} puntos. Área: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Hay {count} puntos. Añade al menos 3.".replace("{count}", String(count)),
    },
    it: {
      projectUnavailable: "Il progetto non esiste o non disponi dell’autorizzazione per visualizzarlo.",
      nameRequired: "Il nome del progetto non può essere vuoto.",
      boundaryMin: "Il confine dell’area deve contenere almeno 3 punti.",
      saveFailed: "Impossibile salvare il progetto.",
      editDenied: "Non disponi dell’autorizzazione per modificare questo progetto.",
      loading: "Caricamento progetto...",
      accessDenied: "Accesso negato",
      noAccessTitle: "Non hai accesso a questo progetto",
      backToProjects: "Torna ai progetti",
      back: "← Indietro",
      eyebrow: "AEGRIS / MODIFICA PROGETTO",
      title: "Modifica progetto",
      description: "Modifica le informazioni di base e il confine dell’area monitorata.",
      basicInfo: "INFORMAZIONI DI BASE",
      projectInfo: "Informazioni sul progetto",
      projectName: "Nome del progetto",
      latitude: "Latitudine",
      longitude: "Longitudine",
      boundaryTitle: "Confine dell’area monitorata",
      boundaryDescription: "Modifica il confine del campo direttamente sulla mappa satellitare. Fai clic per aggiungere un punto e trascina con il mouse i punti esistenti.",
      finishEditing: "Termina modifica",
      editBoundary: "Modifica confine",
      area: "Area monitorata",
      boundary: "Confine",
      points: "punti",
      editMode: "La modalità di modifica è attiva. Fai clic sulla mappa per aggiungere un nuovo punto del confine. I punti possono essere trascinati. L’area viene ricalcolata automaticamente.",
      dragOrRemove: "Trascina o fai clic per rimuovere",
      boundaryPoint: "Punto del confine",
      boundaryEmpty: "Il confine non è ancora stato impostato.",
      clearBoundary: "Cancella confine",
      saving: "Salvataggio...",
      save: "Salva modifiche",
      cancel: "Annulla",
      boundarySet: (count: number, area: string) => "Il confine contiene {count} punti. Area: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Finora {count} punti. Aggiungine almeno 3.".replace("{count}", String(count)),
    },
    nl: {
      projectUnavailable: "Het project bestaat niet of u hebt geen toestemming om het te bekijken.",
      nameRequired: "De projectnaam mag niet leeg zijn.",
      boundaryMin: "De gebiedsgrens moet minimaal 3 punten bevatten.",
      saveFailed: "Het project kon niet worden opgeslagen.",
      editDenied: "U hebt geen toestemming om dit project te bewerken.",
      loading: "Project laden...",
      accessDenied: "Toegang geweigerd",
      noAccessTitle: "U hebt geen toegang tot dit project",
      backToProjects: "Terug naar projecten",
      back: "← Terug",
      eyebrow: "AEGRIS / PROJECT BEWERKEN",
      title: "Project bewerken",
      description: "Bewerk de basisinformatie en de grens van het gemonitorde gebied.",
      basicInfo: "BASISINFORMATIE",
      projectInfo: "Projectinformatie",
      projectName: "Projectnaam",
      latitude: "Breedtegraad",
      longitude: "Lengtegraad",
      boundaryTitle: "Grens van gemonitord gebied",
      boundaryDescription: "Bewerk de perceelgrens rechtstreeks op de satellietkaart. Klik om een punt toe te voegen en sleep bestaande punten met de muis.",
      finishEditing: "Bewerken voltooien",
      editBoundary: "Grens bewerken",
      area: "Gemonitord gebied",
      boundary: "Grens",
      points: "punten",
      editMode: "De bewerkingsmodus is actief. Klik op de kaart om een nieuw grenspunt toe te voegen. Punten kunnen worden versleept. De oppervlakte wordt automatisch herberekend.",
      dragOrRemove: "Slepen of klikken om te verwijderen",
      boundaryPoint: "Grenspunt",
      boundaryEmpty: "De grens is nog niet ingesteld.",
      clearBoundary: "Grens wissen",
      saving: "Opslaan...",
      save: "Wijzigingen opslaan",
      cancel: "Annuleren",
      boundarySet: (count: number, area: string) => "De grens bevat {count} punten. Oppervlakte: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Tot nu toe {count} punten. Voeg er minimaal 3 toe.".replace("{count}", String(count)),
    },
    pt: {
      projectUnavailable: "O projeto não existe ou não tem permissão para o visualizar.",
      nameRequired: "O nome do projeto não pode estar vazio.",
      boundaryMin: "O limite da área deve conter pelo menos 3 pontos.",
      saveFailed: "Não foi possível guardar o projeto.",
      editDenied: "Não tem permissão para editar este projeto.",
      loading: "A carregar projeto...",
      accessDenied: "Acesso negado",
      noAccessTitle: "Não tem acesso a este projeto",
      backToProjects: "Voltar aos projetos",
      back: "← Voltar",
      eyebrow: "AEGRIS / EDITAR PROJETO",
      title: "Editar projeto",
      description: "Edite as informações básicas e o limite da área monitorizada.",
      basicInfo: "INFORMAÇÕES BÁSICAS",
      projectInfo: "Informações do projeto",
      projectName: "Nome do projeto",
      latitude: "Latitude",
      longitude: "Longitude",
      boundaryTitle: "Limite da área monitorizada",
      boundaryDescription: "Edite o limite da parcela diretamente no mapa de satélite. Clique para adicionar um ponto e arraste os pontos existentes com o rato.",
      finishEditing: "Concluir edição",
      editBoundary: "Editar limite",
      area: "Área monitorizada",
      boundary: "Limite",
      points: "pontos",
      editMode: "O modo de edição está ativo. Clique no mapa para adicionar um novo ponto ao limite. Os pontos podem ser arrastados. A área é recalculada automaticamente.",
      dragOrRemove: "Arrastar ou clicar para remover",
      boundaryPoint: "Ponto do limite",
      boundaryEmpty: "O limite ainda não foi definido.",
      clearBoundary: "Limpar limite",
      saving: "A guardar...",
      save: "Guardar alterações",
      cancel: "Cancelar",
      boundarySet: (count: number, area: string) => "O limite contém {count} pontos. Área: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Até agora, {count} pontos. Adicione pelo menos 3.".replace("{count}", String(count)),
    },
    ro: {
      projectUnavailable: "Proiectul nu există sau nu aveți permisiunea de a-l vizualiza.",
      nameRequired: "Numele proiectului nu poate fi gol.",
      boundaryMin: "Limita zonei trebuie să conțină cel puțin 3 puncte.",
      saveFailed: "Proiectul nu a putut fi salvat.",
      editDenied: "Nu aveți permisiunea de a edita acest proiect.",
      loading: "Se încarcă proiectul...",
      accessDenied: "Acces refuzat",
      noAccessTitle: "Nu aveți acces la acest proiect",
      backToProjects: "Înapoi la proiecte",
      back: "← Înapoi",
      eyebrow: "AEGRIS / EDITARE PROIECT",
      title: "Editare proiect",
      description: "Editați informațiile de bază și limita zonei monitorizate.",
      basicInfo: "INFORMAȚII DE BAZĂ",
      projectInfo: "Informații despre proiect",
      projectName: "Numele proiectului",
      latitude: "Latitudine",
      longitude: "Longitudine",
      boundaryTitle: "Limita zonei monitorizate",
      boundaryDescription: "Editați limita parcelei direct pe harta satelitară. Faceți clic pentru a adăuga un punct și trageți punctele existente cu mouse-ul.",
      finishEditing: "Finalizare editare",
      editBoundary: "Editare limită",
      area: "Suprafață monitorizată",
      boundary: "Limită",
      points: "puncte",
      editMode: "Modul de editare este activ. Faceți clic pe hartă pentru a adăuga un nou punct al limitei. Punctele pot fi trase. Suprafața este recalculată automat.",
      dragOrRemove: "Trageți sau faceți clic pentru ștergere",
      boundaryPoint: "Punct al limitei",
      boundaryEmpty: "Limita nu a fost încă stabilită.",
      clearBoundary: "Șterge limita",
      saving: "Se salvează...",
      save: "Salvează modificările",
      cancel: "Anulare",
      boundarySet: (count: number, area: string) => "Limita conține {count} puncte. Suprafață: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Până acum {count} puncte. Adăugați cel puțin 3.".replace("{count}", String(count)),
    },
    hu: {
      projectUnavailable: "A projekt nem létezik, vagy nincs jogosultsága a megtekintéséhez.",
      nameRequired: "A projekt neve nem lehet üres.",
      boundaryMin: "A terület határának legalább 3 pontot kell tartalmaznia.",
      saveFailed: "A projekt mentése sikertelen.",
      editDenied: "Nincs jogosultsága a projekt szerkesztéséhez.",
      loading: "Projekt betöltése...",
      accessDenied: "Hozzáférés megtagadva",
      noAccessTitle: "Nincs hozzáférése ehhez a projekthez",
      backToProjects: "Vissza a projektekhez",
      back: "← Vissza",
      eyebrow: "AEGRIS / PROJEKT SZERKESZTÉSE",
      title: "Projekt szerkesztése",
      description: "Szerkessze a megfigyelt terület alapadatait és határát.",
      basicInfo: "ALAPINFORMÁCIÓK",
      projectInfo: "Projektinformációk",
      projectName: "Projekt neve",
      latitude: "Földrajzi szélesség",
      longitude: "Földrajzi hosszúság",
      boundaryTitle: "Megfigyelt terület határa",
      boundaryDescription: "Szerkessze a tábla határát közvetlenül a műholdas térképen. Kattintással adjon hozzá pontot, a meglévő pontokat pedig húzza az egérrel.",
      finishEditing: "Szerkesztés befejezése",
      editBoundary: "Határ szerkesztése",
      area: "Megfigyelt terület",
      boundary: "Határ",
      points: "pont",
      editMode: "A szerkesztési mód aktív. Kattintson a térképre új határpont hozzáadásához. A pontok húzhatók. A terület automatikusan újraszámolódik.",
      dragOrRemove: "Húzza vagy kattintson az eltávolításhoz",
      boundaryPoint: "Határpont",
      boundaryEmpty: "A határ még nincs beállítva.",
      clearBoundary: "Határ törlése",
      saving: "Mentés...",
      save: "Módosítások mentése",
      cancel: "Mégse",
      boundarySet: (count: number, area: string) => "A határ {count} pontot tartalmaz. Terület: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Eddig {count} pont. Adjon hozzá legalább 3-at.".replace("{count}", String(count)),
    },
    uk: {
      projectUnavailable: "Проєкт не існує або у вас немає дозволу на його перегляд.",
      nameRequired: "Назва проєкту не може бути порожньою.",
      boundaryMin: "Межа ділянки має містити щонайменше 3 точки.",
      saveFailed: "Не вдалося зберегти проєкт.",
      editDenied: "У вас немає дозволу редагувати цей проєкт.",
      loading: "Завантаження проєкту...",
      accessDenied: "Доступ заборонено",
      noAccessTitle: "У вас немає доступу до цього проєкту",
      backToProjects: "Назад до проєктів",
      back: "← Назад",
      eyebrow: "AEGRIS / РЕДАГУВАННЯ ПРОЄКТУ",
      title: "Редагувати проєкт",
      description: "Відредагуйте основну інформацію та межу контрольованої ділянки.",
      basicInfo: "ОСНОВНА ІНФОРМАЦІЯ",
      projectInfo: "Інформація про проєкт",
      projectName: "Назва проєкту",
      latitude: "Широта",
      longitude: "Довгота",
      boundaryTitle: "Межа контрольованої ділянки",
      boundaryDescription: "Редагуйте межу поля безпосередньо на супутниковій карті. Клацніть, щоб додати точку, а наявні точки перетягуйте мишею.",
      finishEditing: "Завершити редагування",
      editBoundary: "Редагувати межу",
      area: "Контрольована площа",
      boundary: "Межа",
      points: "точок",
      editMode: "Режим редагування активний. Клацніть карту, щоб додати нову точку межі. Точки можна перетягувати. Площа перераховується автоматично.",
      dragOrRemove: "Перетягніть або клацніть для видалення",
      boundaryPoint: "Точка межі",
      boundaryEmpty: "Межу ще не встановлено.",
      clearBoundary: "Очистити межу",
      saving: "Збереження...",
      save: "Зберегти зміни",
      cancel: "Скасувати",
      boundarySet: (count: number, area: string) => "Межа містить {count} точок. Площа: {area} га.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Наразі {count} точок. Додайте щонайменше 3.".replace("{count}", String(count)),
    },
    bg: {
      projectUnavailable: "Проектът не съществува или нямате разрешение да го преглеждате.",
      nameRequired: "Името на проекта не може да бъде празно.",
      boundaryMin: "Границата на площта трябва да съдържа поне 3 точки.",
      saveFailed: "Проектът не можа да бъде запазен.",
      editDenied: "Нямате разрешение да редактирате този проект.",
      loading: "Зареждане на проекта...",
      accessDenied: "Достъпът е отказан",
      noAccessTitle: "Нямате достъп до този проект",
      backToProjects: "Назад към проектите",
      back: "← Назад",
      eyebrow: "AEGRIS / РЕДАКТИРАНЕ НА ПРОЕКТ",
      title: "Редактиране на проект",
      description: "Редактирайте основната информация и границата на наблюдаваната площ.",
      basicInfo: "ОСНОВНА ИНФОРМАЦИЯ",
      projectInfo: "Информация за проекта",
      projectName: "Име на проекта",
      latitude: "Географска ширина",
      longitude: "Географска дължина",
      boundaryTitle: "Граница на наблюдаваната площ",
      boundaryDescription: "Редактирайте границата на полето директно върху сателитната карта. Щракнете, за да добавите точка, и плъзгайте съществуващите точки с мишката.",
      finishEditing: "Завърши редактирането",
      editBoundary: "Редактирай границата",
      area: "Наблюдавана площ",
      boundary: "Граница",
      points: "точки",
      editMode: "Режимът за редактиране е активен. Щракнете върху картата, за да добавите нова точка на границата. Точките могат да се плъзгат. Площта се преизчислява автоматично.",
      dragOrRemove: "Плъзнете или щракнете за премахване",
      boundaryPoint: "Точка на границата",
      boundaryEmpty: "Границата все още не е зададена.",
      clearBoundary: "Изчисти границата",
      saving: "Запазване...",
      save: "Запази промените",
      cancel: "Отказ",
      boundarySet: (count: number, area: string) => "Границата съдържа {count} точки. Площ: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Засега {count} точки. Добавете поне 3.".replace("{count}", String(count)),
    },
    hr: {
      projectUnavailable: "Projekt ne postoji ili nemate dopuštenje za njegov prikaz.",
      nameRequired: "Naziv projekta ne može biti prazan.",
      boundaryMin: "Granica područja mora sadržavati najmanje 3 točke.",
      saveFailed: "Projekt nije moguće spremiti.",
      editDenied: "Nemate dopuštenje za uređivanje ovog projekta.",
      loading: "Učitavanje projekta...",
      accessDenied: "Pristup odbijen",
      noAccessTitle: "Nemate pristup ovom projektu",
      backToProjects: "Natrag na projekte",
      back: "← Natrag",
      eyebrow: "AEGRIS / UREĐIVANJE PROJEKTA",
      title: "Uredi projekt",
      description: "Uredite osnovne podatke i granicu praćenog područja.",
      basicInfo: "OSNOVNE INFORMACIJE",
      projectInfo: "Informacije o projektu",
      projectName: "Naziv projekta",
      latitude: "Geografska širina",
      longitude: "Geografska dužina",
      boundaryTitle: "Granica praćenog područja",
      boundaryDescription: "Uredite granicu parcele izravno na satelitskoj karti. Kliknite za dodavanje točke, a postojeće točke povucite mišem.",
      finishEditing: "Završi uređivanje",
      editBoundary: "Uredi granicu",
      area: "Praćena površina",
      boundary: "Granica",
      points: "točaka",
      editMode: "Način uređivanja je aktivan. Kliknite kartu za dodavanje nove točke granice. Točke se mogu povlačiti. Površina se automatski preračunava.",
      dragOrRemove: "Povucite ili kliknite za uklanjanje",
      boundaryPoint: "Točka granice",
      boundaryEmpty: "Granica još nije postavljena.",
      clearBoundary: "Izbriši granicu",
      saving: "Spremanje...",
      save: "Spremi promjene",
      cancel: "Odustani",
      boundarySet: (count: number, area: string) => "Granica sadrži {count} točaka. Površina: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Trenutačno {count} točaka. Dodajte najmanje 3.".replace("{count}", String(count)),
    },
    sl: {
      projectUnavailable: "Projekt ne obstaja ali nimate dovoljenja za njegov ogled.",
      nameRequired: "Ime projekta ne sme biti prazno.",
      boundaryMin: "Meja območja mora vsebovati vsaj 3 točke.",
      saveFailed: "Projekta ni bilo mogoče shraniti.",
      editDenied: "Nimate dovoljenja za urejanje tega projekta.",
      loading: "Nalaganje projekta...",
      accessDenied: "Dostop zavrnjen",
      noAccessTitle: "Do tega projekta nimate dostopa",
      backToProjects: "Nazaj na projekte",
      back: "← Nazaj",
      eyebrow: "AEGRIS / UREJANJE PROJEKTA",
      title: "Uredi projekt",
      description: "Uredite osnovne informacije in mejo spremljanega območja.",
      basicInfo: "OSNOVNE INFORMACIJE",
      projectInfo: "Informacije o projektu",
      projectName: "Ime projekta",
      latitude: "Zemljepisna širina",
      longitude: "Zemljepisna dolžina",
      boundaryTitle: "Meja spremljanega območja",
      boundaryDescription: "Uredite mejo parcele neposredno na satelitskem zemljevidu. Kliknite za dodajanje točke, obstoječe točke pa povlecite z miško.",
      finishEditing: "Končaj urejanje",
      editBoundary: "Uredi mejo",
      area: "Spremljana površina",
      boundary: "Meja",
      points: "točk",
      editMode: "Način urejanja je aktiven. Kliknite zemljevid, da dodate novo mejno točko. Točke lahko povlečete. Površina se samodejno preračuna.",
      dragOrRemove: "Povlecite ali kliknite za odstranitev",
      boundaryPoint: "Mejna točka",
      boundaryEmpty: "Meja še ni nastavljena.",
      clearBoundary: "Počisti mejo",
      saving: "Shranjevanje...",
      save: "Shrani spremembe",
      cancel: "Prekliči",
      boundarySet: (count: number, area: string) => "Meja vsebuje {count} točk. Površina: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Za zdaj {count} točk. Dodajte vsaj 3.".replace("{count}", String(count)),
    },
    lt: {
      projectUnavailable: "Projektas neegzistuoja arba neturite teisės jo peržiūrėti.",
      nameRequired: "Projekto pavadinimas negali būti tuščias.",
      boundaryMin: "Teritorijos riba turi turėti bent 3 taškus.",
      saveFailed: "Projekto išsaugoti nepavyko.",
      editDenied: "Neturite teisės redaguoti šio projekto.",
      loading: "Įkeliamas projektas...",
      accessDenied: "Prieiga uždrausta",
      noAccessTitle: "Neturite prieigos prie šio projekto",
      backToProjects: "Atgal į projektus",
      back: "← Atgal",
      eyebrow: "AEGRIS / PROJEKTO REDAGAVIMAS",
      title: "Redaguoti projektą",
      description: "Redaguokite pagrindinę informaciją ir stebimos teritorijos ribą.",
      basicInfo: "PAGRINDINĖ INFORMACIJA",
      projectInfo: "Projekto informacija",
      projectName: "Projekto pavadinimas",
      latitude: "Platuma",
      longitude: "Ilguma",
      boundaryTitle: "Stebimos teritorijos riba",
      boundaryDescription: "Redaguokite lauko ribą tiesiogiai palydoviniame žemėlapyje. Spustelėkite, kad pridėtumėte tašką, o esamus taškus vilkite pele.",
      finishEditing: "Baigti redagavimą",
      editBoundary: "Redaguoti ribą",
      area: "Stebima teritorija",
      boundary: "Riba",
      points: "taškai",
      editMode: "Redagavimo režimas aktyvus. Spustelėkite žemėlapį, kad pridėtumėte naują ribos tašką. Taškus galima vilkti. Plotas perskaičiuojamas automatiškai.",
      dragOrRemove: "Vilkite arba spustelėkite, kad pašalintumėte",
      boundaryPoint: "Ribos taškas",
      boundaryEmpty: "Riba dar nenustatyta.",
      clearBoundary: "Išvalyti ribą",
      saving: "Išsaugoma...",
      save: "Išsaugoti pakeitimus",
      cancel: "Atšaukti",
      boundarySet: (count: number, area: string) => "Ribą sudaro {count} taškai. Plotas: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Kol kas {count} taškai. Pridėkite bent 3.".replace("{count}", String(count)),
    },
    lv: {
      projectUnavailable: "Projekts neeksistē vai jums nav atļaujas to skatīt.",
      nameRequired: "Projekta nosaukums nedrīkst būt tukšs.",
      boundaryMin: "Teritorijas robežai jāietver vismaz 3 punkti.",
      saveFailed: "Projektu neizdevās saglabāt.",
      editDenied: "Jums nav atļaujas rediģēt šo projektu.",
      loading: "Notiek projekta ielāde...",
      accessDenied: "Piekļuve liegta",
      noAccessTitle: "Jums nav piekļuves šim projektam",
      backToProjects: "Atpakaļ uz projektiem",
      back: "← Atpakaļ",
      eyebrow: "AEGRIS / PROJEKTA REDIĢĒŠANA",
      title: "Rediģēt projektu",
      description: "Rediģējiet pamatinformāciju un uzraudzītās teritorijas robežu.",
      basicInfo: "PAMATINFORMĀCIJA",
      projectInfo: "Projekta informācija",
      projectName: "Projekta nosaukums",
      latitude: "Platums",
      longitude: "Garums",
      boundaryTitle: "Uzraudzītās teritorijas robeža",
      boundaryDescription: "Rediģējiet lauka robežu tieši satelītkartē. Noklikšķiniet, lai pievienotu punktu, un velciet esošos punktus ar peli.",
      finishEditing: "Pabeigt rediģēšanu",
      editBoundary: "Rediģēt robežu",
      area: "Uzraudzītā platība",
      boundary: "Robeža",
      points: "punkti",
      editMode: "Rediģēšanas režīms ir aktīvs. Noklikšķiniet kartē, lai pievienotu jaunu robežpunktu. Punktus var vilkt. Platība tiek pārrēķināta automātiski.",
      dragOrRemove: "Velciet vai noklikšķiniet, lai noņemtu",
      boundaryPoint: "Robežpunkts",
      boundaryEmpty: "Robeža vēl nav iestatīta.",
      clearBoundary: "Notīrīt robežu",
      saving: "Saglabā...",
      save: "Saglabāt izmaiņas",
      cancel: "Atcelt",
      boundarySet: (count: number, area: string) => "Robežā ir {count} punkti. Platība: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Pašlaik {count} punkti. Pievienojiet vismaz 3.".replace("{count}", String(count)),
    },
    et: {
      projectUnavailable: "Projekti ei ole olemas või teil puudub selle vaatamiseks õigus.",
      nameRequired: "Projekti nimi ei tohi olla tühi.",
      boundaryMin: "Ala piir peab sisaldama vähemalt 3 punkti.",
      saveFailed: "Projekti ei õnnestunud salvestada.",
      editDenied: "Teil puudub õigus seda projekti muuta.",
      loading: "Projekti laadimine...",
      accessDenied: "Juurdepääs keelatud",
      noAccessTitle: "Teil puudub sellele projektile juurdepääs",
      backToProjects: "Tagasi projektide juurde",
      back: "← Tagasi",
      eyebrow: "AEGRIS / PROJEKTI MUUTMINE",
      title: "Muuda projekti",
      description: "Muutke jälgitava ala põhiandmeid ja piiri.",
      basicInfo: "PÕHIANDMED",
      projectInfo: "Projekti andmed",
      projectName: "Projekti nimi",
      latitude: "Laiuskraad",
      longitude: "Pikkuskraad",
      boundaryTitle: "Jälgitava ala piir",
      boundaryDescription: "Muutke põllupiiri otse satelliitkaardil. Punkti lisamiseks klõpsake ja olemasolevaid punkte lohistage hiirega.",
      finishEditing: "Lõpeta muutmine",
      editBoundary: "Muuda piiri",
      area: "Jälgitav ala",
      boundary: "Piir",
      points: "punkti",
      editMode: "Muutmisrežiim on aktiivne. Uue piiripunkti lisamiseks klõpsake kaardil. Punkte saab lohistada. Pindala arvutatakse automaatselt ümber.",
      dragOrRemove: "Lohistage või klõpsake eemaldamiseks",
      boundaryPoint: "Piiripunkt",
      boundaryEmpty: "Piiri pole veel määratud.",
      clearBoundary: "Tühjenda piir",
      saving: "Salvestamine...",
      save: "Salvesta muudatused",
      cancel: "Tühista",
      boundarySet: (count: number, area: string) => "Piir sisaldab {count} punkti. Pindala: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Praegu {count} punkti. Lisage vähemalt 3.".replace("{count}", String(count)),
    },
    el: {
      projectUnavailable: "Το έργο δεν υπάρχει ή δεν έχετε άδεια να το προβάλετε.",
      nameRequired: "Το όνομα του έργου δεν μπορεί να είναι κενό.",
      boundaryMin: "Το όριο της περιοχής πρέπει να περιέχει τουλάχιστον 3 σημεία.",
      saveFailed: "Δεν ήταν δυνατή η αποθήκευση του έργου.",
      editDenied: "Δεν έχετε άδεια να επεξεργαστείτε αυτό το έργο.",
      loading: "Φόρτωση έργου...",
      accessDenied: "Δεν επιτρέπεται η πρόσβαση",
      noAccessTitle: "Δεν έχετε πρόσβαση σε αυτό το έργο",
      backToProjects: "Πίσω στα έργα",
      back: "← Πίσω",
      eyebrow: "AEGRIS / ΕΠΕΞΕΡΓΑΣΙΑ ΕΡΓΟΥ",
      title: "Επεξεργασία έργου",
      description: "Επεξεργαστείτε τις βασικές πληροφορίες και το όριο της παρακολουθούμενης περιοχής.",
      basicInfo: "ΒΑΣΙΚΕΣ ΠΛΗΡΟΦΟΡΙΕΣ",
      projectInfo: "Πληροφορίες έργου",
      projectName: "Όνομα έργου",
      latitude: "Γεωγραφικό πλάτος",
      longitude: "Γεωγραφικό μήκος",
      boundaryTitle: "Όριο παρακολουθούμενης περιοχής",
      boundaryDescription: "Επεξεργαστείτε το όριο του αγροτεμαχίου απευθείας στον δορυφορικό χάρτη. Κάντε κλικ για να προσθέσετε σημείο και σύρετε τα υπάρχοντα σημεία με το ποντίκι.",
      finishEditing: "Ολοκλήρωση επεξεργασίας",
      editBoundary: "Επεξεργασία ορίου",
      area: "Παρακολουθούμενη έκταση",
      boundary: "Όριο",
      points: "σημεία",
      editMode: "Η λειτουργία επεξεργασίας είναι ενεργή. Κάντε κλικ στον χάρτη για να προσθέσετε νέο σημείο ορίου. Τα σημεία μπορούν να συρθούν. Η έκταση επανυπολογίζεται αυτόματα.",
      dragOrRemove: "Σύρετε ή κάντε κλικ για αφαίρεση",
      boundaryPoint: "Σημείο ορίου",
      boundaryEmpty: "Το όριο δεν έχει ακόμη οριστεί.",
      clearBoundary: "Εκκαθάριση ορίου",
      saving: "Αποθήκευση...",
      save: "Αποθήκευση αλλαγών",
      cancel: "Ακύρωση",
      boundarySet: (count: number, area: string) => "Το όριο περιέχει {count} σημεία. Έκταση: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Μέχρι στιγμής {count} σημεία. Προσθέστε τουλάχιστον 3.".replace("{count}", String(count)),
    },
    sv: {
      projectUnavailable: "Projektet finns inte eller så saknar du behörighet att visa det.",
      nameRequired: "Projektnamnet får inte vara tomt.",
      boundaryMin: "Områdesgränsen måste innehålla minst 3 punkter.",
      saveFailed: "Projektet kunde inte sparas.",
      editDenied: "Du saknar behörighet att redigera projektet.",
      loading: "Laddar projekt...",
      accessDenied: "Åtkomst nekad",
      noAccessTitle: "Du har inte åtkomst till detta projekt",
      backToProjects: "Tillbaka till projekt",
      back: "← Tillbaka",
      eyebrow: "AEGRIS / REDIGERA PROJEKT",
      title: "Redigera projekt",
      description: "Redigera grundinformationen och gränsen för det övervakade området.",
      basicInfo: "GRUNDINFORMATION",
      projectInfo: "Projektinformation",
      projectName: "Projektnamn",
      latitude: "Latitud",
      longitude: "Longitud",
      boundaryTitle: "Gräns för övervakat område",
      boundaryDescription: "Redigera fältgränsen direkt på satellitkartan. Klicka för att lägga till en punkt och dra befintliga punkter med musen.",
      finishEditing: "Slutför redigering",
      editBoundary: "Redigera gräns",
      area: "Övervakat område",
      boundary: "Gräns",
      points: "punkter",
      editMode: "Redigeringsläget är aktivt. Klicka på kartan för att lägga till en ny gränspunkt. Punkter kan dras. Arealen räknas om automatiskt.",
      dragOrRemove: "Dra eller klicka för att ta bort",
      boundaryPoint: "Gränspunkt",
      boundaryEmpty: "Gränsen har ännu inte angetts.",
      clearBoundary: "Rensa gräns",
      saving: "Sparar...",
      save: "Spara ändringar",
      cancel: "Avbryt",
      boundarySet: (count: number, area: string) => "Gränsen innehåller {count} punkter. Areal: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Hittills {count} punkter. Lägg till minst 3.".replace("{count}", String(count)),
    },
    da: {
      projectUnavailable: "Projektet findes ikke, eller du har ikke tilladelse til at se det.",
      nameRequired: "Projektnavnet må ikke være tomt.",
      boundaryMin: "Områdegrænsen skal indeholde mindst 3 punkter.",
      saveFailed: "Projektet kunne ikke gemmes.",
      editDenied: "Du har ikke tilladelse til at redigere dette projekt.",
      loading: "Indlæser projekt...",
      accessDenied: "Adgang nægtet",
      noAccessTitle: "Du har ikke adgang til dette projekt",
      backToProjects: "Tilbage til projekter",
      back: "← Tilbage",
      eyebrow: "AEGRIS / REDIGER PROJEKT",
      title: "Rediger projekt",
      description: "Rediger de grundlæggende oplysninger og grænsen for det overvågede område.",
      basicInfo: "GRUNDLÆGGENDE OPLYSNINGER",
      projectInfo: "Projektoplysninger",
      projectName: "Projektnavn",
      latitude: "Breddegrad",
      longitude: "Længdegrad",
      boundaryTitle: "Grænse for overvåget område",
      boundaryDescription: "Rediger markgrænsen direkte på satellitkortet. Klik for at tilføje et punkt, og træk eksisterende punkter med musen.",
      finishEditing: "Afslut redigering",
      editBoundary: "Rediger grænse",
      area: "Overvåget areal",
      boundary: "Grænse",
      points: "punkter",
      editMode: "Redigeringstilstand er aktiv. Klik på kortet for at tilføje et nyt grænsepunkt. Punkter kan trækkes. Arealet genberegnes automatisk.",
      dragOrRemove: "Træk eller klik for at fjerne",
      boundaryPoint: "Grænsepunkt",
      boundaryEmpty: "Grænsen er endnu ikke angivet.",
      clearBoundary: "Ryd grænse",
      saving: "Gemmer...",
      save: "Gem ændringer",
      cancel: "Annuller",
      boundarySet: (count: number, area: string) => "Grænsen indeholder {count} punkter. Areal: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Indtil videre {count} punkter. Tilføj mindst 3.".replace("{count}", String(count)),
    },
    no: {
      projectUnavailable: "Prosjektet finnes ikke, eller du har ikke tillatelse til å vise det.",
      nameRequired: "Prosjektnavnet kan ikke være tomt.",
      boundaryMin: "Områdegrensen må inneholde minst 3 punkter.",
      saveFailed: "Prosjektet kunne ikke lagres.",
      editDenied: "Du har ikke tillatelse til å redigere dette prosjektet.",
      loading: "Laster prosjekt...",
      accessDenied: "Tilgang nektet",
      noAccessTitle: "Du har ikke tilgang til dette prosjektet",
      backToProjects: "Tilbake til prosjekter",
      back: "← Tilbake",
      eyebrow: "AEGRIS / REDIGER PROSJEKT",
      title: "Rediger prosjekt",
      description: "Rediger grunnleggende informasjon og grensen for det overvåkede området.",
      basicInfo: "GRUNNLEGGENDE INFORMASJON",
      projectInfo: "Prosjektinformasjon",
      projectName: "Prosjektnavn",
      latitude: "Breddegrad",
      longitude: "Lengdegrad",
      boundaryTitle: "Grense for overvåket område",
      boundaryDescription: "Rediger feltgrensen direkte på satellittkartet. Klikk for å legge til et punkt, og dra eksisterende punkter med musen.",
      finishEditing: "Fullfør redigering",
      editBoundary: "Rediger grense",
      area: "Overvåket areal",
      boundary: "Grense",
      points: "punkter",
      editMode: "Redigeringsmodus er aktiv. Klikk på kartet for å legge til et nytt grensepunkt. Punkter kan dras. Arealet beregnes automatisk på nytt.",
      dragOrRemove: "Dra eller klikk for å fjerne",
      boundaryPoint: "Grensepunkt",
      boundaryEmpty: "Grensen er ikke angitt ennå.",
      clearBoundary: "Tøm grense",
      saving: "Lagrer...",
      save: "Lagre endringer",
      cancel: "Avbryt",
      boundarySet: (count: number, area: string) => "Grensen inneholder {count} punkter. Areal: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Så langt {count} punkter. Legg til minst 3.".replace("{count}", String(count)),
    },
    fi: {
      projectUnavailable: "Projektia ei ole olemassa tai sinulla ei ole oikeutta tarkastella sitä.",
      nameRequired: "Projektin nimi ei voi olla tyhjä.",
      boundaryMin: "Alueen rajassa on oltava vähintään 3 pistettä.",
      saveFailed: "Projektia ei voitu tallentaa.",
      editDenied: "Sinulla ei ole oikeutta muokata tätä projektia.",
      loading: "Ladataan projektia...",
      accessDenied: "Pääsy estetty",
      noAccessTitle: "Sinulla ei ole pääsyä tähän projektiin",
      backToProjects: "Takaisin projekteihin",
      back: "← Takaisin",
      eyebrow: "AEGRIS / MUOKKAA PROJEKTIA",
      title: "Muokkaa projektia",
      description: "Muokkaa seurattavan alueen perustietoja ja rajaa.",
      basicInfo: "PERUSTIEDOT",
      projectInfo: "Projektin tiedot",
      projectName: "Projektin nimi",
      latitude: "Leveysaste",
      longitude: "Pituusaste",
      boundaryTitle: "Seurattavan alueen raja",
      boundaryDescription: "Muokkaa pellon rajaa suoraan satelliittikartalla. Lisää piste napsauttamalla ja vedä olemassa olevia pisteitä hiirellä.",
      finishEditing: "Lopeta muokkaus",
      editBoundary: "Muokkaa rajaa",
      area: "Seurattava alue",
      boundary: "Raja",
      points: "pistettä",
      editMode: "Muokkaustila on aktiivinen. Lisää uusi rajapiste napsauttamalla karttaa. Pisteitä voi vetää. Pinta-ala lasketaan automaattisesti uudelleen.",
      dragOrRemove: "Vedä tai poista napsauttamalla",
      boundaryPoint: "Rajapiste",
      boundaryEmpty: "Rajaa ei ole vielä määritetty.",
      clearBoundary: "Tyhjennä raja",
      saving: "Tallennetaan...",
      save: "Tallenna muutokset",
      cancel: "Peruuta",
      boundarySet: (count: number, area: string) => "Rajassa on {count} pistettä. Pinta-ala: {area} ha.".replace("{count}", String(count)).replace("{area}", area),
      boundaryPartial: (count: number) => "Tällä hetkellä {count} pistettä. Lisää vähintään 3.".replace("{count}", String(count)),
    }
  };

  return copies[language as keyof typeof copies] ?? copies.en;
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getEditProjectCopy(language);

  const [project, setProject] =
    useState<Project | null>(null);

  const [name, setName] =
    useState("");

  const [boundary, setBoundary] =
    useState<Coordinate[]>([]);

  const [editingBoundary, setEditingBoundary] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [projectLoadError, setProjectLoadError] =
    useState("");

  useEffect(() => {
    maplibregl.setWorkerUrl(
      "/maplibre/maplibre-gl-worker.mjs"
    );
  }, []);

  useEffect(() => {
    async function loadProject() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const projectId =
        Number(params.id);

      if (!Number.isFinite(projectId)) {
        setProject(null);
        setProjectLoadError(
          copy.projectUnavailable
        );
        setLoading(false);
        return;
      }

      setProjectLoadError("");

      const { data, error } =
        await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .maybeSingle();

      if (error) {
        console.error(
          "CHYBA NAČTENÍ PROJEKTU:",
          error
        );

        setProject(null);
        setProjectLoadError(
          copy.projectUnavailable
        );
        setLoading(false);
        return;
      }

      if (!data) {
        setProject(null);
        setProjectLoadError(
          copy.projectUnavailable
        );
        setLoading(false);
        return;
      }

      setProject(data as Project);
      setName(data.name);

      const loadedBoundary =
        parseBoundary(
          data.boundary
        );

      setBoundary(
        loadedBoundary
      );

      setLoading(false);
    }

    loadProject();
  }, [params.id, router]);

  function handleMapClick(
    event: MapLayerMouseEvent
  ) {
    if (!editingBoundary) {
      return;
    }

    const newPoint: Coordinate = [
      event.lngLat.lng,
      event.lngLat.lat,
    ];

    setBoundary(
      (current) => [
        ...current,
        newPoint,
      ]
    );
  }

  function updateBoundaryPoint(
    index: number,
    longitude: number,
    latitude: number
  ) {
    setBoundary(
      (current) =>
        current.map(
          (
            point,
            pointIndex
          ) =>
            pointIndex === index
              ? [
                  longitude,
                  latitude,
                ]
              : point
        )
    );
  }

  function removeBoundaryPoint(
    index: number
  ) {
    setBoundary(
      (current) =>
        current.filter(
          (
            _,
            pointIndex
          ) =>
            pointIndex !==
            index
        )
    );
  }

  function clearBoundary() {
    setBoundary([]);
  }

  const areaHectares =
    useMemo(
      () =>
        calculateAreaHectares(
          boundary
        ),
      [boundary]
    );

  async function saveProject() {
    if (!project) {
      return;
    }

    if (!name.trim()) {
      setMessage(
        copy.nameRequired
      );

      return;
    }

    if (
      boundary.length > 0 &&
      boundary.length < 3
    ) {
      setMessage(
        copy.boundaryMin
      );

      return;
    }

    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    /*
     * Důležité:
     * Ukládáme boundary ve stejném formátu,
     * který používá nový projekt:
     *
     * [
     *   {
     *     latitude: ...,
     *     longitude: ...
     *   }
     * ]
     */
    const normalizedBoundary =
      boundary.length >= 3
        ? boundary.map(
            ([
              longitude,
              latitude,
            ]) => ({
              latitude,
              longitude,
            })
          )
        : null;

    const { data: updatedProject, error } =
      await supabase
        .from("projects")
        .update({
          name: name.trim(),
          boundary:
            normalizedBoundary,
        })
        .eq(
          "id",
          project.id
        )
        .select("id")
        .maybeSingle();

    if (error) {
      console.error(
        "CHYBA ULOŽENÍ PROJEKTU:",
        error
      );

      setMessage(
        copy.saveFailed
      );

      setSaving(false);
      return;
    }

    if (!updatedProject) {
      setMessage(
        copy.editDenied
      );
      setSaving(false);
      return;
    }

    router.push(
      `/projects/${project.id}`
    );
  }

  const polygonCoordinates =
    boundary.length >= 3
      ? [
          [
            ...boundary,
            boundary[0],
          ],
        ]
      : [];

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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030817] px-4 text-white">
        <div className="text-slate-400">{copy.loading}</div>
      </main>
    );
  }

  if (!project) {
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
            {copy.noAccessTitle}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {projectLoadError ||
              copy.projectUnavailable}
          </p>

          <button
            type="button"
            onClick={() => router.push("/projects")}
            className="mt-6 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
          >
            {copy.backToProjects}
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <main className="mx-auto max-w-[1000px] px-6 py-10">

        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-400"
          >
            {copy.back}
          </Link>

          <LanguageSwitcher />
        </div>

        <div className="mt-8">

          <div className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            {copy.eyebrow}
          </div>

          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">
            {copy.title}
          </h1>

          <p className="mt-2 text-slate-500">
            {copy.description}
          </p>

        </div>

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">

          <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
            {copy.basicInfo}
          </div>

          <h2 className="mt-2 text-xl font-bold">
            {copy.projectInfo}
          </h2>

          <div className="mt-6">

            <label className="block text-sm font-semibold text-slate-300">
              {copy.projectName}
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              placeholder={copy.projectName}
            />

          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">

              <div className="text-xs uppercase tracking-wider text-slate-600">
                {copy.latitude}
              </div>

              <div className="mt-2 font-bold text-slate-200">
                {project.latitude.toFixed(
                  5
                )}
              </div>

            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">

              <div className="text-xs uppercase tracking-wider text-slate-600">
                {copy.longitude}
              </div>

              <div className="mt-2 font-bold text-slate-200">
                {project.longitude.toFixed(
                  5
                )}
              </div>

            </div>

          </div>

          <div className="mt-6">

            <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.03] p-5">

              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                <div>

                  <div className="text-sm font-bold text-cyan-400">
                    {copy.boundaryTitle}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {copy.boundaryDescription}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditingBoundary(
                      (current) =>
                        !current
                    )
                  }
                  className="shrink-0 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-400 transition hover:bg-cyan-400/20"
                >
                  {editingBoundary
                    ? copy.finishEditing
                    : copy.editBoundary}
                </button>

              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">

                  <div className="text-xs uppercase tracking-wider text-slate-600">
                    {copy.area}
                  </div>

                  <div className="mt-2 text-3xl font-black text-cyan-400">
                    {areaHectares.toFixed(
                      2
                    )}{" "}
                    ha
                  </div>

                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">

                  <div className="text-xs uppercase tracking-wider text-slate-600">
                    {copy.boundary}
                  </div>

                  <div className="mt-2 font-bold text-slate-200">
                    {boundary.length} {copy.points}
                  </div>

                </div>

              </div>

              {editingBoundary && (
                <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.04] px-4 py-3 text-sm text-yellow-300">
                  {copy.editMode}
                </div>
              )}

            </div>

            <div className="relative mt-4 h-[500px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">

              <Map
                initialViewState={{
                  latitude:
                    project.latitude,
                  longitude:
                    project.longitude,
                  zoom: 16,
                  pitch: 0,
                  bearing: 0,
                }}
                mapStyle={
                  satelliteStyle
                }
                onClick={
                  handleMapClick
                }
                cursor={
                  editingBoundary
                    ? "crosshair"
                    : "grab"
                }
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

                <Marker
                  longitude={
                    project.longitude
                  }
                  latitude={
                    project.latitude
                  }
                  anchor="center"
                >

                  <div className="relative flex h-10 w-10 items-center justify-center">

                    <div className="absolute h-10 w-10 animate-ping rounded-full bg-cyan-400/30" />

                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-cyan-500 shadow-xl shadow-cyan-500/50">

                      <div className="h-2.5 w-2.5 rounded-full bg-white" />

                    </div>

                  </div>

                </Marker>

                {polygonCoordinates.length > 0 && (
                  <Source
                    id="project-boundary"
                    type="geojson"
                    data={{
                      type: "Feature",
                      properties: {},
                      geometry: {
                        type: "Polygon",
                        coordinates:
                          polygonCoordinates,
                      },
                    }}
                  >

                    <Layer
                      id="project-boundary-fill"
                      type="fill"
                      paint={{
                        "fill-color":
                          "#22d3ee",
                        "fill-opacity":
                          0.18,
                      }}
                    />

                    <Layer
                      id="project-boundary-line"
                      type="line"
                      paint={{
                        "line-color":
                          "#22d3ee",
                        "line-width": 3,
                      }}
                    />

                  </Source>
                )}

                {boundary.map(
                  (
                    point,
                    index
                  ) => (
                    <Marker
                      key={`${index}-${point[0]}-${point[1]}`}
                      longitude={
                        point[0]
                      }
                      latitude={
                        point[1]
                      }
                      anchor="center"
                      draggable={
                        editingBoundary
                      }
                      onDragEnd={(
                        event
                      ) => {
                        updateBoundaryPoint(
                          index,
                          event
                            .lngLat
                            .lng,
                          event
                            .lngLat
                            .lat
                        );
                      }}
                    >

                      <button
                        type="button"
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          if (
                            editingBoundary
                          ) {
                            removeBoundaryPoint(
                              index
                            );
                          }
                        }}
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-cyan-500 text-[10px] font-black text-slate-950 shadow-lg ${
                          editingBoundary
                            ? "cursor-move"
                            : "cursor-default"
                        }`}
                        title={
                          editingBoundary
                            ? copy.dragOrRemove
                            : copy.boundaryPoint
                        }
                      >
                        {index + 1}
                      </button>

                    </Marker>
                  )
                )}

              </Map>

            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

              <div className="text-sm text-slate-500">

                {boundary.length >= 3
                  ? copy.boundarySet(
                      boundary.length,
                      areaHectares.toFixed(2)
                    )
                  : boundary.length > 0
                    ? copy.boundaryPartial(boundary.length)
                    : copy.boundaryEmpty}

              </div>

              {boundary.length > 0 && (
                <button
                  type="button"
                  onClick={
                    clearBoundary
                  }
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500/20"
                >
                  {copy.clearBoundary}
                </button>
              )}

            </div>

          </div>

          {message && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {message}
            </div>
          )}

          <div className="mt-7 flex flex-wrap gap-3 border-t border-slate-800 pt-6">

            <button
              type="button"
              onClick={
                saveProject
              }
              disabled={saving}
              className="rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? copy.saving
                : copy.save}
            </button>

            <Link
              href={`/projects/${project.id}`}
              className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-bold text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              {copy.cancel}
            </Link>

          </div>

        </section>
      </main>
    </div>
  );
}