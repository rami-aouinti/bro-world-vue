<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  title: 'appbar.notifications',
  icon: 'mdi-bell-ring-outline',
  middleware: 'auth',
})

const notifications = ref([
  {
    id: 'security-alert',
    title: 'Security alert',
    createdAt: '2026-04-07T10:30:00Z',
  },
  {
    id: 'billing-reminder',
    title: 'Billing reminder',
    createdAt: '2026-04-06T11:20:00Z',
  },
])

const sortedNotifications = computed(() =>
  [...notifications.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
)
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>{{ t('appbar.notifications') }}</v-card-title>
      <v-card-subtitle>Latest updates</v-card-subtitle>

      <v-list v-if="sortedNotifications.length">
        <v-list-item
          v-for="item in sortedNotifications"
          :key="item.id"
          :title="item.title"
          prepend-icon="mdi-bell-ring-outline"
          :to="`/notification/${item.id}`"
        />
      </v-list>

      <v-card-text v-else>
        <div class="d-flex flex-column align-center ga-3 py-8 text-medium-emphasis">
          <v-icon icon="mdi-bell-off-outline" size="40" />
          <p class="text-body-1">No notification available.</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
