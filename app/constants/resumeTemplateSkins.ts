import type { ResumeTemplateVariant } from '~/constants/resumeTemplates'

export type ResumeSectionKey =
  | 'experience'
  | 'education'
  | 'language'
  | 'project'
  | 'hobby'
  | 'certification'
  | 'reference'
export type TemplateSkinId = ResumeTemplateVariant | 'grid-slate'

export type ResumeRendererLayoutEntry = {
  key: ResumeSectionKey
  region: 'main' | 'aside'
  order: number
}

export type ResumeSectionIconStyleVariant = 'outline' | 'filled' | 'rounded'

export type ResumeSectionIconStyle = {
  size: number
  color: string
  roundedBackground: boolean
  spacing: number
  variant: ResumeSectionIconStyleVariant
}

export type ResumeLayoutMode = 'aside-left' | 'aside-right' | 'no-aside'

export type TemplateSkinProfile = {
  grid: 'single' | 'split' | 'magazine'
  typography: 'classic' | 'clean' | 'editorial' | 'neo-grotesk'
  spacing: 'compact' | 'balanced' | 'airy'
  colors: 'light' | 'dark' | 'contrast'
  cards: 'flat' | 'soft' | 'elevated'
  separators: 'none' | 'line' | 'accent'
}

export type ResumeTemplateSkin = {
  id: TemplateSkinId
  layoutMode: ResumeLayoutMode
  rootClass: string
  wrapperClass: string
  mainClass: string
  asideClass: string
  showProfileInMain: boolean
  showProfileInAside: boolean
  showSkillsInAside: boolean
  showContactInAside: boolean
  showContactInHeader: boolean
  showSectionIcons: boolean
  sectionIconStyle: ResumeSectionIconStyle
  defaultSectionLayout: ResumeRendererLayoutEntry[]
  sectionTitles?: Partial<Record<ResumeSectionKey, string>>
  themeTokens?: Record<string, string>
  sectionTokens?: Partial<Record<ResumeSectionKey, Record<string, string>>>
  profile: TemplateSkinProfile
}

const defaultLayout: ResumeRendererLayoutEntry[] = [
  { key: 'experience', region: 'main', order: 0 },
  { key: 'education', region: 'main', order: 1 },
  { key: 'project', region: 'main', order: 2 },
  { key: 'language', region: 'aside', order: 0 },
]

function withSkin(id: TemplateSkinId, overrides: Partial<ResumeTemplateSkin> = {}): ResumeTemplateSkin {
  return {
    id,
    layoutMode: 'aside-left',
    rootClass: `resume-skin resume-skin--${id}`,
    wrapperClass: 'resume-skin__layout',
    mainClass: 'resume-skin__main',
    asideClass: 'resume-skin__aside cv-sidebar-surface',
    showProfileInMain: true,
    showProfileInAside: false,
    showSkillsInAside: true,
    showContactInAside: true,
    showContactInHeader: false,
    showSectionIcons: true,
    sectionIconStyle: {
      size: 18,
      color: 'var(--cv-accent)',
      roundedBackground: true,
      spacing: 8,
      variant: 'outline',
    },
    defaultSectionLayout: defaultLayout,
    sectionTitles: {
      experience: 'Experience',
      education: 'Education',
      language: 'Languages',
      project: 'Projects',
      hobby: 'Interests',
      certification: 'Certifications',
      reference: 'References',
    },
    themeTokens: {},
    sectionTokens: {},
    profile: {
      grid: 'split',
      typography: 'clean',
      spacing: 'balanced',
      colors: 'light',
      cards: 'soft',
      separators: 'line',
    },
    ...overrides,
  }
}

export const RESUME_TEMPLATE_SKINS: Record<TemplateSkinId, ResumeTemplateSkin> = {
  classic: withSkin('classic', { profile: { grid: 'single', typography: 'classic', spacing: 'balanced', colors: 'light', cards: 'flat', separators: 'line' } }),
  modern: withSkin('modern', {
    layoutMode: 'aside-right',
    profile: { grid: 'split', typography: 'clean', spacing: 'balanced', colors: 'light', cards: 'soft', separators: 'line' },
  }),
  professional: withSkin('professional', { profile: { grid: 'split', typography: 'clean', spacing: 'balanced', colors: 'light', cards: 'soft', separators: 'line' } }),
  traditional: withSkin('traditional', {
    showContactInHeader: true,
    showContactInAside: false,
    profile: { grid: 'single', typography: 'classic', spacing: 'compact', colors: 'light', cards: 'flat', separators: 'line' },
  }),
  creative: withSkin('creative', {
    showContactInHeader: true,
    showContactInAside: false,
    profile: { grid: 'magazine', typography: 'editorial', spacing: 'airy', colors: 'contrast', cards: 'elevated', separators: 'accent' },
  }),
  minimalist: withSkin('minimalist', {
    layoutMode: 'no-aside',
    showSectionIcons: true,
    showContactInHeader: true,
    showContactInAside: false,
    showSkillsInAside: false,
    profile: { grid: 'single', typography: 'clean', spacing: 'airy', colors: 'light', cards: 'flat', separators: 'none' },
  }),
  aurora: withSkin('aurora', {
    showProfileInAside: true,
    showProfileInMain: false,
    profile: { grid: 'split', typography: 'neo-grotesk', spacing: 'balanced', colors: 'dark', cards: 'elevated', separators: 'accent' },
  }),
  executive: withSkin('executive', { profile: { grid: 'split', typography: 'classic', spacing: 'balanced', colors: 'contrast', cards: 'soft', separators: 'line' } }),
  terra: withSkin('terra', { profile: { grid: 'split', typography: 'editorial', spacing: 'balanced', colors: 'light', cards: 'soft', separators: 'line' } }),
  'ocean-split': withSkin('ocean-split', {
    showProfileInAside: true,
    showProfileInMain: false,
    profile: { grid: 'split', typography: 'clean', spacing: 'balanced', colors: 'contrast', cards: 'soft', separators: 'accent' },
  }),
  'corporate-blue': withSkin('corporate-blue', {
    showContactInHeader: true,
    showContactInAside: false,
    profile: { grid: 'split', typography: 'clean', spacing: 'compact', colors: 'contrast', cards: 'flat', separators: 'line' },
  }),
  'grid-slate': withSkin('grid-slate', {
    showContactInHeader: true,
    showContactInAside: false,
    profile: { grid: 'magazine', typography: 'neo-grotesk', spacing: 'airy', colors: 'dark', cards: 'elevated', separators: 'accent' },
  }),
}

export const LEGACY_TEMPLATE_TO_SKIN: Record<string, TemplateSkinId> = {
  ResumeTemplateClassic: 'classic',
  ResumeTemplateModern: 'modern',
  ResumeTemplateProfessional: 'professional',
  ResumeTemplateTraditional: 'traditional',
  ResumeTemplateCreative: 'creative',
  ResumeTemplateMinimalist: 'minimalist',
  ResumeTemplateAurora: 'aurora',
  ResumeTemplateExecutive: 'executive',
  ResumeTemplateTerra: 'terra',
  ResumeTemplateOceanSplit: 'ocean-split',
  ResumeTemplateCorporateBlue: 'corporate-blue',
  ResumeTemplateGridSlate: 'grid-slate',
}

export function resolveTemplateSkin(templateOrSkinId: string): ResumeTemplateSkin {
  const skinId = LEGACY_TEMPLATE_TO_SKIN[templateOrSkinId] ?? templateOrSkinId
  return RESUME_TEMPLATE_SKINS[skinId as TemplateSkinId] ?? RESUME_TEMPLATE_SKINS.classic
}
