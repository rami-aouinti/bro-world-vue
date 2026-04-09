import { getQuery } from 'h3'
import { cachedPublicGet } from '../../utils/publicApi'
import type {
  GamesPublicCatalogApiResponse,
  GamesPublicCatalogItem,
} from '~~/server/types/api/games'

function clampLimit(value: unknown) {
  if (typeof value !== 'string') return 3

  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return 3

  return Math.max(1, Math.min(6, parsed))
}

function pickRandomItems(items: GamesPublicCatalogItem[], count: number) {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ]
  }

  return shuffled.slice(0, count)
}

export default defineEventHandler(async (event) => {
  const limit = clampLimit(getQuery(event).limit)

  const response = await cachedPublicGet<GamesPublicCatalogApiResponse>(
    event,
    '/games',
    {
      cacheDomain: 'games',
    },
  )

  const availableGames = (response.items ?? []).filter(
    (game) =>
      game.status === 'ACTIVE' &&
      Boolean(game.component) &&
      typeof game.key === 'string' &&
      game.key.length > 0,
  )

  return pickRandomItems(availableGames, limit)
})
