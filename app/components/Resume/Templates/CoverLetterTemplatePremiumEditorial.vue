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
    class="cover-letter-premium text-dark"
    :style="{
      '--cl-page': props.palette.page,
      '--cl-accent': props.palette.accent,
      '--cl-soft': props.palette.soft,
      '--cl-text': props.palette.text,
      ...designVars,
    }"
  >
    <header>
      <p>{{ props.model.date }}</p>
      <h1>{{ props.model.fullName }}</h1>
      <h2>{{ props.model.role }}</h2>
    </header>

    <section>
      <p>{{ props.model.recipient }}</p>
      <p>{{ props.model.company }}</p>
      <p>{{ props.model.intro }}</p>
      <p>{{ props.model.body }}</p>
      <p>{{ props.model.closing }}</p>
    </section>

    <footer>{{ props.model.email }} · {{ props.model.phone }}</footer>
  </article>
</template>

<style scoped>
.cover-letter-premium { font-family: var(--cl-font-family, 'Inter', 'Segoe UI', sans-serif); font-style: var(--cl-font-style, normal); font-weight: var(--cl-font-weight, 400); min-height: 100%; border-radius: var(--cl-rounded); background: linear-gradient(170deg, color-mix(in srgb, var(--cl-soft) 75%, var(--cl-page)) 0 26%, var(--cl-page) 26%); color: var(--cl-text); padding: 44px 48px; display: grid; grid-template-rows: auto 1fr auto; gap: 20px; }
.cover-letter-premium header p { letter-spacing: .08em; text-transform: uppercase; font-size: .75rem; }
.cover-letter-premium h1 { color: var(--cl-accent); font-size: 2.15rem; }
.cover-letter-premium h2 { text-transform: uppercase; letter-spacing: .06em; font-size: .88rem; }
.cover-letter-premium section { display: grid; gap: 12px; line-height: 1.62; }
.cover-letter-premium footer { padding-top: 14px; border-top: var(--cl-divider-width) var(--cl-divider-style) color-mix(in srgb, var(--cl-accent) 20%, transparent); }
</style>
