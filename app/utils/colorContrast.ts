const HEX_COLOR_PATTERN = /^[\da-f]{6}$/i

function normalizeHexColor(color?: string | null) {
  if (!color) return null
  const trimmed = color.trim().replace(/^#/, '')
  const expanded =
    trimmed.length === 3
      ? trimmed
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : trimmed
  if (!HEX_COLOR_PATTERN.test(expanded)) return null
  return `#${expanded.toUpperCase()}`
}

function channelToLinear(value: number) {
  const normalized = value / 255
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(color?: string | null) {
  const normalized = normalizeHexColor(color)
  if (!normalized) return 1
  const r = channelToLinear(Number.parseInt(normalized.slice(1, 3), 16))
  const g = channelToLinear(Number.parseInt(normalized.slice(3, 5), 16))
  const b = channelToLinear(Number.parseInt(normalized.slice(5, 7), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(
  foreground?: string | null,
  background?: string | null,
) {
  const foregroundLuminance = relativeLuminance(foreground)
  const backgroundLuminance = relativeLuminance(background)
  const brightest = Math.max(foregroundLuminance, backgroundLuminance)
  const darkest = Math.min(foregroundLuminance, backgroundLuminance)
  return (brightest + 0.05) / (darkest + 0.05)
}

export function isDarkPageBackground(background?: string | null) {
  return relativeLuminance(background) < 0.35
}

export function readableTextColor(
  background?: string | null,
  preferred = '#0F172A',
  minimumContrast = 4.5,
) {
  const candidates = [
    preferred,
    '#0F172A',
    '#111827',
    '#E5E7EB',
    '#F8FAFC',
    '#FFFFFF',
  ]
  const passing = candidates.find(
    (candidate) => contrastRatio(candidate, background) >= minimumContrast,
  )
  if (passing) return passing
  return [...candidates].sort(
    (a, b) => contrastRatio(b, background) - contrastRatio(a, background),
  )[0]
}

export function readableMutedTextColor(
  background?: string | null,
  preferred = '#64748B',
) {
  return readableTextColor(background, preferred, 3.2)
}
