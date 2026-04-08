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
  }
>

export type UpdateBlogPostPayload = ResourceMutationPayload<
  'blog.post',
  {
    content?: string
    title?: string
  }
>

export type CreateBlogCommentPayload = ResourceMutationPayload<
  'blog.comment',
  {
    content: string
    postId: string
  }
>

export type UpdateBlogCommentPayload = ResourceMutationPayload<
  'blog.comment',
  {
    content: string
    commentId: string
  }
>

export type BlogReactionPayload = ResourceMutationPayload<
  'blog.reaction',
  {
    reactionTypeId: string
  }
>
