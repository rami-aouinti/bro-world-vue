import type { Address } from '~~/server/utils/shopCheckout'
import {
  assertIdempotencyKey,
  assertNonEmptyString,
  assertStepTransition,
  computeShippingOptions,
  getCheckoutStore,
  saveCheckoutStore,
} from '~~/server/utils/shopCheckout'

type Body = {
  checkoutId?: string
  idempotencyKey?: string
  address?: Address
}

const validateAddress = (address: unknown): Address => {
  if (!address || typeof address !== 'object' || Array.isArray(address)) {
    throw createError({ statusCode: 422, statusMessage: 'address is required' })
  }

  const payload = address as Address

  return {
    fullName: assertNonEmptyString(payload.fullName, 'address.fullName'),
    line1: assertNonEmptyString(payload.line1, 'address.line1'),
    line2: typeof payload.line2 === 'string' ? payload.line2.trim() : '',
    city: assertNonEmptyString(payload.city, 'address.city'),
    state: assertNonEmptyString(payload.state, 'address.state'),
    postalCode: assertNonEmptyString(payload.postalCode, 'address.postalCode'),
    country: assertNonEmptyString(payload.country, 'address.country').toUpperCase(),
    phone: typeof payload.phone === 'string' ? payload.phone.trim() : '',
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  const checkoutId = assertNonEmptyString(body.checkoutId, 'checkoutId')
  const idempotencyKey = assertIdempotencyKey(body.idempotencyKey)
  const address = validateAddress(body.address)

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

  assertStepTransition(session.step, 'address')

  session.address = address
  session.shippingOptions = computeShippingOptions(address)
  session.step = 'address'
  session.updatedAt = new Date().toISOString()

  store.idempotency[idempotencyKey] = checkoutId
  await saveCheckoutStore(store)

  return session
})
