<script setup lang="ts">
const { t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()

definePageMeta({
  title: 'appbar.profile',
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
        <h1 class="text-h4 mb-2">{{ t('appbar.profile') }}</h1>
        <p class="text-body-1 text-medium-emphasis mb-0">
          Utilisez le menu à gauche pour accéder à vos amis, jeux, paramètres et autres sections du profil.
        </p>
      </template>
    </v-container>
  </div>
</template>
