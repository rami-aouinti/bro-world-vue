export type ResumeLanguageLike = {
  flag?: unknown
  countryCode?: unknown
}

export function toFlagEmoji(countryCode: string) {
  const normalized = countryCode.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(normalized)) return ''
  return normalized
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('')
}

export function isImageFlag(value: string) {
  return /^(https?:\/\/|\/|data:image\/)/i.test(value)
}

export function resolveLanguageFlagSrc(language: ResumeLanguageLike) {
  const explicitFlag = String(language.flag || '').trim()
  if (explicitFlag && isImageFlag(explicitFlag)) return explicitFlag

  const countryCode = String(language.countryCode || '').trim().toLowerCase()
  if (!/^[a-z]{2}$/.test(countryCode)) return ''

  return `/images/flags/${countryCode}.svg`
}

export function resolveLanguageFlagClass(language: ResumeLanguageLike) {
  const countryCode = String(language.countryCode || '').trim().toLowerCase()
  if (!/^[a-z]{2}$/.test(countryCode)) return ''
  return `fi fi-${countryCode}`
}

export function resolveLanguageFallback(language: ResumeLanguageLike) {
  const explicitFlag = String(language.flag || '').trim()
  if (explicitFlag && !isImageFlag(explicitFlag)) return explicitFlag

  const countryCode = String(language.countryCode || '').trim()
  return toFlagEmoji(countryCode) || ''
}
