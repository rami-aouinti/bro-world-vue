type CheckoutBody = {
  packageId?: string
  paymentMethod?: 'stripe' | 'paypal'
  coins?: number
  currency?: 'USD' | 'EUR'
  amount?: number
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CheckoutBody>(event)

  if (
    !body.packageId ||
    !body.paymentMethod ||
    typeof body.coins !== 'number' ||
    typeof body.amount !== 'number'
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'invalid checkout payload',
    })
  }

  const isSuccess = body.amount > 0 && body.coins > 0

  return {
    status: isSuccess ? 'success' : 'failed',
    packageId: body.packageId,
    paymentMethod: body.paymentMethod,
    currency: body.currency || 'USD',
    coins: body.coins,
    amount: body.amount,
    message: isSuccess ? 'checkout accepted' : 'checkout refused',
  }
})
