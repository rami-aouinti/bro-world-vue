import {
  RESUME_COLOR_THEMES,
  RESUME_PAGE_BACKGROUND_OPTIONS,
  RESUME_ROUNDED_OPTIONS,
  RESUME_TEXT_STYLE_OPTIONS,
  type CoverPalette,
  type PageBackgroundId,
  type Typography,
  roundedPxByValue,
  textStyleVarsByValue,
} from '~/constants/resumeDesign'

export type { CoverPalette, ResumeColorTheme, ResumeRoundedOption, ResumeTextStyleOption } from '~/constants/resumeDesign'

export const resumeColorThemes = RESUME_COLOR_THEMES
export const resumePageBackgroundOptions = RESUME_PAGE_BACKGROUND_OPTIONS
export const resumeRoundedOptions = RESUME_ROUNDED_OPTIONS
export const resumeTextStyleOptions = RESUME_TEXT_STYLE_OPTIONS

export const useResumeDesignControls = () => {
  const colorThemes = resumeColorThemes
  const pageBackgroundOptions = resumePageBackgroundOptions
  const roundedOptions = resumeRoundedOptions
  const textStyleOptions = resumeTextStyleOptions

  const resolveTheme = (themeName: string) => colorThemes.find(theme => theme.name === themeName) ?? colorThemes[0]
  const resolvePageBackground = (value: string) => pageBackgroundOptions.find(option => option.value === value) ?? pageBackgroundOptions[0]

  const isAllowedPageBackground = (hex: string, minimumLuminance = 0.88) => {
    const normalized = hex.replace('#', '')
    const safeHex = normalized.length === 3
      ? normalized.split('').map(char => `${char}${char}`).join('')
      : normalized
    if (!/^[\da-fA-F]{6}$/.test(safeHex)) return false

    const toLinear = (value: number) => {
      const srgb = value / 255
      return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
    }

    const r = toLinear(Number.parseInt(safeHex.slice(0, 2), 16))
    const g = toLinear(Number.parseInt(safeHex.slice(2, 4), 16))
    const b = toLinear(Number.parseInt(safeHex.slice(4, 6), 16))
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b

    return luminance >= minimumLuminance
  }

  const toCoverPalette = (themeName: string, background: PageBackgroundId = 'white'): CoverPalette => {
    const theme = resolveTheme(themeName)
    const pageBackground = resolvePageBackground(background)

    return {
      page: pageBackground.page,
      soft: pageBackground.page,
      accent: theme.accent,
      text: theme.sidebar,
    }
  }

  const toCoverTypography = (textStyle: Typography): 'sans' | 'serif' => {
    return textStyle === 'serif' ? 'serif' : 'sans'
  }

  return {
    colorThemes,
    pageBackgroundOptions,
    roundedOptions,
    textStyleOptions,
    roundedPxByValue,
    textStyleVarsByValue,
    resolveTheme,
    resolvePageBackground,
    isAllowedPageBackground,
    toCoverPalette,
    toCoverTypography,
  }
}
