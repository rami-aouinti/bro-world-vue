<script setup lang="ts">
import { storeToRefs } from "pinia";
import { computed, onMounted, ref, watch } from "vue";
import BeloteGame from "~/components/games/BeloteGame.vue";
import CheckersGame from "~/components/games/CheckersGame.vue";
import ChessGame from "~/components/games/ChessGame.vue";
import RamiGame from "~/components/games/RamiGame.vue";
import PokerGame from "~/components/games/PokerGame.vue";
import SolitaireGame from "~/components/games/SolitaireGame.vue";
import HeartsGame from "~/components/games/HeartsGame.vue";
import SpadesGame from "~/components/games/SpadesGame.vue";
import NonogramGame from "~/components/games/NonogramGame.vue";
import HiddenWordGame from "~/components/games/HiddenWordGame.vue";
import SudokuGame from "~/components/games/SudokuGame.vue";
import Game2048 from "~/components/games/Game2048.vue";
import UnoGame from "~/components/games/UnoGame.vue";
import LudoGame from "~/components/games/LudoGame.vue";
import FlappyRocketGame from "~/components/games/FlappyRocketGame.vue";
import GameConceptPreview from "~/components/games/GameConceptPreview.vue";
import GameQuickAccessPanel from "~/components/games/lobby/GameQuickAccessPanel.vue";
import GameDetailsPanel from "~/components/games/lobby/GameDetailsPanel.vue";
import PlatformSplitLayout from "~/components/platform/PlatformSplitLayout.vue";
import { useGameConcept } from "~/composables/useGameConcept";
import { useGameMotionPresets } from "~/composables/games/useGameMotionPresets";
import {
  useGameSessionsApi,
  type GameLevel,
} from "~/composables/api/useGameSessionsApi";
import { useGameCatalogNavigation } from "~/composables/games/useGameCatalogNavigation";
import { useGameLaunchFlow } from "~/composables/games/useGameLaunchFlow";
import type {
  GameCategory,
  GameEntry,
  GameMood,
  GameVisualStyle,
  PlayMode,
} from "~/types/game";
import type { GameAsidePanelState } from "~/components/games/types";
import { useGameCatalogStore } from "~/stores/gameCatalog";
import { useGamesStore } from "~/stores/games";

const { t, te } = useI18n();
const { isAuthenticated, login } = useAuth();
const authSession = useAuthSessionStore();
const router = useRouter();
const gameSessionsApi = useGameSessionsApi();
const { context: motionContext, flowTransitions } = useGameMotionPresets();

definePageMeta({
  splitShell: false,
  gamingTheme: false,
});

const gameCatalogStore = useGameCatalogStore();
const gamesStore = useGamesStore();
const {
  categories: storeCategories,
  isLoading: isCatalogLoading,
  error: catalogError,
} = storeToRefs(gameCatalogStore);
const {
  featuredGames: featuredGamesItems,
  isLoading: isFeaturedGamesLoading,
} = storeToRefs(gamesStore);
const categories = computed<GameCategory[]>(() => storeCategories.value);


const isCoinsDialogOpen = ref(false);
const isPaymentSoonSnackbarOpen = ref(false);
const paymentSoonSnackbarText = ref("");
const userCoins = computed(() => authSession.profile?.coins ?? 0);
const usernameOrEmail = ref("");
const password = ref("");
const loginLoading = ref(false);
const loginError = ref("");
const liveGamePanel = ref<GameAsidePanelState | null>(null);
const coinOffers = [
  {
    id: "offer-1",
    coins: 1000,
    priceEuro: 1,
    labelKey: "gamePage.auth.offers.offer1Label",
  },
  {
    id: "offer-2",
    coins: 5000,
    priceEuro: 4,
    labelKey: "gamePage.auth.offers.offer2Label",
  },
  {
    id: "offer-3",
    coins: 100000,
    priceLabelKey: "gamePage.auth.offers.offer3PriceLabel",
    labelKey: "gamePage.auth.offers.offer3Label",
  },
] as const;
const ramiGameRef = ref<{
  handleAsideAction: (actionId: string) => void;
} | null>(null);
const beloteGameRef = ref<{
  handleAsideAction: (actionId: string) => void;
} | null>(null);
const checkersGameRef = ref<{
  handleAsideAction: (actionId: string) => void;
} | null>(null);
const chessGameRef = ref<{
  handleAsideAction: (actionId: string) => void;
} | null>(null);
const sudokuGameRef = ref<{
  handleAsideAction: (actionId: string) => void;
} | null>(null);
const nonogramGameRef = ref<{
  handleAsideAction: (actionId: string) => void;
} | null>(null);
const hiddenWordGameRef = ref<{
  handleAsideAction: (actionId: string) => void;
} | null>(null);
const game2048Ref = ref<{
  handleAsideAction: (actionId: string) => void;
} | null>(null);
const pokerGameRef = ref<{
  handleAsideAction: (actionId: string) => void;
} | null>(null);
const solitaireGameRef = ref<{
  handleAsideAction: (actionId: string) => void;
} | null>(null);
const heartsGameRef = ref<{
  handleAsideAction: (actionId: string) => void;
} | null>(null);
const spadesGameRef = ref<{
  handleAsideAction: (actionId: string) => void;
} | null>(null);
const unoGameRef = ref<{
  handleAsideAction: (actionId: string) => void;
} | null>(null);
const ludoGameRef = ref<{
  handleAsideAction: (actionId: string) => void;
} | null>(null);
const flappyRocketGameRef = ref<{
  handleAsideAction: (actionId: string) => void;
} | null>(null);
type AsideActionHandler = {
  handleAsideAction: (actionId: string) => void;
};
type RightPanelState = "quick-access" | "in-game-details";
const aiLevels: GameLevel[] = ["easy", "medium", "hard"];
const getGameBusinessKey = (game: GameEntry | null | undefined) =>
  game?.key ?? game?.id ?? null;
const {
  allGameEntries,
  localSupportedModes,
  selectedCategory,
  selectedSubCategory,
  selectedGame,
  selectedBeloteMode,
  selectedGameId,
  openCategory,
  openSubCategory,
  openGame,
  resetToCategories,
  backToSubCategories,
  backToGames,
  selectQuickAccessGame,
} = useGameCatalogNavigation(categories);
const selectedGameConcept = useGameConcept(selectedGame);
const {
  selectedPlayMode,
  selectedAiLevel,
  isGameStarted,
  isLoginDialogOpen,
  isLaunchingSession,
  canLaunchSelectedGame,
  selectPlayMode,
  selectAiLevel,
  selectBeloteMode,
  launchGame,
  isGameAvailableForLaunch,
} = useGameLaunchFlow({
  selectedGame,
  localSupportedModes,
  selectedBeloteMode,
  isAuthenticated,
  startGameSession: (...args) => gameSessionsApi.startGameSession(...args),
  updateProfileCoins: (coins) => {
    if (authSession.profile) {
      authSession.profile = {
        ...authSession.profile,
        coins,
      };
    }
  },
  router,
});
const displayedLocalModes = computed<PlayMode[]>(() =>
  getDisplayModes(localSupportedModes.value),
);
const featuredGames = computed<GameEntry[]>(() => {
  if (!featuredGamesItems.value.length) return [];

  const gameById = new Map(allGameEntries.value.map((game) => [game.id, game]));
  return featuredGamesItems.value
    .map((item) => gameById.get(item.id))
    .filter((game): game is GameEntry => Boolean(game));
});

const orderedModes: PlayMode[] = ["ai", "pvp"];
const getDisplayModes = (modes: PlayMode[]): PlayMode[] =>
  orderedModes.filter((mode) => modes.includes(mode));

const modeLabel = (mode: PlayMode) =>
  mode === "ai" ? t("gamePage.modes.vsComputer") : t("gamePage.modes.vsPlayer");

const modeImageMap: Record<PlayMode, string> = {
  ai: "/img/game/computer.png",
  pvp: "/img/game/player.png",
};

const levelImageMap: Record<GameLevel, string> = {
  easy: "/img/game/200.png",
  medium: "/img/game/400.png",
  hard: "/img/game/600.png",
};

const gameStatusLabel = computed(() => {
  if (!selectedGame.value) return t("gamePage.status.none");

  if (isGameStarted.value) {
    const moodLabel = selectedGame.value.mood ? moodLabelMap[selectedGame.value.mood] : "session";
    return `En ${moodLabel.toLowerCase()} · ${t("gamePage.status.inProgress")}`;
  }

  if (canLaunchSelectedGame.value) {
    return selectedGame.value.mood === "chill"
      ? "Ambiance détente prête"
      : t("gamePage.status.ready");
  }

  return selectedGame.value.mood === "competitive"
    ? "Préparation stratégique…"
    : t("gamePage.status.selecting");
});

const moodLabelMap: Record<GameMood, string> = {
  competitive: "Compétitif",
  chill: "Chill",
  arcade: "Arcade",
  strategy: "Stratégie",
};

const visualStyleLabelMap: Record<GameVisualStyle, string> = {
  neon: "Néon",
  classic: "Classique",
  minimal: "Minimal",
};

const moodColorMap: Record<GameMood, string> = {
  competitive: "deep-orange",
  chill: "teal",
  arcade: "pink",
  strategy: "indigo",
};

const visualStyleColorMap: Record<GameVisualStyle, string> = {
  neon: "cyan",
  classic: "amber",
  minimal: "blue-grey",
};

const gameMetaChips = computed(() => {
  if (!selectedGame.value) return [];

  const chips: Array<{ label: string; color: string; icon: string }> = [];
  if (selectedGame.value.mood) {
    chips.push({
      label: moodLabelMap[selectedGame.value.mood],
      color: moodColorMap[selectedGame.value.mood],
      icon: "mdi-lightning-bolt-outline",
    });
  }
  if (selectedGame.value.visualStyle) {
    chips.push({
      label: visualStyleLabelMap[selectedGame.value.visualStyle],
      color: visualStyleColorMap[selectedGame.value.visualStyle],
      icon: "mdi-palette-outline",
    });
  }
  if (selectedGame.value.soundProfile) {
    chips.push({
      label: selectedGame.value.soundProfile,
      color: "purple",
      icon: "mdi-music-note-outline",
    });
  }
  if (selectedGame.value.intensityLevel) {
    chips.push({
      label: `Intensité ${selectedGame.value.intensityLevel}`,
      color: "red",
      icon: "mdi-fire-circle",
    });
  }
  return chips;
});

const selectedGameSetupStyle = computed(() => {
  const game = selectedGame.value;
  if (!game) return null;
  const texture = game.lobbyBackground
    ? `url(${game.lobbyBackground})`
    : "radial-gradient(circle at top right, rgba(99,102,241,.20), transparent 50%)";

  return {
    backgroundImage: 'transparent',
  };
});

const rightPanelState = computed<RightPanelState>(() => {
  if (isGameStarted.value && selectedGame.value) {
    return "in-game-details";
  }

  return "quick-access";
});

const gameFlowStage = computed<
  "catalog" | "modeSelection" | "launchSession" | "inGame"
>(() => {
  if (isGameStarted.value && selectedGame.value) return "inGame";
  if (isLaunchingSession.value) return "launchSession";
  if (selectedGame.value) return "modeSelection";
  return "catalog";
});

const flowTransitionName = computed(() => flowTransitions[gameFlowStage.value]);
const mainContentTransitionKey = computed(() => {
  if (gameFlowStage.value === "catalog") {
    if (!selectedCategory.value) return "catalog-categories";
    if (!selectedSubCategory.value) return "catalog-sub-categories";
    if (!selectedGame.value) return "catalog-games";
  }
  if (gameFlowStage.value === "modeSelection" && selectedGame.value) {
    return `mode-selection-${selectedGame.value.id}-${selectedPlayMode.value ?? "none"}`;
  }
  if (gameFlowStage.value === "launchSession") {
    return `launch-session-${selectedGame.value?.id ?? "none"}`;
  }
  if (gameFlowStage.value === "inGame" && selectedGame.value) {
    return `in-game-${selectedGame.value.id}`;
  }
  return "catalog-empty";
});

const getLevelColor = (
  level: "category" | "subCategory" | "game" | "mode" | "info",
) => {
  if (level === "category") return "primary";
  if (level === "subCategory") return "secondary";
  if (level === "game") return "success";
  if (level === "mode") return "info";
  return "indigo";
};

const colorPalettesByTone: Record<
  "category" | "subCategory" | "game",
  [string, string, string]
> = {
  category: ["#5b8cff", "#40c4ff", "#7c4dff"],
  subCategory: ["#26a69a", "#42a5f5", "#7e57c2"],
  game: ["#ff7043", "#ffca28", "#ab47bc"],
};

const getCatalogImageStyle = (
  seed: string,
  tone: "category" | "subCategory" | "game",
) => {
  const palette = colorPalettesByTone[tone];
  const hash = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const angle = 110 + (hash % 120);
  const first = palette[hash % palette.length];
  const second = palette[(hash + 1) % palette.length];
  const third = palette[(hash + 2) % palette.length];

  return {
    background: `
      radial-gradient(circle at 18% 20%, ${first}55 0%, transparent 45%),
      radial-gradient(circle at 85% 15%, ${second}4d 0%, transparent 40%),
      linear-gradient(${angle}deg, ${third}40 0%, rgba(15, 23, 42, 0.12) 70%)
    `,
  };
};


const onGamePanelState = (payload: GameAsidePanelState) => {
  liveGamePanel.value = payload;
};

const onAsideAction = (actionId: string) => {
  const component = selectedGame.value?.component;
  if (!component) return;

  const asideHandlersByComponent: Record<
    NonNullable<GameEntry["component"]>,
    AsideActionHandler | null
  > = {
    rami: ramiGameRef.value,
    belote: beloteGameRef.value,
    checkers: checkersGameRef.value,
    chess: chessGameRef.value,
    sudoku: sudokuGameRef.value,
    nonogram: nonogramGameRef.value,
    "hidden-word": hiddenWordGameRef.value,
    game2048: game2048Ref.value,
    poker: pokerGameRef.value,
    solitaire: solitaireGameRef.value,
    hearts: heartsGameRef.value,
    spades: spadesGameRef.value,
    uno: unoGameRef.value,
    ludo: ludoGameRef.value,
    "flappy-rocket": flappyRocketGameRef.value,
  };

  asideHandlersByComponent[component]?.handleAsideAction(actionId);
};

const globalRestartAction = computed(() => {
  const actions = liveGamePanel.value?.actions ?? [];
  const primaryIds = new Set([
    "play-again",
    "new-round",
    "new-deal",
    "restart",
    "new-grid",
    "new-game",
    "next",
    "reset",
    "next-hand",
  ]);

  return actions.find((action) => primaryIds.has(action.id)) ?? null;
});

const fallbackValue = computed(() => "—");

const safeTranslate = (key?: string | null) => {
  if (!key) return fallbackValue.value;
  return te(key) ? t(key) : fallbackValue.value;
};

const selectedGameLevel = computed(() => {
  if (selectedGame.value?.difficultyKey) {
    return safeTranslate(selectedGame.value.difficultyKey);
  }

  const level = (selectedGame.value as (GameEntry & { level?: string | number }) | null)
    ?.level;
  return level ? String(level) : fallbackValue.value;
});

const gameDetailTags = computed(() => selectedGame.value?.tags?.filter(Boolean) ?? []);
const gameDetailFeatures = computed(
  () => selectedGame.value?.features?.filter(Boolean) ?? [],
);

const formatMetaChip = (value: string) => (te(value) ? t(value) : value);

onMounted(async () => {
  await Promise.all([
    gameCatalogStore.fetchCatalog(),
    gamesStore.fetchGames(),
  ]);
});

watch([selectedGameId, isGameStarted], () => {
  if (!isGameStarted.value) {
    liveGamePanel.value = null;
  }
});

const sidebarUserDisplayName = computed(() => {
  const firstName = authSession.profile?.firstName?.trim() ?? "";
  const lastName = authSession.profile?.lastName?.trim() ?? "";
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    fullName ||
    authSession.profile?.username ||
    t("gamePage.auth.defaultPlayerName")
  );
});

const formatCoinsAmount = (coins: number) =>
  new Intl.NumberFormat("fr-FR").format(coins);

const formattedUserCoins = computed(() => formatCoinsAmount(userCoins.value));

const formatOfferPrice = (offer: (typeof coinOffers)[number]) =>
  typeof offer.priceEuro === "number"
    ? `${offer.priceEuro} €`
    : t(offer.priceLabelKey ?? "gamePage.auth.offers.offer3PriceLabel");

const chooseCoinOffer = (offerId: string) => {
  isCoinsDialogOpen.value = false;
  paymentSoonSnackbarText.value = t("gamePage.auth.paymentSoon", { offerId });
  isPaymentSoonSnackbarOpen.value = true;

  // TODO(payment): brancher ici l'appel API réel (create checkout session / payment intent)
  // et gérer la mise à jour des coins utilisateur depuis la réponse backend.
};

const handleLogin = async () => {
  if (!usernameOrEmail.value.trim() || !password.value.trim()) {
    loginError.value = t("gamePage.auth.loginMissingCredentials");
    return;
  }

  loginLoading.value = true;
  loginError.value = "";

  try {
    await login(usernameOrEmail.value.trim(), password.value);
    isLoginDialogOpen.value = false;
    usernameOrEmail.value = "";
    password.value = "";
  } catch {
    loginError.value = t("gamePage.auth.loginFailed");
  } finally {
    loginLoading.value = false;
  }
};
</script>

<template>
  <teleport v-if="isGameStarted && globalRestartAction" to="#app-bar-teleport-target-right">
    <v-btn
        color="primary"
        variant="tonal"
        size="small"
        prepend-icon="mdi-refresh"
        :disabled="globalRestartAction.disabled"
        @click="onAsideAction(globalRestartAction.id)"
    >
      {{ globalRestartAction.label }}
    </v-btn>
  </teleport>
  <PlatformSplitLayout>
    <template #sidebar>
      <div class="mb-4">
        <v-chip variant="outlined" prepend-icon="mdi-gamepad" class="mb-2">{{
          t("gamePage.sidebar.badge")
        }}</v-chip>
      </div>
      <div class="mb-4">
        <v-btn
          v-if="!isAuthenticated"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-login"
          @click="isLoginDialogOpen = true"
        >
          {{ t("gamePage.auth.connect") }}
        </v-btn>
        <div v-else class="d-flex align-center ga-1">
          <UiAvatar
            :src="authSession.profile?.photo"
            :name="sidebarUserDisplayName"
            size="lg"
          />
          <div class="d-flex flex-column mx-3">
            <p class="text-body-2 font-weight-medium">
              {{ sidebarUserDisplayName }} -
              {{ t("gamePage.auth.coinsBalance", { count: formattedUserCoins }) }}
            </p>
            <v-btn
              variant="outlined"
              prepend-icon="mdi-cash-plus"
              @click="isCoinsDialogOpen = true"
            >
              {{ t("gamePage.auth.buyCoins") }}
            </v-btn>
          </div>
        </div>
      </div>
      <div class="d-flex flex-column ga-2 mb-4">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-home"
          @click="resetToCategories"
          >{{ t("gamePage.navigation.backToCategories") }}</v-btn
        >
        <v-btn
          v-if="selectedSubCategory"
          variant="outlined"
          prepend-icon="mdi-arrow-left"
          @click="backToSubCategories"
        >
          {{ t("gamePage.navigation.backToSubCategories") }}
        </v-btn>
        <v-btn
          v-if="selectedGame"
          variant="outlined"
          prepend-icon="mdi-arrow-left"
          @click="backToGames"
        >
          {{ t("gamePage.navigation.backToGames") }}
        </v-btn>
      </div>
      <div class="d-flex align-center flex-wrap ga-2 mb-0">
        <v-chip v-if="selectedPlayMode">{{
          selectedPlayMode ? modeLabel(selectedPlayMode) : "—"
        }}</v-chip>
        <v-chip v-if="gameStatusLabel && selectedCategory">{{ gameStatusLabel }}</v-chip>
        <v-chip
          v-if="selectedCategory"
          prepend-icon="mdi-folder-open-outline"
          :color="getLevelColor('category')"
          >{{ t(selectedCategory.nameKey) }}</v-chip
        >
        <v-chip
          v-if="selectedSubCategory"
          prepend-icon="mdi-shape-outline"
          :color="getLevelColor('subCategory')"
          >{{ t(selectedSubCategory.nameKey) }}</v-chip
        >
        <v-chip
          v-if="selectedGame"
          prepend-icon="mdi-play-circle-outline"
          :color="getLevelColor('game')"
          >{{ t(selectedGame.nameKey) }}</v-chip
        >
        <v-chip
          v-for="(metaChip, index) in gameMetaChips"
          :key="`selected-game-chip-${index}`"
          :color="metaChip.color"
          variant="tonal"
          :prepend-icon="metaChip.icon"
        >
          {{ metaChip.label }}
        </v-chip>
      </div>

      <v-dialog v-model="isLoginDialogOpen" max-width="520">
        <v-card>
          <v-card-title>{{ t("gamePage.auth.loginModalTitle") }}</v-card-title>
          <v-card-text class="d-flex flex-column ga-3">
            <v-text-field
              v-model="usernameOrEmail"
              :label="t('gamePage.auth.loginEmailOrUsername')"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model="password"
              :label="t('gamePage.auth.loginPassword')"
              type="password"
              variant="outlined"
              density="comfortable"
            />
            <v-alert
              v-if="loginError"
              type="error"
              variant="tonal"
              density="compact"
            >
              {{ loginError }}
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" :loading="loginLoading" @click="handleLogin">
              {{ t("gamePage.auth.loginSubmit") }}
            </v-btn>
            <v-btn variant="text" to="/login">{{
              t("gamePage.auth.goToLoginPage")
            }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isCoinsDialogOpen" max-width="760">
        <v-card>
          <v-card-title>{{
            t("gamePage.auth.buyCoinsModalTitle")
          }}</v-card-title>
          <v-card-text class="pt-2">
            <v-row>
              <v-col
                v-for="offer in coinOffers"
                :key="offer.id"
                cols="12"
                md="4"
              >
                <v-card variant="outlined" class="h-100 d-flex flex-column">
                  <v-card-title class="text-h6">
                    {{
                      t(offer.labelKey, {
                        count: formatCoinsAmount(offer.coins),
                      })
                    }}
                  </v-card-title>
                  <v-card-subtitle class="text-body-1">
                    {{ formatOfferPrice(offer) }}
                  </v-card-subtitle>
                  <v-card-actions class="mt-auto">
                    <v-btn
                      color="primary"
                      variant="flat"
                      block
                      @click="chooseCoinOffer(offer.id)"
                    >
                      {{ t("gamePage.auth.chooseOffer") }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              variant="text"
              @click="isCoinsDialogOpen = false"
              >{{ t("gamePage.auth.closeModal") }}</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-snackbar
        v-model="isPaymentSoonSnackbarOpen"
        timeout="2400"
        color="info"
        location="bottom right"
      >
        {{ paymentSoonSnackbarText }}
      </v-snackbar>
    </template>
    <template #aside>
      <Transition :name="flowTransitionName" mode="out-in">
        <div :key="`aside-${rightPanelState}-${selectedGameId ?? 'none'}`">
          <GameQuickAccessPanel
            v-if="rightPanelState === 'quick-access'"
            :featured-games="featuredGames"
            :is-loading="isFeaturedGamesLoading"
            :selected-game-id="selectedGameId"
            :selected-play-mode="selectedPlayMode"
            :mode-label="modeLabel"
            :title="te('gamePage.quickAccess.title') ? t('gamePage.quickAccess.title') : 'Quick Access'"
            :empty-text="t('gamePage.status.none')"
            :game-name-label="(game) => t(game.nameKey)"
            @select-game="selectQuickAccessGame"
            @select-mode="selectPlayMode"
          />
          <GameDetailsPanel
            v-else-if="selectedGame"
            :selected-game="selectedGame"
            :selected-game-concept="selectedGameConcept"
            :safe-translate="safeTranslate"
            :selected-game-level="selectedGameLevel"
            :game-detail-tags="gameDetailTags"
            :game-detail-features="gameDetailFeatures"
            :format-meta-chip="formatMetaChip"
          />
        </div>
      </Transition>
    </template>
    <template #default>
      <Transition :name="flowTransitionName" mode="out-in">
        <div :key="mainContentTransitionKey">
      <section v-if="isCatalogLoading">
        <v-row>
          <v-col v-for="index in 4" :key="`catalog-skeleton-${index}`" cols="12" md="6">
            <v-skeleton-loader type="heading, image" class="h-100" />
          </v-col>
        </v-row>
      </section>

      <section v-else-if="catalogError">
        <v-alert type="error" variant="tonal" class="mb-4">
          {{ catalogError }}
        </v-alert>
        <v-btn color="primary" variant="outlined" @click="gameCatalogStore.fetchCatalog(true)">
          {{ t("common.retry") }}
        </v-btn>
      </section>

      <section v-else-if="!categories.length">
        <v-alert type="info" variant="tonal">
          {{ t("gamePage.status.none") }}
        </v-alert>
      </section>

      <section v-else-if="!selectedCategory">
        <v-row>
          <v-col v-for="category in categories" :key="category.id" cols="12" md="4">
            <v-card
                v-motion
                :initial="motionContext.catalogCard.initial"
                :enter="motionContext.catalogCard.enter"
                :hovered="motionContext.catalogCard.hovered"
                :tapped="motionContext.catalogCard.tapped"
                class="h-100 card-category-game"
                variant="text"
            >
              <v-card-subtitle class="text-center">{{ t(category?.nameKey) }}</v-card-subtitle>
              <div class="w-100 pa-3">
                <div
                    v-motion
                    :initial="motionContext.catalogMedia.initial"
                    :enter="motionContext.catalogMedia.enter"
                    :hovered="motionContext.catalogMedia.hovered"
                    :tapped="motionContext.catalogMedia.tapped"
                    class="catalog-image"
                    @click="openCategory(category.id)"
                    :style="getCatalogImageStyle(category.id, 'category')"
                >
                  <v-img :src="category.img" alt="Card" />
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section
        v-else-if="selectedCategory && !selectedSubCategory"
        class="mb-4"
      >
        <v-row class="ga-0 ga-md-1">
          <v-col
            v-for="subCategory in selectedCategory.subCategories"
            :key="subCategory.id"
            cols="12"
            md="6"
          >
            <v-card
                v-motion
                :initial="motionContext.catalogCard.initial"
                :enter="motionContext.catalogCard.enter"
                :hovered="motionContext.catalogCard.hovered"
                :tapped="motionContext.catalogCard.tapped"
                class="h-100 card-category-game"
                variant="text"
            >
              <v-card-title class="text-center">{{ t(subCategory?.nameKey) }}</v-card-title>
              <div class="w-100 pa-3">
                <div
                    @click="openSubCategory(subCategory.id)"
                    v-motion
                    :initial="motionContext.catalogMedia.initial"
                    :enter="motionContext.catalogMedia.enter"
                    :hovered="motionContext.catalogMedia.hovered"
                    :tapped="motionContext.catalogMedia.tapped"
                    class="catalog-image"
                    :style="getCatalogImageStyle(subCategory.id, 'subCategory')"
                >
                  <v-img :src="subCategory.img" alt="Card" />
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section v-else-if="selectedSubCategory && !selectedGame" class="mb-4">
        <v-row class="ga-0 ga-md-1">
          <v-col
            v-for="game in selectedSubCategory.games"
            :key="game.id"
            cols="12"
            md="4"
          >
            <v-card
                v-motion
                :initial="motionContext.catalogCard.initial"
                :enter="motionContext.catalogCard.enter"
                :hovered="motionContext.catalogCard.hovered"
                :tapped="motionContext.catalogCard.tapped"
                class="h-100 card-category-game"
                variant="text"
            >
              <v-card-subtitle class="text-center">{{ t(game?.nameKey) }}</v-card-subtitle>
              <div class="w-100 pa-3">
                <div
                    @click="openGame(game.id)"
                    :disabled="!isGameAvailableForLaunch(game)"
                    v-motion
                    :initial="motionContext.catalogMedia.initial"
                    :enter="motionContext.catalogMedia.enter"
                    :hovered="motionContext.catalogMedia.hovered"
                    :tapped="motionContext.catalogMedia.tapped"
                    class="catalog-image"
                    :style="getCatalogImageStyle(game.id, 'game')"
                >
                  <v-img :src="game.img" alt="Card" />
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </section>

      <section
        v-else-if="selectedGame && !isGameStarted && selectedGame.developmentStatus !== 'playable'"
        class="mb-1 setup-section"
        :style="selectedGameSetupStyle"
      >
        <GameConceptPreview
          :title="selectedGameConcept.title"
          :core-loop="selectedGameConcept.coreLoop"
          :rules-summary="selectedGameConcept.rulesSummary"
          :ux-mock-sections="selectedGameConcept.uxMockSections"
          :planned-modes="selectedGameConcept.plannedModes"
          :monetization-notes="selectedGameConcept.monetizationNotes"
          :milestones="selectedGameConcept.milestones"
        />
      </section>

      <section
        v-else-if="selectedGame && !isGameStarted"
        class="mb-1 setup-section"
        :style="selectedGameSetupStyle"
      >
        <v-row class="mb-4" dense>
          <v-col
            v-for="mode in displayedLocalModes"
            :key="`mode-selection-${mode}`"
            :cols="displayedLocalModes.length > 1 ? 6 : 12"
          >
            <v-card
                v-motion
                :initial="motionContext.modeCard.initial"
                :enter="motionContext.modeCard.enter"
                :hovered="motionContext.modeCard.hovered"
                :tapped="motionContext.modeCard.tapped"
                class="mode-card d-flex align-center justify-center"
                :class="{ 'mode-card--active': selectedPlayMode === mode }"
                :variant="selectedPlayMode === mode ? 'flat' : 'outlined'"
                :color="
                  selectedPlayMode === mode
                    ? mode === 'ai'
                      ? 'primary'
                      : getLevelColor('subCategory')
                    : undefined
                "
                @click="selectPlayMode(mode)"
            >
              <v-card-text
                  class="d-flex align-center justify-center"
              >
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
              @click="selectBeloteMode('teams')"
          >
            {{ t("gamePage.labels.beloteTeams") }}
          </v-btn>
          <v-btn
              color="deep-purple"
              :variant="
                selectedBeloteMode === 'free-for-all' ? 'flat' : 'outlined'
              "
              @click="selectBeloteMode('free-for-all')"
          >
            {{ t("gamePage.labels.beloteFreeForAll") }}
          </v-btn>
        </div>

        <v-row
          v-if="!isLaunchingSession"
          class="mb-4"
          dense
        >
          <v-col
            v-for="level in aiLevels"
            :key="`ai-level-${level}`"
            cols="12"
            md="4"
          >
            <v-card
              v-motion
              :initial="motionContext.modeCard.initial"
              :enter="motionContext.modeCard.enter"
              :hovered="motionContext.modeCard.hovered"
              :tapped="motionContext.modeCard.tapped"
              class="mode-card d-flex align-center justify-center"
              :class="{ 'mode-card--active': selectedAiLevel === level }"
              :variant="selectedAiLevel === level ? 'flat' : 'outlined'"
              :color="selectedAiLevel === level ? 'primary' : undefined"
              @click="selectAiLevel(level)"
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
            v-if="
              !isGameAvailableForLaunch(selectedGame)
            "
            type="info"
            variant="tonal"
            class="mb-4"
        >
          {{ t("gamePage.status.soonHint") }}
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
            {{
              selectedGame?.mood === "competitive"
                ? "Briefing tactique en cours…"
                : selectedGame?.mood === "chill"
                  ? "Mise en place d'une session détente…"
                  : "Préparation de votre session…"
            }}
          </p>
        </div>

        <div v-else class="d-flex justify-center mt-auto pt-6">
          <v-btn
            :color="getLevelColor('game')"
            :disabled="!canLaunchSelectedGame"
            size="large"
            @click="launchGame"
          >
            {{ t("gamePage.actions.launchGame") }}
          </v-btn>
        </div>
      </section>

      <section
        v-else-if="selectedGame && selectedPlayMode && isGameStarted"
        v-motion
        :initial="motionContext.inGamePanel.initial"
        :enter="motionContext.inGamePanel.enter"
      >
        <RamiGame
          ref="ramiGameRef"
          v-if="selectedGame.component === 'rami'"
          :selected-play-mode="selectedPlayMode"
          @panel-state="onGamePanelState"
        />
        <BeloteGame
          ref="beloteGameRef"
          v-else-if="selectedGame.component === 'belote'"
          :selected-play-mode="selectedPlayMode"
          :belote-mode="selectedBeloteMode ?? 'teams'"
          @panel-state="onGamePanelState"
        />
        <CheckersGame
          ref="checkersGameRef"
          v-else-if="selectedGame.component === 'checkers'"
          :selected-play-mode="selectedPlayMode"
          @panel-state="onGamePanelState"
        />
        <PokerGame
          ref="pokerGameRef"
          v-else-if="selectedGame.component === 'poker'"
          :selected-play-mode="selectedPlayMode"
          @panel-state="onGamePanelState"
        />
        <SolitaireGame
          ref="solitaireGameRef"
          v-else-if="selectedGame.component === 'solitaire'"
          :selected-play-mode="selectedPlayMode"
          @panel-state="onGamePanelState"
        />
        <HeartsGame
          ref="heartsGameRef"
          v-else-if="selectedGame.component === 'hearts'"
          :selected-play-mode="selectedPlayMode"
          @panel-state="onGamePanelState"
        />
        <SpadesGame
          ref="spadesGameRef"
          v-else-if="selectedGame.component === 'spades'"
          :selected-play-mode="selectedPlayMode"
          @panel-state="onGamePanelState"
        />
        <NonogramGame
          ref="nonogramGameRef"
          v-else-if="selectedGame.component === 'nonogram'"
          :selected-play-mode="selectedPlayMode"
          @panel-state="onGamePanelState"
        />
        <HiddenWordGame
          ref="hiddenWordGameRef"
          v-else-if="selectedGame.component === 'hidden-word'"
          :selected-play-mode="selectedPlayMode"
          @panel-state="onGamePanelState"
        />
        <ChessGame
          ref="chessGameRef"
          v-else-if="selectedGame.component === 'chess'"
          :selected-play-mode="selectedPlayMode"
          @panel-state="onGamePanelState"
        />
        <SudokuGame
          ref="sudokuGameRef"
          v-else-if="selectedGame.component === 'sudoku'"
          :selected-play-mode="selectedPlayMode"
          @panel-state="onGamePanelState"
        />
        <Game2048
          ref="game2048Ref"
          v-else-if="selectedGame.component === 'game2048'"
          :selected-play-mode="selectedPlayMode"
          @panel-state="onGamePanelState"
        />
        <UnoGame
          ref="unoGameRef"
          v-else-if="selectedGame.component === 'uno'"
          :selected-play-mode="selectedPlayMode"
          @panel-state="onGamePanelState"
        />
        <LudoGame
          ref="ludoGameRef"
          v-else-if="selectedGame.component === 'ludo'"
          :selected-play-mode="selectedPlayMode"
          @panel-state="onGamePanelState"
        />
        <FlappyRocketGame
          ref="flappyRocketGameRef"
          v-else-if="selectedGame.component === 'flappy-rocket'"
          :selected-play-mode="selectedPlayMode"
          @panel-state="onGamePanelState"
        />
      </section>
        </div>
      </Transition>
    </template>
  </PlatformSplitLayout>
</template>

<style scoped>

.card-category-game {
  padding: 10px;
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-category-game:hover {
  transform: translateY(-10px) scale(1.03);
}
@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


.unified-shell,
.unified-card {
  border-radius: 18px;
  border: 1px solid var(--game-lobby-surface-border, color-mix(in srgb, rgb(var(--v-theme-primary)) 20%, transparent));
  background: var(--game-lobby-surface-bg, linear-gradient(160deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0)));
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
}

.interactive-card {
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
}

.interactive-card:hover {
  transform: translateY(var(--game-lobby-hover-lift, -2px));
  box-shadow: var(--game-lobby-hover-shadow, 0 14px 28px rgba(15, 23, 42, 0.12));
}

.interactive-card:focus-within {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 3px
    color-mix(in srgb, rgb(var(--v-theme-primary)) 30%, transparent);
}

.page-title {
  font-family: var(--game-lobby-title-font, inherit);
  font-size: clamp(1.6rem, 1.2rem + 1vw, 2.1rem);
  line-height: 1.2;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.section-title {
  font-family: var(--game-lobby-title-font, inherit);
  font-size: clamp(1.1rem, 1rem + 0.4vw, 1.35rem);
  line-height: 1.3;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.section-subtitle {
  font-size: 0.95rem;
  color: rgba(var(--v-theme-on-surface), 0.76);
}

.card-title {
  font-size: 1.05rem;
  line-height: 1.3;
  font-weight: 700;
}

.catalog-image {
  cursor: pointer;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-primary)) 24%, transparent);
}

.catalog-image::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(155deg, rgba(255, 255, 255, 0.16) 0%, transparent 54%),
    linear-gradient(0deg, rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.12));
}

.catalog-image__overlay {
  position: relative;
  z-index: 1;
  min-height: 118px;
  padding: 0.75rem 0.95rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.95);
}

.catalog-image__label {
  font-size: 0.88rem;
  line-height: 1.35;
  text-shadow: 0 2px 10px rgba(15, 23, 42, 0.25);
}

.info-list {
  margin: 0;
  padding-left: 1rem;
  display: grid;
  gap: 0.35rem;
}

.setup-section {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background-size: cover;
  background-position: center;
  padding: 1rem;
}

.mode-card {
  cursor: pointer;
  max-height: 250px;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
}

.mode-card:hover {
  transform: translateY(var(--game-lobby-hover-lift, -2px));
  box-shadow: var(--game-lobby-hover-shadow, 0 14px 28px rgba(15, 23, 42, 0.12));
}

.mode-card--active {
  box-shadow: 0 12px 20px rgba(15, 23, 42, 0.18);
}

.selection-card-image {
  width: min(240px, 90%);
  min-height: 56px;
}

.launch-loader {
  min-height: 230px;
  border: 1px solid color-mix(in srgb, rgb(var(--v-theme-primary)) 28%, transparent);
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

.game-flow-catalog-enter-active,
.game-flow-mode-selection-enter-active,
.game-flow-launch-session-enter-active,
.game-flow-in-game-enter-active,
.game-flow-catalog-leave-active,
.game-flow-mode-selection-leave-active,
.game-flow-launch-session-leave-active,
.game-flow-in-game-leave-active {
  transition: opacity 300ms ease, transform 300ms ease, filter 300ms ease;
}

.game-flow-catalog-enter-from,
.game-flow-mode-selection-enter-from,
.game-flow-launch-session-enter-from,
.game-flow-in-game-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.985);
  filter: blur(2px);
}

.game-flow-catalog-leave-to,
.game-flow-mode-selection-leave-to,
.game-flow-launch-session-leave-to,
.game-flow-in-game-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.99);
}

.game-flow-mode-selection-enter-active {
  transition-duration: 340ms;
}

.game-flow-launch-session-enter-from {
  transform: translateY(26px) scale(0.98);
}

.game-flow-in-game-enter-active {
  transition-duration: 360ms;
}

.game-flow-in-game-enter-from {
  transform: translateY(12px) scale(0.995);
}

@media (max-width: 959px) {
  .unified-shell,
  .unified-card {
    border-radius: 14px;
  }
}
</style>
