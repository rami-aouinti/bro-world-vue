import { callPrivateApi } from '../../../utils/privateApi'
import { getPaginationQuery } from '../utils'

export default defineEventHandler(async (event): Promise<unknown> => {
  const { page, limit } = getPaginationQuery(event)

  return callPrivateApi(event, '/api/v1/private/blogs/general', {
    query: { page, limit },
  })
})
