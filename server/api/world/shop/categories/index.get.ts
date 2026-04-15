import { buildCategoryTree, getShopCatalog } from '~~/server/utils/shopCatalog'

export default defineEventHandler(async () => {
  const catalog = await getShopCatalog()

  return {
    data: catalog.categories,
    tree: buildCategoryTree(catalog.categories),
  }
})
