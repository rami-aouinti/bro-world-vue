export type ShopGeneralProductStatus =
  | 'draft'
  | 'active'
  | 'published'
  | 'archived'
  | 'unpublished'

export interface ShopGeneralCategory {
  id: string
  name: string
  slug: string
  description: string
  photo?: string
  shopId?: string
  createdAt: string
  updatedAt: string
}

export interface ShopGeneralProduct {
  id: string
  name: string
  slug: string
  sku?: string
  description: string
  photo?: string
  status: ShopGeneralProductStatus
  category: string
  categoryId?: string
  categoryName?: string
  currencyCode: string
  price?: number
  discountedPrice?: number
  promotionPercentage?: number
  texture?: string | null
  amount: number
  stock?: number
  coinsAmount: number
  isFeatured: boolean
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface ShopGeneralProductsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ShopGeneralProductsFilters {
  q?: string
  name?: string
  category?: string
  status?: ShopGeneralProductStatus
  minPrice?: number
  maxPrice?: number
  promotion?: number
  page?: number
  limit?: number
}

export interface ShopGeneralProductsMeta {
  pagination: ShopGeneralProductsPagination
  filters: ShopGeneralProductsFilters
}

export interface ShopGeneralProductsResponse {
  items: ShopGeneralProduct[]
  pagination?: ShopGeneralProductsPagination
  meta?: ShopGeneralProductsMeta
}

export interface ShopGeneralProductDetailResponse {
  product: ShopGeneralProduct
  similarProducts?: ShopGeneralProduct[]
}

export interface ShopGeneralCartLine {
  productId: string
  name: string
  unitPrice: number
  quantity: number
  id?: string
  unitPriceSnapshot?: number
  lineTotal?: number
  product?: {
    id?: string
    name?: string
  }
}

export interface ShopGeneralCart {
  id: string
  shopId: string
  currency: string
  currencyCode?: string
  items: ShopGeneralCartLine[]
  cart?: ShopGeneralCartLine[]
  subtotal?: number
  subtotalAmount: number
  totalAmount: number
  createdAt?: string
  updatedAt?: string
}

export interface ShopGeneralOrderLine {
  sku?: string
  productId: string
  title: string
  quantity: number
  unitPrice: number
}

export interface ShopGeneralOrder {
  id: string
  status:
    | 'pending'
    | 'paid'
    | 'packed'
    | 'shipped'
    | 'delivered'
    | 'returned'
    | 'refunded'
  currency: string
  amount: number
  createdAt: string
  lines?: ShopGeneralOrderLine[]
}

export interface ShopGeneralOrdersResponse {
  items: ShopGeneralOrder[]
}

export interface ShopGeneralTransaction {
  id: string
  orderId?: string
  checkoutId?: string
  provider: 'stripe' | 'adyen' | 'paypal'
  status: 'pending' | 'failed' | 'succeeded'
  amount?: number
  currency?: string
  reason?: string
  createdAt?: string
  updatedAt?: string
}

export function normalizeShopProductsFilters(
  filters: ShopGeneralProductsFilters,
): ShopGeneralProductsFilters {
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

export type WorldShopFilters = ShopGeneralProductsFilters

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

export interface WorldShopCartLine extends ShopGeneralCartLine {}

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

export type ShopGeneralCheckoutSession = WorldShopCheckoutSession

export interface WorldShopPaymentIntentResponse {
  checkout: WorldShopCheckoutSession
  attempt: WorldShopPaymentAttempt
}

export type WorldShopCategoriesListResponse = {
  data: ShopGeneralCategory[]
  tree: Array<ShopGeneralCategory & { children: ShopGeneralCategory[] }>
}

// Backward-compatible aliases while code is migrated.
export type ShopProductStatus = ShopGeneralProductStatus
export type ShopCategory = ShopGeneralCategory
export type ShopProduct = ShopGeneralProduct
