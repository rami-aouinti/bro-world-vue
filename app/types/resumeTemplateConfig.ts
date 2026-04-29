import type { ResumeEditableSectionKey } from '~/types/resumeDocumentModel'

export type ResumeTemplateType = 'resume' | 'cover-page' | 'cover-letter'

export type ResumeTemplatePalette = 'corporate-blue' | 'midnight' | 'minimal' | 'classic' | 'modern' | 'terra' | 'elegant'
export type ResumeTemplateRadius = 'none' | 'soft'
export type ResumeTemplateTypography = 'executive' | 'modern' | 'clean' | 'serif' | 'sans'
export type ResumeTemplateSectionVariant = 'detailed' | 'timeline' | 'compact' | 'classic' | 'list'
export type ResumeTemplateIconStyle = 'text' | 'outline' | 'filled' | 'rounded'
export type ResumeStructureId = 'no-aside' | 'aside-left' | 'aside-right'
export type ResumeLayoutId = string
export type ResumeSkinId = string

export type ResumeStructure = {
  id: ResumeStructureId
}

export type ResumeLayoutSectionPlacement = {
  section: ResumeEditableSectionKey
  zone: 'main' | 'aside'
  order: number
  priority: number
}

export type ResumeLayout = {
  id: ResumeLayoutId
  structureId: ResumeStructureId
  sections: ResumeLayoutSectionPlacement[]
}

export type ResumeSkin = {
  id: ResumeSkinId
  palette: ResumeTemplatePalette
  radius: ResumeTemplateRadius
  typography: ResumeTemplateTypography
  sectionVariant?: ResumeTemplateSectionVariant
  iconStyle: ResumeTemplateIconStyle
}

export type ResumeTemplateConfig = {
  id: string
  structureId: ResumeStructureId
  layoutId: ResumeLayoutId
  skinId: ResumeSkinId
  label: string
  subtitle: string
  type: ResumeTemplateType
  image: string
  templateId: 'cv-socle'
  presetId?: string
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
