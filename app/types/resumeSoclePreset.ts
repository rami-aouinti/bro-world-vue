import type { ResumeLayoutMode, ResumeSectionIconStyleVariant } from '~/constants/resumeTemplateSkins'

export type ResumeSoclePresetPalette = {
  accent: string
  page: string
  sidebar: string
  text: string
}

export type ResumeSoclePreset = {
  id: string
  label: string
  layoutMode: ResumeLayoutMode
  palette: ResumeSoclePresetPalette
  dividerStyle?: 'none' | 'line' | 'soft'
  cardStyle?: 'flat' | 'soft' | 'elevated'
  iconStyle?: ResumeSectionIconStyleVariant
  defaults: {
    pageBackground: 'white' | 'sky-light' | 'pearl-light' | 'ivory-light'
    rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    textStyle: 'clean' | 'display' | 'mono'
    photoShape: 'square' | 'rounded' | 'circle' | 'portrait-card' | 'soft-blob' | 'hex'
    sidebarWidth: number
    sidebarHeight: number
    lineDensity: 'compact' | 'comfortable'
    showSectionIcons: boolean
    showContactIcons: boolean
    iconSize: 's' | 'm' | 'l'
    iconColor: 'accent' | 'neutral'
    photoSize: number
    photoBorderWidth: number
    photoPosition: 'left' | 'right'
  }
}
