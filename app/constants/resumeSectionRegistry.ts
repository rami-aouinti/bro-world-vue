import type {
  ResumeEditableSectionKey,
  ResumeSectionRegion,
} from '~/types/resumeDocumentModel'

export type ResumeToolbarAction =
  | 'add-item'
  | 'change-variant'
  | 'change-content-style'
  | 'move-up'
  | 'move-down'
  | 'style-panel'
  | 'delete-section'

export type ResumeContentStyle = 'points' | 'dashes' | 'timeline'

export type ResumeSectionRegistryEntry = {
  label: string
  icon: string
  variants: Array<{ label: string; value: string }>
  defaultVariant: string
  defaultRegion: ResumeSectionRegion
  toolbarActions: ResumeToolbarAction[]
  formFields: string[]
  mediaCapabilities: {
    logo: boolean
    image: boolean
  }
  linkCapabilities: {
    github: boolean
    gitlab: boolean
  }
  contentStyles: ResumeContentStyle[]
}

export const RESUME_CONTENT_STYLE_OPTIONS: Array<{
  label: string
  value: ResumeContentStyle
}> = [
  { label: 'Points', value: 'points' },
  { label: 'Tirets', value: 'dashes' },
  { label: 'Timeline', value: 'timeline' },
]

export const RESUME_SECTION_REGISTRY: Record<
  ResumeEditableSectionKey,
  ResumeSectionRegistryEntry
> = {
  experience: {
    label: 'Experience',
    icon: 'mdi-briefcase-outline',
    variants: [
      { label: 'Detailed', value: 'detailed' },
      { label: 'Bullets', value: 'bullets' },
      { label: 'Compact', value: 'compact' },
    ],
    defaultVariant: 'detailed',
    defaultRegion: 'main',
    toolbarActions: [
      'add-item',
      'change-variant',
      'move-up',
      'move-down',
      'style-panel',
      'delete-section',
    ],
    formFields: [
      'role',
      'company',
      'companyImageUrl',
      'city',
      'start',
      'end',
      'contentStyle',
      'points',
    ],
    mediaCapabilities: { logo: true, image: false },
    linkCapabilities: { github: false, gitlab: false },
    contentStyles: ['points', 'dashes', 'timeline'],
  },
  education: {
    label: 'Education',
    icon: 'mdi-school-outline',
    variants: [
      { label: 'Classic', value: 'classic' },
      { label: 'Timeline', value: 'timeline' },
      { label: 'Two columns', value: 'two-column' },
    ],
    defaultVariant: 'classic',
    defaultRegion: 'main',
    toolbarActions: [
      'add-item',
      'change-variant',
      'move-up',
      'move-down',
      'style-panel',
      'delete-section',
    ],
    formFields: [
      'degree',
      'school',
      'schoolImageUrl',
      'city',
      'start',
      'end',
      'contentStyle',
      'points',
    ],
    mediaCapabilities: { logo: true, image: false },
    linkCapabilities: { github: false, gitlab: false },
    contentStyles: ['points', 'dashes', 'timeline'],
  },
  language: {
    label: 'Language',
    icon: 'mdi-translate',
    variants: [
      { label: 'Classic', value: 'classic' },
      { label: 'Text level', value: 'text-level' },
      { label: 'Stars', value: 'stars' },
      { label: 'Progress', value: 'progress' },
      { label: 'Flags', value: 'flags' },
    ],
    defaultVariant: 'classic',
    defaultRegion: 'aside',
    toolbarActions: [
      'add-item',
      'change-variant',
      'move-up',
      'move-down',
      'style-panel',
      'delete-section',
    ],
    formFields: ['name', 'level', 'countryCode', 'flag'],
    mediaCapabilities: { logo: false, image: false },
    linkCapabilities: { github: false, gitlab: false },
    contentStyles: [],
  },
  project: {
    label: 'Project',
    icon: 'mdi-folder-star-outline',
    variants: [
      { label: 'Classic', value: 'classic' },
      { label: 'List', value: 'list' },
      { label: 'Cards', value: 'cards' },
      { label: 'Timeline', value: 'timeline' },
      { label: 'Two columns', value: 'two-column' },
    ],
    defaultVariant: 'classic',
    defaultRegion: 'main',
    toolbarActions: [
      'add-item',
      'change-variant',
      'move-up',
      'move-down',
      'style-panel',
      'delete-section',
    ],
    formFields: [
      'name',
      'summary',
      'imageUrl',
      'repositoryUrl',
      'repositoryProvider',
      'contentStyle',
      'points',
    ],
    mediaCapabilities: { logo: false, image: true },
    linkCapabilities: { github: true, gitlab: true },
    contentStyles: ['points', 'dashes', 'timeline'],
  },
  skill: {
    label: 'Skill',
    icon: 'mdi-star-circle-outline',
    variants: [
      { label: 'Classic', value: 'classic' },
      { label: 'Text level', value: 'text-level' },
      { label: 'Stars', value: 'stars' },
      { label: 'Dots', value: 'dots' },
      { label: 'Progress', value: 'progress' },
    ],
    defaultVariant: 'progress',
    defaultRegion: 'aside',
    toolbarActions: [
      'add-item',
      'change-variant',
      'move-up',
      'move-down',
      'style-panel',
      'delete-section',
    ],
    formFields: ['name', 'level'],
    mediaCapabilities: { logo: false, image: false },
    linkCapabilities: { github: false, gitlab: false },
    contentStyles: [],
  },
  reference: {
    label: 'Reference',
    icon: 'mdi-account-voice-outline',
    variants: [{ label: 'Classic', value: 'classic' }],
    defaultVariant: 'classic',
    defaultRegion: 'aside',
    toolbarActions: [
      'add-item',
      'change-variant',
      'move-up',
      'move-down',
      'style-panel',
      'delete-section',
    ],
    formFields: ['name', 'company', 'email', 'phone'],
    mediaCapabilities: { logo: false, image: false },
    linkCapabilities: { github: false, gitlab: false },
    contentStyles: [],
  },
  hobby: {
    label: 'Hobby',
    icon: 'mdi-puzzle-heart-outline',
    variants: [{ label: 'Classic', value: 'classic' }],
    defaultVariant: 'classic',
    defaultRegion: 'aside',
    toolbarActions: [
      'add-item',
      'change-variant',
      'move-up',
      'move-down',
      'style-panel',
      'delete-section',
    ],
    formFields: ['name'],
    mediaCapabilities: { logo: false, image: false },
    linkCapabilities: { github: false, gitlab: false },
    contentStyles: [],
  },
  certification: {
    label: 'Certification',
    icon: 'mdi-certificate-outline',
    variants: [{ label: 'Classic', value: 'classic' }],
    defaultVariant: 'classic',
    defaultRegion: 'main',
    toolbarActions: [
      'add-item',
      'change-variant',
      'move-up',
      'move-down',
      'style-panel',
      'delete-section',
    ],
    formFields: ['title', 'school', 'start', 'end'],
    mediaCapabilities: { logo: false, image: false },
    linkCapabilities: { github: false, gitlab: false },
    contentStyles: [],
  },
}

export function getSectionRegistryEntry(sectionKey: ResumeEditableSectionKey) {
  return RESUME_SECTION_REGISTRY[sectionKey]
}
