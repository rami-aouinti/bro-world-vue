<script setup lang="ts">
definePageMeta({
  title: 'appbar.games',
  layout: 'games',
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
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <v-list nav density="compact" class="app-right-drawer-list">
          <v-list-item v-if="selectedCategory">
            <template #prepend>
              <v-icon icon="mdi-shape-outline" />
            </template>
            <v-list-item-title>{{
              tOrFallback('gamePage.selection.category', 'Category')
            }}</v-list-item-title>
            <v-list-item-subtitle>{{
              entityName(selectedCategory || {}) || '—'
            }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
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
        <v-row v-if="subCategories.length" dense>
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
          text="Aucune sous-catégorie disponible pour cette catégorie."
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
