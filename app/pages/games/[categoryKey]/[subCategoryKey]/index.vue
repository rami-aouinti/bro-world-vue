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
  <v-container fluid>
    <template v-if="selectedSubCategory">
      <v-breadcrumbs :items="breadcrumbs" class="px-0" />
      <v-row dense>
        <v-col v-for="game in games" :key="game.id" cols="12" md="6" lg="4">
          <v-card
            rounded="lg"
            class="cursor-pointer h-100"
            variant="outlined"
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
</template>
