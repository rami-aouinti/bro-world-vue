<script setup lang="ts">
definePageMeta({
  title: 'appbar.games',
})

const {
  catalogStore,
  t,
  tOrFallback,
  ensureCatalogLoaded,
  entityName,
  entityDescription,
  getGameCardImage,
} = useGamesCatalogNavigation()

onMounted(async () => {
  await ensureCatalogLoaded()
})

function openCategory(categoryId: string) {
  navigateTo(`/games/${categoryId}`)
}

function getCategoryThumbnail(category: {
  img?: string | null
  games?: { thumbnailUrl?: string | null; img?: string | null }[]
  subCategories?: { img?: string | null; games?: { thumbnailUrl?: string | null; img?: string | null }[] }[]
}) {
  return getGameCardImage(
    category.games?.[0]?.thumbnailUrl ||
      category.games?.[0]?.img ||
      category.subCategories?.[0]?.games?.[0]?.thumbnailUrl ||
      category.subCategories?.[0]?.games?.[0]?.img ||
      category.subCategories?.[0]?.img ||
      category.img,
  )
}

function getSubCategoryCount(category: { subCategories?: unknown[] }) {
  return Array.isArray(category.subCategories) ? category.subCategories.length : 0
}

const categories = computed(() =>
  Array.isArray(catalogStore.categories) ? catalogStore.categories : [],
)
</script>

<template>
  <v-container fluid>
    <v-skeleton-loader
      v-if="catalogStore.loadingCatalog"
      type="image, article, image, article"
    />

    <v-row v-else-if="categories.length" dense>
      <v-col
        v-for="category in categories"
        :key="category.id"
        cols="12"
        sm="6"
        lg="6"
      >
        <v-hover v-slot="{ isHovering, props }">
          <v-card
            v-bind="props"
            class="game-category-card overflow-hidden"
            elevation="8"
            @click="openCategory(category.id)"
          >
            <v-img
              :src="getCategoryThumbnail(category)"
              height="200"
              cover
            >
            </v-img>
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
          'gamePage.states.emptyCategories',
          'Aucune catégorie disponible pour le moment.',
        )
      "
    />
  </v-container>
</template>

<style scoped>
.game-category-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.game-category-card:hover {
  transform: translateY(-4px);
}

.category-overlay {
  background: linear-gradient(180deg, rgba(10, 10, 10, 0.1), rgba(10, 10, 10, 0.82));
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
