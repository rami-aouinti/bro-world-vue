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

function isUnauthorizedError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const maybeError = error as { status?: number, statusCode?: number }
  return maybeError.status === 401 || maybeError.statusCode === 401
}

const mockInboxItems: InboxItem[] = [
  {
    id: 'project-kickoff',
    title: 'Project kickoff notes',
    createdAt: '2026-04-05T14:00:00Z',
    preview: 'Summary and decisions from the project kickoff meeting.',
    content:
      'Summary and decisions from the project kickoff meeting. Next step: validate milestones with the product team.',
  },
  {
    id: 'design-review',
    title: 'Design review feedback',
    createdAt: '2026-04-06T09:15:00Z',
    preview: 'Updated comments about the latest design iteration.',
    content:
      'Updated comments about the latest design iteration. Focus changes on accessibility and spacing consistency.',
  },
  {
    id: 'invoice-follow-up',
    title: 'Invoice follow-up',
    createdAt: '2026-04-04T17:45:00Z',
    preview: 'Reminder to validate invoice details before payment.',
    content:
      'Reminder to validate invoice details before payment. Finance asks for confirmation by end of day.',
  },
  {
    id: 'q2-planning',
    title: 'Q2 planning sync',
    createdAt: '2026-04-07T08:30:00Z',
    preview: 'Agenda and follow-up for Q2 planning.',
    content:
      'Agenda and follow-up for Q2 planning. Please review priorities and update your capacity by tomorrow.',
  },
]

const normalizeNotification = (notification: UserNotificationItem): UserNotificationItem => ({
  ...notification,
  preview: notification.description,
  content: notification.description,
})

export const useInboxNotificationsStore = defineStore('inbox-notifications', {
  state: () => ({
    inbox: mockInboxItems,
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
    getNotificationById(id: string) {
      return this.notifications.find((item) => item.id === id)
    },
  },
})
