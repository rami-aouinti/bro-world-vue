import type { PageBackgroundId, RoundedOptionId, Typography } from '~/constants/resumeDesign'
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
}

export type ResumeDocumentModel = {
  templateVariant: ResumeTemplateVariant
  sectionOrder: ResumeSectionLayoutModel[]
  style: ResumeStylePreferences
}

export type ResumeDocumentCustomizationState = {
  customization: ResumeDocumentModel
}
