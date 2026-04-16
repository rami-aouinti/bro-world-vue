<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import HomeRightRailLocalContext from '~/components/Home/RightRailLocalContext.vue'
import LeftDrawerRandomGames from '~/components/Home/LeftDrawerRandomGames.vue'

const { loggedIn } = useUserSession()
const { isPageSkeletonVisible } = usePageSkeleton()
const deferredInteractiveReady = ref(false)

const BlogNewPostCardLazy = defineAsyncComponent(
  () => import('~/components/Blog/NewPostCard.vue'),
)
const BlogStoriesCarouselLazy = defineAsyncComponent(
  () => import('~/components/Blog/StoriesCarousel.vue'),
)

definePageMeta({
  title: 'appbar.home',
})

onMounted(() => {
  requestAnimationFrame(() => {
    deferredInteractiveReady.value = true
  })
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
    <v-container fluid class="home-feed-shell">
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <template v-else>
        <template v-if="loggedIn">
          <ClientOnly>
            <BlogNewPostCardLazy v-if="deferredInteractiveReady" />
            <BlogStoriesCarouselLazy v-if="deferredInteractiveReady" />
          </ClientOnly>
        </template>
        <BlogPostFeed />
      </template>
    </v-container>
  </div>
</template>

<style scoped>
.home-feed-shell {
  max-width: 920px;
  margin: 0 auto;
  padding-top: 8px;
  padding-bottom: 24px;
}

@media (max-width: 959px) {
  .home-feed-shell {
    padding-inline: 8px;
  }
}
</style>
