import type { ResumeSectionKey } from '~/constants/resumeTemplateSkins'
import { RESUME_SECTION_REGISTRY } from '~/constants/resumeSectionRegistry'

export const RESUME_SECTION_ICONS: Partial<Record<ResumeSectionKey, string>> = {
  education: RESUME_SECTION_REGISTRY.education.icon,
  experience: RESUME_SECTION_REGISTRY.experience.icon,
  project: RESUME_SECTION_REGISTRY.project.icon,
  reference: RESUME_SECTION_REGISTRY.reference.icon,
  certification: RESUME_SECTION_REGISTRY.certification.icon,
}
