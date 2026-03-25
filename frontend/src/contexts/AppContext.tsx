import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { DailyStats } from '../types';
import { apiService } from '../services/api';

interface AppContextType {
  language: string;
  setLanguage: (lang: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  userId: string;
  todayStats: DailyStats | null;
  refreshStats: () => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState('ar');
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [userId, setUserId] = useState('default');
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLanguage = await storage.getItem(STORAGE_KEYS.LANGUAGE);
      const savedTheme = await storage.getItem(STORAGE_KEYS.THEME);
      const savedUserId = await storage.getItem(STORAGE_KEYS.USER_ID);

      if (savedLanguage) setLanguageState(savedLanguage);
      if (savedTheme) setThemeState(savedTheme);
      if (savedUserId) setUserId(savedUserId);
      else {
        const newUserId = `user_${Date.now()}`;
        await storage.setItem(STORAGE_KEYS.USER_ID, newUserId);
        setUserId(newUserId);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const stats = await apiService.getTodayStats();
      setTodayStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    await storage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  const setTheme = async (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    await storage.setItem(STORAGE_KEYS.THEME, newTheme);
  };

  const refreshStats = async () => {
    await loadStats();
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        userId,
        todayStats,
        refreshStats,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
