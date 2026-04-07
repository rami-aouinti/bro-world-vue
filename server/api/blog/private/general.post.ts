import { callPrivateApi } from '../../../utils/privateApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  const body = await readBody(event)

  return callPrivateApi(event, '/api/v1/private/blogs/general', {
    method: 'POST',
    body,
  })
})
