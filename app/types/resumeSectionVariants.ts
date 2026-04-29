import type { ResumeEditableSectionKey } from '~/types/resumeDocumentModel'

export type ResumeTemplateSharedSectionVariant =
  | 'detailed'
  | 'timeline'
  | 'compact'
  | 'classic'
  | 'list'

export type ResumeSectionVariantBySection = {
  experience: 'detailed' | 'bullets' | 'compact'
  education: 'classic' | 'timeline' | 'two-column'
  language:
    | 'classic'
    | 'text-level'
    | 'stars'
    | 'progress-line'
    | 'progress-circle'
    | 'flags'
  project: 'classic' | 'list' | 'cards' | 'timeline' | 'two-column'
  skill: 'classic' | 'text-level' | 'stars' | 'dots' | 'progress'
  reference: 'classic'
  hobby: 'classic'
  certification: 'classic'
}

export type ResumeSectionVariant<K extends ResumeEditableSectionKey> =
  ResumeSectionVariantBySection[K]

export const RESUME_SECTION_VARIANTS = {
  experience: ['detailed', 'bullets', 'compact'],
  education: ['classic', 'timeline', 'two-column'],
  language: [
    'classic',
    'text-level',
    'stars',
    'progress-line',
    'progress-circle',
    'flags',
  ],
  project: ['classic', 'list', 'cards', 'timeline', 'two-column'],
  skill: ['classic', 'text-level', 'stars', 'dots', 'progress'],
  reference: ['classic'],
  hobby: ['classic'],
  certification: ['classic'],
} as const satisfies {
  [K in ResumeEditableSectionKey]: readonly ResumeSectionVariant<K>[]
}

export const RESUME_SHARED_SECTION_VARIANTS = {
  language: ['text-level', 'stars', 'progress-line', 'flags'],
  project: ['list', 'cards', 'two-column'],
  certification: ['classic'],
  reference: ['classic'],
  hobby: ['classic'],
} as const
