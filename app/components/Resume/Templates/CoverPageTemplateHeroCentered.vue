<script setup lang="ts">
import { buildCoverDesignVars, type CoverLayoutSettings } from '~/composables/useResumeCoverDesign'

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

const props = withDefaults(defineProps<{
  model: CoverPageModel
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

const designVars = computed(() => buildCoverDesignVars('cp', props))
</script>

<template>
  <article
    class="cover-page-hero text-dark"
    :style="{
      '--cp-page': props.palette.page,
      '--cp-accent': props.palette.accent,
      '--cp-soft': props.palette.soft,
      '--cp-text': props.palette.text,
      ...designVars,
    }"
  >
    <p class="cover-page-hero__date">{{ props.model.date }}</p>

    <div class="cover-page-hero__identity">
      <v-avatar v-if="props.model.photoUrl" size="138" class="cover-page-hero__avatar">
        <v-img :src="props.model.photoUrl" cover />
      </v-avatar>

      <div class="cover-page-hero__name-block">
        <h1>{{ props.model.fullName }}</h1>
        <h2>{{ props.model.role }}</h2>
      </div>
    </div>

    <p class="cover-page-hero__summary">{{ props.model.summary }}</p>

    <footer>
      <span>{{ props.model.location }}</span>
      <span>{{ props.model.email }}</span>
      <span>{{ props.model.phone }}</span>
    </footer>
  </article>
</template>

<style scoped>
.cover-page-hero {
  font-family: var(--cp-font-family, 'Inter', 'Segoe UI', sans-serif);
  font-style: var(--cp-font-style, normal);
  font-weight: var(--cp-font-weight, 400);
  min-height: 100%;
  border-radius: var(--cp-rounded);
  border: 1px solid color-mix(in srgb, var(--cp-accent) 20%, transparent);
  background:
    linear-gradient(168deg, color-mix(in srgb, var(--cp-soft) 88%, white) 0 34%, transparent 34%),
    var(--cp-page);
  color: var(--cp-text);
  padding: 56px 52px;
  display: grid;
  gap: 20px;
  box-shadow: 0 12px 40px color-mix(in srgb, var(--cp-accent) 15%, transparent);
}

.cover-page-hero__date {
  justify-self: start;
  letter-spacing: .12em;
  text-transform: uppercase;
  font-size: .78rem;
  color: color-mix(in srgb, var(--cp-text) 62%, white);
}

.cover-page-hero__identity {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 28px;
}

.cover-page-hero__avatar {
  border: 6px solid color-mix(in srgb, var(--cp-soft) 76%, white);
  box-shadow: 0 8px 20px color-mix(in srgb, var(--cp-accent) 12%, transparent);
}

.cover-page-hero__name-block {
  display: grid;
  gap: 10px;
}

.cover-page-hero h1 {
  font-size: clamp(2rem, 4vw, 2.9rem);
  line-height: 1.03;
  margin: 0;
  color: color-mix(in srgb, var(--cp-accent) 86%, black);
}

.cover-page-hero h2 {
  text-transform: uppercase;
  letter-spacing: .14em;
  font-size: .88rem;
  margin: 0;
  color: color-mix(in srgb, var(--cp-accent) 72%, white);
}

.cover-page-hero__summary {
  max-width: 62ch;
  margin: 0;
  line-height: 1.75;
}

.cover-page-hero footer {
  margin-top: auto;
  display: grid;
  gap: 8px;
  font-size: .92rem;
  color: color-mix(in srgb, var(--cp-text) 92%, white);
}
</style>
