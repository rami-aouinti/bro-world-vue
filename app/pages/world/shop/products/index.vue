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

function productImage(product: ShopProduct) {
  const fallback = '/images/platform-media/shop-premium-hoodie.svg'
  return product.photo?.trim() || fallback
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
    >
      <template #right>
        <v-card class="postcard-gradient-card" rounded="xl" variant="tonal">
          <v-card-text>
            <v-row>
              <v-col cols="12">
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
              <v-col cols="12">
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
              <v-col cols="12">
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
              <v-col cols="12">
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

            <div class="d-flex flex-column ga-2 mt-4">
              <v-btn color="primary" variant="tonal" prepend-icon="mdi-filter" @click="applyFilters">
                Apply filters
              </v-btn>
              <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-filter-remove-outline"
                :disabled="!hasActiveFilters"
                @click="resetFilters"
              >
                Reset
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </template>
    </WorldModuleDrawers>

    <v-container fluid>
      <v-alert
        v-if="hasError"
        data-testid="shop-products-error"
        type="error"
        variant="tonal"
        class="mb-6"
        :text="shopStore.error ?? undefined"
      />

      <v-card rounded="xl" class="postcard-gradient-card">
        <v-card-title class="d-flex align-center justify-space-between flex-wrap ga-3">
          <span>Products</span>
          <v-chip size="small" variant="outlined">
            {{ totalItems }} results
          </v-chip>
        </v-card-title>

        <v-divider />

        <v-card-text>
          <template v-if="listLoading">
            <v-row>
              <v-col v-for="index in 6" :key="`products-skeleton-${index}`" cols="12" md="6" lg="4">
                <v-skeleton-loader type="card" data-testid="shop-products-loading" />
              </v-col>
            </v-row>
          </template>

          <v-empty-state
            v-else-if="isEmpty"
            data-testid="shop-products-empty"
            icon="mdi-package-variant-remove"
            title="No products found"
            text="Aucun produit ne correspond aux filtres appliqués."
          />

          <v-row v-else>
            <v-col
              v-for="item in products"
              :key="item.id"
              cols="12"
              sm="6"
              lg="4"
              xl="3"
            >
              <v-card
                class="shop-product-card postcard-gradient-card h-100"
                rounded="xl"
                elevation="3"
                @mouseenter="prefetchProductDetail(item.id)"
                @focusin="prefetchProductDetail(item.id)"
              >
                <v-img
                  :src="productImage(item)"
                  :alt="item.name"
                  height="220"
                  cover
                >
                  <template #error>
                    <div class="d-flex align-center justify-center fill-height bg-surface-variant">
                      <v-icon icon="mdi-image-off-outline" size="40" />
                    </div>
                  </template>
                </v-img>

                <v-card-item>
                  <v-card-title class="text-subtitle-1 font-weight-bold text-wrap">
                    {{ item.name }}
                  </v-card-title>
                  <v-card-subtitle>
                    {{ item.categoryName || item.category }}
                  </v-card-subtitle>
                </v-card-item>

                <v-card-text>
                  <p class="text-body-2 text-medium-emphasis mb-3 text-truncate-3">
                    {{ item.description }}
                  </p>

                  <div class="d-flex align-center justify-space-between mb-2">
                    <span class="text-h6 font-weight-bold">{{ formatPrice(item) }}</span>
                  </div>
                </v-card-text>

                <v-card-actions>
                  <v-btn
                    block
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-open-in-new"
                    @click="goToProductDetail(item.id)"
                  >
                    View details
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
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

<style scoped>
.shop-product-card {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.shop-product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 30px rgb(15 23 42 / 18%) !important;
}

.text-truncate-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
