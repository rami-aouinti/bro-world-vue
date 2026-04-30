<script setup lang="ts">
import { buildCoverDesignVars, type CoverLayoutSettings } from '~/composables/useResumeCoverDesign'

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

const props = withDefaults(defineProps<{
  model: CoverLetterModel
  palette: Palette
  typography?: 'sans' | 'serif'
  textStyle?: 'clean' | 'italic' | 'serif' | 'mono' | 'display'
  rounded?: string
  layoutSettings?: CoverLayoutSettings
}>(), {
  typography: 'sans',
  textStyle: 'clean',
  rounded: 'md',
  layoutSettings: () => ({}),
})

const designVars = computed(() => buildCoverDesignVars('cl', props))
</script>

<template>
  <article
    class="cover-letter-premium text-dark"
    :style="{
      '--cl-page': props.palette.page,
      '--cl-accent': props.palette.accent,
      '--cl-soft': props.palette.soft,
      '--cl-text': props.palette.text,
      ...designVars,
    }"
  >
    <header>
      <p>{{ props.model.date }}</p>
      <h1>{{ props.model.fullName }}</h1>
      <h2>{{ props.model.role }}</h2>
      <div class="cover-letter-premium__contact">{{ props.model.email }} · {{ props.model.phone }}</div>
    </header>

    <section>
      <div class="cover-letter-premium__recipient">
        <p>{{ props.model.recipient }}</p>
        <p>{{ props.model.company }}</p>
      </div>
      <p>{{ props.model.intro }}</p>
      <p>{{ props.model.body }}</p>
      <p>{{ props.model.closing }}</p>
    </section>

    <footer>Sincerely,<br>{{ props.model.fullName }}</footer>
  </article>
</template>

<style scoped>
.cover-letter-premium {
  font-family: var(--cl-font-family, 'Inter', 'Segoe UI', sans-serif);
  font-style: var(--cl-font-style, normal);
  font-weight: var(--cl-font-weight, 400);
  min-height: 100%;
  border-radius: var(--cl-rounded);
  border: 1px solid color-mix(in srgb, var(--cl-accent) 24%, transparent);
  background:
    linear-gradient(166deg, color-mix(in srgb, var(--cl-soft) 90%, white) 0 27%, transparent 27%),
    var(--cl-page);
  color: var(--cl-text);
  padding: 42px 50px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 22px;
}

.cover-letter-premium header {
  display: grid;
  gap: 7px;
}

.cover-letter-premium header p {
  letter-spacing: .11em;
  text-transform: uppercase;
  font-size: .75rem;
  margin: 0;
  color: color-mix(in srgb, var(--cl-text) 65%, white);
}

.cover-letter-premium h1 {
  margin: 0;
  color: color-mix(in srgb, var(--cl-accent) 86%, black);
  font-size: clamp(2rem, 3vw, 2.4rem);
  line-height: 1.05;
}

.cover-letter-premium h2 {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: .14em;
  font-size: .88rem;
  color: color-mix(in srgb, var(--cl-accent) 70%, white);
}

.cover-letter-premium__contact {
  margin-top: 8px;
  font-size: .82rem;
}

.cover-letter-premium section {
  display: grid;
  gap: 14px;
  line-height: 1.7;
}

.cover-letter-premium__recipient {
  display: inline-grid;
  gap: 4px;
  background: color-mix(in srgb, var(--cl-soft) 72%, white);
  border-left: 4px solid color-mix(in srgb, var(--cl-accent) 65%, transparent);
  padding: 10px 14px;
  margin-bottom: 4px;
}

.cover-letter-premium__recipient p {
  margin: 0;
}

.cover-letter-premium footer {
  padding-top: 14px;
  border-top: var(--cl-divider-width) var(--cl-divider-style) color-mix(in srgb, var(--cl-accent) 24%, transparent);
  font-weight: 500;
}
</style>
