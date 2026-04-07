export interface InboxItem {
  id: string
  title: string
  createdAt: string
  preview?: string
  content?: string
}

export interface UserNotificationItem {
  id: string
  title: string
  createdAt: string
  preview?: string
  content?: string
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

const mockNotificationItems: UserNotificationItem[] = [
  {
    id: 'security-alert',
    title: 'Security alert',
    createdAt: '2026-04-07T10:30:00Z',
    preview: 'A new login was detected on your account.',
    content:
      'A new login was detected on your account from an unrecognized device. If this was not you, reset your password.',
  },
  {
    id: 'billing-reminder',
    title: 'Billing reminder',
    createdAt: '2026-04-06T11:20:00Z',
    preview: 'Your subscription renews in 3 days.',
    content:
      'Your subscription renews in 3 days. Ensure your payment method is still valid to avoid service interruption.',
  },
  {
    id: 'weekly-report',
    title: 'Weekly report is ready',
    createdAt: '2026-04-03T13:10:00Z',
    preview: 'The analytics report has been generated.',
    content:
      'The analytics report has been generated and is available in your dashboard exports section.',
  },
  {
    id: 'team-invite',
    title: 'New team invite',
    createdAt: '2026-04-05T16:55:00Z',
    preview: 'You have been invited to join a new workspace.',
    content:
      'You have been invited to join a new workspace. Accept the invitation to start collaborating with the team.',
  },
]

export const useInboxNotificationsStore = defineStore('inbox-notifications', {
  state: () => ({
    inbox: mockInboxItems,
    notifications: mockNotificationItems,
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
    getInboxById(id: string) {
      return this.inbox.find((item) => item.id === id)
    },
    getNotificationById(id: string) {
      return this.notifications.find((item) => item.id === id)
    },
  },
})
