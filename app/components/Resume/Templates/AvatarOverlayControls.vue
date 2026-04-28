<script setup lang="ts">
type PhotoShapeOption = {
  label: string
  value: string
  icon?: string
}

const props = defineProps<{
  options: PhotoShapeOption[]
  selectedValue: string
}>()

const emit = defineEmits<{
  (event: 'select', value: string): void
  (event: 'move', direction: 'left' | 'right' | 'up' | 'down'): void
}>()
</script>

<template>
  <div class="avatar-overlay-controls">
    <div class="photo-shape-picker">
      <v-btn
        v-for="shape in props.options"
        :key="`preview-photo-shape-${shape.value}`"
        size="x-small"
        variant="tonal"
        :color="props.selectedValue === shape.value ? 'primary' : undefined"
        @click="emit('select', shape.value)"
      >
        {{ shape.icon ?? shape.label }}
      </v-btn>
    </div>

    <div class="photo-move-controls">
      <v-btn icon="mdi-arrow-up" size="x-small" variant="tonal" @click="emit('move', 'up')" />
      <div class="photo-move-controls__row">
        <v-btn icon="mdi-arrow-left" size="x-small" variant="tonal" @click="emit('move', 'left')" />
        <v-btn icon="mdi-arrow-right" size="x-small" variant="tonal" @click="emit('move', 'right')" />
      </div>
      <v-btn icon="mdi-arrow-down" size="x-small" variant="tonal" @click="emit('move', 'down')" />
    </div>
  </div>
</template>

<style scoped>
.avatar-overlay-controls {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease;
}

.photo-shape-picker {
  --picker-radius: var(--cv-radius, 14px);
  --picker-border: color-mix(in srgb, var(--cv-accent) 16%, var(--cv-page));
  --picker-surface: var(--cv-surface-soft);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 28px;
  margin-top: 8px;
  padding: 3px;
  border-radius: calc(var(--picker-radius) - 2px);
  border: 1px solid var(--picker-border);
  background: var(--picker-surface);
  backdrop-filter: blur(6px);
  box-shadow: 0 var(--cv-space-2) var(--cv-space-4) var(--cv-shadow-soft);
  transform: translateY(-8px) scale(0.98);
  transition: transform 200ms ease;
}

.avatar-overlay-controls :deep(.v-btn) {
  width: 24px;
  min-width: 24px;
  height: 24px;
  border-radius: calc(var(--picker-radius) - 6px);
  padding: 0;
}

.avatar-overlay-controls :deep(.v-btn__content) {
  display: grid;
  place-items: center;
  font-size: 0.72rem;
  line-height: 1;
}


.photo-move-controls {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-top: auto;
  margin-bottom: 8px;
  padding: 3px;
  border-radius: calc(var(--picker-radius) - 2px);
  border: 1px solid var(--picker-border);
  background: var(--picker-surface);
  backdrop-filter: blur(6px);
  box-shadow: 0 var(--cv-space-2) var(--cv-space-4) var(--cv-shadow-soft);
}

.photo-move-controls__row {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
</style>
