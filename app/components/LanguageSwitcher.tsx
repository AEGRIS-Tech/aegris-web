"use client";

import {
  languageLabels,
  supportedLanguages,
  type Language,
  useLanguage,
} from "../context/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="aegris-language"
        className="sr-only"
      >
        Jazyk systému
      </label>

      <select
        id="aegris-language"
        value={language}
        onChange={(event) =>
          setLanguage(
            event.target.value as Language
          )
        }
        className="rounded-xl border border-white/[0.08] bg-[#0a1016] px-3 py-2 text-[10px] font-bold text-slate-300 outline-none transition hover:border-cyan-300/20 focus:border-cyan-300/30"
      >
        {supportedLanguages.map((lang) => (
          <option
            key={lang}
            value={lang}
            className="bg-[#0a1016] text-slate-200"
          >
            {languageLabels[lang]}
          </option>
        ))}
      </select>
    </div>
  );
}