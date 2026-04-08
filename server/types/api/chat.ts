import type { ApiObject, ResourceMutationPayload } from './common'

export type ChatApiResponse = ApiObject

export type UpdateConversationPayload = ResourceMutationPayload<
  'chat.conversation',
  {
    title?: string
  }
>

export type SendMessagePayload = ResourceMutationPayload<
  'chat.message',
  {
    content: string
    conversationId: string
  }
>

export type MarkMessagesReadPayload = ResourceMutationPayload<
  'chat.message',
  {
    messageIds: string[]
    conversationId: string
  }
>

export type UpdateMessagePayload = ResourceMutationPayload<
  'chat.message',
  {
    content: string
    messageId: string
  }
>

export type ChatReactionPayload = ResourceMutationPayload<
  'chat.reaction',
  {
    reactionTypeId: string
  }
>
