<script setup lang="ts">
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-20-resume.json'

definePageMeta({
  title: 'resumeBuilder.meta.indexTitle',
  layout: 'resume',
})

const { t } = useI18n()
const { loggedIn } = useUserSession()
const { allTemplates } = useResumeTemplates()

const activeTemplateTab = ref<'resume' | 'cover-page' | 'cover-letter'>('resume')
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

const documentTabs = computed(() => [
  { label: `Resume · ${t('resumeBuilder.index.tabs.resume')}`, value: 'resume' as const },
  { label: `Cover Page · ${t('resumeBuilder.index.tabs.cover')}`, value: 'cover-page' as const },
  { label: `Cover Letter · ${t('resumeBuilder.index.tabs.letter')}`, value: 'cover-letter' as const },
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

const sidebarRoutes = computed(() => {
  const routes = [
    { label: 'Create New CV', to: '/resume/cv/preview', icon: 'mdi-file-account-outline' },
    { label: 'Create New Cover Page', to: '/resume/cover-page/preview', icon: 'mdi-file-document-outline' },
    { label: 'Create New Cover Letter', to: '/resume/cover-letter/preview', icon: 'mdi-email-edit-outline' },
    { label: 'Create CV Template', to: '/resume/cv/template-create', icon: 'mdi-palette-outline' },
    { label: 'Create Cover Page Template', to: '/resume/cover-page/template-create', icon: 'mdi-palette-swatch-outline' },
    { label: 'Create Cover Letter Template', to: '/resume/cover-letter/template-create', icon: 'mdi-palette-swatch-variant' },
    { label: 'IA Features', to: '/resume/ia-features', icon: 'mdi-robot-outline' },
    { label: 'Help', to: '/resume/help', icon: 'mdi-lifebuoy' },
    { label: 'Documentation', to: '/resume/documentation', icon: 'mdi-book-open-page-variant-outline' },
  ]

  if (loggedIn.value) {
    routes.splice(1, 0, {
      label: 'Mes Files',
      to: '/resume/my-files',
      icon: 'mdi-folder-multiple-outline',
    })
  }

  return routes
})


const templatePreviewRoute = (templateType: 'resume' | 'cover-page' | 'cover-letter', templateId: string) => {
  if (templateType === 'resume') return `/resume/cv/preview?template=${templateId}`
  if (templateType === 'cover-page') return `/resume/cover-page/preview?template=${templateId}`
  return `/resume/cover-letter/preview?template=${templateId}`
}

const randomVariants = computed(() => {
  const pool = [...displayedTemplates.value]
  const selected: typeof pool = []

  while (pool.length && selected.length < 3) {
    const randomIndex = Math.floor(Math.random() * pool.length)
    const [picked] = pool.splice(randomIndex, 1)
    if (picked) selected.push(picked)
  }

  return selected
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <v-list density="comfortable" nav>
          <v-list-item
            v-for="item in sidebarRoutes"
            :key="item.to"
            :title="item.label"
            :to="item.to"
            :prepend-icon="item.icon"
          />
        </v-list>
      </template>

      <template #right>
        <v-chip color="primary" class="mb-3" variant="flat">Variants</v-chip>
        <v-row dense>
          <v-col v-for="variant in randomVariants" :key="variant.id" cols="12">
            <v-card
              class="preview-variant-card"
              :to="
                variant.type === 'resume'
                  ? `/resume/cv/preview?template=${variant.id}`
                  : variant.type === 'cover-page'
                    ? `/resume/cover-page/preview?template=${variant.id}`
                    : `/resume/cover-letter/preview?template=${variant.id}`
              "
            >
              <v-img :src="variant.image" :alt="variant.title" height="130" cover />
              <v-card-text class="py-2">{{ variant.title }}</v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <section class="hero px-4 px-md-8 fade-in-up">
        <div class="templates-showcase mt-8 fade-in-up delay-1">
          <v-tabs v-model="activeTemplateTab" color="primary" grow class="templates-tabs">
            <v-tab v-for="tab in documentTabs" :key="tab.value" :value="tab.value">{{ tab.label }}</v-tab>
          </v-tabs>

          <div class="templates-slider mt-4">
            <v-card
              v-for="templateCard in displayedTemplates"
              :key="templateCard.id"
              class="postcard-gradient-card template-slide"
              :to="templatePreviewRoute(templateCard.type, templateCard.id)"
            >
              <v-img :src="templateCard.image" :alt="templateCard.title" />
              <span>{{ templateCard.title }}</span>
            </v-card>
          </div>
        </div>
      </section>
    </v-container>
  </div>
</template>

<style scoped>
.hero {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
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
  text-align: left;
  scroll-snap-align: start;
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
.preview-variant-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
}
</style>
