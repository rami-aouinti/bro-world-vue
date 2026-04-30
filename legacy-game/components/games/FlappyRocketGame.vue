<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { GameAsidePanelState } from '~/components/games/types'
import type { PlayMode } from '~/types/game'
import type { SessionResult } from '~/composables/api/useGameSessionsApi'

const props = defineProps<{
  selectedPlayMode: PlayMode
}>()

const emit = defineEmits<{
  (event: 'panel-state', payload: GameAsidePanelState): void
  (event: 'finished' | 'game-finished', payload: { result: SessionResult }): void
}>()

type GameStatus = 'idle' | 'running' | 'gameover'

type ObstaclePair = {
  id: number
  x: number
  gapTop: number
  passed: boolean
}

const FIELD_HEIGHT = 360
const FIELD_WIDTH = 900
const ROCKET_X = 160
const ROCKET_WIDTH = 44
const ROCKET_HEIGHT = 30
const GRAVITY = 1560
const BOOST = -520
const MAX_FALL_SPEED = 640
const OBSTACLE_WIDTH = 84
const OBSTACLE_SPEED = 250
const OBSTACLE_GAP = 128
const OBSTACLE_SPACING = 320
const MIN_GAP_TOP = 42
const MAX_GAP_TOP = FIELD_HEIGHT - OBSTACLE_GAP - 42
const WIN_SCORE = 30

const gameStatus = ref<GameStatus>('idle')
const rocketY = ref(FIELD_HEIGHT / 2 - ROCKET_HEIGHT / 2)
const rocketVelocity = ref(0)
const score = ref(0)
const bestScore = ref(0)
const obstacles = ref<ObstaclePair[]>([])
const rafId = ref<number | null>(null)
const lastFrameTs = ref<number | null>(null)
const nextObstacleId = ref(1)
const isPageVisible = ref(true)
const hasFinished = ref(false)
const canWin = ref(true)

const randomGapTop = () =>
  Math.round(MIN_GAP_TOP + Math.random() * (MAX_GAP_TOP - MIN_GAP_TOP))

const createObstacle = (x: number): ObstaclePair => ({
  id: nextObstacleId.value++,
  x,
  gapTop: randomGapTop(),
  passed: false,
})

const rocketStyle = computed(() => ({
  left: `${(ROCKET_X / FIELD_WIDTH) * 100}%`,
  top: `${(rocketY.value / FIELD_HEIGHT) * 100}%`,
  transform: `translate(-50%, -50%) rotate(${Math.max(-28, Math.min(42, rocketVelocity.value / 10))}deg)`,
}))

const statusLabel = computed(() => {
  if (gameStatus.value === 'idle') return 'Prêt au décollage'
  if (gameStatus.value === 'running') return 'En vol'
  return score.value >= WIN_SCORE ? 'Mission réussie' : 'Crash'
})

const panelState = computed<GameAsidePanelState>(() => ({
  gameKey: 'flappy-rocket',
  title: 'Flappy Rocket',
  phase: statusLabel.value,
  turnLabel: props.selectedPlayMode === 'ai' ? 'Mode assisté' : 'Mode manuel',
  status:
    gameStatus.value === 'gameover'
      ? 'Relance une partie'
      : `Passe entre les obstacles (${WIN_SCORE} points pour gagner)`,
  highlights: [
    `Score ${score.value}`,
    `Record ${bestScore.value}`,
    'Espace / ↑ / tap pour pousser',
  ],
  kpis: [
    { id: 'score', label: 'Score', value: score.value, color: 'primary' },
    { id: 'best', label: 'Record', value: bestScore.value, color: 'success' },
    {
      id: 'state',
      label: 'État',
      value: gameStatus.value === 'running' ? 'Running' : gameStatus.value,
      color: gameStatus.value === 'gameover' ? 'error' : 'info',
    },
  ],
  actions: [
    {
      id: 'start',
      label:
        gameStatus.value === 'idle'
          ? 'Démarrer'
          : gameStatus.value === 'gameover'
            ? 'Rejouer'
            : 'Restart',
    },
    {
      id: 'boost',
      label: 'Pousser',
      disabled: gameStatus.value !== 'running',
    },
  ],
}))

const emitFinished = (result: SessionResult) => {
  if (hasFinished.value) return
  hasFinished.value = true
  emit('finished', { result })
  emit('game-finished', { result })
}

const resetRunState = () => {
  rocketY.value = FIELD_HEIGHT / 2 - ROCKET_HEIGHT / 2
  rocketVelocity.value = 0
  score.value = 0
  obstacles.value = [
    createObstacle(FIELD_WIDTH + 160),
    createObstacle(FIELD_WIDTH + 160 + OBSTACLE_SPACING),
    createObstacle(FIELD_WIDTH + 160 + OBSTACLE_SPACING * 2),
  ]
  lastFrameTs.value = null
  hasFinished.value = false
  canWin.value = true
}

const stopLoop = () => {
  if (rafId.value !== null) {
    cancelAnimationFrame(rafId.value)
    rafId.value = null
  }
}

const failRun = () => {
  if (gameStatus.value === 'gameover') return
  gameStatus.value = 'gameover'
  stopLoop()
  bestScore.value = Math.max(bestScore.value, score.value)
  emitFinished('lose')
}

const winRun = () => {
  if (gameStatus.value === 'gameover') return
  gameStatus.value = 'gameover'
  stopLoop()
  bestScore.value = Math.max(bestScore.value, score.value)
  emitFinished('win')
}

const boost = () => {
  if (gameStatus.value !== 'running') return
  rocketVelocity.value = BOOST
}

const spawnIfNeeded = () => {
  const lastObstacle = obstacles.value[obstacles.value.length - 1]
  if (!lastObstacle) return

  if (FIELD_WIDTH - lastObstacle.x >= OBSTACLE_SPACING) {
    obstacles.value.push(createObstacle(FIELD_WIDTH + OBSTACLE_WIDTH))
  }
}

const checkCollisionsAndScoring = () => {
  const rocketLeft = ROCKET_X - ROCKET_WIDTH / 2
  const rocketRight = ROCKET_X + ROCKET_WIDTH / 2
  const rocketTop = rocketY.value - ROCKET_HEIGHT / 2
  const rocketBottom = rocketY.value + ROCKET_HEIGHT / 2

  if (rocketTop <= 0 || rocketBottom >= FIELD_HEIGHT) {
    failRun()
    return
  }

  for (const obstacle of obstacles.value) {
    const obstacleRight = obstacle.x + OBSTACLE_WIDTH

    const overlapsX = rocketRight > obstacle.x && rocketLeft < obstacleRight
    const hitTop = rocketTop < obstacle.gapTop
    const hitBottom = rocketBottom > obstacle.gapTop + OBSTACLE_GAP

    if (overlapsX && (hitTop || hitBottom)) {
      failRun()
      return
    }

    if (!obstacle.passed && obstacleRight < rocketLeft) {
      obstacle.passed = true
      score.value += 1
      bestScore.value = Math.max(bestScore.value, score.value)

      if (canWin.value && score.value >= WIN_SCORE) {
        winRun()
        return
      }
    }
  }
}

const step = (ts: number) => {
  if (gameStatus.value !== 'running') return

  if (!isPageVisible.value) {
    lastFrameTs.value = ts
    rafId.value = requestAnimationFrame(step)
    return
  }

  const dt =
    lastFrameTs.value === null
      ? 0.016
      : Math.min((ts - lastFrameTs.value) / 1000, 0.05)
  lastFrameTs.value = ts

  rocketVelocity.value = Math.min(
    rocketVelocity.value + GRAVITY * dt,
    MAX_FALL_SPEED,
  )
  rocketY.value += rocketVelocity.value * dt

  for (const obstacle of obstacles.value) {
    obstacle.x -= OBSTACLE_SPEED * dt
  }

  obstacles.value = obstacles.value.filter(
    (obstacle) => obstacle.x + OBSTACLE_WIDTH > -30,
  )
  spawnIfNeeded()
  checkCollisionsAndScoring()

  if (gameStatus.value === 'running') {
    rafId.value = requestAnimationFrame(step)
  }
}

const startGame = () => {
  resetRunState()
  gameStatus.value = 'running'
  stopLoop()
  rafId.value = requestAnimationFrame(step)
}

const onPointerPress = () => {
  if (gameStatus.value === 'idle') {
    startGame()
    return
  }

  if (gameStatus.value === 'gameover') {
    startGame()
    return
  }

  boost()
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.code === 'Space' || event.code === 'ArrowUp') {
    event.preventDefault()
    onPointerPress()
  }

  if (event.code === 'KeyR') {
    event.preventDefault()
    startGame()
  }
}

const onVisibilityChange = () => {
  isPageVisible.value = document.visibilityState === 'visible'
  if (!isPageVisible.value) {
    lastFrameTs.value = null
  }
}

const handleAsideAction = (actionId: string) => {
  if (actionId === 'start') {
    startGame()
    return
  }

  if (actionId === 'boost') {
    onPointerPress()
  }
}

defineExpose({
  handleAsideAction,
})

watch(panelState, (value) => emit('panel-state', value), { immediate: true })

onMounted(() => {
  resetRunState()
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  stopLoop()
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <section class="flappy-rocket-game">
    <header
      class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
    >
      <div>
        <h3 class="text-h5 mb-1">Flappy Rocket</h3>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Espace / ↑ / tap: poussée · R: restart
        </p>
      </div>
      <div class="d-flex ga-2 align-center flex-wrap">
        <v-chip color="primary" variant="tonal">Score: {{ score }}</v-chip>
        <v-chip color="success" variant="tonal">Record: {{ bestScore }}</v-chip>
        <v-chip color="info" variant="tonal">{{ gameStatus }}</v-chip>
      </div>
    </header>

    <button
      class="game-field"
      type="button"
      aria-label="Flappy Rocket area"
      @pointerdown="onPointerPress"
    >
      <div
        v-for="obstacle in obstacles"
        :key="obstacle.id"
        class="obstacle-pair"
        :style="{ left: `${(obstacle.x / FIELD_WIDTH) * 100}%` }"
      >
        <div
          class="obstacle obstacle--top"
          :style="{ height: `${(obstacle.gapTop / FIELD_HEIGHT) * 100}%` }"
        />
        <div
          class="obstacle obstacle--bottom"
          :style="{
            top: `${((obstacle.gapTop + OBSTACLE_GAP) / FIELD_HEIGHT) * 100}%`,
          }"
        />
      </div>

      <div class="rocket" :style="rocketStyle">🚀</div>

      <div v-if="gameStatus !== 'running'" class="overlay">
        <p class="text-h6 mb-3">
          {{
            gameStatus === 'idle'
              ? 'Prêt à décoller ?'
              : score >= WIN_SCORE
                ? 'Mission réussie'
                : 'Crash détecté'
          }}
        </p>
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{
            gameStatus === 'idle'
              ? 'Passe entre les obstacles pour scorer.'
              : 'Appuie pour repartir en orbite.'
          }}
        </p>
        <v-btn color="primary" @click.stop="startGame">
          {{ gameStatus === 'idle' ? 'Start' : 'Restart' }}
        </v-btn>
      </div>
    </button>
  </section>
</template>

<style scoped>
.flappy-rocket-game {
  width: 100%;
}

.game-field {
  width: 100%;
  position: relative;
  display: block;
  height: clamp(300px, 50vw, 420px);
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-primary), 0.45);
  padding: 0;
  cursor: pointer;
  text-align: left;
  background:
    radial-gradient(
      circle at 84% 18%,
      rgba(139, 92, 246, 0.3),
      transparent 32%
    ),
    linear-gradient(180deg, rgba(13, 29, 66, 0.96), rgba(8, 14, 30, 0.99));
}

.obstacle-pair {
  position: absolute;
  top: 0;
  width: calc((84 / 900) * 100%);
  height: 100%;
}

.obstacle {
  position: absolute;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #22d3ee, #0284c7);
  box-shadow: 0 0 14px rgba(34, 211, 238, 0.35);
}

.obstacle--top {
  top: 0;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
}

.obstacle--bottom {
  bottom: 0;
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
}

.rocket {
  position: absolute;
  z-index: 2;
  font-size: clamp(26px, 4vw, 34px);
  transition: transform 50ms linear;
  will-change: transform, top;
}

.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  text-align: center;
  padding: 1.5rem;
  background: rgba(3, 9, 20, 0.65);
}

@media (max-width: 768px) {
  .game-field {
    border-radius: 14px;
    height: clamp(260px, 64vw, 360px);
  }
}
</style>
