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
import ResumeTemplateDecor from '~/components/Resume/ResumeTemplateDecor.vue'
import type { ResumeApiItem } from '~/services/resumeApi'

definePageMeta({ layout: false })

const route = useRoute()
const templateId = computed(() => String(route.params.templateId || 'tpl-001'))
const selectedTemplate = computed(() => GENERATED_RESUME_TEMPLATES.find((tpl) => tpl.id === templateId.value) || GENERATED_RESUME_TEMPLATES[0])

const fakeResume: ResumeApiItem = {
  id: 'capture-resume', documentUrl: null,
  resumeInformation: {
    fullName: 'Alex Martin',
    title: 'Senior Full Stack Developer',
    profileText:
      'Product-minded engineer with 8+ years delivering scalable web platforms, mentoring teams, and shipping high-impact features end-to-end.',
    email: 'alex.martin@example.com',
    phone: '+33 6 00 00 00 00',
    adresse: 'Paris, France',
    address: 'Paris, France',
    homepage: 'https://alexmartin.dev',
    repo_profile: 'https://github.com/alexmartin-dev',
    photo: '/img/default_avatar.svg',
  },
  experiences: [
    {
      title: 'Senior Full Stack Developer',
      company: 'Bro Labs',
      location: 'Paris, France',
      description:
        'Led delivery of SaaS modules, optimized API latency by 35%, and built reusable UI systems with Vue 3 and TypeScript.',
      startDate: '2021-01-01',
      endDate: null,
    },
    {
      title: 'Frontend Engineer',
      company: 'Nova Digital',
      location: 'Lyon, France',
      description:
        'Built design-system components and analytics dashboards used by 40k+ monthly users.',
      startDate: '2018-06-01',
      endDate: '2020-12-31',
    },
  ],
  educations: [
    {
      title: 'Master in Computer Science',
      school: 'University of Lyon',
      startDate: '2018-09-01',
      endDate: '2020-06-30',
      location: 'Lyon, France',
      description: 'Specialization in distributed systems and software architecture.',
    },
    {
      title: 'Bachelor in Software Engineering',
      school: 'Université Grenoble Alpes',
      startDate: '2014-09-01',
      endDate: '2017-06-30',
      location: 'Grenoble, France',
    },
  ],
  skills: [
    { title: 'Vue.js' },
    { title: 'TypeScript' },
    { title: 'Node.js' },
    { title: 'Nuxt' },
    { title: 'PostgreSQL' },
    { title: 'Docker' },
  ],
  projects: [
    {
      title: 'Recruitment Analytics Platform',
      description: 'Real-time hiring KPIs dashboard with role-based access and export workflows.',
      home_page: 'https://demo.bro-world-space.com',
      startDate: '2023-02-01',
      endDate: null,
    },
    {
      title: 'Design System Kit',
      description: 'Reusable component library shared across 6 internal products.',
      startDate: '2022-01-01',
      endDate: '2022-11-01',
    },
  ],
  certifications: [
    {
      title: 'AWS Certified Developer – Associate',
      description: 'Amazon Web Services',
      startDate: '2023-05-01',
      endDate: '2026-05-01',
    },
    {
      title: 'Professional Scrum Master I',
      description: 'Scrum.org',
      startDate: '2022-09-01',
      endDate: null,
    },
  ],
  languages: [
    { title: 'French', level: 'Native', countryCode: 'FR' },
    { title: 'English', level: 'Professional', countryCode: 'GB' },
    { title: 'Spanish', level: 'Conversational', countryCode: 'ES' },
  ],
  references: [
    {
      title: 'Sophie Bernard · Engineering Manager',
      company: 'Bro Labs',
      description: 'sophie.bernard@brolabs.dev · +33 6 11 22 33 44',
    },
    {
      title: 'Julien Roche · Product Director',
      company: 'Nova Digital',
      description: 'julien.roche@novadigital.fr · +33 6 55 44 33 22',
    },
  ],
  hobbies: [
    { title: 'Open-source contribution' },
    { title: 'Trail running' },
    { title: 'Photography' },
  ],
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
    <ResumeTemplateDecor :decor="selectedTemplate.decor" />
    <component :is="activeLayoutComponent" :resume="fakeResume" :template="selectedTemplate" />
  </main>
</template>

<style scoped>
.capture-page { position: relative; width: 794px; min-height: 1123px; margin: 0; background: #fff; overflow: hidden; }
</style>
