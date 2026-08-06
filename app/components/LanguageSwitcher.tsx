"use client";

import { useLanguage } from "../context/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setLanguage("cs")}
        className={`px-2 py-1 rounded ${
          language === "cs"
            ? "bg-cyan-500 text-white"
            : "text-gray-300 hover:text-white"
        }`}
      >
        🇨🇿 CZ
      </button>

      <button
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 rounded ${
          language === "en"
            ? "bg-cyan-500 text-white"
            : "text-gray-300 hover:text-white"
        }`}
      >
        🇬🇧 EN
      </button>
    </div>
  );
}