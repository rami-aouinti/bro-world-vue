<script setup lang="ts">
import type { SessionUser } from '~/types/session'
import type {
  ShopGeneralCategory,
  ShopGeneralProduct,
} from '~/types/world/shop'

definePageMeta({
  title: 'world.shop.label',
  description: 'world.shop.seo.metaDescription',
})

const { t, locale } = useI18n()
const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl || 'https://bro-world-space.com'
const pageUrl = new URL('/world/shop', siteUrl).toString()
const seoImage = new URL('/img/platform/general/shop.png', siteUrl).toString()

useSeoMeta({
  title: t('world.shop.seo.title', 'Bro World Shop | Store, promotions, and online shopping'),
  description: t(
    'world.shop.seo.description',
    'Discover Bro World Shop: product catalog, categories, promotions, and secure checkout for your purchases.',
  ),
  keywords: t(
    'world.shop.seo.keywords',
    'bro world shop, online store, ecommerce, product catalog, promotions, cart, checkout',
  ),
  robots: 'index, follow, max-image-preview:large',
  ogTitle: t('world.shop.seo.ogTitle', 'Bro World Shop | Store, promotions, and online shopping'),
  ogDescription: t(
    'world.shop.seo.ogDescription',
    'Find products, apply filters, and order easily with Bro World Shop.',
  ),
  ogType: 'website',
  ogUrl: pageUrl,
  ogImage: seoImage,
  ogImageAlt: 'Bro World Shop catalogue',
  twitterTitle: t('world.shop.seo.twitterTitle', 'Bro World Shop | Store, promotions, and online shopping'),
  twitterDescription: t(
    'world.shop.seo.twitterDescription',
    'Find products, apply filters, and order easily with Bro World Shop.',
  ),
  twitterImage: seoImage,
  twitterCard: 'summary_large_image',
})

const { user } = useUserSession()
const route = useRoute()
const shopStore = useWorldShopStore()

const sessionUser = computed(() => user.value as SessionUser | null)

const listLoading = ref(false)
const categoriesLoading = ref(false)
const cartPendingProductId = ref<string | null>(null)

const qFilter = ref('')
const selectedCategory = ref('')
const minPriceFilter = ref<number | null>(null)
const maxPriceFilter = ref<number | null>(null)
const promotionFilter = ref('')

const page = ref(1)
const limit = ref(20)

const products = computed(() => shopStore.items as ShopGeneralProduct[])
const totalItems = computed(() => shopStore.pagination.total)
const totalPages = computed(() => shopStore.pagination.totalPages)

const categories = computed(() => shopStore.categories as ShopGeneralCategory[])

const hasError = computed(() => !!shopStore.error)
const isEmpty = computed(
  () => !listLoading.value && !hasError.value && products.value.length === 0,
)
const promotionOptions = [
  { title: '10%', value: '10' },
  { title: '20%', value: '20' },
  { title: '30%', value: '30' },
  { title: '40%', value: '40' },
  { title: '40+', value: '40+' },
]

function normalizedPromotionFilter() {
  if (!promotionFilter.value) return undefined
  if (promotionFilter.value === '40+') return 40

  const parsed = Number(promotionFilter.value)
  if (!Number.isFinite(parsed)) return undefined
  return Math.max(0, Math.floor(parsed))
}

function formatPrice(product: ShopGeneralProduct) {
  const baseAmount = product.price ?? product.amount
  const effectiveAmount = product.discountedPrice ?? baseAmount

  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: product.currencyCode || 'EUR',
    maximumFractionDigits: 2,
  }).format(effectiveAmount)
}

function formatAmount(value: number, currencyCode: string) {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: currencyCode || 'EUR',
    maximumFractionDigits: 2,
  }).format(value)
}

function originalPrice(product: ShopGeneralProduct) {
  return product.price ?? product.amount
}

function hasPromotion(product: ShopGeneralProduct) {
  const original = originalPrice(product)
  const discounted = product.discountedPrice
  return typeof discounted === 'number' && discounted < original
}

function productImage(product: ShopGeneralProduct) {
  const fallback = '/images/platform-media/shop-premium-hoodie.svg'
  return product.photo?.trim() || fallback
}

function categoryImage(category: ShopGeneralCategory) {
  const fallback = '/images/platform-media/shop-premium-hoodie.svg'
  return category.photo?.trim() || fallback
}

function goToProductDetail(productId: string) {
  return navigateTo(`/world/shop/products/${productId}`)
}

async function addToCart(product: ShopGeneralProduct) {
  const token = sessionUser.value?.token?.trim()
  if (!token) {
    await navigateTo({
      path: '/login',
      query: { redirect: route.fullPath },
    })
    return
  }

  cartPendingProductId.value = product.id
  try {
    await shopStore.addCartItem(product.id, 1)
    Notify.success(t('world.shop.feedback.addToCartSuccess'))
  } catch (error) {
    Notify.error(
      shopStore.error ||
        (error instanceof Error
          ? error.message
          : t('world.shop.feedback.addToCartError')),
    )
  } finally {
    cartPendingProductId.value = null
  }
}

function toggleCategoryFilter(categoryName: string) {
  selectedCategory.value =
    selectedCategory.value === categoryName ? '' : categoryName
  void applyFilters()
}

function resolveProductCategory(item: ShopGeneralProduct) {
  return item.categoryName || item.category || ''
}

async function fetchProducts() {
  listLoading.value = true
  try {
    await shopStore.fetchProducts({
      filters: {
        q: qFilter.value,
        category: selectedCategory.value,
        minPrice: minPriceFilter.value ?? undefined,
        maxPrice: maxPriceFilter.value ?? undefined,
        promotion: normalizedPromotionFilter(),
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

async function fetchCategories() {
  categoriesLoading.value = true
  try {
    await shopStore.fetchCategories()
  } finally {
    categoriesLoading.value = false
  }
}

async function applyFilters() {
  page.value = 1
  await fetchProducts()
}

async function resetFilters() {
  qFilter.value = ''
  selectedCategory.value = ''
  minPriceFilter.value = null
  maxPriceFilter.value = null
  promotionFilter.value = ''
  await applyFilters()
}

watch([page, limit], async ([nextPage, nextLimit], [prevPage, prevLimit]) => {
  if (nextPage === prevPage && nextLimit === prevLimit) {
    return
  }

  await fetchProducts()
})

onMounted(async () => {
  qFilter.value = shopStore.filters.q ?? ''
  selectedCategory.value = shopStore.filters.category ?? ''
  minPriceFilter.value = shopStore.filters.minPrice ?? null
  maxPriceFilter.value = shopStore.filters.maxPrice ?? null
  promotionFilter.value =
    typeof shopStore.filters.promotion === 'number'
      ? String(shopStore.filters.promotion)
      : ''

  page.value = shopStore.pagination.page || 1
  limit.value = shopStore.pagination.limit || 20

  await Promise.all([fetchProducts(), fetchCategories()])
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <v-card class="postcard-gradient-card" rounded="xl" variant="tonal">
          <v-card-title>{{
            t('world.shop.filters.categoriesTitle')
          }}</v-card-title>
          <v-divider />

          <v-list class="py-0" lines="two">
            <v-list-item
              v-for="category in categories"
              :key="category.id"
              :active="selectedCategory === category.name"
              rounded="lg"
              @click="toggleCategoryFilter(category.name)"
            >
              <template #prepend>
                <v-avatar rounded="lg" size="44">
                  <v-img
                    :src="categoryImage(category)"
                    :alt="category.name"
                    cover
                  />
                </v-avatar>
              </template>

              <v-list-item-title>{{ category.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{
                  selectedCategory === category.name
                    ? t('world.shop.filters.selected')
                    : t('world.shop.filters.clickToFilter')
                }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-card-text v-if="categoriesLoading">
            <v-skeleton-loader
              type="list-item-three-line, list-item-three-line"
            />
          </v-card-text>

          <v-card-text v-if="!categoriesLoading && categories.length === 0">
            <v-empty-state
              icon="mdi-shape-outline"
              :title="t('world.shop.filters.noCategories')"
            />
          </v-card-text>

          <v-divider class="mt-2" />

          <v-card-text class="pt-4">
            <v-text-field
              v-model.number="minPriceFilter"
              type="number"
              min="0"
              :label="t('world.shop.filters.minPrice')"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              class="mb-3"
              @update:model-value="applyFilters"
            />

            <v-text-field
              v-model.number="maxPriceFilter"
              type="number"
              min="0"
              :label="t('world.shop.filters.maxPrice')"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              class="mb-3"
              @update:model-value="applyFilters"
            />

            <v-select
              v-model="promotionFilter"
              :items="promotionOptions"
              item-title="title"
              item-value="value"
              :label="t('world.shop.filters.promotion')"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              class="mb-4"
              @update:model-value="applyFilters"
            />

            <v-btn
              block
              variant="outlined"
              prepend-icon="mdi-filter-remove-outline"
              @click="resetFilters"
            >
              {{ t('world.shop.filters.reset') }}
            </v-btn>
          </v-card-text>
        </v-card>
      </template>
    </AppPageDrawers>

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
        <v-card-title
          class="d-flex align-center justify-space-between flex-wrap ga-3"
        >
          <span>{{ t('world.shop.products.title') }}</span>
          <v-chip size="small" variant="outlined">
            {{ totalItems }} {{ t('world.shop.products.results') }}
          </v-chip>
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-text-field
            v-model="qFilter"
            :label="t('world.shop.filters.searchLabel')"
            class="mb-6"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-magnify"
            hide-details
            clearable
            @keyup.enter="applyFilters"
          />

          <template v-if="listLoading">
            <v-row>
              <v-col
                v-for="index in 6"
                :key="`products-skeleton-${index}`"
                cols="12"
                md="6"
                lg="4"
              >
                <v-skeleton-loader
                  type="card"
                  data-testid="shop-products-loading"
                />
              </v-col>
            </v-row>
          </template>

          <v-empty-state
            v-else-if="isEmpty"
            data-testid="shop-products-empty"
            icon="mdi-package-variant-remove"
            :title="t('world.shop.products.emptyTitle')"
            :text="t('world.shop.products.emptyText')"
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
              >
                <v-img
                  :src="productImage(item)"
                  :alt="item.name"
                  height="190"
                  cover
                  class="cursor-pointer"
                  @click="goToProductDetail(item.id)"
                >
                  <template #error>
                    <div
                      class="d-flex align-center justify-center fill-height bg-surface-variant"
                    >
                      <v-icon icon="mdi-image-off-outline" size="40" />
                    </div>
                  </template>
                </v-img>

                <v-card-item>
                  <v-card-title
                    class="text-subtitle-1 font-weight-bold text-wrap cursor-pointer"
                    @click="goToProductDetail(item.id)"
                  >
                    {{ item.name }}
                  </v-card-title>
                </v-card-item>

                <v-card-text>
                  <div class="mb-3">
                    <v-chip
                      v-if="resolveProductCategory(item)"
                      size="small"
                      variant="tonal"
                      color="primary"
                      class="cursor-pointer"
                      :prepend-icon="
                        selectedCategory === resolveProductCategory(item)
                          ? 'mdi-filter-check-outline'
                          : 'mdi-shape-outline'
                      "
                      @click="
                        toggleCategoryFilter(resolveProductCategory(item))
                      "
                    >
                      {{ resolveProductCategory(item) }}
                    </v-chip>
                  </div>

                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="d-flex flex-column">
                      <span class="text-h6 font-weight-bold">{{
                        formatPrice(item)
                      }}</span>
                      <span
                        v-if="hasPromotion(item)"
                        class="text-caption text-medium-emphasis text-decoration-line-through"
                      >
                        {{
                          formatAmount(
                            originalPrice(item),
                            item.currencyCode || 'EUR',
                          )
                        }}
                      </span>
                    </div>
                    <v-chip
                      v-if="
                        hasPromotion(item) &&
                        typeof item.promotionPercentage === 'number'
                      "
                      size="small"
                      color="error"
                      variant="tonal"
                    >
                      -{{ item.promotionPercentage }}%
                    </v-chip>
                  </div>
                </v-card-text>

                <v-card-actions>
                  <v-btn
                    block
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-cart-plus"
                    :loading="cartPendingProductId === item.id"
                    :disabled="cartPendingProductId === item.id"
                    @click="addToCart(item)"
                  >
                    {{ t('world.shop.actions.addToCart') }}
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
            :label="t('world.shop.products.rows')"
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
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.shop-product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 30px rgb(15 23 42 / 18%) !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
