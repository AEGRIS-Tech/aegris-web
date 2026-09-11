"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useLanguage } from "../../context/LanguageContext";

function getResetPasswordCopy(language: string) {
  const copies = {
    en: {
      checking: "Verifying password recovery link...",
      title: "Set a new password",
      invalidLink: "The password recovery link is invalid or has expired.",
      passwordTooShort: "Password must contain at least 8 characters.",
      passwordsMismatch: "Passwords do not match.",
      saveFailed: "The new password could not be saved.",
      sendNewLink: "Send a new link",
      newPassword: "New password",
      confirmPassword: "Confirm password",
      saving: "Saving...",
      savePassword: "Set new password",
    },
    cs: {
      checking: "Ověřuji odkaz pro obnovu hesla...",
      title: "Nastavení nového hesla",
      invalidLink: "Odkaz pro obnovu hesla je neplatný nebo vypršel.",
      passwordTooShort: "Heslo musí mít alespoň 8 znaků.",
      passwordsMismatch: "Hesla se neshodují.",
      saveFailed: "Nové heslo se nepodařilo uložit.",
      sendNewLink: "Poslat nový odkaz",
      newPassword: "Nové heslo",
      confirmPassword: "Potvrzení hesla",
      saving: "Ukládám...",
      savePassword: "Nastavit nové heslo",
    },
    sk: {
      checking: "Overujem odkaz na obnovu hesla...",
      title: "Nastavenie nového hesla",
      invalidLink: "Odkaz na obnovu hesla je neplatný alebo vypršal.",
      passwordTooShort: "Heslo musí obsahovať aspoň 8 znakov.",
      passwordsMismatch: "Heslá sa nezhodujú.",
      saveFailed: "Nové heslo sa nepodarilo uložiť.",
      sendNewLink: "Poslať nový odkaz",
      newPassword: "Nové heslo",
      confirmPassword: "Potvrdiť heslo",
      saving: "Ukladám...",
      savePassword: "Nastaviť nové heslo",
    },
    de: {
      checking: "Link zur Passwortwiederherstellung wird überprüft...",
      title: "Neues Passwort festlegen",
      invalidLink: "Der Link zur Passwortwiederherstellung ist ungültig oder abgelaufen.",
      passwordTooShort: "Das Passwort muss mindestens 8 Zeichen enthalten.",
      passwordsMismatch: "Die Passwörter stimmen nicht überein.",
      saveFailed: "Das neue Passwort konnte nicht gespeichert werden.",
      sendNewLink: "Neuen Link senden",
      newPassword: "Neues Passwort",
      confirmPassword: "Passwort bestätigen",
      saving: "Speichern...",
      savePassword: "Neues Passwort festlegen",
    },
    pl: {
      checking: "Sprawdzanie linku do odzyskiwania hasła...",
      title: "Ustaw nowe hasło",
      invalidLink: "Link do odzyskiwania hasła jest nieprawidłowy lub wygasł.",
      passwordTooShort: "Hasło musi zawierać co najmniej 8 znaków.",
      passwordsMismatch: "Hasła nie są zgodne.",
      saveFailed: "Nie udało się zapisać nowego hasła.",
      sendNewLink: "Wyślij nowy link",
      newPassword: "Nowe hasło",
      confirmPassword: "Potwierdź hasło",
      saving: "Zapisywanie...",
      savePassword: "Ustaw nowe hasło",
    },
    fr: {
      checking: "Vérification du lien de récupération...",
      title: "Définir un nouveau mot de passe",
      invalidLink: "Le lien de récupération est invalide ou a expiré.",
      passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères.",
      passwordsMismatch: "Les mots de passe ne correspondent pas.",
      saveFailed: "Le nouveau mot de passe n'a pas pu être enregistré.",
      sendNewLink: "Envoyer un nouveau lien",
      newPassword: "Nouveau mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      saving: "Enregistrement...",
      savePassword: "Définir le nouveau mot de passe",
    },
    es: {
      checking: "Verificando el enlace de recuperación...",
      title: "Establecer una nueva contraseña",
      invalidLink: "El enlace de recuperación no es válido o ha caducado.",
      passwordTooShort: "La contraseña debe contener al menos 8 caracteres.",
      passwordsMismatch: "Las contraseñas no coinciden.",
      saveFailed: "No se pudo guardar la nueva contraseña.",
      sendNewLink: "Enviar un nuevo enlace",
      newPassword: "Nueva contraseña",
      confirmPassword: "Confirmar contraseña",
      saving: "Guardando...",
      savePassword: "Establecer nueva contraseña",
    },
    it: {
      checking: "Verifica del link di recupero password...",
      title: "Imposta una nuova password",
      invalidLink: "Il link di recupero password non è valido o è scaduto.",
      passwordTooShort: "La password deve contenere almeno 8 caratteri.",
      passwordsMismatch: "Le password non corrispondono.",
      saveFailed: "Non è stato possibile salvare la nuova password.",
      sendNewLink: "Invia un nuovo link",
      newPassword: "Nuova password",
      confirmPassword: "Conferma password",
      saving: "Salvataggio...",
      savePassword: "Imposta nuova password",
    },
    nl: {
      checking: "Link voor wachtwoordherstel controleren...",
      title: "Nieuw wachtwoord instellen",
      invalidLink: "De link voor wachtwoordherstel is ongeldig of verlopen.",
      passwordTooShort: "Het wachtwoord moet minimaal 8 tekens bevatten.",
      passwordsMismatch: "De wachtwoorden komen niet overeen.",
      saveFailed: "Het nieuwe wachtwoord kon niet worden opgeslagen.",
      sendNewLink: "Nieuwe link verzenden",
      newPassword: "Nieuw wachtwoord",
      confirmPassword: "Wachtwoord bevestigen",
      saving: "Opslaan...",
      savePassword: "Nieuw wachtwoord instellen",
    },
    pt: {
      checking: "A verificar o link de recuperação...",
      title: "Definir uma nova palavra-passe",
      invalidLink: "O link de recuperação é inválido ou expirou.",
      passwordTooShort: "A palavra-passe deve ter pelo menos 8 caracteres.",
      passwordsMismatch: "As palavras-passe não coincidem.",
      saveFailed: "Não foi possível guardar a nova palavra-passe.",
      sendNewLink: "Enviar novo link",
      newPassword: "Nova palavra-passe",
      confirmPassword: "Confirmar palavra-passe",
      saving: "A guardar...",
      savePassword: "Definir nova palavra-passe",
    },
    ro: {
      checking: "Se verifică linkul de recuperare...",
      title: "Setați o parolă nouă",
      invalidLink: "Linkul de recuperare este invalid sau a expirat.",
      passwordTooShort: "Parola trebuie să conțină cel puțin 8 caractere.",
      passwordsMismatch: "Parolele nu coincid.",
      saveFailed: "Noua parolă nu a putut fi salvată.",
      sendNewLink: "Trimite un link nou",
      newPassword: "Parolă nouă",
      confirmPassword: "Confirmă parola",
      saving: "Se salvează...",
      savePassword: "Setează parola nouă",
    },
    hu: {
      checking: "Jelszó-helyreállítási link ellenőrzése...",
      title: "Új jelszó beállítása",
      invalidLink: "A jelszó-helyreállítási link érvénytelen vagy lejárt.",
      passwordTooShort: "A jelszónak legalább 8 karakterből kell állnia.",
      passwordsMismatch: "A jelszavak nem egyeznek.",
      saveFailed: "Az új jelszót nem sikerült menteni.",
      sendNewLink: "Új link küldése",
      newPassword: "Új jelszó",
      confirmPassword: "Jelszó megerősítése",
      saving: "Mentés...",
      savePassword: "Új jelszó beállítása",
    },
    uk: {
      checking: "Перевірка посилання для відновлення пароля...",
      title: "Встановити новий пароль",
      invalidLink: "Посилання для відновлення пароля недійсне або термін його дії минув.",
      passwordTooShort: "Пароль має містити щонайменше 8 символів.",
      passwordsMismatch: "Паролі не збігаються.",
      saveFailed: "Не вдалося зберегти новий пароль.",
      sendNewLink: "Надіслати нове посилання",
      newPassword: "Новий пароль",
      confirmPassword: "Підтвердьте пароль",
      saving: "Збереження...",
      savePassword: "Встановити новий пароль",
    },
    bg: {
      checking: "Проверка на линка за възстановяване...",
      title: "Задаване на нова парола",
      invalidLink: "Линкът за възстановяване е невалиден или е изтекъл.",
      passwordTooShort: "Паролата трябва да съдържа поне 8 знака.",
      passwordsMismatch: "Паролите не съвпадат.",
      saveFailed: "Новата парола не можа да бъде запазена.",
      sendNewLink: "Изпрати нов линк",
      newPassword: "Нова парола",
      confirmPassword: "Потвърдете паролата",
      saving: "Запазване...",
      savePassword: "Задай нова парола",
    },
    hr: {
      checking: "Provjera poveznice za obnovu lozinke...",
      title: "Postavite novu lozinku",
      invalidLink: "Poveznica za obnovu lozinke nije valjana ili je istekla.",
      passwordTooShort: "Lozinka mora sadržavati najmanje 8 znakova.",
      passwordsMismatch: "Lozinke se ne podudaraju.",
      saveFailed: "Novu lozinku nije bilo moguće spremiti.",
      sendNewLink: "Pošalji novu poveznicu",
      newPassword: "Nova lozinka",
      confirmPassword: "Potvrdi lozinku",
      saving: "Spremanje...",
      savePassword: "Postavi novu lozinku",
    },
    sl: {
      checking: "Preverjanje povezave za obnovo gesla...",
      title: "Nastavite novo geslo",
      invalidLink: "Povezava za obnovo gesla ni veljavna ali je potekla.",
      passwordTooShort: "Geslo mora vsebovati najmanj 8 znakov.",
      passwordsMismatch: "Gesli se ne ujemata.",
      saveFailed: "Novega gesla ni bilo mogoče shraniti.",
      sendNewLink: "Pošlji novo povezavo",
      newPassword: "Novo geslo",
      confirmPassword: "Potrdite geslo",
      saving: "Shranjevanje...",
      savePassword: "Nastavi novo geslo",
    },
    lt: {
      checking: "Tikrinama slaptažodžio atkūrimo nuoroda...",
      title: "Nustatyti naują slaptažodį",
      invalidLink: "Slaptažodžio atkūrimo nuoroda netinkama arba nebegalioja.",
      passwordTooShort: "Slaptažodį turi sudaryti bent 8 simboliai.",
      passwordsMismatch: "Slaptažodžiai nesutampa.",
      saveFailed: "Naujo slaptažodžio išsaugoti nepavyko.",
      sendNewLink: "Siųsti naują nuorodą",
      newPassword: "Naujas slaptažodis",
      confirmPassword: "Patvirtinti slaptažodį",
      saving: "Saugoma...",
      savePassword: "Nustatyti naują slaptažodį",
    },
    lv: {
      checking: "Paroles atjaunošanas saites pārbaude...",
      title: "Iestatīt jaunu paroli",
      invalidLink: "Paroles atjaunošanas saite nav derīga vai tās termiņš ir beidzies.",
      passwordTooShort: "Parolei jābūt vismaz 8 rakstzīmes garai.",
      passwordsMismatch: "Paroles nesakrīt.",
      saveFailed: "Jauno paroli neizdevās saglabāt.",
      sendNewLink: "Nosūtīt jaunu saiti",
      newPassword: "Jauna parole",
      confirmPassword: "Apstiprināt paroli",
      saving: "Saglabāšana...",
      savePassword: "Iestatīt jaunu paroli",
    },
    et: {
      checking: "Parooli taastamise lingi kontrollimine...",
      title: "Määra uus parool",
      invalidLink: "Parooli taastamise link on vigane või aegunud.",
      passwordTooShort: "Parool peab sisaldama vähemalt 8 märki.",
      passwordsMismatch: "Paroolid ei ühti.",
      saveFailed: "Uut parooli ei õnnestunud salvestada.",
      sendNewLink: "Saada uus link",
      newPassword: "Uus parool",
      confirmPassword: "Kinnita parool",
      saving: "Salvestamine...",
      savePassword: "Määra uus parool",
    },
    el: {
      checking: "Έλεγχος συνδέσμου ανάκτησης κωδικού...",
      title: "Ορισμός νέου κωδικού πρόσβασης",
      invalidLink: "Ο σύνδεσμος ανάκτησης είναι άκυρος ή έχει λήξει.",
      passwordTooShort: "Ο κωδικός πρέπει να περιέχει τουλάχιστον 8 χαρακτήρες.",
      passwordsMismatch: "Οι κωδικοί δεν ταιριάζουν.",
      saveFailed: "Δεν ήταν δυνατή η αποθήκευση του νέου κωδικού.",
      sendNewLink: "Αποστολή νέου συνδέσμου",
      newPassword: "Νέος κωδικός πρόσβασης",
      confirmPassword: "Επιβεβαίωση κωδικού",
      saving: "Αποθήκευση...",
      savePassword: "Ορισμός νέου κωδικού",
    },
    sv: {
      checking: "Verifierar länken för lösenordsåterställning...",
      title: "Ange ett nytt lösenord",
      invalidLink: "Länken för lösenordsåterställning är ogiltig eller har gått ut.",
      passwordTooShort: "Lösenordet måste innehålla minst 8 tecken.",
      passwordsMismatch: "Lösenorden stämmer inte överens.",
      saveFailed: "Det nya lösenordet kunde inte sparas.",
      sendNewLink: "Skicka en ny länk",
      newPassword: "Nytt lösenord",
      confirmPassword: "Bekräfta lösenord",
      saving: "Sparar...",
      savePassword: "Ange nytt lösenord",
    },
    da: {
      checking: "Kontrollerer linket til nulstilling af adgangskode...",
      title: "Angiv en ny adgangskode",
      invalidLink: "Linket til nulstilling er ugyldigt eller udløbet.",
      passwordTooShort: "Adgangskoden skal indeholde mindst 8 tegn.",
      passwordsMismatch: "Adgangskoderne er ikke ens.",
      saveFailed: "Den nye adgangskode kunne ikke gemmes.",
      sendNewLink: "Send et nyt link",
      newPassword: "Ny adgangskode",
      confirmPassword: "Bekræft adgangskode",
      saving: "Gemmer...",
      savePassword: "Angiv ny adgangskode",
    },
    no: {
      checking: "Kontrollerer lenken for tilbakestilling av passord...",
      title: "Angi et nytt passord",
      invalidLink: "Lenken for tilbakestilling er ugyldig eller utløpt.",
      passwordTooShort: "Passordet må inneholde minst 8 tegn.",
      passwordsMismatch: "Passordene er ikke like.",
      saveFailed: "Det nye passordet kunne ikke lagres.",
      sendNewLink: "Send en ny lenke",
      newPassword: "Nytt passord",
      confirmPassword: "Bekreft passord",
      saving: "Lagrer...",
      savePassword: "Angi nytt passord",
    },
    fi: {
      checking: "Tarkistetaan salasanan palautuslinkkiä...",
      title: "Aseta uusi salasana",
      invalidLink: "Salasanan palautuslinkki on virheellinen tai vanhentunut.",
      passwordTooShort: "Salasanassa on oltava vähintään 8 merkkiä.",
      passwordsMismatch: "Salasanat eivät täsmää.",
      saveFailed: "Uutta salasanaa ei voitu tallentaa.",
      sendNewLink: "Lähetä uusi linkki",
      newPassword: "Uusi salasana",
      confirmPassword: "Vahvista salasana",
      saving: "Tallennetaan...",
      savePassword: "Aseta uusi salasana",
    }
  } as const;

  return copies[language as keyof typeof copies] ?? copies.en;
}
export default function ResetPasswordPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const copy = getResetPasswordCopy(language);

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error || !data.session) {
        setErrorMessage(copy.invalidLink);
      }

      setChecking(false);
    });

    return () => {
      active = false;
    };
  }, [copy.invalidLink]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

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
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error("PASSWORD UPDATE ERROR:", error);
        setErrorMessage(copy.saveFailed);
        return;
      }

      await supabase.auth.signOut();
      router.replace("/login?reset=success");
    } catch (error) {
      console.error("PASSWORD UPDATE CLIENT ERROR:", error);
      setErrorMessage(copy.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  if (checking) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-400">
        <div className="absolute right-5 top-5 sm:right-8 sm:top-8">
          <LanguageSwitcher />
        </div>
        {copy.checking}
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
          <h1 className="text-4xl font-bold text-cyan-400">AEGRIS</h1>
          <p className="mt-3 text-slate-400">{copy.title}</p>
        </div>

        {errorMessage && !saving && !password && !confirmPassword ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
              {errorMessage}
            </div>
            <Link
              href="/auth/forgot-password"
              className="block text-center text-sm font-semibold text-cyan-400"
            >
              {copy.sendNewLink}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
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
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
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
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
            />

            {errorMessage && (
              <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-6 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {saving ? copy.saving : copy.savePassword}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
