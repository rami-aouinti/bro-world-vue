import { withQuery } from 'ufo'

type BlogListResponse = {
  posts?: Array<{ slug?: string | null; updatedAt?: string | null; createdAt?: string | null }>
  data?: {
    posts?: Array<{ slug?: string | null; updatedAt?: string | null; createdAt?: string | null }>
  }
}

export default defineSitemapEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const base = runtimeConfig.public.siteUrl

  // ✅ Pages publiques uniquement (SEO)
  const staticUrls = [
    { loc: `${base}/`, lastmod: new Date().toISOString() },
    { loc: `${base}/about`, lastmod: new Date().toISOString() },
    { loc: `${base}/contact`, lastmod: new Date().toISOString() },
    { loc: `${base}/faq`, lastmod: new Date().toISOString() },
    { loc: `${base}/service`, lastmod: new Date().toISOString() },

    // pages utiles uniquement
    { loc: `${base}/world` },
    { loc: `${base}/world/shop` },
    { loc: `${base}/world/learning` },
    { loc: `${base}/world/crm` },

    { loc: `${base}/applications/quiz` },
    { loc: `${base}/applications/sports` },

    { loc: `${base}/games` },
  ]

  const blogIndex: Array<{ loc: string; lastmod?: string }> = []

  try {
    const endpoint = withQuery(
      new URL('/api/v1/public/blogs/general', runtimeConfig.public.apiBaseUrl).toString(),
      { page: 1, limit: 200 },
    )

    const payload = await $fetch<BlogListResponse>(endpoint)
    const posts = payload.posts ?? payload.data?.posts ?? []

    for (const post of posts) {
      const slug = post.slug?.trim()

      if (!slug || slug.length > 120) continue

      blogIndex.push({
        loc: `${base}/blog/${encodeURIComponent(slug)}/post`,
        lastmod: post.updatedAt ?? post.createdAt ?? undefined,
      })
    }
  } catch {
    // fallback propre si API KO
  }

  return [...staticUrls, ...blogIndex]
})
