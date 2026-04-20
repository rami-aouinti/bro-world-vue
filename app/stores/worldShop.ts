import { normalizeShopProductsFilters } from '~/types/world/shop'
import { normalizeHttpError } from '~/utils/httpError'
import { isValidShopId, resolveGlobalShopId } from '~/constants/shop'
import {
  recordStoreCacheEvent,
  runTrackedStoreFetch,
} from '~/utils/storeTelemetry'
import type {
  ShopGeneralCart,
  ShopGeneralCategory,
  ShopGeneralOrder,
  ShopGeneralOrdersResponse,
  ShopGeneralProduct,
  ShopGeneralProductDetailResponse,
  ShopGeneralProductsResponse,
  ShopGeneralTransaction,
  WorldPaginationState,
  WorldShopCartLine,
  WorldShopCartSummary,
  WorldShopCategoriesListResponse,
  WorldShopCheckoutAddress,
  WorldShopCheckoutSession,
  WorldShopFilters,
  WorldShopPaymentAttempt,
  WorldShopPaymentIntentResponse,
} from '~/types/world/shop'

const SHOP_TTL_MS = 5 * 60 * 1000
const SHOP_MAX_RETRY = 2

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isProductsResponseLike(
  value: unknown,
): value is ShopGeneralProductsResponse {
  if (!isObjectLike(value)) {
    return false
  }

  const candidate = value as { items?: unknown; data?: unknown }
  return (
    Array.isArray(candidate.items) ||
    Array.isArray(candidate.data)
  )
}

function getProductsFromResponse(response: unknown): ShopGeneralProduct[] {
  if (!isObjectLike(response)) {
    return []
  }

  const candidate = response as { items?: unknown; data?: unknown }

  if (Array.isArray(candidate.items)) {
    return candidate.items as ShopGeneralProduct[]
  }

  if (Array.isArray(candidate.data)) {
    return candidate.data as ShopGeneralProduct[]
  }

  return []
}

function getProductDetailFromResponse(
  response: unknown,
): ShopGeneralProductDetailResponse | null {
  if (!isObjectLike(response)) {
    return null
  }

  const directResponse = response as {
    product?: ShopGeneralProduct
    similarProducts?: ShopGeneralProduct[]
  }
  const wrappedResponse = response as {
    data?: {
      product?: ShopGeneralProduct
      similarProducts?: ShopGeneralProduct[]
    }
  }

  if (directResponse.product) {
    return {
      product: directResponse.product,
      similarProducts: directResponse.similarProducts ?? [],
    }
  }

  if (wrappedResponse.data?.product) {
    return {
      product: wrappedResponse.data.product,
      similarProducts: wrappedResponse.data.similarProducts ?? [],
    }
  }

  return null
}

function stableQueryString(filters: Record<string, unknown>) {
  return Object.entries(filters)
    .filter(
      ([, value]) =>
        value !== undefined && value !== null && String(value).trim() !== '',
    )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join(':')
}

export const useWorldShopStore = defineStore('world-shop', () => {
  const nuxtApp = useNuxtApp()
  const items = ref<ShopGeneralProduct[]>([])
  const categories = ref<ShopGeneralCategory[]>([])
  const detail = ref<ShopGeneralProduct | WorldShopCheckoutSession | null>(null)
  const pending = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<WorldShopFilters>({})
  const pagination = ref<WorldPaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  })
  const lastFetchedAt = ref<number | null>(null)

  const cache = ref<Record<string, { fetchedAt: number; data: unknown }>>({})

  const currentAttempt = ref<WorldShopPaymentAttempt | null>(null)
  const cart = ref<ShopGeneralCart | null>(null)
  const orders = ref<ShopGeneralOrder[]>([])
  const selectedOrder = ref<ShopGeneralOrder | null>(null)
  const transaction = ref<ShopGeneralTransaction | null>(null)
  const cartSummary = ref<WorldShopCartSummary | null>(null)
  const globalShopId = ref<string | null>(null)

  function isFresh(entry?: { fetchedAt: number }) {
    return !!entry && Date.now() - entry.fetchedAt < SHOP_TTL_MS
  }

  function translateShopErrorMessage(
    fallback: string,
    i18nKey?: string,
    statusCode?: number | null,
  ) {
    const { $i18n } = nuxtApp
    if ($i18n && i18nKey) {
      const translated = $i18n.t(i18nKey, { statusCode: statusCode ?? '' })
      if (typeof translated === 'string' && translated.trim().length > 0) {
        return translated
      }
    }

    return fallback
  }

  async function resolveRequiredShopId() {
    if (isValidShopId(globalShopId.value)) {
      return globalShopId.value
    }

    const runtimeConfig = useRuntimeConfig()
    const configuredShopId = resolveGlobalShopId(runtimeConfig.public)
    if (configuredShopId && !isValidShopId(configuredShopId)) {
      const message =
        "Invalid shop configuration: 'runtimeConfig.public.shop.globalShopId' is present but malformed."
      error.value = message
      throw new Error(message)
    }
    if (configuredShopId) {
      globalShopId.value = configuredShopId
      return configuredShopId
    }

    const response = await runTrackedStoreFetch('shop', () =>
      $fetch<{ shop?: { id?: string } }>('/api/world/shop/general', {
        query: { page: 1, limit: 1 },
      }),
    )
    const resolvedShopId = response.shop?.id?.trim()
    if (isValidShopId(resolvedShopId)) {
      globalShopId.value = resolvedShopId
      return resolvedShopId
    }

    const shopId = resolvedShopId
    if (!isValidShopId(shopId)) {
      const message =
        "Unable to resolve the global shopId from '/api/world/shop/general'."
      error.value = message
      throw new Error(message)
    }

    return shopId
  }

  async function fetchWithRetry<T>(
    executor: () => Promise<T>,
    options: {
      i18nKey?: string
      fallbackMessage: string
      maxRetries?: number
    },
  ): Promise<T> {
    const maxRetries = options.maxRetries ?? SHOP_MAX_RETRY
    let lastError: unknown = null

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        return await executor()
      } catch (err) {
        lastError = err
        if (attempt < maxRetries) {
          continue
        }
      }
    }

    const normalized = normalizeHttpError(lastError)
    const translatedMessage = translateShopErrorMessage(
      options.fallbackMessage,
      options.i18nKey,
      normalized.statusCode,
    )
    error.value = `${translatedMessage}${normalized.message ? ` (${normalized.message})` : ''}`
    throw lastError
  }

  function resolveProductsPagination(response: unknown) {
    if (!isObjectLike(response)) {
      pagination.value.page = filters.value.page ?? pagination.value.page
      pagination.value.limit = filters.value.limit ?? pagination.value.limit
      pagination.value.total = 0
      pagination.value.totalPages = 1
      return
    }

    const typedResponse = response as ShopGeneralProductsResponse
    const apiPagination =
      typedResponse.pagination ?? typedResponse.meta?.pagination
    const totalItems = apiPagination?.total ?? apiPagination?.totalItems ?? 0
    const page =
      apiPagination?.page ?? filters.value.page ?? pagination.value.page
    const limit =
      apiPagination?.limit ?? filters.value.limit ?? pagination.value.limit
    const totalPages =
      apiPagination?.totalPages ??
      Math.max(1, Math.ceil(totalItems / Math.max(1, limit)))

    pagination.value.page = page
    pagination.value.limit = limit
    pagination.value.total = totalItems
    pagination.value.totalPages = totalPages
  }

  function buildProductsQuery(localFilters?: Partial<WorldShopFilters>) {
    const normalized = normalizeShopProductsFilters({
      ...filters.value,
      ...(localFilters ?? {}),
      page:
        localFilters?.page ?? pagination.value.page ?? filters.value.page ?? 1,
      limit:
        localFilters?.limit ??
        pagination.value.limit ??
        filters.value.limit ??
        20,
    })

    return {
      q: normalized.q,
      name: normalized.name,
      category: normalized.category,
      status: normalized.status,
      minPrice: normalized.minPrice,
      maxPrice: normalized.maxPrice,
      promotion: normalized.promotion,
      page: normalized.page,
      limit: normalized.limit,
    }
  }

  function buildModuleCacheKey(
    prefix: string,
    localFilters: Record<string, unknown>,
  ) {
    const suffix = stableQueryString(localFilters)
    return `${prefix}${suffix ? `:${suffix}` : ''}`
  }

  function invalidateCache(prefix?: string) {
    if (!prefix) {
      cache.value = {}
      return
    }

    cache.value = Object.fromEntries(
      Object.entries(cache.value).filter(([key]) => !key.startsWith(prefix)),
    )
  }

  function invalidateCartCache(shopId: string) {
    invalidateCache(`shop-cart:${shopId}`)
  }

  function invalidateOrdersCache(orderId?: string) {
    invalidateCache('shop-orders')
    if (orderId) {
      invalidateCache(`shop-order:${orderId}`)
      invalidateCache(`shop-transaction:${orderId}`)
    }
  }

  function invalidateProductCaches() {
    invalidateCache('shop-products:')
    invalidateCache('shop-product:')
  }

  function invalidateCategoryCaches() {
    invalidateCache('shop-categories')
    invalidateProductCaches()
  }

  async function fetchProducts(options?: {
    force?: boolean
    filters?: Partial<WorldShopFilters>
  }) {
    const query = buildProductsQuery(options?.filters)
    filters.value = { ...filters.value, ...query }
    pagination.value.page = query.page ?? 1
    pagination.value.limit = query.limit ?? pagination.value.limit

    const cacheKey = buildModuleCacheKey('shop-products', {
      ...query,
    })

    const cached = cache.value[cacheKey]
    if (cached && !options?.force && isFresh(cached)) {
      recordStoreCacheEvent('shop', true)
      const response = cached.data as ShopGeneralProductsResponse
      items.value = getProductsFromResponse(response)
      resolveProductsPagination(response)
      lastFetchedAt.value = cached.fetchedAt
      return
    }
    recordStoreCacheEvent('shop', false)

    pending.value = true
    error.value = null
    try {
      const response = await fetchWithRetry(
        () =>
          runTrackedStoreFetch('shop', () =>
            $fetch<ShopGeneralProductsResponse>('/api/world/shop/products', {
              query,
            }),
          ),
        {
          i18nKey: 'world.shop.errors.productsFetch',
          fallbackMessage:
            'Unable to fetch store products. Please try again.',
        },
      )
      if (!isProductsResponseLike(response)) {
        throw new Error('Invalid shop products response format.')
      }
      items.value = getProductsFromResponse(response)
      resolveProductsPagination(response)
      lastFetchedAt.value = Date.now()
      cache.value[cacheKey] = { fetchedAt: lastFetchedAt.value, data: response }
    } finally {
      pending.value = false
    }
  }

  async function fetchCategories(options?: { force?: boolean }) {
    const cacheKey = 'shop-categories'
    const cached = cache.value[cacheKey]
    if (cached && !options?.force && isFresh(cached)) {
      recordStoreCacheEvent('shop', true)
      categories.value = (cached.data as { data: ShopGeneralCategory[] }).data
      lastFetchedAt.value = cached.fetchedAt
      return
    }
    recordStoreCacheEvent('shop', false)

    pending.value = true
    error.value = null
    try {
      const response = await fetchWithRetry(
        () =>
          runTrackedStoreFetch('shop', () =>
            $fetch<WorldShopCategoriesListResponse>(
              '/api/world/shop/categories',
            ),
          ),
        {
          i18nKey: 'world.shop.errors.categoriesFetch',
          fallbackMessage:
            'Unable to fetch store categories.',
        },
      )
      categories.value = response.data
      pagination.value.page = 1
      pagination.value.limit = response.data.length || pagination.value.limit
      pagination.value.total = response.data.length
      pagination.value.totalPages = 1
      lastFetchedAt.value = Date.now()
      cache.value[cacheKey] = { fetchedAt: lastFetchedAt.value, data: response }
    } finally {
      pending.value = false
    }
  }

  async function fetchProductById(
    productId: string,
    options?: { force?: boolean },
  ) {
    const cacheKey = `shop-product:${productId}`
    const cached = cache.value[cacheKey]
    if (cached && !options?.force && isFresh(cached)) {
      recordStoreCacheEvent('shop', true)
      const cachedData = cached.data as {
        product: ShopGeneralProduct
        similarProducts: ShopGeneralProduct[]
      }
      detail.value = cachedData.product
      return cachedData
    }
    recordStoreCacheEvent('shop', false)

    pending.value = true
    error.value = null
    try {
      const response = await fetchWithRetry(
        () =>
          runTrackedStoreFetch('shop', () =>
            $fetch<ShopGeneralProductDetailResponse>(
              `/api/world/shop/products/${productId}`,
            ),
          ),
        {
          i18nKey: 'world.shop.errors.productDetailFetch',
          fallbackMessage:
            'Unable to fetch product details right now.',
        },
      )

      const normalizedResponse = getProductDetailFromResponse(response)
      if (!normalizedResponse) {
        throw new Error('Invalid product detail response format.')
      }

      detail.value = normalizedResponse.product
      lastFetchedAt.value = Date.now()
      cache.value[cacheKey] = {
        fetchedAt: lastFetchedAt.value,
        data: normalizedResponse,
      }

      return normalizedResponse
    } finally {
      pending.value = false
    }
  }

  async function createCheckoutSession(payload: {
    currency: string
    cart: WorldShopCartLine[]
  }) {
    const shopId = await resolveRequiredShopId()
    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('shop', () =>
        $fetch<WorldShopCheckoutSession>('/api/world/shop/checkout/session', {
          method: 'POST',
          body: {
            ...payload,
            shopId,
          },
        }),
      )
      detail.value = response
      invalidateCache('shop-checkout:')
      cache.value[`shop-checkout:${response.id}`] = {
        fetchedAt: Date.now(),
        data: response,
      }
      lastFetchedAt.value = Date.now()
      return response
    } finally {
      pending.value = false
    }
  }

  async function saveCheckoutAddress(payload: {
    checkoutId: string
    idempotencyKey: string
    address: WorldShopCheckoutAddress
  }) {
    pending.value = true
    error.value = null
    try {
      const updated = await runTrackedStoreFetch('shop', () =>
        $fetch<WorldShopCheckoutSession>('/api/world/shop/checkout/address', {
          method: 'POST',
          body: payload,
        }),
      )
      detail.value = updated
      cache.value[`shop-checkout:${updated.id}`] = {
        fetchedAt: Date.now(),
        data: updated,
      }
      lastFetchedAt.value = Date.now()
      return updated
    } finally {
      pending.value = false
    }
  }

  async function saveCheckoutShipping(payload: {
    checkoutId: string
    idempotencyKey: string
    shippingOptionId: string
  }) {
    pending.value = true
    error.value = null
    try {
      const updated = await runTrackedStoreFetch('shop', () =>
        $fetch<WorldShopCheckoutSession>('/api/world/shop/checkout/shipping', {
          method: 'POST',
          body: payload,
        }),
      )
      detail.value = updated
      cache.value[`shop-checkout:${updated.id}`] = {
        fetchedAt: Date.now(),
        data: updated,
      }
      lastFetchedAt.value = Date.now()
      return updated
    } finally {
      pending.value = false
    }
  }

  async function fetchCheckoutById(
    checkoutId: string,
    options?: { force?: boolean },
  ) {
    const cacheKey = `shop-checkout:${checkoutId}`
    const cached = cache.value[cacheKey]
    if (cached && !options?.force && isFresh(cached)) {
      recordStoreCacheEvent('shop', true)
      detail.value = cached.data as WorldShopCheckoutSession
      return detail.value
    }
    recordStoreCacheEvent('shop', false)

    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('shop', () =>
        $fetch<WorldShopCheckoutSession>(
          `/api/world/shop/checkout/${checkoutId}`,
        ),
      )
      detail.value = response
      cache.value[cacheKey] = { fetchedAt: Date.now(), data: response }
      return response
    } finally {
      pending.value = false
    }
  }

  async function createPaymentIntent(payload: {
    checkoutId: string
    provider: 'stripe' | 'adyen' | 'paypal'
    idempotencyKey: string
  }) {
    const shopId = await resolveRequiredShopId()
    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('shop', () =>
        $fetch<WorldShopPaymentIntentResponse>(
          '/api/world/shop/payment-intent',
          {
            method: 'POST',
            body: {
              ...payload,
              shopId,
            },
            timeout: 20000,
          },
        ),
      )
      detail.value = response.checkout
      currentAttempt.value = response.attempt
      cache.value[`shop-checkout:${response.checkout.id}`] = {
        fetchedAt: Date.now(),
        data: response.checkout,
      }
      return response
    } finally {
      pending.value = false
    }
  }

  async function confirmPayment(payload: {
    checkoutId: string
    providerPaymentId: string
    idempotencyKey: string
  }) {
    const shopId = await resolveRequiredShopId()
    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('shop', () =>
        $fetch<WorldShopCheckoutSession>('/api/world/shop/payment-confirm', {
          method: 'POST',
          body: {
            ...payload,
            shopId,
          },
        }),
      )
      detail.value = response
      cache.value[`shop-checkout:${response.id}`] = {
        fetchedAt: Date.now(),
        data: response,
      }
      invalidateOrdersCache()
      return response
    } finally {
      pending.value = false
    }
  }

  async function fetchCart(options?: { force?: boolean }) {
    const shopId = await resolveRequiredShopId()
    const cacheKey = `shop-cart:${shopId}`
    const cached = cache.value[cacheKey]

    if (cached && !options?.force && isFresh(cached)) {
      recordStoreCacheEvent('shop', true)
      const cachedCart = cached.data as ShopGeneralCart
      cart.value = cachedCart
      cartSummary.value = {
        subtotalAmount: cachedCart.subtotalAmount,
        totalAmount: cachedCart.totalAmount,
        currency: cachedCart.currencyCode ?? cachedCart.currency,
        itemsCount: cachedCart.items.length,
      }
      lastFetchedAt.value = cached.fetchedAt
      return cachedCart
    }
    recordStoreCacheEvent('shop', false)

    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('shop', () =>
        $fetch<ShopGeneralCart>(
          '/api/world/shop/carts/' + encodeURIComponent(shopId),
        ),
      )
      cart.value = response
      cartSummary.value = {
        subtotalAmount: response.subtotalAmount,
        totalAmount: response.totalAmount,
        currency: response.currencyCode ?? response.currency,
        itemsCount: response.items.length,
      }
      cache.value[cacheKey] = { fetchedAt: Date.now(), data: response }
      return response
    } catch (err) {
      const normalized = normalizeHttpError(err)
      const translatedMessage = translateShopErrorMessage(
        'Unable to fetch the cart right now.',
      )
      error.value = `${translatedMessage}${normalized.message ? ` (${normalized.message})` : ''}`
      throw err
    } finally {
      pending.value = false
    }
  }

  async function addCartItem(productId: string, quantity = 1) {
    const shopId = await resolveRequiredShopId()
    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('shop', () =>
        $fetch<ShopGeneralCart>(
          '/api/world/shop/carts/' + encodeURIComponent(shopId) + '/items',
          {
            method: 'POST',
            body: {
              productId,
              quantity,
            },
          },
        ),
      )
      cart.value = response
      cartSummary.value = {
        subtotalAmount: response.subtotalAmount,
        totalAmount: response.totalAmount,
        currency: response.currencyCode ?? response.currency,
        itemsCount: response.items.length,
      }
      invalidateCartCache(shopId)
      return response
    } catch (err) {
      const normalized = normalizeHttpError(err)
      const translatedMessage = translateShopErrorMessage(
        'Unable to add this product to cart right now.',
        'world.shop.errors.addToCart',
        normalized.statusCode,
      )
      error.value = `${translatedMessage}${normalized.message ? ` (${normalized.message})` : ''}`
      throw err
    } finally {
      pending.value = false
    }
  }

  async function updateCartItem(
    shopId: string,
    itemId: string,
    quantity: number,
  ) {
    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('shop', () =>
        $fetch<ShopGeneralCart>(
          `/api/world/shop/carts/${encodeURIComponent(shopId)}/items/${encodeURIComponent(itemId)}`,
          {
            method: 'PATCH',
            body: {
              quantity,
            },
          },
        ),
      )
      cart.value = response
      cartSummary.value = {
        subtotalAmount: response.subtotalAmount,
        totalAmount: response.totalAmount,
        currency: response.currencyCode ?? response.currency,
        itemsCount: response.items.length,
      }
      invalidateCartCache(shopId)
      return response
    } finally {
      pending.value = false
    }
  }

  async function removeCartItem(shopId: string, itemId: string) {
    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('shop', () =>
        $fetch<ShopGeneralCart>(
          `/api/world/shop/carts/${encodeURIComponent(shopId)}/items/${encodeURIComponent(itemId)}`,
          {
            method: 'DELETE',
          },
        ),
      )
      cart.value = response
      cartSummary.value = {
        subtotalAmount: response.subtotalAmount,
        totalAmount: response.totalAmount,
        currency: response.currencyCode ?? response.currency,
        itemsCount: response.items.length,
      }
      invalidateCartCache(shopId)
      return response
    } finally {
      pending.value = false
    }
  }

  async function checkout(
    payload: {
      billingAddress: WorldShopCheckoutAddress
      shippingAddress: WorldShopCheckoutAddress
      email: string
      phone: string
      shippingMethod: string
    },
    requestId?: string,
  ) {
    const shopId = await resolveRequiredShopId()
    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('shop', () =>
        $fetch<ShopGeneralOrder>(
          `/api/world/shop/checkout/${encodeURIComponent(shopId)}`,
          {
            method: 'POST',
            body: {
              ...payload,
              shopId,
            },
            headers:
              requestId && requestId.trim().length > 0
                ? { 'x-request-id': requestId.trim() }
                : undefined,
          },
        ),
      )
      selectedOrder.value = response
      invalidateCartCache(shopId)
      invalidateOrdersCache(response.id)
      return response
    } finally {
      pending.value = false
    }
  }

  async function fetchOrders(options?: { force?: boolean }) {
    const cacheKey = 'shop-orders'
    const cached = cache.value[cacheKey]
    if (cached && !options?.force && isFresh(cached)) {
      recordStoreCacheEvent('shop', true)
      const response = cached.data as ShopGeneralOrdersResponse
      orders.value = response.items
      selectedOrder.value = response.items[0] ?? null
      lastFetchedAt.value = cached.fetchedAt
      return response.items
    }
    recordStoreCacheEvent('shop', false)

    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('shop', () =>
        $fetch<ShopGeneralOrdersResponse>('/api/world/shop/orders'),
      )
      orders.value = response.items
      selectedOrder.value = response.items[0] ?? null
      cache.value[cacheKey] = { fetchedAt: Date.now(), data: response }
      return response.items
    } finally {
      pending.value = false
    }
  }

  async function createOrderPaymentIntent(
    orderId: string,
    payload: Record<string, unknown>,
  ) {
    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('shop', () =>
        $fetch<ShopGeneralTransaction>(
          `/api/world/shop/orders/${encodeURIComponent(orderId)}/payment-intent`,
          {
            method: 'POST',
            body: payload,
          },
        ),
      )
      transaction.value = response
      invalidateCache(`shop-transaction:${orderId}`)
      cache.value[`shop-transaction:${orderId}`] = {
        fetchedAt: Date.now(),
        data: response,
      }
      return response
    } finally {
      pending.value = false
    }
  }

  async function confirmOrderPayment(
    orderId: string,
    payload: Record<string, unknown>,
  ) {
    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('shop', () =>
        $fetch<ShopGeneralTransaction>(
          `/api/world/shop/orders/${encodeURIComponent(orderId)}/payment-confirm`,
          {
            method: 'POST',
            body: payload,
          },
        ),
      )
      transaction.value = response
      invalidateOrdersCache(orderId)
      cache.value[`shop-transaction:${orderId}`] = {
        fetchedAt: Date.now(),
        data: response,
      }
      return response
    } finally {
      pending.value = false
    }
  }

  return {
    items,
    categories,
    detail,
    pending,
    error,
    filters,
    pagination,
    lastFetchedAt,
    currentAttempt,
    cart,
    orders,
    selectedOrder,
    transaction,
    cartSummary,
    fetchProducts,
    fetchCategories,
    fetchProductById,
    createCheckoutSession,
    saveCheckoutAddress,
    saveCheckoutShipping,
    fetchCheckoutById,
    createPaymentIntent,
    confirmPayment,
    fetchCart,
    addCartItem,
    updateCartItem,
    removeCartItem,
    checkout,
    fetchOrders,
    createOrderPaymentIntent,
    confirmOrderPayment,
    invalidateCache,
    invalidateCartCache,
    invalidateOrdersCache,
    invalidateProductCaches,
    invalidateCategoryCaches,
    buildModuleCacheKey,
    buildProductsQuery,
  }
})
