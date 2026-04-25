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
  layout: 'resume'
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
  variant: 'classic' | 'modern' | 'professional' | 'traditional' | 'creative' | 'minimalist' | 'aurora' | 'executive'
}

type TemplateFilter = 'all' | 'with-photo' | 'two-column' | 'ats' | 'docx' | 'customized' | 'free'

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

const activeTab = ref<'edit' | 'template' | 'design'>('edit')
const selectedTemplate = ref('classic')
const selectedTheme = ref('emerald')
const selectedRounded = ref<'none' | 'sm' | 'md' | 'lg'>('md')
const selectedTextStyle = ref<TextStyleOption['value']>('clean')

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
  { id: 'classic', title: 'Classic', subtitle: 'Simple and readable format', image: '/img/cv/cv-4.png', hasPhoto: false, isTwoColumn: false, isAts: false, hasDocx: true, isCustomized: false, isFree: true, useTimeline: false, variant: 'classic' },
  { id: 'modern', title: 'Modern', subtitle: 'Clean blocks and balanced content', image: '/img/cv/cv-3.png', hasPhoto: true, isTwoColumn: true, isAts: false, hasDocx: true, isCustomized: true, isFree: true, useTimeline: false, variant: 'modern' },
  { id: 'professional', title: 'Professional', subtitle: 'Sidebar profile with details', image: '/img/cv/cv-1.png', hasPhoto: true, isTwoColumn: true, isAts: false, hasDocx: true, isCustomized: true, isFree: true, useTimeline: false, variant: 'professional' },
  { id: 'traditional', title: 'Traditional', subtitle: 'Formal and timeless structure', image: '/img/cv/cv-2.png', hasPhoto: false, isTwoColumn: false, isAts: false, hasDocx: true, isCustomized: false, isFree: true, useTimeline: false, variant: 'traditional' },
  { id: 'creative', title: 'Creative Timeline', subtitle: 'Creative layout with timeline sections', image: '/img/cv/cv-5.png', hasPhoto: true, isTwoColumn: true, isAts: false, hasDocx: false, isCustomized: true, isFree: true, useTimeline: true, variant: 'creative' },
  { id: 'minimalist', title: 'Minimalist', subtitle: 'Monochrome editorial minimalism', image: '/img/cv/cv-4.png', hasPhoto: false, isTwoColumn: false, isAts: true, hasDocx: true, isCustomized: true, isFree: true, useTimeline: false, variant: 'minimalist' },
  { id: 'aurora', title: 'Aurora', subtitle: 'Dark glassmorphism with neon accents', image: '/img/cv/cv-1.png', hasPhoto: true, isTwoColumn: true, isAts: false, hasDocx: false, isCustomized: true, isFree: true, useTimeline: false, variant: 'aurora' },
  { id: 'executive', title: 'Executive Timeline', subtitle: 'Leadership layout with timeline details', image: '/img/cv/cv-2.png', hasPhoto: true, isTwoColumn: true, isAts: true, hasDocx: true, isCustomized: true, isFree: true, useTimeline: true, variant: 'executive' },
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
    { name: 'French', level: 80 },
    { name: 'Dutch', level: 80 },
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
      summary: 'Led content calendar and boosted monthly newsletter open rate by 32%.',
    },
    {
      name: 'Student Podcast Launch',
      summary: 'Created scripts and episode communication plan for a 10-episode launch.',
    },
  ] as Project[],
})

const uploadInput = ref<HTMLInputElement | null>(null)

const filteredTemplates = computed(() => {
  if (selectedTemplateFilter.value === 'all') return templates

  const predicateByFilter: Record<Exclude<TemplateFilter, 'all'>, (template: Template) => boolean> = {
    'with-photo': template => template.hasPhoto,
    'two-column': template => template.isTwoColumn,
    ats: template => template.isAts,
    docx: template => template.hasDocx,
    customized: template => template.isCustomized,
    free: template => template.isFree,
  }

  return templates.filter(predicateByFilter[selectedTemplateFilter.value])
})

const selectedTemplateConfig = computed(() => templates.find(template => template.id === selectedTemplate.value) ?? templates[0])

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

const templateSupportsPhoto = computed(() => selectedTemplateConfig.value.hasPhoto)
const templateUsesTimeline = computed(() => selectedTemplateConfig.value.useTimeline)
const pdfModalOpen = ref(false)
const aiMenuOpen = ref(false)
const aiCreateModalOpen = ref(false)
const aiReviewModalOpen = ref(false)
const aiProfilePrompt = ref('')
const aiReviewContent = ref('')
const aiCreateLoading = ref(false)
const aiReviewLoading = ref(false)
const aiActionError = ref('')
const { locale } = useI18n()

function openPhotoPicker() {
  uploadInput.value?.click()
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
    .map(item => item.trim())
    .filter(Boolean)
}

const getExperienceBullets = (index: number) => resume.experiences[index].bullets.join('\n')

function addExperience() {
  resume.experiences.push({ role: '', company: '', city: '', start: '', end: '', bullets: [] })
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
  resume.education.push({ degree: '', school: '', city: '', start: '', end: '', note: '' })
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

const activeTheme = computed(() => colorThemes.find(theme => theme.name === selectedTheme.value) ?? colorThemes[0])
const activeRoundedClass = computed(() => roundedOptions.find(item => item.value === selectedRounded.value)?.className ?? 'radius-md')
const activeTextStyleClass = computed(() => textStyleOptions.find(item => item.value === selectedTextStyle.value)?.className ?? 'text-style-clean')
const previewExportRef = ref<HTMLElement | null>(null)

const previewStyle = computed(() => ({
  '--cv-sidebar': activeTheme.value.sidebar,
  '--cv-accent': activeTheme.value.accent,
  '--cv-page': activeTheme.value.page,
}))

async function buildResumePdfBlob() {
  if (!previewExportRef.value || !import.meta.client) return ''
  const stylesheetContent = Array.from(document.querySelectorAll('style,link[rel="stylesheet"]'))
    .map(node => node.outerHTML)
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
  const printWindow = window.open('', '_blank', 'noopener,noreferrer')
  if (!printWindow) return

  printWindow.document.open()
  printWindow.document.write(printMarkup)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 300)
}

function applyGeneratedResumePayload(payload: Partial<ResumeModel>) {
  if (typeof payload.role === 'string') resume.role = payload.role
  if (typeof payload.firstName === 'string') resume.firstName = payload.firstName
  if (typeof payload.lastName === 'string') resume.lastName = payload.lastName
  if (typeof payload.email === 'string') resume.email = payload.email
  if (typeof payload.phone === 'string') resume.phone = payload.phone
  if (typeof payload.city === 'string') resume.city = payload.city
  if (typeof payload.country === 'string') resume.country = payload.country
  if (typeof payload.profile === 'string') resume.profile = payload.profile
  if (typeof payload.photoUrl === 'string') resume.photoUrl = payload.photoUrl

  if (Array.isArray(payload.skills)) resume.skills = payload.skills
  if (Array.isArray(payload.languages)) resume.languages = payload.languages
  if (Array.isArray(payload.hobbies)) resume.hobbies = payload.hobbies
  if (Array.isArray(payload.experiences)) resume.experiences = payload.experiences
  if (Array.isArray(payload.education)) resume.education = payload.education
  if (Array.isArray(payload.references)) resume.references = payload.references
  if (Array.isArray(payload.courses)) resume.courses = payload.courses
  if (Array.isArray(payload.projects)) resume.projects = payload.projects
}

async function runAiCreate() {
  if (!aiProfilePrompt.value.trim()) {
    aiActionError.value = 'Please provide a short summary before running AI.'
    return
  }

  aiCreateLoading.value = true
  aiActionError.value = ''

  try {
    const response = await $fetch<{ choices?: Array<{ message?: { content?: string | null } }> }>('/api/ai-gateway/chat', {
      method: 'POST',
      body: {
        temperature: 0.3,
        response_format: {
          type: 'json_object',
        },
        messages: [
          {
            role: 'system',
            content: 'You are a resume assistant. Return strict JSON only with this exact shape: {"resume": {"role": string, "firstName": string, "lastName": string, "email": string, "phone": string, "city": string, "country": string, "profile": string, "photoUrl": string, "skills": [{"name": string, "level": number}], "languages": [{"name": string, "level": number}], "hobbies": string[], "experiences": [{"role": string, "company": string, "city": string, "start": string, "end": string, "bullets": string[]}], "education": [{"degree": string, "school": string, "city": string, "start": string, "end": string, "note": string}], "references": [{"name": string, "company": string, "email": string, "phone": string}], "courses": [{"title": string, "school": string, "start": string, "end": string}], "projects": [{"name": string, "summary": string}] }}',
          },
          {
            role: 'user',
            content: `Language: ${locale.value}. Template: ${selectedTemplate.value}. User summary: ${aiProfilePrompt.value}. Current resume draft: ${JSON.stringify(resume)}. Generate a complete and coherent resume in the requested language.`,
          },
        ],
      },
    })

    const content = response.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('Empty AI response')
    }
    const parsed = JSON.parse(content) as { resume?: Partial<ResumeModel> }
    applyGeneratedResumePayload(parsed.resume ?? {})
    aiCreateModalOpen.value = false
  } catch (error) {
    aiActionError.value = error instanceof Error ? error.message : 'Unable to generate resume with AI.'
  } finally {
    aiCreateLoading.value = false
  }
}

async function runAiReview() {
  aiReviewLoading.value = true
  aiActionError.value = ''
  aiReviewContent.value = ''

  try {
    const response = await $fetch<{ choices?: Array<{ message?: { content?: string | null } }> }>('/api/ai-gateway/chat', {
      method: 'POST',
      body: {
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: 'You are a senior resume reviewer. Return detailed feedback in plain text with these sections: 1) Detected errors, 2) Suggested improvements, 3) Rewritten examples, 4) Priority actions.',
          },
          {
            role: 'user',
            content: `Review this resume in language "${locale.value}" and adapt recommendations for template "${selectedTemplate.value}". Resume JSON: ${JSON.stringify(resume)}.`,
          },
        ],
      },
    })

    aiReviewContent.value = String(response.choices?.[0]?.message?.content || '').trim()
    if (!aiReviewContent.value) {
      throw new Error('Empty AI review response')
    }
    aiReviewModalOpen.value = true
  } catch (error) {
    aiActionError.value = error instanceof Error ? error.message : 'Unable to review resume with AI.'
  } finally {
    aiReviewLoading.value = false
  }
}

const showRightDrawerDesktop = useState('show-right-drawer-desktop', () => false)
const showRightDrawerMobile = useState('show-right-drawer-mobile', () => false)
const previousDesktopRightDrawer = showRightDrawerDesktop.value
const previousMobileRightDrawer = showRightDrawerMobile.value

showRightDrawerDesktop.value = false
showRightDrawerMobile.value = false

onUnmounted(() => {
  showRightDrawerDesktop.value = previousDesktopRightDrawer
  showRightDrawerMobile.value = previousMobileRightDrawer
})
</script>

<template>
  <v-container fluid class="resume-create pa-0">
    <client-only>
      <teleport to="#app-bar">
        <v-btn color="primary" class="mx-2" size="small" icon="mdi-content-save-outline" />
        <v-btn color="secondary" class="mx-2" size="small" variant="outlined" icon="mdi-file-pdf-box" @click="openPdfPreview" />
        <v-btn color="info" class="mx-2" size="small" variant="outlined" icon="mdi-download" @click="downloadPdf" />
        <v-menu v-model="aiMenuOpen" :close-on-content-click="false" location="bottom end">
          <template #activator="{ props }">
            <v-btn color="deep-purple" class="mx-2" size="small" variant="tonal" prepend-icon="mdi-creation" v-bind="props">
              KI
            </v-btn>
          </template>
          <v-card width="420" class="pa-3">
            <div class="ki-menu-grid">
              <v-card variant="outlined" class="ki-card" @click="aiCreateModalOpen = true; aiMenuOpen = false">
                <v-card-title class="text-subtitle-1">Create with KI</v-card-title>
                <v-card-text class="text-body-2">
                  Generate a complete resume from a short summary of studies and skills.
                </v-card-text>
              </v-card>
              <v-card variant="outlined" class="ki-card" @click="runAiReview(); aiMenuOpen = false">
                <v-card-title class="text-subtitle-1">Review</v-card-title>
                <v-card-text class="text-body-2">
                  Ask KI to detect errors and suggest improvements for your current resume.
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
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="edit">
            <article class="form-section mb-2">
              <div class="mb-2">
                <div class="photo-uploader">
                  <v-avatar size="72" rounded="lg">
                    <v-img :src="resume.photoUrl || '/img/default_avatar.svg'" cover />
                  </v-avatar>
                  <div class="photo-actions">
                    <v-btn size="small" prepend-icon="mdi-upload" variant="tonal" @click="openPhotoPicker">
                      Upload photo
                    </v-btn>
                    <v-btn size="small" prepend-icon="mdi-delete-outline" variant="text" color="error" @click="clearPhoto">
                      Remove
                    </v-btn>
                    <input ref="uploadInput" type="file" accept="image/*" class="d-none" @change="onPhotoSelected">
                  </div>
                </div>
              </div>
              <div class="grid-2 py-3">
                <v-text-field v-model="resume.role" label="Job target" flat hide-details />
                <v-text-field v-model="resume.firstName" label="First name" flat hide-details />
                <v-text-field v-model="resume.lastName" label="Last name" flat hide-details />
                <v-text-field v-model="resume.email" label="Email"  flat hide-details />
                <v-text-field v-model="resume.phone" label="Phone" flat hide-details />
                <v-text-field v-model="resume.city" label="City"  flat hide-details />
                <v-text-field v-model="resume.country" label="Country" flat hide-details />
              </div>
            </article>

            <article class="form-section mb-4">
              <header class="mb-4">
                <h2>Professional summary</h2>
              </header>
              <v-textarea v-model="resume.profile" label="Summary" rows="8" flat hide-details />
            </article>

            <article class="form-section mb-4">
              <header class="mb-4 d-flex align-center justify-space-between ga-3 flex-wrap">
                <div>
                  <h2>Experiences</h2>
                </div>
                <v-btn prepend-icon="mdi-plus" variant="outlined" size="small" @click="addExperience">Add</v-btn>
              </header>
              <v-row v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`" >
                <v-col cols="12" md="6"><v-text-field v-model="experience.role" label="Role" variant="outlined" hide-details /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="experience.company" label="Company" variant="outlined" hide-details /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="experience.city" label="City" variant="outlined" hide-details /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="experience.start" label="Start" variant="outlined" hide-details /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="experience.end" label="End" variant="outlined" hide-details /></v-col>
                <v-col cols="12" md="10">
                  <v-textarea
                    :model-value="getExperienceBullets(index)"
                    label="Bullets (1 line = 1 bullet)"
                    rows="8"
                    variant="outlined"
                    hide-details
                    @update:model-value="value => setExperienceBullets(index, String(value))"
                  />
                </v-col>
                <v-col cols="12" md="2" class="d-flex align-center">
                  <div class="d-flex flex-column ga-1">
                    <v-btn icon="mdi-chevron-up" variant="text" size="x-small" :disabled="index === 0" @click="moveExperience(index, 'up')" />
                    <v-btn icon="mdi-chevron-down" variant="text" size="x-small" :disabled="index === resume.experiences.length - 1" @click="moveExperience(index, 'down')" />
                    <v-btn icon="mdi-delete-outline" color="error" variant="text" size="small" @click="removeExperience(index)" />
                  </div>
                </v-col>
              </v-row>

            </article>

            <article class="form-section mb-4">
              <header class="mb-4 d-flex align-center justify-space-between ga-3 flex-wrap">
                <div>
                  <h2>Education</h2>
                </div>
                <v-btn prepend-icon="mdi-plus" variant="outlined" size="small" @click="addEducation">Add</v-btn>
              </header>
              <v-row v-for="(item, index) in resume.education" :key="`${item.school}-${index}`">
                <v-col cols="12" md="6"><v-text-field v-model="item.degree" label="Degree" variant="outlined" hide-details /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="item.school" label="School" variant="outlined" hide-details /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="item.city" label="City" variant="outlined" hide-details /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="item.start" label="Start" variant="outlined" hide-details /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="item.end" label="End" variant="outlined" hide-details /></v-col>
                <v-col cols="12" md="10"><v-textarea v-model="item.note" label="Note" rows="8" variant="outlined" hide-details /></v-col>
                <v-col cols="12" md="2" class="d-flex align-center">
                  <div class="d-flex flex-column ga-1">
                    <v-btn icon="mdi-chevron-up" variant="text" size="x-small" :disabled="index === 0" @click="moveEducation(index, 'up')" />
                    <v-btn icon="mdi-chevron-down" variant="text" size="x-small" :disabled="index === resume.education.length - 1" @click="moveEducation(index, 'down')" />
                    <v-btn icon="mdi-delete-outline" color="error" variant="text" size="small" @click="removeEducation(index)" />
                  </div>
                </v-col>
              </v-row>

            </article>

            <article class="form-section mb-4">
              <header class="mb-4">
                <h2>Skills & Languages</h2>
              </header>
              <div>
                <div class="d-flex align-center justify-space-between my-4">
                  <v-chip color="primary">Skills</v-chip>
                  <v-btn size="small" variant="outlined" prepend-icon="mdi-plus" @click="addSkill">Add</v-btn>
                </div>
                <div>
                  <v-row v-for="(skill, index) in resume.skills" :key="`skill-${index}`" class="mb-2">
                    <v-col cols="5"><v-text-field v-model="skill.name" label="Skill" variant="outlined" hide-details /></v-col>
                    <v-col cols="5"><v-slider v-model="skill.level" min="0" max="100" step="5" thumb-label color="primary" hide-details /></v-col>
                    <v-col cols="2" class="d-flex align-center justify-center">
                      <v-btn icon="mdi-delete-outline" size="x-small" color="error" variant="text" @click="removeSkill(index)" />
                    </v-col>
                  </v-row>
                </div>
              </div>

              <div class="my-3">
                <div class="d-flex align-center justify-space-between my-4">
                  <v-chip color="primary"> Languages</v-chip>
                  <v-btn size="small" variant="outlined" prepend-icon="mdi-plus" @click="addLanguage">Add</v-btn>
                </div>
                <div>
                  <v-row v-for="(language, index) in resume.languages" :key="`language-${index}`" class="mb-2">
                    <v-col cols="5"><v-text-field v-model="language.name" label="Language" variant="outlined" hide-details /></v-col>
                    <v-col cols="5"><v-slider v-model="language.level" min="0" max="100" step="5" thumb-label color="primary" hide-details /></v-col>
                    <v-col cols="2" class="d-flex align-center justify-center">
                      <v-btn icon="mdi-delete-outline" size="x-small" color="error" variant="text" @click="removeLanguage(index)" />
                    </v-col>
                  </v-row>
                </div>
              </div>
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
                  :class="{ 'template-card--active': selectedTemplate === template.id }"
                  variant="outlined"
                  @click="selectedTemplate = template.id"
                >
                  <v-img :src="template.image" height="120" cover />
                  <v-card-text>
                    <strong>{{ template.title }}</strong>
                    <div class="template-tags">
                      <v-chip v-if="template.isAts" size="x-small" color="primary" variant="tonal">ATS</v-chip>
                      <v-chip v-if="template.hasDocx" size="x-small" color="warning" variant="tonal">DOCX</v-chip>
                      <v-chip v-if="template.hasPhoto" size="x-small" variant="outlined">Photo</v-chip>
                      <v-chip v-if="template.isTwoColumn" size="x-small" variant="outlined">2 cols</v-chip>
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
                <p>Choisis les couleurs et le rounded comme AppSettings.</p>
              </header>

              <p class="section-label">Color palette</p>
              <div class="palette-grid mb-4">
                <button
                  v-for="theme in colorThemes"
                  :key="theme.name"
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

              <p class="section-label">Rounded</p>
              <v-btn-toggle v-model="selectedRounded" mandatory divided class="rounded-toggle" color="primary">
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
        </v-window>
      </section>

      <aside class="builder-preview py-6 px-5 px-md-8">
        <div ref="previewExportRef" class="preview-grid" :class="[activeRoundedClass, activeTextStyleClass]" :style="previewStyle">
          <component :is="selectedTemplateComponent" :resume="resume" :show-photo="templateSupportsPhoto" :use-timeline="templateUsesTimeline" editable />
        </div>
      </aside>
    </div>

    <v-dialog v-model="pdfModalOpen" width="900">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Design Preview</span>
          <v-btn icon="mdi-close" variant="text" @click="pdfModalOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4 preview-modal-body">
          <div class="preview-grid" :class="[activeRoundedClass, activeTextStyleClass]" :style="previewStyle">
            <component :is="selectedTemplateComponent" :resume="resume" :show-photo="templateSupportsPhoto" :use-timeline="templateUsesTimeline" editable />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="aiCreateModalOpen" max-width="720">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Create Resume with KI</span>
          <v-btn icon="mdi-close" variant="text" @click="aiCreateModalOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <p class="mb-3">
            Briefly describe what you studied and your main skills. KI will generate a full resume and apply it to the selected template.
          </p>
          <v-textarea
            v-model="aiProfilePrompt"
            label="Your studies and skills"
            rows="8"
            variant="outlined"
            placeholder="Example: I studied software engineering and I am skilled in Vue, TypeScript, SQL, and project management."
          />
          <v-alert v-if="aiActionError" type="error" variant="tonal" class="mt-2">
            {{ aiActionError }}
          </v-alert>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="aiCreateModalOpen = false">Cancel</v-btn>
          <v-btn color="primary" :loading="aiCreateLoading" prepend-icon="mdi-robot-outline" @click="runAiCreate">
            Run
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="aiReviewModalOpen" max-width="760">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>KI Review</span>
          <v-btn icon="mdi-close" variant="text" @click="aiReviewModalOpen = false" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-alert v-if="aiActionError" type="error" variant="tonal" class="mb-3">
            {{ aiActionError }}
          </v-alert>
          <v-progress-linear v-if="aiReviewLoading" indeterminate color="primary" class="mb-4" />
          <div v-else class="review-text">
            {{ aiReviewContent }}
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
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
  transition: box-shadow .2s ease;
}

.ki-card:hover {
  box-shadow: 0 8px 20px rgba(15, 23, 42, .15);
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
