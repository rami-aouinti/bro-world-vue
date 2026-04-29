<script setup lang="ts">
type PhotoShapeOption = {
  label: string
  value: string
  icon?: string
}

const props = defineProps<{
  options: PhotoShapeOption[]
  selectedValue: string
  photoSize: number
  photoBorderWidth: number
  photoPosition: 'left' | 'right'
}>()

const emit = defineEmits<{
  (event: 'select', value: string): void
  (event: 'move', direction: 'left' | 'right' | 'up' | 'down'): void
  (event: 'upload'): void
  (event: 'remove'): void
  (event: 'update:photo-size' | 'update:photo-border-width', value: number): void
  (event: 'update:photo-position', value: 'left' | 'right'): void
}>()

const isMenuOpen = ref(false)

function handlePhotoPositionUpdate(value: unknown) {
  if (value === 'left' || value === 'right') {
    emit('update:photo-position', value)
  }
}
</script>

<template>
  <div class="avatar-overlay-controls" :class="{ 'avatar-overlay-controls--menu-open': isMenuOpen }">
    <v-menu
      v-model="isMenuOpen"
      location="bottom end"
      offset="8"
      :close-on-content-click="false"
      scroll-strategy="reposition"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          icon="mdi-dots-vertical"
          size="x-small"
          variant="elevated"
          color="surface"
          class="photo-menu-trigger"
          v-bind="menuProps"
        />
      </template>

      <v-card class="photo-menu" elevation="10">
        <v-card-text class="photo-menu__content">
          <div class="photo-menu__actions">
            <v-btn
              size="small"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-upload"
              text="Upload / Remplacer"
              @click="emit('upload')"
            />
            <v-btn
              size="small"
              variant="text"
              color="error"
              prepend-icon="mdi-delete-outline"
              text="Retirer"
              @click="emit('remove')"
            />
          </div>

          <div class="photo-menu__section">
            <p class="photo-menu__label">Forme avatar</p>
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
          </div>

          <div class="photo-menu__section">
            <p class="photo-menu__label">Taille</p>
            <v-slider
              :model-value="props.photoSize"
              :min="96"
              :max="190"
              :step="2"
              hide-details
              density="compact"
              @update:model-value="emit('update:photo-size', Number($event))"
            />
          </div>

          <div class="photo-menu__section">
            <p class="photo-menu__label">Épaisseur bordure</p>
            <v-slider
              :model-value="props.photoBorderWidth"
              :min="0"
              :max="14"
              :step="1"
              hide-details
              density="compact"
              @update:model-value="emit('update:photo-border-width', Number($event))"
            />
          </div>

          <div class="photo-menu__section">
            <p class="photo-menu__label">Alignement</p>
            <v-btn-toggle
              :model-value="props.photoPosition"
              mandatory
              density="comfortable"
              divided
              @update:model-value="handlePhotoPositionUpdate"
            >
              <v-btn value="left" size="x-small">G</v-btn>
              <v-btn value="right" size="x-small">D</v-btn>
            </v-btn-toggle>
          </div>

          <div class="photo-menu__section">
            <p class="photo-menu__label">Position</p>
            <div class="photo-move-controls">
              <v-btn icon="mdi-arrow-up" size="x-small" variant="tonal" @click="emit('move', 'up')" />
              <div class="photo-move-controls__row">
                <v-btn icon="mdi-arrow-left" size="x-small" variant="tonal" @click="emit('move', 'left')" />
                <v-btn icon="mdi-arrow-right" size="x-small" variant="tonal" @click="emit('move', 'right')" />
              </div>
              <v-btn icon="mdi-arrow-down" size="x-small" variant="tonal" @click="emit('move', 'down')" />
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </div>
</template>

<style scoped>
.avatar-overlay-controls {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease;
}

.avatar-overlay-controls--menu-open {
  opacity: 1;
  pointer-events: auto;
}

.photo-menu-trigger {
  pointer-events: auto;
}

.photo-menu {
  width: min(270px, calc(100vw - 48px));
  max-height: min(560px, calc(100vh - 64px));
}

.photo-menu__content {
  display: grid;
  gap: 10px;
  max-height: inherit;
  overflow-y: auto;
  padding: 12px;
}

.photo-menu__section {
  display: grid;
  gap: 4px;
  padding: 8px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--resume-surface-soft, var(--cv-surface-soft)) 85%, transparent);
  border: 1px solid color-mix(in srgb, var(--resume-accent, var(--cv-accent)) 8%, transparent);
}

.photo-menu__actions {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.photo-menu__label {
  margin: 0;
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  opacity: 0.74;
}

.photo-shape-picker {
  --picker-radius: var(--resume-radius, var(--cv-radius, 14px));
  --picker-border: color-mix(in srgb, var(--resume-accent, var(--cv-accent)) 16%, var(--resume-page, var(--cv-page)));
  --picker-surface: var(--resume-surface-soft, var(--cv-surface-soft));

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 28px;
  padding: 3px;
  border-radius: calc(var(--picker-radius) - 2px);
  border: 1px solid var(--picker-border);
  background: var(--picker-surface);
  box-shadow: 0 var(--resume-space-2, var(--cv-space-2)) var(--resume-space-4, var(--cv-space-4)) var(--resume-shadow-soft, var(--cv-shadow-soft));
}

.avatar-overlay-controls :deep(.v-btn) {
  min-width: 24px;
  border-radius: calc(var(--picker-radius) - 6px);
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
}

.photo-move-controls__row {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
</style>
