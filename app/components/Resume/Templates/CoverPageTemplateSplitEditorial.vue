<script setup lang="ts">
type Palette = {
  page: string
  accent: string
  soft: string
  text: string
}

type CoverPageModel = {
  fullName: string
  role: string
  summary: string
  location: string
  email: string
  phone: string
  date: string
  photoUrl?: string
}

withDefaults(defineProps<{
  model: CoverPageModel
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
    class="cover-page-split text-dark"
    :class="`cover-page-split--${typography}`"
    :style="{
      '--cp-page': palette.page,
      '--cp-accent': palette.accent,
      '--cp-soft': palette.soft,
      '--cp-text': palette.text,
      '--cp-rounded': rounded,
    }"
  >
    <section class="cover-page-split__left">
      <p>{{ model.date }}</p>
      <h1>{{ model.fullName }}</h1>
      <h2>{{ model.role }}</h2>
    </section>

    <section class="cover-page-split__right">
      <p>{{ model.summary }}</p>
      <div>
        <p>{{ model.location }}</p>
        <p>{{ model.email }}</p>
        <p>{{ model.phone }}</p>
      </div>
    </section>
  </article>
</template>

<style scoped>
.cover-page-split { min-height: 100%; border-radius: var(--cp-rounded); overflow: hidden; color: var(--cp-text); display: grid; grid-template-columns: 1.2fr 1fr; background: var(--cp-page); }
.cover-page-split__left { padding: 52px 42px; background: color-mix(in srgb, var(--cp-soft) 68%, var(--cp-page)); display: grid; align-content: center; gap: 10px; border-right: 1px solid color-mix(in srgb, var(--cp-accent) 24%, transparent); }
.cover-page-split__left p { font-size: .82rem; letter-spacing: .08em; text-transform: uppercase; }
.cover-page-split__left h1 { font-size: 2.7rem; line-height: 1.03; color: var(--cp-accent); }
.cover-page-split__left h2 { text-transform: uppercase; letter-spacing: .08em; font-size: .9rem; }
.cover-page-split__right { padding: 52px 38px; display: grid; align-content: center; gap: 20px; }
.cover-page-split__right div { display: grid; gap: 6px; }
.cover-page-split--serif { font-family: Georgia, 'Times New Roman', serif; }
.cover-page-split--sans { font-family: Inter, 'Segoe UI', sans-serif; }
@media (max-width: 960px) { .cover-page-split { grid-template-columns: 1fr; } .cover-page-split__left { border-right: 0; border-bottom: 1px solid color-mix(in srgb, var(--cp-accent) 24%, transparent); } }
</style>
