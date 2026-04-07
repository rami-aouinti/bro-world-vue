<script setup lang="ts">
const { isPageSkeletonVisible } = usePageSkeleton()

definePageMeta({
  title: 'Games',
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
      <template v-else>
        <h1 class="text-h4 mb-2">Games</h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Accédez à vos jeux et activités.
        </p>
      </template>
    </v-container>
  </div>
</template>
