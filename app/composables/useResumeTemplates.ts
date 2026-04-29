import { RESUME_TEMPLATES_CATALOG } from '~/constants/resumeTemplates.catalog'
import type { ResumeTemplateConfig, ResumeTemplateType } from '~/types/resumeTemplateConfig'

export type ResumeDocumentType = ResumeTemplateType

export type ResumeTemplate = {
  id: string
  title: string
  image: string
  type: ResumeDocumentType
  templateId: string
}

function isValidTemplateConfig(template: ResumeTemplateConfig): boolean {
  const valid = Boolean(
    template.id &&
      template.label &&
      template.type &&
      template.layoutMode &&
      Array.isArray(template.sections) &&
      template.sections.length > 0,
  )
  if (!valid) {
    console.error(`[resume-templates] Invalid template configuration for id="${template.id || 'unknown'}"`)
  }
  return valid
}

export function useResumeTemplates() {
  const validTemplates = computed(() => RESUME_TEMPLATES_CATALOG.filter(isValidTemplateConfig))

  const templatesByType = (type: ResumeDocumentType) =>
    computed<ResumeTemplate[]>(() =>
      validTemplates.value
        .filter((template) => template.type === type)
        .map((template) => ({
          id: template.id,
          title: template.type === 'resume' ? `Resume · ${template.label}` : template.label,
          image: template.image,
          type: template.type,
          templateId: template.id,
        })),
    )

  const resumeTemplates = templatesByType('resume')
  const coverPageTemplates = templatesByType('cover-page')
  const coverLetterTemplates = templatesByType('cover-letter')
  const allTemplates = computed(() => validTemplates.value.map((template) => ({
    id: template.id,
    title: template.type === 'resume' ? `Resume · ${template.label}` : template.label,
    image: template.image,
    type: template.type,
    templateId: template.id,
  })))

  return { resumeTemplates, coverPageTemplates, coverLetterTemplates, allTemplates }
}
