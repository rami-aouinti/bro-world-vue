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

const props = withDefaults(
  defineProps<{
    model: CoverPageModel
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

const designVars = computed(() => buildCoverDesignVars('cp', props))
</script>

<template>
  <article
    class="cover-page-sidebar text-dark"
    :style="{
      '--cp-page': props.palette.page,
      '--cp-accent': props.palette.accent,
      '--cp-soft': props.palette.soft,
      '--cp-text': props.palette.text,
      ...designVars,
    }"
  >
    <aside>
      <p>{{ props.model.date }}</p>
      <h2>{{ props.model.role }}</h2>
      <div class="cover-page-sidebar__meta">
        <p>{{ props.model.location }}</p>
        <p>{{ props.model.email }}</p>
        <p>{{ props.model.phone }}</p>
      </div>
    </aside>

    <section>
      <h1>{{ props.model.fullName }}</h1>
      <div class="cover-page-sidebar__pill">Cover Page</div>
      <p>{{ props.model.summary }}</p>
    </section>
  </article>
</template>

<style scoped>
.cover-page-sidebar {
  font-family: var(--cp-font-family, 'Inter', 'Segoe UI', sans-serif);
  font-style: var(--cp-font-style, normal);
  font-weight: var(--cp-font-weight, 400);
  min-height: 100%;
  border-radius: var(--cp-rounded);
  overflow: hidden;
  background: var(--cp-page);
  color: var(--cp-text);
  display: grid;
  grid-template-columns: 220px 1fr;
}
.cover-page-sidebar aside {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--cp-soft) 72%, var(--cp-page)),
    var(--cp-soft)
  );
  padding: 32px 18px;
  display: grid;
  align-content: space-between;
  gap: 18px;
  border-right: var(--cp-divider-width) var(--cp-divider-style)
    color-mix(in srgb, var(--cp-accent) 20%, transparent);
}
.cover-page-sidebar h2 {
  color: var(--cp-accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.86rem;
}
.cover-page-sidebar__meta {
  display: grid;
  gap: 6px;
  font-size: 0.9rem;
}
.cover-page-sidebar section {
  padding: 48px 44px;
  display: grid;
  align-content: center;
  gap: 16px;
  background: linear-gradient(
    160deg,
    transparent 0 60%,
    color-mix(in srgb, var(--cp-soft) 30%, transparent) 100%
  );
}
.cover-page-sidebar__pill {
  display: inline-flex;
  justify-self: start;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: color-mix(in srgb, var(--cp-soft) 75%, white);
  color: color-mix(in srgb, var(--cp-accent) 75%, black);
}
.cover-page-sidebar h1 {
  font-size: 2.6rem;
  line-height: 1.05;
}
@media (max-width: 960px) {
  .cover-page-sidebar {
    grid-template-columns: 1fr;
  }
  .cover-page-sidebar aside {
    border-right: 0;
    border-bottom: var(--cp-divider-width) var(--cp-divider-style)
      color-mix(in srgb, var(--cp-accent) 20%, transparent);
  }
}
</style>
