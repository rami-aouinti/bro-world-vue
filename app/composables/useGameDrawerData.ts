const TOP_SCORES = [
  { name: 'NovaBlade', score: 12840, avatar: '/img/team-1.jpg' },
  { name: 'PixelQueen', score: 11720, avatar: '/img/team-2.jpg' },
  { name: 'ArcadeWolf', score: 10995, avatar: '/img/team-3.jpg' },
] as const

export function useGameDrawerData() {
  return {
    topScores: TOP_SCORES,
  }
}
