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
          <AppLeftDrawerUserEntry />
          <v-divider class="my-2" />
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
    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <template v-else>
        <template v-if="loggedIn">
          <ClientOnly>
            <BlogNewPostCardLazy v-if="deferredInteractiveReady" />
            <BlogStoriesCarouselLazy v-if="deferredInteractiveReady" />
          </ClientOnly>
        </template>
        <BlogPostFeed />
        <div class="mt-4 d-lg-none">
          <HomeRightRailLocalContext />
        </div>
      </template>
    </v-container>
  </div>
</template>
