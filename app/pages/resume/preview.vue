<script setup lang="ts">
definePageMeta({
  title: 'resumeBuilder.meta.previewTitle',
  layout: 'resume',
})

const route = useRoute()
const { allTemplates } = useResumeTemplates()

const selectedTemplate = computed(() => {
  const templateId = String(route.query.template || '')
  if (!templateId) return null

  return (
    allTemplates.value.find((template) => template.templateId === templateId) ||
    null
  )
})
</script>

<template>
  <v-container class="py-6" max-width="900">
    <v-card v-if="selectedTemplate" variant="outlined" class="mx-auto">
      <v-img
        :src="selectedTemplate.image"
        :alt="selectedTemplate.title"
        cover
      />
    </v-card>

    <v-alert
      v-else
      type="info"
      variant="tonal"
      text="Aucun template sélectionné."
    />
  </v-container>
</template>
