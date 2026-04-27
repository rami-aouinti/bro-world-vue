<script setup lang="ts">
import { buildCoverDesignVars, type CoverLayoutSettings } from '~/composables/useResumeCoverDesign'

type Palette = {
  page: string
  accent: string
  soft: string
  text: string
}

type CoverPageModel = {
  fullName: string
  role: string
  summary: string
  location: string
  email: string
  phone: string
  date: string
  photoUrl?: string
}

const props = withDefaults(defineProps<{
  model: CoverPageModel
  palette: Palette
  typography?: 'sans' | 'serif'
  textStyle?: 'clean' | 'italic' | 'serif' | 'mono' | 'display'
  rounded?: string
  layoutSettings?: CoverLayoutSettings
}>(), {
  typography: 'sans',
  textStyle: 'clean',
  rounded: 'md',
  layoutSettings: () => ({}),
})

const designVars = computed(() => buildCoverDesignVars('cp', props))
</script>

<template>
  <article
    class="cover-page-hero text-dark"
    :style="{
      '--cp-page': props.palette.page,
      '--cp-accent': props.palette.accent,
      '--cp-soft': props.palette.soft,
      '--cp-text': props.palette.text,
      ...designVars,
    }"
  >
    <p class="cover-page-hero__date">{{ props.model.date }}</p>

    <v-avatar v-if="props.model.photoUrl" size="124" class="mx-auto">
      <v-img :src="props.model.photoUrl" cover />
    </v-avatar>

    <h1>{{ props.model.fullName }}</h1>
    <h2>{{ props.model.role }}</h2>
    <p class="cover-page-hero__summary">{{ props.model.summary }}</p>

    <footer>
      <span>{{ props.model.location }}</span>
      <span>{{ props.model.email }}</span>
      <span>{{ props.model.phone }}</span>
    </footer>
  </article>
</template>

<style scoped>
.cover-page-hero { font-family: var(--cp-font-family, 'Inter', 'Segoe UI', sans-serif); font-style: var(--cp-font-style, normal); font-weight: var(--cp-font-weight, 400); min-height: 100%; border-radius: var(--cp-rounded); background: radial-gradient(circle at top, color-mix(in srgb, var(--cp-soft) 76%, var(--cp-page)), var(--cp-page)); color: var(--cp-text); padding: 56px 48px; display: grid; text-align: center; align-content: center; gap: 14px; }
.cover-page-hero__date { letter-spacing: .08em; text-transform: uppercase; font-size: .78rem; color: color-mix(in srgb, var(--cp-text) 68%, white); }
.cover-page-hero h1 { font-size: 2.45rem; color: var(--cp-accent); line-height: 1.08; }
.cover-page-hero h2 { text-transform: uppercase; letter-spacing: .07em; font-size: .95rem; }
.cover-page-hero__summary { max-width: 52ch; margin: 0 auto; }
.cover-page-hero footer { margin-top: 18px; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 18px; font-size: .92rem; }
</style>
