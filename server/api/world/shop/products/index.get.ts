import { buildFacets, getShopCatalog } from '~~/server/utils/shopCatalog'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const catalog = await getShopCatalog()

  let products = catalog.products

  if (typeof query.categoryId === 'string') {
    products = products.filter((product) =>
      product.categoryIds.includes(query.categoryId as string),
    )
  }

  if (typeof query.status === 'string') {
    products = products.filter((product) => product.status === query.status)
  }

  if (typeof query.search === 'string' && query.search.trim()) {
    const q = query.search.toLowerCase()
    products = products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q),
    )
  }

  if (typeof query.brand === 'string') {
    products = products.filter(
      (product) => product.attributes.brand === query.brand,
    )
  }

  if (typeof query.material === 'string') {
    products = products.filter(
      (product) => product.attributes.material === query.material,
    )
  }

  if (typeof query.color === 'string') {
    products = products.filter((product) =>
      product.variants.some((variant) => variant.color === query.color),
    )
  }

  if (typeof query.size === 'string') {
    products = products.filter((product) =>
      product.variants.some((variant) => variant.size === query.size),
    )
  }

  if (typeof query.priceMin === 'string') {
    const min = Number(query.priceMin)
    if (!Number.isNaN(min)) {
      products = products.filter((product) => product.price >= min)
    }
  }

  if (typeof query.priceMax === 'string') {
    const max = Number(query.priceMax)
    if (!Number.isNaN(max)) {
      products = products.filter((product) => product.price <= max)
    }
  }

  return {
    data: products,
    facets: buildFacets(products),
    total: products.length,
  }
})
