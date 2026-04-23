<script setup lang="ts">
import { computed } from "vue";
import GameTableScaffold from "./GameTableScaffold.vue";
const { t } = useI18n();

interface TablePlayer {
  id: string;
  name: string;
  avatar?: string;
  isAI: boolean;
  isCurrentTurn: boolean;
  timerSeconds?: number;
}

interface Props {
  players: TablePlayer[];
  centerCards?: string[];
  centerMelds?: string[][];
  meldsByPlayer?: Partial<Record<"player" | "aiTop" | "aiRight" | "aiLeft", string[][]>>;
  turnTimerSeconds?: number;
  tableTheme?: "default" | "uno" | "belote" | "poker";
}

const props = withDefaults(defineProps<Props>(), {
  centerCards: () => [],
  centerMelds: () => [],
  meldsByPlayer: () => ({}),
  turnTimerSeconds: 120,
  tableTheme: "default",
});

const seatPositions = computed(() => {
  if (props.players.length >= 6) {
    return ["north", "north-east", "south-east", "south", "south-west", "north-west"] as const;
  }

  return ["north", "east", "south", "west"] as const;
});

const playersWithSeats = computed(() =>
  props.players.slice(0, seatPositions.value.length).map((player, index) => ({
    ...player,
    seat: seatPositions.value[index],
  })),
);

const meldsBySeat = computed(() =>
  playersWithSeats.value.reduce<Record<string, string[][]>>((accumulator, player) => {
    accumulator[player.seat] = props.meldsByPlayer[player.id as keyof typeof props.meldsByPlayer] ?? [];
    return accumulator;
  }, {}),
);

const hasCenterContent = computed(() => props.centerCards.length > 0 || props.centerMelds.length > 0);

const parseCardDisplay = (card: string) => {
  const trimmedCard = card.trim();
  const suit = trimmedCard.slice(-1);
  const rank = trimmedCard.slice(0, -1);
  return { rank, suit };
};

const isRedSuit = (suit: string) => suit === "♥" || suit === "♦";
</script>

<template>
  <GameTableScaffold :players="players" :turn-timer-seconds="turnTimerSeconds" :table-theme="tableTheme">
    <template #surface>
      <section
        v-for="player in playersWithSeats"
        :key="`${player.id}-melds`"
        class="seat-melds"
        :class="`seat-melds--${player.seat}`"
      >
        <div
          v-for="(meld, meldIndex) in meldsBySeat[player.seat] ?? []"
          :key="`${player.id}-meld-${meldIndex}`"
          class="seat-melds__group"
          :class="{
            'seat-melds__group--side': player.seat === 'east' || player.seat === 'west',
            'seat-melds__group--east': player.seat === 'east',
            'seat-melds__group--west': player.seat === 'west',
          }"
        >
          <span
            v-for="(cardParts, cardIndex) in meld.map(parseCardDisplay)"
            :key="`${player.id}-meld-${meldIndex}-card-${cardIndex}`"
            class="meld-card"
            :class="{
              'meld-card--side': player.seat === 'east' || player.seat === 'west',
              'meld-card--red': isRedSuit(cardParts.suit),
              'meld-card--black': !isRedSuit(cardParts.suit),
            }"
          >
            <span class="meld-card__corner">{{ cardParts.rank }}{{ cardParts.suit }}</span>
            <span class="meld-card__center">{{ cardParts.suit }}</span>
            <span class="meld-card__corner meld-card__corner--bottom">{{ cardParts.rank }}{{ cardParts.suit }}</span>
          </span>
        </div>
      </section>

      <slot name="center">
        <div v-if="hasCenterContent" class="center-fallback">
          <div v-if="centerCards.length" class="center-fallback__row">
            <span v-for="(card, index) in centerCards" :key="`center-card-${index}`" class="center-fallback__card">{{ card }}</span>
          </div>
          <div v-if="centerMelds.length" class="center-fallback__column">
            <div v-for="(meld, meldIndex) in centerMelds" :key="`center-meld-${meldIndex}`" class="center-fallback__row">
              <span v-for="(card, cardIndex) in meld" :key="`center-meld-${meldIndex}-${cardIndex}`" class="center-fallback__card">{{ card }}</span>
            </div>
          </div>
        </div>
        <p v-else class="text-caption mb-0 text-medium-emphasis">{{ t("gameComponents.cardTable.emptyTable") }}</p>
      </slot>
    </template>

    <template #player-hands>
      <div class="table-seat-hand table-seat-hand--north"><slot name="seat-north-hand" /></div>
      <div class="table-seat-hand table-seat-hand--east"><slot name="seat-east-hand" /></div>
      <div class="table-seat-hand table-seat-hand--south"><slot name="seat-south-hand" /></div>
      <div class="table-seat-hand table-seat-hand--west"><slot name="seat-west-hand" /></div>
    </template>

    <slot />

    <template #aside>
      <slot name="aside" />
    </template>
  </GameTableScaffold>
</template>

<style scoped>
.seat-melds { position: absolute; z-index: 2; display: flex; flex-direction: column; gap: 4px; width: min(230px, 100%); padding: 10px; overflow-y: auto; }
.seat-melds--north { top: -130px; left: 50%; transform: translateX(-50%); align-items: center; }
.seat-melds--south { bottom: -90px; left: 50%; transform: translateX(-50%); align-items: center; }
.seat-melds--east { right: -180px; }
.seat-melds--west { left: -100px; }
.seat-melds__group { display: flex; flex-wrap: wrap; gap: 4px; }
.seat-melds__group--side { flex-direction: row; flex-wrap: nowrap; gap: 4px; justify-content: flex-start; width: 100%; }
.seat-melds__group--east .meld-card--side,
.seat-melds__group--west .meld-card--side { transform: none; }
.meld-card { display: inline-flex; flex-direction: column; justify-content: space-between; align-items: flex-start; width: 22px; min-height: 20px; border-radius: 6px; border: 1px solid rgba(15, 23, 42, 0.15); padding: 3px 4px; background: linear-gradient(160deg, #fff, #f6f7fb); box-shadow: 0 4px 10px rgba(15, 23, 42, 0.18); line-height: 0.8; }
:global(body.theme-gaming) .meld-card {
  border-color: rgba(0, 229, 255, 0.34);
  background: linear-gradient(165deg, #e8edff, #cbd9ff);
  box-shadow: 0 0 0 1px rgba(124, 77, 255, 0.18), 0 4px 14px rgba(9, 14, 32, 0.46);
}
.meld-card--side { width: 22px; min-height: 20px; padding: 3px 4px; }
.meld-card--red { color: #dc2626; }
.meld-card--black { color: #111827; }
.table-theme--uno .meld-card { border-color: rgba(146, 64, 14, 0.45); background: linear-gradient(165deg, #fff8dc, #fef3c7); }
.table-theme--belote .meld-card { border-color: rgba(30, 64, 175, 0.32); background: linear-gradient(165deg, #eff6ff, #dbeafe); }
.table-theme--poker .meld-card { border-color: rgba(127, 29, 29, 0.34); background: linear-gradient(165deg, #fff1f2, #ffe4e6); }
.meld-card__corner { font-size: 0.5rem; font-weight: 700; letter-spacing: 0.01em; }
.meld-card__corner--bottom { align-self: flex-end; transform: rotate(180deg); }
.meld-card__center { align-self: center; font-size: 0.9rem; }
.table-seat-hand { position: absolute; z-index: 1; width: min(520px, calc(100% - 36px)); }
.table-seat-hand--north { top: 96px; left: 50%; transform: translateX(-50%); }
.table-seat-hand--south { bottom: 30px; left: 50%; transform: translateX(-50%); }
.table-seat-hand--east { top: 50%; right: 86px; width: min(100px, 20%); transform: translateY(-50%); }
.table-seat-hand--west { top: 50%; left: 86px; width: min(100px, 20%); transform: translateY(-50%); }
.center-fallback, .center-fallback__column { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.center-fallback__row { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; }
.center-fallback__card { padding: 4px 8px; border-radius: 8px; background: rgba(255, 255, 255, 0.9); color: #1f2937; font-weight: 700; }
.table-theme--uno .center-fallback__card { background: #fff8dc; color: #78350f; border: 1px solid rgba(146, 64, 14, 0.25); }
.table-theme--belote .center-fallback__card { background: #eff6ff; color: #1e3a8a; border: 1px solid rgba(30, 64, 175, 0.3); }
.table-theme--poker .center-fallback__card { background: #fff1f2; color: #7f1d1d; border: 1px solid rgba(127, 29, 29, 0.28); }
:global(body.theme-gaming) .center-fallback__card {
  background: rgba(11, 16, 34, 0.88);
  color: #dbe9ff;
  border: 1px solid rgba(0, 229, 255, 0.28);
}

@media (max-width: 960px) {
  .table-seat-hand--north { top: 108px; width: min(460px, calc(100% - 32px)); }
  .table-seat-hand--south { bottom: 152px; width: min(460px, calc(100% - 32px)); }
  .table-seat-hand--east, .table-seat-hand--west { top: auto; bottom: 20px; transform: none; width: calc(50% - 24px); }
  .table-seat-hand--east { right: 12px; }
  .table-seat-hand--west { left: 12px; }
  .seat-melds--south { bottom: 130px; }
  .seat-melds--east { right: 12px; width: calc(50% - 24px); top: auto; bottom: 184px; transform: none; }
  .seat-melds--west { left: 12px; width: calc(50% - 24px); top: auto; bottom: 184px; transform: none; }
}

@media (max-width: 600px) {
  .table-seat-hand--north { top: 104px; width: calc(100% - 24px); }
  .table-seat-hand--south { bottom: 236px; width: calc(100% - 24px); }
  .table-seat-hand--east, .table-seat-hand--west { bottom: 12px; width: calc(50% - 18px); }
  .seat-melds { width: calc(100% - 132px); max-height: 68px; }
  .seat-melds--north { top: 75px; }
  .seat-melds--south { bottom: 210px; }
  .seat-melds--east { left: auto; right: 12px; width: calc(50% - 18px); bottom: 170px; }
  .seat-melds--west { left: 12px; width: calc(50% - 18px); bottom: 170px; }
}
</style>
