import type { H3Event } from 'h3'

interface CandidateEvent {
  title: string
  summary: string
  category: string
  startAt: string
  sourceUrl: string
}

interface RankedEvent {
  title: string
  summary: string
  category: string
  impact: 'high' | 'medium' | 'low'
  zone: string
  startAt: string
  sourceUrl: string
}

interface AiGatewayChoice {
  message?: {
    content?: string | null
  }
}

interface AiGatewayResponse {
  choices?: AiGatewayChoice[]
}

interface AiGatewayRankingPayload {
  events?: RankedEvent[]
}

interface AiGatewayRequestBody {
  model: string
  temperature: number
  response_format?: {
    type: 'json_object'
  }
  messages: Array<{
    role: 'system' | 'user'
    content: string
  }>
}

export interface AiGatewayChatMessage {
  role: 'system' | 'user'
  content: string
}

export interface AiGatewayChatPayload {
  temperature?: number
  response_format?: {
    type: 'json_object'
  }
  messages: AiGatewayChatMessage[]
}

export interface AiGatewayChatResponse {
  choices?: Array<{
    message?: {
      content?: string | null
    }
  }>
}

const AI_GATEWAY_CHAT_COMPLETIONS_URL =
  'https://ai-gateway.vercel.sh/v1/chat/completions'

function getFetchErrorStatusCode(error: unknown) {
  if (typeof error !== 'object' || !error || !('statusCode' in error)) {
    return NaN
  }

  return Number(error.statusCode)
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function clampText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 1)}…`
}

function parseAndValidateRanking(content: string) {
  const parsed = JSON.parse(content) as AiGatewayRankingPayload

  const safeEvents = (parsed.events ?? [])
    .map((event): RankedEvent | null => {
      const impact = cleanString(event?.impact) as RankedEvent['impact']

      if (!['high', 'medium', 'low'].includes(impact)) {
        return null
      }

      const title = cleanString(event?.title)
      const summary = cleanString(event?.summary)
      const category = cleanString(event?.category)
      const zone = cleanString(event?.zone)
      const startAt = cleanString(event?.startAt)
      const sourceUrl = cleanString(event?.sourceUrl)

      if (!title || !summary || !category || !zone || !startAt || !sourceUrl) {
        return null
      }

      return {
        title,
        summary,
        category,
        impact,
        zone,
        startAt,
        sourceUrl,
      }
    })
    .filter((event): event is RankedEvent => Boolean(event))

  return safeEvents.slice(0, 8)
}

export async function requestAiGatewayChat(
  event: H3Event,
  payload: AiGatewayChatPayload,
) {
  const runtimeConfig = useRuntimeConfig(event)
  const apiKey = runtimeConfig.aiGatewayApiKey
  const model = runtimeConfig.aiGatewayModel

  if (!apiKey || !model) {
    throw createError({
      statusCode: 503,
      statusMessage: 'AI gateway is not configured',
    })
  }

  const baseBody = {
    model,
    temperature:
      typeof payload.temperature === 'number' ? payload.temperature : 0.2,
    messages: payload.messages,
  } satisfies Omit<AiGatewayRequestBody, 'response_format'>

  try {
    return await $fetch<AiGatewayChatResponse>(AI_GATEWAY_CHAT_COMPLETIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: payload.response_format
        ? {
            ...baseBody,
            response_format: payload.response_format,
          }
        : baseBody,
    })
  } catch (error) {
    const statusCode = getFetchErrorStatusCode(error)

    if (statusCode === 400 && payload.response_format) {
      return await $fetch<AiGatewayChatResponse>(AI_GATEWAY_CHAT_COMPLETIONS_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: baseBody,
      })
    }

    if ([401, 403, 404, 429].includes(statusCode)) {
      throw createError({
        statusCode: 503,
        statusMessage:
          'AI gateway is unavailable. Verify billing and API gateway access in Vercel.',
      })
    }

    throw error
  }
}

export async function rankEventsWithAiGateway(
  event: H3Event,
  candidates: CandidateEvent[],
) {
  if (!candidates.length) {
    return []
  }

  const runtimeConfig = useRuntimeConfig(event)
  const apiKey = runtimeConfig.aiGatewayApiKey
  const model = runtimeConfig.aiGatewayModel

  if (!apiKey || !model) {
    return []
  }

  const normalizedCandidates = candidates.slice(0, 10).map((candidate) => ({
    title: clampText(cleanString(candidate.title), 180),
    summary: clampText(cleanString(candidate.summary), 320),
    category: cleanString(candidate.category) || 'general',
    startAt: cleanString(candidate.startAt),
    sourceUrl: clampText(cleanString(candidate.sourceUrl), 500),
  }))

  const baseBody: AiGatewayRequestBody = {
    model,
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          'You are a newsroom editor. Return strict JSON only with this shape: {"events": [{"title": string, "summary": string, "category": string, "impact": "high"|"medium"|"low", "zone": string, "startAt": string, "sourceUrl": string}]}. Keep max 8 items.',
      },
      {
        role: 'user',
        content: `Prioritize events with high public impact (conflicts, disasters, major sports matches, major political/economic announcements). Candidates: ${JSON.stringify(
          normalizedCandidates,
        )}`,
      },
    ],
  }

  let response: AiGatewayResponse

  try {
    response = await $fetch<AiGatewayResponse>(
      AI_GATEWAY_CHAT_COMPLETIONS_URL,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: {
          ...baseBody,
          response_format: {
            type: 'json_object',
          },
        } satisfies AiGatewayRequestBody,
      },
    )
  } catch (error) {
    const statusCode = getFetchErrorStatusCode(error)

    if (statusCode !== 400) {
      if ([401, 403, 404, 429].includes(statusCode)) {
        return []
      }

      throw error
    }

    try {
      response = await $fetch<AiGatewayResponse>(
        AI_GATEWAY_CHAT_COMPLETIONS_URL,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: baseBody,
        },
      )
    } catch (fallbackError) {
      const fallbackStatusCode = getFetchErrorStatusCode(fallbackError)

      if ([401, 403, 404, 429].includes(fallbackStatusCode)) {
        return []
      }

      throw fallbackError
    }
  }

  const content = response.choices?.[0]?.message?.content

  if (!content) {
    return []
  }

  return parseAndValidateRanking(content)
}
