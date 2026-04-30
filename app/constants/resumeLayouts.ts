import type { ResumeLayoutMode } from '~/constants/resumeTemplateSkins'
import { RESUME_SECTION_REGISTRY } from '~/constants/resumeSectionRegistry'
import type { ResumeEditableSectionKey } from '~/types/resumeDocumentModel'

export type ResumeLayoutZone = 'main' | 'aside'
export type ResumeLayoutPattern = 'A' | 'B' | 'C'
export type ResumeLayoutSectionKey = ResumeEditableSectionKey | 'contact'

type ResumeLayoutFallbackRule = {
  section: ResumeEditableSectionKey
  whenMissing: ResumeLayoutZone[]
}

export type ResumeLayoutDefinition = {
  layoutId: string
  structure: ResumeLayoutMode
  pattern: ResumeLayoutPattern
  objective: 'experience' | 'skills' | 'mixed-ats'
  zones: Record<ResumeLayoutZone, ResumeEditableSectionKey[]>
  sectionMapping: Record<ResumeLayoutSectionKey, ResumeLayoutZone>
  fallbackRules: ResumeLayoutFallbackRule[]
  maxPageTarget: 1
  pdfOverflowGuard: 'strict'
}

const DEFAULT_FALLBACK_RULES: ResumeLayoutFallbackRule[] = [
  { section: 'experience', whenMissing: ['main'] },
  { section: 'education', whenMissing: ['main'] },
  { section: 'project', whenMissing: ['main'] },
  { section: 'skill', whenMissing: ['aside', 'main'] },
  { section: 'language', whenMissing: ['aside', 'main'] },
  { section: 'reference', whenMissing: ['aside', 'main'] },
  { section: 'certification', whenMissing: ['aside', 'main'] },
  { section: 'hobby', whenMissing: ['aside', 'main'] },
]

function createSectionMapping(
  main: ResumeEditableSectionKey[],
  _aside: ResumeEditableSectionKey[],
): Record<ResumeLayoutSectionKey, ResumeLayoutZone> {
  return {
    contact: 'main',
    education: main.includes('education') ? 'main' : 'aside',
    experience: main.includes('experience') ? 'main' : 'aside',
    skill: main.includes('skill') ? 'main' : 'aside',
    project: main.includes('project') ? 'main' : 'aside',
    language: main.includes('language') ? 'main' : 'aside',
    certification: main.includes('certification') ? 'main' : 'aside',
    reference: main.includes('reference') ? 'main' : 'aside',
    hobby: main.includes('hobby') ? 'main' : 'aside',
  }
}

function createLayoutDefinition({
  layoutId,
  structure,
  pattern,
  objective,
  main,
  _aside,
}: {
  layoutId: string
  structure: ResumeLayoutMode
  pattern: ResumeLayoutPattern
  objective: ResumeLayoutDefinition['objective']
  main: ResumeEditableSectionKey[]
  _aside: ResumeEditableSectionKey[]
}): ResumeLayoutDefinition {
  return {
    layoutId,
    structure,
    pattern,
    objective,
    zones: { main, _aside },
    sectionMapping: createSectionMapping(main, _aside),
    fallbackRules: DEFAULT_FALLBACK_RULES,
    maxPageTarget: 1,
    pdfOverflowGuard: 'strict',
  }
}

export const RESUME_LAYOUTS: ResumeLayoutDefinition[] = [
  createLayoutDefinition({
    layoutId: 'no-aside-a',
    structure: 'no-aside',
    pattern: 'A',
    objective: 'experience',
    main: [
      'experience',
      'education',
      'project',
      'skill',
      'language',
      'reference',
      'certification',
      'hobby',
    ],
    _aside: [],
  }),
  createLayoutDefinition({
    layoutId: 'no-aside-b',
    structure: 'no-aside',
    pattern: 'B',
    objective: 'skills',
    main: [
      'skill',
      'language',
      'certification',
      'experience',
      'project',
      'education',
      'reference',
      'hobby',
    ],
    _aside: [],
  }),
  createLayoutDefinition({
    layoutId: 'no-aside-c',
    structure: 'no-aside',
    pattern: 'C',
    objective: 'mixed-ats',
    main: [
      'experience',
      'skill',
      'project',
      'education',
      'language',
      'certification',
      'reference',
      'hobby',
    ],
    _aside: [],
  }),
  createLayoutDefinition({
    layoutId: 'aside-left-a',
    structure: 'aside-left',
    pattern: 'A',
    objective: 'experience',
    main: ['experience', 'education', 'project'],
    _aside: ['skill', 'language', 'reference', 'certification', 'hobby'],
  }),
  createLayoutDefinition({
    layoutId: 'aside-left-b',
    structure: 'aside-left',
    pattern: 'B',
    objective: 'skills',
    main: ['experience', 'project', 'education'],
    _aside: ['skill', 'language', 'certification', 'hobby', 'reference'],
  }),
  createLayoutDefinition({
    layoutId: 'aside-left-c',
    structure: 'aside-left',
    pattern: 'C',
    objective: 'mixed-ats',
    main: ['experience', 'project', 'education'],
    _aside: ['skill', 'language', 'reference', 'certification', 'hobby'],
  }),
  createLayoutDefinition({
    layoutId: 'aside-right-a',
    structure: 'aside-right',
    pattern: 'A',
    objective: 'experience',
    main: ['experience', 'education', 'project'],
    _aside: ['skill', 'language', 'reference', 'certification', 'hobby'],
  }),
  createLayoutDefinition({
    layoutId: 'aside-right-b',
    structure: 'aside-right',
    pattern: 'B',
    objective: 'skills',
    main: ['experience', 'project', 'education'],
    _aside: ['skill', 'language', 'certification', 'hobby', 'reference'],
  }),
  createLayoutDefinition({
    layoutId: 'aside-right-c',
    structure: 'aside-right',
    pattern: 'C',
    objective: 'mixed-ats',
    main: ['experience', 'project', 'education'],
    _aside: ['skill', 'language', 'reference', 'certification', 'hobby'],
  }),
]

export const RESUME_LAYOUTS_BY_ID: Record<string, ResumeLayoutDefinition> =
  Object.fromEntries(RESUME_LAYOUTS.map((layout) => [layout.layoutId, layout]))

export function getResumeLayoutById(layoutId?: string | null) {
  if (!layoutId) return null
  return RESUME_LAYOUTS_BY_ID[layoutId] ?? null
}

export function getDefaultLayoutForStructure(structure: ResumeLayoutMode) {
  return (
    RESUME_LAYOUTS.find((layout) => layout.structure === structure) ??
    RESUME_LAYOUTS[0]
  )
}

export function buildLayoutEntries(layout: ResumeLayoutDefinition) {
  const explicitEntries = (['main', 'aside'] as const).flatMap((zone) =>
    layout.zones[zone].map((key, index) => ({
      key,
      region: zone,
      order: index,
      variant: RESUME_SECTION_REGISTRY[key].defaultVariant,
    })),
  )

  const existingKeys = new Set(explicitEntries.map((entry) => entry.key))
  for (const rule of layout.fallbackRules) {
    if (existingKeys.has(rule.section)) continue
    const targetZone = rule.whenMissing.find(
      (zone) => zone === 'main' || zone === 'aside',
    )
    if (!targetZone) continue
    explicitEntries.push({
      key: rule.section,
      region: targetZone,
      order: explicitEntries.filter((entry) => entry.region === targetZone)
        .length,
      variant: RESUME_SECTION_REGISTRY[rule.section].defaultVariant,
    })
    existingKeys.add(rule.section)
  }

  return explicitEntries
}
