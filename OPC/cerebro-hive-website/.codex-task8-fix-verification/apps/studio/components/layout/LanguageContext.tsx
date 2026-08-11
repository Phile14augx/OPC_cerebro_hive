"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Locale } from "@/lib/translations";

interface LanguageContextType {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Locale>("en");

  // Load persisted language from localStorage on client side asynchronously
  useEffect(() => {
    const savedLang = localStorage.getItem("cerebrohive_lang") as Locale;
    if (savedLang && (savedLang === "en" || savedLang === "es" || savedLang === "de")) {
      const timer = setTimeout(() => {
        setLanguageState(savedLang);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Update HTML element lang attribute and persist in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = language;
      localStorage.setItem("cerebrohive_lang", language);
    }
  }, [language]);

  const setLanguage = (lang: Locale) => {
    setLanguageState(lang);
  };

  // Safe nested translation resolver
  const t = (key: string): string => {
    const keys = key.split(".");
    let current: unknown = translations[language];

    for (const k of keys) {
      if (current && typeof current === "object" && current !== null && k in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[k];
      } else {
        // Fallback to English dictionary if key is missing in active locale
        let fallback: unknown = translations["en"];
        for (const fk of keys) {
          if (fallback && typeof fallback === "object" && fallback !== null && fk in (fallback as Record<string, unknown>)) {
            fallback = (fallback as Record<string, unknown>)[fk];
          } else {
            return key;
          }
        }
        return typeof fallback === "string" ? fallback : key;
      }
    }

    return typeof current === "string" ? current : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
