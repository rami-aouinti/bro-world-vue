import { signMercureSubscriberJwt } from '~~/server/utils/mercure/jwt'

function toTopicArray(input: string | string[] | undefined) {
  if (!input) return []
  return (Array.isArray(input) ? input : [input]).map((topic) => topic.trim()).filter(Boolean)
}

function isAllowedTopic(topic: string, userId: string) {
  if (/^\/conversations\/[^/]+\/messages$/.test(topic)) return true
  return topic === `/users/${userId}/notifications`
}

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const userId = String((user as Record<string, unknown>)?.id || '').trim()
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Missing authenticated user id' })
  }

  const query = getQuery(event)
  const topics = toTopicArray(query.topic as string | string[] | undefined)
  const privateTopics = topics.filter((topic) => isAllowedTopic(topic, userId))

  if (!privateTopics.length) {
    throw createError({ statusCode: 400, statusMessage: 'Missing Mercure private topics' })
  }

  const runtimeConfig = useRuntimeConfig(event)
  const jwtSecret = String(runtimeConfig.mercureJwtSecret || '').trim()
  if (!jwtSecret) {
    throw createError({ statusCode: 500, statusMessage: 'Missing Mercure JWT secret' })
  }

  return {
    token: signMercureSubscriberJwt(jwtSecret, privateTopics),
  }
})
