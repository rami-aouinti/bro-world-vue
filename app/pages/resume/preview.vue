<script setup lang="ts">
import { listMyResumes, type ResumeApiItem } from '~/services/resumeApi'
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-90.json'
import ResumeLayoutAside from '~/components/resume/layouts/ResumeLayoutAside.vue'
import ResumeLayoutAsideLeft from '~/components/resume/layouts/ResumeLayoutAsideLeft.vue'
import ResumeLayoutAsideRight from '~/components/resume/layouts/ResumeLayoutAsideRight.vue'
import ResumeLayoutNoAside from '~/components/resume/layouts/ResumeLayoutNoAside.vue'

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

const CONTROLLED_LAYOUTS = ['aside-left', 'aside-right', 'no-aside', 'aside'] as const

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
    email: 'alex.martin@example.com',
    phone: '+33 6 00 00 00 00',
    adresse: 'Paris, France',
  },
  experiences: [
    {
      title: 'Full Stack Developer',
      company: 'Bro Labs',
      description: 'Développement APIs, Vue.js et architecture applicative.',
      startDate: '2021-01-01',
      endDate: null,
    },
  ],
  educations: [
    {
      title: 'Master Informatique',
      school: 'Université de Lyon',
      startDate: '2018-09-01',
      endDate: '2020-06-30',
      location: 'Lyon',
    },
  ],
  skills: [{ title: 'Vue.js' }, { title: 'TypeScript' }, { title: 'Node.js' }],
  languages: [{ title: 'Français' }, { title: 'Anglais' }],
}

const selectedTemplate = computed(() => {
  const templateId = String(route.query.template || '')
  if (!templateId) return null
  return (
    allTemplates.value.find((template) => template.templateId === templateId) ||
    null
  )
})

const selectedGeneratedTemplate = computed<GeneratedTemplate | null>(() => {
  if (!selectedTemplate.value?.templateId) return null
  return (
    GENERATED_RESUME_TEMPLATES.find(
      (template) => template.id === selectedTemplate.value?.templateId,
    ) || null
  )
})

const selectedLayout = ref<(typeof CONTROLLED_LAYOUTS)[number]>('no-aside')
const selectedStructure = ref<string>('')
const selectedPalette = ref<string>('template')
const customPalettePrimary = ref<string>('#0F4C81')
const selectedSectionVariants = ref<SectionVariants>({})

const selectedPhotoPosition = ref<string>('left')
const selectedPhotoSize = ref<number>(96)
const selectedPhotoShape = ref<string>('circle')
const selectedPhotoBorderWidth = ref<number>(2)
const selectedPhotoBorderStyle = ref<string>('solid')
const selectedPhotoBorderColor = ref<string>('#0F4C81')


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

const paletteOptions = computed(() => [
  { title: 'Template palette', value: 'template' },
  { title: 'Preset · Indigo', value: '#4F46E5' },
  { title: 'Preset · Gray', value: '#3e3d4d' },
  { title: 'Preset · Yellow', value: '#aaae79' },
  { title: 'Preset · Green', value: '#6e8063' },
  { title: 'Preset · Lees', value: '#4c304f' },
  { title: 'Preset · Mauve', value: '#3d3a76' },
  { title: 'Preset · Emerald', value: '#059669' },
  { title: 'Preset · Rose', value: '#E11D48' },
  { title: 'Custom', value: 'custom' },
])

const structureLayoutMap: Record<string, (typeof CONTROLLED_LAYOUTS)[number]> =
  {
    'two-columns-balanced': 'aside-left',
    'two-columns-main-heavy': 'aside-right',
    'header-band-split': 'no-aside',
  }

const effectiveTemplate = computed<GeneratedTemplate | null>(() => {
  if (!selectedGeneratedTemplate.value) return null
  const base = selectedGeneratedTemplate.value
  const nextSections = { ...base.sections, ...selectedSectionVariants.value }
  const nextTheme = { ...base.theme, palette: { ...base.theme.palette } }
  const nextPhoto = {
    ...base.photo,
    position: selectedPhotoPosition.value,
    size: `${selectedPhotoSize.value}px`,
    shape: selectedPhotoShape.value,
    border: `${selectedPhotoBorderWidth.value}px ${selectedPhotoBorderStyle.value} ${selectedPhotoBorderColor.value}`,
  }

  if (selectedPalette.value === 'custom') {
    nextTheme.palette.primary = customPalettePrimary.value
  } else if (selectedPalette.value !== 'template') {
    nextTheme.palette.primary = selectedPalette.value
  }

  return {
    ...base,
    layout: selectedLayout.value,
    sections: nextSections,
    theme: nextTheme,
    photo: nextPhoto,
  }
})

watch(
  selectedGeneratedTemplate,
  (template) => {
    if (!template) return

    selectedStructure.value =
      typeof route.query.structure === 'string'
        ? route.query.structure
        : (template as any).structure || ''
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

    const photo = template.photo || { position: 'left', size: '96px', shape: 'circle', border: '2px solid #0F4C81' }
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
  },
  { immediate: true },
)

watch(
  [
    selectedLayout,
    selectedPalette,
    customPalettePrimary,
    selectedSectionVariants,
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

watch(selectedStructure, (structure) => {
  const mapped = structureLayoutMap[structure]
  if (mapped) selectedLayout.value = mapped
})
onMounted(async () => {
  if (!loggedIn.value) return
  loadingResumes.value = true
  resumesError.value = ''
  try {
    myResumes.value = await listMyResumes()
  } catch {
    resumesError.value = 'Impossible de charger vos données de CV.'
  } finally {
    loadingResumes.value = false
  }
})

const resumeToDisplay = computed<ResumeApiItem>(() => {
  if (loggedIn.value && myResumes.value.length > 0) return myResumes.value[0]
  return fakeResume
})

const activeLayoutComponent = computed(() => {
  const layout = effectiveTemplate.value?.layout || 'no-aside'
  if (layout === 'aside') return ResumeLayoutAside
  if (layout === 'aside-left') return ResumeLayoutAsideLeft
  if (layout === 'aside-right') return ResumeLayoutAsideRight
  return ResumeLayoutNoAside
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <AppSelect
          v-model="selectedStructure"
          :items="[
            { title: 'Default', value: '' },
            { title: 'Two columns balanced', value: 'two-columns-balanced' },
            {
              title: 'Two columns main-heavy',
              value: 'two-columns-main-heavy',
            },
            { title: 'Header band + split', value: 'header-band-split' },
          ]"
          label="Structure"
          hide-details
        />
        <AppSelect
          v-model="selectedLayout"
          :items="layoutFilterOptions"
          label="Layout"
          hide-details
        />
        <AppSelect
          v-model="selectedPalette"
          :items="paletteOptions"
          label="Palette"
          hide-details
        />
        <v-text-field
          v-if="selectedPalette === 'custom'"
          v-model="customPalettePrimary"
          label="Custom primary color"
          placeholder="#0F4C81"
          hide-details
        />
        <AppSelect
          v-model="selectedPhotoPosition"
          :items="photoPositionOptions"
          label="Photo position"
          hide-details
        />
        <v-slider
          v-model="selectedPhotoSize"
          label="Photo size (px)"
          min="48"
          max="220"
          step="2"
          hide-details
        />
        <AppSelect
          v-model="selectedPhotoShape"
          :items="photoShapeOptions"
          label="Photo shape"
          hide-details
        />
        <v-slider
          v-model="selectedPhotoBorderWidth"
          label="Photo border width (px)"
          min="0"
          max="16"
          step="1"
          hide-details
        />
        <AppSelect
          v-model="selectedPhotoBorderStyle"
          :items="photoBorderStyleOptions"
          label="Photo border style"
          hide-details
        />
        <v-text-field
          v-model="selectedPhotoBorderColor"
          label="Photo border color"
          placeholder="#0F4C81"
          type="color"
          hide-details
        />
      </template>
      <template #right>
        <AppSelect
          v-for="(variantOptions, sectionKey) in sectionVariantOptions"
          :key="sectionKey"
          v-model="selectedSectionVariants[sectionKey]"
          :items="variantOptions"
          :label="`Section: ${sectionKey}`"
          hide-details
        />
      </template>
    </AppPageDrawers>
    <v-container class="py-6" max-width="900">
      <v-card class="mx-auto" variant="outlined">
        <v-card-text>
          <v-progress-linear v-if="loggedIn && loadingResumes" indeterminate />
          <v-alert
            v-else-if="loggedIn && resumesError"
            type="error"
            variant="tonal"
            :text="resumesError"
          />
          <template v-else>
            <component
              :is="activeLayoutComponent"
              :resume="resumeToDisplay"
              :template="effectiveTemplate"
            />
          </template>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>
