export const WORDS_FR = {
  5: [
    'arbre',
    'fleur',
    'plage',
    'nuage',
    'route',
    'livre',
    'table',
    'porte',
    'chien',
    'pomme',
    'avion',
    'salon',
    'cadre',
    'danse',
    'sucre',
  ],
  6: [
    'orange',
    'bureau',
    'banane',
    'secret',
    'voyage',
    'nuages',
    'puzzle',
    'soleil',
    'gagner',
    'france',
    'minute',
    'valise',
    'tomate',
    'charge',
    'trouve',
  ],
} as const

export type HiddenWordLength = keyof typeof WORDS_FR

const normalizeDateKey = (date: Date): string => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const hashSeed = (seed: string): number => {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  }

  return hash
}

export const getDailyHiddenWord = (
  length: HiddenWordLength,
  date: Date = new Date(),
): string => {
  const words = WORDS_FR[length]
  const seed = `${normalizeDateKey(date)}-${length}`
  const index = hashSeed(seed) % words.length

  return words[index]
}
