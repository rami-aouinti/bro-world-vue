<script setup lang="ts">
import { mergeProps } from 'vue'

type ToolbarVariantOption = {
  label: string
  value: string
}

const props = withDefaults(defineProps<{
  sectionKey: string
  canMoveUp?: boolean
  canMoveDown?: boolean
  variants?: ToolbarVariantOption[]
  currentVariant?: string
}>(), {
  canMoveUp: false,
  canMoveDown: false,
  variants: () => [],
  currentVariant: '',
})

const emit = defineEmits<{
  (event: 'add-item' | 'move-up' | 'move-down', sectionKey: string): void
  (event: 'change-variant', sectionKey: string, variant: string): void
}>()
</script>

<template>
  <div class="section-toolbar" role="toolbar" :aria-label="`Actions de la section ${props.sectionKey}`">
    <v-tooltip text="Ajouter un élément">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          class="toolbar-btn"
          icon
          size="small"
          variant="tonal"
          :aria-label="`Ajouter un élément à la section ${props.sectionKey}`"
          v-bind="tooltipProps"
          @click="emit('add-item', props.sectionKey)"
        >
          <v-icon icon="mdi-plus" />
        </v-btn>
      </template>
    </v-tooltip>

    <v-menu v-if="props.variants.length">
      <template #activator="{ props: menuProps }">
        <v-tooltip text="Changer la variante">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              class="toolbar-btn"
              icon
              size="small"
              variant="tonal"
              :aria-label="`Changer la variante de la section ${props.sectionKey}`"
              v-bind="mergeProps(menuProps, tooltipProps)"
            >
              <v-icon icon="mdi-tune-variant" />
            </v-btn>
          </template>
        </v-tooltip>
      </template>
      <v-list density="compact">
        <v-list-item
          v-for="option in props.variants"
          :key="option.value"
          :active="option.value === props.currentVariant"
          @click="emit('change-variant', props.sectionKey, option.value)"
        >
          <v-list-item-title>{{ option.label }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-tooltip text="Monter la section">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          class="toolbar-btn"
          icon
          size="small"
          variant="tonal"
          :disabled="!props.canMoveUp"
          :aria-label="`Déplacer la section ${props.sectionKey} vers le haut`"
          v-bind="tooltipProps"
          @click="emit('move-up', props.sectionKey)"
        >
          <v-icon icon="mdi-chevron-up" />
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip text="Descendre la section">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          class="toolbar-btn"
          icon
          size="small"
          variant="tonal"
          :disabled="!props.canMoveDown"
          :aria-label="`Déplacer la section ${props.sectionKey} vers le bas`"
          v-bind="tooltipProps"
          @click="emit('move-down', props.sectionKey)"
        >
          <v-icon icon="mdi-chevron-down" />
        </v-btn>
      </template>
    </v-tooltip>
  </div>
</template>

<style scoped>
.section-toolbar {
  --cv-toolbar-border: var(--cv-toolbar-border-color, color-mix(in srgb, var(--cv-surface-contrast, #1e293b) 30%, transparent));
  --cv-toolbar-bg: var(--cv-toolbar-bg-color, color-mix(in srgb, var(--cv-surface, #ffffff) 88%, var(--cv-surface-contrast, #0f172a) 12%));
  --cv-toolbar-shadow: var(--cv-toolbar-shadow-color, color-mix(in srgb, #000000 18%, transparent));

  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  border: 1px solid var(--cv-toolbar-border);
  background: var(--cv-toolbar-bg);
  box-shadow: 0 4px 12px var(--cv-toolbar-shadow);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px);
  transition: opacity .2s ease, transform .2s ease;
}

.toolbar-btn {
  min-width: 30px;
  width: 30px;
  height: 30px;
}

:global(.resume-section-hoverable:hover > .section-toolbar),
:global(.resume-section-hoverable:focus-within > .section-toolbar),
:global(.resume-section-hoverable:has(:focus-visible) > .section-toolbar),
.section-toolbar:focus-within {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
</style>
