import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

type LanguageContextType = {
  locale: string;
  setLanguage: (lang: string) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLanguage: async () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<string>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('user_language');
        if (storedLanguage) {
          i18n.locale = storedLanguage;
          setLocale(storedLanguage);
        } else {
          i18n.locale = 'en';
          setLocale('en');
        }
      } catch (error) {
        console.error('Failed to load language', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: string) => {
    try {
      await AsyncStorage.setItem('user_language', lang);
      i18n.locale = lang;
      setLocale(lang);
    } catch (error) {
      console.error('Failed to save language', error);
    }
  };

  if (!isLoaded) {
    return null; // Or a loading spinner if preferred
  }

  return (
    <LanguageContext.Provider value={{ locale, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
