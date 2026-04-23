<script setup lang="ts">
import { computed } from "vue";

interface TablePlayer {
  id: string;
  name: string;
  avatar?: string;
  isAI: boolean;
  isCurrentTurn: boolean;
  timerSeconds?: number;
}

interface Props {
  players?: TablePlayer[];
  turnTimerSeconds?: number;
  tableClass?: string;
  surfaceVariant?: "table" | "flat";
  tableTheme?: "default" | "uno" | "belote" | "poker";
}

const props = withDefaults(defineProps<Props>(), {
  players: () => [],
  turnTimerSeconds: 120,
  tableClass: "",
  surfaceVariant: "table",
  tableTheme: "default",
});

const seatPositions = computed(() => {
  if (props.players.length >= 6) {
    return [
      "north",
      "north-east",
      "south-east",
      "south",
      "south-west",
      "north-west",
    ] as const;
  }

  return ["north", "east", "south", "west"] as const;
});

const playersWithSeats = computed(() =>
  props.players.slice(0, seatPositions.value.length).map((player, index) => ({
    ...player,
    seat: seatPositions.value[index],
    displayedTimer: player.isCurrentTurn
      ? (player.timerSeconds ?? props.turnTimerSeconds)
      : null,
  })),
);

const TURN_RING_BASE_SECONDS = 30;

const getRingTimerSeconds = (displayedTimer: number | null) => {
  if (displayedTimer === null || displayedTimer > TURN_RING_BASE_SECONDS) {
    return null;
  }

  return Math.max(0, displayedTimer);
};

const getRingColor = (secondsLeft: number) => {
  if (secondsLeft <= 5) {
    return "error";
  }

  if (secondsLeft <= 15) {
    return "warning";
  }

  return "success";
};

const getRingProgress = (secondsLeft: number) =>
  Math.round((secondsLeft / TURN_RING_BASE_SECONDS) * 100);
</script>

<template>
  <div class="game-table-scaffold">
    <div class="game-table-scaffold__table-wrap">
      <div
        class="game-table-scaffold__table"
        :class="[
          tableClass,
          `table-theme--${props.tableTheme}`,
          `game-table-scaffold__table--${props.surfaceVariant}`,
        ]"
      >
        <article
          v-for="player in playersWithSeats"
          :key="player.id"
          class="game-seat"
          :class="[`game-seat--${player.seat}`, { 'game-seat--active': player.isCurrentTurn }]"
        >
          <div class="game-seat__avatar-wrap">
            <v-progress-circular
              v-if="player.isCurrentTurn && getRingTimerSeconds(player.displayedTimer) !== null"
              class="game-seat__turn-ring"
              :model-value="getRingProgress(getRingTimerSeconds(player.displayedTimer)!)"
              :color="getRingColor(getRingTimerSeconds(player.displayedTimer)!)"
              :size="42"
              :width="4"
              aria-live="polite"
              role="img"
              :aria-label="`${getRingTimerSeconds(player.displayedTimer)} secondes restantes`"
            />
            <v-avatar :image="player.avatar" size="30" color="primary" variant="tonal">
              <span class="text-caption font-weight-bold">{{ player.name.slice(0, 2).toUpperCase() }}</span>
            </v-avatar>
          </div>
          <p class="game-seat__name mb-0">{{ player.name }}</p>
        </article>

        <section class="game-table-scaffold__surface">
          <slot name="surface">
            <slot name="center" />
          </slot>
        </section>

        <div class="game-table-scaffold__hands">
          <slot name="player-hands" />
        </div>
      </div>
    </div>

    <aside v-if="$slots.aside" class="game-table-scaffold__aside">
      <slot name="aside" />
    </aside>
  </div>
</template>

<style scoped>
.game-table-scaffold { display: flex; align-items: flex-start; gap: 16px; }
.game-table-scaffold__table-wrap { flex: 1 1 auto; min-width: 0; }
.game-table-scaffold__table {
  position: relative;
  min-height: 520px;
  min-width: 520px;
  border-radius: 48% / 40%;
  background: radial-gradient(circle at center, #2f9d59 0%, #19663c 74%);
  border: 12px solid rgba(48, 24, 13, 0.72);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16), inset 0 0 0 14px rgba(0, 0, 0, 0.08), 0 18px 34px rgba(12, 31, 20, 0.28);
  overflow: hidden;
}
.game-table-scaffold__table.table-theme--uno {
  background: radial-gradient(circle at center, #f7c948 0%, #b7791f 74%);
  border-color: rgba(107, 70, 2, 0.8);
  box-shadow: inset 0 0 0 1px rgba(255, 250, 224, 0.22), inset 0 0 0 14px rgba(74, 51, 10, 0.14), 0 18px 34px rgba(107, 70, 2, 0.3);
}
.game-table-scaffold__table.table-theme--belote {
  background: radial-gradient(circle at center, #4d94d4 0%, #124a80 74%);
  border-color: rgba(10, 33, 65, 0.78);
  box-shadow: inset 0 0 0 1px rgba(235, 245, 255, 0.2), inset 0 0 0 14px rgba(12, 38, 72, 0.14), 0 18px 34px rgba(8, 31, 59, 0.32);
}
.game-table-scaffold__table.table-theme--poker {
  background: radial-gradient(circle at center, #bf1e2e 0%, #5b1125 74%);
  border-color: rgba(51, 9, 18, 0.85);
  box-shadow: inset 0 0 0 1px rgba(255, 228, 230, 0.16), inset 0 0 0 14px rgba(33, 8, 14, 0.24), 0 18px 34px rgba(33, 8, 14, 0.46);
}
:global(body.theme-gaming) .game-table-scaffold__table {
  background:
    radial-gradient(circle at 50% 40%, rgba(0, 229, 255, 0.14), transparent 52%),
    radial-gradient(circle at center, #122242 0%, #081327 72%);
  border: 10px solid rgba(3, 9, 20, 0.95);
  box-shadow:
    inset 0 0 0 1px rgba(0, 229, 255, 0.25),
    inset 0 0 40px rgba(124, 77, 255, 0.18),
    0 20px 40px rgba(2, 8, 20, 0.65);
}
.game-table-scaffold__table--flat {
  min-height: auto;
  min-width: 0;
  border-radius: 20px;
  background: transparent;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.12);
  padding: 1rem;
}
:global(body.theme-gaming) .game-table-scaffold__table--flat {
  background:
    linear-gradient(160deg, rgba(11, 16, 34, 0.98), rgba(8, 12, 26, 0.95));
  border-color: var(--gaming-surface-border);
  box-shadow: var(--gaming-glow-strong);
}
.game-seat {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 6px 5px;
  border-radius: 14px;
  background: rgba(8, 19, 12, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  z-index: 4;
}
.game-table-scaffold__table.table-theme--uno .game-seat,
.game-table-scaffold__table.table-theme--belote .game-seat,
.game-table-scaffold__table.table-theme--poker .game-seat {
  background: rgba(7, 12, 24, 0.54);
  color: #fff;
}
:global(body.theme-gaming) .game-seat {
  background: rgba(5, 11, 24, 0.72);
  border-color: rgba(0, 229, 255, 0.45);
}
.game-seat--active { border-color: rgba(255, 235, 59, 0.8); box-shadow: 0 0 0 1px rgba(255, 235, 59, 0.35); padding-top: 8px; }
:global(body.theme-gaming) .game-seat--active {
  border-color: rgba(0, 229, 255, 0.9);
  box-shadow: 0 0 0 1px rgba(0, 229, 255, 0.6), 0 0 16px rgba(139, 92, 246, 0.45);
}
.game-seat--north { top: 0px; left: 50%; transform: translateX(-50%); }
.game-seat--east { top: 50%; right: 0px; transform: translateY(-50%); }
.game-seat--south { bottom: 0px; left: 50%; transform: translateX(-50%); }
.game-seat--west { top: 50%; left: 0px; transform: translateY(-50%); }
.game-seat--north-east { top: 54px; right: 26px; }
.game-seat--south-east { bottom: 54px; right: 26px; }
.game-seat--south-west { bottom: 54px; left: 26px; }
.game-seat--north-west { top: 54px; left: 26px; }
.game-seat__name { font-size: 0.68rem; font-weight: 700; line-height: 1.1; text-align: center; }
.game-seat__avatar-wrap { position: relative; width: 42px; height: 42px; display: grid; place-items: center; }
.game-seat__turn-ring { position: absolute; inset: 0; }
.game-table-scaffold__surface {
  position: absolute;
  inset: 200px 150px 200px;
  border-radius: 999px;
  border: 1px dashed rgba(255, 255, 255, 0.32);
  background: rgba(3, 9, 6, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  color: #fff;
}
.game-table-scaffold__table.table-theme--uno .game-table-scaffold__surface {
  border-color: rgba(255, 252, 233, 0.58);
  background: rgba(107, 70, 2, 0.34);
  color: #fff8e8;
}
.game-table-scaffold__table.table-theme--belote .game-table-scaffold__surface {
  border-color: rgba(227, 242, 255, 0.52);
  background: rgba(9, 40, 74, 0.34);
  color: #eff6ff;
}
.game-table-scaffold__table.table-theme--poker .game-table-scaffold__surface {
  border-color: rgba(255, 228, 230, 0.5);
  background: rgba(55, 10, 26, 0.4);
  color: #fff1f2;
}
:global(body.theme-gaming) .game-table-scaffold__surface {
  border: 1px dashed rgba(0, 229, 255, 0.38);
  background: rgba(3, 8, 20, 0.46);
}
.game-table-scaffold__table--flat .game-table-scaffold__surface {
  position: static;
  inset: auto;
  border: none;
  background: transparent;
  border-radius: 0;
  padding: 0;
  color: inherit;
}
.game-table-scaffold__hands,
.game-table-scaffold__content { width: 100%; }
.game-table-scaffold__content {
  border-radius: 16px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-primary)) 22%, transparent);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 96%, rgb(var(--v-theme-primary)) 4%);
  padding: 14px;
  margin-top: 12px;
}
.game-table-scaffold__aside { width: min(360px, 100%); flex: 0 0 min(360px, 100%); }

@media (max-width: 960px) {
  .game-table-scaffold { flex-direction: column; }
  .game-table-scaffold__aside { width: 100%; flex-basis: auto; }
  .game-table-scaffold__table { min-height: 700px; border-radius: 28px; border-width: 8px; }
  .game-table-scaffold__table--flat {
    min-height: auto;
    border-width: 1px;
    border-radius: 16px;
  }
  .game-table-scaffold__surface { inset: 200px 150px 200px; }
  .game-table-scaffold__table--flat .game-table-scaffold__surface { inset: auto; }
  .game-seat--east, .game-seat--west { top: auto; transform: none; bottom: 106px; }
  .game-seat--east { right: 12px; }
  .game-seat--west { left: 12px; }
}
</style>
