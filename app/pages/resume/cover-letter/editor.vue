<script setup lang="ts">
import { COVER_LETTER_TEMPLATE_IDS, COVER_PAGE_TEMPLATE_IDS } from '~/constants/resumeTemplates'

definePageMeta({
  title: 'Resume · Cover Letter Editor',
  layout: 'resume',
})

const route = useRoute()

const { coverLetterTemplates } = useResumeTemplates()

const templates = computed(() => coverLetterTemplates.value)

const fallbackTemplateId = COVER_LETTER_TEMPLATE_IDS[0] ?? ''
const fallbackCoverPageTemplateId = COVER_PAGE_TEMPLATE_IDS[0] ?? ''
const selectedTemplate = ref(fallbackTemplateId)
const letterContent = ref('')

const selectedCoverPageBase = computed(() => ({
  templateId: typeof route.query.coverPageTemplate === 'string'
    && COVER_PAGE_TEMPLATE_IDS.includes(route.query.coverPageTemplate)
    ? route.query.coverPageTemplate
    : fallbackCoverPageTemplateId,
  profileTitle: typeof route.query.coverPageTitle === 'string'
    ? route.query.coverPageTitle
    : 'John Doe · Full Stack Developer',
  summary: typeof route.query.coverPageSummary === 'string'
    ? route.query.coverPageSummary
    : 'Professional application pack cover page.',
}))

onMounted(() => {
  if (typeof route.query.template === 'string' && COVER_LETTER_TEMPLATE_IDS.includes(route.query.template)) {
    selectedTemplate.value = route.query.template
    return
  }

  selectedTemplate.value = fallbackTemplateId
})
</script>

<template>
  <v-container fluid class="pa-4 pa-md-8">
    <h1 class="text-h4 mb-4">Resume · Cover Letter</h1>
    <p class="text-medium-emphasis mb-6">
      Étape 2/2 de la candidature: rédigez la Cover Letter à partir de la Cover Page.
    </p>

    <v-card class="mb-6" variant="outlined">
      <v-card-title>Base: Cover Page sélectionnée</v-card-title>
      <v-card-text class="d-grid ga-2">
        <div><strong>Template:</strong> {{ selectedCoverPageBase.templateId }}</div>
        <div><strong>Profil:</strong> {{ selectedCoverPageBase.profileTitle }}</div>
        <div><strong>Résumé:</strong> {{ selectedCoverPageBase.summary }}</div>
      </v-card-text>
    </v-card>

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
