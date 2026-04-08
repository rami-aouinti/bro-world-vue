import type { ApiObject, ResourceMutationPayload } from './common'

export type NotificationsApiResponse = ApiObject

export type ReadAllNotificationsPayload = ResourceMutationPayload<
  'notifications',
  {
    read: true
  }
>
