import { callPublicApi } from '~~/server/utils/publicApi'

interface PublicShopCategory {
  id: string
  name: string
  slug: string
  description: string
  photo?: string
  shopId?: string
}

interface PublicShopCategoriesResponse {
  items?: PublicShopCategory[]
}

export default defineEventHandler(async (event) => {
  const response = await callPublicApi<PublicShopCategoriesResponse>(
    event,
    '/api/v1/shop/categories',
  )

  const data = Array.isArray(response.items)
    ? response.items.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        photo: item.photo ?? '',
        shopId: item.shopId,
        createdAt: '',
        updatedAt: '',
      }))
    : []

  return {
    data,
    tree: data.map((category) => ({ ...category, children: [] })),
  }
})
