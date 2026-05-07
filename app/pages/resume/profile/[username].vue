<script setup lang="ts">
import type { ResumeApiItem } from '~/services/resumeApi'

const route = useRoute()
const username = computed(() => String(route.params.username || '').trim())

const { data: resume, pending, error } = await useAsyncData<ResumeApiItem | null>(
  () => `public-resume-${username.value}`,
  async () => {
    if (!username.value) return null
    return await $fetch<ResumeApiItem>(`https://bro-world.org/api/v1/recruit/resumes/active/${encodeURIComponent(username.value)}`)
  },
  { watch: [username] },
)

const formatDate = (value?: string | null) => {
  if (!value) return 'Présent'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })
}

const templatePalette = computed(() => {
  const palette = (resume.value as any)?.template?.theme?.palette
  return {
    primary: palette?.primary || '#1D4ED8',
    secondary: palette?.secondary || '#93C5FD',
    text: palette?.text || '#0F172A',
    muted: palette?.muted || '#64748B',
    pageBackground: palette?.pageBackground || '#F8FAFC',
  }
})

definePageMeta({ layout: 'resume' })
</script>

<template>
  <section class="public-resume" :style="{ '--primary': templatePalette.primary, '--secondary': templatePalette.secondary, '--text': templatePalette.text, '--muted': templatePalette.muted, '--page-bg': templatePalette.pageBackground }">
    <v-container class="py-8">
      <v-alert v-if="error" type="error" variant="tonal" title="Impossible de charger ce CV public" :text="String(error)" />
      <v-skeleton-loader v-else-if="pending" type="article, article, article" />
      <v-card v-else-if="resume" class="mx-auto public-resume__sheet" max-width="980" rounded="xl">
        <div class="public-resume__header">
          <div>
            <h1 class="text-h4 font-weight-bold mb-1">{{ resume.resumeInformation?.fullName }}</h1>
            <p class="text-h6 mb-0">{{ resume.resumeInformation?.title }}</p>
          </div>
          <v-avatar v-if="resume.resumeInformation?.photo" size="112">
            <v-img :src="resume.resumeInformation.photo" alt="Photo profil" cover />
          </v-avatar>
        </div>
        <v-divider class="my-4" />
        <div class="public-resume__section">
          <h2>Profil</h2>
          <p class="mb-0 pre-wrap">{{ resume.resumeInformation?.profileText }}</p>
        </div>
        <div class="public-resume__section">
          <h2>Expériences</h2>
          <div v-for="item in resume.experiences || []" :key="item.title + item.startDate" class="mb-4">
            <div class="d-flex justify-space-between flex-wrap ga-2">
              <strong>{{ item.title }} · {{ item.company }}</strong>
              <span class="text-caption text-medium-emphasis">{{ formatDate(item.startDate) }} - {{ formatDate(item.endDate) }}</span>
            </div>
            <p class="mb-0 pre-wrap">{{ item.description }}</p>
          </div>
        </div>
        <div class="public-resume__section">
          <h2>Éducation</h2>
          <div v-for="item in resume.educations || []" :key="item.title + item.startDate" class="mb-3">
            <strong>{{ item.title }} · {{ item.school }}</strong>
            <p class="mb-0 text-caption text-medium-emphasis">{{ formatDate(item.startDate) }} - {{ formatDate(item.endDate) }} · {{ item.location }}</p>
          </div>
        </div>
        <div class="public-resume__section">
          <h2>Compétences</h2>
          <div class="d-flex flex-wrap ga-2">
            <v-chip v-for="skill in resume.skills || []" :key="skill.name" color="primary" variant="outlined">{{ skill.name }}</v-chip>
          </div>
        </div>
      </v-card>
    </v-container>
  </section>
</template>

<style scoped>
.public-resume { min-height: 100vh; background: var(--page-bg); color: var(--text); }
.public-resume__sheet { padding: 32px; }
.public-resume__header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.public-resume__section h2 { color: var(--primary); margin-bottom: 8px; }
.pre-wrap { white-space: pre-wrap; }
</style>
