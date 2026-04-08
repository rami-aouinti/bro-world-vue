import { callPrivateApi } from '../../../../../utils/privateApi'
import { getRequiredRouterParam } from '../../../utils'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const commentId = getRequiredRouterParam(event, 'commentId', 'comment')

  return callPrivateApi<BlogApiResponse>(
    event,
    `/api/v1/private/blog/comments/${commentId}/reactions`,
    {
      method: 'DELETE',
    },
  )
})
