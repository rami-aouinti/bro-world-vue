import type { PaymentProvider } from '~~/server/utils/shopCheckout'
import {
  assertIdempotencyKey,
  assertNonEmptyString,
  assertStepTransition,
  generateId,
  getCheckoutStore,
  saveCheckoutStore,
} from '~~/server/utils/shopCheckout'

type Body = {
  checkoutId?: string
  idempotencyKey?: string
  provider?: PaymentProvider
}

type StripeIntent = {
  id: string
  status: string
  client_secret?: string
}

async function createStripePaymentIntent(amountInSmallestUnit: number, currency: string, idempotencyKey: string, metadata: Record<string, string>) {
  const runtimeConfig = useRuntimeConfig()
  const secretKey = runtimeConfig.stripe?.secretKey || process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Stripe secret key is not configured (STRIPE_SECRET_KEY)',
    })
  }

  const payload = new URLSearchParams()
  payload.set('amount', String(amountInSmallestUnit))
  payload.set('currency', currency.toLowerCase())
  payload.set('automatic_payment_methods[enabled]', 'true')

  for (const [key, value] of Object.entries(metadata)) {
    payload.set(`metadata[${key}]`, value)
  }

  const response = await $fetch<StripeIntent>('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secretKey}`,
      'content-type': 'application/x-www-form-urlencoded',
      'idempotency-key': idempotencyKey,
    },
    body: payload.toString(),
    timeout: 15000,
  })

  return response
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  const checkoutId = assertNonEmptyString(body.checkoutId, 'checkoutId')
  const idempotencyKey = assertIdempotencyKey(body.idempotencyKey)
  const provider = body.provider || 'stripe'

  if (provider !== 'stripe') {
    throw createError({ statusCode: 422, statusMessage: 'Only stripe provider is currently implemented' })
  }

  const store = await getCheckoutStore()
  const session = store.sessions[checkoutId]

  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'checkout session not found' })
  }

  const previousCheckout = store.idempotency[idempotencyKey]
  if (previousCheckout === checkoutId) {
    const previous = session.attempts.find(attempt => attempt.idempotencyKey === idempotencyKey)
    if (previous)
      return { checkout: session, attempt: previous }
    return { checkout: session, attempt: null }
  }

  if (previousCheckout && previousCheckout !== checkoutId) {
    throw createError({ statusCode: 409, statusMessage: 'idempotencyKey already used by another checkout' })
  }

  assertStepTransition(session.step, 'payment')

  if (!session.selectedShippingId) {
    throw createError({ statusCode: 422, statusMessage: 'shipping must be selected before payment' })
  }

  const amountInCents = Math.round(session.totalAmount * 100)

  const attemptId = generateId('pay')

  try {
    const stripeIntent = await createStripePaymentIntent(
      amountInCents,
      session.currency,
      idempotencyKey,
      {
        checkout_id: checkoutId,
        payment_attempt_id: attemptId,
      },
    )

    const createdAt = new Date().toISOString()
    const attempt = {
      id: attemptId,
      createdAt,
      idempotencyKey,
      provider,
      status: 'pending' as const,
      providerPaymentId: stripeIntent.id,
      clientSecret: stripeIntent.client_secret || '',
    }

    session.attempts.unshift(attempt)
    session.provider = provider
    session.providerPaymentId = stripeIntent.id
    session.status = 'payment_pending'
    session.step = 'payment'
    session.lastError = undefined
    session.updatedAt = createdAt

    store.idempotency[idempotencyKey] = checkoutId
    await saveCheckoutStore(store)

    return { checkout: session, attempt }
  }
  catch (error: any) {
    const statusCode = typeof error?.statusCode === 'number' ? error.statusCode : 502
    const reason = typeof error?.statusMessage === 'string' ? error.statusMessage : 'provider_error'

    session.status = 'failed'
    session.lastError = reason
    session.attempts.unshift({
      id: attemptId,
      createdAt: new Date().toISOString(),
      idempotencyKey,
      provider,
      status: 'failed',
      reason,
    })
    session.updatedAt = new Date().toISOString()
    await saveCheckoutStore(store)

    throw createError({ statusCode, statusMessage: reason })
  }
})
