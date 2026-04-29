<script setup lang="ts">
import type {
  PageBackgroundId,
  RoundedOptionId,
  Typography,
} from '~/constants/resumeDesign'
import { DEFAULT_RESUME_TEMPLATE_ID } from '~/constants/resumeTemplates'
import { CV_SOCLE_PRESETS, resolveSoclePresetById, resolveSocleThemeTokens } from '~/constants/resumeSoclePresets'
import {
  type ResumeLayoutMode,
  type ResumeSectionIconStyleVariant,
} from '~/constants/resumeTemplateSkins'
import {
  RESUME_CONTENT_STYLE_OPTIONS,
  RESUME_SECTION_REGISTRY,
  type ResumeContentStyle,
} from '~/constants/resumeSectionRegistry'
import { useResumeDesignControls } from '~/composables/useResumeDesignControls'
import { useResumeDocumentState } from '~/composables/useResumeDocumentState'
import { useResumeContentNormalization, type TimelineEvent } from '~/composables/resume/useResumeContentNormalization'
import { useResumeMediaFields } from '~/composables/resume/useResumeMediaFields'
import {
  fromApiResumeToBuilderModel,
  fromBuilderModelToApiPayload,
} from '~/utils/resumeApiMapper'
import { levelToStars, starsToPercent } from '~/utils/resumeLanguageLevel'
import ResumeRenderer from '~/components/Resume/Templates/ResumeRenderer.vue'
import {
  isResumeEditableSectionKey,
  type ResumeEditableSectionKey,
  type ResumePreviewSectionKey,
  type ResumeSectionActionKey,
} from '~/types/resumeDocumentModel'
import {
  createResume,
  deleteResume,
  listMyResumes,
  updateResume,
} from '~/services/resumeApi'

definePageMeta({
  title: 'resumeBuilder.meta.createTitle',
  layout: 'resume',
})

const { t } = useI18n()
const { parseMultilineList, parseTimelineEvents, normalizeSectionContentStyle, applyContentFields } = useResumeContentNormalization()
const { applyExperienceLogoFromFile } = useResumeMediaFields()
const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl || 'https://bro-world.com'
const pageUrl = `${siteUrl}/resume/create`

useSeoMeta({
  title: t('resumeBuilder.meta.seo.create.title'),
  description: t('resumeBuilder.meta.seo.create.description'),
  ogTitle: t('resumeBuilder.meta.seo.create.ogTitle'),
  ogDescription: t('resumeBuilder.meta.seo.create.ogDescription'),
  ogType: 'website',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
  twitterTitle: t('resumeBuilder.meta.seo.create.twitterTitle'),
  twitterDescription: t('resumeBuilder.meta.seo.create.twitterDescription'),
  robots: 'index, follow',
})

useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
})

type ContentStyle = ResumeContentStyle
type Skill = { name: string; level: number }
type Language = {
  name: string
  level: number
  countryCode?: string
  flag?: string
}
type Experience = {
  role: string
  company: string
  companyImageUrl?: string
  city: string
  start: string
  end: string
  contentStyle?: ContentStyle
  bullets: string[]
  points?: string[]
  dashes?: string[]
  timelineEvents?: TimelineEvent[]
  timelineEventTitle?: string
  timelineDateRange?: string
  timelineDescription?: string
}
type Education = {
  degree: string
  school: string
  schoolImageUrl?: string
  city: string
  start: string
  end: string
  note: string
  contentStyle?: ContentStyle
  points?: string[]
  dashes?: string[]
  timelineEvents?: TimelineEvent[]
}
type Reference = {
  name: string
  company: string
  email: string
  phone: string
}
type Course = {
  title: string
  school: string
  start: string
  end: string
}
type Project = {
  name: string
  summary: string
  imageUrl?: string
  repositoryUrl?: string
  repositoryProvider?: 'github' | 'gitlab' | 'other'
  contentStyle?: ContentStyle
  points?: string[]
  dashes?: string[]
  timelineEvents?: TimelineEvent[]
}
type StructuredUser = {
  fullName?: string
  email?: string
  phone?: string
  address?: string
  summary?: string
  links?: string[]
}
type StructuredExperience = {
  title?: string
  company?: string
  companyImageUrl?: string
  startDate?: string
  endDate?: string
  description?: string
}
type StructuredEducation = {
  title?: string
  school?: string
  startDate?: string
  endDate?: string
  description?: string
}
type StructuredLanguage = {
  name?: string
  level?: string
  countryCode?: string
  flag?: string
}
type StructuredProject = {
  title?: string
  description?: string
  link?: string
  imageUrl?: string
  repositoryUrl?: string
  repositoryProvider?: 'github' | 'gitlab' | 'other'
}
type StructuredReference = {
  name?: string
  contact?: string
  description?: string
}
type StructuredCertificate = {
  title?: string
  issuer?: string
  date?: string
  description?: string
}
type StructuredResumeResponse = {
  data?: {
    user?: StructuredUser
    experiences?: StructuredExperience[]
    educations?: StructuredEducation[]
    skills?: string[]
    languages?: StructuredLanguage[]
    certifications?: StructuredCertificate[]
    projects?: StructuredProject[]
    references?: StructuredReference[]
    hobbies?: string[]
  }
}
type RemoteResumeSection = {
  title?: string | null
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  company?: string | null
  school?: string | null
  location?: string | null
  level?: string | null
  attachments?: string[] | null
  home_page?: string | null
}
type RemoteResumeInformation = {
  fullName?: string | null
  title?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  adresse?: string | null
}
type RemoteResumeDateMeta = {
  date?: string | null
}
type RemoteResume = {
  id: string
  documentUrl: string | null
  createdAt?: string | RemoteResumeDateMeta | null
  resumeInformation?: RemoteResumeInformation | null
  experiences?: RemoteResumeSection[]
  educations?: RemoteResumeSection[]
  skills?: RemoteResumeSection[]
  languages?: RemoteResumeSection[]
  certifications?: RemoteResumeSection[]
  projects?: RemoteResumeSection[]
  references?: RemoteResumeSection[]
  hobbies?: RemoteResumeSection[]
}
type ResumeModel = {
  role: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  country: string
  birthDate: string
  birthPlace: string
  homepage: string
  repoProfile: string
  profile: string
  photoUrl: string
  photoOffsetX: number
  photoOffsetY: number
  photoScale: number
  photoHidden: boolean
  skills: Skill[]
  languages: Language[]
  hobbies: string[]
  experiences: Experience[]
  education: Education[]
  references: Reference[]
  courses: Course[]
  projects: Project[]
}
type Template = {
  id: string
  title: string
  subtitle: string
  image: string
  documentType: 'resume' | 'cover-page' | 'cover-letter'
  hasPhoto: boolean
  isTwoColumn: boolean
  isAts: boolean
  hasDocx: boolean
  isCustomized: boolean
  isFree: boolean
  useTimeline: boolean
  variant: string
}

type LevelInputMode = 'percent' | 'stars'
type PhotoShape =
  | 'square'
  | 'rounded'
  | 'circle'
  | 'portrait-card'
  | 'soft-blob'
  | 'hex'
type PhotoShapeOption = {
  label: string
  value: PhotoShape
  icon: string
}
type DecorativeShapeType = 'circle' | 'square' | 'ring' | 'bar' | 'diamond' | 'triangle' | 'pill'
type DecorativeShapeSettings = {
  enabled: boolean
  type: DecorativeShapeType
  width: number
  height: number
  size: number
  color: string
  opacity: number
  x: number
  y: number
  rotation: number
}
type LayoutSettings = {
  photoSize: number
  photoBorderWidth: number
  photoPosition: 'left' | 'right'
  sidebarWidth: number
  sidebarHeight: number
  sectionDividerStyle: 'none' | 'line' | 'soft'
  headingCase: 'normal' | 'uppercase'
  dateColumnWidth: number
  lineDensity: 'compact' | 'comfortable'
  showSectionIcons: boolean
  showContactIcons: boolean
  sectionIconStyle: ResumeSectionIconStyleVariant
  iconSize: 's' | 'm' | 'l'
  iconColor: 'accent' | 'neutral'
  layoutMode: ResumeLayoutMode
  decorativeShapeA: DecorativeShapeSettings
  decorativeShapeB: DecorativeShapeSettings
}
type AddSectionType =
  | 'profile'
  | 'experience'
  | 'education'
  | 'skill'
  | 'language'
  | 'hobby'
  | 'project'
  | 'certification'
  | 'reference'
type SectionLayoutVariant = {
  experience: 'detailed' | 'bullets' | 'compact'
  education: 'classic' | 'timeline' | 'two-column'
  language: 'classic' | 'text-level' | 'stars' | 'progress' | 'flags'
  project: 'classic' | 'list' | 'cards' | 'two-column'
  skill: 'classic' | 'text-level' | 'stars' | 'dots' | 'progress'
  reference: 'classic'
  hobby: 'classic'
  certification: 'classic'
}
type SectionLayoutEntry<
  K extends ResumeEditableSectionKey = ResumeEditableSectionKey,
> = {
  key: K
  variant: SectionLayoutVariant[K]
  region: 'main' | 'aside'
  order: number
}

const toolbarSaveImportMenuOpen = ref(false)
const toolbarSectionMenuOpen = ref(false)
const route = useRoute()
type DesignSettings = {
  selectedTheme: string
  selectedPageBackground: PageBackgroundId
  selectedRounded: RoundedOptionId
  selectedTextStyle: Typography
  layout: LayoutSettings
}
const createDefaultDesignSettings = (): DesignSettings => ({
  selectedTheme: 'ocean',
  selectedPageBackground: 'white',
  selectedRounded: 'md',
  selectedTextStyle: 'clean',
  layout: {
    photoSize: 140,
    photoBorderWidth: 6,
    photoPosition: 'right',
    sidebarWidth: 280,
    sidebarHeight: 100,
    sectionDividerStyle: 'line',
    headingCase: 'normal',
    dateColumnWidth: 120,
    lineDensity: 'comfortable',
    showSectionIcons: true,
    showContactIcons: true,
    sectionIconStyle: 'outline',
    iconSize: 'm',
    iconColor: 'accent',
    layoutMode: CV_SOCLE_PRESETS[0]?.layoutMode ?? 'aside-left',
    decorativeShapeA: {
      enabled: false,
      type: 'circle',
      width: 120,
      height: 120,
      size: 120,
      color: '#1d4ed8',
      opacity: 0.15,
      x: 90,
      y: 4,
      rotation: 0,
    },
    decorativeShapeB: {
      enabled: false,
      type: 'square',
      width: 180,
      height: 48,
      size: 120,
      color: '#0f172a',
      opacity: 0.1,
      x: 6,
      y: 86,
      rotation: -12,
    },
  },
})
const builderPanelState = reactive({
  selectedTemplate: 'cv-socle',
  selectedPreset: CV_SOCLE_PRESETS[0]?.id ?? 'socle-classic',
  selectedDocumentType: 'resume' as Template['documentType'],
  designSettings: createDefaultDesignSettings(),
})
const selectedTemplate = toRef(builderPanelState, 'selectedTemplate')
const selectedDocumentType = toRef(builderPanelState, 'selectedDocumentType')
const selectedPreset = toRef(builderPanelState, 'selectedPreset')
const designSettings = toRef(builderPanelState, 'designSettings')
const selectedTheme = toRef(designSettings.value, 'selectedTheme')
const selectedPageBackground = toRef(
  designSettings.value,
  'selectedPageBackground',
)
const selectedRounded = toRef(designSettings.value, 'selectedRounded')
const selectedTextStyle = toRef(designSettings.value, 'selectedTextStyle')
const layoutSettings = designSettings.value.layout
const levelInputMode = ref<LevelInputMode>('percent')

const DOCUMENT_TYPE_STORAGE_KEY = 'resume-builder:selected-document-type'
const documentTypeTabOptions: Array<{
  label: string
  value: Template['documentType']
}> = [
  { label: t('resumeBuilder.create.documentType.resume'), value: 'resume' },
  { label: t('resumeBuilder.create.documentType.coverPage'), value: 'cover-page' },
  { label: t('resumeBuilder.create.documentType.coverLetter'), value: 'cover-letter' },
]

const {
  colorThemes,
  pageBackgroundOptions,
  roundedOptions,
  textStyleOptions,
  resolvePageBackground,
  isAllowedPageBackground,
  roundedPxByValue,
  textStyleVarsByValue,
} = useResumeDesignControls()
const lineDensityOptions = [
  { label: t('resumeBuilder.create.options.lineDensity.compact'), value: 'compact' },
  { label: t('resumeBuilder.create.options.lineDensity.comfortable'), value: 'comfortable' },
] as const
const sectionDividerStyleOptions = [
  { label: t('resumeBuilder.create.options.sectionDivider.line'), value: 'line' },
  { label: t('resumeBuilder.create.options.sectionDivider.soft'), value: 'soft' },
  { label: t('resumeBuilder.create.options.sectionDivider.none'), value: 'none' },
] as const
const layoutModeOptions = [
  { label: t('resumeBuilder.create.options.layoutMode.asideLeft'), value: 'aside-left' },
  { label: t('resumeBuilder.create.options.layoutMode.asideRight'), value: 'aside-right' },
  { label: t('resumeBuilder.create.options.layoutMode.noAside'), value: 'no-aside' },
] as const
const photoPositionOptions = [
  { label: t('resumeBuilder.create.options.photoPosition.left'), value: 'left' },
  { label: t('resumeBuilder.create.options.photoPosition.right'), value: 'right' },
] as const
const sectionIconStyleOptions = [
  { label: t('resumeBuilder.create.options.sectionIconStyle.outline'), value: 'outline' },
  { label: t('resumeBuilder.create.options.sectionIconStyle.filled'), value: 'filled' },
  { label: t('resumeBuilder.create.options.sectionIconStyle.rounded'), value: 'rounded' },
] as const
const iconSizeOptions = [
  { label: t('resumeBuilder.create.options.iconSize.small'), value: 's' },
  { label: t('resumeBuilder.create.options.iconSize.medium'), value: 'm' },
  { label: t('resumeBuilder.create.options.iconSize.large'), value: 'l' },
] as const
const iconColorOptions = [
  { label: t('resumeBuilder.create.options.iconColor.accent'), value: 'accent' },
  { label: t('resumeBuilder.create.options.iconColor.neutral'), value: 'neutral' },
] as const
const decorativeShapeTypeOptions = [
  { label: t('resumeBuilder.create.options.shape.circle'), value: 'circle' },
  { label: t('resumeBuilder.create.options.shape.square'), value: 'square' },
  { label: t('resumeBuilder.create.options.shape.ring'), value: 'ring' },
  { label: t('resumeBuilder.create.options.shape.bar'), value: 'bar' },
  { label: t('resumeBuilder.create.options.shape.diamond'), value: 'diamond' },
  { label: t('resumeBuilder.create.options.shape.triangle'), value: 'triangle' },
  { label: t('resumeBuilder.create.options.shape.pill'), value: 'pill' },
] as const
const photoShapeOptions = [
  { label: t('resumeBuilder.create.options.photoShape.square'), value: 'square', icon: '□' },
  { label: t('resumeBuilder.create.options.photoShape.rounded'), value: 'rounded', icon: '▢' },
  { label: t('resumeBuilder.create.options.photoShape.circle'), value: 'circle', icon: '◯' },
  { label: t('resumeBuilder.create.options.photoShape.portrait'), value: 'portrait-card', icon: '▮' },
  { label: t('resumeBuilder.create.options.photoShape.blob'), value: 'soft-blob', icon: '⬭' },
  { label: t('resumeBuilder.create.options.photoShape.hex'), value: 'hex', icon: '⬢' },
] as const satisfies ReadonlyArray<PhotoShapeOption>
const addSectionOptions = [
  { label: t('resumeBuilder.create.options.addSection.profile'), value: 'profile' },
  { label: t('resumeBuilder.create.options.addSection.experience'), value: 'experience' },
  { label: t('resumeBuilder.create.options.addSection.education'), value: 'education' },
  { label: t('resumeBuilder.create.options.addSection.skill'), value: 'skill' },
  { label: t('resumeBuilder.create.options.addSection.language'), value: 'language' },
  { label: t('resumeBuilder.create.options.addSection.hobby'), value: 'hobby' },
  { label: t('resumeBuilder.create.options.addSection.project'), value: 'project' },
  { label: t('resumeBuilder.create.options.addSection.certification'), value: 'certification' },
  { label: t('resumeBuilder.create.options.addSection.reference'), value: 'reference' },
] as const satisfies ReadonlyArray<{ label: string; value: AddSectionType }>
const sectionVariantLabels = Object.values(RESUME_SECTION_REGISTRY)
  .flatMap((section) => section.variants)
  .reduce<Record<string, string>>((accumulator, option) => {
    accumulator[option.value] = t(option.labelKey)
    return accumulator
  }, {})
const resumeContentStyleSelectItems = RESUME_CONTENT_STYLE_OPTIONS.map(
  (option) => ({
    label: t(option.labelKey),
    value: option.value,
  }),
)
const sectionConfig: {
  [K in ResumePreviewSectionKey]: {
    label: string
    collection: 'experiences' | 'education' | 'languages' | 'projects'
  }
} = {
  experience: {
    label: t('resumeBuilder.create.options.addSection.experience'),
    collection: 'experiences',
  },
  education: {
    label: t('resumeBuilder.create.options.addSection.education'),
    collection: 'education',
  },
  language: {
    label: t('resumeBuilder.create.options.addSection.language'),
    collection: 'languages',
  },
  project: {
    label: t('resumeBuilder.create.options.addSection.project'),
    collection: 'projects',
  },
}
const variantRegistry: {
  [K in ResumeEditableSectionKey]: {
    allowed: SectionLayoutVariant[K][]
    fallback: SectionLayoutVariant[K]
  }
} = {
  experience: {
    allowed: RESUME_SECTION_REGISTRY.experience.variants.map(
      (option) => option.value,
    ) as SectionLayoutVariant['experience'][],
    fallback: RESUME_SECTION_REGISTRY.experience
      .defaultVariant as SectionLayoutVariant['experience'],
  },
  education: {
    allowed: RESUME_SECTION_REGISTRY.education.variants.map(
      (option) => option.value,
    ) as SectionLayoutVariant['education'][],
    fallback: RESUME_SECTION_REGISTRY.education
      .defaultVariant as SectionLayoutVariant['education'],
  },
  language: {
    allowed: RESUME_SECTION_REGISTRY.language.variants.map(
      (option) => option.value,
    ) as SectionLayoutVariant['language'][],
    fallback: RESUME_SECTION_REGISTRY.language
      .defaultVariant as SectionLayoutVariant['language'],
  },
  project: {
    allowed: RESUME_SECTION_REGISTRY.project.variants.map(
      (option) => option.value,
    ) as SectionLayoutVariant['project'][],
    fallback: RESUME_SECTION_REGISTRY.project
      .defaultVariant as SectionLayoutVariant['project'],
  },
  skill: {
    allowed: RESUME_SECTION_REGISTRY.skill.variants.map(
      (option) => option.value,
    ) as SectionLayoutVariant['skill'][],
    fallback: RESUME_SECTION_REGISTRY.skill
      .defaultVariant as SectionLayoutVariant['skill'],
  },
  reference: {
    allowed: RESUME_SECTION_REGISTRY.reference.variants.map(
      (option) => option.value,
    ) as SectionLayoutVariant['reference'][],
    fallback: RESUME_SECTION_REGISTRY.reference
      .defaultVariant as SectionLayoutVariant['reference'],
  },
  hobby: {
    allowed: RESUME_SECTION_REGISTRY.hobby.variants.map(
      (option) => option.value,
    ) as SectionLayoutVariant['hobby'][],
    fallback: RESUME_SECTION_REGISTRY.hobby
      .defaultVariant as SectionLayoutVariant['hobby'],
  },
  certification: {
    allowed: RESUME_SECTION_REGISTRY.certification.variants.map(
      (option) => option.value,
    ) as SectionLayoutVariant['certification'][],
    fallback: RESUME_SECTION_REGISTRY.certification
      .defaultVariant as SectionLayoutVariant['certification'],
  },
}
const defaultSectionLayoutEntries: SectionLayoutEntry[] = [
  {
    key: 'experience',
    variant: RESUME_SECTION_REGISTRY.experience
      .defaultVariant as SectionLayoutVariant['experience'],
    region: RESUME_SECTION_REGISTRY.experience.defaultRegion,
    order: 0,
  },
  {
    key: 'education',
    variant: RESUME_SECTION_REGISTRY.education
      .defaultVariant as SectionLayoutVariant['education'],
    region: RESUME_SECTION_REGISTRY.education.defaultRegion,
    order: 1,
  },
  {
    key: 'project',
    variant: RESUME_SECTION_REGISTRY.project
      .defaultVariant as SectionLayoutVariant['project'],
    region: RESUME_SECTION_REGISTRY.project.defaultRegion,
    order: 2,
  },
  {
    key: 'certification',
    variant: RESUME_SECTION_REGISTRY.certification
      .defaultVariant as SectionLayoutVariant['certification'],
    region: RESUME_SECTION_REGISTRY.certification.defaultRegion,
    order: 3,
  },
  {
    key: 'skill',
    variant: RESUME_SECTION_REGISTRY.skill
      .defaultVariant as SectionLayoutVariant['skill'],
    region: RESUME_SECTION_REGISTRY.skill.defaultRegion,
    order: 0,
  },
  {
    key: 'language',
    variant: RESUME_SECTION_REGISTRY.language
      .defaultVariant as SectionLayoutVariant['language'],
    region: RESUME_SECTION_REGISTRY.language.defaultRegion,
    order: 1,
  },
  {
    key: 'reference',
    variant: RESUME_SECTION_REGISTRY.reference
      .defaultVariant as SectionLayoutVariant['reference'],
    region: RESUME_SECTION_REGISTRY.reference.defaultRegion,
    order: 2,
  },
  {
    key: 'hobby',
    variant: RESUME_SECTION_REGISTRY.hobby
      .defaultVariant as SectionLayoutVariant['hobby'],
    region: RESUME_SECTION_REGISTRY.hobby.defaultRegion,
    order: 3,
  },
]

function normalizeSectionLayout(
  entries: Array<Partial<SectionLayoutEntry>> | SectionLayoutEntry[],
) {
  const entryByKey = new Map<
    ResumeEditableSectionKey,
    Partial<SectionLayoutEntry>
  >()
  for (const entry of entries) {
    if (
      !entry ||
      typeof entry.key !== 'string' ||
      !isResumeEditableSectionKey(entry.key)
    )
      continue
    entryByKey.set(entry.key, entry)
  }

  return defaultSectionLayoutEntries.map((fallback) => {
    const entry = entryByKey.get(fallback.key)
    return {
      key: fallback.key,
      variant: normalizeSectionVariant(
        fallback.key,
        entry?.variant ?? fallback.variant,
      ),
      region:
        entry?.region === 'main' || entry?.region === 'aside'
          ? entry.region
          : fallback.region,
      order: typeof entry?.order === 'number' ? entry.order : fallback.order,
    }
  })
}
const templates: Template[] = [
  {
    id: 'cv-socle',
    title: 'Socle CV',
    subtitle: 'Template unique piloté par presets visuels',
    image: '/img/cv/cv-1.png',
    documentType: 'resume',
    hasPhoto: true,
    isTwoColumn: true,
    isAts: true,
    hasDocx: true,
    isCustomized: true,
    isFree: true,
    useTimeline: false,
    variant: DEFAULT_RESUME_TEMPLATE_ID,
  },
]

const resume = reactive<ResumeModel>({
  role: 'Communication Specialist',
  firstName: 'Emma',
  lastName: 'Anderson',
  email: 'emma.anderson@portfolio.dev',
  phone: '+1 212-555-0177',
  city: 'New York',
  country: '',
  birthDate: '',
  birthPlace: '',
  homepage: '',
  repoProfile: '',
  photoUrl: '/person.png',
  photoOffsetX: 0,
  photoOffsetY: 0,
  photoScale: 1,
  photoHidden: false,
  profile:
    'Dynamic communication specialist with strong storytelling, editorial planning, and social media execution experience. Passionate about building clear messages that engage audiences and support business goals.',
  skills: [
    { name: 'Advanced Communication Skills', level: 100 },
    { name: 'Office Technology Skills', level: 100 },
    { name: 'Motivated Attitude', level: 100 },
    { name: 'Social Media Platforms', level: 100 },
  ] as Skill[],
  languages: [
    { name: 'Spanish', level: 80, countryCode: 'ES' },
    { name: 'German', level: 80, countryCode: 'DE' },
    { name: 'English', level: 95, countryCode: 'US' },
  ] as Language[],
  hobbies: ['Photography', 'Reading', 'Traveling', 'Community Volunteering'],
  experiences: [
    {
      role: 'Sales Associate',
      company: 'Big Apple Bookstore',
      companyImageUrl: '',
      city: 'New York',
      start: 'JAN 2018',
      end: 'DEC 2020',
      contentStyle: 'points',
      bullets: [
        'Offered literary suggestions based on customer needs and preferences.',
        'Followed directions from supervisors and managed projects with precision.',
        'Organized books and adhered to bookstore policies and standards.',
      ],
      points: [
        'Offered literary suggestions based on customer needs and preferences.',
        'Followed directions from supervisors and managed projects with precision.',
        'Organized books and adhered to bookstore policies and standards.',
      ],
    },
    {
      role: 'Editorial Intern',
      company: 'NBC News',
      companyImageUrl: '',
      city: 'New York',
      start: 'JAN 2016',
      end: 'DEC 2017',
      contentStyle: 'points',
      bullets: [
        'Assisted senior editors with clerical and administrative tasks.',
        'Suggested story ideas and supported content planning meetings.',
        'Ran spellchecks and edited stories before publication.',
      ],
      points: [
        'Assisted senior editors with clerical and administrative tasks.',
        'Suggested story ideas and supported content planning meetings.',
        'Ran spellchecks and edited stories before publication.',
      ],
    },
  ] as Experience[],
  education: [
    {
      degree: 'Bachelor of Communications',
      school: 'New York University',
      city: 'New York',
      start: 'AUG 2016',
      end: 'AUG 2021',
      note: 'Working towards a Communications Degree.',
      contentStyle: 'points',
      points: ['Working towards a Communications Degree.'],
    },
    {
      degree: 'High School Diploma',
      school: 'Regis High School',
      city: 'New York',
      start: 'SEPT 2012',
      end: 'MAY 2016',
      note: 'Graduated with High Honors.',
      contentStyle: 'points',
      points: ['Graduated with High Honors.'],
    },
  ] as Education[],
  references: [
    {
      name: 'Dr. Lynn Fogel',
      company: 'Regis High School',
      email: 'fogel.l@regishs.edu',
      phone: '212-334-4775',
    },
    {
      name: 'Ken Bergman',
      company: 'New York University',
      email: 'ken.bergman@nyu.edu',
      phone: '212-055-9772',
    },
    {
      name: 'Leah Anderson',
      company: 'New York University',
      email: 'leah.anderson@nyu.edu',
      phone: '212-833-4521',
    },
  ] as Reference[],
  courses: [
    {
      title: 'Advanced Communication Practices',
      school: 'New York University',
      start: 'AUG 2015',
      end: 'MAY 2016',
    },
  ] as Course[],
  projects: [
    {
      name: 'Campus Editorial Newsletter',
      summary:
        'Led content calendar and boosted monthly newsletter open rate by 32%.',
      repositoryUrl: 'https://github.com/example/campus-editorial-newsletter',
      repositoryProvider: 'github',
      contentStyle: 'points',
      points: [
        'Led content calendar and boosted monthly newsletter open rate by 32%.',
      ],
    },
    {
      name: 'Student Podcast Launch',
      summary:
        'Created scripts and episode communication plan for a 10-episode launch.',
      repositoryUrl: 'https://gitlab.com/example/student-podcast-launch',
      repositoryProvider: 'gitlab',
      contentStyle: 'points',
      points: [
        'Created scripts and episode communication plan for a 10-episode launch.',
      ],
    },
  ] as Project[],
})

const uploadInput = ref<HTMLInputElement | null>(null)
const projectImageInputs = ref<Record<number, HTMLInputElement | null>>({})
const importPdfInput = ref<HTMLInputElement | null>(null)
const importInProgress = ref(false)
const importProgress = ref(0)
const importMessage = ref('')
const importMessageType = ref<'info' | 'success' | 'error'>('info')
const importElapsedSeconds = ref(0)
let importElapsedTimer: ReturnType<typeof setInterval> | null = null

let importProgressTimer: ReturnType<typeof setInterval> | null = null

const templatesByDocumentType = computed(() =>
  templates.filter(
    (template) => template.documentType === selectedDocumentType.value,
  ),
)
const filteredTemplates = computed(() => templatesByDocumentType.value)

const selectedTemplateConfig = computed(
  () =>
    templatesByDocumentType.value.find(
      (template) => template.id === selectedTemplate.value,
    ) ??
    templatesByDocumentType.value[0] ??
    templates[0],
)

const selectedPresetConfig = computed(() => resolveSoclePresetById(selectedPreset.value))

const soclePresetOptions = computed(() =>
  CV_SOCLE_PRESETS.map((preset) => ({ label: preset.label, value: preset.id })),
)

watch(selectedPresetConfig, (preset) => {
  if (!preset) return
  selectedTheme.value = preset.id
  selectedPageBackground.value = preset.defaults.pageBackground
  selectedRounded.value = preset.defaults.rounded
  selectedTextStyle.value = preset.defaults.textStyle
  selectedPhotoShape.value = preset.defaults.photoShape
  layoutSettings.layoutMode = preset.layoutMode
  layoutSettings.sectionDividerStyle = preset.dividerStyle ?? 'line'
  layoutSettings.sectionIconStyle = preset.iconStyle ?? 'outline'
  layoutSettings.sidebarWidth = preset.defaults.sidebarWidth
  layoutSettings.sidebarHeight = preset.defaults.sidebarHeight
  layoutSettings.lineDensity = preset.defaults.lineDensity
  layoutSettings.showSectionIcons = preset.defaults.showSectionIcons
  layoutSettings.showContactIcons = preset.defaults.showContactIcons
  layoutSettings.iconSize = preset.defaults.iconSize
  layoutSettings.iconColor = preset.defaults.iconColor
  layoutSettings.photoSize = preset.defaults.photoSize
  layoutSettings.photoBorderWidth = preset.defaults.photoBorderWidth
  layoutSettings.photoPosition = preset.defaults.photoPosition
}, { immediate: true })

const isResumeDocument = computed(() => selectedDocumentType.value === 'resume')
const isCoverDocument = computed(
  () =>
    selectedDocumentType.value === 'cover-page' ||
    selectedDocumentType.value === 'cover-letter',
)
const designMenuSupportsPhotoPosition = computed(
  () => isResumeDocument.value && selectedTemplateConfig.value.hasPhoto,
)
const designMenuSupportsAsideWidth = computed(
  () => isResumeDocument.value && layoutSettings.layoutMode !== 'no-aside',
)

function applyTemplateSelection(_templateId: string) {
  selectedTemplate.value = "cv-socle"
}

const templateShapeTypeCycle: DecorativeShapeType[] = ['circle', 'ring', 'square', 'bar', 'diamond', 'triangle', 'pill']



function selectValidTemplateForCurrentDocumentType() {
  const isCurrentTemplateValid = templatesByDocumentType.value.some(
    (template) => template.id === selectedTemplate.value,
  )

  if (isCurrentTemplateValid) return

  const fallbackTemplate = templatesByDocumentType.value[0] ?? templates[0]

  if (fallbackTemplate) {
    selectedTemplate.value = fallbackTemplate.id
  }
}

function hasRemoteSectionContent(sections?: RemoteResumeSection[]) {
  return (
    Array.isArray(sections) &&
    sections.some(
      (section) =>
        [
          section?.title,
          section?.description,
          section?.company,
          section?.school,
          section?.location,
          section?.level,
          section?.startDate,
          section?.endDate,
          section?.home_page,
        ].some((value) => String(value || '').trim().length > 0) ||
        (Array.isArray(section?.attachments) && section.attachments.length > 0),
    )
  )
}

function hasRemoteResumeContent(resumeItem: RemoteResume) {
  return (
    [
      resumeItem.experiences,
      resumeItem.educations,
      resumeItem.skills,
      resumeItem.languages,
      resumeItem.certifications,
      resumeItem.projects,
      resumeItem.references,
      resumeItem.hobbies,
    ] as Array<RemoteResumeSection[] | undefined>
  ).some(hasRemoteSectionContent)
}

function extractRemoteResumeCreatedAtValue(resumeItem: RemoteResume) {
  const createdAt = resumeItem.createdAt
  if (typeof createdAt === 'string') return createdAt
  if (createdAt && typeof createdAt === 'object')
    return String(createdAt.date || '')
  return ''
}

function parseRemoteResumeCreatedAt(
  resumeItem: RemoteResume,
): { timestamp: number; isValid: boolean } {
  const timestamp = Date.parse(extractRemoteResumeCreatedAtValue(resumeItem))
  if (Number.isNaN(timestamp)) {
    return { timestamp: Number.NEGATIVE_INFINITY, isValid: false }
  }
  return { timestamp, isValid: true }
}

onMounted(async () => {
  const storedDocumentType = localStorage.getItem(DOCUMENT_TYPE_STORAGE_KEY)
  if (
    storedDocumentType === 'resume' ||
    storedDocumentType === 'cover-page' ||
    storedDocumentType === 'cover-letter'
  ) {
    selectedDocumentType.value = storedDocumentType
  }

  const templateFromQuery = route.query.template

  if (typeof templateFromQuery === 'string') {
    const exists = templatesByDocumentType.value.some(
      (template) => template.id === templateFromQuery,
    )
    selectedTemplate.value = exists ? 'cv-socle' : 'cv-socle'
  }
  selectValidTemplateForCurrentDocumentType()

  if (!loggedIn.value) {
    await refreshSession()
  }
  if (!loggedIn.value) return

  try {
    const apiResumes = await listMyResumes()
    remoteResumes.value = Array.isArray(apiResumes) ? apiResumes : []

    const invalidCreatedAtIds: string[] = []
    const withCreatedAtMeta = remoteResumes.value.map((resumeItem) => {
      const createdAt = parseRemoteResumeCreatedAt(resumeItem)
      if (!createdAt.isValid) invalidCreatedAtIds.push(resumeItem.id)
      return {
        resumeItem,
        ...createdAt,
      }
    })

    if (import.meta.dev && invalidCreatedAtIds.length) {
      console.warn(
        '[resume/create] Invalid createdAt for remote resumes:',
        invalidCreatedAtIds,
      )
    }

    const sortedByCreatedAt = [...withCreatedAtMeta].sort((a, b) => {
      if (a.isValid && !b.isValid) return 1
      if (!a.isValid && b.isValid) return -1
      return a.timestamp - b.timestamp
    })
    const latestByDate = sortedByCreatedAt.at(-1)
    const latestResume = latestByDate?.resumeItem || remoteResumes.value.at(-1)

    const draftResumesWithContent = withCreatedAtMeta.filter(
      ({ resumeItem }) =>
        resumeItem.documentUrl === null && hasRemoteResumeContent(resumeItem),
    )
    const draftConflictExists = draftResumesWithContent.length > 1
    const shouldSkipAutoApplyForInvalidReferenceDate =
      draftConflictExists && latestByDate ? !latestByDate.isValid : false

    selectedRemoteResumeId.value = latestResume?.id || null

    if (shouldSkipAutoApplyForInvalidReferenceDate) {
      if (import.meta.dev) {
        console.warn(
          '[resume/create] Auto-apply skipped due to invalid createdAt reference and conflicting drafts:',
          draftResumesWithContent.map(({ resumeItem }) => resumeItem.id),
        )
      }
      loadedFromApi.value = false
      return
    }

    if (
      !latestResume ||
      latestResume.documentUrl !== null ||
      !hasRemoteResumeContent(latestResume)
    )
      return

    applyBuilderResumeData(fromApiResumeToBuilderModel(latestResume))
    loadedFromApi.value = true
  } catch {
    remoteResumes.value = []
    selectedRemoteResumeId.value = null
    loadedFromApi.value = false
  }
})

const templateSupportsPhoto = computed(
  () => selectedTemplateConfig.value.hasPhoto,
)
const selectedTemplateSkin = computed(() => resolveSoclePresetById(selectedPreset.value))
const {
  state: resumeDocumentState,
  hydrateFromStorage,
  migrateLegacyStorage,
  persist,
} = useResumeDocumentState(selectedPreset)
const pdfModalOpen = ref(false)
const photoDialogOpen = ref(false)
const aiCreateModalOpen = ref(false)
const aiReviewModalOpen = ref(false)
const aiProfilePrompt = ref('')
const aiReviewContent = ref('')
const aiCreateLoading = ref(false)
const aiReviewLoading = ref(false)
const aiActionError = ref('')
const aiElapsedSeconds = ref(0)
const signatureDialogOpen = ref(false)
const signatureDataUrl = ref('')
const signatureCanvas = ref<HTMLCanvasElement | null>(null)
const isDrawingSignature = ref(false)
const safePhotoShape = computed<PhotoShape>(() =>
  photoShapeOptions.some((option) => option.value === selectedPhotoShape.value)
    ? (selectedPhotoShape.value as PhotoShape)
    : 'square',
)
let aiElapsedTimer: ReturnType<typeof setInterval> | null = null
const { loggedIn, fetch: refreshSession } = useUserSession()
const remoteResumes = ref<RemoteResume[]>([])
const selectedRemoteResumeId = ref<string | null>(null)
const loadedFromApi = ref(false)
const saveModalOpen = ref(false)
const saveMode = ref<'replace' | 'create'>('replace')
const saveLoading = ref(false)
const saveStatus = ref<'idle' | 'success' | 'error'>('idle')
const saveStatusMessage = ref('')
const replaceConfirmStep = ref(false)
const deleteConfirmModalOpen = ref(false)
const resumeIdPendingDeletion = ref<string | null>(null)
const toastOpen = ref(false)
const toastMessage = ref('')
const toastColor = ref<'success' | 'error'>('success')
const loginDialogOpen = ref(false)
const loginLoading = ref(false)
const pendingPdfDownload = ref(false)
const addSectionDialogOpen = ref(false)
const addSectionType = ref<AddSectionType>('experience')
const sectionLayout = ref<SectionLayoutEntry[]>(
  normalizeSectionLayout(defaultSectionLayoutEntries),
)
const sectionItemDialogOpen = ref(false)
const activeSectionKey = ref<ResumePreviewSectionKey>('experience')
const activeVariant =
  ref<SectionLayoutVariant[ResumePreviewSectionKey]>('detailed')

watch(saveMode, () => {
  replaceConfirmStep.value = false
  saveStatus.value = 'idle'
  saveStatusMessage.value = ''
})

watch(selectedRemoteResumeId, () => {
  replaceConfirmStep.value = false
})

function showToast(message: string, color: 'success' | 'error') {
  toastMessage.value = message
  toastColor.value = color
  toastOpen.value = true
}

function openDeleteResumeConfirmation(resumeId: string) {
  resumeIdPendingDeletion.value = resumeId
  deleteConfirmModalOpen.value = true
}

async function confirmDeleteRemoteResume() {
  if (!resumeIdPendingDeletion.value) return

  const resumeId = resumeIdPendingDeletion.value
  try {
    await deleteResume(resumeId)
    remoteResumes.value = remoteResumes.value.filter(
      (item) => item.id !== resumeId,
    )

    if (selectedRemoteResumeId.value === resumeId) {
      selectedRemoteResumeId.value = remoteResumes.value.at(0)?.id ?? null
    }

    showToast(t('resumeBuilder.create.messages.resumeDeleted'), 'success')
  } catch {
    showToast(t('resumeBuilder.create.messages.resumeDeleteFailed'), 'error')
  } finally {
    deleteConfirmModalOpen.value = false
    resumeIdPendingDeletion.value = null
  }
}
// single source of truth: canonical section draft factories (used for init + reset)
const createProfileDraft = () => ({ profile: '' })
const createExperienceDraft = () => ({
  role: '',
  company: '',
  companyImageUrl: '',
  city: '',
  start: '',
  end: '',
  bullets: '',
  contentStyle: 'points' as ContentStyle,
})
const createSectionItemExperienceDraft = () => ({
  role: '',
  company: '',
  companyImageUrl: '',
  city: '',
  start: '',
  end: '',
  bullets: '',
  contentStyle: 'points' as ContentStyle,
  timelineEventTitle: '',
  timelineDateRange: '',
  timelineDescription: '',
})
const createEducationDraft = () => ({
  degree: '',
  school: '',
  schoolImageUrl: '',
  city: '',
  start: '',
  end: '',
  note: '',
  contentStyle: 'points' as ContentStyle,
})
const createSkillDraft = () => ({ name: '', level: 80 })
const createAddLanguageDraft = () => ({
  name: '',
  level: 80,
  countryCode: '',
  flag: '',
})
const createSectionItemLanguageDraft = () => ({
  name: '',
  level: 80,
  stars: 4,
  countryCode: '',
  flag: '',
})
const createHobbyDraft = () => ({ name: '' })
const createProjectDraft = () => ({
  name: '',
  summary: '',
  imageUrl: '',
  repositoryUrl: '',
  repositoryProvider: undefined as Project['repositoryProvider'],
  contentStyle: 'points' as ContentStyle,
})
const createCertificationDraft = () => ({
  title: '',
  school: '',
  start: '',
  end: '',
})
const createReferenceDraft = () => ({
  name: '',
  company: '',
  email: '',
  phone: '',
})
const sectionItemDraft = reactive({
  experience: createSectionItemExperienceDraft(),
  education: createEducationDraft(),
  language: createSectionItemLanguageDraft(),
  project: createProjectDraft(),
})
const addSectionDraft = reactive({
  profile: createProfileDraft(),
  experience: createExperienceDraft(),
  education: createEducationDraft(),
  skill: createSkillDraft(),
  language: createAddLanguageDraft(),
  hobby: createHobbyDraft(),
  project: createProjectDraft(),
  certification: createCertificationDraft(),
  reference: createReferenceDraft(),
})
const experienceLogoErrors = reactive<Record<string, string>>({})
const addSectionExperienceLogoInput = ref<HTMLInputElement | null>(null)
const sectionItemExperienceLogoInput = ref<HTMLInputElement | null>(null)

const PHOTO_MOVE_STEP = 4
const PHOTO_OFFSET_LIMIT = 48

function movePhoto(direction: 'left' | 'right' | 'up' | 'down') {
  if (direction === 'left') {
    resume.photoOffsetX = Math.max(
      -PHOTO_OFFSET_LIMIT,
      resume.photoOffsetX - PHOTO_MOVE_STEP,
    )
    return
  }
  if (direction === 'right') {
    resume.photoOffsetX = Math.min(
      PHOTO_OFFSET_LIMIT,
      resume.photoOffsetX + PHOTO_MOVE_STEP,
    )
    return
  }
  if (direction === 'up') {
    resume.photoOffsetY = Math.max(
      -PHOTO_OFFSET_LIMIT,
      resume.photoOffsetY - PHOTO_MOVE_STEP,
    )
    return
  }
  resume.photoOffsetY = Math.min(
    PHOTO_OFFSET_LIMIT,
    resume.photoOffsetY + PHOTO_MOVE_STEP,
  )
}

function applyBuilderResumeData(
  payload: ReturnType<typeof fromApiResumeToBuilderModel>,
) {
  const userNames = inferNameParts(payload.resumeInformation.fullName)
  const normalizeText = (value?: string | null) => (value ?? '').trim()

  resume.firstName = normalizeText(userNames.firstName ?? resume.firstName)
  resume.lastName = normalizeText(userNames.lastName ?? resume.lastName)
  resume.email = normalizeText(payload.email)
  resume.phone = normalizeText(payload.phone)
  resume.city = normalizeText(payload.city)
  resume.country = normalizeText(payload.country)
  resume.birthDate = normalizeText(payload.birthDate)
  resume.birthPlace = normalizeText(payload.birthPlace)
  resume.homepage = normalizeText(payload.homepage)
  resume.repoProfile = normalizeText(payload.repoProfile)
  resume.profile = normalizeText(payload.profile)

  if (payload.skills.length) {
    resume.skills = payload.skills.map((skill) => ({ ...skill }))
  }

  if (payload.languages.length) {
    resume.languages = payload.languages.map((language) => ({
      name: language.name,
      level: Number(language.level) || 75,
      countryCode: String(language.countryCode || '').trim(),
      flag: String(language.flag || '').trim(),
    }))
  }

  if (payload.hobbies.length) {
    resume.hobbies = [...payload.hobbies]
  }

  if (payload.experiences.length) {
    resume.experiences = payload.experiences.map((experience) => ({
      role: experience.role,
      company: experience.company,
      companyImageUrl: '',
      city: experience.city,
      start: experience.start,
      end: experience.end,
      bullets: [...experience.bullets],
      contentStyle: 'points',
      points: [...experience.bullets],
    }))
  }

  if (payload.education.length) {
    resume.education = payload.education.map((education) => ({
      degree: education.degree,
      school: education.school,
      schoolImageUrl: '',
      city: education.city,
      start: education.start,
      end: education.end,
      note: education.note,
      contentStyle: 'points',
      points: parseMultilineList(String(education.note || '')),
    }))
  }

  if (payload.courses.length) {
    resume.courses = payload.courses.map((course) => ({
      title: course.title,
      school: course.school,
      start: course.start,
      end: course.end,
    }))
  }

  if (payload.projects.length) {
    resume.projects = payload.projects.map((project) => ({
      name: project.name,
      summary: project.summary,
      imageUrl: '',
      repositoryUrl: project.repositoryUrl || '',
      repositoryProvider: inferRepositoryProvider(project.repositoryUrl || ''),
      contentStyle: 'points',
      points: parseMultilineList(String(project.summary || '')),
    }))
  }

  if (payload.references.length) {
    resume.references = payload.references.map((reference) => ({
      name: reference.name,
      company: reference.company,
      email: reference.email,
      phone: reference.phone,
    }))
  }
}

function openPhotoPicker() {
  uploadInput.value?.click()
}

function onPreviewPhotoClick() {
  photoDialogOpen.value = true
}

function onPhotoSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    resume.photoUrl = typeof reader.result === 'string' ? reader.result : ''
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function setProjectImageInputRef(index: number, element: Element | null) {
  projectImageInputs.value[index] = element as HTMLInputElement | null
}

function openProjectImagePicker(index: number) {
  projectImageInputs.value[index]?.click()
}

function onProjectImageSelected(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const imageUrl = typeof reader.result === 'string' ? reader.result : ''
    resume.projects[index].imageUrl = imageUrl
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function detectRepositoryProvider(
  repositoryUrl?: string,
): Project['repositoryProvider'] {
  if (!repositoryUrl) return undefined
  const normalizedUrl = repositoryUrl.toLowerCase()
  if (normalizedUrl.includes('github.com')) return 'github'
  if (normalizedUrl.includes('gitlab.com')) return 'gitlab'
  return 'other'
}

function validateHttpRepositoryUrl(value?: string) {
  if (!value) return true
  try {
    const parsed = new URL(value)
    return (
      parsed.protocol === 'http:' ||
      parsed.protocol === 'https:' ||
      t('resumeBuilder.create.validation.repositoryUrlProtocol')
    )
  } catch {
    return t('resumeBuilder.create.validation.repositoryUrlInvalid')
  }
}

function updateProjectRepositoryProvider(project: Project) {
  project.repositoryProvider = detectRepositoryProvider(project.repositoryUrl)
}

function clearPhoto() {
  resume.photoUrl = ''
}

function triggerFileInputById(id: string) {
  const input = document.getElementById(id)
  if (!(input instanceof HTMLInputElement)) return
  input.click()
}

function updateEducationImageUrl(
  target: 'resume' | 'add' | 'section',
  url: string,
  index?: number,
) {
  if (target === 'resume') {
    if (typeof index !== 'number' || !resume.education[index]) return
    resume.education[index].schoolImageUrl = url
    return
  }
  if (target === 'add') {
    addSectionDraft.education.schoolImageUrl = url
    return
  }
  sectionItemDraft.education.schoolImageUrl = url
}

function onEducationImageSelected(
  event: Event,
  target: 'resume' | 'add' | 'section',
  index?: number,
) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    updateEducationImageUrl(
      target,
      typeof reader.result === 'string' ? reader.result : '',
      index,
    )
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function signaturePoint(event: MouseEvent | TouchEvent) {
  const canvas = signatureCanvas.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  const touch = 'touches' in event ? event.touches[0] : null
  const clientX = touch ? touch.clientX : (event as MouseEvent).clientX
  const clientY = touch ? touch.clientY : (event as MouseEvent).clientY
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  }
}

function startDrawingSignature(event: MouseEvent | TouchEvent) {
  const canvas = signatureCanvas.value
  if (!canvas) return
  const context = canvas.getContext('2d')
  const point = signaturePoint(event)
  if (!context || !point) return
  isDrawingSignature.value = true
  context.beginPath()
  context.moveTo(point.x, point.y)
}

function drawSignature(event: MouseEvent | TouchEvent) {
  if (!isDrawingSignature.value) return
  const canvas = signatureCanvas.value
  if (!canvas) return
  const context = canvas.getContext('2d')
  const point = signaturePoint(event)
  if (!context || !point) return
  if ('touches' in event) event.preventDefault()
  context.lineTo(point.x, point.y)
  context.stroke()
}

function stopDrawingSignature() {
  isDrawingSignature.value = false
}

function openSignatureDialog() {
  signatureDialogOpen.value = true
  requestAnimationFrame(() => {
    clearSignature()
  })
}

function clearSignature() {
  const canvas = signatureCanvas.value
  if (!canvas) return
  const context = canvas.getContext('2d')
  if (!context) return
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
}

function saveSignature() {
  const canvas = signatureCanvas.value
  if (!canvas) return
  signatureDataUrl.value = canvas.toDataURL('image/png')
  signatureDialogOpen.value = false
}

function splitParagraphToList(value: string) {
  return value
    .split(/\n+|(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeExperienceContentStyle(
  style?: ContentStyle,
): ContentStyle {
  return normalizeSectionContentStyle(style)
}

function changeExperienceContentStyle(index: number, nextStyle: ContentStyle) {
  const experience = resume.experiences[index]
  const currentText = getExperienceBullets(index)
  experience.contentStyle = normalizeExperienceContentStyle(nextStyle)
  setExperienceBullets(index, currentText)
}

function changeEducationContentStyle(index: number, nextStyle: ContentStyle) {
  const education = resume.education[index]
  const currentText = getEducationContent(index)
  education.contentStyle = nextStyle
  setEducationContent(index, currentText)
}

function changeProjectContentStyle(index: number, nextStyle: ContentStyle) {
  const project = resume.projects[index]
  const currentText = getProjectContent(index)
  project.contentStyle = nextStyle
  setProjectContent(index, currentText)
}

function setExperienceBullets(index: number, value: string) {
  const experience = resume.experiences[index]
  const parsedLines = parseMultilineList(value)
  experience.bullets = parsedLines
  experience.contentStyle = normalizeExperienceContentStyle(experience.contentStyle)
  experience.points = experience.contentStyle === 'points' ? parsedLines : []
  experience.dashes = experience.contentStyle === 'dashes' ? parsedLines : []
  experience.timelineEvents = experience.contentStyle === 'timeline'
    ? parseTimelineEvents(value)
    : []
}

const getExperienceBullets = (index: number) =>
  normalizeExperienceContentStyle(resume.experiences[index].contentStyle) === 'timeline'
    ? (resume.experiences[index].timelineEvents || [])
        .map((event) => [event.label, event.detail].filter(Boolean).join(' | '))
        .join('\n')
    : (normalizeExperienceContentStyle(resume.experiences[index].contentStyle) === 'dashes'
          ? resume.experiences[index].dashes || []
          : resume.experiences[index].points?.length
            ? resume.experiences[index].points
            : resume.experiences[index].bullets
        ).join('\n')

function setEducationContent(index: number, value: string) {
  const education = resume.education[index]
  education.note = value
  education.contentStyle = normalizeSectionContentStyle(education.contentStyle)
  applyContentFields(education, value)
}

function getEducationContent(index: number) {
  const education = resume.education[index]
  if (education.contentStyle === 'timeline') {
    return (education.timelineEvents || [])
      .map((event) => [event.label, event.detail].filter(Boolean).join(' | '))
      .join('\n')
  }
  if (education.contentStyle === 'dashes')
    return (education.dashes || []).join('\n')
  if (education.points?.length) return education.points.join('\n')
  return education.note
}

function setProjectContent(index: number, value: string) {
  const project = resume.projects[index]
  project.summary = value
  project.contentStyle = normalizeSectionContentStyle(project.contentStyle)
  applyContentFields(project, value)
}

function getProjectContent(index: number) {
  const project = resume.projects[index]
  if (project.contentStyle === 'timeline') {
    return (project.timelineEvents || [])
      .map((event) => [event.label, event.detail].filter(Boolean).join(' | '))
      .join('\n')
  }
  if (project.contentStyle === 'dashes')
    return (project.dashes || []).join('\n')
  if (project.points?.length) return project.points.join('\n')
  return project.summary
}

function addExperience() {
  resume.experiences.push({
    role: '',
    company: '',
    companyImageUrl: '',
    city: '',
    start: '',
    end: '',
    contentStyle: 'points',
    bullets: [],
    points: [],
    dashes: [],
    timelineEvents: [],
  })
}

function setExperienceLogoError(targetKey: string, message = '') {
  experienceLogoErrors[targetKey] = message
}

function getExperienceLogoError(targetKey: string) {
  return experienceLogoErrors[targetKey] || ''
}

function openExperienceLogoPicker(
  target: 'add-section' | 'section-item' | 'resume',
  index?: number,
) {
  if (target === 'add-section') {
    addSectionExperienceLogoInput.value?.click()
    return
  }
  if (target === 'section-item') {
    sectionItemExperienceLogoInput.value?.click()
    return
  }
  if (typeof index !== 'number') return
  const input = document.getElementById(
    `experience-logo-input-${index}`,
  ) as HTMLInputElement | null
  input?.click()
}

async function onResumeExperienceLogoSelected(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  await applyExperienceLogoFromFile(file, {
    onSuccess: (dataUrl) => {
      resume.experiences[index].companyImageUrl = dataUrl
    },
    onError: (message) => setExperienceLogoError(`resume-${index}`, message),
  })
  input.value = ''
}

async function onAddSectionExperienceLogoSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  await applyExperienceLogoFromFile(file, {
    onSuccess: (dataUrl) => {
      addSectionDraft.experience.companyImageUrl = dataUrl
    },
    onError: (message) => setExperienceLogoError('add-section', message),
  })
  input.value = ''
}

async function onSectionItemExperienceLogoSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  await applyExperienceLogoFromFile(file, {
    onSuccess: (dataUrl) => {
      sectionItemDraft.experience.companyImageUrl = dataUrl
    },
    onError: (message) => setExperienceLogoError('section-item', message),
  })
  input.value = ''
}

function removeExperience(index: number) {
  if (resume.experiences.length === 1) return
  resume.experiences.splice(index, 1)
}

function moveExperience(index: number, direction: 'up' | 'down') {
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= resume.experiences.length) return
  const [item] = resume.experiences.splice(index, 1)
  resume.experiences.splice(targetIndex, 0, item)
}

function addEducation() {
  resume.education.push({
    degree: '',
    school: '',
    schoolImageUrl: '',
    city: '',
    start: '',
    end: '',
    note: '',
    contentStyle: 'points',
    points: [],
    dashes: [],
    timelineEvents: [],
  })
}

function removeEducation(index: number) {
  if (resume.education.length === 1) return
  resume.education.splice(index, 1)
}

function moveEducation(index: number, direction: 'up' | 'down') {
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= resume.education.length) return
  const [item] = resume.education.splice(index, 1)
  resume.education.splice(targetIndex, 0, item)
}

function addSkill() {
  resume.skills.push({ name: '', level: 75 })
}

function removeSkill(index: number) {
  if (resume.skills.length === 1) return
  resume.skills.splice(index, 1)
}

function addLanguage() {
  resume.languages.push({ name: '', level: 75, countryCode: '', flag: '' })
}

function removeLanguage(index: number) {
  if (resume.languages.length === 1) return
  resume.languages.splice(index, 1)
}

function getLevelAsStars(level: number) {
  return levelToStars(level)
}

function setLevelFromStars(
  collection: 'skills' | 'languages',
  index: number,
  stars: number,
) {
  resume[collection][index].level = starsToPercent(stars)
}

function addProject() {
  resume.projects.push({
    name: '',
    summary: '',
    imageUrl: '',
    repositoryUrl: '',
    repositoryProvider: undefined,
    contentStyle: 'points',
    points: [],
    dashes: [],
    timelineEvents: [],
  })
}

function removeProject(index: number) {
  if (resume.projects.length === 1) return
  resume.projects.splice(index, 1)
}

function addReference() {
  resume.references.push({
    name: '',
    company: '',
    email: '',
    phone: '',
  })
}

function removeReference(index: number) {
  if (resume.references.length === 1) return
  resume.references.splice(index, 1)
}

function addCertification() {
  resume.courses.push({
    title: '',
    school: '',
    start: '',
    end: '',
  })
}

function removeCertification(index: number) {
  if (resume.courses.length === 1) return
  resume.courses.splice(index, 1)
}

function resetSectionDraft(section: AddSectionType) {
  switch (section) {
    case 'profile':
      addSectionDraft.profile = createProfileDraft()
      break
    case 'experience':
      addSectionDraft.experience = createExperienceDraft()
      setExperienceLogoError('add-section')
      break
    case 'education':
      addSectionDraft.education = createEducationDraft()
      break
    case 'skill':
      addSectionDraft.skill = createSkillDraft()
      break
    case 'language':
      addSectionDraft.language = createAddLanguageDraft()
      break
    case 'hobby':
      addSectionDraft.hobby = createHobbyDraft()
      break
    case 'project':
      addSectionDraft.project = createProjectDraft()
      break
    case 'certification':
      addSectionDraft.certification = createCertificationDraft()
      break
    case 'reference':
      addSectionDraft.reference = createReferenceDraft()
      break
  }
}

function openAddSectionDialog(section: AddSectionType) {
  addSectionType.value = section
  resetSectionDraft(section)
  toolbarSectionMenuOpen.value = false
  addSectionDialogOpen.value = true
}

function submitAddSection() {
  switch (addSectionType.value) {
    case 'profile':
      resume.profile = addSectionDraft.profile.profile.trim()
      break
    case 'experience':
      {
        const experience: Experience = {
          role: addSectionDraft.experience.role,
          company: addSectionDraft.experience.company,
          companyImageUrl: addSectionDraft.experience.companyImageUrl?.trim(),
          city: addSectionDraft.experience.city,
          start: addSectionDraft.experience.start,
          end: addSectionDraft.experience.end,
          bullets: parseMultilineList(addSectionDraft.experience.bullets),
          contentStyle: normalizeExperienceContentStyle(addSectionDraft.experience.contentStyle),
        }
        applyContentFields(experience, addSectionDraft.experience.bullets)
        resume.experiences.push(experience)
      }
      break
    case 'education':
      {
        const education: Education = {
          degree: addSectionDraft.education.degree,
          school: addSectionDraft.education.school,
          schoolImageUrl: addSectionDraft.education.schoolImageUrl.trim(),
          city: addSectionDraft.education.city,
          start: addSectionDraft.education.start,
          end: addSectionDraft.education.end,
          note: addSectionDraft.education.note,
          contentStyle: addSectionDraft.education.contentStyle,
        }
        applyContentFields(education, addSectionDraft.education.note)
        resume.education.push(education)
      }
      break
    case 'skill':
      resume.skills.push({ ...addSectionDraft.skill })
      break
    case 'language':
      resume.languages.push({ ...addSectionDraft.language })
      break
    case 'hobby':
      if (addSectionDraft.hobby.name.trim()) {
        resume.hobbies.push(addSectionDraft.hobby.name.trim())
      }
      break
    case 'project':
      {
        const project: Project = {
          ...addSectionDraft.project,
          repositoryProvider:
            addSectionDraft.project.repositoryProvider ||
            detectRepositoryProvider(addSectionDraft.project.repositoryUrl),
        }
        applyContentFields(project, addSectionDraft.project.summary)
        resume.projects.push(project)
      }
      break
    case 'certification':
      resume.courses.push({ ...addSectionDraft.certification })
      break
    case 'reference':
      resume.references.push({ ...addSectionDraft.reference })
      break
  }

  addSectionDialogOpen.value = false
}

const orderedPreviewSections = computed(() =>
  [...sectionLayout.value].sort((left, right) => {
    if (left.region === right.region) return left.order - right.order
    return left.region === 'main' ? -1 : 1
  }),
)

const sectionVariantByKey = computed<
  Partial<Record<ResumeEditableSectionKey, string>>
>(() =>
  Object.fromEntries(
    sectionLayout.value.map((section) => [section.key, section.variant]),
  ),
)

function sectionDisplayLabel(sectionKey: ResumePreviewSectionKey) {
  return sectionConfig[sectionKey].label
}

function resetSectionItemDraft(section: ResumePreviewSectionKey) {
  switch (section) {
    case 'experience':
      sectionItemDraft.experience = createSectionItemExperienceDraft()
      setExperienceLogoError('section-item')
      break
    case 'education':
      sectionItemDraft.education = createEducationDraft()
      break
    case 'language':
      sectionItemDraft.language = createSectionItemLanguageDraft()
      break
    case 'project':
      sectionItemDraft.project = createProjectDraft()
      break
  }
}

function openSectionItemDialog(section: ResumePreviewSectionKey) {
  activeSectionKey.value = section
  activeVariant.value =
    sectionLayout.value.find((item) => item.key === section)?.variant ??
    variantRegistry[section].fallback
  resetSectionItemDraft(section)
  sectionItemDialogOpen.value = true
}

function submitSectionItemDialog() {
  let item: Record<string, unknown> | null = null
  switch (activeSectionKey.value) {
    case 'experience':
      {
        const experience: Experience = {
          role: sectionItemDraft.experience.role,
          company: sectionItemDraft.experience.company,
          companyImageUrl: sectionItemDraft.experience.companyImageUrl?.trim(),
          city: sectionItemDraft.experience.city,
          start: sectionItemDraft.experience.start,
          end: sectionItemDraft.experience.end,
          bullets: parseMultilineList(sectionItemDraft.experience.bullets),
          contentStyle: normalizeExperienceContentStyle(sectionItemDraft.experience.contentStyle),
        }
        applyContentFields(experience, sectionItemDraft.experience.bullets)
        item = experience
      }
      break
    case 'education':
      {
        const education: Education = {
          degree: sectionItemDraft.education.degree,
          school: sectionItemDraft.education.school,
          schoolImageUrl: sectionItemDraft.education.schoolImageUrl.trim(),
          city: sectionItemDraft.education.city,
          start: sectionItemDraft.education.start,
          end: sectionItemDraft.education.end,
          note: sectionItemDraft.education.note,
          contentStyle: sectionItemDraft.education.contentStyle,
        }
        applyContentFields(education, sectionItemDraft.education.note)
        item = education
      }
      break
    case 'language':
      item = {
        name: sectionItemDraft.language.name,
        level:
          activeVariant.value === 'stars'
            ? Math.max(0, Math.min(5, sectionItemDraft.language.stars)) * 20
            : sectionItemDraft.language.level,
        countryCode: sectionItemDraft.language.countryCode.trim(),
        flag: sectionItemDraft.language.flag.trim(),
      }
      break
    case 'project':
      {
        const project: Project = {
          name: sectionItemDraft.project.name,
          summary: sectionItemDraft.project.summary,
          imageUrl: sectionItemDraft.project.imageUrl.trim(),
          repositoryUrl: sectionItemDraft.project.repositoryUrl.trim(),
          repositoryProvider:
            sectionItemDraft.project.repositoryProvider ||
            detectRepositoryProvider(
              sectionItemDraft.project.repositoryUrl.trim(),
            ),
          contentStyle: sectionItemDraft.project.contentStyle,
        }
        applyContentFields(project, sectionItemDraft.project.summary)
        item = project
      }
      break
  }
  if (item) {
    const collection = sectionConfig[activeSectionKey.value].collection
    ;(resume[collection] as Array<Record<string, unknown>>).push(item)
  }
  sectionItemDialogOpen.value = false
}

function addItemToPreviewSection(section: ResumeSectionActionKey) {
  if (section === 'course') {
    openAddSectionDialog('certification')
    return
  }
  if (
    section === 'certification' ||
    section === 'reference' ||
    section === 'hobby' ||
    section === 'skill'
  ) {
    openAddSectionDialog(section)
    return
  }
  openSectionItemDialog(section)
}

function normalizeSectionVariant<K extends ResumeEditableSectionKey>(
  key: K,
  variant: unknown,
): SectionLayoutVariant[K] {
  const registry = variantRegistry[key]
  if (
    typeof variant === 'string' &&
    registry.allowed.includes(variant as SectionLayoutVariant[K])
  ) {
    return variant as SectionLayoutVariant[K]
  }
  if (import.meta.dev) {
    console.warn(
      `[resume-builder] Unknown "${key}" variant "${String(variant)}"; fallback to "${registry.fallback}".`,
    )
  }
  return registry.fallback
}

function moveSectionUp(sectionKey: ResumeEditableSectionKey) {
  const currentSection = sectionLayout.value.find(
    (item) => item.key === sectionKey,
  )
  if (!currentSection) return
  const regionEntries = [...sectionLayout.value]
    .filter((item) => item.region === currentSection.region)
    .sort((left, right) => left.order - right.order)
  const regionIndex = regionEntries.findIndex((item) => item.key === sectionKey)
  if (regionIndex <= 0) return
  const previous = regionEntries[regionIndex - 1]
  const originalOrder = currentSection.order
  currentSection.order = previous.order
  previous.order = originalOrder
}

function moveSectionDown(sectionKey: ResumeEditableSectionKey) {
  const currentSection = sectionLayout.value.find(
    (item) => item.key === sectionKey,
  )
  if (!currentSection) return
  const regionEntries = [...sectionLayout.value]
    .filter((item) => item.region === currentSection.region)
    .sort((left, right) => left.order - right.order)
  const regionIndex = regionEntries.findIndex((item) => item.key === sectionKey)
  if (regionIndex < 0 || regionIndex >= regionEntries.length - 1) return
  const next = regionEntries[regionIndex + 1]
  const originalOrder = currentSection.order
  currentSection.order = next.order
  next.order = originalOrder
}

function moveSection(
  sectionKey: ResumeEditableSectionKey,
  direction: 'up' | 'down',
) {
  if (direction === 'up') {
    moveSectionUp(sectionKey)
    return
  }
  moveSectionDown(sectionKey)
}

function deleteSection(sectionKey: ResumeEditableSectionKey) {
  sectionLayout.value = sectionLayout.value.filter(
    (section) => section.key !== sectionKey,
  )
}

function setSectionVariant<K extends ResumeEditableSectionKey>(
  key: K,
  variant: SectionLayoutVariant[K] | string,
) {
  const target = sectionLayout.value.find((section) => section.key === key)
  if (!target) return
  const normalizedVariant = normalizeSectionVariant(key, variant)
  target.variant = normalizedVariant
  if (activeSectionKey.value === key) {
    activeVariant.value = normalizedVariant
  }
}

const activeTheme = computed(
  () =>
    colorThemes.find((theme) => theme.name === selectedTheme.value) ??
    colorThemes[0],
)
const activePageBackground = computed(() =>
  resolvePageBackground(selectedPageBackground.value),
)
const designClassMap = computed(() => ({
  rounded:
    roundedOptions.find((item) => item.value === selectedRounded.value)
      ?.className ?? 'radius-md',
  textStyle: `font-${selectedTextStyle.value}`,
  spacingDensity: `density-${layoutSettings.lineDensity}`,
  dividerStyle: `divider-${layoutSettings.sectionDividerStyle}`,
}))
const previewDesignClasses = computed(() => Object.values(designClassMap.value))
const activeRoundedClass = computed(() => designClassMap.value.rounded)
const activeTextStyleClass = computed(() => designClassMap.value.textStyle)
const previewExportRef = ref<HTMLElement | null>(null)
const rendererReady = ref(true)
const rendererError = ref<string | null>(null)

const previewFallbackSections = computed(() => {
  const sections: Array<{ title: string; items: string[] }> = []

  if (resume.profile.trim()) {
    sections.push({
      title: t('resumeBuilder.create.previewFallback.profileTitle'),
      items: [resume.profile.trim()],
    })
  }

  if (resume.experiences.length) {
    sections.push({
      title: t('resumeBuilder.create.previewFallback.experiencesTitle'),
      items: resume.experiences
        .slice(0, 2)
        .map(
          (item) =>
            [item.role, item.company].filter(Boolean).join(' — ') ||
            t('resumeBuilder.create.previewFallback.experienceItem'),
        ),
    })
  }

  if (resume.education.length) {
    sections.push({
      title: t('resumeBuilder.create.previewFallback.educationTitle'),
      items: resume.education
        .slice(0, 2)
        .map(
          (item) =>
            [item.degree, item.school].filter(Boolean).join(' — ') ||
            t('resumeBuilder.create.previewFallback.educationItem'),
        ),
    })
  }

  if (resume.skills.length) {
    sections.push({
      title: t('resumeBuilder.create.previewFallback.skillsTitle'),
      items: resume.skills
        .slice(0, 6)
        .map((item) => item.name)
        .filter(Boolean),
    })
  }

  return sections
})

function resetRendererGuard() {
  rendererReady.value = true
  rendererError.value = null
}

watch(selectedDocumentType, (value) => {
  selectValidTemplateForCurrentDocumentType()
  localStorage.setItem(DOCUMENT_TYPE_STORAGE_KEY, value)
})

watch(selectedTemplate, () => {
  selectValidTemplateForCurrentDocumentType()
  resetRendererGuard()
})

onErrorCaptured((error, instance, info) => {
  const componentName =
    instance?.type &&
    typeof instance.type === 'object' &&
    'name' in instance.type
      ? String(instance.type.name || 'unknown')
      : 'unknown'
  console.error('[resume-preview] render error', error)
  rendererError.value = t('resumeBuilder.create.previewFallback.renderFailed', {
    componentName,
    info,
  })
  rendererReady.value = false
  return false
})

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '')
  const safeHex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized

  if (!/^[\da-fA-F]{6}$/.test(safeHex)) return null
  return {
    r: Number.parseInt(safeHex.slice(0, 2), 16),
    g: Number.parseInt(safeHex.slice(2, 4), 16),
    b: Number.parseInt(safeHex.slice(4, 6), 16),
  }
}

function relativeLuminance(hex: string) {
  const rgb = hexToRgb(hex)
  if (!rgb) return 1

  const channelToLinear = (value: number) => {
    const normalized = value / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4
  }

  const r = channelToLinear(rgb.r)
  const g = channelToLinear(rgb.g)
  const b = channelToLinear(rgb.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(colorA: string, colorB: string) {
  const lumA = relativeLuminance(colorA)
  const lumB = relativeLuminance(colorB)
  const brightest = Math.max(lumA, lumB)
  const darkest = Math.min(lumA, lumB)
  return (brightest + 0.05) / (darkest + 0.05)
}

const minimumReadableContrast = 4.5
const pageBackgroundValidation = computed(() =>
  pageBackgroundOptions.map((option) => {
    const darkBlocked = !isAllowedPageBackground(option.page)
    const textContrast = contrastRatio(option.page, '#111827')
    return {
      ...option,
      blocked: darkBlocked || textContrast < minimumReadableContrast,
    }
  }),
)

watch(
  pageBackgroundValidation,
  (options) => {
    const selected = options.find(
      (option) => option.value === selectedPageBackground.value,
    )
    if (selected && !selected.blocked) return
    const fallback = options.find((option) => !option.blocked)
    if (fallback) selectedPageBackground.value = fallback.value
  },
  { immediate: true },
)

const previewStyle = computed(() => ({
  '--resume-radius': roundedPxByValue[selectedRounded.value],
  '--cv-radius': roundedPxByValue[selectedRounded.value],
  '--resume-font-family': textStyleVarsByValue[selectedTextStyle.value].family,
  '--cv-font-family': textStyleVarsByValue[selectedTextStyle.value].family,
  '--resume-font-style': textStyleVarsByValue[selectedTextStyle.value].style,
  '--cv-font-style': textStyleVarsByValue[selectedTextStyle.value].style,
  '--resume-font-weight': textStyleVarsByValue[selectedTextStyle.value].weight,
  '--cv-font-weight': textStyleVarsByValue[selectedTextStyle.value].weight,
  ...resolveSocleThemeTokens(selectedPresetConfig.value),
}))
const decorativeShapes = computed(() => [
  {
    id: 'a',
    ...layoutSettings.decorativeShapeA,
  },
  {
    id: 'b',
    ...layoutSettings.decorativeShapeB,
  },
])
const decorativeShapeStyle = (shape: DecorativeShapeSettings) => {
  const width = shape.type === 'circle' || shape.type === 'ring' ? shape.size : shape.width
  const height = shape.type === 'circle' || shape.type === 'ring' ? shape.size : shape.height
  return {
    '--shape-color': shape.color,
    '--shape-opacity': String(shape.opacity),
    width: `${width}px`,
    height: `${height}px`,
    left: `${shape.x}%`,
    top: `${shape.y}%`,
    transform: `translate(-50%, -50%) rotate(${shape.rotation}deg)`,
  }
}
const resumeRendererDesignState = computed(() => ({
  themeTokens: previewStyle.value,
  roundedClass: activeRoundedClass.value,
  textStyleClass: activeTextStyleClass.value,
  density: layoutSettings.lineDensity,
  dividerStyle: layoutSettings.sectionDividerStyle,
  showSectionIcons: layoutSettings.showSectionIcons,
  showContactIcons: layoutSettings.showContactIcons,
  sectionIconStyleVariant: layoutSettings.sectionIconStyle,
  iconSizeVariant: layoutSettings.iconSize,
  iconColorMode: layoutSettings.iconColor,
  layoutMode: layoutSettings.layoutMode,
  sidebarWidth: layoutSettings.sidebarWidth,
  sidebarHeight: layoutSettings.sidebarHeight,
  photoSize: layoutSettings.photoSize,
  photoBorderWidth: layoutSettings.photoBorderWidth,
  photoPosition: layoutSettings.photoPosition,
  decorativeShapeA: layoutSettings.decorativeShapeA,
  decorativeShapeB: layoutSettings.decorativeShapeB,
}))

watch(
  () => [layoutSettings.decorativeShapeA, layoutSettings.decorativeShapeB],
  () => {
    for (const shape of [
      layoutSettings.decorativeShapeA,
      layoutSettings.decorativeShapeB,
    ]) {
      shape.width = Math.min(360, Math.max(30, Math.round(shape.width)))
      shape.height = Math.min(360, Math.max(30, Math.round(shape.height)))
      shape.size = Math.min(360, Math.max(30, Math.round(shape.size)))
      shape.opacity = Math.min(1, Math.max(0.05, Number(shape.opacity)))
      shape.x = Math.min(100, Math.max(0, Math.round(shape.x)))
      shape.y = Math.min(100, Math.max(0, Math.round(shape.y)))
      shape.rotation = Math.min(180, Math.max(-180, Math.round(shape.rotation)))
    }
  },
  { deep: true },
)

watch(
  () => layoutSettings.sidebarWidth,
  (value) => {
    const clampedValue = Math.min(380, Math.max(220, Math.round(value)))
    if (clampedValue !== value) {
      layoutSettings.sidebarWidth = clampedValue
    }
  },
)
watch(
  () => layoutSettings.sidebarHeight,
  (value) => {
    const clampedValue = Math.min(100, Math.max(60, Math.round(value)))
    if (clampedValue !== value) {
      layoutSettings.sidebarHeight = clampedValue
    }
  },
)

async function buildResumePdfBlob() {
  if (!previewExportRef.value || !import.meta.client) return ''
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  const stylesheetContent = Array.from(
    document.querySelectorAll('style,link[rel="stylesheet"]'),
  )
    .map((node) => node.outerHTML)
    .join('\n')
  // Keep the preview root to preserve CSS variables (colors/layout) applied on .preview-grid.
  // Exporting only .cv-page-shell drops those custom properties and can make the aside background disappear in PDF.
  const exportRoot = previewExportRef.value
  const content = exportRoot.outerHTML

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Resume</title>
        ${stylesheetContent}
        <style>
          body { margin: 0; padding: 0; background: #fff; }
          .preview-grid,
          .preview-grid *,
          .cv-page-shell,
          .cv-page-shell * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .preview-grid .resume-skin__aside,
          .preview-grid .cv-sidebar-surface,
          .cv-page-shell .resume-skin__aside,
          .cv-page-shell .cv-sidebar-surface {
            background: var(--resume-sidebar, var(--cv-sidebar)) !important;
            background-color: var(--resume-sidebar, var(--cv-sidebar)) !important;
          }
          .preview-grid,
          .cv-page-shell { min-height: auto !important; border-radius: 0 !important; }
          .preview-grid .terra-template,
          .preview-grid .ocean-template,
          .preview-grid .corporate-template,
          .preview-grid .professional-template,
          .preview-grid .classic-template,
          .preview-grid .executive-template,
          .cv-page-shell .terra-template,
          .cv-page-shell .ocean-template,
          .cv-page-shell .corporate-template,
          .cv-page-shell .professional-template,
          .cv-page-shell .classic-template,
          .cv-page-shell .executive-template {
            grid-template-columns: minmax(220px, 32%) 1fr !important;
          }
          .preview-grid .modern-template,
          .cv-page-shell .modern-template {
            grid-template-columns: 1fr 280px !important;
          }
          @media print {
            .preview-grid .terra-template,
            .preview-grid .ocean-template,
            .preview-grid .corporate-template,
            .preview-grid .professional-template,
            .preview-grid .classic-template,
            .preview-grid .executive-template,
            .cv-page-shell .terra-template,
            .cv-page-shell .ocean-template,
            .cv-page-shell .corporate-template,
            .cv-page-shell .professional-template,
            .cv-page-shell .classic-template,
            .cv-page-shell .executive-template {
              grid-template-columns: minmax(220px, 32%) 1fr !important;
            }
          }
          @page { size: A4; margin: 0; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `
}

async function openPdfPreview() {
  pdfModalOpen.value = true
}

async function downloadPdf() {
  const printMarkup = await buildResumePdfBlob()
  if (!printMarkup || !import.meta.client) return
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.setAttribute('aria-hidden', 'true')
  document.body.appendChild(iframe)

  const iframeWindow = iframe.contentWindow
  if (!iframeWindow) {
    iframe.remove()
    return
  }

  iframeWindow.document.open()
  iframeWindow.document.write(printMarkup)
  iframeWindow.document.close()

  setTimeout(() => {
    iframeWindow.focus()
    iframeWindow.print()
    setTimeout(() => iframe.remove(), 1000)
  }, 350)
}

async function onDownloadPdfClick() {
  if (loggedIn.value) {
    await downloadPdf()
    return
  }

  pendingPdfDownload.value = true
  loginDialogOpen.value = true
}

async function onLoginSubmit(payload: {
  username?: string
  email: string
  password: string
  remember?: boolean
}) {
  loginLoading.value = true

  try {
    await $fetch('/api/login', {
      method: 'POST',
      body: {
        username: payload.username ?? payload.email,
        password: payload.password,
        remember: payload.remember ?? true,
      },
    })

    await refreshSession()
    loginDialogOpen.value = false

    if (pendingPdfDownload.value) {
      pendingPdfDownload.value = false
      await downloadPdf()
    }
  } catch {
    pendingPdfDownload.value = false
    Notify.error(t('auth.notifications.loginError'))
  } finally {
    loginLoading.value = false
  }
}

function startImportProgress() {
  importProgress.value = 0
  importElapsedSeconds.value = 0
  if (importProgressTimer) clearInterval(importProgressTimer)
  if (importElapsedTimer) clearInterval(importElapsedTimer)
  importProgressTimer = setInterval(() => {
    importProgress.value = Math.min(importProgress.value + 8, 92)
  }, 450)
  importElapsedTimer = setInterval(() => {
    importElapsedSeconds.value += 1
  }, 1000)
}

function stopImportProgress() {
  if (importProgressTimer) {
    clearInterval(importProgressTimer)
    importProgressTimer = null
  }
  if (importElapsedTimer) {
    clearInterval(importElapsedTimer)
    importElapsedTimer = null
  }
}

function startAiElapsedTimer() {
  aiElapsedSeconds.value = 0
  if (aiElapsedTimer) clearInterval(aiElapsedTimer)
  aiElapsedTimer = setInterval(() => {
    aiElapsedSeconds.value += 1
  }, 1000)
}

function stopAiElapsedTimer() {
  if (aiElapsedTimer) {
    clearInterval(aiElapsedTimer)
    aiElapsedTimer = null
  }
}

function normalizeDateLabel(value?: string) {
  if (!value) return ''
  return value
}

function inferNameParts(fullName?: string) {
  const normalized = String(fullName || '').trim()
  if (!normalized)
    return { firstName: resume.firstName, lastName: resume.lastName }
  const parts = normalized.split(/\s+/)
  const firstName = parts.shift() || resume.firstName
  const lastName = parts.join(' ') || resume.lastName
  return { firstName, lastName }
}

function applyStructuredResumeData(payload: StructuredResumeResponse) {
  const data = payload.data
  if (!data) return

  const user = data.user || {}
  const userNames = inferNameParts(user.fullName)

  resume.firstName = userNames.firstName
  resume.lastName = userNames.lastName
  if (String(user.title || '').trim()) {
    resume.role = String(user.title || '').trim()
  }
  resume.email = user.email || resume.email
  resume.phone = user.phone || resume.phone
  resume.profile = user.summary || resume.profile

  const location = String(user.address || '').trim()
  if (location) {
    const [city, ...countryParts] = location
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
    if (city) resume.city = city
    if (countryParts.length) {
      resume.country = countryParts[countryParts.length - 1]
    }
  }

  if (Array.isArray(data.skills) && data.skills.length) {
    resume.skills = data.skills.map((name) => ({
      name: String(name),
      level: 80,
    }))
  }

  if (Array.isArray(data.languages) && data.languages.length) {
    resume.languages = data.languages
      .filter((language) => String(language?.name || '').trim().length > 0)
      .map((language) => ({
        name: String(language.name),
        level: Number.parseInt(String(language.level || ''), 10) || 75,
        countryCode: String(language.countryCode || '').trim(),
        flag: String(language.flag || '').trim(),
      }))
  }

  if (Array.isArray(data.hobbies) && data.hobbies.length) {
    resume.hobbies = data.hobbies.map((hobby) => String(hobby))
  }

  if (Array.isArray(data.experiences) && data.experiences.length) {
    resume.experiences = data.experiences.map((experience) => ({
      role: String(experience.title || ''),
      company: String(experience.company || ''),
      companyImageUrl: String(experience.companyImageUrl || ''),
      city: '',
      start: normalizeDateLabel(experience.startDate),
      end: normalizeDateLabel(experience.endDate),
      bullets: String(experience.description || '')
        .split(/\n|•|-/g)
        .map((bullet) => bullet.trim())
        .filter(Boolean),
      contentStyle: 'points',
      points: String(experience.description || '')
        .split(/\n|•|-/g)
        .map((bullet) => bullet.trim())
        .filter(Boolean),
    }))
  }

  if (Array.isArray(data.educations) && data.educations.length) {
    resume.education = data.educations.map((education) => ({
      degree: String(education.title || ''),
      school: String(education.school || ''),
      schoolImageUrl: '',
      city: '',
      start: normalizeDateLabel(education.startDate),
      end: normalizeDateLabel(education.endDate),
      note: '',
      contentStyle: 'points',
      points: parseMultilineList(String(education.description || '')),
    }))
  }

  if (Array.isArray(data.certifications) && data.certifications.length) {
    resume.courses = data.certifications.map((certificate) => ({
      title: String(certificate.title || ''),
      school: String(certificate.issuer || ''),
      start: normalizeDateLabel(certificate.date),
      end: '',
    }))
  }

  if (Array.isArray(data.projects) && data.projects.length) {
    resume.projects = data.projects.map((project) => ({
      name: String(project.title || ''),
      summary: String(project.description || ''),
      imageUrl: String(project.imageUrl || ''),
      repositoryUrl: String(project.repositoryUrl || project.link || ''),
      repositoryProvider:
        project.repositoryProvider ||
        detectRepositoryProvider(
          String(project.repositoryUrl || project.link || ''),
        ),
      repositoryUrl: String(project.link || ''),
      repositoryProvider: detectRepositoryProvider(String(project.link || '')),
      contentStyle: 'points',
      points: parseMultilineList(String(project.description || '')),
    }))
  }

  if (Array.isArray(data.references) && data.references.length) {
    resume.references = data.references.map((reference) => ({
      name: String(reference.name || ''),
      company: String(reference.description || ''),
      email: String(reference.contact || ''),
      phone: '',
    }))
  }
}

function buildResumeSavePayload() {
  const payload = fromBuilderModelToApiPayload({
    firstName: resume.firstName,
    lastName: resume.lastName,
    email: resume.email,
    phone: resume.phone,
    city: resume.city,
    country: resume.country,
    experiences: resume.experiences.map((experience) => ({
      role: experience.role,
      company: experience.company,
      city: experience.city,
      start: experience.start,
      end: experience.end,
      bullets: experience.bullets,
    })),
    skills: resume.skills.map((skill) => ({
      name: skill.name,
      level: skill.level,
    })),
    education: resume.education.map((education) => ({
      degree: education.degree,
      school: education.school,
      city: education.city,
      start: education.start,
      end: education.end,
      note: education.note,
    })),
    languages: resume.languages.map((language) => ({
      name: language.name,
      level: language.level,
      countryCode: language.countryCode,
      flag: language.flag,
    })),
    courses: resume.courses.map((course) => ({
      title: course.title,
      school: course.school,
      start: course.start,
      end: course.end,
    })),
    projects: resume.projects.map((project) => ({
      name: project.name,
      summary: project.summary,
      repositoryUrl: project.repositoryUrl,
    })),
    references: resume.references.map((reference) => ({
      name: reference.name,
      company: reference.company,
      email: reference.email,
      phone: reference.phone,
    })),
    hobbies: [...resume.hobbies],
    documentUrl: null,
    resumeInformation: {
      fullName: `${resume.firstName} ${resume.lastName}`.trim(),
      email: resume.email,
      phone: resume.phone,
      address: [resume.city, resume.country].filter(Boolean).join(', '),
    },
  })

  const hasSectionContent = (section?: RemoteResumeSection[] | null) =>
    Array.isArray(section) &&
    section.some((item) =>
      [
        item.title,
        item.description,
        item.startDate,
        item.endDate,
        item.company,
        item.school,
        item.location,
        item.level,
      ].some((value) => typeof value === 'string' && value.trim().length > 0),
    )

  return {
    documentUrl: payload.documentUrl ?? null,
    experiences: hasSectionContent(payload.experiences)
      ? payload.experiences
      : [],
    skills: hasSectionContent(payload.skills) ? payload.skills : [],
    ...(hasSectionContent(payload.educations)
      ? { educations: payload.educations }
      : {}),
    ...(hasSectionContent(payload.languages)
      ? { languages: payload.languages }
      : {}),
    ...(hasSectionContent(payload.certifications)
      ? { certifications: payload.certifications }
      : {}),
    ...(hasSectionContent(payload.projects)
      ? { projects: payload.projects }
      : {}),
    ...(hasSectionContent(payload.references)
      ? { references: payload.references }
      : {}),
    ...(hasSectionContent(payload.hobbies) ? { hobbies: payload.hobbies } : {}),
    ...(payload.resumeInformation?.fullName?.trim() ||
    payload.resumeInformation?.email?.trim() ||
    payload.resumeInformation?.phone?.trim() ||
    payload.resumeInformation?.adresse?.trim()
      ? { resumeInformation: payload.resumeInformation }
      : {}),
  }
}

function openSaveModal() {
  saveMode.value = selectedRemoteResumeId.value ? 'replace' : 'create'
  saveStatus.value = 'idle'
  saveStatusMessage.value = ''
  replaceConfirmStep.value = false
  saveModalOpen.value = true
}

async function submitSaveAction() {
  saveLoading.value = true
  saveStatus.value = 'idle'
  saveStatusMessage.value = ''

  try {
    const payload = buildResumeSavePayload()
    const shouldUpdate = Boolean(selectedRemoteResumeId.value)

    if (shouldUpdate && selectedRemoteResumeId.value) {
      await updateResume(selectedRemoteResumeId.value, payload)
      saveStatus.value = 'success'
      saveStatusMessage.value = t('resumeBuilder.create.messages.resumeReplaced')
      replaceConfirmStep.value = false
      return
    }

    const createdResume = await createResume(payload)
    if (createdResume?.id) {
      selectedRemoteResumeId.value = createdResume.id
    }
    saveStatus.value = 'success'
    saveStatusMessage.value = t('resumeBuilder.create.messages.resumeCreated')
  } catch {
    saveStatus.value = 'error'
    saveStatusMessage.value = selectedRemoteResumeId.value
      ? t('resumeBuilder.create.messages.resumeReplaceFailed')
      : t('resumeBuilder.create.messages.resumeCreateFailed')
  } finally {
    saveLoading.value = false
  }
}

async function handlePdfImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  importInProgress.value = true
  importMessageType.value = 'info'
  importMessage.value = t('resumeBuilder.create.import.messages.extractingPdf')
  startImportProgress()

  try {
    const formData = new FormData()
    formData.append('document', file)

    importMessage.value = t(
      'resumeBuilder.create.import.messages.analyzingWithAi',
    )
    const response = await $fetch<StructuredResumeResponse>(
      '/api/recruit/general/resumes/parse-pdf',
      {
        method: 'POST',
        body: formData,
      },
    )
    applyStructuredResumeData(response)
    importProgress.value = 100
    importMessageType.value = 'success'
    importMessage.value = t(
      'resumeBuilder.create.import.messages.importSuccess',
    )
  } catch {
    importMessageType.value = 'error'
    importMessage.value = t('resumeBuilder.create.import.messages.importFailed')
  } finally {
    stopImportProgress()
    importInProgress.value = false
    input.value = ''
  }
}

function triggerPdfImport() {
  importPdfInput.value?.click()
}

function syncWithProvider(provider: 'Xing' | 'LinkedIn') {
  importMessageType.value = 'info'
  importMessage.value = t(
    'resumeBuilder.create.import.messages.providerSyncSoon',
    { provider },
  )
}

async function runAiCreate() {
  if (!aiProfilePrompt.value.trim()) {
    aiActionError.value = t('resumeBuilder.create.messages.aiSummaryRequired')
    return
  }

  aiCreateLoading.value = true
  aiActionError.value = ''
  startAiElapsedTimer()

  try {
    const response = await $fetch<StructuredResumeResponse>(
      '/api/recruit/general/resumes/structure-from-text',
      {
        method: 'POST',
        body: {
          resumeText: aiProfilePrompt.value,
        },
      },
    )
    applyStructuredResumeData(response)
    aiCreateModalOpen.value = false
  } catch (error) {
    aiActionError.value =
      error instanceof Error
        ? error.message
        : 'Unable to generate resume with AI.'
  } finally {
    stopAiElapsedTimer()
    aiCreateLoading.value = false
  }
}

onUnmounted(() => {
  stopImportProgress()
  stopAiElapsedTimer()
})

if (import.meta.client) {
  const LEGACY_LAYOUT_KEY = 'resume-layout-settings-v1'
  const LEGACY_SECTION_LAYOUT_KEY = 'resume-section-layout-v1'
  const rawLegacyLayout = localStorage.getItem(LEGACY_LAYOUT_KEY)
  const rawLegacySectionLayout = localStorage.getItem(LEGACY_SECTION_LAYOUT_KEY)

  hydrateFromStorage()
  migrateLegacyStorage(rawLegacyLayout, rawLegacySectionLayout)

  const customization = resumeDocumentState.value.customization
  selectedPreset.value = customization.presetId
  selectedTheme.value = customization.style.palette
  selectedPageBackground.value = customization.style.pageBackground
  selectedRounded.value = customization.style.radius
  selectedTextStyle.value = customization.style.typography
  layoutSettings.lineDensity = customization.style.density
  layoutSettings.showSectionIcons = customization.style.showSectionIcons
  layoutSettings.showContactIcons = customization.style.showContactIcons
  layoutSettings.sectionIconStyle = customization.style.sectionIconStyle
  layoutSettings.iconSize = customization.style.iconSize
  layoutSettings.iconColor = customization.style.iconColor
  layoutSettings.layoutMode = customization.style.layoutMode
  layoutSettings.photoPosition = customization.style.photoPosition
  layoutSettings.sidebarWidth = customization.style.asideWidth
  layoutSettings.sidebarHeight = customization.style.asideHeight ?? 100
  layoutSettings.decorativeShapeA = {
    ...layoutSettings.decorativeShapeA,
    ...customization.style.decorativeShapeA,
  }
  layoutSettings.decorativeShapeB = {
    ...layoutSettings.decorativeShapeB,
    ...customization.style.decorativeShapeB,
  }
  sectionLayout.value = normalizeSectionLayout(customization.sectionOrder)

  watch(
    [
      selectedTheme,
      selectedPageBackground,
      selectedRounded,
      selectedTextStyle,
      () => layoutSettings.showSectionIcons,
      () => layoutSettings.showContactIcons,
      () => layoutSettings.sectionIconStyle,
      () => layoutSettings.iconSize,
      () => layoutSettings.iconColor,
      () => layoutSettings.layoutMode,
      () => layoutSettings.photoPosition,
      () => layoutSettings.sidebarWidth,
      () => layoutSettings.sidebarHeight,
      () => layoutSettings.decorativeShapeA,
      () => layoutSettings.decorativeShapeB,
    ],
    () => {
      resumeDocumentState.value.customization = {
        ...resumeDocumentState.value.customization,
        presetId: selectedPreset.value,
        style: {
          ...resumeDocumentState.value.customization.style,
          palette: selectedTheme.value,
          pageBackground: selectedPageBackground.value,
          radius: selectedRounded.value,
          typography: selectedTextStyle.value,
          showSectionIcons: layoutSettings.showSectionIcons,
          showContactIcons: layoutSettings.showContactIcons,
          sectionIconStyle: layoutSettings.sectionIconStyle,
          iconSize: layoutSettings.iconSize,
          iconColor: layoutSettings.iconColor,
          layoutMode: layoutSettings.layoutMode,
          photoPosition: layoutSettings.photoPosition,
          asideWidth: layoutSettings.sidebarWidth,
          asideHeight: layoutSettings.sidebarHeight,
          decorativeShapeA: { ...layoutSettings.decorativeShapeA },
          decorativeShapeB: { ...layoutSettings.decorativeShapeB },
        },
      }
      persist()
    },
    { deep: true },
  )

  watch(
    () => layoutSettings.lineDensity,
    (density) => {
      resumeDocumentState.value.customization = {
        ...resumeDocumentState.value.customization,
        presetId: selectedPreset.value,
        style: {
          ...resumeDocumentState.value.customization.style,
          density,
        },
      }
      persist()
    },
  )

  watch(
    sectionLayout,
    (value) => {
      resumeDocumentState.value.customization = {
        ...resumeDocumentState.value.customization,
        sectionOrder: value.map((section) => ({ ...section })),
      }
      persist()
    },
    { deep: true },
  )
}
</script>

<template>
  <div class="fade-in-up">
    <AppPageDrawers>
      <template #left>
        <div style="min-height: 400px; overflow-y: auto">
          <div class="d-flex align-content-center">
            <v-menu
              class="mt-2"
              location="bottom center"
              origin="top center"
              max-width="320"
              :close-on-content-click="false"
            >
              <template #activator="{ props }">
                <v-btn
                  class="local-toolbar-btn my-2 mx-2"
                  color="primary"
                  size="small"
                  variant="outlined"
                  icon="mdi-palette-outline"
                  v-bind="props"
                />
              </template>
              <v-card class="toolbar-menu-card">
                <v-card-title class="text-subtitle-2">Design</v-card-title>
                <v-card-text>
                  <p class="section-label text-primary">Color palette</p>
                  <div class="palette-grid mb-4">
                    <button
                      v-for="theme in colorThemes"
                      :key="`toolbar-theme-${theme.name}`"
                      type="button"
                      class="palette-item"
                      :class="{
                        'palette-item--active': selectedTheme === theme.name,
                      }"
                      @click="selectedTheme = theme.name"
                    >
                      <span :style="{ background: theme.sidebar }" />
                      <span :style="{ background: theme.accent }" />
                      <span :style="{ background: theme.page }" />
                    </button>
                  </div>

                  <p class="section-label text-primary">Page background</p>
                  <div class="palette-grid mb-4">
                    <button
                      v-for="option in pageBackgroundValidation"
                      :key="`toolbar-bg-${option.value}`"
                      type="button"
                      class="palette-item"
                      :class="{
                        'palette-item--active':
                          selectedPageBackground === option.value,
                      }"
                      :disabled="option.blocked"
                      :title="
                        option.blocked
                          ? 'Fond trop sombre ou contraste insuffisant'
                          : option.label
                      "
                      @click="selectedPageBackground = option.value"
                    >
                      <span :style="{ background: option.page }" />
                      <span :style="{ background: activeTheme.accent }" />
                      <span :style="{ background: activeTheme.sidebar }" />
                    </button>
                  </div>
                </v-card-text>
              </v-card>
            </v-menu>
            <v-menu
              class="mt-2 mx-1"
              location="bottom center"
              origin="top center"
              max-width="320"
              :close-on-content-click="false"
            >
              <template #activator="{ props }">
                <v-btn
                  class="local-toolbar-btn my-2 mx-2"
                  color="primary"
                  size="small"
                  variant="outlined"
                  icon="mdi-format-list-numbers"
                  v-bind="props"
                />
              </template>
              <v-card class="toolbar-menu-card">
                <v-card-title class="text-subtitle-2">Shapes</v-card-title>
                <v-card-text>
                  <div class="d-grid ga-3">
                    <v-switch
                      v-model="layoutSettings.decorativeShapeA.enabled"
                      label="Shape A visible"
                      color="primary"
                      class="mb-3"
                      hide-details
                      inset
                    />
                    <AppSelect
                      v-model="layoutSettings.decorativeShapeA.type"
                      :items="decorativeShapeTypeOptions"
                      item-title="label"
                      item-value="value"
                      label="Shape A type"
                      density="comfortable"
                      class="mb-3"
                      hide-details
                    />
                    <v-text-field
                      v-model="layoutSettings.decorativeShapeA.color"
                      label="Shape A color"
                      type="color"
                      density="comfortable"
                      class="mb-3"
                      hide-details
                    />
                    <v-slider
                      v-model="layoutSettings.decorativeShapeA.opacity"
                      :min="0.05"
                      :max="1"
                      :step="0.05"
                      label="Shape A opacity"
                      class="mb-3"
                      thumb-label
                      hide-details
                    />
                    <v-slider
                      v-model="layoutSettings.decorativeShapeA.size"
                      :min="30"
                      :max="360"
                      :step="2"
                      label="Shape A size"
                      class="mb-3"
                      thumb-label
                      hide-details
                    />
                    <v-slider
                      v-model="layoutSettings.decorativeShapeA.width"
                      :min="30"
                      :max="360"
                      :step="2"
                      label="Shape A width"
                      class="mb-3"
                      thumb-label
                      hide-details
                    />
                    <v-slider
                      v-model="layoutSettings.decorativeShapeA.height"
                      :min="30"
                      :max="360"
                      :step="2"
                      label="Shape A height"
                      class="mb-3"
                      thumb-label
                      hide-details
                    />
                    <v-slider
                      v-model="layoutSettings.decorativeShapeA.x"
                      :min="0"
                      :max="130"
                      :step="1"
                      label="Shape A horizontal position"
                      class="mb-3"
                      thumb-label
                      hide-details
                    />
                    <v-slider
                      v-model="layoutSettings.decorativeShapeA.y"
                      :min="0"
                      :max="100"
                      :step="1"
                      label="Shape A vertical position"
                      class="mb-3"
                      thumb-label
                      hide-details
                    />
                    <v-slider
                      v-model="layoutSettings.decorativeShapeA.rotation"
                      :min="-180"
                      :max="180"
                      :step="1"
                      label="Shape A rotation"
                      class="mb-3"
                      thumb-label
                      hide-details
                    />

                  </div>
                </v-card-text>
              </v-card>
            </v-menu>
            <v-menu
              class="mt-2 mx-1"
              location="bottom center"
              origin="top center"
              max-width="320"
            >
              <template #activator="{ props }">
                <v-btn
                  class="local-toolbar-btn my-2 mx-2"
                  color="primary"
                  size="small"
                  variant="outlined"
                  icon="mdi-shape-plus"
                  v-bind="props"
                />
              </template>
              <v-card class="toolbar-menu-card">
                <v-card-title class="text-subtitle-2">Design</v-card-title>
                <v-card-text>
                  <p class="section-label">Color palette</p>
                  <div class="palette-grid mb-4">
                    <button
                      v-for="theme in colorThemes"
                      :key="`toolbar-theme-${theme.name}`"
                      type="button"
                      class="palette-item"
                      :class="{
                        'palette-item--active': selectedTheme === theme.name,
                      }"
                      @click="selectedTheme = theme.name"
                    >
                      <span :style="{ background: theme.sidebar }" />
                      <span :style="{ background: theme.accent }" />
                      <span :style="{ background: theme.page }" />
                    </button>
                  </div>

                  <p class="section-label">Page background</p>
                  <div class="palette-grid mb-4">
                    <button
                      v-for="option in pageBackgroundValidation"
                      :key="`toolbar-bg-${option.value}`"
                      type="button"
                      class="palette-item"
                      :class="{
                        'palette-item--active':
                          selectedPageBackground === option.value,
                      }"
                      :disabled="option.blocked"
                      :title="
                        option.blocked
                          ? 'Fond trop sombre ou contraste insuffisant'
                          : option.label
                      "
                      @click="selectedPageBackground = option.value"
                    >
                      <span :style="{ background: option.page }" />
                      <span :style="{ background: activeTheme.accent }" />
                      <span :style="{ background: activeTheme.sidebar }" />
                    </button>
                  </div>

                  <p class="section-label mt-4">Rounded</p>
                  <v-btn-toggle
                    v-model="selectedRounded"
                    mandatory
                    divided
                    class="rounded-toggle"
                    color="primary"
                  >
                    <v-btn
                      v-for="option in roundedOptions"
                      :key="`toolbar-rounded-${option.value}`"
                      :value="option.value"
                      variant="text"
                    >
                      {{ option.title }}
                    </v-btn>
                  </v-btn-toggle>
                  <v-alert
                    v-if="isCoverDocument"
                    type="info"
                    variant="tonal"
                    density="comfortable"
                    class="mt-3"
                  >
                    Cover page and cover letter templates hide layout controls
                    that do not apply (aside width, photo alignment without
                    photo, resume layout mode).
                  </v-alert>

                  <p class="section-label mt-4">Icons</p>
                  <div class="d-grid ga-3">
                    <v-switch
                      v-model="layoutSettings.showSectionIcons"
                      label="Show section icons"
                      color="primary"
                      hide-details
                      inset
                    />
                    <v-switch
                      v-model="layoutSettings.showContactIcons"
                      label="Show contact icons"
                      color="primary"
                      hide-details
                      inset
                    />
                    <AppSelect
                      v-model="layoutSettings.sectionIconStyle"
                      :items="sectionIconStyleOptions"
                      item-title="label"
                      item-value="value"
                      label="Icon style"
                      density="comfortable"
                      hide-details
                    />
                    <AppSelect
                      v-model="layoutSettings.iconSize"
                      :items="iconSizeOptions"
                      item-title="label"
                      item-value="value"
                      label="Icon size"
                      density="comfortable"
                      hide-details
                    />
                    <AppSelect
                      v-model="layoutSettings.iconColor"
                      :items="iconColorOptions"
                      item-title="label"
                      item-value="value"
                      label="Icon color"
                      density="comfortable"
                      hide-details
                    />
                  </div>
                </v-card-text>
              </v-card>
            </v-menu>
          </div>
          <div v-if="designMenuSupportsAsideWidth" class="mt-3">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-caption">Aside width</span>
              <span class="text-caption font-weight-medium">
                {{ layoutSettings.sidebarWidth }} px
              </span>
            </div>
            <v-slider
              v-model="layoutSettings.sidebarWidth"
              min="220"
              max="380"
              step="2"
              class="mx-1"
              color="primary"
              hide-details
            />
          </div>
          <div v-if="designMenuSupportsAsideWidth" class="mt-3">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-caption">Aside height</span>
              <span class="text-caption font-weight-medium">
                {{ layoutSettings.sidebarHeight }}%
              </span>
            </div>
            <v-slider
              v-model="layoutSettings.sidebarHeight"
              min="60"
              max="100"
              class="mx-1"
              step="1"
              color="primary"
              hide-details
            />
          </div>
          <AppSelect
            v-if="isResumeDocument"
            v-model="layoutSettings.layoutMode"
            :items="layoutModeOptions"
            item-title="label"
            item-value="value"
            label="Layout mode"
            density="comfortable"
            hide-details
            class="mb-3"
          />
          <AppSelect
            v-model="layoutSettings.lineDensity"
            :items="lineDensityOptions"
            item-title="label"
            item-value="value"
            label="Density"
            density="comfortable"
            hide-details
            class="mt-3"
          />
          <AppSelect
            v-model="layoutSettings.sectionDividerStyle"
            :items="sectionDividerStyleOptions"
            item-title="label"
            item-value="value"
            label="Section dividers"
            density="comfortable"
            class="mt-3"
            hide-details
          />
          <AppSelect
            v-if="designMenuSupportsPhotoPosition"
            v-model="layoutSettings.photoPosition"
            :items="photoPositionOptions"
            item-title="label"
            item-value="value"
            label="Photo alignment"
            density="comfortable"
            hide-details
            class="mt-3"
          />
          <AppSelect
            v-model="selectedTextStyle"
            :items="textStyleOptions"
            item-title="label"
            item-value="value"
            label="Typography preset"
            density="comfortable"
            hide-details
            class="mt-3"
          />
        </div>
      </template>
      <template #right>
        <v-chip color="primary" variant="tonal">Templates</v-chip>
        <AppSelect
          v-if="selectedDocumentType === 'resume'"
          v-model="selectedPreset"
          :items="soclePresetOptions"
          item-title="label"
          item-value="value"
          label="Style / Preset"
          density="comfortable"
          class="my-2"
          hide-details
        />

        <div class="template-drawer__grid">
          <button
            v-for="template in filteredTemplates"
            :key="`drawer-template-${template.id}`"
            type="button"
            class="template-drawer__item"
            :class="{
              'template-drawer__item--active': selectedTemplate === template.id,
            }"
            @click="applyTemplateSelection(template.id)"
          >
            <v-img
              :src="template.image"
              :alt="template.title"
              height="92"
              cover
              class="template-drawer__thumb"
            />
            <span class="template-drawer__label">{{ template.title }}</span>
          </button>
        </div>
      </template>
    </AppPageDrawers>
    <v-container fluid>
      <main class="resume-content-main">
        <div class="resume-page-content">
          <div class="resume-control-panels">
            <div class="local-toolbar-actions">
              <div class="local-toolbar-actions__row">
                <v-menu
                  v-model="toolbarSaveImportMenuOpen"
                  location="bottom center"
                  origin="top center"
                  max-width="560"
                >
                  <template #activator="{ props }">
                    <v-btn
                      class="local-toolbar-btn"
                      color="primary"
                      size="small"
                      variant="outlined"
                      prepend-icon="mdi-content-save-cog-outline"
                      v-bind="props"
                    >
                      Save / Import
                    </v-btn>
                  </template>
                  <v-card class="toolbar-menu-card">
                    <v-card-title class="text-subtitle-2"
                      >Save / Import</v-card-title
                    >
                    <v-card-text class="d-flex flex-column ga-2">
                      <v-btn
                        prepend-icon="mdi-content-save-outline"
                        color="primary"
                        variant="flat"
                        text="Save draft"
                        @click="openSaveModal"
                      />
                      <v-btn
                        prepend-icon="mdi-file-pdf-box"
                        color="secondary"
                        variant="outlined"
                        text="Preview PDF"
                        @click="openPdfPreview"
                      />
                      <v-btn
                        prepend-icon="mdi-download"
                        color="info"
                        variant="outlined"
                        text="Download PDF"
                        @click="onDownloadPdfClick"
                      />
                      <v-divider class="my-2" />
                      <v-btn
                        prepend-icon="mdi-sync"
                        variant="outlined"
                        color="primary"
                        :text="t('resumeBuilder.create.import.syncWithXing')"
                        @click="syncWithProvider('Xing')"
                      />
                      <v-btn
                        prepend-icon="mdi-linkedin"
                        variant="outlined"
                        color="info"
                        :text="
                          t('resumeBuilder.create.import.syncWithLinkedIn')
                        "
                        @click="syncWithProvider('LinkedIn')"
                      />
                      <v-btn
                        prepend-icon="mdi-file-upload-outline"
                        variant="flat"
                        color="secondary"
                        :text="
                          t('resumeBuilder.create.import.importOldResumePdf')
                        "
                        @click="triggerPdfImport"
                      />
                      <input
                        ref="importPdfInput"
                        type="file"
                        accept="application/pdf"
                        class="d-none"
                        @change="handlePdfImport"
                      />
                      <div v-if="importInProgress" class="mt-2">
                        <v-progress-linear
                          :model-value="importProgress"
                          color="primary"
                          height="8"
                          rounded
                          striped
                        />
                      </div>
                      <v-alert
                        v-if="importMessage"
                        class="mt-2"
                        :type="importInProgress ? 'info' : importMessageType"
                        variant="tonal"
                      >
                        {{ importMessage }}
                      </v-alert>
                    </v-card-text>
                  </v-card>
                </v-menu>

                <v-menu
                  v-model="toolbarSectionMenuOpen"
                  location="bottom center"
                  origin="top center"
                >
                  <template #activator="{ props }">
                    <v-btn
                      class="local-toolbar-btn"
                      color="primary"
                      size="small"
                      variant="outlined"
                      prepend-icon="mdi-view-list-outline"
                      v-bind="props"
                    >
                      Sections
                    </v-btn>
                  </template>
                  <v-list density="compact" min-width="220">
                    <v-list-item
                      v-for="section in addSectionOptions"
                      :key="`toolbar-add-${section.value}`"
                      :title="section.label"
                      @click="openAddSectionDialog(section.value)"
                    />
                  </v-list>
                </v-menu>

                <v-btn
                  class="local-toolbar-btn"
                  color="primary"
                  size="small"
                  variant="outlined"
                  prepend-icon="mdi-signature-freehand"
                  @click="openSignatureDialog"
                >
                  Signature
                </v-btn>
              </div>
            </div>
          </div>

          <section class="builder-preview-panel px-2">
            <div class="builder-preview resume-preview-drawer">
              <div class="resume-preview-wrapper">
                <div
                  ref="previewExportRef"
                  class="preview-grid resume-preview-frame"
                  :class="[
                    ...previewDesignClasses,
                    `photo-shape-${safePhotoShape}`,
                  ]"
                  :style="previewStyle"
                >
                  <div class="preview-shapes" aria-hidden="true">
                    <span
                      v-for="shape in decorativeShapes"
                      v-show="shape.enabled"
                      :key="`preview-shape-${shape.id}`"
                      class="preview-shape"
                      :class="`preview-shape--${shape.type}`"
                      :style="decorativeShapeStyle(shape)"
                    />
                  </div>
                  <div
                    class="cv-preview-stage"
                    :class="{
                      'cv-preview-stage--bordered': selectedRounded !== 'none',
                    }"
                  >
                    <div class="cv-page-shell" :class="previewDesignClasses">
                      <template v-if="rendererReady">
                        <ResumeRenderer
                          :class="previewDesignClasses"
                          :resume="resume"
                          :show-photo="templateSupportsPhoto"
                          :design-state="resumeRendererDesignState"
                          :photo-offset-x="resume.photoOffsetX"
                          :photo-offset-y="resume.photoOffsetY"
                          :photo-scale="resume.photoScale"
                          :photo-hidden="resume.photoHidden"
                          :section-layout="orderedPreviewSections"
                          :section-variants="sectionVariantByKey"
                          :photo-shape-options="photoShapeOptions"
                          :selected-photo-shape="safePhotoShape"
                          :on-photo-click="onPreviewPhotoClick"
                          :on-photo-shape-select="
                            (shape) => (selectedPhotoShape = shape)
                          "
                          :template-skin="selectedTemplateSkin"
                          editable
                          @add-item="addItemToPreviewSection"
                          @change-variant="setSectionVariant"
                          @move-photo="movePhoto"
                          @open-photo-picker="openPhotoPicker"
                          @remove-photo="clearPhoto"
                          @update:photo-size="layoutSettings.photoSize = $event"
                          @update:photo-border-width="
                            layoutSettings.photoBorderWidth = $event
                          "
                          @update:photo-position="
                            layoutSettings.photoPosition = $event
                          "
                          @move-section="moveSection"
                          @delete-section="deleteSection"
                        />
                      </template>
                      <div v-else class="preview-fallback">
                        <v-alert
                          type="error"
                          variant="tonal"
                          density="comfortable"
                          class="mb-3"
                        >
                          {{
                            rendererError ||
                            t('resumeBuilder.create.previewFallback.unavailable')
                          }}
                        </v-alert>
                        <h2 class="text-h5 mb-2">
                          {{
                            `${resume.firstName} ${resume.lastName}`.trim() ||
                            t('resumeBuilder.create.previewFallback.yourName')
                          }}
                        </h2>
                        <p class="text-body-2 mb-4">
                          {{ resume.role || t('resumeBuilder.create.previewFallback.jobTitle') }}
                        </p>
                        <section
                          v-for="section in previewFallbackSections"
                          :key="`preview-fallback-${section.title}`"
                          class="mb-3"
                        >
                          <h3 class="text-subtitle-2 mb-1">
                            {{ section.title }}
                          </h3>
                          <ul class="pl-4">
                            <li
                              v-for="item in section.items"
                              :key="`${section.title}-${item}`"
                            >
                              {{ item }}
                            </li>
                          </ul>
                        </section>
                        <v-btn
                          size="small"
                          variant="outlined"
                          prepend-icon="mdi-refresh"
                          @click="resetRendererGuard"
                        >
                          Retry render
                        </v-btn>
                      </div>
                      <div v-if="signatureDataUrl" class="signature-overlay">
                        <img :src="signatureDataUrl" alt="Signature" />
                      </div>
                    </div>
                    <div class="resume-page-break-hint">{{ t('resumeBuilder.create.static.a4PageEnd') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <v-dialog v-model="addSectionDialogOpen" max-width="760">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span
              >Add
              {{
                addSectionOptions.find(
                  (section) => section.value === addSectionType,
                )?.label
              }}</span
            >
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="addSectionDialogOpen = false"
            />
          </v-card-title>
          <v-divider />
          <v-card-text class="d-grid ga-3">
            <template v-if="addSectionType === 'profile'">
              <v-textarea
                v-model="addSectionDraft.profile.profile"
                label="Profile summary"
                rows="6"
                variant="outlined"
                hide-details
              />
            </template>

            <template v-else-if="addSectionType === 'experience'">
              <v-text-field
                v-model="addSectionDraft.experience.role"
                label="Role"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="addSectionDraft.experience.company"
                label="Company"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="addSectionDraft.experience.companyImageUrl"
                label="Company logo URL"
                variant="outlined"
                :error-messages="getExperienceLogoError('add-section')"
                @update:model-value="setExperienceLogoError('add-section')"
              />
              <div class="d-flex align-center ga-2">
                <v-btn
                  prepend-icon="mdi-image-plus-outline"
                  size="small"
                  variant="tonal"
                  @click="openExperienceLogoPicker('add-section')"
                >
                  Upload logo
                </v-btn>
                <input
                  ref="addSectionExperienceLogoInput"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  class="d-none"
                  @change="onAddSectionExperienceLogoSelected"
                />
              </div>
              <v-text-field
                v-model="addSectionDraft.experience.city"
                label="City"
                variant="outlined"
                hide-details
              />
              <div class="grid-2">
                <v-text-field
                  v-model="addSectionDraft.experience.start"
                  label="Start"
                  variant="outlined"
                  hide-details
                />
                <v-text-field
                  v-model="addSectionDraft.experience.end"
                  label="End"
                  variant="outlined"
                  hide-details
                />
              </div>
              <v-select
                v-model="addSectionDraft.experience.contentStyle"
                :items="resumeContentStyleSelectItems"
                label="Content style"
                variant="outlined"
                hide-details
              />
              <v-textarea
                v-model="addSectionDraft.experience.bullets"
                label="Content (one per line, timeline: Label | Detail)"
                rows="4"
                variant="outlined"
                hide-details
              />
            </template>

            <template v-else-if="addSectionType === 'education'">
              <v-text-field
                v-model="addSectionDraft.education.degree"
                label="Degree"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="addSectionDraft.education.school"
                label="School"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="addSectionDraft.education.schoolImageUrl"
                label="School logo URL (optional)"
                variant="outlined"
                hide-details
              />
              <div class="d-flex align-center ga-2">
                <input
                  id="education-image-input-add"
                  type="file"
                  accept="image/*"
                  class="d-none"
                  @change="(event) => onEducationImageSelected(event, 'add')"
                />
                <v-btn
                  prepend-icon="mdi-image-plus-outline"
                  variant="outlined"
                  size="small"
                  @click="triggerFileInputById('education-image-input-add')"
                >
                  Upload logo
                </v-btn>
                <v-avatar
                  v-if="addSectionDraft.education.schoolImageUrl"
                  rounded="lg"
                  size="40"
                >
                  <v-img
                    :src="addSectionDraft.education.schoolImageUrl"
                    alt="School logo preview"
                    cover
                  />
                </v-avatar>
              </div>
              <v-text-field
                v-model="addSectionDraft.education.city"
                label="City"
                variant="outlined"
                hide-details
              />
              <div class="grid-2">
                <v-text-field
                  v-model="addSectionDraft.education.start"
                  label="Start"
                  variant="outlined"
                  hide-details
                />
                <v-text-field
                  v-model="addSectionDraft.education.end"
                  label="End"
                  variant="outlined"
                  hide-details
                />
              </div>
              <v-select
                v-model="addSectionDraft.education.contentStyle"
                :items="resumeContentStyleSelectItems"
                label="Content style"
                variant="outlined"
                hide-details
              />
              <v-textarea
                v-model="addSectionDraft.education.note"
                label="Content (one per line, timeline: Label | Detail)"
                rows="3"
                variant="outlined"
                hide-details
              />
            </template>

            <template v-else-if="addSectionType === 'skill'">
              <v-text-field
                v-model="addSectionDraft.skill.name"
                :label="t('resumeBuilder.create.fields.skillName')"
                variant="outlined"
                hide-details
              />
              <v-slider
                v-model="addSectionDraft.skill.level"
                min="0"
                max="100"
                step="5"
                color="primary"
                thumb-label
              />
            </template>

            <template v-else-if="addSectionType === 'language'">
              <v-text-field
                v-model="addSectionDraft.language.name"
                :label="t('resumeBuilder.create.fields.languageName')"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="addSectionDraft.language.countryCode"
                :label="t('resumeBuilder.create.fields.countryCodeOptional')"
                :placeholder="t('resumeBuilder.create.placeholders.countryCode')"
                maxlength="2"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="addSectionDraft.language.flag"
                :label="t('resumeBuilder.create.fields.flagOptional')"
                :placeholder="t('resumeBuilder.create.placeholders.flag')"
                variant="outlined"
                hide-details
              />
              <v-slider
                v-model="addSectionDraft.language.level"
                min="0"
                max="100"
                step="5"
                color="primary"
                thumb-label
              />
            </template>

            <template v-else-if="addSectionType === 'hobby'">
              <v-text-field
                v-model="addSectionDraft.hobby.name"
                label="Hobby"
                variant="outlined"
                hide-details
              />
            </template>

            <template v-else-if="addSectionType === 'project'">
              <v-text-field
                v-model="addSectionDraft.project.name"
                :label="t('resumeBuilder.create.fields.projectName')"
                variant="outlined"
                hide-details
              />
              <v-select
                v-model="addSectionDraft.project.contentStyle"
                :items="resumeContentStyleSelectItems"
                label="Content style"
                variant="outlined"
                hide-details
              />
              <v-textarea
                v-model="addSectionDraft.project.summary"
                label="Project content (one per line, timeline: Label | Detail)"
                rows="4"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="addSectionDraft.project.imageUrl"
                label="Image URL (optional)"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="addSectionDraft.project.repositoryUrl"
                label="Repository URL (optional)"
                placeholder="https://github.com/org/repo"
                variant="outlined"
                :rules="[validateHttpRepositoryUrl]"
                @blur="
                  addSectionDraft.project.repositoryProvider =
                    detectRepositoryProvider(
                      addSectionDraft.project.repositoryUrl,
                    )
                "
              />
              <v-select
                v-model="addSectionDraft.project.repositoryProvider"
                :items="[
                  { title: 'GitHub', value: 'github' },
                  { title: 'GitLab', value: 'gitlab' },
                  { title: 'Other', value: 'other' },
                ]"
                label="Repository provider (optional)"
                variant="outlined"
                hide-details
              />
            </template>

            <template v-else-if="addSectionType === 'certification'">
              <v-text-field
                v-model="addSectionDraft.certification.title"
                label="Title"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="addSectionDraft.certification.school"
                label="Issuer"
                variant="outlined"
                hide-details
              />
              <div class="grid-2">
                <v-text-field
                  v-model="addSectionDraft.certification.start"
                  label="Start"
                  variant="outlined"
                  hide-details
                />
                <v-text-field
                  v-model="addSectionDraft.certification.end"
                  label="End"
                  variant="outlined"
                  hide-details
                />
              </div>
            </template>

            <template v-else-if="addSectionType === 'reference'">
              <v-text-field
                v-model="addSectionDraft.reference.name"
                label="Name"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="addSectionDraft.reference.company"
                label="Company"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="addSectionDraft.reference.email"
                label="Email"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="addSectionDraft.reference.phone"
                label="Phone"
                variant="outlined"
                hide-details
              />
            </template>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="addSectionDialogOpen = false"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="submitAddSection"
              >Add section</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="sectionItemDialogOpen" max-width="680">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span>
              Add {{ sectionDisplayLabel(activeSectionKey) }} item
              <v-chip
                size="x-small"
                class="ml-2"
                color="primary"
                variant="tonal"
              >
                {{ sectionVariantLabels[String(activeVariant)] }}
              </v-chip>
            </span>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="sectionItemDialogOpen = false"
            />
          </v-card-title>
          <v-divider />
          <v-card-text class="d-grid ga-3">
            <template v-if="activeSectionKey === 'experience'">
              <v-text-field
                v-model="sectionItemDraft.experience.role"
                label="Role"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="sectionItemDraft.experience.company"
                label="Company"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="sectionItemDraft.experience.companyImageUrl"
                label="Company logo URL"
                variant="outlined"
                :error-messages="getExperienceLogoError('section-item')"
                @update:model-value="setExperienceLogoError('section-item')"
              />
              <div class="d-flex align-center ga-2">
                <v-btn
                  prepend-icon="mdi-image-plus-outline"
                  size="small"
                  variant="tonal"
                  @click="openExperienceLogoPicker('section-item')"
                >
                  Upload logo
                </v-btn>
                <input
                  ref="sectionItemExperienceLogoInput"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  class="d-none"
                  @change="onSectionItemExperienceLogoSelected"
                />
              </div>
              <v-text-field
                v-model="sectionItemDraft.experience.city"
                label="City"
                variant="outlined"
                hide-details
              />
              <div class="grid-2">
                <v-text-field
                  v-model="sectionItemDraft.experience.start"
                  label="Start"
                  variant="outlined"
                  hide-details
                />
                <v-text-field
                  v-model="sectionItemDraft.experience.end"
                  label="End"
                  variant="outlined"
                  hide-details
                />
              </div>
              <v-select
                v-model="sectionItemDraft.experience.contentStyle"
                :items="resumeContentStyleSelectItems"
                item-title="label"
                item-value="value"
                label="Content style"
                variant="outlined"
                hide-details
              />
              <v-textarea
                v-model="sectionItemDraft.experience.bullets"
                label="Content (one per line, timeline: Label | Detail)"
                rows="4"
                variant="outlined"
                hide-details
              />
              <template v-if="sectionItemDraft.experience.contentStyle === 'timeline'">
                <v-text-field
                  v-model="sectionItemDraft.experience.timelineEventTitle"
                  label="Event title"
                  variant="outlined"
                  hide-details
                />
                <v-text-field
                  v-model="sectionItemDraft.experience.timelineDateRange"
                  label="Date range"
                  variant="outlined"
                  hide-details
                />
                <v-textarea
                  v-model="sectionItemDraft.experience.timelineDescription"
                  label="Short description"
                  rows="3"
                  variant="outlined"
                  hide-details
                />
              </template>
            </template>

            <template v-else-if="activeSectionKey === 'education'">
              <v-text-field
                v-model="sectionItemDraft.education.degree"
                label="Degree"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="sectionItemDraft.education.school"
                label="School"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="sectionItemDraft.education.schoolImageUrl"
                label="School logo URL (optional)"
                variant="outlined"
                hide-details
              />
              <div class="d-flex align-center ga-2">
                <input
                  id="education-image-input-section-item"
                  type="file"
                  accept="image/*"
                  class="d-none"
                  @change="
                    (event) => onEducationImageSelected(event, 'section')
                  "
                />
                <v-btn
                  prepend-icon="mdi-image-plus-outline"
                  variant="outlined"
                  size="small"
                  @click="
                    triggerFileInputById('education-image-input-section-item')
                  "
                >
                  Upload logo
                </v-btn>
                <v-avatar
                  v-if="sectionItemDraft.education.schoolImageUrl"
                  rounded="lg"
                  size="40"
                >
                  <v-img
                    :src="sectionItemDraft.education.schoolImageUrl"
                    alt="School logo preview"
                    cover
                  />
                </v-avatar>
              </div>
              <v-text-field
                v-model="sectionItemDraft.education.city"
                label="City"
                variant="outlined"
                hide-details
              />
              <div class="grid-2">
                <v-text-field
                  v-model="sectionItemDraft.education.start"
                  label="Start"
                  variant="outlined"
                  hide-details
                />
                <v-text-field
                  v-model="sectionItemDraft.education.end"
                  label="End"
                  variant="outlined"
                  hide-details
                />
              </div>
              <v-select
                v-model="sectionItemDraft.education.contentStyle"
                :items="resumeContentStyleSelectItems"
                label="Content style"
                variant="outlined"
                hide-details
              />
              <v-textarea
                v-model="sectionItemDraft.education.note"
                label="Content (one per line, timeline: Label | Detail)"
                rows="3"
                variant="outlined"
                hide-details
              />
            </template>

            <template v-else-if="activeSectionKey === 'language'">
              <v-text-field
                v-model="sectionItemDraft.language.name"
                :label="t('resumeBuilder.create.fields.languageName')"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="sectionItemDraft.language.countryCode"
                :label="t('resumeBuilder.create.fields.countryCodeOptional')"
                :placeholder="t('resumeBuilder.create.placeholders.countryCode')"
                maxlength="2"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="sectionItemDraft.language.flag"
                :label="t('resumeBuilder.create.fields.flagOptional')"
                :placeholder="t('resumeBuilder.create.placeholders.flag')"
                variant="outlined"
                hide-details
              />
              <v-rating
                v-if="activeVariant === 'stars'"
                v-model="sectionItemDraft.language.stars"
                color="amber"
                active-color="amber"
                length="5"
              />
              <v-slider
                v-else
                v-model="sectionItemDraft.language.level"
                min="0"
                max="100"
                step="5"
                color="primary"
                thumb-label
              />
            </template>

            <template v-else-if="activeSectionKey === 'project'">
              <v-text-field
                v-model="sectionItemDraft.project.name"
                :label="t('resumeBuilder.create.fields.projectName')"
                variant="outlined"
                hide-details
              />
              <v-select
                v-model="sectionItemDraft.project.contentStyle"
                :items="resumeContentStyleSelectItems"
                label="Content style"
                variant="outlined"
                hide-details
              />
              <v-textarea
                v-model="sectionItemDraft.project.summary"
                label="Project content (one per line, timeline: Label | Detail)"
                rows="4"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="sectionItemDraft.project.imageUrl"
                label="Image URL (optional)"
                variant="outlined"
                hide-details
              />
              <v-text-field
                v-model="sectionItemDraft.project.repositoryUrl"
                label="Repository URL (optional)"
                placeholder="https://github.com/org/repo"
                variant="outlined"
                :rules="[validateHttpRepositoryUrl]"
                @blur="
                  sectionItemDraft.project.repositoryProvider =
                    detectRepositoryProvider(
                      sectionItemDraft.project.repositoryUrl,
                    )
                "
              />
              <v-select
                v-model="sectionItemDraft.project.repositoryProvider"
                :items="[
                  { title: 'GitHub', value: 'github' },
                  { title: 'GitLab', value: 'gitlab' },
                  { title: 'Other', value: 'other' },
                ]"
                label="Repository provider (optional)"
                variant="outlined"
                hide-details
              />
            </template>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="sectionItemDialogOpen = false"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              prepend-icon="mdi-content-save-outline"
              @click="submitSectionItemDialog"
              >Save item</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="saveModalOpen" max-width="620">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span>{{ t('resumeBuilder.create.saveModal.title') }}</span>
            <v-btn
              icon="mdi-close"
              variant="text"
              :disabled="saveLoading"
              @click="saveModalOpen = false"
            />
          </v-card-title>
          <v-divider />
          <v-card-text class="d-grid ga-4">
            <v-radio-group
              v-model="saveMode"
              :disabled="saveLoading"
              hide-details
            >
              <v-radio
                value="replace"
                :label="t('resumeBuilder.create.saveModal.optionReplace')"
              />
              <v-radio value="create" :label="t('resumeBuilder.create.saveModal.optionCreate')" />
            </v-radio-group>

            <div v-if="saveMode === 'replace'" class="d-grid ga-2">
              <v-select
                v-model="selectedRemoteResumeId"
                :items="
                  remoteResumes.map((item) => ({
                    title: item.resumeInformation?.fullName || item.id,
                    value: item.id,
                  }))
                "
                item-title="title"
                item-value="value"
                :label="t('resumeBuilder.create.saveModal.resumeToReplace')"
                variant="outlined"
                :disabled="saveLoading"
                hide-details
              />
              <v-list
                v-if="remoteResumes.length"
                density="comfortable"
                class="border rounded"
              >
                <v-list-item
                  v-for="item in remoteResumes"
                  :key="item.id"
                  :title="item.resumeInformation?.fullName || item.id"
                  :subtitle="item.id"
                  @click="selectedRemoteResumeId = item.id"
                >
                  <template #append>
                    <v-btn
                      color="error"
                      size="small"
                      variant="text"
                      :disabled="saveLoading"
                      @click.stop="openDeleteResumeConfirmation(item.id)"
                    >
                      Delete
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
              <v-alert
                v-if="replaceConfirmStep"
                type="warning"
                variant="tonal"
                density="comfortable"
              >
                {{ t('resumeBuilder.create.saveModal.replaceWarning') }}
              </v-alert>
            </div>

            <v-progress-linear
              v-if="saveLoading"
              indeterminate
              color="primary"
            />

            <v-alert
              v-if="saveStatus !== 'idle'"
              :type="saveStatus"
              variant="tonal"
              density="comfortable"
            >
              {{ saveStatusMessage }}
            </v-alert>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              variant="text"
              :disabled="saveLoading"
              @click="saveModalOpen = false"
               >{{ t('common.cancel') }}</v-btn
            >
            <v-btn
              v-if="saveMode === 'replace' && !replaceConfirmStep"
              color="warning"
              :disabled="!selectedRemoteResumeId || saveLoading"
              @click="replaceConfirmStep = true"
            >
              Confirmer le remplacement
            </v-btn>
            <v-btn
              v-else
              color="primary"
              :loading="saveLoading"
              :disabled="saveMode === 'replace' && !selectedRemoteResumeId"
              @click="submitSaveAction"
            >
              {{ saveMode === 'replace' ? t('resumeBuilder.create.saveModal.replace') : t('resumeBuilder.create.saveModal.create') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="deleteConfirmModalOpen" max-width="460">
        <v-card>
          <v-card-title>{{ t('common.confirmation') }}</v-card-title>
          <v-card-text>{{ t('resumeBuilder.create.saveModal.deleteConfirm') }}</v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="deleteConfirmModalOpen = false"
               >{{ t('common.cancel') }}</v-btn
            >
            <v-btn color="error" @click="confirmDeleteRemoteResume"
              >Delete</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar
        v-model="toastOpen"
        :color="toastColor"
        timeout="3200"
        location="top right"
      >
        {{ toastMessage }}
      </v-snackbar>

      <v-dialog v-model="pdfModalOpen" width="900">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span>Design Preview</span>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="pdfModalOpen = false"
            />
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4 preview-modal-body">
            <div
              class="preview-grid"
              :class="previewDesignClasses"
              :style="previewStyle"
            >
              <div
                class="cv-preview-stage"
                :class="{
                  'cv-preview-stage--bordered': selectedRounded !== 'none',
                }"
              >
                <div class="cv-page-shell" :class="previewDesignClasses">
                  <template v-if="rendererReady">
                    <ResumeRenderer
                      :class="previewDesignClasses"
                      :resume="resume"
                      :show-photo="templateSupportsPhoto"
                      :design-state="resumeRendererDesignState"
                      :layout-mode="layoutSettings.layoutMode"
                      :photo-offset-x="resume.photoOffsetX"
                      :photo-offset-y="resume.photoOffsetY"
                      :photo-scale="resume.photoScale"
                      :photo-hidden="resume.photoHidden"
                      :section-layout="orderedPreviewSections"
                      :section-variants="sectionVariantByKey"
                      :photo-shape-options="photoShapeOptions"
                      :selected-photo-shape="safePhotoShape"
                      :on-photo-shape-select="
                        (shape) => (selectedPhotoShape = shape)
                      "
                      :on-photo-click="onPreviewPhotoClick"
                      :template-skin="selectedTemplateSkin"
                      editable
                      @add-item="addItemToPreviewSection"
                      @change-variant="setSectionVariant"
                      @move-photo="movePhoto"
                      @open-photo-picker="openPhotoPicker"
                      @remove-photo="clearPhoto"
                      @update:photo-size="layoutSettings.photoSize = $event"
                      @update:photo-border-width="
                        layoutSettings.photoBorderWidth = $event
                      "
                      @update:photo-position="
                        layoutSettings.photoPosition = $event
                      "
                      @move-section="moveSection"
                      @delete-section="deleteSection"
                    />
                  </template>
                  <div v-else class="preview-fallback">
                    <v-alert type="error" variant="tonal" density="comfortable">
                      {{
                        rendererError ||
                        t('resumeBuilder.create.previewFallback.unavailable')
                      }}
                    </v-alert>
                  </div>
                  <div v-if="signatureDataUrl" class="signature-overlay">
                    <img :src="signatureDataUrl" alt="Signature" />
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>

      <input
        ref="uploadInput"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        class="d-none"
        @change="onPhotoSelected"
      />

      <v-dialog v-model="photoDialogOpen" max-width="520">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span>Resume Photo</span>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="photoDialogOpen = false"
            />
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-img
              :src="resume.photoUrl || '/img/default_avatar.svg'"
              class="rounded-lg mb-4"
              max-height="380"
              cover
            />
            <div class="d-flex ga-2">
              <v-btn
                prepend-icon="mdi-upload"
                color="primary"
                variant="tonal"
                @click="openPhotoPicker"
                >Upload image</v-btn
              >
              <v-btn
                prepend-icon="mdi-delete-outline"
                color="error"
                variant="text"
                @click="clearPhoto"
                >Remove</v-btn
              >
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>

      <v-dialog v-model="aiCreateModalOpen" max-width="720">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span>Create Resume with KI</span>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="aiCreateModalOpen = false"
            />
          </v-card-title>
          <v-divider />
          <v-card-text>
            <p class="mb-3">
              Briefly describe what you studied and your main skills. KI will
              generate a full resume and apply it to the selected template.
            </p>
            <v-textarea
              v-model="aiProfilePrompt"
              label="Your studies and skills"
              rows="8"
              variant="outlined"
              placeholder="Example: I studied software engineering and I am skilled in Vue, TypeScript, SQL, and project management."
            />
            <v-alert
              v-if="aiActionError"
              type="error"
              variant="tonal"
              class="mt-2"
            >
              {{ aiActionError }}
            </v-alert>
            <v-progress-linear
              v-if="aiCreateLoading"
              indeterminate
              color="primary"
              class="mt-4 mb-2"
            />
            <p v-if="aiCreateLoading" class="text-caption mb-0">
              KI processing... {{ aiElapsedSeconds }}s
            </p>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn variant="text" @click="aiCreateModalOpen = false"
              >Cancel</v-btn
            >
            <v-btn
              color="primary"
              :loading="aiCreateLoading"
              prepend-icon="mdi-robot-outline"
              @click="runAiCreate"
            >
              Run
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="aiReviewModalOpen" max-width="760">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span>KI Review</span>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="aiReviewModalOpen = false"
            />
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-alert
              v-if="aiActionError"
              type="error"
              variant="tonal"
              class="mb-3"
            >
              {{ aiActionError }}
            </v-alert>
            <v-progress-linear
              v-if="aiReviewLoading"
              indeterminate
              color="primary"
              class="mb-2"
            />
            <p v-if="aiReviewLoading" class="text-caption mb-4">
              KI processing... {{ aiElapsedSeconds }}s
            </p>
            <div v-else class="review-text">
              {{ aiReviewContent }}
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-dialog v-model="signatureDialogOpen" max-width="760">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span>{{ t('resumeBuilder.create.signature.title') }}</span>
            <v-btn
              icon="mdi-close"
              variant="text"
              @click="signatureDialogOpen = false"
            />
          </v-card-title>
          <v-divider />
          <v-card-text>
            <canvas
              ref="signatureCanvas"
              width="680"
              height="220"
              class="signature-canvas"
              @mousedown="startDrawingSignature"
              @mousemove="drawSignature"
              @mouseup="stopDrawingSignature"
              @mouseleave="stopDrawingSignature"
              @touchstart="startDrawingSignature"
              @touchmove="drawSignature"
              @touchend="stopDrawingSignature"
            />
          </v-card-text>
          <v-card-actions class="justify-space-between">
            <v-btn
              prepend-icon="mdi-eraser"
              variant="text"
              @click="clearSignature"
               >{{ t('resumeBuilder.create.signature.clear') }}</v-btn
            >
            <v-btn
              color="primary"
              prepend-icon="mdi-content-save-outline"
              @click="saveSignature"
               >{{ t('resumeBuilder.create.signature.addToResume') }}</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <AppModal
        v-model="loginDialogOpen"
        :title="t('auth.login.title')"
        :max-width="560"
      >
        <AuthFormCard
          mode="login"
          :loading="loginLoading"
          @submit="onLoginSubmit"
        />
      </AppModal>
    </v-container>
  </div>
</template>

<style scoped>
.resume-create {
  --builder-column-gap: 16px;
  --preview-page-width: 794px;
  --preview-a4-height: 1123px;
  --preview-shell-padding: 16px;
  --preview-shell-max-width: calc(
    var(--preview-page-width) + (var(--preview-shell-padding) * 2)
  );
  min-height: 100vh;
}

.resume-content-main {
  height: calc(100vh - 93px);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.resume-page-content {
  width: min(100%, var(--preview-shell-max-width));
  max-width: var(--preview-shell-max-width);
  margin: 0 auto;
}

.resume-control-panels {
  position: sticky;
  top: 0px;
  z-index: 20;
  display: grid;
  gap: 10px;
  justify-items: center;
  padding-inline: 12px;
}

.template-control-panel {
  width: min(100%, 760px);
  padding: 12px;
  border-radius: 16px;
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-primary)) 24%, transparent);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 92%, transparent);
  backdrop-filter: blur(8px);
}

.builder-form {
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-primary)) 24%, transparent);
  border-radius: 14px;
  position: sticky;
  top: 60px;
  align-self: start;
  max-height: 90vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.builder-preview-pane {
  width: 100%;
  display: flex;
  justify-content: center;
  padding-inline: calc(var(--builder-column-gap) / 2);
}

.builder-left-rail {
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 94%, white);
}

.completion-card {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgb(var(--v-theme-primary));
  border-radius: 12px;
  padding: 14px;
}

.form-section {
  border-radius: 14px;
  padding: 8px;
}

.form-section h2 {
  font-size: 1.2rem;
  margin-bottom: 4px;
}

.form-section p {
  color: #6b7690;
  margin: 0;
}

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.edit-row {
  display: flex;
  justify-content: space-between;
  border: 1px dashed rgb(var(--v-theme-primary));
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
}

.compact-list {
  padding-left: 16px;
  margin: 0;
}

.review-text {
  white-space: pre-wrap;
  line-height: 1.6;
}

.section-label {
  font-weight: 700;
  margin-bottom: 8px;
  color: #1f2a44;
}

.preview-modal-body {
  max-height: 80vh;
  overflow: auto;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.palette-item {
  border: 1px solid rgb(var(--v-theme-primary));
  border-radius: 10px;
  padding: 6px;
  display: flex;
  gap: 4px;
}

.palette-item span {
  flex: 1;
  border-radius: 6px;
  height: 24px;
}

.palette-item--active {
  border-color: var(--v-theme-primary);
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.3);
}

.rounded-toggle {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.photo-uploader {
  display: flex;
  align-items: center;
  gap: 14px;
}

.photo-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.local-toolbar-actions {
  display: flex;
  justify-content: center;
  width: 100%;
}

.local-toolbar-actions__row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 20px;
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-primary)) 30%, transparent);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 84%, transparent);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.22);
}

.local-toolbar-btn {
  height: 56px !important;
  min-width: 56px !important;
  border-radius: 16px !important;
}

.toolbar-menu-card {
  width: min(92vw, 480px);
  max-height: min(76vh, 760px);
  overflow: auto;
}

.preview-grid {
  width: min(100%, var(--preview-shell-max-width));
  max-width: var(--preview-shell-max-width);
  margin: 0 auto;
  --cv-sidebar: #0b3a78;
  --cv-accent: #2563eb;
  --cv-page: #eff6ff;
  --cv-title: #1d4ed8;
  --cv-secondary: #334155;
  --cv-on-sidebar: #f8fafc;
  --cv-on-accent: #f8fafc;
  --cv-space-1: 4px;
  --cv-space-2: 8px;
  --cv-space-3: 12px;
  --cv-space-4: 16px;
  --cv-space-6: 24px;
  --cv-space-9: 36px;
  --cv-radius: 14px;
  --cv-font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  --cv-font-style: normal;
  --cv-font-weight: 400;
  display: flex;
  justify-content: center;
  padding: var(--cv-space-4);
}

.resume-preview-drawer {
  width: 100%;
}

.resume-preview-wrapper {
  width: min(100%, var(--preview-shell-max-width));
  max-width: var(--preview-shell-max-width);
  margin-inline: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: var(--builder-column-gap);
  scrollbar-gutter: stable both-edges;
}

.resume-preview-frame {
  width: var(--preview-shell-max-width);
  max-width: 100%;
  min-height: calc(100vh - 80px);
  flex: 0 0 auto;
  position: relative;
}

.preview-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.preview-shape {
  position: absolute;
  background: var(--shape-color);
  opacity: var(--shape-opacity);
  z-index: 0;
}

.preview-shape--circle {
  border-radius: 999px;
}

.preview-shape--square {
  border-radius: 10px;
}

.preview-shape--ring {
  border-radius: 999px;
  background: transparent;
  border: 8px solid color-mix(in srgb, var(--shape-color) 90%, white);
}

.preview-shape--bar {
  border-radius: 999px;
}

.cv-preview-stage {
  width: 100%;
  max-width: var(--preview-page-width);
  margin: 0 auto;
  padding: var(--preview-shell-padding);
  background: color-mix(in srgb, var(--cv-page) 68%, white);
  border-radius: calc(var(--cv-space-2) + var(--cv-space-1) / 2);
  position: relative;
  z-index: 1;
}

.cv-preview-stage::after {
  content: '';
  position: absolute;
  inset: var(--preview-shell-padding);
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent calc(var(--preview-a4-height) - 2px),
    color-mix(in srgb, var(--cv-accent) 38%, transparent) calc(var(--preview-a4-height) - 2px),
    color-mix(in srgb, var(--cv-accent) 38%, transparent) var(--preview-a4-height)
  );
  pointer-events: none;
  z-index: 0;
}

.resume-page-break-hint {
  text-align: center;
  font-size: 0.72rem;
  color: color-mix(in srgb, var(--cv-secondary) 75%, white);
  margin-top: 6px;
}

.cv-preview-stage--bordered {
  border: 1px solid color-mix(in srgb, var(--cv-secondary) 14%, transparent);
}

.cv-page-shell {
  width: 100%;
  background: color-mix(in srgb, var(--cv-page) 80%, white);
  border: 1px solid color-mix(in srgb, var(--cv-secondary) 18%, transparent);
  box-shadow: 0 var(--cv-space-4) var(--cv-space-9)
    color-mix(in srgb, var(--cv-secondary) 20%, transparent);
  border-radius: calc(var(--cv-space-1) + var(--cv-space-2) / 4);
  overflow: hidden;
  position: relative;
}

.preview-support-alert {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9;
  max-width: min(520px, calc(100% - 32px));
}

.preview-fallback {
  padding: 72px 20px 20px;
}

.signature-overlay {
  position: absolute;
  right: calc(var(--cv-space-4) + var(--cv-space-1) / 2);
  bottom: calc(var(--cv-space-4) + var(--cv-space-1) / 2);
  width: 190px;
  z-index: 7;
  max-width: calc(100% - 36px);
}

.signature-overlay img {
  width: 100%;
  object-fit: contain;
}

.photo-shape-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.signature-canvas {
  width: 100%;
  border: 1px dashed color-mix(in srgb, var(--cv-secondary) 45%, var(--cv-page));
  border-radius: var(--cv-space-3);
  background: color-mix(in srgb, var(--cv-page) 88%, white);
  touch-action: none;
}

.preview-grid.photo-shape-square :deep(.v-avatar),
.preview-grid.photo-shape-square :deep(.avatar),
.preview-grid.photo-shape-square :deep(img.avatar),
.preview-grid.photo-shape-square :deep(img[class*='photo']) {
  border-radius: 8px !important;
}

.preview-grid.photo-shape-rounded :deep(.v-avatar),
.preview-grid.photo-shape-rounded :deep(.avatar),
.preview-grid.photo-shape-rounded :deep(img.avatar),
.preview-grid.photo-shape-rounded :deep(img[class*='photo']) {
  border-radius: 18px !important;
}

.preview-grid.photo-shape-circle :deep(.v-avatar),
.preview-grid.photo-shape-circle :deep(.avatar),
.preview-grid.photo-shape-circle :deep(img.avatar),
.preview-grid.photo-shape-circle :deep(img[class*='photo']) {
  border-radius: 50% !important;
}

.preview-grid.photo-shape-portrait-card :deep(.v-avatar),
.preview-grid.photo-shape-portrait-card :deep(.avatar),
.preview-grid.photo-shape-portrait-card :deep(img.avatar),
.preview-grid.photo-shape-portrait-card :deep(img[class*='photo']) {
  border-radius: 22px !important;
}

.preview-grid.photo-shape-soft-blob :deep(.v-avatar),
.preview-grid.photo-shape-soft-blob :deep(.avatar),
.preview-grid.photo-shape-soft-blob :deep(img.avatar),
.preview-grid.photo-shape-soft-blob :deep(img[class*='photo']) {
  border-radius: 62% 38% 48% 52% / 44% 58% 42% 56% !important;
}

.preview-grid.photo-shape-hex :deep(.v-avatar),
.preview-grid.photo-shape-hex :deep(.avatar),
.preview-grid.photo-shape-hex :deep(img.avatar),
.preview-grid.photo-shape-hex :deep(img[class*='photo']) {
  clip-path: polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%);
  border-radius: 0 !important;
}

.preview-grid :deep(.text-dark) {
  color: var(--cv-secondary) !important;
}

.preview-grid :deep(.resume-skin__aside .text-dark),
.preview-grid :deep(.resume-skin__aside .editable-text) {
  color: var(--cv-on-sidebar) !important;
}

.preview-grid :deep(.resume-skin__main .text-dark),
.preview-grid :deep(.resume-skin__main .editable-text) {
  color: var(--cv-secondary) !important;
}

.preview-grid :deep(.cv-heading-section) {
  color: var(--cv-accent) !important;
}

.preview-sidebar {
  background: var(--resume-sidebar, var(--cv-sidebar));
  color: #fff;
  padding: 28px 24px;
}

.preview-sidebar h1 {
  font-size: 2rem;
  line-height: 1.2;
  margin-bottom: 18px;
}

.preview-sidebar .job {
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  margin-bottom: 24px;
}

.preview-sidebar h3 {
  margin-top: 20px;
}

.preview-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 8px 0;
}

.preview-sidebar li {
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.level-list .progress {
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  margin-top: 5px;
}

.level-list .progress i {
  display: block;
  height: 4px;
  background: #fff;
}

.preview-content {
  padding: 28px;
}

.preview-content h2 {
  margin-bottom: 10px;
  font-size: 1.8rem;
  color: var(--cv-accent);
}

.preview-content h4 {
  margin-bottom: 6px;
  margin-top: 8px;
}

.dates {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  color: var(--cv-secondary);
  text-transform: uppercase;
}

.reference-item p {
  color: var(--cv-secondary);
}

.preview-grid.radius-none {
  --cv-radius: 0px;
}

.preview-grid.radius-sm {
  --cv-radius: var(--cv-space-2);
}

.preview-grid.radius-md {
  --cv-radius: calc(var(--cv-space-3) + var(--cv-space-1) / 2);
}

.preview-grid.radius-lg {
  --cv-radius: var(--cv-space-6);
}

.preview-grid.text-style-clean,
.preview-grid.font-clean {
  --cv-font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  --cv-font-style: normal;
  --cv-font-weight: 400;
}

.preview-grid.text-style-italic,
.preview-grid.font-italic {
  --cv-font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  --cv-font-style: italic;
  --cv-font-weight: 400;
}

.preview-grid.text-style-serif,
.preview-grid.font-serif {
  --cv-font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
  --cv-font-style: normal;
  --cv-font-weight: 400;
}

.preview-grid.text-style-mono,
.preview-grid.font-mono {
  --cv-font-family: 'IBM Plex Mono', 'Courier New', monospace;
  --cv-font-style: normal;
  --cv-font-weight: 400;
}

.preview-grid.text-style-display,
.preview-grid.font-display {
  --cv-font-family: 'Poppins', 'Avenir Next', 'Segoe UI', sans-serif;
  --cv-font-style: normal;
  --cv-font-weight: 600;
}

.preview-grid :deep(.resume-skin),
.preview-grid :deep(.resume-skin__header),
.preview-grid :deep(.resume-section),
.preview-grid :deep(.cv-heading-section) {
  font-family: var(--cv-font-family);
  font-style: var(--cv-font-style);
  font-weight: var(--cv-font-weight);
}

.preview-grid :deep(.resume-skin) {
  font-size: clamp(0.8rem, 0.2vw + 0.74rem, 0.94rem);
}

.preview-grid :deep(.resume-skin h1) {
  font-size: clamp(1.45rem, 1.2vw + 1rem, 2rem);
}

.preview-grid :deep(.resume-skin h2),
.preview-grid :deep(.resume-skin h3) {
  font-size: clamp(1.05rem, 0.6vw + 0.82rem, 1.45rem);
}

.preview-grid :deep(.resume-skin h4) {
  font-size: clamp(0.9rem, 0.35vw + 0.75rem, 1.12rem);
}

.preview-grid :deep(.resume-skin),
.preview-grid :deep(.resume-template),
.preview-grid :deep(.template-shell) {
  border-radius: var(--cv-radius);
}

.template-drawer {
  padding: 16px 12px;
}

.template-drawer__card {
  border-radius: 14px;
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 94%, transparent);
}

.template-drawer__tabs {
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-primary)) 18%, transparent);
  border-radius: 12px;
}

.template-drawer__grid {
  display: grid;
  gap: 10px;
}

.template-drawer__item {
  width: 100%;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 10px;
  padding: 6px;
  background: rgba(var(--v-theme-surface), 0.92);
  text-align: left;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.template-drawer__item:hover {
  transform: translateY(-1px);
  border-color: rgba(var(--v-theme-primary), 0.45);
}

.template-drawer__item--active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.25);
}

.template-drawer__thumb {
  border-radius: 8px;
}

.template-drawer__label {
  display: block;
  margin-top: 6px;
  font-size: 0.78rem;
  font-weight: 600;
}

.builder-form :deep(.v-field__input),
.builder-form :deep(textarea) {
  direction: ltr;
  text-align: left;
}
.fade-in-up {
  animation: fadeInUp 0.7s ease both;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1120px) {
  .builder-form {
    border: 0;
    position: static;
    max-height: none;
    overflow: visible;
  }

  .builder-preview-pane {
    position: static;
    top: auto;
    padding-top: 0;
  }
}

@media (max-width: 760px) {
  .grid-2,
  .palette-grid {
    grid-template-columns: 1fr;
  }

  .resume-control-panels {
    top: 66px;
    padding-inline: 10px;
  }

  .template-control-panel {
    width: 100%;
  }

  .resume-content-main {
    height: calc(100vh - 68px);
  }
}
</style>
