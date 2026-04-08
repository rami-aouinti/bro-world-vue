<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  title: 'appbar.games',
})

const catalogStore = useGameCatalogStore()

const selectedCategoryId = ref<string | null>(null)
const selectedSubCategoryId = ref<string | null>(null)
const selectedGameId = ref<string | null>(null)
const selectedLevelValue = ref<string | null>(null)
const finishResult = ref<'win' | 'lose' | null>(null)

const selectedCategory = computed(() =>
  catalogStore.categories.find(category => category.id === selectedCategoryId.value) ?? null,
)

const subCategories = computed(() => selectedCategory.value?.subCategories ?? [])

const selectedSubCategory = computed(() =>
  subCategories.value.find(subCategory => subCategory.id === selectedSubCategoryId.value) ?? null,
)

const games = computed(() => selectedSubCategory.value?.games ?? [])

const canStart = computed(() => Boolean(selectedGameId.value && selectedLevelValue.value))

function selectCategory(categoryId: string) {
  selectedCategoryId.value = categoryId
  selectedSubCategoryId.value = null
  selectedGameId.value = null
}

function selectSubCategory(subCategoryId: string) {
  selectedSubCategoryId.value = subCategoryId
  selectedGameId.value = null
}

async function onStart() {
  if (!selectedGameId.value || !selectedLevelValue.value) {
    return
  }

  finishResult.value = null
  await catalogStore.startSession(selectedGameId.value, selectedLevelValue.value)
}

async function onFinish(result: 'win' | 'lose') {
  const sessionId = catalogStore.currentSession?.sessionId

  if (!sessionId) {
    return
  }

  finishResult.value = result
  await catalogStore.finishSession(sessionId, result)
}

onMounted(() => {
  catalogStore.fetchCatalog()
})
</script>

<template>
  <v-container fluid>
    <h1 class="text-h3 mb-6">{{ t('appbar.games') }}</h1>

    <v-alert
      v-if="catalogStore.error"
      type="warning"
      variant="tonal"
      class="mb-4"
      :text="catalogStore.error"
    />

    <v-skeleton-loader
      v-if="catalogStore.loadingCatalog"
      type="article, article, article"
      class="mb-6"
    />

    <template v-else>
      <v-card class="mb-6" rounded="xl">
        <v-card-title>Categories</v-card-title>
        <v-card-text>
          <v-row v-if="catalogStore.categories.length" dense>
            <v-col
              v-for="category in catalogStore.categories"
              :key="category.id"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card
                rounded="lg"
                :variant="selectedCategoryId === category.id ? 'elevated' : 'tonal'"
                :color="selectedCategoryId === category.id ? 'primary' : undefined"
                class="cursor-pointer"
                @click="selectCategory(category.id)"
              >
                <v-card-item>
                  <v-card-title>{{ category.name }}</v-card-title>
                  <v-card-subtitle>{{ category.subCategories.length }} sub-categories</v-card-subtitle>
                </v-card-item>
              </v-card>
            </v-col>
          </v-row>
          <v-alert
            v-else
            type="info"
            variant="tonal"
            text="No category available."
          />
        </v-card-text>
      </v-card>

      <v-card class="mb-6" rounded="xl" :disabled="!selectedCategory">
        <v-card-title>Sub-categories</v-card-title>
        <v-card-text>
          <v-chip-group
            v-if="subCategories.length"
            :model-value="selectedSubCategoryId ? [selectedSubCategoryId] : []"
            column
          >
            <v-chip
              v-for="subCategory in subCategories"
              :key="subCategory.id"
              filter
              :color="selectedSubCategoryId === subCategory.id ? 'primary' : undefined"
              @click="selectSubCategory(subCategory.id)"
            >
              {{ subCategory.name }}
            </v-chip>
          </v-chip-group>
          <v-alert
            v-else
            type="info"
            variant="tonal"
            text="Select a category to view sub-categories."
          />
        </v-card-text>
      </v-card>

      <v-card class="mb-6" rounded="xl" :disabled="!selectedSubCategory">
        <v-card-title>Games</v-card-title>
        <v-card-text>
          <v-row v-if="games.length" dense>
            <v-col
              v-for="game in games"
              :key="game.id"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card
                rounded="lg"
                :variant="selectedGameId === game.id ? 'elevated' : 'outlined'"
                :color="selectedGameId === game.id ? 'primary' : undefined"
                class="cursor-pointer"
                @click="selectedGameId = game.id"
              >
                <v-card-item>
                  <v-card-title>{{ game.name }}</v-card-title>
                  <v-card-subtitle>{{ game.description || 'Ready to play' }}</v-card-subtitle>
                </v-card-item>
              </v-card>
            </v-col>
          </v-row>
          <v-alert
            v-else
            type="info"
            variant="tonal"
            text="Select a sub-category to view games."
          />
        </v-card-text>
      </v-card>

      <v-card class="mb-6" rounded="xl">
        <v-card-title>Levels</v-card-title>
        <v-card-text>
          <v-chip-group
            :model-value="selectedLevelValue ? [selectedLevelValue] : []"
            column
          >
            <v-chip
              v-for="level in catalogStore.levels"
              :key="level"
              filter
              :color="selectedLevelValue === level ? 'primary' : undefined"
              @click="selectedLevelValue = level"
            >
              {{ level }}
            </v-chip>
          </v-chip-group>
        </v-card-text>
      </v-card>

      <div class="d-flex align-center ga-3 mb-6">
        <v-btn
          color="primary"
          :disabled="!canStart"
          :loading="catalogStore.startingSession"
          @click="onStart"
        >
          Start
        </v-btn>
      </div>

      <v-card v-if="catalogStore.currentSession" rounded="xl" class="mb-6">
        <v-card-title>Session info</v-card-title>
        <v-card-text>
          <div class="mb-2"><strong>sessionId:</strong> {{ catalogStore.currentSession.sessionId }}</div>
          <div class="mb-2"><strong>status:</strong> {{ catalogStore.currentSession.status }}</div>
          <div><strong>coins:</strong> {{ catalogStore.currentSession.coins }}</div>
        </v-card-text>
      </v-card>

      <v-card rounded="xl" :disabled="!catalogStore.currentSession">
        <v-card-title>Finish demo</v-card-title>
        <v-card-text class="d-flex ga-3 align-center flex-wrap">
          <v-btn
            color="success"
            :loading="catalogStore.finishingSession && finishResult === 'win'"
            :disabled="!catalogStore.currentSession"
            @click="onFinish('win')"
          >
            Win
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            :loading="catalogStore.finishingSession && finishResult === 'lose'"
            :disabled="!catalogStore.currentSession"
            @click="onFinish('lose')"
          >
            Lose
          </v-btn>
        </v-card-text>
      </v-card>
    </template>
  </v-container>
</template>
