export const TEMPLATE_LAYOUTS = [
  'single-column',
  'two-column',
  'hybrid',
] as const
export const TEMPLATE_STRUCTURES = ['classic', 'modern', 'minimal'] as const
export const EXPERIENCE_FORMS = ['classic', 'timeline', 'cards'] as const
export const EDUCATION_FORMS = ['classic', 'timeline', 'grid'] as const
export const SKILLS_FORMS = ['dots', 'bars', 'tags'] as const
export const LANGUAGES_FORMS = ['list', 'rating', 'badges'] as const
export const LANGUAGES_LABELS = ['language', 'langues', 'idiomas'] as const
export const LINE_STYLES = ['solid', 'dashed', 'none'] as const
export const DENSITIES = [
  'compact',
  'normal',
  'comfortable',
  'spacious',
] as const
export const TEXT_STYLES = [
  'clean',
  'italic',
  'serif',
  'mono',
  'display',
] as const
export const LAYOUT_MODES = ['aside-left', 'aside-right', 'no-aside'] as const

export type TemplateLayout = (typeof TEMPLATE_LAYOUTS)[number]
export type TemplateStructure = (typeof TEMPLATE_STRUCTURES)[number]
export type ExperienceForm = (typeof EXPERIENCE_FORMS)[number]
export type EducationForm = (typeof EDUCATION_FORMS)[number]
export type SkillsForm = (typeof SKILLS_FORMS)[number]
export type LanguagesForm = (typeof LANGUAGES_FORMS)[number]
export type LanguagesLabel = (typeof LANGUAGES_LABELS)[number]
export type LineStyle = (typeof LINE_STYLES)[number]
export type Density = (typeof DENSITIES)[number]
export type TextStyle = (typeof TEXT_STYLES)[number]
export type LayoutMode = (typeof LAYOUT_MODES)[number]

export type TemplateSectionFormMap = {
  experience: ExperienceForm
  education: EducationForm
  skills: SkillsForm
  languages: LanguagesForm
}

export type TemplateConfig = {
  templateId?: string
  skinId?: string
  layout?: TemplateLayout
  structure?: TemplateStructure
  lineStyle?: LineStyle
  density?: Density
  textStyle?: TextStyle
  layoutMode?: LayoutMode
  languagesLabel?: LanguagesLabel
  forms?: Partial<TemplateSectionFormMap>
}

export type NormalizedTemplateConfig = {
  templateId: string
  skinId: string
  layout: TemplateLayout
  structure: TemplateStructure
  lineStyle: LineStyle
  density: Density
  textStyle: TextStyle
  layoutMode: LayoutMode
  languagesLabel: LanguagesLabel
  forms: TemplateSectionFormMap
}

const DEFAULT_TEMPLATE_CONFIG: NormalizedTemplateConfig = {
  templateId: 'classic',
  skinId: 'classic',
  layout: 'single-column',
  structure: 'classic',
  lineStyle: 'solid',
  density: 'normal',
  textStyle: 'clean',
  layoutMode: 'aside-left',
  languagesLabel: 'language',
  forms: {
    experience: 'classic',
    education: 'classic',
    skills: 'dots',
    languages: 'rating',
  },
}

const SECTION_FALLBACKS: TemplateSectionFormMap = {
  experience: 'classic',
  education: 'classic',
  skills: 'dots',
  languages: 'rating',
}

function normalizeEnum<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fallback: T[number],
): T[number] {
  return typeof value === 'string' &&
    (allowed as readonly string[]).includes(value)
    ? (value as T[number])
    : fallback
}

export function validateTemplateConfig(raw: unknown): NormalizedTemplateConfig {
  const candidate = (
    raw && typeof raw === 'object' ? raw : {}
  ) as TemplateConfig
  const forms =
    candidate.forms && typeof candidate.forms === 'object'
      ? candidate.forms
      : {}

  const templateId =
    typeof candidate.templateId === 'string' && candidate.templateId.trim()
      ? candidate.templateId
      : typeof candidate.skinId === 'string' && candidate.skinId.trim()
        ? candidate.skinId
        : DEFAULT_TEMPLATE_CONFIG.templateId

  return {
    templateId,
    skinId:
      typeof candidate.skinId === 'string' && candidate.skinId.trim()
        ? candidate.skinId
        : templateId,
    layout: normalizeEnum(
      candidate.layout,
      TEMPLATE_LAYOUTS,
      DEFAULT_TEMPLATE_CONFIG.layout,
    ),
    structure: normalizeEnum(
      candidate.structure,
      TEMPLATE_STRUCTURES,
      DEFAULT_TEMPLATE_CONFIG.structure,
    ),
    lineStyle: normalizeEnum(
      candidate.lineStyle,
      LINE_STYLES,
      DEFAULT_TEMPLATE_CONFIG.lineStyle,
    ),
    density: normalizeEnum(
      candidate.density,
      DENSITIES,
      DEFAULT_TEMPLATE_CONFIG.density,
    ),
    textStyle: normalizeEnum(
      candidate.textStyle,
      TEXT_STYLES,
      DEFAULT_TEMPLATE_CONFIG.textStyle,
    ),
    layoutMode: normalizeEnum(
      candidate.layoutMode,
      LAYOUT_MODES,
      DEFAULT_TEMPLATE_CONFIG.layoutMode,
    ),
    languagesLabel: normalizeEnum(
      candidate.languagesLabel,
      LANGUAGES_LABELS,
      DEFAULT_TEMPLATE_CONFIG.languagesLabel,
    ),
    forms: {
      experience: normalizeEnum(
        forms.experience,
        EXPERIENCE_FORMS,
        SECTION_FALLBACKS.experience,
      ),
      education: normalizeEnum(
        forms.education,
        EDUCATION_FORMS,
        SECTION_FALLBACKS.education,
      ),
      skills: normalizeEnum(
        forms.skills,
        SKILLS_FORMS,
        SECTION_FALLBACKS.skills,
      ),
      languages: normalizeEnum(
        forms.languages,
        LANGUAGES_FORMS,
        SECTION_FALLBACKS.languages,
      ),
    },
  }
}

export { DEFAULT_TEMPLATE_CONFIG, SECTION_FALLBACKS }
