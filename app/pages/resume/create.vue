<script setup lang="ts">
import ResumeTemplateClassic from '~/components/Resume/Templates/ResumeTemplateClassic.vue'
import ResumeTemplateCreative from '~/components/Resume/Templates/ResumeTemplateCreative.vue'
import ResumeTemplateAurora from '~/components/Resume/Templates/ResumeTemplateAurora.vue'
import ResumeTemplateExecutive from '~/components/Resume/Templates/ResumeTemplateExecutive.vue'
import ResumeTemplateMinimalist from '~/components/Resume/Templates/ResumeTemplateMinimalist.vue'
import ResumeTemplateModern from '~/components/Resume/Templates/ResumeTemplateModern.vue'
import ResumeTemplateProfessional from '~/components/Resume/Templates/ResumeTemplateProfessional.vue'
import ResumeTemplateTraditional from '~/components/Resume/Templates/ResumeTemplateTraditional.vue'

definePageMeta({
  title: 'Create Resume',
  layout: 'resume',
})

type Skill = { name: string; level: number }
type Language = { name: string; level: number }
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
  hasPhoto: boolean
  isTwoColumn: boolean
  isAts: boolean
  hasDocx: boolean
  isCustomized: boolean
  isFree: boolean
  useTimeline: boolean
  variant:
    | 'classic'
    | 'modern'
    | 'professional'
    | 'traditional'
    | 'creative'
    | 'minimalist'
    | 'aurora'
    | 'executive'
}

type TemplateFilter =
  | 'all'
  | 'with-photo'
  | 'two-column'
  | 'ats'
  | 'docx'
  | 'customized'
  | 'free'

type ColorTheme = {
  name: string
  sidebar: string
  accent: string
  page: string
}

type RoundedOption = {
  title: string
  value: 'none' | 'sm' | 'md' | 'lg'
  className: string
}

type TextStyleOption = {
  label: string
  value: 'clean' | 'italic' | 'serif' | 'mono' | 'display'
  className: string
}
type LevelInputMode = 'percent' | 'stars'

const activeTab = ref<'edit' | 'template' | 'design' | 'import'>('edit')
const selectedTemplate = ref('classic')
const selectedTheme = ref('emerald')
const selectedRounded = ref<'none' | 'sm' | 'md' | 'lg'>('md')
const selectedTextStyle = ref<TextStyleOption['value']>('clean')
const levelInputMode = ref<LevelInputMode>('percent')

const selectedTemplateFilter = ref<TemplateFilter>('all')

const templateFilters = [
  { label: 'All', value: 'all' },
  { label: 'With photo', value: 'with-photo' },
  { label: 'Two column', value: 'two-column' },
  { label: 'ATS', value: 'ats' },
  { label: 'DOCX', value: 'docx' },
  { label: 'Customized', value: 'customized' },
  { label: 'Free', value: 'free' },
] as const satisfies ReadonlyArray<{ label: string; value: TemplateFilter }>

const templates: Template[] = [
  {
    id: 'classic',
    title: 'Classic',
    subtitle: 'Simple and readable format',
    image: '/img/cv/cv-4.png',
    hasPhoto: false,
    isTwoColumn: false,
    isAts: false,
    hasDocx: true,
    isCustomized: false,
    isFree: true,
    useTimeline: false,
    variant: 'classic',
  },
  {
    id: 'modern',
    title: 'Modern',
    subtitle: 'Clean blocks and balanced content',
    image: '/img/cv/cv-3.png',
    hasPhoto: true,
    isTwoColumn: true,
    isAts: false,
    hasDocx: true,
    isCustomized: true,
    isFree: true,
    useTimeline: false,
    variant: 'modern',
  },
  {
    id: 'professional',
    title: 'Professional',
    subtitle: 'Sidebar profile with details',
    image: '/img/cv/cv-1.png',
    hasPhoto: true,
    isTwoColumn: true,
    isAts: false,
    hasDocx: true,
    isCustomized: true,
    isFree: true,
    useTimeline: false,
    variant: 'professional',
  },
  {
    id: 'traditional',
    title: 'Traditional',
    subtitle: 'Formal and timeless structure',
    image: '/img/cv/cv-2.png',
    hasPhoto: false,
    isTwoColumn: false,
    isAts: false,
    hasDocx: true,
    isCustomized: false,
    isFree: true,
    useTimeline: false,
    variant: 'traditional',
  },
  {
    id: 'creative',
    title: 'Creative Timeline',
    subtitle: 'Creative layout with timeline sections',
    image: '/img/cv/cv-5.png',
    hasPhoto: true,
    isTwoColumn: true,
    isAts: false,
    hasDocx: false,
    isCustomized: true,
    isFree: true,
    useTimeline: true,
    variant: 'creative',
  },
  {
    id: 'minimalist',
    title: 'Minimalist',
    subtitle: 'Monochrome editorial minimalism',
    image: '/img/cv/cv-4.png',
    hasPhoto: false,
    isTwoColumn: false,
    isAts: true,
    hasDocx: true,
    isCustomized: true,
    isFree: true,
    useTimeline: false,
    variant: 'minimalist',
  },
  {
    id: 'aurora',
    title: 'Aurora',
    subtitle: 'Dark glassmorphism with neon accents',
    image: '/img/cv/cv-1.png',
    hasPhoto: true,
    isTwoColumn: true,
    isAts: false,
    hasDocx: false,
    isCustomized: true,
    isFree: true,
    useTimeline: false,
    variant: 'aurora',
  },
  {
    id: 'executive',
    title: 'Executive Timeline',
    subtitle: 'Leadership layout with timeline details',
    image: '/img/cv/cv-2.png',
    hasPhoto: true,
    isTwoColumn: true,
    isAts: true,
    hasDocx: true,
    isCustomized: true,
    isFree: true,
    useTimeline: true,
    variant: 'executive',
  },
]

const colorThemes: ColorTheme[] = [
  { name: 'emerald', sidebar: '#07564f', accent: '#0f766e', page: '#f8fafc' },
  { name: 'ocean', sidebar: '#0b3a78', accent: '#2563eb', page: '#eff6ff' },
  { name: 'plum', sidebar: '#4a1d5e', accent: '#9333ea', page: '#faf5ff' },
  { name: 'charcoal', sidebar: '#1f2937', accent: '#374151', page: '#f3f4f6' },
  { name: 'ruby', sidebar: '#7f1d1d', accent: '#dc2626', page: '#fff1f2' },
  { name: 'amber', sidebar: '#78350f', accent: '#d97706', page: '#fffbeb' },
  { name: 'sunset', sidebar: '#7c2d12', accent: '#f97316', page: '#fff7ed' },
  { name: 'slate', sidebar: '#0f172a', accent: '#475569', page: '#f8fafc' },
  { name: 'teal', sidebar: '#134e4a', accent: '#0d9488', page: '#f0fdfa' },
  { name: 'violet', sidebar: '#3b0764', accent: '#7c3aed', page: '#f5f3ff' },
  { name: 'forest', sidebar: '#14532d', accent: '#16a34a', page: '#f0fdf4' },
  { name: 'rose', sidebar: '#881337', accent: '#e11d48', page: '#fff1f2' },
]

const roundedOptions: RoundedOption[] = [
  { title: 'None', value: 'none', className: 'radius-none' },
  { title: 'Soft', value: 'sm', className: 'radius-sm' },
  { title: 'Default', value: 'md', className: 'radius-md' },
  { title: 'Large', value: 'lg', className: 'radius-lg' },
]

const textStyleOptions: TextStyleOption[] = [
  { label: 'Clean (Sans)', value: 'clean', className: 'text-style-clean' },
  { label: 'Italic', value: 'italic', className: 'text-style-italic' },
  { label: 'Classic Serif', value: 'serif', className: 'text-style-serif' },
  { label: 'Mono Tech', value: 'mono', className: 'text-style-mono' },
  { label: 'Display Bold', value: 'display', className: 'text-style-display' },
]

const resume = reactive<ResumeModel>({
  role: 'Communication Specialist',
  firstName: 'Emma',
  lastName: 'Anderson',
  email: 'emma.anderson@portfolio.dev',
  phone: '+1 212-555-0177',
  city: 'New York',
  country: 'United States',
  photoUrl: '/person.png',
  profile:
    'Dynamic communication specialist with strong storytelling, editorial planning, and social media execution experience. Passionate about building clear messages that engage audiences and support business goals.',
  skills: [
    { name: 'Advanced Communication Skills', level: 100 },
    { name: 'Office Technology Skills', level: 100 },
    { name: 'Motivated Attitude', level: 100 },
    { name: 'Social Media Platforms', level: 100 },
  ] as Skill[],
  languages: [
    { name: 'Spanish', level: 80 },
    { name: 'German', level: 80 },
    { name: 'English', level: 95 },
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

const filteredTemplates = computed(() => {
  if (selectedTemplateFilter.value === 'all') return templates

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

  return templates.filter(predicateByFilter[selectedTemplateFilter.value])
})

const selectedTemplateConfig = computed(
  () =>
    templates.find((template) => template.id === selectedTemplate.value) ??
    templates[0],
)

const selectedTemplateComponent = computed(() => {
  const componentByVariant = {
    aurora: ResumeTemplateAurora,
    classic: ResumeTemplateClassic,
    creative: ResumeTemplateCreative,
    executive: ResumeTemplateExecutive,
    minimalist: ResumeTemplateMinimalist,
    modern: ResumeTemplateModern,
    professional: ResumeTemplateProfessional,
    traditional: ResumeTemplateTraditional,
  } as const
  return componentByVariant[selectedTemplateConfig.value.variant]
})

const templateSupportsPhoto = computed(
  () => selectedTemplateConfig.value.hasPhoto,
)
const templateUsesTimeline = computed(
  () => selectedTemplateConfig.value.useTimeline,
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
let aiElapsedTimer: ReturnType<typeof setInterval> | null = null
const { t } = useI18n()
const { loggedIn, fetch: refreshSession } = useUserSession()
const loginDialogOpen = ref(false)
const loginLoading = ref(false)
const pendingPdfDownload = ref(false)

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
  resume.languages.push({ name: '', level: 75 })
}

function removeLanguage(index: number) {
  if (resume.languages.length === 1) return
  resume.languages.splice(index, 1)
}

function getLevelAsStars(level: number) {
  return Math.max(0, Math.min(5, Math.round(level / 20)))
}

function setLevelFromStars(
  collection: 'skills' | 'languages',
  index: number,
  stars: number,
) {
  const normalized = Math.max(0, Math.min(5, stars))
  resume[collection][index].level = normalized * 20
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

const activeTheme = computed(
  () =>
    colorThemes.find((theme) => theme.name === selectedTheme.value) ??
    colorThemes[0],
)
const activeRoundedClass = computed(
  () =>
    roundedOptions.find((item) => item.value === selectedRounded.value)
      ?.className ?? 'radius-md',
)
const activeTextStyleClass = computed(
  () =>
    textStyleOptions.find((item) => item.value === selectedTextStyle.value)
      ?.className ?? 'text-style-clean',
)
const previewExportRef = ref<HTMLElement | null>(null)

const previewStyle = computed(() => ({
  '--cv-sidebar': activeTheme.value.sidebar,
  '--cv-accent': activeTheme.value.accent,
  '--cv-page': activeTheme.value.page,
}))

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
</script>

<template>
  <v-container fluid class="resume-create pa-0">
    <client-only>
      <teleport to="#app-bar">
        <v-btn
          color="primary"
          class="mx-2"
          size="small"
          icon="mdi-content-save-outline"
        />
        <v-btn
          color="secondary"
          class="mx-2"
          size="small"
          variant="outlined"
          icon="mdi-file-pdf-box"
          @click="openPdfPreview"
        />
        <v-btn
          color="info"
          class="mx-2"
          size="small"
          variant="outlined"
          icon="mdi-download"
          @click="onDownloadPdfClick"
        />
        <v-menu
          v-model="aiMenuOpen"
          :close-on-content-click="false"
          location="bottom end"
        >
          <template #activator="{ props }">
            <v-btn
              color="deep-purple"
              class="mx-2"
              size="small"
              variant="tonal"
              prepend-icon="mdi-creation"
              v-bind="props"
            >
              KI
            </v-btn>
          </template>
          <v-card width="420" class="pa-3">
            <div class="ki-menu-grid">
              <v-card
                variant="outlined"
                class="ki-card"
                @click="aiCreateModalOpen = true; aiMenuOpen = false"
              >
                <v-card-title class="text-subtitle-1"
                  >Create with KI</v-card-title
                >
                <v-card-text class="text-body-2">
                  Generate a complete resume from a short summary of studies and
                  skills.
                </v-card-text>
              </v-card>
              <v-card
                variant="outlined"
                class="ki-card"
                @click="runAiReview(); aiMenuOpen = false"
              >
                <v-card-title class="text-subtitle-1">Review</v-card-title>
                <v-card-text class="text-body-2">
                  Ask KI to detect errors and suggest improvements for your
                  current resume.
                </v-card-text>
              </v-card>
            </div>
          </v-card>
        </v-menu>
      </teleport>
    </client-only>
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
                    <v-col cols="5"
                      ><v-text-field
                        v-model="language.name"
                        label="Language"
                        variant="outlined"
                        hide-details
                    /></v-col>
                    <v-col cols="5"
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
                    <v-col cols="2" class="d-flex align-center justify-center">
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
          :class="[activeRoundedClass, activeTextStyleClass]"
          :style="previewStyle"
        >
          <component
            :is="selectedTemplateComponent"
            :resume="resume"
            :show-photo="templateSupportsPhoto"
            :use-timeline="templateUsesTimeline"
            :on-photo-click="onPreviewPhotoClick"
            editable
          />
        </div>
      </aside>
    </div>

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
            :class="[activeRoundedClass, activeTextStyleClass]"
            :style="previewStyle"
          >
            <component
              :is="selectedTemplateComponent"
              :resume="resume"
              :show-photo="templateSupportsPhoto"
              :use-timeline="templateUsesTimeline"
              :on-photo-click="onPreviewPhotoClick"
              editable
            />
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

.preview-grid {
  --cv-sidebar: #07564f;
  --cv-accent: #0f766e;
  --cv-page: #f8fafc;
  min-height: calc(100vh - 80px);
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
  color: #6b7280;
  text-transform: uppercase;
}

.reference-item p {
  color: #334155;
}

.radius-none {
  border-radius: 0;
}

.radius-sm {
  border-radius: 8px;
}

.radius-md {
  border-radius: 14px;
}

.radius-lg {
  border-radius: 24px;
}

.text-style-clean {
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  font-style: normal;
}

.text-style-italic {
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  font-style: italic;
}

.text-style-serif {
  font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
}

.text-style-mono {
  font-family: 'IBM Plex Mono', 'Courier New', monospace;
}

.text-style-display {
  font-family: 'Poppins', 'Avenir Next', 'Segoe UI', sans-serif;
  font-weight: 600;
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
}
</style>
