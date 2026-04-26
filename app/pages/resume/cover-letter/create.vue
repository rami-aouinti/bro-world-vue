<script setup lang="ts">
definePageMeta({
  title: 'Create Cover Letter',
  layout: 'resume',
})

const route = useRoute()

const { coverLetterTemplates } = useResumeTemplates()

const templates = computed(() => coverLetterTemplates.value)

const selectedTemplate = ref('cover-letter-template-1')
const letterContent = ref('')

onMounted(() => {
  if (typeof route.query.template === 'string')
    selectedTemplate.value = route.query.template
})
</script>

<template>
  <v-container fluid class="pa-4 pa-md-8">
    <h1 class="text-h4 mb-4">Create Cover Letter</h1>
    <p class="text-medium-emphasis mb-6">
      Cover letter editor: choisissez un template puis rédigez votre lettre.
    </p>

    <div class="template-slider mb-6">
      <v-card
        v-for="template in templates"
        :key="template.id"
        class="template-card"
        :class="{ 'template-card--active': selectedTemplate === template.id }"
        variant="outlined"
        @click="selectedTemplate = template.id"
      >
        <v-img :src="template.image" height="130" cover />
        <v-card-text>{{ template.title }}</v-card-text>
      </v-card>
    </div>

    <v-card variant="outlined">
      <v-card-title>Writing mode</v-card-title>
      <v-card-text>
        <v-textarea
          v-model="letterContent"
          rows="16"
          label="Votre cover letter"
          variant="outlined"
          hide-details
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.template-slider { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; }
.template-card { min-width: 240px; cursor: pointer; }
.template-card--active { border-color: rgb(var(--v-theme-primary)); box-shadow: 0 0 0 1px rgb(var(--v-theme-primary)); }
</style>
