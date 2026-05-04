<script setup lang="ts">
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-90.json'

definePageMeta({
  title: 'resumeBuilder.meta.indexTitle',
  layout: 'resume',
})

const { t } = useI18n()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl || 'https://bro-world.com'
const pageUrl = `${siteUrl}/resume`

useSeoMeta({
  title: 'Créateur de CV en ligne | Bro World',
  description:
    'Créez un CV professionnel en quelques minutes avec des modèles modernes, personnalisables et optimisés ATS.',
  ogTitle: 'Créateur de CV en ligne | Bro World',
  ogDescription:
    'Choisissez un modèle, personnalisez votre CV et exportez un document prêt à envoyer.',
  ogType: 'website',
  ogUrl: pageUrl,
  twitterCard: 'summary_large_image',
  twitterTitle: 'Créateur de CV en ligne | Bro World',
  twitterDescription:
    'Un builder de CV rapide, moderne et optimisé pour les recruteurs.',
  robots: 'index, follow',
})

useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
})

const {
  allTemplates,
  coverPageTemplates,
  coverLetterTemplates,
} = useResumeTemplates()

const activeTemplateTab = ref<'resume' | 'cover-page' | 'cover-letter'>(
  'resume',
)
const selectedLayoutFilter = ref<string | null>(null)


const generatedResumeTemplates = computed(() =>
  GENERATED_RESUME_TEMPLATES.map((template) => ({
    id: template.id,
    title: `Resume · ${template.name}`,
    image: template.id ? `/img/cv/generated/${template.id}.png` : '/img/cv/resume-modern.sv',
    type: 'resume' as const,
    templateId: template.id,
    layout: template.layout,
  })),
)

const layoutFilterOptions = computed(() => {
  const layouts = Array.from(
    new Set(generatedResumeTemplates.value.map((template) => template.layout)),
  )

  return layouts.map((layout) => ({
    title: layout,
    value: layout,
  }))
})

const documentTabs = computed(() => [
  {
    label: `Resume · ${t('resumeBuilder.index.tabs.resume')}`,
    value: 'resume' as const,
  },
  {
    label: `Cover Page · ${t('resumeBuilder.index.tabs.cover')}`,
    value: 'cover-page' as const,
  },
  {
    label: `Cover Letter · ${t('resumeBuilder.index.tabs.letter')}`,
    value: 'cover-letter' as const,
  },
])

const displayedTemplates = computed(() => {
  if (activeTemplateTab.value === 'resume') {
    return generatedResumeTemplates.value.filter((template) => {
      if (!selectedLayoutFilter.value) return true
      return template.layout === selectedLayoutFilter.value
    })
  }

  return allTemplates.value.filter((template) => template.type === activeTemplateTab.value)
})

const selectedTemplateId = ref<string>('')
const isTemplateModalOpen = ref(false)

watch(
  displayedTemplates,
  (items) => {
    if (!items.length) return
    if (
      !selectedTemplateId.value ||
      !items.some((item) => item.id === selectedTemplateId.value)
    ) {
      selectedTemplateId.value = items[0]?.id || ''
    }
  },
  { immediate: true },
)

const selectedTemplateCard = computed(
  () =>
    displayedTemplates.value.find(
      (item) => item.id === selectedTemplateId.value,
    ) ||
    displayedTemplates.value[0] ||
    null,
)

const openTemplateInWriteMode = (template: {
  id: string
  templateId?: string
  type: 'resume' | 'cover-page' | 'cover-letter'
}) => {
  const pathByType = {
    resume: '/resume/preview',
    'cover-page': '/resume/cover-page/editor',
    'cover-letter': '/resume/cover-letter/editor',
  } as const

  router.push({
    path: pathByType[template.type],
    query: {
      template: template.type === 'resume' ? template.templateId || template.id : template.id,
      mode: 'write',
    },
  })
}

const openTemplateModal = (template: {
  id: string
  title: string
  image: string
  type: 'resume' | 'cover-page' | 'cover-letter'
  templateId?: string
}) => {
  selectedTemplateId.value = template.id
  isTemplateModalOpen.value = true
}

const showRightDrawerDesktop = useState('show-right-drawer-desktop', () => true)
const showRightDrawerMobile = useState('show-right-drawer-mobile', () => false)
const previousDesktopRightDrawer = showRightDrawerDesktop.value
const previousMobileRightDrawer = showRightDrawerMobile.value

showRightDrawerDesktop.value = true
showRightDrawerMobile.value = false

onUnmounted(() => {
  showRightDrawerDesktop.value = previousDesktopRightDrawer
  showRightDrawerMobile.value = previousMobileRightDrawer
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <h3>{{ t('resumeBuilder.index.heroTitle') }}</h3>
        <p class="hero-subtitle">{{ t('resumeBuilder.index.heroSubtitle') }}</p>
        <v-btn color="primary" size="large" to="/resume/preview" class="mt-3">
          {{ t('resumeBuilder.index.journey.steps.template.cta') }}
        </v-btn>
      </template>
      <template #right>
        <h3>{{ t('resumeBuilder.index.heroTitle') }}</h3>
        <p class="hero-subtitle">{{ t('resumeBuilder.index.heroSubtitle') }}</p>
        <AppSelect
          v-model="selectedLayoutFilter"
          :items="layoutFilterOptions"
          label="Filter by layout"
          clearable
          hide-details
          class="mt-3"
        />
        <v-btn color="primary" size="large" to="/resume/preview" class="mt-3">
          {{ t('resumeBuilder.index.journey.steps.template.cta') }}
        </v-btn>
      </template>
    </AppPageDrawers>
    <v-container fluid>
      <section class="hero px-4 px-md-8 fade-in-up">
        <div class="templates-showcase mt-8 fade-in-up delay-1">
          <v-tabs
            v-model="activeTemplateTab"
            color="primary"
            grow
            class="templates-tabs"
          >
            <v-tab
              v-for="tab in documentTabs"
              :key="tab.value"
              :value="tab.value"
            >
              {{ tab.label }}
            </v-tab>
          </v-tabs>
          <p class="mt-3 text-medium-emphasis">
            {{ generatedResumeTemplates.length }} resume ·
            {{ coverPageTemplates.length }} cover page ·
            {{ coverLetterTemplates.length }} cover letter
          </p>

          <div class="templates-slider mt-4">
            <v-card
              v-for="templateCard in displayedTemplates"
              :key="templateCard.id"
              class="postcard-gradient-card template-slide"
              @click="selectedTemplateId = templateCard.id"
            >
              <v-img :src="templateCard.image" :alt="templateCard.title" />
              <span>{{ templateCard.title }}</span>
              <v-btn
                color="primary"
                variant="text"
                size="small"
                class="mt-2"
                :to="templateCard.type === 'resume' ? `/resume/preview?template=${templateCard.id}` : templateCard.type === 'cover-page' ? `/resume/cover-page/preview?template=${templateCard.id}` : `/resume/cover-letter/preview?template=${templateCard.id}`"
                @click.stop
              >
                Preview
              </v-btn>
              <v-btn
                color="primary"
                variant="text"
                size="small"
                class="mt-2 ml-2"
                @click.stop="openTemplateModal(templateCard)"
              >
                Show
              </v-btn>
            </v-card>
          </div>
        </div>
      </section>
    </v-container>

    <v-dialog
      v-model="isTemplateModalOpen"
      max-width="960"
    >
      <v-card
        v-if="selectedTemplateCard"
        class="template-preview-card"
        variant="outlined"
      >
        <v-card-title>{{ selectedTemplateCard.title }}</v-card-title>
        <v-card-text>
          <v-img
            :src="selectedTemplateCard.image"
            :alt="selectedTemplateCard.title"
            class="template-preview-image"
          />
          <v-btn
            color="primary"
            class="mt-4"
            @click="openTemplateInWriteMode(selectedTemplateCard)"
          >
            Utiliser cette template
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.hero {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.hero-subtitle {
  max-width: 880px;
  margin: 0 auto;
  font-size: 1.1rem;
  color: rgba(var(--v-theme-on-surface), 0.75);
}

.templates-showcase {
  max-width: 1100px;
  margin: 0 auto;
}

.templates-tabs {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.2);
}

.templates-slider {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
  scroll-snap-type: x mandatory;
}

.template-slide {
  min-width: 260px;
  max-width: 260px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(var(--v-theme-surface), 1);
  color: inherit;
  cursor: pointer;
  text-align: left;
  scroll-snap-align: start;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.template-slide:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 34px rgba(0, 0, 0, 0.18);
}

.template-slide img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.template-slide span {
  display: block;
  padding: 10px 12px;
  font-weight: 600;
}

.fade-in-up {
  animation: fadeInUp 0.7s ease both;
}

.delay-1 {
  animation-delay: 0.15s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.template-preview-card {
  max-width: 760px;
  margin-inline: auto;
}
.template-preview-image {
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.16);
}
</style>
