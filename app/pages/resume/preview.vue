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

const CONTROLLED_LAYOUTS = ['aside-left', 'aside-right', 'no-aside'] as const

const layoutFilterOptions = computed(() => {
  const layouts = Array.from(
    new Set(GENERATED_RESUME_TEMPLATES.map((template) => template.layout)),
  ).filter((layout) => CONTROLLED_LAYOUTS.includes(layout as (typeof CONTROLLED_LAYOUTS)[number]))

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
  experiences: [{ title: 'Full Stack Developer', company: 'Bro Labs', description: 'Développement APIs, Vue.js et architecture applicative.', startDate: '2021-01-01', endDate: null }],
  educations: [{ title: 'Master Informatique', school: 'Université de Lyon', startDate: '2018-09-01', endDate: '2020-06-30', location: 'Lyon' }],
  skills: [{ title: 'Vue.js' }, { title: 'TypeScript' }, { title: 'Node.js' }],
  languages: [{ title: 'Français' }, { title: 'Anglais' }],
}

const selectedTemplate = computed(() => {
  const templateId = String(route.query.template || '')
  if (!templateId) return null
  return allTemplates.value.find((template) => template.templateId === templateId) || null
})

const selectedGeneratedTemplate = computed<GeneratedTemplate | null>(() => {
  if (!selectedTemplate.value?.templateId) return null
  return GENERATED_RESUME_TEMPLATES.find((template) => template.id === selectedTemplate.value?.templateId) || null
})

const selectedLayout = ref<(typeof CONTROLLED_LAYOUTS)[number]>('no-aside')
const selectedPalette = ref<string>('template')
const customPalettePrimary = ref<string>('#0F4C81')
const selectedSectionVariants = ref<SectionVariants>({})

const sectionVariantOptions = computed(() => {
  const map = new Map<string, string[]>()
  GENERATED_RESUME_TEMPLATES.forEach((template) => {
    Object.entries(template.sections || {}).forEach(([sectionKey, variant]) => {
      if (!map.has(sectionKey)) map.set(sectionKey, [])
      const entries = map.get(sectionKey)!
      if (!entries.includes(variant)) entries.push(variant)
    })
  })

  return Array.from(map.entries()).reduce<Record<string, { title: string, value: string }[]>>((acc, [sectionKey, variants]) => {
    acc[sectionKey] = variants.map((variant) => ({ title: variant, value: variant }))
    return acc
  }, {})
})

const paletteOptions = computed(() => [
  { title: 'Template palette', value: 'template' },
  { title: 'Preset · Indigo', value: '#4F46E5' },
  { title: 'Preset · Emerald', value: '#059669' },
  { title: 'Preset · Rose', value: '#E11D48' },
  { title: 'Custom', value: 'custom' },
])

const effectiveTemplate = computed<GeneratedTemplate | null>(() => {
  if (!selectedGeneratedTemplate.value) return null
  const base = selectedGeneratedTemplate.value
  const nextSections = { ...base.sections, ...selectedSectionVariants.value }
  const nextTheme = { ...base.theme, palette: { ...base.theme.palette } }

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
  }
})

watch(
  selectedGeneratedTemplate,
  (template) => {
    if (!template) return

    const queryLayout = typeof route.query.layout === 'string' ? route.query.layout : ''
    selectedLayout.value = CONTROLLED_LAYOUTS.includes(queryLayout as (typeof CONTROLLED_LAYOUTS)[number])
      ? (queryLayout as (typeof CONTROLLED_LAYOUTS)[number])
      : ((template.layout as (typeof CONTROLLED_LAYOUTS)[number]) || 'no-aside')

    selectedPalette.value = typeof route.query.palette === 'string' ? route.query.palette : 'template'
    customPalettePrimary.value = typeof route.query.paletteCustom === 'string' ? route.query.paletteCustom : template.theme.palette.primary

    const nextSections: SectionVariants = {}
    Object.entries(template.sections || {}).forEach(([sectionKey, defaultVariant]) => {
      const rawQueryValue = route.query[sectionKey]
      nextSections[sectionKey] = typeof rawQueryValue === 'string' ? rawQueryValue : defaultVariant
    })
    selectedSectionVariants.value = nextSections
  },
  { immediate: true },
)

watch(
  [selectedLayout, selectedPalette, customPalettePrimary, selectedSectionVariants],
  () => {
    if (!selectedGeneratedTemplate.value) return

    const query = {
      ...route.query,
      layout: selectedLayout.value,
      palette: selectedPalette.value,
      paletteCustom: customPalettePrimary.value,
    } as Record<string, string>

    Object.entries(selectedSectionVariants.value).forEach(([sectionKey, variant]) => {
      query[sectionKey] = variant
    })

    router.replace({ query })
  },
  { deep: true },
)

onMounted(async () => {
  if (!loggedIn.value) return
  loadingResumes.value = true
  resumesError.value = ''
  try { myResumes.value = await listMyResumes() } catch { resumesError.value = "Impossible de charger vos données de CV." } finally { loadingResumes.value = false }
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
  <v-container class="py-6" max-width="900">
    <v-card class="mx-auto" variant="outlined">
      <v-card-text>
        <div class="d-grid ga-3 mb-4">
          <AppSelect v-model="selectedLayout" :items="layoutFilterOptions" label="Layout" hide-details />
          <AppSelect v-model="selectedPalette" :items="paletteOptions" label="Palette" hide-details />
          <v-text-field
            v-if="selectedPalette === 'custom'"
            v-model="customPalettePrimary"
            label="Custom primary color"
            placeholder="#0F4C81"
            hide-details
          />
          <AppSelect
            v-for="(variantOptions, sectionKey) in sectionVariantOptions"
            :key="sectionKey"
            v-model="selectedSectionVariants[sectionKey]"
            :items="variantOptions"
            :label="`Section: ${sectionKey}`"
            hide-details
          />
        </div>

        <v-progress-linear v-if="loggedIn && loadingResumes" indeterminate />
        <v-alert
          v-else-if="loggedIn && resumesError"
          type="error"
          variant="tonal"
          :text="resumesError"
        />
        <template v-else>
          <component :is="activeLayoutComponent" :resume="resumeToDisplay" :template="effectiveTemplate" />
        </template>
      </v-card-text>
    </v-card>
  </v-container>
</template>
