"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import BackButton from "../components/BackButton";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";
import { supabase } from "@/lib/supabase";

type SupportTicket = {
  id: number;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

type SupportMessage = {
  id: number;
  ticket_id: number;
  author_user_id: string | null;
  author_role: "customer" | "admin";
  message: string;
  created_at: string;
};

type ConversationState = {
  loading: boolean;
  messages: SupportMessage[];
  reply: string;
  submitting: boolean;
  error: string;
};

function getSupportCopy(language: string) {
  const en = {
    ticketsLoadFailed: "Support requests could not be loaded.",
    conversationLoadFailed: "The conversation could not be loaded.",
    subjectLength: "Subject must contain 3 to 160 characters.",
    messageLength: "Problem description must contain 10 to 5000 characters.",
    submitFailed: "The support request could not be sent.",
    submitSuccess: (id: number) => `Request #${id} was sent successfully.`,
    replyLength: "Reply must contain 1 to 10,000 characters.",
    replyFailed: "The reply could not be sent.",
    loadingSupport: "Loading support...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Support",
    description: "Contact AEGRIS Support and track the status of your requests.",
    newRequest: "New request",
    contactSupport: "Contact support",
    formDescription:
      "Describe the problem as precisely as possible. The support request will automatically be linked to your AEGRIS account.",
    signedInAccount: "Signed-in account",
    subject: "Subject",
    subjectPlaceholder: "For example, problem with project analysis",
    problemDescription: "Problem description",
    messagePlaceholder:
      "Describe what happened, which project was affected, and what you expected...",
    sending: "Sending...",
    sendRequest: "Send request",
    myRequests: "My requests",
    supportHistory: "Support history",
    historyDescription:
      "Open a ticket to view the complete conversation with AEGRIS Support.",
    ticketCount: (count: number) => `${count} ${count === 1 ? "ticket" : "tickets"}`,
    loadingRequests: "Loading requests...",
    noRequests: "No requests yet",
    noRequestsDescription:
      "Once you contact support, your request will appear here.",
    priority: "Priority",
    hide: "Hide",
    open: "Open",
    loadingConversation: "Loading conversation...",
    you: "You",
    originalMessage: "Original message",
    supportReply: "Support reply",
    yourReply: "Your reply",
    noMoreMessages: "There are no additional messages yet.",
    resolvedPrefix: "This ticket was resolved",
    resolvedSuffix: ". Further replies are locked.",
    reply: "Reply",
    replyPlaceholder: "Write a reply to AEGRIS Support...",
    sendReply: "Send reply",
    footer: "Agriculture Intelligence · customer support",
    statusOpen: "Open",
    statusInProgress: "In progress",
    statusResolved: "Resolved",
    priorityLow: "Low",
    priorityNormal: "Normal",
    priorityHigh: "High",
    priorityUrgent: "Urgent",
  };

  const cs = {
    ...en,
    ticketsLoadFailed: "Support požadavky se nepodařilo načíst.",
    conversationLoadFailed: "Konverzaci se nepodařilo načíst.",
    subjectLength: "Předmět musí mít 3 až 160 znaků.",
    messageLength: "Popis problému musí mít 10 až 5000 znaků.",
    submitFailed: "Support požadavek se nepodařilo odeslat.",
    submitSuccess: (id: number) => `Požadavek #${id} byl úspěšně odeslán.`,
    replyLength: "Odpověď musí obsahovat 1 až 10 000 znaků.",
    replyFailed: "Odpověď se nepodařilo odeslat.",
    loadingSupport: "Načítám support...",
    title: "Support",
    description: "Kontaktujte podporu AEGRIS a sledujte stav svých požadavků.",
    newRequest: "Nový požadavek",
    contactSupport: "Kontaktovat podporu",
    formDescription:
      "Popište problém co nejpřesněji. Support požadavek bude automaticky propojen s vaším AEGRIS účtem.",
    signedInAccount: "Přihlášený účet",
    subject: "Předmět",
    subjectPlaceholder: "Např. problém s analýzou projektu",
    problemDescription: "Popis problému",
    messagePlaceholder:
      "Popište, co se stalo, u kterého projektu a co jste očekávali...",
    sending: "Odesílám...",
    sendRequest: "Odeslat požadavek",
    myRequests: "Moje požadavky",
    supportHistory: "Historie supportu",
    historyDescription:
      "Otevřete ticket a zobrazte kompletní komunikaci s AEGRIS Supportem.",
    ticketCount: (count: number) => `${count} ticketů`,
    loadingRequests: "Načítám požadavky...",
    noRequests: "Zatím žádné požadavky",
    noRequestsDescription:
      "Jakmile kontaktujete podporu, požadavek se zobrazí zde.",
    priority: "Priorita",
    hide: "Skrýt",
    open: "Otevřít",
    loadingConversation: "Načítám konverzaci...",
    you: "Vy",
    originalMessage: "Původní zpráva",
    supportReply: "Odpověď podpory",
    yourReply: "Vaše odpověď",
    noMoreMessages: "Zatím zde nejsou žádné další zprávy.",
    resolvedPrefix: "Tento ticket byl vyřešen",
    resolvedSuffix: ". Další odpovědi jsou uzamčeny.",
    reply: "Odpovědět",
    replyPlaceholder: "Napište odpověď AEGRIS Supportu...",
    sendReply: "Odeslat odpověď",
    footer: "Agriculture Intelligence · zákaznická podpora",
    statusOpen: "Otevřený",
    statusInProgress: "V řešení",
    statusResolved: "Vyřešený",
    priorityLow: "Nízká",
    priorityNormal: "Normální",
    priorityHigh: "Vysoká",
    priorityUrgent: "Urgentní",
  };

  const sk = {
    ticketsLoadFailed: "Požiadavky podpory sa nepodarilo načítať.",
    conversationLoadFailed: "Konverzáciu sa nepodarilo načítať.",
    subjectLength: "Predmet musí obsahovať 3 až 160 znakov.",
    messageLength: "Popis problému musí obsahovať 10 až 5000 znakov.",
    submitFailed: "Požiadavku podpory sa nepodarilo odoslať.",
    submitSuccess: (id: number) => `Požiadavka #${id} bola úspešne odoslaná.`,
    replyLength: "Odpoveď musí obsahovať 1 až 10 000 znakov.",
    replyFailed: "Odpoveď sa nepodarilo odoslať.",
    loadingSupport: "Načítavam podporu...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Podpora",
    description: "Kontaktujte podporu AEGRIS a sledujte stav svojich požiadaviek.",
    newRequest: "Nová požiadavka",
    contactSupport: "Kontaktovať podporu",
    formDescription: "Popíšte problém čo najpresnejšie. Požiadavka bude automaticky prepojená s vaším účtom AEGRIS.",
    signedInAccount: "Prihlásený účet",
    subject: "Predmet",
    subjectPlaceholder: "Napríklad problém s analýzou projektu",
    problemDescription: "Popis problému",
    messagePlaceholder: "Popíšte, čo sa stalo, ktorého projektu sa to týka a čo ste očakávali...",
    sending: "Odosielam...",
    sendRequest: "Odoslať požiadavku",
    myRequests: "Moje požiadavky",
    supportHistory: "História podpory",
    historyDescription: "Otvorte ticket a zobrazte celú komunikáciu s podporou AEGRIS.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Načítavam požiadavky...",
    noRequests: "Zatiaľ žiadne požiadavky",
    noRequestsDescription: "Po kontaktovaní podpory sa vaša požiadavka zobrazí tu.",
    priority: "Priorita",
    hide: "Skryť",
    open: "Otvoriť",
    loadingConversation: "Načítavam konverzáciu...",
    you: "Vy",
    originalMessage: "Pôvodná správa",
    supportReply: "Odpoveď podpory",
    yourReply: "Vaša odpoveď",
    noMoreMessages: "Zatiaľ tu nie sú žiadne ďalšie správy.",
    resolvedPrefix: "Tento ticket bol vyriešený",
    resolvedSuffix: ". Ďalšie odpovede sú uzamknuté.",
    reply: "Odpovedať",
    replyPlaceholder: "Napíšte odpoveď podpore AEGRIS...",
    sendReply: "Odoslať odpoveď",
    footer: "Agriculture Intelligence · zákaznícka podpora",
    statusOpen: "Otvorený",
    statusInProgress: "V riešení",
    statusResolved: "Vyriešený",
    priorityLow: "Nízka",
    priorityNormal: "Normálna",
    priorityHigh: "Vysoká",
    priorityUrgent: "Urgentná",
  };

  const de = {
    ticketsLoadFailed: "Supportanfragen konnten nicht geladen werden.",
    conversationLoadFailed: "Die Unterhaltung konnte nicht geladen werden.",
    subjectLength: "Der Betreff muss 3 bis 160 Zeichen enthalten.",
    messageLength: "Die Problembeschreibung muss 10 bis 5000 Zeichen enthalten.",
    submitFailed: "Die Supportanfrage konnte nicht gesendet werden.",
    submitSuccess: (id: number) => `Anfrage #${id} wurde erfolgreich gesendet.`,
    replyLength: "Die Antwort muss 1 bis 10.000 Zeichen enthalten.",
    replyFailed: "Die Antwort konnte nicht gesendet werden.",
    loadingSupport: "Support wird geladen...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Support",
    description: "Kontaktieren Sie den AEGRIS Support und verfolgen Sie den Status Ihrer Anfragen.",
    newRequest: "Neue Anfrage",
    contactSupport: "Support kontaktieren",
    formDescription: "Beschreiben Sie das Problem so genau wie möglich. Die Anfrage wird automatisch mit Ihrem AEGRIS-Konto verknüpft.",
    signedInAccount: "Angemeldetes Konto",
    subject: "Betreff",
    subjectPlaceholder: "Zum Beispiel: Problem mit der Projektanalyse",
    problemDescription: "Problembeschreibung",
    messagePlaceholder: "Beschreiben Sie, was passiert ist, welches Projekt betroffen war und was Sie erwartet haben...",
    sending: "Wird gesendet...",
    sendRequest: "Anfrage senden",
    myRequests: "Meine Anfragen",
    supportHistory: "Supportverlauf",
    historyDescription: "Öffnen Sie ein Ticket, um die vollständige Unterhaltung mit dem AEGRIS Support anzuzeigen.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Anfragen werden geladen...",
    noRequests: "Noch keine Anfragen",
    noRequestsDescription: "Nachdem Sie den Support kontaktiert haben, erscheint Ihre Anfrage hier.",
    priority: "Priorität",
    hide: "Ausblenden",
    open: "Öffnen",
    loadingConversation: "Unterhaltung wird geladen...",
    you: "Sie",
    originalMessage: "Ursprüngliche Nachricht",
    supportReply: "Supportantwort",
    yourReply: "Ihre Antwort",
    noMoreMessages: "Es gibt noch keine weiteren Nachrichten.",
    resolvedPrefix: "Dieses Ticket wurde gelöst",
    resolvedSuffix: ". Weitere Antworten sind gesperrt.",
    reply: "Antworten",
    replyPlaceholder: "Schreiben Sie eine Antwort an den AEGRIS Support...",
    sendReply: "Antwort senden",
    footer: "Agriculture Intelligence · Kundensupport",
    statusOpen: "Offen",
    statusInProgress: "In Bearbeitung",
    statusResolved: "Gelöst",
    priorityLow: "Niedrig",
    priorityNormal: "Normal",
    priorityHigh: "Hoch",
    priorityUrgent: "Dringend",
  };

  const pl = {
    ticketsLoadFailed: "Nie udało się załadować zgłoszeń.",
    conversationLoadFailed: "Nie udało się załadować rozmowy.",
    subjectLength: "Temat musi mieć od 3 do 160 znaków.",
    messageLength: "Opis problemu musi mieć od 10 do 5000 znaków.",
    submitFailed: "Nie udało się wysłać zgłoszenia.",
    submitSuccess: (id: number) => `Zgłoszenie #${id} zostało wysłane pomyślnie.`,
    replyLength: "Odpowiedź musi mieć od 1 do 10 000 znaków.",
    replyFailed: "Nie udało się wysłać odpowiedzi.",
    loadingSupport: "Ładowanie wsparcia...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Wsparcie",
    description: "Skontaktuj się z pomocą AEGRIS i śledź status swoich zgłoszeń.",
    newRequest: "Nowe zgłoszenie",
    contactSupport: "Skontaktuj się ze wsparciem",
    formDescription: "Opisz problem jak najdokładniej. Zgłoszenie zostanie automatycznie powiązane z kontem AEGRIS.",
    signedInAccount: "Zalogowane konto",
    subject: "Temat",
    subjectPlaceholder: "Na przykład problem z analizą projektu",
    problemDescription: "Opis problemu",
    messagePlaceholder: "Opisz, co się stało, którego projektu dotyczył problem i czego oczekiwano...",
    sending: "Wysyłanie...",
    sendRequest: "Wyślij zgłoszenie",
    myRequests: "Moje zgłoszenia",
    supportHistory: "Historia wsparcia",
    historyDescription: "Otwórz zgłoszenie, aby zobaczyć pełną rozmowę ze wsparciem AEGRIS.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Ładowanie zgłoszeń...",
    noRequests: "Brak zgłoszeń",
    noRequestsDescription: "Po skontaktowaniu się ze wsparciem zgłoszenie pojawi się tutaj.",
    priority: "Priorytet",
    hide: "Ukryj",
    open: "Otwórz",
    loadingConversation: "Ładowanie rozmowy...",
    you: "Ty",
    originalMessage: "Pierwotna wiadomość",
    supportReply: "Odpowiedź wsparcia",
    yourReply: "Twoja odpowiedź",
    noMoreMessages: "Nie ma jeszcze dodatkowych wiadomości.",
    resolvedPrefix: "To zgłoszenie zostało rozwiązane",
    resolvedSuffix: ". Dalsze odpowiedzi są zablokowane.",
    reply: "Odpowiedz",
    replyPlaceholder: "Napisz odpowiedź do wsparcia AEGRIS...",
    sendReply: "Wyślij odpowiedź",
    footer: "Agriculture Intelligence · obsługa klienta",
    statusOpen: "Otwarte",
    statusInProgress: "W toku",
    statusResolved: "Rozwiązane",
    priorityLow: "Niski",
    priorityNormal: "Normalny",
    priorityHigh: "Wysoki",
    priorityUrgent: "Pilny",
  };

  const fr = {
    ticketsLoadFailed: "Les demandes d’assistance n’ont pas pu être chargées.",
    conversationLoadFailed: "La conversation n’a pas pu être chargée.",
    subjectLength: "L’objet doit contenir entre 3 et 160 caractères.",
    messageLength: "La description doit contenir entre 10 et 5000 caractères.",
    submitFailed: "La demande n’a pas pu être envoyée.",
    submitSuccess: (id: number) => `Demande #${id} a été envoyée avec succès.`,
    replyLength: "La réponse doit contenir entre 1 et 10 000 caractères.",
    replyFailed: "La réponse n’a pas pu être envoyée.",
    loadingSupport: "Chargement de l’assistance...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Assistance",
    description: "Contactez l’assistance AEGRIS et suivez l’état de vos demandes.",
    newRequest: "Nouvelle demande",
    contactSupport: "Contacter l’assistance",
    formDescription: "Décrivez le problème aussi précisément que possible. La demande sera liée automatiquement à votre compte AEGRIS.",
    signedInAccount: "Compte connecté",
    subject: "Objet",
    subjectPlaceholder: "Par exemple, problème avec l’analyse du projet",
    problemDescription: "Description du problème",
    messagePlaceholder: "Décrivez ce qui s’est passé, le projet concerné et le résultat attendu...",
    sending: "Envoi...",
    sendRequest: "Envoyer la demande",
    myRequests: "Mes demandes",
    supportHistory: "Historique de l’assistance",
    historyDescription: "Ouvrez un ticket pour afficher toute la conversation avec l’assistance AEGRIS.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Chargement des demandes...",
    noRequests: "Aucune demande",
    noRequestsDescription: "Après avoir contacté l’assistance, votre demande apparaîtra ici.",
    priority: "Priorité",
    hide: "Masquer",
    open: "Ouvrir",
    loadingConversation: "Chargement de la conversation...",
    you: "Vous",
    originalMessage: "Message initial",
    supportReply: "Réponse de l’assistance",
    yourReply: "Votre réponse",
    noMoreMessages: "Il n’y a pas encore d’autres messages.",
    resolvedPrefix: "Ce ticket a été résolu",
    resolvedSuffix: ". Les réponses supplémentaires sont verrouillées.",
    reply: "Répondre",
    replyPlaceholder: "Écrivez une réponse à l’assistance AEGRIS...",
    sendReply: "Envoyer la réponse",
    footer: "Agriculture Intelligence · assistance client",
    statusOpen: "Ouvert",
    statusInProgress: "En cours",
    statusResolved: "Résolu",
    priorityLow: "Faible",
    priorityNormal: "Normale",
    priorityHigh: "Élevée",
    priorityUrgent: "Urgente",
  };

  const es = {
    ticketsLoadFailed: "No se pudieron cargar las solicitudes de soporte.",
    conversationLoadFailed: "No se pudo cargar la conversación.",
    subjectLength: "El asunto debe tener entre 3 y 160 caracteres.",
    messageLength: "La descripción debe tener entre 10 y 5000 caracteres.",
    submitFailed: "No se pudo enviar la solicitud.",
    submitSuccess: (id: number) => `Solicitud #${id} se envió correctamente.`,
    replyLength: "La respuesta debe tener entre 1 y 10 000 caracteres.",
    replyFailed: "No se pudo enviar la respuesta.",
    loadingSupport: "Cargando soporte...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Soporte",
    description: "Contacte con el soporte de AEGRIS y siga el estado de sus solicitudes.",
    newRequest: "Nueva solicitud",
    contactSupport: "Contactar con soporte",
    formDescription: "Describa el problema con la mayor precisión posible. La solicitud se vinculará automáticamente a su cuenta AEGRIS.",
    signedInAccount: "Cuenta conectada",
    subject: "Asunto",
    subjectPlaceholder: "Por ejemplo, problema con el análisis del proyecto",
    problemDescription: "Descripción del problema",
    messagePlaceholder: "Describa qué ocurrió, qué proyecto se vio afectado y qué esperaba...",
    sending: "Enviando...",
    sendRequest: "Enviar solicitud",
    myRequests: "Mis solicitudes",
    supportHistory: "Historial de soporte",
    historyDescription: "Abra un ticket para ver la conversación completa con el soporte de AEGRIS.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Cargando solicitudes...",
    noRequests: "Aún no hay solicitudes",
    noRequestsDescription: "Cuando contacte con soporte, su solicitud aparecerá aquí.",
    priority: "Prioridad",
    hide: "Ocultar",
    open: "Abrir",
    loadingConversation: "Cargando conversación...",
    you: "Usted",
    originalMessage: "Mensaje original",
    supportReply: "Respuesta de soporte",
    yourReply: "Su respuesta",
    noMoreMessages: "Aún no hay mensajes adicionales.",
    resolvedPrefix: "Este ticket se resolvió",
    resolvedSuffix: ". Las respuestas adicionales están bloqueadas.",
    reply: "Responder",
    replyPlaceholder: "Escriba una respuesta al soporte de AEGRIS...",
    sendReply: "Enviar respuesta",
    footer: "Agriculture Intelligence · atención al cliente",
    statusOpen: "Abierto",
    statusInProgress: "En curso",
    statusResolved: "Resuelto",
    priorityLow: "Baja",
    priorityNormal: "Normal",
    priorityHigh: "Alta",
    priorityUrgent: "Urgente",
  };

  const it = {
    ticketsLoadFailed: "Impossibile caricare le richieste di supporto.",
    conversationLoadFailed: "Impossibile caricare la conversazione.",
    subjectLength: "L’oggetto deve contenere da 3 a 160 caratteri.",
    messageLength: "La descrizione deve contenere da 10 a 5000 caratteri.",
    submitFailed: "Impossibile inviare la richiesta.",
    submitSuccess: (id: number) => `Richiesta #${id} è stata inviata correttamente.`,
    replyLength: "La risposta deve contenere da 1 a 10.000 caratteri.",
    replyFailed: "Impossibile inviare la risposta.",
    loadingSupport: "Caricamento supporto...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Supporto",
    description: "Contatta il supporto AEGRIS e monitora lo stato delle tue richieste.",
    newRequest: "Nuova richiesta",
    contactSupport: "Contatta il supporto",
    formDescription: "Descrivi il problema nel modo più preciso possibile. La richiesta verrà collegata automaticamente al tuo account AEGRIS.",
    signedInAccount: "Account connesso",
    subject: "Oggetto",
    subjectPlaceholder: "Ad esempio, problema con l’analisi del progetto",
    problemDescription: "Descrizione del problema",
    messagePlaceholder: "Descrivi cosa è successo, quale progetto è stato interessato e cosa ti aspettavi...",
    sending: "Invio...",
    sendRequest: "Invia richiesta",
    myRequests: "Le mie richieste",
    supportHistory: "Cronologia supporto",
    historyDescription: "Apri un ticket per vedere l’intera conversazione con il supporto AEGRIS.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Caricamento richieste...",
    noRequests: "Nessuna richiesta",
    noRequestsDescription: "Dopo aver contattato il supporto, la richiesta apparirà qui.",
    priority: "Priorità",
    hide: "Nascondi",
    open: "Apri",
    loadingConversation: "Caricamento conversazione...",
    you: "Tu",
    originalMessage: "Messaggio originale",
    supportReply: "Risposta del supporto",
    yourReply: "La tua risposta",
    noMoreMessages: "Non ci sono ancora altri messaggi.",
    resolvedPrefix: "Questo ticket è stato risolto",
    resolvedSuffix: ". Ulteriori risposte sono bloccate.",
    reply: "Rispondi",
    replyPlaceholder: "Scrivi una risposta al supporto AEGRIS...",
    sendReply: "Invia risposta",
    footer: "Agriculture Intelligence · assistenza clienti",
    statusOpen: "Aperto",
    statusInProgress: "In lavorazione",
    statusResolved: "Risolto",
    priorityLow: "Bassa",
    priorityNormal: "Normale",
    priorityHigh: "Alta",
    priorityUrgent: "Urgente",
  };

  const nl = {
    ticketsLoadFailed: "Supportverzoeken konden niet worden geladen.",
    conversationLoadFailed: "Het gesprek kon niet worden geladen.",
    subjectLength: "Het onderwerp moet 3 tot 160 tekens bevatten.",
    messageLength: "De probleembeschrijving moet 10 tot 5000 tekens bevatten.",
    submitFailed: "Het supportverzoek kon niet worden verzonden.",
    submitSuccess: (id: number) => `Verzoek #${id} is succesvol verzonden.`,
    replyLength: "Het antwoord moet 1 tot 10.000 tekens bevatten.",
    replyFailed: "Het antwoord kon niet worden verzonden.",
    loadingSupport: "Support laden...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Ondersteuning",
    description: "Neem contact op met AEGRIS Support en volg de status van uw verzoeken.",
    newRequest: "Nieuw verzoek",
    contactSupport: "Contact opnemen",
    formDescription: "Beschrijf het probleem zo nauwkeurig mogelijk. Het verzoek wordt automatisch aan uw AEGRIS-account gekoppeld.",
    signedInAccount: "Aangemeld account",
    subject: "Onderwerp",
    subjectPlaceholder: "Bijvoorbeeld: probleem met projectanalyse",
    problemDescription: "Probleembeschrijving",
    messagePlaceholder: "Beschrijf wat er gebeurde, welk project betrokken was en wat u verwachtte...",
    sending: "Verzenden...",
    sendRequest: "Verzoek verzenden",
    myRequests: "Mijn verzoeken",
    supportHistory: "Supportgeschiedenis",
    historyDescription: "Open een ticket om het volledige gesprek met AEGRIS Support te bekijken.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Verzoeken laden...",
    noRequests: "Nog geen verzoeken",
    noRequestsDescription: "Na contact met support verschijnt uw verzoek hier.",
    priority: "Prioriteit",
    hide: "Verbergen",
    open: "Openen",
    loadingConversation: "Gesprek laden...",
    you: "U",
    originalMessage: "Oorspronkelijk bericht",
    supportReply: "Antwoord van support",
    yourReply: "Uw antwoord",
    noMoreMessages: "Er zijn nog geen extra berichten.",
    resolvedPrefix: "Dit ticket is opgelost",
    resolvedSuffix: ". Verdere antwoorden zijn geblokkeerd.",
    reply: "Antwoorden",
    replyPlaceholder: "Schrijf een antwoord aan AEGRIS Support...",
    sendReply: "Antwoord verzenden",
    footer: "Agriculture Intelligence · klantenservice",
    statusOpen: "Open",
    statusInProgress: "In behandeling",
    statusResolved: "Opgelost",
    priorityLow: "Laag",
    priorityNormal: "Normaal",
    priorityHigh: "Hoog",
    priorityUrgent: "Urgent",
  };

  const pt = {
    ticketsLoadFailed: "Não foi possível carregar os pedidos de suporte.",
    conversationLoadFailed: "Não foi possível carregar a conversa.",
    subjectLength: "O assunto deve ter entre 3 e 160 caracteres.",
    messageLength: "A descrição deve ter entre 10 e 5000 caracteres.",
    submitFailed: "Não foi possível enviar o pedido.",
    submitSuccess: (id: number) => `Pedido #${id} foi enviado com sucesso.`,
    replyLength: "A resposta deve ter entre 1 e 10 000 caracteres.",
    replyFailed: "Não foi possível enviar a resposta.",
    loadingSupport: "A carregar suporte...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Suporte",
    description: "Contacte o Suporte AEGRIS e acompanhe o estado dos seus pedidos.",
    newRequest: "Novo pedido",
    contactSupport: "Contactar suporte",
    formDescription: "Descreva o problema com a maior precisão possível. O pedido será associado automaticamente à sua conta AEGRIS.",
    signedInAccount: "Conta autenticada",
    subject: "Assunto",
    subjectPlaceholder: "Por exemplo, problema com a análise do projeto",
    problemDescription: "Descrição do problema",
    messagePlaceholder: "Descreva o que aconteceu, qual projeto foi afetado e o que esperava...",
    sending: "A enviar...",
    sendRequest: "Enviar pedido",
    myRequests: "Os meus pedidos",
    supportHistory: "Histórico de suporte",
    historyDescription: "Abra um ticket para ver toda a conversa com o Suporte AEGRIS.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "A carregar pedidos...",
    noRequests: "Ainda não existem pedidos",
    noRequestsDescription: "Depois de contactar o suporte, o pedido aparecerá aqui.",
    priority: "Prioridade",
    hide: "Ocultar",
    open: "Abrir",
    loadingConversation: "A carregar conversa...",
    you: "Você",
    originalMessage: "Mensagem original",
    supportReply: "Resposta do suporte",
    yourReply: "A sua resposta",
    noMoreMessages: "Ainda não existem mensagens adicionais.",
    resolvedPrefix: "Este ticket foi resolvido",
    resolvedSuffix: ". As respostas adicionais estão bloqueadas.",
    reply: "Responder",
    replyPlaceholder: "Escreva uma resposta ao Suporte AEGRIS...",
    sendReply: "Enviar resposta",
    footer: "Agriculture Intelligence · apoio ao cliente",
    statusOpen: "Aberto",
    statusInProgress: "Em curso",
    statusResolved: "Resolvido",
    priorityLow: "Baixa",
    priorityNormal: "Normal",
    priorityHigh: "Alta",
    priorityUrgent: "Urgente",
  };

  const ro = {
    ticketsLoadFailed: "Solicitările de asistență nu au putut fi încărcate.",
    conversationLoadFailed: "Conversația nu a putut fi încărcată.",
    subjectLength: "Subiectul trebuie să conțină între 3 și 160 de caractere.",
    messageLength: "Descrierea trebuie să conțină între 10 și 5000 de caractere.",
    submitFailed: "Solicitarea nu a putut fi trimisă.",
    submitSuccess: (id: number) => `Solicitarea #${id} a fost trimisă cu succes.`,
    replyLength: "Răspunsul trebuie să conțină între 1 și 10.000 de caractere.",
    replyFailed: "Răspunsul nu a putut fi trimis.",
    loadingSupport: "Se încarcă asistența...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Asistență",
    description: "Contactați asistența AEGRIS și urmăriți starea solicitărilor dvs.",
    newRequest: "Solicitare nouă",
    contactSupport: "Contactați asistența",
    formDescription: "Descrieți problema cât mai precis. Solicitarea va fi asociată automat contului AEGRIS.",
    signedInAccount: "Cont autentificat",
    subject: "Subiect",
    subjectPlaceholder: "De exemplu, problemă cu analiza proiectului",
    problemDescription: "Descrierea problemei",
    messagePlaceholder: "Descrieți ce s-a întâmplat, proiectul afectat și ce rezultat așteptați...",
    sending: "Se trimite...",
    sendRequest: "Trimite solicitarea",
    myRequests: "Solicitările mele",
    supportHistory: "Istoric asistență",
    historyDescription: "Deschideți un ticket pentru a vedea conversația completă cu asistența AEGRIS.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Se încarcă solicitările...",
    noRequests: "Nicio solicitare",
    noRequestsDescription: "După contactarea asistenței, solicitarea va apărea aici.",
    priority: "Prioritate",
    hide: "Ascunde",
    open: "Deschide",
    loadingConversation: "Se încarcă conversația...",
    you: "Dvs.",
    originalMessage: "Mesaj inițial",
    supportReply: "Răspunsul asistenței",
    yourReply: "Răspunsul dvs.",
    noMoreMessages: "Nu există încă alte mesaje.",
    resolvedPrefix: "Acest ticket a fost rezolvat",
    resolvedSuffix: ". Răspunsurile suplimentare sunt blocate.",
    reply: "Răspunde",
    replyPlaceholder: "Scrieți un răspuns către asistența AEGRIS...",
    sendReply: "Trimite răspunsul",
    footer: "Agriculture Intelligence · asistență clienți",
    statusOpen: "Deschis",
    statusInProgress: "În lucru",
    statusResolved: "Rezolvat",
    priorityLow: "Scăzută",
    priorityNormal: "Normală",
    priorityHigh: "Ridicată",
    priorityUrgent: "Urgentă",
  };

  const hu = {
    ticketsLoadFailed: "A támogatási kérések betöltése sikertelen.",
    conversationLoadFailed: "A beszélgetés betöltése sikertelen.",
    subjectLength: "A tárgynak 3–160 karakterből kell állnia.",
    messageLength: "A probléma leírásának 10–5000 karakterből kell állnia.",
    submitFailed: "A kérés elküldése sikertelen.",
    submitSuccess: (id: number) => `Kérés #${id} sikeresen elküldve.`,
    replyLength: "A válasznak 1–10 000 karakterből kell állnia.",
    replyFailed: "A válasz elküldése sikertelen.",
    loadingSupport: "Támogatás betöltése...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Támogatás",
    description: "Lépjen kapcsolatba az AEGRIS támogatással, és kövesse kérései állapotát.",
    newRequest: "Új kérés",
    contactSupport: "Kapcsolat a támogatással",
    formDescription: "Írja le a problémát a lehető legpontosabban. A kérés automatikusan az AEGRIS-fiókjához kapcsolódik.",
    signedInAccount: "Bejelentkezett fiók",
    subject: "Tárgy",
    subjectPlaceholder: "Például probléma a projekt elemzésével",
    problemDescription: "Probléma leírása",
    messagePlaceholder: "Írja le, mi történt, melyik projektet érintette és mit várt...",
    sending: "Küldés...",
    sendRequest: "Kérés küldése",
    myRequests: "Kéréseim",
    supportHistory: "Támogatási előzmények",
    historyDescription: "Nyissa meg a ticketet az AEGRIS támogatással folytatott teljes beszélgetés megtekintéséhez.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Kérések betöltése...",
    noRequests: "Még nincs kérés",
    noRequestsDescription: "A támogatás megkeresése után a kérése itt jelenik meg.",
    priority: "Prioritás",
    hide: "Elrejtés",
    open: "Megnyitás",
    loadingConversation: "Beszélgetés betöltése...",
    you: "Ön",
    originalMessage: "Eredeti üzenet",
    supportReply: "Támogatási válasz",
    yourReply: "Az Ön válasza",
    noMoreMessages: "Még nincsenek további üzenetek.",
    resolvedPrefix: "Ez a ticket megoldódott",
    resolvedSuffix: ". További válaszok zárolva vannak.",
    reply: "Válasz",
    replyPlaceholder: "Írjon választ az AEGRIS támogatásnak...",
    sendReply: "Válasz küldése",
    footer: "Agriculture Intelligence · ügyféltámogatás",
    statusOpen: "Nyitott",
    statusInProgress: "Folyamatban",
    statusResolved: "Megoldva",
    priorityLow: "Alacsony",
    priorityNormal: "Normál",
    priorityHigh: "Magas",
    priorityUrgent: "Sürgős",
  };

  const uk = {
    ticketsLoadFailed: "Не вдалося завантажити звернення до підтримки.",
    conversationLoadFailed: "Не вдалося завантажити розмову.",
    subjectLength: "Тема має містити від 3 до 160 символів.",
    messageLength: "Опис проблеми має містити від 10 до 5000 символів.",
    submitFailed: "Не вдалося надіслати звернення.",
    submitSuccess: (id: number) => `Звернення #${id} успішно надіслано.`,
    replyLength: "Відповідь має містити від 1 до 10 000 символів.",
    replyFailed: "Не вдалося надіслати відповідь.",
    loadingSupport: "Завантаження підтримки...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Підтримка",
    description: "Зв’яжіться з підтримкою AEGRIS і відстежуйте стан своїх звернень.",
    newRequest: "Нове звернення",
    contactSupport: "Зв’язатися з підтримкою",
    formDescription: "Опишіть проблему якомога точніше. Звернення буде автоматично пов’язане з вашим обліковим записом AEGRIS.",
    signedInAccount: "Обліковий запис",
    subject: "Тема",
    subjectPlaceholder: "Наприклад, проблема з аналізом проєкту",
    problemDescription: "Опис проблеми",
    messagePlaceholder: "Опишіть, що сталося, якого проєкту це стосується та чого ви очікували...",
    sending: "Надсилання...",
    sendRequest: "Надіслати звернення",
    myRequests: "Мої звернення",
    supportHistory: "Історія підтримки",
    historyDescription: "Відкрийте ticket, щоб переглянути всю розмову з підтримкою AEGRIS.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Завантаження звернень...",
    noRequests: "Звернень ще немає",
    noRequestsDescription: "Після звернення до підтримки ваш запит з’явиться тут.",
    priority: "Пріоритет",
    hide: "Сховати",
    open: "Відкрити",
    loadingConversation: "Завантаження розмови...",
    you: "Ви",
    originalMessage: "Початкове повідомлення",
    supportReply: "Відповідь підтримки",
    yourReply: "Ваша відповідь",
    noMoreMessages: "Додаткових повідомлень поки немає.",
    resolvedPrefix: "Цей ticket вирішено",
    resolvedSuffix: ". Подальші відповіді заблоковані.",
    reply: "Відповісти",
    replyPlaceholder: "Напишіть відповідь підтримці AEGRIS...",
    sendReply: "Надіслати відповідь",
    footer: "Agriculture Intelligence · підтримка клієнтів",
    statusOpen: "Відкрите",
    statusInProgress: "У роботі",
    statusResolved: "Вирішене",
    priorityLow: "Низький",
    priorityNormal: "Звичайний",
    priorityHigh: "Високий",
    priorityUrgent: "Терміновий",
  };

  const bg = {
    ticketsLoadFailed: "Заявките за поддръжка не можаха да бъдат заредени.",
    conversationLoadFailed: "Разговорът не можа да бъде зареден.",
    subjectLength: "Темата трябва да съдържа от 3 до 160 знака.",
    messageLength: "Описанието трябва да съдържа от 10 до 5000 знака.",
    submitFailed: "Заявката не можа да бъде изпратена.",
    submitSuccess: (id: number) => `Заявка #${id} е изпратена успешно.`,
    replyLength: "Отговорът трябва да съдържа от 1 до 10 000 знака.",
    replyFailed: "Отговорът не можа да бъде изпратен.",
    loadingSupport: "Зареждане на поддръжката...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Поддръжка",
    description: "Свържете се с поддръжката на AEGRIS и следете състоянието на заявките си.",
    newRequest: "Нова заявка",
    contactSupport: "Свържете се с поддръжката",
    formDescription: "Опишете проблема възможно най-точно. Заявката ще бъде автоматично свързана с вашия AEGRIS акаунт.",
    signedInAccount: "Влязъл акаунт",
    subject: "Тема",
    subjectPlaceholder: "Например проблем с анализа на проект",
    problemDescription: "Описание на проблема",
    messagePlaceholder: "Опишете какво се е случило, кой проект е засегнат и какво сте очаквали...",
    sending: "Изпращане...",
    sendRequest: "Изпрати заявка",
    myRequests: "Моите заявки",
    supportHistory: "История на поддръжката",
    historyDescription: "Отворете ticket, за да видите целия разговор с поддръжката на AEGRIS.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Зареждане на заявки...",
    noRequests: "Все още няма заявки",
    noRequestsDescription: "След като се свържете с поддръжката, заявката ще се появи тук.",
    priority: "Приоритет",
    hide: "Скрий",
    open: "Отвори",
    loadingConversation: "Зареждане на разговора...",
    you: "Вие",
    originalMessage: "Първоначално съобщение",
    supportReply: "Отговор от поддръжката",
    yourReply: "Вашият отговор",
    noMoreMessages: "Все още няма допълнителни съобщения.",
    resolvedPrefix: "Този ticket е решен",
    resolvedSuffix: ". Допълнителните отговори са заключени.",
    reply: "Отговор",
    replyPlaceholder: "Напишете отговор до поддръжката на AEGRIS...",
    sendReply: "Изпрати отговор",
    footer: "Agriculture Intelligence · клиентска поддръжка",
    statusOpen: "Отворена",
    statusInProgress: "В процес",
    statusResolved: "Решена",
    priorityLow: "Нисък",
    priorityNormal: "Нормален",
    priorityHigh: "Висок",
    priorityUrgent: "Спешен",
  };

  const hr = {
    ticketsLoadFailed: "Zahtjeve podrške nije bilo moguće učitati.",
    conversationLoadFailed: "Razgovor nije bilo moguće učitati.",
    subjectLength: "Predmet mora sadržavati 3 do 160 znakova.",
    messageLength: "Opis problema mora sadržavati 10 do 5000 znakova.",
    submitFailed: "Zahtjev nije bilo moguće poslati.",
    submitSuccess: (id: number) => `Zahtjev #${id} uspješno je poslan.`,
    replyLength: "Odgovor mora sadržavati 1 do 10 000 znakova.",
    replyFailed: "Odgovor nije bilo moguće poslati.",
    loadingSupport: "Učitavanje podrške...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Podrška",
    description: "Kontaktirajte AEGRIS podršku i pratite status svojih zahtjeva.",
    newRequest: "Novi zahtjev",
    contactSupport: "Kontaktiraj podršku",
    formDescription: "Opišite problem što preciznije. Zahtjev će automatski biti povezan s vašim AEGRIS računom.",
    signedInAccount: "Prijavljeni račun",
    subject: "Predmet",
    subjectPlaceholder: "Na primjer, problem s analizom projekta",
    problemDescription: "Opis problema",
    messagePlaceholder: "Opišite što se dogodilo, koji je projekt pogođen i što ste očekivali...",
    sending: "Slanje...",
    sendRequest: "Pošalji zahtjev",
    myRequests: "Moji zahtjevi",
    supportHistory: "Povijest podrške",
    historyDescription: "Otvorite ticket za prikaz cijelog razgovora s AEGRIS podrškom.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Učitavanje zahtjeva...",
    noRequests: "Još nema zahtjeva",
    noRequestsDescription: "Nakon što kontaktirate podršku, zahtjev će se pojaviti ovdje.",
    priority: "Prioritet",
    hide: "Sakrij",
    open: "Otvori",
    loadingConversation: "Učitavanje razgovora...",
    you: "Vi",
    originalMessage: "Izvorna poruka",
    supportReply: "Odgovor podrške",
    yourReply: "Vaš odgovor",
    noMoreMessages: "Još nema dodatnih poruka.",
    resolvedPrefix: "Ovaj ticket je riješen",
    resolvedSuffix: ". Daljnji odgovori su zaključani.",
    reply: "Odgovori",
    replyPlaceholder: "Napišite odgovor AEGRIS podršci...",
    sendReply: "Pošalji odgovor",
    footer: "Agriculture Intelligence · korisnička podrška",
    statusOpen: "Otvoren",
    statusInProgress: "U obradi",
    statusResolved: "Riješen",
    priorityLow: "Nizak",
    priorityNormal: "Normalan",
    priorityHigh: "Visok",
    priorityUrgent: "Hitan",
  };

  const sl = {
    ticketsLoadFailed: "Zahtevkov za podporo ni bilo mogoče naložiti.",
    conversationLoadFailed: "Pogovora ni bilo mogoče naložiti.",
    subjectLength: "Zadeva mora vsebovati od 3 do 160 znakov.",
    messageLength: "Opis težave mora vsebovati od 10 do 5000 znakov.",
    submitFailed: "Zahtevka ni bilo mogoče poslati.",
    submitSuccess: (id: number) => `Zahtevek #${id} je bil uspešno poslan.`,
    replyLength: "Odgovor mora vsebovati od 1 do 10.000 znakov.",
    replyFailed: "Odgovora ni bilo mogoče poslati.",
    loadingSupport: "Nalaganje podpore...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Podpora",
    description: "Obrnite se na podporo AEGRIS in spremljajte stanje svojih zahtevkov.",
    newRequest: "Nov zahtevek",
    contactSupport: "Kontaktirajte podporo",
    formDescription: "Težavo opišite čim natančneje. Zahtevek bo samodejno povezan z vašim računom AEGRIS.",
    signedInAccount: "Prijavljen račun",
    subject: "Zadeva",
    subjectPlaceholder: "Na primer težava z analizo projekta",
    problemDescription: "Opis težave",
    messagePlaceholder: "Opišite, kaj se je zgodilo, kateri projekt je bil prizadet in kaj ste pričakovali...",
    sending: "Pošiljanje...",
    sendRequest: "Pošlji zahtevek",
    myRequests: "Moji zahtevki",
    supportHistory: "Zgodovina podpore",
    historyDescription: "Odprite ticket za ogled celotnega pogovora s podporo AEGRIS.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Nalaganje zahtevkov...",
    noRequests: "Še ni zahtevkov",
    noRequestsDescription: "Ko se obrnete na podporo, se bo zahtevek prikazal tukaj.",
    priority: "Prioriteta",
    hide: "Skrij",
    open: "Odpri",
    loadingConversation: "Nalaganje pogovora...",
    you: "Vi",
    originalMessage: "Izvirno sporočilo",
    supportReply: "Odgovor podpore",
    yourReply: "Vaš odgovor",
    noMoreMessages: "Dodatnih sporočil še ni.",
    resolvedPrefix: "Ta ticket je bil rešen",
    resolvedSuffix: ". Nadaljnji odgovori so zaklenjeni.",
    reply: "Odgovori",
    replyPlaceholder: "Napišite odgovor podpori AEGRIS...",
    sendReply: "Pošlji odgovor",
    footer: "Agriculture Intelligence · podpora strankam",
    statusOpen: "Odprt",
    statusInProgress: "V obravnavi",
    statusResolved: "Rešen",
    priorityLow: "Nizka",
    priorityNormal: "Normalna",
    priorityHigh: "Visoka",
    priorityUrgent: "Nujna",
  };

  const lt = {
    ticketsLoadFailed: "Pagalbos užklausų įkelti nepavyko.",
    conversationLoadFailed: "Pokalbio įkelti nepavyko.",
    subjectLength: "Temą turi sudaryti 3–160 simbolių.",
    messageLength: "Problemos aprašymą turi sudaryti 10–5000 simbolių.",
    submitFailed: "Užklausos išsiųsti nepavyko.",
    submitSuccess: (id: number) => `Užklausa #${id} sėkmingai išsiųsta.`,
    replyLength: "Atsakymą turi sudaryti 1–10 000 simbolių.",
    replyFailed: "Atsakymo išsiųsti nepavyko.",
    loadingSupport: "Įkeliama pagalba...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Pagalba",
    description: "Susisiekite su AEGRIS pagalba ir stebėkite savo užklausų būseną.",
    newRequest: "Nauja užklausa",
    contactSupport: "Susisiekti su pagalba",
    formDescription: "Aprašykite problemą kuo tiksliau. Užklausa bus automatiškai susieta su jūsų AEGRIS paskyra.",
    signedInAccount: "Prisijungta paskyra",
    subject: "Tema",
    subjectPlaceholder: "Pavyzdžiui, projekto analizės problema",
    problemDescription: "Problemos aprašymas",
    messagePlaceholder: "Aprašykite, kas nutiko, kuris projektas buvo paveiktas ir ko tikėjotės...",
    sending: "Siunčiama...",
    sendRequest: "Siųsti užklausą",
    myRequests: "Mano užklausos",
    supportHistory: "Pagalbos istorija",
    historyDescription: "Atidarykite ticket, kad peržiūrėtumėte visą pokalbį su AEGRIS pagalba.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Įkeliamos užklausos...",
    noRequests: "Užklausų dar nėra",
    noRequestsDescription: "Susisiekus su pagalba jūsų užklausa bus rodoma čia.",
    priority: "Prioritetas",
    hide: "Slėpti",
    open: "Atidaryti",
    loadingConversation: "Įkeliamas pokalbis...",
    you: "Jūs",
    originalMessage: "Pradinis pranešimas",
    supportReply: "Pagalbos atsakymas",
    yourReply: "Jūsų atsakymas",
    noMoreMessages: "Papildomų pranešimų dar nėra.",
    resolvedPrefix: "Šis ticket išspręstas",
    resolvedSuffix: ". Tolesni atsakymai užrakinti.",
    reply: "Atsakyti",
    replyPlaceholder: "Parašykite atsakymą AEGRIS pagalbai...",
    sendReply: "Siųsti atsakymą",
    footer: "Agriculture Intelligence · klientų pagalba",
    statusOpen: "Atidaryta",
    statusInProgress: "Vykdoma",
    statusResolved: "Išspręsta",
    priorityLow: "Žemas",
    priorityNormal: "Normalus",
    priorityHigh: "Aukštas",
    priorityUrgent: "Skubus",
  };

  const lv = {
    ticketsLoadFailed: "Atbalsta pieprasījumus neizdevās ielādēt.",
    conversationLoadFailed: "Sarunu neizdevās ielādēt.",
    subjectLength: "Tematam jābūt 3–160 rakstzīmes garam.",
    messageLength: "Problēmas aprakstam jābūt 10–5000 rakstzīmes garam.",
    submitFailed: "Pieprasījumu neizdevās nosūtīt.",
    submitSuccess: (id: number) => `Pieprasījums #${id} veiksmīgi nosūtīts.`,
    replyLength: "Atbildei jābūt 1–10 000 rakstzīmes garai.",
    replyFailed: "Atbildi neizdevās nosūtīt.",
    loadingSupport: "Ielādē atbalstu...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Atbalsts",
    description: "Sazinieties ar AEGRIS atbalstu un sekojiet savu pieprasījumu statusam.",
    newRequest: "Jauns pieprasījums",
    contactSupport: "Sazināties ar atbalstu",
    formDescription: "Aprakstiet problēmu pēc iespējas precīzāk. Pieprasījums tiks automātiski saistīts ar jūsu AEGRIS kontu.",
    signedInAccount: "Pierakstītais konts",
    subject: "Temats",
    subjectPlaceholder: "Piemēram, problēma ar projekta analīzi",
    problemDescription: "Problēmas apraksts",
    messagePlaceholder: "Aprakstiet, kas notika, kuru projektu tas skāra un ko jūs sagaidījāt...",
    sending: "Nosūta...",
    sendRequest: "Nosūtīt pieprasījumu",
    myRequests: "Mani pieprasījumi",
    supportHistory: "Atbalsta vēsture",
    historyDescription: "Atveriet ticket, lai skatītu visu sarunu ar AEGRIS atbalstu.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Ielādē pieprasījumus...",
    noRequests: "Pieprasījumu vēl nav",
    noRequestsDescription: "Pēc sazināšanās ar atbalstu jūsu pieprasījums parādīsies šeit.",
    priority: "Prioritāte",
    hide: "Paslēpt",
    open: "Atvērt",
    loadingConversation: "Ielādē sarunu...",
    you: "Jūs",
    originalMessage: "Sākotnējā ziņa",
    supportReply: "Atbalsta atbilde",
    yourReply: "Jūsu atbilde",
    noMoreMessages: "Papildu ziņu vēl nav.",
    resolvedPrefix: "Šis ticket ir atrisināts",
    resolvedSuffix: ". Turpmākās atbildes ir bloķētas.",
    reply: "Atbildēt",
    replyPlaceholder: "Uzrakstiet atbildi AEGRIS atbalstam...",
    sendReply: "Nosūtīt atbildi",
    footer: "Agriculture Intelligence · klientu atbalsts",
    statusOpen: "Atvērts",
    statusInProgress: "Procesā",
    statusResolved: "Atrisināts",
    priorityLow: "Zema",
    priorityNormal: "Normāla",
    priorityHigh: "Augsta",
    priorityUrgent: "Steidzama",
  };

  const et = {
    ticketsLoadFailed: "Tugipäringuid ei õnnestunud laadida.",
    conversationLoadFailed: "Vestlust ei õnnestunud laadida.",
    subjectLength: "Teema peab sisaldama 3–160 märki.",
    messageLength: "Probleemi kirjeldus peab sisaldama 10–5000 märki.",
    submitFailed: "Päringut ei õnnestunud saata.",
    submitSuccess: (id: number) => `Päring #${id} saadeti edukalt.`,
    replyLength: "Vastus peab sisaldama 1–10 000 märki.",
    replyFailed: "Vastust ei õnnestunud saata.",
    loadingSupport: "Toe laadimine...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Tugi",
    description: "Võtke ühendust AEGRIS toega ja jälgige oma päringute olekut.",
    newRequest: "Uus päring",
    contactSupport: "Võta toega ühendust",
    formDescription: "Kirjeldage probleemi võimalikult täpselt. Päring seotakse automaatselt teie AEGRIS-kontoga.",
    signedInAccount: "Sisselogitud konto",
    subject: "Teema",
    subjectPlaceholder: "Näiteks probleem projekti analüüsiga",
    problemDescription: "Probleemi kirjeldus",
    messagePlaceholder: "Kirjeldage, mis juhtus, millist projekti see puudutas ja mida ootasite...",
    sending: "Saatmine...",
    sendRequest: "Saada päring",
    myRequests: "Minu päringud",
    supportHistory: "Toe ajalugu",
    historyDescription: "Avage ticket, et näha kogu vestlust AEGRIS toega.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Päringute laadimine...",
    noRequests: "Päringuid veel pole",
    noRequestsDescription: "Pärast toega ühenduse võtmist kuvatakse teie päring siin.",
    priority: "Prioriteet",
    hide: "Peida",
    open: "Ava",
    loadingConversation: "Vestluse laadimine...",
    you: "Teie",
    originalMessage: "Algne sõnum",
    supportReply: "Toe vastus",
    yourReply: "Teie vastus",
    noMoreMessages: "Täiendavaid sõnumeid veel pole.",
    resolvedPrefix: "See ticket on lahendatud",
    resolvedSuffix: ". Edasised vastused on lukustatud.",
    reply: "Vasta",
    replyPlaceholder: "Kirjutage vastus AEGRIS toele...",
    sendReply: "Saada vastus",
    footer: "Agriculture Intelligence · klienditugi",
    statusOpen: "Avatud",
    statusInProgress: "Töös",
    statusResolved: "Lahendatud",
    priorityLow: "Madal",
    priorityNormal: "Tavaline",
    priorityHigh: "Kõrge",
    priorityUrgent: "Kiire",
  };

  const el = {
    ticketsLoadFailed: "Δεν ήταν δυνατή η φόρτωση των αιτημάτων υποστήριξης.",
    conversationLoadFailed: "Δεν ήταν δυνατή η φόρτωση της συνομιλίας.",
    subjectLength: "Το θέμα πρέπει να περιέχει 3 έως 160 χαρακτήρες.",
    messageLength: "Η περιγραφή πρέπει να περιέχει 10 έως 5000 χαρακτήρες.",
    submitFailed: "Δεν ήταν δυνατή η αποστολή του αιτήματος.",
    submitSuccess: (id: number) => `Αίτημα #${id} στάλθηκε με επιτυχία.`,
    replyLength: "Η απάντηση πρέπει να περιέχει 1 έως 10.000 χαρακτήρες.",
    replyFailed: "Δεν ήταν δυνατή η αποστολή της απάντησης.",
    loadingSupport: "Φόρτωση υποστήριξης...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Υποστήριξη",
    description: "Επικοινωνήστε με την υποστήριξη AEGRIS και παρακολουθήστε την κατάσταση των αιτημάτων σας.",
    newRequest: "Νέο αίτημα",
    contactSupport: "Επικοινωνία με υποστήριξη",
    formDescription: "Περιγράψτε το πρόβλημα όσο το δυνατόν ακριβέστερα. Το αίτημα θα συνδεθεί αυτόματα με τον λογαριασμό AEGRIS.",
    signedInAccount: "Συνδεδεμένος λογαριασμός",
    subject: "Θέμα",
    subjectPlaceholder: "Για παράδειγμα, πρόβλημα με την ανάλυση έργου",
    problemDescription: "Περιγραφή προβλήματος",
    messagePlaceholder: "Περιγράψτε τι συνέβη, ποιο έργο επηρεάστηκε και τι περιμένατε...",
    sending: "Αποστολή...",
    sendRequest: "Αποστολή αιτήματος",
    myRequests: "Τα αιτήματά μου",
    supportHistory: "Ιστορικό υποστήριξης",
    historyDescription: "Ανοίξτε ένα ticket για να δείτε ολόκληρη τη συνομιλία με την υποστήριξη AEGRIS.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Φόρτωση αιτημάτων...",
    noRequests: "Δεν υπάρχουν ακόμη αιτήματα",
    noRequestsDescription: "Αφού επικοινωνήσετε με την υποστήριξη, το αίτημά σας θα εμφανιστεί εδώ.",
    priority: "Προτεραιότητα",
    hide: "Απόκρυψη",
    open: "Άνοιγμα",
    loadingConversation: "Φόρτωση συνομιλίας...",
    you: "Εσείς",
    originalMessage: "Αρχικό μήνυμα",
    supportReply: "Απάντηση υποστήριξης",
    yourReply: "Η απάντησή σας",
    noMoreMessages: "Δεν υπάρχουν ακόμη πρόσθετα μηνύματα.",
    resolvedPrefix: "Αυτό το ticket επιλύθηκε",
    resolvedSuffix: ". Οι περαιτέρω απαντήσεις είναι κλειδωμένες.",
    reply: "Απάντηση",
    replyPlaceholder: "Γράψτε απάντηση στην υποστήριξη AEGRIS...",
    sendReply: "Αποστολή απάντησης",
    footer: "Agriculture Intelligence · υποστήριξη πελατών",
    statusOpen: "Ανοιχτό",
    statusInProgress: "Σε εξέλιξη",
    statusResolved: "Επιλύθηκε",
    priorityLow: "Χαμηλή",
    priorityNormal: "Κανονική",
    priorityHigh: "Υψηλή",
    priorityUrgent: "Επείγουσα",
  };

  const sv = {
    ticketsLoadFailed: "Supportärenden kunde inte laddas.",
    conversationLoadFailed: "Konversationen kunde inte laddas.",
    subjectLength: "Ämnet måste innehålla 3–160 tecken.",
    messageLength: "Problembeskrivningen måste innehålla 10–5000 tecken.",
    submitFailed: "Ärendet kunde inte skickas.",
    submitSuccess: (id: number) => `Ärende #${id} skickades.`,
    replyLength: "Svaret måste innehålla 1–10 000 tecken.",
    replyFailed: "Svaret kunde inte skickas.",
    loadingSupport: "Laddar support...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Support",
    description: "Kontakta AEGRIS Support och följ statusen för dina ärenden.",
    newRequest: "Nytt ärende",
    contactSupport: "Kontakta support",
    formDescription: "Beskriv problemet så exakt som möjligt. Ärendet kopplas automatiskt till ditt AEGRIS-konto.",
    signedInAccount: "Inloggat konto",
    subject: "Ämne",
    subjectPlaceholder: "Till exempel problem med projektanalys",
    problemDescription: "Problembeskrivning",
    messagePlaceholder: "Beskriv vad som hände, vilket projekt som berördes och vad du förväntade dig...",
    sending: "Skickar...",
    sendRequest: "Skicka ärende",
    myRequests: "Mina ärenden",
    supportHistory: "Supporthistorik",
    historyDescription: "Öppna ett ticket för att se hela konversationen med AEGRIS Support.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Laddar ärenden...",
    noRequests: "Inga ärenden ännu",
    noRequestsDescription: "När du kontaktar support visas ditt ärende här.",
    priority: "Prioritet",
    hide: "Dölj",
    open: "Öppna",
    loadingConversation: "Laddar konversation...",
    you: "Du",
    originalMessage: "Ursprungligt meddelande",
    supportReply: "Svar från support",
    yourReply: "Ditt svar",
    noMoreMessages: "Det finns inga ytterligare meddelanden ännu.",
    resolvedPrefix: "Detta ticket har lösts",
    resolvedSuffix: ". Ytterligare svar är låsta.",
    reply: "Svara",
    replyPlaceholder: "Skriv ett svar till AEGRIS Support...",
    sendReply: "Skicka svar",
    footer: "Agriculture Intelligence · kundsupport",
    statusOpen: "Öppet",
    statusInProgress: "Pågår",
    statusResolved: "Löst",
    priorityLow: "Låg",
    priorityNormal: "Normal",
    priorityHigh: "Hög",
    priorityUrgent: "Brådskande",
  };

  const da = {
    ticketsLoadFailed: "Supporthenvendelser kunne ikke indlæses.",
    conversationLoadFailed: "Samtalen kunne ikke indlæses.",
    subjectLength: "Emnet skal indeholde 3–160 tegn.",
    messageLength: "Problembeskrivelsen skal indeholde 10–5000 tegn.",
    submitFailed: "Henvendelsen kunne ikke sendes.",
    submitSuccess: (id: number) => `Henvendelse #${id} blev sendt.`,
    replyLength: "Svaret skal indeholde 1–10.000 tegn.",
    replyFailed: "Svaret kunne ikke sendes.",
    loadingSupport: "Indlæser support...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Support",
    description: "Kontakt AEGRIS Support, og følg status på dine henvendelser.",
    newRequest: "Ny henvendelse",
    contactSupport: "Kontakt support",
    formDescription: "Beskriv problemet så præcist som muligt. Henvendelsen knyttes automatisk til din AEGRIS-konto.",
    signedInAccount: "Logget ind konto",
    subject: "Emne",
    subjectPlaceholder: "For eksempel problem med projektanalyse",
    problemDescription: "Problembeskrivelse",
    messagePlaceholder: "Beskriv hvad der skete, hvilket projekt der blev berørt, og hvad du forventede...",
    sending: "Sender...",
    sendRequest: "Send henvendelse",
    myRequests: "Mine henvendelser",
    supportHistory: "Supporthistorik",
    historyDescription: "Åbn et ticket for at se hele samtalen med AEGRIS Support.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Indlæser henvendelser...",
    noRequests: "Ingen henvendelser endnu",
    noRequestsDescription: "Når du kontakter support, vises din henvendelse her.",
    priority: "Prioritet",
    hide: "Skjul",
    open: "Åbn",
    loadingConversation: "Indlæser samtale...",
    you: "Dig",
    originalMessage: "Oprindelig besked",
    supportReply: "Svar fra support",
    yourReply: "Dit svar",
    noMoreMessages: "Der er endnu ingen yderligere beskeder.",
    resolvedPrefix: "Dette ticket er løst",
    resolvedSuffix: ". Yderligere svar er låst.",
    reply: "Svar",
    replyPlaceholder: "Skriv et svar til AEGRIS Support...",
    sendReply: "Send svar",
    footer: "Agriculture Intelligence · kundesupport",
    statusOpen: "Åben",
    statusInProgress: "I gang",
    statusResolved: "Løst",
    priorityLow: "Lav",
    priorityNormal: "Normal",
    priorityHigh: "Høj",
    priorityUrgent: "Haster",
  };

  const no = {
    ticketsLoadFailed: "Supporthenvendelser kunne ikke lastes.",
    conversationLoadFailed: "Samtalen kunne ikke lastes.",
    subjectLength: "Emnet må inneholde 3–160 tegn.",
    messageLength: "Problembeskrivelsen må inneholde 10–5000 tegn.",
    submitFailed: "Henvendelsen kunne ikke sendes.",
    submitSuccess: (id: number) => `Henvendelse #${id} ble sendt.`,
    replyLength: "Svaret må inneholde 1–10 000 tegn.",
    replyFailed: "Svaret kunne ikke sendes.",
    loadingSupport: "Laster support...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Support",
    description: "Kontakt AEGRIS Support og følg statusen på henvendelsene dine.",
    newRequest: "Ny henvendelse",
    contactSupport: "Kontakt support",
    formDescription: "Beskriv problemet så presist som mulig. Henvendelsen kobles automatisk til AEGRIS-kontoen din.",
    signedInAccount: "Innlogget konto",
    subject: "Emne",
    subjectPlaceholder: "For eksempel problem med prosjektanalyse",
    problemDescription: "Problembeskrivelse",
    messagePlaceholder: "Beskriv hva som skjedde, hvilket prosjekt som ble berørt og hva du forventet...",
    sending: "Sender...",
    sendRequest: "Send henvendelse",
    myRequests: "Mine henvendelser",
    supportHistory: "Supporthistorikk",
    historyDescription: "Åpne et ticket for å se hele samtalen med AEGRIS Support.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Laster henvendelser...",
    noRequests: "Ingen henvendelser ennå",
    noRequestsDescription: "Når du kontakter support, vises henvendelsen din her.",
    priority: "Prioritet",
    hide: "Skjul",
    open: "Åpne",
    loadingConversation: "Laster samtale...",
    you: "Du",
    originalMessage: "Opprinnelig melding",
    supportReply: "Svar fra support",
    yourReply: "Ditt svar",
    noMoreMessages: "Det finnes ingen flere meldinger ennå.",
    resolvedPrefix: "Dette ticket er løst",
    resolvedSuffix: ". Flere svar er låst.",
    reply: "Svar",
    replyPlaceholder: "Skriv et svar til AEGRIS Support...",
    sendReply: "Send svar",
    footer: "Agriculture Intelligence · kundestøtte",
    statusOpen: "Åpen",
    statusInProgress: "Pågår",
    statusResolved: "Løst",
    priorityLow: "Lav",
    priorityNormal: "Normal",
    priorityHigh: "Høy",
    priorityUrgent: "Haster",
  };

  const fi = {
    ticketsLoadFailed: "Tukipyyntöjä ei voitu ladata.",
    conversationLoadFailed: "Keskustelua ei voitu ladata.",
    subjectLength: "Aiheen on oltava 3–160 merkkiä pitkä.",
    messageLength: "Ongelman kuvauksen on oltava 10–5000 merkkiä pitkä.",
    submitFailed: "Tukipyyntöä ei voitu lähettää.",
    submitSuccess: (id: number) => `Tukipyyntö #${id} lähetettiin onnistuneesti.`,
    replyLength: "Vastauksen on oltava 1–10 000 merkkiä pitkä.",
    replyFailed: "Vastausta ei voitu lähettää.",
    loadingSupport: "Ladataan tukea...",
    eyebrow: "AEGRIS / SUPPORT",
    title: "Tuki",
    description: "Ota yhteyttä AEGRIS-tukeen ja seuraa tukipyyntöjesi tilaa.",
    newRequest: "Uusi tukipyyntö",
    contactSupport: "Ota yhteyttä tukeen",
    formDescription: "Kuvaile ongelma mahdollisimman tarkasti. Tukipyyntö liitetään automaattisesti AEGRIS-tiliisi.",
    signedInAccount: "Kirjautunut tili",
    subject: "Aihe",
    subjectPlaceholder: "Esimerkiksi ongelma projektin analyysissä",
    problemDescription: "Ongelman kuvaus",
    messagePlaceholder: "Kuvaile mitä tapahtui, mihin projektiin ongelma liittyi ja mitä odotit...",
    sending: "Lähetetään...",
    sendRequest: "Lähetä tukipyyntö",
    myRequests: "Omat tukipyynnöt",
    supportHistory: "Tukihistoria",
    historyDescription: "Avaa ticket nähdäksesi koko keskustelun AEGRIS-tuen kanssa.",
    ticketCount: (count: number) => `${count} ticket${count === 1 ? "" : "s"}`,
    loadingRequests: "Ladataan tukipyyntöjä...",
    noRequests: "Ei vielä tukipyyntöjä",
    noRequestsDescription: "Kun otat yhteyttä tukeen, tukipyyntösi näkyy täällä.",
    priority: "Prioriteetti",
    hide: "Piilota",
    open: "Avaa",
    loadingConversation: "Ladataan keskustelua...",
    you: "Sinä",
    originalMessage: "Alkuperäinen viesti",
    supportReply: "Tuen vastaus",
    yourReply: "Vastauksesi",
    noMoreMessages: "Muita viestejä ei vielä ole.",
    resolvedPrefix: "Tämä ticket on ratkaistu",
    resolvedSuffix: ". Lisävastaukset on lukittu.",
    reply: "Vastaa",
    replyPlaceholder: "Kirjoita vastaus AEGRIS-tuelle...",
    sendReply: "Lähetä vastaus",
    footer: "Agriculture Intelligence · asiakastuki",
    statusOpen: "Avoin",
    statusInProgress: "Käsittelyssä",
    statusResolved: "Ratkaistu",
    priorityLow: "Matala",
    priorityNormal: "Normaali",
    priorityHigh: "Korkea",
    priorityUrgent: "Kiireellinen",
  };

  const copies = { en, cs, sk, de, pl, fr, es, it, nl, pt, ro, hu, uk, bg, hr, sl, lt, lv, et, el, sv, da, no, fi } as const;
  return copies[language as keyof typeof copies] ?? copies.en;
}

type SupportCopy = ReturnType<typeof getSupportCopy>;

const localeMap = {
  cs: "cs-CZ", en: "en-GB", sk: "sk-SK", de: "de-DE", pl: "pl-PL",
  fr: "fr-FR", es: "es-ES", it: "it-IT", nl: "nl-NL", pt: "pt-PT",
  ro: "ro-RO", hu: "hu-HU", uk: "uk-UA", bg: "bg-BG", hr: "hr-HR",
  sl: "sl-SI", lt: "lt-LT", lv: "lv-LV", et: "et-EE", el: "el-GR",
  sv: "sv-SE", da: "da-DK", no: "nb-NO", fi: "fi-FI",
} as const;

function formatDate(value: string | null, locale: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusLabel(status: string, copy: SupportCopy) {
  switch (status) {
    case "open":
      return copy.statusOpen;
    case "in_progress":
      return copy.statusInProgress;
    case "resolved":
      return copy.statusResolved;
    default:
      return status;
  }
}

function getStatusClasses(status: string) {
  if (status === "open") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  if (status === "in_progress") {
    return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
  }

  if (status === "resolved") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  return "border-slate-700 bg-slate-800 text-slate-300";
}

function getPriorityLabel(priority: string, copy: SupportCopy) {
  switch (priority) {
    case "low":
      return copy.priorityLow;
    case "normal":
      return copy.priorityNormal;
    case "high":
      return copy.priorityHigh;
    case "urgent":
      return copy.priorityUrgent;
    default:
      return priority;
  }
}

export default function SupportPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getSupportCopy(language);
  const locale = localeMap[language as keyof typeof localeMap] ?? "en-GB";

  const [user, setUser] = useState<User | null>(null);

  const [tickets, setTickets] =
    useState<SupportTicket[]>([]);

  const [loading, setLoading] = useState(true);

  const [ticketsLoading, setTicketsLoading] =
    useState(true);

  const [subject, setSubject] = useState("");

  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [openTicketId, setOpenTicketId] =
    useState<number | null>(null);

  const [conversations, setConversations] =
    useState<Record<number, ConversationState>>({});

  const loadTickets = useCallback(
    async (currentUser: User) => {
      setTicketsLoading(true);

      const { data, error } = await supabase
        .from("support_tickets")
        .select(
          `
            id,
            subject,
            message,
            status,
            priority,
            created_at,
            updated_at,
            resolved_at
          `
        )
        .eq("user_id", currentUser.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "SUPPORT TICKETS LOAD ERROR:",
          error
        );

        setErrorMessage(copy.ticketsLoadFailed);

        setTicketsLoading(false);
        return;
      }

      setTickets((data ?? []) as SupportTicket[]);
      setTicketsLoading(false);
    },
    [copy.ticketsLoadFailed]
  );

  const loadConversation = useCallback(
    async (ticketId: number) => {
      setConversations((current) => ({
        ...current,
        [ticketId]: {
          loading: true,
          messages:
            current[ticketId]?.messages ?? [],
          reply: current[ticketId]?.reply ?? "",
          submitting: false,
          error: "",
        },
      }));

      try {
        const response = await fetch(
          `/api/support/${ticketId}/messages`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data?.ok) {
          throw new Error(
            typeof data?.error === "string"
              ? data.error
              : copy.conversationLoadFailed
          );
        }

        setConversations((current) => ({
          ...current,
          [ticketId]: {
            loading: false,
            messages:
              (data.messages ?? []) as SupportMessage[],
            reply:
              current[ticketId]?.reply ?? "",
            submitting: false,
            error: "",
          },
        }));
      } catch (error) {
        console.error(
          "SUPPORT CONVERSATION LOAD ERROR:",
          error
        );

        setConversations((current) => ({
          ...current,
          [ticketId]: {
            loading: false,
            messages:
              current[ticketId]?.messages ?? [],
            reply:
              current[ticketId]?.reply ?? "",
            submitting: false,
            error:
              error instanceof Error
                ? error.message
                : copy.conversationLoadFailed,
          },
        }));
      }
    },
    [copy.conversationLoadFailed]
  );

  useEffect(() => {
    let active = true;

    async function initialize() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      if (!currentUser) {
        router.replace("/login?next=/support");
        return;
      }

      setUser(currentUser);
      setLoading(false);

      await loadTickets(currentUser);
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [loadTickets, router]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const normalizedSubject = subject.trim();
    const normalizedMessage = message.trim();

    if (
      normalizedSubject.length < 3 ||
      normalizedSubject.length > 160
    ) {
      setErrorMessage(copy.subjectLength);
      return;
    }

    if (
      normalizedMessage.length < 10 ||
      normalizedMessage.length > 5000
    ) {
      setErrorMessage(copy.messageLength);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: normalizedSubject,
          message: normalizedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        setErrorMessage(
          typeof data?.error === "string"
            ? data.error
            : copy.submitFailed
        );
        return;
      }

      setSubject("");
      setMessage("");

      setSuccessMessage(
        copy.submitSuccess(data.ticket.id)
      );

      if (user) {
        await loadTickets(user);
      }
    } catch (error) {
      console.error(
        "SUPPORT SUBMIT ERROR:",
        error
      );

      setErrorMessage(copy.submitFailed);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleConversation(ticketId: number) {
    if (openTicketId === ticketId) {
      setOpenTicketId(null);
      return;
    }

    setOpenTicketId(ticketId);
    await loadConversation(ticketId);
  }

  function updateReply(
    ticketId: number,
    value: string
  ) {
    setConversations((current) => ({
      ...current,
      [ticketId]: {
        loading:
          current[ticketId]?.loading ?? false,
        messages:
          current[ticketId]?.messages ?? [],
        reply: value,
        submitting:
          current[ticketId]?.submitting ?? false,
        error: "",
      },
    }));
  }

  async function submitReply(
    event: FormEvent<HTMLFormElement>,
    ticket: SupportTicket
  ) {
    event.preventDefault();

    const conversation =
      conversations[ticket.id];

    if (
      !conversation ||
      conversation.submitting ||
      ticket.status === "resolved"
    ) {
      return;
    }

    const normalizedReply =
      conversation.reply.trim();

    if (
      normalizedReply.length < 1 ||
      normalizedReply.length > 10000
    ) {
      setConversations((current) => ({
        ...current,
        [ticket.id]: {
          ...current[ticket.id],
          error: copy.replyLength,
        },
      }));

      return;
    }

    setConversations((current) => ({
      ...current,
      [ticket.id]: {
        ...current[ticket.id],
        submitting: true,
        error: "",
      },
    }));

    try {
      const response = await fetch(
        `/api/support/${ticket.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: normalizedReply,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : copy.replyFailed
        );
      }

      setConversations((current) => ({
        ...current,
        [ticket.id]: {
          ...current[ticket.id],
          reply: "",
          submitting: false,
          error: "",
        },
      }));

      await loadConversation(ticket.id);

      if (user) {
        await loadTickets(user);
      }
    } catch (error) {
      console.error(
        "SUPPORT REPLY ERROR:",
        error
      );

      setConversations((current) => ({
        ...current,
        [ticket.id]: {
          ...current[ticket.id],
          submitting: false,
          error:
            error instanceof Error
              ? error.message
              : copy.replyFailed,
        },
      }));
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        {copy.loadingSupport}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-[1100px] px-6 py-7">
        <div className="flex items-center justify-between gap-4">
          <BackButton />
          <LanguageSwitcher />
        </div>

        <div className="mb-8 mt-5">
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

        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
              {copy.newRequest}
            </div>

            <h2 className="mt-2 text-xl font-bold">
              {copy.contactSupport}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {copy.formDescription}
            </p>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">
                {copy.signedInAccount}
              </div>

              <div className="mt-2 font-semibold">
                {user?.email ?? "—"}
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <label className="block">
                <span className="text-sm text-slate-400">
                  {copy.subject}
                </span>

                <input
                  type="text"
                  value={subject}
                  onChange={(event) => {
                    setSubject(event.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  maxLength={160}
                  placeholder={copy.subjectPlaceholder}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
                />

                <div className="mt-1 text-right text-xs text-slate-600">
                  {subject.length}/160
                </div>
              </label>

              <label className="block">
                <span className="text-sm text-slate-400">
                  {copy.problemDescription}
                </span>

                <textarea
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  maxLength={5000}
                  rows={7}
                  placeholder={copy.messagePlaceholder}
                  className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
                />

                <div className="mt-1 text-right text-xs text-slate-600">
                  {message.length}/5000
                </div>
              </label>

              {errorMessage && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? copy.sending
                  : copy.sendRequest}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-cyan-400">
                  {copy.myRequests}
                </div>

                <h2 className="mt-2 text-xl font-bold">
                  {copy.supportHistory}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {copy.historyDescription}
                </p>
              </div>

              <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300">
                {copy.ticketCount(tickets.length)}
              </div>
            </div>

            {ticketsLoading ? (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-10 text-center text-sm text-slate-500">
                {copy.loadingRequests}
              </div>
            ) : tickets.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-10 text-center">
                <div className="font-semibold text-slate-300">
                  {copy.noRequests}
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {copy.noRequestsDescription}
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {tickets.map((ticket) => {
                  const isOpen =
                    openTicketId === ticket.id;

                  const conversation =
                    conversations[ticket.id];

                  const isResolved =
                    ticket.status === "resolved";

                  return (
                    <article
                      key={ticket.id}
                      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          void toggleConversation(
                            ticket.id
                          )
                        }
                        className="w-full p-5 text-left transition hover:bg-white/[0.02]"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="font-semibold text-slate-100">
                                {ticket.subject}
                              </h3>

                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                  ticket.status
                                )}`}
                              >
                                {getStatusLabel(
                                  ticket.status,
                                  copy
                                )}
                              </span>
                            </div>

                            <div className="mt-2 text-xs text-slate-600">
                              Ticket #{ticket.id} ·{" "}
                              {formatDate(
                                ticket.created_at,
                                locale
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-xs uppercase tracking-wider text-slate-500">
                              {copy.priority}:{" "}
                              <span className="text-slate-300">
                                {getPriorityLabel(
                                  ticket.priority,
                                  copy
                                )}
                              </span>
                            </div>

                            <span className="text-sm font-medium text-cyan-400">
                              {isOpen
                                ? copy.hide
                                : copy.open}
                            </span>
                          </div>
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-slate-800 p-5">
                          {conversation?.loading ? (
                            <div className="py-8 text-center text-sm text-slate-500">
                              {copy.loadingConversation}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <div className="text-sm font-semibold text-slate-200">
                                      {copy.you}
                                    </div>

                                    <div className="mt-1 text-xs text-slate-600">
                                      {copy.originalMessage}
                                    </div>
                                  </div>

                                  <div className="text-xs text-slate-600">
                                    {formatDate(
                                      ticket.created_at,
                                      locale
                                    )}
                                  </div>
                                </div>

                                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                                  {ticket.message}
                                </p>
                              </div>

                              {conversation?.messages.map(
                                (supportMessage) => {
                                  const isAdmin =
                                    supportMessage.author_role ===
                                    "admin";

                                  return (
                                    <div
                                      key={
                                        supportMessage.id
                                      }
                                      className={
                                        isAdmin
                                          ? "ml-auto max-w-[92%] rounded-xl border border-cyan-500/20 bg-cyan-500/[0.08] p-4"
                                          : "mr-auto max-w-[92%] rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                                      }
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                          <div
                                            className={
                                              isAdmin
                                                ? "text-sm font-semibold text-cyan-300"
                                                : "text-sm font-semibold text-slate-200"
                                            }
                                          >
                                            {isAdmin
                                              ? "AEGRIS Support"
                                              : copy.you}
                                          </div>

                                          <div className="mt-1 text-xs text-slate-600">
                                            {isAdmin
                                              ? copy.supportReply
                                              : copy.yourReply}
                                          </div>
                                        </div>

                                        <div className="text-xs text-slate-600">
                                          {formatDate(
                                            supportMessage.created_at,
                                            locale
                                          )}
                                        </div>
                                      </div>

                                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                                        {
                                          supportMessage.message
                                        }
                                      </p>
                                    </div>
                                  );
                                }
                              )}

                              {conversation &&
                                conversation.messages
                                  .length === 0 && (
                                  <div className="rounded-xl border border-dashed border-slate-800 px-4 py-5 text-sm text-slate-500">
                                    {copy.noMoreMessages}
                                  </div>
                                )}

                              {conversation?.error && (
                                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                  {conversation.error}
                                </div>
                              )}

                              {isResolved ? (
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-300">
                                  {copy.resolvedPrefix}{" "}
                                  {formatDate(
                                    ticket.resolved_at,
                                    locale
                                  )}
                                  {copy.resolvedSuffix}
                                </div>
                              ) : (
                                <form
                                  onSubmit={(event) =>
                                    void submitReply(
                                      event,
                                      ticket
                                    )
                                  }
                                  className="border-t border-slate-800 pt-5"
                                >
                                  <label className="block">
                                    <span className="text-sm font-medium text-slate-300">
                                      {copy.reply}
                                    </span>

                                    <textarea
                                      value={
                                        conversation
                                          ?.reply ?? ""
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateReply(
                                          ticket.id,
                                          event.target
                                            .value
                                        )
                                      }
                                      maxLength={10000}
                                      rows={5}
                                      placeholder={copy.replyPlaceholder}
                                      className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
                                    />
                                  </label>

                                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                                    <div className="text-xs text-slate-600">
                                      {conversation
                                        ?.reply.length ??
                                        0}{" "}
                                      / 10 000
                                    </div>

                                    <button
                                      type="submit"
                                      disabled={
                                        conversation
                                          ?.submitting ||
                                        !conversation?.reply.trim()
                                      }
                                      className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {conversation
                                        ?.submitting
                                        ? copy.sending
                                        : copy.sendReply}
                                    </button>
                                  </div>
                                </form>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5 text-sm text-slate-500">
            <div className="font-semibold text-slate-300">
              AEGRIS Support
            </div>

            <div className="mt-1">
              {copy.footer}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
