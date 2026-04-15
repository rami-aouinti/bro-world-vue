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
  shippingOptionId?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  const checkoutId = assertNonEmptyString(body.checkoutId, 'checkoutId')
  const idempotencyKey = assertIdempotencyKey(body.idempotencyKey)
  const shippingOptionId = assertNonEmptyString(
    body.shippingOptionId,
    'shippingOptionId',
  )

  const store = await getCheckoutStore()
  const session = store.sessions[checkoutId]

  if (!session) {
    throw createError({
      statusCode: 404,
      statusMessage: 'checkout session not found',
    })
  }

  const existingByIdempotency = store.idempotency[idempotencyKey]
  if (existingByIdempotency === checkoutId) {
    return session
  }

  if (existingByIdempotency && existingByIdempotency !== checkoutId) {
    throw createError({
      statusCode: 409,
      statusMessage: 'idempotencyKey already used by another checkout',
    })
  }

  assertStepTransition(session.step, 'shipping')

  const selected = session.shippingOptions.find(
    (option) => option.id === shippingOptionId,
  )
  if (!selected) {
    throw createError({
      statusCode: 422,
      statusMessage: 'shipping option unavailable for this checkout',
    })
  }

  session.selectedShippingId = selected.id
  session.shippingAmount = selected.amount
  session.totalAmount = session.subtotalAmount + selected.amount
  session.step = 'shipping'
  session.updatedAt = new Date().toISOString()

  store.idempotency[idempotencyKey] = checkoutId
  await saveCheckoutStore(store)

  return session
})
