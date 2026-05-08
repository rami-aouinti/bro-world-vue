type ResumePaletteLike = {
  primary?: string
  secondary?: string
  text?: string
  muted?: string
  pageBackground?: string
  [key: string]: unknown
}

const DARK_BACKGROUND_LUMINANCE = 0.42
const LIGHT_TEXT = '#F8FAFC'
const LIGHT_MUTED_TEXT = '#CBD5E1'

function parseHexColor(color: unknown): [number, number, number] | null {
  if (typeof color !== 'string') return null
  const value = color.trim()
  const hexMatch = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!hexMatch) return null

  const hex = hexMatch[1]
  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : hex

  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  return [red, green, blue]
}

function toLinearChannel(channel: number): number {
  const normalized = channel / 255
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4
}

export function getColorLuminance(color: unknown): number | null {
  const rgb = parseHexColor(color)
  if (!rgb) return null

  const [red, green, blue] = rgb.map(toLinearChannel)
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

export function isDarkResumePageBackground(color: unknown): boolean {
  const luminance = getColorLuminance(color)
  return luminance !== null && luminance < DARK_BACKGROUND_LUMINANCE
}

export function readableTextColorForBackground(
  background: unknown,
  darkText = '#0F172A',
): string {
  return isDarkResumePageBackground(background) ? LIGHT_TEXT : darkText
}

export function readableMutedColorForBackground(
  background: unknown,
  mutedText = '#64748B',
): string {
  return isDarkResumePageBackground(background) ? LIGHT_MUTED_TEXT : mutedText
}

export function applyReadablePageTextColors<T extends ResumePaletteLike>(
  palette: T,
): T {
  if (!isDarkResumePageBackground(palette.pageBackground)) return palette

  return {
    ...palette,
    text: LIGHT_TEXT,
    muted: LIGHT_MUTED_TEXT,
  }
}
