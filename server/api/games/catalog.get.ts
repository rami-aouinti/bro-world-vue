import { cachedPublicGet } from '../../utils/publicApi'
import type {
  GamesCatalogApiResponse,
  GamesCatalogCategory,
  GamesCatalogGame,
} from '~~/server/types/api/games'

const PLAY_SURFACE_COMPONENT_BY_GAME_KEY: Record<string, string> = {
  checkers: 'checkerssurface',
  checkerstable: 'checkerssurface',
  uno: 'unosurface',
  rami: 'ramisurface',
  ramitable: 'ramisurface',
  poker: 'pokertablesurface',
  pokertable: 'pokertablesurface',
  belote: 'belotetablesurface',
  belotetable: 'belotetablesurface',
}

function normalizeGameIdentifier(rawValue: unknown) {
  if (typeof rawValue !== 'string') return ''
  return rawValue.replace(/[^a-z0-9]/gi, '').toLowerCase()
}

function withPlaySurfaceComponent(game: GamesCatalogGame): GamesCatalogGame {
  const existingValue = normalizeGameIdentifier(game.playSurfaceComponent)
  const gameKey = normalizeGameIdentifier(game.key ?? game.id)
  const fallbackValue = PLAY_SURFACE_COMPONENT_BY_GAME_KEY[gameKey] ?? null

  return {
    ...game,
    playSurfaceComponent: existingValue || fallbackValue,
  }
}

function enrichCategory(category: GamesCatalogCategory): GamesCatalogCategory {
  const categoryGames = Array.isArray(category.games) ? category.games : []
  const subCategories = Array.isArray(category.subCategories)
    ? category.subCategories
    : []

  return {
    ...category,
    games: categoryGames.map(withPlaySurfaceComponent),
    subCategories: subCategories.map((subCategory) => ({
      ...subCategory,
      games: Array.isArray(subCategory.games)
        ? subCategory.games.map(withPlaySurfaceComponent)
        : [],
    })),
  }
}

export default defineEventHandler(
  async (event): Promise<GamesCatalogApiResponse> => {
    const catalog = await cachedPublicGet<GamesCatalogApiResponse>(
      event,
      '/public/game-catalog',
      {
        cacheDomain: 'games',
      },
    )

    return Array.isArray(catalog) ? catalog.map(enrichCategory) : []
  },
)
