<script setup lang="ts">
interface PreviewToolbarTemplate {
  id: string
  title?: string
  name?: string
  image?: string
}

interface PreviewToolbarPalette {
  title: string
  value: string
  primary: string
  dark: string
  light: string
}

const props = withDefaults(defineProps<{
  templates: PreviewToolbarTemplate[]
  selectedTemplate: string
  menuOpen: boolean
  paletteMenuOpen?: boolean
  palettes?: PreviewToolbarPalette[]
  selectedPalette?: string
  templateKeyPrefix?: string
  paletteColumns?: number
  getTemplateImage?: (template: PreviewToolbarTemplate) => string
}>(), {
  templateKeyPrefix: 'preview-template',
  getTemplateImage: undefined,
  palettes: () => [],
  selectedPalette: 'template',
  paletteMenuOpen: false,
  paletteColumns: 5,
})

const emit = defineEmits<{
  'update:menuOpen': [value: boolean]
  'update:paletteMenuOpen': [value: boolean]
  save: []
  ai: []
  signature: []
  pdf: []
  'select-template': [templateId: string]
  'select-palette': [paletteId: string]
}>()

const menuModel = computed({
  get: () => props.menuOpen,
  set: (value: boolean) => emit('update:menuOpen', value),
})

const paletteMenuModel = computed({
  get: () => Boolean(props.paletteMenuOpen),
  set: (value: boolean) => emit('update:paletteMenuOpen', value),
})

function templateImage(template: PreviewToolbarTemplate) {
  return props.getTemplateImage?.(template) || template.image || ''
}

function templateTitle(template: PreviewToolbarTemplate) {
  return template.title || template.name || template.id
}
</script>

<template>
  <div class="preview-toolbar-wrap">
    <div class="preview-toolbar-row">
      <v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-content-save-cog-outline" @click="emit('save')">
        Save
      </v-btn>
      <v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-robot-outline" @click="emit('ai')">
        AI
      </v-btn>
      <v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-signature-freehand" @click="emit('signature')">
        Signature
      </v-btn>
      <v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-file-pdf-box" @click="emit('pdf')">
        PDF
      </v-btn>
      <v-menu v-if="palettes.length" v-model="paletteMenuModel" location="bottom center" origin="top center">
        <template #activator="{ props: activatorProps }">
          <v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-palette" v-bind="activatorProps">
            Palette
          </v-btn>
        </template>
        <v-card class="palette-menu-card">
          <div class="palette-grid" :style="{ '--palette-columns': String(paletteColumns || 5) }">
            <button
              v-for="palette in palettes"
              :key="`palette-${palette.value}`"
              type="button"
              class="palette-swatch-btn"
              :class="{ 'palette-swatch-btn--active': selectedPalette === palette.value }"
              @click="emit('select-palette', palette.value)"
            >
              <div class="d-flex ga-1">
                <span class="palette-dot" :style="{ backgroundColor: palette.primary }" />
                <span class="palette-dot" :style="{ backgroundColor: palette.dark }" />
                <span class="palette-dot" :style="{ backgroundColor: palette.light }" />
              </div>
            </button>
          </div>
        </v-card>
      </v-menu>
      <v-menu v-model="menuModel" location="bottom center" origin="top center">
        <template #activator="{ props: activatorProps }">
          <v-btn class="preview-toolbar-btn" size="small" variant="text" prepend-icon="mdi-view-grid-outline" v-bind="activatorProps">
            Templates
          </v-btn>
        </template>
        <v-card class="template-menu-card">
          <div class="template-menu-grid">
            <v-card
              v-for="template in templates"
              :key="`${templateKeyPrefix}-${template.id}`"
              class="template-menu-item"
              :class="{ 'template-menu-item--active': selectedTemplate === template.id }"
              variant="outlined"
              @click="emit('select-template', template.id)"
            >
              <v-img v-if="templateImage(template)" :src="templateImage(template)" class="template-menu-thumb" cover />
              <v-card-text class="py-2 text-caption">{{ templateTitle(template) }}</v-card-text>
            </v-card>
          </div>
        </v-card>
      </v-menu>
    </div>
  </div>
</template>

<style scoped>
.preview-toolbar-wrap { position: sticky; top: 76px; z-index: 20; display: flex; justify-content: center; }
.preview-toolbar-row { display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 12px; border: 1px solid rgba(148, 163, 184, .35); border-radius: 999px; background: rgba(var(--v-theme-primary)); }
.template-menu-card { margin-top: 8px; padding: 12px; width: min(860px, calc(100vw - 48px)); max-height: 70vh; overflow: auto; }
.template-menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); justify-content: center; gap: 12px; }
.template-menu-item { cursor: pointer; margin: 0; }
.template-menu-item--active { border: 2px solid rgb(var(--v-theme-primary)); }
.template-menu-thumb { height: 128px; }
.palette-menu-card { margin-top: 8px; padding: 12px; }
.palette-grid { display: grid; grid-template-columns: repeat(var(--palette-columns, 5), minmax(0, 1fr)); gap: 8px; }
.palette-swatch-btn { border: 1px solid rgba(100, 116, 139, 0.35); border-radius: 10px; background: #fff; padding: 8px; cursor: pointer; }
.palette-swatch-btn--active { border-color: rgb(var(--v-theme-primary)); box-shadow: inset 0 0 0 1px rgb(var(--v-theme-primary)); }
.palette-dot { width: 16px; height: 16px; border-radius: 999px; border: 1px solid rgba(15, 23, 42, 0.15); display: inline-flex; }
:global(body.print-cover-mode) .preview-toolbar-wrap { display: none !important; }
@media print { .preview-toolbar-wrap { display: none !important; } }
</style>
