import { callPrivateApi } from '../../../../../utils/privateApi'
import { getRequiredRouterParam } from '../../../utils'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const postId = getRequiredRouterParam(event, 'postId', 'post')

  return callPrivateApi<BlogApiResponse>(
    event,
    `/api/v1/private/blog/posts/${postId}/reactions`,
    {
      method: 'DELETE',
    },
  )
})
