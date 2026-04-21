import { invalidateByPrefix, publicCachePrefix } from '~~/server/utils/apiCache'

type CacheRefreshMode = 'purge' | 'warm'

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

  if (mode === 'purge') {
    await Promise.all(
      invalidatedDomains.map((domain) => invalidateByPrefix(publicCachePrefix(domain))),
    )
  }

  return {
    ok: true,
    mode,
    invalidatedDomains,
  }
})
