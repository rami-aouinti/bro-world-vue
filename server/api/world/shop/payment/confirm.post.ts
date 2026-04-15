import {
  assertIdempotencyKey,
  assertNonEmptyString,
  assertStepTransition,
  getCheckoutStore,
  saveCheckoutStore,
} from '~~/server/utils/shopCheckout'

type Body = {
  checkoutId?: string
  idempotencyKey?: string
  providerPaymentId?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  const checkoutId = assertNonEmptyString(body.checkoutId, 'checkoutId')
  const idempotencyKey = assertIdempotencyKey(body.idempotencyKey)
  const providerPaymentId = assertNonEmptyString(body.providerPaymentId, 'providerPaymentId')

  const store = await getCheckoutStore()
  const session = store.sessions[checkoutId]

  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'checkout session not found' })
  }

  const existingByIdempotency = store.idempotency[idempotencyKey]
  if (existingByIdempotency === checkoutId) {
    return session
  }

  if (existingByIdempotency && existingByIdempotency !== checkoutId) {
    throw createError({ statusCode: 409, statusMessage: 'idempotencyKey already used by another checkout' })
  }

  assertStepTransition(session.step, 'confirmation')

  if (session.providerPaymentId !== providerPaymentId) {
    throw createError({ statusCode: 422, statusMessage: 'providerPaymentId does not match checkout session' })
  }

  const lastAttempt = session.attempts.find(attempt => attempt.providerPaymentId === providerPaymentId)
  if (!lastAttempt) {
    throw createError({ statusCode: 404, statusMessage: 'payment attempt not found for checkout' })
  }

  if (session.status !== 'paid') {
    throw createError({
      statusCode: 409,
      statusMessage: 'payment not confirmed by provider webhook yet',
    })
  }

  lastAttempt.status = 'succeeded'
  session.step = 'confirmation'
  session.updatedAt = new Date().toISOString()

  store.idempotency[idempotencyKey] = checkoutId
  await saveCheckoutStore(store)

  return session
})
