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
  <section class="resume-atomic-renderer" :class="`density-${density}`" :style="theme">
    <p v-if="!normalizedItems.length" class="renderer-empty-state">
      {{ emptyMessage }}
    </p>

    <ol v-else-if="template === 'timeline'" class="renderer-timeline">
      <li v-for="(item, index) in normalizedItems" :key="index" class="renderer-timeline-item">
        <div class="renderer-heading-row">
          <p class="renderer-heading">{{ item.heading }}</p>
          <p v-if="item.period" class="renderer-period">{{ item.period }}</p>
        </div>
        <p v-if="item.subheading" class="renderer-subheading">{{ item.subheading }}</p>
        <p v-if="item.description" class="renderer-description">{{ item.description }}</p>
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

    <ul v-else class="renderer-list">
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
  </section>
</template>
