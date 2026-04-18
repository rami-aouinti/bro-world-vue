<script setup lang="ts">
import { privateApi } from '~/utils/http/privateApi'
import { formatRelativeTime } from '~/utils/formatRelativeTime'

type ChatUser = {
  id: string
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
const { locale } = useI18n()
const { user: sessionUser } = useUserSession()

const loading = ref(false)
const messagesLoading = ref(false)
const conversations = ref<ConversationSummary[]>([])
const messages = ref<ConversationMessage[]>([])
const selectedConversationId = ref<string>('')
const search = ref('')
const publicUsers = ref<PublicUser[]>([])
const messageInput = ref('')
const messagesContainerRef = ref<HTMLElement | null>(null)
const editMessageId = ref<string>('')
const editMessageContent = ref('')
const reactionUsersDialog = ref(false)
const selectedReactionUsers = ref<Array<{ name: string; reaction: ReactionType }>>([])

const currentUserId = computed(() => String(sessionUser.value?.id || ''))

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
  return fullName || 'Conversation'
})

const filteredUsers = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return []

  return publicUsers.value
    .filter((entry) => entry.id !== currentUserId.value)
    .filter((entry) => {
      const fullName = `${entry.firstName || ''} ${entry.lastName || ''}`.toLowerCase()
      return fullName.includes(keyword)
    })
    .slice(0, 8)
})

const sortedConversations = computed(() =>
  [...conversations.value].sort((a, b) => {
    const left = a.lastMessage?.createdAt || a.createdAt
    const right = b.lastMessage?.createdAt || b.createdAt
    return right.localeCompare(left)
  }),
)

function participantForConversation(conversation: ConversationSummary) {
  return (
    conversation.participants.find((participant) => !participant.user?.owner) ||
    conversation.participants.find((participant) => participant.user?.id !== currentUserId.value) ||
    conversation.participants[0]
  )
}

function participantName(conversation: ConversationSummary) {
  const target = participantForConversation(conversation)?.user
  return [target?.firstName, target?.lastName].filter(Boolean).join(' ') || 'Conversation'
}

function isMine(message: ConversationMessage) {
  if (typeof message.sender?.owner === 'boolean') return message.sender.owner
  return message.sender?.id === currentUserId.value
}

function messageTime(createdAt: string) {
  return formatRelativeTime(locale.value, createdAt, 'just now')
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
        firstName: String(sessionUser.value?.firstName || ''),
        lastName: String(sessionUser.value?.lastName || ''),
        photo: String(sessionUser.value?.photo || ''),
        owner: true,
      },
    }
  } else {
    target.lastMessage.content = content
    target.lastMessage.createdAt = new Date().toISOString()
  }
}

async function fetchConversations() {
  loading.value = true
  try {
    const response = await privateApi.request<ConversationListResponse>('/api/chat/private/conversations')
    conversations.value = response.items || []

    const routeConversationId = String(route.params.conversation || '')
    if (routeConversationId && conversations.value.some((item) => item.id === routeConversationId)) {
      await openConversation(routeConversationId)
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

    if (syncRoute && route.path !== `/inbox/${conversationId}`) {
      await router.push(`/inbox/${conversationId}`)
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
  const response = await privateApi.request<{ conversationId: string }>(
    `/api/chat/private/conversation/${entry.id}/user`,
    { method: 'POST' },
  )

  const existing = conversations.value.find((item) => item.id === response.conversationId)
  if (!existing) {
    conversations.value.unshift({
      id: response.conversationId,
      participants: [
        {
          id: currentUserId.value,
          user: {
            id: currentUserId.value,
            firstName: String(sessionUser.value?.firstName || ''),
            lastName: String(sessionUser.value?.lastName || ''),
            photo: String(sessionUser.value?.photo || ''),
            owner: true,
          },
        },
        {
          id: entry.id,
          user: {
            id: entry.id,
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
  await openConversation(response.conversationId)
}

async function sendMessage() {
  if (!selectedConversationId.value || !messageInput.value.trim()) return
  const content = messageInput.value.trim()
  messageInput.value = ''

  await privateApi.request(`/api/chat/private/conversations/${selectedConversationId.value}/messages`, {
    method: 'POST',
    body: { content },
  })

  messages.value.push({
    id: `tmp-${Date.now()}`,
    content,
    sender: {
      id: currentUserId.value,
      firstName: String(sessionUser.value?.firstName || ''),
      lastName: String(sessionUser.value?.lastName || ''),
      photo: String(sessionUser.value?.photo || ''),
      owner: true,
    },
    reactions: [],
    read: false,
    createdAt: new Date().toISOString(),
  })

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

async function addReaction(message: ConversationMessage, reaction: ReactionType) {
  const response = await privateApi.request<{ id: string }>(
    `/api/chat/private/messages/${message.id}/reactions`,
    {
      method: 'POST',
      body: { reaction },
    },
  )

  message.reactions = message.reactions || []
  message.reactions.push({
    id: response.id,
    type: reaction,
    user: {
      id: currentUserId.value,
      firstName: String(sessionUser.value?.firstName || ''),
      lastName: String(sessionUser.value?.lastName || ''),
      photo: String(sessionUser.value?.photo || ''),
      owner: true,
    },
  })
}

function startEditMessage(message: ConversationMessage) {
  editMessageId.value = message.id
  editMessageContent.value = message.content
}

async function saveEditMessage(messageId: string) {
  await privateApi.request(`/api/chat/private/messages/${messageId}`, {
    method: 'PATCH',
    body: { content: editMessageContent.value.trim() },
  })

  const target = messages.value.find((entry) => entry.id === messageId)
  if (target) {
    target.content = editMessageContent.value.trim()
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

function openReactionUsers(message: ConversationMessage) {
  selectedReactionUsers.value = (message.reactions || []).map((reaction) => ({
    name: [reaction.user?.firstName, reaction.user?.lastName].filter(Boolean).join(' ') || 'User',
    reaction: reaction.type,
  }))
  reactionUsersDialog.value = true
}

onMounted(async () => {
  await Promise.all([fetchConversations(), fetchPublicUsers()])
})

watch(
  () => route.params.conversation,
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
      <v-text-field
        v-model="search"
        placeholder="Search contact"
        density="comfortable"
        variant="outlined"
        hide-details
        prepend-inner-icon="mdi-magnify"
        class="mb-3"
      />

      <v-list
        v-if="filteredUsers.length"
        density="compact"
        class="mb-4 rounded-lg border"
      >
        <v-list-item
          v-for="entry in filteredUsers"
          :key="entry.id"
          @click="startConversationWithUser(entry)"
        >
          <template #prepend>
            <v-avatar size="34">
              <v-img :src="entry.photo || '/img/default-avatar.png'" cover />
            </v-avatar>
          </template>
          <v-list-item-title>
            {{ [entry.firstName, entry.lastName].filter(Boolean).join(' ') }}
          </v-list-item-title>
        </v-list-item>
      </v-list>

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
  </AppPageDrawers>

  <v-container fluid>
    <v-sheet border rounded="xl" class="pa-4 inbox-chat-shell content-main postcard-gradient-card">
      <div v-if="!selectedConversation" class="text-medium-emphasis py-12 text-center">
        Select a conversation
      </div>

      <template v-else>
        <v-sheet color="primary" rounded="xl" class="pa-4 text-white d-flex align-center justify-space-between mb-4 chat-header">
          <div class="d-flex align-center ga-3">
            <v-avatar size="56">
              <v-img :src="targetParticipant?.user?.photo || '/img/default-avatar.png'" cover />
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">{{ selectedConversationName }}</div>
              <div class="text-body-2 opacity-90">{{ messageTime(selectedConversation.lastMessage?.createdAt || selectedConversation.createdAt) }}</div>
            </div>
          </div>
          <div class="d-flex ga-2">
            <v-btn icon="mdi-video-outline" variant="text" color="white" />
            <v-btn icon="mdi-cog-outline" variant="text" color="white" />
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
              <v-avatar size="34" class="mt-1">
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
                      <v-btn size="x-small" color="primary" @click="saveEditMessage(message.id)">Save</v-btn>
                      <v-btn size="x-small" variant="text" @click="editMessageId = ''">Cancel</v-btn>
                    </div>
                  </template>

                  <template v-else>
                    <div class="text-body-1">{{ message.content }}</div>
                  </template>

                  <div class="d-flex align-center ga-2 mt-2 text-caption" :class="isMine(message) ? 'justify-end' : ''">
                    <v-icon
                      v-if="isMine(message)"
                      :icon="message.read ? 'mdi-check-all' : 'mdi-check'"
                      size="14"
                    />
                    <span>{{ messageTime(message.createdAt) }}</span>
                  </div>
                </v-sheet>

                <div v-if="reactionSummary(message).length" class="d-flex ga-1 mt-1">
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
                </div>

                <div class="d-flex ga-1 mt-1">
                  <v-menu location="top">
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
                    @click="startEditMessage(message)"
                  />
                  <v-btn
                    v-if="isMine(message)"
                    size="x-small"
                    variant="text"
                    icon="mdi-delete-outline"
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
            placeholder="Type your message"
            @keydown.enter.prevent="sendMessage"
          />
          <v-btn color="primary" icon="mdi-send" @click="sendMessage" />
        </div>
      </template>
    </v-sheet>

    <v-dialog v-model="reactionUsersDialog" max-width="420">
      <v-card rounded="xl">
        <v-card-title>Reactions</v-card-title>
        <v-card-text>
          <v-list density="comfortable">
            <v-list-item
              v-for="(entry, index) in selectedReactionUsers"
              :key="`${entry.name}-${index}`"
              :title="entry.name"
              :subtitle="entry.reaction"
            >
              <template #prepend>
                <span class="text-h6">{{ reactionEmoji[entry.reaction] }}</span>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
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
  max-height: calc(100vh - 280px);
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

:deep(.v-list-item--active.conversation-item) {
  background: color-mix(in srgb, rgb(var(--v-theme-primary)) 16%, rgb(var(--v-theme-primary)));
}
</style>
