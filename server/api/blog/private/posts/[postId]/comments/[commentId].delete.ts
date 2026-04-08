import { callPrivateApi } from '../../../../../../utils/privateApi'
import { getRequiredRouterParam } from '../../../../utils'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const postId = getRequiredRouterParam(event, 'postId', 'post')
  const commentId = getRequiredRouterParam(event, 'commentId', 'comment')

  return callPrivateApi<BlogApiResponse>(
    event,
    `/api/v1/private/blog/posts/${postId}/comments/${commentId}`,
    {
      method: 'DELETE',
    },
  )
})
