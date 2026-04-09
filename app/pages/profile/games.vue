<script setup lang="ts">
const { t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()

definePageMeta({
  layout: 'profile',
  title: 'Games',
  middleware: 'auth',
})
</script>

<template>
  <div>
    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <template v-else>
        <h1 class="text-h4 mb-2">
          {{ t('pages.profileOverview.gamesTitle') }}
        </h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          {{ t('pages.profileOverview.gamesSubtitle') }}
        </p>
      </template>
    </v-container>
  </div>
</template>
