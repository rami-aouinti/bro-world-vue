export type GeneratedResumeTemplateZone =
  | 'content'
  | 'aside'
  | 'aside-left'
  | 'aside-right'
  | 'header'
  | 'identity'
export type GeneratedResumeTemplateColumn = 'full' | 'half'

export type NormalizedGeneratedTemplateSection = {
  key: string
  sourceKey: string
  zone: GeneratedResumeTemplateZone
  order: number
  form?: string
  enabled: boolean
  label?: string
  column?: GeneratedResumeTemplateColumn
  side?: string
}

const DEFAULT_SECTION_ORDER: Record<
  string,
  {
    zone: GeneratedResumeTemplateZone
    order: number
    column?: GeneratedResumeTemplateColumn
  }
> = {
  profile: { zone: 'content', order: 10, column: 'full' },
  experience: { zone: 'content', order: 20, column: 'full' },
  education: { zone: 'content', order: 30, column: 'full' },
  projects: { zone: 'content', order: 40, column: 'full' },
  skills: { zone: 'aside', order: 50 },
  languages: { zone: 'aside', order: 60 },
  certifications: { zone: 'aside', order: 70 },
  references: { zone: 'aside', order: 80 },
  hobbies: { zone: 'aside', order: 90 },
}

const ADDITIONAL_SECTION_ORDER: Record<
  string,
  {
    zone: GeneratedResumeTemplateZone
    order: number
    column?: GeneratedResumeTemplateColumn
  }
> = {
  contact: { zone: 'header', order: 5 },
  identity: { zone: 'identity', order: 1 },
  photo: { zone: 'identity', order: 2 },
  fullname: { zone: 'identity', order: 3 },
  role: { zone: 'identity', order: 4 },
}

const SECTION_DEFAULTS = {
  ...DEFAULT_SECTION_ORDER,
  ...ADDITIONAL_SECTION_ORDER,
}

const RENDERABLE_SECTION_KEYS = new Set(Object.keys(SECTION_DEFAULTS))

const GENERATED_RESUME_TEMPLATE_ZONES = new Set<GeneratedResumeTemplateZone>([
  'content',
  'aside',
  'aside-left',
  'aside-right',
  'header',
  'identity',
])

const ASIDE_ZONES = new Set<GeneratedResumeTemplateZone>([
  'aside',
  'aside-left',
  'aside-right',
])

function normalizeSectionKey(raw: string) {
  const key = raw.trim().toLowerCase()
  if (key === 'certification') return 'certifications'
  if (key === 'hobby' || key === 'interest' || key === 'interests')
    return 'hobbies'
  return key
}

function normalizeZone(value: unknown, fallback: GeneratedResumeTemplateZone) {
  return GENERATED_RESUME_TEMPLATE_ZONES.has(
    value as GeneratedResumeTemplateZone,
  )
    ? (value as GeneratedResumeTemplateZone)
    : fallback
}

function normalizeSectionZone(
  key: string,
  value: unknown,
  fallback: GeneratedResumeTemplateZone,
): GeneratedResumeTemplateZone {
  const zone = normalizeZone(value, fallback)
  if (key === 'contact') return 'header'
  if (
    key === 'identity' ||
    key === 'photo' ||
    key === 'fullname' ||
    key === 'role'
  )
    return 'identity'
  return zone
}

function normalizeColumn(value: unknown): GeneratedResumeTemplateColumn {
  return value === 'half' ? 'half' : 'full'
}

function normalizeOrder(value: unknown, fallback: number) {
  const order = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(order) ? order : fallback
}

function isEnabled(value: unknown) {
  return value !== false
}

function sortByOrderThenName(
  left: NormalizedGeneratedTemplateSection,
  right: NormalizedGeneratedTemplateSection,
) {
  if (left.order !== right.order) return left.order - right.order
  return left.key.localeCompare(right.key)
}

export function normalizeGeneratedTemplate(template: any) {
  const sections = template?.sections
  const normalized: NormalizedGeneratedTemplateSection[] = []

  if (sections && typeof sections === 'object') {
    Object.entries(sections as Record<string, any>).forEach(
      ([sourceKey, rawValue], index) => {
        const key = normalizeSectionKey(sourceKey)
        if (!RENDERABLE_SECTION_KEYS.has(key)) return

        const defaults = SECTION_DEFAULTS[key]
        if (!defaults) return
        const config =
          rawValue && typeof rawValue === 'object'
            ? (rawValue as Record<string, any>)
            : {}
        const zone = normalizeSectionZone(key, config.zone, defaults.zone)
        const section: NormalizedGeneratedTemplateSection = {
          key,
          sourceKey,
          zone,
          order: normalizeOrder(config.order, defaults.order + index / 100),
          form: typeof rawValue === 'string' ? rawValue : config.form,
          enabled: isEnabled(config.enabled),
          label: typeof config.label === 'string' ? config.label : undefined,
          side: typeof config.side === 'string' ? config.side : undefined,
        }

        if (zone === 'content')
          section.column = normalizeColumn(config.column ?? defaults.column)

        normalized.push(section)
      },
    )
  }

  if (normalized.length > 0) return normalized.sort(sortByOrderThenName)

  return Object.entries(DEFAULT_SECTION_ORDER)
    .map(([key, defaults]) => {
      const section: NormalizedGeneratedTemplateSection = {
        key,
        sourceKey: key,
        zone: defaults.zone,
        order: defaults.order,
        enabled: true,
      }
      if (defaults.zone === 'content')
        section.column = defaults.column || 'full'
      return section
    })
    .sort(sortByOrderThenName)
}

export function getTemplateSectionsByZone(
  template: any,
  zone: GeneratedResumeTemplateZone,
) {
  return normalizeGeneratedTemplate(template).filter(
    (section) => section.enabled && section.zone === zone,
  )
}

export function getContentSections(template: any) {
  return getTemplateSectionsByZone(template, 'content')
}

export function getAsideSections(template: any, side?: string) {
  const sections = normalizeGeneratedTemplate(template).filter(
    (section) => section.enabled && ASIDE_ZONES.has(section.zone),
  )
  if (!side) return sections

  const normalizedSide = side.toLowerCase()
  const sideZone =
    normalizedSide === 'left'
      ? 'aside-left'
      : normalizedSide === 'right'
        ? 'aside-right'
        : undefined

  return sections.filter((section) => {
    if (sideZone && section.zone === sideZone) return true
    if (section.zone !== 'aside') return false
    return !section.side || section.side.toLowerCase() === normalizedSide
  })
}
