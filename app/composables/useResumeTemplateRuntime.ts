import type { ResumeLayoutMode, ResumeSectionIconStyleVariant } from '~/constants/resumeTemplateSkins'
import { RESUME_SKINS_REGISTRY } from '~/constants/resumeSkins'
import { getResumeLayoutById } from '~/constants/resumeLayouts'
import { RESUME_LAYOUTS_CATALOG } from '~/constants/resumeTemplates.catalog'
import type { ResumeTemplateConfig } from '~/types/resumeTemplateConfig'

export type ResumeRendererDesignState = {
  themeTokens: Record<string, string>
  roundedClass: string
  textStyleClass: string
  sectionIconStyleVariant: ResumeSectionIconStyleVariant
  layoutMode: ResumeLayoutMode
  sectionStyleClass: string
}

const ICON_ALIAS: Record<string, ResumeSectionIconStyleVariant> = { text: 'outline', outline: 'outline', filled: 'filled', rounded: 'rounded' }

export function resolveRuntimeLayoutAndSkin(layoutId: string, skinId: string) {
  const layout = getResumeLayoutById(layoutId) ?? RESUME_LAYOUTS_CATALOG.find(entry => entry.id === layoutId)
  const skin = RESUME_SKINS_REGISTRY[skinId]
  if (!layout || !skin) throw new Error(`[resume-runtime] Unknown layout/skin combination: ${layoutId}/${skinId}`)
  return { layout, skin }
}

export function toResumeRendererDesignState(template: ResumeTemplateConfig): ResumeRendererDesignState {
  const { layout, skin } = resolveRuntimeLayoutAndSkin(template.layoutId, template.skinId)
  const layoutMode = 'structure' in layout ? layout.structure : layout.structureId

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
    roundedClass: `radius-${skin.radius.replace('px', '')}`,
    textStyleClass: `text-style-${skin.typography.family.includes('Merriweather') ? 'serif' : 'clean'}`,
    sectionIconStyleVariant: ICON_ALIAS[skin.iconStyle] ?? 'outline',
    layoutMode,
    sectionStyleClass: `section-style-${skin.sectionStyle}`,
  }
}
