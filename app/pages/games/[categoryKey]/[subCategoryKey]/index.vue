<script setup lang="ts">
definePageMeta({
  title: 'appbar.games',
  layout: 'games',
})

const route = useRoute()
const categoryParam = computed(() => String(route.params.categoryKey || ''))
const subCategoryParam = computed(() =>
  String(route.params.subCategoryKey || ''),
)

const {
  ensureCatalogLoaded,
  getCategoryByRouteParam,
  getSubCategoryByRouteParam,
  entityRouteValue,
  entityName,
  tOrFallback,
} = useGamesCatalogNavigation()

const selectedCategory = computed(() =>
  getCategoryByRouteParam(categoryParam.value),
)
const selectedSubCategory = computed(() =>
  getSubCategoryByRouteParam(categoryParam.value, subCategoryParam.value),
)
const games = computed(() => selectedSubCategory.value?.games ?? [])

onMounted(async () => {
  const loaded = await ensureCatalogLoaded()
  if (!loaded) return

  if (!selectedCategory.value || !selectedSubCategory.value) {
    await navigateTo('/games')
  }
})

function openGameLevels(game: { id: string; key?: string }) {
  navigateTo(
    `/games/${categoryParam.value}/${subCategoryParam.value}/${entityRouteValue(game)}`,
  )
}

function navigateBreadcrumb(to?: string) {
  if (to) {
    navigateTo(to)
  }
}

const breadcrumbs = computed(() => [
  { title: 'Games', to: '/games' },
  {
    title:
      selectedCategory.value?.key || selectedCategory.value?.name || 'Category',
    to: `/games/${categoryParam.value}`,
  },
  {
    title:
      selectedSubCategory.value?.key ||
      selectedSubCategory.value?.name ||
      'Subcategory',
    disabled: true,
  },
])

const rightDrawerSelection = computed(() => [
  {
    key: 'category',
    icon: 'mdi-shape-outline',
    label: tOrFallback('gamePage.selection.category', 'Category'),
    value: entityName(selectedCategory.value || {}) || '',
  },
  {
    key: 'subCategory',
    icon: 'mdi-shape-plus-outline',
    label: tOrFallback('gamePage.selection.subCategory', 'Subcategory'),
    value: entityName(selectedSubCategory.value || {}) || '',
  },
])
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <GamesDrawersRightPanel :selection="rightDrawerSelection" />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <template v-if="selectedSubCategory">
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-2">
          <template #item="{ item }">
            <v-btn
              variant="text"
              size="small"
              :disabled="item.disabled"
              @click="navigateBreadcrumb(item.to as string | undefined)"
            >
              {{ item.title }}
            </v-btn>
          </template>
        </v-breadcrumbs>
        <v-row density="comfortable">
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
          :text="
            tOrFallback(
              'gamePage.catalog.emptyGames',
              'No games available for now.',
            )
          "
        />
      </template>
    </v-container>
  </div>
</template>
