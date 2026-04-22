<script setup lang="ts">
import type { SessionUser } from '~/types/session'
import { normalizeHttpError } from '~/utils/httpError'

definePageMeta({ layout: 'shop', title: 'Shop Admin' })
const { shopNavItems } = useShopNavItems()
const { t } = useI18n()

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(
  () => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false,
)

type SeoFields = {
  metaTitle: string
  metaDescription: string
  keywords: string[]
  canonicalUrl: string
}

type CategoryFacet = {
  key: string
  label: string
  type: 'term' | 'range'
  options: string[]
}

type AdminCategory = {
  id: string
  name: string
  slug: string
  description: string
  parentId: string | null
  image: string
  seo: SeoFields
  facetDefinitions: CategoryFacet[]
}

type AdminProduct = {
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
  variants: Array<{
    id: string
    size: string
    color: string
    sku: string
    price: number
    stock: number
    attributes: Record<string, string>
  }>
  seo: SeoFields
}

const categories = ref<AdminCategory[]>([])
const products = ref<AdminProduct[]>([])
const loading = ref(false)
const catalogError = ref<string | null>(null)
const actionMessage = ref<string | null>(null)

const categoryForm = reactive({
  id: '',
  name: '',
  slug: '',
  description: '',
  parentId: null as string | null,
  image: '',
  seoMetaTitle: '',
  seoMetaDescription: '',
  seoKeywords: '',
  facetKey: 'size',
  facetLabel: 'Size',
  facetType: 'term' as 'term' | 'range',
  facetOptions: 'S,M,L,XL',
})
const editingCategoryId = ref<string | null>(null)
const categoryFormError = ref<string | null>(null)

const productForm = reactive({
  id: '',
  name: '',
  slug: '',
  description: '',
  baseSku: '',
  status: 'active' as 'draft' | 'active' | 'archived',
  price: 0,
  stock: 0,
  categoryIdsCsv: '',
  image: '',
  seoMetaTitle: '',
  seoMetaDescription: '',
  seoKeywords: '',
  variantId: '',
  variantSize: 'M',
  variantColor: 'black',
  variantSku: '',
})
const editingProductId = ref<string | null>(null)
const productFormError = ref<string | null>(null)

const prettyApiError = (err: unknown) => {
  const normalized = normalizeHttpError(err)
  if (normalized.statusCode === 400)
    return `Error 400: ${normalized.message}. Please check the submitted parameters.`
  if (normalized.statusCode === 404)
    return `Error 404: ${normalized.message}. The item no longer exists.`
  if (normalized.statusCode === 422)
    return `Error 422: ${normalized.message}. Please correct the form fields.`
  return normalized.message
}

const loadCatalog = async () => {
  loading.value = true
  catalogError.value = null
  actionMessage.value = null
  try {
    const response = await $fetch<{
      data: { categories: AdminCategory[]; products: AdminProduct[] }
    }>('/api/world/shop/admin/catalog')
    categories.value = response.data.categories
    products.value = response.data.products
  } catch (err) {
    catalogError.value = prettyApiError(err)
    categories.value = []
    products.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (isRoot.value) {
    await loadCatalog()
  }
})

const resetCategoryForm = () => {
  editingCategoryId.value = null
  categoryFormError.value = null
  Object.assign(categoryForm, {
    id: '',
    name: '',
    slug: '',
    description: '',
    parentId: null,
    image: '',
    seoMetaTitle: '',
    seoMetaDescription: '',
    seoKeywords: '',
    facetKey: 'size',
    facetLabel: 'Size',
    facetType: 'term',
    facetOptions: 'S,M,L,XL',
  })
}

const resetProductForm = () => {
  editingProductId.value = null
  productFormError.value = null
  Object.assign(productForm, {
    id: '',
    name: '',
    slug: '',
    description: '',
    baseSku: '',
    status: 'active',
    price: 0,
    stock: 0,
    categoryIdsCsv: '',
    image: '',
    seoMetaTitle: '',
    seoMetaDescription: '',
    seoKeywords: '',
    variantId: '',
    variantSize: 'M',
    variantColor: 'black',
    variantSku: '',
  })
}

const validateCategoryForm = () => {
  if (!categoryForm.name.trim()) return 'Category name is required.'
  if (!categoryForm.slug.trim()) return 'Category slug is required.'
  if (!categoryForm.description.trim()) return 'Description is required.'
  if (!categoryForm.image.trim()) return 'Image is required.'
  if (
    !categoryForm.seoMetaTitle.trim() ||
    !categoryForm.seoMetaDescription.trim()
  ) {
    return 'SEO title and description are required.'
  }
  return null
}

const validateProductForm = () => {
  if (!productForm.name.trim()) return 'Product name is required.'
  if (!productForm.slug.trim()) return 'Product slug is required.'
  if (!productForm.baseSku.trim()) return 'Primary SKU is required.'
  if (productForm.price < 0) return 'Price must be positive.'
  if (productForm.stock < 0) return 'Stock must be positive.'
  if (!productForm.categoryIdsCsv.trim())
    return 'At least one category is required.'
  if (
    !productForm.seoMetaTitle.trim() ||
    !productForm.seoMetaDescription.trim()
  ) {
    return 'SEO title and description are required.'
  }
  if (!productForm.variantId.trim() || !productForm.variantSku.trim()) {
    return 'At least one variant (id + sku) is required.'
  }
  return null
}

const submitCategory = async () => {
  categoryFormError.value = validateCategoryForm()
  if (categoryFormError.value) return

  const payload = {
    id: categoryForm.id || undefined,
    name: categoryForm.name,
    slug: categoryForm.slug,
    description: categoryForm.description,
    parentId: categoryForm.parentId,
    image: categoryForm.image,
    seo: {
      metaTitle: categoryForm.seoMetaTitle,
      metaDescription: categoryForm.seoMetaDescription,
      keywords: categoryForm.seoKeywords
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      canonicalUrl: '',
    },
    facetDefinitions: [
      {
        key: categoryForm.facetKey,
        label: categoryForm.facetLabel,
        type: categoryForm.facetType,
        options: categoryForm.facetOptions
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      },
    ],
  }

  try {
    if (editingCategoryId.value) {
      await $fetch(
        `/api/world/shop/categories/${encodeURIComponent(editingCategoryId.value)}`,
        { method: 'PATCH', body: payload },
      )
      actionMessage.value = 'Category updated.'
    } else {
      await $fetch('/api/world/shop/categories', {
        method: 'POST',
        body: payload,
      })
      actionMessage.value = 'Category created.'
    }
    resetCategoryForm()
    await loadCatalog()
  } catch (err) {
    categoryFormError.value = prettyApiError(err)
  }
}

const submitProduct = async () => {
  productFormError.value = validateProductForm()
  if (productFormError.value) return

  const categoryIds = productForm.categoryIdsCsv
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  const payload = {
    id: productForm.id || undefined,
    name: productForm.name,
    slug: productForm.slug,
    description: productForm.description,
    baseSku: productForm.baseSku,
    status: productForm.status,
    price: productForm.price,
    stock: productForm.stock,
    categoryIds,
    attributes: {},
    images: [productForm.image],
    variants: [
      {
        id: productForm.variantId,
        size: productForm.variantSize,
        color: productForm.variantColor,
        sku: productForm.variantSku,
        price: productForm.price,
        stock: productForm.stock,
        attributes: {},
      },
    ],
    seo: {
      metaTitle: productForm.seoMetaTitle,
      metaDescription: productForm.seoMetaDescription,
      keywords: productForm.seoKeywords
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      canonicalUrl: '',
    },
  }

  try {
    if (editingProductId.value) {
      await $fetch(
        `/api/world/shop/products/${encodeURIComponent(editingProductId.value)}`,
        { method: 'PATCH', body: payload },
      )
      actionMessage.value = 'Product updated.'
    } else {
      await $fetch('/api/world/shop/products', {
        method: 'POST',
        body: payload,
      })
      actionMessage.value = 'Product created.'
    }
    resetProductForm()
    await loadCatalog()
  } catch (err) {
    productFormError.value = prettyApiError(err)
  }
}

const editCategory = (category: AdminCategory) => {
  editingCategoryId.value = category.id
  Object.assign(categoryForm, {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    parentId: category.parentId,
    image: category.image,
    seoMetaTitle: category.seo.metaTitle,
    seoMetaDescription: category.seo.metaDescription,
    seoKeywords: category.seo.keywords.join(','),
    facetKey: category.facetDefinitions[0]?.key ?? 'size',
    facetLabel: category.facetDefinitions[0]?.label ?? 'Size',
    facetType: category.facetDefinitions[0]?.type ?? 'term',
    facetOptions: (category.facetDefinitions[0]?.options ?? []).join(','),
  })
}

const editProduct = (product: AdminProduct) => {
  editingProductId.value = product.id
  const variant = product.variants[0]
  Object.assign(productForm, {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    baseSku: product.baseSku,
    status: product.status,
    price: product.price,
    stock: product.stock,
    categoryIdsCsv: product.categoryIds.join(','),
    image: product.images[0] ?? '',
    seoMetaTitle: product.seo.metaTitle,
    seoMetaDescription: product.seo.metaDescription,
    seoKeywords: product.seo.keywords.join(','),
    variantId: variant?.id ?? '',
    variantSize: variant?.size ?? 'M',
    variantColor: variant?.color ?? 'black',
    variantSku: variant?.sku ?? '',
  })
}

const deleteCategory = async (categoryId: string) => {
  try {
    await $fetch(
      `/api/world/shop/categories/${encodeURIComponent(categoryId)}`,
      { method: 'DELETE' },
    )
    actionMessage.value = 'Category deleted.'
    await loadCatalog()
  } catch (err) {
    catalogError.value = prettyApiError(err)
  }
}

const deleteProduct = async (productId: string) => {
  try {
    await $fetch(`/api/world/shop/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    })
    actionMessage.value = 'Product deleted.'
    await loadCatalog()
  } catch (err) {
    catalogError.value = prettyApiError(err)
  }
}
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.shop.label', 'Shop')"
      module-icon="mdi-storefront-outline"
      :module-description="
        t(
          'world.shop.admin.moduleDescription',
          'Product/category catalog administration (CRUD).',
        )
      "
      :nav-items="shopNavItems"
      :action-label="t('world.shop.admin.actionLabel', 'Shop Admin')"
      action-icon="mdi-shield-check-outline"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-5 postcard-gradient-card">
        <template v-if="isRoot">
          <h2 class="text-h5 mb-2">
            {{ t('world.shop.admin.centerTitle', 'Shop Admin Center') }}
          </h2>
          <p class="text-medium-emphasis mb-4">
            {{
              t(
                'world.shop.admin.centerDescription',
                'Category/product CRUD with form validation and standardized status handling.',
              )
            }}
          </p>

          <v-alert
            v-if="catalogError"
            type="error"
            variant="tonal"
            class="mb-3"
            >{{ catalogError }}</v-alert
          >
          <v-alert
            v-if="actionMessage"
            type="success"
            variant="tonal"
            class="mb-3"
            >{{ actionMessage }}</v-alert
          >

          <v-skeleton-loader
            v-if="loading"
            type="article, table-heading, table-row-divider@4"
          />

          <template v-else>
            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4 mb-4">
                  <h3 class="text-subtitle-1 mb-3">
                    {{
                      editingCategoryId
                        ? t('world.shop.admin.actions.edit', 'Edit')
                        : t('world.shop.admin.actions.create', 'Create')
                    }}
                    {{ t('world.shop.admin.entities.category', 'category') }}
                  </h3>
                  <v-alert
                    v-if="categoryFormError"
                    type="error"
                    variant="tonal"
                    class="mb-2"
                    >{{ categoryFormError }}</v-alert
                  >
                  <v-text-field
                    v-model="categoryForm.name"
                    :label="t('world.shop.admin.fields.name', 'Name')"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  />
                  <v-text-field
                    v-model="categoryForm.slug"
                    label="Slug"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  />
                  <v-textarea
                    v-model="categoryForm.description"
                    label="Description"
                    variant="outlined"
                    density="comfortable"
                    rows="2"
                    class="mb-2"
                  />
                  <v-text-field
                    v-model="categoryForm.image"
                    label="Image URL"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  />
                  <v-text-field
                    v-model="categoryForm.seoMetaTitle"
                    label="SEO meta title"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  />
                  <v-text-field
                    v-model="categoryForm.seoMetaDescription"
                    label="SEO meta description"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  />
                  <v-text-field
                    v-model="categoryForm.seoKeywords"
                    label="SEO keywords (csv)"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  />
                  <v-row>
                    <v-col cols="6"
                      ><v-text-field
                        v-model="categoryForm.facetKey"
                        label="Facet key"
                        variant="outlined"
                        density="comfortable"
                    /></v-col>
                    <v-col cols="6"
                      ><v-text-field
                        v-model="categoryForm.facetLabel"
                        label="Facet label"
                        variant="outlined"
                        density="comfortable"
                    /></v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="6">
                      <AppSelect
                        v-model="categoryForm.facetType"
                        :items="['term', 'range']"
                        label="Facet type"
                        variant="outlined"
                        density="comfortable"
                      />
                    </v-col>
                    <v-col cols="6"
                      ><v-text-field
                        v-model="categoryForm.facetOptions"
                        label="Facet options (csv)"
                        variant="outlined"
                        density="comfortable"
                    /></v-col>
                  </v-row>
                  <div class="d-flex ga-2">
                    <v-btn color="primary" @click="submitCategory">{{
                      editingCategoryId
                        ? t('world.shop.admin.actions.update', 'Update')
                        : t('world.shop.admin.actions.create', 'Create')
                    }}</v-btn>
                    <v-btn variant="text" @click="resetCategoryForm">{{
                      t('world.shop.admin.actions.reset', 'Reset')
                    }}</v-btn>
                  </div>
                </v-card>

                <v-card variant="outlined" class="pa-4">
                  <h3 class="text-subtitle-1 mb-2">
                    {{
                      t('world.shop.admin.sections.categories', 'Categories')
                    }}
                  </h3>
                  <v-list v-if="categories.length" density="compact">
                    <v-list-item
                      v-for="category in categories"
                      :key="category.id"
                      :title="`${category.name} (${category.slug})`"
                      :subtitle="category.description"
                    >
                      <template #append>
                        <div class="d-flex ga-2">
                          <v-btn
                            size="x-small"
                            variant="text"
                            color="primary"
                            @click="editCategory(category)"
                            >{{
                              t('world.shop.admin.actions.edit', 'Edit')
                            }}</v-btn
                          >
                          <v-btn
                            size="x-small"
                            variant="text"
                            color="error"
                            @click="deleteCategory(category.id)"
                            >{{
                              t('world.shop.admin.actions.delete', 'Delete')
                            }}</v-btn
                          >
                        </div>
                      </template>
                    </v-list-item>
                  </v-list>
                  <v-alert v-else type="info" variant="tonal">{{
                    t(
                      'world.shop.admin.alerts.noCategory',
                      'No category available.',
                    )
                  }}</v-alert>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card variant="outlined" class="pa-4 mb-4">
                  <h3 class="text-subtitle-1 mb-3">
                    {{
                      editingProductId
                        ? t('world.shop.admin.actions.edit', 'Edit')
                        : t('world.shop.admin.actions.create', 'Create')
                    }}
                    {{ t('world.shop.admin.entities.product', 'product') }}
                  </h3>
                  <v-alert
                    v-if="productFormError"
                    type="error"
                    variant="tonal"
                    class="mb-2"
                    >{{ productFormError }}</v-alert
                  >
                  <v-text-field
                    v-model="productForm.name"
                    :label="t('world.shop.admin.fields.productName', 'Name')"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  />
                  <v-text-field
                    v-model="productForm.slug"
                    label="Slug"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  />
                  <v-textarea
                    v-model="productForm.description"
                    label="Description"
                    variant="outlined"
                    density="comfortable"
                    rows="2"
                    class="mb-2"
                  />
                  <v-text-field
                    v-model="productForm.baseSku"
                    label="Base SKU"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  />
                  <AppSelect
                    v-model="productForm.status"
                    :items="['draft', 'active', 'archived']"
                    label="Status"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  />
                  <v-row>
                    <v-col cols="6"
                      ><v-text-field
                        v-model.number="productForm.price"
                        :label="t('world.shop.admin.fields.price', 'Price')"
                        type="number"
                        variant="outlined"
                        density="comfortable"
                    /></v-col>
                    <v-col cols="6"
                      ><v-text-field
                        v-model.number="productForm.stock"
                        :label="t('world.shop.admin.fields.stock', 'Stock')"
                        type="number"
                        variant="outlined"
                        density="comfortable"
                    /></v-col>
                  </v-row>
                  <v-text-field
                    v-model="productForm.categoryIdsCsv"
                    label="Category IDs (csv)"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  />
                  <v-text-field
                    v-model="productForm.image"
                    label="Image URL"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  />
                  <v-text-field
                    v-model="productForm.seoMetaTitle"
                    label="SEO meta title"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  />
                  <v-text-field
                    v-model="productForm.seoMetaDescription"
                    label="SEO meta description"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  />
                  <v-text-field
                    v-model="productForm.seoKeywords"
                    label="SEO keywords (csv)"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                  />
                  <v-row>
                    <v-col cols="6"
                      ><v-text-field
                        v-model="productForm.variantId"
                        label="Variant ID"
                        variant="outlined"
                        density="comfortable"
                    /></v-col>
                    <v-col cols="6"
                      ><v-text-field
                        v-model="productForm.variantSku"
                        label="Variant SKU"
                        variant="outlined"
                        density="comfortable"
                    /></v-col>
                  </v-row>
                  <div class="d-flex ga-2">
                    <v-btn color="primary" @click="submitProduct">{{
                      editingProductId
                        ? t('world.shop.admin.actions.update', 'Update')
                        : t('world.shop.admin.actions.create', 'Create')
                    }}</v-btn>
                    <v-btn variant="text" @click="resetProductForm">{{
                      t('world.shop.admin.actions.reset', 'Reset')
                    }}</v-btn>
                  </div>
                </v-card>

                <v-card variant="outlined" class="pa-4">
                  <h3 class="text-subtitle-1 mb-2">
                    {{ t('world.shop.admin.sections.products', 'Products') }}
                  </h3>
                  <v-list v-if="products.length" density="compact">
                    <v-list-item
                      v-for="product in products"
                      :key="product.id"
                      :title="`${product.name} (${product.status})`"
                      :subtitle="`${product.price}€ • stock ${product.stock}`"
                    >
                      <template #append>
                        <div class="d-flex ga-2">
                          <v-btn
                            size="x-small"
                            variant="text"
                            color="primary"
                            @click="editProduct(product)"
                            >{{
                              t('world.shop.admin.actions.edit', 'Edit')
                            }}</v-btn
                          >
                          <v-btn
                            size="x-small"
                            variant="text"
                            color="error"
                            @click="deleteProduct(product.id)"
                            >{{
                              t('world.shop.admin.actions.delete', 'Delete')
                            }}</v-btn
                          >
                        </div>
                      </template>
                    </v-list-item>
                  </v-list>
                  <v-alert v-else type="info" variant="tonal">{{
                    t(
                      'world.shop.admin.alerts.noProduct',
                      'No product available.',
                    )
                  }}</v-alert>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </template>
        <p v-else class="text-error mb-0">
          Access denied. This page requires ROLE_ROOT.
        </p>
      </v-card>
    </v-container>
  </div>
</template>
