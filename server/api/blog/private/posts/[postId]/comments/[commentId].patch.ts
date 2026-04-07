import { callPrivateApi } from '../../../../../../utils/privateApi'
import { getRequiredRouterParam } from '../../../../utils'

export default defineEventHandler(async (event): Promise<unknown> => {
  const postId = getRequiredRouterParam(event, 'postId', 'post')
  const commentId = getRequiredRouterParam(event, 'commentId', 'comment')
  const body = await readBody(event)

  return callPrivateApi(event, `/api/v1/private/blog/posts/${postId}/comments/${commentId}`, {
    method: 'PATCH',
    body,
  })
})
