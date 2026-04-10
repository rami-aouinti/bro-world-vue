<script setup lang="ts">
interface LocalEvent {
  title: string
  summary: string
  category: string
  startAt: string
  sourceUrl: string
}

interface MajorEvent extends LocalEvent {
  impact: 'high' | 'medium' | 'low'
  zone: string
}

interface LocalContextResponse {
  location: {
    city: string
    region: string
    country: string
    countryCode: string
  }
  weather: {
    temperatureC: number | null
    condition: string
    weatherCode: number | null
    observedAt: string
  }
  events: LocalEvent[]
  majorEvents: MajorEvent[]
}

const { locale, t } = useI18n()
const AUTO_LOCAL_CONTEXT_KEY = 'home.local-context.last-fetch-at'
const AUTO_LOCAL_CONTEXT_TTL_MS = 30 * 60 * 1000

const isLoading = ref(false)
const permissionDenied = ref(false)
const loadError = ref('')
const isLocationModalOpen = ref(false)
const localContext = ref<LocalContextResponse | null>(null)

const hasContext = computed(() => Boolean(localContext.value))

const weatherSummary = computed(() => {
  const weather = localContext.value?.weather

  if (!weather) {
    return ''
  }

  if (typeof weather.temperatureC !== 'number') {
    return weather.condition
  }

  return `${weather.temperatureC.toFixed(1)}°C · ${weather.condition}`
})

function impactColor(impact: MajorEvent['impact']) {
  if (impact === 'high') {
    return 'error'
  }

  if (impact === 'medium') {
    return 'warning'
  }

  return 'info'
}

function resetState() {
  permissionDenied.value = false
  loadError.value = ''
}

function shouldAutoRequest() {
  try {
    const value = window.localStorage.getItem(AUTO_LOCAL_CONTEXT_KEY)

    if (!value) {
      return true
    }

    const lastFetchAt = Number(value)

    if (!Number.isFinite(lastFetchAt)) {
      return true
    }

    return Date.now() - lastFetchAt >= AUTO_LOCAL_CONTEXT_TTL_MS
  } catch {
    return true
  }
}

function setAutoRequestTimestamp() {
  try {
    window.localStorage.setItem(AUTO_LOCAL_CONTEXT_KEY, String(Date.now()))
  } catch {
    // Ignore storage write failures.
  }
}

async function loadLocalContext(position: GeolocationPosition) {
  isLoading.value = true

  try {
    localContext.value = await $fetch<LocalContextResponse>(
      '/api/home/local-context',
      {
        query: {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          locale: locale.value,
        },
      },
    )
  } catch (error) {
    loadError.value =
      error instanceof Error ? error.message : t('home.rightNav.localContext.error')
  } finally {
    isLoading.value = false
  }
}

function requestLocation() {
  resetState()
  isLocationModalOpen.value = false

  if (!navigator.geolocation) {
    loadError.value = t('home.rightNav.localContext.unsupported')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setAutoRequestTimestamp()
      void loadLocalContext(position)
    },
    () => {
      permissionDenied.value = true
      setAutoRequestTimestamp()
    },
    {
      enableHighAccuracy: false,
      timeout: 12000,
      maximumAge: 300000,
    },
  )
}

onMounted(() => {
  if (shouldAutoRequest()) {
    isLocationModalOpen.value = true
  }
})
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <v-dialog v-model="isLocationModalOpen" max-width="420">
      <v-card rounded="xl">
        <v-card-title class="text-h6">
          {{ $t('home.rightNav.localContext.title') }}
        </v-card-title>
        <v-card-text>
          {{ $t('home.rightNav.localContext.subtitle') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="isLocationModalOpen = false">
            {{ $t('common.close') }}
          </v-btn>
          <v-btn color="primary" :loading="isLoading" @click="requestLocation">
            {{ $t('home.rightNav.localContext.permissionCta') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-card v-if="hasContext && localContext" rounded="xl" variant="text" class="actuality-card">
      <v-card-item>
        <template #prepend>
          <v-icon icon="mdi-weather-partly-cloudy" color="primary" />
        </template>
        <v-card-title>{{ $t('home.rightNav.localContext.weatherTitle') }}</v-card-title>
      </v-card-item>
      <v-card-text class="pt-0">
        <div class="text-h5 font-weight-bold">{{ weatherSummary }}</div>
        <div class="text-caption text-medium-emphasis">
          {{ new Date(localContext.weather.observedAt).toLocaleString() }}
        </div>
      </v-card-text>
    </v-card>

    <v-card v-if="hasContext && localContext" rounded="xl" variant="text" class="actuality-card">
      <v-card-item>
        <template #prepend>
          <v-icon icon="mdi-calendar-star" color="primary" />
        </template>
        <v-card-title>{{ $t('home.rightNav.localContext.eventsTitle') }}</v-card-title>
      </v-card-item>

      <v-list density="compact" lines="two">
        <v-list-item
          v-for="item in localContext.events"
          :key="item.sourceUrl"
          :href="item.sourceUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ item.summary }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-if="!localContext.events.length">
          <v-list-item-title>{{ $t('home.rightNav.localContext.emptyState') }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>

    <v-card v-if="hasContext && localContext" rounded="xl" variant="text" class="actuality-card">
      <v-card-item>
        <template #prepend>
          <v-icon icon="mdi-alert-decagram-outline" color="error" />
        </template>
        <v-card-title>{{ $t('home.rightNav.localContext.majorEventsTitle') }}</v-card-title>
      </v-card-item>
      <v-list density="compact" lines="three">
        <v-list-item
          v-for="item in localContext.majorEvents"
          :key="item.sourceUrl"
          :href="item.sourceUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <template #prepend>
            <v-chip :color="impactColor(item.impact)" size="x-small" variant="tonal">
              {{ item.impact.toUpperCase() }}
            </v-chip>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ item.summary }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>
<style scoped>
.actuality-card {
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    transparent 20%
  );
  border: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
