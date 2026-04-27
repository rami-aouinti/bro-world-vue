<script setup lang="ts">
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

withDefaults(defineProps<{
  model: CoverLetterModel
  palette: Palette
  typography?: 'sans' | 'serif'
  rounded?: string
}>(), {
  typography: 'sans',
  rounded: '14px',
})
</script>

<template>
  <article
    class="cover-letter-ats text-dark"
    :class="`cover-letter-ats--${typography}`"
    :style="{
      '--cl-page': palette.page,
      '--cl-accent': palette.accent,
      '--cl-soft': palette.soft,
      '--cl-text': palette.text,
      '--cl-rounded': rounded,
    }"
  >
    <p>{{ model.fullName }} · {{ model.role }}</p>
    <p>{{ model.email }} · {{ model.phone }}</p>
    <p>{{ model.date }}</p>
    <p>{{ model.recipient }} — {{ model.company }}</p>
    <p>{{ model.intro }}</p>
    <p>{{ model.body }}</p>
    <p>{{ model.closing }}</p>
  </article>
</template>

<style scoped>
.cover-letter-ats { min-height: 100%; background: var(--cl-page); color: var(--cl-text); border-radius: var(--cl-rounded); padding: 34px 40px; display: grid; gap: 12px; line-height: 1.55; border: 1px solid color-mix(in srgb, var(--cl-soft) 70%, var(--cl-page)); }
.cover-letter-ats p:first-child { font-weight: 700; color: var(--cl-accent); }
.cover-letter-ats p:nth-child(2) { font-size: .92rem; }
.cover-letter-ats--serif { font-family: Georgia, 'Times New Roman', serif; }
.cover-letter-ats--sans { font-family: Inter, 'Segoe UI', sans-serif; }
</style>
