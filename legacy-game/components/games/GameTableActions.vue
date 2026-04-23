<script setup lang="ts">
import type { PropType } from "vue";
import type { GameAsidePanelAction } from "./types";

defineProps({
  actions: {
    type: Array as PropType<GameAsidePanelAction[]>,
    default: () => [],
  },
});

const emit = defineEmits<{
  (event: "action", actionId: string): void;
}>();
</script>

<template>
  <div v-if="actions.length" class="game-table-actions" role="toolbar" aria-label="Actions de jeu">
    <v-btn
      v-for="action in actions"
      :key="`game-table-action-${action.id}`"
      size="small"
      variant="outlined"
      color="primary"
      :disabled="action.disabled"
      :aria-label="action.label"
      @click="emit('action', action.id)"
    >
      {{ action.label }}
    </v-btn>
  </div>
</template>

<style scoped>
.game-table-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
}
</style>
