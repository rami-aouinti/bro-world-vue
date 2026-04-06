// app/plugins/i18n-locale.client.ts
import type { Ref } from 'vue'

const STORAGE_KEY = 'app-locale'
const FALLBACK_LOCALE = 'en'
const SUPPORTED_LOCALES = new Set(['en', 'de', 'fr', 'es'])

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = nuxtApp.$i18n as {
    locale: Ref<string>
    setLocale: (locale: string) => Promise<void>
  }
  const { locale, setLocale } = i18n

  const normalizeLocale = (requestedLocale: string) =>
    SUPPORTED_LOCALES.has(requestedLocale) ? requestedLocale : FALLBACK_LOCALE

  const syncLocale = async (requestedLocale: string) => {
    const normalizedLocale = normalizeLocale(requestedLocale)

    if (locale.value !== normalizedLocale) {
      await setLocale(normalizedLocale)
    }

    localStorage.setItem(STORAGE_KEY, normalizedLocale)
    document.documentElement.lang = normalizedLocale
  }

  const storedLocale = localStorage.getItem(STORAGE_KEY)
  void syncLocale(storedLocale ?? FALLBACK_LOCALE)

  watch(locale, (nextLocale) => {
    const normalizedLocale = normalizeLocale(nextLocale)
    localStorage.setItem(STORAGE_KEY, normalizedLocale)
    document.documentElement.lang = normalizedLocale
  })
})
