<script setup lang="ts">
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'
import { RESUME_CONTENT_STYLE_OPTIONS, getSectionRegistryEntry } from '~/constants/resumeSectionRegistry'
import type { ResumeSectionIconStyle } from '~/constants/resumeTemplateSkins'

const props = withDefaults(defineProps<{
  resume: any
  editable?: boolean
  variant?: 'classic' | 'timeline' | 'two-column' | string
  layoutSettings?: {
    dateColumnWidth?: number | string
  }
  themeTokens?: Record<string, string | number>
  layoutDensity?: 'compact' | 'normal' | 'spacious' | string
  toolbarEnabled?: boolean
  title?: string
  canMoveUp?: boolean
  canMoveDown?: boolean
  sectionIcon?: string
  showSectionIcon?: boolean
  sectionIconStyle?: ResumeSectionIconStyle
}>(), {
  editable: false,
  variant: 'classic',
  layoutSettings: () => ({}),
  themeTokens: () => ({}),
  layoutDensity: 'normal',
  toolbarEnabled: false,
  title: 'Education',
  canMoveUp: false,
  canMoveDown: false,
  sectionIcon: undefined,
  showSectionIcon: true,
  sectionIconStyle: undefined,
})
const emit = defineEmits<{
  (event: 'add-item', sectionKey: 'education'): void
  (event: 'change-variant', sectionKey: 'education', variant: string): void
  (event: 'move-section', sectionKey: 'education', direction: 'up' | 'down'): void
}>()
const sectionStyle = computed(() => {
  const width = props.layoutSettings?.dateColumnWidth
  const normalized = typeof width === 'number' ? `${width}px` : width
  return {
    ...props.themeTokens,
    '--resume-date-column-width': normalized || '140px',
  }
})
const iconVariantClass = computed(() =>
  props.sectionIconStyle?.variant ? `section-icon--${props.sectionIconStyle.variant}` : 'section-icon--outline',
)
const iconStyle = computed(() => ({
  '--resume-section-icon-size': `${props.sectionIconStyle?.size ?? 18}px`,
  '--resume-section-icon-color': props.sectionIconStyle?.color ?? 'var(--cv-accent)',
  '--resume-section-icon-gap': `${props.sectionIconStyle?.spacing ?? 8}px`,
}))
const safeVariant = computed<'classic' | 'timeline' | 'two-column'>(() => {
  if (props.variant === 'classic' || props.variant === 'timeline' || props.variant === 'two-column') {
    return props.variant
  }
  if (import.meta.dev) {
    console.warn(`[resume-section:education] Unknown variant "${String(props.variant)}"; fallback to "classic".`)
  }
  return 'classic'
})
const sectionRegistry = getSectionRegistryEntry('education')
const contentStyles = computed(() =>
  RESUME_CONTENT_STYLE_OPTIONS.filter(option => sectionRegistry.contentStyles.includes(option.value)),
)
function updateText(path: string, value: string) {
  const segments = path.split('.')
  const last = segments.pop()
  if (!last) return
  let target: Record<string, any> = props.resume
  for (const segment of segments) {
    if (!(segment in target)) return
    target = target[segment]
  }
  target[last] = value
}

function resolveContentStyle(item: Record<string, unknown>) {
  return item.contentStyle === 'dashes' || item.contentStyle === 'timeline' ? item.contentStyle : 'points'
}

function resolvePoints(item: Record<string, unknown>) {
  if (Array.isArray(item.points) && item.points.length) return item.points
  const note = String(item.note || '').trim()
  return note ? [note] : []
}

function resolveDashes(item: Record<string, unknown>) {
  if (Array.isArray(item.dashes) && item.dashes.length) return item.dashes
  return resolvePoints(item)
}

function resolveTimelineEvents(item: Record<string, unknown>) {
  if (Array.isArray(item.timelineEvents) && item.timelineEvents.length) return item.timelineEvents
  return resolvePoints(item).map(detail => ({ label: '', detail }))
}
</script>
<template>
  <section :class="['education', 'resume-section-hoverable', `density-${layoutDensity}`, `education--${safeVariant}`]" :style="sectionStyle">
    <SectionToolbar
      v-if="toolbarEnabled"
      section-key="education"
      :variants="sectionRegistry.variants"
      :content-styles="contentStyles"
      :actions="sectionRegistry.toolbarActions"
      :current-variant="safeVariant"
      :can-move-up="canMoveUp"
      :can-move-down="canMoveDown"
      @add-item="() => emit('add-item', 'education')"
      @change-variant="(_, next) => emit('change-variant', 'education', next)"
      @move-up="() => emit('move-section', 'education', 'up')"
      @move-down="() => emit('move-section', 'education', 'down')"
    />
    <h2 class="cv-heading-section">
      <span v-if="showSectionIcon && sectionIcon" class="section-icon" :class="iconVariantClass" :style="iconStyle">
        <v-icon :icon="sectionIcon" :size="sectionIconStyle?.size ?? 18" />
      </span>
      <span>{{ title }}</span>
    </h2>
    <div class="education-list">
      <article v-for="(item, index) in resume.education" :key="`${item.school}-${index}`" class="entry text-dark">
        <p class="dates date-column">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.start`, (event.target as HTMLElement).innerText)">{{ item.start }}</span> -
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.end`, (event.target as HTMLElement).innerText)">{{ item.end }}</span>
        </p>
        <template v-if="resolveContentStyle(item) === 'timeline'">
          <div class="timeline-block">
            <div v-for="(event, eventIndex) in resolveTimelineEvents(item)" :key="eventIndex" class="timeline-event">
              <strong class="editable-text" :contenteditable="editable" @input="entry => updateText(`education.${index}.timelineEvents.${eventIndex}.label`, (entry.target as HTMLElement).innerText)">{{ event.label }}</strong>
              <span class="editable-text" :contenteditable="editable" @input="entry => updateText(`education.${index}.timelineEvents.${eventIndex}.detail`, (entry.target as HTMLElement).innerText)">{{ event.detail }}</span>
            </div>
          </div>
        </template>
        <ul v-else-if="resolveContentStyle(item) === 'dashes'" class="dash-list">
          <li v-for="(dash, dashIndex) in resolveDashes(item)" :key="dashIndex" class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.dashes.${dashIndex}`, (event.target as HTMLElement).innerText)">{{ dash }}</li>
        </ul>
        <ul v-else-if="resolvePoints(item).length">
          <li v-for="(point, pointIndex) in resolvePoints(item)" :key="pointIndex" class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.points.${pointIndex}`, (event.target as HTMLElement).innerText)">{{ point }}</li>
        </ul>
        <div class="content-column">
          <div class="entry-heading">
            <v-avatar class="school-logo" rounded="lg" size="30">
              <v-img v-if="item.schoolImageUrl" :src="item.schoolImageUrl" alt="School logo" cover />
              <v-icon v-else icon="mdi-school-outline" size="17" />
            </v-avatar>
            <h4 class="text-dark">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.degree`, (event.target as HTMLElement).innerText)">{{ item.degree }}</span>,
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.school`, (event.target as HTMLElement).innerText)">{{ item.school }}</span>
            </h4>
          </div>
          <p v-if="item.note" class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.note`, (event.target as HTMLElement).innerText)">{{ item.note }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
<style scoped>
.education {
  --cv-space-1: var(--cv-space-1, 4px);
  --cv-space-2: var(--cv-space-2, 8px);
  --cv-space-3: var(--cv-space-3, 12px);
  --cv-space-4: var(--cv-space-4, 16px);
  --cv-space-5: var(--cv-space-5, 20px);
  --cv-space-6: var(--cv-space-6, 24px);
  --cv-marker-accent: color-mix(in srgb, var(--cv-accent) 55%, transparent);
  --cv-timeline-line: color-mix(in srgb, var(--cv-accent) 38%, transparent);
  --cv-card-border-soft: color-mix(in srgb, var(--cv-accent) 18%, transparent);
  --cv-card-bg-soft: color-mix(in srgb, var(--cv-accent) 4%, transparent);
  --cv-body-line-height: 1.52;
  --cv-list-indent: calc(var(--cv-space-4) + var(--cv-space-2));
  --cv-dash-marker-width: 1.35em;

  position: relative;
  border-bottom: var(--rs-section-separator, none);
  padding-bottom: var(--rs-section-padding-bottom, 0);
}
.cv-heading-section {
  display: inline-flex;
  align-items: center;
  gap: var(--resume-section-icon-gap, var(--cv-space-2));
  border-bottom: var(--rs-heading-border-bottom, 0);
  background: var(--rs-heading-bg, transparent);
  border-radius: var(--rs-heading-radius, 0);
  padding: var(--rs-heading-padding, 0);
}
.section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: calc(var(--resume-section-icon-size, 18px) + 8px);
  height: calc(var(--resume-section-icon-size, 18px) + 8px);
  color: var(--resume-section-icon-color, var(--cv-accent));
}
.section-icon--outline {
  border: 1px solid color-mix(in srgb, currentColor 28%, transparent);
  border-radius: var(--resume-section-icon-radius, 999px);
}
.section-icon--filled {
  border-radius: var(--resume-section-icon-radius, 999px);
  background: color-mix(in srgb, currentColor 88%, white);
  color: #fff;
}
.section-icon--rounded {
  border-radius: calc(var(--resume-section-icon-radius, 8px) + 2px);
  background: color-mix(in srgb, currentColor 18%, transparent);
}
.education-list {
  display: block;
}
.entry {
  margin-bottom: var(--entry-gap, var(--cv-space-4));
  display: grid;
  grid-template-columns: minmax(140px, var(--resume-date-column-width, 140px)) minmax(0, 1fr);
  column-gap: var(--cv-space-4);
  align-items: start;
  position: relative;
  border: var(--rs-card-border, none);
  background: var(--rs-card-bg, transparent);
  border-radius: var(--rs-card-radius, 0);
  padding: var(--rs-card-padding, 0);
}
.date-column {
  color: color-mix(in srgb, var(--cv-text, currentColor) 78%, transparent);
}
.content-column {
  position: relative;
  min-width: 0;
}
.entry-heading {
  display: flex;
  align-items: center;
  gap: var(--cv-space-2);
}
.entry-heading h4 {
  margin: 0;
}
.school-logo {
  flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--cv-accent) 20%, transparent);
  background: color-mix(in srgb, var(--cv-accent) 6%, transparent);
}

/* Classic variant */
.education--classic .entry {
  grid-template-columns: minmax(140px, var(--resume-date-column-width, 140px)) minmax(0, 1fr);
}
.education--classic .content-column {
  border-left: var(--rs-entry-border-left, none);
  padding-left: var(--rs-entry-padding-left, 0);
}

/* Timeline variant */
.education--timeline .content-column {
  border-left: 2px solid var(--cv-timeline-line);
  padding-left: calc(var(--cv-space-2) + var(--cv-space-1) / 2);
}
.education--timeline .content-column::before {
  content: '';
  position: absolute;
  left: calc((var(--cv-space-2) + var(--cv-space-1)) * -1);
  top: .55rem;
  width: max(8px, var(--rs-marker-width, var(--rs-marker-size, 8px)));
  height: max(8px, var(--rs-marker-height, var(--rs-marker-size, 8px)));
  border-radius: 999px;
  background: var(--cv-accent);
}

/* Two-column variant */
.education--two-column .education-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--cv-space-4) var(--cv-space-6);
}
.education--two-column .entry {
  width: 100%;
  max-width: 100%;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--cv-space-2) - var(--cv-space-1) / 2);
  border: var(--rs-card-border, 1px solid var(--cv-card-border-soft));
  border-radius: var(--rs-card-radius, var(--cv-space-2));
  background: var(--rs-card-bg, var(--cv-card-bg-soft));
  padding: var(--rs-card-padding, var(--cv-space-3));
}
@media (max-width: 900px) {
  .education--two-column .education-list {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 900px) {
  .entry {
    grid-template-columns: minmax(0, 1fr);
    row-gap: var(--cv-space-2);
  }
}

.entry li,
.entry p,
.entry strong {
  max-width: none;
  min-width: 0;
}
.entry p,
.entry li {
  line-height: var(--cv-body-line-height);
}
.entry ul {
  margin: var(--cv-space-2) 0 0;
  padding-inline-start: var(--cv-list-indent);
}
.density-compact { --entry-gap: calc(var(--cv-space-2) + var(--cv-space-1) / 2); }
.density-normal { --entry-gap: var(--cv-space-4); }
.density-spacious { --entry-gap: calc(var(--cv-space-4) + var(--cv-space-2) - var(--cv-space-1) / 2); }
.dash-list {
  list-style: none;
  padding-inline-start: var(--cv-list-indent);
}
.dash-list li {
  position: relative;
  padding-inline-start: var(--cv-dash-marker-width);
}
.dash-list li::before {
  content: '—';
  position: absolute;
  inset-inline-start: 0;
  width: var(--cv-dash-marker-width);
}
.timeline-block { display: grid; gap: 6px; }
.timeline-event { display: grid; gap: 2px; border-left: 2px solid var(--cv-marker-accent); padding-left: 8px; }
</style>
