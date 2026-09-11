"use client";

import {
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLanguage } from "../../context/LanguageContext";

type AiAgronomProps = {
  projectId: number;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type AiAgronomResponse = {
  answer?: string;
  error?: string;
  code?: string;
  meta?: {
    projectId?: number;
    analysisId?: number | null;
    model?: string;
    generatedAt?: string;
    decisionSource?: string;
    dataCompletenessPct?: number | null;
  };
};

function getAiAgronomCopy(language: string) {
  const copies = {
    cs: {
      quickQuestions: [
        "Zhodnoť tento pozemek.",
      "Co je teď největší riziko?",
      "Co mám dnes zkontrolovat na poli?",
      "Jak je na tom voda?",
      "Jak je na tom výživa?",
      "Jaká důležitá data chybí?",
      ],
      maxLength: "Dotaz může mít maximálně 2000 znaků.",
      invalidResponse: "Server AI Agronoma vrátil neplatnou odpověď.",
      serverError: (status: number) => `AI Agronom vrátil chybu serveru (${status}).`,
      emptyAnswer: "AI Agronom nevytvořil odpověď.",
      unavailable: "AI Agronom momentálně není dostupný.",
      description: "Vysvětluje aktuální stav pozemku z dat AEGRIS, Decision Enginu, satelitního monitoringu, počasí, půdního kontextu a agronomických dat.",
      ready: "Připraven",
      whatToAsk: "Na co se můžete zeptat",
      evaluating: "AI Agronom vyhodnocuje data pozemku…",
      placeholder: "Zeptejte se AI Agronoma na tento pozemek…",
      evaluatingButton: "Vyhodnocuji…",
      ask: "Zeptat se",
      disclaimer: "AI Agronom vysvětluje data AEGRIS. Nenahrazuje terénní kontrolu ani odborné rozhodnutí agronoma.",
    },
    en: {
      quickQuestions: [
        "Assess this field.",
      "What is the biggest risk right now?",
      "What should I check in the field today?",
      "How is the water situation?",
      "How is the crop nutrition?",
      "What important data is missing?",
      ],
      maxLength: "The question can contain at most 2000 characters.",
      invalidResponse: "The AI Agronom server returned an invalid response.",
      serverError: (status: number) => `AI Agronom returned a server error (${status}).`,
      emptyAnswer: "AI Agronom did not generate an answer.",
      unavailable: "AI Agronom is currently unavailable.",
      description: "Explains the current field condition using AEGRIS data, the Decision Engine, satellite monitoring, weather, soil context and agronomic data.",
      ready: "Ready",
      whatToAsk: "What you can ask",
      evaluating: "AI Agronom is evaluating field data…",
      placeholder: "Ask AI Agronom about this field…",
      evaluatingButton: "Evaluating…",
      ask: "Ask",
      disclaimer: "AI Agronom explains AEGRIS data. It does not replace field inspection or the professional judgment of an agronomist.",
    },
    sk: {
      quickQuestions: [
        "Zhodnoť tento pozemok.",
      "Aké je teraz najväčšie riziko?",
      "Čo mám dnes skontrolovať na poli?",
      "Aká je situácia s vodou?",
      "Ako je na tom výživa plodiny?",
      "Aké dôležité údaje chýbajú?",
      ],
      maxLength: "Otázka môže obsahovať najviac 2000 znakov.",
      invalidResponse: "Server AI Agronóma vrátil neplatnú odpoveď.",
      serverError: (status: number) => `AI Agronóm vrátil chybu servera (${status}).`,
      emptyAnswer: "AI Agronóm nevytvoril odpoveď.",
      unavailable: "AI Agronóm momentálne nie je dostupný.",
      description: "Vysvetľuje aktuálny stav pozemku z údajov AEGRIS, Decision Enginu, satelitného monitoringu, počasia, pôdneho kontextu a agronomických údajov.",
      ready: "Pripravený",
      whatToAsk: "Na čo sa môžete opýtať",
      evaluating: "AI Agronóm vyhodnocuje údaje pozemku…",
      placeholder: "Opýtajte sa AI Agronóma na tento pozemok…",
      evaluatingButton: "Vyhodnocujem…",
      ask: "Opýtať sa",
      disclaimer: "AI Agronóm vysvetľuje údaje AEGRIS. Nenahrádza kontrolu v teréne ani odborné rozhodnutie agronóma.",
    },
    de: {
      quickQuestions: [
        "Bewerte diese Fläche.",
      "Was ist derzeit das größte Risiko?",
      "Was sollte ich heute auf dem Feld prüfen?",
      "Wie ist die Wassersituation?",
      "Wie ist die Nährstoffversorgung der Kultur?",
      "Welche wichtigen Daten fehlen?",
      ],
      maxLength: "Die Frage darf höchstens 2000 Zeichen enthalten.",
      invalidResponse: "Der AI-Agronom-Server hat eine ungültige Antwort zurückgegeben.",
      serverError: (status: number) => `AI Agronom hat einen Serverfehler zurückgegeben (${status}).`,
      emptyAnswer: "AI Agronom hat keine Antwort erzeugt.",
      unavailable: "AI Agronom ist derzeit nicht verfügbar.",
      description: "Erläutert den aktuellen Zustand der Fläche anhand von AEGRIS-Daten, Decision Engine, Satellitenmonitoring, Wetter, Bodenkontext und agronomischen Daten.",
      ready: "Bereit",
      whatToAsk: "Mögliche Fragen",
      evaluating: "AI Agronom wertet die Felddaten aus…",
      placeholder: "Fragen Sie AI Agronom zu dieser Fläche…",
      evaluatingButton: "Auswertung…",
      ask: "Fragen",
      disclaimer: "AI Agronom erläutert AEGRIS-Daten. Er ersetzt weder die Feldkontrolle noch die fachliche Beurteilung durch einen Agronomen.",
    },
    pl: {
      quickQuestions: [
        "Oceń to pole.",
      "Jakie jest teraz największe ryzyko?",
      "Co powinienem dziś sprawdzić na polu?",
      "Jaka jest sytuacja wodna?",
      "Jak wygląda odżywienie uprawy?",
      "Jakich ważnych danych brakuje?",
      ],
      maxLength: "Pytanie może zawierać maksymalnie 2000 znaków.",
      invalidResponse: "Serwer AI Agronom zwrócił nieprawidłową odpowiedź.",
      serverError: (status: number) => `AI Agronom zwrócił błąd serwera (${status}).`,
      emptyAnswer: "AI Agronom nie wygenerował odpowiedzi.",
      unavailable: "AI Agronom jest obecnie niedostępny.",
      description: "Wyjaśnia aktualny stan pola na podstawie danych AEGRIS, Decision Engine, monitoringu satelitarnego, pogody, kontekstu glebowego i danych agronomicznych.",
      ready: "Gotowy",
      whatToAsk: "O co możesz zapytać",
      evaluating: "AI Agronom analizuje dane pola…",
      placeholder: "Zapytaj AI Agronom o to pole…",
      evaluatingButton: "Analizowanie…",
      ask: "Zapytaj",
      disclaimer: "AI Agronom objaśnia dane AEGRIS. Nie zastępuje kontroli polowej ani profesjonalnej oceny agronoma.",
    },
    fr: {
      quickQuestions: [
        "Évaluez cette parcelle.",
      "Quel est le principal risque actuellement ?",
      "Que dois-je vérifier au champ aujourd’hui ?",
      "Quelle est la situation hydrique ?",
      "Quel est l’état nutritionnel de la culture ?",
      "Quelles données importantes manquent ?",
      ],
      maxLength: "La question peut contenir au maximum 2000 caractères.",
      invalidResponse: "Le serveur AI Agronom a renvoyé une réponse invalide.",
      serverError: (status: number) => `AI Agronom a renvoyé une erreur serveur (${status}).`,
      emptyAnswer: "AI Agronom n’a généré aucune réponse.",
      unavailable: "AI Agronom est actuellement indisponible.",
      description: "Explique l’état actuel de la parcelle à partir des données AEGRIS, du Decision Engine, du suivi satellitaire, de la météo, du contexte pédologique et des données agronomiques.",
      ready: "Prêt",
      whatToAsk: "Questions possibles",
      evaluating: "AI Agronom analyse les données de la parcelle…",
      placeholder: "Interrogez AI Agronom sur cette parcelle…",
      evaluatingButton: "Analyse…",
      ask: "Demander",
      disclaimer: "AI Agronom explique les données AEGRIS. Il ne remplace ni l’inspection au champ ni le jugement professionnel d’un agronome.",
    },
    es: {
      quickQuestions: [
        "Evalúa esta parcela.",
      "¿Cuál es el mayor riesgo ahora mismo?",
      "¿Qué debería revisar hoy en el campo?",
      "¿Cómo está la situación hídrica?",
      "¿Cómo está la nutrición del cultivo?",
      "¿Qué datos importantes faltan?",
      ],
      maxLength: "La pregunta puede contener como máximo 2000 caracteres.",
      invalidResponse: "El servidor de AI Agronom devolvió una respuesta no válida.",
      serverError: (status: number) => `AI Agronom devolvió un error del servidor (${status}).`,
      emptyAnswer: "AI Agronom no generó una respuesta.",
      unavailable: "AI Agronom no está disponible actualmente.",
      description: "Explica el estado actual de la parcela utilizando datos de AEGRIS, Decision Engine, monitorización por satélite, meteorología, contexto del suelo y datos agronómicos.",
      ready: "Listo",
      whatToAsk: "Qué puedes preguntar",
      evaluating: "AI Agronom está evaluando los datos de la parcela…",
      placeholder: "Pregunta a AI Agronom sobre esta parcela…",
      evaluatingButton: "Evaluando…",
      ask: "Preguntar",
      disclaimer: "AI Agronom explica los datos de AEGRIS. No sustituye la inspección de campo ni el criterio profesional de un agrónomo.",
    },
    it: {
      quickQuestions: [
        "Valuta questo appezzamento.",
      "Qual è il rischio maggiore in questo momento?",
      "Cosa dovrei controllare oggi in campo?",
      "Com'è la situazione idrica?",
      "Com'è la nutrizione della coltura?",
      "Quali dati importanti mancano?",
      ],
      maxLength: "La domanda può contenere al massimo 2000 caratteri.",
      invalidResponse: "Il server AI Agronom ha restituito una risposta non valida.",
      serverError: (status: number) => `AI Agronom ha restituito un errore del server (${status}).`,
      emptyAnswer: "AI Agronom non ha generato una risposta.",
      unavailable: "AI Agronom non è attualmente disponibile.",
      description: "Spiega lo stato attuale dell'appezzamento utilizzando i dati AEGRIS, il Decision Engine, il monitoraggio satellitare, il meteo, il contesto del suolo e i dati agronomici.",
      ready: "Pronto",
      whatToAsk: "Cosa puoi chiedere",
      evaluating: "AI Agronom sta valutando i dati dell'appezzamento…",
      placeholder: "Chiedi ad AI Agronom informazioni su questo appezzamento…",
      evaluatingButton: "Valutazione…",
      ask: "Chiedi",
      disclaimer: "AI Agronom spiega i dati AEGRIS. Non sostituisce il sopralluogo in campo né il giudizio professionale di un agronomo.",
    },
    nl: {
      quickQuestions: [
        "Beoordeel dit perceel.",
      "Wat is op dit moment het grootste risico?",
      "Wat moet ik vandaag in het veld controleren?",
      "Hoe is de watersituatie?",
      "Hoe staat het met de gewasvoeding?",
      "Welke belangrijke gegevens ontbreken?",
      ],
      maxLength: "De vraag mag maximaal 2000 tekens bevatten.",
      invalidResponse: "De AI Agronom-server gaf een ongeldig antwoord.",
      serverError: (status: number) => `AI Agronom gaf een serverfout (${status}).`,
      emptyAnswer: "AI Agronom heeft geen antwoord gegenereerd.",
      unavailable: "AI Agronom is momenteel niet beschikbaar.",
      description: "Verklaart de actuele toestand van het perceel aan de hand van AEGRIS-gegevens, de Decision Engine, satellietmonitoring, weer, bodemcontext en agronomische gegevens.",
      ready: "Gereed",
      whatToAsk: "Wat u kunt vragen",
      evaluating: "AI Agronom beoordeelt de perceelgegevens…",
      placeholder: "Vraag AI Agronom naar dit perceel…",
      evaluatingButton: "Beoordelen…",
      ask: "Vragen",
      disclaimer: "AI Agronom verklaart AEGRIS-gegevens. Het vervangt geen veldinspectie of het professionele oordeel van een agronoom.",
    },
    pt: {
      quickQuestions: [
        "Avalie esta parcela.",
      "Qual é o maior risco neste momento?",
      "O que devo verificar hoje no campo?",
      "Como está a situação hídrica?",
      "Como está a nutrição da cultura?",
      "Que dados importantes estão em falta?",
      ],
      maxLength: "A pergunta pode ter no máximo 2000 caracteres.",
      invalidResponse: "O servidor AI Agronom devolveu uma resposta inválida.",
      serverError: (status: number) => `AI Agronom devolveu um erro do servidor (${status}).`,
      emptyAnswer: "AI Agronom não gerou uma resposta.",
      unavailable: "AI Agronom não está disponível neste momento.",
      description: "Explica o estado atual da parcela com base nos dados AEGRIS, no Decision Engine, na monitorização por satélite, no clima, no contexto do solo e em dados agronómicos.",
      ready: "Pronto",
      whatToAsk: "O que pode perguntar",
      evaluating: "AI Agronom está a avaliar os dados da parcela…",
      placeholder: "Pergunte ao AI Agronom sobre esta parcela…",
      evaluatingButton: "A avaliar…",
      ask: "Perguntar",
      disclaimer: "AI Agronom explica os dados AEGRIS. Não substitui a inspeção no campo nem o julgamento profissional de um agrónomo.",
    },
    ro: {
      quickQuestions: [
        "Evaluează această parcelă.",
      "Care este cel mai mare risc acum?",
      "Ce ar trebui să verific astăzi pe teren?",
      "Cum este situația apei?",
      "Cum este nutriția culturii?",
      "Ce date importante lipsesc?",
      ],
      maxLength: "Întrebarea poate conține cel mult 2000 de caractere.",
      invalidResponse: "Serverul AI Agronom a returnat un răspuns nevalid.",
      serverError: (status: number) => `AI Agronom a returnat o eroare de server (${status}).`,
      emptyAnswer: "AI Agronom nu a generat un răspuns.",
      unavailable: "AI Agronom nu este disponibil momentan.",
      description: "Explică starea actuală a parcelei folosind date AEGRIS, Decision Engine, monitorizare prin satelit, vreme, contextul solului și date agronomice.",
      ready: "Pregătit",
      whatToAsk: "Ce puteți întreba",
      evaluating: "AI Agronom evaluează datele parcelei…",
      placeholder: "Întrebați AI Agronom despre această parcelă…",
      evaluatingButton: "Se evaluează…",
      ask: "Întreabă",
      disclaimer: "AI Agronom explică datele AEGRIS. Nu înlocuiește inspecția în teren sau judecata profesională a unui agronom.",
    },
    hu: {
      quickQuestions: [
        "Értékeld ezt a táblát.",
      "Mi most a legnagyobb kockázat?",
      "Mit ellenőrizzek ma a táblán?",
      "Milyen a vízellátottság?",
      "Milyen a növény tápanyagellátása?",
      "Milyen fontos adatok hiányoznak?",
      ],
      maxLength: "A kérdés legfeljebb 2000 karakterből állhat.",
      invalidResponse: "Az AI Agronom szervere érvénytelen választ adott.",
      serverError: (status: number) => `Az AI Agronom szerverhibát adott (${status}).`,
      emptyAnswer: "Az AI Agronom nem generált választ.",
      unavailable: "Az AI Agronom jelenleg nem érhető el.",
      description: "Az AEGRIS adatai, a Decision Engine, a műholdas megfigyelés, az időjárás, a talajkörnyezet és az agronómiai adatok alapján magyarázza a tábla aktuális állapotát.",
      ready: "Kész",
      whatToAsk: "Mit kérdezhet",
      evaluating: "Az AI Agronom kiértékeli a tábla adatait…",
      placeholder: "Kérdezze az AI Agronomot erről a tábláról…",
      evaluatingButton: "Kiértékelés…",
      ask: "Kérdezés",
      disclaimer: "Az AI Agronom az AEGRIS adatait magyarázza. Nem helyettesíti a helyszíni ellenőrzést vagy az agronómus szakmai megítélését.",
    },
    uk: {
      quickQuestions: [
        "Оцініть це поле.",
      "Який зараз найбільший ризик?",
      "Що мені сьогодні перевірити в полі?",
      "Яка ситуація з водозабезпеченням?",
      "Який стан живлення культури?",
      "Яких важливих даних бракує?",
      ],
      maxLength: "Запитання може містити не більше 2000 символів.",
      invalidResponse: "Сервер AI Agronom повернув некоректну відповідь.",
      serverError: (status: number) => `AI Agronom повернув помилку сервера (${status}).`,
      emptyAnswer: "AI Agronom не сформував відповідь.",
      unavailable: "AI Agronom наразі недоступний.",
      description: "Пояснює поточний стан поля на основі даних AEGRIS, Decision Engine, супутникового моніторингу, погоди, ґрунтового контексту та агрономічних даних.",
      ready: "Готовий",
      whatToAsk: "Про що можна запитати",
      evaluating: "AI Agronom оцінює дані поля…",
      placeholder: "Запитайте AI Agronom про це поле…",
      evaluatingButton: "Оцінювання…",
      ask: "Запитати",
      disclaimer: "AI Agronom пояснює дані AEGRIS. Він не замінює польове обстеження чи професійне рішення агронома.",
    },
    bg: {
      quickQuestions: [
        "Оценете това поле.",
      "Кой е най-големият риск в момента?",
      "Какво трябва да проверя на полето днес?",
      "Каква е ситуацията с водата?",
      "Какво е храненето на културата?",
      "Какви важни данни липсват?",
      ],
      maxLength: "Въпросът може да съдържа най-много 2000 знака.",
      invalidResponse: "Сървърът на AI Agronom върна невалиден отговор.",
      serverError: (status: number) => `AI Agronom върна сървърна грешка (${status}).`,
      emptyAnswer: "AI Agronom не генерира отговор.",
      unavailable: "AI Agronom в момента не е достъпен.",
      description: "Обяснява текущото състояние на полето чрез данни от AEGRIS, Decision Engine, сателитен мониторинг, метеорологични данни, почвен контекст и агрономически данни.",
      ready: "Готов",
      whatToAsk: "Какво можете да попитате",
      evaluating: "AI Agronom оценява данните за полето…",
      placeholder: "Попитайте AI Agronom за това поле…",
      evaluatingButton: "Оценяване…",
      ask: "Попитай",
      disclaimer: "AI Agronom обяснява данните на AEGRIS. Той не заменя проверката на място или професионалната преценка на агроном.",
    },
    hr: {
      quickQuestions: [
        "Procijeni ovu parcelu.",
      "Koji je trenutačno najveći rizik?",
      "Što bih danas trebao provjeriti na polju?",
      "Kakvo je stanje vode?",
      "Kakva je ishrana usjeva?",
      "Koji važni podaci nedostaju?",
      ],
      maxLength: "Pitanje može sadržavati najviše 2000 znakova.",
      invalidResponse: "Poslužitelj AI Agronoma vratio je nevažeći odgovor.",
      serverError: (status: number) => `AI Agronom vratio je pogrešku poslužitelja (${status}).`,
      emptyAnswer: "AI Agronom nije generirao odgovor.",
      unavailable: "AI Agronom trenutačno nije dostupan.",
      description: "Objašnjava trenutačno stanje parcele koristeći podatke AEGRIS-a, Decision Engine, satelitski nadzor, vremenske podatke, kontekst tla i agronomske podatke.",
      ready: "Spreman",
      whatToAsk: "Što možete pitati",
      evaluating: "AI Agronom procjenjuje podatke o parceli…",
      placeholder: "Pitajte AI Agronoma o ovoj parceli…",
      evaluatingButton: "Procjena…",
      ask: "Pitaj",
      disclaimer: "AI Agronom objašnjava podatke AEGRIS-a. Ne zamjenjuje terenski pregled ni stručnu prosudbu agronoma.",
    },
    sl: {
      quickQuestions: [
        "Oceni to parcelo.",
      "Kaj je trenutno največje tveganje?",
      "Kaj naj danes preverim na polju?",
      "Kakšno je stanje z vodo?",
      "Kakšna je prehranjenost posevka?",
      "Kateri pomembni podatki manjkajo?",
      ],
      maxLength: "Vprašanje lahko vsebuje največ 2000 znakov.",
      invalidResponse: "Strežnik AI Agronom je vrnil neveljaven odgovor.",
      serverError: (status: number) => `AI Agronom je vrnil napako strežnika (${status}).`,
      emptyAnswer: "AI Agronom ni ustvaril odgovora.",
      unavailable: "AI Agronom trenutno ni na voljo.",
      description: "Pojasnjuje trenutno stanje parcele na podlagi podatkov AEGRIS, Decision Engine, satelitskega spremljanja, vremena, talnega konteksta in agronomskih podatkov.",
      ready: "Pripravljen",
      whatToAsk: "Kaj lahko vprašate",
      evaluating: "AI Agronom ocenjuje podatke parcele…",
      placeholder: "Vprašajte AI Agronoma o tej parceli…",
      evaluatingButton: "Ocenjevanje…",
      ask: "Vprašaj",
      disclaimer: "AI Agronom pojasnjuje podatke AEGRIS. Ne nadomešča terenskega pregleda ali strokovne presoje agronoma.",
    },
    lt: {
      quickQuestions: [
        "Įvertinkite šį lauką.",
      "Kokia šiuo metu didžiausia rizika?",
      "Ką šiandien turėčiau patikrinti lauke?",
      "Kokia vandens situacija?",
      "Kokia pasėlio mitybos būklė?",
      "Kokių svarbių duomenų trūksta?",
      ],
      maxLength: "Klausimą gali sudaryti ne daugiau kaip 2000 simbolių.",
      invalidResponse: "AI Agronom serveris grąžino netinkamą atsakymą.",
      serverError: (status: number) => `AI Agronom grąžino serverio klaidą (${status}).`,
      emptyAnswer: "AI Agronom nesugeneravo atsakymo.",
      unavailable: "AI Agronom šiuo metu nepasiekiamas.",
      description: "Paaiškina dabartinę lauko būklę remdamasis AEGRIS duomenimis, Decision Engine, palydovine stebėsena, orais, dirvožemio kontekstu ir agronominiais duomenimis.",
      ready: "Parengta",
      whatToAsk: "Ko galite paklausti",
      evaluating: "AI Agronom vertina lauko duomenis…",
      placeholder: "Paklauskite AI Agronom apie šį lauką…",
      evaluatingButton: "Vertinama…",
      ask: "Klausti",
      disclaimer: "AI Agronom paaiškina AEGRIS duomenis. Jis nepakeičia lauko apžiūros ar profesionalaus agronomo sprendimo.",
    },
    lv: {
      quickQuestions: [
        "Novērtējiet šo lauku.",
      "Kāds šobrīd ir lielākais risks?",
      "Ko man šodien vajadzētu pārbaudīt laukā?",
      "Kāda ir ūdens situācija?",
      "Kāds ir kultūrauga barības vielu nodrošinājums?",
      "Kādu svarīgu datu trūkst?",
      ],
      maxLength: "Jautājumā var būt ne vairāk kā 2000 rakstzīmju.",
      invalidResponse: "AI Agronom serveris atgrieza nederīgu atbildi.",
      serverError: (status: number) => `AI Agronom atgrieza servera kļūdu (${status}).`,
      emptyAnswer: "AI Agronom neizveidoja atbildi.",
      unavailable: "AI Agronom pašlaik nav pieejams.",
      description: "Izskaidro lauka pašreizējo stāvokli, izmantojot AEGRIS datus, Decision Engine, satelītu monitoringu, laikapstākļus, augsnes kontekstu un agronomiskos datus.",
      ready: "Gatavs",
      whatToAsk: "Ko varat jautāt",
      evaluating: "AI Agronom izvērtē lauka datus…",
      placeholder: "Jautājiet AI Agronom par šo lauku…",
      evaluatingButton: "Izvērtē…",
      ask: "Jautāt",
      disclaimer: "AI Agronom izskaidro AEGRIS datus. Tas neaizstāj lauka apsekošanu vai agronoma profesionālo vērtējumu.",
    },
    et: {
      quickQuestions: [
        "Hinda seda põldu.",
      "Mis on praegu suurim risk?",
      "Mida peaksin täna põllul kontrollima?",
      "Milline on veeolukord?",
      "Milline on kultuuri toitainetega varustatus?",
      "Millised olulised andmed puuduvad?",
      ],
      maxLength: "Küsimus võib sisaldada kuni 2000 märki.",
      invalidResponse: "AI Agronomi server tagastas vigase vastuse.",
      serverError: (status: number) => `AI Agronom tagastas serverivea (${status}).`,
      emptyAnswer: "AI Agronom ei loonud vastust.",
      unavailable: "AI Agronom ei ole praegu saadaval.",
      description: "Selgitab põllu praegust seisundit AEGRIS-e andmete, Decision Engine'i, satelliitseire, ilma, mullastiku konteksti ja agronoomiliste andmete põhjal.",
      ready: "Valmis",
      whatToAsk: "Mida saate küsida",
      evaluating: "AI Agronom hindab põlluandmeid…",
      placeholder: "Küsige AI Agronomilt selle põllu kohta…",
      evaluatingButton: "Hindamine…",
      ask: "Küsi",
      disclaimer: "AI Agronom selgitab AEGRIS-e andmeid. See ei asenda põllu ülevaatust ega agronoomi professionaalset hinnangut.",
    },
    el: {
      quickQuestions: [
        "Αξιολογήστε αυτό το αγροτεμάχιο.",
      "Ποιος είναι ο μεγαλύτερος κίνδυνος αυτή τη στιγμή;",
      "Τι πρέπει να ελέγξω σήμερα στο χωράφι;",
      "Ποια είναι η κατάσταση του νερού;",
      "Ποια είναι η θρεπτική κατάσταση της καλλιέργειας;",
      "Ποια σημαντικά δεδομένα λείπουν;",
      ],
      maxLength: "Η ερώτηση μπορεί να περιέχει έως 2000 χαρακτήρες.",
      invalidResponse: "Ο διακομιστής AI Agronom επέστρεψε μη έγκυρη απάντηση.",
      serverError: (status: number) => `Το AI Agronom επέστρεψε σφάλμα διακομιστή (${status}).`,
      emptyAnswer: "Το AI Agronom δεν δημιούργησε απάντηση.",
      unavailable: "Το AI Agronom δεν είναι διαθέσιμο αυτή τη στιγμή.",
      description: "Εξηγεί την τρέχουσα κατάσταση του αγροτεμαχίου με βάση δεδομένα AEGRIS, το Decision Engine, δορυφορική παρακολούθηση, καιρό, εδαφικό πλαίσιο και γεωπονικά δεδομένα.",
      ready: "Έτοιμο",
      whatToAsk: "Τι μπορείτε να ρωτήσετε",
      evaluating: "Το AI Agronom αξιολογεί τα δεδομένα του αγροτεμαχίου…",
      placeholder: "Ρωτήστε το AI Agronom για αυτό το αγροτεμάχιο…",
      evaluatingButton: "Αξιολόγηση…",
      ask: "Ρώτησε",
      disclaimer: "Το AI Agronom εξηγεί τα δεδομένα AEGRIS. Δεν αντικαθιστά τον επιτόπιο έλεγχο ή την επαγγελματική κρίση γεωπόνου.",
    },
    sv: {
      quickQuestions: [
        "Bedöm det här fältet.",
      "Vilken är den största risken just nu?",
      "Vad bör jag kontrollera på fältet idag?",
      "Hur ser vattensituationen ut?",
      "Hur är grödans näringsstatus?",
      "Vilka viktiga data saknas?",
      ],
      maxLength: "Frågan får innehålla högst 2000 tecken.",
      invalidResponse: "AI Agronom-servern returnerade ett ogiltigt svar.",
      serverError: (status: number) => `AI Agronom returnerade ett serverfel (${status}).`,
      emptyAnswer: "AI Agronom genererade inget svar.",
      unavailable: "AI Agronom är för närvarande inte tillgänglig.",
      description: "Förklarar fältets aktuella tillstånd med hjälp av AEGRIS-data, Decision Engine, satellitövervakning, väder, markkontext och agronomiska data.",
      ready: "Klar",
      whatToAsk: "Vad du kan fråga",
      evaluating: "AI Agronom utvärderar fältdata…",
      placeholder: "Fråga AI Agronom om det här fältet…",
      evaluatingButton: "Utvärderar…",
      ask: "Fråga",
      disclaimer: "AI Agronom förklarar AEGRIS-data. Det ersätter inte fältinspektion eller en agronoms professionella bedömning.",
    },
    da: {
      quickQuestions: [
        "Vurder denne mark.",
      "Hvad er den største risiko lige nu?",
      "Hvad bør jeg kontrollere i marken i dag?",
      "Hvordan er vandsituationen?",
      "Hvordan er afgrødens ernæringstilstand?",
      "Hvilke vigtige data mangler?",
      ],
      maxLength: "Spørgsmålet må højst indeholde 2000 tegn.",
      invalidResponse: "AI Agronom-serveren returnerede et ugyldigt svar.",
      serverError: (status: number) => `AI Agronom returnerede en serverfejl (${status}).`,
      emptyAnswer: "AI Agronom genererede ikke et svar.",
      unavailable: "AI Agronom er ikke tilgængelig i øjeblikket.",
      description: "Forklarer markens aktuelle tilstand ved hjælp af AEGRIS-data, Decision Engine, satellitovervågning, vejr, jordbundskontekst og agronomiske data.",
      ready: "Klar",
      whatToAsk: "Hvad du kan spørge om",
      evaluating: "AI Agronom vurderer markdata…",
      placeholder: "Spørg AI Agronom om denne mark…",
      evaluatingButton: "Vurderer…",
      ask: "Spørg",
      disclaimer: "AI Agronom forklarer AEGRIS-data. Det erstatter ikke markinspektion eller en agronoms faglige vurdering.",
    },
    no: {
      quickQuestions: [
        "Vurder dette jordet.",
      "Hva er den største risikoen akkurat nå?",
      "Hva bør jeg kontrollere på jordet i dag?",
      "Hvordan er vannsituasjonen?",
      "Hvordan er næringsstatusen til veksten?",
      "Hvilke viktige data mangler?",
      ],
      maxLength: "Spørsmålet kan inneholde maksimalt 2000 tegn.",
      invalidResponse: "AI Agronom-serveren returnerte et ugyldig svar.",
      serverError: (status: number) => `AI Agronom returnerte en serverfeil (${status}).`,
      emptyAnswer: "AI Agronom genererte ikke noe svar.",
      unavailable: "AI Agronom er ikke tilgjengelig for øyeblikket.",
      description: "Forklarer jordets nåværende tilstand ved hjelp av AEGRIS-data, Decision Engine, satellittovervåking, vær, jordkontekst og agronomiske data.",
      ready: "Klar",
      whatToAsk: "Hva du kan spørre om",
      evaluating: "AI Agronom vurderer feltdata…",
      placeholder: "Spør AI Agronom om dette jordet…",
      evaluatingButton: "Vurderer…",
      ask: "Spør",
      disclaimer: "AI Agronom forklarer AEGRIS-data. Det erstatter ikke feltinspeksjon eller en agronoms faglige vurdering.",
    },
    fi: {
      quickQuestions: [
        "Arvioi tämä lohko.",
      "Mikä on suurin riski juuri nyt?",
      "Mitä minun pitäisi tarkistaa pellolla tänään?",
      "Millainen vesitilanne on?",
      "Millainen kasvuston ravinnetila on?",
      "Mitä tärkeitä tietoja puuttuu?",
      ],
      maxLength: "Kysymys voi sisältää enintään 2000 merkkiä.",
      invalidResponse: "AI Agronom -palvelin palautti virheellisen vastauksen.",
      serverError: (status: number) => `AI Agronom palautti palvelinvirheen (${status}).`,
      emptyAnswer: "AI Agronom ei tuottanut vastausta.",
      unavailable: "AI Agronom ei ole tällä hetkellä käytettävissä.",
      description: "Selittää lohkon nykytilan AEGRIS-tietojen, Decision Enginen, satelliittiseurannan, sään, maaperäkontekstin ja agronomisten tietojen perusteella.",
      ready: "Valmis",
      whatToAsk: "Mitä voit kysyä",
      evaluating: "AI Agronom arvioi lohkon tietoja…",
      placeholder: "Kysy AI Agronomilta tästä lohkosta…",
      evaluatingButton: "Arvioidaan…",
      ask: "Kysy",
      disclaimer: "AI Agronom selittää AEGRIS-tietoja. Se ei korvaa maastotarkastusta eikä agronomin ammatillista harkintaa.",
    }
  };

  return copies[language as keyof typeof copies] ?? copies.en;
}

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/*
 * Jednoduchý bezpečný Markdown renderer.
 *
 * Záměrně nepoužívá dangerouslySetInnerHTML.
 * Podporuje formát, který používá AI Agronom:
 * - ## nadpis
 * - ### podnadpis
 * - **tučný text**
 * - odrážky
 * - číslované kroky
 * - běžné odstavce
 */
function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={`${part}-${index}`}
          className="font-black text-slate-100"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  return (
    <div className="space-y-2.5">
      {lines.map((rawLine, index) => {
        const line = rawLine.trim();

        if (!line) {
          return <div key={`blank-${index}`} className="h-1" />;
        }

        if (line.startsWith("### ")) {
          return (
            <h4
              key={`h3-${index}`}
              className="pt-2 text-sm font-black tracking-tight text-slate-100"
            >
              {renderInlineMarkdown(line.slice(4))}
            </h4>
          );
        }

        if (line.startsWith("## ")) {
          return (
            <h3
              key={`h2-${index}`}
              className="pt-3 text-base font-black tracking-tight text-white first:pt-0"
            >
              {renderInlineMarkdown(line.slice(3))}
            </h3>
          );
        }

        if (/^[-•]\s+/.test(line)) {
          return (
            <div
              key={`bullet-${index}`}
              className="flex gap-2.5 text-sm leading-6 text-slate-300"
            >
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
              <div>{renderInlineMarkdown(line.replace(/^[-•]\s+/, ""))}</div>
            </div>
          );
        }

        const numberedMatch = line.match(/^(\d+)[.)]\s+(.*)$/);

        if (numberedMatch) {
          return (
            <div
              key={`number-${index}`}
              className="flex gap-3 text-sm leading-6 text-slate-300"
            >
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400/10 px-1.5 text-[10px] font-black text-cyan-300">
                {numberedMatch[1]}
              </span>

              <div className="-mt-0.5">
                {renderInlineMarkdown(numberedMatch[2])}
              </div>
            </div>
          );
        }

        return (
          <p
            key={`paragraph-${index}`}
            className="text-sm leading-6 text-slate-300"
          >
            {renderInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}

export default function AiAgronom({ projectId }: AiAgronomProps) {
  const { language } = useLanguage();
  const copy = getAiAgronomCopy(language);
  const quickQuestions = copy.quickQuestions;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const canSubmit = useMemo(() => {
    return input.trim().length > 0 && !isLoading;
  }, [input, isLoading]);

  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      return;
    }

    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages, isLoading]);

  async function askAgronom(question: string) {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    if (trimmedQuestion.length > 2000) {
      setError(copy.maxLength);
      return;
    }

    setError(null);
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      text: trimmedQuestion,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");

    try {
      const response = await fetch("/api/ai-agronom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          message: trimmedQuestion,
          language,
        }),
      });

      let data: AiAgronomResponse;

      try {
        data = (await response.json()) as AiAgronomResponse;
      } catch {
        throw new Error(copy.invalidResponse);
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            copy.serverError(response.status)
        );
      }

      if (!data.answer?.trim()) {
        throw new Error(copy.emptyAnswer);
      }

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        text: data.answer.trim(),
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (caughtError) {
      console.error("AI AGRONOM CLIENT ERROR:", caughtError);

      const message =
        caughtError instanceof Error
          ? caughtError.message
          : copy.unavailable;

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    await askAgronom(input);
  }

  return (
    <section className="mt-3 rounded-[28px] border border-slate-800 bg-[#081018] p-5 shadow-2xl shadow-black/10 md:p-7">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400" />

              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-400">
                AEGRIS Intelligence
              </p>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white">
              AI Agronom
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              {copy.description}
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-300">
              {copy.ready}
            </span>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 md:p-5">
            <p className="text-sm font-bold text-slate-200">
              {copy.whatToAsk}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void askAgronom(question)}
                  disabled={isLoading}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-left text-xs font-semibold text-slate-300 transition hover:border-cyan-500/50 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-h-[560px] space-y-4 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/40 p-4 pr-2 md:p-5 md:pr-3">
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={
                      isUser
                        ? "max-w-[90%] rounded-2xl rounded-br-md border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm leading-6 text-cyan-50 md:max-w-[75%]"
                        : "max-w-[96%] rounded-2xl rounded-bl-md border border-slate-700 bg-[#101827] px-4 py-4 text-sm leading-6 text-slate-200 md:max-w-[92%] md:px-5 md:py-5"
                    }
                  >
                    {!isUser && (
                      <div className="mb-3 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                          AI Agronom
                        </div>
                      </div>
                    )}

                    {isUser ? (
                      <div className="whitespace-pre-wrap">
                        {message.text}
                      </div>
                    ) : (
                      <MarkdownText text={message.text} />
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-slate-700 bg-[#101827] px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />

                    <span className="text-xs font-semibold text-slate-400">
                      {copy.evaluating}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}

        {messages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quickQuestions.slice(1).map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => void askAgronom(question)}
                disabled={isLoading}
                className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:border-cyan-500/40 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3"
        >
          <div className="flex flex-col gap-3 md:flex-row">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={copy.placeholder}
              rows={3}
              maxLength={2000}
              disabled={isLoading}
              className="min-h-[88px] flex-1 resize-none rounded-xl border border-slate-800 bg-[#0b141d] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={!canSubmit}
              className="min-w-[150px] rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 md:self-stretch"
            >
              {isLoading ? copy.evaluatingButton : copy.ask}
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 px-1">
            <p className="text-[10px] leading-4 text-slate-600">
              {copy.disclaimer}
            </p>

            <span className="shrink-0 text-[10px] tabular-nums text-slate-600">
              {input.length}/2000
            </span>
          </div>
        </form>
      </div>
    </section>
  );
}