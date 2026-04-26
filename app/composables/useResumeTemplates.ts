import { COVER_LETTER_TEMPLATES, COVER_PAGE_TEMPLATES } from '~/constants/resumeTemplates'

export type ResumeDocumentType = 'resume' | 'cover-page' | 'cover-letter'

export type ResumeTemplate = {
  id: string
  title: string
  image: string
  type: ResumeDocumentType
  templateId: string
}

export function useResumeTemplates() {
  const resumeTemplates = computed<ResumeTemplate[]>(() => [
    { id: 'resume-terra', title: 'Resume · Terra Sidebar', image: '/img/cv/cv-1.png', type: 'resume', templateId: 'terra' },
    { id: 'resume-corporate-blue', title: 'Resume · Corporate Blue', image: '/img/cv/cv-2.png', type: 'resume', templateId: 'corporate-blue' },
    { id: 'resume-ocean-split', title: 'Resume · Ocean Split', image: '/img/cv/cv-3.png', type: 'resume', templateId: 'ocean-split' },
  ])

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
