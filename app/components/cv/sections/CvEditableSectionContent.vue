<script setup lang="ts">
import HoverRichTextEditor from '~/components/Resume/Create/HoverRichTextEditor.vue'

const props = withDefaults(
  defineProps<{
    items?: string[]
    sectionKey?: string
    variant?: string
    contentStyle?: string
    dateStyle?: string
    levelStyle?: string
    hobbyStyle?: string
  }>(),
  {
    items: () => [],
    sectionKey: '',
    variant: 'classic',
    contentStyle: '',
    dateStyle: 'plain',
    levelStyle: 'line',
    hobbyStyle: 'text',
  },
)

const emit = defineEmits<{
  (event: 'update-item', index: number, value: string): void
}>()

const circleProgressVariants = [
  'progress-circle',
  'progress-circle-grid',
  'progress-circle-ring',
]

function splitComplexItem(raw: string) {
  const [title = '', subtitle = '', period = '', description = ''] = String(
    raw || '',
  ).split('§')
  return { title, subtitle, period, description }
}

function joinComplexItem(parts: {
  title: string
  subtitle: string
  period: string
  description: string
}) {
  return [parts.title, parts.subtitle, parts.period, parts.description].join(
    '§',
  )
}

function isComplexItem(raw: string) {
  return (
    ['experience', 'education'].includes(props.sectionKey) &&
    String(raw || '').includes('§')
  )
}

function splitLeveledItem(raw: string) {
  const input = String(raw || '').trim()
  const percentMatch = input.match(/^(.*)\s\((\d+)%\)$/)
  if (percentMatch) {
    return { label: percentMatch[1], value: Number(percentMatch[2]) }
  }

  const levelMatch = input.match(/^(.*)\s\(([^)]+)\)$/)
  if (levelMatch) {
    const label = levelMatch[1].trim()
    const level = levelMatch[2].trim().toLowerCase()
    const mappedLevels: Record<string, number> = {
      beginner: 30,
      intermediate: 60,
      advanced: 85,
      expert: 95,
    }
    return {
      label,
      value: mappedLevels[level] ?? 0,
    }
  }

  return { label: input, value: 0 }
}

function updateSimpleItem(index: number, value: string) {
  emit('update-item', index, value)
}

function updateComplexPart(
  index: number,
  raw: string,
  key: 'title' | 'subtitle' | 'period' | 'description',
  value: string,
) {
  const parts = splitComplexItem(raw)
  parts[key] = value
  emit('update-item', index, joinComplexItem(parts))
}

function updateLeveledLabel(index: number, raw: string, value: string) {
  const parts = splitLeveledItem(raw)
  emit('update-item', index, `${value} (${parts.value}%)`)
}

function updateLeveledValue(index: number, raw: string, value: string) {
  const parts = splitLeveledItem(raw)
  const level = Math.max(0, Math.min(100, Number.parseInt(value, 10) || 0))
  emit('update-item', index, `${parts.label} (${level}%)`)
}

function filledDots(raw: string) {
  return Math.max(0, Math.min(5, Math.round(splitLeveledItem(raw).value / 20)))
}

function filledStars(raw: string) {
  return Math.max(0, Math.min(5, Math.round(splitLeveledItem(raw).value / 20)))
}

function isLeveledSection() {
  return ['skills', 'languages'].includes(props.sectionKey)
}

function isCardVariant() {
  return [
    'cards',
    'cards-soft',
    'cards-bordered',
    'cards-accent-left',
  ].includes(props.variant)
}

function isTimelineComplexItem(raw: string) {
  return (
    isComplexItem(raw) &&
    (props.variant.includes('timeline') ||
      [
        'timeline-vertical',
        'timeline-date-badges',
        'timeline-badges',
        'timeline-line',
      ].includes(props.contentStyle || ''))
  )
}

function periodModelValue(value: string) {
  if (props.dateStyle !== 'stacked') return value
  return String(value || '').replace(/\s+(?:-|–|—|\/)\s+/, '\n')
}

function hobbyIcon(label: string) {
  const normalized = label.toLowerCase()
  if (normalized.includes('computer')) return 'mdi-laptop'
  if (normalized.includes('read')) return 'mdi-book-open-page-variant'
  if (normalized.includes('design')) return 'mdi-palette-outline'
  if (normalized.includes('travel')) return 'mdi-airplane'
  if (normalized.includes('sport')) return 'mdi-run'
  if (normalized.includes('music')) return 'mdi-music'
  return 'mdi-star-outline'
}
</script>

<template>
  <div
    class="cv-rich-section"
    :class="[
      `cv-rich-section--${variant}`,
      `cv-rich-section--${sectionKey}`,
      `cv-rich-section--hobby-${hobbyStyle}`,
    ]"
  >
    <template
      v-if="
        sectionKey === 'hobbies' &&
        ['hobby-icons', 'hobby-icons-separated'].includes(variant)
      "
    >
      <div class="cv-hobby-icons" :class="`cv-hobby-icons--${variant}`">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="cv-hobby-icon-item"
        >
          <v-icon :icon="hobbyIcon(item)" />
          <HoverRichTextEditor
            class="cv-rich-editor cv-rich-editor--hobby"
            :model-value="item"
            placeholder="Hobby"
            font-size="12px"
            font-weight="700"
            font-family="var(--cv-text-body, inherit)"
            color="inherit"
            @update:model-value="updateSimpleItem(index, $event)"
          />
        </div>
      </div>
    </template>

    <template v-else>
      <div
        v-for="(item, index) in items"
        :key="index"
        class="cv-rich-item"
        :class="[
          `cv-rich-item--${variant}`,
          { 'cv-rich-item--cards': isCardVariant() },
          `cv-rich-item--content-${contentStyle || variant}`,
          `cv-rich-item--date-${dateStyle || 'plain'}`,
          `cv-rich-item--level-${levelStyle}`,
          {
            'cv-rich-item--complex': isComplexItem(item),
            'cv-rich-item--timeline-complex':
              isComplexItem(item) && variant.includes('timeline'),
            'cv-rich-item--leveled': isLeveledSection(),
          },
        ]"
      >
        <template v-if="isComplexItem(item)">
          <template v-if="isTimelineComplexItem(item)">
            <div class="cv-rich-timeline-dot" aria-hidden="true" />
            <HoverRichTextEditor
              v-if="splitComplexItem(item).period"
              class="cv-rich-editor cv-rich-editor--period cv-rich-editor--timeline-period"
              :model-value="periodModelValue(splitComplexItem(item).period)"
              placeholder="Period"
              font-size="12px"
              font-weight="500"
              font-family="var(--cv-text-body, inherit)"
              color="inherit"
              @update:model-value="
                updateComplexPart(index, item, 'period', $event)
              "
            />
            <div class="cv-rich-timeline-body">
              <HoverRichTextEditor
                class="cv-rich-editor cv-rich-editor--title"
                :model-value="splitComplexItem(item).title"
                placeholder="Title"
                font-size="13px"
                font-weight="700"
                font-family="var(--cv-text-entry-title, inherit)"
                color="inherit"
                @update:model-value="
                  updateComplexPart(index, item, 'title', $event)
                "
              />
              <HoverRichTextEditor
                v-if="splitComplexItem(item).subtitle"
                class="cv-rich-editor cv-rich-editor--subtitle"
                :model-value="splitComplexItem(item).subtitle"
                placeholder="Subtitle"
                font-size="12px"
                font-weight="600"
                font-family="var(--cv-text-body, inherit)"
                color="inherit"
                @update:model-value="
                  updateComplexPart(index, item, 'subtitle', $event)
                "
              />
              <HoverRichTextEditor
                v-if="splitComplexItem(item).description"
                class="cv-rich-editor cv-rich-editor--description"
                :model-value="splitComplexItem(item).description"
                placeholder="Description"
                font-size="11px"
                font-weight="400"
                font-family="var(--cv-text-body, inherit)"
                color="inherit"
                @update:model-value="
                  updateComplexPart(index, item, 'description', $event)
                "
              />
            </div>
          </template>

          <template v-else>
            <div class="cv-rich-entry-head">
              <HoverRichTextEditor
                class="cv-rich-editor cv-rich-editor--title"
                :model-value="splitComplexItem(item).title"
                placeholder="Title"
                font-size="13px"
                font-weight="700"
                font-family="var(--cv-text-entry-title, inherit)"
                color="inherit"
                @update:model-value="
                  updateComplexPart(index, item, 'title', $event)
                "
              />
              <HoverRichTextEditor
                v-if="splitComplexItem(item).period"
                class="cv-rich-editor cv-rich-editor--period"
                :model-value="periodModelValue(splitComplexItem(item).period)"
                placeholder="Period"
                font-size="12px"
                font-weight="500"
                font-family="var(--cv-text-body, inherit)"
                color="inherit"
                @update:model-value="
                  updateComplexPart(index, item, 'period', $event)
                "
              />
            </div>
            <HoverRichTextEditor
              v-if="splitComplexItem(item).subtitle"
              class="cv-rich-editor cv-rich-editor--subtitle"
              :model-value="splitComplexItem(item).subtitle"
              placeholder="Subtitle"
              font-size="12px"
              font-weight="600"
              font-family="var(--cv-text-body, inherit)"
              color="inherit"
              @update:model-value="
                updateComplexPart(index, item, 'subtitle', $event)
              "
            />
            <div
              v-if="splitComplexItem(item).description"
              class="cv-rich-description-row"
              :class="`cv-rich-description-row--${variant}`"
            >
              <span v-if="variant === 'list'" class="cv-rich-prefix">-</span>
              <span v-else-if="variant === 'dot'" class="cv-rich-prefix"
                >•</span
              >
              <HoverRichTextEditor
                class="cv-rich-editor cv-rich-editor--description"
                :model-value="splitComplexItem(item).description"
                placeholder="Description"
                font-size="12px"
                font-weight="400"
                font-family="var(--cv-text-body, inherit)"
                color="inherit"
                @update:model-value="
                  updateComplexPart(index, item, 'description', $event)
                "
              />
            </div>
          </template>
        </template>

        <template v-else-if="isLeveledSection()">
          <HoverRichTextEditor
            class="cv-rich-editor cv-rich-editor--label"
            :model-value="splitLeveledItem(item).label"
            placeholder="Label"
            font-size="13px"
            font-weight="500"
            font-family="var(--cv-text-body, inherit)"
            color="inherit"
            @update:model-value="updateLeveledLabel(index, item, $event)"
          />
          <template v-if="variant === 'stars'">
            <span class="cv-rich-stars" aria-hidden="true"
              >{{ '★'.repeat(filledStars(item))
              }}{{ '☆'.repeat(5 - filledStars(item)) }}</span
            >
          </template>
          <template v-else-if="variant === 'dots'">
            <span class="cv-rich-dots" aria-hidden="true">
              <span
                v-for="dot in 5"
                :key="dot"
                class="cv-rich-dot"
                :class="{ 'cv-rich-dot--filled': dot <= filledDots(item) }"
              />
            </span>
          </template>
          <div
            v-else-if="variant === 'progress-line'"
            class="cv-progress-line-row"
          >
            <span class="cv-progress-line-track">
              <i :style="{ width: `${splitLeveledItem(item).value}%` }" />
            </span>
            <span class="cv-progress-line-value">
              {{ splitLeveledItem(item).value }}%
            </span>
          </div>
          <template v-else-if="circleProgressVariants.includes(variant)">
            <span
              class="cv-rich-circle"
              :style="{ '--level': splitLeveledItem(item).value }"
            >
              <span class="cv-rich-circle-value">
                {{ splitLeveledItem(item).value }}%
              </span>
            </span>
          </template>
          <HoverRichTextEditor
            v-else
            class="cv-rich-editor cv-rich-editor--value"
            :model-value="`${splitLeveledItem(item).value}%`"
            placeholder="Level"
            font-size="12px"
            font-weight="500"
            font-family="var(--cv-text-body, inherit)"
            color="inherit"
            @update:model-value="updateLeveledValue(index, item, $event)"
          />
        </template>

        <template v-else>
          <span v-if="variant === 'list'" class="cv-rich-prefix">-</span>
          <span v-else-if="variant === 'dot'" class="cv-rich-prefix">•</span>
          <HoverRichTextEditor
            class="cv-rich-editor cv-rich-editor--simple"
            :model-value="item"
            placeholder="Text"
            font-size="13px"
            font-weight="500"
            font-family="var(--cv-text-body, inherit)"
            color="inherit"
            @update:model-value="updateSimpleItem(index, $event)"
          />
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.cv-rich-section {
  display: grid;
  gap: 6px;
  padding: 2px 0;
}

.cv-rich-item {
  color: inherit;
  font-size: 13px;
  line-height: 1.35;
  min-width: 0;
}

.cv-rich-item--level-line-gradient .cv-rich-progress i {
  background: linear-gradient(
    90deg,
    var(--cv-secondary, #93c5fd),
    color-mix(in srgb, var(--cv-primary, #111827) 72%, #fff)
  );
}

.cv-rich-section--progress-circle-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
  place-items: start center;
}

.cv-rich-section--progress-circle-ring {
  grid-template-columns: repeat(auto-fit, minmax(54px, 1fr));
  gap: 12px;
  place-items: start center;
}

.cv-hobby-icons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(82px, 1fr));
  gap: 12px;
}

.cv-hobby-icon-item {
  display: grid;
  justify-items: center;
  gap: 6px;
  text-align: center;
  padding-inline: 10px;
  min-width: 0;
}

.cv-hobby-icons--hobby-icons-separated .cv-hobby-icon-item:not(:last-child) {
  border-inline-end: 1px dashed rgba(148, 163, 184, 0.45);
}

.cv-hobby-icon-item .v-icon {
  font-size: 30px;
  color: var(--cv-secondary, #93c5fd);
}

.cv-rich-section--timeline.cv-rich-section--experience,
.cv-rich-section--timeline.cv-rich-section--education {
  position: relative;
  padding-left: 22px;
}

.cv-rich-section--timeline.cv-rich-section--experience::before,
.cv-rich-section--timeline.cv-rich-section--education::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 6px;
  bottom: 6px;
  width: 1px;
  background: color-mix(in srgb, var(--cv-secondary, #93c5fd) 45%, white);
}

.cv-rich-item--timeline-complex {
  position: relative;
  display: grid;
  grid-template-columns: minmax(72px, 100px) minmax(0, 1fr);
  column-gap: 12px;
  margin-bottom: 14px;
}

.cv-rich-timeline-dot {
  position: absolute;
  left: -18px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 2px solid var(--cv-secondary, #93c5fd);
  background: var(--cv-page-background, #fff);
  z-index: 1;
}

.cv-rich-editor--timeline-period {
  grid-column: 1;
  color: var(--cv-secondary, #93c5fd);
}

.cv-rich-timeline-body {
  grid-column: 2;
  min-width: 0;
}

.cv-rich-item--content-timeline-vertical,
.cv-rich-item--content-timeline-date-badges,
.cv-rich-item--content-timeline-badges,
.cv-rich-item--content-timeline-line {
  position: relative;
  display: grid;
  grid-template-columns: minmax(56px, 86px) minmax(0, 1fr);
  column-gap: 14px;
  padding-left: 20px;
  margin-bottom: 14px;
}

.cv-rich-item--content-timeline-vertical::before,
.cv-rich-item--content-timeline-date-badges::before,
.cv-rich-item--content-timeline-badges::before,
.cv-rich-item--content-timeline-line::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 0;
  bottom: -14px;
  width: 1px;
  background: color-mix(in srgb, var(--cv-secondary, #93c5fd) 52%, transparent);
}

.cv-rich-item--content-timeline-vertical:last-child::before,
.cv-rich-item--content-timeline-date-badges:last-child::before,
.cv-rich-item--content-timeline-badges:last-child::before,
.cv-rich-item--content-timeline-line:last-child::before {
  bottom: 8px;
}

.cv-rich-item--content-timeline-vertical .cv-rich-timeline-dot,
.cv-rich-item--content-timeline-date-badges .cv-rich-timeline-dot,
.cv-rich-item--content-timeline-badges .cv-rich-timeline-dot,
.cv-rich-item--content-timeline-line .cv-rich-timeline-dot {
  left: 0;
  top: 4px;
  width: 11px;
  height: 11px;
  box-shadow: 0 0 0 3px var(--cv-page-background, #fff);
}

.cv-rich-item--content-timeline-date-badges,
.cv-rich-item--content-timeline-badges {
  grid-template-columns: minmax(64px, 92px) minmax(0, 1fr);
}

.cv-rich-item--content-timeline-line {
  grid-template-columns: minmax(52px, 76px) minmax(0, 1fr);
  column-gap: 12px;
}

.cv-rich-item--content-timeline-date-badges .cv-rich-editor--period,
.cv-rich-item--content-timeline-badges .cv-rich-editor--period {
  align-self: start;
  justify-self: end;
  border: 1px solid
    color-mix(in srgb, var(--cv-secondary, #93c5fd) 45%, transparent);
  border-radius: 999px;
  padding: 2px 8px;
  background: color-mix(
    in srgb,
    var(--cv-secondary, #93c5fd) 12%,
    var(--cv-page-background, #fff)
  );
  color: var(--cv-secondary, #93c5fd);
  font-size: 11px;
  line-height: 1.15;
}

.cv-rich-section--timeline-dots,
.cv-rich-section--timeline-badges,
.cv-rich-section--timeline-stacked-dates {
  position: relative;
  padding-left: 26px;
}

.cv-rich-section--timeline-dots::before,
.cv-rich-section--timeline-badges::before,
.cv-rich-section--timeline-stacked-dates::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 8px;
  bottom: 8px;
  border-left: 1px dashed
    color-mix(in srgb, var(--cv-secondary, #93c5fd) 58%, transparent);
}

.cv-rich-item--content-timeline-dots,
.cv-rich-item--content-timeline-badges,
.cv-rich-item--content-timeline-stacked-dates {
  position: relative;
  display: grid;
  grid-template-columns: minmax(70px, 96px) minmax(0, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}

.cv-rich-item--content-timeline-dots .cv-rich-timeline-dot,
.cv-rich-item--content-timeline-badges .cv-rich-timeline-dot,
.cv-rich-item--content-timeline-stacked-dates .cv-rich-timeline-dot {
  left: -22px;
  top: 6px;
  width: 11px;
  height: 11px;
}

.cv-rich-item--content-timeline-badges .cv-rich-editor--period {
  width: fit-content;
  padding: 3px 9px;
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    var(--cv-primary, #0f172a),
    var(--cv-secondary, #93c5fd)
  );
  color: #fff;
  font-size: 11px;
  font-weight: 800;
}

.cv-rich-item--content-timeline-stacked-dates .cv-rich-editor--period {
  align-self: start;
  justify-self: end;
  width: fit-content;
  max-width: 42px;
  white-space: normal;
  line-height: 1.05;
  text-align: center;
  font-size: 10px;
  font-weight: 800;
}

.cv-rich-item--date-stacked .cv-rich-editor--period {
  align-self: start;
  justify-self: end;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 42px;
  white-space: pre-line;
  text-align: center;
  line-height: 1.05;
}

.cv-rich-item--date-badge-right .cv-rich-editor--period,
.cv-rich-item--date-badge-left .cv-rich-editor--period {
  align-self: start;
  display: inline-flex;
  width: fit-content;
  max-width: 100%;
  border-radius: 999px;
  padding: 3px 8px;
  background: color-mix(in srgb, var(--cv-secondary, #ef4444) 78%, #111827);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.1;
  white-space: nowrap;
}

.cv-rich-item--date-badge-right.cv-rich-item--timeline-complex {
  grid-template-columns: minmax(0, 1fr) minmax(58px, max-content);
}

.cv-rich-item--date-badge-right.cv-rich-item--timeline-complex
  .cv-rich-editor--period {
  grid-column: 2;
  grid-row: 1;
  justify-self: start;
}

.cv-rich-item--date-badge-right.cv-rich-item--timeline-complex
  .cv-rich-timeline-body {
  grid-column: 1;
  grid-row: 1;
}

.cv-rich-item--date-badge-left .cv-rich-editor--period {
  justify-self: end;
}

.cv-rich-item--content-timeline-date-badges.cv-rich-item--timeline-complex,
.cv-rich-item--content-timeline-badges.cv-rich-item--timeline-complex,
.cv-rich-item--content-timeline-stacked-dates.cv-rich-item--timeline-complex {
  grid-template-columns: minmax(70px, 104px) minmax(0, 1fr);
}

.cv-rich-item--content-timeline-date-badges .cv-rich-editor--timeline-period,
.cv-rich-item--content-timeline-badges .cv-rich-editor--timeline-period,
.cv-rich-item--content-timeline-stacked-dates .cv-rich-editor--timeline-period {
  grid-column: 1;
  grid-row: 1;
}

.cv-rich-item--content-timeline-date-badges .cv-rich-timeline-body,
.cv-rich-item--content-timeline-badges .cv-rich-timeline-body,
.cv-rich-item--content-timeline-stacked-dates .cv-rich-timeline-body {
  grid-column: 2;
  grid-row: 1;
}

.cv-rich-item--content-timeline-date-badges.cv-rich-item--date-badge-right
  .cv-rich-editor--timeline-period,
.cv-rich-item--content-timeline-badges.cv-rich-item--date-badge-right
  .cv-rich-editor--timeline-period,
.cv-rich-item--content-timeline-stacked-dates.cv-rich-item--date-badge-right
  .cv-rich-editor--timeline-period {
  justify-self: end;
}

.cv-rich-item--content-timeline-stacked-dates.cv-rich-item--date-badge-right
  .cv-rich-editor--timeline-period,
.cv-rich-item--content-timeline-stacked-dates.cv-rich-item--date-badge-left
  .cv-rich-editor--timeline-period {
  border-radius: 18px;
  white-space: pre-line;
}

.cv-rich-item--date-pill .cv-rich-editor--period {
  border-radius: 999px;
  padding: 2px 8px;
  background: color-mix(in srgb, currentColor 10%, transparent);
}

.cv-rich-item--complex.cv-rich-item--list,
.cv-rich-item--complex.cv-rich-item--dot {
  display: block;
}

.cv-rich-description-row {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  min-width: 0;
}

.cv-rich-section--cards,
.cv-rich-section--cards-soft,
.cv-rich-section--cards-bordered,
.cv-rich-section--cards-accent-left {
  gap: 10px;
}

.cv-rich-item--cards {
  position: relative;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid
    color-mix(in srgb, var(--cv-secondary, #93c5fd) 22%, transparent);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--cv-secondary, #93c5fd) 10%, transparent),
      transparent 46%
    ),
    color-mix(in srgb, var(--cv-page-background, #fff) 96%, #fff);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
}

.cv-rich-item--cards .cv-rich-editor--title {
  color: var(--cv-primary, #0f172a);
  font-weight: 800;
}

.cv-rich-item--cards-accent-left {
  border-left: 4px solid var(--cv-secondary, #93c5fd);
}

.cv-rich-item--cards-bordered {
  border: 2px solid
    color-mix(in srgb, var(--cv-primary, #0f172a) 28%, transparent);
  box-shadow: none;
}

.cv-rich-item--cards-soft {
  background: color-mix(
    in srgb,
    var(--cv-secondary, #93c5fd) 8%,
    var(--cv-page-background, #fff)
  );
  box-shadow: none;
}

.cv-rich-item--cards .cv-rich-editor--period {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--cv-primary, #0f172a);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
}

.cv-rich-item--list,
.cv-rich-item--dot {
  display: flex;
  align-items: flex-start;
  gap: 5px;
}

.cv-rich-item--leveled {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.cv-rich-item--progress-line.cv-rich-item--leveled {
  grid-template-columns: minmax(0, 1fr) minmax(88px, 130px) 34px;
  align-items: center;
  gap: 8px;
}

.cv-rich-item--progress-circle-grid.cv-rich-item--leveled,
.cv-rich-item--progress-circle-ring.cv-rich-item--leveled {
  grid-template-columns: 1fr;
  place-items: start center;
  gap: 6px;
  text-align: center;
}

.cv-rich-item--progress-circle-grid.cv-rich-item--leveled,
.cv-rich-item--progress-circle-ring.cv-rich-item--leveled,
.cv-rich-item--level-circle-grid.cv-rich-item--leveled,
.cv-rich-item--level-circle-ring.cv-rich-item--leveled {
  justify-self: center;
  width: fit-content;
  min-width: 54px;
  max-width: 100%;
  margin-inline: auto;
}

.cv-rich-item--progress-circle-grid .cv-rich-editor--label,
.cv-rich-item--progress-circle-ring .cv-rich-editor--label,
.cv-rich-item--level-circle-grid .cv-rich-editor--label,
.cv-rich-item--level-circle-ring .cv-rich-editor--label,
.cv-rich-item--progress-circle-grid .cv-rich-circle,
.cv-rich-item--progress-circle-ring .cv-rich-circle,
.cv-rich-item--level-circle-grid .cv-rich-circle,
.cv-rich-item--level-circle-ring .cv-rich-circle {
  justify-self: center;
  margin-inline: auto;
}

.cv-rich-item--progress-circle-grid
  .cv-rich-editor--label
  :deep(.hover-editor__content),
.cv-rich-item--progress-circle-grid
  .cv-rich-editor--label
  :deep(.hover-editor__content p),
.cv-rich-item--progress-circle-ring
  .cv-rich-editor--label
  :deep(.hover-editor__content),
.cv-rich-item--progress-circle-ring
  .cv-rich-editor--label
  :deep(.hover-editor__content p),
.cv-rich-item--level-circle-grid
  .cv-rich-editor--label
  :deep(.hover-editor__content),
.cv-rich-item--level-circle-grid
  .cv-rich-editor--label
  :deep(.hover-editor__content p),
.cv-rich-item--level-circle-ring
  .cv-rich-editor--label
  :deep(.hover-editor__content),
.cv-rich-item--level-circle-ring
  .cv-rich-editor--label
  :deep(.hover-editor__content p) {
  text-align: center;
}

.cv-progress-line-row {
  display: contents;
}

.cv-progress-line-track {
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: color-mix(in srgb, var(--cv-secondary, #93c5fd) 18%, transparent);
  box-shadow: inset 0 0 0 1px
    color-mix(in srgb, var(--cv-secondary, #93c5fd) 18%, transparent);
}

.cv-progress-line-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    var(--cv-primary, #0f172a),
    var(--cv-secondary, #93c5fd)
  );
}

.cv-progress-line-value {
  font-size: 10px;
  font-weight: 800;
  color: color-mix(in srgb, currentColor 76%, transparent);
  text-align: end;
}

.cv-aside-section-item .cv-rich-item--progress-line.cv-rich-item--leveled {
  grid-template-columns: 1fr;
}

.cv-rich-entry-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.cv-rich-editor {
  position: relative;
  min-width: 0;
  color: inherit;
}

.cv-rich-editor :deep(.hover-editor__content p) {
  margin: 0;
}

.cv-rich-editor :deep(.hover-editor__toolbar) {
  position: absolute;
  top: auto;
  bottom: calc(100% - 1px);
  left: 0;
  z-index: 20;
  width: max-content;
  max-width: min(560px, 92vw);
  margin-bottom: 0;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-on-surface)) 14%, transparent);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
}

.cv-rich-editor :deep(.toolbar-size) {
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border-color: color-mix(
    in srgb,
    rgb(var(--v-theme-on-surface)) 22%,
    transparent
  );
}

.cv-rich-editor :deep(.v-btn) {
  color: rgb(var(--v-theme-on-surface));
}

.cv-rich-editor--period,
.cv-rich-editor--value {
  color: color-mix(in srgb, currentColor 72%, transparent);
  white-space: nowrap;
}

.cv-rich-editor--subtitle,
.cv-rich-editor--description {
  margin-top: 2px;
}

.cv-rich-editor--description {
  flex: 1 1 auto;
  font-weight: 400;
  color: color-mix(in srgb, currentColor 82%, transparent);
  white-space: pre-line;
}

.cv-rich-prefix {
  flex: 0 0 auto;
  font-weight: 700;
}

.cv-rich-stars {
  color: var(--cv-secondary, #93c5fd);
  letter-spacing: 0.75px;
  font-size: 12px;
}

.cv-rich-dots {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.cv-rich-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  border: 1px solid var(--cv-secondary, #93c5fd);
}

.cv-rich-dot--filled {
  background: var(--cv-secondary, #93c5fd);
}

.cv-rich-progress {
  width: 90px;
  height: 8px;
  background: rgba(148, 163, 184, 0.35);
  border-radius: 999px;
  overflow: hidden;
}

.cv-rich-progress i {
  display: block;
  height: 100%;
  background: var(--cv-secondary, #93c5fd);
}

.cv-rich-circle {
  --level: 0;
  position: relative;
  width: 54px;
  height: 54px;
  border: 0;
  border-radius: 999px;
  background: conic-gradient(
    var(--cv-secondary, #93c5fd) calc(var(--level) * 1%),
    color-mix(in srgb, var(--cv-secondary, #93c5fd) 18%, transparent) 0
  );
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cv-rich-circle::before {
  content: '';
  position: absolute;
  inset: 5px;
  border-radius: inherit;
  background: var(--cv-page-background, #fff);
}

.cv-rich-circle-value {
  position: relative;
  z-index: 1;
  font-size: 10px;
  font-weight: 900;
  color: var(--cv-page-text, #0f172a);
}
</style>
