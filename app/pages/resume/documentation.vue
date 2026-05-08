<script setup lang="ts">
definePageMeta({ layout: 'resume', title: 'Documentation' })
const { t, tm } = useI18n()
const items = computed(() => tm('resumeResources.documentation.items') as string[])
</script>

<template>
  <v-container class="py-8" max-width="900">
    <h1>{{ t('resumeResources.documentation.title') }}</h1>
    <p class="text-medium-emphasis mb-6">{{ t('resumeResources.documentation.description') }}</p>
    <v-list lines="two">
      <v-list-item
        v-for="(item, index) in items"
        :key="index"
        :title="item"
        prepend-icon="mdi-file-document-outline"
      />
    </v-list>
  </v-container>
</template>
