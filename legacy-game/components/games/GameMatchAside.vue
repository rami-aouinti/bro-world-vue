<script setup lang="ts">
import type { PropType } from "vue";
import type {
  BeloteMode,
  GameCategory,
  GameDevelopmentStatus,
  GameEntry,
  GameMood,
  GameVisualStyle,
  GameSubCategory,
  PlayMode,
} from "~/types/game";
import type { GameAsidePanelChip, GameAsidePanelState } from "./types";

type PanelLevel = "category" | "subCategory" | "game" | "mode" | "info";

interface GamePanelState {
  gameStatusLabel: string;
  canLaunchSelectedGame: boolean;
  selectedBeloteMode: BeloteMode | null;
  modeLabel: (mode: PlayMode) => string;
  getLevelColor: (level: PanelLevel) => string;
  resetToCategories: () => void;
}

defineProps({
  selectedCategory: {
    type: Object as PropType<GameCategory | null>,
    default: null,
  },
  selectedSubCategory: {
    type: Object as PropType<GameSubCategory | null>,
    default: null,
  },
  selectedGame: {
    type: Object as PropType<GameEntry | null>,
    default: null,
  },
  selectedPlayMode: {
    type: String as PropType<PlayMode | null>,
    default: null,
  },
  isGameStarted: {
    type: Boolean,
    required: true,
  },
  gamePanelState: {
    type: Object as PropType<GamePanelState>,
    required: true,
  },
  liveGamePanel: {
    type: Object as PropType<GameAsidePanelState | null>,
    default: null,
  },
});

const emit = defineEmits<{
  (event: "action", actionId: string): void;
}>();

const { t } = useI18n();

type ComingSoonStep = "conception" | "prototype" | "alpha" | "release";

const comingSoonTimeline: Array<{ id: ComingSoonStep; labelKey: string }> = [
  { id: "conception", labelKey: "gamePage.comingSoon.timeline.conception" },
  { id: "prototype", labelKey: "gamePage.comingSoon.timeline.prototype" },
  { id: "alpha", labelKey: "gamePage.comingSoon.timeline.alpha" },
  { id: "release", labelKey: "gamePage.comingSoon.timeline.release" },
];

const comingSoonStepByStatus: Record<GameDevelopmentStatus, ComingSoonStep> = {
  playable: "release",
  prototype: "prototype",
  coming_soon: "conception",
};

const resolveComingSoonStep = (
  developmentStatus: GameDevelopmentStatus | null | undefined,
): ComingSoonStep => {
  if (!developmentStatus) return "conception";
  return comingSoonStepByStatus[developmentStatus] ?? "conception";
};

const isTimelineStepDone = (
  stepId: ComingSoonStep,
  developmentStatus: GameDevelopmentStatus | null | undefined,
) =>
  comingSoonTimeline.findIndex((step) => step.id === stepId) <
  comingSoonTimeline.findIndex(
    (step) => step.id === resolveComingSoonStep(developmentStatus),
  );

const isTimelineStepCurrent = (
  stepId: ComingSoonStep,
  developmentStatus: GameDevelopmentStatus | null | undefined,
) => stepId === resolveComingSoonStep(developmentStatus);

const comingSoonActionLabel = (
  developmentStatus: GameDevelopmentStatus | null | undefined,
) =>
  developmentStatus === "prototype"
    ? t("gamePage.comingSoon.actions.follow")
    : t("gamePage.comingSoon.actions.notify");

const comingSoonActionId = (
  developmentStatus: GameDevelopmentStatus | null | undefined,
) => (developmentStatus === "prototype" ? "follow-game" : "notify-game");

const comingSoonCurrentStateLabel = (
  developmentStatus: GameDevelopmentStatus | null | undefined,
) =>
  developmentStatus === "prototype"
    ? t("gamePage.comingSoon.states.prototype")
    : t("gamePage.comingSoon.states.conception");

const liveHintByGameId: Record<string, string> = {
  belote: "Belote · suivi des plis, score d'équipe, contrat actif",
  rami: "Rami · score des manches, cartes posées, état de la pioche",
  poker: "Poker · pot courant, phase de jeu, joueur actif",
  checkers: "Dames · tour en cours, pièces restantes, captures possibles",
  chess: "Échecs · joueur au trait, état d'échec, historique des coups",
  sudoku: "Sudoku · erreurs, timer, progression de la grille",
  "game-2048": "2048 · score live, meilleure tuile, prochain objectif",
  "hidden-word": "Mot caché · essais restants, indice actif, série en cours",
  nonogram: "Nonogramme · progression ligne/colonne, erreurs, timer",
  ludo: "Ludo · tour actif, dé courant, pions encore à rentrer",
};

const moodLabelMap: Record<GameMood, string> = {
  competitive: "Compétitif",
  chill: "Chill",
  arcade: "Arcade",
  strategy: "Stratégie",
};

const moodColorMap: Record<GameMood, string> = {
  competitive: "deep-orange",
  chill: "teal",
  arcade: "pink",
  strategy: "indigo",
};

const visualLabelMap: Record<GameVisualStyle, string> = {
  neon: "Néon",
  classic: "Classique",
  minimal: "Minimal",
};

const visualColorMap: Record<GameVisualStyle, string> = {
  neon: "cyan",
  classic: "amber",
  minimal: "blue-grey",
};

const getAsideSurfaceStyle = (game: GameEntry | null) => {
  if (!game) return undefined;
  const texture = game.lobbyBackground ? `url(${game.lobbyBackground})` : "none";
  const overlayByStyle: Record<GameVisualStyle, string> = {
    neon: "linear-gradient(140deg, rgba(6,182,212,.12), rgba(168,85,247,.12))",
    classic: "linear-gradient(140deg, rgba(120,53,15,.12), rgba(251,191,36,.12))",
    minimal: "linear-gradient(140deg, rgba(15,23,42,.03), rgba(15,23,42,.08))",
  };
  const visualStyle = game.visualStyle ?? "minimal";

  return {
    backgroundImage: `${overlayByStyle[visualStyle]}, ${texture}`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "12px",
    padding: "0.75rem",
  };
};

const getStatusToneLabel = (game: GameEntry | null | undefined, started: boolean) => {
  if (!game) return t("gamePage.status.none");
  if (started) {
    if (game.mood === "competitive") return "Clutch en cours · restez concentré";
    if (game.mood === "chill") return "Flow détente en cours";
    return "Partie active";
  }
  if (game.mood === "strategy") return "Analysez votre prochain coup";
  if (game.mood === "arcade") return "Prêt pour une montée d'adrénaline";
  return "Session en préparation";
};

const isScoreKpi = (chip: GameAsidePanelChip) =>
  chip.id.toLowerCase().includes("score");

const orderedLivePanelKpis = (kpis: GameAsidePanelChip[]) => [
  ...kpis.filter((chip) => isScoreKpi(chip)),
  ...kpis.filter((chip) => !isScoreKpi(chip)),
];

const cleanGameLabelPrefix = (value: string, gameLabel: string) => {
  if (!value) return "";
  if (!gameLabel) return value.trim();
  const normalizedValue = value.trim();
  const normalizedLabel = gameLabel.trim();
  if (!normalizedLabel) return normalizedValue;

  const labelEscaped = normalizedLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prefixMatcher = new RegExp(`^${labelEscaped}\\s*[·:—-]\\s*`, "i");
  if (prefixMatcher.test(normalizedValue)) {
    return normalizedValue.replace(prefixMatcher, "").trim();
  }
  if (normalizedValue.toLowerCase() === normalizedLabel.toLowerCase()) return "";
  return normalizedValue;
};

const sanitizedLiveHighlights = (liveGamePanel: GameAsidePanelState) =>
  liveGamePanel.highlights
    .map((line) => cleanGameLabelPrefix(line, liveGamePanel.title))
    .filter((line) => Boolean(line));

const sanitizedLiveStatus = (liveGamePanel: GameAsidePanelState) =>
  cleanGameLabelPrefix(liveGamePanel.status, liveGamePanel.title);
</script>

<template>
  <v-chip
    variant="outlined"
    class="mb-4 title-chip"
    prepend-icon="mdi-information-outline"
  >
    {{ t("gamePage.info.title") }}
  </v-chip>
  <v-alert v-if="!selectedGame" type="info" variant="tonal" class="mb-0">
    <div class="d-flex flex-column ga-3">
      <span>{{ t("gamePage.sidebar.description") }}</span>
      <v-btn
          variant="outlined"
          size="small"
          prepend-icon="mdi-home"
          @click="gamePanelState.resetToCategories()"
      >
        {{ t("gamePage.navigation.backToCategories") }}
      </v-btn>
    </div>
  </v-alert>

  <div
    v-else-if="
      !isGameStarted &&
      selectedGame.developmentStatus !== 'playable'
    "
    class="d-flex flex-column ga-3"
    :style="getAsideSurfaceStyle(selectedGame)"
  >
    <v-chip color="warning" variant="tonal" prepend-icon="mdi-progress-clock">
      {{ t("gamePage.comingSoon.title") }}
    </v-chip>
    <p class="text-body-2 mb-0">
      {{ t("gamePage.comingSoon.description") }}
    </p>
    <v-chip color="info" variant="outlined">
      {{ t("gamePage.comingSoon.currentState") }}:
      {{ comingSoonCurrentStateLabel(selectedGame.developmentStatus) }}
    </v-chip>
    <div class="d-flex flex-wrap ga-2">
      <v-chip
        v-for="step in comingSoonTimeline"
        :key="`coming-soon-step-${step.id}`"
        :color="
          isTimelineStepCurrent(step.id, selectedGame.developmentStatus)
            ? 'primary'
            : isTimelineStepDone(step.id, selectedGame.developmentStatus)
              ? 'success'
              : undefined
        "
        :variant="
          isTimelineStepCurrent(step.id, selectedGame.developmentStatus)
            ? 'flat'
            : isTimelineStepDone(step.id, selectedGame.developmentStatus)
              ? 'tonal'
              : 'outlined'
        "
        size="small"
      >
        {{ t(step.labelKey) }}
      </v-chip>
    </div>
    <v-btn
      size="small"
      color="primary"
      variant="outlined"
      prepend-icon="mdi-bell-ring-outline"
      @click="emit('action', comingSoonActionId(selectedGame.developmentStatus))"
    >
      {{ comingSoonActionLabel(selectedGame.developmentStatus) }}
    </v-btn>
  </div>

  <div v-else-if="!isGameStarted" class="d-flex flex-column ga-3">
    <div class="d-flex flex-wrap ga-2">
      <v-chip
        v-if="selectedGame.mood"
        :color="moodColorMap[selectedGame.mood]"
        variant="tonal"
        prepend-icon="mdi-lightning-bolt-outline"
      >
        {{ moodLabelMap[selectedGame.mood] }}
      </v-chip>
      <v-chip
        v-if="selectedGame.visualStyle"
        :color="visualColorMap[selectedGame.visualStyle]"
        variant="tonal"
        prepend-icon="mdi-palette-outline"
      >
        {{ visualLabelMap[selectedGame.visualStyle] }}
      </v-chip>
      <v-chip
        v-if="selectedGame.intensityLevel"
        color="red"
        variant="outlined"
        prepend-icon="mdi-fire"
      >
        Intensité {{ selectedGame.intensityLevel }}
      </v-chip>
    </div>
    <v-chip variant="outlined" :color="gamePanelState.getLevelColor('mode')">
      {{
        selectedPlayMode
            ? gamePanelState.modeLabel(selectedPlayMode)
            : "Mode non sélectionné"
      }}
    </v-chip>
    <v-chip
        :color="gamePanelState.canLaunchSelectedGame ? 'success' : 'warning'"
        variant="tonal"
    >
      {{
        gamePanelState.canLaunchSelectedGame
            ? "Prêt à lancer"
            : "Configurer les options"
      }}
    </v-chip>
    <p
        v-if="selectedGame.difficultyKey"
        class="text-caption text-medium-emphasis mb-0"
    >
      {{ t(selectedGame.difficultyKey) }}
    </p>
    <p
        v-if="selectedGame.id === 'belote'"
        class="text-caption text-medium-emphasis mb-0"
    >
      Variante:
      {{
        gamePanelState.selectedBeloteMode === "free-for-all"
            ? "free-for-all"
            : "2v2"
      }}
    </p>
    <p class="text-caption text-medium-emphasis mb-0">
      {{ getStatusToneLabel(selectedGame, false) }}
    </p>
  </div>

  <div
    v-else-if="liveGamePanel"
    class="d-flex flex-column ga-3"
    :style="getAsideSurfaceStyle(selectedGame)"
  >
    <v-chip color="warning" variant="tonal" prepend-icon="mdi-timer-sand">
      Match en cours
    </v-chip>
    <div v-if="liveGamePanel.kpis.length" class="d-flex flex-wrap ga-2">
      <v-chip
          v-for="chip in orderedLivePanelKpis(liveGamePanel.kpis)"
          :key="`panel-chip-${chip.id}`"
          :color="chip.color"
          :variant="chip.variant ?? 'outlined'"
          :prepend-icon="chip.icon"
      >
        {{ chip.label }}: {{ chip.value }}
      </v-chip>
    </div>
    <p class="text-body-2 mb-0">
      {{ liveGamePanel.phase }} · {{ liveGamePanel.turnLabel }}
    </p>
    <p
        v-for="(line, lineIndex) in sanitizedLiveHighlights(liveGamePanel)"
        :key="`panel-summary-${lineIndex}`"
        class="text-body-2 mb-0"
    >
      {{ line }}
    </p>
    <p v-if="sanitizedLiveStatus(liveGamePanel)" class="text-caption text-medium-emphasis mb-0">
      {{ sanitizedLiveStatus(liveGamePanel) }}
    </p>

  </div>

  <div v-else class="d-flex flex-column ga-3" :style="getAsideSurfaceStyle(selectedGame)">
    <v-chip color="warning" variant="tonal" prepend-icon="mdi-timer-sand">
      Match en cours
    </v-chip>
    <p class="text-body-2 mb-0">
      {{
        liveHintByGameId[selectedGame.id] ??
        getStatusToneLabel(selectedGame, true)
      }}
    </p>
    <div v-if="selectedGame.tags?.length" class="d-flex flex-wrap ga-1">
      <v-chip
          v-for="tag in selectedGame.tags"
          :key="`aside-live-${selectedGame.id}-${tag}`"
          size="x-small"
          variant="outlined"
      >
        {{ t(tag) }}
      </v-chip>
    </div>
  </div>
</template>
