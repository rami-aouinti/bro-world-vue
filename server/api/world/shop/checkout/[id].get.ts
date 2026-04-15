import { assertNonEmptyString, getCheckoutStore } from '~~/server/utils/shopCheckout'

export default defineEventHandler(async (event) => {
  const checkoutId = assertNonEmptyString(getRouterParam(event, 'id'), 'checkoutId')
  const store = await getCheckoutStore()
  const session = store.sessions[checkoutId]

  if (!session) {
    throw createError({ statusCode: 404, statusMessage: 'checkout session not found' })
  }

  return session
})
