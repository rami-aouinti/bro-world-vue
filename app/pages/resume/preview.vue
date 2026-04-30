<script setup lang="ts">
import { listMyResumes, type ResumeApiItem } from '~/services/resumeApi'
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-90.json'

definePageMeta({
  title: 'resumeBuilder.meta.previewTitle',
  layout: 'resume',
})

const route = useRoute()
const { allTemplates } = useResumeTemplates()
const { loggedIn } = useUserSession()
const loadingResumes = ref(false)
const resumesError = ref('')
const myResumes = ref<ResumeApiItem[]>([])

const selectedTemplate = computed(() => {
  const templateId = String(route.query.template || '')
  if (!templateId) return null

  return (
    allTemplates.value.find((template) => template.templateId === templateId) ||
    null
  )
})

const selectedGeneratedTemplate = computed(() => {
  if (!selectedTemplate.value?.id) return null
  return (
    GENERATED_RESUME_TEMPLATES.find(
      (template) => template.id === selectedTemplate.value?.id,
    ) || null
  )
})

onMounted(async () => {
  if (!loggedIn.value) return

  loadingResumes.value = true
  resumesError.value = ''
  try {
    myResumes.value = await listMyResumes()
  } catch {
    resumesError.value = "Impossible de charger vos données de CV."
  } finally {
    loadingResumes.value = false
  }
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

    <v-card v-if="selectedGeneratedTemplate" class="mx-auto mt-6" variant="outlined">
      <v-card-title>Données template sélectionnée</v-card-title>
      <v-card-text>
        <pre class="text-body-2">{{
          JSON.stringify(selectedGeneratedTemplate, null, 2)
        }}</pre>
      </v-card-text>
    </v-card>

    <v-card v-if="loggedIn" class="mx-auto mt-6" variant="outlined">
      <v-card-title>Données CV liées à la template</v-card-title>
      <v-card-text>
        <v-progress-linear v-if="loadingResumes" indeterminate />
        <v-alert
          v-else-if="resumesError"
          type="error"
          variant="tonal"
          :text="resumesError"
        />
        <template v-else>
          <pre class="text-body-2">{{ JSON.stringify(myResumes, null, 2) }}</pre>
        </template>
      </v-card-text>
    </v-card>
  </v-container>
</template>
