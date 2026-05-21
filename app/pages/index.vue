<script setup lang="ts">
import HomeRightRailLocalContext from '~/components/Home/RightRailLocalContext.vue'
import LeftDrawerRandomGames from '~/components/Home/LeftDrawerRandomGames.vue'

const { isPageSkeletonVisible } = usePageSkeleton()

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
    </v-container>
  </div>
</template>

<style scoped>
.home-content-shell {
  max-width: 920px;
  margin: 0 auto;
  padding-bottom: 24px;
}

@media (max-width: 959px) {
  .home-content-shell {
    padding-inline: 8px;
  }
}
</style>
