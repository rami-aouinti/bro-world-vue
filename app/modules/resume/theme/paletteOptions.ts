export type ToolbarPaletteOption = {
  title: string
  value: string
  primary: string
  secondary: string
  tertiary: string
  quaternary: string
  text: string
  light: string
}

type TemplatePalette = {
  primary?: string
  secondary?: string
  muted?: string
  text?: string
  pageBackground?: string
}

function relativeLuminance(hex: string) {
  const normalized = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return 1
  const rgb = [0, 2, 4].map(offset => parseInt(normalized.slice(offset, offset + 2), 16) / 255)
  const linear = rgb.map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
}

function resolveTextColor(background: string, fallback = '#0F172A') {
  return relativeLuminance(background) < 0.35 ? '#F8FAFC' : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function adjustHex(hex: string, amount: number) {
  const normalized = hex.replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return hex
  const r = clamp(parseInt(normalized.slice(0, 2), 16) + amount, 0, 255)
  const g = clamp(parseInt(normalized.slice(2, 4), 16) + amount, 0, 255)
  const b = clamp(parseInt(normalized.slice(4, 6), 16) + amount, 0, 255)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function buildToolbarPaletteOptions(
  templatePalette: TemplatePalette,
  basePalettes: Array<{ name?: string; value?: string; primary: string; secondary?: string; dark?: string; pageBackground?: string; light?: string }>,
  targetCount = 100,
): ToolbarPaletteOption[] {
  const options: ToolbarPaletteOption[] = [
    {
      title: 'Template',
      value: 'template',
      primary: templatePalette.primary || '#2563EB',
      secondary: templatePalette.secondary || '#1D4ED8',
      tertiary: templatePalette.muted || adjustHex(templatePalette.secondary || '#1D4ED8', 24),
      quaternary: templatePalette.pageBackground || '#EFF6FF',
      text: templatePalette.text || resolveTextColor(templatePalette.pageBackground || '#EFF6FF'),
      light: templatePalette.pageBackground || '#EFF6FF',
    },
  ]

  const normalizedBase = basePalettes.map((palette, index) => ({
    title: palette.name || `Palette ${index + 1}`,
    value: palette.value || palette.name || `palette-${index + 1}`,
    primary: palette.primary,
    secondary: palette.secondary || palette.dark || '#334155',
    tertiary: palette.dark || palette.secondary || '#64748B',
    quaternary: palette.pageBackground || palette.light || '#F8FAFC',
    text: palette.text || resolveTextColor(palette.pageBackground || palette.light || '#F8FAFC'),
    light: palette.pageBackground || palette.light || '#F8FAFC',
  }))

  const steps = [0, 16, -16]
  let variantIndex = 0
  while (options.length < targetCount) {
    const base = normalizedBase[variantIndex % normalizedBase.length]
    const toneStep = steps[Math.floor(variantIndex / normalizedBase.length) % steps.length]
    const cycle = Math.floor(variantIndex / (normalizedBase.length * steps.length)) + 1
    options.push({
      title: toneStep === 0 ? `${base.title} ${cycle}` : `${base.title} ${cycle}${toneStep > 0 ? ' +' : ' -'}`,
      value: `${base.value}-${cycle}-${toneStep}`,
      primary: adjustHex(base.primary, toneStep),
      secondary: adjustHex(base.secondary, Math.round(toneStep * 0.75)),
      tertiary: adjustHex(base.tertiary, Math.round(toneStep * 0.45)),
      quaternary: adjustHex(base.quaternary, toneStep > 0 ? toneStep : Math.round(toneStep * 0.35)),
      text: resolveTextColor(adjustHex(base.quaternary, toneStep > 0 ? toneStep : Math.round(toneStep * 0.35)), base.text),
      light: adjustHex(base.light, toneStep > 0 ? toneStep : Math.round(toneStep * 0.4)),
    })
    variantIndex += 1
  }

  return options.slice(0, targetCount)
}
