<script setup lang="ts">
import { listMyResumes } from '~/services/resumeApi'
import HoverRichTextEditor from '~/components/Resume/Create/HoverRichTextEditor.vue'
import ResumePreviewToolbar from '~/components/ResumePreviewToolbar.vue'
import ResumePreviewPageBreak from '~/components/ResumePreviewPageBreak.vue'
import GENERATED_COVER_LETTER_TEMPLATES from '~/data/resume-templates/generated-20-cover-letter.json'
import {
  getGeneratedTemplateDesign,
  getGeneratedTemplateFakeData,
} from '~/utils/generatedTemplateNormalizer'
import PALETTE_PRESETS from '~/data/resume-templates/palettes.json'
import {
  applyReadablePageTextColors,
  readableTextColorForBackground,
} from '~/utils/resumeColorContrast'
import { buildToolbarPaletteOptions } from '~/modules/resume/theme/paletteOptions'
import {
  resolveResumeTextFont,
  useResumeGoogleFonts,
} from '~/composables/useResumeGoogleFonts'
import {
  getCoverBorderValues,
  useCoverBorderStyle,
} from '~/composables/useCoverBorderStyle'

definePageMeta({
  title: 'resumePreview.coverLetter.metaTitle',
  layout: 'resume',
})
const { t } = useI18n()
useHead(() => ({
  title: t('resumePreview.coverLetter.metaTitle'),
  link: [
    { rel: 'preload', as: 'image', href: '/img/cv/generated/cletter-001.png' },
    { rel: 'preload', as: 'image', href: '/img/cv/generated/cletter-002.png' },
    { rel: 'preload', as: 'image', href: '/img/cv/generated/cletter-003.png' },
  ],
}))

useSeoMeta({
  title: 'New Cover Letter - Free AI Builder | Bro World',
  description:
    'Generate and preview a free AI cover letter with job-ready templates.',
  keywords:
    'new cover letter, free cover letter, ai cover letter generator, job application letter',
  ogImage: '/img/cv/generated/cletter-001.png',
  twitterCard: 'summary_large_image',
  twitterImage: '/img/cv/generated/cletter-001.png',
})
const route = useRoute()
const { user } = useUserSession()
const { coverLetterTemplates } = useResumeTemplates()
const selectedTemplate = ref(
  coverLetterTemplates.value[0]?.id ||
    GENERATED_COVER_LETTER_TEMPLATES[0]?.id ||
    '',
)

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
const photoOptions = [
  '/img/team-1.jpg',
  '/img/team-2.jpg',
  '/img/team-3.jpg',
  '/img/team-4.jpg',
  '/img/team-5.jpg',
  '/img/team-9.jpeg',
]
const imageShape = ref<'circle' | 'square'>('circle')
const imageSize = ref(84)
const imageBorderWidth = ref(2)
const imageBorderColor = ref('#0f172a')
const photoPosition = ref<'left' | 'right'>('left')
const selectedPalette = ref<string>('template')
const paletteOverrides = ref<Record<string, Record<string, string>>>({})
const paletteMenuOpen = ref(false)
const asideMenuOpen = ref(false)
const barMenuOpen = ref(false)
const borderMenuOpen = ref(false)
const decorMenuOpen = ref(false)
const palettePresetOptions = computed(() =>
  buildToolbarPaletteOptions(
    activeTemplateDesign.value.theme.palette,
    PALETTE_PRESETS,
    100,
  ),
)
const borderColorOptions = [
  '#0f172a',
  '#0F4C81',
  '#166534',
  '#C2410C',
  '#7C3AED',
  '#1D4ED8',
  '#DC2626',
]
const dividerTypeOptions = [
  { title: 'Line', value: 'line' },
  { title: 'Dashed', value: 'dashed' },
  { title: 'Gradient', value: 'gradient' },
  { title: 'None', value: 'none' },
]
const selectedDividerType = ref('line')
const pageBorderEnabled = ref(true)
const pageBorderWidth = ref(0)
const pageBorderRadius = ref(0)
const pageBorderColor = ref('#0f172a')
const textFontSize = ref(24)
const textColor = ref('#475569')
const barRadius = ref(0)
const barLayout = ref<'none' | 'single' | 'double'>('single')
const letterElementStyles = reactive({
  date: { size: 18, color: '#475569', weight: '400' },
  address: { size: 18, color: '#334155', weight: '400' },
})
const fontWeightMap: Record<string, string> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}
const primaryBarWidth = ref(10)
const secondaryBarWidth = ref(5)
const model = reactive({
  fullName: 'Alex Martin',
  role: 'Senior Full Stack Developer',
  location: 'Paris, France',
  date: new Date().toLocaleDateString('en-US'),
  heading: 'Dear Hiring Manager,',
  companyParagraph:
    'I am excited to apply for your role. I bring strong experience in product delivery, scalable web architecture, and cross-functional collaboration.',
  summary:
    'I would welcome the opportunity to contribute to your team and discuss how my background aligns with your needs.',
  email: 'Sincerely,',
  phone: 'Alex Martin',
  photoUrl: photoOptions[0],
})
const activeTemplate = computed(
  () =>
    GENERATED_COVER_LETTER_TEMPLATES.find(
      (tpl) => tpl.id === selectedTemplate.value,
    ) || GENERATED_COVER_LETTER_TEMPLATES[0],
)
useResumeGoogleFonts(activeTemplate)
const activeTemplateDesign = computed(() =>
  getGeneratedTemplateDesign(activeTemplate.value),
)

const { borderStyleClass, coverBorderCssVars } = useCoverBorderStyle(
  activeTemplateDesign,
  {
    enabled: pageBorderEnabled,
    width: pageBorderWidth,
    color: pageBorderColor,
    radius: pageBorderRadius,
  },
)
function textFontFamily(
  key: string,
  fallback: 'sans' | 'serif' | 'mono' | 'display' = 'sans',
) {
  return resolveResumeTextFont(
    activeTemplateDesign.value?.textStyles?.[key],
    fallback,
  )
}
const editableDecorObjects = ref<any[]>([])
const decorMenuOpenIndex = ref<number | null>(null)
const defaultDecorPresets = [
  { type: 'circle', x: 8, y: 6, size: 80, opacity: 0.08 },
  { type: 'diamond', x: 70, y: 75, size: 120, opacity: 0.08 },
  { type: 'star', x: 14, y: 84, size: 28, opacity: 0.1 },
  { type: 'square', x: 82, y: 10, size: 24, opacity: 0.08 },
]
const templateDecorPresets = computed(() => {
  const fromTemplate = (activeTemplateDesign.value?.decor?.objects || []).map(
    (obj: any) => normalizeDecorObject(obj),
  )
  return fromTemplate.length
    ? fromTemplate
    : defaultDecorPresets.map((obj) => normalizeDecorObject(obj))
})

const defaultBarDesignConfig = {
  barRadius: { min: 0, max: 30 },
  barLayout: ['', 'single', 'double'],
  barWidth: { min: 4, max: 24 },
  secondaryBarWidth: { min: 2, max: 20 },
}
const activeTemplateDesignConfig = computed(
  () => activeTemplateDesign.value?.designConfig || {},
)
const activeBarDesignConfig = computed(
  () => activeTemplateDesignConfig.value || defaultBarDesignConfig,
)

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

function applyTemplateDefaults(tpl: any) {
  const defaults = getGeneratedTemplateFakeData(tpl)
  if (defaults.fullName) {
    model.fullName = String(defaults.fullName)
    model.phone = String(defaults.fullName)
  }
  if (defaults.role) model.role = String(defaults.role)
  if (defaults.image) model.photoUrl = String(defaults.image)
  if (defaults.date) model.date = String(defaults.date)
  if (defaults.location) model.location = String(defaults.location)
  if (defaults.heading) model.heading = String(defaults.heading)
  if (defaults.companyParagraph)
    model.companyParagraph = String(defaults.companyParagraph)
  if (defaults.summary) model.summary = String(defaults.summary)
}
const sectionDividerStyle = computed(() => {
  const showDivider =
    activeTemplateDesign.value?.layoutOptions?.showDivider ?? true
  if (!showDivider) return 'none'
  if (selectedDividerType.value === 'none') return 'none'
  if (selectedDividerType.value === 'dashed') return 'dashed'
  return 'solid'
})
const sectionDividerColor = computed(() =>
  selectedDividerType.value === 'gradient'
    ? `color-mix(in srgb, ${activeColors.value.primary} 55%, ${activeColors.value.secondary} 45%)`
    : activeColors.value.secondary,
)
const sectionSpacing = computed(() =>
  activeTemplateDesign.value?.layoutOptions?.sectionSpacing === 'wide'
    ? '40px'
    : '24px',
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
      secondary: selected.secondary,
      text: selected.text,
      muted: selected.tertiary,
      pageBackground: selected.quaternary,
    })
  return applyReadablePageTextColors(palette)
})

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
function readableCoverTextColor(color = '#0F172A') {
  return readableTextColorForBackground(
    activeColors.value.pageBackground,
    color,
  )
}

const readableBodyTextColor = computed(() =>
  readableCoverTextColor(textColor.value),
)

const isLayoutRight = computed(
  () => activeTemplate.value?.layout === 'layout-right',
)
const signatureDataUrl = ref('')
const signatureDialogOpen = ref(false)
const signatureCanvas = ref<HTMLCanvasElement | null>(null)
const photoInput = ref<HTMLInputElement | null>(null)
const layoutMenuOpen = ref(false)
const photoQuickMenuOpen = ref(false)
const aiModalOpen = ref(false)
const sectionModalOpen = ref(false)
const sectionInsertAfter = ref(true)
const sectionAnchor = ref('')
const aiPrompt =
  'Tell us about yourself and the target position. Add accurate context so AI can generate a compelling and personalized cover letter profile.'
const aiPromptProgress = ref('')
let aiTypingTimer: ReturnType<typeof setInterval> | undefined
const aiAboutText = ref('')
const aiGenerating = ref(false)
const aiProgress = ref(0)
let aiProgressTimer: ReturnType<typeof setInterval> | undefined
const aiFullName = ref('')
const aiRole = ref('')
const aiLocation = ref('')
const aiPhotoUrl = ref('')

const COVER_PREVIEW_PDF_PAGE_HEIGHT = 1123
const coverPreviewRef = ref<HTMLElement | null>(null)
const showCoverPreviewPageBreak = ref(false)
let coverPreviewMeasureTimer: ReturnType<typeof setTimeout> | undefined
let coverPreviewResizeObserver: ResizeObserver | undefined

function measureCoverPreviewOverflow() {
  if (!import.meta.client) return
  const preview = coverPreviewRef.value?.querySelector<HTMLElement>(
    '.capture-cover-page, .capture-cover-letter',
  )
  if (!preview) return

  const neededHeight = Math.max(
    COVER_PREVIEW_PDF_PAGE_HEIGHT,
    preview.scrollHeight,
    Math.ceil(preview.getBoundingClientRect().height),
  )
  showCoverPreviewPageBreak.value = neededHeight > COVER_PREVIEW_PDF_PAGE_HEIGHT
}

function scheduleCoverPreviewMeasure(reset = false) {
  if (!import.meta.client) return
  if (reset) showCoverPreviewPageBreak.value = false
  if (coverPreviewMeasureTimer) window.clearTimeout(coverPreviewMeasureTimer)
  coverPreviewMeasureTimer = window.setTimeout(() => {
    coverPreviewMeasureTimer = undefined
    measureCoverPreviewOverflow()
  }, 80)
}

watch(
  () => activeColors.value.primary,
  (primaryColor) => {
    imageBorderColor.value = primaryColor
  },
  { immediate: true },
)

watch(
  activeTemplate,
  (tpl) => {
    applyTemplateDefaults(tpl)
    const design = getGeneratedTemplateDesign(tpl)
    editableDecorObjects.value = (design?.decor?.objects || []).map(
      (obj: any) => normalizeDecorObject(obj),
    )
    selectedDividerType.value = String(design?.decor?.divider || 'line')
    photoPosition.value =
      design?.hero?.photoPosition ||
      getGeneratedTemplateSectionForm(tpl?.sections, 'photoPosition', '') ||
      'left'
    imageShape.value =
      design?.designConfig?.photoType === 'square' ? 'square' : 'circle'
    imageSize.value = Number(design?.designConfig?.photoSize ?? imageSize.value)
    const items = design?.items || {}
    const designConfig = design?.designConfig || defaultBarDesignConfig
    barRadius.value =
      designConfig?.barRadius?.min ?? defaultBarDesignConfig.barRadius.min
    primaryBarWidth.value =
      designConfig?.barWidth?.min ?? defaultBarDesignConfig.barWidth.min
    secondaryBarWidth.value =
      designConfig?.secondaryBarWidth?.min ??
      defaultBarDesignConfig.secondaryBarWidth.min
    barLayout.value =
      Array.isArray(designConfig?.barLayout) &&
      designConfig.barLayout.includes('double')
        ? 'double'
        : designConfig.barLayout.includes('single')
          ? 'single'
          : 'none'
    for (const key of ['date', 'address']) {
      const b = items[key]?.size
      if (b) letterElementStyles[key].size = Math.round((b.min + b.max) / 2)
      if (items[key]?.colors?.[0])
        letterElementStyles[key].color = items[key].colors[0]
      if (items[key]?.styles?.[0])
        letterElementStyles[key].weight =
          fontWeightMap[items[key].styles[0]] || '400'
    }
  },
  { immediate: true },
)

watch(
  activeTemplate,
  (template) => {
    const design = getGeneratedTemplateDesign(template)
    const borderValues = getCoverBorderValues(design)
    pageBorderEnabled.value = borderValues.enabled
    pageBorderWidth.value = borderValues.width
    pageBorderRadius.value = borderValues.radius
    pageBorderColor.value = borderValues.color
  },
  { immediate: true },
)

watch(
  [pageBorderEnabled, pageBorderWidth, pageBorderRadius, pageBorderColor],
  () => {
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

function addDecorObject() {
  editableDecorObjects.value.push(
    normalizeDecorObject({
      type: 'circle',
      x: 50,
      y: 50,
      size: 120,
      opacity: 0.15,
    }),
  )
  decorMenuOpenIndex.value = editableDecorObjects.value.length - 1
}
function addDecorObjectFromPreset(preset: any) {
  editableDecorObjects.value.push(normalizeDecorObject({ ...preset }))
  decorMenuOpenIndex.value = editableDecorObjects.value.length - 1
}
function removeDecorObject(i: number) {
  editableDecorObjects.value.splice(i, 1)
  if (decorMenuOpenIndex.value === i) decorMenuOpenIndex.value = null
  if (decorMenuOpenIndex.value !== null && decorMenuOpenIndex.value > i)
    decorMenuOpenIndex.value -= 1
}
function openAiModal() {
  aiModalOpen.value = true
}

function openSectionModal() {
  sectionModalOpen.value = true
}

function saveSectionPlacement() {
  sectionModalOpen.value = false
}
async function generateCoverLetterWithAi() {
  if (!aiAboutText.value.trim() || aiGenerating.value) return
  aiGenerating.value = true
  aiProgress.value = 1
  const startedAt = Date.now()
  if (aiProgressTimer) window.clearInterval(aiProgressTimer)
  aiProgressTimer = window.setInterval(() => {
    const elapsed = Date.now() - startedAt
    const targetProgress = Math.floor((elapsed / 120000) * 100)
    aiProgress.value = Math.min(95, Math.max(aiProgress.value, targetProgress))
  }, 1000)
  try {
    const response = await $fetch<{ textArea?: string }>(
      'https://bro-world.org/api/v1/recruit/cover-letters/generate',
      {
        method: 'POST',
        body: { text: aiAboutText.value.trim() },
      },
    )
    const generatedText = response?.textArea?.trim()
    if (aiFullName.value.trim()) model.fullName = aiFullName.value.trim()
    if (aiRole.value.trim()) model.role = aiRole.value.trim()
    if (aiLocation.value.trim()) model.location = aiLocation.value.trim()
    if (aiPhotoUrl.value.trim()) model.photoUrl = aiPhotoUrl.value.trim()
    if (generatedText) {
      model.companyParagraph = generatedText
    }
    aiProgress.value = 100
    aiModalOpen.value = false
  } catch {
    /* noop */
  } finally {
    if (aiProgressTimer) window.clearInterval(aiProgressTimer)
    aiProgressTimer = undefined
    window.setTimeout(() => {
      aiGenerating.value = false
      aiProgress.value = 0
    }, 260)
  }
}
function onAiPhotoUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    aiPhotoUrl.value = String(reader.result || '')
  }
  reader.readAsDataURL(file)
}
function resetAiPromptTyping() {
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
}
function applyPreviewTemplate(id: string) {
  selectedTemplate.value = id
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
    model,
  }
  const templateResponse = await $fetch<{ id: string }>(
    'https://bro-world.org/api/v1/recruit/templates/cover-letters',
    { method: 'POST', body: templatePayload },
  )
  const token = user.value?.token?.trim()
  if (!token) return
  await $fetch(
    'https://bro-world.org/api/v1/recruit/private/me/cover-letters',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        fullName: model.fullName,
        role: model.role,
        location: model.location,
        header: model.heading,
        description1: model.companyParagraph,
        description2: model.summary,
        templateId: templateResponse.id,
      },
    },
  )
}
async function downloadPdf() {
  const node = document.querySelector(
    '.capture-cover-letter',
  ) as HTMLElement | null
  if (!node) return
  const w = window.open('', '_blank', 'width=900,height=1300')
  if (!w) return
  const headStyles = Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]'),
  )
    .map((el) => el.outerHTML)
    .join('')
  w.document.write(
    `<html><head>${headStyles}<style>@page{size:A4;margin:0}html,body{margin:0;background:#fff}body{display:flex;justify-content:center;align-items:flex-start}.capture-cover-letter{width:794px;max-width:794px;min-height:1123px;box-sizing:border-box;margin:0}</style></head><body>${node.outerHTML}</body></html>`,
  )
  w.document.close()
  await new Promise((r) => setTimeout(r, 900))
  w.focus()
  w.print()
  w.close()
}
function openPhotoUpload() {
  photoInput.value?.click()
}
function onPhotoUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    model.photoUrl = String(reader.result || model.photoUrl)
  }
  reader.readAsDataURL(file)
}
function openSignatureDialog() {
  signatureDialogOpen.value = true
  nextTick(initCanvas)
}
function closeSignatureDialog() {
  signatureDialogOpen.value = false
}
function saveSignatureFromCanvas() {
  const c = signatureCanvas.value
  if (!c) return
  signatureDataUrl.value = c.toDataURL('image/png')
  signatureDialogOpen.value = false
}
function clearSignatureCanvas() {
  const c = signatureCanvas.value
  const ctx = c?.getContext('2d')
  if (!c || !ctx) return
  ctx.clearRect(0, 0, c.width, c.height)
}
function deleteSignature() {
  signatureDataUrl.value = ''
  signatureDialogOpen.value = false
}
function initCanvas() {
  const c = signatureCanvas.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  c.width = c.clientWidth || 680
  c.height = 200
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  let draw = false
  const p = (e: PointerEvent) => {
    const r = c.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  c.onpointerdown = (e) => {
    draw = true
    const x = p(e)
    ctx.beginPath()
    ctx.moveTo(x.x, x.y)
  }
  c.onpointermove = (e) => {
    if (!draw) return
    const x = p(e)
    ctx.lineTo(x.x, x.y)
    ctx.stroke()
  }
  c.onpointerup = () => {
    draw = false
    signatureDataUrl.value = c.toDataURL('image/png')
  }
}
onMounted(async () => {
  scheduleCoverPreviewMeasure(true)
  const q = typeof route.query.template === 'string' ? route.query.template : ''
  if (q && coverLetterTemplates.value.some((t) => t.id === q))
    selectedTemplate.value = q
  try {
    const resumes = await listMyResumes()
    const info = resumes?.[0]?.resumeInformation
    if (info?.fullName) {
      model.fullName = info.fullName
      model.phone = info.fullName
    }
    if (info?.title) model.role = info.title
    if (info?.photo) model.photoUrl = info.photo
  } catch {
    /* noop */
  }
})

watch(
  [
    activeTemplate,
    activeColors,
    selectedDividerType,
    textFontSize,
    textColor,
    barRadius,
    barLayout,
    primaryBarWidth,
    secondaryBarWidth,
  ],
  () => {
    scheduleCoverPreviewMeasure(true)
  },
  { deep: true },
)

watch(
  model,
  () => {
    scheduleCoverPreviewMeasure()
  },
  { deep: true },
)

watch(
  editableDecorObjects,
  () => {
    scheduleCoverPreviewMeasure()
  },
  { deep: true },
)

onMounted(() => {
  if (!import.meta.client) return
  coverPreviewResizeObserver = new ResizeObserver(() =>
    scheduleCoverPreviewMeasure(),
  )
  const preview = coverPreviewRef.value?.querySelector<HTMLElement>(
    '.capture-cover-page, .capture-cover-letter',
  )
  if (preview) coverPreviewResizeObserver.observe(preview)
})

onBeforeUnmount(() => {
  if (coverPreviewMeasureTimer) window.clearTimeout(coverPreviewMeasureTimer)
  if (aiTypingTimer) window.clearInterval(aiTypingTimer)
  if (aiProgressTimer) window.clearInterval(aiProgressTimer)
  coverPreviewResizeObserver?.disconnect()
  coverPreviewResizeObserver = undefined
})
watch(aiModalOpen, (isOpen) => {
  if (isOpen) {
    aiFullName.value = model.fullName
    aiRole.value = model.role
    aiLocation.value = model.location
    aiPhotoUrl.value = model.photoUrl
    resetAiPromptTyping()
  }
})
</script>
<template>
  <div>
    <AppPageDrawers>
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
          to="/resume/cover-letter/template-create"
          >Template</v-btn
        >
      </template>
    </AppPageDrawers>
    <v-container fluid>
      <ResumePreviewToolbar
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
        :templates="coverLetterTemplates"
        :selected-template="selectedTemplate"
        template-key-prefix="cover-letter-preview"
        @select-template="applyPreviewTemplate"
        @select-palette="selectedPalette = $event"
        @update-palette-color="updatePaletteColor"
        @reset-palette="resetPaletteColors"
        @section="openSectionModal"
      >
        <template #decor>
          <v-card class="pa-3 mb-3" variant="outlined">
            <div class="text-caption mb-2">Template decor presets</div>
            <div class="d-flex flex-wrap ga-2">
              <v-btn
                v-for="(preset, presetIndex) in templateDecorPresets"
                :key="`preset-${presetIndex}`"
                size="x-small"
                variant="tonal"
                @click.stop="addDecorObjectFromPreset(preset)"
              >
                {{ preset.type }}
              </v-btn>
            </div>
          </v-card>
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
                    decorShapeOptions.map((shape) => ({
                      title: shape,
                      value: shape,
                    }))
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
                  min="20"
                  max="420"
                  step="1"
                  hide-details
                  class="mt-3"
                />
                <v-slider
                  v-model="obj.opacity"
                  label="Opacity"
                  min="0.02"
                  max="0.4"
                  step="0.01"
                  hide-details
                  class="mt-3"
                />
                <v-slider
                  v-model="obj.x"
                  label="X slider"
                  min="0"
                  max="100"
                  step="1"
                  hide-details
                  class="mt-3"
                />
                <v-slider
                  v-model="obj.y"
                  label="Y slider"
                  min="0"
                  max="100"
                  step="1"
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
          <v-card-text>
            <v-row dense>
              <v-col cols="12"
                ><AppSelect
                  v-model="selectedDividerType"
                  :items="dividerTypeOptions"
                  label="Divider type"
                  hide-details
                  class="mt-3"
              /></v-col>
            </v-row>
          </v-card-text>
        </template>
        <template #bar>
          <v-card-text>
            <v-row dense>
              <v-col cols="6"
                ><AppSelect
                  v-model="barLayout"
                  :items="[
                    { title: 'No bar', value: 'none' },
                    { title: 'Single bar', value: 'single' },
                    { title: 'Double bars', value: 'double' },
                  ]"
                  label="Bar layout"
                  hide-details
                  class="mt-3"
              /></v-col>
              <v-col cols="6"
                ><p class="text-body-2">Bar radius</p>
                <v-slider
                  v-model="barRadius"
                  :min="activeBarDesignConfig.barRadius.min"
                  :max="activeBarDesignConfig.barRadius.max"
                  step="1"
                  hide-details
              /></v-col>
              <v-col cols="6"
                ><p class="text-body-2">Bar width</p>
                <v-slider
                  v-model="primaryBarWidth"
                  :min="activeBarDesignConfig.barWidth.min"
                  :max="activeBarDesignConfig.barWidth.max"
                  step="1"
                  hide-details
              /></v-col>
              <v-col v-if="barLayout === 'double'" cols="6"
                ><p class="text-body-2">Sec bar width</p>
                <v-slider
                  v-model="secondaryBarWidth"
                  :min="activeBarDesignConfig.secondaryBarWidth.min"
                  :max="activeBarDesignConfig.secondaryBarWidth.max"
                  step="1"
                  hide-details
              /></v-col>
            </v-row>
          </v-card-text>
        </template>
        <template #border>
          <v-card-text>
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
          </v-card-text>
        </template>
      </ResumePreviewToolbar>
      <div
        ref="coverPreviewRef"
        class="d-flex justify-center preview-single-page-frame"
      >
        <main
          :class="['capture-cover-letter', borderStyleClass]"
          :style="{
            '--cp-primary': activeColors.primary,
            '--cp-secondary': activeColors.secondary,
            '--cp-text': activeColors.text,
            '--cp-muted': activeColors.muted,
            '--cp-bg': activeColors.pageBackground,
            ...coverBorderCssVars,
            '--section-divider-style': sectionDividerStyle,
            '--section-divider-color': sectionDividerColor,
            '--section-spacing': sectionSpacing,
            '--body-size': `${textFontSize}px`,
            '--body-color': readableBodyTextColor,
            '--bar-radius': `${barRadius}px`,
            '--bar-primary-width': `${primaryBarWidth}px`,
            '--bar-secondary-width': `${secondaryBarWidth}px`,
          }"
        >
          <div
            v-for="(obj, index) in editableDecorObjects"
            :key="`decor-${index}`"
            class="decor-object"
            :class="`decor-${obj.type}`"
            :style="decorObjectStyle(obj)"
          />
          <header
            class="hero"
            :class="{
              'hero--no-bar': barLayout === 'none',
              'hero--double': barLayout === 'double',
              'hero--photo-right': photoPosition === 'right',
              'hero--ribbon':
                activeTemplateDesign?.decor?.headerStyle === 'ribbon',
              'hero--layout-right': isLayoutRight,
            }"
            :style="
              activeTemplateDesign?.decor?.gradientStyle &&
              activeTemplateDesign.decor.gradientStyle !== 'none'
                ? {
                    background: `linear-gradient(135deg, ${activeColors.primary}22, ${activeColors.secondary}33)`,
                  }
                : undefined
            "
          >
            <div
              class="meta-top-right"
              :class="{ 'meta-top-right--layout-right': isLayoutRight }"
            >
              <HoverRichTextEditor
                v-model="model.date"
                :font-size="`${letterElementStyles.date.size}px`"
                :color="readableCoverTextColor(letterElementStyles.date.color)"
                :font-weight="letterElementStyles.date.weight"
                :font-family="textFontFamily('date')"
              />
              <HoverRichTextEditor
                v-model="model.location"
                :font-size="`${letterElementStyles.address.size}px`"
                :color="
                  readableCoverTextColor(letterElementStyles.address.color)
                "
                :font-weight="letterElementStyles.address.weight"
                :font-family="textFontFamily('address')"
              />
            </div>
            <div
              class="hero-row"
              :class="{ 'hero-row--layout-right': isLayoutRight }"
            >
              <div
                class="avatar-upload hero-avatar photo-shell"
                :style="{
                  width: `${imageSize}px`,
                  height: `${imageSize}px`,
                  borderRadius: imageShape === 'circle' ? '999px' : '12px',
                }"
                @click="openPhotoUpload"
              >
                <v-menu
                  v-model="photoQuickMenuOpen"
                  location="right start"
                  :close-on-content-click="false"
                >
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-dots-vertical"
                      size="x-small"
                      class="photo-quick-trigger"
                      variant="elevated"
                      @click.stop
                    />
                  </template>
                  <v-card
                    class="pa-3 photo-quick-menu"
                    min-width="240"
                    @click.stop
                  >
                    <v-slider
                      v-model="imageSize"
                      label="Image size"
                      min="48"
                      max="180"
                      step="1"
                      hide-details
                      class="mt-1"
                    />
                    <v-slider
                      v-model="imageBorderWidth"
                      label="Border width"
                      min="0"
                      max="12"
                      step="1"
                      hide-details
                      class="mt-3"
                    />
                    <v-menu location="right start">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          class="mt-3"
                          variant="outlined"
                          block
                          >Border color</v-btn
                        >
                      </template>
                      <v-card class="pa-2">
                        <div class="d-flex flex-wrap ga-2">
                          <v-btn
                            v-for="color in borderColorOptions"
                            :key="`border-${color}`"
                            icon
                            size="x-small"
                            :style="{
                              backgroundColor: color,
                              border:
                                imageBorderColor === color
                                  ? '2px solid #111827'
                                  : '1px solid #cbd5e1',
                            }"
                            @click="imageBorderColor = color"
                          />
                        </div>
                      </v-card>
                    </v-menu>
                    <AppSelect
                      v-model="imageShape"
                      :items="[
                        { title: 'Circle', value: 'circle' },
                        { title: 'Square', value: 'square' },
                      ]"
                      label="Image shape"
                      hide-details
                      class="mt-3"
                    />
                  </v-card>
                </v-menu>
                <div class="photo-shell__img">
                  <v-img :src="model.photoUrl" alt="profile" cover />
                </div>
              </div>
              <HoverRichTextEditor
                v-model="model.fullName"
                class="hero-name"
                :font-family="textFontFamily('fullName', 'serif')"
              />
              <HoverRichTextEditor
                v-model="model.role"
                class="hero-role"
                :font-family="textFontFamily('role')"
              />
              <span class="hero-location">{{ model.location }}</span>
            </div>
          </header>
          <section class="letter-body">
            <HoverRichTextEditor
              v-model="model.heading"
              class="letter-heading"
              :font-family="textFontFamily('heading', 'serif')"
            />
            <HoverRichTextEditor
              v-model="model.companyParagraph"
              :font-family="textFontFamily('body')"
            />
            <HoverRichTextEditor
              v-model="model.email"
              :font-family="textFontFamily('email')"
            />
            <HoverRichTextEditor
              v-model="model.phone"
              :font-family="textFontFamily('phone', 'serif')"
            />
          </section>
          <footer v-if="signatureDataUrl" class="signature-footer">
            <div class="signature-box">
              <img
                :src="signatureDataUrl"
                alt="signature"
                class="signature-image"
              /><v-menu location="bottom end"
                ><template #activator="{ props }"
                  ><v-btn
                    v-bind="props"
                    icon="mdi-dots-vertical"
                    size="x-small"
                    class="signature-menu-btn" /></template
                ><v-list density="compact"
                  ><v-list-item
                    prepend-icon="mdi-pencil"
                    title="Edit"
                    @click="openSignatureDialog" /><v-list-item
                    prepend-icon="mdi-delete"
                    title="Delete"
                    @click="deleteSignature" /></v-list
              ></v-menu>
            </div>
          </footer>
        </main>
        <ResumePreviewPageBreak
          v-if="showCoverPreviewPageBreak"
          :page-number="1"
        />
      </div>
      <input
        ref="photoInput"
        type="file"
        accept="image/*"
        class="d-none"
        @change="onPhotoUpload"
      />
      <AppModal
        v-model="aiModalOpen"
        title="AI Cover Letter Assistant"
        :max-width="760"
      >
        <p class="mb-4">{{ aiPromptProgress }}</p>
        <v-row>
          <v-col cols="12" md="6"
            ><v-text-field
              v-model="aiFullName"
              label="Full name"
              variant="outlined"
              hide-details
          /></v-col>
          <v-col cols="12" md="6"
            ><v-text-field
              v-model="aiRole"
              label="Role"
              variant="outlined"
              hide-details
          /></v-col>
          <v-col cols="12" md="6"
            ><v-text-field
              v-model="aiLocation"
              label="Location"
              variant="outlined"
              hide-details
          /></v-col>
          <v-col cols="12" md="6"
            ><v-text-field label="Email" variant="outlined" hide-details
          /></v-col>
          <v-col cols="12" md="6"
            ><v-text-field label="Phone" variant="outlined" hide-details
          /></v-col>
          <v-col cols="12" md="6"
            ><v-text-field label="Company name" variant="outlined" hide-details
          /></v-col>
          <v-col cols="12" md="6"
            ><v-text-field
              label="Requested position"
              variant="outlined"
              hide-details
          /></v-col>
          <v-col cols="12"
            ><v-file-input
              label="Upload profile image"
              accept="image/*"
              variant="outlined"
              prepend-icon="mdi-image-plus"
              hide-details
              @change="onAiPhotoUpload"
          /></v-col>
          <v-col cols="12"
            ><v-textarea
              v-model="aiAboutText"
              label="Describe yourself and why you fit this role"
              rows="5"
              variant="outlined"
              hide-details
          /></v-col>
        </v-row>
        <v-progress-linear
          v-if="aiGenerating"
          :model-value="aiProgress"
          color="primary"
          height="8"
          rounded
          class="mt-4"
        />
        <div class="d-flex justify-end mt-4">
          <v-btn
            color="primary"
            :loading="aiGenerating"
            :disabled="!aiAboutText.trim()"
            @click="generateCoverLetterWithAi"
          >
            Generate
          </v-btn>
        </div>
      </AppModal>
      <AppModal v-model="signatureDialogOpen" title="Signature" :max-width="760"
        ><canvas
          ref="signatureCanvas"
          style="
            width: 100%;
            height: 200px;
            border: 1px solid rgba(0, 0, 0, 0.15);
            border-radius: 10px;
          "
        />
        <div class="d-flex justify-end ga-2 mt-3">
          <v-btn variant="text" @click="clearSignatureCanvas">Clear</v-btn
          ><v-btn variant="tonal" @click="closeSignatureDialog">Cancel</v-btn
          ><v-btn color="primary" @click="saveSignatureFromCanvas">Save</v-btn>
        </div></AppModal
      >
    </v-container>
  </div>
</template>
<style lang="scss">
@use '~/assets/styles/resume-cover-borders';
</style>

<style scoped>
.preview-single-page-frame {
  position: relative;
  flex-direction: column;
  align-items: center;
}
.capture-cover-letter {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  width: min(100%, 794px);
  min-height: 1123px;
  padding: 56px 64px;
  background: var(--cp-bg);
  color: var(--cp-text);
  border: var(--cp-page-border-width) solid var(--cp-page-border-color);
  border-radius: var(--cp-page-border-radius);
}
.hero {
  border-left: var(--bar-primary-width) solid var(--cp-primary);
  padding-left: 24px;
  padding-top: 6px;
  margin-bottom: 42px;
  border-radius: var(--bar-radius);
  position: relative;
  min-height: 140px;
}
.meta-top-right {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  text-align: right;
}
.meta-top-right--layout-right {
  right: auto;
  left: 0;
  text-align: left;
  align-items: flex-start;
}
.hero-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding-top: 8px;
}
.hero-avatar {
  align-self: flex-start;
}
.hero-avatar--right {
  align-self: flex-end;
}
.hero--photo-right {
  padding-top: 8px;
}
.hero--ribbon {
  padding-top: 16px;
  padding-bottom: 12px;
}
.hero--no-bar {
  border-left: 0 !important;
  border-right: 0 !important;
  padding-left: 0;
  padding-right: 0;
}
.hero--double::before {
  content: '';
  position: absolute;
  left: calc(var(--bar-primary-width) + 6px);
  top: 0;
  bottom: 0;
  width: var(--bar-secondary-width);
  background: var(--cp-secondary);
  border-radius: var(--bar-radius);
}
.hero--layout-right {
  border-left: 0;
  border-right: var(--bar-primary-width) solid var(--cp-primary);
  padding-left: 0;
  padding-right: 24px;
  text-align: right;
}
.hero--layout-right.hero--double::before {
  left: auto;
  right: calc(var(--bar-primary-width) + 6px);
}
.hero-row--layout-right {
  align-items: flex-end;
}
.hero-row--layout-right .hero-avatar {
  align-self: flex-end;
}
.avatar-upload {
  cursor: pointer;
  border-style: solid;
  border-color: v-bind(imageBorderColor);
  border-width: v-bind(imageBorderWidth + 'px');
  overflow: visible;
}
.photo-shell {
  display: block;
  position: relative;
}
.photo-quick-trigger {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 30;
  opacity: 0;
  transition: opacity 0.15s ease;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.2);
}
.photo-shell:hover .photo-quick-trigger,
.photo-shell:focus-within .photo-quick-trigger,
.photo-quick-trigger:focus-visible {
  opacity: 1;
}
.photo-quick-menu {
  border: 1px solid rgba(148, 163, 184, 0.4);
}
.photo-shell__img {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
}
.photo-shell__img :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}
.hero-name :deep(p) {
  margin: 2px 0 0;
  font-size: 38px;
  font-weight: 700;
  color: var(--cp-text);
  line-height: 1.05;
}
.hero-role :deep(p) {
  margin: 0;
  font-size: 21px;
  color: var(--cp-muted);
}
.hero-location {
  margin-top: 4px;
  color: var(--cp-muted);
}
p {
  font-size: calc(var(--body-size) * 0.92);
  color: var(--body-color);
  line-height: 1.55;
  margin: 0 0 18px;
}
.letter-heading :deep(p) {
  font-weight: 700;
  color: var(--cp-text);
  margin-bottom: 24px;
}
section {
  border-top: 2px var(--section-divider-style) var(--section-divider-color);
  padding-top: 24px;
  margin-top: var(--section-spacing);
}
.decor-object {
  position: absolute;
  pointer-events: none;
  color: var(--cp-primary);
  background: color-mix(in srgb, var(--cp-primary) 35%, transparent);
  box-shadow:
    0 0 0 1px color-mix(in srgb, currentColor 32%, rgba(255, 255, 255, 0.72)),
    0 4px 18px color-mix(in srgb, currentColor 28%, transparent);
}
.decor-circle {
  border-radius: 999px;
}
.decor-ring {
  border-radius: 999px;
  background: transparent;
  border: 3px solid color-mix(in srgb, var(--cp-secondary) 55%, transparent);
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
.preview-toolbar-wrap {
  position: sticky;
  top: 76px;
  z-index: 20;
  display: flex;
  justify-content: center;
}
.preview-toolbar-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 999px;
  background: rgba(var(--v-theme-primary));
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
</style>

<style scoped>
@media (prefers-color-scheme: dark) {
  .capture-cover-page,
  .capture-cover-letter {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  }
}
</style>

<style scoped>
.template-menu-card {
  margin-top: 8px;
  padding: 12px;
}

.template-menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 168px);
  justify-content: center;
  gap: 12px;
}

.template-menu-item {
  margin: 0;
}

.template-menu-thumb {
  height: 128px;
}

@media (max-width: 1100px) {
  .template-menu-grid {
    grid-template-columns: repeat(2, 148px);
  }

  .template-menu-thumb {
    height: 112px;
  }
}
</style>

<style scoped>
.palette-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgb(var(--v-theme-on-surface), 0.2);
}
</style>
