import { getShopCatalog, saveShopCatalog } from '~~/server/utils/shopCatalog'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing category id' })
  }

  const catalog = await getShopCatalog()
  const categoryIndex = catalog.categories.findIndex(
    (category) => category.id === id,
  )

  if (categoryIndex < 0) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  const children = catalog.categories.filter(
    (category) => category.parentId === id,
  )
  if (children.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Cannot delete a category with children',
    })
  }

  const linkedProducts = catalog.products.filter((product) =>
    product.categoryIds.includes(id),
  )
  if (linkedProducts.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Cannot delete a category linked to products',
    })
  }

  catalog.categories.splice(categoryIndex, 1)
  await saveShopCatalog(catalog)

  return { success: true }
})
