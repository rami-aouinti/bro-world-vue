export type ResumeColorTheme = {
  name: string
  sidebar: string
  accent: string
  page: string
}

export type ResumeRoundedOption = {
  title: string
  value: 'none' | 'sm' | 'md' | 'lg'
  className: string
}

export type ResumeTextStyleOption = {
  label: string
  value: 'clean' | 'italic' | 'serif' | 'mono' | 'display'
  className: string
}

export type CoverPalette = {
  page: string
  soft: string
  accent: string
  text: string
}

export const resumeColorThemes: ResumeColorTheme[] = [
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

export const resumeRoundedOptions: ResumeRoundedOption[] = [
  { title: 'None', value: 'none', className: 'radius-none' },
  { title: 'Soft', value: 'sm', className: 'radius-sm' },
  { title: 'Default', value: 'md', className: 'radius-md' },
  { title: 'Large', value: 'lg', className: 'radius-lg' },
]

export const resumeTextStyleOptions: ResumeTextStyleOption[] = [
  { label: 'Clean (Sans)', value: 'clean', className: 'text-style-clean' },
  { label: 'Italic', value: 'italic', className: 'text-style-italic' },
  { label: 'Classic Serif', value: 'serif', className: 'text-style-serif' },
  { label: 'Mono Tech', value: 'mono', className: 'text-style-mono' },
  { label: 'Display Bold', value: 'display', className: 'text-style-display' },
]

export const roundedPxByValue: Record<ResumeRoundedOption['value'], string> = {
  none: '0px',
  sm: '8px',
  md: '14px',
  lg: '24px',
}

export const textStyleVarsByValue: Record<ResumeTextStyleOption['value'], { family: string; style: string; weight: string }> = {
  clean: { family: "'Inter', 'Segoe UI', Arial, sans-serif", style: 'normal', weight: '400' },
  italic: { family: "'Inter', 'Segoe UI', Arial, sans-serif", style: 'italic', weight: '400' },
  serif: { family: "'Merriweather', Georgia, 'Times New Roman', serif", style: 'normal', weight: '400' },
  mono: { family: "'IBM Plex Mono', 'Courier New', monospace", style: 'normal', weight: '400' },
  display: { family: "'Poppins', 'Avenir Next', 'Segoe UI', sans-serif", style: 'normal', weight: '600' },
}

export const useResumeDesignControls = () => {
  const colorThemes = resumeColorThemes
  const roundedOptions = resumeRoundedOptions
  const textStyleOptions = resumeTextStyleOptions

  const resolveTheme = (themeName: string) => colorThemes.find(theme => theme.name === themeName) ?? colorThemes[0]

  const toCoverPalette = (themeName: string): CoverPalette => {
    const theme = resolveTheme(themeName)

    return {
      page: theme.page,
      soft: theme.page,
      accent: theme.accent,
      text: theme.sidebar,
    }
  }

  const toCoverTypography = (textStyle: ResumeTextStyleOption['value']): 'sans' | 'serif' => {
    return textStyle === 'serif' ? 'serif' : 'sans'
  }

  return {
    colorThemes,
    roundedOptions,
    textStyleOptions,
    roundedPxByValue,
    textStyleVarsByValue,
    resolveTheme,
    toCoverPalette,
    toCoverTypography,
  }
}
