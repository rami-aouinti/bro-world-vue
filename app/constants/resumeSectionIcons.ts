import type { ResumeSectionKey } from '~/constants/resumeTemplateSkins'

export const RESUME_SECTION_ICONS: Partial<Record<ResumeSectionKey, string>> = {
  education: 'mdi-school-outline',
  experience: 'mdi-briefcase-outline',
  project: 'mdi-folder-star-outline',
  reference: 'mdi-account-voice-outline',
  certification: 'mdi-certificate-outline',
}
