<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  title: 'appbar.calendar',
  icon: 'mdi-calendar-month-outline',
  middleware: 'auth',
})

const selectedDate = ref(new Date().toISOString().slice(0, 10))

const events = ref([
  { id: 'kickoff', date: '2026-04-08', title: 'Kickoff project' },
  { id: 'review', date: '2026-04-10', title: 'Sprint review' },
])

const selectedDayEvents = computed(() =>
  events.value.filter((event) => event.date === selectedDate.value),
)
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <v-card-title>Events on {{ selectedDate }}</v-card-title>
        <v-list v-if="selectedDayEvents.length">
          <v-list-item
            v-for="event in selectedDayEvents"
            :key="event.id"
            :title="event.title"
            prepend-icon="mdi-calendar-check-outline"
          />
        </v-list>
        <v-card-text v-else class="text-medium-emphasis">
          Aucun événement pour cette date.
        </v-card-text>
      </template>
    </AppPageDrawers>
    <v-container fluid>
      <v-card>
        <v-card-title>{{ t('appbar.calendar') }}</v-card-title>
        <v-card-text>
          <v-date-picker
            v-model="selectedDate"
            color="primary"
            width="100%"
            show-adjacent-months
          />
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>
