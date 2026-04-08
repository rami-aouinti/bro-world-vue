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

function getCategoryThumbnail(category: { games?: { thumbnailUrl?: string }[]; subCategories?: { games?: { thumbnailUrl?: string }[] }[] }) {
  return getGameCardImage(
    category.games?.[0]?.thumbnailUrl ||
      category.subCategories?.[0]?.games?.[0]?.thumbnailUrl,
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
    <div class="d-flex align-end justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <h1 class="text-h3 font-weight-bold">{{ t('appbar.games') }}</h1>
        <p class="text-medium-emphasis mt-2">
          {{
            tOrFallback(
              'gamePage.catalog.states.selectCategory',
              'Choisis une catégorie pour continuer.',
            )
          }}
        </p>
      </div>
      <v-chip color="primary" variant="tonal" size="large">
        {{ categories.length }}
        {{ t('gamePage.catalog.sections.categories') }}
      </v-chip>
    </div>

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
        lg="4"
      >
        <v-hover v-slot="{ isHovering, props }">
          <v-card
            v-bind="props"
            class="game-category-card overflow-hidden"
            rounded="xl"
            elevation="8"
            @click="openCategory(category.id)"
          >
            <v-img
              :src="getCategoryThumbnail(category)"
              height="220"
              cover
            >
              <div class="category-overlay pa-5 d-flex flex-column h-100 justify-end">
                <div class="text-overline text-white mb-1">BRO WORLD</div>
                <div class="text-h5 font-weight-bold text-white mb-1">
                  {{ entityName(category) }}
                </div>
                <div class="text-body-2 text-white mb-3 text-truncate-2">
                  {{
                    entityDescription(category) ||
                    tOrFallback(
                      'gamePage.states.emptySubCategories',
                      'Découvre les sous-catégories de cette section.',
                    )
                  }}
                </div>
                <div class="d-flex align-center justify-space-between">
                  <v-chip color="white" size="small" variant="flat">
                    {{ getSubCategoryCount(category) }} sous-catégories
                  </v-chip>
                  <v-icon
                    color="white"
                    :icon="isHovering ? 'mdi-arrow-right-circle' : 'mdi-arrow-right'"
                  />
                </div>
              </div>
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
