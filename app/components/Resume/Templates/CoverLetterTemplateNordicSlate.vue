<script setup lang="ts">
import type { CoverPalette } from '~/constants/resumeCoverPalette'

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

const props = defineProps<{
  model: CoverLetterModel
  palette: CoverPalette
}>()
</script>

<template>
  <article class="cover-letter-nordic text-dark" :style="props.palette.style">
    <aside>
      <h1>{{ props.model.fullName }}</h1>
      <h2>{{ props.model.role }}</h2>
      <p>{{ props.model.email }}</p>
      <p>{{ props.model.phone }}</p>
    </aside>
    <section>
      <p class="cover-letter-nordic__date">{{ props.model.date }}</p>
      <p><strong>{{ props.model.recipient }}</strong><span v-if="props.model.company"> · {{ props.model.company }}</span></p>
      <p>{{ props.model.intro }}</p>
      <p>{{ props.model.body }}</p>
      <p>{{ props.model.closing }}</p>
      <footer>{{ props.model.fullName }}</footer>
    </section>
  </article>
</template>

<style scoped>
.cover-letter-nordic { min-height: 100%; display: grid; grid-template-columns: minmax(160px, 30%) 1fr; border-radius: var(--resume-radius, 16px); overflow: hidden; border: 1px solid color-mix(in srgb, var(--resume-secondary, #0f172a) 24%, transparent); }
.cover-letter-nordic aside { padding: 1.4rem 1rem; background: linear-gradient(170deg, color-mix(in srgb, var(--resume-secondary, #0f172a) 16%, var(--resume-page, #fff)), color-mix(in srgb, var(--resume-accent, #3b82f6) 12%, var(--resume-page, #fff))); }
.cover-letter-nordic h1 { margin: 0; font-size: 1.15rem; }
.cover-letter-nordic h2 { margin: .3rem 0 1rem; font-size: .84rem; text-transform: uppercase; letter-spacing: .08em; opacity: .75; }
.cover-letter-nordic section { padding: 1.4rem 1.3rem; display: grid; gap: .8rem; }
.cover-letter-nordic__date { font-size: .84rem; opacity: .7; }
.cover-letter-nordic footer { margin-top: .45rem; font-weight: 700; }
@media (max-width: 720px) { .cover-letter-nordic { grid-template-columns: 1fr; } }
</style>
