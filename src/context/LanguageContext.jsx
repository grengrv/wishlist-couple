import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "@utils/translations";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("lang") || (navigator.language.startsWith("vi") ? "vi" : "en");
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key, params = {}) => {
    let text = translations[lang]?.[key] || translations["en"]?.[key] || key;
    
    // Handle parameters like {{name}}
    Object.keys(params).forEach(k => {
      text = text.replace(new RegExp(`{{${k}}}`, 'g'), params[k]);
    });
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
