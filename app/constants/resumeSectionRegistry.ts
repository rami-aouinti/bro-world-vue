import type {
  ResumeEditableSectionKey,
  ResumeSectionRegion,
} from '~/types/resumeDocumentModel'
import { RESUME_SECTION_VARIANTS } from '~/types/resumeSectionVariants'

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


const SECTION_VARIANT_LABELS: Record<ResumeEditableSectionKey, Record<string, string>> = {
  experience: { detailed: 'Detailed', bullets: 'Bullets', compact: 'Compact' },
  education: { classic: 'Classic', timeline: 'Timeline', 'two-column': 'Two columns' },
  language: { classic: 'Classic', 'text-level': 'Text level', stars: 'Stars', 'progress-line': 'Progress line', 'progress-circle': 'Progress circle', flags: 'Flags' },
  project: { classic: 'Classic', list: 'List', cards: 'Cards', timeline: 'Timeline', 'two-column': 'Two columns' },
  skill: { classic: 'Classic', 'text-level': 'Text level', stars: 'Stars', dots: 'Dots', progress: 'Progress' },
  reference: { classic: 'Classic' },
  hobby: { classic: 'Classic' },
  certification: { classic: 'Classic' },
}

function variantOptions(sectionKey: ResumeEditableSectionKey) {
  return RESUME_SECTION_VARIANTS[sectionKey].map((value) => ({
    value,
    label: SECTION_VARIANT_LABELS[sectionKey][value],
  }))
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
    variants: variantOptions('experience'),
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
    variants: variantOptions('education'),
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
    variants: variantOptions('language'),
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
    variants: variantOptions('project'),
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
    variants: variantOptions('skill'),
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
    icon: 'mdi-card-account-details-outline',
    variants: variantOptions('reference'),
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
    variants: variantOptions('hobby'),
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
    variants: variantOptions('certification'),
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
    formFields: ['title', 'school', 'start', 'end'],
    mediaCapabilities: { logo: false, image: false },
    linkCapabilities: { github: false, gitlab: false },
    contentStyles: [],
  },
}

export function getSectionRegistryEntry(sectionKey: ResumeEditableSectionKey) {
  return RESUME_SECTION_REGISTRY[sectionKey]
}


export function validateResumeSectionVariantSupportMatrix(rendererVariantsBySection: Partial<Record<ResumeEditableSectionKey, readonly string[]>>) {
  const mismatches: string[] = []

  for (const sectionKey of Object.keys(RESUME_SECTION_REGISTRY) as ResumeEditableSectionKey[]) {
    const exposed = RESUME_SECTION_REGISTRY[sectionKey].variants.map((variant) => variant.value)
    const rendered = rendererVariantsBySection[sectionKey]
    if (!rendered) continue
    const unsupported = exposed.filter((variant) => !rendered.includes(variant))
    if (unsupported.length) mismatches.push(`${sectionKey}: ${unsupported.join(', ')}`)
  }

  return {
    valid: mismatches.length === 0,
    mismatches,
  }
}
