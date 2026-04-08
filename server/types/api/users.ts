import type { ApiObject, ResourceMutationPayload } from './common'

export type UsersApiResponse = ApiObject

export type UserBlockPayload = ResourceMutationPayload<
  'users.block',
  {
    userId: string
  }
>

export type UserFriendActionPayload = ResourceMutationPayload<
  'users.friend',
  {
    userId: string
    action: string
  }
>
