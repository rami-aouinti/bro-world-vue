type PublicPageSlug = 'home' | 'about' | 'faq' | 'contact'

type CachedPublicPage = {
  fetchedAt: number
  data: unknown
}

type PublicPagesCache = Record<string, CachedPublicPage>

const PUBLIC_PAGES_CACHE_TTL_MS = 365 * 24 * 60 * 60 * 1000
const PUBLIC_PAGES_STORAGE_KEY = 'bro-world-public-pages-cache-v1'

function buildCacheKey(slug: PublicPageSlug, locale: string) {
  return `${slug}:${locale}`
}

export const usePublicPagesStore = defineStore('public-pages', () => {
  const cache = ref<PublicPagesCache>({})
  const loading = ref(false)
  const error = ref('')
  const hydrated = ref(false)

  function hydrateFromLocalStorage() {
    if (!process.client || hydrated.value) {
      return
    }

    hydrated.value = true

    try {
      const rawValue = localStorage.getItem(PUBLIC_PAGES_STORAGE_KEY)

      if (!rawValue) {
        return
      }

      cache.value = JSON.parse(rawValue) as PublicPagesCache
    } catch {
      cache.value = {}
    }
  }

  function persistToLocalStorage() {
    if (!process.client) {
      return
    }

    localStorage.setItem(PUBLIC_PAGES_STORAGE_KEY, JSON.stringify(cache.value))
  }

  function clearExpiredEntries() {
    const now = Date.now()
    const nextCache: PublicPagesCache = {}

    for (const [key, entry] of Object.entries(cache.value)) {
      if (now - entry.fetchedAt < PUBLIC_PAGES_CACHE_TTL_MS) {
        nextCache[key] = entry
      }
    }

    cache.value = nextCache
  }

  function getPage<T>(slug: PublicPageSlug, locale: string) {
    hydrateFromLocalStorage()
    clearExpiredEntries()

    const key = buildCacheKey(slug, locale)
    const entry = cache.value[key]

    if (!entry) {
      return null as T | null
    }

    return entry.data as T
  }

  async function fetchPage<T>(
    slug: PublicPageSlug,
    locale: string,
    force = false,
  ) {
    hydrateFromLocalStorage()
    clearExpiredEntries()

    const key = buildCacheKey(slug, locale)
    const cachedEntry = cache.value[key]

    if (
      !force &&
      cachedEntry &&
      Date.now() - cachedEntry.fetchedAt < PUBLIC_PAGES_CACHE_TTL_MS
    ) {
      return cachedEntry.data as T
    }

    loading.value = true
    error.value = ''

    try {
      const api = usePublicApi()
      const response = await api<T>(`/page/public/${slug}/${locale}`)

      cache.value[key] = {
        data: response,
        fetchedAt: Date.now(),
      }

      persistToLocalStorage()
      return response
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to load public page content'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    cache,
    loading,
    error,
    getPage,
    fetchPage,
  }
})
