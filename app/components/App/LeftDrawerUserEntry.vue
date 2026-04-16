<script setup lang="ts">
import type { SessionUser } from '~/types/session'
import type { ShopProduct } from '~/types/world/shop'

const { t } = useI18n()
const route = useRoute()
const { loggedIn, user } = useUserSession()
const shopStore = useWorldShopStore()

const sessionUser = computed(() => user.value as SessionUser | null)
const avatarUrl = computed(() => sessionUser.value?.photo)
const coins = computed(() => sessionUser.value?.coins ?? 0)
const coinModalOpen = ref(false)
const productsLoading = ref(false)
const checkoutError = ref('')
const checkoutSuccess = ref('')
const cartPendingProductId = ref<string | null>(null)
const coinProducts = ref<ShopProduct[]>([])

const currency = computed(() => {
  const locale = sessionUser.value?.locale?.toLowerCase() || ''
  if (
    locale.startsWith('fr') ||
    locale.startsWith('de') ||
    locale.startsWith('es') ||
    locale.startsWith('it')
  ) {
    return 'EUR'
  }

  return 'USD'
})

const fullName = computed(() => {
  const values = [sessionUser.value?.firstName, sessionUser.value?.lastName]
    .filter(Boolean)
    .join(' ')

  return values || sessionUser.value?.username || t('appbar.user')
})

function navigateToLogin() {
  navigateTo({
    path: '/login',
    query: {
      redirect: route.fullPath,
    },
  })
}

async function fetchCoinProducts() {
  productsLoading.value = true
  checkoutError.value = ''
  try {
    await shopStore.fetchProducts({
      force: true,
      filters: { status: 'active', page: 1, limit: 50 },
    })
    coinProducts.value = (shopStore.items as ShopProduct[]).filter((item) => {
      const category = String(item.category || item.categoryName || '')
        .toLowerCase()
        .trim()
      return category.includes('coins')
    })
  } catch (error) {
    coinProducts.value = []
    checkoutError.value =
      error instanceof Error
        ? error.message
        : t('appbar.coinCheckout.errors.generic')
  } finally {
    productsLoading.value = false
  }
}

function formatProductAmount(product: ShopProduct) {
  return new Intl.NumberFormat(sessionUser.value?.locale || 'en-US', {
    style: 'currency',
    currency: product.currencyCode || currency.value,
    maximumFractionDigits: 2,
  }).format(product.amount)
}

async function openCoinModal() {
  checkoutError.value = ''
  checkoutSuccess.value = ''
  coinModalOpen.value = true
  await fetchCoinProducts()
}

async function addToCart(product: ShopProduct) {
  cartPendingProductId.value = product.id
  checkoutError.value = ''
  checkoutSuccess.value = ''

  try {
    await shopStore.addCartItem(product.id, 1)
    checkoutSuccess.value = t('world.shop.feedback.addToCartSuccess')
  } catch (error) {
    checkoutError.value =
      error instanceof Error
        ? error.message
        : t('appbar.coinCheckout.errors.generic')
  } finally {
    cartPendingProductId.value = null
  }
}
</script>

<template>
  <div v-if="loggedIn">
    <NuxtLink
      to="/profile"
      class="d-flex align-center text-center ga-3"
      style="text-decoration: none; color: inherit"
    >
      <v-avatar size="60">
        <v-img :src="avatarUrl" :alt="`${fullName} avatar`" />
      </v-avatar>
      <div>
        <h3 class="my-0">{{ fullName }}</h3>
        <v-chip
          color="primary"
          size="small"
          variant="outlined"
          prepend-icon="mdi-cash-multiple"
          label
          class="mt-1"
          @click.prevent.stop="openCoinModal"
        >
          {{ coins }} coins
        </v-chip>
      </div>
    </NuxtLink>

    <AppModal
      v-model="coinModalOpen"
      :title="t('appbar.coinCheckout.title')"
      :max-width="760"
    >
      <v-sheet class="coin-modal-banner mb-4 pa-4" rounded="xl">
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <div>
            <p class="text-overline mb-1 text-medium-emphasis">
              {{ t('appbar.coinCheckout.steps.package') }}
            </p>
            <h3 class="text-h6 mb-0">{{ t('appbar.coinCheckout.title') }}</h3>
          </div>
          <v-chip size="small" color="primary" variant="flat">
            {{ t('appbar.coinCheckout.currentBalance', { coins }) }}
          </v-chip>
        </div>
      </v-sheet>

      <v-row v-if="productsLoading">
        <v-col
          v-for="index in 3"
          :key="`coins-product-skeleton-${index}`"
          cols="12"
          md="4"
        >
          <v-skeleton-loader type="card" />
        </v-col>
      </v-row>

      <v-alert
        v-else-if="!coinProducts.length"
        type="info"
        variant="tonal"
        class="mb-4"
      >
        {{ t('pages.profile.buyCoins.emptyProducts') }}
      </v-alert>

      <v-row v-else dense>
        <v-col
          v-for="item in coinProducts"
          :key="item.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card class="shop-product-card h-100" rounded="xl" elevation="4">
            <v-img
              :src="
                item.photo || '/images/placeholders/platform-media-fallback.svg'
              "
              :alt="item.name"
              height="160"
              cover
            >
              <template #error>
                <div
                  class="d-flex align-center justify-center fill-height bg-surface-variant"
                >
                  <v-icon icon="mdi-image-off-outline" size="40" />
                </div>
              </template>
            </v-img>
            <v-card-text class="pb-2">
              <h3 class="text-subtitle-1 mb-1">{{ item.name }}</h3>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ item.coinsAmount }} coins
              </p>
            </v-card-text>
            <v-card-actions
              class="px-4 pb-4 pt-0 d-flex align-center justify-space-between"
            >
              <span class="text-body-1 font-weight-bold">
                {{ formatProductAmount(item) }}
              </span>
              <v-btn
                color="primary"
                variant="flat"
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

      <v-alert
        v-if="checkoutSuccess"
        type="success"
        variant="tonal"
        class="mt-4"
      >
        {{ checkoutSuccess }}
      </v-alert>

      <v-alert v-if="checkoutError" type="error" variant="tonal" class="mt-4">
        {{ checkoutError }}
      </v-alert>
    </AppModal>
  </div>
  <v-btn
    v-else
    block
    color="primary"
    prepend-icon="mdi-login"
    class="text-none"
    @click="navigateToLogin"
  >
    {{ t('appbar.login') }}
  </v-btn>
</template>

<style scoped>
.shop-product-card {
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
  border: 1px solid rgb(var(--v-theme-primary), 0.14);
}

.shop-product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 30px rgb(15 23 42 / 20%) !important;
}

.coin-modal-banner {
  background: linear-gradient(
    120deg,
    rgb(var(--v-theme-primary), 0.15),
    rgb(var(--v-theme-surface))
  );
  border: 1px solid rgb(var(--v-theme-primary), 0.2);
}
</style>
