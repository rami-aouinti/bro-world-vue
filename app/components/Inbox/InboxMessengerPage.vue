<script setup lang="ts">
import { privateApi } from '~/utils/http/privateApi'
import { formatRelativeTime } from '~/utils/formatRelativeTime'

type ChatUser = {
  id: string
  username?: string
  firstName?: string
  lastName?: string
  photo?: string
  owner?: boolean
}

type ConversationParticipant = {
  id: string
  user?: ChatUser
}

type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'

type MessageReaction = {
  id: string
  user?: ChatUser
  type: ReactionType
}

type ConversationMessage = {
  id: string
  content: string
  sender?: ChatUser
  reactions?: MessageReaction[]
  read?: boolean
  createdAt: string
}

type ConversationSummary = {
  id: string
  chatId?: string
  type?: string
  title?: string | null
  participants: ConversationParticipant[]
  unreadMessagesCount?: number
  lastMessage?: {
    id: string
    content: string
    createdAt: string
    sender?: ChatUser
  } | null
  createdAt: string
}

type ConversationListResponse = {
  items?: ConversationSummary[]
}

type ConversationMessagesResponse = {
  conversationId: string
  items?: ConversationMessage[]
}

type PublicUser = {
  id: string
  username?: string
  firstName?: string
  lastName?: string
  photo?: string
}

type PublicUsersResponse = {
  users?: PublicUser[]
  items?: PublicUser[]
}

const reactionEmoji: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  laugh: '😄',
  wow: '😮',
  sad: '😢',
  angry: '😡',
}

const reactionOptions = Object.keys(reactionEmoji) as ReactionType[]
const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const { user: sessionUser } = useUserSession()
const runtimeConfig = useRuntimeConfig()
const inboxNotificationsStore = useInboxNotificationsStore()

const loading = ref(false)
const messagesLoading = ref(false)
const deletingConversation = ref(false)
const conversations = ref<ConversationSummary[]>([])
const messages = ref<ConversationMessage[]>([])
const selectedConversationId = ref<string>('')
const search = ref('')
const selectedUserId = ref<string | null>(null)
const publicUsers = ref<PublicUser[]>([])
const suggestedRightUsers = ref<PublicUser[]>([])
const messageInput = ref('')
const messagesContainerRef = ref<HTMLElement | null>(null)
const editMessageId = ref<string>('')
const editMessageContent = ref('')
const reactionUsersDialog = ref(false)
const selectedReactionUsers = ref<
  Array<{ name: string; reaction: ReactionType; profilePath: string | null }>
>([])
const mercureEventSource = shallowRef<EventSource | null>(null)

const sessionUserMeta = computed(() => {
  const raw = (sessionUser.value || {}) as Record<string, unknown>
  return {
    id: String(raw.id || ''),
    username: String(raw.username || ''),
    firstName: String(raw.firstName || ''),
    lastName: String(raw.lastName || ''),
    photo: String(raw.photo || ''),
  }
})

const currentUserId = computed(() => String(sessionUserMeta.value.id || ''))

const selectedConversation = computed(() =>
  conversations.value.find((conversation) => conversation.id === selectedConversationId.value),
)

const targetParticipant = computed(() => {
  const participants = selectedConversation.value?.participants || []
  return (
    participants.find((participant) => !participant.user?.owner) ||
    participants.find((participant) => participant.user?.id !== currentUserId.value) ||
    participants[0]
  )
})

const selectedConversationName = computed(() => {
  const target = targetParticipant.value?.user
  const fullName = [target?.firstName, target?.lastName].filter(Boolean).join(' ')
  return fullName || t('pages.inbox.conversationFallback')
})

const userComboboxItems = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return publicUsers.value
    .filter((entry) => entry.id !== currentUserId.value)
    .filter((entry) => {
      if (!keyword) return true
      const fullName = `${entry.firstName || ''} ${entry.lastName || ''}`.toLowerCase()
      return fullName.includes(keyword)
    })
    .slice(0, 20)
    .map((entry) => ({
      title:
        [entry.firstName, entry.lastName].filter(Boolean).join(' ') ||
        entry.username ||
        t('pages.inbox.userFallback'),
      value: entry.id,
      photo: entry.photo,
      username: entry.username,
    }))
})

const sortedConversations = computed(() =>
  [...conversations.value].sort((a, b) => {
    const left = a.lastMessage?.createdAt || a.createdAt
    const right = b.lastMessage?.createdAt || b.createdAt
    return right.localeCompare(left)
  }),
)

function userProfilePath(
  user?:
    | Pick<ChatUser, 'id' | 'username' | 'owner'>
    | Pick<PublicUser, 'id' | 'username'>
    | null,
) {
  if (!user) return null
  if ('owner' in user && user.owner) return null
  if (user.id === currentUserId.value) return null
  const username = user?.username?.trim()
  return username ? `/user/${encodeURIComponent(username)}/profile` : null
}

function participantForConversation(conversation: ConversationSummary) {
  return (
    conversation.participants.find((participant) => !participant.user?.owner) ||
    conversation.participants.find((participant) => participant.user?.id !== currentUserId.value) ||
    conversation.participants[0]
  )
}

function participantName(conversation: ConversationSummary) {
  const target = participantForConversation(conversation)?.user
  return (
    [target?.firstName, target?.lastName].filter(Boolean).join(' ') ||
    t('pages.inbox.conversationFallback')
  )
}

function isMine(message: ConversationMessage) {
  if (typeof message.sender?.owner === 'boolean') return message.sender.owner
  return message.sender?.id === currentUserId.value
}

function messageTime(createdAt: string) {
  return formatRelativeTime(locale.value, createdAt, t('pages.inbox.justNow'))
}

function upsertConversationPreview(conversationId: string, content: string) {
  const target = conversations.value.find((entry) => entry.id === conversationId)
  if (!target) return

  if (!target.lastMessage) {
    target.lastMessage = {
      id: `local-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      sender: {
        id: currentUserId.value,
        username: sessionUserMeta.value.username,
        firstName: sessionUserMeta.value.firstName,
        lastName: sessionUserMeta.value.lastName,
        photo: sessionUserMeta.value.photo,
        owner: true,
      },
    }
  } else {
    target.lastMessage.content = content
    target.lastMessage.createdAt = new Date().toISOString()
  }
}

function shuffleUsers(items: PublicUser[]) {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = shuffled[index]
    const randomItem = shuffled[randomIndex]

    if (!current || !randomItem) continue

    shuffled[index] = randomItem
    shuffled[randomIndex] = current
  }

  return shuffled
}

function refreshRightSuggestions() {
  const baseUsers = publicUsers.value.filter((entry) => entry.id !== currentUserId.value)
  suggestedRightUsers.value = shuffleUsers(baseUsers).slice(0, 5)
}

async function fetchConversations() {
  loading.value = true
  try {
    const response = await privateApi.request<ConversationListResponse>('/api/chat/private/conversations')
    conversations.value = response.items || []

    const queryConversationId = String(route.query.conversation || '')
    if (queryConversationId && conversations.value.some((item) => item.id === queryConversationId)) {
      await openConversation(queryConversationId, false)
      return
    }

    const firstConversation = sortedConversations.value[0]
    if (firstConversation) {
      await openConversation(firstConversation.id, false)
    } else {
      selectedConversationId.value = ''
      messages.value = []
    }
  } finally {
    loading.value = false
  }
}

async function fetchPublicUsers() {
  const response = await $fetch<PublicUsersResponse>('/api/public/users')
  publicUsers.value = response.users || response.items || []
  refreshRightSuggestions()
}

async function openConversation(conversationId: string, syncRoute = true) {
  if (!conversationId) return
  selectedConversationId.value = conversationId
  messagesLoading.value = true

  try {
    const response = await privateApi.request<ConversationMessagesResponse>(
      `/api/chat/private/conversations/${conversationId}`,
    )
    messages.value = (response.items || []).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    await privateApi.request(`/api/chat/private/conversations/${conversationId}/messages/read`, {
      method: 'POST',
      body: {},
    })

    const target = conversations.value.find((entry) => entry.id === conversationId)
    if (target) {
      target.unreadMessagesCount = 0
    }

    await nextTick()
    scrollToBottom()

    if (syncRoute && route.query.conversation !== conversationId) {
      await router.push({ path: '/inbox', query: { conversation: conversationId } })
    }
  } finally {
    messagesLoading.value = false
  }
}

function scrollToBottom() {
  if (!messagesContainerRef.value) return
  messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight
}

async function startConversationWithUser(entry: PublicUser) {
  const response = await privateApi.request<{ conversationId?: string; id?: string }>(
    `/api/chat/private/conversation/${entry.id}/user`,
    { method: 'POST' },
  )

  const conversationId = String(response.conversationId || response.id || '')
  if (!conversationId) return

  const existing = conversations.value.find((item) => item.id === conversationId)
  if (!existing) {
    conversations.value.unshift({
      id: conversationId,
      participants: [
        {
          id: currentUserId.value,
          user: {
            id: currentUserId.value,
            username: sessionUserMeta.value.username,
            firstName: sessionUserMeta.value.firstName,
            lastName: sessionUserMeta.value.lastName,
            photo: sessionUserMeta.value.photo,
            owner: true,
          },
        },
        {
          id: entry.id,
          user: {
            id: entry.id,
            username: entry.username,
            firstName: entry.firstName,
            lastName: entry.lastName,
            photo: entry.photo,
            owner: false,
          },
        },
      ],
      createdAt: new Date().toISOString(),
      unreadMessagesCount: 0,
      lastMessage: null,
    })
  }

  search.value = ''
  selectedUserId.value = null
  await openConversation(conversationId)
}

async function onComboboxUserSelected() {
  if (!selectedUserId.value) return
  const target = publicUsers.value.find((entry) => entry.id === selectedUserId.value)
  if (!target) return
  await startConversationWithUser(target)
}

async function sendMessage() {
  if (!selectedConversationId.value || !messageInput.value.trim()) return
  const content = messageInput.value.trim()
  messageInput.value = ''

  await privateApi.request<{ operationId?: string }>(
    `/api/chat/private/conversations/${selectedConversationId.value}/messages`,
    {
    method: 'POST',
    body: { content },
    },
  )

  upsertConversationPreview(selectedConversationId.value, content)

  await nextTick()
  scrollToBottom()
}

function reactionSummary(message: ConversationMessage) {
  const grouped = new Map<ReactionType, MessageReaction[]>()
  for (const reaction of message.reactions || []) {
    const bucket = grouped.get(reaction.type) || []
    bucket.push(reaction)
    grouped.set(reaction.type, bucket)
  }

  return [...grouped.entries()].map(([type, entries]) => ({
    type,
    count: entries.length,
  }))
}

function ownReaction(message: ConversationMessage) {
  const mine = (message.reactions || []).find(
    (entry) => entry.user?.id === currentUserId.value || entry.user?.owner,
  )
  return mine ?? null
}

async function addReaction(message: ConversationMessage, reaction: ReactionType) {
  message.reactions = message.reactions || []
  const existing = ownReaction(message)

  if (!existing) {
    const response = await privateApi.request<{ id: string }>(
      `/api/chat/private/messages/${message.id}/reactions`,
      {
        method: 'POST',
        body: { reaction },
      },
    )

    message.reactions.push({
      id: response.id,
      type: reaction,
      user: {
        id: currentUserId.value,
        username: sessionUserMeta.value.username,
        firstName: sessionUserMeta.value.firstName,
        lastName: sessionUserMeta.value.lastName,
        photo: sessionUserMeta.value.photo,
        owner: true,
      },
    })
    return
  }

  if (existing.type === reaction) {
    await privateApi.request(`/api/chat/private/reactions/${existing.id}`, {
      method: 'DELETE',
    })
    message.reactions = message.reactions.filter(
      (entry) => entry.id !== existing.id,
    )
    return
  }

  await privateApi.request(`/api/chat/private/reactions/${existing.id}`, {
    method: 'PATCH',
    body: { reaction },
  })

  message.reactions = message.reactions.map((entry) =>
    entry.id === existing.id ? { ...entry, type: reaction } : entry,
  )
}

function startEditMessage(message: ConversationMessage) {
  editMessageId.value = message.id
  editMessageContent.value = message.content
}

async function saveEditMessage(messageId: string) {
  const nextContent = editMessageContent.value.trim()
  if (!nextContent) return

  await privateApi.request(`/api/chat/private/messages/${messageId}`, {
    method: 'PATCH',
    body: { content: nextContent },
  })

  const target = messages.value.find((entry) => entry.id === messageId)
  if (target) {
    target.content = nextContent
  }

  editMessageId.value = ''
  editMessageContent.value = ''
}

async function deleteMessage(messageId: string) {
  await privateApi.request(`/api/chat/private/messages/${messageId}`, {
    method: 'DELETE',
  })
  messages.value = messages.value.filter((entry) => entry.id !== messageId)
}

async function deleteSelectedConversation() {
  if (!selectedConversationId.value || deletingConversation.value) return
  const approved = window.confirm(t('pages.inbox.confirmDelete'))
  if (!approved) return

  deletingConversation.value = true

  try {
    await privateApi.request(`/api/v1/chat/private/conversations/${selectedConversationId.value}`, {
      method: 'DELETE',
    })

    const removedId = selectedConversationId.value
    conversations.value = conversations.value.filter((entry) => entry.id !== removedId)

    const nextConversation = sortedConversations.value[0]
    if (nextConversation) {
      await openConversation(nextConversation.id)
    } else {
      selectedConversationId.value = ''
      messages.value = []
      await router.push({ path: '/inbox' })
    }
  } finally {
    deletingConversation.value = false
  }
}

function openReactionUsers(message: ConversationMessage) {
  selectedReactionUsers.value = (message.reactions || []).map((reaction) => ({
    name:
      [reaction.user?.firstName, reaction.user?.lastName].filter(Boolean).join(' ') ||
      t('pages.inbox.userFallback'),
    reaction: reaction.type,
    profilePath: userProfilePath(reaction.user),
  }))
  reactionUsersDialog.value = true
}

function closeMercureSubscription() {
  mercureEventSource.value?.close()
  mercureEventSource.value = null
}

function attachMercureSubscription(conversationId: string) {
  if (!import.meta.client) return

  closeMercureSubscription()

  const mercurePublicUrl = String(runtimeConfig.public.mercurePublicUrl || '').trim()
  if (!mercurePublicUrl || !conversationId || !currentUserId.value) return

  const url = new URL(mercurePublicUrl)
  url.searchParams.append('topic', `/conversations/${conversationId}/messages`)
  url.searchParams.append('topic', `/users/${currentUserId.value}/notifications`)

  const configuredWithCredentials = runtimeConfig.public.mercureWithCredentials === true
  const isSameOriginHub = url.origin === window.location.origin
  const withCredentials = configuredWithCredentials || isSameOriginHub

  const eventSource = new EventSource(url.toString(), { withCredentials })
  mercureEventSource.value = eventSource

  eventSource.onmessage = (event: MessageEvent<string>) => {
    const raw = event.data?.trim()
    if (!raw) return

    try {
      const payload = JSON.parse(raw) as {
        id?: string
        conversationId?: string
        senderId?: string
        content?: string
        attachments?: unknown[]
        createdAt?: string
        recipientId?: string
      }

      if (payload.conversationId && payload.conversationId === selectedConversationId.value) {
        const nextId = String(payload.id || '')
        if (!nextId || messages.value.some((entry) => entry.id === nextId)) return

        const messageContent = String(payload.content || '')
        const mine = String(payload.senderId || '') === currentUserId.value

        messages.value.push({
          id: nextId,
          content: messageContent,
          sender: mine
            ? {
                id: currentUserId.value,
                username: sessionUserMeta.value.username,
                firstName: sessionUserMeta.value.firstName,
                lastName: sessionUserMeta.value.lastName,
                photo: sessionUserMeta.value.photo,
                owner: true,
              }
            : {
                id: String(payload.senderId || ''),
                owner: false,
              },
          reactions: [],
          read: mine,
          createdAt: String(payload.createdAt || new Date().toISOString()),
        })

        upsertConversationPreview(payload.conversationId, messageContent)
        nextTick(() => scrollToBottom())
        return
      }

      if (payload.recipientId && payload.recipientId === currentUserId.value) {
        void inboxNotificationsStore.fetchNotifications()
      }
    } catch {
      // Ignore non-JSON events.
    }
  }
}

onMounted(async () => {
  await Promise.all([fetchConversations(), fetchPublicUsers()])
})

watch(
  [selectedConversationId, currentUserId],
  ([conversationId, userId]) => {
    if (!conversationId || !userId) {
      closeMercureSubscription()
      return
    }

    attachMercureSubscription(conversationId)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  closeMercureSubscription()
})

watch(
  () => route.query.conversation,
  async (conversationId) => {
    const nextId = String(conversationId || '')
    if (!nextId || nextId === selectedConversationId.value) return
    await openConversation(nextId, false)
  },
)
</script>

<template>
  <AppPageDrawers>
    <template #left>
        <v-combobox
          v-model="selectedUserId"
          v-model:search="search"
          :items="userComboboxItems"
          item-title="title"
          item-value="value"
          density="comfortable"
          variant="outlined"
          hide-details
          clearable
          :placeholder="t('pages.inbox.searchContact')"
          prepend-inner-icon="mdi-account-search-outline"
          class="mb-4"
          @update:model-value="onComboboxUserSelected"
        >
          <template #item="{ props }">
            <v-list-item v-bind="props" />
          </template>
        </v-combobox>

        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-3" />

      <v-list class="inbox-conversation-list">
        <v-list-item
          v-for="conversation in sortedConversations"
          :key="conversation.id"
          :active="conversation.id === selectedConversationId"
          rounded="xl"
          class="mb-2 conversation-item"
          @click="openConversation(conversation.id)"
        >
          <template #prepend>
            <v-avatar size="48">
              <v-img
                :src="participantForConversation(conversation)?.user?.photo || '/img/default-avatar.png'"
                cover
              />
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-bold text-body-1">
            {{ participantName(conversation) }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption mb-1">
            {{ messageTime(conversation.lastMessage?.createdAt || conversation.createdAt) }}
          </v-list-item-subtitle>
          <v-list-item-subtitle class="text-body-2 text-truncate">
            {{ conversation.lastMessage?.content || '...' }}
          </v-list-item-subtitle>

          <template #append>
            <v-badge
              v-if="(conversation.unreadMessagesCount || 0) > 0"
              :content="conversation.unreadMessagesCount"
              color="primary"
              inline
            />
          </template>
        </v-list-item>
      </v-list>
    </template>

    <template #right>
        <v-list density="compact" class="bg-transparent">
          <v-list-item
            v-for="entry in suggestedRightUsers"
            :key="entry.id"
            :title="
              [entry.firstName, entry.lastName].filter(Boolean).join(' ') ||
              entry.username ||
              t('pages.inbox.userFallback')
            "
          >
            <template #prepend>
              <v-avatar size="30">
                <v-img :src="entry.photo || '/img/default-avatar.png'" cover />
              </v-avatar>
            </template>
            <template #append>
              <v-btn
                icon="mdi-message-text-outline"
                size="small"
                variant="text"
                color="primary"
                :aria-label="
                  t('pages.inbox.openConversationWith', {
                    name:
                      [entry.firstName, entry.lastName].filter(Boolean).join(' ') ||
                      entry.username ||
                      t('pages.inbox.userFallback'),
                  })
                "
                @click="startConversationWithUser(entry)"
              />
            </template>
          </v-list-item>
        </v-list>
    </template>
  </AppPageDrawers>

  <v-container fluid>
    <v-sheet border rounded="xl" class="pa-4 inbox-chat-shell content-main postcard-gradient-card">
      <div v-if="!selectedConversation" class="text-medium-emphasis py-12 text-center">
        {{ t('pages.inbox.selectConversation') }}
      </div>

      <template v-else>
        <v-sheet color="primary" rounded="xl" class="pa-4 text-white d-flex align-center justify-space-between mb-4 chat-header">
          <div class="d-flex align-center ga-3">
            <NuxtLink
              v-if="userProfilePath(targetParticipant?.user)"
              :to="userProfilePath(targetParticipant?.user)!"
              class="inbox-user-link"
            >
              <v-avatar size="56">
                <v-img :src="targetParticipant?.user?.photo || '/img/default-avatar.png'" cover />
              </v-avatar>
            </NuxtLink>
            <v-avatar v-else size="56">
              <v-img :src="targetParticipant?.user?.photo || '/img/default-avatar.png'" cover />
            </v-avatar>
            <div>
              <NuxtLink
                v-if="userProfilePath(targetParticipant?.user)"
                :to="userProfilePath(targetParticipant?.user)!"
                class="inbox-user-link inbox-user-link--name"
              >
                {{ selectedConversationName }}
              </NuxtLink>
              <div v-else class="text-h6 font-weight-bold">{{ selectedConversationName }}</div>
              <div class="text-body-2 opacity-90">{{ messageTime(selectedConversation.lastMessage?.createdAt || selectedConversation.createdAt) }}</div>
            </div>
          </div>
          <div class="d-flex ga-2">
            <v-btn
              icon="mdi-delete-outline"
              variant="text"
              color="white"
              :loading="deletingConversation"
              :aria-label="t('pages.inbox.deleteAction')"
              @click="deleteSelectedConversation"
            />
          </div>
        </v-sheet>

        <div ref="messagesContainerRef" class="inbox-messages-container mb-4">
          <v-progress-linear v-if="messagesLoading" indeterminate color="primary" class="mb-3" />

          <div
            v-for="message in messages"
            :key="message.id"
            class="d-flex mb-3"
            :class="isMine(message) ? 'justify-end' : 'justify-start'"
          >
            <div class="d-flex ga-2" :class="isMine(message) ? 'flex-row-reverse' : ''">
              <NuxtLink
                v-if="userProfilePath(message.sender)"
                :to="userProfilePath(message.sender)!"
                class="inbox-user-link mt-1"
              >
                <v-avatar size="34">
                  <v-img :src="message.sender?.photo || '/img/default-avatar.png'" cover />
                </v-avatar>
              </NuxtLink>
              <v-avatar v-else size="34" class="mt-1">
                <v-img :src="message.sender?.photo || '/img/default-avatar.png'" cover />
              </v-avatar>

              <div>
                <v-sheet
                  rounded="xl"
                  class="message-bubble pa-3"
                  :class="isMine(message) ? 'message-bubble--mine' : 'message-bubble--other'"
                >
                  <template v-if="editMessageId === message.id">
                    <v-text-field
                      v-model="editMessageContent"
                      density="compact"
                      variant="outlined"
                      hide-details
                    />
                    <div class="d-flex ga-2 mt-2">
                      <v-btn size="x-small" color="primary" @click="saveEditMessage(message.id)">{{ t('common.save') }}</v-btn>
                      <v-btn size="x-small" variant="text" @click="editMessageId = ''">{{ t('common.cancel') }}</v-btn>
                    </div>
                  </template>

                  <template v-else>
                    <div class="text-body-1">{{ message.content }}</div>
                  </template>

                  <div class="d-flex align-center ga-2 mt-1 text-caption message-time" :class="isMine(message) ? 'justify-end' : ''">
                    <v-icon
                      v-if="isMine(message)"
                      :icon="message.read ? 'mdi-check-all' : 'mdi-check'"
                      size="12"
                    />
                    <span>{{ messageTime(message.createdAt) }}</span>
                  </div>
                </v-sheet>

                <div class="d-flex align-center flex-wrap ga-1 mt-1">
                  <v-chip
                    v-for="entry in reactionSummary(message)"
                    :key="`${message.id}-${entry.type}`"
                    size="x-small"
                    color="surface"
                    variant="flat"
                    @click="openReactionUsers(message)"
                  >
                    {{ reactionEmoji[entry.type] }} {{ entry.count }}
                  </v-chip>

                  <v-menu location="top" content-class="app-menu-surface">
                    <template #activator="{ props }">
                      <v-btn size="x-small" variant="text" icon="mdi-emoticon-happy-outline" v-bind="props" />
                    </template>
                    <v-card>
                      <div class="d-flex ga-1 pa-2">
                        <v-btn
                          v-for="reaction in reactionOptions"
                          :key="reaction"
                          size="small"
                          variant="text"
                          :class="{
                            'message-reaction-option--selected':
                              ownReaction(message)?.type === reaction,
                          }"
                          @click="addReaction(message, reaction)"
                        >
                          {{ reactionEmoji[reaction] }}
                        </v-btn>
                      </div>
                    </v-card>
                  </v-menu>

                  <v-btn
                    v-if="isMine(message)"
                    size="x-small"
                    variant="text"
                    icon="mdi-pencil-outline"
                    class="message-action-btn"
                    @click="startEditMessage(message)"
                  />
                  <v-btn
                    v-if="isMine(message)"
                    size="x-small"
                    variant="text"
                    icon="mdi-delete-outline"
                    class="message-action-btn"
                    @click="deleteMessage(message.id)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex ga-2">
          <v-text-field
            v-model="messageInput"
            variant="outlined"
            density="comfortable"
            hide-details
            :placeholder="t('pages.inbox.typeMessage')"
            @keydown.enter.prevent="sendMessage"
          />
          <v-btn color="primary" icon="mdi-send" @click="sendMessage" />
        </div>
      </template>
    </v-sheet>

    <AppModal
      v-model="reactionUsersDialog"
      :title="t('pages.inbox.reactionsTitle')"
      :max-width="420"
    >
      <v-list density="comfortable">
        <v-list-item
          v-for="(entry, index) in selectedReactionUsers"
          :key="`${entry.name}-${index}`"
          :title="entry.name"
          :subtitle="entry.reaction"
          :to="entry.profilePath || undefined"
        >
          <template #prepend>
            <span class="text-h6">{{ reactionEmoji[entry.reaction] }}</span>
          </template>
        </v-list-item>
      </v-list>
    </AppModal>
  </v-container>
</template>

<style scoped>
.inbox-left-panel {
  max-height: calc(100vh - 140px);
  overflow: auto;
}

.inbox-chat-shell {
  min-height: calc(100vh - 150px);
}

.inbox-conversation-list {
  max-height: calc(100vh - 290px);
  overflow: auto;
}

.inbox-messages-container {
  height: calc(100vh - 350px);
  overflow: auto;
}

.message-bubble {
  max-width: min(560px, 72vw);
}

.message-bubble--mine {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, color-mix(in srgb, rgb(var(--v-theme-surface)) 56%, black) 100%);
}

.message-bubble--other {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, color-mix(in srgb, rgb(var(--v-theme-surface)) 56%, white) 100%);
}

.message-time {
  font-size: 11px;
}

.message-action-btn :deep(.v-icon) {
  font-size: 16px;
}

.message-reaction-option--selected {
  transform: scale(1.2);
}

.inbox-user-link {
  color: inherit;
  text-decoration: none;
}

.inbox-user-link--name {
  font-size: 1.25rem;
  font-weight: 700;
}

:deep(.v-list-item--active.conversation-item) {
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 16%, rgb(var(--v-theme-primary)));
}
</style>
