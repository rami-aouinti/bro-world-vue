<script setup lang="ts">
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'

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
  title: 'Certifications',
  canMoveUp: false,
  canMoveDown: false,
})

const emit = defineEmits<{
  (event: 'add-item', sectionKey: 'certification'): void
  (event: 'change-variant', sectionKey: 'certification', variant: string): void
  (event: 'move-section', sectionKey: 'certification', direction: 'up' | 'down'): void
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
  <section :class="['certification-section', 'resume-section-hoverable', `density-${layoutDensity}`]" :style="sectionStyle">
    <SectionToolbar
      v-if="toolbarEnabled"
      section-key="certification"
      :variants="[{ label: 'Classic', value: 'classic' }]"
      current-variant="classic"
      :can-move-up="canMoveUp"
      :can-move-down="canMoveDown"
      @add-item="() => emit('add-item', 'certification')"
      @change-variant="(_, next) => emit('change-variant', 'certification', next)"
      @move-up="() => emit('move-section', 'certification', 'up')"
      @move-down="() => emit('move-section', 'certification', 'down')"
    />

    <h3 class="cv-heading-section">{{ title }}</h3>
    <ul class="entry-list">
      <li v-for="(course, index) in resume.courses" :key="`${course.title}-${index}`">
        <span class="editable-text" :contenteditable="editable" @input="event => updateText(`courses.${index}.title`, (event.target as HTMLElement).innerText)">{{ course.title }}</span>
        <small class="ms-2 editable-text" :contenteditable="editable" @input="event => updateText(`courses.${index}.school`, (event.target as HTMLElement).innerText)">{{ course.school }}</small>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.certification-section { position: relative; }
.entry-list { margin: 0; padding: 0; list-style: none; }
.entry-list li { margin-bottom: var(--cv-space-2, 8px); }
</style>
