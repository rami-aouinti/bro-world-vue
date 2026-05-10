<script setup lang="ts">
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-20-resume.json'
import {
  getGeneratedTemplateDesign,
  getGeneratedTemplateFakeData,
} from '~/utils/generatedTemplateNormalizer'
import PALETTE_PRESETS from '~/data/resume-templates/palettes.json'
import {
  applyReadablePageTextColors,
  readableMutedColorForBackground,
  readableTextColorForBackground,
} from '~/utils/resumeColorContrast'
import { buildToolbarPaletteOptions } from '~/modules/resume/theme/paletteOptions'
import CvLayoutAside from '~/components/cv/layouts/CvLayoutAside.vue'
import CvLayoutNoAside from '~/components/cv/layouts/CvLayoutNoAside.vue'
import CvLayoutAsideLeft from '~/components/cv/layouts/CvLayoutAsideLeft.vue'
import CvLayoutAsideRight from '~/components/cv/layouts/CvLayoutAsideRight.vue'
import CvLayoutAsideFullLeft from '~/components/cv/layouts/CvLayoutAsideFullLeft.vue'
import CvLayoutAsideFullRight from '~/components/cv/layouts/CvLayoutAsideFullRight.vue'
import CvLayoutAsideTopFullLeft from '~/components/cv/layouts/CvLayoutAsideTopFullLeft.vue'
import CvLayoutAsideTopFullRight from '~/components/cv/layouts/CvLayoutAsideTopFullRight.vue'
import CvLayoutAsideBarLeft from '~/components/cv/layouts/CvLayoutAsideBarLeft.vue'
import CvLayoutAsideBarRight from '~/components/cv/layouts/CvLayoutAsideBarRight.vue'
import CvLayoutIdentityAsideLeft from '~/components/cv/layouts/CvLayoutIdentityAsideLeft.vue'
import CvLayoutIdentityAsideRight from '~/components/cv/layouts/CvLayoutIdentityAsideRight.vue'
import { listMyResumes, type ResumeApiItem } from '~/services/resumeApi'
import {
  resolveResumeTextFont,
  useResumeGoogleFonts,
} from '~/composables/useResumeGoogleFonts'
import {
  isMainGeneratedCvLayout,
  isSideGeneratedCvLayout,
} from '~/utils/generatedCvLayoutRuntime'

import HoverRichTextEditor from '~/components/Resume/Create/HoverRichTextEditor.vue'
import ResumePreviewToolbar from '~/components/ResumePreviewToolbar.vue'
import ResumePreviewPageBreak from '~/components/ResumePreviewPageBreak.vue'
import CvEditableSectionContent from '~/components/cv/sections/CvEditableSectionContent.vue'
import CvSectionTitleToolbar from '~/components/cv/sections/CvSectionTitleToolbar.vue'

const { t } = useI18n()

definePageMeta({
  title: 'resumePreview.cv.metaTitle',
  layout: 'resume',
})

useHead(() => ({
  title: t('resumePreview.cv.metaTitle'),
  link: [
    { rel: 'preload', as: 'image', href: '/img/cv/generated/tpl-001.png' },
    { rel: 'preload', as: 'image', href: '/img/cv/generated/tpl-002.png' },
    { rel: 'preload', as: 'image', href: '/img/cv/generated/tpl-003.png' },
  ],
}))

useSeoMeta({
  title: 'New CV - Free AI Resume Preview | Bro World',
  description:
    'Create and preview a free AI-generated CV using modern resume templates on Bro World.',
  keywords: 'new cv, free cv, ai resume, cv preview, resume templates',
  ogImage: '/img/cv/generated/tpl-001.png',
  twitterCard: 'summary_large_image',
  twitterImage: '/img/cv/generated/tpl-001.png',
})

const route = useRoute()
const queryTemplateId =
  typeof route.query.template === 'string' ? route.query.template : ''
const queryPaletteId =
  typeof route.query.palette === 'string' ? route.query.palette : ''
const { loggedIn, user } = useUserSession()
const myResumes = ref<ResumeApiItem[]>([])
const selectedTemplate = ref(GENERATED_RESUME_TEMPLATES[0]?.id || 'tpl-001')
const layoutMenuOpen = ref(false)
const paletteMenuOpen = ref(false)
const asideMenuOpen = ref(false)
const barMenuOpen = ref(false)
const borderMenuOpen = ref(false)
const decorMenuOpen = ref(false)
const selectedPalette = ref('template')
const paletteOverrides = ref<Record<string, Record<string, string>>>({})
const signatureDataUrl = ref('')

const signatureDialogOpen = ref(false)
const aiModalOpen = ref(false)
const aiPrompt =
  'You can upload your old resume or paste your content to help AI generate an improved and structured CV profile.'
const aiPromptProgress = ref('')
let aiTypingTimer: ReturnType<typeof setInterval> | undefined
const matchOfferModalOpen = ref(false)
const matchOfferText = ref('')
const matchOfferLoading = ref(false)
const matchOfferProgress = ref(0)
const matchOfferResult = ref<{ percentage: number; note: string } | null>(null)
let matchOfferTimer: ReturnType<typeof setInterval> | undefined
const signatureCanvas = ref<HTMLCanvasElement | null>(null)
const decorShapeOptions = [
  'circle',
  'ring',
  'blob',
  'square',
  'diamond',
  'star',
  'triangle',
  'pill',
  'bar',
]
const decorColorOptions = [
  '#0EA5E9',
  '#2563EB',
  '#7C3AED',
  '#EC4899',
  '#F97316',
  '#EAB308',
  '#22C55E',
  '#14B8A6',
  '#64748B',
  '#111827',
]
const editableDecorObjects = ref<any[]>([])
const decorMenuOpenIndex = ref<number | null>(null)
const activeTemplate = computed(
  () =>
    GENERATED_RESUME_TEMPLATES.find(
      (template) => template.id === selectedTemplate.value,
    ) || GENERATED_RESUME_TEMPLATES[0],
)
useResumeGoogleFonts(activeTemplate)
const sectionIconOverrides = reactive<Record<string, string>>({})
const {
  normalizedTemplate,
  allSections,
  contentSections,
  asideSections,
  headerSections,
  identitySections,
  leftAsideSections,
  rightAsideSections,
  sectionIcon: runtimeSectionIcon,
  sectionForm,
  sectionTitleStyle,
  sectionContentStyle,
  sectionDateStyle,
  sectionColumn,
  templateDesign: activeTemplateDesign,
} = useGeneratedCvTemplateRuntime(activeTemplate, { sectionIconOverrides })

const cvLayoutComponentMap = {
  aside: CvLayoutAside,
  'no-aside': CvLayoutNoAside,
  'no-aside-split': CvLayoutNoAside,
  'aside-left': CvLayoutAsideLeft,
  'aside-right': CvLayoutAsideRight,
  'aside-full-left': CvLayoutAsideFullLeft,
  'aside-full-right': CvLayoutAsideFullRight,
  'aside-top-full-left': CvLayoutAsideTopFullLeft,
  'aside-top-full-right': CvLayoutAsideTopFullRight,
  'aside-bar-left': CvLayoutAsideBarLeft,
  'aside-bar-right': CvLayoutAsideBarRight,
  'identity-aside-left': CvLayoutIdentityAsideLeft,
  'identity-aside-right': CvLayoutIdentityAsideRight,
} as const

const activeLayoutComponent = computed(
  () =>
    cvLayoutComponentMap[
      activeTemplate.value?.layout as keyof typeof cvLayoutComponentMap
    ] || CvLayoutNoAside,
)
const isIdentityAsideLayout = computed(() =>
  ['identity-aside-left', 'identity-aside-right'].includes(
    String(activeTemplate.value?.layout || ''),
  ),
)
const palettePresetOptions = computed(() =>
  buildToolbarPaletteOptions(
    activeTemplateDesign.value.theme.palette,
    PALETTE_PRESETS,
    100,
  ),
)
const currentPalette = computed(() => ({
  ...(activeTemplateDesign.value?.theme?.palette || {}),
  ...(paletteOverrides.value[selectedTemplate.value] || {}),
}))

const activeColors = computed(() => {
  const palette = currentPalette.value
  const selected = palettePresetOptions.value.find(
    (option) => option.value === selectedPalette.value,
  )
  if (selected && selected.value !== 'template')
    return applyReadablePageTextColors({
      ...palette,
      primary: selected.primary,
      secondary: selected.secondary ?? selected.dark,
      text: selected.text,
      muted: selected.tertiary,
      pageBackground: selected.quaternary,
    })
  return applyReadablePageTextColors(palette)
})
const sectionBarConfig = reactive({
  show: true,
  widthType: 'flex',
  height: 3,
  radius: 999,
})
const isCaptureMode = computed(() => String(route.query.capture || '') === '1')

if (
  queryTemplateId &&
  GENERATED_RESUME_TEMPLATES.some((template) => template.id === queryTemplateId)
) {
  selectedTemplate.value = queryTemplateId
}
if (
  queryPaletteId &&
  palettePresetOptions.value.some((option) => option.value === queryPaletteId)
) {
  selectedPalette.value = queryPaletteId
}

const initialPaletteState = ref<Record<string, string>>({})
watch(
  () => selectedTemplate.value,
  () => {
    initialPaletteState.value = {
      ...(activeTemplateDesign.value?.theme?.palette || {}),
    }
    if (!paletteOverrides.value[selectedTemplate.value])
      paletteOverrides.value[selectedTemplate.value] = {}
  },
  { immediate: true },
)

function updatePaletteColor(payload: {
  key: 'primary' | 'secondary' | 'text' | 'pageBackground'
  value: string
}) {
  const color = String(payload?.value || '').trim()
  if (!color) return
  selectedPalette.value = 'template'
  const templateId = selectedTemplate.value
  if (!paletteOverrides.value[templateId])
    paletteOverrides.value[templateId] = {}
  paletteOverrides.value[templateId][payload.key] = color
}

function resetPaletteColors() {
  selectedPalette.value = 'template'
  paletteOverrides.value[selectedTemplate.value] = {}
}

function toPercentNumber(value: unknown, fallback = 50): number {
  if (typeof value === 'number' && Number.isFinite(value))
    return Math.min(100, Math.max(0, value))
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace('%', '').trim())
    if (Number.isFinite(parsed)) return Math.min(100, Math.max(0, parsed))
  }
  return fallback
}

function toNumber(value: unknown, fallback: number): number {
  const parsed =
    typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
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
  const base: Record<string, string | number> = {
    left: `${x}%`,
    top: `${y}%`,
    opacity,
    width: `${size}px`,
    height: `${size}px`,
  }
  const color = String(obj?.color ?? '').trim()
  if (color) {
    base.backgroundColor = color
    base.color = color
  }

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
  editableDecorObjects.value.push(
    normalizeDecorObject({
      type: 'circle',
      x: 50,
      y: 50,
      size: 120,
      opacity: 0.15,
      color: '',
    }),
  )
  decorMenuOpenIndex.value = editableDecorObjects.value.length - 1
}
function removeDecorObject(index: number) {
  editableDecorObjects.value.splice(index, 1)
  if (decorMenuOpenIndex.value === index) decorMenuOpenIndex.value = null
  if (decorMenuOpenIndex.value !== null && decorMenuOpenIndex.value > index)
    decorMenuOpenIndex.value -= 1
}

const sectionTitleStyleOverrides = ref<Record<string, string>>({})
const sectionTitleStyleOptions = [
  { title: 'Classic', value: 'classic' },
  { title: 'Pill', value: 'pill-filled' },
  { title: 'Outline', value: 'pill-outline' },
  { title: 'Icon bar', value: 'icon-bar' },
  { title: 'Ribbon', value: 'ribbon' },
  { title: 'Hexagon', value: 'hexagon-icon' },
  { title: 'Tab', value: 'tab' },
]

const sectionColumnOverrides = ref<Record<string, 'full' | 'half'>>({})
const sectionColumnOptions = [
  { title: 'Full', value: 'full' },
  { title: 'Half', value: 'half' },
]

const templateContentSections = computed(() =>
  contentSections.value.map((section) => section.key),
)
const templateMainSections = computed(() =>
  allSections.value.map((section) => section.key),
)
const templateFullContentSections = computed(() =>
  contentSections.value
    .filter((section) => section.column !== 'half')
    .map((section) => section.key),
)
const templateHalfContentSections = computed(() =>
  contentSections.value
    .filter((section) => section.column === 'half')
    .map((section) => section.key),
)
const templateAsideSections = computed(() => {
  const layout = String(activeTemplate.value?.layout || '')
  if (layout.includes('left'))
    return leftAsideSections.value.map((section) => section.key)
  if (layout.includes('right'))
    return rightAsideSections.value.map((section) => section.key)
  return asideSections.value.map((section) => section.key)
})
const templateHeaderSections = computed(() =>
  headerSections.value.map((section) => section.key),
)
const templateIdentitySections = computed(() =>
  identitySections.value.map((section) => section.key),
)
const templateMainTwoSideSections = computed(() => [
  ...templateHalfContentSections.value,
  ...templateAsideSections.value,
])
const templateMainTwoLeftSections = computed(() =>
  templateMainTwoSideSections.value.filter((_, index) => index % 2 === 0),
)
const templateMainTwoRightSections = computed(() =>
  templateMainTwoSideSections.value.filter((_, index) => index % 2 === 1),
)
const normalizedStructure = computed(() => {
  const structure = String(activeTemplate.value?.structure || '')
  if (structure === 'structure-1' || structure === 'structure-2')
    return structure
  const layout = String(activeTemplate.value?.layout || '')
  return layout === 'no-aside-split' ? 'structure-2' : 'structure-1'
})

const isMainStructureLayout = computed(() =>
  isMainGeneratedCvLayout(String(activeTemplate.value?.layout || '')),
)

const isSideContentLayout = computed(() =>
  isSideGeneratedCvLayout(String(activeTemplate.value?.layout || '')),
)

type SectionOrderKey =
  | 'asideOne'
  | 'asideTwo'
  | 'contentBase'
  | 'contentStructure2'
  | 'mainOne'
  | 'mainTwoTop'
  | 'mainTwoLeft'
  | 'mainTwoRight'

const sectionOrders = reactive<Record<SectionOrderKey, string[]>>({
  asideOne: [],
  asideTwo: [],
  contentBase: [],
  contentStructure2: [],
  mainOne: [],
  mainTwoTop: [],
  mainTwoLeft: [],
  mainTwoRight: [],
})
const orderMap = sectionOrders

const templateSectionFallbacks = computed<Record<SectionOrderKey, string[]>>(
  () => ({
    asideOne: [...templateAsideSections.value],
    asideTwo: [...templateAsideSections.value],
    contentBase: [...templateContentSections.value],
    contentStructure2: [...templateContentSections.value],
    mainOne: [...templateMainSections.value],
    mainTwoTop: [...templateFullContentSections.value],
    mainTwoLeft: [...templateMainTwoLeftSections.value],
    mainTwoRight: [...templateMainTwoRightSections.value],
  }),
)

function syncSectionOrdersWithTemplate() {
  const fallbacks = templateSectionFallbacks.value
  ;(Object.keys(sectionOrders) as SectionOrderKey[]).forEach((orderKey) => {
    const nextFallback = fallbacks[orderKey] || []
    const nextFallbackSet = new Set(nextFallback.map(toSectionKey))
    const current = sectionOrders[orderKey] || []
    const preserved = current.filter((section) =>
      nextFallbackSet.has(toSectionKey(section)),
    )
    const preservedSet = new Set(preserved.map(toSectionKey))
    sectionOrders[orderKey] = [
      ...preserved,
      ...nextFallback.filter(
        (section) => !preservedSet.has(toSectionKey(section)),
      ),
    ]
  })
}

watch(
  () => activeTemplate.value?.id,
  () => syncSectionOrdersWithTemplate(),
  { immediate: true },
)

function orderedSections(orderKey: SectionOrderKey) {
  const fallback = templateSectionFallbacks.value[orderKey] || []
  const order = sectionOrders[orderKey] || []
  const fallbackKeys = new Set(fallback.map(toSectionKey))
  const known = new Set(order.map(toSectionKey))
  return [
    ...order.filter((section) => {
      const key = toSectionKey(section)
      return fallbackKeys.has(key) || key.startsWith('custom_')
    }),
    ...fallback.filter((item) => !known.has(toSectionKey(item))),
  ]
}

function visibleOrderedSections(
  orderKey: SectionOrderKey,
  zoneKey?: SectionOrderKey,
) {
  return orderedSections(orderKey).filter((section) => {
    const normalized = toSectionKey(section)
    const visible = isSectionVisible(normalized)
    if (!visible) return false
    if (!zoneKey) return true
    return isSectionVisibleInZone(zoneKey, normalized)
  })
}

const visibleAsideOneSections = computed(() =>
  visibleOrderedSections('asideOne', 'asideOne'),
)
const visibleAsideTwoSections = computed(() =>
  visibleOrderedSections('asideTwo', 'asideTwo'),
)
const visibleContentBaseSections = computed(() =>
  visibleOrderedSections('contentBase'),
)
const visibleContentStructure2Sections = computed(() =>
  visibleOrderedSections('contentStructure2'),
)
const visibleMainOneSections = computed(() => visibleOrderedSections('mainOne'))
const visibleMainTwoTopSections = computed(() =>
  visibleOrderedSections('mainTwoTop'),
)
const visibleMainTwoLeftSections = computed(() =>
  visibleOrderedSections('mainTwoLeft'),
)
const visibleMainTwoRightSections = computed(() =>
  visibleOrderedSections('mainTwoRight'),
)

const CV_PREVIEW_PDF_PAGE_HEIGHT = 1100
const CV_PREVIEW_PAGE_WIDTH = 794
const cvPreviewRef = ref<HTMLElement | null>(null)
const cvPreviewPageCount = ref(1)
let cvPreviewMeasureTimer: ReturnType<typeof setTimeout> | undefined
let cvPreviewResizeObserver: ResizeObserver | undefined

const cvPreviewHeight = computed(
  () => cvPreviewPageCount.value * CV_PREVIEW_PDF_PAGE_HEIGHT,
)

const cvPreviewPageBreaks = computed(() =>
  Array.from(
    { length: Math.max(0, cvPreviewPageCount.value - 1) },
    (_, index) => index + 1,
  ),
)

function measureCvPreviewHeight() {
  if (!import.meta.client) return
  const preview =
    cvPreviewRef.value?.querySelector<HTMLElement>('.cv-preview-page')
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
const dragOrderKey = ref<SectionOrderKey | ''>('')

function onSectionDragStart(orderKey: SectionOrderKey, section: string) {
  dragOrderKey.value = orderKey
  dragSection.value = section
}

function onSectionDrop(orderKey: SectionOrderKey, targetSection: string) {
  if (!dragSection.value || dragOrderKey.value !== orderKey) return
  const order = sectionOrders[orderKey]
  if (!order) return
  const from = order.indexOf(dragSection.value)
  const to = order.indexOf(targetSection)
  if (from === -1 || to === -1 || from === to) return
  const next = [...order]
  const [item] = next.splice(from, 1)
  if (!item) return
  next.splice(to, 0, item)
  sectionOrders[orderKey] = next
}

function onSectionDragEnd() {
  dragSection.value = ''
  dragOrderKey.value = ''
}

function moveSection(
  orderKey: SectionOrderKey,
  section: string,
  direction: 'up' | 'down' = 'down',
) {
  const order = sectionOrders[orderKey]
  if (!order) return
  const idx = order.indexOf(section)
  if (idx === -1 || order.length <= 1) return
  const next =
    direction === 'up'
      ? Math.max(0, idx - 1)
      : Math.min(order.length - 1, idx + 1)
  if (next === idx) return
  const swapped = [...order]
  const [item] = swapped.splice(idx, 1)
  if (!item) return
  swapped.splice(next, 0, item)
  sectionOrders[orderKey] = swapped
}

const headerType = computed(() =>
  String(activeTemplateDesign.value?.headerType || 'header-left'),
)

const templateFakeData = computed(() =>
  getGeneratedTemplateFakeData(activeTemplate.value),
)
const userResumeData = computed<any>(() => myResumes.value[0] || null)
const fakeData = computed(() => userResumeData.value || templateFakeData.value)
const sectionType = (key: string) => sectionForm(key)

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
const customSectionCounter = ref(0)
const addSectionModalOpen = ref(false)
const addSectionStep = ref<1 | 2>(1)
const isAddSectionStepOne = computed(() => Number(addSectionStep.value) === 1)
const addSectionVariant = ref('classic')
const addSectionName = ref('')
const addSectionOrder = reactive<{
  zone: SectionOrderKey
  withSection: string
  after: boolean
}>({
  zone: 'mainOne',
  withSection: '',
  after: true,
})
const addSectionOrderZoneOptions = [
  { title: 'Main one', value: 'mainOne' },
  { title: 'Main two top', value: 'mainTwoTop' },
  { title: 'Main two left', value: 'mainTwoLeft' },
  { title: 'Main two right', value: 'mainTwoRight' },
  { title: 'Aside one', value: 'asideOne' },
  { title: 'Aside two', value: 'asideTwo' },
]
const addSectionVariantOptions = [
  'classic',
  'list',
  'dot',
  'timeline',
  'cards',
].map((value) => ({ title: value, value }))

const hiddenSections = reactive<Record<string, boolean>>({})
const sectionExtraItems = reactive<Record<string, any[]>>({})
const sectionLineOffsets = reactive<Record<string, number>>({})
const CV_SECTION_LINE_OFFSET_PX = 18
const CV_SECTION_MAX_LINE_OFFSET = 24

function sectionOffsetKey(orderKey: SectionOrderKey, section: string) {
  return `${orderKey}:${toSectionKey(section)}`
}

function sectionOffsetStyle(orderKey: SectionOrderKey, section: string) {
  const lines = sectionLineOffsets[sectionOffsetKey(orderKey, section)] || 0
  return lines > 0
    ? { marginTop: `${lines * CV_SECTION_LINE_OFFSET_PX}px` }
    : undefined
}

function shiftSectionByLine(
  orderKey: SectionOrderKey,
  section: string,
  direction: 'up' | 'down',
) {
  const key = sectionOffsetKey(orderKey, section)
  const current = sectionLineOffsets[key] || 0
  const next =
    direction === 'down'
      ? Math.min(CV_SECTION_MAX_LINE_OFFSET, current + 1)
      : Math.max(0, current - 1)

  sectionLineOffsets[key] = next
  scheduleCvPreviewMeasure()
}

const languageOption = ref<any | null>(null)
const languageStars = ref(3)
const languageCatalog = [
  { title: '🇫🇷 French', name: 'French', countryCode: 'FR', flag: '🇫🇷' },
  { title: '🇬🇧 English', name: 'English', countryCode: 'GB', flag: '🇬🇧' },
  { title: '🇩🇪 Deutsch', name: 'Deutsch', countryCode: 'DE', flag: '🇩🇪' },
  { title: '🇪🇸 Español', name: 'Español', countryCode: 'ES', flag: '🇪🇸' },
  { title: '🇮🇹 Italiano', name: 'Italiano', countryCode: 'IT', flag: '🇮🇹' },
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

function hideSection(section: string) {
  hiddenSections[toSectionKey(section)] = true
}
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

function openAddSectionModal() {
  addSectionStep.value = 1
  addSectionVariant.value = 'classic'
  addSectionName.value = ''
  addSectionOrder.zone = 'mainOne'
  addSectionOrder.withSection = ''
  addSectionOrder.after = true
  addSectionModalOpen.value = true
}
function selectAddSectionVariant(variant: string) {
  addSectionVariant.value = variant
  addSectionStep.value = 2
}
function goToAddSectionStepTwo() {
  addSectionStep.value = 2
}

function confirmAddSection() {
  const sectionName = addSectionName.value.trim()
  if (!sectionName) return
  const key = `custom_${++customSectionCounter.value}`
  const order = orderMap[addSectionOrder.zone] || (orderMap.mainOne as string[])
  const anchor = addSectionOrder.withSection
  const at = anchor ? order.indexOf(anchor) : -1
  const insertAt = at >= 0 ? at + (addSectionOrder.after ? 1 : 0) : order.length
  order.splice(insertAt, 0, key)
  sectionTitleMap[key] = sectionName
  sectionVariantOptionsMap[key] = [
    ...addSectionVariantOptions.map((v) => v.value),
  ]
  sectionTypeOverrides[key] = addSectionVariant.value
  fallbackSectionIconMap[key] = 'mdi-text-box-outline'
  editableSectionItems[key] = ['Label name · Label value']
  addSectionModalOpen.value = false
}
function confirmAddSectionItem() {
  const key = sectionModalKey.value
  if (!key) return
  if (key === 'languages') {
    if (!languageOption.value) return
    sectionExtraItems[key] = [
      ...(sectionExtraItems[key] || []),
      {
        name: languageOption.value.name,
        level: Number(languageStars.value) * 20,
        countryCode: languageOption.value.countryCode,
        flag: languageOption.value.flag,
      },
    ]
  } else if (key === 'certifications') {
    const title = sectionModalTitle.value.trim()
    if (!title) return
    sectionExtraItems[key] = [
      ...(sectionExtraItems[key] || []),
      {
        title,
        description: sectionModalDescription.value.trim(),
        attachments: sectionModalFiles.value.map((f: any) => ({
          name: f?.name || 'file',
        })),
      },
    ]
  } else if (key === 'references') {
    const title = sectionModalTitle.value.trim()
    if (!title) return
    sectionExtraItems[key] = [
      ...(sectionExtraItems[key] || []),
      {
        title,
        description: sectionModalDescription.value.trim(),
      },
    ]
  } else if (key === 'experience') {
    const title = sectionModalTitle.value.trim()
    const company = sectionModalCompany.value.trim()
    if (!title || !company) return
    sectionExtraItems[key] = [
      ...(sectionExtraItems[key] || []),
      {
        id: crypto.randomUUID(),
        title,
        description: sectionModalDescription.value.trim(),
        company,
        startDate: sectionModalStartDate.value || '',
        endDate: sectionModalEndDate.value || '',
      },
    ]
  } else if (key === 'education') {
    const title = sectionModalTitle.value.trim()
    const school = sectionModalSchool.value.trim()
    if (!title || !school) return
    sectionExtraItems[key] = [
      ...(sectionExtraItems[key] || []),
      {
        id: crypto.randomUUID(),
        title,
        description: sectionModalDescription.value.trim(),
        school,
        startDate: sectionModalStartDate.value || '',
        endDate: sectionModalEndDate.value || '',
        location: sectionModalLocation.value.trim(),
      },
    ]
  } else if (key === 'projects') {
    const title = sectionModalTitle.value.trim()
    if (!title) return
    sectionExtraItems[key] = [
      ...(sectionExtraItems[key] || []),
      {
        id: crypto.randomUUID(),
        title,
        description: sectionModalDescription.value.trim(),
        attachments: sectionModalFiles.value.map((f: any) => f?.name || 'file'),
        home_page: sectionModalHomePage.value.trim(),
      },
    ]
  } else if (key === 'skills') {
    const name = sectionModalSkillName.value.trim()
    if (!name) return
    sectionExtraItems[key] = [
      ...(sectionExtraItems[key] || []),
      {
        name,
        level: Number(sectionModalSkillStars.value) * 20,
      },
    ]
  } else {
    const value = sectionModalValue.value.trim()
    if (!value) return
    sectionExtraItems[key] = [...(sectionExtraItems[key] || []), value]
  }
  Reflect.deleteProperty(editableSectionItems, key)
  sectionModalOpen.value = false
}
function isSectionVisible(section: string) {
  return !hiddenSections[toSectionKey(section)]
}

const hiddenSectionsByZone = reactive<Record<string, Record<string, boolean>>>(
  {},
)

function hideSectionInZone(orderKey: SectionOrderKey, section: string) {
  const normalized = toSectionKey(section)
  hiddenSectionsByZone[orderKey] = hiddenSectionsByZone[orderKey] || {}
  hiddenSectionsByZone[orderKey][normalized] = true
}

function hideSectionFromZone(orderKey: SectionOrderKey, section: string) {
  hideSection(section)
  hideSectionInZone(orderKey, section)
}

function isSectionVisibleInZone(orderKey: SectionOrderKey, section: string) {
  const normalized = toSectionKey(section)
  return !hiddenSectionsByZone[orderKey]?.[normalized]
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
const fallbackSectionIconMap: Record<string, string> = {}

function sectionIcon(sectionKey: string) {
  return (
    fallbackSectionIconMap[toSectionKey(sectionKey)] ||
    runtimeSectionIcon(sectionKey)
  )
}

function getSectionIconOptions(sectionKey: string) {
  const section = normalizedTemplate.value.sections.find(
    (item) => item.key === toSectionKey(sectionKey),
  )
  return [sectionIcon(sectionKey), ...(section?.iconAlternatives || [])]
    .filter((icon, index, icons) => icon && icons.indexOf(icon) === index)
    .map((icon) => ({ title: icon, value: icon }))
}

function setSectionIcon(sectionKey: string, icon: unknown) {
  if (typeof icon !== 'string' || !icon) return
  sectionIconOverrides[toSectionKey(sectionKey)] = icon
}

function toSectionKey(section?: string) {
  const key = String(section || '').toLowerCase()
  if (key === 'certification') return 'certifications'
  if (key === 'hobby' || key === 'interest' || key === 'interests')
    return 'hobbies'
  return key
}

function effectiveSectionTitleStyle(sectionKey: string) {
  const key = toSectionKey(sectionKey)
  return sectionTitleStyleOverrides.value[key] || sectionTitleStyle(key)
}

function effectiveSectionContentStyle(sectionKey: string) {
  return sectionContentStyle(toSectionKey(sectionKey))
}

function effectiveSectionDateStyle(sectionKey: string) {
  return sectionDateStyle(toSectionKey(sectionKey))
}

function updateSectionTitleStyle(sectionKey: string, value: unknown) {
  if (typeof value !== 'string') return
  sectionTitleStyleOverrides.value[toSectionKey(sectionKey)] = value
}

function isSectionColumnEditable(sectionKey: string) {
  return templateMainSections.value.includes(toSectionKey(sectionKey))
}

function effectiveSectionColumn(sectionKey: string) {
  const key = toSectionKey(sectionKey)
  return sectionColumnOverrides.value[key] || sectionColumn(key)
}

function sectionColumnIcon(sectionKey: string) {
  return effectiveSectionColumn(sectionKey) === 'half'
    ? 'mdi-view-column-outline'
    : 'mdi-view-day-outline'
}

function updateSectionColumn(sectionKey: string, value: unknown) {
  const key = toSectionKey(sectionKey)
  if (!isSectionColumnEditable(key)) return
  sectionColumnOverrides.value[key] = value === 'half' ? 'half' : 'full'
}

function contentColumnClass(sectionKey: string) {
  return effectiveSectionColumn(sectionKey) === 'half'
    ? 'cv-section-row--half'
    : 'cv-section-row--full'
}

function getSectionItems(rawSection: string): string[] {
  const key = toSectionKey(rawSection)
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

  const toLeveledItem = (
    item: any,
    fallback: string,
    sectionKey: 'skills' | 'languages',
    preferFlag = false,
  ) => {
    if (typeof item === 'string') return item
    const level = Number(item?.level)
    const normalizedLevel = Number.isFinite(level)
      ? Math.max(0, Math.min(100, level))
      : null
    const variant = effectiveSectionType(
      sectionKey,
      sectionType(sectionKey as any),
    )
    const showTextLevel = variant === 'classic' || variant === 'text'
    const suffix =
      normalizedLevel === null
        ? ''
        : showTextLevel
          ? ` (${toLevelText(normalizedLevel, sectionKey)})`
          : ` (${normalizedLevel}%)`
    const label =
      preferFlag && item?.languageType === 'flag' && item?.flag
        ? String(item.flag)
        : String(item?.name || item?.title || fallback)
    return `${label}${suffix}`
  }

  if (key === 'experience')
    return [
      ...(data.experiences || []).map((item: any) => {
        const from = formatShortDate(item.startDate)
        const to = item.endDate ? formatShortDate(item.endDate) : 'Present'
        const date = from ? `${from} - ${to}` : ''
        return `${item.title || 'Role'}§${item.company || ''}§${date}§${item.description || 'Description...'}`
      }),
      ...extra.map((item: any) => {
        const from = formatShortDate(item.startDate)
        const to = item.endDate ? formatShortDate(item.endDate) : 'Present'
        const date = from ? `${from} - ${to}` : ''
        return `${item.title || 'Role'}§${item.company || ''}§${date}§${item.description || 'Description...'}`
      }),
    ]
  if (key === 'education')
    return [
      ...(data.educations || []).map((item: any) => {
        const from = formatShortDate(item.startDate)
        const to = formatShortDate(item.endDate)
        const date = from ? `${from}${to ? ` - ${to}` : ''}` : ''
        const schoolLine = `${item.school || ''}${item.location ? `, ${item.location}` : ''}`
        return `${item.title || 'Degree'}§${schoolLine}§${date}§${item.description || 'Description...'}`
      }),
      ...extra.map((item: any) => {
        const from = formatShortDate(item.startDate)
        const to = formatShortDate(item.endDate)
        const date = from ? `${from}${to ? ` - ${to}` : ''}` : ''
        const schoolLine = `${item.school || ''}${item.location ? `, ${item.location}` : ''}`
        return `${item.title || 'Degree'}§${schoolLine}§${date}§${item.description || 'Description...'}`
      }),
    ]
  if (key === 'projects')
    return [
      ...(data.projects || []).map((item: any) => toTitleDesc(item, 'Project')),
      ...extra.map((item: any) => toTitleDesc(item, 'Project')),
    ].filter(Boolean)
  if (key === 'skills')
    return [
      ...(data.skills || []).map((item: any) =>
        toLeveledItem(item, 'Skill', 'skills'),
      ),
      ...extra.map((item: any) => toLeveledItem(item, 'Skill', 'skills')),
    ].filter(Boolean)
  if (key === 'languages')
    return [...(data.languages || []), ...extra]
      .map((item: any) => toLeveledItem(item, 'Language', 'languages', true))
      .filter(Boolean)
  if (key === 'certifications')
    return [
      ...(data.certifications || []).map((item: any) =>
        toTitleDesc(item, 'Certification'),
      ),
      ...extra.map((item: any) => toTitleDesc(item, 'Certification')),
    ].filter(Boolean)
  if (key === 'references')
    return [
      ...(data.references || []).map((item: any) =>
        toTitleDesc(item, 'Reference'),
      ),
      ...extra.map((item: any) => toTitleDesc(item, 'Reference')),
    ].filter(Boolean)
  if (key === 'hobbies')
    return [
      ...(data.hobbies || []).map((item: any) => toTitleDesc(item, 'Hobby')),
      ...extra.map((item: any) => toTitleDesc(item, 'Hobby')),
    ].filter(Boolean)
  if (key === 'profile')
    return [
      String(
        data.resumeInformation?.profileText || data.profileDescription || '',
      ),
      ...extra,
    ].filter(Boolean)
  return []
}

const editableSectionItems = reactive<Record<string, string[]>>({})
const sectionTitleOverrides = reactive<Record<string, string>>({})
const headerOverrides = reactive<Record<string, string>>({})

function getEditableSectionItems(rawSection: string) {
  const key = toSectionKey(rawSection)
  if (!editableSectionItems[key])
    editableSectionItems[key] = getSectionItems(rawSection)
  return editableSectionItems[key]
}

function updateEditableSectionItem(
  rawSection: string,
  index: number,
  value: string,
) {
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

watch(
  [selectedTemplate, userResumeData],
  () => {
    Object.keys(editableSectionItems).forEach((key) =>
      Reflect.deleteProperty(editableSectionItems, key),
    )
    Object.keys(headerOverrides).forEach((key) =>
      Reflect.deleteProperty(headerOverrides, key),
    )
  },
  { deep: false },
)

const contactIconOverrides = reactive<Record<string, string>>({})
const contactIconAlternatives: Record<string, string[]> = {
  email: ['mdi-email-outline', 'mdi-email', 'mdi-at', 'mdi-email-open-outline'],
  phone: [
    'mdi-phone-outline',
    'mdi-phone',
    'mdi-cellphone',
    'mdi-phone-classic',
  ],
  birthDate: [
    'mdi-cake-variant-outline',
    'mdi-cake-variant',
    'mdi-calendar-heart',
    'mdi-calendar-outline',
  ],
  adresse: [
    'mdi-map-marker-outline',
    'mdi-map-marker',
    'mdi-map-marker-radius',
    'mdi-home-map-marker',
  ],
  homepage: ['mdi-home-outline', 'mdi-home', 'mdi-web', 'mdi-link-variant'],
  repo_profile: [
    'mdi-github',
    'mdi-git',
    'mdi-source-repository',
    'mdi-gitlab',
  ],
}

function updateContactIcon(key: string, icon: string) {
  contactIconOverrides[key] = icon
}
const headerProfile = computed(() => {
  const fake: any = fakeData.value || {}
  const info = fake.resumeInformation || {}
  return {
    fullName:
      headerOverrides.fullName ??
      String(info.fullName || fake.fullName || 'John Doe'),
    role:
      headerOverrides.role ??
      String(info.title || fake.role || 'Senior Developer'),
    image: String(info.photo || fake.image || '/img/default_avatar.svg'),
    contact: [
      {
        key: 'email',
        icon: contactIconOverrides.email || 'mdi-email-outline',
        type: 'text',
        label: '',
        value:
          headerOverrides.email ??
          String(info.email || fake.email || 'john.doe@email.com'),
      },
      {
        key: 'phone',
        icon: contactIconOverrides.phone || 'mdi-phone-outline',
        type: 'text',
        label: '',
        value:
          headerOverrides.phone ??
          String(info.phone || fake.phone || '+1 (555) 000-1234'),
      },
      {
        key: 'birthDate',
        icon: contactIconOverrides.birthDate || 'mdi-cake-variant-outline',
        type: 'text',
        label: '',
        value:
          headerOverrides.birthDate ??
          String(info.birthDate || fake.birthday || '1992-05-12'),
      },
      {
        key: 'adresse',
        icon: contactIconOverrides.adresse || 'mdi-map-marker-outline',
        type: 'text',
        label: '',
        value:
          headerOverrides.adresse ??
          String(info.adresse || fake.location || 'Paris, France'),
      },
      {
        key: 'homepage',
        icon: contactIconOverrides.homepage || 'mdi-home-outline',
        type: 'link',
        label: 'Home Page',
        value:
          headerOverrides.homepage ??
          String(
            info.homepage || fake.homepage || 'https://portfolio.example.com',
          ),
      },
      {
        key: 'repo_profile',
        icon: contactIconOverrides.repo_profile || 'mdi-github',
        type: 'link',
        label: 'Repository Profile',
        value:
          headerOverrides.repo_profile ??
          String(
            info.repo_profile ||
              fake.repositoryPage ||
              'https://github.com/john-doe',
          ),
      },
    ],
  }
})

const shouldRenderIdentityProfile = computed(() => {
  const sections = templateIdentitySections.value
  return (
    sections.length === 0 ||
    sections.some((section) =>
      ['identity', 'photo', 'fullname', 'role', 'profile'].includes(section),
    )
  )
})
const headerContactItems = computed(() => {
  const sections = templateHeaderSections.value
  if (sections.length > 0 && !sections.includes('contact')) return []
  return headerProfile.value.contact
})

const photoMenuOpen = ref(false)
const photoFileInput = ref<HTMLInputElement | null>(null)
const photoPreview = ref('')
const photoSize = ref(92)
const photoRadius = ref(999)
const photoBorderColor = ref('#1F2937')
const photoBorderWidth = ref(2)
const photoColors = [
  '#1F2937',
  '#1D4ED8',
  '#2563EB',
  '#0EA5E9',
  '#14B8A6',
  '#22C55E',
  '#EAB308',
  '#F97316',
  '#EF4444',
  '#EC4899',
  '#8B5CF6',
  '#64748B',
]

watch(
  activeTemplate,
  (template) => {
    const design = getGeneratedTemplateDesign(template)
    const photo = (design as any)?.photo || {}
    photoSize.value = parsePx(photo.photoSize || photo.size, 92)
    photoRadius.value = parsePx(
      photo.photoBorderRadius || (photo.shape === 'circle' ? '999px' : '8px'),
      999,
    )
    photoBorderColor.value = String(photo.photoBorderColor || '#1F2937')
    photoBorderWidth.value = parsePx(photo.photoBorderWidth || 2, 2)
  },
  { immediate: true },
)

function openPhotoPicker() {
  photoFileInput.value?.click()
}
function onPhotoSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input?.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    photoPreview.value = String(reader.result || '')
  }
  reader.readAsDataURL(file)
}

const asideWidth = ref(850)
const asideHeight = ref(1100)
const asideRadius = ref(0)
const pageBorderEnabled = ref(true)
const pageBorderWidth = ref(0)
const pageBorderRadius = ref(0)
const pageBorderColor = ref('#0f172a')

function parsePx(value: unknown, fallback: number) {
  const num = Number.parseFloat(String(value ?? ''))
  return Number.isFinite(num) ? num : fallback
}

const isHeaderLightLayout = computed(() => {
  const layout = String(activeTemplate.value?.layout || '')
  return ['aside', 'aside-bar-left', 'aside-bar-right'].includes(layout)
})

const headerTextColor = computed(() =>
  isHeaderLightLayout.value
    ? '#F8FAFC'
    : readableTextColorForBackground(
        activeColors.value?.pageBackground,
        activeColors.value?.text || '#0F172A',
      ),
)

const headerMutedColor = computed(() =>
  isHeaderLightLayout.value
    ? '#CBD5E1'
    : readableMutedColorForBackground(
        activeColors.value?.pageBackground,
        activeColors.value?.muted || '#334155',
      ),
)

function defaultAsideDimensions(layout: string) {
  if (layout === 'aside')
    return { width: CV_PREVIEW_PAGE_WIDTH, height: 220, radius: 0 }
  if (layout === 'aside-full-left' || layout === 'aside-full-right')
    return { width: 260, height: 0, radius: 32 }
  if (layout === 'aside-top-full-left' || layout === 'aside-top-full-right')
    return { width: 260, height: 220, radius: 32 }
  if (layout === 'identity-aside-left' || layout === 'identity-aside-right')
    return { width: 260, height: 0, radius: 0 }
  if (layout === 'aside-bar-left' || layout === 'aside-bar-right')
    return { width: 160, height: 0, radius: 18 }
  if (layout === 'aside-left' || layout === 'aside-right')
    return { width: 220, height: 0, radius: 18 }
  return { width: 240, height: 0, radius: 0 }
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeAsideWidth(value: unknown, layout: string) {
  const defaults = defaultAsideDimensions(layout)
  const raw = parsePx(value, defaults.width)
  if (layout === 'aside') return clampNumber(raw, 320, CV_PREVIEW_PAGE_WIDTH)
  if (
    layout === 'aside-full-left' ||
    layout === 'aside-full-right' ||
    layout === 'aside-top-full-left' ||
    layout === 'aside-top-full-right' ||
    layout === 'identity-aside-left' ||
    layout === 'identity-aside-right'
  )
    return clampNumber(raw, 220, 340)
  if (layout === 'aside-bar-left' || layout === 'aside-bar-right')
    return clampNumber(raw, 120, 240)
  if (layout === 'aside-left' || layout === 'aside-right')
    return clampNumber(raw, 160, 280)
  return clampNumber(raw, 120, 360)
}

function normalizeAsideHeight(value: unknown, layout: string) {
  const defaults = defaultAsideDimensions(layout)
  const raw = parsePx(value, defaults.height)
  if (layout === 'aside') return clampNumber(raw, 120, 320)
  if (layout === 'aside-top-full-left' || layout === 'aside-top-full-right')
    return clampNumber(raw, 180, 280)
  if (layout === 'identity-aside-left' || layout === 'identity-aside-right')
    return 0
  return raw > 0 ? clampNumber(raw, 120, CV_PREVIEW_PDF_PAGE_HEIGHT) : 0
}

const asideDimensionBounds = computed(() => {
  const layout = String(activeTemplate.value?.layout || '')
  if (layout === 'aside')
    return {
      widthMin: 320,
      widthMax: CV_PREVIEW_PAGE_WIDTH,
      heightMin: 120,
      heightMax: 320,
    }
  if (layout === 'aside-full-left' || layout === 'aside-full-right')
    return {
      widthMin: 220,
      widthMax: 340,
      heightMin: 0,
      heightMax: CV_PREVIEW_PDF_PAGE_HEIGHT,
    }
  if (layout === 'aside-top-full-left' || layout === 'aside-top-full-right')
    return {
      widthMin: 220,
      widthMax: 340,
      heightMin: 180,
      heightMax: 280,
    }
  if (layout === 'identity-aside-left' || layout === 'identity-aside-right')
    return {
      widthMin: 220,
      widthMax: 340,
      heightMin: 0,
      heightMax: 0,
    }
  if (layout === 'aside-bar-left' || layout === 'aside-bar-right')
    return {
      widthMin: 120,
      widthMax: 240,
      heightMin: 0,
      heightMax: CV_PREVIEW_PDF_PAGE_HEIGHT,
    }
  if (layout === 'aside-left' || layout === 'aside-right')
    return {
      widthMin: 160,
      widthMax: 280,
      heightMin: 0,
      heightMax: CV_PREVIEW_PDF_PAGE_HEIGHT,
    }
  return {
    widthMin: 120,
    widthMax: 360,
    heightMin: 0,
    heightMax: CV_PREVIEW_PDF_PAGE_HEIGHT,
  }
})

watch(
  activeTemplate,
  (template) => {
    const layout = String(template?.layout || '')
    const design = getGeneratedTemplateDesign(template)
    const aside = (design as any)?.aside || {}
    const pageBorder = (design as any)?.theme?.pageBorder || {}
    const defaults = defaultAsideDimensions(layout)
    asideWidth.value = normalizeAsideWidth(aside.width, layout)
    asideHeight.value = normalizeAsideHeight(aside.height, layout)
    asideRadius.value = parsePx(aside.radius, defaults.radius)
    pageBorderEnabled.value = Boolean(pageBorder.enabled)
    pageBorderWidth.value = parsePx(pageBorder.width, 0)
    pageBorderRadius.value = parsePx(pageBorder.radius, 0)
    pageBorderColor.value = String(pageBorder.color || '#0f172a')
    sectionColumnOverrides.value = {}
    sectionTitleStyleOverrides.value = {}
  },
  { immediate: true },
)

watch(
  [pageBorderEnabled, pageBorderWidth, pageBorderRadius, pageBorderColor],
  () => {
    if (!activeTemplate.value) return
    if (!activeTemplateDesign.value.theme)
      activeTemplateDesign.value.theme = {} as any
    if (!activeTemplateDesign.value.theme.pageBorder)
      activeTemplateDesign.value.theme.pageBorder = {
        enabled: false,
        width: 0,
        radius: 0,
        color: '#0f172a',
      } as any
    activeTemplateDesign.value.theme.pageBorder.enabled =
      pageBorderEnabled.value
    activeTemplateDesign.value.theme.pageBorder.width = pageBorderWidth.value
    activeTemplateDesign.value.theme.pageBorder.radius = pageBorderRadius.value
    activeTemplateDesign.value.theme.pageBorder.color = pageBorderColor.value
  },
)

watch(selectedTemplate, () => scheduleCvPreviewMeasure(true))
watch(sectionTypeOverrides, () => scheduleCvPreviewMeasure(true), {
  deep: true,
})
watch(sectionColumnOverrides, () => scheduleCvPreviewMeasure(true), {
  deep: true,
})
watch(sectionExtraItems, () => scheduleCvPreviewMeasure(true), { deep: true })
watch(hiddenSections, () => scheduleCvPreviewMeasure(true), { deep: true })
watch(hiddenSectionsByZone, () => scheduleCvPreviewMeasure(true), {
  deep: true,
})
watch(
  [
    asideWidth,
    asideHeight,
    asideRadius,
    photoSize,
    photoRadius,
    photoBorderWidth,
  ],
  () => scheduleCvPreviewMeasure(true),
)

onUpdated(() => scheduleCvPreviewMeasure())
onBeforeUnmount(() => {
  if (cvPreviewMeasureTimer) window.clearTimeout(cvPreviewMeasureTimer)
  if (aiTypingTimer) window.clearInterval(aiTypingTimer)
  if (matchOfferTimer) window.clearInterval(matchOfferTimer)
  cvPreviewResizeObserver?.disconnect()
})
watch(aiModalOpen, (isOpen) => {
  if (!isOpen) return
  if (aiTypingTimer) window.clearInterval(aiTypingTimer)
  aiPromptProgress.value = ''
  let index = 0
  aiTypingTimer = window.setInterval(() => {
    index += 1
    aiPromptProgress.value = aiPrompt.slice(0, index)
    if (index >= aiPrompt.length && aiTypingTimer) {
      window.clearInterval(aiTypingTimer)
      aiTypingTimer = undefined
    }
  }, 20)
})

function textFontPreset(
  kind: 'fullName' | 'sectionLabel' | 'entryTitle' | 'body',
) {
  const fallback = kind === 'fullName' ? 'serif' : 'sans'
  return resolveResumeTextFont(
    (activeTemplate.value as any)?.textStyles?.[kind],
    fallback,
  )
}

function applyPreviewTemplate(templateId: string) {
  selectedTemplate.value = templateId
  layoutMenuOpen.value = false
}

async function saveFromPreview() {
  const templatePayload = JSON.parse(JSON.stringify(activeTemplate.value || {}))
  templatePayload.name =
    templatePayload.name || templatePayload.id || 'preview-template'
  templatePayload.version = Number(templatePayload.version || 1)
  templatePayload.customize = {
    selectedPalette: selectedPalette.value,
    signature: signatureDataUrl.value,
  }
  const templateResponse = await $fetch<{ id: string }>(
    'https://bro-world.org/api/v1/recruit/templates/resumes',
    { method: 'POST', body: templatePayload },
  )

  const token = user.value?.token?.trim()
  if (!token) return
  const data: any = fakeData.value || {}
  await $fetch('https://bro-world.org/api/v1/recruit/resumes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      templateId: templateResponse.id,
      resumeInformation: data.resumeInformation || {},
      experiences: data.experiences || [],
      educations: data.educations || [],
      skills: data.skills || [],
      languages: data.languages || [],
      certifications: data.certifications || [],
      references: data.references || [],
      projects: data.projects || [],
      hobbies: data.hobbies || [],
    },
  })
}

function openAiModal() {
  aiModalOpen.value = true
}

async function generateResumeOfferMatch() {
  if (!matchOfferText.value.trim() || matchOfferLoading.value) return
  const token = user.value?.token?.trim()
  if (!token) return
  matchOfferLoading.value = true
  matchOfferResult.value = null
  matchOfferProgress.value = 6
  if (matchOfferTimer) window.clearInterval(matchOfferTimer)
  matchOfferTimer = window.setInterval(() => {
    matchOfferProgress.value = Math.min(93, matchOfferProgress.value + 3)
  }, 220)
  try {
    const response = await $fetch<{ percentage: number; note: string }>(
      'https://bro-world.org/api/v1/recruit/private/me/resumes/match-offer',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: { offerText: matchOfferText.value.trim() },
      },
    )
    matchOfferResult.value = response
    matchOfferProgress.value = 100
  } catch {
    /* noop */
  } finally {
    if (matchOfferTimer) window.clearInterval(matchOfferTimer)
    matchOfferTimer = undefined
    matchOfferLoading.value = false
  }
}

async function downloadPdf() {
  const node = document.querySelector('.cv-preview-shell') as HTMLElement | null
  if (!node) return
  const printWindow = window.open('', '_blank', 'width=900,height=1500')
  if (!printWindow) return
  const headStyles = Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]'),
  )
    .map((el) => el.outerHTML)
    .join('')
  printWindow.document.write(
    `<html><head>${headStyles}<style>@page{size:A4;margin:0}html,body{margin:0;background:#fff}body{display:flex;justify-content:center;align-items:flex-start}.cv-preview-shell{width:794px;max-width:794px;box-sizing:border-box;margin:0}.resume-preview-page-break{display:none!important}.cv-section-toolbar,.cv-photo-menu-btn{display:none!important}</style></head><body>${node.outerHTML}</body></html>`,
  )
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

function closeSignatureDialog() {
  signatureDialogOpen.value = false
}

function saveSignatureFromCanvas() {
  const canvas = signatureCanvas.value
  if (!canvas) return
  signatureDataUrl.value = canvas.toDataURL('image/png')
  signatureDialogOpen.value = false
}

function clearSignatureCanvas() {
  const canvas = signatureCanvas.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

function deleteSignature() {
  signatureDataUrl.value = ''
  signatureDialogOpen.value = false
}

function initCanvas() {
  const canvas = signatureCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = canvas.clientWidth || 680
  canvas.height = 400
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
  if (loggedIn.value && !isCaptureMode.value) {
    try {
      const resumes = await listMyResumes()
      if (Array.isArray(resumes) && resumes.length > 0)
        myResumes.value = resumes
    } catch {
      // keep template fake data fallback
    }
  }

  await nextTick()
  scheduleCvPreviewMeasure(true)
  if (import.meta.client && 'ResizeObserver' in window && cvPreviewRef.value) {
    cvPreviewResizeObserver = new ResizeObserver(() =>
      scheduleCvPreviewMeasure(),
    )
    cvPreviewResizeObserver.observe(cvPreviewRef.value)
  }
})

watch(
  activeTemplate,
  () => {
    const design = activeTemplateDesign.value
    editableDecorObjects.value = (design?.decor?.objects || []).map(
      (obj: any) => normalizeDecorObject(obj),
    )
    const raw = design?.sectionBar || {}
    sectionBarConfig.show = raw.show !== false
    sectionBarConfig.widthType = raw.width === 'complete' ? 'complete' : 'flex'
    sectionBarConfig.height = Number(raw.height ?? 3)
    sectionBarConfig.radius = Number(raw.radius ?? raw.raduis ?? 999)
  },
  { immediate: true },
)
</script>

<template>
  <div :class="{ 'cv-page--capture': isCaptureMode }">
    <input
      v-if="!isCaptureMode"
      ref="photoFileInput"
      type="file"
      accept="image/*"
      class="d-none"
      @change="onPhotoSelected"
    />
    <AppPageDrawers v-if="!isCaptureMode">
      <template #right>
        <v-btn
          class="mt-1"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-content-save"
          block
          @click="saveFromPreview"
          >Save</v-btn
        >
        <v-btn
          class="mt-2"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-file-pdf-box"
          block
          @click="downloadPdf"
          >PDF</v-btn
        >
        <v-btn
          class="mt-2"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-draw"
          block
          @click="openSignatureDialog"
          >Signature</v-btn
        >
        <v-btn
          class="mt-2"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-robot"
          block
          @click="openAiModal"
          >AI</v-btn
        >
        <v-btn
          class="mt-2"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-plus"
          block
          to="/resume/cv/template-create"
          >Template</v-btn
        >
        <v-btn
          v-if="userResumeData"
          class="mt-2"
          color="primary"
          variant="tonal"
          block
          @click="matchOfferModalOpen = true"
        >
          Compare
        </v-btn>
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <ResumePreviewToolbar
        v-if="!isCaptureMode"
        v-model:menu-open="layoutMenuOpen"
        v-model:palette-menu-open="paletteMenuOpen"
        v-model:aside-menu-open="asideMenuOpen"
        v-model:bar-menu-open="barMenuOpen"
        v-model:border-menu-open="borderMenuOpen"
        v-model:decor-menu-open="decorMenuOpen"
        :palettes="palettePresetOptions"
        :active-colors="activeColors"
        show-decor
        show-section
        :selected-palette="selectedPalette"
        :palette-columns="10"
        :templates="GENERATED_RESUME_TEMPLATES"
        :selected-template="selectedTemplate"
        :get-template-image="
          (template) => `/img/cv/generated/${template.id}.png`
        "
        template-key-prefix="cv-preview"
        @select-template="applyPreviewTemplate"
        @select-palette="selectedPalette = $event"
        @update-palette-color="updatePaletteColor"
        @reset-palette="resetPaletteColors"
        @section="openAddSectionModal"
      >
        <template #decor>
          <v-btn
            size="small"
            variant="outlined"
            prepend-icon="mdi-shape-plus"
            block
            @click.stop="addDecorObject"
          >
            Add decor
          </v-btn>
          <div class="mt-3 d-flex flex-column ga-2">
            <v-menu
              v-for="(obj, i) in editableDecorObjects"
              :key="`obj-${i}`"
              :model-value="decorMenuOpenIndex === i"
              :close-on-content-click="false"
              location="left start"
              @update:model-value="
                (isOpen) => {
                  decorMenuOpenIndex = isOpen
                    ? i
                    : decorMenuOpenIndex === i
                      ? null
                      : decorMenuOpenIndex
                }
              "
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="small"
                  variant="tonal"
                  class="justify-space-between"
                  block
                >
                  Decor {{ i + 1 }} · {{ obj.type }}
                </v-btn>
              </template>
              <v-card class="pa-3" min-width="260" @click.stop>
                <AppSelect
                  v-model="obj.type"
                  :items="
                    decorShapeOptions.map((s) => ({ title: s, value: s }))
                  "
                  label="Type"
                  hide-details
                />
                <p class="text-caption mt-3 mb-1">Color</p>
                <div class="d-flex flex-wrap ga-2">
                  <v-btn
                    v-for="color in decorColorOptions"
                    :key="`decor-color-${i}-${color}`"
                    icon
                    size="x-small"
                    :style="{
                      backgroundColor: color,
                      border:
                        obj.color === color
                          ? '2px solid #111827'
                          : '1px solid #cbd5e1',
                    }"
                    @click.stop="obj.color = color"
                  />
                </div>
                <v-slider
                  v-model="obj.size"
                  label="Size"
                  :min="20"
                  :max="420"
                  :step="2"
                  hide-details
                  class="mt-3"
                />
                <v-slider
                  v-model="obj.opacity"
                  label="Opacity"
                  :min="0.02"
                  :max="0.35"
                  :step="0.01"
                  hide-details
                  class="mt-3"
                />
                <v-slider
                  v-model="obj.x"
                  label="X slider"
                  :min="0"
                  :max="100"
                  :step="1"
                  hide-details
                  class="mt-3"
                />
                <v-slider
                  v-model="obj.y"
                  label="Y slider"
                  :min="0"
                  :max="100"
                  :step="1"
                  hide-details
                  class="mt-3"
                />
                <v-btn
                  size="x-small"
                  color="error"
                  variant="text"
                  class="mt-2"
                  @click.stop="removeDecorObject(i)"
                  >remove</v-btn
                >
              </v-card>
            </v-menu>
          </div>
        </template>
        <template #aside>
          <v-row dense>
            <v-col cols="6"
              ><p class="text-body-2">Aside width</p>
              <v-slider
                v-model="asideWidth"
                :min="asideDimensionBounds.widthMin"
                :max="asideDimensionBounds.widthMax"
                :step="2"
                hide-details
            /></v-col>
            <v-col cols="6"
              ><p class="text-body-2">Aside height</p>
              <v-slider
                v-model="asideHeight"
                :min="asideDimensionBounds.heightMin"
                :max="asideDimensionBounds.heightMax"
                :step="2"
                hide-details
            /></v-col>
            <v-col cols="6"
              ><p class="text-body-2">Aside radius</p>
              <v-slider
                v-model="asideRadius"
                :min="0"
                :max="90"
                :step="1"
                hide-details
            /></v-col>
          </v-row>
        </template>
        <template #bar>
          <v-row dense>
            <v-col cols="6"
              ><v-switch
                v-model="sectionBarConfig.show"
                label="Section bar"
                hide-details
                inset
                class="mt-2"
            /></v-col>
            <v-col cols="6"
              ><AppSelect
                v-model="sectionBarConfig.widthType"
                :items="[
                  { title: 'Flex', value: 'flex' },
                  { title: 'Complet', value: 'complete' },
                ]"
                label="Bar width mode"
                hide-details
                class="mt-2"
            /></v-col>
            <v-col cols="6"
              ><p class="text-body-2">Bar height</p>
              <v-slider
                v-model="sectionBarConfig.height"
                :min="1"
                :max="18"
                :step="1"
                hide-details
            /></v-col>
            <v-col cols="6"
              ><p class="text-body-2">Bar radius</p>
              <v-slider
                v-model="sectionBarConfig.radius"
                :min="0"
                :max="999"
                :step="1"
                hide-details
            /></v-col>
          </v-row>
        </template>
        <template #border>
          <v-row dense>
            <v-col cols="6"
              ><v-switch
                v-model="pageBorderEnabled"
                label="Page border"
                hide-details
                inset
                class="mt-2"
            /></v-col>
            <v-col cols="6"
              ><p class="text-body-2">Border width</p>
              <v-slider
                v-model="pageBorderWidth"
                :min="0"
                :max="24"
                :step="1"
                hide-details
            /></v-col>
            <v-col cols="6"
              ><p class="text-body-2">Border radius</p>
              <v-slider
                v-model="pageBorderRadius"
                :min="0"
                :max="60"
                :step="1"
                hide-details
            /></v-col>
            <v-col cols="6"
              ><p class="text-body-2">Border color</p>
              <v-text-field
                v-model="pageBorderColor"
                type="color"
                hide-details
                density="compact"
            /></v-col>
          </v-row>
        </template>
      </ResumePreviewToolbar>

      <div
        ref="cvPreviewRef"
        class="cv-preview-shell"
        :style="{
          '--cv-preview-page-height': `${CV_PREVIEW_PDF_PAGE_HEIGHT}px`,
          '--cv-preview-total-height': `${cvPreviewHeight}px`,
          '--cv-preview-page-width': `${CV_PREVIEW_PAGE_WIDTH}px`,
        }"
      >
        <div
          v-for="(obj, index) in editableDecorObjects"
          :key="`decor-${index}`"
          class="decor-object"
          :class="`decor-${obj.type}`"
          :style="decorObjectStyle(obj)"
        />
        <component
          :is="activeLayoutComponent"
          class="w-100 cv-preview-page"
          :style="{
            background: activeColors?.pageBackground || '#ffffff',
            color: activeColors?.text || '#0f172a',
            height: 'auto',
            minHeight: `${cvPreviewHeight}px`,
            overflow: 'visible',
            '--cv-primary': activeColors?.primary || '#1d4ed8',
            '--cv-secondary': activeColors?.secondary || '#93C5FD',
            '--cv-page-background': activeColors?.pageBackground || '#ffffff',
            '--cv-page-text': activeColors?.text || '#0f172a',
            '--cv-page-muted': activeColors?.muted || '#64748b',
            '--cv-page-border-width': pageBorderEnabled
              ? `${pageBorderWidth}px`
              : '0px',
            '--cv-page-border-color': pageBorderColor,
            '--cv-page-border-radius': `${pageBorderRadius}px`,
            '--cv-aside-width': `${asideWidth}px`,
            '--cv-aside-height': `${asideHeight}px`,
            '--cv-aside-radius': `${asideRadius}px`,
            '--cv-text-fullname': textFontPreset('fullName'),
            '--cv-text-section-label': textFontPreset('sectionLabel'),
            '--cv-text-entry-title': textFontPreset('entryTitle'),
            '--cv-text-body': textFontPreset('body'),
            '--cv-header-text': headerTextColor,
            '--cv-header-muted': headerMutedColor,
            '--cv-section-bar-height': `${sectionBarConfig.height}px`,
            '--cv-section-bar-radius': `${sectionBarConfig.radius}px`,
            '--cv-section-bar-display': sectionBarConfig.show
              ? 'block'
              : 'none',
            '--cv-section-title-width':
              sectionBarConfig.widthType === 'complete'
                ? '100%'
                : 'fit-content',
            '--cv-section-bar-width':
              sectionBarConfig.widthType === 'complete'
                ? '100%'
                : 'calc(100% + 18px)',
          }"
        >
          <template #identity>
            <div
              v-if="isIdentityAsideLayout && shouldRenderIdentityProfile"
              class="cv-header-identity cv-header-identity--aside"
            >
              <div class="cv-photo-wrap">
                <img
                  :src="photoPreview || headerProfile.image"
                  alt="profile"
                  class="cv-header-avatar"
                  :style="{
                    width: `${photoSize}px`,
                    height: `${photoSize}px`,
                    borderRadius: `${photoRadius}px`,
                    border: `${photoBorderWidth}px solid ${photoBorderColor}`,
                  }"
                  @click="openPhotoPicker"
                />
              </div>
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
                font-size="13px"
                font-weight="600"
                :font-family="textFontPreset('body')"
                color="inherit"
                @update:model-value="updateHeaderField('role', $event)"
              />
            </div>
          </template>
          <template #header>
            <div v-if="isIdentityAsideLayout" class="cv-header-contact-grid">
              <div
                v-for="(item, idx) in headerContactItems"
                :key="`identity-contact-${idx}`"
                class="cv-contact-item"
              >
                <v-menu location="bottom start" :close-on-content-click="true">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      size="x-small"
                      variant="text"
                      class="cv-contact-icon-btn"
                    >
                      <v-icon :icon="item.icon" size="16" />
                    </v-btn>
                  </template>
                  <v-list density="compact" class="cv-icon-menu-list">
                    <v-list-item
                      v-for="altIcon in contactIconAlternatives[item.key] || [
                        item.icon,
                      ]"
                      :key="`${item.key}-${altIcon}`"
                      :title="altIcon"
                      @click="updateContactIcon(item.key, altIcon)"
                    >
                      <template #prepend>
                        <v-icon :icon="altIcon" size="16" />
                      </template>
                    </v-list-item>
                  </v-list>
                </v-menu>
                <template v-if="item.type === 'link'">
                  <a
                    class="cv-contact-link"
                    :href="item.value"
                    target="_blank"
                    rel="noopener noreferrer"
                    :title="item.value"
                    >{{ item.label }}</a
                  >
                  <HoverRichTextEditor
                    class="cv-header-editor cv-header-editor--contact cv-header-editor--link-value"
                    :model-value="item.value"
                    :placeholder="item.label || 'Contact'"
                    font-size="12px"
                    font-weight="600"
                    :font-family="textFontPreset('body')"
                    color="inherit"
                    @update:model-value="updateHeaderField(item.key, $event)"
                  />
                </template>
                <HoverRichTextEditor
                  v-else
                  class="cv-header-editor cv-header-editor--contact"
                  :model-value="item.value"
                  :placeholder="item.label || 'Contact'"
                  font-size="13px"
                  font-weight="700"
                  :font-family="textFontPreset('body')"
                  color="inherit"
                  @update:model-value="updateHeaderField(item.key, $event)"
                />
              </div>
            </div>
            <div
              v-else
              class="cv-header-layout"
              :class="`cv-header-layout--${headerType}`"
            >
              <template v-if="headerType === 'header-left'">
                <div class="cv-header-contact cv-col-8">
                  <div class="cv-header-contact-grid">
                    <div
                      v-for="(item, idx) in headerContactItems"
                      :key="`left-${idx}`"
                      class="cv-contact-item"
                    >
                      <v-menu
                        location="bottom start"
                        :close-on-content-click="true"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon
                            size="x-small"
                            variant="text"
                            class="cv-contact-icon-btn"
                          >
                            <v-icon :icon="item.icon" size="16" />
                          </v-btn>
                        </template>
                        <v-list density="compact" class="cv-icon-menu-list">
                          <v-list-item
                            v-for="altIcon in contactIconAlternatives[
                              item.key
                            ] || [item.icon]"
                            :key="`${item.key}-${altIcon}`"
                            :title="altIcon"
                            @click="updateContactIcon(item.key, altIcon)"
                          >
                            <template #prepend
                              ><v-icon :icon="altIcon" size="16"
                            /></template>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                      <template v-if="item.type === 'link'">
                        <a
                          class="cv-contact-link"
                          :href="item.value"
                          target="_blank"
                          rel="noopener noreferrer"
                          :title="item.value"
                          >{{ item.label }}</a
                        >
                        <HoverRichTextEditor
                          class="cv-header-editor cv-header-editor--contact cv-header-editor--link-value"
                          :model-value="item.value"
                          :placeholder="item.label || 'Contact'"
                          font-size="12px"
                          font-weight="600"
                          :font-family="textFontPreset('body')"
                          color="inherit"
                          @update:model-value="
                            updateHeaderField(item.key, $event)
                          "
                        />
                      </template>
                      <HoverRichTextEditor
                        v-else
                        class="cv-header-editor cv-header-editor--contact"
                        :model-value="item.value"
                        :placeholder="item.label || 'Contact'"
                        font-size="13px"
                        font-weight="700"
                        :font-family="textFontPreset('body')"
                        color="inherit"
                        @update:model-value="
                          updateHeaderField(item.key, $event)
                        "
                      />
                    </div>
                  </div>
                </div>
                <div class="cv-header-identity cv-col-4">
                  <div class="cv-photo-wrap">
                    <img
                      :src="photoPreview || headerProfile.image"
                      alt="profile"
                      class="cv-header-avatar"
                      :style="{
                        width: `${photoSize}px`,
                        height: `${photoSize}px`,
                        borderRadius: `${photoRadius}px`,
                        border: `${photoBorderWidth}px solid ${photoBorderColor}`,
                      }"
                      @click="openPhotoPicker"
                    /><v-menu
                      v-model="photoMenuOpen"
                      location="right start"
                      :close-on-content-click="false"
                      ><template #activator="{ props }"
                        ><v-btn
                          icon="mdi-dots-vertical"
                          size="x-small"
                          class="cv-photo-menu-btn"
                          v-bind="props"
                          @click.stop /></template
                      ><v-card class="pa-3" min-width="220"
                        ><v-slider
                          v-model="photoSize"
                          label="Size"
                          :min="48"
                          :max="180"
                          :step="2"
                          hide-details
                          class="mb-2" /><v-slider
                          v-model="photoRadius"
                          label="Radius"
                          :min="0"
                          :max="999"
                          :step="1"
                          hide-details
                          class="mb-2" /><v-slider
                          v-model="photoBorderWidth"
                          label="Border"
                          :min="0"
                          :max="12"
                          :step="1"
                          hide-details
                          class="mb-2" />
                        <div class="cv-color-grid">
                          <button
                            v-for="c in photoColors"
                            :key="c"
                            class="cv-color-dot"
                            :style="{ background: c }"
                            @click="photoBorderColor = c"
                          /></div></v-card
                    ></v-menu>
                  </div>
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
                    font-weight="700"
                    :font-family="textFontPreset('body')"
                    color="inherit"
                    @update:model-value="updateHeaderField('role', $event)"
                  />
                </div>
              </template>
              <template v-else-if="headerType === 'header-right'">
                <div class="cv-header-identity cv-col-4">
                  <div class="cv-photo-wrap">
                    <img
                      :src="photoPreview || headerProfile.image"
                      alt="profile"
                      class="cv-header-avatar"
                      :style="{
                        width: `${photoSize}px`,
                        height: `${photoSize}px`,
                        borderRadius: `${photoRadius}px`,
                        border: `${photoBorderWidth}px solid ${photoBorderColor}`,
                      }"
                      @click="openPhotoPicker"
                    /><v-menu
                      v-model="photoMenuOpen"
                      location="right start"
                      :close-on-content-click="false"
                      ><template #activator="{ props }"
                        ><v-btn
                          icon="mdi-dots-vertical"
                          size="x-small"
                          class="cv-photo-menu-btn"
                          v-bind="props"
                          @click.stop /></template
                      ><v-card class="pa-3" min-width="220"
                        ><v-slider
                          v-model="photoSize"
                          label="Size"
                          :min="48"
                          :max="180"
                          :step="2"
                          hide-details
                          class="mb-2" /><v-slider
                          v-model="photoRadius"
                          label="Radius"
                          :min="0"
                          :max="999"
                          :step="1"
                          hide-details
                          class="mb-2" /><v-slider
                          v-model="photoBorderWidth"
                          label="Border"
                          :min="0"
                          :max="12"
                          :step="1"
                          hide-details
                          class="mb-2" />
                        <div class="cv-color-grid">
                          <button
                            v-for="c in photoColors"
                            :key="c"
                            class="cv-color-dot"
                            :style="{ background: c }"
                            @click="photoBorderColor = c"
                          /></div></v-card
                    ></v-menu>
                  </div>
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
                    font-weight="700"
                    :font-family="textFontPreset('body')"
                    color="inherit"
                    @update:model-value="updateHeaderField('role', $event)"
                  />
                </div>
                <div class="cv-header-contact cv-col-8">
                  <div class="cv-header-contact-grid">
                    <div
                      v-for="(item, idx) in headerContactItems"
                      :key="`right-${idx}`"
                      class="cv-contact-item"
                    >
                      <v-menu
                        location="bottom start"
                        :close-on-content-click="true"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon
                            size="x-small"
                            variant="text"
                            class="cv-contact-icon-btn"
                          >
                            <v-icon :icon="item.icon" size="16" />
                          </v-btn>
                        </template>
                        <v-list density="compact" class="cv-icon-menu-list">
                          <v-list-item
                            v-for="altIcon in contactIconAlternatives[
                              item.key
                            ] || [item.icon]"
                            :key="`${item.key}-${altIcon}`"
                            :title="altIcon"
                            @click="updateContactIcon(item.key, altIcon)"
                          >
                            <template #prepend
                              ><v-icon :icon="altIcon" size="16"
                            /></template>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                      <template v-if="item.type === 'link'">
                        <a
                          class="cv-contact-link"
                          :href="item.value"
                          target="_blank"
                          rel="noopener noreferrer"
                          :title="item.value"
                          >{{ item.label }}</a
                        >
                        <HoverRichTextEditor
                          class="cv-header-editor cv-header-editor--contact cv-header-editor--link-value"
                          :model-value="item.value"
                          :placeholder="item.label || 'Contact'"
                          font-size="12px"
                          font-weight="600"
                          :font-family="textFontPreset('body')"
                          color="inherit"
                          @update:model-value="
                            updateHeaderField(item.key, $event)
                          "
                        />
                      </template>
                      <HoverRichTextEditor
                        v-else
                        class="cv-header-editor cv-header-editor--contact"
                        :model-value="item.value"
                        :placeholder="item.label || 'Contact'"
                        font-size="13px"
                        font-weight="700"
                        :font-family="textFontPreset('body')"
                        color="inherit"
                        @update:model-value="
                          updateHeaderField(item.key, $event)
                        "
                      />
                    </div>
                  </div>
                </div>
              </template>
              <template v-else-if="headerType === 'header-split'">
                <div class="cv-header-split-left cv-col-6">
                  <div class="cv-photo-wrap">
                    <img
                      :src="photoPreview || headerProfile.image"
                      alt="profile"
                      class="cv-header-avatar"
                      :style="{
                        width: `${photoSize}px`,
                        height: `${photoSize}px`,
                        borderRadius: `${photoRadius}px`,
                        border: `${photoBorderWidth}px solid ${photoBorderColor}`,
                      }"
                      @click="openPhotoPicker"
                    /><v-menu
                      v-model="photoMenuOpen"
                      location="right start"
                      :close-on-content-click="false"
                      ><template #activator="{ props }"
                        ><v-btn
                          icon="mdi-dots-vertical"
                          size="x-small"
                          class="cv-photo-menu-btn"
                          v-bind="props"
                          @click.stop /></template
                      ><v-card class="pa-3" min-width="220"
                        ><v-slider
                          v-model="photoSize"
                          label="Size"
                          :min="48"
                          :max="180"
                          :step="2"
                          hide-details
                          class="mb-2" /><v-slider
                          v-model="photoRadius"
                          label="Radius"
                          :min="0"
                          :max="999"
                          :step="1"
                          hide-details
                          class="mb-2" /><v-slider
                          v-model="photoBorderWidth"
                          label="Border"
                          :min="0"
                          :max="12"
                          :step="1"
                          hide-details
                          class="mb-2" />
                        <div class="cv-color-grid">
                          <button
                            v-for="c in photoColors"
                            :key="c"
                            class="cv-color-dot"
                            :style="{ background: c }"
                            @click="photoBorderColor = c"
                          /></div></v-card
                    ></v-menu>
                  </div>
                  <div class="cv-header-identity cv-header-identity--split">
                    <HoverRichTextEditor
                      class="cv-header-editor cv-header-editor--name"
                      :model-value="headerProfile.fullName"
                      placeholder="Full name"
                      font-size="22px"
                      font-weight="700"
                      :font-family="textFontPreset('fullName')"
                      color="inherit"
                      @update:model-value="
                        updateHeaderField('fullName', $event)
                      "
                    />
                    <HoverRichTextEditor
                      class="cv-header-editor cv-header-editor--role"
                      :model-value="headerProfile.role"
                      placeholder="Role"
                      font-size="13px"
                      font-weight="600"
                      :font-family="textFontPreset('body')"
                      :color="headerMutedColor"
                      @update:model-value="updateHeaderField('role', $event)"
                    />
                  </div>
                </div>
                <div class="cv-col-6 cv-header-contact">
                  <div class="cv-header-contact-grid">
                    <div
                      v-for="(item, idx) in headerContactItems"
                      :key="`split-${idx}`"
                      class="cv-contact-item"
                    >
                      <v-menu
                        location="bottom start"
                        :close-on-content-click="true"
                      >
                        <template #activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon
                            size="x-small"
                            variant="text"
                            class="cv-contact-icon-btn"
                          >
                            <v-icon :icon="item.icon" size="16" />
                          </v-btn>
                        </template>
                        <v-list density="compact" class="cv-icon-menu-list">
                          <v-list-item
                            v-for="altIcon in contactIconAlternatives[
                              item.key
                            ] || [item.icon]"
                            :key="`${item.key}-${altIcon}`"
                            :title="altIcon"
                            @click="updateContactIcon(item.key, altIcon)"
                          >
                            <template #prepend
                              ><v-icon :icon="altIcon" size="16"
                            /></template>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                      <template v-if="item.type === 'link'">
                        <a
                          class="cv-contact-link"
                          :href="item.value"
                          target="_blank"
                          rel="noopener noreferrer"
                          :title="item.value"
                          >{{ item.label }}</a
                        >
                        <HoverRichTextEditor
                          class="cv-header-editor cv-header-editor--contact cv-header-editor--link-value"
                          :model-value="item.value"
                          :placeholder="item.label || 'Contact'"
                          font-size="12px"
                          font-weight="600"
                          :font-family="textFontPreset('body')"
                          color="inherit"
                          @update:model-value="
                            updateHeaderField(item.key, $event)
                          "
                        />
                      </template>
                      <HoverRichTextEditor
                        v-else
                        class="cv-header-editor cv-header-editor--contact"
                        :model-value="item.value"
                        :placeholder="item.label || 'Contact'"
                        font-size="13px"
                        font-weight="700"
                        :font-family="textFontPreset('body')"
                        color="inherit"
                        @update:model-value="
                          updateHeaderField(item.key, $event)
                        "
                      />
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </template>
          <template #aside>
            <div
              v-if="
                isSideContentLayout && normalizedStructure === 'structure-1'
              "
              :class="[
                'cv-aside-sections',
                {
                  'cv-aside-sections--full': [
                    'aside-full-left',
                    'aside-full-right',
                  ].includes(String(activeTemplate?.layout || '')),
                },
              ]"
            >
              <div
                v-for="section in visibleAsideOneSections"
                :key="`aside-s1-${section}`"
                class="cv-aside-section-item"
                :style="sectionOffsetStyle('asideOne', section)"
                draggable="true"
                @dragstart="onSectionDragStart('asideOne', section)"
                @dragover.prevent
                @drop="onSectionDrop('asideOne', section)"
                @dragend="onSectionDragEnd"
              >
                <div class="cv-section-toolbar">
                  <AppSelect
                    v-model="sectionTypeOverrides[toSectionKey(section)]"
                    :items="getSectionVariantOptions(toSectionKey(section))"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    prepend-inner-icon="mdi-shape-outline"
                    class="cv-variant-select"
                  /><AppSelect
                    :model-value="
                      effectiveSectionTitleStyle(toSectionKey(section))
                    "
                    :items="sectionTitleStyleOptions"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    prepend-inner-icon="mdi-format-title"
                    class="cv-title-style-select"
                    @update:model-value="
                      updateSectionTitleStyle(toSectionKey(section), $event)
                    "
                  /><AppSelect
                    v-if="isSectionColumnEditable(toSectionKey(section))"
                    :model-value="effectiveSectionColumn(toSectionKey(section))"
                    :items="sectionColumnOptions"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :prepend-inner-icon="
                      sectionColumnIcon(toSectionKey(section))
                    "
                    class="cv-column-select"
                    @update:model-value="
                      updateSectionColumn(toSectionKey(section), $event)
                    "
                  /><v-btn
                    icon="mdi-plus"
                    size="x-small"
                    variant="text"
                    @click.stop="addSectionItem(toSectionKey(section))"
                  /><v-btn
                    icon="mdi-minus"
                    size="x-small"
                    variant="text"
                    @click.stop="
                      hideSectionFromZone('asideOne', toSectionKey(section))
                    "
                  /><v-btn
                    icon="mdi-arrow-up"
                    size="x-small"
                    variant="text"
                    @click.stop="shiftSectionByLine('asideOne', section, 'up')"
                  /><v-btn
                    icon="mdi-arrow-down"
                    size="x-small"
                    variant="text"
                    @click.stop="
                      shiftSectionByLine('asideOne', section, 'down')
                    "
                  /><v-btn
                    icon="mdi-drag"
                    size="x-small"
                    variant="text"
                    @click.stop="moveSection('asideOne', section, 'down')"
                  />
                </div>
                <CvSectionTitleToolbar
                  :section-key="toSectionKey(section)"
                  :title="sectionDisplayTitle(section)"
                  :icon="sectionIcon(toSectionKey(section))"
                  :icon-alternatives="
                    getSectionIconOptions(toSectionKey(section)).map(
                      (item) => item.value,
                    )
                  "
                  :title-style="
                    effectiveSectionTitleStyle(toSectionKey(section))
                  "
                  :font-family="textFontPreset('sectionLabel')"
                  @update:title="updateSectionDisplayTitle(section, $event)"
                  @update:icon="setSectionIcon(section, $event)"
                />
                <CvEditableSectionContent
                  :section-key="toSectionKey(section)"
                  :variant="
                    effectiveSectionType(
                      toSectionKey(section),
                      sectionType(toSectionKey(section) as any),
                    )
                  "
                  :items="getEditableSectionItems(section)"
                  :content-style="
                    effectiveSectionContentStyle(toSectionKey(section))
                  "
                  :date-style="effectiveSectionDateStyle(toSectionKey(section))"
                  @update-item="
                    (index, value) =>
                      updateEditableSectionItem(section, index, value)
                  "
                />
              </div>
            </div>
            <div
              v-else-if="
                isSideContentLayout && normalizedStructure === 'structure-2'
              "
              :class="[
                'cv-aside-sections',
                {
                  'cv-aside-sections--full': [
                    'aside-full-left',
                    'aside-full-right',
                  ].includes(String(activeTemplate?.layout || '')),
                },
              ]"
            >
              <div
                v-for="section in visibleAsideTwoSections"
                :key="`aside-s2-${section}`"
                class="cv-aside-section-item"
                :style="sectionOffsetStyle('asideTwo', section)"
                draggable="true"
                @dragstart="onSectionDragStart('asideTwo', section)"
                @dragover.prevent
                @drop="onSectionDrop('asideTwo', section)"
                @dragend="onSectionDragEnd"
              >
                <div class="cv-section-toolbar">
                  <AppSelect
                    v-model="sectionTypeOverrides[toSectionKey(section)]"
                    :items="getSectionVariantOptions(toSectionKey(section))"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    prepend-inner-icon="mdi-shape-outline"
                    class="cv-variant-select"
                  /><AppSelect
                    :model-value="
                      effectiveSectionTitleStyle(toSectionKey(section))
                    "
                    :items="sectionTitleStyleOptions"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    prepend-inner-icon="mdi-format-title"
                    class="cv-title-style-select"
                    @update:model-value="
                      updateSectionTitleStyle(toSectionKey(section), $event)
                    "
                  /><AppSelect
                    v-if="isSectionColumnEditable(toSectionKey(section))"
                    :model-value="effectiveSectionColumn(toSectionKey(section))"
                    :items="sectionColumnOptions"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :prepend-inner-icon="
                      sectionColumnIcon(toSectionKey(section))
                    "
                    class="cv-column-select"
                    @update:model-value="
                      updateSectionColumn(toSectionKey(section), $event)
                    "
                  /><v-btn
                    icon="mdi-plus"
                    size="x-small"
                    variant="text"
                    @click.stop="addSectionItem(toSectionKey(section))"
                  /><v-btn
                    icon="mdi-minus"
                    size="x-small"
                    variant="text"
                    @click.stop="
                      hideSectionFromZone('asideTwo', toSectionKey(section))
                    "
                  /><v-btn
                    icon="mdi-arrow-up"
                    size="x-small"
                    variant="text"
                    @click.stop="shiftSectionByLine('asideTwo', section, 'up')"
                  /><v-btn
                    icon="mdi-arrow-down"
                    size="x-small"
                    variant="text"
                    @click.stop="
                      shiftSectionByLine('asideTwo', section, 'down')
                    "
                  /><v-btn
                    icon="mdi-drag"
                    size="x-small"
                    variant="text"
                    @click.stop="moveSection('asideTwo', section, 'down')"
                  />
                </div>
                <CvSectionTitleToolbar
                  :section-key="toSectionKey(section)"
                  :title="sectionDisplayTitle(section)"
                  :icon="sectionIcon(toSectionKey(section))"
                  :icon-alternatives="
                    getSectionIconOptions(toSectionKey(section)).map(
                      (item) => item.value,
                    )
                  "
                  :title-style="
                    effectiveSectionTitleStyle(toSectionKey(section))
                  "
                  :font-family="textFontPreset('sectionLabel')"
                  @update:title="updateSectionDisplayTitle(section, $event)"
                  @update:icon="setSectionIcon(section, $event)"
                />
                <CvEditableSectionContent
                  :section-key="toSectionKey(section)"
                  :variant="
                    effectiveSectionType(
                      toSectionKey(section),
                      sectionType(toSectionKey(section) as any),
                    )
                  "
                  :items="getEditableSectionItems(section)"
                  :content-style="
                    effectiveSectionContentStyle(toSectionKey(section))
                  "
                  :date-style="effectiveSectionDateStyle(toSectionKey(section))"
                  @update-item="
                    (index, value) =>
                      updateEditableSectionItem(section, index, value)
                  "
                />
              </div>
            </div>
          </template>

          <template #content>
            <div
              v-if="
                isSideContentLayout && normalizedStructure === 'structure-1'
              "
              class="cv-sections-list"
            >
              <div
                v-for="section in visibleContentBaseSections"
                :key="`content-base-${section}`"
                :class="[
                  'cv-section-row',
                  contentColumnClass(toSectionKey(section)),
                ]"
                :style="sectionOffsetStyle('contentBase', section)"
                draggable="true"
                @dragstart="onSectionDragStart('contentBase', section)"
                @dragover.prevent
                @drop="onSectionDrop('contentBase', section)"
                @dragend="onSectionDragEnd"
              >
                <div class="cv-section-toolbar">
                  <AppSelect
                    v-model="sectionTypeOverrides[toSectionKey(section)]"
                    :items="getSectionVariantOptions(toSectionKey(section))"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    prepend-inner-icon="mdi-shape-outline"
                    class="cv-variant-select"
                  /><AppSelect
                    :model-value="
                      effectiveSectionTitleStyle(toSectionKey(section))
                    "
                    :items="sectionTitleStyleOptions"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    prepend-inner-icon="mdi-format-title"
                    class="cv-title-style-select"
                    @update:model-value="
                      updateSectionTitleStyle(toSectionKey(section), $event)
                    "
                  /><AppSelect
                    v-if="isSectionColumnEditable(toSectionKey(section))"
                    :model-value="effectiveSectionColumn(toSectionKey(section))"
                    :items="sectionColumnOptions"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :prepend-inner-icon="
                      sectionColumnIcon(toSectionKey(section))
                    "
                    class="cv-column-select"
                    @update:model-value="
                      updateSectionColumn(toSectionKey(section), $event)
                    "
                  /><v-btn
                    icon="mdi-plus"
                    size="x-small"
                    variant="text"
                    @click.stop="addSectionItem(toSectionKey(section))"
                  /><v-btn
                    icon="mdi-minus"
                    size="x-small"
                    variant="text"
                    @click.stop="hideSection(toSectionKey(section))"
                  /><v-btn
                    icon="mdi-arrow-up"
                    size="x-small"
                    variant="text"
                    @click.stop="
                      shiftSectionByLine('contentBase', section, 'up')
                    "
                  /><v-btn
                    icon="mdi-arrow-down"
                    size="x-small"
                    variant="text"
                    @click.stop="
                      shiftSectionByLine('contentBase', section, 'down')
                    "
                  /><v-btn
                    icon="mdi-drag"
                    size="x-small"
                    variant="text"
                    @click.stop="moveSection('contentBase', section, 'down')"
                  />
                </div>
                <CvSectionTitleToolbar
                  :section-key="toSectionKey(section)"
                  :title="sectionDisplayTitle(section)"
                  :icon="sectionIcon(toSectionKey(section))"
                  :icon-alternatives="
                    getSectionIconOptions(toSectionKey(section)).map(
                      (item) => item.value,
                    )
                  "
                  :title-style="
                    effectiveSectionTitleStyle(toSectionKey(section))
                  "
                  :font-family="textFontPreset('sectionLabel')"
                  @update:title="updateSectionDisplayTitle(section, $event)"
                  @update:icon="setSectionIcon(section, $event)"
                />
                <CvEditableSectionContent
                  :section-key="toSectionKey(section)"
                  :variant="
                    effectiveSectionType(
                      toSectionKey(section),
                      sectionType(toSectionKey(section) as any),
                    )
                  "
                  :items="getEditableSectionItems(section)"
                  :content-style="
                    effectiveSectionContentStyle(toSectionKey(section))
                  "
                  :date-style="effectiveSectionDateStyle(toSectionKey(section))"
                  @update-item="
                    (index, value) =>
                      updateEditableSectionItem(section, index, value)
                  "
                />
              </div>
            </div>
            <div
              v-else-if="
                isSideContentLayout && normalizedStructure === 'structure-2'
              "
              class="cv-sections-structure-2"
            >
              <div
                v-for="section in visibleContentStructure2Sections"
                :key="`content-s2-${section}`"
                :class="[
                  'cv-section-row',
                  contentColumnClass(toSectionKey(section)),
                ]"
                :style="sectionOffsetStyle('contentStructure2', section)"
                draggable="true"
                @dragstart="onSectionDragStart('contentStructure2', section)"
                @dragover.prevent
                @drop="onSectionDrop('contentStructure2', section)"
                @dragend="onSectionDragEnd"
              >
                <div class="cv-section-toolbar">
                  <AppSelect
                    v-model="sectionTypeOverrides[toSectionKey(section)]"
                    :items="getSectionVariantOptions(toSectionKey(section))"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    prepend-inner-icon="mdi-shape-outline"
                    class="cv-variant-select"
                  /><AppSelect
                    :model-value="
                      effectiveSectionTitleStyle(toSectionKey(section))
                    "
                    :items="sectionTitleStyleOptions"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    prepend-inner-icon="mdi-format-title"
                    class="cv-title-style-select"
                    @update:model-value="
                      updateSectionTitleStyle(toSectionKey(section), $event)
                    "
                  /><AppSelect
                    v-if="isSectionColumnEditable(toSectionKey(section))"
                    :model-value="effectiveSectionColumn(toSectionKey(section))"
                    :items="sectionColumnOptions"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :prepend-inner-icon="
                      sectionColumnIcon(toSectionKey(section))
                    "
                    class="cv-column-select"
                    @update:model-value="
                      updateSectionColumn(toSectionKey(section), $event)
                    "
                  /><v-btn
                    icon="mdi-plus"
                    size="x-small"
                    variant="text"
                    @click.stop="addSectionItem(toSectionKey(section))"
                  /><v-btn
                    icon="mdi-minus"
                    size="x-small"
                    variant="text"
                    @click.stop="hideSection(toSectionKey(section))"
                  /><v-btn
                    icon="mdi-arrow-up"
                    size="x-small"
                    variant="text"
                    @click.stop="
                      shiftSectionByLine('contentStructure2', section, 'up')
                    "
                  /><v-btn
                    icon="mdi-arrow-down"
                    size="x-small"
                    variant="text"
                    @click.stop="
                      shiftSectionByLine('contentStructure2', section, 'down')
                    "
                  /><v-btn
                    icon="mdi-drag"
                    size="x-small"
                    variant="text"
                    @click.stop="
                      moveSection('contentStructure2', section, 'down')
                    "
                  />
                </div>
                <CvSectionTitleToolbar
                  :section-key="toSectionKey(section)"
                  :title="sectionDisplayTitle(section)"
                  :icon="sectionIcon(toSectionKey(section))"
                  :icon-alternatives="
                    getSectionIconOptions(toSectionKey(section)).map(
                      (item) => item.value,
                    )
                  "
                  :title-style="
                    effectiveSectionTitleStyle(toSectionKey(section))
                  "
                  :font-family="textFontPreset('sectionLabel')"
                  @update:title="updateSectionDisplayTitle(section, $event)"
                  @update:icon="setSectionIcon(section, $event)"
                />
                <CvEditableSectionContent
                  :section-key="toSectionKey(section)"
                  :variant="
                    effectiveSectionType(
                      toSectionKey(section),
                      sectionType(toSectionKey(section) as any),
                    )
                  "
                  :items="getEditableSectionItems(section)"
                  :content-style="
                    effectiveSectionContentStyle(toSectionKey(section))
                  "
                  :date-style="effectiveSectionDateStyle(toSectionKey(section))"
                  @update-item="
                    (index, value) =>
                      updateEditableSectionItem(section, index, value)
                  "
                />
              </div>
            </div>
            <div
              v-else-if="
                isMainStructureLayout && normalizedStructure === 'structure-1'
              "
              class="cv-sections-list"
            >
              <div
                v-for="section in visibleMainOneSections"
                :key="`s1-${section}`"
                :class="[
                  'cv-section-row',
                  contentColumnClass(toSectionKey(section)),
                ]"
                :style="sectionOffsetStyle('mainOne', section)"
                draggable="true"
                @dragstart="onSectionDragStart('mainOne', section)"
                @dragover.prevent
                @drop="onSectionDrop('mainOne', section)"
                @dragend="onSectionDragEnd"
              >
                <div class="cv-section-toolbar">
                  <AppSelect
                    v-model="sectionTypeOverrides[toSectionKey(section)]"
                    :items="getSectionVariantOptions(toSectionKey(section))"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    prepend-inner-icon="mdi-shape-outline"
                    class="cv-variant-select"
                  /><AppSelect
                    :model-value="
                      effectiveSectionTitleStyle(toSectionKey(section))
                    "
                    :items="sectionTitleStyleOptions"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    prepend-inner-icon="mdi-format-title"
                    class="cv-title-style-select"
                    @update:model-value="
                      updateSectionTitleStyle(toSectionKey(section), $event)
                    "
                  /><AppSelect
                    v-if="isSectionColumnEditable(toSectionKey(section))"
                    :model-value="effectiveSectionColumn(toSectionKey(section))"
                    :items="sectionColumnOptions"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :prepend-inner-icon="
                      sectionColumnIcon(toSectionKey(section))
                    "
                    class="cv-column-select"
                    @update:model-value="
                      updateSectionColumn(toSectionKey(section), $event)
                    "
                  /><v-btn
                    icon="mdi-plus"
                    size="x-small"
                    variant="text"
                    @click.stop="addSectionItem(toSectionKey(section))"
                  /><v-btn
                    icon="mdi-minus"
                    size="x-small"
                    variant="text"
                    @click.stop="hideSection(toSectionKey(section))"
                  /><v-btn
                    icon="mdi-arrow-up"
                    size="x-small"
                    variant="text"
                    @click.stop="shiftSectionByLine('mainOne', section, 'up')"
                  /><v-btn
                    icon="mdi-arrow-down"
                    size="x-small"
                    variant="text"
                    @click.stop="shiftSectionByLine('mainOne', section, 'down')"
                  /><v-btn
                    icon="mdi-drag"
                    size="x-small"
                    variant="text"
                    @click.stop="moveSection('mainOne', section, 'down')"
                  />
                </div>
                <CvSectionTitleToolbar
                  :section-key="toSectionKey(section)"
                  :title="sectionDisplayTitle(section)"
                  :icon="sectionIcon(toSectionKey(section))"
                  :icon-alternatives="
                    getSectionIconOptions(toSectionKey(section)).map(
                      (item) => item.value,
                    )
                  "
                  :title-style="
                    effectiveSectionTitleStyle(toSectionKey(section))
                  "
                  :font-family="textFontPreset('sectionLabel')"
                  @update:title="updateSectionDisplayTitle(section, $event)"
                  @update:icon="setSectionIcon(section, $event)"
                />
                <CvEditableSectionContent
                  :section-key="toSectionKey(section)"
                  :variant="
                    effectiveSectionType(
                      toSectionKey(section),
                      sectionType(toSectionKey(section) as any),
                    )
                  "
                  :items="getEditableSectionItems(section)"
                  :content-style="
                    effectiveSectionContentStyle(toSectionKey(section))
                  "
                  :date-style="effectiveSectionDateStyle(toSectionKey(section))"
                  @update-item="
                    (index, value) =>
                      updateEditableSectionItem(section, index, value)
                  "
                />
              </div>
            </div>
            <div
              v-else-if="
                isMainStructureLayout && normalizedStructure === 'structure-2'
              "
              class="cv-sections-structure-2"
            >
              <div
                v-for="section in visibleMainTwoTopSections"
                :key="`s2-top-${section}`"
                :class="[
                  'cv-section-row',
                  contentColumnClass(toSectionKey(section)),
                ]"
                :style="sectionOffsetStyle('mainTwoTop', section)"
                draggable="true"
                @dragstart="onSectionDragStart('mainTwoTop', section)"
                @dragover.prevent
                @drop="onSectionDrop('mainTwoTop', section)"
                @dragend="onSectionDragEnd"
              >
                <div class="cv-section-toolbar">
                  <AppSelect
                    v-model="sectionTypeOverrides[toSectionKey(section)]"
                    :items="getSectionVariantOptions(toSectionKey(section))"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    prepend-inner-icon="mdi-shape-outline"
                    class="cv-variant-select"
                  /><AppSelect
                    :model-value="
                      effectiveSectionTitleStyle(toSectionKey(section))
                    "
                    :items="sectionTitleStyleOptions"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    prepend-inner-icon="mdi-format-title"
                    class="cv-title-style-select"
                    @update:model-value="
                      updateSectionTitleStyle(toSectionKey(section), $event)
                    "
                  /><AppSelect
                    v-if="isSectionColumnEditable(toSectionKey(section))"
                    :model-value="effectiveSectionColumn(toSectionKey(section))"
                    :items="sectionColumnOptions"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :prepend-inner-icon="
                      sectionColumnIcon(toSectionKey(section))
                    "
                    class="cv-column-select"
                    @update:model-value="
                      updateSectionColumn(toSectionKey(section), $event)
                    "
                  /><v-btn
                    icon="mdi-plus"
                    size="x-small"
                    variant="text"
                    @click.stop="addSectionItem(toSectionKey(section))"
                  /><v-btn
                    icon="mdi-minus"
                    size="x-small"
                    variant="text"
                    @click.stop="hideSection(toSectionKey(section))"
                  /><v-btn
                    icon="mdi-arrow-up"
                    size="x-small"
                    variant="text"
                    @click.stop="
                      shiftSectionByLine('mainTwoTop', section, 'up')
                    "
                  /><v-btn
                    icon="mdi-arrow-down"
                    size="x-small"
                    variant="text"
                    @click.stop="
                      shiftSectionByLine('mainTwoTop', section, 'down')
                    "
                  /><v-btn
                    icon="mdi-drag"
                    size="x-small"
                    variant="text"
                    @click.stop="moveSection('mainTwoTop', section, 'down')"
                  />
                </div>
                <CvSectionTitleToolbar
                  :section-key="toSectionKey(section)"
                  :title="sectionDisplayTitle(section)"
                  :icon="sectionIcon(toSectionKey(section))"
                  :icon-alternatives="
                    getSectionIconOptions(toSectionKey(section)).map(
                      (item) => item.value,
                    )
                  "
                  :title-style="
                    effectiveSectionTitleStyle(toSectionKey(section))
                  "
                  :font-family="textFontPreset('sectionLabel')"
                  @update:title="updateSectionDisplayTitle(section, $event)"
                  @update:icon="setSectionIcon(section, $event)"
                />
                <CvEditableSectionContent
                  :section-key="toSectionKey(section)"
                  :variant="
                    effectiveSectionType(
                      toSectionKey(section),
                      sectionType(toSectionKey(section) as any),
                    )
                  "
                  :items="getEditableSectionItems(section)"
                  :content-style="
                    effectiveSectionContentStyle(toSectionKey(section))
                  "
                  :date-style="effectiveSectionDateStyle(toSectionKey(section))"
                  @update-item="
                    (index, value) =>
                      updateEditableSectionItem(section, index, value)
                  "
                />
              </div>
              <v-row class="mt-1" dense>
                <v-col cols="6">
                  <div
                    v-for="section in visibleMainTwoLeftSections"
                    :key="`s2-left-${section}`"
                    :class="[
                      'cv-section-row',
                      contentColumnClass(toSectionKey(section)),
                    ]"
                    :style="sectionOffsetStyle('mainTwoLeft', section)"
                    draggable="true"
                    @dragstart="onSectionDragStart('mainTwoLeft', section)"
                    @dragover.prevent
                    @drop="onSectionDrop('mainTwoLeft', section)"
                    @dragend="onSectionDragEnd"
                  >
                    <div class="cv-section-toolbar">
                      <AppSelect
                        v-model="sectionTypeOverrides[toSectionKey(section)]"
                        :items="getSectionVariantOptions(toSectionKey(section))"
                        item-title="title"
                        item-value="value"
                        density="compact"
                        variant="outlined"
                        hide-details
                        prepend-inner-icon="mdi-shape-outline"
                        class="cv-variant-select"
                      /><AppSelect
                        :model-value="
                          effectiveSectionTitleStyle(toSectionKey(section))
                        "
                        :items="sectionTitleStyleOptions"
                        item-title="title"
                        item-value="value"
                        density="compact"
                        variant="outlined"
                        hide-details
                        prepend-inner-icon="mdi-format-title"
                        class="cv-title-style-select"
                        @update:model-value="
                          updateSectionTitleStyle(toSectionKey(section), $event)
                        "
                      /><AppSelect
                        v-if="isSectionColumnEditable(toSectionKey(section))"
                        :model-value="
                          effectiveSectionColumn(toSectionKey(section))
                        "
                        :items="sectionColumnOptions"
                        item-title="title"
                        item-value="value"
                        density="compact"
                        variant="outlined"
                        hide-details
                        :prepend-inner-icon="
                          sectionColumnIcon(toSectionKey(section))
                        "
                        class="cv-column-select"
                        @update:model-value="
                          updateSectionColumn(toSectionKey(section), $event)
                        "
                      /><v-btn
                        icon="mdi-plus"
                        size="x-small"
                        variant="text"
                        @click.stop="addSectionItem(toSectionKey(section))"
                      /><v-btn
                        icon="mdi-minus"
                        size="x-small"
                        variant="text"
                        @click.stop="hideSection(toSectionKey(section))"
                      /><v-btn
                        icon="mdi-arrow-up"
                        size="x-small"
                        variant="text"
                        @click.stop="
                          shiftSectionByLine('mainTwoLeft', section, 'up')
                        "
                      /><v-btn
                        icon="mdi-arrow-down"
                        size="x-small"
                        variant="text"
                        @click.stop="
                          shiftSectionByLine('mainTwoLeft', section, 'down')
                        "
                      /><v-btn
                        icon="mdi-drag"
                        size="x-small"
                        variant="text"
                        @click.stop="
                          moveSection('mainTwoLeft', section, 'down')
                        "
                      />
                    </div>
                    <CvSectionTitleToolbar
                      :section-key="toSectionKey(section)"
                      :title="sectionDisplayTitle(section)"
                      :icon="sectionIcon(toSectionKey(section))"
                      :icon-alternatives="
                        getSectionIconOptions(toSectionKey(section)).map(
                          (item) => item.value,
                        )
                      "
                      :title-style="
                        effectiveSectionTitleStyle(toSectionKey(section))
                      "
                      :font-family="textFontPreset('sectionLabel')"
                      @update:title="updateSectionDisplayTitle(section, $event)"
                      @update:icon="setSectionIcon(section, $event)"
                    />
                    <CvEditableSectionContent
                      :section-key="toSectionKey(section)"
                      :variant="
                        effectiveSectionType(
                          toSectionKey(section),
                          sectionType(toSectionKey(section) as any),
                        )
                      "
                      :items="getEditableSectionItems(section)"
                      :content-style="
                        effectiveSectionContentStyle(toSectionKey(section))
                      "
                      :date-style="
                        effectiveSectionDateStyle(toSectionKey(section))
                      "
                      @update-item="
                        (index, value) =>
                          updateEditableSectionItem(section, index, value)
                      "
                    />
                  </div>
                </v-col>
                <v-col cols="6">
                  <div
                    v-for="section in visibleMainTwoRightSections"
                    :key="`s2-right-${section}`"
                    :class="[
                      'cv-section-row',
                      contentColumnClass(toSectionKey(section)),
                    ]"
                    :style="sectionOffsetStyle('mainTwoRight', section)"
                    draggable="true"
                    @dragstart="onSectionDragStart('mainTwoRight', section)"
                    @dragover.prevent
                    @drop="onSectionDrop('mainTwoRight', section)"
                    @dragend="onSectionDragEnd"
                  >
                    <div class="cv-section-toolbar">
                      <AppSelect
                        v-model="sectionTypeOverrides[toSectionKey(section)]"
                        :items="getSectionVariantOptions(toSectionKey(section))"
                        item-title="title"
                        item-value="value"
                        density="compact"
                        variant="outlined"
                        hide-details
                        prepend-inner-icon="mdi-shape-outline"
                        class="cv-variant-select"
                      /><AppSelect
                        :model-value="
                          effectiveSectionTitleStyle(toSectionKey(section))
                        "
                        :items="sectionTitleStyleOptions"
                        item-title="title"
                        item-value="value"
                        density="compact"
                        variant="outlined"
                        hide-details
                        prepend-inner-icon="mdi-format-title"
                        class="cv-title-style-select"
                        @update:model-value="
                          updateSectionTitleStyle(toSectionKey(section), $event)
                        "
                      /><AppSelect
                        v-if="isSectionColumnEditable(toSectionKey(section))"
                        :model-value="
                          effectiveSectionColumn(toSectionKey(section))
                        "
                        :items="sectionColumnOptions"
                        item-title="title"
                        item-value="value"
                        density="compact"
                        variant="outlined"
                        hide-details
                        :prepend-inner-icon="
                          sectionColumnIcon(toSectionKey(section))
                        "
                        class="cv-column-select"
                        @update:model-value="
                          updateSectionColumn(toSectionKey(section), $event)
                        "
                      /><v-btn
                        icon="mdi-plus"
                        size="x-small"
                        variant="text"
                        @click.stop="addSectionItem(toSectionKey(section))"
                      /><v-btn
                        icon="mdi-minus"
                        size="x-small"
                        variant="text"
                        @click.stop="hideSection(toSectionKey(section))"
                      /><v-btn
                        icon="mdi-arrow-up"
                        size="x-small"
                        variant="text"
                        @click.stop="
                          shiftSectionByLine('mainTwoRight', section, 'up')
                        "
                      /><v-btn
                        icon="mdi-arrow-down"
                        size="x-small"
                        variant="text"
                        @click.stop="
                          shiftSectionByLine('mainTwoRight', section, 'down')
                        "
                      /><v-btn
                        icon="mdi-drag"
                        size="x-small"
                        variant="text"
                        @click.stop="
                          moveSection('mainTwoRight', section, 'down')
                        "
                      />
                    </div>
                    <CvSectionTitleToolbar
                      :section-key="toSectionKey(section)"
                      :title="sectionDisplayTitle(section)"
                      :icon="sectionIcon(toSectionKey(section))"
                      :icon-alternatives="
                        getSectionIconOptions(toSectionKey(section)).map(
                          (item) => item.value,
                        )
                      "
                      :title-style="
                        effectiveSectionTitleStyle(toSectionKey(section))
                      "
                      :font-family="textFontPreset('sectionLabel')"
                      @update:title="updateSectionDisplayTitle(section, $event)"
                      @update:icon="setSectionIcon(section, $event)"
                    />
                    <CvEditableSectionContent
                      :section-key="toSectionKey(section)"
                      :variant="
                        effectiveSectionType(
                          toSectionKey(section),
                          sectionType(toSectionKey(section) as any),
                        )
                      "
                      :items="getEditableSectionItems(section)"
                      :content-style="
                        effectiveSectionContentStyle(toSectionKey(section))
                      "
                      :date-style="
                        effectiveSectionDateStyle(toSectionKey(section))
                      "
                      @update-item="
                        (index, value) =>
                          updateEditableSectionItem(section, index, value)
                      "
                    />
                  </div>
                </v-col>
              </v-row>
            </div>
            <div v-else class="cv-sections-list">
              <div
                v-for="section in visibleMainOneSections"
                :key="`fallback-${section}`"
                :class="[
                  'cv-section-row',
                  contentColumnClass(toSectionKey(section)),
                ]"
                :style="sectionOffsetStyle('mainOne', section)"
                draggable="true"
                @dragstart="onSectionDragStart('mainOne', section)"
                @dragover.prevent
                @drop="onSectionDrop('mainOne', section)"
                @dragend="onSectionDragEnd"
              >
                <div class="cv-section-toolbar">
                  <AppSelect
                    v-model="sectionTypeOverrides[toSectionKey(section)]"
                    :items="getSectionVariantOptions(toSectionKey(section))"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    prepend-inner-icon="mdi-shape-outline"
                    class="cv-variant-select"
                  /><AppSelect
                    :model-value="
                      effectiveSectionTitleStyle(toSectionKey(section))
                    "
                    :items="sectionTitleStyleOptions"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    prepend-inner-icon="mdi-format-title"
                    class="cv-title-style-select"
                    @update:model-value="
                      updateSectionTitleStyle(toSectionKey(section), $event)
                    "
                  /><AppSelect
                    v-if="isSectionColumnEditable(toSectionKey(section))"
                    :model-value="effectiveSectionColumn(toSectionKey(section))"
                    :items="sectionColumnOptions"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :prepend-inner-icon="
                      sectionColumnIcon(toSectionKey(section))
                    "
                    class="cv-column-select"
                    @update:model-value="
                      updateSectionColumn(toSectionKey(section), $event)
                    "
                  /><v-btn
                    icon="mdi-plus"
                    size="x-small"
                    variant="text"
                    @click.stop="addSectionItem(toSectionKey(section))"
                  /><v-btn
                    icon="mdi-minus"
                    size="x-small"
                    variant="text"
                    @click.stop="hideSection(toSectionKey(section))"
                  /><v-btn
                    icon="mdi-arrow-up"
                    size="x-small"
                    variant="text"
                    @click.stop="shiftSectionByLine('mainOne', section, 'up')"
                  /><v-btn
                    icon="mdi-arrow-down"
                    size="x-small"
                    variant="text"
                    @click.stop="shiftSectionByLine('mainOne', section, 'down')"
                  /><v-btn
                    icon="mdi-drag"
                    size="x-small"
                    variant="text"
                    @click.stop="moveSection('mainOne', section, 'down')"
                  />
                </div>
                <CvSectionTitleToolbar
                  :section-key="toSectionKey(section)"
                  :title="sectionDisplayTitle(section)"
                  :icon="sectionIcon(toSectionKey(section))"
                  :icon-alternatives="
                    getSectionIconOptions(toSectionKey(section)).map(
                      (item) => item.value,
                    )
                  "
                  :title-style="
                    effectiveSectionTitleStyle(toSectionKey(section))
                  "
                  :font-family="textFontPreset('sectionLabel')"
                  @update:title="updateSectionDisplayTitle(section, $event)"
                  @update:icon="setSectionIcon(section, $event)"
                />
                <CvEditableSectionContent
                  :section-key="toSectionKey(section)"
                  :variant="
                    effectiveSectionType(
                      toSectionKey(section),
                      sectionType(toSectionKey(section) as any),
                    )
                  "
                  :items="getEditableSectionItems(section)"
                  :content-style="
                    effectiveSectionContentStyle(toSectionKey(section))
                  "
                  :date-style="effectiveSectionDateStyle(toSectionKey(section))"
                  @update-item="
                    (index, value) =>
                      updateEditableSectionItem(section, index, value)
                  "
                />
              </div>
            </div>
            <footer v-if="signatureDataUrl" class="signature-footer">
              <div class="signature-box">
                <img
                  :src="signatureDataUrl"
                  alt="signature"
                  class="signature-image"
                />
                <v-menu location="bottom end">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-dots-vertical"
                      size="x-small"
                      class="signature-menu-btn"
                    />
                  </template>
                  <v-list density="compact">
                    <v-list-item
                      prepend-icon="mdi-pencil"
                      title="Edit"
                      @click="openSignatureDialog"
                    />
                    <v-list-item
                      prepend-icon="mdi-delete"
                      title="Delete"
                      @click="deleteSignature"
                    />
                  </v-list>
                </v-menu>
              </div>
            </footer>
          </template>
        </component>
        <template v-if="!isCaptureMode">
          <ResumePreviewPageBreak
            v-for="pageBreak in cvPreviewPageBreaks"
            :key="`cv-page-break-${pageBreak}`"
            :page-number="pageBreak"
            :top="pageBreak * CV_PREVIEW_PDF_PAGE_HEIGHT"
          />
        </template>
      </div>
    </v-container>

    <AppModal v-model="signatureDialogOpen" title="Signature" :max-width="760">
      <canvas ref="signatureCanvas" class="signature-canvas" />
      <div class="d-flex justify-end ga-2 mt-3">
        <v-btn variant="text" @click="clearSignatureCanvas">Clear</v-btn>
        <v-btn variant="tonal" @click="closeSignatureDialog">Cancel</v-btn>
        <v-btn color="primary" @click="saveSignatureFromCanvas">Save</v-btn>
      </div>
    </AppModal>
    <AppModal
      v-model="aiModalOpen"
      title="AI Resume Assistant"
      :max-width="760"
    >
      <p class="mb-4">{{ aiPromptProgress }}</p>
      <v-file-input
        label="Upload old resume"
        accept=".pdf,.doc,.docx,.txt"
        variant="outlined"
        prepend-icon="mdi-file-upload-outline"
        hide-details
        class="mb-4"
      />
      <v-textarea
        label="Paste your resume content or key information"
        rows="7"
        variant="outlined"
        hide-details
      />
    </AppModal>
    <AppModal
      v-model="matchOfferModalOpen"
      title="Correspondance with Offer"
      :max-width="760"
    >
      <p class="mb-3">
        Paste the job offer text below. AI will compare it with your current CV
        and explain the match score.
      </p>
      <v-textarea
        v-model="matchOfferText"
        label="Offer text"
        rows="6"
        variant="outlined"
      />
      <div class="d-flex justify-end mt-3">
        <v-btn
          color="primary"
          :loading="matchOfferLoading"
          :disabled="!matchOfferText.trim()"
          @click="generateResumeOfferMatch"
        >
          Generate
        </v-btn>
      </div>
      <v-progress-linear
        v-if="matchOfferLoading"
        :model-value="matchOfferProgress"
        color="primary"
        rounded
        height="8"
        class="mt-4"
      />
      <div
        v-if="matchOfferResult"
        class="mt-4 d-flex flex-column align-center ga-3"
      >
        <v-progress-circular
          :model-value="matchOfferResult.percentage"
          :size="100"
          :width="10"
          color="primary"
        >
          {{ matchOfferResult.percentage }}%
        </v-progress-circular>
        <p class="text-body-2 w-100">{{ matchOfferResult.note }}</p>
      </div>
    </AppModal>

    <AppModal v-model="addSectionModalOpen" title="Add section" max-width="760">
      <v-card-text>
        <template v-if="isAddSectionStepOne">
          <p class="text-body-2 mb-3">Choose a section form</p>
          <v-row dense>
            <v-col
              v-for="variant in addSectionVariantOptions"
              :key="variant.value"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card
                class="pa-5 cursor-pointer add-section-variant-card"
                :variant="
                  addSectionVariant === variant.value ? 'tonal' : 'outlined'
                "
                @click.stop.prevent="selectAddSectionVariant(variant.value)"
              >
                <div class="text-h6 text-capitalize">{{ variant.title }}</div>
              </v-card>
            </v-col>
          </v-row>
        </template>
        <template v-else>
          <v-text-field
            v-model="addSectionName"
            label="Section name"
            class="mb-3"
          />
          <v-text-field
            model-value="+"
            label="Add field"
            readonly
            class="mb-3"
          />
          <v-select
            v-model="addSectionOrder.zone"
            :items="addSectionOrderZoneOptions"
            label="Zone"
            class="mb-3"
          />
          <v-select
            v-model="addSectionOrder.withSection"
            :items="
              (orderMap[addSectionOrder.zone] || []).map((s: string) => ({
                title: sectionTitleMap[toSectionKey(s)] || s,
                value: s,
              }))
            "
            label="With section"
            clearable
            class="mb-3"
          />
          <v-switch
            v-model="addSectionOrder.after"
            label="Insert after selected section"
            hide-details
          />
        </template>
      </v-card-text>
      <template #actions>
        <div class="d-flex justify-end ga-2 mt-2 w-100">
          <v-btn variant="text" @click="addSectionModalOpen = false"
            >Cancel</v-btn
          >
          <v-btn
            v-if="isAddSectionStepOne"
            color="primary"
            @click="goToAddSectionStepTwo"
            >Next</v-btn
          >
          <v-btn
            v-else
            color="primary"
            :disabled="!addSectionName.trim()"
            @click="confirmAddSection"
            >Save</v-btn
          >
        </div>
      </template>
    </AppModal>

    <AppModal
      v-model="sectionModalOpen"
      :title="t('resumePreview.cv.addItem')"
      max-width="520"
    >
      <v-card-text>
        <template v-if="sectionModalKey === 'languages'">
          <AppSelect
            v-model="languageOption"
            :items="languageCatalog"
            item-title="title"
            label="Language"
            return-object
            class="mb-3"
          />
          <v-rating
            v-model="languageStars"
            length="5"
            density="compact"
            color="amber"
          />
        </template>
        <template v-else-if="sectionModalKey === 'experience'">
          <v-text-field
            v-model="sectionModalTitle"
            label="Title"
            class="mb-2"
          />
          <v-text-field
            v-model="sectionModalCompany"
            label="Company"
            class="mb-2"
          />
          <v-textarea
            v-model="sectionModalDescription"
            label="Description"
            rows="3"
            class="mb-2"
          />
          <v-row dense>
            <v-col cols="6"
              ><v-text-field
                v-model="sectionModalStartDate"
                type="date"
                label="Start date"
            /></v-col>
            <v-col cols="6"
              ><v-text-field
                v-model="sectionModalEndDate"
                type="date"
                label="End date"
            /></v-col>
          </v-row>
        </template>
        <template v-else-if="sectionModalKey === 'education'">
          <v-text-field
            v-model="sectionModalTitle"
            label="Title"
            class="mb-2"
          />
          <v-text-field
            v-model="sectionModalSchool"
            label="School"
            class="mb-2"
          />
          <v-text-field
            v-model="sectionModalLocation"
            label="Location"
            class="mb-2"
          />
          <v-textarea
            v-model="sectionModalDescription"
            label="Description"
            rows="3"
            class="mb-2"
          />
          <v-row dense>
            <v-col cols="6"
              ><v-text-field
                v-model="sectionModalStartDate"
                type="date"
                label="Start date"
            /></v-col>
            <v-col cols="6"
              ><v-text-field
                v-model="sectionModalEndDate"
                type="date"
                label="End date"
            /></v-col>
          </v-row>
        </template>
        <template v-else-if="sectionModalKey === 'projects'">
          <v-text-field
            v-model="sectionModalTitle"
            label="Title"
            class="mb-2"
          />
          <v-text-field
            v-model="sectionModalHomePage"
            label="Homepage"
            class="mb-2"
          />
          <v-textarea
            v-model="sectionModalDescription"
            label="Description"
            rows="3"
            class="mb-2"
          />
          <v-file-input
            v-model="sectionModalFiles"
            label="Attachments"
            multiple
            chips
            show-size
          />
        </template>
        <template v-else-if="sectionModalKey === 'skills'">
          <v-text-field
            v-model="sectionModalSkillName"
            label="Name"
            class="mb-2"
          />
          <v-rating
            v-model="sectionModalSkillStars"
            length="5"
            density="compact"
            color="amber"
          />
        </template>
        <template v-else-if="sectionModalKey === 'certifications'">
          <v-text-field
            v-model="sectionModalTitle"
            label="Title"
            class="mb-2"
          />
          <v-textarea
            v-model="sectionModalDescription"
            label="Description"
            rows="3"
            class="mb-2"
          />
          <v-file-input
            v-model="sectionModalFiles"
            label="Attachments"
            multiple
            chips
            show-size
          />
        </template>
        <template v-else-if="sectionModalKey === 'references'">
          <v-text-field
            v-model="sectionModalTitle"
            label="Title"
            class="mb-2"
          />
          <v-textarea
            v-model="sectionModalDescription"
            label="Description"
            rows="3"
          />
        </template>
        <v-text-field
          v-else
          v-model="sectionModalValue"
          label="Nouveau contenu"
        />
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
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-on-surface)) 14%, transparent);
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
  border-color: color-mix(
    in srgb,
    rgb(var(--v-theme-on-surface)) 22%,
    transparent
  );
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

.cv-header-editor--link-value {
  display: none;
  min-width: 0;
  max-width: 100%;
}

.cv-contact-item:hover .cv-header-editor--link-value,
.cv-contact-item:focus-within .cv-header-editor--link-value {
  display: block;
}

.cv-header-editor--link-value :deep(.hover-editor__surface),
.cv-header-editor--link-value :deep(.hover-editor__content),
.cv-header-editor--link-value :deep(.hover-editor__content p) {
  min-width: 0;
  max-width: 100%;
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
  width: 100%;
  max-width: var(--cv-preview-page-width, 794px);
  min-width: 0;
  min-height: var(--cv-preview-total-height, 1100px);
}

.cv-preview-page {
  position: relative;
  height: auto !important;
  min-height: var(--cv-preview-total-height, 1100px) !important;
  overflow: visible !important;
  padding-bottom: var(--cv-page-end-bar-height, 24px);
  border: var(--cv-page-border-width, 0px) solid
    var(--cv-page-border-color, transparent);
  border-radius: var(--cv-page-border-radius, 0px);
}

.cv-preview-page::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--cv-page-end-bar-height, 24px);
  background: var(--cv-page-background, #fff);
}

.cv-header-layout {
  display: grid;
  width: 100%;
  gap: 12px;
  align-items: center;
}
.cv-header-layout--header-left {
  grid-template-columns: 2fr 1fr;
}
.cv-header-layout--header-right {
  grid-template-columns: 1fr 2fr;
}
.cv-header-layout--header-split {
  grid-template-columns: 5fr 7fr;
}
.cv-header-split-left {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  justify-content: start;
  min-width: 0;
}
.cv-header-contact {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  text-align: start;
}
.cv-header-contact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 10px;
  width: 100%;
  text-align: start;
}
.cv-contact-item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 13px;
  font-weight: 700;
}
.cv-contact-icon-btn {
  min-width: 24px;
  padding: 0;
}
.cv-contact-link {
  font-weight: 700;
  color: inherit;
  text-decoration: none;
  flex-shrink: 0;
}
.cv-contact-link:hover {
  text-decoration: underline;
}
.cv-header-layout,
.cv-contact-item,
.cv-header-identity strong {
  color: var(--cv-header-text, #0f172a);
}
.cv-header-identity {
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.cv-header-identity--split {
  align-items: flex-start;
  min-width: 0;
  text-align: start;
}
.cv-header-identity--aside {
  color: inherit;
  gap: 8px;
}
.cv-header-avatar {
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 999px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  max-width: 560px;
  padding: 24px;
}

.cv-sections-list,
.cv-sections-structure-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
  width: 100%;
}

.cv-section-row--full {
  grid-column: 1 / -1;
}

.cv-section-row--half {
  grid-column: span 1;
}
.cv-page--capture .cv-section-row--half,
.cv-page--capture .cv-section-row--full {
  grid-column: 1 / -1;
}

@media (max-width: 720px) {
  .cv-section-row--half,
  .cv-section-row--full {
    grid-column: 1 / -1;
  }
}

.cv-aside-sections {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cv-aside-section-item {
  position: relative;
  padding: 8px 10px;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  border: 0;
  font-weight: 600;
  font-size: 13px;
}

.cv-aside-section-item > strong {
  display: block;
  margin-bottom: 6px;
  padding-right: 0;
}
.cv-aside-section-item:hover .cv-section-toolbar {
  opacity: 1;
  pointer-events: auto;
}
.cv-aside-section-item :deep(.hover-editor__content),
.cv-aside-section-item :deep(.hover-editor__content p),
.cv-aside-section-item :deep(.cv-rich-item),
.cv-aside-section-item :deep(.cv-rich-editor) {
  color: inherit !important;
}

.cv-aside-section-item :deep(.cv-sec) {
  padding: 4px 0;
}
.cv-aside-section-item :deep(.cv-item) {
  font-size: 12px;
  margin-bottom: 4px;
}

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

.cv-section-row small {
  font-weight: 400;
  opacity: 0.8;
}
.cv-section-row--timeline {
  border-left: 4px solid #6366f1;
  padding-left: 10px;
}
.cv-section-row--cards {
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.08);
}
.cv-section-row--dot::before {
  content: '• ';
  font-weight: 700;
}
.cv-section-row--stars::after {
  content: ' ★';
}
.cv-section-row--progress-line {
  background: linear-gradient(90deg, #dbeafe 45%, transparent 45%);
}
.cv-section-row--progress-circle {
  border-style: solid;
}
.cv-row-items {
  margin: 6px 0 0;
  padding-left: 16px;
}
.cv-row-items li {
  font-size: 12px;
  line-height: 1.35;
}
.cv-section-row {
  position: relative;
  border: 0;
  border-radius: 0;
  padding: 8px 4px;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--cv-page-muted, #334155);
  background: transparent;
}
.cv-section-row > strong {
  display: block;
  margin-bottom: 6px;
  padding-right: 0;
}
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
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-on-surface)) 14%, transparent);
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
  transform: translateY(-2px);
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.cv-section-row:hover .cv-section-toolbar,
.cv-aside-section-item:hover .cv-section-toolbar,
.cv-section-toolbar:focus-within {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
.cv-title-style-select {
  width: 54px;
}
.cv-title-style-select :deep(.v-select__selection span) {
  display: none;
}
.cv-column-select {
  width: 54px;
}
.cv-column-select :deep(.v-select__selection span) {
  display: none;
}
.cv-column-select :deep(.v-field__input) {
  padding-inline-start: 0;
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
  display: flex;
  justify-content: flex-end;
}

.signature-box {
  position: relative;
  display: inline-flex;
  align-items: flex-end;
}

.signature-menu-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.signature-box:hover .signature-menu-btn,
.signature-box:focus-within .signature-menu-btn {
  opacity: 1;
}

.signature-image {
  height: 68px;
  object-fit: contain;
}

.signature-canvas {
  width: 100%;
  height: 200px;
  border: 1px solid rgba(0, 0, 0, 0.15);
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

.cv-header-identity strong {
  font-family: var(--cv-text-fullname);
}
.cv-section-row > strong,
.cv-aside-section-item > strong {
  font-family: var(--cv-text-section-label);
}
.cv-section-row :deep(.cv-entry strong),
.cv-aside-section-item :deep(.cv-entry strong) {
  font-family: var(--cv-text-entry-title);
}
.cv-section-row :deep(.cv-sec),
.cv-aside-section-item :deep(.cv-sec),
.cv-section-row :deep(.cv-item),
.cv-aside-section-item :deep(.cv-item) {
  font-family: var(--cv-text-body);
}

.cv-photo-wrap {
  position: relative;
  display: inline-flex;
}
.cv-photo-menu-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  opacity: 0;
  transition: opacity 0.15s;
}
.cv-photo-wrap:hover .cv-photo-menu-btn {
  opacity: 1;
}
.cv-color-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}
.cv-color-dot {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  cursor: pointer;
}
.cv-section-row > strong {
  color: color-mix(
    in srgb,
    var(--cv-primary, #1d4ed8) 72%,
    var(--cv-page-text, #0f172a)
  );
}
.cv-aside-section-item > strong {
  color: color-mix(in srgb, var(--cv-primary, #1d4ed8) 55%, white);
}
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
  overflow: hidden;
  clip-path: inset(0 round var(--cv-section-bar-radius, 999px));
  position: absolute;
  left: 0;
  top: calc(100% + 6px);
  background: var(--cv-primary, #1d4ed8);
}
.palette-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgb(var(--v-theme-on-surface), 0.2);
}

.cv-section-toolbar :deep(.v-btn) {
  min-width: 26px !important;
  width: 26px;
  height: 26px;
  padding: 0;
  color: rgb(var(--v-theme-on-surface));
  border-radius: 8px;
}
.cv-section-toolbar :deep(.v-btn:hover) {
  background: color-mix(
    in srgb,
    rgb(var(--v-theme-on-surface)) 10%,
    transparent
  );
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
.cv-header-identity span {
  font-size: 12px;
  opacity: 0.95;
  color: var(--cv-header-muted, #334155);
}
.decor-object {
  position: absolute;
  pointer-events: none;
  color: var(--cv-primary, #1d4ed8);
  background: color-mix(in srgb, var(--cv-primary, #1d4ed8) 35%, transparent);
  box-shadow:
    0 0 0 1px color-mix(in srgb, currentColor 32%, rgba(255, 255, 255, 0.72)),
    0 4px 18px color-mix(in srgb, currentColor 28%, transparent);
  transform: translate(-50%, -50%);
  z-index: 4;
}
.decor-circle {
  border-radius: 999px;
}
.decor-ring {
  border-radius: 999px;
  background: transparent;
  border: 3px solid
    color-mix(in srgb, var(--cv-secondary, #93c5fd) 55%, transparent);
}
.decor-blob {
  border-radius: 40% 60% 55% 45% / 50% 35% 65% 50%;
}
.decor-square {
  border-radius: 10px;
}
.decor-diamond {
  border-radius: 8px;
  transform: translate(-50%, -50%) rotate(45deg);
}
.decor-star {
  -webkit-clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
}
.decor-triangle {
  -webkit-clip-path: polygon(50% 0%, 0 100%, 100% 100%);
  clip-path: polygon(50% 0%, 0 100%, 100% 100%);
}
.decor-pill {
  border-radius: 999px;
}
.decor-bar {
  border-radius: 999px;
}
.add-section-variant-card {
  min-height: 120px;
  display: flex;
  align-items: center;
}
</style>
