import { callPrivateApi } from '../../../../../utils/privateApi'
import { getRequiredRouterParam } from '../../../utils'

export default defineEventHandler(async (event): Promise<unknown> => {
  const postId = getRequiredRouterParam(event, 'postId', 'post')
  const body = await readBody(event)

  return callPrivateApi(
    event,
    `/api/v1/private/blog/posts/${postId}/reactions`,
    {
      method: 'PATCH',
      body,
    },
  )
})
