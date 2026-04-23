<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { GameAsidePanelState } from "~/components/games/types";
import { useSolitaireEngine } from "~/composables/games/engines/useSolitaireEngine";
import GameTableScaffold from "~/components/games/GameTableScaffold.vue";
import DeckStack from "~/components/games/cards/DeckStack.vue";
import PlayingCard from "~/components/games/cards/PlayingCard.vue";

const props = defineProps<{
  selectedPlayMode: "ai" | "pvp";
}>();

const emit = defineEmits<{
  (event: "panel-state", payload: GameAsidePanelState): void;
  (event: "finished", payload: { result: "win" | "lose" }): void;
}>();

const engine = useSolitaireEngine();

const suggestedMove = computed(() => engine.suggestBestMove());
const topWasteCard = computed(() => engine.waste.value.at(-1) ?? null);
const suitFoundationIndex: Record<string, number> = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };

const findCardById = (cardId?: string | null) => {
  if (!cardId) return null;
  const wasteCard = engine.waste.value.find((card) => card.id === cardId);
  if (wasteCard) return wasteCard;

  for (const pile of engine.tableau.value) {
    const card = pile.find((item) => item.id === cardId);
    if (card) return card;
  }

  return null;
};

const suggestedCardId = computed(() => suggestedMove.value?.cardId ?? null);
const suggestedFoundationIndex = computed(() => {
  const move = suggestedMove.value;
  if (!move || !["waste-to-foundation", "tableau-to-foundation"].includes(move.type)) return null;
  const card = findCardById(move.cardId);
  if (!card) return null;
  return suitFoundationIndex[card.suit] ?? null;
});

const cardFeedback = (cardId: string) => (suggestedCardId.value === cardId ? "combo" : "idle");

const foundationSummaries = computed(() =>
  engine.foundations.value.map((pile, index) => ({
    id: `foundation-${index}`,
    index,
    label: `Fondation ${index + 1}`,
    count: pile.length,
    topCard: pile.at(-1) ?? null,
  })),
);

const secondaryKpis = computed(() => [
  { id: "stock", label: "Pioche", value: engine.stock.value.length },
  { id: "waste", label: "Défausse", value: engine.waste.value.length },
  {
    id: "revealed",
    label: "Cartes visibles",
    value: engine.tableau.value.reduce((sum, pile) => sum + pile.filter((card) => card.faceUp).length, 0),
  },
  {
    id: "foundations",
    label: "Fondations",
    value: foundationSummaries.value.reduce((sum, pile) => sum + pile.count, 0),
  },
]);

const finishedEmitted = ref(false);

watch(() => engine.isWon.value, (isWon) => {
  if (!isWon || finishedEmitted.value) return;
  finishedEmitted.value = true;
  emit("finished", { result: "win" });
});

watch(() => engine.moveCount.value, () => {
  if (!engine.isWon.value) {
    finishedEmitted.value = false;
  }
});

const panelState = computed<GameAsidePanelState>(() => ({
  title: "Solitaire",
  subtitle: `Mode ${props.selectedPlayMode === "ai" ? "solo" : "duel local"}`,
  kpis: [
    { id: "solitaire-moves", label: "Coups", value: engine.moveCount.value },
    { id: "solitaire-score", label: "Score", value: engine.score.value },
  ],
  actions: [
    { id: "restart", label: "Nouvelle partie", icon: "mdi-refresh" },
    { id: "undo", label: "Annuler", icon: "mdi-undo" },
    { id: "hint", label: "Suggestion", icon: "mdi-lightbulb-on" },
  ],
}));

const applySuggestedMove = () => {
  if (!suggestedMove.value) return;
  engine.applyMove(suggestedMove.value);
};

const autoPlayAi = () => {
  if (props.selectedPlayMode !== "ai") return;
  if (!suggestedMove.value) return;
  engine.applyMove(suggestedMove.value);
};

const handleAsideAction = (actionId: string) => {
  if (actionId === "restart") {
    engine.startNewGame();
    return;
  }

  if (actionId === "undo") {
    engine.undo();
    return;
  }

  if (actionId === "hint") {
    applySuggestedMove();
  }
};

watch(panelState, (value) => emit("panel-state", value), { immediate: true });

defineExpose({
  handleAsideAction,
});
</script>

<template>
  <GameTableScaffold surface-variant="flat" table-class="solitaire-table">
    <template #surface>
      <section class="solitaire-surface">
        <header class="solitaire-header">
          <v-chip v-if="engine.isWon.value" color="success" size="small">Victoire</v-chip>
        </header>

        <div class="solitaire-top-row">
          <DeckStack
            :remaining="engine.stock.value.length"
            :can-draw="engine.stock.value.length > 0 || engine.waste.value.length > 0"
            :top-discard="topWasteCard"
            @draw="engine.draw"
          />

          <div class="solitaire-foundations" aria-label="Fondations">
            <article
              v-for="foundation in foundationSummaries"
              :key="foundation.id"
              class="foundation-slot"
            >
              <TransitionGroup
                v-if="foundation.topCard"
                name="solitaire-stack"
                tag="div"
                class="foundation-slot__cards"
              >
                <PlayingCard
                  :key="foundation.topCard.id"
                  :rank="foundation.topCard.rank"
                  :suit="foundation.topCard.suit"
                  :playable="false"
                  :selected="suggestedCardId === foundation.topCard.id"
                  :highlighted="suggestedFoundationIndex === foundation.index"
                  :feedback="suggestedFoundationIndex === foundation.index ? 'won' : cardFeedback(foundation.topCard.id)"
                />
              </TransitionGroup>
              <div v-else class="foundation-slot__empty">A</div>
              <p class="foundation-slot__label mb-0">{{ foundation.label }}</p>
            </article>
          </div>
        </div>

        <div class="solitaire-tableau" aria-label="Tableau">
          <article
            v-for="(pile, pileIndex) in engine.tableau.value"
            :key="`tableau-${pileIndex}`"
            class="tableau-column"
          >
            <p class="tableau-column__label">Col {{ pileIndex + 1 }}</p>
            <TransitionGroup name="solitaire-stack" tag="div" class="tableau-column__cards">
              <PlayingCard
                v-for="(card, cardIndex) in pile"
                :key="card.id"
                :rank="card.rank"
                :suit="card.suit"
                :face-down="!card.faceUp"
                :playable="card.faceUp"
                :selected="suggestedCardId === card.id"
                :highlighted="suggestedCardId === card.id"
                :feedback="cardFeedback(card.id)"
                :style="{ marginTop: cardIndex === 0 ? '0' : '-56px' }"
              />
            </TransitionGroup>
            <div v-if="pile.length === 0" class="tableau-column__empty">K</div>
          </article>
        </div>

        <div class="solitaire-kpis">
          <article
            v-for="kpi in secondaryKpis"
            :key="kpi.id"
            class="solitaire-kpi"
          >
            <span class="solitaire-kpi__label">{{ kpi.label }}</span>
            <strong class="solitaire-kpi__value">{{ kpi.value }}</strong>
          </article>
        </div>

        <div class="d-flex ga-2 flex-wrap">
          <v-btn color="primary" variant="tonal" @click="engine.draw">Piocher</v-btn>
          <v-btn variant="tonal" :disabled="!suggestedMove" @click="applySuggestedMove">Jouer suggestion</v-btn>
          <v-btn variant="tonal" @click="engine.autoCompleteFoundations">Auto fondations</v-btn>
          <v-btn variant="text" @click="engine.undo">Undo</v-btn>
          <v-btn v-if="selectedPlayMode === 'ai'" variant="text" @click="autoPlayAi">IA joue</v-btn>
        </div>

        <p class="text-body-2 mb-0">{{ engine.message.value }}</p>
      </section>
    </template>
  </GameTableScaffold>
</template>

<style scoped>
.solitaire-table {
  min-height: auto;
}

.solitaire-surface {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.solitaire-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.solitaire-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.solitaire-foundations {
  display: grid;
  grid-template-columns: repeat(4, minmax(84px, 1fr));
  gap: 10px;
  width: min(100%, 420px);
}

.foundation-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 12px;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.32);
  background: rgba(var(--v-theme-surface), 0.75);
}

.foundation-slot__cards {
  min-height: var(--card-h);
  display: grid;
  place-items: center;
}

.foundation-slot__empty {
  width: 60px;
  height: 88px;
  border-radius: 10px;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.25);
  display: grid;
  place-items: center;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.foundation-slot__label {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.75);
}

.solitaire-tableau {
  display: grid;
  grid-template-columns: repeat(7, minmax(76px, 1fr));
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.tableau-column {
  min-height: 230px;
  border-radius: 12px;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.2);
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tableau-column__label {
  font-size: 0.7rem;
  margin-bottom: 6px;
  opacity: 0.7;
}

.tableau-column__cards {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2px;
}

.solitaire-stack-enter-active,
.solitaire-stack-leave-active,
.solitaire-stack-move {
  transition: transform 200ms ease, opacity 200ms ease;
}

.solitaire-stack-enter-from,
.solitaire-stack-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.tableau-column__empty {
  margin-top: 12px;
  width: 56px;
  height: 82px;
  border-radius: 10px;
  border: 1px dashed rgba(var(--v-theme-on-surface), 0.25);
  display: grid;
  place-items: center;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.solitaire-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
}

.solitaire-kpi {
  border-radius: 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  padding: 8px 10px;
  background: rgba(var(--v-theme-surface), 0.8);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.solitaire-kpi__label {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.solitaire-kpi__value {
  font-size: 1rem;
}
</style>
