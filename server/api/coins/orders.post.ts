type CreateOrderBody = {
  packageId?: string
  coins?: number
  currency?: 'USD' | 'EUR'
  amount?: number
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateOrderBody>(event)

  if (
    !body.packageId
    || typeof body.coins !== 'number'
    || typeof body.amount !== 'number'
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'invalid order payload',
    })
  }

  const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  return {
    orderId,
    packageId: body.packageId,
    coins: body.coins,
    amount: body.amount,
    currency: body.currency || 'USD',
    status: 'awaiting_payment',
  }
})
