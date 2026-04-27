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
    class="cover-letter-modern text-dark"
    :class="`cover-letter-modern--${typography}`"
    :style="{
      '--cl-page': palette.page,
      '--cl-accent': palette.accent,
      '--cl-soft': palette.soft,
      '--cl-text': palette.text,
      '--cl-rounded': rounded,
    }"
  >
    <aside>
      <h2>{{ model.fullName }}</h2>
      <p>{{ model.role }}</p>
      <p>{{ model.email }}</p>
      <p>{{ model.phone }}</p>
    </aside>
    <section>
      <p class="mb-2">{{ model.date }}</p>
      <p>{{ model.recipient }} — {{ model.company }}</p>
      <p>{{ model.intro }}</p>
      <p>{{ model.body }}</p>
      <p>{{ model.closing }}</p>
    </section>
  </article>
</template>

<style scoped>
.cover-letter-modern { min-height: 100%; border-radius: var(--cl-rounded); overflow: hidden; display: grid; grid-template-columns: 240px 1fr; background: var(--cl-page); color: var(--cl-text); }
.cover-letter-modern aside { background: var(--cl-soft); padding: 30px 22px; display: grid; gap: 8px; align-content: start; }
.cover-letter-modern h2 { color: var(--cl-accent); }
.cover-letter-modern section { padding: 34px 38px; display: grid; gap: 12px; line-height: 1.6; }
.cover-letter-modern--serif { font-family: Georgia, 'Times New Roman', serif; }
.cover-letter-modern--sans { font-family: Inter, 'Segoe UI', sans-serif; }
@media (max-width: 960px) { .cover-letter-modern { grid-template-columns: 1fr; } }
</style>
