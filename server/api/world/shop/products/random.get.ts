import { getQuery } from 'h3'
import { callPublicApi } from '~~/server/utils/publicApi'

interface PublicShopProduct {
  id: string
  name: string
  photo?: string
  status: 'draft' | 'active' | 'archived'
}

interface PublicShopProductsResponse {
  items?: PublicShopProduct[]
}

function clampLimit(value: unknown) {
  if (typeof value !== 'string') return 2

  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed)) return 2

  return Math.max(1, Math.min(6, parsed))
}

function pickRandomItems<T>(items: T[], count: number) {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ]
  }

  return shuffled.slice(0, count)
}

export default defineEventHandler(async (event) => {
  const limit = clampLimit(getQuery(event).limit)

  const response = await callPublicApi<PublicShopProductsResponse>(
    event,
    '/shop/general/products',
    {
      query: {
        page: 1,
        limit: 50,
        status: 'active',
      },
    },
  )

  const items = (response.items ?? [])
    .filter((product) => product.status === 'active')
    .map((product) => ({
      id: product.id,
      name: product.name,
      photo: product.photo ?? '',
    }))

  return {
    data: pickRandomItems(items, limit),
  }
})
