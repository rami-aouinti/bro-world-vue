import type { PageBackgroundId, RoundedOptionId, Typography } from '~/constants/resumeDesign'
import type { ResumeLayoutMode, ResumeSectionIconStyleVariant } from '~/constants/resumeTemplateSkins'

export type ResumeSoclePreset = {
  id: string
  label: string
  theme: string
  pageBackground: PageBackgroundId
  rounded: RoundedOptionId
  textStyle: Typography
  photoShape: 'square' | 'rounded' | 'circle' | 'portrait-card' | 'soft-blob' | 'hex'
  layout: {
    layoutMode: ResumeLayoutMode
    sidebarWidth: number
    sidebarHeight: number
    lineDensity: 'compact' | 'comfortable'
    sectionDividerStyle: 'none' | 'line' | 'soft'
    sectionIconStyle: ResumeSectionIconStyleVariant
    showSectionIcons: boolean
    showContactIcons: boolean
    iconSize: 's' | 'm' | 'l'
    iconColor: 'accent' | 'neutral'
    photoSize: number
    photoBorderWidth: number
    photoPosition: 'left' | 'right'
  }
}

export const CV_SOCLE_PRESETS: ResumeSoclePreset[] = [
  {
    id: 'socle-classic',
    label: 'Classique',
    theme: 'ocean',
    pageBackground: 'white',
    rounded: 'md',
    textStyle: 'clean',
    photoShape: 'circle',
    layout: {
      layoutMode: 'aside-left',
      sidebarWidth: 280,
      sidebarHeight: 100,
      lineDensity: 'comfortable',
      sectionDividerStyle: 'line',
      sectionIconStyle: 'outline',
      showSectionIcons: true,
      showContactIcons: true,
      iconSize: 'm',
      iconColor: 'accent',
      photoSize: 140,
      photoBorderWidth: 6,
      photoPosition: 'right',
    },
  },
  {
    id: 'socle-compact',
    label: 'Compact',
    theme: 'slate',
    pageBackground: 'white',
    rounded: 'sm',
    textStyle: 'display',
    photoShape: 'rounded',
    layout: {
      layoutMode: 'aside-right',
      sidebarWidth: 250,
      sidebarHeight: 100,
      lineDensity: 'compact',
      sectionDividerStyle: 'soft',
      sectionIconStyle: 'filled',
      showSectionIcons: true,
      showContactIcons: true,
      iconSize: 's',
      iconColor: 'neutral',
      photoSize: 120,
      photoBorderWidth: 3,
      photoPosition: 'left',
    },
  },
]
