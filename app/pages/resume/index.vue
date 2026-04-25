<script setup lang="ts">
definePageMeta({
  title: 'Resume Builder',
})

const { t } = useI18n()

const features = [
  {
    title: t('resumeBuilder.index.features.guidedEditor.title'),
    description: t('resumeBuilder.index.features.guidedEditor.description'),
    icon: 'mdi-file-document-edit-outline',
  },
  {
    title: t('resumeBuilder.index.features.modernTemplates.title'),
    description: t('resumeBuilder.index.features.modernTemplates.description'),
    icon: 'mdi-palette-outline',
  },
  {
    title: t('resumeBuilder.index.features.livePreview.title'),
    description: t('resumeBuilder.index.features.livePreview.description'),
    icon: 'mdi-monitor-eye',
  },
  {
    title: t('resumeBuilder.index.features.export.title'),
    description: t('resumeBuilder.index.features.export.description'),
    icon: 'mdi-download',
  },
]

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
  <v-container class="resume-home py-8 py-md-12">
    <section class="hero mb-8 mb-md-12">
      <h1 class="hero-title">{{ t('resumeBuilder.index.heroTitle') }}</h1>
      <p class="hero-subtitle">
        {{ t('resumeBuilder.index.heroSubtitle') }}
      </p>
      <div class="hero-actions mt-6">
        <v-btn color="primary" size="large" to="/resume/create">{{ t('resumeBuilder.index.primaryCta') }}</v-btn>
        <v-btn variant="outlined" size="large" to="/resume/create">{{ t('resumeBuilder.index.secondaryCta') }}</v-btn>
      </div>
    </section>

    <section class="features-grid">
      <article v-for="feature in features" :key="feature.title" class="feature-card">
        <v-icon :icon="feature.icon" size="26" color="primary" class="mb-3" />
        <h2>{{ feature.title }}</h2>
        <p>{{ feature.description }}</p>
      </article>
    </section>
  </v-container>
</template>

<style scoped>
.resume-home {
  max-width: 1100px;
}

.hero-kicker {
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary));
  font-weight: 700;
}

.hero-title {
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
  margin-top: 8px;
  margin-bottom: 16px;
}

.hero-subtitle {
  max-width: 760px;
  color: rgba(var(--v-theme-on-surface), 0.78);
  font-size: 1.1rem;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.feature-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 16px;
  padding: 20px;
  background: rgb(var(--v-theme-surface));
}

.feature-card h2 {
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.feature-card p {
  color: rgba(var(--v-theme-on-surface), 0.75);
  margin: 0;
}
</style>
