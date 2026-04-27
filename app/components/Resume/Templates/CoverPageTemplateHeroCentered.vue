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
    class="cover-page-hero text-dark"
    :class="`cover-page-hero--${typography}`"
    :style="{
      '--cp-page': palette.page,
      '--cp-accent': palette.accent,
      '--cp-soft': palette.soft,
      '--cp-text': palette.text,
      '--cp-rounded': rounded,
    }"
  >
    <p class="cover-page-hero__date">{{ model.date }}</p>

    <v-avatar v-if="model.photoUrl" size="124" class="mx-auto">
      <v-img :src="model.photoUrl" cover />
    </v-avatar>

    <h1>{{ model.fullName }}</h1>
    <h2>{{ model.role }}</h2>
    <p class="cover-page-hero__summary">{{ model.summary }}</p>

    <footer>
      <span>{{ model.location }}</span>
      <span>{{ model.email }}</span>
      <span>{{ model.phone }}</span>
    </footer>
  </article>
</template>

<style scoped>
.cover-page-hero { min-height: 100%; border-radius: var(--cp-rounded); background: radial-gradient(circle at top, color-mix(in srgb, var(--cp-soft) 76%, var(--cp-page)), var(--cp-page)); color: var(--cp-text); padding: 56px 48px; display: grid; text-align: center; align-content: center; gap: 14px; }
.cover-page-hero__date { letter-spacing: .08em; text-transform: uppercase; font-size: .78rem; color: color-mix(in srgb, var(--cp-text) 68%, white); }
.cover-page-hero h1 { font-size: 2.45rem; color: var(--cp-accent); line-height: 1.08; }
.cover-page-hero h2 { text-transform: uppercase; letter-spacing: .07em; font-size: .95rem; }
.cover-page-hero__summary { max-width: 52ch; margin: 0 auto; }
.cover-page-hero footer { margin-top: 18px; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 18px; font-size: .92rem; }
.cover-page-hero--serif { font-family: Georgia, 'Times New Roman', serif; }
.cover-page-hero--sans { font-family: Inter, 'Segoe UI', sans-serif; }
</style>
