export type CoverTemplateDefinition = {
  id: string
  title: string
  subtitle: string
  image: string
}

export const COVER_PAGE_TEMPLATES: CoverTemplateDefinition[] = [
  {
    id: 'cover-page-terra',
    title: 'Cover Page Terra',
    subtitle: 'Page de garde simple avec titre et photo',
    image: '/img/cv/cv-4.png',
  },
  {
    id: 'cover-page-elegant',
    title: 'Cover Page Elegant',
    subtitle: 'Page de garde élégante centrée',
    image: '/img/cv/cv-5.png',
  },
]

export const COVER_LETTER_TEMPLATES: CoverTemplateDefinition[] = [
  {
    id: 'cover-letter-classic',
    title: 'Cover Letter Classic',
    subtitle: 'Lettre classique prête à personnaliser',
    image: '/img/cv/cv-1.png',
  },
  {
    id: 'cover-letter-modern',
    title: 'Cover Letter Modern',
    subtitle: 'Lettre moderne avec mise en avant du profil',
    image: '/img/cv/cv-3.png',
  },
]

export const COVER_PAGE_TEMPLATE_IDS = COVER_PAGE_TEMPLATES.map(template => template.id)
export const COVER_LETTER_TEMPLATE_IDS = COVER_LETTER_TEMPLATES.map(template => template.id)
