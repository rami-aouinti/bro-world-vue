<script setup lang="ts">
type MoveDirection = 'up' | 'down' | 'left' | 'right'
type ZoomDirection = 'in' | 'out'

type AvatarPhotoState = {
  x: number
  y: number
  scale: number
  hidden: boolean
}

const props = withDefaults(
  defineProps<{
    visible: boolean
    canMove?: boolean
    photoState: AvatarPhotoState
  }>(),
  {
    canMove: true,
  },
)

const emit = defineEmits<{
  (event: 'move', direction: MoveDirection): void
  (event: 'zoom', direction: ZoomDirection): void
  (event: 'upload' | 'remove' | 'toggle-visibility' | 'open-menu'): void
}>()

const hideShowLabel = computed(() =>
  props.photoState.hidden ? 'Show photo' : 'Hide photo',
)

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
    aria-label="Photo controls"
  >
    <v-tooltip text="Move up">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          icon
          variant="elevated"
          color="surface"
          class="overlay-btn overlay-btn--move overlay-btn--up"
          :disabled="!props.canMove"
          aria-label="Move up"
          v-bind="tooltipProps"
          @click="handleMove('up')"
        >
          <v-icon icon="mdi-arrow-up" />
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip text="Move right">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          icon
          variant="elevated"
          color="surface"
          class="overlay-btn overlay-btn--move overlay-btn--right"
          :disabled="!props.canMove"
          aria-label="Move right"
          v-bind="tooltipProps"
          @click="handleMove('right')"
        >
          <v-icon icon="mdi-arrow-right" />
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip text="Move down">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          icon
          variant="elevated"
          color="surface"
          class="overlay-btn overlay-btn--move overlay-btn--down"
          :disabled="!props.canMove"
          aria-label="Move down"
          v-bind="tooltipProps"
          @click="handleMove('down')"
        >
          <v-icon icon="mdi-arrow-down" />
        </v-btn>
      </template>
    </v-tooltip>

    <v-tooltip text="Move left">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          icon
          variant="elevated"
          color="surface"
          class="overlay-btn overlay-btn--move overlay-btn--left"
          :disabled="!props.canMove"
          aria-label="Move left"
          v-bind="tooltipProps"
          @click="handleMove('left')"
        >
          <v-icon icon="mdi-arrow-left" />
        </v-btn>
      </template>
    </v-tooltip>

    <div class="actions-column" role="group" aria-label="Photo actions">
      <v-tooltip text="Upload photo">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            icon
            variant="elevated"
            color="surface"
            class="overlay-btn"
            aria-label="Upload photo"
            v-bind="tooltipProps"
            @click="emit('upload')"
          >
            <v-icon icon="mdi-upload" />
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip text="Remove photo">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            icon
            variant="elevated"
            color="error"
            class="overlay-btn"
            aria-label="Remove photo"
            v-bind="tooltipProps"
            @click="emit('remove')"
          >
            <v-icon icon="mdi-delete-outline" />
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip text="Zoom in">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            icon
            variant="elevated"
            color="surface"
            class="overlay-btn"
            aria-label="Zoom in"
            v-bind="tooltipProps"
            @click="emit('zoom', 'in')"
          >
            <v-icon icon="mdi-magnify-plus-outline" />
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip text="Zoom out">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            icon
            variant="elevated"
            color="surface"
            class="overlay-btn"
            aria-label="Zoom out"
            v-bind="tooltipProps"
            @click="emit('zoom', 'out')"
          >
            <v-icon icon="mdi-magnify-minus-outline" />
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip :text="hideShowLabel">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            icon
            variant="elevated"
            color="surface"
            class="overlay-btn"
            :aria-label="hideShowLabel"
            v-bind="tooltipProps"
            @click="emit('toggle-visibility')"
          >
            <v-icon
              :icon="
                props.photoState.hidden
                  ? 'mdi-eye-outline'
                  : 'mdi-eye-off-outline'
              "
            />
          </v-btn>
        </template>
      </v-tooltip>

      <v-tooltip text="Menu photo">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            icon
            variant="elevated"
            color="surface"
            class="overlay-btn"
            aria-label="Ouvrir le menu photo"
            v-bind="tooltipProps"
            @click="emit('open-menu')"
          >
            <v-icon icon="mdi-dots-horizontal" />
          </v-btn>
        </template>
      </v-tooltip>
    </div>
  </div>
</template>

<style scoped>
.avatar-overlay-controls {
  position: absolute;
  inset: 0;
  z-index: 4;
  isolation: isolate;
  pointer-events: none;
}

.overlay-btn {
  --overlay-btn-size: 42px;

  position: absolute;
  width: var(--overlay-btn-size);
  height: var(--overlay-btn-size);
  min-width: var(--overlay-btn-size);
  border-radius: 12px;
  pointer-events: auto;
  color: rgb(var(--v-theme-on-surface));
  background: color-mix(
    in srgb,
    rgb(var(--v-theme-surface)) 84%,
    rgb(var(--v-theme-on-surface)) 16%
  );
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
  transition:
    transform 120ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease;
}

.overlay-btn--move {
  transform: translate(-50%, -50%);
}

.overlay-btn--up {
  top: 0;
  left: 50%;
}

.overlay-btn--right {
  top: 50%;
  right: 0;
  transform: translate(50%, -50%);
}

.overlay-btn--down {
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 50%);
}

.overlay-btn--left {
  top: 50%;
  left: 0;
  transform: translate(-50%, -50%);
}

.actions-column {
  position: absolute;
  left: 10px;
  bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border-radius: 14px;
  pointer-events: auto;
  background: color-mix(
    in srgb,
    rgb(var(--v-theme-surface)) 86%,
    rgb(var(--v-theme-on-surface)) 14%
  );
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.22);
}

.overlay-btn:is(:hover, :focus-visible) {
  background: color-mix(
    in srgb,
    rgb(var(--v-theme-surface)) 60%,
    rgb(var(--v-theme-primary)) 40%
  );
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.28);
}

.overlay-btn:active {
  transform: scale(0.96);
}

.overlay-btn--move:active {
  transform: translate(-50%, -50%) scale(0.96);
}

.overlay-btn--right:active {
  transform: translate(50%, -50%) scale(0.96);
}

.overlay-btn--down:active {
  transform: translate(-50%, 50%) scale(0.96);
}

.overlay-btn--left:active {
  transform: translate(-50%, -50%) scale(0.96);
}

.overlay-btn:deep(.v-btn__overlay) {
  opacity: 0;
}

.overlay-btn:deep(.v-btn__content) {
  font-size: 1rem;
}
</style>
