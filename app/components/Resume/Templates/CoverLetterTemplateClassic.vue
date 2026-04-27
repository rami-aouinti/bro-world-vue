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
    class="cover-letter-classic text-dark"
    :style="{
      '--cl-page': props.palette.page,
      '--cl-accent': props.palette.accent,
      '--cl-soft': props.palette.soft,
      '--cl-text': props.palette.text,
      ...designVars,
    }"
  >
    <header>
      <h1>{{ props.model.fullName }}</h1>
      <p>{{ props.model.role }} · {{ props.model.email }} · {{ props.model.phone }}</p>
    </header>

    <div class="cover-letter-classic__recipient">
      <p>{{ props.model.date }}</p>
      <p>{{ props.model.recipient }}</p>
      <p>{{ props.model.company }}</p>
    </div>

    <section>
      <p>{{ props.model.intro }}</p>
      <p>{{ props.model.body }}</p>
      <p>{{ props.model.closing }}</p>
    </section>
  </article>
</template>

<style scoped>
.cover-letter-classic { font-family: var(--cl-font-family, 'Inter', 'Segoe UI', sans-serif); font-style: var(--cl-font-style, normal); font-weight: var(--cl-font-weight, 400); background: var(--cl-page); color: var(--cl-text); min-height: 100%; padding: 40px 46px; border-radius: var(--cl-rounded); }
.cover-letter-classic header { border-bottom: var(--cl-divider-width) var(--cl-divider-style) var(--cl-soft); padding-bottom: 14px; margin-bottom: 24px; }
.cover-letter-classic h1 { color: var(--cl-accent); font-size: 1.9rem; }
.cover-letter-classic__recipient { margin-bottom: 18px; }
.cover-letter-classic section { display: grid; gap: 12px; line-height: 1.6; }
</style>
