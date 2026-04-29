import { describe, expect, it } from 'vitest'
import {
  isImageFlag,
  resolveLanguageFallback,
  resolveLanguageFlagClass,
  resolveLanguageFlagSrc,
  toFlagEmoji,
} from '~/utils/resumeLanguageFlags'

describe('resumeLanguageFlags', () => {
  it('converts valid country codes to emoji flags', () => {
    expect(toFlagEmoji('fr')).toBe('🇫🇷')
    expect(toFlagEmoji(' US ')).toBe('🇺🇸')
  })

  it('returns empty emoji for invalid country codes', () => {
    expect(toFlagEmoji('')).toBe('')
    expect(toFlagEmoji('fra')).toBe('')
    expect(toFlagEmoji('1a')).toBe('')
  })

  it('detects explicit image flags (url/path/data-uri)', () => {
    expect(isImageFlag('https://cdn.example.com/fr.svg')).toBe(true)
    expect(isImageFlag('/images/flags/fr.svg')).toBe(true)
    expect(isImageFlag('data:image/svg+xml;base64,AAA')).toBe(true)
    expect(isImageFlag('🇫🇷')).toBe(false)
  })

  it('resolves image src from explicit image or country code', () => {
    expect(resolveLanguageFlagSrc({ flag: 'https://cdn.example.com/fr.svg' })).toBe('https://cdn.example.com/fr.svg')
    expect(resolveLanguageFlagSrc({ countryCode: 'FR' })).toBe('/images/flags/fr.svg')
    expect(resolveLanguageFlagSrc({ countryCode: 'fra' })).toBe('')
    expect(resolveLanguageFlagSrc({ flag: '🇫🇷', countryCode: '' })).toBe('')
  })

  it('resolves icon class only for valid 2-letter country codes', () => {
    expect(resolveLanguageFlagClass({ countryCode: 'fr' })).toBe('fi fi-fr')
    expect(resolveLanguageFlagClass({ countryCode: 'FR' })).toBe('fi fi-fr')
    expect(resolveLanguageFlagClass({ countryCode: 'fra' })).toBe('')
  })

  it('resolves fallback to explicit non-image flag then emoji', () => {
    expect(resolveLanguageFallback({ flag: '🇧🇪', countryCode: 'BE' })).toBe('🇧🇪')
    expect(resolveLanguageFallback({ flag: ' Français ', countryCode: 'FR' })).toBe('Français')
    expect(resolveLanguageFallback({ flag: 'https://cdn.example.com/fr.svg', countryCode: 'FR' })).toBe('🇫🇷')
    expect(resolveLanguageFallback({ countryCode: 'zz' })).toBe('🇿🇿')
    expect(resolveLanguageFallback({ countryCode: 'x' })).toBe('')
  })
})
