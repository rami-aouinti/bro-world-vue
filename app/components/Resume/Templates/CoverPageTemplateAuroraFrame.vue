<script setup lang="ts">
import type { CoverPalette } from '~/constants/resumeCoverPalette'

type CoverPageModel = {
  fullName: string
  role: string
  summary: string
  location: string
  email: string
  phone: string
  date: string
  photoUrl: string
}

const props = defineProps<{
  model: CoverPageModel
  palette: CoverPalette
}>()
</script>

<template>
  <article class="cover-page-aurora text-dark" :style="props.palette.style">
    <div class="cover-page-aurora__glow cover-page-aurora__glow--top" aria-hidden="true" />
    <div class="cover-page-aurora__glow cover-page-aurora__glow--bottom" aria-hidden="true" />

    <header>
      <p class="cover-page-aurora__date">{{ props.model.date }}</p>
      <h1>{{ props.model.fullName }}</h1>
      <h2>{{ props.model.role }}</h2>
    </header>

    <section>
      <p>{{ props.model.summary }}</p>
    </section>

    <footer>
      <span>{{ props.model.location }}</span>
      <span>{{ props.model.email }}</span>
      <span>{{ props.model.phone }}</span>
    </footer>
  </article>
</template>

<style scoped>
.cover-page-aurora {
  position: relative;
  min-height: 100%;
  padding: clamp(1.2rem, 2.8vw, 2.4rem);
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 1.1rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--resume-accent, #5f70ff) 26%, transparent);
  border-radius: var(--resume-radius, 18px);
}
.cover-page-aurora__glow { position: absolute; border-radius: 50%; filter: blur(2px); opacity: .5; }
.cover-page-aurora__glow--top { width: 240px; height: 240px; top: -120px; right: -60px; background: color-mix(in srgb, var(--resume-accent, #5f70ff) 30%, transparent); }
.cover-page-aurora__glow--bottom { width: 220px; height: 220px; bottom: -130px; left: -70px; background: color-mix(in srgb, var(--resume-secondary, #0ea5e9) 40%, transparent); }
.cover-page-aurora h1 { font-size: clamp(1.8rem, 5vw, 2.8rem); margin: 0; }
.cover-page-aurora h2 { margin: .3rem 0 0; letter-spacing: .1em; text-transform: uppercase; opacity: .75; font-size: .9rem; }
.cover-page-aurora__date { font-size: .84rem; opacity: .7; margin-bottom: .9rem; }
.cover-page-aurora footer { display: flex; flex-wrap: wrap; gap: .35rem .7rem; font-size: .84rem; opacity: .82; }
</style>
