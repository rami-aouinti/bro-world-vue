<script setup lang="ts">
interface CalendarEvent {
  id: string
  date: string
  title: string
  color: string
}

const { t } = useI18n()

definePageMeta({
  title: 'appbar.calendar',
  middleware: 'auth',
})

const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const today = new Date()
const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))

const events = ref<CalendarEvent[]>([
  { id: 'kickoff', date: '2026-04-08', title: 'Kickoff project', color: 'primary' },
  { id: 'review', date: '2026-04-10', title: 'Sprint review', color: 'secondary' },
  { id: 'retro', date: '2026-04-17', title: 'Retro team', color: 'success' },
])

const draggedEventId = ref<string | null>(null)
const dialogOpen = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const formTitle = ref('')
const formColor = ref('primary')
const editingEventId = ref<string | null>(null)
const targetDate = ref('')

const colorOptions = ['primary', 'secondary', 'success', 'warning', 'error', 'info']

const monthLabel = computed(() =>
  currentMonth.value.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  }),
)

const calendarDays = computed(() => {
  const monthStart = new Date(currentMonth.value)
  const firstDay = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1)
  const firstWeekday = (firstDay.getDay() + 6) % 7

  const gridStart = new Date(firstDay)
  gridStart.setDate(firstDay.getDate() - firstWeekday)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)

    return {
      iso: toISODate(date),
      day: date.getDate(),
      inCurrentMonth: date.getMonth() === monthStart.getMonth(),
      isToday: toISODate(date) === toISODate(today),
    }
  })
})

function toISODate(date: Date) {
  const local = new Date(date)
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset())
  return local.toISOString().slice(0, 10)
}

function eventsByDay(isoDate: string) {
  return events.value.filter(event => event.date === isoDate)
}

function previousMonth() {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() - 1,
    1,
  )
}

function nextMonth() {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + 1,
    1,
  )
}

function startCreateEvent(date: string) {
  dialogMode.value = 'create'
  editingEventId.value = null
  targetDate.value = date
  formTitle.value = ''
  formColor.value = 'primary'
  dialogOpen.value = true
}

function startEditEvent(event: CalendarEvent) {
  dialogMode.value = 'edit'
  editingEventId.value = event.id
  targetDate.value = event.date
  formTitle.value = event.title
  formColor.value = event.color
  dialogOpen.value = true
}

function saveEvent() {
  if (!formTitle.value.trim() || !targetDate.value)
    return

  if (dialogMode.value === 'create') {
    events.value.push({
      id: crypto.randomUUID(),
      date: targetDate.value,
      title: formTitle.value.trim(),
      color: formColor.value,
    })
  }
  else {
    const event = events.value.find(item => item.id === editingEventId.value)
    if (!event)
      return

    event.title = formTitle.value.trim()
    event.date = targetDate.value
    event.color = formColor.value
  }

  dialogOpen.value = false
}

function deleteEvent() {
  if (!editingEventId.value)
    return

  events.value = events.value.filter(event => event.id !== editingEventId.value)
  dialogOpen.value = false
}

function onDragStart(eventId: string) {
  draggedEventId.value = eventId
}

function onDrop(isoDate: string) {
  if (!draggedEventId.value)
    return

  const event = events.value.find(item => item.id === draggedEventId.value)
  if (event)
    event.date = isoDate

  draggedEventId.value = null
}
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <v-card-title>Événements</v-card-title>
        <v-list v-if="events.length">
          <v-list-item
            v-for="event in events"
            :key="event.id"
            :title="event.title"
            :subtitle="event.date"
            prepend-icon="mdi-calendar-check-outline"
            :draggable="true"
            @click="startEditEvent(event)"
            @dragstart="onDragStart(event.id)"
          />
        </v-list>
        <v-card-text v-else class="text-medium-emphasis">
          Aucun événement.
        </v-card-text>
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between ga-3">
          <span>{{ t('appbar.calendar') }}</span>
          <div class="d-flex align-center ga-2">
            <v-btn icon="mdi-chevron-left" variant="text" @click="previousMonth" />
            <span class="text-capitalize">{{ monthLabel }}</span>
            <v-btn icon="mdi-chevron-right" variant="text" @click="nextMonth" />
          </div>
        </v-card-title>

        <v-card-text>
          <div class="calendar-grid">
            <div v-for="weekDay in weekDays" :key="weekDay" class="weekday">
              {{ weekDay }}
            </div>

            <div
              v-for="day in calendarDays"
              :key="day.iso"
              class="day-cell"
              :class="{
                'day-outside': !day.inCurrentMonth,
                'day-today': day.isToday,
              }"
              @dragover.prevent
              @drop="onDrop(day.iso)"
              @click="startCreateEvent(day.iso)"
            >
              <div class="day-header">{{ day.day }}</div>
              <v-chip
                v-for="event in eventsByDay(day.iso)"
                :key="event.id"
                :color="event.color"
                size="small"
                class="mb-1"
                :draggable="true"
                @click.stop="startEditEvent(event)"
                @dragstart="onDragStart(event.id)"
              >
                {{ event.title }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-container>

    <v-dialog v-model="dialogOpen" max-width="480">
      <v-card>
        <v-card-title>
          {{ dialogMode === 'create' ? 'Ajouter un événement' : 'Modifier un événement' }}
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="formTitle" label="Titre" autofocus />
          <v-text-field v-model="targetDate" label="Date" type="date" />
          <v-select
            v-model="formColor"
            :items="colorOptions"
            label="Couleur"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" @click="dialogOpen = false">
            Annuler
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="dialogMode === 'edit'"
            color="error"
            variant="text"
            @click="deleteEvent"
          >
            Supprimer
          </v-btn>
          <v-btn color="primary" @click="saveEvent">
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.calendar-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.weekday {
  font-weight: 600;
  padding: 8px;
  text-align: center;
}

.day-cell {
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgb(var(--v-theme-outline-variant));
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 120px;
  padding: 8px;
}

.day-outside {
  opacity: 0.45;
}

.day-today {
  border-color: rgb(var(--v-theme-primary));
}

.day-header {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 8px;
}
</style>
