<script setup lang="ts">
import type { PrivateConversationParticipant } from '~/stores/inboxNotifications'
import { formatDateTime } from '~/utils/formatDateTime'

const route = useRoute()
const { t, locale } = useI18n()
const conversationId = computed(() => String(route.params.conversation || ''))
const inboxNotificationsStore = useInboxNotificationsStore()

await useAsyncData(
  () => `conversation-${conversationId.value}`,
  async () => {
    if (!conversationId.value) return null

    if (!inboxNotificationsStore.getConversationById(conversationId.value)) {
      await inboxNotificationsStore.fetchInboxConversations()
    }

    return inboxNotificationsStore.getConversationById(conversationId.value) || null
  },
)

const conversation = computed(() =>
  inboxNotificationsStore.getConversationById(conversationId.value),
)

const targetParticipant = computed<PrivateConversationParticipant | undefined>(() =>
  conversation.value?.participants.find((participant) => participant.id !== conversation.value?.ownerId),
)

const targetParticipantName = computed(() => {
  if (!targetParticipant.value) return t('pages.inbox.unknownParticipant')
  const fullName = `${targetParticipant.value.firstName} ${targetParticipant.value.lastName}`.trim()

  return fullName || t('pages.inbox.unknownParticipant')
})

const conversationDate = computed(() => {
  const rawDate = conversation.value?.lastMessage?.createdAt || conversation.value?.createdAt
  if (!rawDate) return ''

  return formatDateTime(locale.value, new Date(rawDate))
})

definePageMeta({
  title: 'appbar.inbox',
  icon: 'mdi-email-outline',
  middleware: 'auth',
})
</script>

<template>
  <v-container>
    <v-card>
      <v-card-title>{{ t('pages.inbox.detailTitle') }}</v-card-title>

      <v-card-text v-if="conversation">
        <div class="text-subtitle-1 font-weight-medium mb-2">{{ targetParticipantName }}</div>
        <div class="text-body-2 text-medium-emphasis mb-2">
          {{ t('pages.inbox.dateLabel', { value: conversationDate }) }}
        </div>
        <div class="text-body-2 text-medium-emphasis mb-3">
          {{ t('pages.inbox.unreadMessagesLabel', { count: conversation.unreadMessagesCount ?? 0 }) }}
        </div>

        <template v-if="conversation.lastMessage">
          <div class="text-subtitle-2 font-weight-medium mb-1">{{ t('pages.inbox.lastMessageLabel') }}</div>
          <div class="text-body-1">{{ conversation.lastMessage.content || t('pages.inbox.emptyMessageContent') }}</div>
        </template>

        <div v-else class="d-flex flex-column ga-2 text-medium-emphasis">
          <div class="text-subtitle-2 font-weight-medium">{{ t('pages.inbox.noMessageTitle') }}</div>
          <div class="text-body-1">{{ t('pages.inbox.noMessageDescription') }}</div>
        </div>
      </v-card-text>

      <v-card-text v-else>
        <div class="d-flex flex-column align-center ga-3 py-8 text-medium-emphasis">
          <v-icon icon="mdi-email-off-outline" size="40" />
          <p class="text-body-1">{{ t('pages.inbox.notFound') }}</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
