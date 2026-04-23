import type { H3Event } from 'h3'
import { getHeader } from 'h3'
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
  {
    name: 'Symfony',
    url: 'https://symfony.com/doc/current/index.html',
  },
  {
    name: 'Nuxt',
    url: 'https://nuxt.com/docs',
  },
  {
    name: 'Vuetify',
    url: 'https://vuetifyjs.com/en/getting-started/installation/',
  },
  {
    name: 'API Design',
    url: 'https://restfulapi.net/',
  },
  {
    name: 'Elasticsearch',
    url: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html',
  },
  {
    name: 'RabbitMQ',
    url: 'https://www.rabbitmq.com/docs',
  },
  {
    name: 'Redis',
    url: 'https://redis.io/docs/latest/',
  },
  {
    name: 'MongoDB',
    url: 'https://www.mongodb.com/docs/',
  },
] as const

const DEFAULT_FALLBACK_TITLES = [
  'Observabilité moderne pour stack Symfony + Nuxt',
  'Pourquoi Redis + RabbitMQ accélèrent les APIs',
  'Elasticsearch et MongoDB : duo gagnant pour la recherche produit',
] as const

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
      const displayName = String(user.name ?? user.displayName ?? username).trim()

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

function buildFallbackArticles(): GeneratedArticle[] {
  const pickedTopics = pickRandomItems([...TOPIC_CATALOG], 3)

  return pickedTopics.map((topic, index) => ({
    title: DEFAULT_FALLBACK_TITLES[index] ?? `News technique: ${topic.name}`,
    content:
      `Point rapide sur ${topic.name}: nouveautés, bonnes pratiques et pièges à éviter côté production. ` +
      `Ce post a été généré automatiquement par l'agent IA du site.`,
    sharedUrl: topic.url,
  }))
}

function buildPrompt(candidateUsers: PublicUser[]) {
  return `Tu es un rédacteur tech. Génère strictement du JSON avec la forme {"articles": [{"title": string, "content": string, "sharedUrl": string}]}.\n` +
    `Contraintes: 3 articles exactement, français, ton clair, 120 à 220 mots par article, chaque article doit parler d'au moins un sujet parmi Symfony, Nuxt, Vuetify, API, Elasticsearch, RabbitMQ, Redis, MongoDB.\n` +
    `Inclure sharedUrl seulement si tu proposes un lien utile.\n` +
    `Liste publique d'utilisateurs (choisir un auteur aléatoire à mentionner dans le contenu, sans inventer de nom): ${JSON.stringify(candidateUsers)}\n` +
    `Liste de références possibles: ${JSON.stringify(TOPIC_CATALOG)}`
}

async function generateArticlesWithAi(event: H3Event, users: PublicUser[]) {
  const runtimeConfig = useRuntimeConfig(event)
  const apiKey = runtimeConfig.aiGatewayApiKey
  const model = runtimeConfig.aiGatewayModel

  if (!apiKey || !model) {
    return buildFallbackArticles()
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
          {
            role: 'system',
            content: 'Retourne uniquement du JSON valide.',
          },
          {
            role: 'user',
            content: buildPrompt(users),
          },
        ],
      },
    },
  )

  const content = response.choices?.[0]?.message?.content?.trim()

  if (!content) {
    return buildFallbackArticles()
  }

  try {
    const parsed = parseArticles(content)
    return parsed.length > 0 ? parsed : buildFallbackArticles()
  } catch {
    return buildFallbackArticles()
  }
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const expectedToken =
    (typeof runtimeConfig.cronSecret === 'string' && runtimeConfig.cronSecret.trim()) ||
    process.env.CRON_SECRET ||
    ''

  const authorization = getHeader(event, 'authorization')
  const providedToken = authorization?.replace(/^Bearer\s+/i, '').trim() || ''

  if (!expectedToken || providedToken !== expectedToken) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const serviceToken =
    (typeof runtimeConfig.blogAutomationToken === 'string' && runtimeConfig.blogAutomationToken.trim()) ||
    process.env.BLOG_AUTOMATION_TOKEN ||
    ''

  if (!serviceToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing BLOG_AUTOMATION_TOKEN for automated blog posting',
    })
  }

  const usersResponse = await $fetch<unknown>(
    resolveApiUrl(runtimeConfig.public.apiBaseUrl, '/api/v1/public/users'),
    {
      headers: { accept: 'application/json' },
    },
  )

  const users = readUsersFromResponse(usersResponse)
  const randomUsers = pickRandomItems(users, 3)
  const articles = await generateArticlesWithAi(event, randomUsers)

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
    pickedUsers: randomUsers,
    createdCount: creationResults.length,
    createdTitles: creationResults.map((entry) => entry.title),
  }
})
