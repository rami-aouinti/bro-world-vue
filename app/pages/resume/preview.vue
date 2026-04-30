<script setup lang="ts">
import { listMyResumes, type ResumeApiItem } from '~/services/resumeApi'

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

    <v-card
      v-if="loggedIn"
      class="mx-auto mt-6"
      variant="outlined"
      title="Mes données CV"
    >
      <v-card-text>
        <v-progress-linear v-if="loadingResumes" indeterminate />
        <v-alert
          v-else-if="resumesError"
          type="error"
          variant="tonal"
          :text="resumesError"
        />
        <pre v-else class="text-body-2">{{
          JSON.stringify(myResumes, null, 2)
        }}</pre>
      </v-card-text>
    </v-card>
  </v-container>
</template>
