export type ResumeSectionKey =
  | 'experience'
  | 'education'
  | 'language'
  | 'project'
  | 'hobby'
  | 'certification'
  | 'reference'

export type TemplateSkinId = 'cv-socle'
export type ResumeSectionIconStyleVariant = 'outline' | 'filled' | 'rounded'
export type ResumeLayoutMode = 'aside-left' | 'aside-right' | 'no-aside'

export type ResumeRendererLayoutEntry = {
  key: ResumeSectionKey
  region: 'main' | 'aside'
  order: number
}

export type ResumeSectionIconStyle = {
  size: number
  color: string
  roundedBackground: boolean
  spacing: number
  variant: ResumeSectionIconStyleVariant
}

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
  profile: TemplateSkinProfile
  themeTokens?: Record<string, string>
  sectionTokens?: Partial<Record<ResumeSectionKey, Record<string, string>>>
}

const defaultLayout: ResumeRendererLayoutEntry[] = [
  { key: 'experience', region: 'main', order: 0 },
  { key: 'education', region: 'main', order: 1 },
  { key: 'project', region: 'main', order: 2 },
  { key: 'language', region: 'aside', order: 0 },
  { key: 'certification', region: 'aside', order: 1 },
]

export const RESUME_TEMPLATE_SKINS: Record<TemplateSkinId, ResumeTemplateSkin> = {
  'cv-socle': {
    id: 'cv-socle', layoutMode: 'aside-left', rootClass: 'resume-skin resume-skin--cv-socle', wrapperClass: 'resume-skin__layout', mainClass: 'resume-skin__main', asideClass: 'resume-skin__aside cv-sidebar-surface',
    showProfileInMain: true, showProfileInAside: false, showSkillsInAside: true, showContactInAside: true, showContactInHeader: false, showSectionIcons: true,
    sectionIconStyle: { size: 18, color: 'var(--cv-accent)', roundedBackground: true, spacing: 8, variant: 'outline' },
    defaultSectionLayout: defaultLayout,
    profile: { grid: 'split', typography: 'clean', spacing: 'balanced', colors: 'light', cards: 'soft', separators: 'line' },
    themeTokens: {}, sectionTokens: {},
  },
}

export function resolveTemplateSkin(_templateOrSkinId: string): ResumeTemplateSkin {
  return RESUME_TEMPLATE_SKINS['cv-socle']
}
