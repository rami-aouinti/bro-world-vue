<script setup lang="ts">

type ToolbarVariantOption = {
  label?: string
  labelKey?: string
  value: string
}
type ToolbarContentStyleOption = ToolbarVariantOption
type ToolbarAction =
  | 'add-item'
  | 'change-variant'
  | 'change-content-style'
  | 'style-panel'
  | 'line-minus'
  | 'line-plus'
  | 'move-up'
  | 'move-down'
  | 'delete-item'
  | 'delete-section'

type StylePresetOption = {
  label: string
  value: string
  tokens: Record<string, string>
}

type ToolbarSectionOption = {
  key: string
  label?: string
  labelKey?: string
  modelValue: boolean
}

const props = withDefaults(
  defineProps<{
    sectionKey: string
    canMoveUp?: boolean
    canMoveDown?: boolean
    variants?: ToolbarVariantOption[]
    currentVariant?: string
    contentStyles?: ToolbarContentStyleOption[]
    currentContentStyle?: string
    actions?: ToolbarAction[]
    sectionOptions?: ToolbarSectionOption[]
  }>(),
  {
    canMoveUp: false,
    canMoveDown: false,
    variants: () => [],
    currentVariant: '',
    contentStyles: () => [],
    currentContentStyle: '',
    actions: () => [
      'add-item',
      'change-variant',
      'change-content-style',
      'style-panel',
      'line-minus',
      'line-plus',
      'move-up',
      'move-down',
    ],
    sectionOptions: () => [],
  },
)

const emit = defineEmits<{
  (
    event:
      | 'add-item'
      | 'move-up'
      | 'move-down'
      | 'delete-item'
      | 'delete-section',
    sectionKey: string,
  ): void
  (
    event: 'change-variant' | 'change-content-style',
    sectionKey: string,
    value: string,
  ): void
  (
    event: 'update-section-option',
    sectionKey: string,
    optionKey: string,
    value: boolean,
  ): void
}>()


function resolveOptionLabel(option: { label?: string; labelKey?: string; value?: string }) {
  return option.label || option.labelKey || option.value || ''
}
const toolbarRef = ref<HTMLElement | null>(null)
const styleMenuOpen = ref(false)
const pinEnabled = ref(false)

const headingPresets: StylePresetOption[] = [
  {
    label: 'Underline',
    value: 'underline',
    tokens: {
      '--rs-heading-border-bottom':
        '1px solid color-mix(in srgb, var(--cv-accent) 36%, transparent)',
      '--rs-heading-padding': '0 0 6px 0',
    },
  },
  {
    label: 'Pill',
    value: 'pill',
    tokens: {
      '--rs-heading-bg':
        'color-mix(in srgb, var(--cv-accent) 11%, var(--cv-page))',
      '--rs-heading-radius': '999px',
      '--rs-heading-padding': '4px 12px',
    },
  },
  {
    label: 'Minimal',
    value: 'minimal',
    tokens: {
      '--rs-heading-border-bottom': '0',
      '--rs-heading-bg': 'transparent',
      '--rs-heading-radius': '0',
      '--rs-heading-padding': '0',
    },
  },
]

const spacingPresets: StylePresetOption[] = [
  {
    label: 'Compact',
    value: 'compact',
    tokens: { '--entry-gap': '10px', '--rs-section-padding-bottom': '6px' },
  },
  {
    label: 'Balanced',
    value: 'balanced',
    tokens: { '--entry-gap': '16px', '--rs-section-padding-bottom': '12px' },
  },
  {
    label: 'Airy',
    value: 'airy',
    tokens: { '--entry-gap': '22px', '--rs-section-padding-bottom': '18px' },
  },
]

const cardPresets: StylePresetOption[] = [
  {
    label: 'None',
    value: 'none',
    tokens: {
      '--rs-card-border': 'none',
      '--rs-card-bg': 'transparent',
      '--rs-card-radius': '0',
      '--rs-card-padding': '0',
    },
  },
  {
    label: 'Soft',
    value: 'soft',
    tokens: {
      '--rs-card-border':
        '1px solid color-mix(in srgb, var(--cv-accent) 14%, transparent)',
      '--rs-card-bg':
        'color-mix(in srgb, var(--cv-page) 90%, var(--cv-accent) 10%)',
      '--rs-card-radius': '12px',
      '--rs-card-padding': '10px 12px',
    },
  },
  {
    label: 'Elevated',
    value: 'elevated',
    tokens: {
      '--rs-card-border':
        '1px solid color-mix(in srgb, var(--cv-secondary) 10%, transparent)',
      '--rs-card-bg':
        'color-mix(in srgb, var(--cv-page) 88%, var(--cv-secondary) 12%)',
      '--rs-card-radius': '14px',
      '--rs-card-padding': '12px 14px',
    },
  },
]

const dividerPresets: StylePresetOption[] = [
  {
    label: 'None',
    value: 'none',
    tokens: { '--rs-section-separator': 'none' },
  },
  {
    label: 'Fine',
    value: 'fine',
    tokens: {
      '--rs-section-separator':
        '1px solid color-mix(in srgb, var(--cv-accent) 20%, transparent)',
    },
  },
  {
    label: 'Strong',
    value: 'strong',
    tokens: {
      '--rs-section-separator':
        '2px solid color-mix(in srgb, var(--cv-accent) 42%, transparent)',
    },
  },
]

const selectedHeading = ref('minimal')
const selectedSpacing = ref('balanced')
const selectedCard = ref('none')
const selectedDivider = ref('none')


const lineStep = 4
const minLineOffset = -24
const maxLineOffset = 48
const sectionLineOffset = ref(0)

const sectionStorageKey = computed(
  () => `resume:section-toolbar:pin:${props.sectionKey}`,
)
const enabledActions = computed(() => new Set(props.actions))

function getSectionElement() {
  return toolbarRef.value?.closest(
    '.resume-section-hoverable',
  ) as HTMLElement | null
}

function findPreset(presets: StylePresetOption[], value: string) {
  return presets.find((option) => option.value === value)
}

function applySectionStylePreview() {
  const sectionElement = getSectionElement()
  if (!sectionElement) return

  const picked = [
    findPreset(headingPresets, selectedHeading.value),
    findPreset(spacingPresets, selectedSpacing.value),
    findPreset(cardPresets, selectedCard.value),
    findPreset(dividerPresets, selectedDivider.value),
  ].filter((preset): preset is StylePresetOption => Boolean(preset))

  for (const preset of picked) {
    for (const [token, tokenValue] of Object.entries(preset.tokens)) {
      sectionElement.style.setProperty(token, tokenValue)
    }
  }

  sectionElement.style.setProperty('--rs-extra-line-offset', `${sectionLineOffset.value}px`)
}

function changeSectionLineOffset(direction: 'plus' | 'minus') {
  const delta = direction === 'plus' ? lineStep : -lineStep
  sectionLineOffset.value = Math.max(
    minLineOffset,
    Math.min(maxLineOffset, sectionLineOffset.value + delta),
  )
  if (import.meta.client) {
    localStorage.setItem(
      `resume:section-toolbar:line-offset:${props.sectionKey}`,
      String(sectionLineOffset.value),
    )
  }
  applySectionStylePreview()
}

function setPin(nextValue: boolean) {
  pinEnabled.value = nextValue
  if (import.meta.client) {
    localStorage.setItem(sectionStorageKey.value, String(nextValue))
  }
}

onMounted(() => {
  if (!import.meta.client) return
  pinEnabled.value = localStorage.getItem(sectionStorageKey.value) === 'true'
  const storedLineOffset = Number(localStorage.getItem(`resume:section-toolbar:line-offset:${props.sectionKey}`) || '0')
  sectionLineOffset.value = Number.isFinite(storedLineOffset)
    ? Math.max(minLineOffset, Math.min(maxLineOffset, storedLineOffset))
    : 0
  applySectionStylePreview()
})

watch(
  [selectedHeading, selectedSpacing, selectedCard, selectedDivider],
  applySectionStylePreview,
  { flush: 'post' },
)
</script>

<template>
  <div
    ref="toolbarRef"
    class="section-toolbar"
    :class="{ 'is-pinned': pinEnabled }"
    role="toolbar"
    :aria-label="`Section actions ${props.sectionKey}`"
  >
    <v-tooltip v-if="enabledActions.has('add-item')" text="Add item">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          class="toolbar-btn"
          icon
          size="default"
          variant="tonal"
          :aria-label="`Add item to section ${props.sectionKey}`"
          v-bind="tooltipProps"
          @click="emit('add-item', props.sectionKey)"
        >
          <v-icon icon="mdi-plus" />
        </v-btn>
      </template>
    </v-tooltip>

    <v-menu
      v-if="enabledActions.has('change-variant') && props.variants.length"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          class="toolbar-btn"
          icon
          size="default"
          variant="tonal"
          :aria-label="`Change section variant ${props.sectionKey}`"
          v-bind="menuProps"
        >
          <v-icon icon="mdi-view-dashboard-outline" />
          <v-tooltip activator="parent" text="Change Layout" location="bottom" />
        </v-btn>
      </template>
      <v-list class="toolbar-menu-list" density="compact">
        <v-list-item
          v-for="option in props.variants"
          :key="option.value"
          :active="option.value === props.currentVariant"
          @click="emit('change-variant', props.sectionKey, option.value)"
        >
          <v-list-item-title>{{ resolveOptionLabel(option) }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-menu
      v-if="
        enabledActions.has('change-content-style') && props.contentStyles.length
      "
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          class="toolbar-btn"
          icon
          size="default"
          variant="tonal"
          :aria-label="`Change content style for section ${props.sectionKey}`"
          v-bind="menuProps"
        >
          <v-icon icon="mdi-format-list-bulleted-type" />
          <v-tooltip activator="parent" text="Content style" location="bottom" />
        </v-btn>
      </template>
      <v-list class="toolbar-menu-list" density="compact">
        <v-list-item
          v-for="option in props.contentStyles"
          :key="option.value"
          :active="option.value === props.currentContentStyle"
          @click="emit('change-content-style', props.sectionKey, option.value)"
        >
          <v-list-item-title>{{ resolveOptionLabel(option) }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-menu
      v-if="enabledActions.has('style-panel')"
      v-model="styleMenuOpen"
      :close-on-content-click="false"
      location="bottom end"
      offset="10"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          class="toolbar-btn"
          icon
          size="default"
          variant="tonal"
          :aria-label="`Open section style panel ${props.sectionKey}`"
          v-bind="menuProps"
        >
          <v-icon icon="mdi-brush-variant" />
          <v-tooltip activator="parent" text="Section Style" location="bottom" />
        </v-btn>
      </template>

      <v-card class="section-style-popover" elevation="8">
        <v-card-title class="text-subtitle-2">Section Style</v-card-title>
        <v-card-text class="d-grid ga-3 pt-2">
          <app-select
            v-model="selectedHeading"
            :items="headingPresets"
            item-title="label"
            item-value="value"
            label="Heading style"
            density="compact"
            hide-details
          />
          <app-select
            v-model="selectedSpacing"
            :items="spacingPresets"
            item-title="label"
            item-value="value"
            label="Spacing"
            density="compact"
            hide-details
          />
          <app-select
            v-model="selectedCard"
            :items="cardPresets"
            item-title="label"
            item-value="value"
            label="Card style"
            density="compact"
            hide-details
          />
          <app-select
            v-model="selectedDivider"
            :items="dividerPresets"
            item-title="label"
            item-value="value"
            label="Divider style"
            density="compact"
            hide-details
          />
          <v-divider v-if="props.sectionOptions.length" />
          <v-switch
            v-for="option in props.sectionOptions"
            :key="option.key"
            :model-value="option.modelValue"
            color="primary"
            density="compact"
            hide-details
            inset
            :label="option.label"
            @update:model-value="
              emit(
                'update-section-option',
                props.sectionKey,
                option.key,
                Boolean($event),
              )
            "
          />
          <v-switch
            :model-value="pinEnabled"
            color="primary"
            density="compact"
            hide-details
            inset
            label="Pinned edit mode"
            @update:model-value="setPin(Boolean($event))"
          />
        </v-card-text>
      </v-card>
    </v-menu>


    <v-tooltip v-if="enabledActions.has('line-minus')" text="Remove one line">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          class="toolbar-btn"
          icon
          size="default"
          variant="tonal"
          :aria-label="`Remove one line after section ${props.sectionKey}`"
          v-bind="tooltipProps"
          @click="changeSectionLineOffset('minus')"
        >
          <v-icon icon="mdi-minus" />
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip v-if="enabledActions.has('line-plus')" text="Add one line">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          class="toolbar-btn"
          icon
          size="default"
          variant="tonal"
          :aria-label="`Add one line after section ${props.sectionKey}`"
          v-bind="tooltipProps"
          @click="changeSectionLineOffset('plus')"
        >
          <v-icon icon="mdi-plus" />
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip v-if="enabledActions.has('move-up')" text="Move section up">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          class="toolbar-btn"
          icon
          size="default"
          variant="tonal"
          :disabled="!props.canMoveUp"
          :aria-label="`Move section ${props.sectionKey} up`"
          v-bind="tooltipProps"
          @click="emit('move-up', props.sectionKey)"
        >
          <v-icon icon="mdi-arrow-up" />
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip
      v-if="enabledActions.has('move-down')"
      text="Move section down"
    >
      <template #activator="{ props: tooltipProps }">
        <v-btn
          class="toolbar-btn"
          icon
          size="default"
          variant="tonal"
          :disabled="!props.canMoveDown"
          :aria-label="`Move section ${props.sectionKey} down`"
          v-bind="tooltipProps"
          @click="emit('move-down', props.sectionKey)"
        >
          <v-icon icon="mdi-arrow-down" />
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip
      v-if="enabledActions.has('delete-item')"
      text="Delete item"
    >
      <template #activator="{ props: tooltipProps }">
        <v-btn
          class="toolbar-btn"
          icon
          size="default"
          variant="tonal"
          color="error"
          :aria-label="`Delete item from section ${props.sectionKey}`"
          v-bind="tooltipProps"
          @click="emit('delete-item', props.sectionKey)"
        >
          <v-icon icon="mdi-delete-outline" />
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip
      v-if="enabledActions.has('delete-section')"
      text="Delete section"
    >
      <template #activator="{ props: tooltipProps }">
        <v-btn
          class="toolbar-btn"
          icon
          size="default"
          variant="tonal"
          color="error"
          :aria-label="`Delete section ${props.sectionKey}`"
          v-bind="tooltipProps"
          @click="emit('delete-section', props.sectionKey)"
        >
          <v-icon icon="mdi-trash-can-outline" />
        </v-btn>
      </template>
    </v-tooltip>
  </div>
</template>

<style scoped>
.section-toolbar {
  --cv-toolbar-border: var(
    --cv-toolbar-border-color,
    color-mix(in srgb, var(--cv-secondary) 22%, transparent)
  );
  --cv-toolbar-bg: var(
    --cv-toolbar-bg-color,
    color-mix(in srgb, var(--cv-page) 16%, var(--cv-sidebar) 74%)
  );
  --cv-toolbar-shadow: var(
    --cv-toolbar-shadow-color,
    color-mix(in srgb, var(--cv-secondary) 14%, transparent)
  );

  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 6;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  border-radius: 999px;
  border: 1px solid var(--cv-toolbar-border);
  background: var(--cv-toolbar-bg);
  box-shadow: 0 8px 20px var(--cv-toolbar-shadow);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  opacity: 0;
  pointer-events: none;
  transform: translate3d(0, -5px, 0);
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.toolbar-btn {
  min-width: 38px;
  width: 38px;
  height: 38px;
}

.section-style-popover {
  width: min(320px, calc(100vw - 24px));
  border-radius: 14px;
}

.toolbar-menu-list :deep(.v-list-item-title) {
  color: var(--cv-on-surface, rgb(31 41 55));
}

:global(.resume-section-hoverable:hover > .section-toolbar),
:global(.resume-section-hoverable:focus-within > .section-toolbar),
:global(.resume-section-hoverable:has(:focus-visible) > .section-toolbar),
.section-toolbar:focus-within,
.section-toolbar.is-pinned {
  opacity: 1;
  pointer-events: auto;
  transform: translate3d(0, 0, 0);
}
</style>
