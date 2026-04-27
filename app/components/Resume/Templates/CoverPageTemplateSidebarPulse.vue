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
    class="cover-page-sidebar text-dark"
    :class="`cover-page-sidebar--${typography}`"
    :style="{
      '--cp-page': palette.page,
      '--cp-accent': palette.accent,
      '--cp-soft': palette.soft,
      '--cp-text': palette.text,
      '--cp-rounded': rounded,
    }"
  >
    <aside>
      <p>{{ model.date }}</p>
      <h2>{{ model.role }}</h2>
      <div class="cover-page-sidebar__meta">
        <p>{{ model.location }}</p>
        <p>{{ model.email }}</p>
        <p>{{ model.phone }}</p>
      </div>
    </aside>

    <section>
      <h1>{{ model.fullName }}</h1>
      <p>{{ model.summary }}</p>
    </section>
  </article>
</template>

<style scoped>
.cover-page-sidebar { min-height: 100%; border-radius: var(--cp-rounded); overflow: hidden; background: var(--cp-page); color: var(--cp-text); display: grid; grid-template-columns: 220px 1fr; }
.cover-page-sidebar aside { background: linear-gradient(180deg, color-mix(in srgb, var(--cp-soft) 72%, var(--cp-page)), var(--cp-soft)); padding: 32px 18px; display: grid; align-content: space-between; gap: 18px; border-right: 1px solid color-mix(in srgb, var(--cp-accent) 20%, transparent); }
.cover-page-sidebar h2 { color: var(--cp-accent); text-transform: uppercase; letter-spacing: .08em; font-size: .86rem; }
.cover-page-sidebar__meta { display: grid; gap: 6px; font-size: .9rem; }
.cover-page-sidebar section { padding: 48px 44px; display: grid; align-content: center; gap: 16px; }
.cover-page-sidebar h1 { font-size: 2.6rem; line-height: 1.05; }
.cover-page-sidebar--serif { font-family: Georgia, 'Times New Roman', serif; }
.cover-page-sidebar--sans { font-family: Inter, 'Segoe UI', sans-serif; }
@media (max-width: 960px) { .cover-page-sidebar { grid-template-columns: 1fr; } .cover-page-sidebar aside { border-right: 0; border-bottom: 1px solid color-mix(in srgb, var(--cp-accent) 20%, transparent); } }
</style>
