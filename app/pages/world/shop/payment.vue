<script setup lang="ts">
import { useWorldShopStore } from '~/stores/worldShop'

definePageMeta({ title: 'Shop Payment' })
const { shopNavItems } = useShopNavItems()

const route = useRoute()
const orderId = computed(() =>
  typeof route.query.orderId === 'string' ? route.query.orderId : '',
)

const provider = ref<'stripe' | 'adyen' | 'paypal'>('stripe')
const shopStore = useWorldShopStore()
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const selectedOrder = computed(() => shopStore.selectedOrder)
const transaction = computed(() => shopStore.transaction)

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

const paymentStatusLabels: Record<string, string> = {
  pending: 'En attente',
  pending_payment: 'Paiement en attente',
  requires_action: 'Action client requise',
  processing: 'Traitement en cours',
  succeeded: 'Paiement confirmé',
  failed: 'Paiement échoué',
  canceled: 'Paiement annulé',
}

async function refreshOrder() {
  if (!orderId.value) return

  const orders = await shopStore.fetchOrders({ force: true })
  const order = orders.find((entry) => entry.id === orderId.value)
  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order introuvable.',
    })
  }

  shopStore.selectedOrder = order
}

async function createPaymentIntent() {
  if (!orderId.value) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await shopStore.createOrderPaymentIntent(orderId.value, {
      provider: provider.value,
    })
    successMessage.value =
      'Payment intent créé pour la commande. Confirmez ensuite le paiement.'
  } catch (error: any) {
    errorMessage.value =
      error?.statusMessage || 'Échec création payment intent (order payment).'
  } finally {
    loading.value = false
  }
}

async function confirmOrderPayment() {
  if (!orderId.value) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await shopStore.confirmOrderPayment(orderId.value, {
      provider: provider.value,
      transactionId: transaction.value?.id,
    })
    await refreshOrder()
    successMessage.value = 'Paiement confirmé ✅'
  } catch (error: any) {
    errorMessage.value =
      error?.statusMessage || 'Le paiement n’a pas encore été confirmé.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!orderId.value) {
    errorMessage.value =
      'orderId manquant. Lancez le workflow depuis /world/shop/checkout.'
    return
  }

  try {
    await refreshOrder()
  } catch (error: any) {
    errorMessage.value = error?.statusMessage || 'Commande introuvable.'
  }
})
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Shop"
      module-icon="mdi-storefront-outline"
      module-description="Order payment API: payment-intent + payment-confirm + webhook provider."
      :nav-items="shopNavItems"
      action-label="Créer paiement"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-5">
        <h2 class="text-h5 mb-2">Order payment orchestration</h2>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Flux: orderId -> /orders/{orderId}/payment-intent -> /orders/{orderId}/payment-confirm.
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
                :disabled="!orderId"
                @click="createPaymentIntent"
              >
                Créer payment intent (order)
              </v-btn>
            </v-card>

            <v-card variant="outlined" rounded="lg" class="pa-4">
              <h3 class="text-subtitle-1 mb-3">Confirmation</h3>
              <p class="text-body-2 mb-2">
                Le paiement est validé après retour provider + webhook.
              </p>
              <v-btn
                color="success"
                :loading="loading"
                :disabled="!orderId"
                @click="confirmOrderPayment"
              >
                Finaliser paiement commande
              </v-btn>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card variant="outlined" rounded="lg" class="pa-4">
              <h3 class="text-subtitle-1 mb-3">État commande</h3>
              <p class="mb-2">
                Order ID:
                <strong>{{ selectedOrder?.id || orderId || '—' }}</strong>
              </p>
              <p class="mb-2">
                Status:
                <strong>{{ orderStatusLabels[selectedOrder?.status || ''] || selectedOrder?.status || '—' }}</strong>
              </p>
              <p class="mb-2">
                Total:
                <strong
                  >{{ selectedOrder?.amount?.toFixed?.(2) || '0.00' }}
                  {{ selectedOrder?.currency || 'USD' }}</strong
                >
              </p>
            </v-card>

            <v-card variant="outlined" rounded="lg" class="pa-4 mt-4">
              <h3 class="text-subtitle-1 mb-3">Transaction</h3>
              <p class="mb-1">
                Transaction ID: <strong>{{ transaction?.id || '—' }}</strong>
              </p>
              <p class="mb-1">
                Statut:
                <strong>{{ paymentStatusLabels[transaction?.status || ''] || transaction?.status || '—' }}</strong>
              </p>
              <p class="mb-1">
                Provider:
                <strong>{{ transaction?.provider || provider }}</strong>
              </p>
              <p class="mb-0">
                Raison:
                <strong>{{ transaction?.reason || 'aucune' }}</strong>
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
</template>
