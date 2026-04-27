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
    class="cover-letter-split text-dark"
    :class="`cover-letter-split--${typography}`"
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
      <p>{{ model.date }}</p>
    </aside>

    <section>
      <p>{{ model.recipient }} · {{ model.company }}</p>
      <p>{{ model.intro }}</p>
      <p>{{ model.body }}</p>
      <p>{{ model.closing }}</p>
    </section>
  </article>
</template>

<style scoped>
.cover-letter-split { min-height: 100%; border-radius: var(--cl-rounded); overflow: hidden; display: grid; grid-template-columns: 1fr 1.4fr; background: var(--cl-page); color: var(--cl-text); }
.cover-letter-split aside { background: color-mix(in srgb, var(--cl-soft) 72%, var(--cl-page)); padding: 30px 24px; display: grid; align-content: start; gap: 8px; border-right: 1px solid color-mix(in srgb, var(--cl-accent) 20%, transparent); }
.cover-letter-split h2 { color: var(--cl-accent); font-size: 1.3rem; margin-bottom: 4px; }
.cover-letter-split section { padding: 34px 36px; display: grid; gap: 12px; line-height: 1.6; }
.cover-letter-split section p:first-child { text-transform: uppercase; letter-spacing: .07em; font-size: .78rem; }
.cover-letter-split--serif { font-family: Georgia, 'Times New Roman', serif; }
.cover-letter-split--sans { font-family: Inter, 'Segoe UI', sans-serif; }
@media (max-width: 960px) { .cover-letter-split { grid-template-columns: 1fr; } .cover-letter-split aside { border-right: 0; border-bottom: 1px solid color-mix(in srgb, var(--cl-accent) 20%, transparent); } }
</style>
