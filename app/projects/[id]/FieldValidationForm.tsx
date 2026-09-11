"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

type ValidationResult =
  | "confirmed"
  | "partially_confirmed"
  | "not_confirmed";

type ActualCause =
  | "drought_water_stress"
  | "nutrition"
  | "disease"
  | "pest"
  | "crop_damage"
  | "weed"
  | "other"
  | "no_problem";

type FieldValidation = {
  id: number;
  project_id: number;
  analysis_id: number;
  recommendation_id: number | null;
  alert_id: number | null;
  validated_by: string;
  validation_result: ValidationResult;
  actual_cause: ActualCause | null;
  observed_severity: number | null;
  observed_at: string;
  note: string | null;
  prediction_snapshot: unknown | null;
  created_at: string;
  updated_at: string;
};

type Props = {
  projectId: number;
  analysisId: number;
  recommendationId?: number | null;
  alertId?: number | null;
  readOnly?: boolean;
};

const RESULT_VALUES: Array<{
  value: ValidationResult;
  symbol: string;
}> = [
  { value: "confirmed", symbol: "✓" },
  { value: "partially_confirmed", symbol: "◐" },
  { value: "not_confirmed", symbol: "✕" },
];

const CAUSE_VALUES: ActualCause[] = [
  "drought_water_stress",
  "nutrition",
  "disease",
  "pest",
  "crop_damage",
  "weed",
  "other",
  "no_problem",
];

const SEVERITY_VALUES = [0, 1, 2, 3, 4, 5] as const;

function getFieldValidationCopy(language: string) {
  const copies = {
    cs: {
      resultLabels: {
        confirmed: "Potvrzeno",
        partially_confirmed: "Částečně potvrzeno",
        not_confirmed: "Nepotvrzeno",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Sucho / vodní stres",
        nutrition: "Výživa",
        disease: "Choroba",
        pest: "Škůdce",
        crop_damage: "Poškození porostu",
        weed: "Plevel",
        other: "Jiná příčina",
        no_problem: "Bez problému",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Bez problému", "Velmi nízká", "Nízká", "Střední", "Vysoká", "Velmi vysoká"],
      loadError: "Nepodařilo se načíst terénní ověření.",
      saveError: "Nepodařilo se uložit terénní ověření.",
      saved: "Terénní ověření bylo uloženo.",
      agronomistValidation: "Ověření agronomem",
      loading: "Načítám terénní ověření…",
      title: "OVĚŘENÍ AGRONOMEM",
      description: "Porovnejte výstup AEGRIS se skutečným stavem porostu při kontrole v terénu.",
      verified: "✓ OVĚŘENO",
      pending: "ČEKÁ NA OVĚŘENÍ",
      readOnly: "Viewer má k terénnímu ověření pouze přístup pro čtení.",
      confirmationQuestion: "Potvrdil se stav indikovaný systémem AEGRIS?",
      actualCause: "Skutečná příčina",
      notSelected: "Nevybráno",
      inspectionDate: "Datum terénní kontroly",
      actualSeverity: "Skutečná závažnost nálezu",
      severityScale: "0 = bez problému · 5 = velmi závažný stav",
      severity: "ZÁVAŽNOST",
      clearSeverity: "Zrušit volbu závažnosti",
      note: "Poznámka agronoma",
      notePlaceholder: "Např. projevy stresu v jižní části pozemku, lokálně poškozené rostliny, bez známek choroby…",
      analysis: "Analýza",
      lastModified: "poslední úprava",
      saving: "Ukládám…",
      saveChanges: "Uložit změny ověření",
      saveValidation: "Uložit terénní ověření",
    },
    en: {
      resultLabels: {
        confirmed: "Confirmed",
        partially_confirmed: "Partially confirmed",
        not_confirmed: "Not confirmed",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Drought / water stress",
        nutrition: "Nutrition",
        disease: "Disease",
        pest: "Pest",
        crop_damage: "Crop damage",
        weed: "Weed",
        other: "Other cause",
        no_problem: "No problem",
      } as Record<ActualCause, string>,
      severityDescriptions: ["No problem", "Very low", "Low", "Medium", "High", "Very high"],
      loadError: "Failed to load field validation.",
      saveError: "Failed to save field validation.",
      saved: "Field validation was saved.",
      agronomistValidation: "Agronomist validation",
      loading: "Loading field validation…",
      title: "AGRONOMIST VALIDATION",
      description: "Compare the AEGRIS output with the actual crop condition observed during a field inspection.",
      verified: "✓ VERIFIED",
      pending: "PENDING VALIDATION",
      readOnly: "Viewer has read-only access to field validation.",
      confirmationQuestion: "Was the condition indicated by AEGRIS confirmed?",
      actualCause: "Actual cause",
      notSelected: "Not selected",
      inspectionDate: "Field inspection date",
      actualSeverity: "Actual severity of the finding",
      severityScale: "0 = no problem · 5 = very severe condition",
      severity: "SEVERITY",
      clearSeverity: "Clear severity selection",
      note: "Agronomist note",
      notePlaceholder: "E.g. signs of stress in the southern part of the field, locally damaged plants, no signs of disease…",
      analysis: "Analysis",
      lastModified: "last modified",
      saving: "Saving…",
      saveChanges: "Save validation changes",
      saveValidation: "Save field validation",
    },
    sk: {
      resultLabels: {
        confirmed: "Potvrdené",
        partially_confirmed: "Čiastočne potvrdené",
        not_confirmed: "Nepotvrdené",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Sucho / vodný stres",
        nutrition: "Výživa",
        disease: "Choroba",
        pest: "Škodca",
        crop_damage: "Poškodenie porastu",
        weed: "Burina",
        other: "Iná príčina",
        no_problem: "Bez problému",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Bez problému", "Veľmi nízka", "Nízka", "Stredná", "Vysoká", "Veľmi vysoká"],
      loadError: "Nepodarilo sa načítať terénne overenie.",
      saveError: "Nepodarilo sa uložiť terénne overenie.",
      saved: "Terénne overenie bolo uložené.",
      agronomistValidation: "Overenie agronómom",
      loading: "Načítavam terénne overenie…",
      title: "OVERENIE AGRONÓMOM",
      description: "Porovnajte výstup AEGRIS so skutočným stavom porastu pri kontrole v teréne.",
      verified: "✓ OVERENÉ",
      pending: "ČAKÁ NA OVERENIE",
      readOnly: "Používateľ má k terénnemu overeniu iba prístup na čítanie.",
      confirmationQuestion: "Potvrdil sa stav indikovaný systémom AEGRIS?",
      actualCause: "Skutočná príčina",
      notSelected: "Nevybrané",
      inspectionDate: "Dátum terénnej kontroly",
      actualSeverity: "Skutočná závažnosť nálezu",
      severityScale: "0 = bez problému · 5 = veľmi závažný stav",
      severity: "ZÁVAŽNOSŤ",
      clearSeverity: "Zrušiť výber závažnosti",
      note: "Poznámka agronóma",
      notePlaceholder: "Napr. prejavy stresu v južnej časti pozemku, lokálne poškodené rastliny, bez známok choroby…",
      analysis: "Analýza",
      lastModified: "posledná úprava",
      saving: "Ukladám…",
      saveChanges: "Uložiť zmeny overenia",
      saveValidation: "Uložiť terénne overenie",
    },
    de: {
      resultLabels: {
        confirmed: "Bestätigt",
        partially_confirmed: "Teilweise bestätigt",
        not_confirmed: "Nicht bestätigt",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Trockenheit / Wasserstress",
        nutrition: "Nährstoffversorgung",
        disease: "Krankheit",
        pest: "Schädling",
        crop_damage: "Bestandsschaden",
        weed: "Unkraut",
        other: "Andere Ursache",
        no_problem: "Kein Problem",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Kein Problem", "Sehr gering", "Gering", "Mittel", "Hoch", "Sehr hoch"],
      loadError: "Feldvalidierung konnte nicht geladen werden.",
      saveError: "Feldvalidierung konnte nicht gespeichert werden.",
      saved: "Feldvalidierung wurde gespeichert.",
      agronomistValidation: "Validierung durch Agronom",
      loading: "Feldvalidierung wird geladen…",
      title: "VALIDIERUNG DURCH AGRONOM",
      description: "Vergleichen Sie die AEGRIS-Ausgabe mit dem tatsächlichen Pflanzenbestand bei einer Feldkontrolle.",
      verified: "✓ VALIDIERT",
      pending: "VALIDIERUNG AUSSTEHEND",
      readOnly: "Nur Lesezugriff auf die Feldvalidierung.",
      confirmationQuestion: "Wurde der von AEGRIS angezeigte Zustand bestätigt?",
      actualCause: "Tatsächliche Ursache",
      notSelected: "Nicht ausgewählt",
      inspectionDate: "Datum der Feldkontrolle",
      actualSeverity: "Tatsächlicher Schweregrad",
      severityScale: "0 = kein Problem · 5 = sehr schwerwiegender Zustand",
      severity: "SCHWEREGRAD",
      clearSeverity: "Schweregrad zurücksetzen",
      note: "Notiz des Agronomen",
      notePlaceholder: "Z. B. Stresssymptome im südlichen Feldbereich, lokal geschädigte Pflanzen, keine Krankheitsanzeichen…",
      analysis: "Analyse",
      lastModified: "zuletzt geändert",
      saving: "Speichern…",
      saveChanges: "Validierungsänderungen speichern",
      saveValidation: "Feldvalidierung speichern",
    },
    pl: {
      resultLabels: {
        confirmed: "Potwierdzone",
        partially_confirmed: "Częściowo potwierdzone",
        not_confirmed: "Niepotwierdzone",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Susza / stres wodny",
        nutrition: "Odżywianie",
        disease: "Choroba",
        pest: "Szkodnik",
        crop_damage: "Uszkodzenie uprawy",
        weed: "Chwast",
        other: "Inna przyczyna",
        no_problem: "Brak problemu",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Brak problemu", "Bardzo niska", "Niska", "Średnia", "Wysoka", "Bardzo wysoka"],
      loadError: "Nie udało się wczytać weryfikacji polowej.",
      saveError: "Nie udało się zapisać weryfikacji polowej.",
      saved: "Weryfikacja polowa została zapisana.",
      agronomistValidation: "Weryfikacja agronoma",
      loading: "Wczytywanie weryfikacji polowej…",
      title: "WERYFIKACJA AGRONOMA",
      description: "Porównaj wynik AEGRIS z rzeczywistym stanem uprawy podczas kontroli w terenie.",
      verified: "✓ ZWERYFIKOWANO",
      pending: "OCZEKUJE NA WERYFIKACJĘ",
      readOnly: "Dostęp do weryfikacji polowej jest tylko do odczytu.",
      confirmationQuestion: "Czy stan wskazany przez AEGRIS został potwierdzony?",
      actualCause: "Rzeczywista przyczyna",
      notSelected: "Nie wybrano",
      inspectionDate: "Data kontroli polowej",
      actualSeverity: "Rzeczywista dotkliwość obserwacji",
      severityScale: "0 = brak problemu · 5 = stan bardzo poważny",
      severity: "DOTKLIWOŚĆ",
      clearSeverity: "Wyczyść wybór dotkliwości",
      note: "Notatka agronoma",
      notePlaceholder: "Np. objawy stresu w południowej części pola, miejscowo uszkodzone rośliny, brak oznak choroby…",
      analysis: "Analiza",
      lastModified: "ostatnia zmiana",
      saving: "Zapisywanie…",
      saveChanges: "Zapisz zmiany weryfikacji",
      saveValidation: "Zapisz weryfikację polową",
    },
    fr: {
      resultLabels: {
        confirmed: "Confirmé",
        partially_confirmed: "Partiellement confirmé",
        not_confirmed: "Non confirmé",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Sécheresse / stress hydrique",
        nutrition: "Nutrition",
        disease: "Maladie",
        pest: "Ravageur",
        crop_damage: "Dégâts à la culture",
        weed: "Adventice",
        other: "Autre cause",
        no_problem: "Aucun problème",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Aucun problème", "Très faible", "Faible", "Moyenne", "Élevée", "Très élevée"],
      loadError: "Échec du chargement de la validation terrain.",
      saveError: "Échec de l’enregistrement de la validation terrain.",
      saved: "La validation terrain a été enregistrée.",
      agronomistValidation: "Validation par l’agronome",
      loading: "Chargement de la validation terrain…",
      title: "VALIDATION PAR L’AGRONOME",
      description: "Comparez le résultat AEGRIS à l’état réel de la culture observé lors d’une inspection au champ.",
      verified: "✓ VALIDÉ",
      pending: "VALIDATION EN ATTENTE",
      readOnly: "Accès en lecture seule à la validation terrain.",
      confirmationQuestion: "L’état indiqué par AEGRIS a-t-il été confirmé ?",
      actualCause: "Cause réelle",
      notSelected: "Non sélectionné",
      inspectionDate: "Date de l’inspection au champ",
      actualSeverity: "Gravité réelle de l’observation",
      severityScale: "0 = aucun problème · 5 = état très grave",
      severity: "GRAVITÉ",
      clearSeverity: "Effacer la gravité",
      note: "Note de l’agronome",
      notePlaceholder: "Ex. signes de stress dans la partie sud de la parcelle, plantes localement endommagées, aucun signe de maladie…",
      analysis: "Analyse",
      lastModified: "dernière modification",
      saving: "Enregistrement…",
      saveChanges: "Enregistrer les modifications",
      saveValidation: "Enregistrer la validation terrain",
    },
    es: {
      resultLabels: {
        confirmed: "Confirmado",
        partially_confirmed: "Parcialmente confirmado",
        not_confirmed: "No confirmado",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Sequía / estrés hídrico",
        nutrition: "Nutrición",
        disease: "Enfermedad",
        pest: "Plaga",
        crop_damage: "Daño del cultivo",
        weed: "Maleza",
        other: "Otra causa",
        no_problem: "Sin problema",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Sin problema", "Muy baja", "Baja", "Media", "Alta", "Muy alta"],
      loadError: "No se pudo cargar la validación de campo.",
      saveError: "No se pudo guardar la validación de campo.",
      saved: "La validación de campo se guardó.",
      agronomistValidation: "Validación del agrónomo",
      loading: "Cargando validación de campo…",
      title: "VALIDACIÓN DEL AGRÓNOMO",
      description: "Compare el resultado de AEGRIS con el estado real del cultivo observado durante una inspección de campo.",
      verified: "✓ VERIFICADO",
      pending: "VALIDACIÓN PENDIENTE",
      readOnly: "Acceso de solo lectura a la validación de campo.",
      confirmationQuestion: "¿Se confirmó el estado indicado por AEGRIS?",
      actualCause: "Causa real",
      notSelected: "No seleccionado",
      inspectionDate: "Fecha de inspección de campo",
      actualSeverity: "Gravedad real del hallazgo",
      severityScale: "0 = sin problema · 5 = estado muy grave",
      severity: "GRAVEDAD",
      clearSeverity: "Borrar selección de gravedad",
      note: "Nota del agrónomo",
      notePlaceholder: "P. ej., signos de estrés en la zona sur de la parcela, plantas dañadas localmente, sin signos de enfermedad…",
      analysis: "Análisis",
      lastModified: "última modificación",
      saving: "Guardando…",
      saveChanges: "Guardar cambios de validación",
      saveValidation: "Guardar validación de campo",
    },
    it: {
      resultLabels: {
        confirmed: "Confermato",
        partially_confirmed: "Parzialmente confermato",
        not_confirmed: "Non confermato",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Siccità / stress idrico",
        nutrition: "Nutrizione",
        disease: "Malattia",
        pest: "Parassita",
        crop_damage: "Danno alla coltura",
        weed: "Infestante",
        other: "Altra causa",
        no_problem: "Nessun problema",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Nessun problema", "Molto bassa", "Bassa", "Media", "Alta", "Molto alta"],
      loadError: "Impossibile caricare la validazione in campo.",
      saveError: "Impossibile salvare la validazione in campo.",
      saved: "La validazione in campo è stata salvata.",
      agronomistValidation: "Validazione dell’agronomo",
      loading: "Caricamento validazione in campo…",
      title: "VALIDAZIONE DELL’AGRONOMO",
      description: "Confronta il risultato AEGRIS con lo stato reale della coltura osservato durante un sopralluogo in campo.",
      verified: "✓ VERIFICATO",
      pending: "VALIDAZIONE IN ATTESA",
      readOnly: "Accesso in sola lettura alla validazione in campo.",
      confirmationQuestion: "La condizione indicata da AEGRIS è stata confermata?",
      actualCause: "Causa effettiva",
      notSelected: "Non selezionato",
      inspectionDate: "Data del sopralluogo",
      actualSeverity: "Gravità effettiva del rilievo",
      severityScale: "0 = nessun problema · 5 = condizione molto grave",
      severity: "GRAVITÀ",
      clearSeverity: "Cancella selezione gravità",
      note: "Nota dell’agronomo",
      notePlaceholder: "Es. segni di stress nella parte meridionale del campo, piante localmente danneggiate, nessun segno di malattia…",
      analysis: "Analisi",
      lastModified: "ultima modifica",
      saving: "Salvataggio…",
      saveChanges: "Salva modifiche alla validazione",
      saveValidation: "Salva validazione in campo",
    },
    nl: {
      resultLabels: {
        confirmed: "Bevestigd",
        partially_confirmed: "Gedeeltelijk bevestigd",
        not_confirmed: "Niet bevestigd",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Droogte / waterstress",
        nutrition: "Voeding",
        disease: "Ziekte",
        pest: "Plaag",
        crop_damage: "Gewasschade",
        weed: "Onkruid",
        other: "Andere oorzaak",
        no_problem: "Geen probleem",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Geen probleem", "Zeer laag", "Laag", "Gemiddeld", "Hoog", "Zeer hoog"],
      loadError: "Veldvalidatie kon niet worden geladen.",
      saveError: "Veldvalidatie kon niet worden opgeslagen.",
      saved: "Veldvalidatie is opgeslagen.",
      agronomistValidation: "Validatie door agronoom",
      loading: "Veldvalidatie laden…",
      title: "VALIDATIE DOOR AGRONOOM",
      description: "Vergelijk de AEGRIS-uitvoer met de werkelijke gewastoestand tijdens een veldinspectie.",
      verified: "✓ GEVALIDEERD",
      pending: "VALIDATIE IN AFWACHTING",
      readOnly: "Alleen-lezen toegang tot veldvalidatie.",
      confirmationQuestion: "Is de door AEGRIS aangegeven toestand bevestigd?",
      actualCause: "Werkelijke oorzaak",
      notSelected: "Niet geselecteerd",
      inspectionDate: "Datum veldinspectie",
      actualSeverity: "Werkelijke ernst van de bevinding",
      severityScale: "0 = geen probleem · 5 = zeer ernstige toestand",
      severity: "ERNST",
      clearSeverity: "Ernstselectie wissen",
      note: "Notitie agronoom",
      notePlaceholder: "Bijv. stresssymptomen in het zuidelijke deel van het perceel, plaatselijk beschadigde planten, geen ziekteverschijnselen…",
      analysis: "Analyse",
      lastModified: "laatst gewijzigd",
      saving: "Opslaan…",
      saveChanges: "Validatiewijzigingen opslaan",
      saveValidation: "Veldvalidatie opslaan",
    },
    pt: {
      resultLabels: {
        confirmed: "Confirmado",
        partially_confirmed: "Parcialmente confirmado",
        not_confirmed: "Não confirmado",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Seca / stress hídrico",
        nutrition: "Nutrição",
        disease: "Doença",
        pest: "Praga",
        crop_damage: "Danos na cultura",
        weed: "Erva daninha",
        other: "Outra causa",
        no_problem: "Sem problema",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Sem problema", "Muito baixa", "Baixa", "Média", "Alta", "Muito alta"],
      loadError: "Falha ao carregar a validação de campo.",
      saveError: "Falha ao guardar a validação de campo.",
      saved: "A validação de campo foi guardada.",
      agronomistValidation: "Validação pelo agrónomo",
      loading: "A carregar validação de campo…",
      title: "VALIDAÇÃO PELO AGRÓNOMO",
      description: "Compare o resultado do AEGRIS com o estado real da cultura observado durante uma inspeção de campo.",
      verified: "✓ VALIDADO",
      pending: "VALIDAÇÃO PENDENTE",
      readOnly: "Acesso apenas de leitura à validação de campo.",
      confirmationQuestion: "A condição indicada pelo AEGRIS foi confirmada?",
      actualCause: "Causa real",
      notSelected: "Não selecionado",
      inspectionDate: "Data da inspeção de campo",
      actualSeverity: "Gravidade real da observação",
      severityScale: "0 = sem problema · 5 = condição muito grave",
      severity: "GRAVIDADE",
      clearSeverity: "Limpar seleção de gravidade",
      note: "Nota do agrónomo",
      notePlaceholder: "Ex.: sinais de stress na parte sul da parcela, plantas localmente danificadas, sem sinais de doença…",
      analysis: "Análise",
      lastModified: "última alteração",
      saving: "A guardar…",
      saveChanges: "Guardar alterações da validação",
      saveValidation: "Guardar validação de campo",
    },
    ro: {
      resultLabels: {
        confirmed: "Confirmat",
        partially_confirmed: "Confirmat parțial",
        not_confirmed: "Neconfirmat",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Secetă / stres hidric",
        nutrition: "Nutriție",
        disease: "Boală",
        pest: "Dăunător",
        crop_damage: "Daune ale culturii",
        weed: "Buruiană",
        other: "Altă cauză",
        no_problem: "Nicio problemă",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Nicio problemă", "Foarte scăzută", "Scăzută", "Medie", "Ridicată", "Foarte ridicată"],
      loadError: "Validarea din teren nu a putut fi încărcată.",
      saveError: "Validarea din teren nu a putut fi salvată.",
      saved: "Validarea din teren a fost salvată.",
      agronomistValidation: "Validarea agronomului",
      loading: "Se încarcă validarea din teren…",
      title: "VALIDAREA AGRONOMULUI",
      description: "Comparați rezultatul AEGRIS cu starea reală a culturii observată în timpul inspecției în teren.",
      verified: "✓ VALIDAT",
      pending: "VALIDARE ÎN AȘTEPTARE",
      readOnly: "Acces doar pentru citire la validarea din teren.",
      confirmationQuestion: "A fost confirmată starea indicată de AEGRIS?",
      actualCause: "Cauza reală",
      notSelected: "Neselectat",
      inspectionDate: "Data inspecției în teren",
      actualSeverity: "Severitatea reală a constatării",
      severityScale: "0 = nicio problemă · 5 = stare foarte gravă",
      severity: "SEVERITATE",
      clearSeverity: "Șterge selecția severității",
      note: "Nota agronomului",
      notePlaceholder: "Ex.: semne de stres în partea sudică a parcelei, plante deteriorate local, fără semne de boală…",
      analysis: "Analiză",
      lastModified: "ultima modificare",
      saving: "Se salvează…",
      saveChanges: "Salvează modificările validării",
      saveValidation: "Salvează validarea din teren",
    },
    hu: {
      resultLabels: {
        confirmed: "Megerősítve",
        partially_confirmed: "Részben megerősítve",
        not_confirmed: "Nincs megerősítve",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Aszály / vízstressz",
        nutrition: "Tápanyagellátás",
        disease: "Betegség",
        pest: "Kártevő",
        crop_damage: "Állománykárosodás",
        weed: "Gyom",
        other: "Egyéb ok",
        no_problem: "Nincs probléma",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Nincs probléma", "Nagyon alacsony", "Alacsony", "Közepes", "Magas", "Nagyon magas"],
      loadError: "A terepi ellenőrzés betöltése sikertelen.",
      saveError: "A terepi ellenőrzés mentése sikertelen.",
      saved: "A terepi ellenőrzés mentve.",
      agronomistValidation: "Agronómusi ellenőrzés",
      loading: "Terepi ellenőrzés betöltése…",
      title: "AGRONÓMUSI ELLENŐRZÉS",
      description: "Hasonlítsa össze az AEGRIS eredményét a helyszíni szemle során megfigyelt tényleges növényállapottal.",
      verified: "✓ ELLENŐRIZVE",
      pending: "ELLENŐRZÉSRE VÁR",
      readOnly: "Csak olvasási hozzáférés a terepi ellenőrzéshez.",
      confirmationQuestion: "Megerősítette a terepi szemle az AEGRIS által jelzett állapotot?",
      actualCause: "Tényleges ok",
      notSelected: "Nincs kiválasztva",
      inspectionDate: "Terepi szemle dátuma",
      actualSeverity: "A megfigyelés tényleges súlyossága",
      severityScale: "0 = nincs probléma · 5 = nagyon súlyos állapot",
      severity: "SÚLYOSSÁG",
      clearSeverity: "Súlyosság törlése",
      note: "Agronómusi megjegyzés",
      notePlaceholder: "Pl. stressztünetek a tábla déli részén, helyenként sérült növények, betegség jele nélkül…",
      analysis: "Elemzés",
      lastModified: "utolsó módosítás",
      saving: "Mentés…",
      saveChanges: "Ellenőrzés módosításainak mentése",
      saveValidation: "Terepi ellenőrzés mentése",
    },
    uk: {
      resultLabels: {
        confirmed: "Підтверджено",
        partially_confirmed: "Частково підтверджено",
        not_confirmed: "Не підтверджено",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Посуха / водний стрес",
        nutrition: "Живлення",
        disease: "Хвороба",
        pest: "Шкідник",
        crop_damage: "Пошкодження посіву",
        weed: "Бур’ян",
        other: "Інша причина",
        no_problem: "Без проблем",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Без проблем", "Дуже низька", "Низька", "Середня", "Висока", "Дуже висока"],
      loadError: "Не вдалося завантажити польову перевірку.",
      saveError: "Не вдалося зберегти польову перевірку.",
      saved: "Польову перевірку збережено.",
      agronomistValidation: "Перевірка агрономом",
      loading: "Завантаження польової перевірки…",
      title: "ПЕРЕВІРКА АГРОНОМОМ",
      description: "Порівняйте результат AEGRIS із фактичним станом посіву під час польового обстеження.",
      verified: "✓ ПЕРЕВІРЕНО",
      pending: "ОЧІКУЄ ПЕРЕВІРКИ",
      readOnly: "Доступ до польової перевірки лише для читання.",
      confirmationQuestion: "Чи підтвердився стан, зазначений AEGRIS?",
      actualCause: "Фактична причина",
      notSelected: "Не вибрано",
      inspectionDate: "Дата польового обстеження",
      actualSeverity: "Фактична тяжкість спостереження",
      severityScale: "0 = без проблем · 5 = дуже тяжкий стан",
      severity: "ТЯЖКІСТЬ",
      clearSeverity: "Очистити вибір тяжкості",
      note: "Примітка агронома",
      notePlaceholder: "Напр., ознаки стресу в південній частині поля, локально пошкоджені рослини, без ознак хвороби…",
      analysis: "Аналіз",
      lastModified: "остання зміна",
      saving: "Збереження…",
      saveChanges: "Зберегти зміни перевірки",
      saveValidation: "Зберегти польову перевірку",
    },
    bg: {
      resultLabels: {
        confirmed: "Потвърдено",
        partially_confirmed: "Частично потвърдено",
        not_confirmed: "Непотвърдено",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Суша / воден стрес",
        nutrition: "Хранене",
        disease: "Болест",
        pest: "Вредител",
        crop_damage: "Повреда на посева",
        weed: "Плевел",
        other: "Друга причина",
        no_problem: "Без проблем",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Без проблем", "Много ниска", "Ниска", "Средна", "Висока", "Много висока"],
      loadError: "Неуспешно зареждане на полевата проверка.",
      saveError: "Неуспешно запазване на полевата проверка.",
      saved: "Полевата проверка беше запазена.",
      agronomistValidation: "Проверка от агроном",
      loading: "Зареждане на полевата проверка…",
      title: "ПРОВЕРКА ОТ АГРОНОМ",
      description: "Сравнете резултата от AEGRIS с реалното състояние на посева при полева проверка.",
      verified: "✓ ПРОВЕРЕНО",
      pending: "ОЧАКВА ПРОВЕРКА",
      readOnly: "Достъп само за четене до полевата проверка.",
      confirmationQuestion: "Потвърди ли се състоянието, посочено от AEGRIS?",
      actualCause: "Реална причина",
      notSelected: "Не е избрано",
      inspectionDate: "Дата на полевата проверка",
      actualSeverity: "Реална тежест на наблюдението",
      severityScale: "0 = без проблем · 5 = много тежко състояние",
      severity: "ТЕЖЕСТ",
      clearSeverity: "Изчисти избора на тежест",
      note: "Бележка на агронома",
      notePlaceholder: "Напр. признаци на стрес в южната част на полето, локално повредени растения, без признаци на болест…",
      analysis: "Анализ",
      lastModified: "последна промяна",
      saving: "Запазване…",
      saveChanges: "Запази промените",
      saveValidation: "Запази полевата проверка",
    },
    hr: {
      resultLabels: {
        confirmed: "Potvrđeno",
        partially_confirmed: "Djelomično potvrđeno",
        not_confirmed: "Nije potvrđeno",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Suša / vodni stres",
        nutrition: "Ishrana",
        disease: "Bolest",
        pest: "Štetnik",
        crop_damage: "Oštećenje usjeva",
        weed: "Korov",
        other: "Drugi uzrok",
        no_problem: "Bez problema",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Bez problema", "Vrlo niska", "Niska", "Srednja", "Visoka", "Vrlo visoka"],
      loadError: "Nije moguće učitati terensku provjeru.",
      saveError: "Nije moguće spremiti terensku provjeru.",
      saved: "Terenska provjera je spremljena.",
      agronomistValidation: "Provjera agronoma",
      loading: "Učitavanje terenske provjere…",
      title: "PROVJERA AGRONOMA",
      description: "Usporedite rezultat AEGRIS-a sa stvarnim stanjem usjeva utvrđenim tijekom terenskog pregleda.",
      verified: "✓ PROVJERENO",
      pending: "ČEKA PROVJERU",
      readOnly: "Pristup terenskoj provjeri samo za čitanje.",
      confirmationQuestion: "Je li stanje koje je naznačio AEGRIS potvrđeno?",
      actualCause: "Stvarni uzrok",
      notSelected: "Nije odabrano",
      inspectionDate: "Datum terenskog pregleda",
      actualSeverity: "Stvarna ozbiljnost nalaza",
      severityScale: "0 = bez problema · 5 = vrlo ozbiljno stanje",
      severity: "OZBILJNOST",
      clearSeverity: "Poništi odabir ozbiljnosti",
      note: "Bilješka agronoma",
      notePlaceholder: "Npr. znakovi stresa u južnom dijelu parcele, lokalno oštećene biljke, bez znakova bolesti…",
      analysis: "Analiza",
      lastModified: "zadnja izmjena",
      saving: "Spremanje…",
      saveChanges: "Spremi promjene provjere",
      saveValidation: "Spremi terensku provjeru",
    },
    sl: {
      resultLabels: {
        confirmed: "Potrjeno",
        partially_confirmed: "Delno potrjeno",
        not_confirmed: "Ni potrjeno",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Suša / vodni stres",
        nutrition: "Prehrana",
        disease: "Bolezen",
        pest: "Škodljivec",
        crop_damage: "Poškodba posevka",
        weed: "Plevel",
        other: "Drug vzrok",
        no_problem: "Brez težav",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Brez težav", "Zelo nizka", "Nizka", "Srednja", "Visoka", "Zelo visoka"],
      loadError: "Terenskega preverjanja ni bilo mogoče naložiti.",
      saveError: "Terenskega preverjanja ni bilo mogoče shraniti.",
      saved: "Terensko preverjanje je bilo shranjeno.",
      agronomistValidation: "Preverjanje agronoma",
      loading: "Nalaganje terenskega preverjanja…",
      title: "PREVERJANJE AGRONOMA",
      description: "Primerjajte rezultat AEGRIS z dejanskim stanjem posevka, opaženim med terenskim pregledom.",
      verified: "✓ PREVERJENO",
      pending: "ČAKA NA PREVERJANJE",
      readOnly: "Dostop do terenskega preverjanja je samo za branje.",
      confirmationQuestion: "Ali je bilo stanje, ki ga je navedel AEGRIS, potrjeno?",
      actualCause: "Dejanski vzrok",
      notSelected: "Ni izbrano",
      inspectionDate: "Datum terenskega pregleda",
      actualSeverity: "Dejanska resnost ugotovitve",
      severityScale: "0 = brez težav · 5 = zelo resno stanje",
      severity: "RESNOST",
      clearSeverity: "Počisti izbiro resnosti",
      note: "Opomba agronoma",
      notePlaceholder: "Npr. znaki stresa v južnem delu parcele, lokalno poškodovane rastline, brez znakov bolezni…",
      analysis: "Analiza",
      lastModified: "zadnja sprememba",
      saving: "Shranjevanje…",
      saveChanges: "Shrani spremembe preverjanja",
      saveValidation: "Shrani terensko preverjanje",
    },
    lt: {
      resultLabels: {
        confirmed: "Patvirtinta",
        partially_confirmed: "Iš dalies patvirtinta",
        not_confirmed: "Nepatvirtinta",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Sausra / vandens stresas",
        nutrition: "Mityba",
        disease: "Liga",
        pest: "Kenkėjas",
        crop_damage: "Pasėlio pažeidimas",
        weed: "Piktžolė",
        other: "Kita priežastis",
        no_problem: "Problemos nėra",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Problemos nėra", "Labai mažas", "Mažas", "Vidutinis", "Didelis", "Labai didelis"],
      loadError: "Nepavyko įkelti lauko patikros.",
      saveError: "Nepavyko išsaugoti lauko patikros.",
      saved: "Lauko patikra išsaugota.",
      agronomistValidation: "Agronomo patikra",
      loading: "Įkeliama lauko patikra…",
      title: "AGRONOMO PATIKRA",
      description: "Palyginkite AEGRIS rezultatą su faktine pasėlio būkle, nustatyta lauko apžiūros metu.",
      verified: "✓ PATIKRINTA",
      pending: "LAUKIA PATIKROS",
      readOnly: "Lauko patikra pasiekiama tik skaitymui.",
      confirmationQuestion: "Ar AEGRIS nurodyta būklė buvo patvirtinta?",
      actualCause: "Faktinė priežastis",
      notSelected: "Nepasirinkta",
      inspectionDate: "Lauko apžiūros data",
      actualSeverity: "Faktinis radinio sunkumas",
      severityScale: "0 = problemos nėra · 5 = labai sunki būklė",
      severity: "SUNKUMAS",
      clearSeverity: "Išvalyti sunkumo pasirinkimą",
      note: "Agronomo pastaba",
      notePlaceholder: "Pvz., streso požymiai pietinėje lauko dalyje, vietomis pažeisti augalai, ligos požymių nėra…",
      analysis: "Analizė",
      lastModified: "paskutinis pakeitimas",
      saving: "Išsaugoma…",
      saveChanges: "Išsaugoti patikros pakeitimus",
      saveValidation: "Išsaugoti lauko patikrą",
    },
    lv: {
      resultLabels: {
        confirmed: "Apstiprināts",
        partially_confirmed: "Daļēji apstiprināts",
        not_confirmed: "Nav apstiprināts",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Sausums / ūdens stress",
        nutrition: "Barības vielas",
        disease: "Slimība",
        pest: "Kaitēklis",
        crop_damage: "Kultūrauga bojājums",
        weed: "Nezāle",
        other: "Cits iemesls",
        no_problem: "Nav problēmu",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Nav problēmu", "Ļoti zema", "Zema", "Vidēja", "Augsta", "Ļoti augsta"],
      loadError: "Neizdevās ielādēt lauka pārbaudi.",
      saveError: "Neizdevās saglabāt lauka pārbaudi.",
      saved: "Lauka pārbaude saglabāta.",
      agronomistValidation: "Agronoma pārbaude",
      loading: "Notiek lauka pārbaudes ielāde…",
      title: "AGRONOMA PĀRBAUDE",
      description: "Salīdziniet AEGRIS rezultātu ar faktisko kultūrauga stāvokli, kas novērots lauka apskates laikā.",
      verified: "✓ PĀRBAUDĪTS",
      pending: "GAIDA PĀRBAUDI",
      readOnly: "Lauka pārbaudei ir tikai lasīšanas piekļuve.",
      confirmationQuestion: "Vai AEGRIS norādītais stāvoklis tika apstiprināts?",
      actualCause: "Faktiskais iemesls",
      notSelected: "Nav izvēlēts",
      inspectionDate: "Lauka apskates datums",
      actualSeverity: "Faktiskais novērojuma smagums",
      severityScale: "0 = nav problēmu · 5 = ļoti smags stāvoklis",
      severity: "SMAGUMS",
      clearSeverity: "Notīrīt smaguma izvēli",
      note: "Agronoma piezīme",
      notePlaceholder: "Piem., stresa pazīmes lauka dienvidu daļā, lokāli bojāti augi, nav slimības pazīmju…",
      analysis: "Analīze",
      lastModified: "pēdējās izmaiņas",
      saving: "Saglabā…",
      saveChanges: "Saglabāt pārbaudes izmaiņas",
      saveValidation: "Saglabāt lauka pārbaudi",
    },
    et: {
      resultLabels: {
        confirmed: "Kinnitatud",
        partially_confirmed: "Osaliselt kinnitatud",
        not_confirmed: "Kinnitamata",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Põud / veestress",
        nutrition: "Toitumine",
        disease: "Haigus",
        pest: "Kahjur",
        crop_damage: "Kultuuri kahjustus",
        weed: "Umbrohi",
        other: "Muu põhjus",
        no_problem: "Probleemi pole",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Probleemi pole", "Väga madal", "Madal", "Keskmine", "Kõrge", "Väga kõrge"],
      loadError: "Põllukontrolli laadimine ebaõnnestus.",
      saveError: "Põllukontrolli salvestamine ebaõnnestus.",
      saved: "Põllukontroll salvestati.",
      agronomistValidation: "Agronoomi kinnitus",
      loading: "Põllukontrolli laadimine…",
      title: "AGRONOOMI KINNITUS",
      description: "Võrrelge AEGRIS-e väljundit põllukontrolli käigus täheldatud kultuuri tegeliku seisundiga.",
      verified: "✓ KINNITATUD",
      pending: "OOTAB KINNITAMIST",
      readOnly: "Põllukontrollile on ainult lugemisõigus.",
      confirmationQuestion: "Kas AEGRIS-e näidatud seisund leidis kinnitust?",
      actualCause: "Tegelik põhjus",
      notSelected: "Valimata",
      inspectionDate: "Põllukontrolli kuupäev",
      actualSeverity: "Leiu tegelik raskusaste",
      severityScale: "0 = probleemi pole · 5 = väga raske seisund",
      severity: "RASKUSASTE",
      clearSeverity: "Tühjenda raskusastme valik",
      note: "Agronoomi märkus",
      notePlaceholder: "Nt stressi tunnused põllu lõunaosas, kohati kahjustatud taimed, haiguse tunnused puuduvad…",
      analysis: "Analüüs",
      lastModified: "viimati muudetud",
      saving: "Salvestamine…",
      saveChanges: "Salvesta kinnituse muudatused",
      saveValidation: "Salvesta põllukontroll",
    },
    el: {
      resultLabels: {
        confirmed: "Επιβεβαιώθηκε",
        partially_confirmed: "Επιβεβαιώθηκε εν μέρει",
        not_confirmed: "Δεν επιβεβαιώθηκε",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Ξηρασία / υδατικό στρες",
        nutrition: "Θρέψη",
        disease: "Ασθένεια",
        pest: "Εχθρός",
        crop_damage: "Ζημιά καλλιέργειας",
        weed: "Ζιζάνιο",
        other: "Άλλη αιτία",
        no_problem: "Κανένα πρόβλημα",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Κανένα πρόβλημα", "Πολύ χαμηλή", "Χαμηλή", "Μέτρια", "Υψηλή", "Πολύ υψηλή"],
      loadError: "Αποτυχία φόρτωσης της επιτόπιας επαλήθευσης.",
      saveError: "Αποτυχία αποθήκευσης της επιτόπιας επαλήθευσης.",
      saved: "Η επιτόπια επαλήθευση αποθηκεύτηκε.",
      agronomistValidation: "Επαλήθευση γεωπόνου",
      loading: "Φόρτωση επιτόπιας επαλήθευσης…",
      title: "ΕΠΑΛΗΘΕΥΣΗ ΓΕΩΠΟΝΟΥ",
      description: "Συγκρίνετε το αποτέλεσμα του AEGRIS με την πραγματική κατάσταση της καλλιέργειας κατά την επιτόπια επιθεώρηση.",
      verified: "✓ ΕΠΑΛΗΘΕΥΤΗΚΕ",
      pending: "ΑΝΑΜΕΝΕΙ ΕΠΑΛΗΘΕΥΣΗ",
      readOnly: "Πρόσβαση μόνο για ανάγνωση στην επιτόπια επαλήθευση.",
      confirmationQuestion: "Επιβεβαιώθηκε η κατάσταση που υπέδειξε το AEGRIS;",
      actualCause: "Πραγματική αιτία",
      notSelected: "Δεν επιλέχθηκε",
      inspectionDate: "Ημερομηνία επιτόπιας επιθεώρησης",
      actualSeverity: "Πραγματική σοβαρότητα ευρήματος",
      severityScale: "0 = κανένα πρόβλημα · 5 = πολύ σοβαρή κατάσταση",
      severity: "ΣΟΒΑΡΟΤΗΤΑ",
      clearSeverity: "Καθαρισμός επιλογής σοβαρότητας",
      note: "Σημείωση γεωπόνου",
      notePlaceholder: "Π.χ. ενδείξεις στρες στο νότιο τμήμα του αγροτεμαχίου, τοπικά κατεστραμμένα φυτά, χωρίς ενδείξεις ασθένειας…",
      analysis: "Ανάλυση",
      lastModified: "τελευταία τροποποίηση",
      saving: "Αποθήκευση…",
      saveChanges: "Αποθήκευση αλλαγών επαλήθευσης",
      saveValidation: "Αποθήκευση επιτόπιας επαλήθευσης",
    },
    sv: {
      resultLabels: {
        confirmed: "Bekräftad",
        partially_confirmed: "Delvis bekräftad",
        not_confirmed: "Inte bekräftad",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Torka / vattenstress",
        nutrition: "Näring",
        disease: "Sjukdom",
        pest: "Skadegörare",
        crop_damage: "Grödskada",
        weed: "Ogräs",
        other: "Annan orsak",
        no_problem: "Inget problem",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Inget problem", "Mycket låg", "Låg", "Medel", "Hög", "Mycket hög"],
      loadError: "Det gick inte att läsa in fältvalideringen.",
      saveError: "Det gick inte att spara fältvalideringen.",
      saved: "Fältvalideringen sparades.",
      agronomistValidation: "Agronomvalidering",
      loading: "Läser in fältvalidering…",
      title: "AGRONOMVALIDERING",
      description: "Jämför AEGRIS-resultatet med grödans faktiska tillstånd som observerats vid en fältinspektion.",
      verified: "✓ VALIDERAD",
      pending: "VÄNTAR PÅ VALIDERING",
      readOnly: "Endast läsbehörighet till fältvalideringen.",
      confirmationQuestion: "Bekräftades tillståndet som AEGRIS angav?",
      actualCause: "Faktisk orsak",
      notSelected: "Inte vald",
      inspectionDate: "Datum för fältinspektion",
      actualSeverity: "Faktisk allvarlighetsgrad",
      severityScale: "0 = inget problem · 5 = mycket allvarligt tillstånd",
      severity: "ALLVARLIGHET",
      clearSeverity: "Rensa val av allvarlighetsgrad",
      note: "Agronomens anteckning",
      notePlaceholder: "T.ex. tecken på stress i fältets södra del, lokalt skadade plantor, inga tecken på sjukdom…",
      analysis: "Analys",
      lastModified: "senast ändrad",
      saving: "Sparar…",
      saveChanges: "Spara valideringsändringar",
      saveValidation: "Spara fältvalidering",
    },
    da: {
      resultLabels: {
        confirmed: "Bekræftet",
        partially_confirmed: "Delvist bekræftet",
        not_confirmed: "Ikke bekræftet",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Tørke / vandstress",
        nutrition: "Ernæring",
        disease: "Sygdom",
        pest: "Skadedyr",
        crop_damage: "Afgrødeskade",
        weed: "Ukrudt",
        other: "Anden årsag",
        no_problem: "Intet problem",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Intet problem", "Meget lav", "Lav", "Middel", "Høj", "Meget høj"],
      loadError: "Feltvalideringen kunne ikke indlæses.",
      saveError: "Feltvalideringen kunne ikke gemmes.",
      saved: "Feltvalideringen blev gemt.",
      agronomistValidation: "Agronomvalidering",
      loading: "Indlæser feltvalidering…",
      title: "AGRONOMVALIDERING",
      description: "Sammenlign AEGRIS-resultatet med afgrødens faktiske tilstand observeret under en markinspektion.",
      verified: "✓ VALIDERET",
      pending: "AFVENTER VALIDERING",
      readOnly: "Kun læseadgang til feltvalideringen.",
      confirmationQuestion: "Blev tilstanden angivet af AEGRIS bekræftet?",
      actualCause: "Faktisk årsag",
      notSelected: "Ikke valgt",
      inspectionDate: "Dato for markinspektion",
      actualSeverity: "Faktisk alvorlighedsgrad",
      severityScale: "0 = intet problem · 5 = meget alvorlig tilstand",
      severity: "ALVORLIGHED",
      clearSeverity: "Ryd valg af alvorlighedsgrad",
      note: "Agronomens note",
      notePlaceholder: "F.eks. tegn på stress i markens sydlige del, lokalt beskadigede planter, ingen tegn på sygdom…",
      analysis: "Analyse",
      lastModified: "senest ændret",
      saving: "Gemmer…",
      saveChanges: "Gem valideringsændringer",
      saveValidation: "Gem feltvalidering",
    },
    no: {
      resultLabels: {
        confirmed: "Bekreftet",
        partially_confirmed: "Delvis bekreftet",
        not_confirmed: "Ikke bekreftet",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Tørke / vannstress",
        nutrition: "Ernæring",
        disease: "Sykdom",
        pest: "Skadedyr",
        crop_damage: "Avlingsskade",
        weed: "Ugress",
        other: "Annen årsak",
        no_problem: "Ingen problem",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Ingen problem", "Svært lav", "Lav", "Middels", "Høy", "Svært høy"],
      loadError: "Kunne ikke laste feltvalideringen.",
      saveError: "Kunne ikke lagre feltvalideringen.",
      saved: "Feltvalideringen ble lagret.",
      agronomistValidation: "Agronomvalidering",
      loading: "Laster feltvalidering…",
      title: "AGRONOMVALIDERING",
      description: "Sammenlign AEGRIS-resultatet med avlingens faktiske tilstand observert under en feltinspeksjon.",
      verified: "✓ VALIDERT",
      pending: "VENTER PÅ VALIDERING",
      readOnly: "Kun lesetilgang til feltvalideringen.",
      confirmationQuestion: "Ble tilstanden angitt av AEGRIS bekreftet?",
      actualCause: "Faktisk årsak",
      notSelected: "Ikke valgt",
      inspectionDate: "Dato for feltinspeksjon",
      actualSeverity: "Faktisk alvorlighetsgrad",
      severityScale: "0 = ingen problem · 5 = svært alvorlig tilstand",
      severity: "ALVORLIGHET",
      clearSeverity: "Fjern valg av alvorlighetsgrad",
      note: "Agronomens notat",
      notePlaceholder: "F.eks. tegn på stress i den sørlige delen av feltet, lokalt skadde planter, ingen tegn på sykdom…",
      analysis: "Analyse",
      lastModified: "sist endret",
      saving: "Lagrer…",
      saveChanges: "Lagre valideringsendringer",
      saveValidation: "Lagre feltvalidering",
    },
    fi: {
      resultLabels: {
        confirmed: "Vahvistettu",
        partially_confirmed: "Osittain vahvistettu",
        not_confirmed: "Ei vahvistettu",
      } as Record<ValidationResult, string>,
      causeLabels: {
        drought_water_stress: "Kuivuus / vesistressi",
        nutrition: "Ravitsemus",
        disease: "Tauti",
        pest: "Tuholainen",
        crop_damage: "Kasvustovaurio",
        weed: "Rikkakasvi",
        other: "Muu syy",
        no_problem: "Ei ongelmaa",
      } as Record<ActualCause, string>,
      severityDescriptions: ["Ei ongelmaa", "Erittäin matala", "Matala", "Keskitaso", "Korkea", "Erittäin korkea"],
      loadError: "Peltovarmennuksen lataaminen epäonnistui.",
      saveError: "Peltovarmennuksen tallentaminen epäonnistui.",
      saved: "Peltovarmennus tallennettiin.",
      agronomistValidation: "Agronomin varmennus",
      loading: "Ladataan peltovarmennusta…",
      title: "AGRONOMIN VARMENNUS",
      description: "Vertaa AEGRIS-tulosta maastotarkastuksessa havaittuun kasvuston todelliseen tilaan.",
      verified: "✓ VARMENNETTU",
      pending: "ODOTTAA VARMENNUSTA",
      readOnly: "Peltovarmennukseen on vain lukuoikeus.",
      confirmationQuestion: "Vahvistuiko AEGRIS-järjestelmän osoittama tila?",
      actualCause: "Todellinen syy",
      notSelected: "Ei valittu",
      inspectionDate: "Maastotarkastuksen päivämäärä",
      actualSeverity: "Havainnon todellinen vakavuus",
      severityScale: "0 = ei ongelmaa · 5 = erittäin vakava tila",
      severity: "VAKAVUUS",
      clearSeverity: "Tyhjennä vakavuusvalinta",
      note: "Agronomin huomautus",
      notePlaceholder: "Esim. stressin merkkejä lohkon eteläosassa, paikallisesti vaurioituneita kasveja, ei taudin merkkejä…",
      analysis: "Analyysi",
      lastModified: "viimeksi muokattu",
      saving: "Tallennetaan…",
      saveChanges: "Tallenna varmennuksen muutokset",
      saveValidation: "Tallenna peltovarmennus",
    }
  };

  return copies[language as keyof typeof copies] ?? copies.en;
}

function getTodayDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 10);
}

export default function FieldValidationForm({
  projectId,
  analysisId,
  recommendationId = null,
  alertId = null,
  readOnly = false,
}: Props) {
  const { language } = useLanguage();
  const copy = getFieldValidationCopy(language);
  const locales: Record<string, string> = {
    cs: "cs-CZ", en: "en-GB", sk: "sk-SK", de: "de-DE",
    pl: "pl-PL", fr: "fr-FR", es: "es-ES", it: "it-IT",
    nl: "nl-NL", pt: "pt-PT", ro: "ro-RO", hu: "hu-HU",
    uk: "uk-UA", bg: "bg-BG", hr: "hr-HR", sl: "sl-SI",
    lt: "lt-LT", lv: "lv-LV", et: "et-EE", el: "el-GR",
    sv: "sv-SE", da: "da-DK", no: "nb-NO", fi: "fi-FI",
  };
  const locale = locales[language] ?? "en-GB";

  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);

  const [actualCause, setActualCause] =
    useState<ActualCause | "">("");

  const [observedSeverity, setObservedSeverity] =
    useState<number | null>(null);

  const [observedAt, setObservedAt] =
    useState(getTodayDate());

  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [savedValidation, setSavedValidation] =
    useState<FieldValidation | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadValidation() {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        const response = await fetch(
          `/api/field-validations?analysisId=${analysisId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            payload?.error ||
              copy.loadError
          );
        }

        if (cancelled) {
          return;
        }

        const validation =
          (payload?.validation as FieldValidation | null) ?? null;

        setSavedValidation(validation);

        if (validation) {
          setValidationResult(validation.validation_result);
          setActualCause(validation.actual_cause ?? "");
          setObservedSeverity(
            typeof validation.observed_severity === "number"
              ? validation.observed_severity
              : null
          );
          setObservedAt(validation.observed_at);
          setNote(validation.note ?? "");
        } else {
          setValidationResult(null);
          setActualCause("");
          setObservedSeverity(null);
          setObservedAt(getTodayDate());
          setNote("");
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "FIELD VALIDATION UI LOAD ERROR:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : copy.loadError
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadValidation();

    return () => {
      cancelled = true;
    };
  }, [analysisId]);

  async function saveValidation() {
    if (
      readOnly ||
      saving ||
      !validationResult ||
      !observedAt
    ) {
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        "/api/field-validations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            projectId,
            analysisId,
            recommendationId,
            alertId,
            validationResult,
            actualCause: actualCause || null,
            observedSeverity,
            observedAt,
            note,
          }),
        }
      );

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          payload?.error ||
            copy.saveError
        );
      }

      const validation =
        payload?.validation as FieldValidation;

      setSavedValidation(validation);
      setObservedSeverity(
        typeof validation.observed_severity === "number"
          ? validation.observed_severity
          : null
      );

      setSuccessMessage(copy.saved);
    } catch (error) {
      console.error(
        "FIELD VALIDATION UI SAVE ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : copy.saveError
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="mt-3 rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
          {copy.agronomistValidation}
        </div>

        <div className="mt-3 rounded-lg border border-white/[0.07] bg-[#071017] p-4 text-[10px] text-slate-500">
          {copy.loading}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-3 rounded-[22px] border border-white/[0.07] bg-[#0a1016] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
            Ground Truth
          </div>

          <h2 className="mt-1 text-sm font-black">
            {copy.title}
          </h2>

          <p className="mt-1 max-w-2xl text-[9px] leading-4 text-slate-500">
            {copy.description}
          </p>
        </div>

        {savedValidation ? (
          <div className="rounded-md border border-emerald-500/25 bg-emerald-500/5 px-2.5 py-1.5 text-[8px] font-black text-emerald-400">
            {copy.verified}
          </div>
        ) : (
          <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-2.5 py-1.5 text-[8px] font-black text-amber-400">
            {copy.pending}
          </div>
        )}
      </div>

      {readOnly && (
        <div className="mt-3 rounded-lg border border-white/[0.07] bg-[#071017] px-3 py-2 text-[9px] text-slate-500">
          {copy.readOnly}
        </div>
      )}

      <div className="mt-4">
        <div className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
          {copy.confirmationQuestion}
        </div>

        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {RESULT_VALUES.map((option) => {
            const selected =
              validationResult === option.value;

            return (
              <button
                key={option.value}
                type="button"
                disabled={readOnly || saving}
                onClick={() =>
                  setValidationResult(option.value)
                }
                className={`rounded-lg border px-3 py-3 text-left transition ${
                  selected
                    ? option.value === "confirmed"
                      ? "border-emerald-400/50 bg-emerald-500/10 text-emerald-300"
                      : option.value ===
                          "partially_confirmed"
                        ? "border-amber-400/50 bg-amber-500/10 text-amber-300"
                        : "border-red-400/50 bg-red-500/10 text-red-300"
                    : "border-white/[0.07] bg-[#071017] text-slate-400 hover:border-cyan-300/30"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black">
                    {option.symbol}
                  </span>

                  <span className="text-[10px] font-black">
                    {copy.resultLabels[option.value]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <label
            htmlFor={`field-validation-cause-${analysisId}`}
            className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500"
          >
            {copy.actualCause}
          </label>

          <select
            id={`field-validation-cause-${analysisId}`}
            disabled={readOnly || saving}
            value={actualCause}
            onChange={(event) =>
              setActualCause(
                event.target.value as ActualCause | ""
              )
            }
            className="mt-2 w-full rounded-lg border border-white/[0.07] bg-[#071017] px-3 py-2.5 text-[10px] text-slate-200 outline-none transition focus:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">
              {copy.notSelected}
            </option>

            {CAUSE_VALUES.map((cause) => (
              <option
                key={cause}
                value={cause}
              >
                {copy.causeLabels[cause]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={`field-validation-date-${analysisId}`}
            className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500"
          >
            {copy.inspectionDate}
          </label>

          <input
            id={`field-validation-date-${analysisId}`}
            type="date"
            disabled={readOnly || saving}
            value={observedAt}
            onChange={(event) =>
              setObservedAt(event.target.value)
            }
            className="mt-2 w-full rounded-lg border border-white/[0.07] bg-[#071017] px-3 py-2.5 text-[10px] text-slate-200 outline-none transition focus:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
              {copy.actualSeverity}
            </div>
            <div className="mt-1 text-[8px] leading-4 text-slate-600">
              {copy.severityScale}
            </div>
          </div>

          {observedSeverity !== null && (
            <div className="rounded-md border border-cyan-300/20 bg-cyan-300/5 px-2.5 py-1 text-[8px] font-black text-cyan-300">
              {copy.severity} {observedSeverity}/5
            </div>
          )}
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2 md:grid-cols-6">
          {SEVERITY_VALUES.map((severity) => {
            const selected =
              observedSeverity === severity;

            return (
              <button
                key={severity}
                type="button"
                disabled={readOnly || saving}
                onClick={() =>
                  setObservedSeverity(severity)
                }
                className={`rounded-lg border px-2 py-3 text-center transition ${
                  selected
                    ? "border-cyan-300/60 bg-cyan-300/10 text-cyan-200"
                    : "border-white/[0.07] bg-[#071017] text-slate-500 hover:border-cyan-300/30 hover:text-slate-300"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div className="text-base font-black">
                  {severity}
                </div>
                <div className="mt-1 text-[7px] leading-3">
                  {copy.severityDescriptions[severity]}
                </div>
              </button>
            );
          })}
        </div>

        {observedSeverity !== null && (
          <button
            type="button"
            disabled={readOnly || saving}
            onClick={() => setObservedSeverity(null)}
            className="mt-2 text-[8px] font-bold text-slate-600 transition hover:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {copy.clearSeverity}
          </button>
        )}
      </div>

      <div className="mt-3">
        <label
          htmlFor={`field-validation-note-${analysisId}`}
          className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-500"
        >
          {copy.note}
        </label>

        <textarea
          id={`field-validation-note-${analysisId}`}
          disabled={readOnly || saving}
          value={note}
          maxLength={5000}
          rows={4}
          onChange={(event) =>
            setNote(event.target.value)
          }
          placeholder={copy.notePlaceholder}
          className="mt-2 w-full resize-y rounded-lg border border-white/[0.07] bg-[#071017] px-3 py-2.5 text-[10px] leading-4 text-slate-200 outline-none transition placeholder:text-slate-700 focus:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <div className="mt-1 text-right text-[8px] text-slate-600">
          {note.length} / 5000
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 rounded-lg border border-red-500/25 bg-red-500/5 px-3 py-2 text-[9px] font-bold text-red-400">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mt-3 rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 text-[9px] font-bold text-emerald-400">
          ✓ {successMessage}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[8px] leading-4 text-slate-600">
          {copy.analysis} #{analysisId}
          {savedValidation && (
            <>
              {" "}
              · {copy.lastModified}{" "}
              {new Date(
                savedValidation.updated_at
              ).toLocaleString(locale)}
            </>
          )}
        </div>

        {!readOnly && (
          <button
            type="button"
            disabled={
              saving ||
              !validationResult ||
              !observedAt
            }
            onClick={saveValidation}
            className="rounded-lg bg-cyan-300 px-4 py-2.5 text-[9px] font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? copy.saving
              : savedValidation
                ? copy.saveChanges
                : copy.saveValidation}
          </button>
        )}
      </div>
    </section>
  );
}
