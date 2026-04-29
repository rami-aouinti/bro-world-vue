import { ALL_RESUME_DOCUMENT_TEMPLATES_CATALOG } from '~/constants/resumeTemplates.catalog'
import { RESUME_LAYOUTS_CATALOG, RESUME_SKINS_CATALOG, RESUME_STRUCTURES_CATALOG } from '~/constants/resumeTemplates.catalog'
import type { ResumeTemplateConfig, ResumeTemplateType } from '~/types/resumeTemplateConfig'
import { toResumeRendererDesignState } from '~/composables/useResumeTemplateRuntime'

export type ResumeDocumentType = ResumeTemplateType

export type ResumeTemplate = {
  id: string
  title: string
  image: string
  type: ResumeDocumentType
  templateId: string
}

function isValidTemplateConfig(template: ResumeTemplateConfig): boolean {
  const structure = RESUME_STRUCTURES_CATALOG.find(item => item.id === template.structureId)
  const layout = RESUME_LAYOUTS_CATALOG.find(item => item.id === template.layoutId)
  const skin = RESUME_SKINS_CATALOG.find(item => item.id === template.skinId)
  const valid = Boolean(
    template.id &&
      template.label &&
      template.type &&
      template.templateId &&
      structure &&
      layout &&
      skin &&
      layout.structureId === template.structureId &&
      layout.sections.length > 0,
  )
  if (!valid) {
    console.error(`[resume-templates] Invalid template configuration for id="${template.id || 'unknown'}"`)
  }
  return valid
}

export function useResumeTemplates() {
  const validTemplates = computed(() => ALL_RESUME_DOCUMENT_TEMPLATES_CATALOG.filter((template) => {
    if (!isValidTemplateConfig(template)) return false
    try {
      toResumeRendererDesignState(template)
      return true
    } catch (error) {
      console.error(`[resume-templates] Template runtime config invalid for id="${template.id}"`, error)
      return false
    }
  }))

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
