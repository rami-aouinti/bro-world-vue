import { RESUME_TEMPLATES_CATALOG } from '~/constants/resumeTemplates.catalog'

export type ResumeTemplateVariant =
  | 'classic'
  | 'modern'
  | 'professional'
  | 'traditional'
  | 'creative'
  | 'minimalist'
  | 'aurora'
  | 'executive'
  | 'terra'
  | 'ocean-split'
  | 'corporate-blue'
  | 'grid-slate'

export const DEFAULT_RESUME_TEMPLATE_ID =
  RESUME_TEMPLATES_CATALOG.find((template) => template.type === 'resume')?.id ??
  'classic'

export const RESUME_TEMPLATES = RESUME_TEMPLATES_CATALOG.filter(
  (t) => t.type === 'resume',
).map((t) => ({
  id: t.id,
  title: t.label,
  subtitle: t.subtitle,
  image: t.image,
  variant: t.variant,
  flags: t.visibleOptions,
}))

export const COVER_PAGE_TEMPLATES = RESUME_TEMPLATES_CATALOG.filter(
  (t) => t.type === 'cover-page',
).map((t) => ({
  id: t.id,
  title: t.label,
  subtitle: t.subtitle,
  image: t.image,
}))

export const COVER_LETTER_TEMPLATES = RESUME_TEMPLATES_CATALOG.filter(
  (t) => t.type === 'cover-letter',
).map((t) => ({
  id: t.id,
  title: t.label,
  subtitle: t.subtitle,
  image: t.image,
}))

export const RESUME_TEMPLATE_IDS = RESUME_TEMPLATES.map(
  (template) => template.id,
)
export const COVER_PAGE_TEMPLATE_IDS = COVER_PAGE_TEMPLATES.map(
  (template) => template.id,
)
export const COVER_LETTER_TEMPLATE_IDS = COVER_LETTER_TEMPLATES.map(
  (template) => template.id,
)
