import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from '../locales/en/translation.json';
import hi from '../locales/hi/translation.json';
import ta from '../locales/ta/translation.json';
import fr from '../locales/fr/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      hi: {
        translation: hi,
      },
      ta: {
        translation: ta,
      },
      fr: {
        translation: fr,
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
