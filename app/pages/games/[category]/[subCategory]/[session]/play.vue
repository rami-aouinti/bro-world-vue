<script setup lang="ts">
import { Notify } from '~/stores/notification'

definePageMeta({
  title: 'appbar.games',
})

const route = useRoute()
const sessionId = computed(() => String(route.params.session || ''))
const categoryId = computed(() => String(route.params.category || ''))
const subCategoryId = computed(() => String(route.params.subCategory || ''))

const { catalogStore, tOrFallback } = useGamesCatalogNavigation()

const finishResult = ref<'win' | 'lose' | null>(null)

const currentSession = computed(() => {
  if (catalogStore.currentSession?.sessionId === sessionId.value) {
    return catalogStore.currentSession
  }

  return null
})

const levelParam = computed(() => String(route.query.level || currentSession.value?.level || ''))

onMounted(async () => {
  if (!currentSession.value) {
    await navigateTo(`/games/${categoryId.value}/${subCategoryId.value}/home`)
  }
})

async function onFinish(result: 'win' | 'lose') {
  if (!currentSession.value) {
    return
  }

  finishResult.value = result

  try {
    await catalogStore.finishSession(sessionId.value, result)
    const completedSessionId = sessionId.value
    catalogStore.currentSession = null
    Notify.success(
      result === 'win'
        ? tOrFallback('gamePage.messages.finishWinSuccess', 'Session finished with a win.')
        : tOrFallback('gamePage.messages.finishLoseSuccess', 'Session finished with a loss.'),
    )

    await navigateTo(
      `/games/${categoryId.value}/${subCategoryId.value}/home?lastSession=${completedSessionId}&result=${result}`,
    )
  } catch (error) {
    Notify.error(error)
  }
}
</script>

<template>
  <v-container fluid>
    <v-btn
      prepend-icon="mdi-arrow-left"
      variant="text"
      class="mb-4"
      @click="navigateTo(`/games/${categoryId}/${subCategoryId}/home`)"
    >
      Back to games
    </v-btn>

    <v-card rounded="xl" class="mb-6">
      <v-card-title>Live session</v-card-title>
      <v-card-text v-if="currentSession" class="d-flex flex-wrap ga-2">
        <v-chip color="primary" variant="tonal">Session: {{ currentSession.sessionId }}</v-chip>
        <v-chip color="secondary" variant="tonal">Level: {{ levelParam || currentSession.level }}</v-chip>
        <v-chip color="info" variant="tonal">Status: {{ currentSession.status }}</v-chip>
        <v-chip color="warning" variant="tonal">Coins: {{ currentSession.coins }}</v-chip>
      </v-card-text>
      <v-card-text v-else>
        Session introuvable. Redirection en cours...
      </v-card-text>
    </v-card>

    <v-card rounded="xl" :disabled="!currentSession">
      <v-card-title>{{ tOrFallback('gamePage.session.finishDemo', 'Finish demo') }}</v-card-title>
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
  </v-container>
</template>
