<script setup lang="ts">
import type { ShopProduct } from '~/types/world/shop'

definePageMeta({ title: 'Product detail' })

const route = useRoute()
const shopStore = useWorldShopStore()

const listError = ref<string | null>(null)
const loading = ref(false)

const product = ref<ShopProduct | null>(null)
const similarProducts = ref<ShopProduct[]>([])

function productImage(item: ShopProduct) {
  const fallback = '/images/platform-media/shop-premium-hoodie.svg'
  return item.photo?.trim() || fallback
}

function formatPrice(item: ShopProduct) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: item.currencyCode || 'EUR',
    maximumFractionDigits: 2,
  }).format(item.amount)
}

async function loadProduct(force = false) {
  const productId = String(route.params.id || '')
  if (!productId) {
    listError.value = 'Product ID manquant.'
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
        : 'Impossible de charger ce produit pour le moment.')
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
      <h1 class="text-h5 font-weight-bold">Product detail</h1>
      <v-btn to="/world/shop/products" prepend-icon="mdi-arrow-left" variant="tonal">
        Back to products
      </v-btn>
    </div>

    <template v-if="loading">
      <v-skeleton-loader type="image, article, actions" />
      <v-skeleton-loader type="card" class="mt-4" />
    </template>

    <v-alert v-else-if="listError" type="error" variant="tonal" :text="listError" />

    <v-empty-state
      v-else-if="!product"
      icon="mdi-package-variant-remove"
      title="Produit introuvable"
      text="Le produit demandé n'existe pas ou n'est plus disponible."
    />

    <template v-else>
      <v-card rounded="xl" class="mb-6 overflow-hidden">
        <v-row no-gutters>
          <v-col cols="12" md="5">
            <v-img :src="productImage(product)" :alt="product.name" height="100%" min-height="320" cover />
          </v-col>

          <v-col cols="12" md="7">
            <v-card-title class="d-flex justify-space-between align-center flex-wrap ga-3">
              <span>{{ product.name }}</span>
              <v-chip
                size="small"
                variant="tonal"
                :color="
                  product.status === 'active'
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

              <v-row>
                <v-col cols="6" md="4">
                  <div class="text-caption text-medium-emphasis">Price</div>
                  <div class="font-weight-bold text-h6">{{ formatPrice(product) }}</div>
                </v-col>

                <v-col cols="6" md="4">
                  <div class="text-caption text-medium-emphasis">Coins</div>
                  <div class="font-weight-medium">{{ product.coinsAmount }}</div>
                </v-col>

                <v-col cols="6" md="4">
                  <div class="text-caption text-medium-emphasis">Stock</div>
                  <div class="font-weight-medium">{{ product.stock ?? '-' }}</div>
                </v-col>

                <v-col cols="6" md="4">
                  <div class="text-caption text-medium-emphasis">Category</div>
                  <div class="font-weight-medium">{{ product.categoryName || product.category }}</div>
                </v-col>

                <v-col cols="6" md="4">
                  <div class="text-caption text-medium-emphasis">SKU</div>
                  <div class="font-weight-medium">{{ product.sku || product.slug }}</div>
                </v-col>

                <v-col cols="6" md="4">
                  <div class="text-caption text-medium-emphasis">Featured</div>
                  <div class="font-weight-medium">{{ product.isFeatured ? 'Yes' : 'No' }}</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-col>
        </v-row>
      </v-card>

      <v-card rounded="xl">
        <v-card-title>Similar products</v-card-title>
        <v-divider />

        <v-empty-state
          v-if="similarProducts.length === 0"
          icon="mdi-shape-outline"
          title="No similar products"
          text="Aucune recommandation n'est disponible pour ce produit."
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
                class="h-100"
                rounded="lg"
                :to="`/world/shop/products/${related.id}`"
              >
                <v-img :src="productImage(related)" :alt="related.name" height="180" cover />
                <v-card-item>
                  <v-card-title class="text-subtitle-1">{{ related.name }}</v-card-title>
                  <v-card-subtitle>{{ related.categoryName || related.category }}</v-card-subtitle>
                </v-card-item>
                <v-card-actions>
                  <v-chip size="small" variant="tonal">{{ formatPrice(related) }}</v-chip>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>
  </v-container>
</template>
