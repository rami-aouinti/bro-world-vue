import { callPrivateApi } from '../../../../../utils/privateApi'
import { getRequiredRouterParam } from '../../../utils'

export default defineEventHandler(async (event): Promise<unknown> => {
  const commentId = getRequiredRouterParam(event, 'commentId', 'comment')
  const body = await readBody(event)

  return callPrivateApi(
    event,
    `/api/v1/private/blog/comments/${commentId}/reactions`,
    {
      method: 'POST',
      body,
    },
  )
})
