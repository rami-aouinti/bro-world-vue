import { callPrivateApi } from '../../../../../utils/privateApi'
import { getRequiredRouterParam } from '../../../utils'
import type { BlogReactionPayload } from '~~/server/types/api/blog'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const commentId = getRequiredRouterParam(event, 'commentId', 'comment')
  const body = await readBody<BlogReactionPayload>(event)

  return callPrivateApi<BlogApiResponse>(
    event,
    `/api/v1/private/blog/comments/${commentId}/reactions`,
    {
      method: 'PATCH',
      body,
    },
  )
})
