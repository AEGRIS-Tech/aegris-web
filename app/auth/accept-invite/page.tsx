"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useLanguage } from "../../context/LanguageContext";

function getAcceptInviteCopy(language: string) {
  const copies = {
    en: {
      invalidOrExpired: "The invitation is invalid or has expired.",
      verificationFailed: "The invitation could not be verified. Please open the activation link again.",
      inviteVerificationFailed: "The invitation could not be verified.",
      demoOnly: "This page is only for activating a DEMO account.",
      demoInviteVerificationFailed: "The DEMO invitation could not be verified.",
      passwordTooShort: "Password must contain at least 8 characters.",
      passwordsMismatch: "Passwords do not match.",
      loginVerificationFailed: "The invitation sign-in could not be verified. Please open the activation link again.",
      demoAccountVerificationFailed: "The DEMO account could not be verified.",
      notAuthorized: "This account is not authorized to complete DEMO activation.",
      passwordSaveFailed: "The password could not be set.",
      completionFailed: "The DEMO account could not be completed.",
      checking: "Verifying DEMO account...",
      title: "Complete DEMO account",
      description: "Set a password to access your AEGRIS DEMO account.",
      newPassword: "New password",
      passwordPlaceholder: "At least 8 characters",
      confirmPassword: "Confirm password",
      confirmPlaceholder: "Repeat password",
      saving: "Setting up account...",
      complete: "Complete DEMO account",
    },
    cs: {
      invalidOrExpired: "Pozvánka je neplatná nebo již vypršela.",
      verificationFailed: "Pozvánku se nepodařilo ověřit. Otevřete prosím aktivační odkaz znovu.",
      inviteVerificationFailed: "Pozvánku se nepodařilo ověřit.",
      demoOnly: "Tato stránka je určena pouze pro aktivaci DEMO účtu.",
      demoInviteVerificationFailed: "Nepodařilo se ověřit DEMO pozvánku.",
      passwordTooShort: "Heslo musí mít alespoň 8 znaků.",
      passwordsMismatch: "Hesla se neshodují.",
      loginVerificationFailed: "Přihlášení z pozvánky se nepodařilo ověřit. Otevřete prosím aktivační odkaz znovu.",
      demoAccountVerificationFailed: "DEMO účet se nepodařilo ověřit.",
      notAuthorized: "Tento účet není oprávněn dokončit DEMO aktivaci.",
      passwordSaveFailed: "Heslo se nepodařilo nastavit.",
      completionFailed: "Nepodařilo se dokončit DEMO účet.",
      checking: "Ověřuji DEMO účet...",
      title: "Dokončení DEMO účtu",
      description: "Nastavte si heslo pro přístup do vašeho AEGRIS DEMO účtu.",
      newPassword: "Nové heslo",
      passwordPlaceholder: "Minimálně 8 znaků",
      confirmPassword: "Potvrzení hesla",
      confirmPlaceholder: "Zopakujte heslo",
      saving: "Nastavuji účet...",
      complete: "Dokončit DEMO účet",
    },
    sk: {
      invalidOrExpired: "Pozvánka je neplatná alebo už vypršala.",
      verificationFailed: "Pozvánku sa nepodarilo overiť. Otvorte aktivačný odkaz znova.",
      inviteVerificationFailed: "Pozvánku sa nepodarilo overiť.",
      demoOnly: "Táto stránka je určená iba na aktiváciu DEMO účtu.",
      demoInviteVerificationFailed: "DEMO pozvánku sa nepodarilo overiť.",
      passwordTooShort: "Heslo musí obsahovať aspoň 8 znakov.",
      passwordsMismatch: "Heslá sa nezhodujú.",
      loginVerificationFailed: "Prihlásenie z pozvánky sa nepodarilo overiť. Otvorte aktivačný odkaz znova.",
      demoAccountVerificationFailed: "DEMO účet sa nepodarilo overiť.",
      notAuthorized: "Tento účet nemá oprávnenie dokončiť DEMO aktiváciu.",
      passwordSaveFailed: "Heslo sa nepodarilo nastaviť.",
      completionFailed: "DEMO účet sa nepodarilo dokončiť.",
      checking: "Overujem DEMO účet...",
      title: "Dokončenie DEMO účtu",
      description: "Nastavte si heslo na prístup k vášmu AEGRIS DEMO účtu.",
      newPassword: "Nové heslo",
      passwordPlaceholder: "Minimálne 8 znakov",
      confirmPassword: "Potvrdenie hesla",
      confirmPlaceholder: "Zopakujte heslo",
      saving: "Nastavujem účet...",
      complete: "Dokončiť DEMO účet",
    },
    de: {
      invalidOrExpired: "Die Einladung ist ungültig oder abgelaufen.",
      verificationFailed: "Die Einladung konnte nicht überprüft werden. Bitte öffnen Sie den Aktivierungslink erneut.",
      inviteVerificationFailed: "Die Einladung konnte nicht überprüft werden.",
      demoOnly: "Diese Seite dient ausschließlich zur Aktivierung eines DEMO-Kontos.",
      demoInviteVerificationFailed: "Die DEMO-Einladung konnte nicht überprüft werden.",
      passwordTooShort: "Das Passwort muss mindestens 8 Zeichen enthalten.",
      passwordsMismatch: "Die Passwörter stimmen nicht überein.",
      loginVerificationFailed: "Die Anmeldung über die Einladung konnte nicht überprüft werden. Bitte öffnen Sie den Aktivierungslink erneut.",
      demoAccountVerificationFailed: "Das DEMO-Konto konnte nicht überprüft werden.",
      notAuthorized: "Dieses Konto ist nicht berechtigt, die DEMO-Aktivierung abzuschließen.",
      passwordSaveFailed: "Das Passwort konnte nicht festgelegt werden.",
      completionFailed: "Das DEMO-Konto konnte nicht fertig eingerichtet werden.",
      checking: "DEMO-Konto wird überprüft...",
      title: "DEMO-Konto fertig einrichten",
      description: "Legen Sie ein Passwort für den Zugriff auf Ihr AEGRIS DEMO-Konto fest.",
      newPassword: "Neues Passwort",
      passwordPlaceholder: "Mindestens 8 Zeichen",
      confirmPassword: "Passwort bestätigen",
      confirmPlaceholder: "Passwort wiederholen",
      saving: "Konto wird eingerichtet...",
      complete: "DEMO-Konto fertig einrichten",
    },
    pl: {
      invalidOrExpired: "Zaproszenie jest nieprawidłowe lub wygasło.",
      verificationFailed: "Nie udało się zweryfikować zaproszenia. Otwórz ponownie link aktywacyjny.",
      inviteVerificationFailed: "Nie udało się zweryfikować zaproszenia.",
      demoOnly: "Ta strona służy wyłącznie do aktywacji konta DEMO.",
      demoInviteVerificationFailed: "Nie udało się zweryfikować zaproszenia DEMO.",
      passwordTooShort: "Hasło musi zawierać co najmniej 8 znaków.",
      passwordsMismatch: "Hasła nie są zgodne.",
      loginVerificationFailed: "Nie udało się zweryfikować logowania z zaproszenia. Otwórz ponownie link aktywacyjny.",
      demoAccountVerificationFailed: "Nie udało się zweryfikować konta DEMO.",
      notAuthorized: "To konto nie ma uprawnień do ukończenia aktywacji DEMO.",
      passwordSaveFailed: "Nie udało się ustawić hasła.",
      completionFailed: "Nie udało się ukończyć konfiguracji konta DEMO.",
      checking: "Weryfikowanie konta DEMO...",
      title: "Dokończ konfigurację konta DEMO",
      description: "Ustaw hasło, aby uzyskać dostęp do konta AEGRIS DEMO.",
      newPassword: "Nowe hasło",
      passwordPlaceholder: "Co najmniej 8 znaków",
      confirmPassword: "Potwierdź hasło",
      confirmPlaceholder: "Powtórz hasło",
      saving: "Konfigurowanie konta...",
      complete: "Dokończ konto DEMO",
    },
    fr: {
      invalidOrExpired: "L'invitation est invalide ou a expiré.",
      verificationFailed: "L'invitation n'a pas pu être vérifiée. Veuillez rouvrir le lien d'activation.",
      inviteVerificationFailed: "L'invitation n'a pas pu être vérifiée.",
      demoOnly: "Cette page est réservée à l'activation d'un compte DEMO.",
      demoInviteVerificationFailed: "L'invitation DEMO n'a pas pu être vérifiée.",
      passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères.",
      passwordsMismatch: "Les mots de passe ne correspondent pas.",
      loginVerificationFailed: "La connexion via l'invitation n'a pas pu être vérifiée. Veuillez rouvrir le lien d'activation.",
      demoAccountVerificationFailed: "Le compte DEMO n'a pas pu être vérifié.",
      notAuthorized: "Ce compte n'est pas autorisé à terminer l'activation DEMO.",
      passwordSaveFailed: "Le mot de passe n'a pas pu être défini.",
      completionFailed: "La configuration du compte DEMO n'a pas pu être terminée.",
      checking: "Vérification du compte DEMO...",
      title: "Finaliser le compte DEMO",
      description: "Définissez un mot de passe pour accéder à votre compte AEGRIS DEMO.",
      newPassword: "Nouveau mot de passe",
      passwordPlaceholder: "Au moins 8 caractères",
      confirmPassword: "Confirmer le mot de passe",
      confirmPlaceholder: "Répéter le mot de passe",
      saving: "Configuration du compte...",
      complete: "Finaliser le compte DEMO",
    },
    es: {
      invalidOrExpired: "La invitación no es válida o ha caducado.",
      verificationFailed: "No se pudo verificar la invitación. Vuelva a abrir el enlace de activación.",
      inviteVerificationFailed: "No se pudo verificar la invitación.",
      demoOnly: "Esta página es solo para activar una cuenta DEMO.",
      demoInviteVerificationFailed: "No se pudo verificar la invitación DEMO.",
      passwordTooShort: "La contraseña debe contener al menos 8 caracteres.",
      passwordsMismatch: "Las contraseñas no coinciden.",
      loginVerificationFailed: "No se pudo verificar el inicio de sesión desde la invitación. Vuelva a abrir el enlace de activación.",
      demoAccountVerificationFailed: "No se pudo verificar la cuenta DEMO.",
      notAuthorized: "Esta cuenta no está autorizada para completar la activación DEMO.",
      passwordSaveFailed: "No se pudo establecer la contraseña.",
      completionFailed: "No se pudo completar la cuenta DEMO.",
      checking: "Verificando cuenta DEMO...",
      title: "Completar cuenta DEMO",
      description: "Establezca una contraseña para acceder a su cuenta AEGRIS DEMO.",
      newPassword: "Nueva contraseña",
      passwordPlaceholder: "Al menos 8 caracteres",
      confirmPassword: "Confirmar contraseña",
      confirmPlaceholder: "Repetir contraseña",
      saving: "Configurando cuenta...",
      complete: "Completar cuenta DEMO",
    },
    it: {
      invalidOrExpired: "L'invito non è valido o è scaduto.",
      verificationFailed: "Non è stato possibile verificare l'invito. Apri nuovamente il link di attivazione.",
      inviteVerificationFailed: "Non è stato possibile verificare l'invito.",
      demoOnly: "Questa pagina è riservata all'attivazione di un account DEMO.",
      demoInviteVerificationFailed: "Non è stato possibile verificare l'invito DEMO.",
      passwordTooShort: "La password deve contenere almeno 8 caratteri.",
      passwordsMismatch: "Le password non corrispondono.",
      loginVerificationFailed: "Non è stato possibile verificare l'accesso tramite invito. Apri nuovamente il link di attivazione.",
      demoAccountVerificationFailed: "Non è stato possibile verificare l'account DEMO.",
      notAuthorized: "Questo account non è autorizzato a completare l'attivazione DEMO.",
      passwordSaveFailed: "Non è stato possibile impostare la password.",
      completionFailed: "Non è stato possibile completare l'account DEMO.",
      checking: "Verifica dell'account DEMO...",
      title: "Completa account DEMO",
      description: "Imposta una password per accedere al tuo account AEGRIS DEMO.",
      newPassword: "Nuova password",
      passwordPlaceholder: "Almeno 8 caratteri",
      confirmPassword: "Conferma password",
      confirmPlaceholder: "Ripeti password",
      saving: "Configurazione account...",
      complete: "Completa account DEMO",
    },
    nl: {
      invalidOrExpired: "De uitnodiging is ongeldig of verlopen.",
      verificationFailed: "De uitnodiging kon niet worden geverifieerd. Open de activeringslink opnieuw.",
      inviteVerificationFailed: "De uitnodiging kon niet worden geverifieerd.",
      demoOnly: "Deze pagina is uitsluitend bedoeld voor het activeren van een DEMO-account.",
      demoInviteVerificationFailed: "De DEMO-uitnodiging kon niet worden geverifieerd.",
      passwordTooShort: "Het wachtwoord moet minimaal 8 tekens bevatten.",
      passwordsMismatch: "De wachtwoorden komen niet overeen.",
      loginVerificationFailed: "De aanmelding via de uitnodiging kon niet worden geverifieerd. Open de activeringslink opnieuw.",
      demoAccountVerificationFailed: "Het DEMO-account kon niet worden geverifieerd.",
      notAuthorized: "Dit account is niet gemachtigd om de DEMO-activering te voltooien.",
      passwordSaveFailed: "Het wachtwoord kon niet worden ingesteld.",
      completionFailed: "Het DEMO-account kon niet worden voltooid.",
      checking: "DEMO-account verifiëren...",
      title: "DEMO-account voltooien",
      description: "Stel een wachtwoord in voor toegang tot uw AEGRIS DEMO-account.",
      newPassword: "Nieuw wachtwoord",
      passwordPlaceholder: "Minimaal 8 tekens",
      confirmPassword: "Wachtwoord bevestigen",
      confirmPlaceholder: "Wachtwoord herhalen",
      saving: "Account instellen...",
      complete: "DEMO-account voltooien",
    },
    pt: {
      invalidOrExpired: "O convite é inválido ou expirou.",
      verificationFailed: "Não foi possível verificar o convite. Abra novamente o link de ativação.",
      inviteVerificationFailed: "Não foi possível verificar o convite.",
      demoOnly: "Esta página destina-se apenas à ativação de uma conta DEMO.",
      demoInviteVerificationFailed: "Não foi possível verificar o convite DEMO.",
      passwordTooShort: "A palavra-passe deve ter pelo menos 8 caracteres.",
      passwordsMismatch: "As palavras-passe não coincidem.",
      loginVerificationFailed: "Não foi possível verificar o início de sessão através do convite. Abra novamente o link de ativação.",
      demoAccountVerificationFailed: "Não foi possível verificar a conta DEMO.",
      notAuthorized: "Esta conta não está autorizada a concluir a ativação DEMO.",
      passwordSaveFailed: "Não foi possível definir a palavra-passe.",
      completionFailed: "Não foi possível concluir a conta DEMO.",
      checking: "A verificar conta DEMO...",
      title: "Concluir conta DEMO",
      description: "Defina uma palavra-passe para aceder à sua conta AEGRIS DEMO.",
      newPassword: "Nova palavra-passe",
      passwordPlaceholder: "Pelo menos 8 caracteres",
      confirmPassword: "Confirmar palavra-passe",
      confirmPlaceholder: "Repetir palavra-passe",
      saving: "A configurar conta...",
      complete: "Concluir conta DEMO",
    },
    ro: {
      invalidOrExpired: "Invitația este invalidă sau a expirat.",
      verificationFailed: "Invitația nu a putut fi verificată. Deschideți din nou linkul de activare.",
      inviteVerificationFailed: "Invitația nu a putut fi verificată.",
      demoOnly: "Această pagină este destinată exclusiv activării unui cont DEMO.",
      demoInviteVerificationFailed: "Invitația DEMO nu a putut fi verificată.",
      passwordTooShort: "Parola trebuie să conțină cel puțin 8 caractere.",
      passwordsMismatch: "Parolele nu coincid.",
      loginVerificationFailed: "Autentificarea din invitație nu a putut fi verificată. Deschideți din nou linkul de activare.",
      demoAccountVerificationFailed: "Contul DEMO nu a putut fi verificat.",
      notAuthorized: "Acest cont nu este autorizat să finalizeze activarea DEMO.",
      passwordSaveFailed: "Parola nu a putut fi setată.",
      completionFailed: "Contul DEMO nu a putut fi finalizat.",
      checking: "Se verifică contul DEMO...",
      title: "Finalizați contul DEMO",
      description: "Setați o parolă pentru a accesa contul dvs. AEGRIS DEMO.",
      newPassword: "Parolă nouă",
      passwordPlaceholder: "Cel puțin 8 caractere",
      confirmPassword: "Confirmă parola",
      confirmPlaceholder: "Repetă parola",
      saving: "Se configurează contul...",
      complete: "Finalizează contul DEMO",
    },
    hu: {
      invalidOrExpired: "A meghívás érvénytelen vagy lejárt.",
      verificationFailed: "A meghívást nem sikerült ellenőrizni. Nyissa meg újra az aktiválási linket.",
      inviteVerificationFailed: "A meghívást nem sikerült ellenőrizni.",
      demoOnly: "Ez az oldal kizárólag DEMO-fiók aktiválására szolgál.",
      demoInviteVerificationFailed: "A DEMO-meghívást nem sikerült ellenőrizni.",
      passwordTooShort: "A jelszónak legalább 8 karakterből kell állnia.",
      passwordsMismatch: "A jelszavak nem egyeznek.",
      loginVerificationFailed: "A meghívásból indított bejelentkezést nem sikerült ellenőrizni. Nyissa meg újra az aktiválási linket.",
      demoAccountVerificationFailed: "A DEMO-fiókot nem sikerült ellenőrizni.",
      notAuthorized: "Ez a fiók nem jogosult a DEMO-aktiválás befejezésére.",
      passwordSaveFailed: "A jelszót nem sikerült beállítani.",
      completionFailed: "A DEMO-fiókot nem sikerült befejezni.",
      checking: "DEMO-fiók ellenőrzése...",
      title: "DEMO-fiók befejezése",
      description: "Állítson be jelszót az AEGRIS DEMO-fiók eléréséhez.",
      newPassword: "Új jelszó",
      passwordPlaceholder: "Legalább 8 karakter",
      confirmPassword: "Jelszó megerősítése",
      confirmPlaceholder: "Jelszó ismétlése",
      saving: "Fiók beállítása...",
      complete: "DEMO-fiók befejezése",
    },
    uk: {
      invalidOrExpired: "Запрошення недійсне або термін його дії минув.",
      verificationFailed: "Не вдалося перевірити запрошення. Відкрийте посилання активації ще раз.",
      inviteVerificationFailed: "Не вдалося перевірити запрошення.",
      demoOnly: "Ця сторінка призначена лише для активації DEMO-облікового запису.",
      demoInviteVerificationFailed: "Не вдалося перевірити DEMO-запрошення.",
      passwordTooShort: "Пароль має містити щонайменше 8 символів.",
      passwordsMismatch: "Паролі не збігаються.",
      loginVerificationFailed: "Не вдалося перевірити вхід за запрошенням. Відкрийте посилання активації ще раз.",
      demoAccountVerificationFailed: "Не вдалося перевірити DEMO-обліковий запис.",
      notAuthorized: "Цей обліковий запис не має права завершити DEMO-активацію.",
      passwordSaveFailed: "Не вдалося встановити пароль.",
      completionFailed: "Не вдалося завершити налаштування DEMO-облікового запису.",
      checking: "Перевірка DEMO-облікового запису...",
      title: "Завершення DEMO-облікового запису",
      description: "Встановіть пароль для доступу до вашого AEGRIS DEMO-облікового запису.",
      newPassword: "Новий пароль",
      passwordPlaceholder: "Щонайменше 8 символів",
      confirmPassword: "Підтвердьте пароль",
      confirmPlaceholder: "Повторіть пароль",
      saving: "Налаштування облікового запису...",
      complete: "Завершити DEMO-обліковий запис",
    },
    bg: {
      invalidOrExpired: "Поканата е невалидна или е изтекла.",
      verificationFailed: "Поканата не можа да бъде потвърдена. Отворете отново линка за активиране.",
      inviteVerificationFailed: "Поканата не можа да бъде потвърдена.",
      demoOnly: "Тази страница е само за активиране на DEMO акаунт.",
      demoInviteVerificationFailed: "DEMO поканата не можа да бъде потвърдена.",
      passwordTooShort: "Паролата трябва да съдържа поне 8 знака.",
      passwordsMismatch: "Паролите не съвпадат.",
      loginVerificationFailed: "Входът чрез поканата не можа да бъде потвърден. Отворете отново линка за активиране.",
      demoAccountVerificationFailed: "DEMO акаунтът не можа да бъде потвърден.",
      notAuthorized: "Този акаунт няма право да завърши DEMO активирането.",
      passwordSaveFailed: "Паролата не можа да бъде зададена.",
      completionFailed: "DEMO акаунтът не можа да бъде завършен.",
      checking: "Проверка на DEMO акаунта...",
      title: "Завършване на DEMO акаунта",
      description: "Задайте парола за достъп до вашия AEGRIS DEMO акаунт.",
      newPassword: "Нова парола",
      passwordPlaceholder: "Поне 8 знака",
      confirmPassword: "Потвърдете паролата",
      confirmPlaceholder: "Повторете паролата",
      saving: "Настройване на акаунта...",
      complete: "Завърши DEMO акаунта",
    },
    hr: {
      invalidOrExpired: "Pozivnica nije valjana ili je istekla.",
      verificationFailed: "Pozivnicu nije bilo moguće provjeriti. Ponovno otvorite aktivacijsku poveznicu.",
      inviteVerificationFailed: "Pozivnicu nije bilo moguće provjeriti.",
      demoOnly: "Ova stranica služi samo za aktivaciju DEMO računa.",
      demoInviteVerificationFailed: "DEMO pozivnicu nije bilo moguće provjeriti.",
      passwordTooShort: "Lozinka mora sadržavati najmanje 8 znakova.",
      passwordsMismatch: "Lozinke se ne podudaraju.",
      loginVerificationFailed: "Prijavu putem pozivnice nije bilo moguće provjeriti. Ponovno otvorite aktivacijsku poveznicu.",
      demoAccountVerificationFailed: "DEMO račun nije bilo moguće provjeriti.",
      notAuthorized: "Ovaj račun nije ovlašten dovršiti DEMO aktivaciju.",
      passwordSaveFailed: "Lozinku nije bilo moguće postaviti.",
      completionFailed: "DEMO račun nije bilo moguće dovršiti.",
      checking: "Provjera DEMO računa...",
      title: "Dovršite DEMO račun",
      description: "Postavite lozinku za pristup svom AEGRIS DEMO računu.",
      newPassword: "Nova lozinka",
      passwordPlaceholder: "Najmanje 8 znakova",
      confirmPassword: "Potvrdi lozinku",
      confirmPlaceholder: "Ponovite lozinku",
      saving: "Postavljanje računa...",
      complete: "Dovrši DEMO račun",
    },
    sl: {
      invalidOrExpired: "Povabilo ni veljavno ali je poteklo.",
      verificationFailed: "Povabila ni bilo mogoče preveriti. Znova odprite aktivacijsko povezavo.",
      inviteVerificationFailed: "Povabila ni bilo mogoče preveriti.",
      demoOnly: "Ta stran je namenjena samo aktivaciji DEMO računa.",
      demoInviteVerificationFailed: "DEMO povabila ni bilo mogoče preveriti.",
      passwordTooShort: "Geslo mora vsebovati najmanj 8 znakov.",
      passwordsMismatch: "Gesli se ne ujemata.",
      loginVerificationFailed: "Prijave prek povabila ni bilo mogoče preveriti. Znova odprite aktivacijsko povezavo.",
      demoAccountVerificationFailed: "DEMO računa ni bilo mogoče preveriti.",
      notAuthorized: "Ta račun ni pooblaščen za dokončanje DEMO aktivacije.",
      passwordSaveFailed: "Gesla ni bilo mogoče nastaviti.",
      completionFailed: "DEMO računa ni bilo mogoče dokončati.",
      checking: "Preverjanje DEMO računa...",
      title: "Dokončajte DEMO račun",
      description: "Nastavite geslo za dostop do svojega AEGRIS DEMO računa.",
      newPassword: "Novo geslo",
      passwordPlaceholder: "Najmanj 8 znakov",
      confirmPassword: "Potrdite geslo",
      confirmPlaceholder: "Ponovite geslo",
      saving: "Nastavljanje računa...",
      complete: "Dokončaj DEMO račun",
    },
    lt: {
      invalidOrExpired: "Kvietimas netinkamas arba jo galiojimas baigėsi.",
      verificationFailed: "Kvietimo patikrinti nepavyko. Dar kartą atidarykite aktyvinimo nuorodą.",
      inviteVerificationFailed: "Kvietimo patikrinti nepavyko.",
      demoOnly: "Šis puslapis skirtas tik DEMO paskyrai aktyvinti.",
      demoInviteVerificationFailed: "DEMO kvietimo patikrinti nepavyko.",
      passwordTooShort: "Slaptažodį turi sudaryti bent 8 simboliai.",
      passwordsMismatch: "Slaptažodžiai nesutampa.",
      loginVerificationFailed: "Prisijungimo per kvietimą patikrinti nepavyko. Dar kartą atidarykite aktyvinimo nuorodą.",
      demoAccountVerificationFailed: "DEMO paskyros patikrinti nepavyko.",
      notAuthorized: "Šiai paskyrai neleidžiama užbaigti DEMO aktyvinimo.",
      passwordSaveFailed: "Slaptažodžio nustatyti nepavyko.",
      completionFailed: "DEMO paskyros užbaigti nepavyko.",
      checking: "Tikrinama DEMO paskyra...",
      title: "Užbaigti DEMO paskyrą",
      description: "Nustatykite slaptažodį, kad galėtumėte pasiekti savo AEGRIS DEMO paskyrą.",
      newPassword: "Naujas slaptažodis",
      passwordPlaceholder: "Bent 8 simboliai",
      confirmPassword: "Patvirtinti slaptažodį",
      confirmPlaceholder: "Pakartokite slaptažodį",
      saving: "Nustatoma paskyra...",
      complete: "Užbaigti DEMO paskyrą",
    },
    lv: {
      invalidOrExpired: "Uzaicinājums nav derīgs vai tā termiņš ir beidzies.",
      verificationFailed: "Uzaicinājumu neizdevās pārbaudīt. Atveriet aktivizācijas saiti vēlreiz.",
      inviteVerificationFailed: "Uzaicinājumu neizdevās pārbaudīt.",
      demoOnly: "Šī lapa ir paredzēta tikai DEMO konta aktivizēšanai.",
      demoInviteVerificationFailed: "DEMO uzaicinājumu neizdevās pārbaudīt.",
      passwordTooShort: "Parolei jābūt vismaz 8 rakstzīmes garai.",
      passwordsMismatch: "Paroles nesakrīt.",
      loginVerificationFailed: "Pieteikšanos no uzaicinājuma neizdevās pārbaudīt. Atveriet aktivizācijas saiti vēlreiz.",
      demoAccountVerificationFailed: "DEMO kontu neizdevās pārbaudīt.",
      notAuthorized: "Šim kontam nav atļauts pabeigt DEMO aktivizāciju.",
      passwordSaveFailed: "Paroli neizdevās iestatīt.",
      completionFailed: "DEMO kontu neizdevās pabeigt.",
      checking: "Pārbauda DEMO kontu...",
      title: "Pabeigt DEMO kontu",
      description: "Iestatiet paroli, lai piekļūtu savam AEGRIS DEMO kontam.",
      newPassword: "Jauna parole",
      passwordPlaceholder: "Vismaz 8 rakstzīmes",
      confirmPassword: "Apstiprināt paroli",
      confirmPlaceholder: "Atkārtojiet paroli",
      saving: "Iestata kontu...",
      complete: "Pabeigt DEMO kontu",
    },
    et: {
      invalidOrExpired: "Kutse on vigane või aegunud.",
      verificationFailed: "Kutset ei õnnestunud kontrollida. Avage aktiveerimislink uuesti.",
      inviteVerificationFailed: "Kutset ei õnnestunud kontrollida.",
      demoOnly: "See leht on mõeldud ainult DEMO-konto aktiveerimiseks.",
      demoInviteVerificationFailed: "DEMO-kutset ei õnnestunud kontrollida.",
      passwordTooShort: "Parool peab sisaldama vähemalt 8 märki.",
      passwordsMismatch: "Paroolid ei ühti.",
      loginVerificationFailed: "Kutse kaudu sisselogimist ei õnnestunud kontrollida. Avage aktiveerimislink uuesti.",
      demoAccountVerificationFailed: "DEMO-kontot ei õnnestunud kontrollida.",
      notAuthorized: "Sellel kontol pole õigust DEMO aktiveerimist lõpule viia.",
      passwordSaveFailed: "Parooli ei õnnestunud määrata.",
      completionFailed: "DEMO-kontot ei õnnestunud lõpule viia.",
      checking: "DEMO-konto kontrollimine...",
      title: "Lõpeta DEMO-konto seadistamine",
      description: "Määrake parool oma AEGRIS DEMO-kontole juurdepääsuks.",
      newPassword: "Uus parool",
      passwordPlaceholder: "Vähemalt 8 märki",
      confirmPassword: "Kinnita parool",
      confirmPlaceholder: "Korda parooli",
      saving: "Konto seadistamine...",
      complete: "Lõpeta DEMO-konto",
    },
    el: {
      invalidOrExpired: "Η πρόσκληση δεν είναι έγκυρη ή έχει λήξει.",
      verificationFailed: "Δεν ήταν δυνατή η επαλήθευση της πρόσκλησης. Ανοίξτε ξανά τον σύνδεσμο ενεργοποίησης.",
      inviteVerificationFailed: "Δεν ήταν δυνατή η επαλήθευση της πρόσκλησης.",
      demoOnly: "Αυτή η σελίδα προορίζεται μόνο για ενεργοποίηση λογαριασμού DEMO.",
      demoInviteVerificationFailed: "Δεν ήταν δυνατή η επαλήθευση της πρόσκλησης DEMO.",
      passwordTooShort: "Ο κωδικός πρέπει να περιέχει τουλάχιστον 8 χαρακτήρες.",
      passwordsMismatch: "Οι κωδικοί δεν ταιριάζουν.",
      loginVerificationFailed: "Δεν ήταν δυνατή η επαλήθευση της σύνδεσης μέσω της πρόσκλησης. Ανοίξτε ξανά τον σύνδεσμο ενεργοποίησης.",
      demoAccountVerificationFailed: "Δεν ήταν δυνατή η επαλήθευση του λογαριασμού DEMO.",
      notAuthorized: "Αυτός ο λογαριασμός δεν έχει δικαίωμα να ολοκληρώσει την ενεργοποίηση DEMO.",
      passwordSaveFailed: "Δεν ήταν δυνατός ο ορισμός του κωδικού.",
      completionFailed: "Δεν ήταν δυνατή η ολοκλήρωση του λογαριασμού DEMO.",
      checking: "Επαλήθευση λογαριασμού DEMO...",
      title: "Ολοκλήρωση λογαριασμού DEMO",
      description: "Ορίστε έναν κωδικό για πρόσβαση στον λογαριασμό AEGRIS DEMO.",
      newPassword: "Νέος κωδικός",
      passwordPlaceholder: "Τουλάχιστον 8 χαρακτήρες",
      confirmPassword: "Επιβεβαίωση κωδικού",
      confirmPlaceholder: "Επαναλάβετε τον κωδικό",
      saving: "Ρύθμιση λογαριασμού...",
      complete: "Ολοκλήρωση λογαριασμού DEMO",
    },
    sv: {
      invalidOrExpired: "Inbjudan är ogiltig eller har gått ut.",
      verificationFailed: "Inbjudan kunde inte verifieras. Öppna aktiveringslänken igen.",
      inviteVerificationFailed: "Inbjudan kunde inte verifieras.",
      demoOnly: "Den här sidan är endast avsedd för aktivering av ett DEMO-konto.",
      demoInviteVerificationFailed: "DEMO-inbjudan kunde inte verifieras.",
      passwordTooShort: "Lösenordet måste innehålla minst 8 tecken.",
      passwordsMismatch: "Lösenorden stämmer inte överens.",
      loginVerificationFailed: "Inloggningen via inbjudan kunde inte verifieras. Öppna aktiveringslänken igen.",
      demoAccountVerificationFailed: "DEMO-kontot kunde inte verifieras.",
      notAuthorized: "Det här kontot har inte behörighet att slutföra DEMO-aktiveringen.",
      passwordSaveFailed: "Lösenordet kunde inte anges.",
      completionFailed: "DEMO-kontot kunde inte slutföras.",
      checking: "Verifierar DEMO-konto...",
      title: "Slutför DEMO-konto",
      description: "Ange ett lösenord för att komma åt ditt AEGRIS DEMO-konto.",
      newPassword: "Nytt lösenord",
      passwordPlaceholder: "Minst 8 tecken",
      confirmPassword: "Bekräfta lösenord",
      confirmPlaceholder: "Upprepa lösenord",
      saving: "Konfigurerar konto...",
      complete: "Slutför DEMO-konto",
    },
    da: {
      invalidOrExpired: "Invitationen er ugyldig eller udløbet.",
      verificationFailed: "Invitationen kunne ikke bekræftes. Åbn aktiveringslinket igen.",
      inviteVerificationFailed: "Invitationen kunne ikke bekræftes.",
      demoOnly: "Denne side er kun beregnet til aktivering af en DEMO-konto.",
      demoInviteVerificationFailed: "DEMO-invitationen kunne ikke bekræftes.",
      passwordTooShort: "Adgangskoden skal indeholde mindst 8 tegn.",
      passwordsMismatch: "Adgangskoderne er ikke ens.",
      loginVerificationFailed: "Login via invitationen kunne ikke bekræftes. Åbn aktiveringslinket igen.",
      demoAccountVerificationFailed: "DEMO-kontoen kunne ikke bekræftes.",
      notAuthorized: "Denne konto har ikke tilladelse til at fuldføre DEMO-aktiveringen.",
      passwordSaveFailed: "Adgangskoden kunne ikke indstilles.",
      completionFailed: "DEMO-kontoen kunne ikke færdiggøres.",
      checking: "Bekræfter DEMO-konto...",
      title: "Færdiggør DEMO-konto",
      description: "Angiv en adgangskode for at få adgang til din AEGRIS DEMO-konto.",
      newPassword: "Ny adgangskode",
      passwordPlaceholder: "Mindst 8 tegn",
      confirmPassword: "Bekræft adgangskode",
      confirmPlaceholder: "Gentag adgangskode",
      saving: "Konfigurerer konto...",
      complete: "Færdiggør DEMO-konto",
    },
    no: {
      invalidOrExpired: "Invitasjonen er ugyldig eller utløpt.",
      verificationFailed: "Invitasjonen kunne ikke bekreftes. Åpne aktiveringslenken på nytt.",
      inviteVerificationFailed: "Invitasjonen kunne ikke bekreftes.",
      demoOnly: "Denne siden er bare for aktivering av en DEMO-konto.",
      demoInviteVerificationFailed: "DEMO-invitasjonen kunne ikke bekreftes.",
      passwordTooShort: "Passordet må inneholde minst 8 tegn.",
      passwordsMismatch: "Passordene er ikke like.",
      loginVerificationFailed: "Innlogging via invitasjonen kunne ikke bekreftes. Åpne aktiveringslenken på nytt.",
      demoAccountVerificationFailed: "DEMO-kontoen kunne ikke bekreftes.",
      notAuthorized: "Denne kontoen har ikke tillatelse til å fullføre DEMO-aktiveringen.",
      passwordSaveFailed: "Passordet kunne ikke angis.",
      completionFailed: "DEMO-kontoen kunne ikke fullføres.",
      checking: "Bekrefter DEMO-konto...",
      title: "Fullfør DEMO-konto",
      description: "Angi et passord for å få tilgang til AEGRIS DEMO-kontoen din.",
      newPassword: "Nytt passord",
      passwordPlaceholder: "Minst 8 tegn",
      confirmPassword: "Bekreft passord",
      confirmPlaceholder: "Gjenta passord",
      saving: "Konfigurerer konto...",
      complete: "Fullfør DEMO-konto",
    },
    fi: {
      invalidOrExpired: "Kutsu on virheellinen tai vanhentunut.",
      verificationFailed: "Kutsua ei voitu vahvistaa. Avaa aktivointilinkki uudelleen.",
      inviteVerificationFailed: "Kutsua ei voitu vahvistaa.",
      demoOnly: "Tämä sivu on tarkoitettu vain DEMO-tilin aktivointiin.",
      demoInviteVerificationFailed: "DEMO-kutsua ei voitu vahvistaa.",
      passwordTooShort: "Salasanassa on oltava vähintään 8 merkkiä.",
      passwordsMismatch: "Salasanat eivät täsmää.",
      loginVerificationFailed: "Kutsun kautta kirjautumista ei voitu vahvistaa. Avaa aktivointilinkki uudelleen.",
      demoAccountVerificationFailed: "DEMO-tiliä ei voitu vahvistaa.",
      notAuthorized: "Tällä tilillä ei ole oikeutta suorittaa DEMO-aktivointia loppuun.",
      passwordSaveFailed: "Salasanaa ei voitu asettaa.",
      completionFailed: "DEMO-tilin määritystä ei voitu viimeistellä.",
      checking: "Vahvistetaan DEMO-tiliä...",
      title: "Viimeistele DEMO-tili",
      description: "Aseta salasana käyttääksesi AEGRIS DEMO -tiliäsi.",
      newPassword: "Uusi salasana",
      passwordPlaceholder: "Vähintään 8 merkkiä",
      confirmPassword: "Vahvista salasana",
      confirmPlaceholder: "Toista salasana",
      saving: "Määritetään tiliä...",
      complete: "Viimeistele DEMO-tili",
    }
  } as const;

  return copies[language as keyof typeof copies] ?? copies.en;
}
export default function AcceptInvitePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getAcceptInviteCopy(language);
  const initializedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    let active = true;

    async function initializeInvite() {
      try {
        const hashParams = new URLSearchParams(
          window.location.hash.startsWith("#")
            ? window.location.hash.slice(1)
            : window.location.hash
        );

        const authError =
          hashParams.get("error_description") ||
          hashParams.get("error");

        if (authError) {
          console.error(
            "DEMO INVITE URL ERROR:",
            authError
          );

          if (active) {
            setErrorMessage(copy.invalidOrExpired);
            setLoading(false);
          }

          return;
        }

        const accessToken =
          hashParams.get("access_token");

        const refreshToken =
          hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const {
            error: sessionError,
          } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error(
              "DEMO SET SESSION ERROR:",
              sessionError
            );

            if (active) {
              setErrorMessage(copy.verificationFailed);
              setLoading(false);
            }

            return;
          }

          window.history.replaceState(
            {},
            document.title,
            window.location.pathname +
              window.location.search
          );
        } else {
          const {
            data: { session },
            error: sessionCheckError,
          } = await supabase.auth.getSession();

          if (
            sessionCheckError ||
            !session
          ) {
            console.error(
              "DEMO SESSION VERIFY ERROR:",
              sessionCheckError
            );

            if (active) {
              setErrorMessage(copy.invalidOrExpired);
              setLoading(false);
            }

            return;
          }
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!active) {
          return;
        }

        if (userError || !user) {
          console.error(
            "DEMO USER VERIFY ERROR:",
            userError
          );

          setErrorMessage(copy.invalidOrExpired);
          setLoading(false);

          return;
        }

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("account_type")
          .eq("id", user.id)
          .maybeSingle();

        if (!active) {
          return;
        }

        if (profileError) {
          console.error(
            "DEMO PROFILE VERIFY ERROR:",
            profileError
          );

          setErrorMessage(copy.inviteVerificationFailed);
          setLoading(false);

          return;
        }

        if (
          profile?.account_type !==
          "demo"
        ) {
          setErrorMessage(copy.demoOnly);
          setLoading(false);

          return;
        }

        setErrorMessage("");
        setLoading(false);
      } catch (error) {
        console.error(
          "DEMO INVITE INITIALIZATION ERROR:",
          error
        );

        if (active) {
          setErrorMessage(copy.demoInviteVerificationFailed);
          setLoading(false);
        }
      }
    }

    void initializeInvite();

    return () => {
      active = false;
    };
  }, [
    copy.demoInviteVerificationFailed,
    copy.demoOnly,
    copy.invalidOrExpired,
    copy.inviteVerificationFailed,
    copy.verificationFailed,
  ]);

  async function handleSetPassword() {
    if (saving) {
      return;
    }

    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage(copy.passwordTooShort);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(copy.passwordsMismatch);
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(
          "DEMO USER CHECK ERROR:",
          userError
        );

        setErrorMessage(copy.loginVerificationFailed);

        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          "DEMO PROFILE CHECK ERROR:",
          profileError
        );

        setErrorMessage(copy.demoAccountVerificationFailed);

        return;
      }

      if (
        profile?.account_type !==
        "demo"
      ) {
        setErrorMessage(copy.notAuthorized);

        return;
      }

      const {
        error: updateError,
      } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        console.error(
          "DEMO PASSWORD UPDATE ERROR:",
          updateError
        );

        setErrorMessage(copy.passwordSaveFailed);

        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(
        "DEMO ACCEPT CLIENT ERROR:",
        error
      );

      setErrorMessage(copy.completionFailed);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="absolute right-5 top-5 sm:right-8 sm:top-8">
          <LanguageSwitcher />
        </div>

        <div className="text-slate-400">
          {copy.checking}
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="absolute right-5 top-5 sm:right-8 sm:top-8">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-cyan-400">
            AEGRIS
          </h1>

          <p className="mt-3 text-slate-400">
            {copy.title}
          </p>
        </div>

        {errorMessage &&
        !password &&
        !confirmPassword ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
            {errorMessage}
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm leading-6 text-slate-400">
              {copy.description}
            </p>

            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-slate-300"
            >
              {copy.newPassword}
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              autoComplete="new-password"
              placeholder={copy.passwordPlaceholder}
              disabled={saving}
              minLength={8}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400 disabled:opacity-50"
            />

            <label
              htmlFor="confirmPassword"
              className="mb-2 mt-4 block text-sm font-semibold text-slate-300"
            >
              {copy.confirmPassword}
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              autoComplete="new-password"
              placeholder={copy.confirmPlaceholder}
              disabled={saving}
              minLength={8}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400 disabled:opacity-50"
            />

            {errorMessage && (
              <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                void handleSetPassword()
              }
              disabled={saving}
              className="mt-6 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? copy.saving
                : copy.complete}
            </button>
          </>
        )}
      </div>
    </main>
  );
}
