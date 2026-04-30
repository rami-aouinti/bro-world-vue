<script setup lang="ts">
import { computed } from 'vue'
import { useCardTheme } from '~/composables/games/useCardTheme'

const props = withDefaults(
  defineProps<{
    rank?: string
    suit?: string
    faceDown?: boolean
    selected?: boolean
    playable?: boolean
    disabled?: boolean
    highlighted?: boolean
    feedback?: 'idle' | 'error' | 'combo' | 'won'
    hoverable?: boolean
    label?: string
  }>(),
  {
    rank: '',
    suit: '',
    faceDown: false,
    selected: false,
    playable: true,
    disabled: false,
    highlighted: false,
    feedback: 'idle',
    hoverable: true,
    label: '',
  },
)

const emit = defineEmits<{
  (event: 'select'): void
}>()

const { isRedSuit } = useCardTheme()

const suitClass = computed(() =>
  isRedSuit(props.suit) ? 'game-card--red' : 'game-card--black',
)

const a11yLabel = computed(() => {
  if (props.label) return props.label
  if (props.faceDown) return 'Carte face cachée'
  if (props.rank && props.suit) return `${props.rank} ${props.suit}`
  return 'Carte'
})
</script>

<template>
  <button
    type="button"
    class="game-card"
    :class="[
      suitClass,
      {
        'is-face-down': faceDown,
        'is-selected': selected,
        'is-playable': playable && !disabled,
        'is-disabled': disabled || !playable,
        'is-highlighted': highlighted,
        'is-hoverable': hoverable,
        'is-feedback-error': feedback === 'error',
        'is-feedback-combo': feedback === 'combo',
        'is-feedback-won': feedback === 'won',
      },
    ]"
    :disabled="disabled || !playable"
    :aria-label="a11yLabel"
    @click="emit('select')"
  >
    <template v-if="faceDown">
      <span class="game-card__back-pattern" aria-hidden="true" />
    </template>
    <template v-else>
      <span class="game-card__corner">{{ rank }}{{ suit }}</span>
      <span class="game-card__suit">{{ suit }}</span>
      <span class="game-card__corner game-card__corner--bottom"
        >{{ rank }}{{ suit }}</span
      >
    </template>
  </button>
</template>
