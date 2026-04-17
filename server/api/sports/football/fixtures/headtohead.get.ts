import { fetchFixtureHeadToHead } from '../../../../utils/footballApi'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const h2h = Array.isArray(query.h2h) ? query.h2h[0] : query.h2h

  if (typeof h2h !== 'string' || !/^\d+-\d+$/.test(h2h.trim())) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid query parameter: h2h',
    })
  }

  return fetchFixtureHeadToHead(event, h2h.trim())
})
