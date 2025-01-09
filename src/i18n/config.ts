import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en } from './locales/en';
import { th } from './locales/th';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { 
        translation: en,
        'en-US': en  // Add this for US English support
      },
      th: { 
        translation: th,
        'th-TH': th  // Add this for Thai support
      }
    },
    fallbackLng: {
      'en-US': ['en'],
      'th-TH': ['th'],
      default: ['en']
    },
    supportedLngs: ['en', 'th', 'en-US', 'th-TH'],
    load: 'languageOnly',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    }
  });

// Set default language if none is set
if (!localStorage.getItem('i18nextLng')) {
  localStorage.setItem('i18nextLng', 'en');
}

export default i18n;