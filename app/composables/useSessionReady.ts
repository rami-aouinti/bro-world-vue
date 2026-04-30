let sessionReadyPromise: Promise<void> | null = null
let sessionInitialized = false

function createSessionError(statusMessage: string) {
  return createError({
    statusCode: 401,
    statusMessage,
    data: {
      code: 'SESSION_NOT_READY',
    },
  })
}

/**
 * Ensures the client session has been fetched once before any private request.
 */
export async function awaitSessionReady(options?: { forceRefresh?: boolean }) {
  if (import.meta.server) {
    return
  }

  const forceRefresh = options?.forceRefresh === true

  if (forceRefresh) {
    sessionInitialized = false
    sessionReadyPromise = null
  }

  if (sessionInitialized) {
    return
  }

  if (!sessionReadyPromise) {
    const { fetch } = useUserSession()

    sessionReadyPromise = (async () => {
      try {
        await fetch()
        sessionInitialized = true
      } catch {
        throw createSessionError('Unable to initialize user session')
      } finally {
        sessionReadyPromise = null
      }
    })()
  }

  await sessionReadyPromise
}

export function createMissingSessionTokenError() {
  return createSessionError('Missing authentication token')
}
