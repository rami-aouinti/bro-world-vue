import type { ConceptPlayMode } from '~/types/game'

export interface GameConcept {
  slug: string
  title: string
  coreLoop: string[]
  rulesSummary: string[]
  uxMockSections: string[]
  plannedModes: ConceptPlayMode[]
  monetizationNotes?: string[]
  milestones: string[]
}
