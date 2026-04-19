import { cachedPublicGet } from '../../utils/publicApi'

type PlatformPublicResponse = Array<Record<string, unknown>>

export default defineEventHandler(
  async (event): Promise<PlatformPublicResponse> => {
    return cachedPublicGet<PlatformPublicResponse>(event, '/platform/public')
  },
)
