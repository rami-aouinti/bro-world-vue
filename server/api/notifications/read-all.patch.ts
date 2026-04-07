import { callPrivateApi } from '../../utils/privateApi'

export default defineEventHandler(async (event): Promise<unknown> => {
  return callPrivateApi(event, '/notifications/read-all', {
    method: 'PATCH',
  })
})
