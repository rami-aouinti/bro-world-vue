import type { ResumeLayoutMode, ResumeSectionIconStyleVariant } from '~/constants/resumeTemplateSkins'
import { RESUME_SKINS_REGISTRY } from '~/constants/resumeSkins'
import { getResumeLayoutById } from '~/constants/resumeLayouts'
import { RESUME_LAYOUTS_CATALOG } from '~/constants/resumeTemplates.catalog'
import type { ResumeTemplateConfig } from '~/types/resumeTemplateConfig'

export type ResumeRendererDesignState = {
  headerStyleVariant: 'neutral' | 'hero'
  headerHeight: string
  asideFullHeight: boolean
  splitContactRow: boolean
  sectionRibbonStyle: 'none' | 'soft' | 'accent'
  separatorStyleVariant: 'neutral' | 'vertical-line'
  accentPaletteVariant: 'default' | 'contrast' | 'muted'
  themeTokens: Record<string, string>
  sectionTokens: Record<string, Record<string, string>>
  profile: {
    typography: string
    spacing: string
    separators: string
    cards: string
  }
  roundedClass: string
  textStyleClass: string
  sectionIconStyleVariant: ResumeSectionIconStyleVariant
  layoutMode: ResumeLayoutMode
  sectionStyleClass: string
}

const ICON_ALIAS: Record<string, ResumeSectionIconStyleVariant> = { text: 'outline', outline: 'outline', filled: 'filled', rounded: 'rounded' }


type TemplateRuntimePreset = {
  headerStyleVariant: 'neutral' | 'hero'
  headerHeight: string
  asideFullHeight: boolean
  splitContactRow: boolean
  sectionRibbonStyle: 'none' | 'soft' | 'accent'
  separatorStyleVariant: 'neutral' | 'vertical-line'
  accentPaletteVariant: 'default' | 'contrast' | 'muted'
  photoOffsetX: number
  photoOffsetY: number
  photoScale: number
}

const DEFAULT_RUNTIME_PRESET: TemplateRuntimePreset = {
  headerStyleVariant: 'neutral',
  headerHeight: 'auto',
  asideFullHeight: false,
  splitContactRow: false,
  sectionRibbonStyle: 'none',
  separatorStyleVariant: 'neutral',
  accentPaletteVariant: 'default',
  photoOffsetX: 0,
  photoOffsetY: 0,
  photoScale: 1,
}

const TEMPLATE_RUNTIME_PRESETS: Record<string, Partial<TemplateRuntimePreset>> = {
  'resume-banner': {
    headerStyleVariant: 'hero',
    headerHeight: '224px',
    asideFullHeight: true,
    sectionRibbonStyle: 'accent',
    separatorStyleVariant: 'vertical-line',
    accentPaletteVariant: 'contrast',
    splitContactRow: true,
    photoOffsetY: -4,
    photoScale: 1.06,
  },
  'resume-compact': {
    headerHeight: '176px',
    sectionRibbonStyle: 'soft',
    accentPaletteVariant: 'muted',
    photoScale: 0.95,
  },
  'resume-classic': {
    separatorStyleVariant: 'vertical-line',
    sectionRibbonStyle: 'soft',
    photoOffsetX: -2,
  },
}

function resolveRuntimePreset(templateId: string | undefined): TemplateRuntimePreset {
  if (!templateId) return DEFAULT_RUNTIME_PRESET
  return {
    ...DEFAULT_RUNTIME_PRESET,
    ...(TEMPLATE_RUNTIME_PRESETS[templateId] ?? {}),
  }
}

export function resolveRuntimeLayoutAndSkin(layoutId: string, skinId: string) {
  const layout = getResumeLayoutById(layoutId) ?? RESUME_LAYOUTS_CATALOG.find(entry => entry.id === layoutId)
  const skin = RESUME_SKINS_REGISTRY[skinId]
  if (!layout || !skin) throw new Error(`[resume-runtime] Unknown layout/skin combination: ${layoutId}/${skinId}`)
  return { layout, skin }
}

export function toResumeRendererDesignState(template: ResumeTemplateConfig): ResumeRendererDesignState {
  const { layout, skin } = resolveRuntimeLayoutAndSkin(template.layoutId, template.skinId)
  const layoutMode = 'structure' in layout ? layout.structure : layout.structureId
  const preset = resolveRuntimePreset(template.id)

  return {
    themeTokens: {
      '--resume-radius': skin.radius,
      '--cv-radius': skin.radius,
      '--resume-font-family': skin.typography.family,
      '--cv-font-family': skin.typography.family,
      '--resume-font-style': skin.typography.style,
      '--cv-font-style': skin.typography.style,
      '--resume-font-weight': skin.typography.weight,
      '--cv-font-weight': skin.typography.weight,
      '--resume-sidebar': skin.colors.sidebar,
      '--cv-sidebar': skin.colors.sidebar,
      '--resume-accent': skin.colors.accent,
      '--cv-accent': skin.colors.accent,
      '--resume-page': skin.colors.page,
      '--cv-page': skin.colors.page,
      '--resume-text': skin.colors.text,
      '--cv-text': skin.colors.text,
    },
    sectionTokens: {
      experience: { '--resume-section-emphasis': skin.sectionStyle === 'accent' ? skin.colors.accent : skin.colors.text },
      education: { '--resume-section-emphasis': skin.sectionStyle === 'accent' ? skin.colors.accent : skin.colors.text },
      project: { '--resume-section-emphasis': skin.sectionStyle === 'soft-block' ? skin.colors.sidebar : skin.colors.text },
      language: { '--resume-section-emphasis': skin.sectionStyle === 'line' ? skin.colors.accent : skin.colors.text },
      certification: { '--resume-section-emphasis': skin.sectionStyle === 'line' ? skin.colors.accent : skin.colors.text },
      hobby: { '--resume-section-emphasis': skin.colors.text },
      reference: { '--resume-section-emphasis': skin.colors.text },
    },
    headerStyleVariant: preset.headerStyleVariant,
    headerHeight: preset.headerHeight,
    asideFullHeight: preset.asideFullHeight,
    splitContactRow: preset.splitContactRow,
    sectionRibbonStyle: preset.sectionRibbonStyle,
    separatorStyleVariant: preset.separatorStyleVariant,
    accentPaletteVariant: preset.accentPaletteVariant,
    photoOffsetX: preset.photoOffsetX,
    photoOffsetY: preset.photoOffsetY,
    photoScale: preset.photoScale,
    profile: {
      typography: skin.typography.family.includes('Merriweather') ? 'classic' : 'neo-grotesk',
      spacing: skin.radius === '0px' ? 'compact' : 'balanced',
      separators: skin.sectionStyle,
      cards: skin.radius === '0px' ? 'flat' : 'soft',
    },
    roundedClass: `radius-${skin.radius.replace('px', '')}`,
    textStyleClass: `text-style-${skin.typography.family.includes('Merriweather') ? 'serif' : 'clean'}`,
    sectionIconStyleVariant: ICON_ALIAS[skin.iconStyle] ?? 'outline',
    layoutMode,
    sectionStyleClass: `section-style-${skin.sectionStyle}`,
  }
}
