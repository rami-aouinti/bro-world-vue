import { mutatingPrivateApiCall } from '../../../../../utils/privateApi'
import { getRequiredRouterParam } from '../../../utils'
import type { BlogReactionPayload } from '~~/server/types/api/blog'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const postId = getRequiredRouterParam(event, 'postId', 'post')
  const body = await readBody<BlogReactionPayload>(event)

  return mutatingPrivateApiCall<BlogApiResponse>(
    event,
    `/api/v1/private/blog/posts/${postId}/reactions`,
    {
      mutationKey: 'blog:posts:reactions:create',
      method: 'POST',
      body,
    },
  )
})
