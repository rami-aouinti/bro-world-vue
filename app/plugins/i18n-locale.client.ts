// app/plugins/i18n-locale.client.ts
const STORAGE_KEY = 'app-locale'
const FALLBACK_LOCALE = 'en'
const SUPPORTED_LOCALES = new Set(['en', 'de', 'fr'])

export default defineNuxtPlugin((nuxtApp) => {
  const locale = nuxtApp.$i18n.locale // Ref<string>

  const storedLocale = localStorage.getItem(STORAGE_KEY)
  const initialLocale =
    storedLocale && SUPPORTED_LOCALES.has(storedLocale)
      ? storedLocale
      : FALLBACK_LOCALE

  locale.value = initialLocale
  localStorage.setItem(STORAGE_KEY, initialLocale)
  document.documentElement.lang = initialLocale

  watch(
    locale,
    (nextLocale) => {
      const normalizedLocale = SUPPORTED_LOCALES.has(nextLocale)
        ? nextLocale
        : FALLBACK_LOCALE

      if (locale.value !== normalizedLocale) {
        locale.value = normalizedLocale
        return
      }

      localStorage.setItem(STORAGE_KEY, normalizedLocale)
      document.documentElement.lang = normalizedLocale
    },
    { immediate: true },
  )
})
