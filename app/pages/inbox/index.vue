<script setup lang="ts">
const { t } = useI18n()

definePageMeta({
  title: 'pages.inbox.title',
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
  {
    id: 'project-kickoff',
    title: 'Project kickoff notes',
    createdAt: '2026-04-05T14:00:00Z',
  },
  {
    id: 'invoice-follow-up',
    title: 'Invoice follow-up',
    createdAt: '2026-04-04T17:45:00Z',
  },
])

const sortedConversations = computed(() =>
  [...conversations.value].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  ),
)
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>{{ t('pages.inbox.title') }}</v-card-title>
      <v-card-subtitle>{{ t('pages.inbox.subtitle') }}</v-card-subtitle>
      <v-list>
        <v-list-item
          v-for="conversation in sortedConversations"
          :key="conversation.id"
          :title="conversation.title"
          prepend-icon="mdi-email-outline"
          :to="`/inbox/${conversation.id}`"
        />
      </v-list>
    </v-card>
  </v-container>
</template>
