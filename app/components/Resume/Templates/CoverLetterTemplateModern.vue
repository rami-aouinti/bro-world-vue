<script setup lang="ts">
import { buildCoverDesignVars, type CoverLayoutSettings } from '~/composables/useResumeCoverDesign'

type Palette = {
  page: string
  accent: string
  soft: string
  text: string
}

type CoverLetterModel = {
  fullName: string
  role: string
  recipient: string
  company: string
  date: string
  intro: string
  body: string
  closing: string
  email: string
  phone: string
}

const props = withDefaults(defineProps<{
  model: CoverLetterModel
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

const designVars = computed(() => buildCoverDesignVars('cl', props))
</script>

<template>
  <article
    class="cover-letter-modern text-dark"
    :style="{
      '--cl-page': props.palette.page,
      '--cl-accent': props.palette.accent,
      '--cl-soft': props.palette.soft,
      '--cl-text': props.palette.text,
      ...designVars,
    }"
  >
    <aside>
      <h2>{{ props.model.fullName }}</h2>
      <p>{{ props.model.role }}</p>
      <p>{{ props.model.email }}</p>
      <p>{{ props.model.phone }}</p>
    </aside>
    <section>
      <p class="mb-2">{{ props.model.date }}</p>
      <p>{{ props.model.recipient }} — {{ props.model.company }}</p>
      <p>{{ props.model.intro }}</p>
      <p>{{ props.model.body }}</p>
      <p>{{ props.model.closing }}</p>
    </section>
  </article>
</template>

<style scoped>
.cover-letter-modern { font-family: var(--cl-font-family, 'Inter', 'Segoe UI', sans-serif); font-style: var(--cl-font-style, normal); font-weight: var(--cl-font-weight, 400); min-height: 100%; border-radius: var(--cl-rounded); overflow: hidden; display: grid; grid-template-columns: 240px 1fr; background: var(--cl-page); color: var(--cl-text); }
.cover-letter-modern aside { background: var(--cl-soft); padding: 30px 22px; display: grid; gap: 8px; align-content: start; }
.cover-letter-modern h2 { color: var(--cl-page); }
.cover-letter-modern section { padding: 34px 38px; display: grid; gap: 12px; line-height: 1.6; }
@media (max-width: 960px) { .cover-letter-modern { grid-template-columns: 1fr; } }
</style>
