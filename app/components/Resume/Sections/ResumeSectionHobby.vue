<script setup lang="ts">
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'
import ResumeSectionHeading from '~/components/Resume/Sections/ResumeSectionHeading.vue'
import { getSectionRegistryEntry } from '~/constants/resumeSectionRegistry'

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
  }>(),
  {
    editable: false,
    variant: 'classic',
    themeTokens: () => ({}),
    layoutDensity: 'normal',
    toolbarEnabled: false,
    title: 'Interests',
    canMoveUp: false,
    canMoveDown: false,
    sectionIcon: undefined,
    showSectionIcon: true,
  },
)

const emit = defineEmits<{
  (event: 'add-item' | 'delete-section', sectionKey: 'hobby'): void
  (event: 'change-variant', sectionKey: 'hobby', variant: string): void
  (event: 'move-section', sectionKey: 'hobby', direction: 'up' | 'down'): void
}>()

const sectionStyle = computed(() => ({ ...props.themeTokens }))
const sectionRegistry = getSectionRegistryEntry('hobby')

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

function removeHobby(index: number) {
  const hobbies = Array.isArray(props.resume.hobbies)
    ? props.resume.hobbies
    : []
  updateText(
    'hobbies',
    hobbies.filter((_: unknown, itemIndex: number) => itemIndex !== index),
  )
}
</script>

<template>
  <section
    :class="[
      'hobby-section',
      'resume-section-hoverable',
      `density-${layoutDensity}`,
    ]"
    :style="sectionStyle"
  >
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
      @delete-section="() => emit('delete-section', 'hobby')"
    />
    <ResumeSectionHeading
      section-key="hobby"
      :title="title"
      :icon="showSectionIcon ? sectionIcon : undefined"
      divider
    />
    <ul class="entry-list">
      <li
        v-for="(hobby, index) in resume.hobbies"
        :key="`${hobby}-${index}`"
        class="entry-item editable-text"
        :contenteditable="editable"
        @input="
          (event) =>
            updateText(
              `hobbies.${index}`,
              (event.target as HTMLElement).innerText,
            )
        "
      >
        {{ hobby }}
        <v-btn
          v-if="editable"
          class="resume-item-delete"
          icon
          size="x-small"
          variant="text"
          color="error"
          aria-label="Supprimer ce loisir"
          @click="removeHobby(index)"
        >
          <v-icon icon="mdi-close" size="14" />
        </v-btn>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.hobby-section {
  position: relative;
  padding-bottom: calc(
    var(--rs-section-padding-bottom, 0px) + var(--rs-extra-line-offset, 0px)
  );
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

.section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--resume-section-icon-color, var(--cv-accent));
  margin-right: 6px;
}
</style>
