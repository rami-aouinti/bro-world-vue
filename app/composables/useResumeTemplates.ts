export type ResumeDocumentType = 'resume' | 'cover-page' | 'cover-letter'

export type ResumeTemplate = {
  id: string
  title: string
  image: string
  type: ResumeDocumentType
  templateId: string
}

const imagePool = ['/img/cv/cv-1.png', '/img/cv/cv-2.png', '/img/cv/cv-3.png', '/img/cv/cv-4.png', '/img/cv/cv-5.png']

export function useResumeTemplates() {
  const resumeTemplates = computed<ResumeTemplate[]>(() => [
    { id: 'resume-terra', title: 'Resume · Terra Sidebar', image: '/img/cv/cv-1.png', type: 'resume', templateId: 'terra' },
    { id: 'resume-corporate-blue', title: 'Resume · Corporate Blue', image: '/img/cv/cv-2.png', type: 'resume', templateId: 'corporate-blue' },
    { id: 'resume-ocean-split', title: 'Resume · Ocean Split', image: '/img/cv/cv-3.png', type: 'resume', templateId: 'ocean-split' },
  ])

  const coverPageTemplates = computed<ResumeTemplate[]>(() =>
    Array.from({ length: 10 }, (_, index) => ({
      id: `cover-page-template-${index + 1}`,
      title: `Cover Page · Template ${index + 1}`,
      image: imagePool[index % imagePool.length],
      type: 'cover-page',
      templateId: `cover-page-template-${index + 1}`,
    })),
  )

  const coverLetterTemplates = computed<ResumeTemplate[]>(() =>
    Array.from({ length: 10 }, (_, index) => ({
      id: `cover-letter-template-${index + 1}`,
      title: `Cover Letter · Template ${index + 1}`,
      image: imagePool[(index + 2) % imagePool.length],
      type: 'cover-letter',
      templateId: `cover-letter-template-${index + 1}`,
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
