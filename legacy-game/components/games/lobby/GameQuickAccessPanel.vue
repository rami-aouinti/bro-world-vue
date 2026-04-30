<script setup lang="ts">
import type { GameEntry, PlayMode } from '~/types/game'

defineProps<{
  featuredGames: GameEntry[]
  isLoading: boolean
  selectedGameId: string | null
  selectedPlayMode: PlayMode | null
  modeLabel: (mode: PlayMode) => string
  title: string
  emptyText: string
  gameNameLabel: (game: GameEntry) => string
}>()

const emit = defineEmits<{
  selectGame: [game: GameEntry]
  selectMode: [mode: PlayMode]
}>()

const orderedModes: PlayMode[] = ['ai', 'pvp']
const getPlayableModes = (game: GameEntry): PlayMode[] =>
  game.availableModes ?? game.supportedModes ?? []
const getDisplayModes = (modes: PlayMode[]): PlayMode[] =>
  orderedModes.filter((mode) => modes.includes(mode))
const hasSoonBadge = (game: GameEntry) =>
  game.developmentStatus === 'coming_soon'
</script>

<template>
  <section>
    <v-chip variant="outlined" prepend-icon="mdi-gamepad" class="mb-2">
      {{ title }}
    </v-chip>
    <div v-if="isLoading" class="d-flex flex-column ga-3">
      <v-skeleton-loader
        v-for="index in 4"
        :key="`featured-games-skeleton-${index}`"
        type="heading"
      />
    </div>
    <v-alert
      v-else-if="!featuredGames.length"
      type="info"
      variant="tonal"
      density="comfortable"
    >
      {{ emptyText }}
    </v-alert>
    <div v-else class="d-flex flex-column ga-3 pa-2">
      <v-card
        v-for="game in featuredGames"
        :key="`quick-access-${game.id}`"
        variant="outlined"
        class="pa-3"
      >
        <div class="d-flex justify-space-between align-center ga-2 mb-2">
          <v-avatar size="32" :image="game.img" />
          <span class="font-weight-medium">{{ gameNameLabel(game) }}</span>
          <v-spacer />
          <v-chip
            v-if="hasSoonBadge(game)"
            size="small"
            color="warning"
            variant="tonal"
          >
            Soon
          </v-chip>
          <v-chip
            v-else
            size="small"
            color="success"
            variant="outlined"
            @click="emit('selectGame', game)"
          >
            Play
          </v-chip>
        </div>

        <div
          v-if="selectedGameId === game.id && getPlayableModes(game).length"
          class="d-flex ga-2"
          @click.stop
        >
          <v-btn
            v-for="mode in getDisplayModes(getPlayableModes(game))"
            :key="`quick-mode-${game.id}-${mode}`"
            size="small"
            :variant="selectedPlayMode === mode ? 'flat' : 'outlined'"
            @click="emit('selectMode', mode)"
          >
            {{ modeLabel(mode) }}
          </v-btn>
        </div>
      </v-card>
    </div>
  </section>
</template>
