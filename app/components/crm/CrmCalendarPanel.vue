<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { privateApi } from '~/utils/http/privateApi'

interface CrmCalendarEvent {
  id: string
  title: string
  startAt: string
  endAt: string
  isAllDay: boolean
  isCancelled?: boolean
  color?: string | null
  backgroundColor?: string | null
  borderColor?: string | null
  textColor?: string | null
}

interface CrmCalendarResponse {
  items?: CrmCalendarEvent[]
}

const { t } = useI18n()
const { crmApplicationSlug } = useCrmGeneralApplicationSlug()

const isLoading = ref(true)
const errorMessage = ref('')
const events = ref<CrmCalendarEvent[]>([])

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
    })),
  height: 'auto',
}))

async function loadCalendarEvents() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await privateApi.request<CrmCalendarResponse>(
      `/api/calendar/events/employee-assigned?applicationSlug=${encodeURIComponent(crmApplicationSlug.value)}`,
    )
    events.value = response.items ?? []
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : t('pages.calendar.notifications.loadError')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadCalendarEvents()
})
</script>

<template>
  <v-card rounded="xl" class="pa-4 postcard-gradient-card">
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

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      {{ errorMessage }}
    </v-alert>

    <div v-if="isLoading" class="d-flex justify-center py-8">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <FullCalendar v-else :options="calendarOptions" />
  </v-card>
</template>
