import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

const i18n = new I18n({ fr, en });
i18n.defaultLocale = 'fr';
i18n.enableFallback = true;

interface I18nContextType {
  locale: string;
  t: (key: string, options?: any) => string;
  setLocale: (locale: string) => void;
  availableLocales: string[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [locale, setLocaleState] = useState('fr');

  useEffect(() => {
    loadLocale();
  }, []);

  const loadLocale = async () => {
    try {
      const savedLocale = await AsyncStorage.getItem('locale');
      if (savedLocale && ['fr', 'en'].includes(savedLocale)) {
        setLocaleState(savedLocale);
        i18n.locale = savedLocale;
      }
    } catch (error) {
      console.error('Error loading locale:', error);
    }
  };

  const setLocale = async (newLocale: string) => {
    try {
      await AsyncStorage.setItem('locale', newLocale);
      setLocaleState(newLocale);
      i18n.locale = newLocale;
    } catch (error) {
      console.error('Error saving locale:', error);
    }
  };

  const t = (key: string, options?: any) => {
    return i18n.t(key, options);
  };

  // Always provide i18n, even while loading

  const value = {
    locale,
    t,
    setLocale,
    availableLocales: ['fr', 'en'],
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
