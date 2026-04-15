<script setup lang="ts">
import type { SessionUser } from '~/types/session'

const { t } = useI18n()
const route = useRoute()
const { loggedIn, user } = useUserSession()

const sessionUser = computed(() => user.value as SessionUser | null)
const avatarUrl = computed(() => sessionUser.value?.photo)
const coins = computed(() => sessionUser.value?.coins ?? 0)
const coinModalOpen = ref(false)
const orderLoading = ref(false)
const paymentLoading = ref(false)
const checkoutError = ref('')
const checkoutSuccess = ref('')
const selectedPackageId = ref<string | null>(null)
const paymentMethod = ref<'stripe' | 'paypal' | null>(null)
const checkoutStep = ref<'package' | 'payment' | 'result'>('package')
const currentOrder = ref<{
  orderId: string
  packageId: string
  coins: number
  amount: number
  currency: 'USD' | 'EUR'
  status: string
} | null>(null)

type CoinPackage = {
  id: string
  coins: number
  usdPrice: number
  eurPrice: number
}

const coinPackages: CoinPackage[] = [
  { id: 'starter-500', coins: 500, usdPrice: 2, eurPrice: 2 },
  { id: 'plus-1500', coins: 1500, usdPrice: 5, eurPrice: 5 },
  { id: 'pro-5000', coins: 5000, usdPrice: 15, eurPrice: 14 },
]

const currency = computed(() => {
  const locale = sessionUser.value?.locale?.toLowerCase() || ''
  if (
    locale.startsWith('fr')
    || locale.startsWith('de')
    || locale.startsWith('es')
    || locale.startsWith('it')
  ) {
    return 'EUR'
  }

  return 'USD'
})

const currencySymbol = computed(() => (currency.value === 'EUR' ? '€' : '$'))
const paymentMethodLabel = computed(() => {
  if (paymentMethod.value === 'stripe') return 'Stripe'
  if (paymentMethod.value === 'paypal') return 'PayPal'
  return '-'
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

function openCoinModal() {
  checkoutStep.value = 'package'
  checkoutError.value = ''
  checkoutSuccess.value = ''
  currentOrder.value = null
  selectedPackageId.value = null
  paymentMethod.value = null
  coinModalOpen.value = true
}

function formatPrice(item: CoinPackage) {
  const amount = currency.value === 'EUR' ? item.eurPrice : item.usdPrice
  return `${currencySymbol.value}${amount}`
}

async function createCheckoutOrder(item: CoinPackage) {
  orderLoading.value = true
  checkoutError.value = ''
  checkoutSuccess.value = ''
  selectedPackageId.value = item.id

  try {
    const response = await $fetch('/api/coins/orders', {
      method: 'POST',
      body: {
        packageId: item.id,
        coins: item.coins,
        currency: currency.value,
        amount: currency.value === 'EUR' ? item.eurPrice : item.usdPrice,
      },
    })

    currentOrder.value = response
    checkoutStep.value = 'payment'
  } catch (error) {
    checkoutError.value
      = error instanceof Error
        ? error.message
        : t('appbar.coinCheckout.errors.generic')
  } finally {
    orderLoading.value = false
  }
}

async function processPayment() {
  if (!currentOrder.value || !paymentMethod.value) {
    checkoutError.value = t('appbar.coinCheckout.errors.selectPaymentMethod')
    return
  }

  paymentLoading.value = true
  checkoutError.value = ''
  checkoutSuccess.value = ''

  try {
    const response = await $fetch('/api/coins/checkout/pay', {
      method: 'POST',
      body: {
        orderId: currentOrder.value.orderId,
        paymentMethod: paymentMethod.value,
      },
    })

    if (response.status === 'success') {
      checkoutSuccess.value = t('appbar.coinCheckout.success.paymentConfirmed', {
        method: paymentMethodLabel.value,
      })
      checkoutStep.value = 'result'
      return
    }

    checkoutError.value
      = response.message || t('appbar.coinCheckout.errors.paymentDeclined')
    checkoutStep.value = 'result'
  } catch (error) {
    checkoutError.value
      = error instanceof Error
        ? error.message
        : t('appbar.coinCheckout.errors.generic')
  } finally {
    paymentLoading.value = false
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

    <v-dialog v-model="coinModalOpen" max-width="620">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>{{ t('appbar.coinCheckout.title') }}</span>
          <v-chip size="small" color="primary" variant="tonal">
            {{ t('appbar.coinCheckout.currentBalance', { coins }) }}
          </v-chip>
        </v-card-title>

        <v-card-text>
          <v-window v-model="checkoutStep">
            <v-window-item value="package">
              <p class="text-medium-emphasis mb-4">
                {{ t('appbar.coinCheckout.steps.package') }}
              </p>

              <v-list class="pa-0" lines="two">
                <v-list-item
                  v-for="item in coinPackages"
                  :key="item.id"
                  :title="`${item.coins} coins`"
                  :subtitle="t('appbar.coinCheckout.packageSubtitle')"
                  class="px-0"
                >
                  <template #append>
                    <v-btn
                      color="primary"
                      variant="flat"
                      :loading="orderLoading && selectedPackageId === item.id"
                      @click="createCheckoutOrder(item)"
                    >
                      {{ formatPrice(item) }}
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-window-item>

            <v-window-item value="payment">
              <p class="text-medium-emphasis mb-4">
                {{ t('appbar.coinCheckout.steps.payment') }}
              </p>
              <v-card variant="tonal" class="mb-4">
                <v-card-text class="text-body-2">
                  <div>
                    <strong>{{ t('appbar.coinCheckout.labels.order') }}:</strong>
                    {{ currentOrder?.orderId }}
                  </div>
                  <div>
                    <strong>{{ t('appbar.coinCheckout.labels.pack') }}:</strong>
                    {{ currentOrder?.coins }} coins
                  </div>
                  <div>
                    <strong>{{ t('appbar.coinCheckout.labels.amount') }}:</strong>
                    {{ currencySymbol }}{{ currentOrder?.amount }}
                  </div>
                </v-card-text>
              </v-card>
              <div class="d-flex ga-2 mb-4">
                <v-btn
                  :color="paymentMethod === 'stripe' ? 'primary' : undefined"
                  variant="outlined"
                  prepend-icon="mdi-credit-card-outline"
                  @click="paymentMethod = 'stripe'"
                >
                  Stripe
                </v-btn>
                <v-btn
                  :color="paymentMethod === 'paypal' ? 'primary' : undefined"
                  variant="outlined"
                  prepend-icon="mdi-paypal"
                  @click="paymentMethod = 'paypal'"
                >
                  PayPal
                </v-btn>
              </div>

              <div class="d-flex ga-2">
                <v-btn variant="text" @click="checkoutStep = 'package'">
                  {{ t('common.back') }}
                </v-btn>
                <v-btn
                  color="primary"
                  :loading="paymentLoading"
                  :disabled="!paymentMethod"
                  @click="processPayment"
                >
                  {{ t('appbar.coinCheckout.payNow') }}
                </v-btn>
              </div>
            </v-window-item>

            <v-window-item value="result">
              <p class="text-medium-emphasis">
                {{
                  t('appbar.coinCheckout.steps.result', {
                    orderId: currentOrder?.orderId ?? '-',
                  })
                }}
              </p>
              <v-btn class="mt-2" color="primary" variant="outlined" @click="openCoinModal">
                {{ t('appbar.coinCheckout.newCheckout') }}
              </v-btn>
            </v-window-item>
          </v-window>

          <v-alert
            v-if="checkoutSuccess"
            type="success"
            variant="tonal"
            class="mt-4"
          >
            {{ checkoutSuccess }}
          </v-alert>

          <v-alert
            v-if="checkoutError"
            type="error"
            variant="tonal"
            class="mt-4"
          >
            {{ checkoutError }}
          </v-alert>
        </v-card-text>
      </v-card>
    </v-dialog>
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
