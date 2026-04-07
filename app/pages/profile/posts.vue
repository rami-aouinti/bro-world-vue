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
        <v-skeleton-loader v-if="isPageSkeletonVisible" type="list-item-avatar, list-item-avatar, list-item-avatar" class="pa-2" />
        <ProfileDrawer v-else />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <BlogPostFeed v-else mode="mine" :show-composer="false" :show-stories="false" />
    </v-container>
  </div>
</template>
