import type { ApiObject, ResourceMutationPayload } from './common'

export type CalendarApiResponse = ApiObject

export type CreateCalendarEventPayload = ResourceMutationPayload<
  'calendar.event',
  {
    title: string
    startAt: string
    endAt?: string
  }
>

export type UpdateCalendarEventPayload = ResourceMutationPayload<
  'calendar.event',
  {
    title?: string
    startAt?: string
    endAt?: string
  }
>

export type CancelCalendarEventPayload = ResourceMutationPayload<
  'calendar.event',
  {
    reason?: string
  }
>
