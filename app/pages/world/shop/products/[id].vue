<script setup lang="ts">
import type { ShopProduct } from '~/types/world/shop'

definePageMeta({ title: 'Product detail' })

const route = useRoute()
const shopStore = useWorldShopStore()

const listError = ref<string | null>(null)
const loading = ref(false)

const product = ref<ShopProduct | null>(null)
const similarProducts = ref<ShopProduct[]>([])

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
      <v-skeleton-loader type="article, actions" />
      <v-skeleton-loader type="table" class="mt-4" />
    </template>

    <v-alert v-else-if="listError" type="error" variant="tonal" :text="listError" />

    <v-empty-state
      v-else-if="!product"
      icon="mdi-package-variant-remove"
      title="Produit introuvable"
      text="Le produit demandé n'existe pas ou n'est plus disponible."
    />

    <template v-else>
      <v-card rounded="xl" class="mb-6">
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
          <v-row>
            <v-col cols="12" md="6">
              <div class="text-caption text-medium-emphasis">ID</div>
              <div class="font-weight-medium mb-3">{{ product.id }}</div>

              <div class="text-caption text-medium-emphasis">Slug</div>
              <div class="font-weight-medium mb-3">{{ product.slug }}</div>

              <div class="text-caption text-medium-emphasis">Category</div>
              <div class="font-weight-medium mb-3">{{ product.category }}</div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="text-caption text-medium-emphasis">Price</div>
              <div class="font-weight-medium mb-3">
                {{
                  new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: product.currencyCode || 'EUR',
                    maximumFractionDigits: 2,
                  }).format(product.amount)
                }}
              </div>

              <div class="text-caption text-medium-emphasis">Coins amount</div>
              <div class="font-weight-medium mb-3">{{ product.coinsAmount }}</div>

              <div class="text-caption text-medium-emphasis">Featured</div>
              <div class="font-weight-medium mb-3">
                {{ product.isFeatured ? 'Yes' : 'No' }}
              </div>
            </v-col>

            <v-col cols="12">
              <div class="text-caption text-medium-emphasis">Description</div>
              <div class="font-weight-medium">{{ product.description }}</div>
            </v-col>
          </v-row>
        </v-card-text>
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

        <v-list v-else lines="two">
          <v-list-item
            v-for="related in similarProducts"
            :key="related.id"
            :title="related.name"
            :subtitle="`${related.category} • ${related.status}`"
            :to="`/world/shop/products/${related.id}`"
          >
            <template #append>
              <v-btn
                icon="mdi-open-in-new"
                variant="text"
                @mouseenter="shopStore.fetchProductById(related.id).catch(() => undefined)"
              />
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </template>
  </v-container>
</template>
