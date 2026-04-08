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
} = useGamesCatalogNavigation()

onMounted(async () => {
  const ok = await ensureCatalogLoaded()
  if (ok && !selectedCategory.value) {
    await navigateTo('/games')
  }
})

const selectedCategory = computed(() => getCategoryByRouteParam(categoryParam.value))

function openSubCategory(subCategory: { id: string; key?: string }) {
  navigateTo(`/games/${categoryParam.value}/${entityRouteValue(subCategory)}`)
}

const breadcrumbs = computed(() => [
  { title: 'Games', to: '/games' },
  { title: selectedCategory.value?.key || selectedCategory.value?.name || 'Category', disabled: true },
])

const subCategories = computed(() =>
  Array.isArray(selectedCategory.value?.subCategories) ? selectedCategory.value.subCategories : [],
)
</script>

<template>
  <v-container fluid>
    <template v-if="selectedCategory">
      <v-breadcrumbs :items="breadcrumbs" class="px-0" />
      <v-row v-if="subCategories.length" dense>
        <v-col
          v-for="subCategory in subCategories"
          :key="subCategory.id"
          cols="12"
          sm="6"
          lg="4"
        >
          <v-card rounded="xl" class="h-100 game-card cursor-pointer" @click="openSubCategory(subCategory)">
            <v-img
              :src="subCategory?.img"
              height="200"
              cover
            />
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
</template>
<style scoped>
.game-card {
  background: linear-gradient(240deg, rgba(var(--v-theme-primary), 0.18) 0%, transparent 20%);
}
</style>
