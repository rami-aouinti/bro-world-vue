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
  <section :class="['education', `density-${layoutDensity}`, { 'education-grid': variant === 'two-column' }]" :style="sectionStyle">
    <SectionToolbar v-if="toolbarEnabled" section-key="education" :variants="[{ label: 'Classic', value: 'classic' }, { label: 'Timeline', value: 'timeline' }, { label: 'Two columns', value: 'two-column' }]" :current-variant="variant" :can-move-up="canMoveUp" :can-move-down="canMoveDown" @add-item="() => emit('add-item', 'education')" @change-variant="(_, next) => emit('change-variant', 'education', next)" @move-up="() => emit('move-section', 'education', 'up')" @move-down="() => emit('move-section', 'education', 'down')" />
    <h2 class="cv-heading-section">{{ title }}</h2>
    <article v-for="(item, index) in resume.education" :key="`${item.school}-${index}`" class="entry text-dark" :class="{ 'timeline-entry': variant === 'timeline' }">
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
.education-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.entry { margin-bottom: var(--entry-gap, 16px); }
.timeline-entry { border-left: 2px solid color-mix(in srgb, var(--cv-accent) 38%, transparent); padding-left: 10px; }
.density-compact { --entry-gap: 10px; }
.density-normal { --entry-gap: 16px; }
.density-spacious { --entry-gap: 22px; }
</style>
