import type { ResumeTemplateVariant } from '~/constants/resumeTemplates'

export type ResumeSectionKey = 'experience' | 'education' | 'language' | 'project'

export type ResumeRendererLayoutEntry = {
  key: ResumeSectionKey
  region: 'main' | 'aside'
  order: number
}

export type ResumeTemplateSkin = {
  id: ResumeTemplateVariant
  rootClass: string
  wrapperClass: string
  mainClass: string
  asideClass: string
  showProfileInMain: boolean
  showProfileInAside: boolean
  showSkillsInAside: boolean
  showContactInAside: boolean
  showContactInHeader: boolean
  defaultSectionLayout: ResumeRendererLayoutEntry[]
  sectionTitles?: Partial<Record<ResumeSectionKey, string>>
  themeTokens?: Record<string, string>
  sectionTokens?: Partial<Record<ResumeSectionKey, Record<string, string>>>
}

const defaultLayout: ResumeRendererLayoutEntry[] = [
  { key: 'experience', region: 'main', order: 0 },
  { key: 'education', region: 'main', order: 1 },
  { key: 'project', region: 'main', order: 2 },
  { key: 'language', region: 'aside', order: 0 },
]

function withSkin(id: ResumeTemplateVariant, overrides: Partial<ResumeTemplateSkin> = {}): ResumeTemplateSkin {
  return {
    id,
    rootClass: `resume-skin resume-skin--${id}`,
    wrapperClass: 'resume-skin__layout',
    mainClass: 'resume-skin__main',
    asideClass: 'resume-skin__aside cv-sidebar-surface',
    showProfileInMain: true,
    showProfileInAside: false,
    showSkillsInAside: true,
    showContactInAside: true,
    showContactInHeader: false,
    defaultSectionLayout: defaultLayout,
    sectionTitles: {
      experience: 'Experience',
      education: 'Education',
      language: 'Languages',
      project: 'Projects',
    },
    themeTokens: {},
    sectionTokens: {},
    ...overrides,
  }
}

export const RESUME_TEMPLATE_SKINS: Record<ResumeTemplateVariant, ResumeTemplateSkin> = {
  classic: withSkin('classic'),
  modern: withSkin('modern'),
  professional: withSkin('professional'),
  traditional: withSkin('traditional', { showContactInHeader: true, showContactInAside: false }),
  creative: withSkin('creative', { showContactInHeader: true, showContactInAside: false }),
  minimalist: withSkin('minimalist', { showContactInHeader: true, showContactInAside: false, showSkillsInAside: false }),
  aurora: withSkin('aurora', { showProfileInAside: true, showProfileInMain: false }),
  executive: withSkin('executive'),
  terra: withSkin('terra'),
  'ocean-split': withSkin('ocean-split', { showProfileInAside: true, showProfileInMain: false }),
  'corporate-blue': withSkin('corporate-blue', { showContactInHeader: true }),
}
