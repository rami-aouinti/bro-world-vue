<script setup lang="ts">
definePageMeta({
  title: 'Resume Builder',
})

const features = [
  {
    title: 'Éditeur guidé',
    description: 'Complète ton CV section par section avec une interface simple et rapide.',
    icon: 'mdi-file-document-edit-outline',
  },
  {
    title: 'Templates modernes',
    description: 'Choisis un style professionnel et adapte couleurs, typo et mise en page.',
    icon: 'mdi-palette-outline',
  },
  {
    title: 'Aperçu en direct',
    description: 'Visualise instantanément le rendu final pendant que tu modifies les données.',
    icon: 'mdi-monitor-eye',
  },
  {
    title: 'Export PDF / DOCX',
    description: 'Télécharge ton résumé au format idéal pour les recruteurs.',
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
      <h1 class="hero-title">Crée un résumé professionnel en quelques minutes</h1>
      <p class="hero-subtitle">
        Une page publique pour présenter l'outil, puis une expérience de création inspirée de vos maquettes.
      </p>
      <div class="hero-actions mt-6">
        <v-btn color="primary" size="large" to="/resume/create">Commencer maintenant</v-btn>
        <v-btn variant="outlined" size="large" to="/resume/create">Voir le builder</v-btn>
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
