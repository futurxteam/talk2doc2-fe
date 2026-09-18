import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import i18n from "../i18n"; // ✅ IMPORT i18n

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  // Load saved language
  const [language, setLanguage] = useState(Cookies.get("lang") || "en");

  // 🔥 Sync LanguageContext → i18n
  useEffect(() => {
    i18n.changeLanguage(language);
    Cookies.set("lang", language, { expires: 365, sameSite: "strict" });
  }, [language]);

  const toggleLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
