import { rankEventsWithAiGateway } from '../../utils/aiGateway'
import { getCached, publicCacheKey, setCached } from '../../utils/apiCache'

interface ReverseGeocodingResponse {
  results?: Array<{
    name?: string
    admin1?: string
    country?: string
    country_code?: string
  }>
}

interface WeatherResponse {
  current?: {
    temperature_2m?: number
    weather_code?: number
    time?: string
  }
}

interface EventItem {
  title: string
  summary: string
  category: string
  startAt: string
  sourceUrl: string
}

interface LocalContextPayload {
  location: {
    city: string
    region: string
    country: string
    countryCode: string
  }
  weather: {
    temperatureC: number | null
    condition: string
    weatherCode: number | null
    observedAt: string
  }
  events: EventItem[]
  majorEvents: Array<
    EventItem & {
      impact: 'high' | 'medium' | 'low'
      zone: string
    }
  >
}

const weatherCodeMap: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
}

function parseCoordinate(value: unknown, label: string) {
  const numeric = Number(value)

  if (!Number.isFinite(numeric)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid ${label} parameter`,
    })
  }

  return numeric
}

function toIsoDateFromRss(pubDate: string | null) {
  if (!pubDate) {
    return new Date().toISOString()
  }

  const parsed = new Date(pubDate)

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString()
  }

  return parsed.toISOString()
}

function decodeXmlEntities(value: string) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

function normalizeText(value: string) {
  return decodeXmlEntities(value)
    .replace(/<[^>]+>/g, '')
    .trim()
}

function parseRss(xml: string, defaultCategory: string) {
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  const titleRegex =
    /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/
  const linkRegex = /<link>([\s\S]*?)<\/link>/
  const descriptionRegex =
    /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description>([\s\S]*?)<\/description>/
  const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/

  const events: EventItem[] = []

  for (const match of xml.matchAll(itemRegex)) {
    const itemRaw = match[1] ?? ''
    const titleMatch = itemRaw.match(titleRegex)
    const linkMatch = itemRaw.match(linkRegex)
    const descriptionMatch = itemRaw.match(descriptionRegex)
    const pubDateMatch = itemRaw.match(pubDateRegex)

    const title = normalizeText(titleMatch?.[1] ?? titleMatch?.[2] ?? '')
    const sourceUrl = normalizeText(linkMatch?.[1] ?? '')
    const summary = normalizeText(
      descriptionMatch?.[1] ?? descriptionMatch?.[2] ?? '',
    )

    if (!title || !sourceUrl) {
      continue
    }

    events.push({
      title,
      sourceUrl,
      summary,
      category: defaultCategory,
      startAt: toIsoDateFromRss(pubDateMatch?.[1]?.trim() ?? null),
    })
  }

  return events
}

async function fetchNewsRss(query: string, category: string, locale: string) {
  const parts = locale.split('-').filter(Boolean)
  const language = (parts[0] || 'en').toLowerCase()
  const region = (parts[1] || 'US').toUpperCase()
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${encodeURIComponent(
    `${language}-${region}`,
  )}&gl=${encodeURIComponent(region)}&ceid=${encodeURIComponent(
    `${region}:${language}`,
  )}`

  const xml = await $fetch<string>(url, { responseType: 'text' })

  return parseRss(xml, category)
}

function dedupeEvents(events: EventItem[]) {
  const seen = new Set<string>()
  const unique: EventItem[] = []

  for (const event of events) {
    const key = `${event.title.toLowerCase()}::${event.sourceUrl}`

    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    unique.push(event)
  }

  return unique
}

export default defineEventHandler(
  async (event): Promise<LocalContextPayload> => {
    const query = getQuery(event)

    const lat = parseCoordinate(query.lat, 'lat')
    const lon = parseCoordinate(query.lon, 'lon')

    if (lat < -90 || lat > 90) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid lat range' })
    }

    if (lon < -180 || lon > 180) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid lon range' })
    }

    const roundedLat = Number(lat.toFixed(3))
    const roundedLon = Number(lon.toFixed(3))

    const locale =
      typeof query.locale === 'string' && query.locale.trim()
        ? query.locale.trim()
        : 'en-US'

    const cacheKey = publicCacheKey('home/local-context', {
      lat: roundedLat,
      lon: roundedLon,
      locale,
    })
    const cachedPayload = await getCached<LocalContextPayload>(cacheKey)

    if (cachedPayload) {
      return cachedPayload
    }

    const [geoResult, weatherResult] = await Promise.allSettled([
      $fetch<ReverseGeocodingResponse>(
        'https://geocoding-api.open-meteo.com/v1/reverse',
        {
          query: {
            latitude: lat,
            longitude: lon,
            language: locale.slice(0, 2),
            count: 1,
          },
        },
      ),
      $fetch<WeatherResponse>('https://api.open-meteo.com/v1/forecast', {
        query: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,weather_code',
          timezone: 'auto',
        },
      }),
    ])

    const geo =
      geoResult.status === 'fulfilled' ? geoResult.value : { results: [] }
    const weather =
      weatherResult.status === 'fulfilled' ? weatherResult.value : {}

    const firstLocation = geo.results?.[0]
    const city = firstLocation?.name?.trim() || 'Unknown city'
    const region = firstLocation?.admin1?.trim() || ''
    const country = firstLocation?.country?.trim() || 'Unknown country'
    const countryCode = firstLocation?.country_code?.trim() || 'US'

    const localEventsQuery = `${city} ${country} events OR concert OR festival OR conference`
    const majorEventsQuery = `major world events war OR earthquake OR major sports match OR election`

    const [localEventsResult, majorEventsResult] = await Promise.allSettled([
      fetchNewsRss(localEventsQuery, 'local', locale),
      fetchNewsRss(majorEventsQuery, 'major', locale),
    ])

    const localEventsRaw =
      localEventsResult.status === 'fulfilled' ? localEventsResult.value : []
    const majorEventsRaw =
      majorEventsResult.status === 'fulfilled' ? majorEventsResult.value : []

    const localEvents = dedupeEvents(localEventsRaw).slice(0, 6)
    const majorCandidates = dedupeEvents(majorEventsRaw).slice(0, 12)

    let majorEvents: LocalContextPayload['majorEvents'] = []

    try {
      const ranked = await rankEventsWithAiGateway(event, majorCandidates)
      majorEvents = ranked.slice(0, 6)
    } catch (error) {
      console.error('AI Gateway ranking failed for local context', {
        message: error instanceof Error ? error.message : 'unknown error',
      })
    }

    if (!majorEvents.length) {
      majorEvents = majorCandidates.slice(0, 6).map((eventItem) => ({
        ...eventItem,
        impact: 'medium',
        zone: 'Global',
      }))
    }

    const weatherCode = weather.current?.weather_code

    const payload: LocalContextPayload = {
      location: {
        city,
        region,
        country,
        countryCode,
      },
      weather: {
        temperatureC:
          typeof weather.current?.temperature_2m === 'number'
            ? weather.current.temperature_2m
            : null,
        condition:
          typeof weatherCode === 'number'
            ? weatherCodeMap[weatherCode] || 'Unknown conditions'
            : 'Unknown conditions',
        weatherCode: typeof weatherCode === 'number' ? weatherCode : null,
        observedAt: weather.current?.time || new Date().toISOString(),
      },
      events: localEvents,
      majorEvents,
    }

    await setCached(cacheKey, payload, 1800)

    return payload
  },
)
