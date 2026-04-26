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
}>(), {
  typography: 'sans',
})
</script>

<template>
  <article
    class="cover-page-elegant"
    :class="`cover-page-elegant--${typography}`"
    :style="{
      '--cp-page': palette.page,
      '--cp-accent': palette.accent,
      '--cp-soft': palette.soft,
      '--cp-text': palette.text,
    }"
  >
    <p class="cover-page-elegant__date">{{ model.date }}</p>
    <h1>{{ model.fullName }}</h1>
    <h2>{{ model.role }}</h2>
    <p class="cover-page-elegant__summary">{{ model.summary }}</p>
    <div class="cover-page-elegant__meta">
      <span>{{ model.location }}</span>
      <span>{{ model.email }}</span>
      <span>{{ model.phone }}</span>
    </div>
  </article>
</template>

<style scoped>
.cover-page-elegant { min-height: 100%; padding: 56px 64px; background: linear-gradient(160deg, var(--cp-soft) 0 28%, var(--cp-page) 28%); color: var(--cp-text); border-radius: 14px; display: flex; flex-direction: column; gap: 16px; justify-content: center; }
.cover-page-elegant__date { text-transform: uppercase; letter-spacing: .06em; }
.cover-page-elegant h1 { font-size: 2.4rem; color: var(--cp-accent); }
.cover-page-elegant h2 { text-transform: uppercase; letter-spacing: .08em; font-size: .9rem; }
.cover-page-elegant__summary { max-width: 56ch; }
.cover-page-elegant__meta { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; }
.cover-page-elegant--serif { font-family: Georgia, 'Times New Roman', serif; }
.cover-page-elegant--sans { font-family: Inter, 'Segoe UI', sans-serif; }
</style>
