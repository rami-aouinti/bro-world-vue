<script setup lang="ts">
import { computed } from 'vue'
import PlayingCard from './PlayingCard.vue'

interface TrickPlay {
  id?: string
  seat: 'north' | 'east' | 'south' | 'west'
  rank: string
  suit: string
  playerName?: string
  won?: boolean
}

const props = withDefaults(defineProps<{
  trick: TrickPlay[]
  winnerSeat?: TrickPlay['seat'] | null
}>(), {
  winnerSeat: null,
})

const slotsOrder: TrickPlay['seat'][] = ['north', 'east', 'south', 'west']

const occupiedSeats = computed(() => new Set(props.trick.map(play => play.seat)))
</script>

<template>
  <div class="trick-pile" role="group" aria-label="Pli central">
    <TransitionGroup name="trick-card" tag="div" class="trick-pile__plays">
      <div
        v-for="play in trick"
        :key="play.id ?? `${play.seat}-${play.rank}-${play.suit}`"
        class="trick-pile__slot"
        :class="`trick-pile__slot--${play.seat}`"
      >
        <PlayingCard
          :rank="play.rank"
          :suit="play.suit"
          :selected="winnerSeat === play.seat"
          :highlighted="winnerSeat === play.seat"
          :feedback="winnerSeat === play.seat || play.won ? 'won' : 'idle'"
          :playable="false"
          :disabled="true"
          :hoverable="false"
          :label="`${play.playerName ?? play.seat} ${play.rank}${play.suit}`"
        />
      </div>
    </TransitionGroup>

    <div
      v-for="seat in slotsOrder"
      :key="`empty-${seat}`"
      class="trick-pile__slot"
      :class="`trick-pile__slot--${seat}`"
    >
      <div v-if="!occupiedSeats.has(seat)" class="trick-pile__empty" aria-hidden="true">—</div>
    </div>
  </div>
</template>
