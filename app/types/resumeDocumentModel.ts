import type { PageBackgroundId, RoundedOptionId, Typography } from '~/constants/resumeDesign'
import type { ResumeLayoutMode, ResumeSectionIconStyleVariant } from '~/constants/resumeTemplateSkins'
import type { ResumeTemplateVariant } from '~/constants/resumeTemplates'

export type ResumeLayoutDensity = 'compact' | 'comfortable'
export type ResumeSectionRegion = 'main' | 'aside'

export type ResumeEditableSectionKey =
  | 'experience'
  | 'education'
  | 'language'
  | 'project'
  | 'skill'
  | 'reference'
  | 'hobby'
  | 'certification'

export type ResumePreviewSectionKey = Extract<
  ResumeEditableSectionKey,
  'experience' | 'education' | 'language' | 'project'
>

export type ResumeSectionActionKey = ResumeEditableSectionKey | 'course'

export const RESUME_EDITABLE_SECTION_KEYS = [
  'experience',
  'education',
  'language',
  'project',
  'skill',
  'reference',
  'hobby',
  'certification',
] as const satisfies ReadonlyArray<ResumeEditableSectionKey>

export function isResumeEditableSectionKey(
  value: string,
): value is ResumeEditableSectionKey {
  return RESUME_EDITABLE_SECTION_KEYS.includes(value as ResumeEditableSectionKey)
}

export type ResumeSectionVariant =
  | 'detailed'
  | 'bullets'
  | 'compact'
  | 'classic'
  | 'timeline'
  | 'two-column'
  | 'text-level'
  | 'stars'
  | 'progress'
  | 'flags'
  | 'list'
  | 'cards'

export type ResumeSectionLayoutModel = {
  key: ResumeEditableSectionKey
  region: ResumeSectionRegion
  order: number
  variant: ResumeSectionVariant
}

export type ResumeStylePreferences = {
  palette: string
  pageBackground: PageBackgroundId
  density: ResumeLayoutDensity
  radius: RoundedOptionId
  typography: Typography
  photoPosition: 'left' | 'center' | 'right'
  asideWidth: number
  showSectionIcons: boolean
  showContactIcons: boolean
  sectionIconStyle: ResumeSectionIconStyleVariant
  iconSize: 's' | 'm' | 'l'
  iconColor: 'accent' | 'neutral'
  layoutMode: ResumeLayoutMode
}

export type ResumeDocumentModel = {
  templateVariant: ResumeTemplateVariant
  sectionOrder: ResumeSectionLayoutModel[]
  style: ResumeStylePreferences
}

export type ResumeDocumentCustomizationState = {
  customization: ResumeDocumentModel
}
