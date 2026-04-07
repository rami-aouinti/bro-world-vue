export default defineEventHandler(async (event): Promise<unknown> => {
  const runtimeConfig = useRuntimeConfig(event)

  return $fetch(`${runtimeConfig.public.apiBaseUrl}/api/v1/public/blogs/reactions/types`, {
    headers: {
      accept: 'application/json',
    },
  })
})
