import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

// Import all locale files
import ar from './locales/ar.json';
import en from './locales/en.json';
import tr from './locales/tr.json';
import fr from './locales/fr.json';

import { LANGUAGES, isRTLLanguage } from './languages';

const LANGUAGE_STORAGE_KEY = '@app_language';

// Resources object with all translations
const resources = {
  ar: { translation: ar },
  en: { translation: en },
  tr: { translation: tr },
  fr: { translation: fr },
};

// Get saved language or detect from device
const getInitialLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && LANGUAGES.find(lang => lang.code === savedLanguage)) {
      console.log('Using saved language:', savedLanguage);
      return savedLanguage;
    }
  } catch (error) {
    console.log('Error getting saved language:', error);
  }

  // Default to Arabic for first-time users
  // This ensures Arabic is the primary language
  console.log('No saved language found, defaulting to Arabic');
  return 'ar';
};

// Initialize i18n
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();
  console.log('Initializing i18n with language:', initialLanguage);

  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'ar', // Changed to Arabic as fallback
      compatibilityJSON: 'v4',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });

  return initialLanguage;
};

// Change language function
export const changeLanguage = async (languageCode: string): Promise<void> => {
  try {
    // Save to storage
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    
    // Change i18n language
    await i18n.changeLanguage(languageCode);
    
    // Handle RTL/LTR
    const isRTL = isRTLLanguage(languageCode);
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      // Note: App needs to restart for RTL changes to take full effect
    }
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Get current language
export const getCurrentLanguage = (): string => {
  return i18n.language || 'ar';
};

// Check if language selection needed (first launch)
export const needsLanguageSelection = async (): Promise<boolean> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return savedLanguage === null;
  } catch (error) {
    return true;
  }
};

export { initI18n };
export default i18n;
