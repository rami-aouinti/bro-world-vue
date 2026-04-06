// app/plugins/i18n-locale.client.ts
const STORAGE_KEY = 'app-locale'
const FALLBACK_LOCALE = 'en'
const SUPPORTED_LOCALES = new Set(['en', 'de', 'fr', 'es'])

export default defineNuxtPlugin((nuxtApp) => {
  const { locale, setLocale } = nuxtApp.$i18n

  const syncLocale = async (requestedLocale: string) => {
    const normalizedLocale = SUPPORTED_LOCALES.has(requestedLocale)
      ? requestedLocale
      : FALLBACK_LOCALE

    await setLocale(normalizedLocale)

    localStorage.setItem(STORAGE_KEY, normalizedLocale)
    document.documentElement.lang = normalizedLocale
  }

  const storedLocale = localStorage.getItem(STORAGE_KEY)
  void syncLocale(storedLocale ?? FALLBACK_LOCALE)

  watch(locale, (nextLocale) => {
    void syncLocale(nextLocale)
  })
})
