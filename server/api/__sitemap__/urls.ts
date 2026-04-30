import { withQuery } from 'ufo'

type BlogListResponse = {
  posts?: Array<{
    slug?: string | null
    updatedAt?: string | null
    createdAt?: string | null
  }>
  data?: {
    posts?: Array<{
      slug?: string | null
      updatedAt?: string | null
      createdAt?: string | null
    }>
  }
}

export default defineSitemapEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const base = runtimeConfig.public.siteUrl

  // 🚨 ROUTES À EXCLURE (APP / PRIVATE / ADMIN)
  const blockedPrefixes = [
    '/profile',
    '/settings',
    '/inbox',
    '/notification',
    '/auth',
    '/forgot-password',

    '/world/crm',
    '/world/jobs',
    '/world/shop/checkout',
    '/world/shop/payment',
    '/world/learning/admin',

    '/platform',
    '/resume',
  ]

  const isBlocked = (url: string) =>
    blockedPrefixes.some((p) => url.startsWith(p))

  // ✅ SEO ONLY (public pages)
  const staticUrls = [
    '/',
    '/about',
    '/contact',
    '/faq',
    '/service',

    '/world',
    '/world/shop',
    '/world/learning',

    '/applications/quiz',
    '/applications/sports',
    '/games',
  ]
    .filter((url) => !isBlocked(url))
    .map((url) => ({
      loc: `${base}${url}`,
      lastmod: new Date().toISOString(),
    }))

  const blogIndex: Array<{ loc: string; lastmod?: string }> = []

  try {
    const endpoint = withQuery(
      new URL(
        '/api/v1/public/blogs/general',
        runtimeConfig.public.apiBaseUrl,
      ).toString(),
      { page: 1, limit: 100 },
    )

    const payload = await $fetch<BlogListResponse>(endpoint)
    const posts = payload.posts ?? payload.data?.posts ?? []

    for (const post of posts) {
      const slug = post.slug?.trim()

      // sécurité SEO
      if (!slug || slug.length < 10 || slug.length > 120) continue

      const url = `/blog/${encodeURIComponent(slug)}/post`

      if (isBlocked(url)) continue

      blogIndex.push({
        loc: `${base}${url}`,
        lastmod: post.updatedAt ?? post.createdAt ?? undefined,
      })
    }
  } catch {
    // fallback safe
  }

  return [...staticUrls, ...blogIndex]
})
