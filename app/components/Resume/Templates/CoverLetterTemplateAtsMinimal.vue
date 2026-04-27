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
    class="cover-letter-ats text-dark"
    :style="{
      '--cl-page': props.palette.page,
      '--cl-accent': props.palette.accent,
      '--cl-soft': props.palette.soft,
      '--cl-text': props.palette.text,
      ...designVars,
    }"
  >
    <p>{{ props.model.fullName }} · {{ props.model.role }}</p>
    <p>{{ props.model.email }} · {{ props.model.phone }}</p>
    <p>{{ props.model.date }}</p>
    <p>{{ props.model.recipient }} — {{ props.model.company }}</p>
    <p>{{ props.model.intro }}</p>
    <p>{{ props.model.body }}</p>
    <p>{{ props.model.closing }}</p>
  </article>
</template>

<style scoped>
.cover-letter-ats { font-family: var(--cl-font-family, 'Inter', 'Segoe UI', sans-serif); font-style: var(--cl-font-style, normal); font-weight: var(--cl-font-weight, 400); min-height: 100%; background: var(--cl-page); color: var(--cl-text); border-radius: var(--cl-rounded); padding: 34px 40px; display: grid; gap: 12px; line-height: 1.55; border: var(--cl-divider-width) var(--cl-divider-style) color-mix(in srgb, var(--cl-soft) 70%, var(--cl-page)); }
.cover-letter-ats p:first-child { font-weight: 700; color: var(--cl-accent); }
.cover-letter-ats p:nth-child(2) { font-size: .92rem; }
</style>
