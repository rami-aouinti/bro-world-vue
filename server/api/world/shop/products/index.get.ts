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

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parsePositiveInt(query.page, 1)
  const limit = parsePositiveInt(query.limit, 20)

  const response = await callPublicApi<PublicShopProductsResponse>(
    event,
    '/shop/general/products',
    {
      query: { page, limit },
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
    amount: product.price,
    stock: product.stock,
    coinsAmount: product.coinsAmount,
    isFeatured: product.isFeatured,
    tags: product.tags ?? [],
    createdAt: product.updatedAt,
    updatedAt: product.updatedAt,
  }))

  const q = typeof query.q === 'string' ? query.q.toLowerCase().trim() : ''
  const name =
    typeof query.name === 'string' ? query.name.toLowerCase().trim() : ''
  const category =
    typeof query.category === 'string' ? query.category.toLowerCase().trim() : ''
  const status =
    query.status === 'draft' || query.status === 'active' || query.status === 'archived'
      ? query.status
      : undefined

  const filtered = normalizedProducts.filter((product) => {
    if (status && product.status !== status) return false
    if (
      q &&
      !`${product.name} ${product.description}`.toLowerCase().includes(q)
    ) {
      return false
    }
    if (name && !product.name.toLowerCase().includes(name)) return false
    if (category && !product.category.toLowerCase().includes(category)) {
      return false
    }
    return true
  })

  const total = response.pagination?.totalItems ?? filtered.length
  const totalPages =
    response.pagination?.totalPages ?? Math.max(1, Math.ceil(total / Math.max(1, limit)))

  return {
    data: filtered,
    meta: {
      pagination: {
        page: response.pagination?.page ?? page,
        limit: response.pagination?.limit ?? limit,
        total,
        totalItems: total,
        totalPages,
      },
      filters: {
        q: typeof query.q === 'string' ? query.q : undefined,
        name: typeof query.name === 'string' ? query.name : undefined,
        category: typeof query.category === 'string' ? query.category : undefined,
        status,
        page,
        limit,
      } satisfies ShopApiProductsFilters,
      upstreamFilters: response.meta?.filters ?? [],
    },
  }
})
