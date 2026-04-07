import { callPrivateApi } from '../../../../utils/privateApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  return callPrivateApi(event, '/api/v1/private/blog/posts/mine')
})
