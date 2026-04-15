<script setup lang="ts">
import type { ShopProduct, ShopProductStatus } from '~/types/world/shop'

definePageMeta({ title: 'Shop Products' })

const shopNavItems = [
  {
    title: 'Overview Shop',
    to: '/world/shop',
    icon: 'mdi-view-dashboard-outline',
  },
  {
    title: 'Categories',
    to: '/world/shop/categories',
    icon: 'mdi-shape-outline',
  },
  {
    title: 'Products',
    to: '/world/shop/products',
    icon: 'mdi-package-variant-closed',
  },
  { title: 'Checkout', to: '/world/shop/checkout', icon: 'mdi-cart-outline' },
  {
    title: 'Payment',
    to: '/world/shop/payment',
    icon: 'mdi-credit-card-outline',
  },
  {
    title: 'Orders',
    to: '/world/shop/orders',
    icon: 'mdi-receipt-text-outline',
  },
  {
    title: 'Admin',
    to: '/world/shop/admin',
    icon: 'mdi-shield-crown-outline',
    rootOnly: true,
  },
]

const shopStore = useWorldShopStore()

const qFilter = ref('')
const nameFilter = ref('')
const categoryFilter = ref('')
const statusFilter = ref<ShopProductStatus | null>(null)
const listLoading = ref(false)

const page = ref(1)
const limit = ref(20)

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Name', key: 'name' },
  { title: 'Category', key: 'category' },
  { title: 'Status', key: 'status' },
  { title: 'Price', key: 'price' },
  { title: 'Featured', key: 'featured' },
  { title: 'Updated at', key: 'updatedAt' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const products = computed(() => shopStore.items as ShopProduct[])
const totalItems = computed(() => shopStore.pagination.total)
const totalPages = computed(() => shopStore.pagination.totalPages)

const categoryOptions = computed(() => {
  const categories = new Set<string>()
  for (const product of products.value) {
    if (product.category?.trim()) {
      categories.add(product.category)
    }
  }

  return Array.from(categories).sort((a, b) => a.localeCompare(b))
})

const statusOptions = [
  { title: 'Draft', value: 'draft' },
  { title: 'Active', value: 'active' },
  { title: 'Archived', value: 'archived' },
]

const hasActiveFilters = computed(
  () =>
    !!qFilter.value.trim() ||
    !!nameFilter.value.trim() ||
    !!categoryFilter.value.trim() ||
    !!statusFilter.value,
)

const hasError = computed(() => !!shopStore.error)
const isEmpty = computed(
  () => !listLoading.value && !hasError.value && products.value.length === 0,
)

function formatPrice(product: ShopProduct) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: product.currencyCode || 'EUR',
    maximumFractionDigits: 2,
  }).format(product.amount)
}

function prefetchProductDetail(productId: string) {
  void shopStore.fetchProductById(productId).catch(() => undefined)
}

async function goToProductDetail(productId: string) {
  await shopStore.fetchProductById(productId)
  await navigateTo(`/world/shop/products/${productId}`)
}

async function fetchProducts() {
  listLoading.value = true
  try {
    await shopStore.fetchProducts({
      filters: {
        q: qFilter.value,
        name: nameFilter.value,
        category: categoryFilter.value,
        status: statusFilter.value ?? undefined,
        page: page.value,
        limit: limit.value,
      },
    })

    page.value = shopStore.pagination.page
    limit.value = shopStore.pagination.limit
  } finally {
    listLoading.value = false
  }
}

async function applyFilters() {
  page.value = 1
  await fetchProducts()
}

async function resetFilters() {
  qFilter.value = ''
  nameFilter.value = ''
  categoryFilter.value = ''
  statusFilter.value = null
  page.value = 1
  await fetchProducts()
}

watch([page, limit], async ([nextPage, nextLimit], [prevPage, prevLimit]) => {
  if (nextPage === prevPage && nextLimit === prevLimit) {
    return
  }

  await fetchProducts()
})

onMounted(async () => {
  qFilter.value = shopStore.filters.q ?? ''
  nameFilter.value = shopStore.filters.name ?? ''
  categoryFilter.value = shopStore.filters.category ?? ''
  statusFilter.value = shopStore.filters.status ?? null

  page.value = shopStore.pagination.page || 1
  limit.value = shopStore.pagination.limit || 20

  await fetchProducts()
})
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Shop"
      module-icon="mdi-storefront-outline"
      module-description="Navigation complète du module Shop."
      :nav-items="shopNavItems"
      action-label="Create product"
    />

    <v-container fluid>
      <v-card class="mb-6" rounded="xl" variant="tonal">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="qFilter"
                label="Search (q)"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-magnify"
                hide-details
                clearable
                @keyup.enter="applyFilters"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="nameFilter"
                label="Filter by name"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
                @keyup.enter="applyFilters"
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-combobox
                v-model="categoryFilter"
                :items="categoryOptions"
                label="Filter by category"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-select
                v-model="statusFilter"
                :items="statusOptions"
                label="Status"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
              />
            </v-col>
          </v-row>

          <div class="d-flex gap-3 mt-4">
            <v-btn color="primary" prepend-icon="mdi-filter" @click="applyFilters">
              Apply filters
            </v-btn>
            <v-btn
              variant="text"
              prepend-icon="mdi-filter-remove-outline"
              :disabled="!hasActiveFilters"
              @click="resetFilters"
            >
              Reset
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <v-alert
        v-if="hasError"
        data-testid="shop-products-error"
        type="error"
        variant="tonal"
        class="mb-6"
        :text="shopStore.error ?? undefined"
      />

      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-3">
          <span>Products</span>
          <v-chip size="small" variant="outlined">
            {{ totalItems }} results
          </v-chip>
        </v-card-title>

        <v-divider />

        <v-card-text>
          <template v-if="listLoading">
            <v-skeleton-loader
              v-for="index in 6"
              :key="`products-skeleton-${index}`"
              type="table-row"
              data-testid="shop-products-loading"
              class="mb-2"
            />
          </template>

          <v-empty-state
            v-else-if="isEmpty"
            data-testid="shop-products-empty"
            icon="mdi-package-variant-remove"
            title="No products found"
            text="Aucun produit ne correspond aux filtres appliqués."
          />

          <v-data-table
            v-else
            :headers="headers"
            :items="products"
            item-value="id"
            hide-default-footer
            density="comfortable"
          >
            <template #item.status="{ item }">
              <v-chip
                size="small"
                :color="
                  item.status === 'active'
                    ? 'success'
                    : item.status === 'draft'
                      ? 'warning'
                      : 'default'
                "
                variant="tonal"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <template #item.featured="{ item }">
              <v-icon :icon="item.isFeatured ? 'mdi-star' : 'mdi-star-outline'" />
            </template>

            <template #item.price="{ item }">
              {{ formatPrice(item) }}
            </template>

            <template #item.updatedAt="{ item }">
              {{ new Date(item.updatedAt).toLocaleString('fr-FR') }}
            </template>

            <template #item.actions="{ item }">
              <v-btn
                variant="text"
                color="primary"
                prepend-icon="mdi-open-in-new"
                @mouseenter="prefetchProductDetail(item.id)"
                @focus="prefetchProductDetail(item.id)"
                @click="goToProductDetail(item.id)"
              >
                View
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-space-between flex-wrap ga-4 px-4 py-4">
          <v-select
            v-model="limit"
            :items="[10, 20, 50]"
            label="Rows"
            density="compact"
            variant="outlined"
            hide-details
            style="max-width: 120px"
          />

          <v-pagination
            v-model="page"
            :length="Math.max(1, totalPages)"
            total-visible="7"
          />
        </v-card-actions>
      </v-card>
    </v-container>
  </div>
</template>
