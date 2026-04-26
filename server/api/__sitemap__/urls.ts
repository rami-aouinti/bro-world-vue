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
    { loc: '/games' },
    { loc: '/applications' },
    { loc: '/applications/quiz' },
    { loc: '/applications/sports' },
    { loc: '/platform' },
    { loc: '/platform/crm/new' },
    { loc: '/platform/job/new' },
    { loc: '/platform/school/new' },
    { loc: '/platform/shop/new' },
    { loc: '/quiz' },
    { loc: '/resume' },
    { loc: '/resume/create' },
    { loc: '/world' },
    { loc: '/world/crm' },
    { loc: '/world/crm/admin' },
    { loc: '/world/crm/admin/billings' },
    { loc: '/world/crm/admin/companies' },
    { loc: '/world/crm/admin/contacts' },
    { loc: '/world/crm/admin/employees' },
    { loc: '/world/crm/admin/projects' },
    { loc: '/world/crm/admin/reports' },
    { loc: '/world/crm/admin/sprints' },
    { loc: '/world/crm/admin/task-requests' },
    { loc: '/world/crm/admin/tasks' },
    { loc: '/world/crm/billings' },
    { loc: '/world/crm/blog' },
    { loc: '/world/crm/calendar' },
    { loc: '/world/crm/chat' },
    { loc: '/world/crm/company' },
    { loc: '/world/crm/contacts' },
    { loc: '/world/crm/endpoints' },
    { loc: '/world/crm/github-sync' },
    { loc: '/world/crm/gitlab-sync' },
    { loc: '/world/crm/kanaban' },
    { loc: '/world/crm/projects' },
    { loc: '/world/crm/repositories' },
    { loc: '/world/crm/sprints' },
    { loc: '/world/crm/task-requests' },
    { loc: '/world/crm/tasks' },
    { loc: '/world/jobs' },
    { loc: '/world/jobs/admin' },
    { loc: '/world/jobs/applications' },
    { loc: '/world/jobs/apply' },
    { loc: '/world/jobs/my-offers' },
    { loc: '/world/jobs/offers' },
    { loc: '/world/learning' },
    { loc: '/world/learning/admin' },
    { loc: '/world/learning/classes' },
    { loc: '/world/learning/courses' },
    { loc: '/world/learning/exams' },
    { loc: '/world/learning/grades' },
    { loc: '/world/learning/students' },
    { loc: '/world/learning/teachers' },
    { loc: '/world/shop' },
    { loc: '/world/shop/admin' },
    { loc: '/world/shop/checkout' },
    { loc: '/world/shop/orders' },
    { loc: '/world/shop/payment' },
    { loc: '/world/shop/products' },
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
