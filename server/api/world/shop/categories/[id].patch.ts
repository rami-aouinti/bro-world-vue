import type { ShopCategory } from '~~/server/types/api/shop'
import {
  getShopCatalog,
  saveShopCatalog,
  validateCategoryInput,
} from '~~/server/utils/shopCatalog'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing category id' })
  }

  const payload = await readBody<Partial<ShopCategory>>(event)
  const catalog = await getShopCatalog()
  const index = catalog.categories.findIndex((category) => category.id === id)

  if (index < 0) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  const updatedCategory = {
    ...catalog.categories[index],
    ...payload,
    id,
    updatedAt: new Date().toISOString(),
  }

  validateCategoryInput(updatedCategory, catalog, id)

  catalog.categories[index] = updatedCategory
  await saveShopCatalog(catalog)

  return { data: updatedCategory }
})
