export const PUBLIC_PAGE_SLUGS = [
  'home',
  'about',
  'faq',
  'contact',
  // Convention: <module>-<public-page> slugs validated by backend.
  'jobs-offers',
  'jobs-applications',
  'learning-courses',
  'learning-teachers',
] as const

export type PublicPageSlug = (typeof PUBLIC_PAGE_SLUGS)[number]

export function isPublicPageSlug(value: string): value is PublicPageSlug {
  return (PUBLIC_PAGE_SLUGS as readonly string[]).includes(value)
}
