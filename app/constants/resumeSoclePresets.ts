import { bestAaTextColor } from '~/utils/colorContrast'
import type { ResumeSoclePreset } from '~/types/resumeSoclePreset'

export const CV_SOCLE_PRESETS: ResumeSoclePreset[] = [
  {
    id: 'socle-classic',
    label: 'Classique',
    layoutMode: 'aside-left',
    palette: {
      accent: '#1e40af',
      page: '#ffffff',
      sidebar: '#e2e8f0',
      text: '#0f172a',
    },
    dividerStyle: 'line',
    iconStyle: 'outline',
    defaults: {
      pageBackground: 'white',
      rounded: 'md',
      textStyle: 'clean',
      photoShape: 'circle',
      sidebarWidth: 280,
      sidebarHeight: 100,
      lineDensity: 'comfortable',
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
    layoutMode: 'aside-right',
    palette: {
      accent: '#334155',
      page: '#ffffff',
      sidebar: '#f1f5f9',
      text: '#0f172a',
    },
    dividerStyle: 'soft',
    iconStyle: 'filled',
    defaults: {
      pageBackground: 'white',
      rounded: 'sm',
      textStyle: 'display',
      photoShape: 'rounded',
      sidebarWidth: 250,
      sidebarHeight: 100,
      lineDensity: 'compact',
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

export function resolveSocleThemeTokens(preset: ResumeSoclePreset) {
  const { accent, page, sidebar, text } = preset.palette
  return {
    '--resume-sidebar': sidebar,
    '--cv-sidebar': sidebar,
    '--resume-accent': accent,
    '--cv-accent': accent,
    '--resume-page': page,
    '--cv-page': page,
    '--resume-title': text,
    '--cv-title': text,
    '--resume-secondary': bestAaTextColor(page, sidebar, 4.5),
    '--cv-secondary': bestAaTextColor(page, sidebar, 4.5),
    '--resume-on-sidebar': bestAaTextColor(sidebar, page, 4.5),
    '--cv-on-sidebar': bestAaTextColor(sidebar, page, 4.5),
    '--resume-on-accent': bestAaTextColor(accent, page, 4.5),
    '--cv-on-accent': bestAaTextColor(accent, page, 4.5),
  }
}

export function resolveSoclePresetById(presetId?: string | null) {
  return CV_SOCLE_PRESETS.find((preset) => preset.id === presetId) ?? CV_SOCLE_PRESETS[0]
}
