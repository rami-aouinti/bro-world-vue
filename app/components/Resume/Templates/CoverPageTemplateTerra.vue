<script setup lang="ts">
import {
  buildCoverDesignVars,
  type CoverLayoutSettings,
} from '~/composables/useResumeCoverDesign'

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

const props = withDefaults(
  defineProps<{
    model: CoverPageModel
    palette: Palette
    typography?: 'sans' | 'serif'
    textStyle?: 'clean' | 'italic' | 'serif' | 'mono' | 'display'
    rounded?: string
    layoutSettings?: CoverLayoutSettings
  }>(),
  {
    typography: 'sans',
    textStyle: 'clean',
    rounded: 'md',
    layoutSettings: () => ({}),
  },
)

const designVars = computed(() => buildCoverDesignVars('cp', props))
</script>

<template>
  <article
    class="cover-page-terra text-dark"
    :style="{
      '--cp-page': props.palette.page,
      '--cp-accent': props.palette.accent,
      '--cp-soft': props.palette.soft,
      '--cp-text': props.palette.text,
      ...designVars,
    }"
  >
    <aside class="cover-page-terra__sidebar">
      <v-avatar v-if="props.model.photoUrl" size="110" class="mb-4">
        <v-img :src="props.model.photoUrl" cover />
      </v-avatar>
      <p>{{ props.model.location }}</p>
      <p>{{ props.model.email }}</p>
      <p>{{ props.model.phone }}</p>
    </aside>

    <section class="cover-page-terra__content">
      <p class="cover-page-terra__date">{{ props.model.date }}</p>
      <h1>{{ props.model.fullName }}</h1>
      <h2>{{ props.model.role }}</h2>
      <p>{{ props.model.summary }}</p>
    </section>
  </article>
</template>

<style scoped>
.cover-page-terra {
  font-family: var(--cp-font-family, 'Inter', 'Segoe UI', sans-serif);
  font-style: var(--cp-font-style, normal);
  font-weight: var(--cp-font-weight, 400);
  display: grid;
  grid-template-columns: 180px 1fr;
  background: var(--cp-page);
  color: var(--cp-text);
  min-height: 100%;
  border-radius: var(--cp-rounded);
  overflow: hidden;
}
.cover-page-terra__sidebar {
  background: var(--cp-soft);
  padding: 28px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cover-page-terra__content {
  padding: 38px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.cover-page-terra__date {
  color: color-mix(in srgb, var(--cp-text) 70%, white);
}
.cover-page-terra h1 {
  font-size: 2rem;
  color: var(--cp-accent);
}
.cover-page-terra h2 {
  font-size: 1.05rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
@media (max-width: 960px) {
  .cover-page-terra {
    grid-template-columns: 1fr;
  }
}
</style>
