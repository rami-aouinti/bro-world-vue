import type { ShopCategory, ShopProduct } from '~~/server/types/api/shop'

export interface WorldPaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface WorldShopFilters {
  q?: string
  categoryId?: string
  status?: ShopProduct['status']
  brand?: string
  material?: string
  color?: string
  size?: string
  priceMin?: number
  priceMax?: number
}

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

export type WorldShopProductsListResponse = WorldShopListResponse<ShopProduct>
export type WorldShopCategoriesListResponse = {
  data: ShopCategory[]
  tree: Array<ShopCategory & { children: ShopCategory[] }>
}
