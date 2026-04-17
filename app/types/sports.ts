export const SPORT_SLUGS = [
  'afl',
  'baseball',
  'basketball',
  'football',
  'formula-1',
  'handball',
  'hockey',
  'mma',
  'nba',
  'nfl',
  'rugby',
  'volleyball',
] as const

export type SportSlug = (typeof SPORT_SLUGS)[number]

export interface SportDefinition {
  label: string
  slug: SportSlug
  image: string
  apiBaseUrl: string
}

type SportVisual = {
  icon: string
  colors: readonly [string, string]
}

const SPORT_VISUALS: Readonly<Record<SportSlug, SportVisual>> = {
  afl: { icon: '🏉', colors: ['#ff8a00', '#ffc400'] },
  baseball: { icon: '⚾', colors: ['#ef5350', '#b71c1c'] },
  basketball: { icon: '🏀', colors: ['#ff7a18', '#ff3d00'] },
  football: { icon: '⚽', colors: ['#2e7d32', '#00c853'] },
  'formula-1': { icon: '🏎️', colors: ['#263238', '#c62828'] },
  handball: { icon: '🤾', colors: ['#5e35b1', '#7c4dff'] },
  hockey: { icon: '🏒', colors: ['#1565c0', '#00b0ff'] },
  mma: { icon: '🥊', colors: ['#4e342e', '#d84315'] },
  nba: { icon: '🏀', colors: ['#1e3a8a', '#dc2626'] },
  nfl: { icon: '🏈', colors: ['#0f172a', '#2563eb'] },
  rugby: { icon: '🏉', colors: ['#00695c', '#00acc1'] },
  volleyball: { icon: '🏐', colors: ['#ffb300', '#ff6f00'] },
}

const SPORT_ENDPOINTS: Readonly<Record<SportSlug, string>> = {
  afl: 'https://v1.afl.api-sports.io',
  baseball: 'https://v1.baseball.api-sports.io',
  basketball: 'https://v1.basketball.api-sports.io',
  football: 'https://v3.football.api-sports.io',
  'formula-1': 'https://v1.formula-1.api-sports.io',
  handball: 'https://v1.handball.api-sports.io',
  hockey: 'https://v1.hockey.api-sports.io',
  mma: 'https://v1.mma.api-sports.io',
  nba: 'https://v1.nba.api-sports.io',
  nfl: 'https://v1.american-football.api-sports.io',
  rugby: 'https://v1.rugby.api-sports.io',
  volleyball: 'https://v1.volleyball.api-sports.io',
}

const createSportImage = (label: string, slug: SportSlug): string => {
  const visual = SPORT_VISUALS[slug]
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 630'>
      <defs>
        <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0%' stop-color='${visual.colors[0]}' />
          <stop offset='100%' stop-color='${visual.colors[1]}' />
        </linearGradient>
      </defs>
      <rect width='1200' height='630' fill='url(#g)' />
      <text x='70' y='240' fill='rgba(255,255,255,0.85)' font-size='130'>${visual.icon}</text>
      <text x='70' y='360' fill='white' font-size='90' font-family='Inter,Arial,sans-serif' font-weight='700'>${label}</text>
      <text x='70' y='440' fill='rgba(255,255,255,0.82)' font-size='38' font-family='Inter,Arial,sans-serif'>/${slug}</text>
    </svg>
  `.trim()

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const makeSport = (label: string, slug: SportSlug): SportDefinition => ({
  label,
  slug,
  image: createSportImage(label, slug),
  apiBaseUrl: SPORT_ENDPOINTS[slug],
})

export const SPORTS: readonly SportDefinition[] = [
  makeSport('AFL', 'afl'),
  makeSport('Baseball', 'baseball'),
  makeSport('Basketball', 'basketball'),
  makeSport('Football', 'football'),
  makeSport('Formula-1', 'formula-1'),
  makeSport('Handball', 'handball'),
  makeSport('Hockey', 'hockey'),
  makeSport('MMA', 'mma'),
  makeSport('NBA', 'nba'),
  makeSport('NFL', 'nfl'),
  makeSport('Rugby', 'rugby'),
  makeSport('Volleyball', 'volleyball'),
]

export const SPORTS_BY_SLUG: Readonly<Record<SportSlug, SportDefinition>> =
  Object.fromEntries(SPORTS.map((sport) => [sport.slug, sport])) as Record<
    SportSlug,
    SportDefinition
  >
