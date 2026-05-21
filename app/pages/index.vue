<script setup lang="ts">
import HomeRightRailLocalContext from '~/components/Home/RightRailLocalContext.vue'
import LeftDrawerRandomGames from '~/components/Home/LeftDrawerRandomGames.vue'

const { t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()
const activeHighlight = ref(0)

const highlightMessages = computed(() => t('home.index.progressHighlights', {}, { returnObjects: true }) as string[])

let highlightTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  highlightTimer = setInterval(() => {
    const total = highlightMessages.value.length || 1
    activeHighlight.value = (activeHighlight.value + 1) % total
  }, 2400)
})

onBeforeUnmount(() => {
  if (highlightTimer) clearInterval(highlightTimer)
})

const overviewCards = computed(() => {
  const sections = t('home.index.sections', {}, { returnObjects: true }) as Array<{
    title: string
    description: string
    links: [string, string][]
  }>

  return sections.map((section) => ({
    ...section,
    links: section.links.map(([label, to]) => ({ label, to })),
  }))
})

definePageMeta({
  title: 'appbar.home',
  description:
    'Bro World Space brings together social networking, CRM, jobs, learning, games, quizzes, sports, and online collaboration tools.',
  keywords:
    'Bro World Space, social network, CRM, jobs, learning, games, online collaboration, productivity platform',
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  sitemap: { changefreq: 'daily', priority: 1 },
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <template v-if="isPageSkeletonVisible">
          <SkeletonDrawerLeft />
        </template>
        <template v-else>
          <LeftDrawerRandomGames />
        </template>
      </template>
      <template #right>
        <template v-if="isPageSkeletonVisible">
          <SkeletonDrawerRight />
        </template>
        <template v-else>
          <HomeRightRailLocalContext />
        </template>
      </template>
    </AppPageDrawers>

    <v-container fluid class="home-content-shell">
      <SkeletonPageContent v-if="isPageSkeletonVisible" />

      <template v-else>
        <v-card class="hero-card" rounded="xl" elevation="2">
          <v-card-text class="pa-6 pa-md-8">
            <p class="hero-badge mb-3">{{ t('home.index.badge') }}</p>
            <h1 class="text-h4 text-md-h3 font-weight-bold mb-3">{{ t('home.index.heroTitle') }}</h1>
            <p class="text-body-1 text-medium-emphasis mb-6">{{ t('home.index.heroSubtitle') }}</p>
            <div class="hero-actions">
              <v-btn color="primary" size="large" to="/world">{{ t('home.index.ctaPrimary') }}</v-btn>
              <v-btn variant="outlined" size="large" to="/about">{{ t('home.index.ctaSecondary') }}</v-btn>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="progress-showcase mt-4" rounded="xl" variant="outlined">
          <v-card-text class="d-flex flex-wrap align-center ga-3">
            <v-icon icon="mdi-sparkles" color="primary" />
            <Transition name="fade-slide" mode="out-in">
              <p :key="activeHighlight" class="mb-0 text-body-1 font-weight-medium">
                {{ highlightMessages[activeHighlight] }}
              </p>
            </Transition>
          </v-card-text>
        </v-card>

        <v-row class="mt-4" dense>
          <v-col
            v-for="(card, cardIndex) in overviewCards"
            :key="`${card.title}-${cardIndex}`"
            cols="12"
            md="6"
          >
            <v-card class="fill-height" rounded="xl" elevation="1">
              <v-card-title class="text-h6 font-weight-bold">{{ card.title }}</v-card-title>
              <v-card-text>
                <p class="text-body-2 text-medium-emphasis mb-4">{{ card.description }}</p>
                <v-list density="compact" class="card-links-list">
                  <v-list-item
                    v-for="link in card.links"
                    :key="`${card.title}-${link.to}`"
                    :to="link.to"
                    link
                    rounded="lg"
                  >
                    <template #prepend>
                      <v-icon size="18" icon="mdi-arrow-top-right" />
                    </template>
                    <v-list-item-title class="text-body-2">{{ link.label }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-card class="mt-4" rounded="xl" variant="tonal" color="primary">
          <v-card-text>
            <h2 class="text-h6 mb-3">{{ t('home.index.publicPagesTitle') }}</h2>
            <p class="mb-4">{{ t('home.index.publicPagesDescription') }}</p>
            <div class="quick-links">
              <v-btn variant="flat" color="primary" to="/about">{{ t('home.index.aboutLink') }}</v-btn>
              <v-btn variant="flat" color="primary" to="/service">{{ t('home.index.serviceLink') }}</v-btn>
              <v-btn variant="flat" color="primary" to="/faq">{{ t('home.index.faqLink') }}</v-btn>
              <v-btn variant="outlined" to="/blog">{{ t('home.index.blogLink') }}</v-btn>
              <v-btn variant="outlined" to="/applications/sports">{{ t('home.index.sportsLink') }}</v-btn>
              <v-btn variant="outlined" to="/games">{{ t('home.index.gamesLink') }}</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </template>
    </v-container>
  </div>
</template>

<style scoped>
.home-content-shell {
  max-width: 920px;
  margin: 0 auto;
  padding-bottom: 24px;
}

.hero-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-surface), 1));
}

.hero-badge {
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.progress-showcase {
  border-style: dashed;
}

.quick-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 240ms ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.card-links-list :deep(.v-list-item) {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  margin-bottom: 8px;
}

@media (max-width: 959px) {
  .home-content-shell {
    padding-inline: 8px;
  }
}
</style>
