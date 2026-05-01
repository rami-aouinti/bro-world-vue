<script setup lang="ts">
interface RandomGameItem {
  id: string
  key: string
  nameKey?: string | null
  img?: string | null
}

interface RandomProductItem {
  id: string
  name: string
  photo?: string | null
}

interface RandomProductsResponse {
  data?: RandomProductItem[]
}

const { t } = useI18n()

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
const gamesPending = ref(false)

const randomProducts = ref<RandomProductItem[]>([])
const productsPending = ref(false)
const productsError = ref<string | null>(null)

async function loadRandomGames() {
  if (gamesPending.value || randomGamesLoaded.value) return

  gamesPending.value = true

  try {
    randomGames.value = await $fetch<RandomGameItem[]>('/api/games/random', {
      query: { limit: 2 },
    })
    randomGamesLoaded.value = true
  } finally {
    gamesPending.value = false
  }
}

async function loadRandomProducts() {
  if (productsPending.value) return

  productsPending.value = true
  productsError.value = null

  try {
    const response = await $fetch<RandomProductsResponse>(
      '/api/world/shop/products/random',
      {
        query: { limit: 2 },
      },
    )

    randomProducts.value = response.data ?? []
  } catch {
    randomProducts.value = []
    productsError.value = t('home.leftNav.states.productsError')
  } finally {
    productsPending.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    ensureCatalogLoaded(),
    loadRandomGames(),
    loadRandomProducts(),
  ])
})

if (import.meta.client) {
  void loadRandomGames()
  void loadRandomProducts()
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

async function openProduct(product: RandomProductItem) {
  await navigateTo(`/world/shop/products/${product.id}`)
}
</script>

<template>
  <div>
    <v-chip color="primary" variant="outlined" class="mb-4" label>
      {{ t('home.leftNav.games') }}
    </v-chip>

    <v-skeleton-loader v-if="gamesPending" type="list-item-two-line@2" />

    <v-list
      v-else-if="randomGames.length > 0"
      density="compact"
      nav
      class="random-list"
    >
      <v-list-item
        v-for="game in randomGames"
        :key="game.id"
        class="random-item"
      >
        <template #prepend>
          <v-avatar rounded="lg" size="42">
            <v-img :src="game.img || '/img/game/200.png'" cover width="42" height="42" loading="lazy" />
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
            {{ t('gamePage.playButton') }}
          </v-btn>
        </template>
      </v-list-item>
    </v-list>

    <v-alert v-else type="info" variant="tonal" density="compact" class="mb-4">
      {{ t('home.leftNav.states.emptyGames') }}
    </v-alert>

    <v-chip color="primary" variant="outlined" class="mb-4 mt-4" label>
      {{ t('home.leftNav.products') }}
    </v-chip>

    <v-skeleton-loader v-if="productsPending" type="list-item-two-line@2" />

    <v-list
      v-else-if="randomProducts.length > 0"
      density="compact"
      nav
      class="random-list"
    >
      <v-list-item
        v-for="product in randomProducts"
        :key="product.id"
        class="random-item"
      >
        <template #prepend>
          <v-avatar rounded="lg" size="42">
            <v-img
              :src="
                product.photo ||
                '/images/platform-media/shop-premium-hoodie.svg'
              "
              cover
              width="42"
              height="42"
              loading="lazy"
            />
          </v-avatar>
        </template>

        <v-list-item-title>
          {{ product.name }}
        </v-list-item-title>

        <template #append>
          <v-btn
            size="small"
            color="primary"
            variant="tonal"
            @click.stop="openProduct(product)"
          >
            {{ t('home.leftNav.actions.open') }}
          </v-btn>
        </template>
      </v-list-item>
    </v-list>

    <v-alert
      v-else-if="productsError"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      {{ productsError }}
    </v-alert>

    <v-alert v-else type="info" variant="tonal" density="compact" class="mb-4">
      {{ t('home.leftNav.states.emptyProducts') }}
    </v-alert>
  </div>
</template>

<style scoped>
.random-list {
  background: transparent;
  padding: 0;
}

.random-item {
  border-radius: 12px;
  margin-bottom: 8px;
  background: transparent;
}
</style>
