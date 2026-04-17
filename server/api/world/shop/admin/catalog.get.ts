import { getShopCatalog } from '~~/server/utils/shopCatalog'

export default defineEventHandler(async () => {
  const catalog = await getShopCatalog()
  return {
    data: catalog,
  }
})
