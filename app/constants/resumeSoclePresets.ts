import type { ResumeSoclePreset } from '~/types/resumeSoclePreset'

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const safeHex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized
  if (!/^[\da-fA-F]{6}$/.test(safeHex)) return null
  return {
    r: Number.parseInt(safeHex.slice(0, 2), 16),
    g: Number.parseInt(safeHex.slice(2, 4), 16),
    b: Number.parseInt(safeHex.slice(4, 6), 16),
  }
}

function relativeLuminance(hex: string) {
  const rgb = hexToRgb(hex)
  if (!rgb) return 1
  const channelToLinear = (value: number) => {
    const normalized = value / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  }
  const r = channelToLinear(rgb.r)
  const g = channelToLinear(rgb.g)
  const b = channelToLinear(rgb.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(colorA: string, colorB: string) {
  const lumA = relativeLuminance(colorA)
  const lumB = relativeLuminance(colorB)
  const brightest = Math.max(lumA, lumB)
  const darkest = Math.min(lumA, lumB)
  return (brightest + 0.05) / (darkest + 0.05)
}

function bestAaTextColor(background: string, preferred: string, minimum = 4.5) {
  const candidates = [preferred, '#111827', '#0f172a', '#f8fafc', '#ffffff']
  const passing = candidates.find(
    (color) => contrastRatio(background, color) >= minimum,
  )
  if (passing) return passing
  return candidates.sort(
    (a, b) => contrastRatio(background, b) - contrastRatio(background, a),
  )[0]
}

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
  {
    id: 'socle-modern',
    label: 'Moderne',
    layoutMode: 'no-aside',
    palette: {
      accent: '#0ea5e9',
      page: '#ffffff',
      sidebar: '#e0f2fe',
      text: '#0f172a',
    },
    dividerStyle: 'none',
    iconStyle: 'rounded',
    defaults: {
      pageBackground: 'white',
      rounded: 'lg',
      textStyle: 'clean',
      photoShape: 'soft-blob',
      sidebarWidth: 260,
      sidebarHeight: 100,
      lineDensity: 'comfortable',
      showSectionIcons: true,
      showContactIcons: true,
      iconSize: 'm',
      iconColor: 'accent',
      photoSize: 130,
      photoBorderWidth: 2,
      photoPosition: 'left',
    },
  },
  {
    id: 'socle-executive',
    label: 'Executive',
    layoutMode: 'aside-left',
    palette: {
      accent: '#7c3aed',
      page: '#ffffff',
      sidebar: '#ede9fe',
      text: '#111827',
    },
    dividerStyle: 'line',
    iconStyle: 'filled',
    defaults: {
      pageBackground: 'white',
      rounded: 'md',
      textStyle: 'display',
      photoShape: 'portrait-card',
      sidebarWidth: 290,
      sidebarHeight: 100,
      lineDensity: 'compact',
      showSectionIcons: true,
      showContactIcons: true,
      iconSize: 'm',
      iconColor: 'accent',
      photoSize: 145,
      photoBorderWidth: 4,
      photoPosition: 'right',
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
  return (
    CV_SOCLE_PRESETS.find((preset) => preset.id === presetId) ??
    CV_SOCLE_PRESETS[0]
  )
}
