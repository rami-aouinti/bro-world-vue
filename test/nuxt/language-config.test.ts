import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import nuxtConfig from '../../nuxt.config'
import i18nOptions from '../../i18n.config'

type I18nNuxtLocale = {
  code: string
}

type VueI18nOptions = {
  locale?: string
  fallbackLocale?: string
}

function resolveVueI18nOptions(configOrFactory: unknown): VueI18nOptions {
  if (typeof configOrFactory === 'function') {
    return (configOrFactory as () => VueI18nOptions)()
  }

  return (configOrFactory ?? {}) as VueI18nOptions
}

describe('language configuration', () => {
  it('keeps en/fr/es/de locales with en as default in nuxt config', () => {
    const i18nConfig = nuxtConfig.i18n as { locales?: I18nNuxtLocale[]; defaultLocale?: string }

    const localeCodes = (i18nConfig.locales ?? []).map((locale) => locale.code)

    expect(localeCodes).toEqual(['en', 'fr', 'es', 'de'])
    expect(i18nConfig.defaultLocale).toBe('en')
  })

  it('keeps locale and fallbackLocale to en in i18n config', () => {
    const config = resolveVueI18nOptions(i18nOptions)

    expect(config.locale).toBe('en')
    expect(config.fallbackLocale).toBe('en')
  })

  it('defines EN/FR/ES/DE options in the language switcher component', () => {
    const source = readFileSync('app/components/App/AppLanguageSwitcher.vue', 'utf-8')

    expect(source).toContain("value: 'en'")
    expect(source).toContain("value: 'fr'")
    expect(source).toContain("value: 'es'")
    expect(source).toContain("value: 'de'")
  })
})
