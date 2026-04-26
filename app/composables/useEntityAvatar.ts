const AVATAR_COLORS = [
  'red-darken-1',
  'pink-darken-1',
  'purple-darken-1',
  'indigo-darken-1',
  'blue-darken-1',
  'cyan-darken-1',
  'teal-darken-1',
  'green-darken-1',
  'lime-darken-2',
  'orange-darken-1',
]

export function useEntityAvatar(label: string | null | undefined) {
  const normalized = String(label ?? '').trim()
  const fallback = normalized || 'N/A'

  const initials =
    fallback
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'NA'

  let hash = 0
  for (let index = 0; index < fallback.length; index += 1) {
    hash = (hash << 5) - hash + fallback.charCodeAt(index)
    hash |= 0
  }

  const color = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]

  return {
    initials,
    color,
  }
}
