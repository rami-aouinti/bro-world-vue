export default defineEventHandler(async (event): Promise<unknown> => {
  const runtimeConfig = useRuntimeConfig(event)
  const query = getQuery(event)
  const page = Number(query.page ?? 1)
  const limit = Number(query.limit ?? 20)

  return $fetch(`${runtimeConfig.public.apiBaseUrl}/application/public`, {
    query: { page, limit },
    headers: {
      accept: 'application/json',
    },
  })
})
