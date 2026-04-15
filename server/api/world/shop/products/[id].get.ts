import type { ShopApiProduct } from '~~/server/types/api/shop'
import { getShopCatalog } from '~~/server/utils/shopCatalog'

function toApiProduct(
  product: Awaited<ReturnType<typeof getShopCatalog>>['products'][number],
  categoriesById: Map<string, string>,
): ShopApiProduct {
  const categoryName =
    product.categoryIds
      .map((categoryId) => categoriesById.get(categoryId))
      .find((name): name is string => typeof name === 'string') ?? 'Uncategorized'

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    status: product.status,
    category: categoryName,
    currencyCode: 'EUR',
    amount: product.price,
    coinsAmount: Math.max(1, Math.round(product.price * 100)),
    isFeatured: product.stock > 25,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const catalog = await getShopCatalog()

  const product = catalog.products.find((item) => item.id === id)
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const categoriesById = new Map(catalog.categories.map((category) => [category.id, category.name]))

  return { data: toApiProduct(product, categoriesById) }
})
