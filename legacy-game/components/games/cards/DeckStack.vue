<script setup lang="ts">
import PlayingCard from './PlayingCard.vue'

const props = withDefaults(defineProps<{
  remaining: number
  disabled?: boolean
  canDraw?: boolean
  topDiscard?: { rank: string; suit: string } | null
}>(), {
  disabled: false,
  canDraw: true,
  topDiscard: null,
})

const emit = defineEmits<{
  (event: 'draw'): void
}>()
</script>

<template>
  <div class="deck-stack">
    <button
      type="button"
      class="deck-stack__draw"
      :class="{ 'is-disabled': disabled || !canDraw }"
      :disabled="disabled || !canDraw || remaining <= 0"
      aria-label="Piocher une carte"
      @click="emit('draw')"
    >
      <PlayingCard
        v-for="index in Math.min(remaining, 3)"
        :key="`stack-${index}`"
        class="deck-stack__card"
        :style="{ '--stack-index': index - 1 }"
        face-down
        :playable="false"
      />
      <span class="deck-stack__count">{{ remaining }}</span>
    </button>

    <div class="deck-stack__discard" aria-label="Défausse">
      <PlayingCard
        v-if="topDiscard"
        :rank="topDiscard.rank"
        :suit="topDiscard.suit"
        :playable="false"
      />
      <PlayingCard v-else face-down :playable="false" :disabled="true" />
    </div>
  </div>
</template>
