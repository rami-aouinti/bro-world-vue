const TEXT_LEVEL_TO_STARS: Record<string, number> = {
  beginner: 1,
  intermediate: 3,
  advanced: 4,
  native: 5,
  bilingual: 5,
  'native / bilingual': 5,
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeTextLevel(level: string) {
  return level.trim().toLowerCase()
}

function starsToLabel(stars: number) {
  if (stars <= 1) return 'Beginner'
  if (stars <= 3) return 'Intermediate'
  if (stars <= 4) return 'Advanced'
  return 'Native'
}

export function levelPercentToStars(percent: number) {
  const boundedPercent = clamp(Number(percent) || 0, 0, 100)
  return clamp(Math.round(boundedPercent / 20), 1, 5)
}

export function levelTextToStars(level: string) {
  return TEXT_LEVEL_TO_STARS[normalizeTextLevel(level)] ?? 1
}

export function levelToStars(level: number | string) {
  if (typeof level === 'string') {
    const asNumber = Number(level)
    if (!Number.isNaN(asNumber)) {
      return asNumber <= 5
        ? clamp(Math.round(asNumber), 1, 5)
        : levelPercentToStars(asNumber)
    }
    return levelTextToStars(level)
  }

  return level <= 5
    ? clamp(Math.round(level), 1, 5)
    : levelPercentToStars(level)
}

export function starsToPercent(stars: number) {
  return clamp(Math.round(stars), 1, 5) * 20
}

export function levelToPercent(level: number | string) {
  if (typeof level === 'string') {
    const asNumber = Number(level)
    if (!Number.isNaN(asNumber)) {
      return asNumber <= 5
        ? starsToPercent(asNumber)
        : clamp(Math.round(asNumber), 0, 100)
    }
    return starsToPercent(levelTextToStars(level))
  }

  return level <= 5
    ? starsToPercent(level)
    : clamp(Math.round(level), 0, 100)
}

export function levelToText(level: number | string) {
  if (typeof level === 'string' && Number.isNaN(Number(level))) {
    const normalized = normalizeTextLevel(level)
    if (normalized in TEXT_LEVEL_TO_STARS) {
      return starsToLabel(TEXT_LEVEL_TO_STARS[normalized])
    }
  }
  return starsToLabel(levelToStars(level))
}
