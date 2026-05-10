<script setup lang="ts">
type PaletteColorKey = 'primary' | 'secondary' | 'text' | 'pageBackground'

withDefaults(
  defineProps<{
    paletteMenuOpen?: boolean
    asideMenuOpen?: boolean
    barMenuOpen?: boolean
    borderMenuOpen?: boolean
    decorMenuOpen?: boolean
    showDecor?: boolean
    activeColors?: Partial<Record<PaletteColorKey, string>>
  }>(),
  {
    paletteMenuOpen: false,
    asideMenuOpen: false,
    barMenuOpen: false,
    borderMenuOpen: false,
    decorMenuOpen: false,
    showDecor: false,
    activeColors: () => ({}),
  },
)

const emit = defineEmits<{
  (
    e:
      | 'update:palette-menu-open'
      | 'update:aside-menu-open'
      | 'update:bar-menu-open'
      | 'update:border-menu-open'
      | 'update:decor-menu-open',
    value: boolean,
  ): void
  (
    e: 'update-palette-color',
    payload: { key: PaletteColorKey; value: string },
  ): void
  (e: 'reset-palette'): void
}>()

const editablePaletteFields: Array<{ key: PaletteColorKey; label: string }> = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'text', label: 'Text' },
  { key: 'pageBackground', label: 'Page background' },
]

function normalizeColor(value: string | undefined, fallback = '#000000') {
  if (!value) return fallback
  const raw = String(value).trim()
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw
  return fallback
}

function onColorUpdate(key: PaletteColorKey, value: string) {
  emit('update-palette-color', { key, value: normalizeColor(value) })
}
</script>

<template>
  <div class="resume-preview-design-controls">
    <v-menu
      :model-value="paletteMenuOpen"
      location="bottom end"
      :close-on-content-click="false"
      @update:model-value="emit('update:palette-menu-open', $event)"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          class="resume-preview-design-controls__button"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-palette"
          block
        >
          Palette
        </v-btn>
      </template>
      <v-card class="pa-3 resume-preview-design-controls__menu" min-width="280">
        <div class="d-flex flex-column ga-2">
          <div
            v-for="field in editablePaletteFields"
            :key="field.key"
            class="palette-color-row"
          >
            <span class="palette-color-row__label">{{ field.label }}</span>
            <div class="palette-color-row__controls">
              <input
                class="palette-color-row__input"
                :value="normalizeColor(activeColors?.[field.key], '#0f172a')"
                type="color"
                @input="
                  onColorUpdate(
                    field.key,
                    ($event.target as HTMLInputElement)?.value || '',
                  )
                "
                @change="
                  onColorUpdate(
                    field.key,
                    ($event.target as HTMLInputElement)?.value || '',
                  )
                "
              />
              <span class="palette-color-row__hex">{{
                normalizeColor(
                  activeColors?.[field.key],
                  '#0f172a',
                ).toUpperCase()
              }}</span>
            </div>
          </div>
        </div>
        <v-btn
          class="mt-3"
          size="small"
          variant="text"
          prepend-icon="mdi-restore"
          @click="emit('reset-palette')"
        >
          Reset
        </v-btn>
      </v-card>
    </v-menu>

    <v-menu
      v-if="$slots.aside"
      :model-value="asideMenuOpen"
      location="bottom end"
      :close-on-content-click="false"
      @update:model-value="emit('update:aside-menu-open', $event)"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          class="resume-preview-design-controls__button"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-dock-left"
          block
        >
          Aside
        </v-btn>
      </template>
      <v-card class="pa-3 resume-preview-design-controls__menu" min-width="300">
        <slot name="aside" />
      </v-card>
    </v-menu>

    <v-menu
      v-if="$slots.bar"
      :model-value="barMenuOpen"
      location="bottom end"
      :close-on-content-click="false"
      @update:model-value="emit('update:bar-menu-open', $event)"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          class="resume-preview-design-controls__button"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-view-agenda"
          block
        >
          Bar
        </v-btn>
      </template>
      <v-card class="pa-3 resume-preview-design-controls__menu" min-width="300">
        <slot name="bar" />
      </v-card>
    </v-menu>

    <v-menu
      v-if="$slots.border"
      :model-value="borderMenuOpen"
      location="bottom end"
      :close-on-content-click="false"
      @update:model-value="emit('update:border-menu-open', $event)"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          class="resume-preview-design-controls__button"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-border-all"
          block
        >
          Border
        </v-btn>
      </template>
      <v-card class="pa-3 resume-preview-design-controls__menu" min-width="300">
        <slot name="border" />
      </v-card>
    </v-menu>

    <v-menu
      v-if="showDecor"
      :model-value="decorMenuOpen"
      location="bottom end"
      :close-on-content-click="false"
      @update:model-value="emit('update:decor-menu-open', $event)"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          class="resume-preview-design-controls__button"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-shape-plus"
          block
        >
          Decor
        </v-btn>
      </template>
      <v-card
        class="pa-3 resume-preview-design-controls__menu resume-preview-design-controls__menu--decor"
        min-width="300"
        @click.stop
      >
        <slot name="decor" />
      </v-card>
    </v-menu>
  </div>
</template>

<style scoped>
.resume-preview-design-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-on-surface)) 14%, transparent);
}

.resume-preview-design-controls__button {
  justify-content: flex-start;
}

.resume-preview-design-controls__menu {
  max-height: min(72vh, 680px);
  overflow-y: auto;
}

.resume-preview-design-controls__menu--decor {
  max-height: min(74vh, 720px);
}

.palette-color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.palette-color-row__label {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.palette-color-row__controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.palette-color-row__input {
  width: 46px;
  height: 34px;
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-on-surface)) 22%, transparent);
  border-radius: 8px;
  background: transparent;
  padding: 2px;
  cursor: pointer;
}

.palette-color-row__hex {
  min-width: 76px;
  color: color-mix(in srgb, rgb(var(--v-theme-on-surface)) 74%, transparent);
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  font-size: 12px;
}
</style>
