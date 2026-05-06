type ResumeGoogleFontSource = {
  fontFamily?: unknown
  fallback?: unknown
  googleFonts?: unknown
  fonts?: unknown
  textStyles?: unknown
  typography?: unknown
}

const fallbackStacks: Record<string, string> = {
  sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"Fira Code", "Courier New", monospace',
  display: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

function normalizeFontName(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function uniqueFontNames(fonts: string[]) {
  return Array.from(new Set(fonts.map((font) => font.trim()).filter(Boolean)))
}

export function resolveResumeTextFont(style: unknown, fallback: 'sans' | 'serif' | 'mono' | 'display' = 'sans') {
  if (style && typeof style === 'object') {
    const token = style as ResumeGoogleFontSource
    const fontFamily = normalizeFontName(token.fontFamily)
    const fallbackKey = normalizeFontName(token.fallback) as keyof typeof fallbackStacks
    const fallbackStack = fallbackStacks[fallbackKey] || fallbackStacks[fallback]
    if (fontFamily) return `"${fontFamily}", ${fallbackStack}`
  }

  const legacyStyle = normalizeFontName(style)
  if (legacyStyle === 'serif' || legacyStyle === 'roman') return fallbackStacks.serif
  if (legacyStyle === 'mono') return fallbackStacks.mono
  if (legacyStyle && !['sans', 'italic'].includes(legacyStyle)) return `"${legacyStyle}", ${fallbackStacks[fallback]}`
  return fallbackStacks[fallback]
}

export function collectResumeGoogleFontFamilies(template: unknown) {
  if (!template || typeof template !== 'object') return []

  const source = template as ResumeGoogleFontSource
  const typography = source.typography && typeof source.typography === 'object'
    ? source.typography as ResumeGoogleFontSource
    : undefined
  const fonts = typography?.fonts && typeof typography.fonts === 'object'
    ? Object.values(typography.fonts as Record<string, unknown>)
    : []
  const googleFonts = Array.isArray(typography?.googleFonts) ? typography.googleFonts : []
  const textStyles = source.textStyles && typeof source.textStyles === 'object'
    ? Object.values(source.textStyles as Record<string, ResumeGoogleFontSource | string>)
    : []

  return uniqueFontNames([
    ...googleFonts.map(normalizeFontName),
    ...fonts.map(normalizeFontName),
    ...textStyles.map((style) => (typeof style === 'object' ? normalizeFontName(style.fontFamily) : '')),
  ])
}

export function buildGoogleFontsHref(fontFamilies: string[]) {
  const families = uniqueFontNames(fontFamilies)
  if (!families.length) return ''
  const familyParams = families
    .map((family) => `family=${family.replace(/\s+/g, '+')}`)
    .join('&')
  return `https://fonts.googleapis.com/css2?${familyParams}&display=swap`
}

export function useResumeGoogleFonts(template: Ref<unknown> | ComputedRef<unknown>) {
  const googleFontsHref = computed(() => buildGoogleFontsHref(collectResumeGoogleFontFamilies(template.value)))

  useHead(() => ({
    link: googleFontsHref.value
      ? [
          { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
          { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
          { rel: 'stylesheet', href: googleFontsHref.value },
        ]
      : [],
  }))

  return { googleFontsHref }
}
