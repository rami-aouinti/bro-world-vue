import { getShopCatalog } from '~~/server/utils/shopCatalog'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const catalog = await getShopCatalog()

  const product = catalog.products.find((item) => item.id === id)
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  return { data: product }
})
