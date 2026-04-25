export default defineEventHandler((event) => {
  const query = getQuery(event)
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null) search.append(key, String(item))
      }
      continue
    }

    if (value != null) {
      search.append(key, String(value))
    }
  }

  const target = search.size
    ? `/api/auth/azure-ad?${search.toString()}`
    : '/api/auth/azure-ad'

  return sendRedirect(event, target)
})
