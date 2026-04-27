<script setup lang="ts">
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
  (event: 'add-item', sectionKey: string): void
  (event: 'move-up', sectionKey: string): void
  (event: 'move-down', sectionKey: string): void
  (event: 'change-variant', sectionKey: string, variant: string): void
}>()
</script>

<template>
  <div class="section-toolbar" role="toolbar" :aria-label="`Section ${sectionKey} actions`">
    <v-btn icon size="x-small" variant="text" @click="emit('add-item', sectionKey)">+</v-btn>

    <v-menu v-if="variants.length">
      <template #activator="{ props: menuProps }">
        <v-btn icon size="x-small" variant="text" v-bind="menuProps">⋯</v-btn>
      </template>
      <v-list density="compact">
        <v-list-item
          v-for="option in variants"
          :key="option.value"
          :active="option.value === currentVariant"
          @click="emit('change-variant', sectionKey, option.value)"
        >
          <v-list-item-title>{{ option.label }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-btn icon size="x-small" variant="text" :disabled="!canMoveUp" @click="emit('move-up', sectionKey)">↑</v-btn>
    <v-btn icon size="x-small" variant="text" :disabled="!canMoveDown" @click="emit('move-down', sectionKey)">↓</v-btn>
  </div>
</template>

<style scoped>
.section-toolbar {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, #ff0000 40%, #ffffff);
  background: color-mix(in srgb, #ff0000 12%, transparent);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px);
  transition: opacity .2s ease, transform .2s ease;
}

:global(.resume-section-hoverable:hover > .section-toolbar),
:global(.resume-section-hoverable:focus-within > .section-toolbar) {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
</style>
