<script setup lang="ts">
import GENERATED_COVER_PAGE_TEMPLATES from '~/data/resume-templates/generated-20-cover-page.json'

definePageMeta({ title: 'Resume · Cover Page Preview', layout: 'resume' })

const route = useRoute()
const { coverPageTemplates } = useResumeTemplates()

const selectedTemplate = ref(coverPageTemplates.value[0]?.id || GENERATED_COVER_PAGE_TEMPLATES[0]?.id || '')
const photoOptions = ['/img/team-1.jpg', '/img/team-2.jpg', '/img/team-3.jpg', '/img/team-4.jpg']

const model = reactive({
  fullName: 'Alex Martin',
  role: 'Senior Full Stack Developer',
  summary: 'Driven engineer delivering robust products with strong UX and clean architecture.',
  location: 'Paris, France',
  email: 'alex@example.com',
  phone: '+33 6 00 00 00 00',
  date: new Date().toLocaleDateString('en-US'),
  photoUrl: photoOptions[0],
})

const activeTemplate = computed(() => GENERATED_COVER_PAGE_TEMPLATES.find((tpl) => tpl.id === selectedTemplate.value) || GENERATED_COVER_PAGE_TEMPLATES[0])

onMounted(() => {
  const q = typeof route.query.template === 'string' ? route.query.template : ''
  if (q && coverPageTemplates.value.some((tpl) => tpl.id === q)) selectedTemplate.value = q
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <v-text-field v-model="model.fullName" label="Full name" variant="outlined" hide-details class="mt-3" />
        <v-text-field v-model="model.role" label="Title" variant="outlined" hide-details class="mt-3" />
        <v-textarea v-model="model.summary" label="Summary" variant="outlined" auto-grow hide-details class="mt-3" />
        <v-text-field v-model="model.location" label="Location" variant="outlined" hide-details class="mt-3" />
        <v-text-field v-model="model.email" label="Email" variant="outlined" hide-details class="mt-3" />
        <v-text-field v-model="model.phone" label="Phone" variant="outlined" hide-details class="mt-3" />
        <AppSelect v-model="model.photoUrl" :items="photoOptions.map((value) => ({ title: value, value }))" label="Photo" hide-details class="mt-3" />
      </template>
      <template #right>
        <AppSelect v-model="selectedTemplate" :items="coverPageTemplates.map((t) => ({ title: t.title, value: t.id }))" label="Template" hide-details class="mt-3" />
      </template>
    </AppPageDrawers>

    <v-container fluid class="py-8 d-flex justify-center">
      <main
        class="capture-cover-page"
        :style="{
          '--cp-primary': activeTemplate.theme.palette.primary,
          '--cp-secondary': activeTemplate.theme.palette.secondary,
          '--cp-text': activeTemplate.theme.palette.text,
          '--cp-muted': activeTemplate.theme.palette.muted,
          '--cp-bg': activeTemplate.theme.palette.pageBackground,
        }"
      >
        <header class="hero">
          <v-avatar size="84" class="mb-4"><v-img :src="model.photoUrl" cover /></v-avatar>
          <h1>{{ model.fullName }}</h1>
          <p>{{ model.role }}</p>
          <p class="meta">{{ model.date }} · {{ model.location }}</p>
        </header>
        <section>
          <h2>Application Pack</h2>
          <p>{{ model.summary }}</p>
          <p class="meta">{{ model.email }} · {{ model.phone }}</p>
        </section>
      </main>
    </v-container>
  </div>
</template>

<style scoped>
.capture-cover-page { width: 850px; min-height: 1123px; padding: 80px; background: var(--cp-bg); color: var(--cp-text); }
.hero { border-left: 10px solid var(--cp-primary); padding-left: 24px; margin-bottom: 48px; }
h1 { font-size: 58px; margin: 0; }
p { font-size: 24px; color: var(--cp-muted); }
.meta { font-size: 16px; }
h2 { color: var(--cp-primary); font-size: 40px; margin: 0 0 16px; }
section { border-top: 3px solid var(--cp-secondary); padding-top: 24px; }
</style>
