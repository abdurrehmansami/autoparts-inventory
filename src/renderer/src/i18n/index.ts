import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { Language } from '@shared/schemas/settings'
import en from './en.json'
import ur from './ur.json'

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ur: { translation: ur } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

/** Switch UI language and mirror the layout for Urdu. */
export function applyLanguage(lang: Language): void {
  void i18n.changeLanguage(lang)
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr'
}

export default i18n
