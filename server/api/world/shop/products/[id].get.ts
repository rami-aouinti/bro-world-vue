import type { ShopProductStatus } from '~~/app/types/world/shop'
import { callPublicApi } from '~~/server/utils/publicApi'

interface PublicShopProduct {
  id: string
  name: string
  sku: string
  description: string
  photo?: string
  price: number
  discountedPrice?: number
  promotionPercentage?: number
  texture?: string | null
  currencyCode: string
  stock: number
  coinsAmount: number
  isFeatured: boolean
  status: ShopProductStatus
  categoryId?: string
  categoryName?: string
  tags?: string[]
  updatedAt: string
}

interface PublicShopProductDetailResponse {
  product?: PublicShopProduct
  similarProducts?: PublicShopProduct[]
}

function toUiProduct(product: PublicShopProduct) {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    slug: product.sku,
    description: product.description,
    photo: product.photo ?? '',
    status: product.status,
    category: product.categoryName ?? 'Uncategorized',
    categoryId: product.categoryId,
    categoryName: product.categoryName ?? 'Uncategorized',
    currencyCode: product.currencyCode,
    price: product.price,
    discountedPrice: product.discountedPrice,
    promotionPercentage: product.promotionPercentage,
    texture: product.texture ?? null,
    amount: product.price,
    stock: product.stock,
    coinsAmount: product.coinsAmount,
    isFeatured: product.isFeatured,
    tags: product.tags ?? [],
    createdAt: product.updatedAt,
    updatedAt: product.updatedAt,
  }
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product id is required',
    })
  }

  const response = await callPublicApi<PublicShopProductDetailResponse>(
    event,
    `/shop/general/products/${id}`,
  )

  if (!response.product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  return {
    data: {
      product: toUiProduct(response.product),
      similarProducts: (response.similarProducts ?? []).map(toUiProduct),
    },
  }
})
