<script setup lang="ts">
import type { GameLevel } from '~/composables/api/useGameSessionsApi'
import type { BeloteMode, GameEntry, PlayMode } from '~/types/game'

defineProps<{
  selectedGame: GameEntry
  selectedPlayMode: PlayMode | null
  selectedAiLevel: GameLevel | null
  selectedBeloteMode: BeloteMode | null
  displayedLocalModes: PlayMode[]
  aiLevels: GameLevel[]
  isLaunchingSession: boolean
  canLaunchSelectedGame: boolean
  modeImageMap: Record<PlayMode, string>
  levelImageMap: Record<GameLevel, string>
  modeLabel: (mode: PlayMode) => string
  isGameAvailableForLaunch: (game: GameEntry | null | undefined) => boolean
  getGameBusinessKey: (game: GameEntry | null | undefined) => string | null
  beloteTeamsLabel: string
  beloteFreeForAllLabel: string
  soonHintLabel: string
  launchGameLabel: string
}>()

const emit = defineEmits<{
  selectPlayMode: [mode: PlayMode]
  selectAiLevel: [level: GameLevel]
  selectBeloteMode: [mode: BeloteMode]
  launchGame: []
}>()
</script>

<template>
  <section class="mb-1 setup-section">
    <v-row class="mb-4" dense>
      <v-col
        v-for="mode in displayedLocalModes"
        :key="`mode-selection-${mode}`"
        :cols="displayedLocalModes.length > 1 ? 6 : 12"
      >
        <v-card
          class="mode-card d-flex align-center justify-center"
          :class="{ 'mode-card--active': selectedPlayMode === mode }"
          :variant="selectedPlayMode === mode ? 'flat' : 'outlined'"
          :color="
            selectedPlayMode === mode
              ? mode === 'ai'
                ? 'primary'
                : 'secondary'
              : undefined
          "
          @click="emit('selectPlayMode', mode)"
        >
          <v-card-text class="d-flex align-center justify-center">
            <v-img
              :src="modeImageMap[mode]"
              :alt="modeLabel(mode)"
              contain
              class="selection-card-image"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div
      v-if="getGameBusinessKey(selectedGame) === 'belote'"
      class="d-flex flex-wrap ga-2 mb-4"
    >
      <v-btn
        color="deep-purple"
        :variant="selectedBeloteMode === 'teams' ? 'flat' : 'outlined'"
        @click="emit('selectBeloteMode', 'teams')"
      >
        {{ beloteTeamsLabel }}
      </v-btn>
      <v-btn
        color="deep-purple"
        :variant="selectedBeloteMode === 'free-for-all' ? 'flat' : 'outlined'"
        @click="emit('selectBeloteMode', 'free-for-all')"
      >
        {{ beloteFreeForAllLabel }}
      </v-btn>
    </div>

    <v-row v-if="!isLaunchingSession" class="mb-4" dense>
      <v-col
        v-for="level in aiLevels"
        :key="`ai-level-${level}`"
        cols="12"
        md="4"
      >
        <v-card
          class="mode-card d-flex align-center justify-center"
          :class="{ 'mode-card--active': selectedAiLevel === level }"
          :variant="selectedAiLevel === level ? 'flat' : 'outlined'"
          :color="selectedAiLevel === level ? 'primary' : undefined"
          @click="emit('selectAiLevel', level)"
        >
          <v-card-text class="d-flex align-center justify-center">
            <v-img
              :src="levelImageMap[level]"
              :alt="level"
              contain
              class="selection-card-image"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-alert
      v-if="!isGameAvailableForLaunch(selectedGame)"
      type="info"
      variant="tonal"
      class="mb-4"
    >
      {{ soonHintLabel }}
    </v-alert>

    <div v-if="isLaunchingSession" class="launch-loader mt-auto pt-6">
      <v-progress-circular
        indeterminate
        :size="68"
        :width="6"
        color="primary"
        class="mb-4"
      />
      <p class="text-body-1 font-weight-medium mb-0">
        Préparation de votre session…
      </p>
    </div>

    <div v-else class="d-flex justify-center mt-auto pt-6">
      <v-btn
        color="success"
        :disabled="!canLaunchSelectedGame"
        size="large"
        @click="emit('launchGame')"
      >
        {{ launchGameLabel }}
      </v-btn>
    </div>
  </section>
</template>

<style scoped>
.setup-section {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
}

.mode-card {
  cursor: pointer;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
}

.mode-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.18);
}

:global(body.theme-gaming) .mode-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--gaming-glow-strong);
}

.mode-card--active {
  box-shadow: 0 12px 20px rgba(15, 23, 42, 0.18);
}

:global(body.theme-gaming) .mode-card--active {
  border-color: rgba(0, 229, 255, 0.42);
}

.selection-card-image {
  width: min(240px, 90%);
  min-height: 56px;
}

.launch-loader {
  min-height: 230px;
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-primary)) 28%, transparent);
  border-radius: 16px;
  display: grid;
  place-items: center;
  text-align: center;
  background: linear-gradient(
    130deg,
    rgba(var(--v-theme-primary), 0.1),
    rgba(var(--v-theme-surface), 0.4)
  );
}

:global(body.theme-gaming) .launch-loader {
  border-color: rgba(0, 229, 255, 0.4);
  background:
    radial-gradient(circle at top, rgba(0, 229, 255, 0.12), transparent 58%),
    linear-gradient(130deg, rgba(124, 77, 255, 0.2), rgba(8, 12, 26, 0.88));
}
</style>
