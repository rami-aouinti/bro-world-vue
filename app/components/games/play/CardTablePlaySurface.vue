<script setup lang="ts">
interface TableSeat {
  id: string
  name: string
  stack?: string | number
  position: 'top' | 'right' | 'bottom' | 'left'
  isActive?: boolean
}

interface CardTablePlaySurfaceProps {
  title?: string
  subtitle?: string
  seats?: TableSeat[]
  communityCards?: string[]
  playerCards?: string[]
}

withDefaults(defineProps<CardTablePlaySurfaceProps>(), {
  title: 'Card table',
  subtitle: 'No-limit friendly table',
  seats: () => [],
  communityCards: () => [],
  playerCards: () => []
})
</script>

<template>
  <section class="card-surface">
    <header class="surface-header">
      <h3>{{ title }}</h3>
      <p>{{ subtitle }}</p>
    </header>

    <div class="oval-table">
      <div class="table-liner" />
      <div class="table-felt-glow" />

      <div class="seat-layer">
        <article
          v-for="seat in seats"
          :key="seat.id"
          class="seat"
          :class="[`seat--${seat.position}`, { 'seat--active': seat.isActive }]"
        >
          <p class="seat__name">{{ seat.name }}</p>
          <p v-if="seat.stack !== undefined" class="seat__stack">{{ seat.stack }}</p>
        </article>
      </div>

      <div class="community-zone">
        <p class="zone-label">Common cards</p>
        <div class="card-row">
          <span v-for="(card, index) in communityCards" :key="`${card}-${index}`" class="playing-card">{{ card }}</span>
        </div>
      </div>

      <div class="player-zone">
        <p class="zone-label">Your hand</p>
        <div class="card-row">
          <span v-for="(card, index) in playerCards" :key="`${card}-${index}`" class="playing-card playing-card--player">{{ card }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card-surface {
  display: grid;
  gap: 1rem;
}

.surface-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
}

.surface-header p {
  margin: 0.2rem 0 0;
  color: rgb(var(--v-theme-on-surface), 0.62);
  font-size: 0.875rem;
}

.oval-table {
  position: relative;
  min-height: 28rem;
  border-radius: 999px;
  overflow: hidden;
  background:
    radial-gradient(circle at 40% 35%, #2ba05f 0%, #146a3f 35%, #0d4d2e 100%),
    linear-gradient(135deg, #0e5e39, #0a3d26);
  box-shadow:
    inset 0 0 0 1px rgb(255 255 255 / 10%),
    inset 0 0 26px rgb(0 0 0 / 35%),
    0 20px 38px rgb(0 0 0 / 24%);
}

.table-liner,
.table-felt-glow {
  position: absolute;
  inset: 1rem;
  border-radius: inherit;
  pointer-events: none;
}

.table-liner {
  border: 2px solid rgb(245 203 101 / 75%);
  box-shadow:
    0 0 0 7px rgb(89 52 26 / 48%),
    inset 0 0 18px rgb(255 255 255 / 10%);
}

.table-felt-glow {
  inset: 2.2rem;
  border: 1px solid rgb(255 255 255 / 12%);
  background: linear-gradient(165deg, rgb(255 255 255 / 9%), rgb(255 255 255 / 1%));
  backdrop-filter: blur(2px);
}

.seat-layer {
  position: absolute;
  inset: 0;
}

.seat {
  position: absolute;
  padding: 0.5rem 0.75rem;
  min-width: 7.5rem;
  border-radius: 0.875rem;
  border: 1px solid rgb(255 255 255 / 18%);
  background: linear-gradient(135deg, rgb(255 255 255 / 22%), rgb(255 255 255 / 6%));
  box-shadow: 0 8px 24px rgb(0 0 0 / 25%);
  color: #f7f8fa;
  backdrop-filter: blur(6px);
}

.seat--active {
  border-color: rgb(255 233 146 / 90%);
  box-shadow:
    0 0 0 1px rgb(255 233 146 / 70%),
    0 10px 28px rgb(0 0 0 / 30%);
}

.seat--top {
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
}

.seat--right {
  top: 50%;
  right: 1.2rem;
  transform: translateY(-50%);
}

.seat--bottom {
  bottom: 1.2rem;
  left: 50%;
  transform: translateX(-50%);
}

.seat--left {
  top: 50%;
  left: 1.2rem;
  transform: translateY(-50%);
}

.seat__name,
.seat__stack {
  margin: 0;
}

.seat__name {
  font-weight: 600;
  font-size: 0.875rem;
}

.seat__stack {
  margin-top: 0.2rem;
  font-size: 0.75rem;
  opacity: 0.8;
}

.community-zone,
.player-zone {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: grid;
  justify-items: center;
  gap: 0.55rem;
}

.community-zone {
  top: 50%;
  transform: translate(-50%, -50%);
}

.player-zone {
  bottom: 3.8rem;
}

.zone-label {
  margin: 0;
  color: rgb(255 255 255 / 78%);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.card-row {
  display: flex;
  gap: 0.45rem;
}

.playing-card {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 4.2rem;
  border-radius: 0.55rem;
  font-weight: 700;
  font-size: 0.82rem;
  color: #132018;
  border: 1px solid rgb(255 255 255 / 62%);
  background: linear-gradient(160deg, #fff, #f3f3f3);
  box-shadow: 0 7px 14px rgb(0 0 0 / 30%);
}

.playing-card--player {
  transform: translateY(0.2rem);
}

@media (max-width: 960px) {
  .oval-table {
    min-height: 24rem;
    border-radius: 2rem;
  }

  .seat {
    min-width: 6.6rem;
    padding: 0.4rem 0.6rem;
  }

  .player-zone {
    bottom: 2.4rem;
  }
}
</style>
