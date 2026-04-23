import type { ShopProductStatus } from '~~/app/types/world/shop'
import type { ShopApiProductsFilters } from '~~/server/types/api/shop'
import { callPublicApi } from '~~/server/utils/publicApi'

interface PublicShopProduct {
  id: string
  name: string
  sku: string
  description: string
  photo?: string
  price: number
  discountedPrice?: number
  promotionPercentage?: number
  texture?: string | null
  currencyCode: string
  stock: number
  coinsAmount: number
  isFeatured: boolean
  status: ShopProductStatus
  categoryId?: string
  categoryName?: string
  tags?: string[]
  updatedAt: string
}

interface PublicShopProductsResponse {
  items?: PublicShopProduct[]
  pagination?: {
    page?: number
    limit?: number
    totalItems?: number
    totalPages?: number
  }
  meta?: {
    filters?: unknown[]
  }
}

function parsePositiveInt(value: unknown, fallback: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.max(1, Math.floor(parsed))
}

function parseNonNegativeNumber(value: unknown) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return undefined
  }

  return Math.max(0, parsed)
}

function parseNonNegativeInt(value: unknown) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return undefined
  }

  return Math.max(0, Math.floor(parsed))
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parsePositiveInt(query.page, 1)
  const limit = parsePositiveInt(query.limit, 20)
  const minPrice = parseNonNegativeNumber(query.minPrice)
  const maxPrice = parseNonNegativeNumber(query.maxPrice)
  const promotion = parseNonNegativeInt(query.promotion)
  const q = typeof query.q === 'string' ? query.q : undefined
  const name = typeof query.name === 'string' ? query.name : undefined
  const category =
    typeof query.category === 'string' ? query.category : undefined
  const status =
    query.status === 'draft' ||
    query.status === 'active' ||
    query.status === 'archived'
      ? query.status
      : undefined

  const sentFilters = {
    q,
    name,
    category,
    status,
    minPrice,
    maxPrice,
    promotion,
    page,
    limit,
  } satisfies ShopApiProductsFilters

  const response = await callPublicApi<PublicShopProductsResponse>(
    event,
    '/api/v1/shop/products',
    {
      query: sentFilters,
    },
  )

  const normalizedProducts = (response.items ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    slug: product.sku,
    description: product.description,
    photo: product.photo ?? '',
    status: product.status,
    category: product.categoryName ?? 'Uncategorized',
    categoryId: product.categoryId,
    categoryName: product.categoryName ?? 'Uncategorized',
    currencyCode: product.currencyCode,
    price: product.price,
    discountedPrice: product.discountedPrice,
    promotionPercentage: product.promotionPercentage,
    texture: product.texture ?? null,
    amount: product.price,
    stock: product.stock,
    coinsAmount: product.coinsAmount,
    isFeatured: product.isFeatured,
    tags: product.tags ?? [],
    createdAt: product.updatedAt,
    updatedAt: product.updatedAt,
  }))

  const totalItems =
    response.pagination?.totalItems ?? normalizedProducts.length
  const totalPages =
    response.pagination?.totalPages ??
    Math.max(
      1,
      Math.ceil(totalItems / Math.max(1, response.pagination?.limit ?? limit)),
    )

  return {
    data: normalizedProducts,
    meta: {
      pagination: {
        page: response.pagination?.page ?? page,
        limit: response.pagination?.limit ?? limit,
        total: totalItems,
        totalItems,
        totalPages,
      },
      filters: sentFilters,
      upstreamFilters: response.meta?.filters ?? [],
    },
  }
})
