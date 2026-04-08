<script setup lang="ts">
import { Notify } from '~/stores/notification'

definePageMeta({
  title: 'appbar.games',
})

const route = useRoute()
const categoryParam = computed(() => String(route.params.categoryKey || ''))
const subCategoryParam = computed(() => String(route.params.subCategoryKey || ''))
const gameParam = computed(() => String(route.params.gameKey || ''))

const {
  catalogStore,
  t,
  tOrFallback,
  ensureCatalogLoaded,
  getCategoryByRouteParam,
  getSubCategoryByRouteParam,
  getGameByRouteParam,
  entityName,
} = useGamesCatalogNavigation()

const selectedCategory = computed(() => getCategoryByRouteParam(categoryParam.value))
const selectedSubCategory = computed(() => getSubCategoryByRouteParam(categoryParam.value, subCategoryParam.value))
const selectedGame = computed(() => getGameByRouteParam(categoryParam.value, subCategoryParam.value, gameParam.value))
const levels = computed(() => (Array.isArray(catalogStore.levels) ? catalogStore.levels : []))
const selectedLevelValue = ref<string | null>(null)

const canStart = computed(
  () => Boolean(selectedGame.value && selectedLevelValue.value) && !catalogStore.startingSession,
)

onMounted(async () => {
  const loaded = await ensureCatalogLoaded()
  if (!loaded)
    return

  if (!selectedCategory.value || !selectedSubCategory.value || !selectedGame.value) {
    await navigateTo('/games')
    return
  }

  try {
    await catalogStore.fetchLevels()
  } catch (error) {
    Notify.error(error)
  }
})

function difficultyLabel(level: string) {
  return tOrFallback(`gamePage.catalog.difficulties.${level}`, level)
}

async function onStart() {
  if (!selectedGame.value || !selectedLevelValue.value)
    return

  try {
    const response = await catalogStore.startSession(selectedGame.value.id, selectedLevelValue.value)
    const createdSessionId = response.session.id ?? response.session.sessionId ?? catalogStore.currentSession?.sessionId

    if (!createdSessionId) {
      Notify.error('Session id not found in start response.')
      return
    }

    await navigateTo(
      `/games/${categoryParam.value}/${subCategoryParam.value}/${gameParam.value}/${createdSessionId}/play`,
    )
  } catch (error) {
    Notify.error(error)
  }
}

function navigateBreadcrumb(to?: string) {
  if (to) {
    navigateTo(to)
  }
}

const breadcrumbs = computed(() => [
  { title: 'Games', to: '/games' },
  { title: selectedCategory.value?.key || selectedCategory.value?.name || 'Category', to: `/games/${categoryParam.value}` },
  { title: selectedSubCategory.value?.key || selectedSubCategory.value?.name || 'Subcategory', to: `/games/${categoryParam.value}/${subCategoryParam.value}` },
  { title: selectedGame.value?.key || selectedGame.value?.name || 'Game', disabled: true },
])
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
            <v-list-item-title>{{ tOrFallback('gamePage.selection.category', 'Category') }}</v-list-item-title>
            <v-list-item-subtitle>{{ entityName(selectedCategory || {}) || '—' }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="selectedSubCategory">
            <template #prepend>
              <v-icon icon="mdi-shape-plus-outline" />
            </template>
            <v-list-item-title>{{ tOrFallback('gamePage.selection.subCategory', 'Subcategory') }}</v-list-item-title>
            <v-list-item-subtitle>{{ entityName(selectedSubCategory || {}) || '—' }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="selectedGame">
            <template #prepend>
              <v-icon icon="mdi-controller-classic-outline" />
            </template>
            <v-list-item-title>{{ tOrFallback('gamePage.selection.game', 'Game') }}</v-list-item-title>
            <v-list-item-subtitle>{{ entityName(selectedGame || {}) || '—' }}</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="selectedLevelValue">
            <template #prepend>
              <v-icon icon="mdi-ladder" />
            </template>
            <v-list-item-title>{{ tOrFallback('gamePage.selection.level', 'Level') }}</v-list-item-title>
            <v-list-item-subtitle>{{ selectedLevelValue }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <template v-if="selectedGame">
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
        <div class="d-flex flex-column align-center justify-center gap-4 mb-4">
          <v-row class="w-100 mb-4">
            <v-col
              v-for="level in levels"
              :key="level.id"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card
                height="200"
                min-width="200"
                class="level-card d-flex align-center justify-center text-center cursor-pointer"
                :elevation="selectedLevelValue === level.value ? 12 : 2"
                :color="selectedLevelValue === level.value ? 'primary' : ''"
                :variant="selectedLevelValue === level.value ? 'flat' : 'outlined'"
                @click="selectedLevelValue = level.value"
              >
                <div class="text-h6">
                  {{ difficultyLabel(level.value) }}
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-btn color="primary" size="large" :disabled="!canStart" :loading="catalogStore.startingSession" @click="onStart">
            {{ t('gamePage.actions.start') }}
          </v-btn>
        </div>
      </template>
    </v-container>
  </div>
</template>
<style scoped>
.level-card {
  background: linear-gradient(240deg, rgba(var(--v-theme-primary), 0.18) 0%, transparent 20%);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
