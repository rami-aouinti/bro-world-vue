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
    class="cover-letter-split text-dark"
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
      <p>{{ props.model.date }}</p>
    </aside>

    <section>
      <p>{{ props.model.recipient }} · {{ props.model.company }}</p>
      <p>{{ props.model.intro }}</p>
      <p>{{ props.model.body }}</p>
      <p>{{ props.model.closing }}</p>
    </section>
  </article>
</template>

<style scoped>
.cover-letter-split { font-family: var(--cl-font-family, 'Inter', 'Segoe UI', sans-serif); font-style: var(--cl-font-style, normal); font-weight: var(--cl-font-weight, 400); min-height: 100%; border-radius: var(--cl-rounded); overflow: hidden; display: grid; grid-template-columns: 1fr 1.4fr; background: var(--cl-page); color: var(--cl-text); }
.cover-letter-split aside { background: color-mix(in srgb, var(--cl-soft) 72%, var(--cl-page)); padding: 30px 24px; display: grid; align-content: start; gap: 8px; border-right: var(--cl-divider-width) var(--cl-divider-style) color-mix(in srgb, var(--cl-accent) 20%, transparent); }
.cover-letter-split h2 { color: var(--cl-page); font-size: 1.3rem; margin-bottom: 4px; }
.cover-letter-split section { padding: 34px 36px; display: grid; gap: 12px; line-height: 1.6; }
.cover-letter-split section p:first-child { text-transform: uppercase; letter-spacing: .07em; font-size: .78rem; }
@media (max-width: 960px) { .cover-letter-split { grid-template-columns: 1fr; } .cover-letter-split aside { border-right: 0; border-bottom: var(--cl-divider-width) var(--cl-divider-style) color-mix(in srgb, var(--cl-accent) 20%, transparent); } }
</style>
