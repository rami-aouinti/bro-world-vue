<script setup lang="ts">
import { privateApi } from '~/utils/http/privateApi'

definePageMeta({ title: 'Learning Paths' })
const { t } = useI18n()

interface CohortSession {
  id: string
  title: string
  startAt: string
  endAt: string
  location: string
}

interface LearningCohort {
  id: string
  pathName: string
  status: 'draft' | 'open' | 'in_progress' | 'completed'
  capacity: number
  trainers: string[]
  sessions: CohortSession[]
  registrations: string[]
  waitlist: string[]
  syncedAt: string | null
}

interface CohortNotification {
  id: string
  createdAt: string
  type: 'registration' | 'waitlist' | 'calendar' | 'reminder'
  title: string
  message: string
}

const learningNavItems = [
  {
    title: 'Overview Learning',
    to: '/world/learning',
    icon: 'mdi-view-dashboard-outline',
  },
  {
    title: 'Courses',
    to: '/world/learning/courses',
    icon: 'mdi-book-open-page-variant-outline',
  },
  { title: 'Levels', to: '/world/learning/levels', icon: 'mdi-stairs' },
  { title: 'Paths', to: '/world/learning/paths', icon: 'mdi-map-marker-path' },
  {
    title: 'Admin',
    to: '/world/learning/admin',
    icon: 'mdi-shield-crown-outline',
  },
]

const cohorts = ref<LearningCohort[]>([
  {
    id: 'cohort-foundations-q2',
    pathName: 'Product Foundations',
    status: 'open',
    capacity: 12,
    trainers: ['Nadia B.', 'Yanis L.'],
    sessions: [
      {
        id: 'session-found-01',
        title: 'Kickoff cohort',
        startAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
        endAt: new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 90,
        ).toISOString(),
        location: 'Room Atlas',
      },
      {
        id: 'session-found-02',
        title: 'Case study lab',
        startAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
        endAt: new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 10 + 1000 * 60 * 90,
        ).toISOString(),
        location: 'Room Atlas',
      },
    ],
    registrations: [
      'chloe@academy.io',
      'samir@academy.io',
      'antoine@academy.io',
    ],
    waitlist: [],
    syncedAt: null,
  },
])

const notifications = ref<CohortNotification[]>([])
const selectedCohortId = ref(cohorts.value[0]?.id || '')
const isSyncingCalendar = ref(false)

const newCohortForm = reactive({
  pathName: '',
  capacity: 10,
  trainersInput: '',
})

const newSessionForm = reactive({
  title: '',
  startAt: '',
  endAt: '',
  location: '',
})

const registrationForm = reactive({
  learnerEmail: '',
})

const draftSessions = ref<CohortSession[]>([])

const selectedCohort = computed(
  () =>
    cohorts.value.find((cohort) => cohort.id === selectedCohortId.value) ||
    null,
)

const occupancyRate = computed(() => {
  if (!selectedCohort.value || selectedCohort.value.capacity <= 0) return 0
  return Math.min(
    100,
    Math.round(
      (selectedCohort.value.registrations.length /
        selectedCohort.value.capacity) *
        100,
    ),
  )
})

const sortedNotifications = computed(() => {
  return [...notifications.value].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
})

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function addNotification(
  type: CohortNotification['type'],
  title: string,
  message: string,
) {
  notifications.value.unshift({
    id: makeId('notif'),
    createdAt: new Date().toISOString(),
    type,
    title,
    message,
  })
}

function addDraftSession() {
  if (!newSessionForm.title || !newSessionForm.startAt || !newSessionForm.endAt)
    return

  draftSessions.value.push({
    id: makeId('session'),
    title: newSessionForm.title.trim(),
    startAt: new Date(newSessionForm.startAt).toISOString(),
    endAt: new Date(newSessionForm.endAt).toISOString(),
    location: newSessionForm.location.trim() || 'TBD',
  })

  newSessionForm.title = ''
  newSessionForm.startAt = ''
  newSessionForm.endAt = ''
  newSessionForm.location = ''
}

function createCohort() {
  if (!newCohortForm.pathName.trim() || newCohortForm.capacity <= 0) return

  const trainers = newCohortForm.trainersInput
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)

  const cohort: LearningCohort = {
    id: makeId('cohort'),
    pathName: newCohortForm.pathName.trim(),
    status: 'open',
    capacity: Number(newCohortForm.capacity),
    trainers,
    sessions: [...draftSessions.value],
    registrations: [],
    waitlist: [],
    syncedAt: null,
  }

  cohorts.value.unshift(cohort)
  selectedCohortId.value = cohort.id
  addNotification(
    'calendar',
    t('world.learning.paths.notifications.cohortCreatedTitle', 'New cohort created'),
    `Cohort ${cohort.pathName} is ready with ${cohort.sessions.length} session(s).`,
  )

  newCohortForm.pathName = ''
  newCohortForm.capacity = 10
  newCohortForm.trainersInput = ''
  draftSessions.value = []
}

function registerLearner() {
  const cohort = selectedCohort.value
  if (!cohort) return

  const learner = registrationForm.learnerEmail.trim().toLowerCase()
  if (!learner) return

  if (
    cohort.registrations.includes(learner) ||
    cohort.waitlist.includes(learner)
  ) {
    registrationForm.learnerEmail = ''
    return
  }

  if (cohort.registrations.length < cohort.capacity) {
    cohort.registrations.push(learner)
    addNotification(
      'registration',
      t('world.learning.paths.notifications.registrationConfirmedTitle', 'Registration confirmed'),
      `${learner} registered in ${cohort.pathName}.`,
    )
  } else {
    cohort.waitlist.push(learner)
    addNotification(
      'waitlist',
      t('world.learning.paths.notifications.waitlistEnabledTitle', 'Waitlist enabled'),
      `${learner} added to waitlist for ${cohort.pathName}.`,
    )
  }

  registrationForm.learnerEmail = ''
}

function promoteFromWaitlist() {
  const cohort = selectedCohort.value
  if (
    !cohort ||
    cohort.waitlist.length === 0 ||
    cohort.registrations.length >= cohort.capacity
  )
    return

  const next = cohort.waitlist.shift()
  if (!next) return

  cohort.registrations.push(next)
  addNotification(
    'registration',
    t('world.learning.paths.notifications.promotedFromWaitlistTitle', 'Promoted from waitlist'),
    `${next} moved from waitlist to registrations in ${cohort.pathName}.`,
  )
}

async function syncSessionsWithCalendar() {
  const cohort = selectedCohort.value
  if (!cohort || cohort.sessions.length === 0) return

  isSyncingCalendar.value = true

  try {
    for (const session of cohort.sessions) {
      await privateApi.request('/api/calendar/private/events', {
        method: 'POST',
        body: {
          title: `[Learning] ${cohort.pathName} · ${session.title}`,
          description: `Cohort ${cohort.id} · Trainers: ${cohort.trainers.join(', ') || 'TBD'}`,
          startAt: session.startAt,
          endAt: session.endAt,
          isAllDay: false,
          location: session.location,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      })

      const reminderStart = new Date(
        new Date(session.startAt).getTime() - 1000 * 60 * 60 * 24,
      )
      const reminderEnd = new Date(reminderStart.getTime() + 1000 * 60 * 30)

      await privateApi.request('/api/calendar/private/events', {
        method: 'POST',
        body: {
          title: `[Reminder] ${cohort.pathName} · ${session.title}`,
          description: `Automatic D-1 reminder for session ${session.title}`,
          startAt: reminderStart.toISOString(),
          endAt: reminderEnd.toISOString(),
          isAllDay: false,
          location: session.location,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      })

      addNotification(
        'reminder',
        t('world.learning.paths.notifications.reminderScheduledTitle', 'Reminder scheduled'),
        `Automatic reminder created for session ${session.title} (${cohort.pathName}).`,
      )
    }

    cohort.syncedAt = new Date().toISOString()
    addNotification(
      'calendar',
      t('world.learning.paths.notifications.calendarSyncSuccessTitle', 'Calendar sync successful'),
      `${cohort.sessions.length} session(s) synced to the calendar module.`,
    )
  } catch (error) {
    console.error(error)
    addNotification(
      'calendar',
      t('world.learning.paths.notifications.calendarSyncErrorTitle', 'Sync error'),
      'Calendar sync failed. Check API connectivity.',
    )
  } finally {
    isSyncingCalendar.value = false
  }
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.learning.label', 'Learning')"
      module-icon="mdi-school-outline"
      :module-description="t('world.learning.paths.moduleDescription', 'Full navigation for the Learning module.')"
      :nav-items="learningNavItems"
      :action-label="t('world.learning.paths.actions.createCohort', 'Create cohort')"
    />

    <v-container fluid>
      <v-row>
        <v-col cols="12" lg="4">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card mb-4">
            <h2 class="text-h6 mb-1">{{ t('world.learning.paths.sections.newCohort', 'New cohort') }}</h2>
            <p class="text-medium-emphasis mb-4">
              {{ t('world.learning.paths.cohortDescription', 'Cohort-based paths with capacity, assigned trainers, and session dates.') }}
            </p>
            <v-text-field
              v-model="newCohortForm.pathName"
              :label="t('world.learning.paths.fields.path', 'Path')"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model.number="newCohortForm.capacity"
              type="number"
              :label="t('world.learning.paths.fields.capacity', 'Capacity')"
              min="1"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="newCohortForm.trainersInput"
              :label="t('world.learning.paths.fields.trainers', 'Trainers (comma-separated)')"
              variant="outlined"
              class="mb-4"
            />

            <v-divider class="mb-4" />
            <h3 class="text-subtitle-1 mb-2">{{ t('world.learning.paths.sections.addSession', 'Add a session') }}</h3>
            <v-text-field
              v-model="newSessionForm.title"
              :label="t('world.learning.paths.fields.sessionTitle', 'Session title')"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="newSessionForm.startAt"
              type="datetime-local"
              :label="t('world.learning.paths.fields.start', 'Start')"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="newSessionForm.endAt"
              type="datetime-local"
              :label="t('world.learning.paths.fields.end', 'End')"
              variant="outlined"
              class="mb-2"
            />
            <v-text-field
              v-model="newSessionForm.location"
              :label="t('world.learning.paths.fields.location', 'Room / location')"
              variant="outlined"
              class="mb-2"
            />

            <v-btn
              block
              variant="tonal"
              prepend-icon="mdi-plus"
              class="mb-3"
              @click="addDraftSession"
            >
              {{ t('world.learning.paths.actions.addToDraft', 'Add to cohort draft') }}
            </v-btn>

            <v-list v-if="draftSessions.length" density="compact" class="mb-4">
              <v-list-item
                v-for="session in draftSessions"
                :key="session.id"
                :title="session.title"
                :subtitle="`${new Date(session.startAt).toLocaleString()} · ${session.location}`"
                prepend-icon="mdi-calendar-outline"
              />
            </v-list>

            <v-btn
              color="primary"
              block
              prepend-icon="mdi-content-save"
              @click="createCohort"
            >
              {{ t('world.learning.paths.actions.createCohort', 'Create cohort') }}
            </v-btn>
          </v-card>
        </v-col>

        <v-col cols="12" lg="8">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card mb-4">
            <div
              class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4"
            >
              <div>
                <h2 class="text-h6 mb-1">{{ t('world.learning.paths.sections.cohortOperations', 'Cohort operations') }}</h2>
                <p class="text-medium-emphasis mb-0">
                  {{ t('world.learning.paths.labels.syncWith', 'Sync with') }}
                  <NuxtLink to="/calendar">{{ t('world.learning.paths.labels.calendar', 'calendar') }}</NuxtLink>, {{ t('world.learning.paths.labels.registrationsAndReminders', 'manage registrations/waitlist and reminders.') }}
                </p>
              </div>
              <v-select
                v-model="selectedCohortId"
                :label="t('world.learning.paths.fields.cohort', 'Cohort')"
                :items="
                  cohorts.map((cohort) => ({
                    title: `${cohort.pathName} (${cohort.id})`,
                    value: cohort.id,
                  }))
                "
                variant="outlined"
                density="comfortable"
                hide-details
                style="min-width: 300px"
              />
            </div>

            <template v-if="selectedCohort">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="pa-3 h-100">
                    <p class="text-caption text-medium-emphasis mb-1">
                      {{ t('world.learning.paths.labels.capacity', 'Capacity') }}
                    </p>
                    <p class="text-h6 mb-2">
                      {{ selectedCohort.registrations.length }} /
                      {{ selectedCohort.capacity }}
                    </p>
                    <v-progress-linear
                      :model-value="occupancyRate"
                      color="primary"
                      height="8"
                      rounded
                    />
                    <p class="text-caption mt-2 mb-0">
                      {{ occupancyRate }}% {{ t('world.learning.paths.labels.filled', 'filled') }}
                    </p>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="pa-3 h-100">
                    <p class="text-caption text-medium-emphasis mb-1">
                      {{ t('world.learning.paths.labels.assignedTrainers', 'Assigned trainers') }}
                    </p>
                    <v-chip-group>
                      <v-chip
                        v-for="trainer in selectedCohort.trainers"
                        :key="trainer"
                        size="small"
                        color="primary"
                        variant="tonal"
                      >
                        {{ trainer }}
                      </v-chip>
                      <v-chip
                        v-if="!selectedCohort.trainers.length"
                        size="small"
                        variant="outlined"
                        >{{ t('world.learning.paths.alerts.noAssignedTrainer', 'No assigned trainer') }}</v-chip
                      >
                    </v-chip-group>
                    <p class="text-caption mt-2 mb-0">
                      {{ t('world.learning.paths.labels.lastSync', 'Last sync:') }}
                      {{
                        selectedCohort.syncedAt
                          ? new Date(selectedCohort.syncedAt).toLocaleString()
                          : t('world.learning.paths.labels.never', 'Never')
                      }}
                    </p>
                  </v-card>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <h3 class="text-subtitle-1 mb-2">{{ t('world.learning.paths.sections.scheduledSessions', 'Scheduled sessions') }}</h3>
              <v-list density="comfortable" class="mb-4">
                <v-list-item
                  v-for="session in selectedCohort.sessions"
                  :key="session.id"
                  prepend-icon="mdi-calendar-clock"
                  :title="session.title"
                  :subtitle="`${new Date(session.startAt).toLocaleString()} → ${new Date(session.endAt).toLocaleString()} · ${session.location}`"
                />
                <v-list-item
                  v-if="!selectedCohort.sessions.length"
                  :title="t('world.learning.paths.alerts.noSession', 'No session')"
                  :subtitle="t('world.learning.paths.alerts.addSessionInLeftForm', 'Add sessions in the form on the left.')"
                />
              </v-list>

              <v-btn
                color="primary"
                prepend-icon="mdi-calendar-sync"
                :loading="isSyncingCalendar"
                class="mb-6"
                @click="syncSessionsWithCalendar"
              >
                {{ t('world.learning.paths.actions.syncCalendarAndReminders', 'Sync to calendar + reminders') }}
              </v-btn>

              <v-divider class="mb-4" />

              <h3 class="text-subtitle-1 mb-2">
                {{ t('world.learning.paths.sections.registrationAndWaitlist', 'Registrations & waitlist') }}
              </h3>
              <v-row class="mb-1">
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="registrationForm.learnerEmail"
                    :label="t('world.learning.paths.fields.learnerEmail', 'Learner email')"
                    type="email"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" md="4" class="d-flex ga-2">
                  <v-btn color="primary" block @click="registerLearner"
                    >{{ t('world.learning.paths.actions.register', 'Register') }}</v-btn
                  >
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="pa-3 h-100">
                    <p class="text-caption text-medium-emphasis mb-2">
                      {{ t('world.learning.paths.labels.registered', 'Registered') }}
                    </p>
                    <v-list density="compact">
                      <v-list-item
                        v-for="learner in selectedCohort.registrations"
                        :key="`registered-${learner}`"
                        :title="learner"
                        prepend-icon="mdi-account-check-outline"
                      />
                      <v-list-item
                        v-if="!selectedCohort.registrations.length"
                        :title="t('world.learning.paths.alerts.noRegisteredLearner', 'No registered learner')"
                      />
                    </v-list>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="pa-3 h-100">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <p class="text-caption text-medium-emphasis mb-0">
                        {{ t('world.learning.paths.labels.waitlist', 'Waitlist') }}
                      </p>
                      <v-btn
                        size="small"
                        variant="tonal"
                        prepend-icon="mdi-account-arrow-up"
                        @click="promoteFromWaitlist"
                      >
                        {{ t('world.learning.paths.actions.promote', 'Promote') }}
                      </v-btn>
                    </div>
                    <v-list density="compact">
                      <v-list-item
                        v-for="learner in selectedCohort.waitlist"
                        :key="`wait-${learner}`"
                        :title="learner"
                        prepend-icon="mdi-timer-sand"
                      />
                      <v-list-item
                        v-if="!selectedCohort.waitlist.length"
                        :title="t('world.learning.paths.alerts.emptyWaitlist', 'No waitlist')"
                      />
                    </v-list>
                  </v-card>
                </v-col>
              </v-row>
            </template>
          </v-card>

          <v-card rounded="xl" class="pa-4 postcard-gradient-card">
            <h3 class="text-subtitle-1 mb-3">{{ t('world.learning.paths.sections.automaticNotifications', 'Automatic notifications') }}</h3>
            <v-list density="comfortable">
              <v-list-item
                v-for="item in sortedNotifications"
                :key="item.id"
                :title="item.title"
                :subtitle="`${item.message} · ${new Date(item.createdAt).toLocaleString()}`"
                :prepend-icon="
                  item.type === 'waitlist'
                    ? 'mdi-account-clock-outline'
                    : item.type === 'reminder'
                      ? 'mdi-bell-ring-outline'
                      : 'mdi-bell-outline'
                "
              />
              <v-list-item
                v-if="!sortedNotifications.length"
                :title="t('world.learning.paths.alerts.noNotification', 'No notification')"
                :subtitle="t('world.learning.paths.notifications.autoSubtitle', 'Notifications are automatically created during registrations, promotions, and calendar synchronizations.')"
              />
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
