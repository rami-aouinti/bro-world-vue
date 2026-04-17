<script setup lang="ts">
import { useWorldShopStore } from '~/stores/worldShop'
import type { WorldShopCheckoutAddress } from '~/types/world/shop'

definePageMeta({ title: 'Shop Checkout' })
const { shopNavItems } = useShopNavItems()

const shopStore = useWorldShopStore()
const loading = ref(false)
const errorMessage = ref('')

const shippingMethods = [
  { title: 'Standard', value: 'standard' },
  { title: 'Express', value: 'express' },
  { title: 'Pickup', value: 'pickup' },
]

const orderStatusLabels: Record<string, string> = {
  pending: 'Commande créée',
  pending_payment: 'Paiement en attente',
  paid: 'Payée',
  packed: 'Préparée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  returned: 'Retournée',
  refunded: 'Remboursée',
  failed: 'Échec',
  cancelled: 'Annulée',
}

const cartPayload = computed(() => shopStore.cart)
const selectedOrder = computed(() => shopStore.selectedOrder)

const checkoutCurrency = computed(
  () => cartPayload.value?.currencyCode || cartPayload.value?.currency || 'EUR',
)

const cart = computed(() => {
  const payload = cartPayload.value
  if (!payload) return []

  return (payload.items || payload.cart || []).map((line) => ({
    productId: line.productId,
    name: line.product?.name || line.name || line.productId,
    unitPrice: Number(line.unitPriceSnapshot || line.unitPrice || 0),
    quantity: Number(line.quantity || 0),
    lineTotal: Number(line.lineTotal || 0),
  }))
})

const subtotal = computed(() => {
  if (typeof cartPayload.value?.subtotalAmount === 'number') {
    return cartPayload.value.subtotalAmount
  }

  return cart.value.reduce(
    (sum, line) => sum + (line.lineTotal || line.quantity * line.unitPrice),
    0,
  )
})

const shippingMethod = ref('standard')
const email = ref('john.doe@example.com')
const phone = ref('+1 555-0100')
const useSameBillingAddress = ref(true)

const defaultAddress: WorldShopCheckoutAddress = {
  fullName: 'John Doe',
  line1: '221B Baker Street',
  line2: '',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'US',
  phone: '+1 555-0100',
}

const shippingAddress = reactive<WorldShopCheckoutAddress>({ ...defaultAddress })
const billingAddress = reactive<WorldShopCheckoutAddress>({ ...defaultAddress })

watch(useSameBillingAddress, (same) => {
  if (same) Object.assign(billingAddress, shippingAddress)
})

watch(
  shippingAddress,
  () => {
    if (useSameBillingAddress.value) Object.assign(billingAddress, shippingAddress)
  },
  { deep: true },
)

const buildRequestId = () =>
  `checkout_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

async function createOrderCheckout() {
  if (!cart.value.length) {
    errorMessage.value = 'Panier vide. Ajoutez des produits avant checkout.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const order = await shopStore.checkout(
      {
        billingAddress: { ...billingAddress, phone: phone.value },
        shippingAddress: { ...shippingAddress, phone: phone.value },
        email: email.value,
        phone: phone.value,
        shippingMethod: shippingMethod.value,
      },
      buildRequestId(),
    )

    await navigateTo(`/world/shop/payment?orderId=${order.id}`)
  } catch (error: any) {
    errorMessage.value =
      error?.statusMessage || 'Impossible de créer la commande checkout.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await shopStore.fetchCart({ force: true })
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
      module-description="Flux API: cart -> POST /checkout/{shopId} -> order -> payment intent -> payment confirm."
      :nav-items="shopNavItems"
      action-label="Créer commande"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-5">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h2 class="text-h5">Checkout API (order-first)</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Le payload checkout envoie billing/shipping + contact + méthode de livraison.
            </p>
          </div>
          <v-btn color="primary" :loading="loading" @click="createOrderCheckout">
            Créer la commande
          </v-btn>
        </div>

        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
        </v-alert>

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
                    <td colspan="3" class="text-medium-emphasis">Panier vide.</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>

            <v-card variant="outlined" rounded="lg" class="pa-4 mb-4">
              <h3 class="text-subtitle-1 mb-3">2) Contact & shipping method</h3>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="email" label="Email" type="email" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="phone" label="Téléphone" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="shippingMethod"
                    :items="shippingMethods"
                    item-title="title"
                    item-value="value"
                    label="Shipping method"
                  />
                </v-col>
                <v-col cols="12" md="6" class="d-flex align-center">
                  <v-checkbox
                    v-model="useSameBillingAddress"
                    label="Adresse de facturation identique"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-card>

            <v-card variant="outlined" rounded="lg" class="pa-4 mb-4">
              <h3 class="text-subtitle-1 mb-3">3) Shipping address</h3>
              <v-row>
                <v-col cols="12" md="6"><v-text-field v-model="shippingAddress.fullName" label="Nom complet" /></v-col>
                <v-col cols="12"><v-text-field v-model="shippingAddress.line1" label="Adresse" /></v-col>
                <v-col cols="12"><v-text-field v-model="shippingAddress.line2" label="Complément" /></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="shippingAddress.city" label="Ville" /></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="shippingAddress.state" label="État" /></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="shippingAddress.postalCode" label="Code postal" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="shippingAddress.country" label="Pays" /></v-col>
              </v-row>
            </v-card>

            <v-card v-if="!useSameBillingAddress" variant="outlined" rounded="lg" class="pa-4">
              <h3 class="text-subtitle-1 mb-3">4) Billing address</h3>
              <v-row>
                <v-col cols="12" md="6"><v-text-field v-model="billingAddress.fullName" label="Nom complet" /></v-col>
                <v-col cols="12"><v-text-field v-model="billingAddress.line1" label="Adresse" /></v-col>
                <v-col cols="12"><v-text-field v-model="billingAddress.line2" label="Complément" /></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="billingAddress.city" label="Ville" /></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="billingAddress.state" label="État" /></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="billingAddress.postalCode" label="Code postal" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="billingAddress.country" label="Pays" /></v-col>
              </v-row>
            </v-card>
          </v-col>

          <v-col cols="12" md="5">
            <v-card variant="outlined" rounded="lg" class="pa-4">
              <h3 class="text-subtitle-1 mb-3">Résumé</h3>
              <p class="mb-2">
                Dernière commande: <strong>{{ selectedOrder?.id || '—' }}</strong>
              </p>
              <p class="mb-2">
                Statut:
                <strong>{{ orderStatusLabels[selectedOrder?.status || ''] || selectedOrder?.status || '—' }}</strong>
              </p>
              <p class="mb-2">
                Shipping method: <strong>{{ shippingMethod }}</strong>
              </p>
              <p>
                Subtotal:
                <strong>{{ new Intl.NumberFormat('fr-FR', { style: 'currency', currency: checkoutCurrency }).format(subtotal) }}</strong>
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
</template>
