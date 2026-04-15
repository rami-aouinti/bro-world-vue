import type { ShopProduct } from '~~/server/types/api/shop'
import {
  getShopCatalog,
  saveShopCatalog,
  validateProductInput,
} from '~~/server/utils/shopCatalog'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing product id' })
  }

  const payload = await readBody<Partial<ShopProduct>>(event)
  const catalog = await getShopCatalog()
  const index = catalog.products.findIndex((product) => product.id === id)

  if (index < 0) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  const updatedProduct = {
    ...catalog.products[index],
    ...payload,
    id,
    updatedAt: new Date().toISOString(),
  }

  validateProductInput(updatedProduct, catalog, id)

  catalog.products[index] = updatedProduct
  await saveShopCatalog(catalog)

  return { data: updatedProduct }
})
