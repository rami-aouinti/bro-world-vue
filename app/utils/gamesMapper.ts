import type {
  GamesCatalogApiResponse,
  GamesCatalogCategory,
  GamesCatalogSubCategory,
  GamesLevelsApiResponse,
} from '~~/server/types/api/games'

export type CategoryItem = GamesCatalogCategory

function mapSubCategory(subCategory: GamesCatalogSubCategory): GamesCatalogSubCategory {
  return {
    ...subCategory,
    games: subCategory.games ?? [],
  }
}

export function mapCatalogResponseToCategories(response: GamesCatalogApiResponse): CategoryItem[] {
  return response.map(category => ({
    ...category,
    subCategories: (category.subCategories ?? []).map(mapSubCategory),
    games: category.games ?? [],
  }))
}

export function mapLevelsResponseToValues(response: GamesLevelsApiResponse): string[] {
  return (response.items ?? []).map(item => item.value.toLowerCase())
}
