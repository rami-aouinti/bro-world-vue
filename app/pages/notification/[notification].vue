<script setup lang="ts">
const route = useRoute()
const notificationId = computed(() => String(route.params.notification || ''))
const inboxNotificationsStore = useInboxNotificationsStore()

const notification = computed(() =>
  inboxNotificationsStore.getNotificationById(notificationId.value),
)

definePageMeta({
  title: 'appbar.notifications',
  icon: 'mdi-bell-ring-outline',
  middleware: 'auth',
})
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>Notification detail</v-card-title>

      <v-card-text v-if="notification">
        <div class="text-subtitle-1 font-weight-medium">{{ notification.title }}</div>
        <div class="text-body-2 text-medium-emphasis mb-3">{{ notification.createdAt }}</div>
        <div class="text-body-1">{{ notification.content || notification.preview }}</div>
      </v-card-text>

      <v-card-text v-else>
        <div class="d-flex flex-column align-center ga-3 py-8 text-medium-emphasis">
          <v-icon icon="mdi-bell-off-outline" size="40" />
          <p class="text-body-1">Notification introuvable.</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
