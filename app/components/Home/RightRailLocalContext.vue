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

interface RecruitJobItem {
  id: string
  slug: string
  title: string
  company?: {
    name?: string
  }
  location?: string
}

interface RecruitJobsListResponse {
  items?: RecruitJobItem[]
}

interface CrmProjectItem {
  id: string
  name?: string
  code?: string
  status?: string
}

interface CrmProjectsResponse {
  items?: CrmProjectItem[]
}

const { locale, t } = useI18n()
const { scopedRecruitPath } = useRecruitScopedApi()
const LOCATION_PROMPTED_KEY = 'home.local-context.prompted'
const LAST_COORDS_KEY = 'home.local-context.coords'

const isLoading = ref(false)
const permissionDenied = ref(false)
const loadError = ref('')
const isLocationModalOpen = ref(false)
const localContext = ref<LocalContextResponse | null>(null)
const featuredJobs = ref<RecruitJobItem[]>([])
const featuredProjects = ref<CrmProjectItem[]>([])

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

function uniqByKey<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>()

  return items.filter((item) => {
    const key = getKey(item)

    if (!key || seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function pickRandomItems<T>(items: T[], count: number) {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[randomIndex]
    shuffled[randomIndex] = current
  }

  return shuffled.slice(0, count)
}

async function loadRecommendations() {
  const [jobsResult, projectsResult] = await Promise.allSettled([
    $fetch<RecruitJobsListResponse>(scopedRecruitPath('/public/jobs'), {
      query: { limit: 12, page: 1 },
    }),
    $fetch<CrmProjectsResponse>('/api/world/crm/general/projects'),
  ])

  featuredJobs.value =
    jobsResult.status === 'fulfilled'
      ? pickRandomItems(
          uniqByKey(
            jobsResult.value.items ?? [],
            (item) => item.slug || item.id,
          ),
          2,
        )
      : []

  featuredProjects.value =
    projectsResult.status === 'fulfilled'
      ? pickRandomItems(
          uniqByKey(projectsResult.value.items ?? [], (item) => item.id),
          2,
        )
      : []
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
    await loadRecommendations()
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

    <div v-if="isLoading">
      <v-card-text class="py-6 text-center">
        <v-progress-circular
          class="mb-3"
          indeterminate
          color="primary"
          size="24"
          width="3"
        />
        <div class="text-body-2">
          {{ $t('home.rightNav.localContext.stateLoading') }}
        </div>
      </v-card-text>
    </div>

    <div v-else-if="permissionDenied">
      <v-card-text class="py-6 text-center">
        <v-icon
          icon="mdi-map-marker-off-outline"
          color="warning"
          class="mb-3"
        />
        <div class="text-body-2 mb-3">
          {{ $t('home.rightNav.localContext.statePermissionDenied') }}
        </div>
        <v-btn
          color="primary"
          variant="tonal"
          size="small"
          @click="requestLocation"
        >
          {{ $t('home.rightNav.localContext.permissionCta') }}
        </v-btn>
      </v-card-text>
    </div>

    <div v-else-if="loadError">
      <v-card-text class="py-6 text-center">
        <v-icon icon="mdi-alert-circle-outline" color="error" class="mb-3" />
        <div class="text-body-2 mb-2">
          {{ $t('home.rightNav.localContext.stateError') }}
        </div>
        <div class="text-caption text-medium-emphasis mb-3">
          {{ loadError }}
        </div>
        <v-btn
          color="primary"
          variant="tonal"
          size="small"
          @click="requestLocation"
        >
          {{ $t('home.rightNav.localContext.retryCta') }}
        </v-btn>
      </v-card-text>
    </div>

    <div v-else-if="!hasContext">
      <v-card-text class="py-6 text-center">
        <v-icon icon="mdi-crosshairs-gps" color="primary" class="mb-3" />
        <div class="text-body-2 mb-3">
          {{ $t('home.rightNav.localContext.stateInitial') }}
        </div>
        <v-btn color="primary" size="small" @click="requestLocation">
          {{ $t('home.rightNav.localContext.permissionCta') }}
        </v-btn>
      </v-card-text>
    </div>

    <div v-else-if="localContext">
      <v-card-item>
        <template #prepend>
          <v-icon icon="mdi-weather-partly-cloudy" color="primary" />
        </template>
        <div class="text-h6">
          {{ $t('home.rightNav.localContext.weatherTitle') }}
        </div>
      </v-card-item>
      <v-card-text class="pt-0">
        <div class="text-h5 font-weight-bold">{{ weatherSummary }}</div>
        <div class="text-caption text-medium-emphasis">
          {{ new Date(localContext.weather.observedAt).toLocaleString() }}
        </div>
      </v-card-text>
      <v-card-item>
        <template #prepend>
          <v-icon icon="mdi-briefcase-variant-outline" color="primary" />
        </template>
        <div class="text-h6">
          {{ $t('home.rightNav.localContext.jobsTitle') }}
        </div>
      </v-card-item>
      <v-list density="compact" lines="two">
        <v-list-item
          v-for="job in featuredJobs"
          :key="job.id"
          :to="`/world/jobs/offers/${job.slug}`"
        >
          <v-list-item-title>{{ job.title }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ job.company?.name || '—' }}
            <span v-if="job.location"> · {{ job.location }}</span>
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-if="!featuredJobs.length">
          <v-list-item-title>{{
            $t('home.rightNav.localContext.emptyState')
          }}</v-list-item-title>
        </v-list-item>
      </v-list>
      <v-card-item>
        <template #prepend>
          <v-icon icon="mdi-folder-outline" color="primary" />
        </template>
        <div class="text-h6">
          {{ $t('home.rightNav.localContext.projectsTitle') }}
        </div>
      </v-card-item>
      <v-list density="compact" lines="two">
        <v-list-item
          v-for="project in featuredProjects"
          :key="project.id"
          :to="`/world/crm/projects/${project.id}`"
        >
          <v-list-item-title>{{
            project.name || project.code || project.id
          }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ project.code || '—' }}
            <span v-if="project.status"> · {{ project.status }}</span>
          </v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-if="!featuredProjects.length">
          <v-list-item-title>{{
            $t('home.rightNav.localContext.emptyState')
          }}</v-list-item-title>
        </v-list-item>
      </v-list>
      <div class="px-4 pb-4">
        <v-btn
          block
          color="primary"
          variant="tonal"
          prepend-icon="mdi-file-account-outline"
          to="/resume/create"
        >
          Build your resume
        </v-btn>
      </div>
    </div>
  </div>
</template>
