<script setup lang="ts">
interface RandomGameItem {
  id: string
  key: string
  nameKey?: string | null
  img?: string | null
}

const { ensureCatalogLoaded, catalogStore, entityRouteValue, tOrFallback } =
  useGamesCatalogNavigation()

const randomGames = useState<RandomGameItem[]>(
  'home-left-random-games-data',
  () => [],
)
const randomGamesLoaded = useState<boolean>(
  'home-left-random-games-loaded',
  () => false,
)
const pending = ref(false)

async function loadRandomGames() {
  if (pending.value || randomGamesLoaded.value) return

  pending.value = true

  try {
    randomGames.value = await $fetch<RandomGameItem[]>('/api/games/random', {
      query: { limit: 3 },
    })
    randomGamesLoaded.value = true
  } finally {
    pending.value = false
  }
}

onMounted(async () => {
  await Promise.all([ensureCatalogLoaded(), loadRandomGames()])
})

if (import.meta.client) {
  void loadRandomGames()
}

function resolveGameRoute(game: RandomGameItem) {
  for (const category of catalogStore.categories) {
    for (const subCategory of category.subCategories ?? []) {
      const found = subCategory.games?.find(
        (candidate) => candidate.id === game.id || candidate.key === game.key,
      )

      if (!found) continue

      return `/games/${entityRouteValue(category)}/${entityRouteValue(subCategory)}/${entityRouteValue(found)}`
    }
  }

  return null
}

async function playGame(game: RandomGameItem) {
  await ensureCatalogLoaded()
  const route = resolveGameRoute(game)

  if (route) {
    await navigateTo(route)
    return
  }

  await navigateTo('/games')
}
</script>

<template>
  <div>
    <v-chip color="primary" variant="outlined" class="mb-4" label>
      {{ tOrFallback('home.leftNav.randomGames', 'Random games') }}
    </v-chip>

    <v-skeleton-loader v-if="pending" type="list-item-two-line@3" />

    <v-list v-else density="compact" nav>
      <v-list-item
        v-for="game in randomGames"
        :key="game.id"
        class="random-game-item"
      >
        <template #prepend>
          <v-avatar rounded="lg" size="42">
            <v-img :src="game.img || '/img/game/classic-card.png'" cover />
          </v-avatar>
        </template>

        <v-list-item-title>
          {{ tOrFallback(game.nameKey || '', game.key) }}
        </v-list-item-title>

        <template #append>
          <v-btn
            size="small"
            color="primary"
            variant="tonal"
            @click.stop="playGame(game)"
          >
            {{ tOrFallback('gamePage.playButton', 'Play') }}
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>

<style scoped>
.random-game-item {
  border-radius: 12px;
  margin-bottom: 4px;
}
</style>
