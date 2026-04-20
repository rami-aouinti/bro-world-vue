<script setup lang="ts">
import { privateApi } from '~/utils/http/privateApi'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin, { Draggable } from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'

interface PrivateCalendarEvent {
  id: string
  title: string
  description: string | null
  startAt: string
  endAt: string
  status: string
  visibility: string
  location: string | null
  isAllDay: boolean
  timezone: string | null
  isCancelled: boolean
  url: string | null
  color: string | null
  backgroundColor: string | null
  borderColor: string | null
  textColor: string | null
}

interface PrivateEventsResponse {
  items: PrivateCalendarEvent[]
}

interface EventMutationPayload {
  title: string
  description: string | null
  startAt: string
  endAt: string
  isAllDay: boolean
  location: string | null
  timezone: string
}

interface PresetCalendarEvent {
  key: string
  titleKey: string
  color: string
}

interface GoogleCalendarEvent {
  id: string
  title: string
  description: string | null
  startAt: string
  endAt: string
  location: string | null
  htmlLink: string | null
}

interface GoogleConnectResponse {
  authorizationUrl: string
}

interface GoogleCallbackMessage {
  source: 'google-calendar-oauth'
  token?: string
  events?: GoogleCalendarEvent[]
  error?: string
}

const { t, locale } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()

definePageMeta({
  title: 'appbar.calendar',
  middleware: 'auth',
})

const isLoading = ref(false)
const isSaving = ref(false)
const isGoogleConnecting = ref(false)
const errorMessage = ref('')
const googleToken = ref('')
const googleEvents = ref<GoogleCalendarEvent[]>([])
const calendarEvents = ref<PrivateCalendarEvent[]>([])
const upcomingEvents = ref<PrivateCalendarEvent[]>([])
const selectedEvent = ref<PrivateCalendarEvent | null>(null)
const dialogOpen = ref(false)
const presetEventsHost = ref<HTMLElement | null>(null)
let presetEventsDraggable: Draggable | null = null

const form = reactive({
  title: '',
  description: '',
  startAt: '',
  endAt: '',
  location: '',
  isAllDay: false,
})

const isEditing = computed(() => Boolean(selectedEvent.value))
const currentTimezone = computed(
  () => Intl.DateTimeFormat().resolvedOptions().timeZone,
)
const maskedGoogleToken = computed(() => {
  const token = googleToken.value.trim()
  if (!token) return ''
  if (token.length <= 8) return token
  return `${token.slice(0, 4)}...${token.slice(-4)}`
})

const fullCalendarEvents = computed(() => {
  return calendarEvents.value
    .filter((event) => !event.isCancelled)
    .map((event) => {
      return {
        id: event.id,
        title: event.title,
        start: event.startAt,
        end: event.endAt,
        allDay: event.isAllDay,
        backgroundColor: event.backgroundColor || event.color || undefined,
        borderColor: event.borderColor || event.color || undefined,
        textColor: event.textColor || undefined,
        extendedProps: {
          raw: event,
        },
      }
    })
})

const presetEvents = computed<PresetCalendarEvent[]>(() => [
  {
    key: 'meeting',
    titleKey: 'pages.calendar.presets.meeting',
    color: '#2e7d32',
  },
  { key: 'party', titleKey: 'pages.calendar.presets.party', color: '#c62828' },
  {
    key: 'training',
    titleKey: 'pages.calendar.presets.training',
    color: '#1565c0',
  },
  {
    key: 'deadline',
    titleKey: 'pages.calendar.presets.deadline',
    color: '#6a1b9a',
  },
])

const calendarOptions = computed(() => {
  return {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    buttonText: {
      today: t('pages.calendar.today'),
      month: t('pages.calendar.month'),
      week: t('pages.calendar.week'),
      day: t('pages.calendar.day'),
    },
    selectable: true,
    editable: true,
    droppable: true,
    events: fullCalendarEvents.value,
    select: (selectionInfo: { startStr: string; endStr: string }) => {
      openCreateDialog(selectionInfo.startStr, selectionInfo.endStr)
    },
    eventClick: (clickInfo: {
      event: { extendedProps: { raw?: PrivateCalendarEvent } }
    }) => {
      const event = clickInfo.event.extendedProps.raw as
        | PrivateCalendarEvent
        | undefined
      if (event) openEditDialog(event)
    },
    drop: onExternalDrop,
    eventDrop: onEventDrop,
    height: 'auto',
  }
})

function toInputDateTime(value: string | null) {
  if (!value) return ''

  const date = new Date(value)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

function toApiDateTime(value: string) {
  return new Date(value).toISOString()
}

function fillForm(event?: PrivateCalendarEvent) {
  form.title = event?.title ?? ''
  form.description = event?.description ?? ''
  form.startAt = event ? toInputDateTime(event.startAt) : ''
  form.endAt = event ? toInputDateTime(event.endAt) : ''
  form.location = event?.location ?? ''
  form.isAllDay = event?.isAllDay ?? false
}

function openCreateDialog(start?: string, end?: string) {
  selectedEvent.value = null
  fillForm()

  if (start) form.startAt = toInputDateTime(start)
  if (end) form.endAt = toInputDateTime(end)

  dialogOpen.value = true
}

function openEditDialog(event: PrivateCalendarEvent) {
  selectedEvent.value = event
  fillForm(event)
  dialogOpen.value = true
}

async function loadEvents() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [privateResponse, upcomingResponse] = await Promise.all([
      privateApi.request<PrivateEventsResponse>('/api/calendar/private/events'),
      $fetch<PrivateCalendarEvent[]>('/api/calendar/events/upcoming'),
    ])

    calendarEvents.value = privateResponse.items || []
    upcomingEvents.value = upcomingResponse || []
  } catch (error) {
    errorMessage.value = t('pages.calendar.errors.loadFailed')
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

function buildPayload(): EventMutationPayload {
  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    startAt: toApiDateTime(form.startAt),
    endAt: toApiDateTime(form.endAt),
    isAllDay: form.isAllDay,
    location: form.location.trim() || null,
    timezone: currentTimezone.value,
  }
}

async function connectGoogleCalendar() {
  isGoogleConnecting.value = true

  const popup = window.open(
    '',
    'google-calendar-oauth',
    'width=520,height=720',
  )

  if (!popup) {
    errorMessage.value = t('pages.calendar.errors.googleConnectFailed')
    console.error(new Error('Google popup blocked'))
    isGoogleConnecting.value = false
    return
  }

  popup.document.title = 'Google Calendar OAuth'

  try {
    const response = await $fetch<GoogleConnectResponse>(
      '/api/calendar/google/connect',
    )

    if (!response.authorizationUrl) {
      throw new Error('Missing Google authorization URL')
    }

    popup.location.href = response.authorizationUrl
    popup.focus()
  } catch (error) {
    popup.close()
    errorMessage.value = t('pages.calendar.errors.googleConnectFailed')
    console.error(error)
    isGoogleConnecting.value = false
  }
}

function onGoogleOAuthMessage(rawEvent: MessageEvent<unknown>) {
  const data = rawEvent.data as GoogleCallbackMessage | undefined
  if (!data || data.source !== 'google-calendar-oauth') return

  isGoogleConnecting.value = false

  if (data.error) {
    errorMessage.value = t('pages.calendar.errors.googleConnectFailed')
    console.error(data.error)
    return
  }

  googleToken.value = data.token ?? ''
  googleEvents.value = data.events ?? []
}

async function onEventDrop(dropInfo: {
  event: {
    id: string
    start: Date | null
    end: Date | null
    allDay: boolean
  }
  revert: () => void
}) {
  const movedEvent = calendarEvents.value.find(
    (event) => event.id === dropInfo.event.id,
  )
  if (!movedEvent || !dropInfo.event.start) {
    dropInfo.revert()
    return
  }

  const previousDurationMs =
    new Date(movedEvent.endAt).getTime() -
    new Date(movedEvent.startAt).getTime()
  const fallbackEnd = new Date(
    dropInfo.event.start.getTime() +
      (previousDurationMs > 0 ? previousDurationMs : 60 * 60 * 1000),
  )

  const payload: EventMutationPayload = {
    title: movedEvent.title,
    description: movedEvent.description,
    startAt: dropInfo.event.start.toISOString(),
    endAt: (dropInfo.event.end || fallbackEnd).toISOString(),
    isAllDay: dropInfo.event.allDay,
    location: movedEvent.location,
    timezone: movedEvent.timezone || currentTimezone.value,
  }

  try {
    await privateApi.request(`/api/calendar/private/events/${movedEvent.id}`, {
      method: 'PATCH',
      body: payload,
    })
    await loadEvents()
  } catch (error) {
    dropInfo.revert()
    errorMessage.value = t('pages.calendar.errors.moveFailed')
    console.error(error)
  }
}

async function onExternalDrop(dropInfo: {
  date: Date
  allDay: boolean
  draggedEl: HTMLElement
}) {
  const title = dropInfo.draggedEl.getAttribute('data-title')?.trim() || ''
  if (!title) return

  const startAt = dropInfo.date
  const fallbackEnd = new Date(startAt.getTime() + 60 * 60 * 1000)
  const payload: EventMutationPayload = {
    title,
    description: null,
    startAt: startAt.toISOString(),
    endAt: fallbackEnd.toISOString(),
    isAllDay: dropInfo.allDay,
    location: null,
    timezone: currentTimezone.value,
  }

  try {
    await privateApi.request('/api/calendar/private/events', {
      method: 'POST',
      body: payload,
    })
    await loadEvents()
  } catch (error) {
    errorMessage.value = t('pages.calendar.errors.saveFailed')
    console.error(error)
  }
}

function initPresetDraggable() {
  if (!presetEventsHost.value) return

  presetEventsDraggable?.destroy()
  presetEventsDraggable = null

  presetEventsDraggable = new Draggable(presetEventsHost.value, {
    itemSelector: '.calendar-preset-event',
    longPressDelay: 0,
    minDistance: 1,
    eventData: (eventEl) => {
      const title = eventEl.getAttribute('data-title') || ''
      const color = eventEl.getAttribute('data-color') || undefined
      return {
        title,
        duration: '01:00',
        create: false,
        backgroundColor: color,
        borderColor: color,
        textColor: '#ffffff',
      }
    },
  })
}

async function saveEvent() {
  if (!form.title.trim() || !form.startAt || !form.endAt) return

  isSaving.value = true

  try {
    const payload = buildPayload()

    if (selectedEvent.value) {
      await privateApi.request(
        `/api/calendar/private/events/${selectedEvent.value.id}`,
        {
          method: 'PATCH',
          body: payload,
        },
      )
    } else {
      await privateApi.request('/api/calendar/private/events', {
        method: 'POST',
        body: payload,
      })
    }

    dialogOpen.value = false
    await loadEvents()
  } catch (error) {
    errorMessage.value = t('pages.calendar.errors.saveFailed')
    console.error(error)
  } finally {
    isSaving.value = false
  }
}

async function deleteEvent() {
  if (!selectedEvent.value) return

  isSaving.value = true

  try {
    await privateApi.request(
      `/api/calendar/private/events/${selectedEvent.value.id}`,
      {
        method: 'DELETE',
      },
    )

    dialogOpen.value = false
    await loadEvents()
  } catch (error) {
    errorMessage.value = t('pages.calendar.errors.deleteFailed')
    console.error(error)
  } finally {
    isSaving.value = false
  }
}

async function cancelEvent() {
  if (!selectedEvent.value) return

  isSaving.value = true

  try {
    await privateApi.request(
      `/api/calendar/private/events/${selectedEvent.value.id}/cancel`,
      {
        method: 'POST',
      },
    )

    dialogOpen.value = false
    await loadEvents()
  } catch (error) {
    errorMessage.value = t('pages.calendar.errors.cancelFailed')
    console.error(error)
  } finally {
    isSaving.value = false
  }
}

watch(
  [isPageSkeletonVisible, presetEventsHost],
  async ([skeletonVisible, host], [, previousHost]) => {
    if (skeletonVisible) return
    if (!host) return
    if (host === previousHost && presetEventsDraggable) return
    await nextTick()
    initPresetDraggable()
  },
  { immediate: true },
)

onMounted(async () => {
  await loadEvents()
  window.addEventListener('message', onGoogleOAuthMessage)
  initPresetDraggable()
})

onUnmounted(() => {
  window.removeEventListener('message', onGoogleOAuthMessage)
  presetEventsDraggable?.destroy()
  presetEventsDraggable = null
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible" />
        <template v-else>
          <v-btn
            block
            variant="tonal"
            color="primary"
            prepend-icon="mdi-plus"
            class="mb-3"
            @click="openCreateDialog()"
          >
            {{ t('pages.calendar.addEvent') }}
          </v-btn>
          <v-card-title class="text-subtitle-1 px-0">
            {{ t('pages.calendar.presetTitle') }}
          </v-card-title>
          <div ref="presetEventsHost" class="d-flex flex-column ga-2 mb-3">
            <v-chip
              v-for="preset in presetEvents"
              :key="preset.key"
              class="calendar-preset-event justify-start"
              label
              :style="{ backgroundColor: preset.color, color: '#fff' }"
              :data-title="t(preset.titleKey)"
              :data-color="preset.color"
            >
              {{ t(preset.titleKey) }}
            </v-chip>
          </div>
          <v-btn
            block
            color="secondary"
            prepend-icon="mdi-google"
            :loading="isGoogleConnecting"
            @click="connectGoogleCalendar"
          >
            {{ t('pages.calendar.googleConnect') }}
          </v-btn>
          <v-alert
            v-if="googleToken"
            type="success"
            variant="tonal"
            class="mt-3"
          >
            {{ t('pages.calendar.googleToken') }}: {{ maskedGoogleToken }}
          </v-alert>
        </template>
      </template>
      <template #right>
        <SkeletonDrawerRight v-if="isPageSkeletonVisible" />
        <template v-else>
          <v-card-title>{{ t('pages.calendar.upcomingTitle') }}</v-card-title>
          <v-list v-if="upcomingEvents.length">
            <v-list-item
              v-for="event in upcomingEvents"
              :key="event.id"
              :title="event.title"
              :subtitle="new Date(event.startAt).toLocaleString(locale)"
              prepend-icon="mdi-calendar-check-outline"
              @click="openEditDialog(event)"
            />
          </v-list>
          <v-card-text v-else class="text-medium-emphasis">
            {{ t('pages.calendar.noUpcoming') }}
          </v-card-text>

          <v-divider class="my-3" />
          <v-card-title class="text-subtitle-1">
            {{ t('pages.calendar.googleEventsTitle') }}
          </v-card-title>
          <v-list v-if="googleEvents.length">
            <v-list-item
              v-for="event in googleEvents"
              :key="event.id"
              :title="event.title"
              :subtitle="new Date(event.startAt).toLocaleString(locale)"
              prepend-icon="mdi-google-calendar"
              :href="event.htmlLink || undefined"
              target="_blank"
            />
          </v-list>
          <v-card-text v-else class="text-medium-emphasis">
            {{ t('pages.calendar.noGoogleEvents') }}
          </v-card-text>
        </template>
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible" />
      <template v-else>
        <v-alert v-if="errorMessage" type="error" class="mb-4" variant="tonal">
          {{ errorMessage }}
        </v-alert>
        <v-card variant="text" class="postcard-gradient-card">
          <v-card-text>
            <v-skeleton-loader
              v-if="isLoading"
              type="image"
              class="rounded-lg"
            />
            <FullCalendar v-else :options="calendarOptions" />
          </v-card-text>
        </v-card>
      </template>
    </v-container>

    <v-dialog v-model="dialogOpen" max-width="560">
      <v-card>
        <v-card-title>
          {{
            isEditing
              ? t('pages.calendar.editDialogTitle')
              : t('pages.calendar.createDialogTitle')
          }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="form.title"
            :label="t('pages.calendar.form.title')"
            autofocus
          />
          <v-textarea
            v-model="form.description"
            :label="t('pages.calendar.form.description')"
            rows="3"
          />
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.startAt"
                :label="t('pages.calendar.form.start')"
                type="datetime-local"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.endAt"
                :label="t('pages.calendar.form.end')"
                type="datetime-local"
              />
            </v-col>
          </v-row>
          <v-text-field
            v-model="form.location"
            :label="t('pages.calendar.form.location')"
          />
          <v-switch
            v-model="form.isAllDay"
            :label="t('pages.calendar.form.allDay')"
            color="primary"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" @click="dialogOpen = false">
            {{ t('common.cancel') }}
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="isEditing"
            color="warning"
            variant="text"
            :loading="isSaving"
            @click="cancelEvent"
          >
            {{ t('pages.calendar.cancelEvent') }}
          </v-btn>
          <v-btn
            v-if="isEditing"
            color="error"
            variant="text"
            :loading="isSaving"
            @click="deleteEvent"
          >
            {{ t('common.delete') }}
          </v-btn>
          <v-btn color="primary" :loading="isSaving" @click="saveEvent">
            {{ t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
:deep(.fc) {
  --fc-button-bg-color: rgb(var(--v-theme-primary));
  --fc-button-border-color: rgb(var(--v-theme-primary));
  --fc-button-hover-bg-color: rgb(var(--v-theme-primary-darken-1));
  --fc-button-hover-border-color: rgb(var(--v-theme-primary-darken-1));
  --fc-button-active-bg-color: rgb(var(--v-theme-primary-darken-1));
  --fc-button-active-border-color: rgb(var(--v-theme-primary-darken-1));
}

.calendar-preset-event {
  cursor: grab;
}

.calendar-preset-event.fc-event-dragging {
  visibility: visible !important;
  opacity: 1 !important;
}

:deep(.fc-event.fc-event-dragging),
:deep(.fc-event.fc-event-mirror) {
  opacity: 1 !important;
  visibility: visible !important;
  z-index: 20 !important;
}

:deep(.fc .fc-toolbar-title) {
  font-size: 0.8rem;
  text-transform: capitalize;
}
:deep(.fc .fc-scroller-harness) {
  background: linear-gradient(
    135deg,
    rgba(var(--v-theme-primary), 0.08),
    transparent 45%
  );
}

:deep(.v-theme--dark .fc .fc-col-header-cell) {
  background-color: rgb(var(--v-theme-surface));
}

:deep(.v-theme--dark .fc .fc-col-header-cell-cushion) {
  color: rgb(var(--v-theme-on-surface));
}
</style>
