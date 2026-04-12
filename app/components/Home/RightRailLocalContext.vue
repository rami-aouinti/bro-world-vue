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
const LOCATION_PROMPTED_KEY = 'home.local-context.prompted'
const LAST_COORDS_KEY = 'home.local-context.coords'

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

function getStoredCoords() {
  try {
    const raw = window.localStorage.getItem(LAST_COORDS_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as { lat?: unknown; lon?: unknown }
    const lat = Number(parsed?.lat)
    const lon = Number(parsed?.lon)

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return null
    }

    return { lat, lon }
  } catch {
    return null
  }
}

function setStoredCoords(lat: number, lon: number) {
  try {
    window.localStorage.setItem(LAST_COORDS_KEY, JSON.stringify({ lat, lon }))
  } catch {
    // Ignore storage write failures.
  }
}

function hasPromptedForLocation() {
  try {
    return window.localStorage.getItem(LOCATION_PROMPTED_KEY) === '1'
  } catch {
    return false
  }
}

function markLocationPrompted() {
  try {
    window.localStorage.setItem(LOCATION_PROMPTED_KEY, '1')
  } catch {
    // Ignore storage write failures.
  }
}

async function loadLocalContextByCoords(coords: { lat: number; lon: number }) {
  isLoading.value = true

  try {
    localContext.value = await $fetch<LocalContextResponse>(
      '/api/home/local-context',
      {
        query: {
          lat: coords.lat,
          lon: coords.lon,
          locale: locale.value,
        },
      },
    )
  } catch (error) {
    loadError.value =
      error instanceof Error
        ? error.message
        : t('home.rightNav.localContext.error')
  } finally {
    isLoading.value = false
  }
}

async function loadLocalContext(position: GeolocationPosition) {
  await loadLocalContextByCoords({
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  })
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
      setStoredCoords(position.coords.latitude, position.coords.longitude)
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
  const storedCoords = getStoredCoords()

  if (storedCoords) {
    void loadLocalContextByCoords(storedCoords)
    return
  }

  if (!hasPromptedForLocation()) {
    isLocationModalOpen.value = true
    markLocationPrompted()
  }
})
</script>

<template>
  <div>
    <v-dialog
      v-model="isLocationModalOpen"
      max-width="420"
      :aria-label="$t('home.rightNav.localContext.title')"
    >
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

    <div v-if="hasContext && localContext">
      <v-card-item>
        <template #prepend>
          <v-icon icon="mdi-weather-partly-cloudy" color="primary" />
        </template>
        <div class="text-h6">{{
            $t('home.rightNav.localContext.weatherTitle')
          }}</div>
      </v-card-item>
      <v-card-text class="pt-0">
        <div class="text-h5 font-weight-bold">{{ weatherSummary }}</div>
        <div class="text-caption text-medium-emphasis">
          {{ new Date(localContext.weather.observedAt).toLocaleString() }}
        </div>
      </v-card-text>
      <v-card-item>
        <template #prepend>
          <v-icon icon="mdi-calendar-star" color="primary" />
        </template>
        <div class="text-h6">{{
            $t('home.rightNav.localContext.eventsTitle')
          }}</div>
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
          <v-list-item-title>{{
              $t('home.rightNav.localContext.emptyState')
            }}</v-list-item-title>
        </v-list-item>
      </v-list>
      <v-card-item>
        <template #prepend>
          <v-icon icon="mdi-alert-decagram-outline" color="error" />
        </template>
        <div class="text-h6">{{
            $t('home.rightNav.localContext.majorEventsTitle')
          }}</div>
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
            <v-chip
              :color="impactColor(item.impact)"
              size="x-small"
              variant="tonal"
            >
              {{ item.impact.toUpperCase() }}
            </v-chip>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ item.summary }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </div>
  </div>
</template>
