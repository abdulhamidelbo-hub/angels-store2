import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changeLanguage, getCurrentLanguage, needsLanguageSelection } from '../i18n';
import { Language, LANGUAGES, getLanguageByCode, isRTLLanguage } from '../i18n/languages';

interface LanguageContextType {
  currentLanguage: Language | undefined;
  isRTL: boolean;
  showLanguageSelector: boolean;
  setShowLanguageSelector: (show: boolean) => void;
  changeAppLanguage: (code: string) => Promise<void>;
  needsRestart: boolean;
  setNeedsRestart: (needs: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language | undefined>(
    getLanguageByCode(getCurrentLanguage())
  );
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [needsRestart, setNeedsRestart] = useState(false);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    const lang = getLanguageByCode(i18n.language);
    setCurrentLanguage(lang);
    setIsRTL(isRTLLanguage(i18n.language));
  }, [i18n.language]);

  const checkFirstLaunch = async () => {
    const needsSelection = await needsLanguageSelection();
    if (needsSelection) {
      setShowLanguageSelector(true);
    }
  };

  const changeAppLanguage = async (code: string) => {
    const wasRTL = isRTL;
    const willBeRTL = isRTLLanguage(code);

    await changeLanguage(code);
    
    const lang = getLanguageByCode(code);
    setCurrentLanguage(lang);
    setIsRTL(willBeRTL);

    // Check if RTL direction changed - needs app restart
    if (wasRTL !== willBeRTL) {
      setNeedsRestart(true);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        isRTL,
        showLanguageSelector,
        setShowLanguageSelector,
        changeAppLanguage,
        needsRestart,
        setNeedsRestart,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
