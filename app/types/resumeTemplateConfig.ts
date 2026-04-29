import type { ResumeLayoutMode, ResumeSectionIconStyleVariant } from '~/constants/resumeTemplateSkins'
import type { ResumeTemplateVariant } from '~/constants/resumeTemplates'
import type { ResumeEditableSectionKey } from '~/types/resumeDocumentModel'

export type ResumeTemplateType = 'resume' | 'cover-page' | 'cover-letter'

export type ResumeTemplateConfig = {
  id: string
  label: string
  subtitle: string
  type: ResumeTemplateType
  image: string
  variant: ResumeTemplateVariant
  layoutMode: ResumeLayoutMode
  sections: ResumeEditableSectionKey[]
  styleVars: {
    palette?: string
    radius?: string
    typography?: string
    sectionVariant?: string
    iconStyle?: ResumeSectionIconStyleVariant
  }
  visibleOptions: {
    photo: boolean
    twoColumn: boolean
    ats: boolean
    docx: boolean
    customized: boolean
    free: boolean
    timeline: boolean
  }
}
