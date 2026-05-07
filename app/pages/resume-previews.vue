<script setup lang="ts">
import { RESUME_TEMPLATES_CATALOG } from '~/constants/resumeTemplates.catalog'

const { t } = useI18n()

definePageMeta({
  title: 'Resume Template Previews',
  description: 'Resume template previews',
  keywords: 'resume templates',
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  sitemap: { changefreq: 'weekly', priority: 0.6 },
})

useHead(() => ({
  title: t('resumePreview.templates.metaTitle'),
  meta: [
    {
      name: 'description',
      content: t('resumePreview.templates.metaDescription'),
    },
    {
      name: 'keywords',
      content: t('resumePreview.templates.metaKeywords'),
    },
  ],
}))

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
    <h1>{{ t('resumePreview.templates.heading') }}</h1>
    <p>{{ t('resumePreview.templates.subheading') }}</p>

    <section class="filters">
      <label>
        {{ t('resumePreview.templates.filters.layout') }}
        <select v-model="layoutFilter">
          <option value="all">{{ t('resumePreview.templates.filters.all') }}</option>
          <option value="aside">{{ t('resumePreview.templates.filters.layoutAside') }}</option>
          <option value="no-aside">{{ t('resumePreview.templates.filters.layoutNoAside') }}</option>
          <option value="aside-left">{{ t('resumePreview.templates.filters.layoutAsideLeft') }}</option>
          <option value="aside-right">{{ t('resumePreview.templates.filters.layoutAsideRight') }}</option>
          <option value="bar-left">{{ t('resumePreview.templates.filters.layoutBarLeft') }}</option>
          <option value="bar-light">{{ t('resumePreview.templates.filters.layoutBarLight') }}</option>
          <option value="aside-split">{{ t('resumePreview.templates.filters.layoutAsideSplit') }}</option>
          <option value="no-aside-split">{{ t('resumePreview.templates.filters.layoutNoAsideSplit') }}</option>
        </select>
      </label>
      <label>
        {{ t('resumePreview.templates.filters.themeLine') }}
        <select v-model="lineFilter">
          <option value="all">{{ t('resumePreview.templates.filters.all') }}</option>
          <option value="soft">{{ t('resumePreview.templates.filters.lineSoft') }}</option>
          <option value="none">{{ t('resumePreview.templates.filters.lineNone') }}</option>
          <option value="block">{{ t('resumePreview.templates.filters.lineBlock') }}</option>
        </select>
      </label>
      <label>
        {{ t('resumePreview.templates.filters.themeDensity') }}
        <select v-model="densityFilter">
          <option value="all">{{ t('resumePreview.templates.filters.all') }}</option>
          <option value="comfortable">{{ t('resumePreview.templates.filters.densityComfortable') }}</option>
          <option value="compact">{{ t('resumePreview.templates.filters.densityCompact') }}</option>
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
          <li><strong>{{ t('resumePreview.templates.labels.structure') }}:</strong> {{ template.structureId }}</li>
          <li><strong>{{ t('resumePreview.templates.labels.layout') }}:</strong> {{ template.layoutId }}</li>
          <li><strong>{{ t('resumePreview.templates.labels.skin') }}:</strong> {{ template.skinId }}</li>
          <li>
            <strong>{{ t('resumePreview.templates.labels.line') }}:</strong>
            {{ (template as any).theme?.line ?? (template as any).line ?? '-' }}
          </li>
          <li>
            <strong>{{ t('resumePreview.templates.labels.density') }}:</strong>
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
