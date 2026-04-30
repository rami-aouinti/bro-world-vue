export type StoreTelemetryModule = 'crm' | 'jobs' | 'learning' | 'shop'

export type StoreTelemetryEntry = {
  cacheHits: number
  cacheMisses: number
  apiErrors: number
  fetchCount: number
  totalFetchDurationMs: number
}

export type StoreTelemetrySnapshot = Record<
  StoreTelemetryModule,
  StoreTelemetryEntry
>

function createEntry(): StoreTelemetryEntry {
  return {
    cacheHits: 0,
    cacheMisses: 0,
    apiErrors: 0,
    fetchCount: 0,
    totalFetchDurationMs: 0,
  }
}

const telemetryState: StoreTelemetrySnapshot = {
  crm: createEntry(),
  jobs: createEntry(),
  learning: createEntry(),
  shop: createEntry(),
}

export function recordStoreCacheEvent(
  module: StoreTelemetryModule,
  hit: boolean,
) {
  if (hit) {
    telemetryState[module].cacheHits += 1
    return
  }

  telemetryState[module].cacheMisses += 1
}

export function recordStoreApiError(module: StoreTelemetryModule) {
  telemetryState[module].apiErrors += 1
}

export async function runTrackedStoreFetch<T>(
  module: StoreTelemetryModule,
  handler: () => Promise<T>,
): Promise<T> {
  const startedAt = Date.now()
  try {
    return await handler()
  } catch (error) {
    recordStoreApiError(module)
    throw error
  } finally {
    telemetryState[module].fetchCount += 1
    telemetryState[module].totalFetchDurationMs += Math.max(
      0,
      Date.now() - startedAt,
    )
  }
}

export function getStoreTelemetrySnapshot(): StoreTelemetrySnapshot {
  return {
    crm: { ...telemetryState.crm },
    jobs: { ...telemetryState.jobs },
    learning: { ...telemetryState.learning },
    shop: { ...telemetryState.shop },
  }
}

export function getStoreCacheHitRate(module: StoreTelemetryModule) {
  const entry = telemetryState[module]
  const total = entry.cacheHits + entry.cacheMisses

  if (!total) {
    return 0
  }

  return entry.cacheHits / total
}

export function resetStoreTelemetry() {
  for (const module of Object.keys(telemetryState) as StoreTelemetryModule[]) {
    telemetryState[module] = createEntry()
  }
}
