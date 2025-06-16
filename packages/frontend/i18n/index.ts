import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enUS from './locales/en-US.json';
import esES from './locales/es-ES.json';
import frFR from './locales/fr-FR.json';
import deDE from './locales/de-DE.json';
import ptBR from './locales/pt-BR.json';
import zhCN from './locales/zh-CN.json';

const LANGUAGE_STORAGE_KEY = 'user_language';

const resources = {
  'en-US': { translation: enUS },
  'es-ES': { translation: esES },
  'fr-FR': { translation: frFR },
  'de-DE': { translation: deDE },
  'pt-BR': { translation: ptBR },
  'zh-CN': { translation: zhCN },
};

// Check if we're in a React Native environment
const isReactNative = () => {
  return typeof global !== 'undefined' && 
         global.navigator && 
         global.navigator.product === 'ReactNative';
};

// Check if we're in a browser environment
const isBrowser = () => {
  return typeof window !== 'undefined';
};

// Async function to get AsyncStorage safely
const getAsyncStorage = async () => {
  if (isReactNative()) {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      return AsyncStorage;
    } catch (error) {
      console.warn('AsyncStorage not available:', error);
      return null;
    }
  }
  return null;
};

// Custom language detector that works across environments
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Try to get saved language from AsyncStorage in React Native
      if (isReactNative()) {
        const AsyncStorage = await getAsyncStorage();
        if (AsyncStorage) {
          const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
          if (savedLanguage) {
            callback(savedLanguage);
            return;
          }
        }
      }
      // Try to get saved language from localStorage in browser
      else if (isBrowser() && typeof localStorage !== 'undefined') {
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage) {
          callback(savedLanguage);
          return;
        }
      }
    } catch (error) {
      console.warn('Error loading saved language:', error);
    }
    
    // Fall back to default language
    callback('en-US');
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      // Save to AsyncStorage in React Native
      if (isReactNative()) {
        const AsyncStorage = await getAsyncStorage();
        if (AsyncStorage) {
          await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
        }
      }
      // Save to localStorage in browser
      else if (isBrowser() && typeof localStorage !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
      }
    } catch (error) {
      console.warn('Error saving language preference:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en-US',
    debug: typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

export default i18n;

// Export available languages for settings UI
export const availableLanguages = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'zh-CN', name: '中文 (简体)', flag: '🇨🇳' },
];

// Helper function to change language
export const changeLanguage = (languageCode: string) => {
  return i18n.changeLanguage(languageCode);
};