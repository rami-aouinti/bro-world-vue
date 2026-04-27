import {
  RESUME_COLOR_THEMES,
  RESUME_ROUNDED_OPTIONS,
  RESUME_TEXT_STYLE_OPTIONS,
  type CoverPalette,
  type Typography,
  roundedPxByValue,
  textStyleVarsByValue,
} from '~/constants/resumeDesign'

export type { CoverPalette, ResumeColorTheme, ResumeRoundedOption, ResumeTextStyleOption } from '~/constants/resumeDesign'

export const resumeColorThemes = RESUME_COLOR_THEMES
export const resumeRoundedOptions = RESUME_ROUNDED_OPTIONS
export const resumeTextStyleOptions = RESUME_TEXT_STYLE_OPTIONS

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

  const toCoverTypography = (textStyle: Typography): 'sans' | 'serif' => {
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
