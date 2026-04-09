<script setup lang="ts">
import BoardTablePlaySurface from '~/components/Game/BoardTablePlaySurface.vue'
import CardTablePlaySurface from '~/components/Game/CardTablePlaySurface.vue'
import { Notify } from '~/stores/notification'

definePageMeta({
  title: 'appbar.games',
  layout: 'games',
})

const route = useRoute()
const sessionId = computed(() => String(route.params.sessionId || ''))
const categoryParam = computed(() => String(route.params.categoryKey || ''))
const subCategoryParam = computed(() =>
  String(route.params.subCategoryKey || ''),
)
const gameParam = computed(() => String(route.params.gameKey || ''))

const {
  catalogStore,
  tOrFallback,
  ensureCatalogLoaded,
  getCategoryByRouteParam,
  getSubCategoryByRouteParam,
  getGameByRouteParam,
} = useGamesCatalogNavigation()

const finishResult = ref<'win' | 'lose' | null>(null)

const selectedCategory = computed(() =>
  getCategoryByRouteParam(categoryParam.value),
)
const selectedSubCategory = computed(() =>
  getSubCategoryByRouteParam(categoryParam.value, subCategoryParam.value),
)
const selectedGame = computed(() =>
  getGameByRouteParam(
    categoryParam.value,
    subCategoryParam.value,
    gameParam.value,
  ),
)

function normalizeCategoryKey(categoryKey: string) {
  const normalized = categoryKey.trim().toLowerCase()

  if (['card', 'cards'].includes(normalized)) return 'card'
  if (['board', 'boards'].includes(normalized)) return 'board'

  return ''
}

const playSurfaceType = computed<'card' | 'board' | 'default'>(() => {
  const normalizedCategory = normalizeCategoryKey(
    selectedCategory.value?.key || selectedCategory.value?.name || '',
  )

  if (normalizedCategory === 'card') return 'card'
  if (normalizedCategory === 'board') return 'board'

  return 'default'
})

const currentSession = computed(() => {
  if (catalogStore.currentSession?.sessionId === sessionId.value)
    return catalogStore.currentSession

  return null
})

const commonSurfaceProps = computed(() => ({
  sessionId: currentSession.value?.sessionId || sessionId.value,
  gameName:
    selectedGame.value?.name ||
    selectedGame.value?.key ||
    gameParam.value ||
    'Unknown game',
  level: currentSession.value?.level || 'unknown',
  status: currentSession.value?.status || 'pending',
}))

onMounted(async () => {
  const loaded = await ensureCatalogLoaded()
  if (!loaded) return

  if (
    !selectedCategory.value ||
    !selectedSubCategory.value ||
    !selectedGame.value ||
    !currentSession.value
  ) {
    await navigateTo(
      `/games/${categoryParam.value}/${subCategoryParam.value}/${gameParam.value}`,
    )
  }
})

async function onFinish(result: 'win' | 'lose') {
  if (!currentSession.value) return

  finishResult.value = result

  try {
    await catalogStore.finishSession(sessionId.value, result)
    const completedSessionId = sessionId.value
    catalogStore.currentSession = null
    Notify.success(
      result === 'win'
        ? tOrFallback(
            'gamePage.messages.finishWinSuccess',
            'Session finished with a win.',
          )
        : tOrFallback(
            'gamePage.messages.finishLoseSuccess',
            'Session finished with a loss.',
          ),
    )

    await navigateTo(
      `/games/${categoryParam.value}/${subCategoryParam.value}/${gameParam.value}?lastSession=${completedSessionId}&result=${result}`,
    )
  } catch (error) {
    Notify.error(error)
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
    to: `/games/${categoryParam.value}/${subCategoryParam.value}`,
  },
  {
    title: selectedGame.value?.key || selectedGame.value?.name || 'Game',
    to: `/games/${categoryParam.value}/${subCategoryParam.value}/${gameParam.value}`,
  },
  { title: 'Play', disabled: true },
])
</script>

<template>
  <v-container fluid>
    <v-breadcrumbs :items="breadcrumbs" class="px-0" />

    <v-row class="ga-0" align="stretch">
      <v-col cols="12" md="8" lg="9">
        <CardTablePlaySurface
          v-if="playSurfaceType === 'card'"
          v-bind="commonSurfaceProps"
        />
        <BoardTablePlaySurface
          v-else-if="playSurfaceType === 'board'"
          v-bind="commonSurfaceProps"
        />
        <v-card v-else rounded="xl" class="h-100">
          <v-card-title>{{ commonSurfaceProps.gameName }}</v-card-title>
          <v-card-subtitle>Play surface</v-card-subtitle>
          <v-card-text class="py-8">
            <div class="text-medium-emphasis">
              Surface non spécialisée pour cette catégorie.
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4" lg="3">
        <v-card rounded="xl" class="mb-4">
          <v-card-title>Live session</v-card-title>
          <v-card-text v-if="currentSession" class="d-flex flex-wrap ga-2">
            <v-chip color="primary" variant="tonal"
              >Session: {{ currentSession.sessionId }}</v-chip
            >
            <v-chip color="secondary" variant="tonal"
              >Level: {{ currentSession.level }}</v-chip
            >
            <v-chip color="info" variant="tonal"
              >Status: {{ currentSession.status }}</v-chip
            >
            <v-chip color="warning" variant="tonal"
              >Coins: {{ currentSession.coins }}</v-chip
            >
          </v-card-text>
          <v-card-text v-else>
            Session introuvable. Redirection en cours...
          </v-card-text>
        </v-card>

        <v-card rounded="xl" :disabled="!currentSession">
          <v-card-title>{{
            tOrFallback('gamePage.session.finishDemo', 'Finish demo')
          }}</v-card-title>
          <v-card-text class="d-flex ga-3 flex-wrap">
            <v-btn
              color="success"
              :disabled="!currentSession || catalogStore.finishingSession"
              :loading="catalogStore.finishingSession && finishResult === 'win'"
              @click="onFinish('win')"
            >
              Finish win
            </v-btn>
            <v-btn
              color="error"
              variant="outlined"
              :disabled="!currentSession || catalogStore.finishingSession"
              :loading="catalogStore.finishingSession && finishResult === 'lose'"
              @click="onFinish('lose')"
            >
              Finish lose
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
