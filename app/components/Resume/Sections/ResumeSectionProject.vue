<script setup lang="ts">
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'

const props = withDefaults(defineProps<{
  resume: any
  editable?: boolean
  variant?: 'list' | 'cards' | 'two-column' | string
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
  <section :class="[`density-${layoutDensity}`]" :style="sectionStyle">
    <SectionToolbar v-if="toolbarEnabled" section-key="project" :variants="[{ label: 'List', value: 'list' }, { label: 'Cards', value: 'cards' }, { label: 'Two columns', value: 'two-column' }]" :current-variant="variant" :can-move-up="canMoveUp" :can-move-down="canMoveDown" @add-item="() => emit('add-item', 'project')" @change-variant="(_, next) => emit('change-variant', 'project', next)" @move-up="() => emit('move-section', 'project', 'up')" @move-down="() => emit('move-section', 'project', 'down')" />
    <h2 class="cv-heading-section">{{ title }}</h2>
    <div :class="['project-grid', { 'project-grid--two-column': variant === 'two-column' }]">
      <article v-for="(project, index) in resume.projects" :key="`${project.name}-${index}`" class="entry text-dark" :class="{ 'project-card': variant !== 'list' }">
        <h4 class="text-dark"><span class="editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.name`, (event.target as HTMLElement).innerText)">{{ project.name }}</span></h4>
        <p class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`projects.${index}.summary`, (event.target as HTMLElement).innerText)">{{ project.summary }}</p>
      </article>
    </div>
  </section>
</template>
<style scoped>
.project-grid { display: grid; gap: var(--entry-gap, 10px); }
.project-grid--two-column { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.project-card { border: 1px solid color-mix(in srgb, var(--cv-accent) 22%, transparent); border-radius: 10px; padding: 10px; }
.density-compact { --entry-gap: 8px; }
.density-normal { --entry-gap: 12px; }
.density-spacious { --entry-gap: 16px; }
</style>
