import { COVER_LETTER_TEMPLATES, COVER_PAGE_TEMPLATES, RESUME_TEMPLATES } from '~/constants/resumeTemplates'

export type ResumeDocumentType = 'resume' | 'cover-page' | 'cover-letter'

export type ResumeTemplate = {
  id: string
  title: string
  image: string
  type: ResumeDocumentType
  templateId: string
}

export function useResumeTemplates() {
  const resumeTemplates = computed<ResumeTemplate[]>(() =>
    RESUME_TEMPLATES.map(template => ({
      id: `resume-${template.id}`,
      title: `Resume · ${template.title}`,
      image: template.image,
      type: 'resume',
      templateId: template.id,
    })),
  )

  const coverPageTemplates = computed<ResumeTemplate[]>(() =>
    COVER_PAGE_TEMPLATES.map(template => ({
      id: template.id,
      title: template.title,
      image: template.image,
      type: 'cover-page',
      templateId: template.id,
    })),
  )

  const coverLetterTemplates = computed<ResumeTemplate[]>(() =>
    COVER_LETTER_TEMPLATES.map(template => ({
      id: template.id,
      title: template.title,
      image: template.image,
      type: 'cover-letter',
      templateId: template.id,
    })),
  )

  const allTemplates = computed(() => [...resumeTemplates.value, ...coverPageTemplates.value, ...coverLetterTemplates.value])

  return {
    resumeTemplates,
    coverPageTemplates,
    coverLetterTemplates,
    allTemplates,
  }
}
