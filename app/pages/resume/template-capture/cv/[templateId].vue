<script setup lang="ts">
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-20-resume.json'
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

function resolveGeneratedTemplateId(rawTemplateId: string): string {
  const normalized = rawTemplateId.trim()
  if (!normalized) return ''

  const exactGenerated = GENERATED_RESUME_TEMPLATES.find((template) => template.id === normalized)
  if (exactGenerated) return exactGenerated.id

  const unprefixed = normalized.startsWith('resume-') ? normalized.slice('resume-'.length) : normalized
  const prefixedGenerated = GENERATED_RESUME_TEMPLATES.find((template) => template.id === unprefixed)
  if (prefixedGenerated) return prefixedGenerated.id

  const startsWithGenerated = GENERATED_RESUME_TEMPLATES.find((template) => template.id.startsWith(normalized))
  if (startsWithGenerated) return startsWithGenerated.id

  return ''
}

const selectedTemplate = computed(() => {
  const resolvedTemplateId = resolveGeneratedTemplateId(templateId.value)
  return GENERATED_RESUME_TEMPLATES.find((tpl) => tpl.id === resolvedTemplateId) || GENERATED_RESUME_TEMPLATES[0]
})

const randomItem = <T,>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)]
}

const randomItems = <T,>(items: T[], count = 5): T[] => {
  return [...items]
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
}

const fullNames = [
  'Alex Martin',
  'John Doe',
  'Sophie Bernard',
  'Emma Laurent',
  'Lucas Moreau',
]

const photos = [
  '/img/team-1.jpg',
  '/img/team-2.jpg',
  '/img/team-3.jpg',
  '/img/team-4.jpg',
  '/img/team-5.jpg',
]

const titles = [
  'Senior Full Stack Developer',
  'Frontend Engineer',
  'Backend Symfony Developer',
  'Product Designer',
  'DevOps Engineer',
]

const cities = [
  'Paris, France',
  'Lyon, France',
  'Berlin, Germany',
  'Amsterdam, Netherlands',
  'Barcelona, Spain',
]

const profiles = [
  'Product-minded engineer with 8+ years delivering scalable web platforms, mentoring teams, and shipping high-impact features end-to-end.',
  'Creative frontend developer focused on clean interfaces, accessibility, performance, and maintainable design systems.',
  'Backend engineer specialized in Symfony, API Platform, PostgreSQL, scalable architectures, and clean domain-driven code.',
  'DevOps-oriented developer with strong experience in Docker, CI/CD, cloud deployments, monitoring, and automation.',
  'Full stack developer passionate about building modern SaaS products with Vue, Nuxt, TypeScript, and Symfony.',
]

const experiencePool = [
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
  {
    title: 'Backend Symfony Developer',
    company: 'CloudBridge',
    location: 'Berlin, Germany',
    description:
      'Designed REST APIs with Symfony, improved database performance, and implemented secure authentication workflows.',
    startDate: '2019-03-01',
    endDate: '2021-08-31',
  },
  {
    title: 'Software Engineer',
    company: 'Pixel Factory',
    location: 'Amsterdam, Netherlands',
    description:
      'Developed internal tools, automated reporting pipelines, and collaborated with product teams on feature delivery.',
    startDate: '2017-01-01',
    endDate: '2019-02-28',
  },
  {
    title: 'DevOps Engineer',
    company: 'ScaleOps',
    location: 'Barcelona, Spain',
    description:
      'Managed Docker-based deployments, CI/CD pipelines, server monitoring, and production incident response.',
    startDate: '2020-04-01',
    endDate: '2022-10-31',
  },
  {
    title: 'Technical Lead',
    company: 'Rocket Studio',
    location: 'Paris, France',
    description:
      'Mentored developers, reviewed architecture decisions, and coordinated releases across multiple product teams.',
    startDate: '2022-11-01',
    endDate: null,
  },
]

const educationPool = [
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
    description: 'Focused on software development, algorithms, databases, and web technologies.',
  },
  {
    title: 'Engineering Degree in Information Systems',
    school: 'INSA Lyon',
    startDate: '2015-09-01',
    endDate: '2020-06-30',
    location: 'Lyon, France',
    description: 'Training in system design, software architecture, project management, and cloud computing.',
  },
  {
    title: 'Professional Certificate in Cloud Computing',
    school: 'OpenClassrooms',
    startDate: '2021-01-01',
    endDate: '2021-06-30',
    location: 'Remote',
    description: 'Covered cloud architecture, containers, CI/CD, monitoring, and deployment automation.',
  },
  {
    title: 'Web Development Bootcamp',
    school: 'Le Wagon',
    startDate: '2016-01-01',
    endDate: '2016-04-30',
    location: 'Paris, France',
    description: 'Intensive training in frontend, backend, databases, and agile product development.',
  },
  {
    title: 'Bachelor in Computer Applications',
    school: 'Berlin School of Technology',
    startDate: '2012-09-01',
    endDate: '2015-06-30',
    location: 'Berlin, Germany',
    description: 'Core studies in programming, networks, operating systems, and database systems.',
  },
]

const skillPool = [
  { title: 'Vue.js' },
  { title: 'TypeScript' },
  { title: 'Node.js' },
  { title: 'Nuxt' },
  { title: 'PostgreSQL' },
  { title: 'Docker' },
  { title: 'Symfony' },
  { title: 'API Platform' },
  { title: 'Redis' },
  { title: 'GitHub Actions' },
]

const projectPool = [
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
  {
    title: 'E-commerce Admin Dashboard',
    description: 'Advanced product, order, customer, and payment management interface.',
    startDate: '2021-04-01',
    endDate: '2021-12-01',
  },
  {
    title: 'Realtime Chat Application',
    description: 'Messaging platform with live notifications, conversations, and read receipts.',
    startDate: '2023-06-01',
    endDate: null,
  },
  {
    title: 'Resume Builder Platform',
    description: 'Dynamic resume generator with templates, PDF export, and live preview.',
    startDate: '2024-01-01',
    endDate: null,
  },
]

const certificationPool = [
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
  {
    title: 'Docker Certified Associate',
    description: 'Docker',
    startDate: '2021-03-01',
    endDate: null,
  },
  {
    title: 'Google Cloud Fundamentals',
    description: 'Google Cloud',
    startDate: '2022-04-01',
    endDate: null,
  },
  {
    title: 'Vue.js Advanced Certification',
    description: 'Vue School',
    startDate: '2023-01-01',
    endDate: null,
  },
]

const languagePool = [
  { title: 'French', level: 'Native', countryCode: 'FR' },
  { title: 'English', level: 'Professional', countryCode: 'GB' },
  { title: 'Spanish', level: 'Conversational', countryCode: 'ES' },
  { title: 'German', level: 'Intermediate', countryCode: 'DE' },
  { title: 'Arabic', level: 'Native', countryCode: 'TN' },
]

const referencePool = [
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
  {
    title: 'Marie Dubois · CTO',
    company: 'CloudBridge',
    description: 'marie.dubois@cloudbridge.dev · +49 30 1234 5678',
  },
  {
    title: 'Thomas Keller · Lead Developer',
    company: 'ScaleOps',
    description: 'thomas.keller@scaleops.io · +49 176 12345678',
  },
  {
    title: 'Laura Smith · Product Manager',
    company: 'Rocket Studio',
    description: 'laura.smith@rocketstudio.com · +33 7 22 33 44 55',
  },
]

const hobbyPool = [
  { title: 'Open-source contribution' },
  { title: 'Trail running' },
  { title: 'Photography' },
  { title: 'Chess' },
  { title: 'Travel' },
  { title: 'Reading tech blogs' },
]

const createFakeResume = (): ResumeApiItem => {
  const fullName = randomItem(fullNames)
  const title = randomItem(titles)
  const city = randomItem(cities)

  const emailName = fullName
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z.]/g, '')

  return {
    id: `capture-resume-${Date.now()}`,
    documentUrl: null,

    resumeInformation: {
      fullName,
      title,
      profileText: randomItem(profiles),
      email: `${emailName}@example.com`,
      phone: '+33 6 00 00 00 00',
      adresse: city,
      address: city,
      homepage: `https://${emailName}.dev`,
      repo_profile: `https://github.com/${emailName.replace('.', '-')}`,
      photo: randomItem(photos),
    },

    experiences: randomItems(experiencePool, 5),

    educations: randomItems(educationPool, 5),

    skills: randomItems(skillPool, 5),

    projects: randomItems(projectPool, 5),

    certifications: randomItems(certificationPool, 5),

    languages: randomItems(languagePool, 5),

    references: randomItems(referencePool, 5),

    hobbies: randomItems(hobbyPool, 5),
  }
}

const fakeResume = ref<ResumeApiItem>(createFakeResume())

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
.capture-page { position: relative; width: 850px; max-height: 1123px; margin: 0; background: #fff; overflow: hidden; }
</style>
