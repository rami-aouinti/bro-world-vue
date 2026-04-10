<script setup lang="ts">
import { storeToRefs } from 'pinia'

interface UpcomingCalendarEvent {
  id: string
  title: string
  startAt: string
}

const { locale } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()
const profileStore = useProfileStore()
const { profile, loading, error } = storeToRefs(profileStore)
const upcomingEvents = ref<UpcomingCalendarEvent[]>([])

const proverbs = [
  'Petit à petit, l’oiseau fait son nid.',
  'Après la pluie, le beau temps.',
  'Qui va doucement va sûrement.',
  'Le succès sourit aux patients.',
]

const displayedText = ref('')
const activeTextIndex = ref(0)
const charIndex = ref(0)
const isTyping = ref(true)
let typingInterval: ReturnType<typeof setInterval> | null = null
let typingTimeout: ReturnType<typeof setTimeout> | null = null

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
const rightPanelTexts = computed(() => {
  const upcomingLabel = upcomingEvents.value[0]
    ? `Événement imminent: ${upcomingEvents.value[0].title}`
    : null

  return upcomingLabel ? [upcomingLabel, ...proverbs] : [...proverbs]
})

const hasUpcomingEvents = computed(() => upcomingEvents.value.length > 0)

function clearTypewriterTimers() {
  if (typingInterval) {
    clearInterval(typingInterval)
    typingInterval = null
  }
  if (typingTimeout) {
    clearTimeout(typingTimeout)
    typingTimeout = null
  }
}

function startTypewriter() {
  clearTypewriterTimers()

  if (!rightPanelTexts.value.length) {
    displayedText.value = ''
    return
  }

  isTyping.value = true
  typingInterval = setInterval(() => {
    const activeText = rightPanelTexts.value[activeTextIndex.value] || ''
    if (isTyping.value) {
      if (charIndex.value < activeText.length) {
        displayedText.value += activeText.charAt(charIndex.value)
        charIndex.value += 1
      } else {
        isTyping.value = false
        typingTimeout = setTimeout(() => {
          displayedText.value = ''
          charIndex.value = 0
          activeTextIndex.value =
            (activeTextIndex.value + 1) % rightPanelTexts.value.length
          isTyping.value = true
        }, 1800)
      }
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

watch(rightPanelTexts, () => {
  displayedText.value = ''
  activeTextIndex.value = 0
  charIndex.value = 0
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
        <v-card rounded="xl" variant="tonal">
          <v-card-title>À venir</v-card-title>
          <v-card-text>
            <p class="text-body-2 text-medium-emphasis mb-3">
              {{ displayedText }}
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
              Aucun événement à venir pour le moment.
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
