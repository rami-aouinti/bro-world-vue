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
  sectionIcon?: string
  showSectionIcon?: boolean
}>(), {
  editable: false,
  variant: 'classic',
  themeTokens: () => ({}),
  layoutDensity: 'normal',
  toolbarEnabled: false,
  title: 'References',
  canMoveUp: false,
  canMoveDown: false,
  sectionIcon: undefined,
  showSectionIcon: true,
})

const emit = defineEmits<{
  (event: 'add-item', sectionKey: 'reference'): void
  (event: 'change-variant', sectionKey: 'reference', variant: string): void
  (event: 'move-section', sectionKey: 'reference', direction: 'up' | 'down'): void
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
  <section :class="['reference-section', 'resume-section-hoverable', `density-${layoutDensity}`]" :style="sectionStyle">
    <SectionToolbar
      v-if="toolbarEnabled"
      section-key="reference"
      :variants="[{ label: 'Classic', value: 'classic' }]"
      current-variant="classic"
      :can-move-up="canMoveUp"
      :can-move-down="canMoveDown"
      @add-item="() => emit('add-item', 'reference')"
      @change-variant="(_, next) => emit('change-variant', 'reference', next)"
      @move-up="() => emit('move-section', 'reference', 'up')"
      @move-down="() => emit('move-section', 'reference', 'down')"
    />

    <h3 class="cv-heading-section">
      <v-icon v-if="showSectionIcon && sectionIcon" :icon="sectionIcon" size="18" />
      <span>{{ title }}</span>
    </h3>
    <ul class="entry-list">
      <li v-for="(reference, index) in resume.references" :key="`${reference.name}-${index}`">
        <span class="editable-text" :contenteditable="editable" @input="event => updateText(`references.${index}.name`, (event.target as HTMLElement).innerText)">{{ reference.name }}</span>
        <small class="ms-2 editable-text" :contenteditable="editable" @input="event => updateText(`references.${index}.company`, (event.target as HTMLElement).innerText)">{{ reference.company }}</small>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.reference-section { position: relative; }
.cv-heading-section { display: inline-flex; align-items: center; gap: var(--cv-space-2, 8px); }
.entry-list { margin: 0; padding: 0; list-style: none; }
.entry-list li { margin-bottom: var(--cv-space-2, 8px); }
</style>
