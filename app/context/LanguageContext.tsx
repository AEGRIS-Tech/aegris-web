"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getLegacyTranslation,
  type LegacyTranslation,
} from "./translations";

export const supportedLanguages = [
  "cs",
  "en",
  "sk",
  "de",
  "pl",
  "fr",
  "es",
  "it",
  "nl",
  "pt",
  "ro",
  "hu",
  "uk",
  "bg",
  "hr",
  "sl",
  "lt",
  "lv",
  "et",
  "el",
  "sv",
  "da",
  "no",
  "fi",
] as const;

export type Language = (typeof supportedLanguages)[number];

export const languageLabels: Record<Language, string> = {
  cs: "Čeština",
  en: "English",
  sk: "Slovenčina",
  de: "Deutsch",
  pl: "Polski",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  nl: "Nederlands",
  pt: "Português",
  ro: "Română",
  hu: "Magyar",
  uk: "Українська",
  bg: "Български",
  hr: "Hrvatski",
  sl: "Slovenščina",
  lt: "Lietuvių",
  lv: "Latviešu",
  et: "Eesti",
  el: "Ελληνικά",
  sv: "Svenska",
  da: "Dansk",
  no: "Norsk",
  fi: "Suomi",
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: LegacyTranslation;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: getLegacyTranslation("en"),
});

function isSupportedLanguage(value: string | null): value is Language {
  return supportedLanguages.includes(value as Language);
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "en";
  }

  const savedLanguage = window.localStorage.getItem("language");

  if (isSupportedLanguage(savedLanguage)) {
    return savedLanguage;
  }

  const browserLanguage = window.navigator.language
    .toLowerCase()
    .split("-")[0];

  if (isSupportedLanguage(browserLanguage)) {
    return browserLanguage;
  }

  return "en";
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    window.localStorage.setItem("language", language);
    document.documentElement.lang = language;
  }, [language]);

  const translation = useMemo(
    () => getLegacyTranslation(language),
    [language],
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translation,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
