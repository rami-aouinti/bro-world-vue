import { roundedPxByValue, textStyleVarsByValue, type PaletteId, type RoundedOptionId, type Typography } from '~/constants/resumeDesign'
import type { ResumeLayoutMode, ResumeSectionIconStyleVariant } from '~/constants/resumeTemplateSkins'
import { RESUME_LAYOUTS_CATALOG, RESUME_SKINS_CATALOG, RESUME_STRUCTURES_CATALOG } from '~/constants/resumeTemplates.catalog'
import type { ResumeTemplateConfig } from '~/types/resumeTemplateConfig'

export type ResumeRendererDesignState = {
  themeTokens: Record<string, string>
  roundedClass: string
  textStyleClass: string
  sectionIconStyleVariant: ResumeSectionIconStyleVariant
  layoutMode: ResumeLayoutMode
}

const paletteAlias: Record<(typeof RESUME_SKINS_CATALOG)[number]['palette'], PaletteId> = {
  'corporate-blue': 'ocean',
  midnight: 'slate',
  minimal: 'charcoal',
  classic: 'slate',
  modern: 'teal',
  terra: 'amber',
  elegant: 'violet',
} as const

const radiusAlias: Record<(typeof RESUME_SKINS_CATALOG)[number]['radius'], RoundedOptionId> = {
  none: 'none',
  soft: 'sm',
} as const

const typographyAlias: Record<(typeof RESUME_SKINS_CATALOG)[number]['typography'], Typography> = {
  executive: 'display',
  modern: 'clean',
  clean: 'clean',
  serif: 'serif',
  sans: 'clean',
} as const

const iconStyleAlias: Record<(typeof RESUME_SKINS_CATALOG)[number]['iconStyle'], ResumeSectionIconStyleVariant> = {
  text: 'outline',
  outline: 'outline',
  filled: 'filled',
  rounded: 'rounded',
} as const

const paletteTokens: Record<PaletteId, { sidebar: string; accent: string; page: string }> = {
  emerald: { sidebar: '#0b3a78', accent: '#2563eb', page: '#eff6ff' },
  ocean: { sidebar: '#0b3a78', accent: '#2563eb', page: '#eff6ff' },
  plum: { sidebar: '#4a1d5e', accent: '#9333ea', page: '#faf5ff' },
  charcoal: { sidebar: '#1f2937', accent: '#374151', page: '#f3f4f6' },
  ruby: { sidebar: '#7f1d1d', accent: '#dc2626', page: '#fff1f2' },
  amber: { sidebar: '#78350f', accent: '#d97706', page: '#fffbeb' },
  sunset: { sidebar: '#7c2d12', accent: '#f97316', page: '#fff7ed' },
  slate: { sidebar: '#0f172a', accent: '#475569', page: '#f8fafc' },
  teal: { sidebar: '#134e4a', accent: '#0d9488', page: '#f0fdfa' },
  violet: { sidebar: '#3b0764', accent: '#7c3aed', page: '#f5f3ff' },
  forest: { sidebar: '#14532d', accent: '#16a34a', page: '#f0fdf4' },
  rose: { sidebar: '#881337', accent: '#e11d48', page: '#fff1f2' },
}

export function toResumeRendererDesignState(template: ResumeTemplateConfig): ResumeRendererDesignState {
  const structure = RESUME_STRUCTURES_CATALOG.find(entry => entry.id === template.structureId)
  const layout = RESUME_LAYOUTS_CATALOG.find(entry => entry.id === template.layoutId)
  const skin = RESUME_SKINS_CATALOG.find(entry => entry.id === template.skinId)

  const paletteId = skin?.palette ? paletteAlias[skin.palette] : undefined
  const radiusId = skin?.radius ? radiusAlias[skin.radius] : undefined
  const textStyle = skin?.typography ? typographyAlias[skin.typography] : undefined
  const iconStyle = skin?.iconStyle ? iconStyleAlias[skin.iconStyle] : undefined
  const layoutMode = structure?.id as ResumeLayoutMode | undefined

  if (!paletteId || !radiusId || !textStyle || !iconStyle || !layoutMode || !layout || layout.structureId !== structure?.id) {
    throw new Error(`[resume-runtime] Incomplete template runtime config for "${template.id}"`)
  }

  const palette = paletteTokens[paletteId]
  const typeVars = textStyleVarsByValue[textStyle]

  return {
    themeTokens: {
      '--resume-radius': roundedPxByValue[radiusId],
      '--cv-radius': roundedPxByValue[radiusId],
      '--resume-font-family': typeVars.family,
      '--cv-font-family': typeVars.family,
      '--resume-font-style': typeVars.style,
      '--cv-font-style': typeVars.style,
      '--resume-font-weight': typeVars.weight,
      '--cv-font-weight': typeVars.weight,
      '--resume-sidebar': palette.sidebar,
      '--cv-sidebar': palette.sidebar,
      '--resume-accent': palette.accent,
      '--cv-accent': palette.accent,
      '--resume-page': palette.page,
      '--cv-page': palette.page,
    },
    roundedClass: `radius-${radiusId}`,
    textStyleClass: `text-style-${textStyle}`,
    sectionIconStyleVariant: iconStyle,
    layoutMode,
  }
}
