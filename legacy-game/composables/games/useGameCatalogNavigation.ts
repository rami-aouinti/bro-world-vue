import { computed, ref, watch, type ComputedRef } from "vue";
import type { BeloteMode, GameCategory, GameEntry, PlayMode } from "~/types/game";

const getGameBusinessKey = (game: GameEntry | null | undefined) =>
  game?.key ?? game?.id ?? null;

export const useGameCatalogNavigation = (categories: ComputedRef<GameCategory[]>) => {
  const selectedCategoryId = ref<string | null>(null);
  const selectedSubCategoryId = ref<string | null>(null);
  const selectedGameId = ref<string | null>(null);
  const selectedBeloteMode = ref<BeloteMode | null>(null);

  const allGameEntries = computed(() =>
    categories.value.flatMap((category) =>
      category.subCategories.flatMap((subCategory) => subCategory.games),
    ),
  );

  const selectedCategory = computed(
    () =>
      categories.value.find((category) => category.id === selectedCategoryId.value) ??
      null,
  );
  const selectedSubCategory = computed(
    () =>
      selectedCategory.value?.subCategories.find(
        (sub) => sub.id === selectedSubCategoryId.value,
      ) ?? null,
  );
  const selectedGame = computed(
    () =>
      selectedSubCategory.value?.games.find(
        (game) => game.id === selectedGameId.value,
      ) ?? allGameEntries.value.find((game) => game.id === selectedGameId.value) ?? null,
  );

  const localSupportedModes = computed<PlayMode[]>(() =>
    selectedGame.value?.availableModes ?? selectedGame.value?.supportedModes ?? [],
  );

  const resetToCategories = () => {
    selectedCategoryId.value = null;
    selectedSubCategoryId.value = null;
    selectedGameId.value = null;
    selectedBeloteMode.value = null;
  };

  const backToSubCategories = () => {
    selectedSubCategoryId.value = null;
    selectedGameId.value = null;
    selectedBeloteMode.value = null;
  };

  const backToGames = () => {
    selectedGameId.value = null;
    selectedBeloteMode.value = null;
  };

  const openCategory = (categoryId: string) => {
    selectedCategoryId.value = categoryId;
    selectedSubCategoryId.value = null;
    selectedGameId.value = null;
    selectedBeloteMode.value = null;
  };

  const openSubCategory = (subCategoryId: string) => {
    selectedSubCategoryId.value = subCategoryId;
    selectedGameId.value = null;
    selectedBeloteMode.value = null;
  };

  const openGame = (gameId: string) => {
    selectedGameId.value = gameId;
    const nextGame = allGameEntries.value.find((entry) => entry.id === gameId);
    selectedBeloteMode.value =
      getGameBusinessKey(nextGame) === "belote" ? "teams" : null;
  };

  const selectQuickAccessGame = (game: GameEntry) => {
    const gameLocation = categories.value
      .flatMap((category) =>
        category.subCategories.map((subCategory) => ({
          categoryId: category.id,
          subCategoryId: subCategory.id,
          gameIds: subCategory.games.map((entry) => entry.id),
        })),
      )
      .find((entry) => entry.gameIds.includes(game.id));

    selectedCategoryId.value = gameLocation?.categoryId ?? null;
    selectedSubCategoryId.value = gameLocation?.subCategoryId ?? null;
    selectedGameId.value = game.id;
    selectedBeloteMode.value =
      getGameBusinessKey(game) === "belote" ? "teams" : null;
  };

  watch(
    categories,
    (nextCategories) => {
      if (!nextCategories.length) {
        resetToCategories();
        return;
      }

      const hasSelectedCategory = nextCategories.some(
        (category) => category.id === selectedCategoryId.value,
      );

      if (!hasSelectedCategory) {
        resetToCategories();
        return;
      }

      const nextSelectedCategory = nextCategories.find(
        (category) => category.id === selectedCategoryId.value,
      );

      if (!nextSelectedCategory) {
        resetToCategories();
        return;
      }

      if (!selectedSubCategoryId.value) {
        if (
          selectedGameId.value &&
          !allGameEntries.value.some((game) => game.id === selectedGameId.value)
        ) {
          selectedGameId.value = null;
          selectedBeloteMode.value = null;
        }
        return;
      }

      const hasSelectedSubCategory = nextSelectedCategory.subCategories.some(
        (subCategory) => subCategory.id === selectedSubCategoryId.value,
      );

      if (!hasSelectedSubCategory) {
        selectedSubCategoryId.value = null;
        selectedGameId.value = null;
        selectedBeloteMode.value = null;
        return;
      }

      const nextSelectedSubCategory = nextSelectedCategory.subCategories.find(
        (subCategory) => subCategory.id === selectedSubCategoryId.value,
      );

      if (!nextSelectedSubCategory) {
        selectedGameId.value = null;
        selectedBeloteMode.value = null;
        return;
      }

      const hasSelectedGame = nextSelectedSubCategory.games.some(
        (game) => game.id === selectedGameId.value,
      );

      if (!hasSelectedGame) {
        selectedGameId.value = null;
        selectedBeloteMode.value = null;
      }
    },
    { immediate: true },
  );

  return {
    allGameEntries,
    localSupportedModes,
    selectedCategory,
    selectedSubCategory,
    selectedGame,
    selectedBeloteMode,
    selectedCategoryId,
    selectedSubCategoryId,
    selectedGameId,
    openCategory,
    openSubCategory,
    openGame,
    resetToCategories,
    backToSubCategories,
    backToGames,
    selectQuickAccessGame,
  };
};
