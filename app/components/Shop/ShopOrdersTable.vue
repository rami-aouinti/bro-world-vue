<script setup lang="ts">
import type { ChannelOption, OrderRecord, OrderStatus, OrderStatusMeta } from './types'

defineProps<{
  headers: Array<{ title: string; key: string; sortable?: boolean }>
  items: OrderRecord[]
  selectedOrderId: string
  statusCatalog: OrderStatusMeta[]
  channelCatalog: ChannelOption[]
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [orderId: string]
  'update-status': [orderId: string, status: OrderStatus]
  'generate-invoice': [orderId: string]
}>()

const currencyFormat = (value: number) => `${value.toFixed(2)} €`

const statusMeta = (status: OrderStatus, statusCatalog: OrderStatusMeta[]) =>
  statusCatalog.find((item) => item.value === status) ?? { value: 'all', title: 'All', color: 'grey' }
</script>

<template>
  <v-skeleton-loader
    v-if="loading"
    type="table-heading, table-row-divider@6"
    class="rounded-lg border"
  />
  <v-data-table
    v-else
    :headers="headers"
    :items="items"
    item-value="id"
    class="rounded-lg border"
    density="comfortable"
  >
    <template #item.id="{ item }">
      <v-btn
        variant="text"
        color="primary"
        :class="selectedOrderId === item.id ? 'font-weight-bold' : ''"
        @click="emit('select', item.id)"
      >
        {{ item.id }}
      </v-btn>
    </template>
    <template #item.channel="{ item }">
      {{
        channelCatalog.find((channel) => channel.value === item.channel)?.title ||
        item.channel
      }}
    </template>
    <template #item.status="{ item }">
      <v-chip
        size="small"
        :color="statusMeta(item.status, statusCatalog).color"
        variant="tonal"
      >
        {{ statusMeta(item.status, statusCatalog).title }}
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
          <v-btn
            v-bind="props"
            icon="mdi-dots-horizontal"
            size="small"
            variant="text"
          />
        </template>
        <v-list density="compact">
          <v-list-subheader>Update status</v-list-subheader>
          <v-list-item
            v-for="statusOption in statusCatalog.filter((entry) => entry.value !== 'all')"
            :key="statusOption.value"
            :title="statusOption.title"
            @click="emit('update-status', item.id, statusOption.value as OrderStatus)"
          />
          <v-divider class="my-1" />
          <v-list-item
            title="Generate invoice"
            prepend-icon="mdi-file-document-outline"
            @click="emit('generate-invoice', item.id)"
          />
        </v-list>
      </v-menu>
    </template>
  </v-data-table>
</template>
