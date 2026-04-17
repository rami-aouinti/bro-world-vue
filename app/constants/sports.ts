export const BASKETBALL_PRIORITY_LEAGUE_IDS = [
  12, // NBA
  120, // EuroLeague
  117, // EuroCup
  2, // FIBA World Cup
] as const

export const BASKETBALL_PRIORITY_LEAGUE_NAMES = [
  'nba',
  'nationalbasketballassociation',
  'euroleague',
  'eurocup',
  'fiba',
  'championsleague',
] as const

const normalizeLeagueName = (name: string) => {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

export const getBasketballLeaguePriority = (league: { id: number; name: string }) => {
  const priorityLeagueIds: readonly number[] = BASKETBALL_PRIORITY_LEAGUE_IDS
  const idIndex = priorityLeagueIds.indexOf(league.id)

  if (idIndex >= 0) {
    return idIndex
  }

  const normalizedName = normalizeLeagueName(league.name)
  const nameIndex = BASKETBALL_PRIORITY_LEAGUE_NAMES.findIndex((token) =>
    normalizedName.includes(token),
  )

  if (nameIndex >= 0) {
    return nameIndex + BASKETBALL_PRIORITY_LEAGUE_IDS.length
  }

  return Number.POSITIVE_INFINITY
}
