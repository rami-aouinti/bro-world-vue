<script setup lang="ts">
type PreviewTemplate = { id?: string; value?: string; label?: string; name?: string; title?: string }
type PaletteOption = { value?: string; title?: string; name?: string; primary?: string; secondary?: string; dark?: string; light?: string }

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
  },
)

const emit = defineEmits<{
  (e: 'update:menu-open' | 'update:palette-menu-open', value: boolean): void
  (e: 'select-template' | 'select-palette', value: string): void
  (e: 'save' | 'ai' | 'signature' | 'pdf'): void
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
  <div class="resume-preview-toolbar d-flex align-center justify-space-between ga-3 mb-4">
    <div class="d-flex align-center ga-2 flex-wrap">
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
              <span>{{ templateLabel(template) }}</span>
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
              :style="{ background: palette.primary || palette.light || '#cbd5e1' }"
              @click="emit('select-palette', paletteValue(palette))"
            />
          </div>
        </v-card>
      </v-menu>
    </div>

    <div class="d-flex align-center ga-2 flex-wrap justify-end">
      <v-btn variant="tonal" prepend-icon="mdi-content-save" @click="emit('save')">Save</v-btn>
      <v-btn variant="tonal" prepend-icon="mdi-robot" @click="emit('ai')">AI</v-btn>
      <v-btn variant="tonal" prepend-icon="mdi-draw" @click="emit('signature')">Signature</v-btn>
      <v-btn color="primary" prepend-icon="mdi-file-pdf-box" @click="emit('pdf')">PDF</v-btn>
    </div>
  </div>
</template>

<style scoped>
.resume-preview-toolbar { width: 100%; }
.template-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
.template-option { border:1px solid #cbd5e1; border-radius:10px; background:#fff; padding:8px; text-align:left; display:grid; gap:6px; }
.template-option img { width:100%; height:74px; object-fit:cover; border-radius:6px; }
.template-option--active { border-color: rgb(var(--v-theme-primary)); box-shadow: 0 0 0 1px rgb(var(--v-theme-primary)); }
.palette-grid { display:grid; grid-template-columns:repeat(var(--palette-cols,5), 22px); gap:10px; }
.palette-dot { width:22px; height:22px; border-radius:999px; border:1px solid #94a3b8; }
.palette-dot--active { outline:2px solid rgb(var(--v-theme-primary)); outline-offset:2px; }
</style>
