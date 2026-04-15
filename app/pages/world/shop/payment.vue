<script setup lang="ts">
import { useWorldShopStore } from '~/stores/worldShop'

definePageMeta({ title: 'Shop Payment' })

type CheckoutStatus =
  | 'draft'
  | 'payment_pending'
  | 'processing'
  | 'paid'
  | 'failed'

type PaymentAttempt = {
  id: string
  provider: 'stripe' | 'adyen' | 'paypal'
  status: 'pending' | 'failed' | 'succeeded'
  reason?: string
  providerPaymentId?: string
  clientSecret?: string
}

type CheckoutSession = {
  id: string
  status: CheckoutStatus
  step: string
  currency: string
  totalAmount: number
  providerPaymentId?: string
  lastError?: string
  attempts: PaymentAttempt[]
}

const route = useRoute()
const checkoutId = computed(() =>
  typeof route.query.checkoutId === 'string' ? route.query.checkoutId : '',
)

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

const provider = ref<'stripe' | 'adyen' | 'paypal'>('stripe')
const shopStore = useWorldShopStore()
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const checkout = computed(() => shopStore.detail as CheckoutSession | null)
const currentAttempt = computed(
  () => shopStore.currentAttempt as PaymentAttempt | null,
)

const buildIdempotencyKey = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

async function refreshCheckout() {
  if (!checkoutId.value) return

  await shopStore.fetchCheckoutById(checkoutId.value)
}

async function createPaymentIntent() {
  if (!checkoutId.value) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await shopStore.createPaymentIntent({
      checkoutId: checkoutId.value,
      provider: provider.value,
      idempotencyKey: buildIdempotencyKey('payment'),
    })
    successMessage.value =
      'Intent créé. Confirmez le paiement côté provider puis finalisez.'
  } catch (error: any) {
    errorMessage.value =
      error?.statusMessage ||
      'Échec création payment intent (timeout/provider).'
  } finally {
    loading.value = false
  }
}

async function finalizeCheckout() {
  if (!checkout.value?.providerPaymentId) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await shopStore.confirmPayment({
      checkoutId: checkout.value.id,
      providerPaymentId: checkout.value.providerPaymentId,
      idempotencyKey: buildIdempotencyKey('confirm'),
    })
    successMessage.value = 'Checkout confirmé ✅'
  } catch (error: any) {
    errorMessage.value =
      error?.statusMessage ||
      'Le webhook provider n’a pas encore confirmé le paiement.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!checkoutId.value) {
    errorMessage.value =
      'checkoutId manquant. Lancez le workflow depuis /world/shop/checkout.'
    return
  }

  try {
    await refreshCheckout()
  } catch (error: any) {
    errorMessage.value = error?.statusMessage || 'Checkout introuvable.'
  }
})
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Shop"
      module-icon="mdi-storefront-outline"
      module-description="Paiement réel Stripe + webhook + protection idempotency."
      :nav-items="shopNavItems"
      action-label="Créer paiement"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-5">
        <h2 class="text-h5 mb-2">Payment orchestration</h2>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Cas gérés: timeout provider, refus paiement, double soumission
          (idempotency key).
        </p>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mb-4"
          >{{ errorMessage }}</v-alert
        >
        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          class="mb-4"
          >{{ successMessage }}</v-alert
        >

        <v-row>
          <v-col cols="12" md="6">
            <v-card variant="outlined" rounded="lg" class="pa-4 mb-4">
              <h3 class="text-subtitle-1 mb-3">Provider</h3>
              <v-select
                v-model="provider"
                :items="[
                  { title: 'Stripe (implémenté)', value: 'stripe' },
                  { title: 'Adyen (à implémenter)', value: 'adyen' },
                  { title: 'PayPal (à implémenter)', value: 'paypal' },
                ]"
                item-title="title"
                item-value="value"
                label="Payment provider"
              />
              <v-btn
                color="primary"
                :loading="loading"
                :disabled="!checkoutId"
                @click="createPaymentIntent"
              >
                Créer payment intent
              </v-btn>
            </v-card>

            <v-card variant="outlined" rounded="lg" class="pa-4">
              <h3 class="text-subtitle-1 mb-3">Confirmation</h3>
              <p class="text-body-2 mb-2">
                Le paiement est validé uniquement après webhook provider.
              </p>
              <v-btn
                color="success"
                :loading="loading"
                :disabled="!checkout?.providerPaymentId"
                @click="finalizeCheckout"
              >
                Finaliser checkout
              </v-btn>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card variant="outlined" rounded="lg" class="pa-4">
              <h3 class="text-subtitle-1 mb-3">État checkout</h3>
              <p class="mb-2">
                Checkout ID:
                <strong>{{ checkout?.id || checkoutId || '—' }}</strong>
              </p>
              <p class="mb-2">
                Status: <strong>{{ checkout?.status || '—' }}</strong>
              </p>
              <p class="mb-2">
                Step: <strong>{{ checkout?.step || '—' }}</strong>
              </p>
              <p class="mb-2">
                Total:
                <strong
                  >{{ checkout?.totalAmount?.toFixed?.(2) || '0.00' }}
                  {{ checkout?.currency || 'USD' }}</strong
                >
              </p>
              <p class="mb-2">
                Provider payment ID:
                <strong>{{ checkout?.providerPaymentId || '—' }}</strong>
              </p>
              <p class="mb-0">
                Dernière erreur:
                <strong>{{ checkout?.lastError || 'aucune' }}</strong>
              </p>
            </v-card>

            <v-card variant="outlined" rounded="lg" class="pa-4 mt-4">
              <h3 class="text-subtitle-1 mb-3">Dernière tentative</h3>
              <p class="mb-1">
                Attempt ID:
                <strong>{{
                  currentAttempt?.id || checkout?.attempts?.[0]?.id || '—'
                }}</strong>
              </p>
              <p class="mb-1">
                Statut:
                <strong>{{
                  currentAttempt?.status ||
                  checkout?.attempts?.[0]?.status ||
                  '—'
                }}</strong>
              </p>
              <p class="mb-1">
                Provider:
                <strong>{{
                  currentAttempt?.provider ||
                  checkout?.attempts?.[0]?.provider ||
                  '—'
                }}</strong>
              </p>
              <p class="mb-0">
                Client secret:
                <code>{{
                  currentAttempt?.clientSecret || 'non retourné'
                }}</code>
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
</template>
