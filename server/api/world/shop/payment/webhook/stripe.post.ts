import crypto from 'node:crypto'
import { getHeader, readRawBody } from 'h3'
import {
  getCheckoutStore,
  saveCheckoutStore,
} from '~~/server/utils/shopCheckout'

type StripeWebhookEvent = {
  type: string
  data: {
    object: {
      id: string
      status?: string
      metadata?: Record<string, string>
      last_payment_error?: {
        code?: string
        message?: string
      }
    }
  }
}

function verifySignature(
  payload: string,
  signatureHeader: string,
  secret: string,
) {
  const entries = signatureHeader.split(',').map((item) => item.trim())
  const timestamp = entries.find((part) => part.startsWith('t='))?.slice(2)
  const signature = entries.find((part) => part.startsWith('v1='))?.slice(3)

  if (!timestamp || !signature) {
    throw createError({
      statusCode: 400,
      statusMessage: 'invalid stripe signature header',
    })
  }

  const signedPayload = `${timestamp}.${payload}`
  const digest = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex')

  if (digest !== signature) {
    throw createError({
      statusCode: 400,
      statusMessage: 'stripe signature verification failed',
    })
  }
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const endpointSecret =
    runtimeConfig.stripe?.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET

  if (!endpointSecret) {
    throw createError({
      statusCode: 503,
      statusMessage: 'STRIPE_WEBHOOK_SECRET is not configured',
    })
  }

  const signature = getHeader(event, 'stripe-signature')
  if (!signature) {
    throw createError({
      statusCode: 400,
      statusMessage: 'missing stripe-signature header',
    })
  }

  const rawBody = await readRawBody(event, false)
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'empty webhook body' })
  }

  verifySignature(rawBody, signature, endpointSecret)

  const stripeEvent = JSON.parse(rawBody) as StripeWebhookEvent
  const paymentIntent = stripeEvent.data.object
  const checkoutId = paymentIntent.metadata?.checkout_id

  if (!checkoutId) {
    return { received: true, ignored: true }
  }

  const store = await getCheckoutStore()
  const session = store.sessions[checkoutId]

  if (!session) {
    return { received: true, ignored: true }
  }

  const attempt = session.attempts.find(
    (item) => item.providerPaymentId === paymentIntent.id,
  )

  if (stripeEvent.type === 'payment_intent.succeeded') {
    session.status = 'paid'
    session.lastError = undefined
    if (attempt) attempt.status = 'succeeded'
  } else if (stripeEvent.type === 'payment_intent.payment_failed') {
    session.status = 'failed'
    session.lastError =
      paymentIntent.last_payment_error?.message || 'payment_failed'
    if (attempt) {
      attempt.status = 'failed'
      attempt.reason =
        paymentIntent.last_payment_error?.code || 'payment_failed'
    }
  } else if (stripeEvent.type === 'payment_intent.processing') {
    session.status = 'processing'
  }

  session.updatedAt = new Date().toISOString()
  await saveCheckoutStore(store)

  return { received: true }
})
