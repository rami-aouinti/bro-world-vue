<script setup lang="ts">
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'
import { getSectionRegistryEntry } from '~/constants/resumeSectionRegistry'
import type { ResumeSectionIconStyle } from '~/constants/resumeTemplateSkins'

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
  sectionIconStyle?: ResumeSectionIconStyle
}>(), {
  editable: false,
  variant: 'classic',
  themeTokens: () => ({}),
  layoutDensity: 'normal',
  toolbarEnabled: false,
  title: 'Certifications',
  canMoveUp: false,
  canMoveDown: false,
  sectionIcon: undefined,
  showSectionIcon: true,
  sectionIconStyle: undefined,
})

const emit = defineEmits<{
  (event: 'add-item', sectionKey: 'certification'): void
  (event: 'change-variant', sectionKey: 'certification', variant: string): void
  (event: 'move-section', sectionKey: 'certification', direction: 'up' | 'down'): void
}>()

const sectionStyle = computed(() => ({ ...props.themeTokens }))
const sectionRegistry = getSectionRegistryEntry('certification')
const iconVariantClass = computed(() =>
  props.sectionIconStyle?.variant ? `section-icon--${props.sectionIconStyle.variant}` : 'section-icon--outline',
)
const iconStyle = computed(() => ({
  '--resume-section-icon-size': `${props.sectionIconStyle?.size ?? 18}px`,
  '--resume-section-icon-color': props.sectionIconStyle?.color ?? 'var(--cv-accent)',
  '--resume-section-icon-gap': `${props.sectionIconStyle?.spacing ?? 8}px`,
}))

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
      :variants="sectionRegistry.variants"
      :actions="sectionRegistry.toolbarActions"
      :current-variant="variant"
      :can-move-up="canMoveUp"
      :can-move-down="canMoveDown"
      @add-item="() => emit('add-item', 'certification')"
      @change-variant="(_, next) => emit('change-variant', 'certification', next)"
      @move-up="() => emit('move-section', 'certification', 'up')"
      @move-down="() => emit('move-section', 'certification', 'down')"
    />

    <h3 class="cv-heading-section">
      <span v-if="showSectionIcon && sectionIcon" class="section-icon" :class="iconVariantClass" :style="iconStyle">
        <v-icon :icon="sectionIcon" :size="sectionIconStyle?.size ?? 18" />
      </span>
      <span>{{ title }}</span>
    </h3>
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
.cv-heading-section { display: inline-flex; align-items: center; gap: var(--resume-section-icon-gap, var(--cv-space-2, 8px)); }
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
.entry-list { margin: 0; padding: 0; list-style: none; }
.entry-list li { margin-bottom: var(--entry-gap, var(--cv-space-2, 8px)); }
.entry-list li:last-child { margin-bottom: 0; }
.density-compact { --entry-gap: calc(var(--cv-space-2, 8px) - 2px); }
.density-normal { --entry-gap: var(--cv-space-2, 8px); }
.density-spacious { --entry-gap: var(--cv-space-3, 12px); }
</style>
