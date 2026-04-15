import type { ShopCategory, ShopProduct } from '~~/server/types/api/shop'
import type {
  WorldPaginationState,
  WorldShopCartLine,
  WorldShopCheckoutAddress,
  WorldShopCheckoutSession,
  WorldShopFilters,
  WorldShopPaymentAttempt,
  WorldShopPaymentIntentResponse,
  WorldShopProductsListResponse,
} from '~/types/world/shop'

const SHOP_TTL_MS = 5 * 60 * 1000

function stableQueryString(filters: Record<string, unknown>) {
  return Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join(':')
}

export const useWorldShopStore = defineStore('world-shop', () => {
  const items = ref<Array<ShopProduct | ShopCategory>>([])
  const detail = ref<ShopProduct | ShopCategory | WorldShopCheckoutSession | null>(null)
  const pending = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<WorldShopFilters>({})
  const pagination = ref<WorldPaginationState>({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const lastFetchedAt = ref<number | null>(null)

  const cache = ref<Record<string, { fetchedAt: number, data: unknown }>>({})

  const currentAttempt = ref<WorldShopPaymentAttempt | null>(null)

  function isFresh(entry?: { fetchedAt: number }) {
    return !!entry && Date.now() - entry.fetchedAt < SHOP_TTL_MS
  }

  function buildModuleCacheKey(prefix: string, localFilters: Record<string, unknown>) {
    const suffix = stableQueryString(localFilters)
    return `${prefix}${suffix ? `:${suffix}` : ''}`
  }

  function invalidateCache(prefix?: string) {
    if (!prefix) {
      cache.value = {}
      return
    }

    cache.value = Object.fromEntries(Object.entries(cache.value).filter(([key]) => !key.startsWith(prefix)))
  }

  async function fetchProducts(options?: { force?: boolean, filters?: Partial<WorldShopFilters> }) {
    filters.value = { ...filters.value, ...(options?.filters ?? {}) }
    const query = {
      search: filters.value.q,
      categoryId: filters.value.categoryId,
      status: filters.value.status,
      brand: filters.value.brand,
      material: filters.value.material,
      color: filters.value.color,
      size: filters.value.size,
      priceMin: filters.value.priceMin,
      priceMax: filters.value.priceMax,
    }

    const cacheKey = buildModuleCacheKey('shop-products', {
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...query,
    })

    const cached = cache.value[cacheKey]
    if (cached && !options?.force && isFresh(cached)) {
      const response = cached.data as WorldShopProductsListResponse
      items.value = response.data
      pagination.value.total = response.total
      pagination.value.totalPages = Math.max(1, Math.ceil(response.total / pagination.value.limit))
      lastFetchedAt.value = cached.fetchedAt
      return
    }

    pending.value = true
    error.value = null
    try {
      const response = await $fetch<WorldShopProductsListResponse>('/api/world/shop/products/index', { query })
      items.value = response.data
      pagination.value.total = response.total
      pagination.value.totalPages = Math.max(1, Math.ceil(response.total / pagination.value.limit))
      lastFetchedAt.value = Date.now()
      cache.value[cacheKey] = { fetchedAt: lastFetchedAt.value, data: response }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to fetch shop products'
      throw err
    }
    finally {
      pending.value = false
    }
  }

  async function fetchCategories(options?: { force?: boolean }) {
    const cacheKey = 'shop-categories'
    const cached = cache.value[cacheKey]
    if (cached && !options?.force && isFresh(cached)) {
      items.value = (cached.data as { data: ShopCategory[] }).data
      lastFetchedAt.value = cached.fetchedAt
      return
    }

    pending.value = true
    error.value = null
    try {
      const response = await $fetch<{ data: ShopCategory[] }>('/api/world/shop/categories/index')
      items.value = response.data
      pagination.value.total = response.data.length
      pagination.value.totalPages = 1
      lastFetchedAt.value = Date.now()
      cache.value[cacheKey] = { fetchedAt: lastFetchedAt.value, data: response }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to fetch shop categories'
      throw err
    }
    finally {
      pending.value = false
    }
  }

  async function createCheckoutSession(payload: { currency: string, cart: WorldShopCartLine[] }) {
    pending.value = true
    error.value = null
    try {
      const response = await $fetch<WorldShopCheckoutSession>('/api/world/shop/checkout/session', {
        method: 'POST',
        body: payload,
      })
      detail.value = response
      invalidateCache('shop-checkout')
      cache.value[`shop-checkout:${response.id}`] = { fetchedAt: Date.now(), data: response }
      lastFetchedAt.value = Date.now()
      return response
    }
    finally {
      pending.value = false
    }
  }

  async function saveCheckoutAddress(payload: { checkoutId: string, idempotencyKey: string, address: WorldShopCheckoutAddress }) {
    pending.value = true
    error.value = null
    try {
      const updated = await $fetch<WorldShopCheckoutSession>('/api/world/shop/checkout/address', { method: 'POST', body: payload })
      detail.value = updated
      cache.value[`shop-checkout:${updated.id}`] = { fetchedAt: Date.now(), data: updated }
      lastFetchedAt.value = Date.now()
      return updated
    }
    finally {
      pending.value = false
    }
  }

  async function saveCheckoutShipping(payload: { checkoutId: string, idempotencyKey: string, shippingOptionId: string }) {
    pending.value = true
    error.value = null
    try {
      const updated = await $fetch<WorldShopCheckoutSession>('/api/world/shop/checkout/shipping', { method: 'POST', body: payload })
      detail.value = updated
      cache.value[`shop-checkout:${updated.id}`] = { fetchedAt: Date.now(), data: updated }
      lastFetchedAt.value = Date.now()
      return updated
    }
    finally {
      pending.value = false
    }
  }

  async function fetchCheckoutById(checkoutId: string, options?: { force?: boolean }) {
    const cacheKey = `shop-checkout:${checkoutId}`
    const cached = cache.value[cacheKey]
    if (cached && !options?.force && isFresh(cached)) {
      detail.value = cached.data as WorldShopCheckoutSession
      return detail.value
    }

    pending.value = true
    error.value = null
    try {
      const response = await $fetch<WorldShopCheckoutSession>(`/api/world/shop/checkout/${checkoutId}`)
      detail.value = response
      cache.value[cacheKey] = { fetchedAt: Date.now(), data: response }
      return response
    }
    finally {
      pending.value = false
    }
  }

  async function createPaymentIntent(payload: { checkoutId: string, provider: 'stripe' | 'adyen' | 'paypal', idempotencyKey: string }) {
    pending.value = true
    error.value = null
    try {
      const response = await $fetch<WorldShopPaymentIntentResponse>('/api/world/shop/payment/intent', {
        method: 'POST',
        body: payload,
        timeout: 20000,
      })
      detail.value = response.checkout
      currentAttempt.value = response.attempt
      cache.value[`shop-checkout:${response.checkout.id}`] = { fetchedAt: Date.now(), data: response.checkout }
      return response
    }
    finally {
      pending.value = false
    }
  }

  async function confirmPayment(payload: { checkoutId: string, providerPaymentId: string, idempotencyKey: string }) {
    pending.value = true
    error.value = null
    try {
      const response = await $fetch<WorldShopCheckoutSession>('/api/world/shop/payment/confirm', { method: 'POST', body: payload })
      detail.value = response
      cache.value[`shop-checkout:${response.id}`] = { fetchedAt: Date.now(), data: response }
      return response
    }
    finally {
      pending.value = false
    }
  }

  return {
    items,
    detail,
    pending,
    error,
    filters,
    pagination,
    lastFetchedAt,
    currentAttempt,
    fetchProducts,
    fetchCategories,
    createCheckoutSession,
    saveCheckoutAddress,
    saveCheckoutShipping,
    fetchCheckoutById,
    createPaymentIntent,
    confirmPayment,
    invalidateCache,
    buildModuleCacheKey,
  }
})
