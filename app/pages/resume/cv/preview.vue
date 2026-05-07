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
import { resolveResumeTextFont, useResumeGoogleFonts } from '~/composables/useResumeGoogleFonts'

import HoverRichTextEditor from '~/components/Resume/Create/HoverRichTextEditor.vue'
import CvEditableSectionContent from '~/components/cv/sections/CvEditableSectionContent.vue'

const { t } = useI18n()

definePageMeta({
  title: 'Resume · CV Preview',
  layout: 'resume',
})

useHead(() => ({
  title: t('resumePreview.cv.metaTitle'),
}))

const route = useRoute()
const { loggedIn } = useUserSession()
const myResumes = ref<ResumeApiItem[]>([])
const selectedTemplate = ref(GENERATED_RESUME_TEMPLATES[0]?.id || 'tpl-001')
const layoutMenuOpen = ref(false)
const paletteMenuOpen = ref(false)
const selectedPalette = ref('template')
const signatureDataUrl = ref('')
const signatureDialogOpen = ref(false)
const signatureCanvas = ref<HTMLCanvasElement | null>(null)
const decorShapeOptions = ['circle', 'ring', 'blob', 'square', 'diamond', 'star', 'triangle', 'pill', 'bar']
const decorColorOptions = ['#0EA5E9', '#2563EB', '#7C3AED', '#EC4899', '#F97316', '#EAB308', '#22C55E', '#14B8A6', '#64748B', '#111827']
const editableDecorObjects = ref<any[]>([])
const decorMenuOpenIndex = ref<number | null>(null)

const activeTemplate = computed(() =>
  GENERATED_RESUME_TEMPLATES.find((template) => template.id === selectedTemplate.value) || GENERATED_RESUME_TEMPLATES[0],
)
useResumeGoogleFonts(activeTemplate)

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
const palettePresetOptions = computed(() => [
  { title: 'Template', value: 'template', primary: activeTemplate.value.theme.palette.primary, dark: activeTemplate.value.theme.palette.secondary, light: activeTemplate.value.theme.palette.pageBackground },
  { title: 'Ocean', value: 'ocean', primary: '#2563EB', dark: '#1D4ED8', light: '#EFF6FF' },
  { title: 'Indigo', value: 'indigo', primary: '#4F46E5', dark: '#3730A3', light: '#EEF2FF' },
  { title: 'Violet', value: 'violet', primary: '#7C3AED', dark: '#5B21B6', light: '#F5F3FF' },
  { title: 'Slate', value: 'slate', primary: '#334155', dark: '#1E293B', light: '#F8FAFC' },
  { title: 'Olive', value: 'olive', primary: '#A3A86C', dark: '#7E8A5B', light: '#F7F8EE' },
  { title: 'Sage', value: 'sage', primary: '#8AA07A', dark: '#647860', light: '#F3F7F1' },
  { title: 'Emerald', value: 'emerald', primary: '#059669', dark: '#047857', light: '#ECFDF5' },
  { title: 'Rose', value: 'rose', primary: '#E11D48', dark: '#BE123C', light: '#FFF1F2' },
  { title: 'Sky', value: 'sky', primary: '#0EA5E9', dark: '#0284C7', light: '#F0F9FF' },
  { title: 'Sunset', value: 'sunset', primary: '#C2410C', dark: '#9A3412', light: '#FFF7ED' },
  { title: 'Amber', value: 'amber', primary: '#D97706', dark: '#B45309', light: '#FFFBEB' },
  { title: 'Charcoal', value: 'charcoal', primary: '#3F3F46', dark: '#27272A', light: '#FAFAFA' },
  { title: 'Plum', value: 'plum', primary: '#7E3F8F', dark: '#5B2C6F', light: '#FAF5FF' },
  { title: 'Teal', value: 'teal', primary: '#0F766E', dark: '#115E59', light: '#F0FDFA' },
  { title: 'Cobalt', value: 'cobalt', primary: '#1D4ED8', dark: '#1E3A8A', light: '#EFF6FF' },
  { title: 'Coral', value: 'coral', primary: '#F97316', dark: '#C2410C', light: '#FFF7ED' },
  { title: 'Mint', value: 'mint', primary: '#10B981', dark: '#047857', light: '#ECFDF5' },
  { title: 'Lavender', value: 'lavender', primary: '#A78BFA', dark: '#6D28D9', light: '#F5F3FF' },
  { title: 'Ruby', value: 'ruby', primary: '#DC2626', dark: '#991B1B', light: '#FEF2F2' },
  { title: 'Forest', value: 'forest', primary: '#166534', dark: '#14532D', light: '#F0FDF4' },
  { title: 'Sand', value: 'sand', primary: '#B45309', dark: '#92400E', light: '#FFFBEB' },
  { title: 'Aqua', value: 'aqua', primary: '#0891B2', dark: '#155E75', light: '#ECFEFF' },
  { title: 'Magenta', value: 'magenta', primary: '#C026D3', dark: '#86198F', light: '#FDF4FF' },
  { title: 'Steel', value: 'steel', primary: '#64748B', dark: '#334155', light: '#F8FAFC' },
  { title: 'Night', value: 'night', primary: '#0F172A', dark: '#020617', light: '#E2E8F0' },
  { title: 'Peach', value: 'peach', primary: '#FB7185', dark: '#BE123C', light: '#FFF1F2' },
  { title: 'Lime', value: 'lime', primary: '#65A30D', dark: '#3F6212', light: '#F7FEE7' },
  { title: 'Orchid', value: 'orchid', primary: '#9333EA', dark: '#6B21A8', light: '#FAF5FF' },
  { title: 'Graphite', value: 'graphite', primary: '#374151', dark: '#111827', light: '#F9FAFB' },
])
const activeColors = computed(() => {
  const palette = activeTemplate.value?.theme?.palette || {}
  const selected = palettePresetOptions.value.find((option) => option.value === selectedPalette.value)
  if (selected && selected.value !== 'template') return { ...palette, primary: selected.primary, secondary: selected.dark, pageBackground: selected.light }
  return palette
})
const sectionBarConfig = reactive({ show: true, widthType: 'flex', height: 3, radius: 999 })

function toPercentNumber(value: unknown, fallback = 50): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.min(100, Math.max(0, value))
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace('%', '').trim())
    if (Number.isFinite(parsed)) return Math.min(100, Math.max(0, parsed))
  }
  return fallback
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeDecorObject(obj: any) {
  const rawType = String(obj?.type ?? 'circle')
  const normalizedType = rawType === 'diamand' ? 'diamond' : rawType
  return {
    ...obj,
    type: normalizedType,
    x: toPercentNumber(obj?.x, 50),
    y: toPercentNumber(obj?.y, 50),
    size: toNumber(obj?.size, 120),
    opacity: toNumber(obj?.opacity, 0.15),
    color: String(obj?.color ?? ''),
  }
}

function decorObjectStyle(obj: any) {
  const size = toNumber(obj?.size, 120)
  const x = toPercentNumber(obj?.x, 50)
  const y = toPercentNumber(obj?.y, 50)
  const opacity = toNumber(obj?.opacity, 0.15)
  const type = String(obj?.type ?? 'circle')
  const base: Record<string, string | number> = { left: `${x}%`, top: `${y}%`, opacity, width: `${size}px`, height: `${size}px` }
  const color = String(obj?.color ?? '').trim()
  if (color) base.backgroundColor = color

  if (type === 'ring' && color) {
    base.backgroundColor = 'transparent'
    base.borderColor = color
  }

  if (type === 'bar') {
    base.width = `${Math.round(size * 1.8)}px`
    base.height = `${Math.max(8, Math.round(size * 0.22))}px`
  }
  if (type === 'pill') {
    base.width = `${Math.round(size * 1.8)}px`
    base.height = `${Math.max(14, Math.round(size * 0.62))}px`
  }
  return base
}

function addDecorObject() {
  editableDecorObjects.value.push(normalizeDecorObject({ type: 'circle', x: 50, y: 50, size: 120, opacity: 0.15, color: '' }))
  decorMenuOpenIndex.value = editableDecorObjects.value.length - 1
}
function removeDecorObject(index: number) {
  editableDecorObjects.value.splice(index, 1)
  if (decorMenuOpenIndex.value === index) decorMenuOpenIndex.value = null
  if (decorMenuOpenIndex.value !== null && decorMenuOpenIndex.value > index) decorMenuOpenIndex.value -= 1
}

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

function moveSection(orderKey: keyof typeof sectionOrders, section: string, direction: 'up' | 'down' = 'down') {
  const order = sectionOrders[orderKey]
  if (!order) return
  const idx = order.indexOf(section)
  if (idx === -1 || order.length <= 1) return
  const next = direction === 'up'
    ? Math.max(0, idx - 1)
    : Math.min(order.length - 1, idx + 1)
  if (next === idx) return
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


const sectionVariantOptionsMap: Record<string, string[]> = {
  profile: ['classic'],
  experience: ['classic', 'list', 'dot', 'timeline', 'cards'],
  education: ['classic', 'list', 'dot', 'timeline', 'cards'],
  projects: ['classic', 'list', 'dot', 'cards'],
  skills: ['classic', 'stars', 'dots', 'progress-line', 'progress-circle'],
  languages: ['classic', 'stars', 'dots', 'progress-line', 'progress-circle'],
  certifications: ['classic', 'list', 'dot', 'cards'],
  references: ['classic', 'list', 'dot', 'cards'],
  hobbies: ['classic', 'list', 'dot', 'cards'],
}

const sectionTypeOverrides = reactive<Record<string, string>>({})


const hiddenSections = reactive<Record<string, boolean>>({})
const sectionExtraItems = reactive<Record<string, any[]>>({})
const sectionLineOffsets = reactive<Record<string, number>>({})
const CV_SECTION_LINE_OFFSET_PX = 18
const CV_SECTION_MAX_LINE_OFFSET = 24

function sectionOffsetKey(orderKey: keyof typeof sectionOrders, section: string) {
  return `${orderKey}:${normalizeSectionKey(section)}`
}

function sectionOffsetStyle(orderKey: keyof typeof sectionOrders, section: string) {
  const lines = sectionLineOffsets[sectionOffsetKey(orderKey, section)] || 0
  return lines > 0 ? { marginTop: `${lines * CV_SECTION_LINE_OFFSET_PX}px` } : undefined
}

function shiftSectionByLine(orderKey: keyof typeof sectionOrders, section: string, direction: 'up' | 'down') {
  const key = sectionOffsetKey(orderKey, section)
  const current = sectionLineOffsets[key] || 0
  const next = direction === 'down'
    ? Math.min(CV_SECTION_MAX_LINE_OFFSET, current + 1)
    : Math.max(0, current - 1)

  sectionLineOffsets[key] = next
  scheduleCvPreviewMeasure()
}

function canShiftSectionUp(orderKey: keyof typeof sectionOrders, section: string) {
  return (sectionLineOffsets[sectionOffsetKey(orderKey, section)] || 0) > 0
}
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
  Reflect.deleteProperty(editableSectionItems, key)
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
  const variants = sectionVariantOptionsMap[section] || ['classic']
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
  const toLevelText = (level: number, sectionKey: 'skills' | 'languages') => {
    if (level >= 100) return sectionKey === 'languages' ? 'Fluent' : 'Expert'
    if (level >= 75) return 'Advanced'
    if (level >= 50) return 'Intermediate'
    if (level >= 25) return 'Basic'
    return 'Beginner'
  }

  const toLeveledItem = (item: any, fallback: string, sectionKey: 'skills' | 'languages', preferFlag = false) => {
    if (typeof item === 'string') return item
    const level = Number(item?.level)
    const normalizedLevel = Number.isFinite(level) ? Math.max(0, Math.min(100, level)) : null
    const variant = effectiveSectionType(sectionKey, sectionType(sectionKey as any))
    const showTextLevel = variant === 'classic' || variant === 'text'
    const suffix = normalizedLevel === null
      ? ''
      : showTextLevel
        ? ` (${toLevelText(normalizedLevel, sectionKey)})`
        : ` (${normalizedLevel}%)`
    const label = preferFlag && item?.languageType === 'flag' && item?.flag
      ? String(item.flag)
      : String(item?.name || item?.title || fallback)
    return `${label}${suffix}`
  }

  if (key === 'experience') return [...(data.experiences || []).map((item: any) => { const from = formatShortDate(item.startDate); const to = item.endDate ? formatShortDate(item.endDate) : 'Present'; const date = from ? `${from} - ${to}` : ''; return `${item.title || 'Role'}§${item.company || ''}§${date}§${item.description || 'Description...'}` }), ...extra.map((item: any) => { const from = formatShortDate(item.startDate); const to = item.endDate ? formatShortDate(item.endDate) : 'Present'; const date = from ? `${from} - ${to}` : ''; return `${item.title || 'Role'}§${item.company || ''}§${date}§${item.description || 'Description...'}` })]
  if (key === 'education') return [...(data.educations || []).map((item: any) => { const from = formatShortDate(item.startDate); const to = formatShortDate(item.endDate); const date = from ? `${from}${to ? ` - ${to}` : ''}` : ''; const schoolLine = `${item.school || ''}${item.location ? `, ${item.location}` : ''}`; return `${item.title || 'Degree'}§${schoolLine}§${date}§${item.description || 'Description...'}` }), ...extra.map((item: any) => { const from = formatShortDate(item.startDate); const to = formatShortDate(item.endDate); const date = from ? `${from}${to ? ` - ${to}` : ''}` : ''; const schoolLine = `${item.school || ''}${item.location ? `, ${item.location}` : ''}`; return `${item.title || 'Degree'}§${schoolLine}§${date}§${item.description || 'Description...'}` })]
  if (key === 'projects') return [...(data.projects || []).map((item: any) => toTitleDesc(item, 'Project')), ...extra.map((item: any) => toTitleDesc(item, 'Project'))].filter(Boolean)
  if (key === 'skills') return [...(data.skills || []).map((item: any) => toLeveledItem(item, 'Skill', 'skills')), ...extra.map((item: any) => toLeveledItem(item, 'Skill', 'skills'))].filter(Boolean)
  if (key === 'languages') return [...(data.languages || []), ...extra].map((item: any) => toLeveledItem(item, 'Language', 'languages', true)).filter(Boolean)
  if (key === 'certifications') return [...(data.certifications || []).map((item: any) => toTitleDesc(item, 'Certification')), ...extra.map((item: any) => toTitleDesc(item, 'Certification'))].filter(Boolean)
  if (key === 'references') return [...(data.references || []).map((item: any) => toTitleDesc(item, 'Reference')), ...extra.map((item: any) => toTitleDesc(item, 'Reference'))].filter(Boolean)
  if (key === 'hobbies') return [...(data.hobbies || []).map((item: any) => toTitleDesc(item, 'Hobby')), ...extra.map((item: any) => toTitleDesc(item, 'Hobby'))].filter(Boolean)
  if (key === 'profile') return [String(data.resumeInformation?.profileText || data.profileDescription || ''), ...extra].filter(Boolean)
  return []
}

const editableSectionItems = reactive<Record<string, string[]>>({})
const sectionTitleOverrides = reactive<Record<string, string>>({})
const headerOverrides = reactive<Record<string, string>>({})

function getEditableSectionItems(rawSection: string) {
  const key = normalizeSectionKey(rawSection)
  if (!editableSectionItems[key]) editableSectionItems[key] = getSectionItems(rawSection)
  return editableSectionItems[key]
}

function updateEditableSectionItem(rawSection: string, index: number, value: string) {
  const items = getEditableSectionItems(rawSection)
  items[index] = value
  scheduleCvPreviewMeasure(true)
}

function sectionDisplayTitle(section: string) {
  const key = toSectionKey(section)
  return sectionTitleOverrides[key] || sectionTitleMap[key] || section
}

function updateSectionDisplayTitle(section: string, value: string) {
  sectionTitleOverrides[toSectionKey(section)] = value
}

function updateHeaderField(key: string, value: string) {
  headerOverrides[key] = value
}

watch([selectedTemplate, userResumeData], () => {
  Object.keys(editableSectionItems).forEach((key) => Reflect.deleteProperty(editableSectionItems, key))
  Object.keys(headerOverrides).forEach((key) => Reflect.deleteProperty(headerOverrides, key))
}, { deep: false })

const headerProfile = computed(() => {
  const fake: any = fakeData.value || {}
  const info = fake.resumeInformation || {}
  return {
    fullName: headerOverrides.fullName ?? String(info.fullName || fake.fullName || 'John Doe'),
    role: headerOverrides.role ?? String(info.title || fake.role || 'Senior Developer'),
    image: String(info.photo || fake.image || '/img/default_avatar.svg'),
    contact: [
      { key: 'email', icon: 'mdi-email-outline', type: 'text', label: '', value: headerOverrides.email ?? String(info.email || fake.email || 'john.doe@email.com') },
      { key: 'phone', icon: 'mdi-phone-outline', type: 'text', label: '', value: headerOverrides.phone ?? String(info.phone || fake.phone || '+1 (555) 000-1234') },
      { key: 'birthDate', icon: 'mdi-cake-variant-outline', type: 'text', label: '', value: headerOverrides.birthDate ?? String(info.birthDate || fake.birthday || '1992-05-12') },
      { key: 'adresse', icon: 'mdi-map-marker-outline', type: 'text', label: '', value: headerOverrides.adresse ?? String(info.adresse || fake.location || 'Paris, France') },
      { key: 'homepage', icon: 'mdi-home-outline', type: 'link', label: 'Home Page', value: headerOverrides.homepage ?? String(info.homepage || fake.homepage || 'https://portfolio.example.com') },
      { key: 'repo_profile', icon: 'mdi-github', type: 'link', label: 'Repository Profile', value: headerOverrides.repo_profile ?? String(info.repo_profile || fake.repositoryPage || 'https://github.com/john-doe') },
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
  const fallback = kind === 'fullName' ? 'serif' : 'sans'
  return resolveResumeTextFont((activeTemplate.value as any)?.textStyles?.[kind], fallback)
}

function applyPreviewTemplate(templateId: string) {
  selectedTemplate.value = templateId
  layoutMenuOpen.value = false
}

function saveFromPreview() {
  localStorage.setItem('resume-cv-preview', JSON.stringify({ template: selectedTemplate.value, signature: signatureDataUrl.value }))
}

function goToCreateResume() {
  navigateTo('/resume/cv/preview')
}

async function downloadPdf() {
  const node = document.querySelector('.cv-preview-shell') as HTMLElement | null
  if (!node) return
  const printWindow = window.open('', '_blank', 'width=900,height=1300')
  if (!printWindow) return
  const headStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map((el) => el.outerHTML).join('')
  printWindow.document.write(`<html><head>${headStyles}<style>@page{size:A4;margin:0}html,body{margin:0;background:#fff}body{display:flex;justify-content:center;align-items:flex-start}.cv-preview-shell{width:210mm;box-sizing:border-box;margin:0}.resume-preview-page-break{display:none!important}.cv-section-toolbar,.cv-photo-menu-btn{display:none!important}</style></head><body>${node.outerHTML}</body></html>`)
  printWindow.document.close()
  await new Promise((resolve) => setTimeout(resolve, 900))
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}

function openSignatureDialog() {
  signatureDialogOpen.value = true
  nextTick(initCanvas)
}

function initCanvas() {
  const canvas = signatureCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = canvas.clientWidth || 680
  canvas.height = 200
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  let drawing = false
  const pointer = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }
  canvas.onpointerdown = (event) => {
    drawing = true
    const point = pointer(event)
    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }
  canvas.onpointermove = (event) => {
    if (!drawing) return
    const point = pointer(event)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
  }
  canvas.onpointerup = () => {
    drawing = false
    signatureDataUrl.value = canvas.toDataURL('image/png')
  }
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

watch(activeTemplate, (template) => {
  editableDecorObjects.value = ((template as any)?.decor?.objects || []).map((obj: any) => normalizeDecorObject(obj))
  const raw = (template as any)?.sectionBar || {}
  sectionBarConfig.show = raw.show !== false
  sectionBarConfig.widthType = raw.width === 'complete' ? 'complete' : 'flex'
  sectionBarConfig.height = Number(raw.height ?? 3)
  sectionBarConfig.radius = Number(raw.radius ?? raw.raduis ?? 999)
}, { immediate: true })
</script>

<template>
  <div>
    <input ref="photoFileInput" type="file" accept="image/*" class="d-none" @change="onPhotoSelected">
    <AppPageDrawers>
      <template #left>
        <v-card-text>
          <p class="text-body-2" >Aside width</p>
          <v-slider v-model="asideWidth" :min="240" :max="1200" :step="2" hide-details class="mb-2"/>
          <p class="text-body-2" >Aside height</p>
          <v-slider v-model="asideHeight" :min="120" :max="2600" :step="2" hide-details class="mb-2"/>
          <p class="text-body-2" >Aside radius</p>
          <v-slider v-model="asideRadius" :min="0" :max="90" :step="1" hide-details/>
          <p class="text-body-2" >Bar heighth</p>
          <v-slider v-model="sectionBarConfig.height" :min="1" :max="18" :step="1" hide-details class="mt-2"/>
          <p class="text-body-2" >Bar radius</p>
          <v-slider v-model="sectionBarConfig.radius" :min="0" :max="999" :step="1" hide-details class="mt-2"/>
        </v-card-text>
      </template>

      <template #right>
        <v-btn class="mt-3" size="small" variant="outlined" @click="addDecorObject">Add decor</v-btn>
        <v-switch v-model="sectionBarConfig.show" label="Section bar" hide-details inset />
        <AppSelect v-model="sectionBarConfig.widthType" :items="[{title:'Flex', value:'flex'},{title:'Complet', value:'complete'}]" label="Bar width mode" hide-details class="mt-2"/>
        <div class="mt-3 d-flex flex-column ga-2">
          <v-menu
            v-for="(obj,i) in editableDecorObjects"
            :key="`obj-${i}`"
            :model-value="decorMenuOpenIndex === i"
            :close-on-content-click="false"
            location="left start"
            @update:model-value="(isOpen) => { decorMenuOpenIndex = isOpen ? i : (decorMenuOpenIndex === i ? null : decorMenuOpenIndex) }"
          >
            <template #activator="{ props }">
              <v-btn v-bind="props" size="small" variant="tonal" class="justify-space-between" block>
                Decor {{ i + 1 }} · {{ obj.type }}
              </v-btn>
            </template>
            <v-card class="pa-3" min-width="260" @click.stop>
              <AppSelect v-model="obj.type" :items="decorShapeOptions.map((s)=>({title:s,value:s}))" label="Type" hide-details/>
              <p class="text-caption mt-3 mb-1">Color</p>
              <div class="d-flex flex-wrap ga-2">
                <v-btn
                  v-for="color in decorColorOptions"
                  :key="`decor-color-${i}-${color}`"
                  icon
                  size="x-small"
                  :style="{ backgroundColor: color, border: obj.color === color ? '2px solid #111827' : '1px solid #cbd5e1' }"
                  @click="obj.color = color"
                />
              </div>
              <v-slider v-model="obj.size" label="Size" :min="20" :max="420" :step="2" hide-details class="mt-3"/>
              <v-slider v-model="obj.opacity" label="Opacity" :min="0.02" :max="0.35" :step="0.01" hide-details class="mt-3"/>
              <v-slider v-model="obj.x" label="X slider" :min="0" :max="100" :step="1" hide-details class="mt-3"/>
              <v-slider v-model="obj.y" label="Y slider" :min="0" :max="100" :step="1" hide-details class="mt-3"/>
              <v-btn size="x-small" color="error" variant="text" class="mt-2" @click="removeDecorObject(i)">remove</v-btn>
            </v-card>
          </v-menu>
        </div>
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <ResumePreviewToolbar
        v-model:menu-open="layoutMenuOpen"
      v-model:palette-menu-open="paletteMenuOpen"
      :palettes="palettePresetOptions"
      :selected-palette="selectedPalette"
      :palette-columns="5"
        :templates="GENERATED_RESUME_TEMPLATES"
        :selected-template="selectedTemplate"
        :get-template-image="(template) => `/img/cv/generated/${template.id}.png`"
        template-key-prefix="cv-preview"
        @save="saveFromPreview"
        @ai="goToCreateResume"
        @signature="openSignatureDialog"
        @pdf="downloadPdf"
        @select-template="applyPreviewTemplate"
      @select-palette="selectedPalette = $event"
      />

      <div class="py-8">
        <div
          ref="cvPreviewRef"
          class="cv-preview-shell"
          :style="{
            '--cv-preview-page-height': `${CV_PREVIEW_PDF_PAGE_HEIGHT}px`,
            '--cv-preview-total-height': `${cvPreviewHeight}px`,
          }"
        >
          <div v-for="(obj,index) in editableDecorObjects" :key="`decor-${index}`" class="decor-object" :class="`decor-${obj.type}`" :style="decorObjectStyle(obj)"/>
          <component :is="activeLayoutComponent" class="w-100 cv-preview-page" :style="{ background: activeColors?.pageBackground || '#ffffff', height: 'auto', minHeight: `${cvPreviewHeight}px`, overflow: 'visible', '--cv-primary': activeColors?.primary || '#1d4ed8', '--cv-secondary': activeColors?.secondary || '#93C5FD', '--cv-aside-width': `${asideWidth}px`, '--cv-aside-height': `${asideHeight}px`, '--cv-aside-radius': `${asideRadius}px`, '--cv-text-fullname': textFontPreset('fullName'), '--cv-text-section-label': textFontPreset('sectionLabel'), '--cv-text-entry-title': textFontPreset('entryTitle'), '--cv-text-body': textFontPreset('body'), '--cv-header-text': headerTextColor, '--cv-header-muted': headerMutedColor, '--cv-section-bar-height': `${sectionBarConfig.height}px`, '--cv-section-bar-radius': `${sectionBarConfig.radius}px`, '--cv-section-bar-display': sectionBarConfig.show ? 'block' : 'none', '--cv-section-title-width': sectionBarConfig.widthType === 'complete' ? '100%' : 'fit-content', '--cv-section-bar-width': sectionBarConfig.widthType === 'complete' ? '100%' : 'calc(100% + 18px)' }">
          <template #header>
            <div class="cv-header-layout" :class="`cv-header-layout--${headerType}`">
              <template v-if="headerType === 'header-left'">
                <div class="cv-header-contact cv-col-8">
                  <div class="cv-header-contact-grid">
                    <div v-for="(item, idx) in headerProfile.contact" :key="`left-${idx}`" class="cv-contact-item">
                      <v-icon :icon="item.icon" size="16" />
                      <HoverRichTextEditor
                        class="cv-header-editor cv-header-editor--contact"
                        :model-value="item.value"
                        :placeholder="item.label || 'Contact'"
                        font-size="13px"
                        font-weight="500"
                        :font-family="textFontPreset('body')"
                        color="inherit"
                        @update:model-value="updateHeaderField(item.key, $event)"
                      />
                    </div>
                  </div>
                </div>
                <div class="cv-header-identity cv-col-4">
                  <div class="cv-photo-wrap"><img :src="photoPreview || headerProfile.image" alt="profile" class="cv-header-avatar" :style="{ width: `${photoSize}px`, height: `${photoSize}px`, borderRadius: `${photoRadius}px`, border: `${photoBorderWidth}px solid ${photoBorderColor}` }" @click="openPhotoPicker"><v-menu v-model="photoMenuOpen" location="right start" :close-on-content-click="false"><template #activator="{ props }"><v-btn icon="mdi-dots-vertical" size="x-small" class="cv-photo-menu-btn" v-bind="props" @click.stop/></template><v-card class="pa-3" min-width="220"><v-slider v-model="photoSize" label="Size" :min="48" :max="180" :step="2" hide-details class="mb-2"/><v-slider v-model="photoRadius" label="Radius" :min="0" :max="999" :step="1" hide-details class="mb-2"/><v-slider v-model="photoBorderWidth" label="Border" :min="0" :max="12" :step="1" hide-details class="mb-2"/><div class="cv-color-grid"><button v-for="c in photoColors" :key="c" class="cv-color-dot" :style="{background:c}" @click="photoBorderColor=c"/></div></v-card></v-menu></div>
                  <HoverRichTextEditor
                    class="cv-header-editor cv-header-editor--name"
                    :model-value="headerProfile.fullName"
                    placeholder="Full name"
                    font-size="22px"
                    font-weight="700"
                    :font-family="textFontPreset('fullName')"
                    color="inherit"
                    @update:model-value="updateHeaderField('fullName', $event)"
                  />
                  <HoverRichTextEditor
                    class="cv-header-editor cv-header-editor--role"
                    :model-value="headerProfile.role"
                    placeholder="Role"
                    font-size="14px"
                    font-weight="500"
                    :font-family="textFontPreset('body')"
                    color="inherit"
                    @update:model-value="updateHeaderField('role', $event)"
                  />
                </div>
              </template>
              <template v-else-if="headerType === 'header-right'">
                <div class="cv-header-identity cv-col-4">
                  <div class="cv-photo-wrap"><img :src="photoPreview || headerProfile.image" alt="profile" class="cv-header-avatar" :style="{ width: `${photoSize}px`, height: `${photoSize}px`, borderRadius: `${photoRadius}px`, border: `${photoBorderWidth}px solid ${photoBorderColor}` }" @click="openPhotoPicker"><v-menu v-model="photoMenuOpen" location="right start" :close-on-content-click="false"><template #activator="{ props }"><v-btn icon="mdi-dots-vertical" size="x-small" class="cv-photo-menu-btn" v-bind="props" @click.stop/></template><v-card class="pa-3" min-width="220"><v-slider v-model="photoSize" label="Size" :min="48" :max="180" :step="2" hide-details class="mb-2"/><v-slider v-model="photoRadius" label="Radius" :min="0" :max="999" :step="1" hide-details class="mb-2"/><v-slider v-model="photoBorderWidth" label="Border" :min="0" :max="12" :step="1" hide-details class="mb-2"/><div class="cv-color-grid"><button v-for="c in photoColors" :key="c" class="cv-color-dot" :style="{background:c}" @click="photoBorderColor=c"/></div></v-card></v-menu></div>
                  <HoverRichTextEditor
                    class="cv-header-editor cv-header-editor--name"
                    :model-value="headerProfile.fullName"
                    placeholder="Full name"
                    font-size="22px"
                    font-weight="700"
                    :font-family="textFontPreset('fullName')"
                    color="inherit"
                    @update:model-value="updateHeaderField('fullName', $event)"
                  />
                  <HoverRichTextEditor
                    class="cv-header-editor cv-header-editor--role"
                    :model-value="headerProfile.role"
                    placeholder="Role"
                    font-size="14px"
                    font-weight="500"
                    :font-family="textFontPreset('body')"
                    color="inherit"
                    @update:model-value="updateHeaderField('role', $event)"
                  />
                </div>
                <div class="cv-header-contact cv-col-8">
                  <div class="cv-header-contact-grid">
                    <div v-for="(item, idx) in headerProfile.contact" :key="`right-${idx}`" class="cv-contact-item">
                      <v-icon :icon="item.icon" size="16" />
                      <HoverRichTextEditor
                        class="cv-header-editor cv-header-editor--contact"
                        :model-value="item.value"
                        :placeholder="item.label || 'Contact'"
                        font-size="13px"
                        font-weight="500"
                        :font-family="textFontPreset('body')"
                        color="inherit"
                        @update:model-value="updateHeaderField(item.key, $event)"
                      />
                    </div>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="cv-col-6 cv-header-split-left">
                  <div class="cv-col-3">
                    <div class="cv-photo-wrap"><img :src="photoPreview || headerProfile.image" alt="profile" class="cv-header-avatar" :style="{ width: `${photoSize}px`, height: `${photoSize}px`, borderRadius: `${photoRadius}px`, border: `${photoBorderWidth}px solid ${photoBorderColor}` }" @click="openPhotoPicker"><v-menu v-model="photoMenuOpen" location="right start" :close-on-content-click="false"><template #activator="{ props }"><v-btn icon="mdi-dots-vertical" size="x-small" class="cv-photo-menu-btn" v-bind="props" @click.stop/></template><v-card class="pa-3" min-width="220"><v-slider v-model="photoSize" label="Size" :min="48" :max="180" :step="2" hide-details class="mb-2"/><v-slider v-model="photoRadius" label="Radius" :min="0" :max="999" :step="1" hide-details class="mb-2"/><v-slider v-model="photoBorderWidth" label="Border" :min="0" :max="12" :step="1" hide-details class="mb-2"/><div class="cv-color-grid"><button v-for="c in photoColors" :key="c" class="cv-color-dot" :style="{background:c}" @click="photoBorderColor=c"/></div></v-card></v-menu></div>
                  </div>
                  <div class="cv-col-3 cv-header-identity cv-header-identity--split">
                    <HoverRichTextEditor
                      class="cv-header-editor cv-header-editor--name"
                      :model-value="headerProfile.fullName"
                      placeholder="Full name"
                      font-size="22px"
                      font-weight="700"
                      :font-family="textFontPreset('fullName')"
                      color="inherit"
                      @update:model-value="updateHeaderField('fullName', $event)"
                    />
                    <HoverRichTextEditor
                      class="cv-header-editor cv-header-editor--role"
                      :model-value="headerProfile.role"
                      placeholder="Role"
                      font-size="14px"
                      font-weight="500"
                      :font-family="textFontPreset('body')"
                      color="inherit"
                      @update:model-value="updateHeaderField('role', $event)"
                    />
                  </div>
                </div>
                <div class="cv-col-6 cv-header-contact">
                  <div class="cv-header-contact-grid">
                    <div v-for="(item, idx) in headerProfile.contact" :key="`split-${idx}`" class="cv-contact-item">
                      <v-icon :icon="item.icon" size="16" />
                      <HoverRichTextEditor
                        class="cv-header-editor cv-header-editor--contact"
                        :model-value="item.value"
                        :placeholder="item.label || 'Contact'"
                        font-size="13px"
                        font-weight="500"
                        :font-family="textFontPreset('body')"
                        color="inherit"
                        @update:model-value="updateHeaderField(item.key, $event)"
                      />
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </template>
          <template #aside>
            <div v-if="isSideContentLayout && activeTemplate?.structure === 'structure-1'" :class="['cv-aside-sections', { 'cv-aside-sections--full': ['aside-full-left', 'aside-full-right'].includes(String(activeTemplate?.layout || '')) }]">
              <div v-for="section in visibleOrderedSections('asideOne', structureAsideOneSections, 'asideOne')" :key="`aside-s1-${section}`" class="cv-aside-section-item" :style="sectionOffsetStyle('asideOne', section)" draggable="true" @dragstart="onSectionDragStart('asideOne', section)" @dragover.prevent @drop="onSectionDrop('asideOne', section)" @dragend="onSectionDragEnd">
                <div class="cv-section-toolbar"><AppSelect v-model="sectionTypeOverrides[toSectionKey(section)]" :items="getSectionVariantOptions(toSectionKey(section))" item-title="title" item-value="value" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-shape-outline" class="cv-variant-select" /><v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="addSectionItem(toSectionKey(section))"/><v-btn icon="mdi-minus" size="x-small" variant="text" @click.stop="hideSection(toSectionKey(section)); hideSectionInZone('asideOne', toSectionKey(section))"/><v-btn icon="mdi-arrow-up" size="x-small" variant="text" @click.stop="shiftSectionByLine('asideOne', section, 'up')"/><v-btn icon="mdi-arrow-down" size="x-small" variant="text" @click.stop="shiftSectionByLine('asideOne', section, 'down')"/><v-btn icon="mdi-drag" size="x-small" variant="text" @click.stop="moveSection('asideOne', section, 'down')"/></div><strong class="cv-section-title"><v-icon :icon="sectionIconMap[toSectionKey(section)] || 'mdi-circle-small'" size="16" class="mr-1" /><HoverRichTextEditor class="cv-section-title-editor" :model-value="sectionDisplayTitle(section)" font-size="13px" font-weight="700" :font-family="textFontPreset('sectionLabel')" color="inherit" @update:model-value="updateSectionDisplayTitle(section, $event)" /></strong>
                <CvEditableSectionContent :section-key="toSectionKey(section)" :variant="effectiveSectionType(toSectionKey(section), sectionType(toSectionKey(section) as any))" :items="getEditableSectionItems(section)" @update-item="(index, value) => updateEditableSectionItem(section, index, value)" />
              </div>
            </div>
            <div v-else-if="isSideContentLayout && activeTemplate?.structure === 'structure-2'" :class="['cv-aside-sections', { 'cv-aside-sections--full': ['aside-full-left', 'aside-full-right'].includes(String(activeTemplate?.layout || '')) }]">
              <div v-for="section in visibleOrderedSections('asideTwo', structureAsideTwoSections, 'asideTwo')" :key="`aside-s2-${section}`" class="cv-aside-section-item" :style="sectionOffsetStyle('asideTwo', section)" draggable="true" @dragstart="onSectionDragStart('asideTwo', section)" @dragover.prevent @drop="onSectionDrop('asideTwo', section)" @dragend="onSectionDragEnd">
                <div class="cv-section-toolbar"><AppSelect v-model="sectionTypeOverrides[toSectionKey(section)]" :items="getSectionVariantOptions(toSectionKey(section))" item-title="title" item-value="value" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-shape-outline" class="cv-variant-select" /><v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="addSectionItem(toSectionKey(section))"/><v-btn icon="mdi-minus" size="x-small" variant="text" @click.stop="hideSection(toSectionKey(section)); hideSectionInZone('asideTwo', toSectionKey(section))"/><v-btn icon="mdi-arrow-up" size="x-small" variant="text" @click.stop="shiftSectionByLine('asideTwo', section, 'up')"/><v-btn icon="mdi-arrow-down" size="x-small" variant="text" @click.stop="shiftSectionByLine('asideTwo', section, 'down')"/><v-btn icon="mdi-drag" size="x-small" variant="text" @click.stop="moveSection('asideTwo', section, 'down')"/></div><strong class="cv-section-title"><v-icon :icon="sectionIconMap[toSectionKey(section)] || 'mdi-circle-small'" size="16" class="mr-1" /><HoverRichTextEditor class="cv-section-title-editor" :model-value="sectionDisplayTitle(section)" font-size="13px" font-weight="700" :font-family="textFontPreset('sectionLabel')" color="inherit" @update:model-value="updateSectionDisplayTitle(section, $event)" /></strong>
                <CvEditableSectionContent :section-key="toSectionKey(section)" :variant="effectiveSectionType(toSectionKey(section), sectionType(toSectionKey(section) as any))" :items="getEditableSectionItems(section)" @update-item="(index, value) => updateEditableSectionItem(section, index, value)" />
              </div>
            </div>
          </template>

          <template #content>
            <div v-if="isSideContentLayout && activeTemplate?.structure === 'structure-1'" class="cv-sections-list">
              <div v-for="section in visibleOrderedSections('contentBase', structureContentBaseSections)" :key="`content-base-${section}`" class="cv-section-row" :style="sectionOffsetStyle('contentBase', section)" draggable="true" @dragstart="onSectionDragStart('contentBase', section)" @dragover.prevent @drop="onSectionDrop('contentBase', section)" @dragend="onSectionDragEnd"><div class="cv-section-toolbar"><AppSelect v-model="sectionTypeOverrides[toSectionKey(section)]" :items="getSectionVariantOptions(toSectionKey(section))" item-title="title" item-value="value" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-shape-outline" class="cv-variant-select" /><v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="addSectionItem(toSectionKey(section))"/><v-btn icon="mdi-minus" size="x-small" variant="text" @click.stop="hideSection(toSectionKey(section))"/><v-btn icon="mdi-arrow-up" size="x-small" variant="text" @click.stop="shiftSectionByLine('contentBase', section, 'up')"/><v-btn icon="mdi-arrow-down" size="x-small" variant="text" @click.stop="shiftSectionByLine('contentBase', section, 'down')"/><v-btn icon="mdi-drag" size="x-small" variant="text" @click.stop="moveSection('contentBase', section, 'down')"/></div><strong class="cv-section-title"><v-icon :icon="sectionIconMap[toSectionKey(section)] || 'mdi-circle-small'" size="16" class="mr-1" /><HoverRichTextEditor class="cv-section-title-editor" :model-value="sectionDisplayTitle(section)" font-size="13px" font-weight="700" :font-family="textFontPreset('sectionLabel')" color="inherit" @update:model-value="updateSectionDisplayTitle(section, $event)" /></strong><CvEditableSectionContent :section-key="toSectionKey(section)" :variant="effectiveSectionType(toSectionKey(section), sectionType(toSectionKey(section) as any))" :items="getEditableSectionItems(section)" @update-item="(index, value) => updateEditableSectionItem(section, index, value)" /></div>
            </div>
            <div v-else-if="isSideContentLayout && activeTemplate?.structure === 'structure-2'" class="cv-sections-structure-2">
              <div v-for="section in visibleOrderedSections('contentStructure2', [...structureContentBaseSections, 'Skills'])" :key="`content-s2-${section}`" class="cv-section-row" :style="sectionOffsetStyle('contentStructure2', section)" draggable="true" @dragstart="onSectionDragStart('contentStructure2', section)" @dragover.prevent @drop="onSectionDrop('contentStructure2', section)" @dragend="onSectionDragEnd"><div class="cv-section-toolbar"><AppSelect v-model="sectionTypeOverrides[toSectionKey(section)]" :items="getSectionVariantOptions(toSectionKey(section))" item-title="title" item-value="value" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-shape-outline" class="cv-variant-select" /><v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="addSectionItem(toSectionKey(section))"/><v-btn icon="mdi-minus" size="x-small" variant="text" @click.stop="hideSection(toSectionKey(section))"/><v-btn icon="mdi-arrow-up" size="x-small" variant="text" @click.stop="shiftSectionByLine('contentStructure2', section, 'up')"/><v-btn icon="mdi-arrow-down" size="x-small" variant="text" @click.stop="shiftSectionByLine('contentStructure2', section, 'down')"/><v-btn icon="mdi-drag" size="x-small" variant="text" @click.stop="moveSection('contentStructure2', section, 'down')"/></div><strong class="cv-section-title"><v-icon :icon="sectionIconMap[toSectionKey(section)] || 'mdi-circle-small'" size="16" class="mr-1" /><HoverRichTextEditor class="cv-section-title-editor" :model-value="sectionDisplayTitle(section)" font-size="13px" font-weight="700" :font-family="textFontPreset('sectionLabel')" color="inherit" @update:model-value="updateSectionDisplayTitle(section, $event)" /></strong><CvEditableSectionContent :section-key="toSectionKey(section)" :variant="effectiveSectionType(toSectionKey(section), sectionType(toSectionKey(section) as any))" :items="getEditableSectionItems(section)" @update-item="(index, value) => updateEditableSectionItem(section, index, value)" /></div>
            </div>
            <div v-else-if="isMainStructureLayout && activeTemplate?.structure === 'structure-1'" class="cv-sections-list">
              <div v-for="section in visibleOrderedSections('mainOne', structureOneSections)" :key="`s1-${section}`" class="cv-section-row" :style="sectionOffsetStyle('mainOne', section)" draggable="true" @dragstart="onSectionDragStart('mainOne', section)" @dragover.prevent @drop="onSectionDrop('mainOne', section)" @dragend="onSectionDragEnd"><div class="cv-section-toolbar"><AppSelect v-model="sectionTypeOverrides[toSectionKey(section)]" :items="getSectionVariantOptions(toSectionKey(section))" item-title="title" item-value="value" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-shape-outline" class="cv-variant-select" /><v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="addSectionItem(toSectionKey(section))"/><v-btn icon="mdi-minus" size="x-small" variant="text" @click.stop="hideSection(toSectionKey(section))"/><v-btn icon="mdi-arrow-up" size="x-small" variant="text" @click.stop="shiftSectionByLine('mainOne', section, 'up')"/><v-btn icon="mdi-arrow-down" size="x-small" variant="text" @click.stop="shiftSectionByLine('mainOne', section, 'down')"/><v-btn icon="mdi-drag" size="x-small" variant="text" @click.stop="moveSection('mainOne', section, 'down')"/></div><strong class="cv-section-title"><v-icon :icon="sectionIconMap[toSectionKey(section)] || 'mdi-circle-small'" size="16" class="mr-1" /><HoverRichTextEditor class="cv-section-title-editor" :model-value="sectionDisplayTitle(section)" font-size="13px" font-weight="700" :font-family="textFontPreset('sectionLabel')" color="inherit" @update:model-value="updateSectionDisplayTitle(section, $event)" /></strong><CvEditableSectionContent :section-key="toSectionKey(section)" :variant="effectiveSectionType(toSectionKey(section), sectionType(toSectionKey(section) as any))" :items="getEditableSectionItems(section)" @update-item="(index, value) => updateEditableSectionItem(section, index, value)" /></div>
            </div>
            <div v-else-if="isMainStructureLayout && activeTemplate?.structure === 'structure-2'" class="cv-sections-structure-2">
              <div v-for="section in visibleOrderedSections('mainTwoTop', structureTwoTopSections)" :key="`s2-top-${section}`" class="cv-section-row" :style="sectionOffsetStyle('mainTwoTop', section)" draggable="true" @dragstart="onSectionDragStart('mainTwoTop', section)" @dragover.prevent @drop="onSectionDrop('mainTwoTop', section)" @dragend="onSectionDragEnd"><div class="cv-section-toolbar"><AppSelect v-model="sectionTypeOverrides[toSectionKey(section)]" :items="getSectionVariantOptions(toSectionKey(section))" item-title="title" item-value="value" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-shape-outline" class="cv-variant-select" /><v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="addSectionItem(toSectionKey(section))"/><v-btn icon="mdi-minus" size="x-small" variant="text" @click.stop="hideSection(toSectionKey(section))"/><v-btn icon="mdi-arrow-up" size="x-small" variant="text" @click.stop="shiftSectionByLine('mainTwoTop', section, 'up')"/><v-btn icon="mdi-arrow-down" size="x-small" variant="text" @click.stop="shiftSectionByLine('mainTwoTop', section, 'down')"/><v-btn icon="mdi-drag" size="x-small" variant="text" @click.stop="moveSection('mainTwoTop', section, 'down')"/></div><strong class="cv-section-title"><v-icon :icon="sectionIconMap[toSectionKey(section)] || 'mdi-circle-small'" size="16" class="mr-1" /><HoverRichTextEditor class="cv-section-title-editor" :model-value="sectionDisplayTitle(section)" font-size="13px" font-weight="700" :font-family="textFontPreset('sectionLabel')" color="inherit" @update:model-value="updateSectionDisplayTitle(section, $event)" /></strong><CvEditableSectionContent :section-key="toSectionKey(section)" :variant="effectiveSectionType(toSectionKey(section), sectionType(toSectionKey(section) as any))" :items="getEditableSectionItems(section)" @update-item="(index, value) => updateEditableSectionItem(section, index, value)" /></div>
              <v-row class="mt-1" dense>
                <v-col cols="6">
                  <div v-for="section in visibleOrderedSections('mainTwoLeft', structureTwoLeftSections)" :key="`s2-left-${section}`" class="cv-section-row" :style="sectionOffsetStyle('mainTwoLeft', section)" draggable="true" @dragstart="onSectionDragStart('mainTwoLeft', section)" @dragover.prevent @drop="onSectionDrop('mainTwoLeft', section)" @dragend="onSectionDragEnd"><div class="cv-section-toolbar"><AppSelect v-model="sectionTypeOverrides[toSectionKey(section)]" :items="getSectionVariantOptions(toSectionKey(section))" item-title="title" item-value="value" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-shape-outline" class="cv-variant-select" /><v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="addSectionItem(toSectionKey(section))"/><v-btn icon="mdi-minus" size="x-small" variant="text" @click.stop="hideSection(toSectionKey(section))"/><v-btn icon="mdi-arrow-up" size="x-small" variant="text" @click.stop="shiftSectionByLine('mainTwoLeft', section, 'up')"/><v-btn icon="mdi-arrow-down" size="x-small" variant="text" @click.stop="shiftSectionByLine('mainTwoLeft', section, 'down')"/><v-btn icon="mdi-drag" size="x-small" variant="text" @click.stop="moveSection('mainTwoLeft', section, 'down')"/></div><strong class="cv-section-title"><v-icon :icon="sectionIconMap[toSectionKey(section)] || 'mdi-circle-small'" size="16" class="mr-1" /><HoverRichTextEditor class="cv-section-title-editor" :model-value="sectionDisplayTitle(section)" font-size="13px" font-weight="700" :font-family="textFontPreset('sectionLabel')" color="inherit" @update:model-value="updateSectionDisplayTitle(section, $event)" /></strong><CvEditableSectionContent :section-key="toSectionKey(section)" :variant="effectiveSectionType(toSectionKey(section), sectionType(toSectionKey(section) as any))" :items="getEditableSectionItems(section)" @update-item="(index, value) => updateEditableSectionItem(section, index, value)" /></div>
                </v-col>
                <v-col cols="6">
                  <div v-for="section in visibleOrderedSections('mainTwoRight', structureTwoRightSections)" :key="`s2-right-${section}`" class="cv-section-row" :style="sectionOffsetStyle('mainTwoRight', section)" draggable="true" @dragstart="onSectionDragStart('mainTwoRight', section)" @dragover.prevent @drop="onSectionDrop('mainTwoRight', section)" @dragend="onSectionDragEnd"><div class="cv-section-toolbar"><AppSelect v-model="sectionTypeOverrides[toSectionKey(section)]" :items="getSectionVariantOptions(toSectionKey(section))" item-title="title" item-value="value" density="compact" variant="outlined" hide-details prepend-inner-icon="mdi-shape-outline" class="cv-variant-select" /><v-btn icon="mdi-plus" size="x-small" variant="text" @click.stop="addSectionItem(toSectionKey(section))"/><v-btn icon="mdi-minus" size="x-small" variant="text" @click.stop="hideSection(toSectionKey(section))"/><v-btn icon="mdi-arrow-up" size="x-small" variant="text" @click.stop="shiftSectionByLine('mainTwoRight', section, 'up')"/><v-btn icon="mdi-arrow-down" size="x-small" variant="text" @click.stop="shiftSectionByLine('mainTwoRight', section, 'down')"/><v-btn icon="mdi-drag" size="x-small" variant="text" @click.stop="moveSection('mainTwoRight', section, 'down')"/></div><strong class="cv-section-title"><v-icon :icon="sectionIconMap[toSectionKey(section)] || 'mdi-circle-small'" size="16" class="mr-1" /><HoverRichTextEditor class="cv-section-title-editor" :model-value="sectionDisplayTitle(section)" font-size="13px" font-weight="700" :font-family="textFontPreset('sectionLabel')" color="inherit" @update:model-value="updateSectionDisplayTitle(section, $event)" /></strong><CvEditableSectionContent :section-key="toSectionKey(section)" :variant="effectiveSectionType(toSectionKey(section), sectionType(toSectionKey(section) as any))" :items="getEditableSectionItems(section)" @update-item="(index, value) => updateEditableSectionItem(section, index, value)" /></div>
                </v-col>
              </v-row>
            </div>
            <div v-else class="empty-state">
              <p class="text-medium-emphasis">Aucune section CV affichée pour le moment.</p>
            </div>
            <footer v-if="signatureDataUrl" class="signature-footer">
              <img :src="signatureDataUrl" alt="signature" class="signature-image">
            </footer>
          </template>
          </component>
          <ResumePreviewPageBreak
            v-for="pageBreak in cvPreviewPageBreaks"
            :key="`cv-page-break-${pageBreak}`"
            :page-number="pageBreak"
            :top="pageBreak * CV_PREVIEW_PDF_PAGE_HEIGHT"
          />
        </div>
      </div>
    </v-container>

    <v-dialog v-model="signatureDialogOpen" max-width="760">
      <v-card>
        <v-card-title>Signature</v-card-title>
        <v-card-text>
          <canvas ref="signatureCanvas" class="signature-canvas" />
        </v-card-text>
      </v-card>
    </v-dialog>

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

.cv-header-editor,
.cv-section-title-editor {
  position: relative;
  min-width: 0;
  color: inherit;
}

.cv-header-editor :deep(.hover-editor__content p),
.cv-section-title-editor :deep(.hover-editor__content p) {
  margin: 0;
}

.cv-header-editor :deep(.hover-editor__toolbar),
.cv-section-title-editor :deep(.hover-editor__toolbar) {
  position: absolute;
  top: auto;
  bottom: calc(100% - 1px);
  left: 0;
  z-index: 2400;
  width: max-content;
  max-width: min(560px, 92vw);
  margin-bottom: 0;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 14%, transparent);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
}

.cv-preview-shell :deep(.hover-editor__toolbar),
.cv-preview-shell :deep(.hover-editor__popover) {
  z-index: 2400 !important;
}

.cv-header-editor :deep(.toolbar-size),
.cv-section-title-editor :deep(.toolbar-size) {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border-color: color-mix(in srgb, rgb(var(--v-theme-on-surface)) 22%, transparent);
}

.cv-header-editor :deep(.v-btn),
.cv-section-title-editor :deep(.v-btn) {
  color: rgb(var(--v-theme-on-surface));
}

.cv-header-editor--contact {
  flex: 1 1 auto;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.cv-section-title {
  display: flex !important;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.cv-section-title-editor {
  display: inline-block;
  max-width: 100%;
}

.cv-preview-shell {
  position: relative;
  min-height: var(--cv-preview-total-height, 1100px);
}

.cv-preview-page {
  height: auto !important;
  min-height: var(--cv-preview-total-height, 1100px) !important;
  overflow: visible !important;
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

.cv-aside-section-item > strong{display:block;margin-bottom:6px;padding-right:0}
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
.cv-section-row > strong{display:block;margin-bottom:6px;padding-right:0}
.cv-section-toolbar {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  width: max-content;
  max-width: calc(100% - 8px);
  padding: 4px;
  opacity: 0;
  pointer-events: none;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 14%, transparent);
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
  transform: translateY(-2px);
  transition: opacity .15s ease, transform .15s ease;
}
.cv-section-row:hover .cv-section-toolbar,
.cv-aside-section-item:hover .cv-section-toolbar,
.cv-section-toolbar:focus-within {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
.cv-section-toolbar :deep(.v-field) {
  min-height: 26px;
  height: 26px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border-radius: 8px;
}
.cv-section-toolbar :deep(.v-field__outline),
.cv-section-toolbar :deep(.v-field__overlay) {
  color: color-mix(in srgb, rgb(var(--v-theme-on-surface)) 22%, transparent);
}

.signature-footer {
  margin-top: 32px;
}

.signature-image {
  height: 68px;
  object-fit: contain;
}

.signature-canvas {
  width: 100%;
  height: 200px;
  border: 1px solid rgba(0, 0, 0, .15);
  border-radius: 10px;
}

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
.cv-section-row > strong,
.cv-aside-section-item > strong {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  width: var(--cv-section-title-width, fit-content);
  margin-bottom: calc(var(--cv-section-bar-height, 3px) + 8px);
}
.cv-section-row > strong::after,
.cv-aside-section-item > strong::after {
  content: '';
  display: var(--cv-section-bar-display, block);
  width: var(--cv-section-bar-width, 44px);
  height: var(--cv-section-bar-height, 3px);
  border-radius: var(--cv-section-bar-radius, 999px);
  position: absolute;
  left: 0;
  top: calc(100% + 6px);
  background: var(--cv-primary, #1d4ed8);
}
.palette-dot { width: 16px; height: 16px; border-radius: 50%; border: 1px solid rgb(var(--v-theme-on-surface), 0.2); }


.cv-section-toolbar :deep(.v-btn) {
  min-width: 26px !important;
  width: 26px;
  height: 26px;
  padding: 0;
  color: rgb(var(--v-theme-on-surface));
  border-radius: 8px;
}
.cv-section-toolbar :deep(.v-btn:hover) {
  background: color-mix(in srgb, rgb(var(--v-theme-on-surface)) 10%, transparent);
}
.cv-variant-select {
  width: 76px;
  min-width: 76px;
  max-width: 76px;
}
.cv-variant-select :deep(.v-field__input) {
  min-height: 26px;
  padding: 0 4px;
  font-size: 11px;
  color: rgb(var(--v-theme-on-surface));
}
.cv-variant-select :deep(.v-field__prepend-inner) {
  display: none;
}
.cv-variant-select :deep(.v-field__append-inner) {
  padding-inline-start: 0;
  color: rgb(var(--v-theme-on-surface));
}
.cv-header-identity span{font-size:12px;opacity:.95;color:var(--cv-header-muted,#334155)}
.decor-object{position:absolute;pointer-events:none;background:color-mix(in srgb,var(--cv-primary,#1d4ed8) 35%,transparent);transform:translate(-50%,-50%);z-index:0}
.decor-circle{border-radius:999px}.decor-ring{border-radius:999px;background:transparent;border:3px solid color-mix(in srgb,var(--cv-secondary,#93C5FD) 55%,transparent)}.decor-blob{border-radius:40% 60% 55% 45% / 50% 35% 65% 50%}.decor-square{border-radius:10px}.decor-diamond{border-radius:8px;transform:translate(-50%,-50%) rotate(45deg)}.decor-star{-webkit-clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}.decor-triangle{-webkit-clip-path:polygon(50% 0%,0 100%,100% 100%);clip-path:polygon(50% 0%,0 100%,100% 100%)}.decor-pill{border-radius:999px}.decor-bar{border-radius:999px}

</style>
