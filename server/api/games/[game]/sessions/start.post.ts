import { createProxyHandler } from '../../../../utils/createProxyHandler'
import type {
  GamesSessionStartPayload,
  GamesSessionStartResponse,
} from '~~/server/types/api/games'

export default createProxyHandler<GamesSessionStartResponse, GamesSessionStartPayload>({
  method: 'POST',
  endpointTemplate: '/games/:game/sessions/start',
  mutationKey: 'games:sessions:start',
  resolveParams: (event) => {
    const game = getRouterParam(event, 'game')

    if (!game) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid game id',
      })
    }

    return { game }
  },
})
