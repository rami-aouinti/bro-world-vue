import type { ApiObject, ResourceMutationPayload } from './common'

export type StoriesApiResponse = ApiObject

export type CreateStoryPayload = ResourceMutationPayload<
  'stories',
  {
    content?: string
  }
>
