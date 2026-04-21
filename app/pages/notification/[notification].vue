<script setup lang="ts">
import type { UserNotificationItem } from '~/stores/inboxNotifications'

const route = useRoute()
const { t } = useI18n()
const notificationId = computed(() => String(route.params.notification || ''))
const inboxNotificationsStore = useInboxNotificationsStore()

const { data: notification } = await useAsyncData<UserNotificationItem | null>(
  () => `notification-${notificationId.value}`,
  async () => {
    if (!notificationId.value) return null

    return inboxNotificationsStore.fetchNotificationById(notificationId.value)
  },
)

definePageMeta({
  title: 'appbar.notifications',
  icon: 'mdi-bell-ring-outline',
  middleware: 'auth',
  layout: 'profile',
})
</script>

<template>
  <v-container>
    <v-card class="postcard-gradient-card">
      <v-card-title>{{ t('pages.notification.detailTitle') }}</v-card-title>

      <v-card-text v-if="notification">
        <div class="text-subtitle-1 font-weight-medium">
          {{ notification.title }}
        </div>
        <div class="text-body-2 text-medium-emphasis mb-3">
          {{ notification.createdAt }}
        </div>
        <div class="text-body-1">{{ notification.description }}</div>
      </v-card-text>

      <v-card-text v-else>
        <div
          class="d-flex flex-column align-center ga-3 py-8 text-medium-emphasis"
        >
          <v-icon icon="mdi-bell-off-outline" size="40" />
          <p class="text-body-1">{{ t('pages.notification.notFound') }}</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
