import { cachedPublicGet } from '../../utils/publicApi'

type PluginPublicResponse = Array<Record<string, unknown>>

export default defineEventHandler(async (event): Promise<PluginPublicResponse> => {
  return cachedPublicGet<PluginPublicResponse>(event, '/plugin/public')
})
