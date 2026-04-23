<script setup lang="ts">
import { computed, TransitionGroup } from 'vue'
import PlayingCard from './PlayingCard.vue'

interface HandCard {
  id: string
  rank: string
  suit: string
  faceDown?: boolean
}

const props = withDefaults(defineProps<{
  cards: HandCard[]
  orientation?: 'horizontal' | 'vertical'
  selectedCardIds?: string[]
  playableCardIds?: string[]
  disabledCardIds?: string[]
  highlightedCardIds?: string[]
  feedbackByCardId?: Partial<Record<string, 'idle' | 'error' | 'combo' | 'won'>>
}>(), {
  orientation: 'horizontal',
  selectedCardIds: () => [],
  playableCardIds: () => [],
  disabledCardIds: () => [],
  highlightedCardIds: () => [],
  feedbackByCardId: () => ({}),
})

const emit = defineEmits<{
  (event: 'play-card', payload: { id: string }): void
}>()

const midpoint = computed(() => (props.cards.length - 1) / 2)

const cardStyle = (index: number) => {
  const distance = index - midpoint.value

  if (props.orientation === 'vertical') {
    return {
      '--fan-rotate': '0deg',
      '--fan-shift': `${distance * -10}px`,
      '--fan-elevate': `${Math.abs(distance) * -2}px`,
      zIndex: String(props.cards.length - Math.abs(distance)),
    }
  }

  return {
    '--fan-rotate': `${distance * 3.5}deg`,
    '--fan-shift': `${distance * -20}px`,
    '--fan-elevate': `${Math.abs(distance) * -1.5}px`,
    zIndex: String(props.cards.length - Math.abs(distance)),
  }
}

const isPlayable = (id: string) => props.playableCardIds.length === 0 || props.playableCardIds.includes(id)
</script>

<template>
  <div class="card-fan-hand" :class="`card-fan-hand--${orientation}`">
    <TransitionGroup name="fan-card" tag="div" class="card-fan-hand__cards">
      <PlayingCard
        v-for="(card, index) in cards"
        :key="card.id"
        class="card-fan-hand__card"
        :style="cardStyle(index)"
        :rank="card.rank"
        :suit="card.suit"
        :face-down="card.faceDown"
        :selected="selectedCardIds.includes(card.id)"
        :playable="isPlayable(card.id)"
        :disabled="disabledCardIds.includes(card.id)"
        :highlighted="highlightedCardIds.includes(card.id)"
        :feedback="feedbackByCardId[card.id] ?? 'idle'"
        @select="emit('play-card', { id: card.id })"
      />
    </TransitionGroup>
  </div>
</template>
