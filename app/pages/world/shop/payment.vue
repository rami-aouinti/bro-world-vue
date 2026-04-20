<script setup lang="ts">
import { useWorldShopStore } from '~/stores/worldShop'

definePageMeta({ layout: 'shop', title: 'world.shop.payment.metaTitle' })
const { t, locale } = useI18n()
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

const providerOptions = computed(() => [
  { title: t('world.shop.payment.providers.stripe'), value: 'stripe' },
  { title: t('world.shop.payment.providers.adyen'), value: 'adyen' },
  { title: t('world.shop.payment.providers.paypal'), value: 'paypal' },
])

const orderStatusLabel = (status?: string) => {
  if (!status) return t('world.shop.common.notAvailable')
  return t(`world.shop.status.${status}`)
}

const paymentStatusLabel = (status?: string) => {
  if (!status) return t('world.shop.common.notAvailable')
  return t(`world.shop.payment.status.${status}`)
}

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

async function refreshOrder() {
  if (!orderId.value) return

  const orders = await shopStore.fetchOrders({ force: true })
  const order = orders.find((entry) => entry.id === orderId.value)
  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: t('world.shop.payment.errors.orderNotFound'),
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
    successMessage.value = t('world.shop.payment.success.intentCreated')
  } catch (error: any) {
    errorMessage.value =
      error?.statusMessage || t('world.shop.payment.errors.intentFailed')
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
    successMessage.value = t('world.shop.payment.success.paymentConfirmed')
  } catch (error: any) {
    errorMessage.value =
      error?.statusMessage || t('world.shop.payment.errors.confirmFailed')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!orderId.value) {
    errorMessage.value = t('world.shop.payment.errors.missingOrderId')
    return
  }

  try {
    await refreshOrder()
  } catch (error: any) {
    errorMessage.value = error?.statusMessage || t('world.shop.payment.errors.orderNotFound')
  }
})
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.shop.label')"
      module-icon="mdi-storefront-outline"
      :module-description="t('world.shop.payment.moduleDescription')"
      :nav-items="shopNavItems"
      :action-label="t('world.shop.payment.actions.createPayment')"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-5">
        <h2 class="text-h5 mb-2">{{ t('world.shop.payment.title') }}</h2>
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ t('world.shop.payment.subtitle') }}
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
              <h3 class="text-subtitle-1 mb-3">{{ t('world.shop.payment.sections.provider') }}</h3>
              <v-select
                v-model="provider"
                :items="providerOptions"
                item-title="title"
                item-value="value"
                :label="t('world.shop.payment.fields.provider')"
              />
              <v-btn
                color="primary"
                :loading="loading"
                :disabled="!orderId"
                @click="createPaymentIntent"
              >
                {{ t('world.shop.payment.actions.createIntent') }}
              </v-btn>
            </v-card>

            <v-card variant="outlined" rounded="lg" class="pa-4">
              <h3 class="text-subtitle-1 mb-3">{{ t('world.shop.payment.sections.confirmation') }}</h3>
              <p class="text-body-2 mb-2">
                {{ t('world.shop.payment.confirmationHint') }}
              </p>
              <v-btn
                color="success"
                :loading="loading"
                :disabled="!orderId"
                @click="confirmOrderPayment"
              >
                {{ t('world.shop.payment.actions.confirmPayment') }}
              </v-btn>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card variant="outlined" rounded="lg" class="pa-4">
              <h3 class="text-subtitle-1 mb-3">{{ t('world.shop.payment.sections.orderState') }}</h3>
              <p class="mb-2">
                {{ t('world.shop.payment.summary.orderId') }}:
                <strong>{{ selectedOrder?.id || orderId || t('world.shop.common.notAvailable') }}</strong>
              </p>
              <p class="mb-2">
                {{ t('world.shop.payment.summary.status') }}:
                <strong>{{ orderStatusLabel(selectedOrder?.status) }}</strong>
              </p>
              <p class="mb-2">
                {{ t('world.shop.payment.summary.total') }}:
                <strong>{{ formatCurrency(selectedOrder?.amount || 0, selectedOrder?.currency || 'USD') }}</strong>
              </p>
            </v-card>

            <v-card variant="outlined" rounded="lg" class="pa-4 mt-4">
              <h3 class="text-subtitle-1 mb-3">{{ t('world.shop.payment.sections.transaction') }}</h3>
              <p class="mb-1">
                {{ t('world.shop.payment.transaction.id') }}:
                <strong>{{ transaction?.id || t('world.shop.common.notAvailable') }}</strong>
              </p>
              <p class="mb-1">
                {{ t('world.shop.payment.transaction.status') }}:
                <strong>{{ paymentStatusLabel(transaction?.status) }}</strong>
              </p>
              <p class="mb-1">
                {{ t('world.shop.payment.transaction.provider') }}:
                <strong>{{ transaction?.provider || provider }}</strong>
              </p>
              <p class="mb-0">
                {{ t('world.shop.payment.transaction.reason') }}:
                <strong>{{ transaction?.reason || t('world.shop.payment.transaction.none') }}</strong>
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
</template>
