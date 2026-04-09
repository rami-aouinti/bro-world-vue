<script setup lang="ts">
definePageMeta({
  title: 'appbar.quiz',
})

const { t } = useI18n()
</script>

<template>
  <v-container fluid>
    <v-card class="pa-6">
      <h2 class="text-h5 mb-2">{{ t('appbar.quiz') }}</h2>
      <p class="text-medium-emphasis">
        {{ t('pages.applications.quizDescription') }}
      </p>
    </v-card>
  </v-container>
</template>
