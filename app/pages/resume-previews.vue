<script setup lang="ts">
import { RESUME_TEMPLATES_CATALOG } from '~/constants/resumeTemplates.catalog'

definePageMeta({
  title: 'Resume Template Previews',
  description:
    'Preview Bro World resume templates by layout, style, density, and professional CV design options.',
  keywords:
    'resume templates, CV templates, resume preview, professional CV, Bro World resume builder',
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  sitemap: { changefreq: 'weekly', priority: 0.6 },
})

const allResumeTemplates = RESUME_TEMPLATES_CATALOG.filter(
  (template) => template.type === 'resume',
)

const layoutFilter = ref<
  | 'all'
  | 'aside'
  | 'no-aside'
  | 'aside-left'
  | 'aside-right'
  | 'bar-left'
  | 'bar-light'
  | 'aside-split'
  | 'no-aside-split'
>('all')
const lineFilter = ref<'all' | 'soft' | 'none' | 'block'>('all')
const densityFilter = ref<'all' | 'comfortable' | 'compact'>('all')

const filteredResumeTemplates = computed(() =>
  allResumeTemplates.filter((template) => {
    const config = template as any
    const themeLine = config.theme?.line ?? config.line
    const themeDensity = config.theme?.density ?? config.density

    const layoutMatch =
      layoutFilter.value === 'all' ||
      (template as any).layout === layoutFilter.value
    const lineMatch =
      lineFilter.value === 'all' || themeLine === lineFilter.value
    const densityMatch =
      densityFilter.value === 'all' || themeDensity === densityFilter.value

    return layoutMatch && lineMatch && densityMatch
  }),
)
</script>

<template>
  <main class="resume-previews-page">
    <h1>Resume template previews</h1>
    <p>Visual checks for template thumbnails and main settings.</p>

    <section class="filters">
      <label>
        Layout
        <select v-model="layoutFilter">
          <option value="all">All</option>
          <option value="aside">Aside</option>
          <option value="no-aside">No Aside</option>
          <option value="aside-left">Aside Left</option>
          <option value="aside-right">Aside Right</option>
          <option value="bar-left">Bar Left</option>
          <option value="bar-light">Bar Light</option>
          <option value="aside-split">Aside Split</option>
          <option value="no-aside-split">No Aside Split</option>
        </select>
      </label>
      <label>
        Theme line
        <select v-model="lineFilter">
          <option value="all">All</option>
          <option value="soft">Soft</option>
          <option value="none">None</option>
          <option value="block">Block</option>
        </select>
      </label>
      <label>
        Theme density
        <select v-model="densityFilter">
          <option value="all">All</option>
          <option value="comfortable">Comfortable</option>
          <option value="compact">Compact</option>
        </select>
      </label>
    </section>

    <section class="grid">
      <article
        v-for="template in filteredResumeTemplates"
        :key="template.id"
        class="card"
      >
        <img
          :src="template.image"
          :alt="`Preview ${template.label}`"
          loading="lazy"
        />
        <h2>{{ template.label }}</h2>
        <p>{{ template.subtitle }}</p>
        <ul>
          <li><strong>Structure:</strong> {{ template.structureId }}</li>
          <li><strong>Layout:</strong> {{ template.layoutId }}</li>
          <li><strong>Skin:</strong> {{ template.skinId }}</li>
          <li>
            <strong>Line:</strong>
            {{ (template as any).theme?.line ?? (template as any).line ?? '-' }}
          </li>
          <li>
            <strong>Density:</strong>
            {{
              (template as any).theme?.density ??
              (template as any).density ??
              '-'
            }}
          </li>
        </ul>
      </article>
    </section>
  </main>
</template>

<style scoped>
.resume-previews-page {
  padding: 24px;
}
.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.filters label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
}
img {
  width: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
h2 {
  margin: 10px 0 6px;
  font-size: 1rem;
}
p {
  margin: 0 0 8px;
  color: #4b5563;
  font-size: 0.9rem;
}
ul {
  margin: 0;
  padding-left: 16px;
  color: #374151;
  font-size: 0.85rem;
}
</style>
