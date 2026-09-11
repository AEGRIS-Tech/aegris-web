"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { supabase } from "@/lib/supabase";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useLanguage } from "../../context/LanguageContext";

type AcceptResponse =
  | {
      ok: true;
      organizationId: string;
      role: string;
      alreadyMember: boolean;
    }
  | {
      ok: false;
      code?: string;
      message?: string;
    };

function getAcceptInviteCopy(language: string) {
  const copies = {
    en: {
      acceptFailed: "The invitation could not be accepted.",
      unexpectedError: "An unexpected error occurred while accepting the invitation.",
      invalidInvitation: "The invitation is invalid or its token is missing.",
      acceptingTitle: "Accepting invitation",
      acceptingDescription: "We are verifying your organization membership...",
      failedTitle: "The invitation could not be accepted",
      goToDashboard: "Go to Dashboard",
      loadingTitle: "Loading invitation",
      loadingDescription: "Preparing secure invitation acceptance...",
    },
    cs: {
      acceptFailed: "Pozvánku se nepodařilo přijmout.",
      unexpectedError: "Při přijímání pozvánky došlo k neočekávané chybě.",
      invalidInvitation: "Pozvánka není platná nebo chybí její token.",
      acceptingTitle: "Přijímám pozvánku",
      acceptingDescription: "Ověřujeme vaše členství v organizaci...",
      failedTitle: "Pozvánku se nepodařilo přijmout",
      goToDashboard: "Přejít na Dashboard",
      loadingTitle: "Načítám pozvánku",
      loadingDescription: "Připravuji bezpečné přijetí pozvánky...",
    },
    sk: {
      acceptFailed: "Pozvánku sa nepodarilo prijať.",
      unexpectedError: "Pri prijímaní pozvánky došlo k neočakávanej chybe.",
      invalidInvitation: "Pozvánka je neplatná alebo chýba jej token.",
      acceptingTitle: "Prijímam pozvánku",
      acceptingDescription: "Overujeme vaše členstvo v organizácii...",
      failedTitle: "Pozvánku sa nepodarilo prijať",
      goToDashboard: "Prejsť na Dashboard",
      loadingTitle: "Načítavam pozvánku",
      loadingDescription: "Pripravujem bezpečné prijatie pozvánky...",
    },
    de: {
      acceptFailed: "Die Einladung konnte nicht angenommen werden.",
      unexpectedError: "Beim Annehmen der Einladung ist ein unerwarteter Fehler aufgetreten.",
      invalidInvitation: "Die Einladung ist ungültig oder das Token fehlt.",
      acceptingTitle: "Einladung wird angenommen",
      acceptingDescription: "Wir überprüfen Ihre Mitgliedschaft in der Organisation...",
      failedTitle: "Die Einladung konnte nicht angenommen werden",
      goToDashboard: "Zum Dashboard",
      loadingTitle: "Einladung wird geladen",
      loadingDescription: "Sichere Annahme der Einladung wird vorbereitet...",
    },
    pl: {
      acceptFailed: "Nie udało się przyjąć zaproszenia.",
      unexpectedError: "Podczas przyjmowania zaproszenia wystąpił nieoczekiwany błąd.",
      invalidInvitation: "Zaproszenie jest nieprawidłowe lub brakuje jego tokenu.",
      acceptingTitle: "Przyjmowanie zaproszenia",
      acceptingDescription: "Weryfikujemy członkostwo w organizacji...",
      failedTitle: "Nie udało się przyjąć zaproszenia",
      goToDashboard: "Przejdź do Dashboardu",
      loadingTitle: "Ładowanie zaproszenia",
      loadingDescription: "Przygotowywanie bezpiecznego przyjęcia zaproszenia...",
    },
    fr: {
      acceptFailed: "L'invitation n'a pas pu être acceptée.",
      unexpectedError: "Une erreur inattendue s'est produite lors de l'acceptation de l'invitation.",
      invalidInvitation: "L'invitation est invalide ou son jeton est manquant.",
      acceptingTitle: "Acceptation de l'invitation",
      acceptingDescription: "Nous vérifions votre appartenance à l'organisation...",
      failedTitle: "L'invitation n'a pas pu être acceptée",
      goToDashboard: "Aller au Dashboard",
      loadingTitle: "Chargement de l'invitation",
      loadingDescription: "Préparation de l'acceptation sécurisée de l'invitation...",
    },
    es: {
      acceptFailed: "No se pudo aceptar la invitación.",
      unexpectedError: "Se produjo un error inesperado al aceptar la invitación.",
      invalidInvitation: "La invitación no es válida o falta su token.",
      acceptingTitle: "Aceptando invitación",
      acceptingDescription: "Estamos verificando su pertenencia a la organización...",
      failedTitle: "No se pudo aceptar la invitación",
      goToDashboard: "Ir al Dashboard",
      loadingTitle: "Cargando invitación",
      loadingDescription: "Preparando la aceptación segura de la invitación...",
    },
    it: {
      acceptFailed: "Non è stato possibile accettare l'invito.",
      unexpectedError: "Si è verificato un errore imprevisto durante l'accettazione dell'invito.",
      invalidInvitation: "L'invito non è valido o manca il relativo token.",
      acceptingTitle: "Accettazione dell'invito",
      acceptingDescription: "Stiamo verificando la tua appartenenza all'organizzazione...",
      failedTitle: "Non è stato possibile accettare l'invito",
      goToDashboard: "Vai alla Dashboard",
      loadingTitle: "Caricamento invito",
      loadingDescription: "Preparazione dell'accettazione sicura dell'invito...",
    },
    nl: {
      acceptFailed: "De uitnodiging kon niet worden geaccepteerd.",
      unexpectedError: "Er is een onverwachte fout opgetreden bij het accepteren van de uitnodiging.",
      invalidInvitation: "De uitnodiging is ongeldig of het token ontbreekt.",
      acceptingTitle: "Uitnodiging accepteren",
      acceptingDescription: "We controleren uw lidmaatschap van de organisatie...",
      failedTitle: "De uitnodiging kon niet worden geaccepteerd",
      goToDashboard: "Naar Dashboard",
      loadingTitle: "Uitnodiging laden",
      loadingDescription: "Veilige acceptatie van de uitnodiging voorbereiden...",
    },
    pt: {
      acceptFailed: "Não foi possível aceitar o convite.",
      unexpectedError: "Ocorreu um erro inesperado ao aceitar o convite.",
      invalidInvitation: "O convite é inválido ou falta o respetivo token.",
      acceptingTitle: "A aceitar convite",
      acceptingDescription: "Estamos a verificar a sua participação na organização...",
      failedTitle: "Não foi possível aceitar o convite",
      goToDashboard: "Ir para o Dashboard",
      loadingTitle: "A carregar convite",
      loadingDescription: "A preparar a aceitação segura do convite...",
    },
    ro: {
      acceptFailed: "Invitația nu a putut fi acceptată.",
      unexpectedError: "A apărut o eroare neașteptată la acceptarea invitației.",
      invalidInvitation: "Invitația este invalidă sau tokenul lipsește.",
      acceptingTitle: "Se acceptă invitația",
      acceptingDescription: "Verificăm apartenența dvs. la organizație...",
      failedTitle: "Invitația nu a putut fi acceptată",
      goToDashboard: "Mergi la Dashboard",
      loadingTitle: "Se încarcă invitația",
      loadingDescription: "Se pregătește acceptarea securizată a invitației...",
    },
    hu: {
      acceptFailed: "A meghívást nem sikerült elfogadni.",
      unexpectedError: "Váratlan hiba történt a meghívás elfogadása közben.",
      invalidInvitation: "A meghívás érvénytelen, vagy hiányzik a token.",
      acceptingTitle: "Meghívás elfogadása",
      acceptingDescription: "Ellenőrizzük a szervezeti tagságát...",
      failedTitle: "A meghívást nem sikerült elfogadni",
      goToDashboard: "Ugrás a Dashboardra",
      loadingTitle: "Meghívás betöltése",
      loadingDescription: "A meghívás biztonságos elfogadásának előkészítése...",
    },
    uk: {
      acceptFailed: "Не вдалося прийняти запрошення.",
      unexpectedError: "Під час прийняття запрошення сталася неочікувана помилка.",
      invalidInvitation: "Запрошення недійсне або відсутній його токен.",
      acceptingTitle: "Прийняття запрошення",
      acceptingDescription: "Перевіряємо ваше членство в організації...",
      failedTitle: "Не вдалося прийняти запрошення",
      goToDashboard: "Перейти до Dashboard",
      loadingTitle: "Завантаження запрошення",
      loadingDescription: "Підготовка безпечного прийняття запрошення...",
    },
    bg: {
      acceptFailed: "Поканата не можа да бъде приета.",
      unexpectedError: "Възникна неочаквана грешка при приемането на поканата.",
      invalidInvitation: "Поканата е невалидна или липсва нейният токен.",
      acceptingTitle: "Приемане на поканата",
      acceptingDescription: "Проверяваме членството ви в организацията...",
      failedTitle: "Поканата не можа да бъде приета",
      goToDashboard: "Към Dashboard",
      loadingTitle: "Зареждане на поканата",
      loadingDescription: "Подготовка на сигурното приемане на поканата...",
    },
    hr: {
      acceptFailed: "Pozivnicu nije bilo moguće prihvatiti.",
      unexpectedError: "Došlo je do neočekivane pogreške pri prihvaćanju pozivnice.",
      invalidInvitation: "Pozivnica nije valjana ili nedostaje njezin token.",
      acceptingTitle: "Prihvaćanje pozivnice",
      acceptingDescription: "Provjeravamo vaše članstvo u organizaciji...",
      failedTitle: "Pozivnicu nije bilo moguće prihvatiti",
      goToDashboard: "Idi na Dashboard",
      loadingTitle: "Učitavanje pozivnice",
      loadingDescription: "Priprema sigurnog prihvaćanja pozivnice...",
    },
    sl: {
      acceptFailed: "Povabila ni bilo mogoče sprejeti.",
      unexpectedError: "Pri sprejemanju povabila je prišlo do nepričakovane napake.",
      invalidInvitation: "Povabilo ni veljavno ali manjka njegov žeton.",
      acceptingTitle: "Sprejemanje povabila",
      acceptingDescription: "Preverjamo vaše članstvo v organizaciji...",
      failedTitle: "Povabila ni bilo mogoče sprejeti",
      goToDashboard: "Pojdi na Dashboard",
      loadingTitle: "Nalaganje povabila",
      loadingDescription: "Priprava varnega sprejema povabila...",
    },
    lt: {
      acceptFailed: "Kvietimo priimti nepavyko.",
      unexpectedError: "Priimant kvietimą įvyko netikėta klaida.",
      invalidInvitation: "Kvietimas netinkamas arba trūksta jo prieigos rakto.",
      acceptingTitle: "Kvietimas priimamas",
      acceptingDescription: "Tikriname jūsų narystę organizacijoje...",
      failedTitle: "Kvietimo priimti nepavyko",
      goToDashboard: "Eiti į Dashboard",
      loadingTitle: "Įkeliamas kvietimas",
      loadingDescription: "Ruošiamas saugus kvietimo priėmimas...",
    },
    lv: {
      acceptFailed: "Uzaicinājumu neizdevās pieņemt.",
      unexpectedError: "Pieņemot uzaicinājumu, radās neparedzēta kļūda.",
      invalidInvitation: "Uzaicinājums nav derīgs vai trūkst tā marķiera.",
      acceptingTitle: "Uzaicinājuma pieņemšana",
      acceptingDescription: "Pārbaudām jūsu dalību organizācijā...",
      failedTitle: "Uzaicinājumu neizdevās pieņemt",
      goToDashboard: "Doties uz Dashboard",
      loadingTitle: "Ielādē uzaicinājumu",
      loadingDescription: "Sagatavo drošu uzaicinājuma pieņemšanu...",
    },
    et: {
      acceptFailed: "Kutset ei õnnestunud vastu võtta.",
      unexpectedError: "Kutse vastuvõtmisel ilmnes ootamatu viga.",
      invalidInvitation: "Kutse on vigane või selle token puudub.",
      acceptingTitle: "Kutse vastuvõtmine",
      acceptingDescription: "Kontrollime teie liikmelisust organisatsioonis...",
      failedTitle: "Kutset ei õnnestunud vastu võtta",
      goToDashboard: "Ava Dashboard",
      loadingTitle: "Kutse laadimine",
      loadingDescription: "Kutse turvalise vastuvõtmise ettevalmistamine...",
    },
    el: {
      acceptFailed: "Δεν ήταν δυνατή η αποδοχή της πρόσκλησης.",
      unexpectedError: "Παρουσιάστηκε απρόσμενο σφάλμα κατά την αποδοχή της πρόσκλησης.",
      invalidInvitation: "Η πρόσκληση δεν είναι έγκυρη ή λείπει το token της.",
      acceptingTitle: "Αποδοχή πρόσκλησης",
      acceptingDescription: "Επαληθεύουμε τη συμμετοχή σας στον οργανισμό...",
      failedTitle: "Δεν ήταν δυνατή η αποδοχή της πρόσκλησης",
      goToDashboard: "Μετάβαση στο Dashboard",
      loadingTitle: "Φόρτωση πρόσκλησης",
      loadingDescription: "Προετοιμασία ασφαλούς αποδοχής της πρόσκλησης...",
    },
    sv: {
      acceptFailed: "Inbjudan kunde inte accepteras.",
      unexpectedError: "Ett oväntat fel uppstod när inbjudan skulle accepteras.",
      invalidInvitation: "Inbjudan är ogiltig eller så saknas dess token.",
      acceptingTitle: "Accepterar inbjudan",
      acceptingDescription: "Vi verifierar ditt medlemskap i organisationen...",
      failedTitle: "Inbjudan kunde inte accepteras",
      goToDashboard: "Gå till Dashboard",
      loadingTitle: "Laddar inbjudan",
      loadingDescription: "Förbereder säker acceptans av inbjudan...",
    },
    da: {
      acceptFailed: "Invitationen kunne ikke accepteres.",
      unexpectedError: "Der opstod en uventet fejl under accept af invitationen.",
      invalidInvitation: "Invitationen er ugyldig, eller dens token mangler.",
      acceptingTitle: "Accepterer invitation",
      acceptingDescription: "Vi bekræfter dit medlemskab af organisationen...",
      failedTitle: "Invitationen kunne ikke accepteres",
      goToDashboard: "Gå til Dashboard",
      loadingTitle: "Indlæser invitation",
      loadingDescription: "Forbereder sikker accept af invitationen...",
    },
    no: {
      acceptFailed: "Invitasjonen kunne ikke godtas.",
      unexpectedError: "Det oppstod en uventet feil under godkjenning av invitasjonen.",
      invalidInvitation: "Invitasjonen er ugyldig eller token mangler.",
      acceptingTitle: "Godtar invitasjon",
      acceptingDescription: "Vi bekrefter medlemskapet ditt i organisasjonen...",
      failedTitle: "Invitasjonen kunne ikke godtas",
      goToDashboard: "Gå til Dashboard",
      loadingTitle: "Laster invitasjon",
      loadingDescription: "Forbereder sikker godkjenning av invitasjonen...",
    },
    fi: {
      acceptFailed: "Kutsua ei voitu hyväksyä.",
      unexpectedError: "Kutsua hyväksyttäessä tapahtui odottamaton virhe.",
      invalidInvitation: "Kutsu on virheellinen tai sen tunniste puuttuu.",
      acceptingTitle: "Kutsua hyväksytään",
      acceptingDescription: "Vahvistamme jäsenyytesi organisaatiossa...",
      failedTitle: "Kutsua ei voitu hyväksyä",
      goToDashboard: "Siirry Dashboardiin",
      loadingTitle: "Ladataan kutsua",
      loadingDescription: "Valmistellaan kutsun turvallista hyväksymistä...",
    }
  } as const;

  return copies[language as keyof typeof copies] ?? copies.en;
}
function AcceptOrganizationInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const copy = getAcceptInviteCopy(language);

  const token = searchParams.get("token")?.trim() ?? "";

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    async function acceptInvitation() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          const loginUrl =
            `/login?next=${encodeURIComponent(
              `/auth/accept-organization-invite?token=${token}`
            )}`;

          router.replace(loginUrl);
          return;
        }

        const response = await fetch(
          "/api/organizations/invitations/accept",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              token,
            }),
          }
        );

        const body =
          (await response.json()) as AcceptResponse;

        if (!response.ok || !body.ok) {
          const message =
            !body.ok && body.message
              ? body.message
              : copy.acceptFailed;

          setErrorMessage(message);
          setLoading(false);
          return;
        }

        router.replace("/dashboard");
        router.refresh();
      } catch (error) {
        console.error(
          "ORGANIZATION INVITE ACCEPT PAGE ERROR:",
          error
        );

        setErrorMessage(copy.unexpectedError);
        setLoading(false);
      }
    }

    void acceptInvitation();
  }, [copy.acceptFailed, copy.unexpectedError, router, token]);

  const displayedErrorMessage = token
    ? errorMessage
    : copy.invalidInvitation;

  if (token && loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="absolute right-5 top-5 sm:right-8 sm:top-8">
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
          <div className="text-4xl font-bold text-cyan-400">
            AEGRIS
          </div>

          <div className="mt-5 text-lg font-semibold">
            {copy.acceptingTitle}
          </div>

          <p className="mt-2 text-sm text-slate-400">
            {copy.acceptingDescription}
          </p>

          <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="absolute right-5 top-5 sm:right-8 sm:top-8">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-slate-900 p-8 shadow-2xl">
        <div className="text-center">
          <div className="text-4xl font-bold text-cyan-400">
            AEGRIS
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            {copy.failedTitle}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {displayedErrorMessage}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            router.replace("/dashboard");
          }}
          className="mt-7 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
        >
          {copy.goToDashboard}
        </button>
      </div>
    </main>
  );
}

function LoadingFallback() {
  const { language } = useLanguage();
  const copy = getAcceptInviteCopy(language);

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="absolute right-5 top-5 sm:right-8 sm:top-8">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="text-4xl font-bold text-cyan-400">
          AEGRIS
        </div>

        <div className="mt-5 text-lg font-semibold">
          {copy.loadingTitle}
        </div>

        <p className="mt-2 text-sm text-slate-400">
          {copy.loadingDescription}
        </p>

        <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
      </div>
    </main>
  );
}

export default function AcceptOrganizationInvitePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcceptOrganizationInviteContent />
    </Suspense>
  );
}
