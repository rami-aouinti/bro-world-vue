<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { privateApi } from '~/utils/http/privateApi'

interface CrmCalendarEvent {
  id: string
  title: string
  description?: string | null
  startAt: string
  endAt: string
  isAllDay: boolean
  isCancelled?: boolean
  color?: string | null
  backgroundColor?: string | null
  borderColor?: string | null
  textColor?: string | null
  location?: string | null
  timezone?: string | null
}

interface CrmCalendarResponse {
  items?: CrmCalendarEvent[]
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

const { t, locale } = useI18n()
const { crmApplicationSlug } = useCrmGeneralApplicationSlug()

const isLoading = ref(true)
const isSaving = ref(false)
const errorMessage = ref('')
const events = ref<CrmCalendarEvent[]>([])
const selectedEvent = ref<CrmCalendarEvent | null>(null)
const dialogOpen = ref(false)

const form = reactive({
  title: '',
  description: '',
  startAt: '',
  endAt: '',
  location: '',
  isAllDay: false,
})

const isEditing = computed(() => Boolean(selectedEvent.value))

const upcomingEvents = computed(() => {
  const now = Date.now()
  return [...events.value]
    .filter(event => !event.isCancelled)
    .filter(event => new Date(event.startAt).getTime() >= now)
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 3)
})

const calendarOptions = computed(() => ({
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
  events: events.value
    .filter(event => !event.isCancelled)
    .map(event => ({
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
    })),
  select: (selectionInfo: { startStr: string; endStr: string }) => {
    openCreateDialog(selectionInfo.startStr, selectionInfo.endStr)
  },
  eventClick: (clickInfo: { event: { extendedProps: { raw?: CrmCalendarEvent } } }) => {
    const event = clickInfo.event.extendedProps.raw
    if (event) openEditDialog(event)
  },
  eventDrop: onEventDrop,
  height: 'auto',
}))

function toInputDateTime(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

function toApiDateTime(value: string) {
  return new Date(value).toISOString()
}

function fillForm(event?: CrmCalendarEvent) {
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

function openEditDialog(event: CrmCalendarEvent) {
  selectedEvent.value = event
  fillForm(event)
  dialogOpen.value = true
}

function buildPayload(): EventMutationPayload {
  return {
    title: form.title.trim(),
    description: form.description.trim() || null,
    startAt: toApiDateTime(form.startAt),
    endAt: toApiDateTime(form.endAt),
    isAllDay: form.isAllDay,
    location: form.location.trim() || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

async function loadCalendarEvents() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await privateApi.request<CrmCalendarResponse>('/api/calendar/events/employee-assigned', {
      method: 'GET',
      params: {
        applicationSlug: crmApplicationSlug.value,
      },
      body: {
        applicationSlug: crmApplicationSlug.value,
      },
    })
    events.value = response.items ?? []
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t('pages.calendar.notifications.loadError')
  } finally {
    isLoading.value = false
  }
}

async function saveEvent() {
  if (!form.title.trim() || !form.startAt || !form.endAt) return

  isSaving.value = true

  try {
    const payload = buildPayload()

    if (selectedEvent.value) {
      await privateApi.request(`/api/calendar/private/events/${selectedEvent.value.id}`, {
        method: 'PATCH',
        body: payload,
      })
    } else {
      await privateApi.request('/api/calendar/private/events', {
        method: 'POST',
        body: payload,
      })
    }

    dialogOpen.value = false
    await loadCalendarEvents()
  } catch {
    errorMessage.value = t('pages.calendar.errors.saveFailed')
  } finally {
    isSaving.value = false
  }
}

async function deleteEvent() {
  if (!selectedEvent.value) return

  isSaving.value = true

  try {
    await privateApi.request(`/api/calendar/private/events/${selectedEvent.value.id}`, {
      method: 'DELETE',
    })

    dialogOpen.value = false
    await loadCalendarEvents()
  } catch {
    errorMessage.value = t('pages.calendar.errors.deleteFailed')
  } finally {
    isSaving.value = false
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
  const movedEvent = events.value.find(event => event.id === dropInfo.event.id)
  if (!movedEvent || !dropInfo.event.start) {
    dropInfo.revert()
    return
  }

  const previousDurationMs =
    new Date(movedEvent.endAt).getTime() - new Date(movedEvent.startAt).getTime()
  const fallbackEnd = new Date(
    dropInfo.event.start.getTime() + (previousDurationMs > 0 ? previousDurationMs : 60 * 60 * 1000),
  )

  const payload: EventMutationPayload = {
    title: movedEvent.title,
    description: movedEvent.description || null,
    startAt: dropInfo.event.start.toISOString(),
    endAt: (dropInfo.event.end || fallbackEnd).toISOString(),
    isAllDay: dropInfo.event.allDay,
    location: movedEvent.location || null,
    timezone: movedEvent.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  }

  try {
    await privateApi.request(`/api/calendar/private/events/${movedEvent.id}`, {
      method: 'PATCH',
      body: payload,
    })
    await loadCalendarEvents()
  } catch {
    dropInfo.revert()
    errorMessage.value = t('pages.calendar.errors.moveFailed')
  }
}

onMounted(() => {
  void loadCalendarEvents()
})
</script>

<template>
  <AppPageDrawers>
    <template #right>
      <v-btn
        block
        color="primary"
        prepend-icon="mdi-plus"
        class="mb-3"
        @click="openCreateDialog()"
      >
        {{ t('pages.calendar.addEvent') }}
      </v-btn>
      <v-card-title class="px-0 pt-0">{{ t('pages.calendar.upcomingTitle') }}</v-card-title>
      <v-list v-if="upcomingEvents.length" density="comfortable" class="bg-transparent">
        <v-list-item
          v-for="event in upcomingEvents"
          :key="event.id"
          :title="event.title"
          :subtitle="new Date(event.startAt).toLocaleString(locale)"
          prepend-icon="mdi-calendar-check-outline"
          @click="openEditDialog(event)"
        />
      </v-list>
      <v-alert v-else type="info" variant="tonal" density="comfortable">
        {{ t('pages.calendar.noUpcoming') }}
      </v-alert>
    </template>
  </AppPageDrawers>

  <v-card rounded="xl" class="pa-4 postcard-gradient-card mt-4">
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h5 mb-0">{{ t('appbar.calendar') }}</h1>
      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-refresh"
        :loading="isLoading"
        @click="loadCalendarEvents"
      >
        {{ t('common.refresh') }}
      </v-btn>
    </div>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </v-alert>

    <div v-if="isLoading" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <FullCalendar v-else :options="calendarOptions" />
  </v-card>

  <AppModal
    v-model="dialogOpen"
    :title="isEditing ? t('pages.calendar.editDialogTitle') : t('pages.calendar.createDialogTitle')"
  >
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

    <template #actions>
      <v-btn variant="text" @click="dialogOpen = false">
        {{ t('common.cancel') }}
      </v-btn>
      <v-spacer />
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
    </template>
  </AppModal>
</template>
