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
}

const createSportImage = (label: string, slug: SportSlug): string => {
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 630'>
      <defs>
        <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0%' stop-color='#3f51b5' />
          <stop offset='100%' stop-color='#00bcd4' />
        </linearGradient>
      </defs>
      <rect width='1200' height='630' fill='url(#g)' />
      <text x='72' y='340' fill='white' font-size='98' font-family='Inter,Arial,sans-serif' font-weight='700'>${label}</text>
      <text x='72' y='430' fill='rgba(255,255,255,0.8)' font-size='42' font-family='Inter,Arial,sans-serif'>/${slug}</text>
    </svg>
  `.trim()

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const makeSport = (label: string, slug: SportSlug): SportDefinition => ({
  label,
  slug,
  image: createSportImage(label, slug),
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
