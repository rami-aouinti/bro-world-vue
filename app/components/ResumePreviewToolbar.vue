<script setup lang="ts">
type PreviewTemplate = { id?: string; value?: string; label?: string; name?: string; title?: string }
type PaletteOption = { value?: string; title?: string; name?: string; primary?: string; secondary?: string; tertiary?: string; quaternary?: string; text?: string; dark?: string; light?: string }

withDefaults(
  defineProps<{
    menuOpen?: boolean
    paletteMenuOpen?: boolean
    templates?: PreviewTemplate[]
    selectedTemplate?: string
    getTemplateImage?: (template: PreviewTemplate) => string
    templateKeyPrefix?: string
    palettes?: PaletteOption[]
    selectedPalette?: string
    paletteColumns?: number
    showAi?: boolean
    settingsMenuOpen?: boolean
    decorMenuOpen?: boolean
    showDecor?: boolean
    showSection?: boolean
  }>(),
  {
    menuOpen: false,
    paletteMenuOpen: false,
    templates: () => [],
    selectedTemplate: '',
    getTemplateImage: undefined,
    templateKeyPrefix: 'preview-template',
    palettes: () => [],
    selectedPalette: '',
    paletteColumns: 5,
    showAi: true,
    settingsMenuOpen: false,
    decorMenuOpen: false,
    showDecor: false,
    showSection: false,
  },
)

const emit = defineEmits<{
  (e: 'update:menu-open' | 'update:palette-menu-open' | 'update:settings-menu-open' | 'update:decor-menu-open', value: boolean): void
  (e: 'select-template' | 'select-palette', value: string): void
  (e: 'save' | 'ai' | 'signature' | 'pdf' | 'section'): void
}>()

function templateId(template: PreviewTemplate) {
  return String(template.id ?? template.value ?? '')
}

function templateLabel(template: PreviewTemplate) {
  return template.label || template.title || template.name || templateId(template)
}

function paletteLabel(palette: PaletteOption) {
  return palette.title || palette.name || palette.value || 'Palette'
}

function paletteValue(palette: PaletteOption) {
  return String(palette.value || '')
}
</script>

<template>
  <div class="resume-preview-toolbar d-flex align-center justify-space-between ga-3 mb-4" role="toolbar" aria-label="Resume preview actions">
    <div class="d-flex align-center ga-2 flex-wrap">

      <v-menu
        :model-value="settingsMenuOpen"
        location="bottom start"
        :close-on-content-click="false"
        @update:model-value="emit('update:settings-menu-open', $event)"
      >
        <template #activator="{ props: menuProps }">
          <v-btn v-bind="menuProps" variant="outlined" prepend-icon="mdi-cog">Settings</v-btn>
        </template>
        <v-card class="pa-3" min-width="300">
          <slot name="settings" />
        </v-card>
      </v-menu>

      <v-menu
        v-if="showDecor"
        :model-value="decorMenuOpen"
        location="bottom start"
        :close-on-content-click="false"
        @update:model-value="emit('update:decor-menu-open', $event)"
      >
        <template #activator="{ props: menuProps }">
          <v-btn v-bind="menuProps" variant="outlined" prepend-icon="mdi-shape-plus">Decor</v-btn>
        </template>
        <v-card class="pa-3 decor-menu-card" min-width="300" @click.stop>
          <slot name="decor" />
        </v-card>
      </v-menu>

      <v-menu :model-value="menuOpen" location="bottom start" @update:model-value="emit('update:menu-open', $event)">
        <template #activator="{ props: menuProps }">
          <v-btn v-bind="menuProps" variant="outlined" prepend-icon="mdi-view-grid">Template</v-btn>
        </template>
        <v-card class="pa-3" min-width="320">
          <div class="template-grid">
            <button
              v-for="template in templates"
              :key="`${templateKeyPrefix}-${templateId(template)}`"
              class="template-option"
              :class="{ 'template-option--active': selectedTemplate === templateId(template) }"
              @click="emit('select-template', templateId(template))"
            >
              <img v-if="getTemplateImage" :src="getTemplateImage(template)" :alt="templateLabel(template)">
              <div class="template-option__meta">
                <v-avatar class="template-option__avatar" size="24">
                  <img v-if="getTemplateImage" :src="getTemplateImage(template)" :alt="templateLabel(template)">
                  <span v-else>{{ templateLabel(template).slice(0, 1).toUpperCase() }}</span>
                </v-avatar>
                <span>{{ templateLabel(template) }}</span>
              </div>
            </button>
          </div>
        </v-card>
      </v-menu>

      <v-menu :model-value="paletteMenuOpen" location="bottom start" @update:model-value="emit('update:palette-menu-open', $event)">
        <template #activator="{ props: menuProps }">
          <v-btn v-bind="menuProps" variant="outlined" prepend-icon="mdi-palette">Palette</v-btn>
        </template>
        <v-card class="pa-3" min-width="280">
          <div class="palette-grid" :style="{ '--palette-cols': String(paletteColumns) }">
            <button
              v-for="palette in palettes"
              :key="`palette-${paletteValue(palette)}`"
              class="palette-dot"
              :class="{ 'palette-dot--active': selectedPalette === paletteValue(palette) }"
              :title="paletteLabel(palette)"
              :style="{ '--palette-primary': palette.primary || '#cbd5e1', '--palette-secondary': palette.secondary || palette.dark || '#94a3b8', '--palette-tertiary': palette.tertiary || palette.text || '#475569', '--palette-quaternary': palette.quaternary || palette.light || '#e2e8f0' }"
              @click="emit('select-palette', paletteValue(palette))"
            />
          </div>
        </v-card>
      </v-menu>

      <v-btn v-if="showSection" variant="outlined" prepend-icon="mdi-plus" @click="emit('section')">Section</v-btn>
    </div>


  </div>
</template>

<style scoped>
.resume-preview-toolbar {
  position: sticky;
  top: 76px;
  z-index: 40;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 14%, transparent);
  border-radius: 12px;
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.48) 0%,
    transparent 70%
  );
  backdrop-filter: blur(8px);
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.14);
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.template-option {
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 18%, transparent);
  border-radius: 10px;
  background: rgb(var(--v-theme-surface));
  padding: 8px;
  text-align: left;
  display: grid;
  gap: 6px;
}

.template-option__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgb(var(--v-theme-on-surface));
}

.template-option__avatar {
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 16%, transparent);
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 24%, rgb(var(--v-theme-surface)));
}

.template-option img {
  width: 100%;
  height: 74px;
  object-fit: cover;
  border-radius: 6px;
}

.template-option--active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
}

.decor-menu-card {
  max-height: min(72vh, 680px);
  overflow-y: auto;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(var(--palette-cols, 5), 22px);
  gap: 10px;
}

.palette-dot {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-on-surface)) 18%, transparent);
  background: linear-gradient(
    135deg,
    var(--palette-primary) 0%,
    var(--palette-primary) 25%,
    var(--palette-secondary) 25%,
    var(--palette-secondary) 50%,
    var(--palette-tertiary) 50%,
    var(--palette-tertiary) 75%,
    var(--palette-quaternary) 75%,
    var(--palette-quaternary) 100%
  );
}

.palette-dot--active {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
</style>
