<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDateRange, sortByStartDateDescKeepingSourceOrder } from '../formatters/dateRange'
import { levelToSteps, normalizeLevel } from './levelUtils'
import type { ResumeSectionRendererProps } from './types'
import HoverRichTextEditor from '~/components/Resume/Create/HoverRichTextEditor.vue'

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
  source: Record<string, unknown>
  headingKey: string
  subheadingKey: string
  locationKey: string
  periodKey: string
  descriptionKey: string
  description: string
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
const { t } = useI18n()

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


function firstStringField(item: Record<string, unknown>, keys: string[]) {
  return keys.find((key) => typeof item[key] === 'string' && String(item[key]).trim().length > 0) || keys[0]
}

function updateItemField(item: NormalizedItem, key: string, value: string) {
  item.source[key] = value
}

const emptyMessage = computed(() => {
  const labels: Record<string, string> = {
    experience: t('resumeBuilder.create.preview.empty.experience'),
    education: t('resumeBuilder.create.preview.empty.education'),
    skills: t('resumeBuilder.create.preview.empty.skills'),
    projects: t('resumeBuilder.create.preview.empty.projects'),
    certifications: t('resumeBuilder.create.preview.empty.certifications'),
    references: t('resumeBuilder.create.preview.empty.references'),
    interests: t('resumeBuilder.create.preview.empty.interests'),
    languages: t('resumeBuilder.create.preview.empty.languages'),
    general: t('resumeBuilder.create.preview.empty.general'),
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

    const headingKey = firstStringField(item, ['name', 'title', 'role', 'position'])
    const heading = String(item[headingKey] || t('resumeBuilder.create.preview.itemFallback'))

    const subheadingKey = firstStringField(item, ['company', 'school', 'organization', 'institution'])
    const subheading = String(item[subheadingKey] || '')

    const locationKey = firstStringField(item, ['location', 'city', 'place'])
    const location = String(item[locationKey] || '')

    const periodKey = firstStringField(item, ['period'])
    const start = item.startDate ?? item.start
    const end = item.endDate ?? item.end
    const period = String(item[periodKey] || '') || formatDateRange(start, end)

    const descriptionKey = firstStringField(item, ['description', 'summary', 'details'])
    const description = String(item[descriptionKey] || '')

    const level = normalizeLevel(item.level)

    const prefix =
      props.sectionKey === 'languages'
        ? String((item.flag as string) || (item.countryCode as string) || '').trim()
        : ''

    return {
      source: item,
      headingKey,
      subheadingKey,
      locationKey,
      periodKey,
      descriptionKey,
      heading,
      prefix,
      level,
      levelSteps: levelToSteps(level),
      subheading,
      location,
      period,
      description,
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
        <HoverRichTextEditor
          v-if="item.period"
          class="renderer-rich-editor renderer-period renderer-period-editor"
          :model-value="item.period"
          font-size="var(--section-font-meta)"
          font-weight="500"
          color="inherit"
          font-family="var(--font-family, inherit)"
          placeholder="Period"
          @update:model-value="updateItemField(item, item.periodKey, $event)"
        />

        <div class="renderer-timeline-content">
          <div class="renderer-heading">
            <span
              v-if="template === 'flags' && item.prefix"
              class="renderer-prefix"
            >
              {{ item.prefix }}
            </span>
            <HoverRichTextEditor
              class="renderer-rich-editor renderer-heading-editor"
              :model-value="item.heading"
              font-size="var(--section-font-title)"
              font-weight="650"
              color="inherit"
              font-family="var(--font-family, inherit)"
              placeholder="Title"
              @update:model-value="updateItemField(item, item.headingKey, $event)"
            />
          </div>

          <div v-if="item.subheading || item.location" class="renderer-subheading renderer-subheading-row">
            <HoverRichTextEditor
              v-if="item.subheading"
              class="renderer-rich-editor renderer-subheading-editor"
              :model-value="item.subheading"
              font-size="var(--section-font-subtitle)"
              font-weight="520"
              color="inherit"
              font-family="var(--font-family, inherit)"
              placeholder="Subtitle"
              @update:model-value="updateItemField(item, item.subheadingKey, $event)"
            />
            <span v-if="item.subheading && item.location" aria-hidden="true">·</span>
            <HoverRichTextEditor
              v-if="item.location"
              class="renderer-rich-editor renderer-location-editor"
              :model-value="item.location"
              font-size="var(--section-font-subtitle)"
              font-weight="400"
              color="inherit"
              font-family="var(--font-family, inherit)"
              placeholder="Location"
              @update:model-value="updateItemField(item, item.locationKey, $event)"
            />
          </div>

          <HoverRichTextEditor
            v-if="item.description"
            class="renderer-rich-editor renderer-description-editor"
            :model-value="item.description"
            font-size="var(--section-font-description)"
            font-weight="400"
            color="inherit"
            font-family="var(--font-family, inherit)"
            placeholder="Description"
            @update:model-value="updateItemField(item, item.descriptionKey, $event)"
          />
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
          <div class="renderer-heading">
            <span
              v-if="template === 'flags' && item.prefix"
              class="renderer-prefix"
            >
              {{ item.prefix }}
            </span>
            <HoverRichTextEditor
              class="renderer-rich-editor renderer-heading-editor"
              :model-value="item.heading"
              font-size="var(--section-font-title)"
              font-weight="650"
              color="inherit"
              font-family="var(--font-family, inherit)"
              placeholder="Title"
              @update:model-value="updateItemField(item, item.headingKey, $event)"
            />
          </div>

          <HoverRichTextEditor
            v-if="item.period"
            class="renderer-rich-editor renderer-period renderer-period-editor"
            :model-value="item.period"
            font-size="var(--section-font-meta)"
            font-weight="500"
            color="inherit"
            font-family="var(--font-family, inherit)"
            placeholder="Period"
            @update:model-value="updateItemField(item, item.periodKey, $event)"
          />
        </div>

        <HoverRichTextEditor
          v-if="item.subheading"
          class="renderer-rich-editor renderer-subheading renderer-subheading-editor"
          :model-value="item.subheading"
          font-size="var(--section-font-subtitle)"
          font-weight="520"
          color="inherit"
          font-family="var(--font-family, inherit)"
          placeholder="Subtitle"
          @update:model-value="updateItemField(item, item.subheadingKey, $event)"
        />
      </article>
    </div>

    <ul
      v-else-if="
        template === 'list' ||
        template === 'dots' ||
        template === 'stars' ||
        template === 'progress-line' ||
        template === 'progress-circle' ||
        template === 'flags' ||
        template === 'two-columns'
      "
      class="renderer-list"
      :class="{ 'renderer-list--two-columns': template === 'two-columns' }"
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
              <div class="renderer-heading">
                <span
                  v-if="template === 'flags' && item.prefix"
                  class="renderer-prefix"
                >
                  {{ item.prefix }}
                </span>
                <HoverRichTextEditor
                  class="renderer-rich-editor renderer-heading-editor"
                  :model-value="item.heading"
                  font-size="var(--section-font-title)"
                  font-weight="650"
                  color="inherit"
                  font-family="var(--font-family, inherit)"
                  placeholder="Title"
                  @update:model-value="updateItemField(item, item.headingKey, $event)"
                />
              </div>

              <p
                v-if="template === 'progress-line'"
                class="renderer-period"
              >
                {{ item.level }}%
              </p>

              <HoverRichTextEditor
                v-else-if="item.period"
                class="renderer-rich-editor renderer-period renderer-period-editor"
                :model-value="item.period"
                font-size="var(--section-font-meta)"
                font-weight="500"
                color="inherit"
                font-family="var(--font-family, inherit)"
                placeholder="Period"
                @update:model-value="updateItemField(item, item.periodKey, $event)"
              />
            </div>

            <HoverRichTextEditor
              v-if="item.subheading"
              class="renderer-rich-editor renderer-subheading renderer-subheading-editor"
              :model-value="item.subheading"
              font-size="var(--section-font-subtitle)"
              font-weight="520"
              color="inherit"
              font-family="var(--font-family, inherit)"
              placeholder="Subtitle"
              @update:model-value="updateItemField(item, item.subheadingKey, $event)"
            />
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
              :style="{ '--renderer-circle-progress': `${item.level}%` }"
              :aria-label="`${item.level}%`"
              role="img"
            />
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
          <div class="renderer-heading">
            <span
              v-if="template === 'flags' && item.prefix"
              class="renderer-prefix"
            >
              {{ item.prefix }}
            </span>
            <HoverRichTextEditor
              class="renderer-rich-editor renderer-heading-editor"
              :model-value="item.heading"
              font-size="var(--section-font-title)"
              font-weight="650"
              color="inherit"
              font-family="var(--font-family, inherit)"
              placeholder="Title"
              @update:model-value="updateItemField(item, item.headingKey, $event)"
            />
          </div>

          <HoverRichTextEditor
            v-if="item.period"
            class="renderer-rich-editor renderer-period renderer-period-editor"
            :model-value="item.period"
            font-size="var(--section-font-meta)"
            font-weight="500"
            color="inherit"
            font-family="var(--font-family, inherit)"
            placeholder="Period"
            @update:model-value="updateItemField(item, item.periodKey, $event)"
          />
        </div>

        <HoverRichTextEditor
          v-if="item.subheading"
          class="renderer-rich-editor renderer-subheading renderer-subheading-editor"
          :model-value="item.subheading"
          font-size="var(--section-font-subtitle)"
          font-weight="520"
          color="inherit"
          font-family="var(--font-family, inherit)"
          placeholder="Subtitle"
          @update:model-value="updateItemField(item, item.subheadingKey, $event)"
        />
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
.renderer-list--two-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: var(--section-space-md);
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
.renderer-list--two-columns .renderer-list-item:last-child {
  border-bottom: 1px solid var(--section-border-subtle);
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
  --renderer-circle-size: 2.75rem;
  --renderer-circle-thickness: 0.38rem;
  --renderer-circle-track: color-mix(in srgb, currentColor 14%, transparent);
  --renderer-circle-fill: color-mix(in srgb, currentColor 58%, transparent);

  width: var(--renderer-circle-size);
  height: var(--renderer-circle-size);
  border-radius: 999px;
  background: conic-gradient(
    var(--renderer-circle-fill) var(--renderer-circle-progress),
    var(--renderer-circle-track) 0
  );
  flex: 0 0 var(--renderer-circle-size);
  transform: rotate(-90deg);
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - var(--renderer-circle-thickness)),
    #000 0
  );
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - var(--renderer-circle-thickness)),
    #000 0
  );
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


.renderer-rich-editor {
  min-width: 0;
  color: inherit;
}

.renderer-rich-editor :deep(.hover-editor__content p) {
  margin: 0;
}

.renderer-rich-editor :deep(.hover-editor__content) {
  line-height: inherit;
}

.renderer-rich-editor :deep(.hover-editor__toolbar) {
  position: absolute;
  z-index: 20;
  background: color-mix(in srgb, Canvas 92%, transparent);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 8px 18px rgba(15,23,42,.16);
}

.renderer-heading-editor {
  display: inline-block;
  max-width: 100%;
}

.renderer-description-editor {
  margin-top: var(--section-space-xs);
  font-size: var(--section-font-description);
  line-height: 1.45;
  color: color-mix(in srgb, currentColor 87%, transparent);
  white-space: pre-line;
}

.renderer-subheading-row {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  min-width: 0;
}

@media (max-width: 720px) {
  .renderer-list--two-columns {
    grid-template-columns: 1fr;
  }
  .renderer-list--two-columns .renderer-list-item:last-child {
    border-bottom: 0;
  }
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
