<script setup lang="ts">
import { computed } from 'vue'
import { formatDateRange, sortByStartDateDescKeepingSourceOrder } from '../formatters/dateRange'
import type { ResumeSectionRendererProps } from './types'

type NormalizedItem = {
  heading: string
  subheading: string
  period: string
  description: string
}

const props = withDefaults(defineProps<ResumeSectionRendererProps>(), {
  items: () => [],
  theme: () => ({}),
  showIcon: true,
  density: 'normal',
  sectionKey: 'general',
  template: 'list',
})

const emptyMessage = computed(() => {
  const labels: Record<string, string> = {
    experience: 'Aucune expérience à afficher pour le moment.',
    education: 'Aucune formation à afficher pour le moment.',
    skills: 'Aucune compétence à afficher pour le moment.',
    projects: 'Aucun projet à afficher pour le moment.',
    certifications: 'Aucune certification à afficher pour le moment.',
    references: 'Aucune référence à afficher pour le moment.',
    interests: "Aucun centre d'intérêt à afficher pour le moment.",
    languages: 'Aucune langue à afficher pour le moment.',
    general: 'Aucun élément à afficher pour le moment.',
  }

  return labels[props.sectionKey] ?? labels.general
})

const normalizedItems = computed<NormalizedItem[]>(() => {
  const scopedItems = (props.items ?? []) as Record<string, unknown>[]
  const orderedItems =
    props.sectionKey === 'experience' || props.sectionKey === 'education'
      ? sortByStartDateDescKeepingSourceOrder(scopedItems)
      : scopedItems

  return orderedItems.map((entry) => {
    const item = (entry ?? {}) as Record<string, unknown>
    const heading =
      (item.title as string) ||
      (item.name as string) ||
      (item.role as string) ||
      (item.position as string) ||
      'Élément'

    const subheading =
      (item.company as string) ||
      (item.school as string) ||
      (item.organization as string) ||
      (item.institution as string) ||
      ''

    const start = item.startDate ?? item.start
    const end = item.endDate ?? item.end
    const period = formatDateRange(start, end)

    const description =
      (item.description as string) ||
      (item.summary as string) ||
      (item.details as string) ||
      ''

    return { heading, subheading, period, description }
  })
})
</script>

<template>
  <section class="resume-atomic-renderer" :class="[`density-${density}`, density === 'compact' ? 'mode-aside' : 'mode-main']" :style="theme">
    <p v-if="!normalizedItems.length" class="renderer-empty-state">
      {{ emptyMessage }}
    </p>

    <ol v-else-if="template === 'timeline'" class="renderer-timeline">
      <li v-for="(item, index) in normalizedItems" :key="index" class="renderer-timeline-item">
        <p v-if="item.period" class="renderer-period">{{ item.period }}</p>
        <div class="renderer-timeline-content">
          <p class="renderer-heading">{{ item.heading }}</p>
          <p v-if="item.subheading" class="renderer-subheading">{{ item.subheading }}</p>
          <p v-if="item.description" class="renderer-description">{{ item.description }}</p>
        </div>
      </li>
    </ol>

    <div v-else-if="template === 'cards'" class="renderer-cards">
      <article v-for="(item, index) in normalizedItems" :key="index" class="renderer-card">
        <div class="renderer-heading-row">
          <p class="renderer-heading">{{ item.heading }}</p>
          <p v-if="item.period" class="renderer-period">{{ item.period }}</p>
        </div>
        <p v-if="item.subheading" class="renderer-subheading">{{ item.subheading }}</p>
        <p v-if="item.description" class="renderer-description">{{ item.description }}</p>
      </article>
    </div>

    <ul v-else-if="template === 'list' || template === 'dots' || template === 'stars' || template === 'progress-line' || template === 'progress-circle'" class="renderer-list">
      <li v-for="(item, index) in normalizedItems" :key="index" class="renderer-list-item">
        <span v-if="showIcon" aria-hidden="true">•</span>
        <div>
          <div class="renderer-heading-row">
            <p class="renderer-heading">{{ item.heading }}</p>
            <p v-if="item.period" class="renderer-period">{{ item.period }}</p>
          </div>
          <p v-if="item.subheading" class="renderer-subheading">{{ item.subheading }}</p>
          <p v-if="item.description" class="renderer-description">{{ item.description }}</p>
        </div>
      </li>
    </ul>


    <ul v-else class="renderer-classic">
      <li v-for="(item, index) in normalizedItems" :key="index" class="renderer-classic-item">
        <div class="renderer-heading-row">
          <p class="renderer-heading">{{ item.heading }}</p>
          <p v-if="item.period" class="renderer-period">{{ item.period }}</p>
        </div>
        <p v-if="item.subheading" class="renderer-subheading">{{ item.subheading }}</p>
        <p v-if="item.description" class="renderer-description">{{ item.description }}</p>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="scss">
@import './sectionRendererPrimitives.scss';

.resume-atomic-renderer {
  color: inherit;
}

.renderer-empty-state {
  margin: 0;
  font-size: var(--section-font-description);
  color: color-mix(in srgb, currentColor 75%, transparent);
}

.renderer-heading-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--section-space-sm);
}

.renderer-heading {
  margin: 0;
  font-size: var(--section-font-title);
  font-weight: 650;
  line-height: 1.3;
}

.renderer-subheading {
  margin: var(--section-space-2xs) 0 0;
  font-size: var(--section-font-subtitle);
  font-weight: 520;
  color: color-mix(in srgb, currentColor 82%, transparent);
}

.renderer-period {
  margin: 0;
  font-size: var(--section-font-meta);
  font-weight: 500;
  white-space: nowrap;
  color: color-mix(in srgb, currentColor 66%, transparent);
}

.renderer-description {
  margin: var(--section-space-xs) 0 0;
  font-size: var(--section-font-description);
  line-height: 1.45;
  color: color-mix(in srgb, currentColor 87%, transparent);
}

.renderer-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.renderer-list-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--section-space-sm);
  padding: var(--section-space-sm) 0;
  border-bottom: 1px solid var(--section-border-subtle);
}

.renderer-list-item:last-child { border-bottom: 0; }

.renderer-list-item > span {
  margin-top: 0.22rem;
  color: color-mix(in srgb, currentColor 45%, transparent);
}

.renderer-cards {
  display: grid;
  gap: var(--section-space-md);
}

.renderer-card {
  padding: var(--section-space-md) var(--section-space-lg);
  border-radius: var(--section-radius-md);
  border: 1px solid var(--section-border-soft);
  box-shadow: var(--section-shadow-soft);
  background: color-mix(in srgb, currentColor 2%, transparent);
}

.renderer-timeline {
  margin: 0;
  padding: 0;
  list-style: none;
}

.renderer-timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: minmax(5.3rem, 7rem) 1fr;
  gap: var(--section-space-md);
  padding: 0 0 var(--section-space-md) 1.05rem;
}

.renderer-timeline-item::before {
  content: '';
  position: absolute;
  left: 0.36rem;
  top: 0.25rem;
  bottom: -0.3rem;
  width: 1px;
  background: var(--section-border-soft);
}

.renderer-timeline-item::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0.35rem;
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--section-border-soft);
  background: color-mix(in srgb, currentColor 8%, white);
}

.renderer-timeline-item .renderer-period { grid-column: 1; }
.renderer-timeline-content { grid-column: 2; }

.renderer-classic {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: var(--section-space-sm);
}

.renderer-classic-item {
  padding-bottom: var(--section-space-sm);
}

.density-spacious .renderer-list-item,
.density-spacious .renderer-timeline-item { padding-bottom: var(--section-space-lg); }
.density-spacious .renderer-card { padding: var(--section-space-lg); }

.density-compact .renderer-list-item,
.density-compact .renderer-timeline-item { padding-bottom: var(--section-space-sm); }
.density-compact .renderer-card { padding: var(--section-space-sm) var(--section-space-md); }
</style>
