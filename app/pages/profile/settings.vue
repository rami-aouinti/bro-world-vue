<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  title: 'appbar.settings',
  middleware: 'auth',
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <ProfileDrawer />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <h1 class="text-h4 mb-2">{{ t('appbar.settings') }}</h1>
      <p class="text-body-1 text-medium-emphasis mb-0">
        Personnalisez vos préférences et les paramètres de votre compte.
      </p>
    </v-container>
  </div>
</template>
