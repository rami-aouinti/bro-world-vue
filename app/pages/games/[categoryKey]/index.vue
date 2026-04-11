<script setup lang="ts">
definePageMeta({
  title: 'appbar.games',
})

const route = useRoute()
const categoryParam = computed(() => String(route.params.categoryKey || ''))

const {
  ensureCatalogLoaded,
  getCategoryByRouteParam,
  entityRouteValue,
  entityName,
  tOrFallback,
} = useGamesCatalogNavigation()

onMounted(async () => {
  const ok = await ensureCatalogLoaded()
  if (ok && !selectedCategory.value) {
    await navigateTo('/games')
  }
})

const selectedCategory = computed(() =>
  getCategoryByRouteParam(categoryParam.value),
)

function openSubCategory(subCategory: { id: string; key?: string }) {
  navigateTo(`/games/${categoryParam.value}/${entityRouteValue(subCategory)}`)
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
    disabled: true,
  },
])

const subCategories = computed(() =>
  Array.isArray(selectedCategory.value?.subCategories)
    ? selectedCategory.value.subCategories
    : [],
)

const rightDrawerSelection = computed(() => [
  {
    key: 'category',
    icon: 'mdi-shape-outline',
    label: tOrFallback('gamePage.selection.category', 'Category'),
    value: entityName(selectedCategory.value || {}) || '',
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
      <template v-if="selectedCategory">
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
        <v-row v-if="subCategories.length" density="comfortable">
          <v-col
            v-for="subCategory in subCategories"
            :key="subCategory.id"
            cols="12"
            sm="6"
            lg="4"
          >
            <v-card
              rounded="xl"
              class="h-100 game-card cursor-pointer"
              @click="openSubCategory(subCategory)"
            >
              <v-img :src="subCategory?.img" height="200" cover />
            </v-card>
          </v-col>
        </v-row>
        <v-alert
          v-else
          type="info"
          variant="tonal"
          :text="
            tOrFallback(
              'gamePage.catalog.emptySubCategories',
              'No sub-categories available for now.',
            )
          "
        />
      </template>
    </v-container>
  </div>
</template>
<style scoped>
.game-card {
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    transparent 20%
  );
}
</style>
