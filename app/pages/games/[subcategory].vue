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
      <v-btn
        prepend-icon="mdi-arrow-left"
        class="mb-4"
        variant="text"
        @click="navigateTo(`/games`)"
      >
        Categories
      </v-btn>
      <v-row v-if="subCategories.length" dense>
        <v-col
          v-for="subCategory in subCategories"
          :key="subCategory.id"
          cols="12"
          sm="6"
          lg="4"
        >
          <v-card rounded="xl" class="h-100 game-card cursor-pointer" @click="openSubCategory(subCategory.id)">
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
