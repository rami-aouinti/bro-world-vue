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
    class="cover-page-elegant text-dark"
    :style="{
      '--cp-page': props.palette.page,
      '--cp-accent': props.palette.accent,
      '--cp-soft': props.palette.soft,
      '--cp-text': props.palette.text,
      ...designVars,
    }"
  >
    <p class="cover-page-elegant__date">{{ props.model.date }}</p>
    <h1>{{ props.model.fullName }}</h1>
    <h2>{{ props.model.role }}</h2>
    <div class="cover-page-elegant__bar" />
    <p class="cover-page-elegant__summary">{{ props.model.summary }}</p>
    <div class="cover-page-elegant__meta">
      <span>{{ props.model.location }}</span>
      <span>{{ props.model.email }}</span>
      <span>{{ props.model.phone }}</span>
    </div>
  </article>
</template>

<style scoped>
.cover-page-elegant {
  font-family: var(--cp-font-family, 'Inter', 'Segoe UI', sans-serif);
  font-style: var(--cp-font-style, normal);
  font-weight: var(--cp-font-weight, 400);
  min-height: 100%;
  padding: 56px 64px;
  background: linear-gradient(
    160deg,
    color-mix(in srgb, var(--cp-soft) 85%, white) 0 28%,
    var(--cp-page) 28%
  );
  color: var(--cp-text);
  border-radius: var(--cp-rounded);
  border: 1px solid color-mix(in srgb, var(--cp-accent) 20%, transparent);
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  box-shadow: 0 10px 28px color-mix(in srgb, var(--cp-accent) 10%, transparent);
}
.cover-page-elegant__date {
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.cover-page-elegant h1 {
  font-size: 2.4rem;
  color: var(--cp-accent);
}
.cover-page-elegant h2 {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.9rem;
}
.cover-page-elegant__bar {
  width: 86px;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--cp-accent) 72%, white);
}
.cover-page-elegant__summary {
  max-width: 56ch;
  line-height: 1.72;
}
.cover-page-elegant__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
}
</style>
