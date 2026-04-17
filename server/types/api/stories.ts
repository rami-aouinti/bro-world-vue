import type { ApiObject, ResourceMutationPayload } from './common'

export type StoryItem = {
  id: string
  imageUrl: string
  createdAt: string
  expiresAt: string
}

export type StoriesListResponse = {
  stories: StoryItem[]
}

export type StoriesApiResponse = ApiObject | StoriesListResponse | StoryItem

export type CreateStoryPayload = ResourceMutationPayload<
  'stories',
  {
    content?: string
  }
>
