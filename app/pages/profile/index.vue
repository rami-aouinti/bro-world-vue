<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { ShopProduct, WorldShopCheckoutSession } from '~/types/world/shop'
import type { SessionUser } from '~/types/session'

interface UpcomingCalendarEvent {
  id: string
  title: string
  startAt: string
}

type TransactionState = 'idle' | 'pending' | 'success' | 'failure' | 'cancelled'
type BuyCoinsStep = 'product' | 'confirmation' | 'payment' | 'validation'

interface CoinsReceipt {
  id: string
  createdAt: string
  status: Exclude<TransactionState, 'idle'>
  productName: string
  coinsAmount: number
  amount: number
  currency: string
}

const { t, locale } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()
const { fetch: refreshSession, user } = useUserSession()
const profileStore = useProfileStore()
const shopStore = useWorldShopStore()
const { profile, loading, error } = storeToRefs(profileStore)
const upcomingEvents = ref<UpcomingCalendarEvent[]>([])
const { pending: shopPending } = storeToRefs(shopStore)

const displayedProverbs = ref<string[]>([])
let typingInterval: ReturnType<typeof setInterval> | null = null

const coinProducts = ref<ShopProduct[]>([])
const selectedProductId = ref('')
const checkout = ref<WorldShopCheckoutSession | null>(null)
const selectedProvider = ref<'stripe' | 'paypal'>('stripe')
const transactionState = ref<TransactionState>('idle')
const transactionMessage = ref('')
const buyCoinsStep = ref<BuyCoinsStep>('product')
const receipts = ref<CoinsReceipt[]>([])

const fullName = computed(() => {
  const user = profile.value
  if (!user) {
    return ''
  }

  return (
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username
  )
})

const profileTitle = computed(() => profile.value?.profile?.title || 'Member')
const profileInformation = computed(
  () => profile.value?.profile?.information || '',
)
const proverbTexts = computed(() => [
  t('pages.profile.rightRail.proverbs.0'),
  t('pages.profile.rightRail.proverbs.1'),
  t('pages.profile.rightRail.proverbs.2'),
])

const hasUpcomingEvents = computed(() => upcomingEvents.value.length > 0)
const hasCoinProducts = computed(() => coinProducts.value.length > 0)
const selectedProduct = computed(() =>
  coinProducts.value.find((product) => product.id === selectedProductId.value),
)
const nextEventLabel = computed(() =>
  upcomingEvents.value[0]
    ? t('pages.profile.rightRail.nextEvent', {
        title: upcomingEvents.value[0].title,
      })
    : '',
)
const isBusy = computed(() => loading.value || shopPending.value)
const canConfirmCart = computed(
  () => !!selectedProduct.value && transactionState.value !== 'pending',
)
const canPay = computed(() => {
  if (!checkout.value) {
    return false
  }

  return (
    transactionState.value !== 'pending' &&
    checkout.value.status !== 'failed' &&
    checkout.value.status !== 'paid'
  )
})
const transactionTone = computed<'info' | 'success' | 'error' | 'warning'>(() => {
  if (transactionState.value === 'success') {
    return 'success'
  }

  if (transactionState.value === 'failure') {
    return 'error'
  }

  if (transactionState.value === 'cancelled') {
    return 'warning'
  }

  return 'info'
})
const transactionLabel = computed(() => {
  if (transactionState.value === 'pending') {
    return t('pages.profile.buyCoins.transaction.pending')
  }

  if (transactionState.value === 'success') {
    return t('pages.profile.buyCoins.transaction.success')
  }

  if (transactionState.value === 'failure') {
    return t('pages.profile.buyCoins.transaction.failure')
  }

  if (transactionState.value === 'cancelled') {
    return t('pages.profile.buyCoins.transaction.cancelled')
  }

  return t('pages.profile.buyCoins.transaction.idle')
})
const flowItems = computed(() => [
  { title: t('pages.profile.buyCoins.flow.product'), value: 'product' },
  { title: t('pages.profile.buyCoins.flow.confirmation'), value: 'confirmation' },
  { title: t('pages.profile.buyCoins.flow.payment'), value: 'payment' },
  { title: t('pages.profile.buyCoins.flow.validation'), value: 'validation' },
])
const checkoutAmountLabel = computed(() => {
  const amount = selectedProduct.value?.amount ?? 0
  const currencyCode = selectedProduct.value?.currencyCode || 'USD'
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(amount)
})

function buildIdempotencyKey(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function clearTypewriterTimers() {
  if (typingInterval) {
    clearInterval(typingInterval)
    typingInterval = null
  }
}

function startTypewriter() {
  clearTypewriterTimers()
  displayedProverbs.value = proverbTexts.value.map(() => '')
  const charIndexes = proverbTexts.value.map(() => 0)
  typingInterval = setInterval(() => {
    let hasRemainingChars = false
    proverbTexts.value.forEach((text, index) => {
      const cursor = charIndexes[index] ?? 0
      if (cursor < text.length) {
        displayedProverbs.value[index] =
          (displayedProverbs.value[index] ?? '') + text.charAt(cursor)
        charIndexes[index] = cursor + 1
        hasRemainingChars = true
      }
    })

    if (!hasRemainingChars) {
      clearTypewriterTimers()
    }
  }, 45)
}

function resetTransactionState() {
  transactionState.value = 'idle'
  transactionMessage.value = ''
  checkout.value = null
  buyCoinsStep.value = 'product'
}

async function fetchCoinProducts(force = false) {
  try {
    await shopStore.fetchProducts({
      force,
      filters: { status: 'active', page: 1, limit: 50 },
    })

    const normalizedProducts = (shopStore.items as ShopProduct[]).filter((item) => {
      const category = String(item.category || '').toLowerCase()
      return (
        category.includes('coins') ||
        category.includes('pack coins') ||
        category.includes('packs coins')
      )
    })

    coinProducts.value = normalizedProducts
  } catch {
    coinProducts.value = []
    transactionState.value = 'failure'
    transactionMessage.value = t('pages.profile.buyCoins.messages.productsError')
  }
}

function selectProduct(productId: string) {
  selectedProductId.value = productId
  transactionState.value = 'idle'
  transactionMessage.value = ''
  buyCoinsStep.value = 'confirmation'
}

async function confirmCart() {
  if (!selectedProduct.value) {
    return
  }

  transactionState.value = 'pending'
  transactionMessage.value = t('pages.profile.buyCoins.messages.confirming')
  try {
    const session = await shopStore.createCheckoutSession({
      currency: selectedProduct.value.currencyCode,
      cart: [
        {
          productId: selectedProduct.value.id,
          name: selectedProduct.value.name,
          quantity: 1,
          unitPrice: selectedProduct.value.amount,
        },
      ],
    })
    checkout.value = session
    transactionState.value = 'idle'
    transactionMessage.value = ''
    buyCoinsStep.value = 'payment'
  } catch {
    transactionState.value = 'failure'
    transactionMessage.value = t('pages.profile.buyCoins.messages.confirmError')
  }
}

async function startPayment() {
  if (!checkout.value) {
    return
  }

  transactionState.value = 'pending'
  transactionMessage.value = t('pages.profile.buyCoins.messages.paymentPending')

  try {
    const productSnapshot = selectedProduct.value
    if (!productSnapshot) {
      transactionState.value = 'failure'
      transactionMessage.value = t('pages.profile.buyCoins.messages.paymentFailed')
      return
    }

    const intent = await shopStore.createPaymentIntent({
      checkoutId: checkout.value.id,
      provider: selectedProvider.value,
      idempotencyKey: buildIdempotencyKey('coins_payment'),
    })

    const paymentId =
      intent.attempt.providerPaymentId ||
      intent.checkout.providerPaymentId ||
      `manual_${intent.attempt.id}`

    const confirmedCheckout = await shopStore.confirmPayment({
      checkoutId: intent.checkout.id,
      providerPaymentId: paymentId,
      idempotencyKey: buildIdempotencyKey('coins_confirm'),
    })

    checkout.value = confirmedCheckout
    buyCoinsStep.value = 'validation'

    if (confirmedCheckout.status === 'paid') {
      transactionState.value = 'success'
      transactionMessage.value = t('pages.profile.buyCoins.messages.paymentSuccess')

      await Promise.all([refreshSession(), fetchProfile(true)])
      const sessionUser = user.value as SessionUser | null
      if (typeof sessionUser?.coins === 'number') {
        profileStore.setCoins(sessionUser.coins)
      }

      const nextReceipt: CoinsReceipt = {
        id: confirmedCheckout.id,
        createdAt: new Date().toISOString(),
        status: 'success',
        productName: productSnapshot.name,
        coinsAmount: productSnapshot.coinsAmount,
        amount: confirmedCheckout.totalAmount,
        currency: confirmedCheckout.currency,
      }
      receipts.value = [nextReceipt, ...receipts.value].slice(0, 8)
      return
    }

    if (confirmedCheckout.status === 'failed') {
      transactionState.value = 'failure'
      transactionMessage.value = t('pages.profile.buyCoins.messages.paymentFailed')
      return
    }

    transactionState.value = 'cancelled'
    transactionMessage.value = t('pages.profile.buyCoins.messages.paymentCancelled')
  } catch {
    transactionState.value = 'failure'
    transactionMessage.value = t('pages.profile.buyCoins.messages.paymentFailed')
  }
}

function cancelPurchase() {
  transactionState.value = 'cancelled'
  transactionMessage.value = t('pages.profile.buyCoins.messages.paymentCancelled')
  buyCoinsStep.value = 'validation'
}

function formatReceiptAmount(receipt: CoinsReceipt) {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: receipt.currency,
    maximumFractionDigits: 2,
  }).format(receipt.amount)
}

function formatProductAmount(product: ShopProduct) {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: product.currencyCode,
    maximumFractionDigits: 2,
  }).format(product.amount)
}

async function fetchProfile(force = false) {
  try {
    await profileStore.fetchProfile(force)
  } catch {
    // Error state handled by store.
  }
}

async function fetchUpcomingEvents() {
  try {
    const response = await $fetch<UpcomingCalendarEvent[]>(
      '/api/calendar/events/upcoming',
    )
    upcomingEvents.value = (response || [])
      .slice()
      .sort(
        (first, second) =>
          new Date(first.startAt).getTime() -
          new Date(second.startAt).getTime(),
      )
      .slice(0, 5)
  } catch (fetchError) {
    console.error(fetchError)
    upcomingEvents.value = []
  }
}

definePageMeta({
  title: 'appbar.profile',
  middleware: 'auth',
})

onMounted(async () => {
  await Promise.all([fetchProfile(), fetchUpcomingEvents(), fetchCoinProducts()])
  startTypewriter()
})

watch([proverbTexts, locale], () => {
  startTypewriter()
})

onUnmounted(() => {
  clearTypewriterTimers()
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <v-card-title>{{ t('pages.profile.rightRail.title') }}</v-card-title>
        <v-card-text>
          <p v-if="nextEventLabel" class="text-body-2 mb-3">
            {{ nextEventLabel }}
          </p>
          <p
            v-for="(proverb, index) in displayedProverbs"
            :key="`proverb-${index}`"
            class="text-body-2 text-medium-emphasis mb-2"
          >
            {{ proverb }}
          </p>

          <v-list v-if="hasUpcomingEvents" density="compact" class="pa-0">
            <v-list-item
              v-for="event in upcomingEvents"
              :key="event.id"
              prepend-icon="mdi-calendar-clock-outline"
              :title="event.title"
              :subtitle="new Date(event.startAt).toLocaleString(locale)"
            />
          </v-list>
          <p v-else class="text-body-2 text-medium-emphasis mb-0">
            {{ t('pages.profile.rightRail.emptyUpcoming') }}
          </p>
        </v-card-text>
      </template>
      <template #left>
        <ProfileDrawer />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <SkeletonPageContent v-if="isPageSkeletonVisible && loading" />
      <template v-else>
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
        >
          {{ error }}
        </v-alert>

        <v-card v-if="profile" variant="text" class="postcard-gradient-card">
          <v-card-text
            class="d-flex flex-column flex-md-row ga-4 align-start align-md-center"
          >
            <v-avatar size="84">
              <v-img :src="profile.photo" :alt="fullName" />
            </v-avatar>

            <div class="flex-grow-1">
              <h2 class="text-h5 mb-1">{{ fullName }}</h2>
              <p class="text-body-2 text-medium-emphasis mb-1">
                @{{ profile.username }}
              </p>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ profile.email }}
              </p>
            </div>

            <div class="d-flex flex-wrap ga-2">
              <v-chip color="amber-darken-2" label>
                {{ profile.coins }} coins
              </v-chip>
              <v-chip color="primary" variant="outlined" label>
                {{ profileTitle }}
              </v-chip>
            </div>
          </v-card-text>

          <v-divider />

          <v-card-text>
            <p class="text-body-1 mb-0">
              {{ profileInformation || 'No profile information yet.' }}
            </p>
          </v-card-text>
        </v-card>

        <v-card class="mt-6" rounded="xl">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ t('pages.profile.buyCoins.title') }}</span>
            <v-chip color="amber-darken-2" label>
              {{ t('pages.profile.buyCoins.currentBalance', { coins: profile?.coins ?? 0 }) }}
            </v-chip>
          </v-card-title>
          <v-card-text>
            <p class="text-medium-emphasis mb-4">
              {{ t('pages.profile.buyCoins.subtitle') }}
            </p>

            <v-stepper :model-value="buyCoinsStep" :items="flowItems" class="mb-4" />

            <v-window v-model="buyCoinsStep">
              <v-window-item value="product">
                <v-alert
                  v-if="!hasCoinProducts"
                  type="info"
                  variant="tonal"
                  class="mb-4"
                >
                  {{ t('pages.profile.buyCoins.emptyProducts') }}
                </v-alert>
                <v-list v-else lines="two" class="pa-0">
                  <v-list-item
                    v-for="item in coinProducts"
                    :key="item.id"
                    :title="item.name"
                    :subtitle="`${item.coinsAmount} coins`"
                    class="px-0"
                  >
                    <template #append>
                      <v-btn color="primary" variant="flat" @click="selectProduct(item.id)">
                        {{ formatProductAmount(item) }}
                      </v-btn>
                    </template>
                  </v-list-item>
                </v-list>
              </v-window-item>

              <v-window-item value="confirmation">
                <v-card variant="outlined" rounded="lg" class="pa-4">
                  <h3 class="text-subtitle-1 mb-2">
                    {{ t('pages.profile.buyCoins.confirmationTitle') }}
                  </h3>
                  <p class="mb-1">
                    <strong>{{ t('pages.profile.buyCoins.labels.product') }}:</strong>
                    {{ selectedProduct?.name || '—' }}
                  </p>
                  <p class="mb-1">
                    <strong>{{ t('pages.profile.buyCoins.labels.coins') }}:</strong>
                    {{ selectedProduct?.coinsAmount || 0 }}
                  </p>
                  <p class="mb-4">
                    <strong>{{ t('pages.profile.buyCoins.labels.amount') }}:</strong>
                    {{ checkoutAmountLabel }}
                  </p>
                  <div class="d-flex ga-2">
                    <v-btn variant="text" @click="buyCoinsStep = 'product'">
                      {{ t('common.back') }}
                    </v-btn>
                    <v-btn color="primary" :disabled="!canConfirmCart" :loading="isBusy" @click="confirmCart">
                      {{ t('pages.profile.buyCoins.confirmCart') }}
                    </v-btn>
                  </div>
                </v-card>
              </v-window-item>

              <v-window-item value="payment">
                <v-card variant="outlined" rounded="lg" class="pa-4">
                  <h3 class="text-subtitle-1 mb-3">
                    {{ t('pages.profile.buyCoins.paymentTitle') }}
                  </h3>
                  <v-select
                    v-model="selectedProvider"
                    :items="[
                      { title: 'Stripe', value: 'stripe' },
                      { title: 'PayPal', value: 'paypal' },
                    ]"
                    item-title="title"
                    item-value="value"
                    :label="t('pages.profile.buyCoins.labels.provider')"
                    class="mb-2"
                  />
                  <div class="d-flex ga-2">
                    <v-btn variant="text" @click="buyCoinsStep = 'confirmation'">
                      {{ t('common.back') }}
                    </v-btn>
                    <v-btn color="primary" :disabled="!canPay" :loading="isBusy" @click="startPayment">
                      {{ t('pages.profile.buyCoins.payNow') }}
                    </v-btn>
                    <v-btn color="warning" variant="tonal" :disabled="transactionState === 'pending'" @click="cancelPurchase">
                      {{ t('pages.profile.buyCoins.cancel') }}
                    </v-btn>
                  </div>
                </v-card>
              </v-window-item>

              <v-window-item value="validation">
                <v-card variant="outlined" rounded="lg" class="pa-4">
                  <h3 class="text-subtitle-1 mb-2">
                    {{ t('pages.profile.buyCoins.validationTitle') }}
                  </h3>
                  <p class="mb-3">{{ transactionMessage }}</p>
                  <v-btn color="primary" variant="outlined" @click="resetTransactionState">
                    {{ t('pages.profile.buyCoins.newOrder') }}
                  </v-btn>
                </v-card>
              </v-window-item>
            </v-window>

            <v-alert
              v-if="transactionState !== 'idle'"
              :type="transactionTone"
              variant="tonal"
              class="mt-4"
            >
              {{ transactionLabel }}
              <span v-if="transactionMessage"> — {{ transactionMessage }}</span>
            </v-alert>

            <v-divider class="my-4" />

            <h3 class="text-subtitle-1 mb-2">
              {{ t('pages.profile.buyCoins.historyTitle') }}
            </h3>
            <v-list v-if="receipts.length" lines="two" class="pa-0">
              <v-list-item
                v-for="receipt in receipts"
                :key="receipt.id"
                :title="`${receipt.productName} · +${receipt.coinsAmount} coins`"
                :subtitle="`${new Date(receipt.createdAt).toLocaleString(locale)} · ${formatReceiptAmount(receipt)}`"
              >
                <template #append>
                  <v-chip size="small" :color="receipt.status === 'success' ? 'success' : receipt.status === 'failure' ? 'error' : 'warning'" label>
                    {{ t(`pages.profile.buyCoins.transaction.${receipt.status}`) }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            <p v-else class="text-body-2 text-medium-emphasis mb-0">
              {{ t('pages.profile.buyCoins.emptyHistory') }}
            </p>
          </v-card-text>
        </v-card>
      </template>
    </v-container>
  </div>
</template>
