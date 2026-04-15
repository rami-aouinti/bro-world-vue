import type { ShopCategory } from '~~/server/types/api/shop'
import {
  getShopCatalog,
  saveShopCatalog,
  validateCategoryInput,
} from '~~/server/utils/shopCatalog'

export default defineEventHandler(async (event) => {
  const payload = await readBody<Partial<ShopCategory>>(event)
  const catalog = await getShopCatalog()

  validateCategoryInput(payload, catalog)

  const now = new Date().toISOString()
  const category: ShopCategory = {
    ...(payload as ShopCategory),
    id: payload.id?.trim() || `cat-${crypto.randomUUID()}`,
    parentId: payload.parentId ?? null,
    createdAt: now,
    updatedAt: now,
  }

  if (catalog.categories.some((existing) => existing.id === category.id)) {
    throw createError({
      statusCode: 409,
      statusMessage: `Category id already exists: ${category.id}`,
    })
  }

  catalog.categories.push(category)
  await saveShopCatalog(catalog)

  setResponseStatus(event, 201)
  return { data: category }
})
