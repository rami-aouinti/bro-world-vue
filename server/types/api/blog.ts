import type { ApiObject, ResourceMutationPayload } from './common'

export type BlogApiResponse = ApiObject

export type BlogListQuery = {
  page: number
  limit: number
}

export type CreateBlogPostPayload = ResourceMutationPayload<
  'blog.post',
  {
    content: string
    title?: string
    sharedUrl?: string
    filePath?: string
    isPinned?: boolean
    parentPostId?: string
  }
>

export type UpdateBlogPostPayload = ResourceMutationPayload<
  'blog.post',
  {
    content?: string
    title?: string
    sharedUrl?: string
    filePath?: string
    isPinned?: boolean
  }
>

export type CreateBlogCommentPayload = ResourceMutationPayload<
  'blog.comment',
  {
    content: string
    parentCommentId?: string
  }
>

export type UpdateBlogCommentPayload = ResourceMutationPayload<
  'blog.comment',
  {
    content: string
  }
>

export type BlogReactionTypeCode = 'like' | 'heart' | 'laugh' | 'celebrate'

export type BlogReactionPayload = ResourceMutationPayload<
  'blog.reaction',
  {
    type: BlogReactionTypeCode
  }
>
