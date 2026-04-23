import { defineStore } from "pinia";
import { useGamesApi, type ApiGameListItem } from "~/composables/api/useGamesApi";

const pickStableRandomGames = (items: ApiGameListItem[], count: number) => {
  if (items.length <= count) return [...items];

  const pool = [...items];
  const selected: ApiGameListItem[] = [];

  while (selected.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    selected.push(pool[index]);
    pool.splice(index, 1);
  }

  return selected;
};

export const useGamesStore = defineStore("games", () => {
  const gamesApi = useGamesApi();

  const items = ref<ApiGameListItem[]>([]);
  const featuredGames = ref<ApiGameListItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchGames = async (force = false) => {
    if (items.value.length > 0 && !force) {
      return items.value;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await gamesApi.getGames();
      const apiItems = Array.isArray(response) ? response : (response.items ?? []);
      const activeItems = apiItems.filter((item) => item.status === "ACTIVE");

      items.value = activeItems;
      featuredGames.value = pickStableRandomGames(activeItems, 4);
      return items.value;
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : "Unable to load games.";
      items.value = [];
      featuredGames.value = [];
      return items.value;
    }
    finally {
      isLoading.value = false;
    }
  };

  return {
    items,
    featuredGames,
    isLoading,
    error,
    fetchGames,
  };
});
