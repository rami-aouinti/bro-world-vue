<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  title: 'pages.notification.title',
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
  {
    id: 'team-invite',
    title: 'New team invite',
    createdAt: '2026-04-05T16:55:00Z',
  },
  {
    id: 'weekly-report',
    title: 'Weekly report is ready',
    createdAt: '2026-04-03T13:10:00Z',
  },
])

const sortedNotifications = computed(() =>
  [...notifications.value].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  ),
)
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>{{ t('pages.notification.title') }}</v-card-title>
      <v-card-subtitle>{{ t('pages.notification.subtitle') }}</v-card-subtitle>
      <v-list>
        <v-list-item
          v-for="item in sortedNotifications"
          :key="item.id"
          :title="item.title"
          prepend-icon="mdi-bell-ring-outline"
          :to="`/notification/${item.id}`"
        />
      </v-list>
    </v-card>
  </v-container>
</template>
