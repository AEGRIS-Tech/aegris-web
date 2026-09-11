"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";

function getSafeNextPath() {
  if (typeof window === "undefined") return "/dashboard";

  const next = new URLSearchParams(window.location.search).get("next");

  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/dashboard";
  }

  return next;
}

function getLoginCopy(language: string) {
  const copies = {
    en: {
      secureWorkspace: "Secure Workspace",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Field-condition decision support in one operational workspace.",
      heroDescription: "AEGRIS connects satellite monitoring, meteorological data and decision logic into a clear operational workflow for agronomists.",
      monitoringLabel: "Monitoring",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Satellite vegetation status",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Priority and recommendation",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Field verification of results",
      footerLeft: "Agronomic operations · field intelligence · controlled access",
      accountAccess: "Account Access",
      loginTitle: "Sign in",
      loginDescription: "Sign in to your AEGRIS workspace.",
      email: "E-mail",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passwordPlaceholder: "Password",
      forgotPassword: "Forgot password?",
      invalidCredentials: "Invalid e-mail or password.",
      loginFailed: "Sign-in could not be completed.",
      signingIn: "Signing in...",
      signIn: "Sign in",
      noAccount: "Don't have an account?",
      register: "Register",
      footerRight: "AEGRIS · Controlled agronomic workspace",
    },
    cs: {
      secureWorkspace: "Zabezpečený prostor",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Rozhodování nad stavem pozemků v jednom pracovním prostoru.",
      heroDescription: "AEGRIS propojuje satelitní monitoring, meteorologická data a rozhodovací logiku do přehledného provozního workflow pro agronoma.",
      monitoringLabel: "Monitoring",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Satelitní vegetační stav",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Priorita a doporučení",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Terénní ověření výsledků",
      footerLeft: "Agronomický provoz · field intelligence · řízený přístup",
      accountAccess: "Přístup k účtu",
      loginTitle: "Přihlášení",
      loginDescription: "Přihlaste se do svého pracovního prostoru AEGRIS.",
      email: "E-mail",
      emailPlaceholder: "vas@email.cz",
      password: "Heslo",
      passwordPlaceholder: "Heslo",
      forgotPassword: "Zapomenuté heslo?",
      invalidCredentials: "Neplatný e-mail nebo heslo.",
      loginFailed: "Přihlášení se nepodařilo dokončit.",
      signingIn: "Přihlašuji...",
      signIn: "Přihlásit se",
      noAccount: "Nemáte účet?",
      register: "Registrovat",
      footerRight: "AEGRIS · Řízený agronomický pracovní prostor",
    },
    sk: {
      secureWorkspace: "Zabezpečený priestor",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Podpora rozhodovania o stave polí v jednom pracovnom priestore.",
      heroDescription: "AEGRIS spája satelitné monitorovanie, meteorologické údaje a rozhodovaciu logiku do prehľadného pracovného toku pre agronómov.",
      monitoringLabel: "Monitoring",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Satelitný stav vegetácie",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Priorita a odporúčanie",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Terénne overenie výsledkov",
      footerLeft: "Agronomická prevádzka · field intelligence · riadený prístup",
      accountAccess: "Prístup k účtu",
      loginTitle: "Prihlásenie",
      loginDescription: "Prihláste sa do svojho pracovného priestoru AEGRIS.",
      email: "E-mail",
      emailPlaceholder: "vy@example.sk",
      password: "Heslo",
      passwordPlaceholder: "Heslo",
      forgotPassword: "Zabudli ste heslo?",
      invalidCredentials: "Neplatný e-mail alebo heslo.",
      loginFailed: "Prihlásenie sa nepodarilo dokončiť.",
      signingIn: "Prihlasovanie...",
      signIn: "Prihlásiť sa",
      noAccount: "Nemáte účet?",
      register: "Registrovať sa",
      footerRight: "AEGRIS · Riadený agronomický pracovný priestor",
    },
    de: {
      secureWorkspace: "Sicherer Arbeitsbereich",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Entscheidungsunterstützung zum Feldzustand in einem operativen Arbeitsbereich.",
      heroDescription: "AEGRIS verbindet Satellitenmonitoring, Wetterdaten und Entscheidungslogik zu einem klaren operativen Workflow für Agronomen.",
      monitoringLabel: "Monitoring",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Vegetationszustand per Satellit",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Priorität und Empfehlung",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Feldprüfung der Ergebnisse",
      footerLeft: "Agronomischer Betrieb · Field Intelligence · kontrollierter Zugang",
      accountAccess: "Kontozugang",
      loginTitle: "Anmelden",
      loginDescription: "Melden Sie sich in Ihrem AEGRIS-Arbeitsbereich an.",
      email: "E-Mail",
      emailPlaceholder: "sie@beispiel.de",
      password: "Passwort",
      passwordPlaceholder: "Passwort",
      forgotPassword: "Passwort vergessen?",
      invalidCredentials: "Ungültige E-Mail-Adresse oder ungültiges Passwort.",
      loginFailed: "Die Anmeldung konnte nicht abgeschlossen werden.",
      signingIn: "Anmeldung...",
      signIn: "Anmelden",
      noAccount: "Noch kein Konto?",
      register: "Registrieren",
      footerRight: "AEGRIS · Kontrollierter agronomischer Arbeitsbereich",
    },
    pl: {
      secureWorkspace: "Bezpieczna przestrzeń robocza",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Wsparcie decyzji o stanie pól w jednej przestrzeni operacyjnej.",
      heroDescription: "AEGRIS łączy monitoring satelitarny, dane meteorologiczne i logikę decyzyjną w przejrzysty proces operacyjny dla agronomów.",
      monitoringLabel: "Monitoring",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Satelitarny stan roślinności",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Priorytet i zalecenie",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Terenowa weryfikacja wyników",
      footerLeft: "Operacje agronomiczne · field intelligence · kontrolowany dostęp",
      accountAccess: "Dostęp do konta",
      loginTitle: "Logowanie",
      loginDescription: "Zaloguj się do swojej przestrzeni AEGRIS.",
      email: "E-mail",
      emailPlaceholder: "ty@przyklad.pl",
      password: "Hasło",
      passwordPlaceholder: "Hasło",
      forgotPassword: "Nie pamiętasz hasła?",
      invalidCredentials: "Nieprawidłowy e-mail lub hasło.",
      loginFailed: "Nie udało się zakończyć logowania.",
      signingIn: "Logowanie...",
      signIn: "Zaloguj się",
      noAccount: "Nie masz konta?",
      register: "Zarejestruj się",
      footerRight: "AEGRIS · Kontrolowana przestrzeń agronomiczna",
    },
    fr: {
      secureWorkspace: "Espace sécurisé",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Aide à la décision sur l'état des parcelles dans un espace opérationnel unique.",
      heroDescription: "AEGRIS réunit le suivi satellitaire, les données météorologiques et la logique de décision dans un flux opérationnel clair pour les agronomes.",
      monitoringLabel: "Suivi",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "État de la végétation par satellite",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Priorité et recommandation",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Vérification terrain des résultats",
      footerLeft: "Opérations agronomiques · field intelligence · accès contrôlé",
      accountAccess: "Accès au compte",
      loginTitle: "Connexion",
      loginDescription: "Connectez-vous à votre espace AEGRIS.",
      email: "E-mail",
      emailPlaceholder: "vous@exemple.fr",
      password: "Mot de passe",
      passwordPlaceholder: "Mot de passe",
      forgotPassword: "Mot de passe oublié ?",
      invalidCredentials: "E-mail ou mot de passe incorrect.",
      loginFailed: "La connexion n'a pas pu être effectuée.",
      signingIn: "Connexion...",
      signIn: "Se connecter",
      noAccount: "Vous n'avez pas de compte ?",
      register: "S'inscrire",
      footerRight: "AEGRIS · Espace agronomique contrôlé",
    },
    es: {
      secureWorkspace: "Espacio seguro",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Apoyo a las decisiones sobre el estado de las parcelas en un único espacio operativo.",
      heroDescription: "AEGRIS conecta monitorización satelital, datos meteorológicos y lógica de decisión en un flujo operativo claro para agrónomos.",
      monitoringLabel: "Monitorización",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Estado de la vegetación por satélite",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Prioridad y recomendación",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Verificación de resultados en campo",
      footerLeft: "Operaciones agronómicas · field intelligence · acceso controlado",
      accountAccess: "Acceso a la cuenta",
      loginTitle: "Iniciar sesión",
      loginDescription: "Inicie sesión en su espacio de trabajo AEGRIS.",
      email: "E-mail",
      emailPlaceholder: "usted@ejemplo.es",
      password: "Contraseña",
      passwordPlaceholder: "Contraseña",
      forgotPassword: "¿Olvidó su contraseña?",
      invalidCredentials: "E-mail o contraseña no válidos.",
      loginFailed: "No se pudo completar el inicio de sesión.",
      signingIn: "Iniciando sesión...",
      signIn: "Iniciar sesión",
      noAccount: "¿No tiene una cuenta?",
      register: "Registrarse",
      footerRight: "AEGRIS · Espacio agronómico controlado",
    },
    it: {
      secureWorkspace: "Area di lavoro sicura",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Supporto alle decisioni sullo stato degli appezzamenti in un unico spazio operativo.",
      heroDescription: "AEGRIS collega monitoraggio satellitare, dati meteorologici e logica decisionale in un flusso operativo chiaro per gli agronomi.",
      monitoringLabel: "Monitoraggio",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Stato della vegetazione da satellite",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Priorità e raccomandazione",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Verifica sul campo dei risultati",
      footerLeft: "Operazioni agronomiche · field intelligence · accesso controllato",
      accountAccess: "Accesso all'account",
      loginTitle: "Accedi",
      loginDescription: "Accedi al tuo spazio di lavoro AEGRIS.",
      email: "E-mail",
      emailPlaceholder: "tu@esempio.it",
      password: "Password",
      passwordPlaceholder: "Password",
      forgotPassword: "Password dimenticata?",
      invalidCredentials: "E-mail o password non validi.",
      loginFailed: "Non è stato possibile completare l'accesso.",
      signingIn: "Accesso...",
      signIn: "Accedi",
      noAccount: "Non hai un account?",
      register: "Registrati",
      footerRight: "AEGRIS · Spazio agronomico controllato",
    },
    nl: {
      secureWorkspace: "Beveiligde werkruimte",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Beslissingsondersteuning voor de veldconditie in één operationele werkruimte.",
      heroDescription: "AEGRIS verbindt satellietmonitoring, meteorologische gegevens en beslislogica in een duidelijke operationele workflow voor agronomen.",
      monitoringLabel: "Monitoring",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Vegetatiestatus via satelliet",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Prioriteit en aanbeveling",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Veldverificatie van resultaten",
      footerLeft: "Agronomische activiteiten · field intelligence · gecontroleerde toegang",
      accountAccess: "Accounttoegang",
      loginTitle: "Inloggen",
      loginDescription: "Log in op uw AEGRIS-werkruimte.",
      email: "E-mail",
      emailPlaceholder: "u@voorbeeld.nl",
      password: "Wachtwoord",
      passwordPlaceholder: "Wachtwoord",
      forgotPassword: "Wachtwoord vergeten?",
      invalidCredentials: "Ongeldig e-mailadres of wachtwoord.",
      loginFailed: "Inloggen kon niet worden voltooid.",
      signingIn: "Inloggen...",
      signIn: "Inloggen",
      noAccount: "Nog geen account?",
      register: "Registreren",
      footerRight: "AEGRIS · Gecontroleerde agronomische werkruimte",
    },
    pt: {
      secureWorkspace: "Área de trabalho segura",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Apoio à decisão sobre o estado dos campos num único espaço operacional.",
      heroDescription: "O AEGRIS liga monitorização por satélite, dados meteorológicos e lógica de decisão num fluxo operacional claro para agrónomos.",
      monitoringLabel: "Monitorização",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Estado da vegetação por satélite",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Prioridade e recomendação",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Verificação dos resultados no campo",
      footerLeft: "Operações agronómicas · field intelligence · acesso controlado",
      accountAccess: "Acesso à conta",
      loginTitle: "Iniciar sessão",
      loginDescription: "Inicie sessão no seu espaço AEGRIS.",
      email: "E-mail",
      emailPlaceholder: "voce@exemplo.pt",
      password: "Palavra-passe",
      passwordPlaceholder: "Palavra-passe",
      forgotPassword: "Esqueceu-se da palavra-passe?",
      invalidCredentials: "E-mail ou palavra-passe inválidos.",
      loginFailed: "Não foi possível concluir o início de sessão.",
      signingIn: "A iniciar sessão...",
      signIn: "Entrar",
      noAccount: "Não tem uma conta?",
      register: "Registar",
      footerRight: "AEGRIS · Espaço agronómico controlado",
    },
    ro: {
      secureWorkspace: "Spațiu de lucru securizat",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Suport decizional privind starea parcelelor într-un singur spațiu operațional.",
      heroDescription: "AEGRIS conectează monitorizarea prin satelit, datele meteorologice și logica decizională într-un flux operațional clar pentru agronomi.",
      monitoringLabel: "Monitorizare",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Starea vegetației prin satelit",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Prioritate și recomandare",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Verificarea rezultatelor în teren",
      footerLeft: "Operațiuni agronomice · field intelligence · acces controlat",
      accountAccess: "Acces la cont",
      loginTitle: "Autentificare",
      loginDescription: "Autentificați-vă în spațiul dvs. AEGRIS.",
      email: "E-mail",
      emailPlaceholder: "dvs@exemplu.ro",
      password: "Parolă",
      passwordPlaceholder: "Parolă",
      forgotPassword: "Ați uitat parola?",
      invalidCredentials: "E-mail sau parolă incorectă.",
      loginFailed: "Autentificarea nu a putut fi finalizată.",
      signingIn: "Autentificare...",
      signIn: "Autentificare",
      noAccount: "Nu aveți cont?",
      register: "Înregistrare",
      footerRight: "AEGRIS · Spațiu agronomic controlat",
    },
    hu: {
      secureWorkspace: "Biztonságos munkaterület",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Döntéstámogatás a táblák állapotához egyetlen operatív munkaterületen.",
      heroDescription: "Az AEGRIS a műholdas megfigyelést, a meteorológiai adatokat és a döntési logikát egy átlátható agronómiai munkafolyamatba kapcsolja.",
      monitoringLabel: "Monitoring",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Műholdas vegetációs állapot",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Prioritás és ajánlás",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Az eredmények terepi ellenőrzése",
      footerLeft: "Agronómiai műveletek · field intelligence · ellenőrzött hozzáférés",
      accountAccess: "Fiókhozzáférés",
      loginTitle: "Bejelentkezés",
      loginDescription: "Jelentkezzen be AEGRIS munkaterületére.",
      email: "E-mail",
      emailPlaceholder: "on@pelda.hu",
      password: "Jelszó",
      passwordPlaceholder: "Jelszó",
      forgotPassword: "Elfelejtette a jelszavát?",
      invalidCredentials: "Érvénytelen e-mail-cím vagy jelszó.",
      loginFailed: "A bejelentkezés nem fejezhető be.",
      signingIn: "Bejelentkezés...",
      signIn: "Bejelentkezés",
      noAccount: "Nincs még fiókja?",
      register: "Regisztráció",
      footerRight: "AEGRIS · Ellenőrzött agronómiai munkaterület",
    },
    uk: {
      secureWorkspace: "Захищений робочий простір",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Підтримка рішень щодо стану полів в одному операційному просторі.",
      heroDescription: "AEGRIS поєднує супутниковий моніторинг, метеорологічні дані та логіку прийняття рішень у зрозумілий робочий процес для агрономів.",
      monitoringLabel: "Моніторинг",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Супутниковий стан рослинності",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Пріоритет і рекомендація",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Польова перевірка результатів",
      footerLeft: "Агрономічні операції · field intelligence · контрольований доступ",
      accountAccess: "Доступ до облікового запису",
      loginTitle: "Вхід",
      loginDescription: "Увійдіть у свій робочий простір AEGRIS.",
      email: "E-mail",
      emailPlaceholder: "you@example.ua",
      password: "Пароль",
      passwordPlaceholder: "Пароль",
      forgotPassword: "Забули пароль?",
      invalidCredentials: "Неправильний e-mail або пароль.",
      loginFailed: "Не вдалося завершити вхід.",
      signingIn: "Вхід...",
      signIn: "Увійти",
      noAccount: "Немає облікового запису?",
      register: "Зареєструватися",
      footerRight: "AEGRIS · Контрольований агрономічний простір",
    },
    bg: {
      secureWorkspace: "Защитено работно пространство",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Подкрепа за решенията за състоянието на полетата в едно оперативно пространство.",
      heroDescription: "AEGRIS свързва сателитното наблюдение, метеорологичните данни и логиката за решения в ясен работен процес за агрономи.",
      monitoringLabel: "Мониторинг",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Сателитно състояние на растителността",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Приоритет и препоръка",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Теренна проверка на резултатите",
      footerLeft: "Агрономически операции · field intelligence · контролиран достъп",
      accountAccess: "Достъп до профила",
      loginTitle: "Вход",
      loginDescription: "Влезте в работното си пространство AEGRIS.",
      email: "E-mail",
      emailPlaceholder: "you@example.bg",
      password: "Парола",
      passwordPlaceholder: "Парола",
      forgotPassword: "Забравена парола?",
      invalidCredentials: "Невалиден e-mail или парола.",
      loginFailed: "Входът не можа да бъде завършен.",
      signingIn: "Влизане...",
      signIn: "Вход",
      noAccount: "Нямате профил?",
      register: "Регистрация",
      footerRight: "AEGRIS · Контролирано агрономическо пространство",
    },
    hr: {
      secureWorkspace: "Siguran radni prostor",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Podrška odlučivanju o stanju polja u jednom operativnom radnom prostoru.",
      heroDescription: "AEGRIS povezuje satelitsko praćenje, meteorološke podatke i logiku odlučivanja u jasan operativni tijek za agronome.",
      monitoringLabel: "Praćenje",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Satelitsko stanje vegetacije",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Prioritet i preporuka",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Terenska provjera rezultata",
      footerLeft: "Agronomske operacije · field intelligence · kontrolirani pristup",
      accountAccess: "Pristup računu",
      loginTitle: "Prijava",
      loginDescription: "Prijavite se u svoj AEGRIS radni prostor.",
      email: "E-mail",
      emailPlaceholder: "vi@primjer.hr",
      password: "Lozinka",
      passwordPlaceholder: "Lozinka",
      forgotPassword: "Zaboravili ste lozinku?",
      invalidCredentials: "Neispravan e-mail ili lozinka.",
      loginFailed: "Prijava se nije mogla dovršiti.",
      signingIn: "Prijava...",
      signIn: "Prijavi se",
      noAccount: "Nemate račun?",
      register: "Registrirajte se",
      footerRight: "AEGRIS · Kontrolirani agronomski radni prostor",
    },
    sl: {
      secureWorkspace: "Varen delovni prostor",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Podpora odločanju o stanju polj v enem operativnem delovnem prostoru.",
      heroDescription: "AEGRIS povezuje satelitsko spremljanje, meteorološke podatke in logiko odločanja v jasen operativni potek za agronome.",
      monitoringLabel: "Spremljanje",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Satelitsko stanje vegetacije",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Prednost in priporočilo",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Terensko preverjanje rezultatov",
      footerLeft: "Agronomske operacije · field intelligence · nadzorovan dostop",
      accountAccess: "Dostop do računa",
      loginTitle: "Prijava",
      loginDescription: "Prijavite se v svoj delovni prostor AEGRIS.",
      email: "E-pošta",
      emailPlaceholder: "vi@primer.si",
      password: "Geslo",
      passwordPlaceholder: "Geslo",
      forgotPassword: "Ste pozabili geslo?",
      invalidCredentials: "Neveljaven e-poštni naslov ali geslo.",
      loginFailed: "Prijave ni bilo mogoče dokončati.",
      signingIn: "Prijavljanje...",
      signIn: "Prijava",
      noAccount: "Nimate računa?",
      register: "Registracija",
      footerRight: "AEGRIS · Nadzorovan agronomski delovni prostor",
    },
    lt: {
      secureWorkspace: "Saugi darbo erdvė",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Laukų būklės sprendimų palaikymas vienoje operacinėje darbo erdvėje.",
      heroDescription: "AEGRIS sujungia palydovinę stebėseną, meteorologinius duomenis ir sprendimų logiką į aiškią agronomų darbo eigą.",
      monitoringLabel: "Stebėsena",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Palydovinė augalijos būklė",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Prioritetas ir rekomendacija",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Rezultatų patikra lauke",
      footerLeft: "Agronominės operacijos · field intelligence · kontroliuojama prieiga",
      accountAccess: "Prieiga prie paskyros",
      loginTitle: "Prisijungimas",
      loginDescription: "Prisijunkite prie savo AEGRIS darbo erdvės.",
      email: "El. paštas",
      emailPlaceholder: "jūs@pavyzdys.lt",
      password: "Slaptažodis",
      passwordPlaceholder: "Slaptažodis",
      forgotPassword: "Pamiršote slaptažodį?",
      invalidCredentials: "Neteisingas el. paštas arba slaptažodis.",
      loginFailed: "Prisijungimo nepavyko užbaigti.",
      signingIn: "Jungiamasi...",
      signIn: "Prisijungti",
      noAccount: "Neturite paskyros?",
      register: "Registruotis",
      footerRight: "AEGRIS · Kontroliuojama agronominė darbo erdvė",
    },
    lv: {
      secureWorkspace: "Droša darba vide",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Atbalsts lēmumiem par lauku stāvokli vienā operatīvā darba vidē.",
      heroDescription: "AEGRIS apvieno satelītu uzraudzību, meteoroloģiskos datus un lēmumu loģiku skaidrā agronomu darba plūsmā.",
      monitoringLabel: "Uzraudzība",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Veģetācijas stāvoklis no satelīta",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Prioritāte un ieteikums",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Rezultātu pārbaude laukā",
      footerLeft: "Agronomiskās darbības · field intelligence · kontrolēta piekļuve",
      accountAccess: "Piekļuve kontam",
      loginTitle: "Pieteikšanās",
      loginDescription: "Piesakieties savā AEGRIS darba vidē.",
      email: "E-pasts",
      emailPlaceholder: "jūs@piemers.lv",
      password: "Parole",
      passwordPlaceholder: "Parole",
      forgotPassword: "Aizmirsāt paroli?",
      invalidCredentials: "Nederīgs e-pasts vai parole.",
      loginFailed: "Pieteikšanos neizdevās pabeigt.",
      signingIn: "Pieteikšanās...",
      signIn: "Pieteikties",
      noAccount: "Nav konta?",
      register: "Reģistrēties",
      footerRight: "AEGRIS · Kontrolēta agronomiskā darba vide",
    },
    et: {
      secureWorkspace: "Turvaline tööruum",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Põllu seisundi otsustustugi ühes operatiivses tööruumis.",
      heroDescription: "AEGRIS ühendab satelliitseire, meteoroloogilised andmed ja otsustusloogika agronoomide selgeks töövooks.",
      monitoringLabel: "Seire",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Taimestiku seisund satelliidilt",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Prioriteet ja soovitus",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Tulemuste kontroll põllul",
      footerLeft: "Agronoomilised toimingud · field intelligence · kontrollitud juurdepääs",
      accountAccess: "Juurdepääs kontole",
      loginTitle: "Sisselogimine",
      loginDescription: "Logige sisse oma AEGRIS-e tööruumi.",
      email: "E-post",
      emailPlaceholder: "teie@naide.ee",
      password: "Parool",
      passwordPlaceholder: "Parool",
      forgotPassword: "Unustasite parooli?",
      invalidCredentials: "Vale e-posti aadress või parool.",
      loginFailed: "Sisselogimist ei saanud lõpule viia.",
      signingIn: "Sisselogimine...",
      signIn: "Logi sisse",
      noAccount: "Kas teil pole kontot?",
      register: "Registreeru",
      footerRight: "AEGRIS · Kontrollitud agronoomiline tööruum",
    },
    el: {
      secureWorkspace: "Ασφαλής χώρος εργασίας",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Υποστήριξη αποφάσεων για την κατάσταση των αγρών σε έναν ενιαίο επιχειρησιακό χώρο.",
      heroDescription: "Το AEGRIS συνδέει δορυφορική παρακολούθηση, μετεωρολογικά δεδομένα και λογική αποφάσεων σε μια σαφή ροή εργασίας για γεωπόνους.",
      monitoringLabel: "Παρακολούθηση",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Δορυφορική κατάσταση βλάστησης",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Προτεραιότητα και σύσταση",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Επιτόπια επαλήθευση αποτελεσμάτων",
      footerLeft: "Γεωπονικές λειτουργίες · field intelligence · ελεγχόμενη πρόσβαση",
      accountAccess: "Πρόσβαση λογαριασμού",
      loginTitle: "Σύνδεση",
      loginDescription: "Συνδεθείτε στον χώρο εργασίας AEGRIS.",
      email: "E-mail",
      emailPlaceholder: "you@example.gr",
      password: "Κωδικός πρόσβασης",
      passwordPlaceholder: "Κωδικός πρόσβασης",
      forgotPassword: "Ξεχάσατε τον κωδικό;",
      invalidCredentials: "Μη έγκυρο e-mail ή κωδικός πρόσβασης.",
      loginFailed: "Η σύνδεση δεν μπόρεσε να ολοκληρωθεί.",
      signingIn: "Σύνδεση...",
      signIn: "Σύνδεση",
      noAccount: "Δεν έχετε λογαριασμό;",
      register: "Εγγραφή",
      footerRight: "AEGRIS · Ελεγχόμενος γεωπονικός χώρος εργασίας",
    },
    sv: {
      secureWorkspace: "Säker arbetsyta",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Beslutsstöd för fältets tillstånd i en gemensam operativ arbetsyta.",
      heroDescription: "AEGRIS kopplar samman satellitövervakning, meteorologiska data och beslutslogik i ett tydligt arbetsflöde för agronomer.",
      monitoringLabel: "Övervakning",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Vegetationsstatus via satellit",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Prioritet och rekommendation",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Fältverifiering av resultat",
      footerLeft: "Agronomisk drift · field intelligence · kontrollerad åtkomst",
      accountAccess: "Kontoåtkomst",
      loginTitle: "Logga in",
      loginDescription: "Logga in på din AEGRIS-arbetsyta.",
      email: "E-post",
      emailPlaceholder: "du@exempel.se",
      password: "Lösenord",
      passwordPlaceholder: "Lösenord",
      forgotPassword: "Glömt lösenordet?",
      invalidCredentials: "Ogiltig e-postadress eller lösenord.",
      loginFailed: "Inloggningen kunde inte slutföras.",
      signingIn: "Loggar in...",
      signIn: "Logga in",
      noAccount: "Har du inget konto?",
      register: "Registrera",
      footerRight: "AEGRIS · Kontrollerad agronomisk arbetsyta",
    },
    da: {
      secureWorkspace: "Sikkert arbejdsområde",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Beslutningsstøtte til markens tilstand i ét operationelt arbejdsområde.",
      heroDescription: "AEGRIS forbinder satellitovervågning, meteorologiske data og beslutningslogik i et klart operationelt workflow for agronomer.",
      monitoringLabel: "Overvågning",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Vegetationsstatus via satellit",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Prioritet og anbefaling",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Feltverificering af resultater",
      footerLeft: "Agronomisk drift · field intelligence · kontrolleret adgang",
      accountAccess: "Kontoadgang",
      loginTitle: "Log ind",
      loginDescription: "Log ind på dit AEGRIS-arbejdsområde.",
      email: "E-mail",
      emailPlaceholder: "dig@eksempel.dk",
      password: "Adgangskode",
      passwordPlaceholder: "Adgangskode",
      forgotPassword: "Glemt adgangskode?",
      invalidCredentials: "Ugyldig e-mail eller adgangskode.",
      loginFailed: "Login kunne ikke gennemføres.",
      signingIn: "Logger ind...",
      signIn: "Log ind",
      noAccount: "Har du ikke en konto?",
      register: "Registrer",
      footerRight: "AEGRIS · Kontrolleret agronomisk arbejdsområde",
    },
    no: {
      secureWorkspace: "Sikkert arbeidsområde",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Beslutningsstøtte for felttilstand i ett operativt arbeidsområde.",
      heroDescription: "AEGRIS kobler satellittovervåking, meteorologiske data og beslutningslogikk i en tydelig operativ arbeidsflyt for agronomer.",
      monitoringLabel: "Overvåking",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Vegetasjonsstatus via satellitt",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Prioritet og anbefaling",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Feltverifisering av resultater",
      footerLeft: "Agronomisk drift · field intelligence · kontrollert tilgang",
      accountAccess: "Kontotilgang",
      loginTitle: "Logg inn",
      loginDescription: "Logg inn på AEGRIS-arbeidsområdet ditt.",
      email: "E-post",
      emailPlaceholder: "deg@eksempel.no",
      password: "Passord",
      passwordPlaceholder: "Passord",
      forgotPassword: "Glemt passord?",
      invalidCredentials: "Ugyldig e-post eller passord.",
      loginFailed: "Innloggingen kunne ikke fullføres.",
      signingIn: "Logger inn...",
      signIn: "Logg inn",
      noAccount: "Har du ikke en konto?",
      register: "Registrer",
      footerRight: "AEGRIS · Kontrollert agronomisk arbeidsområde",
    },
    fi: {
      secureWorkspace: "Suojattu työtila",
      platformLabel: "Field Intelligence Platform",
      heroTitle: "Pellon tilaa koskeva päätöksenteon tuki yhdessä operatiivisessa työtilassa.",
      heroDescription: "AEGRIS yhdistää satelliittiseurannan, meteorologiset tiedot ja päätöslogiikan selkeäksi agronomien työprosessiksi.",
      monitoringLabel: "Seuranta",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Kasvillisuuden tila satelliitista",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Prioriteetti ja suositus",
      groundTruthLabel: "Ground Truth",
      groundTruthValue: "Field Validation",
      groundTruthDetail: "Tulosten tarkistus pellolla",
      footerLeft: "Agronomiset toiminnot · field intelligence · hallittu käyttöoikeus",
      accountAccess: "Tilin käyttö",
      loginTitle: "Kirjaudu sisään",
      loginDescription: "Kirjaudu AEGRIS-työtilaasi.",
      email: "Sähköposti",
      emailPlaceholder: "sinä@esimerkki.fi",
      password: "Salasana",
      passwordPlaceholder: "Salasana",
      forgotPassword: "Unohditko salasanan?",
      invalidCredentials: "Virheellinen sähköposti tai salasana.",
      loginFailed: "Kirjautumista ei voitu suorittaa loppuun.",
      signingIn: "Kirjaudutaan...",
      signIn: "Kirjaudu sisään",
      noAccount: "Eikö sinulla ole tiliä?",
      register: "Rekisteröidy",
      footerRight: "AEGRIS · Hallittu agronominen työtila",
    }
  } as const;

  return copies[language as keyof typeof copies] ?? copies.en;
}
export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getLoginCopy(language);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function login() {
    if (loading) return;

    setErrorMessage("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.user || !data.session) {
        if (error) {
          console.error("LOGIN ERROR:", error);
        }

        setErrorMessage(copy.invalidCredentials);
        return;
      }

      router.replace(getSafeNextPath());
      router.refresh();
    } catch (error) {
      console.error("LOGIN CLIENT ERROR:", error);
      setErrorMessage(copy.loginFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#05090d] text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
        <section className="relative hidden overflow-hidden border-r border-white/[0.06] bg-[#070c11] lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(103,232,249,0.08),transparent_28%),radial-gradient(circle_at_75%_70%,rgba(34,211,238,0.05),transparent_25%)]" />

          <div className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-10 py-7">
            <div>
              <div className="text-xl font-black tracking-[0.2em] text-white">
                AEGRIS
              </div>
              <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.24em] text-cyan-300/70">
                Agronomic Intelligence
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-slate-500">
              {copy.secureWorkspace}
            </div>
          </div>

          <div className="relative z-10 flex flex-1 items-center px-10 py-12 xl:px-16">
            <div className="max-w-2xl">
              <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
                {copy.platformLabel}
              </div>

              <h1 className="mt-4 max-w-xl text-5xl font-black tracking-[-0.05em] text-white xl:text-6xl">
                {copy.heroTitle}
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500">
                {copy.heroDescription}
              </p>

              <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
                <FeatureCard
                  label={copy.monitoringLabel}
                  value={copy.monitoringValue}
                  detail={copy.monitoringDetail}
                />
                <FeatureCard
                  label={copy.decisionLabel}
                  value={copy.decisionValue}
                  detail={copy.decisionDetail}
                />
                <FeatureCard
                  label={copy.groundTruthLabel}
                  value={copy.groundTruthValue}
                  detail={copy.groundTruthDetail}
                />
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/[0.06] px-10 py-5 text-[8px] uppercase tracking-[0.12em] text-slate-700">
            {copy.footerLeft}
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="absolute right-5 top-5 sm:right-8 sm:top-8">
            <LanguageSwitcher />
          </div>

          <div className="w-full max-w-[460px]">
            <div className="mb-8 lg:hidden">
              <div className="text-lg font-black tracking-[0.2em] text-white">
                AEGRIS
              </div>
              <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.22em] text-cyan-300/70">
                Agronomic Intelligence
              </div>
            </div>

            <div className="rounded-[26px] border border-white/[0.07] bg-[#0a1016] p-6 shadow-2xl shadow-black/20 sm:p-8">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">
                {copy.accountAccess}
              </div>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">
                {copy.loginTitle}
              </h2>

              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                {copy.loginDescription}
              </p>

              <form
                className="mt-7"
                onSubmit={(event) => {
                  event.preventDefault();
                  void login();
                }}
              >
                <label
                  htmlFor="email"
                  className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500"
                >
                  {copy.email}
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder={copy.emailPlaceholder}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#071017] px-4 py-3 text-[11px] text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <div className="mt-5 flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500"
                  >
                    {copy.password}
                  </label>

                  <Link
                    href="/auth/forgot-password"
                    className="text-[9px] font-bold text-cyan-300 transition hover:text-cyan-200"
                  >
                    {copy.forgotPassword}
                  </Link>
                </div>

                <input
                  id="password"
                  type="password"
                  placeholder={copy.passwordPlaceholder}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#071017] px-4 py-3 text-[11px] text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                />

                {errorMessage && (
                  <div className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.04] px-4 py-3 text-[10px] leading-5 text-red-300">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-cyan-300 px-5 py-3 text-[10px] font-black text-[#061015] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? copy.signingIn : copy.signIn}
                </button>
              </form>

              <div className="mt-6 border-t border-white/[0.06] pt-5 text-center text-[10px] text-slate-600">
                {copy.noAccount}{" "}
                <Link
                  href="/register"
                  className="font-bold text-cyan-300 transition hover:text-cyan-200"
                >
                  {copy.register}
                </Link>
              </div>
            </div>

            <div className="mt-4 text-center text-[8px] uppercase tracking-[0.12em] text-slate-800">
              {copy.footerRight}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="text-[8px] font-black uppercase tracking-[0.12em] text-slate-700">
        {label}
      </div>
      <div className="mt-2 text-sm font-black text-white">{value}</div>
      <div className="mt-1 text-[8px] leading-4 text-slate-600">{detail}</div>
    </div>
  );
}
