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
  organizerName?: string | null
  organizerEmail?: string | null
  attendees?: Array<{
    email: string
    displayName?: string | null
    responseStatus?: string | null
    optional?: boolean
    organizer?: boolean
    self?: boolean
    resource?: boolean
  }>
  metadata?: Record<string, unknown> | null
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

type CalendarRangeFilter = 'next7days' | 'nextMonth' | 'next3months'

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

interface GoogleSyncPayload {
  accessToken: string
  calendarId?: string
  timeMin?: string
  timeMax?: string
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
const lastGoogleSyncToken = ref('')
const calendarEvents = ref<PrivateCalendarEvent[]>([])
const upcomingEvents = ref<PrivateCalendarEvent[]>([])
const selectedEvent = ref<PrivateCalendarEvent | null>(null)
const selectedEventDetails = ref<PrivateCalendarEvent | null>(null)
const isDetailsLoading = ref(false)
const isEditMode = ref(false)
const dialogOpen = ref(false)
const selectedRangeFilter = ref<CalendarRangeFilter | null>(null)
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
const activeEvent = computed(
  () => selectedEventDetails.value ?? selectedEvent.value,
)
const eventDescriptionHtml = computed(() =>
  formatEventDescriptionAsHtml(activeEvent.value?.description ?? ''),
)
const currentTimezone = computed(
  () => Intl.DateTimeFormat().resolvedOptions().timeZone,
)
const canEditForm = computed(() => !isEditing.value || isEditMode.value)
const formattedEventRange = computed(() => {
  const event = activeEvent.value
  if (!event?.startAt || !event?.endAt) return ''
  return `${new Date(event.startAt).toLocaleString(locale.value)} → ${new Date(event.endAt).toLocaleString(locale.value)}`
})
const rangeFilterOptions = computed(() => [
  { title: 'Next 7 Days', value: 'next7days' as const },
  { title: 'Next Month', value: 'nextMonth' as const },
  { title: 'Next 3 Months', value: 'next3months' as const },
])

const fullCalendarEvents = computed(() => {
  if (!selectedRangeFilter.value) {
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
  }

  const now = Date.now()
  const rangeEnd = new Date()

  if (selectedRangeFilter.value === 'next7days') {
    rangeEnd.setDate(rangeEnd.getDate() + 7)
  } else if (selectedRangeFilter.value === 'nextMonth') {
    rangeEnd.setMonth(rangeEnd.getMonth() + 1)
  } else {
    rangeEnd.setMonth(rangeEnd.getMonth() + 3)
  }

  const rangeEndTime = rangeEnd.getTime()

  return calendarEvents.value
    .filter((event) => {
      if (event.isCancelled) return false
      const eventStart = new Date(event.startAt).getTime()
      return eventStart >= now && eventStart <= rangeEndTime
    })
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
  selectedEventDetails.value = null
  isEditMode.value = true
  fillForm()

  if (start) form.startAt = toInputDateTime(start)
  if (end) form.endAt = toInputDateTime(end)

  dialogOpen.value = true
}

async function loadEventDetails(eventId: string) {
  isDetailsLoading.value = true
  try {
    const eventDetails = await privateApi.request<PrivateCalendarEvent>(
      `/api/v1/calendar/private/events/${eventId}`,
    )
    selectedEventDetails.value = eventDetails
    fillForm(eventDetails)
  } catch (error) {
    selectedEventDetails.value = null
    console.error(error)
  } finally {
    isDetailsLoading.value = false
  }
}

function escapeHtml(rawText: string) {
  return rawText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatEventDescriptionAsHtml(rawDescription: string | null) {
  if (!rawDescription) return ''

  const escapedText = escapeHtml(rawDescription)
  const linkedText = escapedText.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
  )

  return linkedText.replace(/\n/g, '<br>')
}

function openEditDialog(event: PrivateCalendarEvent) {
  selectedEvent.value = event
  selectedEventDetails.value = null
  isEditMode.value = false
  fillForm(event)
  dialogOpen.value = true
  void loadEventDetails(event.id)
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

async function syncGoogleCalendar(payload: GoogleSyncPayload) {
  return privateApi.request('/api/v1/calendar/private/events/google/sync', {
    method: 'POST',
    body: payload,
  })
}

async function connectGoogleCalendar() {
  isGoogleConnecting.value = true

  const popup = window.open('', 'google-calendar-oauth', 'width=520,height=720')

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

async function onGoogleOAuthMessage(rawEvent: MessageEvent<unknown>) {
  const data = rawEvent.data as GoogleCallbackMessage | undefined
  if (!data || data.source !== 'google-calendar-oauth') return

  if (data.error) {
    isGoogleConnecting.value = false
    errorMessage.value = t('pages.calendar.errors.googleConnectFailed')
    console.error(data.error)
    return
  }

  const token = data.token?.trim() || ''
  if (!token) {
    isGoogleConnecting.value = false
    errorMessage.value = t('pages.calendar.errors.googleConnectFailed')
    console.error(new Error('Missing Google OAuth access token'))
    return
  }

  googleToken.value = token

  if (lastGoogleSyncToken.value === token) {
    googleEvents.value = data.events ?? []
    isGoogleConnecting.value = false
    return
  }

  try {
    await syncGoogleCalendar({ accessToken: token })
    lastGoogleSyncToken.value = token
    googleEvents.value = data.events ?? []
    await loadEvents()
    errorMessage.value = ''
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response
      ?.status

    if (status === 502) {
      googleEvents.value = data.events ?? []
      console.warn(
        'Google sync endpoint returned 502 after OAuth success. Keeping OAuth token and Google events.',
        error,
      )
      return
    }

    errorMessage.value = t('pages.calendar.errors.googleConnectFailed')
    console.error(error)
  } finally {
    isGoogleConnecting.value = false
  }
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
          <AppSelect
            v-model="selectedRangeFilter"
            class="mb-3"
            density="comfortable"
            variant="outlined"
            label="Filter"
            :items="rangeFilterOptions"
            item-title="title"
            item-value="value"
          />
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

    <AppModal
      v-model="dialogOpen"
      :title="isEditing ? t('pages.calendar.editDialogTitle') : t('pages.calendar.createDialogTitle')"
      :max-width="560"
    >
      <template #default>
          <v-alert v-if="isDetailsLoading" type="info" variant="tonal" class="mb-3">
            Chargement des détails de l'événement...
          </v-alert>
          <v-card
            v-if="isEditing && (activeEvent?.description || activeEvent?.organizerEmail)"
            variant="tonal"
            class="mb-4"
          >
            <v-card-text class="text-body-2">
              <div v-if="activeEvent?.description" class="mb-2">
                <div class="font-weight-medium mb-1">Description (HTML)</div>
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div class="event-html-description" v-html="eventDescriptionHtml" />
              </div>
              <div v-if="formattedEventRange" class="text-medium-emphasis mb-2">
                Date: {{ formattedEventRange }}
              </div>
              <div v-if="activeEvent?.organizerEmail" class="text-medium-emphasis">
                Organisateur: {{ activeEvent.organizerName || activeEvent.organizerEmail }}
              </div>
            </v-card-text>
          </v-card>
          <v-text-field
            v-model="form.title"
            :label="t('pages.calendar.form.title')"
            autofocus
            :disabled="!canEditForm"
          />
          <v-textarea
            v-model="form.description"
            :label="t('pages.calendar.form.description')"
            rows="3"
            :disabled="!canEditForm"
          />
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.startAt"
                :label="t('pages.calendar.form.start')"
                type="datetime-local"
                :disabled="!canEditForm"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.endAt"
                :label="t('pages.calendar.form.end')"
                type="datetime-local"
                :disabled="!canEditForm"
              />
            </v-col>
          </v-row>
          <v-text-field
            v-model="form.location"
            :label="t('pages.calendar.form.location')"
            :disabled="!canEditForm"
          />
          <v-switch
            v-model="form.isAllDay"
            :label="t('pages.calendar.form.allDay')"
            color="primary"
            :disabled="!canEditForm"
          />
      </template>
      <template #actions>
          <v-btn variant="text" @click="dialogOpen = false">
            {{ t('common.cancel') }}
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="isEditing && !isEditMode"
            color="primary"
            variant="tonal"
            prepend-icon="mdi-pencil-outline"
            @click="isEditMode = true"
          >
            Edit
          </v-btn>
          <v-btn
            v-if="isEditing"
            color="warning"
            variant="text"
            :loading="isSaving"
            :disabled="!canEditForm"
            @click="cancelEvent"
          >
            {{ t('pages.calendar.cancelEvent') }}
          </v-btn>
          <v-btn
            v-if="isEditing"
            color="error"
            variant="text"
            :loading="isSaving"
            :disabled="!canEditForm"
            @click="deleteEvent"
          >
            {{ t('common.delete') }}
          </v-btn>
          <v-btn color="primary" :loading="isSaving" :disabled="!canEditForm" @click="saveEvent">
            {{ t('common.save') }}
          </v-btn>
      </template>
    </AppModal>
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

.event-html-description {
  line-height: 1.5;
  word-break: break-word;
}

.event-html-description :deep(a) {
  color: rgb(var(--v-theme-primary));
}
</style>
