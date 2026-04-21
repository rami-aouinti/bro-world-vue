import { invalidateByPrefix, publicCachePrefix } from '~~/server/utils/apiCache'

type CacheRefreshMode = 'purge' | 'warm'

type WarmResult = {
  endpoint: string
  duration: number
  ok: boolean
  status?: number
  error?: string
}

const PURGEABLE_PUBLIC_DOMAINS = [
  'default',
  'references',
  'blog',
  'application',
  'users',
  'stories',
  'library',
  'games',
  'quiz',
  'crm',
  'notifications',
  'chat',
  'calendar',
] as const

const EXCLUDED_DOMAINS = new Set(['sports', 'football'])

const WARMABLE_ENDPOINTS = [
  '/api/application/public',
  '/api/application/public/general',
  '/api/blog/public/general',
  '/api/blog/public/reaction-types',
  '/api/platform/public',
  '/api/quiz/public/index',
  '/api/quiz/public/categories',
  '/api/quiz/public/levels',
  '/api/quiz/public/leaderboard',
] as const

const WARM_BATCH_SIZE = 4
const WARM_TIMEOUT_MS = 7_000

function parseCsvInput(value: unknown) {
  if (typeof value !== 'string') {
    return []
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

function pickFirstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return null
}

function resolveDynamicWarmableEndpoints(config: ReturnType<typeof useRuntimeConfig>) {
  const dynamicEndpoints: string[] = []
  const pageSlugs = parseCsvInput(
    pickFirstString(
      process.env.CACHE_WARM_PAGE_SLUGS,
      process.env.CACHE_WARM_PAGE_SLUG,
      process.env.PUBLIC_PAGE_SLUGS,
      process.env.PUBLIC_PAGE_SLUG,
      config.public?.cacheWarmPageSlugs,
      config.public?.cacheWarmPageSlug,
    ),
  )
  const locales = parseCsvInput(
    pickFirstString(
      process.env.CACHE_WARM_LOCALES,
      process.env.CACHE_WARM_LOCALE,
      process.env.PUBLIC_LOCALES,
      process.env.PUBLIC_LOCALE,
      config.public?.cacheWarmLocales,
      config.public?.cacheWarmLocale,
    ),
  )

  if (pageSlugs.length > 0 && locales.length > 0) {
    for (const slug of pageSlugs) {
      for (const locale of locales) {
        dynamicEndpoints.push(`/api/page/public/${slug}/${locale}`)
      }
    }
  }

  return dynamicEndpoints
}

async function warmEndpoint(baseUrl: string, endpoint: string): Promise<WarmResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), WARM_TIMEOUT_MS)
  const startedAt = Date.now()

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    const duration = Date.now() - startedAt

    if (!response.ok) {
      return {
        endpoint,
        duration,
        ok: false,
        status: response.status,
        error: `HTTP ${response.status}`,
      }
    }

    return {
      endpoint,
      duration,
      ok: true,
      status: response.status,
    }
  }
  catch (error) {
    const duration = Date.now() - startedAt
    return {
      endpoint,
      duration,
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown warmup error',
    }
  }
  finally {
    clearTimeout(timeout)
  }
}

async function warmEndpointsInBatches(baseUrl: string, endpoints: string[]) {
  const results: WarmResult[] = []

  for (let index = 0; index < endpoints.length; index += WARM_BATCH_SIZE) {
    const batch = endpoints.slice(index, index + WARM_BATCH_SIZE)
    const batchResults = await Promise.all(batch.map((endpoint) => warmEndpoint(baseUrl, endpoint)))
    results.push(...batchResults)
  }

  return results
}

function normalizeScope(scope: unknown) {
  if (typeof scope !== 'string') {
    return null
  }

  const trimmedScope = scope.trim().toLowerCase()
  if (!trimmedScope) {
    return null
  }

  return trimmedScope
}

function resolveDomains(scope: string | null) {
  if (!scope || scope === 'all') {
    return PURGEABLE_PUBLIC_DOMAINS.filter((domain) => !EXCLUDED_DOMAINS.has(domain))
  }

  return scope
    .split(',')
    .map((domain) => domain.trim().toLowerCase())
    .filter((domain) => domain.length > 0)
    .filter((domain, index, domains) => domains.indexOf(domain) === index)
    .filter((domain) => PURGEABLE_PUBLIC_DOMAINS.includes(domain as (typeof PURGEABLE_PUBLIC_DOMAINS)[number]))
    .filter((domain) => !EXCLUDED_DOMAINS.has(domain))
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const expectedToken =
    (typeof config.cronSecret === 'string' && config.cronSecret.trim()) ||
    process.env.CRON_SECRET ||
    ''

  const authorization = getHeader(event, 'authorization')
  const providedToken = authorization?.replace(/^Bearer\s+/i, '').trim() || ''

  if (!expectedToken || providedToken !== expectedToken) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const query = getQuery(event)
  const mode = ((typeof query.mode === 'string' ? query.mode.toLowerCase() : 'purge') ||
    'purge') as CacheRefreshMode
  const scope = normalizeScope(query.scope)

  if (mode !== 'purge' && mode !== 'warm') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid mode. Expected "purge" or "warm".',
    })
  }

  const invalidatedDomains = mode === 'purge' ? resolveDomains(scope) : []
  const warmSummary = {
    warmed: [] as string[],
    failed: [] as Array<{ endpoint: string; error: string; status?: number }>,
    durations: {} as Record<string, number>,
  }

  if (mode === 'purge') {
    await Promise.all(
      invalidatedDomains.map((domain) => invalidateByPrefix(publicCachePrefix(domain))),
    )
  }

  if (mode === 'warm') {
    const requestUrl = getRequestURL(event)
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`
    const endpoints = [...WARMABLE_ENDPOINTS, ...resolveDynamicWarmableEndpoints(config)]
      .filter((endpoint) => !endpoint.startsWith('/api/sports/'))
      .filter((endpoint, index, values) => values.indexOf(endpoint) === index)

    const warmResults = await warmEndpointsInBatches(baseUrl, endpoints)

    for (const result of warmResults) {
      warmSummary.durations[result.endpoint] = result.duration

      if (result.ok) {
        warmSummary.warmed.push(result.endpoint)
      }
      else {
        warmSummary.failed.push({
          endpoint: result.endpoint,
          error: result.error || 'Warmup failed',
          status: result.status,
        })
      }
    }
  }

  return {
    ok: true,
    mode,
    invalidatedDomains,
    warmed: warmSummary.warmed,
    failed: warmSummary.failed,
    durations: warmSummary.durations,
  }
})
