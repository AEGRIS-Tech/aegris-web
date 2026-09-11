"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";

import { supabase } from "@/lib/supabase";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";

function getRegisterCopy(language: string) {
  const copies = {
    en: {
      newWorkspaceAccess: "New Workspace Access",
      workspaceLabel: "Controlled Agronomic Workspace",
      heroTitle: "Create an account for field monitoring and decision support.",
      heroDescription: "After registration, you will gain access to the AEGRIS workspace. If you arrived through an invitation, your account will be linked to the relevant organization after confirmation.",
      monitoringLabel: "Monitoring",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Satellite field status",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Score, priority and recommendation",
      organizationLabel: "Organization",
      organizationValue: "Team Access",
      organizationDetail: "Roles, members and invitations",
      footerLeft: "Secure registration · organization access · agronomic workflow",
      accountRegistration: "Account Registration",
      title: "Registration",
      invitedTitle: "Invited member registration",
      description: "Create an account to access the AEGRIS workspace.",
      invitedDescription: "Create an account and continue to accept the organization invitation.",
      invitationNotice: "You have been invited to an organization in AEGRIS. After your account is created and confirmed, the invitation will be processed automatically.",
      email: "E-mail",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passwordPlaceholder: "At least 8 characters",
      confirmPassword: "Confirm password",
      confirmPasswordPlaceholder: "Repeat password",
      passwordTooShort: "Password must contain at least 8 characters.",
      passwordsMismatch: "Passwords do not match.",
      createFailed: "The account could not be created.",
      accountCreatedSignedIn: "The account was created and you are signed in.",
      accountCreatedConfirm: "The account was created. Check your e-mail and confirm the registration.",
      accountCreatedInvite: "The account was created. Check your e-mail and confirm the registration. You will then continue to accept the organization invitation.",
      registering: "Registering...",
      register: "Register",
      createAndContinue: "Create account and continue",
      alreadyAccount: "Already have an account?",
      signIn: "Sign in",
      loading: "Loading registration...",
      footerRight: "AEGRIS · Controlled agronomic workspace",
    },
    cs: {
      newWorkspaceAccess: "Přístup do nového pracovního prostoru",
      workspaceLabel: "Řízený agronomický pracovní prostor",
      heroTitle: "Vytvořte účet pro práci s monitoringem a rozhodováním nad pozemky.",
      heroDescription: "Po registraci získáte přístup k pracovnímu prostředí AEGRIS. Pokud přicházíte přes pozvánku, účet se po potvrzení naváže na příslušnou organizaci.",
      monitoringLabel: "Monitoring",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Satelitní stav pozemků",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Skóre, priorita a doporučení",
      organizationLabel: "Organizace",
      organizationValue: "Týmový přístup",
      organizationDetail: "Role, členové a pozvánky",
      footerLeft: "Bezpečná registrace · přístup do organizace · agronomický workflow",
      accountRegistration: "Registrace účtu",
      title: "Registrace",
      invitedTitle: "Registrace pozvaného člena",
      description: "Vytvořte účet pro vstup do pracovního prostředí AEGRIS.",
      invitedDescription: "Vytvořte účet a pokračujte k přijetí pozvánky do organizace.",
      invitationNotice: "Byli jste pozváni do organizace v AEGRIS. Po vytvoření a potvrzení účtu bude pozvánka automaticky zpracována.",
      email: "E-mail",
      emailPlaceholder: "vas@email.cz",
      password: "Heslo",
      passwordPlaceholder: "Minimálně 8 znaků",
      confirmPassword: "Potvrzení hesla",
      confirmPasswordPlaceholder: "Zopakujte heslo",
      passwordTooShort: "Heslo musí mít alespoň 8 znaků.",
      passwordsMismatch: "Hesla se neshodují.",
      createFailed: "Účet se nepodařilo vytvořit.",
      accountCreatedSignedIn: "Účet byl vytvořen a jste přihlášený.",
      accountCreatedConfirm: "Účet byl vytvořen. Zkontrolujte e-mail a potvrďte registraci.",
      accountCreatedInvite: "Účet byl vytvořen. Zkontrolujte e-mail a potvrďte registraci. Poté budete pokračovat k přijetí pozvánky do organizace.",
      registering: "Registruji...",
      register: "Registrovat",
      createAndContinue: "Vytvořit účet a pokračovat",
      alreadyAccount: "Už máte účet?",
      signIn: "Přihlásit se",
      loading: "Načítám registraci...",
      footerRight: "AEGRIS · Řízený agronomický pracovní prostor",
    },
    sk: {
      newWorkspaceAccess: "Prístup do nového pracovného priestoru",
      workspaceLabel: "Riadený agronomický pracovný priestor",
      heroTitle: "Vytvorte si účet na monitorovanie polí a podporu rozhodovania.",
      heroDescription: "Po registrácii získate prístup do pracovného priestoru AEGRIS. Ak ste prišli cez pozvánku, po potvrdení sa váš účet prepojí s príslušnou organizáciou.",
      monitoringLabel: "Monitoring",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Satelitný stav polí",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Skóre, priorita a odporúčanie",
      organizationLabel: "Organizácia",
      organizationValue: "Tímový prístup",
      organizationDetail: "Roly, členovia a pozvánky",
      footerLeft: "Bezpečná registrácia · prístup do organizácie · agronomický workflow",
      accountRegistration: "Registrácia účtu",
      title: "Registrácia",
      invitedTitle: "Registrácia pozvaného člena",
      description: "Vytvorte si účet na prístup do pracovného priestoru AEGRIS.",
      invitedDescription: "Vytvorte si účet a pokračujte k prijatiu pozvánky do organizácie.",
      invitationNotice: "Boli ste pozvaní do organizácie v AEGRIS. Po vytvorení a potvrdení účtu bude pozvánka automaticky spracovaná.",
      email: "E-mail",
      emailPlaceholder: "vy@example.sk",
      password: "Heslo",
      passwordPlaceholder: "Minimálne 8 znakov",
      confirmPassword: "Potvrdiť heslo",
      confirmPasswordPlaceholder: "Zopakujte heslo",
      passwordTooShort: "Heslo musí obsahovať aspoň 8 znakov.",
      passwordsMismatch: "Heslá sa nezhodujú.",
      createFailed: "Účet sa nepodarilo vytvoriť.",
      accountCreatedSignedIn: "Účet bol vytvorený a ste prihlásený.",
      accountCreatedConfirm: "Účet bol vytvorený. Skontrolujte e-mail a potvrďte registráciu.",
      accountCreatedInvite: "Účet bol vytvorený. Skontrolujte e-mail a potvrďte registráciu. Potom budete pokračovať k prijatiu pozvánky do organizácie.",
      registering: "Registrujem...",
      register: "Registrovať",
      createAndContinue: "Vytvoriť účet a pokračovať",
      alreadyAccount: "Už máte účet?",
      signIn: "Prihlásiť sa",
      loading: "Načítavam registráciu...",
      footerRight: "AEGRIS · Riadený agronomický pracovný priestor",
    },
    de: {
      newWorkspaceAccess: "Zugang zum neuen Arbeitsbereich",
      workspaceLabel: "Kontrollierter agronomischer Arbeitsbereich",
      heroTitle: "Erstellen Sie ein Konto für Feldmonitoring und Entscheidungsunterstützung.",
      heroDescription: "Nach der Registrierung erhalten Sie Zugang zum AEGRIS-Arbeitsbereich. Wenn Sie über eine Einladung gekommen sind, wird Ihr Konto nach der Bestätigung mit der entsprechenden Organisation verknüpft.",
      monitoringLabel: "Monitoring",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Satellitengestützter Feldzustand",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Score, Priorität und Empfehlung",
      organizationLabel: "Organisation",
      organizationValue: "Teamzugang",
      organizationDetail: "Rollen, Mitglieder und Einladungen",
      footerLeft: "Sichere Registrierung · Organisationszugang · agronomischer Workflow",
      accountRegistration: "Kontoregistrierung",
      title: "Registrierung",
      invitedTitle: "Registrierung eines eingeladenen Mitglieds",
      description: "Erstellen Sie ein Konto für den Zugang zum AEGRIS-Arbeitsbereich.",
      invitedDescription: "Erstellen Sie ein Konto und fahren Sie mit der Annahme der Organisationseinladung fort.",
      invitationNotice: "Sie wurden zu einer Organisation in AEGRIS eingeladen. Nach Erstellung und Bestätigung Ihres Kontos wird die Einladung automatisch verarbeitet.",
      email: "E-Mail",
      emailPlaceholder: "sie@beispiel.de",
      password: "Passwort",
      passwordPlaceholder: "Mindestens 8 Zeichen",
      confirmPassword: "Passwort bestätigen",
      confirmPasswordPlaceholder: "Passwort wiederholen",
      passwordTooShort: "Das Passwort muss mindestens 8 Zeichen enthalten.",
      passwordsMismatch: "Die Passwörter stimmen nicht überein.",
      createFailed: "Das Konto konnte nicht erstellt werden.",
      accountCreatedSignedIn: "Das Konto wurde erstellt und Sie sind angemeldet.",
      accountCreatedConfirm: "Das Konto wurde erstellt. Prüfen Sie Ihre E-Mail und bestätigen Sie die Registrierung.",
      accountCreatedInvite: "Das Konto wurde erstellt. Prüfen Sie Ihre E-Mail und bestätigen Sie die Registrierung. Anschließend können Sie die Organisationseinladung annehmen.",
      registering: "Registrierung...",
      register: "Registrieren",
      createAndContinue: "Konto erstellen und fortfahren",
      alreadyAccount: "Sie haben bereits ein Konto?",
      signIn: "Anmelden",
      loading: "Registrierung wird geladen...",
      footerRight: "AEGRIS · Kontrollierter agronomischer Arbeitsbereich",
    },
    pl: {
      newWorkspaceAccess: "Dostęp do nowej przestrzeni",
      workspaceLabel: "Kontrolowana przestrzeń agronomiczna",
      heroTitle: "Utwórz konto do monitorowania pól i wsparcia decyzji.",
      heroDescription: "Po rejestracji uzyskasz dostęp do przestrzeni AEGRIS. Jeśli korzystasz z zaproszenia, po potwierdzeniu konto zostanie połączone z odpowiednią organizacją.",
      monitoringLabel: "Monitoring",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Satelitarny stan pól",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Ocena, priorytet i zalecenie",
      organizationLabel: "Organizacja",
      organizationValue: "Dostęp zespołowy",
      organizationDetail: "Role, członkowie i zaproszenia",
      footerLeft: "Bezpieczna rejestracja · dostęp do organizacji · proces agronomiczny",
      accountRegistration: "Rejestracja konta",
      title: "Rejestracja",
      invitedTitle: "Rejestracja zaproszonego członka",
      description: "Utwórz konto, aby uzyskać dostęp do przestrzeni AEGRIS.",
      invitedDescription: "Utwórz konto i przejdź do przyjęcia zaproszenia do organizacji.",
      invitationNotice: "Otrzymałeś zaproszenie do organizacji w AEGRIS. Po utworzeniu i potwierdzeniu konta zaproszenie zostanie przetworzone automatycznie.",
      email: "E-mail",
      emailPlaceholder: "ty@przyklad.pl",
      password: "Hasło",
      passwordPlaceholder: "Co najmniej 8 znaków",
      confirmPassword: "Potwierdź hasło",
      confirmPasswordPlaceholder: "Powtórz hasło",
      passwordTooShort: "Hasło musi zawierać co najmniej 8 znaków.",
      passwordsMismatch: "Hasła nie są zgodne.",
      createFailed: "Nie udało się utworzyć konta.",
      accountCreatedSignedIn: "Konto zostało utworzone i jesteś zalogowany.",
      accountCreatedConfirm: "Konto zostało utworzone. Sprawdź e-mail i potwierdź rejestrację.",
      accountCreatedInvite: "Konto zostało utworzone. Sprawdź e-mail i potwierdź rejestrację. Następnie przejdziesz do przyjęcia zaproszenia do organizacji.",
      registering: "Rejestracja...",
      register: "Zarejestruj się",
      createAndContinue: "Utwórz konto i kontynuuj",
      alreadyAccount: "Masz już konto?",
      signIn: "Zaloguj się",
      loading: "Ładowanie rejestracji...",
      footerRight: "AEGRIS · Kontrolowana przestrzeń agronomiczna",
    },
    fr: {
      newWorkspaceAccess: "Accès au nouvel espace",
      workspaceLabel: "Espace agronomique contrôlé",
      heroTitle: "Créez un compte pour le suivi des parcelles et l'aide à la décision.",
      heroDescription: "Après l'inscription, vous accéderez à l'espace AEGRIS. Si vous êtes arrivé via une invitation, votre compte sera lié à l'organisation concernée après confirmation.",
      monitoringLabel: "Suivi",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "État des parcelles par satellite",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Score, priorité et recommandation",
      organizationLabel: "Organisation",
      organizationValue: "Accès équipe",
      organizationDetail: "Rôles, membres et invitations",
      footerLeft: "Inscription sécurisée · accès organisation · flux agronomique",
      accountRegistration: "Inscription du compte",
      title: "Inscription",
      invitedTitle: "Inscription d'un membre invité",
      description: "Créez un compte pour accéder à l'espace AEGRIS.",
      invitedDescription: "Créez un compte et poursuivez pour accepter l'invitation à l'organisation.",
      invitationNotice: "Vous avez été invité dans une organisation AEGRIS. Après création et confirmation de votre compte, l'invitation sera traitée automatiquement.",
      email: "E-mail",
      emailPlaceholder: "vous@exemple.fr",
      password: "Mot de passe",
      passwordPlaceholder: "Au moins 8 caractères",
      confirmPassword: "Confirmer le mot de passe",
      confirmPasswordPlaceholder: "Répétez le mot de passe",
      passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères.",
      passwordsMismatch: "Les mots de passe ne correspondent pas.",
      createFailed: "Le compte n'a pas pu être créé.",
      accountCreatedSignedIn: "Le compte a été créé et vous êtes connecté.",
      accountCreatedConfirm: "Le compte a été créé. Consultez votre e-mail et confirmez l'inscription.",
      accountCreatedInvite: "Le compte a été créé. Consultez votre e-mail et confirmez l'inscription. Vous pourrez ensuite accepter l'invitation à l'organisation.",
      registering: "Inscription...",
      register: "S'inscrire",
      createAndContinue: "Créer le compte et continuer",
      alreadyAccount: "Vous avez déjà un compte ?",
      signIn: "Se connecter",
      loading: "Chargement de l'inscription...",
      footerRight: "AEGRIS · Espace agronomique contrôlé",
    },
    es: {
      newWorkspaceAccess: "Acceso a un nuevo espacio",
      workspaceLabel: "Espacio agronómico controlado",
      heroTitle: "Cree una cuenta para monitorización de campos y apoyo a la decisión.",
      heroDescription: "Tras registrarse, tendrá acceso al espacio AEGRIS. Si llegó mediante una invitación, su cuenta se vinculará a la organización correspondiente después de confirmarla.",
      monitoringLabel: "Monitorización",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Estado satelital de los campos",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Puntuación, prioridad y recomendación",
      organizationLabel: "Organización",
      organizationValue: "Acceso del equipo",
      organizationDetail: "Roles, miembros e invitaciones",
      footerLeft: "Registro seguro · acceso a organización · flujo agronómico",
      accountRegistration: "Registro de cuenta",
      title: "Registro",
      invitedTitle: "Registro de miembro invitado",
      description: "Cree una cuenta para acceder al espacio AEGRIS.",
      invitedDescription: "Cree una cuenta y continúe para aceptar la invitación a la organización.",
      invitationNotice: "Ha sido invitado a una organización en AEGRIS. Tras crear y confirmar su cuenta, la invitación se procesará automáticamente.",
      email: "E-mail",
      emailPlaceholder: "usted@ejemplo.es",
      password: "Contraseña",
      passwordPlaceholder: "Al menos 8 caracteres",
      confirmPassword: "Confirmar contraseña",
      confirmPasswordPlaceholder: "Repita la contraseña",
      passwordTooShort: "La contraseña debe contener al menos 8 caracteres.",
      passwordsMismatch: "Las contraseñas no coinciden.",
      createFailed: "No se pudo crear la cuenta.",
      accountCreatedSignedIn: "La cuenta se creó y ha iniciado sesión.",
      accountCreatedConfirm: "La cuenta se creó. Revise su e-mail y confirme el registro.",
      accountCreatedInvite: "La cuenta se creó. Revise su e-mail y confirme el registro. Después continuará para aceptar la invitación a la organización.",
      registering: "Registrando...",
      register: "Registrarse",
      createAndContinue: "Crear cuenta y continuar",
      alreadyAccount: "¿Ya tiene una cuenta?",
      signIn: "Iniciar sesión",
      loading: "Cargando registro...",
      footerRight: "AEGRIS · Espacio agronómico controlado",
    },
    it: {
      newWorkspaceAccess: "Accesso al nuovo spazio",
      workspaceLabel: "Spazio agronomico controllato",
      heroTitle: "Crea un account per il monitoraggio dei campi e il supporto decisionale.",
      heroDescription: "Dopo la registrazione avrai accesso allo spazio AEGRIS. Se sei arrivato tramite invito, dopo la conferma il tuo account sarà collegato all'organizzazione interessata.",
      monitoringLabel: "Monitoraggio",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Stato satellitare dei campi",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Punteggio, priorità e raccomandazione",
      organizationLabel: "Organizzazione",
      organizationValue: "Accesso del team",
      organizationDetail: "Ruoli, membri e inviti",
      footerLeft: "Registrazione sicura · accesso all'organizzazione · flusso agronomico",
      accountRegistration: "Registrazione account",
      title: "Registrazione",
      invitedTitle: "Registrazione membro invitato",
      description: "Crea un account per accedere allo spazio AEGRIS.",
      invitedDescription: "Crea un account e continua per accettare l'invito all'organizzazione.",
      invitationNotice: "Sei stato invitato in un'organizzazione AEGRIS. Dopo la creazione e la conferma dell'account, l'invito verrà elaborato automaticamente.",
      email: "E-mail",
      emailPlaceholder: "tu@esempio.it",
      password: "Password",
      passwordPlaceholder: "Almeno 8 caratteri",
      confirmPassword: "Conferma password",
      confirmPasswordPlaceholder: "Ripeti la password",
      passwordTooShort: "La password deve contenere almeno 8 caratteri.",
      passwordsMismatch: "Le password non corrispondono.",
      createFailed: "Non è stato possibile creare l'account.",
      accountCreatedSignedIn: "L'account è stato creato e hai effettuato l'accesso.",
      accountCreatedConfirm: "L'account è stato creato. Controlla l'e-mail e conferma la registrazione.",
      accountCreatedInvite: "L'account è stato creato. Controlla l'e-mail e conferma la registrazione. Poi potrai accettare l'invito all'organizzazione.",
      registering: "Registrazione...",
      register: "Registrati",
      createAndContinue: "Crea account e continua",
      alreadyAccount: "Hai già un account?",
      signIn: "Accedi",
      loading: "Caricamento registrazione...",
      footerRight: "AEGRIS · Spazio agronomico controllato",
    },
    nl: {
      newWorkspaceAccess: "Toegang tot nieuwe werkruimte",
      workspaceLabel: "Gecontroleerde agronomische werkruimte",
      heroTitle: "Maak een account voor veldmonitoring en beslissingsondersteuning.",
      heroDescription: "Na registratie krijgt u toegang tot de AEGRIS-werkruimte. Via een uitnodiging wordt uw account na bevestiging aan de juiste organisatie gekoppeld.",
      monitoringLabel: "Monitoring",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Satellietstatus van velden",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Score, prioriteit en aanbeveling",
      organizationLabel: "Organisatie",
      organizationValue: "Teamtoegang",
      organizationDetail: "Rollen, leden en uitnodigingen",
      footerLeft: "Veilige registratie · organisatietoegang · agronomische workflow",
      accountRegistration: "Accountregistratie",
      title: "Registratie",
      invitedTitle: "Registratie van uitgenodigd lid",
      description: "Maak een account om toegang te krijgen tot de AEGRIS-werkruimte.",
      invitedDescription: "Maak een account en ga verder om de organisatie-uitnodiging te accepteren.",
      invitationNotice: "U bent uitgenodigd voor een organisatie in AEGRIS. Na het maken en bevestigen van uw account wordt de uitnodiging automatisch verwerkt.",
      email: "E-mail",
      emailPlaceholder: "u@voorbeeld.nl",
      password: "Wachtwoord",
      passwordPlaceholder: "Minimaal 8 tekens",
      confirmPassword: "Wachtwoord bevestigen",
      confirmPasswordPlaceholder: "Herhaal wachtwoord",
      passwordTooShort: "Het wachtwoord moet minimaal 8 tekens bevatten.",
      passwordsMismatch: "De wachtwoorden komen niet overeen.",
      createFailed: "Het account kon niet worden aangemaakt.",
      accountCreatedSignedIn: "Het account is aangemaakt en u bent ingelogd.",
      accountCreatedConfirm: "Het account is aangemaakt. Controleer uw e-mail en bevestig de registratie.",
      accountCreatedInvite: "Het account is aangemaakt. Controleer uw e-mail en bevestig de registratie. Daarna kunt u de organisatie-uitnodiging accepteren.",
      registering: "Registreren...",
      register: "Registreren",
      createAndContinue: "Account maken en doorgaan",
      alreadyAccount: "Heeft u al een account?",
      signIn: "Inloggen",
      loading: "Registratie laden...",
      footerRight: "AEGRIS · Gecontroleerde agronomische werkruimte",
    },
    pt: {
      newWorkspaceAccess: "Acesso a novo espaço",
      workspaceLabel: "Espaço agronómico controlado",
      heroTitle: "Crie uma conta para monitorização de campos e apoio à decisão.",
      heroDescription: "Após o registo, terá acesso ao espaço AEGRIS. Se chegou através de um convite, a sua conta será associada à organização relevante após confirmação.",
      monitoringLabel: "Monitorização",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Estado dos campos por satélite",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Pontuação, prioridade e recomendação",
      organizationLabel: "Organização",
      organizationValue: "Acesso da equipa",
      organizationDetail: "Funções, membros e convites",
      footerLeft: "Registo seguro · acesso à organização · fluxo agronómico",
      accountRegistration: "Registo da conta",
      title: "Registo",
      invitedTitle: "Registo de membro convidado",
      description: "Crie uma conta para aceder ao espaço AEGRIS.",
      invitedDescription: "Crie uma conta e continue para aceitar o convite da organização.",
      invitationNotice: "Foi convidado para uma organização no AEGRIS. Após criar e confirmar a conta, o convite será processado automaticamente.",
      email: "E-mail",
      emailPlaceholder: "voce@exemplo.pt",
      password: "Palavra-passe",
      passwordPlaceholder: "Pelo menos 8 caracteres",
      confirmPassword: "Confirmar palavra-passe",
      confirmPasswordPlaceholder: "Repita a palavra-passe",
      passwordTooShort: "A palavra-passe deve ter pelo menos 8 caracteres.",
      passwordsMismatch: "As palavras-passe não coincidem.",
      createFailed: "Não foi possível criar a conta.",
      accountCreatedSignedIn: "A conta foi criada e iniciou sessão.",
      accountCreatedConfirm: "A conta foi criada. Consulte o e-mail e confirme o registo.",
      accountCreatedInvite: "A conta foi criada. Consulte o e-mail e confirme o registo. Depois poderá aceitar o convite da organização.",
      registering: "A registar...",
      register: "Registar",
      createAndContinue: "Criar conta e continuar",
      alreadyAccount: "Já tem uma conta?",
      signIn: "Entrar",
      loading: "A carregar registo...",
      footerRight: "AEGRIS · Espaço agronómico controlado",
    },
    ro: {
      newWorkspaceAccess: "Acces la un spațiu nou",
      workspaceLabel: "Spațiu agronomic controlat",
      heroTitle: "Creați un cont pentru monitorizarea parcelelor și suport decizional.",
      heroDescription: "După înregistrare veți avea acces la spațiul AEGRIS. Dacă ați venit printr-o invitație, contul va fi asociat organizației relevante după confirmare.",
      monitoringLabel: "Monitorizare",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Starea parcelelor prin satelit",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Scor, prioritate și recomandare",
      organizationLabel: "Organizație",
      organizationValue: "Acces echipă",
      organizationDetail: "Roluri, membri și invitații",
      footerLeft: "Înregistrare securizată · acces organizație · flux agronomic",
      accountRegistration: "Înregistrare cont",
      title: "Înregistrare",
      invitedTitle: "Înregistrarea membrului invitat",
      description: "Creați un cont pentru acces la spațiul AEGRIS.",
      invitedDescription: "Creați un cont și continuați pentru a accepta invitația organizației.",
      invitationNotice: "Ați fost invitat într-o organizație AEGRIS. După crearea și confirmarea contului, invitația va fi procesată automat.",
      email: "E-mail",
      emailPlaceholder: "dvs@exemplu.ro",
      password: "Parolă",
      passwordPlaceholder: "Cel puțin 8 caractere",
      confirmPassword: "Confirmă parola",
      confirmPasswordPlaceholder: "Repetați parola",
      passwordTooShort: "Parola trebuie să conțină cel puțin 8 caractere.",
      passwordsMismatch: "Parolele nu coincid.",
      createFailed: "Contul nu a putut fi creat.",
      accountCreatedSignedIn: "Contul a fost creat și sunteți autentificat.",
      accountCreatedConfirm: "Contul a fost creat. Verificați e-mailul și confirmați înregistrarea.",
      accountCreatedInvite: "Contul a fost creat. Verificați e-mailul și confirmați înregistrarea. Apoi veți putea accepta invitația organizației.",
      registering: "Se înregistrează...",
      register: "Înregistrare",
      createAndContinue: "Creează cont și continuă",
      alreadyAccount: "Aveți deja un cont?",
      signIn: "Autentificare",
      loading: "Se încarcă înregistrarea...",
      footerRight: "AEGRIS · Spațiu agronomic controlat",
    },
    hu: {
      newWorkspaceAccess: "Új munkaterület hozzáférés",
      workspaceLabel: "Ellenőrzött agronómiai munkaterület",
      heroTitle: "Hozzon létre fiókot a táblák megfigyeléséhez és a döntéstámogatáshoz.",
      heroDescription: "Regisztráció után hozzáfér az AEGRIS munkaterülethez. Meghívás esetén a megerősítés után fiókja a megfelelő szervezethez kapcsolódik.",
      monitoringLabel: "Monitoring",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Táblák műholdas állapota",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Pontszám, prioritás és ajánlás",
      organizationLabel: "Szervezet",
      organizationValue: "Csapathozzáférés",
      organizationDetail: "Szerepkörök, tagok és meghívások",
      footerLeft: "Biztonságos regisztráció · szervezeti hozzáférés · agronómiai munkafolyamat",
      accountRegistration: "Fiókregisztráció",
      title: "Regisztráció",
      invitedTitle: "Meghívott tag regisztrációja",
      description: "Hozzon létre fiókot az AEGRIS munkaterület eléréséhez.",
      invitedDescription: "Hozzon létre fiókot, majd folytassa a szervezeti meghívás elfogadásával.",
      invitationNotice: "Meghívást kapott egy AEGRIS-szervezetbe. A fiók létrehozása és megerősítése után a meghívás automatikusan feldolgozásra kerül.",
      email: "E-mail",
      emailPlaceholder: "on@pelda.hu",
      password: "Jelszó",
      passwordPlaceholder: "Legalább 8 karakter",
      confirmPassword: "Jelszó megerősítése",
      confirmPasswordPlaceholder: "Jelszó ismétlése",
      passwordTooShort: "A jelszónak legalább 8 karakterből kell állnia.",
      passwordsMismatch: "A jelszavak nem egyeznek.",
      createFailed: "A fiókot nem sikerült létrehozni.",
      accountCreatedSignedIn: "A fiók létrejött, és be van jelentkezve.",
      accountCreatedConfirm: "A fiók létrejött. Ellenőrizze e-mailjét és erősítse meg a regisztrációt.",
      accountCreatedInvite: "A fiók létrejött. Ellenőrizze e-mailjét és erősítse meg a regisztrációt. Ezután elfogadhatja a szervezeti meghívást.",
      registering: "Regisztráció...",
      register: "Regisztráció",
      createAndContinue: "Fiók létrehozása és folytatás",
      alreadyAccount: "Már van fiókja?",
      signIn: "Bejelentkezés",
      loading: "Regisztráció betöltése...",
      footerRight: "AEGRIS · Ellenőrzött agronómiai munkaterület",
    },
    uk: {
      newWorkspaceAccess: "Доступ до нового робочого простору",
      workspaceLabel: "Контрольований агрономічний простір",
      heroTitle: "Створіть обліковий запис для моніторингу полів і підтримки рішень.",
      heroDescription: "Після реєстрації ви отримаєте доступ до простору AEGRIS. Якщо ви перейшли за запрошенням, після підтвердження обліковий запис буде пов’язано з відповідною організацією.",
      monitoringLabel: "Моніторинг",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Супутниковий стан полів",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Оцінка, пріоритет і рекомендація",
      organizationLabel: "Організація",
      organizationValue: "Командний доступ",
      organizationDetail: "Ролі, учасники та запрошення",
      footerLeft: "Безпечна реєстрація · доступ до організації · агрономічний процес",
      accountRegistration: "Реєстрація облікового запису",
      title: "Реєстрація",
      invitedTitle: "Реєстрація запрошеного учасника",
      description: "Створіть обліковий запис для доступу до простору AEGRIS.",
      invitedDescription: "Створіть обліковий запис і продовжте, щоб прийняти запрошення до організації.",
      invitationNotice: "Вас запросили до організації в AEGRIS. Після створення та підтвердження облікового запису запрошення буде оброблено автоматично.",
      email: "E-mail",
      emailPlaceholder: "you@example.ua",
      password: "Пароль",
      passwordPlaceholder: "Щонайменше 8 символів",
      confirmPassword: "Підтвердьте пароль",
      confirmPasswordPlaceholder: "Повторіть пароль",
      passwordTooShort: "Пароль має містити щонайменше 8 символів.",
      passwordsMismatch: "Паролі не збігаються.",
      createFailed: "Не вдалося створити обліковий запис.",
      accountCreatedSignedIn: "Обліковий запис створено, і ви ввійшли.",
      accountCreatedConfirm: "Обліковий запис створено. Перевірте e-mail і підтвердьте реєстрацію.",
      accountCreatedInvite: "Обліковий запис створено. Перевірте e-mail і підтвердьте реєстрацію. Потім ви зможете прийняти запрошення до організації.",
      registering: "Реєстрація...",
      register: "Зареєструватися",
      createAndContinue: "Створити обліковий запис і продовжити",
      alreadyAccount: "Уже маєте обліковий запис?",
      signIn: "Увійти",
      loading: "Завантаження реєстрації...",
      footerRight: "AEGRIS · Контрольований агрономічний простір",
    },
    bg: {
      newWorkspaceAccess: "Достъп до ново работно пространство",
      workspaceLabel: "Контролирано агрономическо пространство",
      heroTitle: "Създайте профил за наблюдение на полета и подкрепа на решенията.",
      heroDescription: "След регистрация ще получите достъп до пространството AEGRIS. Ако сте дошли чрез покана, след потвърждение профилът ви ще бъде свързан със съответната организация.",
      monitoringLabel: "Мониторинг",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Сателитно състояние на полетата",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Оценка, приоритет и препоръка",
      organizationLabel: "Организация",
      organizationValue: "Екипен достъп",
      organizationDetail: "Роли, членове и покани",
      footerLeft: "Сигурна регистрация · достъп до организация · агрономичен процес",
      accountRegistration: "Регистрация на профил",
      title: "Регистрация",
      invitedTitle: "Регистрация на поканен член",
      description: "Създайте профил за достъп до пространството AEGRIS.",
      invitedDescription: "Създайте профил и продължете, за да приемете поканата за организацията.",
      invitationNotice: "Поканени сте в организация в AEGRIS. След създаване и потвърждение на профила поканата ще бъде обработена автоматично.",
      email: "E-mail",
      emailPlaceholder: "you@example.bg",
      password: "Парола",
      passwordPlaceholder: "Поне 8 знака",
      confirmPassword: "Потвърдете паролата",
      confirmPasswordPlaceholder: "Повторете паролата",
      passwordTooShort: "Паролата трябва да съдържа поне 8 знака.",
      passwordsMismatch: "Паролите не съвпадат.",
      createFailed: "Профилът не можа да бъде създаден.",
      accountCreatedSignedIn: "Профилът е създаден и сте влезли.",
      accountCreatedConfirm: "Профилът е създаден. Проверете e-mail и потвърдете регистрацията.",
      accountCreatedInvite: "Профилът е създаден. Проверете e-mail и потвърдете регистрацията. След това ще можете да приемете поканата за организацията.",
      registering: "Регистриране...",
      register: "Регистрация",
      createAndContinue: "Създай профил и продължи",
      alreadyAccount: "Вече имате профил?",
      signIn: "Вход",
      loading: "Зареждане на регистрацията...",
      footerRight: "AEGRIS · Контролирано агрономическо пространство",
    },
    hr: {
      newWorkspaceAccess: "Pristup novom radnom prostoru",
      workspaceLabel: "Kontrolirani agronomski radni prostor",
      heroTitle: "Izradite račun za praćenje polja i podršku odlučivanju.",
      heroDescription: "Nakon registracije dobit ćete pristup AEGRIS radnom prostoru. Ako ste došli putem pozivnice, račun će se nakon potvrde povezati s odgovarajućom organizacijom.",
      monitoringLabel: "Praćenje",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Satelitsko stanje polja",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Ocjena, prioritet i preporuka",
      organizationLabel: "Organizacija",
      organizationValue: "Timski pristup",
      organizationDetail: "Uloge, članovi i pozivnice",
      footerLeft: "Sigurna registracija · pristup organizaciji · agronomski tijek",
      accountRegistration: "Registracija računa",
      title: "Registracija",
      invitedTitle: "Registracija pozvanog člana",
      description: "Izradite račun za pristup AEGRIS radnom prostoru.",
      invitedDescription: "Izradite račun i nastavite s prihvaćanjem pozivnice organizacije.",
      invitationNotice: "Pozvani ste u organizaciju u AEGRIS-u. Nakon izrade i potvrde računa pozivnica će se automatski obraditi.",
      email: "E-mail",
      emailPlaceholder: "vi@primjer.hr",
      password: "Lozinka",
      passwordPlaceholder: "Najmanje 8 znakova",
      confirmPassword: "Potvrdi lozinku",
      confirmPasswordPlaceholder: "Ponovite lozinku",
      passwordTooShort: "Lozinka mora sadržavati najmanje 8 znakova.",
      passwordsMismatch: "Lozinke se ne podudaraju.",
      createFailed: "Račun nije bilo moguće izraditi.",
      accountCreatedSignedIn: "Račun je izrađen i prijavljeni ste.",
      accountCreatedConfirm: "Račun je izrađen. Provjerite e-mail i potvrdite registraciju.",
      accountCreatedInvite: "Račun je izrađen. Provjerite e-mail i potvrdite registraciju. Zatim možete prihvatiti pozivnicu organizacije.",
      registering: "Registracija...",
      register: "Registriraj se",
      createAndContinue: "Izradi račun i nastavi",
      alreadyAccount: "Već imate račun?",
      signIn: "Prijava",
      loading: "Učitavanje registracije...",
      footerRight: "AEGRIS · Kontrolirani agronomski radni prostor",
    },
    sl: {
      newWorkspaceAccess: "Dostop do novega delovnega prostora",
      workspaceLabel: "Nadzorovan agronomski delovni prostor",
      heroTitle: "Ustvarite račun za spremljanje polj in podporo odločanju.",
      heroDescription: "Po registraciji boste dobili dostop do delovnega prostora AEGRIS. Če ste prišli prek povabila, bo račun po potrditvi povezan z ustrezno organizacijo.",
      monitoringLabel: "Spremljanje",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Satelitsko stanje polj",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Ocena, prednost in priporočilo",
      organizationLabel: "Organizacija",
      organizationValue: "Ekipni dostop",
      organizationDetail: "Vloge, člani in povabila",
      footerLeft: "Varna registracija · dostop do organizacije · agronomski potek",
      accountRegistration: "Registracija računa",
      title: "Registracija",
      invitedTitle: "Registracija povabljenega člana",
      description: "Ustvarite račun za dostop do delovnega prostora AEGRIS.",
      invitedDescription: "Ustvarite račun in nadaljujte s sprejemom povabila v organizacijo.",
      invitationNotice: "Povabljeni ste v organizacijo v AEGRIS. Po ustvarjanju in potrditvi računa bo povabilo samodejno obdelano.",
      email: "E-pošta",
      emailPlaceholder: "vi@primer.si",
      password: "Geslo",
      passwordPlaceholder: "Najmanj 8 znakov",
      confirmPassword: "Potrdite geslo",
      confirmPasswordPlaceholder: "Ponovite geslo",
      passwordTooShort: "Geslo mora vsebovati najmanj 8 znakov.",
      passwordsMismatch: "Gesli se ne ujemata.",
      createFailed: "Računa ni bilo mogoče ustvariti.",
      accountCreatedSignedIn: "Račun je ustvarjen in prijavljeni ste.",
      accountCreatedConfirm: "Račun je ustvarjen. Preverite e-pošto in potrdite registracijo.",
      accountCreatedInvite: "Račun je ustvarjen. Preverite e-pošto in potrdite registracijo. Nato lahko sprejmete povabilo v organizacijo.",
      registering: "Registracija...",
      register: "Registriraj se",
      createAndContinue: "Ustvari račun in nadaljuj",
      alreadyAccount: "Že imate račun?",
      signIn: "Prijava",
      loading: "Nalaganje registracije...",
      footerRight: "AEGRIS · Nadzorovan agronomski delovni prostor",
    },
    lt: {
      newWorkspaceAccess: "Prieiga prie naujos darbo erdvės",
      workspaceLabel: "Kontroliuojama agronominė darbo erdvė",
      heroTitle: "Sukurkite paskyrą laukų stebėsenai ir sprendimų palaikymui.",
      heroDescription: "Po registracijos gausite prieigą prie AEGRIS darbo erdvės. Jei atėjote per kvietimą, patvirtinus paskyrą ji bus susieta su atitinkama organizacija.",
      monitoringLabel: "Stebėsena",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Palydovinė laukų būklė",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Įvertis, prioritetas ir rekomendacija",
      organizationLabel: "Organizacija",
      organizationValue: "Komandos prieiga",
      organizationDetail: "Vaidmenys, nariai ir kvietimai",
      footerLeft: "Saugi registracija · prieiga prie organizacijos · agronominė darbo eiga",
      accountRegistration: "Paskyros registracija",
      title: "Registracija",
      invitedTitle: "Pakviesto nario registracija",
      description: "Sukurkite paskyrą, kad galėtumėte naudotis AEGRIS darbo erdve.",
      invitedDescription: "Sukurkite paskyrą ir tęskite organizacijos kvietimo priėmimą.",
      invitationNotice: "Esate pakviesti į organizaciją AEGRIS. Sukūrus ir patvirtinus paskyrą kvietimas bus apdorotas automatiškai.",
      email: "El. paštas",
      emailPlaceholder: "jūs@pavyzdys.lt",
      password: "Slaptažodis",
      passwordPlaceholder: "Bent 8 simboliai",
      confirmPassword: "Patvirtinti slaptažodį",
      confirmPasswordPlaceholder: "Pakartokite slaptažodį",
      passwordTooShort: "Slaptažodį turi sudaryti bent 8 simboliai.",
      passwordsMismatch: "Slaptažodžiai nesutampa.",
      createFailed: "Paskyros sukurti nepavyko.",
      accountCreatedSignedIn: "Paskyra sukurta ir esate prisijungę.",
      accountCreatedConfirm: "Paskyra sukurta. Patikrinkite el. paštą ir patvirtinkite registraciją.",
      accountCreatedInvite: "Paskyra sukurta. Patikrinkite el. paštą ir patvirtinkite registraciją. Tada galėsite priimti organizacijos kvietimą.",
      registering: "Registruojama...",
      register: "Registruotis",
      createAndContinue: "Sukurti paskyrą ir tęsti",
      alreadyAccount: "Jau turite paskyrą?",
      signIn: "Prisijungti",
      loading: "Įkeliama registracija...",
      footerRight: "AEGRIS · Kontroliuojama agronominė darbo erdvė",
    },
    lv: {
      newWorkspaceAccess: "Piekļuve jaunai darba videi",
      workspaceLabel: "Kontrolēta agronomiskā darba vide",
      heroTitle: "Izveidojiet kontu lauku uzraudzībai un lēmumu atbalstam.",
      heroDescription: "Pēc reģistrācijas iegūsiet piekļuvi AEGRIS darba videi. Ja ieradāties ar uzaicinājumu, pēc apstiprināšanas konts tiks piesaistīts attiecīgajai organizācijai.",
      monitoringLabel: "Uzraudzība",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Lauku stāvoklis no satelīta",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Vērtējums, prioritāte un ieteikums",
      organizationLabel: "Organizācija",
      organizationValue: "Komandas piekļuve",
      organizationDetail: "Lomas, dalībnieki un uzaicinājumi",
      footerLeft: "Droša reģistrācija · piekļuve organizācijai · agronomiskā darba plūsma",
      accountRegistration: "Konta reģistrācija",
      title: "Reģistrācija",
      invitedTitle: "Uzaicināta dalībnieka reģistrācija",
      description: "Izveidojiet kontu, lai piekļūtu AEGRIS darba videi.",
      invitedDescription: "Izveidojiet kontu un turpiniet, lai pieņemtu organizācijas uzaicinājumu.",
      invitationNotice: "Jūs esat uzaicināts uz organizāciju AEGRIS. Pēc konta izveides un apstiprināšanas uzaicinājums tiks apstrādāts automātiski.",
      email: "E-pasts",
      emailPlaceholder: "jūs@piemers.lv",
      password: "Parole",
      passwordPlaceholder: "Vismaz 8 rakstzīmes",
      confirmPassword: "Apstiprināt paroli",
      confirmPasswordPlaceholder: "Atkārtojiet paroli",
      passwordTooShort: "Parolei jābūt vismaz 8 rakstzīmes garai.",
      passwordsMismatch: "Paroles nesakrīt.",
      createFailed: "Kontu neizdevās izveidot.",
      accountCreatedSignedIn: "Konts ir izveidots, un esat pieteicies.",
      accountCreatedConfirm: "Konts ir izveidots. Pārbaudiet e-pastu un apstipriniet reģistrāciju.",
      accountCreatedInvite: "Konts ir izveidots. Pārbaudiet e-pastu un apstipriniet reģistrāciju. Pēc tam varēsiet pieņemt organizācijas uzaicinājumu.",
      registering: "Reģistrē...",
      register: "Reģistrēties",
      createAndContinue: "Izveidot kontu un turpināt",
      alreadyAccount: "Jums jau ir konts?",
      signIn: "Pieteikties",
      loading: "Ielādē reģistrāciju...",
      footerRight: "AEGRIS · Kontrolēta agronomiskā darba vide",
    },
    et: {
      newWorkspaceAccess: "Juurdepääs uuele tööruumile",
      workspaceLabel: "Kontrollitud agronoomiline tööruum",
      heroTitle: "Looge konto põldude seireks ja otsustustoeks.",
      heroDescription: "Pärast registreerimist saate juurdepääsu AEGRIS-e tööruumile. Kui tulite kutse kaudu, seotakse konto pärast kinnitamist vastava organisatsiooniga.",
      monitoringLabel: "Seire",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Põldude seisund satelliidilt",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Hinne, prioriteet ja soovitus",
      organizationLabel: "Organisatsioon",
      organizationValue: "Meeskonna juurdepääs",
      organizationDetail: "Rollid, liikmed ja kutsed",
      footerLeft: "Turvaline registreerimine · organisatsiooni juurdepääs · agronoomiline töövoog",
      accountRegistration: "Konto registreerimine",
      title: "Registreerimine",
      invitedTitle: "Kutsutud liikme registreerimine",
      description: "Looge konto AEGRIS-e tööruumile juurdepääsuks.",
      invitedDescription: "Looge konto ja jätkake organisatsiooni kutse vastuvõtmisega.",
      invitationNotice: "Teid on kutsutud AEGRIS-e organisatsiooni. Pärast konto loomist ja kinnitamist töödeldakse kutse automaatselt.",
      email: "E-post",
      emailPlaceholder: "teie@naide.ee",
      password: "Parool",
      passwordPlaceholder: "Vähemalt 8 märki",
      confirmPassword: "Kinnita parool",
      confirmPasswordPlaceholder: "Korrake parooli",
      passwordTooShort: "Parool peab sisaldama vähemalt 8 märki.",
      passwordsMismatch: "Paroolid ei ühti.",
      createFailed: "Kontot ei saanud luua.",
      accountCreatedSignedIn: "Konto on loodud ja olete sisse logitud.",
      accountCreatedConfirm: "Konto on loodud. Kontrollige e-posti ja kinnitage registreerimine.",
      accountCreatedInvite: "Konto on loodud. Kontrollige e-posti ja kinnitage registreerimine. Seejärel saate organisatsiooni kutse vastu võtta.",
      registering: "Registreerimine...",
      register: "Registreeru",
      createAndContinue: "Loo konto ja jätka",
      alreadyAccount: "Kas teil on juba konto?",
      signIn: "Logi sisse",
      loading: "Registreerimise laadimine...",
      footerRight: "AEGRIS · Kontrollitud agronoomiline tööruum",
    },
    el: {
      newWorkspaceAccess: "Πρόσβαση σε νέο χώρο εργασίας",
      workspaceLabel: "Ελεγχόμενος γεωπονικός χώρος εργασίας",
      heroTitle: "Δημιουργήστε λογαριασμό για παρακολούθηση αγρών και υποστήριξη αποφάσεων.",
      heroDescription: "Μετά την εγγραφή θα αποκτήσετε πρόσβαση στον χώρο AEGRIS. Αν ήρθατε μέσω πρόσκλησης, μετά την επιβεβαίωση ο λογαριασμός σας θα συνδεθεί με τον αντίστοιχο οργανισμό.",
      monitoringLabel: "Παρακολούθηση",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Δορυφορική κατάσταση αγρών",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Βαθμολογία, προτεραιότητα και σύσταση",
      organizationLabel: "Οργανισμός",
      organizationValue: "Πρόσβαση ομάδας",
      organizationDetail: "Ρόλοι, μέλη και προσκλήσεις",
      footerLeft: "Ασφαλής εγγραφή · πρόσβαση οργανισμού · γεωπονική ροή εργασίας",
      accountRegistration: "Εγγραφή λογαριασμού",
      title: "Εγγραφή",
      invitedTitle: "Εγγραφή προσκεκλημένου μέλους",
      description: "Δημιουργήστε λογαριασμό για πρόσβαση στον χώρο AEGRIS.",
      invitedDescription: "Δημιουργήστε λογαριασμό και συνεχίστε για να αποδεχτείτε την πρόσκληση του οργανισμού.",
      invitationNotice: "Έχετε προσκληθεί σε οργανισμό στο AEGRIS. Μετά τη δημιουργία και επιβεβαίωση του λογαριασμού, η πρόσκληση θα επεξεργαστεί αυτόματα.",
      email: "E-mail",
      emailPlaceholder: "you@example.gr",
      password: "Κωδικός πρόσβασης",
      passwordPlaceholder: "Τουλάχιστον 8 χαρακτήρες",
      confirmPassword: "Επιβεβαίωση κωδικού",
      confirmPasswordPlaceholder: "Επαναλάβετε τον κωδικό",
      passwordTooShort: "Ο κωδικός πρέπει να περιέχει τουλάχιστον 8 χαρακτήρες.",
      passwordsMismatch: "Οι κωδικοί δεν ταιριάζουν.",
      createFailed: "Δεν ήταν δυνατή η δημιουργία του λογαριασμού.",
      accountCreatedSignedIn: "Ο λογαριασμός δημιουργήθηκε και έχετε συνδεθεί.",
      accountCreatedConfirm: "Ο λογαριασμός δημιουργήθηκε. Ελέγξτε το e-mail και επιβεβαιώστε την εγγραφή.",
      accountCreatedInvite: "Ο λογαριασμός δημιουργήθηκε. Ελέγξτε το e-mail και επιβεβαιώστε την εγγραφή. Στη συνέχεια μπορείτε να αποδεχτείτε την πρόσκληση του οργανισμού.",
      registering: "Εγγραφή...",
      register: "Εγγραφή",
      createAndContinue: "Δημιουργία λογαριασμού και συνέχεια",
      alreadyAccount: "Έχετε ήδη λογαριασμό;",
      signIn: "Σύνδεση",
      loading: "Φόρτωση εγγραφής...",
      footerRight: "AEGRIS · Ελεγχόμενος γεωπονικός χώρος εργασίας",
    },
    sv: {
      newWorkspaceAccess: "Åtkomst till ny arbetsyta",
      workspaceLabel: "Kontrollerad agronomisk arbetsyta",
      heroTitle: "Skapa ett konto för fältövervakning och beslutsstöd.",
      heroDescription: "Efter registreringen får du tillgång till AEGRIS-arbetsytan. Om du kom via en inbjudan kopplas ditt konto till rätt organisation efter bekräftelse.",
      monitoringLabel: "Övervakning",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Fältstatus via satellit",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Poäng, prioritet och rekommendation",
      organizationLabel: "Organisation",
      organizationValue: "Teamåtkomst",
      organizationDetail: "Roller, medlemmar och inbjudningar",
      footerLeft: "Säker registrering · organisationsåtkomst · agronomiskt arbetsflöde",
      accountRegistration: "Kontoregistrering",
      title: "Registrering",
      invitedTitle: "Registrering av inbjuden medlem",
      description: "Skapa ett konto för åtkomst till AEGRIS-arbetsytan.",
      invitedDescription: "Skapa ett konto och fortsätt för att acceptera organisationsinbjudan.",
      invitationNotice: "Du har bjudits in till en organisation i AEGRIS. När kontot har skapats och bekräftats behandlas inbjudan automatiskt.",
      email: "E-post",
      emailPlaceholder: "du@exempel.se",
      password: "Lösenord",
      passwordPlaceholder: "Minst 8 tecken",
      confirmPassword: "Bekräfta lösenord",
      confirmPasswordPlaceholder: "Upprepa lösenord",
      passwordTooShort: "Lösenordet måste innehålla minst 8 tecken.",
      passwordsMismatch: "Lösenorden stämmer inte överens.",
      createFailed: "Kontot kunde inte skapas.",
      accountCreatedSignedIn: "Kontot har skapats och du är inloggad.",
      accountCreatedConfirm: "Kontot har skapats. Kontrollera din e-post och bekräfta registreringen.",
      accountCreatedInvite: "Kontot har skapats. Kontrollera din e-post och bekräfta registreringen. Därefter kan du acceptera organisationsinbjudan.",
      registering: "Registrerar...",
      register: "Registrera",
      createAndContinue: "Skapa konto och fortsätt",
      alreadyAccount: "Har du redan ett konto?",
      signIn: "Logga in",
      loading: "Laddar registrering...",
      footerRight: "AEGRIS · Kontrollerad agronomisk arbetsyta",
    },
    da: {
      newWorkspaceAccess: "Adgang til nyt arbejdsområde",
      workspaceLabel: "Kontrolleret agronomisk arbejdsområde",
      heroTitle: "Opret en konto til markovervågning og beslutningsstøtte.",
      heroDescription: "Efter registrering får du adgang til AEGRIS-arbejdsområdet. Hvis du kom via en invitation, knyttes din konto til den relevante organisation efter bekræftelse.",
      monitoringLabel: "Overvågning",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Markstatus via satellit",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Score, prioritet og anbefaling",
      organizationLabel: "Organisation",
      organizationValue: "Teamadgang",
      organizationDetail: "Roller, medlemmer og invitationer",
      footerLeft: "Sikker registrering · organisationsadgang · agronomisk workflow",
      accountRegistration: "Kontoregistrering",
      title: "Registrering",
      invitedTitle: "Registrering af inviteret medlem",
      description: "Opret en konto for at få adgang til AEGRIS-arbejdsområdet.",
      invitedDescription: "Opret en konto og fortsæt for at acceptere organisationsinvitationen.",
      invitationNotice: "Du er blevet inviteret til en organisation i AEGRIS. Når kontoen er oprettet og bekræftet, behandles invitationen automatisk.",
      email: "E-mail",
      emailPlaceholder: "dig@eksempel.dk",
      password: "Adgangskode",
      passwordPlaceholder: "Mindst 8 tegn",
      confirmPassword: "Bekræft adgangskode",
      confirmPasswordPlaceholder: "Gentag adgangskode",
      passwordTooShort: "Adgangskoden skal indeholde mindst 8 tegn.",
      passwordsMismatch: "Adgangskoderne er ikke ens.",
      createFailed: "Kontoen kunne ikke oprettes.",
      accountCreatedSignedIn: "Kontoen er oprettet, og du er logget ind.",
      accountCreatedConfirm: "Kontoen er oprettet. Tjek din e-mail og bekræft registreringen.",
      accountCreatedInvite: "Kontoen er oprettet. Tjek din e-mail og bekræft registreringen. Derefter kan du acceptere organisationsinvitationen.",
      registering: "Registrerer...",
      register: "Registrer",
      createAndContinue: "Opret konto og fortsæt",
      alreadyAccount: "Har du allerede en konto?",
      signIn: "Log ind",
      loading: "Indlæser registrering...",
      footerRight: "AEGRIS · Kontrolleret agronomisk arbejdsområde",
    },
    no: {
      newWorkspaceAccess: "Tilgang til nytt arbeidsområde",
      workspaceLabel: "Kontrollert agronomisk arbeidsområde",
      heroTitle: "Opprett en konto for feltovervåking og beslutningsstøtte.",
      heroDescription: "Etter registrering får du tilgang til AEGRIS-arbeidsområdet. Hvis du kom via en invitasjon, knyttes kontoen til riktig organisasjon etter bekreftelse.",
      monitoringLabel: "Overvåking",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Feltstatus via satellitt",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Poeng, prioritet og anbefaling",
      organizationLabel: "Organisasjon",
      organizationValue: "Teamtilgang",
      organizationDetail: "Roller, medlemmer og invitasjoner",
      footerLeft: "Sikker registrering · organisasjonstilgang · agronomisk arbeidsflyt",
      accountRegistration: "Kontoregistrering",
      title: "Registrering",
      invitedTitle: "Registrering av invitert medlem",
      description: "Opprett en konto for tilgang til AEGRIS-arbeidsområdet.",
      invitedDescription: "Opprett en konto og fortsett for å godta organisasjonsinvitasjonen.",
      invitationNotice: "Du er invitert til en organisasjon i AEGRIS. Når kontoen er opprettet og bekreftet, behandles invitasjonen automatisk.",
      email: "E-post",
      emailPlaceholder: "deg@eksempel.no",
      password: "Passord",
      passwordPlaceholder: "Minst 8 tegn",
      confirmPassword: "Bekreft passord",
      confirmPasswordPlaceholder: "Gjenta passord",
      passwordTooShort: "Passordet må inneholde minst 8 tegn.",
      passwordsMismatch: "Passordene er ikke like.",
      createFailed: "Kontoen kunne ikke opprettes.",
      accountCreatedSignedIn: "Kontoen er opprettet, og du er logget inn.",
      accountCreatedConfirm: "Kontoen er opprettet. Sjekk e-posten og bekreft registreringen.",
      accountCreatedInvite: "Kontoen er opprettet. Sjekk e-posten og bekreft registreringen. Deretter kan du godta organisasjonsinvitasjonen.",
      registering: "Registrerer...",
      register: "Registrer",
      createAndContinue: "Opprett konto og fortsett",
      alreadyAccount: "Har du allerede en konto?",
      signIn: "Logg inn",
      loading: "Laster registrering...",
      footerRight: "AEGRIS · Kontrollert agronomisk arbeidsområde",
    },
    fi: {
      newWorkspaceAccess: "Pääsy uuteen työtilaan",
      workspaceLabel: "Hallittu agronominen työtila",
      heroTitle: "Luo tili peltojen seurantaa ja päätöksenteon tukea varten.",
      heroDescription: "Rekisteröitymisen jälkeen saat pääsyn AEGRIS-työtilaan. Jos tulit kutsun kautta, tilisi liitetään vahvistuksen jälkeen oikeaan organisaatioon.",
      monitoringLabel: "Seuranta",
      monitoringValue: "Sentinel-2",
      monitoringDetail: "Peltojen tila satelliitista",
      decisionLabel: "Decision Engine",
      decisionValue: "AEGRIS",
      decisionDetail: "Pisteet, prioriteetti ja suositus",
      organizationLabel: "Organisaatio",
      organizationValue: "Tiimin käyttöoikeus",
      organizationDetail: "Roolit, jäsenet ja kutsut",
      footerLeft: "Turvallinen rekisteröinti · organisaation käyttöoikeus · agronominen työnkulku",
      accountRegistration: "Tilin rekisteröinti",
      title: "Rekisteröinti",
      invitedTitle: "Kutsutun jäsenen rekisteröinti",
      description: "Luo tili päästäksesi AEGRIS-työtilaan.",
      invitedDescription: "Luo tili ja jatka organisaatiokutsun hyväksymiseen.",
      invitationNotice: "Sinut on kutsuttu AEGRIS-organisaatioon. Kun tili on luotu ja vahvistettu, kutsu käsitellään automaattisesti.",
      email: "Sähköposti",
      emailPlaceholder: "sinä@esimerkki.fi",
      password: "Salasana",
      passwordPlaceholder: "Vähintään 8 merkkiä",
      confirmPassword: "Vahvista salasana",
      confirmPasswordPlaceholder: "Toista salasana",
      passwordTooShort: "Salasanassa on oltava vähintään 8 merkkiä.",
      passwordsMismatch: "Salasanat eivät täsmää.",
      createFailed: "Tiliä ei voitu luoda.",
      accountCreatedSignedIn: "Tili on luotu ja olet kirjautunut sisään.",
      accountCreatedConfirm: "Tili on luotu. Tarkista sähköpostisi ja vahvista rekisteröinti.",
      accountCreatedInvite: "Tili on luotu. Tarkista sähköpostisi ja vahvista rekisteröinti. Sen jälkeen voit hyväksyä organisaatiokutsun.",
      registering: "Rekisteröidään...",
      register: "Rekisteröidy",
      createAndContinue: "Luo tili ja jatka",
      alreadyAccount: "Onko sinulla jo tili?",
      signIn: "Kirjaudu sisään",
      loading: "Ladataan rekisteröintiä...",
      footerRight: "AEGRIS · Hallittu agronominen työtila",
    }
  } as const;

  return copies[language as keyof typeof copies] ?? copies.en;
}
function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const copy = getRegisterCopy(language);

  const inviteToken = searchParams.get("invite")?.trim() ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    if (password.length < 8) {
      setErrorMessage(copy.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(copy.passwordsMismatch);
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const nextPath = inviteToken
        ? `/auth/accept-organization-invite?token=${encodeURIComponent(
            inviteToken
          )}`
        : "/dashboard";

      const callbackUrl =
        `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          nextPath
        )}`;

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: callbackUrl,
        },
      });

      if (error) {
        console.error("REGISTER ERROR:", error);
        setErrorMessage(copy.createFailed);
        return;
      }

      if (data.session) {
        if (inviteToken) {
          router.replace(nextPath);
          router.refresh();
          return;
        }

        setSuccessMessage(copy.accountCreatedSignedIn);

        router.replace("/dashboard");
        router.refresh();
        return;
      }

      if (inviteToken) {
        setSuccessMessage(copy.accountCreatedInvite);
      } else {
        setSuccessMessage(copy.accountCreatedConfirm);
      }
    } catch (error) {
      console.error("REGISTER CLIENT ERROR:", error);
      setErrorMessage(copy.createFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#05090d] text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.15fr)_minmax(440px,0.85fr)]">
        <section className="relative hidden overflow-hidden border-r border-white/[0.06] bg-[#070c11] lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(103,232,249,0.08),transparent_28%),radial-gradient(circle_at_78%_74%,rgba(34,211,238,0.05),transparent_24%)]" />

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
              {copy.newWorkspaceAccess}
            </div>
          </div>

          <div className="relative z-10 flex flex-1 items-center px-10 py-12 xl:px-16">
            <div className="max-w-2xl">
              <div className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-300">
                {copy.workspaceLabel}
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
                  label={copy.organizationLabel}
                  value={copy.organizationValue}
                  detail={copy.organizationDetail}
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

          <div className="w-full max-w-[480px]">
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
                {copy.accountRegistration}
              </div>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">
                {inviteToken ? copy.invitedTitle : copy.title}
              </h2>

              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                {inviteToken ? copy.invitedDescription : copy.description}
              </p>

              {inviteToken && (
                <div className="mt-5 rounded-xl border border-cyan-300/15 bg-cyan-300/[0.04] px-4 py-3 text-[10px] leading-5 text-cyan-100">
                  {copy.invitationNotice}
                </div>
              )}

              <form onSubmit={register} className="mt-7">
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

                <label
                  htmlFor="password"
                  className="mt-5 block text-[9px] font-black uppercase tracking-[0.12em] text-slate-500"
                >
                  {copy.password}
                </label>

                <input
                  id="password"
                  type="password"
                  placeholder={copy.passwordPlaceholder}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#071017] px-4 py-3 text-[11px] text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <label
                  htmlFor="confirmPassword"
                  className="mt-5 block text-[9px] font-black uppercase tracking-[0.12em] text-slate-500"
                >
                  {copy.confirmPassword}
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  placeholder={copy.confirmPasswordPlaceholder}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  disabled={loading}
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#071017] px-4 py-3 text-[11px] text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-50"
                />

                {errorMessage && (
                  <div className="mt-4 rounded-xl border border-red-400/15 bg-red-400/[0.04] px-4 py-3 text-[10px] leading-5 text-red-300">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="mt-4 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.04] px-4 py-3 text-[10px] leading-5 text-emerald-300">
                    {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-cyan-300 px-5 py-3 text-[10px] font-black text-[#061015] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? copy.registering
                    : inviteToken
                      ? copy.createAndContinue
                      : copy.register}
                </button>
              </form>

              <div className="mt-6 border-t border-white/[0.06] pt-5 text-center text-[10px] text-slate-600">
                {copy.alreadyAccount}{" "}
                <Link
                  href="/login"
                  className="font-bold text-cyan-300 transition hover:text-cyan-200"
                >
                  {copy.signIn}
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

function RegisterLoadingFallback() {
  const { language } = useLanguage();
  const copy = getRegisterCopy(language);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05090d] px-5 text-slate-100">
      <div className="w-full max-w-[460px] rounded-[26px] border border-white/[0.07] bg-[#0a1016] p-8 text-center shadow-2xl shadow-black/20">
        <div className="text-lg font-black tracking-[0.2em] text-white">
          AEGRIS
        </div>
        <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.22em] text-cyan-300/70">
          Agronomic Intelligence
        </div>
        <p className="mt-6 text-[10px] text-slate-500">
          {copy.loading}
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterLoadingFallback />}>
      <RegisterContent />
    </Suspense>
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
