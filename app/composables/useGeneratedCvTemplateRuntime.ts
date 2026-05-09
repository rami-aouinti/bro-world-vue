import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { getGeneratedTemplateDesign } from '~/utils/generatedTemplateNormalizer'
import {
  normalizeGeneratedTemplate,
  type GeneratedResumeTemplateColumn,
  type NormalizedGeneratedTemplateSection,
} from '~/utils/resumeGeneratedTemplate'

export type GeneratedCvTemplateRuntimeSection =
  NormalizedGeneratedTemplateSection & {
    icon?: string
    iconAlternatives: string[]
    form: string
    column: GeneratedResumeTemplateColumn
  }

export type GeneratedCvTemplateRuntimeOptions = {
  sectionIconOverrides?: MaybeRefOrGetter<Record<string, string> | undefined>
}

const FALLBACK_SECTION_ICON_MAP: Record<string, string> = {
  profile: 'mdi-account-outline',
  experience: 'mdi-briefcase-outline',
  education: 'mdi-school-outline',
  skills: 'mdi-tools',
  certifications: 'mdi-certificate-outline',
  languages: 'mdi-translate',
  references: 'mdi-account-group-outline',
  hobbies: 'mdi-heart-outline',
  interests: 'mdi-heart-outline',
  projects: 'mdi-folder-star-outline',
  contact: 'mdi-card-account-phone-outline',
  languagesLabel: 'mdi-format-letter-case',
}

const SECTION_FORM_ALIASES: Record<string, string> = {
  certification: 'certifications',
  certifications: 'certifications',
  hobby: 'interests',
  hobbies: 'interests',
  interest: 'interests',
  interests: 'interests',
}

const SECTION_RUNTIME_KEYS = [
  'contact',
  'identity',
  'photo',
  'fullName',
  'role',
  'profile',
  'experience',
  'education',
  'skills',
  'projects',
  'languages',
  'certification',
  'certifications',
  'references',
  'hobby',
  'hobbies',
] as const

function normalizeSectionKey(raw: string) {
  const key = String(raw || '')
    .trim()
    .toLowerCase()
  if (key === 'certification') return 'certifications'
  if (key === 'hobby' || key === 'interest' || key === 'interests')
    return 'hobbies'
  return key
}

function readSectionConfig(sections: unknown, sectionKey: string) {
  if (!sections || typeof sections !== 'object') return {}
  const sectionRecord = sections as Record<string, any>
  const directValue = sectionRecord[sectionKey]
  if (directValue !== undefined)
    return directValue && typeof directValue === 'object' ? directValue : {}

  const normalizedSectionKey = normalizeSectionKey(sectionKey)
  const matchingEntry = Object.entries(sectionRecord).find(
    ([sourceKey]) => normalizeSectionKey(sourceKey) === normalizedSectionKey,
  )
  const matchedValue = matchingEntry?.[1]
  return matchedValue && typeof matchedValue === 'object' ? matchedValue : {}
}

function readSectionForm(
  sections: unknown,
  sectionKey: string,
  fallback = 'classic',
) {
  if (!sections || typeof sections !== 'object') return fallback
  const sectionRecord = sections as Record<string, any>
  const lookupKey = SECTION_FORM_ALIASES[sectionKey] || sectionKey
  const value = sectionRecord[lookupKey]
  if (typeof value === 'string' && value) return value
  if (value && typeof value === 'object') {
    const form = (value as Record<string, any>).form
    if (typeof form === 'string' && form) return form
  }
  return fallback
}

function normalizeColumn(value: unknown): GeneratedResumeTemplateColumn {
  return value === 'half' ? 'half' : 'full'
}

function isAsideZone(zone: NormalizedGeneratedTemplateSection['zone']) {
  return zone === 'aside' || zone === 'aside-left' || zone === 'aside-right'
}

export function useGeneratedCvTemplateRuntime(
  activeTemplate: MaybeRefOrGetter<any>,
  options: GeneratedCvTemplateRuntimeOptions = {},
) {
  const normalizedTemplate = computed(() => {
    const template = toValue(activeTemplate) || {}
    const sections = template?.sections || {}
    const iconOverrides = toValue(options.sectionIconOverrides) || {}
    const normalizedSections = normalizeGeneratedTemplate(template).map(
      (section): GeneratedCvTemplateRuntimeSection => {
        const config = readSectionConfig(sections, section.sourceKey) as Record<
          string,
          any
        >
        const key = normalizeSectionKey(section.key)
        const iconOverride = iconOverrides[key]
        const icon =
          iconOverride ||
          (typeof config.icon === 'string' ? config.icon : undefined)
        const iconAlternatives = Array.isArray(config.iconAlternatives)
          ? config.iconAlternatives.filter(
              (item): item is string => typeof item === 'string' && !!item,
            )
          : []

        return {
          ...section,
          key,
          icon,
          iconAlternatives,
          form: readSectionForm(
            sections,
            section.sourceKey,
            section.form || 'classic',
          ),
          column: normalizeColumn(section.column ?? config.column),
        }
      },
    )

    return {
      ...template,
      design: getGeneratedTemplateDesign(template),
      sections: normalizedSections,
    }
  })

  const templateDesign = computed(() => normalizedTemplate.value.design)
  const allSections = computed(() =>
    normalizedTemplate.value.sections.filter(
      (section) =>
        section.enabled &&
        (section.zone === 'content' || isAsideZone(section.zone)),
    ),
  )
  const contentSections = computed(() =>
    normalizedTemplate.value.sections.filter(
      (section) => section.enabled && section.zone === 'content',
    ),
  )
  const asideSections = computed(() =>
    normalizedTemplate.value.sections.filter(
      (section) => section.enabled && isAsideZone(section.zone),
    ),
  )
  const headerSections = computed(() =>
    normalizedTemplate.value.sections.filter(
      (section) => section.enabled && section.zone === 'header',
    ),
  )
  const identitySections = computed(() =>
    normalizedTemplate.value.sections.filter(
      (section) => section.enabled && section.zone === 'identity',
    ),
  )
  const leftAsideSections = computed(() =>
    normalizedTemplate.value.sections.filter(
      (section) =>
        section.enabled &&
        (section.zone === 'aside-left' ||
          (section.zone === 'aside' &&
            (!section.side || section.side === 'left'))),
    ),
  )
  const rightAsideSections = computed(() =>
    normalizedTemplate.value.sections.filter(
      (section) =>
        section.enabled &&
        (section.zone === 'aside-right' ||
          (section.zone === 'aside' &&
            (!section.side || section.side === 'right'))),
    ),
  )
  const sectionByKey = computed(() =>
    normalizedTemplate.value.sections.reduce(
      (acc, section) => {
        acc[section.key] = section
        return acc
      },
      {} as Record<string, GeneratedCvTemplateRuntimeSection>,
    ),
  )
  const sectionVariantMap = computed(() => {
    const sections = (toValue(activeTemplate) as any)?.sections || {}
    return SECTION_RUNTIME_KEYS.reduce(
      (acc, key) => {
        acc[key] = readSectionForm(sections, key)
        return acc
      },
      {} as Record<(typeof SECTION_RUNTIME_KEYS)[number], string>,
    )
  })

  function sectionIcon(sectionKey: string) {
    const key = normalizeSectionKey(sectionKey)
    return (
      sectionByKey.value[key]?.icon ||
      FALLBACK_SECTION_ICON_MAP[key] ||
      'mdi-circle-small'
    )
  }

  function sectionForm(sectionKey: string) {
    const key = sectionKey as keyof typeof sectionVariantMap.value
    return sectionVariantMap.value[key] || 'classic'
  }

  function sectionColumn(sectionKey: string) {
    const key = normalizeSectionKey(sectionKey)
    return sectionByKey.value[key]?.column || 'full'
  }

  function sectionOrder(sectionKey: string) {
    const key = normalizeSectionKey(sectionKey)
    return sectionByKey.value[key]?.order ?? Number.MAX_SAFE_INTEGER
  }

  return {
    normalizedTemplate,
    allSections,
    contentSections,
    asideSections,
    headerSections,
    identitySections,
    leftAsideSections,
    rightAsideSections,
    sectionIcon,
    sectionForm,
    sectionColumn,
    sectionOrder,
    templateDesign,
  }
}
