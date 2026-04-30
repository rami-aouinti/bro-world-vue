import type { ResumeTemplateConfig } from '~/types/resumeTemplateConfig'

type LegacyTemplateId = 'classic' | 'fugo' | 'minimal'

type PilotTemplateConfig = Pick<ResumeTemplateConfig, 'id' | 'structureId' | 'layoutId' | 'skinId' | 'templateId'>

export const PILOT_TEMPLATE_CONFIGS: Record<LegacyTemplateId, PilotTemplateConfig> = {
  classic: {
    id: 'pilot-classic',
    structureId: 'no-aside',
    layoutId: 'layout-no-aside-a',
    skinId: 'skin-classic',
    templateId: 'cv-socle',
  },
  fugo: {
    id: 'pilot-fugo',
    structureId: 'aside-right',
    layoutId: 'layout-aside-right-b',
    skinId: 'skin-terra',
    templateId: 'cv-socle',
  },
  minimal: {
    id: 'pilot-minimal',
    structureId: 'no-aside',
    layoutId: 'layout-no-aside-c',
    skinId: 'skin-minimal-profile',
    templateId: 'cv-socle',
  },
}

export function resolveCompatibilityTemplateConfig(legacyTemplateId?: string): PilotTemplateConfig | null {
  if (!legacyTemplateId) return null
  return PILOT_TEMPLATE_CONFIGS[legacyTemplateId as LegacyTemplateId] ?? null
}
