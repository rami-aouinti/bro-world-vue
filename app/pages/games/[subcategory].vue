<script setup lang="ts">
definePageMeta({
  title: 'appbar.games',
})

const route = useRoute()
const categoryId = computed(() => String(route.params.subcategory || ''))

const {
  ensureCatalogLoaded,
  entityName,
  entityDescription,
  getCategoryById,
  getGameCardImage,
} = useGamesCatalogNavigation()

onMounted(async () => {
  const ok = await ensureCatalogLoaded()
  if (ok && !selectedCategory.value) {
    await navigateTo('/games')
  }
})

const selectedCategory = computed(() => getCategoryById(categoryId.value))

function openSubCategory(subCategoryId: string) {
  navigateTo(`/games/${categoryId.value}/${subCategoryId}/home`)
}

function getSubCategoryThumbnail(subCategory: { img?: string | null; games?: Array<{ thumbnailUrl?: string | null; img?: string | null }> }) {
  return getGameCardImage(subCategory.games?.[0]?.thumbnailUrl || subCategory.games?.[0]?.img || subCategory.img)
}

const subCategories = computed(() =>
  Array.isArray(selectedCategory.value?.subCategories) ? selectedCategory.value.subCategories : [],
)
</script>

<template>
  <v-container fluid>
    <template v-if="selectedCategory">
      <h1 class="text-h4 mb-1">{{ entityName(selectedCategory) }}</h1>
      <p class="text-medium-emphasis mb-6">
        {{ entityDescription(selectedCategory) || 'Choisis une sous-catégorie pour voir les jeux.' }}
      </p>

      <v-row v-if="subCategories.length" dense>
        <v-col
          v-for="subCategory in subCategories"
          :key="subCategory.id"
          cols="12"
          sm="6"
          lg="4"
        >
          <v-card rounded="xl" class="h-100 cursor-pointer" @click="openSubCategory(subCategory.id)">
            <v-img
              :src="getSubCategoryThumbnail(subCategory)"
              height="180"
              cover
            />
            <v-card-item>
              <v-card-title>{{ entityName(subCategory) }}</v-card-title>
              <v-card-subtitle>
                {{ entityDescription(subCategory) || 'Explore les jeux de cette sous-catégorie.' }}
              </v-card-subtitle>
            </v-card-item>
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
