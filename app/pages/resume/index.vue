<script setup lang="ts">
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-20-resume.json'

definePageMeta({
  title: 'resumeBuilder.meta.indexTitle',
  layout: 'resume',
})

const { t } = useI18n()

useSeoMeta({
  title: 'Free AI Resume Builder, CV Templates, Cover Letter & Cover Page | Bro World',
  description:
    'Create a free CV online with AI, resume templates, cover letter and cover page generator. Browse modern templates and build job-ready documents fast.',
  keywords:
    'free resume builder, AI CV generator, free CV templates, cover letter generator, cover page template, job application, Bro World',
  ogTitle: 'Free AI Resume Builder & Templates | Bro World',
  ogDescription:
    'Build your resume, cover letter, and cover page with free AI tools and modern templates.',
  ogImage: '/img/cv/generated/tpl-001.png',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Free AI Resume Builder & Templates | Bro World',
  twitterDescription:
    'Create your CV, cover letter, and cover page with AI and free templates.',
  twitterImage: '/img/cv/generated/tpl-001.png',
})

useHead({
  link: [
    { rel: 'preload', as: 'image', href: '/img/cv/generated/tpl-001.png' },
    { rel: 'preload', as: 'image', href: '/img/cv/generated/cletter-001.png' },
    { rel: 'preload', as: 'image', href: '/img/cv/generated/cpage-001.png' },
  ],
})
const { allTemplates } = useResumeTemplates()

const activeTemplateTab = ref<'resume' | 'cover-page' | 'cover-letter'>('resume')
const selectedLayoutFilter = ref('all')

const generatedResumeTemplates = computed(() =>
  GENERATED_RESUME_TEMPLATES.map((template) => ({
    id: template.id,
    title: `${template.name}`,
    image: template.id ? `/img/cv/generated/${template.id}.png` : '/img/cv/resume-modern.svg',
    type: 'resume' as const,
    templateId: template.id,
    layoutId: template.layout,
  })),
)

const documentTabs = computed(() => [
  { label: ` ${t('resumeBuilder.index.tabs.resume')}`, value: 'resume' as const },
  { label: `${t('resumeBuilder.index.tabs.cover')}`, value: 'cover-page' as const },
  { label: ` ${t('resumeBuilder.index.tabs.letter')}`, value: 'cover-letter' as const },
])

const activeTabTemplates = computed(() => {
  if (activeTemplateTab.value === 'resume') return generatedResumeTemplates.value

  return allTemplates.value.filter((template) => template.type === activeTemplateTab.value)
})

const layoutLabelMap: Record<string, string> = {
  'aside': 'Aside',
  'aside-left': 'Aside left',
  'aside-right': 'Aside right',
  'aside-bar-left': 'Bar left',
  'aside-bar-right': 'Bar right',
  'aside-full-left': 'Full left',
  'aside-full-right': 'Full right',
  'no-aside': 'No aside',
  'no-aside-split': 'Split',
  'layout-left': 'Left',
  'layout-right': 'Right',
}

const prettifyLayoutLabel = (layoutId: string) =>
  layoutLabelMap[layoutId] ??
  layoutId
    .replace(/^layout-/, '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const layoutFilterOptions = computed(() => {
  const layoutCounts = activeTabTemplates.value.reduce<Record<string, number>>((acc, template) => {
    if (!template.layoutId) return acc
    acc[template.layoutId] = (acc[template.layoutId] ?? 0) + 1
    return acc
  }, {})

  return [
    {
      label: 'All',
      value: 'all',
      count: activeTabTemplates.value.length,
    },
    ...Object.entries(layoutCounts)
      .sort(([layoutA], [layoutB]) => prettifyLayoutLabel(layoutA).localeCompare(prettifyLayoutLabel(layoutB)))
      .map(([layoutId, count]) => ({
        label: prettifyLayoutLabel(layoutId),
        value: layoutId,
        count,
      })),
  ]
})

const displayedTemplates = computed(() => {
  if (selectedLayoutFilter.value === 'all') return activeTabTemplates.value

  return activeTabTemplates.value.filter(
    (template) => template.layoutId === selectedLayoutFilter.value,
  )
})

watch(activeTemplateTab, () => {
  selectedLayoutFilter.value = 'all'
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
      <template #right>
        <v-row dense>
          <v-col v-for="variant in randomVariants" :key="variant.id" cols="12">
            <v-card
              class="preview-variant-card postcard-gradient-card"
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

          <div class="layout-filter-bar" aria-label="Template layout filters">
            <v-btn
              v-for="layoutOption in layoutFilterOptions"
              :key="layoutOption.value"
              class="layout-filter-button"
              :class="{ 'layout-filter-button--active': selectedLayoutFilter === layoutOption.value }"
              :variant="selectedLayoutFilter === layoutOption.value ? 'flat' : 'text'"
              :color="selectedLayoutFilter === layoutOption.value ? 'primary' : undefined"
              rounded="pill"
              @click="selectedLayoutFilter = layoutOption.value"
            >
              <span>{{ layoutOption.label }}</span>
              <span class="layout-filter-count">{{ layoutOption.count }}</span>
            </v-btn>
          </div>

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
.layout-filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0 6px;
  padding: 10px;
  overflow-x: auto;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 999px;
  background:
    linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), transparent 38%),
    rgba(var(--v-theme-surface), 0.76);
  box-shadow: 0 16px 42px rgba(var(--v-theme-on-surface), 0.08);
  backdrop-filter: blur(18px);
  scrollbar-width: thin;
}
.layout-filter-button {
  flex: 0 0 auto;
  min-height: 42px;
  padding-inline: 16px 10px !important;
  border: 1px solid transparent;
  font-weight: 700;
  letter-spacing: 0.01em;
  text-transform: none;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}
.layout-filter-button:hover {
  transform: translateY(-1px);
  border-color: rgba(var(--v-theme-primary), 0.24);
  background: rgba(var(--v-theme-primary), 0.08);
}
.layout-filter-button--active {
  box-shadow: 0 12px 28px rgba(var(--v-theme-primary), 0.28);
}
.layout-filter-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  margin-left: 10px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(var(--v-theme-on-primary), 0.18);
  font-size: 0.75rem;
  font-weight: 800;
  line-height: 1;
}
.layout-filter-button:not(.layout-filter-button--active) .layout-filter-count {
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
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
