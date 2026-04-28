<script setup lang="ts">
type MoveDirection = 'up' | 'down' | 'left' | 'right'
type ZoomDirection = 'in' | 'out'

type AvatarPhotoState = {
  x: number
  y: number
  scale: number
  hidden: boolean
}

const props = withDefaults(defineProps<{
  visible: boolean
  canMove?: boolean
  photoState: AvatarPhotoState
}>(), {
  canMove: true,
})

const emit = defineEmits<{
  (event: 'move', direction: MoveDirection): void
  (event: 'zoom', direction: ZoomDirection): void
  (event: 'upload' | 'remove' | 'toggle-visibility' | 'open-menu'): void
}>()

const hideShowLabel = computed(() => (props.photoState.hidden ? 'Afficher la photo' : 'Masquer la photo'))

function handleMove(direction: MoveDirection) {
  if (!props.canMove) return
  emit('move', direction)
}
</script>

<template>
  <div
    v-if="props.visible"
    class="avatar-overlay-controls"
    role="toolbar"
    aria-label="Contrôles de photo"
  >
    <div class="controls-row controls-row--top">
      <v-tooltip text="Menu photo">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            icon
            size="small"
            variant="elevated"
            color="surface"
            aria-label="Ouvrir le menu photo"
            v-bind="tooltipProps"
            @click="emit('open-menu')"
          >
            <v-icon icon="mdi-dots-horizontal" />
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip text="Téléverser une photo">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            icon
            size="small"
            variant="elevated"
            color="surface"
            aria-label="Téléverser une photo"
            v-bind="tooltipProps"
            @click="emit('upload')"
          >
            <v-icon icon="mdi-upload" />
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip text="Supprimer la photo">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            icon
            size="small"
            variant="elevated"
            color="error"
            aria-label="Supprimer la photo"
            v-bind="tooltipProps"
            @click="emit('remove')"
          >
            <v-icon icon="mdi-delete-outline" />
          </v-btn>
        </template>
      </v-tooltip>
    </div>

    <div class="controls-row controls-row--middle">
      <div class="move-pad" role="group" aria-label="Déplacement photo">
        <v-btn
          icon
          size="small"
          variant="elevated"
          color="surface"
          :disabled="!props.canMove"
          aria-label="Déplacer vers le haut"
          class="move-btn move-btn--up"
          @click="handleMove('up')"
        >
          <v-icon icon="mdi-arrow-up" />
        </v-btn>

        <v-btn
          icon
          size="small"
          variant="elevated"
          color="surface"
          :disabled="!props.canMove"
          aria-label="Déplacer vers la gauche"
          class="move-btn move-btn--left"
          @click="handleMove('left')"
        >
          <v-icon icon="mdi-arrow-left" />
        </v-btn>

        <div class="move-indicator" :class="{ 'is-disabled': !props.canMove }">
          <span>{{ Math.round(props.photoState.x) }}, {{ Math.round(props.photoState.y) }}</span>
        </div>

        <v-btn
          icon
          size="small"
          variant="elevated"
          color="surface"
          :disabled="!props.canMove"
          aria-label="Déplacer vers la droite"
          class="move-btn move-btn--right"
          @click="handleMove('right')"
        >
          <v-icon icon="mdi-arrow-right" />
        </v-btn>

        <v-btn
          icon
          size="small"
          variant="elevated"
          color="surface"
          :disabled="!props.canMove"
          aria-label="Déplacer vers le bas"
          class="move-btn move-btn--down"
          @click="handleMove('down')"
        >
          <v-icon icon="mdi-arrow-down" />
        </v-btn>
      </div>

      <div class="zoom-controls" role="group" aria-label="Zoom photo">
        <v-btn
          icon
          size="small"
          variant="elevated"
          color="surface"
          aria-label="Zoom avant"
          @click="emit('zoom', 'in')"
        >
          <v-icon icon="mdi-magnify-plus-outline" />
        </v-btn>

        <div class="zoom-value">{{ Math.round(props.photoState.scale * 100) }}%</div>

        <v-btn
          icon
          size="small"
          variant="elevated"
          color="surface"
          aria-label="Zoom arrière"
          @click="emit('zoom', 'out')"
        >
          <v-icon icon="mdi-magnify-minus-outline" />
        </v-btn>
      </div>
    </div>

    <div class="controls-row controls-row--bottom">
      <v-btn
        variant="elevated"
        color="surface"
        size="small"
        class="visibility-btn"
        :prepend-icon="props.photoState.hidden ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
        @click="emit('toggle-visibility')"
      >
        {{ hideShowLabel }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.avatar-overlay-controls {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
  pointer-events: none;
}

.controls-row {
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: auto;
}

.controls-row--top {
  justify-content: flex-end;
}

.controls-row--middle {
  justify-content: space-between;
  align-items: flex-end;
}

.controls-row--bottom {
  justify-content: center;
}

.move-pad {
  display: grid;
  grid-template-columns: repeat(3, 34px);
  grid-template-rows: repeat(3, 34px);
  align-items: center;
  justify-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--v-theme-surface) 72%, transparent);
  backdrop-filter: blur(3px);
}

.move-btn--up {
  grid-column: 2;
  grid-row: 1;
}

.move-btn--left {
  grid-column: 1;
  grid-row: 2;
}

.move-btn--right {
  grid-column: 3;
  grid-row: 2;
}

.move-btn--down {
  grid-column: 2;
  grid-row: 3;
}

.move-indicator {
  grid-column: 2;
  grid-row: 2;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  color: rgb(var(--v-theme-on-surface));
  background: color-mix(in srgb, var(--v-theme-surface) 88%, var(--v-theme-primary) 12%);
}

.move-indicator.is-disabled {
  opacity: 0.55;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--v-theme-surface) 72%, transparent);
  backdrop-filter: blur(3px);
}

.zoom-value {
  min-width: 48px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.visibility-btn {
  text-transform: none;
  font-weight: 600;
}
</style>
