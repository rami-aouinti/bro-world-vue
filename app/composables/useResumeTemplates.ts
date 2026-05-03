import {
  ALL_RESUME_DOCUMENT_TEMPLATES_CATALOG,
  RESUME_LAYOUTS_CATALOG,
  RESUME_SKINS_CATALOG,
  RESUME_STRUCTURES_CATALOG,
} from '~/constants/resumeTemplates.catalog'
import GENERATED_COVER_LETTER_TEMPLATES from '~/data/resume-templates/generated-20-cover-letter.json'
import GENERATED_COVER_PAGE_TEMPLATES from '~/data/resume-templates/generated-20-cover-page.json'
import type {
  ResumeTemplateConfig,
  ResumeTemplateType,
} from '~/types/resumeTemplateConfig'
import { toResumeRendererDesignState } from '~/composables/useResumeTemplateRuntime'

export type ResumeDocumentType = ResumeTemplateType

export type ResumeTemplate = {
  id: string
  title: string
  image: string
  type: ResumeDocumentType
  templateId: string
  layoutId?: string
}

function isValidTemplateConfig(template: ResumeTemplateConfig): boolean {
  const structure = RESUME_STRUCTURES_CATALOG.find(
    (item) => item.id === template.structureId,
  )
  const layout = RESUME_LAYOUTS_CATALOG.find(
    (item) => item.id === template.layoutId,
  )
  const skin = RESUME_SKINS_CATALOG.find((item) => item.id === template.skinId)
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
    console.error(
      `[resume-templates] Invalid template configuration for id="${template.id || 'unknown'}"`,
    )
  }
  return valid
}

export function useResumeTemplates() {
  const validTemplates = computed(() =>
    ALL_RESUME_DOCUMENT_TEMPLATES_CATALOG.filter((template) => {
      if (!isValidTemplateConfig(template)) return false
      if (template.type !== 'resume') return true
      try {
        toResumeRendererDesignState(template)
        return true
      } catch (error) {
        console.error(
          `[resume-templates] Template runtime config invalid for id="${template.id}"`,
          error,
        )
        return false
      }
    }),
  )

  const templatesByType = (type: ResumeDocumentType) =>
    computed<ResumeTemplate[]>(() =>
      validTemplates.value
        .filter((template) => template.type === type)
        .map((template) => ({
          id: template.id,
          title:
            template.type === 'resume'
              ? `Resume · ${template.label}`
              : template.label,
          image: template.image,
          type: template.type,
          templateId: template.templateId,
          layoutId: template.layoutId,
        })),
    )

  const resumeTemplates = templatesByType('resume')
  const coverPageTemplates = templatesByType('cover-page')
  const coverLetterTemplates = templatesByType('cover-letter')
  const generatedCoverPageTemplates = computed<ResumeTemplate[]>(() =>
    GENERATED_COVER_PAGE_TEMPLATES.map((template) => ({
      id: template.id,
      title: `Cover Page · ${template.name}`,
      image: `/img/cv/generated/${template.id}.png`,
      type: 'cover-page',
      templateId: template.id,
      layoutId: template.layout,
    })),
  )
  const generatedCoverLetterTemplates = computed<ResumeTemplate[]>(() =>
    GENERATED_COVER_LETTER_TEMPLATES.map((template) => ({
      id: template.id,
      title: `Cover Letter · ${template.name}`,
      image: `/img/cv/generated/${template.id}.png`,
      type: 'cover-letter',
      templateId: template.id,
      layoutId: template.layout,
    })),
  )
  const allTemplates = computed(() =>
    [
      ...validTemplates.value
        .filter((template) => template.type === 'resume')
        .map((template) => ({
          id: template.id,
          title: `Resume · ${template.label}`,
          image: template.image,
          type: template.type,
          templateId: template.templateId,
          layoutId: template.layoutId,
        })),
      ...generatedCoverPageTemplates.value,
      ...generatedCoverLetterTemplates.value,
    ] satisfies ResumeTemplate[],
  )

  return {
    resumeTemplates,
    coverPageTemplates: generatedCoverPageTemplates,
    coverLetterTemplates: generatedCoverLetterTemplates,
    allTemplates,
  }
}
