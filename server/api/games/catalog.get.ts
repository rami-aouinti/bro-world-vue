import legacyGamesCatalog from '../../data/legacy-games-catalog.json'
import { cachedPublicGet } from '../../utils/publicApi'
import type {
  GamesCatalogApiResponse,
  GamesCatalogCategory,
  GamesCatalogGame,
} from '~~/server/types/api/games'

const PLAY_SURFACE_COMPONENT_BY_GAME_KEY: Record<string, string> = {
  checkers: 'checkerssurface',
  checkerstable: 'checkerssurface',
  chess: 'checkerssurface',
  uno: 'unosurface',
  rami: 'ramisurface',
  ramitable: 'ramisurface',
  poker: 'pokertablesurface',
  pokertable: 'pokertablesurface',
  belote: 'belotetablesurface',
  belotetable: 'belotetablesurface',
  solitaire: 'pokertablesurface',
  hearts: 'pokertablesurface',
  spades: 'pokertablesurface',
  ludo: 'checkerssurface',
  sudoku: 'checkerssurface',
  game2048: 'checkerssurface',
  hiddenword: 'checkerssurface',
  nonogram: 'checkerssurface',
  flappyrocket: 'checkerssurface',
}

function normalizeGameIdentifier(rawValue: unknown) {
  if (typeof rawValue !== 'string') return ''
  return rawValue.replace(/[^a-z0-9]/gi, '').toLowerCase()
}

function normalizeModes(rawModes: unknown): string[] {
  if (!Array.isArray(rawModes)) return []

  return rawModes
    .filter((mode): mode is string => typeof mode === 'string')
    .map((mode) => mode.trim().toLowerCase())
}

function withPlaySurfaceComponent(game: GamesCatalogGame): GamesCatalogGame {
  const existingValue = normalizeGameIdentifier(game.playSurfaceComponent)
  const gameKey = normalizeGameIdentifier(game.key ?? game.id)
  const componentKey = normalizeGameIdentifier(game.component)
  const fallbackValue =
    PLAY_SURFACE_COMPONENT_BY_GAME_KEY[gameKey] ??
    PLAY_SURFACE_COMPONENT_BY_GAME_KEY[componentKey] ??
    null

  const supportedModes = normalizeModes(game.supportedModes)
  const supportsAiOpponent = supportedModes.includes('ai')
  const requiresOpponent =
    supportedModes.includes('pvp') || supportedModes.includes('versus')

  return {
    ...game,
    minPlayers:
      typeof game.minPlayers === 'number' && Number.isInteger(game.minPlayers)
        ? game.minPlayers
        : 1,
    maxPlayers:
      typeof game.maxPlayers === 'number' && Number.isInteger(game.maxPlayers)
        ? game.maxPlayers
        : requiresOpponent
          ? 2
          : 1,
    allowedPlayerCounts: Array.isArray(game.allowedPlayerCounts)
      ? game.allowedPlayerCounts
      : requiresOpponent
        ? [2]
        : [1],
    supportsAiOpponent,
    requiresOpponent,
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
    try {
      const catalog = await cachedPublicGet<GamesCatalogApiResponse>(
        event,
        '/public/game-catalog',
        {
          cacheDomain: 'games',
        },
      )

      if (Array.isArray(catalog) && catalog.length > 0) {
        return catalog.map(enrichCategory)
      }
    } catch {
      // Fallback on legacy catalog when public endpoint is unavailable.
    }

    return (legacyGamesCatalog as GamesCatalogApiResponse).map(enrichCategory)
  },
)
