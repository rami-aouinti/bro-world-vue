<script setup lang="ts">
const { loggedIn } = useUserSession()
const { isPageSkeletonVisible } = usePageSkeleton()
const deferredInteractiveReady = ref(false)

definePageMeta({
  title: 'appbar.blog',
  description:
    'Discover the latest Bro World community posts, stories, comments, and reactions in one dedicated blog feed.',
  keywords:
    'Bro World blog, community posts, stories, reactions, comments',
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  sitemap: { changefreq: 'daily', priority: 0.9 },
})

onMounted(() => {
  requestAnimationFrame(() => {
    deferredInteractiveReady.value = true
  })
})
</script>

<template>
  <v-container fluid class="blog-feed-shell">
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
</template>

<style scoped>
.blog-feed-shell {
  max-width: 920px;
  margin: 0 auto;
  padding-bottom: 24px;
}

@media (max-width: 959px) {
  .blog-feed-shell {
    padding-inline: 8px;
  }
}
</style>
