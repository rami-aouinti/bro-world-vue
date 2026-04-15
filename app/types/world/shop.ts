export type ShopProductStatus = 'draft' | 'active' | 'archived'

export interface ShopCategory {
  id: string
  name: string
  slug: string
  description: string
  photo?: string
  shopId?: string
  createdAt: string
  updatedAt: string
}

export interface ShopProduct {
  id: string
  name: string
  slug: string
  sku?: string
  description: string
  photo?: string
  status: ShopProductStatus
  category: string
  categoryId?: string
  categoryName?: string
  currencyCode: string
  amount: number
  stock?: number
  coinsAmount: number
  isFeatured: boolean
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface ShopProductsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ShopProductsFilters {
  q?: string
  name?: string
  category?: string
  status?: ShopProductStatus
  minPrice?: number
  maxPrice?: number
  promotion?: number
  page?: number
  limit?: number
}

export interface ShopProductsMeta {
  pagination: ShopProductsPagination
  filters: ShopProductsFilters
}

export interface ShopProductsListResponse {
  data: ShopProduct[]
  meta: ShopProductsMeta
}

export interface ShopProductDetailData {
  product: ShopProduct
  similarProducts?: ShopProduct[]
}

export interface ShopProductDetailResponse {
  data: ShopProduct | ShopProductDetailData
  similarProducts?: ShopProduct[]
}

export function normalizeShopProductsFilters(
  filters: ShopProductsFilters,
): ShopProductsFilters {
  const trimOrUndefined = (value?: string) => {
    if (typeof value !== 'string') return undefined
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }

  const normalizedCategory = trimOrUndefined(filters.category)
  const normalizeNonNegativeNumber = (value: unknown) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
    return Math.max(0, value)
  }
  const normalizeNonNegativeInteger = (value: unknown) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
    return Math.max(0, Math.floor(value))
  }

  return {
    q: trimOrUndefined(filters.q),
    name: trimOrUndefined(filters.name),
    category: normalizedCategory?.toUpperCase(),
    status: filters.status,
    minPrice: normalizeNonNegativeNumber(filters.minPrice),
    maxPrice: normalizeNonNegativeNumber(filters.maxPrice),
    promotion: normalizeNonNegativeInteger(filters.promotion),
    page:
      typeof filters.page === 'number' && Number.isFinite(filters.page)
        ? Math.max(1, Math.floor(filters.page))
        : undefined,
    limit:
      typeof filters.limit === 'number' && Number.isFinite(filters.limit)
        ? Math.max(1, Math.floor(filters.limit))
        : undefined,
  }
}

export interface WorldPaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type WorldShopFilters = ShopProductsFilters

export interface WorldShopListResponse<T> {
  data: T[]
  total: number
  facets?: Record<string, string[]>
}

export interface WorldShopDetailResponse<T> {
  data: T
}

export interface WorldShopCheckoutAddress {
  fullName: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

export interface WorldShopCartLine {
  productId: string
  name: string
  unitPrice: number
  quantity: number
}

export interface WorldShopShippingOption {
  id: string
  label: string
  carrier: string
  amount: number
  etaDays: number
}

export interface WorldShopPaymentAttempt {
  id: string
  provider: 'stripe' | 'adyen' | 'paypal'
  status: 'pending' | 'failed' | 'succeeded'
  reason?: string
  providerPaymentId?: string
  clientSecret?: string
}

export interface WorldShopCheckoutSession {
  id: string
  step: 'cart' | 'address' | 'shipping' | 'payment' | 'confirmation'
  status: 'draft' | 'payment_pending' | 'processing' | 'paid' | 'failed'
  currency: string
  cart: WorldShopCartLine[]
  subtotalAmount: number
  shippingAmount: number
  totalAmount: number
  shippingOptions: WorldShopShippingOption[]
  selectedShippingId?: string
  providerPaymentId?: string
  lastError?: string
  attempts?: WorldShopPaymentAttempt[]
}

export interface WorldShopPaymentIntentResponse {
  checkout: WorldShopCheckoutSession
  attempt: WorldShopPaymentAttempt
}

export type WorldShopProductsListResponse =
  | ShopProductsListResponse
  | WorldShopListResponse<ShopProduct>

export type WorldShopCategoriesListResponse = {
  data: ShopCategory[]
  tree: Array<ShopCategory & { children: ShopCategory[] }>
}
