<script setup lang="ts">
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'

const props = withDefaults(defineProps<{
  resume: any
  editable?: boolean
  variant?: 'classic' | 'list' | 'cards' | 'two-column' | string
  themeTokens?: Record<string, string | number>
  layoutDensity?: 'compact' | 'normal' | 'spacious' | string
  toolbarEnabled?: boolean
  title?: string
  canMoveUp?: boolean
  canMoveDown?: boolean
}>(), {
  editable: false,
  variant: 'list',
  themeTokens: () => ({}),
  layoutDensity: 'normal',
  toolbarEnabled: false,
  title: 'Projects',
  canMoveUp: false,
  canMoveDown: false,
})
const emit = defineEmits<{
  (event: 'add-item', sectionKey: 'project'): void
  (event: 'change-variant', sectionKey: 'project', variant: string): void
  (event: 'move-section', sectionKey: 'project', direction: 'up' | 'down'): void
}>()
const sectionStyle = computed(() => ({ ...props.themeTokens }))
const safeVariant = computed<'classic' | 'list' | 'cards' | 'two-column'>(() => {
  if (props.variant === 'classic' || props.variant === 'list' || props.variant === 'cards' || props.variant === 'two-column') {
    return props.variant
  }
  if (import.meta.dev) {
    console.warn(`[resume-section:project] Unknown variant "${String(props.variant)}"; fallback to "classic".`)
  }
  return 'classic'
})
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
</script>
<template>
  <section :class="['project-section', 'resume-section-hoverable', `density-${layoutDensity}`]" :style="sectionStyle">
    <SectionToolbar v-if="toolbarEnabled" section-key="project" :variants="[{ label: 'List', value: 'list' }, { label: 'Cards', value: 'cards' }, { label: 'Two columns', value: 'two-column' }]" :current-variant="safeVariant" :can-move-up="canMoveUp" :can-move-down="canMoveDown" @add-item="() => emit('add-item', 'project')" @change-variant="(_, next) => emit('change-variant', 'project', next)" @move-up="() => emit('move-section', 'project', 'up')" @move-down="() => emit('move-section', 'project', 'down')" />
    <h2 class="cv-heading-section">{{ title }}</h2>
    <div :class="['project-grid', { 'project-grid--two-column': safeVariant === 'two-column' }]">
      <article
        v-for="(project, index) in resume.projects"
        :key="`${project.name}-${index}`"
        class="entry text-dark"
        :class="{ 'project-card': safeVariant === 'cards' || safeVariant === 'two-column' }"
      >
        <h4 class="text-dark"><span class="editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.name`, (event.target as HTMLElement).innerText)">{{ project.name }}</span></h4>
        <p class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.summary`, (event.target as HTMLElement).innerText)">{{ project.summary }}</p>
      </article>
    </div>
  </section>
</template>
<style scoped>
.project-section {
  position: relative;
  border-bottom: var(--rs-section-separator, none);
  padding-bottom: var(--rs-section-padding-bottom, 0);
}
.cv-heading-section {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-bottom: var(--rs-heading-border-bottom, 0);
  background: var(--rs-heading-bg, transparent);
  border-radius: var(--rs-heading-radius, 0);
  padding: var(--rs-heading-padding, 0);
}
.project-grid { display: grid; gap: var(--entry-gap, 10px); }
.project-grid--two-column { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.entry {
  position: relative;
  border: var(--rs-card-border, none);
  background: var(--rs-card-bg, transparent);
  border-radius: var(--rs-card-radius, 0);
  padding: var(--rs-card-padding, 0);
  border-left: var(--rs-entry-border-left, none);
  padding-left: var(--rs-entry-padding-left, 0);
}
.entry::before {
  content: '';
  position: absolute;
  left: -10px;
  top: .55rem;
  width: var(--rs-marker-width, var(--rs-marker-size, 0));
  height: var(--rs-marker-height, var(--rs-marker-size, 0));
  border-radius: var(--rs-marker-radius, 0);
  background: color-mix(in srgb, var(--cv-accent) 55%, transparent);
}
.project-card { border: 1px solid color-mix(in srgb, var(--cv-accent) 22%, transparent); border-radius: 10px; padding: 10px; }
.density-compact { --entry-gap: 8px; }
.density-normal { --entry-gap: 12px; }
.density-spacious { --entry-gap: 16px; }
</style>
