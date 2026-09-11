"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

const WorldMap = dynamic(() => import("./WorldMap"), { ssr: false });


type BoundaryPoint = {
  latitude: number;
  longitude: number;
};

type Props = {
  open: boolean;
  latitude: number;
  longitude: number;
  onClose: () => void;
  onSave: (project: {
    name: string;
    latitude: number;
    longitude: number;
    status: string;
    boundary: BoundaryPoint[];
  }) => void;
};

function getNewProjectCopy(language: string) {
  const copies = {
    cs: {
      enterAddress: "Zadej adresu nebo PSČ.",
      geocodingUnavailable: "Geokódovací služba neodpověděla.",
      locationNotFound: "Místo se nepodařilo najít. Zkus přesnější adresu nebo PSČ.",
      invalidCoordinates: "Nalezené místo nemá platné souřadnice.",
      searchFailed: "Místo se nepodařilo vyhledat.",
      enterProjectName: "Zadej název projektu.",
      searchLocationFirst: "Nejdříve vyhledej místo.",
      markBoundary: "Označ alespoň 3 body hranice pozemku.",
      completeBoundary: "Nejdříve dokonči hranici pozemku.",
      title: "Nový projekt",
      subtitle: "Najdi pozemek a označ jeho hranici na satelitní mapě.",
      projectName: "Název projektu",
      projectNamePlaceholder: "Např. Pole sever",
      address: "Adresa nebo PSČ",
      addressPlaceholder: "Např. 841 01",
      addressHint: "Zadej adresu, obec nebo PSČ.",
      locationFound: "✓ Místo nalezeno",
      locationFoundHint: "Teď klikáním označ rohy sledovaného pozemku.",
      fieldBoundary: "Hranice pozemku",
      pointCount: "Počet bodů",
      boundaryCompleted: "✓ Hranice dokončena",
      status: "Status",
      statusMonitoring: "Monitoring",
      statusActive: "Aktivní",
      statusCompleted: "Dokončeno",
      cancel: "Zrušit",
      createProject: "✓ Vytvořit projekt",
    },
    en: {
      enterAddress: "Enter an address or postal code.",
      geocodingUnavailable: "The geocoding service did not respond.",
      locationNotFound: "The location could not be found. Try a more precise address or postal code.",
      invalidCoordinates: "The found location does not have valid coordinates.",
      searchFailed: "The location could not be searched.",
      enterProjectName: "Enter a project name.",
      searchLocationFirst: "Search for a location first.",
      markBoundary: "Mark at least 3 points of the field boundary.",
      completeBoundary: "Complete the field boundary first.",
      title: "New project",
      subtitle: "Find the field and mark its boundary on the satellite map.",
      projectName: "Project name",
      projectNamePlaceholder: "E.g. North field",
      address: "Address or postal code",
      addressPlaceholder: "E.g. 841 01",
      addressHint: "Enter an address, municipality or postal code.",
      locationFound: "✓ Location found",
      locationFoundHint: "Now click to mark the corners of the monitored field.",
      fieldBoundary: "Field boundary",
      pointCount: "Number of points",
      boundaryCompleted: "✓ Boundary completed",
      status: "Status",
      statusMonitoring: "Monitoring",
      statusActive: "Active",
      statusCompleted: "Completed",
      cancel: "Cancel",
      createProject: "✓ Create project",
    },
    sk: {
      enterAddress: "Zadaj adresu alebo PSČ.",
      geocodingUnavailable: "Geokódovacia služba neodpovedala.",
      locationNotFound: "Miesto sa nepodarilo nájsť. Skús presnejšiu adresu alebo PSČ.",
      invalidCoordinates: "Nájdené miesto nemá platné súradnice.",
      searchFailed: "Miesto sa nepodarilo vyhľadať.",
      enterProjectName: "Zadaj názov projektu.",
      searchLocationFirst: "Najprv vyhľadaj miesto.",
      markBoundary: "Označ aspoň 3 body hranice pozemku.",
      completeBoundary: "Najprv dokonči hranicu pozemku.",
      title: "Nový projekt",
      subtitle: "Nájdi pozemok a označ jeho hranicu na satelitnej mape.",
      projectName: "Názov projektu",
      projectNamePlaceholder: "Napr. Severné pole",
      address: "Adresa alebo PSČ",
      addressPlaceholder: "Napr. 841 01",
      addressHint: "Zadaj adresu, obec alebo PSČ.",
      locationFound: "✓ Miesto nájdené",
      locationFoundHint: "Teraz klikaním označ rohy sledovaného pozemku.",
      fieldBoundary: "Hranica pozemku",
      pointCount: "Počet bodov",
      boundaryCompleted: "✓ Hranica dokončená",
      status: "Stav",
      statusMonitoring: "Monitoring",
      statusActive: "Aktívny",
      statusCompleted: "Dokončené",
      cancel: "Zrušiť",
      createProject: "✓ Vytvoriť projekt",
    },
    de: {
      enterAddress: "Adresse oder Postleitzahl eingeben.",
      geocodingUnavailable: "Der Geokodierungsdienst hat nicht geantwortet.",
      locationNotFound: "Der Ort wurde nicht gefunden. Versuchen Sie eine genauere Adresse oder Postleitzahl.",
      invalidCoordinates: "Der gefundene Ort hat keine gültigen Koordinaten.",
      searchFailed: "Der Ort konnte nicht gesucht werden.",
      enterProjectName: "Projektnamen eingeben.",
      searchLocationFirst: "Suchen Sie zuerst einen Ort.",
      markBoundary: "Markieren Sie mindestens 3 Punkte der Feldgrenze.",
      completeBoundary: "Schließen Sie zuerst die Feldgrenze ab.",
      title: "Neues Projekt",
      subtitle: "Finden Sie das Feld und markieren Sie seine Grenze auf der Satellitenkarte.",
      projectName: "Projektname",
      projectNamePlaceholder: "Z. B. Nordfeld",
      address: "Adresse oder Postleitzahl",
      addressPlaceholder: "Z. B. 841 01",
      addressHint: "Adresse, Gemeinde oder Postleitzahl eingeben.",
      locationFound: "✓ Ort gefunden",
      locationFoundHint: "Markieren Sie nun durch Klicken die Ecken des überwachten Feldes.",
      fieldBoundary: "Feldgrenze",
      pointCount: "Anzahl der Punkte",
      boundaryCompleted: "✓ Grenze abgeschlossen",
      status: "Status",
      statusMonitoring: "Monitoring",
      statusActive: "Aktiv",
      statusCompleted: "Abgeschlossen",
      cancel: "Abbrechen",
      createProject: "✓ Projekt erstellen",
    },
    pl: {
      enterAddress: "Wprowadź adres lub kod pocztowy.",
      geocodingUnavailable: "Usługa geokodowania nie odpowiedziała.",
      locationNotFound: "Nie znaleziono lokalizacji. Spróbuj podać dokładniejszy adres lub kod pocztowy.",
      invalidCoordinates: "Znaleziona lokalizacja nie ma prawidłowych współrzędnych.",
      searchFailed: "Nie udało się wyszukać lokalizacji.",
      enterProjectName: "Wprowadź nazwę projektu.",
      searchLocationFirst: "Najpierw wyszukaj lokalizację.",
      markBoundary: "Zaznacz co najmniej 3 punkty granicy pola.",
      completeBoundary: "Najpierw dokończ granicę pola.",
      title: "Nowy projekt",
      subtitle: "Znajdź pole i zaznacz jego granicę na mapie satelitarnej.",
      projectName: "Nazwa projektu",
      projectNamePlaceholder: "Np. Pole północne",
      address: "Adres lub kod pocztowy",
      addressPlaceholder: "Np. 841 01",
      addressHint: "Wprowadź adres, miejscowość lub kod pocztowy.",
      locationFound: "✓ Znaleziono lokalizację",
      locationFoundHint: "Teraz kliknij, aby zaznaczyć narożniki monitorowanego pola.",
      fieldBoundary: "Granica pola",
      pointCount: "Liczba punktów",
      boundaryCompleted: "✓ Granica ukończona",
      status: "Status",
      statusMonitoring: "Monitoring",
      statusActive: "Aktywny",
      statusCompleted: "Zakończony",
      cancel: "Anuluj",
      createProject: "✓ Utwórz projekt",
    },
    fr: {
      enterAddress: "Saisissez une adresse ou un code postal.",
      geocodingUnavailable: "Le service de géocodage n’a pas répondu.",
      locationNotFound: "Le lieu est introuvable. Essayez une adresse ou un code postal plus précis.",
      invalidCoordinates: "Le lieu trouvé ne possède pas de coordonnées valides.",
      searchFailed: "La recherche du lieu a échoué.",
      enterProjectName: "Saisissez un nom de projet.",
      searchLocationFirst: "Recherchez d’abord un lieu.",
      markBoundary: "Marquez au moins 3 points de la limite de la parcelle.",
      completeBoundary: "Terminez d’abord la limite de la parcelle.",
      title: "Nouveau projet",
      subtitle: "Localisez la parcelle et marquez sa limite sur la carte satellite.",
      projectName: "Nom du projet",
      projectNamePlaceholder: "Ex. Parcelle nord",
      address: "Adresse ou code postal",
      addressPlaceholder: "Ex. 841 01",
      addressHint: "Saisissez une adresse, une commune ou un code postal.",
      locationFound: "✓ Lieu trouvé",
      locationFoundHint: "Cliquez maintenant pour marquer les angles de la parcelle suivie.",
      fieldBoundary: "Limite de la parcelle",
      pointCount: "Nombre de points",
      boundaryCompleted: "✓ Limite terminée",
      status: "Statut",
      statusMonitoring: "Surveillance",
      statusActive: "Actif",
      statusCompleted: "Terminé",
      cancel: "Annuler",
      createProject: "✓ Créer le projet",
    },
    es: {
      enterAddress: "Introduce una dirección o código postal.",
      geocodingUnavailable: "El servicio de geocodificación no respondió.",
      locationNotFound: "No se encontró la ubicación. Prueba con una dirección o código postal más preciso.",
      invalidCoordinates: "La ubicación encontrada no tiene coordenadas válidas.",
      searchFailed: "No se pudo buscar la ubicación.",
      enterProjectName: "Introduce un nombre de proyecto.",
      searchLocationFirst: "Busca primero una ubicación.",
      markBoundary: "Marca al menos 3 puntos del límite de la parcela.",
      completeBoundary: "Completa primero el límite de la parcela.",
      title: "Nuevo proyecto",
      subtitle: "Localiza la parcela y marca su límite en el mapa satelital.",
      projectName: "Nombre del proyecto",
      projectNamePlaceholder: "P. ej. Parcela norte",
      address: "Dirección o código postal",
      addressPlaceholder: "P. ej. 841 01",
      addressHint: "Introduce una dirección, municipio o código postal.",
      locationFound: "✓ Ubicación encontrada",
      locationFoundHint: "Ahora haz clic para marcar las esquinas de la parcela monitorizada.",
      fieldBoundary: "Límite de la parcela",
      pointCount: "Número de puntos",
      boundaryCompleted: "✓ Límite completado",
      status: "Estado",
      statusMonitoring: "Monitorización",
      statusActive: "Activo",
      statusCompleted: "Completado",
      cancel: "Cancelar",
      createProject: "✓ Crear proyecto",
    },
    it: {
      enterAddress: "Inserisci un indirizzo o codice postale.",
      geocodingUnavailable: "Il servizio di geocodifica non ha risposto.",
      locationNotFound: "Impossibile trovare la località. Prova con un indirizzo o codice postale più preciso.",
      invalidCoordinates: "La località trovata non dispone di coordinate valide.",
      searchFailed: "Impossibile cercare la località.",
      enterProjectName: "Inserisci un nome per il progetto.",
      searchLocationFirst: "Cerca prima una località.",
      markBoundary: "Segna almeno 3 punti del confine dell’appezzamento.",
      completeBoundary: "Completa prima il confine dell’appezzamento.",
      title: "Nuovo progetto",
      subtitle: "Trova l’appezzamento e segnane il confine sulla mappa satellitare.",
      projectName: "Nome del progetto",
      projectNamePlaceholder: "Es. Campo nord",
      address: "Indirizzo o codice postale",
      addressPlaceholder: "Es. 841 01",
      addressHint: "Inserisci un indirizzo, comune o codice postale.",
      locationFound: "✓ Località trovata",
      locationFoundHint: "Ora fai clic per segnare gli angoli dell’appezzamento monitorato.",
      fieldBoundary: "Confine dell’appezzamento",
      pointCount: "Numero di punti",
      boundaryCompleted: "✓ Confine completato",
      status: "Stato",
      statusMonitoring: "Monitoraggio",
      statusActive: "Attivo",
      statusCompleted: "Completato",
      cancel: "Annulla",
      createProject: "✓ Crea progetto",
    },
    nl: {
      enterAddress: "Voer een adres of postcode in.",
      geocodingUnavailable: "De geocoderingsservice reageerde niet.",
      locationNotFound: "De locatie kon niet worden gevonden. Probeer een nauwkeuriger adres of postcode.",
      invalidCoordinates: "De gevonden locatie heeft geen geldige coördinaten.",
      searchFailed: "De locatie kon niet worden gezocht.",
      enterProjectName: "Voer een projectnaam in.",
      searchLocationFirst: "Zoek eerst een locatie.",
      markBoundary: "Markeer minimaal 3 punten van de perceelgrens.",
      completeBoundary: "Voltooi eerst de perceelgrens.",
      title: "Nieuw project",
      subtitle: "Zoek het perceel en markeer de grens op de satellietkaart.",
      projectName: "Projectnaam",
      projectNamePlaceholder: "Bijv. Noordperceel",
      address: "Adres of postcode",
      addressPlaceholder: "Bijv. 841 01",
      addressHint: "Voer een adres, gemeente of postcode in.",
      locationFound: "✓ Locatie gevonden",
      locationFoundHint: "Klik nu om de hoeken van het gemonitorde perceel te markeren.",
      fieldBoundary: "Perceelgrens",
      pointCount: "Aantal punten",
      boundaryCompleted: "✓ Grens voltooid",
      status: "Status",
      statusMonitoring: "Monitoring",
      statusActive: "Actief",
      statusCompleted: "Voltooid",
      cancel: "Annuleren",
      createProject: "✓ Project maken",
    },
    pt: {
      enterAddress: "Introduza uma morada ou código postal.",
      geocodingUnavailable: "O serviço de geocodificação não respondeu.",
      locationNotFound: "Não foi possível encontrar o local. Tente uma morada ou código postal mais preciso.",
      invalidCoordinates: "O local encontrado não tem coordenadas válidas.",
      searchFailed: "Não foi possível pesquisar o local.",
      enterProjectName: "Introduza um nome para o projeto.",
      searchLocationFirst: "Pesquise primeiro um local.",
      markBoundary: "Marque pelo menos 3 pontos do limite da parcela.",
      completeBoundary: "Conclua primeiro o limite da parcela.",
      title: "Novo projeto",
      subtitle: "Localize a parcela e marque o seu limite no mapa de satélite.",
      projectName: "Nome do projeto",
      projectNamePlaceholder: "Ex. Parcela norte",
      address: "Morada ou código postal",
      addressPlaceholder: "Ex. 841 01",
      addressHint: "Introduza uma morada, município ou código postal.",
      locationFound: "✓ Local encontrado",
      locationFoundHint: "Agora clique para marcar os cantos da parcela monitorizada.",
      fieldBoundary: "Limite da parcela",
      pointCount: "Número de pontos",
      boundaryCompleted: "✓ Limite concluído",
      status: "Estado",
      statusMonitoring: "Monitorização",
      statusActive: "Ativo",
      statusCompleted: "Concluído",
      cancel: "Cancelar",
      createProject: "✓ Criar projeto",
    },
    ro: {
      enterAddress: "Introduceți o adresă sau un cod poștal.",
      geocodingUnavailable: "Serviciul de geocodare nu a răspuns.",
      locationNotFound: "Locația nu a putut fi găsită. Încercați o adresă sau un cod poștal mai precis.",
      invalidCoordinates: "Locația găsită nu are coordonate valide.",
      searchFailed: "Locația nu a putut fi căutată.",
      enterProjectName: "Introduceți un nume de proiect.",
      searchLocationFirst: "Căutați mai întâi o locație.",
      markBoundary: "Marcați cel puțin 3 puncte ale limitei parcelei.",
      completeBoundary: "Finalizați mai întâi limita parcelei.",
      title: "Proiect nou",
      subtitle: "Găsiți parcela și marcați-i limita pe harta satelitară.",
      projectName: "Numele proiectului",
      projectNamePlaceholder: "Ex. Parcela nord",
      address: "Adresă sau cod poștal",
      addressPlaceholder: "Ex. 841 01",
      addressHint: "Introduceți o adresă, localitate sau cod poștal.",
      locationFound: "✓ Locație găsită",
      locationFoundHint: "Acum faceți clic pentru a marca colțurile parcelei monitorizate.",
      fieldBoundary: "Limita parcelei",
      pointCount: "Număr de puncte",
      boundaryCompleted: "✓ Limită finalizată",
      status: "Stare",
      statusMonitoring: "Monitorizare",
      statusActive: "Activ",
      statusCompleted: "Finalizat",
      cancel: "Anulare",
      createProject: "✓ Creează proiectul",
    },
    hu: {
      enterAddress: "Adjon meg egy címet vagy irányítószámot.",
      geocodingUnavailable: "A geokódolási szolgáltatás nem válaszolt.",
      locationNotFound: "A hely nem található. Próbáljon pontosabb címet vagy irányítószámot.",
      invalidCoordinates: "A megtalált helyhez nem tartoznak érvényes koordináták.",
      searchFailed: "A hely keresése sikertelen.",
      enterProjectName: "Adja meg a projekt nevét.",
      searchLocationFirst: "Először keressen egy helyet.",
      markBoundary: "Jelölje meg a tábla határának legalább 3 pontját.",
      completeBoundary: "Először fejezze be a tábla határának kijelölését.",
      title: "Új projekt",
      subtitle: "Keresse meg a táblát, és jelölje ki a határát a műholdas térképen.",
      projectName: "Projekt neve",
      projectNamePlaceholder: "Pl. Északi tábla",
      address: "Cím vagy irányítószám",
      addressPlaceholder: "Pl. 841 01",
      addressHint: "Adjon meg címet, települést vagy irányítószámot.",
      locationFound: "✓ Hely megtalálva",
      locationFoundHint: "Most kattintással jelölje meg a megfigyelt tábla sarkait.",
      fieldBoundary: "Tábla határa",
      pointCount: "Pontok száma",
      boundaryCompleted: "✓ Határ befejezve",
      status: "Állapot",
      statusMonitoring: "Megfigyelés",
      statusActive: "Aktív",
      statusCompleted: "Befejezve",
      cancel: "Mégse",
      createProject: "✓ Projekt létrehozása",
    },
    uk: {
      enterAddress: "Введіть адресу або поштовий індекс.",
      geocodingUnavailable: "Служба геокодування не відповіла.",
      locationNotFound: "Місце не знайдено. Спробуйте точнішу адресу або поштовий індекс.",
      invalidCoordinates: "Знайдене місце не має коректних координат.",
      searchFailed: "Не вдалося виконати пошук місця.",
      enterProjectName: "Введіть назву проєкту.",
      searchLocationFirst: "Спочатку знайдіть місце.",
      markBoundary: "Позначте щонайменше 3 точки межі поля.",
      completeBoundary: "Спочатку завершіть межу поля.",
      title: "Новий проєкт",
      subtitle: "Знайдіть поле та позначте його межу на супутниковій карті.",
      projectName: "Назва проєкту",
      projectNamePlaceholder: "Напр. Північне поле",
      address: "Адреса або поштовий індекс",
      addressPlaceholder: "Напр. 841 01",
      addressHint: "Введіть адресу, населений пункт або поштовий індекс.",
      locationFound: "✓ Місце знайдено",
      locationFoundHint: "Тепер клацайте, щоб позначити кути контрольованого поля.",
      fieldBoundary: "Межа поля",
      pointCount: "Кількість точок",
      boundaryCompleted: "✓ Межу завершено",
      status: "Статус",
      statusMonitoring: "Моніторинг",
      statusActive: "Активний",
      statusCompleted: "Завершено",
      cancel: "Скасувати",
      createProject: "✓ Створити проєкт",
    },
    bg: {
      enterAddress: "Въведете адрес или пощенски код.",
      geocodingUnavailable: "Услугата за геокодиране не отговори.",
      locationNotFound: "Мястото не беше намерено. Опитайте с по-точен адрес или пощенски код.",
      invalidCoordinates: "Намереното място няма валидни координати.",
      searchFailed: "Мястото не можа да бъде потърсено.",
      enterProjectName: "Въведете име на проекта.",
      searchLocationFirst: "Първо потърсете място.",
      markBoundary: "Маркирайте поне 3 точки от границата на полето.",
      completeBoundary: "Първо завършете границата на полето.",
      title: "Нов проект",
      subtitle: "Намерете полето и маркирайте границата му на сателитната карта.",
      projectName: "Име на проекта",
      projectNamePlaceholder: "Напр. Северно поле",
      address: "Адрес или пощенски код",
      addressPlaceholder: "Напр. 841 01",
      addressHint: "Въведете адрес, населено място или пощенски код.",
      locationFound: "✓ Мястото е намерено",
      locationFoundHint: "Сега щракнете, за да маркирате ъглите на наблюдаваното поле.",
      fieldBoundary: "Граница на полето",
      pointCount: "Брой точки",
      boundaryCompleted: "✓ Границата е завършена",
      status: "Статус",
      statusMonitoring: "Мониторинг",
      statusActive: "Активен",
      statusCompleted: "Завършен",
      cancel: "Отказ",
      createProject: "✓ Създай проект",
    },
    hr: {
      enterAddress: "Unesite adresu ili poštanski broj.",
      geocodingUnavailable: "Usluga geokodiranja nije odgovorila.",
      locationNotFound: "Lokacija nije pronađena. Pokušajte s preciznijom adresom ili poštanskim brojem.",
      invalidCoordinates: "Pronađena lokacija nema valjane koordinate.",
      searchFailed: "Lokaciju nije bilo moguće pretražiti.",
      enterProjectName: "Unesite naziv projekta.",
      searchLocationFirst: "Najprije pronađite lokaciju.",
      markBoundary: "Označite najmanje 3 točke granice parcele.",
      completeBoundary: "Najprije dovršite granicu parcele.",
      title: "Novi projekt",
      subtitle: "Pronađite parcelu i označite njezinu granicu na satelitskoj karti.",
      projectName: "Naziv projekta",
      projectNamePlaceholder: "Npr. Sjeverno polje",
      address: "Adresa ili poštanski broj",
      addressPlaceholder: "Npr. 841 01",
      addressHint: "Unesite adresu, naselje ili poštanski broj.",
      locationFound: "✓ Lokacija pronađena",
      locationFoundHint: "Sada klikom označite kutove praćene parcele.",
      fieldBoundary: "Granica parcele",
      pointCount: "Broj točaka",
      boundaryCompleted: "✓ Granica dovršena",
      status: "Status",
      statusMonitoring: "Praćenje",
      statusActive: "Aktivan",
      statusCompleted: "Dovršen",
      cancel: "Odustani",
      createProject: "✓ Izradi projekt",
    },
    sl: {
      enterAddress: "Vnesite naslov ali poštno številko.",
      geocodingUnavailable: "Storitev geokodiranja se ni odzvala.",
      locationNotFound: "Lokacije ni bilo mogoče najti. Poskusite z natančnejšim naslovom ali poštno številko.",
      invalidCoordinates: "Najdena lokacija nima veljavnih koordinat.",
      searchFailed: "Lokacije ni bilo mogoče poiskati.",
      enterProjectName: "Vnesite ime projekta.",
      searchLocationFirst: "Najprej poiščite lokacijo.",
      markBoundary: "Označite vsaj 3 točke meje parcele.",
      completeBoundary: "Najprej dokončajte mejo parcele.",
      title: "Nov projekt",
      subtitle: "Poiščite parcelo in označite njeno mejo na satelitskem zemljevidu.",
      projectName: "Ime projekta",
      projectNamePlaceholder: "Npr. Severno polje",
      address: "Naslov ali poštna številka",
      addressPlaceholder: "Npr. 841 01",
      addressHint: "Vnesite naslov, občino ali poštno številko.",
      locationFound: "✓ Lokacija najdena",
      locationFoundHint: "Zdaj s kliki označite vogale spremljane parcele.",
      fieldBoundary: "Meja parcele",
      pointCount: "Število točk",
      boundaryCompleted: "✓ Meja dokončana",
      status: "Stanje",
      statusMonitoring: "Spremljanje",
      statusActive: "Aktiven",
      statusCompleted: "Dokončan",
      cancel: "Prekliči",
      createProject: "✓ Ustvari projekt",
    },
    lt: {
      enterAddress: "Įveskite adresą arba pašto kodą.",
      geocodingUnavailable: "Geokodavimo paslauga neatsakė.",
      locationNotFound: "Vietos rasti nepavyko. Įveskite tikslesnį adresą arba pašto kodą.",
      invalidCoordinates: "Rasta vieta neturi galiojančių koordinačių.",
      searchFailed: "Vietos paieška nepavyko.",
      enterProjectName: "Įveskite projekto pavadinimą.",
      searchLocationFirst: "Pirmiausia suraskite vietą.",
      markBoundary: "Pažymėkite bent 3 lauko ribos taškus.",
      completeBoundary: "Pirmiausia užbaikite lauko ribą.",
      title: "Naujas projektas",
      subtitle: "Suraskite lauką ir pažymėkite jo ribą palydoviniame žemėlapyje.",
      projectName: "Projekto pavadinimas",
      projectNamePlaceholder: "Pvz. Šiaurinis laukas",
      address: "Adresas arba pašto kodas",
      addressPlaceholder: "Pvz. 841 01",
      addressHint: "Įveskite adresą, gyvenvietę arba pašto kodą.",
      locationFound: "✓ Vieta rasta",
      locationFoundHint: "Dabar spustelėdami pažymėkite stebimo lauko kampus.",
      fieldBoundary: "Lauko riba",
      pointCount: "Taškų skaičius",
      boundaryCompleted: "✓ Riba užbaigta",
      status: "Būsena",
      statusMonitoring: "Stebėjimas",
      statusActive: "Aktyvus",
      statusCompleted: "Užbaigtas",
      cancel: "Atšaukti",
      createProject: "✓ Sukurti projektą",
    },
    lv: {
      enterAddress: "Ievadiet adresi vai pasta indeksu.",
      geocodingUnavailable: "Ģeokodēšanas pakalpojums neatbildēja.",
      locationNotFound: "Vietu neizdevās atrast. Mēģiniet precīzāku adresi vai pasta indeksu.",
      invalidCoordinates: "Atrasto vietu nevar izmantot, jo tai nav derīgu koordinātu.",
      searchFailed: "Vietas meklēšana neizdevās.",
      enterProjectName: "Ievadiet projekta nosaukumu.",
      searchLocationFirst: "Vispirms atrodiet vietu.",
      markBoundary: "Atzīmējiet vismaz 3 lauka robežas punktus.",
      completeBoundary: "Vispirms pabeidziet lauka robežu.",
      title: "Jauns projekts",
      subtitle: "Atrodiet lauku un atzīmējiet tā robežu satelītkartē.",
      projectName: "Projekta nosaukums",
      projectNamePlaceholder: "Piem. Ziemeļu lauks",
      address: "Adrese vai pasta indekss",
      addressPlaceholder: "Piem. 841 01",
      addressHint: "Ievadiet adresi, apdzīvotu vietu vai pasta indeksu.",
      locationFound: "✓ Vieta atrasta",
      locationFoundHint: "Tagad klikšķiniet, lai atzīmētu uzraudzītā lauka stūrus.",
      fieldBoundary: "Lauka robeža",
      pointCount: "Punktu skaits",
      boundaryCompleted: "✓ Robeža pabeigta",
      status: "Statuss",
      statusMonitoring: "Uzraudzība",
      statusActive: "Aktīvs",
      statusCompleted: "Pabeigts",
      cancel: "Atcelt",
      createProject: "✓ Izveidot projektu",
    },
    et: {
      enterAddress: "Sisestage aadress või sihtnumber.",
      geocodingUnavailable: "Geokodeerimisteenus ei vastanud.",
      locationNotFound: "Asukohta ei leitud. Proovige täpsemat aadressi või sihtnumbrit.",
      invalidCoordinates: "Leitud asukohal puuduvad kehtivad koordinaadid.",
      searchFailed: "Asukoha otsing ebaõnnestus.",
      enterProjectName: "Sisestage projekti nimi.",
      searchLocationFirst: "Otsige esmalt asukoht.",
      markBoundary: "Märkige vähemalt 3 põllupiiri punkti.",
      completeBoundary: "Lõpetage esmalt põllupiiri märkimine.",
      title: "Uus projekt",
      subtitle: "Leidke põld ja märkige selle piir satelliitkaardil.",
      projectName: "Projekti nimi",
      projectNamePlaceholder: "Nt Põhjapõld",
      address: "Aadress või sihtnumber",
      addressPlaceholder: "Nt 841 01",
      addressHint: "Sisestage aadress, asula või sihtnumber.",
      locationFound: "✓ Asukoht leitud",
      locationFoundHint: "Nüüd klõpsake jälgitava põllu nurkade märkimiseks.",
      fieldBoundary: "Põllupiir",
      pointCount: "Punktide arv",
      boundaryCompleted: "✓ Piir lõpetatud",
      status: "Olek",
      statusMonitoring: "Seire",
      statusActive: "Aktiivne",
      statusCompleted: "Lõpetatud",
      cancel: "Tühista",
      createProject: "✓ Loo projekt",
    },
    el: {
      enterAddress: "Εισαγάγετε διεύθυνση ή ταχυδρομικό κώδικα.",
      geocodingUnavailable: "Η υπηρεσία γεωκωδικοποίησης δεν ανταποκρίθηκε.",
      locationNotFound: "Η τοποθεσία δεν βρέθηκε. Δοκιμάστε ακριβέστερη διεύθυνση ή ταχυδρομικό κώδικα.",
      invalidCoordinates: "Η τοποθεσία που βρέθηκε δεν έχει έγκυρες συντεταγμένες.",
      searchFailed: "Η αναζήτηση της τοποθεσίας απέτυχε.",
      enterProjectName: "Εισαγάγετε όνομα έργου.",
      searchLocationFirst: "Αναζητήστε πρώτα μια τοποθεσία.",
      markBoundary: "Σημειώστε τουλάχιστον 3 σημεία του ορίου του αγροτεμαχίου.",
      completeBoundary: "Ολοκληρώστε πρώτα το όριο του αγροτεμαχίου.",
      title: "Νέο έργο",
      subtitle: "Εντοπίστε το αγροτεμάχιο και σημειώστε το όριό του στον δορυφορικό χάρτη.",
      projectName: "Όνομα έργου",
      projectNamePlaceholder: "Π.χ. Βόρειο χωράφι",
      address: "Διεύθυνση ή ταχυδρομικός κώδικας",
      addressPlaceholder: "Π.χ. 841 01",
      addressHint: "Εισαγάγετε διεύθυνση, δήμο ή ταχυδρομικό κώδικα.",
      locationFound: "✓ Η τοποθεσία βρέθηκε",
      locationFoundHint: "Τώρα κάντε κλικ για να σημειώσετε τις γωνίες του παρακολουθούμενου αγροτεμαχίου.",
      fieldBoundary: "Όριο αγροτεμαχίου",
      pointCount: "Αριθμός σημείων",
      boundaryCompleted: "✓ Το όριο ολοκληρώθηκε",
      status: "Κατάσταση",
      statusMonitoring: "Παρακολούθηση",
      statusActive: "Ενεργό",
      statusCompleted: "Ολοκληρωμένο",
      cancel: "Ακύρωση",
      createProject: "✓ Δημιουργία έργου",
    },
    sv: {
      enterAddress: "Ange en adress eller ett postnummer.",
      geocodingUnavailable: "Geokodningstjänsten svarade inte.",
      locationNotFound: "Platsen kunde inte hittas. Prova en mer exakt adress eller ett postnummer.",
      invalidCoordinates: "Den hittade platsen har inga giltiga koordinater.",
      searchFailed: "Platsen kunde inte sökas fram.",
      enterProjectName: "Ange ett projektnamn.",
      searchLocationFirst: "Sök först efter en plats.",
      markBoundary: "Markera minst 3 punkter längs fältgränsen.",
      completeBoundary: "Slutför fältgränsen först.",
      title: "Nytt projekt",
      subtitle: "Hitta fältet och markera dess gräns på satellitkartan.",
      projectName: "Projektnamn",
      projectNamePlaceholder: "T.ex. Norra fältet",
      address: "Adress eller postnummer",
      addressPlaceholder: "T.ex. 841 01",
      addressHint: "Ange en adress, ort eller ett postnummer.",
      locationFound: "✓ Platsen hittades",
      locationFoundHint: "Klicka nu för att markera hörnen på det övervakade fältet.",
      fieldBoundary: "Fältgräns",
      pointCount: "Antal punkter",
      boundaryCompleted: "✓ Gränsen slutförd",
      status: "Status",
      statusMonitoring: "Övervakning",
      statusActive: "Aktiv",
      statusCompleted: "Slutförd",
      cancel: "Avbryt",
      createProject: "✓ Skapa projekt",
    },
    da: {
      enterAddress: "Indtast en adresse eller et postnummer.",
      geocodingUnavailable: "Geokodningstjenesten svarede ikke.",
      locationNotFound: "Placeringen kunne ikke findes. Prøv en mere præcis adresse eller et postnummer.",
      invalidCoordinates: "Den fundne placering har ikke gyldige koordinater.",
      searchFailed: "Placeringen kunne ikke søges frem.",
      enterProjectName: "Indtast et projektnavn.",
      searchLocationFirst: "Søg først efter en placering.",
      markBoundary: "Markér mindst 3 punkter på markgrænsen.",
      completeBoundary: "Færdiggør først markgrænsen.",
      title: "Nyt projekt",
      subtitle: "Find marken, og markér dens grænse på satellitkortet.",
      projectName: "Projektnavn",
      projectNamePlaceholder: "F.eks. Nordmark",
      address: "Adresse eller postnummer",
      addressPlaceholder: "F.eks. 841 01",
      addressHint: "Indtast en adresse, kommune eller et postnummer.",
      locationFound: "✓ Placering fundet",
      locationFoundHint: "Klik nu for at markere hjørnerne af den overvågede mark.",
      fieldBoundary: "Markgrænse",
      pointCount: "Antal punkter",
      boundaryCompleted: "✓ Grænse færdig",
      status: "Status",
      statusMonitoring: "Overvågning",
      statusActive: "Aktiv",
      statusCompleted: "Afsluttet",
      cancel: "Annuller",
      createProject: "✓ Opret projekt",
    },
    no: {
      enterAddress: "Skriv inn en adresse eller et postnummer.",
      geocodingUnavailable: "Geokodingstjenesten svarte ikke.",
      locationNotFound: "Stedet ble ikke funnet. Prøv en mer presis adresse eller et postnummer.",
      invalidCoordinates: "Det funne stedet har ikke gyldige koordinater.",
      searchFailed: "Stedet kunne ikke søkes opp.",
      enterProjectName: "Skriv inn et prosjektnavn.",
      searchLocationFirst: "Søk først etter et sted.",
      markBoundary: "Marker minst 3 punkter langs feltgrensen.",
      completeBoundary: "Fullfør feltgrensen først.",
      title: "Nytt prosjekt",
      subtitle: "Finn feltet og marker grensen på satellittkartet.",
      projectName: "Prosjektnavn",
      projectNamePlaceholder: "F.eks. Nordfeltet",
      address: "Adresse eller postnummer",
      addressPlaceholder: "F.eks. 841 01",
      addressHint: "Skriv inn en adresse, kommune eller et postnummer.",
      locationFound: "✓ Sted funnet",
      locationFoundHint: "Klikk nå for å markere hjørnene på det overvåkede feltet.",
      fieldBoundary: "Feltgrense",
      pointCount: "Antall punkter",
      boundaryCompleted: "✓ Grense fullført",
      status: "Status",
      statusMonitoring: "Overvåking",
      statusActive: "Aktiv",
      statusCompleted: "Fullført",
      cancel: "Avbryt",
      createProject: "✓ Opprett prosjekt",
    },
    fi: {
      enterAddress: "Anna osoite tai postinumero.",
      geocodingUnavailable: "Geokoodauspalvelu ei vastannut.",
      locationNotFound: "Sijaintia ei löytynyt. Kokeile tarkempaa osoitetta tai postinumeroa.",
      invalidCoordinates: "Löydetyllä sijainnilla ei ole kelvollisia koordinaatteja.",
      searchFailed: "Sijainnin haku epäonnistui.",
      enterProjectName: "Anna projektin nimi.",
      searchLocationFirst: "Hae ensin sijainti.",
      markBoundary: "Merkitse vähintään 3 pellon rajan pistettä.",
      completeBoundary: "Viimeistele ensin pellon raja.",
      title: "Uusi projekti",
      subtitle: "Etsi pelto ja merkitse sen raja satelliittikartalle.",
      projectName: "Projektin nimi",
      projectNamePlaceholder: "Esim. Pohjoislohko",
      address: "Osoite tai postinumero",
      addressPlaceholder: "Esim. 841 01",
      addressHint: "Anna osoite, kunta tai postinumero.",
      locationFound: "✓ Sijainti löytyi",
      locationFoundHint: "Merkitse nyt seurattavan pellon kulmat napsauttamalla.",
      fieldBoundary: "Pellon raja",
      pointCount: "Pisteiden määrä",
      boundaryCompleted: "✓ Raja valmis",
      status: "Tila",
      statusMonitoring: "Seuranta",
      statusActive: "Aktiivinen",
      statusCompleted: "Valmis",
      cancel: "Peruuta",
      createProject: "✓ Luo projekti",
    }
  };

  return copies[language as keyof typeof copies] ?? copies.en;
}

export default function NewProjectModal({
  open,
  latitude,
  longitude,
  onClose,
  onSave,
}: Props) {
  const { language } = useLanguage();
  const copy = getNewProjectCopy(language);

  const [name, setName] = useState("");
  const [status, setStatus] =
    useState("Monitoring");

  const [address, setAddress] =
    useState("");

  const [mapLatitude, setMapLatitude] =
    useState(latitude);

  const [mapLongitude, setMapLongitude] =
    useState(longitude);

  const [boundary, setBoundary] =
    useState<BoundaryPoint[]>([]);

  const [searching, setSearching] =
    useState(false);

  const [locationFound, setLocationFound] =
    useState(false);

  const [boundaryCompleted, setBoundaryCompleted] =
    useState(false);

  if (!open) return null;

  async function findLocation() {
    const query = address.trim();

    if (!query) {
      alert(copy.enterAddress);
      return;
    }

    setSearching(true);
    setLocationFound(false);
    setBoundaryCompleted(false);
    setBoundary([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=cz,sk,de,at,pl&addressdetails=1&q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Accept:
              "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          copy.geocodingUnavailable
        );
      }

      const results = await response.json();

      if (
        !Array.isArray(results) ||
        results.length === 0
      ) {
        alert(copy.locationNotFound);
        return;
      }

      const result = results[0];

      const foundLatitude = Number(
        result.lat
      );

      const foundLongitude = Number(
        result.lon
      );

      if (
        !Number.isFinite(foundLatitude) ||
        !Number.isFinite(foundLongitude)
      ) {
        alert(copy.invalidCoordinates);
        return;
      }

      setMapLatitude(foundLatitude);
      setMapLongitude(foundLongitude);
      setLocationFound(true);
    } catch (error) {
      console.error(
        "CHYBA VYHLEDÁNÍ LOKALITY:",
        error
      );

      alert(copy.searchFailed);
    } finally {
      setSearching(false);
    }
  }

  function handleBoundaryChange(
    nextBoundary: BoundaryPoint[]
  ) {
    setBoundary(nextBoundary);
    setBoundaryCompleted(false);
  }

  function handleBoundaryComplete(
    completedBoundary: BoundaryPoint[]
  ) {
    if (completedBoundary.length < 3) {
      return;
    }

    setBoundary(completedBoundary);
    setBoundaryCompleted(true);
  }

  function calculateCenter(
    points: BoundaryPoint[]
  ) {
    if (points.length === 0) {
      return {
        latitude: mapLatitude,
        longitude: mapLongitude,
      };
    }

    const latitude =
      points.reduce(
        (sum, point) =>
          sum + point.latitude,
        0
      ) / points.length;

    const longitude =
      points.reduce(
        (sum, point) =>
          sum + point.longitude,
        0
      ) / points.length;

    return {
      latitude,
      longitude,
    };
  }

  function handleSave() {
    if (!name.trim()) {
      alert(copy.enterProjectName);
      return;
    }

    if (!locationFound) {
      alert(copy.searchLocationFirst);
      return;
    }

    if (boundary.length < 3) {
      alert(copy.markBoundary);
      return;
    }

    if (!boundaryCompleted) {
      alert(copy.completeBoundary);
      return;
    }

    const center =
      calculateCenter(boundary);

    onSave({
      name: name.trim(),
      latitude: center.latitude,
      longitude: center.longitude,
      status,
      boundary,
    });

    setName("");
    setStatus("Monitoring");
    setAddress("");
    setBoundary([]);
    setLocationFound(false);
    setBoundaryCompleted(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* ================================================= */}
        {/* HLAVIČKA */}
        {/* ================================================= */}

        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-cyan-400">
              {copy.title}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {copy.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-4 py-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* ================================================= */}
        {/* OBSAH */}
        {/* ================================================= */}

        <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          {/* ================================================= */}
          {/* LEVÁ STRANA */}
          {/* ================================================= */}

          <div className="space-y-5">
            {/* NÁZEV */}

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                {copy.projectName}
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder={copy.projectNamePlaceholder}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none transition focus:border-cyan-400"
              />
            </div>

            {/* ADRESA */}

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                {copy.address}
              </label>

              <div className="flex gap-2">
                <input
                  value={address}
                  onChange={(event) =>
                    setAddress(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();
                      findLocation();
                    }
                  }}
                  placeholder={copy.addressPlaceholder}
                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none transition focus:border-cyan-400"
                />

                <button
                  type="button"
                  onClick={findLocation}
                  disabled={searching}
                  className="rounded-xl bg-cyan-500 px-4 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {searching
                    ? "..."
                    : "🔍"}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {copy.addressHint}
              </p>
            </div>

            {/* STAV VYHLEDÁNÍ */}

            {locationFound && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="font-semibold text-emerald-400">
                  {copy.locationFound}
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  {copy.locationFoundHint}
                </div>
              </div>
            )}

            {/* STAV HRANICE */}

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="text-sm text-slate-400">
                {copy.fieldBoundary}
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-slate-300">
                  {copy.pointCount}
                </span>

                <span className="font-bold text-cyan-400">
                  {boundary.length}
                </span>
              </div>

              {boundaryCompleted && (
                <div className="mt-3 font-semibold text-emerald-400">
                  {copy.boundaryCompleted}
                </div>
              )}
            </div>

            {/* STATUS */}

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                {copy.status}
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white outline-none"
              >
                <option value="Monitoring">
                  {copy.statusMonitoring}
                </option>

                <option value="Aktivní">
                  {copy.statusActive}
                </option>

                <option value="Dokončeno">
                  {copy.statusCompleted}
                </option>
              </select>
            </div>
          </div>

          {/* ================================================= */}
          {/* MAPA */}
          {/* ================================================= */}

          <div className="min-h-[500px] overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
            <WorldMap
              drawingMode={locationFound}
              focusLatitude={mapLatitude}
              focusLongitude={mapLongitude}
              onBoundaryChange={
                handleBoundaryChange
              }
              onBoundaryComplete={
                handleBoundaryComplete
              }
              onMapClick={() => {}}
            />
          </div>
        </div>

        {/* ================================================= */}
        {/* PATIČKA */}
        {/* ================================================= */}

        <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-700 px-5 py-2 text-white transition hover:bg-slate-600"
          >
            {copy.cancel}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-cyan-500 px-5 py-2 font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            {copy.createProject}
          </button>
        </div>
      </div>
    </div>
  );
}