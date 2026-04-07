<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  title: 'appbar.inbox',
  icon: 'mdi-email-outline',
  middleware: 'auth',
})

const conversations = ref([
  {
    id: 'q2-planning',
    title: 'Q2 planning sync',
    createdAt: '2026-04-07T08:30:00Z',
  },
  {
    id: 'design-review',
    title: 'Design review feedback',
    createdAt: '2026-04-06T09:15:00Z',
  },
])

const sortedConversations = computed(() =>
  [...conversations.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
)
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>{{ t('appbar.inbox') }}</v-card-title>
      <v-card-subtitle>Conversations</v-card-subtitle>

      <v-list v-if="sortedConversations.length">
        <v-list-item
          v-for="conversation in sortedConversations"
          :key="conversation.id"
          :title="conversation.title"
          prepend-icon="mdi-email-outline"
          :to="`/inbox/${conversation.id}`"
        />
      </v-list>

      <v-card-text v-else>
        <div class="d-flex flex-column align-center ga-3 py-8 text-medium-emphasis">
          <v-icon icon="mdi-email-off-outline" size="40" />
          <p class="text-body-1">No conversation available.</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
