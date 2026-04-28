<script setup lang="ts">
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'
import { getSectionRegistryEntry } from '~/constants/resumeSectionRegistry'

const props = withDefaults(defineProps<{
  resume: any
  editable?: boolean
  variant?: 'classic' | string
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
  title: 'Interests',
  canMoveUp: false,
  canMoveDown: false,
})

const emit = defineEmits<{
  (event: 'add-item', sectionKey: 'hobby'): void
  (event: 'change-variant', sectionKey: 'hobby', variant: string): void
  (event: 'move-section', sectionKey: 'hobby', direction: 'up' | 'down'): void
}>()

const sectionStyle = computed(() => ({ ...props.themeTokens }))
const sectionRegistry = getSectionRegistryEntry('hobby')

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
  <section :class="['hobby-section', 'resume-section-hoverable', `density-${layoutDensity}`]" :style="sectionStyle">
    <SectionToolbar
      v-if="toolbarEnabled"
      section-key="hobby"
      :variants="sectionRegistry.variants"
      :actions="sectionRegistry.toolbarActions"
      :current-variant="variant"
      :can-move-up="canMoveUp"
      :can-move-down="canMoveDown"
      @add-item="() => emit('add-item', 'hobby')"
      @change-variant="(_, next) => emit('change-variant', 'hobby', next)"
      @move-up="() => emit('move-section', 'hobby', 'up')"
      @move-down="() => emit('move-section', 'hobby', 'down')"
    />

    <h3 class="cv-heading-section">{{ title }}</h3>
    <ul class="entry-list">
      <li v-for="(hobby, index) in resume.hobbies" :key="`${hobby}-${index}`" class="editable-text" :contenteditable="editable" @input="event => updateText(`hobbies.${index}`, (event.target as HTMLElement).innerText)">
        {{ hobby }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
.hobby-section { position: relative; }
.entry-list { margin: 0; padding: 0; list-style: none; }
.entry-list li { margin-bottom: var(--entry-gap, var(--cv-space-2, 8px)); }
.entry-list li:last-child { margin-bottom: 0; }
.density-compact { --entry-gap: calc(var(--cv-space-2, 8px) - 2px); }
.density-normal { --entry-gap: var(--cv-space-2, 8px); }
.density-spacious { --entry-gap: var(--cv-space-3, 12px); }
</style>
