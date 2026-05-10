<script setup lang="ts">
import CvSectionToolbar from '~/components/cv/editor/CvSectionToolbar.vue'
import CvEditableSectionContent from '~/components/cv/sections/CvEditableSectionContent.vue'
import CvSectionTitle from '~/components/cv/sections/CvSectionTitle.vue'

type SelectOption = { title: string; value: string }
type SectionColumn = 'full' | 'half'
type SectionTitleStyle =
  | 'classic'
  | 'pill-filled'
  | 'pill-outline'
  | 'icon-bar'
  | 'ribbon'
  | 'hexagon'
  | 'tab'
  | 'underline-accent'

const props = defineProps<{
  section: string
  sectionKey: string
  title: string
  icon: string
  iconOptions: SelectOption[]
  variant: string
  variantOptions: SelectOption[]
  column: SectionColumn
  columnIcon: string
  items: string[]
  titleStyle?: SectionTitleStyle | string
  toolbarActive?: boolean
  contentStyle?: string
  dateStyle?: string
  levelStyle?: string
  hobbyStyle?: string
}>()

// Keep the event overloads explicit so parent templates get precise payloads.
/* eslint-disable @typescript-eslint/unified-signatures */
const emit = defineEmits<{
  (event: 'update:title', value: string): void
  (event: 'update:icon', value: string): void
  (event: 'update:variant', value: string): void
  (event: 'update:column', value: SectionColumn): void
  (event: 'update:title-style', value: SectionTitleStyle): void
  (event: 'add-item'): void
  (event: 'hide'): void
  (event: 'move-up'): void
  (event: 'move-down'): void
  (event: 'drag-move'): void
  (event: 'activate-toolbar'): void
  (event: 'deactivate-toolbar'): void
  (event: 'update-item', index: number, value: string): void
}>()
/* eslint-enable @typescript-eslint/unified-signatures */

const titleStyleOptions: Array<{
  title: string
  value: SectionTitleStyle
  icon: string
}> = [
  { title: 'Classic', value: 'classic', icon: 'mdi-format-title' },
  { title: 'Pill', value: 'pill-filled', icon: 'mdi-pill' },
  {
    title: 'Outline',
    value: 'pill-outline',
    icon: 'mdi-checkbox-blank-badge-outline',
  },
  { title: 'Icon bar', value: 'icon-bar', icon: 'mdi-format-align-left' },
  { title: 'Ribbon', value: 'ribbon', icon: 'mdi-ribbon' },
  { title: 'Hexagon', value: 'hexagon', icon: 'mdi-hexagon-outline' },
  { title: 'Tab', value: 'tab', icon: 'mdi-tab' },
  {
    title: 'Underline',
    value: 'underline-accent',
    icon: 'mdi-format-underline',
  },
]

function normalizeTitleStyle(value: unknown): SectionTitleStyle {
  return titleStyleOptions.some((option) => option.value === value)
    ? (value as SectionTitleStyle)
    : 'classic'
}

const titleStyleModel = computed({
  get: () => normalizeTitleStyle(props.titleStyle),
  set: (value) => emit('update:title-style', normalizeTitleStyle(value)),
})

const iconAlternativeValues = computed(() =>
  props.iconOptions.map((option) => option.value).filter(Boolean),
)
</script>

<template>
  <CvSectionToolbar
    :section="section"
    :active="toolbarActive ?? false"
    :icon="icon"
    :icon-options="iconOptions"
    :variant="variant"
    :variant-options="variantOptions"
    :column="column"
    :column-icon="columnIcon"
    :title-style="titleStyleModel"
    @update:icon="emit('update:icon', $event)"
    @update:variant="emit('update:variant', $event)"
    @update:column="emit('update:column', $event)"
    @update:title-style="emit('update:title-style', $event)"
    @add-item="emit('add-item')"
    @hide="emit('hide')"
    @move-up="emit('move-up')"
    @move-down="emit('move-down')"
    @drag-move="emit('drag-move')"
    @activate="emit('activate-toolbar')"
    @deactivate="emit('deactivate-toolbar')"
  />

  <CvSectionTitle
    :section-key="sectionKey"
    :title="title"
    :icon="icon"
    :icon-alternatives="iconAlternativeValues"
    :title-style="titleStyleModel"
    font-family="var(--cv-text-section-label, inherit)"
    @update:title="emit('update:title', $event)"
    @update:icon="emit('update:icon', $event)"
  />

  <CvEditableSectionContent
    :section-key="sectionKey"
    :variant="variant"
    :items="items"
    :content-style="contentStyle"
    :date-style="dateStyle"
    :level-style="levelStyle"
    :hobby-style="hobbyStyle"
    @update-item="(index, value) => emit('update-item', index, value)"
  />
</template>

