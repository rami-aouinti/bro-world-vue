<script setup lang="ts">
definePageMeta({
  title: 'appbar.sports',
})

const { t } = useI18n()
</script>

<template>
  <v-container fluid>
    <v-card class="pa-6">
      <h2 class="text-h5 mb-2">{{ t('appbar.sports') }}</h2>
      <p class="text-medium-emphasis">{{ t('pages.applications.sportsDescription') }}</p>
    </v-card>
  </v-container>
</template>
