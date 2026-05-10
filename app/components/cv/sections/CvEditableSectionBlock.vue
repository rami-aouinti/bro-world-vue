<script setup lang="ts">
import CvEditableSectionContent from '~/components/cv/sections/CvEditableSectionContent.vue'
import CvSectionTitle from '~/components/cv/sections/CvSectionTitle.vue'

type SelectOption = { title: string; value: string }
type SectionColumn = 'full' | 'half'

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
  titleStyle?: string
  contentStyle?: string
  dateStyle?: string
}>()

// Keep the event overloads explicit so parent templates get precise payloads.
/* eslint-disable @typescript-eslint/unified-signatures */
const emit = defineEmits<{
  (event: 'update:title', value: string): void
  (event: 'update:icon', value: string): void
  (event: 'update:variant', value: string): void
  (event: 'update:column', value: SectionColumn): void
  (event: 'add-item'): void
  (event: 'hide'): void
  (event: 'move-up'): void
  (event: 'move-down'): void
  (event: 'drag-move'): void
  (event: 'update-item', index: number, value: string): void
}>()
/* eslint-enable @typescript-eslint/unified-signatures */

const columnOptions: Array<{ title: string; value: SectionColumn }> = [
  { title: 'Full', value: 'full' },
  { title: 'Half', value: 'half' },
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

const iconAlternativeValues = computed(() =>
  props.iconOptions.map((option) => option.value).filter(Boolean),
)
</script>

<template>
  <div class="cv-section-toolbar" :aria-label="`${section} toolbar`">
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

  <CvSectionTitle
    :section-key="sectionKey"
    :title="title"
    :icon="icon"
    :icon-alternatives="iconAlternativeValues"
    :title-style="titleStyle"
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
    @update-item="(index, value) => emit('update-item', index, value)"
  />
</template>

<style scoped>
.cv-section-toolbar {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 20;
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

:global(.cv-section-row:hover) .cv-section-toolbar,
:global(.cv-aside-section-item:hover) .cv-section-toolbar,
.cv-section-toolbar:focus-within {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
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

.cv-column-select,
.cv-icon-select {
  width: 54px;
}

.cv-column-select :deep(.v-select__selection span),
.cv-icon-select :deep(.v-select__selection span) {
  display: none;
}

.cv-column-select :deep(.v-field__input),
.cv-icon-select :deep(.v-field__input) {
  padding-inline-start: 0;
}
</style>
