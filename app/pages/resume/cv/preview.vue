<script setup lang="ts">
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-20-resume.json'
import CvLayoutAside from '~/components/cv/layouts/CvLayoutAside.vue'
import CvLayoutNoAside from '~/components/cv/layouts/CvLayoutNoAside.vue'
import CvLayoutAsideLeft from '~/components/cv/layouts/CvLayoutAsideLeft.vue'
import CvLayoutAsideRight from '~/components/cv/layouts/CvLayoutAsideRight.vue'
import CvLayoutAsideFullLeft from '~/components/cv/layouts/CvLayoutAsideFullLeft.vue'
import CvLayoutAsideFullRight from '~/components/cv/layouts/CvLayoutAsideFullRight.vue'
import CvLayoutAsideBarLeft from '~/components/cv/layouts/CvLayoutAsideBarLeft.vue'
import CvLayoutAsideBarRight from '~/components/cv/layouts/CvLayoutAsideBarRight.vue'
import { listMyResumes, type ResumeApiItem } from '~/services/resumeApi'

import ProfileClassic from '~/components/cv/sections/ProfileClassic.vue'
import ExperienceClassic from '~/components/cv/sections/ExperienceClassic.vue'
import ExperienceList from '~/components/cv/sections/ExperienceList.vue'
import ExperienceDot from '~/components/cv/sections/ExperienceDot.vue'
import ExperienceTimeline from '~/components/cv/sections/ExperienceTimeline.vue'
import ExperienceCards from '~/components/cv/sections/ExperienceCards.vue'
import EducationClassic from '~/components/cv/sections/EducationClassic.vue'
import EducationList from '~/components/cv/sections/EducationList.vue'
import EducationDot from '~/components/cv/sections/EducationDot.vue'
import EducationTimeline from '~/components/cv/sections/EducationTimeline.vue'
import EducationCards from '~/components/cv/sections/EducationCards.vue'
import ProjectsClassic from '~/components/cv/sections/ProjectsClassic.vue'
import ProjectsList from '~/components/cv/sections/ProjectsList.vue'
import ProjectsDot from '~/components/cv/sections/ProjectsDot.vue'
import ProjectsCards from '~/components/cv/sections/ProjectsCards.vue'
import SkillsClassic from '~/components/cv/sections/SkillsClassic.vue'
import SkillsStars from '~/components/cv/sections/SkillsStars.vue'
import SkillsDots from '~/components/cv/sections/SkillsDots.vue'
import SkillsProgressLine from '~/components/cv/sections/SkillsProgressLine.vue'
import SkillsProgressCircle from '~/components/cv/sections/SkillsProgressCircle.vue'

import LanguagesClassic from '~/components/cv/sections/LanguagesClassic.vue'
import LanguagesStars from '~/components/cv/sections/LanguagesStars.vue'
import LanguagesDots from '~/components/cv/sections/LanguagesDots.vue'
import LanguagesProgressLine from '~/components/cv/sections/LanguagesProgressLine.vue'
import LanguagesProgressCircle from '~/components/cv/sections/LanguagesProgressCircle.vue'
import CertificationsClassic from '~/components/cv/sections/CertificationsClassic.vue'
import CertificationsList from '~/components/cv/sections/CertificationsList.vue'
import CertificationsDot from '~/components/cv/sections/CertificationsDot.vue'
import CertificationsCards from '~/components/cv/sections/CertificationsCards.vue'
import ReferencesClassic from '~/components/cv/sections/ReferencesClassic.vue'
import ReferencesList from '~/components/cv/sections/ReferencesList.vue'
import ReferencesDot from '~/components/cv/sections/ReferencesDot.vue'
import ReferencesCards from '~/components/cv/sections/ReferencesCards.vue'
import HobbiesClassic from '~/components/cv/sections/HobbiesClassic.vue'
import HobbiesList from '~/components/cv/sections/HobbiesList.vue'
import HobbiesDot from '~/components/cv/sections/HobbiesDot.vue'
import HobbiesCards from '~/components/cv/sections/HobbiesCards.vue'

definePageMeta({
  title: 'Resume · CV Preview',
  layout: 'resume',
})

const route = useRoute()
const { loggedIn } = useUserSession()
const myResumes = ref<ResumeApiItem[]>([])
const selectedTemplate = ref(GENERATED_RESUME_TEMPLATES[0]?.id || 'tpl-001')
const layoutMenuOpen = ref(false)

const activeTemplate = computed(() =>
  GENERATED_RESUME_TEMPLATES.find((template) => template.id === selectedTemplate.value) || GENERATED_RESUME_TEMPLATES[0],
)

const cvLayoutComponentMap = {
  aside: CvLayoutAside,
  'no-aside': CvLayoutNoAside,
  'aside-left': CvLayoutAsideLeft,
  'aside-right': CvLayoutAsideRight,
  'aside-full-left': CvLayoutAsideFullLeft,
  'aside-full-right': CvLayoutAsideFullRight,
  'aside-bar-left': CvLayoutAsideBarLeft,
  'aside-bar-right': CvLayoutAsideBarRight,
} as const

const activeLayoutComponent = computed(() => cvLayoutComponentMap[activeTemplate.value?.layout as keyof typeof cvLayoutComponentMap] || CvLayoutNoAside)

const structureOneSections = ['Profile', 'Experience', 'Education', 'Skills', 'Projects', 'Languages', 'Certification', 'References', 'Hobby']
const structureTwoTopSections = ['Profile', 'Experience', 'Education']
const structureTwoLeftSections = ['Skills']
const structureTwoRightSections = ['Projects', 'Languages', 'Certification', 'References', 'Hobby']
const isMainStructureLayout = computed(() => ['aside', 'no-aside'].includes(String(activeTemplate.value?.layout || '')))

const structureAsideOneSections = ['Profile', 'Skills', 'Languages', 'Certification', 'References', 'Hobby']
const structureAsideTwoSections = ['Profile', 'Languages', 'Certifications', 'References', 'Hobby']
const structureContentBaseSections = ['Experience', 'Education', 'Projects']
const isSideContentLayout = computed(() => ['aside-left', 'aside-right', 'aside-full-left', 'aside-full-right', 'aside-bar-left', 'aside-bar-right'].includes(String(activeTemplate.value?.layout || '')))

const sectionOrders = reactive<Record<string, string[]>>({
  asideOne: [...structureAsideOneSections],
  asideTwo: [...structureAsideTwoSections],
  contentBase: [...structureContentBaseSections],
  contentStructure2: [...structureContentBaseSections, 'Skills'],
  mainOne: [...structureOneSections],
  mainTwoTop: [...structureTwoTopSections],
  mainTwoLeft: [...structureTwoLeftSections],
  mainTwoRight: [...structureTwoRightSections],
})

function orderedSections(orderKey: keyof typeof sectionOrders, fallback: string[]) {
  const order = sectionOrders[orderKey] || []
  const known = new Set(order)
  return [...order, ...fallback.filter(item => !known.has(item))]
}

function visibleOrderedSections(orderKey: keyof typeof sectionOrders, fallback: string[], zoneKey?: keyof typeof sectionOrders) {
  return orderedSections(orderKey, fallback).filter((section) => {
    const normalized = toSectionKey(section)
    const visible = isSectionVisible(normalized)
    if (!visible) return false
    if (!zoneKey) return true
    return isSectionVisibleInZone(zoneKey, normalized)
  })
}

const CV_PREVIEW_PDF_PAGE_HEIGHT = 1100
const cvPreviewRef = ref<HTMLElement | null>(null)
const cvPreviewPageCount = ref(1)
let cvPreviewMeasureTimer: ReturnType<typeof setTimeout> | undefined
let cvPreviewResizeObserver: ResizeObserver | undefined

const cvPreviewHeight = computed(
  () => cvPreviewPageCount.value * CV_PREVIEW_PDF_PAGE_HEIGHT,
)

const cvPreviewPageBreaks = computed(() =>
  Array.from({ length: Math.max(0, cvPreviewPageCount.value - 1) }, (_, index) => index + 1),
)

function measureCvPreviewHeight() {
  if (!import.meta.client) return
  const preview = cvPreviewRef.value?.querySelector<HTMLElement>('.cv-preview-page')
  if (!preview) return

  const neededHeight = Math.max(
    CV_PREVIEW_PDF_PAGE_HEIGHT,
    preview.scrollHeight,
    Math.ceil(preview.getBoundingClientRect().height),
  )
  cvPreviewPageCount.value = Math.max(
    1,
    Math.ceil(neededHeight / CV_PREVIEW_PDF_PAGE_HEIGHT),
  )
}

function scheduleCvPreviewMeasure(reset = false) {
  if (!import.meta.client) return
  if (reset) cvPreviewPageCount.value = 1
  if (cvPreviewMeasureTimer) window.clearTimeout(cvPreviewMeasureTimer)
  cvPreviewMeasureTimer = window.setTimeout(() => {
    cvPreviewMeasureTimer = undefined
    measureCvPreviewHeight()
  }, 80)
}

const dragSection = ref<string>('')
const dragOrderKey = ref<keyof typeof sectionOrders | ''>('')

function onSectionDragStart(orderKey: keyof typeof sectionOrders, section: string) {
  dragOrderKey.value = orderKey
  dragSection.value = section
}

function onSectionDrop(orderKey: keyof typeof sectionOrders, targetSection: string) {
  if (!dragSection.value || dragOrderKey.value !== orderKey) return
  const order = sectionOrders[orderKey]
  if (!order) return
  const from = order.indexOf(dragSection.value)
  const to = order.indexOf(targetSection)
  if (from === -1 || to === -1 || from === to) return
  const next = [...order]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  sectionOrders[orderKey] = next
}

function onSectionDragEnd() {
  dragSection.value = ''
  dragOrderKey.value = ''
}

function moveSection(orderKey: keyof typeof sectionOrders, section: string) {
  const order = sectionOrders[orderKey]
  if (!order) return
  const idx = order.indexOf(section)
  if (idx === -1 || order.length <= 1) return
  const next = idx === order.length - 1 ? 0 : idx + 1
  const swapped = [...order]
  const [item] = swapped.splice(idx, 1)
  swapped.splice(next, 0, item)
  sectionOrders[orderKey] = swapped
}

const sectionVariantMap = computed(() => {
  const sections = (activeTemplate.value as any)?.sections || {}
  return {
    profile: sections.profile || 'classic',
    experience: sections.experience || 'classic',
    education: sections.education || 'classic',
    skills: sections.skills || 'classic',
    projects: sections.projects || 'classic',
    languages: sections.languages || 'classic',
    certification: sections.certifications || 'classic',
    references: sections.references || 'classic',
    hobby: sections.interests || 'classic',
  }
})

const headerType = computed(() => String(activeTemplate.value?.headerType || 'header-left'))

const templateFakeData = computed(() => ((activeTemplate.value as any)?.fakeData || {}))
const userResumeData = computed<any>(() => myResumes.value[0] || null)
const fakeData = computed(() => userResumeData.value || templateFakeData.value)
const sectionType = (key: keyof ReturnType<typeof sectionVariantMap['value']>) => sectionVariantMap.value[key] || 'classic'

function normalizeSectionKey(raw: string) {
  const key = raw.toLowerCase()
  if (key === 'certification') return 'certifications'
  if (key === 'hobby') return 'hobbies'
  return key
}


const sectionComponentMap: Record<string, any> = {
  profile: { classic: ProfileClassic },
  experience: { classic: ExperienceClassic, list: ExperienceList, dot: ExperienceDot, timeline: ExperienceTimeline, cards: ExperienceCards },
  education: { classic: EducationClassic, list: EducationList, dot: EducationDot, timeline: EducationTimeline, cards: EducationCards },
  projects: { classic: ProjectsClassic, list: ProjectsList, dot: ProjectsDot, cards: ProjectsCards },
  skills: { classic: SkillsClassic, stars: SkillsStars, dots: SkillsDots, 'progress-line': SkillsProgressLine, 'progress-circle': SkillsProgressCircle },
  languages: { classic: LanguagesClassic, stars: LanguagesStars, dots: LanguagesDots, 'progress-line': LanguagesProgressLine, 'progress-circle': LanguagesProgressCircle },
  certifications: { classic: CertificationsClassic, list: CertificationsList, dot: CertificationsDot, cards: CertificationsCards },
  references: { classic: ReferencesClassic, list: ReferencesList, dot: ReferencesDot, cards: ReferencesCards },
  hobbies: { classic: HobbiesClassic, list: HobbiesList, dot: HobbiesDot, cards: HobbiesCards },
}
function resolveSectionComponent(section: string, type: string) {
  return sectionComponentMap[section]?.[type] || sectionComponentMap[section]?.classic || 'div'
}

const sectionTypeOverrides = reactive<Record<string, string>>({})


const hiddenSections = reactive<Record<string, boolean>>({})
const sectionExtraItems = reactive<Record<string, any[]>>({})
const languageOption = ref<any | null>(null)
const languageStars = ref(3)
const languageCatalog = [
  { title: "🇫🇷 Français", name: "Français", countryCode: "FR", flag: "🇫🇷" },
  { title: "🇬🇧 English", name: "English", countryCode: "GB", flag: "🇬🇧" },
  { title: "🇩🇪 Deutsch", name: "Deutsch", countryCode: "DE", flag: "🇩🇪" },
  { title: "🇪🇸 Español", name: "Español", countryCode: "ES", flag: "🇪🇸" },
  { title: "🇮🇹 Italiano", name: "Italiano", countryCode: "IT", flag: "🇮🇹" }
]
const sectionModalOpen = ref(false)
const sectionModalKey = ref('')
const sectionModalValue = ref('')
const sectionModalTitle = ref('')
const sectionModalDescription = ref('')
const sectionModalFiles = ref<File[]>([])
const sectionModalCompany = ref('')
const sectionModalSchool = ref('')
const sectionModalLocation = ref('')
const sectionModalHomePage = ref('')
const sectionModalStartDate = ref('')
const sectionModalEndDate = ref('')
const sectionModalSkillName = ref('')
const sectionModalSkillStars = ref(5)

function hideSection(section: string) { hiddenSections[normalizeSectionKey(section)] = true }
function addSectionItem(section: string) {
  sectionModalKey.value = section
  sectionModalValue.value = ''
  sectionModalOpen.value = true
  languageOption.value = null
  languageStars.value = 3
  sectionModalTitle.value = ''
  sectionModalDescription.value = ''
  sectionModalFiles.value = []
  sectionModalCompany.value = ''
  sectionModalSchool.value = ''
  sectionModalLocation.value = ''
  sectionModalHomePage.value = ''
  sectionModalStartDate.value = ''
  sectionModalEndDate.value = ''
  sectionModalSkillName.value = ''
  sectionModalSkillStars.value = 5
}
function confirmAddSectionItem() {
  const key = sectionModalKey.value
  if (!key) return
  if (key === 'languages') {
    if (!languageOption.value) return
    sectionExtraItems[key] = [...(sectionExtraItems[key] || []), {
      name: languageOption.value.name,
      level: Number(languageStars.value) * 20,
      countryCode: languageOption.value.countryCode,
      flag: languageOption.value.flag,
    }]

  } else if (key === 'certifications') {
    const title = sectionModalTitle.value.trim()
    if (!title) return
    sectionExtraItems[key] = [...(sectionExtraItems[key] || []), {
      title,
      description: sectionModalDescription.value.trim(),
      attachments: sectionModalFiles.value.map((f: any) => ({ name: f?.name || 'file' })),
    }]
  } else if (key === 'references') {
    const title = sectionModalTitle.value.trim()
    if (!title) return
    sectionExtraItems[key] = [...(sectionExtraItems[key] || []), {
      title,
      description: sectionModalDescription.value.trim(),
    }]
  } else if (key === 'experience') {
    const title = sectionModalTitle.value.trim()
    const company = sectionModalCompany.value.trim()
    if (!title || !company) return
    sectionExtraItems[key] = [...(sectionExtraItems[key] || []), {
      id: crypto.randomUUID(),
      title,
      description: sectionModalDescription.value.trim(),
      company,
      startDate: sectionModalStartDate.value || '',
      endDate: sectionModalEndDate.value || '',
    }]
  } else if (key === 'education') {
    const title = sectionModalTitle.value.trim()
    const school = sectionModalSchool.value.trim()
    if (!title || !school) return
    sectionExtraItems[key] = [...(sectionExtraItems[key] || []), {
      id: crypto.randomUUID(),
      title,
      description: sectionModalDescription.value.trim(),
      school,
      startDate: sectionModalStartDate.value || '',
      endDate: sectionModalEndDate.value || '',
      location: sectionModalLocation.value.trim(),
    }]
  } else if (key === 'projects') {
    const title = sectionModalTitle.value.trim()
    if (!title) return
    sectionExtraItems[key] = [...(sectionExtraItems[key] || []), {
      id: crypto.randomUUID(),
      title,
      description: sectionModalDescription.value.trim(),
      attachments: sectionModalFiles.value.map((f: any) => f?.name || 'file'),
      home_page: sectionModalHomePage.value.trim(),
    }]
  } else if (key === 'skills') {
    const name = sectionModalSkillName.value.trim()
    if (!name) return
    sectionExtraItems[key] = [...(sectionExtraItems[key] || []), {
      name,
      level: Number(sectionModalSkillStars.value) * 20,
    }]
  } else {
    const value = sectionModalValue.value.trim()
    if (!value) return
    sectionExtraItems[key] = [...(sectionExtraItems[key] || []), value]
  }
  sectionModalOpen.value = false
}
function isSectionVisible(section: string) { return !hiddenSections[normalizeSectionKey(section)] }

const hiddenSectionsByZone = reactive<Record<string, Record<string, boolean>>>({})

function hideSectionInZone(orderKey: keyof typeof sectionOrders, section: string) {
  const normalized = normalizeSectionKey(section)
  hiddenSectionsByZone[orderKey] = hiddenSectionsByZone[orderKey] || {}
  hiddenSectionsByZone[orderKey][normalized] = true
}

function isSectionVisibleInZone(orderKey: keyof typeof sectionOrders, section: string) {
  const normalized = normalizeSectionKey(section)
  return !(hiddenSectionsByZone[orderKey]?.[normalized])
}

function getSectionVariantOptions(section: string) {
  const variants = Object.keys(sectionComponentMap[section] || {})
  return variants.map((variant) => ({ title: variant, value: variant }))
}

function effectiveSectionType(section: string, fallback: string) {
  return sectionTypeOverrides[section] || fallback
}

function formatShortDate(value: any) {
  if (!value) return ''
  const str = String(value)
  const parts = str.split('-')
  if (parts.length >= 2) return `${parts[1]}.${parts[0].slice(2)}`
  return str
}


const sectionTitleMap: Record<string, string> = {
  profile: 'Profile',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  certifications: 'Certification',
  languages: 'Languages',
  references: 'References',
  hobbies: 'Hobby',
  projects: 'Projects',
}
const sectionIconMap: Record<string, string> = {
  profile: 'mdi-account-outline',
  experience: 'mdi-briefcase-outline',
  education: 'mdi-school-outline',
  skills: 'mdi-star-outline',
  certifications: 'mdi-certificate-outline',
  languages: 'mdi-translate',
  references: 'mdi-account-group-outline',
  hobbies: 'mdi-heart-outline',
  projects: 'mdi-folder-outline',
}

function toSectionKey(section?: string) {
  const key = String(section || "").toLowerCase()
  if (key === "certification") return "certifications"
  if (key === "hobby") return "hobbies"
  return key
}

function getSectionItems(rawSection: string): string[] {
  const key = normalizeSectionKey(rawSection)
  const data: any = fakeData.value || {}
  const extra = sectionExtraItems[key] || []
  const toTitleDesc = (item: any, fallback: string) => {
    if (typeof item === 'string') return item
    const title = String(item?.title || item?.name || fallback)
    const description = String(item?.description || '').trim()
    return description ? `${title} · ${description}` : title
  }
  const toLeveledItem = (item: any, fallback: string, preferFlag = false) => {
    if (typeof item === 'string') return item
    const level = Number(item?.level)
    const suffix = Number.isFinite(level) ? ` (${Math.max(0, Math.min(100, level))}%)` : ''
    const label = preferFlag && item?.languageType === 'flag' && item?.flag
      ? String(item.flag)
      : String(item?.name || item?.title || fallback)
    return `${label}${suffix}`
  }

  if (key === 'experience') return [...(data.experiences || []).map((item: any) => { const from = formatShortDate(item.startDate); const to = item.endDate ? formatShortDate(item.endDate) : 'Present'; const date = from ? `${from} - ${to}` : ''; return `${item.title || 'Role'}§${item.company || ''}§${date}§${item.description || 'Description...'}` }), ...extra.map((item: any) => { const from = formatShortDate(item.startDate); const to = item.endDate ? formatShortDate(item.endDate) : 'Present'; const date = from ? `${from} - ${to}` : ''; return `${item.title || 'Role'}§${item.company || ''}§${date}§${item.description || 'Description...'}` })]
  if (key === 'education') return [...(data.educations || []).map((item: any) => { const from = formatShortDate(item.startDate); const to = formatShortDate(item.endDate); const date = from ? `${from}${to ? ` - ${to}` : ''}` : ''; const schoolLine = `${item.school || ''}${item.location ? `, ${item.location}` : ''}`; return `${item.title || 'Degree'}§${schoolLine}§${date}§${item.description || 'Description...'}` }), ...extra.map((item: any) => { const from = formatShortDate(item.startDate); const to = formatShortDate(item.endDate); const date = from ? `${from}${to ? ` - ${to}` : ''}` : ''; const schoolLine = `${item.school || ''}${item.location ? `, ${item.location}` : ''}`; return `${item.title || 'Degree'}§${schoolLine}§${date}§${item.description || 'Description...'}` })]
  if (key === 'projects') return [...(data.projects || []).map((item: any) => toTitleDesc(item, 'Project')), ...extra.map((item: any) => toTitleDesc(item, 'Project'))].filter(Boolean)
  if (key === 'skills') return [...(data.skills || []).map((item: any) => toLeveledItem(item, 'Skill')), ...extra.map((item: any) => toLeveledItem(item, 'Skill'))].filter(Boolean)
  if (key === 'languages') return [...(data.languages || []), ...extra].map((item: any) => toLeveledItem(item, 'Language', true)).filter(Boolean)
  if (key === 'certifications') return [...(data.certifications || []).map((item: any) => toTitleDesc(item, 'Certification')), ...extra.map((item: any) => toTitleDesc(item, 'Certification'))].filter(Boolean)
  if (key === 'references') return [...(data.references || []).map((item: any) => toTitleDesc(item, 'Reference')), ...extra.map((item: any) => toTitleDesc(item, 'Reference'))].filter(Boolean)
  if (key === 'hobbies') return [...(data.hobbies || []).map((item: any) => toTitleDesc(item, 'Hobby')), ...extra.map((item: any) => toTitleDesc(item, 'Hobby'))].filter(Boolean)
  if (key === 'profile') return [String(data.resumeInformation?.profileText || data.profileDescription || ''), ...extra].filter(Boolean)
  return []
}
const headerProfile = computed(() => {
  const fake: any = fakeData.value || {}
  const info = fake.resumeInformation || {}
  return {
    fullName: String(info.fullName || fake.fullName || 'John Doe'),
    role: String(info.title || fake.role || 'Senior Developer'),
    image: String(info.photo || fake.image || '/img/default_avatar.svg'),
    contact: [
      { icon: 'mdi-email-outline', type: 'text', label: '', value: String(info.email || fake.email || 'john.doe@email.com') },
      { icon: 'mdi-phone-outline', type: 'text', label: '', value: String(info.phone || fake.phone || '+1 (555) 000-1234') },
      { icon: 'mdi-cake-variant-outline', type: 'text', label: '', value: String(info.birthDate || fake.birthday || '1992-05-12') },
      { icon: 'mdi-map-marker-outline', type: 'text', label: '', value: String(info.adresse || fake.location || 'Paris, France') },
      { icon: 'mdi-home-outline', type: 'link', label: 'Home Page', value: String(info.homepage || fake.homepage || 'https://portfolio.example.com') },
      { icon: 'mdi-github', type: 'link', label: 'Repository Profile', value: String(info.repo_profile || fake.repositoryPage || 'https://github.com/john-doe') },
    ],
  }
})


const photoMenuOpen = ref(false)
const photoFileInput = ref<HTMLInputElement | null>(null)
const photoPreview = ref('')
const photoSize = ref(92)
const photoRadius = ref(999)
const photoBorderColor = ref('#1F2937')
const photoBorderWidth = ref(2)
const photoColors = ['#1F2937','#1D4ED8','#2563EB','#0EA5E9','#14B8A6','#22C55E','#EAB308','#F97316','#EF4444','#EC4899','#8B5CF6','#64748B']

watch(activeTemplate, (template) => {
  const photo = (template as any)?.photo || {}
  photoSize.value = parsePx(photo.photoSize || photo.size, 92)
  photoRadius.value = parsePx(photo.photoBorderRadius || (photo.shape === 'circle' ? '999px' : '8px'), 999)
  photoBorderColor.value = String(photo.photoBorderColor || '#1F2937')
  photoBorderWidth.value = parsePx(photo.photoBorderWidth || 2, 2)
}, { immediate: true })

function openPhotoPicker() { photoFileInput.value?.click() }
function onPhotoSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { photoPreview.value = String(reader.result || '') }
  reader.readAsDataURL(file)
}

const asideWidth = ref(850)
const asideHeight = ref(1100)
const asideRadius = ref(0)


function parsePx(value: unknown, fallback: number) {
  const num = Number.parseFloat(String(value ?? ''))
  return Number.isFinite(num) ? num : fallback
}

const isHeaderLightLayout = computed(() => {
  const layout = String(activeTemplate.value?.layout || '')
  return ['aside', 'aside-bar-left', 'aside-bar-right'].includes(layout)
})

const headerTextColor = computed(() => (isHeaderLightLayout.value ? '#F8FAFC' : '#0F172A'))

const headerMutedColor = computed(() => (isHeaderLightLayout.value ? '#CBD5E1' : '#334155'))

watch(activeTemplate, (template) => {
  asideWidth.value = parsePx(template?.aside?.width, 850)
  asideHeight.value = parsePx(template?.aside?.height, 1100)
  asideRadius.value = parsePx(template?.aside?.radius, 0)
}, { immediate: true })

watch(selectedTemplate, () => scheduleCvPreviewMeasure(true))
watch(sectionTypeOverrides, () => scheduleCvPreviewMeasure(true), { deep: true })
watch(sectionExtraItems, () => scheduleCvPreviewMeasure(true), { deep: true })
watch(hiddenSections, () => scheduleCvPreviewMeasure(true), { deep: true })
watch(hiddenSectionsByZone, () => scheduleCvPreviewMeasure(true), { deep: true })
watch([asideWidth, asideHeight, asideRadius, photoSize, photoRadius, photoBorderWidth], () => scheduleCvPreviewMeasure(true))

onUpdated(() => scheduleCvPreviewMeasure())
onBeforeUnmount(() => {
  if (cvPreviewMeasureTimer) window.clearTimeout(cvPreviewMeasureTimer)
  cvPreviewResizeObserver?.disconnect()
})


function textFontPreset(kind: 'fullName'|'sectionLabel'|'entryTitle'|'body') {
  const style = String((activeTemplate.value as any)?.textStyles?.[kind] || 'sans')
  if (style === 'serif') return 'Georgia, "Times New Roman", serif'
  if (style === 'mono') return '"Fira Code", "Courier New", monospace'
  return 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
}

function applyPreviewTemplate(templateId: string) {
  selectedTemplate.value = templateId
  layoutMenuOpen.value = false
}

function saveFromPreview() {
  localStorage.setItem('resume-cv-preview', JSON.stringify({ template: selectedTemplate.value }))
}

function goToCapture() {
  navigateTo(`/resume/template-capture/cv/${selectedTemplate.value}`)
}

onMounted(async () => {
  if (loggedIn.value) {
    try {
      const resumes = await listMyResumes()
      if (Array.isArray(resumes) && resumes.length > 0) myResumes.value = resumes
    } catch {
      // keep template fake data fallback
    }
  }

  const queryTemplate = typeof route.query.template === 'string' ? route.query.template : ''
  if (queryTemplate && GENERATED_RESUME_TEMPLATES.some((template) => template.id === queryTemplate)) {
    selectedTemplate.value = queryTemplate
  }

  await nextTick()
  scheduleCvPreviewMeasure(true)
  if (import.meta.client && 'ResizeObserver' in window && cvPreviewRef.value) {
    cvPreviewResizeObserver = new ResizeObserver(() => scheduleCvPreviewMeasure())
    cvPreviewResizeObserver.observe(cvPreviewRef.value)
  }
})
</script>

<template>
  <div>
    <input ref="photoFileInput" type="file" accept="image/*" class="d-none" @change="onPhotoSelected">
    <AppPageDrawers>
      <template #left>
        <v-card-text>
          <h3 class="text-subtitle-1 font-weight-bold mb-3">CV Toolbar</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Même principe que cover page/cover letter: on garde la toolbar, mais le contenu CV est vide pour le moment.
          </p>
          <v-alert type="info" variant="tonal" density="comfortable">
            Content area volontairement vide (aucune section affichée).
          </v-alert>
        </v-card-text>
      </template>

      <template #right>
        <v-card-text>
          <h3 class="text-subtitle-2 font-weight-bold mb-2">Template actif</h3>
          <p class="text-body-2 mb-1">{{ activeTemplate?.name }}</p>
          <p class="text-caption text-medium-emphasis mb-3">{{ activeTemplate?.id }} · {{ activeTemplate?.layout }}</p>
          <v-slider v-model="asideWidth" label="Aside width (px)" :min="240" :max="1200" :step="2" hide-details class="mb-2"/>
          <v-slider v-model="asideHeight" label="Aside height (px)" :min="120" :max="2600" :step="2" hide-details class="mb-2"/>
          <v-slider v-model="asideRadius" label="Aside radius (px)" :min="0" :max="90" :step="1" hide-details/>
        </v-card-text>
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <div class="preview-toolbar-wrap">
        <div class="preview-toolbar-row">
          <v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-content-save-cog-outline" @click="saveFromPreview">Save</v-btn>
          <v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-camera-outline" @click="goToCapture">Capture</v-btn>
          <v-menu v-model="layoutMenuOpen" location="bottom center" origin="top center">
            <template #activator="{ props }">
              <v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-view-grid-outline" v-bind="props">Templates</v-btn>
            </template>
            <v-card class="template-menu-card">
              <div class="template-menu-grid">
                <v-card
                  v-for="template in GENERATED_RESUME_TEMPLATES"
                  :key="`cv-preview-${template.id}`"
                  class="template-menu-item"
                  :class="{ 'template-menu-item--active': selectedTemplate === template.id }"
                  variant="outlined"
                  @click="applyPreviewTemplate(template.id)"
                >
                  <v-img :src="`/img/cv/generated/${template.id}.png`" height="96" cover />
                  <v-card-text class="py-2 text-caption">{{ template.name }}</v-card-text>
                </v-card>
              </div>
            </v-card>
          </v-menu>
        </div>
      </div>

      <div class="py-8">
        <div
          ref="cvPreviewRef"
          class="cv-preview-shell"
          :style="{
            '--cv-preview-page-height': `${CV_PREVIEW_PDF_PAGE_HEIGHT}px`,
            '--cv-preview-total-height': `${cvPreviewHeight}px`,
          }"
        >
          <component :is="activeLayoutComponent" class="w-100 cv-preview-page" :style="{ background: activeTemplate?.theme?.palette?.pageBackground || '#ffffff', height: 'auto', minHeight: `${cvPreviewHeight}px`, overflow: 'visible', '--cv-primary': activeTemplate?.theme?.palette?.primary || '#1d4ed8', '--cv-secondary': activeTemplate?.theme?.palette?.secondary || '#93C5FD', '--cv-aside-width': `${asideWidth}px`, '--cv-aside-height': `${asideHeight}px`, '--cv-aside-radius': `${asideRadius}px`, '--cv-text-fullname': textFontPreset('fullName'), '--cv-text-section-label': textFontPreset('sectionLabel'), '--cv-text-entry-title': textFontPreset('entryTitle'), '--cv-text-body': textFontPreset('body'), '--cv-header-text': headerTextColor, '--cv-header-muted': headerMutedColor }">
          <template #header>
            <div class="cv-header-layout" :class="`cv-header-layout--${headerType}`">
              <template v-if="headerType === 'header-left'">
                <div class="cv-header-contact cv-col-8">
                  <div class="cv-header-contact-grid">
                    <div v-for="(item, idx) in headerProfile.contact" :key="`left-${idx}`" class="cv-contact-item">
                      <v-icon :icon="item.icon" size="16" />
                      <template v-if="item.type === 'link'">
                        <a :href="item.value" target="_blank" rel="noopener" class="cv-contact-link">{{ item.label }}</a>
                      </template>
                      <template v-else>{{ item.value }}</template>
                    </div>
                  </div>
                </div>
                <div class="cv-header-identity cv-col-4">
                  <div class="cv-photo-wrap"><img :src="photoPreview || headerProfile.image" alt="profile" class="cv-header-avatar" :style="{ width: `${photoSize}px`, height: `${photoSize}px`, borderRadius: `${photoRadius}px`, border: `${photoBorderWidth}px solid ${photoBorderColor}` }" @click="openPhotoPicker"><v-menu v-model="photoMenuOpen" location="bottom end" :close-on-content-click="false"><template #activator="{ props }"><v-btn icon="mdi-dots-vertical" size="x-small" class="cv-photo-menu-btn" v-bind="props" @click.stop/></template><v-card class="pa-3" min-width="220"><v-slider v-model="photoSize" label="Size" :min="48" :max="180" :step="2" hide-details class="mb-2"/><v-slider v-model="photoRadius" label="Radius" :min="0" :max="999" :step="1" hide-details class="mb-2"/><v-slider v-model="photoBorderWidth" label="Border" :min="0" :max="12" :step="1" hide-details class="mb-2"/><div class="cv-color-grid"><button v-for="c in photoColors" :key="c" class="cv-color-dot" :style="{background:c}" @click="photoBorderColor=c"/></div></v-card></v-menu></div>
                  <strong>{{ headerProfile.fullName }}</strong>
                  <span>{{ headerProfile.role }}</span>
                </div>
              </template>
              <template v-else-if="headerType === 'header-right'">
                <div class="cv-header-identity cv-col-4">
                  <div class="cv-photo-wrap"><img :src="photoPreview || headerProfile.image" alt="profile" class="cv-header-avatar" :style="{ width: `${photoSize}px`, height: `${photoSize}px`, borderRadius: `${photoRadius}px`, border: `${photoBorderWidth}px solid ${photoBorderColor}` }" @click="openPhotoPicker"><v-menu v-model="photoMenuOpen" location="bottom end" :close-on-content-click="false"><template #activator="{ props }"><v-btn icon="mdi-dots-vertical" size="x-small" class="cv-photo-menu-btn" v-bind="props" @click.stop/></template><v-card class="pa-3" min-width="220"><v-slider v-model="photoSize" label="Size" :min="48" :max="180" :step="2" hide-details class="mb-2"/><v-slider v-model="photoRadius" label="Radius" :min="0" :max="999" :step="1" hide-details class="mb-2"/><v-slider v-model="photoBorderWidth" label="Border" :min="0" :max="12" :step="1" hide-details class="mb-2"/><div class="cv-color-grid"><button v-for="c in photoColors" :key="c" class="cv-color-dot" :style="{background:c}" @click="photoBorderColor=c"/></div></v-card></v-menu></div>
                  <strong>{{ headerProfile.fullName }}</strong>
                  <span>{{ headerProfile.role }}</span>
                </div>
                <div class="cv-header-contact cv-col-8">
                  <div class="cv-header-contact-grid">
                    <div v-for="(item, idx) in headerProfile.contact" :key="`right-${idx}`" class="cv-contact-item">
                      <v-icon :icon="item.icon" size="16" />
                      <template v-if="item.type === 'link'">
                        <a :href="item.value" target="_blank" rel="noopener" class="cv-contact-link">{{ item.label }}</a>
                      </template>
                      <template v-else>{{ item.value }}</template>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="cv-col-6 cv-header-split-left">
                  <div class="cv-col-3">
                    <div class="cv-photo-wrap"><img :src="photoPreview || headerProfile.image" alt="profile" class="cv-header-avatar" :style="{ width: `${photoSize}px`, height: `${photoSize}px`, borderRadius: `${photoRadius}px`, border: `${photoBorderWidth}px solid ${photoBorderColor}` }" @click="openPhotoPicker"><v-menu v-model="photoMenuOpen" location="bottom end" :close-on-content-click="false"><template #activator="{ props }"><v-btn icon="mdi-dots-vertical" size="x-small" class="cv-photo-menu-btn" v-bind="props" @click.stop/></template><v-card class="pa-3" min-width="220"><v-slider v-model="photoSize" label="Size" :min="48" :max="180" :step="2" hide-details class="mb-2"/><v-slider v-model="photoRadius" label="Radius" :min="0" :max="999" :step="1" hide-details class="mb-2"/><v-slider v-model="photoBorderWidth" label="Border" :min="0" :max="12" :step="1" hide-details class="mb-2"/><div class="cv-color-grid"><button v-for="c in photoColors" :key="c" class="cv-color-dot" :style="{background:c}" @click="photoBorderColor=c"/></div></v-card></v-menu></div>
                  </div>
                  <div class="cv-col-3 cv-header-identity cv-header-identity--split">
                    <strong>{{ headerProfile.fullName }}</strong>
                    <span>{{ headerProfile.role }}</span>
                  </div>
                </div>
                <div class="cv-col-6 cv-header-contact">
                  <div class="cv-header-contact-grid">
                    <div v-for="(item, idx) in headerProfile.contact" :key="`split-${idx}`" class="cv-contact-item">
                      <v-icon :icon="item.icon" size="16" />
                      <template v-if="item.type === 'link'">
                        <a :href="item.value" target="_blank" rel="noopener" class="cv-contact-link">{{ item.label }}</a>
                      </template>
                      <template v-else>{{ item.value }}</template>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </template>
          <template #aside>
            <div v-if="isSideContentLayout && activeTemplate?.structure === 'structure-1'" :class="['cv-aside-sections', { 'cv-aside-sections--full': ['aside-full-left', 'aside-full-right'].includes(String(activeTemplate?.layout || '')) }]">
              <div v-for="section in visibleOrderedSections('asideOne', structureAsideOneSections, 'asideOne')" :key="`aside-s1-${section}`" class="cv-aside-section-item" draggable="true" @dragstart="onSectionDragStart('asideOne', section)" @dragover.prevent @drop="onSectionDrop('asideOne', section)" @dragend="onSectionDragEnd">
                <div class="cv-section-toolbar"><AppSelect v-model="sectionTypeOverrides[toSectionKey(section)]" :items="getSectionVariantOptions(toSectionKey(section))" item-title="title" item-value="value" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-shape-outline" class="cv-variant-select" /><v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="addSectionItem(toSectionKey(section))"/><v-btn icon="mdi-minus" size="x-small" variant="text" @click.stop="hideSection(toSectionKey(section)); hideSectionInZone('asideOne', toSectionKey(section))"/><v-btn icon="mdi-drag" size="x-small" variant="text" @click.stop="moveSection('asideOne', section)"/></div><strong><v-icon :icon="sectionIconMap[toSectionKey(section)] || 'mdi-circle-small'" size="16" class="mr-1" />{{ section }}</strong>
                <component :is="resolveSectionComponent(toSectionKey(section), effectiveSectionType(toSectionKey(section), sectionType(toSectionKey(section) as any)))" :items="getSectionItems(section)" :text="getSectionItems(section)[0]" />
              </div>
            </div>
            <div v-else-if="isSideContentLayout && activeTemplate?.structure === 'structure-2'" :class="['cv-aside-sections', { 'cv-aside-sections--full': ['aside-full-left', 'aside-full-right'].includes(String(activeTemplate?.layout || '')) }]">
              <div v-for="section in visibleOrderedSections('asideTwo', structureAsideTwoSections, 'asideTwo')" :key="`aside-s2-${section}`" class="cv-aside-section-item" draggable="true" @dragstart="onSectionDragStart('asideTwo', section)" @dragover.prevent @drop="onSectionDrop('asideTwo', section)" @dragend="onSectionDragEnd">
                <div class="cv-section-toolbar"><AppSelect v-model="sectionTypeOverrides[toSectionKey(section)]" :items="getSectionVariantOptions(toSectionKey(section))" item-title="title" item-value="value" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-shape-outline" class="cv-variant-select" /><v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="addSectionItem(toSectionKey(section))"/><v-btn icon="mdi-minus" size="x-small" variant="text" @click.stop="hideSection(toSectionKey(section)); hideSectionInZone('asideTwo', toSectionKey(section))"/><v-btn icon="mdi-drag" size="x-small" variant="text" @click.stop="moveSection('asideTwo', section)"/></div><strong><v-icon :icon="sectionIconMap[toSectionKey(section)] || 'mdi-circle-small'" size="16" class="mr-1" />{{ section }}</strong>
                <component :is="resolveSectionComponent(toSectionKey(section), effectiveSectionType(toSectionKey(section), sectionType(toSectionKey(section) as any)))" :items="getSectionItems(section)" :text="getSectionItems(section)[0]" />
              </div>
            </div>
          </template>

          <template #content>
            <div v-if="isSideContentLayout && activeTemplate?.structure === 'structure-1'" class="cv-sections-list">
              <div v-for="section in visibleOrderedSections('contentBase', structureContentBaseSections)" :key="`content-base-${section}`" class="cv-section-row" draggable="true" @dragstart="onSectionDragStart('contentBase', section)" @dragover.prevent @drop="onSectionDrop('contentBase', section)" @dragend="onSectionDragEnd"><div class="cv-section-toolbar"><AppSelect v-model="sectionTypeOverrides[toSectionKey(section)]" :items="getSectionVariantOptions(toSectionKey(section))" item-title="title" item-value="value" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-shape-outline" class="cv-variant-select" /><v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="addSectionItem(toSectionKey(section))"/><v-btn icon="mdi-minus" size="x-small" variant="text" @click.stop="hideSection(toSectionKey(section))"/><v-btn icon="mdi-drag" size="x-small" variant="text" @click.stop="moveSection('contentBase', section)"/></div><strong><v-icon :icon="sectionIconMap[toSectionKey(section)] || 'mdi-circle-small'" size="16" class="mr-1" />{{ sectionTitleMap[toSectionKey(section)] || section }}</strong><component :is="resolveSectionComponent(toSectionKey(section), effectiveSectionType(toSectionKey(section), sectionType(toSectionKey(section) as any)))" :items="getSectionItems(section)" :text="getSectionItems(section)[0]" /></div>
            </div>
            <div v-else-if="isSideContentLayout && activeTemplate?.structure === 'structure-2'" class="cv-sections-structure-2">
              <div v-for="section in visibleOrderedSections('contentStructure2', [...structureContentBaseSections, 'Skills'])" :key="`content-s2-${section}`" class="cv-section-row" draggable="true" @dragstart="onSectionDragStart('contentStructure2', section)" @dragover.prevent @drop="onSectionDrop('contentStructure2', section)" @dragend="onSectionDragEnd"><div class="cv-section-toolbar"><AppSelect v-model="sectionTypeOverrides[toSectionKey(section)]" :items="getSectionVariantOptions(toSectionKey(section))" item-title="title" item-value="value" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-shape-outline" class="cv-variant-select" /><v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="addSectionItem(toSectionKey(section))"/><v-btn icon="mdi-minus" size="x-small" variant="text" @click.stop="hideSection(toSectionKey(section))"/><v-btn icon="mdi-drag" size="x-small" variant="text" @click.stop="moveSection('contentStructure2', section)"/></div><strong><v-icon :icon="sectionIconMap[toSectionKey(section)] || 'mdi-circle-small'" size="16" class="mr-1" />{{ sectionTitleMap[toSectionKey(section)] || section }}</strong><component :is="resolveSectionComponent(toSectionKey(section), effectiveSectionType(toSectionKey(section), sectionType(toSectionKey(section) as any)))" :items="getSectionItems(section)" :text="getSectionItems(section)[0]" /></div>
            </div>
            <div v-else-if="isMainStructureLayout && activeTemplate?.structure === 'structure-1'" class="cv-sections-list">
              <div v-for="section in visibleOrderedSections('mainOne', structureOneSections)" :key="`s1-${section}`" class="cv-section-row" draggable="true" @dragstart="onSectionDragStart('mainOne', section)" @dragover.prevent @drop="onSectionDrop('mainOne', section)" @dragend="onSectionDragEnd"><div class="cv-section-toolbar"><AppSelect v-model="sectionTypeOverrides[toSectionKey(section)]" :items="getSectionVariantOptions(toSectionKey(section))" item-title="title" item-value="value" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-shape-outline" class="cv-variant-select" /><v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="addSectionItem(toSectionKey(section))"/><v-btn icon="mdi-minus" size="x-small" variant="text" @click.stop="hideSection(toSectionKey(section))"/><v-btn icon="mdi-drag" size="x-small" variant="text" @click.stop="moveSection('mainOne', section)"/></div><strong><v-icon :icon="sectionIconMap[toSectionKey(section)] || 'mdi-circle-small'" size="16" class="mr-1" />{{ section }}</strong><component :is="resolveSectionComponent(toSectionKey(section), effectiveSectionType(toSectionKey(section), sectionType(toSectionKey(section) as any)))" :items="getSectionItems(section)" :text="getSectionItems(section)[0]" /></div>
            </div>
            <div v-else-if="isMainStructureLayout && activeTemplate?.structure === 'structure-2'" class="cv-sections-structure-2">
              <div v-for="section in visibleOrderedSections('mainTwoTop', structureTwoTopSections)" :key="`s2-top-${section}`" class="cv-section-row" draggable="true" @dragstart="onSectionDragStart('mainTwoTop', section)" @dragover.prevent @drop="onSectionDrop('mainTwoTop', section)" @dragend="onSectionDragEnd"><div class="cv-section-toolbar"><AppSelect v-model="sectionTypeOverrides[toSectionKey(section)]" :items="getSectionVariantOptions(toSectionKey(section))" item-title="title" item-value="value" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-shape-outline" class="cv-variant-select" /><v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="addSectionItem(toSectionKey(section))"/><v-btn icon="mdi-minus" size="x-small" variant="text" @click.stop="hideSection(toSectionKey(section))"/><v-btn icon="mdi-drag" size="x-small" variant="text" @click.stop="moveSection('mainTwoTop', section)"/></div><strong><v-icon :icon="sectionIconMap[toSectionKey(section)] || 'mdi-circle-small'" size="16" class="mr-1" />{{ section }}</strong><component :is="resolveSectionComponent(toSectionKey(section), effectiveSectionType(toSectionKey(section), sectionType(toSectionKey(section) as any)))" :items="getSectionItems(section)" :text="getSectionItems(section)[0]" /></div>
              <v-row class="mt-1" dense>
                <v-col cols="6">
                  <div v-for="section in visibleOrderedSections('mainTwoLeft', structureTwoLeftSections)" :key="`s2-left-${section}`" class="cv-section-row" draggable="true" @dragstart="onSectionDragStart('mainTwoLeft', section)" @dragover.prevent @drop="onSectionDrop('mainTwoLeft', section)" @dragend="onSectionDragEnd"><div class="cv-section-toolbar"><AppSelect v-model="sectionTypeOverrides[toSectionKey(section)]" :items="getSectionVariantOptions(toSectionKey(section))" item-title="title" item-value="value" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-shape-outline" class="cv-variant-select" /><v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="addSectionItem(toSectionKey(section))"/><v-btn icon="mdi-minus" size="x-small" variant="text" @click.stop="hideSection(toSectionKey(section))"/><v-btn icon="mdi-drag" size="x-small" variant="text" @click.stop="moveSection('mainTwoLeft', section)"/></div><strong><v-icon :icon="sectionIconMap[toSectionKey(section)] || 'mdi-circle-small'" size="16" class="mr-1" />{{ section }}</strong><component :is="resolveSectionComponent(toSectionKey(section), effectiveSectionType(toSectionKey(section), sectionType(toSectionKey(section) as any)))" :items="getSectionItems(section)" :text="getSectionItems(section)[0]" /></div>
                </v-col>
                <v-col cols="6">
                  <div v-for="section in visibleOrderedSections('mainTwoRight', structureTwoRightSections)" :key="`s2-right-${section}`" class="cv-section-row" draggable="true" @dragstart="onSectionDragStart('mainTwoRight', section)" @dragover.prevent @drop="onSectionDrop('mainTwoRight', section)" @dragend="onSectionDragEnd"><div class="cv-section-toolbar"><AppSelect v-model="sectionTypeOverrides[toSectionKey(section)]" :items="getSectionVariantOptions(toSectionKey(section))" item-title="title" item-value="value" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-shape-outline" class="cv-variant-select" /><v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="addSectionItem(toSectionKey(section))"/><v-btn icon="mdi-minus" size="x-small" variant="text" @click.stop="hideSection(toSectionKey(section))"/><v-btn icon="mdi-drag" size="x-small" variant="text" @click.stop="moveSection('mainTwoRight', section)"/></div><strong><v-icon :icon="sectionIconMap[toSectionKey(section)] || 'mdi-circle-small'" size="16" class="mr-1" />{{ section }}</strong><component :is="resolveSectionComponent(toSectionKey(section), effectiveSectionType(toSectionKey(section), sectionType(toSectionKey(section) as any)))" :items="getSectionItems(section)" :text="getSectionItems(section)[0]" /></div>
                </v-col>
              </v-row>
            </div>
            <div v-else class="empty-state">
              <p class="text-medium-emphasis">Aucune section CV affichée pour le moment.</p>
            </div>
          </template>
          </component>
          <div
            v-for="pageBreak in cvPreviewPageBreaks"
            :key="`cv-page-break-${pageBreak}`"
            class="cv-page-break"
            :style="{ top: `${pageBreak * CV_PREVIEW_PDF_PAGE_HEIGHT}px` }"
          >
            <span>Fin page {{ pageBreak }}</span>
          </div>
        </div>
      </div>
    </v-container>

    <AppModal v-model="sectionModalOpen" title="Ajouter un élément" max-width="520">
      <v-card-text>
        <template v-if="sectionModalKey === 'languages'">
          <AppSelect v-model="languageOption" :items="languageCatalog" item-title="title" label="Language" return-object class="mb-3"/>
          <v-rating v-model="languageStars" length="5" density="compact" color="amber"/>
        </template>
        <template v-else-if="sectionModalKey === 'experience'">
          <v-text-field v-model="sectionModalTitle" label="Title" class="mb-2"/>
          <v-text-field v-model="sectionModalCompany" label="Company" class="mb-2"/>
          <v-textarea v-model="sectionModalDescription" label="Description" rows="3" class="mb-2"/>
          <v-row dense>
            <v-col cols="6"><v-text-field v-model="sectionModalStartDate" type="date" label="Start date"/></v-col>
            <v-col cols="6"><v-text-field v-model="sectionModalEndDate" type="date" label="End date"/></v-col>
          </v-row>
        </template>
        <template v-else-if="sectionModalKey === 'education'">
          <v-text-field v-model="sectionModalTitle" label="Title" class="mb-2"/>
          <v-text-field v-model="sectionModalSchool" label="School" class="mb-2"/>
          <v-text-field v-model="sectionModalLocation" label="Location" class="mb-2"/>
          <v-textarea v-model="sectionModalDescription" label="Description" rows="3" class="mb-2"/>
          <v-row dense>
            <v-col cols="6"><v-text-field v-model="sectionModalStartDate" type="date" label="Start date"/></v-col>
            <v-col cols="6"><v-text-field v-model="sectionModalEndDate" type="date" label="End date"/></v-col>
          </v-row>
        </template>
        <template v-else-if="sectionModalKey === 'projects'">
          <v-text-field v-model="sectionModalTitle" label="Title" class="mb-2"/>
          <v-text-field v-model="sectionModalHomePage" label="Homepage" class="mb-2"/>
          <v-textarea v-model="sectionModalDescription" label="Description" rows="3" class="mb-2"/>
          <v-file-input v-model="sectionModalFiles" label="Attachments" multiple chips show-size/>
        </template>
        <template v-else-if="sectionModalKey === 'skills'">
          <v-text-field v-model="sectionModalSkillName" label="Name" class="mb-2"/>
          <v-rating v-model="sectionModalSkillStars" length="5" density="compact" color="amber"/>
        </template>
        <template v-else-if="sectionModalKey === 'certifications'">
          <v-text-field v-model="sectionModalTitle" label="Title" class="mb-2"/>
          <v-textarea v-model="sectionModalDescription" label="Description" rows="3" class="mb-2"/>
          <v-file-input v-model="sectionModalFiles" label="Attachments" multiple chips show-size/>
        </template>
        <template v-else-if="sectionModalKey === 'references'">
          <v-text-field v-model="sectionModalTitle" label="Title" class="mb-2"/>
          <v-textarea v-model="sectionModalDescription" label="Description" rows="3"/>
        </template>
        <v-text-field v-else v-model="sectionModalValue" label="Nouveau contenu"/>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="sectionModalOpen = false">Cancel</v-btn>
        <v-btn color="primary" @click="confirmAddSectionItem">Save</v-btn>
      </v-card-actions>
    </AppModal>
  </div>
</template>

<style scoped>

.cv-preview-shell {
  position: relative;
  min-height: var(--cv-preview-total-height, 1100px);
}

.cv-preview-page {
  height: auto !important;
  min-height: var(--cv-preview-total-height, 1100px) !important;
  overflow: visible !important;
}

.cv-page-break {
  position: absolute;
  right: 0;
  left: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: none;
  color: color-mix(in srgb, var(--cv-primary, #1d4ed8) 70%, #64748b);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transform: translateY(-50%);
}

.cv-page-break::before,
.cv-page-break::after {
  content: '';
  height: 1px;
  flex: 1;
  border-top: 1px dashed currentColor;
  opacity: 0.75;
}

.cv-page-break span {
  padding: 3px 8px;
  border: 1px solid currentColor;
  border-radius: 999px;
  background: color-mix(in srgb, var(--cv-primary, #1d4ed8) 8%, white);
}

.cv-header-layout { display: grid; gap: 12px; align-items: center; }
.cv-header-layout--header-left { grid-template-columns: 2fr 1fr; }
.cv-header-layout--header-right { grid-template-columns: 1fr 2fr; }
.cv-header-layout--header-split { grid-template-columns: 5fr 7fr; }
.cv-header-split-left { display: grid; grid-template-columns: auto 1fr; gap: 6px; align-items: center; justify-content: start; }
.cv-header-contact { display:flex; flex-direction:column; justify-content:center; align-items:stretch; text-align:start; }
.cv-header-contact-grid { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 10px; width:100%; text-align:start; }
.cv-contact-item { display:flex; align-items:center; gap:6px; font-size:13px; }
.cv-header-layout, .cv-contact-item, .cv-header-identity strong { color: var(--cv-header-text, #0f172a); }
.cv-contact-link { color: inherit; text-decoration: none; font-weight: 500; }
.cv-contact-link:hover { text-decoration: none; color: inherit; }
.cv-header-identity { display: flex; flex-direction: column; gap: 4px; justify-content:center; align-items:center; text-align:center; }
.cv-header-identity--split { align-items:flex-start; text-align:start; }
.cv-header-avatar { width: 52px; height: 52px; object-fit: cover; border-radius: 999px; }

.empty-state {
  text-align: center;
  max-width: 560px;
  padding: 24px;
}

.cv-sections-list, .cv-sections-structure-2 {
  width: 100%;
}

.cv-aside-sections {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-aside-section-item {
  position:relative;
  padding: 8px 10px;
  border-radius: 8px;
  background: transparent;
  color: #1e293b;
  border: 0;
  font-weight: 600;
  font-size: 13px;
}

.cv-aside-section-item > strong{display:block;margin-bottom:6px;padding-right:120px}
.cv-aside-section-item:hover .cv-section-toolbar{opacity:1;pointer-events:auto}
.cv-aside-section-item :deep(.cv-sec) { padding: 4px 0; }
.cv-aside-section-item :deep(.cv-item) { font-size: 12px; margin-bottom: 4px; }

.cv-aside-sections--full .cv-aside-section-item {
  color: #fff;
}
.cv-aside-sections--full .cv-aside-section-item :deep(.cv-sec),
.cv-aside-sections--full .cv-aside-section-item :deep(.cv-item),
.cv-aside-sections--full .cv-aside-section-item :deep(p) {
  color: #fff;
}
.cv-aside-sections--full .cv-aside-section-item :deep(.label),
.cv-aside-sections--full .cv-aside-section-item :deep(.value) {
  color: #fff !important;
}

.cv-section-row small { font-weight: 400; opacity: .8; }
.cv-section-row--timeline{border-left:4px solid #6366f1;padding-left:10px}
.cv-section-row--cards{box-shadow:0 4px 10px rgba(15,23,42,.08)}
.cv-section-row--dot::before{content:"• ";font-weight:700}
.cv-section-row--stars::after{content:" ★"}
.cv-section-row--progress-line{background:linear-gradient(90deg,#dbeafe 45%,transparent 45%)}
.cv-section-row--progress-circle{border-style:solid}
.cv-row-items { margin: 6px 0 0; padding-left: 16px; }
.cv-row-items li { font-size: 12px; line-height: 1.35; }
 .cv-section-row {
  position:relative;
  border: 0;
  border-radius: 0;
  padding: 8px 4px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #334155;
  background: transparent;
}
.cv-section-row > strong{display:block;margin-bottom:6px;padding-right:120px}
.cv-section-toolbar{position:absolute;top:0;right:0;opacity:0;pointer-events:none;transition:opacity .15s ease;z-index:2}
.cv-section-row:hover .cv-section-toolbar{opacity:1;pointer-events:auto}
.cv-section-toolbar :deep(.v-field){min-height:28px}
.cv-section-toolbar{width:180px;display:flex;align-items:center;gap:1px;justify-content:flex-end}

.template-menu-card {
  width: min(860px, calc(100vw - 48px));
  max-height: 70vh;
  overflow: auto;
}

.template-menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 12px;
}

.template-menu-item {
  cursor: pointer;
}

.template-menu-item--active {
  border: 2px solid rgb(var(--v-theme-primary));
}

.cv-header-identity strong{font-family:var(--cv-text-fullname)}
.cv-section-row > strong,.cv-aside-section-item > strong{font-family:var(--cv-text-section-label)}
.cv-section-row :deep(.cv-entry strong), .cv-aside-section-item :deep(.cv-entry strong){font-family:var(--cv-text-entry-title)}
.cv-section-row :deep(.cv-sec), .cv-aside-section-item :deep(.cv-sec), .cv-section-row :deep(.cv-item), .cv-aside-section-item :deep(.cv-item){font-family:var(--cv-text-body)}


.cv-photo-wrap{position:relative;display:inline-flex}
.cv-photo-menu-btn{position:absolute;top:-8px;right:-8px;opacity:0;transition:opacity .15s}
.cv-photo-wrap:hover .cv-photo-menu-btn{opacity:1}
.cv-color-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
.cv-color-dot{width:20px;height:20px;border-radius:999px;border:1px solid #cbd5e1;cursor:pointer}
.cv-section-row > strong{color:color-mix(in srgb, var(--cv-primary,#1d4ed8) 78%, #0f172a)}
.cv-aside-section-item > strong{color:color-mix(in srgb, var(--cv-primary,#1d4ed8) 55%, white)}


.cv-section-toolbar .v-btn{min-width:16px!important;width:16px;height:16px;padding:0}
.cv-variant-select{max-width:30px;min-width:30px}
.cv-variant-select :deep(.v-field__input){display:none}
.cv-variant-select :deep(.v-field__prepend-inner){padding-inline-end:0}
.cv-variant-select :deep(.v-field__append-inner){display:none}
.cv-header-identity span{font-size:12px;opacity:.95;color:var(--cv-header-muted,#334155)}

</style>
