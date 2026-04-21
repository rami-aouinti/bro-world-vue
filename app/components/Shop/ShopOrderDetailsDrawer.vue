<script setup lang="ts">
import type { ChannelOption, OrderRecord, OrderStatusMeta } from './types'

const props = defineProps<{
  modelValue: boolean
  order: OrderRecord | null
  statusCatalog: OrderStatusMeta[]
  channelCatalog: ChannelOption[]
  returnReason: string
  returnAmount: number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:returnReason': [value: string]
  'update:returnAmount': [value: number | null]
  'generate-invoice': [orderId: string]
  'add-return': [orderId: string]
  'approve-refund': [orderId: string, returnId: string]
}>()

const currencyFormat = (value: number) => `${value.toFixed(2)} €`

const getStatusMeta = (status: string) =>
  props.statusCatalog.find((item) => item.value === status) || { value: 'all', title: 'Tous', color: 'grey' }

const currentOrder = computed(() => props.order)

const buildInvoiceText = (order: OrderRecord) => {
  const lineRows = order.lines
    .map((line) => `${line.title} x${line.quantity} — ${currencyFormat(line.unitPrice * line.quantity)}`)
    .join('\n')

  return [
    `Invoice: ${order.invoiceNumber || 'not generated'}`,
    `Order: ${order.id}`,
    `Client: ${order.customer}`,
    `Invoice date: ${order.invoiceGeneratedAt ? new Date(order.invoiceGeneratedAt).toLocaleString('en-US') : 'N/A'}`,
    '',
    lineRows,
    '',
    `Total: ${currencyFormat(order.amount)}`,
    `Already refunded: ${currencyFormat(order.refundedAmount)}`,
    `Net captured: ${currencyFormat(order.amount - order.refundedAmount)}`,
  ].join('\n')
}
</script>

<template>
  <v-navigation-drawer
    :model-value="modelValue"
    location="right"
    width="520"
    temporary
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="pa-4">
      <template v-if="currentOrder">
        <div class="d-flex justify-space-between align-center mb-3">
          <div>
            <h3 class="text-subtitle-1 mb-0">{{ currentOrder.id }} - {{ currentOrder.customer }}</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ channelCatalog.find((channel) => channel.value === currentOrder.channel)?.title }}
              •
              {{ new Date(currentOrder.createdAt).toLocaleDateString('fr-FR') }}
            </p>
          </div>
          <v-chip size="small" :color="getStatusMeta(currentOrder.status).color" variant="tonal">
            {{ getStatusMeta(currentOrder.status).title }}
          </v-chip>
        </div>

        <ShopCartSummary :total-amount="currentOrder.amount" :refunded-amount="currentOrder.refundedAmount" />
        <ShopPaymentStatusCard :order="currentOrder" />

        <h4 class="text-subtitle-2 mb-2">Timeline de commande</h4>
        <v-timeline side="end" density="compact" class="mb-3">
          <v-timeline-item
            v-for="event in currentOrder.timeline"
            :key="event.id"
            :dot-color="getStatusMeta(event.status).color"
            size="small"
          >
            <div class="text-body-2 font-weight-medium">{{ event.label }}</div>
            <div class="text-caption text-medium-emphasis">{{ new Date(event.at).toLocaleString('en-US') }}</div>
            <div v-if="event.note" class="text-caption">{{ event.note }}</div>
          </v-timeline-item>
        </v-timeline>

        <div class="d-flex align-center justify-space-between mb-2">
          <h4 class="text-subtitle-2">Invoice</h4>
          <v-btn
            size="small"
            color="primary"
            variant="tonal"
            prepend-icon="mdi-file-plus-outline"
            @click="emit('generate-invoice', currentOrder.id)"
          >
            Generate
          </v-btn>
        </div>
        <v-textarea
          :model-value="buildInvoiceText(currentOrder)"
          readonly
          auto-grow
          variant="outlined"
          rows="5"
          class="mb-3"
        />

        <h4 class="text-subtitle-2 mb-2">Retours et remboursements partiels</h4>
        <v-row class="mb-1">
          <v-col cols="12" md="7">
            <v-text-field
              :model-value="returnReason"
              label="Motif retour"
              density="comfortable"
              hide-details
              @update:model-value="emit('update:returnReason', $event)"
            />
          </v-col>
          <v-col cols="8" md="3">
            <v-text-field
              :model-value="returnAmount"
              label="Amount €"
              type="number"
              density="comfortable"
              hide-details
              @update:model-value="emit('update:returnAmount', $event === '' ? null : Number($event))"
            />
          </v-col>
          <v-col cols="4" md="2" class="d-flex align-center">
            <v-btn block color="secondary" variant="tonal" @click="emit('add-return', currentOrder.id)">
              Add
            </v-btn>
          </v-col>
        </v-row>

        <v-list density="compact" class="rounded border">
          <v-list-item
            v-for="record in currentOrder.returns"
            :key="record.id"
            :subtitle="`${new Date(record.createdAt).toLocaleString('en-US')} • ${currencyFormat(record.amount)}`"
          >
            <template #title>{{ record.id }} - {{ record.reason }}</template>
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
                  @click="emit('approve-refund', currentOrder.id, record.id)"
                >
                  Refund
                </v-btn>
              </div>
            </template>
          </v-list-item>
          <v-list-item v-if="!currentOrder.returns.length" title="No return recorded" />
        </v-list>
      </template>
      <v-card v-else variant="outlined" rounded="lg" class="pa-4">
        <p class="mb-0 text-medium-emphasis">No order selected.</p>
      </v-card>
    </div>
  </v-navigation-drawer>
</template>
