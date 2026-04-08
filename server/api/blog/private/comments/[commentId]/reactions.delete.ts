import { mutatingPrivateApiCall } from '../../../../../utils/privateApi'
import { getRequiredRouterParam } from '../../../utils'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const commentId = getRequiredRouterParam(event, 'commentId', 'comment')

  return mutatingPrivateApiCall<BlogApiResponse>(
    event,
    `/api/v1/private/blog/comments/${commentId}/reactions`,
    {
      mutationKey: 'blog:comments:reactions:delete',
      method: 'DELETE',
    },
  )
})
