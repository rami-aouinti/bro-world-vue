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

interface ChatGatewayResponse {
  choices?: Array<{
    message?: {
      content?: string | null
    }
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
  const runtimeConfig = useRuntimeConfig(event)

  const apiKey = String(runtimeConfig.aiGatewayApiKey || '').trim()
  const model = String(runtimeConfig.aiGatewayModel || 'openai/gpt-4o-mini').trim()
  const messages = normalizeMessages(body.messages)

  if (!apiKey || !model) {
    throw createError({
      statusCode: 503,
      statusMessage: 'AI gateway is not configured',
    })
  }

  if (!messages.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'messages are required',
    })
  }

  const payload: Record<string, unknown> = {
    model,
    temperature: typeof body.temperature === 'number' ? body.temperature : 0.2,
    messages,
  }

  if (body.response_format?.type === 'json_object') {
    payload.response_format = {
      type: 'json_object',
    }
  }

  return await $fetch<ChatGatewayResponse>('https://ai-gateway.vercel.sh/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: payload,
  })
})
