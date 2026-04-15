import type { ShopProduct } from '~~/server/types/api/shop'
import {
  getShopCatalog,
  saveShopCatalog,
  validateProductInput,
} from '~~/server/utils/shopCatalog'

export default defineEventHandler(async (event) => {
  const payload = await readBody<Partial<ShopProduct>>(event)
  const catalog = await getShopCatalog()

  validateProductInput(payload, catalog)

  const now = new Date().toISOString()
  const product: ShopProduct = {
    ...(payload as ShopProduct),
    id: payload.id?.trim() || `prd-${crypto.randomUUID()}`,
    createdAt: now,
    updatedAt: now,
  }

  if (catalog.products.some((existing) => existing.id === product.id)) {
    throw createError({
      statusCode: 409,
      statusMessage: `Product id already exists: ${product.id}`,
    })
  }

  catalog.products.push(product)
  await saveShopCatalog(catalog)

  setResponseStatus(event, 201)
  return { data: product }
})
