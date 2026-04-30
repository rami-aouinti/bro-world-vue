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

const templateDetails = computed(() => {
  if (!selectedTemplate.value) return null
  return {
    id: selectedTemplate.value.id,
    templateId: selectedTemplate.value.templateId,
    title: selectedTemplate.value.title,
    type: selectedTemplate.value.type,
    image: selectedTemplate.value.image,
  }
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

    <v-card v-if="templateDetails" class="mx-auto mt-6" variant="outlined">
      <v-card-title>Données template sélectionnée</v-card-title>
      <v-card-text>
        <pre class="text-body-2">{{
          JSON.stringify(templateDetails, null, 2)
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
          <v-alert
            v-if="!relatedResumes.length"
            type="info"
            variant="tonal"
            text="Aucun CV lié à cette template pour le moment."
          />
          <template v-else>
            <v-card
              v-for="resume in relatedResumes"
              :key="resume.id"
              class="mb-3"
              variant="tonal"
            >
              <v-card-title class="text-subtitle-1">
                {{ resume.resumeInformation?.fullName || 'CV sans nom' }}
              </v-card-title>
              <v-card-text>
                <div><strong>ID:</strong> {{ resume.id }}</div>
                <div>
                  <strong>Email:</strong>
                  {{ resume.resumeInformation?.email || 'Non renseigné' }}
                </div>
                <div>
                  <strong>Téléphone:</strong>
                  {{ resume.resumeInformation?.phone || 'Non renseigné' }}
                </div>
                <pre class="text-body-2 mt-2">{{
                  JSON.stringify(resume, null, 2)
                }}</pre>
              </v-card-text>
            </v-card>
          </template>
        </template>
      </v-card-text>
    </v-card>
  </v-container>
</template>
