<script setup lang="ts">
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'
import { getSectionRegistryEntry } from '~/constants/resumeSectionRegistry'
import type { ResumeSectionIconStyle } from '~/constants/resumeTemplateSkins'

const props = withDefaults(
  defineProps<{
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
  }>(),
  {
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
    sectionIconStyle: undefined,
  },
)

const emit = defineEmits<{
  (event: 'add-item', sectionKey: 'reference'): void
  (event: 'change-variant', sectionKey: 'reference', variant: string): void
  (
    event: 'move-section',
    sectionKey: 'reference',
    direction: 'up' | 'down',
  ): void
  (event: 'delete-section', sectionKey: 'reference'): void
}>()

const sectionStyle = computed(() => ({ ...props.themeTokens }))
const sectionRegistry = getSectionRegistryEntry('reference')
const iconVariantClass = computed(() =>
  props.sectionIconStyle?.variant
    ? `section-icon--${props.sectionIconStyle.variant}`
    : 'section-icon--outline',
)
const iconStyle = computed(() => ({
  '--resume-section-icon-size': `${props.sectionIconStyle?.size ?? 18}px`,
  '--resume-section-icon-color':
    props.sectionIconStyle?.color ?? 'var(--cv-accent)',
  '--resume-section-icon-gap': `${props.sectionIconStyle?.spacing ?? 8}px`,
}))

function updateText(path: string, value: unknown) {
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

function removeReference(index: number) {
  const references = Array.isArray(props.resume.references)
    ? props.resume.references
    : []
  updateText(
    'references',
    references.filter((_: unknown, itemIndex: number) => itemIndex !== index),
  )
}
</script>

<template>
  <section
    :class="[
      'reference-section',
      'resume-section-hoverable',
      `density-${layoutDensity}`,
    ]"
    :style="sectionStyle"
  >
    <SectionToolbar
      v-if="toolbarEnabled"
      section-key="reference"
      :variants="sectionRegistry.variants"
      :actions="sectionRegistry.toolbarActions"
      :current-variant="variant"
      :can-move-up="canMoveUp"
      :can-move-down="canMoveDown"
      @add-item="() => emit('add-item', 'reference')"
      @change-variant="(_, next) => emit('change-variant', 'reference', next)"
      @move-up="() => emit('move-section', 'reference', 'up')"
      @move-down="() => emit('move-section', 'reference', 'down')"
      @delete-section="() => emit('delete-section', 'reference')"
    />

    <h3 class="cv-heading-section">
      <span
        v-if="showSectionIcon && sectionIcon"
        class="section-icon"
        :class="iconVariantClass"
        :style="iconStyle"
      >
        <v-icon :icon="sectionIcon" :size="sectionIconStyle?.size ?? 18" />
      </span>
      <span>{{ title }}</span>
    </h3>
    <ul class="entry-list">
      <li
        v-for="(reference, index) in resume.references"
        :key="`${reference.name}-${index}`"
      >
        <span
          class="editable-text"
          :contenteditable="editable"
          @input="
            (event) =>
              updateText(
                `references.${index}.name`,
                (event.target as HTMLElement).innerText,
              )
          "
          >{{ reference.name }}</span
        >
        <small
          class="ms-2 editable-text"
          :contenteditable="editable"
          @input="
            (event) =>
              updateText(
                `references.${index}.company`,
                (event.target as HTMLElement).innerText,
              )
          "
          >{{ reference.company }}</small
        >
        <v-btn
          v-if="editable"
          class="resume-item-delete"
          icon
          size="x-small"
          variant="text"
          color="error"
          aria-label="Delete this reference"
          @click="removeReference(index)"
        >
          <v-icon icon="mdi-close" size="14" />
        </v-btn>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.reference-section {
  position: relative;
  padding-bottom: calc(
    var(--rs-section-padding-bottom, 0px) + var(--rs-extra-line-offset, 0px)
  );
}
.cv-heading-section {
  display: inline-flex;
  align-items: center;
  gap: var(--resume-section-icon-gap, var(--cv-space-2, 8px));
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
.entry-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.entry-list li {
  margin-bottom: var(--entry-gap, var(--cv-space-2, 8px));
  position: relative;
}
.resume-item-delete {
  position: absolute;
  top: 0;
  right: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s ease;
}
.entry-list li:hover .resume-item-delete,
.entry-list li:focus-within .resume-item-delete {
  opacity: 1;
  pointer-events: auto;
}
.entry-list li:last-child {
  margin-bottom: 0;
}
.density-compact {
  --entry-gap: calc(var(--cv-space-2, 8px) - 2px);
}
.density-normal {
  --entry-gap: var(--cv-space-2, 8px);
}
.density-spacious {
  --entry-gap: var(--cv-space-3, 12px);
}
</style>
