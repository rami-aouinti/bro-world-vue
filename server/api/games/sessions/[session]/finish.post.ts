import { createProxyHandler } from '../../../../utils/createProxyHandler'
import type {
  GamesSessionFinishPayload,
  GamesSessionFinishResponse,
} from '~~/server/types/api/games'

export default createProxyHandler<
  GamesSessionFinishResponse,
  GamesSessionFinishPayload
>({
  method: 'POST',
  endpointTemplate: '/games/sessions/:session/finish',
  mutationKey: 'games:sessions:finish',
  resolveParams: (event) => {
    const session = getRouterParam(event, 'session')

    if (!session) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid session id',
      })
    }

    return { session }
  },
})
