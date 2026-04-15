import type { ShopApiProduct, ShopApiProductsFilters } from '~~/server/types/api/shop'
import { getShopCatalog } from '~~/server/utils/shopCatalog'

function parsePositiveInt(value: unknown, fallback: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.max(1, Math.floor(parsed))
}

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
  const query = getQuery(event)
  const catalog = await getShopCatalog()

  const categoriesById = new Map(catalog.categories.map((category) => [category.id, category.name]))

  let products = catalog.products

  if (typeof query.status === 'string') {
    products = products.filter((product) => product.status === query.status)
  }

  if (typeof query.q === 'string' && query.q.trim()) {
    const q = query.q.toLowerCase().trim()
    products = products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q),
    )
  }

  if (typeof query.name === 'string' && query.name.trim()) {
    const name = query.name.toLowerCase().trim()
    products = products.filter((product) => product.name.toLowerCase().includes(name))
  }

  if (typeof query.category === 'string' && query.category.trim()) {
    const categoryNeedle = query.category.toLowerCase().trim()
    products = products.filter((product) =>
      product.categoryIds.some((categoryId) =>
        categoriesById.get(categoryId)?.toLowerCase().includes(categoryNeedle),
      ),
    )
  }

  const page = parsePositiveInt(query.page, 1)
  const limit = parsePositiveInt(query.limit, 20)

  const total = products.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const start = (page - 1) * limit
  const end = start + limit

  return {
    data: products.slice(start, end).map((product) => toApiProduct(product, categoriesById)),
    meta: {
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      filters: {
        q: typeof query.q === 'string' ? query.q : undefined,
        name: typeof query.name === 'string' ? query.name : undefined,
        category: typeof query.category === 'string' ? query.category : undefined,
        status:
          query.status === 'draft' || query.status === 'active' || query.status === 'archived'
            ? query.status
            : undefined,
        page,
        limit,
      } satisfies ShopApiProductsFilters,
    },
  }
})
