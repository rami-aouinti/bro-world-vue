import type { ResumeLayoutMode } from '~/constants/resumeTemplateSkins'
import { RESUME_SECTION_REGISTRY } from '~/constants/resumeSectionRegistry'
import type { ResumeEditableSectionKey } from '~/types/resumeDocumentModel'

export type ResumeLayoutZone = 'main' | 'aside'

type ResumeLayoutFallbackRule = {
  section: ResumeEditableSectionKey
  whenMissing: ResumeLayoutZone[]
}

export type ResumeLayoutDefinition = {
  layoutId: string
  structure: ResumeLayoutMode
  zones: Record<ResumeLayoutZone, ResumeEditableSectionKey[]>
  fallbackRules: ResumeLayoutFallbackRule[]
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

export const RESUME_LAYOUTS: ResumeLayoutDefinition[] = [
  {
    layoutId: 'no-aside-a',
    structure: 'no-aside',
    zones: {
      main: ['experience', 'education', 'project', 'skill', 'language', 'reference', 'certification', 'hobby'],
      aside: [],
    },
    fallbackRules: DEFAULT_FALLBACK_RULES,
  },
  {
    layoutId: 'no-aside-b',
    structure: 'no-aside',
    zones: {
      main: ['experience', 'project', 'education', 'skill', 'language', 'certification', 'reference', 'hobby'],
      aside: [],
    },
    fallbackRules: DEFAULT_FALLBACK_RULES,
  },
  {
    layoutId: 'no-aside-c',
    structure: 'no-aside',
    zones: {
      main: ['experience', 'education', 'project', 'language', 'skill', 'reference', 'hobby', 'certification'],
      aside: [],
    },
    fallbackRules: DEFAULT_FALLBACK_RULES,
  },
  {
    layoutId: 'aside-left-a',
    structure: 'aside-left',
    zones: {
      main: ['experience', 'education', 'project'],
      aside: ['skill', 'language', 'reference', 'certification', 'hobby'],
    },
    fallbackRules: DEFAULT_FALLBACK_RULES,
  },
  {
    layoutId: 'aside-left-b',
    structure: 'aside-left',
    zones: {
      main: ['experience', 'project', 'education'],
      aside: ['skill', 'language', 'hobby', 'certification', 'reference'],
    },
    fallbackRules: DEFAULT_FALLBACK_RULES,
  },
  {
    layoutId: 'aside-left-c',
    structure: 'aside-left',
    zones: {
      main: ['experience', 'education', 'project'],
      aside: ['language', 'skill', 'reference', 'hobby', 'certification'],
    },
    fallbackRules: DEFAULT_FALLBACK_RULES,
  },
  {
    layoutId: 'aside-right-a',
    structure: 'aside-right',
    zones: {
      main: ['experience', 'education', 'project'],
      aside: ['skill', 'language', 'reference', 'certification', 'hobby'],
    },
    fallbackRules: DEFAULT_FALLBACK_RULES,
  },
  {
    layoutId: 'aside-right-b',
    structure: 'aside-right',
    zones: {
      main: ['experience', 'project', 'education'],
      aside: ['skill', 'language', 'hobby', 'certification', 'reference'],
    },
    fallbackRules: DEFAULT_FALLBACK_RULES,
  },
  {
    layoutId: 'aside-right-c',
    structure: 'aside-right',
    zones: {
      main: ['experience', 'education', 'project'],
      aside: ['language', 'skill', 'reference', 'hobby', 'certification'],
    },
    fallbackRules: DEFAULT_FALLBACK_RULES,
  },
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
    const targetZone = rule.whenMissing.find((zone) => zone === 'main' || zone === 'aside')
    if (!targetZone) continue
    explicitEntries.push({
      key: rule.section,
      region: targetZone,
      order: explicitEntries.filter((entry) => entry.region === targetZone).length,
      variant: RESUME_SECTION_REGISTRY[rule.section].defaultVariant,
    })
    existingKeys.add(rule.section)
  }

  return explicitEntries
}
