"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getTranslation } from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";

type Language = "en" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "site_language";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
  return stored === "zh" ? "zh" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { user, updateUser } = useAuth();
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // 用户登录后，从用户信息初始化语言
  useEffect(() => {
    if (user?.language) {
      const userLang = user.language === "zh" ? "zh" : "en";
      setLanguageState(userLang);
      localStorage.setItem(STORAGE_KEY, userLang);
      document.documentElement.lang = userLang;
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;

    // 如果用户已登录，同步到后端
    if (user) {
      try {
        await updateUser({ language: lang });
      } catch (error) {
        console.error("Failed to save language preference:", error);
      }
    }
  }, [user, updateUser]);

  const toggleLanguage = useCallback(() => {
    const next = language === "en" ? "zh" : "en";
    setLanguage(next);
  }, [language, setLanguage]);

  const t = useCallback(
    (key: string) => getTranslation(language, key),
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
