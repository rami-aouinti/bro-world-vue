import { cachedPublicGet } from '~~/server/utils/publicApi'

function parsePositiveInt(value: unknown, fallback: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(1, Math.floor(parsed))
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parsePositiveInt(query.page, 1)
  const limit = parsePositiveInt(query.limit, 20)

  return cachedPublicGet(event, '/api/v1/shop/general', {
    query: { page, limit },
  })
})
