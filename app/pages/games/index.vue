<script setup lang="ts">
definePageMeta({
  title: 'appbar.games',
  description:
    'Play multiplayer games on Bro World: card, strategy, party games, and online sessions with friends.',
})

const { catalogStore, ensureCatalogLoaded, entityRouteValue, tOrFallback } =
  useGamesCatalogNavigation()

onMounted(async () => {
  await ensureCatalogLoaded()
})

function openCategory(category: { id: string; key?: string }) {
  navigateTo(`/games/${entityRouteValue(category)}`)
}

const categories = computed(() =>
  Array.isArray(catalogStore.categories) ? catalogStore.categories : [],
)
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <GamesDrawersRightPanel />
      </template>
      <template #left>
        <GamesDrawersLeftPanel />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <v-card variant="text" class="content-main postcard-gradient-card mb-3 pa-3">
        <div class="text-h2 text-center mb-2">
          <h3>Games</h3>
        </div>
        <v-skeleton-loader
          v-if="catalogStore.loadingCatalog"
          type="image, article, image, article"
        />
        <v-row v-else-if="categories.length" density="compact">
          <v-col
            v-for="category in categories"
            :key="category.id"
            cols="12"
            sm="6"
            lg="4"
          >
            <v-hover v-slot="{ props }">
              <v-card
                v-bind="props"
                class="game-category-card overflow-hidden postcard-gradient-card"
                variant="text"
                @click="openCategory(category)"
              >
                <v-img :src="category?.img" height="200" cover />
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
        <v-alert
          v-else
          type="info"
          variant="tonal"
          :text="
          tOrFallback(
            'gamePage.catalog.emptyCategories',
            'No categories available for now.',
          )
        "
        />
      </v-card>
    </v-container>
  </div>
</template>

<style scoped>
.game-category-card {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.game-category-card:hover {
  transform: translateY(-4px);
}
</style>
