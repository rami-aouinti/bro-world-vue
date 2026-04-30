<script setup lang="ts">
import {
  buildCoverDesignVars,
  type CoverLayoutSettings,
} from '~/composables/useResumeCoverDesign'

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

const props = withDefaults(
  defineProps<{
    model: CoverLetterModel
    palette: Palette
    typography?: 'sans' | 'serif'
    textStyle?: 'clean' | 'italic' | 'serif' | 'mono' | 'display'
    rounded?: string
    layoutSettings?: CoverLayoutSettings
  }>(),
  {
    typography: 'sans',
    textStyle: 'clean',
    rounded: 'md',
    layoutSettings: () => ({}),
  },
)

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
    <header class="cover-letter-premium__hero">
      <div>
        <p>{{ props.model.date }}</p>
        <h1>{{ props.model.fullName }}</h1>
        <h2>{{ props.model.role }}</h2>
      </div>
      <div class="cover-letter-premium__contact">
        {{ props.model.email }}<br />{{ props.model.phone }}
      </div>
    </header>

    <section>
      <div class="cover-letter-premium__recipient">
        <p>TO:</p>
        <p>{{ props.model.recipient }}</p>
        <p>{{ props.model.company }}</p>
      </div>
      <p>{{ props.model.intro }}</p>
      <p>{{ props.model.body }}</p>
      <p>{{ props.model.closing }}</p>
    </section>

    <footer>
      Sincerely,<br /><span>{{ props.model.fullName }}</span>
    </footer>
  </article>
</template>

<style scoped>
.cover-letter-premium {
  font-family: var(--cl-font-family, 'Inter', 'Segoe UI', sans-serif);
  min-height: 100%;
  border-radius: var(--cl-rounded);
  background: color-mix(in srgb, var(--cl-page) 93%, white);
  color: var(--cl-text);
  border: 1px solid color-mix(in srgb, var(--cl-accent) 24%, transparent);
  display: grid;
  grid-template-rows: auto 1fr auto;
}
.cover-letter-premium__hero {
  background: linear-gradient(
    120deg,
    color-mix(in srgb, var(--cl-accent) 88%, black),
    color-mix(in srgb, var(--cl-accent) 52%, black)
  );
  color: white;
  padding: 30px 40px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 18px;
}
.cover-letter-premium__hero p {
  margin: 0;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 0.74rem;
}
.cover-letter-premium h1 {
  margin: 8px 0 0;
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1.04;
}
.cover-letter-premium h2 {
  margin: 8px 0 0;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-size: 0.85rem;
}
.cover-letter-premium__contact {
  align-self: end;
  text-align: right;
  font-size: 0.86rem;
  line-height: 1.6;
}
.cover-letter-premium section {
  padding: 30px 40px;
  display: grid;
  gap: 14px;
  line-height: 1.75;
}
.cover-letter-premium__recipient {
  justify-self: end;
  text-align: right;
  background: color-mix(in srgb, var(--cl-soft) 72%, white);
  padding: 10px 14px;
  border-left: 4px solid color-mix(in srgb, var(--cl-accent) 65%, transparent);
}
.cover-letter-premium__recipient p {
  margin: 0;
}
.cover-letter-premium footer {
  margin: 0 40px 24px;
  padding-top: 14px;
  border-top: var(--cl-divider-width) var(--cl-divider-style)
    color-mix(in srgb, var(--cl-accent) 24%, transparent);
}
.cover-letter-premium footer span {
  font-size: 1.08rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}
</style>
