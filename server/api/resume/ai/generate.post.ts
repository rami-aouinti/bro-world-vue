interface ResumeAiRequestBody {
  language?: string
  templateId?: string
  userPrompt?: string
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
  const body = await readBody<ResumeAiRequestBody>(event)

  const language = cleanText(body.language) || 'en'
  const templateId = cleanText(body.templateId) || 'classic'
  const userPrompt = cleanText(body.userPrompt)
  const currentResume = body.currentResume && typeof body.currentResume === 'object'
    ? body.currentResume
    : {}

  if (!userPrompt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'userPrompt is required',
    })
  }

  const runtimeConfig = useRuntimeConfig(event)
  const apiKey = runtimeConfig.aiGatewayApiKey
  const model = runtimeConfig.aiGatewayModel

  if (!apiKey || !model) {
    throw createError({
      statusCode: 503,
      statusMessage: 'AI service is not configured',
    })
  }

  const response = await $fetch<GatewayResponse>('https://ai-gateway.vercel.sh/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: {
      model,
      temperature: 0.3,
      response_format: {
        type: 'json_object',
      },
      messages: [
        {
          role: 'system',
          content: 'You are a resume assistant. Return strict JSON only with this exact shape: {"resume": {"role": string, "firstName": string, "lastName": string, "email": string, "phone": string, "city": string, "country": string, "profile": string, "photoUrl": string, "skills": [{"name": string, "level": number}], "languages": [{"name": string, "level": number}], "hobbies": string[], "experiences": [{"role": string, "company": string, "city": string, "start": string, "end": string, "bullets": string[]}], "education": [{"degree": string, "school": string, "city": string, "start": string, "end": string, "note": string}], "references": [{"name": string, "company": string, "email": string, "phone": string}], "courses": [{"title": string, "school": string, "start": string, "end": string}], "projects": [{"name": string, "summary": string}] }}',
        },
        {
          role: 'user',
          content: `Language: ${language}. Template: ${templateId}. User summary: ${userPrompt}. Current resume draft: ${JSON.stringify(currentResume)}. Generate a complete and coherent resume in the requested language.`,
        },
      ],
    },
  })

  const content = response.choices?.[0]?.message?.content

  if (!content) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Empty AI response',
    })
  }

  let parsed: Record<string, unknown>

  try {
    parsed = JSON.parse(content) as Record<string, unknown>
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'Invalid AI response format',
    })
  }

  return {
    resume: typeof parsed.resume === 'object' && parsed.resume
      ? parsed.resume
      : currentResume,
  }
})
