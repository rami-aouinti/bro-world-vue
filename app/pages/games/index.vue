<script setup lang="ts">
definePageMeta({
  title: 'appbar.games',
  layout: 'games',
})

const { catalogStore, ensureCatalogLoaded, entityRouteValue } =
  useGamesCatalogNavigation()

onMounted(async () => {
  await ensureCatalogLoaded()
})

function openCategory(category: { id: string; key?: string }) {
  navigateTo(`/games/${entityRouteValue(category)}`)
}

const categories = computed(() =>
  Array.isArray(catalogStore.categories) ? catalogStore.categories : [],
)

const _breadcrumbs = [{ title: 'Games', disabled: true }]

const topScores = [
  { name: 'NovaBlade', score: 12840, avatar: '/img/team-1.jpg' },
  { name: 'PixelQueen', score: 11720, avatar: '/img/team-2.jpg' },
  { name: 'ArcadeWolf', score: 10995, avatar: '/img/team-3.jpg' },
]
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <v-list nav density="comfortable" class="app-right-drawer-list">
          <v-list-subheader>Top Scores</v-list-subheader>

          <v-list-item
            v-for="(user, index) in topScores"
            :key="user.name"
            :title="user.name"
            :subtitle="`${user.score} pts`"
          >
            <template #prepend>
              <v-avatar size="36">
                <v-img :src="user.avatar" :alt="user.name" cover />
              </v-avatar>
            </template>
            <template #append>
              <v-chip size="small" color="warning" variant="tonal">
                #{{ index + 1 }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <div class="text-h2 text-center mb-2">
        <h3>Games</h3>
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
          <v-hover v-slot="{ props }">
            <v-card
              v-bind="props"
              class="game-category-card overflow-hidden"
              elevation="8"
              @click="openCategory(category)"
            >
              <v-img :src="category?.img" height="200" cover />
            </v-card>
          </v-hover>
        </v-col>
      </v-row>

      <v-alert
        v-else
        type="info"
        variant="tonal"
        text="Aucune catégorie disponible pour le moment."
      />
    </v-container>
  </div>
</template>

<style scoped>
.game-category-card {
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.game-category-card:hover {
  transform: translateY(-4px);
}
</style>
