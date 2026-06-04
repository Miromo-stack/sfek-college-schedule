import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru';
import kk from './locales/kk';
import en from './locales/en';

const savedLanguage = localStorage.getItem('language') || 'ru';

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    kk: { translation: kk },
    en: { translation: en },
  },
  lng: savedLanguage,
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
});

export default i18n;
