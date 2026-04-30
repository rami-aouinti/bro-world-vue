import type { ResumeLayoutDefinition } from '~/constants/resumeLayouts'
import type { ResumeEditableSectionKey } from '~/types/resumeDocumentModel'
import {
  RESUME_SECTION_VARIANTS,
  RESUME_SHARED_SECTION_VARIANTS,
} from '~/types/resumeSectionVariants'

export const RESUME_RENDERER_VARIANTS_BY_SECTION: Partial<
  Record<ResumeEditableSectionKey, readonly string[]>
> = {
  ...RESUME_SECTION_VARIANTS,
}

export const RESUME_SHARED_TEMPLATE_VARIANTS_BY_SECTION: Partial<
  Record<ResumeEditableSectionKey, readonly string[]>
> = {
  language: RESUME_SHARED_SECTION_VARIANTS.language,
  project: RESUME_SHARED_SECTION_VARIANTS.project,
  certification: RESUME_SHARED_SECTION_VARIANTS.certification,
  reference: RESUME_SHARED_SECTION_VARIANTS.reference,
  hobby: RESUME_SHARED_SECTION_VARIANTS.hobby,
}

export const RESUME_RENDERER_SUPPORTED_SECTIONS: readonly ResumeEditableSectionKey[] =
  [
    'experience',
    'education',
    'language',
    'project',
    'hobby',
    'certification',
    'reference',
    'skill',
  ] as const

export const RESUME_LAYOUT_REQUIRED_SECTIONS: readonly ResumeEditableSectionKey[] =
  ['experience', 'education', 'project'] as const

export const RESUME_LAYOUT_OPTIONAL_SECTIONS: readonly ResumeEditableSectionKey[] =
  ['skill', 'language', 'reference', 'certification', 'hobby'] as const

export type ResumeSectionFallbackPolicy = {
  unsupportedInLayout: 'render-in-main' | 'render-in-aside' | 'skip-render'
}

export const RESUME_LAYOUT_SECTION_FALLBACK_POLICY: ResumeSectionFallbackPolicy =
  {
    unsupportedInLayout: 'render-in-main',
  }

export function collectSupportedSectionsByLayout(
  layout: ResumeLayoutDefinition,
) {
  const fromZones = new Set<ResumeEditableSectionKey>([
    ...layout.zones.main,
    ...layout.zones.aside,
  ])

  for (const rule of layout.fallbackRules) {
    fromZones.add(rule.section)
  }

  return [...fromZones]
}
