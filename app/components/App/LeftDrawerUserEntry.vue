<script setup lang="ts">
import type { SessionUser } from '~/types/session'

const { t } = useI18n()
const route = useRoute()
const { loggedIn, user } = useUserSession()

const sessionUser = computed(() => user.value as SessionUser | null)
const avatarUrl = computed(() => sessionUser.value?.photo)
const coins = computed(() => sessionUser.value?.coins ?? 0)
const coinModalOpen = ref(false)
const paymentMethod = ref<'stripe' | 'paypal'>('stripe')
const checkoutLoading = ref(false)
const checkoutError = ref('')
const checkoutSuccess = ref('')
const selectedPackageId = ref<string | null>(null)

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
const paymentMethodLabel = computed(() =>
  paymentMethod.value === 'stripe' ? 'Stripe' : 'PayPal',
)
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
  checkoutError.value = ''
  checkoutSuccess.value = ''
  selectedPackageId.value = null
  paymentMethod.value = 'stripe'
  coinModalOpen.value = true
}

function formatPrice(item: CoinPackage) {
  const amount = currency.value === 'EUR' ? item.eurPrice : item.usdPrice
  return `${currencySymbol.value}${amount}`
}

async function startCheckout(item: CoinPackage) {
  checkoutLoading.value = true
  checkoutError.value = ''
  checkoutSuccess.value = ''
  selectedPackageId.value = item.id

  try {
    const response = await $fetch('/api/coins/checkout', {
      method: 'POST',
      body: {
        packageId: item.id,
        paymentMethod: paymentMethod.value,
        coins: item.coins,
        currency: currency.value,
        amount: currency.value === 'EUR' ? item.eurPrice : item.usdPrice,
      },
    })

    if (response.status === 'success') {
      checkoutSuccess.value = `Paiement confirmé via ${paymentMethodLabel.value}.`
      return
    }

    checkoutError.value = response.message || 'Paiement refusé.'
  } catch (error) {
    checkoutError.value
      = error instanceof Error ? error.message : 'Une erreur est survenue.'
  } finally {
    checkoutLoading.value = false
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
          <span>Acheter des coins</span>
          <v-chip size="small" color="primary" variant="tonal">
            Solde actuel: {{ coins }} coins
          </v-chip>
        </v-card-title>

        <v-card-text>
          <p class="text-medium-emphasis mb-4">
            Choisissez un pack puis un paiement Stripe ou PayPal.
          </p>

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

          <v-list class="pa-0" lines="two">
            <v-list-item
              v-for="item in coinPackages"
              :key="item.id"
              :title="`${item.coins} coins`"
              :subtitle="`Paiement ${paymentMethodLabel}`"
              class="px-0"
            >
              <template #append>
                <v-btn
                  color="primary"
                  variant="flat"
                  :loading="checkoutLoading && selectedPackageId === item.id"
                  @click="startCheckout(item)"
                >
                  {{ formatPrice(item) }}
                </v-btn>
              </template>
            </v-list-item>
          </v-list>

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
