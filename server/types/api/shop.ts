export interface ShopSeoFields {
  metaTitle: string
  metaDescription: string
  keywords: string[]
  canonicalUrl?: string
}

export interface ShopVariant {
  id: string
  size: string
  color: string
  sku: string
  price: number
  stock: number
  attributes: Record<string, string>
}

export interface ShopProduct {
  id: string
  name: string
  slug: string
  description: string
  baseSku: string
  status: 'draft' | 'active' | 'archived'
  price: number
  stock: number
  categoryIds: string[]
  attributes: Record<string, string>
  images: string[]
  variants: ShopVariant[]
  seo: ShopSeoFields
  createdAt: string
  updatedAt: string
}

export interface CategoryFacet {
  key: string
  label: string
  type: 'term' | 'range'
  options?: string[]
}

export interface ShopCategory {
  id: string
  name: string
  slug: string
  description: string
  parentId: string | null
  image: string
  seo: ShopSeoFields
  facetDefinitions: CategoryFacet[]
  createdAt: string
  updatedAt: string
}

export interface ShopCatalogState {
  products: ShopProduct[]
  categories: ShopCategory[]
}

export type ShopApiProductStatus = ShopProduct['status']

export interface ShopApiCategory {
  id: string
  name: string
  slug: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface ShopApiProduct {
  id: string
  name: string
  slug: string
  description: string
  status: ShopApiProductStatus
  category: string
  currencyCode: string
  amount: number
  coinsAmount: number
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export interface ShopApiProductsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ShopApiProductsFilters {
  q?: string
  name?: string
  category?: string
  status?: ShopApiProductStatus
  minPrice?: number
  maxPrice?: number
  promotion?: number
  page?: number
  limit?: number
}

export interface ShopApiProductsMeta {
  pagination: ShopApiProductsPagination
  filters: ShopApiProductsFilters
}

export interface ShopApiProductsListResponse {
  data: ShopApiProduct[]
  meta: ShopApiProductsMeta
}

export interface ShopApiProductDetailResponse {
  data: ShopApiProduct
}
