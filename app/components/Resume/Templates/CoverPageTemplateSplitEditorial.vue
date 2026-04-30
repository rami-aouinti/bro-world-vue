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
    class="cover-page-split text-dark"
    :style="{
      '--cp-page': props.palette.page,
      '--cp-accent': props.palette.accent,
      '--cp-soft': props.palette.soft,
      '--cp-text': props.palette.text,
      ...designVars,
    }"
  >
    <section class="cover-page-split__left">
      <p>{{ props.model.date }}</p>
      <h1>{{ props.model.fullName }}</h1>
      <h2>{{ props.model.role }}</h2>
    </section>

    <section class="cover-page-split__right">
      <p class="cover-page-split__summary">{{ props.model.summary }}</p>
      <div>
        <p>{{ props.model.location }}</p>
        <p>{{ props.model.email }}</p>
        <p>{{ props.model.phone }}</p>
      </div>
    </section>
  </article>
</template>

<style scoped>
.cover-page-split {
  font-family: var(--cp-font-family, 'Inter', 'Segoe UI', sans-serif);
  font-style: var(--cp-font-style, normal);
  font-weight: var(--cp-font-weight, 400);
  min-height: 100%;
  border-radius: var(--cp-rounded);
  overflow: hidden;
  color: var(--cp-text);
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  background: var(--cp-page);
  border: 1px solid color-mix(in srgb, var(--cp-accent) 22%, transparent);
}
.cover-page-split__left {
  padding: 52px 42px;
  background: color-mix(in srgb, var(--cp-soft) 68%, var(--cp-page));
  display: grid;
  align-content: center;
  gap: 10px;
  border-right: var(--cp-divider-width) var(--cp-divider-style)
    color-mix(in srgb, var(--cp-accent) 24%, transparent);
}
.cover-page-split__left p {
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.cover-page-split__left h1 {
  font-size: 2.7rem;
  line-height: 1.03;
  color: var(--cp-accent);
}
.cover-page-split__left h2 {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.9rem;
}
.cover-page-split__right {
  padding: 52px 38px;
  display: grid;
  align-content: center;
  gap: 20px;
  background: linear-gradient(
    180deg,
    transparent,
    color-mix(in srgb, var(--cp-soft) 32%, transparent)
  );
}
.cover-page-split__summary {
  line-height: 1.75;
}
.cover-page-split__right div {
  display: grid;
  gap: 6px;
}
@media (max-width: 960px) {
  .cover-page-split {
    grid-template-columns: 1fr;
  }
  .cover-page-split__left {
    border-right: 0;
    border-bottom: var(--cp-divider-width) var(--cp-divider-style)
      color-mix(in srgb, var(--cp-accent) 24%, transparent);
  }
}
</style>
