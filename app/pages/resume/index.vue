<script setup lang="ts">
definePageMeta({
  title: 'Resume Builder',
})

const { t } = useI18n()

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
  <v-container fluid class="resume-home pa-0">
    <section class="hero px-4 px-md-8 py-8 py-md-12">
      <h1 class="hero-title">{{ t('resumeBuilder.index.heroTitle') }}</h1>
      <p class="hero-subtitle">{{ t('resumeBuilder.index.heroSubtitle') }}</p>

      <div class="trust-strip mt-6">
        <strong>{{ t('resumeBuilder.index.rating.label') }}</strong>
        <span>{{ t('resumeBuilder.index.rating.score') }}</span>
      </div>

      <div class="hero-tabs mt-7">
        <span>{{ t('resumeBuilder.index.tabs.cover') }}</span>
        <span>{{ t('resumeBuilder.index.tabs.letter') }}</span>
        <span>{{ t('resumeBuilder.index.tabs.resume') }}</span>
        <span class="active">{{ t('resumeBuilder.index.tabs.applicationPack') }}</span>
      </div>

      <div class="hero-preview mt-8">
        <img src="/img/cv/cv-4.png" alt="Resume template left" class="preview-card left">
        <img src="/img/cv/cv-1.png" alt="Resume template center" class="preview-card center">
        <img src="/img/cv/cv-2.png" alt="Resume template right" class="preview-card right">
      </div>
    </section>

    <section class="journey px-4 px-md-8 py-10 py-md-14">
      <h2>{{ t('resumeBuilder.index.journey.title') }}</h2>
      <p>{{ t('resumeBuilder.index.journey.subtitle') }}</p>

      <div class="journey-grid mt-7">
        <article v-for="(step, index) in journeySteps" :key="step.title" class="journey-card">
          <img :src="step.image" :alt="step.title" class="journey-image">
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
          <v-btn
            v-if="index === 0"
            color="primary"
            size="large"
            to="/resume/create"
            class="mt-3"
          >
            {{ step.cta }}
          </v-btn>
        </article>
      </div>
    </section>

    <section class="benefits px-4 px-md-8 py-10 py-md-14">
      <h2>{{ t('resumeBuilder.index.benefits.title') }}</h2>
      <p>{{ t('resumeBuilder.index.benefits.subtitle') }}</p>

      <div class="benefits-grid mt-7">
        <article v-for="benefit in benefits" :key="benefit.title" class="benefit-card">
          <v-icon :icon="benefit.icon" size="34" color="primary" class="mb-4" />
          <h3>{{ benefit.title }}</h3>
          <p>{{ benefit.description }}</p>
          <a v-if="benefit.link" href="#">{{ benefit.link }}</a>
        </article>
      </div>
    </section>
  </v-container>
</template>

<style scoped>
.hero, .journey, .benefits { max-width: 1200px; margin: 0 auto; text-align: center; }
.hero-title { font-size: clamp(2rem, 4vw, 3.7rem); line-height: 1.1; margin-bottom: 10px; }
.hero-subtitle { max-width: 880px; margin: 0 auto; font-size: 1.1rem; color: rgba(var(--v-theme-on-surface), .75); }
.trust-strip { display: inline-flex; gap: 16px; align-items: center; padding: 10px 20px; border-radius: 12px;}
.hero-tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; border-bottom: 1px solid; padding-bottom: 10px; }
.hero-tabs span { font-size: 1.1rem; }
.hero-tabs .active { color: rgb(var(--v-theme-primary)); border-bottom: 3px solid rgb(var(--v-theme-primary)); padding-bottom: 8px; }
.hero-preview { position: relative; min-height: 320px; }
.preview-card { position: absolute; top: 0; width: min(40vw, 320px); border-radius: 8px; box-shadow: 0 18px 36px rgba(0, 0, 0, .14); }
.preview-card.left { left: 10%; opacity: .7; transform: scale(.88); }
.preview-card.center { left: 50%; transform: translateX(-50%); z-index: 2; }
.preview-card.right { right: 10%; opacity: .7; transform: scale(.88); }
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
  .hero-tabs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .hero-preview { min-height: 220px; }
  .preview-card { width: 45%; }
  .preview-card.left { left: 0; }
  .preview-card.right { right: 0; }
}
</style>
