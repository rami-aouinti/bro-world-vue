<script setup lang="ts">
import type { ShopGeneralOrder } from '~/types/world/shop'
import { normalizeHttpError } from '~/utils/httpError'
import type { ChannelOption, OrderRecord, OrderStatus, OrderStatusMeta, SalesChannel } from '~/components/Shop/types'

definePageMeta({ layout: 'shop', title: 'world.shop.orders.metaTitle' })

const { t, locale } = useI18n()
const { shopNavItems } = useShopNavItems()
const shopStore = useWorldShopStore()

const statusCatalog = computed<OrderStatusMeta[]>(() => [
  { value: 'all', title: t('world.shop.orders.catalog.status.all'), color: 'grey' },
  { value: 'pending', title: t('world.shop.status.pending'), color: 'amber-darken-2' },
  { value: 'paid', title: t('world.shop.status.paid'), color: 'green-darken-1' },
  { value: 'packed', title: t('world.shop.status.packed'), color: 'indigo' },
  { value: 'shipped', title: t('world.shop.status.shipped'), color: 'blue' },
  { value: 'delivered', title: t('world.shop.status.delivered'), color: 'teal' },
  { value: 'returned', title: t('world.shop.status.returned'), color: 'deep-orange' },
  { value: 'refunded', title: t('world.shop.status.refunded'), color: 'pink-darken-2' },
])

const channelCatalog = computed<ChannelOption[]>(() => [
  { value: 'all', title: t('world.shop.orders.catalog.channel.all') },
  { value: 'web', title: t('world.shop.channel.web') },
  { value: 'mobile', title: t('world.shop.channel.mobile') },
  { value: 'marketplace', title: t('world.shop.channel.marketplace') },
  { value: 'store', title: t('world.shop.channel.store') },
])

const filters = ref({
  search: '',
  status: 'all',
  channel: 'all',
  dateFrom: '',
  dateTo: '',
  amountMin: null as number | null,
  amountMax: null as number | null,
})

const headers = computed(() => [
  { title: t('world.shop.orders.table.order'), key: 'id' },
  { title: t('world.shop.orders.table.customer'), key: 'customer' },
  { title: t('world.shop.orders.table.channel'), key: 'channel' },
  { title: t('world.shop.orders.table.status'), key: 'status' },
  { title: t('world.shop.orders.table.date'), key: 'createdAt' },
  { title: t('world.shop.orders.table.amount'), key: 'amount' },
  { title: t('world.shop.orders.table.refunded'), key: 'refundedAmount' },
  { title: t('world.shop.orders.table.actions'), key: 'actions', sortable: false },
])

const orders = ref<OrderRecord[]>([])
const selectedOrderId = ref('')
const drawerOpen = ref(false)
const returnReason = ref('')
const returnAmount = ref<number | null>(null)
const apiError = ref<string | null>(null)

const formatCurrency = (value: number, currency = 'EUR') =>
  new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

const parseOrderChannel = (order: ShopGeneralOrder): SalesChannel => {
  if (order.id.endsWith('1')) return 'web'
  if (order.id.endsWith('2')) return 'mobile'
  if (order.id.endsWith('3')) return 'marketplace'
  return 'store'
}

const normalizeOrder = (order: ShopGeneralOrder): OrderRecord => ({
  id: order.id,
  customer: t('world.shop.orders.customerLabel', { suffix: order.id.slice(-4) }),
  channel: parseOrderChannel(order),
  status: order.status,
  createdAt: order.createdAt,
  amount: order.amount,
  currency: order.currency,
  refundedAmount: 0,
  timeline: [
    {
      id: `T-${order.id}`,
      status: order.status,
      label: t('world.shop.orders.timeline.initialStatus', {
        status: t(`world.shop.status.${order.status}`),
      }),
      at: order.createdAt,
    },
  ],
  lines: (order.lines ?? []).map((line) => ({
    sku: line.sku ?? line.productId,
    title: line.title,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
  })),
  returns: [],
})

const extractApiMessage = (err: unknown) => {
  const normalized = normalizeHttpError(err)
  if (normalized.statusCode === 400) {
    return t('world.shop.orders.errors.badRequest', { detail: normalized.message })
  }
  if (normalized.statusCode === 404) {
    return t('world.shop.orders.errors.notFound', { detail: normalized.message })
  }
  if (normalized.statusCode === 422) {
    return t('world.shop.orders.errors.invalidData', { detail: normalized.message })
  }
  return t('world.shop.orders.errors.api', { detail: normalized.message })
}

const loadOrders = async () => {
  apiError.value = null
  try {
    const response = await shopStore.fetchOrders({ force: true })
    orders.value = response.map(normalizeOrder)
  } catch (err) {
    apiError.value = extractApiMessage(err)
    orders.value = []
  }
}

onMounted(async () => {
  await loadOrders()
})

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const textNeedle = `${order.id} ${order.customer}`.toLowerCase()
    const matchesSearch = filters.value.search
      ? textNeedle.includes(filters.value.search.toLowerCase())
      : true
    const matchesStatus = filters.value.status === 'all' ? true : order.status === filters.value.status
    const matchesChannel = filters.value.channel === 'all' ? true : order.channel === filters.value.channel

    const orderDateMs = new Date(order.createdAt).getTime()
    const fromMs = filters.value.dateFrom ? new Date(filters.value.dateFrom).getTime() : Number.NEGATIVE_INFINITY
    const toMs = filters.value.dateTo ? new Date(filters.value.dateTo).getTime() : Number.POSITIVE_INFINITY
    const matchesDate = orderDateMs >= fromMs && orderDateMs <= toMs

    const minAmount = filters.value.amountMin ?? Number.NEGATIVE_INFINITY
    const maxAmount = filters.value.amountMax ?? Number.POSITIVE_INFINITY
    const matchesAmount = order.amount >= minAmount && order.amount <= maxAmount

    return matchesSearch && matchesStatus && matchesChannel && matchesDate && matchesAmount
  })
})

const selectedOrder = computed(() => filteredOrders.value.find((item) => item.id === selectedOrderId.value) ?? null)

watch(
  filteredOrders,
  (list) => {
    if (!list.length) {
      selectedOrderId.value = ''
      drawerOpen.value = false
      return
    }

    if (!list.find((order) => order.id === selectedOrderId.value)) {
      selectedOrderId.value = list[0].id
    }
  },
  { immediate: true },
)

const addTimelineEvent = (order: OrderRecord, status: OrderStatus, label: string, note?: string) => {
  order.timeline.push({
    id: `T-${Math.random().toString(36).slice(2, 8)}`,
    status,
    label,
    at: new Date().toISOString(),
    note,
  })
}

const updateOrderStatus = (orderId: string, status: OrderStatus) => {
  const order = orders.value.find((entry) => entry.id === orderId)
  if (!order) return
  order.status = status
  addTimelineEvent(
    order,
    status,
    t('world.shop.orders.timeline.statusChanged', {
      status: t(`world.shop.status.${status}`),
    }),
  )
}

const generateInvoice = (orderId: string) => {
  const order = orders.value.find((entry) => entry.id === orderId)
  if (!order) return

  order.invoiceNumber = `INV-${new Date().getFullYear()}-${order.id.slice(-4)}`
  order.invoiceGeneratedAt = new Date().toISOString()
  addTimelineEvent(
    order,
    order.status,
    t('world.shop.orders.timeline.invoiceGenerated', { invoiceNumber: order.invoiceNumber }),
  )
}

const addReturnRequest = (orderId: string) => {
  const order = orders.value.find((entry) => entry.id === orderId)
  if (!order || !returnReason.value || !returnAmount.value) return

  const amount = Math.max(0, Math.min(returnAmount.value, order.amount - order.refundedAmount))
  order.returns.push({
    id: `RET-${Math.random().toString(36).slice(2, 7)}`,
    reason: returnReason.value,
    amount,
    status: 'requested',
    createdAt: new Date().toISOString(),
  })

  order.status = 'returned'
  addTimelineEvent(
    order,
    'returned',
    t('world.shop.orders.timeline.returnRequested'),
    t('world.shop.orders.timeline.returnRequestedNote', {
      amount: formatCurrency(amount, order.currency),
    }),
  )
  returnReason.value = ''
  returnAmount.value = null
}

const approvePartialRefund = (orderId: string, returnId: string) => {
  const order = orders.value.find((entry) => entry.id === orderId)
  if (!order) return

  const record = order.returns.find((entry) => entry.id === returnId)
  if (!record || record.status === 'refunded') return

  record.status = 'refunded'
  order.refundedAmount = Math.min(order.amount, order.refundedAmount + record.amount)
  order.status = 'refunded'
  addTimelineEvent(
    order,
    'refunded',
    t('world.shop.orders.timeline.partialRefundApproved'),
    t('world.shop.orders.timeline.partialRefundApprovedNote', {
      amount: formatCurrency(record.amount, order.currency),
    }),
  )
}

const resetFilters = () => {
  filters.value = {
    search: '',
    status: 'all',
    channel: 'all',
    dateFrom: '',
    dateTo: '',
    amountMin: null,
    amountMax: null,
  }
}

const exportCsv = () => {
  const lines = [
    ['id', 'customer', 'channel', 'status', 'created_at', 'amount', 'refunded_amount', 'invoice_number'],
    ...filteredOrders.value.map((order) => [
      order.id,
      order.customer,
      order.channel,
      order.status,
      order.createdAt,
      order.amount.toFixed(2),
      order.refundedAmount.toFixed(2),
      order.invoiceNumber || '',
    ]),
  ]

  const csv = lines.map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const onSelectOrder = (orderId: string) => {
  selectedOrderId.value = orderId
  drawerOpen.value = true
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.shop.label')"
      module-icon="mdi-storefront-outline"
      :module-description="t('world.shop.orders.moduleDescription')"
      :nav-items="shopNavItems"
      :action-label="t('world.shop.orders.actionLabel')"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-5">
        <ShopCatalogFilters
          v-model="filters"
          :status-catalog="statusCatalog"
          :channel-catalog="channelCatalog"
          @reset="resetFilters"
          @export="exportCsv"
        >
          <template #heading>
            <div>
              <h2 class="text-h5">{{ t('world.shop.orders.title') }}</h2>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ t('world.shop.orders.subtitle') }}
              </p>
            </div>
          </template>
        </ShopCatalogFilters>

        <v-alert v-if="apiError" type="error" variant="tonal" class="mb-4" closable>
          {{ apiError }}
        </v-alert>

        <v-alert
          v-else-if="!shopStore.pending && !orders.length"
          type="info"
          variant="tonal"
          class="mb-4"
          :text="t('world.shop.orders.empty')"
        />

        <v-row>
          <v-col cols="12">
            <ShopOrdersTable
              :headers="headers"
              :items="filteredOrders"
              :selected-order-id="selectedOrderId"
              :status-catalog="statusCatalog"
              :channel-catalog="channelCatalog"
              :loading="shopStore.pending"
              @select="onSelectOrder"
              @update-status="updateOrderStatus"
              @generate-invoice="generateInvoice"
            />
          </v-col>
        </v-row>
      </v-card>
    </v-container>

    <ShopOrderDetailsDrawer
      v-model="drawerOpen"
      :order="selectedOrder"
      :status-catalog="statusCatalog"
      :channel-catalog="channelCatalog"
      :return-reason="returnReason"
      :return-amount="returnAmount"
      @update:return-reason="returnReason = $event"
      @update:return-amount="returnAmount = $event"
      @generate-invoice="generateInvoice"
      @add-return="addReturnRequest"
      @approve-refund="approvePartialRefund"
    />
  </div>
</template>
