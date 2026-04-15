type PayOrderBody = {
  orderId?: string
  paymentMethod?: 'stripe' | 'paypal'
}

export default defineEventHandler(async (event) => {
  const body = await readBody<PayOrderBody>(event)

  if (!body.orderId || !body.paymentMethod) {
    throw createError({
      statusCode: 400,
      statusMessage: 'invalid payment payload',
    })
  }

  return {
    orderId: body.orderId,
    paymentMethod: body.paymentMethod,
    status: 'success',
    message: 'payment accepted',
  }
})
