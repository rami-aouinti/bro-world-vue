type UnknownRecord = Record<string, unknown>

export type NormalizedHttpError = {
  statusCode: number | null
  message: string
  isUnauthorized: boolean
  raw: unknown
}

function toRecord(value: unknown): UnknownRecord {
  return typeof value === 'object' && value !== null
    ? (value as UnknownRecord)
    : {}
}

function pickStatusCode(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

function pickMessage(source: UnknownRecord): string {
  const directMessage = source.message
  if (typeof directMessage === 'string' && directMessage.trim()) {
    return directMessage
  }

  const statusMessage = source.statusMessage
  if (typeof statusMessage === 'string' && statusMessage.trim()) {
    return statusMessage
  }

  const dataMessage = toRecord(source.data).message
  if (typeof dataMessage === 'string' && dataMessage.trim()) {
    return dataMessage
  }

  return 'HTTP request failed'
}

export function normalizeHttpError(err: unknown): NormalizedHttpError {
  const source = toRecord(err)
  const data = toRecord(source.data)
  const response = toRecord(source.response)

  const statusCode =
    pickStatusCode(source.statusCode) ??
    pickStatusCode(data.statusCode) ??
    pickStatusCode(response.status)

  return {
    statusCode,
    message: pickMessage(source),
    isUnauthorized: statusCode === 401,
    raw: err,
  }
}
