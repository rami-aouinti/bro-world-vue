export const TEMPLATE_LAYOUTS = [
  'single-column',
  'two-column',
  'hybrid',
] as const
export const TEMPLATE_STRUCTURES = ['classic', 'modern', 'minimal', 'structure-1', 'structure-2'] as const
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

export const COLUMN_GAPS = ['compact', 'normal', 'wide'] as const
export const ASIDE_WIDTH_MODES = ['narrow', 'standard', 'wide'] as const
export const SECTION_SPACINGS = ['tight', 'normal', 'loose'] as const
export const PHOTO_SHAPES = ['circle', 'rounded', 'square', 'hex', 'blob'] as const
export const PHOTO_SHADOWS = ['none', 'soft', 'hard'] as const
export const PHOTO_FRAMES = ['none', 'line', 'double'] as const
export const LEVEL_STYLES = ['dots', 'bars', 'text'] as const
export const DECOR_PRESETS = ['none', 'minimal', 'geo'] as const
export const TITLE_ICONS = ['none', 'outline', 'filled'] as const
export const TITLE_UNDERLINES = ['none', 'solid', 'accent'] as const
export const TITLE_CASINGS = ['normal', 'uppercase', 'smallcaps'] as const

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
export type LevelStyle = (typeof LEVEL_STYLES)[number]

export type TemplateSectionFormMap = {
  experience: ExperienceForm
  education: EducationForm
  skills: SkillsForm
  languages: LanguagesForm
}

export type TemplateStructureConfig = {
  main?: string[]
  aside?: string[]
}

export type TemplateConfig = {
  templateId?: string
  skinId?: string
  layout?: TemplateLayout
  structure?: TemplateStructure
  structureConfig?: TemplateStructureConfig
  lineStyle?: LineStyle
  density?: Density
  textStyle?: TextStyle
  layoutMode?: LayoutMode
  languagesLabel?: LanguagesLabel
  forms?: Partial<TemplateSectionFormMap>
  layoutOptions?: {
    columnsGap?: (typeof COLUMN_GAPS)[number]
    asideWidthMode?: (typeof ASIDE_WIDTH_MODES)[number]
    sectionSpacing?: (typeof SECTION_SPACINGS)[number]
  }
  photoOptions?: {
    shapeList?: Array<(typeof PHOTO_SHAPES)[number]>
    shadow?: (typeof PHOTO_SHADOWS)[number]
    frame?: (typeof PHOTO_FRAMES)[number]
  }
  levelStyle?: {
    skills?: LevelStyle
    languages?: LevelStyle
  }
  decorOptions?: {
    enabled?: boolean
    preset?: (typeof DECOR_PRESETS)[number]
  }
  sectionTitleStyle?: {
    icon?: (typeof TITLE_ICONS)[number]
    underline?: (typeof TITLE_UNDERLINES)[number]
    casing?: (typeof TITLE_CASINGS)[number]
  }
  photo?: {
    position?: string
    size?: string
    shape?: string
    borderWidth?: number
    borderStyle?: string
    borderColor?: string
  }
  decor?: {
    corners?: Array<{
      shape?: string
      size?: string
      x?: string | number
      y?: string | number
      color?: string
    }>
  }
  sections?: {
    contact?: 'labels' | 'icons'
  }
}

export type NormalizedTemplatePhoto = {
  position: string
  size: string
  shape: string
  borderWidth: number
  borderStyle: string
  borderColor: string
}

export type NormalizedTemplateDecorCorner = {
  shape: string
  size: string
  x: number
  y: number
  color: string
}

export type NormalizedTemplateSections = {
  contact: 'labels' | 'icons'
}

export type NormalizedTemplateStructureConfig = {
  main: string[]
  aside: string[]
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
  layoutOptions: {
    columnsGap: (typeof COLUMN_GAPS)[number]
    asideWidthMode: (typeof ASIDE_WIDTH_MODES)[number]
    sectionSpacing: (typeof SECTION_SPACINGS)[number]
  }
  photoOptions: {
    shapeList: Array<(typeof PHOTO_SHAPES)[number]>
    shadow: (typeof PHOTO_SHADOWS)[number]
    frame: (typeof PHOTO_FRAMES)[number]
  }
  levelStyle: {
    skills: LevelStyle
    languages: LevelStyle
  }
  decorOptions: {
    enabled: boolean
    preset: (typeof DECOR_PRESETS)[number]
  }
  sectionTitleStyle: {
    icon: (typeof TITLE_ICONS)[number]
    underline: (typeof TITLE_UNDERLINES)[number]
    casing: (typeof TITLE_CASINGS)[number]
  }
  photo: NormalizedTemplatePhoto
  decor: {
    corners: NormalizedTemplateDecorCorner[]
  }
  sections: NormalizedTemplateSections
  structureConfig: NormalizedTemplateStructureConfig
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
  layoutOptions: { columnsGap: 'normal', asideWidthMode: 'standard', sectionSpacing: 'normal' },
  photoOptions: { shapeList: ['circle', 'rounded', 'square'], shadow: 'none', frame: 'none' },
  levelStyle: { skills: 'dots', languages: 'dots' },
  decorOptions: { enabled: false, preset: 'none' },
  sectionTitleStyle: { icon: 'outline', underline: 'none', casing: 'normal' },
  photo: { position: 'left', size: '96px', shape: 'circle', borderWidth: 2, borderStyle: 'solid', borderColor: '#0F4C81' },
  decor: { corners: [] },
  sections: { contact: 'labels' },
  structureConfig: {
    main: ['contact','profile','experience','education','skills','projects','languages','references','certifications','interests'],
    aside: [],
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


function normalizeNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeAxis(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number.parseFloat(String(value ?? '').replace('%', ''))
  return Number.isFinite(parsed) ? parsed : fallback
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
    layoutOptions: {
      columnsGap: normalizeEnum(candidate.layoutOptions?.columnsGap, COLUMN_GAPS, DEFAULT_TEMPLATE_CONFIG.layoutOptions.columnsGap),
      asideWidthMode: normalizeEnum(candidate.layoutOptions?.asideWidthMode, ASIDE_WIDTH_MODES, DEFAULT_TEMPLATE_CONFIG.layoutOptions.asideWidthMode),
      sectionSpacing: normalizeEnum(candidate.layoutOptions?.sectionSpacing, SECTION_SPACINGS, DEFAULT_TEMPLATE_CONFIG.layoutOptions.sectionSpacing),
    },
    photoOptions: {
      shapeList: Array.isArray(candidate.photoOptions?.shapeList) ? candidate.photoOptions.shapeList.filter((shape): shape is (typeof PHOTO_SHAPES)[number] => PHOTO_SHAPES.includes(shape as any)) : DEFAULT_TEMPLATE_CONFIG.photoOptions.shapeList,
      shadow: normalizeEnum(candidate.photoOptions?.shadow, PHOTO_SHADOWS, DEFAULT_TEMPLATE_CONFIG.photoOptions.shadow),
      frame: normalizeEnum(candidate.photoOptions?.frame, PHOTO_FRAMES, DEFAULT_TEMPLATE_CONFIG.photoOptions.frame),
    },
    levelStyle: {
      skills: normalizeEnum(candidate.levelStyle?.skills, LEVEL_STYLES, DEFAULT_TEMPLATE_CONFIG.levelStyle.skills),
      languages: normalizeEnum(candidate.levelStyle?.languages, LEVEL_STYLES, DEFAULT_TEMPLATE_CONFIG.levelStyle.languages),
    },
    decorOptions: {
      enabled: typeof candidate.decorOptions?.enabled === 'boolean' ? candidate.decorOptions.enabled : DEFAULT_TEMPLATE_CONFIG.decorOptions.enabled,
      preset: normalizeEnum(candidate.decorOptions?.preset, DECOR_PRESETS, DEFAULT_TEMPLATE_CONFIG.decorOptions.preset),
    },
    sectionTitleStyle: {
      icon: normalizeEnum(candidate.sectionTitleStyle?.icon, TITLE_ICONS, DEFAULT_TEMPLATE_CONFIG.sectionTitleStyle.icon),
      underline: normalizeEnum(candidate.sectionTitleStyle?.underline, TITLE_UNDERLINES, DEFAULT_TEMPLATE_CONFIG.sectionTitleStyle.underline),
      casing: normalizeEnum(candidate.sectionTitleStyle?.casing, TITLE_CASINGS, DEFAULT_TEMPLATE_CONFIG.sectionTitleStyle.casing),
    },
    photo: {
      position: typeof candidate.photo?.position === 'string' ? candidate.photo.position : DEFAULT_TEMPLATE_CONFIG.photo.position,
      size: typeof candidate.photo?.size === 'string' ? candidate.photo.size : DEFAULT_TEMPLATE_CONFIG.photo.size,
      shape: typeof candidate.photo?.shape === 'string' ? candidate.photo.shape : DEFAULT_TEMPLATE_CONFIG.photo.shape,
      borderWidth: normalizeNumber(candidate.photo?.borderWidth, DEFAULT_TEMPLATE_CONFIG.photo.borderWidth),
      borderStyle: typeof candidate.photo?.borderStyle === 'string' ? candidate.photo.borderStyle : DEFAULT_TEMPLATE_CONFIG.photo.borderStyle,
      borderColor: typeof candidate.photo?.borderColor === 'string' ? candidate.photo.borderColor : DEFAULT_TEMPLATE_CONFIG.photo.borderColor,
    },
    decor: {
      corners: Array.isArray(candidate.decor?.corners)
        ? candidate.decor.corners.map((corner) => ({
            shape: typeof corner?.shape === 'string' ? corner.shape : 'circle',
            size: typeof corner?.size === 'string' ? corner.size : '96px',
            x: normalizeAxis(corner?.x, 50),
            y: normalizeAxis(corner?.y, 50),
            color: typeof corner?.color === 'string' ? corner.color : '#0F4C81',
          }))
        : DEFAULT_TEMPLATE_CONFIG.decor.corners,
    },
    sections: {
      contact: candidate.sections?.contact === 'icons' ? 'icons' : 'labels',
    },
    structureConfig: {
      main: Array.isArray(candidate.structureConfig?.main) ? candidate.structureConfig.main.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : DEFAULT_TEMPLATE_CONFIG.structureConfig.main,
      aside: Array.isArray(candidate.structureConfig?.aside) ? candidate.structureConfig.aside.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : DEFAULT_TEMPLATE_CONFIG.structureConfig.aside,
    },
  }
}

export { DEFAULT_TEMPLATE_CONFIG, SECTION_FALLBACKS }
