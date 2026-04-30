export type ResumeSectionKey =
  | 'experience'
  | 'education'
  | 'language'
  | 'project'
  | 'hobby'
  | 'certification'
  | 'reference'

export type TemplateSkinId =
  | 'cv-socle'
  | 'cv-executive-portrait'
  | 'cv-midnight-banner'
  | 'cv-minimal-profile'
  | 'cv-classic'
  | 'cv-modern'

export type ResumeTemplateId =
  | 'executive-portrait'
  | 'midnight-banner'
  | 'minimal-profile'
  | 'classic'
  | 'modern'

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

const baseClasses = {
  wrapperClass: 'resume-skin__layout',
  mainClass: 'resume-skin__main',
  asideClass: 'resume-skin__aside cv-sidebar-surface',
}

const defaultLayout: ResumeRendererLayoutEntry[] = [
  { key: 'experience', region: 'main', order: 0 },
  { key: 'education', region: 'main', order: 1 },
  { key: 'project', region: 'main', order: 2 },
  { key: 'language', region: 'aside', order: 0 },
  { key: 'certification', region: 'aside', order: 1 },
]

const executiveLayout: ResumeRendererLayoutEntry[] = [
  { key: 'experience', region: 'main', order: 0 },
  { key: 'project', region: 'main', order: 1 },
  { key: 'education', region: 'main', order: 2 },
  { key: 'language', region: 'aside', order: 0 },
  { key: 'certification', region: 'aside', order: 1 },
  { key: 'reference', region: 'aside', order: 2 },
]

const midnightLayout: ResumeRendererLayoutEntry[] = [
  { key: 'education', region: 'main', order: 0 },
  { key: 'experience', region: 'main', order: 1 },
  { key: 'project', region: 'main', order: 2 },
  { key: 'certification', region: 'aside', order: 0 },
  { key: 'hobby', region: 'aside', order: 1 },
]

const minimalLayout: ResumeRendererLayoutEntry[] = [
  { key: 'experience', region: 'main', order: 0 },
  { key: 'education', region: 'main', order: 1 },
  { key: 'project', region: 'main', order: 2 },
  { key: 'language', region: 'main', order: 3 },
  { key: 'certification', region: 'main', order: 4 },
]

const classicLayout: ResumeRendererLayoutEntry[] = [
  { key: 'experience', region: 'main', order: 0 },
  { key: 'education', region: 'main', order: 1 },
  { key: 'project', region: 'main', order: 2 },
  { key: 'reference', region: 'main', order: 3 },
]

const modernLayout: ResumeRendererLayoutEntry[] = [
  { key: 'project', region: 'main', order: 0 },
  { key: 'experience', region: 'main', order: 1 },
  { key: 'education', region: 'main', order: 2 },
  { key: 'language', region: 'aside', order: 0 },
  { key: 'hobby', region: 'aside', order: 1 },
]

export const DEFAULT_TEMPLATE_SKIN_ID: TemplateSkinId = 'cv-socle'

export const RESUME_TEMPLATE_SKINS: Record<TemplateSkinId, ResumeTemplateSkin> =
  {
    'cv-socle': {
      id: 'cv-socle',
      layoutMode: 'aside-left',
      rootClass: 'resume-skin resume-skin--cv-socle',
      ...baseClasses,
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
      profile: {
        grid: 'split',
        typography: 'clean',
        spacing: 'balanced',
        colors: 'light',
        cards: 'soft',
        separators: 'line',
      },
      themeTokens: {},
      sectionTokens: {},
    },
    'cv-executive-portrait': {
      id: 'cv-executive-portrait',
      layoutMode: 'aside-left',
      rootClass: 'resume-skin resume-skin--cv-executive-portrait',
      ...baseClasses,
      showProfileInMain: true,
      showProfileInAside: false,
      showSkillsInAside: true,
      showContactInAside: true,
      showContactInHeader: false,
      showSectionIcons: true,
      sectionIconStyle: {
        size: 20,
        color: 'var(--resume-accent, var(--cv-accent))',
        roundedBackground: true,
        spacing: 10,
        variant: 'filled',
      },
      defaultSectionLayout: executiveLayout,
      profile: {
        grid: 'magazine',
        typography: 'neo-grotesk',
        spacing: 'airy',
        colors: 'contrast',
        cards: 'elevated',
        separators: 'accent',
      },
    },
    'cv-midnight-banner': {
      id: 'cv-midnight-banner',
      layoutMode: 'aside-right',
      rootClass: 'resume-skin resume-skin--cv-midnight-banner',
      ...baseClasses,
      showProfileInMain: false,
      showProfileInAside: true,
      showSkillsInAside: true,
      showContactInAside: true,
      showContactInHeader: false,
      showSectionIcons: true,
      sectionIconStyle: {
        size: 16,
        color: 'var(--resume-accent, var(--cv-accent))',
        roundedBackground: false,
        spacing: 6,
        variant: 'outline',
      },
      defaultSectionLayout: midnightLayout,
      profile: {
        grid: 'split',
        typography: 'editorial',
        spacing: 'balanced',
        colors: 'dark',
        cards: 'soft',
        separators: 'line',
      },
    },
    'cv-minimal-profile': {
      id: 'cv-minimal-profile',
      layoutMode: 'no-aside',
      rootClass: 'resume-skin resume-skin--cv-minimal-profile',
      ...baseClasses,
      showProfileInMain: true,
      showProfileInAside: false,
      showSkillsInAside: false,
      showContactInAside: false,
      showContactInHeader: true,
      showSectionIcons: false,
      sectionIconStyle: {
        size: 14,
        color: 'var(--resume-accent, var(--cv-accent))',
        roundedBackground: false,
        spacing: 4,
        variant: 'rounded',
      },
      defaultSectionLayout: minimalLayout,
      profile: {
        grid: 'single',
        typography: 'clean',
        spacing: 'compact',
        colors: 'light',
        cards: 'flat',
        separators: 'none',
      },
    },
    'cv-classic': {
      id: 'cv-classic',
      layoutMode: 'no-aside',
      rootClass: 'resume-skin resume-skin--cv-classic',
      ...baseClasses,
      showProfileInMain: false,
      showProfileInAside: false,
      showSkillsInAside: false,
      showContactInAside: false,
      showContactInHeader: true,
      showSectionIcons: false,
      sectionIconStyle: {
        size: 15,
        color: 'var(--resume-accent, var(--cv-accent))',
        roundedBackground: false,
        spacing: 4,
        variant: 'outline',
      },
      defaultSectionLayout: classicLayout,
      profile: {
        grid: 'single',
        typography: 'classic',
        spacing: 'balanced',
        colors: 'light',
        cards: 'flat',
        separators: 'line',
      },
    },
    'cv-modern': {
      id: 'cv-modern',
      layoutMode: 'aside-right',
      rootClass: 'resume-skin resume-skin--cv-modern',
      ...baseClasses,
      showProfileInMain: true,
      showProfileInAside: false,
      showSkillsInAside: true,
      showContactInAside: false,
      showContactInHeader: true,
      showSectionIcons: true,
      sectionIconStyle: {
        size: 17,
        color: 'var(--resume-accent, var(--cv-accent))',
        roundedBackground: true,
        spacing: 7,
        variant: 'rounded',
      },
      defaultSectionLayout: modernLayout,
      profile: {
        grid: 'split',
        typography: 'neo-grotesk',
        spacing: 'balanced',
        colors: 'contrast',
        cards: 'soft',
        separators: 'accent',
      },
    },
  }

export const RESUME_TEMPLATE_TO_SKIN_ID: Record<
  ResumeTemplateId,
  TemplateSkinId
> = {
  'executive-portrait': 'cv-executive-portrait',
  'midnight-banner': 'cv-midnight-banner',
  'minimal-profile': 'cv-minimal-profile',
  classic: 'cv-classic',
  modern: 'cv-modern',
}

export function resolveTemplateSkin(
  templateOrSkinId: string,
): ResumeTemplateSkin {
  const directSkin = RESUME_TEMPLATE_SKINS[templateOrSkinId as TemplateSkinId]
  if (directSkin) return directSkin

  const mappedSkinId =
    RESUME_TEMPLATE_TO_SKIN_ID[templateOrSkinId as ResumeTemplateId]
  if (mappedSkinId) return RESUME_TEMPLATE_SKINS[mappedSkinId]

  return RESUME_TEMPLATE_SKINS[DEFAULT_TEMPLATE_SKIN_ID]
}
