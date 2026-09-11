"use client";

import Link from "next/link";

import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";

function getAIPageCopy(language: string) {
  const copies = {
    en: {
      back: "← Back",
      eyebrow: "AEGRIS / AI ANALYSIS",
      title: "AI Analysis",
      description: "Data analysis and evaluation of your projects.",
      cardTitle: "Project AI analysis",
      cardDescription: "AI analysis is launched directly from a specific project detail, where it has access to the project's data, NDVI, weather and additional context.",
      selectProject: "Select project",
    },
    cs: {
      back: "← Zpět",
      eyebrow: "AEGRIS / AI ANALÝZA",
      title: "AI Analýza",
      description: "Analýza dat a vyhodnocení stavu vašich projektů.",
      cardTitle: "AI analýza projektu",
      cardDescription: "AI analýza se spouští přímo z detailu konkrétního projektu, kde má k dispozici jeho data, NDVI, počasí a další kontext.",
      selectProject: "Vybrat projekt",
    },
    sk: {
      back: "← Späť",
      eyebrow: "AEGRIS / AI ANALÝZA",
      title: "AI analýza",
      description: "Analýza dát a vyhodnotenie stavu vašich projektov.",
      cardTitle: "AI analýza projektu",
      cardDescription: "AI analýza sa spúšťa priamo z detailu konkrétneho projektu, kde má k dispozícii jeho dáta, NDVI, počasie a ďalší kontext.",
      selectProject: "Vybrať projekt",
    },
    de: {
      back: "← Zurück",
      eyebrow: "AEGRIS / KI-ANALYSE",
      title: "KI-Analyse",
      description: "Datenanalyse und Bewertung Ihrer Projekte.",
      cardTitle: "KI-Analyse des Projekts",
      cardDescription: "Die KI-Analyse wird direkt in den Details eines konkreten Projekts gestartet und hat dort Zugriff auf Projektdaten, NDVI, Wetter und weiteren Kontext.",
      selectProject: "Projekt auswählen",
    },
    pl: {
      back: "← Wstecz",
      eyebrow: "AEGRIS / ANALIZA AI",
      title: "Analiza AI",
      description: "Analiza danych i ocena stanu projektów.",
      cardTitle: "Analiza AI projektu",
      cardDescription: "Analiza AI jest uruchamiana bezpośrednio z widoku konkretnego projektu, gdzie ma dostęp do jego danych, NDVI, pogody i dodatkowego kontekstu.",
      selectProject: "Wybierz projekt",
    },
    fr: {
      back: "← Retour",
      eyebrow: "AEGRIS / ANALYSE IA",
      title: "Analyse IA",
      description: "Analyse des données et évaluation de vos projets.",
      cardTitle: "Analyse IA du projet",
      cardDescription: "L’analyse IA est lancée directement depuis le détail d’un projet précis, où elle accède à ses données, au NDVI, à la météo et à d’autres éléments de contexte.",
      selectProject: "Sélectionner un projet",
    },
    es: {
      back: "← Volver",
      eyebrow: "AEGRIS / ANÁLISIS IA",
      title: "Análisis IA",
      description: "Análisis de datos y evaluación del estado de sus proyectos.",
      cardTitle: "Análisis IA del proyecto",
      cardDescription: "El análisis de IA se inicia directamente desde el detalle de un proyecto concreto, donde dispone de sus datos, NDVI, meteorología y contexto adicional.",
      selectProject: "Seleccionar proyecto",
    },
    it: {
      back: "← Indietro",
      eyebrow: "AEGRIS / ANALISI AI",
      title: "Analisi AI",
      description: "Analisi dei dati e valutazione dello stato dei tuoi progetti.",
      cardTitle: "Analisi AI del progetto",
      cardDescription: "L’analisi AI viene avviata direttamente dal dettaglio di uno specifico progetto, dove dispone dei suoi dati, NDVI, meteo e ulteriore contesto.",
      selectProject: "Seleziona progetto",
    },
    nl: {
      back: "← Terug",
      eyebrow: "AEGRIS / AI-ANALYSE",
      title: "AI-analyse",
      description: "Gegevensanalyse en beoordeling van uw projecten.",
      cardTitle: "AI-analyse van project",
      cardDescription: "De AI-analyse wordt rechtstreeks gestart vanuit de details van een specifiek project, waar deze toegang heeft tot projectgegevens, NDVI, weer en aanvullende context.",
      selectProject: "Project selecteren",
    },
    pt: {
      back: "← Voltar",
      eyebrow: "AEGRIS / ANÁLISE DE IA",
      title: "Análise de IA",
      description: "Análise de dados e avaliação dos seus projetos.",
      cardTitle: "Análise de IA do projeto",
      cardDescription: "A análise de IA é iniciada diretamente no detalhe de um projeto específico, onde tem acesso aos dados do projeto, NDVI, meteorologia e contexto adicional.",
      selectProject: "Selecionar projeto",
    },
    ro: {
      back: "← Înapoi",
      eyebrow: "AEGRIS / ANALIZĂ AI",
      title: "Analiză AI",
      description: "Analiza datelor și evaluarea proiectelor dvs.",
      cardTitle: "Analiza AI a proiectului",
      cardDescription: "Analiza AI este lansată direct din pagina unui proiect specific, unde are acces la datele proiectului, NDVI, vreme și context suplimentar.",
      selectProject: "Selectează proiectul",
    },
    hu: {
      back: "← Vissza",
      eyebrow: "AEGRIS / AI-ELEMZÉS",
      title: "AI-elemzés",
      description: "Adat­elemzés és projektjei állapotának értékelése.",
      cardTitle: "Projekt AI-elemzése",
      cardDescription: "Az AI-elemzés közvetlenül egy adott projekt részleteiből indítható, ahol hozzáfér a projekt adataihoz, az NDVI-hoz, az időjáráshoz és további kontextushoz.",
      selectProject: "Projekt kiválasztása",
    },
    uk: {
      back: "← Назад",
      eyebrow: "AEGRIS / AI-АНАЛІЗ",
      title: "AI-аналіз",
      description: "Аналіз даних і оцінювання стану ваших проєктів.",
      cardTitle: "AI-аналіз проєкту",
      cardDescription: "AI-аналіз запускається безпосередньо з детальної сторінки конкретного проєкту, де має доступ до його даних, NDVI, погоди та додаткового контексту.",
      selectProject: "Вибрати проєкт",
    },
    bg: {
      back: "← Назад",
      eyebrow: "AEGRIS / AI АНАЛИЗ",
      title: "AI анализ",
      description: "Анализ на данни и оценка на състоянието на вашите проекти.",
      cardTitle: "AI анализ на проект",
      cardDescription: "AI анализът се стартира директно от детайлите на конкретен проект, където има достъп до неговите данни, NDVI, времето и допълнителен контекст.",
      selectProject: "Избери проект",
    },
    hr: {
      back: "← Natrag",
      eyebrow: "AEGRIS / AI ANALIZA",
      title: "AI analiza",
      description: "Analiza podataka i procjena stanja vaših projekata.",
      cardTitle: "AI analiza projekta",
      cardDescription: "AI analiza pokreće se izravno iz detalja određenog projekta, gdje ima pristup njegovim podacima, NDVI-ju, vremenu i dodatnom kontekstu.",
      selectProject: "Odaberi projekt",
    },
    sl: {
      back: "← Nazaj",
      eyebrow: "AEGRIS / AI ANALIZA",
      title: "AI analiza",
      description: "Analiza podatkov in ocena stanja vaših projektov.",
      cardTitle: "AI analiza projekta",
      cardDescription: "AI analiza se zažene neposredno iz podrobnosti posameznega projekta, kjer ima dostop do njegovih podatkov, NDVI, vremena in dodatnega konteksta.",
      selectProject: "Izberi projekt",
    },
    lt: {
      back: "← Atgal",
      eyebrow: "AEGRIS / AI ANALIZĖ",
      title: "AI analizė",
      description: "Duomenų analizė ir jūsų projektų būklės vertinimas.",
      cardTitle: "Projekto AI analizė",
      cardDescription: "AI analizė paleidžiama tiesiogiai iš konkretaus projekto peržiūros, kur ji turi prieigą prie projekto duomenų, NDVI, orų ir papildomo konteksto.",
      selectProject: "Pasirinkti projektą",
    },
    lv: {
      back: "← Atpakaļ",
      eyebrow: "AEGRIS / AI ANALĪZE",
      title: "AI analīze",
      description: "Datu analīze un jūsu projektu stāvokļa novērtēšana.",
      cardTitle: "Projekta AI analīze",
      cardDescription: "AI analīze tiek palaista tieši no konkrēta projekta detalizētā skata, kur tai ir pieejami projekta dati, NDVI, laikapstākļi un papildu konteksts.",
      selectProject: "Izvēlēties projektu",
    },
    et: {
      back: "← Tagasi",
      eyebrow: "AEGRIS / AI-ANALÜÜS",
      title: "AI-analüüs",
      description: "Andmeanalüüs ja teie projektide seisundi hindamine.",
      cardTitle: "Projekti AI-analüüs",
      cardDescription: "AI-analüüs käivitatakse otse konkreetse projekti detailvaatest, kus sellel on juurdepääs projekti andmetele, NDVI-le, ilmale ja lisakontekstile.",
      selectProject: "Vali projekt",
    },
    el: {
      back: "← Πίσω",
      eyebrow: "AEGRIS / ΑΝΑΛΥΣΗ AI",
      title: "Ανάλυση AI",
      description: "Ανάλυση δεδομένων και αξιολόγηση της κατάστασης των έργων σας.",
      cardTitle: "Ανάλυση AI έργου",
      cardDescription: "Η ανάλυση AI εκκινείται απευθείας από τις λεπτομέρειες ενός συγκεκριμένου έργου, όπου έχει πρόσβαση στα δεδομένα του έργου, στο NDVI, στον καιρό και σε πρόσθετο πλαίσιο.",
      selectProject: "Επιλογή έργου",
    },
    sv: {
      back: "← Tillbaka",
      eyebrow: "AEGRIS / AI-ANALYS",
      title: "AI-analys",
      description: "Dataanalys och bedömning av dina projekt.",
      cardTitle: "AI-analys av projekt",
      cardDescription: "AI-analysen startas direkt från detaljvyn för ett specifikt projekt, där den har tillgång till projektdata, NDVI, väder och ytterligare kontext.",
      selectProject: "Välj projekt",
    },
    da: {
      back: "← Tilbage",
      eyebrow: "AEGRIS / AI-ANALYSE",
      title: "AI-analyse",
      description: "Dataanalyse og vurdering af dine projekter.",
      cardTitle: "AI-analyse af projekt",
      cardDescription: "AI-analysen startes direkte fra detaljevisningen for et bestemt projekt, hvor den har adgang til projektdata, NDVI, vejr og yderligere kontekst.",
      selectProject: "Vælg projekt",
    },
    no: {
      back: "← Tilbake",
      eyebrow: "AEGRIS / AI-ANALYSE",
      title: "AI-analyse",
      description: "Dataanalyse og vurdering av prosjektene dine.",
      cardTitle: "AI-analyse av prosjekt",
      cardDescription: "AI-analysen startes direkte fra detaljvisningen for et bestemt prosjekt, der den har tilgang til prosjektdata, NDVI, vær og ytterligere kontekst.",
      selectProject: "Velg prosjekt",
    },
    fi: {
      back: "← Takaisin",
      eyebrow: "AEGRIS / AI-ANALYYSI",
      title: "AI-analyysi",
      description: "Tietojen analysointi ja projektiesi tilan arviointi.",
      cardTitle: "Projektin AI-analyysi",
      cardDescription: "AI-analyysi käynnistetään suoraan tietyn projektin yksityiskohdista, missä sillä on käytettävissään projektin tiedot, NDVI, sää ja lisäkonteksti.",
      selectProject: "Valitse projekti",
    }
  } as const;

  return copies[language as keyof typeof copies] ?? copies.en;
}
export default function AIPage() {
  const { language } = useLanguage();
  const copy = getAIPageCopy(language);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <main className="mx-auto max-w-[1100px] px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-400/40"
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

        <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-8">
          <div className="text-4xl">🧠</div>

          <h2 className="mt-5 text-2xl font-bold">
            {copy.cardTitle}
          </h2>

          <p className="mt-2 max-w-2xl text-slate-500">
            {copy.cardDescription}
          </p>

          <Link
            href="/projects"
            className="mt-6 inline-flex rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-400"
          >
            {copy.selectProject}
          </Link>
        </section>
      </main>
    </div>
  );
}
