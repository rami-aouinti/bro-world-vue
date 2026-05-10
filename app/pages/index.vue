<script setup lang="ts">
import HomeRightRailLocalContext from '~/components/Home/RightRailLocalContext.vue'
import LeftDrawerRandomGames from '~/components/Home/LeftDrawerRandomGames.vue'

const { loggedIn } = useUserSession()
const { isPageSkeletonVisible } = usePageSkeleton()
const deferredInteractiveReady = ref(false)

definePageMeta({
  title: 'appbar.home',
  description:
    'Bro World Space brings together social networking, CRM, jobs, learning, games, quizzes, sports, and online collaboration tools.',
  keywords:
    'Bro World Space, social network, CRM, jobs, learning, games, online collaboration, productivity platform',
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  sitemap: { changefreq: 'daily', priority: 1 },
})

onMounted(() => {
  requestAnimationFrame(() => {
    deferredInteractiveReady.value = true
  })
})
</script>

<template>
  <div class="home-page-surface">
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
    <v-container fluid class="home-feed-shell">
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <template v-else>
        <BlogPostFeed
          :show-composer="loggedIn && deferredInteractiveReady"
          :show-stories="loggedIn && deferredInteractiveReady"
          :content-preview-lines="2"
          show-read-more
        />
      </template>
    </v-container>
  </div>
</template>

<style scoped>
.home-page-surface {
  min-height: calc(100vh - 60px);
  background:
    radial-gradient(circle at 18% 10%, rgba(var(--v-theme-primary), 0.12), transparent 28%),
    #111;
  color: rgb(var(--v-theme-on-background));
}

.home-feed-shell {
  background: transparent;
  max-width: 920px;
  margin: 0 auto;
  padding-bottom: 24px;
}

@media (max-width: 959px) {
  .home-feed-shell {
    padding-inline: 8px;
  }
}
</style>
