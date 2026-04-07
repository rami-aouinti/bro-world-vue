<script setup lang="ts">
import type { PrivateConversationParticipant } from '~/stores/inboxNotifications'
import { Notify } from '~/stores/notification'
import { formatDateTime } from '~/utils/formatDateTime'

const route = useRoute()
const { t, locale } = useI18n()
const conversationId = computed(() => String(route.params.conversation || ''))
const inboxNotificationsStore = useInboxNotificationsStore()

const cachedConversation = computed(() =>
  inboxNotificationsStore.getConversationById(conversationId.value),
)

const {
  data: fetchedConversation,
  pending,
  error,
  refresh,
} = await useAsyncData(
  () => `conversation-${conversationId.value}`,
  async () => {
    if (!conversationId.value) return null

    return await inboxNotificationsStore.fetchConversationById(
      conversationId.value,
    )
  },
  {
    default: () => cachedConversation.value || null,
    watch: [conversationId],
  },
)

const conversation = computed(
  () =>
    fetchedConversation.value ||
    inboxNotificationsStore.getConversationById(conversationId.value) ||
    null,
)

const isDeleting = ref(false)
const isEditMode = ref(false)
const isSaving = ref(false)
const editTitle = ref('')
const editArchived = ref(false)

watch(
  conversation,
  (nextConversation) => {
    editTitle.value = nextConversation?.title?.trim() || ''
    editArchived.value = Boolean(
      (nextConversation as { archived?: boolean } | null)?.archived,
    )
  },
  { immediate: true },
)

const hasEditChanges = computed(() => {
  if (!conversation.value) return false

  const currentTitle = conversation.value.title?.trim() || ''
  const currentArchived = Boolean(
    (conversation.value as { archived?: boolean }).archived,
  )

  return (
    editTitle.value.trim() !== currentTitle ||
    editArchived.value !== currentArchived
  )
})

async function handleDeleteConversation() {
  if (!conversation.value || isDeleting.value) return

  isDeleting.value = true

  try {
    await inboxNotificationsStore.deleteConversation(conversation.value.id)
    Notify.success(t('pages.inbox.deleteSuccess'))
    await navigateTo('/inbox')
  } catch {
    Notify.error(t('pages.inbox.deleteError'))
  } finally {
    isDeleting.value = false
  }
}

async function handleSaveConversation() {
  if (!conversation.value || !hasEditChanges.value || isSaving.value) return

  const payload: Record<string, unknown> = {}
  const nextTitle = editTitle.value.trim()
  const currentTitle = conversation.value.title?.trim() || ''

  if (nextTitle !== currentTitle) {
    payload.title = nextTitle || null
  }

  const currentArchived = Boolean(
    (conversation.value as { archived?: boolean }).archived,
  )
  if (editArchived.value !== currentArchived) {
    payload.archived = editArchived.value
  }

  if (!Object.keys(payload).length) return

  isSaving.value = true

  try {
    const updatedConversation =
      await inboxNotificationsStore.updateConversation(
        conversation.value.id,
        payload,
      )

    if (!updatedConversation) {
      Notify.error(t('pages.inbox.updateError'))
      return
    }

    fetchedConversation.value = updatedConversation
    isEditMode.value = false
    Notify.success(t('pages.inbox.updateSuccess'))
  } catch {
    Notify.error(t('pages.inbox.updateError'))
  } finally {
    isSaving.value = false
  }
}

const targetParticipant = computed<PrivateConversationParticipant | undefined>(
  () =>
    conversation.value?.participants.find((participant) => {
      if (conversation.value?.ownerId) {
        return (
          (participant.user?.id || participant.id) !==
          conversation.value.ownerId
        )
      }

      return !participant.user?.owner
    }) || conversation.value?.participants[0],
)

const targetParticipantName = computed(() => {
  if (!targetParticipant.value) return t('pages.inbox.unknownParticipant')
  const fullName =
    `${targetParticipant.value.user?.firstName || targetParticipant.value.firstName || ''} ${targetParticipant.value.user?.lastName || targetParticipant.value.lastName || ''}`.trim()

  return fullName || t('pages.inbox.unknownParticipant')
})

const conversationDate = computed(() => {
  const rawDate =
    conversation.value?.lastMessage?.createdAt || conversation.value?.createdAt
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

      <v-card-text v-if="pending">
        <v-skeleton-loader type="article, actions" />
      </v-card-text>

      <v-card-text v-else-if="error && !conversation">
        <v-alert type="error" variant="tonal" class="mb-3">
          {{ t('pages.inbox.fetchError') }}
        </v-alert>
        <v-btn
          color="primary"
          variant="text"
          :loading="pending"
          @click="refresh"
        >
          {{ t('common.retry') }}
        </v-btn>
      </v-card-text>

      <v-card-text v-else-if="conversation">
        <div class="text-subtitle-1 font-weight-medium mb-2">
          {{ targetParticipantName }}
        </div>
        <div class="text-body-2 text-medium-emphasis mb-2">
          {{ t('pages.inbox.dateLabel', { value: conversationDate }) }}
        </div>
        <div class="text-body-2 text-medium-emphasis mb-3">
          {{
            t('pages.inbox.unreadMessagesLabel', {
              count: conversation.unreadMessagesCount ?? 0,
            })
          }}
        </div>

        <v-expand-transition>
          <div v-if="isEditMode" class="d-flex flex-column ga-3 mb-4">
            <v-text-field
              v-model="editTitle"
              :label="t('pages.inbox.editTitleLabel')"
              clearable
              hide-details="auto"
            />
            <v-switch
              v-model="editArchived"
              :label="t('pages.inbox.editArchivedLabel')"
              color="primary"
              hide-details
            />
            <div class="d-flex ga-2">
              <v-btn
                color="primary"
                :loading="isSaving"
                :disabled="!hasEditChanges"
                @click="handleSaveConversation"
              >
                {{ t('common.save') }}
              </v-btn>
              <v-btn
                variant="text"
                :disabled="isSaving"
                @click="isEditMode = false"
              >
                {{ t('common.cancel') }}
              </v-btn>
            </div>
          </div>
        </v-expand-transition>

        <template v-if="conversation.lastMessage">
          <div class="text-subtitle-2 font-weight-medium mb-1">
            {{ t('pages.inbox.lastMessageLabel') }}
          </div>
          <div class="text-body-1">
            {{
              conversation.lastMessage.content ||
              t('pages.inbox.emptyMessageContent')
            }}
          </div>
        </template>

        <div v-else class="d-flex flex-column ga-2 text-medium-emphasis">
          <div class="text-subtitle-2 font-weight-medium">
            {{ t('pages.inbox.noMessageTitle') }}
          </div>
          <div class="text-body-1">
            {{ t('pages.inbox.noMessageDescription') }}
          </div>
        </div>

        <div class="d-flex ga-2 mt-5">
          <v-btn
            variant="tonal"
            color="primary"
            prepend-icon="mdi-pencil"
            @click="isEditMode = !isEditMode"
          >
            {{ isEditMode ? t('common.close') : t('pages.inbox.editAction') }}
          </v-btn>
          <v-btn
            variant="tonal"
            color="error"
            prepend-icon="mdi-delete-outline"
            :loading="isDeleting"
            @click="handleDeleteConversation"
          >
            {{ t('pages.inbox.deleteAction') }}
          </v-btn>
        </div>
      </v-card-text>

      <v-card-text v-else>
        <div
          class="d-flex flex-column align-center ga-3 py-8 text-medium-emphasis"
        >
          <v-icon icon="mdi-email-off-outline" size="40" />
          <p class="text-body-1">{{ t('pages.inbox.notFound') }}</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
