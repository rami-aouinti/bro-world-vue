import { cachedPrivateGet } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event) => {
  return cachedPrivateGet(event, '/api/v1/statistics')
})
