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
    class="cover-letter-premium text-dark"
    :class="`cover-letter-premium--${typography}`"
    :style="{
      '--cl-page': palette.page,
      '--cl-accent': palette.accent,
      '--cl-soft': palette.soft,
      '--cl-text': palette.text,
      '--cl-rounded': rounded,
    }"
  >
    <header>
      <p>{{ model.date }}</p>
      <h1>{{ model.fullName }}</h1>
      <h2>{{ model.role }}</h2>
    </header>

    <section>
      <p>{{ model.recipient }}</p>
      <p>{{ model.company }}</p>
      <p>{{ model.intro }}</p>
      <p>{{ model.body }}</p>
      <p>{{ model.closing }}</p>
    </section>

    <footer>{{ model.email }} · {{ model.phone }}</footer>
  </article>
</template>

<style scoped>
.cover-letter-premium { min-height: 100%; border-radius: var(--cl-rounded); background: linear-gradient(170deg, color-mix(in srgb, var(--cl-soft) 75%, var(--cl-page)) 0 26%, var(--cl-page) 26%); color: var(--cl-text); padding: 44px 48px; display: grid; grid-template-rows: auto 1fr auto; gap: 20px; }
.cover-letter-premium header p { letter-spacing: .08em; text-transform: uppercase; font-size: .75rem; }
.cover-letter-premium h1 { color: var(--cl-accent); font-size: 2.15rem; }
.cover-letter-premium h2 { text-transform: uppercase; letter-spacing: .06em; font-size: .88rem; }
.cover-letter-premium section { display: grid; gap: 12px; line-height: 1.62; }
.cover-letter-premium footer { padding-top: 14px; border-top: 1px solid color-mix(in srgb, var(--cl-accent) 20%, transparent); }
.cover-letter-premium--serif { font-family: Georgia, 'Times New Roman', serif; }
.cover-letter-premium--sans { font-family: Inter, 'Segoe UI', sans-serif; }
</style>
