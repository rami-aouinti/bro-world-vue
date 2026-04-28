<script setup lang="ts">
import type { PageBackgroundId, RoundedOptionId, Typography } from '~/constants/resumeDesign'
import {
  COVER_LETTER_TEMPLATES,
  COVER_PAGE_TEMPLATES,
  DEFAULT_RESUME_TEMPLATE_ID,
  RESUME_TEMPLATES,
  type ResumeTemplateVariant,
} from '~/constants/resumeTemplates'
import { resolveTemplateSkin } from '~/constants/resumeTemplateSkins'
import {
  useResumeDesignControls,
} from '~/composables/useResumeDesignControls'
import { useResumeDocumentState } from '~/composables/useResumeDocumentState'
import { levelToStars, starsToPercent } from '~/utils/resumeLanguageLevel'
import ResumeRenderer from '~/components/Resume/Templates/ResumeRenderer.vue'

definePageMeta({
  title: 'Create Resume',
  layout: 'resume',
})

type Skill = { name: string; level: number }
type Language = { name: string; level: number; countryCode?: string; flag?: string }
type Experience = {
  role: string
  company: string
  city: string
  start: string
  end: string
  bullets: string[]
}
type Education = {
  degree: string
  school: string
  city: string
  start: string
  end: string
  note: string
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
  link?: string
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
type ResumeModel = {
  role: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  country: string
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
  variant: ResumeTemplateVariant
}
type TemplateFilter =
  | 'all'
  | 'with-photo'
  | 'two-column'
  | 'ats'
  | 'docx'
  | 'customized'
  | 'free'

type TemplateStyleSupport = {
  theme: boolean
  rounded: boolean
  textStyle: boolean
  sharedSections: boolean
}
type LevelInputMode = 'percent' | 'stars'
type PhotoShape = 'square' | 'rounded' | 'circle' | 'portrait-card' | 'soft-blob' | 'hex'
type PhotoShapeOption = {
  label: string
  value: PhotoShape
  icon: string
}
type LayoutSettings = {
  photoSize: number
  photoBorderWidth: number
  photoPosition: 'left' | 'center' | 'right'
  sidebarWidth: number
  sectionDividerStyle: 'none' | 'line' | 'thick'
  headingCase: 'normal' | 'uppercase'
  dateColumnWidth: number
  lineDensity: 'compact' | 'comfortable'
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
type PreviewSectionKey = 'experience' | 'education' | 'language' | 'project'
type EditableSectionKey = PreviewSectionKey | 'skill' | 'reference' | 'hobby' | 'certification'
type SharedSectionActionKey = EditableSectionKey | 'course'
type SectionLayoutVariant = {
  experience: 'detailed' | 'bullets' | 'compact'
  education: 'classic' | 'timeline' | 'two-column'
  language: 'classic' | 'text-level' | 'stars' | 'progress' | 'flags'
  project: 'classic' | 'list' | 'cards' | 'two-column'
  skill: 'classic'
  reference: 'classic'
  hobby: 'classic'
  certification: 'classic'
}
type SectionLayoutEntry<K extends EditableSectionKey = EditableSectionKey> = {
  key: K
  variant: SectionLayoutVariant[K]
  region: 'main' | 'aside'
  order: number
}

const activeTab = ref<'edit' | 'template' | 'design' | 'import'>('edit')
const toolbarTemplateMenuOpen = ref(false)
const toolbarSectionMenuOpen = ref(false)
const route = useRoute()
const selectedTemplate = ref(DEFAULT_RESUME_TEMPLATE_ID)
const selectedDocumentType = ref<'resume'>('resume')
const selectedTheme = ref('ocean')
const selectedPageBackground = ref<PageBackgroundId>('white')
const selectedRounded = ref<RoundedOptionId>('md')
const selectedTextStyle = ref<Typography>('clean')
const levelInputMode = ref<LevelInputMode>('percent')

const selectedTemplateFilter = ref<TemplateFilter>('all')
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
const layoutSettings = reactive<LayoutSettings>({
  photoSize: 140,
  photoBorderWidth: 6,
  photoPosition: 'center',
  sidebarWidth: 280,
  sectionDividerStyle: 'line',
  headingCase: 'normal',
  dateColumnWidth: 120,
  lineDensity: 'comfortable',
})
const photoShapeOptions = [
  { label: 'Carré', value: 'square', icon: '□' },
  { label: 'Arrondi', value: 'rounded', icon: '▢' },
  { label: 'Cercle', value: 'circle', icon: '◯' },
  { label: 'Portrait', value: 'portrait-card', icon: '▮' },
  { label: 'Blob', value: 'soft-blob', icon: '⬭' },
  { label: 'Hex', value: 'hex', icon: '⬢' },
] as const satisfies ReadonlyArray<PhotoShapeOption>

const templateFilters = [
  { label: 'All', value: 'all' },
  { label: 'With photo', value: 'with-photo' },
  { label: 'Two column', value: 'two-column' },
  { label: 'ATS', value: 'ats' },
  { label: 'DOCX', value: 'docx' },
  { label: 'Customized', value: 'customized' },
  { label: 'Free', value: 'free' },
] as const satisfies ReadonlyArray<{ label: string; value: TemplateFilter }>
const addSectionOptions = [
  { label: 'Profile', value: 'profile' },
  { label: 'Experience', value: 'experience' },
  { label: 'Education', value: 'education' },
  { label: 'Skill', value: 'skill' },
  { label: 'Language', value: 'language' },
  { label: 'Hobby', value: 'hobby' },
  { label: 'Project', value: 'project' },
  { label: 'Certification', value: 'certification' },
  { label: 'Reference', value: 'reference' },
] as const satisfies ReadonlyArray<{ label: string; value: AddSectionType }>
const sectionVariantLabels: Record<string, string> = {
  detailed: 'Detailed',
  bullets: 'Bullets',
  compact: 'Compact',
  classic: 'Classic',
  timeline: 'Timeline',
  'two-column': 'Two-column',
  stars: 'Stars',
  'text-level': 'Text level',
  progress: 'Progress',
  flags: 'Flags',
  cards: 'Cards',
  list: 'List',
}
const sectionConfig: {
  [K in PreviewSectionKey]: {
    label: string
    collection: 'experiences' | 'education' | 'languages' | 'projects'
  }
} = {
  experience: {
    label: 'Experience',
    collection: 'experiences',
  },
  education: {
    label: 'Education',
    collection: 'education',
  },
  language: {
    label: 'Language',
    collection: 'languages',
  },
  project: {
    label: 'Project',
    collection: 'projects',
  },
}
const variantRegistry: {
  [K in EditableSectionKey]: {
    allowed: SectionLayoutVariant[K][]
    fallback: SectionLayoutVariant[K]
  }
} = {
  experience: { allowed: ['detailed', 'bullets', 'compact'], fallback: 'detailed' },
  education: { allowed: ['classic', 'timeline', 'two-column'], fallback: 'classic' },
  language: { allowed: ['classic', 'text-level', 'stars', 'progress', 'flags'], fallback: 'classic' },
  project: { allowed: ['classic', 'list', 'cards', 'two-column'], fallback: 'classic' },
  skill: { allowed: ['classic'], fallback: 'classic' },
  reference: { allowed: ['classic'], fallback: 'classic' },
  hobby: { allowed: ['classic'], fallback: 'classic' },
  certification: { allowed: ['classic'], fallback: 'classic' },
}
const defaultSectionLayoutEntries: SectionLayoutEntry[] = [
  { key: 'experience', variant: 'detailed', region: 'main', order: 0 },
  { key: 'education', variant: 'classic', region: 'main', order: 1 },
  { key: 'project', variant: 'classic', region: 'main', order: 2 },
  { key: 'certification', variant: 'classic', region: 'main', order: 3 },
  { key: 'skill', variant: 'classic', region: 'aside', order: 0 },
  { key: 'language', variant: 'classic', region: 'aside', order: 1 },
  { key: 'reference', variant: 'classic', region: 'aside', order: 2 },
  { key: 'hobby', variant: 'classic', region: 'aside', order: 3 },
]

function normalizeSectionLayout(entries: Array<Partial<SectionLayoutEntry>> | SectionLayoutEntry[]) {
  const entryByKey = new Map<EditableSectionKey, Partial<SectionLayoutEntry>>()
  for (const entry of entries) {
    if (!entry || typeof entry.key !== 'string' || !(entry.key in variantRegistry)) continue
    entryByKey.set(entry.key as EditableSectionKey, entry)
  }

  return defaultSectionLayoutEntries.map((fallback) => {
    const entry = entryByKey.get(fallback.key)
    return {
      key: fallback.key,
      variant: normalizeSectionVariant(fallback.key, entry?.variant ?? fallback.variant),
      region: entry?.region === 'main' || entry?.region === 'aside' ? entry.region : fallback.region,
      order: typeof entry?.order === 'number' ? entry.order : fallback.order,
    }
  })
}
const coverPageTemplateCards: Template[] = COVER_PAGE_TEMPLATES.map(template => ({
  id: template.id,
  title: template.title,
  subtitle: template.subtitle,
  image: template.image,
  documentType: 'cover-page',
  hasPhoto: template.id === 'cover-page-terra',
  isTwoColumn: false,
  isAts: true,
  hasDocx: true,
  isCustomized: true,
  isFree: true,
  useTimeline: false,
  variant: template.id === 'cover-page-terra' ? 'classic' : 'minimalist',
}))

const coverLetterTemplateCards: Template[] = COVER_LETTER_TEMPLATES.map(template => ({
  id: template.id,
  title: template.title,
  subtitle: template.subtitle,
  image: template.image,
  documentType: 'cover-letter',
  hasPhoto: template.id === 'cover-letter-modern',
  isTwoColumn: false,
  isAts: true,
  hasDocx: true,
  isCustomized: true,
  isFree: true,
  useTimeline: false,
  variant: template.id === 'cover-letter-classic' ? 'traditional' : 'modern',
}))

const resumeTemplateCards: Template[] = RESUME_TEMPLATES.map(template => ({
  id: template.id,
  title: template.title,
  subtitle: template.subtitle,
  image: template.image,
  documentType: 'resume',
  hasPhoto: template.flags.photo,
  isTwoColumn: template.flags.twoColumn,
  isAts: template.flags.ats,
  hasDocx: template.flags.docx,
  isCustomized: template.flags.customized,
  isFree: template.flags.free,
  useTimeline: template.flags.timeline,
  variant: template.variant,
}))

const templates: Template[] = [
  ...resumeTemplateCards,
  ...coverPageTemplateCards,
  ...coverLetterTemplateCards,
]

const resumeTemplateSupportByVariant: Record<ResumeTemplateVariant, TemplateStyleSupport> = {
  aurora: { theme: true, rounded: true, textStyle: true, sharedSections: true },
  classic: { theme: true, rounded: true, textStyle: true, sharedSections: true },
  creative: { theme: true, rounded: true, textStyle: true, sharedSections: true },
  executive: { theme: true, rounded: true, textStyle: true, sharedSections: true },
  minimalist: { theme: true, rounded: true, textStyle: true, sharedSections: true },
  modern: { theme: true, rounded: true, textStyle: true, sharedSections: true },
  'ocean-split': { theme: true, rounded: true, textStyle: true, sharedSections: true },
  professional: { theme: true, rounded: true, textStyle: true, sharedSections: true },
  'corporate-blue': { theme: true, rounded: true, textStyle: true, sharedSections: true },
  'grid-slate': { theme: true, rounded: true, textStyle: true, sharedSections: true },
  terra: { theme: true, rounded: true, textStyle: true, sharedSections: true },
  traditional: { theme: true, rounded: true, textStyle: true, sharedSections: true },
}

const resume = reactive<ResumeModel>({
  role: 'Communication Specialist',
  firstName: 'Emma',
  lastName: 'Anderson',
  email: 'emma.anderson@portfolio.dev',
  phone: '+1 212-555-0177',
  city: 'New York',
  country: 'United States',
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
      city: 'New York',
      start: 'JAN 2018',
      end: 'DEC 2020',
      bullets: [
        'Offered literary suggestions based on customer needs and preferences.',
        'Followed directions from supervisors and managed projects with precision.',
        'Organized books and adhered to bookstore policies and standards.',
      ],
    },
    {
      role: 'Editorial Intern',
      company: 'NBC News',
      city: 'New York',
      start: 'JAN 2016',
      end: 'DEC 2017',
      bullets: [
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
    },
    {
      degree: 'High School Diploma',
      school: 'Regis High School',
      city: 'New York',
      start: 'SEPT 2012',
      end: 'MAY 2016',
      note: 'Graduated with High Honors.',
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
    },
    {
      name: 'Student Podcast Launch',
      summary:
        'Created scripts and episode communication plan for a 10-episode launch.',
    },
  ] as Project[],
})

const uploadInput = ref<HTMLInputElement | null>(null)
const importPdfInput = ref<HTMLInputElement | null>(null)
const importInProgress = ref(false)
const importProgress = ref(0)
const importMessage = ref('')
const importMessageType = ref<'info' | 'success' | 'error'>('info')
const importElapsedSeconds = ref(0)
let importElapsedTimer: ReturnType<typeof setInterval> | null = null

let importProgressTimer: ReturnType<typeof setInterval> | null = null

const templatesByDocumentType = computed(() =>
  templates.filter((template) => template.documentType === selectedDocumentType.value),
)

const filteredTemplates = computed(() => {
  if (selectedTemplateFilter.value === 'all') return templatesByDocumentType.value

  const predicateByFilter: Record<
    Exclude<TemplateFilter, 'all'>,
    (template: Template) => boolean
  > = {
    'with-photo': (template) => template.hasPhoto,
    'two-column': (template) => template.isTwoColumn,
    ats: (template) => template.isAts,
    docx: (template) => template.hasDocx,
    customized: (template) => template.isCustomized,
    free: (template) => template.isFree,
  }

  return templatesByDocumentType.value.filter(predicateByFilter[selectedTemplateFilter.value])
})

const selectedTemplateConfig = computed(
  () =>
    templatesByDocumentType.value.find((template) => template.id === selectedTemplate.value) ??
    templatesByDocumentType.value[0] ??
    templates[0],
)

onMounted(() => {
  const templateFromQuery = route.query.template
  const mode = route.query.mode

  if (typeof templateFromQuery === 'string') {
    const exists = templatesByDocumentType.value.some((template) => template.id === templateFromQuery)
    selectedTemplate.value = exists ? templateFromQuery : DEFAULT_RESUME_TEMPLATE_ID
  }

  if (mode === 'write')
    activeTab.value = 'edit'
})

const templateSupportsPhoto = computed(
  () => selectedTemplateConfig.value.hasPhoto,
)
const selectedTemplateSkin = computed(
  () => resolveTemplateSkin(selectedTemplateConfig.value.variant),
)
const { state: resumeDocumentState, hydrateFromStorage, migrateLegacyStorage, persist } = useResumeDocumentState(
  computed(() => selectedTemplateConfig.value.variant),
)
const pdfModalOpen = ref(false)
const photoDialogOpen = ref(false)
const aiMenuOpen = ref(false)
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
const selectedPhotoShape = ref<string>('square')
const safePhotoShape = computed<PhotoShape>(() => (
  photoShapeOptions.some(option => option.value === selectedPhotoShape.value)
    ? (selectedPhotoShape.value as PhotoShape)
    : 'square'
))
let aiElapsedTimer: ReturnType<typeof setInterval> | null = null
const { t } = useI18n()
const { loggedIn, fetch: refreshSession } = useUserSession()
const loginDialogOpen = ref(false)
const loginLoading = ref(false)
const pendingPdfDownload = ref(false)
const addSectionDialogOpen = ref(false)
const addSectionType = ref<AddSectionType>('experience')
const sectionLayout = ref<SectionLayoutEntry[]>(
  normalizeSectionLayout(defaultSectionLayoutEntries),
)
const sectionItemDialogOpen = ref(false)
const activeSectionKey = ref<PreviewSectionKey>('experience')
const activeVariant = ref<SectionLayoutVariant[PreviewSectionKey]>('detailed')
const sectionItemDraft = reactive({
  experience: { role: '', company: '', city: '', start: '', end: '', bullets: '' },
  education: { degree: '', school: '', city: '', start: '', end: '', note: '' },
  language: { name: '', level: 80, stars: 4, countryCode: '', flag: '' },
  project: { name: '', summary: '', link: '' },
})
const addSectionDraft = reactive({
  profile: { profile: '' },
  experience: { role: '', company: '', city: '', start: '', end: '', bullets: '' },
  education: { degree: '', school: '', city: '', start: '', end: '', note: '' },
  skill: { name: '', level: 80 },
  language: { name: '', level: 80, countryCode: '', flag: '' },
  hobby: { name: '' },
  project: { name: '', summary: '' },
  certification: { title: '', school: '', start: '', end: '' },
  reference: { name: '', company: '', email: '', phone: '' },
})

const PHOTO_MOVE_STEP = 4
const PHOTO_OFFSET_LIMIT = 48

function movePhoto(direction: 'left' | 'right' | 'up' | 'down') {
  if (direction === 'left') {
    resume.photoOffsetX = Math.max(-PHOTO_OFFSET_LIMIT, resume.photoOffsetX - PHOTO_MOVE_STEP)
    return
  }
  if (direction === 'right') {
    resume.photoOffsetX = Math.min(PHOTO_OFFSET_LIMIT, resume.photoOffsetX + PHOTO_MOVE_STEP)
    return
  }
  if (direction === 'up') {
    resume.photoOffsetY = Math.max(-PHOTO_OFFSET_LIMIT, resume.photoOffsetY - PHOTO_MOVE_STEP)
    return
  }
  resume.photoOffsetY = Math.min(PHOTO_OFFSET_LIMIT, resume.photoOffsetY + PHOTO_MOVE_STEP)
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

function clearPhoto() {
  resume.photoUrl = ''
}

function openSignatureDialog() {
  signatureDialogOpen.value = true
  nextTick(() => {
    const canvas = signatureCanvas.value
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = '#111827'
    context.lineWidth = 2
    context.lineCap = 'round'
    context.lineJoin = 'round'
  })
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

function setExperienceBullets(index: number, value: string) {
  resume.experiences[index].bullets = value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

const getExperienceBullets = (index: number) =>
  resume.experiences[index].bullets.join('\n')

function addExperience() {
  resume.experiences.push({
    role: '',
    company: '',
    city: '',
    start: '',
    end: '',
    bullets: [],
  })
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
    city: '',
    start: '',
    end: '',
    note: '',
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

function openToolbarTab(tab: 'template' | 'design' | 'import') {
  activeTab.value = tab
}

function applyTemplateFromToolbar(templateId: string) {
  selectedTemplate.value = templateId
  activeTab.value = 'template'
  toolbarTemplateMenuOpen.value = false
}

function resetSectionDraft(section: AddSectionType) {
  switch (section) {
    case 'profile':
      addSectionDraft.profile = { profile: '' }
      break
    case 'experience':
      addSectionDraft.experience = { role: '', company: '', city: '', start: '', end: '', bullets: '' }
      break
    case 'education':
      addSectionDraft.education = { degree: '', school: '', city: '', start: '', end: '', note: '' }
      break
    case 'skill':
      addSectionDraft.skill = { name: '', level: 80 }
      break
    case 'language':
      addSectionDraft.language = { name: '', level: 80, countryCode: '', flag: '' }
      break
    case 'hobby':
      addSectionDraft.hobby = { name: '' }
      break
    case 'project':
      addSectionDraft.project = { name: '', summary: '' }
      break
    case 'certification':
      addSectionDraft.certification = { title: '', school: '', start: '', end: '' }
      break
    case 'reference':
      addSectionDraft.reference = { name: '', company: '', email: '', phone: '' }
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
      resume.experiences.push({
        role: addSectionDraft.experience.role,
        company: addSectionDraft.experience.company,
        city: addSectionDraft.experience.city,
        start: addSectionDraft.experience.start,
        end: addSectionDraft.experience.end,
        bullets: addSectionDraft.experience.bullets
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean),
      })
      break
    case 'education':
      resume.education.push({
        degree: addSectionDraft.education.degree,
        school: addSectionDraft.education.school,
        city: addSectionDraft.education.city,
        start: addSectionDraft.education.start,
        end: addSectionDraft.education.end,
        note: addSectionDraft.education.note,
      })
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
      resume.projects.push({ ...addSectionDraft.project })
      break
    case 'certification':
      resume.courses.push({ ...addSectionDraft.certification })
      break
    case 'reference':
      resume.references.push({ ...addSectionDraft.reference })
      break
  }

  addSectionDialogOpen.value = false
  activeTab.value = 'edit'
}

const orderedPreviewSections = computed(() =>
  [...sectionLayout.value].sort((left, right) => {
    if (left.region === right.region) return left.order - right.order
    return left.region === 'main' ? -1 : 1
  }),
)

const sectionVariantByKey = computed<Partial<Record<EditableSectionKey, string>>>(() => (
  Object.fromEntries(sectionLayout.value.map(section => [section.key, section.variant]))
))

function sectionDisplayLabel(sectionKey: PreviewSectionKey) {
  return sectionConfig[sectionKey].label
}

function resetSectionItemDraft(section: PreviewSectionKey) {
  switch (section) {
    case 'experience':
      sectionItemDraft.experience = { role: '', company: '', city: '', start: '', end: '', bullets: '' }
      break
    case 'education':
      sectionItemDraft.education = { degree: '', school: '', city: '', start: '', end: '', note: '' }
      break
    case 'language':
      sectionItemDraft.language = { name: '', level: 80, stars: 4, countryCode: '', flag: '' }
      break
    case 'project':
      sectionItemDraft.project = { name: '', summary: '', link: '' }
      break
  }
}

function openSectionItemDialog(section: PreviewSectionKey) {
  activeSectionKey.value = section
  activeVariant.value = sectionLayout.value.find(item => item.key === section)?.variant ?? variantRegistry[section].fallback
  resetSectionItemDraft(section)
  sectionItemDialogOpen.value = true
}

function submitSectionItemDialog() {
  let item: Record<string, unknown> | null = null
  switch (activeSectionKey.value) {
    case 'experience':
      item = {
        role: sectionItemDraft.experience.role,
        company: sectionItemDraft.experience.company,
        city: sectionItemDraft.experience.city,
        start: sectionItemDraft.experience.start,
        end: sectionItemDraft.experience.end,
        bullets: sectionItemDraft.experience.bullets
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean),
      }
      break
    case 'education':
      item = {
        degree: sectionItemDraft.education.degree,
        school: sectionItemDraft.education.school,
        city: sectionItemDraft.education.city,
        start: sectionItemDraft.education.start,
        end: sectionItemDraft.education.end,
        note: sectionItemDraft.education.note,
      }
      break
    case 'language':
      item = {
        name: sectionItemDraft.language.name,
        level: activeVariant.value === 'stars'
          ? Math.max(0, Math.min(5, sectionItemDraft.language.stars)) * 20
          : sectionItemDraft.language.level,
        countryCode: sectionItemDraft.language.countryCode.trim(),
        flag: sectionItemDraft.language.flag.trim(),
      }
      break
    case 'project':
      item = {
        name: sectionItemDraft.project.name,
        summary: sectionItemDraft.project.summary,
        ...(sectionItemDraft.project.link.trim() ? { link: sectionItemDraft.project.link.trim() } : {}),
      }
      break
  }
  if (item) {
    const collection = sectionConfig[activeSectionKey.value].collection
    ;(resume[collection] as Array<Record<string, unknown>>).push(item)
  }
  sectionItemDialogOpen.value = false
}

function addItemToPreviewSection(section: SharedSectionActionKey) {
  if (section === 'course') {
    openAddSectionDialog('certification')
    return
  }
  if (section === 'certification' || section === 'reference' || section === 'hobby' || section === 'skill') {
    openAddSectionDialog(section)
    return
  }
  openSectionItemDialog(section)
}

function normalizeSectionVariant<K extends EditableSectionKey>(
  key: K,
  variant: unknown,
): SectionLayoutVariant[K] {
  const registry = variantRegistry[key]
  if (typeof variant === 'string' && registry.allowed.includes(variant as SectionLayoutVariant[K])) {
    return variant as SectionLayoutVariant[K]
  }
  if (import.meta.dev) {
    console.warn(`[resume-builder] Unknown "${key}" variant "${String(variant)}"; fallback to "${registry.fallback}".`)
  }
  return registry.fallback
}

function moveSectionUp(sectionKey: EditableSectionKey) {
  const currentSection = sectionLayout.value.find(item => item.key === sectionKey)
  if (!currentSection) return
  const regionEntries = [...sectionLayout.value]
    .filter(item => item.region === currentSection.region)
    .sort((left, right) => left.order - right.order)
  const regionIndex = regionEntries.findIndex(item => item.key === sectionKey)
  if (regionIndex <= 0) return
  const previous = regionEntries[regionIndex - 1]
  const originalOrder = currentSection.order
  currentSection.order = previous.order
  previous.order = originalOrder
}

function moveSectionDown(sectionKey: EditableSectionKey) {
  const currentSection = sectionLayout.value.find(item => item.key === sectionKey)
  if (!currentSection) return
  const regionEntries = [...sectionLayout.value]
    .filter(item => item.region === currentSection.region)
    .sort((left, right) => left.order - right.order)
  const regionIndex = regionEntries.findIndex(item => item.key === sectionKey)
  if (regionIndex < 0 || regionIndex >= regionEntries.length - 1) return
  const next = regionEntries[regionIndex + 1]
  const originalOrder = currentSection.order
  currentSection.order = next.order
  next.order = originalOrder
}

function moveSection(sectionKey: EditableSectionKey, direction: 'up' | 'down') {
  if (direction === 'up') {
    moveSectionUp(sectionKey)
    return
  }
  moveSectionDown(sectionKey)
}

function setSectionVariant<K extends EditableSectionKey>(key: K, variant: SectionLayoutVariant[K] | string) {
  const target = sectionLayout.value.find(section => section.key === key)
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
const activePageBackground = computed(() => resolvePageBackground(selectedPageBackground.value))
const designClassMap = computed(() => ({
  rounded: roundedOptions.find((item) => item.value === selectedRounded.value)?.className ?? 'radius-md',
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
      title: 'Profil',
      items: [resume.profile.trim()],
    })
  }

  if (resume.experiences.length) {
    sections.push({
      title: 'Expériences',
      items: resume.experiences
        .slice(0, 2)
        .map(item => [item.role, item.company].filter(Boolean).join(' — ') || 'Expérience'),
    })
  }

  if (resume.education.length) {
    sections.push({
      title: 'Formations',
      items: resume.education
        .slice(0, 2)
        .map(item => [item.degree, item.school].filter(Boolean).join(' — ') || 'Formation'),
    })
  }

  if (resume.skills.length) {
    sections.push({
      title: 'Compétences',
      items: resume.skills.slice(0, 6).map(item => item.name).filter(Boolean),
    })
  }

  return sections
})

function resetRendererGuard() {
  rendererReady.value = true
  rendererError.value = null
}

watch(selectedTemplate, () => {
  resetRendererGuard()
})

onErrorCaptured((error, instance, info) => {
  const componentName = instance?.type && typeof instance.type === 'object' && 'name' in instance.type
    ? String(instance.type.name || 'unknown')
    : 'unknown'
  console.error('[resume-preview] render error', error)
  rendererError.value = `Le rendu de la prévisualisation a échoué (${componentName}: ${info}).`
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

function bestAaTextColor(background: string, preferred: string, minimum = 4.5) {
  const candidates = [preferred, '#111827', '#0f172a', '#f8fafc', '#ffffff']
  const passing = candidates.find(color => contrastRatio(background, color) >= minimum)
  if (passing) return passing
  return candidates.sort((a, b) => contrastRatio(background, b) - contrastRatio(background, a))[0]
}

const minimumReadableContrast = 4.5
const pageBackgroundValidation = computed(() => pageBackgroundOptions.map(option => {
  const darkBlocked = !isAllowedPageBackground(option.page)
  const textContrast = contrastRatio(option.page, '#111827')
  return {
    ...option,
    blocked: darkBlocked || textContrast < minimumReadableContrast,
  }
}))

watch(pageBackgroundValidation, (options) => {
  const selected = options.find(option => option.value === selectedPageBackground.value)
  if (selected && !selected.blocked) return
  const fallback = options.find(option => !option.blocked)
  if (fallback) selectedPageBackground.value = fallback.value
}, { immediate: true })


const previewStyle = computed(() => ({
  '--cv-radius': roundedPxByValue[selectedRounded.value],
  '--cv-font-family': textStyleVarsByValue[selectedTextStyle.value].family,
  '--cv-font-style': textStyleVarsByValue[selectedTextStyle.value].style,
  '--cv-font-weight': textStyleVarsByValue[selectedTextStyle.value].weight,
  '--cv-sidebar': activeTheme.value.sidebar,
  '--cv-accent': activeTheme.value.accent,
  '--cv-page': activePageBackground.value.page,
  '--cv-title': bestAaTextColor(activePageBackground.value.page, activeTheme.value.accent, 4.5),
  '--cv-secondary': bestAaTextColor(activePageBackground.value.page, activeTheme.value.sidebar, 4.5),
  '--cv-on-sidebar': bestAaTextColor(activeTheme.value.sidebar, activePageBackground.value.page, 4.5),
  '--cv-on-accent': bestAaTextColor(activeTheme.value.accent, activePageBackground.value.page, 4.5),
}))
const selectedTemplateSupport = computed<TemplateStyleSupport | null>(() => {
  if (selectedTemplateConfig.value.documentType !== 'resume') return null
  return resumeTemplateSupportByVariant[selectedTemplateConfig.value.variant]
})
const selectedTemplateHasPartialSupport = computed(() => {
  if (!selectedTemplateSupport.value) return false
  const support = selectedTemplateSupport.value
  return !(support.theme && support.rounded && support.textStyle && support.sharedSections)
})

async function buildResumePdfBlob() {
  if (!previewExportRef.value || !import.meta.client) return ''
  const stylesheetContent = Array.from(
    document.querySelectorAll('style,link[rel="stylesheet"]'),
  )
    .map((node) => node.outerHTML)
    .join('\n')
  const content = previewExportRef.value.outerHTML

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Resume</title>
        ${stylesheetContent}
        <style>
          body { margin: 0; padding: 18px; background: #fff; }
          .preview-grid { min-height: auto !important; border-radius: 0 !important; }
          .preview-grid .terra-template,
          .preview-grid .ocean-template,
          .preview-grid .corporate-template,
          .preview-grid .professional-template,
          .preview-grid .classic-template,
          .preview-grid .executive-template {
            grid-template-columns: minmax(220px, 32%) 1fr !important;
          }
          .preview-grid .modern-template {
            grid-template-columns: 1fr 280px !important;
          }
          @media print {
            .preview-grid .terra-template,
            .preview-grid .ocean-template,
            .preview-grid .corporate-template,
            .preview-grid .professional-template,
            .preview-grid .classic-template,
            .preview-grid .executive-template {
              grid-template-columns: minmax(220px, 32%) 1fr !important;
            }
          }
          @page { size: A4; margin: 12mm; }
        </style>
      </head>
      <body>${content}</body>
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
      city: '',
      start: normalizeDateLabel(experience.startDate),
      end: normalizeDateLabel(experience.endDate),
      bullets: String(experience.description || '')
        .split(/\n|•|-/g)
        .map((bullet) => bullet.trim())
        .filter(Boolean),
    }))
  }

  if (Array.isArray(data.educations) && data.educations.length) {
    resume.education = data.educations.map((education) => ({
      degree: String(education.title || ''),
      school: String(education.school || ''),
      city: '',
      start: normalizeDateLabel(education.startDate),
      end: normalizeDateLabel(education.endDate),
      note: String(education.description || ''),
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
      summary: [project.description, project.link].filter(Boolean).join(' • '),
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

function buildReviewPayload() {
  return {
    resumeData: {
      contactInformation: {
        fullName: [resume.firstName, resume.lastName]
          .filter(Boolean)
          .join(' ')
          .trim(),
        email: resume.email,
        phone: resume.phone,
        address: [resume.city, resume.country].filter(Boolean).join(', '),
        links: [],
      },
      experiences: resume.experiences.map((experience) => ({
        title: experience.role,
        company: experience.company,
        startDate: experience.start,
        endDate: experience.end,
        description: experience.bullets.join('\n'),
      })),
      educations: resume.education.map((education) => ({
        title: education.degree,
        school: education.school,
        startDate: education.start,
        endDate: education.end,
        description: education.note,
      })),
      skills: resume.skills.map((skill) => skill.name).filter(Boolean),
    },
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
    aiActionError.value = 'Please provide a short summary before running AI.'
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

async function runAiReview() {
  aiReviewLoading.value = true
  aiActionError.value = ''
  aiReviewContent.value = ''
  startAiElapsedTimer()

  try {
    const response = await $fetch<{ review?: string }>(
      '/api/recruit/general/resumes/review',
      {
        method: 'POST',
        body: buildReviewPayload(),
      },
    )

    aiReviewContent.value = String(response.review || '').trim()
    if (!aiReviewContent.value) {
      throw new Error('Empty AI review response')
    }
    aiReviewModalOpen.value = true
  } catch (error) {
    aiActionError.value =
      error instanceof Error
        ? error.message
        : 'Unable to review resume with AI.'
  } finally {
    stopAiElapsedTimer()
    aiReviewLoading.value = false
  }
}

const showRightDrawerDesktop = useState(
  'show-right-drawer-desktop',
  () => false,
)
const showRightDrawerMobile = useState('show-right-drawer-mobile', () => false)
const previousDesktopRightDrawer = showRightDrawerDesktop.value
const previousMobileRightDrawer = showRightDrawerMobile.value

showRightDrawerDesktop.value = false
showRightDrawerMobile.value = false

onUnmounted(() => {
  stopImportProgress()
  stopAiElapsedTimer()
  showRightDrawerDesktop.value = previousDesktopRightDrawer
  showRightDrawerMobile.value = previousMobileRightDrawer
})

if (import.meta.client) {
  const LEGACY_LAYOUT_KEY = 'resume-layout-settings-v1'
  const LEGACY_SECTION_LAYOUT_KEY = 'resume-section-layout-v1'
  const rawLegacyLayout = localStorage.getItem(LEGACY_LAYOUT_KEY)
  const rawLegacySectionLayout = localStorage.getItem(LEGACY_SECTION_LAYOUT_KEY)

  hydrateFromStorage()
  migrateLegacyStorage(rawLegacyLayout, rawLegacySectionLayout)

  const customization = resumeDocumentState.value.customization
  selectedTheme.value = customization.style.palette
  selectedPageBackground.value = customization.style.pageBackground
  selectedRounded.value = customization.style.radius
  selectedTextStyle.value = customization.style.typography
  layoutSettings.lineDensity = customization.style.density
  sectionLayout.value = normalizeSectionLayout(customization.sectionOrder)

  watch([selectedTheme, selectedPageBackground, selectedRounded, selectedTextStyle], () => {
    resumeDocumentState.value.customization = {
      ...resumeDocumentState.value.customization,
      style: {
        ...resumeDocumentState.value.customization.style,
        palette: selectedTheme.value,
        pageBackground: selectedPageBackground.value,
        radius: selectedRounded.value,
        typography: selectedTextStyle.value,
      },
    }
    persist()
  })

  watch(() => layoutSettings.lineDensity, (density) => {
    resumeDocumentState.value.customization = {
      ...resumeDocumentState.value.customization,
      style: {
        ...resumeDocumentState.value.customization.style,
        density,
      },
    }
    persist()
  })

  watch(sectionLayout, (value) => {
    resumeDocumentState.value.customization = {
      ...resumeDocumentState.value.customization,
      sectionOrder: value.map(section => ({ ...section })),
    }
    persist()
  }, { deep: true })
}
</script>

<template>
  <v-container fluid class="resume-create pa-0">
    <div class="local-toolbar-actions">
      <div class="local-toolbar-actions__row">
        <v-btn class="local-toolbar-btn" color="primary" size="small" icon="mdi-content-save-outline" />
        <v-btn class="local-toolbar-btn" color="secondary" size="small" variant="outlined" icon="mdi-file-pdf-box" @click="openPdfPreview" />
        <v-btn class="local-toolbar-btn" color="info" size="small" variant="outlined" icon="mdi-download" @click="onDownloadPdfClick" />
        <v-menu v-model="toolbarTemplateMenuOpen" location="bottom center" origin="top center">
          <template #activator="{ props }">
            <v-btn class="local-toolbar-btn" color="primary" size="small" variant="outlined" prepend-icon="mdi-view-grid-outline" v-bind="props">
              Templates
            </v-btn>
          </template>
          <v-card class="toolbar-menu-card">
            <div class="toolbar-template-grid">
              <v-card
                v-for="template in templatesByDocumentType"
                :key="`toolbar-template-${template.id}`"
                class="template-card"
                :class="{ 'template-card--active': selectedTemplate === template.id }"
                variant="outlined"
                @click="applyTemplateFromToolbar(template.id)"
              >
                <v-img :src="template.image" height="96" cover />
                <v-card-text class="py-2 text-caption">{{ template.title }}</v-card-text>
              </v-card>
            </div>
          </v-card>
        </v-menu>
        <v-menu location="bottom center" origin="top center" max-width="560">
          <template #activator="{ props }">
            <v-btn class="local-toolbar-btn" color="primary" size="small" variant="outlined" prepend-icon="mdi-palette-outline" v-bind="props" @click="openToolbarTab('design')">
              Design
            </v-btn>
          </template>
          <v-card class="toolbar-menu-card">
            <v-card-title class="text-subtitle-2">Design</v-card-title>
            <v-card-text>
              <p class="section-label">Color palette</p>
              <div class="palette-grid mb-4">
                <button
                  v-for="theme in colorThemes"
                  :key="`toolbar-design-${theme.name}`"
                  type="button"
                  class="palette-item"
                  :class="{ 'palette-item--active': selectedTheme === theme.name }"
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
                  :key="`toolbar-page-bg-${option.value}`"
                  type="button"
                  class="palette-item"
                  :class="{ 'palette-item--active': selectedPageBackground === option.value }"
                  :disabled="option.blocked"
                  :title="option.blocked ? 'Fond trop sombre ou contraste insuffisant' : option.label"
                  @click="selectedPageBackground = option.value"
                >
                  <span :style="{ background: option.page }" />
                  <span :style="{ background: activeTheme.accent }" />
                  <span :style="{ background: activeTheme.sidebar }" />
                </button>
              </div>

              <p class="section-label">Rounded</p>
              <v-btn-toggle
                v-model="selectedRounded"
                mandatory
                divided
                class="rounded-toggle w-100"
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

              <p class="section-label mt-4">Text style</p>
              <AppSelect
                v-model="selectedTextStyle"
                :items="textStyleOptions"
                item-title="label"
                item-value="value"
                label="Typography preset"
                density="comfortable"
                hide-details
              />

              <v-divider class="my-4" />
              <p class="section-label">Layout settings</p>
              <v-slider
                v-model="layoutSettings.photoSize"
                label="Photo size"
                min="100"
                max="220"
                step="2"
                thumb-label
                hide-details="auto"
              />
              <v-slider
                v-model="layoutSettings.photoBorderWidth"
                label="Photo border"
                min="0"
                max="16"
                step="1"
                thumb-label
                hide-details="auto"
              />
              <AppSelect
                v-model="layoutSettings.photoPosition"
                :items="[
                  { label: 'Left', value: 'left' },
                  { label: 'Center', value: 'center' },
                  { label: 'Right', value: 'right' },
                ]"
                item-title="label"
                item-value="value"
                label="Photo position"
                density="comfortable"
                hide-details
                class="mt-3"
              />
              <v-slider
                v-model="layoutSettings.sidebarWidth"
                label="Sidebar width"
                min="220"
                max="360"
                step="2"
                thumb-label
                hide-details="auto"
              />
              <AppSelect
                v-model="layoutSettings.sectionDividerStyle"
                :items="[
                  { label: 'None', value: 'none' },
                  { label: 'Line', value: 'line' },
                  { label: 'Thick', value: 'thick' },
                ]"
                item-title="label"
                item-value="value"
                label="Section divider"
                density="comfortable"
                hide-details
                class="mt-3"
              />
              <v-switch
                v-model="layoutSettings.headingCase"
                false-value="normal"
                true-value="uppercase"
                label="Uppercase headings"
                color="primary"
                hide-details
                class="mt-2"
              />
              <v-slider
                v-model="layoutSettings.dateColumnWidth"
                label="Date column width"
                min="80"
                max="180"
                step="2"
                thumb-label
                hide-details="auto"
              />
              <v-switch
                v-model="layoutSettings.lineDensity"
                false-value="comfortable"
                true-value="compact"
                label="Compact line density"
                color="primary"
                hide-details
                class="mt-2"
              />
            </v-card-text>
          </v-card>
        </v-menu>
        <v-menu location="bottom center" origin="top center" max-width="560">
          <template #activator="{ props }">
            <v-btn class="local-toolbar-btn" color="primary" size="small" variant="outlined" prepend-icon="mdi-file-import-outline" v-bind="props" @click="openToolbarTab('import')">
              Import
            </v-btn>
          </template>
          <v-card class="toolbar-menu-card">
            <v-card-title class="text-subtitle-2">Import</v-card-title>
            <v-card-text class="d-flex flex-column ga-2">
              <v-btn prepend-icon="mdi-sync" variant="outlined" color="primary" :text="t('resumeBuilder.create.import.syncWithXing')" @click="syncWithProvider('Xing')" />
              <v-btn prepend-icon="mdi-linkedin" variant="outlined" color="info" :text="t('resumeBuilder.create.import.syncWithLinkedIn')" @click="syncWithProvider('LinkedIn')" />
              <v-btn prepend-icon="mdi-file-upload-outline" variant="flat" color="secondary" :text="t('resumeBuilder.create.import.importOldResumePdf')" @click="triggerPdfImport" />
              <div v-if="importInProgress" class="mt-2">
                <v-progress-linear :model-value="importProgress" color="primary" height="8" rounded striped />
              </div>
            </v-card-text>
          </v-card>
        </v-menu>
        <v-menu v-model="toolbarSectionMenuOpen" location="bottom center" origin="top center">
          <template #activator="{ props }">
            <v-btn class="local-toolbar-btn" color="primary" size="small" variant="outlined" prepend-icon="mdi-view-list-outline" v-bind="props">
              Add section
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
        <v-btn class="local-toolbar-btn" color="primary" size="small" variant="outlined" icon="mdi-draw" @click="openSignatureDialog" />
        <v-menu v-model="aiMenuOpen" :close-on-content-click="false" location="bottom center" origin="top center">
          <template #activator="{ props }">
            <v-btn class="local-toolbar-btn local-toolbar-btn--ki" color="deep-purple" size="small" variant="tonal" prepend-icon="mdi-creation" v-bind="props">KI</v-btn>
          </template>
          <v-card width="420" class="pa-3">
            <div class="ki-menu-grid">
              <v-card variant="outlined" class="ki-card" @click="aiCreateModalOpen = true; aiMenuOpen = false">
                <v-card-title class="text-subtitle-1">Create with KI</v-card-title>
                <v-card-text class="text-body-2">Generate a complete resume from a short summary of studies and skills.</v-card-text>
              </v-card>
              <v-card variant="outlined" class="ki-card" @click="runAiReview(); aiMenuOpen = false">
                <v-card-title class="text-subtitle-1">Review</v-card-title>
                <v-card-text class="text-body-2">Ask KI to detect errors and suggest improvements for your current resume.</v-card-text>
              </v-card>
            </div>
          </v-card>
        </v-menu>
      </div>
    </div>
    <div class="builder-layout">
      <section class="builder-form px-3 px-md-6 py-4">
        <v-tabs v-model="activeTab" color="primary" grow class="mb-4">
          <v-tab value="edit">Edit</v-tab>
          <v-tab value="template">Template</v-tab>
          <v-tab value="design">Design</v-tab>
          <v-tab value="import">Import</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="edit">
            <article class="form-section mb-2">
              <div class="mb-2">
                <div class="photo-uploader">
                  <v-avatar size="72" rounded="lg">
                    <v-img
                      :src="resume.photoUrl || '/img/default_avatar.svg'"
                      cover
                    />
                  </v-avatar>
                  <div class="photo-actions">
                    <v-btn
                      size="small"
                      prepend-icon="mdi-upload"
                      variant="tonal"
                      @click="openPhotoPicker"
                    >
                      Upload photo
                    </v-btn>
                    <v-btn
                      size="small"
                      prepend-icon="mdi-delete-outline"
                      variant="text"
                      color="error"
                      @click="clearPhoto"
                    >
                      Remove
                    </v-btn>
                    <input
                      ref="uploadInput"
                      type="file"
                      accept="image/*"
                      class="d-none"
                      @change="onPhotoSelected"
                    />
                  </div>
                </div>
                <div class="photo-shape-picker mt-2">
                  <span class="text-caption">Forme image</span>
                  <v-btn-toggle v-model="selectedPhotoShape" mandatory density="compact" color="primary">
                    <v-btn
                      v-for="shape in photoShapeOptions"
                      :key="`photo-shape-picker-${shape.value}`"
                      :value="shape.value"
                      size="x-small"
                    >
                      {{ shape.label }}
                    </v-btn>
                  </v-btn-toggle>
                </div>
              </div>
              <div class="grid-2 py-3">
                <v-text-field
                  v-model="resume.role"
                  label="Job target"
                  flat
                  hide-details
                />
                <v-text-field
                  v-model="resume.firstName"
                  label="First name"
                  flat
                  hide-details
                />
                <v-text-field
                  v-model="resume.lastName"
                  label="Last name"
                  flat
                  hide-details
                />
                <v-text-field
                  v-model="resume.email"
                  label="Email"
                  flat
                  hide-details
                />
                <v-text-field
                  v-model="resume.phone"
                  label="Phone"
                  flat
                  hide-details
                />
                <v-text-field
                  v-model="resume.city"
                  label="City"
                  flat
                  hide-details
                />
                <v-text-field
                  v-model="resume.country"
                  label="Country"
                  flat
                  hide-details
                />
              </div>
            </article>

            <article class="form-section mb-4">
              <header class="mb-4">
                <h2>Professional summary</h2>
              </header>
              <v-textarea
                v-model="resume.profile"
                label="Summary"
                rows="8"
                flat
                hide-details
              />
            </article>

            <article class="form-section mb-4">
              <header
                class="mb-4 d-flex align-center justify-space-between ga-3 flex-wrap"
              >
                <div>
                  <h2>Experiences</h2>
                </div>
                <v-btn
                  prepend-icon="mdi-plus"
                  variant="outlined"
                  size="small"
                  @click="addExperience"
                  >Add</v-btn
                >
              </header>
              <v-row
                v-for="(experience, index) in resume.experiences"
                :key="`${experience.company}-${index}`"
              >
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="experience.role"
                    label="Role"
                    variant="outlined"
                    hide-details
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="experience.company"
                    label="Company"
                    variant="outlined"
                    hide-details
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="experience.city"
                    label="City"
                    variant="outlined"
                    hide-details
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="experience.start"
                    label="Start"
                    variant="outlined"
                    hide-details
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="experience.end"
                    label="End"
                    variant="outlined"
                    hide-details
                /></v-col>
                <v-col cols="12" md="10">
                  <v-textarea
                    :model-value="getExperienceBullets(index)"
                    label="Bullets (1 line = 1 bullet)"
                    rows="8"
                    variant="outlined"
                    hide-details
                    @update:model-value="
                      (value) => setExperienceBullets(index, String(value))
                    "
                  />
                </v-col>
                <v-col cols="12" md="2" class="d-flex align-center">
                  <div class="d-flex flex-column ga-1">
                    <v-btn
                      icon="mdi-chevron-up"
                      variant="text"
                      size="x-small"
                      :disabled="index === 0"
                      @click="moveExperience(index, 'up')"
                    />
                    <v-btn
                      icon="mdi-chevron-down"
                      variant="text"
                      size="x-small"
                      :disabled="index === resume.experiences.length - 1"
                      @click="moveExperience(index, 'down')"
                    />
                    <v-btn
                      icon="mdi-delete-outline"
                      color="error"
                      variant="text"
                      size="small"
                      @click="removeExperience(index)"
                    />
                  </div>
                </v-col>
              </v-row>
            </article>

            <article class="form-section mb-4">
              <header
                class="mb-4 d-flex align-center justify-space-between ga-3 flex-wrap"
              >
                <div>
                  <h2>Education</h2>
                </div>
                <v-btn
                  prepend-icon="mdi-plus"
                  variant="outlined"
                  size="small"
                  @click="addEducation"
                  >Add</v-btn
                >
              </header>
              <v-row
                v-for="(item, index) in resume.education"
                :key="`${item.school}-${index}`"
              >
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="item.degree"
                    label="Degree"
                    variant="outlined"
                    hide-details
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="item.school"
                    label="School"
                    variant="outlined"
                    hide-details
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="item.city"
                    label="City"
                    variant="outlined"
                    hide-details
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="item.start"
                    label="Start"
                    variant="outlined"
                    hide-details
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="item.end"
                    label="End"
                    variant="outlined"
                    hide-details
                /></v-col>
                <v-col cols="12" md="10"
                  ><v-textarea
                    v-model="item.note"
                    label="Note"
                    rows="8"
                    variant="outlined"
                    hide-details
                /></v-col>
                <v-col cols="12" md="2" class="d-flex align-center">
                  <div class="d-flex flex-column ga-1">
                    <v-btn
                      icon="mdi-chevron-up"
                      variant="text"
                      size="x-small"
                      :disabled="index === 0"
                      @click="moveEducation(index, 'up')"
                    />
                    <v-btn
                      icon="mdi-chevron-down"
                      variant="text"
                      size="x-small"
                      :disabled="index === resume.education.length - 1"
                      @click="moveEducation(index, 'down')"
                    />
                    <v-btn
                      icon="mdi-delete-outline"
                      color="error"
                      variant="text"
                      size="small"
                      @click="removeEducation(index)"
                    />
                  </div>
                </v-col>
              </v-row>
            </article>

            <article class="form-section mb-4">
              <header class="mb-4">
                <h2>Skills & Languages</h2>
              </header>
              <div class="mb-4">
                <AppSelect
                  v-model="levelInputMode"
                  :items="[
                    { label: 'Percentage slider', value: 'percent' },
                    { label: 'Stars (level 1-5)', value: 'stars' },
                  ]"
                  item-title="label"
                  item-value="value"
                  label="Level editor style"
                  density="comfortable"
                  hide-details
                />
              </div>
              <div>
                <div class="d-flex align-center justify-space-between my-4">
                  <v-chip color="primary">Skills</v-chip>
                  <v-btn
                    size="small"
                    variant="outlined"
                    prepend-icon="mdi-plus"
                    @click="addSkill"
                    >Add</v-btn
                  >
                </div>
                <div>
                  <v-row
                    v-for="(skill, index) in resume.skills"
                    :key="`skill-${index}`"
                    class="mb-2"
                  >
                    <v-col cols="5"
                      ><v-text-field
                        v-model="skill.name"
                        label="Skill"
                        variant="outlined"
                        hide-details
                    /></v-col>
                    <v-col cols="5"
                    >
                      <v-slider
                        v-if="levelInputMode === 'percent'"
                        v-model="skill.level"
                        min="0"
                        max="100"
                        step="5"
                        thumb-label
                        color="primary"
                        hide-details
                      />
                      <v-rating
                        v-else
                        :model-value="getLevelAsStars(skill.level)"
                        color="amber"
                        active-color="amber"
                        density="comfortable"
                        @update:model-value="setLevelFromStars('skills', index, $event || 0)"
                      />
                    </v-col>
                    <v-col cols="2" class="d-flex align-center justify-center">
                      <v-btn
                        icon="mdi-delete-outline"
                        size="x-small"
                        color="error"
                        variant="text"
                        @click="removeSkill(index)"
                      />
                    </v-col>
                  </v-row>
                </div>
              </div>

              <div class="my-3">
                <div class="d-flex align-center justify-space-between my-4">
                  <v-chip color="primary"> Languages</v-chip>
                  <v-btn
                    size="small"
                    variant="outlined"
                    prepend-icon="mdi-plus"
                    @click="addLanguage"
                    >Add</v-btn
                  >
                </div>
                <div>
                  <v-row
                    v-for="(language, index) in resume.languages"
                    :key="`language-${index}`"
                    class="mb-2"
                  >
                    <v-col cols="3"
                      ><v-text-field
                        v-model="language.name"
                        label="Language"
                        variant="outlined"
                        hide-details
                    /></v-col>
                    <v-col cols="2">
                      <v-text-field
                        v-model="language.countryCode"
                        label="Country code"
                        placeholder="FR"
                        maxlength="2"
                        variant="outlined"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="2">
                      <v-text-field
                        v-model="language.flag"
                        label="Flag"
                        placeholder="🇫🇷"
                        variant="outlined"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="4"
                    >
                      <v-slider
                        v-if="levelInputMode === 'percent'"
                        v-model="language.level"
                        min="0"
                        max="100"
                        step="5"
                        thumb-label
                        color="primary"
                        hide-details
                      />
                      <v-rating
                        v-else
                        :model-value="getLevelAsStars(language.level)"
                        color="amber"
                        active-color="amber"
                        density="comfortable"
                        @update:model-value="setLevelFromStars('languages', index, $event || 0)"
                      />
                    </v-col>
                    <v-col cols="1" class="d-flex align-center justify-center">
                      <v-btn
                        icon="mdi-delete-outline"
                        size="x-small"
                        color="error"
                        variant="text"
                        @click="removeLanguage(index)"
                      />
                    </v-col>
                  </v-row>
                </div>
              </div>
            </article>

            <article class="form-section mb-4">
              <header class="mb-4 d-flex align-center justify-space-between ga-3 flex-wrap">
                <h2>Projects</h2>
                <v-btn prepend-icon="mdi-plus" variant="outlined" size="small" @click="addProject">Add</v-btn>
              </header>
              <v-row v-for="(project, index) in resume.projects" :key="`project-${index}`">
                <v-col cols="12" md="4">
                  <v-text-field v-model="project.name" label="Project name" variant="outlined" hide-details />
                </v-col>
                <v-col cols="12" md="7">
                  <v-text-field v-model="project.summary" label="Summary / impact" variant="outlined" hide-details />
                </v-col>
                <v-col cols="12" md="1" class="d-flex align-center justify-center">
                  <v-btn icon="mdi-delete-outline" size="x-small" color="error" variant="text" @click="removeProject(index)" />
                </v-col>
              </v-row>
            </article>

            <article class="form-section mb-4">
              <header class="mb-4 d-flex align-center justify-space-between ga-3 flex-wrap">
                <h2>Certifications</h2>
                <v-btn prepend-icon="mdi-plus" variant="outlined" size="small" @click="addCertification">Add</v-btn>
              </header>
              <v-row v-for="(course, index) in resume.courses" :key="`course-${index}`">
                <v-col cols="12" md="4">
                  <v-text-field v-model="course.title" label="Certification title" variant="outlined" hide-details />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field v-model="course.school" label="Issuer" variant="outlined" hide-details />
                </v-col>
                <v-col cols="6" md="2">
                  <v-text-field v-model="course.start" label="Date start" variant="outlined" hide-details />
                </v-col>
                <v-col cols="6" md="2">
                  <v-text-field v-model="course.end" label="Date end" variant="outlined" hide-details />
                </v-col>
                <v-col cols="12" md="1" class="d-flex align-center justify-center">
                  <v-btn icon="mdi-delete-outline" size="x-small" color="error" variant="text" @click="removeCertification(index)" />
                </v-col>
              </v-row>
            </article>

            <article class="form-section mb-4">
              <header class="mb-4 d-flex align-center justify-space-between ga-3 flex-wrap">
                <h2>References</h2>
                <v-btn prepend-icon="mdi-plus" variant="outlined" size="small" @click="addReference">Add</v-btn>
              </header>
              <v-row v-for="(reference, index) in resume.references" :key="`reference-${index}`">
                <v-col cols="12" md="3">
                  <v-text-field v-model="reference.name" label="Name" variant="outlined" hide-details />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field v-model="reference.company" label="Company" variant="outlined" hide-details />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field v-model="reference.email" label="Email" variant="outlined" hide-details />
                </v-col>
                <v-col cols="10" md="2">
                  <v-text-field v-model="reference.phone" label="Phone" variant="outlined" hide-details />
                </v-col>
                <v-col cols="2" md="1" class="d-flex align-center justify-center">
                  <v-btn icon="mdi-delete-outline" size="x-small" color="error" variant="text" @click="removeReference(index)" />
                </v-col>
              </v-row>
            </article>
          </v-window-item>

          <v-window-item value="template">
            <article class="form-section mb-4">
              <v-btn-toggle
                v-model="selectedDocumentType"
                mandatory
                color="primary"
                class="mb-4"
              >
                <v-btn value="cover-page">Cover page</v-btn>
                <v-btn value="cover-letter">Cover letter</v-btn>
                <v-btn value="resume">Resume</v-btn>
              </v-btn-toggle>

              <AppSelect
                v-model="selectedTemplateFilter"
                :items="templateFilters"
                item-title="label"
                item-value="value"
                label="Template filter"
                density="comfortable"
                class="template-filter-select mb-4"
                hide-details
              />

              <div class="template-grid">
                <v-card
                  v-for="template in filteredTemplates"
                  :key="template.id"
                  class="template-card"
                  :class="{
                    'template-card--active': selectedTemplate === template.id,
                  }"
                  variant="outlined"
                  @click="selectedTemplate = template.id"
                >
                  <v-img :src="template.image" height="120" cover />
                  <v-card-text>
                    <strong>{{ template.title }}</strong>
                    <div class="template-tags">
                      <v-chip
                        v-if="template.isAts"
                        size="x-small"
                        color="primary"
                        variant="tonal"
                        >ATS</v-chip
                      >
                      <v-chip
                        v-if="template.hasDocx"
                        size="x-small"
                        color="warning"
                        variant="tonal"
                        >DOCX</v-chip
                      >
                      <v-chip
                        v-if="template.hasPhoto"
                        size="x-small"
                        variant="outlined"
                        >Photo</v-chip
                      >
                      <v-chip
                        v-if="template.isTwoColumn"
                        size="x-small"
                        variant="outlined"
                        >2 cols</v-chip
                      >
                      <v-chip
                        v-if="template.documentType === 'resume'"
                        size="x-small"
                        :color="resumeTemplateSupportByVariant[template.variant].theme
                          && resumeTemplateSupportByVariant[template.variant].rounded
                          && resumeTemplateSupportByVariant[template.variant].textStyle
                          && resumeTemplateSupportByVariant[template.variant].sharedSections
                          ? 'success'
                          : 'warning'"
                        variant="tonal"
                      >
                        {{
                          resumeTemplateSupportByVariant[template.variant].theme
                            && resumeTemplateSupportByVariant[template.variant].rounded
                            && resumeTemplateSupportByVariant[template.variant].textStyle
                            && resumeTemplateSupportByVariant[template.variant].sharedSections
                            ? 'Support complet'
                            : 'Support partiel'
                        }}
                      </v-chip>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </article>
          </v-window-item>

          <v-window-item value="design">
            <article class="form-section mb-4">
              <header class="mb-4">
                <h2>Design</h2>
                <p>{{ t('resumeBuilder.create.design.description') }}</p>
              </header>

              <p class="section-label">Color palette</p>
              <div class="palette-grid mb-4">
                <button
                  v-for="theme in colorThemes"
                  :key="theme.name"
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
                  :key="option.value"
                  type="button"
                  class="palette-item"
                  :class="{
                    'palette-item--active': selectedPageBackground === option.value,
                  }"
                  :disabled="option.blocked"
                  :title="option.blocked ? 'Fond trop sombre ou contraste insuffisant' : option.label"
                  @click="selectedPageBackground = option.value"
                >
                  <span :style="{ background: option.page }" />
                  <span :style="{ background: activeTheme.accent }" />
                  <span :style="{ background: activeTheme.sidebar }" />
                </button>
              </div>

              <p class="section-label">Rounded</p>
              <v-btn-toggle
                v-model="selectedRounded"
                mandatory
                divided
                class="rounded-toggle"
                color="primary"
              >
                <v-btn
                  v-for="option in roundedOptions"
                  :key="option.value"
                  :value="option.value"
                  variant="text"
                >
                  {{ option.title }}
                </v-btn>
              </v-btn-toggle>

              <p class="section-label mt-4">Text style</p>
              <AppSelect
                v-model="selectedTextStyle"
                :items="textStyleOptions"
                item-title="label"
                item-value="value"
                label="Typography preset"
                density="comfortable"
                hide-details
              />

              <v-divider class="my-4" />
              <p class="section-label">Layout settings</p>
              <v-slider
                v-model="layoutSettings.photoSize"
                label="Photo size"
                min="100"
                max="220"
                step="2"
                thumb-label
                hide-details="auto"
              />
              <v-slider
                v-model="layoutSettings.photoBorderWidth"
                label="Photo border"
                min="0"
                max="16"
                step="1"
                thumb-label
                hide-details="auto"
              />
              <AppSelect
                v-model="layoutSettings.photoPosition"
                :items="[
                  { label: 'Left', value: 'left' },
                  { label: 'Center', value: 'center' },
                  { label: 'Right', value: 'right' },
                ]"
                item-title="label"
                item-value="value"
                label="Photo position"
                density="comfortable"
                hide-details
                class="mt-3"
              />
              <v-slider
                v-model="layoutSettings.sidebarWidth"
                label="Sidebar width"
                min="220"
                max="360"
                step="2"
                thumb-label
                hide-details="auto"
              />
              <AppSelect
                v-model="layoutSettings.sectionDividerStyle"
                :items="[
                  { label: 'None', value: 'none' },
                  { label: 'Line', value: 'line' },
                  { label: 'Thick', value: 'thick' },
                ]"
                item-title="label"
                item-value="value"
                label="Section divider"
                density="comfortable"
                hide-details
                class="mt-3"
              />
              <v-switch
                v-model="layoutSettings.headingCase"
                false-value="normal"
                true-value="uppercase"
                label="Uppercase headings"
                color="primary"
                hide-details
                class="mt-2"
              />
              <v-slider
                v-model="layoutSettings.dateColumnWidth"
                label="Date column width"
                min="80"
                max="180"
                step="2"
                thumb-label
                hide-details="auto"
              />
              <v-switch
                v-model="layoutSettings.lineDensity"
                false-value="comfortable"
                true-value="compact"
                label="Compact line density"
                color="primary"
                hide-details
                class="mt-2"
              />
            </article>
          </v-window-item>

          <v-window-item value="import">
            <article class="form-section mb-4">
              <header class="mb-4">
                <h2>Import</h2>
                <p>{{ t('resumeBuilder.create.import.description') }}</p>
              </header>

              <div class="d-flex flex-column ga-3">
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
                  :text="t('resumeBuilder.create.import.syncWithLinkedIn')"
                  @click="syncWithProvider('LinkedIn')"
                />
                <v-btn
                  prepend-icon="mdi-file-upload-outline"
                  variant="flat"
                  color="secondary"
                  :text="t('resumeBuilder.create.import.importOldResumePdf')"
                  @click="triggerPdfImport"
                />
                <input
                  ref="importPdfInput"
                  type="file"
                  accept="application/pdf"
                  class="d-none"
                  @change="handlePdfImport"
                />
              </div>

              <div v-if="importInProgress" class="mt-4">
                <v-progress-linear
                  :model-value="importProgress"
                  color="primary"
                  height="10"
                  rounded
                  striped
                />
                <p class="mt-2 mb-0">
                  {{ importMessage }} ({{ importProgress }}%) -
                  {{ importElapsedSeconds }}s
                </p>
              </div>

              <v-alert
                v-if="importMessage"
                class="mt-4"
                :type="importInProgress ? 'info' : importMessageType"
                variant="tonal"
              >
                {{ importMessage }}
              </v-alert>
            </article>
          </v-window-item>
        </v-window>
      </section>

      <aside class="builder-preview py-6 px-5 px-md-8">
        <div
          ref="previewExportRef"
          class="preview-grid"
          :class="[...previewDesignClasses, `photo-shape-${safePhotoShape}`]"
          :style="previewStyle"
        >
          <div class="cv-page-shell" :class="previewDesignClasses">
            <v-alert
              v-if="selectedTemplateHasPartialSupport"
              type="warning"
              density="compact"
              variant="tonal"
              class="preview-support-alert"
            >
              Ce template est en support partiel pour certains réglages de design.
            </v-alert>
            <template v-if="rendererReady">
              <ResumeRenderer
                :class="previewDesignClasses"
                :resume="resume"
                :show-photo="templateSupportsPhoto"
                :theme-tokens="previewStyle"
                :rounded-class="activeRoundedClass"
                :text-style-class="activeTextStyleClass"
                :density="layoutSettings.lineDensity"
                :divider-style="layoutSettings.sectionDividerStyle"
                :sidebar-width="layoutSettings.sidebarWidth"
                :photo-size="layoutSettings.photoSize"
                :photo-border-width="layoutSettings.photoBorderWidth"
                :photo-position="layoutSettings.photoPosition"
                :photo-offset-x="resume.photoOffsetX"
                :photo-offset-y="resume.photoOffsetY"
                :photo-scale="resume.photoScale"
                :photo-hidden="resume.photoHidden"
                :section-layout="orderedPreviewSections"
                :section-variants="sectionVariantByKey"
                :photo-shape-options="photoShapeOptions"
                :selected-photo-shape="safePhotoShape"
                :on-photo-click="onPreviewPhotoClick"
                :on-photo-shape-select="(shape) => selectedPhotoShape = shape"
                :template-skin="selectedTemplateSkin"
                editable
                @add-item="addItemToPreviewSection"
                @change-variant="setSectionVariant"
                @move-photo="movePhoto"
                @open-photo-picker="openPhotoPicker"
                @update:photo-size="layoutSettings.photoSize = $event"
                @update:photo-border-width="layoutSettings.photoBorderWidth = $event"
                @update:photo-position="layoutSettings.photoPosition = $event"
                @move-section="moveSection"
              />
            </template>
            <div v-else class="preview-fallback">
              <v-alert type="error" variant="tonal" density="comfortable" class="mb-3">
                {{ rendererError || 'La prévisualisation n’est pas disponible pour le moment.' }}
              </v-alert>
              <h2 class="text-h5 mb-2">{{ `${resume.firstName} ${resume.lastName}`.trim() || 'Votre nom' }}</h2>
              <p class="text-body-2 mb-4">{{ resume.role || 'Titre du poste' }}</p>
              <section
                v-for="section in previewFallbackSections"
                :key="`preview-fallback-${section.title}`"
                class="mb-3"
              >
                <h3 class="text-subtitle-2 mb-1">{{ section.title }}</h3>
                <ul class="pl-4">
                  <li v-for="item in section.items" :key="`${section.title}-${item}`">
                    {{ item }}
                  </li>
                </ul>
              </section>
              <v-btn size="small" variant="outlined" prepend-icon="mdi-refresh" @click="resetRendererGuard">
                Réessayer le rendu
              </v-btn>
            </div>
            <div v-if="signatureDataUrl" class="signature-overlay">
              <img :src="signatureDataUrl" alt="Signature" />
            </div>
          </div>
        </div>
      </aside>
    </div>

    <v-dialog v-model="addSectionDialogOpen" max-width="760">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Add {{ addSectionOptions.find(section => section.value === addSectionType)?.label }}</span>
          <v-btn icon="mdi-close" variant="text" @click="addSectionDialogOpen = false" />
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
            <v-text-field v-model="addSectionDraft.experience.role" label="Role" variant="outlined" hide-details />
            <v-text-field v-model="addSectionDraft.experience.company" label="Company" variant="outlined" hide-details />
            <v-text-field v-model="addSectionDraft.experience.city" label="City" variant="outlined" hide-details />
            <div class="grid-2">
              <v-text-field v-model="addSectionDraft.experience.start" label="Start" variant="outlined" hide-details />
              <v-text-field v-model="addSectionDraft.experience.end" label="End" variant="outlined" hide-details />
            </div>
            <v-textarea v-model="addSectionDraft.experience.bullets" label="Bullets (one per line)" rows="4" variant="outlined" hide-details />
          </template>

          <template v-else-if="addSectionType === 'education'">
            <v-text-field v-model="addSectionDraft.education.degree" label="Degree" variant="outlined" hide-details />
            <v-text-field v-model="addSectionDraft.education.school" label="School" variant="outlined" hide-details />
            <v-text-field v-model="addSectionDraft.education.city" label="City" variant="outlined" hide-details />
            <div class="grid-2">
              <v-text-field v-model="addSectionDraft.education.start" label="Start" variant="outlined" hide-details />
              <v-text-field v-model="addSectionDraft.education.end" label="End" variant="outlined" hide-details />
            </div>
            <v-textarea v-model="addSectionDraft.education.note" label="Note" rows="3" variant="outlined" hide-details />
          </template>

          <template v-else-if="addSectionType === 'skill'">
            <v-text-field v-model="addSectionDraft.skill.name" label="Skill name" variant="outlined" hide-details />
            <v-slider v-model="addSectionDraft.skill.level" min="0" max="100" step="5" color="primary" thumb-label />
          </template>

          <template v-else-if="addSectionType === 'language'">
            <v-text-field v-model="addSectionDraft.language.name" label="Language name" variant="outlined" hide-details />
            <v-text-field v-model="addSectionDraft.language.countryCode" label="Country code (optional)" placeholder="FR" maxlength="2" variant="outlined" hide-details />
            <v-text-field v-model="addSectionDraft.language.flag" label="Flag (optional)" placeholder="🇫🇷" variant="outlined" hide-details />
            <v-slider v-model="addSectionDraft.language.level" min="0" max="100" step="5" color="primary" thumb-label />
          </template>

          <template v-else-if="addSectionType === 'hobby'">
            <v-text-field v-model="addSectionDraft.hobby.name" label="Hobby" variant="outlined" hide-details />
          </template>

          <template v-else-if="addSectionType === 'project'">
            <v-text-field v-model="addSectionDraft.project.name" label="Project name" variant="outlined" hide-details />
            <v-textarea v-model="addSectionDraft.project.summary" label="Project summary" rows="4" variant="outlined" hide-details />
          </template>

          <template v-else-if="addSectionType === 'certification'">
            <v-text-field v-model="addSectionDraft.certification.title" label="Title" variant="outlined" hide-details />
            <v-text-field v-model="addSectionDraft.certification.school" label="Issuer" variant="outlined" hide-details />
            <div class="grid-2">
              <v-text-field v-model="addSectionDraft.certification.start" label="Start" variant="outlined" hide-details />
              <v-text-field v-model="addSectionDraft.certification.end" label="End" variant="outlined" hide-details />
            </div>
          </template>

          <template v-else-if="addSectionType === 'reference'">
            <v-text-field v-model="addSectionDraft.reference.name" label="Name" variant="outlined" hide-details />
            <v-text-field v-model="addSectionDraft.reference.company" label="Company" variant="outlined" hide-details />
            <v-text-field v-model="addSectionDraft.reference.email" label="Email" variant="outlined" hide-details />
            <v-text-field v-model="addSectionDraft.reference.phone" label="Phone" variant="outlined" hide-details />
          </template>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="addSectionDialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="submitAddSection">Add section</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="sectionItemDialogOpen" max-width="680">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>
            Add {{ sectionDisplayLabel(activeSectionKey) }} item
            <v-chip size="x-small" class="ml-2" color="primary" variant="tonal">
              {{ sectionVariantLabels[String(activeVariant)] }}
            </v-chip>
          </span>
          <v-btn icon="mdi-close" variant="text" @click="sectionItemDialogOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="d-grid ga-3">
          <template v-if="activeSectionKey === 'experience'">
            <v-text-field v-model="sectionItemDraft.experience.role" label="Role" variant="outlined" hide-details />
            <v-text-field v-model="sectionItemDraft.experience.company" label="Company" variant="outlined" hide-details />
            <v-text-field v-model="sectionItemDraft.experience.city" label="City" variant="outlined" hide-details />
            <div class="grid-2">
              <v-text-field v-model="sectionItemDraft.experience.start" label="Start" variant="outlined" hide-details />
              <v-text-field v-model="sectionItemDraft.experience.end" label="End" variant="outlined" hide-details />
            </div>
            <v-textarea v-model="sectionItemDraft.experience.bullets" label="Bullets (one per line)" rows="4" variant="outlined" hide-details />
          </template>

          <template v-else-if="activeSectionKey === 'education'">
            <v-text-field v-model="sectionItemDraft.education.degree" label="Degree" variant="outlined" hide-details />
            <v-text-field v-model="sectionItemDraft.education.school" label="School" variant="outlined" hide-details />
            <v-text-field v-model="sectionItemDraft.education.city" label="City" variant="outlined" hide-details />
            <div class="grid-2">
              <v-text-field v-model="sectionItemDraft.education.start" label="Start" variant="outlined" hide-details />
              <v-text-field v-model="sectionItemDraft.education.end" label="End" variant="outlined" hide-details />
            </div>
            <v-textarea v-model="sectionItemDraft.education.note" label="Note" rows="3" variant="outlined" hide-details />
          </template>

          <template v-else-if="activeSectionKey === 'language'">
            <v-text-field v-model="sectionItemDraft.language.name" label="Language name" variant="outlined" hide-details />
            <v-text-field v-model="sectionItemDraft.language.countryCode" label="Country code (optional)" placeholder="FR" maxlength="2" variant="outlined" hide-details />
            <v-text-field v-model="sectionItemDraft.language.flag" label="Flag (optional)" placeholder="🇫🇷" variant="outlined" hide-details />
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
            <v-text-field v-model="sectionItemDraft.project.name" label="Project name" variant="outlined" hide-details />
            <v-textarea v-model="sectionItemDraft.project.summary" label="Project summary" rows="4" variant="outlined" hide-details />
            <v-text-field
              v-if="activeVariant === 'cards' || activeVariant === 'list'"
              v-model="sectionItemDraft.project.link"
              label="Project link (optional)"
              variant="outlined"
              hide-details
            />
          </template>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="sectionItemDialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" prepend-icon="mdi-content-save-outline" @click="submitSectionItemDialog">Save item</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
            <div class="cv-page-shell" :class="previewDesignClasses">
              <template v-if="rendererReady">
                <ResumeRenderer
                  :class="previewDesignClasses"
                  :resume="resume"
                  :show-photo="templateSupportsPhoto"
                  :theme-tokens="previewStyle"
                  :rounded-class="activeRoundedClass"
                  :text-style-class="activeTextStyleClass"
                  :density="layoutSettings.lineDensity"
                  :divider-style="layoutSettings.sectionDividerStyle"
                  :sidebar-width="layoutSettings.sidebarWidth"
                  :photo-size="layoutSettings.photoSize"
                  :photo-border-width="layoutSettings.photoBorderWidth"
                  :photo-position="layoutSettings.photoPosition"
                  :photo-offset-x="resume.photoOffsetX"
                  :photo-offset-y="resume.photoOffsetY"
                  :photo-scale="resume.photoScale"
                  :photo-hidden="resume.photoHidden"
                  :section-layout="orderedPreviewSections"
                  :section-variants="sectionVariantByKey"
                  :photo-shape-options="photoShapeOptions"
                  :selected-photo-shape="safePhotoShape"
                  :on-photo-shape-select="(shape) => selectedPhotoShape = shape"
                  :on-photo-click="onPreviewPhotoClick"
                  :template-skin="selectedTemplateSkin"
                  editable
                  @add-item="addItemToPreviewSection"
                  @change-variant="setSectionVariant"
                  @move-photo="movePhoto"
                  @open-photo-picker="openPhotoPicker"
                  @update:photo-size="layoutSettings.photoSize = $event"
                  @update:photo-border-width="layoutSettings.photoBorderWidth = $event"
                  @update:photo-position="layoutSettings.photoPosition = $event"
                  @move-section="moveSection"
                />
              </template>
              <div v-else class="preview-fallback">
                <v-alert type="error" variant="tonal" density="comfortable">
                  {{ rendererError || 'La prévisualisation n’est pas disponible pour le moment.' }}
                </v-alert>
              </div>
              <div v-if="signatureDataUrl" class="signature-overlay">
                <img :src="signatureDataUrl" alt="Signature" />
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="photoDialogOpen" max-width="520">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Resume Photo</span>
          <v-btn icon="mdi-close" variant="text" @click="photoDialogOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-img :src="resume.photoUrl || '/img/default_avatar.svg'" class="rounded-lg mb-4" max-height="380" cover />
          <div class="d-flex ga-2">
            <v-btn prepend-icon="mdi-upload" color="primary" variant="tonal" @click="openPhotoPicker">Upload image</v-btn>
            <v-btn prepend-icon="mdi-delete-outline" color="error" variant="text" @click="clearPhoto">Remove</v-btn>
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
          <span>Ajouter une signature</span>
          <v-btn icon="mdi-close" variant="text" @click="signatureDialogOpen = false" />
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
          <v-btn prepend-icon="mdi-eraser" variant="text" @click="clearSignature">Effacer</v-btn>
          <v-btn color="primary" prepend-icon="mdi-content-save-outline" @click="saveSignature">Ajouter au CV</v-btn>
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
</template>

<style scoped>
.resume-create {
  min-height: 100vh;
  padding-top: 108px;
}

.builder-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(900px, 1fr);
}

.builder-form {
  border-right: 1px solid rgb(var(--v-theme-primary));
  position: sticky;
  top: 60px;
  align-self: start;
  max-height: 90vh;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.builder-actions {
  align-content: center;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
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

.template-filter-select {
  max-width: 320px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.template-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.template-card--active {
  border-color: var(--v-theme-primary);
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.3);
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ki-menu-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.ki-card {
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.ki-card:hover {
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.15);
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
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  justify-content: center;
  width: min(100%, 980px);
  padding-inline: 12px;
}

.local-toolbar-actions__row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-primary)) 30%, transparent);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 84%, transparent);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.22);
}

.local-toolbar-btn {
  height: 56px !important;
  min-width: 56px !important;
  border-radius: 16px !important;
}

.local-toolbar-btn--ki {
  min-width: 96px !important;
  padding-inline: 18px !important;
}

.toolbar-menu-card {
  width: min(92vw, 980px);
  max-height: min(76vh, 760px);
  overflow: auto;
}

.toolbar-template-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 12px;
}

.preview-grid {
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
  min-height: calc(100vh - 80px);
  display: flex;
  justify-content: center;
  padding: var(--cv-space-4);
}

.cv-page-shell {
  width: min(100%, 794px);
  background: color-mix(in srgb, var(--cv-page) 80%, white);
  border: 1px solid color-mix(in srgb, var(--cv-secondary) 18%, transparent);
  box-shadow: 0 var(--cv-space-4) var(--cv-space-9) color-mix(in srgb, var(--cv-secondary) 20%, transparent);
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
.preview-grid.photo-shape-square :deep(img[class*="photo"]) {
  border-radius: 8px !important;
}

.preview-grid.photo-shape-rounded :deep(.v-avatar),
.preview-grid.photo-shape-rounded :deep(.avatar),
.preview-grid.photo-shape-rounded :deep(img.avatar),
.preview-grid.photo-shape-rounded :deep(img[class*="photo"]) {
  border-radius: 18px !important;
}

.preview-grid.photo-shape-circle :deep(.v-avatar),
.preview-grid.photo-shape-circle :deep(.avatar),
.preview-grid.photo-shape-circle :deep(img.avatar),
.preview-grid.photo-shape-circle :deep(img[class*="photo"]) {
  border-radius: 50% !important;
}

.preview-grid.photo-shape-portrait-card :deep(.v-avatar),
.preview-grid.photo-shape-portrait-card :deep(.avatar),
.preview-grid.photo-shape-portrait-card :deep(img.avatar),
.preview-grid.photo-shape-portrait-card :deep(img[class*="photo"]) {
  border-radius: 22px !important;
}

.preview-grid.photo-shape-soft-blob :deep(.v-avatar),
.preview-grid.photo-shape-soft-blob :deep(.avatar),
.preview-grid.photo-shape-soft-blob :deep(img.avatar),
.preview-grid.photo-shape-soft-blob :deep(img[class*="photo"]) {
  border-radius: 62% 38% 48% 52% / 44% 58% 42% 56% !important;
}

.preview-grid.photo-shape-hex :deep(.v-avatar),
.preview-grid.photo-shape-hex :deep(.avatar),
.preview-grid.photo-shape-hex :deep(img.avatar),
.preview-grid.photo-shape-hex :deep(img[class*="photo"]) {
  clip-path: polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%);
  border-radius: 0 !important;
}

.preview-grid :deep(.text-dark) {
  color: var(--cv-secondary) !important;
}

.preview-sidebar {
  background: var(--cv-sidebar);
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

.preview-grid :deep(.resume-skin),
.preview-grid :deep(.resume-template),
.preview-grid :deep(.template-shell) {
  border-radius: var(--cv-radius);
}

@media (max-width: 1120px) {
  .builder-layout {
    grid-template-columns: 1fr;
  }

  .builder-form {
    border-right: 0;
    position: static;
    max-height: none;
    overflow: visible;
  }
}

@media (max-width: 760px) {
  .builder-actions,
  .grid-2,
  .template-grid,
  .palette-grid {
    grid-template-columns: 1fr;
  }

  .local-toolbar-actions {
    justify-content: center;
    top: 66px;
    width: calc(100% - 20px);
  }
}
</style>
