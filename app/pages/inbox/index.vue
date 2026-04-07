<script setup lang="ts">
const { t } = useI18n()
const inboxNotificationsStore = useInboxNotificationsStore()
const { inboxSortedDesc } = storeToRefs(inboxNotificationsStore)

await inboxNotificationsStore.fetchInboxConversations()

definePageMeta({
  title: 'appbar.inbox',
  middleware: 'auth',
})
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>{{ t('appbar.inbox') }}</v-card-title>
      <v-card-subtitle>{{ t('pages.inbox.subtitle') }}</v-card-subtitle>

      <v-list v-if="inboxSortedDesc.length">
        <v-list-item
          v-for="conversation in inboxSortedDesc"
          :key="conversation.id"
          :title="conversation.title"
          :subtitle="conversation.preview"
          prepend-icon="mdi-email-outline"
          :to="`/inbox/${conversation.id}`"
        />
      </v-list>

      <v-card-text v-else>
        <div class="d-flex flex-column align-center ga-3 py-8 text-medium-emphasis">
          <v-icon icon="mdi-email-off-outline" size="40" />
          <p class="text-body-1">{{ t('pages.inbox.empty') }}</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
