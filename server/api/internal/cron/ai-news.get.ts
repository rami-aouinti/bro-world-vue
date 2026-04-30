import type { H3Event } from 'h3'
import { getHeader } from 'h3'
import { fetchTokenWithPassword } from '~~/server/utils/authSession'
import { resolveApiUrl } from '~~/server/utils/resolveApiUrl'

type PublicUser = {
  id: string
  username: string
  displayName: string
}

type GeneratedArticle = {
  title: string
  content: string
  sharedUrl?: string
}

type AiGatewayChoice = {
  message?: {
    content?: string | null
  }
}

type AiGatewayResponse = {
  choices?: AiGatewayChoice[]
}

type GeneratedArticlesPayload = {
  articles?: GeneratedArticle[]
}

const TOPIC_CATALOG = [
  { name: 'Symfony', url: 'https://symfony.com/doc/current/index.html' },
  { name: 'Nuxt', url: 'https://nuxt.com/docs' },
  {
    name: 'Vuetify',
    url: 'https://vuetifyjs.com/en/getting-started/installation/',
  },
  { name: 'API Design', url: 'https://restfulapi.net/' },
  {
    name: 'Elasticsearch',
    url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html',
  },
  { name: 'RabbitMQ', url: 'https://www.rabbitmq.com/docs' },
  { name: 'Redis', url: 'https://redis.io/docs/latest/' },
  { name: 'MongoDB', url: 'https://www.mongodb.com/docs/' },
] as const

const DEFAULT_FALLBACK_TITLES = [
  'Observabilité moderne pour stack Symfony + Nuxt',
  'Pourquoi Redis + RabbitMQ accélèrent les APIs',
  'Elasticsearch et MongoDB : duo gagnant pour la recherche produit',
] as const

const AI_DAILY_USAGE_KEY = 'internal:cron:ai-news:last-ai-usage-date'

function pickRandomItems<T>(items: T[], count: number) {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const currentItem = shuffled[index] as T
    shuffled[index] = shuffled[randomIndex] as T
    shuffled[randomIndex] = currentItem
  }

  return shuffled.slice(0, Math.max(0, Math.min(count, shuffled.length)))
}

function getUtcDateKey(now = new Date()) {
  return now.toISOString().slice(0, 10)
}

async function canUseAiForToday() {
  const storage = useStorage('cache')
  const todayKey = getUtcDateKey()
  const lastUsageDay = String((await storage.getItem(AI_DAILY_USAGE_KEY)) ?? '')

  return {
    allowed: lastUsageDay !== todayKey,
    todayKey,
    lastUsageDay: lastUsageDay || null,
    storage,
  }
}

function readUsersFromResponse(payload: unknown): PublicUser[] {
  const source =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data?: unknown }).data
      : payload

  if (!Array.isArray(source)) {
    return []
  }

  return source
    .map((entry): PublicUser | null => {
      if (!entry || typeof entry !== 'object') {
        return null
      }

      const user = entry as Record<string, unknown>
      const id = String(user.id ?? '').trim()
      const username = String(user.username ?? '').trim()
      const displayName = String(
        user.name ?? user.displayName ?? username,
      ).trim()

      if (!id || !username) {
        return null
      }

      return { id, username, displayName }
    })
    .filter((entry): entry is PublicUser => Boolean(entry))
}

function parseArticles(content: string): GeneratedArticle[] {
  const parsed = JSON.parse(content) as GeneratedArticlesPayload
  const articles = parsed.articles ?? []

  return articles
    .map((article): GeneratedArticle | null => {
      const title = String(article.title ?? '').trim()
      const body = String(article.content ?? '').trim()
      const sharedUrl = String(article.sharedUrl ?? '').trim()

      if (!title || !body) {
        return null
      }

      return {
        title,
        content: body,
        ...(sharedUrl ? { sharedUrl } : {}),
      }
    })
    .filter((article): article is GeneratedArticle => Boolean(article))
    .slice(0, 3)
}

function buildFallbackArticles(users: PublicUser[]): GeneratedArticle[] {
  const pickedTopics = pickRandomItems([...TOPIC_CATALOG], 3)
  const pickedUsers = pickRandomItems(users, 3)

  return pickedTopics.map((topic, index) => {
    const author =
      pickedUsers[index]?.displayName ||
      pickedUsers[index]?.username ||
      'la communauté'

    return {
      title: DEFAULT_FALLBACK_TITLES[index] ?? `News technique: ${topic.name}`,
      content:
        `Point rapide sur ${topic.name}: nouveautés, bonnes pratiques et pièges à éviter côté production. ` +
        `Rédigé automatiquement pour ${author}.`,
      sharedUrl: topic.url,
    }
  })
}

function buildPrompt(candidateUsers: PublicUser[]) {
  return (
    `Tu es un rédacteur tech. Génère strictement du JSON avec la forme {"articles": [{"title": string, "content": string, "sharedUrl": string}]}.
` +
    `Contraintes: 3 articles exactement, français, ton clair, 120 à 220 mots par article, chaque article doit parler d'au moins un sujet parmi Symfony, Nuxt, Vuetify, API, Elasticsearch, RabbitMQ, Redis, MongoDB.
` +
    `Inclure sharedUrl seulement si tu proposes un lien utile.
` +
    `Liste publique d'utilisateurs (choisir un auteur aléatoire à mentionner dans le contenu, sans inventer de nom): ${JSON.stringify(candidateUsers)}
` +
    `Liste de références possibles: ${JSON.stringify(TOPIC_CATALOG)}`
  )
}

async function generateArticlesWithAi(event: H3Event, users: PublicUser[]) {
  const runtimeConfig = useRuntimeConfig(event)
  const apiKey = runtimeConfig.aiGatewayApiKey
  const model = runtimeConfig.aiGatewayModel

  if (!apiKey || !model) {
    return buildFallbackArticles(users)
  }

  const response = await $fetch<AiGatewayResponse>(
    'https://ai-gateway.vercel.sh/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: {
        model,
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'Retourne uniquement du JSON valide.' },
          { role: 'user', content: buildPrompt(users) },
        ],
      },
    },
  )

  const content = response.choices?.[0]?.message?.content?.trim()

  if (!content) {
    return buildFallbackArticles(users)
  }

  try {
    const parsed = parseArticles(content)
    return parsed.length > 0 ? parsed : buildFallbackArticles(users)
  } catch {
    return buildFallbackArticles(users)
  }
}

function hasValidCronAuth(event: H3Event, expectedToken: string) {
  const vercelCronHeader = getHeader(event, 'x-vercel-cron')
  const vercelCronFlag = String(vercelCronHeader || '')
    .trim()
    .toLowerCase()
  const userAgent = String(getHeader(event, 'user-agent') || '')
    .trim()
    .toLowerCase()

  if (
    ['1', 'true', 'yes', 'on'].includes(vercelCronFlag) ||
    userAgent.startsWith('vercel-cron/')
  ) {
    return true
  }

  if (!expectedToken) {
    return false
  }

  const authorization = getHeader(event, 'authorization')
  const providedToken = authorization?.replace(/^Bearer\s+/i, '').trim() || ''
  return providedToken === expectedToken
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const expectedToken =
    (typeof runtimeConfig.cronSecret === 'string' &&
      runtimeConfig.cronSecret.trim()) ||
    process.env.CRON_SECRET ||
    ''

  if (!hasValidCronAuth(event, expectedToken)) {
    throw createError({
      statusCode: 401,
      statusMessage:
        'Unauthorized (missing CRON_SECRET bearer token or x-vercel-cron header)',
    })
  }

  const automationUsername =
    (typeof runtimeConfig.blogAutomationUsername === 'string' &&
      runtimeConfig.blogAutomationUsername.trim()) ||
    process.env.BLOG_AUTOMATION_USERNAME ||
    ''
  const automationPassword =
    (typeof runtimeConfig.blogAutomationPassword === 'string' &&
      runtimeConfig.blogAutomationPassword.trim()) ||
    process.env.BLOG_AUTOMATION_PASSWORD ||
    ''

  if (!automationUsername || !automationPassword) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Missing BLOG_AUTOMATION_USERNAME or BLOG_AUTOMATION_PASSWORD for automated blog posting',
    })
  }

  const serviceToken = await fetchTokenWithPassword(event, {
    username: automationUsername,
    password: automationPassword,
  })

  const usersResponse = await $fetch<unknown>(
    resolveApiUrl(runtimeConfig.public.apiBaseUrl, '/api/v1/public/users'),
    { headers: { accept: 'application/json' } },
  )

  const users = readUsersFromResponse(usersResponse)
  const randomUsers = pickRandomItems(users, 3)

  const aiUsage = await canUseAiForToday()
  const usedAi = aiUsage.allowed
  const articles = usedAi
    ? await generateArticlesWithAi(event, randomUsers)
    : buildFallbackArticles(randomUsers)

  if (usedAi) {
    await aiUsage.storage.setItem(AI_DAILY_USAGE_KEY, aiUsage.todayKey)
  }

  const creationResults = await Promise.all(
    articles.map(async (article) => {
      const payload = {
        title: article.title,
        content: article.content,
        ...(article.sharedUrl ? { sharedUrl: article.sharedUrl } : {}),
      }

      const privateEndpoint = resolveApiUrl(
        runtimeConfig.public.apiBaseUrl,
        '/api/v1/private/blogs/general/posts',
      )
      const privateResponse = await fetch(privateEndpoint, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${serviceToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!privateResponse.ok) {
        const errorBody = await privateResponse.text()
        throw createError({
          statusCode: privateResponse.status,
          statusMessage: `Failed to create automated news post: ${errorBody.slice(0, 300)}`,
        })
      }

      const response = await privateResponse.json()

      return {
        title: article.title,
        response,
      }
    }),
  )

  return {
    ok: true,
    usedAi,
    aiAlreadyUsedAtUtcDay: aiUsage.lastUsageDay,
    pickedUsers: randomUsers,
    createdCount: creationResults.length,
    createdTitles: creationResults.map((entry) => entry.title),
  }
})
