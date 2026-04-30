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
    class="cover-page-hero text-dark"
    :style="{
      '--cp-page': props.palette.page,
      '--cp-accent': props.palette.accent,
      '--cp-soft': props.palette.soft,
      '--cp-text': props.palette.text,
      ...designVars,
    }"
  >
    <div class="cover-page-hero__top">
      <v-avatar
        v-if="props.model.photoUrl"
        size="176"
        class="cover-page-hero__avatar"
      >
        <v-img :src="props.model.photoUrl" cover />
      </v-avatar>
      <div class="cover-page-hero__name-block">
        <p class="cover-page-hero__date">{{ props.model.date }}</p>
        <h1>{{ props.model.fullName }}</h1>
        <h2>{{ props.model.role }}</h2>
      </div>
    </div>

    <div class="cover-page-hero__contacts">
      <p>☎ {{ props.model.phone }}</p>
      <p>✉ {{ props.model.email }}</p>
      <p>⌂ {{ props.model.location }}</p>
    </div>

    <p class="cover-page-hero__summary">{{ props.model.summary }}</p>
  </article>
</template>

<style scoped>
.cover-page-hero {
  font-family: var(--cp-font-family, 'Inter', 'Segoe UI', sans-serif);
  min-height: 100%;
  border-radius: var(--cp-rounded);
  border: 1px solid color-mix(in srgb, var(--cp-accent) 20%, transparent);
  background: color-mix(in srgb, var(--cp-page) 92%, white);
  color: var(--cp-text);
  padding: 48px;
  display: grid;
  gap: 26px;
}
.cover-page-hero__top {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 34px;
}
.cover-page-hero__avatar {
  border: 8px solid color-mix(in srgb, var(--cp-soft) 70%, white);
  box-shadow: 0 12px 28px color-mix(in srgb, var(--cp-accent) 14%, transparent);
}
.cover-page-hero__date {
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.76rem;
  margin-bottom: 8px;
}
.cover-page-hero h1 {
  font-size: clamp(2.3rem, 5vw, 3.5rem);
  line-height: 1.03;
  margin: 0;
  color: color-mix(in srgb, var(--cp-accent) 86%, black);
}
.cover-page-hero h2 {
  margin-top: 10px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.92rem;
  color: color-mix(in srgb, var(--cp-accent) 70%, white);
}
.cover-page-hero__contacts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  background: color-mix(in srgb, var(--cp-soft) 70%, white);
  padding: 14px 16px;
  border-left: 4px solid color-mix(in srgb, var(--cp-accent) 62%, transparent);
}
.cover-page-hero__contacts p {
  margin: 0;
  font-size: 0.9rem;
}
.cover-page-hero__summary {
  line-height: 1.8;
  max-width: 78ch;
}
@media (max-width: 900px) {
  .cover-page-hero__top {
    grid-template-columns: 1fr;
  }
  .cover-page-hero__contacts {
    grid-template-columns: 1fr;
  }
}
</style>
