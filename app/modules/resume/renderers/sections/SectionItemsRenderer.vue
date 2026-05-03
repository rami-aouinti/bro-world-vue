<script setup lang="ts">
import { computed } from 'vue'
import { formatDateRange, sortByStartDateDescKeepingSourceOrder } from '../formatters/dateRange'
import { levelToSteps, normalizeLevel } from './levelUtils'
import type { ResumeSectionRendererProps } from './types'

type DescriptionChunk =
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }

type NormalizedItem = {
  heading: string
  prefix: string
  level: number
  levelSteps: number
  subheading: string
  location: string
  period: string
  descriptionChunks: DescriptionChunk[]
}

const props = withDefaults(defineProps<ResumeSectionRendererProps>(), {
  items: () => [],
  theme: () => ({}),
  showIcon: true,
  density: 'normal',
  sectionKey: 'general',
  template: 'list',
  editable: false,
})

function normalizeBulletLine(line: string): string {
  return line.replace(/^[-*•◦▪‣]+\s*/, '').trim()
}

function toDescriptionChunks(raw: string): DescriptionChunk[] {
  const text = raw.trim()

  if (!text) {
    return []
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) {
    return []
  }

  const chunks: DescriptionChunk[] = []
  let paragraphBuffer: string[] = []
  let bulletBuffer: string[] = []

  const flushParagraph = () => {
    if (paragraphBuffer.length) {
      chunks.push({ type: 'paragraph', text: paragraphBuffer.join(' ') })
      paragraphBuffer = []
    }
  }

  const flushBullets = () => {
    if (bulletBuffer.length) {
      chunks.push({ type: 'bullets', items: [...bulletBuffer] })
      bulletBuffer = []
    }
  }

  for (const line of lines) {
    const isBullet = /^[-*•◦▪‣]\s+/.test(line)

    if (isBullet) {
      flushParagraph()

      const normalized = normalizeBulletLine(line)

      if (normalized) {
        bulletBuffer.push(normalized)
      }

      continue
    }

    flushBullets()
    paragraphBuffer.push(line)
  }

  flushParagraph()
  flushBullets()

  if (!chunks.length) {
    return [{ type: 'paragraph', text }]
  }

  return chunks
}


function updateItemField(index: number, key: string, value: string) {
  const entry = (props.items?.[index] ?? null) as Record<string, unknown> | null
  if (!entry) return
  entry[key] = value
}

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
      (item.name as string) ||
      (item.title as string) ||
      (item.role as string) ||
      (item.position as string) ||
      'Élément'

    const subheading =
      (item.company as string) ||
      (item.school as string) ||
      (item.organization as string) ||
      (item.institution as string) ||
      ''

    const location =
      (item.location as string) ||
      (item.city as string) ||
      (item.place as string) ||
      ''

    const start = item.startDate ?? item.start
    const end = item.endDate ?? item.end
    const period = formatDateRange(start, end)

    const description =
      (item.description as string) ||
      (item.summary as string) ||
      (item.details as string) ||
      ''

    const level = normalizeLevel(item.level)

    const prefix =
      props.sectionKey === 'languages'
        ? String((item.flag as string) || (item.countryCode as string) || '').trim()
        : ''

    return {
      heading,
      prefix,
      level,
      levelSteps: levelToSteps(level),
      subheading,
      location,
      period,
      descriptionChunks: toDescriptionChunks(description),
    }
  })
})
</script>

<template>
  <section
    class="resume-atomic-renderer"
    :class="[
      `density-${density}`,
      density === 'compact' ? 'mode-aside' : 'mode-main',
      `section-${sectionKey}`,
    ]"
    :style="theme"
  >
    <p v-if="!normalizedItems.length" class="renderer-empty-state">
      {{ emptyMessage }}
    </p>

    <ol v-else-if="template === 'timeline'" class="renderer-timeline">
      <li
        v-for="(item, index) in normalizedItems"
        :key="index"
        class="renderer-timeline-item"
      >
        <p v-if="item.period" class="renderer-period">
          {{ item.period }}
        </p>

        <div class="renderer-timeline-content">
          <p class="renderer-heading">
            <span
              v-if="template === 'flags' && item.prefix"
              class="renderer-prefix"
            >
              {{ item.prefix }}
            </span>
            <span class="editable-text" :contenteditable="editable" @input="(event) => updateItemField(index, 'title', (event.target as HTMLElement).innerText)">{{ item.heading }}</span>
          </p>

          <p v-if="item.subheading || item.location" class="renderer-subheading">
            <span v-if="item.subheading"><span class="editable-text" :contenteditable="editable" @input="(event) => updateItemField(index, 'company', (event.target as HTMLElement).innerText)">{{ item.subheading }}</span></span>
            <span v-if="item.subheading && item.location" aria-hidden="true">
              ·
            </span>
            <span v-if="item.location">{{ item.location }}</span>
          </p>

          <div
            v-if="item.descriptionChunks.length"
            class="renderer-description-block"
          >
            <template
              v-for="(chunk, chunkIndex) in item.descriptionChunks"
              :key="chunkIndex"
            >
              <p
                v-if="chunk.type === 'paragraph'"
                class="renderer-description"
              >
                {{ chunk.text }}
              </p>

              <ul v-else class="renderer-description-list">
                <li
                  v-for="(bullet, bulletIndex) in chunk.items"
                  :key="bulletIndex"
                >
                  {{ bullet }}
                </li>
              </ul>
            </template>
          </div>
        </div>
      </li>
    </ol>

    <div v-else-if="template === 'cards'" class="renderer-cards">
      <article
        v-for="(item, index) in normalizedItems"
        :key="index"
        class="renderer-card"
      >
        <div class="renderer-heading-row">
          <p class="renderer-heading">
            <span
              v-if="template === 'flags' && item.prefix"
              class="renderer-prefix"
            >
              {{ item.prefix }}
            </span>
            <span class="editable-text" :contenteditable="editable" @input="(event) => updateItemField(index, 'title', (event.target as HTMLElement).innerText)">{{ item.heading }}</span>
          </p>

          <p v-if="item.period" class="renderer-period">
            {{ item.period }}
          </p>
        </div>

        <p v-if="item.subheading" class="renderer-subheading">
          <span class="editable-text" :contenteditable="editable" @input="(event) => updateItemField(index, 'company', (event.target as HTMLElement).innerText)">{{ item.subheading }}</span>
        </p>
      </article>
    </div>

    <ul
      v-else-if="
        template === 'list' ||
        template === 'dots' ||
        template === 'stars' ||
        template === 'progress-line' ||
        template === 'progress-circle' ||
        template === 'flags'
      "
      class="renderer-list"
    >
      <li
        v-for="(item, index) in normalizedItems"
        :key="index"
        class="renderer-list-item"
        :class="{ 'renderer-list-item--with-icon': showIcon && template === 'list' }"
      >
        <span
          v-if="showIcon && template === 'list'"
          class="renderer-list-bullet"
          aria-hidden="true"
        >
          •
        </span>

        <div class="renderer-list-content">
          <div class="renderer-list-main">
            <div class="renderer-heading-row">
              <p class="renderer-heading">
                <span
                  v-if="template === 'flags' && item.prefix"
                  class="renderer-prefix"
                >
                  {{ item.prefix }}
                </span>
                <span class="editable-text" :contenteditable="editable" @input="(event) => updateItemField(index, 'title', (event.target as HTMLElement).innerText)">{{ item.heading }}</span>
              </p>

              <p
                v-if="template === 'progress-line'"
                class="renderer-period"
              >
                {{ item.level }}%
              </p>

              <p v-else-if="item.period" class="renderer-period">
                {{ item.period }}
              </p>
            </div>

            <p v-if="item.subheading" class="renderer-subheading">
              <span class="editable-text" :contenteditable="editable" @input="(event) => updateItemField(index, 'company', (event.target as HTMLElement).innerText)">{{ item.subheading }}</span>
            </p>
          </div>

          <div
            v-if="
              template === 'stars' ||
              template === 'dots' ||
              template === 'progress-line' ||
              template === 'progress-circle'
            "
            class="renderer-list-end"
          >
            <div
              v-if="template === 'stars'"
              class="renderer-rating"
              :aria-label="`${item.levelSteps} sur 5`"
            >
              {{ '★'.repeat(item.levelSteps) }}{{ '☆'.repeat(5 - item.levelSteps) }}
            </div>

            <div
              v-else-if="template === 'dots'"
              class="renderer-rating renderer-rating--dots"
              :aria-label="`${item.levelSteps} sur 5`"
            >
              <span
                v-for="dot in 5"
                :key="dot"
                class="renderer-dot"
                :class="{ 'renderer-dot--active': dot <= item.levelSteps }"
              />
            </div>

            <div
              v-else-if="template === 'progress-line'"
              class="renderer-progress"
            >
              <span
                class="renderer-progress-fill"
                :style="{ width: `${item.level}%` }"
              />
            </div>

            <div
              v-else-if="template === 'progress-circle'"
              class="renderer-circle"
            >
              {{ item.level }}%
            </div>
          </div>
        </div>
      </li>
    </ul>

    <ul v-else class="renderer-classic">
      <li
        v-for="(item, index) in normalizedItems"
        :key="index"
        class="renderer-classic-item"
      >
        <div class="renderer-heading-row">
          <p class="renderer-heading">
            <span
              v-if="template === 'flags' && item.prefix"
              class="renderer-prefix"
            >
              {{ item.prefix }}
            </span>
            <span class="editable-text" :contenteditable="editable" @input="(event) => updateItemField(index, 'title', (event.target as HTMLElement).innerText)">{{ item.heading }}</span>
          </p>

          <p v-if="item.period" class="renderer-period">
            {{ item.period }}
          </p>
        </div>

        <p v-if="item.subheading" class="renderer-subheading">
          <span class="editable-text" :contenteditable="editable" @input="(event) => updateItemField(index, 'company', (event.target as HTMLElement).innerText)">{{ item.subheading }}</span>
        </p>
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
  min-width: 0;
}

.renderer-heading {
  margin: 0;
  font-size: var(--section-font-title);
  font-weight: 650;
  line-height: 1.3;
  min-width: 0;
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

.renderer-description-block {
  margin-top: var(--section-space-xs);
  display: grid;
  gap: var(--section-space-xs);
}

.renderer-description-block .renderer-description {
  margin: 0;
}

.renderer-description-list {
  margin: 0;
  padding-left: 1.1rem;
  font-size: var(--section-font-description);
  line-height: 1.45;
  color: color-mix(in srgb, currentColor 87%, transparent);
}

/* LIST / STARS / DOTS / PROGRESS / FLAGS */
.renderer-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.renderer-list-item {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--section-space-sm);
  padding: var(--section-space-sm) 0;
  border-bottom: 1px solid var(--section-border-subtle);
}

.renderer-list-item--with-icon {
  grid-template-columns: auto minmax(0, 1fr);
}

.renderer-list-item:last-child {
  border-bottom: 0;
}

.renderer-list-bullet {
  grid-column: 1;
  margin-top: 0.22rem;
  color: color-mix(in srgb, currentColor 45%, transparent);
}

.renderer-list-content {
  grid-column: 1;
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--section-space-md);
}

.renderer-list-item--with-icon .renderer-list-content {
  grid-column: 2;
}

.renderer-list-main {
  flex: 1 1 auto;
  min-width: 0;
}

.renderer-list-end {
  margin-left: auto;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.renderer-rating {
  font-size: var(--section-font-description);
  letter-spacing: 0.08em;
  white-space: nowrap;
  color: color-mix(in srgb, currentColor 78%, transparent);
}

.renderer-rating--dots {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.renderer-dot {
  display: inline-block;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 20%, transparent);
}

.renderer-dot--active {
  background: color-mix(in srgb, currentColor 80%, transparent);
}

.renderer-progress {
  width: 5rem;
  height: 0.45rem;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 20%, transparent);
  overflow: hidden;
}

.renderer-progress-fill {
  display: block;
  height: 100%;
  background: color-mix(in srgb, currentColor 75%, transparent);
}

.renderer-circle {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  border: 2px solid color-mix(in srgb, currentColor 55%, transparent);
  display: grid;
  place-items: center;
  font-size: 0.68rem;
  white-space: nowrap;
}

/* CARDS */
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

/* TIMELINE */
.renderer-timeline {
  margin: 0;
  padding: 0;
  list-style: none;
}

.renderer-timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: minmax(2rem, 5rem) 1fr;
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

.renderer-timeline-item:last-child::before {
  bottom: 0.35rem;
}

.renderer-timeline-item .renderer-period {
  grid-column: 1;
}

.renderer-timeline-content {
  grid-column: 2;
}

/* CLASSIC */
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

/* DENSITY */
.density-spacious .renderer-list-item,
.density-spacious .renderer-timeline-item {
  padding-bottom: var(--section-space-lg);
}

.density-spacious .renderer-card {
  padding: var(--section-space-lg);
}

.density-compact .renderer-list-item,
.density-compact .renderer-timeline-item {
  padding-bottom: var(--section-space-sm);
}

.density-compact .renderer-card {
  padding: var(--section-space-sm) var(--section-space-md);
}

.renderer-prefix {
  margin-right: 0.35rem;
}

/* FONT WEIGHT OVERRIDES */
.resume-atomic-renderer.section-skills .renderer-heading,
.resume-atomic-renderer.section-languages .renderer-heading,
.resume-atomic-renderer.section-references .renderer-heading,
.resume-atomic-renderer.section-certifications .renderer-heading,
.resume-atomic-renderer.section-interests .renderer-heading,
.resume-atomic-renderer.section-skills .renderer-subheading,
.resume-atomic-renderer.section-languages .renderer-subheading,
.resume-atomic-renderer.section-references .renderer-subheading,
.resume-atomic-renderer.section-certifications .renderer-subheading,
.resume-atomic-renderer.section-interests .renderer-subheading {
  font-weight: var(--cv-font-weight, 400);
}
</style>
