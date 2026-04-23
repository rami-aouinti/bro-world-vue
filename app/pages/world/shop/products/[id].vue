<script setup lang="ts">
import type { ShopGeneralProduct } from '~/types/world/shop'
import type { SessionUser } from '~/types/session'

definePageMeta({ layout: 'shop', title: 'world.shop.productDetail.title' })

const route = useRoute()
const { user } = useUserSession()
const { t, locale } = useI18n()
const shopStore = useWorldShopStore()
const sessionUser = computed(() => user.value as SessionUser | null)

const listError = ref<string | null>(null)
const loading = ref(false)
const addToCartLoading = ref(false)

const product = ref<ShopGeneralProduct | null>(null)
const similarProducts = ref<ShopGeneralProduct[]>([])

function productImage(item: ShopGeneralProduct) {
  const fallback = '/images/platform-media/shop-premium-hoodie.svg'
  return item.photo?.trim() || fallback
}

function formatPrice(item: ShopGeneralProduct) {
  const baseAmount = item.price ?? item.amount
  const effectiveAmount = item.discountedPrice ?? baseAmount

  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: item.currencyCode || 'EUR',
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

function originalPrice(item: ShopGeneralProduct) {
  return item.price ?? item.amount
}

function hasPromotion(item: ShopGeneralProduct) {
  const original = originalPrice(item)
  const discounted = item.discountedPrice
  return typeof discounted === 'number' && discounted < original
}

async function addToCart() {
  if (!product.value) {
    return
  }

  const token = sessionUser.value?.token?.trim()
  if (!token) {
    await navigateTo({
      path: '/login',
      query: { redirect: route.fullPath },
    })
    return
  }

  addToCartLoading.value = true
  try {
    await shopStore.addCartItem(product.value.id, 1)
    Notify.success(t('world.shop.feedback.addToCartSuccess'))
  } catch (error) {
    Notify.error(
      shopStore.error ||
        (error instanceof Error
          ? error.message
          : t('world.shop.feedback.addToCartError')),
    )
  } finally {
    addToCartLoading.value = false
  }
}

async function loadProduct(force = false) {
  const productId = String(route.params.id || '')
  if (!productId) {
    listError.value = t('world.shop.productDetail.errors.missingId')
    return
  }

  loading.value = true
  listError.value = null
  try {
    const result = await shopStore.fetchProductById(productId, { force })
    product.value = result.product
    similarProducts.value = result.similarProducts
  } catch (error) {
    listError.value =
      shopStore.error ||
      (error instanceof Error
        ? error.message
        : t('world.shop.productDetail.errors.loadFailed'))
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadProduct()
})

watch(
  () => route.params.id,
  async (value, previous) => {
    if (value === previous) {
      return
    }

    await loadProduct(true)
  },
)
</script>

<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-3">
      <h1 class="text-h5 font-weight-bold">
        {{ t('world.shop.productDetail.title') }}
      </h1>
      <v-btn
        to="/world/shop/products"
        color="primary"
        prepend-icon="mdi-arrow-left"
        variant="tonal"
      >
        {{ t('world.shop.productDetail.backToProducts') }}
      </v-btn>
    </div>

    <template v-if="loading">
      <v-skeleton-loader type="image, article, actions" />
      <v-skeleton-loader type="card" class="mt-4" />
    </template>

    <v-alert
      v-else-if="listError"
      type="error"
      variant="tonal"
      :text="listError"
    />

    <v-empty-state
      v-else-if="!product"
      icon="mdi-package-variant-remove"
      :title="t('world.shop.productDetail.notFound.title')"
      :text="t('world.shop.productDetail.notFound.text')"
    />

    <template v-else>
      <v-card rounded="xl" class="mb-6 overflow-hidden postcard-gradient-card">
        <v-row no-gutters>
          <v-col cols="12" md="5">
            <v-img
              :src="productImage(product)"
              :alt="product.name"
              height="100%"
              min-height="320"
              cover
            />
          </v-col>

          <v-col cols="12" md="7">
            <v-card-title
              class="d-flex justify-space-between align-center flex-wrap ga-3"
            >
              <span>{{ product.name }}</span>
              <v-chip
                size="small"
                variant="tonal"
                :color="
                  product.status === 'published'
                    ? 'success'
                    : product.status === 'draft'
                      ? 'warning'
                      : 'default'
                "
              >
                {{ product.status }}
              </v-chip>
            </v-card-title>
            <v-divider />
            <v-card-text>
              <p class="text-body-1 mb-4">{{ product.description }}</p>

              <div class="mb-4">
                <v-btn
                  color="primary"
                  prepend-icon="mdi-cart-plus"
                  :loading="addToCartLoading"
                  :disabled="addToCartLoading"
                  @click="addToCart"
                >
                  {{ t('world.shop.actions.addToCart') }}
                </v-btn>
              </div>

              <v-row>
                <v-col cols="6" md="4">
                  <div class="text-caption text-medium-emphasis">
                    {{ t('world.shop.productDetail.fields.price') }}
                  </div>
                  <div class="d-flex align-center ga-2 flex-wrap">
                    <div class="font-weight-bold text-h6">
                      {{ formatPrice(product) }}
                    </div>
                    <div
                      v-if="hasPromotion(product)"
                      class="text-caption text-medium-emphasis text-decoration-line-through"
                    >
                      {{
                        formatAmount(
                          originalPrice(product),
                          product.currencyCode || 'EUR',
                        )
                      }}
                    </div>
                    <v-chip
                      v-if="
                        hasPromotion(product) &&
                        typeof product.promotionPercentage === 'number'
                      "
                      size="small"
                      color="error"
                      variant="tonal"
                    >
                      -{{ product.promotionPercentage }}%
                    </v-chip>
                  </div>
                </v-col>

                <v-col cols="6" md="4">
                  <div class="text-caption text-medium-emphasis">
                    {{ t('world.shop.productDetail.fields.coins') }}
                  </div>
                  <div class="font-weight-medium">
                    {{ product.coinsAmount }}
                  </div>
                </v-col>

                <v-col cols="6" md="4">
                  <div class="text-caption text-medium-emphasis">
                    {{ t('world.shop.productDetail.fields.stock') }}
                  </div>
                  <div class="font-weight-medium">
                    {{ product.stock ?? t('world.common.notAvailable') }}
                  </div>
                </v-col>

                <v-col cols="6" md="4">
                  <div class="text-caption text-medium-emphasis">
                    {{ t('world.shop.productDetail.fields.category') }}
                  </div>
                  <div class="font-weight-medium">
                    {{ product.categoryName || product.category }}
                  </div>
                </v-col>

                <v-col cols="6" md="4">
                  <div class="text-caption text-medium-emphasis">
                    {{ t('world.shop.productDetail.fields.sku') }}
                  </div>
                  <div class="font-weight-medium">
                    {{ product.sku || product.slug }}
                  </div>
                </v-col>

                <v-col cols="6" md="4">
                  <div class="text-caption text-medium-emphasis">
                    {{ t('world.shop.productDetail.fields.featured') }}
                  </div>
                  <div class="font-weight-medium">
                    {{
                      product.isFeatured
                        ? t('world.common.yes')
                        : t('world.common.no')
                    }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-col>
        </v-row>
      </v-card>

      <v-card rounded="xl" class="postcard-gradient-card">
        <v-card-title>{{
          t('world.shop.productDetail.similar.title')
        }}</v-card-title>
        <v-divider />

        <v-empty-state
          v-if="similarProducts.length === 0"
          icon="mdi-shape-outline"
          :title="t('world.shop.productDetail.similar.emptyTitle')"
          :text="t('world.shop.productDetail.similar.emptyText')"
        />

        <v-card-text v-else>
          <v-row>
            <v-col
              v-for="related in similarProducts"
              :key="related.id"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card
                class="h-100 postcard-gradient-card"
                rounded="lg"
                :to="`/world/shop/products/${related.id}`"
              >
                <v-img
                  :src="productImage(related)"
                  :alt="related.name"
                  height="180"
                  cover
                />
                <v-card-item>
                  <v-card-title class="text-subtitle-1">{{
                    related.name
                  }}</v-card-title>
                  <v-card-subtitle>{{
                    related.categoryName || related.category
                  }}</v-card-subtitle>
                </v-card-item>
                <v-card-actions>
                  <div class="d-flex align-center ga-2 flex-wrap">
                    <v-chip size="small" variant="tonal">{{
                      formatPrice(related)
                    }}</v-chip>
                    <span
                      v-if="hasPromotion(related)"
                      class="text-caption text-medium-emphasis text-decoration-line-through"
                    >
                      {{
                        formatAmount(
                          originalPrice(related),
                          related.currencyCode || 'EUR',
                        )
                      }}
                    </span>
                    <v-chip
                      v-if="
                        hasPromotion(related) &&
                        typeof related.promotionPercentage === 'number'
                      "
                      size="x-small"
                      color="error"
                      variant="tonal"
                    >
                      -{{ related.promotionPercentage }}%
                    </v-chip>
                  </div>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>
  </v-container>
</template>
