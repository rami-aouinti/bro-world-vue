const MIN_LEVEL = 20
const MAX_LEVEL = 100
const STEP_COUNT = 5

export function normalizeLevel(level: unknown, minimum = MIN_LEVEL): number {
  if (level == null || level === '') return minimum
  const numeric = Number(level)
  if (Number.isNaN(numeric)) return minimum
  return Math.min(MAX_LEVEL, Math.max(0, numeric))
}

export function levelToSteps(level: unknown, count = STEP_COUNT): number {
  return Math.round((normalizeLevel(level) / MAX_LEVEL) * count)
}
