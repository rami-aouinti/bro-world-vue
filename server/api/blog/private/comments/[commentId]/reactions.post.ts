import { mutatingPrivateApiCall } from '../../../../../utils/privateApi'
import { getRequiredRouterParam } from '../../../utils'
import type {
  BlogReactionPayload,
  BlogApiResponse,
} from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const commentId = getRequiredRouterParam(event, 'commentId', 'comment')
  const body = await readBody<BlogReactionPayload>(event)

  return mutatingPrivateApiCall<BlogApiResponse>(
    event,
    `/api/v1/private/blog/comments/${commentId}/reactions`,
    {
      mutationKey: 'blog:comments:reactions:create',
      method: 'POST',
      body,
    },
  )
})
