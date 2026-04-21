import { createHmac } from 'node:crypto'

function toBase64Url(input: string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

export function signMercureSubscriberJwt(secret: string, topics: string[], expiresInSeconds = 300) {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    mercure: {
      subscribe: topics,
    },
    iat: now,
    exp: now + expiresInSeconds,
  }

  const encodedHeader = toBase64Url(JSON.stringify(header))
  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const message = `${encodedHeader}.${encodedPayload}`
  const signature = createHmac('sha256', secret)
    .update(message)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

  return `${message}.${signature}`
}
