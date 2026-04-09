<script setup lang="ts">
const { isPageSkeletonVisible } = usePageSkeleton()

definePageMeta({
  layout: 'profile',
  title: 'profile.posts.title',
  middleware: 'auth',
})
</script>

<template>
  <div>
    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <BlogPostFeed
        v-else
        mode="mine"
        :show-composer="false"
        :show-stories="false"
      />
    </v-container>
  </div>
</template>
