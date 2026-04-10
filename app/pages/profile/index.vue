<script setup lang="ts">
import { storeToRefs } from 'pinia'

interface UpcomingCalendarEvent {
  id: string
  title: string
  startAt: string
}

const { t, locale } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()
const profileStore = useProfileStore()
const { profile, loading, error } = storeToRefs(profileStore)
const upcomingEvents = ref<UpcomingCalendarEvent[]>([])

const displayedProverbs = ref<string[]>([])
let typingInterval: ReturnType<typeof setInterval> | null = null

const fullName = computed(() => {
  const user = profile.value
  if (!user) {
    return ''
  }

  return (
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username
  )
})

const profileTitle = computed(() => profile.value?.profile?.title || 'Member')
const profileInformation = computed(
  () => profile.value?.profile?.information || '',
)
const proverbTexts = computed(() => [
  t('pages.profile.rightRail.proverbs.0'),
  t('pages.profile.rightRail.proverbs.1'),
  t('pages.profile.rightRail.proverbs.2'),
])

const hasUpcomingEvents = computed(() => upcomingEvents.value.length > 0)
const nextEventLabel = computed(() =>
  upcomingEvents.value[0]
    ? t('pages.profile.rightRail.nextEvent', {
        title: upcomingEvents.value[0].title,
      })
    : '',
)

function clearTypewriterTimers() {
  if (typingInterval) {
    clearInterval(typingInterval)
    typingInterval = null
  }
}

function startTypewriter() {
  clearTypewriterTimers()
  displayedProverbs.value = proverbTexts.value.map(() => '')
  const charIndexes = proverbTexts.value.map(() => 0)
  typingInterval = setInterval(() => {
    let hasRemainingChars = false
    proverbTexts.value.forEach((text, index) => {
      const cursor = charIndexes[index] ?? 0
      if (cursor < text.length) {
        displayedProverbs.value[index] =
          (displayedProverbs.value[index] ?? '') + text.charAt(cursor)
        charIndexes[index] += 1
        hasRemainingChars = true
      }
    })

    if (!hasRemainingChars) {
      clearTypewriterTimers()
    }
  }, 45)
}

async function fetchProfile(force = false) {
  try {
    await profileStore.fetchProfile(force)
  } catch {
    // Error state handled by store.
  }
}

async function fetchUpcomingEvents() {
  try {
    const response = await $fetch<UpcomingCalendarEvent[]>(
      '/api/calendar/events/upcoming',
    )
    upcomingEvents.value = (response || [])
      .slice()
      .sort(
        (first, second) =>
          new Date(first.startAt).getTime() -
          new Date(second.startAt).getTime(),
      )
      .slice(0, 5)
  } catch (fetchError) {
    console.error(fetchError)
    upcomingEvents.value = []
  }
}

definePageMeta({
  layout: 'profile',
  title: 'appbar.profile',
  middleware: 'auth',
})

onMounted(async () => {
  await Promise.all([fetchProfile(), fetchUpcomingEvents()])
  startTypewriter()
})

watch([proverbTexts, locale], () => {
  startTypewriter()
})

onUnmounted(() => {
  clearTypewriterTimers()
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <v-card rounded="xl" variant="text" class="postcard-gradient-card">
          <v-card-title>{{ t('pages.profile.rightRail.title') }}</v-card-title>
          <v-card-text>
            <p v-if="nextEventLabel" class="text-body-2 mb-3">
              {{ nextEventLabel }}
            </p>
            <p
              v-for="(proverb, index) in displayedProverbs"
              :key="`proverb-${index}`"
              class="text-body-2 text-medium-emphasis mb-2"
            >
              {{ proverb }}
            </p>

            <v-list v-if="hasUpcomingEvents" density="compact" class="pa-0">
              <v-list-item
                v-for="event in upcomingEvents"
                :key="event.id"
                prepend-icon="mdi-calendar-clock-outline"
                :title="event.title"
                :subtitle="new Date(event.startAt).toLocaleString(locale)"
              />
            </v-list>
            <p v-else class="text-body-2 text-medium-emphasis mb-0">
              {{ t('pages.profile.rightRail.emptyUpcoming') }}
            </p>
          </v-card-text>
        </v-card>
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible && loading" />
      <template v-else>
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
        >
          {{ error }}
        </v-alert>

        <v-card v-if="profile" variant="text" class="postcard-gradient-card">
          <v-card-text
            class="d-flex flex-column flex-md-row ga-4 align-start align-md-center"
          >
            <v-avatar size="84">
              <v-img :src="profile.photo" :alt="fullName" />
            </v-avatar>

            <div class="flex-grow-1">
              <h2 class="text-h5 mb-1">{{ fullName }}</h2>
              <p class="text-body-2 text-medium-emphasis mb-1">
                @{{ profile.username }}
              </p>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ profile.email }}
              </p>
            </div>

            <div class="d-flex flex-wrap ga-2">
              <v-chip color="amber-darken-2" label>
                {{ profile.coins }} coins
              </v-chip>
              <v-chip color="primary" variant="outlined" label>
                {{ profileTitle }}
              </v-chip>
            </div>
          </v-card-text>

          <v-divider />

          <v-card-text>
            <p class="text-body-1 mb-0">
              {{ profileInformation || 'No profile information yet.' }}
            </p>
          </v-card-text>
        </v-card>
      </template>
    </v-container>
  </div>
</template>
