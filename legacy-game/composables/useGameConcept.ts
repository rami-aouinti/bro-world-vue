import { computed, type Ref } from "vue";
import { fallbackConcept, gameConceptsBySlug, type GameConcept } from "~/data/game-concepts";
import type { GameEntry } from "~/types/game";

const normalizeGameSlug = (value?: string | null) =>
  value?.trim().toLowerCase().replace(/\s+/g, "-") ?? "";

export const resolveGameConcept = (
  game: Pick<GameEntry, "id" | "key"> | null | undefined,
): GameConcept => {
  const candidates = [normalizeGameSlug(game?.key), normalizeGameSlug(game?.id)].filter(Boolean);

  for (const candidate of candidates) {
    if (gameConceptsBySlug[candidate]) {
      return gameConceptsBySlug[candidate];
    }
  }

  return {
    ...fallbackConcept,
    slug: candidates[0] || fallbackConcept.slug,
  };
};

export const useGameConcept = (game: Ref<Pick<GameEntry, "id" | "key"> | null>) =>
  computed(() => resolveGameConcept(game.value));
