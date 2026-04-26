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
    class="cover-page-terra"
    :class="`cover-page-terra--${typography}`"
    :style="{
      '--cp-page': palette.page,
      '--cp-accent': palette.accent,
      '--cp-soft': palette.soft,
      '--cp-text': palette.text,
    }"
  >
    <aside class="cover-page-terra__sidebar">
      <v-avatar v-if="model.photoUrl" size="110" class="mb-4">
        <v-img :src="model.photoUrl" cover />
      </v-avatar>
      <p>{{ model.location }}</p>
      <p>{{ model.email }}</p>
      <p>{{ model.phone }}</p>
    </aside>

    <section class="cover-page-terra__content">
      <p class="cover-page-terra__date">{{ model.date }}</p>
      <h1>{{ model.fullName }}</h1>
      <h2>{{ model.role }}</h2>
      <p>{{ model.summary }}</p>
    </section>
  </article>
</template>

<style scoped>
.cover-page-terra { display: grid; grid-template-columns: 180px 1fr; background: var(--cp-page); color: var(--cp-text); min-height: 100%; border-radius: 14px; overflow: hidden; }
.cover-page-terra__sidebar { background: var(--cp-soft); padding: 28px 18px; display: flex; flex-direction: column; gap: 8px; }
.cover-page-terra__content { padding: 38px; display: flex; flex-direction: column; gap: 14px; }
.cover-page-terra__date { color: color-mix(in srgb, var(--cp-text) 70%, white); }
.cover-page-terra h1 { font-size: 2rem; color: var(--cp-accent); }
.cover-page-terra h2 { font-size: 1.05rem; text-transform: uppercase; letter-spacing: .05em; }
.cover-page-terra--serif { font-family: Georgia, 'Times New Roman', serif; }
.cover-page-terra--sans { font-family: Inter, 'Segoe UI', sans-serif; }
@media (max-width: 960px) { .cover-page-terra { grid-template-columns: 1fr; } }
</style>
