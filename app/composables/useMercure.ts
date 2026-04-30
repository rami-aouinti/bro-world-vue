type MercureHandlers = {
  onMessage?: (data: unknown, _event: MessageEvent<string>) => void
  onOpen?: (_event: Event) => void
  onError?: (_event: Event) => void
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
    const configuredWithCredentials =
      runtimeConfig.public.mercureWithCredentials === true
    const _isSameOriginHub = parsedUrl.origin === window.location.origin

    const authorizationToken = String(
      options?.authorizationToken ||
        runtimeConfig.public.mercureSubscriberJwt ||
        '',
    ).trim()

    const resolvedWithCredentials =
      options?.withCredentials ?? configuredWithCredentials

    const init: EventSourceInit & { headers?: Record<string, string> } = {
      withCredentials: resolvedWithCredentials,
    }

    if (authorizationToken) {
      init.headers = {
        Authorization: `Bearer ${authorizationToken}`,
      }
    }

    const polyfillConstructor = (
      globalThis as typeof globalThis & {
        EventSourcePolyfill?: new (
          url: string,
          init: EventSourceInit & { headers?: Record<string, string> },
        ) => EventSource
      }
    ).EventSourcePolyfill

    const _eventSource = options?.eventSourceFactory
      ? options.eventSourceFactory(url, init)
      : init.headers && polyfillConstructor
        ? new polyfillConstructor(url, init)
        : new EventSource(url, { withCredentials: init.withCredentials })

    _eventSource.onopen = (_event) => {
      handlers?.onOpen?.(_event)
    }

    _eventSource.onmessage = (_event: MessageEvent<string>) => {
      const raw = _event.data?.trim()

      if (!raw || raw === ':' || raw === '::') return

      try {
        const parsed = JSON.parse(raw)
        handlers?.onMessage?.(parsed, _event)
      } catch {
        console.warn('Non JSON Mercure message:', raw)
        handlers?.onMessage?.(raw, _event)
      }
    }

    _eventSource.onerror = (_event) => {
      handlers?.onError?.(_event)
    }

    return _eventSource
  }

  return {
    createUrl,
    subscribe,
  }
}
