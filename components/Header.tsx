"use client";
import { useLanguage } from "@/context/LanguageContext";

export default function Header() {
  const { lang, toggleLang } = useLanguage();

  return (
    <header className="fixed top-0 left-0 w-full p-6 md:p-12 z-40 mix-blend-difference text-white flex justify-between items-center pointer-events-auto">
        <img src="/branca.png" alt="REXIUM" className="h-12 w-auto md:h-26 object-contain" />
      <button  
        onClick={toggleLang}
        className="text-[10px] md:text-xs font-mono tracking-[0.2em] uppercase hover:opacity-50 transition-opacity"
      >
        {lang === "pt" ? "EN" : "PT"}
      </button>
    </header>
  );
}
