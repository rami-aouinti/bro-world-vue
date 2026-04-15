<script setup lang="ts">
import { useWorldShopStore } from '~/stores/worldShop'

definePageMeta({ title: 'Shop Checkout' })

type CheckoutStep = 'cart' | 'address' | 'shipping' | 'payment' | 'confirmation'
type CheckoutStatus =
  | 'draft'
  | 'payment_pending'
  | 'processing'
  | 'paid'
  | 'failed'

type CartLine = {
  productId: string
  name: string
  unitPrice: number
  quantity: number
}

type ShippingOption = {
  id: string
  label: string
  carrier: string
  amount: number
  etaDays: number
}

type CheckoutSession = {
  id: string
  step: CheckoutStep
  status: CheckoutStatus
  currency: string
  cart: CartLine[]
  subtotalAmount: number
  shippingAmount: number
  totalAmount: number
  shippingOptions: ShippingOption[]
  selectedShippingId?: string
  providerPaymentId?: string
}

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
const loading = ref(false)
const errorMessage = ref('')
const checkout = computed(() => shopStore.detail as CheckoutSession | null)

const cart = ref<CartLine[]>([
  {
    productId: 'prd-premium-hoodie',
    name: 'Premium Hoodie',
    unitPrice: 79,
    quantity: 1,
  },
  {
    productId: 'prd-starter-pack',
    name: 'Starter Pack',
    unitPrice: 45,
    quantity: 1,
  },
])

const address = reactive({
  fullName: 'John Doe',
  line1: '221B Baker Street',
  line2: '',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'US',
  phone: '+1 555-0100',
})

const selectedShippingId = ref('')

const checkoutSteps = [
  { title: 'Panier', value: 'cart' },
  { title: 'Adresse', value: 'address' },
  { title: 'Shipping', value: 'shipping' },
  { title: 'Paiement', value: 'payment' },
  { title: 'Confirmation', value: 'confirmation' },
]

const activeStep = computed(() => {
  if (!checkout.value) return 'cart'

  if (
    checkout.value.step === 'address' &&
    checkout.value.shippingOptions.length > 0
  )
    return 'shipping'

  return checkout.value.step
})

const subtotal = computed(() =>
  cart.value.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0),
)

const shippingAmount = computed(() => {
  const option = checkout.value?.shippingOptions?.find(
    (item) => item.id === selectedShippingId.value,
  )
  return option?.amount || 0
})

const total = computed(() => subtotal.value + shippingAmount.value)

const buildIdempotencyKey = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

async function createCheckout() {
  loading.value = true
  errorMessage.value = ''

  try {
    await shopStore.createCheckoutSession({
      currency: 'USD',
      cart: cart.value,
    })
  } catch (error: any) {
    errorMessage.value =
      error?.statusMessage || 'Impossible de créer la session checkout.'
  } finally {
    loading.value = false
  }
}

async function saveAddress() {
  if (!checkout.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    await shopStore.saveCheckoutAddress({
      checkoutId: checkout.value.id,
      idempotencyKey: buildIdempotencyKey('address'),
      address,
    })
  } catch (error: any) {
    errorMessage.value = error?.statusMessage || 'Adresse invalide.'
  } finally {
    loading.value = false
  }
}

async function saveShipping() {
  if (!checkout.value || !selectedShippingId.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    const updated = await shopStore.saveCheckoutShipping({
      checkoutId: checkout.value.id,
      idempotencyKey: buildIdempotencyKey('shipping'),
      shippingOptionId: selectedShippingId.value,
    })

    await navigateTo(`/world/shop/payment?checkoutId=${updated.id}`)
  } catch (error: any) {
    errorMessage.value =
      error?.statusMessage || 'Impossible de sauvegarder le shipping.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Shop"
      module-icon="mdi-storefront-outline"
      module-description="Workflow réel panier → adresse → shipping → paiement → confirmation."
      :nav-items="shopNavItems"
      action-label="Créer checkout"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-5">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h2 class="text-h5">Checkout orchestration</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Gestion des erreurs, idempotency keys et handoff vers Stripe.
            </p>
          </div>
          <v-btn color="primary" :loading="loading" @click="createCheckout">
            Démarrer checkout
          </v-btn>
        </div>

        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <v-stepper
          :model-value="activeStep"
          :items="checkoutSteps"
          class="mb-4"
        />

        <v-row>
          <v-col cols="12" md="7">
            <v-card variant="outlined" rounded="lg" class="pa-4 mb-4">
              <h3 class="text-subtitle-1 mb-3">1) Panier</h3>
              <v-table density="comfortable">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Qté</th>
                    <th>Prix</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="line in cart" :key="line.productId">
                    <td>{{ line.name }}</td>
                    <td>{{ line.quantity }}</td>
                    <td>${{ line.unitPrice.toFixed(2) }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>

            <v-card variant="outlined" rounded="lg" class="pa-4 mb-4">
              <h3 class="text-subtitle-1 mb-3">2) Adresse</h3>
              <v-row>
                <v-col cols="12" md="6"
                  ><v-text-field v-model="address.fullName" label="Nom complet"
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field v-model="address.phone" label="Téléphone"
                /></v-col>
                <v-col cols="12"
                  ><v-text-field v-model="address.line1" label="Adresse"
                /></v-col>
                <v-col cols="12"
                  ><v-text-field v-model="address.line2" label="Complément"
                /></v-col>
                <v-col cols="12" md="4"
                  ><v-text-field v-model="address.city" label="Ville"
                /></v-col>
                <v-col cols="12" md="4"
                  ><v-text-field v-model="address.state" label="État"
                /></v-col>
                <v-col cols="12" md="4"
                  ><v-text-field
                    v-model="address.postalCode"
                    label="Code postal"
                /></v-col>
              </v-row>
              <v-btn
                color="secondary"
                :disabled="!checkout"
                :loading="loading"
                @click="saveAddress"
              >
                Valider adresse
              </v-btn>
            </v-card>

            <v-card variant="outlined" rounded="lg" class="pa-4">
              <h3 class="text-subtitle-1 mb-3">3) Shipping</h3>
              <v-radio-group
                v-model="selectedShippingId"
                :disabled="!checkout?.shippingOptions?.length"
              >
                <v-radio
                  v-for="option in checkout?.shippingOptions || []"
                  :key="option.id"
                  :value="option.id"
                  :label="`${option.label} (${option.carrier}) - $${option.amount.toFixed(2)} - ${option.etaDays}j`"
                />
              </v-radio-group>
              <v-btn
                color="primary"
                :disabled="!selectedShippingId"
                :loading="loading"
                @click="saveShipping"
              >
                Continuer vers paiement
              </v-btn>
            </v-card>
          </v-col>

          <v-col cols="12" md="5">
            <v-card variant="outlined" rounded="lg" class="pa-4">
              <h3 class="text-subtitle-1 mb-3">Résumé</h3>
              <p class="mb-2">
                Checkout ID: <strong>{{ checkout?.id || '—' }}</strong>
              </p>
              <p class="mb-2">
                Status: <strong>{{ checkout?.status || 'draft' }}</strong>
              </p>
              <p class="mb-2">
                Subtotal: <strong>${{ subtotal.toFixed(2) }}</strong>
              </p>
              <p class="mb-2">
                Shipping: <strong>${{ shippingAmount.toFixed(2) }}</strong>
              </p>
              <p>
                Total: <strong>${{ total.toFixed(2) }}</strong>
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
</template>
