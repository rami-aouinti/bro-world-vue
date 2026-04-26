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
}>(), {
  typography: 'sans',
})
</script>

<template>
  <article
    class="cover-letter-classic"
    :class="`cover-letter-classic--${typography}`"
    :style="{
      '--cl-page': palette.page,
      '--cl-accent': palette.accent,
      '--cl-soft': palette.soft,
      '--cl-text': palette.text,
    }"
  >
    <header>
      <h1>{{ model.fullName }}</h1>
      <p>{{ model.role }} · {{ model.email }} · {{ model.phone }}</p>
    </header>

    <div class="cover-letter-classic__recipient">
      <p>{{ model.date }}</p>
      <p>{{ model.recipient }}</p>
      <p>{{ model.company }}</p>
    </div>

    <section>
      <p>{{ model.intro }}</p>
      <p>{{ model.body }}</p>
      <p>{{ model.closing }}</p>
    </section>
  </article>
</template>

<style scoped>
.cover-letter-classic { background: var(--cl-page); color: var(--cl-text); min-height: 100%; padding: 40px 46px; border-radius: 14px; }
.cover-letter-classic header { border-bottom: 2px solid var(--cl-soft); padding-bottom: 14px; margin-bottom: 24px; }
.cover-letter-classic h1 { color: var(--cl-accent); font-size: 1.9rem; }
.cover-letter-classic__recipient { margin-bottom: 18px; }
.cover-letter-classic section { display: grid; gap: 12px; line-height: 1.6; }
.cover-letter-classic--serif { font-family: Georgia, 'Times New Roman', serif; }
.cover-letter-classic--sans { font-family: Inter, 'Segoe UI', sans-serif; }
</style>
