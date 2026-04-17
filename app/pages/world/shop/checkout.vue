<script setup lang="ts">
import { useWorldShopStore } from '~/stores/worldShop'
import type { ShopGeneralCheckoutSession } from '~/types/world/shop'

definePageMeta({ title: 'Shop Checkout' })
const { shopNavItems } = useShopNavItems()

type CartLine = {
  productId: string
  name: string
  unitPrice: number
  quantity: number
  lineTotal?: number
}

type ShopCartApiItem = {
  id?: string
  productId: string
  quantity: number
  unitPriceSnapshot?: number
  lineTotal?: number
  product?: {
    name?: string
  }
}

type ShopCartApiResponse = {
  id?: string
  currency?: string
  currencyCode?: string
  items?: ShopCartApiItem[]
  cart?: ShopCartApiItem[]
  subtotal?: number
  subtotalAmount?: number
}

const shopStore = useWorldShopStore()
const loading = ref(false)
const errorMessage = ref('')
const checkout = computed(
  () => shopStore.detail as ShopGeneralCheckoutSession | null,
)
const cartPayload = computed(() => shopStore.cart as ShopCartApiResponse | null)
const cart = computed<CartLine[]>(() => {
  const payload = cartPayload.value
  if (!payload) return []
  const lines = Array.isArray(payload.items)
    ? payload.items
    : Array.isArray(payload.cart)
      ? payload.cart
      : []

  return lines.map((line) => ({
    productId: line.productId,
    name: line.product?.name || line.productId,
    unitPrice: Number(line.unitPriceSnapshot || 0),
    quantity: Number(line.quantity || 0),
    lineTotal: Number(line.lineTotal || 0),
  }))
})
const checkoutCurrency = computed(
  () => cartPayload.value?.currencyCode || cartPayload.value?.currency || 'EUR',
)

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

const subtotal = computed(() => {
  if (typeof cartPayload.value?.subtotal === 'number')
    return cartPayload.value.subtotal
  if (typeof cartPayload.value?.subtotalAmount === 'number')
    return cartPayload.value.subtotalAmount

  return cart.value.reduce(
    (sum, line) =>
      sum +
      (typeof line.lineTotal === 'number'
        ? line.lineTotal
        : line.quantity * line.unitPrice),
    0,
  )
})

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
  if (!cart.value.length) {
    errorMessage.value =
      'Panier vide. Ajoutez des produits avant de lancer checkout.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    await shopStore.createCheckoutSession({
      currency: checkoutCurrency.value,
      cart: cart.value.map((line) => ({
        productId: line.productId,
        name: line.name,
        unitPrice: line.unitPrice,
        quantity: line.quantity,
      })),
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

onMounted(async () => {
  try {
    await shopStore.fetchCart()
  } catch (error: any) {
    errorMessage.value =
      error?.statusMessage || 'Impossible de récupérer le panier pour checkout.'
  }
})
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
                    <td>
                      {{
                        new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: checkoutCurrency,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(line.unitPrice)
                      }}
                    </td>
                  </tr>
                  <tr v-if="cart.length === 0">
                    <td colspan="3" class="text-medium-emphasis">
                      Panier vide.
                    </td>
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
                  :label="`${option.label} (${option.carrier}) - ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: checkoutCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(option.amount)} - ${option.etaDays}j`"
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
                Subtotal:
                <strong>{{
                  new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: checkoutCurrency,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(subtotal)
                }}</strong>
              </p>
              <p class="mb-2">
                Shipping:
                <strong>{{
                  new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: checkoutCurrency,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(shippingAmount)
                }}</strong>
              </p>
              <p>
                Total:
                <strong>{{
                  new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: checkoutCurrency,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(total)
                }}</strong>
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
</template>
