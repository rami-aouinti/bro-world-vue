<script setup lang="ts">
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'

const props = withDefaults(defineProps<{
  resume: any
  editable?: boolean
  variant?: 'classic' | 'timeline' | 'two-column' | string
  themeTokens?: Record<string, string | number>
  layoutDensity?: 'compact' | 'normal' | 'spacious' | string
  toolbarEnabled?: boolean
  title?: string
  canMoveUp?: boolean
  canMoveDown?: boolean
}>(), {
  editable: false,
  variant: 'classic',
  themeTokens: () => ({}),
  layoutDensity: 'normal',
  toolbarEnabled: false,
  title: 'Education',
  canMoveUp: false,
  canMoveDown: false,
})
const emit = defineEmits<{
  (event: 'add-item', sectionKey: 'education'): void
  (event: 'change-variant', sectionKey: 'education', variant: string): void
  (event: 'move-section', sectionKey: 'education', direction: 'up' | 'down'): void
}>()
const sectionStyle = computed(() => ({ ...props.themeTokens }))
const safeVariant = computed<'classic' | 'timeline' | 'two-column'>(() => {
  if (props.variant === 'classic' || props.variant === 'timeline' || props.variant === 'two-column') {
    return props.variant
  }
  if (import.meta.dev) {
    console.warn(`[resume-section:education] Unknown variant "${String(props.variant)}"; fallback to "classic".`)
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
  <section :class="['education', 'resume-section-hoverable', `density-${layoutDensity}`, { 'education-grid': safeVariant === 'two-column' }]" :style="sectionStyle">
    <SectionToolbar v-if="toolbarEnabled" section-key="education" :variants="[{ label: 'Classic', value: 'classic' }, { label: 'Timeline', value: 'timeline' }, { label: 'Two columns', value: 'two-column' }]" :current-variant="safeVariant" :can-move-up="canMoveUp" :can-move-down="canMoveDown" @add-item="() => emit('add-item', 'education')" @change-variant="(_, next) => emit('change-variant', 'education', next)" @move-up="() => emit('move-section', 'education', 'up')" @move-down="() => emit('move-section', 'education', 'down')" />
    <h2 class="cv-heading-section">{{ title }}</h2>
    <article v-for="(item, index) in resume.education" :key="`${item.school}-${index}`" class="entry text-dark" :class="{ 'timeline-entry': safeVariant === 'timeline' }">
      <h4 class="text-dark">
        <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.degree`, (event.target as HTMLElement).innerText)">{{ item.degree }}</span>,
        <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.school`, (event.target as HTMLElement).innerText)">{{ item.school }}</span>
      </h4>
      <p class="dates">
        <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.start`, (event.target as HTMLElement).innerText)">{{ item.start }}</span> -
        <span class="editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.end`, (event.target as HTMLElement).innerText)">{{ item.end }}</span>
      </p>
      <p v-if="item.note" class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`education.${index}.note`, (event.target as HTMLElement).innerText)">{{ item.note }}</p>
    </article>
  </section>
</template>
<style scoped>
.education {
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
.education-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.entry { margin-bottom: var(--entry-gap, 16px); }
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
.timeline-entry { border-left: 2px solid color-mix(in srgb, var(--cv-accent) 38%, transparent); padding-left: 10px; }
.density-compact { --entry-gap: 10px; }
.density-normal { --entry-gap: 16px; }
.density-spacious { --entry-gap: 22px; }
</style>
