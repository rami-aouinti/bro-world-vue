import { defineSitemapEventHandler } from '#imports'

const STATIC_ROUTES = [
  '/',
  '/world',
  '/platform',
  '/applications',
  '/resume',
  '/games',
  '/world/jobs',
  '/world/crm',
  '/world/learning',
  '/world/shop',
  '/world/shop/products',
]

export default defineSitemapEventHandler(() => {
  const now = new Date()

  return STATIC_ROUTES.map((route) => ({
    loc: route,
    lastmod: now,
  }))
})
