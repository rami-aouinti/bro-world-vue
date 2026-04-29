import type { ResumeLayoutMode, ResumeSectionIconStyleVariant } from '~/constants/resumeTemplateSkins'
import type { ResumeEditableSectionKey } from '~/types/resumeDocumentModel'

export type ResumeTemplateType = 'resume' | 'cover-page' | 'cover-letter'

export type ResumeTemplatePalette = 'corporate-blue' | 'midnight' | 'minimal' | 'classic' | 'modern' | 'terra' | 'elegant'
export type ResumeTemplateRadius = 'none' | 'soft'
export type ResumeTemplateTypography = 'executive' | 'modern' | 'clean' | 'serif' | 'sans'
export type ResumeTemplateSectionVariant = 'detailed' | 'timeline' | 'compact' | 'classic' | 'list'
export type ResumeTemplateIconStyle = 'text' | 'outline' | 'filled' | 'rounded'
export type ResumeTemplateLayout = 'split' | 'stacked'

export type ResumeTemplateConfig = {
  id: string
  label: string
  subtitle: string
  type: ResumeTemplateType
  image: string
  templateId: 'cv-socle'
  presetId?: string
  layoutMode: ResumeTemplateLayout
  sections: ResumeEditableSectionKey[]
  styleVars: {
    palette?: ResumeTemplatePalette
    radius?: ResumeTemplateRadius
    typography?: ResumeTemplateTypography
    sectionVariant?: ResumeTemplateSectionVariant
    iconStyle?: ResumeTemplateIconStyle
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
