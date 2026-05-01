<script setup lang="ts">
import { listMyResumes, type ResumeApiItem } from '~/services/resumeApi'
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-90.json'
import ResumeLayoutAside from '~/components/resume/layouts/ResumeLayoutAside.vue'
import ResumeLayoutAsideLeft from '~/components/resume/layouts/ResumeLayoutAsideLeft.vue'
import ResumeLayoutAsideRight from '~/components/resume/layouts/ResumeLayoutAsideRight.vue'
import ResumeLayoutNoAside from '~/components/resume/layouts/ResumeLayoutNoAside.vue'

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
const fakeResume: ResumeApiItem = {
  id: 'fake-resume',
  documentUrl: null,
  resumeInformation: {
    fullName: 'Alex Martin',
    email: 'alex.martin@example.com',
    phone: '+33 6 00 00 00 00',
    adresse: 'Paris, France',
  },
  experiences: [
    {
      title: 'Full Stack Developer',
      company: 'Bro Labs',
      description: 'Développement APIs, Vue.js et architecture applicative.',
      startDate: '2021-01-01',
      endDate: null,
    },
  ],
  educations: [
    {
      title: 'Master Informatique',
      school: 'Université de Lyon',
      startDate: '2018-09-01',
      endDate: '2020-06-30',
      location: 'Lyon',
    },
  ],
  skills: [
    { title: 'Vue.js' },
    { title: 'TypeScript' },
    { title: 'Node.js' },
  ],
  languages: [{ title: 'Français' }, { title: 'Anglais' }],
}

const selectedTemplate = computed(() => {
  const templateId = String(route.query.template || '')
  if (!templateId) return null

  return (
    allTemplates.value.find((template) => template.templateId === templateId) ||
    null
  )
})

const selectedGeneratedTemplate = computed(() => {
  if (!selectedTemplate.value?.templateId) return null
  return (
    GENERATED_RESUME_TEMPLATES.find(
      (template) => template.id === selectedTemplate.value?.templateId,
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

const resumeToDisplay = computed<ResumeApiItem>(() => {
  if (loggedIn.value && myResumes.value.length > 0) return myResumes.value[0]
  return fakeResume
})

const activeLayoutComponent = computed(() => {
  const layout = selectedGeneratedTemplate.value?.layout || 'no-aside'
  if (layout === 'aside') return ResumeLayoutAside
  if (layout === 'aside-left') return ResumeLayoutAsideLeft
  if (layout === 'aside-right') return ResumeLayoutAsideRight
  return ResumeLayoutNoAside
})
</script>

<template>
  <v-container class="py-6" max-width="900">
    <v-card class="mx-auto mt-6" variant="outlined">
      <v-card-text>
        <v-progress-linear v-if="loggedIn && loadingResumes" indeterminate />
        <v-alert
          v-else-if="loggedIn && resumesError"
          type="error"
          variant="tonal"
          :text="resumesError"
        />
        <template v-else>
          <component :is="activeLayoutComponent" :resume="resumeToDisplay" />
        </template>
      </v-card-text>
    </v-card>
  </v-container>
</template>
