import type { H3Event } from 'h3'
import { callPrivateApi } from './privateApi'

type ProxyMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type ProxyQuery = Record<string, string | number | boolean | undefined>

type ProxyParams = Record<string, string>

type CreateProxyHandlerOptions = {
  method: ProxyMethod
  endpointTemplate: string
  resolveParams?: (event: H3Event) => ProxyParams
  resolveQuery?: (event: H3Event) => ProxyQuery
}

const METHODS_WITH_BODY: ProxyMethod[] = ['POST', 'PUT', 'PATCH']

function resolveEndpoint(template: string, params: ProxyParams) {
  return template.replace(/:([A-Za-z0-9_]+)/g, (_match, key: string) => {
    const value = params[key]

    if (!value) {
      throw createError({
        statusCode: 500,
        statusMessage: `Missing endpoint param: ${key}`,
      })
    }

    return encodeURIComponent(value)
  })
}

export function createProxyHandler(options: CreateProxyHandlerOptions) {
  const { method, endpointTemplate, resolveParams, resolveQuery } = options

  return defineEventHandler(async (event): Promise<unknown> => {
    const params = resolveParams?.(event) ?? {}
    const endpoint = resolveEndpoint(endpointTemplate, params)
    const requestOptions: {
      method: ProxyMethod
      body?: BodyInit | Record<string, unknown> | null
      query?: ProxyQuery
    } = { method }

    if (METHODS_WITH_BODY.includes(method)) {
      requestOptions.body = await readBody(event)
    }

    if (resolveQuery) {
      requestOptions.query = resolveQuery(event)
    }

    return callPrivateApi(event, endpoint, requestOptions)
  })
}
