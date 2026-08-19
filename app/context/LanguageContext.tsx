"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { translations } from "./translations";

type Language = "cs" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations[Language];
}

const LanguageContext =
  createContext<LanguageContextType>({
    language: "en",
    setLanguage: () => {},
    t: translations.en,
  });

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "en";
  }

  const saved =
    localStorage.getItem("language");

  if (
    saved === "cs" ||
    saved === "en"
  ) {
    return saved;
  }

  const browser =
    navigator.language.toLowerCase();

  if (
    browser.startsWith("cs") ||
    browser.startsWith("sk")
  ) {
    return "cs";
  }

  return "en";
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] =
    useState<Language>(
      getInitialLanguage
    );

  useEffect(() => {
    localStorage.setItem(
      "language",
      language
    );
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}