export interface InboxItem {
  id: string
  title: string
  createdAt: string
  preview?: string
  content?: string
}

export type NotificationType = 'info' | 'security' | string

export interface NotificationSender {
  firstName: string
  lastName: string
  photo: string
}

export interface UserNotificationItem {
  id: string
  title: string
  description: string
  type: NotificationType
  read: boolean
  createdAt: string
  from: NotificationSender | null
  preview?: string
  content?: string
}

type NotificationsApiResponse = {
  items: UserNotificationItem[]
  unreadCount: number
}

export interface PrivateConversationParticipant {
  id: string
  firstName: string
  lastName: string
}

export interface PrivateConversationMessage {
  content: string | null
  createdAt: string
}

export interface PrivateConversation {
  id: string
  title: string | null
  createdAt: string
  participants: PrivateConversationParticipant[]
  ownerId: string
  unreadMessagesCount?: number
  lastMessage: PrivateConversationMessage | null
}

export interface PrivateConversationsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PrivateConversationsApiResponse {
  items: PrivateConversation[]
  pagination: PrivateConversationsPagination
  filters: Record<string, unknown>
}

export type UpdatePrivateConversationPayload = Record<string, unknown>

function isUnauthorizedError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const maybeError = error as { status?: number, statusCode?: number }
  return maybeError.status === 401 || maybeError.statusCode === 401
}

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const maybeError = error as { status?: number, statusCode?: number }
  return maybeError.status === 404 || maybeError.statusCode === 404
}

const normalizeNotification = (notification: UserNotificationItem): UserNotificationItem => ({
  ...notification,
  preview: notification.description,
  content: notification.description,
})

const getParticipantName = (participant: PrivateConversationParticipant): string =>
  `${participant.firstName} ${participant.lastName}`.trim()

const normalizePrivateConversation = (conversation: PrivateConversation): InboxItem => {
  const participantFallbackTitle = conversation.participants
    .find((participant) => participant.id !== conversation.ownerId)
  const title = conversation.title?.trim() || (participantFallbackTitle
    ? getParticipantName(participantFallbackTitle)
    : 'Private conversation')
  const content = conversation.lastMessage?.content?.trim() || ''

  return {
    id: conversation.id,
    title,
    createdAt: conversation.lastMessage?.createdAt || conversation.createdAt,
    preview: content || undefined,
    content: content || undefined,
  }
}

export const useInboxNotificationsStore = defineStore('inbox-notifications', {
  state: () => ({
    inbox: [] as InboxItem[],
    conversationsById: {} as Record<string, PrivateConversation>,
    notifications: [] as UserNotificationItem[],
    unreadCount: 0,
  }),
  getters: {
    inboxAll: (state) => [...state.inbox],
    notificationsAll: (state) => [...state.notifications],
    inboxSortedDesc: (state) =>
      [...state.inbox].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    notificationsSortedDesc: (state) =>
      [...state.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    inboxLatestThree(): InboxItem[] {
      return this.inboxSortedDesc.slice(0, 3)
    },
    notificationsLatestThree(): UserNotificationItem[] {
      return this.notificationsSortedDesc.slice(0, 3)
    },
  },
  actions: {
    upsertInboxConversation(conversation: PrivateConversation) {
      const normalizedConversation = normalizePrivateConversation(conversation)
      const index = this.inbox.findIndex((item) => item.id === conversation.id)

      if (index >= 0) {
        this.inbox.splice(index, 1, normalizedConversation)
      }
      else {
        this.inbox.push(normalizedConversation)
      }

      this.conversationsById[conversation.id] = conversation
    },
    removeInboxConversation(conversationId: string) {
      const index = this.inbox.findIndex((item) => item.id === conversationId)
      if (index >= 0) {
        this.inbox.splice(index, 1)
      }

      this.conversationsById = Object.fromEntries(
        Object.entries(this.conversationsById).filter(([id]) => id !== conversationId),
      )
    },
    async fetchInboxConversations(page = 1, limit = 20) {
      try {
        const response = await $fetch<PrivateConversationsApiResponse>('/api/chat/private/conversations', {
          query: { page, limit },
        })

        const items = response.items || []
        this.inbox = items.map(normalizePrivateConversation)
        this.conversationsById = Object.fromEntries(items.map((conversation) => [conversation.id, conversation]))
      }
      catch (error) {
        if (isUnauthorizedError(error)) {
          this.inbox = []
          this.conversationsById = {}
          return
        }

        throw error
      }
    },
    async fetchConversationById(conversationId: string) {
      try {
        const conversation = await $fetch<PrivateConversation>(`/api/chat/private/conversations/${conversationId}`)
        this.upsertInboxConversation(conversation)
        return conversation
      }
      catch (error) {
        if (isUnauthorizedError(error)) {
          this.inbox = []
          this.conversationsById = {}
          return null
        }

        if (isNotFoundError(error)) {
          this.removeInboxConversation(conversationId)
          return null
        }

        throw error
      }
    },
    async updateConversation(conversationId: string, payload: UpdatePrivateConversationPayload) {
      try {
        const conversation = await $fetch<PrivateConversation>(`/api/chat/private/conversations/${conversationId}`, {
          method: 'PATCH',
          body: payload,
        })
        this.upsertInboxConversation(conversation)
        return conversation
      }
      catch (error) {
        if (isUnauthorizedError(error)) {
          this.inbox = []
          this.conversationsById = {}
          return null
        }

        if (isNotFoundError(error)) {
          this.removeInboxConversation(conversationId)
          return null
        }

        throw error
      }
    },
    async deleteConversation(conversationId: string) {
      const route = useRoute()
      const currentInboxConversationId = route.path.startsWith('/inbox/')
        ? route.path.slice('/inbox/'.length).split('/')[0]
        : ''
      const shouldNavigateToInbox = currentInboxConversationId === conversationId

      try {
        await $fetch(`/api/chat/private/conversations/${conversationId}`, {
          method: 'DELETE',
        })
        this.removeInboxConversation(conversationId)
      }
      catch (error) {
        if (isUnauthorizedError(error)) {
          this.inbox = []
          this.conversationsById = {}
          if (shouldNavigateToInbox) {
            await navigateTo('/inbox')
          }
          return
        }

        if (isNotFoundError(error)) {
          this.removeInboxConversation(conversationId)
        }
        else {
          throw error
        }
      }

      if (shouldNavigateToInbox) {
        await navigateTo('/inbox')
      }
    },
    async fetchNotifications(limit = 20, offset = 0) {
      try {
        const response = await $fetch<NotificationsApiResponse>('/api/notifications', {
          query: { limit, offset },
        })

        this.notifications = response.items.map(normalizeNotification)
        this.unreadCount = response.unreadCount
      }
      catch (error) {
        if (isUnauthorizedError(error)) {
          this.notifications = []
          this.unreadCount = 0
          return
        }

        throw error
      }
    },
    async fetchNotificationById(id: string) {
      const notification = normalizeNotification(await $fetch<UserNotificationItem>(`/api/notifications/${id}`))
      const index = this.notifications.findIndex((item) => item.id === id)

      if (index >= 0) {
        this.notifications.splice(index, 1, notification)
      }
      else {
        this.notifications.push(notification)
      }

      return notification
    },
    async markAllNotificationsRead() {
      await $fetch('/api/notifications/read-all', {
        method: 'PATCH',
      })

      this.notifications = this.notifications.map((item) => ({
        ...item,
        read: true,
      }))
      this.unreadCount = 0
    },
    getInboxById(id: string) {
      return this.inbox.find((item) => item.id === id)
    },
    getConversationById(id: string) {
      return this.conversationsById[id]
    },
    getNotificationById(id: string) {
      return this.notifications.find((item) => item.id === id)
    },
  },
})
