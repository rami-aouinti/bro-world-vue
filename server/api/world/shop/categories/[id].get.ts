import { getShopCatalog } from '~~/server/utils/shopCatalog'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const catalog = await getShopCatalog()

  const category = catalog.categories.find(item => item.id === id)
  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  return { data: category }
})
