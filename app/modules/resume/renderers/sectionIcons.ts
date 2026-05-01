export const RESUME_RENDERER_SECTION_ICONS: Record<string, string> = {
  contact: 'mdi-card-account-phone-outline',
  profile: 'mdi-account-outline',
  experience: 'mdi-briefcase-outline',
  education: 'mdi-school-outline',
  skills: 'mdi-star-circle-outline',
  languages: 'mdi-translate',
  certifications: 'mdi-certificate-outline',
  references: 'mdi-account-group-outline',
  projects: 'mdi-folder-star-outline',
  interests: 'mdi-puzzle-heart-outline',
  hobby: 'mdi-puzzle-heart-outline',
}


export function resolveSectionIcon(sectionKey: string): string | undefined {
  return RESUME_RENDERER_SECTION_ICONS[sectionKey]
}
