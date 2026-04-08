<script setup lang="ts">
definePageMeta({
  title: 'appbar.games',
})

const route = useRoute()
const categoryParam = computed(() => String(route.params.categoryKey || ''))
const subCategoryParam = computed(() => String(route.params.subCategoryKey || ''))

const {
  ensureCatalogLoaded,
  getCategoryByRouteParam,
  getSubCategoryByRouteParam,
  entityRouteValue,
  entityName,
  tOrFallback,
} = useGamesCatalogNavigation()

const selectedCategory = computed(() => getCategoryByRouteParam(categoryParam.value))
const selectedSubCategory = computed(() => getSubCategoryByRouteParam(categoryParam.value, subCategoryParam.value))
const games = computed(() => selectedSubCategory.value?.games ?? [])

onMounted(async () => {
  const loaded = await ensureCatalogLoaded()
  if (!loaded)
    return

  if (!selectedCategory.value || !selectedSubCategory.value) {
    await navigateTo('/games')
  }
})

function openGameLevels(game: { id: string; key?: string }) {
  navigateTo(`/games/${categoryParam.value}/${subCategoryParam.value}/${entityRouteValue(game)}`)
}

const breadcrumbs = computed(() => [
  { title: 'Games', to: '/games' },
  { title: selectedCategory.value?.key || selectedCategory.value?.name || 'Category', to: `/games/${categoryParam.value}` },
  { title: selectedSubCategory.value?.key || selectedSubCategory.value?.name || 'Subcategory', disabled: true },
])
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <v-list nav density="compact" class="app-right-drawer-list">
          <v-list-item>
            <template #prepend>
              <v-icon icon="mdi-shape-outline" />
            </template>
            <v-list-item-title>{{ tOrFallback('gamePage.selection.category', 'Category') }}</v-list-item-title>
            <v-list-item-subtitle>{{ entityName(selectedCategory || {}) || '—' }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <template #prepend>
              <v-icon icon="mdi-shape-plus-outline" />
            </template>
            <v-list-item-title>{{ tOrFallback('gamePage.selection.subCategory', 'Subcategory') }}</v-list-item-title>
            <v-list-item-subtitle>{{ entityName(selectedSubCategory || {}) || '—' }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item>
            <template #prepend>
              <v-icon icon="mdi-controller-classic-outline" />
            </template>
            <v-list-item-title>{{ tOrFallback('gamePage.selection.game', 'Game') }}</v-list-item-title>
            <v-list-item-subtitle>—</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <template v-if="selectedSubCategory">
        <v-breadcrumbs :items="breadcrumbs" class="px-0" />
        <v-row dense>
          <v-col v-for="game in games" :key="game.id" cols="12" md="6" lg="4">
            <v-card
              rounded="lg"
              class="cursor-pointer h-100"
              variant="text"
              @click="openGameLevels(game)"
            >
              <v-img :src="game?.img" height="200" cover />
            </v-card>
          </v-col>
        </v-row>

        <v-alert
          v-if="!games.length"
          type="info"
          variant="tonal"
          text="Aucun jeu disponible dans cette sous-catégorie."
        />
      </template>
    </v-container>
  </div>
</template>
