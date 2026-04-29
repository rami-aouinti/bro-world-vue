import type { ResumeEditableSectionKey } from '~/types/resumeDocumentModel'
import { RESUME_SECTION_VARIANTS, RESUME_SHARED_SECTION_VARIANTS } from '~/types/resumeSectionVariants'

export const RESUME_RENDERER_VARIANTS_BY_SECTION: Partial<Record<ResumeEditableSectionKey, readonly string[]>> = {
  ...RESUME_SECTION_VARIANTS,
}

export const RESUME_SHARED_TEMPLATE_VARIANTS_BY_SECTION: Partial<Record<ResumeEditableSectionKey, readonly string[]>> = {
  language: RESUME_SHARED_SECTION_VARIANTS.language,
  project: RESUME_SHARED_SECTION_VARIANTS.project,
  certification: RESUME_SHARED_SECTION_VARIANTS.certification,
  reference: RESUME_SHARED_SECTION_VARIANTS.reference,
  hobby: RESUME_SHARED_SECTION_VARIANTS.hobby,
}
