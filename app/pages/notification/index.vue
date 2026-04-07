<script setup lang="ts">
const { t } = useI18n()
const inboxNotificationsStore = useInboxNotificationsStore()
const { notificationsSortedDesc } = storeToRefs(inboxNotificationsStore)

await inboxNotificationsStore.fetchNotifications()

definePageMeta({
  title: 'appbar.notifications',
  middleware: 'auth',
})
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>{{ t('appbar.notifications') }}</v-card-title>
      <v-card-subtitle>Latest updates</v-card-subtitle>

      <v-list v-if="notificationsSortedDesc.length">
        <v-list-item
          v-for="item in notificationsSortedDesc"
          :key="item.id"
          :title="item.title"
          :subtitle="item.description"
          prepend-icon="mdi-bell-ring-outline"
          :to="`/notification/${item.id}`"
        />
      </v-list>

      <v-card-text v-else>
        <div
          class="d-flex flex-column align-center ga-3 py-8 text-medium-emphasis"
        >
          <v-icon icon="mdi-bell-off-outline" size="40" />
          <p class="text-body-1">No notification available.</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
