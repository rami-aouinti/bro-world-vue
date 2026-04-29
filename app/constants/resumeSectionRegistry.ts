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
  | 'line-minus'
  | 'line-plus'

export type ResumeContentStyle = 'points' | 'dashes' | 'timeline'

export type ResumeSectionRegistryEntry = {
  labelKey: string
  icon: string
  variants: Array<{ labelKey: string; value: string }>
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


const SECTION_VARIANT_LABEL_KEYS: Record<ResumeEditableSectionKey, Record<string, string>> = {
  experience: { classic: 'resumeBuilder.create.registry.variants.classic', timeline: 'resumeBuilder.create.registry.variants.timeline', 'two-column': 'resumeBuilder.create.registry.variants.twoColumns' },
  education: { classic: 'resumeBuilder.create.registry.variants.classic', timeline: 'resumeBuilder.create.registry.variants.timeline', 'two-column': 'resumeBuilder.create.registry.variants.twoColumns' },
  language: { classic: 'resumeBuilder.create.registry.variants.classic', 'text-level': 'resumeBuilder.create.registry.variants.textLevel', stars: 'resumeBuilder.create.registry.variants.stars', 'progress-line': 'resumeBuilder.create.registry.variants.progressLine', 'progress-circle': 'resumeBuilder.create.registry.variants.progressCircle', flags: 'resumeBuilder.create.registry.variants.flags' },
  project: { classic: 'resumeBuilder.create.registry.variants.classic', list: 'resumeBuilder.create.registry.variants.list', cards: 'resumeBuilder.create.registry.variants.cards', timeline: 'resumeBuilder.create.registry.variants.timeline', 'two-column': 'resumeBuilder.create.registry.variants.twoColumns' },
  skill: { classic: 'resumeBuilder.create.registry.variants.classic', 'text-level': 'resumeBuilder.create.registry.variants.textLevel', stars: 'resumeBuilder.create.registry.variants.stars', dots: 'resumeBuilder.create.registry.variants.dots', progress: 'resumeBuilder.create.registry.variants.progress' },
  reference: { classic: 'resumeBuilder.create.registry.variants.classic' },
  hobby: { classic: 'resumeBuilder.create.registry.variants.classic' },
  certification: { classic: 'resumeBuilder.create.registry.variants.classic' },
}

function variantOptions(sectionKey: ResumeEditableSectionKey) {
  return RESUME_SECTION_VARIANTS[sectionKey].map((value) => ({
    value,
    labelKey: SECTION_VARIANT_LABEL_KEYS[sectionKey][value],
  }))
}
export const RESUME_CONTENT_STYLE_OPTIONS: Array<{
  labelKey: string
  value: ResumeContentStyle
}> = [
  { labelKey: 'resumeBuilder.create.registry.contentStyles.points', value: 'points' },
  { labelKey: 'resumeBuilder.create.registry.contentStyles.dashes', value: 'dashes' },
  { labelKey: 'resumeBuilder.create.registry.contentStyles.timeline', value: 'timeline' },
]

export const RESUME_SECTION_REGISTRY: Record<
  ResumeEditableSectionKey,
  ResumeSectionRegistryEntry
> = {
  experience: {
    labelKey: 'resumeBuilder.create.registry.sections.experience',
    icon: 'mdi-briefcase-outline',
    variants: variantOptions('experience'),
    defaultVariant: 'classic',
    defaultRegion: 'main',
    toolbarActions: [
      'add-item',
      'change-variant',
      'move-up',
      'move-down',
      'style-panel',
      'line-minus',
      'line-plus',
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
    labelKey: 'resumeBuilder.create.registry.sections.education',
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
      'line-minus',
      'line-plus',
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
    labelKey: 'resumeBuilder.create.registry.sections.language',
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
      'line-minus',
      'line-plus',
      'delete-section',
    ],
    formFields: ['name', 'level', 'countryCode', 'flag'],
    mediaCapabilities: { logo: false, image: false },
    linkCapabilities: { github: false, gitlab: false },
    contentStyles: [],
  },
  project: {
    labelKey: 'resumeBuilder.create.registry.sections.project',
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
      'line-minus',
      'line-plus',
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
    labelKey: 'resumeBuilder.create.registry.sections.skill',
    icon: 'mdi-star-outline',
    variants: variantOptions('skill'),
    defaultVariant: 'progress',
    defaultRegion: 'aside',
    toolbarActions: [
      'add-item',
      'change-variant',
      'move-up',
      'move-down',
      'style-panel',
      'line-minus',
      'line-plus',
      'delete-section',
    ],
    formFields: ['name', 'level'],
    mediaCapabilities: { logo: false, image: false },
    linkCapabilities: { github: false, gitlab: false },
    contentStyles: [],
  },
  reference: {
    labelKey: 'resumeBuilder.create.registry.sections.reference',
    icon: 'mdi-account',
    variants: variantOptions('reference'),
    defaultVariant: 'classic',
    defaultRegion: 'aside',
    toolbarActions: [
      'add-item',
      'change-variant',
      'move-up',
      'move-down',
      'style-panel',
      'line-minus',
      'line-plus',
      'delete-section',
    ],
    formFields: ['name', 'company', 'email', 'phone'],
    mediaCapabilities: { logo: false, image: false },
    linkCapabilities: { github: false, gitlab: false },
    contentStyles: [],
  },
  hobby: {
    labelKey: 'resumeBuilder.create.registry.sections.hobby',
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
      'line-minus',
      'line-plus',
      'delete-section',
    ],
    formFields: ['name'],
    mediaCapabilities: { logo: false, image: false },
    linkCapabilities: { github: false, gitlab: false },
    contentStyles: [],
  },
  certification: {
    labelKey: 'resumeBuilder.create.registry.sections.certification',
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
      'line-minus',
      'line-plus',
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
