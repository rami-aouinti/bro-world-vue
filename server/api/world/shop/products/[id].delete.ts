import { getShopCatalog, saveShopCatalog } from '~~/server/utils/shopCatalog'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing product id' })
  }

  const catalog = await getShopCatalog()
  const index = catalog.products.findIndex((product) => product.id === id)

  if (index < 0) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  catalog.products.splice(index, 1)
  await saveShopCatalog(catalog)

  return { success: true }
})
