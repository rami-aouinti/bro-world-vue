import { createHash } from 'node:crypto'
import { resolveCacheResourcePrefix } from './apiCacheConfig'

export type CacheScope = 'public' | 'private'

type CacheKeyInput = {
  endpoint: string
  query?: Record<string, unknown> | null
}

type PublicCacheKeyInput = CacheKeyInput & {
  scope: 'public'
}

type PrivateCacheKeyInput = CacheKeyInput & {
  scope: 'private'
  username: string
}

type BuildCacheKeyInput = PublicCacheKeyInput | PrivateCacheKeyInput

type CachePrefixInput = {
  resourcePrefix: string
  username?: string
}

type CacheEntry<T> = {
  value: T
  expiresAt: number
}

const FALLBACK_CACHE_PREFIX = 'fallback:'
const inMemoryCache = new Map<string, CacheEntry<unknown>>()

function normalizeEndpoint(endpoint: string) {
  return endpoint.trim().replace(/^\/+|\/+$/g, '') || 'root'
}

function normalizeUsername(username: string) {
  return username.trim()
}

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([a], [b]) => a.localeCompare(b),
    )

    return `{${entries
      .map(([key, entryValue]) => `${key}:${stableStringify(entryValue)}`)
      .join(',')}}`
  }

  return String(value)
}

function getQueryHash(query: CacheKeyInput['query']) {
  return createHash('sha1').update(stableStringify(query)).digest('hex')
}

function hasRedisConfig() {
  const config = useRuntimeConfig()

  return Boolean(config.redis.url || process.env.REDIS_URL)
}

function getFallbackKey(key: string) {
  return `${FALLBACK_CACHE_PREFIX}${key}`
}

function setFallback<T>(key: string, value: T, ttl: number) {
  inMemoryCache.set(getFallbackKey(key), {
    value,
    expiresAt: Date.now() + ttl * 1000,
  })
}

function getFallback<T>(key: string): T | null {
  const item = inMemoryCache.get(getFallbackKey(key))

  if (!item) {
    return null
  }

  if (item.expiresAt <= Date.now()) {
    inMemoryCache.delete(getFallbackKey(key))
    return null
  }

  return item.value as T
}

function invalidateFallbackByPrefix(prefix: string) {
  const fallbackPrefix = getFallbackKey(prefix)

  for (const key of inMemoryCache.keys()) {
    if (key.startsWith(fallbackPrefix)) {
      inMemoryCache.delete(key)
    }
  }
}

function shouldUseRedis() {
  return hasRedisConfig()
}

export function buildCacheKey(input: BuildCacheKeyInput) {
  const { scope, endpoint, query } = input
  if (scope === 'private') {
    return privateCacheKey(input.username, endpoint, query)
  }

  return publicCacheKey(endpoint, query)
}

export function publicCacheKey(
  endpoint: string,
  query?: CacheKeyInput['query'],
) {
  const normalizedEndpoint = normalizeEndpoint(endpoint)
  const queryHash = getQueryHash(query)
  const resourcePrefix = resolveCacheResourcePrefix(normalizedEndpoint)
  return `api:public:${resourcePrefix}:${normalizedEndpoint}:${queryHash}`
}

export function privateCacheKey(
  username: string,
  endpoint: string,
  query?: CacheKeyInput['query'],
) {
  const normalizedUsername = normalizeUsername(username)
  if (!normalizedUsername) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing username for private cache key',
    })
  }

  const normalizedEndpoint = normalizeEndpoint(endpoint)
  const queryHash = getQueryHash(query)
  const resourcePrefix = resolveCacheResourcePrefix(normalizedEndpoint)
  return `api:private:${normalizedUsername}:${resourcePrefix}:${normalizedEndpoint}:${queryHash}`
}

export function publicCachePrefix(resourcePrefix: string) {
  return `api:public:${resourcePrefix}:`
}

export function privateCachePrefix({
  username,
  resourcePrefix,
}: CachePrefixInput) {
  const normalizedUsername = normalizeUsername(username ?? '')
  if (!normalizedUsername) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing username for private cache invalidation',
    })
  }

  return `api:private:${normalizedUsername}:${resourcePrefix}:`
}

export async function getCached<T>(key: string): Promise<T | null> {
  if (!shouldUseRedis()) {
    return getFallback<T>(key)
  }

  try {
    const storage = useStorage('redis')
    const value = await storage.getItem<T>(key)
    return value ?? null
  } catch {
    return getFallback<T>(key)
  }
}

export async function setCached<T>(key: string, value: T, ttl: number) {
  if (ttl <= 0) {
    return
  }

  setFallback(key, value, ttl)

  if (!shouldUseRedis()) {
    return
  }

  try {
    const storage = useStorage('redis')
    await storage.setItem(key, value as any, { ttl })
  } catch {
    // Explicitly swallow Redis errors to avoid breaking API handlers.
  }
}

export async function invalidateByPrefix(prefix: string) {
  invalidateFallbackByPrefix(prefix)

  if (!shouldUseRedis()) {
    return
  }

  try {
    const storage = useStorage('redis')
    const keys = await storage.getKeys(prefix)
    await Promise.all(keys.map((key) => storage.removeItem(key)))
  } catch {
    // Explicitly swallow Redis errors to avoid breaking API handlers.
  }
}
