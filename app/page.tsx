"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useLanguage } from "./context/LanguageContext";

function getHomeCopy(language: string) {
  const en = {
    openAegris: "Open AEGRIS",
    signIn: "Sign in",
    pilotAccess: "Pilot access",
    heroEyebrow: "Field Intelligence · European Agriculture",
    heroTitle: "Field data.",
    heroTitleAccent: "Decisions on time.",
    heroDescription: "AEGRIS connects satellite monitoring, meteorological data, agronomic context and field validation in one operational system for field-condition decisions.",
    goToApp: "Go to application",
    requestPilot: "Request pilot access",
    satellite: "Satellite",
    resolution: "Resolution",
    decision: "Decision",
    validation: "Validation",
    workflowEyebrow: "Agronomic Workflow",
    workflowTitle: "From signal to a validated decision.",
    workflowDescription: "Not another isolated chart. AEGRIS combines available inputs into a workflow where the agronomist sees what requires attention and why.",
    monitor: "Monitor",
    monitorText: "Sentinel-2 L2A tracks vegetation condition and the historical development of the field.",
    evaluate: "Evaluate",
    evaluateText: "Weather, soil, crop and vegetation data enter the deterministic Decision Engine.",
    prioritize: "Prioritize",
    prioritizeText: "The result converts field condition into a score, priority, alert and concrete recommendation.",
    validate: "Validate",
    validateText: "The agronomist verifies the situation in the field and stores Ground Truth against the specific analysis.",
    oneFieldRecord: "One Field Record",
    oneFieldTitle: "One field. One context. One decision history.",
    oneFieldDescription: "The Field Health Record keeps current condition, data sources, recommendations, alerts and field validation together.",
    fieldHealthRecord: "Field Health Record",
    fieldConditionContext: "Field condition in context",
    criticalPriority: "Critical priority",
    vegetationIndex: "Vegetation index",
    contextScore: "Context score",
    dataConfidence: "Data confidence",
    validGeometry: "Valid geometry",
    decisionEngine: "Decision Engine",
    decisionSequence: "Signal → context → priority → recommendation",
    decisionTraceText: "The result is traceable to the specific analysis and input snapshot. Field verification is stored back as Ground Truth.",
    provenanceEyebrow: "Data provenance",
    provenanceTitle: "Traceable analysis provenance",
    provenanceText: "Source, time, spatial coverage and input quality remain part of the analytical record.",
    fieldValidationEyebrow: "Field validation",
    fieldValidationTitle: "Field verification closes the loop",
    fieldValidationText: "The result does not end with an alert. The agronomist can confirm or reject the condition directly against the specific analysis.",
    trustEyebrow: "Designed for Trust",
    trustTitle: "A decision system, not a black box.",
    deterministicTitle: "Deterministic logic",
    deterministicText: "The Decision Engine works with explicit factors and versioned rules.",
    historyTitle: "Historical context",
    historyText: "The analysis retains the input snapshot and result so the basis of a decision can be traced retrospectively.",
    validationTitle: "Agronomic validation",
    validationText: "Ground Truth connects the digital result with the actual condition observed in the field.",
    localContextTitle: "Official agronomic context",
    localContextText: "The crop and variety catalog is linked to official source data and AEGRIS agronomic profiles.",
    pilotEyebrow: "Controlled Pilot 2026",
    pilotTitle: "Validate AEGRIS on your own fields.",
    pilotDescription: "The pilot is designed for real agricultural enterprises that want to compare AEGRIS analytical outputs with agronomist decisions in the field.",
    createAccount: "Create account",
    systemOperations: "Agronomic Operations",
    dataReady: "Data ready",
    satelliteLayer: "Satellite layer",
    weatherContext: "Weather context",
    currentForecast: "Current + forecast",
    weatherMeta: "Water · temperature · ET₀",
    decisionLayer: "Decision layer",
    decisionMeta: "Score · priority · recommendation",
    fieldFeedback: "Field feedback",
    fieldFeedbackMeta: "Observed cause · validation",
    decisionFlow: "Decision flow",
    traceableOutput: "Traceable output",
    flowItems: ["MONITOR", "EVALUATE", "PRIORITIZE", "VALIDATE"],
  };

  type HomeCopy = typeof en;
  const copy = (values: Partial<HomeCopy>): HomeCopy => ({ ...en, ...values });

  const translations: Record<string, HomeCopy> = {
    en,
    cs: copy({
      openAegris: "Otevřít AEGRIS", signIn: "Přihlásit se", pilotAccess: "Pilotní přístup",
      heroEyebrow: "Field Intelligence · České zemědělství", heroTitle: "Data z pole.", heroTitleAccent: "Rozhodnutí včas.",
      heroDescription: "AEGRIS propojuje satelitní monitoring, meteorologická data, agronomický kontext a terénní ověření do jednoho pracovního systému pro rozhodování nad stavem pozemků.",
      goToApp: "Přejít do aplikace", requestPilot: "Požádat o pilotní přístup", satellite: "Satelit", resolution: "Rozlišení", decision: "Rozhodování", validation: "Validace",
      workflowEyebrow: "Agronomický pracovní tok", workflowTitle: "Od signálu k ověřenému rozhodnutí.", workflowDescription: "Ne další izolovaný graf. AEGRIS skládá dostupné vstupy do pracovního toku, ve kterém agronom vidí, co vyžaduje pozornost a proč.",
      monitor: "Monitorovat", monitorText: "Sentinel-2 L2A sleduje vegetační stav a historický vývoj pozemku.", evaluate: "Vyhodnotit", evaluateText: "Počasí, půda, plodina a vegetační data vstupují do deterministického Decision Engine.",
      prioritize: "Priorizovat", prioritizeText: "Výsledek převádí stav pozemku na skóre, prioritu, upozornění a konkrétní doporučení.", validate: "Ověřit", validateText: "Agronom ověří situaci v terénu a uloží Ground Truth ke konkrétní analýze.",
      oneFieldRecord: "Jeden záznam pole", oneFieldTitle: "Jedno pole. Jeden kontext. Jedna historie rozhodnutí.", oneFieldDescription: "Field Health Record drží aktuální stav, zdroje dat, doporučení, upozornění i terénní validaci pohromadě.",
      fieldHealthRecord: "Field Health Record", fieldConditionContext: "Stav pole v kontextu", criticalPriority: "Kritická priorita", vegetationIndex: "Vegetační index", contextScore: "Kontextové skóre", dataConfidence: "Důvěra v data", validGeometry: "Platná geometrie",
      decisionEngine: "Decision Engine", decisionSequence: "Signál → kontext → priorita → doporučení", decisionTraceText: "Výsledek je dohledatelný ke konkrétní analýze a vstupnímu snapshotu. Terénní ověření se ukládá zpět jako Ground Truth.",
      provenanceEyebrow: "Původ dat", provenanceTitle: "Dohledatelný původ analýzy", provenanceText: "Zdroj, čas, prostorové pokrytí a kvalita vstupů zůstávají součástí analytického záznamu.",
      fieldValidationEyebrow: "Terénní validace", fieldValidationTitle: "Terén uzavírá smyčku", fieldValidationText: "Výsledek nekončí u upozornění. Agronom může potvrdit nebo vyvrátit stav přímo proti konkrétní analýze.",
      trustEyebrow: "Navrženo pro důvěru", trustTitle: "Rozhodovací systém, ne černá skříňka.", deterministicTitle: "Deterministická logika", deterministicText: "Decision Engine pracuje s explicitními faktory a verzovanými pravidly.",
      historyTitle: "Historický kontext", historyText: "Analýza drží vstupní snapshot i výsledek, aby bylo možné zpětně dohledat, z čeho rozhodnutí vzniklo.", validationTitle: "Agronomická validace", validationText: "Ground Truth propojuje digitální výsledek se skutečným stavem zjištěným v terénu.",
      localContextTitle: "Oficiální agronomický kontext", localContextText: "Katalog plodin a odrůd je napojený na oficiální zdrojová data a agronomické profily AEGRIS.",
      pilotEyebrow: "Řízený pilot 2026", pilotTitle: "Ověřte AEGRIS na vlastních polích.", pilotDescription: "Pilotní provoz je určen pro reálné zemědělské podniky, které chtějí porovnat analytické výstupy AEGRIS s rozhodováním agronoma v terénu.",
      createAccount: "Vytvořit účet", systemOperations: "Agronomický provoz", dataReady: "Data připravena", satelliteLayer: "Satelitní vrstva", weatherContext: "Kontext počasí", currentForecast: "Aktuálně + předpověď",
      weatherMeta: "Voda · teplota · ET₀", decisionLayer: "Rozhodovací vrstva", decisionMeta: "Skóre · priorita · doporučení", fieldFeedback: "Terénní zpětná vazba", fieldFeedbackMeta: "Pozorovaná příčina · validace",
      decisionFlow: "Rozhodovací tok", traceableOutput: "Dohledatelný výstup", flowItems: ["MONITOROVAT", "VYHODNOTIT", "PRIORIZOVAT", "OVĚŘIT"],
    }),
    sk: copy({
      openAegris: "Otvoriť AEGRIS", signIn: "Prihlásiť sa", pilotAccess: "Pilotný prístup", heroEyebrow: "Field Intelligence · Európske poľnohospodárstvo", heroTitle: "Dáta z poľa.", heroTitleAccent: "Rozhodnutia načas.",
      heroDescription: "AEGRIS spája satelitné monitorovanie, meteorologické údaje, agronomický kontext a terénne overenie v jednom pracovnom systéme pre rozhodovanie o stave polí.",
      goToApp: "Prejsť do aplikácie", requestPilot: "Požiadať o pilotný prístup", satellite: "Satelit", resolution: "Rozlíšenie", decision: "Rozhodovanie", validation: "Validácia",
      workflowEyebrow: "Agronomický pracovný tok", workflowTitle: "Od signálu k overenému rozhodnutiu.", workflowDescription: "Nie ďalší izolovaný graf. AEGRIS spája dostupné vstupy do pracovného toku, v ktorom agronóm vidí, čo si vyžaduje pozornosť a prečo.",
      monitor: "Monitorovať", monitorText: "Sentinel-2 L2A sleduje stav vegetácie a historický vývoj poľa.", evaluate: "Vyhodnotiť", evaluateText: "Počasie, pôda, plodina a vegetačné údaje vstupujú do deterministického Decision Engine.",
      prioritize: "Prioritizovať", prioritizeText: "Výsledok prevádza stav poľa na skóre, prioritu, upozornenie a konkrétne odporúčanie.", validate: "Overiť", validateText: "Agronóm overí situáciu v teréne a uloží Ground Truth ku konkrétnej analýze.",
      oneFieldRecord: "Jeden záznam poľa", oneFieldTitle: "Jedno pole. Jeden kontext. Jedna história rozhodnutí.", oneFieldDescription: "Field Health Record uchováva aktuálny stav, zdroje údajov, odporúčania, upozornenia a terénnu validáciu spolu.",
      fieldConditionContext: "Stav poľa v kontexte", criticalPriority: "Kritická priorita", vegetationIndex: "Vegetačný index", contextScore: "Kontextové skóre", dataConfidence: "Dôvera v údaje", validGeometry: "Platná geometria",
      decisionSequence: "Signál → kontext → priorita → odporúčanie", decisionTraceText: "Výsledok je dohľadateľný ku konkrétnej analýze a vstupnému snapshotu. Terénne overenie sa ukladá späť ako Ground Truth.",
      provenanceEyebrow: "Pôvod údajov", provenanceTitle: "Dohľadateľný pôvod analýzy", provenanceText: "Zdroj, čas, priestorové pokrytie a kvalita vstupov zostávajú súčasťou analytického záznamu.",
      fieldValidationEyebrow: "Terénna validácia", fieldValidationTitle: "Terén uzatvára slučku", fieldValidationText: "Výsledok nekončí upozornením. Agronóm môže potvrdiť alebo vyvrátiť stav priamo voči konkrétnej analýze.",
      trustEyebrow: "Navrhnuté pre dôveru", trustTitle: "Rozhodovací systém, nie čierna skrinka.", deterministicTitle: "Deterministická logika", deterministicText: "Decision Engine pracuje s explicitnými faktormi a verzovanými pravidlami.",
      historyTitle: "Historický kontext", historyText: "Analýza uchováva vstupný snapshot aj výsledok, aby bolo možné spätne dohľadať základ rozhodnutia.", validationTitle: "Agronomická validácia", validationText: "Ground Truth spája digitálny výsledok so skutočným stavom pozorovaným v teréne.",
      localContextTitle: "Oficiálny agronomický kontext", localContextText: "Katalóg plodín a odrôd je prepojený s oficiálnymi zdrojovými údajmi a agronomickými profilmi AEGRIS.",
      pilotEyebrow: "Riadený pilot 2026", pilotTitle: "Overte AEGRIS na vlastných poliach.", pilotDescription: "Pilot je určený pre reálne poľnohospodárske podniky, ktoré chcú porovnať analytické výstupy AEGRIS s rozhodnutiami agronóma v teréne.",
      createAccount: "Vytvoriť účet", systemOperations: "Agronomická prevádzka", dataReady: "Dáta pripravené", satelliteLayer: "Satelitná vrstva", weatherContext: "Kontext počasia", currentForecast: "Aktuálne + predpoveď", weatherMeta: "Voda · teplota · ET₀",
      decisionLayer: "Rozhodovacia vrstva", decisionMeta: "Skóre · priorita · odporúčanie", fieldFeedback: "Terénna spätná väzba", fieldFeedbackMeta: "Pozorovaná príčina · validácia", decisionFlow: "Rozhodovací tok", traceableOutput: "Dohľadateľný výstup", flowItems: ["MONITOROVAŤ", "VYHODNOTIŤ", "PRIORIZOVAŤ", "OVERIŤ"],
    }),
    de: copy({
      openAegris: "AEGRIS öffnen", signIn: "Anmelden", pilotAccess: "Pilotzugang", heroEyebrow: "Field Intelligence · Europäische Landwirtschaft", heroTitle: "Felddaten.", heroTitleAccent: "Entscheidungen zur richtigen Zeit.",
      heroDescription: "AEGRIS verbindet Satellitenmonitoring, Wetterdaten, agronomischen Kontext und Feldvalidierung in einem operativen System für Entscheidungen zum Feldzustand.",
      goToApp: "Zur Anwendung", requestPilot: "Pilotzugang anfragen", satellite: "Satellit", resolution: "Auflösung", decision: "Entscheidung", validation: "Validierung",
      workflowEyebrow: "Agronomischer Workflow", workflowTitle: "Vom Signal zur validierten Entscheidung.", workflowDescription: "Kein weiteres isoliertes Diagramm. AEGRIS verbindet verfügbare Eingaben zu einem Workflow, in dem der Agronom erkennt, was Aufmerksamkeit erfordert und warum.",
      monitor: "Überwachen", monitorText: "Sentinel-2 L2A verfolgt den Vegetationszustand und die historische Entwicklung des Feldes.", evaluate: "Bewerten", evaluateText: "Wetter-, Boden-, Kultur- und Vegetationsdaten fließen in die deterministische Decision Engine ein.",
      prioritize: "Priorisieren", prioritizeText: "Das Ergebnis übersetzt den Feldzustand in Score, Priorität, Warnung und konkrete Empfehlung.", validate: "Validieren", validateText: "Der Agronom überprüft die Situation im Feld und speichert Ground Truth zur jeweiligen Analyse.",
      oneFieldRecord: "Eine Feldakte", oneFieldTitle: "Ein Feld. Ein Kontext. Eine Entscheidungshistorie.", oneFieldDescription: "Der Field Health Record hält aktuellen Zustand, Datenquellen, Empfehlungen, Warnungen und Feldvalidierung zusammen.",
      fieldConditionContext: "Feldzustand im Kontext", criticalPriority: "Kritische Priorität", vegetationIndex: "Vegetationsindex", contextScore: "Kontext-Score", dataConfidence: "Datenvertrauen", validGeometry: "Gültige Geometrie",
      decisionSequence: "Signal → Kontext → Priorität → Empfehlung", decisionTraceText: "Das Ergebnis ist auf die konkrete Analyse und den Eingabe-Snapshot zurückführbar. Die Feldprüfung wird als Ground Truth gespeichert.",
      provenanceEyebrow: "Datenherkunft", provenanceTitle: "Nachvollziehbare Analyseherkunft", provenanceText: "Quelle, Zeitpunkt, räumliche Abdeckung und Eingabequalität bleiben Teil des Analysedatensatzes.",
      fieldValidationEyebrow: "Feldvalidierung", fieldValidationTitle: "Die Feldprüfung schließt den Kreislauf", fieldValidationText: "Das Ergebnis endet nicht mit einer Warnung. Der Agronom kann den Zustand direkt gegenüber der konkreten Analyse bestätigen oder verwerfen.",
      trustEyebrow: "Für Vertrauen entwickelt", trustTitle: "Ein Entscheidungssystem, keine Blackbox.", deterministicTitle: "Deterministische Logik", deterministicText: "Die Decision Engine arbeitet mit expliziten Faktoren und versionierten Regeln.",
      historyTitle: "Historischer Kontext", historyText: "Die Analyse bewahrt Eingabe-Snapshot und Ergebnis auf, sodass die Entscheidungsgrundlage rückwirkend nachvollziehbar bleibt.", validationTitle: "Agronomische Validierung", validationText: "Ground Truth verbindet das digitale Ergebnis mit dem tatsächlich im Feld beobachteten Zustand.",
      localContextTitle: "Offizieller agronomischer Kontext", localContextText: "Der Kultur- und Sortenkatalog ist mit offiziellen Quelldaten und agronomischen AEGRIS-Profilen verknüpft.",
      pilotEyebrow: "Kontrollierter Pilot 2026", pilotTitle: "Validieren Sie AEGRIS auf Ihren eigenen Feldern.", pilotDescription: "Der Pilot richtet sich an reale landwirtschaftliche Betriebe, die AEGRIS-Analyseergebnisse mit Entscheidungen des Agronomen im Feld vergleichen möchten.",
      createAccount: "Konto erstellen", systemOperations: "Agronomischer Betrieb", dataReady: "Daten bereit", satelliteLayer: "Satellitenebene", weatherContext: "Wetterkontext", currentForecast: "Aktuell + Prognose", weatherMeta: "Wasser · Temperatur · ET₀",
      decisionLayer: "Entscheidungsebene", decisionMeta: "Score · Priorität · Empfehlung", fieldFeedback: "Feldrückmeldung", fieldFeedbackMeta: "Beobachtete Ursache · Validierung", decisionFlow: "Entscheidungsfluss", traceableOutput: "Nachvollziehbares Ergebnis", flowItems: ["ÜBERWACHEN", "BEWERTEN", "PRIORISIEREN", "VALIDIEREN"],
    }),
    pl: copy({
      openAegris: "Otwórz AEGRIS", signIn: "Zaloguj się", pilotAccess: "Dostęp pilotażowy", heroEyebrow: "Field Intelligence · Europejskie rolnictwo", heroTitle: "Dane z pola.", heroTitleAccent: "Decyzje na czas.",
      heroDescription: "AEGRIS łączy monitoring satelitarny, dane meteorologiczne, kontekst agronomiczny i walidację terenową w jednym systemie operacyjnym wspierającym decyzje o stanie pól.",
      goToApp: "Przejdź do aplikacji", requestPilot: "Poproś o dostęp pilotażowy", satellite: "Satelita", resolution: "Rozdzielczość", decision: "Decyzja", validation: "Walidacja",
      workflowEyebrow: "Proces agronomiczny", workflowTitle: "Od sygnału do zweryfikowanej decyzji.", workflowDescription: "Nie kolejny odizolowany wykres. AEGRIS łączy dostępne dane w proces, w którym agronom widzi, co wymaga uwagi i dlaczego.",
      monitor: "Monitoruj", monitorText: "Sentinel-2 L2A śledzi stan roślinności i historyczny rozwój pola.", evaluate: "Oceń", evaluateText: "Dane pogodowe, glebowe, uprawowe i wegetacyjne trafiają do deterministycznego Decision Engine.",
      prioritize: "Ustal priorytet", prioritizeText: "Wynik przekształca stan pola w ocenę, priorytet, alert i konkretne zalecenie.", validate: "Zweryfikuj", validateText: "Agronom weryfikuje sytuację w terenie i zapisuje Ground Truth dla konkretnej analizy.",
      oneFieldRecord: "Jeden rekord pola", oneFieldTitle: "Jedno pole. Jeden kontekst. Jedna historia decyzji.", oneFieldDescription: "Field Health Record przechowuje razem aktualny stan, źródła danych, zalecenia, alerty i walidację terenową.",
      fieldConditionContext: "Stan pola w kontekście", criticalPriority: "Priorytet krytyczny", vegetationIndex: "Indeks wegetacji", contextScore: "Ocena kontekstowa", dataConfidence: "Wiarygodność danych", validGeometry: "Prawidłowa geometria",
      decisionSequence: "Sygnał → kontekst → priorytet → zalecenie", decisionTraceText: "Wynik można prześledzić do konkretnej analizy i migawki danych wejściowych. Weryfikacja terenowa jest zapisywana jako Ground Truth.",
      provenanceEyebrow: "Pochodzenie danych", provenanceTitle: "Identyfikowalne pochodzenie analizy", provenanceText: "Źródło, czas, zasięg przestrzenny i jakość danych wejściowych pozostają częścią rekordu analitycznego.",
      fieldValidationEyebrow: "Walidacja terenowa", fieldValidationTitle: "Weryfikacja terenowa zamyka pętlę", fieldValidationText: "Wynik nie kończy się na alercie. Agronom może potwierdzić lub odrzucić stan bezpośrednio względem konkretnej analizy.",
      trustEyebrow: "Zaprojektowane dla zaufania", trustTitle: "System decyzyjny, nie czarna skrzynka.", deterministicTitle: "Logika deterministyczna", deterministicText: "Decision Engine działa na jawnych czynnikach i wersjonowanych regułach.",
      historyTitle: "Kontekst historyczny", historyText: "Analiza zachowuje migawkę danych wejściowych i wynik, dzięki czemu można odtworzyć podstawę decyzji.", validationTitle: "Walidacja agronomiczna", validationText: "Ground Truth łączy wynik cyfrowy z rzeczywistym stanem zaobserwowanym w terenie.",
      localContextTitle: "Oficjalny kontekst agronomiczny", localContextText: "Katalog upraw i odmian jest powiązany z oficjalnymi danymi źródłowymi i profilami agronomicznymi AEGRIS.",
      pilotEyebrow: "Kontrolowany pilotaż 2026", pilotTitle: "Zweryfikuj AEGRIS na własnych polach.", pilotDescription: "Pilotaż jest przeznaczony dla rzeczywistych gospodarstw, które chcą porównać wyniki analiz AEGRIS z decyzjami agronoma w terenie.",
      createAccount: "Utwórz konto", systemOperations: "Operacje agronomiczne", dataReady: "Dane gotowe", satelliteLayer: "Warstwa satelitarna", weatherContext: "Kontekst pogodowy", currentForecast: "Aktualnie + prognoza", weatherMeta: "Woda · temperatura · ET₀",
      decisionLayer: "Warstwa decyzyjna", decisionMeta: "Ocena · priorytet · zalecenie", fieldFeedback: "Informacja z terenu", fieldFeedbackMeta: "Zaobserwowana przyczyna · walidacja", decisionFlow: "Przepływ decyzji", traceableOutput: "Identyfikowalny wynik", flowItems: ["MONITORUJ", "OCEŃ", "USTAL PRIORYTET", "ZWERYFIKUJ"],
    }),
    fr: copy({
      openAegris: "Ouvrir AEGRIS", signIn: "Se connecter", pilotAccess: "Accès pilote", heroEyebrow: "Field Intelligence · Agriculture européenne", heroTitle: "Données de terrain.", heroTitleAccent: "Décisions au bon moment.",
      heroDescription: "AEGRIS réunit le suivi satellitaire, les données météorologiques, le contexte agronomique et la validation terrain dans un seul système opérationnel d'aide à la décision.",
      goToApp: "Accéder à l'application", requestPilot: "Demander un accès pilote", satellite: "Satellite", resolution: "Résolution", decision: "Décision", validation: "Validation",
      workflowEyebrow: "Flux agronomique", workflowTitle: "Du signal à une décision validée.", workflowDescription: "Pas un graphique isolé de plus. AEGRIS rassemble les données disponibles dans un flux où l'agronome voit ce qui nécessite son attention et pourquoi.",
      monitor: "Surveiller", monitorText: "Sentinel-2 L2A suit l'état de la végétation et l'évolution historique de la parcelle.", evaluate: "Évaluer", evaluateText: "Les données météo, sol, culture et végétation alimentent le Decision Engine déterministe.",
      prioritize: "Prioriser", prioritizeText: "Le résultat transforme l'état de la parcelle en score, priorité, alerte et recommandation concrète.", validate: "Valider", validateText: "L'agronome vérifie la situation sur le terrain et enregistre la Ground Truth pour l'analyse concernée.",
      oneFieldRecord: "Un dossier par parcelle", oneFieldTitle: "Une parcelle. Un contexte. Un historique de décisions.", oneFieldDescription: "Le Field Health Record regroupe l'état actuel, les sources de données, les recommandations, les alertes et la validation terrain.",
      fieldConditionContext: "État de la parcelle en contexte", criticalPriority: "Priorité critique", vegetationIndex: "Indice de végétation", contextScore: "Score contextuel", dataConfidence: "Fiabilité des données", validGeometry: "Géométrie valide",
      decisionSequence: "Signal → contexte → priorité → recommandation", decisionTraceText: "Le résultat est traçable jusqu'à l'analyse et au snapshot d'entrée concernés. La vérification terrain est enregistrée comme Ground Truth.",
      provenanceEyebrow: "Provenance des données", provenanceTitle: "Provenance d'analyse traçable", provenanceText: "La source, l'heure, la couverture spatiale et la qualité des entrées restent intégrées au dossier analytique.",
      fieldValidationEyebrow: "Validation terrain", fieldValidationTitle: "La vérification terrain ferme la boucle", fieldValidationText: "Le résultat ne s'arrête pas à une alerte. L'agronome peut confirmer ou rejeter l'état directement par rapport à l'analyse concernée.",
      trustEyebrow: "Conçu pour la confiance", trustTitle: "Un système de décision, pas une boîte noire.", deterministicTitle: "Logique déterministe", deterministicText: "Le Decision Engine fonctionne avec des facteurs explicites et des règles versionnées.",
      historyTitle: "Contexte historique", historyText: "L'analyse conserve le snapshot d'entrée et le résultat afin de pouvoir retracer la base d'une décision.", validationTitle: "Validation agronomique", validationText: "La Ground Truth relie le résultat numérique à l'état réellement observé sur le terrain.",
      localContextTitle: "Contexte agronomique officiel", localContextText: "Le catalogue des cultures et variétés est relié aux données sources officielles et aux profils agronomiques AEGRIS.",
      pilotEyebrow: "Pilote contrôlé 2026", pilotTitle: "Validez AEGRIS sur vos propres parcelles.", pilotDescription: "Le pilote s'adresse aux exploitations agricoles réelles souhaitant comparer les résultats analytiques d'AEGRIS aux décisions de l'agronome sur le terrain.",
      createAccount: "Créer un compte", systemOperations: "Opérations agronomiques", dataReady: "Données prêtes", satelliteLayer: "Couche satellite", weatherContext: "Contexte météo", currentForecast: "Actuel + prévisions", weatherMeta: "Eau · température · ET₀",
      decisionLayer: "Couche décisionnelle", decisionMeta: "Score · priorité · recommandation", fieldFeedback: "Retour terrain", fieldFeedbackMeta: "Cause observée · validation", decisionFlow: "Flux de décision", traceableOutput: "Résultat traçable", flowItems: ["SURVEILLER", "ÉVALUER", "PRIORISER", "VALIDER"],
    }),
    es: copy({
      openAegris: "Abrir AEGRIS", signIn: "Iniciar sesión", pilotAccess: "Acceso piloto", heroEyebrow: "Field Intelligence · Agricultura europea", heroTitle: "Datos del campo.", heroTitleAccent: "Decisiones a tiempo.",
      heroDescription: "AEGRIS conecta monitorización satelital, datos meteorológicos, contexto agronómico y validación de campo en un único sistema operativo para decidir sobre el estado de las parcelas.",
      goToApp: "Ir a la aplicación", requestPilot: "Solicitar acceso piloto", satellite: "Satélite", resolution: "Resolución", decision: "Decisión", validation: "Validación",
      workflowEyebrow: "Flujo agronómico", workflowTitle: "De la señal a una decisión validada.", workflowDescription: "No es otro gráfico aislado. AEGRIS combina las entradas disponibles en un flujo donde el agrónomo ve qué requiere atención y por qué.",
      monitor: "Monitorizar", monitorText: "Sentinel-2 L2A sigue el estado de la vegetación y la evolución histórica de la parcela.", evaluate: "Evaluar", evaluateText: "Los datos meteorológicos, del suelo, del cultivo y de la vegetación entran en el Decision Engine determinista.",
      prioritize: "Priorizar", prioritizeText: "El resultado convierte el estado de la parcela en puntuación, prioridad, alerta y recomendación concreta.", validate: "Validar", validateText: "El agrónomo verifica la situación en campo y guarda Ground Truth para el análisis concreto.",
      oneFieldRecord: "Un registro por parcela", oneFieldTitle: "Una parcela. Un contexto. Un historial de decisiones.", oneFieldDescription: "Field Health Record mantiene juntos el estado actual, las fuentes de datos, las recomendaciones, las alertas y la validación de campo.",
      fieldConditionContext: "Estado de la parcela en contexto", criticalPriority: "Prioridad crítica", vegetationIndex: "Índice de vegetación", contextScore: "Puntuación contextual", dataConfidence: "Confianza en los datos", validGeometry: "Geometría válida",
      decisionSequence: "Señal → contexto → prioridad → recomendación", decisionTraceText: "El resultado puede rastrearse hasta el análisis y el snapshot de entrada concretos. La verificación de campo se guarda como Ground Truth.",
      provenanceEyebrow: "Procedencia de datos", provenanceTitle: "Procedencia trazable del análisis", provenanceText: "La fuente, el momento, la cobertura espacial y la calidad de entrada permanecen en el registro analítico.",
      fieldValidationEyebrow: "Validación de campo", fieldValidationTitle: "La verificación de campo cierra el ciclo", fieldValidationText: "El resultado no termina con una alerta. El agrónomo puede confirmar o rechazar el estado directamente frente al análisis concreto.",
      trustEyebrow: "Diseñado para generar confianza", trustTitle: "Un sistema de decisión, no una caja negra.", deterministicTitle: "Lógica determinista", deterministicText: "Decision Engine trabaja con factores explícitos y reglas versionadas.",
      historyTitle: "Contexto histórico", historyText: "El análisis conserva el snapshot de entrada y el resultado para poder rastrear posteriormente la base de la decisión.", validationTitle: "Validación agronómica", validationText: "Ground Truth conecta el resultado digital con el estado real observado en campo.",
      localContextTitle: "Contexto agronómico oficial", localContextText: "El catálogo de cultivos y variedades está vinculado a datos oficiales y perfiles agronómicos de AEGRIS.",
      pilotEyebrow: "Piloto controlado 2026", pilotTitle: "Valide AEGRIS en sus propias parcelas.", pilotDescription: "El piloto está diseñado para explotaciones agrícolas reales que quieran comparar los resultados analíticos de AEGRIS con las decisiones del agrónomo en campo.",
      createAccount: "Crear cuenta", systemOperations: "Operaciones agronómicas", dataReady: "Datos listos", satelliteLayer: "Capa satelital", weatherContext: "Contexto meteorológico", currentForecast: "Actual + previsión", weatherMeta: "Agua · temperatura · ET₀",
      decisionLayer: "Capa de decisión", decisionMeta: "Puntuación · prioridad · recomendación", fieldFeedback: "Información de campo", fieldFeedbackMeta: "Causa observada · validación", decisionFlow: "Flujo de decisión", traceableOutput: "Resultado trazable", flowItems: ["MONITORIZAR", "EVALUAR", "PRIORIZAR", "VALIDAR"],
    }),
    it: copy({
      openAegris: "Apri AEGRIS", signIn: "Accedi", pilotAccess: "Accesso pilota", heroEyebrow: "Field Intelligence · Agricoltura europea", heroTitle: "Dati dal campo.", heroTitleAccent: "Decisioni al momento giusto.",
      heroDescription: "AEGRIS collega monitoraggio satellitare, dati meteorologici, contesto agronomico e validazione in campo in un unico sistema operativo per le decisioni sullo stato degli appezzamenti.",
      goToApp: "Vai all'applicazione", requestPilot: "Richiedi accesso pilota", satellite: "Satellite", resolution: "Risoluzione", decision: "Decisione", validation: "Validazione",
      workflowEyebrow: "Flusso agronomico", workflowTitle: "Dal segnale a una decisione validata.", workflowDescription: "Non un altro grafico isolato. AEGRIS combina gli input disponibili in un flusso in cui l'agronomo vede cosa richiede attenzione e perché.",
      monitor: "Monitorare", monitorText: "Sentinel-2 L2A monitora lo stato della vegetazione e l'evoluzione storica dell'appezzamento.", evaluate: "Valutare", evaluateText: "Dati meteo, suolo, coltura e vegetazione entrano nel Decision Engine deterministico.",
      prioritize: "Dare priorità", prioritizeText: "Il risultato traduce lo stato dell'appezzamento in punteggio, priorità, allerta e raccomandazione concreta.", validate: "Validare", validateText: "L'agronomo verifica la situazione sul campo e salva la Ground Truth per l'analisi specifica.",
      oneFieldRecord: "Un record per appezzamento", oneFieldTitle: "Un appezzamento. Un contesto. Una storia decisionale.", oneFieldDescription: "Field Health Record mantiene insieme stato attuale, fonti dati, raccomandazioni, allerte e validazione in campo.",
      fieldConditionContext: "Stato dell'appezzamento nel contesto", criticalPriority: "Priorità critica", vegetationIndex: "Indice di vegetazione", contextScore: "Punteggio contestuale", dataConfidence: "Affidabilità dei dati", validGeometry: "Geometria valida",
      decisionSequence: "Segnale → contesto → priorità → raccomandazione", decisionTraceText: "Il risultato è tracciabile fino all'analisi specifica e allo snapshot degli input. La verifica sul campo viene salvata come Ground Truth.",
      provenanceEyebrow: "Provenienza dei dati", provenanceTitle: "Provenienza dell'analisi tracciabile", provenanceText: "Fonte, tempo, copertura spaziale e qualità degli input restano parte del record analitico.",
      fieldValidationEyebrow: "Validazione in campo", fieldValidationTitle: "La verifica in campo chiude il ciclo", fieldValidationText: "Il risultato non termina con un'allerta. L'agronomo può confermare o respingere la condizione direttamente rispetto all'analisi specifica.",
      trustEyebrow: "Progettato per la fiducia", trustTitle: "Un sistema decisionale, non una scatola nera.", deterministicTitle: "Logica deterministica", deterministicText: "Il Decision Engine lavora con fattori espliciti e regole versionate.",
      historyTitle: "Contesto storico", historyText: "L'analisi conserva lo snapshot degli input e il risultato per rendere tracciabile a posteriori la base della decisione.", validationTitle: "Validazione agronomica", validationText: "Ground Truth collega il risultato digitale alla condizione reale osservata sul campo.",
      localContextTitle: "Contesto agronomico ufficiale", localContextText: "Il catalogo di colture e varietà è collegato ai dati ufficiali e ai profili agronomici AEGRIS.",
      pilotEyebrow: "Pilota controllato 2026", pilotTitle: "Valida AEGRIS sui tuoi campi.", pilotDescription: "Il pilota è pensato per aziende agricole reali che vogliono confrontare i risultati analitici di AEGRIS con le decisioni dell'agronomo sul campo.",
      createAccount: "Crea account", systemOperations: "Operazioni agronomiche", dataReady: "Dati pronti", satelliteLayer: "Livello satellitare", weatherContext: "Contesto meteo", currentForecast: "Attuale + previsione", weatherMeta: "Acqua · temperatura · ET₀",
      decisionLayer: "Livello decisionale", decisionMeta: "Punteggio · priorità · raccomandazione", fieldFeedback: "Feedback dal campo", fieldFeedbackMeta: "Causa osservata · validazione", decisionFlow: "Flusso decisionale", traceableOutput: "Output tracciabile", flowItems: ["MONITORARE", "VALUTARE", "PRIORITÀ", "VALIDARE"],
    }),
  };

  const lightweight: Record<string, Partial<HomeCopy>> = {
    nl: { openAegris:"AEGRIS openen", signIn:"Inloggen", pilotAccess:"Pilottoegang", heroEyebrow:"Field Intelligence · Europese landbouw", heroTitle:"Veldgegevens.", heroTitleAccent:"Beslissingen op tijd.", goToApp:"Naar de applicatie", requestPilot:"Pilottoegang aanvragen", satellite:"Satelliet", resolution:"Resolutie", decision:"Beslissing", validation:"Validatie", monitor:"Monitoren", evaluate:"Evalueren", prioritize:"Prioriteren", validate:"Valideren", createAccount:"Account aanmaken", dataReady:"Gegevens gereed", decisionFlow:"Beslissingsstroom", traceableOutput:"Traceerbare output", flowItems:["MONITOREN","EVALUEREN","PRIORITEREN","VALIDEREN"],
      heroDescription: "AEGRIS verbindt satellietmonitoring, meteorologische gegevens, agronomische context en veldvalidatie in één operationeel systeem voor beslissingen over de toestand van percelen.",
      workflowEyebrow: "Agronomische workflow",
      workflowTitle: "Van signaal naar een gevalideerde beslissing.",
      workflowDescription: "Geen losstaande grafiek erbij. AEGRIS combineert beschikbare gegevens in een workflow waarin de agronoom ziet wat aandacht vraagt en waarom.",
      monitorText: "Sentinel-2 L2A volgt de vegetatietoestand en de historische ontwikkeling van het perceel.",
      evaluateText: "Weer-, bodem-, gewas- en vegetatiegegevens worden verwerkt door de deterministische Decision Engine.",
      prioritizeText: "Het resultaat vertaalt de toestand van het perceel naar een score, prioriteit, waarschuwing en concrete aanbeveling.",
      validateText: "De agronoom controleert de situatie in het veld en slaat Ground Truth op bij de betreffende analyse.",
      oneFieldRecord: "Eén perceelrecord",
      oneFieldTitle: "Eén perceel. Eén context. Eén beslissingshistorie.",
      oneFieldDescription: "Het Field Health Record houdt actuele toestand, databronnen, aanbevelingen, waarschuwingen en veldvalidatie bij elkaar.",
      fieldConditionContext: "Perceeltoestand in context",
      criticalPriority: "Kritieke prioriteit",
      vegetationIndex: "Vegetatie-index",
      contextScore: "Contextscore",
      dataConfidence: "Databetrouwbaarheid",
      validGeometry: "Geldige geometrie",
      decisionSequence: "Signaal → context → prioriteit → aanbeveling",
      decisionTraceText: "Het resultaat is herleidbaar tot de specifieke analyse en invoersnapshot. De veldcontrole wordt als Ground Truth opgeslagen.",
      provenanceEyebrow: "Herkomst van gegevens",
      provenanceTitle: "Traceerbare herkomst van de analyse",
      provenanceText: "Bron, tijdstip, ruimtelijke dekking en kwaliteit van de invoer blijven onderdeel van het analytische dossier.",
      fieldValidationEyebrow: "Veldvalidatie",
      fieldValidationTitle: "Veldcontrole sluit de cyclus",
      fieldValidationText: "Het resultaat stopt niet bij een waarschuwing. De agronoom kan de toestand rechtstreeks tegenover de specifieke analyse bevestigen of verwerpen.",
      trustEyebrow: "Ontworpen voor vertrouwen",
      trustTitle: "Een beslissingssysteem, geen black box.",
      deterministicTitle: "Deterministische logica",
      deterministicText: "De Decision Engine werkt met expliciete factoren en geversioneerde regels.",
      historyTitle: "Historische context",
      historyText: "De analyse bewaart de invoersnapshot en het resultaat, zodat de basis van een beslissing achteraf kan worden nagegaan.",
      validationTitle: "Agronomische validatie",
      validationText: "Ground Truth verbindt het digitale resultaat met de werkelijk in het veld waargenomen toestand.",
      localContextTitle: "Officiële agronomische context",
      localContextText: "De gewas- en rassencatalogus is gekoppeld aan officiële brongegevens en agronomische AEGRIS-profielen.",
      pilotEyebrow: "Gecontroleerde pilot 2026",
      pilotTitle: "Valideer AEGRIS op uw eigen percelen.",
      pilotDescription: "De pilot is bedoeld voor echte landbouwbedrijven die de analytische resultaten van AEGRIS willen vergelijken met beslissingen van de agronoom in het veld.",
      systemOperations: "Agronomische operaties",
      satelliteLayer: "Satellietlaag",
      weatherContext: "Weercontext",
      currentForecast: "Actueel + verwachting",
      weatherMeta: "Water · temperatuur · ET₀",
      decisionLayer: "Beslissingslaag",
      decisionMeta: "Score · prioriteit · aanbeveling",
      fieldFeedback: "Veldfeedback",
      fieldFeedbackMeta: "Waargenomen oorzaak · validatie", },
    pt: { openAegris:"Abrir AEGRIS", signIn:"Entrar", pilotAccess:"Acesso piloto", heroEyebrow:"Field Intelligence · Agricultura europeia", heroTitle:"Dados do campo.", heroTitleAccent:"Decisões a tempo.", goToApp:"Ir para a aplicação", requestPilot:"Solicitar acesso piloto", satellite:"Satélite", resolution:"Resolução", decision:"Decisão", validation:"Validação", monitor:"Monitorizar", evaluate:"Avaliar", prioritize:"Priorizar", validate:"Validar", createAccount:"Criar conta", dataReady:"Dados prontos", decisionFlow:"Fluxo de decisão", traceableOutput:"Resultado rastreável", flowItems:["MONITORIZAR","AVALIAR","PRIORIZAR","VALIDAR"],
      heroDescription: "O AEGRIS liga monitorização por satélite, dados meteorológicos, contexto agronómico e validação de campo num único sistema operacional para decisões sobre o estado das parcelas.",
      workflowEyebrow: "Fluxo agronómico",
      workflowTitle: "Do sinal a uma decisão validada.",
      workflowDescription: "Não é apenas mais um gráfico isolado. O AEGRIS combina os dados disponíveis num fluxo em que o agrónomo vê o que requer atenção e porquê.",
      monitorText: "O Sentinel-2 L2A acompanha o estado da vegetação e a evolução histórica da parcela.",
      evaluateText: "Dados meteorológicos, do solo, da cultura e da vegetação entram no Decision Engine determinístico.",
      prioritizeText: "O resultado converte o estado da parcela em pontuação, prioridade, alerta e recomendação concreta.",
      validateText: "O agrónomo verifica a situação no campo e guarda a Ground Truth para a análise específica.",
      oneFieldRecord: "Um registo por parcela",
      oneFieldTitle: "Uma parcela. Um contexto. Um histórico de decisões.",
      oneFieldDescription: "O Field Health Record mantém juntos o estado atual, as fontes de dados, as recomendações, os alertas e a validação de campo.",
      fieldConditionContext: "Estado da parcela em contexto",
      criticalPriority: "Prioridade crítica",
      vegetationIndex: "Índice de vegetação",
      contextScore: "Pontuação contextual",
      dataConfidence: "Confiança nos dados",
      validGeometry: "Geometria válida",
      decisionSequence: "Sinal → contexto → prioridade → recomendação",
      decisionTraceText: "O resultado é rastreável até à análise específica e ao snapshot de entrada. A verificação de campo é guardada como Ground Truth.",
      provenanceEyebrow: "Proveniência dos dados",
      provenanceTitle: "Proveniência rastreável da análise",
      provenanceText: "A fonte, o momento, a cobertura espacial e a qualidade dos dados de entrada permanecem no registo analítico.",
      fieldValidationEyebrow: "Validação de campo",
      fieldValidationTitle: "A verificação de campo fecha o ciclo",
      fieldValidationText: "O resultado não termina num alerta. O agrónomo pode confirmar ou rejeitar o estado diretamente em relação à análise específica.",
      trustEyebrow: "Concebido para confiança",
      trustTitle: "Um sistema de decisão, não uma caixa negra.",
      deterministicTitle: "Lógica determinística",
      deterministicText: "O Decision Engine trabalha com fatores explícitos e regras versionadas.",
      historyTitle: "Contexto histórico",
      historyText: "A análise conserva o snapshot de entrada e o resultado para que a base da decisão possa ser rastreada posteriormente.",
      validationTitle: "Validação agronómica",
      validationText: "A Ground Truth liga o resultado digital ao estado realmente observado no campo.",
      localContextTitle: "Contexto agronómico oficial",
      localContextText: "O catálogo de culturas e variedades está ligado a dados oficiais e aos perfis agronómicos AEGRIS.",
      pilotEyebrow: "Piloto controlado 2026",
      pilotTitle: "Valide o AEGRIS nas suas próprias parcelas.",
      pilotDescription: "O piloto destina-se a explorações agrícolas reais que pretendam comparar os resultados analíticos do AEGRIS com as decisões do agrónomo no campo.",
      systemOperations: "Operações agronómicas",
      satelliteLayer: "Camada de satélite",
      weatherContext: "Contexto meteorológico",
      currentForecast: "Atual + previsão",
      weatherMeta: "Água · temperatura · ET₀",
      decisionLayer: "Camada de decisão",
      decisionMeta: "Pontuação · prioridade · recomendação",
      fieldFeedback: "Retorno do campo",
      fieldFeedbackMeta: "Causa observada · validação", },
    ro: { openAegris:"Deschide AEGRIS", signIn:"Autentificare", pilotAccess:"Acces pilot", heroEyebrow:"Field Intelligence · Agricultura europeană", heroTitle:"Date din câmp.", heroTitleAccent:"Decizii la timp.", goToApp:"Mergi la aplicație", requestPilot:"Solicită acces pilot", satellite:"Satelit", resolution:"Rezoluție", decision:"Decizie", validation:"Validare", monitor:"Monitorizare", evaluate:"Evaluare", prioritize:"Prioritizare", validate:"Validare", createAccount:"Creează cont", dataReady:"Date pregătite", decisionFlow:"Flux decizional", traceableOutput:"Rezultat trasabil", flowItems:["MONITORIZARE","EVALUARE","PRIORITIZARE","VALIDARE"],
      heroDescription: "AEGRIS conectează monitorizarea prin satelit, datele meteorologice, contextul agronomic și validarea în teren într-un singur sistem operațional pentru decizii privind starea parcelelor.",
      workflowEyebrow: "Flux agronomic",
      workflowTitle: "De la semnal la o decizie validată.",
      workflowDescription: "Nu încă un grafic izolat. AEGRIS combină datele disponibile într-un flux în care agronomul vede ce necesită atenție și de ce.",
      monitorText: "Sentinel-2 L2A urmărește starea vegetației și evoluția istorică a parcelei.",
      evaluateText: "Datele meteo, de sol, cultură și vegetație intră în Decision Engine determinist.",
      prioritizeText: "Rezultatul transformă starea parcelei în scor, prioritate, alertă și recomandare concretă.",
      validateText: "Agronomul verifică situația în teren și salvează Ground Truth pentru analiza respectivă.",
      oneFieldRecord: "O fișă pentru fiecare parcelă",
      oneFieldTitle: "O parcelă. Un context. Un istoric al deciziilor.",
      oneFieldDescription: "Field Health Record păstrează împreună starea actuală, sursele de date, recomandările, alertele și validarea în teren.",
      fieldConditionContext: "Starea parcelei în context",
      criticalPriority: "Prioritate critică",
      vegetationIndex: "Indice de vegetație",
      contextScore: "Scor contextual",
      dataConfidence: "Încredere în date",
      validGeometry: "Geometrie validă",
      decisionSequence: "Semnal → context → prioritate → recomandare",
      decisionTraceText: "Rezultatul poate fi urmărit până la analiza specifică și snapshotul datelor de intrare. Verificarea în teren este salvată ca Ground Truth.",
      provenanceEyebrow: "Proveniența datelor",
      provenanceTitle: "Proveniență trasabilă a analizei",
      provenanceText: "Sursa, momentul, acoperirea spațială și calitatea datelor de intrare rămân parte a înregistrării analitice.",
      fieldValidationEyebrow: "Validare în teren",
      fieldValidationTitle: "Verificarea în teren închide bucla",
      fieldValidationText: "Rezultatul nu se oprește la o alertă. Agronomul poate confirma sau respinge starea direct față de analiza specifică.",
      trustEyebrow: "Conceput pentru încredere",
      trustTitle: "Un sistem decizional, nu o cutie neagră.",
      deterministicTitle: "Logică deterministă",
      deterministicText: "Decision Engine lucrează cu factori expliciți și reguli versionate.",
      historyTitle: "Context istoric",
      historyText: "Analiza păstrează snapshotul datelor de intrare și rezultatul, astfel încât baza deciziei să poată fi urmărită ulterior.",
      validationTitle: "Validare agronomică",
      validationText: "Ground Truth conectează rezultatul digital cu starea reală observată în teren.",
      localContextTitle: "Context agronomic oficial",
      localContextText: "Catalogul de culturi și soiuri este conectat la date oficiale și la profilurile agronomice AEGRIS.",
      pilotEyebrow: "Pilot controlat 2026",
      pilotTitle: "Validați AEGRIS pe propriile parcele.",
      pilotDescription: "Pilotul este destinat exploatațiilor agricole reale care doresc să compare rezultatele analitice AEGRIS cu deciziile agronomului în teren.",
      systemOperations: "Operațiuni agronomice",
      satelliteLayer: "Strat satelitar",
      weatherContext: "Context meteo",
      currentForecast: "Actual + prognoză",
      weatherMeta: "Apă · temperatură · ET₀",
      decisionLayer: "Strat decizional",
      decisionMeta: "Scor · prioritate · recomandare",
      fieldFeedback: "Feedback din teren",
      fieldFeedbackMeta: "Cauză observată · validare", },
    hu: { openAegris:"AEGRIS megnyitása", signIn:"Bejelentkezés", pilotAccess:"Pilot hozzáférés", heroEyebrow:"Field Intelligence · Európai mezőgazdaság", heroTitle:"Területi adatok.", heroTitleAccent:"Döntések időben.", goToApp:"Tovább az alkalmazásba", requestPilot:"Pilot hozzáférés kérése", satellite:"Műhold", resolution:"Felbontás", decision:"Döntés", validation:"Validáció", monitor:"Monitorozás", evaluate:"Értékelés", prioritize:"Prioritás", validate:"Ellenőrzés", createAccount:"Fiók létrehozása", dataReady:"Adatok készen", decisionFlow:"Döntési folyamat", traceableOutput:"Visszakövethető eredmény", flowItems:["MONITOROZÁS","ÉRTÉKELÉS","PRIORITÁS","ELLENŐRZÉS"],
      heroDescription: "Az AEGRIS a műholdas megfigyelést, a meteorológiai adatokat, az agronómiai kontextust és a terepi validációt egyetlen operatív rendszerben kapcsolja össze a táblák állapotával kapcsolatos döntésekhez.",
      workflowEyebrow: "Agronómiai munkafolyamat",
      workflowTitle: "A jelzéstől az ellenőrzött döntésig.",
      workflowDescription: "Nem egy újabb elszigetelt grafikon. Az AEGRIS a rendelkezésre álló adatokat olyan munkafolyamatba rendezi, amelyben az agronómus látja, mi igényel figyelmet és miért.",
      monitorText: "A Sentinel-2 L2A követi a növényzet állapotát és a tábla történeti fejlődését.",
      evaluateText: "Az időjárási, talaj-, növény- és vegetációs adatok a determinisztikus Decision Engine bemenetei.",
      prioritizeText: "Az eredmény a tábla állapotát pontszámmá, prioritássá, riasztássá és konkrét ajánlássá alakítja.",
      validateText: "Az agronómus a terepen ellenőrzi a helyzetet, és az adott elemzéshez Ground Truth adatot ment.",
      oneFieldRecord: "Egy tábla egy nyilvántartásban",
      oneFieldTitle: "Egy tábla. Egy kontextus. Egy döntéstörténet.",
      oneFieldDescription: "A Field Health Record együtt tartja az aktuális állapotot, az adatforrásokat, az ajánlásokat, a riasztásokat és a terepi validációt.",
      fieldConditionContext: "A tábla állapota kontextusban",
      criticalPriority: "Kritikus prioritás",
      vegetationIndex: "Vegetációs index",
      contextScore: "Kontextuspontszám",
      dataConfidence: "Adatmegbízhatóság",
      validGeometry: "Érvényes geometria",
      decisionSequence: "Jelzés → kontextus → prioritás → ajánlás",
      decisionTraceText: "Az eredmény visszakövethető a konkrét elemzéshez és a bemeneti snapshothoz. A terepi ellenőrzés Ground Truthként kerül mentésre.",
      provenanceEyebrow: "Adatok eredete",
      provenanceTitle: "Visszakövethető elemzési eredet",
      provenanceText: "A forrás, az időpont, a térbeli lefedettség és a bemeneti adatok minősége az elemzési rekord része marad.",
      fieldValidationEyebrow: "Terepi validáció",
      fieldValidationTitle: "A terepi ellenőrzés zárja a visszacsatolási kört",
      fieldValidationText: "Az eredmény nem ér véget a riasztással. Az agronómus közvetlenül a konkrét elemzéshez viszonyítva erősítheti meg vagy vetheti el az állapotot.",
      trustEyebrow: "Bizalomra tervezve",
      trustTitle: "Döntési rendszer, nem fekete doboz.",
      deterministicTitle: "Determinisztikus logika",
      deterministicText: "A Decision Engine explicit tényezőkkel és verziózott szabályokkal működik.",
      historyTitle: "Történeti kontextus",
      historyText: "Az elemzés megőrzi a bemeneti snapshotot és az eredményt, így a döntés alapja utólag visszakövethető.",
      validationTitle: "Agronómiai validáció",
      validationText: "A Ground Truth összekapcsolja a digitális eredményt a terepen ténylegesen megfigyelt állapottal.",
      localContextTitle: "Hivatalos agronómiai kontextus",
      localContextText: "A növény- és fajtakatalógus hivatalos forrásadatokhoz és AEGRIS agronómiai profilokhoz kapcsolódik.",
      pilotEyebrow: "Ellenőrzött pilot 2026",
      pilotTitle: "Validálja az AEGRIS-t saját tábláin.",
      pilotDescription: "A pilot valós mezőgazdasági üzemek számára készült, amelyek össze szeretnék hasonlítani az AEGRIS elemzési eredményeit az agronómus terepi döntéseivel.",
      systemOperations: "Agronómiai műveletek",
      satelliteLayer: "Műholdas réteg",
      weatherContext: "Időjárási kontextus",
      currentForecast: "Aktuális + előrejelzés",
      weatherMeta: "Víz · hőmérséklet · ET₀",
      decisionLayer: "Döntési réteg",
      decisionMeta: "Pontszám · prioritás · ajánlás",
      fieldFeedback: "Terepi visszajelzés",
      fieldFeedbackMeta: "Megfigyelt ok · validáció", },
    uk: { openAegris:"Відкрити AEGRIS", signIn:"Увійти", pilotAccess:"Пілотний доступ", heroEyebrow:"Field Intelligence · Європейське сільське господарство", heroTitle:"Дані з поля.", heroTitleAccent:"Рішення вчасно.", goToApp:"Перейти до застосунку", requestPilot:"Запросити пілотний доступ", satellite:"Супутник", resolution:"Роздільна здатність", decision:"Рішення", validation:"Валідація", monitor:"Моніторинг", evaluate:"Оцінити", prioritize:"Пріоритезувати", validate:"Перевірити", createAccount:"Створити обліковий запис", dataReady:"Дані готові", decisionFlow:"Потік рішень", traceableOutput:"Відстежуваний результат", flowItems:["МОНІТОРИНГ","ОЦІНКА","ПРІОРИТЕТ","ПЕРЕВІРКА"],
      heroDescription: "AEGRIS поєднує супутниковий моніторинг, метеорологічні дані, агрономічний контекст і польову валідацію в єдиній операційній системі для прийняття рішень щодо стану полів.",
      workflowEyebrow: "Агрономічний робочий процес",
      workflowTitle: "Від сигналу до перевіреного рішення.",
      workflowDescription: "Не ще один ізольований графік. AEGRIS об’єднує доступні дані в робочий процес, у якому агроном бачить, що потребує уваги і чому.",
      monitorText: "Sentinel-2 L2A відстежує стан рослинності та історичний розвиток поля.",
      evaluateText: "Дані про погоду, ґрунт, культуру та рослинність надходять до детермінованого Decision Engine.",
      prioritizeText: "Результат перетворює стан поля на оцінку, пріоритет, попередження та конкретну рекомендацію.",
      validateText: "Агроном перевіряє ситуацію в полі та зберігає Ground Truth для конкретного аналізу.",
      oneFieldRecord: "Єдиний запис поля",
      oneFieldTitle: "Одне поле. Один контекст. Одна історія рішень.",
      oneFieldDescription: "Field Health Record зберігає разом поточний стан, джерела даних, рекомендації, попередження та польову валідацію.",
      fieldConditionContext: "Стан поля в контексті",
      criticalPriority: "Критичний пріоритет",
      vegetationIndex: "Індекс рослинності",
      contextScore: "Контекстна оцінка",
      dataConfidence: "Довіра до даних",
      validGeometry: "Коректна геометрія",
      decisionSequence: "Сигнал → контекст → пріоритет → рекомендація",
      decisionTraceText: "Результат можна простежити до конкретного аналізу та знімка вхідних даних. Польова перевірка зберігається як Ground Truth.",
      provenanceEyebrow: "Походження даних",
      provenanceTitle: "Простежуване походження аналізу",
      provenanceText: "Джерело, час, просторове покриття та якість вхідних даних залишаються частиною аналітичного запису.",
      fieldValidationEyebrow: "Польова валідація",
      fieldValidationTitle: "Польова перевірка замикає цикл",
      fieldValidationText: "Результат не закінчується попередженням. Агроном може підтвердити або відхилити стан безпосередньо щодо конкретного аналізу.",
      trustEyebrow: "Створено для довіри",
      trustTitle: "Система прийняття рішень, а не чорна скринька.",
      deterministicTitle: "Детермінована логіка",
      deterministicText: "Decision Engine працює з явними факторами та версійованими правилами.",
      historyTitle: "Історичний контекст",
      historyText: "Аналіз зберігає знімок вхідних даних і результат, щоб основу рішення можна було відстежити ретроспективно.",
      validationTitle: "Агрономічна валідація",
      validationText: "Ground Truth пов’язує цифровий результат із фактичним станом, спостереженим у полі.",
      localContextTitle: "Офіційний агрономічний контекст",
      localContextText: "Каталог культур і сортів пов’язаний з офіційними джерелами даних та агрономічними профілями AEGRIS.",
      pilotEyebrow: "Контрольований пілот 2026",
      pilotTitle: "Перевірте AEGRIS на власних полях.",
      pilotDescription: "Пілот призначений для реальних сільськогосподарських підприємств, які хочуть порівняти аналітичні результати AEGRIS з рішеннями агронома в полі.",
      systemOperations: "Агрономічні операції",
      satelliteLayer: "Супутниковий шар",
      weatherContext: "Погодний контекст",
      currentForecast: "Поточні дані + прогноз",
      weatherMeta: "Вода · температура · ET₀",
      decisionLayer: "Рівень рішень",
      decisionMeta: "Оцінка · пріоритет · рекомендація",
      fieldFeedback: "Польовий зворотний зв’язок",
      fieldFeedbackMeta: "Спостережена причина · валідація", },
    bg: { openAegris:"Отвори AEGRIS", signIn:"Вход", pilotAccess:"Пилотен достъп", heroEyebrow:"Field Intelligence · Европейско земеделие", heroTitle:"Данни от полето.", heroTitleAccent:"Решения навреме.", goToApp:"Към приложението", requestPilot:"Заяви пилотен достъп", satellite:"Сателит", resolution:"Резолюция", decision:"Решение", validation:"Валидация", monitor:"Наблюдение", evaluate:"Оценка", prioritize:"Приоритизиране", validate:"Проверка", createAccount:"Създай профил", dataReady:"Данните са готови", decisionFlow:"Поток на решенията", traceableOutput:"Проследим резултат", flowItems:["НАБЛЮДЕНИЕ","ОЦЕНКА","ПРИОРИТЕТ","ПРОВЕРКА"],
      heroDescription: "AEGRIS свързва сателитно наблюдение, метеорологични данни, агрономически контекст и полева валидация в една оперативна система за решения относно състоянието на полетата.",
      workflowEyebrow: "Агрономически работен процес",
      workflowTitle: "От сигнала до валидирано решение.",
      workflowDescription: "Не още една изолирана графика. AEGRIS обединява наличните данни в работен процес, в който агрономът вижда какво изисква внимание и защо.",
      monitorText: "Sentinel-2 L2A проследява състоянието на растителността и историческото развитие на полето.",
      evaluateText: "Данните за времето, почвата, културата и растителността постъпват в детерминирания Decision Engine.",
      prioritizeText: "Резултатът преобразува състоянието на полето в оценка, приоритет, предупреждение и конкретна препоръка.",
      validateText: "Агрономът проверява ситуацията на терен и записва Ground Truth към конкретния анализ.",
      oneFieldRecord: "Един запис за поле",
      oneFieldTitle: "Едно поле. Един контекст. Една история на решенията.",
      oneFieldDescription: "Field Health Record съхранява заедно текущото състояние, източниците на данни, препоръките, предупрежденията и полевата валидация.",
      fieldConditionContext: "Състояние на полето в контекст",
      criticalPriority: "Критичен приоритет",
      vegetationIndex: "Вегетационен индекс",
      contextScore: "Контекстна оценка",
      dataConfidence: "Надеждност на данните",
      validGeometry: "Валидна геометрия",
      decisionSequence: "Сигнал → контекст → приоритет → препоръка",
      decisionTraceText: "Резултатът е проследим до конкретния анализ и snapshot на входните данни. Полевата проверка се записва като Ground Truth.",
      provenanceEyebrow: "Произход на данните",
      provenanceTitle: "Проследим произход на анализа",
      provenanceText: "Източникът, времето, пространственото покритие и качеството на входните данни остават част от аналитичния запис.",
      fieldValidationEyebrow: "Полева валидация",
      fieldValidationTitle: "Полевата проверка затваря цикъла",
      fieldValidationText: "Резултатът не приключва с предупреждение. Агрономът може да потвърди или отхвърли състоянието директно спрямо конкретния анализ.",
      trustEyebrow: "Проектирано за доверие",
      trustTitle: "Система за решения, а не черна кутия.",
      deterministicTitle: "Детерминирана логика",
      deterministicText: "Decision Engine работи с явни фактори и версионирани правила.",
      historyTitle: "Исторически контекст",
      historyText: "Анализът съхранява snapshot на входните данни и резултата, така че основата на решението да може да бъде проследена впоследствие.",
      validationTitle: "Агрономическа валидация",
      validationText: "Ground Truth свързва цифровия резултат с действителното състояние, наблюдавано на терен.",
      localContextTitle: "Официален агрономически контекст",
      localContextText: "Каталогът на културите и сортовете е свързан с официални източници на данни и агрономически профили на AEGRIS.",
      pilotEyebrow: "Контролиран пилот 2026",
      pilotTitle: "Валидирайте AEGRIS на собствените си полета.",
      pilotDescription: "Пилотът е предназначен за реални земеделски предприятия, които искат да сравнят аналитичните резултати на AEGRIS с решенията на агронома на терен.",
      systemOperations: "Агрономически операции",
      satelliteLayer: "Сателитен слой",
      weatherContext: "Метеорологичен контекст",
      currentForecast: "Текущо + прогноза",
      weatherMeta: "Вода · температура · ET₀",
      decisionLayer: "Слой за решения",
      decisionMeta: "Оценка · приоритет · препоръка",
      fieldFeedback: "Обратна връзка от терена",
      fieldFeedbackMeta: "Наблюдавана причина · валидация", },
    hr: { openAegris:"Otvori AEGRIS", signIn:"Prijava", pilotAccess:"Pilot pristup", heroEyebrow:"Field Intelligence · Europska poljoprivreda", heroTitle:"Podaci s polja.", heroTitleAccent:"Odluke na vrijeme.", goToApp:"Idi u aplikaciju", requestPilot:"Zatraži pilot pristup", satellite:"Satelit", resolution:"Rezolucija", decision:"Odluka", validation:"Validacija", monitor:"Prati", evaluate:"Procijeni", prioritize:"Odredi prioritet", validate:"Potvrdi", createAccount:"Izradi račun", dataReady:"Podaci spremni", decisionFlow:"Tijek odluke", traceableOutput:"Sljediv rezultat", flowItems:["PRATI","PROCIJENI","PRIORITET","POTVRDI"],
      heroDescription: "AEGRIS povezuje satelitsko praćenje, meteorološke podatke, agronomski kontekst i terensku validaciju u jedinstven operativni sustav za odluke o stanju parcela.",
      workflowEyebrow: "Agronomski tijek rada",
      workflowTitle: "Od signala do potvrđene odluke.",
      workflowDescription: "Ne još jedan izolirani grafikon. AEGRIS povezuje dostupne podatke u tijek rada u kojem agronom vidi što zahtijeva pažnju i zašto.",
      monitorText: "Sentinel-2 L2A prati stanje vegetacije i povijesni razvoj parcele.",
      evaluateText: "Podaci o vremenu, tlu, usjevu i vegetaciji ulaze u deterministički Decision Engine.",
      prioritizeText: "Rezultat pretvara stanje parcele u ocjenu, prioritet, upozorenje i konkretnu preporuku.",
      validateText: "Agronom provjerava situaciju na terenu i sprema Ground Truth uz konkretnu analizu.",
      oneFieldRecord: "Jedan zapis parcele",
      oneFieldTitle: "Jedna parcela. Jedan kontekst. Jedna povijest odluka.",
      oneFieldDescription: "Field Health Record drži na jednom mjestu trenutačno stanje, izvore podataka, preporuke, upozorenja i terensku validaciju.",
      fieldConditionContext: "Stanje parcele u kontekstu",
      criticalPriority: "Kritični prioritet",
      vegetationIndex: "Vegetacijski indeks",
      contextScore: "Kontekstualna ocjena",
      dataConfidence: "Pouzdanost podataka",
      validGeometry: "Valjana geometrija",
      decisionSequence: "Signal → kontekst → prioritet → preporuka",
      decisionTraceText: "Rezultat je sljediv do konkretne analize i snapshota ulaznih podataka. Terenska provjera sprema se kao Ground Truth.",
      provenanceEyebrow: "Podrijetlo podataka",
      provenanceTitle: "Sljedivo podrijetlo analize",
      provenanceText: "Izvor, vrijeme, prostorna pokrivenost i kvaliteta ulaznih podataka ostaju dio analitičkog zapisa.",
      fieldValidationEyebrow: "Terenska validacija",
      fieldValidationTitle: "Terenska provjera zatvara krug",
      fieldValidationText: "Rezultat ne završava upozorenjem. Agronom može potvrditi ili odbaciti stanje izravno u odnosu na konkretnu analizu.",
      trustEyebrow: "Dizajnirano za povjerenje",
      trustTitle: "Sustav za odlučivanje, a ne crna kutija.",
      deterministicTitle: "Deterministička logika",
      deterministicText: "Decision Engine radi s eksplicitnim čimbenicima i verzioniranim pravilima.",
      historyTitle: "Povijesni kontekst",
      historyText: "Analiza čuva snapshot ulaznih podataka i rezultat kako bi se naknadno mogla pratiti osnova odluke.",
      validationTitle: "Agronomska validacija",
      validationText: "Ground Truth povezuje digitalni rezultat sa stvarnim stanjem opaženim na terenu.",
      localContextTitle: "Službeni agronomski kontekst",
      localContextText: "Katalog kultura i sorti povezan je sa službenim izvornim podacima i agronomskim profilima AEGRIS-a.",
      pilotEyebrow: "Kontrolirani pilot 2026",
      pilotTitle: "Validirajte AEGRIS na vlastitim parcelama.",
      pilotDescription: "Pilot je namijenjen stvarnim poljoprivrednim gospodarstvima koja žele usporediti analitičke rezultate AEGRIS-a s odlukama agronoma na terenu.",
      systemOperations: "Agronomske operacije",
      satelliteLayer: "Satelitski sloj",
      weatherContext: "Vremenski kontekst",
      currentForecast: "Trenutačno + prognoza",
      weatherMeta: "Voda · temperatura · ET₀",
      decisionLayer: "Sloj odlučivanja",
      decisionMeta: "Ocjena · prioritet · preporuka",
      fieldFeedback: "Povratna informacija s terena",
      fieldFeedbackMeta: "Uočeni uzrok · validacija", },
    sl: { openAegris:"Odpri AEGRIS", signIn:"Prijava", pilotAccess:"Pilotni dostop", heroEyebrow:"Field Intelligence · Evropsko kmetijstvo", heroTitle:"Podatki s polja.", heroTitleAccent:"Odločitve pravočasno.", goToApp:"V aplikacijo", requestPilot:"Zahtevaj pilotni dostop", satellite:"Satelit", resolution:"Ločljivost", decision:"Odločitev", validation:"Validacija", monitor:"Spremljaj", evaluate:"Ovrednoti", prioritize:"Določi prednost", validate:"Potrdi", createAccount:"Ustvari račun", dataReady:"Podatki pripravljeni", decisionFlow:"Tok odločanja", traceableOutput:"Sledljiv rezultat", flowItems:["SPREMLJAJ","OVREDNOTI","PREDNOST","POTRDI"],
      heroDescription: "AEGRIS povezuje satelitsko spremljanje, meteorološke podatke, agronomski kontekst in terensko validacijo v enoten operativni sistem za odločanje o stanju njiv.",
      workflowEyebrow: "Agronomski delovni tok",
      workflowTitle: "Od signala do potrjene odločitve.",
      workflowDescription: "Ne še en izoliran graf. AEGRIS združuje razpoložljive podatke v delovni tok, v katerem agronom vidi, kaj zahteva pozornost in zakaj.",
      monitorText: "Sentinel-2 L2A spremlja stanje vegetacije in zgodovinski razvoj njive.",
      evaluateText: "Podatki o vremenu, tleh, posevku in vegetaciji vstopajo v deterministični Decision Engine.",
      prioritizeText: "Rezultat pretvori stanje njive v oceno, prednost, opozorilo in konkretno priporočilo.",
      validateText: "Agronom preveri stanje na terenu in shrani Ground Truth za konkretno analizo.",
      oneFieldRecord: "En zapis njive",
      oneFieldTitle: "Ena njiva. En kontekst. Ena zgodovina odločitev.",
      oneFieldDescription: "Field Health Record na enem mestu združuje trenutno stanje, vire podatkov, priporočila, opozorila in terensko validacijo.",
      fieldConditionContext: "Stanje njive v kontekstu",
      criticalPriority: "Kritična prednost",
      vegetationIndex: "Vegetacijski indeks",
      contextScore: "Kontekstna ocena",
      dataConfidence: "Zanesljivost podatkov",
      validGeometry: "Veljavna geometrija",
      decisionSequence: "Signal → kontekst → prednost → priporočilo",
      decisionTraceText: "Rezultat je sledljiv do konkretne analize in posnetka vhodnih podatkov. Terensko preverjanje se shrani kot Ground Truth.",
      provenanceEyebrow: "Izvor podatkov",
      provenanceTitle: "Sledljiv izvor analize",
      provenanceText: "Vir, čas, prostorska pokritost in kakovost vhodnih podatkov ostanejo del analitičnega zapisa.",
      fieldValidationEyebrow: "Terenska validacija",
      fieldValidationTitle: "Terensko preverjanje sklene zanko",
      fieldValidationText: "Rezultat se ne konča z opozorilom. Agronom lahko stanje potrdi ali zavrne neposredno glede na konkretno analizo.",
      trustEyebrow: "Zasnovano za zaupanje",
      trustTitle: "Sistem za odločanje, ne črna skrinjica.",
      deterministicTitle: "Deterministična logika",
      deterministicText: "Decision Engine deluje z eksplicitnimi dejavniki in verzioniranimi pravili.",
      historyTitle: "Zgodovinski kontekst",
      historyText: "Analiza hrani posnetek vhodnih podatkov in rezultat, da je mogoče pozneje slediti podlagi odločitve.",
      validationTitle: "Agronomska validacija",
      validationText: "Ground Truth povezuje digitalni rezultat z dejanskim stanjem, opaženim na terenu.",
      localContextTitle: "Uradni agronomski kontekst",
      localContextText: "Katalog poljščin in sort je povezan z uradnimi izvornimi podatki in agronomskimi profili AEGRIS.",
      pilotEyebrow: "Nadzorovani pilot 2026",
      pilotTitle: "Validirajte AEGRIS na svojih njivah.",
      pilotDescription: "Pilot je namenjen dejanskim kmetijskim gospodarstvom, ki želijo primerjati analitične rezultate AEGRIS z odločitvami agronoma na terenu.",
      systemOperations: "Agronomske operacije",
      satelliteLayer: "Satelitski sloj",
      weatherContext: "Vremenski kontekst",
      currentForecast: "Trenutno + napoved",
      weatherMeta: "Voda · temperatura · ET₀",
      decisionLayer: "Odločitveni sloj",
      decisionMeta: "Ocena · prednost · priporočilo",
      fieldFeedback: "Povratne informacije s terena",
      fieldFeedbackMeta: "Opaženi vzrok · validacija", },
    lt: { openAegris:"Atidaryti AEGRIS", signIn:"Prisijungti", pilotAccess:"Bandomoji prieiga", heroEyebrow:"Field Intelligence · Europos žemės ūkis", heroTitle:"Lauko duomenys.", heroTitleAccent:"Sprendimai laiku.", goToApp:"Eiti į programą", requestPilot:"Prašyti bandomosios prieigos", satellite:"Palydovas", resolution:"Skiriamoji geba", decision:"Sprendimas", validation:"Patvirtinimas", monitor:"Stebėti", evaluate:"Įvertinti", prioritize:"Nustatyti prioritetą", validate:"Patvirtinti", createAccount:"Sukurti paskyrą", dataReady:"Duomenys paruošti", decisionFlow:"Sprendimų eiga", traceableOutput:"Atsekamas rezultatas", flowItems:["STEBĖTI","ĮVERTINTI","PRIORITETAS","PATVIRTINTI"],
      heroDescription: "AEGRIS sujungia palydovinę stebėseną, meteorologinius duomenis, agronominį kontekstą ir patikrą lauke į vieną operacinę sistemą sprendimams dėl laukų būklės.",
      workflowEyebrow: "Agronominis darbo procesas",
      workflowTitle: "Nuo signalo iki patvirtinto sprendimo.",
      workflowDescription: "Ne dar viena atskira diagrama. AEGRIS sujungia turimus duomenis į darbo procesą, kuriame agronomas mato, kam reikia dėmesio ir kodėl.",
      monitorText: "Sentinel-2 L2A stebi augalijos būklę ir istorinę lauko raidą.",
      evaluateText: "Orų, dirvožemio, pasėlio ir augalijos duomenys patenka į deterministinį Decision Engine.",
      prioritizeText: "Rezultatas paverčia lauko būklę balu, prioritetu, įspėjimu ir konkrečia rekomendacija.",
      validateText: "Agronomas patikrina situaciją lauke ir išsaugo Ground Truth konkrečiai analizei.",
      oneFieldRecord: "Vienas lauko įrašas",
      oneFieldTitle: "Vienas laukas. Vienas kontekstas. Viena sprendimų istorija.",
      oneFieldDescription: "Field Health Record vienoje vietoje saugo dabartinę būklę, duomenų šaltinius, rekomendacijas, įspėjimus ir patikrą lauke.",
      fieldConditionContext: "Lauko būklė kontekste",
      criticalPriority: "Kritinis prioritetas",
      vegetationIndex: "Augalijos indeksas",
      contextScore: "Konteksto balas",
      dataConfidence: "Duomenų patikimumas",
      validGeometry: "Tinkama geometrija",
      decisionSequence: "Signalas → kontekstas → prioritetas → rekomendacija",
      decisionTraceText: "Rezultatą galima atsekti iki konkrečios analizės ir įvesties duomenų momentinės kopijos. Patikra lauke išsaugoma kaip Ground Truth.",
      provenanceEyebrow: "Duomenų kilmė",
      provenanceTitle: "Atsekama analizės kilmė",
      provenanceText: "Šaltinis, laikas, erdvinė aprėptis ir įvesties duomenų kokybė lieka analitinio įrašo dalimi.",
      fieldValidationEyebrow: "Patikra lauke",
      fieldValidationTitle: "Patikra lauke uždaro ciklą",
      fieldValidationText: "Rezultatas nesibaigia įspėjimu. Agronomas gali patvirtinti arba atmesti būklę tiesiogiai konkrečios analizės atžvilgiu.",
      trustEyebrow: "Sukurta pasitikėjimui",
      trustTitle: "Sprendimų sistema, o ne juodoji dėžė.",
      deterministicTitle: "Deterministinė logika",
      deterministicText: "Decision Engine veikia pagal aiškius veiksnius ir versijuojamas taisykles.",
      historyTitle: "Istorinis kontekstas",
      historyText: "Analizė išsaugo įvesties duomenų momentinę kopiją ir rezultatą, kad vėliau būtų galima atsekti sprendimo pagrindą.",
      validationTitle: "Agronominė validacija",
      validationText: "Ground Truth susieja skaitmeninį rezultatą su faktine lauke stebėta būkle.",
      localContextTitle: "Oficialus agronominis kontekstas",
      localContextText: "Kultūrų ir veislių katalogas susietas su oficialiais šaltinių duomenimis ir AEGRIS agronominiais profiliais.",
      pilotEyebrow: "Kontroliuojamas pilotas 2026",
      pilotTitle: "Patikrinkite AEGRIS savo laukuose.",
      pilotDescription: "Pilotas skirtas realiems žemės ūkio ūkiams, norintiems palyginti AEGRIS analitinius rezultatus su agronomo sprendimais lauke.",
      systemOperations: "Agronominės operacijos",
      satelliteLayer: "Palydovinis sluoksnis",
      weatherContext: "Orų kontekstas",
      currentForecast: "Dabar + prognozė",
      weatherMeta: "Vanduo · temperatūra · ET₀",
      decisionLayer: "Sprendimų sluoksnis",
      decisionMeta: "Balas · prioritetas · rekomendacija",
      fieldFeedback: "Lauko grįžtamasis ryšys",
      fieldFeedbackMeta: "Stebėta priežastis · validacija", },
    lv: { openAegris:"Atvērt AEGRIS", signIn:"Pieteikties", pilotAccess:"Pilotpiekļuve", heroEyebrow:"Field Intelligence · Eiropas lauksaimniecība", heroTitle:"Lauka dati.", heroTitleAccent:"Lēmumi laikus.", goToApp:"Doties uz lietotni", requestPilot:"Pieprasīt pilotpiekļuvi", satellite:"Satelīts", resolution:"Izšķirtspēja", decision:"Lēmums", validation:"Validācija", monitor:"Uzraudzīt", evaluate:"Novērtēt", prioritize:"Noteikt prioritāti", validate:"Pārbaudīt", createAccount:"Izveidot kontu", dataReady:"Dati gatavi", decisionFlow:"Lēmumu plūsma", traceableOutput:"Izsekojams rezultāts", flowItems:["UZRAUDZĪT","NOVĒRTĒT","PRIORITĀTE","PĀRBAUDĪT"],
      heroDescription: "AEGRIS apvieno satelītu monitoringu, meteoroloģiskos datus, agronomisko kontekstu un lauka validāciju vienā operatīvā sistēmā lēmumiem par lauku stāvokli.",
      workflowEyebrow: "Agronomiskais darbplūsmas process",
      workflowTitle: "No signāla līdz validētam lēmumam.",
      workflowDescription: "Ne vēl viena izolēta diagramma. AEGRIS apvieno pieejamos datus darbplūsmā, kur agronoms redz, kam jāpievērš uzmanība un kāpēc.",
      monitorText: "Sentinel-2 L2A seko veģetācijas stāvoklim un lauka vēsturiskajai attīstībai.",
      evaluateText: "Laikapstākļu, augsnes, kultūrauga un veģetācijas dati nonāk deterministiskajā Decision Engine.",
      prioritizeText: "Rezultāts pārvērš lauka stāvokli vērtējumā, prioritātē, brīdinājumā un konkrētā ieteikumā.",
      validateText: "Agronoms pārbauda situāciju laukā un saglabā Ground Truth konkrētajai analīzei.",
      oneFieldRecord: "Viens lauka ieraksts",
      oneFieldTitle: "Viens lauks. Viens konteksts. Viena lēmumu vēsture.",
      oneFieldDescription: "Field Health Record vienuviet glabā pašreizējo stāvokli, datu avotus, ieteikumus, brīdinājumus un lauka validāciju.",
      fieldConditionContext: "Lauka stāvoklis kontekstā",
      criticalPriority: "Kritiska prioritāte",
      vegetationIndex: "Veģetācijas indekss",
      contextScore: "Konteksta vērtējums",
      dataConfidence: "Datu uzticamība",
      validGeometry: "Derīga ģeometrija",
      decisionSequence: "Signāls → konteksts → prioritāte → ieteikums",
      decisionTraceText: "Rezultāts ir izsekojams līdz konkrētajai analīzei un ievades datu momentuzņēmumam. Lauka pārbaude tiek saglabāta kā Ground Truth.",
      provenanceEyebrow: "Datu izcelsme",
      provenanceTitle: "Izsekojama analīzes izcelsme",
      provenanceText: "Avots, laiks, telpiskais pārklājums un ievades datu kvalitāte paliek analītiskā ieraksta sastāvdaļa.",
      fieldValidationEyebrow: "Lauka validācija",
      fieldValidationTitle: "Lauka pārbaude noslēdz ciklu",
      fieldValidationText: "Rezultāts nebeidzas ar brīdinājumu. Agronoms var apstiprināt vai noraidīt stāvokli tieši attiecībā pret konkrēto analīzi.",
      trustEyebrow: "Izstrādāts uzticībai",
      trustTitle: "Lēmumu sistēma, nevis melnā kaste.",
      deterministicTitle: "Deterministiska loģika",
      deterministicText: "Decision Engine darbojas ar skaidri definētiem faktoriem un versijotām kārtulām.",
      historyTitle: "Vēsturiskais konteksts",
      historyText: "Analīze saglabā ievades datu momentuzņēmumu un rezultātu, lai vēlāk varētu izsekot lēmuma pamatojumam.",
      validationTitle: "Agronomiskā validācija",
      validationText: "Ground Truth savieno digitālo rezultātu ar faktisko laukā novēroto stāvokli.",
      localContextTitle: "Oficiālais agronomiskais konteksts",
      localContextText: "Kultūraugu un šķirņu katalogs ir saistīts ar oficiālajiem avota datiem un AEGRIS agronomiskajiem profiliem.",
      pilotEyebrow: "Kontrolēts pilots 2026",
      pilotTitle: "Validējiet AEGRIS savos laukos.",
      pilotDescription: "Pilots paredzēts reāliem lauksaimniecības uzņēmumiem, kas vēlas salīdzināt AEGRIS analītiskos rezultātus ar agronoma lēmumiem laukā.",
      systemOperations: "Agronomiskās operācijas",
      satelliteLayer: "Satelīta slānis",
      weatherContext: "Laikapstākļu konteksts",
      currentForecast: "Pašreizējais + prognoze",
      weatherMeta: "Ūdens · temperatūra · ET₀",
      decisionLayer: "Lēmumu slānis",
      decisionMeta: "Vērtējums · prioritāte · ieteikums",
      fieldFeedback: "Lauka atgriezeniskā saite",
      fieldFeedbackMeta: "Novērotais cēlonis · validācija", },
    et: { openAegris:"Ava AEGRIS", signIn:"Logi sisse", pilotAccess:"Pilootjuurdepääs", heroEyebrow:"Field Intelligence · Euroopa põllumajandus", heroTitle:"Põlluandmed.", heroTitleAccent:"Otsused õigel ajal.", goToApp:"Ava rakendus", requestPilot:"Taotle pilootjuurdepääsu", satellite:"Satelliit", resolution:"Lahutus", decision:"Otsus", validation:"Valideerimine", monitor:"Jälgi", evaluate:"Hinda", prioritize:"Sea prioriteet", validate:"Valideeri", createAccount:"Loo konto", dataReady:"Andmed valmis", decisionFlow:"Otsustusvoog", traceableOutput:"Jälgitav tulemus", flowItems:["JÄLGI","HINDA","PRIORITEET","VALIDEERI"],
      heroDescription: "AEGRIS ühendab satelliitseire, meteoroloogilised andmed, agronoomilise konteksti ja põllukontrolli üheks operatiivseks süsteemiks põldude seisundit puudutavate otsuste tegemiseks.",
      workflowEyebrow: "Agronoomiline töövoog",
      workflowTitle: "Signaalist valideeritud otsuseni.",
      workflowDescription: "Mitte järjekordne eraldiseisev graafik. AEGRIS ühendab olemasolevad andmed töövooks, kus agronoom näeb, mis vajab tähelepanu ja miks.",
      monitorText: "Sentinel-2 L2A jälgib taimkatte seisundit ja põllu ajaloolist arengut.",
      evaluateText: "Ilma-, mulla-, kultuuri- ja taimkatteandmed sisenevad deterministlikku Decision Engine'isse.",
      prioritizeText: "Tulemus teisendab põllu seisundi skooriks, prioriteediks, hoiatuseks ja konkreetseks soovituseks.",
      validateText: "Agronoom kontrollib olukorda põllul ja salvestab konkreetse analüüsi juurde Ground Truthi.",
      oneFieldRecord: "Üks põllukirje",
      oneFieldTitle: "Üks põld. Üks kontekst. Üks otsuste ajalugu.",
      oneFieldDescription: "Field Health Record hoiab koos hetkeolukorra, andmeallikad, soovitused, hoiatused ja põllukontrolli.",
      fieldConditionContext: "Põllu seisund kontekstis",
      criticalPriority: "Kriitiline prioriteet",
      vegetationIndex: "Taimkatte indeks",
      contextScore: "Kontekstiskoor",
      dataConfidence: "Andmete usaldusväärsus",
      validGeometry: "Kehtiv geomeetria",
      decisionSequence: "Signaal → kontekst → prioriteet → soovitus",
      decisionTraceText: "Tulemus on jälgitav konkreetse analüüsi ja sisendandmete hetktõmmiseni. Põllukontroll salvestatakse Ground Truthina.",
      provenanceEyebrow: "Andmete päritolu",
      provenanceTitle: "Jälgitav analüüsi päritolu",
      provenanceText: "Allikas, aeg, ruumiline katvus ja sisendandmete kvaliteet jäävad analüütilise kirje osaks.",
      fieldValidationEyebrow: "Põllukontroll",
      fieldValidationTitle: "Põllukontroll sulgeb tagasisideahela",
      fieldValidationText: "Tulemus ei lõpe hoiatusega. Agronoom saab seisundi konkreetse analüüsi suhtes otse kinnitada või ümber lükata.",
      trustEyebrow: "Loodud usalduseks",
      trustTitle: "Otsustussüsteem, mitte must kast.",
      deterministicTitle: "Deterministlik loogika",
      deterministicText: "Decision Engine töötab selgelt määratletud tegurite ja versioonitud reeglitega.",
      historyTitle: "Ajalooline kontekst",
      historyText: "Analüüs säilitab sisendandmete hetktõmmise ja tulemuse, et otsuse alust saaks hiljem jälgida.",
      validationTitle: "Agronoomiline valideerimine",
      validationText: "Ground Truth seob digitaalse tulemuse põllul tegelikult täheldatud seisundiga.",
      localContextTitle: "Ametlik agronoomiline kontekst",
      localContextText: "Kultuuride ja sortide kataloog on seotud ametlike lähteandmete ning AEGRIS-e agronoomiliste profiilidega.",
      pilotEyebrow: "Kontrollitud piloot 2026",
      pilotTitle: "Valideerige AEGRIS oma põldudel.",
      pilotDescription: "Piloot on mõeldud tegelikele põllumajandusettevõtetele, kes soovivad võrrelda AEGRIS-e analüütilisi tulemusi agronoomi põlluotsustega.",
      systemOperations: "Agronoomilised operatsioonid",
      satelliteLayer: "Satelliidikiht",
      weatherContext: "Ilmakontekst",
      currentForecast: "Praegune + prognoos",
      weatherMeta: "Vesi · temperatuur · ET₀",
      decisionLayer: "Otsustuskiht",
      decisionMeta: "Skoor · prioriteet · soovitus",
      fieldFeedback: "Tagasiside põllult",
      fieldFeedbackMeta: "Täheldatud põhjus · valideerimine", },
    el: { openAegris:"Άνοιγμα AEGRIS", signIn:"Σύνδεση", pilotAccess:"Πιλοτική πρόσβαση", heroEyebrow:"Field Intelligence · Ευρωπαϊκή γεωργία", heroTitle:"Δεδομένα αγρού.", heroTitleAccent:"Αποφάσεις στην ώρα τους.", goToApp:"Μετάβαση στην εφαρμογή", requestPilot:"Αίτημα πιλοτικής πρόσβασης", satellite:"Δορυφόρος", resolution:"Ανάλυση", decision:"Απόφαση", validation:"Επικύρωση", monitor:"Παρακολούθηση", evaluate:"Αξιολόγηση", prioritize:"Προτεραιοποίηση", validate:"Επικύρωση", createAccount:"Δημιουργία λογαριασμού", dataReady:"Τα δεδομένα είναι έτοιμα", decisionFlow:"Ροή αποφάσεων", traceableOutput:"Ιχνηλάσιμο αποτέλεσμα", flowItems:["ΠΑΡΑΚΟΛΟΥΘΗΣΗ","ΑΞΙΟΛΟΓΗΣΗ","ΠΡΟΤΕΡΑΙΟΤΗΤΑ","ΕΠΙΚΥΡΩΣΗ"],
      heroDescription: "Το AEGRIS συνδέει δορυφορική παρακολούθηση, μετεωρολογικά δεδομένα, αγρονομικό πλαίσιο και επιτόπια επικύρωση σε ένα ενιαίο λειτουργικό σύστημα για αποφάσεις σχετικά με την κατάσταση των αγρών.",
      workflowEyebrow: "Αγρονομική ροή εργασίας",
      workflowTitle: "Από το σήμα σε μια επικυρωμένη απόφαση.",
      workflowDescription: "Όχι άλλο ένα απομονωμένο γράφημα. Το AEGRIS συνδυάζει τις διαθέσιμες εισροές σε μια ροή εργασίας όπου ο γεωπόνος βλέπει τι απαιτεί προσοχή και γιατί.",
      monitorText: "Το Sentinel-2 L2A παρακολουθεί την κατάσταση της βλάστησης και την ιστορική εξέλιξη του αγρού.",
      evaluateText: "Δεδομένα καιρού, εδάφους, καλλιέργειας και βλάστησης εισέρχονται στο ντετερμινιστικό Decision Engine.",
      prioritizeText: "Το αποτέλεσμα μετατρέπει την κατάσταση του αγρού σε βαθμολογία, προτεραιότητα, ειδοποίηση και συγκεκριμένη σύσταση.",
      validateText: "Ο γεωπόνος επαληθεύει την κατάσταση στο πεδίο και αποθηκεύει Ground Truth για τη συγκεκριμένη ανάλυση.",
      oneFieldRecord: "Μία εγγραφή ανά αγρό",
      oneFieldTitle: "Ένας αγρός. Ένα πλαίσιο. Ένα ιστορικό αποφάσεων.",
      oneFieldDescription: "Το Field Health Record διατηρεί μαζί την τρέχουσα κατάσταση, τις πηγές δεδομένων, τις συστάσεις, τις ειδοποιήσεις και την επιτόπια επικύρωση.",
      fieldConditionContext: "Κατάσταση αγρού σε πλαίσιο",
      criticalPriority: "Κρίσιμη προτεραιότητα",
      vegetationIndex: "Δείκτης βλάστησης",
      contextScore: "Βαθμολογία πλαισίου",
      dataConfidence: "Αξιοπιστία δεδομένων",
      validGeometry: "Έγκυρη γεωμετρία",
      decisionSequence: "Σήμα → πλαίσιο → προτεραιότητα → σύσταση",
      decisionTraceText: "Το αποτέλεσμα είναι ανιχνεύσιμο έως τη συγκεκριμένη ανάλυση και το στιγμιότυπο εισόδου. Η επιτόπια επαλήθευση αποθηκεύεται ως Ground Truth.",
      provenanceEyebrow: "Προέλευση δεδομένων",
      provenanceTitle: "Ανιχνεύσιμη προέλευση ανάλυσης",
      provenanceText: "Η πηγή, ο χρόνος, η χωρική κάλυψη και η ποιότητα των εισόδων παραμένουν μέρος της αναλυτικής εγγραφής.",
      fieldValidationEyebrow: "Επιτόπια επικύρωση",
      fieldValidationTitle: "Η επιτόπια επαλήθευση κλείνει τον κύκλο",
      fieldValidationText: "Το αποτέλεσμα δεν τελειώνει σε μια ειδοποίηση. Ο γεωπόνος μπορεί να επιβεβαιώσει ή να απορρίψει την κατάσταση απευθείας σε σχέση με τη συγκεκριμένη ανάλυση.",
      trustEyebrow: "Σχεδιασμένο για εμπιστοσύνη",
      trustTitle: "Σύστημα αποφάσεων, όχι μαύρο κουτί.",
      deterministicTitle: "Ντετερμινιστική λογική",
      deterministicText: "Το Decision Engine λειτουργεί με ρητούς παράγοντες και εκδόσεις κανόνων.",
      historyTitle: "Ιστορικό πλαίσιο",
      historyText: "Η ανάλυση διατηρεί το στιγμιότυπο εισόδου και το αποτέλεσμα, ώστε η βάση μιας απόφασης να μπορεί να ανιχνευθεί εκ των υστέρων.",
      validationTitle: "Αγρονομική επικύρωση",
      validationText: "Το Ground Truth συνδέει το ψηφιακό αποτέλεσμα με την πραγματική κατάσταση που παρατηρήθηκε στο πεδίο.",
      localContextTitle: "Επίσημο αγρονομικό πλαίσιο",
      localContextText: "Ο κατάλογος καλλιεργειών και ποικιλιών συνδέεται με επίσημα δεδομένα πηγής και αγρονομικά προφίλ AEGRIS.",
      pilotEyebrow: "Ελεγχόμενο πιλοτικό πρόγραμμα 2026",
      pilotTitle: "Επικυρώστε το AEGRIS στους δικούς σας αγρούς.",
      pilotDescription: "Το πιλοτικό πρόγραμμα απευθύνεται σε πραγματικές γεωργικές επιχειρήσεις που θέλουν να συγκρίνουν τα αναλυτικά αποτελέσματα του AEGRIS με τις αποφάσεις του γεωπόνου στο πεδίο.",
      systemOperations: "Αγρονομικές λειτουργίες",
      satelliteLayer: "Δορυφορικό επίπεδο",
      weatherContext: "Μετεωρολογικό πλαίσιο",
      currentForecast: "Τρέχον + πρόγνωση",
      weatherMeta: "Νερό · θερμοκρασία · ET₀",
      decisionLayer: "Επίπεδο αποφάσεων",
      decisionMeta: "Βαθμολογία · προτεραιότητα · σύσταση",
      fieldFeedback: "Ανατροφοδότηση πεδίου",
      fieldFeedbackMeta: "Παρατηρούμενη αιτία · επικύρωση", },
    sv: { openAegris:"Öppna AEGRIS", signIn:"Logga in", pilotAccess:"Pilotåtkomst", heroEyebrow:"Field Intelligence · Europeiskt jordbruk", heroTitle:"Fältdata.", heroTitleAccent:"Beslut i rätt tid.", goToApp:"Gå till applikationen", requestPilot:"Begär pilotåtkomst", satellite:"Satellit", resolution:"Upplösning", decision:"Beslut", validation:"Validering", monitor:"Övervaka", evaluate:"Utvärdera", prioritize:"Prioritera", validate:"Validera", createAccount:"Skapa konto", dataReady:"Data klara", decisionFlow:"Beslutsflöde", traceableOutput:"Spårbart resultat", flowItems:["ÖVERVAKA","UTVÄRDERA","PRIORITERA","VALIDERA"],
      heroDescription: "AEGRIS kopplar samman satellitövervakning, meteorologiska data, agronomisk kontext och fältvalidering i ett operativt system för beslut om fältens tillstånd.",
      workflowEyebrow: "Agronomiskt arbetsflöde",
      workflowTitle: "Från signal till validerat beslut.",
      workflowDescription: "Inte ännu ett isolerat diagram. AEGRIS kombinerar tillgängliga data i ett arbetsflöde där agronomen ser vad som kräver uppmärksamhet och varför.",
      monitorText: "Sentinel-2 L2A följer vegetationens tillstånd och fältets historiska utveckling.",
      evaluateText: "Väder-, jord-, gröd- och vegetationsdata går in i den deterministiska Decision Engine.",
      prioritizeText: "Resultatet omvandlar fältets tillstånd till poäng, prioritet, varning och konkret rekommendation.",
      validateText: "Agronomen verifierar situationen i fält och sparar Ground Truth för den specifika analysen.",
      oneFieldRecord: "En fältpost",
      oneFieldTitle: "Ett fält. En kontext. En beslutshistorik.",
      oneFieldDescription: "Field Health Record håller samman aktuellt tillstånd, datakällor, rekommendationer, varningar och fältvalidering.",
      fieldConditionContext: "Fältets tillstånd i kontext",
      criticalPriority: "Kritisk prioritet",
      vegetationIndex: "Vegetationsindex",
      contextScore: "Kontextpoäng",
      dataConfidence: "Datatillförlitlighet",
      validGeometry: "Giltig geometri",
      decisionSequence: "Signal → kontext → prioritet → rekommendation",
      decisionTraceText: "Resultatet kan spåras till den specifika analysen och indatasnapshoten. Fältverifieringen sparas som Ground Truth.",
      provenanceEyebrow: "Dataproveniens",
      provenanceTitle: "Spårbar analysproveniens",
      provenanceText: "Källa, tidpunkt, rumslig täckning och kvalitet på indata förblir en del av analysregistret.",
      fieldValidationEyebrow: "Fältvalidering",
      fieldValidationTitle: "Fältverifiering sluter kretsen",
      fieldValidationText: "Resultatet slutar inte med en varning. Agronomen kan bekräfta eller avvisa tillståndet direkt mot den specifika analysen.",
      trustEyebrow: "Utformat för förtroende",
      trustTitle: "Ett beslutssystem, inte en svart låda.",
      deterministicTitle: "Deterministisk logik",
      deterministicText: "Decision Engine arbetar med explicita faktorer och versionshanterade regler.",
      historyTitle: "Historisk kontext",
      historyText: "Analysen behåller indatasnapshot och resultat så att beslutsunderlaget kan spåras i efterhand.",
      validationTitle: "Agronomisk validering",
      validationText: "Ground Truth kopplar det digitala resultatet till det faktiska tillstånd som observerats i fält.",
      localContextTitle: "Officiell agronomisk kontext",
      localContextText: "Gröd- och sortkatalogen är kopplad till officiella källdata och AEGRIS agronomiska profiler.",
      pilotEyebrow: "Kontrollerad pilot 2026",
      pilotTitle: "Validera AEGRIS på dina egna fält.",
      pilotDescription: "Piloten är avsedd för verkliga jordbruksföretag som vill jämföra AEGRIS analytiska resultat med agronomens beslut i fält.",
      systemOperations: "Agronomisk drift",
      satelliteLayer: "Satellitlager",
      weatherContext: "Väderkontext",
      currentForecast: "Aktuellt + prognos",
      weatherMeta: "Vatten · temperatur · ET₀",
      decisionLayer: "Beslutslager",
      decisionMeta: "Poäng · prioritet · rekommendation",
      fieldFeedback: "Fältåterkoppling",
      fieldFeedbackMeta: "Observerad orsak · validering", },
    da: { openAegris:"Åbn AEGRIS", signIn:"Log ind", pilotAccess:"Pilotadgang", heroEyebrow:"Field Intelligence · Europæisk landbrug", heroTitle:"Markdata.", heroTitleAccent:"Beslutninger til tiden.", goToApp:"Gå til applikationen", requestPilot:"Anmod om pilotadgang", satellite:"Satellit", resolution:"Opløsning", decision:"Beslutning", validation:"Validering", monitor:"Overvåg", evaluate:"Vurder", prioritize:"Prioritér", validate:"Valider", createAccount:"Opret konto", dataReady:"Data klar", decisionFlow:"Beslutningsflow", traceableOutput:"Sporbart resultat", flowItems:["OVERVÅG","VURDER","PRIORITÉR","VALIDER"],
      heroDescription: "AEGRIS forbinder satellitovervågning, meteorologiske data, agronomisk kontekst og markvalidering i ét operationelt system til beslutninger om markernes tilstand.",
      workflowEyebrow: "Agronomisk arbejdsgang",
      workflowTitle: "Fra signal til valideret beslutning.",
      workflowDescription: "Ikke endnu en isoleret graf. AEGRIS samler de tilgængelige data i en arbejdsgang, hvor agronomen kan se, hvad der kræver opmærksomhed og hvorfor.",
      monitorText: "Sentinel-2 L2A følger vegetationens tilstand og markens historiske udvikling.",
      evaluateText: "Vejr-, jord-, afgrøde- og vegetationsdata indgår i den deterministiske Decision Engine.",
      prioritizeText: "Resultatet omsætter markens tilstand til score, prioritet, advarsel og konkret anbefaling.",
      validateText: "Agronomen verificerer situationen i marken og gemmer Ground Truth til den konkrete analyse.",
      oneFieldRecord: "Én markpost",
      oneFieldTitle: "Én mark. Én kontekst. Én beslutningshistorik.",
      oneFieldDescription: "Field Health Record samler aktuel tilstand, datakilder, anbefalinger, advarsler og markvalidering.",
      fieldConditionContext: "Markens tilstand i kontekst",
      criticalPriority: "Kritisk prioritet",
      vegetationIndex: "Vegetationsindeks",
      contextScore: "Kontekstscore",
      dataConfidence: "Datatillid",
      validGeometry: "Gyldig geometri",
      decisionSequence: "Signal → kontekst → prioritet → anbefaling",
      decisionTraceText: "Resultatet kan spores til den konkrete analyse og snapshot af inputdata. Markverificeringen gemmes som Ground Truth.",
      provenanceEyebrow: "Dataproveniens",
      provenanceTitle: "Sporbar analyseproveniens",
      provenanceText: "Kilde, tidspunkt, geografisk dækning og kvaliteten af inputdata forbliver en del af analyseposten.",
      fieldValidationEyebrow: "Markvalidering",
      fieldValidationTitle: "Markverificering lukker kredsløbet",
      fieldValidationText: "Resultatet stopper ikke ved en advarsel. Agronomen kan bekræfte eller afvise tilstanden direkte i forhold til den konkrete analyse.",
      trustEyebrow: "Designet til tillid",
      trustTitle: "Et beslutningssystem, ikke en sort boks.",
      deterministicTitle: "Deterministisk logik",
      deterministicText: "Decision Engine arbejder med eksplicitte faktorer og versionsstyrede regler.",
      historyTitle: "Historisk kontekst",
      historyText: "Analysen gemmer snapshot af inputdata og resultatet, så beslutningsgrundlaget kan spores efterfølgende.",
      validationTitle: "Agronomisk validering",
      validationText: "Ground Truth forbinder det digitale resultat med den faktiske tilstand observeret i marken.",
      localContextTitle: "Officiel agronomisk kontekst",
      localContextText: "Afgrøde- og sortskataloget er knyttet til officielle kildedata og AEGRIS' agronomiske profiler.",
      pilotEyebrow: "Kontrolleret pilot 2026",
      pilotTitle: "Validér AEGRIS på dine egne marker.",
      pilotDescription: "Piloten er beregnet til reelle landbrugsvirksomheder, der ønsker at sammenligne AEGRIS' analytiske resultater med agronomens beslutninger i marken.",
      systemOperations: "Agronomisk drift",
      satelliteLayer: "Satellitlag",
      weatherContext: "Vejrkontekst",
      currentForecast: "Aktuelt + prognose",
      weatherMeta: "Vand · temperatur · ET₀",
      decisionLayer: "Beslutningslag",
      decisionMeta: "Score · prioritet · anbefaling",
      fieldFeedback: "Feedback fra marken",
      fieldFeedbackMeta: "Observeret årsag · validering", },
    no: { openAegris:"Åpne AEGRIS", signIn:"Logg inn", pilotAccess:"Pilottilgang", heroEyebrow:"Field Intelligence · Europeisk landbruk", heroTitle:"Feltdata.", heroTitleAccent:"Beslutninger i tide.", goToApp:"Gå til applikasjonen", requestPilot:"Be om pilottilgang", satellite:"Satellitt", resolution:"Oppløsning", decision:"Beslutning", validation:"Validering", monitor:"Overvåk", evaluate:"Vurder", prioritize:"Prioriter", validate:"Valider", createAccount:"Opprett konto", dataReady:"Data klare", decisionFlow:"Beslutningsflyt", traceableOutput:"Sporbart resultat", flowItems:["OVERVÅK","VURDER","PRIORITER","VALIDER"],
      heroDescription: "AEGRIS kobler satellittovervåking, meteorologiske data, agronomisk kontekst og feltvalidering i ett operativt system for beslutninger om tilstanden på jordene.",
      workflowEyebrow: "Agronomisk arbeidsflyt",
      workflowTitle: "Fra signal til validert beslutning.",
      workflowDescription: "Ikke enda en isolert graf. AEGRIS kombinerer tilgjengelige data i en arbeidsflyt der agronomen ser hva som krever oppmerksomhet og hvorfor.",
      monitorText: "Sentinel-2 L2A følger vegetasjonstilstanden og den historiske utviklingen på jordet.",
      evaluateText: "Vær-, jord-, vekst- og vegetasjonsdata går inn i den deterministiske Decision Engine.",
      prioritizeText: "Resultatet omsetter tilstanden på jordet til poengsum, prioritet, varsel og konkret anbefaling.",
      validateText: "Agronomen verifiserer situasjonen i felt og lagrer Ground Truth for den aktuelle analysen.",
      oneFieldRecord: "Én feltpost",
      oneFieldTitle: "Ett jorde. Én kontekst. Én beslutningshistorikk.",
      oneFieldDescription: "Field Health Record samler nåværende tilstand, datakilder, anbefalinger, varsler og feltvalidering.",
      fieldConditionContext: "Feltets tilstand i kontekst",
      criticalPriority: "Kritisk prioritet",
      vegetationIndex: "Vegetasjonsindeks",
      contextScore: "Kontekstscore",
      dataConfidence: "Datapålitelighet",
      validGeometry: "Gyldig geometri",
      decisionSequence: "Signal → kontekst → prioritet → anbefaling",
      decisionTraceText: "Resultatet kan spores til den konkrete analysen og øyeblikksbildet av inngangsdata. Feltverifiseringen lagres som Ground Truth.",
      provenanceEyebrow: "Dataopprinnelse",
      provenanceTitle: "Sporbar analyseopprinnelse",
      provenanceText: "Kilde, tidspunkt, geografisk dekning og kvaliteten på inngangsdata forblir en del av analyseposten.",
      fieldValidationEyebrow: "Feltvalidering",
      fieldValidationTitle: "Feltverifisering lukker sløyfen",
      fieldValidationText: "Resultatet stopper ikke ved et varsel. Agronomen kan bekrefte eller avvise tilstanden direkte mot den konkrete analysen.",
      trustEyebrow: "Utformet for tillit",
      trustTitle: "Et beslutningssystem, ikke en svart boks.",
      deterministicTitle: "Deterministisk logikk",
      deterministicText: "Decision Engine arbeider med eksplisitte faktorer og versjonerte regler.",
      historyTitle: "Historisk kontekst",
      historyText: "Analysen beholder øyeblikksbildet av inngangsdata og resultatet slik at beslutningsgrunnlaget kan spores i ettertid.",
      validationTitle: "Agronomisk validering",
      validationText: "Ground Truth kobler det digitale resultatet til den faktiske tilstanden observert i felt.",
      localContextTitle: "Offisiell agronomisk kontekst",
      localContextText: "Katalogen over vekster og sorter er koblet til offisielle kildedata og AEGRIS' agronomiske profiler.",
      pilotEyebrow: "Kontrollert pilot 2026",
      pilotTitle: "Valider AEGRIS på dine egne jorder.",
      pilotDescription: "Piloten er beregnet på reelle landbruksbedrifter som ønsker å sammenligne AEGRIS' analytiske resultater med agronomens beslutninger i felt.",
      systemOperations: "Agronomisk drift",
      satelliteLayer: "Satellittlag",
      weatherContext: "Værkontekst",
      currentForecast: "Nåværende + prognose",
      weatherMeta: "Vann · temperatur · ET₀",
      decisionLayer: "Beslutningslag",
      decisionMeta: "Poengsum · prioritet · anbefaling",
      fieldFeedback: "Tilbakemelding fra felt",
      fieldFeedbackMeta: "Observert årsak · validering", },
    fi: { openAegris:"Avaa AEGRIS", signIn:"Kirjaudu sisään", pilotAccess:"Pilottikäyttö", heroEyebrow:"Field Intelligence · Eurooppalainen maatalous", heroTitle:"Peltotiedot.", heroTitleAccent:"Päätökset ajoissa.", goToApp:"Siirry sovellukseen", requestPilot:"Pyydä pilottikäyttöä", satellite:"Satelliitti", resolution:"Resoluutio", decision:"Päätös", validation:"Validointi", monitor:"Seuraa", evaluate:"Arvioi", prioritize:"Priorisoi", validate:"Validoi", createAccount:"Luo tili", dataReady:"Tiedot valmiina", decisionFlow:"Päätösprosessi", traceableOutput:"Jäljitettävä tulos", flowItems:["SEURAA","ARVIOI","PRIORISOI","VALIDOI"],
      heroDescription: "AEGRIS yhdistää satelliittiseurannan, meteorologiset tiedot, agronomisen kontekstin ja kenttävalidoinnin yhdeksi operatiiviseksi järjestelmäksi peltojen tilaa koskevien päätösten tueksi.",
      workflowEyebrow: "Agronominen työnkulku",
      workflowTitle: "Signaalista validoituun päätökseen.",
      workflowDescription: "Ei jälleen yhtä irrallista kaaviota. AEGRIS yhdistää käytettävissä olevat tiedot työnkuluksi, jossa agronomi näkee, mikä vaatii huomiota ja miksi.",
      monitorText: "Sentinel-2 L2A seuraa kasvillisuuden tilaa ja pellon historiallista kehitystä.",
      evaluateText: "Sää-, maaperä-, viljelykasvi- ja kasvillisuustiedot syötetään deterministiseen Decision Engineen.",
      prioritizeText: "Tulos muuntaa pellon tilan pisteiksi, prioriteetiksi, hälytykseksi ja konkreettiseksi suositukseksi.",
      validateText: "Agronomi tarkistaa tilanteen pellolla ja tallentaa Ground Truthin kyseiseen analyysiin.",
      oneFieldRecord: "Yksi peltotietue",
      oneFieldTitle: "Yksi pelto. Yksi konteksti. Yksi päätöshistoria.",
      oneFieldDescription: "Field Health Record pitää nykytilan, tietolähteet, suositukset, hälytykset ja kenttävalidoinnin yhdessä.",
      fieldConditionContext: "Pellon tila kontekstissa",
      criticalPriority: "Kriittinen prioriteetti",
      vegetationIndex: "Kasvillisuusindeksi",
      contextScore: "Kontekstipisteet",
      dataConfidence: "Tietojen luotettavuus",
      validGeometry: "Kelvollinen geometria",
      decisionSequence: "Signaali → konteksti → prioriteetti → suositus",
      decisionTraceText: "Tulos voidaan jäljittää tiettyyn analyysiin ja syötetietojen tilannekuvaan. Kenttävarmennus tallennetaan Ground Truthina.",
      provenanceEyebrow: "Tietojen alkuperä",
      provenanceTitle: "Jäljitettävä analyysin alkuperä",
      provenanceText: "Lähde, ajankohta, alueellinen kattavuus ja syötetietojen laatu säilyvät osana analyysitietuetta.",
      fieldValidationEyebrow: "Kenttävalidointi",
      fieldValidationTitle: "Kenttävarmennus sulkee palautesilmukan",
      fieldValidationText: "Tulos ei pääty hälytykseen. Agronomi voi vahvistaa tai hylätä tilan suoraan suhteessa kyseiseen analyysiin.",
      trustEyebrow: "Suunniteltu luottamusta varten",
      trustTitle: "Päätöksentekojärjestelmä, ei musta laatikko.",
      deterministicTitle: "Deterministinen logiikka",
      deterministicText: "Decision Engine toimii eksplisiittisillä tekijöillä ja versioiduilla säännöillä.",
      historyTitle: "Historiallinen konteksti",
      historyText: "Analyysi säilyttää syötetietojen tilannekuvan ja tuloksen, jotta päätöksen peruste voidaan jäljittää jälkikäteen.",
      validationTitle: "Agronominen validointi",
      validationText: "Ground Truth yhdistää digitaalisen tuloksen pellolla havaittuun todelliseen tilaan.",
      localContextTitle: "Virallinen agronominen konteksti",
      localContextText: "Viljelykasvi- ja lajikeluettelo on yhdistetty virallisiin lähdetietoihin ja AEGRISin agronomisiin profiileihin.",
      pilotEyebrow: "Hallittu pilotti 2026",
      pilotTitle: "Validoi AEGRIS omilla pelloillasi.",
      pilotDescription: "Pilotti on tarkoitettu todellisille maatalousyrityksille, jotka haluavat verrata AEGRISin analyyttisiä tuloksia agronomin kentällä tekemiin päätöksiin.",
      systemOperations: "Agronomiset toiminnot",
      satelliteLayer: "Satelliittitaso",
      weatherContext: "Sääkonteksti",
      currentForecast: "Nykytila + ennuste",
      weatherMeta: "Vesi · lämpötila · ET₀",
      decisionLayer: "Päätöstaso",
      decisionMeta: "Pisteet · prioriteetti · suositus",
      fieldFeedback: "Kenttäpalaute",
      fieldFeedbackMeta: "Havaittu syy · validointi", },
  };

  for (const [code, values] of Object.entries(lightweight)) {
    translations[code] = copy(values);
  }

  return translations[language] ?? en;
}
export default function HomePage() {
  const { language } = useLanguage();
  const copy = getHomeCopy(language);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    }

    checkSession();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#05090d] text-slate-100">
      <header className="relative z-50 border-b border-white/[0.06] bg-[#05090d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="group">
            <div className="text-lg font-black tracking-[0.2em] text-white">
              AEGRIS
            </div>
            <div className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.22em] text-cyan-300/60">
              Agronomic Intelligence
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <LanguageSwitcher />
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-cyan-300 px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.08em] text-[#061015] transition hover:bg-cyan-200"
              >
                {copy.openAegris}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-xl px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.08em] text-slate-400 transition hover:bg-white/[0.04] hover:text-white sm:block"
                >
                  {copy.signIn}
                </Link>
                <Link
                  href="/demo"
                  className="rounded-xl border border-white/[0.09] bg-white/[0.03] px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.08em] text-white transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.04]"
                >
                  {copy.pilotAccess}
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="relative">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[12%] top-[10%] h-[420px] w-[420px] rounded-full bg-cyan-300/[0.035] blur-[120px]" />
          <div className="absolute right-[-8%] top-[20%] h-[520px] w-[520px] rounded-full bg-emerald-300/[0.025] blur-[140px]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        <div className="relative mx-auto grid max-w-[1500px] gap-14 px-5 pb-20 pt-20 sm:px-8 sm:pt-24 lg:grid-cols-[minmax(0,1.08fr)_minmax(480px,0.92fr)] lg:items-center lg:px-10 lg:pb-28 lg:pt-28">
          <div className="max-w-[820px]">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-cyan-300/70" />
              <span className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
                {copy.heroEyebrow}
              </span>
            </div>

            <h1 className="mt-7 text-[clamp(3.3rem,6.4vw,6.8rem)] font-black leading-[0.91] tracking-[-0.065em] text-white">
              {copy.heroTitle}
              <span className="block text-slate-500">{copy.heroTitleAccent}</span>
            </h1>

            <p className="mt-8 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
              {copy.heroDescription}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-cyan-300 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#061015] transition hover:bg-cyan-200"
                >
                  {copy.goToApp}
                </Link>
              ) : (
                <>
                  <Link
                    href="/demo"
                    className="rounded-xl bg-cyan-300 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#061015] transition hover:bg-cyan-200"
                  >
                    {copy.requestPilot}
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-xl border border-white/[0.09] bg-white/[0.025] px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.08em] text-white transition hover:border-white/[0.16] hover:bg-white/[0.05]"
                  >
                    {copy.signIn}
                  </Link>
                </>
              )}
            </div>

            <div className="mt-12 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-4">
              <Signal label={copy.satellite} value="Sentinel-2 L2A" />
              <Signal label={copy.resolution} value="10 m" />
              <Signal label={copy.decision} value="Rule-based" />
              <Signal label={copy.validation} value="Ground Truth" />
            </div>
          </div>

          <SystemPanel copy={copy} />
        </div>
      </section>

      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                Agronomic Workflow
              </div>
              <h2 className="mt-4 max-w-md text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl">
                {copy.workflowTitle}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
                {copy.workflowDescription}
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2">
              <WorkflowStep
                index="01"
                title={copy.monitor}
                text={copy.monitorText}
              />
              <WorkflowStep
                index="02"
                title={copy.evaluate}
                text={copy.evaluateText}
              />
              <WorkflowStep
                index="03"
                title={copy.prioritize}
                text={copy.prioritizeText}
              />
              <WorkflowStep
                index="04"
                title={copy.validate}
                text={copy.validateText}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.06] bg-[#070c11]">
        <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                One Field Record
              </div>
              <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl">
                {copy.oneFieldTitle}
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-500">
              {copy.oneFieldDescription}
            </p>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-[24px] border border-white/[0.07] bg-[#0a1016] p-5 sm:p-7">
              <div className="flex flex-col gap-5 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-600">
                    Field Health Record
                  </div>
                  <div className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">
                    {copy.fieldConditionContext}
                  </div>
                </div>
                <div className="w-fit rounded-lg border border-red-300/15 bg-red-300/[0.04] px-3 py-2 text-[8px] font-black uppercase tracking-[0.12em] text-red-300">
                  {copy.criticalPriority}
                </div>
              </div>

              <div className="grid gap-px overflow-hidden rounded-xl bg-white/[0.05] sm:grid-cols-4">
                <Metric label="NDVI" value="0.664" note={copy.vegetationIndex} />
                <Metric label="AEGRIS score" value="59/100" note={copy.contextScore} />
                <Metric label="Certainty" value="83%" note={copy.dataConfidence} />
                <Metric label="Coverage" value="100%" note={copy.validGeometry} />
              </div>

              <div className="mt-5 rounded-xl border border-white/[0.06] bg-[#071017] p-5">
                <div className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-600">
                  Decision Engine
                </div>
                <div className="mt-2 text-sm font-black text-white">
                  {copy.decisionSequence}
                </div>
                <p className="mt-2 text-[10px] leading-5 text-slate-500">
                  {copy.decisionTraceText}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <ProofCard
                eyebrow={copy.provenanceEyebrow}
                title={copy.provenanceTitle}
                text={copy.provenanceText}
              />
              <ProofCard
                eyebrow={copy.fieldValidationEyebrow}
                title={copy.fieldValidationTitle}
                text={copy.fieldValidationText}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.06]">
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-28">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
              Designed for Trust
            </div>
            <h2 className="mt-4 max-w-lg text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl">
              {copy.trustTitle}
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Principle
              title={copy.deterministicTitle}
              text={copy.deterministicText}
            />
            <Principle
              title={copy.historyTitle}
              text={copy.historyText}
            />
            <Principle
              title={copy.validationTitle}
              text={copy.validationText}
            />
            <Principle
              title={copy.localContextTitle}
              text={copy.localContextText}
            />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/[0.025] blur-[130px]" />
        <div className="relative mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 lg:py-32">
          <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
            Controlled Pilot 2026
          </div>
          <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">
            {copy.pilotTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500">
            {copy.pilotDescription}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/demo"
              className="rounded-xl bg-cyan-300 px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.08em] text-[#061015] transition hover:bg-cyan-200"
            >
              {copy.requestPilot}
            </Link>
            {!user && (
              <Link
                href="/register"
                className="rounded-xl border border-white/[0.09] bg-white/[0.025] px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.08em] text-white transition hover:border-white/[0.16] hover:bg-white/[0.05]"
              >
                {copy.createAccount}
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] bg-[#05090d]">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <div className="text-sm font-black tracking-[0.18em] text-white">
              AEGRIS
            </div>
            <div className="mt-1 text-[7px] uppercase tracking-[0.16em] text-slate-700">
              Agronomic Intelligence
            </div>
          </div>
          <div className="text-[8px] uppercase tracking-[0.12em] text-slate-700">
            © 2026 AEGRIS · Field intelligence for agronomic decisions
          </div>
        </div>
      </footer>
    </main>
  );
}

function SystemPanel({ copy }: { copy: ReturnType<typeof getHomeCopy> }) {
  return (
    <div className="relative mx-auto w-full max-w-[620px]">
      <div className="absolute -inset-10 bg-cyan-300/[0.025] blur-[80px]" />
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0a1016] shadow-2xl shadow-black/30">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div>
            <div className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-600">
              AEGRIS / Field Intelligence
            </div>
            <div className="mt-1 text-xs font-black text-white">
              {copy.systemOperations}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.12em] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            {copy.dataReady}
          </div>
        </div>

        <div className="grid gap-px bg-white/[0.05] sm:grid-cols-2">
          <PanelCell label={copy.satelliteLayer} value="Sentinel-2 L2A" meta="10 m · NDVI history" />
          <PanelCell label={copy.weatherContext} value={copy.currentForecast} meta={copy.weatherMeta} />
          <PanelCell label={copy.decisionLayer} value="AEGRIS Engine" meta={copy.decisionMeta} />
          <PanelCell label={copy.fieldFeedback} value="Ground Truth" meta={copy.fieldFeedbackMeta} />
        </div>

        <div className="p-5">
          <div className="rounded-2xl border border-white/[0.06] bg-[#071017] p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-600">
                {copy.decisionFlow}
              </div>
              <div className="text-[8px] uppercase tracking-[0.1em] text-slate-700">
                {copy.traceableOutput}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              {copy.flowItems.map(
                (item, index) => (
                  <div key={item} className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="h-1 rounded-full bg-cyan-300/70" />
                      <div className="mt-2 truncate text-[7px] font-black tracking-[0.08em] text-slate-500">
                        {item}
                      </div>
                    </div>
                    {index < 3 && (
                      <span className="mb-4 text-[8px] text-slate-800">→</span>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Signal({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#080e13] px-4 py-4">
      <div className="text-[7px] font-black uppercase tracking-[0.13em] text-slate-700">
        {label}
      </div>
      <div className="mt-1.5 text-[10px] font-black text-slate-300">{value}</div>
    </div>
  );
}

function PanelCell({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta: string;
}) {
  return (
    <div className="bg-[#0a1016] p-5">
      <div className="text-[7px] font-black uppercase tracking-[0.14em] text-slate-700">
        {label}
      </div>
      <div className="mt-2 text-sm font-black text-white">{value}</div>
      <div className="mt-1 text-[8px] leading-4 text-slate-600">{meta}</div>
    </div>
  );
}

function WorkflowStep({
  index,
  title,
  text,
}: {
  index: string;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-[#080e13] p-6 sm:p-7">
      <div className="text-[8px] font-black tracking-[0.14em] text-cyan-300/60">
        {index}
      </div>
      <h3 className="mt-5 text-xl font-black tracking-[-0.02em] text-white">
        {title}
      </h3>
      <p className="mt-3 text-[10px] leading-5 text-slate-500">{text}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="bg-[#071017] p-4">
      <div className="text-[7px] font-black uppercase tracking-[0.12em] text-slate-700">
        {label}
      </div>
      <div className="mt-2 text-xl font-black text-white">{value}</div>
      <div className="mt-1 text-[7px] text-slate-700">{note}</div>
    </div>
  );
}

function ProofCard({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/[0.07] bg-[#0a1016] p-6">
      <div className="text-[7px] font-black uppercase tracking-[0.15em] text-cyan-300/70">
        {eyebrow}
      </div>
      <h3 className="mt-3 text-lg font-black text-white">{title}</h3>
      <p className="mt-2 text-[10px] leading-5 text-slate-500">{text}</p>
    </div>
  );
}

function Principle({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
        <div>
          <h3 className="text-sm font-black text-white">{title}</h3>
          <p className="mt-2 text-[10px] leading-5 text-slate-500">{text}</p>
        </div>
      </div>
    </div>
  );
}
