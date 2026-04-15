import { normalizeShopProductsFilters } from '~/types/world/shop'
import { normalizeHttpError } from '~/utils/httpError'
import { isValidShopId, resolveGlobalShopId } from '~/constants/shop'
import {
  recordStoreCacheEvent,
  runTrackedStoreFetch,
} from '~/utils/storeTelemetry'
import type {
  ShopCategory,
  ShopProductDetailData,
  ShopProductDetailResponse,
  ShopProduct,
  WorldPaginationState,
  WorldShopCartLine,
  WorldShopCategoriesListResponse,
  WorldShopCheckoutAddress,
  WorldShopCheckoutSession,
  WorldShopFilters,
  WorldShopPaymentAttempt,
  WorldShopPaymentIntentResponse,
  WorldShopProductsListResponse,
} from '~/types/world/shop'

const SHOP_TTL_MS = 5 * 60 * 1000
const SHOP_MAX_RETRY = 2

type ShopProductsMetaLike = {
  pagination?: {
    page?: number
    limit?: number
    total?: number
    totalItems?: number
    totalPages?: number
  }
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isProductsResponseLike(
  value: unknown,
): value is WorldShopProductsListResponse {
  return (
    isObjectLike(value) &&
    'data' in value &&
    Array.isArray((value as { data?: unknown }).data)
  )
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
  const items = ref<Array<ShopProduct | ShopCategory>>([])
  const detail = ref<
    ShopProduct | ShopCategory | WorldShopCheckoutSession | null
  >(null)
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
  const cart = ref<unknown>(null)
  const globalShopId = ref<string | null>(null)

  function isFresh(entry?: { fetchedAt: number }) {
    return !!entry && Date.now() - entry.fetchedAt < SHOP_TTL_MS
  }

  function translateShopErrorMessage(
    fallback: string,
    i18nKey?: string,
    statusCode?: number | null,
  ) {
    const { $i18n } = useNuxtApp()
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
        "Configuration shop invalide: 'runtimeConfig.public.shop.globalShopId' est présent mais incorrect."
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
        "Impossible de résoudre le shopId global depuis '/api/world/shop/general'."
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

    const meta = ('meta' in response ? response.meta : undefined) as
      | ShopProductsMetaLike
      | undefined
    const apiPagination = meta?.pagination
    const totalItems =
      apiPagination?.totalItems ??
      apiPagination?.total ??
      ('total' in response && typeof response.total === 'number'
        ? response.total
        : 0)
    const page = apiPagination?.page ?? filters.value.page ?? pagination.value.page
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
        localFilters?.page ??
        pagination.value.page ??
        filters.value.page ??
        1,
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
      const response = cached.data as WorldShopProductsListResponse
      items.value = response.data
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
            $fetch<WorldShopProductsListResponse>(
              '/api/world/shop/products',
              { query },
            ),
          ),
        {
          i18nKey: 'world.shop.errors.productsFetch',
          fallbackMessage:
            "Impossible de récupérer les produits de la boutique. Merci de réessayer.",
        },
      )
      if (!isProductsResponseLike(response)) {
        throw new Error('Invalid shop products response format.')
      }
      items.value = response.data
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
      items.value = (cached.data as { data: ShopCategory[] }).data
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
            'Impossible de récupérer les catégories de la boutique.',
        },
      )
      items.value = response.data
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

  async function fetchProductById(productId: string, options?: { force?: boolean }) {
    const cacheKey = `shop-product:${productId}`
    const cached = cache.value[cacheKey]
    if (cached && !options?.force && isFresh(cached)) {
      recordStoreCacheEvent('shop', true)
      const cachedData = cached.data as {
        product: ShopProduct
        similarProducts: ShopProduct[]
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
            $fetch<ShopProductDetailResponse>(
              `/api/world/shop/products/${productId}`,
            ),
          ),
        {
          i18nKey: 'world.shop.errors.productDetailFetch',
          fallbackMessage:
            'Impossible de récupérer le détail du produit pour le moment.',
        },
      )

      const payload = response.data
      const hasNestedData =
        typeof payload === 'object' &&
        payload !== null &&
        'product' in payload

      const product = hasNestedData
        ? (payload as ShopProductDetailData).product
        : (payload as ShopProduct)

      const similarProducts = hasNestedData
        ? ((payload as ShopProductDetailData).similarProducts ??
          response.similarProducts ??
          [])
        : (response.similarProducts ?? [])

      const normalizedResponse = {
        product,
        similarProducts,
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
      invalidateCache('shop-checkout')
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
        $fetch<WorldShopCheckoutSession>(`/api/world/shop/checkout/${checkoutId}`),
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
        $fetch<WorldShopPaymentIntentResponse>('/api/world/shop/payment/intent', {
          method: 'POST',
          body: {
            ...payload,
            shopId,
          },
          timeout: 20000,
        }),
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
        $fetch<WorldShopCheckoutSession>('/api/world/shop/payment/confirm', {
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
      return response
    } finally {
      pending.value = false
    }
  }

  async function fetchCart() {
    const shopId = await resolveRequiredShopId()
    pending.value = true
    error.value = null
    try {
      const response = await runTrackedStoreFetch('shop', () =>
        $fetch('/api/world/shop/carts/' + encodeURIComponent(shopId)),
      )
      cart.value = response
      return response
    } catch (err) {
      const normalized = normalizeHttpError(err)
      const translatedMessage = translateShopErrorMessage(
        'Impossible de récupérer le panier pour le moment.',
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
      return await runTrackedStoreFetch('shop', () =>
        $fetch('/api/world/shop/carts/' + encodeURIComponent(shopId) + '/items', {
          method: 'POST',
          body: {
            productId,
            quantity,
          },
        }),
      )
    } catch (err) {
      const normalized = normalizeHttpError(err)
      const translatedMessage = translateShopErrorMessage(
        "Impossible d'ajouter ce produit au panier pour le moment.",
        'world.shop.errors.addToCart',
        normalized.statusCode,
      )
      error.value = `${translatedMessage}${normalized.message ? ` (${normalized.message})` : ''}`
      throw err
    } finally {
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
    cart,
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
    invalidateCache,
    buildModuleCacheKey,
    buildProductsQuery,
  }
})
