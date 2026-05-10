<script setup lang="ts">
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
  active: boolean
  icon: string
  iconOptions: SelectOption[]
  variant: string
  variantOptions: SelectOption[]
  column: SectionColumn
  columnIcon: string
  titleStyle?: SectionTitleStyle | string
}>()

/* eslint-disable @typescript-eslint/unified-signatures */
const emit = defineEmits<{
  (event: 'update:icon', value: string): void
  (event: 'update:variant', value: string): void
  (event: 'update:column', value: SectionColumn): void
  (event: 'update:title-style', value: SectionTitleStyle): void
  (event: 'add-item'): void
  (event: 'hide'): void
  (event: 'move-up'): void
  (event: 'move-down'): void
  (event: 'drag-move'): void
  (event: 'activate'): void
  (event: 'deactivate'): void
}>()
/* eslint-enable @typescript-eslint/unified-signatures */

const columnOptions: Array<{ title: string; value: SectionColumn }> = [
  { title: 'Full', value: 'full' },
  { title: 'Half', value: 'half' },
]

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

const variantModel = computed({
  get: () => props.variant,
  set: (value) => {
    if (typeof value === 'string') emit('update:variant', value)
  },
})

const iconModel = computed({
  get: () => props.icon,
  set: (value) => {
    if (typeof value === 'string') emit('update:icon', value)
  },
})

const columnModel = computed({
  get: () => props.column,
  set: (value) => emit('update:column', value === 'half' ? 'half' : 'full'),
})

function normalizeTitleStyle(value: unknown): SectionTitleStyle {
  return titleStyleOptions.some((option) => option.value === value)
    ? (value as SectionTitleStyle)
    : 'classic'
}

const titleStyleModel = computed({
  get: () => normalizeTitleStyle(props.titleStyle),
  set: (value) => emit('update:title-style', normalizeTitleStyle(value)),
})

const titleStyleIcon = computed(
  () =>
    titleStyleOptions.find((option) => option.value === titleStyleModel.value)
      ?.icon || 'mdi-format-title',
)
</script>

<template>
  <div
    :class="['cv-section-toolbar', { 'cv-section-toolbar--active': active }]"
    :aria-label="`${section} toolbar`"
    @mouseenter="emit('activate')"
    @mouseleave="emit('deactivate')"
    @focusin="emit('activate')"
    @focusout="emit('deactivate')"
  >
    <AppSelect
      v-model="variantModel"
      :items="variantOptions"
      item-title="title"
      item-value="value"
      density="compact"
      variant="outlined"
      hide-details
      prepend-inner-icon="mdi-shape-outline"
      class="cv-variant-select"
    />
    <AppSelect
      v-model="titleStyleModel"
      :items="titleStyleOptions"
      item-title="title"
      item-value="value"
      density="compact"
      variant="outlined"
      hide-details
      :prepend-inner-icon="titleStyleIcon"
      class="cv-title-style-select"
    >
      <template #selection="{ item }">
        <v-icon :icon="item?.raw?.icon || titleStyleIcon" size="16" />
      </template>
      <template #item="{ item, props: itemProps }">
        <v-list-item v-bind="itemProps" :title="item?.title">
          <template #prepend>
            <v-icon :icon="item?.raw?.icon" size="16" />
          </template>
        </v-list-item>
      </template>
    </AppSelect>
    <AppSelect
      v-model="columnModel"
      :items="columnOptions"
      item-title="title"
      item-value="value"
      density="compact"
      variant="outlined"
      hide-details
      :prepend-inner-icon="columnIcon"
      class="cv-column-select"
    />
    <AppSelect
      v-if="iconOptions.length"
      v-model="iconModel"
      :items="iconOptions"
      item-title="title"
      item-value="value"
      density="compact"
      variant="outlined"
      hide-details
      :prepend-inner-icon="icon"
      class="cv-icon-select"
    >
      <template #selection="{ item }">
        <v-icon :icon="item?.value || icon" size="16" />
      </template>
      <template #item="{ item, props: itemProps }">
        <v-list-item v-bind="itemProps" :title="item?.title">
          <template #prepend>
            <v-icon :icon="item?.value" size="16" />
          </template>
        </v-list-item>
      </template>
    </AppSelect>
    <v-btn
      icon="mdi-plus"
      size="x-small"
      variant="text"
      @click.stop="emit('add-item')"
    />
    <v-btn
      icon="mdi-minus"
      size="x-small"
      variant="text"
      @click.stop="emit('hide')"
    />
    <v-btn
      icon="mdi-arrow-up"
      size="x-small"
      variant="text"
      @click.stop="emit('move-up')"
    />
    <v-btn
      icon="mdi-arrow-down"
      size="x-small"
      variant="text"
      @click.stop="emit('move-down')"
    />
    <v-btn
      icon="mdi-drag"
      size="x-small"
      variant="text"
      @click.stop="emit('drag-move')"
    />
  </div>
</template>

<style scoped>
.cv-section-toolbar {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 120;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  width: max-content;
  max-width: calc(100% - 8px);
  padding: 4px;
  opacity: 0;
  pointer-events: none;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-on-surface)) 14%, transparent);
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
  transform: translateY(-2px);
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.cv-section-toolbar--active,
.cv-section-toolbar:focus,
.cv-section-toolbar:focus-within {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

@media (hover: none) {
  .cv-section-toolbar {
    opacity: 1;
    pointer-events: auto;
    transform: none;
  }
}

.cv-section-toolbar :deep(.v-field) {
  min-height: 26px;
  height: 26px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  border-radius: 8px;
}

.cv-section-toolbar :deep(.v-field__outline),
.cv-section-toolbar :deep(.v-field__overlay) {
  color: color-mix(in srgb, rgb(var(--v-theme-on-surface)) 22%, transparent);
}

.cv-section-toolbar :deep(.v-btn) {
  min-width: 26px !important;
  width: 26px;
  height: 26px;
  padding: 0;
  color: rgb(var(--v-theme-on-surface));
  border-radius: 8px;
}

.cv-section-toolbar :deep(.v-btn:hover) {
  background: color-mix(
    in srgb,
    rgb(var(--v-theme-on-surface)) 10%,
    transparent
  );
}

.cv-variant-select {
  width: 76px;
  min-width: 76px;
  max-width: 76px;
}

.cv-variant-select :deep(.v-field__input) {
  min-height: 26px;
  padding: 0 4px;
  font-size: 11px;
  color: rgb(var(--v-theme-on-surface));
}

.cv-variant-select :deep(.v-field__prepend-inner) {
  display: none;
}

.cv-variant-select :deep(.v-field__append-inner) {
  padding-inline-start: 0;
  color: rgb(var(--v-theme-on-surface));
}

.cv-title-style-select,
.cv-column-select,
.cv-icon-select {
  width: 54px;
}

.cv-title-style-select :deep(.v-select__selection span),
.cv-column-select :deep(.v-select__selection span),
.cv-icon-select :deep(.v-select__selection span) {
  display: none;
}

.cv-title-style-select :deep(.v-field__input),
.cv-column-select :deep(.v-field__input),
.cv-icon-select :deep(.v-field__input) {
  padding-inline-start: 0;
}
</style>
