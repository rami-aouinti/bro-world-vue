interface ResumeAiReviewRequestBody {
  language?: string
  templateId?: string
  currentResume?: Record<string, unknown>
}

interface GatewayResponse {
  choices?: Array<{
    message?: {
      content?: string | null
    }
  }>
}

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ResumeAiReviewRequestBody>(event)

  const language = cleanText(body.language) || 'en'
  const templateId = cleanText(body.templateId) || 'classic'
  const currentResume =
    body.currentResume && typeof body.currentResume === 'object'
      ? body.currentResume
      : {}

  const runtimeConfig = useRuntimeConfig(event)
  const apiKey = runtimeConfig.aiGatewayApiKey
  const model = runtimeConfig.aiGatewayModel

  if (!apiKey || !model) {
    throw createError({
      statusCode: 503,
      statusMessage: 'AI service is not configured',
    })
  }

  const response = await $fetch<GatewayResponse>(
    'https://ai-gateway.vercel.sh/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: {
        model,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'You are a senior resume reviewer. Return detailed feedback in plain text with these sections: 1) Detected errors, 2) Suggested improvements, 3) Rewritten examples, 4) Priority actions.',
          },
          {
            role: 'user',
            content: `Review this resume in language "${language}" and adapt recommendations for template "${templateId}". Resume JSON: ${JSON.stringify(currentResume)}.`,
          },
        ],
      },
    },
  )

  const content = cleanText(response.choices?.[0]?.message?.content)

  if (!content) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Empty AI review response',
    })
  }

  return {
    review: content,
  }
})
