import { requestAiGatewayChat } from '~~/server/utils/aiGateway'

interface ChatGatewayRequest {
  temperature?: number
  response_format?: {
    type?: string
  }
  messages?: Array<{
    role?: string
    content?: string
  }>
}

function normalizeMessages(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as Array<{ role: 'system' | 'user'; content: string }>
  }

  return value
    .map((item) => {
      const role = item && typeof item === 'object' && 'role' in item
        ? String((item as { role?: unknown }).role || '').trim()
        : ''
      const content = item && typeof item === 'object' && 'content' in item
        ? String((item as { content?: unknown }).content || '').trim()
        : ''

      if (!content || !['system', 'user'].includes(role)) {
        return null
      }

      return {
        role: role as 'system' | 'user',
        content,
      }
    })
    .filter((item): item is { role: 'system' | 'user'; content: string } => Boolean(item))
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ChatGatewayRequest>(event)
  const messages = normalizeMessages(body.messages)

  if (!messages.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'messages are required',
    })
  }

  const payload = {
    temperature: typeof body.temperature === 'number' ? body.temperature : 0.2,
    messages,
  }

  if (body.response_format?.type === 'json_object') {
    payload.response_format = {
      type: 'json_object',
    }
  }

  return await requestAiGatewayChat(event, payload)
})
