<script setup lang="ts">
import { useWorldShopStore } from '~/stores/worldShop'
import type { WorldShopCheckoutAddress } from '~/types/world/shop'

definePageMeta({ layout: 'shop', title: 'world.shop.checkout.metaTitle' })

const { t, locale } = useI18n()
const { shopNavItems } = useShopNavItems()

const shopStore = useWorldShopStore()
const loading = ref(false)
const errorMessage = ref('')

const shippingMethods = computed(() => [
  { title: t('world.shop.checkout.shippingMethods.standard'), value: 'standard' },
  { title: t('world.shop.checkout.shippingMethods.express'), value: 'express' },
  { title: t('world.shop.checkout.shippingMethods.pickup'), value: 'pickup' },
])

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

const orderStatusLabel = (status?: string) => {
  if (!status) return t('world.shop.common.notAvailable')
  const key = `world.shop.status.${status}`
  return t(key)
}

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

async function createOrderCheckout() {
  if (!cart.value.length) {
    errorMessage.value = t('world.shop.checkout.errors.emptyCart')
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
      error?.statusMessage || t('world.shop.checkout.errors.createOrderFailed')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await shopStore.fetchCart({ force: true })
  } catch (error: any) {
    errorMessage.value =
      error?.statusMessage || t('world.shop.checkout.errors.fetchCartFailed')
  }
})
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.shop.label')"
      module-icon="mdi-storefront-outline"
      :module-description="t('world.shop.checkout.moduleDescription')"
      :nav-items="shopNavItems"
      :action-label="t('world.shop.checkout.actions.createOrder')"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-5">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h2 class="text-h5">{{ t('world.shop.checkout.title') }}</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ t('world.shop.checkout.subtitle') }}
            </p>
          </div>
          <v-btn color="primary" :loading="loading" @click="createOrderCheckout">
            {{ t('world.shop.checkout.actions.createOrder') }}
          </v-btn>
        </div>

        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
          {{ errorMessage }}
        </v-alert>

        <v-row>
          <v-col cols="12" md="7">
            <v-card variant="outlined" rounded="lg" class="pa-4 mb-4">
              <h3 class="text-subtitle-1 mb-3">{{ t('world.shop.checkout.sections.cart') }}</h3>
              <v-table density="comfortable">
                <thead>
                  <tr>
                    <th>{{ t('world.shop.checkout.table.product') }}</th>
                    <th>{{ t('world.shop.checkout.table.quantity') }}</th>
                    <th>{{ t('world.shop.checkout.table.price') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="line in cart" :key="line.productId">
                    <td>{{ line.name }}</td>
                    <td>{{ line.quantity }}</td>
                    <td>{{ formatCurrency(line.unitPrice, checkoutCurrency) }}</td>
                  </tr>
                  <tr v-if="cart.length === 0">
                    <td colspan="3" class="text-medium-emphasis">{{ t('world.shop.checkout.emptyCart') }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>

            <v-card variant="outlined" rounded="lg" class="pa-4 mb-4">
              <h3 class="text-subtitle-1 mb-3">{{ t('world.shop.checkout.sections.contact') }}</h3>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="email" :label="t('world.shop.checkout.fields.email')" type="email" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="phone" :label="t('world.shop.checkout.fields.phone')" />
                </v-col>
                <v-col cols="12" md="6">
                  <AppSelect
                    v-model="shippingMethod"
                    :items="shippingMethods"
                    item-title="title"
                    item-value="value"
                    :label="t('world.shop.checkout.fields.shippingMethod')"
                  />
                </v-col>
                <v-col cols="12" md="6" class="d-flex align-center">
                  <v-checkbox
                    v-model="useSameBillingAddress"
                    :label="t('world.shop.checkout.fields.sameBillingAddress')"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-card>

            <v-card variant="outlined" rounded="lg" class="pa-4 mb-4">
              <h3 class="text-subtitle-1 mb-3">{{ t('world.shop.checkout.sections.shippingAddress') }}</h3>
              <v-row>
                <v-col cols="12" md="6"><v-text-field v-model="shippingAddress.fullName" :label="t('world.shop.checkout.address.fullName')" /></v-col>
                <v-col cols="12"><v-text-field v-model="shippingAddress.line1" :label="t('world.shop.checkout.address.line1')" /></v-col>
                <v-col cols="12"><v-text-field v-model="shippingAddress.line2" :label="t('world.shop.checkout.address.line2')" /></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="shippingAddress.city" :label="t('world.shop.checkout.address.city')" /></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="shippingAddress.state" :label="t('world.shop.checkout.address.state')" /></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="shippingAddress.postalCode" :label="t('world.shop.checkout.address.postalCode')" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="shippingAddress.country" :label="t('world.shop.checkout.address.country')" /></v-col>
              </v-row>
            </v-card>

            <v-card v-if="!useSameBillingAddress" variant="outlined" rounded="lg" class="pa-4">
              <h3 class="text-subtitle-1 mb-3">{{ t('world.shop.checkout.sections.billingAddress') }}</h3>
              <v-row>
                <v-col cols="12" md="6"><v-text-field v-model="billingAddress.fullName" :label="t('world.shop.checkout.address.fullName')" /></v-col>
                <v-col cols="12"><v-text-field v-model="billingAddress.line1" :label="t('world.shop.checkout.address.line1')" /></v-col>
                <v-col cols="12"><v-text-field v-model="billingAddress.line2" :label="t('world.shop.checkout.address.line2')" /></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="billingAddress.city" :label="t('world.shop.checkout.address.city')" /></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="billingAddress.state" :label="t('world.shop.checkout.address.state')" /></v-col>
                <v-col cols="12" md="4"><v-text-field v-model="billingAddress.postalCode" :label="t('world.shop.checkout.address.postalCode')" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="billingAddress.country" :label="t('world.shop.checkout.address.country')" /></v-col>
              </v-row>
            </v-card>
          </v-col>

          <v-col cols="12" md="5">
            <v-card variant="outlined" rounded="lg" class="pa-4">
              <h3 class="text-subtitle-1 mb-3">{{ t('world.shop.checkout.summary.title') }}</h3>
              <p class="mb-2">
                {{ t('world.shop.checkout.summary.lastOrder') }}:
                <strong>{{ selectedOrder?.id || t('world.shop.common.notAvailable') }}</strong>
              </p>
              <p class="mb-2">
                {{ t('world.shop.checkout.summary.status') }}:
                <strong>{{ orderStatusLabel(selectedOrder?.status) }}</strong>
              </p>
              <p class="mb-2">
                {{ t('world.shop.checkout.summary.shippingMethod') }}:
                <strong>{{ t(`world.shop.checkout.shippingMethods.${shippingMethod}`) }}</strong>
              </p>
              <p>
                {{ t('world.shop.checkout.summary.subtotal') }}:
                <strong>{{ formatCurrency(subtotal, checkoutCurrency) }}</strong>
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
</template>
