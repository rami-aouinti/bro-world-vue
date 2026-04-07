<script setup lang="ts">
const { isPageSkeletonVisible } = usePageSkeleton()

definePageMeta({
  title: 'Applications',
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
      <template v-else>
        <h1 class="text-h4 mb-2">Applications</h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Gérez vos applications connectées et vos accès.
        </p>
      </template>
    </v-container>
  </div>
</template>
