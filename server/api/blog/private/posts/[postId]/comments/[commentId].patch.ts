import { mutatingPrivateApiCall } from '../../../../../../utils/privateApi'
import { getRequiredRouterParam } from '../../../../utils'
import type { UpdateBlogCommentPayload } from '~~/server/types/api/blog'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const postId = getRequiredRouterParam(event, 'postId', 'post')
  const commentId = getRequiredRouterParam(event, 'commentId', 'comment')
  const body = await readBody<UpdateBlogCommentPayload>(event)

  return mutatingPrivateApiCall<BlogApiResponse>(
    event,
    `/api/v1/private/blog/posts/${postId}/comments/${commentId}`,
    {
      mutationKey: 'blog:posts:comments:update',
      method: 'PATCH',
      body,
    },
  )
})
