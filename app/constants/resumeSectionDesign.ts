export type ResumeSectionKey =
  | 'experience'
  | 'education'
  | 'language'
  | 'project'
export type ResumeTemplateKey = 'terra' | 'modern'

export type SectionHeadingStyle = 'underline' | 'badge' | 'minimal'
export type SectionSpacingDensity = 'compact' | 'normal' | 'spacious'
export type SectionSeparatorStyle = 'none' | 'line' | 'thick'
export type SectionCardStyle = 'flat' | 'soft' | 'outlined'
export type SectionAccentMarker = 'dot' | 'bar' | 'left-border'

export type ResumeSectionDesignPreset = {
  variant: string
  headingStyle: SectionHeadingStyle
  spacingDensity: SectionSpacingDensity
  separators: SectionSeparatorStyle
  cardStyle: SectionCardStyle
  accentMarker: SectionAccentMarker
}

export const RESUME_SECTION_DESIGN_PRESETS: Record<
  ResumeTemplateKey,
  Record<ResumeSectionKey, ResumeSectionDesignPreset>
> = {
  terra: {
    experience: {
      variant: 'classic',
      headingStyle: 'underline',
      spacingDensity: 'normal',
      separators: 'line',
      cardStyle: 'flat',
      accentMarker: 'left-border',
    },
    education: {
      variant: 'classic',
      headingStyle: 'underline',
      spacingDensity: 'normal',
      separators: 'line',
      cardStyle: 'flat',
      accentMarker: 'left-border',
    },
    language: {
      variant: 'text-level',
      headingStyle: 'minimal',
      spacingDensity: 'compact',
      separators: 'none',
      cardStyle: 'flat',
      accentMarker: 'dot',
    },
    project: {
      variant: 'list',
      headingStyle: 'underline',
      spacingDensity: 'normal',
      separators: 'line',
      cardStyle: 'flat',
      accentMarker: 'bar',
    },
  },
  modern: {
    experience: {
      variant: 'classic',
      headingStyle: 'minimal',
      spacingDensity: 'normal',
      separators: 'none',
      cardStyle: 'soft',
      accentMarker: 'left-border',
    },
    education: {
      variant: 'classic',
      headingStyle: 'minimal',
      spacingDensity: 'normal',
      separators: 'none',
      cardStyle: 'soft',
      accentMarker: 'left-border',
    },
    language: {
      variant: 'text-level',
      headingStyle: 'badge',
      spacingDensity: 'normal',
      separators: 'none',
      cardStyle: 'flat',
      accentMarker: 'dot',
    },
    project: {
      variant: 'list',
      headingStyle: 'minimal',
      spacingDensity: 'normal',
      separators: 'none',
      cardStyle: 'outlined',
      accentMarker: 'bar',
    },
  },
}
