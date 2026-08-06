"use client";

import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar() {
  const { language } = useLanguage();

  const text = {
    cs: {
      platform: "Platforma",
      solutions: "Řešení",
      technology: "Technologie",
      company: "Společnost",
      contact: "Kontakt",
      demo: "Požádat o demo",
    },
    en: {
      platform: "Platform",
      solutions: "Solutions",
      technology: "Technology",
      company: "Company",
      contact: "Contact",
      demo: "Request Demo",
    },
  };

  const t = text[language];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">

        {/* Logo */}
        <div className="text-2xl font-bold tracking-widest text-cyan-400">
          AEGRIS
        </div>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#" className="transition hover:text-cyan-400">
            {t.platform}
          </a>

          <a href="#" className="transition hover:text-cyan-400">
            {t.solutions}
          </a>

          <a href="#" className="transition hover:text-cyan-400">
            {t.technology}
          </a>

          <a href="#" className="transition hover:text-cyan-400">
            {t.company}
          </a>

          <a href="#" className="transition hover:text-cyan-400">
            {t.contact}
          </a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">

          <LanguageSwitcher />

          <button className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400">
            {t.demo}
          </button>

        </div>

      </div>
    </header>
  );
}