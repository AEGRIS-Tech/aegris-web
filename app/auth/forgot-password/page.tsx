"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useLanguage } from "../../context/LanguageContext";

function getForgotPasswordCopy(language: string) {
  const copies = {
    en: {
      title: "Password recovery",
      email: "E-mail",
      sendFailed: "The password recovery link could not be sent.",
      sentMessage: "If an account with this e-mail exists, we have sent a link to set a new password.",
      sending: "Sending...",
      sendLink: "Send recovery link",
      backToLogin: "Back to sign in",
    },
    cs: {
      title: "Obnova hesla",
      email: "E-mail",
      sendFailed: "Odkaz pro obnovu hesla se nepodařilo odeslat.",
      sentMessage: "Pokud účet s tímto e-mailem existuje, odeslali jsme odkaz pro nastavení nového hesla.",
      sending: "Odesílám...",
      sendLink: "Poslat odkaz pro obnovu",
      backToLogin: "Zpět na přihlášení",
    },
    sk: {
      title: "Obnova hesla",
      email: "E-mail",
      sendFailed: "Odkaz na obnovu hesla sa nepodarilo odoslať.",
      sentMessage: "Ak účet s týmto e-mailom existuje, odoslali sme odkaz na nastavenie nového hesla.",
      sending: "Odosielam...",
      sendLink: "Poslať odkaz na obnovu",
      backToLogin: "Späť na prihlásenie",
    },
    de: {
      title: "Passwort wiederherstellen",
      email: "E-Mail",
      sendFailed: "Der Link zur Passwortwiederherstellung konnte nicht gesendet werden.",
      sentMessage: "Wenn ein Konto mit dieser E-Mail-Adresse existiert, haben wir einen Link zum Festlegen eines neuen Passworts gesendet.",
      sending: "Wird gesendet...",
      sendLink: "Wiederherstellungslink senden",
      backToLogin: "Zurück zur Anmeldung",
    },
    pl: {
      title: "Odzyskiwanie hasła",
      email: "E-mail",
      sendFailed: "Nie udało się wysłać linku do odzyskiwania hasła.",
      sentMessage: "Jeśli istnieje konto z tym adresem e-mail, wysłaliśmy link do ustawienia nowego hasła.",
      sending: "Wysyłanie...",
      sendLink: "Wyślij link odzyskiwania",
      backToLogin: "Wróć do logowania",
    },
    fr: {
      title: "Récupération du mot de passe",
      email: "E-mail",
      sendFailed: "Le lien de récupération du mot de passe n'a pas pu être envoyé.",
      sentMessage: "Si un compte associé à cet e-mail existe, nous avons envoyé un lien pour définir un nouveau mot de passe.",
      sending: "Envoi...",
      sendLink: "Envoyer le lien de récupération",
      backToLogin: "Retour à la connexion",
    },
    es: {
      title: "Recuperación de contraseña",
      email: "E-mail",
      sendFailed: "No se pudo enviar el enlace de recuperación de contraseña.",
      sentMessage: "Si existe una cuenta con este e-mail, hemos enviado un enlace para establecer una nueva contraseña.",
      sending: "Enviando...",
      sendLink: "Enviar enlace de recuperación",
      backToLogin: "Volver al inicio de sesión",
    },
    it: {
      title: "Recupero password",
      email: "E-mail",
      sendFailed: "Non è stato possibile inviare il link per il recupero della password.",
      sentMessage: "Se esiste un account con questa e-mail, abbiamo inviato un link per impostare una nuova password.",
      sending: "Invio...",
      sendLink: "Invia link di recupero",
      backToLogin: "Torna all'accesso",
    },
    nl: {
      title: "Wachtwoord herstellen",
      email: "E-mail",
      sendFailed: "De link voor wachtwoordherstel kon niet worden verzonden.",
      sentMessage: "Als er een account met dit e-mailadres bestaat, hebben we een link gestuurd om een nieuw wachtwoord in te stellen.",
      sending: "Verzenden...",
      sendLink: "Herstellink verzenden",
      backToLogin: "Terug naar inloggen",
    },
    pt: {
      title: "Recuperação de palavra-passe",
      email: "E-mail",
      sendFailed: "Não foi possível enviar o link de recuperação da palavra-passe.",
      sentMessage: "Se existir uma conta com este e-mail, enviámos um link para definir uma nova palavra-passe.",
      sending: "A enviar...",
      sendLink: "Enviar link de recuperação",
      backToLogin: "Voltar ao início de sessão",
    },
    ro: {
      title: "Recuperarea parolei",
      email: "E-mail",
      sendFailed: "Linkul pentru recuperarea parolei nu a putut fi trimis.",
      sentMessage: "Dacă există un cont cu acest e-mail, am trimis un link pentru setarea unei parole noi.",
      sending: "Se trimite...",
      sendLink: "Trimite linkul de recuperare",
      backToLogin: "Înapoi la autentificare",
    },
    hu: {
      title: "Jelszó-helyreállítás",
      email: "E-mail",
      sendFailed: "A jelszó-helyreállítási linket nem sikerült elküldeni.",
      sentMessage: "Ha létezik fiók ezzel az e-mail-címmel, elküldtünk egy linket új jelszó beállításához.",
      sending: "Küldés...",
      sendLink: "Helyreállítási link küldése",
      backToLogin: "Vissza a bejelentkezéshez",
    },
    uk: {
      title: "Відновлення пароля",
      email: "E-mail",
      sendFailed: "Не вдалося надіслати посилання для відновлення пароля.",
      sentMessage: "Якщо обліковий запис із цим e-mail існує, ми надіслали посилання для встановлення нового пароля.",
      sending: "Надсилання...",
      sendLink: "Надіслати посилання для відновлення",
      backToLogin: "Назад до входу",
    },
    bg: {
      title: "Възстановяване на парола",
      email: "E-mail",
      sendFailed: "Не можа да бъде изпратен линкът за възстановяване на паролата.",
      sentMessage: "Ако съществува профил с този e-mail, изпратихме линк за задаване на нова парола.",
      sending: "Изпращане...",
      sendLink: "Изпрати линк за възстановяване",
      backToLogin: "Назад към вход",
    },
    hr: {
      title: "Obnova lozinke",
      email: "E-mail",
      sendFailed: "Poveznicu za obnovu lozinke nije bilo moguće poslati.",
      sentMessage: "Ako račun s ovom e-mail adresom postoji, poslali smo poveznicu za postavljanje nove lozinke.",
      sending: "Slanje...",
      sendLink: "Pošalji poveznicu za obnovu",
      backToLogin: "Natrag na prijavu",
    },
    sl: {
      title: "Obnova gesla",
      email: "E-pošta",
      sendFailed: "Povezave za obnovo gesla ni bilo mogoče poslati.",
      sentMessage: "Če račun s tem e-poštnim naslovom obstaja, smo poslali povezavo za nastavitev novega gesla.",
      sending: "Pošiljanje...",
      sendLink: "Pošlji povezavo za obnovo",
      backToLogin: "Nazaj na prijavo",
    },
    lt: {
      title: "Slaptažodžio atkūrimas",
      email: "El. paštas",
      sendFailed: "Slaptažodžio atkūrimo nuorodos išsiųsti nepavyko.",
      sentMessage: "Jei paskyra su šiuo el. paštu egzistuoja, išsiuntėme nuorodą naujam slaptažodžiui nustatyti.",
      sending: "Siunčiama...",
      sendLink: "Siųsti atkūrimo nuorodą",
      backToLogin: "Atgal į prisijungimą",
    },
    lv: {
      title: "Paroles atjaunošana",
      email: "E-pasts",
      sendFailed: "Paroles atjaunošanas saiti neizdevās nosūtīt.",
      sentMessage: "Ja konts ar šo e-pastu pastāv, esam nosūtījuši saiti jaunas paroles iestatīšanai.",
      sending: "Nosūtīšana...",
      sendLink: "Nosūtīt atjaunošanas saiti",
      backToLogin: "Atpakaļ uz pieteikšanos",
    },
    et: {
      title: "Parooli taastamine",
      email: "E-post",
      sendFailed: "Parooli taastamise linki ei õnnestunud saata.",
      sentMessage: "Kui selle e-posti aadressiga konto on olemas, saatsime lingi uue parooli määramiseks.",
      sending: "Saatmine...",
      sendLink: "Saada taastamislink",
      backToLogin: "Tagasi sisselogimisele",
    },
    el: {
      title: "Ανάκτηση κωδικού πρόσβασης",
      email: "E-mail",
      sendFailed: "Δεν ήταν δυνατή η αποστολή του συνδέσμου ανάκτησης κωδικού.",
      sentMessage: "Αν υπάρχει λογαριασμός με αυτό το e-mail, στείλαμε σύνδεσμο για ορισμό νέου κωδικού.",
      sending: "Αποστολή...",
      sendLink: "Αποστολή συνδέσμου ανάκτησης",
      backToLogin: "Επιστροφή στη σύνδεση",
    },
    sv: {
      title: "Återställ lösenord",
      email: "E-post",
      sendFailed: "Länken för lösenordsåterställning kunde inte skickas.",
      sentMessage: "Om det finns ett konto med den här e-postadressen har vi skickat en länk för att ange ett nytt lösenord.",
      sending: "Skickar...",
      sendLink: "Skicka återställningslänk",
      backToLogin: "Tillbaka till inloggning",
    },
    da: {
      title: "Nulstil adgangskode",
      email: "E-mail",
      sendFailed: "Linket til nulstilling af adgangskoden kunne ikke sendes.",
      sentMessage: "Hvis der findes en konto med denne e-mail, har vi sendt et link til at angive en ny adgangskode.",
      sending: "Sender...",
      sendLink: "Send nulstillingslink",
      backToLogin: "Tilbage til login",
    },
    no: {
      title: "Tilbakestill passord",
      email: "E-post",
      sendFailed: "Lenken for tilbakestilling av passord kunne ikke sendes.",
      sentMessage: "Hvis det finnes en konto med denne e-postadressen, har vi sendt en lenke for å angi et nytt passord.",
      sending: "Sender...",
      sendLink: "Send tilbakestillingslenke",
      backToLogin: "Tilbake til innlogging",
    },
    fi: {
      title: "Salasanan palautus",
      email: "Sähköposti",
      sendFailed: "Salasanan palautuslinkkiä ei voitu lähettää.",
      sentMessage: "Jos tällä sähköpostiosoitteella on tili, olemme lähettäneet linkin uuden salasanan asettamista varten.",
      sending: "Lähetetään...",
      sendLink: "Lähetä palautuslinkki",
      backToLogin: "Takaisin kirjautumiseen",
    }
  } as const;

  return copies[language as keyof typeof copies] ?? copies.en;
}
export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const copy = getForgotPasswordCopy(language);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
        "/auth/reset-password"
      )}`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        { redirectTo }
      );

      if (error) {
        console.error("PASSWORD RECOVERY ERROR:", error);
        setErrorMessage(copy.sendFailed);
        return;
      }

      setSent(true);
    } catch (error) {
      console.error("PASSWORD RECOVERY CLIENT ERROR:", error);
      setErrorMessage(copy.sendFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="absolute right-5 top-5 sm:right-8 sm:top-8">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-cyan-400">AEGRIS</h1>
          <p className="mt-3 text-slate-400">{copy.title}</p>
        </div>

        {sent ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-300">
              {copy.sentMessage}
            </div>
            <Link
              href="/login"
              className="block text-center text-sm font-semibold text-cyan-400 hover:text-cyan-300"
            >
              {copy.backToLogin}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
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
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
            />

            {errorMessage && (
              <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {loading ? copy.sending : copy.sendLink}
            </button>

            <Link
              href="/login"
              className="mt-5 block text-center text-sm text-slate-400 hover:text-white"
            >
              {copy.backToLogin}
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
