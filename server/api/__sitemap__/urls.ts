import { withQuery } from 'ufo'

type BlogListResponse = {
  posts?: Array<{ slug?: string | null; updatedAt?: string | null; createdAt?: string | null }>
  data?: {
    posts?: Array<{ slug?: string | null; updatedAt?: string | null; createdAt?: string | null }>
  }
}

export default defineSitemapEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)

  const staticUrls = [
    { loc: '/' },
    { loc: '/service' },
    { loc: '/about' },
    { loc: '/faq' },
    { loc: '/contact' },
    { loc: '/world' },
    { loc: '/world/shop' },
    { loc: '/world/learning' },
    { loc: '/world/crm' },
    { loc: '/games' },
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
      if (!slug) {
        continue
      }

      blogIndex.push({
        loc: `/blog/${encodeURIComponent(slug)}/post`,
        lastmod: post.updatedAt ?? post.createdAt ?? undefined,
      })
    }
  } catch {
    // Ignore remote blog indexing issues and keep static sitemap URLs.
  }

  return [...staticUrls, ...blogIndex]
})
