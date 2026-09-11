"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";

function getDemoCopy(language: string) {
  const copies = {
    en: {
      signIn: "Sign in",
      title: "Request a demo",
      description: "Would you like to see AEGRIS in practice? Complete the short form and we will contact you with demonstration options.",
      fullName: "Full name *",
      fullNamePlaceholder: "John Smith",
      company: "Company",
      companyPlaceholder: "Company name",
      email: "E-mail *",
      emailPlaceholder: "john@company.com",
      phone: "Phone",
      phonePlaceholder: "+420 777 123 456",
      message: "What are you interested in?",
      messagePlaceholder: "For example, tell us how you plan to use AEGRIS...",
      back: "← Back to AEGRIS",
      sending: "Sending...",
      submit: "Send request",
      requestFailed: "The request could not be sent.",
      serverFailed: "Could not connect to the server. Please try again later.",
      thanks: "Thank you for your interest.",
      received: "We have received your demo request. We will contact you with further information.",
      backButton: "Back to AEGRIS",
    },
    cs: {
      signIn: "Přihlásit se",
      title: "Požádat o DEMO",
      description: "Chcete AEGRIS vidět v praxi? Vyplňte krátký formulář a ozveme se vám s možnostmi předvedení systému.",
      fullName: "Jméno a příjmení *",
      fullNamePlaceholder: "Jan Novák",
      company: "Firma",
      companyPlaceholder: "Název firmy",
      email: "E-mail *",
      emailPlaceholder: "jan@firma.cz",
      phone: "Telefon",
      phonePlaceholder: "+420 777 123 456",
      message: "Co vás zajímá?",
      messagePlaceholder: "Napište nám například, jak AEGRIS plánujete využívat...",
      back: "← Zpět na AEGRIS",
      sending: "Odesílám...",
      submit: "Odeslat žádost",
      requestFailed: "Žádost se nepodařilo odeslat.",
      serverFailed: "Nepodařilo se spojit se serverem. Zkuste to prosím později.",
      thanks: "Děkujeme za váš zájem.",
      received: "Vaši žádost o DEMO jsme přijali. Ozveme se vám s dalšími informacemi.",
      backButton: "Zpět na AEGRIS",
    },
    sk: {
      signIn: "Prihlásiť sa",
      title: "Požiadať o demo",
      description: "Chcete vidieť AEGRIS v praxi? Vyplňte krátky formulár a ozveme sa vám s možnosťami ukážky systému.",
      fullName: "Meno a priezvisko *",
      fullNamePlaceholder: "Ján Novák",
      company: "Spoločnosť",
      companyPlaceholder: "Názov spoločnosti",
      email: "E-mail *",
      emailPlaceholder: "jan@firma.sk",
      phone: "Telefón",
      phonePlaceholder: "+421 900 123 456",
      message: "Čo vás zaujíma?",
      messagePlaceholder: "Napíšte nám napríklad, ako plánujete AEGRIS využívať...",
      back: "← Späť na AEGRIS",
      sending: "Odosielam...",
      submit: "Odoslať žiadosť",
      requestFailed: "Žiadosť sa nepodarilo odoslať.",
      serverFailed: "Nepodarilo sa pripojiť k serveru. Skúste to prosím neskôr.",
      thanks: "Ďakujeme za váš záujem.",
      received: "Vašu žiadosť o demo sme prijali. Ozveme sa vám s ďalšími informáciami.",
      backButton: "Späť na AEGRIS",
    },
    de: {
      signIn: "Anmelden",
      title: "Demo anfragen",
      description: "Möchten Sie AEGRIS in der Praxis sehen? Füllen Sie das kurze Formular aus und wir kontaktieren Sie mit Möglichkeiten für eine Demonstration.",
      fullName: "Vollständiger Name *",
      fullNamePlaceholder: "Max Mustermann",
      company: "Unternehmen",
      companyPlaceholder: "Unternehmensname",
      email: "E-Mail *",
      emailPlaceholder: "max@unternehmen.de",
      phone: "Telefon",
      phonePlaceholder: "+49 170 1234567",
      message: "Wofür interessieren Sie sich?",
      messagePlaceholder: "Beschreiben Sie zum Beispiel, wie Sie AEGRIS einsetzen möchten...",
      back: "← Zurück zu AEGRIS",
      sending: "Wird gesendet...",
      submit: "Anfrage senden",
      requestFailed: "Die Anfrage konnte nicht gesendet werden.",
      serverFailed: "Verbindung zum Server fehlgeschlagen. Bitte versuchen Sie es später erneut.",
      thanks: "Vielen Dank für Ihr Interesse.",
      received: "Wir haben Ihre Demo-Anfrage erhalten und melden uns mit weiteren Informationen.",
      backButton: "Zurück zu AEGRIS",
    },
    pl: {
      signIn: "Zaloguj się",
      title: "Poproś o demo",
      description: "Chcesz zobaczyć AEGRIS w praktyce? Wypełnij krótki formularz, a skontaktujemy się z Tobą w sprawie możliwości prezentacji.",
      fullName: "Imię i nazwisko *",
      fullNamePlaceholder: "Jan Kowalski",
      company: "Firma",
      companyPlaceholder: "Nazwa firmy",
      email: "E-mail *",
      emailPlaceholder: "jan@firma.pl",
      phone: "Telefon",
      phonePlaceholder: "+48 500 123 456",
      message: "Co Cię interesuje?",
      messagePlaceholder: "Napisz na przykład, jak planujesz korzystać z AEGRIS...",
      back: "← Wróć do AEGRIS",
      sending: "Wysyłanie...",
      submit: "Wyślij zgłoszenie",
      requestFailed: "Nie udało się wysłać zgłoszenia.",
      serverFailed: "Nie udało się połączyć z serwerem. Spróbuj ponownie później.",
      thanks: "Dziękujemy za zainteresowanie.",
      received: "Otrzymaliśmy Twoją prośbę o demo. Skontaktujemy się z dalszymi informacjami.",
      backButton: "Wróć do AEGRIS",
    },
    fr: {
      signIn: "Se connecter",
      title: "Demander une démo",
      description: "Vous souhaitez voir AEGRIS en pratique ? Remplissez ce court formulaire et nous vous contacterons pour organiser une démonstration.",
      fullName: "Nom complet *",
      fullNamePlaceholder: "Jean Dupont",
      company: "Entreprise",
      companyPlaceholder: "Nom de l’entreprise",
      email: "E-mail *",
      emailPlaceholder: "jean@entreprise.fr",
      phone: "Téléphone",
      phonePlaceholder: "+33 6 12 34 56 78",
      message: "Qu’est-ce qui vous intéresse ?",
      messagePlaceholder: "Indiquez-nous par exemple comment vous envisagez d’utiliser AEGRIS...",
      back: "← Retour à AEGRIS",
      sending: "Envoi...",
      submit: "Envoyer la demande",
      requestFailed: "La demande n’a pas pu être envoyée.",
      serverFailed: "Impossible de se connecter au serveur. Veuillez réessayer plus tard.",
      thanks: "Merci pour votre intérêt.",
      received: "Nous avons reçu votre demande de démo. Nous vous contacterons avec plus d’informations.",
      backButton: "Retour à AEGRIS",
    },
    es: {
      signIn: "Iniciar sesión",
      title: "Solicitar una demo",
      description: "¿Quiere ver AEGRIS en funcionamiento? Complete este breve formulario y nos pondremos en contacto para ofrecerle opciones de demostración.",
      fullName: "Nombre completo *",
      fullNamePlaceholder: "Juan García",
      company: "Empresa",
      companyPlaceholder: "Nombre de la empresa",
      email: "E-mail *",
      emailPlaceholder: "juan@empresa.es",
      phone: "Teléfono",
      phonePlaceholder: "+34 600 123 456",
      message: "¿Qué le interesa?",
      messagePlaceholder: "Cuéntenos, por ejemplo, cómo piensa utilizar AEGRIS...",
      back: "← Volver a AEGRIS",
      sending: "Enviando...",
      submit: "Enviar solicitud",
      requestFailed: "No se pudo enviar la solicitud.",
      serverFailed: "No se pudo conectar con el servidor. Inténtelo de nuevo más tarde.",
      thanks: "Gracias por su interés.",
      received: "Hemos recibido su solicitud de demo. Nos pondremos en contacto con más información.",
      backButton: "Volver a AEGRIS",
    },
    it: {
      signIn: "Accedi",
      title: "Richiedi una demo",
      description: "Vuoi vedere AEGRIS in pratica? Compila il breve modulo e ti contatteremo con le opzioni per una dimostrazione.",
      fullName: "Nome e cognome *",
      fullNamePlaceholder: "Mario Rossi",
      company: "Azienda",
      companyPlaceholder: "Nome dell’azienda",
      email: "E-mail *",
      emailPlaceholder: "mario@azienda.it",
      phone: "Telefono",
      phonePlaceholder: "+39 333 123 4567",
      message: "Cosa ti interessa?",
      messagePlaceholder: "Raccontaci, ad esempio, come prevedi di utilizzare AEGRIS...",
      back: "← Torna ad AEGRIS",
      sending: "Invio...",
      submit: "Invia richiesta",
      requestFailed: "Non è stato possibile inviare la richiesta.",
      serverFailed: "Impossibile connettersi al server. Riprova più tardi.",
      thanks: "Grazie per il tuo interesse.",
      received: "Abbiamo ricevuto la tua richiesta di demo. Ti contatteremo con ulteriori informazioni.",
      backButton: "Torna ad AEGRIS",
    },
    nl: {
      signIn: "Inloggen",
      title: "Demo aanvragen",
      description: "Wilt u AEGRIS in de praktijk zien? Vul het korte formulier in en wij nemen contact met u op over de demonstratiemogelijkheden.",
      fullName: "Volledige naam *",
      fullNamePlaceholder: "Jan de Vries",
      company: "Bedrijf",
      companyPlaceholder: "Bedrijfsnaam",
      email: "E-mail *",
      emailPlaceholder: "jan@bedrijf.nl",
      phone: "Telefoon",
      phonePlaceholder: "+31 6 12345678",
      message: "Waar bent u in geïnteresseerd?",
      messagePlaceholder: "Vertel ons bijvoorbeeld hoe u AEGRIS wilt gebruiken...",
      back: "← Terug naar AEGRIS",
      sending: "Verzenden...",
      submit: "Aanvraag verzenden",
      requestFailed: "De aanvraag kon niet worden verzonden.",
      serverFailed: "Kan geen verbinding maken met de server. Probeer het later opnieuw.",
      thanks: "Bedankt voor uw interesse.",
      received: "We hebben uw demo-aanvraag ontvangen. We nemen contact met u op met meer informatie.",
      backButton: "Terug naar AEGRIS",
    },
    pt: {
      signIn: "Entrar",
      title: "Solicitar uma demonstração",
      description: "Gostaria de ver o AEGRIS na prática? Preencha o breve formulário e entraremos em contacto consigo com opções de demonstração.",
      fullName: "Nome completo *",
      fullNamePlaceholder: "João Silva",
      company: "Empresa",
      companyPlaceholder: "Nome da empresa",
      email: "E-mail *",
      emailPlaceholder: "joao@empresa.pt",
      phone: "Telefone",
      phonePlaceholder: "+351 912 345 678",
      message: "Em que está interessado?",
      messagePlaceholder: "Diga-nos, por exemplo, como pretende utilizar o AEGRIS...",
      back: "← Voltar ao AEGRIS",
      sending: "A enviar...",
      submit: "Enviar pedido",
      requestFailed: "Não foi possível enviar o pedido.",
      serverFailed: "Não foi possível ligar ao servidor. Tente novamente mais tarde.",
      thanks: "Obrigado pelo seu interesse.",
      received: "Recebemos o seu pedido de demonstração. Entraremos em contacto com mais informações.",
      backButton: "Voltar ao AEGRIS",
    },
    ro: {
      signIn: "Autentificare",
      title: "Solicită o demonstrație",
      description: "Doriți să vedeți AEGRIS în practică? Completați formularul scurt și vă vom contacta cu opțiuni pentru demonstrație.",
      fullName: "Nume complet *",
      fullNamePlaceholder: "Ion Popescu",
      company: "Companie",
      companyPlaceholder: "Numele companiei",
      email: "E-mail *",
      emailPlaceholder: "ion@companie.ro",
      phone: "Telefon",
      phonePlaceholder: "+40 712 345 678",
      message: "Ce vă interesează?",
      messagePlaceholder: "Spuneți-ne, de exemplu, cum intenționați să utilizați AEGRIS...",
      back: "← Înapoi la AEGRIS",
      sending: "Se trimite...",
      submit: "Trimite solicitarea",
      requestFailed: "Solicitarea nu a putut fi trimisă.",
      serverFailed: "Conectarea la server a eșuat. Încercați din nou mai târziu.",
      thanks: "Vă mulțumim pentru interes.",
      received: "Am primit solicitarea dvs. pentru demonstrație. Vă vom contacta cu informații suplimentare.",
      backButton: "Înapoi la AEGRIS",
    },
    hu: {
      signIn: "Bejelentkezés",
      title: "Demó kérése",
      description: "Szeretné látni az AEGRIS működését? Töltse ki a rövid űrlapot, és felvesszük Önnel a kapcsolatot a bemutató lehetőségeivel.",
      fullName: "Teljes név *",
      fullNamePlaceholder: "Kovács János",
      company: "Vállalat",
      companyPlaceholder: "Vállalat neve",
      email: "E-mail *",
      emailPlaceholder: "janos@vallalat.hu",
      phone: "Telefon",
      phonePlaceholder: "+36 30 123 4567",
      message: "Mi érdekli?",
      messagePlaceholder: "Írja meg például, hogyan tervezi használni az AEGRIS-t...",
      back: "← Vissza az AEGRIS-hez",
      sending: "Küldés...",
      submit: "Kérelem elküldése",
      requestFailed: "A kérelmet nem sikerült elküldeni.",
      serverFailed: "Nem sikerült kapcsolódni a szerverhez. Próbálja újra később.",
      thanks: "Köszönjük érdeklődését.",
      received: "Megkaptuk demókérelmét. További információkkal jelentkezünk.",
      backButton: "Vissza az AEGRIS-hez",
    },
    uk: {
      signIn: "Увійти",
      title: "Запросити демо",
      description: "Хочете побачити AEGRIS у роботі? Заповніть коротку форму, і ми зв’яжемося з вами щодо варіантів демонстрації.",
      fullName: "Повне ім’я *",
      fullNamePlaceholder: "Іван Петренко",
      company: "Компанія",
      companyPlaceholder: "Назва компанії",
      email: "E-mail *",
      emailPlaceholder: "ivan@company.ua",
      phone: "Телефон",
      phonePlaceholder: "+380 67 123 4567",
      message: "Що вас цікавить?",
      messagePlaceholder: "Наприклад, розкажіть, як ви плануєте використовувати AEGRIS...",
      back: "← Назад до AEGRIS",
      sending: "Надсилання...",
      submit: "Надіслати запит",
      requestFailed: "Не вдалося надіслати запит.",
      serverFailed: "Не вдалося підключитися до сервера. Спробуйте пізніше.",
      thanks: "Дякуємо за ваш інтерес.",
      received: "Ми отримали ваш запит на демо. Ми зв’яжемося з вами та надамо додаткову інформацію.",
      backButton: "Назад до AEGRIS",
    },
    bg: {
      signIn: "Вход",
      title: "Заяви демонстрация",
      description: "Искате ли да видите AEGRIS на практика? Попълнете краткия формуляр и ще се свържем с вас с възможности за демонстрация.",
      fullName: "Име и фамилия *",
      fullNamePlaceholder: "Иван Иванов",
      company: "Компания",
      companyPlaceholder: "Име на компанията",
      email: "E-mail *",
      emailPlaceholder: "ivan@company.bg",
      phone: "Телефон",
      phonePlaceholder: "+359 88 123 4567",
      message: "Какво ви интересува?",
      messagePlaceholder: "Например ни кажете как планирате да използвате AEGRIS...",
      back: "← Назад към AEGRIS",
      sending: "Изпращане...",
      submit: "Изпрати заявка",
      requestFailed: "Заявката не можа да бъде изпратена.",
      serverFailed: "Неуспешна връзка със сървъра. Опитайте отново по-късно.",
      thanks: "Благодарим за интереса.",
      received: "Получихме заявката ви за демонстрация. Ще се свържем с вас с допълнителна информация.",
      backButton: "Назад към AEGRIS",
    },
    hr: {
      signIn: "Prijava",
      title: "Zatraži demo",
      description: "Želite li vidjeti AEGRIS u praksi? Ispunite kratki obrazac i kontaktirat ćemo vas s mogućnostima demonstracije.",
      fullName: "Ime i prezime *",
      fullNamePlaceholder: "Ivan Horvat",
      company: "Tvrtka",
      companyPlaceholder: "Naziv tvrtke",
      email: "E-mail *",
      emailPlaceholder: "ivan@tvrtka.hr",
      phone: "Telefon",
      phonePlaceholder: "+385 91 123 4567",
      message: "Što vas zanima?",
      messagePlaceholder: "Napišite nam, primjerice, kako planirate koristiti AEGRIS...",
      back: "← Natrag na AEGRIS",
      sending: "Slanje...",
      submit: "Pošalji zahtjev",
      requestFailed: "Zahtjev nije bilo moguće poslati.",
      serverFailed: "Nije se moguće povezati s poslužiteljem. Pokušajte ponovno kasnije.",
      thanks: "Hvala na interesu.",
      received: "Primili smo vaš zahtjev za demo. Kontaktirat ćemo vas s dodatnim informacijama.",
      backButton: "Natrag na AEGRIS",
    },
    sl: {
      signIn: "Prijava",
      title: "Zahtevaj predstavitev",
      description: "Želite videti AEGRIS v praksi? Izpolnite kratek obrazec in kontaktirali vas bomo glede možnosti predstavitve.",
      fullName: "Ime in priimek *",
      fullNamePlaceholder: "Janez Novak",
      company: "Podjetje",
      companyPlaceholder: "Ime podjetja",
      email: "E-pošta *",
      emailPlaceholder: "janez@podjetje.si",
      phone: "Telefon",
      phonePlaceholder: "+386 40 123 456",
      message: "Kaj vas zanima?",
      messagePlaceholder: "Napišite nam na primer, kako nameravate uporabljati AEGRIS...",
      back: "← Nazaj na AEGRIS",
      sending: "Pošiljanje...",
      submit: "Pošlji zahtevo",
      requestFailed: "Zahteve ni bilo mogoče poslati.",
      serverFailed: "Povezava s strežnikom ni uspela. Poskusite znova pozneje.",
      thanks: "Hvala za vaše zanimanje.",
      received: "Prejeli smo vašo zahtevo za predstavitev. Kontaktirali vas bomo z dodatnimi informacijami.",
      backButton: "Nazaj na AEGRIS",
    },
    lt: {
      signIn: "Prisijungti",
      title: "Prašyti demonstracijos",
      description: "Norite pamatyti AEGRIS praktiškai? Užpildykite trumpą formą ir susisieksime su jumis dėl demonstracijos galimybių.",
      fullName: "Vardas ir pavardė *",
      fullNamePlaceholder: "Jonas Jonaitis",
      company: "Įmonė",
      companyPlaceholder: "Įmonės pavadinimas",
      email: "El. paštas *",
      emailPlaceholder: "jonas@imone.lt",
      phone: "Telefonas",
      phonePlaceholder: "+370 612 34567",
      message: "Kas jus domina?",
      messagePlaceholder: "Pavyzdžiui, parašykite, kaip planuojate naudoti AEGRIS...",
      back: "← Atgal į AEGRIS",
      sending: "Siunčiama...",
      submit: "Siųsti užklausą",
      requestFailed: "Užklausos išsiųsti nepavyko.",
      serverFailed: "Nepavyko prisijungti prie serverio. Bandykite vėliau.",
      thanks: "Dėkojame už susidomėjimą.",
      received: "Gavome jūsų demonstracijos užklausą. Susisieksime su jumis ir pateiksime daugiau informacijos.",
      backButton: "Atgal į AEGRIS",
    },
    lv: {
      signIn: "Pieteikties",
      title: "Pieprasīt demonstrāciju",
      description: "Vai vēlaties redzēt AEGRIS darbībā? Aizpildiet īso veidlapu, un mēs sazināsimies ar jums par demonstrācijas iespējām.",
      fullName: "Vārds un uzvārds *",
      fullNamePlaceholder: "Jānis Bērziņš",
      company: "Uzņēmums",
      companyPlaceholder: "Uzņēmuma nosaukums",
      email: "E-pasts *",
      emailPlaceholder: "janis@uznemums.lv",
      phone: "Tālrunis",
      phonePlaceholder: "+371 2000 1234",
      message: "Kas jūs interesē?",
      messagePlaceholder: "Piemēram, pastāstiet, kā plānojat izmantot AEGRIS...",
      back: "← Atpakaļ uz AEGRIS",
      sending: "Nosūtīšana...",
      submit: "Nosūtīt pieprasījumu",
      requestFailed: "Pieprasījumu neizdevās nosūtīt.",
      serverFailed: "Neizdevās izveidot savienojumu ar serveri. Mēģiniet vēlreiz vēlāk.",
      thanks: "Paldies par interesi.",
      received: "Esam saņēmuši jūsu demonstrācijas pieprasījumu. Sazināsimies ar jums ar papildu informāciju.",
      backButton: "Atpakaļ uz AEGRIS",
    },
    et: {
      signIn: "Logi sisse",
      title: "Küsi demot",
      description: "Kas soovite näha AEGRIS-t praktikas? Täitke lühike vorm ja võtame teiega ühendust demonstratsioonivõimaluste osas.",
      fullName: "Täisnimi *",
      fullNamePlaceholder: "Jaan Tamm",
      company: "Ettevõte",
      companyPlaceholder: "Ettevõtte nimi",
      email: "E-post *",
      emailPlaceholder: "jaan@ettevote.ee",
      phone: "Telefon",
      phonePlaceholder: "+372 5123 4567",
      message: "Mis teid huvitab?",
      messagePlaceholder: "Kirjeldage näiteks, kuidas plaanite AEGRIS-t kasutada...",
      back: "← Tagasi AEGRIS-e juurde",
      sending: "Saatmine...",
      submit: "Saada päring",
      requestFailed: "Päringut ei õnnestunud saata.",
      serverFailed: "Serveriga ei õnnestunud ühendust luua. Proovige hiljem uuesti.",
      thanks: "Täname huvi eest.",
      received: "Oleme teie demopäringu kätte saanud. Võtame teiega ühendust lisateabega.",
      backButton: "Tagasi AEGRIS-e juurde",
    },
    el: {
      signIn: "Σύνδεση",
      title: "Αίτημα επίδειξης",
      description: "Θέλετε να δείτε το AEGRIS στην πράξη; Συμπληρώστε τη σύντομη φόρμα και θα επικοινωνήσουμε μαζί σας για τις επιλογές επίδειξης.",
      fullName: "Ονοματεπώνυμο *",
      fullNamePlaceholder: "Γιάννης Παπαδόπουλος",
      company: "Εταιρεία",
      companyPlaceholder: "Όνομα εταιρείας",
      email: "E-mail *",
      emailPlaceholder: "giannis@company.gr",
      phone: "Τηλέφωνο",
      phonePlaceholder: "+30 690 123 4567",
      message: "Τι σας ενδιαφέρει;",
      messagePlaceholder: "Πείτε μας, για παράδειγμα, πώς σκοπεύετε να χρησιμοποιήσετε το AEGRIS...",
      back: "← Πίσω στο AEGRIS",
      sending: "Αποστολή...",
      submit: "Αποστολή αιτήματος",
      requestFailed: "Δεν ήταν δυνατή η αποστολή του αιτήματος.",
      serverFailed: "Δεν ήταν δυνατή η σύνδεση με τον διακομιστή. Δοκιμάστε ξανά αργότερα.",
      thanks: "Ευχαριστούμε για το ενδιαφέρον σας.",
      received: "Λάβαμε το αίτημά σας για επίδειξη. Θα επικοινωνήσουμε μαζί σας με περισσότερες πληροφορίες.",
      backButton: "Πίσω στο AEGRIS",
    },
    sv: {
      signIn: "Logga in",
      title: "Begär en demo",
      description: "Vill du se AEGRIS i praktiken? Fyll i det korta formuläret så kontaktar vi dig med alternativ för en demonstration.",
      fullName: "Fullständigt namn *",
      fullNamePlaceholder: "Erik Andersson",
      company: "Företag",
      companyPlaceholder: "Företagsnamn",
      email: "E-post *",
      emailPlaceholder: "erik@foretag.se",
      phone: "Telefon",
      phonePlaceholder: "+46 70 123 45 67",
      message: "Vad är du intresserad av?",
      messagePlaceholder: "Berätta till exempel hur du planerar att använda AEGRIS...",
      back: "← Tillbaka till AEGRIS",
      sending: "Skickar...",
      submit: "Skicka förfrågan",
      requestFailed: "Förfrågan kunde inte skickas.",
      serverFailed: "Det gick inte att ansluta till servern. Försök igen senare.",
      thanks: "Tack för ditt intresse.",
      received: "Vi har tagit emot din demoförfrågan. Vi kontaktar dig med mer information.",
      backButton: "Tillbaka till AEGRIS",
    },
    da: {
      signIn: "Log ind",
      title: "Anmod om en demo",
      description: "Vil du se AEGRIS i praksis? Udfyld den korte formular, så kontakter vi dig med muligheder for en demonstration.",
      fullName: "Fulde navn *",
      fullNamePlaceholder: "Jens Jensen",
      company: "Virksomhed",
      companyPlaceholder: "Virksomhedsnavn",
      email: "E-mail *",
      emailPlaceholder: "jens@virksomhed.dk",
      phone: "Telefon",
      phonePlaceholder: "+45 20 12 34 56",
      message: "Hvad er du interesseret i?",
      messagePlaceholder: "Fortæl os for eksempel, hvordan du planlægger at bruge AEGRIS...",
      back: "← Tilbage til AEGRIS",
      sending: "Sender...",
      submit: "Send anmodning",
      requestFailed: "Anmodningen kunne ikke sendes.",
      serverFailed: "Kunne ikke oprette forbindelse til serveren. Prøv igen senere.",
      thanks: "Tak for din interesse.",
      received: "Vi har modtaget din demoanmodning. Vi kontakter dig med yderligere information.",
      backButton: "Tilbage til AEGRIS",
    },
    no: {
      signIn: "Logg inn",
      title: "Be om en demo",
      description: "Vil du se AEGRIS i praksis? Fyll ut det korte skjemaet, så kontakter vi deg med alternativer for en demonstrasjon.",
      fullName: "Fullt navn *",
      fullNamePlaceholder: "Ola Nordmann",
      company: "Bedrift",
      companyPlaceholder: "Bedriftsnavn",
      email: "E-post *",
      emailPlaceholder: "ola@bedrift.no",
      phone: "Telefon",
      phonePlaceholder: "+47 900 12 345",
      message: "Hva er du interessert i?",
      messagePlaceholder: "Fortell oss for eksempel hvordan du planlegger å bruke AEGRIS...",
      back: "← Tilbake til AEGRIS",
      sending: "Sender...",
      submit: "Send forespørsel",
      requestFailed: "Forespørselen kunne ikke sendes.",
      serverFailed: "Kunne ikke koble til serveren. Prøv igjen senere.",
      thanks: "Takk for interessen.",
      received: "Vi har mottatt demoforespørselen din. Vi kontakter deg med mer informasjon.",
      backButton: "Tilbake til AEGRIS",
    },
    fi: {
      signIn: "Kirjaudu sisään",
      title: "Pyydä demo",
      description: "Haluatko nähdä AEGRISin käytännössä? Täytä lyhyt lomake, niin otamme sinuun yhteyttä esittelyvaihtoehdoista.",
      fullName: "Koko nimi *",
      fullNamePlaceholder: "Matti Meikäläinen",
      company: "Yritys",
      companyPlaceholder: "Yrityksen nimi",
      email: "Sähköposti *",
      emailPlaceholder: "matti@yritys.fi",
      phone: "Puhelin",
      phonePlaceholder: "+358 40 123 4567",
      message: "Mistä olet kiinnostunut?",
      messagePlaceholder: "Kerro esimerkiksi, miten aiot käyttää AEGRISia...",
      back: "← Takaisin AEGRISiin",
      sending: "Lähetetään...",
      submit: "Lähetä pyyntö",
      requestFailed: "Pyyntöä ei voitu lähettää.",
      serverFailed: "Palvelimeen ei saatu yhteyttä. Yritä myöhemmin uudelleen.",
      thanks: "Kiitos kiinnostuksestasi.",
      received: "Olemme vastaanottaneet demopyyntösi. Otamme sinuun yhteyttä lisätietojen kanssa.",
      backButton: "Takaisin AEGRISiin",
    }
  } as const;

  return copies[language as keyof typeof copies] ?? copies.en;
}
export default function DemoPage() {
  const { language } = useLanguage();
  const copy = getDemoCopy(language);

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          company,
          email,
          phone,
          message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(
          result.error ||
            copy.requestFailed
        );
        return;
      }

      setSubmitted(true);
    } catch (error) {
      console.error(
        "CHYBA ODESLÁNÍ DEMO ŽÁDOSTI:",
        error
      );

      setErrorMessage(copy.serverFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-cyan-400"
          >
            AEGRIS
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <Link
              href="/login"
              className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 font-semibold transition hover:border-cyan-400"
            >
              {copy.signIn}
            </Link>
          </div>
        </div>
      </header>

      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          {!submitted ? (
            <>
              <div className="mb-10 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
                  AEGRIS
                </p>

                <h1 className="mt-4 text-4xl font-bold md:text-5xl">
                  {copy.title}
                </h1>

                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
                  {copy.description}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl md:p-8"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      {copy.fullName}
                    </label>

                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(event) =>
                        setFullName(event.target.value)
                      }
                      required
                      autoComplete="name"
                      placeholder={copy.fullNamePlaceholder}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      {copy.company}
                    </label>

                    <input
                      id="company"
                      type="text"
                      value={company}
                      onChange={(event) =>
                        setCompany(event.target.value)
                      }
                      autoComplete="organization"
                      placeholder={copy.companyPlaceholder}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      {copy.email}
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      required
                      autoComplete="email"
                      placeholder={copy.emailPlaceholder}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      {copy.phone}
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                      autoComplete="tel"
                      placeholder={copy.phonePlaceholder}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-semibold text-slate-300"
                  >
                    {copy.message}
                  </label>

                  <textarea
                    id="message"
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    rows={5}
                    placeholder={copy.messagePlaceholder}
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
                  />
                </div>

                {errorMessage && (
                  <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
                    {errorMessage}
                  </div>
                )}

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href="/"
                    className="text-sm font-semibold text-slate-400 transition hover:text-white"
                  >
                    {copy.back}
                  </Link>

                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-cyan-500 px-7 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? copy.sending
                      : copy.submit}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center shadow-2xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 text-3xl text-cyan-400">
                ✓
              </div>

              <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
                AEGRIS
              </p>

              <h1 className="mt-4 text-4xl font-bold">
                {copy.thanks}
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-400">
                {copy.received}
              </p>

              <Link
                href="/"
                className="mt-8 inline-block rounded-xl bg-cyan-500 px-7 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                {copy.backButton}
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
