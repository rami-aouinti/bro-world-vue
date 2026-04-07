<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  title: 'pages.calendar.title',
})
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>{{ t('pages.calendar.title') }}</v-card-title>
      <v-card-text>{{ t('pages.calendar.subtitle') }}</v-card-text>
    </v-card>
  </v-container>
</template>
