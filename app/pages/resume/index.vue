<script setup lang="ts">
definePageMeta({
  title: 'Resume Builder',
})

const { t } = useI18n()
const router = useRouter()

const { allTemplates } = useResumeTemplates()

const activeTemplateTab = ref<'resume' | 'cover-page' | 'cover-letter'>('resume')

const documentTabs = computed(() => [
  { label: `Resume · ${t('resumeBuilder.index.tabs.resume')}`, value: 'resume' as const },
  { label: `Cover Page · ${t('resumeBuilder.index.tabs.cover')}`, value: 'cover-page' as const },
  { label: `Cover Letter · ${t('resumeBuilder.index.tabs.letter')}`, value: 'cover-letter' as const },
])

const displayedTemplates = computed(() =>
  allTemplates.value.filter((template) => template.type === activeTemplateTab.value),
)

const openTemplateInWriteMode = (template: { type: "resume" | "cover-page" | "cover-letter"; templateId: string }) => {
  const pathByType = {
    resume: '/resume/create',
    'cover-page': '/resume/cover-page/editor',
    'cover-letter': '/resume/cover-letter/editor',
  } as const

  router.push({
    path: pathByType[template.type],
    query: {
      template: template.templateId,
      mode: 'write',
    },
  })
}

const journeySteps = computed(() => [
  {
    title: t('resumeBuilder.index.journey.steps.template.title'),
    description: t('resumeBuilder.index.journey.steps.template.description'),
    image: '/img/cv/cv-1.png',
    cta: t('resumeBuilder.index.journey.steps.template.cta'),
  },
  {
    title: t('resumeBuilder.index.journey.steps.fill.title'),
    description: t('resumeBuilder.index.journey.steps.fill.description'),
    image: '/img/cv/cv-2.png',
  },
  {
    title: t('resumeBuilder.index.journey.steps.export.title'),
    description: t('resumeBuilder.index.journey.steps.export.description'),
    image: '/img/cv/cv-3.png',
  },
])

const benefits = computed(() => [
  {
    title: t('resumeBuilder.index.benefits.items.attachments.title'),
    description: t('resumeBuilder.index.benefits.items.attachments.description'),
    icon: 'mdi-paperclip',
  },
  {
    title: t('resumeBuilder.index.benefits.items.allInOne.title'),
    description: t('resumeBuilder.index.benefits.items.allInOne.description'),
    icon: 'mdi-file-document-outline',
  },
  {
    title: t('resumeBuilder.index.benefits.items.flexibility.title'),
    description: t('resumeBuilder.index.benefits.items.flexibility.description'),
    icon: 'mdi-view-grid-plus-outline',
    link: t('resumeBuilder.index.benefits.items.flexibility.link'),
  },
])

const showRightDrawerDesktop = useState('show-right-drawer-desktop', () => true)
const showRightDrawerMobile = useState('show-right-drawer-mobile', () => false)
const previousDesktopRightDrawer = showRightDrawerDesktop.value
const previousMobileRightDrawer = showRightDrawerMobile.value

showRightDrawerDesktop.value = false
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
        <v-btn
          color="primary"
          size="large"
          to="/resume/create"
          class="mt-3"
        >
          {{ step.cta }}
        </v-btn>
      </template>
    </AppPageDrawers>
    <v-container fluid class="resume-home pa-0">
      <section class="hero px-4 px-md-8 py-8 py-md-12">
        <div class="templates-showcase mt-8">
          <v-tabs v-model="activeTemplateTab" color="primary" grow class="templates-tabs">
            <v-tab v-for="tab in documentTabs" :key="tab.value" :value="tab.value">
              {{ tab.label }}
            </v-tab>
          </v-tabs>

          <div class="templates-slider mt-4">
            <v-card v-for="templateCard in displayedTemplates"
                    :key="templateCard.id"
                    @click="openTemplateInWriteMode(templateCard)" class="postcard-gradient-card template-slide">
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
.hero, .journey, .benefits { max-width: 1200px; margin: 0 auto; text-align: center; }
.hero-title { font-size: clamp(2rem, 4vw, 3.7rem); line-height: 1.1; margin-bottom: 10px; }
.hero-subtitle { max-width: 880px; margin: 0 auto; font-size: 1.1rem; color: rgba(var(--v-theme-on-surface), .75); }
.trust-strip { display: inline-flex; gap: 16px; align-items: center; padding: 10px 20px; border-radius: 12px;}
.hero-tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; border-bottom: 1px solid; padding-bottom: 10px; }
.hero-tabs span { font-size: 1.1rem; }
.hero-tabs .active { color: rgb(var(--v-theme-primary)); border-bottom: 3px solid rgb(var(--v-theme-primary)); padding-bottom: 8px; }
.templates-showcase { max-width: 1100px; margin: 0 auto; }
.templates-tabs { border-bottom: 1px solid rgba(var(--v-theme-on-surface), .2); }
.templates-slider { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; scroll-snap-type: x mandatory; }
.template-slide {
  min-width: 260px;
  max-width: 260px;
  border: 1px solid rgba(var(--v-theme-on-surface), .2);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(var(--v-theme-surface), 1);
  color: inherit;
  cursor: pointer;
  text-align: left;
  scroll-snap-align: start;
  transition: transform .18s ease, box-shadow .18s ease;
}
.template-slide:hover { transform: translateY(-3px); box-shadow: 0 16px 34px rgba(0, 0, 0, .18); }
.template-slide img { width: 100%; height: 180px; object-fit: cover; display: block; }
.template-slide span { display: block; padding: 10px 12px; font-weight: 600; }
.journey h2, .benefits h2 { font-size: clamp(1.8rem, 3vw, 3rem); margin-bottom: 12px; }
.journey p, .benefits p { max-width: 780px; margin: 0 auto; color: rgba(var(--v-theme-on-surface), .8); }
.journey-grid, .benefits-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
.journey-card, .benefit-card { border: 1px solid rgba(var(--v-theme-on-surface), .13); border-radius: 16px; padding: 20px; }
.journey-image { width: 100%; max-width: 220px; margin: 0 auto 16px; border-radius: 8px; box-shadow: 0 12px 24px rgba(0, 0, 0, .1); }
.journey-card h3, .benefit-card h3 { margin-bottom: 10px; }
.benefit-card { text-align: left; }
.benefit-card p { margin: 0; max-width: none; }
.benefit-card a { display: inline-block; margin-top: 10px; color: rgb(var(--v-theme-primary)); }

@media (max-width: 960px) {
  .hero-tabs { grid-template-columns: 1fr; }
}
</style>
