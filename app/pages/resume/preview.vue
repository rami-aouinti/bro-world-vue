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

const selectedTemplateId = computed(() => String(route.query.template || ''))

const relatedResumes = computed(() => {
  if (!selectedTemplateId.value) return []
  return myResumes.value.filter((resume) => {
    const candidateTemplateIds = [
      (resume as any)?.templateId,
      (resume as any)?.template?.templateId,
      (resume as any)?.customization?.template?.templateId,
      (resume as any)?.customization?.templateId,
    ].filter((value): value is string => typeof value === 'string')

    return candidateTemplateIds.includes(selectedTemplateId.value)
  })
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
        <template v-else>
          <p class="text-medium-emphasis mb-2">
            {{ relatedResumes.length }} CV lié(s) à cette template
          </p>
          <pre class="text-body-2">{{
            JSON.stringify(relatedResumes, null, 2)
          }}</pre>
        </template>
      </v-card-text>
    </v-card>
  </v-container>
</template>
