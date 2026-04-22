type MercureHandlers = {
  onMessage?: (data: unknown, event: MessageEvent<string>) => void
  onOpen?: (event: Event) => void
  onError?: (event: Event) => void
}

type MercureSubscribeOptions = {
  withCredentials?: boolean
  authorizationToken?: string
  eventSourceFactory?: (
    url: string,
    init: EventSourceInit & { headers?: Record<string, string> },
  ) => EventSource
}

export function useMercure() {
  const runtimeConfig = useRuntimeConfig()

  function createUrl(topics: string[]) {
    const baseUrl = String(runtimeConfig.public.mercurePublicUrl || '').trim()
    if (!baseUrl) return ''

    const url = new URL(baseUrl)

    topics
      .map((topic) => String(topic || '').trim())
      .filter(Boolean)
      .forEach((topic) => {
        url.searchParams.append('topic', topic)
      })

    return url.toString()
  }

  function subscribe(
    topics: string[],
    handlers?: MercureHandlers,
    options?: MercureSubscribeOptions,
  ) {
    if (!import.meta.client) return null

    const url = createUrl(topics)
    if (!url) return null

    const parsedUrl = new URL(url)
    const configuredWithCredentials = runtimeConfig.public.mercureWithCredentials === true
    const isSameOriginHub = parsedUrl.origin === window.location.origin

    const authorizationToken = String(
      options?.authorizationToken || runtimeConfig.public.mercureSubscriberJwt || '',
    ).trim()

    const resolvedWithCredentials = options?.withCredentials
      ?? (authorizationToken
        ? false
        : isSameOriginHub && configuredWithCredentials)

    const init: EventSourceInit & { headers?: Record<string, string> } = {
      withCredentials: resolvedWithCredentials,
    }

    if (authorizationToken) {
      init.headers = {
        Authorization: `Bearer ${authorizationToken}`,
      }
    }

    const polyfillConstructor = (globalThis as typeof globalThis & {
      EventSourcePolyfill?: new (
        url: string,
        init: EventSourceInit & { headers?: Record<string, string> },
      ) => EventSource
    }).EventSourcePolyfill

    const eventSource = options?.eventSourceFactory
      ? options.eventSourceFactory(url, init)
      : init.headers && polyfillConstructor
        ? new polyfillConstructor(url, init)
      : new EventSource(url, { withCredentials: init.withCredentials })

    eventSource.onopen = (event) => {
      handlers?.onOpen?.(event)
    }

    eventSource.onmessage = (event: MessageEvent<string>) => {
      const raw = event.data?.trim()
      if (!raw) return

      try {
        handlers?.onMessage?.(JSON.parse(raw), event)
      } catch {
        handlers?.onMessage?.(raw, event)
      }
    }

    eventSource.onerror = (event) => {
      handlers?.onError?.(event)
    }

    return eventSource
  }

  return {
    createUrl,
    subscribe,
  }
}
