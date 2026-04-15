import type {
  ShopCatalogState,
  ShopCategory,
  ShopProduct,
  ShopSeoFields,
  ShopVariant,
} from '~~/server/types/api/shop'

const STORAGE_KEY = 'world:shop:catalog'

const nowIso = () => new Date().toISOString()

const defaultSeo = (entity: string): ShopSeoFields => ({
  metaTitle: `${entity} | Bro World Shop`,
  metaDescription: `Découvrir ${entity} sur Bro World Shop.`,
  keywords: ['bro-world', 'shop'],
  canonicalUrl: '',
})

const seedCatalog = (): ShopCatalogState => {
  const createdAt = nowIso()

  return {
    categories: [
      {
        id: 'cat-apparel',
        name: 'Apparel',
        slug: 'apparel',
        description: 'Tous les vêtements.',
        parentId: null,
        image: '/images/platform-media/shop-premium-hoodie.svg',
        seo: defaultSeo('Apparel'),
        facetDefinitions: [
          {
            key: 'size',
            label: 'Size',
            type: 'term',
            options: ['XS', 'S', 'M', 'L', 'XL'],
          },
          {
            key: 'color',
            label: 'Color',
            type: 'term',
            options: ['black', 'white', 'navy', 'green'],
          },
          { key: 'price', label: 'Price', type: 'range' },
        ],
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: 'cat-hoodies',
        name: 'Hoodies',
        slug: 'hoodies',
        description: 'Sweats premium.',
        parentId: 'cat-apparel',
        image: '/images/platform-media/shop-premium-hoodie.svg',
        seo: defaultSeo('Hoodies'),
        facetDefinitions: [
          {
            key: 'size',
            label: 'Size',
            type: 'term',
            options: ['S', 'M', 'L', 'XL'],
          },
          {
            key: 'material',
            label: 'Material',
            type: 'term',
            options: ['cotton', 'fleece'],
          },
        ],
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: 'cat-workspace',
        name: 'Workspace',
        slug: 'workspace',
        description: 'Desk setup and accessories.',
        parentId: null,
        image: '/images/platform-media/shop-desk-setup-kit.svg',
        seo: defaultSeo('Workspace'),
        facetDefinitions: [
          {
            key: 'color',
            label: 'Color',
            type: 'term',
            options: ['black', 'walnut'],
          },
          {
            key: 'brand',
            label: 'Brand',
            type: 'term',
            options: ['bro-world', 'atelier'],
          },
        ],
        createdAt,
        updatedAt: createdAt,
      },
    ],
    products: [
      {
        id: 'prd-premium-hoodie',
        name: 'Premium Hoodie',
        slug: 'premium-hoodie',
        description: 'Hoodie premium pour le quotidien.',
        baseSku: 'BW-HOOD-BASE',
        status: 'active',
        price: 79,
        stock: 48,
        categoryIds: ['cat-apparel', 'cat-hoodies'],
        attributes: {
          brand: 'bro-world',
          material: 'cotton',
          fit: 'regular',
        },
        images: [
          '/images/platform-media/shop-premium-hoodie.svg',
          '/img/product-11.jpg',
        ],
        variants: [
          {
            id: 'var-hoodie-black-m',
            size: 'M',
            color: 'black',
            sku: 'BW-HOOD-BLK-M',
            price: 79,
            stock: 12,
            attributes: { fit: 'regular' },
          },
          {
            id: 'var-hoodie-navy-l',
            size: 'L',
            color: 'navy',
            sku: 'BW-HOOD-NVY-L',
            price: 81,
            stock: 9,
            attributes: { fit: 'oversized' },
          },
        ],
        seo: defaultSeo('Premium Hoodie'),
        createdAt,
        updatedAt: createdAt,
      },
    ],
  }
}

export async function getShopCatalog(): Promise<ShopCatalogState> {
  const storage = useStorage<ShopCatalogState>('data')
  const existing = await storage.getItem(STORAGE_KEY)

  if (existing) return existing

  const seeded = seedCatalog()
  await storage.setItem(STORAGE_KEY, seeded)

  return seeded
}

export async function saveShopCatalog(catalog: ShopCatalogState) {
  await useStorage<ShopCatalogState>('data').setItem(STORAGE_KEY, catalog)
}

const ensureObject = (value: unknown, field: string) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw createError({
      statusCode: 422,
      statusMessage: `${field} must be an object`,
    })
  }
}

const ensureNonEmptyString = (value: unknown, field: string) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw createError({
      statusCode: 422,
      statusMessage: `${field} is required`,
    })
  }
}

const ensureStringArray = (value: unknown, field: string, minLength = 0) => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw createError({
      statusCode: 422,
      statusMessage: `${field} must be an array of strings`,
    })
  }

  if (value.length < minLength) {
    throw createError({
      statusCode: 422,
      statusMessage: `${field} must contain at least ${minLength} item(s)`,
    })
  }
}

export function validateSeo(seo: unknown) {
  ensureObject(seo, 'seo')

  const payload = seo as ShopSeoFields
  ensureNonEmptyString(payload.metaTitle, 'seo.metaTitle')
  ensureNonEmptyString(payload.metaDescription, 'seo.metaDescription')
  ensureStringArray(payload.keywords, 'seo.keywords')

  if (payload.canonicalUrl && typeof payload.canonicalUrl !== 'string') {
    throw createError({
      statusCode: 422,
      statusMessage: 'seo.canonicalUrl must be a string',
    })
  }
}

export function validateCategoryInput(
  category: Partial<ShopCategory>,
  catalog: ShopCatalogState,
  currentId?: string,
) {
  ensureNonEmptyString(category.name, 'name')
  ensureNonEmptyString(category.slug, 'slug')
  ensureNonEmptyString(category.description, 'description')
  ensureNonEmptyString(category.image, 'image')
  validateSeo(category.seo)

  if (!Array.isArray(category.facetDefinitions)) {
    throw createError({
      statusCode: 422,
      statusMessage: 'facetDefinitions must be an array',
    })
  }

  for (const facet of category.facetDefinitions) {
    ensureNonEmptyString(facet.key, 'facetDefinitions.key')
    ensureNonEmptyString(facet.label, 'facetDefinitions.label')

    if (!['term', 'range'].includes(facet.type)) {
      throw createError({
        statusCode: 422,
        statusMessage: 'facetDefinitions.type must be term or range',
      })
    }

    if (facet.options) {
      ensureStringArray(facet.options, `facetDefinitions.${facet.key}.options`)
    }
  }

  const slugConflict = catalog.categories.find(
    (existing) => existing.slug === category.slug && existing.id !== currentId,
  )
  if (slugConflict) {
    throw createError({
      statusCode: 409,
      statusMessage: `Category slug already exists: ${category.slug}`,
    })
  }

  if (category.parentId) {
    if (category.parentId === currentId) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A category cannot be its own parent',
      })
    }

    const parent = catalog.categories.find(
      (existing) => existing.id === category.parentId,
    )
    if (!parent) {
      throw createError({
        statusCode: 422,
        statusMessage: `Parent category not found: ${category.parentId}`,
      })
    }

    let cursor: ShopCategory | undefined = parent
    while (cursor) {
      if (cursor.parentId === currentId) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Category tree cycle detected',
        })
      }
      cursor = catalog.categories.find((item) => item.id === cursor?.parentId)
    }
  }
}

export function validateVariantInput(variants: unknown) {
  if (!Array.isArray(variants) || variants.length === 0) {
    throw createError({
      statusCode: 422,
      statusMessage: 'variants must be a non-empty array',
    })
  }

  const seen = new Set<string>()

  for (const variant of variants as ShopVariant[]) {
    ensureNonEmptyString(variant.id, 'variants.id')
    ensureNonEmptyString(variant.size, 'variants.size')
    ensureNonEmptyString(variant.color, 'variants.color')
    ensureNonEmptyString(variant.sku, 'variants.sku')

    if (typeof variant.price !== 'number' || variant.price < 0) {
      throw createError({
        statusCode: 422,
        statusMessage: `Invalid variant price for SKU ${variant.sku}`,
      })
    }

    if (!Number.isInteger(variant.stock) || variant.stock < 0) {
      throw createError({
        statusCode: 422,
        statusMessage: `Invalid variant stock for SKU ${variant.sku}`,
      })
    }

    if (seen.has(variant.sku)) {
      throw createError({
        statusCode: 409,
        statusMessage: `Duplicate variant SKU in payload: ${variant.sku}`,
      })
    }

    seen.add(variant.sku)
    ensureObject(variant.attributes, `variants.${variant.sku}.attributes`)
  }
}

export function validateProductInput(
  product: Partial<ShopProduct>,
  catalog: ShopCatalogState,
  currentId?: string,
) {
  ensureNonEmptyString(product.name, 'name')
  ensureNonEmptyString(product.slug, 'slug')
  ensureNonEmptyString(product.description, 'description')
  ensureNonEmptyString(product.baseSku, 'baseSku')

  if (!['draft', 'active', 'archived'].includes(product.status as string)) {
    throw createError({
      statusCode: 422,
      statusMessage: 'status must be draft, active or archived',
    })
  }

  if (typeof product.price !== 'number' || product.price < 0) {
    throw createError({
      statusCode: 422,
      statusMessage: 'price must be a positive number',
    })
  }

  if (
    typeof product.stock !== 'number' ||
    !Number.isInteger(product.stock) ||
    product.stock < 0
  ) {
    throw createError({
      statusCode: 422,
      statusMessage: 'stock must be a positive integer',
    })
  }

  ensureStringArray(product.images, 'images', 1)
  ensureStringArray(product.categoryIds, 'categoryIds', 1)
  ensureObject(product.attributes, 'attributes')
  validateVariantInput(product.variants)
  validateSeo(product.seo)

  const missingCategory = product.categoryIds?.find(
    (categoryId) =>
      !catalog.categories.some((category) => category.id === categoryId),
  )
  if (missingCategory) {
    throw createError({
      statusCode: 422,
      statusMessage: `Unknown category: ${missingCategory}`,
    })
  }

  const slugConflict = catalog.products.find(
    (existing) => existing.slug === product.slug && existing.id !== currentId,
  )
  if (slugConflict) {
    throw createError({
      statusCode: 409,
      statusMessage: `Product slug already exists: ${product.slug}`,
    })
  }

  ensureUniqueSku(product, catalog, currentId)
}

const ensureUniqueSku = (
  product: Partial<ShopProduct>,
  catalog: ShopCatalogState,
  currentId?: string,
) => {
  const allSkus = new Set<string>()

  for (const item of catalog.products) {
    if (item.id === currentId) continue

    allSkus.add(item.baseSku)

    for (const variant of item.variants) {
      allSkus.add(variant.sku)
    }
  }

  if (allSkus.has(product.baseSku as string)) {
    throw createError({
      statusCode: 409,
      statusMessage: `SKU already exists: ${product.baseSku}`,
    })
  }

  for (const variant of product.variants ?? []) {
    if (allSkus.has(variant.sku)) {
      throw createError({
        statusCode: 409,
        statusMessage: `SKU already exists: ${variant.sku}`,
      })
    }
  }
}

export function buildCategoryTree(categories: ShopCategory[]) {
  const nodes = new Map(
    categories.map((category) => [
      category.id,
      {
        ...category,
        children: [] as Array<ShopCategory & { children: unknown[] }>,
      },
    ]),
  )

  for (const node of nodes.values()) {
    if (node.parentId) {
      const parent = nodes.get(node.parentId)
      parent?.children.push(node)
    }
  }

  return [...nodes.values()].filter((node) => !node.parentId)
}

export function buildFacets(products: ShopProduct[]) {
  const counts = {
    size: {} as Record<string, number>,
    color: {} as Record<string, number>,
    brand: {} as Record<string, number>,
    material: {} as Record<string, number>,
  }

  for (const product of products) {
    for (const variant of product.variants) {
      counts.size[variant.size] = (counts.size[variant.size] ?? 0) + 1
      counts.color[variant.color] = (counts.color[variant.color] ?? 0) + 1
    }

    const brand = product.attributes.brand
    const material = product.attributes.material

    if (brand) counts.brand[brand] = (counts.brand[brand] ?? 0) + 1

    if (material)
      counts.material[material] = (counts.material[material] ?? 0) + 1
  }

  return counts
}
