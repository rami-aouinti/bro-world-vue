import type { CartLine, CheckoutSession } from '~~/server/utils/shopCheckout'
import {
  assertNonEmptyString,
  assertPositiveNumber,
  computeSubtotal,
  generateId,
  getCheckoutStore,
  saveCheckoutStore,
} from '~~/server/utils/shopCheckout'

type Body = {
  currency?: string
  cart?: CartLine[]
}

const validateCart = (cart: unknown) => {
  if (!Array.isArray(cart) || cart.length === 0) {
    throw createError({
      statusCode: 422,
      statusMessage: 'cart must contain at least one line',
    })
  }

  return cart.map((line, index) => {
    if (!line || typeof line !== 'object') {
      throw createError({
        statusCode: 422,
        statusMessage: `cart[${index}] is invalid`,
      })
    }

    const payload = line as CartLine
    return {
      productId: assertNonEmptyString(
        payload.productId,
        `cart[${index}].productId`,
      ),
      name: assertNonEmptyString(payload.name, `cart[${index}].name`),
      unitPrice: assertPositiveNumber(
        payload.unitPrice,
        `cart[${index}].unitPrice`,
      ),
      quantity: assertPositiveNumber(
        payload.quantity,
        `cart[${index}].quantity`,
      ),
    }
  })
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event)
  const cart = validateCart(body.cart)
  const currency =
    typeof body.currency === 'string' && body.currency.trim()
      ? body.currency.trim().toUpperCase()
      : 'USD'

  const store = await getCheckoutStore()
  const id = generateId('chk')
  const createdAt = new Date().toISOString()
  const subtotalAmount = computeSubtotal(cart)

  const session: CheckoutSession = {
    id,
    step: 'cart',
    status: 'draft',
    currency,
    cart,
    subtotalAmount,
    shippingAmount: 0,
    totalAmount: subtotalAmount,
    shippingOptions: [],
    attempts: [],
    createdAt,
    updatedAt: createdAt,
  }

  store.sessions[id] = session
  await saveCheckoutStore(store)

  return session
})
