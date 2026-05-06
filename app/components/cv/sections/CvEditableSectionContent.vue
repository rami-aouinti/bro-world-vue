<script setup lang="ts">
import HoverRichTextEditor from '~/components/Resume/Create/HoverRichTextEditor.vue'

const props = withDefaults(
  defineProps<{
    items?: string[]
    sectionKey?: string
    variant?: string
  }>(),
  {
    items: () => [],
    sectionKey: '',
    variant: 'classic',
  },
)

const emit = defineEmits<{
  (event: 'update-item', index: number, value: string): void
}>()

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

function clampLevel(value: number) {
  return Math.max(0, Math.min(100, value))
}

function splitLeveledItem(raw: string) {
  const match = String(raw || '').match(/^(.*)\s\((\d+)%\)$/)
  return match
    ? { label: match[1], value: clampLevel(Number(match[2])) }
    : { label: String(raw || ''), value: 0 }
}

function progressCircleStyle(raw: string) {
  const value = splitLeveledItem(raw).value

  return {
    background: `conic-gradient(var(--cv-secondary, #93c5fd) ${value}%, rgba(148, 163, 184, 0.24) 0)`,
  }
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
  const level = clampLevel(Number.parseInt(value, 10) || 0)
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
</script>

<template>
  <div
    class="cv-rich-section"
    :class="[`cv-rich-section--${variant}`, `cv-rich-section--${sectionKey}`]"
  >
    <div
      v-for="(item, index) in items"
      :key="index"
      class="cv-rich-item"
      :class="[
        `cv-rich-item--${variant}`,
        {
          'cv-rich-item--complex': isComplexItem(item),
          'cv-rich-item--timeline-complex':
            isComplexItem(item) && variant === 'timeline',
          'cv-rich-item--leveled': isLeveledSection(),
        },
      ]"
    >
      <template v-if="isComplexItem(item)">
        <template v-if="variant === 'timeline'">
          <div class="cv-rich-timeline-dot" aria-hidden="true" />
          <HoverRichTextEditor
            v-if="splitComplexItem(item).period"
            class="cv-rich-editor cv-rich-editor--period cv-rich-editor--timeline-period"
            :model-value="splitComplexItem(item).period"
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
              :model-value="splitComplexItem(item).period"
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
            <span v-else-if="variant === 'dot'" class="cv-rich-prefix">•</span>
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
        <template v-if="variant === 'progress-circle'">
          <span
            class="cv-rich-circle"
            :style="progressCircleStyle(item)"
            role="img"
            :aria-label="`${splitLeveledItem(item).label}: ${splitLeveledItem(item).value}%`"
            :title="splitLeveledItem(item).label"
          >
            <HoverRichTextEditor
              class="cv-rich-editor cv-rich-editor--circle-value"
              :model-value="`${splitLeveledItem(item).value}%`"
              placeholder="Level"
              font-size="13px"
              font-weight="700"
              font-family="var(--cv-text-body, inherit)"
              color="inherit"
              @update:model-value="updateLeveledValue(index, item, $event)"
            />
          </span>
        </template>
        <template v-else>
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
          <template v-else-if="variant === 'progress-line'">
            <span class="cv-rich-progress"
              ><i :style="{ width: `${splitLeveledItem(item).value}%` }"
            /></span>
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

.cv-rich-item--cards {
  margin-bottom: 10px;
  border: 1px solid color-mix(in srgb, var(--cv-secondary, #93c5fd) 40%, white);
  border-radius: 8px;
  padding: 6px 8px;
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

.cv-rich-section--progress-circle.cv-rich-section--skills,
.cv-rich-section--progress-circle.cv-rich-section--languages {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.cv-rich-item--progress-circle.cv-rich-item--leveled {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cv-rich-circle {
  display: inline-flex;
  width: 54px;
  height: 54px;
  padding: 6px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  flex: 0 0 auto;
}

.cv-rich-editor--circle-value {
  display: inline-flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  background: var(--cv-circle-inner, var(--cv-page-background, #fff));
  color: color-mix(in srgb, currentColor 82%, #1f2937);
  text-align: center;
}

.cv-rich-editor--circle-value :deep(.hover-editor__content) {
  display: flex;
  width: 100%;
  min-height: 100%;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
