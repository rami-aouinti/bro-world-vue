<script setup lang="ts">
import { listMyResumes, type ResumeApiItem } from '~/services/resumeApi'
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-90.json'
import ResumeLayoutAside from '~/components/resume/layouts/ResumeLayoutAside.vue'
import ResumeLayoutAsideLeft from '~/components/resume/layouts/ResumeLayoutAsideLeft.vue'
import ResumeLayoutAsideRight from '~/components/resume/layouts/ResumeLayoutAsideRight.vue'
import ResumeLayoutNoAside from '~/components/resume/layouts/ResumeLayoutNoAside.vue'
import ResumeLayoutAsideFullLeft from '~/components/resume/layouts/ResumeLayoutAsideFullLeft.vue'
import ResumeLayoutAsideFullRight from '~/components/resume/layouts/ResumeLayoutAsideFullRight.vue'
import ResumeLayoutBarLeft from '~/components/resume/layouts/ResumeLayoutBarLeft.vue'
import ResumeLayoutBarRight from '~/components/resume/layouts/ResumeLayoutBarRight.vue'
import ResumeTemplateDecor from '~/components/Resume/ResumeTemplateDecor.vue'

definePageMeta({
  title: 'resumeBuilder.meta.previewTitle',
  layout: 'resume',
})

type GeneratedTemplate = (typeof GENERATED_RESUME_TEMPLATES)[number]
type SectionVariants = Record<string, string>
const route = useRoute()
const router = useRouter()
const { allTemplates } = useResumeTemplates()
const { loggedIn } = useUserSession()
const loadingResumes = ref(false)
const resumesError = ref('')
const myResumes = ref<ResumeApiItem[]>([])
const CONTROLLED_LAYOUTS = ['aside-left', 'aside-right', 'no-aside', 'aside', 'aside-full-left', 'aside-full-right', 'bar-left', 'bar-right', 'top-photo-right', 'top-bar', ''] as const
type PalettePresetOption = { title: string; value: string; primary: string; dark: string; light: string }

function clampChannel(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)))
}

function normalizeHexColor(color: string) {
  const value = color.trim().replace('#', '')
  if (value.length === 3) return `#${value.split('').map((char) => char + char).join('').toUpperCase()}`
  if (value.length === 6) return `#${value.toUpperCase()}`
  return '#0F4C81'
}

function blendHexColor(hex: string, target: 'white' | 'black', amount: number) {
  const normalized = normalizeHexColor(hex)
  const r = Number.parseInt(normalized.slice(1, 3), 16)
  const g = Number.parseInt(normalized.slice(3, 5), 16)
  const b = Number.parseInt(normalized.slice(5, 7), 16)
  const mix = target === 'white' ? 255 : 0
  const ratio = Math.min(1, Math.max(0, amount))
  const nextR = clampChannel(r + (mix - r) * ratio)
  const nextG = clampChannel(g + (mix - g) * ratio)
  const nextB = clampChannel(b + (mix - b) * ratio)
  return `#${nextR.toString(16).padStart(2, '0')}${nextG.toString(16).padStart(2, '0')}${nextB.toString(16).padStart(2, '0')}`.toUpperCase()
}


const layoutFilterOptions = computed(() => {
  const layouts = Array.from(
    new Set(GENERATED_RESUME_TEMPLATES.map((template) => template.layout)),
  ).filter((layout) =>
    CONTROLLED_LAYOUTS.includes(layout as (typeof CONTROLLED_LAYOUTS)[number]),
  )

  return layouts.map((layout) => ({ title: layout, value: layout }))
})

const fakeResume: ResumeApiItem = {
  id: 'fake-resume',
  documentUrl: null,
  resumeInformation: {
    fullName: 'Alex Martin',
    title: 'Senior Full Stack Developer',
    profileText:
      'Product-minded engineer with 8+ years delivering scalable web platforms, mentoring teams, and shipping high-impact features end-to-end.',
    email: 'alex.martin@example.com',
    phone: '+33 6 00 00 00 00',
    adresse: 'Paris, France',
    address: 'Paris, France',
    homepage: 'https://alexmartin.dev',
    repo_profile: 'https://github.com/alexmartin-dev',
    photo: '/img/default_avatar.svg',
  },
  experiences: [
    {
      title: 'Senior Full Stack Developer',
      company: 'Bro Labs',
      location: 'Paris, France',
      description:
        'Led delivery of SaaS modules, optimized API latency by 35%, and built reusable UI systems with Vue 3 and TypeScript.',
      startDate: '2021-01-01',
      endDate: null,
    },
    {
      title: 'Frontend Engineer',
      company: 'Nova Digital',
      location: 'Lyon, France',
      description:
        'Built design-system components and analytics dashboards used by 40k+ monthly users.',
      startDate: '2018-06-01',
      endDate: '2020-12-31',
    },
  ],
  educations: [
    {
      title: 'Master in Computer Science',
      school: 'University of Lyon',
      startDate: '2018-09-01',
      endDate: '2020-06-30',
      location: 'Lyon, France',
      description: 'Specialization in distributed systems and software architecture.',
    },
    {
      title: 'Bachelor in Software Engineering',
      school: 'Université Grenoble Alpes',
      startDate: '2014-09-01',
      endDate: '2017-06-30',
      location: 'Grenoble, France',
    },
  ],
  skills: [
    { title: 'Vue.js' },
    { title: 'TypeScript' },
    { title: 'Node.js' },
    { title: 'Nuxt' },
    { title: 'PostgreSQL' },
    { title: 'Docker' },
  ],
  projects: [
    {
      title: 'Recruitment Analytics Platform',
      description: 'Real-time hiring KPIs dashboard with role-based access and export workflows.',
      home_page: 'https://demo.bro-world-space.com',
      startDate: '2023-02-01',
      endDate: null,
    },
    {
      title: 'Design System Kit',
      description: 'Reusable component library shared across 6 internal products.',
      startDate: '2022-01-01',
      endDate: '2022-11-01',
    },
  ],
  certifications: [
    {
      title: 'AWS Certified Developer – Associate',
      description: 'Amazon Web Services',
      startDate: '2023-05-01',
      endDate: '2026-05-01',
    },
    {
      title: 'Professional Scrum Master I',
      description: 'Scrum.org',
      startDate: '2022-09-01',
      endDate: null,
    },
  ],
  languages: [
    { title: 'French', level: 'Native', countryCode: 'FR' },
    { title: 'English', level: 'Professional', countryCode: 'GB' },
    { title: 'Spanish', level: 'Conversational', countryCode: 'ES' },
  ],
  references: [
    {
      title: 'Sophie Bernard · Engineering Manager',
      company: 'Bro Labs',
      description: 'sophie.bernard@brolabs.dev · +33 6 11 22 33 44',
    },
    {
      title: 'Julien Roche · Product Director',
      company: 'Nova Digital',
      description: 'julien.roche@novadigital.fr · +33 6 55 44 33 22',
    },
  ],
  hobbies: [
    { title: 'Open-source contribution' },
    { title: 'Trail running' },
    { title: 'Photography' },
  ],
}

const selectedTemplate = computed(() => {
  const templateId = String(route.query.template || '')
  if (!templateId) return null
  return (
    allTemplates.value.find((template) => template.id === templateId || template.templateId === templateId) ||
    null
  )
})

const selectedGeneratedTemplate = computed<GeneratedTemplate | null>(() => {
  const generatedTemplateId = selectedTemplate.value?.templateId || selectedTemplate.value?.id
  if (!generatedTemplateId) return null
  return GENERATED_RESUME_TEMPLATES.find((template) => template.id === generatedTemplateId) || null
})

const selectedLayout = ref<(typeof CONTROLLED_LAYOUTS)[number]>('no-aside')
const selectedStructure = ref<'structure-1' | 'structure-2'>('structure-1')
const selectedPalette = ref<string>('template')
const customPalettePrimary = ref<string>('#0F4C81')
const selectedSectionVariants = ref<SectionVariants>({})
const selectedTextStyle = ref<string>('')
const selectedAsideWidth = ref<number>(240)
const selectedAsideHeight = ref<number>(100)
const selectedAsideRadius = ref<number>(18)
const selectedHeaderBandHeight = ref<number>(100)
const syncingTemplateControls = ref(false)

const selectedPhotoPosition = ref<string>('left')
const selectedPhotoSize = ref<number>(96)
const selectedPhotoShape = ref<string>('circle')
const selectedPhotoBorderWidth = ref<number>(2)
const selectedPhotoBorderStyle = ref<string>('solid')
const selectedPhotoBorderColor = ref<string>('#0F4C81')
const decorShapeOptions = [
  'circle',
  'square',
  'triangle',
  'blob',
  'line',
  'ring',
  'bar',
  'diamond',
  'pill',
] as const
const previewToolbarTemplateMenuOpen = ref(false)
const layoutMenuOpen = ref(false)
const signatureDialogOpen = ref(false)
const signatureDataUrl = ref<string>('')
const signatureCanvas = ref<HTMLCanvasElement | null>(null)
const savingResume = ref(false)
const saveResumeError = ref('')
const saveResumeSuccess = ref('')
const drawingSignature = ref(false)
const signatureStrokeColor = ref('#0f172a')

function goToCreateResume() {
  router.push('/resume/preview')
}

function normalizeTemplateLabel(name: string) {
  return name
    .split('-')
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ')
}

const previewToolbarTemplates = computed(() => {
  const uniqueTemplates = new Map<string, { id: string; label: string; previewColor: string }>()

  GENERATED_RESUME_TEMPLATES.forEach((template) => {
    uniqueTemplates.set(template.id, {
      id: template.id,
      label: normalizeTemplateLabel(template.name),
      previewColor: template.theme?.palette?.primary || '#0F4C81',
    })
  })

  return Array.from(uniqueTemplates.values())
})


function applyPreviewTemplate(templateId: string) {
  const selected = GENERATED_RESUME_TEMPLATES.find((template) => template.id === templateId)
  if (!selected) return

  router.replace({
    query: {
      ...route.query,
      template: templateId,
      layout: selected.layout || 'no-aside',
      structure: (selected as any).structure === 'structure-2' ? 'structure-2' : 'structure-1',
      palette: 'template',
      textStyle: String(selected.theme?.textStyle || ''),
    },
  })
}

function openSignatureDialog() {
  signatureDialogOpen.value = true
}

function drawSignatureAtBottom() {
  if (!signatureDataUrl.value) return
  const info = resumeToDisplay.value.resumeInformation || {}
  resumeToDisplay.value.resumeInformation = {
    ...info,
    signature: signatureDataUrl.value,
  }
  signatureDialogOpen.value = false
}

async function saveResumeFromPreview() {
  savingResume.value = true
  saveResumeError.value = ''
  saveResumeSuccess.value = ''
  try {
    await $fetch('/api/v1/recruit/resumes', {
      method: 'POST',
      body: resumeToDisplay.value,
    })
    saveResumeSuccess.value = 'Resume saved successfully.'
  }
  catch (error: any) {
    saveResumeError.value = error?.data?.message || 'Unable to save the resume.'
  }
  finally {
    savingResume.value = false
  }
}

function downloadPdf() {
  window.print()
}


const photoPositionOptions = [
  { title: 'Left', value: 'left' },
  { title: 'Right', value: 'right' },
  { title: 'Center', value: 'center' },
]

const photoShapeOptions = computed(() => {
  const shapes = new Set<string>(['circle', 'rounded', 'square'])
  GENERATED_RESUME_TEMPLATES.forEach((template) => {
    ;(template.photoOptions?.shapeList || []).forEach((shape) => shapes.add(shape))
  })
  return Array.from(shapes).map((shape) => ({ title: shape, value: shape }))
})


const editableDecorCorners = ref<Array<{ shape: string; size: number; x: number; y: number; color: string }>>([])

function normalizeDecorCorner(corner: any) {
  const sizeRaw = String(corner?.size ?? '96').replace('px', '')
  const size = Number.parseInt(sizeRaw, 10)
  const xRaw = corner?.x
  const yRaw = corner?.y

  const parseAxis = (value: unknown, axis: 'x' | 'y') => {
    if (typeof value === 'number') return value
    const stringValue = String(value ?? '')
    if (/^-?\d+(\.\d+)?$/.test(stringValue)) return Number.parseFloat(stringValue)
    if (stringValue.endsWith('%')) return Number.parseFloat(stringValue.replace('%', ''))
    const tokens = stringValue.toLowerCase().split('-')
    if (axis === 'x') {
      if (tokens.includes('left')) return 0
      if (tokens.includes('right')) return 100
    }
    if (tokens.includes('top')) return 0
    if (tokens.includes('bottom')) return 100
    return 50
  }

  return {
    shape: String(corner?.shape || corner?.type || 'circle'),
    size: Number.isFinite(size) ? size : 96,
    x: parseAxis(xRaw, 'x'),
    y: parseAxis(yRaw, 'y'),
    color: String(corner?.color || '#0F4C81'),
  }
}

function addDecorCorner() {
  editableDecorCorners.value.push({ shape: 'circle', size: 120, x: 50, y: 50, color: '#5FA8D3' })
}

function removeDecorCorner(index: number) {
  editableDecorCorners.value.splice(index, 1)
}

const photoBorderStyleOptions = [
  { title: 'Solid', value: 'solid' },
  { title: 'Dashed', value: 'dashed' },
  { title: 'Dotted', value: 'dotted' },
  { title: 'Double', value: 'double' },
  { title: 'None', value: 'none' },
]

const sectionVariantOptions = computed(() => {
  const map = new Map<string, string[]>()
  GENERATED_RESUME_TEMPLATES.forEach((template) => {
    Object.entries(template.sections || {}).forEach(([sectionKey, variant]) => {
      if (!map.has(sectionKey)) map.set(sectionKey, [])
      const entries = map.get(sectionKey)!
      if (!entries.includes(variant)) entries.push(variant)
    })
  })

  return Array.from(map.entries()).reduce<
    Record<string, { title: string; value: string }[]>
  >((acc, [sectionKey, variants]) => {
    acc[sectionKey] = variants.map((variant) => ({
      title: variant,
      value: variant,
    }))
    return acc
  }, {})
})
const sectionVariantOptionsForDrawer = computed(() =>
  Object.fromEntries(
    Object.entries(sectionVariantOptions.value).filter(([sectionKey]) => sectionKey !== 'contact'),
  ),
)

const palettePresetOptions = computed<PalettePresetOption[]>(() => {
  const uniquePrimaries = new Set<string>()
  const extraPrimaries = [
    '#4F46E5',
    '#3E3D4D',
    '#AAAE79',
    '#6E8063',
    '#4C304F',
    '#3D3A76',
    '#059669',
    '#E11D48',
    '#0EA5E9',
    '#F97316',
  ]
  GENERATED_RESUME_TEMPLATES.forEach((template) => {
    uniquePrimaries.add(normalizeHexColor(template.theme?.palette?.primary || '#0F4C81'))
  })
  extraPrimaries.forEach((color) => uniquePrimaries.add(normalizeHexColor(color)))
  return Array.from(uniquePrimaries).map((primary, index) => ({
    title: `Preset · ${index + 1}`,
    value: primary,
    primary,
    dark: blendHexColor(primary, 'black', 0.2),
    light: blendHexColor(primary, 'white', 0.9),
  }))
})
const selectedPaletteOption = computed(() => palettePresetOptions.value.find((option) => option.value === selectedPalette.value) || null)

const textStyleFilterOptions = computed(() => {
  const styles = Array.from(new Set(GENERATED_RESUME_TEMPLATES.map((template) => template.theme?.textStyle).filter(Boolean)))
  return styles.map((style) => ({ title: String(style), value: String(style) }))
})

const asideHeightOptions = computed(() => {
  const heights = Array.from({ length: 11 }, (_, index) => 50 + index * 5)
  return heights.map((height) => ({ title: String(height), value: String(height) }))
})

const contactStyleOptions = [
  { title: 'Labels', value: 'labels' },
  { title: 'Icons', value: 'icons' },
]

const effectiveTemplate = computed<GeneratedTemplate | null>(() => {
  if (!selectedGeneratedTemplate.value) return null
  const base = selectedGeneratedTemplate.value
  const nextSections = { ...base.sections, ...selectedSectionVariants.value }
  const nextTheme = { ...base.theme, palette: { ...base.theme.palette } }
  const nextAside = { ...base.aside }
  const nextPhoto = {
    ...base.photo,
    position: selectedPhotoPosition.value,
    size: `${selectedPhotoSize.value}px`,
    shape: selectedPhotoShape.value,
    border: `${selectedPhotoBorderWidth.value}px ${selectedPhotoBorderStyle.value} ${selectedPhotoBorderColor.value}`,
  }

  if (selectedTextStyle.value) nextTheme.textStyle = selectedTextStyle.value as any
  nextAside.width = `${selectedAsideWidth.value}px`
  nextAside.height = `${selectedAsideHeight.value}%`
  nextAside.radius = `${selectedAsideRadius.value}px`
  ;(nextTheme as any).headerBandHeight = selectedHeaderBandHeight.value

  if (selectedPalette.value === 'custom') {
    nextTheme.palette.primary = customPalettePrimary.value
    nextTheme.palette.secondary = blendHexColor(customPalettePrimary.value, 'black', 0.2)
    nextTheme.palette.pageBackground = blendHexColor(customPalettePrimary.value, 'white', 0.9)
  } else if (selectedPalette.value !== 'template') {
    const selectedPreset = selectedPaletteOption.value
    if (selectedPreset) {
      nextTheme.palette.primary = selectedPreset.primary
      nextTheme.palette.secondary = selectedPreset.dark
      nextTheme.palette.pageBackground = selectedPreset.light
    }
  }

  return {
    ...base,
    layout: selectedLayout.value,
    structure: selectedStructure.value,
    sections: nextSections,
    theme: nextTheme,
    aside: nextAside,
    photo: nextPhoto,
    decor: {
      ...(base.decor || {}),
      corners: editableDecorCorners.value.map((corner) => ({
        shape: corner.shape,
        size: `${corner.size}px`,
        color: corner.color,
        x: corner.x,
        y: corner.y,
      })),
    },
  }
})

watch(
  selectedGeneratedTemplate,
  async (template) => {
    if (!template) return

    syncingTemplateControls.value = true

    selectedStructure.value =
      route.query.structure === 'structure-2' || (template as any).structure === 'structure-2'
        ? 'structure-2'
        : 'structure-1'
    const queryLayout =
      typeof route.query.layout === 'string' ? route.query.layout : ''
    selectedLayout.value = CONTROLLED_LAYOUTS.includes(
      queryLayout as (typeof CONTROLLED_LAYOUTS)[number],
    )
      ? (queryLayout as (typeof CONTROLLED_LAYOUTS)[number])
      : (template.layout as (typeof CONTROLLED_LAYOUTS)[number]) || 'no-aside'

    selectedPalette.value =
      typeof route.query.palette === 'string' ? route.query.palette : 'template'
    customPalettePrimary.value =
      typeof route.query.paletteCustom === 'string'
        ? route.query.paletteCustom
        : template.theme.palette.primary

    const nextSections: SectionVariants = {}
    Object.entries(template.sections || {}).forEach(
      ([sectionKey, defaultVariant]) => {
        const rawQueryValue = route.query[sectionKey]
        nextSections[sectionKey] =
          typeof rawQueryValue === 'string' ? rawQueryValue : defaultVariant
      },
    )
    selectedSectionVariants.value = nextSections
    selectedTextStyle.value = typeof route.query.textStyle === 'string' ? route.query.textStyle : String(template.theme?.textStyle || '')
    const asideWidthSource = typeof route.query.asideWidth === 'string' ? route.query.asideWidth : String(template.aside?.width || '240px')
    const asideHeightSource = typeof route.query.asideHeight === 'string' ? route.query.asideHeight : String(template.aside?.height || '100%')
    const asideRadiusSource = typeof route.query.asideRadius === 'string' ? route.query.asideRadius : String(template.aside?.radius || '18px')
    selectedAsideWidth.value = Number.parseInt(asideWidthSource.replace('px', ''), 10) || 240
    selectedAsideHeight.value = Number.parseInt(asideHeightSource.replace('%', ''), 10) || 100
    selectedAsideRadius.value = Number.parseInt(asideRadiusSource.replace('px', ''), 10) || 18

    const headerBandHeightSource = typeof route.query.headerBandHeight === 'string' ? route.query.headerBandHeight : String((template.theme as any)?.headerBandHeight || '100')
    selectedHeaderBandHeight.value = Number.parseInt(headerBandHeightSource, 10) || 100

    const photo = template.photo || { position: 'left', size: '96px', shape: 'circle', border: '2px solid #0F4C81' }
    editableDecorCorners.value = (template.decor?.corners || []).map((corner: any) => normalizeDecorCorner(corner))
    selectedPhotoPosition.value =
      typeof route.query.photoPosition === 'string' ? route.query.photoPosition : photo.position || 'left'
    const sizeSource =
      typeof route.query.photoSize === 'string' ? route.query.photoSize : String(photo.size || '96px')
    const parsedSize = Number.parseInt(sizeSource.replace('px', ''), 10)
    selectedPhotoSize.value = Number.isFinite(parsedSize) ? parsedSize : 96
    selectedPhotoShape.value =
      typeof route.query.photoShape === 'string' ? route.query.photoShape : photo.shape || 'circle'

    const borderSource =
      typeof route.query.photoBorder === 'string' ? route.query.photoBorder : String(photo.border || '2px solid #0F4C81')
    const borderMatch = borderSource.match(/^(\d+)px\s+(\w+)\s+(.+)$/)
    if (borderMatch) {
      selectedPhotoBorderWidth.value = Number.parseInt(borderMatch[1] || '2', 10)
      selectedPhotoBorderStyle.value = borderMatch[2] || 'solid'
      selectedPhotoBorderColor.value = borderMatch[3] || '#0F4C81'
    }

    await nextTick()
    syncingTemplateControls.value = false
  },
  { immediate: true },
)

watch(
  [
    selectedLayout,
    selectedPalette,
    customPalettePrimary,
    selectedSectionVariants,
    selectedTextStyle,
    selectedAsideWidth,
    selectedAsideHeight,
    selectedAsideRadius,
    selectedHeaderBandHeight,
    selectedPhotoPosition,
    selectedPhotoSize,
    selectedPhotoShape,
    selectedPhotoBorderWidth,
    selectedPhotoBorderStyle,
    selectedPhotoBorderColor,
  ],
  () => {
    if (!selectedGeneratedTemplate.value) return

    const query = {
      ...route.query,
      layout: selectedLayout.value,
      palette: selectedPalette.value,
      paletteCustom: customPalettePrimary.value,
      structure: selectedStructure.value,
      photoPosition: selectedPhotoPosition.value,
      photoSize: String(selectedPhotoSize.value),
      photoShape: selectedPhotoShape.value,
      photoBorder: `${selectedPhotoBorderWidth.value}px ${selectedPhotoBorderStyle.value} ${selectedPhotoBorderColor.value}`,
      asideRadius: `${selectedAsideRadius.value}px`,
      headerBandHeight: String(selectedHeaderBandHeight.value),
    } as Record<string, string>

    Object.entries(selectedSectionVariants.value).forEach(
      ([sectionKey, variant]) => {
        query[sectionKey] = variant
      },
    )

    router.replace({ query })
  },
  { deep: true },
)
onMounted(async () => {
  if (!loggedIn.value) return
  loadingResumes.value = true
  resumesError.value = ''
  try {
    myResumes.value = await listMyResumes()
  } catch {
    resumesError.value = 'Unable to load your resume data.'
  } finally {
    loadingResumes.value = false
  }
})

const resumeToDisplay = computed<ResumeApiItem>(() => {
  if (loggedIn.value && myResumes.value.length > 0) return myResumes.value[0]
  return fakeResume
})

function onLayoutSectionVariantChange(sectionKey: string, variant: string) {
  selectedSectionVariants.value = {
    ...selectedSectionVariants.value,
    [sectionKey]: variant,
  }
}

const activeLayoutComponent = computed(() => {
  const layout = effectiveTemplate.value?.layout || 'no-aside'
  if (layout === 'aside') return ResumeLayoutAside
  if (layout === 'aside-left') return ResumeLayoutAsideLeft
  if (layout === 'aside-right') return ResumeLayoutAsideRight
  if (layout === 'aside-full-left') return ResumeLayoutAsideFullLeft
  if (layout === 'aside-full-right') return ResumeLayoutAsideFullRight
  if (layout === 'bar-left') return ResumeLayoutBarLeft
  if (layout === 'bar-right') return ResumeLayoutBarRight
  return ResumeLayoutNoAside
})

const signatureBackgroundColor = computed(
  () => effectiveTemplate.value?.theme?.palette?.pageBackground || '#FFFFFF',
)

const signaturePreviewUrl = computed(() => {
  const info = resumeToDisplay.value.resumeInformation as Record<string, any> | undefined
  return (typeof info?.signature === 'string' && info.signature) || ''
})

function getCanvasPosition(event: PointerEvent) {
  const canvas = signatureCanvas.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  }
}

function ensureSignatureCanvas() {
  const canvas = signatureCanvas.value
  if (!canvas) return
  canvas.width = 700
  canvas.height = 240
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.fillStyle = signatureBackgroundColor.value
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = signatureStrokeColor.value
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
}

function onSignaturePointerDown(event: PointerEvent) {
  const canvas = signatureCanvas.value
  const ctx = canvas?.getContext('2d')
  const point = getCanvasPosition(event)
  if (!canvas || !ctx || !point) return
  event.preventDefault()
  canvas.setPointerCapture(event.pointerId)
  drawingSignature.value = true
  ctx.beginPath()
  ctx.moveTo(point.x, point.y)
}

function onSignaturePointerMove(event: PointerEvent) {
  const canvas = signatureCanvas.value
  const ctx = canvas?.getContext('2d')
  const point = getCanvasPosition(event)
  if (!drawingSignature.value || !canvas || !ctx || !point) return
  event.preventDefault()
  ctx.lineTo(point.x, point.y)
  ctx.stroke()
}

function onSignaturePointerUp(event?: PointerEvent) {
  const canvas = signatureCanvas.value
  if (event && canvas?.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId)
  }
  drawingSignature.value = false
  signatureDataUrl.value = canvas?.toDataURL('image/png') || ''
}

watch(signatureDialogOpen, (opened) => {
  if (!opened) return
  nextTick(() => {
    ensureSignatureCanvas()
    const canvas = signatureCanvas.value
    if (!canvas) return
    canvas.onpointerdown = onSignaturePointerDown
    canvas.onpointermove = onSignaturePointerMove
    canvas.onpointerup = onSignaturePointerUp
    canvas.onpointerleave = onSignaturePointerUp
  })
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>

        <div class="pt-3">
          <v-menu v-model="previewToolbarTemplateMenuOpen" :close-on-content-click="true">
            <template #activator="{ props }">
              <v-btn v-bind="props" variant="outlined" block justify="space-between" prepend-icon="mdi-palette">
                Palette
                <v-icon icon="mdi-chevron-down" />
              </v-btn>
            </template>
            <v-list min-width="320">
              <v-list-item title="Template palette" @click="selectedPalette = 'template'" />
              <v-list-item>
                <div class="palette-grid">
                  <button
                    v-for="option in palettePresetOptions"
                    :key="option.value"
                    type="button"
                    class="palette-swatch-btn"
                    :class="{ 'palette-swatch-btn--active': selectedPalette === option.value }"
                    @click="selectedPalette = option.value"
                  >
                    <div class="d-flex ga-1">
                      <span class="palette-dot" :style="{ backgroundColor: option.primary }" />
                      <span class="palette-dot" :style="{ backgroundColor: option.dark }" />
                      <span class="palette-dot" :style="{ backgroundColor: option.light }" />
                    </div>
                  </button>
                </div>
              </v-list-item>
              <v-list-item title="Custom" @click="selectedPalette = 'custom'">
                <template #append>
                  <div class="d-flex ga-1">
                    <span class="palette-dot" :style="{ backgroundColor: customPalettePrimary }" />
                    <span class="palette-dot" :style="{ backgroundColor: blendHexColor(customPalettePrimary, 'black', 0.2) }" />
                    <span class="palette-dot" :style="{ backgroundColor: blendHexColor(customPalettePrimary, 'white', 0.9) }" />
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
        <v-text-field
          v-if="selectedPalette === 'custom'"
          v-model="customPalettePrimary"
          label="Custom primary color"
          placeholder="#0F4C81"
          class="pt-3"
          hide-details
        />
        <AppSelect
          v-model="selectedStructure"
          :items="[
            { title: 'Structure 1 · Linear', value: 'structure-1' },
            { title: 'Structure 2 · Split', value: 'structure-2' },
            { title: 'Structure 3 · Split', value: 'structure-3' },
          ]"
          label="Structure"
          class="pt-3"
          hide-details
        />
        <AppSelect
          v-model="selectedLayout"
          :items="layoutFilterOptions"
          label="Layout"
          class="pt-3"
          hide-details
        />
        <AppSelect
          v-model="selectedTextStyle"
          :items="textStyleFilterOptions"
          label="Text style"
          class="pt-3"
          hide-details
        />
        <AppSelect
          v-model="selectedSectionVariants.contact"
          :items="contactStyleOptions"
          label="Contact style"
          class="pt-3"
          hide-details
        />
      </template>
      <template #right>
        <v-slider
          v-model="selectedAsideRadius"
          label="Aside radius (px)"
          min="0"
          max="48"
          step="1"
          hide-details
          class="mb-3"
        />
        <v-slider
          v-model="selectedAsideWidth"
          label="Aside width (px)"
          min="160"
          max="450"
          step="2"
          hide-details
        />
        <v-slider
          v-model="selectedAsideHeight"
          label="Aside height (%)"
          min="60"
          max="100"
          step="1"
          hide-details
        />
        <v-divider class="my-4" />
        <div class="text-subtitle-2 mb-2">Corner decor</div>
        <v-btn size="small" variant="outlined" class="mb-3" @click="addDecorCorner">Add corner decor</v-btn>
        <v-card
          v-for="(corner, index) in editableDecorCorners"
          :key="`corner-${index}`"
          variant="text"
          class="pa-2 mb-3"
        >
          <AppSelect
            v-model="corner.shape"
            :items="decorShapeOptions.map((shape) => ({ title: shape, value: shape }))"
            label="Shape"
            hide-details
          />
          <v-slider v-model="corner.size" label="Size (px)" min="20" max="520" step="1" hide-details />
          <v-slider v-model="corner.x" label="X (%)" min="0" max="100" step="1" hide-details />
          <v-slider v-model="corner.y" label="Y (%)" min="0" max="100" step="1" hide-details />
          <v-text-field v-model="corner.color" label="Color" type="color" hide-details />
          <v-btn size="x-small" color="error" variant="text" @click="removeDecorCorner(index)">supprimer un corner decor</v-btn>
        </v-card>
      </template>
    </AppPageDrawers>
    <v-container fluid>
      <div class="preview-toolbar-wrap">
        <div class="preview-toolbar-row">
          <v-btn
            class="preview-toolbar-btn"
            color="primary"
            size="small"
            variant="outlined"
            prepend-icon="mdi-content-save-cog-outline"
            :loading="savingResume"
            @click="saveResumeFromPreview"
          >
            Save
          </v-btn>

          <v-btn
            class="preview-toolbar-btn"
            color="primary"
            size="small"
            variant="outlined"
            prepend-icon="mdi-robot-outline"
            @click="goToCreateResume"
          >
            AI
          </v-btn>

          <v-btn
            class="preview-toolbar-btn"
            color="primary"
            size="small"
            variant="outlined"
            prepend-icon="mdi-signature-freehand"
            @click="openSignatureDialog"
          >
            Signature
          </v-btn>
          <v-btn
            class="preview-toolbar-btn"
            color="primary"
            size="small"
            variant="outlined"
            prepend-icon="mdi-file-pdf-box"
            @click="downloadPdf"
          >
            PDF
          </v-btn>

          <v-menu
            v-model="layoutMenuOpen"
            location="bottom center"
            origin="top center"
          >
            <template #activator="{ props }">
              <v-btn
                class="preview-toolbar-btn"
                color="primary"
                size="small"
                variant="outlined"
                prepend-icon="mdi-view-grid-outline"
                v-bind="props"
              >
                Templates
              </v-btn>
            </template>
            <v-list density="compact" min-width="240">
              <v-list-item
                v-for="template in previewToolbarTemplates"
                :key="`preview-toolbar-template-${template.id}`"
                :title="template.label"
                @click="applyPreviewTemplate(template.id)"
              >
                <template #prepend>
                  <div class="template-chip-preview" :style="{ backgroundColor: template.previewColor }" />
                </template>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
      <v-alert v-if="saveResumeError" type="error" variant="tonal" class="mb-3" :text="saveResumeError" />
      <v-alert v-if="saveResumeSuccess" type="success" variant="tonal" class="mb-3" :text="saveResumeSuccess" />
      <v-dialog v-model="signatureDialogOpen" max-width="760">
        <v-card>
          <v-card-title>Signature</v-card-title>
          <v-card-text>
            <div class="signature-modal-body" :style="{ backgroundColor: signatureBackgroundColor }">
              <canvas ref="signatureCanvas" class="signature-canvas" />
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="signatureDialogOpen = false">Fermer</v-btn>
            <v-btn color="primary" @click="drawSignatureAtBottom">Ajouter la signature</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-progress-linear v-if="loggedIn && loadingResumes" indeterminate />
      <v-alert
        v-else-if="loggedIn && resumesError"
        type="error"
        variant="tonal"
        :text="resumesError"
      />
      <template v-else>
        <div class="resume-preview-canvas" :style="{ backgroundColor: signatureBackgroundColor }">
          <ResumeTemplateDecor :decor="effectiveTemplate?.decor" />
          <component
            :is="activeLayoutComponent"
            :resume="resumeToDisplay"
            :template="effectiveTemplate"
            @change-variant="onLayoutSectionVariantChange"
            :header-band-height="selectedHeaderBandHeight"
          />
          <footer v-if="signaturePreviewUrl" class="resume-signature-footer">
            <img :src="signaturePreviewUrl" alt="Signature" class="resume-signature-image">
          </footer>
        </div>
      </template>
    </v-container>
  </div>
</template>


<style scoped>
.palette-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgb(var(--v-theme-on-surface), 0.2);
}
.palette-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.palette-swatch-btn {
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 12px;
  background: transparent;
  padding: 8px;
}
.palette-swatch-btn--active {
  border-color: rgb(var(--v-theme-primary));
}

.resume-preview-canvas {
  position: relative;
  overflow: hidden;
  background-color: v-bind(signatureBackgroundColor);
}

.resume-signature-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 18px 8px;
}

.resume-signature-image {
  height: 56px;
  width: auto;
  object-fit: contain;
}

.preview-toolbar-wrap {
  position: sticky;
  top: 90px;
  z-index: 20;
  display: flex;
  justify-content: center;
  margin: 12px 0 20px;
}

.preview-toolbar-row {
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

.preview-toolbar-btn {
  height: 56px !important;
  min-width: 56px !important;
  border-radius: 16px !important;
}

.template-chip-preview {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1px solid rgba(15, 23, 42, 0.25);
}

.signature-modal-body {
  border: 1px dashed rgba(15, 23, 42, 0.25);
  border-radius: 12px;
  padding: 8px;
}

.signature-canvas {
  width: 100%;
  min-height: 220px;
  display: block;
  border-radius: 10px;
  touch-action: none;
}

@media print {
  :global(html),
  :global(body) {
    background: #ffffff !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  :global(body *) {
    visibility: hidden !important;
  }

  .resume-preview-canvas,
  .resume-preview-canvas * {
    visibility: visible !important;
  }

  .resume-preview-canvas {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    min-height: 100vh;
    overflow: visible;
    background-color: v-bind(signatureBackgroundColor) !important;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
