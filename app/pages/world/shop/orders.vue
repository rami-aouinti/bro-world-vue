<script setup lang="ts">
definePageMeta({ title: 'Shop Orders' })

type OrderStatus = 'pending' | 'paid' | 'packed' | 'shipped' | 'delivered' | 'returned' | 'refunded'
type SalesChannel = 'web' | 'mobile' | 'marketplace' | 'store'

type OrderTimelineEvent = {
  id: string
  status: OrderStatus
  label: string
  at: string
  note?: string
}

type OrderLine = {
  sku: string
  title: string
  quantity: number
  unitPrice: number
}

type ReturnRecord = {
  id: string
  reason: string
  amount: number
  status: 'requested' | 'approved' | 'rejected' | 'refunded'
  createdAt: string
}

type OrderRecord = {
  id: string
  customer: string
  channel: SalesChannel
  status: OrderStatus
  createdAt: string
  amount: number
  currency: 'EUR'
  timeline: OrderTimelineEvent[]
  lines: OrderLine[]
  returns: ReturnRecord[]
  refundedAmount: number
  invoiceNumber?: string
  invoiceGeneratedAt?: string
}

const shopNavItems = [
  { title: 'Overview Shop', to: '/world/shop', icon: 'mdi-view-dashboard-outline' },
  { title: 'Categories', to: '/world/shop/categories', icon: 'mdi-shape-outline' },
  { title: 'Products', to: '/world/shop/products', icon: 'mdi-package-variant-closed' },
  { title: 'Checkout', to: '/world/shop/checkout', icon: 'mdi-cart-outline' },
  { title: 'Payment', to: '/world/shop/payment', icon: 'mdi-credit-card-outline' },
  { title: 'Orders', to: '/world/shop/orders', icon: 'mdi-receipt-text-outline' },
  { title: 'Admin', to: '/world/shop/admin', icon: 'mdi-shield-crown-outline', rootOnly: true },
]

const statusCatalog: { value: OrderStatus | 'all', title: string, color: string }[] = [
  { value: 'all', title: 'Tous', color: 'grey' },
  { value: 'pending', title: 'Pending', color: 'amber-darken-2' },
  { value: 'paid', title: 'Paid', color: 'green-darken-1' },
  { value: 'packed', title: 'Packed', color: 'indigo' },
  { value: 'shipped', title: 'Shipped', color: 'blue' },
  { value: 'delivered', title: 'Delivered', color: 'teal' },
  { value: 'returned', title: 'Returned', color: 'deep-orange' },
  { value: 'refunded', title: 'Refunded', color: 'pink-darken-2' },
]

const channelCatalog: { value: SalesChannel | 'all', title: string }[] = [
  { value: 'all', title: 'Tous canaux' },
  { value: 'web', title: 'Web' },
  { value: 'mobile', title: 'Mobile App' },
  { value: 'marketplace', title: 'Marketplace' },
  { value: 'store', title: 'Retail Store' },
]

const orders = ref<OrderRecord[]>([
  {
    id: 'ORD-2026-1001',
    customer: 'Lina Martin',
    channel: 'web',
    status: 'pending',
    createdAt: '2026-04-12',
    amount: 189,
    currency: 'EUR',
    refundedAmount: 0,
    timeline: [
      { id: 'T-1', status: 'pending', label: 'Commande créée', at: '2026-04-12T09:10:00Z' },
    ],
    lines: [
      { sku: 'SKU-HOOD-01', title: 'Premium Hoodie', quantity: 1, unitPrice: 89 },
      { sku: 'SKU-CAP-02', title: 'BroWorld Cap', quantity: 2, unitPrice: 50 },
    ],
    returns: [],
  },
  {
    id: 'ORD-2026-1002',
    customer: 'Noah Bernard',
    channel: 'mobile',
    status: 'shipped',
    createdAt: '2026-04-09',
    amount: 320,
    currency: 'EUR',
    refundedAmount: 0,
    timeline: [
      { id: 'T-2', status: 'pending', label: 'Commande créée', at: '2026-04-09T08:00:00Z' },
      { id: 'T-3', status: 'paid', label: 'Paiement confirmé', at: '2026-04-09T08:05:00Z' },
      { id: 'T-4', status: 'packed', label: 'Colis préparé', at: '2026-04-09T11:30:00Z' },
      { id: 'T-5', status: 'shipped', label: 'Expédié', at: '2026-04-10T06:45:00Z' },
    ],
    lines: [
      { sku: 'SKU-JKT-11', title: 'Limited Jacket', quantity: 1, unitPrice: 220 },
      { sku: 'SKU-STK-07', title: 'Sticker Pack', quantity: 5, unitPrice: 20 },
    ],
    returns: [],
    invoiceNumber: 'INV-2026-4011',
    invoiceGeneratedAt: '2026-04-09T08:06:00Z',
  },
  {
    id: 'ORD-2026-1003',
    customer: 'Maya Dupont',
    channel: 'marketplace',
    status: 'refunded',
    createdAt: '2026-04-01',
    amount: 145,
    currency: 'EUR',
    refundedAmount: 65,
    timeline: [
      { id: 'T-6', status: 'pending', label: 'Commande créée', at: '2026-04-01T10:12:00Z' },
      { id: 'T-7', status: 'paid', label: 'Paiement confirmé', at: '2026-04-01T10:14:00Z' },
      { id: 'T-8', status: 'packed', label: 'Colis préparé', at: '2026-04-01T15:00:00Z' },
      { id: 'T-9', status: 'shipped', label: 'Expédié', at: '2026-04-02T05:00:00Z' },
      { id: 'T-10', status: 'delivered', label: 'Livré', at: '2026-04-04T12:30:00Z' },
      { id: 'T-11', status: 'returned', label: 'Retour validé', at: '2026-04-08T16:00:00Z' },
      { id: 'T-12', status: 'refunded', label: 'Remboursement partiel', at: '2026-04-09T08:20:00Z', note: '65€ remboursés' },
    ],
    lines: [
      { sku: 'SKU-TSH-09', title: 'Essential Tee', quantity: 2, unitPrice: 40 },
      { sku: 'SKU-SCK-01', title: 'Socks Duo', quantity: 1, unitPrice: 65 },
    ],
    returns: [
      { id: 'RET-901', reason: 'Taille incorrecte', amount: 65, status: 'refunded', createdAt: '2026-04-08T15:55:00Z' },
    ],
    invoiceNumber: 'INV-2026-3902',
    invoiceGeneratedAt: '2026-04-01T10:16:00Z',
  },
])

const filters = reactive({
  search: '',
  status: 'all' as OrderStatus | 'all',
  channel: 'all' as SalesChannel | 'all',
  dateFrom: '',
  dateTo: '',
  amountMin: null as number | null,
  amountMax: null as number | null,
})

const headers = [
  { title: 'Commande', key: 'id' },
  { title: 'Client', key: 'customer' },
  { title: 'Canal', key: 'channel' },
  { title: 'Statut', key: 'status' },
  { title: 'Date', key: 'createdAt' },
  { title: 'Montant', key: 'amount' },
  { title: 'Remboursé', key: 'refundedAmount' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const selectedOrderId = ref(orders.value[0]?.id || '')
const returnReason = ref('')
const returnAmount = ref<number | null>(null)

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const textNeedle = `${order.id} ${order.customer}`.toLowerCase()
    const matchesSearch = filters.search ? textNeedle.includes(filters.search.toLowerCase()) : true
    const matchesStatus = filters.status === 'all' ? true : order.status === filters.status
    const matchesChannel = filters.channel === 'all' ? true : order.channel === filters.channel

    const orderDateMs = new Date(order.createdAt).getTime()
    const fromMs = filters.dateFrom ? new Date(filters.dateFrom).getTime() : Number.NEGATIVE_INFINITY
    const toMs = filters.dateTo ? new Date(filters.dateTo).getTime() : Number.POSITIVE_INFINITY
    const matchesDate = orderDateMs >= fromMs && orderDateMs <= toMs

    const minAmount = filters.amountMin ?? Number.NEGATIVE_INFINITY
    const maxAmount = filters.amountMax ?? Number.POSITIVE_INFINITY
    const matchesAmount = order.amount >= minAmount && order.amount <= maxAmount

    return matchesSearch && matchesStatus && matchesChannel && matchesDate && matchesAmount
  })
})

const selectedOrder = computed(() => filteredOrders.value.find(order => order.id === selectedOrderId.value) || filteredOrders.value[0] || null)

watch(filteredOrders, (list) => {
  if (!list.length) {
    selectedOrderId.value = ''
    return
  }

  if (!list.find(order => order.id === selectedOrderId.value))
    selectedOrderId.value = list[0].id
}, { immediate: true })

const getStatusMeta = (status: OrderStatus) => {
  return statusCatalog.find(item => item.value === status) || statusCatalog[0]
}

const currencyFormat = (value: number) => `${value.toFixed(2)} €`

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
  const order = orders.value.find(item => item.id === orderId)
  if (!order)
    return

  order.status = status
  const statusLabel = getStatusMeta(status).title
  addTimelineEvent(order, status, `Statut modifié: ${statusLabel}`)
}

const generateInvoice = (orderId: string) => {
  const order = orders.value.find(item => item.id === orderId)
  if (!order)
    return

  const suffix = order.id.split('-').slice(-1)[0]
  order.invoiceNumber = `INV-2026-${suffix}`
  order.invoiceGeneratedAt = new Date().toISOString()
  addTimelineEvent(order, order.status, `Facture générée (${order.invoiceNumber})`)
}

const addReturnRequest = (orderId: string) => {
  const order = orders.value.find(item => item.id === orderId)
  if (!order || !returnReason.value || !returnAmount.value)
    return

  const amount = Math.max(0, Math.min(returnAmount.value, order.amount - order.refundedAmount))
  order.returns.push({
    id: `RET-${Math.random().toString(36).slice(2, 7)}`,
    reason: returnReason.value,
    amount,
    status: 'requested',
    createdAt: new Date().toISOString(),
  })

  order.status = 'returned'
  addTimelineEvent(order, 'returned', 'Demande de retour enregistrée', `${amount.toFixed(2)} € demandés`)

  returnReason.value = ''
  returnAmount.value = null
}

const approvePartialRefund = (orderId: string, returnId: string) => {
  const order = orders.value.find(item => item.id === orderId)
  if (!order)
    return

  const record = order.returns.find(item => item.id === returnId)
  if (!record)
    return

  if (record.status === 'refunded')
    return

  record.status = 'refunded'
  order.refundedAmount = Math.min(order.amount, order.refundedAmount + record.amount)
  order.status = 'refunded'
  addTimelineEvent(order, 'refunded', `Remboursement partiel validé`, `${record.amount.toFixed(2)} € remboursés`)
}

const resetFilters = () => {
  filters.search = ''
  filters.status = 'all'
  filters.channel = 'all'
  filters.dateFrom = ''
  filters.dateTo = ''
  filters.amountMin = null
  filters.amountMax = null
}

const exportCsv = () => {
  const lines = [
    ['id', 'customer', 'channel', 'status', 'created_at', 'amount', 'refunded_amount', 'invoice_number'],
    ...filteredOrders.value.map(order => [
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

  const csv = lines.map(line => line.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const buildInvoiceText = (order: OrderRecord) => {
  const lineRows = order.lines.map(line => `${line.title} x${line.quantity} — ${currencyFormat(line.unitPrice * line.quantity)}`).join('\n')
  return [
    `Facture: ${order.invoiceNumber || 'non générée'}`,
    `Commande: ${order.id}`,
    `Client: ${order.customer}`,
    `Date facture: ${order.invoiceGeneratedAt ? new Date(order.invoiceGeneratedAt).toLocaleString('fr-FR') : 'N/A'}`,
    '',
    lineRows,
    '',
    `Total: ${currencyFormat(order.amount)}`,
    `Déjà remboursé: ${currencyFormat(order.refundedAmount)}`,
    `Net encaissé: ${currencyFormat(order.amount - order.refundedAmount)}`,
  ].join('\n')
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Shop"
      module-icon="mdi-storefront-outline"
      module-description="Pilotage complet des commandes: statuts, timeline, facture, retours, remboursements et export."
      :nav-items="shopNavItems"
      action-label="Orders Console"
    />

    <v-container fluid class="pt-0">
      <v-card rounded="xl" class="pa-5">
        <div class="d-flex justify-space-between align-center mb-4 flex-wrap ga-3">
          <div>
            <h2 class="text-h5">Shop Orders - Opérations avancées</h2>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Statuts complets (pending, paid, packed, shipped, delivered, returned, refunded), suivi logistique et financier.
            </p>
          </div>
          <div class="d-flex ga-2 flex-wrap">
            <v-btn color="secondary" variant="outlined" prepend-icon="mdi-filter-off-outline" @click="resetFilters">
              Reset filtres
            </v-btn>
            <v-btn color="primary" prepend-icon="mdi-file-delimited-outline" @click="exportCsv">
              Export CSV
            </v-btn>
          </div>
        </div>

        <v-row class="mb-2">
          <v-col cols="12" md="3">
            <v-text-field v-model="filters.search" label="Recherche commande/client" density="comfortable" hide-details />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.status"
              :items="statusCatalog"
              item-title="title"
              item-value="value"
              label="Statut"
              density="comfortable"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.channel"
              :items="channelCatalog"
              item-title="title"
              item-value="value"
              label="Canal"
              density="comfortable"
              hide-details
            />
          </v-col>
          <v-col cols="6" md="2">
            <v-text-field v-model="filters.dateFrom" label="Du" type="date" density="comfortable" hide-details />
          </v-col>
          <v-col cols="6" md="2">
            <v-text-field v-model="filters.dateTo" label="Au" type="date" density="comfortable" hide-details />
          </v-col>
          <v-col cols="6" md="1">
            <v-text-field v-model.number="filters.amountMin" label="Min €" type="number" density="comfortable" hide-details />
          </v-col>
          <v-col cols="6" md="1">
            <v-text-field v-model.number="filters.amountMax" label="Max €" type="number" density="comfortable" hide-details />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" lg="7">
            <v-data-table :headers="headers" :items="filteredOrders" item-value="id" class="rounded-lg border" density="comfortable">
              <template #item.id="{ item }">
                <v-btn variant="text" color="primary" @click="selectedOrderId = item.id">
                  {{ item.id }}
                </v-btn>
              </template>
              <template #item.channel="{ item }">
                {{ channelCatalog.find(channel => channel.value === item.channel)?.title || item.channel }}
              </template>
              <template #item.status="{ item }">
                <v-chip size="small" :color="getStatusMeta(item.status).color" variant="tonal">
                  {{ getStatusMeta(item.status).title }}
                </v-chip>
              </template>
              <template #item.amount="{ item }">
                {{ currencyFormat(item.amount) }}
              </template>
              <template #item.refundedAmount="{ item }">
                {{ currencyFormat(item.refundedAmount) }}
              </template>
              <template #item.actions="{ item }">
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn v-bind="props" icon="mdi-dots-horizontal" size="small" variant="text" />
                  </template>
                  <v-list density="compact">
                    <v-list-subheader>Mettre à jour statut</v-list-subheader>
                    <v-list-item
                      v-for="statusOption in statusCatalog.filter(item => item.value !== 'all')"
                      :key="statusOption.value"
                      :title="statusOption.title"
                      @click="updateOrderStatus(item.id, statusOption.value as OrderStatus)"
                    />
                    <v-divider class="my-1" />
                    <v-list-item title="Générer facture" prepend-icon="mdi-file-document-outline" @click="generateInvoice(item.id)" />
                  </v-list>
                </v-menu>
              </template>
            </v-data-table>
          </v-col>

          <v-col cols="12" lg="5">
            <v-card v-if="selectedOrder" variant="outlined" rounded="lg" class="pa-4">
              <div class="d-flex justify-space-between align-center mb-3">
                <div>
                  <h3 class="text-subtitle-1 mb-0">{{ selectedOrder.id }} - {{ selectedOrder.customer }}</h3>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ channelCatalog.find(channel => channel.value === selectedOrder.channel)?.title }}
                    • {{ new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR') }}
                  </p>
                </div>
                <v-chip size="small" :color="getStatusMeta(selectedOrder.status).color" variant="tonal">
                  {{ getStatusMeta(selectedOrder.status).title }}
                </v-chip>
              </div>

              <v-alert type="info" variant="tonal" class="mb-3">
                Montant total: <strong>{{ currencyFormat(selectedOrder.amount) }}</strong> •
                Remboursé: <strong>{{ currencyFormat(selectedOrder.refundedAmount) }}</strong>
              </v-alert>

              <h4 class="text-subtitle-2 mb-2">Timeline de commande</h4>
              <v-timeline side="end" density="compact" class="mb-3">
                <v-timeline-item
                  v-for="event in selectedOrder.timeline"
                  :key="event.id"
                  :dot-color="getStatusMeta(event.status).color"
                  size="small"
                >
                  <div class="text-body-2 font-weight-medium">{{ event.label }}</div>
                  <div class="text-caption text-medium-emphasis">{{ new Date(event.at).toLocaleString('fr-FR') }}</div>
                  <div v-if="event.note" class="text-caption">{{ event.note }}</div>
                </v-timeline-item>
              </v-timeline>

              <div class="d-flex align-center justify-space-between mb-2">
                <h4 class="text-subtitle-2">Facture</h4>
                <v-btn size="small" color="primary" variant="tonal" prepend-icon="mdi-file-plus-outline" @click="generateInvoice(selectedOrder.id)">
                  Générer
                </v-btn>
              </div>
              <v-textarea
                :model-value="buildInvoiceText(selectedOrder)"
                readonly
                auto-grow
                variant="outlined"
                rows="5"
                class="mb-3"
              />

              <h4 class="text-subtitle-2 mb-2">Retours et remboursements partiels</h4>
              <v-row class="mb-1">
                <v-col cols="12" md="7">
                  <v-text-field v-model="returnReason" label="Motif retour" density="comfortable" hide-details />
                </v-col>
                <v-col cols="8" md="3">
                  <v-text-field v-model.number="returnAmount" label="Montant €" type="number" density="comfortable" hide-details />
                </v-col>
                <v-col cols="4" md="2" class="d-flex align-center">
                  <v-btn block color="secondary" variant="tonal" @click="addReturnRequest(selectedOrder.id)">
                    Ajouter
                  </v-btn>
                </v-col>
              </v-row>

              <v-list density="compact" class="rounded border">
                <v-list-item
                  v-for="record in selectedOrder.returns"
                  :key="record.id"
                  :subtitle="`${new Date(record.createdAt).toLocaleString('fr-FR')} • ${currencyFormat(record.amount)}`"
                >
                  <template #title>
                    {{ record.id }} - {{ record.reason }}
                  </template>
                  <template #append>
                    <div class="d-flex align-center ga-2">
                      <v-chip size="x-small" :color="record.status === 'refunded' ? 'green' : 'amber'" variant="tonal">
                        {{ record.status }}
                      </v-chip>
                      <v-btn
                        v-if="record.status !== 'refunded'"
                        size="x-small"
                        color="primary"
                        variant="text"
                        @click="approvePartialRefund(selectedOrder.id, record.id)"
                      >
                        Rembourser
                      </v-btn>
                    </div>
                  </template>
                </v-list-item>
                <v-list-item v-if="!selectedOrder.returns.length" title="Aucun retour enregistré" />
              </v-list>
            </v-card>

            <v-card v-else variant="outlined" rounded="lg" class="pa-4">
              <p class="mb-0 text-medium-emphasis">Aucune commande ne correspond aux filtres.</p>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </div>
</template>
