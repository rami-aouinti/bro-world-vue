<script setup lang="ts">
const { isPageSkeletonVisible } = usePageSkeleton()

definePageMeta({
  title: 'profile.posts.title',
  middleware: 'auth',
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible" />
        <ProfileDrawer v-else />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <BlogPostFeed v-else mode="mine" :show-composer="false" :show-stories="false" />
    </v-container>
  </div>
</template>
