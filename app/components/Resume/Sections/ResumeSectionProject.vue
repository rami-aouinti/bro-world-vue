<script setup lang="ts">
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'
import { RESUME_CONTENT_STYLE_OPTIONS, getSectionRegistryEntry } from '~/constants/resumeSectionRegistry'
import type { ResumeSectionIconStyle } from '~/constants/resumeTemplateSkins'

const props = withDefaults(defineProps<{
  resume: any
  editable?: boolean
  variant?: 'classic' | 'list' | 'cards' | 'two-column' | 'timeline' | string
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
  variant: 'list',
  layoutSettings: () => ({}),
  themeTokens: () => ({}),
  layoutDensity: 'normal',
  toolbarEnabled: false,
  title: 'Projects',
  canMoveUp: false,
  canMoveDown: false,
  sectionIcon: undefined,
  showSectionIcon: true,
  sectionIconStyle: undefined,
})
const emit = defineEmits<{
  (event: 'add-item', sectionKey: 'project'): void
  (event: 'change-variant', sectionKey: 'project', variant: string): void
  (event: 'move-section', sectionKey: 'project', direction: 'up' | 'down'): void
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
const safeVariant = computed<'classic' | 'list' | 'cards' | 'two-column' | 'timeline'>(() => {
  if (props.variant === 'classic' || props.variant === 'list' || props.variant === 'cards' || props.variant === 'two-column' || props.variant === 'timeline') {
    return props.variant
  }
  if (import.meta.dev) {
    console.warn(`[resume-section:project] Unknown variant "${String(props.variant)}"; fallback to "classic".`)
  }
  return 'classic'
})
const isTimelineVariant = computed(() => safeVariant.value === 'timeline')
const sectionRegistry = getSectionRegistryEntry('project')
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

function detectProvider(project: Record<string, any>): 'github' | 'gitlab' | 'other' | null {
  if (project.repositoryProvider === 'github' || project.repositoryProvider === 'gitlab' || project.repositoryProvider === 'other') {
    return project.repositoryProvider
  }
  const repositoryUrl = String(project.repositoryUrl || '').toLowerCase()
  if (!repositoryUrl) return null
  if (repositoryUrl.includes('github.com')) return 'github'
  if (repositoryUrl.includes('gitlab.com')) return 'gitlab'
  return 'other'
}

function providerIcon(project: Record<string, any>) {
  const provider = detectProvider(project)
  if (provider === 'github') return 'mdi-github'
  if (provider === 'gitlab') return 'mdi-gitlab'
  if (provider === 'other') return 'mdi-source-repository'
  return ''
}

function resolveContentStyle(item: Record<string, unknown>) {
  return item.contentStyle === 'dashes' || item.contentStyle === 'timeline' ? item.contentStyle : 'points'
}

function resolvePoints(item: Record<string, unknown>) {
  if (Array.isArray(item.points) && item.points.length) return item.points
  const summary = String(item.summary || '').trim()
  return summary ? [summary] : []
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
  <section :class="['project-section', 'resume-section-hoverable', `density-${layoutDensity}`, { 'project-section--timeline': isTimelineVariant }]" :style="sectionStyle">
    <SectionToolbar
      v-if="toolbarEnabled"
      section-key="project"
      :variants="sectionRegistry.variants"
      :content-styles="contentStyles"
      :actions="sectionRegistry.toolbarActions"
      :current-variant="safeVariant"
      :can-move-up="canMoveUp"
      :can-move-down="canMoveDown"
      @add-item="() => emit('add-item', 'project')"
      @change-variant="(_, next) => emit('change-variant', 'project', next)"
      @move-up="() => emit('move-section', 'project', 'up')"
      @move-down="() => emit('move-section', 'project', 'down')"
    />
    <h2 class="cv-heading-section">
      <span v-if="showSectionIcon && sectionIcon" class="section-icon" :class="iconVariantClass" :style="iconStyle">
        <v-icon :icon="sectionIcon" :size="sectionIconStyle?.size ?? 18" />
      </span>
      <span>{{ title }}</span>
    </h2>
    <div :class="['project-grid', { 'project-grid--two-column': safeVariant === 'two-column' }]">
      <article
        v-for="(project, index) in resume.projects"
        :key="`${project.name}-${index}`"
        class="entry text-dark"
        :class="{ 'project-card': safeVariant === 'cards' || safeVariant === 'two-column' }"
      >
        <div class="date-column dates">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.start`, (event.target as HTMLElement).innerText)">{{ project.start || project.period || '' }}</span>
          <template v-if="project.end || project.periodEnd">
            -
            <span class="editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.end`, (event.target as HTMLElement).innerText)">{{ project.end || project.periodEnd }}</span>
          </template>
        </div>
        <div class="content-column">
          <div class="project-heading-row">
            <v-avatar v-if="project.imageUrl || project.company?.logo" size="40" rounded="lg" class="project-thumb">
              <v-img :src="project.imageUrl || project.company?.logo" cover />
            </v-avatar>
            <h4 class="text-dark project-title">
              <a
                v-if="project.repositoryUrl"
                :href="project.repositoryUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="project-title-link"
              >
                <span class="editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.name`, (event.target as HTMLElement).innerText)">{{ project.name }}</span>
                <v-icon v-if="providerIcon(project)" :icon="providerIcon(project)" size="16" class="ml-1" />
              </a>
              <span v-else class="editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.name`, (event.target as HTMLElement).innerText)">{{ project.name }}</span>
            </h4>
          </div>
          <p class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.summary`, (event.target as HTMLElement).innerText)">{{ project.summary }}</p>
        </div>
        <template v-if="resolveContentStyle(project) === 'timeline'">
          <div class="timeline-block">
            <div v-for="(event, eventIndex) in resolveTimelineEvents(project)" :key="eventIndex" class="timeline-event">
              <strong class="editable-text" :contenteditable="editable" @input="entry => updateText(`projects.${index}.timelineEvents.${eventIndex}.label`, (entry.target as HTMLElement).innerText)">{{ event.label }}</strong>
              <span class="editable-text" :contenteditable="editable" @input="entry => updateText(`projects.${index}.timelineEvents.${eventIndex}.detail`, (entry.target as HTMLElement).innerText)">{{ event.detail }}</span>
            </div>
          </div>
        </template>
        <ul v-else-if="resolveContentStyle(project) === 'dashes'" class="dash-list">
          <li v-for="(dash, dashIndex) in resolveDashes(project)" :key="dashIndex" class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.dashes.${dashIndex}`, (event.target as HTMLElement).innerText)">{{ dash }}</li>
        </ul>
        <ul v-else>
          <li v-for="(point, pointIndex) in resolvePoints(project)" :key="pointIndex" class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.points.${pointIndex}`, (event.target as HTMLElement).innerText)">{{ point }}</li>
        </ul>
      </article>
    </div>
  </section>
</template>
<style scoped>
.project-section {
  --cv-space-1: var(--cv-space-1, 4px);
  --cv-space-2: var(--cv-space-2, 8px);
  --cv-space-3: var(--cv-space-3, 12px);
  --cv-space-4: var(--cv-space-4, 16px);
  --cv-space-5: var(--cv-space-5, 20px);
  --cv-marker-accent: color-mix(in srgb, var(--cv-accent) 55%, transparent);
  --cv-card-border-soft: color-mix(in srgb, var(--cv-accent) 22%, transparent);
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
.project-grid { display: grid; gap: var(--entry-gap, calc(var(--cv-space-2) + var(--cv-space-1) / 2)); }
.project-grid--two-column { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.project-heading-row { display: flex; align-items: center; gap: var(--cv-space-2); margin-bottom: var(--cv-space-2); }
.project-thumb { flex-shrink: 0; border: 1px solid color-mix(in srgb, var(--cv-accent) 20%, transparent); }
.project-title { margin: 0; }
.project-title-link { color: inherit; text-decoration: none; display: inline-flex; align-items: center; gap: 2px; }
.project-title-link:hover { text-decoration: underline; }
.entry {
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
  border-left: var(--rs-entry-border-left, none);
  padding-left: var(--rs-entry-padding-left, 0);
}
.content-column::before {
  content: '';
  position: absolute;
  left: calc((var(--cv-space-2) + var(--cv-space-1)) * -1);
  top: .55rem;
  width: var(--rs-marker-width, var(--rs-marker-size, 0));
  height: var(--rs-marker-height, var(--rs-marker-size, 0));
  border-radius: var(--rs-marker-radius, 0);
  background: var(--cv-marker-accent);
}
.project-card { border: 1px solid var(--cv-card-border-soft); border-radius: calc(var(--resume-section-icon-radius, 8px) + 2px); padding: calc(var(--cv-space-2) + var(--cv-space-1) / 2); }
.project-section--timeline .content-column {
  border-left: 2px solid color-mix(in srgb, var(--cv-accent) 38%, transparent);
  padding-left: calc(var(--cv-space-2) + var(--cv-space-1) / 2);
}
.project-section--timeline .content-column::before {
  width: max(8px, var(--rs-marker-width, var(--rs-marker-size, 8px)));
  height: max(8px, var(--rs-marker-height, var(--rs-marker-size, 8px)));
  border-radius: 999px;
  background: var(--cv-accent);
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
.density-compact { --entry-gap: var(--cv-space-2); }
.density-normal { --entry-gap: var(--cv-space-3); }
.density-spacious { --entry-gap: var(--cv-space-4); }
.dash-list {
  list-style: none;
  margin: 6px 0 0;
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
.timeline-block { display: grid; gap: 6px; margin-top: 6px; }
.timeline-event { display: grid; gap: 2px; border-left: 2px solid var(--cv-marker-accent); padding-left: 8px; }
</style>
