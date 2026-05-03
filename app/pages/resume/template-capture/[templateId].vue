<script setup lang="ts">
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-90.json'
import ResumeLayoutAside from '~/components/resume/layouts/ResumeLayoutAside.vue'
import ResumeLayoutAsideLeft from '~/components/resume/layouts/ResumeLayoutAsideLeft.vue'
import ResumeLayoutAsideRight from '~/components/resume/layouts/ResumeLayoutAsideRight.vue'
import ResumeLayoutNoAside from '~/components/resume/layouts/ResumeLayoutNoAside.vue'
import ResumeLayoutAsideFullLeft from '~/components/resume/layouts/ResumeLayoutAsideFullLeft.vue'
import ResumeLayoutAsideFullRight from '~/components/resume/layouts/ResumeLayoutAsideFullRight.vue'
import ResumeLayoutBarLeft from '~/components/resume/layouts/ResumeLayoutBarLeft.vue'
import ResumeLayoutBarRight from '~/components/resume/layouts/ResumeLayoutBarRight.vue'
import type { ResumeApiItem } from '~/services/resumeApi'

definePageMeta({ layout: false })

const route = useRoute()
const templateId = computed(() => String(route.params.templateId || 'tpl-001'))
const selectedTemplate = computed(() => GENERATED_RESUME_TEMPLATES.find((tpl) => tpl.id === templateId.value) || GENERATED_RESUME_TEMPLATES[0])

const fakeResume: ResumeApiItem = {
  id: 'capture-resume', documentUrl: null,
  resumeInformation: { fullName: 'Alex Martin', email: 'alex.martin@example.com', phone: '+33 6 00 00 00 00', adresse: 'Paris, France', title: 'Full Stack Developer' },
  experiences: [{ title: 'Full Stack Developer', company: 'Bro Labs', description: 'API development, Vue.js implementation, and application architecture.', startDate: '2021-01-01', endDate: null }],
  educations: [{ title: 'Master in Computer Science', school: 'University of Lyon', startDate: '2018-09-01', endDate: '2020-06-30', location: 'Lyon' }],
  skills: [{ title: 'Vue.js' }, { title: 'TypeScript' }, { title: 'Node.js' }],
  languages: [{ title: 'French', countryCode: 'FR' }, { title: 'English', countryCode: 'GB' }],
}

const activeLayoutComponent = computed(() => {
  const layout = selectedTemplate.value?.layout || 'no-aside'
  if (layout === 'aside') return ResumeLayoutAside
  if (layout === 'aside-left') return ResumeLayoutAsideLeft
  if (layout === 'aside-right') return ResumeLayoutAsideRight
  if (layout === 'aside-full-left') return ResumeLayoutAsideFullLeft
  if (layout === 'aside-full-right') return ResumeLayoutAsideFullRight
  if (layout === 'bar-left') return ResumeLayoutBarLeft
  if (layout === 'bar-right') return ResumeLayoutBarRight
  return ResumeLayoutNoAside
})
</script>

<template>
  <main class="capture-page">
    <component :is="activeLayoutComponent" :resume="fakeResume" :theme="selectedTemplate.theme" :layout="selectedTemplate.layout" :section-variants="selectedTemplate.sections" :photo-options="selectedTemplate.photo" :decor="selectedTemplate.decor" :aside-options="selectedTemplate.aside" :text-style="selectedTemplate.theme?.textStyle" />
  </main>
</template>

<style scoped>
.capture-page { width: 794px; min-height: 1123px; margin: 0; background: #fff; }
</style>
