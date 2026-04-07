import {
  de as vuetifyDe,
  en as vuetifyEn,
  es as vuetifyEs,
  fr as vuetifyFr,
} from 'vuetify/locale'

const VUETIFY_LOCALE_MESSAGES = {
  en: vuetifyEn,
  fr: vuetifyFr,
  es: vuetifyEs,
  de: vuetifyDe,
} as const

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = nuxtApp.$i18n as {
    mergeLocaleMessage: (locale: string, message: unknown) => void
  }

  for (const [locale, vuetifyMessages] of Object.entries(
    VUETIFY_LOCALE_MESSAGES,
  )) {
    i18n.mergeLocaleMessage(locale, { $vuetify: vuetifyMessages })
  }
})
