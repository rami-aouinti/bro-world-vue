export type PaletteId =
  | 'emerald'
  | 'ocean'
  | 'plum'
  | 'charcoal'
  | 'ruby'
  | 'amber'
  | 'sunset'
  | 'slate'
  | 'teal'
  | 'violet'
  | 'forest'
  | 'rose'

export type RoundedOptionId = 'none' | 'sm' | 'md' | 'lg'
export type Typography = 'clean' | 'italic' | 'serif' | 'mono' | 'display'
export type PageBackgroundId = 'white' | 'sky-light' | 'pearl-light' | 'ivory-light'

export type ResumeColorTheme = {
  name: PaletteId
  sidebar: string
  accent: string
  page: string
}

export type ResumeRoundedOption = {
  title: string
  value: RoundedOptionId
  className: string
}

export type ResumeTextStyleOption = {
  label: string
  value: Typography
  className: string
}

export type ResumePageBackgroundOption = {
  label: string
  value: PageBackgroundId
  page: string
}

export type CoverPalette = {
  page: string
  soft: string
  accent: string
  text: string
}

export type ResumeSkinPaletteId =
  | 'classic'
  | 'urban'
  | 'compact-ats'
  | 'executive'
  | 'midnight'
  | 'minimal'
  | 'terra'
  | 'elegant'
  | 'graphite'
  | 'oceanic'

export type ResumeSkinPalette = {
  mainText: string
  mainBackground: string
  sidebarText: string
  sidebarBackground: string
  accent: string
}

const hexToRgb = (hex: string): [number, number, number] => {
  const normalized = hex.replace('#', '')
  const value = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized
  const parsed = Number.parseInt(value, 16)
  return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255]
}

const relativeLuminance = ([r, g, b]: [number, number, number]): number => {
  const channel = (value: number): number => {
    const normalized = value / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  }

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

const contrastRatio = (foreground: string, background: string): number => {
  const l1 = relativeLuminance(hexToRgb(foreground))
  const l2 = relativeLuminance(hexToRgb(background))
  const [brightest, darkest] = l1 >= l2 ? [l1, l2] : [l2, l1]
  return (brightest + 0.05) / (darkest + 0.05)
}

export const RESUME_SKIN_PALETTES: Record<ResumeSkinPaletteId, ResumeSkinPalette> = {
  classic: { mainText: '#1f2937', mainBackground: '#ffffff', sidebarText: '#f9fafb', sidebarBackground: '#1f2937', accent: '#1d4ed8' },
  urban: { mainText: '#0f172a', mainBackground: '#f8fafc', sidebarText: '#f8fafc', sidebarBackground: '#0f172a', accent: '#0891b2' },
  'compact-ats': { mainText: '#111827', mainBackground: '#ffffff', sidebarText: '#f9fafb', sidebarBackground: '#111827', accent: '#2563eb' },
  executive: { mainText: '#111827', mainBackground: '#ffffff', sidebarText: '#eff6ff', sidebarBackground: '#0b3a78', accent: '#1d4ed8' },
  midnight: { mainText: '#e2e8f0', mainBackground: '#0f172a', sidebarText: '#f8fafc', sidebarBackground: '#020617', accent: '#38bdf8' },
  minimal: { mainText: '#111827', mainBackground: '#ffffff', sidebarText: '#111827', sidebarBackground: '#f3f4f6', accent: '#4b5563' },
  terra: { mainText: '#3f2a1d', mainBackground: '#fffaf5', sidebarText: '#fff7ed', sidebarBackground: '#7c2d12', accent: '#ea580c' },
  elegant: { mainText: '#3f3f46', mainBackground: '#fffbeb', sidebarText: '#fffbeb', sidebarBackground: '#4c1d95', accent: '#7c3aed' },
  graphite: { mainText: '#111827', mainBackground: '#f3f4f6', sidebarText: '#f9fafb', sidebarBackground: '#374151', accent: '#6b7280' },
  oceanic: { mainText: '#082f49', mainBackground: '#f0f9ff', sidebarText: '#ecfeff', sidebarBackground: '#0c4a6e', accent: '#0284c7' },
}

for (const [paletteId, palette] of Object.entries(RESUME_SKIN_PALETTES) as Array<[ResumeSkinPaletteId, ResumeSkinPalette]>) {
  if (contrastRatio(palette.mainText, palette.mainBackground) < 4.5) {
    throw new Error(`Palette ${paletteId} does not meet AA contrast for main text/background`)
  }

  if (contrastRatio(palette.sidebarText, palette.sidebarBackground) < 4.5) {
    throw new Error(`Palette ${paletteId} does not meet AA contrast for sidebar text/background`)
  }
}

export const RESUME_COLOR_THEMES: ResumeColorTheme[] = [
  { name: 'emerald', sidebar: '#0b3a78', accent: '#2563eb', page: '#eff6ff' },
  { name: 'ocean', sidebar: '#0b3a78', accent: '#2563eb', page: '#eff6ff' },
  { name: 'plum', sidebar: '#4a1d5e', accent: '#9333ea', page: '#faf5ff' },
  { name: 'charcoal', sidebar: '#1f2937', accent: '#374151', page: '#f3f4f6' },
  { name: 'ruby', sidebar: '#7f1d1d', accent: '#dc2626', page: '#fff1f2' },
  { name: 'amber', sidebar: '#78350f', accent: '#d97706', page: '#fffbeb' },
  { name: 'sunset', sidebar: '#7c2d12', accent: '#f97316', page: '#fff7ed' },
  { name: 'slate', sidebar: '#0f172a', accent: '#475569', page: '#f8fafc' },
  { name: 'teal', sidebar: '#134e4a', accent: '#0d9488', page: '#f0fdfa' },
  { name: 'violet', sidebar: '#3b0764', accent: '#7c3aed', page: '#f5f3ff' },
  { name: 'forest', sidebar: '#14532d', accent: '#16a34a', page: '#f0fdf4' },
  { name: 'rose', sidebar: '#881337', accent: '#e11d48', page: '#fff1f2' },
]

export const RESUME_ROUNDED_OPTIONS: ResumeRoundedOption[] = [
  { title: 'None', value: 'none', className: 'radius-none' },
  { title: 'Soft', value: 'sm', className: 'radius-sm' },
  { title: 'Default', value: 'md', className: 'radius-md' },
  { title: 'Large', value: 'lg', className: 'radius-lg' },
]

export const RESUME_TEXT_STYLE_OPTIONS: ResumeTextStyleOption[] = [
  { label: 'Clean (Sans)', value: 'clean', className: 'text-style-clean' },
  { label: 'Italic', value: 'italic', className: 'text-style-italic' },
  { label: 'Classic Serif', value: 'serif', className: 'text-style-serif' },
  { label: 'Mono Tech', value: 'mono', className: 'text-style-mono' },
  { label: 'Display Bold', value: 'display', className: 'text-style-display' },
]

export const RESUME_PAGE_BACKGROUND_OPTIONS: ResumePageBackgroundOption[] = [
  { label: 'Blanc', value: 'white', page: '#ffffff' },
  { label: 'Bleu ciel léger', value: 'sky-light', page: '#f2f8ff' },
  { label: 'Gris perle clair', value: 'pearl-light', page: '#f5f6f8' },
  { label: 'Ivoire clair', value: 'ivory-light', page: '#fffdf4' },
]

export const roundedPxByValue: Record<RoundedOptionId, string> = {
  none: '0px',
  sm: '8px',
  md: '14px',
  lg: '24px',
}

export const textStyleVarsByValue: Record<Typography, { family: string; style: string; weight: string }> = {
  clean: { family: "'Inter', 'Segoe UI', Arial, sans-serif", style: 'normal', weight: '400' },
  italic: { family: "'Inter', 'Segoe UI', Arial, sans-serif", style: 'italic', weight: '400' },
  serif: { family: "'Merriweather', Georgia, 'Times New Roman', serif", style: 'normal', weight: '400' },
  mono: { family: "'IBM Plex Mono', 'Courier New', monospace", style: 'normal', weight: '400' },
  display: { family: "'Poppins', 'Avenir Next', 'Segoe UI', sans-serif", style: 'normal', weight: '600' },
}
