const minuteMs = 60 * 1000
const hourMs = 60 * minuteMs
const dayMs = 24 * hourMs
const weekMs = 7 * dayMs
const yearMs = 365 * dayMs

type RelativeUnit = Intl.RelativeTimeFormatUnit

export function formatRelativeTime(
  locale: string,
  input: Date | string | number | null | undefined,
  fallback = '',
): string {
  if (!input) {
    return fallback
  }

  const date = input instanceof Date ? input : new Date(input)
  const timestamp = date.getTime()

  if (Number.isNaN(timestamp)) {
    return fallback
  }

  const diffMs = timestamp - Date.now()
  const absDiffMs = Math.abs(diffMs)

  let unit: RelativeUnit = 'minute'
  let value = Math.round(diffMs / minuteMs)

  if (absDiffMs >= yearMs) {
    unit = 'year'
    value = Math.round(diffMs / yearMs)
  }
  else if (absDiffMs >= weekMs) {
    unit = 'week'
    value = Math.round(diffMs / weekMs)
  }
  else if (absDiffMs >= dayMs) {
    unit = 'day'
    value = Math.round(diffMs / dayMs)
  }
  else if (absDiffMs >= hourMs) {
    unit = 'hour'
    value = Math.round(diffMs / hourMs)
  }

  if (value === 0) {
    return fallback
  }

  return new Intl.RelativeTimeFormat(locale, {
    numeric: 'always',
    style: 'short',
  }).format(value, unit)
}
