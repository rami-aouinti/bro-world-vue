<script setup lang="ts">
import ResumeTemplateClassic from '~/components/Resume/Templates/ResumeTemplateClassic.vue'
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
  variant: 'classic' | 'modern' | 'professional' | 'traditional'
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

const activeTab = ref<'edit' | 'template' | 'design'>('edit')
const selectedTemplate = ref('classic')
const selectedTheme = ref('emerald')
const selectedRounded = ref<'none' | 'sm' | 'md' | 'lg'>('md')

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
  { id: 'classic', title: 'Classic', subtitle: 'Simple and readable format', image: '/img/cv/cv-4.png', hasPhoto: false, isTwoColumn: false, isAts: false, hasDocx: true, isCustomized: false, isFree: true, variant: 'classic' },
  { id: 'traditional', title: 'Traditional', subtitle: 'Formal and timeless structure', image: '/img/cv/cv-2.png', hasPhoto: false, isTwoColumn: false, isAts: false, hasDocx: true, isCustomized: false, isFree: true, variant: 'traditional' },
  { id: 'professional', title: 'Professional', subtitle: 'Sidebar profile with details', image: '/img/cv/cv-1.png', hasPhoto: true, isTwoColumn: true, isAts: false, hasDocx: true, isCustomized: true, isFree: true, variant: 'professional' },
  { id: 'prime-ats', title: 'Prime ATS', subtitle: 'Optimized for ATS screening', image: '/img/cv/cv-3.png', hasPhoto: true, isTwoColumn: false, isAts: true, hasDocx: true, isCustomized: false, isFree: true, variant: 'traditional' },
  { id: 'pure-ats', title: 'Pure ATS', subtitle: 'Minimal ATS-first template', image: '/img/cv/cv-4.png', hasPhoto: false, isTwoColumn: false, isAts: true, hasDocx: true, isCustomized: false, isFree: true, variant: 'traditional' },
  { id: 'specialist', title: 'Specialist', subtitle: 'Content-focused ATS style', image: '/img/cv/cv-2.png', hasPhoto: false, isTwoColumn: false, isAts: true, hasDocx: true, isCustomized: true, isFree: true, variant: 'traditional' },
  { id: 'clean', title: 'Clean', subtitle: 'Modern clean hierarchy', image: '/img/cv/cv-4.png', hasPhoto: false, isTwoColumn: true, isAts: false, hasDocx: false, isCustomized: true, isFree: true, variant: 'classic' },
  { id: 'simple-ats', title: 'Simple ATS', subtitle: 'Lightweight ATS-friendly', image: '/img/cv/cv-3.png', hasPhoto: false, isTwoColumn: false, isAts: true, hasDocx: true, isCustomized: false, isFree: true, variant: 'traditional' },
  { id: 'corporate', title: 'Corporate', subtitle: 'Business-centric classic style', image: '/img/cv/cv-2.png', hasPhoto: true, isTwoColumn: false, isAts: false, hasDocx: true, isCustomized: false, isFree: true, variant: 'traditional' },
  { id: 'clear', title: 'Clear', subtitle: 'Photo header and clean body', image: '/img/cv/cv-3.png', hasPhoto: true, isTwoColumn: true, isAts: false, hasDocx: true, isCustomized: true, isFree: true, variant: 'modern' },
  { id: 'precision-ats', title: 'Precision ATS', subtitle: 'Precise ATS structure', image: '/img/cv/cv-4.png', hasPhoto: false, isTwoColumn: false, isAts: true, hasDocx: true, isCustomized: false, isFree: true, variant: 'traditional' },
  { id: 'two-column-ats', title: 'Two column ATS', subtitle: 'Two-column ATS layout', image: '/img/cv/cv-1.png', hasPhoto: false, isTwoColumn: true, isAts: true, hasDocx: true, isCustomized: true, isFree: true, variant: 'professional' },
  { id: 'balanced', title: 'Balanced', subtitle: 'Balanced two-column design', image: '/img/cv/cv-1.png', hasPhoto: false, isTwoColumn: true, isAts: false, hasDocx: true, isCustomized: true, isFree: true, variant: 'professional' },
  { id: 'header-ats', title: 'Header ATS', subtitle: 'Header-focused ATS format', image: '/img/cv/cv-4.png', hasPhoto: false, isTwoColumn: false, isAts: true, hasDocx: true, isCustomized: false, isFree: true, variant: 'modern' },
  { id: 'essential', title: 'Essential', subtitle: 'Essential details with photo', image: '/img/cv/cv-3.png', hasPhoto: true, isTwoColumn: false, isAts: false, hasDocx: true, isCustomized: false, isFree: true, variant: 'modern' },
  { id: 'polished', title: 'Polished', subtitle: 'Polished recruiter-ready style', image: '/img/cv/cv-2.png', hasPhoto: true, isTwoColumn: false, isAts: false, hasDocx: false, isCustomized: true, isFree: true, variant: 'professional' },
]

const colorThemes: ColorTheme[] = [
  { name: 'emerald', sidebar: '#07564f', accent: '#0f766e', page: '#f8fafc' },
  { name: 'ocean', sidebar: '#0b3a78', accent: '#2563eb', page: '#eff6ff' },
  { name: 'plum', sidebar: '#4a1d5e', accent: '#9333ea', page: '#faf5ff' },
  { name: 'charcoal', sidebar: '#1f2937', accent: '#374151', page: '#f3f4f6' },
  { name: 'ruby', sidebar: '#7f1d1d', accent: '#dc2626', page: '#fff1f2' },
  { name: 'amber', sidebar: '#78350f', accent: '#d97706', page: '#fffbeb' },
]

const roundedOptions: RoundedOption[] = [
  { title: 'None', value: 'none', className: 'radius-none' },
  { title: 'Soft', value: 'sm', className: 'radius-sm' },
  { title: 'Default', value: 'md', className: 'radius-md' },
  { title: 'Large', value: 'lg', className: 'radius-lg' },
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
    classic: ResumeTemplateClassic,
    modern: ResumeTemplateModern,
    professional: ResumeTemplateProfessional,
    traditional: ResumeTemplateTraditional,
  } as const
  return componentByVariant[selectedTemplateConfig.value.variant]
})

const templateSupportsPhoto = computed(() => selectedTemplateConfig.value.hasPhoto)

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

function addEducation() {
  resume.education.push({ degree: '', school: '', city: '', start: '', end: '', note: '' })
}

function removeEducation(index: number) {
  if (resume.education.length === 1) return
  resume.education.splice(index, 1)
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

const previewStyle = computed(() => ({
  '--cv-sidebar': activeTheme.value.sidebar,
  '--cv-accent': activeTheme.value.accent,
  '--cv-page': activeTheme.value.page,
}))

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
    <div class="builder-layout">
      <section class="builder-form px-3 px-md-6 py-4">
        <div class="completion-card mb-4">
          <strong>100%</strong>
          <span>Resume completeness</span>
        </div>

        <v-tabs v-model="activeTab" color="primary" grow class="mb-4">
          <v-tab value="edit">Edit</v-tab>
          <v-tab value="template">Template</v-tab>
          <v-tab value="design">Design</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="edit">
            <article class="form-section mb-4">
              <header class="mb-4">
                <h2>Personal details</h2>
                <p>Renseigne les informations de base de ton profil comme dans le formulaire CV.</p>
              </header>
              <div class="mb-4">
                <p class="section-label mb-2">Photo</p>
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
                    <p class="text-caption text-medium-emphasis mb-0">Visible uniquement sur les templates avec photo.</p>
                  </div>
                </div>
              </div>
              <div class="grid-2">
                <v-text-field v-model="resume.role" label="Job target" variant="solo-filled" flat hide-details />
                <v-text-field v-model="resume.firstName" label="First name" variant="solo-filled" flat hide-details />
                <v-text-field v-model="resume.lastName" label="Last name" variant="solo-filled" flat hide-details />
                <v-text-field v-model="resume.email" label="Email" variant="solo-filled" flat hide-details />
                <v-text-field v-model="resume.phone" label="Phone" variant="solo-filled" flat hide-details />
                <v-text-field v-model="resume.city" label="City" variant="solo-filled" flat hide-details />
                <v-text-field v-model="resume.country" label="Country" variant="solo-filled" flat hide-details />
              </div>
            </article>

            <article class="form-section mb-4">
              <header class="mb-4">
                <h2>Professional summary</h2>
                <p>Décris ton impact, ta motivation et tes objectifs.</p>
              </header>
              <v-textarea v-model="resume.profile" label="Summary" rows="5" variant="solo-filled" flat hide-details />
            </article>

            <article class="form-section mb-4">
              <header class="mb-4 d-flex align-center justify-space-between ga-3 flex-wrap">
                <div>
                  <h2>Experiences</h2>
                  <p>Toutes les experiences clés du profil.</p>
                </div>
                <v-btn prepend-icon="mdi-plus" variant="tonal" size="small" @click="addExperience">Add line</v-btn>
              </header>
              <v-card v-for="(experience, index) in resume.experiences" :key="`${experience.company}-${index}`" variant="tonal" class="mb-3">
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="3"><v-text-field v-model="experience.role" label="Role" variant="outlined" hide-details /></v-col>
                    <v-col cols="12" md="3"><v-text-field v-model="experience.company" label="Company" variant="outlined" hide-details /></v-col>
                    <v-col cols="12" md="2"><v-text-field v-model="experience.city" label="City" variant="outlined" hide-details /></v-col>
                    <v-col cols="12" md="2"><v-text-field v-model="experience.start" label="Start" variant="outlined" hide-details /></v-col>
                    <v-col cols="12" md="2"><v-text-field v-model="experience.end" label="End" variant="outlined" hide-details /></v-col>
                    <v-col cols="12" md="11">
                      <v-textarea
                        :model-value="getExperienceBullets(index)"
                        label="Bullets (1 line = 1 bullet)"
                        rows="3"
                        variant="outlined"
                        hide-details
                        @update:model-value="value => setExperienceBullets(index, String(value))"
                      />
                    </v-col>
                    <v-col cols="12" md="1" class="d-flex align-center">
                      <v-btn icon="mdi-delete-outline" color="error" variant="text" size="small" @click="removeExperience(index)" />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </article>

            <article class="form-section mb-4">
              <header class="mb-4 d-flex align-center justify-space-between ga-3 flex-wrap">
                <div>
                  <h2>Education</h2>
                  <p>Ajoute tes diplômes et formations.</p>
                </div>
                <v-btn prepend-icon="mdi-plus" variant="tonal" size="small" @click="addEducation">Add line</v-btn>
              </header>
              <v-card v-for="(item, index) in resume.education" :key="`${item.school}-${index}`" variant="tonal" class="mb-3">
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="4"><v-text-field v-model="item.degree" label="Degree" variant="outlined" hide-details /></v-col>
                    <v-col cols="12" md="4"><v-text-field v-model="item.school" label="School" variant="outlined" hide-details /></v-col>
                    <v-col cols="12" md="2"><v-text-field v-model="item.city" label="City" variant="outlined" hide-details /></v-col>
                    <v-col cols="12" md="1"><v-text-field v-model="item.start" label="Start" variant="outlined" hide-details /></v-col>
                    <v-col cols="12" md="1"><v-text-field v-model="item.end" label="End" variant="outlined" hide-details /></v-col>
                    <v-col cols="12" md="11"><v-text-field v-model="item.note" label="Note" variant="outlined" hide-details /></v-col>
                    <v-col cols="12" md="1" class="d-flex align-center">
                      <v-btn icon="mdi-delete-outline" color="error" variant="text" size="small" @click="removeEducation(index)" />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </article>

            <article class="form-section mb-4">
              <header class="mb-4">
                <h2>Skills & Languages</h2>
                <p>Inspiré du modal profil : ajoute/supprime facilement chaque ligne.</p>
              </header>
              <div class="grid-2">
                <v-card variant="tonal">
                  <v-card-title class="d-flex align-center justify-space-between">
                    Skills
                    <v-btn size="x-small" variant="tonal" prepend-icon="mdi-plus" @click="addSkill">Add</v-btn>
                  </v-card-title>
                  <v-card-text>
                    <v-row v-for="(skill, index) in resume.skills" :key="`skill-${index}`" class="mb-2">
                      <v-col cols="7"><v-text-field v-model="skill.name" label="Skill" variant="outlined" hide-details /></v-col>
                      <v-col cols="4"><v-slider v-model="skill.level" min="0" max="100" step="5" thumb-label color="primary" hide-details /></v-col>
                      <v-col cols="1" class="d-flex align-center justify-center">
                        <v-btn icon="mdi-delete-outline" size="x-small" color="error" variant="text" @click="removeSkill(index)" />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>

                <v-card variant="tonal">
                  <v-card-title class="d-flex align-center justify-space-between">
                    Languages
                    <v-btn size="x-small" variant="tonal" prepend-icon="mdi-plus" @click="addLanguage">Add</v-btn>
                  </v-card-title>
                  <v-card-text>
                    <v-row v-for="(language, index) in resume.languages" :key="`language-${index}`" class="mb-2">
                      <v-col cols="7"><v-text-field v-model="language.name" label="Language" variant="outlined" hide-details /></v-col>
                      <v-col cols="4"><v-slider v-model="language.level" min="0" max="100" step="5" thumb-label color="primary" hide-details /></v-col>
                      <v-col cols="1" class="d-flex align-center justify-center">
                        <v-btn icon="mdi-delete-outline" size="x-small" color="error" variant="text" @click="removeLanguage(index)" />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </div>
            </article>
          </v-window-item>

          <v-window-item value="template">
            <article class="form-section mb-4">
              <header class="mb-4">
                <h2>Template</h2>
                <p>Choisis un template et filtre rapidement selon tes besoins.</p>
              </header>
              <div class="template-filters mb-4">
                <v-btn
                  v-for="filter in templateFilters"
                  :key="filter.value"
                  :variant="selectedTemplateFilter === filter.value ? 'flat' : 'outlined'"
                  :color="selectedTemplateFilter === filter.value ? 'primary' : undefined"
                  class="template-filter"
                  rounded="pill"
                  @click="selectedTemplateFilter = filter.value"
                >
                  {{ filter.label }}
                </v-btn>
              </div>

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
                    <p class="mb-2">{{ template.subtitle }}</p>
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
            </article>
          </v-window-item>
        </v-window>
      </section>

      <aside class="builder-preview py-6 px-5 px-md-8">
        <div class="preview-grid" :class="activeRoundedClass" :style="previewStyle">
          <component :is="selectedTemplateComponent" :resume="resume" :show-photo="templateSupportsPhoto" />
        </div>
      </aside>
    </div>
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
}

.completion-card {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #c3dbc9;
  border-radius: 12px;
  padding: 14px;
}

.form-section {
  border-radius: 14px;
  padding: 18px;
  border: 1px solid #e3e7f2;
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
  border: 1px dashed #ccd7eb;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
}

.compact-list {
  padding-left: 16px;
  margin: 0;
}

.template-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.template-filter {
  text-transform: none;
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

.section-label {
  font-weight: 700;
  margin-bottom: 8px;
  color: #1f2a44;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.palette-item {
  border: 1px solid #d4def2;
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
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: calc(100vh - 80px);
  background: var(--cv-page);
  border-radius: 14px;
  overflow: hidden;
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

@media (max-width: 1120px) {
  .builder-layout,
  .preview-grid {
    grid-template-columns: 1fr;
  }

  .builder-form {
    border-right: 0;
  }
}

@media (max-width: 760px) {
  .grid-2,
  .template-grid,
  .palette-grid {
    grid-template-columns: 1fr;
  }
}
</style>
